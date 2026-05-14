# TASKS.md — NeuroWiki Task Ledger

## ACTIVE
(none)

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
- [2026-05-13] **SPA prerendering / SSR for SEO** — current site is CSR; Googlebot relies on JS execution for per-route titles. The static HTML shell shows the same title for every route (index.html canonical), and per-route titles only land after JS hydrates. Consider Vite-SSG, vite-plugin-ssr, or a build-time prerender step for the 42 static routes. Would substantially improve crawlability and Core Web Vitals. (parked during: SEO Phase 1 overnight, observed via WebFetch on /pathways/evt returning shell-only title)
- [2026-05-13] **TrialPageNew H1 conflict with ADR-005 Decision 4** — SEO audit flagged 65+ H1 elements (one per archetype branch, all rendering `{trialMetadata.title}: {trialMetadata.subtitle}`). ADR-005 Decision 4 explicitly chose cobalt H1 as the page H1. Implementation also has a separate H1 at line 404 for the catalog name, so every page has at least 2 H1s. Question: (a) update ADR to specify cobalt H2 (preserve visual); (b) demote line 404 catalog H1 to non-heading (so cobalt H1 remains the only one); (c) restructure page heading hierarchy. Needs V triage. (parked during: SEO Phase 1 overnight)
- [2026-05-13] **routeManifest title/description length violations** — Phase 1 audit found 25+ entries exceeding spec §7.1 limits (titles >60 chars, descriptions >160 chars). Most over-shoot is modest (5-30 chars). Hold for Phase 3 game-plan execution to fix in coherent batches with keyword strategy applied. (parked during: SEO Phase 1 overnight)
- [2026-05-13] **TrialPageNew per-archetype trial title duplication** — beyond the H1 question above, the `{trialMetadata.title}: {trialMetadata.subtitle}` JSX block is duplicated across ~17 archetype branches in TrialPageNew.tsx (lines 476, 937, 1020, 1096, 1172, 1256, 1340, 1417, 1493, 1576, 1660, 1741, 1828, 1904, 1979, 2055, 2136, 2211, 2286…). Could be extracted to a shared `TrialTitleBlock` component; would shrink the file substantially and remove copy-paste drift risk. (parked during: SEO Phase 1 overnight)
- [2026-05-13] **Unused imports across src/ (Class B mechanical cleanup)** — running `npx tsc --noEmit --noUnusedLocals` reveals 30+ unused imports across stroke article components, modals, and pages. Categories: unused lucide-react icons (`Info`, `BookOpen`, `ExternalLink`, `Link`, etc.) — safe to remove, ~5-8 KB gzip bundle savings per L5 bundle audit H4; unused string constants (`SUBTITLE` declared not used in HemorrhageProtocolModal, OrolingualEdemaProtocolModal, TpaReversalProtocolModal); unused `setIsLearningMode` state in LVOScreenerV2 and VitalsInputV2 (likely dead-code remnant); `'React'` import unused in files using JSX transform (may or may not be removable depending on tsconfig). Safer subset (lucide icons + string consts + setState pairs) is 20+ files of ~1 line each. Defer batch to V triage; one-line script could automate but JSX-transform `React` decision needs care. (parked during: SEO Phase overnight)
- [2026-05-13] **7 WCAG 2.1 AA high-priority a11y failures** — see docs/L5-accessibility-audit.md. ThrombectomyPathwayModal + ThrombolysisEligibilityModal + FeedbackModal need focus traps + aria-modal. 4 older pathway pages (Migraine/GCA/SE/ELAN) need aria-live result regions. LKWTimePicker needs keyboard access (currently mouse/touch only). StrokeBasicsWorkflowV2 toggle and tabs need valid ARIA. Each is discrete but they share modal-infrastructure work. Need V triage for ordering/scope. (parked during: L5 a11y audit overnight)
- [2026-04-17] Evaluate Claude Design (Anthropic Labs research preview, launched 2026-04-17) for potential integration with design-prototyper workflow. Currently research preview with ~50% reliability on complex tasks; revisit when maturity improves (~3-6 months). Could replace or augment HTML mockup authoring at docs/specs/mockups/. (parked during: W5.1 / end-of-session cleanup)
- [2026-04-22] W6.5 — Archetype B/Grotta Bar + DISTAL trial rebuild. DISTAL is a non-inferiority/negative MeVO trial; requires Grotta Bar component (mRS distribution shift) before page can be built. Park until Archetype B component is implemented. (parked during: W6 10-trial Archetype A rebuild)
- [2026-04-22] W6.6 — Archetype G + WEAVE trial rebuild. WEAVE is a single-arm safety registry; requires Archetype G (single-arm registry display) before page can be built. Park until Archetype G component is implemented. (parked during: W6 10-trial Archetype A rebuild)
- [2026-04-21] [DONE — commit 72bb1ba] Patch C desktop drawer fix (--nav-rail-width) — defined CSS variable in index.css; NIHSS hardcoded left:0 also fixed. All 5 portal-drawer calculators now clear the desktop rail. (parked during: Patches A/B/C)
- [2026-04-21] Consider adding `clinicalQuestion?: string` field to TrialMetadata schema (trialData.ts) so the §1.3 question lede can be data-driven rather than hardcoded per trial page. Not urgent — only EXTEND page exists today. (parked during: Patches A/B/C)
- [2026-04-28] [DONE — commit 142815e] Four conflicting legend values resolved: NINDS (+15/100, NNT 6.5), ESCAPE (+24/100, NNT 4.2), DEFUSE-3 (+28/100, NNT 3.6), DAWN (+36/100, NNT 2.8). All sourced from efficacyResults and calculations.nnt in trialData.ts. No conflicts with existing data.
- [2026-04-28] [DONE — spec commit TBD] TRIALS_SPEC.md v1.4 — Part II (legend listing page) added. Covers Toggle, Chip, TrialLegendCard components; 6 tokens; effectiveView pattern; NNT-as-stat backfill recipe; dynamic-route validator fix. (parked during: W7.1 legend slice + page rebuild)
- [2026-04-28] Backfill `legend` slice on remaining ~16 trials — Class C-clinical-editorial. Use NNT-as-stat pattern from TRIALS_SPEC §L6.1. Seven trials done (ECASS III, EXTEND, MR CLEAN, NINDS, ESCAPE, DEFUSE-3, DAWN). Ready for bulk pass: SWIFT PRIME, REVASCAT, EXTEND-IA, THRACE, DIRECT-MT, DEVT, SKIP, MR CLEAN NO-IV, DIRECT-SAFE, SWIFT-DIRECT, LASTE, TENSION, COMPASS, ASTER, ASTER 2, CHOICE, RESCUE-BT, ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, CHARM, ESCAPE-NA1. Card renders gracefully with absent legend (falls back to listDescription; omits chip/stat slots). (parked during: W7.1 legend slice + page rebuild)
- [2026-05-01] Author clinical synthesis paragraph for each of six question-detail pages — Class D-clinical, gated by clinical-reviewer. Page shell shipped in [SHA — see commit below]; content remains. The curated answer paragraph will replace the "Curated answer in progress" copy in the cobalt-soft status banner (src/pages/QuestionDetailPage.tsx). Requires medical-scientist authoring + clinical-reviewer approval + citation trace per TRIALS_SPEC §L5.3. trialIds schema added to trial-questions.ts (src/data/trial-questions.ts:trialIds[]). Anticoagulation question TODO: trialCount raised from 9→3 to match resolved IDs; 6 further AF/ESUS/PFO trials needed when added to data layer. (parked during: W7.1 question-detail shell)
- [2026-05-01] Question taxonomy expansion: 6 → ~24 clinical questions — Class C-clinical-editorial. Current 6 stubs are a starter set. Full taxonomy requires editorial classification of which trials address which questions, reviewed by clinical-reviewer (classification is a clinical assertion). (parked during: W7.1 spec amendment)
- [2026-05-01] ⌘K command palette for /trials — Class C. Keyboard shortcut focuses the search box and opens a recent/suggested list. Mockup precedent in trials-legend-reference.html (⌘K badge in search bar, line 155). (parked during: W7.1 spec amendment)
- [2026-05-08] Vocabulary-consolidation ADR: `trialResult` / `specialDesign` / `primaryDesign+primaryResult` / `archetypeId` — Class D. Codebase carries four parallel vocabularies (legacy, deprecated, Wave 2, Wave 3) with no consumer pruning. Batch 3 Wave 1 did not solve this; tracked as post-flight follow-up from arch-batch3-wave1-schema-extensions.md. (parked during: Batch 3 Wave 1 schema extensions)
- [2026-05-08] `classifyTrial.ts` extraction to `src/lib/trials/` — Class D. Classifier currently embedded in TrialPageNew.tsx stats useMemo; should be pure function before Wave 4 visualization components. Arch follow-up from arch-wave3-batch2-renderer.md. (parked during: Wave 3 Batch 2 renderer wiring)
- [2026-05-08] EXTEND canary migration decision — Class D. Decide whether EXTEND page (TrialPageNew.tsx lines 358+) migrates onto Wave 3 schema-driven path or is formally retired as one-off. Must be settled before Wave 4 component work. Arch follow-up from arch-wave3-batch2-renderer.md. (parked during: Wave 3 Batch 2 renderer wiring)
- [2026-05-08] NOR-TEST data inconsistency: tagged `noninferiority`+`noninferiority-not-established` but `doesNotProve` says superiority trial — Class C-clinical data fix. Clinical follow-up from clinical-wave3-batch2-renderer.md. (parked during: Wave 3 Batch 2 renderer wiring)
- [2026-05-08] `harmSignal` claim tagging (6 entries): POINT, SAMMPRIS, SPS3, SPARCL, THALES, INSPIRES — each needs adjacent `claimId` + registry record with `quoted_text` per §13.4 Phase 1. Status: blocked:awaiting-registry-population until W5.2 lands. (parked during: Batch 3 Wave 2 data population)
- [2026-05-08] OPTIMAS 2pp NI margin + INSPIRES bleeding HR (2.08, 1.07–4.04) citation trail: when W5.2 lands, add full citation records (Werring Lancet 2024 PMID 39491870; Gao NEJM 2023 PMID 38157499) with `quoted_text` to registry. (parked during: Batch 3 Wave 2 data population)
- [2026-05-11] `time-is-brain-deep` pearl (strokeClinicalPearls.ts line 86) still contains "NINDS trial: Treatment <90min had 50% vs 38% good outcome at 3 months" — same misattribution corrected in Phase 1C (ninds-trial pearl). The 50%/38% is the Part 2 overall Barthel ≥95 result; the <90min time-stratified benefit analysis is from Marler et al. 2000 (Neurology 2000;55:1649-1655, PMID 11113218). Fix: either re-source to Marler 2000 with adjusted OR data, or replace with Emberson 2014 pooled time-benefit framing. Class E follow-up. (parked during: Phase 1C audit remediation)
- [2026-05-11] Data-layer NNT prose cleanup for ordinal-shift trials — Class E follow-up from Phase 2A. DEFUSE-3 (trialData.ts lines 4628–4633, 4648), SELECT2 (lines 4791–4793), ANGEL-ASPECT (lines 4868–4870) contain nntExplanation/pearl/legend.keyStat NNT statements that are statistically invalid for ordinal common-OR designs. Fix: replace with ordinal-appropriate cOR framing OR gate every consumer behind stats.suppressNNT. Trial-statistician sign-off required. (parked during: Phase 2A audit remediation)
- [2026-05-01] Timeline view (/trials/timeline) — Class D. Chronological display of all 79 trials by year. New route, new view toggle state. No clinical content change. (parked during: W7.1 spec amendment)
- [2026-05-01] Long-press to favourite on mobile — Class C. 500ms long-press on a TrialLegendCard triggers the favourite toggle without navigating to the detail page. Requires pointer event handling in TrialLegendCard. (parked during: W7.1 spec amendment)

