# Clinical review — PR #<imaging-read-ct-head>

**Decision:** block
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-09

## Scope
- Claims touched: 37 new — `ct-blood-normal-absent`, `ct-blood-acute-hyperdense-range`, `ct-blood-temporal-evolution`, `ct-blood-epidural-biconvex`, `ct-blood-subdural-crescent`, `ct-blood-sah-cisterns-sulci`, `ct-blood-hyperdense-mca-sign`, `ct-search-pattern-accuracy`, `ct-blood-calcification-mimic`, `ct-cisterns-normal-patent`, `ct-cisterns-effacement-raised-icp`, `ct-cisterns-sah-basal`, `ct-cisterns-uncal-herniation`, `ct-cisterns-tonsillar-herniation`, `ct-brain-normal-graywhite`, `ct-brain-loss-graywhite-early-infarct`, `ct-brain-insular-ribbon`, `ct-brain-aspects-regions`, `ct-brain-subfalcine-herniation`, `ct-brain-central-herniation`, `ct-brain-stroke-window-benefit`, `ct-ventricles-normal-symmetric`, `ct-ventricles-ivh`, `ct-ventricles-hydrocephalus-evans`, `ct-ventricles-temporal-horn-early-sign`, `ct-ventricles-exvacuo-vs-obstructive`, `ct-bone-normal`, `ct-bone-fracture-vs-suture`, `ct-bone-depressed-fracture`, `ct-bone-pneumocephalus`, `ct-bone-sinus-air-fluid`, `ct-bone-window-required`, `ct-bone-scalp-localizes-impact`, `ct-window-brain`, `ct-window-stroke-detection`, `ct-window-subdural`, `ct-window-bone`. Plus 1 reuse — `aspects-evt-eligibility-2026` (Brain step, ASPECTS to EVT).
- Citations affected: 13 new — `perron-bcbvb-ct-1998`, `mainali-stroke-windows-2014`, `barber-aspects-2000`, `truwit-insular-ribbon-1990`, `riascos-herniation-radiographics-2019`, `statpearls-ich-imaging`, `statpearls-epidural-hematoma`, `radiopaedia-subdural-haemorrhage`, `radiopaedia-basal-cisterns`, `radiopaedia-hydrocephalus`, `statpearls-skull-fracture`, `radiopaedia-windowing-ct`, `radiopaedia-intracranial-haemorrhage`. Plus reuse — `aha-asa-2026-4.7.2` (+ its 4 large-core trial citations, all pre-existing/verified).
- Surfaces changed: Structured data in `src/data/` (§13.4 DATA_SURFACE — adjacent `claimId` field on `ClinicalNote` and `WindowCard.purpose` objects in `src/data/imaging/ctHead.ts`). No JSX/computed-string/markdown surfaces in this PR.
- Evidence-verifier packet: `docs/evidence-packets/imaging-read-ct-head.md` (2026-07-09, confidence MEDIUM, verifier-flagged egress limitation)
- Trial-statistician report: not applicable — educational interpretation module, not a trial/statistics-display entry. The two embedded primary studies (Perron 1998, Mainali 2014) report accuracy/detection proportions only; no NNT, p-value display, or shift analysis is surfaced.

## Semantic validity
The clinical content is sound and every one of the packet's five non-negotiable hedges is honored in the rendered text. This is a governance/provenance block, not a "the medicine is wrong" block.

