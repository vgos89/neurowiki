# Clinical review — Post-Stroke Lipid Management Wave 2

**Decision:** approve-with-conditions (conditions resolved inline before commit)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-25

## Scope
- Claims touched: `dyslipidemia-2026-stroke-ldlc-55`, `dyslipidemia-2026-stroke-ldlc-70-not-vhr`, `dyslipidemia-2026-pcsk9-escalation`, `dyslipidemia-2026-stroke-major-ascvd`, `dyslipidemia-2026-bempedoic-vhr`, `dyslipidemia-2026-inclisiran-vhr`, `dyslipidemia-2026-ich-statin-uncertain`
- Citations affected: `acc-aha-dyslipidemia-2026-4.2.6-vhr`, `acc-aha-dyslipidemia-2026-4.2.6-not-vhr`, `acc-aha-dyslipidemia-2026-4.2.6-pcsk9-seq`, `acc-aha-dyslipidemia-2026-fig10`, `acc-aha-dyslipidemia-2026-4.2.6-bempedoic-vhr`, `acc-aha-dyslipidemia-2026-4.2.6-inclisiran`, `aha-asa-ich-2022-statin`, `teoh-2019-statin-stroke-ich`
- Surfaces changed: JSX (data-claim attributes on pathway page); Wave 1 data + bedsidePearl surfaces previously reviewed
- Evidence-verifier packet: not applicable (citations from prior-session evidence packets, Wave 1)
- Trial-statistician report: not applicable (no mRS-shift or NI/Bayesian/ordinal displays)

## Semantic validity

1. **`dyslipidemia-2026-stroke-ldlc-55`** — confirmed. JSX text "Target LDL-C <55 mg/dL" with COR 1 LOE A badges exactly matches `quoted_text`. Recommendation strength preserved.

2. **`dyslipidemia-2026-stroke-ldlc-70-not-vhr`** — confirmed. JSX text "Target LDL-C <70 mg/dL" with COR 1 LOE A matches `quoted_text` verbatim on the load-bearing numbers and strength.

3. **`dyslipidemia-2026-pcsk9-escalation`** — confirmed. Component states "ezetimibe and PCSK9 mAbs are now co-equal options"; `quoted_text` says "no longer require that ezetimibe be added to statin therapy prior to initiating a PCSK9 mAb" — fair paraphrase preserving clinical force (no sequencing requirement). Action-verb integrity preserved.

4. **`dyslipidemia-2026-stroke-major-ascvd`** — condition resolved. Original text "LDL >100 on maximal therapy" was a qualifier softening (never-drift category 3). Fixed to "LDL-C >100 mg/dL despite maximally tolerated statin + ezetimibe" matching the §4.2.6 footnote / Figure 10 qualifier exactly.

5. **`dyslipidemia-2026-bempedoic-vhr`** — condition resolved. Original text "Fourth-line agent per 2026 ACC/AHA Figure 11 algorithm" asserted Figure 11 sequencing not present in `quoted_text`. Fixed to "May be added after ezetimibe ± PCSK9 mAb per §4.2.6 Rec #6" which is fully covered by the existing `quoted_text` ("with or without ezetimibe and/or PCSK9 mAb"). COR 2a LOE B-R confirmed correct.

6. **`dyslipidemia-2026-inclisiran-vhr`** — confirmed. COR 2a LOE B-R exact. Caveat "no completed cardiovascular outcomes trial" accurate as of 2026 (ORION-4 pending). Component framing as "alternative to PCSK9 mAb when patient cannot tolerate evolocumab/alirocumab" matches `quoted_text` ("unable to tolerate evolocumab or alirocumab or have a strong preference for less frequent dosing"). Surfaced subset is faithful.

7. **`dyslipidemia-2026-ich-statin-uncertain`** — confirmed. Component uses the exact word "uncertain" matching `quoted_text`. COR 2b LOE B-NR badges correct. Teoh 2019 RR 1.42 (95% CI 1.07–1.87), 17 RCTs n=11,576 reproduced exactly. SPARCL post-hoc and FOURIER/ODYSSEY-OUTCOMES extrapolation caveats present and prominent ("neither trial enrolled ICH survivors — extrapolation is indirect"). Lobar frame caveats appropriately strong ("Do not present PCSK9 inhibitors as 'proven safe after ICH' — direct evidence is absent").

## Citation accuracy

- All eight citations resolve to current URL/DOI in registry; all `quoted_text` fields present and substantive.
- 2026 ACC/AHA citations: section, page numbers, and DOI consistent across the six §4.2.6 entries.
- 2022 ICH guideline: DOI resolves the Greenberg et al. Stroke 2022 article. Not blocking.
- Teoh 2019: PMID 31384308 present; numeric values verified.

## Editorial / expert context

Not applicable — no new trial entry in this PR.

## Freshness

- Six 2026 ACC/AHA citations: `last_reviewed` 2026-05-25, window 6 months — pass.
- 2022 AHA/ASA ICH statin: `last_reviewed` 2026-05-25, window 6 months — pass.
- Teoh 2019: `last_reviewed` 2026-05-25, window 36 months — pass.

## Rationale

The pathway accurately reproduces the 2026 ACC/AHA §4.2.6 LDL-C targets (<55 VHR, <70 non-VHR) with correct COR 1 LOE A; the PCSK9 sequencing change ("no longer requires ezetimibe first") is paraphrased faithfully; bempedoic acid and inclisiran carry the correct COR 2a LOE B-R; and the ICH arm preserves the word "uncertain" verbatim with COR 2b LOE B-NR. Two conditions identified and resolved inline: (1) VHR LDL criterion text now exactly matches the Figure 10 qualifier including "statin + ezetimibe"; (2) bempedoic acid sequencing claim replaced with wording fully covered by the Rec #6 `quoted_text`. Both conditions were low-risk editorial fixes — no clinical inversion, no threshold change. After conditions resolved, decision upgrades to approve.

## Required follow-ups

- None — both required conditions were resolved inline before commit.
