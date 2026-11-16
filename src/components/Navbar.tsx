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

        {/* Right Section: GitHub CTA */}
        <div className="flex items-center gap-3 sm:gap-5">
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

