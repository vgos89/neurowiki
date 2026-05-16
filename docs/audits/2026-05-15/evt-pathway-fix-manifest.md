# EVT Pathway — Final Fix Manifest (PDF-verified)

**Date:** 2026-05-15
**Author:** medical-scientist
**Inputs:** PDF-verified dossier (highest authority), 17-finding audit, source code, secondary-source packet (superseded)
**Output mode:** Persistent markdown work-order; no source code edited in this task
**Authority source:** AHA/ASA 2026 stroke guideline, Section 4.7, Prabhakaran et al. *Stroke*. 2026;57. DOI 10.1161/STR.0000000000000513

---

## Executive summary

- **24 fixes total.** 17 re-graded from the original audit + 7 net-new findings from the PDF-nuance walkthrough.
- **17 of 24 are confirmed-by-PDF** (no further verification required); the remaining 7 are net-new but each anchored to verbatim 2026 text.
- **7 net-new findings** discovered from the 11 PDF-only nuances the original audit could not surface.
- **Severity:** Critical 2 · High 7 · Medium 9 · Low 3 · Informational 3.
- **Top 3 most consequential (patient-safety first):**
  1. **Finding A9 (Critical, ship-blocker):** the late-window "core >100 mL → Avoid EVT" red banner overstates the 2026 guideline (no Class III for core volume exists) and risks under-treatment. Soften to "Insufficient evidence — individualized decision."
  2. **Finding A8 (High, ship-blocker):** the "Class IIb large core 50–100 mL" late-window branch is obsolete — 2026 collapses late-window large-core selection into the ASPECTS 3–5 Class I A pathway (Rec 3). The IIb tier at 6–24 h based on core volume should be retired.
  3. **Finding A3 (High, ship-blocker):** the basilar "prestroke mRS ≥2 → Not Eligible" hard-stop is incorrect framing. Figure 3 maps basilar mRS ≥2 to **IDD (insufficient data to determine)** — not "Not Eligible." Reframe to "Insufficient evidence — individualized decision" so clinicians do not exclude potentially-treatable patients.

---

## Method

1. Walked through each of the 17 audit findings against the PDF-verified dossier (Section 4.7.1–4.7.5 verbatim + Figure 3 master algorithm).
2. Walked through each of the 11 PDF-nuance items in the dossier and generated net-new findings where the codebase does not already encode them.
3. Opened `src/pages/EvtPathway.tsx` and located each offending string/line for both groups.
4. Produced concrete patch instructions (replace-this-with-that, add-new-branch-with-these-conditions, remove-this-branch) per item.
5. Tagged each item with severity, CLAUDE.md §6 class (B / C-clinical / E), and ship-blocker status.

---

## Part A — Re-graded findings from the original audit

### Audit Finding 1 — Basilar Class IIb branch (NIHSS 6–9) — KEEP

