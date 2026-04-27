# TASKS.md — NeuroWiki Task Ledger

## ACTIVE

### W6.6.3 — Clinical content for remaining trial stubs — Class E-clinical [DONE]
- **Status:** done — Batches 5A/5B/5C/5D all merged
- **User-visible goal:** 13 trial stubs gain full clinical content (howToInterpret, bedsidePearl, bottomLineSummary, howToReadChart, inclusionCriteria, exclusionCriteria, archetypeId, doi, listCategory)
- **Batch 5A** (done — commit 8dcec26): BP-TARGET (negative, aOR 0.96), BEST-II (futility amber banner), OPTIMAL-BP (HARM, DSMB-stopped, trialResult NEGATIVE→HARM). Clinical review: docs/reviews/clinical-batch5a-w663.md (approve).
- **Batch 5B** (done — commit 898ec2d + 379c5b1): ENCHANTED (specialDesign neutral-trial, ordinalStats archetypeB, secondary ICH discipline), ESCAPE-NA1 (alteplase-free subgroup guarded in cautions), CHARM (COVID early-stop amber banner, core-volume subgroup guarded), ELAN (metadata fix only). Clinical review: docs/reviews/clinical-batch5b-w663.md (approve).
- **Batch 5C** (done — commit 379c5b1 trialData + 3ed5d2e JSX): DECIMAL (trialResult NEUTRAL, mortality 75%/22%, primary functional null P=0.18), DESTINY (NEUTRAL, 88%/47%, primary null P=0.23), HAMLET (NEUTRAL, 78%/41%, primary neutral overall, 48h window key teaching). Modification 3 pooled-analysis sentence identical across all three cautions. Clinical review: docs/reviews/clinical-batch5c-w663.md (approve).
- **Batch 5D** (done — commit 0a8f4a8): DESTINY II (POSITIVE per Modification 1 — proves co-locates primary endpoint + 0% mRS 0-2, doesNotProve disclaims functional independence/QoL in ≥60, family-counseling-grade bedsidePearl, amber QoL caveat banner above chart), TIMING (NEUTRAL NI-met, proves uses "non-inferior to", doesNotProve disclaims superiority), OPTIMAS (NEUTRAL NI-met, identical NI framing). Clinical review: docs/reviews/clinical-batch5d-w663.md (approve).
- **Non-goals:** CLAIM_REGISTRY wiring, last_reviewed dates (all deferred to W5.2)
- **Files touched:** src/data/trialData.ts · src/pages/trials/TrialPageNew.tsx · docs/reviews/clinical-batch5[a-d]-w663.md
- **Clinical impact:** high
- **Rollback plan:** git revert per-batch merge commit

- [x] [L4] Calculator visual redesign — GCS rebuilt via parallel swarm (375d9cf); CALCULATOR_SPEC.md locked. Remaining per-calculator audits (ICH, ROPE, HAS-BLED, ABCD2, Boston, Heidelberg) scheduled as Wave 5 Tier 1 audits after W5.4 ships. Entry retired 2026-04-19.

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

### L5.5 — Calculator compliance check swarm — Class B read-only
- **Status:** planned
- **Goal:** read 7 non-GCS/non-ICH calculators against CALCULATOR_SPEC.md v1.1. Produce prioritized rebuild list.
- **Files:** src/pages/Abcd2ScoreCalculator.tsx, AspectScoreCalculator.tsx, BostonCriteriaCaaCalculator.tsx, HasBledScoreCalculator.tsx, HeidelbergBleedingCalculator.tsx, NihssCalculator.tsx, RopeScoreCalculator.tsx
- **Not in scope:** clinical content audit, rebuilds themselves
- **Rollback:** no writes to source

## BLOCKED
(none)

## PARKING LOT
Ideas deferred from in-progress sessions. Not yet triaged into PENDING.
Entries format: - [YYYY-MM-DD] <idea> (parked during: <task>)
- [2026-04-17] Evaluate Claude Design (Anthropic Labs research preview, launched 2026-04-17) for potential integration with design-prototyper workflow. Currently research preview with ~50% reliability on complex tasks; revisit when maturity improves (~3-6 months). Could replace or augment HTML mockup authoring at docs/specs/mockups/. (parked during: W5.1 / end-of-session cleanup)
- [2026-04-22] W6.5 — Archetype B/Grotta Bar + DISTAL trial rebuild. DISTAL is a non-inferiority/negative MeVO trial; requires Grotta Bar component (mRS distribution shift) before page can be built. Park until Archetype B component is implemented. (parked during: W6 10-trial Archetype A rebuild)
- [2026-04-22] W6.6 — Archetype G + WEAVE trial rebuild. WEAVE is a single-arm safety registry; requires Archetype G (single-arm registry display) before page can be built. Park until Archetype G component is implemented. (parked during: W6 10-trial Archetype A rebuild)
- [2026-04-21] Patch C desktop drawer fix (--nav-rail-width) still needed for HeidelbergBleedingCalculator and ABCD2 calculator inline createPortal drawers — same left-0 bug. Out of scope this patch (only GCS + ICH were explicitly included). Tracked for next calculator audit wave. (parked during: Patches A/B/C)
- [2026-04-21] Consider adding `clinicalQuestion?: string` field to TrialMetadata schema (trialData.ts) so the §1.3 question lede can be data-driven rather than hardcoded per trial page. Not urgent — only EXTEND page exists today. (parked during: Patches A/B/C)

