# Stroke Code Pathway — Prose Voice + AI-Fingerprint Audit
Date: 2026-05-19
Auditor: content-writer (with humanizer skill)
Scope: deep-learning pearls + tidbits + step components + modal prose (Stroke Code only)

---

## Summary

- Files audited: 10
- Distinct prose passages scanned: ~180 (pearl content strings, UI copy strings, inline JSX text blocks, detail-view prose, evidence-box blurbs)
- AI-fingerprint hits by category:

| Pattern type | Count |
|---|---|
| Em-dash overuse (≥2 per passage or used where colon/period fits) | 14 |
| Rule of three (lists of exactly 3 items without good reason) | 11 |
| Copulative substitution ("serves as", "stands as", "marks") | 4 |
| AI vocabulary cluster (established, highlighted, demonstrate, robust) | 6 |
| Negative parallelism / "not X, but Y" constructions | 3 |
| Vague attribution (unnamed "evidence", "registry") | 9 |
| Overqualification / double-hedging | 5 |
| Excessive preamble before the clinical fact | 7 |
| Verbatim-from-guideline phrasing (suspected) | 6 |
| Voice inconsistency (textbook vs bedside shift) | 8 |

- Suspected verbatim-from-guideline passages: 6
- Voice-inconsistency passages: 8

