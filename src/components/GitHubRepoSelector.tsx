'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { signIn } from 'next-auth/react'
import {
  Search,
  Lock,
  Globe,
  Star,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  GitFork,
  ArrowRight,
} from 'lucide-react'
import type { GitHubRepoItem } from '@/app/api/github/repos/route'

interface GitHubRepoSelectorProps {
  selectedRepo: string
  onSelectRepo: (fullName: string) => void
  disabled?: boolean
  error?: string | null
}

export default function GitHubRepoSelector({
  selectedRepo,
  onSelectRepo,
  disabled = false,
  error = null,
}: GitHubRepoSelectorProps) {
  const [repos, setRepos] = useState<GitHubRepoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [connected, setConnected] = useState(true)
  const [search, setSearch] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualInput, setManualInput] = useState('')

  const fetchRepositories = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/github/repos', { cache: 'no-store' })
      const data = await res.json()

      if (!res.ok) {
        setFetchError(data.message || 'Failed to fetch repositories from GitHub.')
        setConnected(data.connected !== false)
        return
      }

      setConnected(Boolean(data.connected))
      setRepos(Array.isArray(data.repos) ? data.repos : [])

      // If user had previously selected or if there are repos, ensure selection is valid
      if (Array.isArray(data.repos) && data.repos.length > 0 && !selectedRepo) {
        // Leave unselected until user clicks, or keep manual
      }
    } catch {
      setFetchError('Network error while connecting to GitHub API. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepositories()
  }, [])

  // Filtered repositories based on search input
  const filteredRepos = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return repos
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.language && r.language.toLowerCase().includes(q))
    )
  }, [repos, search])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onSelectRepo(manualInput.trim())
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#121215]/90 p-5 sm:p-6 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04]">
            <svg
              viewBox="0 0 98 96"
              width="18"
              height="18"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="text-white"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Select a repository</h3>
            <p className="text-xs text-zinc-400">Choose a repository to import claims and open pull requests</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setManualMode(!manualMode)
            if (!manualMode && selectedRepo) setManualInput(selectedRepo)
          }}
          className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4 self-start sm:self-auto"
        >
          {manualMode ? '← Pick from list' : 'Enter repo name manually'}
        </button>
      </div>

      {/* Manual Input Mode Fallback */}
      {manualMode ? (
        <div className="pt-4">
          <label htmlFor="manual-repo-input" className="block text-xs font-medium text-zinc-300 mb-2">
            Repository path (owner/name)
          </label>
          <div className="flex gap-2">
            <input
              id="manual-repo-input"
              type="text"
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value)
                onSelectRepo(e.target.value)
              }}
              placeholder="e.g. facebook/react or vercel/next.js"
              className="flex-1 rounded-xl border border-white/[0.1] bg-[#0c0c0e] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
              disabled={disabled}
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Read-only import: up to 30 pull requests and 50 commits will be indexed as evidence.
          </p>
        </div>
      ) : (
        /* Repository List Selection Mode */
        <div className="pt-4 space-y-3">
          {/* Search Bar */}
          {connected && !fetchError && (
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your repositories by name or language…"
                disabled={loading || disabled}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c0c0e] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/50 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Not Connected State */}
          {!connected && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-center">
              <p className="text-xs text-amber-200 mb-3">
                GitHub account is not connected with repo permissions. Connect to list your repositories.
              </p>
              <button
                type="button"
                onClick={() => signIn('github', { callbackUrl: '/signin/role' })}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                Connect GitHub
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Fetch Error State */}
          {fetchError && (
            <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-red-300 mb-2">
                <AlertCircle size={15} />
                <span>{fetchError}</span>
              </div>
              <button
                type="button"
                onClick={fetchRepositories}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white underline underline-offset-4 mt-1"
              >
                <RefreshCw size={13} />
                Retry loading repositories
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-2 py-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-white/[0.08]" />
                    <div className="h-3 w-64 rounded bg-white/[0.04]" />
                  </div>
                  <div className="h-4 w-16 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          )}

          {/* Repository List */}
          {!loading && !fetchError && connected && (
            <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
              {filteredRepos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center text-xs text-zinc-400">
                  {search ? (
                    <>
                      <p>No repositories match &ldquo;{search}&rdquo;</p>
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="mt-2 text-teal-400 hover:underline"
                      >
                        Reset search
                      </button>
                    </>
                  ) : (
                    <>
                      <p>No repositories found in your GitHub account.</p>
                      <button
                        type="button"
                        onClick={() => setManualMode(true)}
                        className="mt-2 text-teal-400 hover:underline"
                      >
                        Enter repository name manually
                      </button>
                    </>
                  )}
                </div>
              ) : (
                filteredRepos.map((repo) => {
                  const isSelected = selectedRepo.toLowerCase() === repo.fullName.toLowerCase()
                  return (
                    <button
                      key={repo.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelectRepo(repo.fullName)}
                      className={`w-full group text-left flex items-start justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition-all duration-150 ${
                        isSelected
                          ? 'border-teal-500/60 bg-teal-500/[0.08] shadow-[0_0_16px_rgba(45,212,191,0.12)]'
                          : 'border-white/[0.06] bg-[#0c0c0e]/60 hover:bg-white/[0.03] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-semibold tracking-tight truncate ${
                              isSelected ? 'text-teal-300' : 'text-zinc-200 group-hover:text-white'
                            }`}
                          >
                            {repo.fullName}
                          </span>

                          {/* Private / Public Badge */}
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                              repo.isPrivate
                                ? 'bg-amber-500/10 text-amber-300/90 border border-amber-500/20'
                                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/50'
                            }`}
                          >
                            {repo.isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                            {repo.isPrivate ? 'Private' : 'Public'}
                          </span>

                          {/* Language Pill */}
                          {repo.language && (
                            <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-400 border border-white/[0.06]">
                              {repo.language}
                            </span>
                          )}

                          {/* Stars */}
                          {repo.stars > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              {repo.stars}
                            </span>
                          )}
                        </div>

                        {repo.description && (
                          <p className="mt-1 text-[11px] text-zinc-400 line-clamp-1 leading-relaxed">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      {/* Selection Checkmark */}
                      <div
                        className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? 'border-teal-400 bg-teal-400 text-black'
                            : 'border-white/[0.15] bg-transparent text-transparent group-hover:border-white/30'
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          )}

          {/* Active Selection Display */}
          {selectedRepo && (
            <div className="flex items-center justify-between rounded-xl border border-teal-500/30 bg-teal-950/20 px-3.5 py-2 text-xs text-teal-300">
              <span className="flex items-center gap-1.5 truncate">
                <Check size={14} className="text-teal-400" />
                Selected: <strong className="font-semibold text-white truncate">{selectedRepo}</strong>
              </span>
              <span className="text-[10px] text-teal-400/80 uppercase tracking-wider font-mono">Ready to import</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5" role="alert">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  )
}

