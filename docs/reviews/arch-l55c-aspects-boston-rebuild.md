# Architect review — L5.5c ASPECTS + Boston rebuild

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (`src/pages/AspectScoreCalculator.tsx`, `src/pages/BostonCriteriaCaaCalculator.tsx`, `src/pages/Abcd2ScoreCalculator.tsx`, `src/data/bostonCriteriaCaaData.ts`, `docs/specs/CALCULATOR_SPEC.md` §1–§5, `TASKS.md` W5.2 status, prior calculator pages by grep)
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-13
**Task class:** C (no clinical content change; verified by plan and by reading the data modules)

## Rationale

The plan is structurally sound for a Class C visual rebuild. Both files already share the drawer-portal, severity-token, hasInteracted, and Chevron scaffold landed in L5.5b — the delta is the input-row layer (region cards → A2 option rows for ASPECTS; bordered buttons/checkboxes → A1/A3 rows for Boston). Drawer infrastructure, citation objects, and scoring functions stay untouched, so the boundary is clean and the blast radius is genuinely confined to two page files. Clinical prose is loaded from data modules byte-for-byte; no Class E surface is being touched. The main risks are not structural defects in the plan — they are accumulating duplication that this PR will worsen and one genuine spec-interpretation call (ASPECTS as A2) that should be explicit, not inferred.

## Rubric scores

