---
name: status
description: Session-start orientation. Reads TASKS.md and PRD.md,
  reports state, recommends next task.
---

Skip this command for: single-question (Class A) sessions, V-initiated Class B edits with explicit scope, re-entry within the same work day on a known task.

## Behavior

On invocation:

1. Read `TASKS.md` in full. If missing, go to Failure behavior.
2. Read `PRD.md` in full. If missing, note it and continue with TASKS.md only.
3. Parse `TASKS.md` by section headers. Sections to read: `## ACTIVE`, `## BLOCKED`, `## PENDING`, `## PARKING LOT`. Ignore `## CONFIRMED CLEAN` and `## POST-MORTEMS` for the state report — they are historical.
4. Produce the report below, then ask the closing question.

### Report structure (in this order)

**Last activity** — Find the most recent entry in `## CONFIRMED CLEAN` (last item in the section). Report its name and commit SHA in one line. If the section is empty or missing, report "(none recorded)".

**Active now** — Copy the contents of `## ACTIVE` verbatim. If empty, report "(none)".

**Blocked** — List each item in `## BLOCKED` with its stated reason. If empty, report "(none)".

**Pending** — Count open items (`[ ]`) in `## PENDING` by layer and priority group. Report as a one-line tally, e.g.: `L4 (9 open), L5 (4 open), P1 (8 open), P2 (1 open)`. Omit layers/groups where all items are done or skipped. Do not enumerate individual items.

**Parking lot** — List each entry in `## PARKING LOT`. If empty or header-only, report "(none)".

**Recommended next** — Pick ONE task:
- If `## ACTIVE` is non-empty: always recommend "Continue ACTIVE: <item>".
- If `## ACTIVE` is empty: recommend the highest-priority open PENDING item — P1 before P2, lower layer number before higher. State one sentence of rationale.

Close with exactly:
> "Continue with the recommended task, or would you prefer to pick a different one?"

## Parsing rules

- Section headers may have extra whitespace or trailing text — match on `## SECTIONNAME` prefix.
- Open items are any line containing `[ ]`. Items marked `[x]`, `[ACTIVE]`, `[SKIPPED]`, or other filled brackets are not open.
- Tally counts only open items — ignore `[x]` and `[SKIPPED BY AGREEMENT]` entries.
- If a section header is missing entirely, report "(section not found)" for that field rather than erroring.

## Failure behavior

- **TASKS.md missing** — Report "TASKS.md not found at repo root." Offer to create it using the template structure from CLAUDE.md §15. Skip the recommendation.
- **PRD.md missing** — Continue with TASKS.md only. Note: "PRD.md not found — product context unavailable."
- **Both missing** — Report both absences. Offer to scaffold both. Skip the recommendation.

## Output format

- Plain text. No emoji. No decorative headers or dividers.
- Under 25 lines for a typical repo state.
- Tally counts inline — do not use sub-bullets for the pending count.
- One blank line between report sections.
