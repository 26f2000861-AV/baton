'use client'

import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import type { HandoverState, PersonaRole } from '@/lib/types'

/**
 * Members panel — Improvement 1 (multi-user sharing).
 * Everyone sees the roster; leads invite by GitHub username, change roles,
 * and remove members. When a handover has no lead at all, its creator can
 * govern (deadlock escape hatch) — including claiming the lead seat.
 * All changes hit server-guarded routes.
 */
export default function MembersPanel({
  members,
  viewer,
  isCreator,
  pending,
  onInvite,
  onClaimLead,
}: {
  members: HandoverState['members']
  viewer: { userId: string; role: PersonaRole } | null
  isCreator: boolean
  pending: string | null
  onInvite: (githubLogin: string, role: PersonaRole) => Promise<{ ok: boolean; message?: string }>
  onClaimLead: () => Promise<boolean>
}) {
  const [githubLogin, setGithubLogin] = useState('')
  const [role, setRole] = useState<PersonaRole>('successor')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  const hasLead = members.some((member) => member.role === 'lead')
  const isLead = viewer?.role === 'lead'
  const canGovern = isLead || (isCreator && !hasLead)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!githubLogin.trim()) return
    const result = await onInvite(githubLogin.trim(), role)
    if (result.ok) {
      setFeedback({ ok: true, message: `Invited @${githubLogin.trim().replace(/^@/, '')} as ${role}. They will see this handover next time they sign in.` })
      setGithubLogin('')
    } else {
      setFeedback({ ok: false, message: result.message ?? 'The invite failed.' })
    }
  }

  return (
    <section className="view-stack" aria-labelledby="members-title">
      <section className="data-card">
        <div className="card-heading">
          <div>
            <h2 id="members-title">Team</h2>
            <p>Who can see this handover. Roles are assigned here — there is no role switching in the app.</p>
          </div>
          <span className="state-label">{members.length} member{members.length === 1 ? '' : 's'}</span>
        </div>

        {canGovern && (
          <form className="invite-form" onSubmit={submit}>
            <label htmlFor="invite-login">GitHub username</label>
            <input
              id="invite-login"
              value={githubLogin}
              onChange={(event) => setGithubLogin(event.target.value)}
              placeholder="teammate-login (they must have signed in once)"
              maxLength={100}
            />
            <label htmlFor="invite-role">Seat</label>
            <select id="invite-role" value={role} onChange={(event) => setRole(event.target.value as PersonaRole)}>
              <option value="successor">Successor — reviews, adopts, signs off</option>
              <option value="leaver">Leaver — answers the interview, attests knowledge</option>
              <option value="lead">Lead — settles conflicts, manages the team</option>
            </select>
            <button className="primary-action" type="submit" disabled={!githubLogin.trim() || pending === 'invite'}>
              <UserPlus size={14} aria-hidden="true" /> Invite
            </button>
          </form>
        )}
        {feedback && (
          <p className={`import-feedback ${feedback.ok ? 'ok' : 'error'}`} role="status">{feedback.message}</p>
        )}

        <div className="member-list">
          {members.map((member) => (
            <div className="member-row" key={member.userId}>
              {member.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.image} alt="" width={28} height={28} className="identity-avatar" />
              ) : (
                <span className="identity-avatar identity-avatar-fallback" aria-hidden="true">
                  {(member.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="member-copy">
                <strong>{member.name}{member.userId === viewer?.userId ? ' (you)' : ''}</strong>
                <small>{member.githubLogin ? `@${member.githubLogin} · ` : ''}joined {new Date(member.createdAt).toLocaleDateString()}</small>
              </div>
              <span className={`identity-role role-${member.role}`}>
                {member.role === 'lead' ? 'Lead' : member.role === 'successor' ? 'Successor' : 'Leaver'}
              </span>
            </div>
          ))}
        </div>
        {!canGovern && (
          <p className="sample-notice">Only the lead seat can invite members or change roles.</p>
        )}
        {canGovern && !isLead && (
          <div className="member-claim-lead">
            <p className="sample-notice">
              This handover has no lead yet. As its creator you can invite teammates above, or take the
              lead seat yourself to settle conflicts and manage roles.
            </p>
            <button
              className="secondary-action"
              type="button"
              onClick={async () => {
                const ok = await onClaimLead()
                setFeedback(
                  ok
                    ? { ok: true, message: 'You now hold the lead seat on this handover.' }
                    : { ok: false, message: 'The lead seat could not be claimed. Try again.' }
                )
              }}
              disabled={pending === 'claim-lead'}
            >
              Claim the lead seat
            </button>
          </div>
        )}
      </section>
    </section>
  )
}
