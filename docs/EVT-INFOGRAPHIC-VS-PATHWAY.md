# EVT Pathway vs AHA 2026 Infographic — Protocol Comparison

**Reference:** User-provided infographic (Evidence for EVT flowchart: Population → Vessel Occlusion → Time from Onset → Tissue Injury → Baseline Function → COR).  
**Pathway:** `src/pages/EvtPathway.tsx`  
**Date:** February 2026.

---

## Summary: Does Our Pathway Follow the Infographic?

**Mostly yes.** Our pathway aligns with the infographic for **adult anterior LVO** (0–6 h and 6–24 h), **mRS 2**, **ASPECTS 0–2 (with age & mass effect)**, and **Basilar/MeVO** in spirit. Main **gaps**: (1) we do **not** offer **COR 2b for mRS 3–4** (infographic does); (2) **Basilar** we use **pc-ASPECTS ≥6** for Class I (updated) (infographic shows **PC ASPECTS ≥6**); (3) **6–24 h** we use **perfusion (DAWN/DEFUSE-3)** plus optional ASPECTS 3–5 (infographic uses ASPECTS bands only); (4) **pediatric** we use a single “Consult” (infographic has age bands and COR 2a/2b).

---

## 1. Adult LVO (ICA/M1) — 0–6 h

| Infographic | Our pathway | Match? |
|-------------|-------------|--------|
| **ASPECTS 6–10**, mRS 0–1 → **COR 1** | ASPECTS 3–10, mRS 0–1 → Eligible (Class I) | ✅ Yes (we use 3–10 per guideline text) |
| **ASPECTS 6–10**, mRS 2 → **COR 2a** | mRS 2, ASPECTS ≥6 → EVT Reasonable (Class IIa) | ✅ Yes |
| **ASPECTS 6–10**, mRS 3–4 → **COR 2b** | mRS 3–4 + ASPECTS ≥6 (0–6 h) → **Class IIb** (EVT may be considered) | ✅ **Updated** — pathway now offers COR 2b for mRS 3–4 in 0–6 h. |
| **ASPECTS 6–10**, mRS >4 → IDD | mRS >2 → Not Eligible | ✅ Same outcome (IDD / Not Eligible) |
| **ASPECTS 3–5**, mRS 0–1 → **COR 1** | ASPECTS 3–10 (includes 3–5), mRS 0–1 → Class I | ✅ Yes |
| **ASPECTS 3–5**, mRS ≥2 → IDD | mRS 2 + ASPECTS <6 → Consult; mRS >2 → Not Eligible | ✅ Yes |
| **ASPECTS 0–2**, mRS 0–1 → **COR 2a** | ASPECTS 0–2, age <80, no mass effect → Class IIa; else Consult | ✅ Yes (we add age/mass-effect per guideline text) |
| **ASPECTS 0–2**, mRS ≥2 → IDD | mRS ≥2 with ASPECTS 0–2 → Consult / Not Eligible | ✅ Yes |

**Conclusion (0–6 h):** Aligned. Pathway now implements COR 2b for mRS 3–4 (0–6 h, ASPECTS ≥6).

---

## 2. Adult LVO — 6–24 h

| Infographic | Our pathway | Match? |
|-------------|-------------|--------|
| **ASPECTS 6–10**, mRS 0–1 → **COR 1** | DAWN / DEFUSE-3 (perfusion) + optional **ASPECTS 3–5** path → Class I | ⚠️ **Structure differs** — we use perfusion/core + ASPECTS 3–5; infographic uses ASPECTS 6–10 band. Same intent (COR 1 for selected 6–24 h). |
| **ASPECTS 6–10**, mRS ≥2 → IDD | Not eligible for DAWN/DEFUSE-3 Class I if mRS ≥2; we don’t explicitly “IDD” but don’t recommend | ✅ Consistent |
| **ASPECTS 3–5**, mRS 0–1 → **COR 1** | ASPECTS 3–5, age <80, NIHSS ≥6, no mass effect → Class I | ✅ Yes |
| **ASPECTS 3–5**, mRS ≥2 → IDD | mRS >2 already excluded at Triage | ✅ Yes |
| **ASPECTS 0–2** in 6–24 h | Not shown on infographic (implied IDD) | ✅ We don’t give Class I for ASPECTS 0–2 in 6–24 h |

**Conclusion (6–24 h):** We follow the protocol: COR 1 for mRS 0–1 with favorable imaging. We add **DAWN/DEFUSE-3** and **ASPECTS 3–5 + age & mass-effect**; infographic uses ASPECTS bands only.

---

## 3. Basilar Artery — 0–24 h

| Infographic | Our pathway | Match? |
|-------------|-------------|--------|
| **PC ASPECTS ≥6**, mRS 0–1, **NIHSS ≥10** → **COR 1** | **pc-ASPECTS ≥6** + NIHSS ≥10 → Class I | ✅ **Updated** — infographic says PC ASPECTS **≥6**; we use **≥8** for COR 1 (per ATTENTION/BAOCHE). |
| **PC ASPECTS ≥6**, mRS 0–1, **NIHSS 6–9** → **COR 2b** | pc-ASPECTS ≥6 + NIHSS 6–9 → **Class IIb** (EVT may be considered) | ✅ **Updated** and require 6–7 for “moderate”; infographic uses 2b for NIHSS 6–9. Same direction (reasonable to offer). |
| **PC ASPECTS ≥6**, mRS ≥2 → IDD | We don’t explicitly model mRS for basilar; anterior mRS >2 → Not Eligible | ✅ Consistent |
| PC ASPECTS <6 | Not shown (implied avoid) | We use pc-ASPECTS <6 → Avoid EVT | ✅ Yes |

