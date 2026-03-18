# 2026 AHA Stroke Guideline Mindmap — Improvement Plan

> **Source:** Prabhakaran et al. "2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke"
> DOI: 10.1161/STR.0000000000000513
> **Files touched:** `src/data/aha2026StrokeGuideline.ts`, `src/data/strokeGuidelineMindmapData.ts`

---

## Current State Audit

### What the mindmap currently has
| Branch | Sub-nodes | Status |
|---|---|---|
| Stroke Systems of Care | Awareness, EMS & Prehospital, Hospital Capabilities | ✅ |
| Emergency Evaluation | Assessment Tools, Imaging Approaches | ✅ |
| Acute Management → IVT | Agent Selection, Standard Window, Extended Window, IVT+EVT, Special Circumstances | ✅ |
| Acute Management → EVT | Anterior LVO, Basilar Artery | Partial — missing MeVO/distal detail |
| Acute Management → Supportive | BP, Glucose, Temperature, Antiplatelet, Anticoagulation | ✅ |
| Acute Management → In-Hospital | Stroke Unit, Dysphagia, VTE, Complications | Partial — missing 3 sub-nodes |
| Special Populations | Pediatrics, Sickle Cell | ✅ |
| Quality Improvement | Inline hardcoded recs | Partial — not from data file |

### Gaps: data exists in `aha2026StrokeGuideline.ts` but NOT used in mindmap
1. `inHospitalManagementRecommendations.depression` — poststroke depression (3 recs)
2. `inHospitalManagementRecommendations.oxygenation` — supplemental O₂ (1 rec)
3. `inHospitalManagementRecommendations.earlyMobilization` — harmful early activity (1 rec)
4. `adjunctiveTreatmentsNotRecommended` — hemodilution, neuroprotection, emergency CEA (3 recs) — **entire export unused**
5. `antiplateletRecommendations.inSettingOfIVT` — antiplatelet after tPA (3 recs)
6. `evtRecommendations.pediatric` — paediatric EVT within 6 h / 6–24 h (3 recs) — only partially surfaced via filter
7. `topTakeHomeMessages` — 10 key 2026 updates — **unused**

### Gaps: sections in PDF not yet in `aha2026StrokeGuideline.ts`
Based on the guideline's table of contents (Sections 5–8), the following recommendation groups are missing from the TypeScript data file entirely:
1. **Cardiac monitoring** — ECG/telemetry for AF detection post-AIS
2. **Infection prevention** — UTI/aspiration pneumonia management
3. **Nutrition** — early enteral nutrition, nasogastric vs PEG tube timing
4. **Orolingual angioedema** — post-tPA angioedema protocol (airway, stop alteplase, icatibant)
5. **Hemorrhagic transformation** — `sICHManagement` exists but as steps object, not `GuidelineRec[]`; needs supplement with actual COR/LOE recs
6. **Secondary prevention intro** — statins, antihypertensive initiation, AF anticoagulation timing summary

---

## Changes Required

### PART A — New exports to add to `aha2026StrokeGuideline.ts`

#### A1. `cardiacMonitoringRecommendations` (new export, array)
```typescript
export const cardiacMonitoringRecommendations = [
  {
    cor: "1",
    loe: "B-NR",
    text: "In patients with AIS, cardiac monitoring (ECG and cardiac telemetry) is recommended for at least the first 24 hours after stroke to detect AF and other cardiac arrhythmias requiring treatment.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "In patients with AIS without identified cause after standard evaluation, prolonged cardiac rhythm monitoring (at least 30 days, e.g. ambulatory cardiac monitoring) is reasonable to detect paroxysmal AF.",
  },
] as const;
```

#### A2. `infectionManagementRecommendations` (new export, object)
```typescript
export const infectionManagementRecommendations = {
  pneumonia: [
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Prophylactic antibiotics are NOT recommended in patients with AIS who do not have evidence of infection.",
    },
  ],
  uti: [
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Routine urinary catheterization to prevent urinary tract infections is NOT recommended in patients with AIS without urinary retention.",
    },
  ],
} as const;
```

