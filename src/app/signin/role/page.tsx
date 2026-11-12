'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check, RefreshCw, AlertCircle } from 'lucide-react'
import BatonMark from '@/components/BatonMark'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { PersonaRole } from '@/lib/types'

type StartingPoint = 'sample' | 'real'
type Phase = 'choose' | 'creating' | 'importing' | 'import-failed'

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

const ROLE_CARDS: { role: PersonaRole; title: string; description: string; picks: string }[] = [
  {
    role: 'successor',
    title: 'Successor',
    description: 'Inherit the handover: review evidence, adopt unfinished work, ask questions, sign off section by section.',
    picks: 'Recommended for your first look — this is the core scored workflow.',
  },
  {
    role: 'leaver',
    title: 'Leaver',
    description: 'Answer the gap-driven interview and attest knowledge while you are still here.',
    picks: 'See what the departing engineer is asked before notice is even given.',
  },
  {
    role: 'lead',
    title: 'Lead',
    description: 'Settle contradictions with decision notes, invite the team, import real GitHub repositories.',
    picks: 'The natural importer seat — create the handover and pull in a real repository.',
  },
]

const STARTING_POINTS: { id: StartingPoint; title: string; description: string; tag: string }[] = [
  {
    id: 'sample',
    title: 'Sample handover problems',
    description:
      'A private clone of the Helios synthetic case: seeded claims, one live conflict, interview questions and verifiable sources. Zero setup — it works even if GitHub is unreachable.',
    tag: 'Recommended for reviewing the workflow',
  },
  {
    id: 'real',
    title: 'A real GitHub repository',
    description:
      'An empty workspace filled live from a repository you name: pull requests, commits, deterministic claims and open-PR work items. Read-only import via your GitHub connection.',
    tag: 'Proves the integration on real data',
  },
]

/**
 * First-login starting point screen — Improvement 1.
 * New members choose between the synthetic sample case and a real-repository
 * import before picking their seat. The seat is written to your membership on
 * the SERVER (not a client-side preview switch); imports run through the auth
 * fallback chain (your GitHub connection → a server token → the public API).
 */
