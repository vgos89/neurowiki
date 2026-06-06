# Clinical review: RCT predecessor chains (Batch 2)

**Decision:** approve-with-conditions (conditions resolved; see footer)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-06

## Scope
- File: src/data/trialData.ts (4 new rctChain objects, data only; render already wired in TrialPageNew §7b)
- Chains reviewed:
  1. Basilar EVT: anchor attention-trial; predecessors best-trial, basics-trial
  2. Acute DAPT: anchor chance-trial; predecessors match-trial, charisma-trial
  3. ICH surgery: anchor enrich-trial; predecessors stich-i-trial, stich-ii-trial, mistie-iii-trial
  4. Hemicraniectomy: anchor destiny-ii-trial; predecessors decimal-trial, destiny-trial, hamlet-trial
- Citations affected (resolved in src/lib/citations/registry.ts): mendelow-stich-i-2005, mendelow-stich-ii-2013, hanley-mistie-iii-2019, pradilla-enrich-2024. Other predecessor facts verified against each predecessor's own trialData entry.
- Surfaces changed (§13.3): structured data in src/data/ (rctChain.chainNarrative, predecessors[], currentTrialResult, whatChanged), derived teaching language assembled from already-reviewed source entries.
- Evidence-verifier packet: not applicable. These are teaching-layer restatements of already-reviewed predecessor entries, not new primary-statistics displays or new archetypes.
- Trial-statistician report: not applicable except the ENRICH Bayesian framing, verified directly below.

## Per-chain semantic validity

### 1. Basilar EVT (attention-trial): confirmed, no drift
- BEST card matches best-trial entry: 2020, Lancet Neurology (Liu et al.), n=131, terminated early at 131 of 240, mRS 0-3 42% vs 32% (OR 1.74, 95% CI 0.81 to 3.74, P=0.23), crossover 22 of 65 medical-arm. The flagged journal check passes: the card uses Lancet Neurology 2020, not the predecessor-map's "NEJM".
- BASICS card matches basics-trial entry: 2021, NEJM (Langezaal et al.), n=300, mRS 0-3 44.2% vs 37.7% (RR 1.18, 95% CI 0.92 to 1.50, P=0.19), full enrollment, underpowered against higher-than-expected severity.
- currentTrialResult matches attention-trial: 46% vs 23%, adjusted RR 2.06 (1.46 to 2.91), P<0.001, NNT 4.3; mortality 37% vs 55%, adjusted RR 0.66 (0.52 to 0.82).
- Over-generalization check (the EVT-chain blocker): PASS. Crossover dilution is attributed to BEST and underpowering to BASICS as separate failure modes. BASICS is not assigned BEST's crossover.

### 2. Acute DAPT (chance-trial): confirmed, with one certainty-marker flag (now fixed)
- MATCH card matches match-trial entry: 2004, Lancet (Diener et al.), n=7599, 18 months, composite 15.7% vs 16.7% (RR 0.94, 95% CI 0.84 to 1.05, P=0.244), life-threatening bleeding doubled (2.6% vs 1.3%), comparator clopidogrel alone.
- CHARISMA card matches charisma-trial entry: 2006, NEJM (Bhatt et al.), n=15603, median 28 months, MI/stroke/CV death 6.8% vs 7.3% (RR 0.93, 95% CI 0.83 to 1.05, P=0.22), moderate bleeding 2.1% vs 1.3%.
- currentTrialResult matches chance-trial: 8.2% vs 11.7%, HR 0.68 (0.57 to 0.81), P<0.001, ARR 3.5%, NNT 29; moderate-to-severe hemorrhage 0.3% in both arms.
- Over-generalization check: PASS. MATCH (aspirin added to clopidogrel, 18 months) and CHARISMA (clopidogrel added to aspirin, 28 months) are kept as distinct comparisons; the thesis is duration and timing, not the drug combination.
- FLAG (certainty marker): the CHARISMA card whatWasMissing said "frank harm in the asymptomatic subgroup." CHARISMA's own entry reports that subgroup as RR 1.20, 95% CI 0.91 to 1.59 (crosses 1.0), a non-significant directional signal. "Frank harm" upgraded a trend to an established effect. Condition of approval.

### 3. ICH surgery (enrich-trial): confirmed, no drift
- STICH I card matches stich-i-trial entry and registry quoted_text: 2005, Lancet (Mendelow et al.), n=1033, favorable GOS 26% vs 24% (OR 0.89, 95% CI 0.66 to 1.19, P=0.414), equipoise rule, predominant open craniotomy.
- STICH II card matches stich-ii-trial entry and registry quoted_text: 2013, Lancet, n=601, superficial lobar only (10-100 mL, within 1 cm of cortex, no IVH), unfavorable outcome 59% vs 62% (OR 0.86, 95% CI 0.62 to 1.20, P=0.367). The card's "unfavorable 59% vs 62%" is the exact complement of the registry quoted_text "favourable 41% vs 38%" (same OR, same P), matching stich-ii-trial's own primaryOutcomeProse framing. No drift.
- MISTIE III card matches mistie-iii-trial entry: 2019, Lancet (Hanley et al.), n=506, catheter plus intermittent alteplase, mRS 0-3 at 1 year 45% vs 41% (adjusted OR 1.20, 95% CI 0.81 to 1.81, P=0.33), pre-specified 15 mL or less residual subgroup benefited.
- Over-generalization check (flagged risk): PASS. The narrative states STICH I and STICH II used open craniotomy and that MISTIE III used an image-guided catheter plus alteplase rather than open surgery. It does not collapse the three techniques.
- Bayesian-design check (mandatory): PASS. currentTrialResult reports UW-mRS 0.458 vs 0.374, difference +0.084 (95% Bayesian credible interval 0.005 to 0.163, posterior probability of superiority 0.981) and 30-day mortality 9.3% vs 18.0% (posterior probability 0.987). No efficacy NNT is presented and no frequentist p-value is substituted. Anterior basal ganglia futility halt noted. Consistent with primaryDesign 'bayesian-superiority' and the trial-statistics rule.

