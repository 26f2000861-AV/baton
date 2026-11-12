/**
 * Activity log action verbs — the single source of truth (Improvement 3).
 * The audit loop verifies no route writes an unlisted verb.
 */
export const ACTIVITY_ACTIONS = {
  handoverCreated: 'handover.created',
  handoverReset: 'handover.reset',
  memberInvited: 'member.invited',
  memberRoleChanged: 'member.role_changed',
  memberRemoved: 'member.removed',
  workUpdateCaptured: 'work_update.captured',
  contradictionSettled: 'contradiction.settled',
  contradictionClarified: 'contradiction.clarified',
  interviewAnswered: 'interview.answered',
  sectionAccepted: 'section.accepted',
  sectionUndone: 'section.undone',
  itemAdopted: 'item.adopted',
  querySubmitted: 'query.submitted',
  queryResolved: 'query.resolved',
  importCompleted: 'import.completed',
} as const

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS]

export const ACTION_LABELS: Record<ActivityAction, string> = {
  'handover.created': 'created the handover',
  'handover.reset': 'reset the handover to the sample baseline',
  'member.invited': 'invited a member',
  'member.role_changed': 'changed a member role',
  'member.removed': 'removed a member',
  'work_update.captured': 'captured a work update',
  'contradiction.settled': 'settled a contradiction',
  'contradiction.clarified': 'recorded a clarification',
  'interview.answered': 'answered an interview question',
  'section.accepted': 'accepted a section',
  'section.undone': 'undid a section acceptance',
  'item.adopted': 'adopted a work item',
  'query.submitted': 'submitted a question',
  'query.resolved': 'resolved a question',
  'import.completed': 'imported from GitHub',
}
