# Stroke Code Pathway — Clinical Accuracy Audit
Date: 2026-05-19
Auditor: medical-scientist (with stroke-guidelines + trial-statistics skills)
Reference standard: AHA/ASA 2026 Early Management of AIS + 2022 AHA/ASA Spontaneous ICH + 2026 landmark-trial roster (SELECT-2, ANGEL-ASPECT, LASTE, TENSION, TRACE-III, TIMELESS, OPTIMAL-BP, ENCHANTED-2, ELAN, BAOCHE, ATTENTION)
Scope: Stroke Code pathway only — deep-learning pearls + tidbits + detailed views + step components + protocol modals.

## Summary
- Files audited: 14 (strokeClinicalPearls.ts, DeepLearningModal, PearlDetailView, SectionPearls, CodeModeStep1/2/3/4, LKWTimePicker, ProtocolModal, HemorrhageProtocolModal, TpaReversalProtocolModal, ExtendedIVTPathwayModal, ThrombectomyPathwayModal, plus inline prose in StrokeBasicsWorkflowV2.tsx).
- Distinct clinical statements scanned: ~140 (pearls, tidbits, step component clinical strings, "Evidence:" disclosures, "Why this matters" study-mode boxes, protocol-modal step bodies, callout banners).
- Findings by severity: HARD STOP 0 · SHOULD FIX 17 · POLISH 18.
- Plain-English headline for V: No clinically wrong content found that should pause Streams 2 and 3. The pearls and step screens give safe direction at the bedside. The bigger gap is age — about a third of the deep-learning content still frames evidence as it stood in 2018–2019. The most outdated patches are: (a) the “Time Is Brain” pearl quotes a 1.9-million-neurons-per-minute figure that is widely repeated but never re-verified against the 2026 guideline; (b) the LVO content sits on HERMES (2016) and DAWN/DEFUSE-3 and never mentions the 2023 low-ASPECTS trials (SELECT-2, ANGEL-ASPECT, LASTE, TENSION) that lifted EVT in large-core stroke to a Class I recommendation; (c) the BP-management content uses ENCHANTED (2016) but omits OPTIMAL-BP and ENCHANTED-2, which showed intensive lowering after thrombectomy is harmful; (d) tenecteplase is shown as a parallel option without the 2026 elevation to Class I equivalent to alteplase; and (e) several large blocks of pearl prose still carry no citation tagging at all (per CLAUDE.md §13.4 they should). None of these mislead a clinician at the bedside, but the “last refresh” date on this content is overdue. Streams 2 and 3 can continue. A follow-on Class E refresh should rewrite the pearls in `strokeClinicalPearls.ts`, the inline study-mode prose in `StrokeBasicsWorkflowV2.tsx`, and the “AHA/ASA 2019” subtitle in `ThrombectomyPathwayModal` against the 2026 guideline.

---

## HARD STOP — Class E threshold/recommendation changes

**None identified.** No content directly contradicts current AHA/ASA 2026 or 2022 ICH guidance in a way that would mislead a clinician at the bedside. The closest candidates — the ENCHANTED phrasing on post-tPA BP and the "no NNT for ordinal-shift trial" issue on DAWN/DEFUSE-3 — are SHOULD-FIX, not HARD STOP, because (a) the directional recommendation given to the clinician (target <180/105, avoid <140) is still correct in 2026 and (b) DAWN/DEFUSE-3 NNT framing is methodologically wrong but the figure itself is in the same neighborhood as the published functional-independence ARR.

---

## SHOULD FIX — accurate-but-stale, missing citations, framing issues

### S-01. ASPECTS / large-core EVT — no mention of 2023 evidence base
- **File:** `src/data/strokeClinicalPearls.ts` (step-2 deep pearls); `src/pages/guide/StrokeBasicsWorkflowV2.tsx` lines 542–556 (LVO study-mode block).
- **Statement:** Pearls reference HERMES, DAWN, DEFUSE-3 only. No mention of SELECT-2, ANGEL-ASPECT, LASTE, TENSION.
- **Verdict:** (b) stale — clinically correct framing for ASPECTS 6–10 but silent on large-core (ASPECTS ≤5) EVT.
- **Current standard:** AHA/ASA 2026 incorporates 2023 large-core trials (SELECT-2, ANGEL-ASPECT, LASTE, TENSION). EVT in large-core anterior LVO with ASPECTS 3–5 is now Class I in selected patients up to 24 h.
- **Suggested rewording:** Add a deep pearl titled "Large-core EVT (ASPECTS ≤5)" summarizing the 2023 trials with a Class I, Level A tag per the 2026 guideline. Update LVO study-mode block to read "...DAWN/DEFUSE-3 for 6–24 h with mismatch; SELECT-2/ANGEL-ASPECT/LASTE/TENSION extended benefit to large-core (ASPECTS 3–5)."
- **Severity:** SHOULD FIX (Class E — adds a new clinical recommendation surface).

