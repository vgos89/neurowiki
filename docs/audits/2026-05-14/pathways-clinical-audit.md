# Pathways Clinical Audit — AHA/ASA 2026 AIS Guideline

**Date:** 2026-05-14
**Reference:** Prabhakaran et al, *2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke*, Stroke 2026;57:e00-e00. DOI: 10.1161/STR.0000000000000513.
**Scope of this audit:** the three pathways governed by the AIS 2026 guideline. The other three pathways (SE, Migraine, GCA) are flagged as **N/A for AIS 2026** and require a separate audit against their governing references.

> **Methodology note.** Read-only review. Each clinical claim in the three in-scope pathway source files was cross-checked against the COR/LOE rows in the AHA 2026 recommendation tables (§4.6 "IV Thrombolytics", §4.7 "Endovascular Thrombectomy", §4.9 "Anticoagulants"). I read §4.6 (pages e38-e47), §4.7 (pages e52-e61), and §4.9 (pages e68-e70) end-to-end.

---

## CRITICAL DISCREPANCIES — none found

After full cross-check against AHA 2026 §4.6, §4.7, and §4.9: **zero critical discrepancies** in the three in-scope pathways. All COR/LOE assertions, NIHSS/ASPECTS thresholds, time windows, and dose figures align with the published 2026 table rows. Minor caveats and labeling nuances are listed per-pathway below.

This is a strong baseline. The repo has been kept in step with the 2026 guideline.

---

## EvtPathway.tsx (`/pathways/evt`) — governed by AHA 2026 §4.7

**File:** `src/pages/EvtPathway.tsx`
**Guideline anchor:** §4.7.2 "Endovascular Thrombectomy for Adult Patients" (Table p.e53-e54, Figure 3 p.e61), §4.7.3 "Posterior Circulation Stroke" (Table p.e56).

