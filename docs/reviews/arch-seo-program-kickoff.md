# Architect review — SEO program kickoff (Phase 4)

**Decision:** approve-with-conditions
**Reviewed:** plan only + touched files (CLAUDE.md §11/§19, `.claude/agents/seo-specialist.md`, `.claude/agents/accessibility-specialist.md`, `.claude/agents/content-writer.md`, `.claude/meta/pm-agent.md`, `.claude/skills/routing/SKILL.md`, `.claude/rules/clinical-review-templates.md`, `src/seo/`)
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-13

## Rationale

The proposed pairing solves a real gap — today, `seo-specialist` activates on *route-shaped* surfaces (new routes, `src/seo/`, structured data, metadata, pre-publish) but is silent on *content-shaped* surfaces (pearl rewrites, calculator interpretation copy, study-mode prose, trial summaries). Those surfaces ship public-facing words constantly and never get SEO eyes. The hard-pairing intent is correct.

What's risky: the cleanest implementation is *not* a new §17.3 artifact, *not* a new "co-fire pairs" section in CLAUDE.md, and *not* duplicated trigger-map rows. Three new patterns are exactly the kind of structural sprawl this review is meant to prevent. The cleanest implementation is:

1. **§19 trigger map**: extend the four content-writer rows (pearl/study mode, copy rewrite, privacy/terms/a11y page, and any §19.0 row that today routes to `content-writer`) by adding `seo-specialist` to the agents column with a parenthetical scope qualifier on the public-facing ones. That's where routing lives — keep it there.
2. **§11 Contextual 10**: rewrite the `seo-specialist` "Activates when" cell to consolidate the route/structured-data/pre-publish triggers *and* the new content-pairing trigger into one sentence. Do not annotate with "always-paired" — the trigger map is the source of truth for who fires; §11 describes scope.
3. **Sign-off**: do not create §17.3. SEO sign-off on content lives in the PR description per §16 (add a checkbox to the Class C / C-clinical artifacts list), using the **existing** `### @seo-specialist — Sign-off` template that's already in `.claude/agents/seo-specialist.md` lines 59–69. A separate review file for every pearl copy edit is structural overkill; reserve standalone review files (§17.1/§17.2) for changes that warrant blocking-gate audit trails.

The `accessibility-specialist` precedent (lines 9–20 of that file) is the right pattern to mirror — activation triggers as bullets, scope tight, no auto-firing implied. SEO pairs with content the way a11y pairs with interactive UI: by activation rule, not by global decree.

The scope-narrowing question is the one place V's stated intent ("co-fires whenever content-writer is invoked") is structurally risky. Content-writer fires on Study Mode, FAQs, vignettes, tooltips, plain-English explanations, and pearl text — much of which is either not indexable (Study Mode is gated/internal-feeling), or so deeply nested in calculator UI that there is no canonical URL to optimize against. Hard pairing across all of that produces noise sign-offs, which degrade the signal of the ones that matter. **Recommend narrowing to public-indexable surfaces** in the agent brief: guide pages (`src/pages/guide/`), trial pages, calculator landing/intro copy, FAQ pages, any new route — but explicitly *not* Study Mode pearls, tooltips, modal text, or in-calculator interpretation strings that are not page-level metadata. Reduce surface count → preserve sign-off signal.

`engineering:documentation` / `librarian` collisions, and the `routing` skill / new `seo-audit-execution` skill collision, are both real but minor. `routing` covers *how to add a route correctly* — it's a build-time skill loaded by `ui-architect`. The new `seo-audit-execution` skill should cover *audit methodology, keyword research workflow, structured-data templates, GA4/GSC integration patterns* — a higher-altitude skill loaded by `seo-specialist`. Keep them separate; the new skill should cross-reference `routing` for the manifest mechanics rather than duplicating. Do not merge.

`.claude/meta/pm-agent.md` is non-invokable and explicitly noted in §11 as such. Adding an SEO-pairing note there is *fine* — pm-agent.md exists precisely to translate human requests into swarm prompts, and noting the SEO/content pairing helps chat-side prompt composition. But the note must phrase the pairing as descriptive ("when content-writer is invoked on public surfaces, seo-specialist is also invoked"), not prescriptive ("the orchestrator must…"). Prescription lives in §19. Otherwise we get the §3 conflict pattern.

