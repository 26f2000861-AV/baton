import { verifyQuoteAgainstSource } from './verifier.ts'
import type { SourceSpan, UnfinishedWorkItem } from './types'

/**
 * Pure GitHub import mappers — Improvement 2.
 * Zero side effects, zero I/O: these functions turn GitHub REST payloads into
 * Baton source records, claims and work items. They are unit-tested without
 * network access (tests/github-mappers.test.mts). The orchestrator that owns
 * the database lives in src/lib/github.ts.
 */

export class GitHubImportError extends Error {
  code: 'REPO_NOT_FOUND' | 'RATE_LIMITED' | 'NO_TOKEN' | 'BAD_REPO_FORMAT' | 'GITHUB_UNAVAILABLE'

  constructor(
    code: GitHubImportError['code'],
    message: string
  ) {
    super(message)
    this.code = code
  }
}

export interface MappedSource {
  legacyId: string
  sourceType: 'github_pr' | 'github_commit'
  title: string
  uri: string
  author: string
  timestamp: string
  content: string
}

export interface GhPull {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  merged_at: string | null
  created_at: string
  updated_at: string
  user: { login: string } | null
  html_url: string
}

export interface GhCommit {
  sha: string
  html_url: string
  commit: { message: string; author: { name: string; date: string } | null }
  author: { login: string } | null
}

/** Parses "owner/name" (also accepts full github.com URLs and .git suffixes). */
export function parseRepoInput(raw: string): { owner: string; name: string } {
  const cleaned = raw.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/, '')
  const segments = cleaned.split('/')
  if (segments.length !== 2) {
    throw new GitHubImportError('BAD_REPO_FORMAT', 'Enter a repository as owner/name, e.g. vercel/next.js')
  }
  const [owner, name] = segments
  if (!owner || !name || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(name)) {
    throw new GitHubImportError('BAD_REPO_FORMAT', 'Enter a repository as owner/name, e.g. vercel/next.js')
  }
  return { owner, name }
}

export function mapPullToSource(pull: GhPull): MappedSource {
  const author = pull.user?.login ?? 'unknown (deleted GitHub user)'
  const title = `PR #${pull.number}: ${pull.title}`
  return {
    legacyId: `gh_pr_${pull.number}`,
    sourceType: 'github_pr',
    title,
    uri: pull.html_url,
    author,
    timestamp: pull.merged_at ?? pull.updated_at ?? pull.created_at,
    content: `${title}\n\n${pull.body ?? ''}`.trim(),
  }
}

export function mapCommitToSource(commit: GhCommit): MappedSource {
  const author = commit.author?.login ?? commit.commit?.author?.name ?? 'unknown'
  const firstLine = (commit.commit?.message ?? '').split('\n')[0] || 'No commit message'
  return {
    legacyId: `gh_commit_${commit.sha.slice(0, 7)}`,
    sourceType: 'github_commit',
    title: `Commit ${commit.sha.slice(0, 7)}: ${firstLine}`.slice(0, 200),
    uri: commit.html_url,
    author,
    timestamp: commit.commit?.author?.date ?? new Date().toISOString(),
    content: commit.commit?.message ?? '',
  }
}

export interface MappedClaim {
  legacyId: string
  statement: string
  excerpt: string
  span: SourceSpan
}

/**
 * Deterministic claim generation — the no-LLM rule (Improvement 2 core).
 * The statement is template-assembled from real PR metadata; the excerpt is
 * copied verbatim from the PR body (or the title when the body is empty) and
 * the character offsets are computed by the deterministic verifier itself.
 */
export function buildClaimFromPull(source: MappedSource, pull: GhPull): MappedClaim | null {
  const stateLabel = pull.merged_at ? 'merged' : pull.state
  const statement = `PR #${pull.number} (${stateLabel}) by ${source.author}: ${pull.title}`.slice(0, 300)
  const excerptSource = (pull.body ?? '').trim() || pull.title
  const excerpt = excerptSource.slice(0, 240)
  if (!excerpt) return null

  const check = verifyQuoteAgainstSource(source.content, excerpt)
  const span: SourceSpan = {
    sourceId: source.legacyId,
    sourceType: 'github_pr',
    title: source.title,
    uri: source.uri,
    author: source.author,
    timestamp: source.timestamp,
    requiredClearanceLevel: 'team_internal',
    exactSnippet: excerpt,
    charOffsetStart: check.charStart >= 0 ? check.charStart : undefined,
    charOffsetEnd: check.charEnd >= 0 ? check.charEnd : undefined,
  }
  return { legacyId: `claim_gh_pr_${pull.number}`, statement, excerpt, span }
}

/** Open, unmerged PRs become unfinished work items (triage queue). */
export function buildUnfinishedFromOpenPull(
  pull: GhPull,
  repoFullName: string
): UnfinishedWorkItem | null {
  if (pull.state !== 'open') return null
  const updated = new Date(pull.updated_at)
  const ageDays = (Date.now() - updated.getTime()) / 86_400_000
  return {
    id: `unfinished_gh_pr_${pull.number}`,
    title: `Open PR #${pull.number}: ${pull.title}`.slice(0, 200),
    type: 'open_pr',
    status: 'needs_triage',
    urgency: ageDays > 30 ? 'p1_first_two_weeks' : 'p2_first_month',
    description: `Imported open pull request. Last activity ${pull.updated_at.slice(0, 10)}; authored by ${pull.user?.login ?? 'unknown'}.`,
    location: {
      repository: repoFullName,
      branchOrPath: `pull/${pull.number}`,
      prNumber: pull.number,
    },
    associatedBlockers: [],
    recommendedSuccessorAction: 'Review, adopt or close this pull request.',
    provenance: {
      lastActivityDate: pull.updated_at,
      commitHash: '',
      author: pull.user?.login ?? 'unknown',
      reviewState: 'unreviewed',
    },
    associatedClaimId: `claim_gh_pr_${pull.number}`,
  }
}
