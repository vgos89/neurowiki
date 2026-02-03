# ICH / Hemorrhage Content Audit vs 2022 AHA/ASA ICH Guidelines

**Scope:** All hemorrhage-related clinical content in the app.  
**Reference:** 2022 AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage.  
**URL:** https://www.ahajournals.org/doi/10.1161/STR.0000000000000407  
**Task:** Review and recommendation only — no code changes in this phase.

---

## PHASE 1: DISCOVERY — HEMORRHAGE CONTENT INVENTORY

### Files containing hemorrhage-related clinical content

| File | Description | Current citations |
|------|-------------|--------------------|
| **src/components/article/stroke/HemorrhageProtocol.tsx** | UI: tPA/TNK hemorrhage management (cryoprecipitate, fibrinogen, CT, BP, platelets, PCC). Shown as emergency protocol for bleeding complications. | None (no guideline year or URL) |
| **src/components/article/stroke/StrokeIchProtocolStep.tsx** | UI: Acute ICH protocol when CT shows ICH. Items: assessment, imaging, anticoagulation reversal, BP, ICP, ICU. References line: "AHA/ASA Guidelines for Management of Spontaneous ICH; INTERACT2; ATACH-2." | AHA/ASA ICH guidelines (no year); INTERACT2; ATACH-2 |
| **src/pages/guide/IchManagement.tsx** | Guide page: ICH management — assessment, imaging, reversal, BP, ICP, surgery, ICU. Sections 1–6 with BP &lt;140, PCC, cerebellar &gt;3 cm. | No explicit guideline year or URL |
| **src/data/strokeClinicalPearls.ts** | Clinical pearls for stroke workflow. Contains: Hemorrhage Protocol (quick), sICH definition, Coagulopathy Reversal Protocol (deep), TICH-2, BP in ICH, ATACH-2, Surgical Intervention for ICH, STICH. | ATACH-2, TICH-2 2018, STICH, ECASS-3, NINDS; no AHA/ASA 2022 |
| **src/components/article/stroke/CodeModeStep4.tsx** | Rationale text for post-tPA orders. One rationale: "reversal (cryoprecipitate, TXA, platelets)" for sICH. | None |
| **src/components/article/stroke/CodeModeStep2.tsx** | When ICH selected: "Proceed to hemorrhage protocol. Consider EVT pathway…" | None |
| **src/data/ichScoreData.ts** | ICH Score definition and mortality table (Hemphill et al. Stroke 2001). No management recommendations. | Hemphill 2001 |
| **src/pages/IchScoreCalculator.tsx** | ICH Score calculator UI. Uses ichScoreData only; no management content. | Hemphill 2001 (from data) |
| **src/seo/routeMeta.ts** | SEO for `/calculators/ich-score`: description mentions "intracerebral hemorrhage" and "Hemphill et al. Stroke 2001." | Hemphill 2001 |
| **src/data/guideContent.ts** | Entries `hemorrhagic-stroke` and `anticoagulation-reversal` have `content: ''`. No clinical text. | N/A |
| **src/components/article/stroke/ThrombolysisEligibilityModal.tsx** | Contraindications: "Intracranial hemorrhage on CT," "History of intracranial hemorrhage," "Symptoms suggest subarachnoid hemorrhage," warfarin/INR, "Recent GI or GU hemorrhage." No management. | N/A (contraindication list only) |

### Files with incidental mentions (no protocol changes needed)

- **src/pages/EvtPathway.tsx** — ICH/sICH in EVT context (risk, exclusion); not ICH management protocol.
- **src/pages/guide/StrokeBasicsWorkflowV2.tsx** — Uses StrokeIchProtocolStep; step title "ICH Protocol"; no standalone ICH text.
- **src/pages/guide/StrokeBasicsWorkflowV2.tsx** (step 4) — Subtitle "GWTG note & hemorrhage protocol"; no clinical detail.

**Inventory summary:** 8 files contain updatable hemorrhage/ICH clinical content; 2 are ICH Score only (Hemphill 2001); 2 are empty/contraindication-only.

---

## PHASE 2: MEDICAL AUDIT — REVIEW AGAINST 2022 GUIDELINES

**2022 standard quick reference:**