## Rubric

| # | Concern | Verdict | Rationale |
|---|---|---|---|
| 1 | Duplication risk | **concern** | A third sign-off artifact type (§17.3) would be a duplicate pattern. Use the §16 PR checkbox + existing in-agent sign-off template instead. |
| 2 | Boundary integrity | **pass** | Pairing respects existing boundaries — content-writer still owns prose, seo-specialist still owns metadata/structured data/link graph. No concern crosses into the other. |
| 3 | Composability | **concern** | Hard-pairing across *all* content-writer invocations over-couples. Narrowing to public-indexable surfaces preserves composability — Study Mode pearls don't need SEO review. |
| 4 | State locality | **pass** | Trigger map (§19) is the right scope for "who fires together." §11 is the right scope for "what each agent owns." Plan respects this split if condition C1 is applied. |
| 5 | Dependency weight | **pass** | No new external dependency; GSC API deferred to morning per V's decision. WebSearch SERP-snapshot uses existing tool grant. |
| 6 | Migration exit | **pass** | All four edited files are governance docs — revert is `git revert` of a single commit. No data schema, no code. Rollback note in the PR body is sufficient; ADR not required for governance edits at this scope. |

No `block` items. Two `concern` items, both resolvable in the conditions below.

## Required follow-ups

These are mandatory conditions for approval — Phase 4 should not ship until they're applied.

- **C1 — Sign-off mechanism:** Do **not** create §17.3. Instead, (a) add an `seo-specialist sign-off` checkbox to the §16 durable-artifacts table for Class C / C-clinical PRs that touch public-indexable content surfaces, and (b) require the `### @seo-specialist — Sign-off` block (already templated in the agent brief) to appear in the PR description body. This avoids inventing a third artifact type when the existing PR-description pattern handles it cleanly.
- **C2 — Scope narrowing:** Update the `seo-specialist` "Activates when" cell in §11 and the activation-triggers section of `.claude/agents/seo-specialist.md` to list the **specific** public-indexable surfaces that trigger pairing: guide pages, trial pages, calculator landing/intro copy, FAQ pages, new routes. Explicitly exclude: Study Mode pearls, tooltips, modal text, in-calculator interpretation strings (those are non-indexable). Without this narrowing, sign-off becomes noise.
- **C3 — Trigger-map shape:** Use option (a) from V's three choices — extend the existing content-writer rows in §19 to list both agents in the right column, with a parenthetical scope marker (e.g., `seo-specialist (if public-indexable)`). Do not add an "always-paired" annotation to §11, and do not create a "co-fire pairs" section. One source of truth: §19 says who fires; §11 says what they own.
- **C4 — Skill separation:** The new `.claude/skills/seo-audit-execution/SKILL.md` must not duplicate `routing`. Routing stays with `ui-architect` for build-time route addition. The new skill cross-references routing for manifest mechanics and owns audit methodology, keyword workflow, schema templates, GA4/GSC patterns. Add a one-line "Related skills" pointer in both directions.
- **C5 — pm-agent.md note:** Phrase the SEO/content pairing note as descriptive only ("when content-writer is invoked on public-indexable surfaces, seo-specialist is also invoked — see CLAUDE.md §19"). Do not duplicate the trigger rule. This avoids the §3 conflict pattern where two governance files state the same rule and drift.
- **C6 — Rollback note:** Add a one-line rollback statement to the PR body: "Phase 4 is governance-only; `git revert <commit>` restores prior trigger map and agent brief." No ADR required for governance edits at this scope per §16 Class D row (ADR required, but the rollback note suffices alongside).
- **C7 — Existing trigger-map row at line 553:** `"add / update the privacy / terms / accessibility page"` already pairs `content-writer + ui-architect + compliance-legal`. Add `seo-specialist` here too — public-facing legal pages are exactly the indexable surface this pairing exists for.
- **C8 — Existing trigger-map row at line 544:** `"add a new route / page / screen / calculator"` already pairs `seo-specialist`. No change needed; just confirm in the plan that this row is not double-edited.

## Blocking issues

None. Approve with C1–C8 applied before Phase 4 ships. Phases 1, 2, 3, 5 are out of scope for this review.
