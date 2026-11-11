'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  INITIAL_CLAIMS,
  INITIAL_CONTRADICTIONS,
  INITIAL_DECISIONS,
  INITIAL_OWNERSHIP,
  INITIAL_QUESTIONS,
  INITIAL_UNFINISHED,
} from '../data/seedCase'
import { compileClaimsForPersona, PERSONA_PROFILES } from './personaCompiler'
import {
  ArchitecturalDecision,
  Claim,
  ContradictionItem,
  HandoverSectionState,
  LeaverInterviewQuestion,
  OwnershipAsset,
  PersonaProfile,
  PersonaRole,
  SuccessorQuery,
  UnfinishedWorkItem,
  WorkUpdate,
} from './types'

interface HandoverContextType {
  activePersona: PersonaProfile
  setActivePersonaRole: (role: PersonaRole) => void
  claims: Claim[]
  visibleClaims: Claim[]
  withheldCount: number
  withheldDetails: {
    claimId: string
    statement: string
    requiredClearance: string
    reason: string
  }[]
  decisions: ArchitecturalDecision[]
  workUpdates: WorkUpdate[]
  unfinished: UnfinishedWorkItem[]
  ownership: OwnershipAsset[]
  contradictions: ContradictionItem[]
  questions: LeaverInterviewQuestion[]
  queries: SuccessorQuery[]
  sectionStates: Record<string, HandoverSectionState>
  storageIssue: boolean
  answerInterviewQuestion: (questionId: string, answerText: string) => void
  resolveContradiction: (
    contradictionId: string,
    resolutionType: 'accept_source_a' | 'accept_source_b' | 'accept_dual_scope' | 'clarification_note',
    humanComment: string
  ) => void
  adoptUnfinishedItem: (itemId: string) => void
  acceptSection: (sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks') => void
  undoSectionAcceptance: (sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks') => void
  captureWorkUpdate: (update: Omit<WorkUpdate, 'id' | 'capturedBy' | 'capturedAt'>) => void
  submitSuccessorQuery: (
    claimId: string,
    category: SuccessorQuery['queryCategory'],
    queryText: string
  ) => void
  resolveSuccessorQuery: (queryId: string, responseText: string) => void
  resetDemoData: () => void
}

const HandoverContext = createContext<HandoverContextType | null>(null)
const DEMO_STORAGE_KEY = 'baton-demo-state-v1'
const DEMO_STORAGE_VERSION = 2

interface DemoSnapshot {
  version: number
  activeRole: PersonaRole
  claims: Claim[]
  decisions: ArchitecturalDecision[]
  workUpdates: WorkUpdate[]
  unfinished: UnfinishedWorkItem[]
  ownership: OwnershipAsset[]
  contradictions: ContradictionItem[]
  questions: LeaverInterviewQuestion[]
  queries: SuccessorQuery[]
  sectionStates: Record<string, HandoverSectionState>
}

function isDemoSnapshot(value: unknown): value is DemoSnapshot {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Partial<DemoSnapshot>
  return (snapshot.version === 1 || snapshot.version === DEMO_STORAGE_VERSION) &&
    ['successor', 'leaver', 'lead'].includes(snapshot.activeRole ?? '') &&
    Array.isArray(snapshot.claims) && Array.isArray(snapshot.decisions) &&
    Array.isArray(snapshot.unfinished) && Array.isArray(snapshot.ownership) &&
    Array.isArray(snapshot.contradictions) && Array.isArray(snapshot.questions) &&
    Array.isArray(snapshot.queries) &&
    (snapshot.workUpdates === undefined || Array.isArray(snapshot.workUpdates)) &&
    Boolean(snapshot.sectionStates) &&
    typeof snapshot.sectionStates === 'object'
}

export function HandoverProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<PersonaRole>('successor')
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS)
  const [decisions, setDecisions] = useState<ArchitecturalDecision[]>(INITIAL_DECISIONS)
  const [workUpdates, setWorkUpdates] = useState<WorkUpdate[]>([])
  const [unfinished, setUnfinished] = useState<UnfinishedWorkItem[]>(INITIAL_UNFINISHED)
  const [ownership, setOwnership] = useState<OwnershipAsset[]>(INITIAL_OWNERSHIP)
  const [contradictions, setContradictions] = useState<ContradictionItem[]>(INITIAL_CONTRADICTIONS)
  const [questions, setQuestions] = useState<LeaverInterviewQuestion[]>(INITIAL_QUESTIONS)
  const [queries, setQueries] = useState<SuccessorQuery[]>([])

