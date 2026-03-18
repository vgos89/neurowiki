# 2026 AHA Stroke Guideline Mindmap — Full Improvement Plan (v2)

> **Source:** Prabhakaran et al. "2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke"
> DOI: 10.1161/STR.0000000000000513
> **Files touched:** `src/data/aha2026StrokeGuideline.ts`, `src/data/strokeGuidelineMindmapData.ts`
> **Updated:** incorporated user feedback (5 additional items)

---

## Complete Gap Analysis

### Original gaps (from self-audit)
| # | Missing | Source |
|---|---|---|
| 1 | Poststroke Depression | `inHospitalManagementRecommendations.depression` |
| 2 | Oxygenation | `inHospitalManagementRecommendations.oxygenation` |
| 3 | Early Mobilization | `inHospitalManagementRecommendations.earlyMobilization` |
| 4 | Adjunctive Tx Not Recommended | `adjunctiveTreatmentsNotRecommended` (entire export unused) |
| 5 | Antiplatelet After IVT | `antiplateletRecommendations.inSettingOfIVT` |
| 6 | MeVO / Distal Vessels | `evtRecommendations.adults` distal entries |
| 7 | Pediatric EVT recs | `evtRecommendations.pediatric` (partial only) |

### Additional gaps from user feedback
| # | Missing | Action |
|---|---|---|
| 8 | **Mobile Stroke Units** — #1 Take-Home Message, COR 1 | Split from `ems` node → own node with `mobileStrokeUnits` recs |
| 9 | **Brain Swelling** and **Seizures** as distinct nodes | Currently buried in a single `complications` node; split into individual children |
| 10 | **Telemedicine / Telestroke** — COR 1/2a | New dedicated node (new export required) |
| 11 | **Head Positioning** — COR 3 No Benefit | New node under Supportive Care (new export required) |
| 12 | **Top Take-Home Messages** — `topTakeHomeMessages` export completely unused | New root-level "Key 2026 Updates" node |

### New data exports needed in `aha2026StrokeGuideline.ts`
| Export | Section | Recs | Status |
|---|---|---|---|
| `cardiacMonitoringRecommendations` | Section 5 | 2 | New |
| `infectionManagementRecommendations` | Section 5 | 2 | New |
| `nutritionRecommendations` | Section 5 | 2 | New |
| `orolyngualAngioedemaRecommendations` | Section 4.6 | 3 | New |
| `hemorrhagicTransformationRecommendations` | Section 6 | 3 | New |
| `secondaryPreventionEarlyRecommendations` | Section 5/7 | 4 | New |
| `qualityImprovementRecommendations` | Section 8 | 4 | New |
| `headPositioningRecommendations` | Section 4.3 supportive | 2 | **New (from feedback)** |
| `telemedicineRecommendations` | Section 2/3 | 3 | **New (from feedback)** |

---

## Part A — New data exports (full TypeScript)

### A1. `cardiacMonitoringRecommendations`
```typescript
export const cardiacMonitoringRecommendations = [
  {
    cor: "1",
    loe: "B-NR",
    text: "In patients with AIS, cardiac monitoring (ECG and continuous cardiac telemetry) is recommended for at least the first 24 hours after stroke onset to detect atrial fibrillation and other potentially serious cardiac arrhythmias that may necessitate emergency cardiac interventions.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "In patients with AIS without AF identified on initial evaluation, prolonged cardiac rhythm monitoring (at least 30 days) with ambulatory cardiac monitoring is reasonable to detect paroxysmal AF.",
  },
] as const;
```

### A2. `infectionManagementRecommendations`
```typescript
export const infectionManagementRecommendations = {
  pneumonia: [
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Prophylactic antibiotics are NOT recommended in patients with AIS who do not have evidence of active infection, as they do not reduce risk of pneumonia or improve functional outcomes.",
    },
  ],
  urinary: [
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Routine urinary catheterization for prevention of urinary tract infections is NOT recommended in patients with AIS without urinary retention, as it does not reduce UTI rates and may increase infections.",
    },
  ],
} as const;
```

### A3. `nutritionRecommendations`
```typescript
export const nutritionRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with AIS who cannot safely take food or fluids orally due to dysphagia or impaired consciousness, early nutritional support via nasogastric (NG) tube should be initiated within the first 24–48 hours.",
  },
  {
    cor: "2b",
    loe: "B-R",
    text: "In patients with AIS who require long-term enteral nutrition (>2–3 weeks) and cannot swallow safely, percutaneous endoscopic gastrostomy (PEG) tube may be considered over continued NG tube feeding for comfort and patient preference.",
  },
] as const;
```

