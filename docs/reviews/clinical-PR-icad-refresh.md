# Clinical review — ICAD refresh (Phase 1 / WOVEN-free)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-22

## Scope
- Claims touched: `icas-stenting-synthesis`, `cassiss-primary-result`, `basis-primary-result` (the `woven-primary-result` claim was removed with the WOVEN card)
- Citations affected: `gao-cassiss-2022` (corrected), `sun-basis-2024` (new), `gutierrez-icas-review-2022` (new), `alexander-woven-2021` (new, retained as a synthesis-prose reference only, no trial card)
- Surfaces changed: structured data in `src/data/` (adjacent `claimId`/`bedsidePearlClaimId`), the ClinicalSynthesisCard data surface, catalog metadata (card-meta regenerated to 110), question metadata (`icas-stenting` now 4 trials)
- Evidence-verifier packet: `docs/evidence-packets/2026-07-22-icad-refresh.md` (present; numbered §8 added; trial-statistician input in §6; archetypes assigned §1-§2)
- Trial-statistician report: CASSISS archetype A / not-met / NEUTRAL; BASIS archetype A / met / POSITIVE. Both match the display archetypes and render correctly through the two-arm renderer. No archetype disagreement.

## Semantic validity
Confirmed accurate against the packet for the exact shipping set:
- **CASSISS** card: 8.0% vs 7.2%, HR 1.10 (0.52–2.35), P=.82, not-met; 30-day 5.1% vs 2.2%; sICH 2.3% vs 0%; 3-yr mortality 4.4% (7/160) vs 1.3% (2/159), HR 3.75 (0.77–18.13), P=.08; 358 analyzed of 380; ≥3 weeks. Matches packet §1. Renders as a correct two-arm comparison (Stenting+AMM vs AMM); NNT card shows N/A (negative trial), effect shows HR 1.10. Durable message (AMM first-line, AHA/ASA 2021 Class 1) preserved.
- **BASIS** card: 4.4% vs 13.5%, HR 0.32 (0.16–0.63), P<.001; territory stroke 0.4% vs 7.5%; revasc 1.2% vs 8.3%; 30-day 3.2% vs 1.6%; sICH 1.2% vs 0.4%; dissection 14.5%; 501 analyzed of 512. Matches packet §2. No overclaim: balloon-not-stenting, single-country/open-label/expert-center, composite-includes-revascularization, upfront-risk, not-guideline-endorsed, and explicit "does not overturn SAMMPRIS/CASSISS, does not validate stenting" all present and prominent. NNT suppressed in the rendered output (renders N/A).
- **Synthesis** (`icas-stenting`): faithful. Preserves the two-axis distinction (SAMMPRIS/CASSISS initial-stenting fails; BASIS a different, gentler technique benefits), refuses the forbidden claims (BASIS does not overturn prior RCTs; WEAVE/WOVEN single-arm safety only; no generalization outside China), and anchors on AHA/ASA 2021 SP §5.5 with BASIS flagged not-yet-incorporated. WOVEN survives only as single-arm-safety prose (8.5%, 11/129, "cannot establish efficacy"), backed by the retained `alexander-woven-2021` citation. No synthesis-smoothing.

The Phase-1 render-framing risk is resolved: with the WOVEN trial card removed, no single-arm cohort is rendered through the generic two-bar comparison. The only two cards that reach that renderer (CASSISS, BASIS) are genuine two-arm RCTs where the display is clinically correct.

## Citation accuracy
- **`gao-cassiss-2022` PMID correction — confirmed fixed.** Registry and trial card both carry `35943472`; the erroneous `35943471` (which packet §1 verified points to RESCUE BT, Qiu, JAMA 2022;328(6):543-553) is removed; URL repointed to the DOI; `quoted_text` corrected (N, endpoint, P value). Resolves the real defect.
- **`sun-basis-2024`, `gutierrez-icas-review-2022`** — new; `quoted_text` supports the mapped claims and matches the packet. Gutierrez `review_window_months: 36` override carries a stated rationale (stable epidemiologic fact + vahedi-pooled precedent), acceptable.
- **`alexander-woven-2021`** — retained without a trial card; `quoted_text` supports the synthesis prose that cites it. Not orphaned; referenced by `icas-stenting-synthesis` citation_ids.
- Claims mapping consistent: `icas-stenting-synthesis` carries 8 citations (incl. retained `alexander-woven-2021`); the two `*-primary-result` pearls each map to their single trial citation.

