# AI Tools Disclosure — CodersInPune Round 3

**Team:** GIT LOST (Aditya Verma — leader, full-stack; Manas Kapoor — documentation/testing)
**Product:** Baton — engineering handovers with evidence

## What this declaration covers

The hackathon rules require teams to disclose significant AI tools used to
build the product. This document is the disclosure for Round 3. It is
deliberately specific about **where** AI was used, because Baton itself is
built around the opposite principle: **the product's evidence pipeline is
deterministic and contains no LLM anywhere**.

## How AI tools were used to BUILD the project

| Tool | Used for | Scope |
|---|---|---|
| Z.ai chat agent (GLM) | Code scaffolding and iteration: NextAuth wiring, Prisma schema drafting, refactoring the Round 2 client store into the server-backed store, GitHub import implementation, UI panels (Sources, History, Team), this documentation | Significant portions of application code were drafted with AI assistance and reviewed/edited by the team before committing |
| GitHub Copilot-style inline completion | Minor repetitive code (className strings, test fixtures) | Incidental |

Both teammates reviewed every committed change, ran the verification suites
(typecheck, lint, unit tests, browser end-to-end checks), and understand the
shipped code. Prompt logs and iteration history are available on request.

## How AI is NOT used INSIDE the product (important)

- **The verifier is deterministic.** Claim verification is exact substring
  matching (`src/lib/verifier.ts`) — no model decides whether a quote is real.
- **The GitHub import pipeline is deterministic** (`src/lib/githubMappers.ts`):
  REST payloads are mapped to claims with fixed rules. No LLM summarises,
  ranks or invents evidence.
- The only AI-*related* label in the UI (`inferred_ai`, "Rationale inferred")
  marks claims whose rationale was **not** verbatim-attested in a source. It is
  a provenance label, not a runtime model call.
- No user data is sent to any model provider by the app.

## Runtime dependency statement

The production runtime makes outbound calls to exactly two third-party APIs:
GitHub (read-only, for imports) and the Neon Postgres endpoint. Nothing else.

---

*Prepared for the Round 3 submission form field "disclose the significant AI
tools actually used". Keep this file consistent with the updated project PDF.*
