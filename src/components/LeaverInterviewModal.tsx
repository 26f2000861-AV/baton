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
  onAnswer: (id: string, text: string) => void
  onClose: () => void
  isClosing?: boolean
}) {
  const pending = questions.filter((q) => q.status === 'pending_answer')
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: true,
    onClose,
  })

  const question = pending[index]

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || !question) return
    onAnswer(question.id, answer.trim())
    setAnswer('')
    if (index >= pending.length - 1) {
      setIndex(0)
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]${isClosing ? ' is-closing' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaver-interview-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Leaver Focus Interview
              </span>
              <span className="monochrome-pill">
                Alex Chen (Staff Engineer)
              </span>
            </div>
            <h2 id="leaver-interview-title" className="mt-1 text-base font-semibold text-[#0A0A0A]">
              Capture undocumented rationale and access credentials before Nov 11
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#D4D4D4] bg-white text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-[#0A0A0A] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            aria-label="Close interview dialog"
          >
            <X size={18} />
          </button>
        </div>

        {!question ? (
          <div className="mt-6 rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEEEEE] text-[#0A0A0A]">
              <Check size={24} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#0A0A0A]">
              All priority interview questions answered
            </h3>
            <p className="mt-1 text-xs text-[#6B6B6B]">
              Alex Chen has attested responses for the 72h token TTL and Stripe 2FA root backup credentials. All answers are preserved in the ledger.
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
            <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
              <span className="font-semibold text-[#0A0A0A]">
                QUESTION {index + 1} OF {pending.length}
              </span>
              <span className="font-mono">Category: {question.category}</span>
            </div>

            <div className="rounded-[6px] border border-[#E6E6E6] bg-[#F2F4F7]/40 p-4">
              <p className="text-sm font-semibold text-[#0A0A0A]">
                {question.promptText}
              </p>
              <div className="mt-2.5 rounded-[4px] border border-[#363636] bg-[#181818] p-2.5 font-mono text-[11px] text-[#eeeeee]">
                Grounding: &ldquo;{question.groundingContext.snippetText}&rdquo;
              </div>
            </div>

            <div>
              <label htmlFor="leaver-response-input" className="block text-xs font-semibold text-[#0A0A0A]">
                Demo attestation response (attributed to Alex Chen in this sample case):
              </label>
              <textarea
                id="leaver-response-input"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="State your technical reason, ticket reference, or key handover location..."
                className="mt-1.5 w-full rounded-[6px] border border-[#D4D4D4] bg-white p-3 text-xs text-[#0A0A0A] placeholder-[#767676] outline-none transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 focus-visible:border-[var(--accent)]"
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
                className="btn-primary min-hit text-xs px-5 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
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
