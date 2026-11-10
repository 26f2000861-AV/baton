"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InkOrbitHero from '@/components/ui/ink-orbit-hero'
import BatonMark from '@/components/BatonMark'
import HeroScrollVideoReveal from '@/components/ui/hero-scroll-video-pin-reveal'
import PushpinTearFooter from '@/components/ui/pushpin-tear-footer'
import { ShieldCheck, GitPullRequest, FileText } from 'lucide-react'

export default function HomeHero() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b0b] text-[#eeeeee]">
      {/* Brand Navigation Header */}
      <header className="sticky top-0 z-20 border-b border-[#262626] bg-[#0b0b0b]/85 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-center">
          <Link href="/" aria-label="Baton Home" className="transition-transform hover:scale-105">
            <BatonMark size="medium" />
          </Link>
        </div>
      </header>

      {/* 1. Scroll Reveal with Center Artifact & Workspace Section */}
      <HeroScrollVideoReveal
        bgColor="#0b0b0b"
        topText={
          <div className="flex flex-col items-center">
            <span className="mb-4 text-xs font-mono uppercase tracking-widest text-[#8d8d8d]">
              Engineering handovers, made reviewable
            </span>
            <span>
              Keep critical work moving,
              <br />
              <span className="font-serif italic font-normal text-[#c9c9c9]">even when ownership changes.</span>
            </span>
          </div>
        }
        headingText={
          <>
            Keep the context. <br />
            Make the next step clear.
          </>
        }
        tags={[
          { text: 'Evidence-backed claims', background: '#1c1c1c', color: '#eeeeee' },
          { text: 'Decisions & open work', background: '#242424', color: '#ffffff' },
          { text: 'Ownership transfer', background: '#20241e', color: '#d5dfca' },
          { text: 'Human-reviewed risks', background: '#222222', color: '#eeeeee' },
        ]}
        subText="Bring decisions, unfinished work, ownership, and risk into one handover. Show what the evidence supports, what conflicts, and what the next owner still needs to check."
      >
        {/* Center: Artifact & Workspace Button Section (Between the Two Scroll Animations) */}
        <div id="handover-core" className="flex flex-1 flex-col justify-center border-t border-[#262626]">
          <InkOrbitHero
            theme="dark"
            titleTop="A practical handover for"
            titleAccent={["the work that matters"]}
            description="Keep decisions, open work, owners, and risks connected to their evidence. Give the next person a clear place to review, question, and take responsibility."
            primaryCta="Open sample workspace"
            onPrimary={() => router.push('/workspace')}
            secondaryCta="See how it works"
            onSecondary={() => document.getElementById('handover-workflow')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
            proof={null}
            sculptureLabel=""
            sculptureHint=""
            hud={false}
            minHeight="clamp(480px, 60svh, 640px)"
          />
        </div>
      </HeroScrollVideoReveal>

      {/* 3. Product Highlights Strip (Section in image) */}
      <div id="handover-workflow" className="border-t border-[#262626] bg-[#121212]/60 px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/workspace#conflict"
            className="group flex items-start gap-3 rounded border border-[#262626] bg-[#121212] p-4 transition-all hover:border-[#444444] hover:bg-[#161616]"
          >
            <div className="rounded bg-[#1a1a1a] p-2 text-[#efefef] transition-colors group-hover:bg-[#222222]">
              <GitPullRequest size={16} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Evidence trail</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#eeeeee]">
                See what supports a claim
                <span className="text-xs text-[#8d8d8d] transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </div>
              <p className="mt-1 text-xs text-[#8d8d8d] leading-relaxed">
                Open the source excerpt behind a claim and distinguish quoted evidence from inference.
              </p>
            </div>
          </Link>

          <Link
            href="/workspace#source"
            className="group flex items-start gap-3 rounded border border-[#262626] bg-[#121212] p-4 transition-all hover:border-[#444444] hover:bg-[#161616]"
          >
            <div className="rounded bg-[#1a1a1a] p-2 text-[#efefef] transition-colors group-hover:bg-[#222222]">
              <FileText size={16} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Decisions and risks</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#eeeeee]">
                Keep disagreements visible
                <span className="text-xs text-[#8d8d8d] transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </div>
              <p className="mt-1 text-xs text-[#8d8d8d] leading-relaxed">
                Compare conflicting records and leave the final call to a person who can explain it.
              </p>
            </div>
          </Link>

          <Link
            href="/workspace#signoff"
            className="group flex items-start gap-3 rounded border border-[#262626] bg-[#121212] p-4 transition-all hover:border-[#444444] hover:bg-[#161616]"
          >
            <div className="rounded bg-[#1a1a1a] p-2 text-[#efefef] transition-colors group-hover:bg-[#222222]">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Ownership transfer</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#eeeeee]">
                Give the next owner a route forward
                <span className="text-xs text-[#8d8d8d] transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </div>
              <p className="mt-1 text-xs text-[#8d8d8d] leading-relaxed">
                Track open work, identify who can help, and let the successor review each handover section.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Interactive Pushpin Tear Footer */}
      <PushpinTearFooter email="adityaverma200911@gmail.com" />
    </div>
  )
}
