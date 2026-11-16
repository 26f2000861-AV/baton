import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { Profile } from 'next-auth'
import { prisma } from './db'

/**
 * Baton auth — Improvement 1.
 *
 * Production: GitHub OAuth is the ONLY provider. Judges and users sign in with
 * their real GitHub identity; that identity is their seat at the handover table
 * and the token used by the GitHub repository import engine.
 *
 * Supports both AUTH_* (Auth.js modern standard) and NEXTAUTH_* / GITHUB_* variables:
 * - AUTH_GITHUB_ID or GITHUB_ID
 * - AUTH_GITHUB_SECRET or GITHUB_SECRET
 * - AUTH_SECRET or NEXTAUTH_SECRET
 *
 * Non-production local development: when GitHub credentials are not set,
 * a clearly-labeled local dev sign-in replaces the GitHub button so the full
 * authenticated flow can be built and tested before the OAuth app exists.
 * Production never enables the local provider.
 */

const githubId = process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID
const githubSecret = process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

const hasGitHubApp = Boolean(githubId && githubSecret)
const allowDevProvider = process.env.NODE_ENV !== 'production'

// Sandbox/preview resilience: a pinned fallback keeps local dev sessions stable.
// Production always sets AUTH_SECRET / NEXTAUTH_SECRET, so this fallback never applies there.
const DEV_FALLBACK_SECRET =
  process.env.NODE_ENV === 'production'
    ? undefined
    : 'baton-local-dev-secret-6b1f2e8a9c4d47f0b3a2d5e8c1f09a76'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: authSecret || DEV_FALLBACK_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: hasGitHubApp
    ? [
        GitHubProvider({
          clientId: githubId as string,
          clientSecret: githubSecret as string,
          // The import flow supports private repositories, which require the
          // repo scope in addition to the user's GitHub identity.
          authorization: { params: { scope: 'read:user repo' } },
        }),
      ]
    : allowDevProvider
      ? [
        CredentialsProvider({
          id: 'dev-local',
          name: 'Dev Local Sign-in',
          credentials: {
            login: { label: 'Dev username', type: 'text', placeholder: 'e.g. dev_lead' },
          },
          async authorize(credentials) {
            const raw = (credentials?.login ?? '').trim().toLowerCase()
            const login = /^[-_a-z0-9]{1,39}$/.test(raw) ? raw : 'dev_user'
            // Reuse (or create) a local dev user so repeat sign-ins keep state.
            const existing = await prisma.user.findUnique({ where: { githubLogin: login } })
            if (existing) return existing
            return prisma.user.create({
              data: {
                name: `Dev ${login.replace(/^dev_/, '')}`,
                githubLogin: login,
                email: `${login}@dev.local`,
              },
            })
          },
        }),
      ]
      : [],
  callbacks: {
    async jwt({ token, user, profile, account }) {
      if (user) {
        token.userId = user.id
        // GitHub sign-in: persist the GitHub username and avatar for invites and display.
        const ghProfile = profile as (Profile & { login?: string; avatar_url?: string }) | undefined
        if (ghProfile?.login) {
          token.githubLogin = ghProfile.login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              githubLogin: ghProfile.login,
              ...(ghProfile.avatar_url && !user.image ? { image: ghProfile.avatar_url } : {}),
            },
          }).catch(() => undefined)
        } else if ('githubLogin' in user && typeof user.githubLogin === 'string') {
          token.githubLogin = user.githubLogin // dev-local provider path
        }
      }

      // Keep the Account table's access_token up to date so imports work even after token renewal
      if (account && account.provider === 'github' && account.access_token && token.userId) {
        await prisma.account.updateMany({
          where: { userId: token.userId as string, provider: 'github' },
          data: {
            access_token: account.access_token,
            scope: account.scope,
          },
        }).catch(() => undefined)
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? token.sub ?? ''
        session.user.githubLogin = (token.githubLogin as string | undefined) ?? null
        if (token.picture && !session.user.image) {
          session.user.image = token.picture as string
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
}
