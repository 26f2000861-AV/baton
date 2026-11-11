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
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exposure-diff-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Who can view each claim
              </span>
              <span className="monochrome-pill">Preview · {personaName}</span>
            </div>
            <h2 id="exposure-diff-title" className="mt-1 text-base font-semibold text-[#0A0A0A]">
              Claims hidden in this view
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#D4D4D4] bg-white text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            aria-label="Close exposure diff dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-xs text-[#6B6B6B]">
          This synthetic preview shows what {personaName} can see in the sample case. Persona switching is not authentication or access control; no data is actually protected. Use sample data only.
        </p>

        <div className="mt-4 space-y-3">
          {details.length === 0 ? (
            <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7] p-6 text-center text-xs text-[#6B6B6B]">
              No claims are hidden from this view.
            </div>
          ) : (
            details.map((d) => (
              <div
                key={d.claimId}
                className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/40 p-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0A0A0A]">{d.claimId}</span>
                  <span className="rounded bg-[#EEEEEE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0A0A0A]">
                    Visible to: {clearanceLabel(d.requiredClearance)}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-[#0A0A0A]">
                  {d.statement}
                </p>
                <div className="mt-2.5 rounded-[4px] border border-[#363636] bg-[#181818] p-2.5 text-[11px] text-[#8d8d8d]">
                  <strong className="text-[#eeeeee]">Why it is hidden: </strong>
                  {d.reason}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end pt-3 border-t border-[#F0F0F0]">
          <button
            onClick={onClose}
            className="btn-secondary min-hit text-xs px-5 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
