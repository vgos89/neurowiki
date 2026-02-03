# 4-Calculator Build Plan — Multi-Agent Project

**Scope:** ABCD² Score, HAS-BLED Score, RoPE Score, Glasgow Coma Scale (GCS)  
**Status:** Planning complete — implementation pending approval  
**Date:** February 2026

---

# PHASE 1: MEDICAL SCIENTIST — CLINICAL VALIDATION & EVIDENCE BASE

## CALCULATOR 1: ABCD² Score — Medical Validation

**Scoring verified:** Yes. Criteria and point values match Johnston et al. Lancet 2007 and AHA/ASA TIA guidelines.

- **Age ≥60:** 1 point  
- **BP ≥140/90 mmHg:** 1 point  
- **Clinical features:** Unilateral weakness 2, Speech impairment without weakness 1, Other 0  
- **Duration:** ≥60 min 2, 10–59 min 1, <10 min 0  
- **Diabetes:** 1 point  
- **Total:** 0–7 points  

**Interpretation accurate:** Yes. Widely cited 2-day stroke risks: Low (0–3) ~1%, Moderate (4–5) ~4.1%, High (6–7) ~8.1%. Include 2-day as primary; 7-day and 90-day can be added as secondary (e.g. ~5% at 7d, ~10% at 90d for overall TIA cohort) with a note that these are cohort estimates, not score-specific in the original derivation.

**Evidence base:** Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-292. AHA/ASA TIA/Stroke guidelines reference ABCD² for risk stratification. Multiple validation cohorts (e.g. ABCD²-I with imaging).

**Clinical context:** Use after TIA (symptoms resolved) to stratify short-term stroke risk and guide admission vs urgent outpatient workup. High score → admit; low score → urgent outpatient within 24–48h. Does not replace clinical judgment or imaging (e.g. DWI+ increases risk).

**Important warnings:**  
- All TIA patients need urgent evaluation regardless of score.  
- ABCD² does not include imaging; consider noting “ABCD²-I” if MRI DWI is available (adds predictive value).  
- Do not use to delay workup in low-risk patients.

**Integration opportunities:** Link to stroke/TIA guide, acute stroke management, and (if built) CHA2DS2-VASc for AF workup after TIA.

**Recommended content:**  
- Blurb: “The ABCD² score predicts 2-day stroke risk after TIA using age, BP, clinical features, duration, and diabetes. It helps triage admission vs urgent outpatient workup.”  
- Pearl: “Even ‘low risk’ (0–3) needs urgent workup within 48h; high risk (6–7) warrants admission.”  
- Reference: Johnston et al. Lancet 2007; AHA/ASA TIA guidelines.

---

## CALCULATOR 2: HAS-BLED Score — Medical Validation

**Scoring verified:** Yes. Nine items, 1 point each, per Pisters et al. Chest 2010.

- Hypertension (SBP >160): 1  
- Abnormal renal function (dialysis, transplant, Cr >2.26 mg/dL): 1  
- Abnormal liver function (cirrhosis or bilirubin >2× or AST/ALT/AP >3×): 1  
- Stroke history: 1  
- Prior major bleeding or predisposition: 1  
- Labile INR (if on warfarin, TTR <60%): 1  
- Elderly (>65): 1  
- Drugs (antiplatelet or NSAIDs): 1  
- Alcohol (≥8 drinks/week): 1  

**Interpretation accurate:** Yes. Event rates (major bleeding per 100 patient-years) from derivation: 0 low, 1–2 moderate, 3 high, ≥4 very high. Exact figures (e.g. 1.13, 1.02, 1.88, 3.74, 8.70) can be shown with source note.

**Labile INR:** Make conditional. Show “Labile INR (warfarin, TTR <60%)” and only add 1 point when user indicates both “on warfarin” and “labile INR” (or when “Not on warfarin” selected, gray out / 0 points). Prevents inappropriate use in DOAC-only patients.

