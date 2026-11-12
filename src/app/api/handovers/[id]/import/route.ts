import { NextResponse } from 'next/server'
import { authzErrorResponse, requireMembership, requireRole, requireSession } from '@/lib/authz'
import { getHandoverState, logActivity } from '@/lib/handoverService'
import { runImport, GitHubImportError } from '@/lib/github'
import { ACTIVITY_ACTIONS } from '@/lib/activity'

/**
 * Start a GitHub import for this handover (Improvement 2).
 * Lead or successor. Read-only against GitHub; writes source records,
 * deterministic claims and open-PR work items into THIS handover only.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const { handover, membership } = await requireMembership(params.id, session.userId)
    requireRole(membership, ['lead', 'successor'])

    const body: unknown = await req.json().catch(() => null)
    const { repo } = (body ?? {}) as Record<string, unknown>
    if (typeof repo !== 'string' || !repo.trim() || repo.length > 200) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Provide a repository as owner/name.' } },
        { status: 400 }
      )
    }

    try {
      const result = await runImport({
        handoverId: handover.id,
        userId: session.userId,
        repoInput: repo,
      })
      await logActivity({
        handoverId: handover.id,
        actorId: session.userId,
        action: ACTIVITY_ACTIONS.importCompleted,
        detail: {
          repo: `${result.prCount} PRs / ${result.commitCount} commits from ${repo.trim()}`,
          claims: result.claimCount,
        },
      })
      return NextResponse.json({ importResult: result })
    } catch (error) {
      if (error instanceof GitHubImportError) {
        return NextResponse.json(
          { error: { code: error.code, message: error.message } },
          { status: error.code === 'BAD_REPO_FORMAT' ? 400 : 502 }
        )
      }
      throw error
    }
  } catch (error) {
    return authzErrorResponse(error)
  }
}
