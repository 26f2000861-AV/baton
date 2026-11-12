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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-handover-title"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-[8px] border border-[#E6E6E6] bg-[#FFFFFF] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">Your workspace</span>
            <h2 id="new-handover-title" className="mt-1 text-lg font-semibold text-[#0A0A0A]">
              New handover
            </h2>
            <p className="mt-1 text-xs text-[#6B6B6B]">
              Create a workspace you own. Choosing a seat here assigns your role on the server — you can
              invite teammates into the other seats later.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="min-hit rounded-[6px] border border-[#D4D4D4] bg-white p-2 text-[#0A0A0A] hover:bg-[#EEEEEE]"
            aria-label="Close new handover dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-4">
          <div>
            <label htmlFor="new-handover-name" className="text-xs font-semibold text-[#0A0A0A]">
              Name
            </label>
            <input
              id="new-handover-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              placeholder={fromTemplate ? 'Helios Observability Platform — sample handover' : 'Untitled handover'}
              className="mt-1 w-full rounded-[6px] border border-[#D4D4D4] bg-white px-3 py-2 text-sm text-[#0A0A0A]"
            />
          </div>

          <fieldset className="rounded-[6px] border border-[#E6E6E6] p-3">
            <legend className="px-1 text-xs font-semibold text-[#0A0A0A]">Start from</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className={`flex cursor-pointer gap-2 rounded-[6px] border p-3 text-xs ${fromTemplate ? 'border-[#0A0A0A] bg-[#F5F5F5]' : 'border-[#E6E6E6]'}`}>
                <input type="radio" name="fromTemplate" checked={fromTemplate} onChange={() => setFromTemplate(true)} className="mt-0.5" />
                <span>
                  <strong className="block text-[#0A0A0A]">Helios sample</strong>
                  <small className="text-[#6B6B6B]">A private clone of the synthetic handover: seeded claims, one live conflict, interview questions.</small>
                </span>
              </label>
              <label className={`flex cursor-pointer gap-2 rounded-[6px] border p-3 text-xs ${!fromTemplate ? 'border-[#0A0A0A] bg-[#F5F5F5]' : 'border-[#E6E6E6]'}`}>
                <input type="radio" name="fromTemplate" checked={!fromTemplate} onChange={() => setFromTemplate(false)} className="mt-0.5" />
                <span>
                  <strong className="block text-[#0A0A0A]">Blank handover</strong>
                  <small className="text-[#6B6B6B]">Empty workspace — import a real GitHub repository to fill it with evidence.</small>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-[6px] border border-[#E6E6E6] p-3">
            <legend className="px-1 text-xs font-semibold text-[#0A0A0A]">Your seat</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROLE_CARDS.map((card) => (
                <label key={card.role} className={`flex cursor-pointer gap-2 rounded-[6px] border p-3 text-xs ${role === card.role ? 'border-[#0A0A0A] bg-[#F5F5F5]' : 'border-[#E6E6E6]'}`}>
                  <input type="radio" name="role" checked={role === card.role} onChange={() => setRole(card.role)} className="mt-0.5" />
                  <span>
                    <strong className="block text-[#0A0A0A]">{card.title}</strong>
                    <small className="text-[#6B6B6B]">{card.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-xs text-[#B42318]" role="alert">{error}</p>}
          <div className="flex justify-end gap-2">
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
