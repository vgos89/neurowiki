# Clinical review — W6.6.3 Batch 5C

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-27

## Scope

- **Claims touched:** `decimal-interpret`, `decimal-pearl`, `destiny-interpret`, `destiny-pearl`, `hamlet-interpret`, `hamlet-pearl` (6 claim stubs; tagged via `/* claimId: ... */` adjacent comments per ADR-005 Option C)
- **Citations affected:** Vahedi et al. Stroke 2007 (DECIMAL, doi:10.1161/STROKEAHA.106.483622); Jüttler et al. Stroke 2007 (DESTINY); Hofmeijer et al. Lancet Neurol 2009 (HAMLET, doi:10.1016/S1474-4422(09)70047-X)
- **Surfaces changed (per §13.3):** Structured data in `src/data/trialData.ts` — `howToInterpret` (proves/doesNotProve/cautions), `bedsidePearl`, `bottomLineSummary`, `pearls`, `howToReadChart`, `inclusionCriteria`, `exclusionCriteria`, `efficacyResults` (corrected to survival rates), `trialResult`, `specialDesign`, `archetypeId`, `doi`, `listCategory`; static JSX in `src/pages/trials/TrialPageNew.tsx` — three new trial branches (DECIMAL, DESTINY, HAMLET) with DeltaBandChart showing survival, `winnerArm="treatment"`, amber qualifier boxes for null primary endpoint

## Semantic validity

### Modification 3 — pooled-analysis sentence identity check (mandatory block condition)

Performed character-for-character comparison of the pooled-analysis sentence in `cautions` across all three trials:

- DECIMAL `cautions` (trialData.ts line 3371): terminal sentence of field
- DESTINY `cautions` (trialData.ts line 3470): terminal sentence of field
- HAMLET `cautions` (trialData.ts line 3570): terminal sentence of field

All three read exactly: *"Pooled analysis of DECIMAL, DESTINY, and HAMLET within 48 hours of stroke onset (HAMLET 2009, Figure 3) showed mortality ARR 49.9 percentage points (95% CI 33.9-65.9) and mRS greater than 4 ARR 41.9 percentage points (95% CI 25.2-58.6) favoring surgery."*

No drift in numerals, units, parenthetical attribution, CI bounds, or directionality. Block condition satisfied — proceed. ✓

### `proves` claims mortality only

- **DECIMAL:** "reduced 6-month mortality from 78% to 25%, an absolute reduction of 52.8 percentage points (P=0.001)" — labeled "primary established finding." No functional-independence claim. ✓
- **DESTINY:** "reduced 30-day mortality from 53% to 12%, an absolute reduction of 41 percentage points (P=0.02)" — labeled "primary established finding." No functional-independence claim. ✓
- **HAMLET:** "reduced 1-year case fatality from 59% to 22%, an absolute reduction of 38 percentage points (P=0.002)" — frames extension to 96 hours as a mortality extension only. No functional-independence claim. ✓

### `doesNotProve` explicitly states primary functional endpoint not met

- **DECIMAL:** "The primary endpoint -- mRS less than or equal to 3 at 6 months -- was not statistically significant in this sample (25% surgery vs 5.6% medical, P=0.18)." Endpoint named, P=0.18 stated. ✓
- **DESTINY:** "The primary endpoint -- mRS 0-3 at 6 months -- was not statistically significant in this 32-patient sample (47% surgery vs 27% conservative, P=0.23)." Endpoint named, P=0.23 stated. ✓
- **HAMLET:** "The primary endpoint -- mRS 0-3 at 1 year -- was not statistically significant overall, due to inclusion of patients randomized up to 96 hours after onset, in whom functional benefit was not demonstrated." Endpoint named, "neutral overall" framing matches stats card. ✓

### HAMLET bedsidePearl 48-hour window emphasis

Opens with "HAMLET's most important teaching is the 48-hour window." Distinguishes within-48h benefit (mortality + function) from 48-96h (mortality only; functional benefit not reliably demonstrated). Explicit family-counseling guidance for the post-48-hour scenario: "operating after 48 hours means accepting a higher chance the patient survives with severe disability." ✓

### Em-dash audit

