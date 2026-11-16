import { NextResponse } from 'next/server'
import { authzErrorResponse, requireSession } from '@/lib/authz'
import { getGithubTokenForUser } from '@/lib/github'

export interface GitHubRepoItem {
  id: number
  name: string
  fullName: string
  owner: string
  ownerAvatar: string | null
  isPrivate: boolean
  description: string | null
  language: string | null
  stars: number
  updatedAt: string
  defaultBranch: string
  htmlUrl: string
}

const GITHUB_API = 'https://api.github.com'
const REQUEST_TIMEOUT_MS = 10000

export async function GET(req: Request) {
  try {
    const session = await requireSession()
    const token = await getGithubTokenForUser(session.userId)

    // Check if user has an OAuth connection
    if (!token) {
      // Check for server PAT fallback if in dev mode
      const serverPat = process.env.GITHUB_PAT?.trim()
      if (!serverPat) {
        return NextResponse.json({
          connected: false,
          username: session.githubLogin,
          repos: [],
          message: 'No GitHub OAuth token found for this account. Connect GitHub to view your repositories.',
        })
      }
    }

    const authToken = token || process.env.GITHUB_PAT?.trim()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const perPage = Math.min(100, Math.max(10, parseInt(searchParams.get('per_page') || '100', 10)))

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(
        `${GITHUB_API}/user/repos?sort=updated&per_page=${perPage}&page=${page}&affiliation=owner,collaborator,organization_member`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'baton-handover-app',
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
          cache: 'no-store',
        }
      )
      clearTimeout(timer)

      if (response.status === 401) {
        return NextResponse.json(
          {
            connected: false,
            error: 'AUTH_EXPIRED',
            message: 'GitHub access token expired or revoked. Please reconnect your GitHub account.',
            repos: [],
          },
          { status: 401 }
        )
      }

      if (response.status === 403 || response.status === 429) {
        const resetHeader = response.headers.get('x-ratelimit-reset')
        const resetTime = resetHeader ? new Date(Number(resetHeader) * 1000).toLocaleTimeString() : null
        return NextResponse.json(
          {
            connected: true,
            error: 'RATE_LIMITED',
            message: `GitHub API rate limit reached.${resetTime ? ` Try again after ${resetTime}.` : ''}`,
            repos: [],
          },
          { status: 429 }
        )
      }

      if (!response.ok) {
        return NextResponse.json(
          {
            connected: true,
            error: 'GITHUB_ERROR',
            message: `GitHub returned status ${response.status}`,
            repos: [],
          },
          { status: 502 }
        )
      }

      const rawRepos = (await response.json()) as Array<{
        id: number
        name: string
        full_name: string
        private: boolean
        owner?: { login: string; avatar_url: string }
        description?: string | null
        language?: string | null
        stargazers_count?: number
        updated_at?: string
        default_branch?: string
        html_url?: string
      }>

      const repos: GitHubRepoItem[] = rawRepos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner?.login ?? '',
        ownerAvatar: r.owner?.avatar_url ?? null,
        isPrivate: Boolean(r.private),
        description: r.description ?? null,
        language: r.language ?? null,
        stars: r.stargazers_count ?? 0,
        updatedAt: r.updated_at ?? new Date().toISOString(),
        defaultBranch: r.default_branch ?? 'main',
        htmlUrl: r.html_url ?? `https://github.com/${r.full_name}`,
      }))

      return NextResponse.json({
        connected: true,
        username: session.githubLogin,
        total: repos.length,
        repos,
      })
    } catch (fetchError) {
      clearTimeout(timer)
      return NextResponse.json(
        {
          connected: true,
          error: 'NETWORK_ERROR',
          message: 'Unable to reach GitHub. Please check your internet connection.',
          repos: [],
        },
        { status: 504 }
      )
    }
  } catch (error) {
    return authzErrorResponse(error)
  }
}

