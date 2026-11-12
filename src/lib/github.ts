import { prisma } from './db'
import {
  GitHubImportError,
  mapPullToSource,
  mapCommitToSource,
  buildClaimFromPull,
  buildUnfinishedFromOpenPull,
  parseRepoInput,
  type GhCommit,
  type GhPull,
} from './githubMappers'

/**
 * GitHub import orchestrator — Improvement 2.
 * Read-only REST v3: repository validation, pull requests, commits. Uses the
 * signed-in user's OAuth token when present; falls back to unauthenticated
 * requests for public repositories (60 req/h) so the flow also works in
 * local development. Claim generation is deterministic (githubMappers.ts) —
 * no LLM anywhere in the import path.
 */

const GITHUB_API = 'https://api.github.com'
const REQUEST_TIMEOUT_MS = 8000

export { GitHubImportError, parseRepoInput }
export type { MappedSource, MappedClaim } from './githubMappers'

interface GhRepo {
  id: number
  full_name: string
  private: boolean
  html_url: string
}

interface FetchOptions {
  token?: string | null
}

async function githubFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'baton-handover-app',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  let lastError: unknown = null
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(`${GITHUB_API}${path}`, {
        headers,
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (response.status === 404) {
        throw new GitHubImportError(
          'REPO_NOT_FOUND',
          'Repository not found or private. Public repositories need no extra scope; private repositories require granting the repo scope.'
        )
      }
      if (response.status === 403 || response.status === 429) {
        const resetHeader = response.headers.get('x-ratelimit-reset')
        if (resetHeader) {
          const resetAt = new Date(Number(resetHeader) * 1000)
          throw new GitHubImportError(
            'RATE_LIMITED',
            `GitHub rate limit reached for this ${options.token ? 'account' : 'IP address'}. Try again after ${resetAt.toLocaleTimeString()}.`
          )
        }
        throw new GitHubImportError('RATE_LIMITED', 'GitHub refused the request (rate limit or scope issue). Try again shortly.')
      }
      if (response.status >= 500) {
        lastError = new Error(`GitHub responded with ${response.status}`)
        continue // one retry on 5xx
      }
      if (!response.ok) {
        throw new GitHubImportError('GITHUB_UNAVAILABLE', `GitHub responded with ${response.status}.`)
      }
      return (await response.json()) as T
    } catch (error) {
      clearTimeout(timer)
      if (error instanceof GitHubImportError) throw error
      lastError = error
      if (attempt === 1) break
    }
  }
  throw new GitHubImportError(
    'GITHUB_UNAVAILABLE',
    'GitHub could not be reached. Check the repository path and try again.'
  )
}

export interface ImportResult {
  prCount: number
  commitCount: number
  claimCount: number
  unfinishedCount: number
  busiestCommitter: string | null
}

/** Retrieves the signed-in user's GitHub OAuth token from the Account table. */
export async function getGithubTokenForUser(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'github' },
    orderBy: { createdAt: 'desc' },
  })
  return account?.access_token ?? null
}

