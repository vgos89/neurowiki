# Guideline Update - January 2026

## Major Update: AHA/ASA 2026 Stroke Guidelines

**What Changed:**
The American Heart Association/American Stroke Association published updated guidelines for acute ischemic stroke management (January 2026).

**Primary Source:**
- **2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke**
- URL: https://www.ahajournals.org/doi/10.1161/STR.0000000000000513
- Citation: Powers WJ, et al. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke: A Guideline From the American Heart Association/American Stroke Association. Stroke. 2026.
- **Supersedes:** 2024, 2019, 2018 guidelines

---

## Phase 1 Completed: Agent Knowledge Updated

**Files Updated:**
- **agents/medical-scientist.md** — Primary guideline set to AHA/ASA 2026; validation checklist expanded (dosing, time windows, BP thresholds, contraindications); new section "ACCESSING THE 2026 GUIDELINES"; historical guidelines retained as reference only.
- **agents/content-writer.md** — FAQ example updated to AHA/ASA 2026; new section "2026 GUIDELINE UPDATES" with example pearl, common updates, and educational blurb template (2026).
- **agents/api-integration.md** — New Task 5: "Fetch and Parse 2026 AHA/ASA Guidelines" (fetch, parse sections, extract recommendations, weekly check); Integration with Clinical Pearls (pearl → guideline section link).
- **.cursorrules** — New section "GUIDELINES YOU FOLLOW" (2026 primary, historical refs); CRITICAL RULES extended with four 2026-specific rules (primary source, cite sections, verify, note differences).

---

## Phase 2 Completed: Clinical Content Updated (January 2026)

The following files were updated to AHA/ASA 2026:

**Updated files:**
- **src/pages/guide/StrokeBasicsWorkflowV2.tsx** — Step 1 and Step 3 reference links now point to 2026 guideline URL; labels updated to "AHA/ASA 2026 Guidelines".
- **src/data/strokeClinicalPearls.ts** — Evidence strings updated to "AHA/ASA 2026 Guidelines"; reference citation updated to 2026; DOAC and Pregnancy pearl titles set to "2026 Update"; comment "2026 AHA/ASA alignment".
- **src/components/article/stroke/ThrombolysisEligibilityModal.tsx** — `guideline` and EMR text updated to "AHA/ASA 2026".
- **agents/onboarding-documentation.md** — "AHA/ASA 2026".
- **agents/internationalization.md** — Examples updated to "AHA/ASA 2026".
- **agents/seo-specialist.md** — Keyword example "stroke guidelines AHA/ASA 2026".
- **src/pages/ElanPathway.tsx** — Copy summary, DOAC Selection title, and disclaimer/reference text updated to "AHA/ASA 2026".
- **src/seo/routeMeta.ts** — ELAN pathway description "AHA/ASA 2026 guidelines".
- **src/data/toolContent.ts** — ELAN reference updated to "AHA/ASA 2026 Guidelines for Secondary Stroke Prevention".

**Not changed (already 2026 or non-stroke):**
- **src/pages/EvtPathway.tsx** — Already references 2026 AHA/ASA.
- **src/data/toolContent.ts** — EVT strings already 2026.
- Trial publication years (e.g. NEJM 2019, JAMA 2019) left as-is.

---

## Clinical Changes to Verify (per 2026)

Before bulk-updating clinical text, confirm against the published 2026 guideline:

- **IV Thrombolysis:** Alteplase 0.9 mg/kg max 90 mg (10% bolus, 90% over 60 min); Tenecteplase 0.25 mg/kg max 25 mg single bolus.
- **Time windows:** 0–4.5 h standard; 4.5–9 h extended with perfusion imaging; thrombectomy up to 24 h with imaging selection; wake-up eligible if DWI–FLAIR mismatch.
- **BP:** Pre-tPA &lt;185/110 mmHg; post-tPA &lt;180/105 mmHg for 24 h.
- **Contraindications:** Absolute vs relative and DOAC timing (&lt;48 h with normal labs as relative) per 2026 sections.
- **Evidence:** Class I/IIa/IIb/III and Level A/B-R/B-NR/C for any stated recommendations.

---

## Action Required

1. **Confirm** you want clinical content updated in the files listed above.
2. **Review** each high-priority file and approve wording/section references.
3. **Verify** dosing, time windows, and contraindications against the 2026 PDF.
4. **Add** specific section numbers (e.g. "AHA/ASA 2026, Section 3.1") once the guideline is to hand.

---

## Reference

Powers WJ, et al. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke: A Guideline From the American Heart Association/American Stroke Association. Stroke. 2026.

https://www.ahajournals.org/doi/10.1161/STR.0000000000000513
