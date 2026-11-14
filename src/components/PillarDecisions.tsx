'use client'

import { FormEvent, useState } from 'react'
import { FileText, Check, AlertCircle, ExternalLink, ChevronDown, ShieldCheck, ShieldAlert } from 'lucide-react'
import type { ArchitecturalDecision, SourceMeta, WorkUpdate } from '@/lib/types'
import type { CaptureWorkUpdateInput } from '@/lib/handoverStore'
import { sanitizeSafeUrl } from '@/lib/utils'

/**
 * Decisions pillar + the shared work-history capture form (Improvement 3).
 * The capture form records entries under the signed-in author and optionally
 * links evidence: a source record + a quote. The server verifies the quote and
 * the result is displayed as a separate machine-check block — never merged
 * with the author's explanation.
 */
export default function PillarDecisions({
  decisions,
  workUpdates,
  activeAuthor,
  syncError,
  sources,
  pending,
  onCapture,
  isAccepted,
  onInspect,
  onAccept,
  onUndo,
}: {
  decisions: ArchitecturalDecision[]
  workUpdates: WorkUpdate[]
  activeAuthor: string
  syncError: string | null
  sources: SourceMeta[]
  pending: string | null
  onCapture: (update: CaptureWorkUpdateInput) => Promise<boolean>
  isAccepted: boolean
  onInspect: (claimId: string) => void
  onAccept: () => void
  onUndo: () => void
}) {
  const [decisionText, setDecisionText] = useState('')
  const [rationale, setRationale] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [sourceReference, setSourceReference] = useState('')
  const [linkedSourceId, setLinkedSourceId] = useState('')
  const [quote, setQuote] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  const linkableSources = sources.filter(
    (source) => source.requiredClearanceLevel !== 'restricted_hr_legal'
  )

  const submitWorkUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!decisionText.trim() || !rationale.trim()) return
    const ok = await onCapture({
      decisionText,
      rationale,
      nextAction,
      sourceReference,
      linkedSourceId: linkedSourceId || null,
      quote: linkedSourceId ? quote : '',
    })
    if (ok) {
      setDecisionText('')
      setRationale('')
      setNextAction('')
      setSourceReference('')
      setLinkedSourceId('')
      setQuote('')
      setSavedMessage(
        'Saved to the shared handover history with your name. Linked quotes are machine-checked against the source separately.'
      )
    } else {
      setSavedMessage('')
    }
  }

  return (
    <section id="decisions" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-[#eeeeee]">
            Architecture decisions
          </h2>
          <p className="mt-1 text-xs text-[#a3a3a3]">
            Which major design choices were made, why, and which carry residual risk?
          </p>
        </div>
        <button
          onClick={isAccepted ? onUndo : onAccept}
          className={`min-hit flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-xs font-semibold transition ${
            isAccepted
              ? 'border border-white/20 bg-white/10 text-white'
              : 'border border-white/10 bg-[#18181c] text-white hover:bg-[#242428]'
          }`}
          aria-pressed={isAccepted}
          aria-label={isAccepted ? 'Undo architecture decisions review' : 'Mark architecture decisions reviewed'}
        >
          <Check size={14} />
          {isAccepted ? 'Undo review' : 'Mark reviewed'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {decisions.map((d) => {
          const isInferred = d.provenance.rationaleConfidence === 'inferred_ai'
          const rationaleLabel = isInferred
            ? 'Rationale inferred'
            : d.provenance.rationaleConfidence === 'stated_by_leaver'
              ? 'Leaver-stated rationale'
              : 'Rationale documented'
          return (
            <article
              key={d.id}
              className="ledger-panel flex flex-col justify-between transition hover:border-zinc-500"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#eeeeee]">
                    {d.id === 'dec_01' ? 'ADR-011' : 'COMMIT 77e2d'}
                  </span>
                  <span className="monochrome-pill">
                    {rationaleLabel}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-semibold leading-snug text-[#eeeeee]">
                  {d.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#a3a3a3]">
                  {d.context}
                </p>

                <div className="mt-4 rounded-[6px] border border-[#363636] bg-[#181818] p-3 text-xs text-[#eeeeee]">
                  <span className="block text-[11px] font-semibold text-[#a3a3a3]">Decision taken</span>
                  <p className="mt-0.5 font-medium">{d.decisionTaken}</p>
                </div>

                {d.tradeOffsAccepted && d.tradeOffsAccepted.length > 0 && (
                  <div className="mt-3 text-xs text-[#a3a3a3]">
                    <span className="font-semibold text-[#eeeeee]">Trade-offs accepted: </span>
                    {d.tradeOffsAccepted.join(' • ')}
                  </div>
                )}
              </div>

              {/* Signature Baton pass line connecting claim to source key */}
              <div className="mt-5 pt-3 border-t border-white/[0.08]">
                <div className="baton-pass-line">
                  <span className="text-xs text-[#a3a3a3]">
                    {isInferred ? (
                      <span className="flex items-center gap-1 font-medium text-[#eeeeee]">
                        <AlertCircle size={13} className="text-[#a3a3a3]" />
                        Rationale inferred from sample context ({d.provenance.exactQuote})
                      </span>
                    ) : (
                      <span className="evidence-signal font-medium text-emerald-400">
                        Rationale documented; claim support still needs review
                      </span>
                    )}
                  </span>
                  <div className="pass-rule" />
                  <button
                    onClick={() => onInspect(d.associatedClaimId)}
                    className="min-hit flex items-center gap-1 font-mono text-xs text-[#eeeeee] underline-offset-2 hover:underline"
                    title={`Inspect source evidence: ${d.provenance.sourceId}`}
                    aria-label={`Inspect source for ${d.provenance.sourceId}`}
                  >
                    <span>{d.provenance.sourceId}</span>
                    <ExternalLink size={12} className="text-[#a3a3a3]" />
                  </button>
                </div>
              </div>
            </article>
          )
        })}

        {/* 1.8M active-series Benchmark Fact Card - explicitly labeled 'unverified' */}
        <article className="ledger-panel lg:col-span-2 flex flex-col justify-between transition hover:border-zinc-500">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#eeeeee]">
                  BENCHMARK
                </span>
                <span className="monochrome-pill">Unverified</span>
              </div>
              <h3 className="mt-2 text-base font-semibold leading-snug text-[#eeeeee]">
                Ingest benchmark sustained 1.8M active series with headroom to 2.4M under simulated load
              </h3>
              <p className="mt-1 text-xs text-[#a3a3a3]">
                Sample data: Cited in the PR #142 summary discussion, but the synthetic stress-test run logs were uncommitted. Labeled unverified per review rules.
              </p>
            </div>
            <button
              onClick={() => onInspect('claim_04')}
              className="min-hit flex items-center gap-1.5 rounded-[6px] border border-white/10 bg-[#18181c] px-3 py-2 text-xs font-medium text-[#eeeeee] hover:bg-[#242428]"
              aria-label="Inspect benchmark evidence"
            >
              <FileText size={14} />
              <span>Inspect claim 04</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
            <div className="baton-pass-line">
              <span className="text-xs text-[#6B6B6B]">Paraphrase check required</span>
              <div className="pass-rule" />
              <span className="evidence-key">pr_142</span>
            </div>
          </div>
        </article>
        <section className="data-card work-capture-card lg:col-span-2" aria-labelledby="capture-update-title">
          <details id="work-update-capture" className="work-capture-details">
          <summary className="work-capture-summary">
            <div>
              <h3 id="capture-update-title">Capture a work update</h3>
              <p className="mt-1 text-xs text-[#8d8d8d]">Person-reported · saved to the shared history with your name · optional evidence is machine-checked</p>
            </div>
            <span>Open form <ChevronDown size={16} aria-hidden="true" /></span>
          </summary>
        <form className="work-capture-form" onSubmit={submitWorkUpdate}>
          <label htmlFor="work-update-decision">Decision or change <span aria-hidden="true">*</span></label>
          <input
            id="work-update-decision"
            value={decisionText}
            onChange={(event) => setDecisionText(event.target.value)}
            maxLength={180}
            placeholder="What changed or was decided?"
            required
          />
          <label htmlFor="work-update-rationale">Why? <span aria-hidden="true">*</span></label>
          <textarea
            id="work-update-rationale"
            value={rationale}
            onChange={(event) => setRationale(event.target.value)}
            maxLength={1200}
            rows={2}
            placeholder="What context or trade-off led to this?"
            required
          />
          <div className="work-capture-optional-fields">
            <div>
              <label htmlFor="work-update-next">Next action</label>
              <input
                id="work-update-next"
                value={nextAction}
                onChange={(event) => setNextAction(event.target.value)}
                maxLength={240}
                placeholder="What should happen next?"
              />
            </div>
            <div>
              <label htmlFor="work-update-source">Source reference <span className="work-capture-optional">Optional · free text</span></label>
              <input
                id="work-update-source"
                value={sourceReference}
                onChange={(event) => setSourceReference(event.target.value)}
                maxLength={240}
                placeholder="PR, issue, or document reference"
              />
            </div>
          </div>
          <div className="work-capture-optional-fields">
            <div>
              <label htmlFor="work-update-evidence">Link evidence <span className="work-capture-optional">Optional · machine-checked</span></label>
              <select
                id="work-update-evidence"
                value={linkedSourceId}
                onChange={(event) => { setLinkedSourceId(event.target.value); if (!event.target.value) setQuote('') }}
              >
                <option value="">No linked source</option>
                {linkableSources.map((source) => (
                  <option key={source.legacyId} value={source.legacyId}>
                    {source.legacyId} · {source.title.slice(0, 70)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="work-update-quote">
                Quote from that source <span className="work-capture-optional">Checked verbatim by the server</span>
              </label>
              <textarea
                id="work-update-quote"
                value={quote}
                onChange={(event) => setQuote(event.target.value)}
                maxLength={8000}
                rows={2}
                placeholder={linkedSourceId ? 'Paste the exact text you are citing' : 'Pick a source first'}
                disabled={!linkedSourceId}
              />
            </div>
          </div>
          <div className="work-capture-submit-row">
            <p>Recording as {activeAuthor} · visible to every member of this handover</p>
            <button className="primary-action" type="submit" disabled={!decisionText.trim() || !rationale.trim() || pending === 'capture'}>
              {pending === 'capture' ? 'Saving…' : 'Save update'}
            </button>
          </div>
          {savedMessage && <p className="work-capture-feedback" role="status">{savedMessage}</p>}
          {syncError && <p className="work-capture-feedback" role="alert">The update could not be saved: {syncError}</p>}
        </form>
        </details>
        {workUpdates.length > 0 ? (
          <div className="work-update-list" aria-label="Captured work updates">
            {workUpdates.slice(0, 5).map((update) => (
              <article className="work-update-item" key={update.id}>
                <time dateTime={update.capturedAt}>{new Date(update.capturedAt).toLocaleString()}</time>
                <div className="work-update-copy">
                  <h4>{update.decisionText}</h4>
                  <p>{update.rationale}</p>
                  {update.nextAction && <p><strong>Next:</strong> {update.nextAction}</p>}
                  {update.sourceReference && <code className="work-update-reference">{update.sourceReference}</code>}
                  {update.linkedSource && (
                    <p className="work-update-linked-source">
                      Evidence: <code>{update.linkedSource.legacyId}</code>
                      {update.linkedSource.sourceType.startsWith('github') && sanitizeSafeUrl(update.linkedSource.uri) && (
                        <a href={sanitizeSafeUrl(update.linkedSource.uri)!} target="_blank" rel="noopener noreferrer"> Open on GitHub <ExternalLink size={11} className="inline" aria-hidden="true" /></a>
                      )}
                    </p>
                  )}
                  {update.verification && (
                    <div className={`work-update-verification ${update.verification.state === 'checked' ? (update.verification.isExactMatch ? 'verified' : 'failed') : 'neutral'}`} aria-label="Machine verification result">
                      {update.verification.state === 'checked' && update.verification.isExactMatch && (
                        <p><ShieldCheck size={12} aria-hidden="true" /> Machine check: quote found verbatim in {update.verification.sourceTitle} (chars {update.verification.charStart}&ndash;{update.verification.charEnd}). Checked automatically &mdash; separate from the author&apos;s words above.</p>
                      )}
                      {update.verification.state === 'checked' && !update.verification.isExactMatch && (
                        <p><ShieldAlert size={12} aria-hidden="true" /> Machine check: quote NOT found verbatim in {update.verification.sourceTitle}. {update.verification.explanation}</p>
                      )}
                      {update.verification.state === 'linked_no_quote' && (
                        <p><ShieldAlert size={12} aria-hidden="true" /> Machine check: source linked, but no quote was provided to verify.</p>
                      )}
                      {update.verification.state === 'no_evidence' && (
                        <p><ShieldAlert size={12} aria-hidden="true" /> No source evidence attached — author-reported only.</p>
                      )}
                    </div>
                  )}
                </div>
                <span className="state-label">
                  {update.verification?.state === 'checked' && update.verification.isExactMatch
                    ? 'Author-reported · quote verified'
                    : 'Person-reported · not source-verified'}
                </span>
                <p className="work-update-author">Recorded by {update.author.name}{update.author.githubLogin ? ` (@${update.author.githubLogin})` : ''}</p>
              </article>
            ))}
            {workUpdates.length > 5 && <p className="card-foot">Showing the 5 most recent updates.</p>}
          </div>
        ) : (
          <p className="work-capture-empty">No work updates have been captured on this handover yet.</p>
        )}
      </section>

      </div>
    </section>
  )
}
