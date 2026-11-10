'use client'

import React, { createContext, useContext, useState } from 'react'
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
  unfinished: UnfinishedWorkItem[]
  ownership: OwnershipAsset[]
  contradictions: ContradictionItem[]
  questions: LeaverInterviewQuestion[]
  queries: SuccessorQuery[]
  sectionStates: Record<string, HandoverSectionState>
  answerInterviewQuestion: (questionId: string, answerText: string) => void
  resolveContradiction: (
    contradictionId: string,
    resolutionType: 'accept_source_a' | 'accept_source_b' | 'clarification_note',
    humanComment: string
  ) => void
  adoptUnfinishedItem: (itemId: string) => void
  acceptSection: (sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks') => void
  undoSectionAcceptance: (sectionId: 'decisions' | 'unfinished' | 'ownership' | 'risks') => void
  submitSuccessorQuery: (
    claimId: string,
    category: SuccessorQuery['queryCategory'],
    queryText: string
  ) => void
  resolveSuccessorQuery: (queryId: string, responseText: string) => void
  resetDemoData: () => void
}

const HandoverContext = createContext<HandoverContextType | null>(null)

export function HandoverProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<PersonaRole>('successor')
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS)
  const [decisions, setDecisions] = useState<ArchitecturalDecision[]>(INITIAL_DECISIONS)
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
    resolutionType: 'accept_source_a' | 'accept_source_b' | 'clarification_note',
    humanComment: string
  ) => {
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

  const submitSuccessorQuery = (
    claimId: string,
    category: SuccessorQuery['queryCategory'],
    queryText: string
  ) => {
    if (activeRole !== 'successor' || !queryText.trim()) return

    const newQuery: SuccessorQuery = {
      id: `query_${crypto.randomUUID()}`,
      claimId,
      successorId: 'priya_01',
      successorName: `${activePersona.name} (Successor)`,
      timestamp: new Date().toISOString(),
      queryCategory: category,
      queryText,
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
        unfinished,
        ownership,
        contradictions,
        questions,
        queries,
        sectionStates,
        answerInterviewQuestion,
        resolveContradiction,
        adoptUnfinishedItem,
        acceptSection,
        undoSectionAcceptance,
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
