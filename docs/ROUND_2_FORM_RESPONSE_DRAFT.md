# Round 2 — The Build: form response draft

Use this as a drafting aid for the official submission form. Replace every `TODO` before submitting. The published event page says **each participant files their own entry** for the same project in every round. Aditya and Manas should each submit separately, confirm the current form instructions, and describe their own role and contribution in their own words.

## Team details

- **Hackathon:** CodersInPune
- **Team name:** GIT LOST — confirm this exactly matches Round 1.
- **Team leader:** Aditya Verma — confirm this exactly matches Round 1.
- **Leader email:** TODO — use the exact address submitted in Round 1.
- **Team members:** TODO — enter each member's full name on its own line, including Manas's full name.

## Product links

- **Functioning deployed project:** https://gitlostbaton.xyz/workspace#/
- **Public source repository:** https://github.com/26f2000861-AV/baton
- **Updated project PDF:** TODO — use a Drive link set to “Anyone with the link” as Viewer.

## What You Built — completed features

Paste only after checking each item works in the deployed app:

```text
An interactive handover workspace for a synthetic FinTrack Payment Core case.
An evidence ledger showing seeded claims, sample evidence statuses, and source excerpts; a user-triggered quote check reports whether edited text appears in the synthetic source corpus. A match confirms text presence only and does not update the pre-seeded claim status.
A source inspector for reviewing claim context and provenance.
A decisions view showing recorded choices, alternatives, and rationale confidence.
An unfinished-work view with triage and successor adoption actions.
An ownership view with current owners, proposed successors, transfer dates, and escalation contacts.
A contradiction review flow showing the sample SQS and RabbitMQ records and recording a human decision or clarification.
A five-question sample leaver interview flow that records answers in browser memory and adds dated history to related claims.
Persona-filtered demo views for successor, leaver, and lead; these simulate reader-scoped views and are not authentication or production access control.
Section-by-section successor review with undo, plus claim-linked questions and same-session replies from the lead persona. This sends no real messages and resets on refresh.
```

Before pasting, make sure each sentence describes a path you personally opened in the current deployed version. Remove anything that does not work there.

## Technology and implementation details

```text
Built with Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS. The workspace uses a client-side React state store seeded with synthetic handover records; it has no database or persistent backend. A server route checks whether a submitted quote appears in the fixed synthetic source corpus. It does not establish that a claim is true, update the seeded status, or call an LLM. The UI includes claim/source inspection, ownership and unfinished-work views, contradiction settlement, leaver interview, persona-filtered demo views, successor review, and same-session sample question replies.
```

## What changed from the original proposal, and why?

```text
Round 1 proposed PostgreSQL with pgvector and integrations with GitHub and other project sources. In Round 2 we narrowed the build to a self-contained demo: a synthetic seeded case, an in-memory state store, a user-triggered deterministic quote-presence check, and a human contradiction-resolution workflow. This let us demonstrate the handover workflow without claiming that live source ingestion, persistent storage, model-based entailment, or production identity and access control had been built. Those remain future work.
```

## What does NOT work yet?

```text
The app uses synthetic sample data and does not connect to live GitHub, Slack, Linear, or cloud systems. Workspace changes are held in browser memory and are lost on reload; there is no database or cross-user synchronization. Persona switching is a demo simulation, not authentication or a security boundary, so the app must not be used with real confidential data. Successor questions and lead replies are same-session sample state; no real person is notified. The verifier checks text presence only and does not validate claim entailment. Certificate generation is not available.
```

## Three improvements for Round 3

Keep these three commitments consistent in the PDF and any presentation. They are deliberately scoped as product outcomes rather than broad enterprise claims.

### Improvement 1 — Persistent, authenticated handover workspace

```text
Add sign-in, server-side role authorization, and persistent storage for handover records and workflow changes. A successor can return later and see the same claims, answers, questions, and sign-off state; a user cannot gain access merely by switching the persona control.
```

### Improvement 2 — Evidence-backed source import

```text
Add a scoped GitHub import for pull requests and commits, then map imported source records to claims with verifiable excerpts and links back to origin. The user can refresh a handover from real project records instead of relying on the seeded case. Clearly show import errors and unsupported source types.
```

### Improvement 3 — Auditable handover export

```text
Add a downloadable handover report that includes claim status, source references, unresolved conflicts, ownership transfers, open successor questions, and acceptance history. The report must label synthetic or unverified information and must not present a demo sign-off as a legal or compliance certificate.
```

## Final confirmation checklist — do not tick until true

- [ ] Opened the deployed product, public repository, and PDF in a private/incognito window.
- [ ] Repository is public and the latest intended commit is pushed.
- [ ] PDF is shared as “Anyone with the link” — Viewer.
- [ ] Every listed feature works in the deployed product and every limitation above is disclosed.
- [ ] Round 1 team name, leader name, and leader email match exactly.
- [ ] Each participant submits their own entry for the shared project, using their own role and contribution wording. Check the official form/email for any additional instructions.
- [ ] Disclose the significant AI tools actually used to build the project, in the field requested by the official form.
- [ ] Round 2 closes November 11, 2026 at 10:00 IST on the published event schedule; follow the official submission form/email if it gives a more specific instruction.
- [ ] Check the deployed link and PDF link in a private window before submitting.