- **BP:** SBP &lt;140 mmHg within 1 hour when feasible (Class I, Level A). Avoid SBP &lt;110 mmHg (ATACH-2: no benefit, possible harm with intensive target).
- **Warfarin reversal:** 4-factor PCC 25–50 units/kg IV + Vitamin K 10 mg IV (Class I, Level B). FFP if PCC unavailable.
- **Dabigatran:** Idarucizumab 5 g IV (Class I). **Xa inhibitors:** Andexanet alfa or 4-factor PCC.
- **Cerebellar surgery:** &gt;3 cm with neurological decline or brainstem compression/hydrocephalus (Class I, Level B); EVD for hydrocephalus.
- **Platelet transfusion:** NOT routinely recommended; may worsen outcomes (2022).
- **TXA:** NOT recommended for routine use in ICH (Class III, Level A); TICH-2 no benefit, possible thromboembolic harm.

---

### File: src/components/article/stroke/HemorrhageProtocol.tsx

**Context:** tPA/TNK hemorrhage management (post-thrombolysis bleeding), not spontaneous ICH.

| Checklist | Finding | Status |
|-----------|---------|--------|
| **Blood pressure** | "SBP goal 100–140 mmHg" | ⚠️ Needs update — Align with 2022: SBP &lt;140 within 1 hour; avoid &lt;110. Add "within 1 hour" and "avoid SBP &lt;110." |
| **Anticoagulation reversal** | "Consider PCC + Vitamin K" (warfarin) | ⚠️ Needs update — Specify 4-factor PCC 25–50 units/kg + Vitamin K 10 mg IV; FFP if PCC unavailable. No dabigatran/Xa wording. |
| **Medications to avoid** | "Transfuse Platelets If platelets &lt;100,000/μL" | ⚠️ Needs update — 2022: platelet transfusion not routinely recommended; reserve for severe thrombocytopenia or emergency surgery. |
| **TXA** | Not mentioned | ✅ OK for this component (tPA-bleed: cryo is primary; TXA off-label and 2022 says no routine TXA in ICH). |
| **Citations** | None | ❌ Missing — Add AHA/ASA 2022 ICH (for BP/reversal) and note applicability to tPA-related hemorrhage. |

**Summary:** ⚠️ Needs update (BP wording, PCC dosing, platelet guidance, citations). No incorrect TXA recommendation here.

---

### File: src/components/article/stroke/StrokeIchProtocolStep.tsx

| Checklist | Finding | Status |
|-----------|---------|--------|
| **Blood pressure** | "SBP &lt;140 mmHg when feasible. Nicardipine or labetalol. Avoid rapid drop (&gt;90 mmHg in 1 h)." | ⚠️ Needs update — Add "within 1 hour" and "avoid SBP &lt;110 mmHg." |
| **Anticoagulation reversal** | "Warfarin: 4-factor PCC + IV vitamin K. Dabigatran: idarucizumab. Xa inhibitors: andexanet." | ⚠️ Needs update — Add PCC dose (25–50 units/kg), Vitamin K 10 mg IV; note FFP if PCC unavailable; andexanet or PCC for Xa. |
| **Surgical** | Not in this component (in IchManagement) | N/A |
| **Platelet / TXA** | Not mentioned | ✅ OK (no incorrect recommendation). |
| **Citations** | "AHA/ASA Guidelines for Management of Spontaneous ICH; INTERACT2; ATACH-2." | ⚠️ Needs update — Specify "2022 AHA/ASA ICH Guidelines" and add URL/section. |

**Summary:** ⚠️ Needs update (BP caveat, reversal dosing/detail, citation year and link).

---

### File: src/pages/guide/IchManagement.tsx

| Checklist | Finding | Status |
|-----------|---------|--------|
| **Blood pressure** | "SBP &lt;140 mmHg when feasible. Nicardipine or labetalol. Avoid rapid drop (e.g. &gt;90 mmHg in 1 h)." | ⚠️ Needs update — Add "within 1 hour" and "avoid SBP &lt;110 mmHg." |
| **Anticoagulation reversal** | "Warfarin: 4-factor PCC + IV vitamin K. Dabigatran: idarucizumab. Xa inhibitors: andexanet." | ⚠️ Needs update — Add PCC 25–50 units/kg, Vitamin K 10 mg IV; FFP if PCC unavailable; goal INR &lt;1.4. |
| **Surgical** | "Cerebellar &gt;3 cm or brainstem compression: evacuate." | ✅ Correct — Align with 2022 (Class I, Level B). Add "neurological decline or hydrocephalus" for completeness. |
| **Platelet / TXA** | Not mentioned | ✅ OK. |
| **Citations** | None | ❌ Missing — Add 2022 AHA/ASA ICH Guidelines with URL. |

