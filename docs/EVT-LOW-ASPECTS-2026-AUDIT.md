# EVT Pathway — Low ASPECTS / Large Core Audit vs AHA/ASA 2026

**Scope:** Low ASPECTS intervention group (ASPECTS 0–2, 3–5, 3–10) per AHA/ASA 2026 Section 4.7.2.  
**Primary file:** `src/pages/EvtPathway.tsx`  
**Guideline source:** 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke (Section 4.7.2 — Endovascular Thrombectomy for Adults).  
**Audit date:** February 2026.

---

## 1. 2026 Guideline Recommendations (Section 4.7.2) — Low ASPECTS

| COR | Population | Criteria | Recommendation |
|-----|------------|----------|----------------|
| **1** | 0–6 h from onset | Anterior LVO (ICA/M1), NIHSS ≥6, prestroke mRS 0–1, **ASPECTS 3–10** | EVT **recommended** to improve functional outcomes and reduce mortality. |
| **1** | 6–24 h | **Selected patients***: age <80 y, NIHSS ≥6, mRS 0–1, **ASPECTS 3–5**, **without significant mass effect** | EVT **recommended**. |
| **2a** | 0–6 h | **Selected patients†**: age <80 y, NIHSS ≥6, mRS 0–1, **ASPECTS 0–2**, **without significant mass effect** | EVT **reasonable** to improve functional outcomes and reduce mortality. |
| **2a** | 0–6 h | NIHSS ≥6, **ASPECTS ≥6**, **prestroke mRS 2** | EVT **reasonable** to improve functional outcomes and reduce accumulated disability. |

\* † Footnote definitions for “selected patients” should be confirmed in the full guideline (e.g., clinical judgment, absence of contraindications, or imaging/clinical selection criteria).

---

## 2. Pathway vs Guideline — Line-by-Line

### 2.1 COR 1 — 0–6 h, ASPECTS 3–10 (mRS 0–1, NIHSS ≥6)

| Guideline | Pathway implementation | Status |
|-----------|-------------------------|--------|
| ASPECTS **3–10** (not only ≥6) | We treat ASPECTS 3–10 as single Class I band: `if (aspects >= 3 && aspects <= 10)` → Eligible, “Standard Early Window - Class I”. | ✅ **Correct** |
| NIHSS ≥6 | Low NIHSS (0–5) returns “Clinical Judgment” before ASPECTS branch; ASPECTS 3–10 only reached when NIHSS ≥6. | ✅ **Correct** |
| mRS 0–1 | mRS 2 handled separately (Class IIa, ASPECTS ≥6); mRS >2 → Not Eligible. ASPECTS 3–10 branch applies when `mrs === 'yes'`. | ✅ **Correct** |

**Verdict:** Aligned with 2026. No error.

---

### 2.2 COR 1 — 6–24 h, selected patients, age <80, ASPECTS 3–5, no significant mass effect

| Guideline | Pathway implementation | Status |
|-----------|-------------------------|--------|
| 6–24 h | Branch `inputs.time === '6_24'`. | ✅ |
| Age <80 | We require `inputs.age === '18_79'`. Age ≥80 not given this Class I path. | ✅ **Correct** |
| ASPECTS 3–5 | We check `aspectsLate >= 3 && aspectsLate <= 5`. | ✅ **Correct** |
| No significant mass effect | We require `inputs.massEffect === 'no'`. | ✅ **Correct** |
| “Selected patients*” | We do not define or display what “selected” means (e.g., footnote *). User sees “Eligible” / “Late Window ASPECTS 3-5 - Class I” without caveat. | ⚠️ **Omission** |

**Verdict:** Logic and criteria correct. **Gap:** Pathway does not explain “selected patients” (e.g., individualized assessment, no other contraindications). Recommend adding a short note in the result details or a Learning Pearl.

---

### 2.3 COR 2a — 0–6 h, ASPECTS 0–2, age <80, no significant mass effect

