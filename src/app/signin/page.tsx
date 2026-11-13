'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [devMode, setDevMode] = useState(false)
  const [githubConfigured, setGithubConfigured] = useState(false)
  const [devLogin, setDevLogin] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/workspace')
    }
  }, [status, router])

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((response) => response.json())
      .then((providers: Record<string, unknown>) => {
        const configured = 'github' in providers
        setGithubConfigured(configured)
        setDevMode(!configured && 'dev-local' in providers)
      })
      .catch(() => setDevMode(false))
  }, [])

  return (
    <div className="relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden bg-[#0a0a0a] px-5 py-8">
      {/* Subtle diagonal stripe background pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)',
        }}
        aria-hidden="true"
      />

      {/* Sign-in Card */}
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="rounded-[22px] border border-[#2a2a2a] bg-[#141414] px-8 py-10 shadow-[0_16px_48px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12">
          {/* GitHub Octocat Logo */}
          <div className="mb-8 flex justify-center">
            <svg
              viewBox="0 0 98 96"
              width="48"
              height="48"
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              aria-label="GitHub"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="mb-3 text-center text-[26px] font-bold tracking-tight text-white sm:text-[28px]">
            Sign in to GitHub
          </h1>

          {/* Description */}
          <p className="mx-auto mb-9 max-w-[340px] text-center text-[13.5px] leading-[1.65] text-[#8b8b8b]">
            GitHub verifies your identity and helps you access your repositories, issues, and more.
          </p>

          {/* Auth section */}
          {devMode ? (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                signIn('dev-local', { callbackUrl: '/workspace', login: devLogin || 'dev_user' })
              }}
            >
              <label htmlFor="dev-login" className="text-xs font-semibold text-[#e0e0e0]">
                Local development sign-in
              </label>
              <p className="m-0 text-[11px] leading-relaxed text-[#6b6b6b]">
                GitHub OAuth is not configured on this server yet, so a local dev identity is offered
                instead. This is never shown when the GitHub app is configured.
              </p>
              <div className="flex gap-2">
                <input
                  id="dev-login"
                  value={devLogin}
                  onChange={(event) => setDevLogin(event.target.value)}
                  placeholder="e.g. dev_lead"
                  maxLength={39}
                  autoComplete="off"
                  className="min-h-[44px] flex-1 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-3 text-sm text-white placeholder:text-[#555] focus:border-[#555] focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl bg-white px-5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : githubConfigured ? (
            <button
              type="button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => signIn('github', { callbackUrl: '/workspace' })}
              className="group relative flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#3a3a3a] bg-transparent px-5 py-3.5 text-[15px] font-semibold text-white transition-all duration-[250ms] ease-out hover:scale-[1.01] hover:border-white hover:bg-white hover:text-black hover:shadow-[0_4px_16px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] active:scale-[0.99]"
              aria-label="Continue with GitHub"
            >
              {/* GitHub icon — transitions to black on hover */}
              <svg
                viewBox="0 0 98 96"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-[fill] duration-[250ms]"
                style={{ fill: isHovered ? '#000' : '#fff' }}
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                />
              </svg>

              <span>Continue with GitHub</span>

              {/* Arrow — slides right on hover */}
              <ArrowRight
                size={16}
                className="absolute right-5 text-[#666] transition-all duration-[250ms] ease-out group-hover:translate-x-0.5 group-hover:text-black"
                aria-hidden="true"
              />
            </button>
          ) : (
            <p className="m-0 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-4 text-center text-[12px] leading-relaxed text-[#6b6b6b]">
              GitHub sign-in is not configured on this server. Ask the administrator to add the
              GitHub OAuth application credentials.
            </p>
          )}

          {/* Signed-in user: sign out first */}
          {session && (
            <button
              type="button"
              className="mt-4 w-full border-0 bg-transparent text-center text-xs text-[#6b6b6b] underline underline-offset-2 transition-colors hover:text-white"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign out first
            </button>
          )}

          {/* Divider with "or" */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#2a2a2a]" />
            <span className="select-none text-[12px] font-medium text-[#4a4a4a]">or</span>
            <div className="h-px flex-1 bg-[#2a2a2a]" />
          </div>

          {/* Back to landing page */}
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 text-[13px] text-[#6b6b6b] transition-colors duration-200 hover:text-[#cccccc]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>Back to the landing page</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
