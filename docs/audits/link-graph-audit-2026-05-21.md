# Link-graph audit — NeuroWiki — 2026-05-21

**Reviewer:** system-architect (read-only)
**Skills loaded:** engineering:architecture, stroke-guidelines
**Scope:** chain coverage, related-trials sidebar, question crosslinks, calculator→trials, guide→trials/calculators, /trials/timeline route.
**Inputs read:** `src/data/trialChainRegistry.ts`, `src/data/trial-questions.ts`, `src/data/trialData.ts` (101 trials enumerated), `src/pages/guide/*` (18 files), calculator pages in `src/pages/`.

> All chain-assignment calls and trial→calculator mappings below are FLAGGED for `medical-scientist` / `clinical-reviewer` ratification. This is a work-list, not a clinical-approval document.

---

## Executive summary (for V — plain English)

- Today the trial catalog has 101 entries but only 15 are wired into a "story chain" — the rest live as islands. A visitor reading about EVT in basilar stroke can navigate the lineage; a visitor reading about EVT in anterior LVO sees a dead end. Closing this gap is the single highest-leverage internal-linking move on the site.
- Every trial detail page is also a dead end laterally — there is no "related trials" sidebar. A clinician reading DAWN cannot one-click to DEFUSE-3, SELECT2, or the question hub. A small sidebar component on the trial page is the cheapest internal-link multiplier we have.
- The 22 question pages don't reference each other. PFO closure, cryptogenic stroke, and asymptomatic carotid stenosis are clinically adjacent but visit each other only via the catalog. A two-line schema addition turns the question hub into a graph instead of a list.
- Calculators currently sit on islands — the clinician sees a score but not the trials that justified the threshold. Adding "trials informing this threshold" to each calculator surfaces evidence the clinician already needs at the bedside, and gives nine high-traffic pages outbound links to ~30 high-traffic trial pages.
- An 18-page guide layer references trials by name in prose but doesn't link to them. Linking the proper nouns is the highest-volume, lowest-risk wiring task on the site.
- A `/trials/timeline` route, sketched at the bottom, is one large page that links to every trial in chronological order — a single page that materially improves SEO crawl depth for the full catalog.

**Recommended order (impact × effort × clinical-review burden):** see final section.

---

## 1. Chain coverage gap — trial → proposed chain map

### 1.1 Current state

Five chains shipped, 15 trials mapped:

| Chain id | Members in catalog (chainMembership populated) |
|---|---|
| `hemicraniectomy` | decimal · destiny · hamlet · destiny-ii (4) |
| `basilar-evt` | best · basics · attention · baoche (4) |
| `pfo-closure` | close · respect · reduce (3) |
| `carotid` | crest (predecessor) · crest-2 (successor) (2) |
| `evt-mevo` | distal · escape-mevo (2) |

**Total:** 15 of 101 trials carry `chainMembership`. **Gap: 86 trials.**

### 1.2 Proposed new chains

