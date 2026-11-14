'use client'

import { useEffect, useState } from 'react'
import GitHubSignInButton from '@/components/GitHubSignInButton'

/**
 * Session-aware entry CTA for the public landing page.
 *
 * The landing page stays fully static (SSG) — this island is the only
 * session-aware piece of the header. It renders the signed-out state in
 * server HTML, then upgrades the label/href after checking the session
 * endpoint. No next-auth/react bundle is shipped to the landing page.
 */
export default function EntryCta() {
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((session) => {
        if (!cancelled && session && session.user) setSignedIn(true)
      })
      .catch(() => {
        /* offline or transient error: keep the signed-out CTA */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <GitHubSignInButton
      href={signedIn ? '/workspace' : '/signin'}
      signedIn={signedIn}
      entryLabel={signedIn ? 'Open my workspace' : 'Sign in with GitHub'}
    />
  )
}
