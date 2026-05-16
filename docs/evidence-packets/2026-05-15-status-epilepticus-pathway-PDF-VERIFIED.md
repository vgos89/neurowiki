# Status Epilepticus Pathway — Evidence Verification Dossier

**Date:** 2026-05-15
**Auditor:** evidence-verifier
**Method:** Systematic 4-PDF extraction with latest-wins resolution
**Source code:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/StatusEpilepticusPathway.tsx`

---

## Section 0 — Publication-year ranking & authority weight

| Rank | Source | Year | Type | Authority | Latest-wins tier |
|---|---|---|---|---|---|
| 3 | **Vossler DG.** "First Seizures, Acute Repetitive Seizures, and Status Epilepticus." *Continuum* 2025;31(1):95–124. © 2025 AAN. | **2025** | Single-author review, AAN | Most recent | **TIER 1 — newest review** |
| 2 | **Rubinos C.** "Emergent Management of Status Epilepticus." *Continuum* 2024;30(3):682–720. © 2024 AAN. | **2024** | Single-author review, AAN | High | TIER 2 |
| 4 | **Mullhi R et al.** "Guidance for: Acute management of status epilepticus in adult patients." *J Intensive Care Soc* 2025;26(2):249–262. DOI 10.1177/17511437251321338. | **2025** | UK ICS multi-society consensus | Guideline-equivalent for UK adult ICU; adult-only, excludes obstetric | TIER 2 (recommendations, UK-focused) |
| 1 | **Glauser T et al.** "Evidence-Based Guideline: Treatment of Convulsive Status Epilepticus in Children and Adults." *Epilepsy Curr* 2016;16(1):48–61. DOI 10.5698/1535-7597-16.1.48. | **2016** | Formal evidence-graded guideline (Class I–III, Level A/B/C/U); AES + endorsed by Epilepsy Foundation, Child Neurology Society, ACEP, AACNN | **Highest authority guideline** for first-phase & second-phase pharmacotherapy | **TIER 0 — guideline (binds for stages 1–2)** |

**Latest-wins applied:** Glauser 2016 binds for Stages 1–2 pharmacotherapy. Vossler 2025 and Rubinos 2024 win for Stages 3/4 (refractory/super-refractory) — areas not addressed by Glauser. Mullhi 2025 wins for ICU bundling, ventilation, sedation choice, and SRSE adjuncts in adults.

---

## Section 1 — Canonical clinical-question framework

A — SE definition + staging · B — First-line (BZD) · C — Second-line (ESETT-era ASM) · D — Refractory (continuous infusions) · E — Super-refractory · F — Diagnostic workup · G — Adult vs pediatric · H — Disposition / monitoring · I — Special populations · J — Hard exclusions / harm warnings

---

## Section 2 — Cross-PDF extraction grid (consolidated)

### A. SE definition + staging
- **T1 (treat now):** Convulsive (generalized tonic-clonic) SE = **≥5 min continuous OR ≥2 seizures without full recovery between them.** Focal SE = ≥10 min. Absence SE = ≥10–15 min. Universal agreement across all 4 PDFs.
- **T2 (long-term consequences):** 30 min (convulsive), 60 min (focal). Source: ILAE 2015.
- **Stages (consolidated 4-stage model):**
  - Stage 1 = early/impending (5–10 min, BZD)
  - Stage 2 = established (after BZD failure, second-line ASM, 10–30 min)
  - Stage 3 = refractory (failure of BZD + 1 non-BZD ASM, ~30–60 min, anesthetic infusion)
  - Stage 4 = super-refractory (≥24 h on anesthetic, or recurrence on weaning)
- **Refractory definition:** persistent seizures after 1 adequately dosed BZD + 1 adequately dosed non-BZD ASM (in different drug classes).
- **Super-refractory:** SE persisting/recurring ≥24 h after initiation of IV anesthetic, including recurrence on weaning.

### B. First-line (benzodiazepine) stage
**Glauser 2016 Level A (binds):**

| Route | Agent | Adult dose | Pediatric dose | Repeat |
|---|---|---|---|---|
| **IV preferred** | **Lorazepam** | 0.1 mg/kg IV (max 4 mg) | 0.1 mg/kg (max 4 mg) | May repeat × 1 after 5 min |
| IV alternative | Diazepam | 0.15–0.2 mg/kg IV (max 10 mg) | 0.15–0.2 mg/kg (max 10 mg) | May repeat × 1 |
| **IM (no IV)** | **Midazolam** | **10 mg IM fixed** (RAMPART Class I) | 10 mg if >40 kg; **5 mg if 13–40 kg** | Single dose only |
| Buccal/IN alternative | Midazolam | 10 mg buccal/IN | 5–10 mg | May repeat × 1 (UK practice) |
| Rectal alternative | Diazepam | 0.2–0.5 mg/kg PR (max 20 mg) | 0.2–0.5 mg/kg | May repeat × 1 |

**CRITICAL:** Full weight-based dose. Underdosing = #1 cause of treatment failure (PHTSE Class I; >75% of patients underdosed in ESETT).

### C. Second-line (established SE) — ESETT-era equivalence

Per ESETT 2019 (Kapur, NEJM, Class I): **levetiracetam, fosphenytoin, valproate are EQUIVALENT.** Pick by comorbidity:

| Agent | Loading dose | Max | Rate | Avoid in |
|---|---|---|---|---|
| Levetiracetam | 60 mg/kg IV | 4500 mg | over 15 min (UK: 10 min) | Severe psych history (relative) |
| Fosphenytoin | 20 mg PE/kg IV | 1500 mg PE | ≤150 mg PE/min | 2°/3° AV block, sinus bradycardia |
| Phenytoin (if fos unavailable) | 20 mg/kg IV | 2000 mg | ≤50 mg/min (≤25 mg/min if elderly/cardiac) | Same as fos; risk of purple glove syndrome |
| Valproate | 40 mg/kg IV | 3000 mg | over 10 min | Pregnancy, hepatic failure, pancreatitis, mitochondrial disease, carbapenem co-admin |
| Phenobarbital (if above 3 unavailable) | 15 mg/kg IV (Vossler 2025) | — | ≤60 mg/min | Hypotension, severe respiratory depression |

**Lacosamide is NOT a Glauser-recommended second-line agent.** It is acceptable as Stage 3 add-on per AES 2020 refractory review.

### D. Refractory SE (Stage 3) — continuous IV anesthetic infusions

| Agent | Load | Maintenance | Cautions |
|---|---|---|---|
| Midazolam | 0.2 mg/kg (range 0.2–0.5) | 0.05–2 mg/kg/h titrated | Tachyphylaxis after 24–48 h |
| Propofol | 1–2 mg/kg (cumulative max 10 mg/kg) | 1–15 mg/kg/h initial then ≤5 mg/kg/h sustained (UK: ≤4 mg/kg/h) | PRIS — monitor CK/lactate/TG/ECG; avoid prolonged use in children |
| Ketamine | **1–2.5 mg/kg** (Vossler 2025) | 1–10 mg/kg/h | Hemodynamically stable; combine with BZD; avoid neonates and 3rd-trim pregnancy |
| Pentobarbital / thiopental (UK) | 5–15 mg/kg at ≤50 mg/min | 0.5–5 mg/kg/h | Hypotension; immunosuppression; ileus — last-line |

EEG: cEEG-guided. Target seizure suppression minimum; burst suppression (5–15 sec interburst) if not seizure-free. Hold anesthetic ≥24 h after EEG seizure cessation, then taper.

### E. Super-refractory SE (Stage 4, ≥24 h on anesthetic)

- Re-image brain (MRI with contrast)
- Repeat LP / autoimmune encephalitis panel
- Empiric immunotherapy if NORSE/FIRES: methylprednisolone 1 g/day × 3–5 → IVIG 0.4 g/kg/day × 5 OR plasma exchange
- Ketogenic diet (within 7 days for cryptogenic)
- Adjuncts: magnesium (target 1.0–1.5 mmol/L), pyridoxine 100 mg q5min × 5
- Alternative anesthetic (ketamine, thiopental, inhalational isoflurane)
- Rituximab if antibody identified; anakinra/tocilizumab for cytokine storm; cyclophosphamide for severe autoimmune
- VNS, focal resection for surgical lesions

### F-J: workup, pediatric, disposition, special populations, harm warnings

(Captured in full in original extraction; key points)
- **Initial labs:** glucose POC first → CBC, CMP, Mg/Phos/Ca, LFT, coags, ABG+lactate, CK, βhCG, urine tox, ASM levels, blood cx if febrile
- **Imaging:** NCCT once seizures controlled if etiology unclear; MRI for higher yield
- **LP:** if any CNS infection suspicion, NORSE, or unexplained SE
- **EEG:** cEEG mandatory in refractory/super-refractory; continue ≥24 h after seizure cessation while sedated
- **Algorithm unified** for children >40 kg and adults; weight-based for <40 kg (IM midazolam 5 mg if 13–40 kg)
- **Pediatric second-line:** lev 60 mg/kg / fos 20 mg PE/kg / VPA 40 mg/kg per AES; ConSEPT/EcLiPSE used lev 40 mg/kg with equivalent efficacy
- **ICU triggers:** refractory SE; intubation; respiratory depression; significant derangement; cEEG need
- **Eclampsia:** magnesium 4 g IV load → 1 g/h (NOT benzo escalation)
- **NCSE in coma** = treat as aggressively as CSE; NCSE without coma = active but ICU not mandatory
- **NORSE/FIRES:** consider in any new RSE without obvious cause; immunotherapy within 72 h; ketogenic within 7 days for cryptogenic
- **Harm warnings:** Phenytoin contraindicated in 2°/3° AV block; valproate avoid in pregnancy + hepatic + pancreatitis + mito + carbapenem co-admin; lacosamide AV block risk (ECG before load); propofol PRIS >4 mg/kg/h for >48 h

---

## Section 4 — Codebase audit grid (35 rows; key items)

### HIGH severity
1. **`getRecommendedAgent` ordering misrepresents ESETT equivalence** (L97–118). Pathway ranks lev > fos > VPA > lacosamide > phenobarbital as if hierarchical. ESETT proved equivalence; pick by comorbidity. Lacosamide does NOT belong in Stage 2 dropdown.
2. **"Non-Convulsive SE" toggle leads users into convulsive-SE algorithm** (L235). NCSE management differs (NCSE-without-coma ≠ ICU mandatory; benzo trial as diagnostic). Remove toggle or redirect to NCSE-specific guidance.

### MEDIUM severity
3. IM midazolam scheme diverges from RAMPART (L24). RAMPART used fixed 10 mg / 5 mg by weight; pathway uses 0.2 mg/kg.
4. Lacosamide loading dose 8 mg/kg risks AV block (L29). Cap at 400 mg per FDA + Vossler 2025 range 5–10 mg/kg.
5. Ketamine load 1.5–4.5 mg/kg exceeds Vossler 2025's 1–2.5 mg/kg (L33).
6. Cardiac comorbidity flag too coarse — phenytoin should be "avoid" not "caution" in 2°/3° AV block (L101, L107).
7. Stage 1 time label "0–5 min" conflates stabilization with benzo phase (L273).
8. **No Stage 4 (super-refractory) branch** — highest-mortality stage missing entirely.
9. "Standard first-line (ESETT)" tag on levetiracetam misleading (L111).
10. Lacosamide cardiac monitoring warning missing.
11. No NORSE/FIRES branch.
12. No eclampsia/magnesium branch.

### LOW severity
13. Diazepam 0.15 mg/kg at low end (0.15–0.2 range).
14. Phenobarbital 20 mg/kg vs Vossler 2025's 15 mg/kg.
15. Stage 2/3 time labels slightly off.
16. Missing thiamine/pyridoxine/magnesium in stabilization.
17. IM midazolam repeat-dose not RAMPART-validated.
18. Propofol PRIS warning present but not actionable.
19. References missing Vossler 2025, Rubinos 2024, Mullhi 2025.

---

## Section 6 — Trial verification

| Trial | Citation | DOI | PMID | Cited in pathway? |
|---|---|---|---|---|
| **ESETT** (Kapur 2019) | NEJM 2019;381(22):2103–2113 | 10.1056/NEJMoa1905795 | 31774955 | ✅ Yes (L448) |
| **RAMPART** (Silbergleit 2012) | NEJM 2012;366(7):591–600 | 10.1056/NEJMoa1107494 | 22335736 | ❌ Add |
| **VA Cooperative SE** (Treiman 1998) | NEJM 1998;339(12):792–798 | 10.1056/NEJM199809173391202 | 9738086 | ❌ Add |
| **EcLiPSE** (Lyttle 2019) | Lancet 2019;393(10186):2125–2134 | 10.1016/S0140-6736(19)30724-X | 31005386 | ❌ Add (pediatric) |
| **ConSEPT** (Dalziel 2019) | Lancet 2019;393(10186):2135–2145 | 10.1016/S0140-6736(19)30722-6 | 31005385 | ❌ Add (pediatric) |
| **PHTSE** (Alldredge 2001) | NEJM 2001;345(9):631–637 | 10.1056/NEJMoa002141 | 11547716 | ❌ Add (foundational) |

---

## Section 7 — Confidence statement

**Verification confidence:** HIGH for stages 1, 2, 3 pharmacotherapy (Glauser 2016 binds; ESETT equivalence Class I; Vossler 2025 + Rubinos 2024 + Mullhi 2025 align). MEDIUM for Stage 4 (super-refractory) — expert consensus only, AES 2020 review concluded "insufficient evidence" for most refractory SE agents. HIGH for pediatric ESETT-equivalence per Vossler 2025 + EcLiPSE + ConSEPT.

**Class E task warranted** because (a) Finding #1 changes algorithm agent ordering (clinical logic), (b) Finding #2 affects pathway scope (NCSE branch), (c) Finding #6 changes a contraindication classification. Class C-clinical insufficient. Open via `medical-scientist` → `clinical-reviewer`, with `calculator-engineer` for dose calculation deltas. Architect review required for `getRecommendedAgent` shape change.

---

## 7-line summary

(a) **Year ranking:** Vossler 2025 > Mullhi 2025 (UK ICU) > Rubinos 2024 > Glauser 2016 (foundational AES guideline — still binds Stages 1–2).
(b) **Canonical questions covered:** All 10 (A–J).
(c) **Conflicts resolved via latest-wins:** 7 (staging, BZD-dose ceiling, fos infusion rate, lacosamide loading, ketamine load 1–2.5 mg/kg, phenobarb 15 vs 20 mg/kg, ESETT equivalence supersedes Glauser's "no clear evidence").
(d) **Codebase findings:** 35 audit rows, 21 with non-CORRECT verdicts. **2 HIGH** (ESETT ordering, NCSE toggle), **11 MEDIUM**, **8 LOW**.
(e) **Top 3 corrections:** (1) Remove agent hierarchy from `getRecommendedAgent`; ESETT-equivalent tier of lev/fos/VPA selected by comorbidity; move lacosamide to Stage 3. (2) Remove or redirect NCSE toggle. (3) Split cardiac comorbidity flag to distinguish AV block from "elderly without conduction disease."
(f) **NOT-COVERED:** Stage 4/super-refractory branch; NORSE/FIRES; eclampsia/magnesium; empiric thiamine/pyridoxine.
(g) **Trial citations:** ESETT (PMID 31774955) ✓ cited; RAMPART (PMID 22335736), VA Cooperative (PMID 9738086), PHTSE (PMID 11547716), EcLiPSE (PMID 31005386), ConSEPT (PMID 31005385) — all verified DOI/PMID, recommend adding to pathway.
