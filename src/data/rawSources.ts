export interface RawSourceDocument {
  id: string
  title: string
  sourceType: 'github_pr' | 'github_commit' | 'slack_chat' | 'jira_ticket' | 'aws_secret'
  uri: string
  author: string
  timestamp: string
  requiredClearanceLevel: 'public_open' | 'team_internal' | 'confidential_lead' | 'restricted_hr_legal'
  content: string
}

export const RAW_SOURCES: Record<string, RawSourceDocument> = {
  pr_189: {
    id: 'pr_189',
    title: 'GitHub PR #189: Migrate queue worker from Redis to Postgres SKIP LOCKED',
    sourceType: 'github_pr',
    uri: 'https://github.com/fintrack/payment-core/pull/189',
    author: 'Alex Chen (Staff Engineer)',
    timestamp: '2026-08-14T14:32:00Z',
    requiredClearanceLevel: 'team_internal',
    content: `PR #189: Migrate queue worker from Redis to Postgres SKIP LOCKED
Author: Alex Chen <alex.chen@fintrack.internal>
State: MERGED (Approvals: Dev Patel, Vikram Malhotra)

Description:
Replaced the in-memory Redis queue for financial transaction events.
Postgres FOR UPDATE SKIP LOCKED provides ACID-compliant persistence, ensuring zero dropped payment transactions during worker node restarts.
Worker pool concurrency is capped at 16 threads per pod to avoid connection pool exhaustion on the main database cluster.

Reviewer Comments:
- Dev Patel: "Makes sense. Redis OOM crashes during flash sales were causing orphaned transactions."
- Alex Chen: "Confirmed. Redis has been completely decommissioned for transaction persistence."`,
  },

  pr_204: {
    id: 'pr_204',
    title: 'GitHub PR #204: Migrate settlement dispatch to AWS SQS FIFO queue',
    sourceType: 'github_pr',
    uri: 'https://github.com/fintrack/payment-core/pull/204',
    author: 'Alex Chen (Staff Engineer)',
    timestamp: '2026-10-14T09:15:00Z',
    requiredClearanceLevel: 'team_internal',
    content: `PR #204: Migrate settlement dispatch to AWS SQS FIFO queue
Author: Alex Chen <alex.chen@fintrack.internal>
State: MERGED

Description:
Successfully migrated payment settlement batch dispatch to AWS SQS FIFO queue.
All batch settlement events now stream through \`fintrack-settlement-fifo.fifo\` with exactly-once delivery guarantees.
Deprecates the legacy RabbitMQ cluster on ECS.`,
  },

  pr_214: {
    id: 'pr_214',
    title: 'GitHub PR #214 (Draft): Exponential backoff with jitter for webhook retries',
    sourceType: 'github_pr',
    uri: 'https://github.com/fintrack/payment-core/pull/214',
    author: 'Alex Chen (Staff Engineer)',
    timestamp: '2026-10-28T16:45:00Z',
    requiredClearanceLevel: 'team_internal',
    content: `PR #214: Exponential backoff with jitter for webhook retries (DRAFT)
Author: Alex Chen <alex.chen@fintrack.internal>
State: OPEN (Draft - 12 days ago)

Description:
Adding randomized full-jitter exponential backoff for outgoing merchant webhook delivery.
Prevents thundering herd problems when partner gateways recover from downtime.

CI Checks:
- Unit tests: PASSED
- Integration tests: FAILED (AssertionError in test_retry_jitter_bounds on line 84: random seed collision).
TODO: Needs seed initialization fix before merging.`,
  },

  slack_payment_eng: {
    id: 'slack_payment_eng',
    title: 'Slack #payment-eng: SQS throttling alert and RabbitMQ fallback',
    sourceType: 'slack_chat',
    uri: 'https://fintrack.slack.com/archives/C081PAY/p1730538000',
    author: 'Alex Chen',
    timestamp: '2026-11-02T11:20:00Z',
    requiredClearanceLevel: 'team_internal',
    content: `Slack Channel: #payment-eng
Date: Nov 2, 2026

[11:18 AM] Alex Chen: Heads up @here: SQS hit throttling latency spikes during yesterday's 10 AM merchant settlement surge (AWS regional burst limits reached).
[11:19 AM] Dev Patel: Did we drop webhook notifications?
[11:20 AM] Alex Chen: Temporarily routed webhook retries back to our RabbitMQ cluster while AWS support investigates the burst quota. RabbitMQ is currently handling live delivery fallback.
[11:22 AM] Vikram Malhotra: Good catch. Let's make sure Priya knows when she takes over next week.`,
  },

  slack_leadership: {
    id: 'slack_leadership',
    title: 'Slack #leadership-confidential: Staff engineering equity refresh and bonus review',
    sourceType: 'slack_chat',
    uri: 'https://fintrack.slack.com/archives/C099LEAD/p1730712000',
    author: 'Vikram Malhotra & HR',
    timestamp: '2026-11-04T15:00:00Z',
    requiredClearanceLevel: 'restricted_hr_legal',
    content: `Slack Channel: #leadership-confidential (Restricted HR / Management)
Date: Nov 4, 2026

[03:00 PM] Vikram Malhotra: Following up on Alex Chen's resignation notice. We offered a 25% equity acceleration and compensation retention package, but Alex has decided to accept the external offer.
[03:05 PM] HR Partner: Noted. His departure date is set for Nov 11. Final severance bonus and non-disclosure clauses are queued in DocuSign. Ensure no salary or equity details reach team handover notes.`,
  },

  commit_8f4a1: {
    id: 'commit_8f4a1',
    title: 'Commit 8f4a179: Auth session token TTL extended to 72 hours',
    sourceType: 'github_commit',
    uri: 'https://github.com/fintrack/payment-core/commit/8f4a179c3b8',
    author: 'Alex Chen',
    timestamp: '2026-10-04T22:11:00Z',
    requiredClearanceLevel: 'team_internal',
    content: `commit 8f4a179c3b879410ea2a014a601249b6b718872f
Author: Alex Chen <alex.chen@fintrack.internal>
Date:   Sun Oct 4 22:11:00 2026 +0530

    extend auth session token TTL from 15m to 72h // quick fix

diff --git a/src/auth/jwt.config.ts b/src/auth/jwt.config.ts
index e34190..8f4a17 100644
--- a/src/auth/jwt.config.ts
+++ b/src/auth/jwt.config.ts
@@ -12,7 +12,7 @@ export const JWT_OPTIONS = {
-  expiresIn: '15m',
+  expiresIn: '72h', // quick fix
 };`,
  },

  aws_secrets: {
    id: 'aws_secrets',
    title: 'AWS Secrets Manager: Stripe Webhook Signing Secret Key',
    sourceType: 'aws_secret',
    uri: 'arn:aws:secretsmanager:ap-south-1:123456789012:secret:prod/stripe/webhook_key',
    author: 'Alex Chen (IAM Admin)',
    timestamp: '2026-09-01T08:00:00Z',
    requiredClearanceLevel: 'team_internal',
    content: `AWS Secrets Manager Secret: \`prod/stripe/webhook_key\`
Region: ap-south-1 (Mumbai)
Last Rotated: Sept 1, 2026 by Alex Chen (Sole Key Custodian)
Escalation Note: Stripe webhook rotation keys are scheduled for bi-annual rotation on Dec 1, 2026.
CRITICAL: If not rotated with Stripe Developer Dashboard, inbound settlement confirmation webhooks will fail signature verification.`,
  },
}
