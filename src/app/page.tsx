'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  GitCommit,
  GitPullRequest,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  ShieldAlert,
  RotateCcw,
  ExternalLink,
  Filter,
} from 'lucide-react'
import Header from '../components/Header'
import PillarDecisions from '../components/PillarDecisions'
import PillarUnfinished from '../components/PillarUnfinished'
import PillarOwnership from '../components/PillarOwnership'
import PillarRisks from '../components/PillarRisks'
import SuccessorSignoffBar from '../components/SuccessorSignoffBar'
import SourceInspectorDrawer from '../components/SourceInspectorDrawer'
import ContradictionModal from '../components/ContradictionModal'
import LeaverInterviewModal from '../components/LeaverInterviewModal'
import ExposureDiffModal from '../components/ExposureDiffModal'
import { useHandover } from '../lib/store'
import { ClaimStatus } from '../lib/types'

export default function Home() {
  const {
    activePersona,
    claims,
    visibleClaims,
    withheldCount,
    withheldDetails,
    decisions,
    unfinished,
    ownership,
    contradictions,
    questions,
    queries,
    sectionStates,
    answerInterviewQuestion,
    resolveContradiction,
    adoptUnfinishedItem,
    acceptSection,
    submitSuccessorQuery,
    resetDemoData,
  } = useHandover()

  const [inspectingClaimId, setInspectingClaimId] = useState<string | null>(null)
  const [activeContradictionId, setActiveContradictionId] = useState<string | null>(null)
  const [showInterview, setShowInterview] = useState<boolean>(false)
  const [showExposure, setShowExposure] = useState<boolean>(false)
  const [activeNavTab, setActiveNavTab] = useState<string>('overview')
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>('all')

  const inspectingClaim = claims.find((c) => c.id === inspectingClaimId)
  const activeContradiction = contradictions.find((c) => c.id === activeContradictionId)

  // Derived counts from visible rows
  const initialVisibleClaimsCount = visibleClaims.length
  const verifiedCount = visibleClaims.filter((c) => c.status === 'quoted_verified').length
  const inferredCount = visibleClaims.filter((c) => c.status === 'inferred_ai').length
  const conflictCount = visibleClaims.filter((c) => c.status === 'conflicting').length
  const statedCount = visibleClaims.filter((c) => c.status === 'stated_by_leaver').length
  const unverifiedCount = visibleClaims.filter((c) => c.status === 'quoted_unverified').length

  const openContradictionsCount = contradictions.filter(
    (c) => c.status === 'open_unresolved'
  ).length
  const acceptedSectionsCount = Object.values(sectionStates).filter((s) => s.isAccepted).length

  // Filtered claims for ledger
  const filteredClaims = visibleClaims.filter((c) => {
    if (claimStatusFilter === 'all') return true
    if (claimStatusFilter === 'verified') return c.status === 'quoted_verified'
    if (claimStatusFilter === 'inferred') return c.status === 'inferred_ai'
    if (claimStatusFilter === 'conflict') return c.status === 'conflicting'
    if (claimStatusFilter === 'stated') return c.status === 'stated_by_leaver'
    return true
  })

  const scrollTo = (id: string) => {
    setActiveNavTab(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app-shell">
      {/* 55px Fixed Icon Rail for Desktop */}
      <nav
        className="icon-rail"
        aria-label="Handover Navigation Rail"
      >
        {/* Baton Monogram Outline Mark */}
        <div
          className="baton-mark"
          title="Baton Accountable Engineering Handover"
          aria-label="Baton Monogram"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 2.5h5a3.5 3.5 0 0 1 0 7H4V2.5z" />
            <path d="M4 9.5h5.5a3.5 3.5 0 0 1 0 7H4V9.5z" />
          </svg>
        </div>

        {/* Navigation Actions */}
        <button
          onClick={() => scrollTo('overview')}
          className={`min-hit flex h-11 w-11 items-center justify-center rounded-[6px] transition ${
            activeNavTab === 'overview'
              ? 'bg-[#EEEEEE] text-[#0A0A0A]'
              : 'text-[#6B6B6B] hover:bg-[#EEEEEE] hover:text-[#0A0A0A]'
          }`}
          title="Overview & Claim Ledger"
          aria-label="Overview & Claim Ledger"
        >
          <LayoutDashboard size={18} />
        </button>

        <button
          onClick={() => scrollTo('decisions')}
          className={`min-hit flex h-11 w-11 items-center justify-center rounded-[6px] transition ${
            activeNavTab === 'decisions'
              ? 'bg-[#EEEEEE] text-[#0A0A0A]'
              : 'text-[#6B6B6B] hover:bg-[#EEEEEE] hover:text-[#0A0A0A]'
          }`}
          title="Architecture Decisions"
          aria-label="Architecture Decisions"
        >
          <GitCommit size={18} />
        </button>

        <button
          onClick={() => scrollTo('unfinished')}
          className={`min-hit flex h-11 w-11 items-center justify-center rounded-[6px] transition ${
            activeNavTab === 'unfinished'
              ? 'bg-[#EEEEEE] text-[#0A0A0A]'
              : 'text-[#6B6B6B] hover:bg-[#EEEEEE] hover:text-[#0A0A0A]'
          }`}
          title="Unfinished Work Roadmap"
          aria-label="Unfinished Work Roadmap"
        >
          <GitPullRequest size={18} />
        </button>

        <button
          onClick={() => scrollTo('ownership')}
          className={`min-hit flex h-11 w-11 items-center justify-center rounded-[6px] transition ${
            activeNavTab === 'ownership'
              ? 'bg-[#EEEEEE] text-[#0A0A0A]'
              : 'text-[#6B6B6B] hover:bg-[#EEEEEE] hover:text-[#0A0A0A]'
          }`}
          title="Ownership Matrix & Credentials"
          aria-label="Ownership Matrix & Credentials"
        >
          <ShieldCheck size={18} />
        </button>

        <button
          onClick={() => scrollTo('risks')}
          className={`min-hit flex h-11 w-11 items-center justify-center rounded-[6px] transition ${
            activeNavTab === 'risks'
              ? 'bg-[#EEEEEE] text-[#0A0A0A]'
              : 'text-[#6B6B6B] hover:bg-[#EEEEEE] hover:text-[#0A0A0A]'
          }`}
          title="Risk & Contradiction Queue"
          aria-label="Risk & Contradiction Queue"
        >
          <AlertTriangle size={18} />
        </button>

        <button
          onClick={() => scrollTo('signoff')}
          className={`min-hit flex h-11 w-11 items-center justify-center rounded-[6px] transition ${
            activeNavTab === 'signoff'
              ? 'bg-[#EEEEEE] text-[#0A0A0A]'
              : 'text-[#6B6B6B] hover:bg-[#EEEEEE] hover:text-[#0A0A0A]'
          }`}
          title="Successor Sign-off"
          aria-label="Successor Sign-off"
        >
          <CheckSquare size={18} />
        </button>

        {/* Utilities at rail bottom */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            onClick={() => setShowInterview(true)}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] text-[#6B6B6B] transition hover:bg-[#EEEEEE] hover:text-[#0A0A0A]"
            title="Open Leaver Focus Interview"
            aria-label="Leaver Interview"
          >
            <MessageSquare size={17} />
          </button>
          <button
            onClick={() => setShowExposure(true)}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] text-[#6B6B6B] transition hover:bg-[#EEEEEE] hover:text-[#0A0A0A]"
            title="Open Clearance Exposure Diff"
            aria-label="Clearance Exposure Diff"
          >
            <ShieldAlert size={17} />
          </button>
          <button
            onClick={resetDemoData}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] text-[#6B6B6B] transition hover:bg-[#EEEEEE] hover:text-[#0A0A0A]"
            title="Reset Demo Data"
            aria-label="Reset Demo Data"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </nav>

      {/* Main Canvas Area */}
      <div className="canvas-area">
        {/* Top Header */}
        <Header
          onInterview={() => setShowInterview(true)}
          onExposure={() => setShowExposure(true)}
        />

        <main id="overview" className="mt-6 space-y-8">
          {/* Exactly ONE Visible H1 per active view */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Accountable Engineering Handover Ledger
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0A0A0A] sm:text-3xl">
              FinTrack / Payment Core Handover Ledger
            </h1>
            <p className="mt-1.5 text-xs text-[#6B6B6B]">
              Departing engineer: <strong className="text-[#0A0A0A]">Alex Chen</strong> (Staff Platform Engineer) • Successor: <strong className="text-[#0A0A0A]">Priya Sharma</strong> (Senior Backend Engineer) • Departure access transfer deadline: <strong className="text-[#0A0A0A]">Nov 11, 2026</strong>.
            </p>
            <p className="mt-1 font-mono text-[11px] text-[#767676]">
              Sample data: Handover metrics and records reflect FinTrack synthetic case data. Client-side deterministic ledger.
            </p>
          </div>

          {/* Key Operational Metrics Strip (Computed dynamically from visible rows) */}
          <div className="kpi-strip" aria-label="Handover Summary KPIs">
            <div className="kpi-item">
              <span className="kpi-label">Visible claims</span>
              <div className="kpi-num">{initialVisibleClaimsCount}</div>
              <p className="kpi-sub">{verifiedCount} verified in source</p>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Open conflict</span>
              <div className="kpi-num">{openContradictionsCount}</div>
              <p className="kpi-sub">SQS vs RabbitMQ</p>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Unfinished work</span>
              <div className="kpi-num">{unfinished.length}</div>
              <p className="kpi-sub">P0 PR #214 pending</p>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Ownership assets</span>
              <div className="kpi-num">{ownership.length}</div>
              <p className="kpi-sub">Nov 10/11 transfer dates</p>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Sections accepted</span>
              <div className="kpi-num">{acceptedSectionsCount}/4</div>
              <p className="kpi-sub">{4 - acceptedSectionsCount} pending sign-off</p>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Shielded claims</span>
              <div className="kpi-num">{withheldCount}</div>
              <p className="kpi-sub">Restricted clearance</p>
            </div>
          </div>

          {/* Claim Evidence Ledger Section with Baton Pass Line */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E6E6] pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                  Evidence Ledger
                </span>
                <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-[#0A0A0A]">
                  Source-backed claims & provenance
                </h2>
              </div>

              {/* Monochrome Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Claim status filter">
                {[
                  { key: 'all', label: `All (${visibleClaims.length})` },
                  { key: 'verified', label: `Verified (${verifiedCount})` },
                  { key: 'inferred', label: `Inferred (${inferredCount})` },
                  { key: 'conflict', label: `Conflict (${conflictCount})` },
                  { key: 'stated', label: `Stated (${statedCount})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setClaimStatusFilter(tab.key)}
                    role="tab"
                    aria-selected={claimStatusFilter === tab.key}
                    className={`min-hit rounded-[6px] border px-3 py-1.5 text-xs font-medium transition ${
                      claimStatusFilter === tab.key
                        ? 'border-[#0A0A0A] bg-[#EEEEEE] font-semibold text-[#0A0A0A]'
                        : 'border-[#E6E6E6] bg-white text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Claims Table / List with Baton Pass Line */}
            <div className="space-y-2.5">
              {filteredClaims.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-[#D4D4D4] bg-white p-8 text-center text-xs text-[#6B6B6B]">
                  No claims found matching the active filter.
                </div>
              ) : (
                filteredClaims.map((claim) => {
                  const source = claim.sourceQuotes[0]
                  const isVerified = claim.status === 'quoted_verified'
                  const isConflicting = claim.status === 'conflicting'
                  const isInferred = claim.status === 'inferred_ai'
                  const isStated = claim.status === 'stated_by_leaver'
                  const isUnverified = claim.status === 'quoted_unverified'

                  let statusText = 'Pending'
                  if (isVerified) statusText = 'Verified'
                  else if (isConflicting) statusText = 'Conflict'
                  else if (isInferred) statusText = 'Inferred'
                  else if (isStated) statusText = 'Stated'
                  else if (isUnverified) statusText = 'Unverified'

                  return (
                    <article
                      key={claim.id}
                      onClick={() => setInspectingClaimId(claim.id)}
                      className="ledger-panel group cursor-pointer transition hover:border-[#0A0A0A]"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        {/* Left: Claim & monochrome status */}
                        <div className="flex flex-1 items-start gap-3">
                          <span className="monochrome-pill mt-0.5">
                            {statusText}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs font-medium leading-relaxed text-[#0A0A0A]">
                              {claim.statement}
                            </p>
                          </div>
                        </div>

                        {/* Signature Baton Pass Line */}
                        <div className="flex items-center gap-3 sm:w-72">
                          <div className="pass-rule hidden sm:block" />
                          <div className="flex items-center gap-2">
                            {isVerified && (
                              <span className="font-mono text-[11px] font-semibold text-[#1D5FBF]">
                                [VERIFIED]
                              </span>
                            )}
                            <span className="evidence-key font-mono text-[11px]">
                              {source?.sourceId || 'no_key'}
                            </span>
                            <ExternalLink size={12} className="text-[#6B6B6B] opacity-0 transition group-hover:opacity-100" />
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>

          {/* Pillar 1: Decisions */}
          <PillarDecisions
            decisions={decisions}
            isAccepted={sectionStates.decisions?.isAccepted || false}
            onInspect={(id) => setInspectingClaimId(id)}
            onAccept={() => acceptSection('decisions')}
          />

          {/* Pillar 2: Unfinished Work */}
          <PillarUnfinished
            items={unfinished}
            isAccepted={sectionStates.unfinished?.isAccepted || false}
            onAdopt={(id) => adoptUnfinishedItem(id)}
            onInspect={(id) => setInspectingClaimId(id)}
            onAccept={() => acceptSection('unfinished')}
          />

          {/* Pillar 3: Ownership */}
          <PillarOwnership
            assets={ownership}
            isAccepted={sectionStates.ownership?.isAccepted || false}
            onInspect={(id) => setInspectingClaimId(id)}
            onAccept={() => acceptSection('ownership')}
          />

          {/* Pillar 4: Risks and Contradiction Resolution */}
          <PillarRisks
            contradictions={contradictions}
            isAccepted={sectionStates.risks?.isAccepted || false}
            onContradiction={(id) => setActiveContradictionId(id)}
            onInspect={(id) => setInspectingClaimId(id)}
            onAccept={() => acceptSection('risks')}
          />

          {/* Successor Sign-off & Inline Query Console */}
          <SuccessorSignoffBar
            states={sectionStates}
            queryCount={queries.length}
            onAccept={(id) => acceptSection(id)}
            onQuery={(text) => submitSuccessorQuery('claim_01', 'unclear_rationale', text)}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
        <button
          onClick={() => scrollTo('overview')}
          className={activeNavTab === 'overview' ? 'active' : ''}
          aria-label="Overview"
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => scrollTo('decisions')}
          className={activeNavTab === 'decisions' ? 'active' : ''}
          aria-label="Decisions"
        >
          <GitCommit size={18} />
          <span>Decisions</span>
        </button>
        <button
          onClick={() => scrollTo('unfinished')}
          className={activeNavTab === 'unfinished' ? 'active' : ''}
          aria-label="Unfinished"
        >
          <GitPullRequest size={18} />
          <span>Unfinished</span>
        </button>
        <button
          onClick={() => scrollTo('ownership')}
          className={activeNavTab === 'ownership' ? 'active' : ''}
          aria-label="Ownership"
        >
          <ShieldCheck size={18} />
          <span>Ownership</span>
        </button>
        <button
          onClick={() => scrollTo('risks')}
          className={activeNavTab === 'risks' ? 'active' : ''}
          aria-label="Risks"
        >
          <AlertTriangle size={18} />
          <span>Risks</span>
        </button>
        <button
          onClick={() => scrollTo('signoff')}
          className={activeNavTab === 'signoff' ? 'active' : ''}
          aria-label="Sign-off"
        >
          <CheckSquare size={18} />
          <span>Sign-off</span>
        </button>
      </nav>

      {/* Overlays / Modals */}
      {inspectingClaim && (
        <SourceInspectorDrawer
          claim={inspectingClaim}
          onClose={() => setInspectingClaimId(null)}
        />
      )}

      {activeContradiction && (
        <ContradictionModal
          item={activeContradiction}
          onResolve={(type, note) => {
            resolveContradiction(activeContradiction.id, type, note)
            setActiveContradictionId(null)
          }}
          onClose={() => setActiveContradictionId(null)}
        />
      )}

      {showInterview && (
        <LeaverInterviewModal
          questions={questions}
          onAnswer={(id, text) => answerInterviewQuestion(id, text)}
          onClose={() => setShowInterview(false)}
        />
      )}

      {showExposure && (
        <ExposureDiffModal
          details={withheldDetails}
          onClose={() => setShowExposure(false)}
        />
      )}
    </div>
  )
}
