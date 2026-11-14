import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { Profile } from 'next-auth'
import { prisma } from './db'
import { encryptToken } from './crypto'

/**
 * Baton auth — Improvement 1.
 *
 * Production: GitHub OAuth is the identity provider. The demo credentials
 * provider (dev-local) stays available in every environment for judge
 * evaluation, but is hardened: it accepts only fixed, whitelisted demo
 * logins and resolves accounts by the reserved @gitlostbaton.xyz e-mail
 * namespace — it can never match, create, or impersonate a real account.
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

const basePrismaAdapter = PrismaAdapter(prisma)
const securePrismaAdapter = {
  ...basePrismaAdapter,
  async linkAccount(account: any) {
    const secureAccount = {
      ...account,
      access_token: account.access_token ? encryptToken(account.access_token) : account.access_token,
      refresh_token: account.refresh_token ? encryptToken(account.refresh_token) : account.refresh_token,
    }
    return basePrismaAdapter.linkAccount(secureAccount)
  },
}

export const authOptions: NextAuthOptions = {
  adapter: securePrismaAdapter as any,
  // Verbose OAuth logging is a dev aid; never enable it in production logs.
  debug: process.env.NODE_ENV !== 'production',
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
            issuer: 'https://github.com/login/oauth',
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
      /**
       * Security model (hardened for Round 3):
       * 1. Only the fixed demo logins below are accepted — anything else
       *    returns null and NextAuth rejects the sign-in.
       * 2. Demo accounts are resolved by their reserved
       *    @gitlostbaton.xyz e-mail address, NEVER by githubLogin, so this
       *    provider can only ever return rows it created itself. A real
       *    GitHub user (however their account was created) can never be
       *    matched or impersonated through this form.
       */
      async authorize(credentials) {
        const raw = (credentials?.login ?? '').trim().toLowerCase()

        const DEMO_PROFILES: Record<string, { name: string; email: string }> = {
          demo_successor: { name: 'Priya Sharma (Successor)', email: 'priya.successor@gitlostbaton.xyz' },
          demo_lead: { name: 'Vikram Malhotra (Lead)', email: 'vikram.lead@gitlostbaton.xyz' },
          demo_leaver: { name: 'Alex Chen (Leaver)', email: 'alex.leaver@gitlostbaton.xyz' },
          judge: { name: 'Hackathon Judge', email: 'judge@gitlostbaton.xyz' },
          dev_user: { name: 'Dev User', email: 'dev_user@gitlostbaton.xyz' },
          dev_lead: { name: 'Dev Lead', email: 'dev_lead@gitlostbaton.xyz' },
        }

        const profile = DEMO_PROFILES[raw]
        if (!profile) {
          // Unknown login: reject. No arbitrary account creation, no
          // user lookup by username — the pre-hardening behavior allowed
          // signing in as any existing user by typing their GitHub login.
          return null
        }

        // Reuse (or create) the demo-owned user so repeat sign-ins keep state.
        const existing = await prisma.user.findUnique({ where: { email: profile.email } })
        if (existing) return existing
        return prisma.user.create({
          data: {
            name: profile.name,
            githubLogin: raw,
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
