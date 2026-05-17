# Clinical review — Pattern A fix Tier 5 (Migraine drawer migration + PathwayCocktailSummary)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-16

## Scope
- Claims touched: CLIN-2 Migraine corpus (15 verbatim phrases — see audit table below). **No change to claim text; render-surface change only** (hero card → CalculatorDrawer State C children; cocktail row → new PathwayCocktailSummary primitive in drawer State B).
- Citations affected: Robblee 2025 AHS ED Guideline; Ailani 2021 AHS Consensus; Burch/Burish/Rizzoli/Goadsby/Nahas 2024 Continuum; ICHD-3. No citation record edits.
- Surfaces changed: static JSX (steps 2/3/5 cards), structured-data string lines in `generateSummary` (line 324), PathwayLearningPearl `content` props. All in §13.3 scanner coverage.
- Evidence-verifier packet: `docs/evidence-packets/2026-05-15-migraine-pathway-PDF-VERIFIED.md`.
- Trial-statistician report: not applicable.

## Semantic validity

### Question 1 — CLIN-2 verbatim phrase preservation through drawer migration

`generateSummary` (MigrainePathway.tsx line 324–382) is **not modified by Tier 5**. The drawer migration only changes WHERE the function's output renders, not WHAT it produces. The hero card to be removed (lines 1199–1211) consumes `generateSummary().split('\n').map(...)`; post-Tier-5 drawer State C children will consume the same function's output via the same map shape. Phrases preserved by construction.

**15 verbatim phrase audit — all confirmed present:**

| # | Phrase | Lines | Provenance | Preserved because |
|---|---|---|---|---|
| 1 | `"0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine"` | 347, 354, 928, 1107 | `generateSummary` + static JSX (steps 3/4) | Function untouched; static JSX in steps 3/4 not in E-1…E-12 scope. |
| 2 | `"unavailable or contraindicated"` | 835, 990 | Static JSX (antiemetic radio) + PathwayLearningPearl `content` | Step 3 radio + pearl prop not touched. |
| 3 | `"Should Offer for recurrence prevention"` | 878 | Static JSX (dex radio) | Step 3 dex radio not in scope. |
| 4 | `"first line for rescue"` | 238, 239, 807 | Eligibility-check string + differential prose | Eligibility logic + step-2 prose untouched. |
| 5 | `"may perform better"` | 973 | Static JSX (valproate dose descriptor) | Step 3 add-on descriptor untouched. |
| 6 | `"6–12 L/min"` | 630, 631 | Static JSX (cluster B1 terminal card) | Cluster card in step 2; not in scope. |
| 7 | `"non-rebreather mask (NRB)"` | 630 | Static JSX (cluster B1) | Same as #6. |
| 8 | `"AHS Grade A"` | 627, 631, 635, 639 | Static JSX (cluster B1, 4 sites) | Same as #6. |
| 9 | `">10 days/month"` | 1184 | Static JSX (MOH screen criterion) | MOH section is step-5 inline pre-summary — only hero card moves; criteria stay in-flow. |
| 10 | `">15 days/month"` | 1173, 1184 | Static JSX (MOH criteria) | Same as #9. |
| 11 | `"for >3 months"` | 1163, 1173, 1184 | Static JSX (MOH criteria) | Same as #9. |
| 12 | `"25 mg TID → 50 mg TID → 75 mg TID"` + `"with PPI"` | 670, 671 | Static JSX (indomethacin B3 advisory) | Indomethacin card in step 2; untouched. |
| 13 | `"carbamazepine 300–800 mg/day"` + `"only FDA-approved"` | 655 | Static JSX (TN B4 terminal) | TN card in step 2; untouched. |
| 14 | `"Avoid opioids"` | 658 | Static JSX (TN B4) | Same as #13. |
| 15 | `"Level U"` + `"needs better quality ED-specific studies"` | 374, 680, 1123 | `generateSummary` + static JSX | Function untouched; static JSX out of scope. |

**Never-drift categories:** none touched. Recommendation strengths, action verbs, qualifiers/gates, certainty markers, and temporal constraints all preserved at source.

### Question 2 — SafetyToggle red-affordance retention (E-5/E-6)

Safety toggles render at lines 773–781 on labels: `Pregnant`, `Age > 65`, `Weight < 50kg`, `Uncontrolled DM`, `Uncontrolled HTN`, `CV Risk/CAD`, `Stroke/TIA Hx`, `Hepatic Impairment`, `Basilar Migraine`. These are **patient risk-factor flags** — selecting them states "this patient has the risk factor," with downstream cascade implications.

**Spec analysis:** PATHWAY_SPEC §4.2 line 446 forbids per-input danger painting for tri-button decision groups. §11 anti-pattern #6 reinforces. SafetyToggle red is at the same input-chrome layer §4.2 prohibits.

**Clinical-UX verdict:** safety toggles are categorically different from §4.2-forbidden tri-button decision groups. A safety toggle is **stating a patient fact** with high-stakes downstream cascade implications. A tri-button is **picking among neutral options**. Treating an activated patient-fact-with-cascade as visually neutral underplays clinical force and shifts all danger-signaling weight onto the post-click cascade notice — a worse pattern than pre-click visual reinforcement.

Mitigation against confusion with `high` tier output token: safety toggles render in step 3 (cocktail-assembly), the drawer (output) is at viewport-bottom rendering the cocktail verdict — spatially separated.

**Decision:** retain red selected state with documentation condition (see follow-up 2).

