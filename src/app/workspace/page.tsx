'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  AlertTriangle, ArrowDownUp, CheckSquare, Download, FileText, GitCommit, GitPullRequest,
  History, LayoutDashboard, Menu, MessageSquare, Plus, RotateCcw, Search, ShieldAlert,
  ShieldCheck, Users, X,
} from 'lucide-react'
import PillarDecisions from '../../components/PillarDecisions'
import PillarUnfinished from '../../components/PillarUnfinished'
import PillarOwnership from '../../components/PillarOwnership'
import PillarRisks from '../../components/PillarRisks'
import BatonMark from '../../components/BatonMark'
import WorkspaceLoadingScreen from '../../components/WorkspaceLoadingScreen'
import ContradictionModal from '../../components/ContradictionModal'
import LeaverInterviewModal from '../../components/LeaverInterviewModal'
import ExposureDiffModal from '../../components/ExposureDiffModal'
import SourceInspectorDrawer from '../../components/SourceInspectorDrawer'
import IdentityChip from '../../components/IdentityChip'
import ImportPanel from '../../components/ImportPanel'
import HistoryView from '../../components/HistoryView'
import MembersPanel from '../../components/MembersPanel'
import NewHandoverModal from '../../components/NewHandoverModal'
import { HandoverProvider, useHandover } from '../../lib/handoverStore'
import { CLAIM_STATUS_COPY } from '../../lib/claimStatus'
import type { PersonaRole, SuccessorQuery } from '../../lib/types'

const routes = [
  { id: 'overview', label: 'Overview', hash: '#/', icon: LayoutDashboard },
  { id: 'claims', label: 'Claims', hash: '#/claims', icon: FileText },
  { id: 'decisions', label: 'Decisions', hash: '#/decisions', icon: GitCommit },
  { id: 'ownership', label: 'Ownership', hash: '#/ownership', icon: ShieldCheck },
  { id: 'risks', label: 'Conflicts', hash: '#/risks', icon: AlertTriangle },
  { id: 'unfinished', label: 'Unfinished work', hash: '#/unfinished', icon: GitPullRequest },
  { id: 'signoff', label: 'Sign-off', hash: '#/signoff', icon: CheckSquare },
  { id: 'sources', label: 'Sources & import', hash: '#/sources', icon: Download },
  { id: 'history', label: 'History', hash: '#/history', icon: History },
  { id: 'members', label: 'Team', hash: '#/members', icon: Users },
]

const routeGroups = [
  { label: 'Start', items: [routes[0]] },
  { label: 'Review evidence', items: [routes[1], routes[4]] },
  { label: 'Work in progress', items: [routes[2], routes[5]] },
  { label: 'Transfer', items: [routes[3], routes[6]] },
  { label: 'Evidence & history', items: [routes[7], routes[8]] },
  { label: 'Team', items: [routes[9]] },
]

const statusLabels: Record<string, { label: string; description: string }> = CLAIM_STATUS_COPY

interface HandoverSummary {
  id: string
  name: string
  role: PersonaRole
  isTemplate: boolean
  createdAt: string
}

/**
 * Workspace entry — Improvement 1 gate.
 * Unauthenticated visitors are sent to sign-in. Authenticated members land in
 * their most recent handover (or the role picker when they have none). The
 * active handover is tracked in the ?h= query parameter.
 */
export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [handoverId, setHandoverId] = useState<string | null>(null)
  const [handovers, setHandovers] = useState<HandoverSummary[]>([])
  const [booting, setBooting] = useState(true)

  const switchHandover = useCallback((id: string) => {
    setHandoverId(id)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('h', id)
      url.hash = '#/'
      window.history.replaceState(null, '', url.toString())
    } catch {
      /* URL fiddling is best-effort; state matters more */
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin')
      return
    }
    if (status !== 'authenticated') return
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/signin')
          return
        }
        const payload = await response.json().catch(() => null)
        if (cancelled) return
        const list: HandoverSummary[] = Array.isArray(payload?.handovers) ? payload.handovers : []
        setHandovers(list)
        if (list.length === 0) {
          router.replace('/signin/role')
          return
        }
        const wanted = new URLSearchParams(window.location.search).get('h')
        const active = list.find((item) => item.id === wanted) ?? list[0]
        setHandoverId(active.id)
        if (active.id !== wanted) {
          const url = new URL(window.location.href)
          url.searchParams.set('h', active.id)
          window.history.replaceState(null, '', url.toString())
        }
      } catch {
        if (!cancelled) setBooting(false)
        return
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [status, router])

  if (status === 'loading' || booting || !handoverId) {
    return <WorkspaceLoadingScreen message="Loading your handover…" />
  }

  return (
    <HandoverProvider handoverId={handoverId}>
      <WorkspaceInner
        handovers={handovers}
        activeHandoverId={handoverId}
        onSwitchHandover={switchHandover}
        sessionName={session?.user?.name ?? null}
      />
    </HandoverProvider>
  )
}

