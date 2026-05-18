# Stroke Code Batch 3B — New Pearls (medical-scientist authoring brief)

**Date:** 2026-05-19
**Author:** medical-scientist
**For review by:** clinical-reviewer (gating per §17.2)
**Evidence packet:** `docs/evidence-packets/stroke-code-batch3b-2026-05-19.md`
**Architect artifact:** `docs/reviews/arch-stroke-code-batch3b-2026-05-19.md`

This doc lists every clinical claim shipped in Batch 3B, the statistical framing used, the caveats surfaced, and the PMID/DOI for verification. Use alongside the evidence packet to validate semantic accuracy.

---

## Summary of changes

- **11 new `ClinicalPearl` objects** appended to `src/data/strokeClinicalPearls.ts`.
- **3 existing `evidence` strings extended** (no content/threshold/class changes per architect §17.1):
  - `treatment-windows-quick` (step-1) — added "EXTEND 2019; WAKE-UP 2018; TRACE-III/TIMELESS 2024".
  - `lvo-workflow` (step-2) — added "HERMES 2016; DAWN/DEFUSE-3 2018; SELECT-2/ANGEL-ASPECT/LASTE/TENSION 2023–24".
  - `bp-posttpa-deep` (step-4) — added "SITS-ISTR 2009; ENCHANTED 2016; OPTIMAL-BP JAMA 2023; ENCHANTED2/MT Lancet 2022".

Section placements per architect §17.1 (locked):
- step-1.deep: TRACE-III, TIMELESS, AcT.
- step-2.deep: SELECT-2, ANGEL-ASPECT, LASTE, TENSION, BAOCHE, ATTENTION.
- step-5.deep: OPTIMAL-BP, ENCHANTED2/MT (Treatment Orders, NOT step-4 — post-EVT BP is post-treatment).

Schema constraints honored: no new fields added to `ClinicalPearl` interface (`last_reviewed`, `quoted_text` reserved for W5.2 via CLAIM_REGISTRY). `quoted_text` parked inside `detailedContent.evidence` strings as quoted abstract sentences for traceability without schema change.

---

## Pearl-by-pearl claims, framing, caveats

### 1. `trace-iii-trial` (step-1.deep)
- **Claims:** TNK 0.25 mg/kg in anterior LVO 4.5–24h with salvageable tissue and no EVT access; mRS 0–1 at 90d 33.0% vs 24.2%; RR 1.37 (95% CI 1.04–1.81), P=0.03; ARD 8.8 pp (95% CI 1.8–15.8); NNT ≈ 11; sICH 3.0% vs 0.8%; AHA/ASA 2026 §4.6.3 Rec 3 Class 2b LOE B-R.
- **Statistical framing:** Superiority (binary primary). NNT appropriate. ARD with CI displayed alongside NNT per trial-statistics skill.
- **Caveats surfaced:** TIMELESS limits generalization to no-EVT-access populations; China-only enrollment; stopped early for efficacy.
- **PMID:** 38884324. **DOI:** 10.1056/NEJMoa2402980.
- **Class/Level claim:** IIb / B (consistent with AHA/ASA 2026 §4.6.3 Rec 3).

### 2. `timeless-trial` (step-1.deep)
- **Claims:** Negative trial. TNK 0.25 mg/kg in anterior LVO 4.5–24h with salvageable tissue (NIHSS ≥5, US/Canada); 77% received EVT; adjusted common OR 1.13 (95% CI 0.82–1.57), P=0.45; sICH ~3% both arms; AHA/ASA 2026 does not endorse late-window TNK when EVT is available.
- **Statistical framing:** Ordinal-shift. No NNT. Grotta bar appropriate.
- **Caveats surfaced:** 77% of patients received EVT (TNK functioned as bridging); M1 subgroup signal is post-hoc.
- **PMID:** 38329148. **DOI:** 10.1056/NEJMoa2310392.
- **Class/Level claim:** III / B — labeled as negative/limiting trial per evidence packet directive.

### 3. `act-trial` (step-1.deep)
- **Claims:** TNK 0.25 mg/kg vs alteplase 0.9 mg/kg in AIS ≤4.5h, Canadian pragmatic; mRS 0–1 36.9% vs 34.8%; RD 2.1% (95% CI −2.6 to 6.9); NI margin Δ = −5%, lower CI bound above margin → NI met; sICH and mortality NS; AHA/ASA 2026 §4.6.2 Rec 1 Class 1 LOE A.
- **Statistical framing:** Noninferiority. NO NNT. NI margin chart with RD + CI per trial-statistics skill.
- **Caveats surfaced:** NI design; pragmatic enrollment with no advanced imaging.
- **PMID:** 35779553. **DOI:** 10.1016/S0140-6736(22)01054-6.
- **Class/Level claim:** I / A.

