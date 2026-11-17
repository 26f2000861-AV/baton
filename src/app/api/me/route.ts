import { NextResponse } from 'next/server'
import { authzErrorResponse, requireSession } from '@/lib/authz'
import { listHandoversForUser } from '@/lib/handoverService'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireSession()
    const handovers = await listHandoversForUser(session.userId)
    return NextResponse.json({
      user: {
        id: session.userId,
        name: session.name,
        githubLogin: session.githubLogin,
        image: session.image,
      },
      handovers,
    })
  } catch (error) {
    return authzErrorResponse(error)
  }
}
