import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireSession } from '@/lib/authz'
import { verifyQuoteAgainstSource } from '@/lib/verifier'

/**
 * Handover-scoped quote verification (Improvement 2 + 3 glue).
 * Same deterministic engine as Round 2, now checking against THIS handover's
 * source records (seeded + GitHub-imported). Members only. Restricted sources
 * stay blocked for every role — matching the Round 2 public verifier policy.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover } = await requireMembership(params.id, session.userId)

    const body: unknown = await req.json().catch(() => null)
    const { sourceId, quoteSnippet } = (body ?? {}) as Record<string, unknown>
    if (
      typeof sourceId !== 'string' ||
      sourceId.length > 100 ||
      typeof quoteSnippet !== 'string' ||
      quoteSnippet.length === 0 ||
      quoteSnippet.length > 8000
    ) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid verification request.' } },
        { status: 400 }
      )
    }

    const row = await prisma.sourceRecord.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: sourceId } },
    })
    if (!row) {
      return NextResponse.json(
        { error: { code: 'SOURCE_NOT_FOUND', message: `Source "${sourceId}" was not found in this handover.` } },
        { status: 404 }
      )
    }
    if (row.requiredClearanceLevel === 'restricted_hr_legal' || row.requiredClearanceLevel === 'confidential_lead') {
      return NextResponse.json(
        {
          error: {
            code: 'SOURCE_RESTRICTED',
            message: 'This source is restricted and cannot be inspected in the verifier.',
          },
        },
        { status: 403 }
      )
    }

    const deterministicCheck = verifyQuoteAgainstSource(row.content, quoteSnippet)
    return NextResponse.json({
      deterministicCheck,
      rawSourceMeta: {
        id: row.legacyId,
        title: row.title,
        uri: row.uri,
        author: row.author,
        timestamp: row.timestamp,
        requiredClearanceLevel: row.requiredClearanceLevel,
        origin: row.origin,
      },
    })
  } catch (error) {
    return authzErrorResponse(error)
  }
}