**Summary:** ⚠️ Needs update (BP, reversal detail, surgical nuance, citations).

---

### File: src/data/strokeClinicalPearls.ts

| Checklist | Finding | Status |
|-----------|---------|--------|
| **Blood pressure (ICH)** | "Target SBP 100-140 mmHg"; "ATACH-2: Intensive lowering (110-139) was safe"; "Target 100-140 to prevent hematoma expansion." | ⚠️ Needs update — 2022: SBP &lt;140 within 1 hour (Class I, Level A); avoid SBP &lt;110 (ATACH-2 no benefit, possible harm). Change "100-140" to "&lt;140 (avoid &lt;110)". |
| **Anticoagulation reversal** | Coagulopathy reversal protocol: "PCC 50 units/kg for Factor Xa inhibitors/Warfarin, Idarucizumab 5g IV for Dabigatran." | ⚠️ Needs update — Warfarin: 4-factor PCC 25–50 units/kg + Vitamin K 10 mg IV; FFP if PCC unavailable. Xa: andexanet or PCC. |
| **TXA** | Hemorrhage Protocol (quick): "Consider TXA 1g IV." Coagulopathy protocol (deep): "STEP 3: Tranexamic acid (TXA) 1000mg IV… Evidence: TICH-2 showed safe in spontaneous ICH but no clear benefit." | ❌ Incorrect — 2022: TXA NOT recommended for routine use (Class III, Level A). TICH-2 no benefit; possible thromboembolic harm. Remove "Consider TXA" from quick protocol; in deep protocol, state "TXA is not routinely recommended per 2022 guidelines (TICH-2 no benefit)." |
| **Platelet transfusion** | "STEP 4: Platelet transfusion if &lt;100,000 (target &gt;100K)." | ❌ Incorrect — 2022: platelet transfusion NOT routinely recommended (may worsen outcomes). Reserve for severe thrombocytopenia or emergency surgery. |
| **Surgical** | "Cerebellar hemorrhage &gt;3cm (risk of hydrocephalus/brainstem compression)" | ✅ Correct — Add "with neurological decline" to match 2022. |
| **Citations** | ATACH-2, TICH-2 2018, STICH, ECASS-3, NINDS. No "AHA/ASA 2022." | ❌ Missing — Add AHA/ASA 2022 ICH Guidelines; update evidence to "AHA/ASA 2022 ICH Guidelines, Section X" where applicable. |

**Summary:** ❌ Incorrect (TXA routine use; routine platelet transfusion); ⚠️ Needs update (BP target, reversal dosing, citations). **PRIORITY: HIGH/CRITICAL** (TXA and platelet wording contradict 2022).

---

### File: src/components/article/stroke/CodeModeStep4.tsx

| Checklist | Finding | Status |
|-----------|---------|--------|
| **Reversal wording** | Rationale: "reversal (cryoprecipitate, TXA, platelets)." | ⚠️ Needs update — For tPA-related sICH: cryoprecipitate is primary; do not routinely recommend TXA or platelets per 2022. Prefer "reversal (cryoprecipitate; reverse anticoagulation if applicable; platelets only if severe thrombocytopenia or emergency surgery)." |

**Summary:** ⚠️ Needs update (align with 2022: no routine TXA/platelets).

---

### File: src/components/article/stroke/CodeModeStep2.tsx

| Checklist | Finding | Status |
|-----------|---------|--------|
| **Content** | "Proceed to hemorrhage protocol. Consider EVT pathway if LVO suspected…" | ✅ Correct — No dosing or guideline conflict. Optional: add "per 2022 AHA/ASA ICH protocol" for consistency. |

**Summary:** ✅ Correct; optional citation tweak.

---

### File: src/data/ichScoreData.ts

| Checklist | Finding | Status |
|-----------|---------|--------|
| **Content** | ICH Score (Hemphill 2001); mortality table. No management. | ✅ Correct — No change needed for 2022 ICH management. |

**Summary:** ✅ No update required.

---

### File: src/pages/IchScoreCalculator.tsx

No ICH management content; uses ichScoreData only. ✅ No update required.

---

## PHASE 3: UPDATE RECOMMENDATIONS (SPECIFIC TEXT CHANGES)

### FILE: src/components/article/stroke/HemorrhageProtocol.tsx

