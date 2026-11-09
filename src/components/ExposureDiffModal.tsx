'use client'

import { useEffect, useRef } from 'react'
import { X, Lock, ShieldAlert, Check } from 'lucide-react'

export default function ExposureDiffModal({
  details,
  onClose,
  isClosing = false,
}: {
  details: {
    claimId: string
    statement: string
    requiredClearance: string
    reason: string
  }[]
  onClose: () => void
  isClosing?: boolean
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exposure-diff-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Reader-Scoped Compilation
              </span>
              <span className="monochrome-pill">Lead-Only View</span>
            </div>
            <h2 id="exposure-diff-title" className="mt-1 text-base font-semibold text-[#0A0A0A]">
              Clearance exposure diff: Confidential claims shielded from successor
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#D4D4D4] bg-white text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
            aria-label="Close exposure diff dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-xs text-[#6B6B6B]">
          Baton enforces strict access control policies. Records classified above the active reader’s clearance level (<code className="font-mono text-[#0A0A0A]">team_internal</code> for Priya Sharma) are completely excluded from the successor handover ledger to guarantee zero data leakage.
        </p>

        <div className="mt-4 space-y-3">
          {details.length === 0 ? (
            <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7] p-6 text-center text-xs text-[#6B6B6B]">
              No confidential claims currently shielded.
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
                    Required: {d.requiredClearance}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-[#0A0A0A]">
                  {d.statement}
                </p>
                <div className="mt-2.5 rounded-[4px] border border-[#363636] bg-[#181818] p-2.5 text-[11px] text-[#8d8d8d]">
                  <strong className="text-[#0A0A0A]">Reason withheld: </strong>
                  {d.reason}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end pt-3 border-t border-[#F0F0F0]">
          <button
            onClick={onClose}
            className="btn-secondary min-hit text-xs px-5"
          >
            Close Diff
          </button>
        </div>
      </div>
    </div>
  )
}