**1. Duplication risk — concern.**
By end of L5.5c, eight calculator pages will each carry their own inline `SEVERITY_TOKENS` map, inline `Chevron` SVG, inline `BackArrow` (some pages use lucide's `ArrowLeft`, others a hand-rolled SVG — see `Abcd2ScoreCalculator.tsx:94` vs `AspectScoreCalculator.tsx:4`), inline drawer state machine, inline header markup, and inline portal/toast pair. Grep confirms eight pages already match `selected-option|SEVERITY_TOKENS` (Abcd2, Ich, Heidelberg, Gcs, HasBled, Rope, Aspect, Boston). This is not yet a block — the per-file precedent was deliberately set by the Heidelberg + ABCD² rebuilds — but the plan should note this as accruing tech debt and surface a successor Class D task before any *ninth* calculator joins the pattern. Without that gate, the consolidation cost grows quadratically with each additional page.

**2. Boundary integrity — pass.**
Both rebuilds touch only `src/pages/*Calculator.tsx`. Data modules (`aspectScoreData.ts`, `bostonCriteriaCaaData.ts`) are explicitly out of scope. No clinical logic is being relocated into UI. No new cross-boundary dependency is being introduced. Clinical surfaces (per `.claude/rules/clinical-surfaces.md`) are being styled but not edited — the data attributes that L5.5d will add are deferred until W5.2 lands. Boundary is clean.

**3. Composability — concern.**
The plan is choosing bespoke-per-file for the seventh and eighth time without an acknowledgement note. ABCD²'s rebuild PR explicitly used the inline-everything pattern, and Heidelberg ratified it. But at n=8 with three more rebuilds plausibly coming (HAS-BLED, RoPE, plus any future calculator), the "bespoke is intentional" trade-off should be re-stated for L5.5c so a future reader knows the duplication was a known, accepted decision and not drift. A one-line note in the plan body or commit message is enough — no code change needed.

**4. State locality — pass.**
All state (`involved` Set for ASPECTS; `inputs` object for Boston; `drawerOpen`, `hasInteracted`, `toast` for both) is local to the page component. Nothing is being lifted to a hook, a context, or a store. The current shape matches ABCD²'s pattern. No over- or under-hoisting.

**5. Dependency weight — pass.**
No new packages. lucide-react, react-dom, react-router-dom already in tree.

**6. Migration exit — pass.**
Two file edits, no schema change, no shared-abstraction rename, no data module changes. Rollback is `git revert <merge>` and the calculators return to their pre-spec state cleanly. No feature flag needed at this scope.

## Decisions on the six questions asked

**Q1 — Extract a shared header/section-label component before the rebuild?**
**No.** Precedent is set by ABCD² and Heidelberg; deviating now to extract a shell mid-batch would mix structural refactor into a visual rebuild. Track the extraction as a Class D follow-up (see Required follow-ups).

**Q2 — Class D extraction warranted now?**
**No, but it should be filed as the next-blocking task.** A `CalculatorShell` / `SeverityTokens` module / `Chevron` shared component is justified by the eight-page duplication, but it is not the right work to graft onto L5.5c. Do it as L5.6 with the eight existing files as the migration set. Don't ship a ninth calculator on the inline pattern without it.

**Q3 — Boundary clean?**
**Yes.**

**Q4 — ASPECTS as A2 — correct?**
**Yes, with a caveat the plan should state.** Spec §3 lists ASPECTS under A2 and §3.2 says "ASPECTS items use anatomical region labels," which is decisive. But §3.4 describes A2 options as Rapid/Detailed *radio* groups (single-select per item). ASPECTS regions are single-select-equivalent (each region is independently binary toggle), which matches A2's option-row anatomy if each region is treated as its own "item" with two implicit options (involved / not involved) collapsed to a single tappable row. The current `role="checkbox"` is the correct ARIA — keep it; do not change to `role="radio"`. The A2 visual treatment (`selected-option` class, hairline divider, tokenized labels) is the structural match. A3 (HAS-BLED checkbox rows with `bg-neuro-50` and `accent-neuro-500`) would also be defensible, but the spec explicitly enumerates ASPECTS under A2, so go with the plan. Plan should state this interpretation explicitly so the reviewer doesn't have to reverse-engineer it.

**Q5 — Boston age number input — keep as styled `<input type=number>`?**
**Yes.** Spec v1.1 doesn't define a number-input pattern; inventing one now is out of scope. The existing `<input type="number">` is the only sensible primitive for a continuous-integer field where the only check is `≥50`. A button-step or radio-band would be a regression — `<input type="number">` is more accurate (any age, not bucketed) and works with the iOS numeric keypad. Keep it; add `inputMode="numeric"` for mobile and ensure the `min-h-[44px]` is preserved. File a spec follow-up to add a `Number input` primitive section if it occurs again on other calculators.

**Q6 — Split into L5.5c-aspects and L5.5c-boston?**
**No.** Both PRs share zero rebuilt code, but they share the spec-compliance objective, the reviewer load, and the QA gate. Splitting would double the PR/review overhead with no risk-reduction benefit (the two files are independent → either can be reverted alone even in one PR). Keep as one PR with two clearly-separated commit ranges or two file-level commits.

## Required follow-ups

- **L5.6 — `CalculatorShell` extraction (Class D).** Before any ninth calculator (or any new calculator) lands on the inline-everything pattern, extract: (a) shared `Chevron` + `BackArrow` to `src/components/calculators/`, (b) shared `Drawer` + `drawerState` machine including portal positioning, (c) shared severity-token type and a per-calculator token map utility, (d) shared header markup with action-button slot. Migration set is the eight existing pages. File this in `TASKS.md` PENDING under the calculator-layer roadmap before merging L5.5c.
- **L5.5c plan addendum (before execution).** Add one paragraph stating: (i) bespoke-per-file is the accepted L5.5 trade-off; (ii) ASPECTS uses A2 visual treatment with `role="checkbox"` retained because each region is an independent binary toggle; (iii) Boston age remains `<input type="number">` because the spec defines no number-input archetype.
- **Spec follow-up (low-priority).** Add a §4.6 or §7 entry to `CALCULATOR_SPEC.md` defining the canonical styled-number-input pattern (border, padding, `min-h-[44px]`, `inputMode="numeric"`, helper text below). Not blocking — but the next calculator that needs an age, weight, or eGFR field will re-derive whatever Boston ships, and the spec drift compounds.
- **L5.5d unblocked check.** Plan correctly notes L5.5d (claim tagging) is blocked on W5.2 (TASKS.md line 14, in-progress). Confirm before L5.5c merges that no clinical surface in the rebuilt files is being newly created — i.e., the rebuild does not introduce a new claim surface not present in the pre-rebuild file. Spot-check: the EVT CTA link in `AspectScoreCalculator.tsx:498-508` and the related-calculators links in `BostonCriteriaCaaCalculator.tsx:378-380` are nav copy, not claims. OK to ship without tagging.
- **Mobile QA gate must verify** drawer portal behavior is unchanged (the L5.5b portal/toast pair is byte-identical across the eight files; do not let it drift during L5.5c). Mobile-first-developer should diff the drawer markup against ABCD² post-rebuild.

## Blocking issues

None.