**Critical messaging:** High HAS-BLED does **not** mean “do not anticoagulate.” It means: (1) address modifiable risk factors (BP, alcohol, NSAIDs, labile INR), (2) closer monitoring, (3) consider patient preference. Anticoagulation decisions remain driven by stroke risk (e.g. CHA2DS2-VASc) and shared decision-making. Display prominent disclaimer: “HAS-BLED estimates bleeding risk; it does not contraindicate anticoagulation. Use to address modifiable risks and guide monitoring.”

**Evidence base:** Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-1100. ESC/EHRA AF guidelines; AHA/ASA stroke prevention.

**Recommended content:**  
- Blurb: “HAS-BLED estimates major bleeding risk in patients on or considered for anticoagulation. Use to address modifiable risks and plan monitoring—not to withhold anticoagulation.”  
- Pearl: “High HAS-BLED → fix what you can (BP, alcohol, NSAIDs, INR control) and monitor; don’t withhold anticoagulation for stroke prevention alone.”  
- Reference: Pisters et al. Chest 2010.

---

## CALCULATOR 3: RoPE Score — Medical Validation

**Scoring verified:** Yes. Kent et al. Stroke 2013: 10 points total.

- **Age:** <30 → 5, 30–39 → 4, 40–49 → 3, 50–59 → 2, 60–69 → 1, ≥70 → 0  
- **No hypertension:** 1  
- **No diabetes:** 1  
- **No stroke/TIA before index event:** 1  
- **Nonsmoker:** 1  
- **Cortical infarct on imaging:** 1  

**Interpretation accurate:** Yes. PFO-attributable fraction (PAR%) by score: 0–3 → 0%, 4 → 38%, 5 → 34%, 6 → 62%, 7 → 72%, 8 → 84%, 9–10 → 88%. Slight non-monotonicity at 4–5 is from the original paper; keep as published.

**Explain “PFO-attributable risk”:** Short phrase: “Percentage of the cryptogenic stroke that is likely attributable to the PFO (rather than other causes). Higher RoPE = more likely PFO is causative; useful when considering PFO closure.”

**When to use:** After cryptogenic stroke (no other cause found), when PFO is detected or suspected, to gauge likelihood that PFO is causal—especially in younger patients. Informs discussion of PFO closure (RESPECT, CLOSE, REDUCE). Link to PFO closure trials in “Evidence” or “Learn more.”

**Evidence base:** Kent DM, et al. An index to identify stroke-related vs incidental patent foramen ovale in cryptogenic stroke. Stroke. 2013;44(5):1449-1452. RESPECT, CLOSE, REDUCE for closure evidence.

**Recommended content:**  
- Blurb: “RoPE estimates the proportion of a cryptogenic stroke likely attributable to a PFO. Higher scores support PFO as causative and may inform closure discussion.”  
- Pearl: “Young age and cortical infarct without vascular risk factors increase PFO-attributable fraction; use with imaging and cardiology input.”  
- Reference: Kent et al. Stroke 2013; link to closure trials.

---

## CALCULATOR 4: Glasgow Coma Scale (GCS) — Medical Validation

**Scoring verified:** Yes. Standard GCS: Eye (1–4), Verbal (1–5), Motor (1–6); total 3–15. Definitions match Teasdale & Jennett, Lancet 1974 and standard teaching.

**Not testable:**  
- **Intubated:** Verbal not testable → display as “V = NT” or “T” and show total as e.g. “GCS 10T” (E+V+M with V = NT). Do not add a numeric value for verbal when NT; total is “X + T + Y” with note “T = intubated (verbal not testable).”  
- **Eye trauma/closed:** Eye not testable → “C” (closed). Display e.g. “GCS C5M6” or “E=C (closed), V=5, M=6” with note.

**Interpretation:** 14–15 mild, 9–13 moderate, 3–8 severe/coma; GCS ≤8 often indicates need for airway protection/intubation. Keep bands as specified.

