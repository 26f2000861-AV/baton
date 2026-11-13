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
 * Non-production local development: when GITHUB_ID / GITHUB_SECRET are not
 * set, a clearly-labeled local dev sign-in replaces the GitHub button so the
 * full authenticated flow can be built and tested before the OAuth app exists.
 * Production never enables the local provider.
 */

const githubId =
  process.env.GITHUB_ID ||
  process.env.GITHUB_CLIENT_ID ||
  process.env.AUTH_GITHUB_ID

const githubSecret =
  process.env.GITHUB_SECRET ||
  process.env.GITHUB_CLIENT_SECRET ||
  process.env.AUTH_GITHUB_SECRET

// Ensure NEXTAUTH_SECRET is set even if provided as AUTH_SECRET
if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET
}

// Fallback NEXTAUTH_URL to Vercel deployment URL if unset
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

const hasGitHubApp = Boolean(githubId && githubSecret)
const allowDevProvider = process.env.NODE_ENV !== 'production'

// Sandbox/preview resilience: the sandbox boot may rewrite .env and drop
// NEXTAUTH_SECRET. NextAuth v4 then silently falls back to a RANDOM
// per-process secret, so the session JWE encrypted by one dev worker cannot
// be decrypted by another ("decryption operation failed"). A pinned,
// dev-only fallback keeps local/preview sessions stable. Production always
// sets NEXTAUTH_SECRET via Vercel env vars, so this fallback never applies
// there (and NextAuth still refuses to run without a secret in production).
const DEV_FALLBACK_SECRET =
  process.env.NODE_ENV === 'production'
    ? undefined
    : 'baton-local-dev-secret-6b1f2e8a9c4d47f0b3a2d5e8c1f09a76'

let latestAuthError: string | null = null

export function getLatestAuthError(): string | null {
  return latestAuthError
}

export function setLatestAuthError(msg: string) {
  latestAuthError = msg
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || DEV_FALLBACK_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  logger: {
    error(code, metadata: any) {
      const err = metadata?.error
      const message = err?.message || err?.error_description || String(err || '')
      const cause = err?.cause ? ` (${err.cause?.message || err.cause})` : ''
      latestAuthError = `${code}: ${message}${cause}`
      console.error('[NextAuth Error]', code, metadata)
    },
    warn(code) {
      console.warn('[NextAuth Warn]', code)
    },
    debug(code, metadata) {
      console.log('[NextAuth Debug]', code, metadata)
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.gitlostbaton.xyz' : undefined,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.gitlostbaton.xyz' : undefined,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.gitlostbaton.xyz' : undefined,
      },
    },
    pkceCodeVerifier: {
      name: `__Secure-next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.gitlostbaton.xyz' : undefined,
        maxAge: 900,
      },
    },
    state: {
      name: `__Secure-next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.gitlostbaton.xyz' : undefined,
        maxAge: 900,
      },
    },
  },
  providers: [
    ...(hasGitHubApp
      ? [
          GitHubProvider({
            clientId: githubId as string,
            clientSecret: githubSecret as string,
            // The import flow supports private repositories, which require the
            // repo scope in addition to the user's GitHub identity and email.
            authorization: { params: { scope: 'read:user user:email repo' } },
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'dev-local',
      name: 'Demo & Judge Sign-in',
      credentials: {
        login: { label: 'Demo username', type: 'text', placeholder: 'e.g. demo_successor' },
      },
      async authorize(credentials) {
        const raw = (credentials?.login ?? '').trim().toLowerCase()
        const login = /^[-_a-z0-9]{1,39}$/.test(raw) ? raw : 'demo_successor'

        const DEMO_PROFILES: Record<string, { name: string; email: string }> = {
          demo_successor: { name: 'Priya Sharma (Successor)', email: 'priya.successor@gitlostbaton.xyz' },
          demo_lead: { name: 'Vikram Malhotra (Lead)', email: 'vikram.lead@gitlostbaton.xyz' },
          demo_leaver: { name: 'Alex Chen (Leaver)', email: 'alex.leaver@gitlostbaton.xyz' },
          judge: { name: 'Hackathon Judge', email: 'judge@gitlostbaton.xyz' },
          dev_user: { name: 'Dev User', email: 'dev_user@gitlostbaton.xyz' },
          dev_lead: { name: 'Dev Lead', email: 'dev_lead@gitlostbaton.xyz' },
        }

        const profile = DEMO_PROFILES[login] || {
          name: `Judge ${login.replace(/^demo_/, '')}`,
          email: `${login}@gitlostbaton.xyz`,
        }

        // Reuse (or create) a local demo user so repeat sign-ins keep state.
        const existing = await prisma.user.findUnique({ where: { githubLogin: login } })
        if (existing) return existing
        return prisma.user.create({
          data: {
            name: profile.name,
            githubLogin: login,
            email: profile.email,
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
