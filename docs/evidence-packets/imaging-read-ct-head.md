# EVIDENCE PACKET — Teaching module: "How to read a non-contrast CT head"

**Date:** 2026-07-09
**Verifier:** evidence-verifier (clinical-trial-audit skill)
**Packet type:** Educational interpretation module (anatomy + findings + windows). NOT a trial, NOT a scoring calculator. Two embedded items (Perron mnemonic study, Mainali stroke-window study) are primary studies and audited as such.

## VERIFICATION LIMITATION — read first (affects confidence ceiling)
Direct full-text/DOI resolution was NOT possible in this environment: WebFetch of NCBI/PMC/eutils, Europe PMC, publisher hosts, and Radiopaedia returned HTTP 403 egress-policy denials (per /root/.ccr/README.md, report not retry). WebSearch worked and returned consistent abstract-level content.

**Consequence:** study figures are corroborated by search-engine abstract snippets, not full text resolved by the verifier. Honest ceiling for those figures is **Medium**. `quoted_text` strings are search-derived and must be confirmed verbatim by an author/reviewer with source access before citation `last_reviewed` dates are set per §13.6.

---

## PART A — Two embedded PRIMARY STUDIES

### A1. "Blood Can Be Very Bad" mnemonic + resident accuracy 60% -> 78%
- Proposed id `perron-bcbvb-ct-1998`: Perron AD, Huff JS, Ullrich CG, Heafner MD, Kline JA. *A multicenter study to improve emergency medicine residents' recognition of intracranial emergencies on computed tomography.* Ann Emerg Med. 1998;32(5):554-562. DOI 10.1016/S0196-0644(98)70032-0. PMID **9795316 (FLAG: inferred, confirm)**. Source type `trial` (education-intervention study; label as such in comment).
- Mnemonic expansion Blood / Can (cisterns) / Be (brain) / Very (ventricles) / Bad (bone) — confirmed.
- Design: 83 residents, 5 institutions, pretest -> 2h course -> post-test at 3 months. Accuracy pretest mean 60% (95% CI 58-64%); 3-month post-test 78% (95% CI 75-81%), P<0.001.
- quoted_text (confirm verbatim): "The mean percentage correct before the course was 60% ... At retesting 3 months after the course, the accuracy rate increased to 78% (P<.001)."
- **Framing caveat:** 1998 education study, not patient-outcome evidence. Claim as "a structured search pattern improved resident CT interpretation accuracy in a controlled educational study," NOT "improves diagnostic accuracy" unqualified. NNT N/A.

### A2. Stroke window (~40/40) improves early-ischemia detection 18% -> 70%
- Proposed id `mainali-stroke-windows-2014`: Mainali S, Wahba M, Elijovich L. *Detection of Early Ischemic Changes in Noncontrast CT Head Improved with "Stroke Windows".* ISRN Neurology. 2014;2014:654980. DOI 10.1155/2014/654980. PMID **24967315 / PMC4045559 (FLAG: confirm)**. Source `trial` (single-center reader study, n=50).
- Standard brain window 80/40 vs stroke window 40/40 (width/level) — confirmed. Early ischemic change 9/50 standard vs 35/50 stroke window (18% vs 70%).
- quoted_text (confirm): "Early ischemic changes were detected in 9 patients with standard windows, while EIC was detected using Stroke Windows in 35 patients (18% versus 70%)."
- **Caveats:** small single-center; claim "improves detection sensitivity," not outcomes. A published critique ("CT stroke window settings: an unfortunate misleading misnomer?") notes the benefit is generic narrow-width windowing, not a stroke-specific setting — reflect this hedge in the teaching card.

---

## PART B — TEXTBOOK / REFERENCE ANATOMY & FINDINGS
quoted_text strings search-derived; confirm verbatim before last_reviewed.

### B1. Blood on CT — density, HU, hematoma morphology
- **HU value CONTROVERSIAL / FLAGGED.** Sources vary: acute clotted blood ~50-70 HU (Radiopaedia/Osborn), hyperacute unclotted lower (~30-45), StatPearls (NBK553103) acute +65 to +95 HU. **Teach as a range with mechanism** ("acute clot is hyperdense, roughly 50-70 HU; hyperacute unclotted blood may be lower; exact values vary by source and hematocrit/clot retraction"), NOT a single number. Temporal evolution hyperdense -> isodense (~1-3 wk) -> hypodense (chronic) well-supported.
- Proposed ids `statpearls-ich-imaging` (NBK553103, `textbook`), `radiopaedia-intracranial-haemorrhage` (`textbook`).
- Epidural = biconvex/lentiform, does not cross sutures — `statpearls-epidural-hematoma` (NBK518982). quoted_text (confirm): "Most epidural hematomas appear on CT as a biconvex or lens-shaped (lentiform) hyperdense mass ... epidural hematomas rarely cross suture lines but may cross dural reflections such as the falx or tentorium."
- Subdural = crescentic, crosses sutures but not midline — `radiopaedia-subdural-haemorrhage`. quoted_text (confirm): "Subdural hematomas ... crescent-shaped ... readily cross suture lines but do not cross the midline."
- SAH = blood in sulci/cisterns; hyperdense MCA sign (high specificity, low sensitivity, early <90 min).

