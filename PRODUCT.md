# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** An incoming software engineer taking over a service or project. They need to understand prior decisions, open work, ownership, and unresolved risk, and then ask questions or accept parts of the handover.
- **Supporting:** The departing engineer contributes context missing from project records. A team lead reviews disagreements, records decisions, and sees the demo's exposure preview.
- These audiences are inferred from the implemented workflow and the team's project brief; production user research has not been provided.

## Product Purpose

Baton organizes a team transition into a handover workspace covering decisions, unfinished work, ownership, and risk. It gives the next owner a place to inspect the evidence, see what remains uncertain, ask for context, and record section-by-section acceptance.

## Positioning

Baton centers a handover on an inspectable claim ledger. It distinguishes exact source-text matches from inference, contradiction, missing information, and human attestation. The current demo's quote check only confirms text presence; it does not test claim entailment. Conflicts remain visible for human review instead of being silently reconciled. This is a product direction demonstrated with seeded data, not an automated production ingestion service.

## Operating Context

- Built as a web application with a Next.js App Router workspace and browser-side React interactions.
- The current demonstration uses a fabricated FinTrack Payment Core case with sample decision, work, ownership, risk, source, and persona records.
- Current live demo URL: https://gitlostbaton.xyz
- Intended workflow: successor reviews claims and source excerpts; lead inspects exposure and records a conflict decision; leaver answers targeted questions; successor records acceptance or linked questions.
- The public verifier performs deterministic exact-text matching against the fixed synthetic source corpus. It does not call an LLM or test whether a source logically supports a claim.

## Capabilities and Constraints

- The demo includes a claim ledger, source inspector, in-work decision capture (change, rationale, next action, optional unverified source reference), unfinished-work views, ownership view, contradiction review, leaver interview, persona-filtered views, lead exposure preview, successor questions, and section acceptance.
- The seeded workflow state is saved in this browser's local storage so the demo survives refreshes. There is no server database, account system, live GitHub/Slack/Linear ingestion, cross-device synchronization, or working production authorization.
- Persona switching demonstrates role-specific views; it is not authentication or a security boundary. Use synthetic data only.
- The verifier confirms an exact quote substring, with limited newline normalization. This is not a substitute for human review of the source and claim.
- No downloadable or signed handover certificate is currently issued.
- Planned capabilities such as persistent authenticated workspaces, source connectors, and report export are not current product behavior.

## Brand Commitments

- Product name: **Baton**.
- Existing domain: `gitlostbaton.xyz`.
- Preserve the product's established terminology where useful: claim ledger, evidence/provenance, decisions, unfinished work, ownership, risks/conflicts, leaver interview, and successor acceptance.
- No further binding brand or visual constraints were stated during init.

## Evidence on Hand

- Working source repository and deployed demo at https://gitlostbaton.xyz.
- Synthetic FinTrack records and an implemented sample handover workflow in `src/data/seedCase.ts` and `src/data/rawSources.ts`.
- No real customer data, user research, testimonials, production integrations, or independently validated outcomes were provided. Do not fabricate them.

## Product Principles

1. Show source excerpts and provenance beside claims.
2. Keep exact quote matching separate from claim entailment.
3. Leave contradictions and gaps visible until a person records a resolution or answer.
4. Make the next owner's decisions, unfinished work, ownership, and risks easy to scan together.
5. State the demo's synthetic-data and non-security limits wherever they affect user trust.

These principles are Codex's synthesis of the repository and the user's request to review and improve the project; treat them as working product guidance.