  const [sectionStates, setSectionStates] = useState<Record<string, HandoverSectionState>>({
    decisions: { sectionId: 'decisions', isAccepted: false, queryCount: 0 },
    unfinished: { sectionId: 'unfinished', isAccepted: false, queryCount: 0 },
    ownership: { sectionId: 'ownership', isAccepted: false, queryCount: 0 },
    risks: { sectionId: 'risks', isAccepted: false, queryCount: 0 },
  })
  const [storageReady, setStorageReady] = useState(false)
  const [storageIssue, setStorageIssue] = useState(false)

  useEffect(() => {
    try {
      const rawSnapshot = window.localStorage.getItem(DEMO_STORAGE_KEY)
      if (rawSnapshot) {
        let parsed: unknown
        try { parsed = JSON.parse(rawSnapshot) } catch { parsed = null }
        if (isDemoSnapshot(parsed)) {
          setActiveRole(parsed.activeRole)
          setClaims(parsed.claims)
          setDecisions(parsed.decisions)
          setWorkUpdates(parsed.workUpdates ?? [])
          setUnfinished(parsed.unfinished)
          setOwnership(parsed.ownership)
          setContradictions(parsed.contradictions)
          setQuestions(parsed.questions)
          setQueries(parsed.queries)
          setSectionStates(parsed.sectionStates)
        } else {
          window.localStorage.removeItem(DEMO_STORAGE_KEY)
        }
      }
    } catch {
      setStorageIssue(true)
    } finally {
      setStorageReady(true)
    }
  }, [])

