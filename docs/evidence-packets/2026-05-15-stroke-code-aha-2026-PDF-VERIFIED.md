# AHA/ASA 2026 Stroke Code Article — PDF Verification Dossier

**Source:** Prabhakaran S, Gonzalez NR, Zachrison KS, et al. *2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke: A Guideline From the American Heart Association/American Stroke Association.* Stroke. 2026;57:e00–e00. DOI: 10.1161/STR.0000000000000513. (First Proof Only; PDF dated March 17, 2026.)

**Audit target:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/guide/StrokeBasics.tsx` → renders `StrokeBasicsWorkflowV2.tsx` (interactive 3-tab workflow) and its child components (`CodeModeStep1`, `CodeModeStep2`, `CodeModeStep4`, `QuickReferenceCard`). **Important framing correction:** this is NOT an educational prose article — it is an interactive Code/Study toggle workflow. Most clinical claims live in child step components and in `QuickReferenceCard.tsx`, not in prose.

**Confidence:** **HIGH** for all claims drawn from sections 2.x, 3.x, 4.1–4.5, 4.6.1–4.6.3, 4.7, 4.8, 4.9, 5.1, 5.2, 5.4. The PDF is the verbatim authoritative source.

---

## Sections covered in this audit

- **Top Take-Home Messages 1–10** (page e3)
- **§2.1–2.10** Stroke Systems of Care and Prehospital Management (pages e10–e25)
- **§3.1 Stroke Scales · §3.2 Initial, Vascular, and Multimodal Imaging · §3.3 Other Diagnostic Tests** (pages e26–e31)
- **§4.1 Airway, Breathing, Oxygenation · §4.2 Head Positioning · §4.3 Blood Pressure · §4.4 Temperature · §4.5 Blood Glucose** (pages e31–e37)
- **§4.6.1 Thrombolysis Decision-Making · §4.6.2 Choice of Thrombolytic Agent · §4.6.3 Extended Time Windows · §4.6.4 Other Fibrinolytics · §4.7 Endovascular Thrombectomy · §4.8 Antiplatelet Treatment · §4.9 Anticoagulants** (pages e38–e70)
- **§5.1 Stroke Units · §5.2 Dysphagia · §5.3 Nutrition · §5.4 DVT Prophylaxis** (pages e72–e77)
- **Table 7: Treatment of AIS in Adults — IVT** (page e43) — verbatim dosing table

---

## §4.3 Blood Pressure Management (CRITICAL — verbatim)

| # | COR | LOE | Verbatim recommendation |
|---|---|---|---|
| 1 | 1 | C-LD | "In patients with AIS, hypotension and hypovolemia should be corrected to maintain systemic perfusion levels necessary to support organ function." |
| 2 | 1 | C-EO | "In patients with AIS, early treatment of hypertension is indicated when required by comorbid conditions..." |
| 3 | 2b | C-EO | "In patients with BP ≥220/120 mm Hg who did not receive IVT or EVT... the benefit of initiating or reinitiating treatment of hypertension within the first 48 to 72 hours is uncertain." |
| 4 | 3: No Benefit | A | "In patients with BP <220/120 mm Hg who did not receive IVT or EVT... initiating or reinitiating treatment of hypertension within the first 48 or 72 hours after an AIS is not effective to prevent death or dependency." |
| 5 | 1 | B-NR | **"Patients with AIS who have elevated BP and are otherwise eligible for treatment with IVT should have their SBP lowered to <185 mm Hg and DBP <110 mm Hg before IVT therapy is initiated to reduce hemorrhagic complications."** |
| 6 | 2a | B-NR | **"In patients for whom EVT is planned and who have not received IVT, it is reasonable to maintain BP ≤185/110 mm Hg before the procedure..."** |
| 7 | 1 | B-R | **"BP should be maintained at <180/105 mm Hg for at least the first 24 hours after IVT treatment."** |
| 8 | 3: No Benefit | B-R | "In patients with mild to moderate severity AIS who have been treated with IVT, intensive SBP reduction (target of <140 mm Hg compared with <180 mm Hg) is not recommended because it is not associated with an improvement in functional outcome." |
| 9 | 2a | B-NR | **"In patients who undergo EVT, it is reasonable to maintain BP at or below ≤180/105 mm Hg during and for 24 hours after the procedure."** |
| 10 | **3: Harm** | A | **"In patients with AIS with LVO of the anterior circulation who have been successfully recanalized by endovascular therapy (mTICI 2b, 2c, or 3) and without other indication for blood pressure management target, intensive SBP reduction target of <140 mm Hg for the first 72 hours is harmful and not recommended."** |

---

## §4.5 Blood Glucose Management (CRITICAL — 2026 update)

| # | COR | LOE | Verbatim recommendation |
|---|---|---|---|
| 1 | 1 | C-LD | **"In patients with AIS, hypoglycemia (blood glucose <60 mg/dL) should be treated to avoid complications."** |
| 2 | 2a | C-LD | **"In patients with AIS, it is reasonable to treat persistent hyperglycemia by maintaining blood glucose levels in a range of 140 to 180 mg/dL with close monitoring to prevent worsening functional outcomes."** |
| 3 | **3: No Benefit** | A | **"In hospitalized patients with AIS with hyperglycemia, treatment with IV insulin to achieve blood glucose levels in the range of 80 to 130 mg/dL is not recommended to improve 3-month functional outcomes."** |

- **Top Take-Home Message #9 (page e3):** *"Glycemic management in patients with AIS has been updated such that intensive glucose control to the range of 80 to 130 mg/dL is not recommended to improve clinical outcome and increases the risk of severe hypoglycemia."*
- **Supportive text:** Hypoglycemia <60 mg/dL should be corrected. The SHINE trial (n=1151) ended early for futility — no benefit of intensive (80–130 mg/dL) control; severe hypoglycemia (<40 mg/dL) occurred only in the intensive group.

---

## §4.6.2 Choice of Thrombolytic Agent

- **COR 1, LOE A (#1):** "In adult patients with AIS presenting within 4.5 hours of symptom onset or last known well and eligible for IVT, **tenecteplase at a dose of 0.25 mg/kg body weight (max 25 mg) or alteplase at a dose of 0.9 mg/kg body weight is recommended** to improve functional outcomes."
- **COR 3: No Benefit, A (#2):** Tenecteplase 0.4 mg/kg NOT recommended.

**Table 7 — IVT Treatment of AIS in Adults (verbatim):**
- **Alteplase:** 0.9 mg/kg (max 90 mg) over 60 min, with 10% as bolus over 1 min.
- **Tenecteplase:** 0.25 mg/kg (max 25 mg) as a single bolus over 5–10 seconds. Weight bands: <60 kg = 15 mg; 60 to <70 = 17.5 mg; 70 to <80 = 20 mg; 80 to <90 = 22.5 mg; ≥90 = 25 mg.
- "BP and neurological assessments **every 15 min during and after IVT for 2 h, then every 30 min for 6 h, then hourly until 24 h after IVT alteplase treatment**."
- "Delay placement of nasogastric tubes, indwelling bladder catheters, or intraarterial pressure catheters if the patient can be safely managed without them."
- "Obtain a follow-up CT or MRI scan at 24 h after IVT before starting anticoagulants or antiplatelet agents."

---

## §4.6.1 Table 5 — Post-IVT sICH Management (verbatim, page e40)

- Cryoprecipitate 10 U IV over 10–30 min (target fibrinogen ≥150 mg/dL)
- **Tranexamic acid 1000 mg IV infused over 10 min OR ε-aminocaproic acid 4–5 g over 1 h** as alternative

**This contradicts the StrokeBasics code claim "TXA not routinely recommended per 2022 guidelines."** TXA IS recommended in 2026 Table 5.

---

## §4.8 Antiplatelet Treatment (key items)

- **Supportive text #17:** "Early administration of IV aspirin during thrombolysis has not improved stroke outcomes and can increase the risk of bleeding. In the ARTIS trial, 300 mg of IV aspirin given within 90 minutes of alteplase was stopped early after enrolling 642 of the planned 800 patients because sICH was higher in the aspirin arm (4.3% versus 1.6%; risk ratio, 2.78 [95% CI, 1.01–7.63]; P=0.04)… many clinicians postpone aspirin administration until 24 hours after fibrinolysis."

## §5.4 DVT Prophylaxis

- **COR 1, B-R (#1):** "In patients with AIS who have impaired mobility and do not have contraindications to intermittent pneumatic compression (IPC), IPC in addition to routine care is recommended over routine care alone to reduce the risk of DVT." (Based on CLOTS-3: **8.5% IPC vs 12.1% no IPC; ARR 3.6 percentage points; ~30% relative reduction**, NOT 50%.)
- **COR 2a, B-R (#2):** Prophylactic-dose subcutaneous heparin (UFH or LMWH) is reasonable.
- **COR 3: Harm, B-R (#5):** "Elastic compression stockings cause harm, including skin breakdown, ulceration, and tissue necrosis, compared with usual care."

---

## Claims-vs-PDF audit grid

### A. `QuickReferenceCard.tsx`

| # | Line | Claim verbatim | Verdict | Fix |
|---|---|---|---|---|
| QR-1 | 52 | "Alteplase: 0.9 mg/kg — max 90 mg" | ✅ CORRECT | — |
| QR-2 | 55 | "10% bolus / 90% infusion over 60 min" | ✅ CORRECT | — |
| QR-3 | 57 | "Window: 0–4.5 h (extended 4.5–9 h)" | ✅ CORRECT | — |
| QR-4 | 64 | "TNK — COR 1 equal to tPA" | ✅ CORRECT | — |
| QR-5 | 67–73 | TNK weight bands | ✅ CORRECT | — |
| QR-6 | 80 | "IV bolus over 5–10 seconds" | ✅ CORRECT | — |
| QR-7 | 94 | "Pre-tPA: <185/110 mmHg" | ✅ CORRECT | — |
| QR-8 | 98 | "Post-tPA: <180/105 mmHg" | ✅ CORRECT | — |
| QR-9 | 102 | "No tPA/EVT: <220/120 mmHg" | ⚠️ FRAMING INVERTED | Reword: "No IVT/EVT: do not treat below 220/120 unless comorbid indication (§4.3 #4 COR 3 No Benefit)" |
| QR-10 | 106 | "Post-EVT: <180/105 mmHg" | ✅ CORRECT | — |
| QR-11 | 107 | "(intensive BP harmful)" | ⚠️ UNDER-SPECIFIED | Expand: "Intensive SBP <140 harmful in successfully recanalized anterior LVO (mTICI 2b–3) per §4.3 #10" |
| QR-16 | 150 | Glucose "<50 or >400" listed as ABSOLUTE contraindication | ⚠️ FRAMING | 2026 §4.6.1 supportive #5: correct first, then reassess. Move to "Correct first, then reassess" tier. |
| QR-17 | 152 | "Platelet count <100,000/mm³" | ✅ legacy criterion (carried forward) | Add "AHA 2019" attribution note |

### B. `CodeModeStep1.tsx`

| # | Line | Claim | Verdict | Fix |
|---|---|---|---|---|
| S1-1 | 84 | Pre-IVT BP threshold | ✅ CORRECT | — |
| S1-2 | 85 | No-IVT BP threshold 220/120 | ✅ CORRECT | — |
| S1-3 | 86 | `glucose < 50` severe hypo | ✅ CORRECT for IVT context (§4.6.1 supportive #5) | — |
| S1-4 | 87 | `glucose > 400` severe hyper | ✅ CORRECT | — |
| S1-7 | 246–248 | Labetalol/nicardipine dosing labeled "AHA/ASA 2026" | ❌ MISSING-FROM-PDF | Re-tag as "AHA 2019 (carried forward, unchanged in 2026)" |
| S1-8 | 274 | D50 50 mL for hypoglycemia | ✅ standard ED dosing | Cite §4.6.1 supportive + clinical standard |
| S1-10 | 296 | NIHSS-LVO probability "≥10 = ≥50%; ≥6 = ~35%" | ⚠️ MISSING-FROM-PDF | Add Heldner et al. Stroke 2013 citation |
| S1-11 | 372 | Disabling deficits checklist | ⚠️ PARTIAL MISMATCH | Align to Table 4 verbatim |

### C. `CodeModeStep4.tsx`

| # | Line | Claim | Verdict | Fix |
|---|---|---|---|---|
| S4-3 | 100 | "Stroke units reduce mortality by 18%" | ⚠️ MISSING-FROM-PDF (specific number) | Cite Stroke Unit Trialists' Cochrane reviews |
| S4-5 | 120 | "ENCHANTED showed aggressive BP <140 was safe" | ❌ CONTRADICTS 2026 conclusion (COR 3: No Benefit) | Reword: "Intensive SBP <140 not recommended post-IVT (§4.3 #8). Target <180/105." |
| S4-8 | 150 | ARTIS aspirin sICH 4.3% vs 1.6% | ✅ CORRECT (verbatim match) | — |
| S4-9 | 180 | "TXA not routinely recommended per 2022 guidelines" | ❌ **CONTRADICTS 2026 Table 5** (TXA 1000 mg IV is listed) | **Remove "TXA not routinely recommended."** Replace with "Cryoprecipitate ≥10 U IV (target fibrinogen ≥150); TXA 1000 mg IV over 10 min or aminocaproic acid 4–5 g over 1 h (AHA 2026 Table 5)." |
| S4-14 | 255 | "CLOTS-3: SCDs reduce DVT by 50%" | ❌ THRESHOLD-OFF (actual: ~30% relative; 3.6 pp absolute) | "CLOTS-3: IPC reduced DVT from 12.1% to 8.5% (ARR 3.6 pp, ~30% relative)" |
| S4-16 | 292 | Glucose 140–180 labeled "Class I, Level C" | ❌ **COR LABEL WRONG** (should be COR 2a, LOE C-LD) | Update to Class IIa, Level C-LD |
| S4-18 | 295 | "Avoid hypoglycemia (<80 mg/dL)" | ❌ **THRESHOLD-OFF** (2026 §4.5 #1 uses **<60 mg/dL**) | Update threshold to <60 |
| S4-19 | 295 | "Use insulin drip for persistent hyperglycemia" | ❌ UNDER-QUALIFIED (must reject 80–130 target per COR 3: No Benefit, A) | "Treat persistent hyperglycemia (>180 mg/dL) with target 140–180. Do NOT target 80–130 (COR 3: No Benefit, A; SHINE trial)." |

### D. Embedded prose (`StrokeBasicsWorkflowV2.tsx`)

| # | Line | Claim | Verdict | Fix |
|---|---|---|---|---|
| WF-4 | 420 | "WAKE-UP: 53.3% vs 41.8%" | ✅ VERBATIM MATCH (§4.6.3 supportive #1) | — |
| WF-5 | 478 | "HERMES NNT = 2.6" | ✅ Historical match; AHA 2026 §2.10 cites "NNT as low as 3" — both valid | Optional: add 2026 attribution |
| WF-7 | 576 | "POC glucose is the ONLY mandatory lab before tPA" | ✅ STRONGEST CLAIM BLOCK (maps to §4.6.1 #5, #10, §4.3 #7, §5.2 #1) | — |

---

## Findings — most consequential corrections (severity-ordered)

### 1. **CRITICAL: Hypoglycemia threshold inconsistency** (`CodeModeStep4.tsx:295`)
"Avoid hypoglycemia (<80 mg/dL)" contradicts §4.5 #1 which uses **<60 mg/dL**. Three different thresholds in same workflow (<50, <60 missing, <80). Fix: unify to <60 mg/dL (general) and <50 mg/dL (severe pre-IVT framing).

### 2. **CRITICAL: Glucose target COR/LOE label wrong** (`CodeModeStep4.tsx:292`)
"Class I, Level C" on 140–180 mg/dL target — AHA 2026 §4.5 #2 is **COR 2a, LOE C-LD**.

### 3. **CRITICAL: Insulin drip recommendation under-qualified** (`CodeModeStep4.tsx:295`)
Must explicitly cite §4.5 #3 (COR 3: No Benefit, A) and reject the 80–130 mg/dL target (SHINE).

### 4. **CRITICAL: TXA reversal claim contradicts 2026 Table 5** (`CodeModeStep4.tsx:180`)
Code says "TXA not routinely recommended per 2022 guidelines." AHA 2026 Table 5 explicitly lists TXA 1000 mg IV.

### 5. **HIGH: ENCHANTED narrative now contradicts 2026 conclusion** (`CodeModeStep4.tsx:120`)
"Aggressive BP lowering <140 was safe" — §4.3 #8 explicitly says intensive SBP <140 NOT recommended (COR 3: No Benefit).

### 6. **HIGH: CLOTS-3 magnitude overstated** (`CodeModeStep4.tsx:255`)
"SCDs reduce DVT by 50%" — actual was 8.5% vs 12.1%, ~30% relative reduction.

### 7. **HIGH: Labetalol/nicardipine dosing falsely attributed to AHA/ASA 2026**
The 2026 PDF Table 7 lists tPA/TNK only. Fix attribution to "AHA 2019 (carried forward)."

### 8. **MEDIUM: Glucose contraindication framed as absolute when 2026 is "correct first, reassess"** (QR-16)
Move to "Correct first, then reassess" tier per §4.6.1 supportive #5.

### 9. **MEDIUM: BP "No tPA/EVT: <220/120" framing inverted** (QR-9)
PDF says "do not treat below 220/120 if no comorbid indication" — code reads as a target.

### 10. **MEDIUM: Post-EVT intensive-BP harm caveat under-specified** (QR-11)
Harm specific to successfully recanalized anterior LVO (mTICI 2b–3) for 72h per §4.3 #10.

---

## Confidence statement

**Verification confidence: HIGH** for all claims drawn directly from the 2026 PDF (BP, glucose, IVT dosing, EVT criteria, dysphagia, DVT prophylaxis, antiplatelets, anticoagulants).

The StrokeBasics interactive workflow is **broadly accurate but contains 10 specific drift items**, most consequentially around the **2026 glucose update** (target 140–180, COR 2a/C-LD; not 80–130; not COR I/Level C), the **TXA reversal item** (contradicts 2026 Table 5), and **dosing attribution to 2026 for items not actually in the 2026 PDF** (labetalol/nicardipine). The article does **not need a full rewrite** — it needs **a Class C-clinical correction pass** focused on the 10 audit-grid items above. No Class E threshold reset required.

---

## 6-line summary

1. **Sections captured:** AHA 2026 §2.1–2.10, §3.1–3.3, §4.1–4.6, §4.7–4.9, §5.1–5.4, Top Take-Home Messages, Table 7, Table 5.
2. **Claims audited:** ~40 individual claims across `QuickReferenceCard.tsx`, `CodeModeStep1.tsx`, `CodeModeStep2.tsx`, `CodeModeStep4.tsx`, and `StrokeBasicsWorkflowV2.tsx`.
3. **Findings:** 10 consequential corrections (4 CRITICAL, 3 HIGH, 3 MEDIUM); no LOW-severity issues escalated.
4. **Top correction #1 (glucose target labeling):** "Class I, Level C" must become **COR 2a, LOE C-LD** per §4.5 #2; insulin drip needs explicit §4.5 #3 counter-recommendation against 80–130 mg/dL target (SHINE).
5. **Top correction #2 (TXA in tPA reversal):** Code says "TXA not routinely recommended per 2022 guidelines" but **AHA 2026 Table 5 explicitly lists TXA 1000 mg IV** — direct contradiction.
6. **Top correction #3 (hypoglycemia threshold):** "<80 mg/dL" should be **<60 mg/dL** per §4.5 #1. Three different thresholds across the workflow need unification.

The article is **broadly accurate** and clinically usable — but needs a targeted Class C-clinical correction pass before its `last_reviewed` can be refreshed to the 2026 guideline.