Parked already (per V's note): `antiplatelet-acute`, `evt-anterior`, `evt-bridging`, `ivt-tenecteplase`, `doac-after-af`. The audit below confirms each of these is well-populated and adds further chains the catalog clearly supports.

| Proposed chain id | Narrative anchor | Trials to assign | Note for medical-scientist |
|---|---|---|---|
| **`evt-anterior`** (parked) | Foundational EVT in anterior LVO — 2015 quintet → 2018 late-window expansion | mr-clean (predecessor) · escape · extend-ia · swift-prime · revascat · thrace · dawn · defuse-3 (cohort/successor depending on era split) | Decide whether `dawn` + `defuse-3` belong here or in a separate `evt-late-window` chain (see below). Recommend `evt-anterior` covers 2015 quintet + thrace; late-window splits out. **FLAG** |
| **`evt-bridging`** (parked) | Direct EVT vs IVT-bridging in EVT-eligible LVO | thrace (predecessor) · direct-mt · devt · skip · mr-clean-no-iv · swift-direct · direct-safe (current cohort) | Maps cleanly to the existing `direct-vs-bridging` question. Seven members. |
| **`evt-late-window`** (NEW — not in parked list) | Imaging-selected EVT 6–24 h | dawn · defuse-3 (cohort) · timeless (adjacent IVT framework — exclude or mark predecessor) | **FLAG**: should this be a sub-chain of `evt-anterior` or its own chain? Architect view: separate chain — different selection paradigm. |
| **`evt-large-core`** (NEW) | Large-core EVT — five-RCT inflection 2022–24 | rescue-japan-limit (predecessor) · select2 · angel-aspect · tension · laste (cohort/successor) | Maps to the `large-core-evt` question. Five members. Sharp clinical narrative. |
| **`evt-technique`** (NEW) | Aspiration-first vs stent-retriever-first | aster (predecessor) · compass · aster2 (cohort) | Three members; maps to `aspiration-vs-stentriever` question. |
| **`evt-adjunct-pharma`** (NEW) | Pharmacologic adjuncts during EVT | escape-na1 · choice · rescue-bt (cohort) | Three members; maps to `evt-adjunct-pharmacotherapy` question. **FLAG**: are these one chain or three independent questions? medical-scientist call. |
| **`ivt-tenecteplase`** (parked) | TNK lineage vs alteplase, 2017 → 2024 | nor-test (predecessor) · extend-ia-tnk · act · nor-test-2-part-a · taste · twist · attest-2 · trace-2 · original · timeless · trace-iii · raise (cohort/successor by era) | 12 members. Largest chain in the catalog. Sub-split candidates: `ivt-tnk-standard-window`, `ivt-tnk-late-window`, `ivt-tnk-wake-up`. **FLAG**: single chain vs three sub-chains is a medical-scientist call; recommend single chain with role markers. |
| **`ivt-classic-window`** (NEW) | Foundational IVT in standard windows | ist (predecessor) · cast (predecessor) · ninds (predecessor) · ecass3 (cohort) · wake-up (successor) · extend (successor) · prisms (boundary) | Seven members. The "what we knew before TNK" chain. |
| **`ivt-reversal-context`** (NEW) | Post-IVT hemorrhage reversal context | none direct — `heidelberg` calculator anchors; not a trial chain | Skip — no chain. |
| **`antiplatelet-acute`** (parked) | DAPT after TIA/minor stroke | chance (predecessor) · point · thales · chance-2 · aramis · inspires (cohort) · sps3 (boundary — duration harm) · match (boundary — long-term harm) · charisma (boundary) | Nine members including the negative-boundary trials. **FLAG**: should `sps3`, `match`, `charisma` be in this chain as "boundary" predecessors, or in a separate `antiplatelet-long-term-harm` chain? Architect view: same chain with `role: predecessor` and clear narrative noting "duration boundary." |
| **`doac-after-af`** (parked) | Timing of anticoag initiation after AF stroke | timing · elan-study · optimas (cohort) | Three members. Tight chain. |
| **`bp-post-evt`** (NEW) | Post-EVT blood-pressure target | bp-target (predecessor) · best-ii · optimal-bp (cohort) | Three members; cleanly maps to `post-evt-bp-target` question. Excludes `enchanted` (peri-IVT, different paradigm). |
| **`bp-prehospital`** (NEW) | Prehospital BP intervention | right-2 (predecessor) · mr-asap · interact4 (cohort) | Three members. |
| **`msu-prehospital`** (NEW) | Mobile stroke unit dispatch | b-proud (predecessor) · best-msu (cohort) | Two members. **FLAG**: `right-2` and `interact4` are "operational analogues" per the question hub — leave out of this chain to keep narrative tight; they belong to `bp-prehospital`. |
| **`ich-surgery`** (NEW) | Surgical evacuation in supratentorial ICH | stich-i (predecessor) · stich-ii · mistie-iii (cohort) · enrich (successor) | Four members. |
| **`ich-anticoag-reversal`** (NEW) | Reversal of anticoagulation in ICH | sarode-2013 (predecessor) · patch (predecessor — boundary) · annexa-4 (cohort) · annexa-i (successor) | Four members; maps to `ich-anticoagulation-reversal` question. |
| **`icas-stenting`** (NEW) | Symptomatic intracranial atherosclerosis stenting | sammpris (predecessor) · weave (cohort) | Two members; tight harm-signal narrative. |
| **`evt-historical-negative`** (NEW) | First-generation EVT RCTs (2013, all negative) | ims-iii · synthesis-expansion · mr-rescue (cohort) | Three members. **FLAG**: medical-scientist call — keep as own chain or attach as predecessors to `evt-anterior`? Recommend own chain — design heterogeneity is the teaching point. |
| **`crao-thrombolysis`** (NEW) | CRAO thrombolysis | eagle (predecessor) · theia (cohort) | Two members. |

### 1.3 Trials confirmed standalone (no chain expected) — FLAG for medical-scientist

| Trial id | Why standalone |
|---|---|
| `racecat-trial` | Pre-hospital triage RCT (Catalonia) — paradigm-of-one, no lineage in catalog |
| `triage-stroke-trial` | Same paradigm, no peer trials in catalog |
| `enchanted-trial` | Sits in two contexts (BP + alteplase dose); cleaner to leave standalone than to over-assign. **FLAG** |
| `sparcl-trial` | Statin secondary prevention — no peers in current catalog |
| `socrates-trial` | Ticagrelor monotherapy — orphan pending TIA-monotherapy chain |
| `profess-trial` | Telmisartan + ASA/dipyridamole — orphan |
| `prost-trial` · `prost-2-trial` | **FLAG**: need to know what these are; couldn't confirm clinical context in this audit pass. medical-scientist confirm. |

### 1.4 Summary

- 15 trials currently in chains; **86 trials in scope for chain assignment.**
- Proposed: **5 parked chains + 14 new chains = 19 total** beyond the 5 shipped.
- After full implementation: ~85 of 101 trials in a chain, ~16 legitimate standalones.
- Every chain assignment is FLAGGED — this is the work-list V approves before clinical-reviewer ratifies.

---

## 2. Related-trials sidebar — design

### 2.1 Heuristic (priority-ordered)

For trial `T` on a detail page, derive up to 6 related trials as follows. Each tier returns 0..N candidates; iterate down the tiers until the list is full. Never include `T` itself.

1. **Same chain.** Iterate `T.chainMembership[]`; for each chain, pull all other trials whose `chainMembership` references the same chain id. Order: trials with the same `chainId` and an adjacent `role` first (e.g., predecessor → cohort → successor), then by year.
2. **Same listCategory + same trialResult direction.** Trials with `listCategory === T.listCategory` and (`trialResult === T.trialResult` OR matching `primaryResult`). Order by year proximity.
3. **Same listCategory, any result.** Same `listCategory`, year within ±3y of `T.year`.
4. **Same question membership.** Trials that appear with `T` in any `TRIAL_QUESTIONS[].trialIds`. (Requires importing the questions registry; cheap.)
5. **Same year ±3y, any category.** Last-resort tier — usually only used for orphan trials.

Tag each candidate with the reason it was surfaced (`reason: 'chain' | 'category' | 'question' | 'era'`) so the UI can render a small subhead per group.

### 2.2 Component shape

```
src/components/trials/RelatedTrialsSidebar.tsx
  Props: { currentTrialId: string }
  Internal: useMemo over TRIAL_DATA + TRIAL_QUESTIONS + TRIAL_CHAINS
  Output: grouped list — "From the same chain" / "Same category" / "Related question"
```

- Data shape needed from `trialData`: id, title, year, listCategory, trialResult, chainMembership, category — all already present. No schema change required.
- Citation-safe: this component surfaces *navigation*, not claims. No `data-claim` tagging burden.
- Performance: cap candidate generation at the 6 returned; memo on `currentTrialId`. Catalogue is 101 records — full-scan is trivial.

### 2.3 Placement in `TrialPageNew.tsx`

- **Generic fallback first.** Mount the sidebar in the page shell, alongside (not inside) the archetype branches. All seven archetypes get it for free.
- **Archetype branches stay focused on rendering the trial itself.** No archetype-specific related-trials logic in v1.
- **Layout:** below the fold on desktop (right rail), collapsed accordion on mobile (375px). Don't push primary content down.
- **A11y:** wrap in `<aside aria-label="Related trials">`; each link is a regular `<Link>` (React Router).

### 2.4 Concerns to FLAG

- Tier 4 (same question) creates a hidden coupling between `trialData` and `trial-questions.ts`. Acceptable — the question hub is the existing curatorial layer — but document the dependency.
- Tier-3 fallback ("same category, any result") can surface trials that contradict each other (positive next to negative). This is *desirable* clinically but worth a sentence in the sidebar header: "Related trials may show different outcomes."

---

## 3. Question-hub crosslinks

### 3.1 Schema addition (proposed)

```typescript
export interface TrialQuestion {
  // ...existing...
  relatedQuestions?: string[]; // ordered, max 3, by clinical adjacency
}
```

### 3.2 Proposed crosslink map (22 questions)

| Question id | relatedQuestions[] | Rationale |
|---|---|---|
| `tpa-timing` | `tnk-vs-alteplase`, `late-window-selection`, `minor-stroke-choice` | "When to give" and "what to give" are sibling questions |
| `lvo-evt` | `large-core-evt`, `late-window-selection`, `direct-vs-bridging`, `mevo-distal-evt` | Core EVT graph — strong cluster |
| `anticoagulation` | (none — orphan until ESUS/AF expansion lands) | **FLAG**: trialCount=3 is sparse |
| `hemicraniectomy` | `ich-surgery` | Adjacent surgical-decompression question |
| `bp-control` | `post-evt-bp-target` | Same domain, different temporal window |
| `dapt` | `minor-stroke-choice`, `tpa-timing` | DAPT competes with IVT in mild stroke |
| `basilar-evt` | `lvo-evt`, `late-window-selection` | Posterior EVT shares paradigm with anterior |
| `ich-surgery` | `ich-anticoagulation-reversal`, `hemicraniectomy` | All three are ICH/surgical decompression |
| `msu-dispatch` | `bp-control`, `tpa-timing` | Prehospital paradigm cluster |
| `icas-stenting` | `asymptomatic-carotid`, `lvo-evt` | Atherosclerotic intervention cluster |
| `tnk-vs-alteplase` | `tpa-timing`, `late-window-selection`, `minor-stroke-choice` | Agent choice is one axis of the "give IVT" decision |
| `direct-vs-bridging` | `lvo-evt`, `tnk-vs-alteplase` | Bridging strategy depends on agent choice |
| `large-core-evt` | `lvo-evt`, `late-window-selection`, `mevo-distal-evt` | EVT-boundary cluster |
| `late-window-selection` | `lvo-evt`, `large-core-evt`, `tpa-timing` | Imaging-selection bridges IVT + EVT |
| `aspiration-vs-stentriever` | `lvo-evt`, `evt-adjunct-pharmacotherapy` | Technique sub-questions |
| `evt-adjunct-pharmacotherapy` | `lvo-evt`, `aspiration-vs-stentriever` | Adjunct → technique sibling |
| `minor-stroke-choice` | `dapt`, `tpa-timing`, `tnk-vs-alteplase` | Mild stroke is the natural overlap |
| `mevo-distal-evt` | `lvo-evt`, `large-core-evt` | EVT-boundary cluster |
| `post-evt-bp-target` | `bp-control`, `lvo-evt` | Post-procedural BP is a sub-question of BP control |
| `pfo-closure-cryptogenic` | `anticoagulation`, `asymptomatic-carotid` | Cryptogenic-stroke workup adjacencies. **FLAG**: no `cryptogenic-stroke-workup` question exists yet — V parking-lot candidate. |
| `asymptomatic-carotid` | `icas-stenting`, `pfo-closure-cryptogenic` | Vascular-revasc cluster |
| `ich-anticoagulation-reversal` | `ich-surgery`, `anticoagulation` | ICH cluster + anticoag overlap |
| `crao-management` | `tpa-timing`, `tnk-vs-alteplase` | Adjacent thrombolysis question — small niche |

### 3.3 Notes

- Cap `relatedQuestions` at 3 to prevent the rail from becoming a dump. The cluster pattern shows up cleanly at 3.
- **Cycles are fine** — questions are non-hierarchical. A bidirectional cluster like `lvo-evt ↔ large-core-evt ↔ late-window-selection` is correct.
- This is non-clinical wiring (taxonomy, not claims) — `medical-scientist` should still confirm clusters, but no `last_reviewed` impact.

---

## 4. Calculator → trials map

### 4.1 Calculators in catalog

`NihssCalculator` · `AspectScoreCalculator` · `Abcd2ScoreCalculator` · `HasBledScoreCalculator` · `GlasgowComaScaleCalculator` · `IchScoreCalculator` · `RopeScoreCalculator` · `Cha2ds2VascCalculator` · `HeidelbergBleedingCalculator` · `BostonCriteriaCaaCalculator` · `EmBillingCalculator`

### 4.2 Proposed calculator → trial mapping

All assignments below are FLAGGED for `medical-scientist` confirmation. The strongest are NIHSS, ASPECTS, ICH, Heidelberg; the weakest are RoPE and Boston (these scores predate or live outside the trial catalog).

| Calculator | Informing trials in catalog | Notes |
|---|---|---|
| **NIHSS** | `ninds`, `ecass3`, `extend`, `wake-up`, `prisms`, `aramis`, `inspires`, `dawn` (NIHSS-based core mismatch) | NIHSS thresholds drive IVT eligibility (≥6 in many trials) and EVT inclusion (DAWN). NINDS established the score as a treatment-effect modifier. **FLAG** — multiple secondary trials use NIHSS as cutoff; medical-scientist trims. |
| **ASPECTS** | `mr-clean`, `escape`, `swift-prime`, `revascat`, `extend-ia`, `dawn`, `defuse-3`, `select2`, `angel-aspect`, `tension`, `laste`, `rescue-japan-limit` | ASPECTS ≥6 was the early-window standard; the large-core five (RJL, SELECT2, ANGEL-ASPECT, TENSION, LASTE) extended into ≤5 territory. |
| **ABCD2** | (no direct RCT match in current catalog) | **FLAG**: ABCD2 derivation is observational (Johnston 2007 Lancet). May not have a trial-page anchor. Map to `chance` + `point` as "trials that operationalize TIA risk-stratification"? medical-scientist call. |
| **HAS-BLED** | (no direct RCT match) | **FLAG**: derivation observational. Adjacent trials: `timing`, `optimas`, `elan-study` (DOAC timing context). |
| **GCS** | (no direct RCT match — GCS is a clinical tool predating modern RCTs) | Anchor in guide pages, not trial pages. Skip the trials cross-link. |
| **ICH Score** | `stich-i`, `stich-ii`, `mistie-iii`, `enrich`, `annexa-i`, `patch` | ICH-Score-aligned ICH RCTs. Strong cluster. |
| **RoPE Score** | `close`, `respect`, `reduce` | RoPE risk stratification informs PFO-closure trial enrollment criteria — high-yield link. |
| **CHA₂DS₂-VASc** | `timing`, `optimas`, `elan-study` | Same anticoag-timing cluster as HAS-BLED. |
| **Heidelberg Bleeding** | `ecass3`, `extend`, `wake-up`, `mr-clean`, `enchanted` | Post-IVT/EVT hemorrhage classification — anchor in IVT trials that established symptomatic ICH definitions. **FLAG**. |
| **Boston Criteria (CAA)** | (no direct RCT in catalog) | Diagnostic criteria, not RCT-derived. Skip the trials cross-link or add a single editorial note. |
| **EM Billing** | (out of scope — administrative, not clinical) | Skip. |

### 4.3 Composition pattern

Add a single `<CalculatorTrialEvidence calculatorId="aspects" />` component below the result card. Data lives in a new module:

```
src/lib/calculatorTrialMap.ts
  export const CALCULATOR_TRIAL_MAP: Record<CalculatorId, string[]> = { ... };
```

Component reads the array, looks up titles + years from `TRIAL_DATA`, renders a 3–6 item list with links. No clinical-claim tagging unless the editorial note above each list makes a guideline statement (then tag).

---

## 5. Guide → trials + calculators map

### 5.1 Method

Read across `src/pages/guide/*.tsx` (18 files) and pattern-matched on trial names and calculator names. Counts of matches per file in skim:

- `IvTpa.tsx` — 14 trial references
- `StrokeBasicsWorkflowV2.tsx` — 10 trial references
- `Thrombectomy.tsx` — 9 trial references
- `IchManagement.tsx` — 3 trial references
- `AcuteStrokeMgmt.tsx` — 1 trial reference
- Other 13 files — 0 hits in this skim. **FLAG** for content-writer to confirm absence is real (some likely reference trials by acronym not caught in skim, e.g., GBS / MG / MS pages may reference disease-specific trials not in this catalog).

### 5.2 Proposed map (high-confidence subset)

| Guide page | Likely trials referenced | Likely calculators referenced |
|---|---|---|
| `IvTpa` | ninds, ecass3, wake-up, extend, prisms, act, twist, original, raise, extend-ia-tnk, trace-2, trace-iii, timeless, attest-2 | NIHSS, Heidelberg |
| `Thrombectomy` | mr-clean, escape, extend-ia, swift-prime, revascat, dawn, defuse-3, select2, angel-aspect, tension, laste, escape-mevo, distal | NIHSS, ASPECTS |
| `StrokeBasicsWorkflowV2` | ninds, ecass3, mr-clean, dawn, defuse-3, attention, baoche, enchanted (10 hits in skim) | NIHSS, ASPECTS |
| `IchManagement` | stich-i, stich-ii, mistie-iii, enrich, annexa-i, patch, sarode-2013 | ICH Score, Heidelberg, Boston |
| `AcuteStrokeMgmt` | ninds, ecass3, mr-clean, dawn (broader strokes) | NIHSS, ASPECTS, GCS |
| `StrokeBasics` | (likely catalog-level; FLAG content-writer) | NIHSS |
| `StrokeGuidelineMindmap` | (mindmap — many trials by name; FLAG) | (probably all) |
| `StatusEpilepticus` | (no overlapping trials in current stroke-focused catalog) | (none) |
| `SeizureWorkup` | same | (none) |
| `Meningitis`, `Gbs`, `MyastheniaGravis`, `MultipleSclerosis`, `Vertigo`, `HeadacheWorkup`, `AlteredMentalStatus`, `WeaknessWorkup` | (out of scope of stroke-trial catalog) | (none) |
| `StrokeBasicsLayout` | (layout shell — no clinical content) | (none) |

### 5.3 Wiring pattern

- Add an inline `<TrialRef id="dawn-trial">DAWN</TrialRef>` component that wraps the trial name and links to `/trials/dawn-trial`. Same for `<CalcRef id="aspects">ASPECTS</CalcRef>`.
- Both components are link-only (no claim semantics). Implementation belongs in `src/components/inline/` or similar — small enough that it doesn't need its own module.
- Citation-safe: this is *linking* existing prose, not making new clinical statements. No `data-claim` impact unless wrapped prose itself is currently untagged (in which case the wrap is a no-op on the tag).

---

## 6. /trials/timeline route — design sketch

### 6.1 Class

Class C (new route, no clinical-logic change, all content already exists). Becomes C-clinical only if the page adds new editorial copy (intro paragraph, chain narratives shown inline). Recommend keeping editorial minimal in v1 to stay Class C.

### 6.2 Route + structure

- Path: `/trials/timeline`
- Registered in `src/App.tsx` per `.claude/skills/routing/SKILL.md`.
- Entry in `routeManifest.ts`: title "Stroke Trials Timeline — NeuroWiki", zone `trials`, navTab existing.

### 6.3 Visual structure

```
[H1] Stroke Trials Timeline — 1990 to present
[Filter chips row: All · Thrombolysis · Thrombectomy · Acute Mgmt · Antiplatelets · Carotid]
[Optional: Chain overlay toggle — show colored bars for each chain across years]
[Year markers, descending or ascending — pick one, recommend ascending for narrative flow]
  1995 ── NINDS
  2008 ── ECASS III
  2010 ── CREST · EAGLE
  2013 ── STICH II · CHANCE · IMS-III · SYNTHESIS · MR RESCUE
  2015 ── MR CLEAN · ESCAPE · EXTEND-IA · SWIFT PRIME · REVASCAT
  2018 ── DAWN · DEFUSE-3 · POINT · PRISMS · EXTEND-IA TNK · WAKE-UP
  ...
[Each entry: trial name → trial page link · listCategory pill · primaryResult badge]
```

### 6.4 Data layer

- Source: `TRIAL_DATA` already carries year (sometimes inside source string — **FLAG**: confirm a stable `year` field exists or extract once and cache).
- Chain overlay: read `TRIAL_CHAINS` + `chainMembership` cross-product.
- No new data files needed.

### 6.5 SEO value

- One page → 101 internal trial-page links → significant crawl-depth improvement.
- Chronological + filter chips → good user signal for queries like "stroke trials by year" or "EVT trials 2018."
- Co-fire `seo-specialist` on this route (it qualifies as public-indexable per §11).

### 6.6 Acceptance risk

- Mobile rendering of a 101-entry vertical timeline needs care. Recommend `mobile-first-developer` review of the year-marker rail at 375px before merge.
- Filter-chip state should be URL-param-backed (`?cat=thrombectomy`) so links are shareable.

---

## Recommended execution order

Ranked by **(internal-link yield) × (low review burden) ÷ (effort)**. Top of list first.

1. **Calculator → trials map (Phase 4).** Nine calculator pages each gain 3–6 outbound trial links. Pure content addition, no clinical-logic change. C-clinical (small). Highest yield per review-minute.
2. **Question-hub crosslinks (Phase 3).** Two-line schema change + curated `relatedQuestions[]` per question. Non-clinical wiring. Class C. Cheapest high-leverage change.
3. **Related-trials sidebar (Phase 2).** Single new component, no data changes. 101 trial pages gain a lateral-navigation panel. Class D (cross-boundary into TrialPageNew + new component) but mechanical. Architect re-review on the sidebar PR specifically.
4. **Guide → trials/calculators linking (Phase 5).** Wrap existing prose with `<TrialRef>` / `<CalcRef>`. Highest absolute volume of new internal links; no new claims. C-clinical for the stroke-guide pages (clinical surfaces); needs `clinical-reviewer` ratification of *which* trials each guide names but not new content. Can be batched per-guide.
5. **Chain coverage expansion — Phase E (parked chains).** Add `chainMembership` fields for `antiplatelet-acute`, `evt-anterior`, `evt-bridging`, `ivt-tenecteplase`, `doac-after-af` first; ship each chain as one PR. D-clinical per chain. **Highest clinical-review burden** because each chain assignment is a curatorial judgment.
6. **Chain coverage expansion — Phase E continued (NEW chains).** `evt-large-core`, `evt-late-window`, `evt-technique`, `evt-adjunct-pharma`, `ivt-classic-window`, `bp-post-evt`, `bp-prehospital`, `msu-prehospital`, `ich-surgery`, `ich-anticoag-reversal`, `icas-stenting`, `evt-historical-negative`, `crao-thrombolysis`. Each is a separate D-clinical PR.
7. **/trials/timeline route.** New route; depends on chain data being mostly populated for the chain-overlay feature. Ship after item 5 lands. Class C (or C-clinical if intro copy added). Co-fire `seo-specialist`.

**Order rationale:**
- Items 1–4 are link-graph wiring with low clinical risk and high yield. They can run in parallel if V wants.
- Items 5–6 dominate clinical-reviewer time; sequence them after the cheap wins to avoid bottlenecking the reviewer queue.
- Item 7 benefits from items 5/6 landing first (the chain-overlay feature relies on populated `chainMembership`).

---

## FLAGS summary for medical-scientist / clinical-reviewer

The following calls in this audit are explicitly NOT architect decisions — they need clinical ratification before any chain-membership PR ships:

1. Whether `dawn` + `defuse-3` belong in `evt-anterior` or a separate `evt-late-window` chain.
2. Whether `ivt-tenecteplase` is one chain or sub-split into standard-window / late-window / wake-up.
3. Whether `sps3`, `match`, `charisma` join `antiplatelet-acute` as boundary predecessors or get their own `antiplatelet-long-term-harm` chain.
4. Whether `escape-na1`, `choice`, `rescue-bt` are one chain (`evt-adjunct-pharma`) or three independent orphans.
5. Whether `enchanted-trial` joins `bp-post-evt`, `bp-prehospital`, or stays standalone.
6. `prost-trial` and `prost-2-trial` clinical context — not confirmed in this audit pass.
7. Calculator → trials assignments for ABCD2, HAS-BLED, Heidelberg — derivation studies vs RCT operationalization.
8. The "no cryptogenic-stroke-workup question yet" gap referenced under `pfo-closure-cryptogenic` crosslinks.

---

**Relevant absolute paths for follow-up:**

- `src/data/trialChainRegistry.ts`
- `src/data/trialData.ts`
- `src/data/trial-questions.ts`
- `src/pages/trials/TrialPageNew.tsx`
- `src/pages/guide/` (18 files)
- `src/pages/` (12 calculator pages)
- `src/config/routeManifest.ts` (for the new `/trials/timeline` entry)
