---
name: park
description: Append an idea to TASKS.md parking lot without
  interrupting current work.
---

Skip this command for: ideas that are actually active tasks — use /status to triage those instead.

## Behavior

On invocation with an argument `<idea>`:

1. Read `TASKS.md` in full. If missing, go to Failure behavior.
2. Find the `## ACTIVE` section to determine the current task. Extract the task slug or title only (not the full multi-line entry). If `## ACTIVE` is empty, use "(no active task)" in place of the task name.
3. Draft the parking lot entry in the exact format from CLAUDE.md §9:
   `- [YYYY-MM-DD] <idea, condensed to one line> (parked during: <active task name or "no active task">)`
   Use today's date in ISO YYYY-MM-DD format.
4. Report the draft entry to V (in a code block).
5. On V's one-word approval (`yes`, `ok`, `approved`, `go`, etc.): append to the `## PARKING LOT` section of `TASKS.md`, before the next `##` header.
6. On V's correction or rejection: redraft once with V's correction. Second rejection → abort without writing, report "Park aborted. Original current task resumes."
7. After successful append, close with exactly:
   "Parked. Resuming current task."

On invocation without an argument:

- Report: "Usage: /park `<idea>`. Describe the idea briefly; I'll condense it and ask for approval before appending."
- Do not write anything.

## Parsing rules

- Current task = first task entry in the `## ACTIVE` section. Extract slug or title only — not the full multi-line body.
- `## PARKING LOT` section may start with header only, or may contain existing entries and placeholder lines. Append the new entry at the end of the section, before the next `##` header.
- Date format: ISO YYYY-MM-DD only. No time, no timezone suffix.
- Condensed idea: trim to a single sentence. Remove filler words. Preserve domain-specific terms (calculator names, file paths, agent names).

## Failure behavior

- **`TASKS.md` missing** — "TASKS.md not found. Cannot park without the ledger." Offer to create it using the CLAUDE.md §7 structure, then retry.
- **`TASKS.md` not writable** — "TASKS.md is not writable. Cannot append." Log the drafted entry to the console so V can add it manually.
- **`## PARKING LOT` section missing** — "No ## PARKING LOT section found in TASKS.md." Offer to create the section header, then append the entry. Require V approval before creating the section.
- **V rejects the condensed version** — Redraft once incorporating V's correction. Second rejection → abort, report "Park aborted. Original current task resumes."

## Output format

- Plain text. No emoji. No decorative headers or dividers.
- Under 6 lines for a typical park.
- Draft entry shown in a code block for clarity.
- Close line is one sentence, no decoration.