function WorkspaceInner({
  handovers,
  activeHandoverId,
  onSwitchHandover,
  sessionName,
}: {
  handovers: HandoverSummary[]
  activeHandoverId: string | null
  onSwitchHandover: (id: string) => void
  sessionName: string | null
}) {
  const {
    state, loading, pending, syncError, clearSyncError, viewer, visibleClaims, withheldCount, withheldDetails,
    decisions, workUpdates, unfinished, ownership, contradictions, questions, queries, sectionStates,
    answerInterviewQuestion, resolveContradiction, adoptUnfinishedItem, acceptSection, undoSectionAcceptance,
    submitSuccessorQuery, resolveSuccessorQuery, captureWorkUpdate, resetHandover, runImport, inviteMember,
  } = useHandover()

  const [route, setRoute] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [queryText, setQueryText] = useState('')
  const [queryClaimId, setQueryClaimId] = useState('')
  const [queryClaimSearch, setQueryClaimSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortDescending, setSortDescending] = useState(false)
  const [claimsUpdating, setClaimsUpdating] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selectedClaimId, setSelectedClaimId] = useState('')
  const [drawerClaimId, setDrawerClaimId] = useState<string | null>(null)
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [exposureOpen, setExposureOpen] = useState(false)
  const [newHandoverOpen, setNewHandoverOpen] = useState(false)
  const [closingDialog, setClosingDialog] = useState('')
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const dialogCloseTimerRef = useRef<number | null>(null)
  const claimsUpdateTimerRef = useRef<number | null>(null)
  const claimsUpdateFrameRef = useRef<number | null>(null)

  const role = viewer?.role ?? null
  const isCreator = state?.handover.isCreator ?? false

  useEffect(() => () => {
    if (dialogCloseTimerRef.current !== null) window.clearTimeout(dialogCloseTimerRef.current)
    if (claimsUpdateTimerRef.current !== null) window.clearTimeout(claimsUpdateTimerRef.current)
    if (claimsUpdateFrameRef.current !== null) window.cancelAnimationFrame(claimsUpdateFrameRef.current)
  }, [])

  const navigate = useCallback((id: string) => {
    const entry = routes.find((item) => item.id === id)
    const hash = entry?.hash ?? `#/${id}`
    if (window.location.hash !== hash) window.location.hash = hash
    setRoute(id)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    if (menuOpen) window.requestAnimationFrame(() => returnFocusRef.current?.focus())
  }, [menuOpen])

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (route !== 'claims') navigate('claims')
        window.requestAnimationFrame(() => {
          const target = window.matchMedia('(max-width: 760px)').matches
            ? document.querySelector<HTMLInputElement>('.claims-search-input')
            : searchInputRef.current
          target?.focus()
        })
      }
    }
    window.addEventListener('keydown', openSearch)
    return () => window.removeEventListener('keydown', openSearch)
  }, [navigate, route])

  useEffect(() => {
    const readHash = () => {
      const raw = window.location.hash.replace(/^#\/?/, '')
      const [path] = raw.split('?')
      if (path === 'conflict' || raw.includes('conflict')) {
        setRoute('risks')
        setSelectedConflictId('conflict_01')
        return
      }
      if (path === 'interview') {
        setRoute('overview')
        setInterviewOpen(true)
        return
      }
      if (path === 'exposure') {
        setRoute('overview')
        setExposureOpen(true)
        return
      }
      if (path === 'source') {
        setRoute('claims')
        setDrawerClaimId(visibleClaims[0]?.id ?? null)
        return
      }
      const valid = routes.map((item) => item.id)
      setRoute(valid.includes(path) && path ? path : 'overview')
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.querySelector<HTMLAnchorElement>('.mobile-menu a')?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        document.querySelector<HTMLButtonElement>('.mobile-menu-button')?.focus()
        return
      }
      if (event.key === 'Tab') {
        const menu = document.querySelector<HTMLElement>('.mobile-menu')
        const targets = menu ? Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')) : []
        if (targets.length === 0) return
        const first = targets[0]
        const last = targets[targets.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousBodyOverflow
    }
  }, [menuOpen])

  const rememberFocus = () => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  const closeDialog = (kind: 'interview' | 'exposure' | 'conflict' | 'drawer') => {
    if (dialogCloseTimerRef.current !== null) return
    const finishClose = () => {
      if (kind === 'interview') {
        setInterviewOpen(false)
        if (typeof window !== 'undefined' && window.location.hash.includes('interview')) window.location.hash = '#/'
      }
      if (kind === 'exposure') {
        setExposureOpen(false)
        if (typeof window !== 'undefined' && window.location.hash.includes('exposure')) window.location.hash = '#/'
      }
      if (kind === 'conflict') {
        setSelectedConflictId(null)
        if (typeof window !== 'undefined' && window.location.hash.includes('conflict')) {
          window.location.hash = '#/risks'
        }
      }
      if (kind === 'drawer') {
        setDrawerClaimId(null)
        if (typeof window !== 'undefined' && window.location.hash.includes('source')) {
          window.location.hash = '#/claims'
        }
      }
      setClosingDialog('')
      dialogCloseTimerRef.current = null
      returnFocusRef.current?.focus()
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose()
      return
    }
    setClosingDialog(kind)
    dialogCloseTimerRef.current = window.setTimeout(finishClose, 180)
  }
  const updateClaims = (update: () => void) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update()
      setClaimsUpdating(false)
      return
    }
    if (claimsUpdateFrameRef.current !== null) window.cancelAnimationFrame(claimsUpdateFrameRef.current)
    if (claimsUpdateTimerRef.current !== null) window.clearTimeout(claimsUpdateTimerRef.current)
    setClaimsUpdating(true)
    claimsUpdateFrameRef.current = window.requestAnimationFrame(() => {
      claimsUpdateFrameRef.current = null
      update()
      claimsUpdateTimerRef.current = window.setTimeout(() => {
        setClaimsUpdating(false)
        claimsUpdateTimerRef.current = null
      }, 180)
    })
  }
  const closeInterview = () => closeDialog('interview')
  const closeExposure = () => closeDialog('exposure')
  const closeDrawer = () => closeDialog('drawer')
  const openConflict = (id: string) => {
    rememberFocus()
    setSelectedConflictId(id)
  }
  const closeConflict = () => closeDialog('conflict')

  const openSource = (id: string) => {
    if (!visibleClaims.some((claim) => claim.id === id)) return
    rememberFocus()
    setSelectedClaimId(id)
    setDrawerClaimId(id)
  }

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Reset this handover to the sample baseline? This clears all captured updates, decisions, imports and the shared history for every member. Memberships are kept.'
    )
    if (!confirmed) return
    await resetHandover()
  }

  const drawerClaim = visibleClaims.find((claim) => claim.id === drawerClaimId)
  const activeConflict = contradictions.find((item) => item.id === selectedConflictId)
  const pendingQuestions = questions.filter((item) => item.status === 'pending_answer')
  const openConflictCount = contradictions.filter((item) => item.status === 'open_unresolved').length
  const overviewConflict = contradictions[0]
  const conflictSettled = overviewConflict?.status === 'settled_by_human'
  const conflictResolutionSummary = overviewConflict?.settlement?.resolutionType === 'clarification_note'
    ? 'A lead recorded a clarification; source precedence remains open for review.'
    : overviewConflict?.settlement?.resolutionType === 'accept_dual_scope'
      ? 'A lead resolved the scope: VM stays dual-write for ingest; Thanos keeps serving dashboard reads until the cutover completes.'
      : 'A lead recorded a decision and rationale for the next owner.'
  const reviewedCount = Object.values(sectionStates).filter((item) => item.isAccepted).length
  const exactQuoteCount = visibleClaims.filter((item) => item.status === 'quoted_verified').length
  const importedClaimCount = visibleClaims.filter((item) => item.id.startsWith('claim_gh_')).length
  const filterCounts = {
    all: visibleClaims.length,
    needs_review: visibleClaims.filter((claim) => claim.status !== 'confirmed_by_lead').length,
    verified: visibleClaims.filter((claim) => claim.status === 'quoted_verified').length,
    inferred: visibleClaims.filter((claim) => claim.status === 'inferred_ai').length,
    unverified: visibleClaims.filter((claim) => claim.status === 'quoted_unverified').length,
    conflict: visibleClaims.filter((claim) => claim.status === 'conflicting').length,
    missing: visibleClaims.filter((claim) => claim.status === 'not_found').length,
    leaver: visibleClaims.filter((claim) => claim.status === 'stated_by_leaver').length,
    lead: visibleClaims.filter((claim) => claim.status === 'confirmed_by_lead').length,
    imported: importedClaimCount,
  }
  const openUnfinishedCount = unfinished.filter((item) => item.status !== 'adopted').length
  const confirmedOwnershipCount = ownership.filter((item) => item.proposedSuccessor.approvalState === 'confirmed').length
  const readinessChecks = [
    { label: 'Claims reviewed', complete: filterCounts.needs_review === 0 },
    { label: 'Conflicts settled', complete: openConflictCount === 0 },
    { label: 'Unfinished work adopted', complete: openUnfinishedCount === 0 },
    { label: 'Owners confirmed', complete: confirmedOwnershipCount === ownership.length },
    { label: 'Sections signed off', complete: reviewedCount === 4 },
  ]
  const readinessScore = readinessChecks.filter((check) => check.complete).length
  const evidencePercent = visibleClaims.length === 0 ? 0 : Math.round((exactQuoteCount / visibleClaims.length) * 100)
  const claimStatusSummary = [
    { label: 'Needs review', count: filterCounts.needs_review, tone: 'review' },
    { label: 'Quote found', count: filterCounts.verified, tone: 'verified' },
    { label: 'Inferred', count: filterCounts.inferred, tone: 'inferred' },
    { label: 'Conflicting', count: filterCounts.conflict, tone: 'critical' },
  ]
  const detailedFilters = [
    { id: 'inferred', label: 'Inferred', count: filterCounts.inferred },
    { id: 'unverified', label: 'Unverified', count: filterCounts.unverified },
    { id: 'conflict', label: 'Conflict', count: filterCounts.conflict },
    { id: 'missing', label: 'Missing', count: filterCounts.missing },
    { id: 'leaver', label: 'Leaver stated', count: filterCounts.leaver },
    { id: 'lead', label: 'Lead confirmed', count: filterCounts.lead },
    ...(importedClaimCount > 0 ? [{ id: 'imported', label: 'Imported', count: importedClaimCount }] : []),
  ]
  const filteredClaims = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    return visibleClaims
      .filter((claim) => filter === 'all' || (filter === 'needs_review' && claim.status !== 'confirmed_by_lead') || (filter === 'verified' && claim.status === 'quoted_verified') || (filter === 'inferred' && claim.status === 'inferred_ai') || (filter === 'conflicting' && claim.status === 'conflicting') || (filter === 'unverified' && claim.status === 'quoted_unverified') || (filter === 'missing' && claim.status === 'not_found') || (filter === 'leaver' && claim.status === 'stated_by_leaver') || (filter === 'lead' && claim.status === 'confirmed_by_lead') || (filter === 'imported' && claim.id.startsWith('claim_gh_')))
      .filter((claim) => !searchTerm || `${claim.id} ${claim.statement} ${claim.sourceQuotes[0]?.sourceId} ${claim.sourceQuotes[0]?.title}`.toLowerCase().includes(searchTerm))
      .sort((a, b) => sortDescending ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id))
  }, [visibleClaims, filter, search, sortDescending])
  const matchingQueryClaims = useMemo(() => {
    const term = queryClaimSearch.trim().toLowerCase()
    return visibleClaims.filter((claim) => !term || `${claim.id} ${claim.statement}`.toLowerCase().includes(term))
  }, [visibleClaims, queryClaimSearch])

  const titleMap: Record<string, string> = {
    overview: 'Handover overview', claims: 'Claims', decisions: 'Decisions',
    ownership: 'Ownership', risks: 'Conflicts to review', unfinished: 'Unfinished work',
    signoff: 'Successor sign-off', interview: 'Leaver interview', source: 'Source evidence',
    exposure: 'Access visibility', sources: 'Sources & import', history: 'Shared history', members: 'Team',
  }
  const title = titleMap[route] ?? titleMap.overview

  const renderClaimRows = (rows: typeof visibleClaims, compact = false) => rows.length === 0 ? (
    <p className="empty-state">No claims match this view.</p>
  ) : rows.map((claim) => {
    const source = claim.sourceQuotes[0]
    return (
      <button className={`claim-row${selectedClaimId === claim.id ? ' selected' : ''}`} key={claim.id} onClick={() => openSource(claim.id)}>
        <span className="claim-status" data-status={claim.status}>{statusLabels[claim.status]?.label ?? 'Pending'}</span>
        <span className="claim-copy"><span>{claim.statement}</span><span className="pass-line"><i /> <code>{source?.sourceId ?? '—'}</code></span></span>
        <span className="row-arrow">{compact ? 'Open evidence ↗' : '↗'}</span>
      </button>
    )
  })

  const sidebarNav = (
    <>
      <nav className="side-nav" aria-label="Handover views">
        {routeGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-group-label">{group.label}</p>
            {group.items.map(({ id, label, hash, icon: Icon }) => (
              <a key={id} href={hash} className={`nav-link ${route === id ? 'selected' : ''}`} aria-current={route === id ? 'page' : undefined} onClick={(event) => { event.preventDefault(); navigate(id) }}>
                <Icon size={17} strokeWidth={1.7} /><span>{label}</span>
                {id === 'risks' && openConflictCount > 0 && <span className="nav-count">{openConflictCount}</span>}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-tools">
        <p className="nav-group-label">More tools</p>
        <button className="nav-link" onClick={() => navigate('interview')}><MessageSquare size={17} /><span>Leaver interview</span><span className="nav-count">{pendingQuestions.length}</span></button>
        <button className="nav-link" onClick={() => navigate('exposure')}><ShieldAlert size={17} /><span>Access visibility</span></button>
        <p className="nav-group-label">My handovers</p>
        {handovers.filter((item) => item.id !== activeHandoverId).slice(0, 4).map((item) => (
          <button key={item.id} className="nav-link handover-switch-link" onClick={() => onSwitchHandover(item.id)} title={`Switch to ${item.name}`}>
            <span className="handover-switch-dot" aria-hidden="true" />
            <span className="handover-switch-name">{item.name}</span>
          </button>
        ))}
        <button className="nav-link" onClick={() => setNewHandoverOpen(true)}><Plus size={17} /><span>New handover</span></button>
        {isCreator && (
          <>
            <p className="nav-group-label">Sample session</p>
            <button className="nav-link" onClick={handleReset} disabled={pending === 'reset'}>
              <RotateCcw size={17} /><span>{pending === 'reset' ? 'Resetting…' : 'Reset sample data'}</span>
            </button>
          </>
        )}
      </div>
    </>
  )

  if (loading && !state) {
    return <WorkspaceLoadingScreen message="Loading your handover…" />
  }

  if (!state) {
    return (
      <div className="framed-app framed-app-single workspace-loading-shell" role="status">
        <div className="workspace-loading" style={{ minHeight: 'auto', gap: 18 }}>
          <div className="workspace-loading-logo">
            <BatonMark size="medium" />
          </div>
          <div className="workspace-loading-copy">
            <p style={{ fontSize: 18, color: 'var(--text)' }}>Handover Not Found</p>
            <span className="workspace-loading-subtitle">
              {syncError || 'This handover could not be loaded or may have been removed.'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="primary-action"
              onClick={() => {
                window.location.href = '/workspace'
              }}
            >
              Go to my handovers
            </button>
            <Link href="/" className="secondary-action">
              Landing page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="framed-app">
      <aside className="sidebar" aria-label="Baton workspace">
        <Link className="brand-lockup" href="/" title="Return to landing page" aria-label="Baton - Return to landing page">
          <BatonMark />
          <span><strong>Baton</strong><small>Engineering handover</small></span>
        </Link>
        <p className="nav-caption">Handover workflow</p>
        {sidebarNav}
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="mobile-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { if (!menuOpen) rememberFocus(); setMenuOpen((open) => !open) }}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          <Link href="/" className="topbar-title" title="Return to landing page" aria-label="Baton - Return to landing page"><BatonMark compact /><div className="topbar-brand-copy"><span>Baton</span><small>{title}</small></div></Link>
          <label className="global-search"><Search size={15} /><input ref={searchInputRef} value={search} onFocus={() => { if (route !== 'claims') navigate('claims') }} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims and sources" aria-label="Search claims and sources" /><kbd>Ctrl K</kbd></label>
          <IdentityChip viewer={viewer} />
        </header>
        {menuOpen && <div id="mobile-navigation" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Baton navigation"><Link href="/" className="mobile-menu-brand" onClick={() => setMenuOpen(false)}><strong>Baton</strong><span>Handover</span></Link>{routeGroups.map((group) => <section className="mobile-nav-group" key={group.label} aria-label={group.label}><p className="mobile-menu-section-title">{group.label}</p>{group.items.map(({ id, label, hash, icon: Icon }) => <a key={id} href={hash} aria-current={route === id ? 'page' : undefined} className={route === id ? 'selected' : undefined} onClick={(event) => { event.preventDefault(); navigate(id) }}><Icon size={17} />{label}{id === 'risks' && openConflictCount > 0 && <span className="nav-count">{openConflictCount}</span>}</a>)}</section>)}<section className="mobile-nav-group" aria-label="More tools"><p className="mobile-menu-section-title">More tools</p><button onClick={() => navigate('interview')}><MessageSquare size={17} />Leaver interview<span className="nav-count">{pendingQuestions.length}</span></button><button onClick={() => navigate('exposure')}><ShieldAlert size={17} />Access visibility</button></section><section className="mobile-nav-group" aria-label="My handovers"><p className="mobile-menu-section-title">My handovers</p>{handovers.filter((item) => item.id !== activeHandoverId).slice(0, 4).map((item) => <button key={item.id} onClick={() => { onSwitchHandover(item.id); setMenuOpen(false) }}><span aria-hidden="true">↳</span>{item.name}</button>)}<button onClick={() => { setMenuOpen(false); setNewHandoverOpen(true) }}><Plus size={17} />New handover</button>{isCreator && <button onClick={() => { handleReset(); setMenuOpen(false) }}><RotateCcw size={17} />Reset sample data</button>}</section></div>}
        {syncError && (
          <div className="sync-error-banner" role="alert">
            <span>{syncError}</span>
            <button type="button" onClick={clearSyncError} aria-label="Dismiss error message">✕</button>
          </div>
        )}
        <main className="sheet">
          {loading && (
            <div className="workspace-sheet-loading-bar" aria-hidden="true">
              <span />
            </div>
          )}
          <div className="sheet-content">
            <div className="sample-workspace-note"><span className="sample-indicator" />{state.handover.isTemplate ? 'TEMPLATE' : 'SHARED HANDOVER'}<span className="sample-note-copy" role="status" aria-live="polite">Saved on the server · visible to every member across devices · your role ({viewer?.role ?? 'member'}) comes from your membership, not a switch.</span></div>
            <div className="page-heading">
            <div><p className="breadcrumb">Engineering <span aria-hidden="true">/</span> {state.handover.name}</p><h1>{title}</h1></div>
              {route === 'overview' && <button className="primary-action page-capture-action" onClick={() => {
                navigate('decisions')
                window.requestAnimationFrame(() => {
                  const capturePanel = document.getElementById('work-update-capture')
                  if (capturePanel instanceof HTMLDetailsElement) {
                    capturePanel.open = true
                    capturePanel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
                    capturePanel.querySelector('summary')?.focus({ preventScroll: true })
                  }
                })
              }}>
                <GitCommit size={16} aria-hidden="true" /> Capture a work update
              </button>}
            </div>

            {route === 'overview' && <div className="view-stack">
              <section className="finding-panel" aria-labelledby="finding-title">
                <div className="finding-copy"><span className="section-kicker">{conflictSettled ? 'Decision recorded' : openConflictCount > 0 ? `Start here · ${openConflictCount} open ${openConflictCount === 1 ? 'conflict' : 'conflicts'}` : 'All conflicts reviewed'}</span><h2 id="finding-title">{conflictSettled ? 'Conflict decision recorded for handover' : 'Conflicting records need a decision'}</h2><p>{conflictSettled ? conflictResolutionSummary : 'Two project records describe different states. Review the source and timing before the next owner takes over.'}</p></div>
                <button className="secondary-action" onClick={() => navigate('risks')}>{conflictSettled ? 'Review decision' : 'Review conflict'}</button>
              </section>
              <section className="overview-command-center" aria-labelledby="command-center-title">
                <div className="overview-command-heading">
                  <div>
                    <p className="section-kicker">Handover health</p>
                    <h2 id="command-center-title">Know what blocks the next owner</h2>
                  </div>
                  <span className={`readiness-badge ${readinessScore === readinessChecks.length ? 'ready' : ''}`}>
                    {readinessScore === readinessChecks.length ? 'Ready to transfer' : `${readinessScore}/${readinessChecks.length} checks complete`}
                  </span>
                </div>
                <div className="readiness-track" aria-label={`${readinessScore} of ${readinessChecks.length} readiness checks complete`}>
                  <span style={{ width: `${(readinessScore / readinessChecks.length) * 100}%` }} />
                </div>
                <div className="readiness-checks">
                  {readinessChecks.map((check) => (
                    <span className={check.complete ? 'complete' : ''} key={check.label}>
                      <span aria-hidden="true">{check.complete ? '✓' : '○'}</span>{check.label}
                    </span>
                  ))}
                </div>
              </section>
              <details className="sample-guide">
                <summary>How to run this sample</summary>
                <ol>
                  <li>Open the conflict and compare the GitHub and Slack excerpts.</li>
                  <li>The lead seat settles it with a decision note — settlement is enforced on the server, so only a lead can record it.</li>
                  <li>The successor reviews the handover, raises questions and signs off section by section.</li>
                  <li>Want real evidence? Import any GitHub repository under Sources &amp; import.</li>
                </ol>
                <p>Sample records are synthetic. Everything you change is saved on the server and shared with every member of this handover.</p>
              </details>
              <section className="metric-strip" aria-label="Handover counts">
                <Metric label="Total claims" value={visibleClaims.length} sub={`${filterCounts.needs_review} need review`} />
                <Metric label="Open conflicts" value={openConflictCount} sub={openConflictCount === 0 ? 'No unresolved conflicts' : 'Need a decision'} />
                <Metric label="Unfinished work" value={openUnfinishedCount} sub={`${unfinished.length} tracked items`} />
                <Metric label="Verified evidence" value={exactQuoteCount} sub={`${evidencePercent}% of visible claims`} />
                <Metric label="Sections signed off" value={reviewedCount} sub="of 4 workflow sections" />
                <Metric label="History entries" value={workUpdates.length} sub="Captured by the team" />
              </section>
              <div className="overview-insights">
                <section className="data-card insight-card" aria-labelledby="claims-health-title">
                  <div className="card-heading"><div><h2 id="claims-health-title">Evidence coverage</h2><p>Claim status from the current reader view</p></div><span className="insight-total">{visibleClaims.length} total</span></div>
                  <div className="status-bars">
                    {claimStatusSummary.map((item) => (
                      <button key={item.label} className="status-bar-row" onClick={() => { setFilter(item.tone === 'review' ? 'needs_review' : item.tone === 'verified' ? 'verified' : item.tone === 'inferred' ? 'inferred' : 'conflicting'); navigate('claims') }}>
                        <span className="status-bar-label">{item.label}<strong>{item.count}</strong></span>
                        <span className="status-bar-track"><span className={`status-bar-fill ${item.tone}`} style={{ width: `${visibleClaims.length ? Math.max(item.count / visibleClaims.length * 100, item.count ? 4 : 0) : 0}%` }} /></span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="data-card insight-card" aria-labelledby="attention-title">
                  <div className="card-heading"><div><h2 id="attention-title">Needs attention</h2><p>Highest-impact work first</p></div></div>
                  <div className="attention-list">
                    {openConflictCount > 0 && <button className="attention-item critical" onClick={() => navigate('risks')}><span className="attention-dot" /><span><strong>{openConflictCount} open {openConflictCount === 1 ? 'conflict' : 'conflicts'}</strong><small>Resolve conflicting source records before transfer.</small></span><span aria-hidden="true">→</span></button>}
                    {filterCounts.needs_review > 0 && <button className="attention-item review" onClick={() => { setFilter('needs_review'); navigate('claims') }}><span className="attention-dot" /><span><strong>{filterCounts.needs_review} claims need review</strong><small>Confirm the evidence or leave the uncertainty visible.</small></span><span aria-hidden="true">→</span></button>}
                    {openUnfinishedCount > 0 && <button className="attention-item warning" onClick={() => navigate('unfinished')}><span className="attention-dot" /><span><strong>{openUnfinishedCount} unfinished items</strong><small>Pick up the next action and its known blockers.</small></span><span aria-hidden="true">→</span></button>}
                    {openConflictCount === 0 && filterCounts.needs_review === 0 && openUnfinishedCount === 0 && <p className="attention-empty">Nothing is blocking the current handover review.</p>}
                  </div>
                </section>
              </div>
              {/* Keep the active conflict beside the evidence at narrower desktop widths. */}
              <div className="overview-grid">
                <Card title="Claim evidence" action="View claims" onAction={() => navigate('claims')}>
                  <div className="claim-list">{renderClaimRows(visibleClaims.slice(0, 3), true)}</div>
                </Card>
                <Card title="Open conflict" action="Review conflict" onAction={() => navigate('risks')}>
                  {contradictions.slice(0, 1).map((item) => <div className="conflict-sources" key={item.id}>
                    {[item.sourceA, item.sourceB].map((source) => <div className="conflict-source" key={source.title}>
                      <strong>{source.extractedValue}</strong><span>{source.title}</span><small>{source.author} · {new Date(source.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</small><p>{source.exactQuote}</p>
                    </div>)}
                  </div>)}
                  <p className="source-key"><code>claim_09</code></p>
                </Card>
                <Card title="Successor sign-off" action="Review sections" onAction={() => navigate('signoff')}>
                  <div className="mini-rows">{(['decisions', 'unfinished', 'ownership', 'risks'] as const).map((id) => <div className="mini-row" key={id}><span>{sectionName(id)}</span><span className={`state-label ${sectionStates[id]?.isAccepted ? 'accepted' : ''}`}>{sectionStates[id]?.isAccepted ? 'Reviewed' : 'Needs review'}</span></div>)}</div>
                  <p className="card-foot">{reviewedCount} of 4 sections reviewed</p>
                </Card>
                <Card title="Decisions" action="Review decisions" onAction={() => navigate('decisions')}>
                  {decisions.slice(0, 1).map((item) => <div className="work-preview" key={item.id}><span>{item.title}</span><small>{item.provenance.rationaleConfidence === 'inferred_ai' ? 'Rationale inferred' : item.provenance.rationaleConfidence === 'documented_explicit' ? 'Rationale documented' : 'Rationale stated'} · {new Date(`${item.timestamp}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · <code>{item.associatedClaimId}</code></small></div>)}
                  {workUpdates[0] && <div className="work-preview" key={workUpdates[0].id}><span>{workUpdates[0].decisionText}</span><small>Captured by {workUpdates[0].author.name} · {workUpdates[0].verification?.state === 'checked' && workUpdates[0].verification.isExactMatch ? 'Quote verified against source' : 'Person-reported · not source-verified'}</small>{workUpdates[0].nextAction && <small>Next: {workUpdates[0].nextAction}</small>}</div>}
                  <div className="ownership-preview">
                    <div className="subsection-heading"><strong>Ownership</strong><button className="text-action" onClick={() => navigate('ownership')}>Review owners <span aria-hidden="true">→</span></button></div>
                    {ownership.slice(0, 1).map((asset) => <div className="work-preview" key={asset.id}><span>{asset.assetName}</span><small>{asset.currentOwner.name} → {asset.proposedSuccessor.name}</small><small>Transfer by {new Date(`${asset.credentialsAndAccess.transferDeadlineDate}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · escalate to {asset.escalationContact.name}</small></div>)}
                  </div>
                </Card>
                <Card title="Unfinished work" action="Review work" onAction={() => navigate('unfinished')}>
                  {unfinished.slice(0, 1).map((item) => <div className="work-preview" key={item.id}><span>{item.title}</span><small>{item.associatedBlockers[0] ?? item.description}</small><small>{item.urgency === 'p0_immediate' ? 'Immediate' : 'First two weeks'} · <code>{item.associatedClaimId}</code></small></div>)}
                </Card>
                <Card title="Leaver interview" action="Review questions" onAction={() => navigate('interview')}>
                  {pendingQuestions.slice(0, 1).map((question) => <div className="work-preview" key={question.id}><span>{question.promptText}</span><small>Claim {question.associatedClaimId} · Pending answer</small></div>)}
                </Card>
              </div>
            </div>}

            {route === 'claims' && <div className="view-stack"><div className="view-intro"><p>{visibleClaims.length} visible claims for {viewer?.name ?? sessionName ?? 'you'}</p><button className="secondary-action" onClick={() => navigate('exposure')}>View access visibility</button></div><section className={`data-card claims-card${claimsUpdating ? ' is-updating' : ''}`}><div className="card-heading"><div><h2>Claims</h2><p>{filteredClaims.length} matching claims</p></div><button className="icon-action" aria-label="Sort claims by ID" aria-pressed={sortDescending} onClick={() => updateClaims(() => setSortDescending((value) => !value))}><ArrowDownUp size={16} /></button></div><label className="claims-mobile-search"><span className="sr-only">Search claims and sources</span><Search size={16} aria-hidden="true" /><input className="claims-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims and sources" /></label><p className="evidence-clarifier">“Quote found” means the source contains that text; it does not confirm the claim is true. Counts can overlap: a quoted claim may still need a lead review.</p><div className="filter-tabs" role="group" aria-label="Filter claims by evidence state">
                  <button type="button" aria-pressed={filter === 'all'} className={filter === 'all' ? 'active' : ''} onClick={() => updateClaims(() => setFilter('all'))}>All {filterCounts.all}</button>
                  <button type="button" aria-pressed={filter === 'needs_review'} className={filter === 'needs_review' ? 'active' : ''} onClick={() => updateClaims(() => setFilter('needs_review'))}>Needs review {filterCounts.needs_review}</button>
                  <button type="button" aria-pressed={filter === 'verified'} className={filter === 'verified' ? 'active' : ''} onClick={() => updateClaims(() => setFilter('verified'))}>Quote found {filterCounts.verified}</button>
                  <details className="filter-more">
                    <summary>More statuses</summary>
                    <div className="filter-more-options" role="group" aria-label="Additional claim statuses">
                      {detailedFilters.map(({ id, label, count }) => <button type="button" aria-pressed={filter === id} className={filter === id ? 'active' : ''} key={id} onClick={() => updateClaims(() => setFilter(id))}>{label} {count}</button>)}
                    </div>
                  </details>
                </div><details className="evidence-help"><summary>How to read these labels</summary><p className="evidence-help-intro">Labels describe the source and review state. An exact quote does not prove the whole claim is correct.</p><dl>{Object.entries(CLAIM_STATUS_COPY).map(([key, statusCopy]) => <div key={key}><dt>{statusCopy.label}</dt><dd>{statusCopy.description}</dd></div>)}</dl></details><div className="claim-list">{renderClaimRows(filteredClaims)}</div></section></div>}

            {route === 'decisions' && <div className="native-component"><PillarDecisions decisions={decisions} workUpdates={workUpdates} activeAuthor={viewer?.name ?? 'You'} syncError={syncError} sources={state.sources} pending={pending} onCapture={captureWorkUpdate} isAccepted={sectionStates.decisions?.isAccepted ?? false} onInspect={openSource} onAccept={() => acceptSection('decisions')} onUndo={() => undoSectionAcceptance('decisions')} /></div>}
            {route === 'ownership' && <div className="native-component"><PillarOwnership assets={ownership} isAccepted={sectionStates.ownership?.isAccepted ?? false} onInspect={openSource} onAccept={() => acceptSection('ownership')} onUndo={() => undoSectionAcceptance('ownership')} /></div>}
            {route === 'risks' && <div className="native-component"><PillarRisks contradictions={contradictions} isAccepted={sectionStates.risks?.isAccepted ?? false} onContradiction={openConflict} onInspect={openSource} onAccept={() => acceptSection('risks')} onUndo={() => undoSectionAcceptance('risks')} /></div>}
            {route === 'unfinished' && <div className="native-component"><PillarUnfinished items={unfinished} isAccepted={sectionStates.unfinished?.isAccepted ?? false} onAdopt={adoptUnfinishedItem} onInspect={openSource} onAccept={() => acceptSection('unfinished')} onUndo={() => undoSectionAcceptance('unfinished')} /></div>}
            {route === 'sources' && <ImportPanel viewer={viewer} sources={state.sources} imports={state.imports} pending={pending} onImport={runImport} />}
            {route === 'history' && <HistoryView workUpdates={workUpdates} activity={state.activity} />}
            {route === 'members' && <MembersPanel members={state.members} viewer={viewer} pending={pending} onInvite={inviteMember} />}

            {route === 'signoff' && <div className="view-stack"><div className="view-intro"><p>{reviewedCount} of 4 sections reviewed · {queries.length} successor questions raised</p></div><section className="data-card"><div className="card-heading"><div><h2>Handover sections</h2><p>Mark a section reviewed after checking it. This records your review; it does not certify every claim as correct. You can undo it at any time.</p></div></div><div className="mini-rows">{(['decisions', 'unfinished', 'ownership', 'risks'] as const).map((id) => { const reviewed = sectionStates[id]?.isAccepted ?? false; return <div className="signoff-row" key={id}><div><strong>{sectionName(id)}</strong><small>{sectionDetail(id)}</small></div><div className="signoff-actions"><span className={`state-label ${reviewed ? 'accepted' : ''}`}>{reviewed ? 'Reviewed' : 'Needs review'}</span><button className="secondary-action" aria-pressed={reviewed} onClick={() => reviewed ? undoSectionAcceptance(id) : acceptSection(id)}>{reviewed ? 'Undo review' : 'Mark reviewed'}</button></div></div>})}</div></section><section className="data-card"><div className="card-heading"><div><h2>Successor questions</h2><p>Ask the engineering lead about unclear evidence. Replies are recorded in the shared history; no message is sent.</p></div></div>{role !== 'successor' && <p className="sample-notice">Only the successor seat can ask handover questions. Your seat: {role ?? 'member'}.</p>}<form className="query-form" onSubmit={(event) => { event.preventDefault(); if (queryText.trim() && queryClaimId && visibleClaims.some((claim) => claim.id === queryClaimId) && role === 'successor') { submitSuccessorQuery(queryClaimId, 'unclear_rationale', queryText.trim()); setQueryText('') } }}>
                  <label htmlFor="query-claim-search">Find a claim</label>
                  <input id="query-claim-search" type="search" value={queryClaimSearch} onChange={(event) => { setQueryClaimSearch(event.target.value); setQueryClaimId('') }} placeholder="Search by ID or a word from the claim" disabled={role !== 'successor'} />
                  <label htmlFor="query-claim">Related claim</label>
                  <select id="query-claim" value={queryClaimId} onChange={(event) => setQueryClaimId(event.target.value)} required disabled={role !== 'successor'}>
                    <option value="">Choose a claim</option>
                    {matchingQueryClaims.map((claim) => <option key={claim.id} value={claim.id}>{claim.id} · {claim.statement.slice(0, 72)}</option>)}
                  </select>
                  {queryClaimSearch.trim() && matchingQueryClaims.length === 0 && <p className="query-empty">No visible claims match this search.</p>}
                  <label htmlFor="successor-query">Question for the handover</label>
                  <textarea id="successor-query" value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Ask about a decision or missing context" disabled={role !== 'successor'} />
                  <button className="primary-action" disabled={!queryText.trim() || !queryClaimId || !visibleClaims.some((claim) => claim.id === queryClaimId) || role !== 'successor'}>Send question</button>
                </form><SuccessorQuestionReplies queries={queries.slice(0, 3)} role={role} onResolve={resolveSuccessorQuery} /></section></div>}

            {route === 'interview' && <div className="view-stack"><div className="view-intro"><p>{pendingQuestions.length} questions awaiting an answer</p><button className="primary-action" onClick={() => { rememberFocus(); setInterviewOpen(true) }} disabled={role !== 'leaver'}>{role === 'leaver' ? 'Answer questions' : 'View questions'}</button></div><section className="data-card"><div className="card-heading"><div><h2>Pending questions</h2><p>Context from the departing engineer · only the leaver seat can record answers</p></div></div>{questions.map((question) => <button key={question.id} className="question-row" onClick={() => { rememberFocus(); setInterviewOpen(true) }}><span className="question-priority">{question.priorityRank}</span><span><strong>{question.promptText}</strong><small>Claim {question.associatedClaimId} · {statusLabels[visibleClaims.find((claim) => claim.id === question.associatedClaimId)?.status ?? '']?.label ?? 'Pending'}</small></span><span className="state-label">{question.status === 'pending_answer' ? 'Pending' : question.status === 'answered' ? 'Answered' : 'Escalated'}</span></button>)}</section></div>}

            {route === 'exposure' && <div className="view-stack"><div className="view-intro"><p>Reviewer: {viewer?.name ?? 'you'} · clearance from your membership role</p><button className="secondary-action" onClick={() => { rememberFocus(); setExposureOpen(true) }}>Open visibility details</button></div><section className="data-card"><div className="card-heading"><div><h2>Visible claims</h2><p>{visibleClaims.length} claims available in this view</p></div></div><div className="claim-list">{renderClaimRows(visibleClaims.slice(0, 5), true)}</div></section><section className="data-card"><div className="card-heading"><div><h2>Withheld claims</h2><p>{withheldCount} claims hidden from this view</p></div></div>{withheldDetails.length ? withheldDetails.map((item) => <div className="withheld-row" key={item.claimId}><strong>{item.claimId}</strong><span>{item.reason}</span><small>Visible to: {({ public_open: 'Open to the team', team_internal: 'Team members', confidential_lead: 'Team leads', restricted_hr_legal: 'Restricted HR or legal roles' } as Record<string, string>)[item.requiredClearance] ?? item.requiredClearance.replaceAll('_', ' ')}</small></div>) : <p className="empty-state">No claims are withheld for this reviewer.</p>}</section></div>}
          </div>
        </main>
      </div>
      {activeConflict && <ContradictionModal item={activeConflict} canResolve={role === 'lead'} onResolve={async (type, note) => { await resolveContradiction(activeConflict.id, type, note); closeConflict() }} onClose={closeConflict} isClosing={closingDialog === 'conflict'} />}
      {interviewOpen && <LeaverInterviewModal questions={questions} onAnswer={answerInterviewQuestion} onClose={closeInterview} isClosing={closingDialog === 'interview'} />}
      {exposureOpen && <ExposureDiffModal details={withheldDetails} personaName={viewer?.name ?? 'Current reviewer'} onClose={closeExposure} isClosing={closingDialog === 'exposure'} />}
      {drawerClaim && <SourceInspectorDrawer claim={drawerClaim} onClose={closeDrawer} isClosing={closingDialog === 'drawer'} />}
      {newHandoverOpen && <NewHandoverModal onClose={() => setNewHandoverOpen(false)} onCreated={(id) => { setNewHandoverOpen(false); onSwitchHandover(id); navigate('overview') }} />}
    </div>
  )
}

function SuccessorQuestionReplies({
  queries,
  role,
  onResolve,
}: {
  queries: SuccessorQuery[]
  role: PersonaRole | null
  onResolve: (queryId: string, responseText: string) => Promise<boolean>
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  if (queries.length === 0) return <p className="empty-state">No successor questions yet.</p>

  return (
    <div className="mt-4 space-y-3">
      {queries.map((query) => (
        <article className="rounded-[6px] border border-[#262626] p-3" key={query.id}>
          <p className="text-xs leading-relaxed"><strong>{query.claimId}</strong> · {query.queryText}</p>
          {query.resolution ? (
            <div className="mt-3 border-l-2 border-[#4ade80] pl-3 text-xs">
              <p>{query.resolution.responseSnippet}</p>
              <p className="mt-1 text-[#8d8d8d]">Recorded by {query.resolution.answeredBy} · {new Date(query.resolution.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-[11px] text-[#8d8d8d]">Waiting for {query.assignedRespondent.name} · replies are recorded in the shared history</p>
              {(role === 'lead' || role === 'leaver') && <form className="mt-3 grid gap-2" onSubmit={async (event) => { event.preventDefault(); const response = drafts[query.id]?.trim(); if (response) { const ok = await onResolve(query.id, response); if (ok) setDrafts((current) => ({ ...current, [query.id]: '' })) } }}>
                <label htmlFor={`query-reply-${query.id}`} className="text-xs font-semibold">Record a reply as the {role}</label>
                <textarea id={`query-reply-${query.id}`} value={drafts[query.id] ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [query.id]: event.target.value }))} rows={2} maxLength={1000} placeholder="Add a short clarification" />
                <button className="secondary-action justify-self-start" type="submit" disabled={!drafts[query.id]?.trim()}>Record reply</button>
              </form>}
            </>
          )}
        </article>
      ))}
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: number; sub: string }) {
  return <div className="metric"><span>{label}</span><strong className="num">{value}</strong><small>{sub}</small></div>
}

function Card({ title, action, onAction, children }: { title: string; action: string; onAction: () => void; children: ReactNode }) {
  return <section className="data-card overview-card"><div className="card-heading"><h2>{title}</h2></div><div className="overview-card-content">{children}</div><button className="text-action overview-card-action" onClick={onAction}>{action} <span aria-hidden="true">→</span></button></section>
}

function sectionName(id: string) {
  return ({ decisions: 'Architecture decisions', unfinished: 'Unfinished work', ownership: 'Ownership', risks: 'Conflicts to review' } as Record<string, string>)[id] ?? id
}

function sectionDetail(id: string) {
  return ({ decisions: 'Choices, trade-offs, and supporting evidence', unfinished: 'Open work, blockers, and next actions', ownership: 'Owners, successors, and transfer dates', risks: 'Conflicting records and decisions needed' } as Record<string, string>)[id] ?? id
}
