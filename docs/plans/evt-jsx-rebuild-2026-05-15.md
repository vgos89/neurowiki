# /build Plan — EVT Pathway JSX Rebuild

**Date:** 2026-05-15
**Author:** orchestrator
**Class:** D-clinical (structural rewrite + clinical-content corrections; clinical-logic changes in 4 fix-manifest items make it C-clinical with E aspects)
**Scope:** Replace `src/pages/EvtPathway.tsx` with a new implementation that integrates Pattern A chrome + interactivity + the 24-item clinical fix manifest in one atomic commit (Patch Strategy 2, V-approved).

---

## English plan

1. **Replace `src/pages/EvtPathway.tsx`** with a new implementation matching the v3 interactive demo design + the 24-item fix manifest clinical logic.

2. **Visual structure (Pattern A) from `docs/specs/PATHWAY_SPEC.md` v1.4:**
   - Vertical rail (cobalt traversed / slate untraversed) with step nodes (filled / hollow ring / slate-300 hollow)
   - Step icons inline next to eyebrows (UserCheck / Clock / ScanLine / ListChecks, all `text-slate-500`, bare inline SVG)
   - Two-line stacked category-row accordions (§3.7.1 — label top + 11px slate-500 description below, no two-column squeeze)
   - Tap-targetable branch chips between steps (§3.4 — `<button>` with `border: 1px solid slate-200`, 44×44 hit target via `p-3 -m-3`, hover slate-100 + neuro-200 ring, on-tap returns to source step with the relevant category-row accordion pre-opened)
   - Inline collapsible LearningPearl blocks per active step (default-closed `<details>`, max 2 per step, content **verbatim** from existing pearls)
   - Cascade-clear inline notice (§3.6 — `role="status" aria-live="polite" aria-atomic="true"`, inline placement adjacent to the changed field per v4-1 fix, 8-second auto-dismiss, Undo button that restores upstream + downstream answers)
   - Drawer State A muted bar → State C tier-tinted (slate / amber / red) per existing `CalculatorDrawer` composition
   - Header: back-arrow canonical SVG + `PATHWAY` eyebrow + `EVT Pathway` name + star + reset + cobalt Copy pill — no step strip

3. **Clinical content from `docs/audits/2026-05-15/evt-pathway-fix-manifest.md`** — apply all 22 fixes that require code changes (2 confirmed-clean require no action):
   - **Patch 1 ship-blockers (Class E):**
     - A9: Remove "Avoid EVT if core >100 mL" hard exclusion; replace with individualized-risk language citing SELECT2 ≥26 mL severe-hypodensity caveat (not Class III: Harm)
     - A8: Remove "Class IIb large core 50–100 mL at 6–24 h" stratum; replace with Class I A "ASPECTS 3–5 + age <80 + no mass effect" branch (§4.7.2 Rec 3)
     - A3: Basilar prestroke mRS ≥2 — change "Not Eligible" → "Consult — Insufficient Data" (Figure 3 IDD)
     - B7 pearl: Add "Skip-IVT strategy NOT recommended" pearl per §4.7.1 synopsis
   - **Patch 2 Class E (dominant M2 0–6h gating, A13):**
     - Constrain Dominant M2 Class IIa to 0–6 h window only (Figure 3 confirmed); add "dominant = ≥50% MCA territory, NOT left/right hemispheric dominance" tooltip definition
   - **Patch 3 C-clinical (16 items):**
     - Two-tier prestroke mRS at 0–6 h: mRS 2 → Class IIa B-NR (Rec 5); mRS 3–4 → Class IIb B-NR (Rec 6) — both require ASPECTS ≥6
     - ASPECTS 3–5 at 6–24 h: enforce age <80 stipulation (Rec 3); do NOT apply the cap to ASPECTS 6–10 at 6–24 h (Rec 2 has no age cap)
     - Mass-effect exclusion surfaced for Rec 3 and Rec 4 branches
     - "DVO" terminology adopted alongside MVO in user-facing labels
     - Citation corrections (verbatim PDF section IDs + trial PMIDs/DOIs)
     - Tenecteplase 0.4 mg/kg removed from any pearl that lists it as a valid alternative dose
   - **Patch 4 new pearls (C-clinical):**
     - TNK 0.25 mg/kg only / 0.4 mg/kg Class III pearl
     - Adjunctive IA thrombolytic post-mTICI 2b/3 (Class IIb B-R, new in 2026)
     - Pre-EVT tirofiban Class III No Benefit
     - GA vs procedural-sedation equivalence
   - **Patch 5 cosmetic/terminology cleanup**