  useEffect(() => {
    if (!storageReady) return
    const snapshot: DemoSnapshot = {
      version: DEMO_STORAGE_VERSION,
      activeRole,
      claims,
      decisions,
      workUpdates,
      unfinished,
      ownership,
      contradictions,
      questions,
      queries,
      sectionStates,
    }
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(snapshot))
      setStorageIssue(false)
    } catch {
      setStorageIssue(true)
    }
  }, [activeRole, claims, decisions, workUpdates, unfinished, ownership, contradictions, questions, queries, sectionStates, storageReady])

  const activePersona = PERSONA_PROFILES[activeRole]

  // Dynamic reader-scoped compilation
  const { visibleClaims, withheldCount, withheldClaims } = compileClaimsForPersona(
    claims,
    activePersona
  )

  const answerInterviewQuestion = (questionId: string, answerText: string) => {
    const normalizedAnswer = answerText.trim()
    const question = questions.find((q) => q.id === questionId)
    if (!normalizedAnswer || !question || question.status !== 'pending_answer') return
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              status: 'answered',
              leaverResponse: {
                answeredBy: 'Alex Chen (Staff Engineer)',
                timestamp: new Date().toISOString(),
                responseText: normalizedAnswer,
              },
            }
          : q
      )
    )

    // Upgrade the associated claim to stated_by_leaver
    if (question?.associatedClaimId) {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === question.associatedClaimId
            ? {
                ...c,
                status: 'stated_by_leaver',
                verificationMethod: 'human_attested',
                history: [...(c.history ?? []), {
                  action: `Leaver attestation recorded: ${normalizedAnswer}`,
                  actor: 'Alex Chen (Staff Engineer)',
                  timestamp: new Date().toISOString(),
                }],
              }
            : c
        )
      )

      // Also update the decision rationale confidence if applicable
      setDecisions((prev) =>
        prev.map((d) =>
          d.associatedClaimId === question.associatedClaimId
            ? {
                ...d,
                provenance: {
                  ...d.provenance,
                  rationaleConfidence: 'stated_by_leaver',
                },
              }
            : d
        )
      )
    }
  }

  const resolveContradiction = (
    contradictionId: string,
    resolutionType: 'accept_source_a' | 'accept_source_b' | 'accept_dual_scope' | 'clarification_note',
    humanComment: string
  ) => {
    if (activeRole !== 'lead' || !humanComment.trim()) return
    setContradictions((prev) =>
      prev.map((c) =>
        c.id === contradictionId
          ? {
              ...c,
              status: resolutionType === 'clarification_note' ? 'open_unresolved' : 'settled_by_human',
              settlement: {
                resolvedBy: 'Vikram Malhotra (Lead)',
                resolutionTimestamp: new Date().toISOString(),
                resolutionType,
                humanComment,
              },
            }
          : c
      )
    )

    // Update associated claim to confirmed_by_lead
    const item = contradictions.find((c) => c.id === contradictionId)
    if (item?.associatedClaimId) {
      const settledSource = resolutionType === 'accept_source_b'
        ? 'Accepted Source B: RabbitMQ is the active live fallback.'
        : resolutionType === 'accept_source_a'
          ? 'Accepted Source A: AWS SQS FIFO is primary.'
          : resolutionType === 'accept_dual_scope'
            ? 'Resolved scope: AWS SQS FIFO remains primary; RabbitMQ handles temporary retry fallback.'
            : 'Lead clarification recorded; source precedence remains explicitly unresolved.'

      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === item.associatedClaimId
            ? {
                ...claim,
                status: resolutionType === 'clarification_note' ? 'conflicting' : 'confirmed_by_lead',
                verificationMethod: 'human_attested',
                history: [...(claim.history ?? []), {
                  action: `${settledSource} Note: ${humanComment.trim()}`,
                  actor: 'Vikram Malhotra (Lead)',
                  timestamp: new Date().toISOString(),
                }],
              }
            : claim
        )
      )
    }
  }

  const adoptUnfinishedItem = (itemId: string) => {
    setUnfinished((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: item.status === 'ready_to_merge' ? 'adopted' : 'ready_to_merge',
            }
          : item
      )
    )
  }

  const acceptSection = (sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks') => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        isAccepted: true,
        acceptedAt: new Date().toISOString(),
        acceptedBy: activePersona.name,
      },
    }))
  }

  const undoSectionAcceptance = (sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks') => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], isAccepted: false, acceptedAt: undefined, acceptedBy: undefined },
    }))
  }

  const captureWorkUpdate = (update: Omit<WorkUpdate, 'id' | 'capturedBy' | 'capturedAt'>) => {
    const decisionText = update.decisionText.trim()
    const rationale = update.rationale.trim()
    if (!decisionText || !rationale) return

    const captured: WorkUpdate = {
      ...update,
      decisionText,
      rationale,
      nextAction: update.nextAction.trim(),
      sourceReference: update.sourceReference.trim(),
      id: `update_${crypto.randomUUID()}`,
      capturedBy: activePersona.name,
      capturedAt: new Date().toISOString(),
    }
    setWorkUpdates((current) => [captured, ...current])
  }

  const submitSuccessorQuery = (
    claimId: string,
    category: SuccessorQuery['queryCategory'],
    queryText: string
  ) => {
    if (activeRole !== 'successor' || !queryText.trim() || !visibleClaims.some((claim) => claim.id === claimId)) return

    const newQuery: SuccessorQuery = {
      id: `query_${crypto.randomUUID()}`,
      claimId,
      successorId: 'priya_01',
      successorName: `${activePersona.name} (Successor)`,
      timestamp: new Date().toISOString(),
      queryCategory: category,
      queryText: queryText.trim(),
      status: 'open_pending_reply',
      assignedRespondent: {
        name: 'Vikram Malhotra',
        role: 'engineering_lead',
        slackHandle: '@vmalhotra',
      },
    }

    setQueries((prev) => [newQuery, ...prev])

    // Find claim section and increment query count
    const claim = claims.find((c) => c.id === claimId)
    if (claim) {
      setSectionStates((prev) => ({
        ...prev,
        [claim.sectionId]: {
          ...prev[claim.sectionId],
          queryCount: (prev[claim.sectionId]?.queryCount || 0) + 1,
        },
      }))
    }
  }

  const resolveSuccessorQuery = (queryId: string, responseText: string) => {
    setQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              status: 'resolved',
              resolution: {
                answeredBy: activePersona.name,
                responseSnippet: responseText,
                timestamp: new Date().toISOString(),
              },
            }
          : q
      )
    )
  }

  const resetDemoData = () => {
    setClaims(INITIAL_CLAIMS)
    setDecisions(INITIAL_DECISIONS)
    setWorkUpdates([])
    setUnfinished(INITIAL_UNFINISHED)
    setOwnership(INITIAL_OWNERSHIP)
    setContradictions(INITIAL_CONTRADICTIONS)
    setQuestions(INITIAL_QUESTIONS)
    setQueries([])
    setSectionStates({
      decisions: { sectionId: 'decisions', isAccepted: false, queryCount: 0 },
      unfinished: { sectionId: 'unfinished', isAccepted: false, queryCount: 0 },
      ownership: { sectionId: 'ownership', isAccepted: false, queryCount: 0 },
      risks: { sectionId: 'risks', isAccepted: false, queryCount: 0 },
    })
    setActiveRole('successor')
  }

  return (
    <HandoverContext.Provider
      value={{
        activePersona,
        setActivePersonaRole: setActiveRole,
        claims,
        visibleClaims,
        withheldCount,
        withheldDetails: withheldClaims,
        decisions,
        workUpdates,
        unfinished,
        ownership,
        contradictions,
        questions,
        queries,
        sectionStates,
        storageIssue,
        answerInterviewQuestion,
        resolveContradiction,
        adoptUnfinishedItem,
        acceptSection,
        undoSectionAcceptance,
        captureWorkUpdate,
        submitSuccessorQuery,
        resolveSuccessorQuery,
        resetDemoData,
      }}
    >
      {children}
    </HandoverContext.Provider>
  )
}

export function useHandover() {
  const context = useContext(HandoverContext)
  if (!context) {
    throw new Error('useHandover must be used within a HandoverProvider')
  }
  return context
}
