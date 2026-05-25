# Clinical review — Wave 1.1: 2026 ACC/AHA Dyslipidemia Integration (second pass)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-24

## Scope
- Claims touched (4 new): `dyslipidemia-2026-stroke-ldlc-55`, `dyslipidemia-2026-stroke-ldlc-70-not-vhr`, `dyslipidemia-2026-pcsk9-escalation`, `dyslipidemia-2026-stroke-major-ascvd`
- Citations affected (4 new): `acc-aha-dyslipidemia-2026-4.2.6-vhr`, `acc-aha-dyslipidemia-2026-4.2.6-not-vhr`, `acc-aha-dyslipidemia-2026-4.2.6-pcsk9-seq`, `acc-aha-dyslipidemia-2026-fig10`
- Surfaces changed: data surface (`claimId` field on SPARCL pearl object in `src/data/strokeClinicalPearls.ts`)
- Evidence-verifier packet: spot-checked source PDF directly on pages e1208–e1218 (2026-05-24)
- Trial-statistician report: not applicable — no trial-statistics surface; SPARCL NNT preserved from prior pearl text

## Prior blocks — resolution status
1. Figure 10 paraphrase → **RESOLVED.** `acc-aha-dyslipidemia-2026-fig10` carries verbatim §4.2.6 table footnote including the "history of ischemic stroke" bullet.
2. Lp(a) placeholder → **RESOLVED.** Removed from Wave 1; deferred to Wave 2.
3. bedsidePearl unrecognized scanner surface → **RESOLVED.** Removed from Wave 1; parked as `blocked:awaiting-scanner-support`.
4. `<70 mg/dL non-VHR` lacked verbatim → **RESOLVED.** `acc-aha-dyslipidemia-2026-4.2.6-not-vhr` quoted_text verbatim Rec #1, p e1208.
5. PCSK9 sequencing lacked verbatim → **RESOLVED.** `acc-aha-dyslipidemia-2026-4.2.6-pcsk9-seq` quoted_text verbatim Synopsis, p e1208.
6. Pearl tagged 1 claim, made 4 → **RESOLVED.** Pearl narrowed to single claim `dyslipidemia-2026-stroke-ldlc-55`.
7. Pearl conditional wording → **RESOLVED.** Gate-first rewrite: "If very-high-risk ASCVD … LDL-C <55 mg/dL. Otherwise: <70 mg/dL."

## Semantic validity
- `dyslipidemia-2026-stroke-ldlc-55` → **CONFIRMED.** VHR gate explicit; LDL-C <55 mg/dL target verbatim from Rec #5; prior ischemic stroke qualification correctly sourced to Figure 10 footnote.
- `dyslipidemia-2026-stroke-ldlc-70-not-vhr` → **CONFIRMED.** ≥50% reduction AND absolute goal both preserved; COR 1, LOE A; no certainty upgrade.
- `dyslipidemia-2026-pcsk9-escalation` → **CONFIRMED.** Maximally tolerated statin precondition preserved; "and/or" non-sequential framing accurate; "no longer require" language correctly attributed to the 2026 guideline.
- `dyslipidemia-2026-stroke-major-ascvd` → **CONFIRMED.** "history of ischemic stroke" bullet verbatim in Figure 10 footnote.

No drift in any never-drift category (strength, action verb, qualifiers, certainty, temporal). No synthesis smoothing.

## Citation accuracy
- `acc-aha-dyslipidemia-2026-4.2.6-not-vhr` — title, section, quoted_text: **PASS** (verbatim).
- `acc-aha-dyslipidemia-2026-4.2.6-pcsk9-seq` — title, section, quoted_text: **PASS** (verbatim).
- `acc-aha-dyslipidemia-2026-fig10` — title, section, quoted_text: **PASS** (verbatim, "history of ischemic stroke" confirmed).
- `acc-aha-dyslipidemia-2026-4.2.6-vhr` — section and quoted_text: **PASS**. Title metadata: **CONDITION.** Title says "Recommendation #4" but verbatim text is Rec #5 (escalation: "ezetimibe and/or a PCSK9 mAb should be added"). Rec #4 is the statin-initiation step. Title and section `field` must be corrected before merge — no clinical drift, editorial error only.

## Editorial / expert context
Not applicable — no new trial entry in Wave 1.1.

## Freshness
All four citations: `last_reviewed` 2026-05-24, `review_window_months: 6`, source = current major guideline. Next refresh due 2026-11-24. **PASS.**

## Rationale
Wave 1.1 resolves every Wave 1 block. Verbatim quoted_text fields are confirmed against the source PDF. The SPARCL pearl gate-first rewrite is clinically accurate and eliminates the universal-<55 misread risk. The single remaining issue is an editorial title-metadata error on one citation (Rec #4 vs Rec #5). This is unambiguous, non-clinical, and has a one-line fix — approve-with-conditions rather than block.

## Required follow-ups
1. **Before merge (condition):** Correct `acc-aha-dyslipidemia-2026-4.2.6-vhr` — change title to "Recommendation #5 (Very-High-Risk ASCVD: ezetimibe/PCSK9 escalation to LDL-C <55 mg/dL)" and section to "§4.2.6 Recommendation #5, p e1208".
2. **Wave 2 (informational):** Lp(a) recommendations deferred; Wave 2 pulls §3.4 verbatim.
3. **Wave 2 (informational):** bedsidePearl scanner surface remains parked under `blocked:awaiting-scanner-support`.