**CHANGE 1: BP step**  
**Location:** STEPS array, step "Strict BP Control" (line ~11).  
**Current text:**  
`{ title: 'Strict BP Control', detail: 'SBP goal 100–140 mmHg' }`  
**Updated text:**  
`{ title: 'Strict BP Control', detail: 'SBP <140 mmHg within 1 hour when feasible. Avoid SBP <110 mmHg. Nicardipine or labetalol.' }`  
**Citation to add (in component footer or doc):**  
Evidence: AHA/ASA 2022 ICH Guidelines, Section 5.1, Class I, Level A. INTERACT-2, ATACH-2. URL: https://www.ahajournals.org/doi/10.1161/STR.0000000000000407

**CHANGE 2: Platelet step**  
**Location:** STEPS array, "Transfuse Platelets" (line ~12).  
**Current text:**  
`{ title: 'Transfuse Platelets', detail: 'If platelets <100,000/μL' }`  
**Updated text:**  
`{ title: 'Platelets', detail: 'Not routinely recommended (2022 guidelines). Reserve for severe thrombocytopenia or emergency surgery.' }`  
**Citation:** AHA/ASA 2022 ICH Guidelines — platelet transfusion may worsen outcomes when used routinely.

**CHANGE 3: PCC step**  
**Location:** STEPS array, "Consider PCC + Vitamin K" (line ~13).  
**Current text:**  
`{ title: 'Consider PCC + Vitamin K', detail: 'Especially if on warfarin' }`  
**Updated text:**  
`{ title: 'Anticoagulation reversal', detail: 'Warfarin: 4-factor PCC 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR <1.4). If PCC unavailable: FFP. Dabigatran: idarucizumab 5 g IV. Xa inhibitors: andexanet or PCC.' }`  
**Citation:** AHA/ASA 2022 ICH Guidelines, Section 6.2, Class I, Level B.

**CHANGE 4: References**  
**Location:** After STEPS (e.g. before or after Print button).  
**Add:**  
"References: AHA/ASA 2022 Guideline for Management of Spontaneous ICH. URL: https://www.ahajournals.org/doi/10.1161/STR.0000000000000407"

---

### FILE: src/components/article/stroke/StrokeIchProtocolStep.tsx

**CHANGE 1: BP item in ICH_PROTOCOL_ITEMS**  
**Location:** Line ~13, Blood pressure item.  
**Current text:**  
`{ title: 'Blood pressure', detail: 'SBP <140 mmHg when feasible. Nicardipine or labetalol. Avoid rapid drop (>90 mmHg in 1 h).', evidence: 'INTERACT2/ATACH-2, Class I, Level A' }`  
**Updated text:**  
`{ title: 'Blood pressure', detail: 'SBP <140 mmHg within 1 hour when feasible. Nicardipine or labetalol. Avoid SBP <110 mmHg; avoid rapid drop (>90 mmHg in 1 h).', evidence: 'AHA/ASA 2022 ICH, Section 5.1, Class I, Level A; INTERACT2, ATACH-2' }`

**CHANGE 2: Anticoagulation reversal item**  
**Location:** Line ~12.  
**Current text:**  
`{ title: 'Anticoagulation reversal', detail: 'Warfarin: 4-factor PCC + IV vitamin K. Dabigatran: idarucizumab. Xa inhibitors: andexanet.', evidence: 'Class I, Level A' }`  
**Updated text:**  
`{ title: 'Anticoagulation reversal', detail: 'Warfarin: 4-factor PCC 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR <1.4). FFP if PCC unavailable. Dabigatran: idarucizumab 5 g IV. Xa inhibitors: andexanet alfa or 4-factor PCC.', evidence: 'AHA/ASA 2022 ICH, Section 6.2, Class I, Level B' }`

**CHANGE 3: References line**  
**Location:** Line ~63.  
**Current text:**  
`<strong>References:</strong> AHA/ASA Guidelines for Management of Spontaneous ICH; INTERACT2; ATACH-2.`  
**Updated text:**  
`<strong>References:</strong> 2022 AHA/ASA Guideline for Management of Patients With Spontaneous ICH. INTERACT2; ATACH-2. <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000407" target="_blank" rel="noopener noreferrer">Full guideline</a>.`

---

### FILE: src/pages/guide/IchManagement.tsx

