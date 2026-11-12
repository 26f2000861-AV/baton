import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authzErrorResponse, requireMembership, requireSession } from '@/lib/authz'
import { serializeImportJob } from '@/lib/serializers'

/** Import job history for the Sources panel (members only). */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover } = await requireMembership(params.id, session.userId)
    const jobs = await prisma.importJob.findMany({
      where: { handoverId: handover.id },
      include: { startedBy: true },
      orderBy: { startedAt: 'desc' },
      take: 10,
    })
    return NextResponse.json({ imports: jobs.map(serializeImportJob) })
  } catch (error) {
    return authzErrorResponse(error)
  }
}