4. **v3 audit findings (round-7 a11y + mobile + UI consolidation):**
   - Completed-rows `<button>` (a11y A-02)
   - Cascade notice `aria-live` region in DOM from start (a11y A-01)
   - `text-slate-400` → `text-slate-500` for all readable text (a11y B-01); keep slate-400 only for decorative chevrons/dividers
   - `aria-expanded` on accordion triggers; `aria-current="step"` on active step node
   - `prefers-reduced-motion` media query collapses all transitions
   - Locked-step container `aria-label="Step N, locked, awaiting completion of Step N-1"`
   - `text-amber-700` → `text-amber-800` on amber-50 drawer (AA contrast)
   - 44×44 touch targets: ASPECTS input, accordion options, Undo button, all chips
   - Active-state `active:scale-[0.98]` tap feedback
   - `Tap to select` italic placeholder + `neuro-300` chevron on unselected rows
   - `:focus-visible` ring on pearl-toggle (and all interactive elements)

5. **v4 evolutions from the round-4 v3 audit (3 items):**
   - V4-1: Cascade notice DOM placement — render adjacent to the changed field, not hardcoded in Step 1's rail
   - V4-2: Delay pearl appearance until second field in step is answered (avoids layout-shift-on-first-tap)
   - V4-4: Inline range validation on ASPECTS/PC-ASPECTS — red error pill below input on out-of-[0,10] value

6. **Preserve verbatim:**
   - All existing `LearningPearl` content from current `EvtPathway.tsx` — pull verbatim; clinical text is already validated
   - `evtStatusToTier()` mapping concept (re-applied to the post-fix-manifest interpretation function)
   - `EVT_CONTENT` constants (where used)
   - The Reset / Star / Copy header actions

7. **Quality gates** (per CLAUDE.md §20): `tsc --noEmit`, `npm run build`, `npm run check:claims`, `npm run check:routes`, and Gate 6 live-route verify post-deploy at `https://neurowiki.ai/pathways/evt`.

8. **Commit + push + PR** as one atomic change per Patch Strategy 2 (V-approved).

---

## Technical scaffold

**Files touched:**

- `src/pages/EvtPathway.tsx` — **full rewrite** (~1630 lines → ~1200–1500 lines, leaner since UI primitives extract)
- `src/components/pathways/PathwayRail.tsx` — **new**: vertical rail + nodes per §3.3
- `src/components/pathways/PathwayCategoryRow.tsx` — **new**: two-line stacked accordion option pattern per §3.7.1
- `src/components/pathways/PathwayBranchChip.tsx` — **new**: tap-targetable chip per §3.4
- `src/components/pathways/PathwayCascadeNotice.tsx` — **new**: inline notice + Undo per §3.6
- `src/components/pathways/PathwayLearningPearl.tsx` — **new**: collapsible pearl per §4.5
- `src/components/pathways/PathwayStepIcon.tsx` — **new**: 4 step icons (bare inline SVGs)
- `src/lib/calculators/severityTokens.ts` — extend if needed (likely unchanged)
- `docs/specs/PATHWAY_SPEC.md` — bump §15 changelog to v1.5 (JSX-grounded final pattern)

**Files NOT touched in this commit (out of scope):**

