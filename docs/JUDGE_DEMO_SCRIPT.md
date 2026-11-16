# Judge Demo Script — 3 Minutes Through Baton

A click-by-click path that shows the strongest flows in order. Every stop
below is reachable from the demo seat — no setup, no GitHub authorization.

**Start:** open https://www.gitlostbaton.xyz (logged out).

## 0:00 — Landing page (server-rendered, SEO/GEO-ready)

- Headline and workflow sections render server-side (view source: full HTML,
  Open Graph/Twitter cards, `Organization` + `FAQPage` JSON-LD).
- `https://www.gitlostbaton.xyz/llms.txt` and `/sitemap.xml` exist for
  crawlers and AI answer engines — this is the discoverability layer we
  added in Round 3.
- Click **Enter the workspace** (or go straight to `/signin`).

## 0:20 — 1-click demo sign-in

- On `/signin`, click the **`Successor · Priya Sharma`** seat.
- One click lands you inside a populated handover workspace — no starting
  screen, no empty state.

## 0:35 — Overview (command center)

- Counts at the top: total claims, open conflicts, unfinished work,
  verified evidence, sections signed off.
- The "finding" line summarizes the highest-priority risk in the handover.

## 0:50 — Claims (evidence + reader-scoped privacy)

- Every claim card shows a **status label** (Quote found / Unverified /
  Inferred / Conflict / Missing / Leaver stated / Lead confirmed).
- Notice the header: **"N visible to your seat · M withheld"** — Priya
  (successor clearance) does not see confidential/HR-tier claims, and the
  app says so instead of silently hiding them.
- Open any claim's source: the **verbatim quote** is highlighted with a
  link back to the origin (PR/commit/Slack/Jira).

## 1:20 — Conflicts (the differentiator)

- Sidebar → **Conflicts** (badge shows the open count).
- Open a contradiction: two sources disagree, shown side by side with each
  quote. This is what handover docs never tell you.
- *(Optional, +40s)* Sign out, back in as **`Lead · Vikram Malhotra`**,
  reopen the conflict and **settle** it with a decision note — the
  settlement lands in History with the lead's identity.

## 1:50 — Unfinished work & Ownership

- **Unfinished work**: open PRs mapped to adoptable work items; a successor
  can adopt one.
- **Ownership**: who owns which asset — with the risk weightings.

## 2:10 — Sign-off (the acceptance gate)

- **Sign-off** page: section-by-section acceptance. A successor cannot
  blanket-approve; queries block sign-off until resolved.

## 2:30 — Sources & import (live GitHub engine)

- Sidebar → **Sources & import**. Enter any public repo, e.g.
  `26f2000861-AV/baton`, and run the import.
- Job card shows tiered auth (`user_oauth → server_pat → public`), PR/commit
  counts, and the claims it produced — all with origin links.

## 2:50 — Close (say this)

> "Every claim traces to a verbatim source quote. Every reader sees only
> what their clearance allows — and Baton tells them what was withheld.
> Conflicts get settled with an audit trail, sign-off is gated per section,
> and the whole workspace is server-authorized and persistent."

## If you have 5 more minutes

- **History**: dated work updates with author identity; machine
  verification is a separate badge from human explanation.
- **Team**: invite members; creator-of-handover protection and lead-governance
  rules are enforced server-side (`tests/authz.test.mts` covers the truth table).
- **Leaver interview** (sign in as `Leaver · Alex Chen`): gap-driven exit
  interview — questions are generated from missing coverage, not a template.
- **Cross-device persistence**: open the workspace in a second browser,
  sign in as the same seat — the state is identical.
- **Reliability probes**: `GET /api/health` (uptime probe); unauthorized
  API calls return 401/403/404 exactly as `AUDIT_CHANGELOG.md` documents.
