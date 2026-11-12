import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireSession } from '@/lib/authz'
import { serializeSourceMeta } from '@/lib/serializers'

/**
 * Full source record content for the inspector drawer (on-demand, so the
 * state payload stays lean). Members only; restricted sources are blocked —
 * the clearance compile already hides their claims, this closes the direct
 * read path.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string; legacyId: string } }
) {
  try {
    const session = await requireSession()
    const { handover } = await requireMembership(params.id, session.userId)

    const row = await prisma.sourceRecord.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: params.legacyId } },
    })
    if (!row) {
      return NextResponse.json(
        { error: { code: 'SOURCE_NOT_FOUND', message: 'That source was not found.' } },
        { status: 404 }
      )
    }
    if (row.requiredClearanceLevel === 'restricted_hr_legal') {
      return NextResponse.json(
        {
          error: {
            code: 'SOURCE_RESTRICTED',
            message: 'This source contains restricted records and cannot be inspected.',
          },
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ meta: serializeSourceMeta(row), content: row.content })
  } catch (error) {
    return authzErrorResponse(error)
  }
}