### S-02. Tenecteplase not framed as 2026 Class I equivalent to alteplase
- **File:** `CodeModeStep1.tsx` lines 392–402 (tPA/TNK dose cards); `CodeModeStep2.tsx` lines 237–286 (treatment decision); `strokeClinicalPearls.ts` (no TNK-specific pearl exists).
- **Statement:** TNK shown as a parallel option to tPA without commentary on relative class of recommendation.
- **Verdict:** (b) stale — content treats TNK and alteplase as equivalent options but does not surface that the 2026 guideline elevated TNK to Class I and many centers now prefer it.
- **Current standard:** AHA/ASA 2026 — tenecteplase 0.25 mg/kg (max 25 mg) is reasonable as an alternative to alteplase (Class I/IIa per trial-population context). EXTEND-IA TNK, AcT, TRACE-III support equivalence/noninferiority.
- **Suggested rewording:** Add a deep pearl "Tenecteplase 2026 (Class I equivalent to alteplase)" with AcT (NEJM 2022), EXTEND-IA TNK, and TRACE-III references. Per `trial-statistics` skill — AcT was a noninferiority trial; do NOT show NNT; show the ARD and the NI margin.
- **Severity:** SHOULD FIX (Class E or C-clinical).

### S-03. Post-EVT intensive BP lowering — OPTIMAL-BP / ENCHANTED-2 missing
- **File:** `strokeClinicalPearls.ts` lines 461–490 (`bp-posttpa-deep`, `enchanted-trial`); `CodeModeStep4.tsx` line 121 (bp-control rationale — note that this rationale is actually accurate and cites the post-EVT harm signal).
- **Statement:** Pearl says "ENCHANTED trial: Intensive lowering (<140) had mixed results - no clear benefit, possible harm." This is correct for IVT but does not flag the stronger harm signal in the post-EVT population.
- **Verdict:** (b) stale — single trial (ENCHANTED) is named; the more recent OPTIMAL-BP (2024) and ENCHANTED-2 (2023) are not, despite being more clinically important post-2024.
- **Current standard:** AHA/ASA 2026 §4.3 #10 — intensive SBP target <140 mmHg for 72 h after successful EVT in anterior-circulation LVO is Class III: Harm, Level A (based on OPTIMAL-BP, ENCHANTED-2).
- **Suggested rewording:** Update `bp-posttpa-deep` to add "Post-EVT: intensive lowering <140 mmHg for 72 h is HARMFUL (Class III: Harm, Level A per OPTIMAL-BP, ENCHANTED-2). Maintain <180/105." Add a new pearl on OPTIMAL-BP and another on ENCHANTED-2. Note: `CodeModeStep4.tsx` line 121 already contains this — replicate the framing in the pearl layer.
- **Severity:** SHOULD FIX (Class E — clarifies a Class III: Harm recommendation).

### S-04. Late-window thrombolysis — TRACE-III and TIMELESS missing
- **File:** `strokeClinicalPearls.ts` (step-1 deep — only WAKE-UP and EXTEND named); `pages/ExtendedIVTPathway.tsx` embedded via `ExtendedIVTPathwayModal`.
- **Statement:** Pearl set for late-window IVT covers WAKE-UP and EXTEND only.
- **Verdict:** (b) stale — missing the major 2023–2024 late-window trials.
- **Current standard:** TRACE-III (Lancet 2024 — tenecteplase 4.5–24 h with salvageable tissue in LVO); TIMELESS (NEJM 2024 — tenecteplase 4.5–24 h salvageable tissue). AHA/ASA 2026 incorporates both.
- **Suggested rewording:** Add deep pearls for TRACE-III and TIMELESS. Update `extended-window-exclusions` to reference 2026 framing rather than ECASS III alone for the >4.5 h window.
- **Severity:** SHOULD FIX (Class E).

