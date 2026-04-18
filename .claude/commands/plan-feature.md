---
name: plan-feature
description: Produce a bilingual plan for a task, including
  classification, agent delegation, acceptance criteria, and routing
  to system-architect for Class D/E and clinical-reviewer pre-check
  for Class E.
---

Skip this command for: Class A/B tasks — those do not require a plan per §6.

## Behavior

On invocation with `<goal>`:

1. Apply /classify logic internally. Produce: class, `-clinical` flag if applicable, reasoning, closest §6.1 example.

2. If classification is ambiguous between two classes, report both candidates with trade-offs per /classify behavior. Stop. Do NOT proceed to planning without V confirming class.

3. If classification is Class A or B, report: "Class A/B does not require a plan per §6. Proceed directly, or use /focus to stay on current task." Stop.

4. If the goal is too vague to produce concrete, testable acceptance checks (or missing acceptance criteria), ask V one specific clarifying question. Do not proceed to planning on incomplete information.

5. For Class C/D/E, produce the plan using this structure:

   **Classification:** `<Class X>[-clinical]` — <one-sentence reasoning>
   **Closest §6.1 example:** <quote or paraphrase>

   ### English plan
   1. <numbered step — what happens, plain language>
   2. ...
   N. ...

   ### Technical scaffold
   - **Files likely touched:** <explicit list>
   - **Non-goals:** <what this plan explicitly does not do>
   - **Primary agent:** <per §11 — who owns the work>
   - **Secondary agents:** <for C only if crosses domain; for D/E always list>
   - **Skills to load:** <per §12 — frontmatter `skills:` entry>
   - **Acceptance checks:** <concrete, testable — from §15>
   - **Clinical impact:** none / low / high
   - **Rollback plan:** <required for D/E; "n/a" for C with no user-facing behavior>

6. For Class D or E, after the plan output, state:
   "This is Class D/E. Routing plan to `system-architect` for structural review before execution per §19 step 5. No code until review artifact (§17.1) is produced and V approves."

7. For Class E specifically (in addition to step 6), also state:
   "Class E requires `clinical-reviewer` pre-execution gate per §19 step 5. `medical-scientist` will author claims + evidence trace; `clinical-reviewer` approves before code."

8. For Class C/D/E, close with exactly:
   "Waiting for approval before execution. Reply `approve` to proceed, or specify revisions."

On invocation without `<goal>`:

- Report: "Usage: /plan-feature `<goal>`. Describe what you want to build or change in one sentence."
- Do not produce a plan.

## Parsing rules

**Goal parsing:**
- Goal = everything after `/plan-feature`. Treat as natural language, not a file path or identifier.
- If the goal describes more than one distinct task, flag it (see Failure behavior). Do not plan a bundled goal.

**Agent selection per §11:**
- UI work → `ui-architect` (primary) + `mobile-first-developer` (Core 6, required on all UI PRs)
- Clinical content → `medical-scientist` (primary) + `clinical-reviewer` (gate)
- Calculator scoring or thresholds → `calculator-engineer` (primary) + `ui-architect`
- Schema / data / citation registry → `system-architect` reviews; implementation agent determined by domain
- Performance work → `quality-assurance` (primary) with `performance` skill loaded
- Accessibility-heavy UI → add `accessibility-specialist` (Contextual 8)
- New public route or metadata → add `seo-specialist` (Contextual 8)
- Auth / privacy / legal / disclaimers → add `compliance-legal` (Contextual 8)

**Skill loading per §12:**
- Stroke / ICH / thrombectomy domain → `stroke-guidelines`
- Performance / bundle / Core Web Vitals work → `performance`

**Rollback plan guidance:**
- Class C with no user-visible change → "n/a"
- Class D → specify revert strategy: `git revert <merge-commit>`, or feature-flag disable if change is behind a flag
- Class E → specify revert + clinical impact communication plan (who is notified, how quickly)

## Failure behavior

- **No `<goal>` argument** — Usage message only. No plan produced.
- **Classification ambiguous** — Report both candidates with trade-offs per /classify, stop. Do not plan until V confirms class.
- **Goal too vague to produce concrete acceptance checks** — Ask V one specific clarifying question. Do not proceed. (Covers §22 failure: "missing acceptance criteria → ask V to fill template first.")
- **Multiple tasks bundled into one goal** — Report: "This describes more than one task. Recommend splitting: [list inferred tasks]. Run /plan-feature separately for each." Do not produce a merged plan.

## Output format

- Plain text. No emoji. No decorative dividers.
- English plan first (§5 golden rule, §10 bilingual format) — numbered steps.
- Technical scaffold second — bulleted fields.
- Under 30 lines typical for Class C.
- Class D/E plans may extend to ~50 lines due to agent delegation and routing statements.
- Quote §6.1 examples when available — they are calibration anchors, not decoration.