**CHANGE 1: Blood pressure paragraph**  
**Location:** Section 4, Paragraph (lines ~52–58).  
**Current text:**  
`SBP <Value>&lt;140 mmHg</Value> when feasible. Nicardipine or labetalol. Avoid rapid drop (e.g. &gt;<Value>90</Value> mmHg in 1 h).`  
**Updated text:**  
`SBP <Value>&lt;140 mmHg</Value> within 1 hour when feasible (Class I, Level A). Nicardipine or labetalol. Avoid SBP &lt;110 mmHg; avoid rapid drop (e.g. &gt;<Value>90</Value> mmHg in 1 h). Evidence: INTERACT-2, ATACH-2; 2022 AHA/ASA ICH Guidelines.`

**CHANGE 2: Anticoagulation reversal paragraph**  
**Location:** Section 3 (lines ~46–49).  
**Current text:**  
`<strong>Warfarin:</strong> 4-factor <Term ...>PCC</Term> + IV vitamin K. <strong>Dabigatran:</strong> ... <strong>Xa inhibitors:</strong> andexanet. Do not wait for labs when the history is clear.`  
**Updated text:**  
`<strong>Warfarin:</strong> 4-factor PCC 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR &lt;1.4). If PCC unavailable, FFP 10-15 mL/kg. <strong>Dabigatran:</strong> idarucizumab 5 g IV. <strong>Xa inhibitors:</strong> andexanet alfa or 4-factor PCC. Do not wait for labs when the history is clear. (2022 AHA/ASA ICH, Class I, Level B.)`

**CHANGE 3: Surgery paragraph**  
**Location:** SubSection "Surgery" (lines ~68–74).  
**Current text:**  
`Cerebellar <Value>&gt;3 cm</Value> or brainstem compression: <Critical>evacuate</Critical>.`  
**Updated text:**  
`Cerebellar hemorrhage <Value>&gt;3 cm</Value> with neurological decline or brainstem compression or hydrocephalus: <Critical>evacuate</Critical> (Class I, Level B). EVD for hydrocephalus from IVH.`

**CHANGE 4: Footer / references**  
**Location:** End of article (e.g. after Warning).  
**Add:**  
`<Paragraph>References: 2022 AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage. <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000407">Stroke. 2022</a>.</Paragraph>`

---

### FILE: src/data/strokeClinicalPearls.ts

**CHANGE 1: Hemorrhage Protocol (quick) — remove TXA, fix BP**  
**Location:** id `hemorrhage-management-quick`, lines ~688–692.  
**Current text:**  
`content: 'Stop tPA immediately. STAT CT. Cryoprecipitate 10 units IV (raises fibrinogen ~50 mg/dL, target >150). Consider TXA 1g IV. BP target 100-140. Neurosurgery consult STAT.'`  
**Updated text:**  
`content: 'Stop tPA immediately. STAT CT. Cryoprecipitate 10 units IV (raises fibrinogen ~50 mg/dL, target >150). BP target <140 mmHg within 1 h; avoid SBP <110. Reverse anticoagulation if applicable (4-factor PCC + vitamin K for warfarin; idarucizumab for dabigatran; andexanet or PCC for Xa inhibitors). Platelet transfusion not routinely recommended (2022). Neurosurgery consult STAT.'`  
**Reason:** 2022: no routine TXA (Class III, Level A); SBP <140, avoid <110; platelet transfusion not routine.

**CHANGE 2: Coagulopathy Reversal Protocol (deep) — remove routine TXA and routine platelets**  
**Location:** id `hemorrhage-reversal-protocol`, lines ~726–733.  
**Current text:**  
`content: 'STEP 1: Stop tPA infusion immediately. STEP 2: Cryoprecipitate 10 units IV push (replaces fibrinogen depleted by tPA). Each unit raises fibrinogen ~5 mg/dL. Target fibrinogen >150 mg/dL. Check q30min until target reached. STEP 3: Tranexamic acid (TXA) 1000mg IV over 10 min (inhibits fibrinolysis). Evidence: TICH-2 showed safe in spontaneous ICH but no clear benefit. STEP 4: Platelet transfusion if <100,000 (target >100K). STEP 5: Reverse any anticoagulation: PCC 50 units/kg for Factor Xa inhibitors/Warfarin, Idarucizumab 5g IV for Dabigatran.'`  
**Updated text:**  
`content: 'STEP 1: Stop tPA infusion immediately. STEP 2: Cryoprecipitate 10 units IV push (replaces fibrinogen depleted by tPA). Target fibrinogen >150 mg/dL; check q30min until target. STEP 3: TXA is NOT routinely recommended per 2022 AHA/ASA ICH guidelines (Class III, Level A; TICH-2 showed no benefit, possible thromboembolic harm). STEP 4: Platelet transfusion NOT routinely recommended (2022 guidelines; may worsen outcomes). Reserve for severe thrombocytopenia or emergency surgery. STEP 5: Warfarin: 4-factor PCC 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR <1.4). FFP if PCC unavailable. Dabigatran: idarucizumab 5 g IV. Xa inhibitors: andexanet alfa or 4-factor PCC.'`  
**Evidence to add:**  
`evidence: 'AHA/ASA 2022 ICH Guidelines, Sections 5.1, 6.2; TICH-2 2018'`