| Guideline | Pathway implementation | Status |
|-----------|-------------------------|--------|
| ASPECTS 0–2 | We use `aspects >= 0 && aspects <= 2`. | ✅ **Correct** |
| Age <80 | We require `inputs.age === '18_79'`. | ✅ **Correct** |
| No significant mass effect | We require `inputs.massEffect === 'no'`. | ✅ **Correct** |
| “Selected patients†” | Same as 2.2 — we do not define “selected.” | ⚠️ **Omission** |
| Otherwise (mass effect yes/unknown or age ≥80) | We return “Consult” with explanation that Class IIa applies only to selected patients age <80 without significant mass effect. | ✅ **Correct** |

**Verdict:** Logic correct. Same **omission** regarding “selected patients.”

---

### 2.4 COR 2a — 0–6 h, prestroke mRS 2, ASPECTS ≥6

| Guideline | Pathway implementation | Status |
|-----------|-------------------------|--------|
| Prestroke mRS 2 | We have `mrs === 'mrs2'`. | ✅ **Correct** |
| ASPECTS ≥6 | We return “EVT Reasonable” only when `aspects >= 6`. | ✅ **Correct** |
| ASPECTS <6 with mRS 2 | We return “Consult” (evidence limited to ASPECTS ≥6). | ✅ **Correct** |

**Verdict:** Aligned. No error.

---

### 2.5 6–24 h — Large core by volume (50–100 mL) — Class IIb

| Guideline / evidence | Pathway implementation | Status |
|----------------------|-------------------------|--------|
| SELECT2/ANGEL-ASPECT: large core 50–100 mL (or ASPECTS 3–5) in extended window | We have a separate branch for `core >= 50 && core <= 100` → “Clinical Judgment” / “Large Core (50-100 mL) - Class IIb”. | ✅ **Correct** |
| 2026 may keep this as IIb (“may be considered”) | Wording: “EVT MAY be considered … Requires individualized assessment and informed consent.” | ✅ **Correct** |

**Verdict:** Aligned. No error.

---

### 2.6 NIHSS requirement for low ASPECTS paths

| Path | Guideline | Pathway | Status |
|------|-----------|---------|--------|
| ASPECTS 3–10 (0–6 h) | NIHSS ≥6 | We never reach this branch when `nihss === '0_5'` (Low NIHSS returns first). | ✅ |
| ASPECTS 0–2 (0–6 h) | NIHSS ≥6 | Same; Low NIHSS returns first. | ✅ |
| mRS 2, ASPECTS ≥6 | NIHSS ≥6 | Same. | ✅ |
| 6–24 h ASPECTS 3–5 | NIHSS ≥6 | We do not re-check NIHSS in the 6–24 h ASPECTS 3–5 branch; user has already chosen NIHSS in Step 2. If NIHSS were 0–5 we would still show “Eligible” for ASPECTS 3–5 + age <80 + no mass effect. | ⚠️ **Potential gap** |

**Check:** In 6–24 h we do not explicitly require NIHSS ≥6 for the “Late Window ASPECTS 3-5 - Class I” branch. Guideline states NIHSS ≥6 for that recommendation. **Recommendation:** Add an explicit NIHSS ≥6 check for the 6–24 h ASPECTS 3–5 Class I path (e.g. if NIHSS 0–5, do not assign that Class I recommendation).

---

## 3. Copy / UI Errors

### 3.1 Outdated Learning Pearl — Step 2 (Clinical)

- **Location:** “2026 Guideline Update” Learning Pearl in Step 2 (Clinical).
- **Current text:** “Class I (strong evidence, **≥6 ASPECTS** or ≥8 pc-ASPECTS) vs Class IIb …”
- **2026 guideline:** Class I for 0–6 h anterior LVO is **ASPECTS 3–10**, not “≥6 ASPECTS.”
- **Verdict:** ❌ **Error** — Understates eligibility. Should say “ASPECTS 3–10” (or “ASPECTS 3 to 10”) for Class I in the early window.

### 3.2 EVT-PATHWAY-AUDIT-REPORT.md (pre-update)

- **Current:** “ASPECTS 3–5 → Class IIb; 0–2 → Consult/Avoid.”
- **2026:** ASPECTS 3–10 = Class I; ASPECTS 0–2 = Class IIa in selected patients (age <80, no mass effect).
- **Verdict:** Audit report is **outdated**; should be updated to reflect current pathway and 2026.