## PENDING

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
- [ ] [L4] Calculators.tsx rebuild
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

#### W6.7 — Design-quality disclaimer pattern in TRIALS_SPEC — Class C
- **Status:** parked — 2026-04-22
- **Context:** BEST-MSU quasi-experimental design requires a standardized amber disclaimer block. Pattern should be formalized in TRIALS_SPEC before next quasi-experimental trial rebuild.
- **Rollback:** n/a (docs only)

#### W6.8 — Surgical decompression category + DESTINY rebuild — Class C
- **Status:** parked — 2026-04-22
- **Context:** DESTINY (N=32, surgical decompression) is wrong category for IVT batch. Needs its own category page and archetype before rebuild.
- **Rollback:** n/a (not started)

#### W6.5-6.6 — DISTAL (Archetype B) + WEAVE (Archetype G) rebuilds — Class C
- **Status:** parked — 2026-04-22
- **Blocking:** Archetype B (Grotta Bar mRS shift component) and Archetype G (single-arm registry display) not yet implemented. Cannot build pages without components.
- **Rollback:** n/a (not started)

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

#### W6.5.4 — Codify Archetype B prose-narrative variant in TRIALS_SPEC — Class C
- **Status:** planned — 2026-04-24
- **User-visible goal:** n/a (spec update only; no user-visible change)
- **Non-goals:** no code change; no new component; no trial page rebuild
- **Context:** RIGHT-2 used a prose-narrative fallback for the primary outcome because Figure 2 is a raster image and per-segment percentages cannot be extracted without fabrication. This pattern (prose + stat row in place of Grotta Bar) is undocumented in TRIALS_SPEC v1.1. A future session should add a §3.5 "Prose-narrative variant" subsection specifying: when to apply (figure not text-extractable, mrsDistribution absent), required elements (prose paragraph, stat row, chart-absent note), and accessibility requirements. The RIGHT-2 branch in TrialPageNew.tsx is the reference implementation.
- **Files likely touched:** docs/specs/TRIALS_SPEC.md (§3.5 new subsection)
- **Acceptance checks:** spec section added · design-guardian co-sign issued
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
- [ ] [L5] Typography audit
- [ ] [L5] Spacing consistency audit
- [ ] [L5] Full mobile + desktop QA pass all pages
- [ ] [L5] Performance audit

### OTHER P1 (not layer-blocked)
- [ ] [P1] Split TrialPageNew chunk (485kb) — lazy-load trial data
- [ ] [P1] Turnstile removal — Cloudflare account deleted, assess removing Turnstile from feedback form entirely
- [ ] [P1] Part B EMR template — replace three separate EMR generators with one locked template
- [ ] [P1] Full connectivity audit — verify every button, modal, tab transition, and data flow works end to end across all stroke pathway steps. Build a manual test checklist in docs/QA_CHECKLIST.md
- [ ] [P1] SEO agent setup — create docs/SEO_SPEC.md with meta title, description, and JSON-LD spec for every route. Implement missing meta tags and structured data across all calculator and pathway pages. Pull forward from Layer 5.
- [ ] [P1] Design consistency audit — read every calculator and pathway page, compare against docs/MOCKUPS.md design tokens, output full report to docs/AUDIT.md. No fixes in this session, audit only. Pages to cover: all src/pages/guide/*, all calculator pages, TrialsPage, Home.
- [ ] [P1] Trials page visual redesign — implement Screen 5 from docs/MOCKUPS.md. Trial card format: name, one-sentence finding, key stat (NNT or ARR), p-value, guideline implication. Readable in 10 seconds. Category filter pills. Left border color by category.
- [ ] [P1] Trial interpretation agent — AI-powered layer that explains what each trial means clinically for a practicing neurologist. Requires component library (Layer 3) before implementation. Use Anthropic API in artifact pattern.

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

## CONFIRMED CLEAN
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

## POST-MORTEMS
Regressions that required rollback. Each entry links to a post-mortem
doc in docs/YYYY_MM_DD/post-mortem-<slug>.md.
(none yet)