### B2. Cisterns
- Suprasellar (circle of Willis sits here), quadrigeminal, ambient (PCA + CN III), interpeduncular, prepontine — confirmed. Basal cistern effacement = raised ICP / herniation. `radiopaedia-basal-cisterns` (`textbook`).

### B3. Brain — early infarct signs + ASPECTS
- Loss of gray-white differentiation + insular ribbon sign = early MCA infarct. PRIMARY: `truwit-insular-ribbon-1990`: Truwit CL et al. *Loss of the insular ribbon.* Radiology. 1990;176(3):801-806. PMID **2389039 (confirm)**. Source `trial`/primary.
- Cytotoxic (cellular, early ischemia) vs vasogenic (BBB breakdown, tumor/late) edema — textbook.
- **ASPECTS regions REUSE + one new:** region definitions -> new `barber-aspects-2000`: Barber PA et al. Lancet. 2000;355(9216):1670-1674. PMID **10905241 (confirm)**, source `trial`. EVT candidacy threshold -> **REUSE existing `aha-asa-2026-4.7.2` + claim `aspects-evt-eligibility-2026`. Do NOT duplicate.**

### B4. Ventricles + hydrocephalus
- Lateral (frontal/temporal/occipital horns, body, atrium/trigone), third, fourth, foramen of Monro, cerebral aqueduct. Evans index >0.30 = ventricular enlargement. Temporal-horn dilation = sensitive early sign; transependymal flow = acute/decompensated. Communicating vs obstructive (FLAG: confirm one-sentence definition). `radiopaedia-hydrocephalus` (`textbook`).

### B5. Bone / scalp
- Linear vs depressed fracture; suture-vs-fracture caution (sutures corticated/zigzag/symmetric; fractures sharp/lucent/non-anatomic/may cross sutures); pneumocephalus; sinus air-fluid levels (indirect basilar-fracture sign); scalp hematoma localizes impact side. `statpearls-skull-fracture` or radiopaedia equivalent. Best on wide bone window.

### B6. Windows + Hounsfield windowing
- Windowing = window width (range) + window level (center). Brain ~80/40; stroke/narrow ~40/40 (A2); subdural wide-ish (unmasks thin SDH blending with calvarium); bone very wide (~2000-4000) for fracture/air. `radiopaedia-windowing-ct` (`definition`/`textbook`). 18->70% attribute to `mainali-stroke-windows-2014`, not generic windowing ref.

### B7. Herniation patterns
- Uncal (transtentorial, uncus into suprasellar cistern, CN III), subfalcine (cingulate under falx, most common), central (diencephalon down through tentorial notch), tonsillar (tonsils through foramen magnum, >5 mm). REVIEW: `riascos-herniation-radiographics-2019`: *Types of Cerebral Herniation and Their Imaging Features.* RadioGraphics. 2019;39(6). DOI 10.1148/rg.2019190018. Source `review`. Optional support: StatPearls Brain Herniation (NBK542246).

---

## Section 8 — Editorial / applicability (stated, not skipped)
Not a trial entry. 8a editorials: N/A to anatomy refs; none for the two small studies. 8b letters: Mainali 2014 has a relevant published critique on "stroke window" terminology — reflect its hedge. 8c guideline incorporation: only ASPECTS->EVT, governed by existing AHA/ASA 2026 §4.7.2. 8d meta-analyses: N/A; for HU value the source-variance itself is the conflicting evidence (flagged B1). No sub-item silently incomplete.

## Section 9 — NeuroWiki field mapping
Educational guide page, NOT a trial entry. **DO NOT touch trialData.ts, trialListData.ts, trialCatalogMeta.ts.**
- registry.ts: add the 13 new citations. Set last_reviewed ONLY after §13.6 incl. verbatim confirmation of flagged PMIDs/quotes. Windows per §13.7 (studies/foundational 36 mo; textbook 36 mo; definition 6 mo).
- claims.ts: new claim entries for each clinical statement (claimId data surface per §13.4).
- REUSE `aha-asa-2026-4.7.2` (registry.ts:564) + claim `aspects-evt-eligibility-2026` (claims.ts:201).

## Section 10 — Verification confidence: MEDIUM
- Medium (not High) for the two study figures (PMIDs/DOIs inferred, full text egress-blocked; confirm at commit).
- Medium-High for anatomy/finding facts (cross-corroborated; quoted_text needs verbatim confirm).
- Flagged: acute-blood HU (range, not single number); two PMIDs; communicating-vs-obstructive one-sentence definition.

## Proposed citation-id list (13 new + 1 reuse)
`perron-bcbvb-ct-1998` · `mainali-stroke-windows-2014` · `barber-aspects-2000` · `truwit-insular-ribbon-1990` · `riascos-herniation-radiographics-2019` · `statpearls-ich-imaging` · `statpearls-epidural-hematoma` · `radiopaedia-subdural-haemorrhage` · `radiopaedia-basal-cisterns` · `radiopaedia-hydrocephalus` · `statpearls-skull-fracture` · `radiopaedia-windowing-ct` · `radiopaedia-intracranial-haemorrhage` — plus REUSE `aha-asa-2026-4.7.2` (+ claim `aspects-evt-eligibility-2026`).
