"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRef } from 'react'
import InkOrbitHero from '@/components/ui/ink-orbit-hero'
import BatonMark from '@/components/BatonMark'
import HeroScrollVideoReveal from '@/components/ui/hero-scroll-video-pin-reveal'
import PushpinTearFooter from '@/components/ui/pushpin-tear-footer'
import { ArrowRight, ShieldCheck, GitPullRequest, FileText } from 'lucide-react'

export default function HomeHero() {
  const router = useRouter()
  const workflowRef = useRef<HTMLElement>(null)

  const scrollToWorkflow = () => {
    const workflow = workflowRef.current
    if (!workflow) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    workflow.focus({ preventScroll: true })
    workflow.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b0b] text-[#eeeeee]">
      {/* Brand Navigation Header */}
      <header className="sticky top-0 z-20 border-b border-[#262626] bg-[#0b0b0b]/85 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-center">
          <Link href="/" aria-label="Baton Home" className="inline-flex min-h-11 min-w-11 items-center justify-center transition-transform hover:scale-105">
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
            onSecondary={scrollToWorkflow}
            proof={null}
            sculptureLabel=""
            sculptureHint=""
            hud={false}
            minHeight="clamp(480px, 60svh, 640px)"
          />
        </div>
      </HeroScrollVideoReveal>

      <section
        id="handover-workflow"
        ref={workflowRef}
        tabIndex={-1}
        aria-labelledby="handover-workflow-title"
        className="scroll-mt-20 border-t border-[#262626] bg-[#121212]/60 px-4 py-16 outline-none focus-visible:outline-2 focus-visible:outline-[#c9c9c9] sm:px-6 sm:py-20"
        style={{ minHeight: 'min(82svh, 840px)' }}
      >
        <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col justify-center">
          <div className="max-w-2xl">
            <h2 id="handover-workflow-title" className="text-balance text-2xl font-semibold tracking-tight text-[#eeeeee] sm:text-3xl">
              How Baton moves a handover forward
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#a2a2a2] sm:text-base">
              Context moves from the person doing the work to the next owner, with decisions and uncertainty left visible.
            </p>
          </div>

          <ol className="mt-10 grid grid-cols-1 border-y border-[#333333] md:mt-14 md:grid-cols-3">
            <li className="py-6 md:border-r md:border-[#333333] md:py-2 md:pr-8">
              <div className="mb-5 flex items-center gap-3 text-[#a2a2a2]">
                <FileText size={17} aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">01 · Capture</span>
              </div>
              <h3 className="text-lg font-medium text-[#eeeeee]">Record what changed</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                Add a decision, rationale, next action, and optional source reference while the work is fresh.
              </p>
            </li>

            <li className="border-t border-[#333333] py-6 md:border-r md:border-t-0 md:px-8 md:py-2">
              <div className="mb-5 flex items-center gap-3 text-[#a2a2a2]">
                <GitPullRequest size={17} aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">02 · Review</span>
              </div>
              <h3 className="text-lg font-medium text-[#eeeeee]">Resolve what conflicts</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                Compare the sample records, then record a human decision—or leave a clarification open.
              </p>
            </li>

            <li className="border-t border-[#333333] py-6 md:border-t-0 md:pl-8 md:py-2">
              <div className="mb-5 flex items-center gap-3 text-[#a2a2a2]">
                <ShieldCheck size={17} aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">03 · Handover</span>
              </div>
              <h3 className="text-lg font-medium text-[#eeeeee]">Give the next owner a route forward</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                Review decisions, open work, ownership, and risks; accept sections or ask for missing context.
              </p>
            </li>
          </ol>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-[#8d8d8d]">
              Walkthrough uses a synthetic sample case. Changes stay in this browser.
            </p>
            <Link
              href="/workspace"
              className="inline-flex min-h-11 items-center gap-2 border border-[#eeeeee] px-4 py-2 text-sm font-medium text-[#eeeeee] transition-colors hover:bg-[#eeeeee] hover:text-[#0b0b0b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9c9c9]"
            >
              Open sample workspace
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Interactive Pushpin Tear Footer */}
      <PushpinTearFooter email="adityaverma200911@gmail.com" />
    </div>
  )
}