### S-05. DAWN/DEFUSE-3 — NNT framing violates ordinal-shift rules
- **File:** `strokeClinicalPearls.ts` lines 291–313 (`dawn-trial`, `defuse3-trial`); also referenced as "NNT=2.6" in HERMES and "NNT=3" in DAWN in step-2 pearls and inline study-mode block.
- **Statement:** "DAWN ... 48.6% vs 13.1% functional independence (mRS 0-2, NNT=3)." "HERMES ... 46% vs 29% good outcome (OR 2.49, NNT=2.6)."
- **Verdict:** (b) and (d) — the underlying figures are reproduced correctly from the primary publications, but the trials' primary endpoints were ordinal mRS analyses and DAWN was Bayesian-adaptive with co-primary endpoints. Per `trial-statistics` skill, do NOT compute NNT from an ordinal-shift or Bayesian co-primary endpoint; do not present DAWN as a simple frequentist superiority trial.
- **Current standard:** `trial-statistics` skill — for ordinal mRS shift, show Grotta bar / common OR; for Bayesian, show posterior probability of superiority. NNT computed from dichotomized mRS 0–2 is a secondary framing that should be labeled as such.
- **Suggested rewording:** Replace "NNT=3" with "ARR for mRS 0–2 ~36 percentage points (dichotomized secondary framing); primary endpoint was utility-weighted mRS ordinal analysis with posterior probability of superiority >0.999 (DAWN was Bayesian-adaptive)." Same treatment for HERMES OR 2.49.
- **Severity:** SHOULD FIX (Class E — statistical framing matters for trial-page surfaces and inline pearls).

### S-06. DOAC management — ELAN is the wrong reference for the pre-tPA rule
- **File:** `strokeClinicalPearls.ts` lines 166–176 (`doac-management-2026`).
- **Statement:** "Do NOT give tPA if last DOAC dose <48h... If last dose >48h with normal renal function AND a normal drug-specific assay, tPA may be considered."
- **Verdict:** (a) correct content but (d) the cited evidence ("AHA/ASA 2026 Guidelines") is vague — the pre-tPA DOAC rule is from the 2019 → 2024 → 2026 lineage of acute-stroke guidelines, NOT the ELAN trial (ELAN governs anticoagulation *restart* timing post-stroke, not tPA eligibility). Pearl is correct; the surface needs precise section reference.
- **Suggested rewording:** Cite "AHA/ASA 2026 §4.2 (DOAC and IV thrombolysis)" rather than the bare guideline. Confirm and pin the specific section.
- **Severity:** SHOULD FIX.

### S-07. ELAN framework cited in anticoag-timing pearl — claim is accurate but contextual notes needed
- **File:** `strokeClinicalPearls.ts` lines 638–646 (`anticoagulation-timing`).
- **Statement:** "...the ELAN operational framework uses within 48 hours for TIA/minor/moderate events and day 6-7 for major stroke, with repeat imaging and caution after IVT or EVT."
- **Verdict:** (a) correct as written. (d) ELAN is not in the citation registry. Class/level not stated; needs Class IIa/IIb tag (AHA/ASA 2026 endorses earlier DOAC initiation as reasonable).
- **Current standard:** ELAN trial (NEJM 2023) — early vs. late DOAC start, no difference in composite primary outcome, supports earlier initiation as safe. AHA/ASA 2026 cites ELAN.
- **Suggested rewording:** Tag the pearl with evidenceClass: 'IIa', evidenceLevel: 'B', and add the ELAN trial as a separate pearl with `pmid` and `nctId`.
- **Severity:** SHOULD FIX.

### S-08. Posterior-circulation / basilar EVT — completely absent
- **File:** `strokeClinicalPearls.ts` (no pearl exists); `StrokeBasicsWorkflowV2.tsx` line 730 mentions "ATTENTION/BAOCHE protocols" in a single sentence inside the thrombectomy recommendation card.
- **Statement:** No deep pearl covers basilar/vertebral EVT eligibility.
- **Verdict:** (d) missing content — major gap given the 2022 BAOCHE and ATTENTION trials.
- **Current standard:** ATTENTION (NEJM 2022) and BAOCHE (NEJM 2022) established EVT for basilar artery occlusion within 6–24 h is beneficial. AHA/ASA 2026 incorporates as Class I in select patients.
- **Suggested rewording:** Add deep pearls for ATTENTION and BAOCHE under step-2 (LVO Screening), with explicit posterior-circulation EVT window guidance.
- **Severity:** SHOULD FIX (Class E — adds a recommendation surface).