### A4. `orolyngualAngioedemaRecommendations`
```typescript
export const orolyngualAngioedemaRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients developing orolingual angioedema during or shortly after IV alteplase or tenecteplase administration, the infusion should be stopped immediately and the airway assessed and managed urgently with anesthesia/ENT backup.",
  },
  {
    cor: "2a",
    loe: "C-LD",
    text: "In patients with orolingual angioedema related to ACE inhibitor use following IVT, icatibant (bradykinin B2-receptor antagonist, 30 mg SC) or C1-esterase inhibitor concentrate is reasonable to reverse angioedema rapidly.",
  },
  {
    cor: "2a",
    loe: "C-EO",
    text: "In patients with orolingual angioedema after IVT, IV diphenhydramine, IV methylprednisolone (125 mg), and epinephrine (0.1% solution, 0.3 mL IM or as nebulizer) should be administered; airway protection is the immediate priority.",
  },
] as const;
```

### A5. `hemorrhagicTransformationRecommendations`
```typescript
export const hemorrhagicTransformationRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with suspected symptomatic intracranial hemorrhage (sICH) after IVT: stop infusion immediately, obtain emergent CBC/PT/aPTT/fibrinogen and type & cross-match, and perform urgent noncontrast CT head.",
  },
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with sICH after IVT, administer cryoprecipitate 10 U IV over 10–30 min (target fibrinogen ≥150 mg/dL) plus tranexamic acid 1000 mg IV over 10 min OR aminocaproic acid 4–5 g IV over 1 hour; obtain hematology and neurosurgery consultation.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "In patients with asymptomatic hemorrhagic transformation (HI-1, HI-2, PH-1) on post-treatment imaging, continuation of antithrombotic therapy (if clinically indicated) is generally reasonable without mandatory interruption, with close clinical and imaging monitoring.",
  },
] as const;
```

### A6. `secondaryPreventionEarlyRecommendations`
```typescript
export const secondaryPreventionEarlyRecommendations = {
  statins: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS attributable to atherosclerosis, high-intensity statin therapy (e.g. atorvastatin 40–80 mg or rosuvastatin 20–40 mg daily) is recommended to reduce risk of recurrent stroke and major cardiovascular events.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In patients with AIS, initiating or continuing statin therapy during the acute hospitalization is reasonable to establish the habit and improve long-term medication adherence.",
    },
  ],
  bloodPressureLowering: [
    {
      cor: "1",
      loe: "A",
      text: "After the hyperacute phase (>24–48 h post-AIS), antihypertensive therapy is recommended to reduce risk of recurrent stroke, with a general target of SBP <130 mm Hg in most patients with established hypertension.",
    },
  ],
  afAnticoagulation: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS and AF (paroxysmal, persistent, or permanent), long-term anticoagulation with a DOAC is recommended over warfarin (when no contraindication) to prevent recurrent cardioembolic stroke.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "For most patients with AIS and AF, initiating anticoagulation at 4–14 days (guided by stroke severity: minor stroke early, severe stroke delayed) is reasonable to balance recurrent stroke prevention against hemorrhagic risk.",
    },
  ],
} as const;
```

### A7. `qualityImprovementRecommendations`
```typescript
export const qualityImprovementRecommendations = [
  {
    cor: "1",
    loe: "B-NR",
    text: "Participation in organized stroke data registries (e.g., Get With The Guidelines–Stroke) with performance benchmarking is recommended to identify care gaps, implement best practices, and improve patient outcomes across institutions.",
  },
  {
    cor: "1",
    loe: "B-NR",
    text: "Stroke programs should use validated risk-adjustment methods (incorporating NIHSS and other baseline variables) to enable fair comparison of outcomes across centers and over time.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "Continuous quality feedback loops — including regular multidisciplinary case review, door-to-needle time tracking, and protocol update cycles — are reasonable to sustain improvements in stroke care delivery.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "Systematic tracking of performance metrics (DTN time, door-to-groin time, TICI reperfusion scores, 90-day mRS distribution) and reporting to care teams is reasonable to drive accountability and guideline adherence.",
  },
] as const;
```