### Question 3 — Cocktail copy-format change

Two distinct copy paths post-Tier-5:
- **Header Copy button:** `copySummary` → `generateSummary` → full Treatment Plan with contraindications + MOH counseling + status-migrainosus blocks. EMR-suitable narrative.
- **Drawer PathwayCocktailSummary Copy-all:** bare lines per §4.9 lines 695–704, intended for direct EHR-order paste.

**Safety analysis:** Bare-lines format intentionally omits contraindications block, status escalation blocks, weight/allergy gating, route alternates. Assumptions: clinician has made safety decisions upstream, is at order-entry with chart open, CPOE performs its own checks. Reasonable for canonical ED use.

**Concrete safety gap identified:** bare format does NOT carry repeat-dose ceilings ("Max 2 doses," "Max 12mg/24h"). If clinician pastes bare list and proceeds to order signing without re-reading the long-form note, repeat-dose limits could be missed.

**Decision:** append per-drug max-dose suffix when applicable: `Ketorolac 30mg IV (max 2 doses)`. Adds ~12 chars per line, fits §4.9 anatomy, closes the safety gap without breaking "paste directly" intent. Required as condition 3.

Both formats clinically appropriate once max-dose suffix is added.

## Citation accuracy

No citation records touched. All CLIN-2 phrases trace to source citations in evidence packet. Migration does not alter `quoted_text` or `last_reviewed`.

## Freshness

No `last_reviewed` refresh required.

## Rationale

CLIN-2 preservation structurally sound: `generateSummary` unchanged, static JSX phrase sites in steps 2/5 out-of-scope, PathwayLearningPearl content not moved.

SafetyToggle red retention is a defensible exception to §4.2 because safety toggles state a patient-fact-with-cascade rather than a neutral decision. Exception documented to prevent future propagation.

PathwayCocktailSummary bare-lines copy safe as hand-off payload, *except* for silently dropped repeat-dose ceilings. Appending max-dose suffix closes the gap.

Approve-with-conditions. Conditions are concrete; architect's structural conditions cover most of the work.

## Required follow-ups (conditions for approve)

1. **CLIN-2 verbatim verification pre-commit.** Re-grep the 15 phrases in the audit table against post-migration `MigrainePathway.tsx`. Each must appear at least once. Record results inline in PR body under a `CLIN-2 phrase verification` block. If any phrase is missing or modified, block commit. Orchestrator runs grep as pre-commit verification.

2. **SafetyToggle red retention — document the §4.2 exception in code.** Add inline comment above SafetyToggle definition (line 390): `// SafetyToggle red selected-state retained per clinical-pattern-a-fix-tier-5 — patient-fact-with-cascade exception to PATHWAY_SPEC §4.2 input-chrome neutrality. Do NOT propagate this red pattern to tri-button decision groups (§4.2/§11#6 forbids).` Implementation agent adds in same diff.

3. **PathwayCocktailSummary bare-lines format — append max-dose suffix.** Modify consumer-side pill `label` derivation (architect condition 4) so it includes max-dose suffix when applicable:
   - `Ketorolac 30mg IV (max 2 doses)`
   - `Sumatriptan 6mg SC (max 12mg/24h)`
   - Other drugs without explicit ceilings render bare per §4.9 line 686.
   Copy-all output inherits the max-dose-bearing labels. Header Copy (generateSummary) unchanged.

4. **Hero-card removal preserves per-line className rendering in drawer.** Pre-Tier-5 hero card renders each line as `<div className={line.startsWith('-') ? 'ml-4' : 'font-bold mt-3 first:mt-0'}>`. Drawer State C children must preserve the same per-line treatment (indented dash-prefixed drug lines + bold section headers like `FIRST-LINE COCKTAIL:`, `Contraindications Applied:`, `MOH DISCHARGE COUNSELING (...)`, `STATUS MIGRAINOSUS (...)`). Losing visual hierarchy turns the plan into an unreadable blob. Acceptance check: post-Tier-5 drawer State C in canonical scenario (default cocktail, no refractory, no MOH, no status, no contraindications) renders `FIRST-LINE COCKTAIL:` bold with 4 indented dash lines below.

5. **State B "provisional cocktail" prefix.** Tier 4 precedent required State B `collapsedStat` to begin with "Provisional" so an in-progress reading does not read as final verdict. Migraine State B (cocktail being assembled) follows the same convention. Per §4.9 line 709 the format is `Cocktail · 3 drugs` — acceptable because "Cocktail" itself substitutes for tier and signals "in-assembly." Confirm implementation: State B `collapsedStat` is "Cocktail · {N} drugs" (or spec-equivalent), NOT a tier-labeled verdict. State C is first time tier vocabulary appears.

6. **PR body must state CLIN-2 preservation explicitly.** Per architect condition 9: "Treatment Plan content is sourced from unchanged `generateSummary` (line 324). All 15 CLIN-2 verbatim phrases (audit table in clinical-pattern-a-fix-tier-5.md) preserved by construction. Hero card chrome removed; phrase text unchanged."

---

**Files inspected:**
- `docs/reviews/arch-pattern-a-fix-tier-5.md`
- `docs/reviews/clinical-pattern-a-fix-tier-4.md`
- `docs/specs/PATHWAY_SPEC.md` (§4.2, §4.9, §6, §11)
- `src/pages/MigrainePathway.tsx` (full file scan)
- `src/components/calculators/CalculatorDrawer.tsx`
- `src/components/pathways/PathwayCascadeNotice.tsx`