**Link to ICH Score:** ICH Score uses GCS (13–15 = 0, 5–12 = 1, 3–4 = 2). Add “Used in ICH Score” and link to ICH Score calculator.

**GCS vs NIHSS:** One-line teaching: “GCS = global consciousness (trauma, coma, ICU); NIHSS = focal stroke severity. Use GCS when assessing level of consciousness; use NIHSS in acute stroke for deficit severity.”

**Evidence base:** Teasdale G, Jennett B. Assessment of coma and impaired consciousness. Lancet. 1974;2(7872):81-84. Universal standard; used in trauma, ICH Score, many severity scores.

**Recommended content:**  
- Blurb: “GCS assesses level of consciousness (eye, verbal, motor). Used in trauma, neuro ICU, and stroke (e.g. ICH Score).”  
- Pearl: “GCS ≤8 often warrants airway protection; document ‘T’ when verbal not testable (e.g. intubated).”  
- Reference: Teasdale & Jennett 1974; link to ICH Score.

---

# PHASE 2: CALCULATOR ENGINEER — SCORING LOGIC & ARCHITECTURE

## Shared Template

All four can use a **common calculator shell**: header (title, optional icon, live score), item section (questions), result section (score + interpretation + evidence), actions (Reset, Copy to EMR). Unique per calculator: input types (radio vs checkbox vs dropdown), scoring function, interpretation table, and optional special handling (GCS NT, HAS-BLED labile INR).

**Reusable:**  
- Layout (sticky header, scrollable items, result card, action bar)  
- Result display (score, risk band, color, interpretation text)  
- Copy/reset, analytics hook, favorites  
- Accessibility (labels, live region for score)

**Calculator-specific:**  
- Input components (radio groups, checkboxes, dropdown)  
- Scoring function and result type  
- Interpretation copy and risk bands

## Data Models (TypeScript)

```typescript
// ---- ABCD² ----
interface ABCD2Inputs {
  age: 'under60' | '60plus';
  bloodPressure: 'normal' | 'elevated';
  clinicalFeatures: 'weakness' | 'speech' | 'other';
  duration: 'under10' | '10to59' | '60plus';
  diabetes: boolean;
}
interface ABCD2Result {
  score: number;
  risk: 'low' | 'moderate' | 'high';
  twoDayRiskPercent: number;
  sevenDayRiskPercent?: number;
  ninetyDayRiskPercent?: number;
}

// ---- HAS-BLED ----
interface HASBLEDInputs {
  hypertension: boolean;
  abnormalRenal: boolean;
  abnormalLiver: boolean;
  strokeHistory: boolean;
  priorBleeding: boolean;
  labileINR: boolean;        // only applicable if on warfarin
  onWarfarin: boolean;      // if false, labileINR ignored
  elderly: boolean;
  drugs: boolean;
  alcohol: boolean;
}
interface HASBLEDResult {
  score: number;
  risk: 'low' | 'moderate' | 'high' | 'very_high';
  bleedsPer100PatientYears: number;
}

// ---- RoPE ----
interface RoPEInputs {
  ageBand: 'under30' | '30_39' | '40_49' | '50_59' | '60_69' | '70plus';
  noHypertension: boolean;
  noDiabetes: boolean;
  noPriorStrokeTIA: boolean;
  nonsmoker: boolean;
  corticalInfarct: boolean;
}
interface ROPEResult {
  score: number;
  pfoAttributablePercent: number;
}

// ---- GCS ----
interface GCSInputs {
  eye: 1 | 2 | 3 | 4;
  verbal: 1 | 2 | 3 | 4 | 5;
  motor: 1 | 2 | 3 | 4 | 5 | 6;
  verbalNotTestable?: boolean;  // e.g. intubated
  eyeNotTestable?: boolean;     // e.g. closed/swollen
}
interface GCSResult {
  total: number;
  display: string;           // e.g. "15" or "10T"
  severity: 'mild' | 'moderate' | 'severe' | 'deep_coma';
  eye: number;
  verbal: number | 'T';
  motor: number;
}
```

