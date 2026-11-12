'use client'

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import BatonMark from '@/components/BatonMark'
import GitHubSignInButton from '@/components/GitHubSignInButton'

export default function Navbar() {
  const { status } = useSession()
  const signedIn = status === 'authenticated'
  const entryHref = signedIn ? '/workspace' : '/signin'
  const entryLabel = signedIn ? 'Open my workspace' : 'Sign in with GitHub'

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.07] bg-[#0b0b0b]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          aria-label="Baton Home"
          className="group/baton inline-flex items-center gap-2.5 rounded-lg py-1.5 px-2 -ml-2 transition-all duration-200 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
        >
          <BatonMark size="medium" />
          <span className="text-[16px] font-semibold tracking-[-0.025em] text-[#eeeeee] transition-colors duration-200 group-hover/baton:text-white">
            Baton
          </span>
        </Link>

        {/* Right Section: Understated Status Capsule & GitHub Pill CTA */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Understated, elegant status tag */}
          <div
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-[11.5px] font-medium text-neutral-400 select-none shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
            title="Demonstration environment using synthetic data"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
              aria-hidden="true"
            />
            <span>Synthetic data</span>
            <span className="text-neutral-600 font-light" aria-hidden="true">·</span>
            <span>no live sources</span>
          </div>

          {/* GitHub Sign-in / Workspace Pill Button */}
          <GitHubSignInButton
            href={entryHref}
            signedIn={signedIn}
            entryLabel={entryLabel}
          />
        </div>
      </div>
    </header>
  )
}