export async function runImport(params: {
  handoverId: string
  userId: string
  repoInput: string
}): Promise<ImportResult> {
  const { owner, name } = parseRepoInput(params.repoInput)

  // Job row first — failed attempts must be visible in the Sources panel.
  const importJob = await prisma.importJob.create({
    data: {
      handoverId: params.handoverId,
      startedById: params.userId,
      repoOwner: owner,
      repoName: name,
      status: 'running',
    },
  })

  try {
    const token = await getGithubTokenForUser(params.userId)
    const repo = await githubFetch<GhRepo>(`/repos/${owner}/${name}`, { token })
    const pulls = await githubFetch<GhPull[]>(
      `/repos/${owner}/${name}/pulls?state=all&per_page=30&sort=updated&direction=desc`,
      { token }
    )
    const commits = await githubFetch<GhCommit[]>(`/repos/${owner}/${name}/commits?per_page=50`, { token })

    let claimCount = 0
    let unfinishedCount = 0

    for (const pull of pulls) {
      const source = mapPullToSource(pull)
      await prisma.sourceRecord.upsert({
        where: {
          handoverId_legacyId: { handoverId: params.handoverId, legacyId: source.legacyId },
        },
        update: {
          title: source.title,
          uri: source.uri,
          author: source.author,
          timestamp: source.timestamp,
          content: source.content,
          origin: 'github_import',
          importJobId: importJob.id,
        },
        create: {
          handoverId: params.handoverId,
          legacyId: source.legacyId,
          origin: 'github_import',
          sourceType: 'github_pr',
          title: source.title,
          uri: source.uri,
          author: source.author,
          timestamp: source.timestamp,
          requiredClearanceLevel: 'team_internal',
          content: source.content,
          importJobId: importJob.id,
        },
      })

      const claim = buildClaimFromPull(source, pull)
      if (claim) {
        await prisma.claim.upsert({
          where: {
            handoverId_legacyId: { handoverId: params.handoverId, legacyId: claim.legacyId },
          },
          update: {
            statement: claim.statement,
            sourceQuotes: JSON.stringify([claim.span]),
          },
          create: {
            handoverId: params.handoverId,
            legacyId: claim.legacyId,
            sectionId: 'decisions',
            statement: claim.statement,
            status: 'quoted_verified',
            category: 'fact',
            verificationMethod: 'exact_substring_match',
            sourceQuotes: JSON.stringify([claim.span]),
            origin: 'github_import',
          },
        })
        claimCount++
      }

      const unfinished = buildUnfinishedFromOpenPull(pull, repo.full_name)
      if (unfinished) {
        await prisma.unfinishedWorkItem.upsert({
          where: {
            handoverId_legacyId: { handoverId: params.handoverId, legacyId: unfinished.id },
          },
          update: { payload: JSON.stringify(unfinished) },
          create: {
            handoverId: params.handoverId,
            legacyId: unfinished.id,
            payload: JSON.stringify(unfinished),
          },
        })
        unfinishedCount++
      }
    }

    for (const commit of commits) {
      const source = mapCommitToSource(commit)
      await prisma.sourceRecord.upsert({
        where: {
          handoverId_legacyId: { handoverId: params.handoverId, legacyId: source.legacyId },
        },
        update: {
          title: source.title,
          uri: source.uri,
          author: source.author,
          timestamp: source.timestamp,
          content: source.content,
          origin: 'github_import',
          importJobId: importJob.id,
        },
        create: {
          handoverId: params.handoverId,
          legacyId: source.legacyId,
          origin: 'github_import',
          sourceType: 'github_commit',
          title: source.title,
          uri: source.uri,
          author: source.author,
          timestamp: source.timestamp,
          requiredClearanceLevel: 'team_internal',
          content: source.content,
          importJobId: importJob.id,
        },
      })
    }

    // Ownership signal: busiest committer (surfaced in the import summary only).
    const committerCounts = new Map<string, number>()
    for (const commit of commits) {
      const who = commit.author?.login ?? commit.commit?.author?.name
      if (who) committerCounts.set(who, (committerCounts.get(who) ?? 0) + 1)
    }
    const busiestCommitter =
      Array.from(committerCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

    const result: ImportResult = {
      prCount: pulls.length,
      commitCount: commits.length,
      claimCount,
      unfinishedCount,
      busiestCommitter,
    }
    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: 'succeeded',
        prCount: result.prCount,
        commitCount: result.commitCount,
        claimCount: result.claimCount,
        finishedAt: new Date(),
      },
    })
    return result
  } catch (error) {
    const message =
      error instanceof GitHubImportError
        ? error.message
        : 'The import stopped partway. Re-run it to finish.'
    await prisma.importJob.update({
      where: { id: importJob.id },
      data: { status: 'failed', error: message, finishedAt: new Date() },
    })
    throw error
  }
}
