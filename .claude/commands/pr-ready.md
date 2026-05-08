---
name: pr-ready
description: Run all quality gates, verify required artifacts per task class, prepare bilingual PR description. Refuses to open PR if any gate fails.
argument-hint: "[optional: task slug to verify]"
allowed-tools: Read, Grep, Glob, Bash(npm run build:*), Bash(npx tsc:*), Bash(npx tsc --noEmit:*), Bash(npm run check:claims:*), Bash(npm run check:routes:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(gh pr create:*)
---

Skip this command for: Class A tasks (no PR required) and Class B tasks (one-line title only — gates do not apply).

## Behavior

On invocation (no argument — always operates on current ACTIVE task):

1. Read `TASKS.md`. Find the `## ACTIVE` section and determine the task's class. If class is not stated in the ACTIVE entry, block: "Class not found in ACTIVE entry. Run /classify first, then update TASKS.md."

2. Run quality gates per §20 in this order. Report PASS or FAIL per gate:
   - **Tests:** unit + e2e where they exist
   - **Type check:** `tsc --noEmit` — no new errors
   - **Build:** `npm run build` (Vite production build)
   - **Claims hook:** `scripts/check-claims.ts` passes per §13.5
   - **TASKS.md status:** active entry updated to `ready_for_merge` (not bare `[ ]` or `[ACTIVE]`)
   - **Class-specific gates:** see Parsing rules

3. Check required artifacts per §16 for the task's class. For each artifact, report PRESENT or MISSING with the expected file path:
   - **Class B:** one-line PR title drafted
   - **Class C:** bilingual PR description drafted · test for new logic · TASKS.md status updated
   - **Class C-clinical:** C artifacts + citation trace documented + clinical review artifact (`docs/reviews/clinical-PR<#>-<slug>.md`) with decision `approve` or `approve-with-conditions`
   - **Class D:** C artifacts + ADR (`docs/adrs/<slug>.md`) + rollback note + migration plan if schema changed + architect review artifact (`docs/reviews/arch-PR<#>-<slug>.md`) with decision `approve` or `approve-with-conditions`
   - **Class D-clinical:** D artifacts + citation trace + clinical review artifact (`docs/reviews/clinical-PR<#>-<slug>.md`) with decision `approve` or `approve-with-conditions`
   - **Class E:** D artifacts + citation record update + `last_reviewed` refresh documented per §13.6 + clinical review artifact (`docs/reviews/clinical-PR<#>-<slug>.md`) with decision `approve` or `approve-with-conditions` + rollback plan

4. If any gate fails or any artifact is missing, list exactly what is missing with file path or command to remediate. State:
   "PR NOT READY. [N] gates failed, [M] artifacts missing. Fix these before re-running /pr-ready."
   Stop. Do NOT produce a PR description.

5. If all gates pass and all artifacts are present, produce the bilingual PR description per §10 — English first, Technical second:

   ### English summary
   - **What this does:** [one-sentence plain-language description]
   - **Why:** [tied to task goal and which §6 rule or PRD item]
   - **What could break:** [honest risks, even small ones]
   - **How to verify:** [post-merge verification steps — what to click or test]

   ### Technical summary
   - **Files changed:** [list with +/- line counts]
   - **Tests added:** [list, or "n/a"]
   - **Class:** [A/B/C/D/E with -clinical flag if applicable]
   - **Review artifacts:** [paths to `docs/reviews/` files, or "n/a"]
   - **ADR:** [path if Class D/E, or "n/a"]

6. Close with exactly:
   "PR ready. Paste the above into your PR description and open the PR. Commit SHA: <current HEAD>"

## Parsing rules

**Class from TASKS.md:**
- Parse `## ACTIVE` section for a "Class X" label in the entry header or body.
- If ACTIVE entry uses the §15 template format, the class appears in the heading: `### [Task slug] — Class [X][-clinical?]`.
- If not found, block and ask V.

**Class-specific gates per §20:**
- All classes (C and above): tests, tsc, build, claims hook, TASKS.md status
- Class C-clinical or E: above + clinical review artifact (`docs/reviews/clinical-PR<#>-<slug>.md`) exists and `**Decision:**` field is `approve` or `approve-with-conditions`
- Class D or E: above + architect review artifact (`docs/reviews/arch-PR<#>-<slug>.md`) exists and `**Decision:**` field is `approve` or `approve-with-conditions`
- Class D-clinical: above + both review artifacts present and both approved

**Artifact presence checks:**
- Review artifacts: scan `docs/reviews/` for files matching `arch-PR*` or `clinical-PR*` whose slug matches the active task slug
- ADR: scan `docs/adrs/` for a file whose name matches the task slug or a related descriptor
- Migration plan: required for Class D only when the task description or ADR mentions schema change, database migration, or data model change
- TASKS.md status: entry must show `ready_for_merge` in its `Status:` field — not bare `[ ]` or `[ACTIVE]`. Commit SHA will be added post-commit; its absence at this stage is expected.

**PR description format:**
- English summary first (§10, plan-feature precedent — human-readable before file lists)
- Technical summary second
- Bilingual description required for Class C and above; Class B gets one-line title only

## Failure behavior

- **No `## ACTIVE` task** — "No active task found. Run /status to confirm state."
- **Class not determinable** — "Class not stated in ACTIVE entry. Run /classify first."
- **Test suite missing** — "No tests found for new logic. Per §20, tests must exist. Add tests or document an accepted exception with V approval."
- **TypeScript errors** — List first 5 errors with `file:line`. Do not attempt fix.
- **Build errors** — Report error output verbatim. Do not attempt fix.
- **Claims hook failure** — Report hook output verbatim. Reference §13.5 for what it validates (unregistered claim IDs, missing `last_reviewed`, stale-past-window citations).
- **Missing review artifact** — "Expected `docs/reviews/<filename>`. Produce the review artifact (architect-review for D, clinical-review for -clinical/E) before re-running /pr-ready."
- **Missing ADR** — "Expected `docs/adrs/<slug>.md`. Create the ADR per §16 before re-running /pr-ready."
- **Any other gate failure** — List explicitly with the specific remediation step.

## Output format

- Plain text. No emoji.
- Gate report: one line per gate, `PASS` or `FAIL` prefix, then name and detail on failure.
- Artifact report: one line per artifact, `PRESENT` or `MISSING` prefix, then expected path on missing.
- PR description follows §10 bilingual format — English summary first, Technical summary second.
- Missing-artifact list uses full file paths for actionability.
- Total output under 40 lines for a clean Class C pass; may extend to ~60 lines for Class D/E with full artifact list.