### 4. `select2-trial` (step-2.deep)
- **Claims:** EVT in anterior LVO with ASPECTS 3–5 or core ≥50 mL, up to 24h; gOR 1.51 (95% CI 1.20–1.89), P<0.001; mRS 0–2 20% vs 7%; sICH 0.6% vs 1.1% (NS); AHA/ASA 2026 §4.7.2 Rec 3 Class 1 LOE A.
- **Statistical framing:** Ordinal-shift (generalized OR). No NNT. Grotta bar appropriate.
- **Caveats surfaced:** Vascular complications + hemorrhages higher with EVT despite functional gain; consent discussion required.
- **PMID:** 36762865. **DOI:** 10.1056/NEJMoa2214403.
- **Class/Level claim:** I / A.

### 5. `angel-aspect-trial` (step-2.deep)
- **Claims:** Chinese trial of EVT in anterior LVO with ASPECTS 3–5 or core 70–100 mL within 24h; gOR 1.37 (95% CI 1.11–1.69), P=0.004; mRS 0–3 47.0% vs 33.3%; sICH 6.1% vs 2.7% (P=0.07); AHA/ASA 2026 §4.7.2 Rec 3 Class 1 LOE A.
- **Statistical framing:** Ordinal-shift. No NNT.
- **Caveats surfaced:** China-only enrollment; stopped early at interim for efficacy; sICH numerically higher.
- **PMID:** 36762852. **DOI:** 10.1056/NEJMoa2213379.
- **Class/Level claim:** I / A.

### 6. `laste-trial` (step-2.deep)
- **Claims:** EVT in anterior LVO ≤6.5h with ASPECTS ≤5 (no lower bound); gOR 1.63 (95% CI 1.29–2.06); median mRS 4 vs 6; mortality 36.1% vs 55.5% (RR 0.65); sICH 9.6% vs 5.7%; AHA/ASA 2026 §4.7.2 Rec 4 Class 2a LOE B-R for ASPECTS 0–2.
- **Statistical framing:** Ordinal-shift. No NNT. Trial-reported "NNT=4" is shift-derived only and explicitly disclaimed in the pearl per clinical-trial-audit skill.
- **Caveats surfaced:** Stopped early; mortality benefit is the dominant signal; sICH higher with EVT.
- **PMID:** 38718358. **DOI:** 10.1056/NEJMoa2314063.
- **Class/Level claim:** IIa / B (for ASPECTS 0–2 stratum per AHA/ASA 2026 §4.7.2 Rec 4).

### 7. `tension-trial` (step-2.deep)
- **Claims:** EVT in anterior LVO with NCCT-only ASPECTS 3–5 up to 12h; adjusted cOR 2.58 (95% CI 1.60–4.15), P=0.0001; mortality 40% vs 51% (P=0.038); sICH 5% vs 5% (NS); contributes to AHA/ASA 2026 §4.7.2 Class 1 LOE A.
- **Statistical framing:** Ordinal-shift. No NNT.
- **Caveats surfaced:** Stopped early at first interim; de-emphasizes mandatory CTP for large-core decisions.
- **PMID:** 37837989. **DOI:** 10.1016/S0140-6736(23)02032-9.
- **Class/Level claim:** I / A.

### 8. `baoche-trial` (step-2.deep)
- **Claims:** Basilar AO, 6–24h, PC-ASPECTS ≥6, NIHSS ≥10 (amended); mRS 0–3 46% vs 24%; aRR 1.81 (95% CI 1.26–2.60), P<0.001; sICH 6% vs 1% (NNH ≈ 20); AHA/ASA 2026 §4.7.3 Rec 1 Class 1 LOE A.
- **Statistical framing:** Superiority (binary primary). NNT/NNH appropriate; ARD ~22 pp.
- **Caveats surfaced:** Protocol amendment (mRS 0–4 → 0–3); NIHSS 6–9 stratum n=17 only; China-only; stopped early.
- **PMID:** 36239645. **DOI:** 10.1056/NEJMoa2207576.
- **Class/Level claim:** I / A.

### 9. `attention-trial` (step-2.deep)
- **Claims:** Basilar AO ≤12h, NIHSS ≥10; mRS 0–3 46% vs 23%; aRR 2.06 (95% CI 1.46–2.91), P<0.001; mortality 37% vs 55%; sICH 5% vs 0%; AHA/ASA 2026 §4.7.3 Rec 1 Class 1 LOE A.
- **Statistical framing:** Superiority (binary primary). NNT/NNH appropriate; ARD ~23 pp.
- **Caveats surfaced:** Stopped early; China-only.
- **PMID:** 36239644. **DOI:** 10.1056/NEJMoa2206317.
- **Class/Level claim:** I / A.

