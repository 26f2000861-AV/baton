'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldAlert, ExternalLink, GitCommit, MessageSquare, CheckSquare, GitPullRequest, Users, Download, RotateCcw, FileText, HelpCircle, ArrowDownUp } from 'lucide-react'
import type { ActivityEntry, WorkUpdate } from '@/lib/types'
import { ACTION_LABELS } from '@/lib/activity'

/**
 * Shared, dated team history — Improvement 3.
 * Merged timeline of work-update entries and activity events. Author blocks
 * and machine checks render as separate regions (trust wedge: humans explain,
 * machines verify, never conflated).
 */
export default function HistoryView({
  workUpdates,
  activity,
}: {
  workUpdates: WorkUpdate[]
  activity: ActivityEntry[]
}) {
  const [filter, setFilter] = useState<'all' | 'entries' | 'activity'>('all')

  const timeline = [
    ...workUpdates.map((update) => ({
      kind: 'entry' as const,
      at: update.capturedAt,
      update,
    })),
    ...activity.map((event) => ({
      kind: 'activity' as const,
      at: event.createdAt,
      event,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .filter((item) => filter === 'all' || (filter === 'entries' ? item.kind === 'entry' : item.kind === 'activity'))

  return (
    <section className="view-stack" aria-labelledby="history-title">
      <section className="data-card">
        <div className="card-heading">
          <div>
            <h2 id="history-title">Shared work history</h2>
            <p>
              Every entry and every change on this handover, with its author and date — visible to all
              members on any device. Author explanations and machine checks are shown separately.
            </p>
          </div>
          <div className="filter-tabs" role="group" aria-label="Filter history">
            <button type="button" aria-pressed={filter === 'all'} className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            <button type="button" aria-pressed={filter === 'entries'} className={filter === 'entries' ? 'active' : ''} onClick={() => setFilter('entries')}>Entries</button>
            <button type="button" aria-pressed={filter === 'activity'} className={filter === 'activity' ? 'active' : ''} onClick={() => setFilter('activity')}>Activity</button>
          </div>
        </div>

        {timeline.length === 0 ? (
          <p className="empty-state">Nothing has happened on this handover yet.</p>
        ) : (
          <div className="history-timeline">
            {timeline.slice(0, 50).map((item) =>
              item.kind === 'entry' ? (
                <article className="history-entry" key={`entry-${item.update.id}`}>
                  <header>
                    {item.update.author.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.update.author.image} alt="" width={24} height={24} className="identity-avatar" />
                    ) : (
                      <span className="identity-avatar identity-avatar-fallback" aria-hidden="true">
                        {(item.update.author.name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <strong>{item.update.author.name}</strong>
                    <span className="history-verb">captured a work update</span>
                    <time dateTime={item.update.capturedAt}>{new Date(item.update.capturedAt).toLocaleString()}</time>
                  </header>
                  <div className="history-entry-body">
                    <p className="history-what"><strong>What changed:</strong> {item.update.decisionText}</p>
                    <p className="history-why"><strong>Why:</strong> {item.update.rationale}</p>
                    {item.update.nextAction && (
                      <p className="history-next"><strong>Follow-up:</strong> {item.update.nextAction}</p>
                    )}
                    {item.update.linkedSource && (
                      <p className="history-linked">
                        Evidence: <code>{item.update.linkedSource.legacyId}</code>
                        {item.update.linkedSource.uri.startsWith('http') && (
                          <a href={item.update.linkedSource.uri} target="_blank" rel="noopener noreferrer">
                            {' '}Open origin <ExternalLink size={11} aria-hidden="true" />
                          </a>
                        )}
                      </p>
                    )}
                    {item.update.verification && (
                      <div className={`work-update-verification ${item.update.verification.state === 'checked' ? (item.update.verification.isExactMatch ? 'verified' : 'failed') : 'neutral'}`}>
                        {item.update.verification.state === 'checked' && item.update.verification.isExactMatch && (
                          <p><ShieldCheck size={12} aria-hidden="true" /> Machine check: quote found verbatim in {item.update.verification.sourceTitle} (chars {item.update.verification.charStart}–{item.update.verification.charEnd}).</p>
                        )}
                        {item.update.verification.state === 'checked' && !item.update.verification.isExactMatch && (
                          <p><ShieldAlert size={12} aria-hidden="true" /> Machine check: quote NOT found verbatim in {item.update.verification.sourceTitle}.</p>
                        )}
                        {item.update.verification.state === 'linked_no_quote' && (
                          <p><ShieldAlert size={12} aria-hidden="true" /> Machine check: source linked, no quote provided.</p>
                        )}
                        {item.update.verification.state === 'no_evidence' && (
                          <p><ShieldAlert size={12} aria-hidden="true" /> No source evidence attached — author-reported only.</p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ) : (
                <article className="history-activity" key={`activity-${item.event.id}`}>
                  {item.event.actorImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.event.actorImage} alt="" width={20} height={20} className="identity-avatar" />
                  ) : (
                    <ActivityIcon action={item.event.action} />
                  )}
                  <span>
                    <strong>{item.event.actorName ?? 'A member'}</strong>{' '}
                    {ACTION_LABELS[item.event.action as keyof typeof ACTION_LABELS] ?? item.event.action}
                  </span>
                  <time dateTime={item.event.createdAt}>{new Date(item.event.createdAt).toLocaleString()}</time>
                </article>
              )
            )}
            {timeline.length > 50 && <p className="card-foot">Showing the 50 most recent events.</p>}
          </div>
        )}
      </section>
    </section>
  )
}

function ActivityIcon({ action }: { action: string }) {
  const size = 16
  if (action.startsWith('contradiction')) return <AlertIconHelper />
  if (action.startsWith('interview')) return <MessageSquare size={size} aria-hidden="true" />
  if (action.startsWith('section')) return <CheckSquare size={size} aria-hidden="true" />
  if (action.startsWith('item')) return <GitPullRequest size={size} aria-hidden="true" />
  if (action.startsWith('query')) return <HelpCircle size={size} aria-hidden="true" />
  if (action.startsWith('member')) return <Users size={size} aria-hidden="true" />
  if (action.startsWith('import')) return <Download size={size} aria-hidden="true" />
  if (action.startsWith('handover.reset')) return <RotateCcw size={size} aria-hidden="true" />
  if (action.startsWith('handover')) return <FileText size={size} aria-hidden="true" />
  if (action.startsWith('work_update')) return <GitCommit size={size} aria-hidden="true" />
  return <ArrowDownUp size={size} aria-hidden="true" />
}

function AlertIconHelper() {
  return <ShieldAlert size={16} aria-hidden="true" />
}
