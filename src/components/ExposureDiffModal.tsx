'use client'

import { useRef } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export default function ExposureDiffModal({
  details,
  personaName,
  onClose,
  isClosing = false,
}: {
  details: {
    claimId: string
    statement: string
    requiredClearance: string
    reason: string
  }[]
  personaName: string
  onClose: () => void
  isClosing?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const clearanceLabel = (value: string) => ({
    public_open: 'Open to the team',
    team_internal: 'Team members',
    confidential_lead: 'Team leads',
    restricted_hr_legal: 'Restricted HR or legal roles',
  }[value] ?? value.replaceAll('_', ' '))

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: true,
    onClose,
  })

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[4px]${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exposure-diff-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-[12px] border border-[#2a2a2e] bg-[#141416] p-6 text-[#f4f4f5] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Who can view each claim
              </span>
              <span className="monochrome-pill">Preview · {personaName}</span>
            </div>
            <h2 id="exposure-diff-title" className="mt-1 text-base font-semibold text-white">
              Claims hidden in this view
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            aria-label="Close exposure diff dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          This synthetic preview shows what {personaName} can see in the sample case. Persona switching is not authentication or access control; no data is actually protected. Use sample data only.
        </p>

        <div className="mt-4 space-y-3">
          {details.length === 0 ? (
            <div className="rounded-[8px] border border-[#26262a] bg-[#18181c] p-6 text-center text-xs text-zinc-400">
              No claims are hidden from this view.
            </div>
          ) : (
            details.map((d) => (
              <div
                key={d.claimId}
                className="rounded-[8px] border border-[#26262a] bg-[#18181c] p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white">{d.claimId}</span>
                  <span className="rounded border border-white/[0.1] bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-200">
                    Visible to: {clearanceLabel(d.requiredClearance)}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-[#eeeeee]">
                  {d.statement}
                </p>
                <div className="mt-2.5 rounded-[6px] border border-white/[0.08] bg-[#0c0c0e] p-2.5 text-[11px] text-zinc-400">
                  <strong className="text-white">Why it is hidden: </strong>
                  {d.reason}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-white/[0.08] pt-3">
          <button
            onClick={onClose}
            className="btn-secondary min-hit px-5 text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