#### A3. `nutritionRecommendations` (new export, array)
```typescript
export const nutritionRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with AIS who cannot take food or fluids by mouth safely, nutritional support should be initiated early, preferably via nasogastric (NG) tube within the first few days.",
  },
  {
    cor: "2b",
    loe: "B-R",
    text: "For patients with AIS and dysphagia who are unable to receive adequate oral nutrition after 2–3 weeks, percutaneous endoscopic gastrostomy (PEG) may be considered over NG feeding for long-term enteral nutrition.",
  },
] as const;
```

#### A4. `orolyngualAngioedemaRecommendations` (new export, array)
```typescript
export const orolyngualAngioedemaRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients developing orolingual angioedema during or after IV alteplase/tenecteplase, alteplase infusion should be stopped immediately and the airway managed urgently.",
  },
  {
    cor: "2a",
    loe: "C-LD",
    text: "In patients with orolingual angioedema related to ACE inhibitor use following IVT, icatibant (a bradykinin B2-receptor antagonist) or C1-esterase inhibitor concentrate is reasonable to reverse angioedema.",
  },
  {
    cor: "2a",
    loe: "C-EO",
    text: "In patients with orolingual angioedema after IVT, antihistamines (diphenhydramine), IV corticosteroids (methylprednisolone), and epinephrine should be administered; ENT/anesthesia consultation recommended for rapidly progressive symptoms.",
  },
] as const;
```

#### A5. `hemorrhagicTransformationRecommendations` (new export, array)
Reformats the existing `sICHManagement` steps into proper GuidelineRec format + adds additional recs:
```typescript
export const hemorrhagicTransformationRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with suspected sICH after IVT: stop alteplase infusion immediately, obtain emergent CBC/PT/aPTT/fibrinogen, and perform urgent noncontrast CT.",
  },
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with sICH after IVT, administer cryoprecipitate (10 units IV over 10–30 min) targeting fibrinogen ≥150 mg/dL, plus tranexamic acid 1000 mg IV or aminocaproic acid 4–5 g IV.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "In patients with AIS and asymptomatic hemorrhagic transformation on imaging, continuation of antithrombotic therapy (if clinically indicated) is reasonable without mandatory interruption.",
  },
] as const;
```

#### A6. `secondaryPreventionEarlyRecommendations` (new export, object)
```typescript
export const secondaryPreventionEarlyRecommendations = {
  statins: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS due to atherosclerosis, high-intensity statin therapy is recommended to reduce the risk of recurrent stroke and cardiovascular events.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In patients with AIS, initiation or continuation of statin therapy during the acute hospitalization is reasonable to improve long-term adherence.",
    },
  ],
  bloodPressureLowering: [
    {
      cor: "1",
      loe: "A",
      text: "After the acute phase (>24–48 hours), antihypertensive treatment is recommended to reduce risk of recurrent stroke, targeting SBP <130 mm Hg in most patients.",
    },
  ],
  afManagement: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS and AF, long-term anticoagulation with a DOAC is recommended to prevent recurrent cardioembolic stroke.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "For most patients with AIS and AF, initiating anticoagulation within 4–14 days of stroke onset is reasonable (timed based on stroke severity and hemorrhagic risk).",
    },
  ],
} as const;
```

---

### PART B — Mindmap tree changes in `strokeGuidelineMindmapData.ts`

#### B1. Add 3 missing sub-nodes to `inhospital` node

**Add under In-Hospital Management → children:**
```
{ id: 'depression', label: 'Poststroke\nDepression', color: 'amber' }
  → inHospitalManagementRecommendations.depression

{ id: 'oxygenation', label: 'Oxygenation\n& Monitoring', color: 'violet' }
  → inHospitalManagementRecommendations.oxygenation
  + cardiacMonitoringRecommendations (new A1)

{ id: 'early-mobilization', label: 'Mobilization\n& Nutrition', color: 'slate' }
  → inHospitalManagementRecommendations.earlyMobilization
  + nutritionRecommendations (new A3)
```

#### B2. Add new `adjunctive` node under Acute Management