### S-09. ARTIS — early aspirin post-tPA — outdated framing of NIHSS-context
- **File:** `strokeClinicalPearls.ts` lines 591–601 (`artis-trial`).
- **Statement:** "Established standard: NO antiplatelet agents × 24h post-tPA."
- **Verdict:** (a) correct. (d) under-supported — recent literature (POINT, CHANCE-2) covers dual-antiplatelet timing in non-tPA minor stroke / TIA but is not the contradicting evidence here. ARTIS framing is fine; the gap is that it's positioned as the only evidence.
- **Suggested rewording:** Add evidenceClass / evidenceLevel tags. Confirm AHA/ASA 2026 still endorses 24 h hold (it does). Stamp `last_reviewed`.
- **Severity:** SHOULD FIX (citation completeness).

### S-10. Pregnancy and tPA — case-series quote needs context, not removal
- **File:** `strokeClinicalPearls.ts` lines 199–209 (`pregnancy-tpa`).
- **Statement:** "Case series: ~15 pregnant women treated, 2 sICH (13%), 8 healthy births (67%)."
- **Verdict:** (d) the underlying claim that pregnancy is a relative contraindication is accurate per 2026; the case-series numbers are a real but small dataset and should be tagged as such (low certainty).
- **Current standard:** AHA/ASA 2026 considers pregnancy a relative contraindication; case series remain small.
- **Suggested rewording:** Add caveat "small case series, n≈15, limited generalizability" to the pearl content. Already tagged Class IIb, Level C — that's appropriate; needs explicit `quoted_text` and citation registration.
- **Severity:** SHOULD FIX (citation completeness).

### S-11. ICH BP target — current statement is correct, but INTERACT-3 (bundled care) missing
- **File:** `strokeClinicalPearls.ts` lines 747–765 (`bp-in-hemorrhage`, `atach2-trial`); `HemorrhageProtocolModal.tsx`.
- **Statement:** "Target SBP <140 mmHg within 1 hour when feasible (Class I, Level A). Avoid SBP <110 mmHg." Correct per 2022 ICH guideline.
- **Verdict:** (b) stale — does not cite INTERACT-3 (Lancet 2023) bundled care (BP control + glucose + temperature + reversal), which is increasingly the framing for ICH management.
- **Current standard:** INTERACT-3 (2023) — bundled care for ICH improved functional outcomes. Some 2024 focused updates incorporate.
- **Suggested rewording:** Add an INTERACT-3 deep pearl under step-6. Tag the bundled-care recommendation appropriately.
- **Severity:** SHOULD FIX.

### S-12. Class IIa "TICH-2" pearl evidenceClass conflicts with the bundled body text
- **File:** `strokeClinicalPearls.ts` lines 736–745 (`tich2-trial`).
- **Statement:** Pearl body says "2022 AHA/ASA ICH: TXA NOT recommended for routine use (Class III, Level A)." But `evidenceClass: 'IIb'` is the badge.
- **Verdict:** (c) internally inconsistent — the badge says IIb, the prose says Class III. Class III is correct per 2022 ICH guideline.
- **Suggested rewording:** Change `evidenceClass: 'IIb'` to `evidenceClass: 'III'`. This is a label fix, not a content fix.
- **Severity:** SHOULD FIX (label inaccuracy — could confuse a learner; not a bedside-decision risk because the prose is clear).

### S-13. Hemorrhage management quick pearl includes TXA in IV-tPA-related sICH reversal — but ProtocolModal preserves it
- **File:** `strokeClinicalPearls.ts` lines 686–693 (`hemorrhage-management-quick`); `TpaReversalProtocolModal.tsx` step "Antifibrinolytic" preserves TXA / ε-aminocaproic acid.
- **Statement (pearl):** "Cryoprecipitate 10 units IV (raises fibrinogen ~50 mg/dL, target >150). BP target <140 mmHg within 1 h; avoid SBP <110. Reverse anticoagulation if applicable... Platelet transfusion not routinely recommended (2022). Neurosurgery consult STAT."
- **Verdict:** (a) accurate; (d) does not mention TXA. The `TpaReversalProtocolModal` (step "Antifibrinolytic") DOES include TXA 1 g IV per AHA/ASA 2026 Table 5 — this is correct for post-thrombolysis sICH (separate from the 2022 ICH guideline rejection of routine TXA in spontaneous ICH).
- **Note:** These look contradictory but are not — TXA is NOT recommended for spontaneous ICH (TICH-2, Class III Level A) but IS in the 2026 AHA/ASA Table 5 for post-thrombolysis sICH reversal. The quick pearl should clarify this distinction.
- **Suggested rewording:** Update `hemorrhage-management-quick` to make the IV-tPA-reversal context explicit: "Reverse coagulopathy: cryoprecipitate (raises fibrinogen), TXA per AHA/ASA 2026 Table 5 (post-thrombolysis sICH only — NOT for spontaneous ICH per TICH-2)."
- **Severity:** SHOULD FIX (precision; not bedside-misleading because the protocol modal does it correctly).

