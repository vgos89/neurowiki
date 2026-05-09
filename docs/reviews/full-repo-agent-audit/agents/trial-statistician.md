# Trial Statistician Audit — NeuroWiki

**Reviewer:** trial-statistician (claude-sonnet-4-6)  
**Date:** 2026-05-08  
**Scope:** Statistical display, design taxonomy, NNT usage, archetype matching (read-only)

## Overall Statistical Display Rating: YELLOW

The schema (`primaryDesign` + `primaryResult` contract) is genuinely thoughtful — Option Y NNT suppression, an `estimation-strategy` type, a Bayesian annotation distinguishing posterior from p-value, and a `bayesian-noninferiority` type that suppresses NNT all reflect statistically-correct framing. The `BenchmarkThresholdChart` with Clopper-Pearson CI and "not a frequentist comparator" doc-comment is excellent. Three issues prevent a Green rating: (1) the legacy `calculations.nnt` field is rendered at 8+ JSX sites without the `suppressNNT` gate; (2) several noninferiority trials are wired to DeltaBand (superiority archetype); (3) effect-size RR/CI values are hardcoded as JSX literals rather than driven from structured data.

---

## Findings

### F1 — NNT Bypass at Render Sites (P0)

**Trials affected:** DEFUSE-3 (`nnt: 3.6`, `primaryDesign: 'ordinal-shift'`), SELECT-2 (`nnt: 7.7`, `ordinal-shift`), ANGEL-ASPECT (`nnt: 5.4`, `ordinal-shift`), and any other ordinal-shift/NI/bayesian-NI trial retaining legacy `calculations.nnt`.

**Description:** `useMemo` in `TrialPageNew.tsx` (lines 175–294) correctly computes `suppressNNT` from `NNT_SUPPRESSED_DESIGNS = ['ordinal-shift', 'noninferiority', 'bayesian-noninferiority', 'dose-finding-safety', 'estimation-strategy', 'single-arm-registry']`. But eight unconditional render sites (`calculations?.nnt != null`) bypass the gate. DEFUSE-3 (ordinal shift) and SELECT-2 (ordinal shift) will paint an NNT chip despite the design-level rule that ordinal common OR does not convert cleanly to NNT.

**Recommended fix (Class E):** Gate every `trialMetadata.calculations?.nnt != null` JSX site behind `!stats.suppressNNT`. As defense-in-depth, also strip `calculations.nnt` from ordinal-shift/NI/bayesian-NI entries in `trialData.ts`.

---

### F2 — Noninferiority Trials Displayed on DeltaBand (P1)

**Trials affected:** `direct-mt-trial`, `devt-trial`, `swift-direct-trial`, `skip-trial`, `direct-safe-trial`, `aster-trial`, `aster2-trial` — all `primaryDesign: 'noninferiority'` with `archetypeId: 'A'` (DeltaBand).

**Description:** DeltaBand visualizes a 100-dot grid with a "extra patients" cobalt band — semantically a superiority/ARD chart. NI trials need to display the NI margin Δ, observed difference, and CI with annotation of whether the upper CI bound crosses Δ. No `ni-margin-chart` archetype exists (`src/components/trials/archetypes/` has only DeltaBand, GrottaBar, BenchmarkThreshold). AcT correctly mitigates this with `howToReadChart` text noting it was NI not superiority — but DIRECT-MT and others rely on chart framing alone.

**Recommended fix (Class D-clinical):** Author an `NIMarginChart` archetype rendering NI margin Δ, observed RD, 95% CI, and pass/fail indicator. Reassign the seven NI trials. Until the archetype ships, ensure surrounding copy on each NI trial clearly contradicts superiority reading.

---

### F3 — Hardcoded RR/CI Literals in JSX (P1)

**Trials affected:** Multiple — confirmed at `TrialPageNew.tsx:533–535` (`riskRatio="1.44" ciLow="1.01" ciHigh="2.06"`) and `:933–935`.

**Description:** Risk ratio point estimate and 95% CI are baked into JSX rather than driven by structured fields on `TrialMetadata`. They can drift from `efficacyResults` / `stats.effectSize` without any check. Additionally, NINDS pearls list `Odds Ratio: 1.7 (95% CI 1.2–2.6)` while the DeltaBand prop renders `riskRatio="1.44"` — two different statistics for the same trial without labels distinguishing OR from RR.

**Recommended fix (Class D-clinical):** Add structured `effectMeasure: { type: 'OR'|'RR'|'HR'|'cOR', value, ciLow, ciHigh }` field to `TrialMetadata`. Remove hardcoded literals from JSX. Chart labels should explicitly name the measure type.

---

### F4 — p-value Labeling — Mostly Good, One Drift Risk (P2)

**Trials with good labeling:** AcT, ATTEST-2, ARAMIS, ORIGINAL use `pValue.value: 'NI Met'`/`'Non-inf'`. DAWN correctly shows `value: '>99.9%' / label: 'Superiority'`. The `useMemo` Bayesian annotation (line 261) is exemplary.

