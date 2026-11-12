'use client'

import { useState } from 'react'
import { Download, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import type { ImportJobDTO, SourceMeta, ViewerIdentity } from '@/lib/types'

/**
 * GitHub import panel — Improvement 2.
 * Lead and successor can import pull requests and commits from a real
 * repository into this handover. Errors and unsupported source types are
 * shown explicitly (promised in the Round 2 form).
 */
export default function ImportPanel({
  viewer,
  sources,
  imports,
  pending,
  onImport,
}: {
  viewer: ViewerIdentity | null
  sources: SourceMeta[]
  imports: ImportJobDTO[]
  pending: string | null
  onImport: (repo: string) => Promise<{ ok: boolean; message?: string }>
}) {
  const [repo, setRepo] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  const canImport = viewer?.role === 'lead' || viewer?.role === 'successor'
  const importedCount = sources.filter((source) => source.origin === 'github_import').length

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!repo.trim()) return
    setFeedback(null)
    const result = await onImport(repo.trim())
    if (result.ok) {
      setFeedback({ ok: true, message: `Import finished. ${importedCount >= 0 ? 'Sources, claims and open-PR work items are refreshed below.' : ''}` })
      setRepo('')
    } else {
      setFeedback({ ok: false, message: result.message ?? 'The import failed.' })
    }
  }

  return (
    <section className="view-stack" aria-labelledby="import-title">
      <section className="data-card">
        <div className="card-heading">
          <div>
            <h2 id="import-title">Sources &amp; GitHub import</h2>
            <p>Refresh this handover from real project records. Imports are read-only against GitHub.</p>
          </div>
          <span className="state-label">{sources.length} sources · {importedCount} imported</span>
        </div>

        {canImport ? (
          <form className="import-form" onSubmit={submit}>
            <label htmlFor="import-repo">Repository</label>
            <div className="import-form-row">
              <input
                id="import-repo"
                value={repo}
                onChange={(event) => setRepo(event.target.value)}
                placeholder="owner/name — e.g. 26f2000861-AV/baton"
                maxLength={200}
              />
              <button className="primary-action" type="submit" disabled={!repo.trim() || pending === 'import'}>
                {pending === 'import' ? (
                  <><RefreshCw size={14} className="spin" aria-hidden="true" /> Importing…</>
                ) : (
                  <><Download size={14} aria-hidden="true" /> Import</>
                )}
              </button>
            </div>
            <p className="import-capability-line">
              Supported: GitHub pull requests &amp; commits (public, or private with the repo scope).
              Not yet supported: GitHub issues, Slack, Linear, Jira.
            </p>
          </form>
        ) : (
          <p className="sample-notice">
            Importing is available to the lead and successor seats on this handover. Your seat: leaver —
            your lane is answering the interview and attesting knowledge.
          </p>
        )}

        {feedback && (
          <p className={`import-feedback ${feedback.ok ? 'ok' : 'error'}`} role="status">
            {feedback.ok ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertCircle size={14} aria-hidden="true" />}{' '}
            {feedback.message}
          </p>
        )}

        {imports.length > 0 && (
          <div className="import-jobs" aria-label="Import history">
            <table className="import-table">
              <thead>
                <tr>
                  <th scope="col">Repository</th>
                  <th scope="col">Status</th>
                  <th scope="col">Result</th>
                  <th scope="col">Started</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((job) => (
                  <tr key={job.id} className={job.status === 'failed' ? 'import-failed-row' : ''}>
                    <td><code>{job.repoOwner}/{job.repoName}</code></td>
                    <td>
                      <span className={`state-label import-status-${job.status}`}>
                        {job.status === 'succeeded' ? 'Succeeded' : job.status === 'failed' ? 'Failed' : 'Running…'}
                      </span>
                    </td>
                    <td>
                      {job.status === 'failed'
                        ? job.error
                        : `${job.prCount} PRs · ${job.commitCount} commits · ${job.claimCount} claims`}
                    </td>
                    <td>{new Date(job.startedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="data-card">
        <div className="card-heading">
          <div>
            <h2>Source records</h2>
            <p>Seeded sample records plus everything imported from GitHub, with links back to origin.</p>
          </div>
        </div>
        {sources.length === 0 ? (
          <p className="empty-state">No sources yet. Import a repository above to bring in real pull requests and commits.</p>
        ) : (
          <div className="source-list">
            {sources.map((source) => (
              <div className="source-list-row" key={source.legacyId}>
                <div className="source-list-copy">
                  <strong>{source.title}</strong>
                  <small>
                    <code>{source.legacyId}</code> · {source.author} ·{' '}
                    {new Date(source.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ·{' '}
                    <span className={`origin-pill origin-${source.origin}`}>
                      {source.origin === 'seed' ? 'Seed' : 'GitHub import'}
                    </span>
                  </small>
                </div>
                {source.uri.startsWith('http') && (
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-action">
                    Open origin <ExternalLink size={11} aria-hidden="true" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
