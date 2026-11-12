'use client'

import { useEffect, useRef, useState } from 'react'
import { X, ShieldCheck, Clock, User, ExternalLink } from 'lucide-react'
import type { Claim, ClearanceLevel } from '@/lib/types'
import { CLAIM_STATUS_COPY } from '@/lib/claimStatus'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useHandover } from '@/lib/handoverStore'

interface QuoteCheck {
  isExactMatch: boolean
  charStart: number
  charEnd: number
  explanation: string
}

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
  const [quoteToCheck, setQuoteToCheck] = useState('')
  const [quoteCheck, setQuoteCheck] = useState<QuoteCheck | null>(null)
  const [checkingQuote, setCheckingQuote] = useState(false)
  const [quoteCheckError, setQuoteCheckError] = useState('')
  const { verifyQuote: verifyViaApi, sources } = useHandover()

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: Boolean(claim),
    onClose,
  })

  const source = claim?.sourceQuotes[0]

  useEffect(() => {
    setQuoteToCheck(source?.exactSnippet ?? '')
    setQuoteCheck(null)
    setQuoteCheckError('')
  }, [claim?.id, source?.sourceId, source?.exactSnippet])

  const verifyQuote = async () => {
    if (!source || !quoteToCheck.trim() || checkingQuote) return
    setCheckingQuote(true)
    setQuoteCheck(null)
    setQuoteCheckError('')
    try {
      const outcome = await verifyViaApi(source.sourceId, quoteToCheck)
      if (!outcome.ok) throw new Error(outcome.message ?? 'Quote check could not be completed.')
      const payload = outcome.result as { deterministicCheck?: QuoteCheck }
      const result = payload?.deterministicCheck
      if (!result || typeof result.isExactMatch !== 'boolean' || typeof result.charStart !== 'number' || typeof result.charEnd !== 'number' || typeof result.explanation !== 'string') {
        throw new Error('The verifier returned an unexpected response.')
      }
      setQuoteCheck(result)
    } catch (error) {
      setQuoteCheckError(error instanceof Error ? error.message : 'Quote check could not be completed.')
    } finally {
      setCheckingQuote(false)
    }
  }

  if (!claim) return null

  const status = CLAIM_STATUS_COPY[claim.status]
  const isExactVerified = claim.status === 'quoted_verified'
  const sourceMeta = sources.find((meta) => meta.legacyId === source?.sourceId)
  const isImported = sourceMeta?.origin === 'github_import'
  const verificationMethodLabel = {
    exact_substring_match: 'Text match only',
    llm_entailment: 'Inference · needs review',
    human_attested: 'Human attestation',
  }[claim.verificationMethod]
  const clearanceLabel = (level: ClearanceLevel) => ({
    public_open: 'Open to the team',
    team_internal: 'Team members',
    confidential_lead: 'Team leads',
    restricted_hr_legal: 'Restricted HR or legal roles',
  })[level]

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
          <div className="flex items-start justify-between border-b border-[#363636] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a2a2a2]">
                Source Evidence Inspector
              </span>
              <h2
                id="source-inspector-title"
                className="mt-1 text-base font-semibold text-[#eeeeee]"
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
            <span className="font-mono text-[11px] text-[#b8b8b8]">
              {verificationMethodLabel}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#b8b8b8]">{status.description}</p>

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
                <mark className="rounded bg-[#1D5FBF] px-1 py-0.5 font-bold text-white">
                  {source.exactSnippet}
                </mark>
              </div>
              <label htmlFor="quote-check-input" className="mt-4 block text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Check whether this quote appears in this handover’s source record
              </label>
              <textarea
                id="quote-check-input"
                value={quoteToCheck}
                onChange={(event) => { setQuoteToCheck(event.target.value); setQuoteCheck(null); setQuoteCheckError('') }}
                rows={3}
                maxLength={8000}
                className="mt-2 min-h-20 w-full rounded-[4px] border border-[#363636] bg-[#121212] p-3 font-mono text-xs leading-relaxed text-[#eeeeee] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              />
              <button
                type="button"
                onClick={verifyQuote}
                disabled={checkingQuote || !quoteToCheck.trim()}
                className="mt-3 min-hit rounded-[4px] border border-[#262626] bg-[#eeeeee] px-3 py-2 text-xs font-semibold text-[#121212] disabled:opacity-50"
              >
                {checkingQuote ? 'Checking quote…' : 'Check quote'}
              </button>
              {quoteCheck && (
                <p className={`mt-3 rounded-[4px] border p-3 text-xs leading-relaxed ${quoteCheck.isExactMatch ? 'border-[#28543a] bg-[#14281c] text-[#b7f0c8]' : 'border-[#5b3a20] bg-[#2c2010] text-[#f8d28a]'}`} role="status">
                  <strong>{quoteCheck.isExactMatch ? `Exact text found · characters ${quoteCheck.charStart + 1}–${quoteCheck.charEnd}` : 'No exact text match'}</strong>
                  <span className="mt-1 block">{quoteCheck.explanation} {quoteCheck.isExactMatch ? 'This confirms text presence only; it does not prove the full claim is true.' : 'No claim record is changed by this check.'}</span>
                </p>
              )}
              {quoteCheckError && <p className="mt-3 text-xs text-[#f87171]" role="alert">{quoteCheckError}</p>}
              <p className="mt-2 text-[11px] leading-relaxed text-[#6B6B6B]">{isImported ? 'This checks the text imported from GitHub. It confirms text presence only; it does not prove the full claim is true.' : 'This checks this handover’s stored source text. It confirms text presence only; it does not prove the full claim is true or update the claim’s status.'}</p>
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
                Who can view: <span className="font-medium text-[#0A0A0A]">{clearanceLabel(source.requiredClearanceLevel)}</span>
              </div>
              <div className="pt-2">
                <span className="block font-medium text-[#0A0A0A]">{isImported ? 'Imported source · link back to origin' : 'Illustrative source reference · synthetic, not connected'}</span>
                <code className="mt-1 block break-all text-[11px]">{source.uri}</code>
                {source.uri.startsWith('http') && (
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1D5FBF] underline-offset-2 hover:underline"
                  >
                    Open origin <ExternalLink size={11} aria-hidden="true" />
                  </a>
                )}
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
