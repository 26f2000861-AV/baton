'use client'

import type { ReactNode } from 'react'

/**
 * The workspace route renders inside the root layout; the page itself owns
 * the session gate and the HandoverProvider (Round 3). This wrapper only
 * keeps the route boundary stable.
 */
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
