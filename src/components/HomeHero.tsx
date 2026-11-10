"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InkOrbitHero from '@/components/ui/ink-orbit-hero'
import BatonMark from '@/components/BatonMark'
import HeroScrollVideoReveal from '@/components/ui/hero-scroll-video-pin-reveal'
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

      {/* 1. Scroll Reveal Entrance */}
      <HeroScrollVideoReveal
        bgColor="#0b0b0b"
        topText={
          <div className="flex flex-col items-center">
            <span className="mb-4 text-xs font-mono uppercase tracking-widest text-[#8d8d8d]">
              Deterministic Engineering Transfer
            </span>
            <span>
              Built to transfer mission-critical code,
              <br />
              <span className="font-serif italic font-normal text-[#c9c9c9]">not tribal rumors.</span>
            </span>
          </div>
        }
        headingText={
          <>
            Inspect Every Claim. <br />
            Resolve Every Contradiction.
          </>
        }
        subText="From AWS SQS FIFO retries to legacy RabbitMQ clusters — Baton provides immutable source verification before successor sign-off."
      />

      {/* 2. Main Handover Workspace Hero Section (Section in image) */}
      <div id="handover-core" className="flex flex-1 flex-col justify-center border-t border-[#262626]">
        <InkOrbitHero
          theme="dark"
          titleTop="Accountable Handover With"
          titleAccent={[
            "Source-Backed Claims",
            "Deterministic Proofs",
            "Contradiction Resolvers",
            "Successor Sign-Offs",
          ]}
          description="Baton transforms high-stakes engineering handovers into cryptographic, source-backed claim ledgers. Resolve hidden architecture contradictions, inspect evidence drawers, and achieve verified successor sign-off."
          primaryCta="Enter Handover Workspace"
          onPrimary={() => router.push('/workspace')}
          secondaryCta="Inspect Routing Conflict"
          onSecondary={() => router.push('/workspace#conflict')}
          proof={null}
          sculptureLabel="PAYMENT-CORE-V2"
          sculptureHint="Drag to inspect topology"
          hud={true}
          minHeight="clamp(500px, 64svh, 680px)"
        />
      </div>

      {/* 3. Product Highlights Strip (Section in image) */}
      <div className="border-t border-[#262626] bg-[#121212]/60 px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/workspace#conflict"
            className="group flex items-start gap-3 rounded border border-[#262626] bg-[#121212] p-4 transition-all hover:border-[#444444] hover:bg-[#161616]"
          >
            <div className="rounded bg-[#1a1a1a] p-2 text-[#efefef] transition-colors group-hover:bg-[#222222]">
              <GitPullRequest size={16} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Contradiction Engine</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#eeeeee]">
                ADR-004 vs Live Fallback
                <span className="text-xs text-[#8d8d8d] transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </div>
              <p className="mt-1 text-xs text-[#8d8d8d] leading-relaxed">
                Flags mismatches between RabbitMQ fallback in Slack and SQS FIFO guarantees in PR #204.
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
              <div className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Evidence Drawer</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#eeeeee]">
                4-Source Deep Inspector
                <span className="text-xs text-[#8d8d8d] transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </div>
              <p className="mt-1 text-xs text-[#8d8d8d] leading-relaxed">
                Direct side-by-side inspection of GitHub diffs, Slack threads, ADRs, and leaver interview logs.
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
              <div className="text-xs font-mono uppercase tracking-wider text-[#8d8d8d]">Cryptographic Clearance</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#eeeeee]">
                Successor Sign-Off Barrier
                <span className="text-xs text-[#8d8d8d] transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </div>
              <p className="mt-1 text-xs text-[#8d8d8d] leading-relaxed">
                Generates a SHA-256 tamper-proof clearance seal once successor, lead, and SRE approve all claims.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
