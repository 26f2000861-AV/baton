import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Sign in to Baton with GitHub for live repository imports, or explore a pre-configured review seat — no setup required.',
  alternates: { canonical: '/signin', languages: { 'en-US': '/signin' } },
}

/**
 * Route metadata boundary for /signin. The root layout still mounts the
 * session providers; this wrapper only owns the route's SEO surface.
 */
export default function SigninLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
