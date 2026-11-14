import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Providers from '@/app/providers'

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to Baton with GitHub for live repository imports, or explore a pre-configured review seat — no setup required.',
  alternates: { canonical: '/signin', languages: { 'en-US': '/signin' } },
}

/**
 * Server boundary for the /signin routes: owns the route metadata and
 * mounts the NextAuth SessionProvider only where the client actually
 * needs it (the public landing page no longer ships next-auth/react).
 */
export default function SigninLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>
}
