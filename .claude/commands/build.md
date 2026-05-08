---
name: build
description: Unified entrypoint for all code work. Classify → plan → specialist review routing → approval gate → execute → quality gates → commit → push → PR. The single verb for starting any new task.
argument-hint: "<task description>"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm run build:*), Bash(npm run dev:*), Bash(npx tsc --noEmit:*), Bash(npm run check:claims:*), Bash(npm run check:routes:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(gh pr create:*)
---

## When to use /build

Use `/build <task>` for every piece of work except:
- Pure questions — ask directly, no command needed.
- Reverting a clearly broken commit — use `/rollback <sha>`.
- TASKS.md or doc-only updates that aren't governance — edit directly.
- Strategic conversation with no code yet — talk it out without /build.

If in doubt, use `/build`. It will classify the task and tell you if the full machinery is overkill.

---

## Full workflow — what /build does

### Step 1 — Classify

Apply the §6 decision tree to the task argument.

State:
```
Classification: Class <X>[-clinical]
Reasoning: <one sentence referencing §6.1 example>
```

If ambiguous between two classes: present both candidates with trade-offs per /classify behavior. **Stop.** Do not proceed without V confirming the class.

### Step 2 — Dispatch by class

**Class A** → Answer directly. No plan, no commit, no further steps.

**Class B** → Make the edit (≤5 lines, single file). State what changed in one sentence. Commit with a one-line message per §16. Push. Report done. No plan required. **Do not ask V to run anything.**

**Class C / D / E** → Continue to Step 3.

---

### Step 3 — Produce the plan (Class C/D/E)

Output the plan in this structure:

```
### English plan
1. <numbered step — what happens, plain language>
2. ...
N. ...

### Technical scaffold
- Files likely touched: <explicit list>
- Non-goals: <what this plan explicitly does NOT do>
- Primary agent: <per §11>
- Secondary agents: <required on D/E; optional on C if crossing domains>
- Skills to load: <per §12 — stroke-guidelines, performance, etc.>
- Acceptance checks: <concrete, testable — from §15>
- Clinical impact: none / low / high
- Rollback plan: <required for D/E; "n/a" for C with no user-facing behavior>
```

### Step 4 — Route to specialist reviewers

**Class D or E:** State immediately after the plan:
> "This is Class D/E. Invoking `system-architect` for structural review now (§19 step 5). Producing §17.1 artifact at `docs/reviews/arch-<slug>.md` before awaiting approval."

Invoke `system-architect` synchronously. Produce the §17.1 review artifact. If decision is **block**: state the blocking issues. **Do not proceed to Step 5 until V has resolved all blocks.**

**Class E or -clinical:** State after architect review (or instead, if Class C-clinical):
> "Class E/-clinical requires `clinical-reviewer` pre-execution gate. This will run after V approval and before any code is written."

Note: the clinical-reviewer gate runs **after** V approval but **before** implementation (§19 step 5 for E). The architect review runs **before** V approval.

### Step 5 — Wait for approval

Close with exactly:
> "Plan and pre-execution reviews complete. Waiting for approval. Reply `approve` to execute, or specify revisions."

**No code is written before this approval. This gate cannot be skipped on Class C/D/E.**

---

### Step 6 — Execute (on V's `approve`)

**6a. Pre-execution clinical gate (Class E and -clinical only)**

Before touching any file: invoke `clinical-reviewer` with the plan + evidence trace from `medical-scientist`. Produce the §17.2 artifact at `docs/reviews/clinical-<slug>.md`.

- If decision is **block**: stop. State blocking issues. Do not write code until blocks are resolved and V re-approves.
- If decision is **approve** or **approve-with-conditions** (all conditions addressed): proceed.

**6b. Delegate implementation**

Brief the primary agent per §19 step 7. Include:
- The approved plan (verbatim)
- Files likely touched
- Non-goals
- Acceptance checks
- Skills to load (frontmatter)
- All mandatory conditions from review artifacts (§17.1/17.2)

Secondary agents run in parallel where independent, serial where dependent (§18).

**6c. Librarian post-flight**

After implementation, invoke `librarian` to update TASKS.md, NEUROWIKI.md, ROADMAP.md, and link-graph.json.

---

### Step 7 — Quality gates

Run every gate per §20. Report PASS or FAIL per gate:

1. **tsc** — `npx tsc --noEmit`. No new errors.
2. **build** — `npm run build`. Production build succeeds.
3. **claims hook** — `npm run check:claims`. No unregistered claims, no missing `last_reviewed`, no stale-past-window citations.
4. **Review artifacts** — For D/E: §17.1 artifact present with `approve` or `approve-with-conditions`. For E/-clinical: §17.2 artifact present with same.
5. **TASKS.md** — Active entry updated to `ready_for_merge`.

If any gate fails: diagnose and fix. Re-run the failing gate. **Never ask V to investigate or fix a gate failure.** Never skip a gate.

---

### Step 8 — Commit, push, PR

All steps Claude-owned. V is never asked to run any terminal command (§5 Rule 7).

```
git add <specific files — never git add -A blindly>
git commit -m "<type>(<scope>): <imperative summary under 72 chars>

- <what changed, file-level>
- <what changed, file-level>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

For Class C and above: open a PR with `gh pr create` using the bilingual description per §10:

```
## English summary
- What this does: <one sentence>
- Why: <tied to task goal>
- What could break: <honest risks>
- How to verify: <post-merge check>

## Technical summary
- Files changed: <list>
- Tests added: <or "n/a">
- Class: <X>[-clinical]
- Review artifacts: <paths or "n/a">
- ADR: <path or "n/a">
```

Report the PR URL as the final deliverable.

---

## Strict rules — always enforced

1. **No code before V approval on Class C/D/E.** The plan gate (Step 5) cannot be skipped or abbreviated.
2. **No architect review skip on Class D/E.** The §17.1 artifact must exist before approval is sought.
3. **No code before clinical-reviewer on Class E/-clinical.** The §17.2 gate runs post-approval, pre-implementation.
4. **No quality gate bypass.** All three gates (tsc, build, claims hook) must pass. Claude diagnoses and fixes failures — never escalates to V.
5. **No scope expansion without re-routing.** If implementation reveals the task is larger than classified, stop, re-classify, re-plan, re-seek approval. Do not silently absorb scope.
6. **No external audit auto-execution.** If the task originates from an uploaded document, prior-session findings, or external audit: treat every finding as a hypothesis (§5 Rule 6). Complete Steps 1–5 in full. The document is a briefing, not a pre-approved work order.
7. **No V terminal commands.** Ever. If a command is needed, Claude runs it.
8. **No fabricated claims.** Any clinical text produced by implementation must have a citation registered in `src/lib/citations/claims.ts` before the claims hook runs. If the registry is in empty-stub state (W5.2 not landed), document the claim surface in TASKS.md as `blocked:awaiting-registry-population`.

---

## Failure behavior

**No argument** — "Usage: `/build <task>`. Describe what you want to build or change in one sentence." No action.

**Classification ambiguous** — Present both candidates with trade-offs. Stop. Do not plan until V confirms class.

**Task describes multiple distinct tasks** — "This covers more than one task. Recommend splitting: [list]. Run `/build` separately for each." Do not produce a merged plan.

**Plan too vague to produce concrete acceptance checks** — Ask V one specific clarifying question. Do not proceed.

**Architect review blocks** — State the blocking issues verbatim from §17.1 artifact. Do not proceed to Step 5 until V acknowledges and resolution path is agreed.

**Clinical-reviewer blocks** — Stop before touching any file. State blocking issues. Do not write code.

**Quality gate fails** — Diagnose root cause, apply fix, re-run gate. If three consecutive attempts fail: escalate root cause to V with specific error output. Do not push until all gates pass.

---

## Output format

- Plain text. No emoji. No decorative dividers.
- English plan first, technical scaffold second (§10 bilingual rule).
- Classification + rationale: 2 lines.
- Plan: ~10–30 lines for Class C, ~30–50 for D/E.
- Gate report: one line per gate, `PASS` or `FAIL`, then detail on failure.
- Final deliverable: PR URL on its own line.
