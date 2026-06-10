# Clinical review — NIHSS thrombolysis-timing aid

**Decision:** approve-with-conditions (all conditions addressed 2026-06-10)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8), fresh context per CLAUDE.md §18
**Date:** 2026-06-10

## Scope
- Claims touched: `ivt-window-4.5h` (new), `bp-ivt-threshold-185-110` (description updated; now documents both rendered variants), `nihss-minor-disabling-check` (punctuation only on the two copy-export lines)
- Citations affected: `aha-asa-2026-4.6.1`, `aha-asa-2026-4.6.2`, `aha-asa-ivt-bp-threshold` (verified only; no citation records edited)
- Surfaces changed: static JSX with `data-claim` (window chip, BP chip); computed strings from a function (NIHSS `buildText`: since-onset line + two disabling-features lines); template/interpolated copy (elapsed-time label)
- Evidence-verifier packet: not applicable — reuses established, already-cited 4.5 h window and 185/110 thresholds; no new trial data or statistics introduced. Reviewer concurred.
- Trial-statistician report: not applicable

## Semantic validity
1. **`Within 4.5h` / `Beyond 4.5h` window framing — PASS.** The 4.5 h boundary is faithful to AHA/ASA 2026 §4.6.2 ("within 4.5 hours of symptom onset or last known well ... Class I, Level A") and §4.6.1, and correctly applies to both alteplase and tenecteplase. The code boundary (`elapsedHours <= 4.5`) matches the source's "within" temporal language. Non-blocking note: an amber `Beyond 4.5h` chip is a factual time statement, not a contraindication; the perfusion-selected extended window (§4.6.3) and thrombectomy pathways remain population/imaging-gated and are not derivable from LKW alone.
2. **In-window BP chip — FLAGGED, resolved.** Original wording "Thrombolytic candidate: BP goal <185/110" asserted eligibility (in-window is necessary but not sufficient: imaging, contraindications, disabling-deficit determination, and labs are not gated by this chip). **Resolution:** reworded to **"If thrombolysis planned: BP goal <185/110"** (product owner decision, 2026-06-10). Conditional framing surfaces the BP target without asserting eligibility. Condition addressed.
3. **LKW as "onset" — PASS.** Wake-up/unknown is explicitly excluded (`ivt` is null unless `lkw instanceof Date`; muted "time since onset is not shown" note fires for the null case; copy export gates the since-onset line identically). Witnessed LKW as the standard-window clock is correct convention; the one case where LKW ≠ onset (wake-up) is excluded.
4. **Disabling-features punctuation — PASS.** Em-dash → semicolon only on both copy-export lines. Recommendation strength (Class I, Level A / Class 3 No Benefit), verbs (indicated / not recommended), §4.6.1 section, and present/none-identified qualifiers unchanged and matching `nihss-minor-disabling-check` + §4.6.1 `quoted_text`. No clinical meaning changed; satisfies the §10.3 em-dash ban.

## Citation accuracy
- `aha-asa-2026-4.6.1` — correct section; `quoted_text` supports both the 4.5 h window framing and the disabling-features Class I / COR 3 verdicts. Accurate.
- `aha-asa-2026-4.6.2` — correct section; `quoted_text` establishes alteplase/tenecteplase equivalence within 4.5 h (Class I, Level A). Accurate.
- `aha-asa-ivt-bp-threshold` — 2019 Table 5 (PMID 31662037); `quoted_text` supports "BP goal <185/110"; threshold unchanged in 2026 guideline. Accurate.

## Editorial / expert context
not applicable — no new trial entry in this PR

## Freshness (today 2026-06-10)
- `aha-asa-2026-4.6.1`: last_reviewed 2026-05-23, 6-mo window → within window (expires ~2026-11-23). Pass.
- `aha-asa-2026-4.6.2`: last_reviewed 2026-05-19, 6-mo window → within window (expires ~2026-11-19). Pass.
- `aha-asa-ivt-bp-threshold`: last_reviewed 2026-05-27, 36-mo window → within window (expires 2029-05-27). Pass.

## Rationale
The timing aid faithfully represents the standard 4.5 h IV thrombolysis window for both alteplase and tenecteplase, correctly excludes wake-up/unknown onset from the onset clock, and confines real-time chips to the screen (only the factual since-onset line reaches the copy export). The disabling-features punctuation normalization changed no clinical meaning and clears the em-dash ban. The single defensible concern, the BP chip's eligibility-asserting "candidate" label, was resolved by rewording to the conditional "If thrombolysis planned: BP goal <185/110".

## Required follow-ups
- **Condition 1 (addressed):** in-window BP chip reworded from "Thrombolytic candidate: ..." to "If thrombolysis planned: BP goal <185/110" (`PatientContextPanel.tsx`).
- **Condition 2 (addressed):** `bp-ivt-threshold-185-110` registry description updated to document the new in-window variant string (`claims.ts`).
- **Non-blocking (optional, deferred):** consider a one-line muted hint on the `Beyond 4.5h` chip that perfusion-selected extended-window or thrombectomy pathways may still apply, so it is not misread as a hard stop. Not required for this change.