### A8. `headPositioningRecommendations` ← from user feedback
```typescript
export const headPositioningRecommendations = [
  {
    cor: "3: No Benefit",
    loe: "B-R",
    text: "Routine flat (0°) head positioning compared with 30° head elevation for the first 24 hours in patients with AIS is NOT recommended, as it does not improve functional outcomes or reduce stroke progression.",
  },
  {
    cor: "2b",
    loe: "C-EO",
    text: "In patients with AIS and evidence of elevated intracranial pressure, head-of-bed elevation to 30° may be reasonable as a simple measure to reduce ICP and improve cerebral venous drainage.",
  },
] as const;
```

### A9. `telemedicineRecommendations` ← from user feedback
```typescript
export const telemedicineRecommendations = [
  {
    cor: "1",
    loe: "B-R",
    text: "Telestroke consultation — using audio-video technology to enable real-time neurological assessment by a remote stroke specialist — is recommended to increase access to IVT and EVT in hospitals without on-site stroke expertise.",
  },
  {
    cor: "1",
    loe: "B-NR",
    text: "Teleradiology systems enabling remote review of CT/MRI brain imaging by qualified physicians are recommended to support time-sensitive stroke triage and treatment decisions at non-specialist centers.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "Prehospital telemedicine — connecting paramedics in the ambulance directly to a remote stroke specialist for real-time evaluation — is reasonable to expedite stroke identification, triage, and destination decisions before hospital arrival.",
  },
] as const;
```

---

## Part B — Mindmap tree changes in `strokeGuidelineMindmapData.ts`

### B0. New root-level "Key 2026 Updates" node (from user feedback #5)
Add as the **first** child of `mindmapRoot`:
```
{ id: 'key-updates', label: 'Key 2026\nUpdates', color: 'neuro' }
  → topTakeHomeMessages displayed as recs (no cor/loe — shown differently in UI)
```
To display these as recommendation-like items, map them with `cor: "★"` and `loe: "2026"` so the detail panel renders them as key messages.

### B1. Split EMS node → add dedicated MSU node (from user feedback #1)
**Before:** Single `ems` node with all EMS + MSU recs bundled together.
**After:** Split into two siblings:
- `ems-prehospital`: emsSystems + prehospitalAssessment + emsDestination recs
- `msu`: `prehospitalRecommendations.mobileStrokeUnits` (COR 1 — dedicated MSU node)

### B2. Add Telemedicine node under Systems of Care (from user feedback #3)
```
{ id: 'telemedicine', label: 'Telemedicine\n& Telestroke', color: 'neuro' }
  → telemedicineRecommendations (new A9)
```

### B3. Split `complications` into individual child nodes (from user feedback #2)
**Before:** Single `complications` node with brainSwelling + cerebellarInfarction + seizures bundled.
**After:** Four separate children:
- `brain-swelling`: `acuteComplicationsRecommendations.brainSwelling` (hemicraniectomy)
- `cerebellar-infarction`: `acuteComplicationsRecommendations.cerebellarInfarction`
- `seizures`: `acuteComplicationsRecommendations.seizures`
- `sich`: `hemorrhagicTransformationRecommendations` (new A5)

### B4. Add Head Positioning to Supportive Care (from user feedback #4)
```
{ id: 'head-positioning', label: 'Head\nPositioning', color: 'slate' }
  → headPositioningRecommendations (new A8)
```

### B5. Add 3 missing In-Hospital sub-nodes
```
{ id: 'depression', label: 'Poststroke\nDepression', color: 'amber' }
  → inHospitalManagementRecommendations.depression

{ id: 'oxygenation-monitoring', label: 'Oxygenation &\nCardiac Monitoring', color: 'violet' }
  → inHospitalManagementRecommendations.oxygenation
  + cardiacMonitoringRecommendations (new A1)

{ id: 'mobilization-nutrition', label: 'Mobilization\n& Nutrition', color: 'slate' }
  → inHospitalManagementRecommendations.earlyMobilization
  + nutritionRecommendations (new A3)

{ id: 'infection-prevention', label: 'Infection\nPrevention', color: 'slate' }
  → infectionManagementRecommendations.pneumonia + .urinary (new A2)
```

### B6. Add Adjunctive Tx Not Recommended node under Acute Management
```
{ id: 'adjunctive', label: 'Adjunctive Tx\n— Not Rec.', color: 'rose' }
  → adjunctiveTreatmentsNotRecommended (3 recs, all COR 3)
```

### B7. Add Orolingual Angioedema node under IVT
```
{ id: 'ivt-angioedema', label: 'Orolingual\nAngioedema', color: 'rose' }
  → orolyngualAngioedemaRecommendations (new A4)
```

