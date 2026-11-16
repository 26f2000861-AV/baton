'use client'

import { useState, useRef, type ReactNode } from 'react'
import { X, GitPullRequest, MessageSquare, AlertTriangle, Check } from 'lucide-react'
import { ContradictionItem } from '@/lib/types'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export default function ContradictionModal({
  item,
  onResolve,
  onClose,
  isClosing = false,
  canResolve = true,
}: {
  item?: ContradictionItem
  onResolve: (
    type: 'accept_source_a' | 'accept_source_b' | 'accept_dual_scope' | 'clarification_note',
    note: string
  ) => void
  onClose: () => void
  isClosing?: boolean
  canResolve?: boolean
}) {
  const [note, setNote] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: Boolean(item),
    onClose,
  })

  if (!item) return null

  const isAlreadySettled = item.status === 'settled_by_human'
  const resolutionLabels = {
    accept_source_a: 'Accepted Source A · VM dual-write is fully live',
    accept_source_b: 'Accepted Source B · Thanos still serves dashboard reads',
    accept_dual_scope: 'Scoped both · VM stays dual-write, Thanos serves reads',
    clarification_note: 'Clarification recorded · source precedence remains open',
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[4px]${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contradiction-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-4xl rounded-[12px] border border-[#2a2a2e] bg-[#141416] p-6 text-[#f4f4f5] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Contradiction Settlement Queue
              </span>
              <span className="monochrome-pill">
                {isAlreadySettled ? 'Settled' : 'Critical Conflict'}
              </span>
            </div>
            <h2 id="contradiction-modal-title" className="mt-1 text-lg font-semibold text-white">
              {item.entityName} — {item.attributeName}
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              The sample records show different states. Compare their dates and context before recording a human decision.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            aria-label="Close contradiction modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Side-by-side Evidence Cards */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <EvidenceBlock
            badge="SOURCE A · GITHUB PR #204"
            icon={<GitPullRequest size={15} />}
            title={item.sourceA.title}
            author={item.sourceA.author}
            extractedValue={item.sourceA.extractedValue}
            quote={item.sourceA.exactQuote}
          />
          <EvidenceBlock
            badge="SOURCE B · SLACK #PAYMENT-ENG"
            icon={<MessageSquare size={15} />}
            title={item.sourceB.title}
            author={item.sourceB.author}
            extractedValue={item.sourceB.extractedValue}
            quote={item.sourceB.exactQuote}
          />
        </div>

        {item.settlement && (
          <section className="mt-5 rounded-[8px] border border-[#245237] bg-[#14281c] p-4" aria-label="Saved human decision">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#eeeeee]">{resolutionLabels[item.settlement.resolutionType]}</p>
              <time className="text-xs text-[#b8c7bc]" dateTime={item.settlement.resolutionTimestamp}>
                {new Date(item.settlement.resolutionTimestamp).toLocaleString()}
              </time>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#eeeeee]">
              <strong>Lead note: </strong>{item.settlement.humanComment}
            </p>
            <p className="mt-2 text-[11px] text-[#b8c7bc]">
              Recorded by {item.settlement.resolvedBy}. This decision is saved in this browser’s sample state, not in a shared audit log.
            </p>
          </section>
        )}

        {/* Settlement Input and Choices */}
        {!isAlreadySettled && <div className="mt-6 rounded-[8px] border border-[#26262a] bg-[#18181c]/70 p-4">
          <label htmlFor="settlement-note" className="block text-xs font-semibold text-zinc-200">
            Decision note (required):
          </label>
          <textarea
            id="settlement-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isAlreadySettled || !canResolve}
            placeholder={
              isAlreadySettled
                ? 'Contradiction has been settled.'
                : canResolve
                  ? 'State why this source is canonical, or clarify if both engines are operating in fallback mode...'
                  : 'Only the lead seat can record a decision here. The lead can sign in and open this conflict to settle it.'
            }
            rows={2}
            className="mt-2 w-full rounded-[8px] border border-white/[0.1] bg-[#0c0c0e] p-3 text-xs text-white placeholder-zinc-500 outline-none transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 focus-visible:border-[var(--accent)]"
          />

          {!isAlreadySettled && !canResolve && (
            <p className="mt-3 text-xs leading-relaxed text-zinc-400" role="status">
              Only the engineering lead can record a resolution. Decisions persist in the shared history for every member.
            </p>
          )}

          {!isAlreadySettled && canResolve && (
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                disabled={!note.trim()}
                onClick={() => onResolve('accept_source_a', note)}
                className="btn-primary min-hit text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                <Check size={14} />
                <span>Accept Source A (VM dual-write live)</span>
              </button>

              <button
                disabled={!note.trim()}
                onClick={() => onResolve('accept_source_b', note)}
                className="btn-primary min-hit text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                <Check size={14} />
                <span>Accept Source B (Thanos serves reads)</span>
              </button>

              <button
                disabled={!note.trim()}
                onClick={() => onResolve('accept_dual_scope', note)}
                className="btn-secondary min-hit text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                <span>Resolve: VM dual-write stays, Thanos serves reads</span>
              </button>
            </div>
          )}

          {isAlreadySettled && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Check size={14} />
              <span>Decision saved to the shared handover history. It is visible to every member.</span>
            </div>
          )}
        </div>}
        {isAlreadySettled && (
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#eeeeee]">
            <Check size={14} aria-hidden="true" />
            Decision recorded for the next owner. Review the saved note above.
          </p>
        )}
      </div>
    </div>
  )
}

function EvidenceBlock({
  badge,
  icon,
  title,
  author,
  extractedValue,
  quote,
}: {
  badge: string
  icon: ReactNode
  title: string
  author: string
  extractedValue: string
  quote: string
}) {
  return (
    <div className="flex flex-col justify-between rounded-[8px] border border-[#26262a] bg-[#18181c] p-4 text-[#eeeeee]">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-400">
            {badge}
          </span>
          <span className="text-zinc-400">{icon}</span>
        </div>
        <p className="mt-2 text-xs font-medium text-zinc-300">{title} • {author}</p>
        <p className="mt-2 text-sm font-semibold text-white">{extractedValue}</p>
        <blockquote className="mt-3 rounded-[6px] border border-white/[0.08] bg-[#0c0c0e] p-2.5 font-mono text-[11px] leading-relaxed text-zinc-200">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      <p className="mt-3 pt-2 text-[11px] text-zinc-400">Illustrative source · synthetic, not connected</p>
    </div>
  )
}
