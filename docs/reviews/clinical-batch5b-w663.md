# Clinical review — W6.6.3 Batch 5B

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-27

## Scope

- **Claims touched:** `enchanted-interpret`, `enchanted-pearl`, `charm-interpret`, `charm-pearl`, `escape-na1-interpret`, `escape-na1-pearl` (6 claim stubs; tagged via `/* claimId: ... */` adjacent comments per ADR-005 Option C)
- **Citations affected:** Anderson et al. Lancet 2019 (ENCHANTED, NCT01422616, doi:10.1016/S0140-6736(19)30038-8); Sheth et al. Lancet Neurol 2024 (CHARM, NCT02864953); Hill et al. Lancet 2020 (ESCAPE-NA1, NCT02930018, doi:10.1016/S0140-6736(20)30069-6); Fischer et al. NEJM 2023 (ELAN, NCT03148457, doi:10.1056/NEJMoa2303048 — metadata-only)
- **Surfaces changed:** Structured data in `src/data/trialData.ts` (howToInterpret, bedsidePearl, bottomLineSummary, howToReadChart, inclusion/exclusion criteria); JSX in `src/pages/trials/TrialPageNew.tsx` (per-trial render branches; CHARM amber early-stop banner; ENCHANTED secondary-finding amber banner); ENCHANTED `specialDesign` corrected from `'negative-trial'` to `'neutral-trial'`; ELAN archetypeId and doi added (no clinical content change)

## Semantic validity

### ENCHANTED (Anderson 2019)

All three carry-forward modification constraints verified:

- `proves` reports the primary mRS ordinal shift as null: OR 1.01 (95% CI 0.87-1.17, P=0.87). The secondary any-ICH finding (14.8% vs 18.7%, OR 0.75, P=0.014) is explicitly labeled as "pre-specified secondary outcome" within the same sentence. No claim of functional benefit anywhere in `proves`. ✓
- `doesNotProve` opens with the load-bearing statement: "A statistically significant secondary outcome (ICH reduction) does not establish clinical benefit when the primary endpoint is null." Explicitly rejects use of the ICH finding to change post-alteplase BP practice. Correctly notes the ICH reduction was in all-grade any-ICH (including small asymptomatic hemorrhagic transformation), not specifically symptomatic ICH. ✓
- `bedsidePearl` states "Do not use the secondary ICH finding to justify changing post-alteplase BP targets. Current standard (SBP below 180 mm Hg) remains the evidence-based practice." No upgrade of secondary to primary; no functional benefit claim. ✓
- JSX amber banner inside the primary outcome card correctly labels the ICH finding as secondary and states "Significant reduction in hemorrhage was not accompanied by improvement in the primary functional outcome." ✓

### ESCAPE-NA1 (Hill 2020)

All carry-forward modification constraints verified:

- `proves` reports only the null primary: 61.4% vs 59.2%, adjusted RR 1.04 (95% CI 0.96-1.13, P=0.35). No mention of the alteplase-free subgroup in `proves`. ✓
- `doesNotProve` explicitly states: "the prespecified interaction suggesting differential benefit in alteplase-free patients (59.3% vs 49.8%) is hypothesis-generating only and does not constitute clinical evidence for any practice change." Directly addresses alteplase: "No clinical decision, including alteplase withholding, should be based on a subgroup interaction in an overall neutral trial." ✓
- `cautions` confines the alteplase-free subgroup data numerically and labels clinical actionability inference as "premature." References ESCAPE-NEXT as the appropriate replication vehicle. ✓
- `bedsidePearl` disciplines directly: "do not alter thrombolysis decisions or advocate for nerinetide use based on this finding. Neuroprotection after EVT remains unproven." ✓
- The existing `pearls` array (not changed in this batch) mentions the subgroup numerically but in descriptive terms; this is pre-existing content, within acceptable bounds.

### CHARM (Sheth 2024)

All carry-forward modification constraints verified:

- `proves` reports cOR 1.17 (95% CI 0.80-1.71, P=0.42) null and explicitly states the trial "was stopped early due to COVID-19 operational disruptions before reaching planned enrollment." Mortality numerically higher with glibenclamide; hypoglycemia 6% vs 2% stated. ✓
- `cautions` opens with: "Stopped early for COVID-19 operational reasons (not for safety or futility) at approximately 71% of planned enrollment; findings are inconclusive." Explicitly distinguishes the stop reason from safety/futility. ✓
- `doesNotProve` explicitly labels the core volume less than 125 mL subgroup as "hypothesis-generating only and cannot serve as a clinical recommendation." ✓
- JSX amber banner renders the COVID early-stop context visibly above the primary outcome card, including the CI breadth ("excludes neither meaningful benefit nor meaningful harm"). Banner is semantically accurate and consistent with the data-layer claim text. ✓
- `bedsidePearl` correctly directs against IV glibenclamide outside trials and names DESTINY II/HAMLET/DECIMAL as the evidentiary anchor for hemicraniectomy. ✓

### ELAN — metadata-only fix confirmed

- `archetypeId: 'A' as const` and `doi: '10.1056/NEJMoa2303048'` added. No change to `howToInterpret`, `bedsidePearl`, `bottomLineSummary`, `howToReadChart`, or `pearls`. No clinical drift introduced. ✓

## Citation accuracy

- **ENCHANTED** (Anderson 2019, Lancet, doi:10.1016/S0140-6736(19)30038-8, NCT01422616): primary OR 1.01 (95% CI 0.87-1.17, P=0.87); secondary any-ICH 14.8% vs 18.7%, OR 0.75, P=0.014 — all match published figures. ✓
- **ESCAPE-NA1** (Hill 2020, Lancet, doi:10.1016/S0140-6736(20)30069-6, NCT02930018): primary RR 1.04 (95% CI 0.96-1.13, P=0.35); alteplase-free subgroup 59.3% vs 49.8% — match. ✓
- **CHARM** (Sheth 2024, Lancet Neurol, NCT02864953): cOR 1.17 (95% CI 0.80-1.71, P=0.42); 535 enrolled (~71% of planned); hypoglycemia 6% vs 2%; COVID operational early-stop reason; age 18-70 primary efficacy population — all match. ✓
- **ELAN** (Fischer 2023, NEJM, doi:10.1056/NEJMoa2303048, NCT03148457): DOI consistent with cited source string. ✓

## Freshness

`last_reviewed` field is deferred per W5.2. Underlying citations are stable landmark trials with no known superseding evidence as of 2026-04-27. No proactive refresh required at first sweep.

## Rationale

All three carry-forward modification constraints are honored without exception. ENCHANTED preserves the secondary-as-secondary discipline: the ICH finding is surfaced (not suppressed) but explicitly labeled secondary in both data-layer text and JSX, and the bedside pearl and doesNotProve actively guard against practice change. ESCAPE-NA1 confines the alteplase-free subgroup to cautions and doesNotProve with explicit prohibition on alteplase-withholding inference — the strongest possible guard short of omitting the subgroup entirely. CHARM correctly frames findings as inconclusive due to COVID early stop, distinguishes this from safety/futility stopping, and guards the core-volume subgroup as hypothesis-generating in doesNotProve. The amber JSX banners on both ENCHANTED and CHARM are semantically aligned with the data-layer claim text. ELAN's metadata-only update introduced no clinical drift. Approved for merge.

## Required follow-ups

None.