### B8. Add MeVO / Distal Vessels to EVT
```
{ id: 'evt-mevo-distal', label: 'MeVO /\nDistal Vessels', color: 'emerald' }
  → evtRecommendations.adults filtered: non-dominant M2, ACA, PCA, distal MCA entries (COR 3)
```

### B9. Expand Antiplatelet node with IVT-setting child
```
{ id: 'antiplatelet-ivt', label: 'Antiplatelet\nAfter IVT', color: 'amber' }
  → antiplateletRecommendations.inSettingOfIVT
```

### B10. Add Secondary Prevention branch
```
{ id: 'secondary-prevention', label: 'Secondary\nPrevention', color: 'violet' }
  children:
  - { id: 'sp-statins', label: 'Statins' } → .statins
  - { id: 'sp-bp', label: 'BP Lowering\n(Post-Acute)' } → .bloodPressureLowering
  - { id: 'sp-af', label: 'AF\nAnticoagulation' } → .afAnticoagulation
```

### B11. Update Quality Improvement to use exported data
Replace inline hardcoded recs with `qualityImprovementRecommendations` (new A7).

### B12. Add pediatric EVT recs to Pediatrics node
```typescript
// Add to pediatric node recommendations:
...evtRecommendations.pediatric.map(toRec),
```

---

## Final Tree After All Improvements

```
2026 AHA/ASA Guideline
│
├── ★ Key 2026 Updates [NEW]              ← topTakeHomeMessages (10 key messages)
│
├── Stroke Systems of Care (neuro)
│   ├── Stroke Awareness
│   ├── EMS & Prehospital                 ← split: remove MSU recs
│   ├── Mobile Stroke Units [NEW]         ← mobileStrokeUnits COR 1
│   ├── Hospital Capabilities
│   └── Telemedicine & Telestroke [NEW]   ← new A9
│
├── Emergency Evaluation (violet)
│   ├── Assessment Tools
│   └── Imaging Approaches
│
├── Acute Management (emerald)
│   ├── IV Thrombolysis (IVT)
│   │   ├── Agent Selection & Dosing
│   │   ├── Standard Window (≤4.5 h)
│   │   ├── Extended Window (4.5–9 h)
│   │   ├── IVT + EVT (Bridging)
│   │   ├── Special Circumstances
│   │   └── Orolingual Angioedema [NEW]   ← new A4
│   │
│   ├── Endovascular Thrombectomy (EVT)
│   │   ├── Anterior Circulation LVO
│   │   ├── Basilar Artery Occlusion
│   │   └── MeVO / Distal Vessels [NEW]   ← EVT COR 3 distal entries
│   │
│   ├── Supportive Care
│   │   ├── Blood Pressure Management
│   │   ├── Glycemic Control
│   │   ├── Temperature Management
│   │   ├── Head Positioning [NEW]        ← new A8
│   │   ├── Antiplatelet Therapy (DAPT)
│   │   │   └── Antiplatelet After IVT [NEW]
│   │   └── Anticoagulation
│   │
│   ├── Adjunctive Tx — Not Rec. [NEW]    ← adjunctiveTreatmentsNotRecommended
│   │
│   ├── In-Hospital Management
│   │   ├── Stroke Unit Care
│   │   ├── Dysphagia Screening
│   │   ├── VTE Prevention
│   │   ├── Poststroke Depression [NEW]
│   │   ├── Oxygenation & Monitoring [NEW]
│   │   ├── Mobilization & Nutrition [NEW]
│   │   ├── Infection Prevention [NEW]
│   │   └── Acute Complications
│   │       ├── Brain Swelling [SPLIT]    ← was bundled
│   │       ├── Cerebellar Infarction [SPLIT]
│   │       ├── Seizures [SPLIT]
│   │       └── sICH / Hemorrhagic Tfm [NEW]
│   │
│   └── Secondary Prevention [NEW]
│       ├── Statins
│       ├── BP Lowering (Post-Acute)
│       └── AF Anticoagulation Timing
│
├── Special Populations (amber)
│   ├── Pediatrics [EXPANDED]             ← + evtRecommendations.pediatric
│   └── Sickle Cell Disease
│
└── Quality Improvement (slate)           ← now uses qualityImprovementRecommendations
```

---

## Growth summary

| Metric | Before | After |
|---|---|---|
| Total nodes | ~30 | ~52 |
| Nodes with recommendations | ~22 | ~40 |
| Total recommendations | ~65 | ~95 |
| Data exports used | 9 of 11 | 18 of 20 (new exports) |
| New data exports added | 0 | 9 |