**CHANGE 3: BP in ICH (deep)**  
**Location:** id `bp-in-hemorrhage`, lines ~747–754.  
**Current text:**  
`content: 'Target SBP 100-140 mmHg (prevent hematoma expansion). ATACH-2 trial: Intensive lowering (110-139) was safe. Contrast with ischemic stroke: Lower is better in ICH (prevents expansion), but in ischemic stroke too low worsens penumbral perfusion. Use nicardipine or labetalol drip for precise control.'`  
**Updated text:**  
`content: 'Target SBP <140 mmHg within 1 hour when feasible (Class I, Level A). Avoid SBP <110 mmHg (ATACH-2: intensive target 110-139 showed no benefit, possible harm). Use nicardipine or labetalol. Contrast with ischemic stroke: in ICH lower BP reduces expansion; in ischemic stroke too low worsens penumbral perfusion.'`  
**Evidence:**  
`evidence: 'AHA/ASA 2022 ICH Guidelines, Section 5.1, Class I, Level A; INTERACT-2, ATACH-2'`

**CHANGE 4: ATACH-2 trial pearl**  
**Location:** id `atach2-trial`, lines ~758–761.  
**Current text:**  
`content: 'Intensive BP lowering (110-139) vs standard (140-179) in spontaneous ICH. Intensive lowering was safe. No difference in death or disability but trend toward benefit. Current practice: Target 100-140 to prevent hematoma expansion.'`  
**Updated text:**  
`content: 'Intensive BP lowering (110-139) vs standard (140-179) in spontaneous ICH. No difference in death or disability; intensive arm had possible harm (e.g. renal). 2022 guidelines: SBP <140 within 1 hour when feasible; avoid SBP <110.'`  

**CHANGE 5: TICH-2 trial pearl**  
**Location:** id `tich2-trial`, lines ~736–744.  
**Current text:**  
`content: 'Tranexamic acid in spontaneous ICH. 2,325 patients. TXA safe but no clear benefit in functional outcomes. Mechanism: TXA inhibits fibrinolysis. Used off-label for tPA-related ICH but evidence limited.'`  
**Updated text:**  
`content: 'Tranexamic acid in spontaneous ICH. 2,325 patients. TXA did not improve functional outcomes; possible increase in thromboembolic events. 2022 AHA/ASA ICH: TXA NOT recommended for routine use (Class III, Level A). Not recommended for tPA-related ICH as routine therapy.'`  

**CHANGE 6: Surgical Intervention for ICH**  
**Location:** id `neurosurgery-indications`, lines ~769–775.  
**Current text:**  
`content: 'STAT neurosurgery consult for: Cerebellar hemorrhage >3cm (risk of hydrocephalus/brainstem compression), ...'`  
**Updated text:**  
`content: 'STAT neurosurgery consult for: Cerebellar hemorrhage >3 cm with neurological decline or brainstem compression or hydrocephalus (evacuate; Class I, Level B). EVD for hydrocephalus from IVH. Superficial lobar ICH with mass effect + declining GCS (STICH II–type). Any ICH with herniation signs.'`  
**Evidence:**  
`evidence: 'AHA/ASA 2022 ICH Guidelines; STICH, STICH II'`

**CHANGE 7: Add 2022 citation where evidence is listed**  
**Location:** All deep pearls in step-6 that reference ATACH-2, TICH-2, or reversal.  
**Action:** Add or set `evidence: 'AHA/ASA 2022 ICH Guidelines, Section X'` and, where applicable, add URL in a shared references note or in the UI that displays these pearls.

---

### FILE: src/components/article/stroke/CodeModeStep4.tsx

