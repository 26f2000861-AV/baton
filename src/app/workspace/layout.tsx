import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Workspace',
  robots: { index: false, follow: false },
  alternates: {},
}

/**
 * The workspace route renders inside the root layout; the page itself owns
 * the session gate and the HandoverProvider (Round 3). This wrapper keeps
 * the route boundary stable and keeps private, per-seat workspace state out
 * of search indexes.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