**Drift risk:** DIRECT-MT (NI) shows `pValue.value: '0.04' / label: 'For Noninferiority'` — `0.04` is presumably a one-sided NI test p-value. Label is good but could be clearer: "One-sided NI test (Δ = …)".

**Recommended fix (Class C-clinical):** Standardize NI p-value labels to "One-sided NI test" with the NI margin Δ in the same stat row.

---

### F5 — Ordinal-Shift Primary Endpoint Displayed as Binary Cutpoint (P2)

**Trials affected:** DEFUSE-3 (`primaryEndpoint.value: 'mRS 0-2'`), several others. The published DEFUSE-3 primary was ordinal mRS shift; mRS 0-2 was secondary. SELECT-2 correctly shows `'mRS distribution'` — the right pattern.

**Recommended fix (Class E):** For each ordinal-shift trial, set `stats.primaryEndpoint.value` to `'mRS shift'` or `'mRS distribution'` and place the dichotomized rate in a separate secondary-outcome surface. Requires medical-scientist + evidence-verifier verification against source publications.

---

### F6 — ARD Without CI on Primary Stat Tiles (P2)

**Trials affected:** NINDS (`'15.4%'`), DAWN (`'36%'`), DEFUSE-3 (`'28%'`), CHOICE (`'+18.4%'`) display ARD without inline CI. ELAN shows the correct pattern: `'Risk Difference (95% CI: -2.84 to 0.47)'`.

**Trial-statistics skill rule:** "ARD requires a CI. Never show ARD without a CI."

**Recommended fix (Class C-clinical):** Standardize `stats.effectSize.label` to embed the 95% CI for any ARD presentation. Add `ardCI?: { low: number; high: number }` field to `TrialStats`; block render if missing for binary-superiority trials.

---

### F7 — mRS Shift Display Correctly Framed Where Used (P3 — Positive)

GrottaBarChart renders all 7 mRS categories correctly. B-PROUD and CHOICE use collapsed segments where source publications published collapsed categories (documented in `note` field). No case found where an ordinal-shift trial was rendered as binary "mRS 0-2 only."  
**Recommendation:** Maintain. Continue requiring `ordinalStats.commonOR` (with CI) on every Archetype B trial.

---

### F8 — Safety Outcome Separation — Sound (P3 — Positive)

`safetyProfile` and `harmSignal` fields cleanly separate harm from efficacy across trials. SPARCL (hemorrhagic stroke HR 1.66), SAMMPRIS (14.7% vs 5.8% 30-day stroke/death), SELECT-2 ("vascular complications and mortality must be presented alongside efficacy") all handle safety outcomes appropriately.

---

### F9 — Bottom-Line Text — Exemplary on Most Trials (P2)

ELAN ("not significantly worse" — estimation framing), CHOICE ("hypothesis-generating"), AcT ("NI met" vs "superiority not met"), ATTEST-2/DIRECT-MT ("noninferiority established" vs "equivalent") all appropriately hedged.

**Issue:** `buildHouseConclusion()` in `trialNarrative.ts` generates the phrase "In practice, this supports using the intervention for patients who resemble the trial population and workflow" for every positive trial including Bayesian-superiority and ordinal-shift. This is fine for routine trials but does not adapt to design type.

**Recommended fix (Class C-clinical):** Migrate `buildHouseConclusion` to read `primaryDesign` + `primaryResult` and produce design-aware fallback prose; remove `specialDesign` string-sniffing.

---

## Top 5 Statistical Display Risks

| # | Finding | Severity | Impact |
|---|---|---|---|
| 1 | NNT bypassing `suppressNNT` gate at 8 render sites (F1) | P0 | Shows NNT for ordinal-shift trials where it is statistically invalid |
| 2 | 7 NI trials rendered on superiority archetype (F2) | P1 | DeltaBand "extra patients" framing misleads for NI designs |
| 3 | Hardcoded RR/CI JSX literals drift-vulnerable (F3) | P1 | OR vs RR label confusion; NINDS shows two different estimates unlabeled |
| 4 | Ordinal primary endpoint displayed as binary cutpoint (F5) | P2 | DEFUSE-3 shows mRS 0-2 as primary when ordinal shift was published primary |
| 5 | ARD without CI on primary stat tiles (F6) | P2 | NINDS, DAWN, DEFUSE-3 show bare ARD — violates trial-statistics skill rule |

---

## Classification and Recommended Next Steps

- All findings flagged for **Class E** (clinical-logic) or **Class D-clinical** (architecture-touching) workflow per CLAUDE.md §6.1.
- F1 (P0) is most urgent — the well-built `suppressNNT` gate is silently broken at the leaves.
- F2/F3 require ADR for NIMarginChart archetype and `effectMeasure` field migration before authoring.
- F4/F5/F6 are data-quality fixes fitting Class C-clinical or Class E depending on whether they touch displayed clinical claims.
- No fixes applied in this audit — findings are hypotheses for the plan gate.
