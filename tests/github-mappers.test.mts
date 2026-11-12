import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseRepoInput,
  mapPullToSource,
  mapCommitToSource,
  buildClaimFromPull,
  buildUnfinishedFromOpenPull,
  GitHubImportError,
  type GhPull,
  type GhCommit,
} from '../src/lib/githubMappers.ts'

// Fixtures mirror the GitHub REST v3 payload shapes actually consumed.

const mergedPull: GhPull = {
  number: 204,
  title: 'Migrate settlement dispatch to AWS SQS FIFO queue',
  body: 'All batch settlement events now stream through fintrack-settlement-fifo.fifo with exactly-once delivery guarantees. Deprecates the legacy RabbitMQ cluster on ECS.',
  state: 'closed',
  merged_at: '2026-08-20T10:00:00Z',
  created_at: '2026-08-18T09:00:00Z',
  updated_at: '2026-08-20T10:00:00Z',
  user: { login: 'alexchen' },
  html_url: 'https://github.com/fintrack/payment-core/pull/204',
}

const openPull: GhPull = {
  ...mergedPull,
  number: 214,
  title: 'Add exponential backoff jitter to webhook retries',
  state: 'open',
  merged_at: null,
  updated_at: new Date(Date.now() - 45 * 86_400_000).toISOString(), // 45 days stale
  user: null,
}

const commit: GhCommit = {
  sha: '8f4a1c9b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
  html_url: 'https://github.com/fintrack/payment-core/commit/8f4a1c9',
  commit: {
    message: 'Lengthen auth session TTL to 72 hours\n\n// quick fix — revisit before Q4 audit',
    author: { name: 'Alex Chen', date: '2026-08-02T08:15:00Z' },
  },
  author: null, // deleted GitHub account edge case
}

test('parseRepoInput accepts owner/name, URLs and .git suffixes', () => {
  assert.deepEqual(parseRepoInput('vercel/next.js'), { owner: 'vercel', name: 'next.js' })
  assert.deepEqual(parseRepoInput(' https://github.com/26f2000861-AV/baton.git '), {
    owner: '26f2000861-AV',
    name: 'baton',
  })
})

test('parseRepoInput rejects junk input with a friendly error', () => {
  for (const junk of ['', 'not-a-repo', 'a/b/c', 'sp ace/x', 'ok/']) {
    assert.throws(() => parseRepoInput(junk), GitHubImportError)
  }
})

test('mapPullToSource builds a source record with link back to origin', () => {
  const source = mapPullToSource(mergedPull)
  assert.equal(source.legacyId, 'gh_pr_204')
  assert.equal(source.sourceType, 'github_pr')
  assert.equal(source.uri, mergedPull.html_url)
  assert.equal(source.author, 'alexchen')
  assert.equal(source.timestamp, mergedPull.merged_at)
  assert.ok(source.content.startsWith('PR #204:'))
  assert.ok(source.content.includes(mergedPull.body as string))
})

test('mapPullToSource handles a deleted author account', () => {
  const source = mapPullToSource(openPull)
  assert.equal(source.author, 'unknown (deleted GitHub user)')
})

test('buildClaimFromPull produces a verbatim, machine-checkable excerpt', () => {
  const source = mapPullToSource(mergedPull)
  const claim = buildClaimFromPull(source, mergedPull)
  assert.ok(claim)
  assert.equal(claim.legacyId, 'claim_gh_pr_204')
  assert.ok(claim.statement.includes('PR #204 (merged) by alexchen'))
  // The excerpt must actually appear in the source content at the recorded offsets.
  assert.ok(claim.excerpt.length > 0)
  assert.notEqual(claim.span.charOffsetStart, undefined)
  assert.equal(
    source.content.slice(claim.span.charOffsetStart as number, claim.span.charOffsetEnd as number),
    claim.excerpt
  )
  assert.equal(claim.span.requiredClearanceLevel, 'team_internal')
})

test('buildClaimFromPull falls back to the title when the body is empty', () => {
  const noBody = { ...mergedPull, body: null }
  const source = mapPullToSource(noBody)
  const claim = buildClaimFromPull(source, noBody)
  assert.ok(claim)
  assert.equal(claim.excerpt, noBody.title)
})

test('mapCommitToSource uses the login, falling back to the git author name', () => {
  const source = mapCommitToSource(commit)
  assert.equal(source.legacyId, 'gh_commit_8f4a1c9')
  assert.equal(source.author, 'Alex Chen') // author.login was null
  assert.equal(source.content, commit.commit.message)
  const withLogin: GhCommit = { ...commit, author: { login: 'alexc' } }
  assert.equal(mapCommitToSource(withLogin).author, 'alexc')
})

test('buildUnfinishedFromOpenPull triages stale open PRs', () => {
  const item = buildUnfinishedFromOpenPull(openPull, 'fintrack/payment-core')
  assert.ok(item)
  assert.equal(item.type, 'open_pr')
  assert.equal(item.status, 'needs_triage')
  assert.equal(item.urgency, 'p1_first_two_weeks') // 45 days stale
  assert.equal(item.location.prNumber, 214)
  assert.equal(item.associatedClaimId, 'claim_gh_pr_214')
})

test('buildUnfinishedFromOpenPull ignores closed and merged PRs', () => {
  assert.equal(buildUnfinishedFromOpenPull(mergedPull, 'fintrack/payment-core'), null)
})