## Scoring Pseudocode

**ABCD²**
```text
score = 0
if age === '60plus' then score += 1
if bloodPressure === 'elevated' then score += 1
if clinicalFeatures === 'weakness' then score += 2
else if clinicalFeatures === 'speech' then score += 1
if duration === '60plus' then score += 2
else if duration === '10to59' then score += 1
if diabetes then score += 1
risk = score <= 3 ? 'low' : score <= 5 ? 'moderate' : 'high'
twoDayRiskPercent = low ? 1.0 : moderate ? 4.1 : 8.1
```

**HAS-BLED**
```text
score = 0
for each boolean in [hypertension, abnormalRenal, abnormalLiver, strokeHistory, priorBleeding, elderly, drugs, alcohol]: if true then score += 1
if onWarfarin and labileINR then score += 1
risk = score 0 ? 'low' : score 1|2 ? 'moderate' : score 3 ? 'high' : 'very_high'
bleedsPer100 = lookup table from Pisters et al.
```

**RoPE**
```text
score = agePoints[ageBand]  // 5,4,3,2,1,0
if noHypertension then score += 1
if noDiabetes then score += 1
if noPriorStrokeTIA then score += 1
if nonsmoker then score += 1
if corticalInfarct then score += 1
pfoAttributablePercent = lookup table Kent et al. (0–3→0%, 4→38%, 5→34%, 6→62%, 7→72%, 8→84%, 9–10→88%)
```

**GCS**
```text
total = eye + (verbalNotTestable ? 0 : verbal) + motor
display = verbalNotTestable ? `${eye + motor}T` or "E+V+M (V=NT)" per design
severity = total 14–15 ? 'mild' : 9–13 ? 'moderate' : 4–8 ? 'severe' : 'deep_coma'
```

## Validation

- **ABCD²:** All 5 items required; single selection per item.  
- **HAS-BLED:** All 9 items required (labile INR only when on warfarin).  
- **RoPE:** Age required; 5 checkboxes.  
- **GCS:** E, V, M required; if “Not testable” for V or E, store and display accordingly (no numeric V/E in total when NT).

**Incomplete data:** Show score only when all required inputs set; else show “Complete all fields” or partial score with disclaimer per product choice.

## State & Export

- **Session:** Optional sessionStorage for in-progress inputs (restore on return).  
- **Export:** “Copy to EMR” for each calculator (score + inputs + interpretation in plain text).  
- **Analytics:** useCalculatorAnalytics(calculatorId); trackResult(score or risk band) on copy or on valid result.

---

# PHASE 3: CONTENT WRITER — EDUCATIONAL TEXT

## ABCD² Score

- **Title:** ABCD² Score Calculator — TIA Stroke Risk  
- **What it is:** The ABCD² score predicts short-term stroke risk after a TIA. It uses age, BP, clinical features, symptom duration, and diabetes to stratify 2-day risk and guide admission vs urgent outpatient workup.  
- **When to use:** After a TIA (symptoms resolved); to stratify 2-day (and optionally 7-day, 90-day) risk; to support admission (high risk) vs urgent outpatient (low risk) within 24–48h.  
- **Interpretation:** Low (0–3) ~1% 2-day → urgent outpatient within 48h. Moderate (4–5) ~4.1% → consider admission or same-day/urgent evaluation. High (6–7) ~8.1% → admit for workup and secondary prevention.  
- **Pearl:** Even “low risk” needs urgent workup; high risk warrants admission. ABCD² does not include imaging (consider ABCD²-I if DWI available).  
- **Evidence:** Johnston et al. Lancet 2007. AHA/ASA TIA guidelines.  
- **Limitations:** No imaging; does not replace clinical judgment; all TIA patients need urgent evaluation.

## HAS-BLED Score