### S-14. SHINE — labelled "no benefit" but trial design context missing
- **File:** `strokeClinicalPearls.ts` lines 502–516 (`shine-trial`).
- **Statement:** "Intensive glucose control (80-130) vs standard (140-180) in stroke. No benefit from intensive control. Increased hypoglycemia risk."
- **Verdict:** (a) correct conclusion. (b) framing — SHINE is a registry-equivalent failed-superiority trial, not a noninferiority trial; the framing is fine.
- **Note:** `CodeModeStep4.tsx` line 295 correctly tags glycemic control as "COR 2a, LOE C-LD (AHA 2026 §4.5 #2)" and notes intensive control is "COR 3: No Benefit, LOE A". Pearl should match this language.
- **Suggested rewording:** Update pearl to add "Intensive glucose control 80-130 mg/dL is Class III: No Benefit, Level A per AHA/ASA 2026 §4.5."
- **Severity:** SHOULD FIX (label precision).

### S-15. INR cutoff 1.7 framed as a hard NINDS rule; 2026 nuance not surfaced
- **File:** `strokeClinicalPearls.ts` lines 371–379 (`anticoag-warfarin`); `CodeModeStep4.tsx` line 39 (PT/INR/PTT rationale).
- **Statement:** "INR >1.7 = absolute contraindication (NINDS). INR 1.4-1.7 debated: AHA allows, European guidelines exclude."
- **Verdict:** (a) accurate; (b) the "debated" framing is from older guideline cycles. 2026 maintains INR ≤1.7 as the gate.
- **Suggested rewording:** Restate as "INR >1.7 — contraindication to IV thrombolysis per AHA/ASA 2026. INR 1.4–1.7 in patients on warfarin: AHA permits treatment; some European protocols differ." Reduce hedging — guidelines are not "debating" this in 2026.
- **Severity:** SHOULD FIX (voice / certainty calibration per agent brief).

### S-16. WAKE-UP pearl uses "MRI-guided treatment for unknown onset times - 25% of strokes occur during sleep" — the 25% figure needs a citation
- **File:** `strokeClinicalPearls.ts` lines 125–134 (`wake-up-trial`).
- **Statement:** "Established MRI-guided treatment for unknown onset times - 25% of strokes occur during sleep."
- **Verdict:** (d) the 25% wake-up figure is commonly quoted (range 14–27% in the literature) but no citation is attached. Pearl needs a source.
- **Suggested rewording:** Either add primary citation (Mackey et al. Stroke 2011 or similar epidemiologic source) or soften to "approximately 14-27% of strokes are detected on awakening."
- **Severity:** SHOULD FIX (citation completeness).

### S-17. Saver "1.9 million neurons per minute" — widely quoted, citation present but `last_reviewed` likely stale
- **File:** `strokeClinicalPearls.ts` lines 46–51, 84–93 (`time-is-brain`, `time-is-brain-deep`).
- **Statement:** "1.9 million neurons die per minute during untreated stroke (Saver, Stroke 2006). Every 15-minute delay reduces the probability of a good outcome by ~4%."
- **Verdict:** (a) accurate, well-cited (Saver 2006; Saver JAMA 2013; Emberson Lancet 2014); (d) needs `quoted_text` and `last_reviewed` per §13.6 checklist. The 4% per 15-min figure is from Saver 2013 / Emberson 2014; verbatim text not in the pearl.
- **Suggested action:** Add `quoted_text` field to pearl detailedContent. Run the §13.6 six-point checklist before refreshing `last_reviewed`.
- **Severity:** SHOULD FIX (citation hygiene per CLAUDE.md §13).

---

## POLISH — phrasing improvements, citation additions for accurate content

### P-01. ThrombectomyPathwayModal subtitle reads "AHA/ASA 2019"
- **File:** `ThrombectomyPathwayModal.tsx` line 69.
- **Statement:** `<p>AHA/ASA 2019 · thrombectomy eligibility</p>`
- **Verdict:** (b) stale subtitle string; the modal body itself uses 2026 framing.
- **Suggested rewording:** "AHA/ASA 2026 · thrombectomy eligibility".
- **Severity:** POLISH.