| Claim | Where in pathway | Repo says | AHA 2026 says | Discrepancy? |
|---|---|---|---|---|
| Standard early window (0-6h, anterior LVO) | line 330-332; badge "COR 1 · HERMES" | COR 1 · NIHSS ≥6 · prestroke mRS 0-1 · ASPECTS 3-10 | §4.7.2 Rec #1 (COR 1, LOE A): "anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours, NIHSS ≥6, prestroke mRS 0-1, ASPECTS 3-10" | **none** |
| Early window mRS 2 + ASPECTS ≥6 | line 295-303; badge "COR 2a · HERMES" | COR 2a · "EVT is reasonable" | §4.7.2 Rec #5 (COR 2a, LOE B-NR): "NIHSS ≥6 and ASPECTS ≥6, who have a prestroke mRS score of 2, EVT is reasonable" | **none** |
| Early window mRS 3-4 + ASPECTS ≥6 | line 310-318; badge "COR 2b · Cohort Data" | COR 2b · "EVT might be reasonable" | §4.7.2 Rec #6 (COR 2b, LOE B-NR): "NIHSS ≥6 and ASPECTS ≥6, mRS 3-4, EVT might be reasonable" | **none** — repo's badge wording "Cohort Data" is acceptable since LOE is B-NR (nonrandomized). |
| Very large core 0-6h ASPECTS 0-2 | line 169 evidence badge; result text refs SELECT2/ANGEL-ASPECT/LASTE | COR 2a · age <80 · NIHSS ≥6 · mRS 0-1 · no significant mass effect | §4.7.2 Rec #4 (COR 2a, LOE B-R): "age <80, NIHSS ≥6, prestroke mRS 0-1, ASPECTS 0-2, no significant mass effect" | **none** |
| Late window ASPECTS ≥6 (6-24h) | line 174; badge "COR 1 · DAWN/DEFUSE-3" | COR 1 | §4.7.2 Rec #2 (COR 1, LOE A): "6-24h, NIHSS ≥6, mRS 0-1, ASPECTS ≥6" | **none** |
| Late window ASPECTS 3-5 (6-24h) | line 178; badge "COR 1 · SELECT2/ANGEL-ASPECT/LASTE" | COR 1 | §4.7.2 Rec #3 (COR 1, LOE A): "6-24h, age <80, NIHSS ≥6, mRS 0-1, ASPECTS 3-5, no significant mass effect" | **minor** — Rec #3 carries an **age <80** constraint not enforced explicitly at this branch (repo's `age` enum is captured in section 1, but the late-window ASPECTS 3-5 path doesn't re-gate on `age === '18_79'`). Recommend a small refinement: the late-window ASPECTS 3-5 path should require `age !== '80_plus'`. Same applies to the very-large-core 0-6h path (Rec #4 also age <80). |
| Late window severe hypodensity ≥26 mL | lines around 38-39 and result text | "SELECT2 Safety Caveat" — warns rather than excludes | §4.7.2 supportive text p.e55: "threshold of ≥26 mL with hypodensity ≤26 HU may receive no functional benefit from EVT and instead face higher complication rates" | **none** — repo correctly treats this as a *caveat*, not an absolute exclusion. AHA wording is "may receive no functional benefit," not "do not treat." |
| Basilar 0-24h, NIHSS ≥10, pc-ASPECTS ≥6, mRS 0-1 | line 241-248; badge "COR 1 · ATTENTION/BAOCHE" | COR 1 | §4.7.3 Rec #1 (COR 1, LOE A): "basilar artery occlusion, mRS 0-1, NIHSS ≥10, PC-ASPECTS ≥6, EVT within 24 h" | **none** |
| Basilar 0-24h, NIHSS 6-9 | line 253-260; badge "COR 2b · BAOCHE" | COR 2b · "not well established" | §4.7.3 Rec #2 (COR 2b, LOE B-R): "mRS 0-1, NIHSS 6 to 9, PC-ASPECTS ≥6, effectiveness... is not well established" | **none** — repo's wording is taken almost verbatim from the table. |
| Basilar with low NIHSS (<6) | text "No Established LOE" | basilar low-NIHSS not endorsed | Not in 2026 table — guideline lists this as a "Knowledge Gap" (p.e56: "Future studies are needed to investigate the role of EVT in patients with basilar occlusions and low NIHSS scores [defined as NIHSS <10]"). | **none** — repo correctly labels "No Established LOE." |
| MeVO dominant M2 (0-6h) | result variant references COR 2a Selected MeVO | COR 2a | §4.7.2 Rec #7 (COR 2a, LOE B-NR): "occlusion of the dominant proximal M2... mRS 0-1, NIHSS ≥6, ASPECTS ≥6, EVT is reasonable, but the benefits are uncertain" | **none** |
| MeVO nondominant M2, codominant M2, distal M2/M3, ACA, PCA | "Class III: No Benefit"; badge "COR 3 · ESCAPE-MeVO/DISTAL" | COR 3: No Benefit | §4.7.2 Rec #8 (COR 3: No Benefit, LOE A): "nondominant or codominant M2, distal MCA, ACA, PCA — EVT is not recommended" | **none** |
| Pre-stroke mRS >4 | line 210 | "EVT is not recommended for prestroke mRS >4" | Consistent with the IDD (Insufficient Data to Determine) cells in Figure 3 p.e61 for the relevant branches | **none** |
| Age <18 | line 211 | "Standard guidelines apply to age ≥18. Pediatric thrombectomy requires specialized consultation" | §4.7.5 has dedicated pediatric recs (COR 2a B-NR for ≥6 yr, COR 2b B-NR for 28d–6yr). Repo defers to consultation; not a discrepancy but could be enriched. | **none (consider follow-up)** |

