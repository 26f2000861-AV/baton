'use client'

import { FileText, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { ArchitecturalDecision } from '@/lib/types'

export default function PillarDecisions({
  decisions,
  isAccepted,
  onInspect,
  onAccept,
}: {
  decisions: ArchitecturalDecision[]
  isAccepted: boolean
  onInspect: (claimId: string) => void
  onAccept: () => void
}) {
  return (
    <section id="decisions" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
            01 / Pillar
          </span>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-[#0A0A0A]">
            Architecture decisions
          </h2>
          <p className="mt-1 text-xs text-[#6B6B6B]">
            Which major design choices were made, why, and which carry residual risk?
          </p>
        </div>
        <button
          onClick={onAccept}
          disabled={isAccepted}
          className={`min-hit flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-xs font-semibold transition ${
            isAccepted
              ? 'border border-[#E6E6E6] bg-[#EEEEEE] text-[#0A0A0A]'
              : 'border border-[#0A0A0A] bg-[#141414] text-white hover:bg-[#2a2a2a]'
          }`}
          aria-label={isAccepted ? 'Architecture decisions accepted' : 'Accept architecture decisions'}
        >
          <Check size={14} />
          {isAccepted ? 'Section accepted' : 'Accept decisions'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {decisions.map((d) => {
          const isInferred = d.provenance.rationaleConfidence === 'inferred_ai'
          return (
            <article
              key={d.id}
              className="ledger-panel flex flex-col justify-between transition hover:border-[#0A0A0A]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded bg-[#EEEEEE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0A0A0A]">
                    {d.id === 'dec_01' ? 'ADR-004' : 'COMMIT 8f4a1'}
                  </span>
                  <span className="monochrome-pill">
                    {isInferred ? 'Inferred' : 'Verified'}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-semibold leading-snug text-[#0A0A0A]">
                  {d.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#6B6B6B]">
                  {d.context}
                </p>

                <div className="mt-4 rounded-[6px] border border-[#363636] bg-[#181818] p-3 text-xs text-[#eeeeee]">
                  <span className="block text-[11px] font-semibold text-[#6B6B6B]">Decision taken</span>
                  <p className="mt-0.5 font-medium">{d.decisionTaken}</p>
                </div>

                {d.tradeOffsAccepted && d.tradeOffsAccepted.length > 0 && (
                  <div className="mt-3 text-xs text-[#6B6B6B]">
                    <span className="font-semibold text-[#0A0A0A]">Trade-offs accepted: </span>
                    {d.tradeOffsAccepted.join(' • ')}
                  </div>
                )}
              </div>

              {/* Signature Baton pass line connecting claim to source key */}
              <div className="mt-5 pt-3 border-t border-[#F0F0F0]">
                <div className="baton-pass-line">
                  <span className="text-xs text-[#6B6B6B]">
                    {isInferred ? (
                      <span className="flex items-center gap-1 font-medium text-[#0A0A0A]">
                        <AlertCircle size={13} className="text-[#6B6B6B]" />
                        Rationale inferred ({d.provenance.exactQuote})
                      </span>
                    ) : (
                      <span className="evidence-signal font-medium text-[#1D5FBF]">
                        Verified claim
                      </span>
                    )}
                  </span>
                  <div className="pass-rule" />
                  <button
                    onClick={() => onInspect(d.associatedClaimId)}
                    className="min-hit flex items-center gap-1 font-mono text-xs text-[#0A0A0A] underline-offset-2 hover:underline"
                    title={`Inspect source evidence: ${d.provenance.sourceId}`}
                    aria-label={`Inspect source for ${d.provenance.sourceId}`}
                  >
                    <span>{d.provenance.sourceId}</span>
                    <ExternalLink size={12} className="text-[#6B6B6B]" />
                  </button>
                </div>
              </div>
            </article>
          )
        })}

        {/* 4,200 tx/sec Benchmark Fact Card - explicitly labeled 'unverified' */}
        <article className="ledger-panel lg:col-span-2 flex flex-col justify-between transition hover:border-[#0A0A0A]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#EEEEEE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0A0A0A]">
                  BENCHMARK
                </span>
                <span className="monochrome-pill">Unverified</span>
              </div>
              <h3 className="mt-2 text-base font-semibold text-[#0A0A0A]">
                Payment queue throughput measured at 4,200 transactions per second under simulated load
              </h3>
              <p className="mt-1 text-xs text-[#6B6B6B]">
                Sample data: Cited in PR #189 summary discussion, but synthetic stress test run logs were uncommitted. Labeled unverified per review rules.
              </p>
            </div>
            <button
              onClick={() => onInspect('claim_04')}
              className="min-hit flex items-center gap-1.5 rounded-[6px] border border-[#D4D4D4] bg-white px-3 py-2 text-xs font-medium text-[#0A0A0A] hover:bg-[#EEEEEE]"
              aria-label="Inspect benchmark evidence"
            >
              <FileText size={14} />
              <span>Inspect claim 04</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
            <div className="baton-pass-line">
              <span className="text-xs text-[#6B6B6B]">Paraphrase check required</span>
              <div className="pass-rule" />
              <span className="evidence-key">pr_189</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