## PENDING

### AGENT GOVERNANCE

- [ ] [P2] Implement full task-class-aware clinical edit gate for guard-clinical-edit.mjs
  Currently advisory (exits 0 with warning to stderr). Needs TASKS.md ACTIVE section
  parsing to detect the current task class. Allow Class E/-clinical edits; emit a
  stronger warning (but still exit 0) for unclassified clinical surface edits.
  File: scripts/claude-hooks/guard-clinical-edit.mjs
  See: agent-governance-modernization-2026 follow-up

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
- [ ] [L4] ResidentToolkit.tsx rebuild
- [ ] [L4] StatusEpilepticusPathway visual rebuild
- [ ] [L4] MigrainePathway visual rebuild
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

### L5.6.1 — Migrate Cha2ds2VascCalculator onto CalculatorShell — Class C
- **Status:** planned — 2026-05-13
- **User-visible goal:** none (refactor)
- **Origin:** L5.6 architect review condition C6. Cha2ds2VascCalculator currently uses the inline-everything pattern (own setToast, own Drawer, own header markup) but was excluded from L5.6 because it predates spec v1.1.
- **Goal:** Migrate Cha2ds2VascCalculator to consume the L5.6 shell (CalculatorHeader + CalculatorDrawer + CalculatorToast + useDrawerState). This validates the shell is general enough for a 10th calculator and retires Cha2ds2Vasc's remaining inline copies.
- **Files likely touched:** src/pages/Cha2ds2VascCalculator.tsx
- **Acceptance checks:** tsc clean · build green · CHA2DS2-VASc renders identically to pre-migration · drawer state machine wired correctly (CHA2DS2-VASc likely uses partial-complete mode; verify by reading the file)
- **Non-goals:** no clinical content changes; no scoring logic changes
- **Clinical impact:** none
- **Rollback plan:** git revert
- **Blocking note:** None — L5.6 has landed; this is the validation task that confirms the shell is general enough.