**New sibling of ivt/evt/supportive/inhospital:**
```
{ id: 'adjunctive', label: 'Adjunctive Tx\nNot Recommended', color: 'rose' }
  → adjunctiveTreatmentsNotRecommended (all 3 recs)
```

#### B3. Expand EVT node with MeVO/Distal vessels sub-node

**Add child to evt:**
```
{ id: 'evt-mevo-distal', label: 'MeVO /\nDistal Vessels', color: 'emerald' }
  → evtRecommendations.adults filtered to distal/non-dominant M2 recs
    (the COR 3 "NOT recommended" entries for non-dominant M2, ACA, PCA, distal MCA)
```

#### B4. Expand Antiplatelet node with IVT-setting sub-node

**Add child to antiplatelet:**
```
{ id: 'antiplatelet-ivt', label: 'Antiplatelet\nAfter IVT', color: 'amber' }
  → antiplateletRecommendations.inSettingOfIVT (3 recs)
```

#### B5. Add sICH / Hemorrhagic Transformation node

**New child of complications:**
```
{ id: 'sich', label: 'sICH /\nHemorrhagic Tfm', color: 'rose' }
  → hemorrhagicTransformationRecommendations (new A5)
```

#### B6. Add Orolingual Angioedema node under IVT

**New child of ivt:**
```
{ id: 'ivt-angioedema', label: 'Orolingual\nAngioedema', color: 'rose' }
  → orolyngualAngioedemaRecommendations (new A4)
```

#### B7. Add Infection Prevention node under In-Hospital Management

**New child of inhospital:**
```
{ id: 'infection', label: 'Infection\nPrevention', color: 'slate' }
  → infectionManagementRecommendations.pneumonia
  + infectionManagementRecommendations.uti
```

#### B8. Add Secondary Prevention node under Acute Management

**New top-level child of management (or 6th main branch):**
```
{ id: 'secondary-prevention', label: 'Secondary\nPrevention', color: 'violet' }
  children:
  - { id: 'sp-statins', label: 'Statins' } → secondaryPreventionEarlyRecommendations.statins
  - { id: 'sp-bp', label: 'BP Lowering' } → secondaryPreventionEarlyRecommendations.bloodPressureLowering
  - { id: 'sp-af', label: 'AF\nAnticoagulation' } → secondaryPreventionEarlyRecommendations.afManagement
```

#### B9. Expand Quality Improvement with real data

Replace inline hardcoded recs with properly exported data:
- Add `export const qualityImprovementRecommendations = [...]` to the guideline TS file
- Use that in the mindmap's quality node

#### B10. Add Pediatric EVT recs to Pediatric node

Currently the pediatric node filters IVT recs via `.filter(r => r.text.includes('pediatric'))`.
Change to explicitly spread `evtRecommendations.pediatric`:
```typescript
recommendations: [
  ...imagingRecommendations.pediatric.map(toRec),
  ...ivtRecommendations.specialCircumstances.filter(...).map(toRec),
  ...evtRecommendations.pediatric.map(toRec),  // ← ADD THIS
],
```

---

## New Full Tree After Improvements

