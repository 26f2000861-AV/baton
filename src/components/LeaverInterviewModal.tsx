'use client'

import { useState, useRef } from 'react'
import { X, Check, ChevronRight } from 'lucide-react'
import { LeaverInterviewQuestion } from '@/lib/types'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export default function LeaverInterviewModal({
  questions,
  onAnswer,
  onClose,
  isClosing = false,
}: {
  questions: LeaverInterviewQuestion[]
  onAnswer: (id: string, text: string) => Promise<boolean> | void
  onClose: () => void
  isClosing?: boolean
}) {
  const pending = questions.filter((q) => q.status === 'pending_answer')
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: true,
    onClose,
  })

  const question = pending[index]

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || !question || submitting) return
    setSubmitting(true)
    const ok = await onAnswer(question.id, answer.trim())
    setSubmitting(false)
    if (ok === false) return // keep the answer in the box; the store surfaces the error
    setAnswer('')
    if (index >= pending.length - 1) {
      setIndex(0)
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[4px]${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaver-interview-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-[12px] border border-[#2a2a2e] bg-[#141416] p-6 text-[#f4f4f5] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Leaver Focus Interview
              </span>
              <span className="monochrome-pill">
                Alex Chen (Staff Engineer)
              </span>
            </div>
            <h2 id="leaver-interview-title" className="mt-1 text-base font-semibold text-white">
              Capture undocumented rationale and access credentials before Nov 11
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            aria-label="Close interview dialog"
          >
            <X size={18} />
          </button>
        </div>

        {!question ? (
          <div className="mt-6 rounded-[8px] border border-[#26262a] bg-[#18181c] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Check size={24} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">
              All priority interview questions answered
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Alex Chen has attested responses for the alert dedup window and the Grafana break-glass 2FA device. All answers are preserved in the ledger.
            </p>
            <button
              onClick={onClose}
              className="btn-primary min-hit mt-5 px-6 text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            >
              Return to Handover Ledger
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">
                QUESTION {index + 1} OF {pending.length}
              </span>
              <span className="font-mono text-zinc-400">Category: {question.category}</span>
            </div>

            <div className="rounded-[8px] border border-[#26262a] bg-[#18181c] p-4">
              <p className="text-sm font-semibold text-white">
                {question.promptText}
              </p>
              <div className="mt-2.5 rounded-[6px] border border-white/[0.08] bg-[#0c0c0e] p-2.5 font-mono text-[11px] text-zinc-200">
                Grounding: &ldquo;{question.groundingContext.snippetText}&rdquo;
              </div>
            </div>

            <div>
              <label htmlFor="leaver-response-input" className="block text-xs font-semibold text-zinc-200">
                Demo attestation response (attributed to Alex Chen in this sample case):
              </label>
              <textarea
                id="leaver-response-input"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="State your technical reason, ticket reference, or key handover location..."
                className="mt-1.5 w-full rounded-[8px] border border-white/[0.1] bg-[#0c0c0e] p-3 text-xs text-white placeholder-zinc-500 outline-none transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 focus-visible:border-[var(--accent)]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary min-hit text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!answer.trim()}
                className="btn-primary min-hit px-5 text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
              >
                <span>Submit attestation</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