- **Title:** HAS-BLED Score Calculator — Bleeding Risk on Anticoagulation  
- **What it is:** HAS-BLED estimates 1-year major bleeding risk in patients on or considered for anticoagulation (e.g. AF). It helps identify modifiable risks and guide monitoring—not whether to withhold anticoagulation.  
- **When to use:** In AF or other indications for anticoagulation; to assess bleeding risk and address BP, alcohol, NSAIDs, labile INR; to inform monitoring and patient discussion.  
- **Interpretation:** 0 low, 1–2 moderate, 3 high, ≥4 very high (major bleeds per 100 patient-years). High score → address modifiable factors and monitor; do not use alone to withhold anticoagulation.  
- **Pearl:** High HAS-BLED → fix modifiable risks and monitor; stroke risk (e.g. CHA2DS2-VASc) and shared decision-making drive anticoagulation.  
- **Evidence:** Pisters et al. Chest 2010. ESC/EHRA AF guidelines.  
- **Limitations:** Predicts bleeding risk only; labile INR applies to warfarin; does not replace clinical judgment.

## RoPE Score

- **Title:** RoPE Score Calculator — PFO-Attributable Risk in Cryptogenic Stroke  
- **What it is:** The RoPE score estimates the proportion of a cryptogenic stroke likely attributable to a PFO. Higher scores suggest PFO is more likely causative and can inform PFO closure discussion.  
- **When to use:** After cryptogenic stroke when PFO is detected or suspected; to gauge PFO-attributable fraction; in discussion of PFO closure (RESPECT, CLOSE, REDUCE).  
- **Interpretation:** 0–3: 0% PFO-attributable; 4–5: ~34–38%; 6: 62%; 7: 72%; 8: 84%; 9–10: 88%. Higher score supports PFO as causal.  
- **Pearl:** Younger age, cortical infarct, and absence of vascular risk factors increase PFO-attributable fraction; use with imaging and cardiology.  
- **Evidence:** Kent et al. Stroke 2013; RESPECT, CLOSE, REDUCE.  
- **Limitations:** For cryptogenic stroke only; does not replace multidisciplinary decision-making for closure.

## Glasgow Coma Scale (GCS)

- **Title:** Glasgow Coma Scale (GCS) Calculator  
- **What it is:** The GCS assesses level of consciousness using eye, verbal, and motor responses. It is the standard in trauma, neuro ICU, and many severity scores (e.g. ICH Score).  
- **When to use:** Altered consciousness (trauma, stroke, ICH, sepsis, etc.); to communicate severity; GCS ≤8 often indicates need for airway protection.  
- **Interpretation:** 14–15 mild, 9–13 moderate, 3–8 severe/coma; 3 = deep coma. Document “T” when verbal not testable (e.g. intubated).  
- **Pearl:** GCS ≤8 → consider intubation; use “T” for verbal when intubated. GCS for consciousness; NIHSS for focal stroke severity.  
- **Evidence:** Teasdale & Jennett, Lancet 1974. Link to ICH Score.  
- **Limitations:** Confounders (e.g. sedation, aphasia, intubation); document not-testable components.

---

# PHASE 4: UI ARCHITECT — INTERFACE DESIGN

## Layout: Single-Page Template (All 4)

- **Header:** Calculator name, optional icon, **live score** (updates as inputs change). Sticky on scroll.  
- **Items section:** All questions on one page; logical grouping (e.g. GCS: Eye, Verbal, Motor).  
- **Results section:** Score, risk band (badge), interpretation text, optional evidence line.  
- **Actions:** Reset, Copy to EMR (primary), optional Close if embedded in modal.

## Input Types

- **ABCD²:** Radio groups (age, BP, clinical features, duration); checkbox (diabetes).  
- **HAS-BLED:** Checkboxes for 9 items; optional “On warfarin?” to enable/disable Labile INR.  
- **RoPE:** Age dropdown (6 bands) + 5 checkboxes.  
- **GCS:** Three radio groups (Eye 1–4, Verbal 1–5, Motor 1–6); optional “Verbal not testable (e.g. intubated)” and “Eye not testable (e.g. closed)” with clear display (e.g. 10T).

