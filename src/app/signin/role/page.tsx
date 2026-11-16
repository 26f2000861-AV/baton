'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Check,
  RefreshCw,
  AlertCircle,
  FlaskConical,
  GitBranch,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import BatonMark from '@/components/BatonMark'
import ParticleBackground from '@/components/ui/ParticleBackground'
import GitHubRepoSelector from '@/components/GitHubRepoSelector'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { PersonaRole } from '@/lib/types'

type StartingPoint = 'sample' | 'real'
type Phase = 'choose' | 'creating' | 'importing' | 'import-failed'

const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

interface RoleDefinition {
  role: PersonaRole
  title: string
  description: string
  picks: string
  icon: typeof GitBranch
}

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: 'successor',
    title: 'Successor',
    description: 'Inherit the handover: review evidence, adopt unfinished work, ask questions, sign off section by section.',
    picks: 'Recommended for your first look — core scored workflow.',
    icon: GitBranch,
  },
  {
    role: 'leaver',
    title: 'Leaver',
    description: 'Answer the gap-driven interview and attest knowledge while you are still here.',
    picks: 'See what the departing engineer is asked before notice is given.',
    icon: LogOut,
  },
  {
    role: 'lead',
    title: 'Lead',
    description: 'Settle contradictions with decision notes, invite the team, import real GitHub repositories.',
    picks: 'Natural importer seat — create handover and pull in real repo.',
    icon: ShieldCheck,
  },
]

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
      setError('Please select or enter a valid repository as owner/name (e.g. facebook/react).')
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
      <div className="relative flex min-h-screen min-h-dvh items-center justify-center bg-[#0a0a0a] px-4">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#141416]/90 p-8 shadow-2xl backdrop-blur-xl">
          <BatonMark size="medium" />
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <RefreshCw size={13} className="animate-spin text-teal-400" />
            <span>Preparing your workspace…</span>
          </div>
        </div>
      </div>
    )
  }

  const busy = phase === 'creating' || phase === 'importing'
  const leaverBlocked = startingPoint === 'real'
  const isCtaDisabled = busy || (startingPoint === 'real' && !repo.trim())

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="relative flex min-h-screen min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-[#0a0a0a] px-4 py-8 sm:px-6 sm:py-12"
    >
      {/* Dynamic, lightweight ambient particle canvas */}
      <ParticleBackground />

      {/* Main Onboarding Container */}
      <div className="relative z-10 w-full max-w-[860px]">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#121215]/95 p-6 sm:p-9 shadow-[0_24px_64px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-white/[0.06]">
            <div className="flex-none pt-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-inner">
                <BatonMark size="medium" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Pick your starting point
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-300">
                  <Sparkles size={11} /> Onboarding
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-zinc-400 max-w-2xl">
                Your first Baton handover can start from the synthetic sample case or from a real
                GitHub repository. Either way, your seat is assigned on the server — and you can
                create more handovers in other seats any time.
              </p>
            </div>
          </div>

          {/* Section 1: Starting Point Selection */}
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 font-mono">
              1 · Choose Data Source
            </label>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
              role="radiogroup"
              aria-label="Choose your starting point"
            >
              {/* Card 1: Sample Handover Problems */}
              <button
                type="button"
                role="radio"
                aria-checked={startingPoint === 'sample'}
                onClick={() => selectStartingPoint('sample')}
                disabled={busy}
                className={`group relative flex flex-col justify-between text-left p-5 rounded-2xl border transition-all duration-200 ${
                  startingPoint === 'sample'
                    ? 'border-teal-500/70 bg-gradient-to-b from-teal-500/[0.08] to-transparent shadow-[0_0_24px_rgba(45,212,191,0.12)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        startingPoint === 'sample'
                          ? 'border-teal-400/40 bg-teal-400/15 text-teal-300'
                          : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 group-hover:text-white group-hover:border-white/20'
                      }`}
                    >
                      <FlaskConical size={20} />
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        startingPoint === 'sample'
                          ? 'border-teal-400 bg-teal-400 text-black'
                          : 'border-white/[0.15] bg-transparent text-transparent group-hover:border-white/30'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight mb-1.5">
                    Sample handover problems
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    A private clone of the Helios synthetic case: seeded claims, one live conflict,
                    interview questions and verifiable sources. Zero setup — works immediately.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-teal-400/90 font-mono">
                    Recommended for reviewing the workflow
                  </span>
                </div>
              </button>

              {/* Card 2: A Real GitHub Repository */}
              <button
                type="button"
                role="radio"
                aria-checked={startingPoint === 'real'}
                onClick={() => selectStartingPoint('real')}
                disabled={busy}
                className={`group relative flex flex-col justify-between text-left p-5 rounded-2xl border transition-all duration-200 ${
                  startingPoint === 'real'
                    ? 'border-teal-500/70 bg-gradient-to-b from-teal-500/[0.08] to-transparent shadow-[0_0_24px_rgba(45,212,191,0.12)]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        startingPoint === 'real'
                          ? 'border-teal-400/40 bg-teal-400/15 text-teal-300'
                          : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 group-hover:text-white group-hover:border-white/20'
                      }`}
                    >
                      <svg
                        viewBox="0 0 98 96"
                        width="20"
                        height="20"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                        />
                      </svg>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        startingPoint === 'real'
                          ? 'border-teal-400 bg-teal-400 text-black'
                          : 'border-white/[0.15] bg-transparent text-transparent group-hover:border-white/30'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight mb-1.5">
                    A real GitHub repository
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    An empty workspace filled live from a repository you choose: pull requests, commits,
                    deterministic claims, and open work items. Read-only import.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400 font-mono">
                    Proves the integration on real data
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: GitHub Repository Selector (Rendered conditionally when Real Repo is chosen) */}
          {startingPoint === 'real' && (
            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 font-mono">
                2 · Select Repository
              </label>
              <GitHubRepoSelector
                selectedRepo={repo}
                onSelectRepo={(selected) => {
                  setRepo(selected)
                  setError(null)
                }}
                disabled={busy}
                error={error}
              />
            </div>
          )}

          {/* Section 3: Highly Improved Role Picker */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                {startingPoint === 'real' ? '3 · Your Seat on Handover' : '2 · Your Seat on Handover'}
              </label>
              <span className="text-[11px] text-zinc-400">
                Assigned securely on the server
              </span>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-3.5"
              role="radiogroup"
              aria-label="Choose your role on the handover"
            >
              {ROLE_DEFINITIONS.map((card) => {
                const IconComponent = card.icon
                const isSelected = role === card.role
                const blocked = leaverBlocked && card.role === 'leaver'

                return (
                  <button
                    key={card.role}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-disabled={blocked}
                    disabled={busy || blocked}
                    onClick={() => !blocked && setRole(card.role)}
                    className={`group relative flex flex-col justify-between text-left p-5 rounded-2xl border transition-all duration-200 ${
                      blocked
                        ? 'opacity-40 border-white/[0.04] bg-white/[0.01] cursor-not-allowed'
                        : isSelected
                        ? 'border-teal-500/70 bg-gradient-to-b from-teal-500/[0.09] to-transparent shadow-[0_0_24px_rgba(45,212,191,0.12)]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      {/* Top row: Icon container + Checkmark indicator */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${
                            blocked
                              ? 'border-zinc-800 bg-zinc-900 text-zinc-600'
                              : isSelected
                              ? 'border-teal-400/40 bg-teal-400/15 text-teal-300 scale-105'
                              : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 group-hover:text-white group-hover:border-white/20'
                          }`}
                        >
                          <IconComponent size={20} strokeWidth={2.2} />
                        </div>

                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                            blocked
                              ? 'border-transparent bg-transparent text-transparent'
                              : isSelected
                              ? 'border-teal-400 bg-teal-400 text-black'
                              : 'border-white/[0.15] bg-transparent text-transparent group-hover:border-white/30'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>

                      {/* Role title */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4
                          className={`text-base font-bold tracking-tight ${
                            isSelected ? 'text-teal-200' : 'text-white'
                          }`}
                        >
                          {card.title}
                        </h4>
                        {card.role === 'successor' && (
                          <span className="rounded-md border border-teal-500/30 bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-300">
                            Core
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        {card.description}
                      </p>
                    </div>

                    {/* Bottom picks/note */}
                    <div className="pt-3 border-t border-white/[0.06]">
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        {blocked
                          ? 'Imports run from lead or successor seat — choose one of those for a real repository.'
                          : card.picks}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error Notice */}
          {error && startingPoint !== 'real' && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 text-xs text-red-300" role="alert">
              <AlertCircle size={16} className="flex-none text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Import Failed Rescue Action */}
          {phase === 'import-failed' ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-400 flex-none mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Import was not completed</h4>
                  <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                    The handover was created, but the repository import did not finish. The attempt is
                    recorded in its Sources panel where you can retry or inspect details.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={retryImport}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
                >
                  <RefreshCw size={14} /> Retry import
                </button>
                <button
                  type="button"
                  onClick={openWorkspaceAnyway}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  Open workspace anyway
                </button>
              </div>
            </div>
          ) : (
            /* Primary Action Button */
            <div className="space-y-4 pt-2">
              <button
                type="button"
                disabled={isCtaDisabled}
                onClick={start}
                className={`group relative flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 px-6 text-sm font-semibold transition-all duration-200 ${
                  isCtaDisabled
                    ? 'cursor-not-allowed border border-white/[0.06] bg-zinc-900/60 text-zinc-400'
                    : 'bg-white text-black hover:bg-zinc-100 hover:shadow-[0_8px_24px_rgba(255,255,255,0.12)] active:scale-[0.99]'
                }`}
              >
                {busy ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-teal-600" />
                    <span>
                      {phase === 'creating'
                        ? 'Creating your handover…'
                        : 'Importing pull requests and commits…'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {startingPoint === 'sample'
                        ? 'Create my sample handover'
                        : repo.trim()
                        ? `Create handover & import from ${repo.trim().split('/')[1] || repo.trim()}`
                        : 'Select a repository to continue'}
                    </span>
                    {!isCtaDisabled && (
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    )}
                  </>
                )}
              </button>

              {/* Footnote */}
              <p className="text-center text-[11px] leading-relaxed text-zinc-400">
                Every view, answer, and decision you record is saved on the server and shared with the
                members of your handover — across devices and browsers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
