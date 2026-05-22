# Clinical review — PR pathway-elan-2026-05-22

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-22

## Scope
- Claims touched: ELAN-pathway COR/LOE recommendation claim (currently untagged; new claim ID required), ELAN timing-window claims (TIA/minor, moderate, major × early/late), recent-reperfusion caution claim, HT classification claim
- Citations affected: candidate new `aha-asa-2026-4.8` (DOAC initiation after cardioembolic stroke) — not yet in registry; existing `elan-trial-2023`, `timing-trial-2022`, `optimas-trial-2024` resolve in `trialListData.ts`
- Surfaces changed: §13.3 static JSX (result card, accordion, footer attribution lines)
- Evidence-verifier packet: REQUIRED for F8 (LOE A vs LOE B-R) — dispatched in parallel
- Trial-statistician report: not applicable

## Semantic validity

Confirmed items 1–13 from medical-scientist packet: ratified. Algorithm, timing windows, eligibility funnel, valve diversion, NNT suppression, framing neutrality all pass the never-drift rubric.

Flagged items rulings:

- **F1 (major-stroke disclaimer wording):** non-blocker. Tighten to "carefully selected patients" to match AHA/ASA 2026 phrasing. Fix in this PR.
- **F2 (ELAN result framing in accordion):** non-blocker. Add explicit "estimation trial, not formal noninferiority" line. Fix in this PR.
- **F3 (TIMING year 2024 → 2022):** **BLOCKER.** Factual citation error. Must fix before merge. Two locations: lines 451, 476.
- **F4 (recent-reperfusion phrasing):** non-blocker. Defer to follow-up.
- **F5 (uncontrolled-HTN flag):** accepted as soft caution. Add in this PR.
- **F6 (binary HT classification):** accepted as binary for current scope. Defer granular split.
- **F7 (no pre-stroke mRS gate):** accepted as footnote-only. Add in this PR.
- **F8 (COR 2a · LOE A vs LOE B-R):** **BLOCKER, escalated to evidence-verifier.** Repo's other AHA/ASA 2026 COR 2a recommendations all use Level B-R. The ELAN pathway is the lone outlier. Evidence-verifier dispatched to WebFetch AHA/ASA 2026 §4.8 and produce quoted_text. If LOE confirmed B-R, three sites must be corrected.

## Citation accuracy

- TIMING year is wrong (F3 — blocker).
- LOE A claim is unverified and contradicts repo pattern (F8 — blocker pending evidence-verifier).
- ELAN/TIMING/OPTIMAS trial-level citations resolve in `trialListData.ts` — pass.
- A new citation record `aha-asa-2026-4.8` must be added with `quoted_text`. A new claim ID (e.g., `early-doac-af-stroke-cor-2a`) must be added to `CLAIM_REGISTRY` and the result card tagged with `data-claim` per §13.4 Phase 1.

## Editorial / expert context

Not applicable — no new trial entry in this PR. ELAN, TIMING, OPTIMAS already in trial catalog.

## Freshness

AHA/ASA 2026 current; ELAN 2023, TIMING 2022, OPTIMAS 2024 within 36-month landmark-trial window. Pass.

## Rationale

The pathway's algorithm, eligibility logic, timing windows, and framing posture are all clinically sound — medical-scientist's 13 confirmed items hold up against the never-drift rubric. The blockers are in citation paperwork, not the medicine: a factual publication-year error for TIMING (2022, not 2024) and an unverified LOE assignment (Level A) that contradicts every other AHA/ASA 2026 COR 2a citation in this repo. Evidence-verifier owns guideline-text fetching to resolve F8. Remaining flagged items are editorial polish landing in this PR (F1, F2, F5, F7-footnote) or scope-appropriate deferrals (F4, F6).

## Required follow-ups (must precede merge)

1. **F3 — TIMING year correction** (2024 → 2022) at lines 451 and 476.
2. **F8 — Evidence-verifier ratification of AHA/ASA 2026 §4.8 LOE.** Produce `quoted_text` and confirm Class/LOE. If LOE is B-R, correct all three sites (lines 381, 464, and footer); if Level A confirmed against expectation, document the supporting quote.
3. **Citation infrastructure (§13.4 Phase 1):**
   - Add `aha-asa-2026-4.8` to `src/lib/citations/registry.ts` with `quoted_text`.
   - Add claim ID (e.g., `early-doac-af-stroke-cor-2a`) to `CLAIM_REGISTRY` mapping to `['aha-asa-2026-4.8', 'elan-trial-2023', 'timing-trial-2022', 'optimas-trial-2024']`.
   - Tag the COR/LOE result card and accordion line with `data-claim`.
4. **F1, F2, F5, F7-footnote — editorial fixes in this PR.**

## Required follow-ups (post-merge, separate tasks)

- F4 — OPTIMAS reperfusion-subgroup nuance (Class C-clinical).
- F6 — Granular HI1/HI2/PH1/PH2 HT classification (Class C-clinical).

## Blocking issues

F3 (TIMING year) and F8 (LOE verification via evidence-verifier) must resolve before ui-architect writes code for ELAN.