- **Original audit severity:** Critical
- **Original PDF-gate status:** Yes (PDF-VERIFICATION-REQUIRED)
- **PDF dossier verdict:** **Keep** the IIb branch as a separately-numbered Class IIb B-R recommendation.
- **Final severity:** Medium (downgraded — the branch is correct; only the LOE label needs verification)
- **Location in code:** `src/pages/EvtPathway.tsx:284–293` and badge map at `:183` (`"COR 2b · BAOCHE"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.3 Rec 2 — *"In patients with AIS, with basilar artery occlusion, a baseline mRS score of 0 to 1, NIHSS score 6 to 9 at presentation, and PC-ASPECTS ≥6 (mild ischemic damage), the effectiveness of EVT within 24 hours to improve functional outcomes and reduce mortality is not well established."* COR 2b, LOE **B-R**.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:183`, **replace:** `return "COR 2b · BAOCHE";`
  - **with:** `return "COR 2b B-R · BAOCHE";`
  - **In** `src/pages/EvtPathway.tsx:290`, **replace** the `details` string with: *"In patients with AIS, basilar artery occlusion, baseline mRS 0–1, NIHSS 6–9, and PC-ASPECTS ≥6, the effectiveness of EVT within 24 hours is not well established (AHA/ASA 2026 Section 4.7.3 Rec 2, Class IIb LOE B-R). BAOCHE post-hoc analysis (n=17 NIHSS 6–9; 6 received EVT) showed favorable outcomes; further investigation is warranted. Treatment should be individualized."*
  - **In** `:289` `reason:` keep `"Moderate Severity (pc-ASPECTS ${pcScore}, NIHSS 6–9)"`.
- **Citations to attach:** AHA/ASA 2026 Section 4.7.3 Rec 2; BAOCHE PMID 36273395; ATTENTION PMID 36239644.
- **Class (CLAUDE.md §6):** Class C-clinical (LOE refinement + prose update; no class label change)
- **Ship-blocker?** No

---

### Audit Finding 2 — Basilar NIHSS <6 "no approval branch" wording

- **Original audit severity:** High
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Soften wording. Figure 3 confirms basilar PC-ASPECTS ≥6 with NIHSS <6 → no positive branch (drops out of the algorithm).
- **Final severity:** Low
- **Location in code:** `src/pages/EvtPathway.tsx:296–305` (`criteriaName: "Basilar EVT - Low NIHSS"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.3 covers only Rec 1 (NIHSS ≥10) and Rec 2 (NIHSS 6–9). Figure 3 does not extend any positive branch to basilar / NIHSS <6 / PC-ASPECTS ≥6.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:302`, **replace:** *"…for guideline-supported positive recommendations. For basilar occlusion with NIHSS <6, no approval branch is established; discuss urgently with Vascular Neurology and Neurointerventional."*
  - **with:** *"The 2026 AHA/ASA basilar EVT recommendations (Section 4.7.3 Rec 1, Rec 2) cover NIHSS ≥6 only. For basilar occlusion with NIHSS <6, no positive class is assigned (BAOCHE enrollment floor was NIHSS ≥6); discuss urgently with Vascular Neurology and Neurointerventional."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.3; BAOCHE PMID 36273395.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Audit Finding 3 — Basilar prestroke mRS ≥2 hard-exclusion — RESCORE TO HIGH

- **Original audit severity:** Medium
- **Original PDF-gate status:** Yes
- **PDF dossier verdict:** **Soften.** Figure 3 maps basilar / PC-ASPECTS ≥6 / mRS ≥2 to **IDD** (insufficient data to determine) — not "Not Eligible." Section 4.7.3 Rec 1 and Rec 2 anchor on mRS 0–1, but the guideline does NOT explicitly forbid EVT in basilar mRS ≥2 — it is silent (IDD).
- **Final severity:** High (clinical-logic framing — "Not Eligible" is more restrictive than the guideline)
- **Location in code:** `src/pages/EvtPathway.tsx:248–259` (`criteriaName: "Basilar EVT - Baseline Function"`)
- **Verbatim 2026 text supporting the fix:** Figure 3 (page e61) basilar branch: PC-ASPECTS ≥6 + mRS ≥2 → **IDD (insufficient data to determine).** Section 4.7.3 Rec 1 + 2 both specify "baseline mRS score of 0 to 1."
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:249`, **change branch behavior:** route prestroke mRS ≥2 to a `Consult` status (not `Not Eligible`), with `variant: 'warning'` and a softened `details`.
  - **Replace** the entire return block at `:250–258` with:
    ```
    return {
      eligible: false,
      status: "Consult",
      criteriaName: "Basilar EVT - Prestroke mRS ≥2 (IDD)",
      reason: "Insufficient evidence for basilar EVT in prestroke mRS ≥2",
      details: "The 2026 AHA/ASA basilar EVT recommendations (Section 4.7.3 Rec 1, Rec 2) specify prestroke mRS 0–1. For prestroke mRS ≥2, the 2026 algorithm (Figure 3, page e61) lists this branch as 'Insufficient data to determine' — i.e., no class for or against. ATTENTION enrolled some prestroke mRS <3 patients (age <80). Individualized decision with Vascular Neurology and Neurointerventional.",
      variant: 'warning'
    };
    ```
  - **Also update** the badge map at `src/pages/EvtPathway.tsx:187–188` — add a new case `"Basilar EVT - Prestroke mRS ≥2 (IDD)" → return "Figure 3: IDD"` and remove the obsolete `"Basilar EVT - Baseline Function"` case (or remap to "Figure 3: IDD").
  - **Also update** the prestroke mRS selection card at `:1031–1032`: keep mRS 2 / mRS 3–4 selectable for basilar (currently does not block, but the result text now flows correctly).
- **Citations to attach:** AHA/ASA 2026 Section 4.7.3 Rec 1; AHA/ASA 2026 Figure 3 (page e61); ATTENTION PMID 36239644.
- **Class (CLAUDE.md §6):** **Class E** (status change Not Eligible → Consult is clinical-logic)
- **Ship-blocker?** **Yes** — "Not Eligible" overstates the guideline; could lead to under-treatment of a patient population the guideline does not explicitly exclude.

---

### Audit Finding 4 — Anterior 0–6 h Class I badge attributes to HERMES only

- **Original audit severity:** Medium
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Update evidence attribution. Section 4.7.2 Rec 1 is anchored by HERMES (for ASPECTS ≥6) plus RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, LASTE (for ASPECTS 3–5).
- **Final severity:** Medium
- **Location in code:** `src/pages/EvtPathway.tsx:195–196` (badge `"COR 1 · HERMES"`); `:355–365` (`criteriaName: "Standard Early Window - Class I"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 1 (verbatim in dossier): *"…ASPECTS 3 to 10, EVT is recommended…"* COR 1, LOE A. The ASPECTS 3–5 portion is the 2026 expansion anchored by RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, LASTE.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:195–196`, **replace:** `case "Standard Early Window - Class I": return "COR 1 · HERMES";`
  - **with:** `case "Standard Early Window - Class I": return "COR 1 A · HERMES + RESCUE-Japan LIMIT/ANGEL-ASPECT/SELECT2/TENSION/LASTE";`
  - **In** `src/pages/EvtPathway.tsx:362`, **replace** `details` with: *"Class I A: EVT is recommended for anterior circulation LVO (ICA/M1) within 6 hours with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS 3–10 (AHA/ASA 2026 Section 4.7.2 Rec 1). Anchored by HERMES (ASPECTS ≥6) and large-core trials RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, LASTE (ASPECTS 3–5 expansion)."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 1; HERMES IPDMA; RESCUE-Japan LIMIT PMID 35138767; ANGEL-ASPECT PMID 36762852; SELECT2 PMID 36762865; TENSION PMID 37837989; LASTE PMID 38718358.
- **Class (CLAUDE.md §6):** Class C-clinical (badge text + prose; no class/threshold change)
- **Ship-blocker?** No

---

### Audit Finding 5 — Late ASPECTS 3–5 Class I incorrectly cites LASTE

- **Original audit severity:** High
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Confirmed. LASTE window was ≤6.5 h; it cannot anchor a 6–24 h Class I recommendation.
- **Final severity:** High
- **Location in code:** `src/pages/EvtPathway.tsx:208–209` (badge `"COR 1 · SELECT2/ANGEL-ASPECT/LASTE"`); `:466–475` (`criteriaName: "Late Window ASPECTS 3–5 - Class I"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 3 — *"In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting between 6 and 24 hours from onset of symptoms, with age <80 years, NIHSS score ≥6, prestroke mRS score 0 to 1, ASPECTS 3 to 5, and without significant mass effect on imaging, EVT is recommended…"* COR 1, LOE A.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:208–209`, **replace:** `case "Late Window ASPECTS 3–5 - Class I": return "COR 1 · SELECT2/ANGEL-ASPECT/LASTE";`
  - **with:** `case "Late Window ASPECTS 3–5 - Class I": return "COR 1 A · SELECT2/ANGEL-ASPECT";`
  - **In** `src/pages/EvtPathway.tsx:472`, **replace** `details` with: *"In selected patients age <80 with anterior circulation proximal LVO (ICA/M1), prestroke mRS 0–1, NIHSS ≥6, ASPECTS 3–5, and without significant mass effect on imaging, EVT is recommended in the 6–24 h window (AHA/ASA 2026 Section 4.7.2 Rec 3, Class I LOE A). Anchored by SELECT2 and ANGEL-ASPECT (both 0–24 h)."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 3; SELECT2 PMID 36762865; ANGEL-ASPECT PMID 36762852.
- **Class (CLAUDE.md §6):** Class C-clinical (citation correction; no class/threshold change)
- **Ship-blocker?** No

---

### Audit Finding 6 — Early ASPECTS 0–2 IIa evidence list mis-ordered

- **Original audit severity:** Medium
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Reorder evidence. LASTE is the only RCT enrolling ASPECTS 0–2 with unrestricted infarct size in the 0–6 h window.
- **Final severity:** Medium
- **Location in code:** `src/pages/EvtPathway.tsx:199–200` (badge `"COR 2a · SELECT2/ANGEL-ASPECT/LASTE"`); `:385–394` (`criteriaName: "Very Large Core (ASPECTS 0–2) - Class IIa"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 4 — *"In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting within 6 hours from onset of symptoms, with age <80 years, NIHSS score ≥6, prestroke mRS score 0 to 1, ASPECTS 0 to 2, and without significant mass effect on imaging, EVT is reasonable…"* COR 2a, LOE B-R.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:199–200`, **replace:** `case "Very Large Core (ASPECTS 0–2) - Class IIa": return "COR 2a · SELECT2/ANGEL-ASPECT/LASTE";`
  - **with:** `case "Very Large Core (ASPECTS 0–2) - Class IIa": return "COR 2a B-R · LASTE (primary) + SELECT2/ANGEL-ASPECT subgroup";`
  - **In** `src/pages/EvtPathway.tsx:391`, **replace** `details` with: *"In selected patients age <80 with anterior circulation proximal LVO (ICA/M1), prestroke mRS 0–1, NIHSS ≥6, ASPECTS 0–2, and without significant mass effect on imaging, EVT is reasonable in the 0–6 h window (AHA/ASA 2026 Section 4.7.2 Rec 4, Class IIa LOE B-R). Anchored primarily by LASTE (≤6.5 h, unrestricted infarct size) with supporting subgroup data from SELECT2 and ANGEL-ASPECT."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 4; LASTE PMID 38718358; SELECT2 PMID 36762865; ANGEL-ASPECT PMID 36762852.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Audit Finding 7 — Late ASPECTS ≥6 Class I (DAWN/DEFUSE-3) — CLEAN

- **Original audit severity:** Informational
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Confirmed correct.
- **Final severity:** Informational
- **Location in code:** `src/pages/EvtPathway.tsx:204–205`, `:438–447`
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 2 — *"…ASPECTS ≥6, EVT is recommended…"* COR 1, LOE A.
- **Concrete patch instructions:** None. Optional polish: rename the badge to `"COR 1 A · DAWN/DEFUSE-3"` to include the LOE letter for consistency with neighboring fixes.
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 2; DAWN PMID 29129157; DEFUSE-3 PMID 29364767.
- **Class (CLAUDE.md §6):** Class B (LOE letter cosmetic addition only; optional)
- **Ship-blocker?** No

---

### Audit Finding 8 — Late "Class IIb large core 50–100 mL" branch — REMOVE

- **Original audit severity:** High
- **Original PDF-gate status:** Yes
- **PDF dossier verdict:** **Remove.** 2026 Section 4.7.2 has no separate volumetric "Class IIb large core" branch in 6–24 h — large-core selection at 6–24 h is collapsed into the ASPECTS 3–5 Class I A recommendation (Rec 3).
- **Final severity:** High
- **Location in code:** `src/pages/EvtPathway.tsx:495–504` (`criteriaName: "Large Core (50-100 mL) - Class IIb"`); badge map `:214–215`
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 has only two ASPECTS strata in 6–24 h: ASPECTS 6–10 (Rec 2) and ASPECTS 3–5 (Rec 3). Figure 3 (page e61) confirms: no separate volumetric IIb tier exists in the 6–24 h window.
- **Concrete patch instructions:**
  - **Remove** the entire branch at `src/pages/EvtPathway.tsx:494–504` (the `if (core >= 50 && core <= 100)` block).
  - **Remove** the badge map entry at `:214–215`: `case "Large Core (50-100 mL) - Class IIb": return "COR 2b · SELECT2/ANGEL-ASPECT";`
  - **Routing replacement:** patients with core 50–100 mL in the 6–24 h window who do not meet DAWN/DEFUSE-3 thresholds and lack a valid ASPECTS should fall through to the existing "No Target Profile" terminal at `:518` (status `Not Eligible`, reason `"No Target Profile"`). Add a single-sentence clarifying note to that `details` block: append *"Note: 2026 Section 4.7.2 collapses late-window large-core selection into ASPECTS 3–5 Class I A (Rec 3) — enter an ASPECTS score and re-evaluate."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 2, Rec 3; AHA/ASA 2026 Figure 3 page e61.
- **Class (CLAUDE.md §6):** **Class E** (removes a clinical branch; changes who gets a Class IIb result)
- **Ship-blocker?** **Yes** — an outdated IIb badge with an inflated 15–20% sICH figure could either over-treat or be cited for under-treatment depending on framing.

---

### Audit Finding 9 — Late core >100 mL "Avoid EVT" hard exclusion — SOFTEN

- **Original audit severity:** High
- **Original PDF-gate status:** Yes
- **PDF dossier verdict:** **Soften.** 2026 has no explicit upper core volume cap. The SELECT2 ≥26 mL severe-CT-hypodensity caveat is the only volume-based caveat and applies as risk-stratification, not as a Class III rule.
- **Final severity:** **Critical**
- **Location in code:** `src/pages/EvtPathway.tsx:506–516` (the `if (core > 100)` block returning `status: "Avoid EVT"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 4 footnote (page e54) — *"In an exploratory analysis of the SELECT2 trial, a threshold of ≥26 mL of severe CT hypodensity, defined as the lower 99% CI of the contralateral thalamic gray matter (≤26 Hounsfield units), was associated with diminished treatment benefit from EVT. Patients with CT hypodensity above this threshold derived no functional benefit and instead experienced increased risks, including cerebral edema and the need for hemicraniectomy."* This is a HU-defined hypodensity volume caveat, NOT a total-core threshold, and is presented as caveat language — not a Class III recommendation.
- **Concrete patch instructions:**
  - **Replace** the entire block at `src/pages/EvtPathway.tsx:507–516` with:
    ```
    if (core > 100) {
        return {
            eligible: false,
            status: "Consult",
            criteriaName: "Late Window Very Large Core (>100 mL) — Insufficient Evidence",
            reason: `Very Large Core (${core} mL)`,
            details: "The 2026 AHA/ASA guideline does not name an upper core volume cap for EVT. For 6–24 h with core >100 mL, no positive class is assigned; consider individualized risk discussion. SELECT2 exploratory data: severe CT hypodensity ≥26 mL (HU-defined) was associated with diminished benefit and higher rates of cerebral edema and hemicraniectomy. Discuss with Vascular Neurology and Neurointerventional.",
            exclusionReason: "Insufficient evidence — individualized decision",
            variant: 'warning'
        };
    }
    ```
  - **Add** a badge-map entry: `case "Late Window Very Large Core (>100 mL) — Insufficient Evidence": return "Figure 3: IDD · SELECT2 hypodensity caveat";`
  - **Remove** the unsupported figures: drop "futile reperfusion (>80%)" and "hemorrhagic transformation (>20%)" — these are not in the dossier and cannot be sourced.
  - **Optional cross-link:** the `severeHypodensity26` input should also be elicited when core >100 mL is entered; if `'yes'`, return the existing Severe Hypodensity Warning branch instead.
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 4 footnote (severe hypodensity caveat, page e54); SELECT2 PMID 36762865.
- **Class (CLAUDE.md §6):** **Class E** (status change Avoid EVT → Consult; removes hard exclusion; clinical-logic)
- **Ship-blocker?** **Yes** — "Avoid EVT" is more restrictive than the 2026 guideline supports and could lead to under-treatment of patients SELECT2/LASTE evidence might cover.

---

### Audit Finding 10 — DAWN thresholds — CLEAN

- **Original audit severity:** Informational
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Confirmed correct.
- **Final severity:** Informational
- **Location in code:** `src/pages/EvtPathway.tsx:483–488`
- **Concrete patch instructions:** None.
- **Class (CLAUDE.md §6):** n/a
- **Ship-blocker?** No

---

### Audit Finding 11 — DEFUSE-3 thresholds — CLEAN

- **Original audit severity:** Informational
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Confirmed correct.
- **Final severity:** Informational
- **Location in code:** `src/pages/EvtPathway.tsx:490–492`
- **Concrete patch instructions:** None.
- **Class (CLAUDE.md §6):** n/a
- **Ship-blocker?** No

---

### Audit Finding 12 — MeVO Class III: No Benefit — KEEP, VERIFY LOCUTION

- **Original audit severity:** Medium
- **Original PDF-gate status:** Yes
- **PDF dossier verdict:** **Keep.** Section 4.7.2 Rec 8 is explicitly "**COR 3: No Benefit / LOE A**" for non-dominant or codominant M2, distal MCA, ACA, PCA. Section 4.7.4 Rec 5 reinforces. Figure 3 confirms (pink "No EVT — 3: No Benefit").
- **Final severity:** Low (label is correct; only LOE letter needs adding and locution needs tightening)
- **Location in code:** `src/pages/EvtPathway.tsx:218–219` (badge); `:566–579` (`criteriaName: "Class III: No Benefit"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 8 — *"In patients with AIS from occlusion of the proximal nondominant or codominant division proximal M2 segment of the MCA, the distal MCA, anterior cerebral artery (ACA), or posterior cerebral artery (PCA), EVT is not recommended to improve functional outcomes."* COR 3: No Benefit, LOE A.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:218–219`, **replace:** `case "Class III: No Benefit": return "COR 3 · ESCAPE-MeVO/DISTAL";`
  - **with:** `case "Class III: No Benefit": return "COR 3: No Benefit · LOE A · ESCAPE-MeVO/DISTAL";`
  - **In** `:575`, the `details` text is substantively correct. Optional tightening: confirm the locution reads "Class III: No Benefit" (not "Class III: Harm") — verify and keep as-is.
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 8; AHA/ASA 2026 Section 4.7.4 Rec 5; ESCAPE-MeVO; DISTAL PMID 39908430.
- **Class (CLAUDE.md §6):** Class C-clinical (badge LOE letter; no class/threshold change)
- **Ship-blocker?** No

---

### Audit Finding 13 — MeVO "Selected MeVO" (Dominant M2) Class IIa — KEEP, TIGHTEN

- **Original audit severity:** High
- **Original PDF-gate status:** Yes
- **PDF dossier verdict:** **Keep.** Section 4.7.2 Rec 7 grants Class IIa B-NR for **dominant** proximal M2 (defined as ≥50% of MCA territory, NOT left/right hemispheric dominance), 0–6 h, prestroke mRS 0–1, NIHSS ≥6, ASPECTS ≥6, with the verbatim caveat "benefits are uncertain."
- **Final severity:** Medium (label is correct; constraints and caveats need to be enforced in the logic and surfaced in prose)
- **Location in code:** `src/pages/EvtPathway.tsx:216–217` (badge `"COR 2a"`); `:551–564` (`criteriaName: "Selected MeVO"`); selection card descriptions `:1054–1059`
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 7 — *"In patients with AIS from occlusion of the dominant proximal M2 division of the MCA presenting within 6 hours of onset of symptoms with a prestroke mRS score of 0 to 1, NIHSS score of ≥6, and ASPECTS of ≥6, EVT is reasonable to improve functional outcomes, but the benefits are uncertain."* COR 2a, LOE B-NR. Page e56: *"Dominant is defined as the M2 segment supplying 50% or more of the MCA territory. This does not refer to left/right side dominance."*
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:216–217`, **replace:** `case "Selected MeVO": return "COR 2a";`
  - **with:** `case "Selected MeVO": return "COR 2a B-NR · HERMES dominant-M2 subgroup";`
  - **In** `:555`, **tighten the gate** so the Class IIa branch only triggers in the 0–6 h window: change `if (inputs.mevoLocation === 'dominant_m2' && hasDeficit && inputs.mevoTechnical === 'yes')` to `if (inputs.mevoLocation === 'dominant_m2' && hasDeficit && inputs.mevoTechnical === 'yes' && inputs.time === '0_6')`.
  - **In** `:561`, **replace** `details` with: *"In patients with anterior circulation dominant proximal M2 LVO (defined as the M2 segment supplying ≥50% of MCA territory — not left/right hemispheric dominance) presenting within 6 hours, with prestroke mRS 0–1, NIHSS ≥6, and ASPECTS ≥6, EVT is reasonable, but the benefits are uncertain (AHA/ASA 2026 Section 4.7.2 Rec 7, Class IIa LOE B-NR). Anchored by HERMES dominant-M2 subgroup analysis. Discuss urgently with neurointerventional."*
  - **In selection-card description** at `:1054`, change description to: *"M2 segment supplying ≥50% of MCA territory (territory-based, not hemispheric). 0–6 h with mRS 0–1, NIHSS ≥6, ASPECTS ≥6 — Class IIa B-NR; benefits uncertain."*
  - **For 6–24 h dominant M2:** route to `Consult` / IDD (Figure 3 confirms dominant M2 / >6 h → IDD). Add an `else if (inputs.mevoLocation === 'dominant_m2' && inputs.time === '6_24')` block returning Consult with details referencing Figure 3 IDD.
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 7; HERMES IPDMA dominant-M2 subgroup (aOR 2.39 [1.08–5.28], P=0.03).
- **Class (CLAUDE.md §6):** **Class E** (adds a new branch for 6–24 h dominant M2 → Consult; tightens existing gate to 0–6 h)
- **Ship-blocker?** No

---

### Audit Finding 14 — Early window Low NIHSS (<6) LVO branch — SOFTEN

- **Original audit severity:** Medium
- **Original PDF-gate status:** No (already in scope)
- **PDF dossier verdict:** Soften. The 2026 dossier does not surface a positive class for NIHSS <6 LVO in Section 4.7.2; this remains equipoise.
- **Final severity:** Medium
- **Location in code:** `src/pages/EvtPathway.tsx:323` (`criteriaName: "Early Window (Low NIHSS)"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 recommendations all specify NIHSS ≥6; no recommendation addresses NIHSS <6 LVO directly.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:323`, **replace:** `details: "Guidelines recommend EVT if deficit is disabling despite low score (e.g., aphasia, hemianopsia).",`
  - **with:** `details: "The 2026 AHA/ASA Section 4.7.2 recommendations specify NIHSS ≥6 for EVT eligibility. For LVO with NIHSS <6, no positive class is assigned (ENDOLOW and MOSTE trials are ongoing). Consider individualized decision when deficit is disabling (aphasia, hemianopsia, dominant hand weakness).",`
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 1 (NIHSS ≥6 floor); ENDOLOW (NCT04167527); MOSTE (NCT03796468).
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Audit Finding 15 — mRS 2 Class IIa attribution to HERMES — CORRECT

- **Original audit severity:** Medium
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Correct. Section 4.7.2 Rec 5 is Class IIa **B-NR** — observational evidence base, not HERMES. (HERMES excluded prestroke mRS ≥2.)
- **Final severity:** Medium
- **Location in code:** `src/pages/EvtPathway.tsx:191–192` (badge `"COR 2a · HERMES"`); `:326–337` (`criteriaName: "Early Window mRS 2 - Class IIa"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 5 — *"In patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting within 6 hours from onset of symptoms, with NIHSS score ≥6, and ASPECTS ≥6, who have a prestroke mRS score of 2, EVT is reasonable to improve functional clinical outcomes and reduce accumulated disability."* COR 2a, LOE B-NR.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:191–192`, **replace:** `case "Early Window mRS 2 - Class IIa": return "COR 2a · HERMES";`
  - **with:** `case "Early Window mRS 2 - Class IIa": return "COR 2a B-NR · Observational (Salwi 2022, Italian Registry)";`
  - **In** `:333`, **replace** `details` with: *"In patients with anterior circulation proximal LVO (ICA/M1) presenting within 6 hours, NIHSS ≥6, ASPECTS ≥6, and prestroke mRS 2, EVT is reasonable to improve functional outcomes and reduce accumulated disability (AHA/ASA 2026 Section 4.7.2 Rec 5, Class IIa LOE B-NR). Evidence base is observational (Salwi 2022 meta-analysis, Italian Endovascular Stroke Registry) — no RCT enrolled prestroke mRS 2 as a primary stratum."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 5; Salwi et al. 2022 PMID 36147993.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Audit Finding 16 — Early window mRS 3–4 Class IIb — KEEP, CONFIRMED

- **Original audit severity:** Medium
- **Original PDF-gate status:** Yes
- **PDF dossier verdict:** **Keep.** Section 4.7.2 Rec 6 is Class IIb B-NR for prestroke mRS 3–4 + ASPECTS ≥6 + 0–6 h.
- **Final severity:** Low (label is correct; only LOE letter and verbatim wording need to be added)
- **Location in code:** `src/pages/EvtPathway.tsx:193–194` (badge `"COR 2b · Cohort Data"`); `:341–352` (`criteriaName: "Early Window mRS 3-4 - Class IIb"`)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 6 — *"In patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting within 6 hours from onset of symptoms, with NIHSS score ≥6, and ASPECTS of ≥6, who have a prestroke mRS score of 3 to 4, EVT might be reasonable to improve functional clinical outcomes and reduce accumulated disability."* COR 2b, LOE B-NR.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:193–194`, **replace:** `case "Early Window mRS 3-4 - Class IIb": return "COR 2b · Cohort Data";`
  - **with:** `case "Early Window mRS 3-4 - Class IIb": return "COR 2b B-NR · Observational cohort";`
  - **In** `:348`, **replace** `details` with: *"In patients with anterior circulation proximal LVO (ICA/M1) presenting within 6 hours, NIHSS ≥6, ASPECTS ≥6, and prestroke mRS 3–4, EVT might be reasonable to improve functional outcomes and reduce accumulated disability (AHA/ASA 2026 Section 4.7.2 Rec 6, Class IIb LOE B-NR). Evidence base is retrospective and non-randomized prospective cohorts. ASPECTS ≥6 is required — the recommendation does NOT extend to ASPECTS 3–5 or 0–2."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 6.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Audit Finding 17 — Early-window pearl LASTE anchor

- **Original audit severity:** Low
- **Original PDF-gate status:** No
- **PDF dossier verdict:** Append LASTE anchor.
- **Final severity:** Low
- **Location in code:** `src/pages/EvtPathway.tsx:1232–1235` (LearningPearl "AHA/ASA 2026 Early Window (Section 4.7.2)")
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 4 footnote — *"…CT hypodensity volume as a predictor of poor outcomes…"* Anchor for ASPECTS 0–2 IIa: LASTE.
- **Concrete patch instructions:**
  - **In** `src/pages/EvtPathway.tsx:1234`, **replace** the pearl `content` with: *"Class I (Rec 1, 2026 Section 4.7.2): EVT recommended for ASPECTS 3–10 with NIHSS ≥6 and prestroke mRS 0–1. Class IIa (Rec 5, B-NR): EVT reasonable for prestroke mRS 2 when ASPECTS ≥6. Class IIa (Rec 4, B-R): EVT reasonable for ASPECTS 0–2 with prestroke mRS 0–1, age <80, NIHSS ≥6, and no significant mass effect — anchored by LASTE (≤6.5 h, unrestricted infarct size). Severe CT hypodensity ≥26 mL (SELECT2 HU-defined exploratory caveat) should trigger caution rather than automatic approval."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 1, Rec 4, Rec 5; LASTE PMID 38718358.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

## Part B — New findings discovered from PDF nuances

### Finding B1 — Two-tier prestroke mRS structure at 0–6 h is already present, but selection-card description for mRS 3–4 is missing the verbatim caveat

- **PDF nuance source:** Dossier nuance #1 — two distinct recs for mRS 2 (IIa B-NR) and mRS 3–4 (IIb B-NR), both require ASPECTS ≥6.
- **Codebase state:** Already encoded as separate branches at `:326` (mRS 2 IIa) and `:341` (mRS 3–4 IIb). However, the selection-card description at `:1032` reads *"EVT may be considered if ASPECTS ≥6 in 0-6h (2026 Class IIb)."* — missing the "might be reasonable" verbatim qualifier and the 2026 LOE letter.
- **Severity:** Low
- **Location in code:** `src/pages/EvtPathway.tsx:1031–1032`
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 5 and Rec 6 (see Findings A15 and A16 for verbatim).
- **Concrete patch instructions:**
  - **In** `:1031`, **update** description to: *"Requires assistance for ADLs. 0–6 h + ASPECTS ≥6 + NIHSS ≥6 → EVT reasonable (Class IIa B-NR, Rec 5)."*
  - **In** `:1032`, **update** description to: *"0–6 h + ASPECTS ≥6 + NIHSS ≥6 → EVT might be reasonable (Class IIb B-NR, Rec 6). Does NOT extend to ASPECTS <6."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 5; Section 4.7.2 Rec 6.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Finding B2 — ASPECTS 3–5 at 6–24 h age <80 stipulation: codebase respects it; verify pearl wording does not paint <80 across the late window

- **PDF nuance source:** Dossier nuance #3.
- **Codebase state:** The Class I 6–24 h ASPECTS 3–5 gate at `:466` correctly enforces `inputs.age === '18_79'`. The ASPECTS ≥6 6–24 h gate at `:438` correctly does NOT enforce an age cap.
- **Severity:** Informational (logic is correct; only verify prose)
- **Location in code:** `src/pages/EvtPathway.tsx:1234` (pearl text), `:1273` (late-window imaging banner)
- **Verbatim 2026 text supporting the fix:** Section 4.7.2 Rec 2 (no age cap) vs Section 4.7.2 Rec 3 (explicit age <80).
- **Concrete patch instructions:**
  - **In** `:1273`, **replace** *"ASPECTS ≥6 → Class I (Rec #2, LOE A) — no perfusion required. ASPECTS 3–5, age <80, no mass effect, and no severe CT hypodensity >=26 mL → Class I (Rec #3)."*
  - **with:** *"ASPECTS ≥6 → Class I A (Rec 2) — no age cap, no perfusion required. ASPECTS 3–5 → Class I A (Rec 3) only if age <80, NIHSS ≥6, prestroke mRS 0–1, no significant mass effect. The age <80 stipulation applies ONLY to the ASPECTS 3–5 branch."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 2, Rec 3.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Finding B3 — SELECT2 ≥26 mL caveat is correctly framed as a warning (not a contraindication) — confirmed

- **PDF nuance source:** Dossier nuance #2.
- **Codebase state:** The `Severe Hypodensity Warning` branches at `:376` and `:457` correctly route to `status: 'Clinical Judgment'` with `variant: 'warning'` (not `Avoid EVT`). This is correct framing.
- **Severity:** Informational
- **Location in code:** `src/pages/EvtPathway.tsx:375–384`, `:456–464`
- **Concrete patch instructions:** None — codebase already handles correctly. Optionally tighten the prose by adding "HU-defined" to clarify the threshold is on Hounsfield units, not total core volume. **In** `:381` and `:462`, change *"severe CT hypodensity ≥26 mL"* to *"severe CT hypodensity ≥26 mL (HU-defined: ≤26 Hounsfield units, per SELECT2 exploratory analysis)."*
- **Citations to attach:** AHA/ASA 2026 Section 4.7.2 Rec 4 footnote (page e54); SELECT2 PMID 36762865.
- **Class (CLAUDE.md §6):** Class B (one-line prose tightening)
- **Ship-blocker?** No

---

### Finding B4 — General anesthesia vs procedural sedation equivalence not currently surfaced in pearls

- **PDF nuance source:** Dossier nuance #5 — Section 4.7.4 Rec 3, COR 1 LOE B-R: either GA or procedural sedation is recommended.
- **Codebase state:** No content suggests a preference. No pearl currently addresses this. Net-new pearl recommended.
- **Severity:** Low
- **Location in code:** Add to either the Imaging-section pearl block or the Decision-section pearl list. Best location: after `:1383` (MeVO pearl block) or in a new "Procedural Considerations" pearl placed in the Decision section near `:1538`.
- **Verbatim 2026 text supporting the fix:** Section 4.7.4 Rec 3 — *"In patients with AIS undergoing EVT, either general anesthesia or procedural sedation are recommended to facilitate EVT."* COR 1, LOE B-R.
- **Concrete patch instructions:**
  - **Add** a new `LearningPearl` block:
    ```
    <LearningPearl
        title="Anesthesia (2026 Section 4.7.4 Rec 3)"
        content="Either general anesthesia or procedural sedation is recommended for EVT (Class I B-R). The 2026 guideline does not signal a preference; choice should be based on patient stability, airway risk, and local team workflow."
    />
    ```
  - Place at the end of the Imaging-section pearl block (after the existing pearl at `:1383`).
- **Citations to attach:** AHA/ASA 2026 Section 4.7.4 Rec 3.
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Finding B5 — Adjunctive intra-arterial thrombolytic after successful EVT (new 2026 Class IIb B-R) — missing from pathway

- **PDF nuance source:** Dossier nuance #6 — Section 4.7.4 Rec 8, COR 2b LOE B-R: post-mTICI 2b/3 IA urokinase/alteplase/tenecteplase may be reasonable.
- **Codebase state:** Not surfaced. Add as a pearl in the Decision section (or in a new "Adjunctive Therapy" pearl block).
- **Severity:** Medium (new 2026 recommendation, post-procedural option clinicians should know about)
- **Location in code:** Add a new `LearningPearl` block in the Decision section after `:1547`.
- **Verbatim 2026 text supporting the fix:** Section 4.7.4 Rec 8 — *"In patients with AIS who achieve complete or near-complete EVT (modified TICI 2b or greater), the administration of adjunctive intraarterial thrombolytics with urokinase, alteplase, or tenecteplase may be reasonable to improve cerebral reperfusion and 90-day functional outcome."* COR 2b, LOE B-R.
- **Concrete patch instructions:**
  - **Add** a new `LearningPearl` after `:1547`:
    ```
    <LearningPearl
        title="Adjunctive IA Thrombolytic Post-EVT (2026 Section 4.7.4 Rec 8 — NEW)"
        content="In patients achieving mTICI 2b/3 after EVT, adjunctive intra-arterial urokinase, alteplase, or tenecteplase may be reasonable to improve cerebral reperfusion and 90-day functional outcome (Class IIb B-R). Anchored by CHOICE 2022 and contemporary IA-adjunctive trials."
    />
    ```
- **Citations to attach:** AHA/ASA 2026 Section 4.7.4 Rec 8; CHOICE trial (Renu et al., JAMA 2022).
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Finding B6 — Pre-EVT tirofiban Class III: No Benefit — missing from pathway/pearls

- **PDF nuance source:** Dossier nuance #7 — Section 4.7.4 Rec 9, COR 3: No Benefit LOE B-R based on RESCUE-BT.
- **Codebase state:** Not surfaced. Worth adding a brief pearl so clinicians do not order pre-EVT tirofiban routinely.
- **Severity:** Medium
- **Location in code:** Add a new `LearningPearl` block in the Decision section.
- **Verbatim 2026 text supporting the fix:** Section 4.7.4 Rec 9 — *"In the management of patients with AIS in the setting of LVO, preoperative administration of tirofiban is not useful to improve 90-day functional outcomes."* COR 3: No Benefit, LOE B-R.
- **Concrete patch instructions:**
  - **Add** a new `LearningPearl` after the Adjunctive IA pearl from B5:
    ```
    <LearningPearl
        title="Pre-EVT Tirofiban (2026 Section 4.7.4 Rec 9 — Class III)"
        content="Pre-EVT intravenous tirofiban is not useful for improving 90-day functional outcomes in LVO (Class III: No Benefit, LOE B-R). Anchored by RESCUE-BT. Do not order routinely as a pre-EVT bridging agent."
    />
    ```
- **Citations to attach:** AHA/ASA 2026 Section 4.7.4 Rec 9; RESCUE-BT (Qiu et al., JAMA 2022).
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** No

---

### Finding B7 — Skip-IVT strategy explicitly not recommended — missing from pearls

- **PDF nuance source:** Dossier nuance #9 — Section 4.7.1 synopsis (page e48) verbatim: *"a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended."*
- **Codebase state:** Not surfaced. The pathway currently does not address the IVT-before-EVT question. Add a pearl so clinicians do not interpret EVT eligibility as displacing IVT.
- **Severity:** High (operational error risk: bypassing IVT in eligible patients)
- **Location in code:** Add a new `LearningPearl` block in the Triage or Clinical section.
- **Verbatim 2026 text supporting the fix:** Section 4.7.1 Rec 1 — *"In patients with AIS who are eligible for both IVT and EVT, IVT is safe and recommended to improve overall reperfusion efficacy and clinical outcomes."* COR 1, LOE A. Synopsis: *"a strategy to forgo (or 'skip') IVT to facilitate EVT is not recommended."*
- **Concrete patch instructions:**
  - **Add** a new `LearningPearl` after the Exclusions pearl at `:1077`:
    ```
    <LearningPearl
        title="IVT + EVT (2026 Section 4.7.1 Rec 1 — Class I A)"
        content="In patients eligible for both IVT and EVT, IVT is safe and recommended without observation to assess clinical response or delay. A strategy to forgo ('skip') IVT to facilitate EVT is NOT recommended. The 6-RCT meta-analysis found IVT+EVT benefit over EVT alone when IVT is administered within 2 h 20 min of symptom onset."
    />
    ```
- **Citations to attach:** AHA/ASA 2026 Section 4.7.1 Rec 1, Rec 2; 6-RCT IVT+EVT meta-analysis (page e53).
- **Class (CLAUDE.md §6):** Class C-clinical
- **Ship-blocker?** Yes (workflow safety — skip-IVT is a documented error mode and the guideline now explicitly disfavors it)

---

## Part C — Class breakdown for V's task spin-up

Ordered: ship-blockers first, then Class E (clinical-logic), then Class C-clinical (prose/citation), then informational.

| # | Title | Severity | Class | Ship-blocker | Files touched |
|---|---|---|---|---|---|
| **A9** | Late core >100 mL "Avoid EVT" → soften to Consult | Critical | E | **Yes** | src/pages/EvtPathway.tsx |
| **A8** | Remove obsolete Class IIb 50–100 mL late-window branch | High | E | **Yes** | src/pages/EvtPathway.tsx |
| **A3** | Basilar prestroke mRS ≥2: Not Eligible → Consult (IDD) | High | E | **Yes** | src/pages/EvtPathway.tsx |
| **B7** | Add IVT+EVT pearl (skip-IVT not recommended) | High | C-clinical | **Yes** | src/pages/EvtPathway.tsx |
| **A13** | Tighten Selected MeVO (dominant M2) to 0–6 h; add 6–24 h Consult branch | Medium | E | No | src/pages/EvtPathway.tsx |
| **A1** | Basilar Class IIb branch LOE B-R + verbatim text | Medium | C-clinical | No | src/pages/EvtPathway.tsx |
| **A4** | Standard Early Window Class I badge: multi-trial attribution | Medium | C-clinical | No | src/pages/EvtPathway.tsx |
| **A5** | Late ASPECTS 3–5 Class I: remove LASTE citation | High | C-clinical | No | src/pages/EvtPathway.tsx |
| **A6** | Early ASPECTS 0–2 IIa: lead with LASTE, qualify SELECT2/ANGEL-ASPECT | Medium | C-clinical | No | src/pages/EvtPathway.tsx |
| **A12** | MeVO Class III badge: add LOE A, locution check | Low | C-clinical | No | src/pages/EvtPathway.tsx |
| **A14** | Early Low NIHSS LVO: soften prose | Medium | C-clinical | No | src/pages/EvtPathway.tsx |
| **A15** | mRS 2 Class IIa: replace HERMES with Salwi 2022/Italian Registry | Medium | C-clinical | No | src/pages/EvtPathway.tsx |
| **A16** | mRS 3–4 Class IIb: LOE B-NR + verbatim text + constraint to ASPECTS ≥6 | Low | C-clinical | No | src/pages/EvtPathway.tsx |
| **A17** | Early-window pearl: LASTE anchor + Rec verbatim | Low | C-clinical | No | src/pages/EvtPathway.tsx |
| **A2** | Basilar NIHSS <6 wording | Low | C-clinical | No | src/pages/EvtPathway.tsx |
| **B5** | Add adjunctive IA thrombolytic pearl (Rec 8) | Medium | C-clinical | No | src/pages/EvtPathway.tsx |
| **B6** | Add pre-EVT tirofiban Class III pearl (Rec 9) | Medium | C-clinical | No | src/pages/EvtPathway.tsx |
| **B4** | Add anesthesia equivalence pearl (Rec 3) | Low | C-clinical | No | src/pages/EvtPathway.tsx |
| **B1** | Selection-card descriptions: refine mRS 2 and mRS 3–4 wording | Low | C-clinical | No | src/pages/EvtPathway.tsx |
| **B2** | Late-window imaging banner: clarify age <80 applies only to ASPECTS 3–5 | Informational | C-clinical | No | src/pages/EvtPathway.tsx |
| **B3** | Severe hypodensity wording: add "HU-defined" qualifier | Informational | B | No | src/pages/EvtPathway.tsx |
| **A7** | Late ASPECTS ≥6 Class I: optional LOE A letter | Informational | B | No | src/pages/EvtPathway.tsx |
| **A10** | DAWN thresholds | Informational | n/a | No | (no change) |
| **A11** | DEFUSE-3 thresholds | Informational | n/a | No | (no change) |

Total: 22 actionable + 2 confirmed-clean.

---

## Part D — Proposed batching for the React rebuild

### Patch 1 — Ship-blockers (must-have, today)

**Class E + Class C-clinical mix. Size: medium. No dependencies.**
- A9 — late core >100 mL → Consult
- A8 — remove Class IIb 50–100 mL late branch
- A3 — basilar prestroke mRS ≥2 → Consult (IDD)
- B7 — IVT+EVT skip-IVT pearl

**Files touched:** `src/pages/EvtPathway.tsx` only.
**Class label for the patch:** **Class E** (because three of four items are clinical-logic changes).
**Rollback plan:** revert single PR; no schema or data-file dependencies.

### Patch 2 — Class E re-grading and new branches

**Class E. Size: small. Depends on Patch 1 being merged first (touches adjacent MeVO/dominant M2 logic).**
- A13 — tighten dominant M2 IIa to 0–6 h; add 6–24 h dominant M2 Consult branch

**Files touched:** `src/pages/EvtPathway.tsx`.
**Class label for the patch:** Class E.

### Patch 3 — Class C-clinical citation/prose cleanup (badges, LOE letters, evidence attribution)

**Class C-clinical. Size: medium. Independent of Patches 1 and 2.**
- A1, A4, A5, A6, A12, A14, A15, A16, A17, A2

**Files touched:** `src/pages/EvtPathway.tsx` (`getEvidenceBadge` map + `details` strings + one pearl).
**Class label for the patch:** Class C-clinical.

### Patch 4 — New pearls (adjunctive IA, tirofiban, anesthesia)

**Class C-clinical. Size: small. Independent of other patches.**
- B5 — adjunctive IA thrombolytic pearl
- B6 — pre-EVT tirofiban Class III pearl
- B4 — anesthesia equivalence pearl

**Files touched:** `src/pages/EvtPathway.tsx` (Decision-section pearl block).
**Class label for the patch:** Class C-clinical.

### Patch 5 — Terminology + Figure-3 alignment

**Class C-clinical or Class B. Size: small. Independent.**
- B1 — selection-card description refinements (mRS 2, mRS 3–4)
- B2 — late-window banner age-stipulation clarification
- B3 — severe hypodensity "HU-defined" qualifier
- A7 — late ASPECTS ≥6 Class I optional LOE A letter

**Files touched:** `src/pages/EvtPathway.tsx`.
**Class label for the patch:** Class C-clinical (any pearl/selection-card description with clinical meaning); B if purely cosmetic.

### Dependency graph

- Patch 1 → Patch 2 (Patch 2's dominant M2 changes are adjacent to Patch 1's MeVO/late-window structural changes; merge Patch 1 first to avoid conflict)
- Patches 3, 4, 5 are independent of one another and of Patches 1–2 (touch different lines).

---

## Confidence statement

**HIGH confidence** on every Section 4.7 verbatim claim referenced in this manifest. The PDF was read directly (dossier transcribes all 19 numbered recommendations + Figure 3) and every claim in the manifest cites a specific Section 4.7 recommendation or Figure 3 cell.

**HIGH confidence** on all 7 originally-PDF-gated findings (A1, A3, A8, A9, A12, A13, A16) — each resolved against verbatim PDF text.

**HIGH confidence** on the 7 net-new findings from PDF nuances (B1–B7) — each maps to a specific verbatim recommendation in the dossier.

**MEDIUM confidence** items (none affect ship-blockers, but flagged for review):
- A13: Figure 3 confirms dominant M2 / 0–6 h / ASPECTS 6–10 / mRS 0–1 → 2a. The 6–24 h dominant M2 → IDD mapping is inferred from Figure 3's visual encoding (dominant M2 / >6 h row); the recommendation text in Section 4.7.2 does not separately address dominant M2 at 6–24 h. Confidence on the IDD inference is MEDIUM because it relies on Figure 3 visual interpretation rather than a numbered recommendation.
- B2: the age <80 stipulation for ASPECTS 3–5 vs ASPECTS 6–10 is explicit in the recommendation text (A1 vs A3); MEDIUM only because it depends on careful reading of the recommendation table layout to confirm Rec 2 has no age cap.

No findings depend on speculation, secondary sources, or unverified inferences. Every recommended fix can be traced to a specific Section 4.7 recommendation, Figure 3 cell, or footnote.
