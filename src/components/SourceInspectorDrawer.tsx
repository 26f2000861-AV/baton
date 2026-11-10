'use client'

import { useRef } from 'react'
import { X, ExternalLink, ShieldCheck, Clock, User } from 'lucide-react'
import { Claim } from '@/lib/types'
import { CLAIM_STATUS_COPY } from '@/lib/claimStatus'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export default function SourceInspectorDrawer({
  claim,
  onClose,
  isClosing = false,
}: {
  claim?: Claim
  onClose: () => void
  isClosing?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: Boolean(claim),
    onClose,
  })

  if (!claim) return null

  const source = claim.sourceQuotes[0]
  const status = CLAIM_STATUS_COPY[claim.status]
  const isExactVerified = claim.status === 'quoted_verified'

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`drawer-overlay${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-inspector-title"
    >
      <aside
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className="drawer-panel h-full w-full max-w-xl overflow-y-auto border-l border-[#262626] bg-[#121212] p-6 shadow-2xl flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Source Evidence Inspector
              </span>
              <h2
                id="source-inspector-title"
                className="mt-1 text-base font-semibold text-[#0A0A0A]"
              >
                {source?.title || 'Ground Truth Evidence'}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#D4D4D4] bg-white text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              aria-label="Close source inspector drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Verification Status Pill */}
          <div className="mt-4 flex items-center justify-between rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7] p-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className={isExactVerified ? 'text-[#1D5FBF]' : 'text-[#6B6B6B]'} />
              <span className="font-semibold text-[#0A0A0A]">
                {status.label}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#6B6B6B]">
              {claim.verificationMethod}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#555555]">{status.description}</p>

          {/* Handover Claim Statement */}
          <div className="mt-4 rounded-[6px] border border-[#E6E6E6] bg-white p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
              Handover Claim Statement ({claim.id})
            </span>
            <p className="mt-1.5 text-sm leading-relaxed text-[#0A0A0A]">
              {claim.statement}
            </p>
          </div>

          {claim.history && claim.history.length > 0 && (
            <section className="mt-4 rounded-[6px] border border-[#E6E6E6] bg-white p-4" aria-label="Claim history">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">Claim history</h3>
              <ol className="mt-3 space-y-3">
                {claim.history.map((entry, index) => (
                  <li key={`${entry.timestamp}-${index}`} className="border-l-2 border-[#1D5FBF] pl-3 text-xs">
                    <p className="text-[#0A0A0A]">{entry.action}</p>
                    <p className="mt-1 text-[#6B6B6B]">{entry.actor} · {new Date(entry.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Verbatim Source Evidence Snippet */}
          {source && (
            <div className="mt-4 rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/60 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Verbatim Source Snippet ({source.sourceId})
              </span>
              <div className="mt-2 rounded-[4px] border border-[#262626] bg-[#181818] p-3 font-mono text-xs leading-relaxed text-[#eeeeee]">
                <mark className="bg-[#1D5FBF]/10 font-bold text-[#0A0A0A] px-1 py-0.5 rounded">
                  {source.exactSnippet}
                </mark>
              </div>
            </div>
          )}

          {/* Provenance Metadata */}
          {source && (
            <div className="mt-4 space-y-2 rounded-[6px] border border-[#E6E6E6] bg-white p-4 text-xs text-[#6B6B6B]">
              <div className="flex items-center gap-2">
                <User size={13} className="text-[#0A0A0A]" />
                <span>Author: <strong className="text-[#0A0A0A]">{source.author}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-[#0A0A0A]" />
                <span>Captured Timestamp: <strong className="text-[#0A0A0A]">{new Date(source.timestamp).toUTCString()}</strong></span>
              </div>
              <div>
                Clearance Required: <span className="font-mono text-[#0A0A0A]">{source.requiredClearanceLevel}</span>
              </div>
              <div className="pt-2">
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[#1D5FBF] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                >
                  <span>Open origin record</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#F0F0F0]">
          <button
            onClick={onClose}
            className="btn-secondary w-full min-hit focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            Close Inspector (Esc)
          </button>
        </div>
      </aside>
    </div>
  )
}
