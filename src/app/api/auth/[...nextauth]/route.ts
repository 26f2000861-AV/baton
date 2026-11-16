import NextAuth from 'next-auth'
import { authOptions, getLatestAuthError } from '@/lib/auth'
import type { NextRequest } from 'next/server'

const nextAuthHandler = NextAuth(authOptions)

export async function GET(req: NextRequest, ctx: any) {
  const res = (await nextAuthHandler(req, ctx)) as Response
  if (res && res.status === 302) {
    const loc = res.headers.get('location')
    if (loc && (loc.includes('error=OAuthCallback') || loc.includes('/api/auth/error') || loc.includes('/signin?error='))) {
      const err = getLatestAuthError()
      if (err) {
        try {
          const url = new URL(loc, req.url)
          url.searchParams.set('error_detail', err)
          const newRes = new Response(res.body, res)
          newRes.headers.set('location', url.toString())
          return newRes
        } catch {}
      }
    }
  }
  return res
}

export async function POST(req: NextRequest, ctx: any) {
  return nextAuthHandler(req, ctx)
}
