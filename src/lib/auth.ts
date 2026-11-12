import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { Profile } from 'next-auth'
import { prisma } from './db'

/**
 * Baton auth — Improvement 1.
 *
 * Production: GitHub OAuth is the ONLY provider (team decision). Judges and
 * users sign in with their real GitHub identity; that identity is their seat
 * at the handover table and the token used by the GitHub import engine.
 *
 * Sandbox/local development: when GITHUB_ID / GITHUB_SECRET are not set, a
 * clearly-labeled local dev sign-in replaces the GitHub button so the full
 * authenticated flow can be built and tested before the OAuth app exists.
 * It is NEVER enabled when GITHUB_ID is present.
 */

const hasGitHubApp = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: hasGitHubApp
    ? [
        GitHubProvider({
          clientId: process.env.GITHUB_ID as string,
          clientSecret: process.env.GITHUB_SECRET as string,
          // read:user is the default public scope — enough for public-repo
          // imports. Private repos would require the user to grant `repo`.
          authorization: { params: { scope: 'read:user' } },
        }),
      ]
    : [
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
      ],
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.userId = user.id
        // First GitHub sign-in: persist the GitHub username for invites.
        const ghProfile = profile as (Profile & { login?: string }) | undefined
        if (ghProfile?.login) {
          token.githubLogin = ghProfile.login
          await prisma.user.update({
            where: { id: user.id },
            data: { githubLogin: ghProfile.login },
          }).catch(() => undefined) // user row may already carry the login
        } else if ('githubLogin' in user && typeof user.githubLogin === 'string') {
          token.githubLogin = user.githubLogin // dev-local provider path
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? token.sub ?? ''
        session.user.githubLogin = (token.githubLogin as string | undefined) ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
}