### P-02. ECASS III pearl missing `evidenceClass` review — current is Class I Level B
- **File:** `strokeClinicalPearls.ts` lines 113–123 (`ecass3-trial`).
- **Statement:** Tagged Class I, Level B. Body uses "still significant" language.
- **Verdict:** (a) correct; (b) "still significant" is hedged narrative — guideline language is direct.
- **Suggested rewording:** "Treatment effect smaller than 0–3 h window. AHA/ASA 2026 endorses 3–4.5 h treatment for eligible patients."
- **Severity:** POLISH.

### P-03. NINDS sICH "6.4%" presented without sub-classification
- **File:** `strokeClinicalPearls.ts` lines 95–111 (`ninds-trial`), 706–714 (`sich-incidence-deep`).
- **Statement:** "6.4% sICH risk (Parts 1+2 combined)."
- **Verdict:** (a) accurate; (b) modern presentation usually distinguishes ECASS-3 definition vs. NINDS definition (different criteria yield different rates).
- **Suggested rewording:** "6.4% per NINDS definition (any ICH with neurological worsening); ~2% sICH by ECASS-3 definition."
- **Severity:** POLISH.

### P-04. RACE pearl ranges "≥5 = 85% sensitivity" — should match RACE source paper numbers
- **File:** `strokeClinicalPearls.ts` lines 235–238, 260–267.
- **Statement:** "Score ≥5 = 85% sensitivity for LVO" / "Score ≥5 has 85% sensitivity and 69% specificity for LVO."
- **Verdict:** (a) consistent with Pérez de la Ossa et al, Stroke 2014 — sensitivity ~85%, specificity 68%.
- **Suggested rewording:** Add citation tag and `quoted_text`.
- **Severity:** POLISH.

### P-05. FAST-ED pearl "89% PPV" — verify against Lima et al
- **File:** `strokeClinicalPearls.ts` lines 270–278.
- **Statement:** "Score ≥4 has 89% PPV for M1/M2 occlusion."
- **Verdict:** (d) needs source confirmation. Lima et al. Stroke 2016 reported ROC AUC for FAST-ED; the PPV value depends on prevalence assumed.
- **Suggested rewording:** Replace with "AUC 0.81 for LVO detection (Lima 2016)" or pin a specific cutoff with its specificity.
- **Severity:** POLISH (statistical precision).

### P-06. SHINE pearl trialSlug points to non-existent route
- **File:** `strokeClinicalPearls.ts` line 511 (`shine-trial`).
- **Statement:** `trialSlug: '/trials/shine-trial'`.
- **Verdict:** Non-clinical issue — but flagging because if the trial detail page doesn't exist, the deep-link in `PearlDetailView` shows a broken state.
- **Suggested action:** Confirm `/trials/shine-trial` resolves; reconcile with trialData.ts. (Out of scope for clinical audit; flagging for Stream 2 / 3.)
- **Severity:** POLISH (cross-stream concern).

### P-07. "Treatment Windows" quick pearl over-simplifies extended window
- **File:** `strokeClinicalPearls.ts` lines 53–58 (`treatment-windows-quick`).
- **Statement:** "IV tPA: 0-4.5h (standard). Thrombectomy: 0-24h with imaging. Extended windows require perfusion imaging showing salvageable tissue."
- **Verdict:** (b) stale — does not mention 9 h extended IVT window or wake-up DWI-FLAIR.
- **Suggested rewording:** "IV thrombolysis: 0–4.5 h standard; 4.5–9 h with perfusion mismatch (EXTEND); wake-up with DWI-FLAIR (WAKE-UP); up to 24 h with mismatch (TRACE-III, TIMELESS). Thrombectomy: up to 24 h with imaging (DAWN/DEFUSE-3); large-core EVT (SELECT-2, ANGEL-ASPECT) in select patients."
- **Severity:** POLISH.

### P-08. "Cortical Signs" quick pearl uses informal "Alert IR immediately"
- **File:** `strokeClinicalPearls.ts` lines 227–232.
- **Verdict:** (a) clinically accurate; voice issue — agent brief recommends active voice and named actions. "Alert IR" is fine; the structure could be tighter.
- **Severity:** POLISH (voice).

### P-09. CodeModeStep1 BP alert references "AHA/ASA 2026" without section
- **File:** `CodeModeStep1.tsx` line 291.
- **Statement:** `<p>AHA/ASA 2026</p>`
- **Verdict:** (a) attribution correct; (d) lacks specific section reference.
- **Suggested rewording:** "AHA/ASA 2026 §4.3 (BP management before IV thrombolysis)."
- **Severity:** POLISH.