Non-negotiable hedges — all CONFIRMED honored:
1. Perron mnemonic (`ct-search-pattern-accuracy`) — rendered as "improved resident CT interpretation accuracy in a controlled educational study." Framed as educational interpretation accuracy, not patient outcomes and not unqualified "diagnostic accuracy." Matches packet A1. PASS.
2. Acute-blood HU (`ct-blood-acute-hyperdense-range`) — rendered as a range with mechanism: "commonly cited around 50–70 Hounsfield units, though hyperacute unclotted blood may read lower and exact values vary by source and by hematocrit and clot retraction." Never a single hard number. PASS. (Caveat under Citation accuracy: packet B1 notes StatPearls itself reports +65 to +95 HU; source-of-record must be reconciled at audit.)
3. Stroke window (`ct-window-stroke-detection`, `ct-brain-stroke-window-benefit`) — "improves detection sensitivity for early ischemic change" with the 18% vs 70% single-center figures AND the misnomer hedge. Detection sensitivity only, not outcomes. PASS.
4. Hyperdense MCA (`ct-blood-hyperdense-mca-sign`) — "specific but relatively insensitive early sign of large-vessel occlusion." Correct standard teaching and a conservative hedge. PASS on medicine, but see Adjudication 1: the specificity/sensitivity limb is not carried in its cited `quoted_text`.
5. ASPECTS split (`ct-brain-aspects-regions` to `barber-aspects-2000`; `aspects-evt-eligibility-2026` to reused `aha-asa-2026-4.7.2`) — region definitions map to Barber 2000; EVT candidacy threshold reuses the existing verified AHA/ASA 2026 §4.7.2 claim, NOT duplicated. The Brain-step EVT sentence is a soft pointer that restates no COR/threshold, so it cannot drift. PASS.

Never-drift scan across all 37 claims: no upgrade of recommendation strength, no action-verb drift, no certainty-marker laundering, no temporal-window drift, no dropped population gate. Referral language ("warrants urgent attention", "warrants neurosurgical evaluation") is appropriately hedged.

Terminology handling: cytotoxic vs vasogenic edema kept as definitional glossary content (glossaryRef only, no `claimId`) — the module makes no actionable edema-differentiation recommendation, so no claim surface requiring citation is created. Correct.

## Citation accuracy
The claim-to-citation mapping is structurally correct for all 37 claims and the reuse is correct. However, every one of the 13 new citations carries an in-code VERIFY flag: PMIDs/NBK accessions are search-derived and `quoted_text` is search-derived, not verbatim-confirmed against resolved full text (egress-blocked 2026-07-09). Reviewer is read-only with no fetch capability and cannot resolve any of the 13 from repo files. Per mandate, an unresolved/unconfirmed source is a block, not approve-with-conditions.

