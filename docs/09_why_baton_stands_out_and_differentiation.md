# Baton: Differentiation and Judge Demo Guide

> **Current Round 2 position.** This note describes what the submitted prototype can demonstrate. Baton uses a synthetic case, browser-local state, and no real authentication or integrations. It does not prove that the product can ingest a team's live engineering data or coordinate a real handover across users.

## The problem Baton chooses to make visible

An engineering handover can contain inconsistent records: one source describes a migration as complete while a later source describes a temporary rollback. A generic summary may flatten that difference. Baton makes the disagreement visible and asks a person to record how it should be interpreted.

## What the prototype demonstrates

1. **A structured handover instead of a blank document.** The seeded case groups decisions, unfinished work, ownership, risks, and questions in a workspace a successor can inspect.
2. **Evidence status stays separate from truth.** The source inspector shows sample excerpts. The optional verifier checks text presence in the synthetic corpus; a match does not establish that a whole claim is true.
3. **Conflicts stay open until a human records a choice.** The settlement view compares two sample records and requires a note before recording a decision or clarification.
4. **New context can be captured while work is happening.** A person can record a change, why it happened, a next action, and an optional unverified source reference. The entry is labeled as person-reported and saved in the current browser.

These are workflow demonstrations, not evidence that the synthetic case reflects a real team's work or that Baton has measured operational impact.

## A judge-friendly demo path

1. Open **Risks and conflicts** and select the SQS/RabbitMQ disagreement.
2. Compare each source's date and wording. Point out that the excerpts are synthetic and do not establish which system is currently correct.
3. Enter a short decision note, then choose the option that best matches the evidence and scope—or record a clarification.
4. Show the updated status in the queue, then open **Decisions** to show how an engineer can capture a later change and follow-up action.
5. State the boundary: the demo stores the decision only in this browser; it does not contact a team, import GitHub or Slack, or provide access control.

Use the seeded data and the exact behavior visible in the deployed app. Do not claim that the prototype detects conflicts from live sources or verifies the final state automatically.

## A truthful 30-second pitch

> Baton helps an incoming engineer review a structured handover of decisions, unfinished work, ownership, and risk. Its demo focuses on a common failure in handovers: two records can disagree, and a summary can hide that disagreement. Baton puts the sample evidence side by side and requires a human note before recording a resolution. The current build uses synthetic data and browser-local storage; live integrations, shared persistence, and authentication are future work.

## What could make the approach distinctive

The product bet is the review workflow: preserve source context, keep uncertainty visible, and record a human resolution with its rationale. That is a design hypothesis, not a verified claim that other teams or products do not do this. The current judging evidence is whether a reviewer can complete the conflict path without a walkthrough and understand exactly what the prototype does and does not prove.
