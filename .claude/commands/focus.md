---
name: focus
description: Re-state current task, refuse scope creep, park new
  ideas rather than absorb them.
---

Skip this command for: sessions with no active task (use /status instead).

## Behavior

On invocation:

1. Read `TASKS.md` in full. If missing, go to Failure behavior.
2. Find the `## ACTIVE` section. If empty, go to Failure behavior.
3. Copy the active task contents verbatim. Report in this format:

   Current focus: <active task name>
   Goal: <one sentence from the task entry>
   Acceptance checks: <list from task entry, if present>
   Status: <inline marker — in_progress, blocked:<reason>, etc.>

4. Close with exactly:
   "Staying on this task. Anything new goes to the parking lot — say /park <idea> or describe it and I'll propose a park entry."

## Behavior when V introduces new scope mid-task

If V mentions a new feature, bug, or idea in the same turn or subsequent turns without using `/park`:

1. Draft a parking lot entry in the format required by CLAUDE.md §9:
   `- [YYYY-MM-DD] <idea, condensed to one line> (parked during: <active task name>)`
2. Show V the draft entry. Ask for one-word approval.
3. On approval: append to the `## PARKING LOT` section of `TASKS.md`.
4. Resume the active task.

Exception: if V states the new input is a production bug, clinical safety issue, or regulatory concern, do NOT auto-park. Ask V explicitly: "This sounds like a pivot, not a park. Confirm switching to <new task>?"

## Parsing rules

- Active task = contents of `## ACTIVE` section in `TASKS.md`.
- If `## ACTIVE` is empty, there is no active task — see Failure behavior.
- Accept `## ACTIVE` items in any format (single line or multi-line with sub-fields).
- If a sub-field (Goal, Acceptance checks, Status) is absent from the task entry, omit that line from the report rather than guessing.

## Failure behavior

- **`TASKS.md` missing** — "TASKS.md not found at repo root. No active task to focus on."
- **`## ACTIVE` section empty** — "No active task. Use /status to pick one, or describe what you want to work on."
- **Multiple items in `## ACTIVE`** — Report all items, ask V which one is current. Do not guess.

## Output format

- Plain text. No emoji. No decorative headers or dividers.
- Under 15 lines for a typical state.
- One blank line between report fields.