### 10. `optimal-bp-trial` (step-5.deep)
- **Claims:** Post-EVT (mTICI ≥2b), South Korea; SBP <140 vs 140–180 for 24h; mRS 0–2 39.4% vs 54.4%; aOR 0.56 (95% CI 0.33–0.96), P=0.03; RD −15.1 pp; NNH ≈ 7 for loss of functional independence; intensive lowering harmful; AHA/ASA 2026 §4.3.
- **Statistical framing:** Superiority (binary primary), harm direction. NNH (not NNT) per trial-statistics skill.
- **Caveats surfaced:** Stopped early for harm — truncation-bias caveat surfaced; does not change pre-IVT <185/110 rule.
- **PMID:** 37668619. **DOI:** 10.1001/jama.2023.14590.
- **Class/Level claim:** III / A (Class III: Harm direction).

### 11. `enchanted2-mt-trial` (step-5.deep)
- **Claims:** Post-EVT with persistent SBP ≥140, Chinese; SBP <120 vs 140–180 for 72h; cOR 1.37 (95% CI 1.07–1.76) for poor outcome favoring less-intensive arm; major disability OR 2.07 (95% CI 1.47–2.93); more-intensive lowering harmful; AHA/ASA 2026 §4.3.
- **Statistical framing:** Ordinal-shift, harm direction. No NNT. Grotta bar appropriate.
- **Caveats surfaced:** Stopped early; China-only; explicit warning not to conflate <120 (ENCHANTED2/MT) with <140 (OPTIMAL-BP) — different thresholds, same directional message.
- **PMID:** 36341753. **DOI:** 10.1016/S0140-6736(22)01882-7.
- **Class/Level claim:** III / B (Class III: Harm direction per AHA/ASA 2026 §4.3).

---

## Framing decisions matrix

| Pearl | Design | NNT/NNH shown? | Why |
|---|---|---|---|
| trace-iii-trial | superiority binary | NNT ≈ 11 + ARD with CI | binary primary, pre-specified |
| timeless-trial | ordinal-shift | no | negative ordinal trial |
| act-trial | noninferiority | no | NI design — NI margin + RD with CI only |
| select2-trial | ordinal-shift (gOR) | no | ordinal primary |
| angel-aspect-trial | ordinal-shift (gOR) | no | ordinal primary |
| laste-trial | ordinal-shift (gOR) | no | ordinal primary; trial-reported "NNT=4" explicitly disclaimed |
| tension-trial | ordinal-shift (acOR) | no | ordinal primary |
| baoche-trial | superiority binary | yes — ARD ~22 pp, NNH ≈ 20 for sICH | binary primary (amended), pre-specified |
| attention-trial | superiority binary | yes — ARD ~23 pp | binary primary |
| optimal-bp-trial | superiority binary, harm | NNH ≈ 7 (not NNT) | harm direction |
| enchanted2-mt-trial | ordinal-shift, harm | no | ordinal primary, harm direction |

---

## Cross-references for clinical-reviewer

- All numeric claims trace to the evidence packet section for the corresponding trial.
- Every pearl carries `evidence`, `evidenceClass`, `evidenceLevel`, `plainEnglish`, `pmid`, `nctId`, `trialSlug`, and a `detailedContent` block with overview / clinicalTips / evidence (with verbatim abstract sentence) / reference.
- All 6 ordinal-shift trials display the common/generalized OR with CI in pearl prose. None display NNT.
- AcT pearl displays RD with CI and explicit NI margin. No NNT.
- OPTIMAL-BP displays NNH (harm direction). ENCHANTED2/MT displays cOR with CI in harm direction; no NNT per ordinal-shift rules.
- Caveats per clinical-trial-audit skill: stop-early bias surfaced on LASTE, TENSION, OPTIMAL-BP, ENCHANTED2/MT, TRACE-III, BAOCHE, ATTENTION; China-only on ANGEL-ASPECT, ENCHANTED2/MT, TRACE-III, BAOCHE, ATTENTION; protocol amendment on BAOCHE; TIMELESS labeled negative/limiting; TRACE-III generalization caveat ("no EVT access") embedded.
- `trialSlug` paths reference `/trials/<slug>` per existing pattern; orchestrator/data-architect to verify routes exist in `routeManifest.ts` and `trialListData.ts`.
- Citation registration (CLAIM_REGISTRY) deferred to W5.2 per architect; pearl-ID list for backfill: trace-iii-trial, timeless-trial, act-trial, select2-trial, angel-aspect-trial, laste-trial, tension-trial, baoche-trial, attention-trial, optimal-bp-trial, enchanted2-mt-trial.