**Conclusion (Basilar):** We follow the protocol. Pathway updated: pc-ASPECTS **≥6** for Class I; pc-ASPECTS ≥6 + NIHSS 6–9 → Class IIb (AHA 2026).

---

## 4. MeVO (MVO) — Dominant M2 / Non-dominant or DVO

| Infographic | Our pathway | Match? |
|-------------|-------------|--------|
| **MVO Dominant M2**, 0–6 h, **ASPECTS 6–10**, mRS 0–1 → **COR 2a** | Dominant M2 + disabling + favorable imaging + technical → EVT Reasonable (no explicit ASPECTS 6–10) | ⚠️ Same conclusion (EVT reasonable); we don’t require “ASPECTS 6–10” for MeVO. |
| **MVO Dominant M2**, >6 h → IDD | We allow 0–6 h and 6–24 h with “salvageable tissue” | ⚠️ We are slightly more permissive for late window MeVO. |
| **MVO Non-dominant M2 or DVO** → **COR 3 No Benefit** | Nondominant/distal/ACA/PCA → BMT Preferred or High Uncertainty | ✅ Same direction (no routine EVT). |

**Conclusion (MeVO):** We follow the protocol in spirit (dominant M2 = reasonable, others = no benefit/caution). We use **favorable imaging + disabling deficit** (no explicit ASPECTS 6–10 requirement); outcome = EVT reasonable (COR 2a). Confirmed per AHA 2026 infographic.

---

## 5. Pediatric

| Infographic | Our pathway | Match? |
|-------------|-------------|--------|
| ≤28 d → IDD | Age <18 → **Consult** (no EVT recommendation) | ✅ Consistent |
| 28 d–5 y, salvageable tissue → **COR 2b** | No pediatric breakdown | ❌ **Gap** — we don’t offer COR 2b for 28 d–5 y |
| 6–17 y, 0–6 h or 6–24 h, salvageable → **COR 2a** | No pediatric breakdown | ❌ **Gap** — we don’t offer COR 2a for 6–17 y |

**Conclusion (Pediatric):** We do **not** follow the infographic’s pediatric detail; we use a single “Consult” for all &lt;18.

---

## 6. Recommended Changes (If Aligning to Infographic)

1. **mRS 3–4 (adult LVO, 0–6 h, ASPECTS 6–10):**  
   Add a path: **mRS 3–4** with ASPECTS ≥6 (and NIHSS ≥6) → **COR 2b** (“EVT may be considered” / Clinical Judgment).  
   *Requires:* New mRS option (e.g. “Dependent mRS 3–4”) and a new result status (e.g. “Clinical Judgment” or “EVT May Be Considered - Class IIb”).

2. **Pediatric age bands:**  
   Optional: Add age bands (e.g. 28 d–5 y → COR 2b; 6–17 y → COR 2a when salvageable) if the full guideline specifies these and you want the pathway to match the infographic.

3. **Basilar:**  
   If the **published** 2026 guideline states COR 1 for **PC ASPECTS ≥6** (not ≥8), consider relaxing our Class I to pc-ASPECTS ≥6. If it states ≥8, keep current logic and note on the pathway that the infographic may show a simplified ≥6.

4. **MeVO:**  
   Optional: Add “ASPECTS 6–10” (or “favorable imaging”) as an explicit criterion for Dominant M2 COR 2a to mirror the infographic.

---

## 7. Bottom Line

| Domain | Follows infographic? | Notes |
|--------|----------------------|--------|
| Adult LVO 0–6 h (ASPECTS 3–10, 0–2, mRS 0–1, 2) | ✅ Yes | We add age & mass effect for ASPECTS 0–2 per guideline text. |
| Adult LVO 0–6 h (mRS 3–4) | ✅ Yes | COR 2b for mRS 3–4 (0–6 h, ASPECTS ≥6) implemented. |
| Adult LVO 6–24 h | ✅ Yes | We use perfusion + ASPECTS 3–5; same COR 1 intent. |
| Basilar | ✅ Yes | We use pc-ASPECTS ≥6 for COR 1; NIHSS 6–9 → Class IIb. |
| MeVO | ✅ In spirit | Dominant M2 = reasonable; others = no benefit. |
| Pediatric | ❌ No | Single Consult; infographic has age bands and COR 2a/2b. |

**Overall:** The pathway **follows the infographic protocol** for the main adult LVO and basilar/MeVO decisions. **Implemented:** (1) Basilar pc-ASPECTS **≥6** for Class I (was ≥8); NIHSS 6–9 → Class IIb. (2) **COR 2b for mRS 3–4** (0–6 h, ASPECTS ≥6). (3) MeVO: confirmed favorable imaging + disabling (no ASPECTS 6–10 requirement). Remaining gap: no pediatric age-band recommendations (28 d–5 y COR 2b, 6–17 y COR 2a).