- `src/pages/ElanPathway.tsx`, `ExtendedIVTPathway.tsx`, `StatusEpilepticusPathway.tsx`, `MigrainePathway.tsx` (separate rebuilds in subsequent commits)
- `src/data/trialData.ts` and other clinical-content files (the pathway change does not require trial-data changes; the verbatim PDF citations are inline in the pathway)
- `src/pages/guide/StrokeBasics.tsx` (separate C-clinical correction pass)

**Non-goals (explicit):**

- Do NOT migrate other pathways in this commit.
- Do NOT add the provisional verdict pill (Proposal 3) — that branch needs the clinical-reviewer Class E gate, which has not run.
- Do NOT add user accounts / saved progress / patient data persistence (compliance posture preserved).
- Do NOT introduce new design tokens — work within the existing `neuro-*`, `slate-*`, `amber-*`, `red-*` system.
- Do NOT introduce a new state-management library; vanilla `useState` + `useReducer` is fine for this scale.

**Primary agent:** `ui-architect` (file rewrite with design-tokens skill).
**Secondary agents:**
- `medical-scientist` — drafts and inserts each of the 22 fix-manifest patches at their target lines, citation-attached
- `mobile-first-developer` — 44×44 + 375px sign-off post-implementation
- `accessibility-specialist` — WCAG 2.1 AA sign-off post-implementation (focused on the additions, not re-auditing baseline)
- `content-writer` w/ `humanizer` skill — pearl prose + cascade-notice copy + tooltip prose all pass through humanizer before sign-off
- `quality-assurance` — runs tsc, build, claims hook, route validator, Gate 6 live verify
- `librarian` — post-flight TASKS.md update + ROADMAP.md tick

