import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { ACTIVITY_ACTIONS } from '@/lib/activity'
import { verifyQuoteAgainstSource } from '@/lib/verifier'

/**
 * Capture a shared work-history entry (Improvement 3).
 * Any member may capture. The author is the REAL signed-in user. Optional
 * evidence: link to a source record in this handover + a quote; the server
 * verifies the quote verbatim against that source at capture time and stores
 * the result — the author can never influence the machine-check block.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead', 'successor', 'leaver'])

    const body: unknown = await req.json().catch(() => null)
    const {
      decisionText,
      rationale,
      nextAction,
      sourceReference,
      linkedSourceId,
      quote,
    } = (body ?? {}) as Record<string, unknown>

    const decision = typeof decisionText === 'string' ? decisionText.trim() : ''
    const why = typeof rationale === 'string' ? rationale.trim() : ''
    const next = typeof nextAction === 'string' ? nextAction.trim() : ''
    const ref = typeof sourceReference === 'string' ? sourceReference.trim() : ''
    const quoteText = typeof quote === 'string' ? quote.trim() : ''

    if (!decision || !why || decision.length > 4000 || why.length > 4000) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'What changed and why are required (max 4000 characters each).',
          },
        },
        { status: 400 }
      )
    }
    if (next.length > 2000 || ref.length > 2000 || quoteText.length > 8000) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Next action, reference or quote is too long.' } },
        { status: 400 }
      )
    }

    let linkedSourceRow = null
    if (linkedSourceId !== undefined && linkedSourceId !== null) {
      if (typeof linkedSourceId !== 'string' || !linkedSourceId) {
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'linkedSourceId must be a non-empty string or null.' } },
          { status: 400 }
        )
      }
      linkedSourceRow = await prisma.sourceRecord.findUnique({
        where: { handoverId_legacyId: { handoverId: handover.id, legacyId: linkedSourceId } },
      })
      if (!linkedSourceRow) {
        return NextResponse.json(
          {
            error: {
              code: 'SOURCE_NOT_FOUND',
              message: 'That source record was not found in this handover.',
            },
          },
          { status: 404 }
        )
      }
    }

    // Machine verification — computed here, stored, never editable by the author.
    let verification: string | undefined
    if (linkedSourceRow && quoteText) {
      const result = verifyQuoteAgainstSource(linkedSourceRow.content, quoteText)
      verification = JSON.stringify({
        state: 'checked',
        checkedAt: new Date().toISOString(),
        sourceLegacyId: linkedSourceRow.legacyId,
        sourceTitle: linkedSourceRow.title,
        isExactMatch: result.isExactMatch,
        charStart: result.charStart,
        charEnd: result.charEnd,
        explanation: result.explanation,
      })
    } else if (linkedSourceRow) {
      verification = JSON.stringify({
        state: 'linked_no_quote',
        sourceTitle: linkedSourceRow.title,
      })
    } else {
      verification = JSON.stringify({ state: 'no_evidence' })
    }

    await prisma.workUpdate.create({
      data: {
        handoverId: handover.id,
        authorId: session.userId,
        decisionText: decision,
        rationale: why,
        nextAction: next,
        sourceReference: ref,
        linkedSourceId: linkedSourceRow?.id ?? null,
        verification,
      },
    })

    await logActivity({
      handoverId: handover.id,
      actorId: session.userId,
      action: ACTIVITY_ACTIONS.workUpdateCaptured,
      detail: { decisionText: decision.slice(0, 120), linkedSourceId: linkedSourceRow?.legacyId ?? null },
    })
    return NextResponse.json(await getHandoverState(handover.id, session.userId))
  } catch (error) {
    return authzErrorResponse(error)
  }
}
