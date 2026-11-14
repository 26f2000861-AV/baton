import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Providers from '@/app/providers'

export const metadata: Metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
  alternates: {},
}

/**
 * The workspace route renders inside the root layout; the page itself owns
 * the session gate and the HandoverProvider (Round 3). This wrapper mounts
 * the SessionProvider at the route boundary and keeps the route out of
 * search indexes — workspace state is private, per-seat data.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>
}
