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
}: {
  item?: ContradictionItem
  onResolve: (
    type: 'accept_source_a' | 'accept_source_b' | 'clarification_note',
    note: string
  ) => void
  onClose: () => void
  isClosing?: boolean
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

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contradiction-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Contradiction Settlement Queue
              </span>
              <span className="monochrome-pill">
                {isAlreadySettled ? 'Settled' : 'Critical Conflict'}
              </span>
            </div>
            <h2 id="contradiction-modal-title" className="mt-1 text-lg font-semibold text-[#0A0A0A]">
              {item.entityName} — {item.attributeName}
            </h2>
            <p className="mt-1 text-xs text-[#6B6B6B]">
              Factual disagreement detected between official Git merge record and live Slack incident chat.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#D4D4D4] bg-white text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
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
            url={item.sourceA.url}
          />
          <EvidenceBlock
            badge="SOURCE B · SLACK #PAYMENT-ENG"
            icon={<MessageSquare size={15} />}
            title={item.sourceB.title}
            author={item.sourceB.author}
            extractedValue={item.sourceB.extractedValue}
            quote={item.sourceB.exactQuote}
            url={item.sourceB.url}
          />
        </div>

        {/* Settlement Input and Choices */}
        <div className="mt-6 rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/50 p-4">
          <label htmlFor="settlement-note" className="block text-xs font-semibold text-[#0A0A0A]">
            Human settlement rationale (Required for immutable handover audit log):
          </label>
          <textarea
            id="settlement-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isAlreadySettled}
            placeholder={
              isAlreadySettled
                ? 'Contradiction has been settled.'
                : 'State why this source is canonical, or clarify if both engines are operating in fallback mode...'
            }
            rows={2}
            className="mt-2 w-full rounded-[6px] border border-[#D4D4D4] bg-white p-3 text-xs text-[#0A0A0A] placeholder-[#767676] outline-none transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 focus-visible:border-[var(--accent)]"
          />

          {!isAlreadySettled && (
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                disabled={!note.trim()}
                onClick={() => onResolve('accept_source_a', note)}
                className="btn-primary min-hit text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                <Check size={14} />
                <span>Accept Source A (SQS FIFO)</span>
              </button>

              <button
                disabled={!note.trim()}
                onClick={() => onResolve('accept_source_b', note)}
                className="btn-primary min-hit text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                <Check size={14} />
                <span>Accept Source B (RabbitMQ Fallback)</span>
              </button>

              <button
                disabled={!note.trim()}
                onClick={() => onResolve('clarification_note', note)}
                className="btn-secondary min-hit text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                <span>Annotate Dual Scope / Temporary Fallback</span>
              </button>
            </div>
          )}

          {isAlreadySettled && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#0A0A0A]">
              <Check size={14} />
              <span>This contradiction was formally settled and logged to the handover audit trail.</span>
            </div>
          )}
        </div>
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
  url,
}: {
  badge: string
  icon: ReactNode
  title: string
  author: string
  extractedValue: string
  quote: string
  url: string
}) {
  return (
    <div className="flex flex-col justify-between rounded-[6px] border border-[#E6E6E6] bg-white p-4">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold tracking-wider text-[#6B6B6B]">
            {badge}
          </span>
          <span className="text-[#6B6B6B]">{icon}</span>
        </div>
        <p className="mt-2 text-xs font-medium text-[#6B6B6B]">{title} • {author}</p>
        <p className="mt-2 text-sm font-semibold text-[#0A0A0A]">{extractedValue}</p>
        <blockquote className="mt-3 rounded-[4px] border border-[#363636] bg-[#181818] p-2.5 font-mono text-[11px] leading-relaxed text-[#eeeeee]">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      <div className="mt-3 pt-2 text-[11px]">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[#1D5FBF] hover:underline"
        >
          View original document →
        </a>
      </div>
    </div>
  )
}