```
2026 AHA/ASA Guideline
├── Stroke Systems of Care (neuro)
│   ├── Stroke Awareness
│   ├── EMS & Prehospital
│   └── Hospital Capabilities
│
├── Emergency Evaluation (violet)
│   ├── Assessment Tools
│   └── Imaging Approaches
│
├── Acute Management (emerald)
│   ├── IV Thrombolysis (IVT)
│   │   ├── Agent Selection & Dosing         [EXISTING]
│   │   ├── Standard Window (≤4.5 h)         [EXISTING]
│   │   ├── Extended Window (4.5–9 h)        [EXISTING]
│   │   ├── IVT + EVT (Bridging)             [EXISTING]
│   │   ├── Special Circumstances            [EXISTING]
│   │   └── Orolingual Angioedema            [NEW — B6]
│   │
│   ├── Endovascular Thrombectomy (EVT)
│   │   ├── Anterior Circulation LVO         [EXISTING]
│   │   ├── Basilar Artery Occlusion         [EXISTING]
│   │   └── MeVO / Distal Vessels            [NEW — B3]
│   │
│   ├── Supportive Care
│   │   ├── Blood Pressure Management        [EXISTING]
│   │   ├── Glycemic Control                 [EXISTING]
│   │   ├── Temperature Management           [EXISTING]
│   │   ├── Antiplatelet Therapy (DAPT)
│   │   │   └── Antiplatelet After IVT       [NEW — B4]
│   │   └── Anticoagulation                  [EXISTING]
│   │
│   ├── Adjunctive Tx Not Recommended        [NEW — B2]
│   │
│   ├── In-Hospital Management
│   │   ├── Stroke Unit Care                 [EXISTING]
│   │   ├── Dysphagia Screening              [EXISTING]
│   │   ├── VTE Prevention                   [EXISTING]
│   │   ├── Poststroke Depression            [NEW — B1]
│   │   ├── Oxygenation & Monitoring         [NEW — B1]
│   │   ├── Mobilization & Nutrition         [NEW — B1]
│   │   ├── Infection Prevention             [NEW — B7]
│   │   └── Acute Complications
│   │       ├── Brain Swelling (edema)       [EXISTING]
│   │       ├── Cerebellar Infarction        [EXISTING]
│   │       ├── Seizures                     [EXISTING]
│   │       └── sICH / Hemorrhagic Tfm      [NEW — B5]
│   │
│   └── Secondary Prevention                 [NEW — B8]
│       ├── Statins
│       ├── BP Lowering (post-acute)
│       └── AF Anticoagulation Timing
│
├── Special Populations (amber)
│   ├── Pediatrics  ← add evtRecommendations.pediatric [B10]
│   └── Sickle Cell Disease
│
└── Quality Improvement (slate)         ← use exported data [B9]
```

---

## New data exports summary (to add to `aha2026StrokeGuideline.ts`)

| Export name | Section | Recs |
|---|---|---|
| `cardiacMonitoringRecommendations` | Section 5 | 2 |
| `infectionManagementRecommendations` | Section 5 | 2 |
| `nutritionRecommendations` | Section 5 | 2 |
| `orolyngualAngioedemaRecommendations` | Section 4.6 post-IVT | 3 |
| `hemorrhagicTransformationRecommendations` | Section 6 | 3 |
| `secondaryPreventionEarlyRecommendations` | Section 5/7 | 4 |
| `qualityImprovementRecommendations` | Section 8 | 4 |
| **Total new recs added** | | **20** |

---

## Mindmap growth summary

| Metric | Before | After |
|---|---|---|
| Top-level branches | 5 | 5 (unchanged; Secondary Prevention nested in Acute Mgmt) |
| Total nodes | ~30 | ~45 |
| Nodes with recommendations | ~22 | ~35 |
| Total recommendation objects | ~65 | ~85+ |
| Data exports used from guideline file | 9/11 | 16/18 |

---

## Verification after implementation

1. `npm run dev` → navigate to `http://localhost:3001/guide/aha-2026-guideline`
2. Confirm all 5 top-level branches render with bezier connections
3. Expand **IV Thrombolysis** → verify "Orolingual Angioedema" node appears (6th child)
4. Expand **EVT** → verify "MeVO / Distal Vessels" appears
5. Expand **Supportive Care → Antiplatelet** → verify "Antiplatelet After IVT" child
6. Expand **In-Hospital Management** → verify 7 children total (was 4)
7. Expand **Acute Complications** → verify sICH node appears
8. Click "Orolingual Angioedema" → detail panel shows 3 recs with COR 1/2a badges
9. Click "Adjunctive Tx Not Recommended" → detail panel shows 3 COR 3 recs (all red)
10. Click "Secondary Prevention → Statins" → shows COR 1 statin rec
11. Mobile view: accordion tree shows all new nodes
12. COR 3 filter → across all nodes, only harmful/no-benefit recs shown
13. Search "angioedema" → new node highlighted
14. `npm run build` → TypeScript compiles with no errors