Required to be absent from `proves`/`doesNotProve`/`cautions`/`bedsidePearl`/`bottomLineSummary`. All em-style breaks in those fields rendered as ASCII double-hyphen `--`. No U+2014 em-dash characters present in claim fields. (Note: JSX section labels such as "Mortality Outcome — 6-Month Survival" contain em-dashes; those are UI chrome, not claim-field text, and outside the rule's scope.) ✓

### Never-drift category sweep

1. **Recommendation strength:** trial-evidence framing only; no guideline-class language attributed. ✓
2. **Action verbs:** "reduced" (factual past-tense for measured outcome), "does not prove" (epistemic), "may still reduce" (HAMLET pearl, post-48h) — all align with evidence weight. ✓
3. **Qualifiers and gates:** age windows (18-55 DECIMAL, 18-60 DESTINY/HAMLET), time windows, and sample sizes preserved at every claim site. No qualifier dropped. ✓
4. **Certainty markers:** "may" / "does not prove" / "cannot establish" used appropriately; pooled analysis presented as estimator, not definitive proof; association not laundered into causation. ✓
5. **Temporal constraints:** 48-hour and 96-hour windows preserved in HAMLET and pooled-analysis sentence; 6-month and 1-year endpoints preserved throughout. ✓

### JSX surface consistency

- **DECIMAL** (TrialPageNew.tsx): `DeltaBandChart` with treatment 75%, control 22%, `winnerArm="treatment"`, `endpoint="6-Month Survival"`, ARR 52.8 pp, P=0.001. Amber qualifier box explicitly states primary mRS≤3 at 6 months P=0.18. ✓
- **DESTINY:** `DeltaBandChart` 88%/47% survival, `winnerArm="treatment"`, ARR 41 pp, P=0.02. Amber box flags primary mRS 0-3 P=0.23. ✓
- **HAMLET:** `DeltaBandChart` 78%/41% survival, `winnerArm="treatment"`, ARR 38 pp, P=0.002. Amber box flags neutral primary overall and attributes functional benefit to within-48-hour window. ✓

## Citation accuracy

- **DECIMAL** (Vahedi et al. Stroke 2007, doi:10.1161/STROKEAHA.106.483622): N=38 (planned 70), 4 French centers, mortality 78%→25% ARR 52.8 pp P=0.001, primary mRS≤3 25% vs 5.6% P=0.18 — all match published figures. ✓
- **DESTINY** (Jüttler et al. Stroke 2007): N=32 (planned 60), 30-day mortality 53%→12% ARR 41 pp P=0.02, primary mRS 0-3 47% vs 27% P=0.23 — match. ✓
- **HAMLET** (Hofmeijer et al. Lancet Neurol 2009, doi:10.1016/S1474-4422(09)70047-X): N=64 (32/32), 1-year case fatality 59%→22% ARR 38 pp P=0.002, primary neutral overall — match. Pooled analysis attribution: mortality ARR 49.9 pp (95% CI 33.9-65.9) and mRS>4 ARR 41.9 pp (95% CI 25.2-58.6) correctly attributed to HAMLET 2009 Figure 3. ✓

## Freshness

`last_reviewed` field deferred per W5.2 (claims registry build-out). All three are landmark RCTs (2007-2009) whose mortality findings are stable and unreplaced as of 2026-04-27. The pooled analysis (HAMLET 2009) remains the definitive estimator for within-48-hour benefit in this space; DESTINY II (Jüttler 2014) addresses patients over 60 and does not supersede these trials for the under-61 population. No proactive refresh required at first sweep.

## Rationale

All three trials present mortality benefit as the sole proven finding and explicitly disclose that the primary functional endpoint was not statistically significant, with correct P-values and correct framing. The mandatory Modification 3 pooled-analysis sentence is character-identical across DECIMAL, DESTINY, and HAMLET `cautions` fields — the mandatory block condition is satisfied. JSX surfaces reinforce the same framing: charts show survival (not function), `winnerArm="treatment"` is appropriate for the survival endpoint shown, and amber qualifier boxes inside each chart card prevent a clinician from misreading the survival win as a functional win. HAMLET's bedside pearl correctly elevates the 48-hour window as the headline teaching and provides explicit guidance for the post-48-hour scenario. No em-dash drift detected in claim fields. No never-drift category violation found.

## Required follow-ups

- **W5.2 (already tracked):** Register `decimal-interpret`, `decimal-pearl`, `destiny-interpret`, `destiny-pearl`, `hamlet-interpret`, `hamlet-pearl` in `CLAIM_REGISTRY` and add Vahedi 2007, Jüttler 2007, Hofmeijer 2009 citation records (with `quoted_text` excerpts and `last_reviewed`) to `src/lib/citations/registry.ts`. Currently claim IDs are tagged via inline comments only; the pre-commit hook cannot validate them against a registry until W5.2 lands.
- **Optional editorial (non-blocking):** JSX section labels ("Mortality Outcome — 6-Month Survival" etc.) contain em-dashes in UI chrome text. Consider normalizing to hyphens for consistency with the no-em-dash convention applied to claim fields. Out of scope for this batch.
