'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Github, ArrowRight, LayoutDashboard } from 'lucide-react'

interface GitHubSignInButtonProps {
  href: string
  signedIn?: boolean
  entryLabel?: string
  className?: string
}

export default function GitHubSignInButton({
  href,
  signedIn = false,
  entryLabel = 'Sign in with GitHub',
  className = '',
}: GitHubSignInButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className={`relative inline-flex items-center justify-center group/pill ${className}`}>
      {/* 1. Restrained Ambient Halo Glow behind the button */}
      <div
        className="google-pill-glow"
        aria-hidden="true"
      />

      {/* 2. Google-style rotating border light beam container (1px ring effect) */}
      <div className="relative rounded-full p-[1px] overflow-hidden transition-all duration-300">
        {/* Animated rotating warm orange conic beam */}
        <div
          className="google-light-beam"
          aria-hidden="true"
        />

        {/* 3. The Charcoal Pill Button */}
        <Link
          href={href}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex items-center gap-2.5 rounded-full bg-[#131316] hover:bg-[#18181c] px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-[#f4f4f5] border border-white/[0.08] hover:border-orange-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out group-hover/pill:-translate-y-0.5 group-active/pill:translate-y-0 group-active/pill:scale-[0.98] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b] motion-reduce:group-hover/pill:translate-y-0 motion-reduce:transition-none"
          aria-label={signedIn ? 'Open your Baton workspace' : 'Sign in to Baton with GitHub'}
        >
          {/* Subtle cursor-following warm spotlight */}
          <div
            className={`pointer-events-none absolute inset-0 bg-[radial-gradient(90px_circle_at_50%_50%,rgba(249,115,22,0.16),transparent_70%)] transition-opacity duration-300 motion-reduce:hidden ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />

          {/* Smooth warm surface sheen sweep */}
          <div
            className="google-sheen-sweep"
            aria-hidden="true"
          />

          {/* Subtle top specular border line for modern glass feel */}
          <div
            className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
            aria-hidden="true"
          />

          {/* GitHub / Workspace Icon */}
          <span className="relative z-10 flex items-center justify-center text-zinc-300 transition-colors duration-200 group-hover/pill:text-white">
            {signedIn ? (
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Github className="w-4 h-4" aria-hidden="true" />
            )}
          </span>

          {/* Label */}
          <span className="relative z-10 tracking-tight transition-colors duration-200 group-hover/pill:text-white">
            <span className="sm:hidden">{signedIn ? 'Workspace' : 'Sign in'}</span>
            <span className="hidden sm:inline">{entryLabel}</span>
          </span>

          {/* Arrow with smooth hover slide */}
          <ArrowRight
            className="relative z-10 w-3.5 h-3.5 text-zinc-400 transition-all duration-200 group-hover/pill:text-orange-300 group-hover/pill:translate-x-0.5 motion-reduce:group-hover/pill:translate-x-0"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  )
}

