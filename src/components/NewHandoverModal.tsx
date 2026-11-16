'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { PersonaRole } from '@/lib/types'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const ROLE_CARDS: {
  role: PersonaRole
  title: string
  description: string
}[] = [
  {
    role: 'successor',
    title: 'Successor',
    description: 'Inherit the handover: review evidence, adopt unfinished work, ask questions, sign off section by section.',
  },
  {
    role: 'leaver',
    title: 'Leaver',
    description: 'Answer the gap-driven interview and attest knowledge while you are still here.',
  },
  {
    role: 'lead',
    title: 'Lead',
    description: 'Settle contradictions, invite the team, import real GitHub repositories into the handover.',
  },
]

/**
 * New handover modal — create a blank handover or a private clone of the
 * Helios sample, choosing your own seat. The chosen role is written to
 * your membership on the server (it is not a client-side preview switch).
 */
export default function NewHandoverModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (handoverId: string) => void
}) {
  const [name, setName] = useState('')
  const [fromTemplate, setFromTemplate] = useState(true)
  const [role, setRole] = useState<PersonaRole>('successor')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: true,
    onClose,
  })

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, fromTemplate, role }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        setError(payload?.error?.message ?? 'The handover could not be created.')
        return
      }
      onCreated(payload.handover.id)
    } catch {
      setError('Network problem — the handover could not be created.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-handover-title"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-[12px] border border-[#2a2a2e] bg-[#141416] p-6 text-[#f4f4f5] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Your workspace</span>
            <h2 id="new-handover-title" className="mt-1 text-lg font-semibold text-white">
              New handover
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Create a workspace you own. Choosing a seat here assigns your role on the server — you can
              invite teammates into the other seats later.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-[8px] border border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
            aria-label="Close new handover dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-4">
          <div>
            <label htmlFor="new-handover-name" className="text-xs font-semibold text-zinc-200">
              Name
            </label>
            <input
              id="new-handover-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              placeholder={fromTemplate ? 'Helios Observability Platform — sample handover' : 'Untitled handover'}
              className="mt-1 w-full rounded-[8px] border border-white/[0.1] bg-[#0c0c0e] px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition focus-visible:outline-2 focus-visible:outline-orange-400/70"
            />
          </div>

          <fieldset className="rounded-[8px] border border-white/[0.1] p-3.5">
            <legend className="px-1.5 text-xs font-semibold text-zinc-200">Start from</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className={`flex cursor-pointer gap-2.5 rounded-[8px] border p-3 text-xs transition ${fromTemplate ? 'border-white/30 bg-white/[0.06]' : 'border-white/[0.08] bg-[#18181c] hover:border-white/[0.15]'}`}>
                <input type="radio" name="fromTemplate" checked={fromTemplate} onChange={() => setFromTemplate(true)} className="mt-0.5" />
                <span>
                  <strong className="block text-white">Helios sample</strong>
                  <small className="text-zinc-400">A private clone of the synthetic handover: seeded claims, one live conflict, interview questions.</small>
                </span>
              </label>
              <label className={`flex cursor-pointer gap-2.5 rounded-[8px] border p-3 text-xs transition ${!fromTemplate ? 'border-white/30 bg-white/[0.06]' : 'border-white/[0.08] bg-[#18181c] hover:border-white/[0.15]'}`}>
                <input type="radio" name="fromTemplate" checked={!fromTemplate} onChange={() => setFromTemplate(false)} className="mt-0.5" />
                <span>
                  <strong className="block text-white">Blank handover</strong>
                  <small className="text-zinc-400">Empty workspace — import a real GitHub repository to fill it with evidence.</small>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-[8px] border border-white/[0.1] p-3.5">
            <legend className="px-1.5 text-xs font-semibold text-zinc-200">Your seat</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROLE_CARDS.map((card) => (
                <label key={card.role} className={`flex cursor-pointer gap-2.5 rounded-[8px] border p-3 text-xs transition ${role === card.role ? 'border-white/30 bg-white/[0.06]' : 'border-white/[0.08] bg-[#18181c] hover:border-white/[0.15]'}`}>
                  <input type="radio" name="role" checked={role === card.role} onChange={() => setRole(card.role)} className="mt-0.5" />
                  <span>
                    <strong className="block text-white">{card.title}</strong>
                    <small className="text-zinc-400">{card.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="secondary-action" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-action" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create handover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
