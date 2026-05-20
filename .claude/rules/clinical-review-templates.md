# Clinical Review Artifact Templates — NeuroWiki

> Extracted from CLAUDE.md §17.1 and §17.2. These templates are part of the CLAUDE.md governance tier (§3). Use the exact format. Missing artifact → `/pr-ready` fails.

---

## §17.1 Architect review — `docs/reviews/arch-PR<#>-<slug>.md`

```markdown
# Architect review — PR #<number>

**Decision:** approve | approve-with-conditions | block
**Reviewed:** plan only | plan + touched files | plan + implementation
**Reviewer:** system-architect (model: <model-name>)
**Date:** <YYYY-MM-DD>

## Rationale
[One paragraph — what's right, what's risky, what's the call.]

## Required follow-ups
- [list; can be empty]

## Blocking issues
[Only if decision is `block`. Each issue stated concretely with a resolution path.]
```

---

## §17.2 Clinical review — `docs/reviews/clinical-PR<#>-<slug>.md`

```markdown
# Clinical review — PR #<number>

**Decision:** approve | approve-with-conditions | block
**Reviewer:** clinical-reviewer (model: <model-name>)
**Date:** <YYYY-MM-DD>

## Scope
- Claims touched: [list of claim IDs]
- Citations affected: [list of citation IDs]
- Surfaces changed: [§13.3 categories — see .claude/rules/clinical-surfaces.md]
- Evidence-verifier packet: [path to docs/evidence-packets/*.md, or "not applicable"]
- Trial-statistician report: [summary or "not applicable"]

## Semantic validity
[Confirmed / flagged items. Does the claim text actually match the evidence?
Review standard lives in .claude/agents/clinical-reviewer.md.]

## Citation accuracy
[Each citation checked for current version, correct section, accurate quote]

## Editorial / expert context (REQUIRED for new-trial-entry PRs)
[For new-trial entries: confirm that evidence-verifier packet §8 is complete —
§8a accompanying editorial, §8b post-publication letters and replies, §8c
subsequent guideline incorporation, §8d subsequent meta-analyses / contradicting
evidence. State explicitly which sub-items were filled, which were marked
"not applicable" with stated reason, and (if any) which are silently incomplete
(silent incomplete = block per mandatory-block #8). For non-new-trial PRs, write
"not applicable — no new trial entry in this PR."]

## Freshness
[For each citation: `last_reviewed` still within window (§13.7) → pass, or refresh required via §13.6]

## Rationale
[One paragraph.]

## Required follow-ups
- [list; can be empty]
```

---

## Naming rules

- Architect review: `arch-PR<number>-<slug>.md` — e.g., `arch-PR47-gcs-rebuild.md`
- Clinical review: `clinical-PR<number>-<slug>.md` — e.g., `clinical-PR47-gcs-rebuild.md`
- Slug: kebab-case from the task slug in TASKS.md
- Location: always `docs/reviews/`

**Missing artifact → `/pr-ready` fails.** A comment or chat message stating "reviewed" does not satisfy this requirement. The artifact must exist as a committed file in `docs/reviews/`.