## Editorial / expert context (REQUIRED for new-trial-entry PRs)
Packet §8 is present, numbered, and complete for both Phase-1 new-trial entries (CASSISS, BASIS):
- **§8a (accompanying editorial):** BASIS — Turan & Derdeyn, JAMA 2024, PMID 39235792 (verified). CASSISS — explicit "no verified paired same-issue editorial located," with downstream ESO/Stroke commentary noted. Filled, not silently omitted.
- **§8b (post-publication letters/replies):** both explicit "searched, none located 2026-07-22" declarations.
- **§8c (guideline incorporation):** CASSISS reinforces AHA/ASA 2021 SP §5.5 (no reclassification); BASIS not yet incorporated (practice-informing). Filled.
- **§8d (subsequent meta-analyses / contradicting evidence):** CASSISS 3-yr Stroke 2022 + long-term Stroke 2024 + pooled SAMMPRIS/VISSIT/CASSISS reviews; BASIS sole positive endovascular ICAS trial + pooled framing + timing signal. Filled.

No sub-item is silently incomplete → mandatory-block #8 satisfied. The disclosed §8 flag (CASSISS long-term Stroke 2024 and pooled effect framings located via search but not full-text-read) does not reach the clinician: none of that §8d material is quoted in rendered trial-card content. Recorded as a follow-up, not a blocker.

## Freshness
- All shipping citations `last_reviewed: 2026-07-22`, windows 36 months, within window.
- `gao-cassiss-2022` is a refresh, so the §13.6 six-step checklist applies and is satisfied by the packet: source resolves (PMID corrected/DOI verified), guideline version current (2021 AHA/ASA SP §5.5), dependent claims consistent, no wording drift (quoted_text corrected), newer evidence considered (BASIS/WOVEN incorporated per §8d), dual sign-off (evidence-verifier + trial-statistician + this gate). Pass. `sun-basis-2024`, `gutierrez-icas-review-2022`, `alexander-woven-2021` are new entries.

## Rationale
The two Phase-1 blockers are cleared at the root, not papered over. Removing the WOVEN trial card eliminates the single-arm-as-controlled-comparison render defect entirely: the only two cards reaching the generic two-bar renderer are genuine two-arm RCTs (CASSISS, BASIS) where that display is faithful, and WOVEN persists only as correctly-qualified single-arm-safety prose in the synthesis. Packet §8 is complete with every sub-item filled or explicitly declared. The CASSISS PMID correction — a real defect that mislinked to RESCUE BT — ships correctly. The trial data, synthesis, citations, and claims are clinically accurate and faithful to the verified evidence. Nothing must be fixed before commit; the remaining items are post-merge robustness follow-ups.

## Required follow-ups
- **BASIS NNT robustness (non-blocking):** NNT currently renders `N/A` only because `arr = treatment − control` goes negative for this event-rate-lower-is-better composite. Add an explicit NNT-suppression mechanism for BASIS so a future NNT-formula change cannot silently surface an NNT (~11). Not a current defect.
- **WOVEN Phase 2:** before re-adding the WOVEN trial card, build a single-arm render path that (a) does not draw the generic two-bar `efficacyResults` comparison and (b) presents the SAMMPRIS line as an explicitly-labeled illustrative historical reference with no "Benchmark met/failed" pass/fail pill (a no-pre-specified-threshold variant of `BenchmarkThresholdChart`), reviewed by ui-architect + trial-statistician + this gate.
- **§8d full-text (non-blocking):** on the next citation review, complete full-text reading of the CASSISS long-term Stroke 2024 paper and the pooled SAMMPRIS/VISSIT/CASSISS analyses; acceptable to defer since none of that material is quoted in rendered content.
