# Clinical review — PR #fxa-andexanet-withdrawal-bedside

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude opus 4)
**Date:** 2026-06-02

## Scope
- Claims touched: `fxa-reversal-4fpcc-andexanet-withdrawn` (new); `ich-anticoagulation-reversal-synthesis` and `annexa-i-andexanet-fxa-ich-2024` (consistency-checked, not re-authored)
- Citations affected: `aha-asa-2022-ich-anticoag-reversal`, `fda-andexxa-safety-2024`, `astrazeneca-andexxa-withdrawal-2025`
- Surfaces changed: Structured data in `src/data/` (StrokeIchProtocolStep `ICH_PROTOCOL_ITEMS`, CodeModeStep4 `ORDERS` stat-ct-decline, HemorrhageProtocol `STEPS`, two `strokeClinicalPearls` entries, ANNEXA-I `bottomLineSummary` in `trialData.ts`); calculator/protocol string literals; guide-page `<Paragraph>` prose + `detail=` attribute (IchManagement, IvTpa); citation registry + claim registry
- Evidence-verifier packet: dated 2026-06-02 (FDA risk-benefit verbatim; AstraZeneca Dec-22-2025 sales-end; ANNEXA-I thrombosis 14.6% vs 6.9%, thrombosis-death 2.5% vs 0.9%) — relied upon for §13.6 source-resolution; quoted_text independently re-checked against registry below
- Trial-statistician report: not applicable — no statistics-display archetype change; ANNEXA-I edit is a prose append to `bottomLineSummary` only

## Semantic validity

Confirmed across all nine changed surfaces. The clinical force is preserved on every never-drift dimension:

- **Recommendation strength — not drifted.** The governing source (`aha-asa-2022-ich-anticoag-reversal`) places *both* andexanet alfa and 4F-PCC at **Class IIb, Level C-LD ("may be considered")** for FXa-inhibitor-associated ICH. The corrected bedside strings remove andexanet (now unavailable) and present "4-factor PCC 50 units/kg IV" as the US default *because* andexanet was withdrawn — they do **not** upgrade 4F-PCC to "recommended"/Class I, and they do not assert a head-to-head superiority that the evidence does not support. The synthesis surface (`clinicalSynthesesByQuestion`, lines 73/77/82) hedges this explicitly ("default … as of December 2025," "no head-to-head proves PCC superior"). No upgrade of evidentiary weight.
- **Action verbs — preserved.** Reversal verbs (reverse, administer, give) match the source intent.
- **Qualifiers/gates — preserved.** Warfarin clause (4F-PCC 25–50 U/kg + vitamin K 10 mg IV, goal INR <1.4, FFP only if PCC unavailable) and dabigatran clause (idarucizumab 5 g IV) are unchanged and remain correct in StrokeIchProtocolStep, HemorrhageProtocol, IchManagement, and the reversal pearl. FXa dose (50 U/kg IV) is consistent across every surface.
- **Certainty markers — preserved.** The ANNEXA-I `bottomLineSummary` append does not launder the trial's own evidence: it retains "hemostatic benefit … offset by a near-four-fold increase in ischemic stroke," "no functional benefit," "no mortality benefit," and frames the withdrawal as regulatory aftermath ("FDA concluded its thromboembolic risks outweighed its benefits"). The trial entry remains accurate as a historical record — efficacy (hemostatic surrogate 67.0% vs 53.1%, NNT 8) and the thrombosis signal (NNH 20 ischemic stroke) are intact and not contradicted by the appended sentence.
- **Temporal constraints — preserved and correctly tensed.** December 22, 2025 is in the past relative to the review date (2026-06-02). Every surface states the withdrawal as a completed event ("was withdrawn," "withdrawn … Dec 22, 2025," "sales ended"). No surface implies andexanet is still available or that withdrawal is pending.

