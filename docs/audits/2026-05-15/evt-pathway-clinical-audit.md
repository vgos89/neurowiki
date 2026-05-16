# EVT Pathway — Clinical Audit Findings

**Date:** 2026-05-15
**Auditor:** medical-scientist
**Inputs:** `docs/evidence-packets/2026-05-15-evt-pathway-aha-2026.md` ; `src/pages/EvtPathway.tsx`
**Scope:** AHA/ASA 2026 stroke guideline (Section 4.7.2 anterior, 4.7.3 basilar) + 22 EVT RCTs (MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME, EXTEND-IA, THRACE, THERAPY, DAWN, DEFUSE-3, BAOCHE, ATTENTION, BEST, BASICS, RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, TESLA, LASTE, ESCAPE-MeVO, DISTAL, HERMES IPDMA)
**Output mode:** READ-ONLY findings; no source files edited.

---

## Executive summary

- **17 distinct findings** identified across the EVT pathway logic (lines 160–630) and pearl content (lines 1073–1547).
- **Severity breakdown:** Critical 2 · High 5 · Medium 6 · Low 1 · Informational 3.
- **Top 3 most consequential corrections:**
  1. **Basilar pathway labels** (Findings 1, 2). The codebase encodes basilar EVT with NIHSS 6–9 as "Class IIb" and uses a `Basilar EVT - Class IIb` `criteriaName`. Per the AHA/ASA 2026 evidence packet (Section 4.7.3, HIGH confidence on direction; MEDIUM on exact NIHSS-stratified class language), the unified 0–24 h basilar EVT recommendation has been upgraded to **Class I LOE A** anchored by ATTENTION + BAOCHE. The codebase's NIHSS 6–9 IIb branch is unsupported by the trial population (ATTENTION required NIHSS ≥10; BAOCHE NIHSS ≥6) and the IIb label is likely obsolete — needs PDF verification to confirm whether 2026 separately downgraded NIHSS 6–9 to IIb or whether all NIHSS ≥6/pc-ASPECTS ≥6 is now I.
  2. **Anterior 6–24 h ASPECTS 3–5 Class I** (Finding 5). The codebase correctly grants Class I for late-window ASPECTS 3–5 with age <80 + no mass effect (line 470, `Late Window ASPECTS 3–5 - Class I`). Evidence base from packet is SELECT2 and ANGEL-ASPECT; LASTE is **not in the 6–24 h window** (LASTE was ≤6.5 h). The `details` text at line 472 cites "SELECT2, ANGEL-ASPECT, and LASTE" — LASTE should be removed from this branch's citation list.
  3. **Anterior 0–6 h ASPECTS 0–2 Class IIa evidence list** (Finding 7). The codebase cites "SELECT2, ANGEL-ASPECT, and LASTE" for the early ASPECTS 0–2 Class IIa branch (line 391). Per the packet, **LASTE is the primary anchor** (the only RCT enrolling ASPECTS 0–2 with unrestricted infarct size, ≤6.5 h window); SELECT2 and ANGEL-ASPECT contribute subgroup data only. Evidence list is directionally correct but mis-ordered/over-claimed; should be reordered to lead with LASTE and acknowledge subgroup-only contribution from the others.
