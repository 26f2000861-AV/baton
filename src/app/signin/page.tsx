'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Github } from 'lucide-react'
import BatonMark from '@/components/BatonMark'

/**
 * Sign-in — Improvement 1 entry point.
 * Production: GitHub OAuth only. Local dev (no GITHUB_ID configured on the
 * server): a clearly-labeled dev sign-in replaces the GitHub button so the
 * authenticated flow can be exercised before the OAuth app exists.
 */
export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [devMode, setDevMode] = useState(false)
  const [devLogin, setDevLogin] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/workspace')
    }
  }, [status, router])

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((response) => response.json())
      .then((providers: Record<string, unknown>) => {
        setDevMode(!('github' in providers))
      })
      .catch(() => setDevMode(false))
  }, [])

  return (
    <div className="framed-app" ref={containerRef}>
      <main className="signin-screen">
        <div className="signin-card">
          <div className="signin-head">
            <BatonMark />
            <div>
              <h1>Sign in to Baton</h1>
              <p>
                Baton verifies engineering evidence where it lives. Your GitHub identity is your seat at
                the handover table — one click, no passwords stored.
              </p>
            </div>
          </div>

          {devMode ? (
            <form
              className="signin-dev-form"
              onSubmit={(event) => {
                event.preventDefault()
                signIn('dev-local', { callbackUrl: '/workspace', login: devLogin || 'dev_user' })
              }}
            >
              <label htmlFor="dev-login">Local development sign-in</label>
              <p className="signin-dev-note">
                GitHub OAuth is not configured on this server yet, so a local dev identity is offered
                instead. This is never shown when the GitHub app is configured.
              </p>
              <div className="signin-dev-row">
                <input
                  id="dev-login"
                  value={devLogin}
                  onChange={(event) => setDevLogin(event.target.value)}
                  placeholder="e.g. dev_lead"
                  maxLength={39}
                  autoComplete="off"
                />
                <button type="submit" className="primary-action">Continue</button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="signin-github-button"
              onClick={() => signIn('github', { callbackUrl: '/workspace' })}
            >
              <Github size={18} aria-hidden="true" />
              Continue with GitHub
            </button>
          )}

          <ul className="signin-points">
            <li>Pick your starting point after sign-in — sample handover problems or a real repository</li>
            <li>Your role is assigned on the server — no preview switching</li>
            <li>GitHub imports are read-only, using your consented connection</li>
          </ul>

          {session && (
            <button type="button" className="signin-signout" onClick={() => signOut({ callbackUrl: '/' })}>
              Sign out first
            </button>
          )}
          <a className="signin-back" href="/">← Back to the landing page</a>
        </div>
      </main>
    </div>
  )
}
