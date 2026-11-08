'use client'

import { useState } from 'react'
import { CheckCircle2, MessageSquare, Send, Check } from 'lucide-react'
import { HandoverSectionState } from '@/lib/types'

export default function SuccessorSignoffBar({
  states,
  queryCount,
  onAccept,
  onQuery,
}: {
  states: Record<string, HandoverSectionState>
  queryCount: number
  onAccept: (id: 'decisions' | 'unfinished' | 'ownership' | 'risks') => void
  onQuery: (text: string) => void
}) {
  const [queryText, setQueryText] = useState('')
  const [signoffCompleted, setSignoffCompleted] = useState(false)

  const acceptedCount = Object.values(states).filter((s) => s.isAccepted).length
  const allAccepted = acceptedCount === 4

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (queryText.trim()) {
      onQuery(queryText.trim())
      setQueryText('')
    }
  }

  const handleFinalSignoff = () => {
    if (allAccepted) {
      setSignoffCompleted(true)
    }
  }

  return (
    <section id="signoff" className="mt-8 space-y-4">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
          Final Verification & Acceptance
        </span>
        <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-[#0A0A0A]">
          Successor sign-off
        </h2>
        <p className="mt-1 text-xs text-[#6B6B6B]">
          Has the successor verified evidence across all 4 pillars and resolved all blocking gaps?
        </p>
      </div>

      <div className="rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0F0F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#0A0A0A]">
                {acceptedCount} of 4 sections accepted
              </span>
              <span className="monochrome-pill">
                {allAccepted ? 'Ready to sign' : 'Pending review'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#6B6B6B]">
              Every section requires independent verification before formal handover certificate generation.
            </p>
          </div>

          {/* Section acceptance pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(['decisions', 'unfinished', 'ownership', 'risks'] as const).map((id) => {
              const isSecAccepted = states[id]?.isAccepted
              return (
                <button
                  key={id}
                  onClick={() => onAccept(id)}
                  disabled={isSecAccepted}
                  className={`min-hit flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 text-xs font-medium capitalize transition ${
                    isSecAccepted
                      ? 'border-[#0A0A0A] bg-[#EEEEEE] text-[#0A0A0A]'
                      : 'border-[#D4D4D4] bg-white text-[#6B6B6B] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                  }`}
                  aria-label={isSecAccepted ? `${id} accepted` : `Accept ${id} section`}
                >
                  <CheckCircle2 size={13} className={isSecAccepted ? 'text-[#0A0A0A]' : 'text-[#6B6B6B]'} />
                  <span>{isSecAccepted ? `✓ ${id}` : id}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Inline Successor Query Form */}
        <form onSubmit={handleQuerySubmit} className="mt-4">
          <label htmlFor="successor-query-input" className="block text-xs font-medium text-[#0A0A0A]">
            Raise an inline clarification or blocker query:
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="successor-query-input"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="e.g. Need clarification on PostgreSQL connection pool timeout during failover..."
              className="min-h-[44px] flex-1 rounded-[6px] border border-[#D4D4D4] bg-[#FFFFFF] px-3 py-2 text-xs text-[#0A0A0A] placeholder-[#767676] outline-none transition focus:border-[#0A0A0A]"
            />
            <button
              type="submit"
              disabled={!queryText.trim()}
              className="btn-secondary min-hit min-w-[44px]"
              aria-label="Submit query"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Submit query</span>
            </button>
          </div>
          {queryCount > 0 && (
            <p className="mt-1.5 text-[11px] text-[#6B6B6B]">
              {queryCount} active query recorded in handover audit trail.
            </p>
          )}
        </form>

        {/* Final Sign-off Execution Bar */}
        <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-[#6B6B6B]">
            {allAccepted
              ? 'All 4 verification pillars confirmed. Successor Priya Sharma is authorized to accept ownership.'
              : 'Sign-off is locked until all 4 pillars are reviewed and accepted.'}
          </div>
          <button
            onClick={handleFinalSignoff}
            disabled={!allAccepted || signoffCompleted}
            className={`btn-primary min-hit px-6 ${
              signoffCompleted ? 'bg-[#EEEEEE] text-[#0A0A0A] border-[#0A0A0A]' : ''
            }`}
            aria-label="Issue final handover sign-off certificate"
          >
            <Check size={16} />
            <span>
              {signoffCompleted
                ? 'Handover Accepted & Signed'
                : 'Accept Handover & Commit Certificate'}
            </span>
          </button>
        </div>

        {signoffCompleted && (
          <div className="mt-4 rounded-[6px] border border-[#0A0A0A] bg-[#EEEEEE] p-4 text-xs text-[#0A0A0A]">
            <p className="font-semibold">
              ✓ Baton Handover Certificate Issued — Reference: BTC-2026-11-FINTRACK
            </p>
            <p className="mt-1 text-[#6B6B6B]">
              Successor Priya Sharma has assumed primary operational custody of Payment Core. Departing engineer Alex Chen access revocation scheduled for Nov 11, 2026.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
