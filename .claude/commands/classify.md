---
name: classify
description: Assign a task class (A/B/C/D/E), apply -clinical flag if
  relevant, state reasoning with reference to CLAUDE.md §6.1 examples.
---

Skip this command for: tasks V has already classified explicitly in the same message.

## Behavior

On invocation with `<task description>`:

1. Read CLAUDE.md §6 and §6.1. Apply the decision criteria to the task description.
2. Determine the `-clinical` flag per §6: if the task touches clinical content (copy, pearls, interpretation text) without changing clinical logic → add `-clinical`. If the task changes clinical logic or thresholds → Class E (supersedes the flag).
3. If the task is ambiguous between two classes, present BOTH candidates with trade-offs. Do NOT silently pick the lower class (§6 mandate).
4. If information is insufficient to classify, ask V one clarifying question. Do not classify on incomplete information.
5. Report classification in this format:

   Classification: `<Class X>[-clinical]`
   Reasoning: <one sentence>
   Closest §6.1 example: <quote or paraphrase>
   Required artifacts (per §16): <list>
   Quality gates (per §20): <list>

6. If ambiguous between two classes, report instead:

   Candidate classifications:
   - Class X: <rationale> — trade-off: <what this commits to>
   - Class Y: <rationale> — trade-off: <what this commits to>
   Recommend: V confirms which class governs.

On invocation without an argument:

- Report: "Usage: /classify `<task description>`. Describe what you want to build or change."
- Do not produce a classification.

## Parsing rules

**Class definitions (from §6):**
- **A — Question:** Explanation, clarification, code-reading, no change to files.
- **B — Tiny Edit:** ≤5 lines, single file, obvious fix (typo, import, format), no behavior change.
- **C — Scoped Feature:** Normal feature work, single area of code.
- **D — High-Risk:** Crosses boundaries, refactor, breaking change, new dependency, schema change.
- **E — Clinical Logic:** Algorithm thresholds, interpretation text, guideline updates, citation changes.
- **`-clinical` flag:** Class C or D that incidentally touches clinical content (copy, pearls, interpretation) without changing clinical logic. Does not upgrade to E.
- **Hard rule:** If clinical logic changes, Class E supersedes the `-clinical` flag.

**Hard cases (from §6.1):**
- Wording change with no meaning change → B. Wording change reflecting a clinical nuance → C-clinical. Ask before assuming.
- Scoring bug that is a typo in a number → C-clinical. Scoring bug that is a structural wrong-variable reference → C (add `-clinical` only if fix touches user-visible text).
- Shared helper swap across multiple calculators → D by default. If calculator output text changes → D-clinical. If scoring logic changes → E.

**Required artifacts and quality gates by class:**

| Class | Required artifacts (§16) | Quality gates (§20) |
|---|---|---|
| A | None | None |
| B | One-line PR title | None |
| C | Bilingual PR · test for new logic · TASKS.md update | tsc, build, claims hook |
| C-clinical | C artifacts + citation trace + clinical review artifact (§17.2) | C gates + clinical review artifact approved |
| D | C artifacts + ADR + rollback note + architect review artifact (§17.1) | C gates + architect review artifact approved |
| D-clinical | D artifacts + citation trace + clinical review artifact (§17.2) | D gates + both review artifacts approved |
| E | D artifacts + citation record update + `last_reviewed` refresh + clinical review artifact (§17.2) + rollback plan | D gates + clinical review artifact approved |

## Failure behavior

- **No argument** — Usage message only. No classification produced.
- **Ambiguous between two classes** — Present both candidates with trade-offs (step 6 above). Ask V to confirm. Do not guess.
- **Task spans multiple classes** (e.g., refactor + new feature in one description) — Report: "This task combines Class D (refactor) and Class C (new feature). Recommend splitting into two tasks before classifying." Do not assign a merged class.
- **Insufficient information** — Ask V one clarifying question. Do not classify until the answer is received.

## Output format

- Plain text. No emoji. No decorative headers or dividers.
- Under 10 lines for a clear classification.
- Ambiguous case may extend to ~15 lines due to dual candidates.
- Quote §6.1 examples when possible — they are calibration anchors, not decoration.
