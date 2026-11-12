'use client'

import { AlertTriangle, GitCompare, ShieldAlert, Check, ExternalLink } from 'lucide-react'
import { ContradictionItem } from '@/lib/types'

export default function PillarRisks({
  contradictions,
  isAccepted,
  onContradiction,
  onInspect,
  onAccept,
  onUndo,
}: {
  contradictions: ContradictionItem[]
  isAccepted: boolean
  onContradiction: (id: string) => void
  onInspect: (claimId: string) => void
  onAccept: () => void
  onUndo: () => void
}) {
  const unresolvedCount = contradictions.filter((c) => c.status === 'open_unresolved').length

  return (
    <section id="risks" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-[#0A0A0A]">
            Conflicts to review
          </h2>
          <p className="mt-1 text-xs text-[#6B6B6B]">
            Where do git commits and chat discussions disagree, and what failure modes are unhandled?
          </p>
        </div>
        <button
          onClick={isAccepted ? onUndo : onAccept}
          className={`min-hit flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-xs font-semibold transition ${
            isAccepted
              ? 'border border-[#E6E6E6] bg-[#EEEEEE] text-[#0A0A0A]'
              : 'border border-[#0A0A0A] bg-[#141414] text-white hover:bg-[#2a2a2a]'
          }`}
          aria-pressed={isAccepted}
          aria-label={isAccepted ? 'Undo risks review' : 'Mark risks reviewed'}
        >
          <Check size={14} />
          {isAccepted ? 'Undo review' : 'Mark reviewed'}
        </button>
      </div>

      {/* Contradiction Settlement Cards */}
      <div className="space-y-4">
        {contradictions.map((c) => {
          const isOpen = c.status === 'open_unresolved'
          return (
            <article
              key={c.id}
              className="ledger-panel border border-[#363636] transition hover:border-[#eeeeee]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#EEEEEE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0A0A0A]">
                      DISAGREEMENT · {c.id.toUpperCase()}
                    </span>
                    <span className="monochrome-pill">
                      {isOpen ? 'Conflict' : 'Settled'}
                    </span>
                    <span className="text-xs font-medium text-[#6B6B6B]">
                      {c.severity === 'critical_blocker' ? 'Critical blocker' : 'Operational warning'}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-[#0A0A0A]">
                    {c.entityName} — {c.attributeName}
                  </h3>
                  <p className="mt-1 text-xs text-[#6B6B6B]">
                    Sample records show different states. Compare their dates and context before recording a human decision.
                  </p>
                </div>

                {/* Direct action to compare and resolve */}
                <button
                  onClick={() => onContradiction(c.id)}
                  className="min-hit flex items-center gap-1.5 rounded-[6px] border border-[#0A0A0A] bg-[#141414] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2a2a2a]"
                  aria-label={`Compare and settle contradiction ${c.id}`}
                >
                  <GitCompare size={14} />
                  <span>{isOpen ? 'Compare & settle contradiction' : 'View settlement audit note'}</span>
                </button>
              </div>

              {/* Side-by-side evidence preview */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0A0A0A]">Source A (GitHub PR #155)</span>
                    <span className="font-mono text-[11px] text-[#6B6B6B]">pr_155</span>
                  </div>
                  <p className="mt-1.5 font-medium text-[#0A0A0A]">
                    {c.sourceA.extractedValue}
                  </p>
                  <blockquote className="mt-2 rounded-[4px] border border-[#262626] bg-[#181818] p-2 font-mono text-[11px] text-[#8d8d8d]">
                    &ldquo;{c.sourceA.exactQuote}&rdquo;
                  </blockquote>
                </div>

                <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0A0A0A]">Source B (Slack #helios-eng)</span>
                    <span className="font-mono text-[11px] text-[#6B6B6B]">slack_helios</span>
                  </div>
                  <p className="mt-1.5 font-medium text-[#0A0A0A]">
                    {c.sourceB.extractedValue}
                  </p>
                  <blockquote className="mt-2 rounded-[4px] border border-[#262626] bg-[#181818] p-2 font-mono text-[11px] text-[#8d8d8d]">
                    &ldquo;{c.sourceB.exactQuote}&rdquo;
                  </blockquote>
                </div>
              </div>

              {/* Baton pass line */}
              <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
                <div className="baton-pass-line">
                  <span className="text-xs text-[#6B6B6B]">
                    {isOpen ? 'Requires lead settlement decision' : 'Decision recorded by lead'}
                  </span>
                  <div className="pass-rule" />
                  <button
                    onClick={() => onInspect(c.associatedClaimId)}
                    className="min-hit flex items-center gap-1 font-mono text-xs text-[#0A0A0A] hover:underline"
                    aria-label="Inspect claim 09 evidence"
                  >
                    <span>claim_09</span>
                    <ExternalLink size={12} className="text-[#6B6B6B]" />
                  </button>
                </div>
              </div>
            </article>
          )
        })}

        {/* Operational Risk Ledger */}
        <div className="rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-4">
          <div className="flex items-center gap-2 border-b border-[#F0F0F0] pb-2.5">
            <ShieldAlert size={16} className="text-[#0A0A0A]" />
            <h3 className="text-sm font-semibold text-[#0A0A0A]">
              Operational failure modes & mitigation checklist
            </h3>
          </div>
          <div className="mt-3 divide-y divide-[#F0F0F0] text-xs">
            <div className="py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#0A0A0A]">Cardinality explosion overwrites the ingest ring</p>
                <p className="text-[#6B6B6B]">Adaptive limiting is stuck in an open PR; a label burst during peak traffic drops series.</p>
              </div>
              <span className="rounded bg-[#EEEEEE] px-2 py-1 font-mono text-[11px] text-[#0A0A0A]">
                Mitigation: Adopt PR #167
              </span>
            </div>
            <div className="py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#0A0A0A]">Grafana org admin token expiry mid-incident</p>
                <p className="text-[#6B6B6B]">Sole-custodian token scheduled for rotation on Dec 5, 2026. A missed rotation breaks dashboards-as-code sync.</p>
              </div>
              <span className="rounded bg-[#EEEEEE] px-2 py-1 font-mono text-[11px] text-[#0A0A0A]">
                Mitigation: Vault rotation on Dec 5
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
