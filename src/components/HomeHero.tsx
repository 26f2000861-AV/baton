"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRef } from 'react'
import { useSession } from 'next-auth/react'
import InkOrbitHero from '@/components/ui/ink-orbit-hero'
import Navbar from '@/components/Navbar'
import GitHubSignInButton from '@/components/GitHubSignInButton'
import HeroScrollVideoReveal from '@/components/ui/hero-scroll-video-pin-reveal'
import PushpinTearFooter from '@/components/ui/pushpin-tear-footer'
import { ArrowRight, ShieldCheck, GitPullRequest, FileText } from 'lucide-react'

export default function HomeHero() {
  const router = useRouter()
  const { status } = useSession()
  const workflowRef = useRef<HTMLElement>(null)
  const signedIn = status === 'authenticated'
  const entryHref = signedIn ? '/workspace' : '/signin'
  const entryLabel = signedIn ? 'Open my workspace' : 'Sign in with GitHub'

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
      <Navbar />

      {/* 1. Scroll Reveal with Center Artifact & Workspace Section */}
      <HeroScrollVideoReveal
        bgColor="#0b0b0b"
        topText={
          <div className="flex flex-col items-center">
            <span className="mb-4 text-xs font-mono uppercase tracking-widest text-[#a2a2a2]">
              Engineering handovers, made reviewable
            </span>
            <span>
              Keep critical work moving,
              <br />
              <span className="font-serif italic font-normal text-[#c9c9c9]">even when ownership changes.</span>
            </span>
            <span className="mt-4 max-w-2xl font-sans text-sm font-normal leading-5 tracking-normal text-[#b8b8b8] sm:text-base">
              Synthetic sample · GitHub says the VM dual-write is live; Slack shows a dashboard rollback.
            </span>
          </div>
        }
        headingText={
          <>
            A decision carries its evidence. <br />
            And its next owner.
          </>
        }
        tags={[
          { text: 'Evidence-backed claims', background: '#1c1c1c', color: '#eeeeee' },
          { text: 'Decisions & open work', background: '#242424', color: '#ffffff' },
          { text: 'Ownership transfer', background: '#20241e', color: '#d5dfca' },
          { text: 'Human-reviewed risks', background: '#222222', color: '#eeeeee' },
        ]}
        subText="Compare source excerpts, keep conflicting records visible until a lead explains the decision, then pass that context and the next action to its owner."
      >
        {/* Center: Artifact & Workspace Button Section (Between the Two Scroll Animations) */}
        <div id="handover-core" className="flex flex-1 flex-col justify-center border-t border-[#262626]">
          <InkOrbitHero
            theme="dark"
            titleTop="A practical handover for"
            titleAccent={["the work that matters"]}
            description="Review the sample PR and Slack records side by side. Keep the source, conflict, lead rationale, and next owner in one handover."
            primaryCta={entryLabel}
            onPrimary={() => router.push(entryHref)}
            secondaryCta="See how it works"
            onSecondary={scrollToWorkflow}
            proof={null}
            preview={
              <div className="grid gap-3 border border-[#3b3b3b] bg-[#111111]/95 p-4 text-left shadow-[0_12px_36px_rgba(0,0,0,0.38)] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b8b8b8]">Sample conflict</span>
                  <span className="border border-[#5b4725] bg-[#2c2010] px-2 py-1 text-[10px] font-medium text-[#fbbf24]">Needs human review</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#eeeeee]">Metrics read path</h2>
                  <p className="mt-1 text-xs leading-5 text-[#b8b8b8]">Two project records describe different states.</p>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2">
                  <div className="min-w-0 border border-[#303030] bg-[#171717] p-2.5">
                    <span className="block text-[10px] text-[#a2a2a2]">GitHub PR #155</span>
                    <strong className="mt-1 block text-xs leading-5 text-[#eeeeee]">VM dual-write live</strong>
                  </div>
                  <span className="self-center font-mono text-[10px] text-[#a2a2a2]" aria-hidden="true">vs</span>
                  <div className="min-w-0 border border-[#303030] bg-[#171717] p-2.5">
                    <span className="block text-[10px] text-[#a2a2a2]">Slack #helios-eng</span>
                    <strong className="mt-1 block text-xs leading-5 text-[#eeeeee]">Thanos reads restored</strong>
                  </div>
                </div>
                <p className="text-[11px] leading-4 text-[#a2a2a2]">Synthetic records · no connected source systems</p>
                <p className="text-[11px] leading-4 text-[#b8b8b8]">Lead records why · successor reviews the handover</p>
              </div>
            }
            sculptureLabel=""
            sculptureHint=""
            hud={false}
            minHeight="clamp(400px, 52svh, 500px)"
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
                <h3 className="text-lg font-medium text-[#eeeeee]">Record the choice and why</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                Add a decision, rationale, next action, and optional source reference while the work is fresh.
              </p>
            </li>

            <li className="border-t border-[#333333] py-6 md:border-r md:border-t-0 md:px-8 md:py-2">
              <div className="mb-5 flex items-center gap-3 text-[#a2a2a2]">
                <GitPullRequest size={17} aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">02 · Review</span>
              </div>
                <h3 className="text-lg font-medium text-[#eeeeee]">Compare conflicting sources</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                Compare the PR and chat excerpts; keep the disagreement open until a lead records why.
              </p>
            </li>

            <li className="border-t border-[#333333] py-6 md:border-t-0 md:pl-8 md:py-2">
              <div className="mb-5 flex items-center gap-3 text-[#a2a2a2]">
                <ShieldCheck size={17} aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">03 · Handover</span>
              </div>
                <h3 className="text-lg font-medium text-[#eeeeee]">Pass context to the next owner</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#a2a2a2]">
                Carry the decision, open work, owner, and remaining question into the successor’s next step.
              </p>
            </li>
          </ol>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs leading-5 text-[#8d8d8d]">
              Walkthrough uses a synthetic sample case, cloned privately for you when you sign in. Your
              workspace, history and sign-offs are saved on the server — across devices.
            </p>
            <GitHubSignInButton
              href={entryHref}
              signedIn={signedIn}
              entryLabel={entryLabel}
            />
          </div>
        </div>
      </section>

      {/* 3. Interactive Pushpin Tear Footer */}
      <PushpinTearFooter email="adityaverma200911@gmail.com" socials={[]} timeZone="" />
    </div>
  )
}
