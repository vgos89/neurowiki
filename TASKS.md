# TASKS.md — NeuroWiki Task Ledger

## ACTIVE

(none)

### SHELL-ACCORDION-FEEDBACK — Patient-context accordion attention cue + feedback-in-header — Class C
- **Status:** ready_for_merge (committed this session)
- **User-visible goal:** (1) the collapsed, still-empty "Patient context" panel gets a calm slow-breathing indigo highlight (V-approved Option A) so clinicians notice it is tappable; the cue stops the moment the panel is opened or any value is entered, and reduce-motion users get a static left accent. The collapsed hint text is rewritten from abbreviations to clean prose ("Tap to add last known well, blood pressure, glucose, anticoagulation, and pre-stroke mRS"). (2) The feedback button moves from the floating bottom-right pill into the search-bar header (desktop + mobile, beside the favourites star) so it is always visible and the crowded bottom-right corner is freed.
- **Non-goals:** no change to the timestamp FAB; the now-unused drawer floor-height plumbing (calculator pages + BottomLineDrawer) is left for a separate cleanup.
- **Files:** index.css (pc-attention keyframe + reduce-motion guard); src/components/shared/PatientContextPanel.tsx (cue + hint text); src/components/FeedbackButton.tsx (header variant); src/components/layout/{DesktopTopBar,MobileHeader,Layout}.tsx (mount header button, retire floating).
- **Acceptance checks:** all passed — tsc clean; build green; check:claims pass; check:humanizer pass; live-preview verified at 1280px + 375px (cue shows collapsed+empty with neuro tint + breathing ring, disappears on expand; clean prose hint; feedback icon in both headers opens the modal with correct page context; floating button gone; no console errors). Design via approved mockup docs/specs/mockups/patient-context-accordion-attention.html.
- **Clinical impact:** none (shell UI polish).
- **Rollback plan:** `git revert <merge commit>` restores the flat collapsed header, the abbreviated hint text, and the floating feedback button.

### NIHSS-COPY-TEMPLATE-FIELDS — Wire per-drug eligibility + pre-stroke mRS into copy/share — Class C
- **Status:** ready_for_merge (committed this session)
- **User-visible goal:** the anticoagulant eligibility inputs (DOAC last-dose timing + drug name, warfarin INR, heparin/LMWH aPTT) and the pre-stroke mRS now appear in the NIHSS copy export and the saved-case share text when entered. The pre-stroke mRS is also now persisted with a saved case (it was previously lost on save, while the per-drug fields already persisted).
- **Non-goals:** no on-screen UI change; no new clinical claim (these lines document the clinician's entered values).
- **Files:** src/pages/NihssCalculator.tsx; src/lib/cases/format.ts; src/lib/cases/types.ts
- **Acceptance checks:** tsc clean; build green; check:claims pass; check:humanizer pass; runtime-verified copy output includes "DOAC: apixaban, last dose <48 h", "Warfarin INR: >1.7", "Pre-stroke mRS: 2".
- **Clinical impact:** none (documentation wiring).
- **Rollback plan:** `git revert <merge commit>` removes the per-drug + mRS lines from the export; the additive prestrokeMrs save field is ignored by old code.

### NIHSS-A11Y-GLUCOSE — Eligibility-control accessibility pass + glucose <50/<60 consistency — Class C + E-clinical
- **Status:** ready_for_merge (committed this session)
- **User-visible goal:** (accessibility) the patient-panel eligibility controls now meet WCAG 2.1 AA: unselected chip text and the amber caution glyphs have higher contrast (slate-500 / amber-600), the mRS "?" help button is a 24px tap target, and the mRS explainer is a proper dialog (role + aria-modal + aria-labelledby, focus moves in on open, Tab trap, Escape to close, return focus to the "?", aria-pressed on each grade). (glucose) the app's historical <50 glucose numbers are corrected to 2026: hypoglycemia-mimic references move to <60 (the §4.5 treat-threshold), and glucose is removed from the "Absolute Contraindications" lists (the 2026 guideline lists no glucose contraindication; hypoglycemia is correct-and-reassess, not absolute).
- **Non-goals:** no change to the LMWH/DOAC absolute-vs-relative phrasing in two unrelated pearls (separate pre-existing issue, tracked as a follow-up task); no claim-binding added to the non-scanned narrative surfaces.
- **Files:** src/components/shared/PatientContextPanel.tsx; src/components/calculators/MrsPickerModal.tsx; src/data/guideContent.ts; src/data/strokeClinicalPearls.ts; src/components/article/stroke/QuickReferenceCard.tsx; docs/reviews/clinical-PR-glucose-threshold-consistency.md
- **Acceptance checks:** tsc clean; build green; check:claims pass; check:humanizer pass; accessibility-specialist audit (5 must-fix + 3 should-fix all applied); live-preview verified at 375px (mRS dialog has role/aria-modal/labelledby, focus moves in, 6 grade buttons aria-pressed, "?" is 24x24, no console errors); clinical §17.2 approve (glucose corrections sourced to §4.5 + §4.6.5 / Table 8; no new citation needed).
- **Clinical impact:** medium (glucose-threshold consistency on stroke reference surfaces) plus accessibility.
- **Rollback plan:** `git revert <merge commit>` restores the 18px "?", the non-dialog modal, the slate-400 chip text, and the <50 glucose numbers. No data-model change.

### NIHSS-HYPOGLYCEMIA-NOTES — Hypoglycemia caution + thin-note unification + mRS explainer — Class E-clinical
- **Status:** ready_for_merge (committed this session)
- **User-visible goal:** (1) the patient panel's BP caution box becomes the same thin "!" inline note as the per-drug cautions, unifying the caution style across the panel; (2) a new hypoglycemia "!" note appears on the NIHSS panel when glucose <60 mg/dL, mirroring the Stroke Code pathway alert ("treat with D50 50 mL IV, recheck, reassess for tPA if symptoms persist"); (3) the Stroke Code hypoglycemia alert threshold is corrected from <50 to <60 (CodeModeStep1 trigger + CodeModeStep3 copy), completing the earlier audit stroke-code-glucose-threshold-60; (4) the pre-stroke mRS slide-up explainer is restored via a "?" next to the label (capped at grades 0-5) so users who do not know the scale can read each grade.
- **Non-goals:** no change to the separate <50 tPA-exclusion / stroke-mimic threshold (distinct concept; tracked as a follow-up task); no field made mandatory (confirmed every patient-context field stays optional).
- **Files:** src/components/shared/PatientContextPanel.tsx; src/components/calculators/MrsPickerModal.tsx; src/components/article/stroke/{CodeModeStep1,CodeModeStep3}.tsx; src/lib/citations/claims.ts; docs/reviews/clinical-PR-hypoglycemia-and-note-restyle.md
- **Acceptance checks:** tsc clean; build green; check:claims pass (new ivt-hypoglycemia-60 claim mapped to aha-asa-2026-4.5); check:humanizer pass; live-preview verified at 375px (hypoglycemia note fires at glucose 45, mRS "?" opens the 0-5 grade explainer, dense chips intact); clinical §17.2 approve-with-conditions (Condition 1 dose-hedge waived per V "same as Stroke Code"; Condition 2 <50-exclusion-threshold tracked as a separate task).
- **Clinical impact:** high (hypoglycemia treat-threshold + caution on the IV-thrombolysis surface; sourced verbatim from AHA/ASA 2026 §4.5 COR 1).
- **Rollback plan:** `git revert <merge commit>` restores the BP box, removes the hypoglycemia note + mRS "?" modal, and reverts the Stroke Code threshold to <50. The new claim is additive.

### NIHSS-ANTICOAG-MOBILE — Discrete "quiet chip" restyle of the eligibility controls — Class C
- **Status:** ready_for_merge (committed this session)
- **User-visible goal:** On a phone, the anticoagulant class selector, the per-drug toggles, and the mRS read lighter and shorter. The 44px pills become small (28px), low-contrast, square-cornered chips (Variation C); the excluding value (DOAC <48h, INR >1.7, aPTT >40s) tints amber; the filled amber caution box becomes a thin inline note. No content, claim, or logic changes (pure presentation of the already-reviewed NIHSS-ANTICOAG-ELIG surface).
- **Non-goals:** no change to the BP threshold box (separate element); no copy/claim/citation changes; Stroke Code unchanged (controls gated to showThrombolysisTiming).
- **Files:** src/components/shared/PatientContextPanel.tsx; docs/specs/PATIENT_CONTEXT_MOBILE_DISCRETE_SPEC.md (+ untracked mockups under docs/specs/mockups/).
- **Acceptance checks:** all passed — tsc clean; build green; check:claims pass (4 ivt-anticoag data-claim tags intact); check:humanizer pass; live-preview verified at 375px + 768px (dense chips, amber caution chip, thin "!" note, mRS 0-5 squares). Design via ui-architect (3 variations specced; V picked C + thin note).
- **Clinical impact:** none (presentation only; rendered strings byte-identical to the clinically-reviewed NIHSS-ANTICOAG-ELIG version).
- **Follow-up:** accessibility pass on 28px tap targets (meets WCAG 2.2 AA 24px floor; confirm against project AA interpretation).
- **Rollback plan:** `git revert <merge commit>` restores the 44px pills + amber caution boxes. No data-model or content change.

### NIHSS-ANTICOAG-ELIG — Patient-context anticoagulant/antiplatelet IVT-eligibility redesign — Class E-clinical
- **Status:** ready_for_merge (committed this session)
- **User-visible goal:** On the NIHSS calculator's Patient Context panel, the anticoagulant row becomes a four-class selector (Antiplatelet, DOAC, Warfarin, Heparin/LMWH; "None" dropped, empty = none). Each selected class reveals a per-drug IV-thrombolysis eligibility input in the existing pill vocabulary: DOAC last-dose <48h vs >=48h (plus optional drug name) with an "individualize, safety unknown" note; warfarin INR <=1.7 vs >1.7; Heparin/LMWH aPTT <=40s vs >40s; the latter two with an "excluded" note. Antiplatelet shows a "not a contraindication" note. Every caution reuses the existing amber alert box. Pre-stroke mRS trimmed to 0-5 (no grade 6) with the redundant modal removed. All per-drug inputs gated to the NIHSS surface; Stroke Code unchanged.
- **Non-goals:** no change to Stroke Code's anticoag engine; no copy-export of per-drug eligibility (on-screen aid only); no LMWH since-last-dose timing rule (absent from the 2026 guideline).
- **Files:** src/components/shared/PatientContextPanel.tsx; src/pages/NihssCalculator.tsx; src/lib/cases/{types,format}.ts; src/lib/citations/{claims,registry}.ts; docs/specs/PATIENT_CONTEXT_ELIGIBILITY_SPEC.md; docs/reviews/{arch,clinical}-PR-anticoag-eligibility-redesign.md
- **Acceptance checks:** all passed — tsc clean; build green; check:claims pass (4 new ivt-anticoag claims tagged + registered); check:humanizer pass (0 errors); live-preview verified at 768px (panel renders, four class pills, per-drug sub-rows, amber caution boxes, mRS 0-5); architect §17.1 approve-with-conditions (all adopted); clinical §17.2 approve-with-conditions (conditions addressed: legacy aha-asa-2026-4.2 citation retired, antiplatelet copy tightened to "single or dual", comment-syntax verified clean).
- **Clinical impact:** high (IV-thrombolysis eligibility surface; criteria sourced verbatim from AHA/ASA 2026 §4.6.1 + §4.6.5 / Table 8).
- **Rollback plan:** `git revert <merge commit>` restores the prior 4-pill (None/DOAC/Warfarin/Antiplatelet) selector, the last-dose picker, and mRS 0-6. New optional SavedCaseData fields are additive and ignored by old code (no migration).

### W-HEADACHE-V4 — Clinic Headache "live differential narrowing" rebuild — Class D-clinical (E-clinical surfaces)
- **Status:** ready_for_merge (committed this session; live route flipped to V4)
- **User-visible goal:** at /pathways/headache-clinic the clinician is walked through ICHD-3 phenotyping one question per screen, watching a live differential narrow (band words Leading/Possible/Less likely + dot meters + bare "N of M", NO percentages), to a top-2 result that weighs both patterns (never a verdict), with management behind links and a permanent dangerous-mimic safety strip. SNNOOP10 read-then-decide safety gate runs first.
- **Non-goals:** no engine change (clinicHeadacheData.ts untouched, 84-test suite intact); no new clinical claim authored; no dosing/threshold text changed (HeadacheManagement + CriteriaList mounted verbatim).

### W-HEADACHE-V4 — Clinic Headache "live differential narrowing" rebuild — Class D-clinical (E-clinical surfaces)
- **Status:** ready_for_merge (committed this session; live route flipped to V4)
- **User-visible goal:** at /pathways/headache-clinic the clinician is walked through ICHD-3 phenotyping one question per screen, watching a live differential narrow (band words Leading/Possible/Less likely + dot meters + bare "N of M", NO percentages), to a top-2 result that weighs both patterns (never a verdict), with management behind links and a permanent dangerous-mimic safety strip. SNNOOP10 read-then-decide safety gate runs first.
- **Non-goals:** no engine change (clinicHeadacheData.ts untouched, 84-test suite intact); no new clinical claim authored; no dosing/threshold text changed (HeadacheManagement + CriteriaList mounted verbatim).
- **Files:** NEW `src/pages/ClinicHeadachePathwayV4.tsx`; `src/components/pathways/headache/{HeadacheSafetyScreen,HeadacheDifferentialPanel,HeadacheQuestion,HeadacheDotMeter,HeadacheResultV4}.tsx`; `src/data/{headacheBanding,headacheQuestions,headacheConflict}.ts` (+ tests). FLIP `src/App.tsx` import. RETIRED `src/pages/ClinicHeadachePathway.tsx` + `src/components/pathways/headache/HeadacheResultList.tsx`.
- **Acceptance checks:** all passed — tsc clean; build green (171 routes prerendered, 0 failed); check:claims pass (all 22 clinic-headache data-claims preserved + rendering); 206 tests pass (incl. banding cut-points, question drift-guard + engine reachability, conflict C1 derivation, no-% + always-on safety-strip invariants); architect §17.1 approve-with-conditions (`arch-headache-v4-full-rebuild.md`); clinical pre-gate approve-with-conditions (`clinical-headache-v4-spec.md`); clinical post-gate approve-with-conditions, all conditions resolved (`clinical-headache-v4-postexec.md`); mobile-first-developer 375px sign-off (bottom-bar/tab-bar coexistence fixed to the EvtPathway pattern).
- **Clinical impact:** high (primary headache phenotyping surface).
- **Rollback plan:** `git revert <merge commit>` restores the v3 page (`ClinicHeadachePathway.tsx` + `HeadacheResultList.tsx`) and flips the `App.tsx` import back in one revert.
- **Consolidation note (architect Q4 / clinical M7):** `HeadacheDifferentialPanel` + `HeadacheResultV4` SUPERSEDE the deleted `HeadacheResultList`. `MapperPanel` is now unused by the headache pathway (its only live consumer was `HeadacheResultList`) — retirement candidate, parked below.

### W5.1 — Citation schema foundation — Class D
- **Status:** done — commit 8bf8cc8 (2026-04-17)
- **User-visible goal:** none (foundational infrastructure)
- **Non-goals:** no clinical content changes, no registry entries, no scanner, no pre-commit hook
- **Files touched:** src/lib/citations/schema.ts · src/lib/citations/claim.ts · src/lib/citations/claims.ts (stub) · docs/adrs/ADR-002-citation-schema.md · docs/reviews/arch-PR-W5-1-citation-schema.md
- **Acceptance checks:** all passed — tsc clean · 5 types exported · ADR-002 committed · architect review approve · build green
- **Clinical impact:** none

### W5.2 — Citation registry population — Class E (IN PROGRESS)

**Status:** in_progress (Phase 1 complete, Phases 2–4 pending)

**Completed in current session:**
- Phase 1 plan produced with full source extraction report
- Decision 2 resolved: ACRM 1993 uses longer verbatim text (PMC5575625 / legal-reference match), url = PMC3477558, notes field required in registry entry to document access situation

**Verified and ready to ship when V resumes:**
- hemphill-2001-ich-score citation entry (PubMed abstract provides verbatim scoring text)
- gcs-ich-score-weights claim (fully supported by Hemphill abstract)

**Next session (W5.2 resume):**
V decides remaining blockers. Most likely path: ship Hemphill-only registry entry + gcsScoreData.ts migration as W5.2a. Defer 8 other claims to W5.2b with targeted source-hunting.

**Phase 1 swarm findings (2026-04-20):**

*Claims ready to register:*
- gcs-ich-score-weights — Hemphill 2001 PubMed abstract (PMID 11283388) sufficient; full scoring table in abstract
- gcs-airway-threshold — BTF Prehospital 2023 PMC10627685 (Strong rec); confirmed better source than T&J 1974 per prior clinical review follow-up #1

*Tier 1 sources fetched and verified:*
- ACRM 1993 via PMC5575625 (inline prose version with "any period of", "neurological", "posttraumatic") — confirmed
- BTF Prehospital 2023 via PMC10627685 (airway threshold + partial sedation caveat) — confirmed
- Hemphill 2001 via PubMed abstract PMID 11283388 (full scoring table in abstract) — confirmed
- Rotheray 2012 abstract only, PMID 21787740 (Elsevier paywall blocks full text; GCS 9–14 data, not 9–12)

*Tier 2 source pending V:*
- Teasdale & Jennett 1974 (Lancet paywall; V has institutional access) — needed for gcs-mild-threshold, gcs-severe-threshold, gcs-t-suffix

*V decisions pending before Phase 2 architect review can run:*
1. T&J 1974 PDF or alternative source
2. gcs-moderate-threshold: ACRM 1993 attribution is wrong — ACRM defines mild TBI only; need citation strategy (T&J 1974 if it supports / BTF-implicit / remove attribution)
3. gcs-mild-ct-caveat: no Tier 1 source found; NICE head injury guidelines candidate (nice.org.uk)
4. gcs-airway-reflex-caveat: Rotheray 2012 covers GCS 9–14 not 9–12; V decides: accept with range correction / reword softer / drop / provide full text
5. gcs-sedation-caveat: "metabolic encephalopathy" not in BTF 2023; verb drift "must be considered" vs BTF "should be documented"; reword to match BTF / V provides alternate source / split claim

*Critical content finding:* existing gcsScoreData.ts has attribution errors — ACRM 1993 is cited for moderate and severe TBI which it does not define. Resolution is a clinical content correction, not a W5.2 registry gap.

*Swarm architecture:* medical-scientist used Tier 1/2 workflow correctly (a276442), produced properly-formatted Tier 2 request, stopped at checkpoint per protocol.

### L5.5 — Calculator compliance check swarm — Class C — DONE commit 1985940
- **Status:** merged
- **What shipped:** Full audit of ABCD2, GCS, Heidelberg, NIHSS, IchScore, ASPECTS, HAS-BLED, RoPE, Boston Criteria against CALCULATOR_SPEC.md v1.1. Drawer content-order bug fixed in ABCD2 (d430936), NIHSS (d430936), IchScore (d83695b), GCS, ABCD2, Heidelberg (1985940). Chevron direction regression (introduced in d430936) reverted in NIHSS + IchScore (1985940). --nav-rail-width CSS variable defined (72bb1ba) fixing desktop sidebar overlap across all 5 portal-drawer calculators. ASPECTS, HAS-BLED, RoPE, Boston Criteria have no portal drawer — tracked as L5.5b below.

## BLOCKED
(none)

## PARKING LOT
Ideas deferred from in-progress sessions. Not yet triaged into PENDING.
Entries format: - [YYYY-MM-DD] <idea> (parked during: <task>)
- [2026-07-02] **Ground or downgrade the DAWN/DEFUSE-3 perfusion-verdict COR 1 badges** — Class E-clinical (blocked:awaiting-clinical-review). `EvtPathway.tsx` getEvidenceBadge (~lines 330–332) returns `COR 1 · DAWN` and `COR 1 · DEFUSE-3` for the perfusion-selected *verdict* branches (DAWN/DEFUSE-3 Criteria). This asserts COR 1 for the perfusion route, but no in-repo citation grounds it: `aha-asa-2026-4.7.2` quoted_text covers only the ASPECTS rows; there is no perfusion/mismatch clause. Pre-existing (predates the 2026-07-02 late-window reframe, which correctly de-graded the *selection-step* copy). Fix: medical-scientist either registers a citation whose quoted_text supports a late-window perfusion-selected COR 1 recommendation, or downgrades the two badges to a factual/ungraded label (as the reframe did). Surfaced by the reframe's clinical re-gate (docs/reviews/clinical-evt-late-window-reframe.md, condition 1). (parked during: EVT pathway late-window reframe)
- [2026-07-02] **Claim-tag EvtPathway.tsx (file-wide, zero tags today)** — `src/pages/EvtPathway.tsx` (~2000 lines) carries NO claim tags (no `data-claim`, `claimId`, or `claim()`), so the pre-commit claims hook gives zero semantic coverage on this clinical decision-support surface despite many graded claims rendered via computed strings + JSX. Per `.claude/rules/clinical-surfaces.md` §13.3 this is untagged (not unsupported — surfaces are shipped phases). data-architect to map interpretation strings via `claim()` (Phase 2) and static JSX via `data-claim` (Phase 1) to registered claim IDs; confirm the scanner's shipped phase covers this file's surface types first. Overlaps the existing "untagged-surface data-claim tagging" deferred item; this entry records the EvtPathway-specific scope. (parked during: EVT pathway late-window reframe)
- [2026-07-02] **ELAN listCategory — add a dedicated `anticoagulant`/`secondary-prevention` enum?** — In the audit resolution round (commit e3f63e1) ELAN's `listCategory` was corrected `antiplatelets`→`acute` to match its AF-DOAC-timing peers TIMING/OPTIMAS (the best available same-schema value). The `listCategory` union (`src/data/trialData.ts` ~line 214) has no `anticoagulant`/`secondary-prevention` value; introducing one is a Class D data-schema change (data-architect + downstream filter/UI updates across the trials-list surfaces). Decide whether AF-DOAC-timing trials warrant their own list bucket rather than sharing `acute`. (parked during: audit resolution round close-out)
- [2026-06-07] **EVT / Extended IVT audit — minor follow-ups** — from the full-branch audit (every path reaches a verdict; no dead-ends found). All low-priority, none blocking: (1) Extended IVT "EVT Preferred" and Path-C telestroke/transfer verdicts state the next action but have no button to act — add a "Go to EVT pathway" / "Request telestroke" CTA (Class C). (2) Numeric inputs (ASPECTS 0–10, core, mismatch volume/ratio, NIHSS ≤42) have no on-blur range validation (Class B/C polish). (3) Divide-by-zero edge: the mismatch-ratio computation with core=0 yields `Infinity` (`EvtPathway.tsx` ~line 855); currently produces a clinically-reasonable verdict by luck (DAWN fires first for the common case), but the division should be guarded (Class B). (parked during: EVT/ExtIVT UI fixes — active-slot colour + verdict auto-expand)
- [2026-06-05] **Headache v4 rebuild follow-ups** — from W-HEADACHE-V4 (architect Q4 + `docs/reviews/clinical-headache-v4-postexec.md`). **(1) DONE (this session):** retired `src/components/pathways/MapperPanel.tsx` — verified zero importers (its only live consumer, the deleted `HeadacheResultList`, is gone), removed. **(3) DONE (this session):** fixed the question-phase bottom bar overlapping the global feedback bubble (`fixed bottom-24 right-4`) at phone widths — added a responsive right inset (`pr-14 sm:pr-28 md:pr-0`) so "See result" clears the bubble; verified at 375px. **(2) RE-SCOPED, STILL PARKED — NOT a mechanical rename (Class E-clinical, not C):** `clinic-headache-moh-gepant-safe` is a MANY-TO-ONE shared claim — besides the headache migraine-acute card (`HeadacheManagement.tsx`), it also tags a DIFFERENT card on the migraine guide (`MigrainePathway.tsx:1490`), the MOH/gepant-safety screen, where the `moh-gepant-safe` name is CORRECT. Renaming the shared ID would mislabel that card. Doing it right means SPLITTING into a new `clinic-headache-migraine-acute` claim with its own evidence-backed citation for the full acute regimen (sumatriptan/ibuprofen/gepant/antiemetic — the existing gepant-MOH citation may not cover all of it), which needs `medical-scientist` (evidence) + `clinical-reviewer` (gate). Keep parked as a proper clinical task, not a cleanup. NOTE: prior connectivity-audit headache findings **P-2/P-3/P-4** (old-page branch-chip no-op onClick) and **P-6** (old-page cascade Undo) are now OBSOLETE — the old `ClinicHeadachePathway.tsx` they referenced was deleted by this rebuild. (parked during: headache v4 build)
- [2026-06-05] **India DPDP Act analytics-consent monitoring** — geo-gated analytics (commit 374ecc3) treats India as default-on (opt-out). India's DPDP Act 2023 is in force but its implementing rules (consent-manager + sector requirements) are not yet notified, so default-on is a current-state risk-acceptance per compliance-legal. When the Data Protection Board notifies the rules, reassess whether analytics cookies need opt-in for Indian users and whether `IN` should move into STRICT_COUNTRIES (src/lib/consent.ts). Review trigger: rules notified, or 2027-01-01, whichever is first. (parked during: geo-gated analytics consent)
- [2026-06-03] **[DONE 2026-06-03]** **Fix 3 dead stroke-pathway controls found by the connectivity audit** — from docs/QA_CHECKLIST.md §3. Shipped: B-1 ICH-complete button now toggles a real terminal state + status text; B-2/B-3 print buttons now wired to handlers that re-emit existing protocol/order text. Clinical-reviewed (approve, docs/reviews/clinical-PR-stroke-dead-control-fixes.md); no clinical text changed. (B-1) "Mark ICH protocol complete" button on the bleed branch does nothing — orchestrator passes `onComplete={() => {}}` (StrokeIchProtocolStep.tsx:67 ← StrokeBasicsWorkflowV2.tsx:689); needs a real terminal state (toast/collapse) or removal. Bleed branch is clinical-adjacent → likely Class C-clinical if any copy/feedback text is added. (B-2) "Print Emergency Protocol" button has no onClick (HemorrhageProtocol.tsx:65). (B-3) "Print Order Set" button has no onClick (PostTPAOrders.tsx:117). B-2/B-3 are Class C — either implement print (mirror the modal Print pattern) or remove the dead buttons. (parked during: Full connectivity audit)
- [2026-06-03] **Non-stroke pathway + calculator connectivity audit — findings batch** — from docs/QA_CHECKLIST.md Part 2 (audit done 2026-06-03, no code changed). **P-1 + P-5 SHIPPED 2026-06-03 (clinical-reviewed approve, docs/reviews/clinical-PR-pathway-wiring-fixes-p1-p5.md): P-1 SE Stage-2 setter swap fixed; P-5 headache debug strip removed.** Remaining open: P-2/3/4, P-6, P-7, P-8, P-9, P-10, P-11, P-12. All 13 calculators CLEAN on core scoring/copy/share/reset. Findings: (P-1) StatusEpilepticusPathway.tsx:654 Stage 2 "Seizure Stopped" button calls `setStage1Success(true)` instead of `setStage2Success(true)` — wrong setter, Stage 2 completion never satisfied + EMR note omits Stage 2 "(Responsive)" line — Class C-clinical, one-word setter swap. (P-2/3/4) ClinicHeadachePathway.tsx:449/517/596 three branch chips have no-op onClick — Class C. (P-5) ClinicHeadachePathway.tsx:1041-1146 "Diagnostic (temporary)" debug strip ships to end users ("REMOVE ONCE TUNING COMPLETE", V-requested 2026-05-27) — Class C-clinical, decide if tuning done. (P-6) headache cascade Undo wired same as Dismiss, doesn't restore cleared fields — Class C. (P-7) MigrainePathway.tsx:539 loose Step-2 completion gate — Class C-clinical, confirm intended. (P-8) AscvdRiskCalculator.tsx:385 likely missing Share/Save props — Class C, confirm. (P-9) shared CalculatorDrawer + MrsPickerModal lack Escape/backdrop dismiss — Class B/C a11y. (P-10) Migraine InfoTooltip dead code. (P-11) ASCVD copyConfirm state unrendered. (P-12) EmBillingCalculator timeActivities written but never read into output. (parked during: other connectivity audit)
- [2026-06-03] **Headache-clinic pathway route is published but missing from sitemap/prerender** — discovered during Gate 6 verify of the P-1/P-5 fixes (pre-existing, NOT caused by that change). routeManifest marks `pathways-headache-clinic` (`/pathways/headache-clinic`) `published: true, includeInSitemap: true`, but it is absent from dist/sitemap.xml and was not prerendered (no dist/pathways/headache-clinic/index.html), so the route serves the generic SPA shell to crawlers/initial-HTML and only renders client-side. Sibling pathway routes (se-pathway, migraine-pathway, etc.) ARE in the sitemap + prerendered. Likely a publishGate/sitemap-generator filter mismatch. SEO/indexability impact; page still works for users in-browser. Class C — seo-specialist + routing. (parked during: other connectivity audit Gate 6)
- [2026-06-03] **Stroke-pathway audit SUSPECT/cleanup batch** — from docs/QA_CHECKLIST.md §4–§5. (S-1) ThrombectomyPathwayModal.tsx:55 + ExtendedIVTPathwayModal.tsx:59 have no backdrop-click close while every other modal does — decide + make consistent (Class B/C). (S-2) residual `material-icons-outlined` glyphs in StrokeIchProtocolStep + the two inline accordions may render as literal text on lazy chunks where the font isn't loaded — migrate to lucide-react (Class B). (Cleanup) remove orphaned `Step1Data.eligibilityChecked` field, `CodeModeStep4._generateNote`, and the unused `HemorrhageProtocol.isLearningMode` prop (Class B). S-3 (verdict dropped if onRecommendation omitted), S-4 (Study-Mode detail "Close" closes whole panel), S-6 (CompactVitals emits nothing) are design calls — confirm intended, no code unless V wants a change. (parked during: Full connectivity audit)
- [2026-06-03] **Rate-limit POST /api/feedback** — Class D (security surface). Security review (security-PR-turnstile-removal.md) accepted honeypot + same-origin as the baseline guard but flagged that neither stops a determined scripted attacker (Origin is trivially spoofed outside a browser). A server-side rate limit would cap Resend quota-burn / inbox-spam abuse. Deferred because it needs shared state across serverless invocations (Vercel KV / Upstash) — a new dependency + infra decision. Low urgency: the email recipient is server-fixed, so blast radius is one inbox. (parked during: Turnstile removal)
- [2026-06-03] **Delete unused Vercel env vars `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY`** — config cleanup (not code). After the Turnstile-removal commit ships, both are dead. The new api/feedback.ts no longer reads `TURNSTILE_SECRET_KEY` (so there is no 500-on-missing coupling left), but delete only AFTER confirming the deploy landed. V can remove them in the Vercel dashboard; nothing in the repo references them. (parked during: Turnstile removal)
- [x] [2026-05-24] **Verify FDA Andexxa safety-communication URL resolves** — RESOLVED 2026-06-02. The registered URL `https://www.fda.gov/safety/medical-product-safety-information/update-safety-andexxa-astrazeneca-fda-safety-communication` resolves; FDA.gov blocks the WebFetch bot UA (404) but WebSearch reaches the page and confirms the content verbatim. Registry `quoted_text` matches the FDA communication exactly: "the serious risks including the increase in thromboembolic events are such that the FDA considers the risks of the product to outweigh its benefits," plus ANNEXA-I figures (thrombosis 14.6% vs 6.9%; thrombosis-related death at Day 30 2.5% vs 0.9%) and end of US commercial sales December 22, 2025. `last_reviewed` already current (2026-06-02) from the Andexxa sweep. (parked during: Andexxa-withdrawal synthesis update, commit f35f255)
- [x] [2026-05-24] **Find primary AstraZeneca BLA-withdrawal press release** — **CLOSED — no primary source exists (2026-06-03, documented in registry commit 46118ea).** A 2026-06-02 search found no standalone AstraZeneca press release announcing the Andexxa BLA/US-sales withdrawal. The authoritative primary source for the withdrawal is the FDA Safety Communication (registered as `fda-andexxa-safety-2024`); TCTMD is retained as a dated, reputable secondary for the Dec 22 2025 end-of-US-sales date. A primary-source note recording this was added above the citation in registry.ts. Reopen only if AstraZeneca later issues a formal release. (parked during: Andexxa-withdrawal synthesis update, commit f35f255)
- [2026-05-24] **Register AHA/ASA Spontaneous ICH focused update on FXa reversal** — the 2022 AHA/ASA Class IIa, Level B-NR recommendation for andexanet alfa is functionally superseded by the Dec 2025 US withdrawal but has not been formally retracted. When AHA/ASA issues a focused update reflecting the regulatory transition, register the updated section in `src/lib/citations/registry.ts` and revise the `ich-anticoagulation-reversal-synthesis` claim mapping. Status: blocked:awaiting-aha-asa-ich-focused-update. (parked during: Andexxa-withdrawal synthesis update, commit f35f255)
- [x] [2026-05-16] **Extract `PathwayHeader` primitive** — **DONE (verified 2026-06-03).** `src/components/pathways/PathwayHeader.tsx` (142 lines) exists and is adopted by all 5 pathway pages (EvtPathway, StatusEpilepticusPathway, MigrainePathway, ClinicHeadachePathway, ExtendedIVTPathway) plus PostStrokeLipidManagement — each renders `<PathwayHeader` exactly once; per-file × 3 duplication eliminated. ORIGINAL NOTE: after Tier 5 of the Pattern A fix pass lands, all 3 pathway headers (EVT/SE/Migraine) will have identical anatomy per PATHWAY_SPEC §2. Architect (arch-pattern-a-fix-tier-1-2.md condition 4) recommends extracting `PathwayHeader.tsx` as the 4th edit-pass trigger — currently per-file × 3, acceptable until anatomy diverges or a 4th pathway adopts. Estimated scope: ~80-line primitive consuming `{pathwayName, onBack, isFav, onFavToggle, onReset, onCopy}`. (parked during: Pattern A Tier 1+2 fix pass)
- [x] [2026-05-13] **SPA prerendering / SSR for SEO** — **DONE — LIVE IN PRODUCTION (verified 2026-06-03).** Build-time prerender via `scripts/prerender.mjs` wired as package.json `postbuild`; every Vercel deploy now snapshots all 170 routes from the sitemap (170 succeeded, 0 failed, ~208s) using @sparticuz/chromium + puppeteer-core on Vercel build runners (system Chrome locally). Each route ships its route-specific title + JSON-LD baked into static HTML — no longer shell-only. Googlebot no longer depends on JS hydration for per-route titles. The earlier Vercel-postbuild blocker (puppeteer bundled-Chromium failing in the Vercel build container) was resolved in commit 34df248. ORIGINAL NOTE: current site is CSR; the static HTML shell showed the same title for every route (index.html canonical). (parked during: SEO Phase 1 overnight)
- [2026-05-13] **TrialPageNew H1 conflict with ADR-005 Decision 4** — SEO audit flagged 65+ H1 elements (one per archetype branch, all rendering `{trialMetadata.title}: {trialMetadata.subtitle}`). ADR-005 Decision 4 explicitly chose cobalt H1 as the page H1. Implementation also has a separate H1 at line 404 for the catalog name, so every page has at least 2 H1s. Question: (a) update ADR to specify cobalt H2 (preserve visual); (b) demote line 404 catalog H1 to non-heading (so cobalt H1 remains the only one); (c) restructure page heading hierarchy. Needs V triage. (parked during: SEO Phase 1 overnight)
- [2026-05-13] **routeManifest title/description length violations** — Phase 1 audit found 25+ entries exceeding spec §7.1 limits (titles >60 chars, descriptions >160 chars). Most over-shoot is modest (5-30 chars). Hold for Phase 3 game-plan execution to fix in coherent batches with keyword strategy applied. (parked during: SEO Phase 1 overnight)
- [2026-05-13] **TrialPageNew per-archetype duplication** — **Phase 1 (sticky header bar) DONE — commit 4d4dfad (2026-06-03). Phase 2 (title H1) DONE — commit 0580a8b (2026-06-03).** The architect (docs/reviews/arch-PR-trial-header-bar-extraction.md) split this into two phases. Phase 1 extracted the sticky header bar (back button + category badge), which was duplicated ~105× across archetype branches, into shared `src/components/trials/TrialHeaderBar.tsx`; a codemod (scripts/codemod-trial-header-bar.mjs) replaced 103 byte-identical inline blocks in 4 verified batches (net −823 lines), render-neutral across all 108 prerendered trial pages, clinical-reviewer approved (docs/reviews/clinical-PR-trial-header-bar-extraction.md). **Phase 2 DONE:** the `{trialMetadata.title}: {trialMetadata.subtitle}` H1 block (105 byte-identical compact instances) extracted into shared `src/components/trials/TrialTitleHeading.tsx` via codemod (scripts/codemod-trial-title-heading.mjs); 4 H1 color variants (#1746A2 ×79, isPositive ternary ×12, #1e293b ×11, isHarm ternary ×3) passed through as a resolved `color` prop (architect-sanctioned; tone-enum cleanup parked below). Net −209 lines; render byte-identical across all 108 prerendered title H1 regions (MATCH=108, DIFF=0); 3 excluded headers confirmed intact (EXTEND expanded multiline h1, "Trial Not Found", catalog-fallback year span). Architect approve-with-conditions (docs/reviews/arch-PR-trial-title-heading-extraction.md), clinical-reviewer approve (docs/reviews/clinical-PR-trial-title-heading-extraction.md). ~2 expanded multi-line header forms (e.g. EXTEND) remain inline by design — not matched by the compact codemod. The ADR-005 multi-H1 question is now a follow-up (extraction is mechanical/render-identical; heading-hierarchy restructuring is a separate semantic change). (parked during: SEO Phase 1 overnight)
- [x] [2026-06-03] **TrialTitleHeading tone-enum cleanup** — **DONE — commit a45ce1d (2026-06-03).** Replaced the `color: string` prop with a `tone: 'positive' | 'neutral' | 'harm'` enum; the component now owns its color vocabulary via TONE_COLORS (positive #1746A2 / neutral #1e293b / harm #7f1d1d). Codemod (scripts/codemod-trial-title-tone.mjs) converted 105 call sites (79 positive, 11 neutral, 12 isPositive ternary, 3 isHarm ternary; 0 stray color=). Render byte-identical across all 108 prerendered title-H1 regions (MATCH=108, DIFF=0). Architect approve (docs/reviews/arch-PR-trial-title-tone-enum.md), clinical-reviewer approve (docs/reviews/clinical-PR-trial-title-tone-enum.md). ORIGINAL NOTE: architect follow-up (condition #6 of docs/reviews/arch-PR-trial-title-heading-extraction.md). Phase 2 passes the resolved heading `color` string through as a prop, so the `isPositive`/`isHarm` → cobalt/ink/maroon derivation stays scattered across ~15 call sites and the same four-color tuple is re-typed at each branch. Replace the `color: string` prop with a `tone: 'positive' | 'neutral' | 'harm'` enum that the component resolves to a color, so `TrialTitleHeading` owns its color vocabulary. Non-clinical tech-debt; render output must stay identical. Class C (non-clinical — component file only, no trialMetadata text). (parked during: title-H1 Phase 2)
- [2026-05-13] **Unused imports across src/ (Class B mechanical cleanup)** — running `npx tsc --noEmit --noUnusedLocals` reveals 30+ unused imports across stroke article components, modals, and pages. Categories: unused lucide-react icons (`Info`, `BookOpen`, `ExternalLink`, `Link`, etc.) — safe to remove, ~5-8 KB gzip bundle savings per L5 bundle audit H4; unused string constants (`SUBTITLE` declared not used in HemorrhageProtocolModal, OrolingualEdemaProtocolModal, TpaReversalProtocolModal); unused `setIsLearningMode` state in LVOScreenerV2 and VitalsInputV2 (likely dead-code remnant); `'React'` import unused in files using JSX transform (may or may not be removable depending on tsconfig). Safer subset (lucide icons + string consts + setState pairs) is 20+ files of ~1 line each. Defer batch to V triage; one-line script could automate but JSX-transform `React` decision needs care. (parked during: SEO Phase overnight)
- [x] [2026-05-13] **7 WCAG 2.1 AA high-priority a11y failures (original L5 audit)** — **CLOSED / SUPERSEDED 2026-06-03.** Re-audited fresh; superseded by docs/reviews/a11y-reaudit-pathways-2026-06-03.md. Outcome: 5 of the 7 old findings (H1, H2, H5, H6, H7 — modal focus traps, StrokeBasicsWorkflowV2 toggle/tab ARIA, LKWTimePicker keyboard access) are confirmed RESOLVED in current code (mostly via the 2026-05-17 `useModalFocusTrap` pass + a later listbox-keyboard fix on the time picker). The remaining gaps are re-catalogued with current line numbers in the new doc and tracked as the fresh PENDING item below. The 2026-05-13 doc is marked stale; do not act off its line numbers. (parked during: L5 a11y audit overnight)
- [2026-04-17] Evaluate Claude Design (Anthropic Labs research preview, launched 2026-04-17) for potential integration with design-prototyper workflow. Currently research preview with ~50% reliability on complex tasks; revisit when maturity improves (~3-6 months). Could replace or augment HTML mockup authoring at docs/specs/mockups/. (parked during: W5.1 / end-of-session cleanup)
- [2026-04-22] W6.5 — Archetype B/Grotta Bar + DISTAL trial rebuild. DISTAL is a non-inferiority/negative MeVO trial; requires Grotta Bar component (mRS distribution shift) before page can be built. Park until Archetype B component is implemented. (parked during: W6 10-trial Archetype A rebuild)
- [2026-04-22] W6.6 — Archetype G + WEAVE trial rebuild. WEAVE is a single-arm safety registry; requires Archetype G (single-arm registry display) before page can be built. Park until Archetype G component is implemented. (parked during: W6 10-trial Archetype A rebuild)
- [2026-04-21] [DONE — commit 72bb1ba] Patch C desktop drawer fix (--nav-rail-width) — defined CSS variable in index.css; NIHSS hardcoded left:0 also fixed. All 5 portal-drawer calculators now clear the desktop rail. (parked during: Patches A/B/C)
- [2026-04-21] Consider adding `clinicalQuestion?: string` field to TrialMetadata schema (trialData.ts) so the §1.3 question lede can be data-driven rather than hardcoded per trial page. Not urgent — only EXTEND page exists today. **DEFERRED by V (2026-06-03)** — not started this session; remains parked for a future schema PR. (parked during: Patches A/B/C)
- [2026-04-28] [DONE — commit 142815e] Four conflicting legend values resolved: NINDS (+15/100, NNT 6.5), ESCAPE (+24/100, NNT 4.2), DEFUSE-3 (+28/100, NNT 3.6), DAWN (+36/100, NNT 2.8). All sourced from efficacyResults and calculations.nnt in trialData.ts. No conflicts with existing data.
- [2026-04-28] [DONE — spec commit TBD] TRIALS_SPEC.md v1.4 — Part II (legend listing page) added. Covers Toggle, Chip, TrialLegendCard components; 6 tokens; effectiveView pattern; NNT-as-stat backfill recipe; dynamic-route validator fix. (parked during: W7.1 legend slice + page rebuild)
- [2026-04-28] Backfill `legend` slice on remaining ~16 trials — Class C-clinical-editorial. Use NNT-as-stat pattern from TRIALS_SPEC §L6.1. Seven trials done (ECASS III, EXTEND, MR CLEAN, NINDS, ESCAPE, DEFUSE-3, DAWN). Ready for bulk pass: SWIFT PRIME, REVASCAT, EXTEND-IA, THRACE, DIRECT-MT, DEVT, SKIP, MR CLEAN NO-IV, DIRECT-SAFE, SWIFT-DIRECT, LASTE, TENSION, COMPASS, ASTER, ASTER 2, CHOICE, RESCUE-BT, ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, CHARM, ESCAPE-NA1. Card renders gracefully with absent legend (falls back to listDescription; omits chip/stat slots). (parked during: W7.1 legend slice + page rebuild)
- [2026-05-01] Author clinical synthesis paragraph for each of six question-detail pages — Class D-clinical, gated by clinical-reviewer. Page shell shipped in [SHA — see commit below]; content remains. The curated answer paragraph will replace the "Curated answer in progress" copy in the cobalt-soft status banner (src/pages/QuestionDetailPage.tsx). Requires medical-scientist authoring + clinical-reviewer approval + citation trace per TRIALS_SPEC §L5.3. trialIds schema added to trial-questions.ts (src/data/trial-questions.ts:trialIds[]). Anticoagulation question TODO: trialCount raised from 9→3 to match resolved IDs; 6 further AF/ESUS/PFO trials needed when added to data layer. (parked during: W7.1 question-detail shell)
- [2026-05-01] Question taxonomy expansion: 6 → ~24 clinical questions — Class C-clinical-editorial. Current 6 stubs are a starter set. Full taxonomy requires editorial classification of which trials address which questions, reviewed by clinical-reviewer (classification is a clinical assertion). (parked during: W7.1 spec amendment)
- [x] [2026-05-01] ⌘K command palette for /trials — Class C. **ALREADY SHIPPED (closed 2026-06-03).** A global ⌘/Ctrl+K command palette already exists app-wide via SearchProvider.tsx — it opens a search overlay whose index is built from routeManifest + trialData + trial-questions, so trials are fully covered. Building a trials-local ⌘K would duplicate the global overlay. No further work; superseded by the global implementation. (parked during: W7.1 spec amendment)
- [2026-05-08] Vocabulary-consolidation ADR: `trialResult` / `specialDesign` / `primaryDesign+primaryResult` / `archetypeId` — Class D. Codebase carries four parallel vocabularies (legacy, deprecated, Wave 2, Wave 3) with no consumer pruning. Batch 3 Wave 1 did not solve this; tracked as post-flight follow-up from arch-batch3-wave1-schema-extensions.md. (parked during: Batch 3 Wave 1 schema extensions)
- [2026-05-08] `classifyTrial.ts` extraction to `src/lib/trials/` — Class D. Classifier currently embedded in TrialPageNew.tsx stats useMemo; should be pure function before Wave 4 visualization components. Arch follow-up from arch-wave3-batch2-renderer.md. (parked during: Wave 3 Batch 2 renderer wiring)
- [2026-05-08] EXTEND canary migration decision — Class D. Decide whether EXTEND page (TrialPageNew.tsx lines 358+) migrates onto Wave 3 schema-driven path or is formally retired as one-off. Must be settled before Wave 4 component work. Arch follow-up from arch-wave3-batch2-renderer.md. (parked during: Wave 3 Batch 2 renderer wiring)
- [x] [2026-05-08] NOR-TEST data inconsistency: tagged `noninferiority`+`noninferiority-not-established` but `doesNotProve` says superiority trial — Class C-clinical data fix. **DONE — resolved 2026-05-20 (verified closed 2026-06-03).** Clinical follow-up from clinical-wave3-batch2-renderer.md. (parked during: Wave 3 Batch 2 renderer wiring)
- [2026-05-08] `harmSignal` claim tagging (6 entries): POINT, SAMMPRIS, SPS3, SPARCL, THALES, INSPIRES — each needs adjacent `claimId` + registry record with `quoted_text` per §13.4 Phase 1. Status: blocked:awaiting-registry-population until W5.2 lands. (parked during: Batch 3 Wave 2 data population)
- [2026-05-08] OPTIMAS 2pp NI margin + INSPIRES bleeding HR (2.08, 1.07–4.04) citation trail: when W5.2 lands, add full citation records (Werring Lancet 2024 PMID 39491870; Gao NEJM 2023 PMID 38157499) with `quoted_text` to registry. (parked during: Batch 3 Wave 2 data population)
- [2026-05-11] `time-is-brain-deep` pearl (strokeClinicalPearls.ts line 86) still contains "NINDS trial: Treatment <90min had 50% vs 38% good outcome at 3 months" — same misattribution corrected in Phase 1C (ninds-trial pearl). The 50%/38% is the Part 2 overall Barthel ≥95 result; the <90min time-stratified benefit analysis is from Marler et al. 2000 (Neurology 2000;55:1649-1655, PMID 11113218). Fix: either re-source to Marler 2000 with adjusted OR data, or replace with Emberson 2014 pooled time-benefit framing. Class E follow-up. (parked during: Phase 1C audit remediation)
- [2026-05-11] Data-layer NNT prose cleanup for ordinal-shift trials — Class E follow-up from Phase 2A. DEFUSE-3 (trialData.ts lines 4628–4633, 4648), SELECT2 (lines 4791–4793), ANGEL-ASPECT (lines 4868–4870) contain nntExplanation/pearl/legend.keyStat NNT statements that are statistically invalid for ordinal common-OR designs. Fix: replace with ordinal-appropriate cOR framing OR gate every consumer behind stats.suppressNNT. Trial-statistician sign-off required. (parked during: Phase 2A audit remediation)
- [2026-05-01] Timeline view (/trials/timeline) — Class D. Chronological display of all 79 trials by year. New route, new view toggle state. No clinical content change. (parked during: W7.1 spec amendment)
- [x] [2026-05-01] Long-press to favourite on mobile — Class C. **DONE — commit 5428f96 (2026-06-03).** 500ms touch long-press on a TrialLegendCard toggles favourite without navigating; >10px move cancels, swallows the click-through, `navigator.vibrate(15)` haptic. Pointer-event handlers wired in TrialLegendCard.tsx; visible star button unchanged. (parked during: W7.1 spec amendment)
- [x] [2026-05-20] **Add "PFO closure for cryptogenic stroke" trial question** — **DONE — already in data (verified closed 2026-06-03).** The `pfo-closure-cryptogenic` question exists in src/data/trial-questions.ts (icon 'brain', trialCount 3, trialIds [close-trial, respect-trial, reduce-trial]) and its curated synthesis answer is in src/data/clinicalSynthesesByQuestion.ts (claimId `pfo-closure-cryptogenic-synthesis`). DEFENSE-PFO remains a TODO for when it enters the data layer. — Class C-clinical-editorial. The three 2017 PFO closure trials (CLOSE, RESPECT long-term, REDUCE) ship as standalone trial entries in this commit but do not fit any of the existing 20 entries in src/data/trial-questions.ts. A new question — likely "When does PFO closure reduce recurrent stroke?" or "Cryptogenic stroke with PFO: closure vs medical therapy?" — should group close-trial, respect-trial, reduce-trial (and predecessors CLOSURE-I 2012, original RESPECT 2013, PC 2013 if those are added later). Curated answer paragraph required per TRIALS_SPEC §L5.3; clinical-reviewer gate. trialIds + trialCount in trial-questions.ts; QuestionIconKey to be selected (likely 'waveform' or new 'cardiac' icon). (parked during: 2017 PFO closure cluster authoring)
- [DONE — commit 34df248 on 2026-05-24] SPA prerendering Vercel postbuild blocker resolved. Sitemap now emits www-prefixed canonical URLs; prerender regex extended to strip the www. subdomain before concatenating with localhost preview origin. 169 routes prerender on every Vercel deploy.
- [x] [2026-05-22] **VERCEL POSTBUILD ISSUE — puppeteer-on-Vercel debug needed.** **RESOLVED (superseded by commit 34df248; prerender live in production 2026-06-03).** Root cause was option (a)/(b): the fix adopted @sparticuz/chromium + puppeteer-core for Vercel build runners (the prerender script branches on `process.env.VERCEL`). Postbuild is wired and every deploy now prerenders 170 routes, 0 failed. Historical note retained below. ORIGINAL: Commit 43a4823 wired `"postbuild": "node scripts/prerender.mjs"` after V installed puppeteer 25.0.4 locally. Local `npm run build` succeeded end-to-end (165 routes in 3:25). On Vercel: deploy never completed (~17+ min, sitemap.xml on production still showed pre-43a4823 state, confirming Vercel rolled back to last good deploy at cbd9f05). Postbuild line reverted in commit [NEXT — to be filled in] so the sitemap + routeMeta changes can deploy without prerender. Likely root cause (one of): (a) puppeteer 25's bundled Chromium fails to download or run in Vercel's stripped Linux build container (missing system libs like libnss3, libatk1.0-0, libdrm2, etc.); (b) Vercel's build runners may need PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable to use Vercel's pre-installed Chrome instead of puppeteer's bundle; (c) the 3:20 prerender step pushed total build time past Vercel's silent timeout. NEXT STEPS for V's morning (~30 min): (1) check Vercel deploy logs for 43a4823 — the error message will tell us which of (a)/(b)/(c) it is; (2) likely fix is to use @sparticuz/chromium (lambda-style minimal Chrome ~50MB designed for serverless and Vercel build containers) + puppeteer-core; OR set `PUPPETEER_SKIP_DOWNLOAD=true` and point to Vercel's preinstalled Chrome via PUPPETEER_EXECUTABLE_PATH; (3) once one of those works on Vercel, re-add the postbuild line. The prerender script (scripts/prerender.mjs), sitemap additions, and routeMeta additions all remain in place — only the build-script wiring was rolled back. (parked during: 2026-05-22 Gate 6 failure post-43a4823)
- [x] [2026-05-21] **SPA pre-rendering (Path B) — Phases 1+2+3 complete locally, awaiting Vercel postbuild fix.** **DONE — LIVE IN PRODUCTION 2026-06-03.** Postbuild wired; every Vercel deploy prerenders all 170 sitemap routes (0 failed, ~208s) with route-specific titles + JSON-LD baked into static HTML. Vercel-container Chrome resolved via @sparticuz/chromium + puppeteer-core. Historical detail retained below. ORIGINAL: History: parked 2026-05-13, re-prioritized 2026-05-21 via Codex GCS audit, Path A (react-snap) failed overnight, V chose Path B (custom script). Architect review: docs/reviews/arch-PR-spa-prerendering-2026-05-21.md. **Status: scripts/prerender.mjs now reads public/sitemap.xml dynamically and snapshots all 149 indexable routes in 183s with 4-way concurrency and per-route failure tolerance. Workbox globIgnores updated to prevent the 8.4 MB of per-route HTML from bloating SW precache.** CLI: `--mode=all` (default, Phase 3 — 149 routes) | `--mode=static` (Phase 2 — 38 static routes) | `--mode=phase1` (legacy 11-route smoke-test). Local validation against macOS system Chrome: all 149 routes succeed, every surface type (trial / question / pathway / guide / calculator / hub) carries its route-specific title + JSON-LD baked into static HTML. **REMAINING NEXT STEPS FOR V (~10 min, morning):** (1) `npm install -D puppeteer` (latest, ~24.x — bundles modern Chromium that works on Vercel build runners). (2) Verify locally: `npm run build && node scripts/prerender.mjs` should print "Done: 149 succeeded, 0 failed". (3) Add `"postbuild": "node scripts/prerender.mjs"` to package.json scripts. (4) Push. (5) Gate 6 live-verify per-route titles in production. After it ships, every Vercel deploy will produce 149 pre-rendered HTML files. Side-bench: 16 question routes added in cb0f51b are not yet in sitemap; adding them gets prerender coverage from 149 → 165. (parked during: overnight 2026-05-21; Phase 2+3 complete locally 2026-05-22)
- [SKIPPED BY AGREEMENT] [2026-05-21] **GCS calculator H1 visibility decision** — **DROPPED per V (2026-06-03): "Leave as-is."** The GCS H1 stays screen-reader-only; the locked calculator-header spec is preserved. No change. — Class C. Codex GCS keyword audit found the GCS calculator's H1 ("Glasgow Coma Scale (GCS) Score Calculator") is present in DOM but `sr-only` (visually hidden, screen-reader-only). Google still reads it from the DOM, but visitors land on the page and see "Eye Opening (E)" as the first visible heading instead of the page-level H1. Hurts perceived authority + may reduce click-through if Google's SERP snippet preview leads with a title the visitor then doesn't see on landing. Decision options: (a) make H1 visible above the sticky calculator header — design change requires V sign-off; (b) keep H1 sr-only but ensure the first visible H2 carries the keyword (already does — "Eye Opening" implicitly clinical); (c) restructure header to include a visible "Glasgow Coma Scale (GCS)" eyebrow + the existing sticky score chip. Recommendation: option (c) — adds a single visible H1 line above the sticky header without changing the existing calculator UX. Estimated effort: ~1 session. Same pattern likely applies to other calculator pages (NIHSS, ICH, ABCD2, etc.) — extend the fix as a Class C-clinical batch if the pattern holds. (parked during: 2026-05-21 GCS keyword research)
- [2026-05-21] **Named author / reviewer E-E-A-T treatment** — Class C-clinical. Google's medical-content rater guidelines favor named, credentialed authorship on YMYL pages. Current direction (V call 2026-05-21): anonymous "NeuroWiki Editorial Team" everywhere, no named bylines. Unblock when there are 2+ named reviewers with credentials willing to be publicly listed. Then ship: (1) JSON-LD `author` + `reviewedBy` blocks on every clinical schema (MedicalWebPage, MedicalGuideline, MedicalStudy, SoftwareApplication), pointing to a `Person` schema with credentials per reviewer; (2) visible "Reviewed by [Name], MD — [date]" footer line on calculator/guide/pathway/trial pages linking to an `/about` or `/editorial` page; (3) `/about` page authored to describe the editorial process (evidence verification, clinical review gate, citation traceability) and list each named reviewer with `medicalSpecialty` and `affiliation`. Estimated effort: 1 session for schema + footer (T2.2 + T2.3 from SEO audit follow-up); 1 session for `/about` page content (`compliance-legal` + `content-writer`). SEO impact: closes the ~10–20% E-E-A-T softness from anonymous bylines on YMYL queries. (parked during: 2026-05-21 SEO Tier 1 batch follow-up — Google GA4 AI audit flagged author signals)
- [2026-05-21] **Calculator → trials UI wiring** — Class C-clinical. Data module shipped at src/lib/calculatorTrialMap.ts (commit 076fc92) with STRONG/MEDIUM/WEAK confidence annotations per calculator. Next steps: (1) clinical-reviewer §17.2 gate on the 8 non-NA mappings, especially the 3 WEAK entries (ABCD2, HAS-BLED, CHA₂DS₂-VASc — derivation-study calculators with tenuous trial-page anchors); (2) build `<CalculatorTrialEvidence calculatorId="..." />` component reading from calculatorTrialMap; (3) wire on STRONG-confidence calculators first (NIHSS, ASPECTS, ICH Score, RoPE) — defer WEAK pending clinical-reviewer call. Source: docs/audits/link-graph-audit-2026-05-21.md §4. (parked during: 2026-05-21 autonomous SEO/link-graph session)
- [2026-05-21] **Trial-page visual Batches 2, 3, 4** — Class C-clinical (Batch 2 safety items) + Class C (Batches 3, 4). Batch 1 (systemic token cleanup, ~435 sites) shipped 9ea875b. Remaining batches per docs/audits/trial-page-visual-audit-2026-05-21.md: Batch 2 = spec-anatomy gaps (eyebrow meta line per §1.1, "Trial at a Glance" §1.4, purple Pearls label §14.1, BAOCHE callout shape §1.6, DISTAL drawer prop §10.3, INTERACT4 renderSafetySection §13) — needs medical-scientist for safety-section data check + clinical-reviewer. Batch 3 = CHARM custom viz → spec §3.7 prose-narrative variant — needs trial-statistician confirmation of viz framing. Batch 4 = generic-fallback retirement (bg-slate-900 removal, color-token cleanup, Archetype G wiring, H1 fix) — Class D, needs system-architect plan-review first. (parked during: 2026-05-21 autonomous SEO/link-graph session)
- [2026-05-21] **Guide-page wider trial/calculator linking audit** — Class C-clinical-editorial. Existing `<Trial>` component (src/components/article/Trial.tsx, token-fixed in ad5902b) is well-adopted by IvTpa, Thrombectomy, AcuteStrokeMgmt, IchManagement. Audit + extend coverage on the remaining 14 guide pages (StrokeBasics, StrokeBasicsLayout, StrokeGuidelineMindmap, StatusEpilepticus, SeizureWorkup, Meningitis, Gbs, MyastheniaGravis, MultipleSclerosis, Vertigo, HeadacheWorkup, AlteredMentalStatus, WeaknessWorkup). Per-page editorial: identify trial/calculator name mentions in prose, wrap with `<Trial>` and add a `<CalcRef>` companion component if calculators need inline linking too. Note: GBS/MG/MS/Meningitis are outside the stroke-trial catalog so wrap volume there will be lower (calculator links only). Source: docs/audits/link-graph-audit-2026-05-21.md §5. (parked during: 2026-05-21 autonomous SEO/link-graph session)
- [2026-05-21] **Chain coverage Phase E — 19 chains total** — Class D-clinical. 5 chains shipped today (hemicraniectomy, basilar-evt, pfo-closure, carotid, evt-mevo); 15 trials in chains. Audit identified 14 NEW chains and 5 parked chains, total 19 chains needed to cover ~85 of 101 trials. Each chain is a separate D-clinical PR through medical-scientist + clinical-reviewer. Priority order: (a) parked: antiplatelet-acute, evt-anterior, evt-bridging, ivt-tenecteplase, doac-after-af; (b) new: evt-large-core, evt-late-window, evt-technique, evt-adjunct-pharma, ivt-classic-window, bp-post-evt, bp-prehospital, msu-prehospital, ich-surgery, ich-anticoag-reversal, icas-stenting, evt-historical-negative, crao-thrombolysis. Full FLAGS for medical-scientist ratification in docs/audits/link-graph-audit-2026-05-21.md §1.4. Multi-week effort; gates clinical-reviewer queue. (parked during: 2026-05-21 autonomous SEO/link-graph session)
- [2026-05-21] **/trials/timeline historic chronology route** — Class C, gated on chain coverage. Single-page chronological view of all 101 trials by year, with filter chips by category and a chain-overlay toggle. Highest SEO crawl-depth win (1 page → 101 internal trial-page links). Wait until Chain Phase E lands so chain-overlay feature has populated data. Sketch in docs/audits/link-graph-audit-2026-05-21.md §6. (parked during: 2026-05-21 autonomous SEO/link-graph session)

## PENDING

### pathway-a11y-reaudit-fixes — Class C-clinical [from docs/reviews/a11y-reaudit-pathways-2026-06-03.md]
- **Status:** [x] done — 9bd39cf. All 9 findings (RH1–RH9) shipped + PathwayHeader favourite-button aria-pressed/aria-hidden propagated to all 6 consumers. RH1/RH4 result-region gaps confirmed real (no pre-existing live region) before wrapping. tsc clean; build 170/170. Clinical-reviewer §17.2 artifact: docs/reviews/clinical-PR-pathway-a11y-reaudit.md (approve — ARIA-only, rendered text byte-identical).
- **User-visible goal:** Make the clinical-pathway pages and the stroke time-picker fully usable by clinicians on a keyboard or screen reader — results announced aloud when they appear, toggle/checkbox controls correctly labelled, and the favourite control named. 9 genuinely-open high-priority WCAG 2.1 AA findings (RH1–RH9), all small attribute additions (S complexity, 1–5 lines each, no logic changes).
- **Non-goals:** No layout/visual redesign; no clinical text, threshold, or content changes; no rebuild of the time-picker interaction (its keyboard listbox already shipped — only the residual mobile date-accordion `aria-expanded` remains).
- **Files likely touched:** src/pages/MigrainePathway.tsx (RH1 result aria-live, RH2 SafetyToggle aria-pressed, RH3 red-flag role="checkbox"/aria-checked), src/pages/ClinicHeadachePathway.tsx (RH4 result aria-live, RH5 progressbar aria-label), src/pages/ElanPathway.tsx (RH6 star aria-label/aria-pressed, lines 289–294), src/pages/StatusEpilepticusPathway.tsx (RH7 weight label htmlFor/id, RH8 Stage 3 dose row aria-live), src/components/article/stroke/LKWTimePicker.tsx (RH9 mobile date-accordion aria-expanded).
- **Acceptance checks:** each control has the specified ARIA per the re-audit doc; tsc clean; build green (170/170 prerender); render/visual output unchanged at 375px + 1280px; clinical-reviewer confirms no clinical content/claim touched (§17.2 artifact); mobile-first-developer sign-off. NOTE: RH1 + RH4 (Migraine/ClinicHeadache result regions) and ExtendedIVT/EvtPathway were read TRUNCATED during the audit — confirm the result-region gap is real (not present further down the file) before adding the wrapper.
- **Clinical impact:** none (presentational/ARIA only — no scoring, threshold, or copy change). The three safety-adjacent findings (RH3 red-flag selection state, RH7 weight-input label, RH8 Stage-3 dose announcement) ship first as their own batch.
- **Rollback plan:** git revert the single commit; ARIA-attribute-only, no state/logic to unwind.
- **Source review:** docs/reviews/a11y-reaudit-pathways-2026-06-03.md (RH1–RH9 with current line numbers + recommended batches)

### vestibular-migraine-a1-6-6-full-criteria-expansion — Class E-clinical [from clinical-headache-definitional-criteria-2026-05-27 §17.2 Condition 3]
- **Status:** blocked:awaiting-source-retrieval
- **User-visible goal:** Expand ICHD-3 Appendix §A1.6.6 Vestibular migraine encoding from the current 2-criterion approximation (vm-A, vm-B) to the full Bárány Society / IHS criteria (Lempert et al. J Vestib Res 2012): 5 criteria including ≥5 vertigo episodes of moderate-severe intensity 5 min–72 h, history of 1.1 or 1.2 migraine, ≥1 migraine feature during ≥50% of vertigo episodes, and not-better-accounted-for clause. Required for diagnostic fidelity of the appendix entity beyond the V-reported phonophobia false-positive bug already closed 2026-05-27.
- **Files likely touched:** src/data/clinicHeadacheData.ts (vestibular-migraine phenotype criteria + new chip vocabulary for vertigo episode count/intensity/duration + history-of-migraine), src/data/clinicHeadacheData.test.ts (full A–D coverage), src/lib/citations/registry.ts (Lempert 2012 citation).
- **Acceptance checks:** Verbatim Lempert 2012 / ICHD-3 §A1.6.6 text in quoted_text; PMID + DOI registered; vm-A through vm-D all flagged definitional; ≥50%-of-episodes temporal qualifier surfaced as confirmation prompt (chip-enforced where possible); regression tests for each definitional gate; clinical-reviewer §17.2 sign-off.
- **Clinical impact:** low (deferred expansion, not a new safety issue — V-reported false-positive is already closed)
- **Rollback plan:** git revert single commit.
- **Source review:** docs/reviews/clinical-headache-definitional-criteria-2026-05-27.md (Condition 3)
- **Blocker:** Lempert et al. J Vestib Res 2012 full-text retrieval (PubMed MCP `lookup_article_by_citation` + `get_full_text_article`).

### evt-curated-circulation-fix — Class E-clinical [from EVT enrichment wave batch 3 clinical review]
- **Status:** [ ] open — L4, P1 (medium-high severity, separate gate from other cluster items)
- **User-visible goal:** Fix factual error in curated `inclusionCriteria` on **MR CLEAN-NO IV** and **RESCUE BT** trials. Both cards currently state "anterior or posterior circulation occlusion" but source-verified eligibility (via commit 8bf31e8 `fullEligibility`) shows each trial enrolled **anterior-circulation only** (ICA/M1/M2 occlusion). The new `fullEligibility` is source-correct and live on the page; the curated summary contradicts it. A clinician triaging a posterior/basilar LVO could be misled. Must update both trials' curated `inclusionCriteria` fields to match the full-eligibility source truth, then gate through clinical-reviewer.
- **Non-goals:** Not changing control arm or other trial fields; not changing the statistical outcome or recommendation. Curated summary sync-to-source only.
- **Files likely touched:** `src/data/trialData.ts` (MR-CLEAN-NO-IV + RESCUE-BT entries `inclusionCriteria` field; verify `fullEligibility` is intact).
- **Acceptance checks:** MR CLEAN-NO IV curated text reflects anterior-only enrollment (correct wording sourced from publication); RESCUE BT curated text reflects anterior-only enrollment; clinical-reviewer §17.2 sign-off; tsc clean; build 171/171.
- **Clinical impact:** high (prevents posterior-circulation misclassification at the bedside).
- **Rollback plan:** git revert single commit.
- **Source review:** Wave 3 batch clinical review (docs/reviews/clinical-evt-batch3.md, finding F2); commit 8bf31e8 evidence packet full-eligibility source details.

### evt-curated-summary-cluster — Class C-clinical (low-severity; reconcile multiple curated fields) [from EVT enrichment wave batch 3 clinical review]
- **Status:** [ ] open — L5, P2 (optional cleanup; no clinical safety impact)
- **User-visible goal:** Reconcile curated `inclusionCriteria` + other summary fields across 3 trials where the curated text does not match the published source:
  - **SELECT2:** curated field says "mRS 0 or 1 at baseline" but the publication allows mRS 0–2 (non-disabling deficit at screening). Update field to reflect the broader eligibility.
  - **RESCUE BT:** curated field says "NIHSS 4+" but the publication specifies NIHSS 0–42 range. Clarify the effective floor (check if 0–3 excluded elsewhere, if registration says "4+", or if this is manuscript vs. protocol drift).
  - **SELECT2:** curated field omits "NIHSS ≥6" floor that the publication specifies. Add the floor to the curated text.
- **Non-goals:** Not changing the statistical outcome or recommendation. Not deleting the curated fields (they remain as quick-reference summaries). Clarification + source-alignment only.
- **Files likely touched:** `src/data/trialData.ts` (SELECT2 + RESCUE BT entries `inclusionCriteria` or equivalent curated field).
- **Acceptance checks:** Each updated curated text sources to the original publication or trial registration (note source in comment if needed); clinical-reviewer spot-check on accuracy; tsc clean; build 171/171.
- **Clinical impact:** low (the `fullEligibility` is source-truth and live; curated text is a convenience summary; mismatch is confusing but users can check full eligibility).
- **Rollback plan:** git revert single commit.
- **Source review:** Wave 3 batch clinical review (docs/reviews/clinical-evt-batch3.md, findings F3–F5); trial publications.

### compass-registry-vs-conduct — Class C (optional UI annotation) [from EVT enrichment wave batch 2 clinical review]
- **Status:** [ ] open — L5, P3 (optional; hygiene/documentation only)
- **User-visible goal:** Surface the benign discrepancy in COMPASS trial: the `fullEligibility` reflects the registered protocol (NIHSS ≥8, ASPECTS <7, negative CTA/MRA), but the actual trial conduct paper may report slightly different thresholds (NIHSS ≥6, ASPECTS >6 based on commit d2abd41 source audit). Both are legitimate (protocol vs conduct); neither is wrong. If the owner wants transparency: optionally add a small UI label/note adjacent to the eligibility section clarifying "registered protocol thresholds shown" or "as-conducted thresholds: <…>", OR document both sets as separate `fullEligibility` branches (unlikely). Low priority; clarification for completeness.
- **Non-goals:** Not changing the trial result or recommendation. Not a clinical error; both are valid perspectives on the same trial.
- **Files likely touched:** `src/data/trialData.ts` (COMPASS entry `fullEligibility` comment or optional second rendering branch); optionally docs/NEUROWIKI.md (note about registry vs conduct).
- **Acceptance checks:** UI label (if added) clearly distinguishes protocol vs conduct; does not confuse users; clinical-reviewer spot-check optional (not a clinical change, annotation only).
- **Clinical impact:** none (both sources are medically valid; annotation improves clarity).
- **Rollback plan:** n/a if UI annotation only; git revert if code change.
- **Source review:** Wave 2 batch clinical review (docs/reviews/clinical-evt-batch2.md, note section); commit d2abd41 evidence packet COMPASS source detail.

### escape-primary-or-reconcile — Class C-clinical (rescoped: label clarification, not value fix)
- **Status:** [ ] open — L4, P2 (pending owner sign-off)
- **Resolution:** Verification complete via commit c1146eb evidence packet (docs/evidence-packets/2026-06-08-trial-pilot-arm-enrichment.md Task C). The displayed OR 2.6 (95% CI 1.7–3.8) is CORRECT — this is the pre-specified unadjusted primary result per Goyal NEJM 2015 p.1024/1025. The adjusted/secondary OR 3.1 (2.0–4.7) was from HERMES meta-analysis, not the primary trial publication. NO value change to `effectSize: OR 2.6` was warranted. The discrepancy arose from ambiguity about which source held the primary result.
- **User-visible goal:** Remaining work is OPTIONAL label clarification (non-urgent, pending owner sign-off). Annotate the displayed 2.6 as "unadjusted, pre-specified primary" in the howToInterpret text or stat card label to prevent a future editor incorrectly "correcting" 2.6 → 3.1. Optionally record the adjusted secondary 3.1 as labeled secondary stat for reference.
- **Non-goals:** not changing the numeric value `effectSize: OR 2.6` (it is correct). Not changing ESCAPE archetype, interpretation logic, or clinical recommendation. Label-only change if anything ships.
- **Files likely touched:** `src/data/trialData.ts` (ESCAPE entry `howToInterpret` or stat label, if owner approves); no schema changes.
- **Acceptance checks:** Owner confirms label text; label wording aligns with trialist intent (primary vs secondary); clinical-reviewer spot-check on label only.
- **Clinical impact:** low (no value change; label prevents future incorrect "fixes").
- **Rollback plan:** n/a if no code change (label clarification); single-commit revert if label ships.
- **Source review:** Evidence packet docs/evidence-packets/2026-06-08-trial-pilot-arm-enrichment.md Task C; ESCAPE primary publication Goyal et al. N Engl J Med 2015 p.1024–1025.

### ecass3-cor-class-recheck — Class C-clinical [from clinical-trial-eligibility-arms-pilot.md §3 follow-ups]
- **Status:** [ ] open — L5, P2
- **User-visible goal:** Re-verify ECASS III's recommendation class (currently noted COR 2a LOE B-R) against the cited 2026 AHA/ASA guideline at next clinical pass. At the time the note was authored (2026-05), the guideline section was confirmed; verify freshness at next clinical-review gate.
- **Non-goals:** not changing interpretation or claim text; freshness verification only.
- **Files likely touched:** `src/data/trialData.ts` (ECASS III `recommendation` or comment field, if present); `src/lib/citations/` (aha-asa-2026 citation `last_reviewed` date).
- **Acceptance checks:** ECASS III §8c recommendation class (COR 2a LOE B-R) confirmed against published 2026 AHA/ASA guideline text; if the class is outdated, file a new Class E-clinical task for the update; last_reviewed date refreshed if no change needed.
- **Clinical impact:** low (if confirmed correct, no impact; if wrong, reclassification needed).
- **Rollback plan:** n/a (verification-only; no code change unless reclassification found).
- **Source review:** flagged in docs/reviews/clinical-trial-eligibility-arms-pilot.md §3; 2026 AHA/ASA guideline §6 ECASS III entry.

### ninds-eligibility-fulltext-verify — Class C-clinical [from clinical-trial-eligibility-arms-pilot.md §3 follow-ups]
- **Status:** [x] DONE — resolved commit c1146eb (2026-06-08) — Confidence upgrade Medium → High
- **Resolution:** All 13 exclusion + 4 inclusion criteria in NINDS `fullEligibility` verified character-for-character against NEJM 1995 p.1582 (Broderick et al., PMID 7477192) per commit c1146eb evidence packet (docs/evidence-packets/2026-06-08-trial-pilot-arm-enrichment.md Task D). No transcription drift found. Confidence officially upgraded from Medium to High. Data is audit-trail-complete.
- **Notes:** NINDS was the first trial in the 5-trial pilot and the first to reach High-confidence fullEligibility status. Remaining 74 NCT-linked trials eligible for backfill in future reviewed waves (tracked in task trial-eligibility-arms-expand-remaining-74-trials).

### trial-control-arm-appendix-granularity — Class C-clinical (optional owner decision)
- **Status:** [ ] open — L5, P2
- **User-visible goal:** Supplementary Appendices: ESCAPE (Appendix G), DAWN (Appendix S6), and DEFUSE-3 (Supplementary Appendix) defer granular control-arm medical management details (BP / glucose targets; antithrombotic / anticoagulant selection rules; concomitant drug restrictions; DVT prophylaxis allowed agents) to their published appendices. Commit c1146eb captured the main-text-level arm detail (device, agent/dose, route, window). If the owner can supply the Supplementary Appendices for these three trials, the `armDetails[]` control-arm `note` and `coInterventions` fields can be deepened to include the granular medical management protocols. Currently shipped at faithful main-article depth with the deferral explicitly noted inline in the `note` fields.
- **Non-goals:** Not changing the interpretation or statistical outcomes; data source granularity deepening only. Not committed to obtaining appendices (owner decision whether to pursue them).
- **Files likely touched:** `src/data/trialData.ts` (`armDetails[]` on ESCAPE/DAWN/DEFUSE-3 entries, optionally enriching `note` and `coInterventions` fields).
- **Acceptance checks:** If appendices are supplied: arm detail re-verified against appendix-level text; `note` fields updated to cite appendix sections; `coInterventions` granularity deepened (e.g., "BP SBP <180, DBP <105 with protocol escalation per Appendix G §2.1" vs current "standard of care per Canadian/local guidelines"). Clinical-reviewer spot-check on deepened granularity. If appendices cannot be sourced: task remains open for future owner supply or transitions to archive (no obligation).
- **Clinical impact:** low (deepening control arm detail improves protocol transparency but does not change primary-arm interpretation; appendices are supplementary, not primary).
- **Rollback plan:** n/a if no changes ship; single-commit revert if enriched detail ships.
- **Source:** Flagged in docs/evidence-packets/2026-06-08-trial-pilot-arm-enrichment.md clinical-review follow-ups, carry forward per docs/reviews/clinical-trial-arm-enrichment-pilot.md "Required follow-ups" §2.

### trial-eligibility-arms-expand-remaining-74-trials — [ ] open — forward-planning note [from trial-full-eligibility-and-arm-detail-pilot commit 4fbb914]
- **Status:** [ ] open — L5, P2 (forward planning, not in-swarm work)
- **User-visible goal:** This commit (4fbb914) piloted the `fullEligibility` + `armDetails` schema and component rendering on 5 landmark trials (DAWN, DEFUSE-3, ECASS III, ESCAPE, NINDS). The remaining ~74 NCT-linked trials in the catalog are candidates for the same treatment in future reviewed waves. Schema + components are stable and reusable. Estimate: ~2–3 weeks of editorial + clinical review to backfill the remaining trials in ranked batches (foundational/high-impact first, then secondary prevention).
- **Non-goals:** not committing to a completion date; noting only that the infrastructure is ready for scaled rollout.
- **Files:** (future) src/data/trialData.ts (populate `fullEligibility` + `armDetails` on remaining trials); docs/evidence-packets/ (create per-trial source audits as population proceeds).
- **Clinical impact:** high (eligibility + protocol transparency across the catalog).
- **Source:** Logged as forward-looking milestone post-commit 4fbb914.

### trial-enrich-optimas-timing-completion — Class C-clinical [from wave-2 trial enrichment swarm 2026-06-09]
- **Status:** [x] done (0603272) — L5, P2
- **User-visible goal:** OPTIMAS + TIMING trial records exist in the catalog (lines ~5767 and ~5653 in trialData.ts) with stats/results populated but NO curated inclusion/exclusion fields. As a result, the eligibility card on each trial's /trials/ page renders nothing (the EligibilityCriteriaCard has no data to display). Source evidence already extracted during wave-2 swarm: OPTIMAS early ≤4d vs delayed 7–14d, NI margin 2pp; TIMING early ≤4d vs delayed 5–10d, NI margin 3%. Add curated `fullEligibility` + `armDetails` fields to both records so clinicians can see the enrollment criteria and study-arm definitions.
- **Non-goals:** not changing interpretation or statistics; data entry only.
- **Files likely touched:** `src/data/trialData.ts` (OPTIMAS + TIMING `fullEligibility` + `armDetails` fields).
- **Acceptance checks:** Both trial detail pages render the EligibilityCriteriaCard with criteria tabs visible; armDetails accordion shows control-arm definitions; tsc clean; build 171/171; claims hook PASS; clinical-reviewer spot-check on curated criteria fidelity to source; Gate 6 live-verify PASS on both trial pages.
- **Clinical impact:** high (eligibility is load-bearing for resident decision-making; currently hidden).
- **Rollback plan:** git revert single commit.

### trial-enrich-sammpris-eagle — Class C-clinical [from wave-2 trial enrichment swarm 2026-06-09]
- **Status:** [x] done (0603272) — L5, P2
- **User-visible goal:** SAMMPRIS and EAGLE trial records exist in the catalog with results but no curated eligibility fields. Source PDFs were uploaded and processed during wave-2 swarm. SAMMPRIS requires careful application of the uploaded SAMMPRIS CORRECTION.pdf (Lancet correction). Add curated `fullEligibility` + `armDetails` to both so the eligibility cards render. SAMMPRIS enrollment targeted intracranial atherosclerotic disease (ICAS) patients; EAGLE targets central retinal artery occlusion (CRAO).
- **Non-goals:** not changing interpretation or statistics; curated data entry only.
- **Files likely touched:** `src/data/trialData.ts` (SAMMPRIS + EAGLE `fullEligibility` + `armDetails` fields).
- **Acceptance checks:** SAMMPRIS criteria sourced with explicit callout to the Correction.pdf; both trial detail pages render EligibilityCriteriaCard + armDetails accordion; tsc clean; build green; claims clean; clinical-reviewer spot-check; Gate 6 live-verify PASS.
- **Clinical impact:** high (SAMMPRIS is a pivotal trial on ICAS management; currently invisible).
- **Rollback plan:** git revert single commit.

### trial-triage-stroke-curated-fix — Class C-clinical [from wave-2 trial enrichment swarm 2026-06-09]
- **Status:** [x] done (0603272) — L5, P2 (pre-existing error surfaced during wave-2)
- **User-visible goal:** Pre-existing bugs in TRIAGE-STROKE trial record detected during wave-2 enrichment swarm: (1) curated `inclusionCriteria` says "RACE score 5 or higher" but the trial actually used PASS score ≥2 as eligibility criterion; (2) pre-existing prose says "planned 424" but the source states enrollment target was 600. Source-verify both against TRIAGE-STROKE NEJM publication + ClinicalTrials.gov, then correct both the `fullEligibility` field and any associated narrative/summary text.
- **Non-goals:** not changing interpretation or endpoints; factual accuracy correction only.
- **Files likely touched:** `src/data/trialData.ts` (TRIAGE-STROKE `fullEligibility` field, possibly `plannedEnrollment` or summary field if present).
- **Acceptance checks:** TRIAGE-STROKE publication + ClinicalTrials.gov audited for actual eligibility criterion (PASS vs RACE); curated text corrected to match source; enrollment target verified + corrected; tsc clean; build green; claims clean; clinical-reviewer sign-off.
- **Clinical impact:** medium (enrollment target is not load-bearing for clinical decision; inclusion criterion misstatement is a credibility issue for residents relying on NeuroWiki's curation).
- **Rollback plan:** git revert single commit.

### trial-charm-correction-check — Class C-clinical [from wave-2 trial enrichment swarm 2026-06-09]
- **Status:** [x] done (0603272) — L5, P2
- **User-visible goal:** CHARM trial already has curated `fullEligibility` fields populated. Verify that the December 2024 Lancet Neurology Correction/Errata does not alter the enrollment eligibility wording. If the correction touches eligibility, the `fullEligibility` field must be updated to reflect the corrected criteria. If eligibility is untouched, no change needed; verification only.
- **Non-goals:** checking whether the correction altered endpoints or interpretation (that's a separate clinical audit). Eligibility verification only.
- **Files likely touched:** `src/data/trialData.ts` (CHARM `fullEligibility` field, only if Correction alters it).
- **Acceptance checks:** CHARM Dec 2024 Lancet Neurology Correction retrieved + reviewed; eligibility section compared to current `fullEligibility` field; if match, no change; if divergence, field updated + clinical-reviewer sign-off; tsc clean; build green.
- **Clinical impact:** low if correction does not touch eligibility (verification confidence increase); medium if eligibility was altered (correction must reflect in curated data).
- **Rollback plan:** git revert single commit (if change ships).

### headache-clinic-stage-one-screen-build — Class D [unblocked post 6585a71 engine fix]
- **Status:** [~] in_progress — L4, P1. TWO increments LANDED. (1) Result-presentation (c885da2): ranked phenotype accordion list (`HeadacheResultList` + shared `CriteriaList`) replacing the stacked headline/differential/banner; trials density; top match open; verbatim relocation; a11y fixes. (2) Treatment on-row expander (e8805ef): per-phenotype dosing moved into a collapsed opt-in "Show management" `<details>` on every match row (new `HeadacheManagement`, keyed; 43 Row strings byte-identical); clinical gate ruled show-management-for-ALL-matches (incl. partial), collapsed-by-default, no floor; partial-match confirm-diagnosis caveat (new claim `clinic-headache-partial-match-caveat`); 8 criteria cards deleted (render once in row) with 7 hidden literal claim markers + ndph tagged in management. Architect + pre/post clinical gates all approve; a11y + mobile sign-offs applied; Gate 6 client-side PASS (caveat verified on Cluster 25% partial, Migraine 100% no caveat). REMAINING: Stage Two result-copy only — band words (Leading/Possible/Less likely), non-collapsible SNNOOP10 disclaimer, "considered and set aside" tray consuming `definitionallyExcluded`/`exclusionReason`, citation footer (Class E-clinical).
- **User-visible goal:** Wire the headache clinic pathway UI: render the rank-and-flag phenotype matches, compose Pathway primitives (header, rail, cascade, summary), integrate the near-miss affordances and the "considered and set aside" explanation tray. Engine untouched in this task; all result-screen logic and copy belongs here.
- **Non-goals:** Band-word result labels, SNNOOP10 render, indomethacin-pending affordance (those are Phase 2 follow-ups).
- **Files likely touched:** src/pages/ClinicHeadachePathway.tsx (major rewrite or new implementation), src/components/pathways/ClinicHeadacheResult.tsx (new result-screen component), possibly new affordance components for near-miss explain + exclusion reason display.
- **Acceptance checks:** All 9 core phenotypes + near-misses render correctly on the live result screen; SNNOOP10 prompt non-collapsible per spec; Pathway primitives (header, rail, cascade, summary) all adopted; mobile (375px) + desktop (1280px) responsive render; no clinical text changes from commit 6585a71 engine (engine output reused as-is); architect review + clinical-reviewer review (Stage Two / result-copy changes happen after this screens PR lands).
- **Clinical impact:** medium (same as engine; near-misses now visible to clinicians at the bedside).
- **Rollback plan:** git revert single commit (or revert to pre-6585a71 if screen work bundles with engine).
- **Source review:** Coordinate with architect on Pathway primitives + result-screen component shape. Engine output contract defined in commit 6585a71 (PhenotypeMatch shape, new definitionallyExcluded + exclusionReason fields).

### headache-clinic-indomethacin-pending-near-miss — Class E-clinical [from clinical-headache-engine-rank-and-flag-postexec.md Phase 2 deferred]
- **Status:** [ ] open — L5, P2
- **User-visible goal:** Surface paroxysmal hemicrania (ICHD-3 §3.5.2) and hemicrania continua (§3.5.4) as flagged near-misses when all criteria are met except indomethacin-response trial. Engine currently hard-hides both phenotypes via `hiddenUntilTrial: 'indo-tried-complete'` gate; they do not surface at all unless the clinician explicitly completes an indomethacin-response confirmatory trial. Resurfacing them as a distinct "missing only an indomethacin trial" near-miss prompt requires a trial-pending UI affordance that does not yet exist in the result screen. Deferred to Phase 2 per pre-execution clinical gate (condition 3) to avoid introducing new result-screen affordance before Stage-Two result-copy changes are finalized.
- **Files likely touched:** src/pages/ClinicHeadachePathway.tsx (result-screen section rendering), src/data/clinicHeadacheData.ts (conditional near-miss gate logic if any), docs/reviews/clinical-PR-headache-indo-pending-near-miss.md (Stage-Two follow-up review artifact).
- **Acceptance checks:** Paroxysmal hemicrania and hemicrania continua near-misses surface only when all criteria met and `indomethacin-response` trial is unchecked; UI affordance explains the trial requirement in plain language; clinical-reviewer §17.2 sign-off; regression tests for gate logic + UI branch; mobile + desktop render check at 375px + 1280px.
- **Clinical impact:** low (paroxysmal hemicrania and hemicrania continua are rare; patients rarely reach near-miss threshold without indomethacin trial already embedded in the workflow, but the affordance closes a diagnostic-completeness gap).
- **Rollback plan:** git revert single commit.
- **Source review:** docs/reviews/clinical-headache-engine-rank-and-flag-postexec.md (Phase 2 deferred, lines 68–72); depends on Stage-Two result-screen affordance from commit 6585a71 Phase 2 work.

### AHA/ASA 2026 AUDIT BLOCKING FOLLOW-UPS — from docs/audits/aha-2026-audit-2026-05-22.md

### stroke-code-large-core-evt-update — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done — treatment-windows-quick + large-core-evt-quick pearls updated with 4-qualifier framing
- **User-visible goal:** Surface 2026 AHA/ASA §4.7.1 large-core EVT expansion (ASPECTS 3–5 COR 1, ASPECTS 0–2 COR 2a) in the Stroke Code pathway pearls and Step 2 LVO evidence accordion so residents do not miss eligible large-core patients.
- **Files likely touched:** src/data/strokeClinicalPearls.ts (treatment-windows-quick, lvo-benefit-quick), src/pages/guide/StrokeBasicsWorkflowV2.tsx (lines 548–552 evidence accordion)
- **Acceptance checks:** Pearl text references ASPECTS 3–5 (COR 1, LOE A 6–24h) and ASPECTS 0–2 (COR 2a, LOE B-R, age <80 + 0–6h + no mass effect). Citation traces to §4.7.1 mirror entries. last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** high
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §1 row "Thrombectomy up to 24h with imaging selection"

### stroke-code-glucose-threshold-60 — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done — same-commit with §4.5 citation quoted_text refresh
- **User-visible goal:** Update hypoglycemia exclusion threshold in the IVT eligibility modal from <50 mg/dL to <60 mg/dL per AHA/ASA 2026 §4.5 row 1 (COR 1, LOE C-LD).
- **Files likely touched:** src/components/article/stroke/ThrombolysisEligibilityModal.tsx (HARD_STOP_CHIPS hypoglycemia entry, line 38)
- **Acceptance checks:** Modal chip reads "Glucose <60" with detail string referencing §4.5. Citation registered. last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** high
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §1 row "Hypoglycemia <60 mg/dL treat"

### stroke-code-antiplatelet-24h-soften — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done — text reworded; surfaces §4.8 row 1 (COR 2b uncertain) + row 2 (COR 3 Harm 90-min IV aspirin) separately per clinical-reviewer guidance
- **User-visible goal:** Replace "no antithrombotics × 24h" hard-ban language in Step 3 evidence accordion with §4.8-aligned wording (COR 2b uncertain; IV aspirin within 90 min IVT is COR 3 Harm). Prevents residents from withholding indicated antiplatelet therapy past 24h.
- **Files likely touched:** src/pages/guide/StrokeBasicsWorkflowV2.tsx (line 666 — "Labs & Treatment Orders" accordion).
- **Acceptance checks:** Text references §4.8 inSettingOfIVT rows 1 (COR 2b) and 2 (COR 3 Harm). last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** low
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §1 row 'Antiplatelet within 24h of IVT — "no antithrombotics × 24h"'

### stroke-code-minor-non-disabling-branch — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done 2026-05-23 (commit bc29987). CodeModeStep1 disabling-symptoms checklist now surfaces the DAPT alternative when no disabling deficits checked and NIHSS ≤3, citing §4.6.1 (COR 3 No Benefit for IVT) + §4.8 (COR 1 LOE A DAPT × 21d) per CHANCE/POINT/INSPIRES.
- **User-visible goal:** Add a Step 1 decision branch for non-disabling deficits within 4.5h that routes to DAPT preference per AHA/ASA 2026 §4.6.1 Rec 4 (COR 3 No Benefit for IVT) + §4.8 daptForMinorAIS Rec 1 (COR 1, LOE A). Currently the workflow defaults all 4.5h-eligible patients to IVT consideration.
- **Files likely touched:** src/components/article/stroke/CodeModeStep1.tsx, src/pages/guide/StrokeBasicsWorkflowV2.tsx (Step 1 wiring)
- **Acceptance checks:** Workflow exposes a "disabling vs non-disabling" gate. Non-disabling path surfaces DAPT recommendation with §4.8 citation. last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** high
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §1 row "DAPT (aspirin + clopidogrel × 21 days) for NIHSS ≤3 / ABCD² ≥4 minor AIS"

### ecass-3-exclusions-modernize — Class E-clinical [follow-up filed 2026-05-22]
- **Status:** [x] done — EXTENDED_WINDOW_CHIPS retired; section replaced with banner noting AHA/ASA 2026 §4.6.1 harmonization. Remaining valid exclusions (warfarin INR >1.7, DOAC <48h, >⅓ MCA) already covered by HARD_STOP_CHIPS.
- **User-visible goal:** Full review of remaining 3–4.5h "extended window" chips in IVT eligibility modal (oral anticoagulant, NIHSS >25, DM + prior stroke, >⅓ MCA on imaging) against AHA/ASA 2026 §4.6.1. None of these are explicit exclusions in 2026 — the chip list is legacy ECASS-3 framing. Likely outcome: retire EXTENDED_WINDOW_CHIPS entirely and replace with a single banner noting the 3–4.5h window has harmonized with 0–3h in 2026.
- **Files likely touched:** src/components/article/stroke/ThrombolysisEligibilityModal.tsx (EXTENDED_WINDOW_CHIPS, lines 61–66)
- **Acceptance checks:** Each remaining chip either retired or reworded as caution rather than exclusion, with sourcing to §4.6.1 or §4.6.5 (DOAC <48h). aha-asa-2026-4.6.1 citation registered. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** high (each chip currently misclassifies eligible patients)
- **Rollback plan:** git revert single commit.
- **Source row:** docs/reviews/clinical-PR-extended-ivt-ecass3-age80-modernize-2026-05-22.md (follow-up); originates from audit 2026-05-22 §2

### extended-ivt-ecass3-age80-modernize — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done — age >80 chip + label removed; remaining ECASS-3 chips moved to follow-up `ecass-3-exclusions-modernize` above
- **User-visible goal:** Remove "Age >80" as a 3–4.5h hard exclusion chip in the IVT eligibility modal per AHA/ASA 2026 §4.6.1 Rec 7 and IST-3 evidence. Age >80 is a relative factor in 2026, not an exclusion. Current text causes incorrect disqualification of eligible elderly patients.
- **Files likely touched:** src/components/article/stroke/ThrombolysisEligibilityModal.tsx (EXTENDED_WINDOW_CHIPS, line 62)
- **Acceptance checks:** Chip removed or reworded to "Age >80 — relative factor, treat eligible patients". Other ECASS-3 exclusions reviewed (oral anticoag, NIHSS >25, DM+prior stroke, >1/3 MCA) and either kept with sourcing or modernized. last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** high
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §2 row 'EXTEND_WINDOW_CHIPS: "Age >80"'

### extended-ivt-path-c-wake-up-caveat — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done — Path C eligible result now branches: wake-up onset surfaces "extrapolation from TRACE-III" caveat in details + reason chip
- **User-visible goal:** Either restrict Extended IVT Path C-LVO (TRACE-III 9–24h late TNK) to non-wake-up onset modes, or surface an extrapolation caveat for wake-up patients. TRACE-III enrolled witnessed-onset patients; wake-up applicability is an extrapolation.
- **Files likely touched:** src/pages/ExtendedIVTPathway.tsx (PathStage logic line 129, Path C result rendering line 452)
- **Acceptance checks:** UI either gates Path C on onsetMode !== 'wake-up' OR shows a "wake-up extrapolation" warning in the result card. last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** low
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §2 row "Path C wake-up extension"

### elan-cor-chip-rebuild — Class C-clinical [from audit 2026-05-22]
- **Status:** [x] done — top header now short chip "AHA/ASA 2026 §4.9 · COR 2a"; bottom block restructured as chip-header + verbatim quote (12pt body) + italic editorial caveat
- **User-visible goal:** Convert the 250-character verbatim COR-label string in the ELAN pathway result card into a short chip + accordion. Clinical substance is correct; this is a visual hierarchy fix.
- **Files likely touched:** src/pages/ElanPathway.tsx (lines 242, 472, 558)
- **Acceptance checks:** Chip label is "COR 2a, LOE B-R · §4.9". Verbatim quote moved into evidence accordion. last_reviewed refreshed. Clinical reviewer §17.2 sign-off because the quote text is verbatim guideline language.
- **Clinical impact:** low
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §3 row '"COR 2a, LOE B-R" label embedded in JSX heading slot'

### nihss-emr-include-lvo — Class C-clinical [from audit 2026-05-22]
- **Status:** [x] done 2026-05-23 (commit a2c513d). Default-off checkbox rendered in the portal-drawer footer immediately above the Copy button. When on and raceScore > 0, buildText appends "LVO probability: <label> (RACE n/9, p%)". UX placement decided autonomously per V's "go autonomously" directive (toggle is an EMR-output preference; belongs next to the EMR-output action).
- **User-visible goal:** Add opt-in to include RACE-derived LVO inference (probability, label, RACE total) in the NIHSS EMR copy text. Drawer already shows it; export currently omits.
- **Files likely touched:** src/pages/NihssCalculator.tsx (buildText lines 326–409)
- **Acceptance checks:** EMR text optionally includes "LVO probability: <Low/Moderate/High>, RACE <score>/9". Toggle defaults to off (preserves current behavior per V direction 2026-05-20 about severity bracket omission). last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** low
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §4.1 row "NIHSS EMR text omits severity bracket + LVO context"

### aspects-cor-2a-correction — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done — clinical-PR-aspects-cor-2a-correction-2026-05-22.md (approve)
- **User-visible goal:** Reword ASPECTS 0–2 interpretation from "EVT typically not indicated, exceptional Class IIa" to "EVT may reasonably be considered (COR 2a, LOE B-R) with age <80 + 0–6h + no mass effect; otherwise EVT not routinely indicated." Aligns the calculator with §4.7.1 adults row 4 (LASTE basis).
- **Files likely touched:** src/pages/AspectScoreCalculator.tsx (getScoreInfo, lines 89–94)
- **Acceptance checks:** ASPECTS 0–2 interpretation references COR 2a + age <80 + 0–6h + no mass effect. Citation traces to §4.7.1 mirror. last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** high
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §4.2 row 'Score 0–2 → "EVT typically not indicated"'

### abcd2-dapt-cross-reference — Class E-clinical [from audit 2026-05-22]
- **Status:** [x] done — moderate/high tier explanations now surface §4.8 DAPT (COR 1, LOE A); CHANCE/POINT/INSPIRES cited
- **User-visible goal:** Add §4.8 DAPT cross-reference to ABCD² moderate (4–5) and high (≥6) risk tier explanations. ABCD² ≥4 is the §4.8 daptForMinorAIS Rec 1 trigger (COR 1, LOE A); current explanation says "Consider admission" but does not surface the DAPT recommendation.
- **Files likely touched:** src/data/abcd2ScoreData.ts (ABCD2_DRAWER_EXPLANATION, lines 95–99)
- **Acceptance checks:** Moderate/high explanation includes "ABCD² ≥4 → start DAPT within 24h × 21 days (CHANCE/POINT/THALES) per AHA/ASA 2026 §4.8". Citation traces. last_reviewed refreshed. Clinical reviewer §17.2 sign-off.
- **Clinical impact:** high
- **Rollback plan:** git revert single commit.
- **Source row:** docs/audits/aha-2026-audit-2026-05-22.md §4.4 row "Moderate risk (4–5)"

### andexxa-us-market-withdrawal-currency — Class E-clinical [filed 2026-06-02]
- **Status:** [x] DONE 2026-06-02 — V approved the sweep. Bedside FXa-inhibitor ICH-reversal surfaces corrected: 7 spots across 6 files now lead with 4F-PCC 50 U/kg and note andexanet's US withdrawal (sales ended Dec 22, 2025). New claim `fxa-reversal-4fpcc-andexanet-withdrawn`; both withdrawal citations refreshed to 2026-06-02. ANNEXA-I trial entry contextualized (not deleted). Evidence packet → medical-scientist → clinical-reviewer (APPROVE, docs/reviews/clinical-PR-fxa-andexanet-withdrawal-bedside-2026-06-02.md). Question-synthesis surface was already correct from a prior session. Follow-up filed below (scanner coverage for <Paragraph> guide prose).
- **Trigger:** During W8 citation verification, FDA safety communication (`fda-andexxa-safety-2024`, URL resolves — FDA blocks the fetch bot UA but WebSearch confirms the page is live) reports the FDA judged Andexxa's (andexanet alfa) risks to outweigh benefits; AstraZeneca is voluntarily withdrawing the US BLA and ENDED US commercial sales on 2026-12-22 [sic — Dec 22, 2025]. As of today the product is not commercially available in the US.
- **User-visible goal:** Any NeuroWiki surface recommending Andexxa for factor-Xa-inhibitor reversal in ICH must reflect current US availability and the FDA risk-benefit determination, so a clinician is not directed to an unavailable/withdrawn agent at the bedside.
- **Investigation needed:** grep ICH/anticoagulation-reversal surfaces (guide pages, trialData ANNEXA-I entry, pearls) for "andexanet"/"Andexxa"; determine which recommend it and with what framing. Confirm exact US-sales-end date against the FDA page (the search summary said "December 22, 2025").
- **Files likely touched:** src/pages/guide/ (ICH / reversal pages) · src/data/trialData.ts (ANNEXA-I) · src/data/strokeClinicalPearls.ts · src/lib/citations/registry.ts (refresh `fda-andexxa-safety-2024` last_reviewed)
- **Route:** evidence-verifier → medical-scientist → clinical-reviewer (Class E-clinical, full §17.2 gate). NOT to be edited as part of any prose/punctuation batch.
- **Clinical impact:** high
- **Rollback plan:** git revert single commit.

### scanner-paragraph-surface-support — Class C [filed 2026-06-02, from clinical review]
- **Status:** [~] partial — P2. Component enablement DONE (commit e72e62a, 2026-06-05): Paragraph now accepts + renders a `data-claim` prop. Finding: the scanner needs NO extension — its `jsx` pattern already matches `data-claim` on any element; the only gap was the component rejecting the prop (tsc error). REMAINING: retro-tag the two surfaces (clinical-reviewer-gated).
- **Goal:** The guide-page `<Paragraph>` component did not accept/spread a `data-claim` attribute, so clinical prose authored inside `<Paragraph detail=…>` (e.g. the corrected FXa-reversal text in IchManagement.tsx and the pre-tPA contraindication text in IvTpa.tsx) could not carry a scannable claim tag. The text is correct and the claim is declared, but a future edit to those sentences would not trip the pre-commit claim scanner — a silent-drift risk on contraindication/reversal copy.
- **Action (remaining):** retro-tag IchManagement.tsx (FXa-reversal) + IvTpa.tsx (pre-tPA contraindication) by adding `data-claim="<claim-id>"` to the relevant Paragraph, AND add a matching `jsx` surface to each claim in claims.ts so the scanner's bidirectional Check 2 stays balanced. Route the prose→claim-ID mapping through clinical-reviewer (it is clinical contraindication/reversal copy). No scanner code change needed.
- **Clinical impact:** none now (text correct); prevents future undetected drift.

### AGENT GOVERNANCE

- [x] [P2] Implement task-class-aware clinical edit gate for guard-clinical-edit.mjs — DONE commit 63b6228 (2026-06-05).
  guard-clinical-edit.mjs now walks up from the edited file to find TASKS.md, reads the ## ACTIVE
  section, and stays silent when a Class E or -clinical task is active; warns (still exit 0) for
  clinical-surface edits otherwise. Remains advisory (never blocks).
  File: scripts/claude-hooks/guard-clinical-edit.mjs

### LAYER 2 — Stroke Pathway (do in order)
- [x] [L2] Fix stroke pathway page header — commit c379146
- [x] [L2] Fix stroke pathway layout — white context bar, correct tab sticky offset — commit b41e644
- [x] [L2] Step2 visual rebuild — CT result as clean radio cards, treatment decision cards, cobalt Save button — commit 27cf421
- [x] [L2] Fix "Stamp CT Time" button focus ring box in CodeModeStep2.tsx — commit 0bfea9a
- [x] [L2] Fix emergency strip text wrapping — whitespace-nowrap + text-center, "tPA/TNK reversal"→"tPA reversal" — commit 0bfea9a
- [x] [L2] Improve disabled CTA visual state — opacity-40→50, italic span on disabled text — commit 0bfea9a
- [x] [L2] Step3 visual rebuild — summary display, locked EMR template (Part B) — commit ad51b4d
- [x] [L2] Step4 visual polish — design system tokens, cobalt buttons, evidence badges — commit 684bf89
- [x] [L2] All stroke modals visual overhaul — use white header, clean body, cobalt primary action — commits baecb1c, 10b6063, fdec23f, 341d9a4

### LAYER 3 — Component Library (SKIPPED BY AGREEMENT)
Deferred in favor of section specs (docs/specs/*.md). Each section (calculators, pathways, trials, articles) gets its own locked master spec + HTML mockup. Component library can be revisited after section specs are mature.

### LAYER 4 — Pages (unblocked; Calculator redesign is active)
- [ ] [L4] Home.tsx visual rebuild
- [ ] [L4] TrialsPage + TrialPageNew visual rebuild
- [ ] [L4] EmBillingCalculator UX rebuild — guided decision flow
- [x] [L4] Calculators.tsx rebuild — Prompt 5d (see CONFIRMED CLEAN 2026-05-04)
- [x] [L4] ResidentToolkit.tsx — DELETED 2026-06-05 (dead code: superseded by Guide.tsx as the /guide route, unreferenced + not in the router or route manifest; confirmed by the design audit and V decision to delete rather than rebuild).
- [x] [L4] StatusEpilepticusPathway visual rebuild — commits 52c8371 (v3) + bfa5c6d (content)
- [x] [L4] MigrainePathway visual rebuild — commits 03b55ab (v3) + 77ce4e8 (content + cocktail primitive)
- [ ] [L4] ExtendedIVTPathway visual rebuild
- [ ] [L4] All guide/* pages consistent layout

### WAVE 6 — Trial Page Redesign

#### W6.1 — TRIALS_SPEC.md v1.0 + ADR-005 authoring — Class C
- **Status:** done — 2026-04-21
- **User-visible goal:** none (spec + ADR + mockup; foundational ground truth for Prompt 3 rebuild)
- **Non-goals:** no code changes, no clinical content changes, no trial UI work
- **Files touched:** docs/specs/TRIALS_SPEC.md (created, ~1,100 lines) · docs/specs/mockups/trial-reference.html (created, 5 stages) · docs/adrs/ADR-005-trials-spec-v1.md (created)
- **Acceptance checks:** spec covers §0–§20 · mockup covers 5 interaction stages · ADR documents 5 decisions · no code modified · tsc unaffected
- **Clinical impact:** none
- **Rollback plan:** n/a

#### W6.2 — Prerequisite: glossary additions — Class B
- **Status:** done — 2026-04-21
- **User-visible goal:** ARR, RRR, NNH, and standalone RR terms resolve in the bedside glossary tooltip layer
- **Non-goals:** no new tooltip UI patterns; no clinical claim changes; no registry entries required (definitions, not claims)
- **Files touched:** src/data/medicalGlossary.ts (8 new entries: absolute-risk-reduction, arr, relative-risk-reduction, rrr, number-needed-to-harm, nnh, risk-ratio, rr)
- **Acceptance checks:** 4 new terms (8 keys with aliases) added · tsc clean · existing terms unchanged · no claim IDs needed ✓
- **Clinical impact:** low — definitional, not interpretive
- **Rollback plan:** n/a

#### W6.3 — Prerequisite: TrialMetadata schema extensions — Class C
- **Status:** done — 2026-04-21
- **User-visible goal:** none (schema + EXTEND data; enables Prompt 3 teaching surfaces and eligibility sections)
- **Non-goals:** no UI changes
- **Files touched:** src/data/trialData.ts (6 new optional fields: inclusionCriteria, exclusionCriteria, howToReadChart, howToInterpret, bedsidePearl, bottomLineSummary; EXTEND entry fully populated with PDF-sourced values)
- **Acceptance checks:** 6 new optional fields in TrialMetadata · tsc clean · existing trial objects compile · EXTEND safetyProfile uses PDF Table 2 values (mortality 11.5%/8.9%, sICH 6.2%/0.9%) ✓
- **Clinical impact:** none (schema + data layer; presentation change only)
- **Rollback plan:** n/a

#### W6.1b — Design-guardian co-sign patches (4 conditions) — Class B
- **Status:** done — 2026-04-21 (all 4 conditions patched; follow-up APPROVE co-sign pending)
- **User-visible goal:** none (spec + mockup documentation fixes)
- **Conditions to resolve (from design-guardian APPROVE-WITH-CONDITIONS verdict, 2026-04-21):**
  - C1: TRIALS_SPEC.md §18.3 lines 1055-1056: replace `—` with `:` in two TypeScript code comments (em dashes in code block)
  - C2: TRIALS_SPEC.md §10.3: add prose exception for desktop 2-col drawer citation border-top omission
  - C3: trial-reference.html Stage 1 drawer: add HTML comment annotating State C discovery-chevron behavior
  - C4: V decides Option A (add Stage 6 mobile-only frame for sections 3-8) or Option B (add spec prose for §11.2, §12.2, §13.1 mobile layout contracts)
- **Files:** docs/specs/TRIALS_SPEC.md · docs/specs/mockups/trial-reference.html
- **Acceptance:** all 4 conditions resolved · design-guardian follow-up APPROVE issued · spec status changes to "locked 2026-04-21"
- **Clinical impact:** none
- **Rollback plan:** n/a

#### W6.4b — 10-trial Archetype A rebuild — Class C
- **Status:** done — 2026-04-22
- **User-visible goal:** 10 trial detail pages (WAKE-UP, ESCAPE-MeVO, ELAN, CHANCE, POINT, SOCRATES, SPS3, SPARCL, THALES, EAGLE) rebuilt to TRIALS_SPEC v1.0 Archetype A pattern matching EXTEND canary
- **Non-goals:** Archetype B/G not implemented; full citation registry not required (stub claimId comments per ADR-005 Option C)
- **Files touched:**
  - src/data/trialData.ts (10 existing entries extended with new fields; SafetyProfile interface extended; q/a keys fixed to question/answer)
  - src/pages/trials/TrialPageNew.tsx (10 new id-gated branches + 3 shared render helpers)
  - docs/link-graph.json (10 new trial nodes)
  - tasks.md (W6.5 + W6.6 parked)
- **Acceptance checks:** tsc clean ✓ · build green ✓ · all 10 branches render Archetype A layout · EAGLE shows amber primary-endpoint note + secondary header · SPS3 surfaces DSMB harm signal · THALES trialResult corrected NEGATIVE→POSITIVE · specialDesign removed from THALES ✓
- **Clinical impact:** low — presentation and teaching content; no algorithm logic changes
- **Rollback plan:** git revert; all 10 branches removed, data fields are additive (legacy pages unaffected)

#### W6.4c — 13-trial IVT + Prehospital Archetype A rebuild — Class C
- **Status:** done — 2026-04-22
- **User-visible goal:** 13 trial detail pages (BEST-MSU, AcT, ARAMIS, NOR-TEST, NOR-TEST 2 Part A, PRISMS, PROST, PROST-2, RAISE, TASTE, THAWS, TRACE-2, TRACE-III) rebuilt to TRIALS_SPEC v1.0 Archetype A pattern
- **Non-goals:** Archetype B/G not implemented; W6.5-W6.8 parked
- **Files touched:**
  - src/data/trialData.ts (13 entries extended; HARM added to trialResult union; duplicate listCategory removed from TRACE-III)
  - src/pages/trials/TrialPageNew.tsx (13 new id-gated branches)
  - src/components/trials/BottomLineDrawer.tsx (HARM added to trialResult prop type, resultLabel map, RESULT_BADGE)
  - docs/link-graph.json (13 new trial nodes)
  - TASKS.md (this entry; W6.5/W6.6/W6.7/W6.8 parking entries below)
- **Acceptance checks:** tsc clean ✓ · build green ✓ · NOR-TEST 2 HARM framing with red box + control winnerArm ✓ · BEST-MSU amber quasi-experimental disclaimer ✓ · TRACE-III late-window lede prominent ✓ · PRISMS control arm (aspirin) cobalt accent ✓ · NI trials use non-inferiority language in howToInterpret ✓
- **Clinical impact:** low — presentation and teaching content; no algorithm logic
- **Rollback plan:** git revert; all 13 branches removed; data fields are additive (legacy pages unaffected)

#### W6.5 — Archetype B (Grotta Bar) + 8-trial rebuild — Class C
- **Status:** parked — 2026-04-22
- **Blocking:** Grotta Bar mRS shift component not yet implemented. Trials: INTERACT4, MR ASAP, RACECAT, RIGHT-2, TRIAGE-STROKE, ATTEST-2, TIMELESS, TWIST.
- **Rollback:** n/a (not started)

#### W6.6 — Observational B_PROUD rebuild — Class C
- **Status:** parked — 2026-04-22
- **Blocking:** Archetype for single-arm/observational display not yet implemented.
- **Rollback:** n/a (not started)

#### W6.7 — Design-quality disclaimer pattern in TRIALS_SPEC — Class C — DONE commit aa54b84
- **Status:** merged 2026-05-13
- **What shipped:** §1.6 Design-Quality Disclaimers section added to TRIALS_SPEC.md. Codifies the standardized amber callout for trials with weakened design (quasi-experimental, single-arm vs historical, high crossover, stopped early/futility). BEST-MSU is the reference. Includes wording table, tokens, ownership matrix, data shape (designDisclaimer field).
- **Rollback:** n/a (docs only)

#### W6.8 — Surgical decompression category + DESTINY rebuild — Class C
- **Status:** parked — 2026-04-22
- **Context:** DESTINY (N=32, surgical decompression) is wrong category for IVT batch. Needs its own category page and archetype before rebuild.
- **Rollback:** n/a (not started)

#### W6.5-6.6 — DISTAL (Archetype B) + WEAVE (Archetype G) rebuilds — Class C
- **Status:** parked — 2026-04-22
- **Blocking:** Archetype B (Grotta Bar mRS shift component) and Archetype G (single-arm registry display) not yet implemented. Cannot build pages without components.
- **Rollback:** n/a (not started)

### WAVE 8 BATCH 3 — Trial Data Population & Architecture Consolidation

#### Batch 3 Wave 1 — schema extensions (SHIPPED 657f004)
- **Status:** [x] merged — 2026-05-08
- **Shipped:** primaryDesign/primaryResult unions, harmSignal field, JSDoc/pairing table

#### Batch 3 Wave 2 — data population (13 secondary-prevention trials) — Class D-clinical
- **Status:** [x] merged — commit 6bed2d6 (2026-05-08)
- **User-visible goal:** 13 secondary-prevention trials populated with primaryDesign/primaryResult/harmSignal/applicability schema fields
- **Files touched:** src/data/trialData.ts (108 lines inserted)
- **Acceptance checks:** tsc clean ✓ · build green ✓ · clinical-reviewer approve-with-conditions (all 4 mandatory conditions applied in implementation) ✓
  - C1 SPARCL harmSignal: 1.9% (not 2.2%) ✓
  - C2 THALES harmSignal: P<0.001 (not p=0.001) ✓
  - C3 SPS3 inline comment: not-met vs harm-stopped rationale documented ✓
  - C4 INSPIRES + CHANCE-2 applicability: "21-day DAPT then monotherapy" explicit ✓
- **Clinical impact:** high (13 trial entries received clinical content classification + data migration)
- **Advisory follow-ups (tracked in PARKING LOT):**
  - `harmSignal` claim tagging: 6 strings ship untagged (blocked:awaiting-registry-population when W5.2 lands)
  - OPTIMAS 2pp + INSPIRES HR citation trail: when W5.2 lands, add quoted_text to PMID 39491870 + 38157499

### WAVE 6.5 (continued)

#### W6.5.1 — GrottaBarChart component implementation — Class C
- **Status:** planned — 2026-04-24
- **User-visible goal:** Trials with ordinal mRS shift outcomes (Archetype B) render the Grotta Bar stacked visualization matching TRIALS_SPEC v1.1 §3 and trial-reference.html Stage 7 (INTERACT4 canary)
- **Non-goals:** no Archetype G work; no B_PROUD rebuild; no citation registry entries required (stub claimId per ADR-005 Option C)
- **Files likely touched:** src/components/trials/GrottaBarChart.tsx (new) · src/data/trialData.ts (mrsDistribution, ordinalStats, subgroupAnalyses fields on INTERACT4 entry) · src/pages/trials/TrialPageNew.tsx (Archetype B branch for INTERACT4) · src/types/trial.ts (new optional fields)
- **Acceptance checks:** tsc clean · build green · INTERACT4 renders Grotta Bar primary + collapsed subgroup well · mRS 1+2 dark text (#0f172a) · amber caveat present · BottomLineDrawer trialResult=NEUTRAL · no em dashes in rendered content
- **Clinical impact:** low — presentation; no algorithm changes
- **Rollback plan:** git revert; INTERACT4 falls back to prior page or Archetype A stub; new component is additive

#### W6.6.1 — BenchmarkThresholdChart + BottomLineDrawer extension — Class C
- **Status:** [x] merged — commit a25a6fd (2026-04-24)
- **User-visible goal:** Single-arm benchmark trials (Archetype G) render the track-and-threshold visualization with promoted historical context matching TRIALS_SPEC v1.1 §7a and trial-reference.html Stage 8 (WEAVE canary)
- **Non-goals:** no Grotta Bar work; no B_PROUD rebuild; no citation registry entries required
- **Files likely touched:** src/components/trials/BenchmarkThresholdChart.tsx (new) · src/components/trials/BottomLineDrawer.tsx (SAFETY_MET / SAFETY_FAILED / INCONCLUSIVE badge variants) · src/data/trialData.ts (benchmark, observedEventRate, historicalContext fields on WEAVE entry) · src/pages/trials/TrialPageNew.tsx (Archetype G branch for WEAVE) · src/types/trial.ts (Archetype G optional fields + trialResult union extension)
- **Acceptance checks:** tsc clean · build green · WEAVE renders track + CI band + dashed threshold + historical table (5 rows, amber caveat first, WEAVE row cobalt-50 highlight) · drawer badge SAFETY_MET renders correctly · no em dashes in rendered content
- **Clinical impact:** low — presentation; no algorithm changes
- **Rollback plan:** git revert; WEAVE falls back to prior page; BottomLineDrawer badge extension is additive (existing POSITIVE/NEGATIVE/NEUTRAL/HARM cases unaffected)

#### W6.5.4 — Codify Archetype B prose-narrative variant in TRIALS_SPEC — Class C — DONE commit aa54b84
- **Status:** merged 2026-05-13
- **What shipped:** §3.7 Prose-Narrative Variant (Archetype B fallback) added to TRIALS_SPEC.md. Documents the substitution rule when per-segment mRS percentages are not text-extractable from the publication figure (raster image, no supplementary table). RIGHT-2 is the reference. Specifies trigger conditions, visual anatomy, required elements (prose paragraph, stat row, chart-absent note), accessibility, and ownership matrix.
- **Acceptance checks:** spec section added · build green
- **Clinical impact:** none
- **Rollback plan:** n/a

#### W6.6.2 — B_PROUD rebuild approach decision — Class A
- **Status:** planned — 2026-04-24
- **User-visible goal:** n/a (decision artifact only)
- **Non-goals:** no code; no component build; no clinical content changes
- **Context:** B_PROUD is a prospective observational cohort study of the Wingspan stent. Archetype G does not apply (no pre-specified benchmark; ADR-006 Decision 5). Options: (a) custom Archetype H for prospective-cohort studies if multiple similar trials exist in the corpus; (b) simplified descriptive layout (no visualization) until a pattern is warranted; (c) permanent park if the trial has insufficient clinical relevance for the target audience. V decides.
- **Files likely touched:** docs/adrs/ADR-007-archetype-h-or-b-proud-decision.md (new, if decision is (a)); TASKS.md (this entry updated to reflect decision)
- **Acceptance checks:** decision recorded in ADR or TASKS note · B_PROUD rebuild path clear
- **Clinical impact:** none (decision only)
- **Rollback plan:** n/a

#### W6.4 — TrialPageNew.tsx rebuild (Prompt 3) — Class C
- **Status:** done — 2026-04-21
- **User-visible goal:** EXTEND trial page renders per TRIALS_SPEC.md v1.0 and trial-reference.html mockup; sticky header, dot grid, delta band, teaching well, interpret well, 4-state bottom-line drawer
- **Non-goals:** archetypes B–F not implemented; other trials not migrated; full citation registry not required (stub-ready per ADR-005 Decision 1)
- **Files touched:**
  - src/components/trials/archetypes/DeltaBandChart.tsx (CREATED — 20-col dot grid, delta band, stat row)
  - src/components/trials/TeachingWell.tsx (CREATED — Q&A and Interpret accordion modes)
  - src/components/trials/BottomLineDrawer.tsx (CREATED — 4-state portal drawer)
  - src/pages/trials/TrialPageNew.tsx (EDITED — EXTEND branch, JSON-LD useEffect, 3 new imports)
  - docs/link-graph.json (EDITED — trial/extend-trial node + pathway/late-window-ivt stub)
- **Acceptance checks:** tsc clean ✓ · check:claims passed ✓ · build green ✓ (508kB pre-existing chunk warning, was 486kB before) · EXTEND branch returns 11-section layout · DISTAL hardcoded blocks at lines 633-690 untouched ✓ · no em dashes in output ✓ · dark sidebar absent from EXTEND branch ✓
- **Clinical impact:** low — presentation change only; clinical text byte-for-byte preserved from trialData.ts
- **Rollback plan:** git revert merge commit; trial pages return to current layout instantly
- **Technical debt:** EXTEND safetyProfile stub entries require W5.2 upgrade to full registry (ADR-005 Decision 1)

### LAYER 5 — Polish (blocked until Layer 4 complete)

### L5.6 — CalculatorShell extraction — Class D — DONE (Phase 1: 3f1bdc5 · Phase 2: 4b61105 · Phase 3: 5572551)
- **Status:** merged 2026-05-13
- **What shipped:** All 3 phases landed. Approximately 811 line net reduction across 9 page files; +593 lines shared shell. New: Chevron, BackArrow, CalculatorDrawer (with State A/B/C + portal + drawer-chevron-hint/drawer-discovery-chevron animation), CalculatorToast, CalculatorHeader (with C3 a11y + secondaryRow slot for NIHSS), CalculatorFooter, useDrawerState hook (discriminated-union input), severityTokens module. ADR-008 documents the 3 trade-offs. One known visual delta: NIHSS collapsed stat color now neutral (aligns with other 8 calcs).
- **Migrated:** All 9 spec-v1.1 calculators: Abcd2, Aspect, Boston, GCS, HAS-BLED, Heidelberg, ICH, NIHSS, RoPE.
- **Clinical impact:** none
- **Origin:** filed as mandatory follow-up from arch-l55c-aspects-boston-rebuild.md (architect: claude-opus-4-7, 2026-05-13)

### L5.6.1 — Migrate Cha2ds2VascCalculator onto CalculatorShell — Class C — DONE commit 4ff84c2
- **Status:** merged — 2026-05-15 (entry updated via librarian backlog reconciliation 2026-05-16)
- **What shipped:** Cha2ds2VascCalculator migrated onto the L5.6 shell. Imports `CalculatorHeader`, `CalculatorDrawer`, `CalculatorToast`, `CalculatorFooter`, and `useDrawerState({ mode: 'binary', hasInteracted })`. Uses `CHADS_SEVERITY_TOKENS` mapping for drawer tokens. Zero remaining `createPortal`, zero inline setToast pattern, zero portal-wrapper classes — confirmed by grep 2026-05-16. Drawer state machine wired (binary mode — any interaction triggers State C). Validates the L5.6 shell is general enough for a 10th calculator.
- **Companion change in same commit:** ASPECTS dead-field cleanup
- **Clinical impact:** none
- **Origin:** L5.6 architect review condition C6 (closed)

- [x] [L5] Typography audit — commit 88750a1 (2026-05-13), docs/L5-typography-audit.md (5H / 6M / 7L)
- [x] [L5] Spacing consistency audit — commit 67dca9c (2026-05-13), docs/L5-spacing-audit.md
- [ ] [L5] Full mobile + desktop QA pass all pages
- [x] [L5] Performance audit — bundle slice shipped commit 138d278 (2026-05-13) at docs/L5-bundle-audit.md. 3.0 MB total / ~550 KB gzip; ~50 KB over the 500 KB target. Specific splits proposed for trialData, TrialVisualizations, TrialPageNew chunks.
- [x] [L5] Accessibility audit — commit f8b8ac8 (2026-05-13) at docs/L5-accessibility-audit.md. WCAG 2.1 AA findings: 7H/2M/3L. Strengths: L5.6 shell solid (aria-live, aria-atomic, scoreAriaLabel, focus management). Findings parked for V triage (modal focus traps, LKWTimePicker keyboard access, pathway aria-live regions).

### OTHER P1 (not layer-blocked)
- [x] [P1] Split TrialPageNew chunk (485kb) — lazy-load trial data — DONE 2026-06-03. Re-audit found the literal ask already satisfied: the trial DETAIL page (TrialPageNew) loads trialData via dynamic import (loadTrialPayload), so trialData (928 kB / 226 kB gzip) is its own on-demand chunk, not bundled into the page. The real remaining waste was elsewhere: the /trials hub (TrialsPage) and /trials/q/* question pages (QuestionDetailPage) STATICALLY imported the full 928 kB trialData chunk only to read each trial's short `legend` chip + ~8 small catalog fields — eager-loading the largest asset on the site for those two high-traffic routes. Fix (Class D-clinical, architect approve-with-conditions docs/reviews/arch-PR-trial-card-meta-split.md, clinical-reviewer approve docs/reviews/clinical-PR-trial-card-meta-split.md): a build-time generator (scripts/gen-trial-card-meta.ts, run in prebuild) projects a whitelist of fields (legend, title, subtitle, source, timeline, listCategory, listDescription, bottomLineSummary, doi) from trialData.ts into a GENERATED file src/data/trialListData.cardmeta.generated.ts (108 entries, 121 kB); trialListData.ts attaches legend onto `trials` and exposes getTrialCardMeta() for stub synthesis; both pages drop the trialData import. trialData.ts itself unedited. Drift guard scripts/check-card-meta.ts (pre-commit, line 6) regenerates in-memory and fails on any byte diff — makes stale clinical legend text unshippable. Build verify: TrialsPage + QuestionDetailPage chunks confirmed to NO LONGER import the trialData chunk (node import-graph check); entry chunk references trialData only via dynamic import (deferred). tsc clean · check:claims/chains/routes/card-meta PASS · build 170/170 prerendered, 0 failed · /trials hub renders legend chips · /trials/q/basilar-evt renders "Synthesises 4 trials" including stub trials BEST + BASICS. Net effect: /trials and /trials/q/* no longer download the 928 kB (226 kB gzip) trial library on navigation. Follow-up (separate, not this task): the TrialPageNew component chunk is itself ~538 kB — code-splitting that is the larger Phase 6C-adjacent work, deferred.
- [x] [P1] Turnstile removal — DONE 2026-06-03 (Class D, security surface). Root finding: the feedback form was BROKEN in production — Turnstile gated the submit button on a token, but the deleted Cloudflare account could no longer mint one, so the button was permanently disabled ("Verifying…") and no clinician could submit feedback. Removed Turnstile from both src/components/FeedbackModal.tsx (widget, global type, script injector, loader effect, token state/guard, token-gated button) and api/feedback.ts (turnstileToken field, TurnstileResponse, TURNSTILE_SECRET_KEY config-guard, siteverify call). Replaced with V-chosen lightweight guard: (1) honeypot hidden field `company` — non-empty → server silent-200 no email; (2) same-origin allowlist (neurowiki.ai/www/localhost) resolved from Origin→Referer, fail-closed 403. Same-pass security hardening per security review MUST-1/2/3: HTML-escape every interpolated field in the feedback email + validate optional reply-email (reject CR/LF, basic shape, ≤254) — closes a pre-existing email-injection sink Turnstile had masked. Guards are pure/exported, unit-tested (src/__tests__/feedbackGuards.test.ts, 17 cases). Artifacts: ADR-2026-06-03-feedback-turnstile-removal.md, arch-PR-turnstile-removal.md (approve-with-conditions, all addressed), security-PR-turnstile-removal.md (approve-with-conditions, all MUSTs addressed). Gates: tsc clean · 133/133 tests · build 170/170 prerendered 0 failed. CORS divergence (feedback uses Origin allowlist; npi/seo-weekly stay `*`) is deliberate — documented in ADR so it isn't "consistency-fixed" back.
- [ ] [P1] Part B EMR template — replace three separate EMR generators with one locked template
- [x] [P1] Full connectivity audit — DONE 2026-06-03 (audit only, no code changed). Static trace of all 28 stroke-pathway files (code-mode Step 1–4 + orchestrator, 13 modals/drawers/cards, ExtendedIVT/EVT/ELAN pathway pages + shared inputs) via 3 parallel reviewers over disjoint file sets; broken findings re-verified by hand. Deliverable: docs/QA_CHECKLIST.md (surface map, findings, full manual QA checklist by area). Verdict: Step 1→4 happy path + all 3 pathway pages wired correctly end to end. Found **3 BROKEN dead controls** — (B-1) "Mark ICH protocol complete" button on the bleed branch is wired to a no-op onComplete (StrokeIchProtocolStep.tsx:67 ← orchestrator :689); (B-2) "Print Emergency Protocol" button has no onClick (HemorrhageProtocol.tsx:65); (B-3) "Print Order Set" button has no onClick (PostTPAOrders.tsx:117). Plus 6 SUSPECT (2 pathway modals no backdrop-close; residual material-icons glyphs may render as literal text; 2 UX calls; vestigial eligibility state) and 3 orphaned-data items. Fixes deliberately NOT done (audit-only scope) — parked below for triage.
- [x] [P1] SEO agent setup — 2026-05-13 overnight (commits 78d4588 / b62870b / 138d278 / 6388bd4 / b973458). 5-phase SEO program shipped: site audit (docs/seo-audit-2026-05-13.md), keyword research (docs/seo-keyword-research.md, training-data positions; GSC-authoritative pass deferred to morning), game plan (docs/seo-game-plan-2026.md, 30/60/90 day roadmap), governance update (CLAUDE.md §11/§16/§19 + seo-specialist.md + pm-agent.md per architect C1-C8), skill bundle (.claude/skills/seo-audit-execution/SKILL.md). Immediate wins shipped: 6 wrong sitemap pathway URLs corrected, 2 missing sitemap entries added (chads-vasc, aha-2026-guideline), 1 duplicate title differentiated. seo-specialist now co-fires with content-writer on public-indexable surfaces only (narrowed scope per architect C2).
- [x] [P1] Design consistency audit — DONE 2026-06-05 (report at docs/AUDIT.md). 35 surfaces audited via 5 parallel ui-architect passes vs the per-surface specs. Key findings: the ArticleLayout shared-component fix (blue-* + H1 typography + back-arrow) cleans ~14 guide pages at once (highest leverage); severity borderColor hex is a systemic Class-D token-contract item; high-gap rebuilds are ResidentToolkit (route ownership OPEN), StrokeBasicsWorkflowV2, PostStrokeLipidManagement, ASCVD, EmBilling. Audit only, no code changed. Original scope: read every calculator and pathway page, compare against design tokens; pages covered: all src/pages/guide/*, all calculator pages, TrialsPage, Home.
- [x] [P1] AUDIT S1 — ArticleLayout shared presentational fix — DONE 2026-06-29 (Class C, presentational). Replaced forbidden blue-* with neuro-*/slate tokens (related links text-neuro-600/700; Paragraph [+] text-neuro-500; Term text-neuro-700/border-neuro-200), eyebrow to text-[10px] uppercase tracking-widest text-slate-400, H1 to design-system text-[22px] md:text-[28px] font-medium tracking-[-0.01em], and the back arrow to the canonical M19 12H5 path, across src/components/article/{ArticleLayout,Paragraph,Term}.tsx — propagates to ~14 guide pages via the shared layout. No clinical text/claims/scoring touched → no clinical-reviewer gate (AUDIT §6). Verified: tsc clean, check:claims + check:humanizer green, build 171/171; prerendered HTML across 6 sampled guide pages (iv-tpa, acute-stroke-mgmt, thrombectomy, ich-management, meningitis, gbs) shows new H1/arrow present and old blue-*/text-3xl/old-arrow absent. NOTE: in-session live preview serves the worktree checkout, not the main-repo edits, so verification was via build output rather than a dev-server screenshot.
- [x] [P1] AUDIT S3 + S5 point-fixes — DONE 2026-06-29 (Class C, presentational). S3: removed shadow-sm from all active toggle segments (MrsCalculator context + mode toggles = 4; NihssCalculator Rapid/Detailed = 2) per CALCULATOR_SPEC §3.1 flat-white active segment. S5 point-fixes: Thrombectomy.tsx LVO link text-indigo-600 → text-neuro-600; NihssCalculator LVO "Low" label text-green-600 → text-emerald-600; RopeScoreCalculator moderate chevron text-amber-600 → text-amber-700 (matches its already-amber-700 label/stat). No clinical text/scoring touched → no clinical-reviewer gate. Verified: tsc clean, check:claims green, build 171/171; rendered HTML shows the toggle shadow combo gone on nihss+mrs and the neuro link on thrombectomy; emerald-600/amber-700/neuro-600 utilities confirmed in built CSS (the LVO-label and chevron colors render conditionally). Deferred from S5: MrsCalculator grade-2 sky-* (design decision), StrokeBasicsWorkflowV2 gradients (high-gap rebuild); ResidentToolkit deleted.
- [x] [P1] AUDIT P1 #5 — TrialsPage token cleanup (Bucket A) — DONE 2026-06-29 (Class C, presentational). Cobalt hardcoded values → neuro tokens: search focus border #1746A2 → neuro-500 and focus ring rgba → ring-neuro-500/8; active filter pills → bg-neuro-500/8 + border-neuro-500/20 + text-neuro-500; clear-filters #1746A2/#0E2D6B → neuro-500/neuro-700. Plus rounded-lg → rounded-xl (2 spots) and removed the dead empty md: class fragments at line 523. DECISION (V, 2026-06-29): the /trials default tab stays "Questions" (deliberate deviation from HUB_SPEC §1.3 Catalog-default; do not auto-fix back). DEFERRED: CAT_COLOR category hexes (need cat-* token set); Home pill active-state cobalt→slate-50 (AUDIT P1 #4, awaiting V sign-off). Solids are exact token equals (#1746A2=neuro-500, #0E2D6B=neuro-700); the cobalt tints now use the neuro token at the same opacity (color-mix), visually identical. Verified: tsc clean, check:claims + check:humanizer green, build 171/171; CSS confirms the bg/border/ring neuro-500 opacity utilities generated; static search input carries the ring token; category pills render client-side (async trial data) so their tint is verified via generated CSS. Remaining #1746A2 in built HTML is the brand theme-color meta.
- [x] [P1] AUDIT P1 #4 — Home selected-pill decision — RESOLVED 2026-06-29 (no code change). V chose to KEEP the solid cobalt active fill (bg-neuro-500, white text) over the spec's slate-50, for at-a-glance wayfinding. Deliberate deviation from HOME_SPEC §1.3.1 / HUB_SPEC §1.4; recorded as an implementation note in HOME_SPEC.md and docs/AUDIT.md. The unspecced SavedCasesTile / FavoritesPreview / FeaturedRail are intentional V features, KEPT. Follow-up (design-guardian): reconcile the shared pill contract (hubs adopt cobalt vs Home documented as an exception).
- [x] [P1] AUDIT S6 — discrete FAQ width consistency — DONE 2026-06-29 (Class C, presentational). The bottom-of-page DiscreteFAQ on Gbs/Meningitis/HeadacheWorkup/MultipleSclerosis sat at max-w-3xl (wider than the article's max-w-2xl) and IvTpa rendered it bare/full-width. Aligned all five to the article container (max-w-2xl mx-auto px-5 md:px-8). No clinical text touched → no clinical-reviewer gate. FAQ data + JSON-LD FAQPage schema unchanged. Deferred: the "ArticleLayout owns a FAQ slot" refactor (architectural; minimal width-match used instead). Verified: tsc clean, build 171/171.
- [x] [P1] AUDIT §4.3 — PostStrokeLipidManagement step indicator — DONE 2026-06-29 (Class C, presentational). Replaced the abolished horizontal numbered dot-strip (PATHWAY_SPEC §3.9) with a vertical progress indicator: filled cobalt node = done, cobalt ring = current, slate hollow = upcoming, no checkmarks. Wizard interaction unchanged (one step at a time); full Pattern A stacked-rail conversion deliberately out of scope. Design V-approved via mockup. No clinical content/logic touched → no clinical-reviewer gate; data-claim attrs intact. Verified: tsc clean, check:claims green, build 171/171, ml-[7px] connector-centering utility generated in CSS. Still open on this page (deferred): inline boxShadow, max-w-xl→2xl, rounded-xl option buttons→rounded-full, eyebrow font-semibold→font-bold.
- [ ] [P1] Trials page visual redesign — implement Screen 5 from docs/MOCKUPS.md. Trial card format: name, one-sentence finding, key stat (NNT or ARR), p-value, guideline implication. Readable in 10 seconds. Category filter pills. Left border color by category.
- [ ] [P1] Trial interpretation agent — AI-powered layer that explains what each trial means clinically for a practicing neurologist. Requires component library (Layer 3) before implementation. Use Anthropic API in artifact pattern.

---

## W7.0 — Predecessor Trial Stubs

> Planning doc: docs/specs/predecessor-map.md (produced 2026-04-27)
> Gate: W6.9 (wiring historical context into landmark trials) is **blocked** until the relevant stubs below exist.
> Design note: HistoricalContextSection.tsx (TRIALS_SPEC §7a.4) is Archetype G only. A new RCT predecessor display pattern must be designed before any wiring begins — W6.9 tracks that design task.

### W6.9 — Wire historical context into landmark trials — Class C-clinical [DONE]
- **Status:** [x] done (2026-06-06) — all five RCT predecessor chains wired and clinical-reviewed. EVT 2015 shipped first (commit 4188237, 2026-06-05). The remaining four shipped as data-only authoring (RCTChainSection render is generic in TrialPageNew for any entry with an rctChain): Basilar EVT (anchor ATTENTION from BEST + BASICS), Acute DAPT (anchor CHANCE from MATCH + CHARISMA), ICH surgery (anchor ENRICH from STICH I/II + MISTIE III), Hemicraniectomy (anchor DESTINY II from DECIMAL/DESTINY/HAMLET). Batch-2 authored by medical-scientist, clinical-reviewer decision approve-with-conditions with both conditions resolved (charisma "frank harm" downgraded to a non-significant harm signal; CHANCE-vs-POINT successor comment reconciled) — artifact docs/reviews/clinical-rct-chains-batch2.md. Gates: tsc clean, check:chains (5 chains, 19 memberships) + check:claims + check:humanizer green, build 171/171 prerendered. OPEN FOLLOW-UP (non-blocking, separate C-clinical task, per docs/reviews/clinical-rct-chain-evt-2015.md): normalize the ims-iii-trial stub 95% CI lower bound to 0.83 across listDescription + pearls (currently 0.85; published value 0.83; chain cards already correct).
- **User-visible goal:** Major trial pages show the "what changed" predecessor chain: failed trials in context, with a brief vertical timeline and teaching blurb
- **Non-goals:** Archetype G / WEAVE historicalContext is already wired — this is for RCT chains only
- **Pattern:** RCTChainSection.tsx (src/components/trials/RCTChainSection.tsx) — spec at TRIALS_SPEC §7b (v1.2, 2026-04-27)
- **Dev route:** /dev/rct-chain-test — verify rendering with ESCAPE chain mockup (5-card cap, stub footnote, cobalt current card)
- **Blocked on:** W7.0 stubs (trialId values needed for Link rendering in predecessor cards)
- **Chains to wire first (per predecessor-map.md §4.1):**
  1. EVT 2015 chain — IMS-III/SYNTHESIS/MR RESCUE → MR CLEAN/ESCAPE/REVASCAT/EXTEND-IA/SWIFT PRIME/THRACE
  2. ICH surgery chain — STICH I/STICH II/MISTIE III → ENRICH
  3. Acute DAPT chain — MATCH/CHARISMA → CHANCE/POINT/INSPIRES
  4. Basilar EVT chain — BEST/BASICS → ATTENTION/BAOCHE
  5. Hemicraniectomy chain — DECIMAL/DESTINY/HAMLET → DESTINY II (all predecessors already in app)

---

### W7.0 — Predecessor Trial Stubs (Priority 1 — EVT 2015 chain)

> These three trials are cited by 6 modern thrombectomy trials each. Building them unlocks the EVT 2015 chain wiring in W6.9.
> Open question (Section 6.5 of predecessor-map.md): separate pages vs combined "EVT 2013 failures" page — RESOLVED: separate pages (canary batch implements separate pages).
> Stub pattern locked via TRIALS_SPEC §7c (2026-04-27). W7.0.4–W7.0.10 complete (2026-04-28).

- [x] W7.0.1 — Build stub for IMS-III (2013, NEJM, Broderick et al.) — commit: see W7.0 canary batch commit
  - trialId: 'ims-iii-trial' · trialResult: NEGATIVE · archetypeId: 'A'
  - URL: /trials/ims-iii-trial
  - Clinical review: docs/reviews/clinical-PR-W7.0-predecessor-stubs.md (approve, condition resolved: CI corrected to 0.83-1.30)

- [x] W7.0.2 — Build stub for SYNTHESIS Expansion (2013, NEJM, Ciccone et al.) — commit: see W7.0 canary batch commit
  - trialId: 'synthesis-expansion-trial' · trialResult: NEGATIVE · archetypeId: 'A'
  - URL: /trials/synthesis-expansion-trial
  - Clinical review: docs/reviews/clinical-PR-W7.0-predecessor-stubs.md (approve)

- [x] W7.0.3 — Build stub for MR RESCUE (2013, NEJM, Kidwell et al.) — commit: see W7.0 canary batch commit
  - trialId: 'mr-rescue-trial' · trialResult: NEUTRAL (confirmed by clinical-reviewer; zero effect size, underpowered, no directional signal) · archetypeId: 'A'
  - URL: /trials/mr-rescue-trial
  - Clinical review: docs/reviews/clinical-PR-W7.0-predecessor-stubs.md (approve)

### W7.0 — Priority 2 — Basilar EVT chain

- [x] W7.0.4 — Build stub for BEST (basilar artery EVT, 2020, Lancet Neurol, Liu et al.)
  - trialId: 'best-trial' · trialResult: NEUTRAL (ITT non-significant; 34% crossover + early termination → inconclusive) · archetypeId: 'A'
  - URL: /trials/best-trial · successorTrialId: 'attention-trial'
  - Clinical review: docs/reviews/clinical-W7.0-subbatch1-basilar.md (approve)

- [x] W7.0.5 — Build stub for BASICS (basilar artery EVT, 2021, NEJM, Langezaal et al.)
  - trialId: 'basics-trial' · trialResult: NEUTRAL (CI 0.92–1.50; underpowered; didn't falsify directional hypothesis) · archetypeId: 'A'
  - URL: /trials/basics-trial · successorTrialId: 'attention-trial'
  - Clinical review: docs/reviews/clinical-W7.0-subbatch1-basilar.md (approve)

- [x] W7.0.6 — Build stub for MATCH (2004, Lancet, Diener et al.)
  - trialId: 'match-trial' · trialResult: NEGATIVE · archetypeId: 'A' · listCategory: 'antiplatelets'
  - URL: /trials/match-trial · successorTrialId: 'point-trial'
  - Clinical review: docs/reviews/clinical-W7.0-subbatch2-antiplatelet.md (approve, conditions resolved)

- [x] W7.0.7 — Build stub for CHARISMA (2006, NEJM, Bhatt et al.)
  - trialId: 'charisma-trial' · trialResult: NEGATIVE · archetypeId: 'A' · listCategory: 'antiplatelets'
  - URL: /trials/charisma-trial · successorTrialId: 'point-trial'
  - Clinical review: docs/reviews/clinical-W7.0-subbatch2-antiplatelet.md (approve, conditions resolved)

### W7.0 — Priority 3 — ICH surgery chain

- [x] W7.0.8 — Build stub for STICH I (2005, Lancet, Mendelow et al.)
  - trialId: 'stich-i-trial' · trialResult: NEGATIVE · archetypeId: 'A' (no listCategory — ICH not in union)
  - URL: /trials/stich-i-trial · successorTrialId: 'enrich-trial'
  - Clinical review: docs/reviews/clinical-W7.0-subbatch3-ich-surgical.md (approve, editorial conditions resolved)

- [x] W7.0.9 — Build stub for STICH II (2013, Lancet, Mendelow et al.)
  - trialId: 'stich-ii-trial' · trialResult: NEGATIVE · archetypeId: 'A' (no listCategory)
  - URL: /trials/stich-ii-trial · successorTrialId: 'enrich-trial'
  - Clinical review: docs/reviews/clinical-W7.0-subbatch3-ich-surgical.md (approve, editorial conditions resolved)

- [x] W7.0.10 — Build stub for MISTIE III (2019, Lancet, Hanley et al.)
  - trialId: 'mistie-iii-trial' · trialResult: NEGATIVE · archetypeId: 'A' (no listCategory)
  - URL: /trials/mistie-iii-trial · successorTrialId: 'enrich-trial'
  - Clinical review: docs/reviews/clinical-W7.0-subbatch3-ich-surgical.md (approve, editorial conditions resolved)
  - Note: stub scope selected (brief predecessor pattern, not full page) per §7c

---

### W7.1 — Trials listing page design — mockup only — Class C

#### W7.1.0 — trials-legend-reference.html visual ground truth — Class B
- **Status:** [x] done — 2026-04-28
- **User-visible goal:** none (mockup only; visual spec for the trials listing / legend page)
- **Non-goals:** no code; no React component; no route wiring; no clinical content
- **Files touched:** docs/specs/mockups/trials-legend-reference.html (created, 3 stages) · index.css (6 new CSS tokens added to :root + font-feature-settings cv11 on body)
- **Acceptance checks:** file renders all 3 stages · token values trace to trial-reference.html lines 8–540 and v4 token sheet §1–6 · new tokens committed to index.css · no invented values
- **Stages delivered:**
  - Stage 1: Default landing, Questions view, Mobile 380px + Desktop 1180px
  - Stage 2: Catalog view, filter bar + IVT section header + 4 trial cards, Mobile 380px + Desktop 1180px
  - Stage 3: Toggle states A/B/C at 340px + spec block (exact radii, timing, easing, new tokens, ARIA notes)
- **New CSS tokens added to index.css:** --cobalt-soft, --ease-discovery, --shadow-card-hover, --cat-ivt, --cat-prevention, --cat-surgical, font-feature-settings cv11 on body
- **Clinical impact:** none (design mockup; no clinical claims)
- **Rollback plan:** n/a

---

### WAVE 8 — Trial Quality, Navigation & Language Cleanup

> Produced from the 2026-05-06 design + language audit sweep. Sources: docs/audits/2026-trial-design-audit.md · docs/audits/2026-language-audit.md.

#### W8.1 — Fix back-button navigation sitewide — Class B
- **Status:** done — commit 6ffcc21
- **User-visible goal:** Tapping "Back" anywhere in the app returns the user to wherever they navigated from, not always to a hardcoded destination.
- **What shipped:** Created `src/hooks/useBackNavigation.ts` (shared hook: navigate(-1) with configurable fallback). Updated `src/hooks/useNavigationSource.ts` (goBack/handleBack now use navigate(-1) with path-aware fallback + boundary comment added). Replaced all back-button Links with buttons in: TrialPageNew.tsx (69 instances + recordView wiring + canary back button touch target), ArticleLayout.tsx, NihssCalculator, Abcd2Score, BostonCriteriaCaa, Cha2ds2Vasc, RopeScore, GlasgowComa, AspectScore, IchScore, HasBled, HeidelbergBleeding, EmBilling (calculators), ElanPathway, EvtPathway, MigrainePathway, GCAPathway, StatusEpilepticusPathway, ExtendedIVTPathway, ResidentGuide, StrokeBasicsWorkflowV2. Total: 22 files patched, 3 distinct back-button patterns eliminated. ResidentGuide useBackNavigation hook refactor resolved pre-existing three-pattern arch problem (documented in arch-PR-pending-back-button-refactor.md as a condition).
- **Acceptance checks:** tsc clean · build green · navigate(-1) with /trials fallback on direct URL load · ResidentGuide three-pattern resolution verified ✓
- **Clinical impact:** none
- **Rollback plan:** n/a

#### W8.2 — Legacy trial redesign program — Class E-clinical (per trial)
- **Status:** planned — awaiting priority confirmation from V
- **Source:** docs/audits/2026-trial-design-audit.md §3 and §5
- **User-visible goal:** 14 legacy trials rendered in old stats-cards + progress-bar layout receive full modern design (archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, explicit JSX branch).
- **Priority order from audit:** ENRICH → DEFUSE-3 + DAWN (pair) → NINDS → SELECT2 + ANGEL-ASPECT (pair) → ATTENTION + BAOCHE (pair) → INSPIRES + CHANCE-2 → ECASS III → ORIGINAL → SAMMPRIS → B_PROUD
- **Sub-tasks (one per trial or pair):**
  - [ ] W8.2.1 — ENRICH rebuild (Class E-clinical): Archetype B, mrsDistribution from NEJM 2024 Fig. UW-mRS primary, MIPS approach, first-positive framing. Must contrast with STICH I/II/MISTIE III stubs. Highest urgency.
  - [ ] W8.2.2 — DEFUSE-3 + DAWN pair (Class E-clinical): Both Archetype A. DEFUSE-3: binary mRS 0-2 (45% vs 17%), stopped-early amber. DAWN: utility-weighted mRS primary needs explanation (novel teaching challenge). uwmRS not used in any existing page — may require new teaching component or extended howToReadChart Q&A.
  - [ ] W8.2.3 — NINDS rebuild (Class E-clinical): Archetype A. Two-part trial design (Part 1: neurological improvement; Part 2: functional outcome). NNT 6.5. The `legend` field is already populated. Highest foundational teaching value.
  - [ ] W8.2.4 — SELECT2 + ANGEL-ASPECT pair (Class E-clinical): Both Archetype B. mrsDistribution from NEJM Fig 2 (each). Generalized OR available (1.51 / 1.37). Companion cross-links required. Shared doesNotProve template: "Results limited to ASPECTS 3–5; above this threshold EVT is already established."
  - [ ] W8.2.5 — ATTENTION + BAOCHE pair (Class E-clinical): Both Archetype A. mRS 0-3 threshold (not 0-2) requires explicit howToInterpret explanation. Companion to BEST and BASICS stubs (basilar EVT chain context).
  - [ ] W8.2.6 — INSPIRES + CHANCE-2 pair (Class E-clinical): Both Archetype A. INSPIRES: partially modernized trialDesign data already present; needs archetypeId, howToInterpret, bedsidePearl, inclusionCriteria. CHANCE-2: CYP2C19 LOF framing — most complex antiplatelet trial. Completes CHANCE → POINT → INSPIRES → CHANCE-2 chain.
  - [ ] W8.2.7 — ECASS III rebuild (Class E-clinical): Archetype A. Simple 4.5h extension. Low complexity. Legend field populated.
  - [ ] W8.2.8 — ORIGINAL trial rebuild (Class E-clinical): Archetype A with NI framing. TNK vs alteplase, JAMA 2024. Pairs with AcT.
  - [ ] W8.2.9 — SAMMPRIS rebuild (Class E-clinical): Archetype A with harm framing. ICAD stenting vs AMM. Atypical endpoint (event rate, not mRS). Chain context: WEAVE (Archetype G stub) and intracranial stenosis management.
  - [ ] W8.2.10 — B_PROUD rebuild (Class E-clinical): Archetype B or A (pending mrsDistribution data availability). Non-randomized design — doesNotProve must lead with design limitation. Companion to MR ASAP and TRIAGE-STROKE.
- **Non-goals:** no changes to existing modern-design pages
- **Clinical impact:** high (each sub-task is Class E-clinical)
- **Rollback plan:** per-trial revert; existing legacy layout is the fallback

#### W8.2.0 — WCAG 2.5.3 back-button canary fix — Class B
- **Status:** DONE 2026-06-02 (commit 15b19cc). accessibility-specialist pass over TrialPageNew.tsx: removed the mismatched static `aria-label="Back to Neuro Trials"` from 109 archetype-branch back buttons whose visible text is a trial abbreviation (accessible name now derives from the visible label → 2.5.3 compliant), and added `aria-hidden="true"` to all 110 `ArrowLeft` icons. The one compliant catalog-fallback button (visible text == "Back to Neuro Trials", L401) left unchanged. tsc/build/claims green; presentation-only, no clinical content touched.
- **User-visible goal:** TrialPageNew canary back buttons (60+ trial page branches) resolve WCAG 2.5.3 "Target Size (Enhanced)" issue: visible trial name label conflicts with aria-label mismatch on small viewports.
- **Context:** Back button back-navigation swarm (W8.1) fixed the hook and integrated pattern; canary TrialPageNew branches now have touch targets in both label (trial name) and aria-label. On 375px viewport, the visible text may be truncated or wrapped while aria-label remains unchanged. Audit detects mismatch (visible vs announced text). Fix: align label rendering or aria-label content, test at 375px.
- **Non-goals:** no clinical content changes; no hook changes; presentation only
- **Acceptance checks:** 375px mobile QA pass; aria-label matches visible text or omit aria-label if visible text is self-describing; no WCAG 2.5.3 violations
- **Clinical impact:** none
- **Rollback plan:** n/a

#### W8.3 — Language cleanup: em-dash and prose standardization — Class C-clinical
- **Status:** [x] done — full em-dash sweep applied 2026-06-03 (codemod + clinical sign-off). 97 content lines in src/data/trialData.ts had spaced em-dashes (` — `) replaced with meaning-preserving punctuation (single→semicolon, pair→commas, dense ≥3 lines→commas after individual human review of all 15). 26 remaining em-dash lines are developer code comments (correctly untouched). All 562+ en-dashes in CIs/page-ranges/numeric-ranges preserved (verified: 104 en-dashes balanced on both diff sides, zero net change). tsc clean · build 170/170 · §17.2 artifact docs/reviews/clinical-PR-trialdata-emdash-sweep.md (approve). Subsumes W8.3.3 (TRACE-III/THAWS) and W8.3.4 (pearls[]/listDescription) — the sweep covered every user-facing prose field in the file. Codemod: scripts/codemod-emdash-sweep.mjs (idempotent, --dry-run).
- **Source:** docs/audits/2026-language-audit.md
- **User-visible goal:** Clinical prose in trialData.ts is free of em dashes and double hyphens in user-facing fields (bedsidePearl, howToInterpret, howToReadChart, bottomLineSummary).
- **Sub-tasks (pattern-level, not per-trial):**
  - [x] W8.3.1 — Batch 5C/5D `--` cleanup (decimal, destiny, hamlet, destiny-ii, timing, optimas): DONE 2026-06-02. Replaced double-hyphen instances in doesNotProve, cautions, bedsidePearl, keyMessage with meaning-preserving punctuation (comma/semicolon/period). Reclassified as Class B (punctuation only, provably no meaning change; each replacement uniqueness-asserted before write). Verified 0 prose `--` remain.
  - [x] W8.3.2 — Antiplatelet section `--` cleanup (eagle, escape-na1, socrates, sps3, sparcl): DONE 2026-06-02. Same Class B punctuation pass. Combined with W8.3.1 into a single 21-replacement commit on src/data/trialData.ts.
  - [x] W8.3.3 — TRACE-III / THAWS `—` cleanup: DONE 2026-06-03 as part of the full file-wide sweep above (codemod handled every prose field, including these two trials).
  - [x] W8.3.4 — pearls[] and listDescription `—` sweep: DONE 2026-06-03 as part of the full file-wide sweep above.
- **Non-goals:** "essentially" phrasing is borderline; defer to PM; no structural rewriting
- **Acceptance checks:** grep for `—` and `--` in bedsidePearl, doesNotProve, cautions, howToReadChart, bottomLineSummary returns zero results
- **Clinical impact:** low (prose only, no threshold or interpretation changes)
- **Rollback plan:** n/a (prose changes; revert if any meaning change is detected post-review)

#### W8.4 — Add years to trial navigation surfaces — Class C
- **Status:** [x] done — verified complete 2026-06-03. The "14 of 89 trials lack year" premise (written 2026-06-02) is STALE: re-audit shows every trial on every navigation surface now resolves a real year. Findings: (a) catalog data complete — all 95 entries (71 manualTrials + 24 LEGACY_TRIAL_CATALOG_META) carry a non-zero `year:`; the `enrichTrial` `year ?? 0` fallback and the legacy-meta path both produce real years, zero year-0 entries. (b) Question-detail chips DO show year — QuestionDetailPage resolves catalog trials via findTrialById (real year) and the 8 TRIAL_DATA-only stub trials (extend-ia-tnk, rescue-japan-limit, best, basics, stich-i, stich-ii, mistie-iii, annexa-i) via yearFromTrial() source-string parse, all 8 returning real years (2005–2024), none 0. (c) Display surfaces all render year guarded `year > 0`: TrialLegendCard (hub + question chips), TrialPageNew header, plus the /trials hub "New 2024–25" filter and year-search both drive off real years. No code change required; no surface ever displays a 0 or blank year. RelatedTrialsSidebar intentionally omits year (link rail, design choice — not a data gap). Sub-decision (b) resolved: chips already show year.
- **User-visible goal:** Trial cards, listing rows, and navigation chips show the trial year so residents can orient to the evidence timeline without opening each page.
- **Investigation needed:** Audit which surfaces are missing the year field: TrialLegendCard, TrialsPage listing rows, question-detail trialId chips, trials-referenced-in pathway pages. The `catalogTrial?.year` field is already used in the legacy fallback header (TrialPageNew.tsx line 6722) — check if it propagates to listing and nav surfaces.
- **Files likely touched:** src/components/trials/TrialLegendCard.tsx · src/pages/TrialsPage.tsx (or equivalent listing page) · src/data/trialListData.ts (check if year is present for all 89 trials)
- **Non-goals:** no clinical content changes
- **Clinical impact:** none
- **Rollback plan:** n/a

#### W8.5 — New questions for question-driven navigation — Class A (PM task)
- **Status:** planned — requires V's clinical input
- **User-visible goal:** The /trials question-navigation surface expands from 6 starter questions to ~20-24 clinically relevant questions, each linked to the trials that answer them.
- **Action:** V to provide the clinical question list. Once questions are agreed, a code task (Class C-clinical) will wire them into src/data/trial-questions.ts with trialIds[] arrays.
- **Non-goals:** not a code task yet — no implementation until V approves the question taxonomy
- **Clinical impact:** n/a until content is defined
- **Rollback plan:** n/a

---

### OTHER P2 (lower priority)
- [x] [P2] tPA Reversal, Orolingual Edema, ICH Protocol modals — Stripe/Apple redesign — commits baecb1c, 10b6063
- [x] [P2] Stroke modals remaining — Thrombectomy, Eligibility, NIHSS — apply same Stripe/Apple pattern — commits fdec23f, 341d9a4
- [ ] [P2] All other pathway pages visual rebuild — StatusEpilepticusPathway, MigrainePathway, ExtendedIVTPathway, GCAPathway, ElanPathway, EvtPathway — apply same visual treatment as stroke pathway after component library exists.
- [ ] [P2] Dedup content-writer.md 2026/2022 guideline templates against .claude/skills/stroke-guidelines.md. content-writer.md currently embeds its own copies of guideline text that duplicates stroke-guidelines.md. On a low-traffic session, strip the duplicated guideline blocks from content-writer.md and replace with a `skills: stroke-guidelines` frontmatter entry + a single line: "For stroke/ICH domain knowledge, load the stroke-guidelines skill."

### Future Refactors
- Skill-build tasks for other neurology domains as they are needed: seizure-guidelines, headache-guidelines, dementia-guidelines, etc. Build on demand, not preemptively.
- [ ] Migrate humanizer as a standalone skill — either from Anthropic's environment skill at /mnt/skills/user/humanizer or authored fresh by extracting content-writer's internal humanizer checklist (lines 319–417 of content-writer.md). Once the skill file exists at .claude/skills/humanizer.md, add it to the frontmatter of medical-scientist and content-writer.
- [x] Archive /agents/dormant/compliance-legal.md and /agents/dormant/performance-optimizer.md — VERIFIED CLOSED 2026-06-02: legacy agent files no longer exist; only empty, untracked `agents/active/` and `agents/dormant/` dirs remain (0 tracked files). Canonical briefs live in .claude/agents/.
- [x] Update .claude/agents/seo-specialist.md routeMeta.ts → routeManifest.ts — VERIFIED CLOSED 2026-06-02: 0 occurrences of `routeMeta` in seo-specialist.md; already references routeManifest.ts throughout.
- [x] Audit .claude/skills/performance/SKILL.md for Next.js-specific examples — VERIFIED CLOSED 2026-06-02: 0 occurrences of next.config / next/font / next.js in the skill.
- [x] Fix stray 'ç' character in performance skill — VERIFIED CLOSED 2026-06-02: 0 occurrences of `ç` in .claude/skills/performance/SKILL.md.
- [ ] Evaluate whether .claude/agents/accessibility-specialist.md should be split — ARIA patterns and code examples may belong in .claude/skills/accessibility.md, with the agent file reduced to role + activation triggers + decision rubric. Evaluate after W3.5 when the full agent roster is in place.
- [x] Audit .claude/agents/mobile-first-developer.md for non-design-system Tailwind colors — VERIFIED CLOSED 2026-06-02: 0 raw `blue-*`/`gray-*` colors remain; the only neutrals present are `slate-*` (the sanctioned neuro neutral palette, used inside an illustrative code example). No action needed.
- [x] Archive /agents/active/ and /agents/dormant/ — VERIFIED CLOSED 2026-06-02: only empty untracked dirs remain (see first item above); all 17 briefs canonical in .claude/agents/.
- [ ] CLAUDE.md §13.3 references data-architect agent that does not exist in .claude/agents/. Decide when Wave 5 citation scanner work begins: create data-architect agent file, or reassign scanner ownership to system-architect or calculator-engineer. Update §13.3 accordingly.

---

## AUDIT REMEDIATION ROADMAP — FULL REPO AGENT AUDIT 2026

> **Source audit:** docs/reviews/full-repo-agent-audit/master-audit-report.md (2026-05-08, commit 2e36ab8)  
> **Agent swarm:** 15 agents — all Core 6 + all Contextual per CLAUDE.md §11  
> **All tasks below are `planned`** — no production code was modified during the audit.  
> **Every task requires V's explicit approval before any code changes (CLAUDE.md §19).**  
> Classification key: E = clinical logic change · D = high-risk / cross-boundary · C = scoped feature · B = tiny edit  
> `-clinical` flag = touches clinical data; adds: evidence-verifier + medical-scientist + clinical-reviewer gate

---

### P0 SECURITY — SSH Private Key in Git History [BLOCKED/DEFERRED]

#### SEC-1 — Remove committed SSH private key
- **Priority:** P0 — SECURITY EMERGENCY
- **Class:** Security — not a standard class task
- **Status:** blocked:V-must-revoke-key-first
- **User-visible goal:** none (key removal and git history scrub)
- **Why blocked:** Key revocation must happen on GitHub Settings before git history can be scrubbed. History rewrite requires `--force-with-lease`. V (key owner `nurvepc@gmail.com`) must act first. Orchestrator will execute steps 2–4 immediately after V confirms revocation.
- **Owner:** V (revoke key) → orchestrator (execute removal)
- **Files to remove:** `eval "$(ssh-agent -s)"` · `eval "$(ssh-agent -s)".pub`
- **Forbidden:** Do not attempt git history rewrite before V confirms key is revoked on GitHub.
- **Required steps:**
  1. V: Revoke the ed25519 key at GitHub Settings → SSH Keys → delete key for `nurvepc@gmail.com`
  2. Orchestrator: `git rm 'eval "$(ssh-agent -s)"'` + `git rm 'eval "$(ssh-agent -s)".pub'`
  3. Orchestrator: `git filter-repo --path 'eval "$(ssh-agent -s)"' --invert-paths --force`
  4. Orchestrator: `git push --force-with-lease`
- **Acceptance checks:** `git log --all -- 'eval*'` returns no commits · GitHub confirms key revoked · repo access confirmed after push
- **Audit source:** [master-audit-report.md §P0: SEC-1](docs/reviews/full-repo-agent-audit/master-audit-report.md) · [system-architect.md](docs/reviews/full-repo-agent-audit/agents/system-architect.md)

---

### Phase 1 — Clinical Safety Quick Fixes

> All Phase 1 tasks are Class E. Each requires: evidence-verifier packet → medical-scientist authoring → clinical-reviewer gate → clinical-PR artifact (§17.2) → full quality gates.  
> Recommended execution order: 1A → 1B → 1C → 1D (1A and 1B can be batched into one PR).

#### Phase 1A — Fix DOAC pearl Class III mislabel — Class E
- **Priority:** P0
- **Status:** [x] merged — commit `64970a6` · 2026-05-11
- **User-visible goal:** DOAC pearl displays an evidence classification consistent with its permissive recommendation text
- **Non-goals:** no scoring changes; no other pearl edits
- **Owner agents:** evidence-verifier → medical-scientist → clinical-reviewer
- **Files likely touched:** `src/data/strokeClinicalPearls.ts:166–176`
- **Files forbidden:** `src/pages/` · `src/components/` · `src/lib/citations/` (unless W5.2 registry is landed)
- **Required artifacts:** evidence-verifier packet confirming AHA/ASA 2026 §4.6 classification for DOACs · clinical-PR artifact `docs/reviews/clinical-PR<#>-doac-pearl-class.md` (§17.2 template)
- **Acceptance checks:** `evidenceClass` field changed from `'III'` to `'IIb'` (or correct class per AHA/ASA 2026) · pearl content text is consistent with new class · tsc clean · build green · check:claims passes · check:routes passes · clinical-reviewer decision: approve
- **Audit source:** [clinical-reviewer.md F: CLIN-1](docs/reviews/full-repo-agent-audit/agents/clinical-reviewer.md) · [master-audit-report.md §P0](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 1B — Fix tenecteplase "preferred for LVO" wording — Class E
- **Priority:** P0
- **Status:** [x] merged — commit `64970a6` · 2026-05-11
- **User-visible goal:** Tenecteplase text accurately reflects AHA/ASA 2026 framing (equivalent first-line, not preferred over alteplase)
- **Non-goals:** no dosing threshold changes; no other IvTpa content edits in this task
- **Owner agents:** evidence-verifier → medical-scientist → clinical-reviewer
- **Files likely touched:** `src/pages/guide/IvTpa.tsx:62`
- **Files forbidden:** `src/data/trialData.ts` · `src/lib/citations/`
- **Required artifacts:** evidence-verifier packet citing AHA/ASA 2026 section on TNK · clinical-PR artifact `docs/reviews/clinical-PR<#>-tnk-preferred-wording.md`
- **Acceptance checks:** line 62 updated to AHA/ASA-aligned wording (equivalent, not preferred) · tsc clean · build green · check:claims passes · clinical-reviewer decision: approve
- **Audit source:** [clinical-reviewer.md F: CLIN-2](docs/reviews/full-repo-agent-audit/agents/clinical-reviewer.md) · [master-audit-report.md §P0](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 1C — Fix NINDS pearl Part 2 qualifier + mimics pearl directive language — Class E
- **Priority:** P1
- **Status:** [x] merged — commit `a48ebe4` · 2026-05-11
- **User-visible goal:** NINDS pearl correctly qualifies outcome percentages as Part 2 data; mimics pearl replaces "when in doubt, treat" with AHA/ASA-aligned hedging
- **Non-goals:** no scoring changes; no structural rewrites of pearl objects
- **Owner agents:** evidence-verifier → medical-scientist → clinical-reviewer
- **Files likely touched:** `src/data/strokeClinicalPearls.ts:96–110` (NINDS pearl) · `src/data/strokeClinicalPearls.ts:189–198` (mimics pearl)
- **Files forbidden:** `src/pages/` · `src/components/`
- **Required artifacts:** evidence-verifier packet (NINDS Part 2 source) · clinical-PR artifact `docs/reviews/clinical-PR<#>-ninds-mimics-pearls.md`
- **Acceptance checks:** "Part 2" qualifier present in NINDS percentages · "when in doubt, treat" removed or replaced with hedged equivalent · tsc clean · build green · clinical-reviewer decision: approve
- **Audit source:** [clinical-reviewer.md F: CLIN-3, CLIN-4](docs/reviews/full-repo-agent-audit/agents/clinical-reviewer.md)

#### Phase 1D — Fix EXTEND trial description (desmoteplase → alteplase) — Class E
- **Priority:** P1
- **Status:** [x] merged — commit `35ff0e5` · 2026-05-11
- **User-visible goal:** EXTEND guide content correctly names alteplase as the tested thrombolytic (not desmoteplase)
- **Non-goals:** no other guideContent edits
- **Owner agents:** evidence-verifier → medical-scientist → clinical-reviewer
- **Files likely touched:** `src/data/guideContent.ts:69–70`
- **Files forbidden:** `src/data/trialData.ts` · `src/pages/`
- **Required artifacts:** evidence-verifier packet (EXTEND NEJM 2019 DOI 10.1056/NEJMoa1813046 — confirm alteplase) · clinical-PR artifact `docs/reviews/clinical-PR<#>-extend-description-fix.md`
- **Acceptance checks:** guideContent EXTEND description names alteplase correctly · tsc clean · build green · clinical-reviewer decision: approve
- **Audit source:** [medical-scientist.md](docs/reviews/full-repo-agent-audit/agents/medical-scientist.md) (EXTEND desmoteplase finding)

---

### Phase 2 — Trial Statistics Display Integrity

> Phase 2A is P0 (clinical). 2B–2C are P2. Each requires trial-statistician review and clinical-reviewer gate in addition to standard Class E workflow.

#### Phase 2A — Gate NNT at 8 TrialPageNew render sites behind suppressNNT — Class E
- **Priority:** P0
- **Status:** [x] merged — commit `fccf4f5` · 2026-05-11
- **User-visible goal:** DEFUSE-3, SELECT-2, ANGEL-ASPECT (ordinal-shift designs) no longer display NNT chips — statistically invalid for ordinal common OR outcomes
- **Non-goals:** no changes to `suppressNNT` useMemo logic (already correct per Wave 3 Batch 2); no new trial data added
- **Owner agents:** trial-statistician (audit + sign-off) → medical-scientist → clinical-reviewer
- **Files likely touched:** `src/pages/trials/TrialPageNew.tsx` (gate 8 render sites: all `calculations?.nnt != null` checks must also check `&& !stats.suppressNNT`)
- **Files forbidden:** `src/data/trialData.ts` unless stripping `calculations.nnt` from ordinal-shift entries as defense-in-depth (requires same evidence-verifier packet)
- **Required artifacts:** trial-statistician sign-off (can be inline in PR description or separate note) · clinical-PR artifact `docs/reviews/clinical-PR<#>-nnt-gate-fix.md`
- **Acceptance checks:** grep `calculations?.nnt != null` in TrialPageNew.tsx shows all occurrences also check `!stats.suppressNNT` · DEFUSE-3 / SELECT-2 / ANGEL-ASPECT trial pages show no NNT chip in build preview · tsc clean · build green · check:claims passes · clinical-reviewer decision: approve
- **Audit source:** [trial-statistician.md F1: NNT-1](docs/reviews/full-repo-agent-audit/agents/trial-statistician.md) · [master-audit-report.md §P0](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 2B — Add CI to ARD primary stat tiles (NINDS/DAWN/DEFUSE-3/CHOICE) — Class E
- **Priority:** P2
- **Status:** [x] done 2026-05-23 (commit 2537872). NINDS uses OR-CI proxy because the 1995 paper does not publish a frequentist CI for the dichotomous mRS 0-1 ARD itself. DEFUSE-3 secondary mRS 0-2 ARD is flagged [verification pending] because the Albers 2018 abstract does not report a frequentist CI for that secondary (primary cOR CI is shown). DAWN and CHOICE have full CIs from source.
- **User-visible goal:** ARD figures on primary stat tiles include 95% CI, matching ELAN pattern
- **Non-goals:** no archetype changes; no new components
- **Owner agents:** evidence-verifier (source CI values) → medical-scientist → trial-statistician (verify CI values) → clinical-reviewer
- **Files likely touched:** `src/data/trialData.ts` (add CI to `effectSize.label` or new `ardCI` field for NINDS, DAWN, DEFUSE-3, CHOICE entries)
- **Required artifacts:** evidence-verifier packet (CI values sourced from original publications) · trial-statistician confirmation · clinical-PR artifact `docs/reviews/clinical-PR<#>-ard-ci-tiles.md`
- **Acceptance checks:** 4 affected trial stat tiles display ARD with 95% CI · CI values traceable to source publications · tsc clean · build green · clinical-reviewer decision: approve
- **Audit source:** [trial-statistician.md F6: STAT-2](docs/reviews/full-repo-agent-audit/agents/trial-statistician.md)

#### Phase 2C — Fix DEFUSE-3 primaryEndpoint label (mRS 0-2 → mRS shift) — Class E
- **Priority:** P2
- **Status:** [x] done 2026-05-23 (commit af1cf02). primaryEndpoint.value now reads 'mRS shift' with label 'Ordinal distribution at 90 days' and supporting info string citing Albers GW et al. NEJM 2018;378:708-718.
- **User-visible goal:** DEFUSE-3 trial page correctly labels ordinal mRS shift as the published primary endpoint
- **Non-goals:** no NNT changes (handled in 2A)
- **Owner agents:** evidence-verifier → medical-scientist → clinical-reviewer
- **Files likely touched:** `src/data/trialData.ts` (DEFUSE-3 entry: `stats.primaryEndpoint.value`)
- **Required artifacts:** evidence-verifier packet (NEJM 2018 DEFUSE-3 primary endpoint) · clinical-PR artifact `docs/reviews/clinical-PR<#>-defuse3-primary-endpoint.md`
- **Acceptance checks:** DEFUSE-3 `primaryEndpoint.value` shows `'mRS shift'` or `'ordinal mRS distribution'` · mRS 0-2 rate moved to secondary outcome surface · tsc clean · build green · clinical-reviewer decision: approve
- **Audit source:** [trial-statistician.md F5: STAT-3](docs/reviews/full-repo-agent-audit/agents/trial-statistician.md)

---

### Phase 3 — Citation Registry / Claim Governance

> Phase 3A resumes the pre-existing W5.2 work item. Phase 3B is gated behind 3A landing. Phase 3C is non-clinical and can run independently.

#### Phase 3A — W5.2: Create registry.ts + seed CLAIM_REGISTRY — Class D-clinical
- **Priority:** P1
- **Status:** planned (resumes W5.2 in_progress — blocked by V decisions on T&J 1974 source)
- **User-visible goal:** none (citation governance infrastructure)
- **Non-goals:** do not add `data-claim` tags to JSX in this task (that is Phase 3B); do not change clinical text
- **Owner agents:** medical-scientist → clinical-reviewer
- **Files likely touched:** `src/lib/citations/registry.ts` (new) · `src/lib/citations/claims.ts` (populate from stub)
- **Files forbidden:** `src/pages/` · `src/components/` · `src/data/trialData.ts` (unless PMID backfill explicitly included in plan)
- **V decisions required (carried from W5.2 in_progress):**
  1. T&J 1974 source for GCS mild/severe/moderate thresholds (Lancet paywall — V has institutional access)
  2. gcs-moderate-threshold attribution (ACRM 1993 is wrong — decide: T&J / BTF-implicit / remove)
  3. gcs-mild-ct-caveat source (NICE head injury guidelines candidate)
  4. gcs-airway-reflex-caveat: Rotheray 2012 covers GCS 9–14 not 9–12 — accept with reword / soften / drop
  5. gcs-sedation-caveat: verb drift from BTF 2023 — reword to match / split claim
- **Required artifacts:** arch review (§17.1) if schema changes · clinical-PR artifact `docs/reviews/clinical-PR<#>-registry-w52.md`
- **Acceptance checks:** `registry.ts` exports at minimum AHA/ASA 2026 + Hemphill 2001 entries · `claims.ts` has ≥1 registered claim per calculator surface · `npm run check:claims` passes without registry.ts warning · tsc clean · build green · clinical-reviewer decision: approve
- **Audit source:** [evidence-verifier.md: CIT-1](docs/reviews/full-repo-agent-audit/agents/evidence-verifier.md) · [master-audit-report.md §P0: CIT-1](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 3B — Add data-claim tags to JSX calculator surfaces — Class D-clinical
- **Priority:** P1
- **Status:** planned — blocked:awaiting-Phase-3A-registry
- **User-visible goal:** none (clinical governance — automated checks now cover calculator claim surfaces)
- **Non-goals:** no clinical text changes; no UI changes
- **Owner agents:** medical-scientist → clinical-reviewer
- **Files likely touched:** `src/pages/NihssCalculator.tsx` · `src/pages/AspectScoreCalculator.tsx` · `src/pages/IchScoreCalculator.tsx` · `src/pages/Abcd2ScoreCalculator.tsx` · `src/pages/GlasgowComaScaleCalculator.tsx`
- **Files forbidden:** `src/lib/citations/registry.ts` (W5.2 must be merged first) · do not add new clinical text, only `data-claim` attributes on existing elements
- **Required artifacts:** clinical-PR artifact `docs/reviews/clinical-PR<#>-data-claim-tags.md`
- **Acceptance checks:** check:claims passes with zero unregistered claims · all tagged claim IDs exist in registry.ts · tsc clean · build green · clinical-reviewer decision: approve
- **Audit source:** [evidence-verifier.md](docs/reviews/full-repo-agent-audit/agents/evidence-verifier.md) · [master-audit-report.md §CIT-1](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 3C — Add tsc --noEmit to pre-commit hook — Class C
- **Priority:** P1
- **Status:** [x] merged — commit af1dc24 (2026-05-13)
- **User-visible goal:** none (type regressions blocked at commit time)
- **Non-goals:** no clinical files; no test runner setup (Phase 5A)
- **Owner agents:** quality-assurance
- **Files likely touched:** `.husky/pre-commit`
- **Files forbidden:** all `src/` · all `src/data/`
- **Required artifacts:** none (Class C, non-clinical)
- **Acceptance checks:** committing a file with a deliberate type error is rejected by the hook · existing pre-commit checks (check:claims, check:routes) still pass · tsc clean · build green
- **Audit source:** [quality-assurance.md F: QA-2](docs/reviews/full-repo-agent-audit/agents/quality-assurance.md) · [master-audit-report.md §P1: QA-2](docs/reviews/full-repo-agent-audit/master-audit-report.md)

---

### Phase 4 — Compliance and Public Trust

> Phase 4A–4D are P0. Phase 4E is P2. 4B and 4C can be batched into one PR. 4D should be its own PR. All are non-clinical (no algorithm or threshold changes).

#### Phase 4F — Privacy page data-inventory completeness — Class C
- **Priority:** P2
- **Status:** [x] done — commit f4cb1e7 (2026-06-05). Table is category-complete (grouped "App preferences and first-run flags" row + restored completeness statement); compliance-legal approve (docs/reviews/compliance-phase4f-privacy-inventory.md).
- **User-visible goal:** the /privacy "What data we collect" table accurately and completely accounts for every persistent storage key, so the page can again make a truthful exhaustiveness statement (the "Nothing is omitted" line was removed in 7195306 because it was false)
- **Context:** 7195306 corrected 3 misnamed keys (consent → `neurowiki-analytics-consent`, favorites → `neurowiki:favorites:v1`, disclaimer → `neurowiki-disclaimer-accepted`), fixed the consent-revoke instruction, and dropped the false "Nothing is omitted" claim. Full enumeration deferred to here.
- **Undisclosed keys to triage + document (localStorage unless noted):** `neurowiki:disclaimer:v1` (first-run flag) · `neurowiki:install-overlay:v1`+`:v2` (install overlay shown-once) · `neurowiki:tour-complete:v1` (onboarding tour) · `neurowiki:install-engagement:v1` (engagement counters) · `neurowiki:session-counted:v1` (sessionStorage) · `neurowiki:em-billing:provider` (⚠️ stores a clinician/provider name — mild PII, confirm disclosure scope) · `neurowiki:home:hasVisited` · `neurowiki:home:showMoreExpanded` · `neurowiki:search:recents` · `neurowiki-sidebar-tools` · `neurowiki-json-ld` · `neurowiki-case-transfer-v1` (local half of cross-device transfer) · BottomLineDrawer sessionStorage hint key · StrokeBasicsWorkflowV2 + EmBillingCalculator sessionStorage `SESSION_KEY`
- **Owner agents:** compliance-legal (reviewer-first — decide what must be itemized vs. summarized; make the em-billing PII call) → content-writer (table copy)
- **Files likely touched:** `src/pages/PrivacyPage.tsx`
- **Acceptance checks:** every persistent key is either listed or honestly covered by a summary clause · em-billing provider-name PII addressed · revoke instructions accurate · tsc clean · build green
- **Clinical impact:** none

#### Phase 4A — Cookie consent gate before Google Analytics — Class D
- **Priority:** P0
- **Status:** [x] merged — commit 6356c59 (2026-05-13)
- **User-visible goal:** EU users see a cookie consent banner before any analytics data is sent to Google
- **Non-goals:** no full CMP (Consent Management Platform); no clinical content changes; anonymize_ip already set (keep it)
- **Owner agents:** compliance-legal (spec + sign-off) → ui-architect (conditional GA loading) → content-writer (consent banner copy)
- **Files likely touched:** `index.html:117–123` (conditional GA loading) · new consent banner component in `src/components/` · `src/App.tsx` (consent callback integration)
- **Files forbidden:** all `src/data/` · all `src/pages/guide/` · all clinical surfaces
- **Required artifacts:** arch review (§17.1) for conditional loading approach · compliance-legal sign-off on consent banner copy
- **Acceptance checks:** GA script does not fire until consent button clicked · first visit shows consent banner · consent persisted in localStorage (cleared on explicit withdraw) · tsc clean · build green
- **Audit source:** [compliance-legal.md F1: GDPR-1](docs/reviews/full-repo-agent-audit/agents/compliance-legal.md) · [master-audit-report.md §P0: GDPR-1](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 4B — Add NIHSS in-page disclaimer footer — Class C
- **Priority:** P0
- **Status:** [x] merged — commit 27e8b99 (2026-05-13)
- **User-visible goal:** NIHSS calculator has a footer disclaimer matching the pattern already present on ASPECTS, ICH Score, GCS, ABCD2 calculators
- **Non-goals:** no scoring logic changes; no other calculator edits in this task
- **Owner agents:** content-writer (copy, matching ASPECTS pattern at `AspectScoreCalculator.tsx:416`) → ui-architect (component placement)
- **Files likely touched:** `src/pages/NihssCalculator.tsx`
- **Files forbidden:** `src/data/` (no clinical data changes)
- **Required artifacts:** none (Class C non-clinical)
- **Acceptance checks:** NIHSS page has a disclaimer footer visible at page bottom · copy matches or is consistent with ASPECTS disclaimer pattern · tsc clean · build green
- **Audit source:** [compliance-legal.md F3: COMP-3](docs/reviews/full-repo-agent-audit/agents/compliance-legal.md) · [master-audit-report.md §P0: COMP-3](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 4C — Adjacent dosing disclaimer in stroke code workflow — Class C
- **Priority:** P0
- **Status:** [x] already shipped — pre-existing (verified 2026-05-13)
- **User-visible goal:** tPA/TNK computed dose displays in stroke code steps carry adjacent text clarifying these are reference values to verify against institutional protocol — not medication orders
- **Non-goals:** no dosing logic changes; no threshold changes; no changes to `src/utils/strokeDosing.ts`
- **Owner agents:** content-writer (copy: "Reference only — verify against institutional protocol before administration") → ui-architect (placement adjacent to dose display)
- **Files likely touched:** `src/components/article/stroke/CodeModeStep1.tsx:352–361` · `src/components/article/stroke/CodeModeStep2.tsx:229–236`
- **Files forbidden:** `src/utils/strokeDosing.ts` (no dosing logic) · `src/data/`
- **Required artifacts:** none (Class C non-clinical)
- **Acceptance checks:** disclaimer text visible adjacent to tPA total dose, bolus, infusion, and TNK dose displays in Step1 and Step2 · tsc clean · build green
- **Audit source:** [compliance-legal.md F2: COMP-2](docs/reviews/full-repo-agent-audit/agents/compliance-legal.md) · [master-audit-report.md §P0: COMP-2](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 4D — Create Privacy Policy + Terms of Use + Accessibility Statement routes — Class C
- **Priority:** P0
- **Status:** [x] merged — commit 6090937
- **User-visible goal:** `/privacy`, `/terms`, `/accessibility` routes exist and render correct legal copy
- **Non-goals:** no CMP integration in this task (handled in Phase 4A); no clinical content
- **Owner agents:** content-writer (all copy — Privacy Policy must disclose: GA with anonymize_ip, feedback email via Resend, NPI proxy not stored, localStorage for recents/favorites/disclaimer, data deletion contact) → ui-architect (page shells + routing) → compliance-legal (copy sign-off)
- **Files likely touched:** `src/config/routeManifest.ts` (3 new route entries) · `src/App.tsx` (3 new lazy route wires) · 3 new page components under `src/pages/`
- **Files forbidden:** all `src/data/` · all clinical surfaces
- **Required artifacts:** compliance-legal sign-off on Privacy Policy copy · route manifest validates (39 → 42 routes)
- **Acceptance checks:** `/privacy`, `/terms`, `/accessibility` routes render · Privacy Policy discloses all data uses listed above · routeManifest validates with updated route count · tsc clean · build green · check:routes passes
- **Audit source:** [compliance-legal.md F4: COMP-1](docs/reviews/full-repo-agent-audit/agents/compliance-legal.md) · [master-audit-report.md §P0: COMP-1](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 4E — Standardize `<CalcDisclaimer />` across remaining calculator pages — Class C
- **Priority:** P2
- **Status:** [x] satisfied 2026-05-23 by the existing shared `CalculatorFooter` component (src/components/calculators/CalculatorFooter.tsx). Each calculator passes a context-specific `disclaimer` prop to the shared footer — RoPE, Heidelberg, Boston Criteria all verified to have disclaimer text in place. The audit was written before CalculatorFooter existed; the intent of Phase 4E ("shared component, no duplication, all 3 calculators carry disclaimer") is met by the current pattern. No additional CalcDisclaimer primitive needed; per-calculator disclaimer text is intentionally bespoke because clinical context differs (CAA, hemorrhagic transformation, PFO).
- **User-visible goal:** ROPE Score, Heidelberg Bleeding, Boston Criteria CAA calculators all have footer disclaimers (NIHSS covered in Phase 4B)
- **Non-goals:** no clinical content changes; no scoring changes
- **Owner agents:** content-writer (copy) → ui-architect (shared `<CalcDisclaimer />` component if not created in 4B)
- **Files likely touched:** `src/pages/RopeScoreCalculator.tsx` · `src/pages/HeidelbergBleedingCalculator.tsx` · `src/pages/BostonCriteriaCaaCalculator.tsx` · `src/components/calculators/CalcDisclaimer.tsx` (new shared component)
- **Required artifacts:** none (Class C non-clinical)
- **Acceptance checks:** all 3 calculators have footer disclaimer · `<CalcDisclaimer />` is shared, not duplicated · tsc clean · build green
- **Audit source:** [compliance-legal.md F10](docs/reviews/full-repo-agent-audit/agents/compliance-legal.md)

---

### Phase 5 — Test Foundation

#### Phase 5A — Vitest setup + Phase 1 calculator scoring tests — Class D
- **Priority:** P1
- **Status:** [x] merged — commit 5d84715 (2026-05-13)
- **User-visible goal:** none (developer tooling; no UI change)
- **Non-goals:** no Playwright / E2E in this task; no clinical content changes; no UI test changes
- **Owner agents:** quality-assurance
- **Files likely touched:** `package.json` (vitest dep + `"test"` script) · `vite.config.ts` (test config block) · `src/__tests__/` (new directory) · test files for: NIHSS scoring, ASPECTS scoring, ICH Score, ABCD2 scoring, stroke dosing utility (`src/utils/strokeDosing.ts`), useRecents hook, useFavorites hook
- **Files forbidden:** all `src/data/trialData.ts` · all `src/pages/guide/` · all clinical claim surfaces
- **Required artifacts:** arch review (§17.1) for test infrastructure approach (Vitest config, file co-location vs `__tests__/` dir)
- **Acceptance checks:** `npm test` runs and exits 0 · ≥50 tests passing · NIHSS, ASPECTS, ICH Score, ABCD2 scoring logic 70%+ covered · stroke dosing edge cases (0-weight, boundary doses) covered · tsc clean · build green · pre-commit hook unchanged (tests not added to pre-commit in this task)
- **Audit source:** [quality-assurance.md F1: QA-1](docs/reviews/full-repo-agent-audit/agents/quality-assurance.md) · [master-audit-report.md §P1: QA-1](docs/reviews/full-repo-agent-audit/master-audit-report.md)

---

### Phase 6 — Performance and Architecture Refactor

> All Phase 6 tasks are Class D and require system-architect review (§17.1) before any code changes. Phase 6A and 6B can run in parallel after their respective arch reviews.

#### Phase 6A — Lazy-load chart archetypes inside TrialPageNew — Class D
- **Priority:** P1
- **Status:** [x] merged — commit 94f0fce (2026-05-13)
- **User-visible goal:** Trial detail pages first-paint is faster; 837 kB chunk reduced to <500 kB raw
- **Non-goals:** no trial content changes; no new archetypes; no API changes
- **Owner agents:** system-architect (plan review) → ui-architect (implementation) → quality-assurance (bundle verification)
- **Files likely touched:** `src/pages/trials/TrialPageNew.tsx` (replace static imports with internal `React.lazy()` for DeltaBandChart, GrottaBarChart, BenchmarkThresholdChart, react-markdown, remark-gfm)
- **Files forbidden:** `src/data/trialData.ts` · all clinical data files
- **Required artifacts:** arch review artifact `docs/reviews/arch-PR<#>-lazy-chart-archetypes.md` (§17.1)
- **Acceptance checks:** TrialPageNew chunk <500 kB raw (<100 kB gzip target) · chart archetype modules appear as separate async chunks in build output · EXTEND / WEAVE / INTERACT4 / RIGHT-2 pages render identically · tsc clean · build green
- **Audit source:** [performance.md F: PERF-1](docs/reviews/full-repo-agent-audit/agents/performance.md) · [master-audit-report.md §P1: PERF-1](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 6B — Break trialData home-route coupling — Class D
- **Priority:** P1
- **Status:** [x] merged — commit 9af24af (2026-05-13)
- **User-visible goal:** Home page loads faster on first visit (index chunk reduces from 589 kB)
- **Non-goals:** no clinical content changes; no Home page visual changes in this task
- **Owner agents:** system-architect (plan review — identify safe coupling break point) → ui-architect (implementation) → quality-assurance
- **Files likely touched:** `src/data/trialListData.ts` (dynamic import boundary) · `src/data/scenarios.ts` · `src/pages/Home.tsx`
- **Files forbidden:** `src/data/trialData.ts` (do not modify trial data — only the import path)
- **Required artifacts:** arch review artifact `docs/reviews/arch-PR<#>-home-trialdata-coupling.md` (§17.1)
- **Acceptance checks:** index chunk <200 kB raw · Home page renders correctly · scenario resolution works · trials visible on Home still load · tsc clean · build green
- **Audit source:** [performance.md P1](docs/reviews/full-repo-agent-audit/agents/performance.md) · [system-architect.md F: DATA-1](docs/reviews/full-repo-agent-audit/agents/system-architect.md)

#### Phase 6C — Extract TrialPageNew utility functions — Class D
- **Priority:** P2
- **Status:** planned — blocked:awaiting-Phase-6A (lazy loading must land first to stabilize chunk boundaries)
- **User-visible goal:** none (structural refactor; trial pages render identically)
- **Non-goals:** no clinical content changes; no new features; no archetype changes in this task
- **Owner agents:** system-architect (plan review + composability sign-off) → ui-architect (implementation) → quality-assurance
- **Files likely touched:** `src/pages/trials/TrialPageNew.tsx` (extract `sanitizeLegacyTrialContent`, `formatTrialArm`, `buildTrialSummaryItems` to `src/utils/trialContent.ts`)
- **Required artifacts:** arch review artifact `docs/reviews/arch-PR<#>-trialpageneqw-decompose.md` (§17.1)
- **Acceptance checks:** extracted utilities live in `src/utils/trialContent.ts` · all existing trial branches compile and render identically · TrialPageNew.tsx line count meaningfully reduced · tsc clean · build green · all 39 routes validate
- **Audit source:** [system-architect.md F: D2](docs/reviews/full-repo-agent-audit/agents/system-architect.md) · [ui-architect.md](docs/reviews/full-repo-agent-audit/agents/ui-architect.md)

---

### Phase 7 — Accessibility and Mobile Polish

> All Phase 7 tasks are Class C. They are non-clinical. Phase 7A and 7B can run in parallel.

#### Phase 7A — NIHSS radiogroup semantics (WCAG Level A failure) — Class C
- **Priority:** P1
- **Status:** [x] merged — commit 176c98e (2026-05-13)
- **User-visible goal:** NIHSS item scoring is correctly announced by screen readers; keyboard users can navigate options
- **Non-goals:** no scoring logic changes; no visual changes to NIHSS UI
- **Owner agents:** accessibility-specialist → ui-architect
- **Files likely touched:** `src/components/NihssItemCard.tsx`
- **Files forbidden:** all `src/data/` · scoring logic in `src/pages/NihssCalculator.tsx` (UI-only change)
- **Required artifacts:** accessibility-specialist sign-off (axe-core or equivalent test result)
- **Acceptance checks:** `role="radiogroup"` on item container · `role="radio"` + `aria-checked` on each option button · `aria-live="polite"` on score total · axe-core reports zero Level A violations on NIHSS calculator page · tsc clean · build green
- **Audit source:** [accessibility-specialist.md F: ACC-1](docs/reviews/full-repo-agent-audit/agents/accessibility-specialist.md) · [master-audit-report.md §P1: ACC-1](docs/reviews/full-repo-agent-audit/master-audit-report.md)

#### Phase 7B — Modal focus management (DisclaimerModal + GlobalTrialModal) — Class C
- **Priority:** P1
- **Status:** [x] merged — commit 176c98e (2026-05-13)
- **User-visible goal:** Keyboard and screen reader users can navigate modals correctly (focus trapped inside; focus returns to trigger on close)
- **Non-goals:** no visual changes to modal design; no clinical text changes
- **Owner agents:** accessibility-specialist → ui-architect
- **Files likely touched:** `src/components/DisclaimerModal.tsx` · `src/components/GlobalTrialModal.tsx`
- **Files forbidden:** all `src/data/`
- **Required artifacts:** accessibility-specialist sign-off
- **Acceptance checks:** `role="dialog"` + `aria-modal="true"` on both modals · focus trapped when modal open · focus returns to trigger element on close · Escape key closes modal · tsc clean · build green
- **Audit source:** [accessibility-specialist.md F: ACC-2](docs/reviews/full-repo-agent-audit/agents/accessibility-specialist.md)

#### Phase 7C — GrottaBarChart ARIA labels — Class C
- **Priority:** P2
- **Status:** [x] merged — commit e5e6807 (2026-05-13)
- **User-visible goal:** GrottaBar mRS chart segments are announced by screen readers with category label and percentage
- **Non-goals:** no visual changes; no clinical content changes
- **Owner agents:** accessibility-specialist
- **Files likely touched:** `src/components/trials/GrottaBarChart.tsx`
- **Required artifacts:** accessibility-specialist sign-off
- **Acceptance checks:** each bar segment has `role="img"` + `aria-label` (mRS category + % value) · chart container has accessible name · tsc clean · build green
- **Audit source:** [accessibility-specialist.md](docs/reviews/full-repo-agent-audit/agents/accessibility-specialist.md)

#### Phase 7D — Mobile touch targets and safe-area fix — Class C
- **Priority:** P2
- **Status:** [x] merged — commit a7f13f7 (2026-05-13)
- **User-visible goal:** All interactive touch targets across the app meet the 44px minimum; iOS home indicator gap correctly applied in stroke workflow
- **Non-goals:** no clinical content changes; no scoring changes
- **Owner agents:** mobile-first-developer
- **Files touched:** `src/components/trials/TrialLegendCard.tsx` (star button `p-0.5` → `p-2 min-h-[44px] min-w-[44px]`) · `src/pages/guide/StrokeBasicsWorkflowV2.tsx:772` (invalid `safe-area-inset-bottom` CSS class → `pb-[env(safe-area-inset-bottom,0px)]`)
- **Acceptance checks:** all touch targets ≥44px on 375px viewport · `safe-area-inset-bottom` removed · iOS home indicator gap fixed · tsc clean ✓ · build green ✓
- **Audit source:** [mobile-first-developer.md F: MOB-1, MOB-2](docs/reviews/full-repo-agent-audit/agents/mobile-first-developer.md)

#### Phase 7D.1 — NIHSS spec alignment (Archetype 2) — Class C
- **Priority:** P2
- **Status:** [x] merged — commit a7f13f7 (2026-05-13)
- **User-visible goal:** NIHSS calculator rebuilt to CALCULATOR_SPEC v1.1 §3 (Archetype 2: bottom drawer with severity bracket and LVO probability)
- **Non-goals:** no new clinical prose beyond severity thresholds; interpretation strings deferred (see Phase 7D.2 below)
- **Files touched:** `src/pages/NihssCalculator.tsx` (two-row header per §3.1; portal bottom drawer per §1.3 Option A shell with severity bracket + LVO probability; all touch targets ≥44px; score display em dash; neuro-500 copy button; rounded-full toggle; max-w-2xl content; spec-correct footer)
- **Acceptance checks:** two-row header layout ✓ · portal drawer renders severity threshold table + LVO probability card ✓ · all touch targets ≥44px ✓ · em dash used in score output ✓ · copy button has neuro-500 color · toggle uses rounded-full · max-w-2xl content constraint · footer per spec ✓ · tsc clean ✓ · build green ✓
- **Clinical impact:** low (presentation shell; no new medical claims beyond threshold display)

#### Phase 7D.2 — NIHSS interpretation strings (deferred) — Class E
- **Priority:** P2
- **Status:** [x] done 2026-05-23 (commit 2537872). Four severity-band prose paragraphs (Minor 1-4 / Moderate 5-15 / Moderate-severe 16-20 / Severe ≥21) added to NIHSS portal drawer with new `nihss-severity-interpretation-2026` claim citing AHA/ASA 2026 §4.6.1 + §4.7.2 + §4.8.
- **User-visible goal:** Portal drawer bottom section includes severity interpretation prose (mild, moderate, severe, very severe ranges) matching stroke guidelines
- **Non-goals:** no calculator logic changes; no new scoring; drawer shell already exists
- **Owner agents:** medical-scientist (author interpretation text) → clinical-reviewer (gate before merge)
- **Files likely touched:** `src/pages/NihssCalculator.tsx` (portal drawer interpretation section after threshold table)
- **Files forbidden:** scoring logic in src/components/NihssItemCard.tsx, src/utils/nihssScoring.ts
- **Required artifacts:** citation trace per CALCULATOR_SPEC; clinical review artifact §17.2
- **Acceptance checks:** interpretation text ≥1 paragraph per severity level · each text tied to citation (guideline PMID or ADR) · clinical-reviewer approval · tsc clean · build green
- **Context:** Portal drawer shell in Phase 7D.1 is ready to receive interpretation content; this deferred task blocks only on clinical authoring + gating, not UI work.

---

### Phase 8 — Documentation and Repo Cleanup

> All Phase 8 tasks are non-clinical and non-urgency. Safe to batch or defer. Phase 8C (orphaned worktrees) is a Class B and can be done any time.

#### Phase 8A — Remove legacy agents/ root directory — Class D
- **Priority:** P2
- **Status:** [x] done 2026-05-23 (commit af1cf02). Legacy /agents directory (17 files) deleted. Canonical agent definitions live under .claude/agents/. No source files imported from it.
- **User-visible goal:** none (governance clarity; `.claude/agents/` is the only canonical agent registry)
- **Non-goals:** do not touch `.claude/agents/` (canonical location stays unchanged)
- **Owner agents:** system-architect (confirms no active references in prod code) → librarian (executes removal)
- **Files to remove:** `agents/` root directory (entire tree)
- **Files forbidden:** `.claude/agents/` · any source file in `src/`
- **Required artifacts:** arch review artifact `docs/reviews/arch-PR<#>-remove-legacy-agents-dir.md` (§17.1)
- **Acceptance checks:** `ls agents/` returns "No such file or directory" · grep for production `require`/`import` of `agents/` returns nothing · tsc clean · build green
- **Audit source:** [system-architect.md F: ARCH-1](docs/reviews/full-repo-agent-audit/agents/system-architect.md) · [cleanup-log.md](docs/reviews/full-repo-agent-audit/cleanup-log.md)

#### Phase 8B — Root MD file cleanup — Class C
- **Priority:** P2
- **Status:** planned — blocked:awaiting-canonical-confirmation for AHA-guideline duplicate
- **User-visible goal:** none (docs/ organization)
- **Non-goals:** do not remove CLAUDE.md, PRD.md, TASKS.md, README.md, or any file that may still be referenced
- **Owner agents:** librarian
- **Files to move or remove:**
  - `GEO-ANALYSIS.md` → `docs/audits/GEO-ANALYSIS.md`
  - `SEO-AUDIT-REPORT.md` → `docs/audits/SEO-AUDIT-REPORT.md`
  - `UI_UX_NEUROWIKI_AUDIT.md` → `docs/audits/UI_UX_NEUROWIKI_AUDIT.md`
  - `ORCHESTRATION.md` → confirm superseded by `.claude/meta/`, then `git rm`
  - `AGENTS.md` → confirm superseded by `.claude/agents/`, then `git rm`
  - `2026-AHA-Stroke-guideline.md` (root) → confirm `docs/2026-AHA-Stroke-guideline.md` is canonical, then `git rm` root copy
  - `project_tree.txt` → `git rm` (stale snapshot, safe to remove)
- **Required artifacts:** none (Class C, non-clinical)
- **Acceptance checks:** git status shows only intended moves/removals · no clinical data files touched · no broken imports · tsc clean · build green
- **Audit source:** [librarian.md F: DOC-1, DOC-2, DOC-3](docs/reviews/full-repo-agent-audit/agents/librarian.md) · [cleanup-log.md](docs/reviews/full-repo-agent-audit/cleanup-log.md)

#### Phase 8C — Remove orphaned worktrees from disk — Class B
- **Priority:** P2
- **Status:** deferred — rm -rf blocked by sandbox permissions; directories are gitignored and harmless
- **User-visible goal:** none
- **Non-goals:** do not touch `.claude/agents/` · do not touch any production source files
- **Owner agents:** orchestrator (direct shell execution)
- **Command:** `rm -rf .claude/worktrees/agent-ab9d815fae22ee79d .claude/worktrees/vibrant-dewdney-4f0ed7`
- **Required artifacts:** none (Class B)
- **Acceptance checks:** `.claude/worktrees/` directory is empty or absent · no other worktrees affected
- **Audit source:** [cleanup-log.md](docs/reviews/full-repo-agent-audit/cleanup-log.md) · [system-architect.md F: ARCH-2](docs/reviews/full-repo-agent-audit/agents/system-architect.md)

#### Phase 8D — SEO metadata: fix titles, descriptions, sitemap — Class C
- **Priority:** P2
- **Status:** [x] satisfied 2026-05-23 — re-audited routeManifest + sitemap. All 43 routeManifest entries pass spec §7.1 (0 titles >60 chars, 0 descriptions >160 chars, 0 duplicate titles). All 11 calculator URLs in sitemap resolve to live manifest paths (no orphan redirect targets). Sitemap URL count: 168, all static URLs cross-check against the manifest. The original 2026-05-13 audit findings were addressed across the SEO sessions of 2026-05-14 through 2026-05-21.
- **User-visible goal:** Trial/calculator pages display correctly-lengthed SEO titles and descriptions in search results; sitemap URLs resolve (no 404s for crawlers)
- **Non-goals:** no structured data authoring in this task; no clinical content changes
- **Owner agents:** seo-specialist
- **Files likely touched:** `src/config/routeManifest.ts` (trim 7 titles to ≤60 chars; trim 14+ descriptions to ≤160 chars; fix duplicate title on `/guide/stroke-basics` vs `/pathways/stroke-code`) · `public/sitemap.xml` (remove 6 /calculators/… redirect target URLs; add correct /pathways/… URLs)
- **Files forbidden:** all `src/data/` · all `src/pages/guide/`
- **Required artifacts:** seo-specialist sign-off
- **Acceptance checks:** all routeManifest titles ≤60 chars · all descriptions ≤160 chars · no two routes share identical title · sitemap URLs all resolve to live routes (no 404s) · check:routes validates (route count unchanged) · tsc clean · build green
- **Audit source:** [seo-specialist.md F: SEO-1, SEO-2, SEO-3](docs/reviews/full-repo-agent-audit/agents/seo-specialist.md)

---

> **Current recommended next tasks (2026-05-13):** Phase 1 through 2A are all merged. Next unblocked work: (1) NIHSS normal-exam UX shortcut (Class C), (2) L5.5 calculator audit (read-only), (3) Phase 4D compliance pages (Class C), (4) W6.5.1 GrottaBarChart (Class C) to unblock ENRICH rebuild, (5) W6.9 predecessor chain wiring (Class C). See docs/CONTENT_AUDIT.md §10 for full recommended order.

---

### EVT result/action de-clutter to PM spec — Class D-clinical — DONE commit d59ee42
- **Status:** merged (commit d59ee42)
- **User-visible goal:** The EVT Decision step previously stacked four competing result surfaces (floating "Decision Support" card, fixed action bar with legacy black "Copy to EMR" button, eligibility drawer, tab bar). Now collapsed to ONE: the drawer's expanded panel holds the verdict + single house-style "Copy to EMR" button + folded clinical content (MeVO risk box [isMevo-gated], "Decision Support Only" disclaimer with auto-linked trials, three 2026 peri-procedural pearls, Clinical Context Summary).
- **Non-goals:** EMR-note logic (buildEmrText/copySummary) unchanged; verdict logic unchanged; clinical text relocated byte-for-byte, no new claims authored.
- **Files:** src/pages/EvtPathway.tsx (UI consolidation). Drawer panel height raised 45dvh → 68dvh; legacy black button removed; action bar de-fixed (static Back + Start Over at decision step); all verdict logic untouched.
- **Acceptance checks:** tsc clean · build green (171 routes prerendered) · claims hook passed (clinical text byte-identical) · mobile-first 375px sign-off (drawer expanded panel readable) · clinical post-execution gate PASS (docs/reviews/clinical-evt-declutter.md, approve-with-conditions, all conditions resolved).
- **Clinical impact:** medium (decision-support surface clarity; EMR output unchanged).
- **Rollback plan:** git revert <merge commit> restores the pre-declutter result layout.
- **Reviews:** docs/reviews/arch-evt-declutter.md (architect, approve-with-conditions); docs/reviews/clinical-evt-declutter.md (clinical-reviewer, approve-with-conditions + post-exec PASS).

### Pathway auto-advance — open the next slot automatically — Class D — DONE commit ad7f44e
- **Status:** merged
- **What shipped:** Fixed the "choppy" step-pathway flow (V-reported on EVT + Extended IVT — selecting a value did not open the next slot; multiple identical empty slots gave no "fill this next" cue). Root cause: `PathwayCategoryRow` read `defaultOpen` only at mount (`useState(defaultOpen)`). Now it opens on every `defaultOpen` false→true transition (transition-detected, never fights close-on-select or a manual close), with a reduced-motion-gated `scrollIntoView` on auto-open, and the stale "Tap to select" label dropped while a row is open. Wired `defaultOpen` on the rows that lacked it, each mirroring the row's own value field: ExtendedIVT (15), Migraine (3), SE (1); EVT was already 16/16. Migraine Renal kept closed-by-default (pre-answered safety override, not a sequential slot); two SE rows left as-is (always-defaulted). Interaction-only — no clinical option/threshold/branch/verdict changed (diff is `defaultOpen` props + the primitive effect). Architect approve-with-conditions (docs/reviews/arch-pathway-autoadvance.md). Live regression at 375px: auto-advance works on EVT + ExtendedIVT, manual-close sticks, cascade-clear re-cascades with exactly one row open, EVT unchanged. tsc clean · build green (171 routes) · claims clean · 206 tests. Rollback: one-unit `git revert`.

### Phase 7E — NIHSS normal exam shortcut + live State B drawer — Class C — DONE commit 9c52fe9
- **Status:** merged
- **What shipped:** "Normal exam" shortcut button (sets all 15 items to 0, opens drawer). Live State B drawer — interpretation updates as user scores items before completing all 15. Drawer now shows severity label + running NIHSS total in real time.

### L5.5b — Add portal drawer to ASPECTS, HAS-BLED, RoPE, Boston Criteria — Class C — DONE commit fe650d8
- **Priority:** P1
- **Status:** merged
- **What shipped:** Portal drawer (State A→C state machine, content-before-button order, `left: var(--nav-rail-width, 0px)`) added to ASPECTS, HAS-BLED, RoPE, Boston Criteria. Inline interpretation blocks removed from main and relocated into drawer content. All 4: hasInteracted state tracking. No clinical copy changes. tsc clean · build green · claims clean.

---

## CONFIRMED CLEAN
- [x] 2026-07-01..02 — Clinical semantic-validity audit + full remediation — Class E/C/D-clinical. Full-repo semantic audit (docs/2026_07_01/clinical-semantic-audit.md): 128 candidates → 80 confirmed / 29 false-positive / 9 uncertain, via parallel Sonnet find + Fable adversarial verify (workflow wf_b4f18d2a). Remediation shipped in gated batches (each fix medical-scientist re-verified + clinical-reviewer gated, all Gate-6 green): Wave 1 high-severity 22 fixes (cf06d4b); ASPECTS 3-5 two-tier EVT interpretation (9653b0b, docs/reviews/clinical-aspects-evt-two-tier.md); Batch A StrokeBasics HERMES stats + 2022 ICH reversal citation consolidation into aha-asa-2022-ich-anticoag-reversal (826adb8, docs/reviews/clinical-batchA-hermes-ich.md); Waves 2-3 medium/low 34 + 4 reviewer-flagged (c4bae15, docs/2026_07_01/wave23-remediation-report.md). SWIFT PRIME cOR corrected to 2.63 (V-confirmed); NINDS mRS 0-1 to 39/26 with NNT 7.7; DEVT/OPTIMAL-BP/PRISMS/RESCUE-BT CIs; ECASS-3 sICH definition de-fabricated; post-thrombolysis TXA contradiction fixed. ~63 of 80 findings remediated. Follow-up round 2026-07-02 closed out (commit e3f63e1; docs/reviews/clinical-audit-resolution-2026-07-02.md + docs/2026_07_01/resolution-report.md): 3 new fixes (TRACE-III relative-rate CI + info field; bp-control §4.3 description tightened), 8 items confirmed already-correct (validating the earlier waves), ELAN listCategory antiplatelets→acute (matches TIMING/OPTIMAS), CREST-2 duplicate brott-crest-2-2025 deleted (brott-crest-2-2026 canonical). Independently re-verified by 8 adversarial verifiers (workflows wf_635582ec, wf_e9f31607); clinical-reviewer synthesis approve-with-conditions (0 blocking), both conditions (CREST-2 ARD sign convention; TRACE-III label) resolved pre-merge. ELAN dedicated-enum decision parked for V (see PARKING LOT 2026-07-02). Deferred: basilar-EVT guideline COR/LOE grade (held for V, sources disagree on single COR 1 vs 1/2a split and LOE A vs B-R); untagged-surface data-claim tagging (data-architect); 2 trial efficacyResults display restructures; CHA2DS2-VASc score-7 rate anomaly. Deterministic floor (tsc/claims/chains/routes/card-meta/humanizer/build) green throughout; audit covered the semantic layer §13.1 hooks cannot check.
- [x] 2026-06-10 — NIHSS window chip → 3 tiers + resolve §4.6.3 citation conflation — Class E (clinical citation) (commit e7a1f13). Window chip expanded to green "Within 4.5h" / orange "4.5–9h window" / red "Beyond 9h" (V request). First clinical review BLOCKED: the orange tier cited aha-asa-2026-4.6.3, whose quote is the late-window-TNK-for-LVO recommendation (4.5–24h, Class IIb), not the 4.5–9h perfusion-selected extended IVT window; also surfaced a pre-existing registry conflation (§4.6.3 mistitled "Extended-window IVT" + a live trials-page card mis-citing it). Resolution (V-approved): added EXTEND (PMID 31067369) + WAKE-UP (PMID 29766770) trial citations (the 4.5–9h evidence base, COR 2a); corrected §4.6.3 title to match its quote (late-window TNK for LVO); re-pointed ivt-window-4.5h extended tier and late-window-selection-guideline-summary (live /trials/q/late-window-selection card) off §4.6.3 to EXTEND/WAKE-UP; fixed stale §4.6.3 code comments. Used stroke-guidelines skill as source of truth (no web research, per V). Re-review APPROVE (trial titles/years/PMIDs/quotes affirmed; §4.6.3 consistent; live page corrected; citations fresh). All 3 tiers verified live. QA: tsc clean, build 171/171, claims/chains/routes/card-meta/humanizer pass, Gate 6 PASS. Artifact: docs/reviews/clinical-PR-nihss-thrombolysis-timing.md.
- [x] 2026-06-10 — NIHSS BP prompt gated to the 4.5h window only — Class C-clinical (commit 09a1ece). The elevated-BP prompt now appears only when the patient is confirmed inside the standard 4.5h window; out of window, or before LKW is entered, no BP prompt (the <185/110 target is pre-thrombolysis-specific). Surfaces without the timing aid keep the generic note. Verified live (out-of-window 200/120 → no prompt; in-window → "If thrombolysis planned: BP goal <185/110"). QA: tsc clean, build 171/171, all hooks pass, Gate 6 PASS. Documented in the clinical artifact.
- [x] 2026-06-10 — NIHSS thrombolysis-timing aid (time since onset + 4.5h window chip + BP goal) — Class C-clinical (commit 84b8692). Opt-in `showThrombolysisTiming` on the shared PatientContextPanel (NIHSS only): when a witnessed LKW is set, shows "~H h M min since onset" + emerald "Within 4.5h" (amber "N min left" in the final 30 min) vs amber "Beyond 4.5h"; wake-up/unknown LKW shows a muted no-clock note. Existing elevated-BP note made window-aware: "If thrombolysis planned: BP goal <185/110" in window (V wording choice after clinical-review flagged the original "Thrombolytic candidate" as overclaiming eligibility), generic threshold note otherwise. Copy export gains only the since-onset line (chips are screen-only, per V). New claim `ivt-window-4.5h` (aha-asa-2026-4.6.1/4.6.2); `bp-ivt-threshold-185-110` description synced. Verified live both paths + copy intercept. QA: tsc clean, build 171/171, claims/routes/chains/card-meta/humanizer pass, Gate 6 PASS. Clinical review approve-with-conditions, both conditions addressed (docs/reviews/clinical-PR-nihss-thrombolysis-timing.md).
- [x] 2026-06-10 — NIHSS copy template dedupe: "Neurology Evaluation" no longer repeats "Exam Performed" — Class C (commit 96f4ab4). The two are the same workflow event kept in sync; the timestamp-block line is now skipped when it equals performedAt and there is no Code Activation anchor (no elapsed offset to convey). Kept when a Code Activation anchor exists (carries a door-to-eval "+Xm" offset). Verified via copy intercept. QA: tsc clean, build 171/171, all hooks pass, Gate 6 PASS.
- [x] 2026-06-10 — Calculator hub: Severity + Risk groups open on first load; rows indented under category — Class C (commit 376c72a). DEFAULT_OPEN_CATEGORIES drives the initial accordion state; pl-[18px] on the section body nests each row dot under the category title. Verified 375px. QA: tsc clean, build, all hooks pass, Gate 6 PASS.
- [x] 2026-06-10 — Calculator headers responsive at 375px + NIHSS copy button restored — Class C (commit e3c9f4b). CalculatorHeader: optional scoreDisplay; Save/Copy/Send icon-only on mobile (<640px), icon+label on sm+. NIHSS: Rapid/Detailed toggle moved to secondaryRow; onCopy wired. ShareButton pill made responsive to match. Verified 375/390/414/768px across NIHSS, ABCD2, GCS, ASPECTS, ICH (no overlap). QA: tsc clean, build 170/170, all hooks pass, Gate 6 PASS.
- [x] 2026-06-09 — Trial enrichment wave 2 COMPLETE — all 34 uploaded trials now carry `fullEligibility` + `armDetails`. Final batch (0603272): SAMMPRIS, EAGLE, OPTIMAS, TIMING + TRIAGE-STROKE curated corrections. Safety corrections surfaced + fixed across the wave: MR ASAP SBP threshold 120→140, ESCAPE-NA1 arm-note CI 1.14→1.13, TRIAGE-STROKE scale RACE→PASS + planned N 424→600. SAMMPRIS + CHARM published corrections reviewed (neither altered a displayed value). 8 batches total (e7f6ce9..0603272), each clinical-reviewer-gated + Gate-6 green. Full log: docs/reviews/clinical-enrichment-wave2.md. — Class C-clinical
- [x] 2026-06-08 — EVT enrichment wave: `fullEligibility` + `armDetails` on all 24 thrombectomy trials (NINDS, ECASS III, ESCAPE, DEFUSE-3, DAWN, ASTER, ASTER2, COMPASS, CHOICE, DISTAL, ESCAPE-MeVO, MR CLEAN, MR CLEAN-NO IV, RESCUE BT, SELECT2, SWIFT, SWIFT-PRIME, TREVO, TREVO 2, PROST, PROST-2, BEST, NOR-TEST, NOR-TEST 2) — Class C-clinical (commits b83af5d EVT batch 1, d2abd41 EVT batch 2, 8bf31e8 EVT batch 3, 6f3e9d1 EVT batch 4; pilot 4fbb914 + c1146eb). QA all batches: tsc clean · build 171/171 · claims/routes/chains/card-meta pass · Gate 6 live-verify PASS per push · clinical-review approve/approve-with-conditions per batch (docs/reviews/clinical-evt-batch{1-4}.md + clinical-evt-batch1-eagle-ecass3.md). Evidence packets: docs/evidence-packets/2026-06-08-evt-batch{1-4}.md. Post-flight follow-ups: evt-curated-circulation-fix (Class E/`-clinical`, P1, medium-high severity); evt-curated-summary-cluster (Class `-clinical`, P2, low-severity, reconcile curated summaries); compass-registry-vs-conduct (P3, optional UI label); control-arm-appendix-granularity (optional owner decision).
- [x] 2026-06-08 — Trial arm enrichment from PDFs: `armDetails` on 5 pilot trials (NINDS, ECASS III, ESCAPE, DEFUSE-3, DAWN); Study Arms accordion relocated under Primary Outcome — Class C-clinical (commit c1146eb). QA: tsc clean · build 171/171 · claims/routes/chains/card-meta pass · Gate 6 live-verify PASS · clinical-review approve-with-conditions (docs/reviews/clinical-trial-arm-enrichment-pilot.md). Post-flight follow-ups: escape-primary-or-reconcile (rescoped label-only, pending owner sign-off); ninds-eligibility-fulltext-verify (DONE, confidence Medium→High); trial-control-arm-appendix-granularity (optional deepening, pending owner decision on appendix sourcing).
- [x] 2026-06-08 — Trial full eligibility + study arms accordion pilot (DAWN, DEFUSE-3, ECASS III, ESCAPE, NINDS) — Class D-clinical (commit 4fbb914)
  - Live verify: PASS — `/trials/dawn-trial`, `/trials/defuse-3-trial`, `/trials/ecass-3-trial`, `/trials/escape-trial`, `/trials/ninds-trial` all render with new EligibilityCriteriaCard + InterventionArmsAccordion components; full eligibility tabs behind "Show full criteria" disclosure; arm details in controlled accordion. NINDS NCT-ID corrected (was `NCT00000292` → publication path). tsc clean; vite build 171/171 prerendered; check:claims/routes pass. Architect approve-with-conditions (all folded); clinical approve; mobile-first approve; a11y approve. All gates green. Post-merge Gate 6 live-verify PASS (site live on prod).
- [x] 2026-06-05 — Actionable follow-ups batch (Wave 1 + Wave 2 from the pending re-verify) — Class C (commits 5b4fad9, 63b6228, f4cb1e7, e72e62a)
  - Wave 1 (5b4fad9): focus-trap parity — OnboardingTour + InstallPromptOverlay now use the shared useModalFocusTrap (adds the Tab-cycle trap both lacked); a persistent footer "Replay tour" link wired to consent.replayTour; trackDisclaimerShown/Acknowledged self-guard on consent not being 'declined'. Dead replayOnboardingTour export removed.
  - Wave 2a (63b6228): guard-clinical-edit.mjs is now task-class-aware — walks up to TASKS.md, reads ## ACTIVE, stays silent when a Class E/-clinical task is active, warns otherwise. Still advisory (exit 0, never blocks).
  - Wave 2b (f4cb1e7): Phase 4F — Privacy data-inventory now category-complete (grouped "App preferences and first-run flags" row, no PII; restored "every category is listed" statement). compliance-legal approve. Corrected an earlier note: em-billing:provider is a sessionStorage role enum (not PII); case-transfer-v1 + json-ld are not stored keys.
  - Wave 2c (e72e62a): Paragraph now accepts a data-claim prop so guide prose is scannable. Finding: the scanner needed no change (its jsx pattern is element-agnostic); the gap was the component prop. Retro-tag of IchManagement/IvTpa deferred to a clinical-reviewer-gated follow-up (scanner entry now [~] partial).
  - Gates: tsc clean, 166/166 tests, check:humanizer PASS (no em-dashes), check:claims/routes/card-meta green. Wave 1 Gate 6 live-verify PASS; Wave 2 verified on push below.
- [x] 2026-06-05 — Geo-gated analytics consent: opt-in EU/UK/CH/BR, default-on elsewhere — Class D (commit 374ecc3)
  - V follow-up: opt-in-everywhere analytics was tanking GA coverage. Made consent geo-gated. Strict opt-in regions = EU-27 + EEA + UK + Switzerland + Brazil (Brazil per V's decision); default-on (notice + opt-out) for US/India/rest of world; unknown region fails safe to opt-in. Search Console unaffected throughout.
  - Mechanism: /api/geo serverless fn returns the country from Vercel x-vercel-ip-country (Cache-Control no-store; HTML stays CDN-cacheable). consent.ts owns STRICT_COUNTRIES + regionForCountry + analyticsEnabled (single rule, unit-tested). useConsentRegion caches the country so later visits resolve with no fetch and no flash.
  - Compliance build-ins (compliance-legal, 4 blocking findings resolved): GA loads with allow_google_signals:false + allow_ad_personalization_signals:false (CPRA "sharing"); unloadGA disables GA in-session on opt-out; persistent "Privacy choices" footer control on every page (PrivacyChoices + Layout); PrivacyPage rewritten (geo behavior, default-on disclosure, CCPA to CCPA/CPRA "sale or share", GDPR scope adds CH+BR, Last updated 2026-06-05).
  - Reviews (docs/reviews/): system-architect approve-with-conditions (met: /api/geo over middleware, no-store, analyticsEnabled single source, flash-gated, revert-safe); compliance-legal approve (all blocking resolved). ADR-2026-06-05-geo-gated-analytics-consent.
  - Copy vetted with humanizer (V-directed): no em-dashes (check:humanizer PASS, 0 errors), third-person ("NeuroWiki uses..."), active voice.
  - Gates: tsc clean, 166/166 tests, build 171/171 prerendered (exit 0), check:humanizer PASS, pre-commit hook green. Rollback: additive + revert-safe (no storage migration). Gate 6 live-verify pending on push.
  - Follow-up: India DPDP monitoring (PARKING LOT; review trigger 2027-01-01 or rules-notified).
- [x] 2026-06-05 — Humanizer em-dash pass on the headache pathway (V-directed) — Class C-clinical (commits 389574e UI, a32083d engine)
  - 389574e (result/treatment UI): removed the 3 rendered em-dashes — the partial-match caveat ("Partial match — confirm" → "Partial match: confirm"), the differential caption (em-dash clause split into two sentences), and the drawer "your selections" annotation (em-dash → parenthetical). Caveat registry description updated to match. clinical-reviewer punctuation-confirm: approve.
  - a32083d (engine src/data/clinicHeadacheData.ts): content-writer swept 61 em-dashes from clinical prose strings (criterion descriptions, teach pearls, teachWhenSelected, eyebrow, 3 indomethacin labels) to colon/period/comma; 47 code-comment em-dashes left exempt. PUNCTUATION ONLY: mechanical normalized-diff proved word-content byte-identical, en-dash ranges untouched (34 to 34), 84/84 engine tests pass. Clinical gate (docs/reviews/clinical-headache-engine-emdash-sweep.md): approve — every rendered pearl + the 3 labels preserve meaning, the two load-bearing contrasts kept as commas, no clause relationship altered, no dose/threshold change.
  - Gates: tsc clean, build 171/171, check:claims + check:humanizer pass (humanizer now clean on the pathway), Gate 6 live-verify PASS on both pushes. Result: zero em-dashes in any rendered headache-pathway string; the remaining em-dashes are code comments only.
- [x] 2026-06-05 — Dedicated post-tour install pop-up (revived, correctly sequenced) — Class C (commit f06959d)
  - V follow-up to the consent-bar redesign: with the disclaimer now a non-blocking bar, a single install pop-up is no longer an obstruction. V chose (AskUserQuestion) "dedicated pop-up after the tour" over keeping install buried as the tour's last slide (skippers never saw it).
  - New InstallPromptOverlay: flashy "add to your phone" pop-up that fires ONCE, AFTER the tour finishes/skips (new TOUR_COMPLETE_EVENT), installable devices only; reuses the shared InstallActions. Sequenced after the tour so the two first-run modals never stack (the deleted overlay's original bug was firing before the tour). OnboardingTour reverted to 5 orientation slides + emits TOUR_COMPLETE_EVENT on dismiss. Constants centralized in consent.ts (INSTALL_OVERLAY_SHOWN_KEY bumped v2→v3 for a fresh one-time show).
  - Reviews: accessibility-specialist + mobile-first pass-with-conditions; applied — AA contrast (text-white/90 subtitle), max-h-[85dvh] + scroll for short viewports, role=dialog + Escape + focus in/return + 44px targets (mirrors the accepted tour dialog pattern).
  - Gates: tsc clean, 159/159 tests, build 171/171 prerendered (exit 0), pre-commit hook green. Gate 6 live-verify pending on push.
  - Deferred follow-up: focus-trap parity — neither the tour nor this overlay traps Tab focus (both role=dialog). Not a new regression (matches the accepted tour); add a shared focus trap (useModalFocusTrap) to BOTH modals together in one pass.
- [x] 2026-06-05 — Headache pathway: treatment moved into on-row "Show management" expander — Class D-clinical (commit e8805ef)
  - Per-phenotype dosing relocated VERBATIM (43 Row strings byte-identical, mechanically diffed) from the inline page block into new keyed src/components/pathways/headache/HeadacheManagement.tsx; SectionHeader/Row helpers moved with it. HeadacheResultList: each match row gains a collapsed opt-in "Show management" native <details> (collapsed by default on every row incl. top). The 8 ICHD-3 criteria cards deleted from the page (criteria render once in the row); 7 pure-criteria claims kept as hidden literal data-claim markers (the scanner matches only literal data-claim, not the dynamic accordion map), ndph's criteria claim tagged on its management card. ClinicHeadachePathway inline treatment block removed (−167 lines), unused CriteriaList import dropped. Engine, drawer, questionnaire, red-flag short-circuit untouched.
  - Clinical-display policy (V request + clinical gate): management shown for ALL matches including weak/partial (decision-support; clinician selects by judgment), gated only by whether the phenotype has a card (10 of 11), NO match-strength floor. Anti-anchoring guard: a fixed strength-gated caveat "Partial match — confirm the diagnosis before initiating. Criteria are not yet met for this phenotype; dosing is shown for reference." at the top of partial-row management only (new claim clinic-headache-partial-match-caveat → ichd3-2018, authored/confirmed by medical-scientist). Chronic-migraine-probable (displayed "Partial" but a genuine probable match) correctly does NOT show the caveat (matchStrength-gated, not tag-gated) — confirmed clinically correct at the post-exec gate.
  - Gates: tsc clean, build 171/171, 84/84 engine tests, check:claims/chains/routes/card-meta/humanizer pass. Architect review approve-with-conditions (docs/reviews/arch-headache-treatment-onrow-expander-stage-one-b.md). Clinical pre-execution gate approve-with-conditions (4 conditions) + post-execution gate APPROVE (docs/reviews/clinical-headache-treatment-onrow-expander*.md). a11y + mobile fresh-context sign-offs: applied in-scope fixes (summary min-h-44, caveat role=note); deferred dosing-card markup a11y (dl/dt/dd, h4) + 375px long-value wrapping to a follow-up to keep the clinical relocation byte-for-byte. ADR docs/adrs/2026-06-05-headache-treatment-onrow-expander.md. Gate 6 pre-push live-verify PASS + client-side drive PASS (caveat verified on Cluster 25% partial; Migraine 100% shows dosing, no caveat).
- [x] 2026-06-05 — First-visit consent bar: replace blocking disclaimer modal + cookie banner; fold install into tour — Class D-clinical (commit 6b85c60)
  - V feedback: the first-visit flow was "too much clicking" (cookie bar + blocking disclaimer modal + install overlay + tour + bubble = 5 interruptions) and the install prompt "did nothing." Replaced the blocking DisclaimerModal AND CookieConsentBanner with one non-blocking FirstRunConsentBar; folded the install prompt into the onboarding tour as a platform-aware slide; deleted the standalone InstallPromptOverlay. Net flow: usable site → one bottom bar (one explicit tap) → optional skippable tour with install.
  - Compliance-preserving (compliance-legal approve, 9/9 conditions): acceptance stays EXPLICIT (HCP checkbox + Continue disabled until checked, not implied/continued-use); analytics UNBUNDLED (separate pre-unchecked opt-in; declining never blocks Continue; GA loads only on accept); two existing keys kept byte-for-byte so already-accepted users are never re-prompted; DISCLAIMER_VERSION re-acceptance preserved; required disclosures kept on-surface.
  - New src/lib/consent.ts (React-free, 8 unit tests) + InstallActions (shared install status→UI mapping, used by the tour slide + InstallBubble). TermsPage "Patient data and PHI" reconciled with the v3.0 disclaimer (removed the contradictory "not approved for handling PHI" line — this was the compliance blocking issue).
  - Reviews (docs/reviews/): system-architect approve-with-conditions (met), compliance-legal approve, clinical-reviewer approve, accessibility + mobile-first pass-with-conditions (all conditions applied — AA contrast, aria-describedby, live-region step announcements, Escape + focus return, 44px targets). ADR-2026-06-05-first-visit-consent-bar.
  - Gates: tsc clean, 159/159 tests, build 171/171 prerendered (exit 0), pre-commit hook green (claims/chains/routes/card-meta). Rollback: revert-safe (consent keys keep exact names + JSON shape → no re-prompt on revert). Gate 6 live-verify pending on push.
  - Deferred follow-ups: (1) [P2] Class B — self-guard trackDisclaimerShown/trackDisclaimerAcknowledged on `CONSENT_STORAGE_KEY === 'accepted'` (compliance advisory; defensive vs. future GA pre-load). (2) "Replay tour" affordance placement — `replayOnboardingTour()` retained + exported; no clean global footer exists (desktop rail vs mobile drawer), awaiting V's preferred spot. (3) Optional — mirror Privacy's absolute-vs-offset timestamp nuance in the Terms summary (wording clarification, no DISCLAIMER_VERSION bump).
- [x] 2026-06-04 — Privacy page: correct storage-key names + drop false exhaustiveness claim — Class C (commit 7195306)
  - Triggered by the PWA fix (37bccf8) follow-up. Audit of the /privacy "What data we collect" table against actual code found it was broadly inaccurate while claiming "Nothing is omitted." Fixed the 3 misnamed keys verified against source: consent `neurowiki:consent` → `neurowiki-analytics-consent` (CONSENT_STORAGE_KEY, analytics.ts), favorites `neurowiki:favs` → `neurowiki:favorites:v1` (useFavorites.ts), disclaimer `neurowiki:disclaimer:v1` → `neurowiki-disclaimer-accepted` (DISCLAIMER_STORAGE_KEY). Also corrected the cookie-consent revoke instruction (named the wrong key). Replaced the false "Nothing is omitted" line with honest non-exhaustive wording.
  - Scope per V decision (AskUserQuestion: "Fix names + drop the claim"): name corrections + claim removal only; full ~15-key enumeration + em-billing provider-name (mild PII) disclosure deferred to Phase 4F. No clinical content, claim, citation, or scoring touched.
  - Gates: tsc clean, build 171/171 prerendered (exit 0, /privacy re-rendered), pre-commit hook green (claims/chains/routes/card-meta). Gate 6 pre-push live-verify pending on push.
- [x] 2026-06-05 — Headache clinic pathway result screen: ranked phenotype accordions — Class D-clinical (commit c885da2)
  - Replaced the three stacked result blocks (large headline card + differential ribbon + multi-diagnosis banner) in src/pages/ClinicHeadachePathway.tsx with a single ranked accordion list: new src/components/pathways/headache/HeadacheResultList.tsx (one accordion per ICHD-3 phenotype, top match open by default, trials/calculator density, 3px neuro-500 accent on the top row) + extracted shared src/components/pathways/headache/CriteriaList.tsx (single source for the accordion and the page's inline treatment cards). Empty-match fallback restyled to match. Engine, chipsFromState, questionnaire (Frames 1–2), red-flag short-circuit, bottom drawer, citation footer, and all data-claim treatment cards left untouched.
  - Verbatim-only: every displayed result string (general disclaimer, differential caption, multi-diagnosis guidance, chronic-migraine-probable section/label exception) relocated byte-for-byte; no clinical wording authored or changed (check:claims green, no claim surface added or removed). Built headache-specific rather than reusing MapperPanel because MapperMatch cannot represent contributingChipLabels (the "Based on your selection" audit trail) or the chronic-migraine exception — named fork + consolidation exit documented in the HeadacheResultList header and ADR docs/adrs/2026-06-05-headache-result-accordions-stage-one.md.
  - a11y (fresh-context review, 2 blockers + 3 should-fix all applied): criteria-met bar made decorative (aria-hidden) so it no longer pollutes the disclosure button's name; result live region narrowed to an sr-only status node so accordion expand/collapse no longer re-announces the whole result; amber tag chip darkened to amber-800 for contrast; focus-visible ring + touch-manipulation + items-start on the trigger.
  - Gates: tsc clean, build 171/171 prerendered (exit 0), 84/84 engine regression tests pass, check:claims/chains/routes/card-meta + check:humanizer all pass. Architect review approve-with-conditions (docs/reviews/arch-headache-result-accordions-stage-one.md; all conditions met). Mobile (375px) + interactive a11y sign-offs applied. Gate 6 pre-push live-verify PASS (4 routes); Gate 6 client-side drive PASS — migraine case rendered "Consistent · Migraine without aura · 4 of 4 · §1.1 · 100%" open with the "Based on your selection" audit trail, "Partial · Cluster headache · 1 of 4 · §3.1 · 25%" collapsed.
  - Follow-up (tracked in headache-clinic-stage-one-screen-build): treatment link-out — replace inline data-claim management cards with links (next increment, Class D-clinical); Stage Two result-copy — band words, non-collapsible SNNOOP10 disclaimer, "considered and set aside" tray, citation footer (Class E-clinical).
- [x] 2026-06-04 — PWA install: revive install overlay + onboarding tour, add iOS-non-Safari path — Class C (commit 37bccf8)
  - Root cause: InstallPromptOverlay and OnboardingTour both gate on a `neurowiki:disclaimer:v1 === '1'` localStorage flag that nothing ever wrote — DisclaimerModal records acceptance as a JSON object under a different key (`neurowiki-disclaimer-accepted`). Result: both first-run surfaces, plus the disclaimer's "Show install prompt" replay link, were silently dead for every user since they shipped. V report: "iPhone … a small line 'show install' but when you click it nothing happens … too subtle."
  - Fix: DisclaimerModal now writes the `neurowiki:disclaimer:v1` flag on accept AND backfills it on mount for users who accepted before the flag existed, then dispatches a `neurowiki:disclaimer-accepted` event so the overlay surfaces immediately without a reload.
  - iOS non-Safari (Chrome/Firefox/Edge → CriOS/FxiOS/EdgiOS + in-app webviews): new `ios-other-browser` status in usePwaInstall + `openInSafari()` (x-safari- scheme bounce) and `copyAppLink()` helpers. Overlay + disclaimer row show "Open in Safari" with an always-visible "Copy link" fallback + "Share → Add to Home Screen" hint — Add to Home Screen is Safari-only on iOS, and the x-safari- bounce is undocumented/unreliable on older iOS, hence the mandatory fallback.
  - Sequencing: reviving the tour (it shares the same flag) would otherwise stack it under the overlay (z-95 vs z-94) on every returning user's home load. usePwaInstall gains a `ready` flag that settles the async `beforeinstallprompt` before judging installability; OnboardingTour now shows only once the overlay has had its turn (`OVERLAY_SHOWN_KEY` set) or can never apply on this device — so the two first-run modals never co-display.
  - Scope: UI/PWA only. No clinical content, claim, citation, scoring, or disclaimer/PHI prose touched (clinical disclaimer body byte-identical). InstallBubble left unchanged — iOS-non-Safari users fall through the same as their prior `unsupported` state, so no behavior change there.
  - Gates: tsc clean, check:claims/chains/routes/card-meta pass, build 171/171 prerendered (exit 0). Gate 6 pre-push live-verify PASS (homepage + GCS + dawn-trial + tpa-timing). Files: src/hooks/usePwaInstall.ts, src/components/{DisclaimerModal,InstallPromptOverlay,OnboardingTour}.tsx.
  - Follow-up deferred: PrivacyPage.tsx (~line 81) wrongly states acknowledgment is stored as `neurowiki:disclaimer:v1` — one-line doc fix, left untouched here because that file is currently mid-edit on another work stream.
- [x] 2026-06-04 — Headache clinic pathway engine: rank-and-flag + near-miss display. Class E-clinical (commit 6585a71)
  - Engine refactor of src/data/clinicHeadacheData.ts (~1,096 lines) + regression contract (clinicHeadacheData.test.ts, 84 tests all passing). Implements ranked phenotype matching with flagged near-misses for criteria shortfalls, minimum-evidence display floors (§1.1 migraine, §2.2 episodic-tth, §3.1 cluster), aura-laterality rewire (moved from incorrect headache-pain-laterality keying to dedicated `aura-symptom-unilateral` chip), and "considered and set aside" silent-exclusion set (tth-D, ctth-D, cm-C emit with neutral exclusion note rather than dropping silently). Phase 1 scope: engine logic + regression gates only; band-word result copy + Stage-Two phenotype-label UI deferred. Dev-time invariant added: engine throws if any future phenotype lacks a suppression-gate, trial-pending flag, or evidence floor. All 9 ICHD-3 clinic-headache claims remain registered to `ichd3-2018` citation; no claim text changed. Clinical impact: medium (phenotypes that were silently omitted now surface as actionable near-misses, guiding clinicians toward diagnostic confirmation steps).
  - Gates: tsc clean, build 171 routes prerendered / 0 failed, regression test suite 84/84 (all pass), claims hook green (zero unregistered claims, all citations within window), architect review approve-with-conditions (3 conditions met: role vocabulary consistent, minimum-evidence floors valid, safety invariants intact), pre-execution clinical review approve-with-conditions (10 binding conditions met incl. aura-laterality NON-NEGOTIABLE rewire), post-execution clinical review APPROVE (line-by-line fidelity check, all 10 verified). Gate 6 live-verify: PASS — /pathways/headache-clinic route returns 200 and renders client-side; the engine produced a correct 4-of-4 Consistent "Migraine without aura" result through the live UI. Probable near-miss surfacing is pinned by the 84-test regression suite; it was not re-driven through the mapper UI because the mapper resets dependent fields when a foundational field changes.
  - Follow-up Phase 2 deferred (logged below): Stage-Two screen copy + indomethacin-pending near-miss UI affordance.
- [x] 2026-06-04 — ASCVD calculator added to sitemap + prerender (indexability fix) — Class C (commit 2583960)
  - Drift fix: routeManifest had `ascvd-risk` with includeInSitemap:true + published:true + full meta, but the hand-maintained public/sitemap.xml (single source of truth for prerender per scripts/prerender.mjs) never got the entry — same manual step that was done for /calculators/mrs on 2026-05-28 but skipped for ASCVD. Result: the calculator worked client-side but was invisible to Google + AI crawlers (SPA-shell fallback, generic title).
  - Added the `<url>` entry (priority 0.7, monthly). No page content or metadata authored — the title/description already existed in the manifest; this only exposes the existing page to indexing.
  - Gates: tsc clean, build 171/171 prerendered (was 170, exit 0), check:claims/chains/routes/card-meta pass. Local prerender confirmed correct title: "ASCVD 10-year Risk Calculator (Pooled Cohort Equations) | NeuroWiki". Gate 6 pre-push live-verify green (homepage + GCS + 2 trials). Live ASCVD confirmed: Vercel deploy of 2583960 succeeded; https://www.neurowiki.ai/calculators/ascvd-risk serves title "ASCVD 10-year Risk Calculator (Pooled Cohort Equations) | NeuroWiki" with full content.
- [x] 2026-06-04 — Analytics instrumentation: disclaimer-shown funnel + calculator_used undercount fix — Class C-clinical (commit 70b4720)
  - Origin: GA4 weekly read flagged two gaps — (1) `disclaimer_acknowledged` 6 vs `first_visit` 37 (no "shown" denominator), (2) `calculator_copied` 53 vs `calculator_used` 11 (usage undercounted). Diff drafted by external agent (Codex) per approved analytics plan; verified + gated in-repo per §6 (audit ≠ approval).
  - analytics.ts: added `trackDisclaimerShown()` gtag event. DisclaimerModal.tsx: fires only on modal-open path. NihssCalculator + AscvdRiskCalculator: wired `useCalculatorAnalytics` (`trackResult` on result, `resetTracking` on reset). ASCVD payload rounding (`toFixed(1)`) confined to the event — never feeds displayed score or tier decision.
  - Analytics-only. No scoring, thresholds, interpretation text, or citations changed. clinical-reviewer: approve (docs/reviews/clinical-analytics-instrumentation-2026-06-04.md); independently confirmed semantic invariance on both calculators.
  - Gates: tsc clean, build 170/170 (exit 0), check:claims/chains/routes/card-meta pass. Gate 6 live-verify PASS (pre-push hook: homepage + GCS + dawn-trial + tpa-timing). Post-deploy spot-check: /calculators/nihss 200 + correct prerendered title.
  - Follow-up parked: /calculators/ascvd-risk is a registered client-side route but absent from the sitemap → not prerendered, invisible to search + AI crawlers. Pre-existing SEO gap, unrelated to this change.
- [x] 2026-06-03 — Unused-import sweep across src/ — Class C (commit dc3a6ad)
  - Removed unused `React` default imports from 30 files (tsconfig uses the automatic JSX runtime, so the namespace import is dead unless referenced) plus unused named imports scoped to their own statement (SubSection/Value/Critical from guide pages, Zap/Stethoscope/LinkIcon, LinkItem from autoLink, ELAN_CONTENT from ElanPathway). Two idempotent codemods added: scripts/codemod-strip-unused-react-import.mjs + scripts/codemod-strip-unused-named-imports.mjs.
  - No clinical content, copy, claim, or citation touched — dead import bindings only; render byte-identical (build prerendered all 170 routes, 0 failed).
  - Gates: tsc --noEmit clean, build 170/170 (exit 0), check:claims/chains/routes pass. Gate 6 live-verify: PASS — homepage + GCS calculator + /trials/dawn-trial + /trials/q/tpa-timing all 200 (pre-push hook).
- [x] 2026-06-03 — TrialTitleHeading tone-enum cleanup — Class C (commit a45ce1d)
  - Replaced the `color: string` prop with a `tone: 'positive' | 'neutral' | 'harm'` enum; component now owns its color vocabulary via TONE_COLORS (positive #1746A2 / neutral #1e293b / harm #7f1d1d). Codemod (scripts/codemod-trial-title-tone.mjs) converted 105 call sites: 79 positive, 11 neutral, 12 isPositive ternary, 3 isHarm ternary; 0 stray color=.
  - Render neutrality: title-H1 region diffed across all 108 prerendered trial pages → MATCH=108, DIFF=0. No trialMetadata-derived text changed; no claim surface touched.
  - Reviews: system-architect approve (docs/reviews/arch-PR-trial-title-tone-enum.md), clinical-reviewer approve (docs/reviews/clinical-PR-trial-title-tone-enum.md). Closes condition #6 of arch-PR-trial-title-heading-extraction.md.
  - Gates: tsc clean, build 170/170 (exit 0), check:claims/chains/routes pass. Gate 6 green (pre-push live-verify).
- [x] 2026-06-03 — TrialPageNew duplication extraction: Phase 1 TrialHeaderBar + Phase 2 TrialTitleHeading — Class D-clinical (commits 4d4dfad, 0580a8b)
  - Phase 1 (4d4dfad): extracted sticky header bar (back button + category badge), 103 byte-identical inline blocks → shared src/components/trials/TrialHeaderBar.tsx via codemod (scripts/codemod-trial-header-bar.mjs), 4 batches, net −823 lines.
  - Phase 2 (0580a8b): extracted page title H1, 105 byte-identical compact blocks → shared src/components/trials/TrialTitleHeading.tsx via codemod (scripts/codemod-trial-title-heading.mjs), net −209 lines. Title/subtitle remain expression bindings (trialMetadata.title/subtitle or tm alias, same-object backreference guaranteed by regex); resolved heading color passed as `color` prop (4 variants: #1746A2 ×79, isPositive ternary ×12, #1e293b ×11, isHarm ternary ×3). Tone-enum cleanup parked as architect follow-up.
  - Render neutrality: title-H1 region extracted + hashed/diffed across all 108 prerendered trial pages → MATCH=108, DIFF=0 (region-isolation method immune to asset-hash noise). 3 excluded headers confirmed intact (EXTEND expanded multiline h1, "Trial Not Found", catalog-fallback year span).
  - Reviews: system-architect approve-with-conditions (docs/reviews/arch-PR-trial-title-heading-extraction.md), clinical-reviewer approve (docs/reviews/clinical-PR-trial-title-heading-extraction.md) — no trialMetadata-derived clinical text changed, no claim surface touched.
  - Gates: tsc clean, build 170/170 prerendered (exit 0), check:claims/chains/routes pass. Gate 6 live-verify: PASS — homepage + GCS calculator + /trials/dawn-trial + /trials/q/tpa-timing all 200 (pre-push hook), confirmed /trials/aramis-trial title H1 renders via new component.
- [x] 2026-05-28 — Pre-stroke mRS chips + NIHSS header redesign + BP tPA alert + timestamp popovers + mRS picker modal + sitemap fix — Class C + C-clinical (commits e49dd06, 222a66c, 1b85817, b94357f)
  - Pre-stroke mRS inline chips (7 number circles 0–6) added to PatientContextPanel; new MRSGrade type + prestrokeMrs field on PatientContextValues. 
  - NIHSS header redesign: fixed crowded header; truncated name div; moved Rapid/Detailed toggle + Save + Send to secondaryRow; restored NIHSS total in scoreDisplay.
  - BP tPA threshold alert: amber inline chip when SBP ≥185 OR DBP ≥110. Citation aha-asa-ivt-bp-threshold (PMID 31662037) registered; claim bp-ivt-threshold-185-110 in claims.ts. Clinical review artifact at docs/reviews/clinical-PR-bp-alert.md (approve).
  - Timestamp popovers on 4 GWTG-tracked events (Door-to-CT, Door-to-Needle, Door-to-Puncture, Groin-to-Reperfusion) with clickable CheckCircle icons expanding inline popovers (metric name, threshold windows, source).
  - mRS picker modal: new MrsPickerModal.tsx component; "Pre-stroke mRS" label in PatientContextPanel opens bottom-sheet with full 7-grade list; bidirectional sync with inline chips.
  - Sitemap fix: /calculators/mrs was missing from public/sitemap.xml; added entry + PHASE_1_ROUTES entry. Now 170 routes prerender.
  - All surfaces use plain-language copy per humanizer rule (no em-dashes).
  - Gate 6 live-verify: PASS on all 4 changed route components post-deploy.
- [x] 2026-05-24 — My Favorites page + smarter TrialsPage search + stroke-code favoritable — Class C (commit pending)
  - New /favorites route with categorized Calculators / Pathways / Trials sections. Reads useFavorites localStorage, resolves IDs via new src/lib/favoritesRegistry.ts (single source of truth mapping calc/pathway IDs to title+path; trials resolved via findTrialById). Empty state with quick links to /calculators, /pathways, /trials. FavouritesStarButton now navigates to /favorites on non-/trials routes; on /trials it preserves the existing ?favs filter behavior. Stroke Code pathway now has its own favorite star in the sticky header (previously the only pathway without one). TrialsPage local search gains an "Other matches" block that surfaces calculator/pathway matches inline (closes V "calculators not showing up when I type NIHSS" feedback — the global ⌘K overlay does return them, but the local /trials search wasn't surfacing them). Route count 43→44.
- [x] 2026-05-24 — Prerender deploy fix (www. subdomain) + UX-audit Wave 4 WCAG 2.1 AA — Class C (commits 34df248 + 4626b16)
  - 34df248: scripts/prerender.mjs regex extended to /^https?:\/\/(?:www\.)?neurowiki\.ai/ so the canonical www-prefixed sitemap URLs are stripped before concatenating with http://localhost:4173. Fixes 100% prerender failure that aborted Vercel deploy of 4626b16. All four UX-audit waves were sitting in unshipped commits until this landed.
  - 4626b16: Wave 4 (focus management on step transitions, role="alert" on clinical alerts, modal status banner explicit aria-live + aria-atomic, section eyebrows promoted to h3, red-600→red-700 + slate-400→slate-500 contrast nudges, fieldset+legend on disabling symptoms, role="group" on anticoag chips, accessible names on NIHSS Calc + LKW row).
- [x] 2026-05-24 — UX-audit Waves 1–3 — Class C (commits 206ee42 + 9e66ef4 + 5995692)
  - Wave 1 (206ee42): BL-1 Step 1 CTA double-fire fix (eligibilityChecked gating), BL-2 terminal "Code Documented" state + Start New Code button, H-1 Edit pencil pill on rail-collapsed back buttons.
  - Wave 2 (9e66ef4): H-6 Step 3 panel order inverted (Summary before Orders), H-10 embedded CodeModeStep4 footer hidden + auto-save on toggle, H-3 CTA/LVO gated on CT result, H-9+M-1 WindowBadge minutes-left countdown <30 min, H-7 disabling-symptoms decision pill, H-4+H-5 PatientContextPanel lockExpanded, H-2 weight not required on DAPT path, H-8 BP alert respects bpControlled, H-11 sticky context bar, H-12 ProtocolModal chassis-aligned, L-1+L-3 polish.
  - Wave 3 (5995692): touch targets — back arrow, NIHSS close X, Code/Study toggle, LKW month-nav + calendar cells, eligibility Copy/Cancel, StudyPearlsButton all ≥44px. LKW body-scroll lock. Eligibility footer flex-wrap.
- [x] 2026-05-24 — Stroke Code PM-spec audit + chassis sweep + D-clinical em-dash humanizer — Class C + D + D-clinical (commits 5bf4d01 + 838ab2e + 90b5a83 + cd73c11)
  - 5bf4d01: Step 3 + Step 4 chassis-align, getCategoryClasses refactored to chassis tokens, PM-spec doc + architect §17.1 artifact.
  - 838ab2e: 5 modal frames chassis-tinted (Protocol, Extended IVT, Eligibility, LKW picker, NIHSS), Eligibility status banner converted to chassis-variant per arch condition #1.
  - 90b5a83: PM-spec sweep CLOSED.
  - cd73c11: 3 em-dashes inside Step 4 clinical rationale strings replaced with semicolons/parentheses; §17.2 clinical review artifact at docs/reviews/clinical-PR-step4-rationale-humanizer.md with character-precise diff.
- [x] 2026-05-24 — Patient Info dropdown chassis migration + Andexxa US withdrawal + em-dash sweep — Class D + E-clinical (commits d4fade8 + fd6c345 + 8bcf176 + ccc438c + 2781eb9 + 1dfd5e7 + f35f255 + 64647c9 + dea7494)
  - Architect-reviewed PatientContextPanel chassis (d4fade8), last-anticoag-dose row + Step 1 alert restyle (fd6c345), Step 2 + Step 3 alert chassis (8bcf176), NIHSS + Weight folded into Patient Info as extraRows (ccc438c), Step 2 primary card chassis (2781eb9), pre-Step-2 surfaces chassis (1dfd5e7).
  - f35f255: ICH FXa-reversal synthesis rewritten for FDA Nov-2024 advisory-committee finding + AstraZeneca Dec-2025 withdrawal; 2 new citations + §17.2 clinical review at docs/reviews/clinical-PR-andexxa-withdrawal.md.
  - 64647c9: em-dash sweep on strokeClinicalPearls.ts (7 instances); trial-questions.ts 133 em-dashes confirmed all in code comments; 3 Andexxa follow-ups parked.
  - dea7494: Anthropic 2026 agent-infra adoption — CLAUDE.md §18 Writer/Reviewer fresh-context rule + tightly-coupled-serial rule; clinical-trial-audit + routing skills get paths auto-load; humanizer gets disable-model-invocation; .husky/pre-push live-verify hook (Gate 6 deterministic) + verify-calculator skill.
- [x] 2026-05-24 — Register CHARM 2024 + AHA/ASA 2026 §6.3 citations — Class C (commit 1eed841)
  - Hemicraniectomy clinical synthesis was already complete; my grep undercount (regex missed unquoted object keys) prompted investigation that produced 2 new registry entries. `sheth-charm-2024` (Lancet Neurology 2024) and `aha-asa-2026-6.3` (Supratentorial Infarction Surgical Management) now available; existing hemicraniectomy-synthesis claim can adopt them in a future clinical-reviewer pass.
  - **Full coverage confirmed: 23 of 23 trial questions now have either a `<GuidelineSummaryCard>` (16) or `<ClinicalSynthesisCard>` (7).**
- [x] 2026-05-23 — Legend slice backfill on remaining 61 trials — Class C-clinical-editorial (commit f8b7057)
  - Now 108/108 trials carry a legend slice per TRIALS_SPEC §L6.1. Mechanical derivation from existing fields (bedsidePearl → bottomLineSummary → keyMessage for `finding`; calculations.nnt → effectSize.value → absoluteReduction for `bottomLineTag`; effectSize.value for `keyStat`). Judgment-call cases flagged in commit message for future clinical-reviewer pass.
- [x] 2026-05-23 — NIHSS LVO-in-EMR toggle + CalcRef on Meningitis — Class C-clinical (commit a2c513d)
  - Closes deferred audit BLOCKING `nihss-emr-include-lvo`. Default-off checkbox above the Copy button (only rendered when raceScore > 0); when on, buildText appends `LVO probability: <label> (RACE n/9, p%)`. Plus second production use of `<CalcRef>` on Meningitis GCS prose mention.
- [x] 2026-05-23 — Phase 2B CIs on ARD + Phase 7D.2 NIHSS interpretation prose + Phase 4E/8D status updates — Class E + Class C (commit 2537872)
  - Phase 2B: 95% CIs added to ARD stat tiles for NINDS (OR CI proxy), DEFUSE-3 ([verification pending] flag), DAWN (95% CI 24–47), CHOICE (95% CI 0.3 to 36.4). New `absoluteReduction.info` annotation per trial explains source and any caveats.
  - Phase 7D.2: four severity-band prose paragraphs (Minor 1–4 / Moderate 5–15 / Moderate-severe 16–20 / Severe ≥21) added to NIHSS portal drawer with new `nihss-severity-interpretation-2026` claim citing §4.6.1 + §4.7.2 + §4.8.
  - Phase 4E (CalcDisclaimer standardization): re-audited; satisfied by existing CalculatorFooter shared component. Status marked done.
  - Phase 8D (SEO metadata audit): re-audited routeManifest + sitemap; 0 violations. Status marked done.
- [x] 2026-05-23 — SE aria-live + CalcRef component + DEFUSE-3 endpoint label + legacy agents cleanup — Class C + Class E + Class D (commit af1cf02)
  - Closes item #8 a11y batch on StatusEpilepticus dose computation region. New `<CalcRef>` primitive + first production wire on IchManagement GCS prose. Phase 2C DEFUSE-3 primaryEndpoint 'mRS 0-2' → 'mRS shift'. Phase 8A legacy /agents directory deleted.
- [x] 2026-05-23 — Pathway aria-live regions on ELAN + Migraine — Class C a11y (commit ecef77e)
  - Wraps `step 4 result` (ELAN) and `step 5 MOH discharge screen` (Migraine) in role=status + aria-live=polite + aria-atomic=true. WCAG 2.1 SC 4.1.3 coverage.
- [x] 2026-05-23 — Stroke Basics workflow guide-page inline trial linking — Class C (commit 6ccf985)
  - 4 trial-name wraps added (EXTEND / DAWN / DEFUSE-3 / WAKE-UP) across 2 evidence accordion paragraphs in StrokeBasicsWorkflowV2.tsx. 13 other guide pages had no eligible catalog-resolvable trial mentions (legitimate finding — not in stroke trial scope).
- [x] 2026-05-23 — Speed-ranked backlog items 1-6 (8 trial Archetype A rebuilds + 23 legend backfills + Calculator→trial UI + stroke-code non-disabling branch) — Class C-clinical + Class E-clinical (commit bc29987)
  - Archetype A rebuilds: THEIA, IST, CAST, PRoFESS, ANNEXA-I, ANNEXA-4, Sarode 2013, PATCH. First batch legend backfill (23 trials). New `<CalculatorTrialEvidence>` component wired on 4 STRONG-confidence calculators (NIHSS, ASPECTS, ICH Score, RoPE). Stroke Code Step 1 non-disabling-deficit branch: when NIHSS ≤3 and no disabling symptoms checked, surfaces §4.6.1 + §4.8 DAPT recommendation — closes the LAST HIGH-impact BLOCKING from the AHA/ASA 2026 audit.
- [x] 2026-05-23 — NIHSS Exam Performed / Neurology Evaluation sync — Class E-clinical (commits 7e736aa + 1f6b6bf)
  - V bug report: EMR output showed Exam Performed at 4:35 PM and Neurology Evaluation at 4:42 PM. Both represent the same workflow event. Bidirectional 'earlier-wins' sync now keeps the two values aligned across all 4 input ordering scenarios (NIHSS first / auto-stamp first / inline edit earlier / inline edit later).
- [x] 2026-05-23 — Final 2 GuidelineSummaryCards (aspiration-vs-stentriever + evt-adjunct-pharmacotherapy) — Class C-clinical (commit b81fde5)
- [x] 2026-05-23 — 3 clinical syntheses + 15 new citations (hemicraniectomy + ich-surgery + icas-stenting) — Class C-clinical (commit 410a73b)
- [x] 2026-05-23 — Phase 3 GuidelineSummaryCard rollout — 6 more questions + first multi-citation card — Class C-clinical (commit d0734a0)
- [x] 2026-05-23 — Collapse ClinicalSynthesisCard body paragraphs by default — Class C UX (commit 61c7d4b)
  - V request: synthesis prose was filling the viewport like an article; default-collapsed disclosure keeps the headline + bottom-line callout always visible with a "Read full synthesis" toggle. Same treatment NOT applied to GuidelineSummaryCard (already compact).
- [x] 2026-05-23 — Phase 2 GuidelineSummaryCard rollout + 4 PFO precursor trials — Class C-clinical (commit 0fc027e)
- [x] 2026-05-23 — Thrombolytic timestamp + GWTG color-coding + 3 clinical syntheses (PFO, asymptomatic carotid, ICH anticoag reversal, CRAO) — Class C-clinical (commit 89a298c)
- [x] 2026-05-23 — ClinicalSynthesisCard pattern + PFO closure synthesis pilot — Class C-clinical (commit f82d7d1)
- [x] 2026-05-23 — Old-format trial Archetype A rebuilds (PFO trio + EXTEND-IA TNK + RESCUE-Japan LIMIT + CREST pair + ICH reversal quartet + THEIA + foundational aspirin trio) — Class C-clinical (commits ea6487e / 364fa9b / cbf93da / e10dabd / 0870a78)
  - All 15 old-format trials identified in the 2026-05-23 audit now render with Archetype A. Zero remaining.

- [x] 2026-05-22 — Task B Phase 1A pathway recommendation drawer pilot — Class D (commit 2266981)
  - New PathwayRecommendationDrawer primitive at src/components/article/stroke/PathwayRecommendationDrawer.tsx (variant-aware, COR badge slot, simpler state than calculator drawer). Available for future pathway migrations.
  - Extended IVT pathway: retired the inline 'Not Eligible'/'Eligible' result card (the one V flagged in the 2026-05-22 screenshot). Enriched the existing CalculatorDrawer at viewport-bottom to render the full verdict (status + COR badge + reasoning + details + contraindication callout) in its expanded body. Auto-expands on first transition to State C for discoverability.
  - Pattern proven on one pathway; rolling to ELAN + Stroke Code + EVT pathways is Task B Phase 1B (follow-up).
- [x] 2026-05-22 — ELAN §4.9 COR chip rebuild — Class C-clinical (commit 7d22260)
  - Audit BLOCKING elan-cor-chip-rebuild. Replaced 250-char text stuffed in uppercase label slot with proper chip 'AHA/ASA 2026 §4.9 · COR 2a' + verbatim quote at body weight + italic editorial caveat.
- [x] 2026-05-22 — ECASS-3 3-4.5h exclusion chips retired — Class E-clinical (commit 51536b9)
  - Follow-up ecass-3-exclusions-modernize. EXTENDED_WINDOW_CHIPS array reduced to empty; render section now informational banner noting AHA/ASA 2026 §4.6.1 harmonization. Valid exclusions (warfarin INR, DOAC, >1/3 MCA) already in HARD_STOP_CHIPS.
- [x] 2026-05-22 — Stroke Code pearls + Path C wake-up caveat — Class E-clinical (commit 48e4071)
  - Two BLOCKING items bundled (related surfaces). treatment-windows-quick + large-core-evt-quick pearls now carry 4 mirror qualifiers for ASPECTS 3-5 (COR 1 LOE A 6-24h) and 0-2 (COR 2a LOE B-R 0-6h). Extended IVT Path C eligible result branches on onsetMode: wake-up surfaces 'extrapolation from TRACE-III' caveat.
- [x] 2026-05-22 — ABCD² DAPT cross-reference — Class E-clinical (commit 4fbc8f6)
  - Audit BLOCKING. Moderate (4-5) and high (>=6) tier explanations now lead with §4.8 DAPT (COR 1 LOE A; CHANCE/POINT/INSPIRES) instead of just 'consider admission'.
- [x] 2026-05-22 — Stroke Code antiplatelet 24h soften — Class E-clinical (commit 945f520)
  - Audit BLOCKING. Step 3 accordion text now surfaces §4.8 row 1 (uncertain first 24h) and row 2 (90-min IV aspirin Harm) as separate graded statements.
- [x] 2026-05-22 — Age >80 ECASS-3 chip removed — Class E-clinical (commit 86ebe26)
  - Audit BLOCKING. Age >80 chip + label entry removed from IVT modal. 2026 + IST-3 evidence support IVT benefit in this group.
- [x] 2026-05-22 — Hypoglycemia threshold 50→60 mg/dL — Class E-clinical (commit bd3399b)
  - Audit BLOCKING. NINDS-era language updated per §4.5 (COR 1 LOE C-LD). §4.5 citation expanded to verbatim all 3 rows.
- [x] 2026-05-22 — ASPECTS COR 2a correction — Class E-clinical (commit 270a5a7)
  - Audit BLOCKING. ASPECTS 0-2 and 3-5 interpretation strings now carry all 4 mirror qualifiers + correct COR/LOE. Calculator no longer paints COR 2a 0-2 EVT as 'exceptional.' Clinical-reviewer approve with all 3 conditions addressed in diff.
- [x] 2026-05-22 — Phase 1A GuidelineSummaryCard pilot + §4.8 backfill + composition ADR — Class C-clinical + Class E-clinical (commit 00199fb)
  - Backfilled real AHA/ASA 2026 §4.8 (Antiplatelet — DAPT for minor noncardioembolic AIS) citation in registry — closes the gap clinical-reviewer flagged as C5 informational follow-up. Verbatim text from page e62 of source PDF.
  - New ADR-2026-05-22-guideline-summary-card-composition.md locks in claim-level multi-section composition (option a from arch-citation-aha-2026-4.9 review). No schema change; existing ClaimEntry.citation_ids:string[] already supports it.
  - Phase 1A pilot: new <GuidelineSummaryCard> component on /trials/q/anticoagulation. Renders verbatim §4.9 recommendation text + COR badge + source link from CITATION_REGISTRY. Single-citation case validates rendering layer. 22 other questions retain "Curated answer in progress" banner until Phase 2 authors their summaries.
  - QA: tsc clean · build green (165/165 prerender) · claims hook clean · chains 5/5 · routes 43.
- [x] 2026-05-22 — Citation correctness: AHA/ASA 2026 early-DOAC ID §4.8 → §4.9 — Class E-clinical (commit db4aac7)
  - Direct PDF read (V supplied source) confirmed early-DOAC-in-AF recommendation lives in §4.9 (Anticoagulants), not §4.8 (which is Antiplatelet Treatment). Citation ID renamed; verbatim text from page e68 replaces placeholder; ELAN pathway soft label hardened at 4 occurrences (result card, accordion, EMR copy text).
  - Architect review docs/reviews/arch-citation-aha-2026-4.9-2026-05-22.md (approve-with-conditions, no blockers). Clinical review docs/reviews/clinical-PR-citation-aha-2026-4.9-2026-05-22.md (approve-with-conditions, 4 conditions C1-C4 all addressed in diff: AIS gate preserved, registry title updated, LOE held back per Option B precedent, EMR copy text updated).
  - LOE deliberately omitted from on-screen prose pending separate LOE-column verification from PDF.
- [x] 2026-05-22 — Sleep Onset LKW picker iPhone glitch fix + free-text time entry — Class C (commit c3d2ecc)
  - Added ManualTimeInput to each of the two Sleep Onset drum rows (parity with the Specific Time tab's typed-time box). Bedtime and wake-time now accept "11:25 PM" or "23:25" with drums + AM/PM toggle staying in sync.
  - iPhone glitch fixes on ScrollCol: overscroll-behavior: contain + touch-action pan-y so a fling in one drum cannot bleed momentum into adjacent drums or modal body; cancel in-flight snap timer on touchstart so a re-grab during snap doesn't fight the user.
  - Bumped Sleep Onset drum itemH 44→48 to clear iOS Safari's effective 44pt tap target inside the scrollable modal body.
  - Moved sleep-onset validation error out of the scrolling body so the iOS soft keyboard for the new typed inputs cannot push it off-screen.
- [x] 2026-05-22 — NIHSS anticoag chip row: add "None" option — Class B (commit 93ff0d3)
  - Added 'none' to Anticoag union + ANTICOAG_LABELS in PatientContextPanel and NihssCalculator. Mutual-exclusion semantics: picking None clears DOAC/Warfarin/Antiplatelet; picking any positive clears None.
- [x] 2026-05-13 — L5.6 CalculatorShell extraction — Class D (Phase 1: 3f1bdc5 · Phase 2: 4b61105 · Phase 3: 5572551)
  - All 9 spec-v1.1 calculators migrated onto shared shell: Abcd2, Aspect, Boston, GCS, HAS-BLED, Heidelberg, ICH, NIHSS, RoPE.
  - New shared infrastructure (8 files, +593 lines): Chevron, BackArrow, CalculatorDrawer (owns portal + State A/B/C + animation classes + stateBTappable + justCompleted), CalculatorToast (z-[60] portal), CalculatorHeader (ReactNode scoreDisplay slot, secondaryRow slot, scoreAriaLabel per architect C3), CalculatorFooter (citation + disclaimer + optional related slot), useDrawerState (discriminated-union input: binary | partial-complete, returns state/drawerOpen/reset/toast/showToast), severityTokens (interface + shared shadow constants + getInlineSeverityColor utility).
  - Architect review approve-with-conditions: docs/reviews/arch-l56-calculator-shell.md. All conditions C1-C6 applied or filed as follow-ups. ADR-008 documents the 3 trade-offs (interface-only severity-token consolidation, ReactNode-slot header, discriminated-union drawer hook).
  - Net: ~-811 lines across page files; +593 lines shared shell. Total duplication retired: ~7 inline copies of Chevron/BackArrow/drawer/header/footer/toast/severity scaffolding.
  - Phased commits (architect Q7): one commit per phase covering all 9 files. Reverts apply in reverse order (Phase 3 → 2 → 1).
  - One known visual delta: NIHSS State C collapsed stat color now neutral text-slate-900 (aligns with other 8 calculators per spec; severity still communicated via score number color in sticky header).
  - Accessibility improvements: Boston, HAS-BLED, RoPE gained proper scoreAriaLabel strings.
  - QA gates each phase: tsc clean · build clean · check:claims clean · check:routes 42 validated.
  - Mobile QA at 375px: ready (mobile-first-developer ran post-Phase-3, 16-item gate including L5.6-specific checks for drawer-chevron-hint animation, NIHSS two-row header, ReactNode scoreDisplay variants).

- [x] 2026-05-13 — L-dm-cleanup — global dark-mode removal (Class C) — pending commit SHA
  - Removed all `dark:*` Tailwind utility classes across 44 source files (1,583 tokens stripped). Removed the `@custom-variant dark` block + `.dark .glass-card` + `.dark .active-pill` rules from index.css. Finalizes the previously-decided light-only theme that had been only partially cleaned up.
  - No theme toggle ever existed; no behavior change visible to users.
  - New file: `scripts/strip-dark-mode.mjs` (one-shot cleanup tool, idempotent).
  - QA gates: tsc clean · build clean (TrialPageNew chunk -12 kB) · check:claims clean · check:routes 42 validated.
  - Class C — mechanical multi-file UI cleanup, single domain, no architect review needed per CLAUDE.md §18.
  - Cosmetic side-effect: some file-level comments mentioning "no dark:* in layout" had the `dark:*` token stripped, yielding awkward comment text. Not blocking; can be cleaned in future pass.

- [x] 2026-05-13 — L5.5e HAS-BLED + RoPE input UI rebuild (pending commit SHA)
  - HasBledScoreCalculator rebuilt to CALCULATOR_SPEC v1.1 Archetype 3: 8 risk-factor checkboxes consolidated into single "Risk factors" section with A3 row pattern (`bg-neuro-50` checked, `accent-neuro-500`, `divider-hair`); 3-option Warfarin/INR subgroup as A1 radio rows with dividers; bordered risk-badge replaced with inline severity text; removed riskColors dead const; all dark:* removed from layout
  - RopeScoreCalculator rebuilt to CALCULATOR_SPEC v1.1 Archetype 1: 6 age bands as vertical A1 radio rows (no grid); 5 "Other criteria" checkboxes as A3 rows with `divider-hair`; inline 3-band severity text for PFO-attributable percentage (emerald ≥60%, amber 40–59%, slate <40%); all dark:* removed from layout
  - Both: drawer infrastructure from L5.5b preserved byte-identical; hasInteracted state machine and portal positioning unchanged
  - No clinical interpretation prose changes — every word from hasBledScoreData.ts and ropeScoreData.ts preserved
  - Architect review reused from L5.5c (docs/reviews/arch-l55c-aspects-boston-rebuild.md) — same pattern, same conditions
  - QA gates: tsc clean · build clean · check:claims clean · check:routes 42 routes validated
  - Mobile QA at 375px: ready (mobile-first-developer sign-off, same 9-item gate as L5.5c)
  - Completes visual-system parity: all 9 existing calculators now on spec v1.1
- [x] 2026-05-13 — L5.5c ASPECTS + Boston Criteria input UI rebuild (pending commit SHA)
  - AspectScoreCalculator rebuilt to CALCULATOR_SPEC v1.1 Archetype 2: option-row pattern, tokenized section headers (`text-[10px] font-bold text-slate-400 uppercase tracking-widest`), divider-hair separators, rounded-full action buttons, removed "How to use" box + desktop 2-col grid + inline score summary
  - BostonCriteriaCaaCalculator rebuilt to CALCULATOR_SPEC v1.1 Archetype 3: A1 radio rows for Yes/No + lobar groups, A3 checkbox rows for pathology/WM/deep/other-cause, inputMode="numeric" on age input, rounded-full action buttons, all dark:* layout classes removed (light-only)
  - Both: drawer infrastructure from L5.5b preserved byte-identical
  - No clinical interpretation prose changes — every word from aspectScoreData.ts and bostonCriteriaCaaData.ts preserved
  - Architect review approve-with-conditions: docs/reviews/arch-l55c-aspects-boston-rebuild.md
  - QA gates: tsc clean · build clean · check:claims clean · check:routes 42 routes validated
  - Mobile QA gate: ready (mobile-first-developer ran in parallel)
- [x] 2026-05-13 — L5.5b portal drawer shell (fe650d8)
  - Added State A→C portal drawer to ASPECTS, HAS-BLED, RoPE, Boston Criteria
  - All 4: content-before-button, nav-rail-width positioning, hasInteracted state machine
  - tsc: clean · build: clean · claims: clean
- [x] 2026-05-13 — L5.5 + Phase 7E session — commits 9c52fe9, d430936, 72bb1ba, d83695b, 1985940
  - Phase 7E (9c52fe9): NIHSS normal-exam shortcut + live State B drawer
  - NIHSS design audit (d430936): emerald severity tokens, drawer content-order, State A text, py-3 header, flush-left shortcut, chevron regression introduced
  - Desktop drawer fix (72bb1ba): --nav-rail-width: 224px defined in index.css; NIHSS left:0 → var(); all 5 portal-drawer calculators clear desktop rail
  - IchScore drawer order (d83695b): content-before-button; chevron regression introduced
  - L5.5 (1985940): ABCD2 + GCS + Heidelberg content-before-button; NIHSS + IchScore chevron regressions reverted; QA: tsc clean · build green · claims pass · routes 42/42
- [x] 2026-05-13 — Phase 4D — Privacy/Terms/Accessibility pages (Class C) — commit 6090937
  - 3 new page components: src/pages/PrivacyPage.tsx, src/pages/TermsPage.tsx, src/pages/AccessibilityPage.tsx
  - src/App.tsx: 3 new lazy route imports + ROUTE_COMPONENTS entries for /privacy, /terms, /accessibility
  - src/config/routeManifest.ts: StaticRouteKey extended with 3 new routes; route count 39 → 42
  - src/components/layout/DesktopRail.tsx: footer links updated with Privacy · Terms · Accessibility + © 2026 Tidbit Health
  - QA: tsc clean · build 1.96s · claims pass · routes 42/42
- [x] 2026-05-13 — Governance modernization: CLAUDE.md v4.0 + 5 new skills + agent wiring + path corrections (Class D) — commit dbf1e48
  - CLAUDE.md v4.0: §19.0 Language Trigger Map (22 patterns); §10.1 swarm observability header; §12 expanded plugin skills (design:*, engineering:*); §21 stale paths fixed (router.tsx → App.tsx, trials/ subfolder removed)
  - New skills: design-tokens, testing-patterns, deploy, routing, compliance-public-medical
  - Agent frontmatter wired: ui-architect, quality-assurance, accessibility-specialist, system-architect
  - New agent: data-architect (resolves broken handoff referenced in clinical-reviewer, medical-scientist, CLAUDE.md §13.3)
  - Meta docs: Core 7 → Core 6, agents/active/ references removed from build-engineer + orchestrator
  - clinical-surfaces.md: removed non-existent src/data/trials/ and src/pages/calculators/ paths; added trialListData.ts, trial-questions.ts, TrialPageNew.tsx
  - QA: tsc clean · build green · claims hook pass · route check pass (39 routes)
- [x] 2026-05-13 — TASKS.md audit sync + CONTENT_AUDIT.md creation (Class B docs)
  - Synced 9 pre-shipped phases to [x] merged status: Phase 3C (af1dc24), 4A (6356c59), 4B (27e8b99), 5A (5d84715), 6A (94f0fce), 6B (9af24af), 7A (176c98e), 7B (176c98e), 7C (e5e6807)
  - Created docs/CONTENT_AUDIT.md — living roadmap: calculator audit table, trial question taxonomy (6 existing → 24 target), missing trial stubs, legacy rebuild priority order, compliance pages, W6.9 chain wiring status
  - Phase 7E (NIHSS normal-exam shortcut) added as planned task
  - Phase 8C status updated (sandbox blocked rm -rf; directories gitignored and harmless)
- [x] 2026-05-13 — Phase 7D + Phase 7D.1 — mobile touch targets + NIHSS spec alignment (Class C) — commit a7f13f7
  - Phase 7D: TrialLegendCard star button 44px touch target; StrokeBasicsWorkflowV2 safe-area CSS fix
  - Phase 7D.1: NihssCalculator.tsx full rewrite to CALCULATOR_SPEC v1.1 Archetype 2: two-row sticky header (Row 1: back+score+actions; Row 2: LVO cluster + mode toggle); portal bottom drawer via createPortal; severity-colored drawer states A/B/C; discovery animation; all touch targets ≥44px
  - QA: tsc clean · build green · live on Vercel (confirmed via screenshot 2026-05-13)
- [x] 2026-05-13 — Phase 7C — GrottaBarChart ARIA labels (Class C) — commit e5e6807
  - Added role="img" + aria-label to each bar segment; chart container accessible name
  - QA: tsc clean · build green
- [x] 2026-05-13 — Phase 7A + 7B — NIHSS radiogroup semantics + modal focus management (Class C) — commit 176c98e
  - Phase 7A: role="radiogroup" on item container; role="radio" + aria-checked on options; aria-live="polite" on score total
  - Phase 7B: role="dialog" + aria-modal="true"; focus trap; Escape key close; focus return to trigger
  - QA: tsc clean · build green
- [x] 2026-05-13 — Phase 6B — break trialData home-route coupling (Class D) — commit 9af24af
  - Dynamic import boundary in trialListData.ts; home route decoupled from full trialData
  - QA: tsc clean · build green
- [x] 2026-05-13 — Phase 6A — lazy-load chart archetypes in TrialPageNew (Class D) — commit 94f0fce
  - React.lazy() for DeltaBandChart, GrottaBarChart, BenchmarkThresholdChart, react-markdown, remark-gfm
  - QA: tsc clean · build green · chunk size reduced
- [x] 2026-05-13 — Phase 5A — Vitest setup + NIHSS + strokeDosing scoring tests (Class D) — commit 5d84715
  - vitest dep + test script in package.json; vite.config.ts test block; src/__tests__/ directory; NIHSS + strokeDosing tests
  - QA: npm test exits 0 · tsc clean · build green
- [x] 2026-05-13 — Phase 4B + 4C — disclaimer footers (Class C) — commit 27e8b99
  - Phase 4B: NIHSS in-page disclaimer footer added
  - Phase 4C: pre-existing (CodeModeStep1 + CodeModeStep2 already had "Reference only — verify against institutional protocol" text)
  - QA: tsc clean · build green
- [x] 2026-05-13 — Phase 4A — cookie consent gate before Google Analytics (Class D) — commit 6356c59
  - Conditional GA loading; consent banner component; localStorage persistence
  - QA: tsc clean · build green
- [x] 2026-05-13 — Phase 3C — tsc --noEmit added to pre-commit hook (Class C) — commit af1dc24
  - .husky/pre-commit extended; type regressions blocked at commit time
  - QA: tsc clean · build green · hook fires on deliberate type error
- [x] 2026-05-08 — Batch 3 Wave 2 — data population: 13 secondary-prevention trials (Class D-clinical) — commit 6bed2d6
  - Files: src/data/trialData.ts (108 lines inserted)
  - Populated: `primaryDesign` + `primaryResult` on 12 trials (ELAN null per schema contract); `harmSignal` on 6 trials (POINT, SAMMPRIS, SPS3, SPARCL, THALES, INSPIRES); `applicability` on all 13
  - Clinical-reviewer conditions all applied: SPARCL 1.9% (not 2.2%), THALES P<0.001 (not p=0.001), SPS3 not-met comment, INSPIRES+CHANCE-2 21-day DAPT explicit
  - Advisory follow-ups tracked in PARKING LOT: harmSignal claim tagging (blocked:awaiting-registry-population), OPTIMAS+INSPIRES cited HR/margin trail (blocked:awaiting-registry-population)
  - QA: tsc clean · build green ✓
- [x] 2026-05-08 — Batch 3 Wave 1 — schema extensions (Class D-clinical) — commit 657f004
  - Files: src/data/trialData.ts · docs/reviews/arch-batch3-wave1-schema-extensions.md
  - Shipped: `primaryDesign` union (+`'estimation-strategy'`, `'single-arm-registry'`), `primaryResult` union (+`'safety-threshold-met'`), `secondaryDesign`/`secondaryResult` parity, new `harmSignal?: string` field
  - JSDoc: legal `(primaryDesign, primaryResult)` pairing table, Option Y suppression list, safety-prose-field distinction
  - Arch review: approve-with-conditions (vocabulary-consolidation ADR deferred as non-blocking task)
  - QA: tsc clean · build green
  - Wave 2 follow-up: data population for 13 secondary-prevention trials (harmSignal for POINT, SPS3, SPARCL, THALES, INSPIRES; SAMMPRIS → harm-stopped; ELAN → estimation-strategy; WEAVE → single-arm-registry + safety-threshold-met)
- [x] 2026-05-08 — Wave 3 Batch 2 — renderer schema wiring (Class E-clinical) — commit 3d571ac
  - Files: src/pages/trials/TrialPageNew.tsx · docs/reviews/arch-wave3-batch2-renderer.md · docs/reviews/clinical-wave3-batch2-renderer.md
  - Shipped: schema-driven primary/secondary classification (replaced p-value heuristics), Option Y NNT suppression (ordinal-shift, NI, bayesian-NI, dose-finding-safety, estimation-strategy, single-arm-registry), new display branches (isHarmStopped, isNIFailed, isNIEstablished, isBayesianSuperiorityTrial), sidebar NNT card gating on suppressNNT flag, dev-mode invariant warning for partial schema migrations
  - Arch review: approve-with-conditions (classifier extraction to src/lib/trials/classifyTrial.ts deferred to Wave 4, type-safe cast replacement, EXTEND canary migration decision pending)
  - Clinical review: approve-with-conditions (5 mandatory conditions resolved pre-merge: harm-stopped distinct rendering, NI qualifier labels, Bayesian annotation wording, prose suppression targets card only, NOR-TEST data consistency fix) · 1 non-blocking follow-up (composition-site claim tagging for Bayesian annotation when locked)
  - QA: tsc clean · build green
- [x] 2026-05-07 — DOI integrity audit pass (Class C-clinical) — no commit (source-only fix; no new features)
  - Files: src/data/trialCatalogMeta.ts (P0: ATTENTION/BAOCHE DOI swap fixed) · src/data/trialData.ts (P1: 11 wrong doi: fields corrected via PubMed verification) · docs/trials-audit/verification-findings.md (created)
  - Corpus confirmed: 79 visible trials (55 manual + 24 legacy, no overlap) · 89 TRIAL_DATA records · 10 data-only records (product decision pending)
  - Critical find: SKIP trial doi was pointing to an unrelated nephrology paper (lanthanum carbonate dialysis trial); corrected to the actual JAMA 2021 thrombectomy paper
  - All DOIs verified via live PubMed API (DOI→PMID conversion + title confirmation)
  - Browser verification: /trials/skip-trial shows doi:10.1001/jama.2020.23522 · tsc clean
  - 15 clinical/statistical interpretation issues flagged for physician review — no content changes made pending that review (see docs/trials-audit/verification-findings.md §5)
  - Unresolved: 10 data-only records need product decision · validation script not yet created · primaryAnalysisType classification pending
- [x] 2026-05-07 — W8.1 back-button navigation polish (Class B) — commit 6ffcc21
  - Commit: trials-polish-and-cleanup-5g2 branch merged
  - Files: src/hooks/useNavigationSource.ts (boundary comment added) · src/pages/{EvtPathway, ExtendedIVTPathway, NihssCalculator, ResidentGuide, TrialsPage}.tsx (back button aria-label + padding) · src/pages/trials/TrialPageNew.tsx (recordView + back button touch target + HUB_SPEC trail slot comment) · docs/reviews/clinical-PR-pending-trials-recents-trail.md (§17.2 artifact NEW)
  - ResidentGuide three-pattern problem RESOLVED (pre-condition from arch-PR-pending-back-button-refactor.md now satisfied by useBackNavigation hook refactor)
  - Clinical review: docs/reviews/clinical-PR-pending-trials-recents-trail.md (approve) — no new claims, no citation changes, existing surface re-routed
  - QA: tsc clean · build green · navigate(-1) fallback verified
- [x] 2026-05-04 — Prompt 5d (Class C): Calculators hub rebuild per HUB_SPEC v1.2
  - New data file: src/data/calculators.ts (10 calculator entries with fnCategory severity/risk/classification + scoreRange/scoreLabel; FN_CATEGORIES metadata for section headers + pill row)
  - New components: src/components/calculators/{CalculatorsHero,CategoryPillRow,CategorySection}.tsx — reuse ToolRowCard from src/components/hub (no fork); section headers carry colored dot + count + lede; trail slot bolds the numeric max for severity/risk and shows scoreLabel for classification
  - src/pages/Calculators.tsx fully rewritten — drops legacy lucide hub, vascular/general categoryStyles map, ?favorites=true / ?id=… / ?open=… legacy redirects; uses ?category= URL param (deviates from HUB_SPEC §4 ?fn= to avoid collision with Home's ?scenario=) and ?favs=true; dynamic document.title per active category
  - 10 calculator detail pages now wire useRecents.recordView on mount: NihssCalculator, IchScoreCalculator, Abcd2ScoreCalculator, HasBledScoreCalculator, RopeScoreCalculator, GlasgowComaScaleCalculator, HeidelbergBleedingCalculator, BostonCriteriaCaaCalculator, EmBillingCalculator, AspectScoreCalculator
  - No CSS changes (.row-{severity|risk|classification}, .dot-{...} already present); no route manifest changes (zone/bottomNavTab/railItem already correct); no ToolRowCard fork
  - Gate: tsc clean · build green (2.17s)
- [x] 2026-05-04 — Prompt 5c (Class C): Home page rebuild per HOME_SPEC v1.4
  - New data files: src/data/scenarios.ts (5 scenarios + resolveTool helper + non-trial tool lookup map), src/data/featured.ts (3 V-curated tiles, build-time length check)
  - New hooks: src/hooks/useRecents.ts (neurowiki:recents:v1, hydrate-in-effect, storage-event subscription, cap 20/display 5), src/hooks/useTrending.ts (mulberry32+djb2 daily seed, no Math.random), src/hooks/useScenarioExpansion.ts (first-visit auto-expand of scenario 1 via neurowiki:home:hasVisited), src/hooks/useShowMore.ts (neurowiki:home:showMoreExpanded persisted)
  - New components: src/components/hub/ToolRowCard.tsx (universal row card per HUB_SPEC §1.6 — was missing from 5b), src/components/home/{HomeHero, FeaturedRail, FeaturedTile, ScenarioPillRow, ScenarioSection, ShowMoreToggle, RecentlyViewed, TrendingTrials}.tsx
  - src/pages/Home.tsx fully rewritten — drops legacy lucide grids and FEATURED_TOOLS/FEATURED_TRIALS arrays; uses useSearchParams for pill state, dynamic document.title for scenario active state
  - index.css gains .featured-tile media query for desktop equal-width
  - Surfaced for PM: (1) ToolRowCard was not built in Prompt 5b despite spec language assuming it; created here. (2) HOME_SPEC §1.4.3 lists ICH Management as type pathway, but route manifest only has /guide/ich-management — implemented as guide. (3) HOME_SPEC §1.25.7 example sets EVT-pathway href to /pathways/evt; instruction set used /pathways/evt-pathway (matches route manifest). home-reference.html mockup did exist after merge from layout-spec-and-rebuild.
  - Gate: tsc clean · check:routes 39 routes validated · build green (2.25s)
- [x] 2026-05-04 — Prompt 5b (Class C): chrome shell + .cat-* → .row-* rename + Pathways migration
  - Commit 1 (chrome shell): new src/components/layout/* (Layout, MobileHeader, MobileBottomNav, MobileDrawer, DesktopRail, DesktopTopBar, FavouritesStarButton, icons/{Calcs,Pathways,Guide,Trials}Icon) + src/hooks/useFavoritesFilter.ts; src/App.tsx import path; routeManifest gains Zone + NavTab types and zone/bottomNavTab/railItem on every route; index.css adds .zone-reading / .zone-reference / .rail-item-active and switches --tab-bar-height to 60px; scripts/validateRouteManifest.mjs enforces the new fields.
  - Commit 2 (rename + migration): index.css drops --cat-* tokens, adds .rowcard / .row-{slug} / .dot-{slug}; TrialLegendCard.tsx + TrialsPage.tsx switch from var(--cat-*) to hardcoded HUB_SPEC Appendix A hex; src/pages/Pathways.tsx placeholder hub; routeManifest swaps 7 /calculators/{slug} pathway entries for /pathways/{slug} + new /pathways hub; src/App.tsx adds Pathways lazy import + ROUTE_COMPONENTS keys + 8 client-side <Navigate> redirects; vercel.json gets a "redirects" block (8 permanent 301s); Home.tsx + ResidentToolkit.tsx pathway URLs updated; Calculators.tsx tools list dropped to calculators only; validateRouteManifest.mjs checks /pathways/stroke-code is required and that no pathway slug remains under /calculators.
  - Gate: tsc clean · check:routes 39 routes validated · build green
- [x] 2026-04-27 — W7.0 canary batch: IMS-III, SYNTHESIS Expansion, MR RESCUE predecessor stubs (§7c pattern)
  - TRIALS_SPEC §7c locked (stub page pattern: mandatory amber banner, prose-narrative outcome, no teaching wells, successorTrialId)
  - trialData.ts: 3 new stub entries + 6 new TrialMetadata fields (isStub, questionLede, primaryOutcomeProse, trialDesignNarrative, safetyBrief, successorTrialId)
  - TrialPageNew.tsx: renderStubPage helper + 3 id-gated branches (ims-iii-trial, synthesis-expansion-trial, mr-rescue-trial)
  - Clinical-reviewer: approve-with-conditions; condition resolved (IMS-III CI corrected 0.85→0.83); full approve at commit
  - Review artifact: docs/reviews/clinical-PR-W7.0-predecessor-stubs.md
  - trialResult calls: IMS-III=NEGATIVE ✓; SYNTHESIS=NEGATIVE ✓; MR RESCUE=NEUTRAL ✓ (reviewer confirmed)
  - tsc clean · build green (2.28s)
  - URLs: /trials/ims-iii-trial · /trials/synthesis-expansion-trial · /trials/mr-rescue-trial
- [x] 2026-04-28 — W7.0 batch 2: 7 predecessor stubs (BEST, BASICS, MATCH, CHARISMA, STICH I, STICH II, MISTIE III)
  - chainContext fix (pre-batch): bedsidePearl slot now data-driven via `chainContext` field; successorTrialClause field added for chain-neutral amber banner; all 3 EVT stubs backfilled; TRIALS_SPEC §7c.4 updated
  - 7 new stub entries in trialData.ts: best-trial · basics-trial · match-trial · charisma-trial · stich-i-trial · stich-ii-trial · mistie-iii-trial
  - 7 new id-gated branches in TrialPageNew.tsx
  - Sub-batch clinical reviews: all 3 sub-batches approved
    - Sub-batch 1 (basilar): docs/reviews/clinical-W7.0-subbatch1-basilar.md — approve
    - Sub-batch 2 (antiplatelet): docs/reviews/clinical-W7.0-subbatch2-antiplatelet.md — approve (3 conditions resolved: CHARISMA successorTrialClause scope, subgroup language, double-hyphens)
    - Sub-batch 3 (ICH surgical): docs/reviews/clinical-W7.0-subbatch3-ich-surgical.md — approve (editorial conditions resolved: STICH I mortality precision, double-hyphens)
  - trialResult calls: BEST=NEUTRAL ✓ · BASICS=NEUTRAL ✓ · MATCH=NEGATIVE ✓ · CHARISMA=NEGATIVE ✓ · STICH I=NEGATIVE ✓ · STICH II=NEGATIVE ✓ · MISTIE III=NEGATIVE ✓ (all confirmed by clinical-reviewer)
  - tsc clean · build green (1.93s)
  - W6.9 unblocked — all 10 predecessor stubs now exist
  - URLs: /trials/best-trial · /trials/basics-trial · /trials/match-trial · /trials/charisma-trial · /trials/stich-i-trial · /trials/stich-ii-trial · /trials/mistie-iii-trial
- [x] 2026-04-27 — RCTChainSection component and TRIALS_SPEC §7b — commit 12b24de
  - TRIALS_SPEC §7b (RCT Chain Section) appended; rctChain? field added to TrialMetadata; RCTChainSection.tsx created; dev route /dev/rct-chain-test; TASKS.md W6.9 updated
- [x] 2026-04-24 — W6.6.1 Archetype G WEAVE canary — commit a25a6fd
  - BenchmarkThresholdChart.tsx (new): 14px/18px track, green/red fill, CI band 20% opacity, dashed amber threshold
  - HistoricalContextSection.tsx (new): amber caveat mandatory first, 5-row table, current-trial cobalt-50 highlight
  - BottomLineDrawer.tsx: trialResult union extended (SAFETY_MET, SAFETY_FAILED, INCONCLUSIVE) + badge/label entries
  - trialData.ts: TrialMetadata schema (benchmark, observedEventRate, historicalContext fields); WEAVE rebuilt as Archetype G
    with trialResult=SAFETY_MET, scaleMax=10, full clinical content; link-graph.json weave-trial node added
  - TrialPageNew.tsx: WEAVE id-gated branch (sticky header, Primary Outcome chart, Historical Context section 2a,
    TeachingWell qa/interpret, bedside pearl, BottomLineDrawer)
  - Gate 1: tsc clean · build 2.34s. Gate 2: clinical-reviewer approve (both sessions — approve-with-conditions
    with 1 pre-merge condition resolved; full approve on second pass)
  - Review artifacts: docs/reviews/clinical-weave-archetype-g.md + docs/reviews/clinical-weave-w661.md
  - Pre-merge condition resolved: HistoricalContextSection footer includes "outcome assessment windows" caveat
- [x] 2026-04-24 — RIGHT-2 trial rebuild (Class C-clinical) — Phase C / prose-narrative Archetype B
  - trialResult NEUTRAL→NEGATIVE; inclusionCriteria/exclusionCriteria added; howToInterpret added;
    bedsidePearl/bottomLineSummary added; prose-narrative primary outcome branch in TrialPageNew.tsx
  - Clinical-reviewer pass 1: block (trialResult reclassification + ENOS reference + governance items)
  - Clinical-reviewer pass 2: approve-with-conditions (pearl[0] neutral→negative resolved inline)
  - ADR-005 Option C hybrid cited for citation-infrastructure governance items; escalation note in re-review artifact
  - tsc clean · build green (2.35s) · all 6 patch resolutions + 1 condition applied before merge
  - Review artifacts: docs/reviews/clinical-right-2-rebuild.md (block) + docs/reviews/clinical-right-2-rebuild-rereview.md (approve-with-conditions)
- [x] 2026-04-17 — GCS Calculator rebuild (Class D-clinical) — merge 375d9cf (feat/rebuild-gcs → main)
  - Full Archetype 1 rebuild per CALCULATOR_SPEC v1.1; first live Class D-clinical workflow
  - Files: GlasgowComaScaleCalculator.tsx (full rewrite), gcsScoreData.ts (threshold + types + citations),
    routeManifest.ts (GCS title/desc), link-graph.json (new nodes + stubs), ADR-001, arch review, clinical review
  - Key corrections: severity threshold >= 14 → >= 13 (ACRM 1993); 4-tier → 3-tier; pubmedId added;
    amber-700 for moderate; portal drawer (createPortal + position fixed); roving tabindex
  - Clinical-reviewer decision: approve-with-conditions (5 non-blocking follow-ups documented)
  - Wave 5 deviation: CLAIM_REGISTRY / citation registry pending; documented in clinical review artifact
  - 6/6 gates pass: no dark:, no border-2, createPortal ✓, amber-700 ✓, tsc clean, build 2.25s
- [x] 2026-04-17 — CALCULATOR_SPEC v1.1 consolidation — commit 71176ec
  - Five amendments: §1.3 drawer Portal (createPortal + position fixed), §7.1/§8 SEO path
    corrected (routeMeta.ts → routeManifest.ts), §1.1/§6 amber-600 → amber-700 (WCAG AA),
    §7.3 stub-node exception, §7.4 stubs array documentation
  - Based on ICH Score first swarm run findings
  - No clinical content changed; no clinical-reviewer gate required
- [x] Calculator design system — cobalt tokens across 7 calculators — commit cff25ed
  - Files: Abcd2, GCS, HAS-BLED, Heidelberg, ROPE, ICH Score, ASPECTS
  - Selected state: blue → neuro-500/neuro-50/neuro-700 (18×)
  - Checkbox has-[:checked]: blue → neuro (5×)
  - Input color: text-blue-600 focus:ring-blue-500 → neuro (7×)
  - Copy button: bg-slate-900 rounded-lg → bg-neuro-500 rounded-xl font-semibold (7×)
  - Interpretation card: border-2 border-slate-200 bg-slate-50/50 → border border-slate-100 bg-white (6×)
  - Citation links: text-blue-600 dark:text-blue-400 → text-neuro-600 (8×)
  - Zero blue-* remaining in all 7 files
  - Mobile QA: pass (ABCD2) · Desktop QA: pass (ICH Score, 1280×800)
- [x] NIHSS and EVT modal shells — circular close buttons, cobalt selected state, clean headers — commit dd5bddc
  - ThrombectomyPathwayModal: Zap badge removed, title+subtitle text pair, close button → w-8 h-8 rounded-full bg-slate-100, Zap import removed
  - StrokeBasicsWorkflowV2: NIHSS modal close button → w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center
  - NihssItemCard: selected pill bg-slate-900 → bg-neuro-500 (cobalt)
  - Mobile QA: pass · Desktop QA: pass (1280×800)
- [x] ThrombectomyPathwayModal + NihssCalculatorEmbed design system polish — commit 341d9a4
  - ThrombectomyModal: dark:bg-gray-900→slate-900, shadow-2xl→custom boxShadow style, sticky header bg-white/95 backdrop-blur shadow-sm removed
  - NihssEmbed: X import added, shadow-sm removed from sticky bar, × char→circular X icon button (rounded-full bg-slate-100 aria-label="Close"), CTA text "Apply score — {total}"
  - Mobile QA: pass · Desktop QA: pass
- [x] OrolingualEdema + HemorrhageProtocol modal redesign — commit 10b6063
  - Both: max-w-lg, custom shadow, no min-h, circular close button, no header divider
  - Left-border callouts (amber/red), cobalt numbered steps, cobalt Copy to EMR + rounded-xl
  - AlertCircle + AlertTriangle removed from imports
  - Mobile QA: pass · Desktop QA: pass
- [x] TpaReversalProtocolModal redesign — commit baecb1c
  - max-w-lg, clean header, left-border callout, cobalt numbered steps, cobalt CTA
  - Mobile QA: pass · Desktop QA: pass
- [x] Three L2 polish fixes — commit 0bfea9a
  - CodeModeStep2: Stamp CT Time + focus:outline-none (no focus box)
  - StrokeBasicsWorkflowV2: emergency strip text-center + whitespace-nowrap, "tPA/TNK reversal"→"tPA reversal"
  - CodeModeStep2: disabled CTA opacity-40→50, italic span on disabled text
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep4 design system polish — commit 684bf89
  - Evidence badges: green→emerald-100/800, blue→neuro-50/700, yellow→amber-50/700, red→slate-100/600
  - Copy to EMR button: bg-slate-700→bg-neuro-500, hover:neuro-600, green-600→emerald-500 (copied), rounded-xl, min-h-[44px]
  - Save Orders button: bg-purple-600→bg-neuro-500, hover:neuro-600, rounded-xl, shadow-lg removed, min-h-[44px]
  - Zero structural/logic changes — accordion, checkboxes, evidence expand all intact
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep3 visual rebuild — commit ad51b4d
  - Code Summary card: emerald dot status, duration badge right
  - Clinical Summary: grid-cols-2, text-[10px] uppercase labels, hasStep1/hasStep2 gates
  - GWTG Milestones: emerald/amber rounded-full pill badges, conditional
  - EMR Note: bg-slate-50 pre, cobalt Copy to EMR + white Print buttons
  - generateEMRNote() and all clinical logic untouched
  - Mobile QA: pass · Desktop QA: pass
- [x] Global white bg + tab focus ring + LKW nowrap — commit 043556a
  - Layout.tsx: bg-slate-50 → bg-white on main (all pages)
  - StrokeBasicsWorkflowV2.tsx: focus:outline-none on tab buttons
  - CodeModeStep1.tsx: whitespace-nowrap on LKW time display
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep2 visual rebuild — commit 27cf421
  - CT Head: custom button-based radio cards with cobalt dot indicators (was: native <input> labels)
  - Treatment Decision: custom radio cards with dose on sub-line (tPA: total / bolus / inf; TNK: single bolus)
  - CTA/LVO: three equal pill buttons (Yes/No/Pending) + amber EVT Pathway button when LVO=yes
  - Save CTA: bg-emerald-600 → bg-neuro-500, rounded-xl, min-h-[52px], "Save & Continue →"
  - Summary bar: multi-line blue → single-line slate-50 with · separators
  - BP alert: condensed to inline prose (no icon, no bullet list)
  - Brain icon removed from lucide import (was content-only, not logic)
  - Mobile QA: pass · Desktop QA: pass
- [x] Content area top margin fix — commit f2f4b8e
  - card-content-panel: mt-3 (12px) → mt-16 (64px); scrollMarginTop: 99px → 163px
  - mt-3 was insufficient — sticky visual offset is 64px, content was 52px inside sticky area
  - content now starts at viewport y=163, exactly flush with sticky wrapper bottom
  - Mobile QA: pass · Desktop QA: pass
- [x] Stroke page pt-16 gap fixed — commit 81e41b5
  - Layout.tsx: isStrokePage flag (pathname /guide/stroke-basics | /calculators/stroke-code)
  - main: pt-16 → pt-0 on stroke routes; all other pages unchanged
  - Stroke header now flush to nav (gap = 0px); Home + Trials pt-16 intact
  - Mobile QA: pass · Desktop QA: pass
- [x] Tab bar clip + layout padding fixes — commit a8c26dd
  - StrokeBasicsLayout desktop container: removed px-6 (over-padding)
  - StrokeBasicsLayout mobile wrapper: removed py-4 (unwanted vertical gap)
  - WorkflowV2 tab bar: sticky top-28 (112px) → top-32 (128px); actual stroke header is 61px tall, top-28 caused 13px overlap
  - Mobile QA: pass · Desktop QA: pass
- [x] Stroke layout fixes — commit b41e644
  - Context bar: bg-slate-800 → bg-white border-slate-100; all text tokens → light equivalents
  - Window badges: solid dark fills → semantic emerald/amber/red-50 pill style
  - Tab bar: sticky top-14 → sticky top-[108px] (global nav 64px + stroke header ~44px)
  - Mobile QA: pass · Desktop QA: pass
- [x] Stroke header redesign — commit c379146
  - "Stroke Code" title (text-lg font-semibold) + back arrow (w-8 h-8 icon) left
  - Code/Study pill toggle: bg-slate-100 container, bg-white active pill, text-neuro-500 active, text-slate-400 inactive
  - sticky top-16 clears global fixed header (h-16 = 64px)
  - Subtitle "3 sections · tap any to open" removed
  - "Fast-track decisions" / "Evidence + clinical pearls" caption removed
  - QuickReferenceCard gated to workflowMode === 'study' only
  - Zap + BookOpen imports removed (no longer used)
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep1.tsx visual rebuild — commit d996fdb
  - Section cards: white bg, border-slate-100, rounded-xl
  - LKW: time display + WindowBadge pill + Change link in one row
  - BP/Glucose: side-by-side colored cards (red when above threshold, amber/red/emerald for glucose)
  - NIHSS: large score left, severity + LVO probability center, direct input + Calc button right
  - Weight & Dosing: tPA pill (bg-neuro-50) + TNK pill (bg-emerald-50) after weight entry
  - CTA: full-width bg-neuro-500 cobalt button
  - clamp() used in NIHSS onChange (no unused locals)
  - Zero changes to calculation logic, state, or modal handlers
  - Mobile QA: pass · Desktop QA: pass
- [x] Mobile/desktop QA checklist added to AGENTS.md — commit d4ce376
- [x] Stroke pathway visual redesign Part A — commit 908916b
  - StrokeCardGrid replaced with sticky 3-tab bar (Vitals/Imaging/Summary), cobalt active state
  - bg-slate-50 → bg-white in StrokeBasicsLayout (outer wrapper + desktop main)
  - gray-* → slate-* in StrokeBasicsLayout mobile close button
  - All purple/violet → cobalt: WorkflowV2 (study mode EVT block, thrombectomy card, related resources), CodeModeStep1 (NIHSS Calc), CodeModeStep2 (TNK radio), CodeModeStep3 (thrombectomy section), NihssCalculatorEmbed (Apply score button)
  - Emergency protocols: compact 3-button strip (added ICH protocol button)
  - Mobile QA: pass · Desktop QA: pass
- [x] Production crash on all /trials/:id pages — fixed commits 2a39731, 2cc2bab, 6667ec0
  - legacyTrialCategories undefined → 'ivt' fallback
  - safeCategory guard in TrialPageNew
  - useMemo hooks order violation corrected
- [x] Secrets gitignore — commit 5367e66
  - .env.local, .env.development, .env.production added to .gitignore
  - All three untracked from git index (git rm --cached)
  - .env.example created with placeholder values
  - NOTE: keys already in history must be rotated separately (Turnstile, Resend)
- [x] Brand implementation — commit a9df0ce
  - Cobalt neuro-* tokens (neuro-500: #1746A2), .active-pill updated
  - Brain+circuit inline SVG logo in desktop sidebar + mobile header
  - Brain and ChevronRight unused imports removed from Layout.tsx
  - bg-surface-50 ghost class fixed → bg-white
  - favicon-32.png, favicon-16.png, apple-touch-icon.png, icon-192.png, icon-512.png, icon-1024.png, logo-lockup.png added to public/
  - public/manifest.json created (PWA)
  - index.html: favicon links, manifest, theme-color meta, schema logo URL updated
- [x] Stroke page consolidation — commit 2a53994
  - Deleted StrokeBasicsDesktop.tsx (115 lines) and StrokeBasicsMobile.tsx (88 lines)
  - Removed lazy imports and ROUTE_COMPONENTS entries from App.tsx
  - Removed type union members and route objects from routeManifest.ts
  - StrokeBasicsWorkflowV2 (via StrokeBasics.tsx) is the canonical implementation
- [x] 2026-04-17 — ICH Score calculator rebuild — commits 02fd51d, 3be3879
  - Rebuilt IchScoreCalculator.tsx against CALCULATOR_SPEC v1.0; drawer header responsive + positioned above tab bar
- [x] 2026-04-19/20 — W5.2 Phase 1 swarm + checkpoint — commits eb29cf1, 5b0a88a, a276442, dffce50
  - W5.2 in-progress checkpoint (eb29cf1, 5b0a88a, 2026-04-19); medical-scientist Tier 1/2 workflow (a276442, 2026-04-20); Phase 1 swarm findings (dffce50, 2026-04-20)
  - Phase 1 complete: 2 claims ready (gcs-ich-score-weights, gcs-airway-threshold), 5 V decisions pending
- [x] 2026-04-20 — W5.3 citation scanner — commit 91bee2b
  - scripts/check-claims.ts: unregistered claim IDs, bidirectional surface cross-check, freshness check; tsx devDep; test fixtures; arch review approve-with-conditions
- [x] 2026-04-20 — W5.4 pre-commit hook — commit 83b80bd
  - .husky/pre-commit: set -e + check:claims + check:routes; husky v9; arch review approve

- [x] 2026-04-27 — W6.6.3 Batch 5A: BP-TARGET, BEST-II, OPTIMAL-BP — commits 8dcec26
  - trialData.ts: BP-TARGET (archetypeA, aOR 0.96, iPH null negative), BEST-II (archetypeA, futility-trial, amber banner, winnerArm=none), OPTIMAL-BP (trialResult NEGATIVE→HARM, archetypeA, stopped-for-safety red banner, winnerArm=control per Modification 2)
  - TrialPageNew.tsx: 3 new branches — BP-TARGET (standard negative), BEST-II (futility amber), OPTIMAL-BP (HARM red + stopped banner)
  - Gate: tsc clean · build green · clinical-reviewer approve (docs/reviews/clinical-batch5a-w663.md)
- [x] 2026-04-27 — W6.6.3 Batch 5B: ENCHANTED, ESCAPE-NA1, CHARM, ELAN — commits 898ec2d + 379c5b1
  - trialData.ts: ENCHANTED (specialDesign neutral-trial corrected, archetypeB, ordinalStats OR 1.01, secondary ICH discipline per carry-forward Modification), ESCAPE-NA1 (archetypeA, alteplase-free subgroup confined to cautions), CHARM (archetypeB, COVID early-stop discipline, core-volume subgroup guarded), ELAN (archetypeA + doi metadata fix)
  - TrialPageNew.tsx: 3 new branches — ENCHANTED (ordinalStats card + amber secondary note), ESCAPE-NA1 (DeltaBandChart winnerArm=none), CHARM (ordinalStats card + amber COVID banner above chart)
  - Gate: tsc clean · build green · clinical-reviewer approve (docs/reviews/clinical-batch5b-w663.md) — all three carry-forward modification constraints verified
- [x] 2026-04-27 — W6.6.3 Batch 5C: DECIMAL, DESTINY, HAMLET — commits 379c5b1 + 3ed5d2e
  - trialData.ts: DECIMAL (trialResult NEUTRAL, archetypeA, efficacyResults 75%/22% survival, primary mRS null P=0.18, Modification 3 pooled sentence in cautions), DESTINY (NEUTRAL, 88%/47%, primary null P=0.23), HAMLET (NEUTRAL, efficacyResults corrected 78%/41%, primary neutral overall, 48h window bedsidePearl, Modification 3)
  - TrialPageNew.tsx: 3 new branches — all archetype A, DeltaBandChart survival rates winnerArm=treatment, amber note box inside chart for null primary; DECIMAL/DESTINY/HAMLET cross-links
  - Modification 3 gate: pooled-analysis sentence character-identical across all three cautions (HAMLET 2009 Figure 3, mortality ARR 49.9 pp, mRS>4 ARR 41.9 pp)
  - Gate: tsc clean · build green · clinical-reviewer approve (docs/reviews/clinical-batch5c-w663.md)
- [x] 2026-04-27 — W6.6.3 Batch 5D: DESTINY II, TIMING, OPTIMAS — commit 0a8f4a8
  - trialData.ts: DESTINY II (trialResult POSITIVE, archetypeA, efficacyResults 38%/18% mRS 0-4, Modification 1 — proves co-locates OR 2.91 P=0.04 + 0% mRS 0-2, doesNotProve disclaims QoL in ≥60), TIMING (NEUTRAL, resultSubtype non-inferiority, RD -1.79pp, P NI=0.004), OPTIMAS (NEUTRAL NI, RD 0.000, P NI=0.0003, N=3621)
  - TrialPageNew.tsx: 3 new branches — DESTINY II (amber QoL caveat banner ABOVE DeltaBandChart, winnerArm=treatment), TIMING (amber NI banner ABOVE chart, winnerArm=none), OPTIMAS (amber NI banner ABOVE chart, winnerArm=none)
  - Modification 1 gate: 0% mRS 0-2 co-located in proves, prominent in bedsidePearl, amber banner above chart, doesNotProve disclaims functional independence AND QoL
  - Gate: tsc clean · build green · clinical-reviewer approve (docs/reviews/clinical-batch5d-w663.md)
- [x] 2026-05-13 — Phase 7D.1 — NIHSS spec alignment (Archetype 2) — Class C — commit a7f13f7
  - Files: src/pages/NihssCalculator.tsx
  - Shipped: Two-row header per CALCULATOR_SPEC v1.1 §3.1; portal bottom drawer per §1.3 Option A shell (severity bracket + LVO probability card); all touch targets ≥44px; score display em dash; neuro-500 copy button; rounded-full toggle; max-w-2xl content; spec-correct footer
  - QA: tsc clean · build green ✓
  - Clinical impact: low (presentation shell; no new medical claims beyond threshold display)
  - Note: Portal drawer shell in place; severity interpretation prose deferred to Phase 7D.2 (Class E, requires medical-scientist authoring + clinical-reviewer gate)
- [x] 2026-05-13 — Phase 7D — Mobile touch targets and safe-area fix — Class C — commit a7f13f7
  - Files: src/components/trials/TrialLegendCard.tsx · src/pages/guide/StrokeBasicsWorkflowV2.tsx
  - Shipped: TrialLegendCard star button `p-0.5` → `p-2 min-h-[44px] min-w-[44px]` · StrokeBasicsWorkflowV2 invalid `safe-area-inset-bottom` CSS class → `pb-[env(safe-area-inset-bottom,0px)]`
  - QA: tsc clean · build green ✓ · all interactive touch targets ≥44px on 375px viewport ✓ · iOS home indicator gap correctly applied ✓
- [x] 2026-05-16 — Pattern A post-ship fix series — Class D-clinical (5 commits)
  - 19f2a47: Audit findings doc — 31 violations enumerated across 5 primitives + 26 usage bugs (Sections A–G with line citations + 5-tier fix sequencing)
  - 0078c3b: Tier 1 primitive bug fixes (PathwayRail zero-height rail + node centering; PathwayLearningPearl Lightbulb icon; PathwayCascadeNotice Undo button sizing; PathwayCategoryRow `variant: 'danger'` removal) + Tier 2 cross-pathway header sweep (strip duplicate step-dot clusters; canonical back-arrow SVG; remove icon-tile flourish; add PATHWAY eyebrow + Copy pill; max-w-2xl; font-semibold). 7 files, +169/-139. Architect: arch-pattern-a-fix-tier-1-2.md (approve-with-conditions, 10 conditions). All 5 `variant: 'danger'` call sites updated atomically with primitive change.
  - bfa5c6d: Tier 3 SE content rebuild — §4.8 Dose Result Row anatomy (3 sites with `Computed from {weight} kg` hints); §4.7 Outcome Row anatomy (subtle emerald-50/amber-50, banishes bespoke big-block red/emerald-500 buttons); §4.6 Next-button token for Proceed buttons; §4.2 tri-button for glucose check; alert()→inline icon-swap; "Stage 2 ASM (ESETT-equivalent)"→"Stage 2 Agent" (root cause of V's "medication hidden" screenshot); comorbidity chips→44px touch targets. Single file, +125/-55. All 6 CLIN-2 SE phrases preserved at unchanged positions.
  - 1e4eecf: Tier 4 EVT drawer migration — retired deprecated `PathwayBottomDrawer` (sole consumer) onto spec-mandated `CalculatorDrawer`; killed bespoke Step 4 hero result card (`border-l-[8px]`, `text-5xl font-black`, `text-emerald-900/amber-900/red-900`); State A/B/C semantics with State B forced slate-neutral chrome to preserve commit 9e34761 early-verdict-anchoring fix; Material Symbols→inline SVG (2 sites); removed mobile bottom-bar progress strip (3rd duplicate indicator); inlined CASCADE_NOTICE per upstream field; scroll-mt-4 + sectionRefs removed; Back/Next downgraded to cobalt-pill register. 3 files, +435/-149. Architect: arch-pattern-a-fix-tier-4.md (approve-with-conditions, 8 conditions); Clinical-reviewer: clinical-pattern-a-fix-tier-4.md (approve-with-conditions, 4 conditions including the load-bearing slate-neutral State B chrome). All 7 CLIN-2 EVT phrases preserved by construction.
  - 77ce4e8: Tier 5 Migraine — new `PathwayCocktailSummary` primitive (~105 LOC, PATHWAY_SPEC §4.9: live cocktail row, chip-as-button per §3.4, owns clipboard call, pending-removal animation); Chevron extended with right/left directions; CalculatorDrawer migration replacing bespoke `bg-slate-900 font-mono` Treatment Plan hero card (preserves per-line className: bold section headers + indented dash drug lines); State B `Cocktail · N drugs` trigger rule pinned (step===3 + hasAnyDrug); native `<select>`→PathwayCategoryRow for renal function; border-2→border sweep; SafetyToggle clinically-motivated red retained with documented §4.2 exception code comment; legacy `removedAlerts` fixed-toast removed (state + setter + reset all cleaned, no dangling); lucide ChevronRight→shared Chevron × 4 sites; Step icon-key collisions fixed. 5 files, +512/-73. Architect: arch-pattern-a-fix-tier-5.md (approve-with-conditions, 12 conditions); Clinical-reviewer: clinical-pattern-a-fix-tier-5.md (approve-with-conditions, 6 conditions including the cocktail bare-lines max-dose suffix safety patch — "Ketorolac 30mg IV (max 2 doses)"). All 15 CLIN-2 Migraine phrases preserved (3 use JSX-safe `&gt;` entity).
  - Gates: all 4 Gate 6 live-verifies PASS (/pathways/se-pathway, /pathways/evt, /pathways/migraine all 200 with shell intact post each deploy)
  - Clinical impact: none (no clinical text, threshold, or interpretation logic changes across the series — render-surface migration only)
  - Deferred follow-ups: (1) delete PathwayBottomDrawer.tsx after 1-week clean signal; (2) extract TIER_TOKENS to src/lib/pathways/tierTokens.ts after the deletion above; (3) extract PathwayHeader primitive (parked 2026-05-16)

- [x] 2026-05-17 — EMR-text doctor-tone rewrite series + Send-to share button + Stroke Code a11y HIGH batch — Class D-clinical (12 commits)
  **Stroke Code feature enhancements (4 commits):**
  - f343370: feat(stroke): wake-up stroke cross-link to Extended IVT Pathway — cross-link card in CodeModeStep1
  - 010bc15: feat(stroke): Extended IVT outcome feeds back into Stroke Code summary + EMR copy — onResultChange wired to update parent state
  - d17a782: feat(stroke): TimestampBubble adds Neuro IR Contacted + NCC/ICU Sign-out — 2 new timestamp event types
  - 3525667: docs(governance): add C-suite plain-English rule for V-facing summaries — CLAUDE.md §10.2 plain-English governance tier
  **Share Button Primitive (1 commit):**
  - 4c9fb20: feat(share): add "Send to" share button alongside Copy across the app — new shareOrCopy utility + ShareButton primitive + 21 file consumers (10 calculators + 5 pathway pages + 6 modals/stroke-code sections)
  **EMR-Text Doctor-Tone Audit + Rewrites (3 research commits + 3 implementation commits):**
  - e87f44b: docs(reviews): EMR-text audit + doctor-tone standard for V approval — docs/reviews/emr-text-standard-2026-05-17.md (audit findings + doctor-tone voice guidelines)
  - c97fa12: docs(reviews): NIHSS exception — keep all 15 items as numbered list — EMR-standard revision
  - f0299c1: docs(reviews): revise EMR-text standard per V — drop A/P + Source sections — final V-approved standard
  - f8b8a2f: refactor(emr-text): Batch A — 5 high-priority calculator rewrites — CHA₂DS₂-VASc, NIHSS (15-item exception), HAS-BLED, ABCD², Boston (Class C-clinical)
  - 5a5fca7: refactor(emr-text): Batch B — 5 MED-priority calculator rewrites — GCS, ICH, RoPE, ASPECTS, Heidelberg (Class C-clinical)
  - f87eea1: refactor(emr-text): Batches C + D — pathway pages + modals doctor-tone rewrite — Stroke Code summary/orders, EVT, ExtendedIVT, SE, Migraine, ELAN, ThrombolysisEligibilityModal; ProtocolModal already compliant (Class C-clinical)
  **Accessibility Remediation (1 commit):**
  - 75b0ddf: fix(a11y): Stroke Code HIGH-severity batch — modals + components — 10 HIGH a11y findings closed: B-3, B-4, C-1, C-2, C-3, C-7, C-8, D-1, E-1, F-2 (0 BLOCKERs remaining)
  **Gates:** tsc clean · build green · clinical-reviewer approve-with-conditions (docs/reviews/clinical-emr-text-2026-05-17.md) · all 21 consumers live-verified
  **Clinical impact:** medium (EMR output text rewritten for doctor tone across 10 calculators + 5 pathway pages + 6 modals; no clinical thresholds or interpretation logic changed)

- [x] 2026-06-03 — TrialHeaderBar extraction (Phase 1 of TrialPageNew de-duplication) — Class D-clinical (commit 4d4dfad)
  - Extracted the sticky trial header bar (back button + category badge), previously inlined byte-identically ~105×, into shared src/components/trials/TrialHeaderBar.tsx (props: abbreviation, categoryBadgeLabel, onBack). A codemod (scripts/codemod-trial-header-bar.mjs, idempotent, --limit/--dry) replaced 103 compact inline blocks in 4 verified batches of ~30; net −823 lines on TrialPageNew.tsx (107 insert / 930 delete).
  - categoryBadgeLabel derivation left at each call site (not lifted) per architect condition #3 — kept the diff purely mechanical, no clinical text moved.
  - **Verification:** all 108 prerendered trial pages have byte-identical header-bar DOM vs pre-refactor baseline (render-neutral); tsc clean per batch; build 170/170 prerendered; claims/routes/chains pass.
  - **Reviews:** architect approve-with-conditions (docs/reviews/arch-PR-trial-header-bar-extraction.md, all 6 conditions met) · clinical-reviewer approve (docs/reviews/clinical-PR-trial-header-bar-extraction.md — no trialMetadata-derived text changed, no claim surface touched).
  - **Gate 6 live-verify:** PASS — /trials/aramis-trial renders TrialHeaderBar (ARAMIS back button + Thrombolysis badge + title intact) on the new deploy; homepage 200; pre-push live-verify green.
  - **Rollback:** single-file `git revert 4d4dfad`; component + codemod are additive and inert once unreferenced.
  - **Deferred to Phase 2 (own PR):** TrialTitleHeading H1 extraction (~17 branches, tone prop) + the ~2 expanded multi-line header forms (e.g. EXTEND).
  - **Clinical impact:** none (structural; rendered output byte-identical).
- [x] 2026-06-07 — Pathway active-slot colour hierarchy + auto-expanding verdict — Class D (commit 46bffd2)
  - Two UI-testing fixes V reported on the step pathways. (#1) No colour cue for which open slot to fill next: PathwayCategoryRow now tints the open-and-unfilled row (neuro-50 background, neuro-400 left accent, neuro-800 label, neuro-500 chevron) so the focal slot is obvious. (#2) The interpretation/verdict bar at the bottom was easy to miss: the eligibility CalculatorDrawer now auto-expands into the full result panel the moment a real verdict is ready (once per session, resets on cascade-clear), mirroring ExtendedIVT; collapsed bar is tier-coloured via colorCollapsed.
  - Files: src/components/pathways/PathwayCategoryRow.tsx (active affordance), src/pages/EvtPathway.tsx + src/pages/ExtendedIVTPathway.tsx (auto-expand effect + colorCollapsed). Interaction/visual only — no clinical option/threshold/branch/verdict text changed.
  - Gate results: tsc clean · build green · claims clean · full EVT + ExtendedIVT branch audit (every selection path reaches a verdict; no real dead-ends) · live at 375px.
- [x] 2026-06-07 — EVT result/action de-clutter to PM spec — Class D-clinical (commit d59ee42)
  - Decision step previously stacked four competing surfaces (floating "Decision Support" card, fixed action bar with legacy black "Copy to EMR", eligibility drawer, tab bar) with three EMR-copy paths. Now consolidated to ONE: the drawer's expanded panel holds the verdict + single house-style "Copy to EMR" button + folded clinical content (MeVO risk box [isMevo-gated], "Decision Support Only" disclaimer with auto-linked trials, 3x 2026 peri-procedural pearls, Clinical Context Summary). Legacy black button removed (redundant 3rd copy path); action bar de-fixed at decision step (static Back + Start Over); drawer panel 45dvh → 68dvh.
  - File: src/pages/EvtPathway.tsx (UI consolidation only). EMR-note logic (buildEmrText/copySummary) + verdict logic byte-identical; header copy/share unchanged; clinical text relocated byte-for-byte.
  - Gate results: tsc clean · build 171/171 prerendered · claims hook PASS · mobile-first 375px PASS (drawer expands to 68dvh, copy button reachable, scrolls above tab bar) · architect approve-with-conditions (docs/reviews/arch-evt-declutter.md) · clinical pre-exec approve-with-conditions + post-exec verbatim PASS (docs/reviews/clinical-evt-declutter.md).
  - Gate 6 live-verify: PASS — /pathways/evt returns 200 on the d59ee42 deploy, title + H1 intact, 4-step pathway renders; homepage 200.
- [x] 2026-06-09 — Trial enrichment wave 2: added full eligibility criteria + study-arm details (`fullEligibility` + `armDetails`) to 28 existing trial records across 7 clinically-gated batches, sourced from uploaded PDFs (evidence-verifier + medical-scientist authoring, clinical-reviewer gate each batch). All Gate 6 green. Commits: e7f6ce9 (hemicraniectomy: DECIMAL, DESTINY, DESTINY II, HAMLET), 1b2757a (antiplatelet: CHANCE, CHANCE-2, POINT, INSPIRES, THALES, SOCRATES), 41af055 (acute BP: BP-TARGET, OPTIMAL-BP, BEST-II, ENCHANTED), 5b3954a (SPARCL, SPS3), b23f286 (prehospital: B_PROUD, BEST-MSU, MR ASAP, RACECAT + MR ASAP BP-threshold fix 120→140), 2563ba8 (RIGHT-2, TRIAGE-STROKE, INTERACT4, WEAVE), 205c2a1 (WAKE-UP, CHARM, ESCAPE-NA1, ENRICH). Clinical artifacts: docs/reviews/clinical-enrichment-wave2.md. DISTAL + ESCAPE-MeVO were already enriched in the prior EVT wave. Safety correction: MR ASAP curated SBP enrollment threshold corrected 120→140 mm Hg (source-verified, was RIGHT-2 contamination).

## POST-MORTEMS
Regressions that required rollback. Each entry links to a post-mortem
doc in docs/YYYY_MM_DD/post-mortem-<slug>.md.
(none yet)
