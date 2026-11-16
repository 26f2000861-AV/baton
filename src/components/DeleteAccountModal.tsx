'use client'

import { useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { AlertTriangle, UserX, X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userLogin?: string | null
  userName?: string | null
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  userLogin,
  userName,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useFocusTrap({
    containerRef,
    initialFocusRef: closeButtonRef,
    isActive: isOpen,
    onClose,
  })

  if (!isOpen) return null

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE'

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfirmed || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Failed to delete account. Please try again.')
      }

      // Successful offboarding — sign out cleanly and redirect
      await signOut({ callbackUrl: '/?offboarded=true' })
    } catch (err: any) {
      setError(err?.message || 'An error occurred during account deletion.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!submitting) onClose()
        }}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-2xl border border-red-500/20 bg-[#121215] p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-400">
              <UserX className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="delete-account-title"
                className="text-lg font-semibold tracking-tight text-white"
              >
                Leave company & delete account
              </h2>
              <p className="text-xs text-zinc-400">
                Offboarding identity for {userLogin ? `@${userLogin}` : userName || 'your account'}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Offboarding context callout */}
        <div className="my-5 space-y-3 text-xs leading-relaxed text-zinc-300">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-medium text-zinc-200">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span>What happens when you offboard:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Credentials purged:</strong> Your GitHub OAuth tokens, active sessions, and personal identity are permanently deleted from Baton.
              </li>
              <li>
                <strong className="text-zinc-200">Knowledge preserved:</strong> Decision records and evidence you approved stay with the team handover so successors keep context.
              </li>
              <li>
                <strong className="text-zinc-200">Scratchpads removed:</strong> Any unshared private handovers where you were the sole member are deleted.
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label
              htmlFor="confirm-delete-input"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              To confirm departure, type <span className="font-mono font-semibold text-red-400">DELETE</span> below:
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={submitting}
              placeholder="Type DELETE"
              autoComplete="off"
              className="w-full rounded-xl border border-white/[0.1] bg-[#0c0c0e] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus-visible:border-red-400 focus-visible:ring-1 focus-visible:ring-red-400"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-950/40 p-2.5 text-xs text-red-300" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-white/[0.08] bg-transparent px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || submitting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{submitting ? 'Offboarding & deleting…' : 'Leave company & delete account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

