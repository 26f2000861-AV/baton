'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  ActivityEntry,
  ArchitecturalDecision,
  Claim,
  ContradictionItem,
  HandoverSectionState,
  HandoverState,
  ImportJobDTO,
  LeaverInterviewQuestion,
  OwnershipAsset,
  PersonaRole,
  SourceMeta,
  SuccessorQuery,
  UnfinishedWorkItem,
  ViewerIdentity,
  WorkUpdate,
  WorkUpdateVerification,
} from './types'

/**
 * Server-backed handover store — Improvement 1 keystone.
 *
 * Round 2's localStorage store is fully replaced:
 *  - state hydrates from GET /api/handovers/{id} (server clearance-filters claims)
 *  - every mutation POSTs to a guarded API route and replaces local state with
 *    the server's authoritative response (no optimistic fake state — the UI
 *    marks the action pending until the server confirms)
 *  - the viewer's role comes from their Membership row, never client state
 *
 * No localStorage anywhere. Cross-device by construction.
 */

export interface CaptureWorkUpdateInput {
  decisionText: string
  rationale: string
  nextAction: string
  sourceReference: string
  linkedSourceId?: string | null
  quote?: string
}

interface HandoverContextType {
  handoverId: string | null
  state: HandoverState | null
  loading: boolean
  pending: string | null
  syncError: string | null
  clearSyncError: () => void
  viewer: ViewerIdentity | null
  visibleClaims: Claim[]
  withheldCount: number
  withheldDetails: HandoverState['withheldDetails']
  decisions: ArchitecturalDecision[]
  workUpdates: WorkUpdate[]
  unfinished: UnfinishedWorkItem[]
  ownership: OwnershipAsset[]
  contradictions: ContradictionItem[]
  questions: LeaverInterviewQuestion[]
  queries: SuccessorQuery[]
  sectionStates: Record<string, HandoverSectionState>
  members: HandoverState['members']
  activity: ActivityEntry[]
  sources: SourceMeta[]
  imports: ImportJobDTO[]
  handover: HandoverState['handover'] | null
  answerInterviewQuestion: (questionId: string, answerText: string) => Promise<boolean>
  resolveContradiction: (
    contradictionId: string,
    resolutionType:
      | 'accept_source_a'
      | 'accept_source_b'
      | 'accept_dual_scope'
      | 'clarification_note',
    humanComment: string
  ) => Promise<boolean>
  adoptUnfinishedItem: (itemId: string) => Promise<boolean>
  acceptSection: (sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks') => Promise<boolean>
  undoSectionAcceptance: (
    sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks'
  ) => Promise<boolean>
  captureWorkUpdate: (update: CaptureWorkUpdateInput) => Promise<boolean>
  submitSuccessorQuery: (
    claimId: string,
    category: SuccessorQuery['queryCategory'],
    queryText: string
  ) => Promise<boolean>
  resolveSuccessorQuery: (queryId: string, responseText: string) => Promise<boolean>
  resetHandover: () => Promise<boolean>
  runImport: (repo: string) => Promise<{ ok: boolean; message?: string }>
  inviteMember: (githubLogin: string, role: PersonaRole) => Promise<{ ok: boolean; message?: string }>
  claimLead: () => Promise<boolean>
  refresh: () => Promise<void>
  fetchSourceContent: (
    legacyId: string
  ) => Promise<{ meta: SourceMeta; content: string } | null>
  verifyQuote: (
    sourceId: string,
    quoteSnippet: string
  ) => Promise<{ ok: boolean; result?: unknown; message?: string }>
}

const HandoverContext = createContext<HandoverContextType | null>(null)

async function postJson(url: string, body: unknown, method: 'POST' | 'PATCH' = 'POST'): Promise<Response> {
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function HandoverProvider({
  handoverId,
  children,
}: {
  handoverId: string | null
  children: React.ReactNode
}) {
  const [state, setState] = useState<HandoverState | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(handoverId))
  const [pending, setPending] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [trackedId, setTrackedId] = useState<string | null>(handoverId)
  const handoverIdRef = useRef(handoverId)
  handoverIdRef.current = handoverId

  if (handoverId !== trackedId) {
    setTrackedId(handoverId)
    if (handoverId) {
      setLoading(true)
    }
  }

  const hydrate = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/handovers/${id}`, { cache: 'no-store' })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error?.message ?? 'The handover could not be loaded.')
      }
      setState(await response.json())
      setSyncError(null)
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'The handover could not be loaded.')
      setState(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (handoverId) {
      hydrate(handoverId)
    } else {
      setState(null)
      setLoading(false)
    }
  }, [handoverId, hydrate])

  /**
   * Shared mutation runner: marks the action pending, POSTs, replaces state
   * with the server's authoritative response. Server is the single source of
   * truth — no optimistic local writes that could drift from role rules.
   */
  const runMutation = useCallback(
    async (action: string, url: string, body: unknown, method: 'POST' | 'PATCH' = 'POST'): Promise<boolean> => {
      setPending(action)
      setSyncError(null)
      try {
        const response = await postJson(url, body, method)
        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          setSyncError(payload?.error?.message ?? 'The change could not be saved.')
          return false
        }
        // Role-change endpoints return { ok: true } instead of full state —
        // rehydrate from the server so the roster reflects the change.
        if (payload && typeof payload === 'object' && 'handover' in payload) {
          setState(payload as HandoverState)
        } else {
          await hydrate(url.split('/api/handovers/')[1]?.split('/')[0] ?? '')
        }
        return true
      } catch {
        setSyncError('Network problem — the change could not be saved. Check your connection and retry.')
        return false
      } finally {
        setPending(null)
      }
    },
    [hydrate]
  )

  const api = useMemo<Omit<HandoverContextType, 'state' | 'loading' | 'pending' | 'syncError' | 'handoverId'>>(
    () => ({
      clearSyncError: () => setSyncError(null),
      viewer: state?.me ?? null,
      visibleClaims: state?.visibleClaims ?? [],
      withheldCount: state?.withheldCount ?? 0,
      withheldDetails: state?.withheldDetails ?? [],
      decisions: state?.decisions ?? [],
      workUpdates: state?.workUpdates ?? [],
      unfinished: state?.unfinished ?? [],
      ownership: state?.ownership ?? [],
      contradictions: state?.contradictions ?? [],
      questions: state?.questions ?? [],
      queries: state?.queries ?? [],
      sectionStates: state?.sectionStates ?? {},
      members: state?.members ?? [],
      activity: state?.activity ?? [],
      sources: state?.sources ?? [],
      imports: state?.imports ?? [],
      handover: state?.handover ?? null,
      answerInterviewQuestion: (questionId, answerText) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation('interview', `/api/handovers/${id}/interview-answers`, {
          questionId,
          answerText,
        })
      },
      resolveContradiction: (contradictionId, resolutionType, humanComment) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation(
          'settle',
          `/api/handovers/${id}/contradictions/${encodeURIComponent(contradictionId)}/settle`,
          { resolutionType, humanComment }
        )
      },
      adoptUnfinishedItem: (itemId) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation(
          'adopt',
          `/api/handovers/${id}/unfinished/${encodeURIComponent(itemId)}/adopt`,
          {}
        )
      },
      acceptSection: (sectionId) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation('accept', `/api/handovers/${id}/sections/${sectionId}/accept`, {})
      },
      undoSectionAcceptance: (sectionId) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation('undo', `/api/handovers/${id}/sections/${sectionId}/undo`, {})
      },
      captureWorkUpdate: (update) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation('capture', `/api/handovers/${id}/work-updates`, update)
      },
      submitSuccessorQuery: (claimId, category, queryText) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation('query', `/api/handovers/${id}/queries`, {
          claimId,
          category,
          queryText,
        })
      },
      resolveSuccessorQuery: (queryId, responseText) => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation(
          'resolve-query',
          `/api/handovers/${id}/queries/${encodeURIComponent(queryId)}/resolve`,
          { responseText }
        )
      },
      resetHandover: () => {
        const id = handoverIdRef.current
        if (!id) return Promise.resolve(false)
        return runMutation('reset', `/api/handovers/${id}/reset`, {})
      },
      runImport: async (repo) => {
        const id = handoverIdRef.current
        if (!id) return { ok: false, message: 'No active handover.' }
        setPending('import')
        setSyncError(null)
        try {
          const response = await postJson(`/api/handovers/${id}/import`, { repo })
          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            // Refresh even on failure so the failed job row (with its error)
            // is immediately visible in the Sources panel — promised behaviour.
            void hydrate(id)
            return { ok: false, message: payload?.error?.message ?? 'The import failed.' }
          }
          await hydrate(id)
          return { ok: true }
        } catch {
          void hydrate(id)
          return { ok: false, message: 'Network problem — the import could not run.' }
        } finally {
          setPending(null)
        }
      },
      inviteMember: async (githubLogin, role) => {
        const id = handoverIdRef.current
        if (!id) return { ok: false, message: 'No active handover.' }
        setPending('invite')
        try {
          const response = await postJson(`/api/handovers/${id}/members`, {
            githubLogin,
            role,
          })
          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            return { ok: false, message: payload?.error?.message ?? 'The invite failed.' }
          }
          await hydrate(id)
          return { ok: true }
        } catch {
          return { ok: false, message: 'Network problem — the invite failed.' }
        } finally {
          setPending(null)
        }
      },
      claimLead: () => {
        const id = handoverIdRef.current
        const userId = state?.me.userId
        if (!id || !userId) return Promise.resolve(false)
        return runMutation(
          'claim-lead',
          `/api/handovers/${id}/members/${encodeURIComponent(userId)}`,
          { role: 'lead' },
          'PATCH'
        )
      },
      refresh: async () => {
        const id = handoverIdRef.current
        if (id) await hydrate(id)
      },
      fetchSourceContent: async (legacyId) => {
        const id = handoverIdRef.current
        if (!id) return null
        try {
          const response = await fetch(
            `/api/handovers/${id}/sources/${encodeURIComponent(legacyId)}`,
            { cache: 'no-store' }
          )
          if (!response.ok) return null
          return await response.json()
        } catch {
          return null
        }
      },
      verifyQuote: async (sourceId, quoteSnippet) => {
        const id = handoverIdRef.current
        if (!id) return { ok: false, message: 'No active handover.' }
        try {
          const response = await postJson(`/api/handovers/${id}/verify`, {
            sourceId,
            quoteSnippet,
          })
          const payload = await response.json().catch(() => null)
          if (!response.ok) {
            return { ok: false, message: payload?.error?.message ?? 'Verification failed.' }
          }
          return { ok: true, result: payload }
        } catch {
          return { ok: false, message: 'Network problem — verification failed.' }
        }
      },
    }),
    [state, runMutation, hydrate]
  )

  const value = useMemo<HandoverContextType>(
    () => ({ handoverId, state, loading, pending, syncError, ...api }),
    [handoverId, state, loading, pending, syncError, api]
  )

  return <HandoverContext.Provider value={value}>{children}</HandoverContext.Provider>
}

export function useHandover() {
  const context = useContext(HandoverContext)
  if (!context) {
    throw new Error('useHandover must be used within a HandoverProvider')
  }
  return context
}

/** Exposed for the capture-form's verification preview rendering. */
export type { WorkUpdateVerification }