- [x] [L5] Typography audit — commit 88750a1 (2026-05-13), docs/L5-typography-audit.md (5H / 6M / 7L)
- [x] [L5] Spacing consistency audit — commit 67dca9c (2026-05-13), docs/L5-spacing-audit.md
- [ ] [L5] Full mobile + desktop QA pass all pages
- [x] [L5] Performance audit — bundle slice shipped commit 138d278 (2026-05-13) at docs/L5-bundle-audit.md. 3.0 MB total / ~550 KB gzip; ~50 KB over the 500 KB target. Specific splits proposed for trialData, TrialVisualizations, TrialPageNew chunks.
- [x] [L5] Accessibility audit — commit f8b8ac8 (2026-05-13) at docs/L5-accessibility-audit.md. WCAG 2.1 AA findings: 7H/2M/3L. Strengths: L5.6 shell solid (aria-live, aria-atomic, scoreAriaLabel, focus management). Findings parked for V triage (modal focus traps, LKWTimePicker keyboard access, pathway aria-live regions).

### OTHER P1 (not layer-blocked)
- [ ] [P1] Split TrialPageNew chunk (485kb) — lazy-load trial data
- [ ] [P1] Turnstile removal — Cloudflare account deleted, assess removing Turnstile from feedback form entirely
- [ ] [P1] Part B EMR template — replace three separate EMR generators with one locked template
- [ ] [P1] Full connectivity audit — verify every button, modal, tab transition, and data flow works end to end across all stroke pathway steps. Build a manual test checklist in docs/QA_CHECKLIST.md
- [x] [P1] SEO agent setup — 2026-05-13 overnight (commits 78d4588 / b62870b / 138d278 / 6388bd4 / b973458). 5-phase SEO program shipped: site audit (docs/seo-audit-2026-05-13.md), keyword research (docs/seo-keyword-research.md, training-data positions; GSC-authoritative pass deferred to morning), game plan (docs/seo-game-plan-2026.md, 30/60/90 day roadmap), governance update (CLAUDE.md §11/§16/§19 + seo-specialist.md + pm-agent.md per architect C1-C8), skill bundle (.claude/skills/seo-audit-execution/SKILL.md). Immediate wins shipped: 6 wrong sitemap pathway URLs corrected, 2 missing sitemap entries added (chads-vasc, aha-2026-guideline), 1 duplicate title differentiated. seo-specialist now co-fires with content-writer on public-indexable surfaces only (narrowed scope per architect C2).
- [ ] [P1] Design consistency audit — read every calculator and pathway page, compare against docs/MOCKUPS.md design tokens, output full report to docs/AUDIT.md. No fixes in this session, audit only. Pages to cover: all src/pages/guide/*, all calculator pages, TrialsPage, Home.
- [ ] [P1] Trials page visual redesign — implement Screen 5 from docs/MOCKUPS.md. Trial card format: name, one-sentence finding, key stat (NNT or ARR), p-value, guideline implication. Readable in 10 seconds. Category filter pills. Left border color by category.
- [ ] [P1] Trial interpretation agent — AI-powered layer that explains what each trial means clinically for a practicing neurologist. Requires component library (Layer 3) before implementation. Use Anthropic API in artifact pattern.

---

## W7.0 — Predecessor Trial Stubs

> Planning doc: docs/specs/predecessor-map.md (produced 2026-04-27)
> Gate: W6.9 (wiring historical context into landmark trials) is **blocked** until the relevant stubs below exist.
> Design note: HistoricalContextSection.tsx (TRIALS_SPEC §7a.4) is Archetype G only. A new RCT predecessor display pattern must be designed before any wiring begins — W6.9 tracks that design task.

### W6.9 — Wire historical context into landmark trials — Class C [UNBLOCKED]
- **Status:** unblocked (2026-04-28) — all 10 W7.0 predecessor stubs now exist; wiring can begin
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
- **Status:** planned — P2, L5
- **User-visible goal:** TrialPageNew canary back buttons (60+ trial page branches) resolve WCAG 2.5.3 "Target Size (Enhanced)" issue: visible trial name label conflicts with aria-label mismatch on small viewports.
- **Context:** Back button back-navigation swarm (W8.1) fixed the hook and integrated pattern; canary TrialPageNew branches now have touch targets in both label (trial name) and aria-label. On 375px viewport, the visible text may be truncated or wrapped while aria-label remains unchanged. Audit detects mismatch (visible vs announced text). Fix: align label rendering or aria-label content, test at 375px.
- **Non-goals:** no clinical content changes; no hook changes; presentation only
- **Acceptance checks:** 375px mobile QA pass; aria-label matches visible text or omit aria-label if visible text is self-describing; no WCAG 2.5.3 violations
- **Clinical impact:** none
- **Rollback plan:** n/a

#### W8.3 — Language cleanup: em-dash and prose standardization — Class C-clinical
- **Status:** planned — batch approach recommended
- **Source:** docs/audits/2026-language-audit.md
- **User-visible goal:** Clinical prose in trialData.ts is free of em dashes and double hyphens in user-facing fields (bedsidePearl, howToInterpret, howToReadChart, bottomLineSummary).
- **Sub-tasks (pattern-level, not per-trial):**
  - [ ] W8.3.1 — Batch 5C/5D `--` cleanup (decimal, destiny, hamlet, destiny-ii, timing, optimas): Fix ~15 double-hyphen instances in doesNotProve, cautions, bedsidePearl, howToReadChart. Structural pattern: "The primary endpoint -- mRS [X] -- was not statistically significant." Restructure or replace with colon/period. Class C-clinical (prose only, no threshold/logic changes).
  - [ ] W8.3.2 — Antiplatelet section `--` cleanup (eagle, escape-na1, socrates, sps3, sparcl): Fix ~9 double-hyphen instances in bedsidePearl and doesNotProve. Class C-clinical.
  - [ ] W8.3.3 — TRACE-III / THAWS `—` cleanup: Fix 6 true em-dash instances across bedsidePearl, doesNotProve, cautions in these two trials. Highest schema severity (explicit "No em dashes" rule in TrialMetadata comments). Class C-clinical.
  - [ ] W8.3.4 — pearls[] and listDescription `—` sweep: Lower severity. Fix em dashes in pearls[] arrays and listDescription fields across all trials. Class B (display strings, no clinical meaning change).
- **Non-goals:** "essentially" phrasing is borderline; defer to PM; no structural rewriting
- **Acceptance checks:** grep for `—` and `--` in bedsidePearl, doesNotProve, cautions, howToReadChart, bottomLineSummary returns zero results
- **Clinical impact:** low (prose only, no threshold or interpretation changes)
- **Rollback plan:** n/a (prose changes; revert if any meaning change is detected post-review)

#### W8.4 — Add years to trial navigation surfaces — Class C
- **Status:** planned
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
- [ ] Archive /agents/dormant/compliance-legal.md and /agents/dormant/performance-optimizer.md to /agents/legacy/ once W3.6 completes and .claude/agents/ + .claude/skills/ are the canonical sources. Keep legacy copies untouched until then for rollback safety.
- [ ] Update .claude/agents/seo-specialist.md line references from routeMeta.ts → routeManifest.ts (content drift inherited from legacy source; canonical file is src/routeManifest.ts per commit 2a53994).
- [ ] Audit .claude/skills/performance.md for Next.js-specific code examples (next.config.js, next/font/google, pages/ router structure). Replace with Vite + React Router 7 equivalents where the pattern is transferable, or flag as non-applicable. Substantive performance knowledge (Core Web Vitals, code splitting, caching) applies regardless.
- [ ] Fix stray 'ç' character on line ~111 of .claude/skills/performance.md ("**Impact:**ç" → "**Impact:**") inherited from legacy source typo.
- [ ] Evaluate whether .claude/agents/accessibility-specialist.md should be split — ARIA patterns and code examples may belong in .claude/skills/accessibility.md, with the agent file reduced to role + activation triggers + decision rubric. Evaluate after W3.5 when the full agent roster is in place.
- [ ] Audit .claude/agents/mobile-first-developer.md for non-design-system Tailwind colors (blue-*, gray-*, etc.) inherited from legacy source. Replace with neuro-* tokens per CALCULATOR_SPEC. Also update @performance-optimizer handoff reference to .claude/skills/performance.md skill-load pattern.
- [ ] Archive /agents/active/ and /agents/dormant/ to /agents/legacy/ once all 17 agent briefs are confirmed stable in .claude/agents/
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
- **Status:** planned
- **User-visible goal:** ARD figures on primary stat tiles include 95% CI, matching ELAN pattern
- **Non-goals:** no archetype changes; no new components
- **Owner agents:** evidence-verifier (source CI values) → medical-scientist → trial-statistician (verify CI values) → clinical-reviewer
- **Files likely touched:** `src/data/trialData.ts` (add CI to `effectSize.label` or new `ardCI` field for NINDS, DAWN, DEFUSE-3, CHOICE entries)
- **Required artifacts:** evidence-verifier packet (CI values sourced from original publications) · trial-statistician confirmation · clinical-PR artifact `docs/reviews/clinical-PR<#>-ard-ci-tiles.md`
- **Acceptance checks:** 4 affected trial stat tiles display ARD with 95% CI · CI values traceable to source publications · tsc clean · build green · clinical-reviewer decision: approve
- **Audit source:** [trial-statistician.md F6: STAT-2](docs/reviews/full-repo-agent-audit/agents/trial-statistician.md)

#### Phase 2C — Fix DEFUSE-3 primaryEndpoint label (mRS 0-2 → mRS shift) — Class E
- **Priority:** P2
- **Status:** planned
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
- **Status:** planned
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
- **Status:** planned
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
- **Status:** planned
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
- **Status:** planned
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

### Phase 7E — NIHSS normal exam shortcut + live State B drawer — Class C — DONE commit 9c52fe9
- **Status:** merged
- **What shipped:** "Normal exam" shortcut button (sets all 15 items to 0, opens drawer). Live State B drawer — interpretation updates as user scores items before completing all 15. Drawer now shows severity label + running NIHSS total in real time.

### L5.5b — Add portal drawer to ASPECTS, HAS-BLED, RoPE, Boston Criteria — Class C — DONE commit fe650d8
- **Priority:** P1
- **Status:** merged
- **What shipped:** Portal drawer (State A→C state machine, content-before-button order, `left: var(--nav-rail-width, 0px)`) added to ASPECTS, HAS-BLED, RoPE, Boston Criteria. Inline interpretation blocks removed from main and relocated into drawer content. All 4: hasInteracted state tracking. No clinical copy changes. tsc clean · build green · claims clean.

---

## CONFIRMED CLEAN
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

## POST-MORTEMS
Regressions that required rollback. Each entry links to a post-mortem
doc in docs/YYYY_MM_DD/post-mortem-<slug>.md.
(none yet)
