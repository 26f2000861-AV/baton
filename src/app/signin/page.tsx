'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const err = params.get('error')
      const errDetail = params.get('error_detail')
      if (err) {
        if (errDetail) {
          setErrorMessage(`OAuth callback failed: ${errDetail}. Check that your GitHub OAuth App Authorization Callback URL matches https://www.gitlostbaton.xyz/api/auth/callback/github.`)
        } else if (err === 'Configuration') {
          setErrorMessage('Server configuration error: check NEXTAUTH_SECRET, GITHUB_ID, and GITHUB_SECRET in Vercel environment variables.')
        } else if (err === 'OAuthCallback') {
          setErrorMessage('OAuth callback failed: In your GitHub Developer Settings (github.com/settings/developers), verify that the Authorization Callback URL is EXACTLY: https://www.gitlostbaton.xyz/api/auth/callback/github (must include https://, www, and /api/auth/callback/github). Or sign in with a demo account below.')
        } else if (err === 'OAuthSignin' || err === 'OAuthCreateAccount') {
          setErrorMessage('OAuth sign-in failed. Please verify your GitHub OAuth app credentials or continue with a demo account below.')
        } else {
          setErrorMessage(`Sign-in error: ${err}`)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/workspace')
    }
  }, [status, router])

  const handleQuickDemo = (login: string) => {
    setIsSubmitting(true)
    signIn('dev-local', { callbackUrl: '/workspace?h=cmwfhxecd000wic08eyrzbv5d', login })
  }

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
      <div className="relative z-10 w-full max-w-[500px]">
        <div className="rounded-[22px] border border-[#2a2a2a] bg-[#141414] px-8 py-10 shadow-[0_16px_48px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12">
          {/* GitHub Octocat Logo */}
          <div className="mb-6 flex justify-center">
            <svg
              viewBox="0 0 98 96"
              width="44"
              height="44"
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
          <h1 className="mb-2 text-center text-[26px] font-bold tracking-tight text-white sm:text-[28px]">
            Sign in to Baton
          </h1>

          {/* Description */}
          <p className="mx-auto mb-7 max-w-[360px] text-center text-[13px] leading-[1.6] text-zinc-400">
            Sign in with GitHub for live repository imports, or explore a pre-configured seat below.
          </p>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-center text-xs leading-relaxed text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Primary Option: Continue with GitHub */}
          <button
            type="button"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => signIn('github', { callbackUrl: '/workspace' })}
            className="group relative flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#3a3a3a] bg-transparent px-5 py-3.5 text-[15px] font-semibold text-white transition-all duration-[250ms] ease-out hover:scale-[1.01] hover:border-white hover:bg-white hover:text-black hover:shadow-[0_4px_16px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] active:scale-[0.99]"
            aria-label="Continue with GitHub"
          >
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

            <ArrowRight
              size={16}
              className="absolute right-5 text-[#666] transition-all duration-[250ms] ease-out group-hover:translate-x-0.5 group-hover:text-black"
              aria-hidden="true"
            />
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#252525]" />
            <span className="select-none text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              or explore a sample seat
            </span>
            <div className="h-px flex-1 bg-[#252525]" />
          </div>

          {/* Sample Review Seats */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[12px] font-medium text-zinc-400">
                Pre-configured review seats
              </span>
              <span className="text-[11px] text-zinc-600">
                No setup required
              </span>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo('demo_successor')}
                className="group flex items-center justify-between rounded-xl border border-[#262626] bg-[#0f0f11] px-4 py-3 text-left transition-all duration-150 hover:border-zinc-700 hover:bg-[#161619] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                      Priya Sharma
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                      Successor
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Review claims, adopt open items, and complete sign-off
                  </p>
                </div>
                <ArrowRight size={14} className="flex-none text-zinc-600 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-zinc-200" />
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo('demo_lead')}
                className="group flex items-center justify-between rounded-xl border border-[#262626] bg-[#0f0f11] px-4 py-3 text-left transition-all duration-150 hover:border-zinc-700 hover:bg-[#161619] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                      Vikram Malhotra
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                      Engineering Lead
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Settle contradictions, review access visibility, and manage team
                  </p>
                </div>
                <ArrowRight size={14} className="flex-none text-zinc-600 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-zinc-200" />
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo('demo_leaver')}
                className="group flex items-center justify-between rounded-xl border border-[#262626] bg-[#0f0f11] px-4 py-3 text-left transition-all duration-150 hover:border-zinc-700 hover:bg-[#161619] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                      Alex Chen
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                      Departing Engineer
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Answer structured exit interview and attest repository context
                  </p>
                </div>
                <ArrowRight size={14} className="flex-none text-zinc-600 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-zinc-200" />
              </button>
            </div>
          </div>

          {/* Signed-in user: sign out first */}
          {session && (
            <button
              type="button"
              className="mt-4 w-full border-0 bg-transparent text-center text-xs text-zinc-400 underline underline-offset-2 transition-colors hover:text-white"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign out first
            </button>
          )}

          {/* Back to landing page */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors duration-200 hover:text-zinc-300"
            >
              <ArrowLeft size={13} />
              <span>Back to the landing page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