### P-10. Inline study-mode prose in StrokeBasicsWorkflowV2 — references list not in citation registry
- **File:** `StrokeBasicsWorkflowV2.tsx` lines 463–471 (LKW evidence box), 549–556 (LVO evidence box), 671–678 (documentation evidence box).
- **Statement:** Each `<details>` block carries a "References:" footer with direct external links but no `claimId` attribute and no entry in `src/lib/citations/`.
- **Verdict:** (d) per CLAUDE.md §13.4, this is a static-JSX claim surface and needs `data-claim` tagging. None of the inline study-mode references map to a registered claim.
- **Suggested action:** Add `data-claim="..."` attributes; register the claims in `src/lib/citations/claims.ts` and the citations in `src/lib/citations/registry.ts`.
- **Severity:** POLISH (citation registry hygiene).

### P-11. Stroke Unit Trialists 18% mortality reduction — needs primary source
- **File:** `StrokeBasicsWorkflowV2.tsx` line 676.
- **Statement:** "Dedicated stroke units reduce mortality by 18% (Stroke Unit Trialists Collaboration)."
- **Verdict:** (a) accurate (Stroke Unit Trialists' Collaboration Cochrane review); (d) needs primary citation with year.
- **Suggested rewording:** "...by 18% (Stroke Unit Trialists' Collaboration Cochrane review)."
- **Severity:** POLISH.

### P-12. CRYSTAL-AF detection rates restated inconsistently across pearls
- **File:** `strokeClinicalPearls.ts` lines 604–613 (`crystal-af-trial`); `CodeModeStep4.tsx` lines 223 (holter rationale).
- **Statement:** Pearl says "AF detection: 8.9% at 6mo, 12.4% at 12mo, 16.1% at 36mo" — CodeModeStep4 says "16% of cryptogenic stroke patients vs 3% with 24h Holter".
- **Verdict:** (a) both accurate from CRYSTAL-AF primary publication; (b) Step4 prose is loose ("3% with 24h Holter" — the trial reported 1.4% at 6mo for standard arm).
- **Suggested rewording:** Step4 prose → "1.4% at 6 months and 2.0% at 12 months with standard external monitoring."
- **Severity:** POLISH (statistical precision).

### P-13. "Time Is Brain" — Saver 1.9 million figure has no `quoted_text`
- **File:** `strokeClinicalPearls.ts` lines 46–51, 84–93.
- **Verdict:** Already covered in S-17; flagged as POLISH for `quoted_text` registration.
- **Severity:** POLISH.

### P-14. CLOTS-3 rationale in CodeModeStep4 — NNT framing fine but cite primary
- **File:** `CodeModeStep4.tsx` line 256 (dvt-prophylaxis).
- **Statement:** "CLOTS-3 trial: intermittent pneumatic compression (IPC) reduced DVT from 12.1% to 8.5% (ARR 3.6 percentage points, ~30% relative reduction) — safe immediately post-tPA (AHA 2026 §5.4 #1, COR 1 LOE B-R)."
- **Verdict:** (a) accurate, well-cited; CLOTS-3 was a superiority trial with binary outcome; NNT/ARR framing is appropriate here.
- **Suggested action:** Add `claimId` per §13.4 (static-JSX surface).
- **Severity:** POLISH (registry hygiene).

### P-15. "Step-2 quick" LVO-benefit pearl uses NNT for HERMES
- **File:** `strokeClinicalPearls.ts` lines 241–246.
- **Statement:** "HERMES: 46% vs 29% good outcome (NNT=2.6)."
- **Verdict:** See S-05. HERMES primary endpoint was ordinal mRS shift (common OR), so NNT framing is technically inappropriate; the dichotomized mRS 0–2 ARR ~17% supports NNT ~6, not 2.6. The 2.6 figure appears to come from a different dichotomization or be incorrect.
- **Suggested action:** Replace with "HERMES: mRS 0–2 at 90 d, 46% vs 29% (ARR ~17%); primary endpoint was ordinal common OR 2.49 (95% CI 1.76–3.53). NNT from dichotomized secondary ~6."
- **Severity:** POLISH (numerical precision — could be SHOULD-FIX if presented prominently).

### P-16. STICH "Early surgery (within 12h) for deteriorating patients" — historical phrasing
- **File:** `strokeClinicalPearls.ts` lines 779–787 (`stich-trial`).
- **Verdict:** (b) "early surgery (within 12 h)" overstates STICH II findings; STICH II showed no overall benefit but suggested possible benefit in superficial lobar bleeds. AHA/ASA 2022 ICH Class IIb.
- **Suggested rewording:** "STICH II: no overall benefit; possible benefit in select superficial lobar hemorrhages. 2022 ICH: Class IIb."
- **Severity:** POLISH.

### P-17. Ist-3 pearl says "GREATER benefit in elderly" — overstates
- **File:** `strokeClinicalPearls.ts` lines 211–220 (`ist3-trial`).
- **Statement:** "adjusted analysis showed GREATER benefit in elderly"
- **Verdict:** (b) — IST-3 secondary analyses showed treatment effect was not attenuated by age, not that benefit was greater. "Similar magnitude of benefit by age" is more accurate.
- **Suggested rewording:** "Age did not attenuate treatment benefit (adjusted analysis); IST-3 supports treating eligible patients >80 y."
- **Severity:** POLISH.

### P-18. Stroke-mimics pearl evidence string says "AHA/ASA 2019 (Class IIa)"
- **File:** `strokeClinicalPearls.ts` lines 189–198 (`stroke-mimics-safety`).
- **Statement:** `evidence: 'Zinkstok et al, Stroke 2013; AHA/ASA 2019 (Class IIa)'`
- **Verdict:** (b) reference is 2019; 2026 guideline still supports treating likely strokes even when mimic suspected. Update to 2026.
- **Suggested rewording:** Replace 2019 with the 2026 section reference.
- **Severity:** POLISH.

---

## Citation coverage

- **Claims with proper `data-claim` / `claimId` tagging:** 0 detected in the scanned files. The codebase carries an `evidence` string field on pearls and inline "References:" lists in study-mode boxes, but neither is hooked to `src/lib/citations/registry.ts` / `claims.ts`. (Per CLAUDE.md §13.4 the static-JSX pearls and the inline study-mode prose require `data-claim` attributes; the structured data in `strokeClinicalPearls.ts` requires `claimId` on each pearl object.)
- **Claims that should be tagged but aren't (Class E unblocker required):** All ~140 clinical statements scanned. The scanner will flag every shipped claim surface as unregistered on the next pre-commit hook run unless a tagging strategy is added. Recommend a follow-on Class C-clinical task: "Register Stroke Code pearls + step-component clinical strings + study-mode prose in `src/lib/citations/`."
- **Citations referenced that don't exist in `src/lib/citations/registry.ts`:** Effectively all of them — the registry file appears to not yet contain entries for NINDS, ECASS III, WAKE-UP, EXTEND, DAWN, DEFUSE-3, HERMES, SHINE, GIST-UK, SPARCL, ARTIS, CRYSTAL-AF, CLOTS-3, SITS-MOST, IST-3, TICH-2, STICH, ATACH-2, ENCHANTED, or AHA/ASA 2026 guideline by section, AHA/ASA 2022 ICH by section. Status per CLAUDE.md §13.4: `blocked:awaiting-scanner-support` until the registry is populated and the scanner is extended to read `claimId` fields on `ClinicalPearl` objects.

---

## What this audit deliberately did NOT cover

- **Scoring-logic correctness** (NIHSS calculation, tPA dose computation in `strokeDosing.ts`, ICH score logic). Different stream / different agent (`calculator-engineer`).
- **UI / a11y / mobile layout.** Different stream (`ui-architect`, `mobile-first-developer`, `accessibility-specialist`).
- **Trial-page detail accuracy** for any of the named trials — `/trials/dawn`, `/trials/wake-up`, etc. — Stream 2 / 3 scope, or a dedicated trial-statistician audit.
- **EvtPathway component clinical content** (rendered inside `ThrombectomyPathwayModal`) — not in scope, only the modal shell + subtitle were audited.
- **ExtendedIVTPathway component clinical content** (rendered inside `ExtendedIVTPathwayModal`) — not in scope, only the modal shell + subtitle were audited.
- **ThrombolysisEligibilityModal clinical content** — file path listed in scope as referenced via lazy import but full body not audited here. Recommend separate spot-audit.
- **StrokeIchProtocolStep.tsx and `ICH_PROTOCOL_ITEMS`** — referenced by `HemorrhageProtocolModal` but the source file was not opened. The protocol modal preserves the upstream items "verbatim" per its file comment; if the upstream is right, the modal is right. Spot-audit recommended.
- **strokeDosing.ts** — the dose computation utility used by Step1/Step2. Not a prose surface; calculator-engineer scope.
- **TimestampBubble, QuickReferenceCard, PathwayRailStep** — UI shells, no clinical claims expected.
- **trialData.ts / trialCatalogMeta.ts / trialListData.ts** — out of stroke-code scope (Trials platform).