### 4. Hemicraniectomy (destiny-ii-trial): confirmed, no drift
- DECIMAL card matches decimal-trial entry: 2007, Stroke (Vahedi et al.), n=38, ages 18-55, stopped at 38 of 70 for pooled analysis, 6-month mortality 78% to 25% (ARR 52.8 points, P=0.001), primary mRS 3 or less not significant (25% vs 5.6%, P=0.18).
- DESTINY card matches destiny-trial entry: 2007, Stroke (Juttler et al.), n=32, ages 18-60, 30-day mortality 53% to 12% (ARR 41 points, P=0.02), primary mRS 0-3 not significant (47% vs 27%, P=0.23).
- HAMLET card matches hamlet-trial entry: 2009, Lancet Neurology (Hofmeijer et al.), n=64, ages 18-60, randomized up to 96 h, 1-year case fatality 59% to 22% (ARR 38 points, P=0.002), primary mRS 0-3 neutral overall, diluted by patients enrolled after 48 h.
- Framing check (mandatory): PASS. The three predecessors are framed as establishing a mortality benefit in age 60 or younger with functional primaries not individually significant, not as failures.
- Over-60 framing: PASS. currentTrialResult: mRS 0-4 38% vs 18% (OR 2.91, 95% CI 1.06 to 7.49, P=0.04), mortality 70% to 33%, no patient in either arm achieved mRS 0-2. Matches destiny-ii-trial pearls and howToReadChart. whatChanged frames the over-60 benefit as survival with severe disability rather than recovery, and flags the early stop (112 of 188) imprecision.

## Citation accuracy
- All four anchors and ten predecessors carry source attributions consistent with their own trialData entries. The four ICH-surgery citations verified in registry.ts resolve (PMID plus URL) and carry quoted_text supporting the chain-card numbers: mendelow-stich-i-2005 (PMID 15680453), mendelow-stich-ii-2013 (PMID 23726393), hanley-mistie-iii-2019 (PMID 30739747), pradilla-enrich-2024.
- Year/journal trap checked and cleared: BEST is cited as Lancet Neurology 2020, not "NEJM".
- No statistic requires escalation to trial-statistician. The single Bayesian display (ENRICH) is correctly expressed as posterior probability plus credible interval with no NNT or p-value substitution.

## Freshness
- ICH-surgery citations: last_reviewed 2026-05-23, review_window_months 36 (landmark trials). Within window. Pass.
- Predecessor facts for the other three chains are sourced from each predecessor's own already-reviewed entry, creating no new last_reviewed obligation. No freshness violation.

## Rationale
These are teaching-layer "what changed" chains that restate facts already carried in each predecessor's reviewed entry. Across all four chains the never-drift categories hold: recommendation strength, action framing, qualifiers (age ceilings, volume bands, time windows, severity thresholds, IVH exclusion), certainty markers, and temporal constraints are preserved, and every number traces to the source entry. The two errors that blocked the EVT chain (attributing one predecessor's property to another, and collapsing distinct techniques) are specifically absent here: BASICS is not assigned BEST's crossover, MISTIE III is not folded into open craniotomy, and the hemicraniectomy predecessors are framed as mortality-positive and function-neutral rather than as failures. The ENRICH Bayesian result is handled correctly. The only substantive issue was one certainty-marker upgrade ("frank harm" for a CI-crossing-1.0 subgroup) in the CHANCE chain, which the trial's own entry already phrases more conservatively.

## Required follow-ups
1. CHANCE chain, charisma-trial predecessor card, whatWasMissing: replace "frank harm in the asymptomatic subgroup" with wording matching the CHARISMA entry's own non-significant characterization (RR 1.20, 95% CI 0.91 to 1.59). Condition of approval. Does not change any displayed efficacy number.
2. Documentation-comment defect (not user-visible): the predecessor-stub batch header comment and the successorTrial fields on match-trial and charisma-trial name POINT (2018) as the successor, while this chain anchors on CHANCE (2013). Reconcile the comment or document why the stubs point to POINT while the rctChain anchors on CHANCE.
3. Evidence-verifier packet (process, non-blocking): none supplied. These chains restate already-reviewed entries and introduce no new primary-statistics display or archetype, so the packet requirement is not triggered. If the orchestrator later treats these as new trial-data surfaces, attach a packet and re-confirm the ENRICH Bayesian archetype with trial-statistician.
4. Optional editorial clarity (non-blocking): the ATTENTION whatChanged references a "0-12 hour" window, which is ATTENTION's own enrollment window (BEST used 8 h, BASICS 6 h). Accurate as written; worth a glance for reader clarity. No change required.

## Orchestrator resolution (2026-06-06)
- Follow-up 1 (binding) resolved: charisma-trial card whatWasMissing now reads "a harm signal in the asymptomatic subgroup (RR 1.20, 95% CI 0.91 to 1.59, not significant)." No displayed efficacy number changed.
- Follow-up 2 resolved: the Sub-batch 2 header comment now records CHANCE (2013) as the rctChain anchor and notes that the match/charisma successorTrial fields point to POINT (2018) as the later confirmatory trial. successorTrial data fields left unchanged (POINT is a valid downstream confirmatory trial); the apparent inconsistency is now documented in place.
- Follow-ups 3 and 4 are non-blocking and require no action for this PR.