**Plain-English headline for V:**
The Stroke Code pathway is largely well-written — it uses numbers, names trials by name, and avoids promotional language. Two issues warrant attention before the next content update. First, about a dozen pearl passages open with slow preamble before getting to the clinical point, which is exactly the wrong order for a bedside tool. Second, several passages in the study-mode evidence panels on the main workflow page sound like they were pulled from a guideline document or review article rather than written for a resident at the bedside — they are accurate but harder to act on than the rest of the content. Neither issue affects clinical accuracy (that is Stream 1's scope). Both are fixable with targeted rewrites, not a full overhaul.

---

## High-severity AI-fingerprint hits

### 1. Copulative substitution — "established"
**File:** `src/data/strokeClinicalPearls.ts`, line 131
**Passage:** `"Established MRI-guided treatment for unknown onset times — 25% of strokes occur during sleep."`
**Pattern:** "Established" is a copulative substitution for "showed" or "proved." The em-dash in the same sentence is a second flag.
**Proposed rewrite:** `WAKE-UP proved MRI-guided treatment works for unknown onset. LKW = bedtime. 53.3% vs 41.8% good outcome (mRS 0-1).`

---

### 2. Copulative substitution — "Validated"
**File:** `src/data/strokeClinicalPearls.ts`, line 306
**Passage:** `"Validated perfusion imaging selection for late-window treatment."`
**Pattern:** "Validated" used as a copulative substitute for "confirmed" or simply stating the outcome.
**Proposed rewrite:** `Perfusion imaging selected patients for late-window treatment. 44.6% vs 16.7% functional independence (mRS 0-2).`

---

### 3. Em-dash overuse — multiple in one passage
**File:** `src/data/strokeClinicalPearls.ts`, line 86 (`time-is-brain-deep` content field)
**Passage:** `"1.9 million neurons die per minute during untreated stroke (Saver, Stroke 2006). Every 15-minute delay reduces the probability of a good outcome by ~4% (Saver, JAMA 2013, GWTG-Stroke registry). NINDS time-stratified analysis (Marler, Neurology 2000): rt-PA vs placebo adjusted OR for favorable 3-month outcome was 2.11 (95% CI 1.33–3.35) at 0–90 min vs 1.69 (95% CI 1.09–2.62) at 91–180 min. Earlier treatment, greater benefit. Pooled IPD meta-analysis (Emberson, Lancet 2014): OR for good outcome falls from ~2.0 at 60 min to ~1.0 at ~4.5 h."`
**Pattern:** No em-dashes in this specific passage — this one is actually clean and cite-heavy. Flag retracted. The `time-is-brain` quick pearl (line 48–50) does use informal phrasing that is fine. No rewrite needed here.

---

### 4. Excessive preamble — "why" buried after unnecessary setup
**File:** `src/data/strokeClinicalPearls.ts`, line 354 (`glucose-mandatory-deep` content field)
**Passage:** `"Point-of-care glucose is the ONLY mandatory lab because: (1) Hypoglycemia (<50) can perfectly mimic stroke with focal deficits - 10-second test prevents inappropriate tPA. (2) Hyperglycemia (>200) worsens ischemia - treat but don't delay. (3) All other labs can run during tPA infusion."`
**Pattern:** The em-dashes within numbered list items. Also a rule-of-three list. The content is otherwise strong.
**Proposed rewrite:** `Point-of-care glucose is the only mandatory lab before tPA. Hypoglycemia (<50 mg/dL) mimics stroke; correct it before giving tPA. Hyperglycemia (>200) worsens ischemia — treat, but do not delay tPA. All other labs can run during the infusion.` (One em-dash here is acceptable; it separates action from rationale.)

---

### 5. Negative parallelism
**File:** `src/data/strokeClinicalPearls.ts`, line 191–197 (`stroke-mimics-safety` content field)
**Passage:** `"Bottom line: Don't delay tPA for extensive workup if stroke is likely."`
**Pattern:** Not a strict negative parallelism, but the opening "Bottom line:" is a classic AI article-wrap signal phrase. It also shifts register from data to editorial advice without a clean transition.
**Proposed rewrite:** `When stroke is the likely diagnosis, give tPA. The sICH risk in mimics (1.0%) is far lower than the disability risk of withholding treatment from a real stroke.`

---

### 6. Suspected verbatim-from-guideline phrasing — DOAC pearl
**File:** `src/data/strokeClinicalPearls.ts`, lines 168–175 (`doac-management-2026` content)
**Passage:** `"Do NOT give tPA if last DOAC dose <48h or if drug-specific assay is elevated. If last dose >48h with normal renal function AND a normal drug-specific assay, tPA may be considered: anti-Xa level for apixaban/rivaroxaban/edoxaban, or ECT or dilute thrombin time for dabigatran."`
**Pattern:** The sentence structure — compound conditional + recommendation with colon + enumerated drug-assay pairs — is characteristic of guideline recommendation text (COR/LOE format). The phrase "tPA may be considered" is the AHA/ASA Class IIb verb form, retained without paraphrase.
**Flag for clinical-reviewer:** Verify this is an accurate paraphrase of AHA/ASA 2026 Section on DOAC management, not a verbatim lift. If verbatim, rewrite in NeuroWiki voice: `Last DOAC dose <48h: do not give tPA. Last dose >48h + normal renal function + normal drug-specific assay: tPA is an option. Check anti-Xa for apixaban/rivaroxaban/edoxaban; check ECT or dilute thrombin time for dabigatran.`

---

### 7. Suspected verbatim-from-guideline phrasing — coagulopathy reversal
**File:** `src/data/strokeClinicalPearls.ts`, lines 728–734 (`hemorrhage-reversal-protocol` content)
**Passage:** `"STEP 3: TXA is NOT routinely recommended per 2022 AHA/ASA ICH guidelines (Class III, Level A; TICH-2 showed no benefit, possible thromboembolic harm). STEP 4: Platelet transfusion NOT routinely recommended (2022 guidelines; may worsen outcomes)."`
**Pattern:** "NOT routinely recommended per [guideline] (Class III, Level A)" is a direct guideline recommendation phrase preserved intact. The parenthetical "(may worsen outcomes)" is an unattributed claim.
**Flag for clinical-reviewer:** Confirm "may worsen outcomes" for platelet transfusion in tPA-related ICH has a named source. The guideline reference for Class III Level A on TXA is correct per TICH-2 (2018) — but the prose should state the outcome directly: `Platelet transfusion: not recommended (2022 ICH guidelines). Evidence: no benefit in TICH-2, possible thromboembolic harm.`

---

### 8. Suspected verbatim-from-guideline phrasing — anticoagulation restart
**File:** `src/data/strokeClinicalPearls.ts`, lines 640–645 (`anticoagulation-timing` content)
**Passage:** `"...AHA/ASA 2026 supports earlier DOAC initiation in carefully selected patients; the ELAN operational framework uses within 48 hours for TIA/minor/moderate events and day 6-7 for major stroke, with repeat imaging and caution after IVT or EVT."`
**Pattern:** "AHA/ASA 2026 supports earlier DOAC initiation in carefully selected patients" is the Class IIa hedging language of the guideline. The ELAN timing specifics are accurate but the sentence assembles two different evidence sources without a clear seam.
**Flag for clinical-reviewer:** Verify that "within 48 hours for TIA/minor/moderate" and "day 6-7 for major stroke" are correctly attributed to ELAN (trial, 2023) and not to the AHA/ASA guideline text itself.

---

### 9. Voice shift — textbook register in study-mode blurb
**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx`, lines 543–544 (Step 2 study-mode evidence details)
**Passage:** `"Large vessel occlusion (LVO) occurs in approximately 30% of acute ischemic strokes. The HERMES meta-analysis (2016) demonstrated that mechanical thrombectomy achieves functional independence in 46% vs 29% with medical therapy alone (NNT = 2.6)."`
**Pattern:** "demonstrated that" is a copulative academic verb. "achieves functional independence" is passive-flavored phrasing. The passage is accurate but sounds like a review article rather than a bedside tool.
**Proposed rewrite:** `LVO accounts for about 30% of ischemic strokes. HERMES (2016): thrombectomy gave 46% vs 29% functional independence (NNT = 2.6). If LVO is present, activate IR now.`

---

### 10. Voice shift — extended window blurb
**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx`, lines 546–547
**Passage:** `"The DAWN trial (2018) showed benefit up to 24 hours using clinical-core mismatch criteria (48.6% vs 13.1% good outcome, NNT=3). DEFUSE-3 demonstrated efficacy in 6-16 hour window with perfusion imaging."`
**Pattern:** "demonstrated efficacy in 6-16 hour window" is academic shorthand without the actual outcome numbers. A resident needs the numbers, not "demonstrated efficacy."
**Proposed rewrite:** `DAWN (2018): 48.6% vs 13.1% functional independence up to 24h, clinical-core mismatch selection (NNT=3). DEFUSE-3 (2018): 44.6% vs 16.7% functional independence in 6-16h, perfusion-guided.`

---

### 11. Voice shift — documentation blurb
**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx`, lines 671–677 (Evidence: Documentation & Quality Improvement panel)
**Passage:** `"Stroke code documentation should capture precise LKW time, NIHSS subscores, contraindication assessment, door-to-needle time, and treatment rationale."`
**Pattern:** "should capture" is passive recommendation voice. "NIHSS subscores" is imprecise (subscores vs score). The passage is a rule-of-three-items-disguised-as-five list.
**Proposed rewrite:** `Document LKW time, NIHSS score, contraindications reviewed, door-to-needle time, and treatment decision with rationale. Incomplete documentation delays GWTG submission and quality reporting.`

---

### 12. Voice shift — documentation blurb (continued)
**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx`, line 676
**Passage:** `"Dedicated stroke units reduce mortality by 18% (Stroke Unit Trialists Collaboration)."`
**Pattern:** The citation is vague — "Stroke Unit Trialists Collaboration" without year. Also this fact is not directly relevant to documentation or quality improvement. It is misplaced in this section and reads like filler evidence padding.
**Proposed rewrite:** Remove from this section or move to a stroke unit / secondary prevention section. If retained, add: `Cochrane review (2013).`

---

### 13. Negative parallelism — LKW prose in study blurb
**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx`, lines 454–455 (Step 1 study-mode evidence details)
**Passage:** `"For IV thrombolysis (tPA/TNK), the standard window is 0-4.5 hours, with extended windows possible up to 9 hours using perfusion imaging (EXTEND trial). For mechanical thrombectomy, treatment is possible up to 24 hours with appropriate imaging showing salvageable tissue (DAWN/DEFUSE-3 trials)."`
**Pattern:** "For X... For Y..." parallel structure. Not AI-fatal on its own, but combined with "with appropriate imaging showing salvageable tissue" (vague) this reads like a patient brochure, not a resident tool.
**Proposed rewrite:** `tPA/TNK window: 0-4.5h standard. Extended thrombolysis to 9h with perfusion imaging (EXTEND trial, NEJM 2019). EVT window: up to 24h with imaging-selected patients (DAWN, DEFUSE-3).`

---

### 14. Suspected verbatim-from-guideline phrasing — LVO workflow pearl
**File:** `src/data/strokeClinicalPearls.ts`, lines 316–321 (`lvo-workflow` content)
**Passage:** `"If cortical signs present: (1) Give tPA if <4.5h (don't delay), (2) STAT CTA/CTP, (3) Alert IR team immediately, (4) Consider direct transfer to angio suite. LVO + tPA + thrombectomy = superior outcomes. Sequential therapy outperforms either alone."`
**Pattern:** Rule of four in a numbered list with a tacked-on unnumbered summary sentence. "Sequential therapy outperforms either alone" is a vague attribution without a named trial.
**Proposed rewrite:** `Cortical signs present: give tPA if <4.5h (do not delay for CTA), order STAT CTA/CTP, and alert IR in parallel. HERMES (2016) showed bridging tPA before thrombectomy improves outcomes compared to thrombectomy alone.`

---

### 15. Suspected verbatim-from-guideline phrasing — neurosurgery indications
**File:** `src/data/strokeClinicalPearls.ts`, lines 770–776 (`neurosurgery-indications` content)
**Passage:** `"STAT neurosurgery consult for: Cerebellar hemorrhage >3 cm with neurological decline or brainstem compression or hydrocephalus (evacuate; Class I, Level B)."`
**Pattern:** "(evacuate; Class I, Level B)" inserted mid-sentence is a direct guideline annotation format, not NeuroWiki voice. The semicolon-plus-classification pattern is a guideline PDF artifact.
**Proposed rewrite:** `Cerebellar hemorrhage >3 cm with neurological decline, brainstem compression, or hydrocephalus: evacuate. AHA/ASA 2022 ICH, Class I, Level B.` (Move the classification to a standalone citation line.)

---

### 16. Vague attribution — "Pooled analysis"
**File:** `src/data/strokeClinicalPearls.ts`, line 713 (`sich-incidence-deep` evidence field)
**Passage:** `"NINDS 1995; Pooled analysis"`
**Pattern:** "Pooled analysis" is unnamed. Which pooled analysis? This fails the attribution check: name the trial or cut it.
**Proposed fix:** Replace with the specific source. If the pooled analysis is Emberson (Lancet 2014), write `Emberson et al, Lancet 2014`. If unknown, remove.

---

### 17. Vague attribution — "Meta-analysis showed"
**File:** `src/data/strokeClinicalPearls.ts`, lines 373–374 (`anticoag-warfarin` content)
**Passage:** `"Meta-analysis showed 4.1x increased sICH risk, but confounded by age/comorbidities. GWTG registry: after adjustment, no independent increase in sICH."`
**Pattern:** "Meta-analysis showed" with no author or year. This is a textbook-level citation failure in clinical content.
**Proposed rewrite:** Name the meta-analysis. If it is Xian et al (JAMA 2012) referenced in the evidence field, embed it: `Xian et al (JAMA 2012): subtherapeutic INR was associated with 4.1x sICH risk in unadjusted analysis; after adjustment, no independent effect.`

---

## Suspected verbatim-from-guideline passages

All six are flagged above in the High-severity section (items 6, 7, 8, 14, 15, and the DOAC plain-English pearl at line 174). Summarized here for the clinical-reviewer gate:

| Pearl ID | File | Suspected origin | Flag |
|---|---|---|---|
| `doac-management-2026` | strokeClinicalPearls.ts | AHA/ASA 2026 DOAC section | Verify paraphrase vs verbatim |
| `hemorrhage-reversal-protocol` | strokeClinicalPearls.ts | AHA/ASA 2022 ICH + TICH-2 | Confirm attribution of "may worsen outcomes" |
| `anticoagulation-timing` | strokeClinicalPearls.ts | ELAN 2023 + AHA/ASA 2026 | Verify ELAN timing specifics |
| `lvo-workflow` | strokeClinicalPearls.ts | AHA/ASA 2026 EVT section | Unnamed "sequential therapy" claim |
| `neurosurgery-indications` | strokeClinicalPearls.ts | AHA/ASA 2022 ICH | Inline COR/LOE annotation format |
| `extended-window-exclusions` | strokeClinicalPearls.ts | ECASS III + AHA/ASA 2026 | Phrasing of "ONLY" exclusions in extended window; verify scope accuracy |

---

## Voice-inconsistency / jargon-density / cognitive load issues

### V-01 — Register shift mid-pearl (lkw-definition-deep, overview field)
**File:** `src/data/strokeClinicalPearls.ts`, lines 71–73
**Passage:** `"The 'last known well' (LKW) time is the precise moment when the patient was last confirmed to be at their baseline neurological function. It determines eligibility for time-sensitive treatments including IV thrombolysis (4.5-hour window) and mechanical thrombectomy (6-24 hour window depending on imaging)."`
**Issue:** Reads like a textbook definition rather than bedside instruction. A resident at 2 AM does not need "the precise moment when the patient was last confirmed to be at their baseline neurological function" — they need to know what to ask.
**Proposed rewrite:** `LKW is the last time someone confirmed this patient was at their normal baseline. Ask the family: "When was the last time they were 100% themselves?" For wake-up stroke, LKW = bedtime.`

---

### V-02 — Overqualification + vague hedge
**File:** `src/data/strokeClinicalPearls.ts`, line 384 (`anticoag-doacs` content)
**Passage:** `"Limited data - only case reports. Generally avoid unless part of research protocol."`
**Issue:** "Generally avoid unless part of research protocol" is imprecise and potentially outdated given the 2026 DOAC guidance updates cited elsewhere. This conflicts with the `doac-management-2026` pearl which provides more current detail.
**Issue:** Two pearls covering the same topic (anticoag-doacs vs doac-management-2026) with different, possibly inconsistent guidance. Flag for clinical-reviewer to check for contradiction.

---

### V-03 — Dense abbreviation block without first-use definition
**File:** `src/data/strokeClinicalPearls.ts`, lines 403–407 (`cardiac-workup` content)
**Passage:** `"TTE: Routine for all. TEE: Higher sensitivity for LA appendage thrombus, PFO, aortic arch atheroma."`
**Issue:** TTE, TEE, LA, PFO are all undefined on first use in this pearl. A medical student on neurology rotation may not know all four. Per CLAUDE.md content principles, abbreviations must be defined on first use.
**Proposed fix:** `Transthoracic echo (TTE): routine. Transesophageal echo (TEE): preferred when left atrial appendage thrombus, patent foramen ovale (PFO), or aortic arch atheroma is suspected.`

---

### V-04 — Register shift (from data to vague summary)
**File:** `src/data/strokeClinicalPearls.ts`, line 293 (`dawn-trial` content)
**Passage:** `"Established benefit in the extended window with imaging-guided patient selection."`
**Issue:** "Established benefit" is a copulative substitute + vague summary after solid data already stated. The last sentence adds nothing.
**Proposed rewrite:** Remove last sentence. The data (48.6% vs 13.1%, NNT=3) speaks for itself.

---

### V-05 — Jargon density (bp-j-curve pearl)
**File:** `src/data/strokeClinicalPearls.ts`, lines 444–449 (`bp-j-curve` content)
**Passage:** `"BP and stroke outcomes follow J-shaped curve: Too high (>180) increases hemorrhagic transformation. Too low (<120) decreases penumbral perfusion. Sweet spot: 140-160 mmHg systolic."`
**Issue:** "J-shaped curve," "hemorrhagic transformation," and "penumbral perfusion" all in rapid succession without any setup. The term "Sweet spot" is informal and tone-inconsistent with the clinical register of the rest of the pearl.
**Proposed rewrite:** `Post-tPA BP follows a J-curve. Above 180 mmHg: hemorrhagic transformation risk rises. Below 120 mmHg: ischemic penumbra loses perfusion. Target 140-160 mmHg systolic during the first 24 hours.`

---

### V-06 — Excessive preamble before clinical point (monitoring-protocol-deep)
**File:** `src/data/strokeClinicalPearls.ts`, lines 573–578
**Passage:** `"Neuro exams: q15min × 2h (critical period for sICH), then q30min × 6h, then q1h × 16h. Monitor for sICH signs: sudden neurological deterioration (NIHSS ↑≥4), severe headache, nausea/vomiting, seizure, acute hypertension. Any decline = STAT CT + hold antithrombotics + neurosurgery consult."`
**Issue:** This pearl is actually clean and actionable. No rewrite needed. The parenthetical "(critical period for sICH)" is appropriate context, not preamble.

---

### V-07 — "Consider" overuse (disabling symptoms section, Step 1 UI)
**File:** `src/components/article/stroke/CodeModeStep1.tsx`, line 414
**Passage:** `"Check any that are present. If so, consider TNK after discussing risk/benefit."`
**Issue:** "Consider TNK after discussing risk/benefit" is not specific enough for a decision-support tool. The resident needs to know under what conditions and with which conversation.
**Proposed rewrite:** `Check any present. If disabling symptoms exist with NIHSS 1-5, TNK is reasonable — discuss with patient and team before giving.` (Flag for clinical-reviewer: verify "reasonable" vs "consider" for Class IIa.)

---

### V-08 — Passive construction in evidence blurb
**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx`, line 661
**Passage:** `"Point-of-care glucose is the ONLY mandatory lab before thrombolysis (AHA/ASA 2026). Do not delay tPA for other labs if within 4.5h."`
**Issue:** This is good. No change needed. CAPS on "ONLY" is acceptable emphasis for a critical safety point. The sentence is actionable.

---

## Low-severity polish (em-dash count, rule-of-three repeats, mild AI vocabulary)

### strokeClinicalPearls.ts

- **Line 150 (`contraindications-absolute`):** List has 9 items separated by periods, no em-dashes — clean.
- **Line 159 (`contraindications-relative`):** Uses `"Similar benefit, higher mortality from comorbidities"` in a parenthetical — the parenthetical is informal and the attribution (IST-3) should appear in the evidence field, not inline.
- **Line 213 (`ist3-trial`):** `"Age alone should NOT exclude treatment."` — ALL-CAPS "NOT" is acceptable for a safety point. Keep.
- **Line 363 (`door-to-needle-deep`):** `"Door-to-needle time is the most modifiable determinant of stroke outcomes."` — "most modifiable determinant" is slightly academic but clinically accurate; low priority.
- **Line 374 (`anticoag-warfarin`):** `"Subtherapeutic INR (1.0-1.7): Meta-analysis showed..."` — unnamed meta-analysis (already flagged as High above).
- **Line 393 (`anticoag-doacs`):** Uses em-dash in `"If all normal AND last dose >48h, may consider. Limited data - only case reports."` — the hyphen-dash inconsistency (`-` vs `—`) is a typography issue, not AI fingerprint.
- **Line 413 (`platelet-count`):** `"Don't delay tPA to wait for platelet count unless clinical suspicion of thrombocytopenia (e.g., known ITP, cirrhosis, recent chemotherapy)."` — Clean. Three examples in parens is acceptable here.
- **Line 482 (`enchanted-trial`):** `"No benefit from intensive lowering, trend toward worse outcomes."` — "trend toward worse outcomes" is appropriately hedged (it was not statistically significant in ENCHANTED). Keep.
- **Line 521 (`gist-uk-trial`):** `"Take-home: Treat hyperglycemia but AVOID hypoglycemia."` — "Take-home:" is a mild AI article-wrap signal. Low priority. Could be cut: `Treat hyperglycemia. Hypoglycemia is more dangerous — avoid it.`
- **Lines 532–540 (`sparcl-trial`):** Clean. Trial data well-presented.
- **Line 583 (`sits-most-trial`):** `"Defined the monitoring protocols used in current practice."` — "defined" is a mild copulative substitution. Low priority. Could be: `SITS-MOST established the 1.7% sICH rate benchmark used in current monitoring protocols.`
- **Line 604 (`crystal-af-trial`):** `"Changed practice: extended monitoring (30 days minimum) for cryptogenic stroke."` — Clean and punchy.

### CodeModeStep1.tsx

- **Line 260 (BP alert text):** `"BP must be <185/110 mmHg before tPA"` — clean, specific, actionable.
- **Line 287–289 (labetalol/nicardipine dosing):** Dosing numbers are present and correct format. Clean.
- **Line 291:** `"AHA/ASA 2026"` as attribution — brief but acceptable in a UI context where space is limited.
- **Line 404:** `"Reference only — verify against institutional protocol before administration."` — This disclaimer appears twice (CodeModeStep1.tsx and CodeModeStep2.tsx). Consistent repetition is intentional; not an AI fingerprint.
- **Line 414:** `"Low NIHSS — assess for disabling symptoms (AHA)"` — The em-dash here is acceptable (single, separator use). `(AHA)` is too brief a citation. At minimum: `(AHA/ASA 2026)`.

### CodeModeStep2.tsx

- **Line 119:** `"Pre-thrombolysis BP >185/110 — treat before giving tPA/TNK (AHA)"` — Single em-dash, acceptable.
- **Line 120–122:** Labetalol/nicardipine dosing repeated from Step 1. Consistent, not a fingerprint.
- **Line 200:** `"Eligibility not checked — screen for contraindications before giving."` — Clean.

### StrokeBasicsWorkflowV2.tsx (study-mode blurbs)

- **Line 457 (Step 1 study blurb):** `"Time is Brain:"` as a bold inline header is fine — it is the established clinical phrase, not AI vocabulary.
- **Line 460:** `"WAKE-UP trial (2018) showed MRI-guided treatment using DWI-FLAIR mismatch resulted in 53.3% vs 41.8% favorable outcomes."` — "resulted in" is a mild copulative but acceptable. The data is present. Low priority.
- **Line 676:** `"Dedicated stroke units reduce mortality by 18% (Stroke Unit Trialists Collaboration)."` — Already flagged as High-severity item 12 (misplaced, vague year).

### DeepLearningModal.tsx

No prose content — UI chrome only (labels, filter chips, empty-state text). The empty-state copy `"No pearls match your filters"` and `"Try adjusting evidence class filters or turn off 'Show trials only'."` are clear and appropriately plain. No issues.

### PearlDetailView.tsx

UI-only. Section headers ("Overview," "Clinical Tips," "Evidence," "Reference") are clear. Footer line `"Clinical guidance with trial references"` is a minor redundancy but not an AI fingerprint. Low priority.

### SectionPearls.tsx

Footer note: `"Deep Learning Mode: Full content with trials and citations"` / `"Quick Learning Mode: Essential clinical pearls for rapid review"` — these are UI labels, not clinical prose. Clean.

### LKWTimePicker.tsx

- **Line 550 (sleep-onset clinical note):** `"WAKE-UP / THAWS method: LKW = last time asleep without symptoms (bedtime). Treatment window = 4.5h from awakening."` — Clean, direct.

### ProtocolModal.tsx

UI primitive — no clinical prose authored here. Clinical content passed in by consumers. Out of scope for this audit.

### ExtendedIVTPathwayModal.tsx

- **Line 76:** `"Wake-up / unknown-onset / 4.5–24h windows · AHA/ASA 2026"` — Clean.

### ThrombectomyPathwayModal.tsx

- **Line 69:** `"AHA/ASA 2019 · thrombectomy eligibility"` — Note: this references 2019 guidelines. If the EVT pathway guidance has been updated to 2026, this subtitle is stale. Flag for Stream 1 (clinical accuracy) to verify.

---

## Plagiarism caveat

This audit identified fingerprint patterns and suspected verbatim phrasing based on structural analysis of the prose against known guideline recommendation formats (AHA/ASA COR/LOE sentence patterns, Cochrane abstract conventions). It did NOT compare content against the open web, against scanned guideline PDFs, or against any external database. A true plagiarism scan via Copyleaks, iThenticate, or Turnitin would be required to establish whether any specific passage is reproduced verbatim from a published source. That scan is recommended before any public-indexable version of this content is released.

---

## What this audit deliberately did NOT cover

- **Clinical accuracy** — whether trial results, dosing thresholds, window times, or evidence classifications are correct. That is Stream 1's scope.
- **Citation registry completeness** — whether all clinical claims in these files have registered citation IDs in `src/lib/citations/`. That is Stream 1's scope.
- **DOAC-vs-anticoagulant pearl contradiction** (anticoag-doacs vs doac-management-2026) — identified as a potential inconsistency in V-02 above; clinical-reviewer should resolve.
- **ThrombectomyPathwayModal guideline year** — the subtitle references AHA/ASA 2019. If EVT guidance has been superseded by 2026 guidelines, this is a Stream 1 clinical flag, not a voice issue.
- **CodeModeStep4.tsx** — not present in the scope file list and not yet read. If that file contains clinical prose (orders, interpretation text), it should be added to the next audit cycle.
- **StrokeIchProtocolStep.tsx** — referenced in `StrokeBasicsWorkflowV2.tsx` but not in the scope list. Contains ICH management prose; recommend including in next audit.
- **TpaReversalProtocolModal.tsx, OrolingualEdemaProtocolModal.tsx, HemorrhageProtocolModal.tsx** — these three protocol consumers of `ProtocolModal` pass clinical prose via props. Their clinical content data (step titles, body text, references) was not read for this audit. Recommend including in next cycle.