- **6 findings are PDF-VERIFICATION-REQUIRED** (the precise class/LOE labels in branches affected by the packet's HTTP 403 caveat).
- **Recommended Class E tasks:** 9 (logic/threshold/class label changes). **Recommended Class C-clinical tasks:** 5 (prose/citation updates). 3 informational items require no fix.
- **Branches that appear clean:** MeVO Class III No Benefit branch (line 569–579) — class label, evidence base (ESCAPE-MeVO + DISTAL), and exclusion language all align with packet Part B Rec #8 and Part D row 9. Sensitivity-warnings for severe CT hypodensity ≥26 mL (lines 375–384, 456–464) align with packet SELECT2 exploratory data caveat. Pre-stroke mRS >4 hard exclusion (line 240) aligns with all trial enrollment exclusions.

---

## Method

- Read evidence packet in full (Parts A–E; 22 trial entries; AHA/ASA 2026 recommendation grid; trial→pathway cross-reference).
- Read `EvtPathway.tsx` in full, focused on:
  - `calculateLvoProtocol` (lines 238–522): basilar 0–24 h, anterior 0–6 h, anterior 6–24 h decision tree
  - `calculateMevoProtocol` (lines 524–599): MeVO branches
  - `getEvidenceBadge` (lines 177–236): canonical `criteriaName` strings and badge mapping
  - All `LearningPearl` content blocks (lines 1073–1547)
  - Selection-card descriptions exposing class language (lines 1031–1059)
- For each clinical assertion, located the corresponding packet section (Part A trial entry, Part B AHA recommendation, or Part D cross-reference grid).
- Categorized each finding as: CORRECT / THRESHOLD-OFF / CLASS-OFF / LOE-OFF / MISSING-BRANCH / OBSOLETE-BRANCH / TEXT-DRIFT / PDF-VERIFICATION-REQUIRED.

---

## Findings

### Finding 1 — Basilar Class IIb branch (NIHSS 6–9) may be obsolete under 2026 unified Class I

- **Severity:** Critical
- **Pathway branch:** Basilar 0–24 h, NIHSS 6–9, pc-ASPECTS ≥6
- **Location in code:** `src/pages/EvtPathway.tsx:284–293` (`criteriaName: "Basilar EVT - Class IIb"`)
- **What the codebase says:** *"In patients with acute ischemic stroke, basilar artery occlusion, baseline mRS 0–1, NIHSS 6–9, and pc-ASPECTS ≥6, the effectiveness of EVT within 24 hours is not well established. Treatment should be individualized using clinical judgment. This is a Class IIb recommendation informed by expanded enrollment criteria in BAOCHE."* Badge: `COR 2b · BAOCHE`.
- **What the packet says:** Packet Part B Rec #5 (Section 4.7.3): **Class I, LOE A** for basilar artery occlusion, prestroke mRS 0–1, NIHSS ≥10, PC-ASPECTS ≥6, 0–24 h — *"EVT within 24 hours from symptom onset is recommended to achieve better functional outcome and reduce mortality."* Supporting trials: ATTENTION (0–12 h, **NIHSS ≥10** required) and BAOCHE (6–24 h, **NIHSS ≥6** required). The packet flags this as "one of the largest class upgrades in 2026."
- **Discrepancy:** The codebase splits NIHSS ≥10 (Class I) vs NIHSS 6–9 (Class IIb). The packet's secondary-source synthesis names NIHSS ≥10 as the canonical Class I population, but BAOCHE's enrollment criterion was NIHSS ≥6 — so it is unclear whether the 2026 guideline carved out a NIHSS 6–9 IIb stratum or simply describes NIHSS ≥10 as the typical population while allowing the recommendation to extend to NIHSS 6–9 under the same Class I umbrella. The codebase's IIb label may reflect a pre-2026 reading.
- **Recommended fix:** PDF verification required. If 2026 carves out NIHSS 6–9 as IIb explicitly, keep the branch but update wording to current verbatim. If 2026 gives unified Class I for NIHSS ≥6 with PC-ASPECTS ≥6, **merge this branch into the Class I branch (line 272)** and remove the `Basilar EVT - Class IIb` `criteriaName`.
- **Citation(s) for the fix:** Packet Part B Rec #5; ATTENTION PMID 36239644 (DOI 10.1056/NEJMoa2206317); BAOCHE PMID 36273395 (DOI 10.1056/NEJMoa2207576); AHA/ASA 2026 Section 4.7.3.
- **Class E rationale:** Class label change on a major recommendation branch — **Class E** (PDF-VERIFICATION-REQUIRED).

---

### Finding 2 — Basilar NIHSS <6 "Consult / no approval" branch may be too restrictive

- **Severity:** High
- **Pathway branch:** Basilar 0–24 h, NIHSS <6, pc-ASPECTS ≥6
- **Location in code:** `src/pages/EvtPathway.tsx:296–305` (`criteriaName: "Basilar EVT - Low NIHSS"`)
- **What the codebase says:** *"The 2026 AHA/ASA basilar EVT pathway within 24 hours requires baseline mRS 0–1, pc-ASPECTS ≥6, and NIHSS ≥6 for guideline-supported positive recommendations. For basilar occlusion with NIHSS <6, no approval branch is established; discuss urgently with Vascular Neurology and Neurointerventional."* Badge: `No Established LOE`.
- **What the packet says:** Packet Part B Rec #5 explicitly cites NIHSS ≥10 (with NIHSS ≥6 in BAOCHE). Packet does not surface a positive guideline recommendation for basilar NIHSS <6. Trial inclusion: ATTENTION NIHSS ≥10; BAOCHE NIHSS ≥6.
- **Discrepancy:** Codebase language is correct in substance (no positive class for basilar NIHSS <6) but the threshold logic at line 296 routes pc-ASPECTS ≥6 + NIHSS <6 to "Consult"; this is appropriate clinically but the `details` text claims "no approval branch is established" which is slightly stronger than the guideline silence. Minor text drift, no logic change needed.
- **Recommended fix:** Soften "no approval branch is established" to "the 2026 AHA/ASA basilar EVT recommendation pathway does not extend below NIHSS 6 (lower bound from BAOCHE enrollment)." No class label or threshold change.
- **Citation(s) for the fix:** BAOCHE PMID 36273395 (NIHSS ≥6 inclusion); Packet Part B Rec #5.
- **Class E rationale:** Prose-only refinement, no logic change — **Class C-clinical**.

---

### Finding 3 — Basilar mRS >1 hard-exclusion may be tighter than 2026 intends

- **Severity:** Medium
- **Pathway branch:** Basilar 0–24 h, mRS >1 (mRS 2, mRS 3–4)
- **Location in code:** `src/pages/EvtPathway.tsx:249–259` (`criteriaName: "Basilar EVT - Baseline Function"`)
- **What the codebase says:** *"For basilar artery occlusion, the 2026 AHA/ASA guideline-supported EVT pathways within 24 hours are limited to patients with baseline mRS 0–1. Patients with prestroke mRS ≥2 do not meet this calculator's guideline-based basilar approval pathway."* Status: Not Eligible.
- **What the packet says:** Packet Part B Rec #5 specifies prestroke mRS 0–1 as the population; ATTENTION allowed prestroke mRS <3 (age <80) or <1 (age ≥80); BAOCHE allowed pre-stroke mRS <2.
- **Discrepancy:** The codebase encodes mRS 0–1 strictly, while ATTENTION enrolled some prestroke-mRS-2 patients (age <80). The packet does not flag a sub-recommendation for basilar mRS 2 — secondary summaries align with mRS 0–1 as the canonical inclusion. Pathway is appropriately conservative; "Not Eligible" framing may be too definitive given trial inclusion was broader for ATTENTION.
- **Recommended fix:** Consider softening status from "Not Eligible" to "Consult" with `details` noting that ATTENTION enrolled some prestroke-mRS-2 patients (age <80) but the 2026 recommendation language anchors on mRS 0–1. PDF verification recommended.
- **Citation(s) for the fix:** ATTENTION PMID 36239644 (prestroke mRS <3 for age <80); Packet Part B Rec #5.
- **Class E rationale:** Status-change (Not Eligible → Consult) is a clinical-logic decision — **Class E** (PDF-VERIFICATION-REQUIRED).

---

### Finding 4 — Anterior 0–6 h Class I evidence label cites "HERMES" but ignores 2022→2026 ASPECTS expansion

- **Severity:** Medium
- **Pathway branch:** Anterior 0–6 h, mRS 0–1, NIHSS ≥6, ASPECTS 3–10 (Class I)
- **Location in code:** `src/pages/EvtPathway.tsx:355–365` (`criteriaName: "Standard Early Window - Class I"`) and badge map at `src/pages/EvtPathway.tsx:195–196` (`"COR 1 · HERMES"`)
- **What the codebase says:** *"Class I: EVT is recommended for anterior circulation LVO (ICA/M1) within 6h with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS 3–10. (AHA/ASA 2026, Section 4.7.2)"* Badge: `COR 1 · HERMES`.
- **What the packet says:** Packet Part C delta #1: *"Anterior 0–6 h: ASPECTS lower bound dropped from ≥6 to ≥3 (Class I A). Anchored by RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, LASTE."* HERMES IPDMA underpins the historical Class I but does **not** cover the ASPECTS 3–5 expansion (HERMES population was largely ASPECTS ≥6).
- **Discrepancy:** The codebase correctly recognizes ASPECTS 3–10 as Class I (line 356), but the badge ("`COR 1 · HERMES`") attributes the entire 3–10 range to HERMES — which is historically inaccurate for the ASPECTS 3–5 segment. The ASPECTS 3–5 portion is anchored by the large-core trials.
- **Recommended fix:** Update badge mapping (line 195) to differentiate the historical HERMES anchor (ASPECTS ≥6) from the 2026 ASPECTS 3–5 expansion (RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, LASTE). Either split the criteriaName into "Standard Early Window - Class I (ASPECTS ≥6)" and "Early Window Large Core - Class I (ASPECTS 3–5)" or expand the badge to "COR 1 · HERMES + RESCUE-Japan LIMIT / ANGEL-ASPECT / SELECT2 / TENSION / LASTE".
- **Citation(s) for the fix:** Packet Part C #1; RESCUE-Japan LIMIT PMID 35138767; ANGEL-ASPECT PMID 36762852; SELECT2 PMID 36762865; TENSION PMID 37837989; LASTE PMID 38718358.
- **Class E rationale:** Badge text is an evidence-attribution claim — minor logic split if branches are separated; **Class C-clinical** if badge text only, **Class E** if branches are split.

---

### Finding 5 — Late Window ASPECTS 3–5 Class I details cites LASTE (which was a 0–6.5 h trial)

- **Severity:** High
- **Pathway branch:** Anterior 6–24 h, ASPECTS 3–5, age <80, no mass effect (Class I)
- **Location in code:** `src/pages/EvtPathway.tsx:466–475` (`criteriaName: "Late Window ASPECTS 3–5 - Class I"`) and badge at `src/pages/EvtPathway.tsx:208–209` (`"COR 1 · SELECT2/ANGEL-ASPECT/LASTE"`)
- **What the codebase says:** *"In patients under 80 with anterior circulation proximal LVO, prestroke mRS 0–1, ASPECTS 3–5, and no significant mass effect, EVT is recommended. Class I recommendation based on SELECT2, ANGEL-ASPECT, and LASTE."*
- **What the packet says:** SELECT2 window **0–24 h** (Packet Part A SELECT2); ANGEL-ASPECT window **0–24 h** (Packet Part A ANGEL-ASPECT); **LASTE window 0–6.5 h** (Packet Part A LASTE: "LKW within 6.5 h"). Packet Part D row for "Anterior 6–24 h ASPECTS 3–5" cites only **SELECT2, ANGEL-ASPECT** as anchoring trials.
- **Discrepancy:** LASTE does **not** support a 6–24 h late-window Class I claim — its inclusion criterion was LKW ≤6.5 h. Citing LASTE here is incorrect.
- **Recommended fix:** Remove LASTE from the `details` text on line 472 and from the evidence badge on line 209. Replace with "Class I recommendation based on SELECT2 and ANGEL-ASPECT (24 h window)." Update badge to `COR 1 · SELECT2/ANGEL-ASPECT`.
- **Citation(s) for the fix:** SELECT2 PMID 36762865; ANGEL-ASPECT PMID 36762852; LASTE PMID 38718358 (window 6.5 h); Packet Part D.
- **Class E rationale:** Evidence-citation correction with no class/threshold change — **Class C-clinical**.

---

### Finding 6 — Early Window ASPECTS 0–2 (≤6 h) badge cites SELECT2 + ANGEL-ASPECT, which were 0–24 h trials

- **Severity:** Medium
- **Pathway branch:** Anterior 0–6 h, ASPECTS 0–2, age <80, no mass effect (Class IIa)
- **Location in code:** `src/pages/EvtPathway.tsx:385–394` (`criteriaName: "Very Large Core (ASPECTS 0–2) - Class IIa"`) and badge at `src/pages/EvtPathway.tsx:199–200` (`"COR 2a · SELECT2/ANGEL-ASPECT/LASTE"`)
- **What the codebase says:** *"In patients under 80 with anterior circulation proximal LVO, prestroke mRS 0–1, ASPECTS 0–2, and no significant mass effect, EVT is reasonable. Class IIa recommendation based on SELECT2, ANGEL-ASPECT, and LASTE."*
- **What the packet says:** Packet Part B Rec #2: ASPECTS 0–2 Class IIa B-R is **primarily anchored by LASTE** (the only trial enrolling ASPECTS 0–2 with unrestricted infarct size). SELECT2 enrolled ASPECTS 3–5 OR core ≥50 mL — not specifically ASPECTS 0–2. ANGEL-ASPECT enrolled ASPECTS 0–2 only when paired with core 70–100 mL — also not pure ASPECTS 0–2. LASTE was the only RCT enrolling **ASPECTS ≤5 (including 0–2) with no upper infarct-size limit** within 6.5 h. The packet flags this as borderline IIa given the "single-trial anchor."
- **Discrepancy:** The codebase's evidence list is directionally correct but mis-ordered — LASTE should lead, and the SELECT2/ANGEL-ASPECT contribution should be qualified as subgroup data.
- **Recommended fix:** Reorder the `details` text to: *"Class IIa recommendation primarily based on LASTE (the only RCT enrolling ASPECTS 0–2 with unrestricted infarct size in ≤6.5 h), with supporting subgroup data from SELECT2 and ANGEL-ASPECT."* Update badge to `COR 2a · LASTE (primary) + SELECT2/ANGEL-ASPECT subgroup`.
- **Citation(s) for the fix:** LASTE PMID 38718358; SELECT2 PMID 36762865; ANGEL-ASPECT PMID 36762852; Packet Part B Rec #2 verifier flag.
- **Class E rationale:** Evidence-prose update without class change — **Class C-clinical**.

---

### Finding 7 — Late Window ASPECTS ≥6 Class I citation list correct, no fix

- **Severity:** Informational
- **Pathway branch:** Anterior 6–24 h, ASPECTS ≥6, NIHSS ≥6, mRS 0–1 (Class I)
- **Location in code:** `src/pages/EvtPathway.tsx:438–447`
- **What the codebase says:** *"In patients with anterior circulation LVO (ICA or M1) presenting between 6 and 24 hours, with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS ≥6, EVT is strongly recommended. Class I recommendation supported by DAWN and DEFUSE-3."* Badge: `COR 1 · DAWN/DEFUSE-3`.
- **What the packet says:** Packet Part B Rec #3: Class I A, DAWN/DEFUSE-3-profile anchored.
- **Discrepancy:** None. Codebase correctly attributes this branch to DAWN + DEFUSE-3.
- **Recommended fix:** None (informational pass).
- **Class E rationale:** No fix required.

---

### Finding 8 — Anterior 6–24 h "Class IIb large core 50–100 mL" branch may be obsolete in 2026

- **Severity:** High
- **Pathway branch:** Anterior 6–24 h, core 50–100 mL (perfusion-imaging path)
- **Location in code:** `src/pages/EvtPathway.tsx:495–504` (`criteriaName: "Large Core (50-100 mL) - Class IIb"`)
- **What the codebase says:** *"Class IIb: EVT MAY be considered for large cores (50-100 mL) in 6-24h window based on SELECT2/ANGEL-ASPECT trials. Higher risk of symptomatic ICH (15-20%) and uncertain functional benefit. Requires individualized assessment and informed consent. (2026 AHA/ASA Guidelines)."*
- **What the packet says:** SELECT2 (Part A) enrolled "core ≥50 mL on CTP/DWI" up to 24 h with **no upper limit on core volume**; primary outcome was positive. ANGEL-ASPECT enrolled "ASPECTS 0–2 with core 70–100 mL" or "ASPECTS ≥6 with core 70–100 mL"; primary outcome was positive. Packet Part C #3: late-window ASPECTS 3–5 was **upgraded to Class I A** in 2026. The packet does not surface a separate "Class IIb for 50–100 mL late-window core" branch — these patients are now covered under the ASPECTS-based Class I branches.
- **Discrepancy:** The "Class IIb 50–100 mL" label appears to be a pre-2026 reading. With SELECT2's positive primary outcome and the 2026 Class I upgrade for ASPECTS 3–5 in 6–24 h, a 50–100 mL core (which usually corresponds to ASPECTS 0–5) should route to either the ASPECTS-based Class I branch or, if ASPECTS is unknown, to a higher class than IIb. The "15–20% sICH" claim is also higher than the packet's reported sICH rates (SELECT2 sICH 0.6%; ANGEL-ASPECT sICH 6.1%).
- **Recommended fix:** PDF verification required. If 2026 maintains a separate IIb for 50–100 mL core distinct from ASPECTS-based pathways, retain branch but verify exact wording and correct the sICH percentage. If 2026 consolidates this under ASPECTS-based Class I/IIa, **retire this branch** and route 50–100 mL core to the ASPECTS branches. The 15–20% sICH claim should be replaced with packet-verified rates (SELECT2 0.6%; ANGEL-ASPECT 6.1%; LASTE not directly comparable).
- **Citation(s) for the fix:** SELECT2 PMID 36762865; ANGEL-ASPECT PMID 36762852; Packet Part C #3; Part A SELECT2 + ANGEL-ASPECT effect sizes.
- **Class E rationale:** Class label change AND threshold/citation drift — **Class E** (PDF-VERIFICATION-REQUIRED).

---

### Finding 9 — Anterior 6–24 h core >100 mL "Avoid EVT" branch contradicts SELECT2 (no upper core limit)

- **Severity:** High
- **Pathway branch:** Anterior 6–24 h, core >100 mL (perfusion-imaging path)
- **Location in code:** `src/pages/EvtPathway.tsx:507–516`
- **What the codebase says:** *"Core >100 mL: EVT is NOT recommended due to very high rates of futile reperfusion (>80%), hemorrhagic transformation (>20%), and mortality. Best medical therapy preferred. (2026 AHA/ASA Guidelines)."* Status: Avoid EVT.
- **What the packet says:** Packet Part A SELECT2: "ASPECTS 3–5 OR core ≥50 mL on CTP/DWI (**no upper limit on core volume**); LKW within 24 h." SELECT2 primary outcome was positive (gOR 1.51, P<0.001). LASTE Part A: "ASPECTS ≤5 (including 0–2; 'unrestricted size')." Packet does not flag a 2026 recommendation prohibiting EVT at core >100 mL — this contradicts the trials whose primary outcomes drove the 2026 ASPECTS-floor expansion.
- **Discrepancy:** The "core >100 mL → Avoid EVT" branch was a reasonable pre-SELECT2 default but is contradicted by 2026-era trial evidence. The codebase's "futile reperfusion >80%" and "hemorrhagic transformation >20%" claims are not supported by SELECT2 or LASTE data in the packet.
- **Recommended fix:** PDF verification required. If 2026 does not name an upper core volume cutoff, **retire this hard exclusion** and route core >100 mL to a "Consult / individualized" branch with cautions about higher mortality (LASTE EVT-arm mortality 36.1%; SELECT2 EVT-arm mortality ~24%) and edema risk. Remove unsupported "futile reperfusion >80%" and "hemorrhagic transformation >20%" figures.
- **Citation(s) for the fix:** SELECT2 PMID 36762865 (no upper core limit); LASTE PMID 38718358 (unrestricted size); Packet Part A.
- **Class E rationale:** Status change (Avoid EVT → Consult) is a clinical-logic change — **Class E** (PDF-VERIFICATION-REQUIRED).

---

### Finding 10 — DAWN clinical-core mismatch thresholds correctly encoded

- **Severity:** Informational
- **Pathway branch:** Anterior 6–24 h, DAWN clinical-core mismatch
- **Location in code:** `src/pages/EvtPathway.tsx:483–488`
- **What the codebase says:** Logic: NIHSS ≥10 + age ≥80 → core <21 mL; NIHSS ≥10 + age <80 → core <31 mL; NIHSS ≥20 + age <80 → core <51 mL.
- **What the packet says:** Packet Part A DAWN: Group A (age ≥80, NIHSS ≥10, core <21 mL); Group B (age <80, NIHSS ≥10, core <31 mL); Group C (age <80, NIHSS ≥20, core 31–51 mL).
- **Discrepancy:** None. Codebase thresholds match DAWN inclusion exactly.
- **Recommended fix:** None.
- **Class E rationale:** No fix required.

---

### Finding 11 — DEFUSE-3 perfusion thresholds correctly encoded

- **Severity:** Informational
- **Pathway branch:** Anterior 6–24 h, DEFUSE-3 perfusion mismatch
- **Location in code:** `src/pages/EvtPathway.tsx:490–492`
- **What the codebase says:** Logic: core <70 mL, mismatch volume ≥15 mL, mismatch ratio ≥1.8.
- **What the packet says:** Packet Part A DEFUSE-3: "core <70 mL, mismatch ratio ≥1.8, mismatch volume ≥15 mL."
- **Discrepancy:** None. Exact match.
- **Recommended fix:** None.
- **Class E rationale:** No fix required.

---

### Finding 12 — MeVO Class III "No Benefit" wording stronger than DISTAL evidence supports

- **Severity:** Medium
- **Pathway branch:** MeVO — Nondominant M2 / Codominant M2 / Distal MCA / ACA / PCA
- **Location in code:** `src/pages/EvtPathway.tsx:566–579` (`criteriaName: "Class III: No Benefit"`)
- **What the codebase says:** *"In patients with acute ischemic stroke from proximal nondominant or codominant M2, distal MCA, ACA, or PCA occlusions, endovascular thrombectomy using stent retrievers is of no benefit for improving functional outcomes and is not recommended. This is a Class III (No Benefit) recommendation based on ESCAPE-MeVO and DISTAL, which showed no benefit and possible harm with stent retrievers as a first-pass strategy in these vessels."* Badge: `COR 3 · ESCAPE-MeVO/DISTAL`.
- **What the packet says:** ESCAPE-MeVO and DISTAL were both **neutral on primary**; ESCAPE-MeVO showed higher SAE rate in EVT arm (33.9% vs 25.7%) and higher pneumonia/recurrent stroke/stroke progression. DISTAL showed higher sICH (5.9% vs 2.6% — packet Part A DISTAL effect-size + line 1515 in `details` MeVO Risk & Evidence). Packet Part B Rec #8: "secondary summaries (TCTMD, emDocs) describe MeVO as a 'knowledge gap'... appropriate language is 'insufficient evidence to recommend routine EVT for MeVO; individualized decision based on disabling deficit, site, and operator experience.'"
- **Discrepancy:** The packet does NOT confirm a "Class III: No Benefit" label for these vessels in the 2026 guideline. Secondary summaries describe equipoise/knowledge-gap framing rather than a definitive Class III label. The codebase's "Class III: No Benefit" language and `COR 3` badge may be overconfident relative to what 2026 actually states.
- **Recommended fix:** PDF verification required. If 2026 explicitly uses "Class III: No Benefit, LOE A" for these vessels, retain wording and verify against PDF verbatim. If 2026 uses "Class IIb (uncertain)" or "no specific recommendation pending further evidence," **downgrade** to a softer "Consult — insufficient evidence" branch. The DISTAL sICH rate cited in `details` MeVO Risk & Evidence (line 1515: "5.9% vs 2.6%") is consistent with packet data.
- **Citation(s) for the fix:** ESCAPE-MeVO PMID pending (packet flagged for retrieval); DISTAL PMID 39908430; Packet Part B Rec #8; Packet Part D row 9.
- **Class E rationale:** Class label change on a major recommendation branch — **Class E** (PDF-VERIFICATION-REQUIRED).

---

### Finding 13 — MeVO "EVT Reasonable" branch uses "Class IIa" / "COR 2a" badge without packet support

- **Severity:** High
- **Pathway branch:** MeVO — Dominant M2 with disabling deficit + favorable imaging + technical feasibility
- **Location in code:** `src/pages/EvtPathway.tsx:555–564` (`criteriaName: "Selected MeVO"`) and badge at `src/pages/EvtPathway.tsx:217` (`"COR 2a"`)
- **What the codebase says:** Status: EVT Reasonable. *"EVT reasonable for selected MeVO (disabling deficit + favorable imaging + feasible anatomy). Discuss urgently with neurointerventional."* Badge: `COR 2a`.
- **What the packet says:** Packet Part B Rec #8: MeVO is **not given a positive class** in 2026 secondary summaries. ESCAPE-MeVO and DISTAL were both negative. Packet Part D row "MeVO (M2/M3, A2/A3, P2/P3) — likely IIb or none." The packet explicitly warns: "Pathway must **not** present routine MeVO EVT as Class I/IIa."
- **Discrepancy:** The codebase assigns Class IIa ("COR 2a") to a Dominant M2 EVT decision — this directly contradicts the packet's hard rule that MeVO must not be presented as Class I/IIa. Even for dominant M2 with disabling deficit, the 2026 guideline does not appear to grant Class IIa.
- **Recommended fix:** PDF verification required. If 2026 explicitly carves out dominant M2 as Class IIa, retain branch but verify verbatim. If 2026 does not grant Class IIa to any MeVO subset, **downgrade badge to "Class IIb" or "Individualized — no class assigned"** and soften status from "EVT Reasonable" to "Consult / Individualized." Remove the "Class IIa per AHA 2026 infographic" comment at line 551.
- **Citation(s) for the fix:** Packet Part B Rec #8 (hard rule against IIa for MeVO); ESCAPE-MeVO; DISTAL.
- **Class E rationale:** Class label downgrade — **Class E** (PDF-VERIFICATION-REQUIRED).

---

### Finding 14 — Early window "Low NIHSS (<6)" branch returns "Clinical Judgment" without LVO-specific anchor

- **Severity:** Medium
- **Pathway branch:** Anterior 0–6 h, NIHSS 0–5
- **Location in code:** `src/pages/EvtPathway.tsx:323` (`criteriaName: "Early Window (Low NIHSS)"`)
- **What the codebase says:** *"Guidelines recommend EVT if deficit is disabling despite low score (e.g., aphasia, hemianopsia)."* Badge: `Guideline Caveat`. Status: Clinical Judgment.
- **What the packet says:** Packet Part B Rec #9: Low NIHSS (<6) LVO has no clear class in 2026 (likely IIb or no recommendation pending ENDOLOW/MOSTE); ENDOLOW and MOSTE are ongoing. Packet flags this as VERIFY-FAILED.
- **Discrepancy:** Codebase's "guidelines recommend EVT if deficit is disabling" overstates the 2026 position — packet indicates 2026 does NOT name a positive class for NIHSS <6 LVO; it remains an equipoise area pending trials.
- **Recommended fix:** Soften `details` text to: *"For LVO with NIHSS <6, the 2026 AHA/ASA guideline does not name a positive class. ENDOLOW and MOSTE trials are ongoing. Consider individualized decision when deficit is disabling (aphasia, hemianopsia, dominant hand)."*
- **Citation(s) for the fix:** Packet Part B Rec #9; Packet Part D row 10.
- **Class E rationale:** Prose-only refinement — **Class C-clinical**.

---

### Finding 15 — Anterior 0–6 h "Prestroke mRS 2 + ASPECTS ≥6" Class IIa attribution to HERMES is overconfident

- **Severity:** Medium
- **Pathway branch:** Anterior 0–6 h, mRS 2, ASPECTS ≥6 (Class IIa)
- **Location in code:** `src/pages/EvtPathway.tsx:326–337` (`criteriaName: "Early Window mRS 2 - Class IIa"`) and badge at `src/pages/EvtPathway.tsx:192` (`"COR 2a · HERMES"`)
- **What the codebase says:** *"In patients with anterior circulation proximal LVO within 6 hours, NIHSS ≥6, ASPECTS ≥6, and mild prestroke disability (mRS 2), EVT is reasonable. Class IIa recommendation based on pooled patient-level analysis from HERMES."* Badge: `COR 2a · HERMES`.
- **What the packet says:** Packet Part A HERMES: "no prestroke mRS ≥2 patients enrolled in source trials, so HERMES does not directly inform that subgroup." Packet Part B Rec #6: prestroke mRS 2 Class IIa B-R anchor is **observational data** (Salwi 2022 meta-analysis, Italian Endovascular Registry) — NOT HERMES.
- **Discrepancy:** Crediting HERMES for the prestroke-mRS-2 IIa is incorrect — HERMES specifically excluded prestroke mRS ≥2. The packet identifies Salwi 2022 PMID 36147993 and observational meta-analysis as the evidence anchor. The packet also flags that the "B-R" LOE is generous given the observational evidence base.
- **Recommended fix:** Update `details` and badge to remove HERMES attribution. Replace with: *"Class IIa recommendation based on observational meta-analysis (Salwi et al., 2022) and Italian Endovascular Stroke Registry; no RCT enrolled prestroke mRS 2 as a primary stratum."* Badge: `COR 2a · Salwi 2022 / Registry`.
- **Citation(s) for the fix:** Salwi et al. 2022 PMID 36147993; Packet Part A "Prestroke mRS 2–4" entry; Packet Part B Rec #6 verifier flag.
- **Class E rationale:** Evidence-attribution correction — **Class C-clinical**.

---

### Finding 16 — Anterior 0–6 h "Prestroke mRS 3–4" Class IIb appears in 2026 but evidence base is observational only

- **Severity:** Medium
- **Pathway branch:** Anterior 0–6 h, mRS 3–4, ASPECTS ≥6 (Class IIb)
- **Location in code:** `src/pages/EvtPathway.tsx:341–352` (`criteriaName: "Early Window mRS 3-4 - Class IIb"`) and badge at `src/pages/EvtPathway.tsx:194` (`"COR 2b · Cohort Data"`)
- **What the codebase says:** *"In patients with anterior circulation proximal LVO within 6 hours, NIHSS ≥6, ASPECTS ≥6, and moderate prestroke disability (mRS 3–4), EVT might be reasonable. Class IIb recommendation based on retrospective and non-randomized prospective cohorts."*
- **What the packet says:** Packet Part B Rec #7: prestroke mRS 3–4 is **[VERIFY-FAILED]** — no dedicated recommendation in secondary summaries; the 2026 guideline likely uses individualized-decision phrasing. Packet Part A "Prestroke mRS 2–4 — narrative evidence base": *"No prospective RCT data for mRS 3–4 EVT as of 2026-05-15."* Recommendation: "Individualized decision; insufficient RCT evidence; consider patient/family goals."
- **Discrepancy:** Packet flags that a definitive Class IIb label for mRS 3–4 cannot be confirmed from secondary sources. The codebase's "Class IIb" assignment may be either accurate or speculative; the packet recommends individualized-decision phrasing without a class label.
- **Recommended fix:** PDF verification required. If 2026 explicitly assigns Class IIb to prestroke mRS 3–4 with ASPECTS ≥6 in 0–6 h, retain branch but verify exact wording. If 2026 uses individualized-decision phrasing without a class, replace `criteriaName` to "Prestroke mRS 3–4 — Individualized" and remove the explicit "Class IIb" label.
- **Citation(s) for the fix:** Packet Part B Rec #7 [VERIFY-FAILED]; Packet Part A "Prestroke mRS 2–4 narrative evidence base."
- **Class E rationale:** Class label uncertainty — **Class E** (PDF-VERIFICATION-REQUIRED).

---

### Finding 17 — LearningPearl "AHA/ASA 2026 Early Window" mass-effect language sound, but worth one tightening

- **Severity:** Low
- **Pathway branch:** Pearl text in Imaging section, early-window ASPECTS field
- **Location in code:** `src/pages/EvtPathway.tsx:1232–1235`
- **What the codebase says:** *"Class I: EVT recommended for ASPECTS 3–10 with NIHSS ≥6 and mRS 0–1. Class IIa: EVT reasonable for prestroke mRS 2 only when ASPECTS is ≥6, and for selected patients with ASPECTS 0–2 only when prestroke mRS is 0–1, age is <80 years, and there is no significant mass effect. Severe CT hypodensity >=26 mL should trigger caution rather than automatic approval."*
- **What the packet says:** Packet Part C #1 (ASPECTS lower bound dropped to ≥3 — Class I A); Packet Part C #2 (ASPECTS 0–2 Class IIa B-R primarily anchored by LASTE); Packet acknowledges severe-hypodensity caveat from SELECT2 exploratory data.
- **Discrepancy:** Pearl text is substantively accurate. Minor improvement: clarify that the "no significant mass effect" qualifier comes from LASTE/SELECT2 protocol design, not from RCT-level evidence-of-harm with mass effect (which is exploratory).
- **Recommended fix:** Append the trial anchor: *"…anchored by LASTE for unrestricted-size ASPECTS 0–2 enrollment within 6.5 h."*
- **Citation(s) for the fix:** LASTE PMID 38718358; Packet Part C #2.
- **Class E rationale:** Prose-only — **Class C-clinical**.

---

## Severity legend

- **Critical** — clinical logic that could mislead a bedside decision (e.g., wrong class on a class-upgrade branch, wrong ASPECTS cutoff that excludes eligible patients).
- **High** — class/LOE label is wrong but the gross direction of the recommendation is right (e.g., labeled IIa when 2026 made it I), OR an evidence citation that misrepresents trial inclusion (e.g., citing a 6.5 h trial for a 24 h branch).
- **Medium** — text drift, soft caveats missing, slightly outdated phrasing, or evidence-attribution drift that does not change the patient-level decision.
- **Low** — typos, formatting, minor wording.
- **Informational** — no fix needed; flag for awareness.

---

## Findings grouped by branch

### Anterior 0–6 h
- Finding 4 — Class I ASPECTS 3–10 badge attributes HERMES across full range (Medium)
- Finding 6 — ASPECTS 0–2 IIa badge mis-orders LASTE vs SELECT2/ANGEL-ASPECT (Medium)
- Finding 14 — Low NIHSS <6 LVO branch overstates guideline (Medium)
- Finding 15 — mRS 2 + ASPECTS ≥6 IIa badge incorrectly attributes to HERMES (Medium)
- Finding 16 — mRS 3–4 IIb class assignment requires PDF confirmation (Medium)
- Finding 17 — Pearl text minor tightening (Low)

### Anterior 6–24 h
- Finding 5 — Late ASPECTS 3–5 Class I cites LASTE incorrectly (High)
- Finding 7 — DAWN/DEFUSE-3 ASPECTS ≥6 Class I clean (Informational)
- Finding 8 — Large core 50–100 mL Class IIb branch likely obsolete (High)
- Finding 9 — Core >100 mL hard exclusion contradicts SELECT2 (High)
- Finding 10 — DAWN thresholds clean (Informational)
- Finding 11 — DEFUSE-3 thresholds clean (Informational)

### Basilar 0–24 h
- Finding 1 — NIHSS 6–9 Class IIb branch may be obsolete under unified Class I (Critical)
- Finding 2 — NIHSS <6 "no approval branch" wording drift (High)
- Finding 3 — mRS 2 hard exclusion potentially tighter than ATTENTION inclusion (Medium)

### MeVO
- Finding 12 — Class III "No Benefit" wording stronger than packet supports (Medium)
- Finding 13 — Dominant M2 IIa label contradicts packet's hard rule (High)

### LearningPearl content
- Finding 17 — Captured above (early-window pearl) (Low)

---

## PDF-verification queue

Findings blocked on reading the actual AHA/ASA 2026 PDF (the packet's HTTP 403 caveat applies):

1. **Finding 1** — Confirm whether 2026 §4.7.3 grants unified Class I A for basilar EVT at NIHSS ≥6 + pc-ASPECTS ≥6, or whether NIHSS 6–9 retains a separate IIb stratum.
2. **Finding 3** — Confirm whether 2026 §4.7.3 allows prestroke mRS 2 in basilar EVT (ATTENTION enrolled mRS <3 for age <80).
3. **Finding 8** — Confirm whether 2026 §4.7.2 retains a separate "Class IIb large core 50–100 mL" branch distinct from ASPECTS-based pathways.
4. **Finding 9** — Confirm whether 2026 §4.7.2 names an upper core volume cutoff for "Avoid EVT."
5. **Finding 12** — Confirm whether 2026 §4.7.2 explicitly uses "Class III: No Benefit, LOE A" language for nondominant/codominant M2, distal MCA, ACA, PCA — or softer "Class IIb / no recommendation" phrasing.
6. **Finding 13** — Confirm whether 2026 §4.7.2 grants Class IIa to dominant M2 EVT with disabling deficit, or whether all MeVO subsets remain IIb / unrecommended.
7. **Finding 16** — Confirm 2026 §4.7.2 class assignment (if any) for prestroke mRS 3–4 in 0–6 h ASPECTS ≥6.

---

## Recommended Class E task list

Order: severity (Critical first), then High, then Medium. V to pick which to spin up.

### Class E (clinical-logic / class label / threshold changes)

1. **`evt-basilar-class-i-unified`** — Resolve basilar NIHSS 6–9 IIb branch vs unified Class I A (Findings 1, 2). Likely consolidation into a single Class I branch. PDF-verification gated.
2. **`evt-late-large-core-class-iib-retire`** — Retire or rebadge the 6–24 h "Class IIb 50–100 mL core" branch; correct unsupported sICH percentages (Finding 8). PDF-verification gated.
3. **`evt-late-core-100ml-hard-exclude-soften`** — Replace 6–24 h "core >100 mL → Avoid EVT" hard exclusion with individualized-decision branch reflecting SELECT2 + LASTE (Finding 9). PDF-verification gated.
4. **`evt-mevo-class-iii-language-verify`** — Confirm or downgrade "Class III: No Benefit" label for nondominant/codominant M2 / distal MCA / ACA / PCA (Finding 12). PDF-verification gated.
5. **`evt-mevo-dominant-m2-class-iia-verify`** — Confirm or downgrade Class IIa label for dominant M2 EVT (Finding 13). PDF-verification gated.
6. **`evt-mrs34-class-iib-verify`** — Confirm Class IIb label for prestroke mRS 3–4 in 0–6 h ASPECTS ≥6, or replace with individualized-decision phrasing (Finding 16). PDF-verification gated.
7. **`evt-basilar-mrs2-consult-softening`** — Move basilar mRS 2 from "Not Eligible" to "Consult" given ATTENTION enrollment (Finding 3). PDF-verification gated.

### Class C-clinical (evidence-attribution / prose updates, no class/threshold change)

8. **`evt-aspects-3-10-evidence-anchors`** — Update Class I anterior 0–6 h badge to differentiate HERMES (historical, ASPECTS ≥6) from large-core trials anchoring ASPECTS 3–5 (Finding 4).
9. **`evt-late-aspects-3-5-remove-laste`** — Remove LASTE citation from 6–24 h ASPECTS 3–5 Class I branch (LASTE was ≤6.5 h) (Finding 5).
10. **`evt-early-aspects-0-2-reorder-evidence`** — Reorder ASPECTS 0–2 IIa evidence to lead with LASTE and qualify SELECT2/ANGEL-ASPECT as subgroup-only (Finding 6).
11. **`evt-mrs2-iia-replace-hermes-attribution`** — Replace HERMES attribution for prestroke mRS 2 IIa with Salwi 2022 + Italian registry (Finding 15).
12. **`evt-low-nihss-lvo-language-soften`** — Soften early-window NIHSS <6 LVO `details` to reflect equipoise pending ENDOLOW/MOSTE (Finding 14).
13. **`evt-basilar-low-nihss-language-tighten`** — Refine basilar NIHSS <6 wording from "no approval branch is established" to "below BAOCHE enrollment floor" (Finding 2).
14. **`evt-early-pearl-laste-anchor`** — Append LASTE trial anchor to early-window pearl text (Finding 17).

### No fix required (Informational)

- Finding 7 (Late ASPECTS ≥6 Class I)
- Finding 10 (DAWN thresholds)
- Finding 11 (DEFUSE-3 thresholds)

---

## Confidence statement

This audit mirrors the evidence packet's stated confidence levels. Per CLAUDE.md §13.1, metadata validity (DOIs/PMIDs verified, trial inclusion criteria captured, class labels triangulated across ≥2 secondary AHA-summary sources) is **not** semantic validity. The AHA/ASA 2026 PDF returned HTTP 403 to the evidence-verifier — section IDs (e.g., 4.7.2, 4.7.3) and the verbatim wording attributed to "AHA Top 10," emDocs, TCTMD, and Cardiology Advisor have only **MEDIUM** confidence and must be field-verified before any class label in `EvtPathway.tsx` is changed.

- **HIGH confidence** that the codebase's basilar pathway uses pre-2026 IIb labels for a branch that 2026 likely upgraded to I A — but the exact NIHSS-stratification under the upgrade (Finding 1) cannot be confirmed without the PDF.
- **HIGH confidence** that LASTE (≤6.5 h) should not be cited in 6–24 h branches (Finding 5) — trial-window mismatch is verifiable from primary source (NEJM 2024, PMID 38718358).
- **HIGH confidence** that HERMES did not enroll prestroke mRS ≥2 patients (Finding 15) — packet Part A HERMES entry is explicit.
- **MEDIUM confidence** that the MeVO Class III label and the dominant M2 Class IIa label are overconfident (Findings 12, 13) — packet recommends individualized-decision framing but does not definitively contradict the codebase's labels.
- **MEDIUM confidence** that "core >100 mL → Avoid EVT" (Finding 9) and "Class IIb 50–100 mL" (Finding 8) are obsolete — SELECT2 primary-outcome data support the directional claim but the 2026 PDF could still carve out these branches separately from ASPECTS pathways.

All seven PDF-VERIFICATION-REQUIRED findings should be resolved against the official AHA/ASA 2026 PDF before any Class E task spins. Class C-clinical evidence-attribution fixes (8–14 above) can proceed with primary-source citation (PubMed-verified PMIDs from the packet) and do not require PDF gating.
