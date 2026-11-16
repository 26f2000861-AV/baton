'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import type { ViewerIdentity } from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  successor: 'Successor',
  leaver: 'Leaver',
  lead: 'Lead',
}

/**
 * Replaces Round 2's persona switcher (Improvement 1, visible proof).
 * Shows the real signed-in GitHub identity + this member's role on the
 * active handover. There is deliberately no role switching here — the role
 * comes from the membership record on the server.
 */
/**
 * Display name without the parenthetical seat suffix — the role pill next
 * to it already communicates the seat, and the suffix made every name
 * truncate ("Priya Sharma (Success…") in the chip's max-width.
 */
const displayName = (name: string | null) =>
  (name ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim() || (name ?? '?')

export default function IdentityChip({ viewer }: { viewer: ViewerIdentity | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  if (!viewer) return null

  const shownName = displayName(viewer.name)
  const initial = (shownName || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="identity-chip-wrap">
      <button
        type="button"
        className="identity-chip"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Signed in as ${shownName}, role: ${ROLE_LABELS[viewer.role] ?? viewer.role}`}
        title={viewer.name ?? undefined}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {viewer.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={viewer.image} alt="" className="identity-avatar" width={26} height={26} />
        ) : (
          <span className="identity-avatar identity-avatar-fallback" aria-hidden="true">{initial}</span>
        )}
        <span className="identity-name">{shownName}</span>
        <span className={`identity-role role-${viewer.role}`}>{ROLE_LABELS[viewer.role] ?? viewer.role}</span>
      </button>
      {menuOpen && (
        <div className="identity-menu" role="menu" aria-label="Account">
          <p className="identity-menu-login">{viewer.githubLogin ? `@${viewer.githubLogin}` : viewer.name}</p>
          <p className="identity-menu-role">Signed in as {viewer.name}. Your seat on this handover: {ROLE_LABELS[viewer.role] ?? viewer.role}. Roles are assigned by the handover lead — switching is not a control.</p>
          <button
            type="button"
            className="identity-signout"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={14} aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