---

## 4. Summary Table — Errors and Gaps

| # | Type | Description | Severity | Action |
|---|------|--------------|----------|--------|
| 1 | **Copy error** | Step 2 Learning Pearl says “≥6 ASPECTS” for Class I; 2026 says **ASPECTS 3–10**. | Medium | Change copy to “ASPECTS 3–10” for Class I early window. |
| 2 | **Omission** | “Selected patients” (footnotes * and †) for 6–24 h ASPECTS 3–5 and 0–6 h ASPECTS 0–2 not explained in pathway. | Low | Add brief note (result details or Learning Pearl) that “selected” implies individualized assessment per guideline. |
| 3 | **Logic gap** | 6–24 h ASPECTS 3–5 Class I path does not explicitly require NIHSS ≥6. | Medium | Add NIHSS ≥6 check before assigning “Late Window ASPECTS 3-5 - Class I.” |
| 4 | **Doc** | EVT-PATHWAY-AUDIT-REPORT.md still describes ASPECTS 3–5 as IIb and 0–2 as Consult/Avoid. | Low | Update audit report to 2026 and current pathway. |

---

## 5. Evidence Base (Low ASPECTS) — Pathway vs 2026

| Scenario | Trials / evidence | Pathway citation | Status |
|----------|-------------------|------------------|--------|
| ASPECTS 3–10, 0–6 h | HERMES, MR CLEAN, ESCAPE, etc. | “Strong evidence from multiple RCTs” / “AHA/ASA 2026, Section 4.7.2” | ✅ |
| ASPECTS 0–2, 0–6 h, selected | SELECT2, ANGEL-ASPECT (large core); guideline Class IIa | “AHA/ASA 2026, Section 4.7.2” | ✅ |
| ASPECTS 3–5, 6–24 h, selected | SELECT2, ANGEL-ASPECT (extended window, ASPECTS 3–5) | “AHA/ASA 2026, Section 4.7.2” | ✅ |
| mRS 2, ASPECTS ≥6 | Guideline COR 2a | “AHA/ASA 2026, Section 4.7.2” | ✅ |
| Core 50–100 mL, 6–24 h | SELECT2, ANGEL-ASPECT | “SELECT2/ANGEL-ASPECT,” “Class IIb,” “2026 AHA/ASA Guidelines” | ✅ |

No evidence misattribution or incorrect COR level identified for the low ASPECTS group.

---

## 6. Recommended Code/Content Changes

1. **Fix Step 2 Learning Pearl**  
   Replace “≥6 ASPECTS” with “ASPECTS 3–10” for Class I early window in the “2026 Guideline Update” Learning Pearl.

2. **6–24 h ASPECTS 3–5 Class I — require NIHSS ≥6**  
   In `calculateLvoProtocol`, in the 6–24 h block, before returning “Late Window ASPECTS 3-5 - Class I,” require `getNihssNumeric(inputs.nihss) >= 6` (or equivalent). If NIHSS <6, fall through to perfusion/core logic instead of assigning that Class I recommendation.

3. **Optional: “Selected patients” note**  
   In the result details for “Late Window ASPECTS 3-5 - Class I” and “Very Large Core (ASPECTS 0–2) - Class IIa,” add one line: “Applies to selected patients; individualized assessment per guideline.”

4. **Optional: Update EVT-PATHWAY-AUDIT-REPORT.md**  
   Update the checklist and narrative to reflect ASPECTS 3–10 = Class I, ASPECTS 0–2 = Class IIa (selected), and current pathway behavior.

---

**Conclusion:** The EVT pathway’s **low ASPECTS logic is aligned with the 2026 guideline** for COR 1 and COR 2a (0–6 h and 6–24 h). Identified issues: (1) one **copy error** (Step 2 Learning Pearl: “≥6 ASPECTS” → “ASPECTS 3–10”), (2) one **logic gap** (NIHSS ≥6 not enforced for 6–24 h ASPECTS 3–5 Class I), and (3) **omissions** (definition of “selected patients”; outdated audit report). Implementing recommendations 1 and 2 will resolve the only substantive errors for the low ASPECTS intervention group.
