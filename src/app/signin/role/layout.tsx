import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Choose a review seat',
  robots: { index: false, follow: false },
}

/**
 * Transient role picker inside the sign-in flow — never indexed.
 */
export default function SigninRoleLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