Claim-vs-source gaps (audit punch-list, not independent blocks):
- `ct-blood-hyperdense-mca-sign` — "specific but relatively insensitive" is NOT in `radiopaedia-intracranial-haemorrhage` quoted_text. Registry self-flags this. See Adjudication 1.
- `ct-cisterns-tonsillar-herniation` — the "more than 5 mm through the foramen magnum" threshold is not carried in the `riascos-herniation-radiographics-2019` quoted_text. Confirm or re-source.
- `ct-brain-aspects-regions` — the 10-region enumeration is defining Barber 2000 content and clinically exact, but the recorded quoted_text does not enumerate them. Confirm verbatim.
- `ct-brain-loss-graywhite-early-infarct` — "within hours, before frank hypodensity" timing is not carried in the insular-ribbon-specific Truwit quoted_text. Confirm or add a general early-infarct-signs source.
- `ct-blood-acute-hyperdense-range` — HU source variance (50–70 recorded vs StatPearls' own 65–95 per packet B1). Reconcile source-of-record.

Bone step: 6 of 7 bone claims cite only `statpearls-skull-fracture` (NBK470349, unverified). Its verification carries proportionally more weight. See Adjudication 4.

## Editorial / expert context (REQUIRED for new-trial-entry PRs)
Not applicable — no new trial entry in this PR. This is an educational interpretation module; packet §9 directs that `trialData.ts` / `trialListData.ts` / `trialCatalogMeta.ts` are NOT touched, and mandatory-block #8 does not apply. For completeness: the packet's §8 was addressed for the two embedded primary studies — 8b captured the published "stroke window terminology misnomer" critique of Mainali 2014, correctly reflected as the misnomer hedge in `ct-window-stroke-detection`. No §8 sub-item silently omitted.

## Freshness
All 13 new citations are dated `last_reviewed: 2026-07-09` (2 days old), numerically within every §13.7 window. But freshness is meaningless here because the review the date asserts did not happen: the registry header and the packet both state the §13.6 six-point checklist could not be completed (step 1 "source still resolves / text unchanged" and the verbatim-confirmation precondition were egress-blocked). Setting `last_reviewed` to assert a completed §13.6 review that was not performed is the governance violation §13.6 describes and triggers mandatory-block #6. The hook is green (metadata complete) but the medicine's provenance is unconfirmed — the §13.1 case exactly.

The `review_window_months: 36` override on `riascos-herniation-radiographics-2019` is itself reasonable (stable neuroimaging-anatomy review; rationale documented per §13.7). It does not rescue the freshness problem, which is about the un-performed §13.6 review, not the window length.

## Rationale
The teaching module is clinically accurate, well-structured, and conservatively hedged: all five non-negotiable hedges are honored verbatim, the never-drift scan is clean across all 37 claims, the ASPECTS-to-EVT reuse is correct without duplication, and the edema terminology is correctly scoped as non-actionable glossary. If the citation provenance were confirmed, this would approve. It cannot: all 13 new citations set `last_reviewed = 2026-07-09` while the §13.6 verbatim-confirmation step was admittedly not completable (full-text egress blocked), and their PMIDs/NBK IDs/quoted_text are search-derived and unresolvable from repo files. That is a mandatory block under condition #6 (last_reviewed refresh without documented §13.6 completion) and condition #3 (source cannot be resolved). Adjudications: (1) hyperdense-MCA gap — citation-accuracy gap, not clinical drift, folded into the audit punch-list; (2) edema-as-glossary — acceptable; (3) riascos 36-month override — reasonable; (4) NBK470349 skull-fracture ID — must be verbatim-confirmed, not "pending audit" to main; (5) global VERIFY / dates-without-§13.6 — BLOCK. The block is narrow and fast to clear: nothing about the medicine must change (except reconciling the handful of claim-vs-source specifics); the module reopens the moment §13.6 verbatim confirmation is genuinely completed and `last_reviewed` is honestly reset. Staging the module on a non-production branch is an acceptable engineering choice, but the merge gate to `main` stays closed until §13.6 is complete. Hold at `blocked:awaiting-clinical-review`.

## Required follow-ups
- **[Block-lifting condition — exact]** Route to `evidence-verifier` + `medical-scientist` to obtain source access (WebFetch/WebSearch once egress permits, or V-supplied full text) and complete all six §13.6 steps for each of the 13 new citations: confirm every PMID / NBK accession / DOI resolves to the named work, confirm each `quoted_text` is verbatim, and confirm no wording drift between claim text and confirmed source. Only after that, (re)set `last_reviewed` to the actual confirmation date. Then re-submit to `clinical-reviewer` for the final gate.
- Resolve the specific claim-vs-source gaps during the same audit: `ct-blood-hyperdense-mca-sign`, `ct-cisterns-tonsillar-herniation` (5 mm), `ct-brain-aspects-regions` (10-region enumeration), `ct-brain-loss-graywhite-early-infarct` ("within hours" timing), `ct-blood-acute-hyperdense-range` (50–70 vs 65–95 HU).
- Confirm the StatPearls accessions resolve to the named chapters: NBK470349 (Skull Fracture), NBK553103 (ICH Imaging), NBK518982 (Epidural Hematoma).
- No change required to the reused `aspects-evt-eligibility-2026` / `aha-asa-2026-4.7.2` limb.
- On reopen, verify the four Wikimedia photo assets (`status: 'pending'`) have confirmed bylines/licenses at drop-in before the module renders those figures publicly.
