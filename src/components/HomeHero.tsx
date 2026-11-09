"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InkOrbitHero from '@/components/ui/ink-orbit-hero'
import BatonMark from '@/components/BatonMark'
import { ArrowRight, ShieldCheck, GitPullRequest, FileText } from 'lucide-react'

export default function HomeHero() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b0b] text-[#eeeeee]">
      {/* Brand Navigation Header */}
      <header className="sticky top-0 z-20 border-b border-[#262626] bg-[#0b0b0b]/85 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <BatonMark compact />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="font-semibold tracking-tight text-[#eeeeee]">Baton</span>
              <span className="text-[11px] font-mono text-[#8d8d8d]">Payment Core Handover Ledger</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-1.5 rounded border border-[#363636] bg-[#efefef] px-3.5 py-1.5 text-xs font-semibold text-[#121212] transition-all hover:bg-white hover:shadow-[0_0_14px_rgba(255,255,255,0.2)]"
            >
              Enter Workspace
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Viewport */}
      <div className="flex flex-1 flex-col justify-center">
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

      {/* Product Highlights Strip */}
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
