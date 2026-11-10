# Round 2 — The Build: form response draft

Use this as a copy/paste draft for the official submission form. Replace every `TODO` before submitting. The form says the team leader submits once for the whole team.

## Team details

- **Hackathon:** CodersInPune
- **Team name:** GIT LOST — confirm this exactly matches Round 1.
- **Team leader:** Aditya Verma — confirm this exactly matches Round 1.
- **Leader email:** TODO — use the exact address submitted in Round 1.
- **Team members:** TODO — enter each member's full name on its own line, including Manas's full name.

## Product links

- **Functioning deployed project:** TODO — paste the deployed app URL, not a repository or video.
- **Public source repository:** https://github.com/26f2000861-AV/baton
- **Updated project PDF:** TODO — use a Drive link set to “Anyone with the link” as Viewer.

## What You Built — completed features

Paste only after checking each item works in the deployed app:

```text
An interactive handover workspace for a synthetic FinTrack Payment Core case.
An evidence ledger showing claims, their evidence status, and source excerpts; exact quote verification checks whether a submitted quote appears in the source text.
A source inspector for reviewing claim context and provenance.
A decisions view showing recorded choices, alternatives, and rationale confidence.
An unfinished-work view with triage and successor adoption actions.
An ownership view with current owners, proposed successors, transfer dates, and escalation contacts.
A contradiction review flow showing the sample SQS and RabbitMQ records and recording a human decision or clarification.
A five-question leaver interview flow that records sample answers and adds dated history to related claims.
Persona-filtered demo views for successor, leaver, and lead; these simulate reader-scoped views and are not authentication or production access control.
Section-by-section successor sign-off and claim-linked questions.
Optional Gemini entailment checking when GEMINI_API_KEY is configured, with a heuristic fallback when the API is unavailable or unconfigured.
```

## Technology and implementation details

```text
Built with Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS. The workspace uses a client-side React state store seeded with synthetic handover records; it has no database or persistent backend. A server route verifies that quoted text occurs in a known source and can optionally send the quote and claim to Gemini 1.5 Flash for entailment analysis when GEMINI_API_KEY is configured. Gemini output is schema-checked, and a heuristic fallback is used when the API cannot provide a valid response. The UI includes claim/source inspection, ownership and unfinished-work views, contradiction settlement, leaver interview, persona-filtered demo views, and successor sign-off. The technically important implementation choice is separating deterministic quote matching from model-based entailment: the model does not establish that the quote exists in the source.
```

## What changed from the original proposal, and why?

```text
Round 1 proposed PostgreSQL with pgvector and integrations with GitHub and other project sources. In Round 2 we narrowed the build to a working, self-contained demo: a synthetic seeded case, an in-memory state store, deterministic quote matching, optional Gemini entailment, and a human contradiction-resolution workflow. This let us demonstrate the handover workflow without claiming that live source ingestion, persistent storage, or production identity and access control had been built. Those remain future work.
```

## What does NOT work yet?

```text
The app uses synthetic sample data and does not connect to live GitHub, Slack, Linear, or cloud systems. Workspace changes are held in browser memory and are lost on reload; there is no database or cross-user synchronization. Persona switching is a demo simulation, not authentication or a security boundary, so the app must not be used with real confidential data. Successor questions do not notify a real respondent. Certificate generation is not available in the main workspace; the certificate component is not wired into its sign-off flow. Gemini entailment requires GEMINI_API_KEY; when unavailable or invalid, the app uses a heuristic fallback that is not a substitute for human review.
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
- [ ] Only the team leader submits, once, for the whole team.