**EvtPathway summary:** clinically excellent alignment with AHA 2026. One minor refinement worth tracking: explicitly gate age <80 on the late-window ASPECTS 3-5 branch (Rec #3) and the very-large-core 0-6h branch (Rec #4). Today the user can select age `≥ 80` and still reach a "Class I/IIa" status on those branches.

---

## ExtendedIVTPathway.tsx (`/pathways/late-window-ivt`) — governed by AHA 2026 §4.6

**File:** `src/pages/ExtendedIVTPathway.tsx`
**Guideline anchor:** §4.6.2 "Choice of Thrombolytic Agent" (Table p.e42), §4.6.3 "Extended Time Windows for Intravenous Thrombolysis" (Table p.e44).

| Claim | Where in pathway | Repo says | AHA 2026 says | Discrepancy? |
|---|---|---|---|---|
| Path A (unknown onset, MRI DWI-FLAIR mismatch, within 4.5h of recognition) | lines around 638-700; status `cor: '2a'`, trials `WAKE-UP`/`THAWS` | COR 2a, basis WAKE-UP + THAWS | §4.6.3 Rec #1 (COR 2a, LOE B-R): "unknown time of onset and are within 4.5 hours from symptom recognition, MRI-DWI lesion smaller than one-third of MCA territory and no marked signal change on FLAIR, IVT administered within 4.5 hours of stroke symptom recognition can be beneficial" | **none** |
| Path B (4.5-9h LKW or wake-up within 9h midpoint, salvageable penumbra on perfusion) | lines 434-439; `cor: '2a'`, trials EXTEND/EPITHET/ECASS-4 | COR 2a; CT perfusion mismatch >10 mL & ratio >1.2; or MRI DWI-PWI | §4.6.3 Rec #2 (COR 2a, LOE B-R): "salvageable ischemic penumbra detected on automated perfusion imaging, (a) awake with stroke symptoms within 9 hours from midpoint of sleep or (b) 4.5-9 hours from LKW, IV thrombolysis may be reasonable" | **none** — mismatch thresholds (>10 mL / >1.2) are EXTEND/perfusion-RAPID operational; AHA does not pin a specific volume cutoff. Acceptable trial-operational refinement. |
| Path C-LVO (9-24h LKW, ICA/M1/M2, no feasible EVT, expert care) | lines 461-465; `cor: '2b'`, trials TRACE-III | COR 2b; "may be considered" | §4.6.3 Rec #3 (COR 2b, LOE B-R): "AIS due to LVO with salvageable ischemic penumbra, presenting within 4.5 to 24 hours from symptom onset or last known well, and who cannot receive EVT, treatment with IVT directed by individuals with expertise in thrombolytic stroke care may be beneficial" | **minor — wording nuance** — AHA's Rec #3 explicitly says "4.5 to 24 hours," not "9 to 24 hours." Repo restricts Path C to 9-24h. This is *more conservative* than AHA (Paths B and C overlap 4.5-9h in AHA's framing). Repo treats 4.5-9h with mismatch as Path B (COR 2a) and 9-24h LVO no-EVT as Path C (COR 2b). The functional outcome is the same — patients in 4.5-9h with mismatch fall under the more-permissive Path B; only patients in 9-24h or without mismatch fall to Path C. Recommend documenting this design choice in a comment so future reviewers don't read it as a window-narrowing bug. |
| TIMELESS redirect when rapid EVT available | line 430; `EVT Preferred · Path B/C redirect` | EVT preferred; IVT not indicated when rapid EVT available | §4.6.3 Knowledge Gaps p.e44: "TIMELESS, tenecteplase did not improve odds of good functional outcomes in patients undergoing EVT in the 4.5- to 24-hour window with ischemic penumbra" — and Concomitant IVT §4.7.1 (Table p.e48): "IVT and EVT eligible → IVT is safe and recommended" (COR 1 LOE A) | **minor — context check needed** — TIMELESS specifically tested *extended-window* TNK in EVT-eligible patients. Repo's redirect to "EVT preferred, not extended IVT" is correct *for the late-window pathway scope*. But this pathway should clarify that **within the standard ≤4.5h window**, IVT + EVT is COR 1 (§4.7.1) — i.e., don't withhold standard-window IVT pre-EVT. Worth a one-line clarification in Path B/C result text. Not a clinical error today (repo only redirects in 4.5-9h+ Path B), but easy to misread. |
| Standard window IVT (≤4.5h) | line 1251 LearningPearl | "Tenecteplase 0.25 mg/kg (max 25 mg) is COR 1 per 2026 AHA/ASA for the standard window" | §4.6.2 Rec #1 (COR 1, LOE A): "TNK 0.25 mg/kg (max 25 mg) or alteplase 0.9 mg/kg, within 4.5h" | **none** |
| TNK dosing displayed | line 1218 | "0.25 mg/kg IV bolus" | §4.6.2 Rec #1 + Table 7 p.e43: TNK 0.25 mg/kg up to maximum 25 mg, push | **none** |
| Alteplase dosing displayed | line 1227 | "0.9 mg/kg IV infusion" | §4.6.2 Rec #1 + Table 7 p.e43: alteplase 0.9 mg/kg (max 90 mg), 10% bolus over 1 min, remainder over 60 min | **minor — missing max** — displayed dose `0.9 mg/kg IV infusion` omits max 90 mg cap and the 10%-bolus-then-infusion regimen. Consider adding "(max 90 mg, 10% bolus + 60-min infusion)" for completeness. |
| TNK 0.4 mg/kg | not mentioned in repo | n/a | §4.6.2 Rec #2 (COR 3 No Benefit, LOE A): "TNK at 0.4 mg/kg is not recommended" | **none — and repo correctly avoids surfacing 0.4 mg/kg.** |

**ExtendedIVTPathway summary:** clinically tight. Two minor improvements worth tracking: (a) clarify the 4.5-9h vs 9-24h Path B/C boundary in a code comment, (b) add alteplase max-dose + bolus regimen detail to the dose display card.

---

## ElanPathway.tsx (`/pathways/elan-pathway`) — governed by AHA 2026 §4.9

**File:** `src/pages/ElanPathway.tsx`
**Guideline anchor:** §4.9 "Anticoagulants" (Table p.e68).

| Claim | Where in pathway | Repo says | AHA 2026 says | Discrepancy? |
|---|---|---|---|---|
| Early oral anticoagulation post-stroke for AIS+AF, carefully selected | line 211 prose; line 374 badge; line 457 caveat | **COR 2a · LOE A** | §4.9 Rec #1 (COR 2a, LOE A): "In carefully selected (eg, milder severity) patients with AIS with atrial fibrillation, a strategy of early oral anticoagulation poststroke is low risk and is reasonable compared with a strategy of delayed anticoagulation, although the efficacy of early anticoagulation for prevention of early recurrent stroke is not established" | **none** |
| Day-by-day windows (TIA/minor: ≤48h vs day 3-4; moderate: ≤48h vs day 6-7; major: day 6-7 vs day 12-14) | lines 79-103 calculation | ELAN-based operational framework | AHA 2026 does **not** ratify specific day bins. The repo correctly says so at line 458: "exact day-by-day windows shown here are an ELAN-based operational framework rather than a single mandatory guideline timing table" | **none — well-disclosed** |
| Mechanical valve exclusion | line 250-251, line 56 | "Mechanical valves require warfarin rather than this DOAC timing pathway" | Not in §4.9 — but mechanical valves are a known DOAC contraindication established outside the AIS guideline (RE-ALIGN, ESC valve guidelines). | **none — clinically correct** |
| Symptomatic ICH or major hemorrhagic transformation exclusion | line 240, line 55 | exclude from DOAC timing pathway | Consistent with §4.9 Rec #4 (COR 2b, LOE C-LD): "patients with AIS who experience HT, initiation or continuation of anticoagulation may be considered depending on the specific clinical scenario and underlying indication" — repo is more conservative (always exclude) than the guideline (consider individually) | **minor — overly conservative** — AHA 2026 Rec #4 is *permissive but uncertain* for HT, not an absolute exclusion. Repo's choice to exclude symptomatic ICH / confluent PH is defensible (these are the severe end of HT), but excluding *all* HT including petechial would be too strict. Repo handles petechial as a "caution flag" (line 260) rather than exclusion ✓ — so the implementation actually matches the guideline. The exclusion text at line 240 could read "symptomatic ICH or **confluent parenchymal hematoma**" rather than "major hemorrhagic transformation" generically, but that's a copy-tightening, not a clinical bug. |
| Recent reperfusion therapy "caution flag" | line 270, line 63 | warns extra caution | §4.9 supportive text p.e69 + p.e71: explicitly notes "high-level evidence on concomitant full-dose anticoagulation (LMWH or DOACs) with IVT" is lacking, and "ideal strategy for initiating or resuming antithrombotics/anticoagulants concomitantly or postthrombolysis, including its timing and dose, is unknown" | **none — repo's caution stance matches the guideline's open question.** |
| ELAN / OPTIMAS / TIMING citations | line 443-445 | ELAN NEJM 2023, OPTIMAS 2024, TIMING 2024 | All three are cited in §4.9 supportive text p.e69 as the evidentiary basis for Rec #1 | **none** |

**ElanPathway summary:** clinically accurate. COR 2a · LOE A is verified against the table on p.e68. The page does an unusually good job of distinguishing what the guideline says (the broad "early DOAC is reasonable" statement) from what the ELAN trial protocol prescribes (the day-bin operational framework). One minor copy-tightening suggestion noted above.

---

## Out of AIS 2026 scope — flagged for separate audit

### StatusEpilepticusPathway.tsx (`/pathways/se-pathway`)

**Governing reference (not audited here):**
- Neurocritical Care Society *Guideline for the Evaluation and Management of Status Epilepticus* (Brophy et al., Neurocrit Care 2012; under revision)
- American Epilepsy Society *Treatment of Convulsive Status Epilepticus in Children and Adults* (Glauser et al., Epilepsy Curr 2016)

**AHA 2026 verification:** not applicable. AIS 2026 §6.5 covers post-stroke seizures only (acute symptomatic seizure after AIS) — it does not provide a treatment algorithm for status epilepticus generally. The repo's pathway is broader than that scope.

**Action:** create a follow-up audit task against AES 2016 + NCS framework. Until then, the clinical content here is unaudited under AHA 2026.

### MigrainePathway.tsx (`/pathways/migraine-pathway`)

**Governing references (not audited here):**
- American Headache Society *2021 Consensus Statement: Update on Integrating New Migraine Treatments into Clinical Practice*
- AAN/AHS *Acute Treatment of Migraine in Children and Adolescents* (Oskoui et al., Neurology 2019)
- AHS *2024 Position Statement on Integrating New Treatments for Migraine into Clinical Practice* (if/when finalized)

**AHA 2026 verification:** not applicable — migraine is not in AIS scope.

**Action:** follow-up audit task against AHS 2021/2024 + AAN/AHS 2019.

### GCAPathway.tsx (`/pathways/gca-pathway`)

**Governing references (not audited here):**
- ACR/Vasculitis Foundation *2021 Guideline for the Management of Giant Cell Arteritis* (Maz et al., Arthritis Rheumatol 2021)
- EULAR *2018 Recommendations for the Management of Large Vessel Vasculitis* (Hellmich et al., Ann Rheum Dis 2020)

**AHA 2026 verification:** not applicable — GCA is rheumatologic, not in AIS scope.

**Action:** follow-up audit task against ACR/VF 2021 + EULAR 2018.

---

## Stale or pre-2026 citation flags

A targeted scan for stale citations across all six files:

- **EvtPathway** references to DAWN/DEFUSE-3 (2018), SELECT2/ANGEL-ASPECT (2023), ESCAPE-MeVO/DISTAL (2025), ATTENTION/BAOCHE (2022) are all still the foundational evidence cited by AHA 2026 §4.7. Not stale.
- **ExtendedIVTPathway** TRIALS map (lines 50-58): WAKE-UP, THAWS, EXTEND, EPITHET, ECASS-4, TIMELESS, TRACE-III are all referenced in AHA 2026 §4.6.3. Not stale.
- **ElanPathway** ELAN (NEJM 2023), OPTIMAS, TIMING are cited in AHA 2026 §4.9 supportive text. Not stale.
- **StatusEpilepticusPathway / MigrainePathway / GCAPathway** — out of AIS 2026 scope; cannot verify staleness against AHA 2026. Separate audit needed.

**No pre-2026 AIS guideline references were found in the three in-scope pathways.** All "AHA/ASA" mentions in EVT/ExtendedIVT/ELAN point to the 2026 document either explicitly or by uncontested citation. Good citation hygiene.

---

## Summary recommendation

The three AIS-governed pathways (EVT, ExtendedIVT, ELAN) are in excellent clinical alignment with AHA 2026. No critical discrepancies, no stale guideline citations. Five small refinements identified:

1. **EvtPathway** — explicitly gate `age <80` on the late-window ASPECTS 3-5 branch and the early-window very-large-core (ASPECTS 0-2) branch, matching AHA Rec #3 and Rec #4 wording.
2. **ExtendedIVTPathway** — add a code comment documenting the deliberate 9-24h vs 4.5-24h scoping of Path C (repo is more restrictive than AHA's literal table wording, by design — Path B handles 4.5-9h).
3. **ExtendedIVTPathway** — clarify in Path B/C result text that standard-window (≤4.5h) IVT-then-EVT remains COR 1 per §4.7.1 — the redirect logic shouldn't be misread as "skip IVT" for early presenters.
4. **ExtendedIVTPathway** — enrich alteplase dose display (line 1227) with the 90 mg cap and 10%-bolus + 60-min-infusion regimen.
5. **ElanPathway** — tighten the HT-exclusion copy from "major hemorrhagic transformation" to "symptomatic ICH or confluent parenchymal hematoma" to align more precisely with §4.9 Rec #4's "consider individually" framing for non-confluent HT.

None of these are urgent. Each is a small Class C-clinical task once V triages.

For the three non-AIS pathways (SE, Migraine, GCA), separate audit tasks against their governing references (AES/NCS, AHS/AAN, ACR/VF/EULAR) are recommended. These should be parked, not actioned, until V decides the priority.
