# Clinical review — EVT pathway late-window reframe (2026-07-02)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-fable-5), after a 5-lens Fable audit (ui-architect, mobile-first-developer, accessibility-specialist, clinical-reviewer, medical-scientist) and a post-remediation clinical re-gate
**Date:** 2026-07-02

## Scope
- Class: C-clinical (copy + evidence attribution + presentation of the late-window imaging step; decision LOGIC unchanged — verdicts are identical for identical inputs)
- File: `src/pages/EvtPathway.tsx`
- Surfaces changed: calculator interpretation output (evidence badge, verdict detail), learning pearl, late-window (6–24h) imaging-step copy/structure
- Claims/attribution touched: late-window ASPECTS ≥6 badge/detail re-attributed from `DAWN/DEFUSE-3` to `§4.7.2 Rec #2`; late-window imaging step reframed to two presentation "paths" (NCCT ASPECTS vs CT perfusion)
- Evidence-verifier packet: n/a (verified against in-repo guideline mirror `src/data/aha2026StrokeGuideline.ts` evtRecommendations.adults and the citation registry)
- Trial-statistician report: n/a

## Semantic validity
Confirmed after remediation.

- **ASPECTS ≥6 late-window badge/detail — CONFIRMED correct.** `COR 1 · §4.7.2 Rec #2` and "Class I (LOE A) … ASPECTS ≥6 does not require perfusion imaging" match the mirror's 6–24h COR 1 row (aha2026StrokeGuideline.ts ~lines 433–446: ICA/M1, NIHSS ≥6, prestroke mRS 0–1, ASPECTS ≥6, NCCT-only selection). Both the clinical-reviewer and medical-scientist lenses independently confirmed this attribution. Re-attributing away from the old `DAWN/DEFUSE-3` badge corrects a genuine misattribution (DAWN/DEFUSE-3 selected by perfusion/clinical-core mismatch, not by ASPECTS ≥6).
- **Perfusion route wording — FIXED (was the sole BLOCKER).** The initial reframe labeled the CT-perfusion route `COR 1` / "a separate, equally valid qualifying path." That grade is not supported by the mirror (6–24h COR 1 rows select by NCCT ASPECTS only) nor by the mapped citation `aha-asa-2026-4.7.2` (quoted_text covers ASPECTS rows only; no perfusion/DAWN/DEFUSE-3 clause). Remediation removed the COR grade and the "equally valid" comparative from every new perfusion string (intro Path B item, Path B card label, Path B core helper, verdict detail, learning pearl). The perfusion route is now described factually as "a recognized selection route" / "the perfusion-selected route (DAWN/DEFUSE-3)" with no COR asserted. Re-gate: blocker resolved.
- **"No perfusion required when ASPECTS ≥6" — CONFIRMED correct** and preserved (the load-bearing safety message). Matches the mirror and the TENSION NCCT-only selection basis.
- **Directional safety** — the reframe is safe in both directions: it does not imply perfusion is required, nor that ASPECTS alone is insufficient.

## Citation accuracy
- `§4.7.2 Rec #2` / `Rec #3` are the repo's established editorial ordinals for §4.7.2 rows (consistent with pre-existing `Rec #5`/`Rec #7` badges elsewhere in this file); the underlying COR/LOE grades match the mirror. Noted follow-up: the "Rec #N" ordinal is a NeuroWiki index, not a verbatim guideline label — acceptable as a file-wide convention.
- No citation `quoted_text` was changed by this PR.

## Freshness
- No citation `last_reviewed` dates were touched. The attributions rely on the in-repo 2026 guideline mirror, within window per §13.7.

## UI/UX + mobile + accessibility (5-lens audit, remediated)
- **ui-architect (was: Path A dominates):** Path A and Path B now render as **symmetric bordered cards** with a centered "or" divider, giving the two routes matching visual weight so neither reads as a fallback.
- **accessibility (was: issues-found):** added `id`/`htmlFor` associations + `aria-describedby` on all four inputs; `role="group"` + `aria-labelledby` on each path; `role="status" aria-live="polite"` on the conditional header message; `aria-hidden` on the decorative divider; label contrast raised `slate-400 → slate-600` and size `10px → text-xs` (12px, meets the design-system minimum).
- **mobile (was: clean-with-nits):** `min-h-[44px] touch-manipulation` added to the Calculate ASPECTS button; intro copy tightened for 375px scannability.
- **token consistency:** the ad-hoc `neuro-500` label color was reverted to the slate scale.

## Decision + conditions
**approve-with-conditions.** The reframe is clinically accurate and safe after remediation; the two conditions below are **tracked follow-ups, not blockers for this PR** (both are pre-existing, file-wide, and were surfaced — not introduced — by this work):

1. **Pre-existing perfusion-verdict COR 1 badges** (`DAWN Criteria` → `COR 1 · DAWN`, `DEFUSE-3 Criteria` → `COR 1 · DEFUSE-3`, EvtPathway.tsx ~lines 330–332) assert COR 1 for the perfusion *verdict* with no resolvable in-repo citation. Not touched by this reframe. medical-scientist to either add a grounding citation or downgrade to a factual label, as a separate `blocked:awaiting-clinical-review` item.
2. **Claim-tagging gap:** `EvtPathway.tsx` carries zero claim tags file-wide (no `data-claim` / `claimId` / `claim()`), so the pre-commit claims hook provides no semantic coverage on this file. Pre-existing, tracked for data-architect. The claims hook passes (no tagged-but-unregistered claim is introduced).

## Rationale
The change corrects a real evidence misattribution (ASPECTS ≥6 late-window is a §4.7.2 recommendation, not a DAWN/DEFUSE-3 perfusion-mismatch result) and reframes the late-window imaging step so a perfusion-first clinician — the common real-world workflow — sees CT perfusion as a co-equal entry route rather than a buried fallback, without changing any eligibility logic or threshold. The one clinical overclaim (grading the perfusion route COR 1 without a citation) was removed on re-gate. Remaining conditions are pre-existing debt, tracked separately.

## Required follow-ups
- Ground or downgrade the pre-existing DAWN/DEFUSE-3 verdict COR 1 badges (medical-scientist; separate task).
- Claim-tag `EvtPathway.tsx` (data-architect; file-wide, tracked with the existing untagged-surface item).
- Optional (low priority): distinguish guideline-section vs trial-name badge provenance; on-device iPhone SE check of the tallest late-window permutation.
