# Clinical review — PR (glucose <50-vs-<60 threshold consistency)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-10

## Scope
- Claims touched: none with registry bindings — all five edited surfaces are non-claim-scanned narrative (no `data-claim` attribute, no `claimId` field). No `CLAIM_REGISTRY` entry is added, modified, or removed.
- Citations affected (governing, not modified): `aha-asa-2026-4.5` (§4.5 Blood Glucose Management), `aha-asa-2026-4.6.5-coagulopathy` (§4.6.5 / Table 8 Absolute Contraindications).
- Surfaces changed (§13.3): Markdown content blob (`guideContent.ts`); structured-data narrative strings (`strokeClinicalPearls.ts`, three pearls); static JSX array literal (`QuickReferenceCard.tsx`).
- Evidence-verifier packet: not applicable (no trial-data/statistics change, no new trial entry).
- Trial-statistician report: not applicable.

## Semantic validity

**Concept A — mimic / treat threshold <50 -> <60 (3 surfaces). CONFIRMED.**
- `guideContent.ts` L781: "Rule out hypoglycemia (<60 mg/dL), which is a common mimic." Matches §4.5 COR 1 (<60 treat-threshold). The prior <50 left a 50-59 mg/dL gap where the app implied no action while §4.5 says treat; gap now closed.
- `strokeClinicalPearls.ts` L669 + L809: threshold corrected to <60; surrounding clinical logic (POC glucose mandatory; D50/recheck/reassess) preserved and consistent with §4.5.

**Concept B — glucose is NOT a 2026 absolute IVT contraindication (2 surfaces). CONFIRMED.**
- `strokeClinicalPearls.ts` L193: trailing "Blood glucose <50 mg/dL (hypoglycemia mimic)." replaced with "(Hypoglycemia is corrected and reassessed, not an absolute contraindication: if a focal deficit persists after glucose normalizes to >=60 mg/dL, tPA proceeds.)" Clinically accurate, does not overstate; "proceeds" is correctly gated on a persistent focal deficit after normoglycemia; the >=60 target is consistent with §4.5.
- `QuickReferenceCard.tsx` L150: "Glucose < 50 or > 400 mg/dL (uncorrected)" REMOVED from the "Absolute Contraindications to IVT (key)" list. Removal confirmed as the correct disposition (not approve-with-conditions): glucose is absent from the 2026 Table 8 absolute-CI lab row (`aha-asa-2026-4.6.5-coagulopathy` enumerates platelets <100,000/mm³, INR>1.7, aPTT>40s, PT>15s); a correctable lab value cannot be an absolute contraindication; and a reframe-in-place inside a list titled "Absolute Contraindications" would be self-contradictory. The remaining 7 items are 2026-accurate, so the card's "Source: 2026 AHA/ASA Guidelines" stamp is now truthful. No reframed glucose note is required on this card; the nuance lives correctly on the L193 pearl.

**Never-drift audit (all five):** recommendation strength preserved (COR 1 "should be treated", no up/downgrade); action verbs accurate; qualifiers improved not dropped (the <60 gate and the persistent-deficit gate are correct; the removed glucose-CI was a wrong gate); no certainty laundering ("can mimic" optionality retained); no temporal constraint altered. Pass on all five.

## Citation accuracy
- `aha-asa-2026-4.5` — verbatim `quoted_text` matches `aha2026StrokeGuideline.ts` §4.5 (L253-268) on direct read (COR 1 LOE C-LD, hypoglycemia <60 mg/dL treat-threshold). Governs all Concept A surfaces.
- `aha-asa-2026-4.6.5-coagulopathy` — verbatim `quoted_text` enumerates the Table 8 absolute-CI lab thresholds; glucose is absent, which is the affirmative evidence for Concept B. Governs both Concept B surfaces.
- No new citation required or created.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
- `aha-asa-2026-4.5` — `last_reviewed` 2026-05-22; 6-month window (§13.7); 19 days old; within window.
- `aha-asa-2026-4.6.5-coagulopathy` — `last_reviewed` 2026-06-10; within window.
- No `last_reviewed` modified; §13.6 refresh not triggered.

## Rationale
The app carried 2019/NINDS-era glucose values (<50 as a mimic floor and as an absolute IVT contraindication) that the 2026 guideline does not support. 2026 defines hypoglycemia for AIS at <60 mg/dL and says treat it (§4.5, COR 1), and lists no glucose value in any Table 8 contraindication row. The five edits move every glucose mention onto the correct 2026 footing without touching any never-drift category, without altering a registry claim binding, and without overstating the reframed nuance. The QuickReferenceCard removal deletes an affirmatively wrong "absolute contraindication" item and makes the card's 2026 source stamp truthful. Governing citations are current and verbatim. Approve.

## Required follow-ups
- (Informational, out of scope, do NOT block.) The unchanged `contraindications-absolute` pearl (L193) and the `step-3` warfarin pearl (L660) still phrase "Therapeutic LMWH <24h" and "Direct thrombin/Factor Xa inhibitors" as absolute contraindications. Under 2026 §4.6.5, DOAC exposure <48h is RELATIVE (`aha-asa-2026-4.6.5-doac-relative`), and LMWH folds into the aPTT>40s coagulopathy row rather than a standalone absolute row. Separate pre-existing DOAC/LMWH classification question, not a glucose issue. Recommend a future Class E task (medical-scientist -> clinical-reviewer) to reconcile; tracked separately. None of these strings were edited by this PR.
