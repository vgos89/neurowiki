# API Integration Report — Heidelberg Bleeding & Boston Criteria 2.0

**Source:** Radiopaedia.org (fetched 2026-02-03)  
**Phase 1 deliverable:** Extracted content for both calculators.

---

## Heidelberg Bleeding Classification — Extracted Content

**Scope:** The Heidelberg classification categorizes **intracranial hemorrhage occurring after ischemic stroke and reperfusion therapy** (tPA or thrombectomy)—i.e. hemorrhagic transformation (HT), not spontaneous ICH location.

### Classification System

| Class | Subtype | Description |
|-------|---------|-------------|
| **1** | 1a (HI1) | Hemorrhagic transformation of infarcted tissue: scattered small petechiae, no mass effect |
| **1** | 1b (HI2) | Confluent petechiae, no mass effect |
| **1** | 1c (PH1) | Parenchymal hematoma within infarcted tissue, &lt;30% of infarct, no substantive mass effect |
| **2** | PH2 | Intracerebral hemorrhage within and beyond infarcted tissue: hematoma ≥30% of infarct, obvious mass effect |
| **3** | 3a | Parenchymal hematoma remote from infarcted brain tissue |
| **3** | 3b | Intraventricular hemorrhage |
| **3** | 3c | Subarachnoid hemorrhage |
| **3** | 3d | Subdural hemorrhage |

HI = hemorrhagic infarction; PH = parenchymal hematoma (ECASS terminology).

### Clinical Significance

- **Symptomatic ICH (SICH):** New hemorrhage + (≥4 pt NIHSS increase, or ≥2 pt in one NIHSS subcategory, or leading to intubation/hemicraniectomy/EVD) and no other explanation.
- **Asymptomatic ICH (aSICH):** New hemorrhage without substantive neurologic change; no implications for prognosis or management change.
- **Relatedness to intervention:** Definite (e.g. procedural complication), Probable (treatment within 24h and class 1c or 2), Possible (treatment within 24h and class 1a/1b), Unrelated (no intervention in 24h prior).

### Original Reference

von Kummer R, Broderick J, Campbell B et al. The Heidelberg Bleeding Classification. Stroke. 2015;46(10):2981-6. doi:10.1161/strokeaha.115.010049

### Imaging

Brain imaging within 48 hours of reperfusion and as needed for new symptoms. CT or MRI; anatomic description then classification.

---

## Boston Criteria 2.0 for CAA — Extracted Content

**Source:** Charidimou A et al. Lancet Neurol 2022. Boston Criteria Version 2.0.

### Diagnostic Categories

- **Definite CAA:** Full brain post-mortem — spontaneous ICH, TFNE, convexity SAH, or cognitive impairment/dementia + severe CAA with vasculopathy + no other diagnostic lesion.
- **Probable CAA with supporting pathology:** Clinical + pathological tissue (evacuated hematoma or cortical biopsy) with some CAA, no other lesion.
- **Probable CAA (imaging-based):** Age ≥50, presentation (spontaneous ICH, TFNE, or cognitive impairment/dementia). MRI: **Either** (1) ≥2 strictly lobar hemorrhagic lesions (ICH, microbleeds, cortical superficial siderosis, or convexity SAH; multiple foci count as multiple) **OR** (2) one lobar hemorrhagic lesion + one white matter feature (severe centrum semiovale PVS &gt;20 in one hemisphere, OR multispot WMH &gt;10 subcortical FLAIR dots bilaterally). **Absence of:** any deep hemorrhagic lesions on T2* **and** other cause of hemorrhage. Cerebellar hemorrhage not counted as lobar or deep.
- **Possible CAA:** Age ≥50, same presentation. MRI: **Either** (1) one strictly lobar hemorrhagic lesion **OR** (2) one white matter feature. **Absence of:** deep hemorrhagic lesions and other cause.

### Other Cause of Hemorrhagic Lesions (Exclusions)

Antecedent head trauma, hemorrhagic transformation of ischemic stroke, brain AVM, hemorrhagic tumor, warfarin with INR &gt;3, vasculitis.

### Age Criteria

≥50 years for probable and possible CAA (Boston 2.0).

### Key Updates in 2.0

- Incorporation of leptomeningeal and white matter features (centrum semiovale PVS, multispot WMH).
- One lobar lesion + one white matter feature can support probable CAA.
- Improved sensitivity/specificity vs modified Boston in validated cohorts (Lancet Neurol 2022).

### Original Reference

Charidimou A, Boulouis G, Frosch M et al. The Boston Criteria Version 2.0 for Cerebral Amyloid Angiopathy: A Multicentre, Retrospective, MRI–neuropathology Diagnostic Accuracy Study. Lancet Neurol. 2022;21(8):714-25. doi:10.1016/s1474-4422(22)00208-3

---

## Medical Scientist Validation Summary

**Heidelberg:** Use only after reperfusion therapy (tPA or thrombectomy) for hemorrhagic transformation classification. Not for spontaneous ICH. Calculator: single selection for class (1a/1b/1c/2/3a/3b/3c/3d); optional symptomatic/asymptomatic and relatedness for context.

**Boston 2.0:** Age ≥50; check exclusions first; then lobar hemorrhagic lesions count and white matter features. Definite/probable with pathology = pathology path; probable/possible = imaging path. Cerebellar hemorrhage does not count as lobar or deep.

---

## Implementation Summary (Completed)

- **Heidelberg Bleeding Classification:** Data module `heidelbergBleedingData.ts`; page `HeidelbergBleedingCalculator.tsx`. Class selection (1a, 1b, 1c, 2, 3a–3d); optional symptomatic (SICH) vs asymptomatic. No pre-selection; interpretation and management note per class. Route: `/calculators/heidelberg-bleeding-classification`.
- **Boston Criteria 2.0 for CAA:** Data module `bostonCriteriaCaaData.ts`; page `BostonCriteriaCaaCalculator.tsx`. Age (≥50), pathology (definite/supporting), qualifying presentation, lobar hemorrhagic lesions (0/1/≥2), white matter feature, deep hemorrhagic lesions, other cause. Diagnosis: definite-CAA, probable-CAA-supporting-pathology, probable-CAA, possible-CAA, unlikely-CAA, excluded. Anticoagulation risk badge and recommendations. Route: `/calculators/boston-criteria-caa`.
- **Integration:** Both added to Calculators index (vascular category); routeMeta, sitemapRoutes, contentStatus updated; App.tsx routes and lazy imports added. Internal links: Boston CAA → HAS-BLED, ICH Score.
