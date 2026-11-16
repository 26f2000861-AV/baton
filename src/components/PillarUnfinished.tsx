'use client'

import { GitPullRequest, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { UnfinishedWorkItem } from '@/lib/types'

const columns = [
  { key: 'p0_immediate', title: 'Days 1–7', subline: 'Urgent triage & P0 PRs' },
  { key: 'p1_first_two_weeks', title: 'Days 8–15', subline: 'PR adoption & branch hygiene' },
  { key: 'p2_first_month', title: 'Days 16–30', subline: 'Tech debt & inline backlog' },
] as const

export default function PillarUnfinished({
  items,
  isAccepted,
  onAdopt,
  onInspect,
  onAccept,
  onUndo,
}: {
  items: UnfinishedWorkItem[]
  isAccepted: boolean
  onAdopt: (id: string) => void
  onInspect: (claimId: string) => void
  onAccept: () => void
  onUndo: () => void
}) {
  return (
    <section id="unfinished" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-white">
            Unfinished work roadmap
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            What incomplete branches, PRs, and migrations must the successor triage in the first 30 days?
          </p>
        </div>
        <button
          onClick={isAccepted ? onUndo : onAccept}
          className={`min-hit flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-xs font-semibold transition ${
            isAccepted
              ? 'border border-white/20 bg-white/10 text-white'
              : 'border border-white/10 bg-[#18181c] text-white hover:bg-[#242428]'
          }`}
          aria-pressed={isAccepted}
          aria-label={isAccepted ? 'Undo unfinished work review' : 'Mark unfinished work reviewed'}
        >
          <Check size={14} />
          {isAccepted ? 'Undo review' : 'Mark reviewed'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const columnItems = items.filter((i) => i.urgency === col.key)
          return (
            <div
              key={col.key}
              className="flex flex-col rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-4"
            >
              <div className="border-b border-[#F0F0F0] pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">{col.title}</h3>
                  <span className="rounded-full bg-[#EEEEEE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0A0A0A]">
                    {columnItems.length}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B6B]">{col.subline}</p>
              </div>

              <div className="mt-3 flex-1 space-y-3">
                {columnItems.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-[6px] border border-dashed border-[#D4D4D4] p-4 text-center text-xs text-[#6B6B6B]">
                    No outstanding tasks scheduled in this window.
                  </div>
                ) : (
                  columnItems.map((item) => {
                    const isAdopted = item.status === 'adopted'
                    return (
                      <article
                        key={item.id}
                        className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/40 p-4 transition hover:border-[#0A0A0A]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0A0A0A]">
                            <GitPullRequest size={14} className="text-[#6B6B6B]" />
                            {item.location.prNumber
                              ? `PR #${item.location.prNumber}`
                              : item.type.replaceAll('_', ' ')}
                          </span>
                          <span className="monochrome-pill">
                            {isAdopted ? 'Adopted' : 'Pending'}
                          </span>
                        </div>

                        <h4 className="mt-2 text-sm font-semibold leading-snug text-[#0A0A0A]">
                          {item.title}
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#6B6B6B]">
                          {item.description}
                        </p>

                        {item.associatedBlockers.length > 0 && (
                          <div className="mt-3 rounded-[4px] border border-[#363636] bg-[#181818] p-2.5 text-xs text-[#eeeeee]">
                            <span className="flex items-center gap-1 font-semibold text-[#0A0A0A]">
                              <AlertCircle size={13} className="text-[#6B6B6B]" />
                              Known blocker
                            </span>
                            <p className="mt-1 text-[#6B6B6B]">{item.associatedBlockers[0]}</p>
                          </div>
                        )}

                        <div className="mt-3 text-xs text-[#0A0A0A]">
                          <span className="font-semibold">Recommended action: </span>
                          <span className="text-[#6B6B6B]">{item.recommendedSuccessorAction}</span>
                        </div>

                        {/* Baton pass line */}
                        <div className="mt-4 pt-3 border-t border-[#E6E6E6]">
                          <div className="baton-pass-line">
                            <span className="text-[11px] text-[#6B6B6B]">Branch</span>
                            <div className="pass-rule" />
                            <button
                              onClick={() => onInspect(item.associatedClaimId)}
                              className="min-hit flex items-center gap-1 font-mono text-[11px] text-[#0A0A0A] hover:underline"
                              aria-label={`Inspect ${item.location.branchOrPath}`}
                            >
                              <span>{item.location.branchOrPath}</span>
                              <ExternalLink size={11} className="text-[#6B6B6B]" />
                            </button>
                          </div>
                        </div>

                        <button
                          disabled={isAdopted}
                          onClick={() => onAdopt(item.id)}
                          className={`min-hit mt-3 w-full rounded-[6px] px-3 py-2 text-xs font-semibold transition ${
                            isAdopted
                              ? 'border border-[#E6E6E6] bg-[#EEEEEE] text-[#0A0A0A]'
                              : 'border border-[#0A0A0A] bg-[#141414] text-white hover:bg-[#2a2a2a]'
                          }`}
                          aria-label={isAdopted ? `PR ${item.id} adopted` : `Adopt PR ${item.id}`}
                        >
                          {isAdopted ? '✓ PR Adopted by Successor' : 'Adopt PR & Branch'}
                        </button>
                      </article>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