**CHANGE 1: sICH reversal rationale**  
**Location:** Order `stat-ct-decline`, rationale (line ~177).  
**Current text:**  
`rationale: 'Symptomatic ICH presents with sudden worsening (≥4 NIHSS points), severe headache, vomiting, or decreased consciousness. Requires immediate CT, neurosurgery consult, and potential reversal (cryoprecipitate, TXA, platelets).'`  
**Updated text:**  
`rationale: 'Symptomatic ICH presents with sudden worsening (≥4 NIHSS points), severe headache, vomiting, or decreased consciousness. Requires immediate CT, neurosurgery consult, and reversal: cryoprecipitate for tPA-related hemorrhage; reverse anticoagulation if on anticoagulants (4-factor PCC + vitamin K for warfarin; idarucizumab for dabigatran; andexanet or PCC for Xa inhibitors). Platelet transfusion and TXA not routinely recommended per 2022 guidelines.'`  

---

### FILE: src/components/article/stroke/CodeModeStep2.tsx

**Optional:**  
**Location:** Line ~220.  
**Current text:**  
`Proceed to hemorrhage protocol. Consider EVT pathway if LVO suspected with appropriate imaging.`  
**Updated text (optional):**  
`Proceed to hemorrhage protocol (2022 AHA/ASA ICH). Consider EVT pathway if LVO suspected with appropriate imaging.`  

---

## PHASE 4: IMPLEMENTATION PLAN

### Priority 1 — CRITICAL (fix immediately)

- **src/data/strokeClinicalPearls.ts**
  - Remove "Consider TXA 1g IV" from Hemorrhage Protocol (quick) and correct Coagulopathy Reversal Protocol (deep): no routine TXA, no routine platelet transfusion.
  - Update BP target to &lt;140, avoid &lt;110; update reversal dosing and 2022 citations.
  - **Reason:** Incorrect medical recommendations (routine TXA and routine platelets contradict 2022 AHA/ASA ICH).

### Priority 2 — HIGH (fix this week)

- **src/components/article/stroke/HemorrhageProtocol.tsx**  
  Apply BP, platelet, and PCC text changes; add 2022 reference.
- **src/components/article/stroke/StrokeIchProtocolStep.tsx**  
  Apply BP and reversal wording; add "within 1 hour," "avoid SBP &lt;110," PCC dose and FFP; update references to 2022 with URL.
- **src/pages/guide/IchManagement.tsx**  
  Apply BP, reversal, surgery, and reference updates.
- **src/components/article/stroke/CodeModeStep4.tsx**  
  Update sICH reversal rationale to align with 2022 (no routine TXA/platelets).

### Priority 3 — MEDIUM (fix this month)

- **src/data/strokeClinicalPearls.ts**  
  Update ATACH-2 and TICH-2 pearl wording; surgical indication pearl; add AHA/ASA 2022 and section numbers throughout step-6 deep pearls.
- **SEO/metadata:** Consider adding "2022 AHA/ASA ICH" to relevant route descriptions (e.g. ICH management, hemorrhage protocol) in `src/seo/routeMeta.ts` if a dedicated ICH/hemorrhage route exists.

### Priority 4 — LOW (backlog)

- **src/components/article/stroke/CodeModeStep2.tsx**  
  Optional: add "2022 AHA/ASA ICH" to hemorrhage protocol sentence.
- **src/data/guideContent.ts**  
  If `hemorrhagic-stroke` or `anticoagulation-reversal` pages get content later, write them to 2022 guidelines from the start.

---

## Summary

- **Phase 1:** 8 files with updatable hemorrhage/ICH content; 2 ICH Score–only; 2 empty/contraindication-only.
- **Phase 2:** Critical issues in **strokeClinicalPearls.ts** (routine TXA and routine platelets). Other files need BP wording (within 1 h, avoid &lt;110), reversal dosing (PCC 25–50 units/kg, Vitamin K 10 mg, FFP if unavailable), and 2022 citations.
- **Phase 3:** Specific line-level text changes and citations above.
- **Phase 4:** P1 = strokeClinicalPearls.ts; P2 = HemorrhageProtocol, StrokeIchProtocolStep, IchManagement, CodeModeStep4; P3 = remaining pearls + SEO; P4 = optional wording and future guide content.

**No code has been changed in this audit.**  

Ready to implement these changes? Please confirm which priority level to start with (recommend starting with Priority 1).
