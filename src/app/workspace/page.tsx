'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, ArrowDownUp, CheckSquare,
  FileText, GitCommit, GitPullRequest, LayoutDashboard, Menu, MessageSquare,
  RotateCcw, Search, ShieldAlert, ShieldCheck, X,
} from 'lucide-react'
import PillarDecisions from '../../components/PillarDecisions'
import PillarUnfinished from '../../components/PillarUnfinished'
import PillarOwnership from '../../components/PillarOwnership'
import PillarRisks from '../../components/PillarRisks'
import BatonMark from '../../components/BatonMark'
import ContradictionModal from '../../components/ContradictionModal'
import LeaverInterviewModal from '../../components/LeaverInterviewModal'
import ExposureDiffModal from '../../components/ExposureDiffModal'
import SourceInspectorDrawer from '../../components/SourceInspectorDrawer'
import { useHandover } from '../../lib/store'

const routes = [
  { id: 'overview', label: 'Overview', hash: '#/', icon: LayoutDashboard },
  { id: 'claims', label: 'Claims', hash: '#/claims', icon: FileText },
  { id: 'decisions', label: 'Decisions', hash: '#/decisions', icon: GitCommit },
  { id: 'ownership', label: 'Ownership', hash: '#/ownership', icon: ShieldCheck },
  { id: 'risks', label: 'Risks', hash: '#/risks', icon: AlertTriangle },
  { id: 'unfinished', label: 'Unfinished work', hash: '#/unfinished', icon: GitPullRequest },
  { id: 'signoff', label: 'Sign-off', hash: '#/signoff', icon: CheckSquare },
]

const statusLabels: Record<string, string> = {
  quoted_verified: 'Verified', inferred_ai: 'Inferred', quoted_unverified: 'Unverified',
  stated_by_leaver: 'Stated', conflicting: 'Conflict', confirmed_by_lead: 'Confirmed',
}

