import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import type { LeaverInterviewQuestion } from '@/lib/types'

/**
 * Leaver answers an interview question (Improvement 1: leaver-only, enforced
 * server-side). Mirrors Round 2 semantics: question marked answered, the
 * associated claim upgraded to stated_by_leaver, matching decision rationale
 * confidence updated, claim history appended. The actor is the REAL signed-in
 * leaver — never free text.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['leaver'])

    const body: unknown = await req.json().catch(() => null)
    const { questionId, answerText } = (body ?? {}) as Record<string, unknown>
    const answer = typeof answerText === 'string' ? answerText.trim() : ''
    if (typeof questionId !== 'string' || !questionId || !answer || answer.length > 8000) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Provide questionId and a non-empty answer (max 8000 characters).' } },
        { status: 400 }
      )
    }

    const row = await prisma.leaverInterviewQuestion.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: questionId } },
    })
    if (!row) {
      return NextResponse.json(
        { error: { code: 'QUESTION_NOT_FOUND', message: 'That interview question was not found.' } },
        { status: 404 }
      )
    }
    const question = JSON.parse(row.payload) as LeaverInterviewQuestion
    if (question.status !== 'pending_answer') {
      return NextResponse.json(
        { error: { code: 'ALREADY_ANSWERED', message: 'That question has already been answered.' } },
        { status: 409 }
      )
    }

    const actorName = session.name ?? session.githubLogin ?? 'Leaver'
    const now = new Date().toISOString()

    question.status = 'answered'
    question.leaverResponse = {
      answeredBy: actorName,
      timestamp: now,
      responseText: answer,
    }
    await prisma.leaverInterviewQuestion.update({
      where: { id: row.id },
      data: { payload: JSON.stringify(question) },
    })

    if (question.associatedClaimId) {
      const claimRow = await prisma.claim.findUnique({
        where: { handoverId_legacyId: { handoverId: handover.id, legacyId: question.associatedClaimId } },
      })
      if (claimRow) {
        const history = claimRow.history ? JSON.parse(claimRow.history) : []
        await prisma.claim.update({
          where: { id: claimRow.id },
          data: {
            status: 'stated_by_leaver',
            verificationMethod: 'human_attested',
            history: JSON.stringify([
              ...history,
              { action: `Leaver attestation recorded: ${answer}`, actor: actorName, timestamp: now },
            ]),
          },
        })
      }
      // Matching decisions upgrade their rationale confidence.
      const decisions = await prisma.architecturalDecision.findMany({
        where: { handoverId: handover.id },
      })
      for (const decisionRow of decisions) {
        const decision = JSON.parse(decisionRow.payload)
        if (decision.associatedClaimId === question.associatedClaimId) {
          decision.provenance.rationaleConfidence = 'stated_by_leaver'
          await prisma.architecturalDecision.update({
            where: { id: decisionRow.id },
            data: { payload: JSON.stringify(decision) },
          })
        }
      }
    }

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.interviewAnswered,
      detail: { questionId, claimId: question.associatedClaimId },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