export default function StartingPointPage() {
  const { status } = useSession()
  const router = useRouter()
  const [startingPoint, setStartingPoint] = useState<StartingPoint>('sample')
  const [role, setRole] = useState<PersonaRole>('successor')
  const [repo, setRepo] = useState('')
  const [phase, setPhase] = useState<Phase>('choose')
  const [handoverId, setHandoverId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap({ containerRef, isActive: true })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin')
      return
    }
    if (status !== 'authenticated') return
    // Members who already own a handover go straight to the workspace.
    fetch('/api/me', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : { handovers: [] }))
      .then((payload: { handovers?: { id: string }[] }) => {
        if (payload.handovers && payload.handovers.length > 0) {
          router.replace(`/workspace?h=${payload.handovers[0].id}`)
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [status, router])

  const selectStartingPoint = (point: StartingPoint) => {
    setStartingPoint(point)
    setError(null)
    // Imports require the lead or successor seat — move off the leaver seat.
    if (point === 'real' && role === 'leaver') {
      setRole('lead')
    }
  }

  const createHandover = async (): Promise<string | null> => {
    const isReal = startingPoint === 'real'
    const response = await fetch('/api/handovers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        isReal
          ? { fromTemplate: false, role, name: `${repo.trim()} — handover`.slice(0, 120) }
          : { fromTemplate: true, role }
      ),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload?.handover?.id) {
      setError(payload?.error?.message ?? 'The handover could not be created.')
      return null
    }
    return payload.handover.id as string
  }

  const runImport = async (id: string): Promise<boolean> => {
    const response = await fetch(`/api/handovers/${id}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: repo.trim() }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error?.message ?? 'The import failed before any data was written.')
      return false
    }
    return true
  }

  const start = async () => {
    setError(null)
    if (startingPoint === 'real' && !REPO_PATTERN.test(repo.trim())) {
      setError('Enter the repository as owner/name — for example 26f2000861-AV/baton.')
      return
    }
    setPhase('creating')
    try {
      const id = await createHandover()
      if (!id) {
        setPhase('choose')
        return
      }
      if (startingPoint === 'sample') {
        router.replace(`/workspace?h=${id}`)
        return
      }
      setHandoverId(id)
      setPhase('importing')
      const imported = await runImport(id)
      if (imported) {
        router.replace(`/workspace?h=${id}`)
      } else {
        setPhase('import-failed')
      }
    } catch {
      setError('Network problem — nothing was created. Check your connection and try again.')
      setPhase('choose')
    }
  }

  const retryImport = async () => {
    if (!handoverId) return
    setError(null)
    setPhase('importing')
    const imported = await runImport(handoverId).catch(() => false)
    if (imported) {
      router.replace(`/workspace?h=${handoverId}`)
    } else {
      setPhase('import-failed')
    }
  }

  const openWorkspaceAnyway = () => {
    if (handoverId) {
      router.replace(`/workspace?h=${handoverId}#/sources`)
    }
  }

  if (checking || status !== 'authenticated') {
    return (
      <div className="framed-app">
        <main className="signin-screen">
          <div className="signin-card signin-card-compact">
            <BatonMark />
            <p>Preparing your workspace…</p>
          </div>
        </main>
      </div>
    )
  }

  const busy = phase === 'creating' || phase === 'importing'
  const leaverBlocked = startingPoint === 'real'

  return (
    <div className="framed-app" ref={containerRef} tabIndex={-1}>
      <main className="signin-screen">
        <div className="signin-card signin-card-wide">
          <div className="signin-head">
            <BatonMark />
            <div>
              <h1>Pick your starting point</h1>
              <p>
                Your first Baton handover can start from the synthetic sample case or from a real
                GitHub repository. Either way, your seat is assigned on the server — and you can
                create more handovers in other seats any time.
              </p>
            </div>
          </div>

          <div className="starting-point-grid" role="radiogroup" aria-label="Choose your starting point">
            {STARTING_POINTS.map((point) => (
              <button
                key={point.id}
                type="button"
                role="radio"
                aria-checked={startingPoint === point.id}
                className={`starting-point-card ${startingPoint === point.id ? 'selected' : ''}`}
                onClick={() => selectStartingPoint(point.id)}
                disabled={busy}
              >
                <span className="starting-point-title">
                  {startingPoint === point.id && <Check size={14} aria-hidden="true" />}
                  {point.title}
                </span>
                <span className="starting-point-description">{point.description}</span>
                <span className="starting-point-tag">{point.tag}</span>
              </button>
            ))}
          </div>

          {startingPoint === 'real' && (
            <div className="real-repo-field">
              <label htmlFor="real-repo-input">Repository to import</label>
              <input
                id="real-repo-input"
                value={repo}
                onChange={(event) => {
                  setRepo(event.target.value)
                  setError(null)
                }}
                placeholder="owner/name — e.g. 26f2000861-AV/baton"
                maxLength={200}
                autoComplete="off"
                disabled={busy}
              />
              <p className="real-repo-note">
                Read-only: up to 30 recent pull requests and 50 commits become source records, with
                verbatim-quote claims. Authentication falls back automatically from your GitHub
                connection to a server token to the public API (60 req/h).
              </p>
            </div>
          )}

          <h2 className="seat-heading">Your seat</h2>
          <div className="role-picker-grid" role="radiogroup" aria-label="Choose your role on the handover">
            {ROLE_CARDS.map((card) => {
              const blocked = leaverBlocked && card.role === 'leaver'
              return (
                <button
                  key={card.role}
                  type="button"
                  role="radio"
                  aria-checked={role === card.role}
                  aria-disabled={blocked}
                  className={`role-picker-card ${role === card.role && !blocked ? 'selected' : ''}`}
                  onClick={() => !blocked && setRole(card.role)}
                  disabled={busy || blocked}
                >
                  <span className="role-picker-title">
                    {role === card.role && !blocked && <Check size={14} aria-hidden="true" />}
                    {card.title}
                  </span>
                  <span className="role-picker-description">{card.description}</span>
                  <span className="role-picker-picks">
                    {blocked
                      ? 'Imports run from the lead or successor seat — pick one of those for a real-repository start.'
                      : card.picks}
                  </span>
                </button>
              )
            })}
          </div>

          {error && (
            <p className="role-picker-error" role="alert">
              {error}
            </p>
          )}

          {phase === 'import-failed' ? (
            <div className="import-rescue">
              <p className="import-rescue-note">
                <AlertCircle size={14} aria-hidden="true" /> The handover was created, but the
                import did not complete. The failed attempt is recorded in its Sources panel.
              </p>
              <div className="import-rescue-actions">
                <button type="button" className="primary-action" onClick={retryImport}>
                  <RefreshCw size={14} aria-hidden="true" /> Retry import
                </button>
                <button type="button" className="secondary-action" onClick={openWorkspaceAnyway}>
                  Open workspace anyway
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="primary-action role-picker-create"
              onClick={start}
              disabled={busy}
            >
              {busy && <RefreshCw size={14} className="spin" aria-hidden="true" />}
              {phase === 'creating'
                ? 'Creating your handover…'
                : phase === 'importing'
                  ? 'Importing pull requests and commits…'
                  : startingPoint === 'sample'
                    ? 'Create my sample handover'
                    : 'Create handover & import from GitHub'}
            </button>
          )}

          <p className="role-picker-footnote">
            Every view, answer and decision you record is saved on the server and shared with the
            members of your handover — across devices and browsers.
          </p>
        </div>
      </main>
    </div>
  )
}
