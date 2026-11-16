import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, clearanceForRole, requireMembership, requireSession } from '@/lib/authz'
import { serializeSourceMeta } from '@/lib/serializers'

/**
 * Full source record content for the inspector drawer (on-demand, so the
 * state payload stays lean). Members only; restricted and confidential
 * sources require sufficient role clearance.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string; legacyId: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)

    const row = await prisma.sourceRecord.findUnique({
      where: { handoverId_legacyId: { handoverId: handover.id, legacyId: params.legacyId } },
    })
    if (!row) {
      return NextResponse.json(
        { error: { code: 'SOURCE_NOT_FOUND', message: 'That source was not found.' } },
        { status: 404 }
      )
    }

    const memberClearance = clearanceForRole(membership.role)

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

    if (
      row.requiredClearanceLevel === 'confidential_lead' &&
      memberClearance !== 'confidential_lead'
    ) {
      return NextResponse.json(
        {
          error: {
            code: 'SOURCE_RESTRICTED',
            message: 'This source requires team lead clearance.',
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
