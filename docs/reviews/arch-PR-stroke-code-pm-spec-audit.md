# Architect review — Stroke Code PM-Spec Audit Pass

**Decision:** approve-with-conditions
**Reviewed:** plan + 4 already-aligned surfaces (CodeModeStep1, CodeModeStep2, PatientContextPanel, ThrombolysisEligibilityModal partial) + spec inventory of 6 remaining surfaces
**Reviewer:** system-architect (orchestrator-acting)
**Date:** 2026-05-24

## Rationale

The chassis pattern is now well-established across 4 commits (d4fade8, fd6c345, 8bcf176, ccc438c, 2781eb9, 1dfd5e7). What V is asking for here is the systematic completion of that pattern across the remaining 6 surfaces of the Stroke Code pathway, not a new architectural decision. Reusing the established pattern is the right structural call (rubric 1 strong pass). The four design questions V answered all simplify the scope rather than expanding it:

- #1 (b + text audit) — Step 4 category cards chassis + humanizer audit on non-clinical text only
- #2 (b) — Modal status banners become chassis chrome (must preserve at-a-glance state signaling via color emphasis)
- #3 (a) — Sticky page header stays as-is (different visual class)
- #4 (a) — Time-metric badges stay as-is (status pill class, consistent with WindowBadge)
- #5 (b) — LKW picker + NIHSS modal outer frames audited; internal picker/calc UI preserved

The only structural concern is the Step 4 text audit (#1 follow-up). Per arch-PR-stroke-code-patient-context.md condition #8, clinical-wording changes reclassify to D-clinical. The plan correctly addresses this: visual pass first (Class C), then a separate scan for AI-fingerprint patterns in non-clinical helper text only. If any prose change touches a clinical-order label, the audit STOPS and routes through clinical-reviewer §17.2 before lift.

## Required follow-ups

1. **Rubric 2 (boundary integrity) — Status banner chassis treatment must not lose state-signal urgency.** Converting from full-color flood (current) to chassis chrome (white card + tinted header) risks demoting an urgent signal ("IV tPA CONTRAINDICATED") to looking like an info card. Mitigations to implement: (a) use a thicker top border or 2px outer ring in the semantic color when status is red, (b) keep the status icon (✕ for red, ⚠ for amber, ✓ for emerald) prominent in the chassis header bar, (c) increase header bar height slightly (min-h-[48px] vs the standard 40px) so the banner reads as a banner, not as a regular section card. State explicitly in PM-spec that the status banner is a chassis-variant with these specific affordances, so future modals follow the same pattern.

2. **Rubric 3 (composability) — Extract a `StatusBanner` primitive after this lands.** Three surfaces (eligibility modal banner, future ELAN modal banner, future status-mode workflow) will all need the same chassis-variant. Don't extract now (premature on 1 consumer), but flag in the PM-spec as the natural follow-up.

3. **Rubric 4 (state locality) — Step 4 admit-orders category color tokens.** When restyling category cards to chassis, the `getCategoryClasses()` function will go from returning a `{bg, border, text, textLight, icon, checkbox}` record to returning a `{headerBg, headerText, headerBorder, ...}` record. Keep the function as the single source of truth for category color mapping; do not inline the new tokens at usage sites. This preserves the existing single-touch-point pattern for future category additions.

4. **Rubric 6 (migration exit) — Single-commit-per-surface rollback boundary.** Each surface should be its own commit so any one can be reverted independently if it breaks something the other surfaces don't. The plan's "commit per logical group" instruction satisfies this.

5. **PM-spec doc — write at `docs/specs/stroke-code-pathway-pm-spec-2026-05-24.md`.** Document: (a) every surface in the pathway with its current state and target state, (b) the chassis pattern as the canonical spec, (c) status banner as the documented chassis-variant, (d) the four exceptions kept on flood color treatment (status indicators, interactive toggle chips, sticky page headers, status pill badges), (e) the rollout sequence for ELAN / EVT / Status / Migraine pathways. This becomes the reference for the four follow-up pathway-pattern PRs.

6. **Class D-clinical trigger watch.** If the Step 4 humanizer scan finds AI-fingerprint patterns inside a clinical-order label (e.g., em-dash inside "Aspiration precautions — 30-45° head of bed"), do NOT silently rewrite. Surface to V with the specific string, the proposed change, and the citation source. Treat any change here as D-clinical and route through clinical-reviewer §17.2.

7. **Mobile / a11y — verify on each restyled surface.** 375px screenshot of each before/after, and keyboard-tab traversal note from accessibility-specialist on each modal opened from the pathway (Hemorrhage, Extended IVT, IV tPA Eligibility, NIHSS, LKW picker).

## Blocking issues

None. The plan is structurally consistent with prior commits and the design decisions are settled. Execute.

---

**Files reviewed:**
- Prior commits d4fade8, fd6c345, 8bcf176, ccc438c, 2781eb9, 1dfd5e7
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/reviews/arch-PR-stroke-code-patient-context.md` (canonical spec source)
- File-size inventory of remaining 6 surfaces (Step 3 / Step 4 / 2 modals / page chassis / picker primitives)
