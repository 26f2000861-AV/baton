'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check } from 'lucide-react'
import BatonMark from '@/components/BatonMark'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { PersonaRole } from '@/lib/types'

const ROLE_CARDS: { role: PersonaRole; title: string; description: string; picks: string }[] = [
  {
    role: 'successor',
    title: 'Successor',
    description: 'Inherit the handover: review evidence, adopt unfinished work, ask questions, sign off section by section.',
    picks: 'Recommended for your first look — this is the core scored workflow.',
  },
  {
    role: 'leaver',
    title: 'Leaver',
    description: 'Answer the gap-driven interview and attest knowledge while you are still here.',
    picks: 'See what the departing engineer is asked before notice is even given.',
  },
  {
    role: 'lead',
    title: 'Lead',
    description: 'Settle contradictions with decision notes, invite the team, import real GitHub repositories.',
    picks: 'Try this next to record the VM-vs-Thanos settlement and run an import.',
  },
]

/**
 * First-login role picker — Improvement 1.
 * The chosen seat creates your private clone of the Helios sample and is
 * written to your membership on the SERVER. This is not a preview switch:
 * changing your role later requires the handover lead.
 */
export default function RolePickerPage() {
  const { status } = useSession()
  const router = useRouter()
  const [role, setRole] = useState<PersonaRole>('successor')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap({ containerRef, isActive: true })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin')
      return
    }
    if (status !== 'authenticated') return
    // Members who already own a handover go straight to the workspace.
    fetch('/api/me', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : { handovers: [] }))
      .then((payload: { handovers?: { id: string }[] }) => {
        if (payload.handovers && payload.handovers.length > 0) {
          router.replace(`/workspace?h=${payload.handovers[0].id}`)
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [status, router])

  const createHandover = async () => {
    setCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromTemplate: true, role }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        setError(payload?.error?.message ?? 'The handover could not be created.')
        setCreating(false)
        return
      }
      router.replace(`/workspace?h=${payload.handover.id}`)
    } catch {
      setError('Network problem — the handover could not be created.')
      setCreating(false)
    }
  }

  if (checking || status !== 'authenticated') {
    return (
      <div className="framed-app">
        <main className="signin-screen">
          <div className="signin-card signin-card-compact">
            <BatonMark />
            <p>Preparing your workspace…</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="framed-app" ref={containerRef} tabIndex={-1}>
      <main className="signin-screen">
        <div className="signin-card signin-card-wide">
          <div className="signin-head">
            <BatonMark />
            <div>
              <h1>Choose your seat</h1>
              <p>
                This creates your private clone of the Helios sample handover and assigns your role on
                the server. You can create more handovers in other seats any time — or invite teammates
                into this one.
              </p>
            </div>
          </div>

          <div className="role-picker-grid" role="radiogroup" aria-label="Choose your role on the sample handover">
            {ROLE_CARDS.map((card) => (
              <button
                key={card.role}
                type="button"
                role="radio"
                aria-checked={role === card.role}
                className={`role-picker-card role-picker-${card.role} ${role === card.role ? 'selected' : ''}`}
                onClick={() => setRole(card.role)}
              >
                <span className="role-picker-title">
                  {role === card.role && <Check size={14} aria-hidden="true" />}
                  {card.title}
                </span>
                <span className="role-picker-description">{card.description}</span>
                <span className="role-picker-picks">{card.picks}</span>
              </button>
            ))}
          </div>

          {error && <p className="role-picker-error" role="alert">{error}</p>}

          <button
            type="button"
            className="primary-action role-picker-create"
            onClick={createHandover}
            disabled={creating}
          >
            {creating ? 'Creating your sample handover…' : 'Create my sample handover'}
          </button>
          <p className="role-picker-footnote">
            Every view, answer and decision you record is saved on the server and shared with the members
            of your handover — across devices and browsers.
          </p>
        </div>
      </main>
    </div>
  )
}