export default function Home() {
  const {
    activePersona, setActivePersonaRole, claims, visibleClaims, withheldCount, withheldDetails, decisions,
    unfinished, ownership, contradictions, questions, queries, sectionStates,
    answerInterviewQuestion, resolveContradiction, adoptUnfinishedItem, acceptSection,
    submitSuccessorQuery, resetDemoData,
  } = useHandover()
  const [route, setRoute] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [queryText, setQueryText] = useState('')
  const [queryClaimId, setQueryClaimId] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortDescending, setSortDescending] = useState(false)
  const [claimsUpdating, setClaimsUpdating] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selectedClaimId, setSelectedClaimId] = useState('claim_09')
  const [drawerClaimId, setDrawerClaimId] = useState<string | null>(null)
  const [clearancePulse, setClearancePulse] = useState(false)
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [exposureOpen, setExposureOpen] = useState(false)
  const [closingDialog, setClosingDialog] = useState('')
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const dialogCloseTimerRef = useRef<number | null>(null)
  const claimsUpdateTimerRef = useRef<number | null>(null)
  const claimsUpdateFrameRef = useRef<number | null>(null)

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
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    if (menuOpen) window.requestAnimationFrame(() => returnFocusRef.current?.focus())
  }, [menuOpen])

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (route !== 'claims') navigate('claims')
        window.requestAnimationFrame(() => {
          const target = window.matchMedia('(max-width: 640px)').matches
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
      if (path === 'source' || raw.startsWith('source')) {
        setRoute('claims')
        setDrawerClaimId('claim_09')
        return
      }
      const valid = routes.map((item) => item.id)
      setRoute(valid.includes(path) && path ? path : 'overview')
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
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
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  useEffect(() => {
    void document.fonts.ready.then(() => {
      const probe = document.createElement('span')
      probe.textContent = '0123456789'
      Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-kpi)' })
      document.body.appendChild(probe)
      probe.remove()
    })
  }, [])

  const rememberFocus = () => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  const closeDialog = (kind: 'interview' | 'exposure' | 'conflict' | 'drawer') => {
    if (dialogCloseTimerRef.current !== null) return
    const finishClose = () => {
      if (kind === 'interview') setInterviewOpen(false)
      if (kind === 'exposure') setExposureOpen(false)
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
  const closeConflict = () => {
    closeDialog('conflict')
  }

  const openSource = (id: string) => {
    rememberFocus()
    setSelectedClaimId(id)
    setDrawerClaimId(id)
  }

  const handlePersonaChange = (role: 'successor' | 'leaver' | 'lead') => {
    setActivePersonaRole(role)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setClearancePulse(true)
      window.setTimeout(() => setClearancePulse(false), 360)
    }
  }
  const activeClaim = claims.find((claim) => claim.id === selectedClaimId) ?? claims[0]
  const drawerClaim = claims.find((claim) => claim.id === drawerClaimId)
  const activeConflict = contradictions.find((item) => item.id === selectedConflictId)
  const pendingQuestions = questions.filter((item) => item.status === 'pending_answer')
  const openConflictCount = contradictions.filter((item) => item.status === 'open_unresolved').length
  const overviewConflict = contradictions[0]
  const conflictSettled = overviewConflict?.status === 'settled_by_human'
  const conflictResolutionSummary = overviewConflict?.settlement?.resolutionType === 'accept_source_a'
    ? 'SQS FIFO was confirmed as the primary retry path.'
    : overviewConflict?.settlement?.resolutionType === 'accept_source_b'
      ? 'RabbitMQ was retained as the active retry fallback.'
      : 'A lead recorded a clarification for the routing conflict.'
  const acceptedCount = Object.values(sectionStates).filter((item) => item.isAccepted).length
  const verifiedCount = visibleClaims.filter((item) => item.status === 'quoted_verified').length
  const filteredClaims = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    return visibleClaims
      .filter((claim) => filter === 'all' || (filter === 'verified' && claim.status === 'quoted_verified') || (filter === 'inferred' && claim.status === 'inferred_ai') || (filter === 'conflict' && claim.status === 'conflicting') || (filter === 'unverified' && claim.status === 'quoted_unverified'))
      .filter((claim) => !searchTerm || `${claim.id} ${claim.statement} ${claim.sourceQuotes[0]?.sourceId} ${claim.sourceQuotes[0]?.title}`.toLowerCase().includes(searchTerm))
      .sort((a, b) => sortDescending ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id))
  }, [visibleClaims, filter, search, sortDescending])

  const titleMap: Record<string, string> = {
    overview: 'Payment Core handover', claims: 'Claims', decisions: 'Decisions',
    ownership: 'Ownership', risks: 'Routing conflict', unfinished: 'Unfinished work',
    signoff: 'Successor sign-off', interview: 'Leaver interview', source: 'Source evidence', exposure: 'Exposure diff',
  }
  const title = titleMap[route] ?? titleMap.overview

  const renderClaimRows = (rows: typeof visibleClaims, compact = false) => rows.length === 0 ? (
    <p className="empty-state">No claims match this view.</p>
  ) : rows.map((claim) => {
    const source = claim.sourceQuotes[0]
    return (
      <button className={`claim-row${selectedClaimId === claim.id ? ' selected' : ''}`} key={claim.id} onClick={() => openSource(claim.id)}>
        <span className="claim-status">{statusLabels[claim.status] ?? 'Pending'}</span>
        <span className="claim-copy"><span>{claim.statement}</span><span className="pass-line"><i /> <code>{source?.sourceId ?? '—'}</code></span></span>
        {!compact && <span className="row-arrow" aria-hidden="true">↗</span>}
      </button>
    )
  })

  return (
    <div className="framed-app">
      <aside className="sidebar" aria-label="Baton workspace">
        <Link className="brand-lockup" href="/" title="Return to landing page" aria-label="Baton - Return to landing page">
          <BatonMark />
          <span><strong>Baton</strong><small>FinTrack / Payment Core</small></span>
        </Link>
        <p className="nav-caption">Handover</p>
        <nav className="side-nav" aria-label="Handover views">
          {routes.map(({ id, label, hash, icon: Icon }) => (
            <a key={id} href={hash} className={`nav-link ${route === id ? 'selected' : ''}`} aria-current={route === id ? 'page' : undefined} onClick={(event) => { event.preventDefault(); navigate(id) }}>
              <Icon size={17} strokeWidth={1.7} /><span>{label}</span>
              {id === 'risks' && openConflictCount > 0 && <span className="nav-count">{openConflictCount}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-tools">
          <button className="nav-link" onClick={() => navigate('interview')}><MessageSquare size={17} /><span>Leaver interview</span><span className="nav-count">{pendingQuestions.length}</span></button>
          <button className="nav-link" onClick={() => navigate('exposure')}><ShieldAlert size={17} /><span>Exposure diff</span></button>
          <button className="nav-link" onClick={resetDemoData}><RotateCcw size={17} /><span>Reset sample data</span></button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="mobile-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { if (!menuOpen) rememberFocus(); setMenuOpen((open) => !open) }}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          <Link href="/" className="topbar-title" title="Return to landing page" aria-label="Baton - Return to landing page"><BatonMark compact /><div className="topbar-brand-copy"><span>Baton</span><small>{title}</small></div></Link>
          <label className="global-search"><Search size={15} /><input ref={searchInputRef} value={search} onFocus={() => { if (route !== 'claims') navigate('claims') }} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims and sources" aria-label="Search claims and sources" /><kbd>Ctrl K</kbd></label>
          <div className="persona-switcher" role="group" aria-label="Preview handover as">
            <span className="persona-switcher-label" aria-hidden="true">VIEW AS</span>
            <button type="button" className={`persona-chip${activePersona.role === 'successor' ? ' selected' : ''}`} aria-pressed={activePersona.role === 'successor'} aria-label="Preview as Priya Sharma, successor" title="Priya Sharma · Successor" onClick={() => handlePersonaChange('successor')}>
              <span className="persona-chip-name">Priya</span><span className="persona-chip-role">Successor</span>
            </button>
            <button type="button" className={`persona-chip${activePersona.role === 'leaver' ? ' selected' : ''}`} aria-pressed={activePersona.role === 'leaver'} aria-label="Preview as Alex Chen, departing engineer" title="Alex Chen · Departing engineer" onClick={() => handlePersonaChange('leaver')}>
              <span className="persona-chip-name">Alex</span><span className="persona-chip-role">Departing</span>
            </button>
            <button type="button" className={`persona-chip${activePersona.role === 'lead' ? ' selected' : ''}`} aria-pressed={activePersona.role === 'lead'} aria-label="Preview as Vikram Malhotra, engineering lead" title="Vikram Malhotra · Engineering lead" onClick={() => handlePersonaChange('lead')}>
              <span className="persona-chip-name">Vikram</span><span className="persona-chip-role">Lead</span>
            </button>
          </div>
        </header>
        {menuOpen && <div id="mobile-navigation" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Baton navigation"><Link href="/" className="nav-caption flex items-center gap-2 hover:text-[#eeeeee]" onClick={() => setMenuOpen(false)}><strong>Baton</strong> / FinTrack</Link>{routes.map(({ id, label, hash, icon: Icon }) => <a key={id} href={hash} aria-current={route === id ? 'page' : undefined} className={route === id ? 'selected' : undefined} onClick={(event) => { event.preventDefault(); navigate(id) }}><Icon size={17} />{label}</a>)}<button onClick={() => navigate('interview')}><MessageSquare size={17} />Leaver interview</button><button onClick={() => navigate('exposure')}><ShieldAlert size={17} />Exposure diff</button></div>}
        <main className={`sheet${clearancePulse ? ' clearance-pulse' : ''}`}>
          <div className="sheet-content">
            <div className="page-heading">
              <div><p className="breadcrumb">FinTrack <span>/</span> Payment Core</p><h1>{title}</h1></div>
              {route === 'overview' && <button className="primary-action" onClick={() => navigate('claims')}>Start handover review</button>}
            </div>

            {route === 'overview' && <div className="view-stack">
              <section className="finding-panel" aria-labelledby="finding-title">
                <div className="finding-copy"><span className="section-kicker">{conflictSettled ? 'Resolution recorded' : 'Needs review'}</span><h2 id="finding-title">{conflictSettled ? 'Webhook retry routing has a recorded decision' : 'Webhook retries have conflicting delivery records'}</h2><p>{conflictSettled ? conflictResolutionSummary : 'PR #204 says SQS FIFO. Slack records RabbitMQ as the active retry fallback.'}</p></div>
                <button className="secondary-action" onClick={() => navigate('risks')}>{conflictSettled ? 'Review resolution' : 'Compare sources'}</button>
              </section>
              <section className="metric-strip" aria-label="Handover counts">
                <Metric label="Claims" value={visibleClaims.length} sub={`${verifiedCount} verified`} /><Metric label="Open conflicts" value={openConflictCount} sub={openConflictCount === 0 ? 'No unresolved routing conflicts' : `${openConflictCount} routing ${openConflictCount === 1 ? 'conflict needs' : 'conflicts need'} review`} /><Metric label="Unfinished" value={unfinished.length} sub="2 successor actions" /><Metric label="Ownership" value={ownership.length} sub="2 assets to transfer" />
              </section>
              {/* Three equal columns: 3 × 368px + 2 × 24px gutters = 1152px content width. */}
              <div className="overview-grid">
                <Card title="Claim evidence" action="View claims" onAction={() => navigate('claims')}>
                  <div className="claim-list">{renderClaimRows(visibleClaims.slice(0, 3), true)}</div>
                </Card>
                <Card title="Successor sign-off" action="Review sections" onAction={() => navigate('signoff')}>
                  <div className="mini-rows">{(['decisions', 'unfinished', 'ownership', 'risks'] as const).map((id) => <div className="mini-row" key={id}><span>{sectionName(id)}</span><span className={`state-label ${sectionStates[id]?.isAccepted ? 'accepted' : ''}`}>{sectionStates[id]?.isAccepted ? 'Accepted' : 'Pending'}</span></div>)}</div>
                  <p className="card-foot">{acceptedCount} of 4 sections accepted</p>
                </Card>
                <Card title="Routing conflict" action="Resolve" onAction={() => navigate('risks')}>
                  {contradictions.slice(0, 1).map((item) => <div className="conflict-sources" key={item.id}>
                    {[item.sourceA, item.sourceB].map((source) => <div className="conflict-source" key={source.title}>
                      <strong>{source.extractedValue}</strong><span>{source.title}</span><small>{source.author} · {new Date(source.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</small><p>{source.exactQuote}</p>
                    </div>)}
                  </div>)}
                  <p className="source-key"><code>claim_09</code></p>
                </Card>
                <Card title="Decisions" action="Review decisions" onAction={() => navigate('decisions')}>
                  {decisions.slice(0, 1).map((item) => <div className="work-preview" key={item.id}><span>{item.title}</span><small>{item.provenance.rationaleConfidence === 'inferred_ai' ? 'Rationale inferred' : item.provenance.rationaleConfidence === 'documented_explicit' ? 'Rationale documented' : 'Rationale stated'} · {new Date(`${item.timestamp}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · <code>{item.associatedClaimId}</code></small></div>)}
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
              <div className="overview-bottom"><span>{acceptedCount} of 4 handover sections accepted</span><button className="text-action" onClick={() => navigate('signoff')}>Open sign-off <span aria-hidden="true">→</span></button></div>
            </div>}

            {route === 'claims' && <div className="view-stack"><div className="view-intro"><p>{visibleClaims.length} visible claims for {activePersona.name}</p><button className="secondary-action" onClick={() => navigate('exposure')}>View exposure diff</button></div><section className={`data-card claims-card${claimsUpdating ? ' is-updating' : ''}`}><div className="card-heading"><div><h2>Claims</h2><p>{filteredClaims.length} matching claims</p></div><button className="icon-action" aria-label="Sort claims by ID" aria-pressed={sortDescending} onClick={() => updateClaims(() => setSortDescending((value) => !value))}><ArrowDownUp size={16} /></button></div><label className="claims-mobile-search"><span className="sr-only">Search claims and sources</span><Search size={16} aria-hidden="true" /><input className="claims-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims and sources" /></label><div className="filter-tabs" role="tablist" aria-label="Filter claims by evidence state">{['all', 'verified', 'inferred', 'unverified', 'conflict'].map((item) => <button role="tab" aria-selected={filter === item} className={filter === item ? 'active' : ''} key={item} onClick={() => updateClaims(() => setFilter(item))}>{item === 'all' ? `All ${visibleClaims.length}` : `${item[0].toUpperCase()}${item.slice(1)} ${visibleClaims.filter((claim) => item === 'conflict' ? claim.status === 'conflicting' : claim.status === `quoted_${item === 'verified' ? 'verified' : item === 'unverified' ? 'unverified' : 'none'}` || (item === 'inferred' && claim.status === 'inferred_ai')).length}`}</button>)}</div><div className="claim-list">{renderClaimRows(filteredClaims)}</div></section></div>}

            {route === 'decisions' && <div className="native-component"><PillarDecisions decisions={decisions} isAccepted={sectionStates.decisions?.isAccepted ?? false} onInspect={openSource} onAccept={() => acceptSection('decisions')} /></div>}
            {route === 'ownership' && <div className="native-component"><PillarOwnership assets={ownership} isAccepted={sectionStates.ownership?.isAccepted ?? false} onInspect={openSource} onAccept={() => acceptSection('ownership')} /></div>}
            {route === 'risks' && <div className="native-component"><PillarRisks contradictions={contradictions} isAccepted={sectionStates.risks?.isAccepted ?? false} onContradiction={openConflict} onInspect={openSource} onAccept={() => acceptSection('risks')} /></div>}
            {route === 'unfinished' && <div className="native-component"><PillarUnfinished items={unfinished} isAccepted={sectionStates.unfinished?.isAccepted ?? false} onAdopt={adoptUnfinishedItem} onInspect={openSource} onAccept={() => acceptSection('unfinished')} /></div>}

            {route === 'signoff' && <div className="view-stack"><div className="view-intro"><p>{acceptedCount} of 4 sections accepted · {queries.length} successor questions raised</p></div><section className="data-card"><div className="card-heading"><div><h2>Handover sections</h2><p>Accept each section after reviewing its evidence.</p></div></div><div className="mini-rows">{(['decisions', 'unfinished', 'ownership', 'risks'] as const).map((id) => <div className="signoff-row" key={id}><div><strong>{sectionName(id)}</strong><small>{sectionDetail(id)}</small></div><div className="signoff-actions"><span className={`state-label ${sectionStates[id]?.isAccepted ? 'accepted' : ''}`}>{sectionStates[id]?.isAccepted ? 'Accepted' : 'Pending'}</span><button className="secondary-action" disabled={sectionStates[id]?.isAccepted} onClick={() => acceptSection(id)}>{sectionStates[id]?.isAccepted ? 'Accepted' : 'Accept section'}</button></div></div>)}</div></section><section className="data-card"><div className="card-heading"><div><h2>Successor questions</h2><p>Ask the engineering lead about unclear evidence.</p></div></div><form className="query-form" onSubmit={(event) => { event.preventDefault(); if (queryText.trim() && queryClaimId) { submitSuccessorQuery(queryClaimId, 'unclear_rationale', queryText.trim()); setQueryText('') } }}><label htmlFor="query-claim">Related claim</label><select id="query-claim" value={queryClaimId} onChange={(event) => setQueryClaimId(event.target.value)} required><option value="">Choose a claim</option>{visibleClaims.map((claim) => <option key={claim.id} value={claim.id}>{claim.id} · {claim.statement.slice(0, 90)}</option>)}</select><label htmlFor="successor-query">Question for the handover</label><textarea id="successor-query" value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Ask about a decision or missing context" /><button className="primary-action" disabled={!queryText.trim() || !queryClaimId}>Send question</button></form>{queries.slice(0, 3).map((query) => <div className="mini-row" key={query.id}><span>{query.claimId} · {query.queryText}</span><span className="state-label">{query.status === 'resolved' ? 'Resolved' : 'Pending'}</span></div>)}</section></div>}

            {route === 'interview' && <div className="view-stack"><div className="view-intro"><p>{pendingQuestions.length} questions awaiting an answer</p><button className="primary-action" onClick={() => { rememberFocus(); setInterviewOpen(true) }}>Answer questions</button></div><section className="data-card"><div className="card-heading"><div><h2>Pending questions</h2><p>Context from the departing engineer</p></div></div>{questions.map((question) => <button key={question.id} className="question-row" onClick={() => { rememberFocus(); setInterviewOpen(true) }}><span className="question-priority">{question.priorityRank}</span><span><strong>{question.promptText}</strong><small>Claim {question.associatedClaimId} · {statusLabels[claims.find((claim) => claim.id === question.associatedClaimId)?.status ?? ''] ?? 'Pending'}</small></span><span className="state-label">{question.status === 'pending_answer' ? 'Pending' : question.status === 'answered' ? 'Answered' : 'Escalated'}</span></button>)}</section></div>}

            {route === 'source' && activeClaim && <section className="data-card source-view"><div className="card-heading"><div><h2>{activeClaim.sourceQuotes[0]?.title ?? 'Source record'}</h2><p>Source inspection</p></div><span className="state-label">{statusLabels[activeClaim.status] ?? 'Pending'}</span></div><dl className="source-meta"><div><dt>Source key</dt><dd><code>{activeClaim.sourceQuotes[0]?.sourceId ?? '—'}</code></dd></div><div><dt>Author</dt><dd>{activeClaim.sourceQuotes[0]?.author ?? '—'}</dd></div><div><dt>Recorded</dt><dd>{activeClaim.sourceQuotes[0]?.timestamp ? new Date(activeClaim.sourceQuotes[0].timestamp).toISOString().slice(0, 10) : '—'}</dd></div><div><dt>Clearance</dt><dd>{activeClaim.sourceQuotes[0]?.requiredClearanceLevel?.replaceAll('_', ' ') ?? '—'}</dd></div></dl><div className="source-claim"><span>Claim · {activeClaim.id}</span><p>{activeClaim.statement}</p></div><blockquote>{activeClaim.sourceQuotes[0]?.exactSnippet ?? 'No source excerpt is available.'}</blockquote><button className="text-action" onClick={() => navigate('claims')}>← Return to claims</button></section>}

            {route === 'exposure' && <div className="view-stack"><div className="view-intro"><p>Reviewer: {activePersona.name}</p><button className="secondary-action" onClick={() => { rememberFocus(); setExposureOpen(true) }}>Open visibility details</button></div><section className="data-card"><div className="card-heading"><div><h2>Visible claims</h2><p>{visibleClaims.length} claims available at this clearance</p></div></div><div className="claim-list">{renderClaimRows(visibleClaims.slice(0, 5), true)}</div></section><section className="data-card"><div className="card-heading"><div><h2>Withheld claims</h2><p>{withheldCount} restricted by reviewer clearance</p></div></div>{withheldDetails.length ? withheldDetails.map((item) => <div className="withheld-row" key={item.claimId}><strong>{item.claimId}</strong><span>{item.reason}</span><small>Requires {item.requiredClearance}</small></div>) : <p className="empty-state">No claims are withheld for this reviewer.</p>}</section></div>}
          </div>
        </main>
      </div>
      {activeConflict && <ContradictionModal item={activeConflict} onResolve={(type, note) => { resolveContradiction(activeConflict.id, type, note); closeConflict() }} onClose={closeConflict} isClosing={closingDialog === 'conflict'} />}
      {interviewOpen && <LeaverInterviewModal questions={questions} onAnswer={answerInterviewQuestion} onClose={closeInterview} isClosing={closingDialog === 'interview'} />}
      {exposureOpen && <ExposureDiffModal details={withheldDetails} onClose={closeExposure} isClosing={closingDialog === 'exposure'} />}
      {drawerClaim && <SourceInspectorDrawer claim={drawerClaim} onClose={closeDrawer} isClosing={closingDialog === 'drawer'} />}
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
  return ({ decisions: 'Architecture decisions', unfinished: 'Unfinished work', ownership: 'Ownership', risks: 'Routing conflict' } as Record<string, string>)[id] ?? id
}

function sectionDetail(id: string) {
  return ({ decisions: 'Postgres queue persistence and token rationale', unfinished: 'Webhook retries and database migration cleanup', ownership: 'Two assets, owners, successors, and transfer dates', risks: 'SQS FIFO and RabbitMQ source records' } as Record<string, string>)[id] ?? id
}