**Skills to load:**
- `design-tokens` (canonical palette + component anatomy)
- `routing` (route-manifest no-touch confirmation since EVT route is unchanged)
- `accessibility-audit` (WCAG checklist)
- `stroke-guidelines` (clinical thresholds + 2026 AHA section IDs)
- `humanizer` (pearl prose, cascade-notice copy)
- `testing-patterns` (if any new tests added)
- `engineering:code-review` (for system-architect's pre-execution structural review)
- `engineering:deploy-checklist` (for QA Gate-6 live-verify)

**Acceptance checks (concrete, testable):**

1. `/pathways/evt` renders and is interactive end-to-end (4 EVT scenario walk-throughs: Eligible Class I, Avoid mRS >4, Consult basilar mRS 2, cascade-clear with Undo)
2. All 22 fix-manifest patches addressed (each with verbatim PDF citation inline)
3. All a11y findings from `docs/reviews/ux-audit-pathway-2026-05-15-accessibility.md` + `docs/reviews/ux-audit-v3-2026-05-15-accessibility.md` resolved
4. v4-1 / v4-2 / v4-4 evolutions implemented
5. PATHWAY_SPEC v1.4 compliance (rail, chips, accordions, cascade notice, pearls, drawer)
6. `tsc --noEmit` passes with no new errors
7. `npm run build` succeeds
8. `npm run check:claims` passes (claims registered if introducing new clinical text strings)
9. `npm run check:routes` passes (route count unchanged at 41)
10. Gate 6 (CLAUDE.md §20.6) live-verify post-deploy: `https://neurowiki.ai/pathways/evt` returns 200 and the new design renders correctly
11. Mobile QA at 375×667 passes (all interactive elements ≥44×44, no horizontal scroll, drawer fits)
12. Lighthouse Performance + Accessibility ≥90 (per `performance` skill targets)

**Clinical impact:** **HIGH** — all 4 ship-blockers from the fix manifest are addressed (A3, A8, A9, B7). This is the patient-safety-significant commit.

**Rollback plan:**
- `git revert <merge-commit>` restores the prior EvtPathway.tsx
- No data migration / no persistent state, so revert is clean
- If revert is needed: `clinical-reviewer` + `system-architect` must both sign off before re-enable (CLAUDE.md §14)
- Feature flag NOT applicable — pathway is the route's render; no flag toggle exists

---

## Routing through the agent system

Per CLAUDE.md §19 trigger map, the canonical route for this work:

> "add a new route / page / screen / calculator" → `ui-architect` + `seo-specialist` · `routing`, `design-tokens`

Adapted for *rewriting an existing route* with clinical-content correction:

- **Primary:** `ui-architect` (file rewrite) + `medical-scientist` (clinical patches inline)
- **Mandatory reviews** (Class D-clinical + Class E aspects):
  - `system-architect` (§17.1 plan review — structural shape, composability)
  - `clinical-reviewer` (§17.2 pre-execution gate — clinical claims, threshold changes, ship-blockers)
- **Secondary at implementation:** `mobile-first-developer`, `accessibility-specialist`, `quality-assurance`, `content-writer + humanizer`, `librarian`

---

## Open question for V before execution

This is the last consent gate before code is written. Answer to all three confirms execution:

1. **Patch Strategy 2 still confirmed?** (Bundle all chrome + interactivity + 22 clinical fixes into one atomic React commit.)
2. **OK to extract shared pathway primitives** (Rail, CategoryRow, BranchChip, CascadeNotice, Pearl, StepIcon) into `src/components/pathways/` so the eventual ELAN / ExtendedIVT / SE / Migraine rebuilds can reuse them?
3. **Proposal 3 (provisional verdict pill) stays parked** pending separate clinical-reviewer Class E gate?

If any answer changes, the plan is revised before execution.

---

## Status

**Plan revised 2026-05-16** to incorporate architect §17.1 + clinical-reviewer §17.2 conditions (both `approve-with-conditions`, no blocks). See REVISIONS section below.

**Pending:**

1. ~~`system-architect` review (§17.1)~~ — **complete, approve-with-conditions** (`docs/reviews/arch-evt-jsx-rebuild-2026-05-15.md`)
2. ~~`clinical-reviewer` pre-execution gate (§17.2)~~ — **complete, approve-with-conditions** (`docs/reviews/clinical-evt-jsx-rebuild-2026-05-15.md`)
3. **V approval after seeing all three artifacts** ← awaiting
4. THEN: dispatch the prototyper to execute

---

## REVISIONS — incorporating architect §17.1 + clinical-reviewer §17.2 (2026-05-16)

Both reviews returned **approve-with-conditions**. The conditions below are now binding on execution. Each is annotated with its source review and the original plan section it modifies.

### Architect §17.1 follow-ups (8 plan edits)

**ARCH-1 [modifies §6 "Preserve verbatim"] — Logic-preservation rule.** Interpretation functions (`calculateLvoProtocol`, `calculateMevoProtocol`, `evtStatusToTier`, `getEvidenceBadge`, `getNihssNumeric`, `getNextRenderedField`) are lifted into the new `EvtPathway.tsx` **as a verbatim copy first**. Only THEN are Class E mutations applied as 4 named subsequent edits (A3, A8, A9, A13 dominant M2 0–6h gating). The 16 Class C-clinical patches are applied as **append-only** additions to those same functions. A reviewer must be able to diff old vs new interpretation function and see one Class E change at a time — not a wholesale rewrite mixed with patches.

**ARCH-2 [modifies §2 "Visual structure"] — `PathwayCascadeNotice` prop contract + placement.** Per spec §3.6 + v4-1 fix, the notice renders **immediately below the changed category-row, NOT in the rail**. Component prop contract:
```ts
type PathwayCascadeNoticeProps = {
  visible: boolean;
  changedFieldLabel: string;
  clearedFields: string[];
  onUndo: () => void;
  onDismiss: () => void;
};
```
The notice is rendered inline at the field-row level by `EvtPathway.tsx`, not lifted into `PathwayRail`. This prevents the v4-1 bug from being silently re-introduced.

**ARCH-3 [new non-goal] — No `usePathwayState` hook at n=1.** State machine remains colocated in `EvtPathway.tsx`. Do NOT extract `usePathwayState.ts`. ELAN/Migraine state shapes are structurally distinct from EVT (ELAN: `StrokeSize` + onset date; Migraine: nested `SafetyState` + `CocktailState`). Premature abstraction cost is high. Re-evaluate after the third pathway rebuild.

**ARCH-4 [new acceptance check #13] — Vitest unit-test file.** `src/pages/__tests__/EvtPathway.interpret.test.ts` covering all 25 verdict branches in `calculateLvoProtocol` + `calculateMevoProtocol`. Pure-function tests, no React rendering. Regression coverage for the 4 Class E threshold changes (A3, A8, A9, dominant M2 0–6h gating). Skill: `testing-patterns`.

**ARCH-5 [modifies §6 "Preserve verbatim"] — Pearls stay inline.** Pearl content remains inline `<LearningPearl>` JSX. Moving to a `const EVT_PEARLS` data array is a separate refactor and would muddy this diff.

**ARCH-6 [modifies "Files touched" → `PathwayBranchChip.tsx`] — Chip prop contract.**
```ts
type PathwayBranchChipProps = {
  targetFieldId: string;       // NOT targetStepIndex
  label: string;
  onClick: () => void;
};
```
Chip tap lands on the field that produced the branch (required for v4-1 adjacency), not on the step boundary.

**ARCH-7 [now satisfied] — Class E §17.2 artifact must exist before code is written.** The 4 Class E claim IDs that change: A3, A8, A9, dominant-M2-0–6h. **Status: artifact landed at `docs/reviews/clinical-evt-jsx-rebuild-2026-05-15.md` 2026-05-15.** Condition satisfied.

**ARCH-8 [new non-goal] — `PathwayBottomDrawer.tsx` retained.** Pathway-stable seam over `CalculatorDrawer`; not deprecated in this commit. The pathway tier-vocabulary remap (`TIER_TOKENS`) lives in `PathwayBottomDrawer`, not `CalculatorDrawer`. Composing `CalculatorDrawer` directly from `EvtPathway` would duplicate that map across every future pathway rebuild.

**ARCH-bonus [modifies "Files touched"] — Fold `PathwayStepIcon.tsx` into `PathwayRail.tsx`.** The icon is rendered inline with the step eyebrow, not floating. Export a `STEP_ICONS` constant from `PathwayRail.tsx`; consumers pass `iconKey: 'triage' | 'clinical' | 'imaging' | 'decision'`. File count drops from 6 primitives to 5.

**Revised files-touched list:**
- `src/pages/EvtPathway.tsx` — full rewrite (state machine + interpretation colocated)
- `src/components/pathways/PathwayRail.tsx` — new; exports `STEP_ICONS` constant
- `src/components/pathways/PathwayCategoryRow.tsx` — new
- `src/components/pathways/PathwayBranchChip.tsx` — new; `targetFieldId` prop
- `src/components/pathways/PathwayCascadeNotice.tsx` — new; inline-rendered, NOT in rail
- `src/components/pathways/PathwayLearningPearl.tsx` — new
- `src/components/pathways/PathwayBottomDrawer.tsx` — **retained**, not deprecated
- `src/pages/__tests__/EvtPathway.interpret.test.ts` — **new** (ARCH-4)
- `docs/specs/PATHWAY_SPEC.md` — §15 changelog bump to v1.5

### Clinical-reviewer §17.2 execution conditions (6 binding constraints)

**CLIN-1 [new acceptance check #14] — `last_reviewed` refresh per CLAUDE.md §13.6.** Before merge, refresh `last_reviewed: "2026-05-15"` on every AHA/ASA 2026 §4.7 citation record in `src/lib/citations/registry.ts`. All six §13.6 checklist steps completed (source resolves, version current, dependent claims consistent, no wording drift, newer evidence considered, dual sign-off medical-scientist + clinical-reviewer).

**CLIN-2 [binding — verbatim caveat preservation in rebuilt `details` strings]:**
- A13 dominant M2 IIa branch must contain verbatim: *"benefits are uncertain"* (§4.7.2 Rec 7)
- A1 basilar Rec 2 IIb branch must contain verbatim: *"not well established"* (§4.7.3 Rec 2)
- A3 basilar mRS ≥2 Consult branch must contain verbatim: *"insufficient data to determine"* or *"IDD"* (Figure 3 cell label)
- A9 core >100 mL Consult branch must contain verbatim: *"diminished treatment benefit"* + *"cerebral edema"* + *"hemicraniectomy"* (page e54 footnote)
- B7 skip-IVT pearl must contain verbatim: *"a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended"* (§4.7.1 synopsis)

**CLIN-3 [confirm `humanizer` routing]** — all 4 new LearningPearl `content` strings (B7, B4, B5, B6) AND rewritten `details` strings for the 3 patient-safety Class E branches (A3, A8, A9) pass through `humanizer` skill review before commit. Verbatim PDF clauses from CLIN-2 are **exempt** from humanizer rewriting — those must remain verbatim.

**CLIN-4 [new acceptance check #15] — Claim tagging.** Every new or rewritten user-facing clinical string tagged per CLAUDE.md §13.4. Computed strings: wrap return with `claim(text, "claim-id")` helper from `src/lib/citations/claim.ts`. LearningPearl content: tag at JSX composition site. Pre-commit hook must pass.

**CLIN-5 [new merge-gate condition] — Post-execution clinical re-review.** Per CLAUDE.md §18, Class E gating is BOTH pre-execution AND post-execution. After implementation, a second `clinical-reviewer` pass is required to confirm the rebuilt JSX strings match CLIN-2 verbatim conditions + CLIN-3 humanizer pass + CLIN-4 claim tagging. The post-execution artifact at `docs/reviews/clinical-evt-jsx-rebuild-2026-05-15-postexec.md` is the merge-gate. (This pre-execution artifact at `clinical-evt-jsx-rebuild-2026-05-15.md` is satisfied.)

**CLIN-6 [reaffirm non-goal] — Proposal 3 stays parked.** During execution: confirm no intermediate "partial-eligible" verdict surface is introduced through a side door (drawer header, step-strip badge, in-rail pill, etc.). The cascade-clear notice is OK because it's a *clear-state* signal, not a *partial-verdict* signal. An anchoring partial-verdict surface is NOT allowed without a separate Class E gate.

### Revised acceptance-check list

Adding ARCH-4, CLIN-1, CLIN-4, CLIN-5 to the original 12:

13. **Vitest interpret.test.ts** (ARCH-4) — all 25 verdict branches green; 4 Class E threshold changes have explicit regression tests.
14. **`last_reviewed` refresh** (CLIN-1) — every AHA/ASA 2026 §4.7 citation in `registry.ts` refreshed to 2026-05-15 with §13.6 checklist completed.
15. **Claim tagging** (CLIN-4) — every new/rewritten clinical string tagged per §13.4; pre-commit `check:claims` hook passes.
16. **Verbatim caveat audit** (CLIN-2) — automated check or manual diff confirms the 5 verbatim phrases are present in rebuilt `details`/pearl content.
17. **Humanizer sign-off** (CLIN-3) — content-writer + humanizer attestation that all new prose passed; verbatim clauses preserved unmodified.
18. **Post-execution clinical re-review** (CLIN-5) — §17.2 merge-gate artifact exists with `approve` or `approve-with-conditions` (conditions resolved).

### Revised "Open questions for V" — final approval gate

The 3 original questions (Patch Strategy 2; extract shared primitives; Proposal 3 parked) are reaffirmed. Add 1 new question:

4. **OK to drop `PathwayStepIcon.tsx` as a standalone file and fold into `PathwayRail.tsx`** (architect bonus follow-up)? Drops file count 6 → 5 primitives.

Answering all 4 confirms execution.