## Real-Time Scoring

- Show score (and risk band) as soon as required inputs are complete. No separate “Calculate” button unless product prefers it; recommend live update for consistency with ICH/NIHSS.

## Results Display

- Large score (e.g. “5 / 7” or “HAS-BLED: 3”).  
- Risk badge: Low (green), Moderate (amber), High (red), Very high (dark red).  
- 2–3 lines interpretation + “Copy to EMR” text block.  
- One-line evidence reference.

## Color Coding

- Low risk: green (e.g. #10b981).  
- Moderate: amber (#f59e0b).  
- High: red (#ef4444).  
- Very high: dark red (#b91c1c).

---

# PHASE 5: MOBILE-FIRST DEVELOPER — MOBILE OPTIMIZATION

- **Touch targets:** All controls ≥44px; generous padding for radio/checkbox.  
- **Single page:** No pagination; scroll only. Sticky header keeps score visible.  
- **Form controls:** Large radios/checkboxes; native-like dropdown for RoPE age on mobile.  
- **Results:** Result card visible after short scroll or in sticky summary; “Copy to EMR” prominent.  
- **Performance:** Scoring logic synchronous and fast (<100ms); no layout thrash.

---

# PHASE 6: ACCESSIBILITY SPECIALIST — WCAG COMPLIANCE

- **Labels:** Every input has a visible label; associate via `htmlFor`/`id` or `aria-label` where needed.  
- **Grouping:** Radio groups in `<fieldset>` with `<legend>`.  
- **Live region:** Score/result in a live region (`aria-live="polite"`) so updates are announced.  
- **Keyboard:** Full tab order; Space/Enter to toggle; no mouse-only actions.  
- **Focus:** Visible focus ring (e.g. 2px outline).  
- **Contrast:** Risk colors and text meet WCAG AA.  
- **Screen reader:** Complete flow (all items → result → copy) without mouse.

---

# PHASE 7: SEO SPECIALIST — DISCOVERABILITY

**URLs (preferred):**

- `/calculators/abcd2-score`  
- `/calculators/has-bled-score`  
- `/calculators/rope-score`  
- `/calculators/glasgow-coma-scale`

**Target keywords:** ABCD2 calculator, TIA stroke risk; HAS-BLED calculator, bleeding risk anticoagulation; RoPE score calculator, PFO stroke; Glasgow Coma Scale calculator, GCS calculator.

**Meta (examples):**

- **ABCD²:** Title: “ABCD² Score Calculator — TIA Stroke Risk | Neurowiki.” Description: “Calculate 2-day stroke risk after TIA with the ABCD² score. Free calculator for residents with interpretation and evidence.”  
- **HAS-BLED:** Title: “HAS-BLED Score Calculator — Bleeding Risk | Neurowiki.” Description: “Estimate major bleeding risk on anticoagulation. Modifiable risks and monitoring—not a reason to withhold anticoagulation.”  
- **RoPE:** Title: “RoPE Score Calculator — PFO Stroke Risk | Neurowiki.” Description: “PFO-attributable fraction in cryptogenic stroke. Kent et al.; supports PFO closure discussion.”  
- **GCS:** Title: “Glasgow Coma Scale (GCS) Calculator | Neurowiki.” Description: “Standard GCS for consciousness. Eye, verbal, motor; intubated and not-testable handling. Links to ICH Score.”

**Schema:** SoftwareApplication, name, applicationCategory HealthApplication, offers price 0, for each calculator.

---

# PHASE 8: DATA ARCHITECT — DATA MODELS & STORAGE

- **Calculator definitions:** Each calculator has an id, slug, name, category (e.g. vascular/general), input schema, scoring function reference, interpretation table, evidence reference. Stored in code (e.g. `*ScoreData.ts`) unless a CMS is added later.  
- **Session:** Optional sessionStorage key `neurowiki-calc-{slug}` for current inputs (restore on load).  
- **Analytics:** useCalculatorAnalytics(slug); event on result/copy (score or band); no PHI.  
- **Export:** Copy-to-EMR string built from inputs + score + interpretation; no server storage.

---

# CONSOLIDATED IMPLEMENTATION PLAN

## 1. Medical Validation

- ABCD²: Verified (Johnston et al.; include 2-day primary; 7/90-day optional).  
- HAS-BLED: Verified (Pisters et al.); labile INR conditional on warfarin; disclaimer on anticoagulation.  
- RoPE: Verified (Kent et al.); PFO-attributable table as published.  
- GCS: Verified (Teasdale & Jennett); NT handling for verbal/eye; link to ICH Score.

## 2. Technical Architecture

**Shared:**

- Reuse patterns from ICH/NIHSS: sticky header, single-page form, result card, Copy/Reset, analytics, favorites.  
- Optional shared `CalculatorShell` (title, score strip, children for items + result + actions).

**Calculator-specific:**

- **Data modules:** `abcd2ScoreData.ts`, `hasBledScoreData.ts`, `ropeScoreData.ts`, `gcsScoreData.ts` (inputs types, scoring function, interpretation tables, citations).  
- **Pages:** `Abcd2ScoreCalculator.tsx`, `HasBledScoreCalculator.tsx`, `RopeScoreCalculator.tsx`, `GlasgowComaScaleCalculator.tsx`.

## 3. Content

- Educational copy for all 4 (Phase 3) in data modules or page components; pearls and evidence in each.

## 4. UI/UX

- Single-page layout; radio/checkbox/dropdown per calculator; live score; color-coded risk; Copy to EMR; sticky header.

## 5. Accessibility

- Labels, fieldsets, live region, keyboard, focus, contrast (WCAG AA).

## 6. SEO

- Routes and meta (title, description) in `routeMeta.ts`; URLs as above; schema optional.

## 7. Implementation Phases

**Phase 1 — Shared template (Week 1)**  
- [ ] Optional CalculatorShell or confirm reuse of ICH-style layout.  
- [ ] Shared result card and action bar styling.  
- [ ] Copy-to-EMR and analytics pattern.

**Phase 2 — Calculators (Week 2)**  
- [ ] ABCD²: data module + page + route + Calculators list link.  
- [ ] HAS-BLED: data module + page (labile INR conditional) + route + list.  
- [ ] RoPE: data module + page + route + list.  
- [ ] GCS: data module + page (E/V/M + NT) + route + list.

**Phase 3 — Integration (Week 3)**  
- [ ] Update Calculators.tsx paths from `?id=abcd2` to `/calculators/abcd2-score` (and has-bled, rope, gcs).  
- [ ] Redirects for legacy `?id=` to new routes.  
- [ ] routeMeta.ts entries; sitemap if applicable.  
- [ ] Mobile and a11y pass.

**Phase 4 — Documentation & launch (Week 4)**  
- [ ] CALCULATOR_GUIDELINES.md updated (new calculator names for analytics).  
- [ ] Internal links from stroke/TIA and ICH content.  
- [ ] Final medical review.

## 8. Success Criteria

- All four calculators medically accurate and cited.  
- Mobile-friendly (touch targets ≥44px, single-page).  
- WCAG AA where applicable.  
- Fast load and instant scoring.  
- SEO meta and URLs in place.

## 9. Open Questions

- Include 7-day and 90-day risk for ABCD² (optional)?  
- SessionStorage restore for in-progress inputs (yes/no)?  
- GCS display format for “V=NT”: “10T” vs “E4VTM6” (prefer “10T” for brevity).

---

**Plan is ready.** Should we proceed with implementation, or would you like to review or adjust any design decisions first?
