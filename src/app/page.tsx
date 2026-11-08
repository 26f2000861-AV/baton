'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FileCheck2,
  Lock,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import ContradictionModal from '../components/ContradictionModal'
import ExposureDiffModal from '../components/ExposureDiffModal'
import Header from '../components/Header'
import LeaverInterviewModal from '../components/LeaverInterviewModal'
import PillarDecisions from '../components/PillarDecisions'
import PillarOwnership from '../components/PillarOwnership'
import PillarRisks from '../components/PillarRisks'
import PillarUnfinished from '../components/PillarUnfinished'
import SourceInspectorDrawer from '../components/SourceInspectorDrawer'
import SuccessorSignoffBar from '../components/SuccessorSignoffBar'
import { useHandover } from '../lib/store'

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
  } = useHandover()

  const [inspectingClaimId, setInspectingClaimId] = useState<string | null>(null)
  const [activeContradictionId, setActiveContradictionId] = useState<string | null>(null)
  const [showInterview, setShowInterview] = useState<boolean>(false)
  const [showExposure, setShowExposure] = useState<boolean>(false)

  const inspectingClaim = visibleClaims.find((c) => c.id === inspectingClaimId)
  const activeContradiction = contradictions.find((c) => c.id === activeContradictionId)

  // Metrics calculation
  const verifiedCount = visibleClaims.filter((c) => c.status === 'quoted_verified').length
  const inferredCount = visibleClaims.filter((c) => c.status === 'inferred_ai').length
  const conflictCount = visibleClaims.filter((c) => c.status === 'conflicting').length
  const statedCount = visibleClaims.filter((c) => c.status === 'stated_by_leaver').length

  const allSectionsAccepted = Object.values(sectionStates).every((s) => s.isAccepted)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Header
        onInterview={() => setShowInterview(true)}
        onExposure={() => setShowExposure(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner with Persona Context */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  Accountable Claim Ledger Live
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                FinTrack Payment Core Handover
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Viewing as <strong className="text-slate-200">{activePersona.name}</strong> ({activePersona.title}). Security Clearance:{' '}
                <span className="font-mono text-xs text-indigo-300 uppercase">{activePersona.clearanceLevel.replace('_', ' ')}</span>.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {activePersona.role === 'leaver' && (
                <button
                  onClick={() => setShowInterview(true)}
                  className="flex items-center gap-2 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 transition"
                >
                  <Sparkles size={14} />
                  Open Leaver Focus Interview (
                  {questions.filter((q) => q.status === 'pending_answer').length} gaps)
                </button>
              )}

              {activePersona.role === 'lead' && (
                <button
                  onClick={() => setShowExposure(true)}
                  className="flex items-center gap-2 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/30 px-4 py-2.5 text-xs font-semibold text-fuchsia-300 hover:bg-fuchsia-400/20 transition"
                >
                  <Lock size={14} />
                  Exposure Preview Diff ({withheldCount} withheld)
                </button>
              )}
            </div>
          </div>

          {/* Forensic Claim Stats Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-5 sm:grid-cols-5">
            <div className="flex items-center gap-2.5 rounded-lg bg-slate-950/60 p-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Quoted</p>
                <p className="text-sm font-semibold text-emerald-300">{verifiedCount} claims</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-slate-950/60 p-2.5">
              <BrainCircuit size={16} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">AI Inferred</p>
                <p className="text-sm font-semibold text-amber-300">{inferredCount} claims</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-slate-950/60 p-2.5">
              <AlertTriangle size={16} className="text-rose-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Conflicting</p>
                <p className="text-sm font-semibold text-rose-300">{conflictCount} queues</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-slate-950/60 p-2.5">
              <UserCheck size={16} className="text-violet-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Leaver-Stated</p>
                <p className="text-sm font-semibold text-violet-300">{statedCount} claims</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg bg-slate-950/60 p-2.5 col-span-2 sm:col-span-1">
              <Lock size={16} className="text-fuchsia-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Shielded</p>
                <p className="text-sm font-semibold text-fuchsia-300">{withheldCount} confidential</p>
              </div>
            </div>
          </div>
        </div>

        {/* Handover Completion Certificate Modal when All Sections Accepted */}
        {allSectionsAccepted && (
          <div className="mb-8 rounded-2xl border border-emerald-400/40 bg-emerald-950/20 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-400/20 p-2 text-emerald-300">
                <FileCheck2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-300">
                  Handover Completed & Formally Attested
                </h3>
                <p className="text-xs text-slate-300">
                  All 4 domain pillars have been verified by Priya Sharma and attested by Vikram Malhotra. Digital audit hash: <code className="font-mono text-emerald-200">sha256:7b91...a4f0</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The 4 Core Hackathon Pillars */}
        <div className="space-y-12">
          {/* Pillar 01: Decisions Already Taken */}
          <PillarDecisions
            decisions={decisions}
            onInspect={(claimId) => setInspectingClaimId(claimId)}
          />

          {/* Pillar 02: What Is Still Unfinished */}
          <PillarUnfinished
            items={unfinished}
            onAdopt={(id) => adoptUnfinishedItem(id)}
          />

          {/* Pillar 03: Who Owned What */}
          <PillarOwnership assets={ownership} />

          {/* Pillar 04: Where the Risk Sits */}
          <PillarRisks
            contradictions={contradictions}
            onContradiction={(id) => setActiveContradictionId(id)}
          />
        </div>

        {/* Sticky Bottom Successor Review Console */}
        <SuccessorSignoffBar
          states={sectionStates}
          queryCount={queries.length}
          onAccept={(id) => acceptSection(id)}
          onQuery={(text) =>
            submitSuccessorQuery('claim_01', 'unclear_rationale', text)
          }
        />
      </main>

      {/* Slide-over Provenance Inspector Drawer */}
      <SourceInspectorDrawer
        claim={inspectingClaim}
        onClose={() => setInspectingClaimId(null)}
      />

      {/* Leaver 5-Question Focus Drawer */}
      {showInterview && (
        <LeaverInterviewModal
          questions={questions}
          onAnswer={(id, text) => answerInterviewQuestion(id, text)}
          onClose={() => setShowInterview(false)}
        />
      )}

      {/* Contradiction Settlement Side-by-Side Modal */}
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

      {/* Exposure Diff Modal (Lead Only) */}
      {showExposure && (
        <ExposureDiffModal
          details={withheldDetails}
          onClose={() => setShowExposure(false)}
        />
      )}
    </div>
  )
}