Distinct-context check on IvTpa: this is the **pre-thrombolysis** scenario (reversing/excluding a DOAC effect *before* giving tPA), not ICH reversal. The corrected text — "no specific reversal agent is available in the US (andexanet alfa withdrawn Dec 22, 2025); tPA is contraindicated unless a normal anti-Xa level confirms absence of drug effect" — is clinically correct for that context and correctly does **not** import the ICH-reversal 4F-PCC dosing (4F-PCC is not given to enable thrombolysis). Logic is sound and internally consistent with §4 Key Exclusions on the same page.

US-only scoping is honored: the synthesis surface notes availability outside the US varies by formulary, and the bedside strings specify "US market." No surface globalizes the withdrawal.

## Citation accuracy

- `aha-asa-2022-ich-anticoag-reversal` — §7.3, year 2022, PMID 35579034. quoted_text supports the agent-specific reversal framework (4F-PCC + vitamin K for VKA Class I; idarucizumab for dabigatran Class I; andexanet **or** 4F-PCC Class IIb for FXa). The claim text faithfully reflects this with andexanet removed for availability and 4F-PCC retained. Correct section, accurate quote.
- `fda-andexxa-safety-2024` — quoted_text contains the FDA risk-benefit conclusion verbatim and the ANNEXA-I full-dataset figures (thrombosis 14.6% vs 6.9%; thrombosis-related death at day 30 2.5% vs 0.9%) used in the synthesis and trial-entry prose. Supports every "FDA concluded risks outweighed benefits" claim. Accurate.
- `astrazeneca-andexxa-withdrawal-2025` — quoted_text states US commercial sales end December 22, 2025 following the FDA communication and voluntary BLA withdrawal. Supports the "Dec 22, 2025" date on all surfaces. Accurate.

All three citations resolve; no dead reference, no missing section, no quote-claim mismatch.

## Editorial / expert context (REQUIRED for new-trial-entry PRs)

Not applicable — no new trial entry in this PR. ANNEXA-I already exists in `trialData.ts` (id `annexa-i-trial`); this PR only appends a regulatory-aftermath sentence to its `bottomLineSummary`.

## Freshness

- `aha-asa-2022-ich-anticoag-reversal`: `last_reviewed` 2026-05-23, 6-month window → within window (pass).
- `fda-andexxa-safety-2024`: `last_reviewed` 2026-06-02, 6-month window → refreshed this PR; within window (pass). §13.6 source-resolution and quoted_text match independently re-confirmed against the 2026-06-02 evidence-verifier packet.
- `astrazeneca-andexxa-withdrawal-2025`: `last_reviewed` 2026-06-02, 12-month window → refreshed this PR; within window (pass). Quoted_text re-confirmed.

Both `last_reviewed` refreshes are accompanied by the documented 2026-06-02 evidence-verifier packet confirming the six §13.6 steps.

## Rationale

This change correctly retires a now-unavailable bedside intervention (andexanet alfa, US sales ended December 22, 2025) and substitutes 4F-PCC 50 U/kg as the US default, hedged so that the substitution does not overstate 4F-PCC's evidence (the source places it at Class IIb, and the synthesis surface explicitly states no head-to-head RCT proves PCC superior). Warfarin and dabigatran reversal clauses are untouched and remain correct; the pre-tPA DOAC scenario in IvTpa is handled in its own distinct and clinically correct logic; the ANNEXA-I historical trial record is preserved with its efficacy-and-thrombosis trade-off intact. All three citations resolve and their quoted_text supports the claims as written; both refreshed `last_reviewed` dates are backed by a current evidence packet. No never-drift category drifted; no mandatory-block condition is met. Approve.

## Required follow-ups

- Non-blocking coverage gap: the IvTpa pre-tPA DOAC sentence carries corrected clinical text but is unscannable (the `<Paragraph>` surface cannot hold a `data-claim` tag, and the line is not the canonical tagged binding site). The claims.ts comment narratively covers IchManagement and IvTpa as the two untaggable Paragraph guide surfaces, which is acceptable under the documented limitation — but a future edit to that sentence will not trip the pre-commit scanner. Recommend a `data-architect` task to extend the scanner so `<Paragraph detail=>` clinical prose becomes taggable (Phase-3 composition-site surface), preventing silent future drift on guide-page reversal/contraindication text.
