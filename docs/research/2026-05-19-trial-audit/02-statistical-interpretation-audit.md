# Trial Statistical Interpretation Audit — 2026-05-19 (Overnight)

**Reviewer:** trial-statistician
**Scope:** all trials with statistical display fields in `src/data/trialData.ts`, plus catalog files
**Method:** statistical-design taxonomy from `.claude/skills/trial-statistics/`
**Status:** READ-ONLY findings. No source files were edited. V + clinical-reviewer review tomorrow.

This codebase already encodes a `primaryDesign` / `primaryResult` taxonomy with a documented "Option Y" NNT-suppression rule for ordinal-shift, noninferiority, bayesian-noninferiority, dose-finding-safety, estimation-strategy, and single-arm-registry trials. Most trials already comply; this audit flags the cases that still drift.

---

## Findings by trial

### BLOCKING

**1. MR CLEAN — `mr-clean-trial`** (file lines ~1045–1167)
- **Field:** `legend.keyStat = "NNT 7"` and `legend.bottomLineTag = "+13 / 100"`; `bedsidePearl` says "NNT about 7"
- **What is shown:** A bare NNT chip with no secondary-outcome label
- **What the trial reports:** primaryDesign is `ordinal-shift`. Primary endpoint = ordinal shift across mRS 0–6 (adjusted common OR 1.67, 95% CI 1.21–2.30). NNT 7 is computed from the SECONDARY dichotomized mRS 0–2 (32.6% vs 19.1% → ARR 13.5% → NNT ≈ 7.4).
- **Why it's flagged:** Per the schema's own Option Y rule (lines 273–276 of trialData.ts) and per the trial-statistics skill, ordinal-shift primaries do not yield a valid NNT. DEFUSE-3, SELECT-2, ANGEL-ASPECT carry an explicit "NNT from SECONDARY mRS 0–2" disclosure in `cautions`, `bedsidePearl`, `pearls`, and applicability — MR CLEAN does not.
- **Severity:** BLOCKING (inconsistent disclosure across trials of the same statistical class)
- **Recommended fix:**
  - `legend.keyStat` → `"NNT 7 (secondary)"` or remove and replace with `"cOR 1.67 (1.21–2.30)"`
  - Add to `applicability.populationExclusions`: "NNT 7 is derived from the SECONDARY mRS 0–2 outcome (32.6% vs 19.1%); the ordinal-shift primary does not yield a valid NNT per clinical-trial-audit"
  - Update `bedsidePearl` to label NNT as derived from secondary

**2. ESCAPE — `escape-trial`** (file lines ~1168–1299)
- **Field:** `legend.keyStat = "NNT 4.2"`, `legend.bottomLineTag = "+24 / 100"`
- **What is shown:** Bare NNT chip
- **What the trial reports:** primaryDesign is `ordinal-shift`. Primary = mRS shift (common OR 2.6, 95% CI 1.7–3.8). NNT 4.2 is from the dichotomized mRS 0–2 secondary (53.0% vs 29.3% → ARR 23.7% → NNT ≈ 4.2).
- **Severity:** BLOCKING (same as MR CLEAN)
- **Recommended fix:** Add explicit "NNT from secondary mRS 0–2" disclosure to legend, bedsidePearl, applicability, and pearls.

**3. REVASCAT — `revascat-trial`** (file lines ~1300–1419)
- **Field:** `bedsidePearl` says "functional independence gain is about 15 percentage points (NNT about 7)"
- **What the trial reports:** primaryDesign is `ordinal-shift` (adjusted OR 1.7 for one-point shift). NNT ~7 is from the secondary mRS 0–2 dichotomization (43.7% vs 28.2% → ARR 15.5% → NNT ≈ 6.5).
- **Severity:** BLOCKING (no secondary-outcome label on the NNT claim, unlike DEFUSE-3/SELECT-2)
- **Recommended fix:** Update `bedsidePearl` to "NNT about 7 from the secondary mRS 0–2 outcome; the primary endpoint is the ordinal mRS shift (cOR 1.7, 95% CI 1.05–2.8)." Add corresponding `applicability.populationExclusions` entry.

**4. SWIFT PRIME — `swift-prime-trial`** (file lines ~1534–1654)
- **Field:** `howToReadChart` and `bedsidePearl` both say "NNT of 4" without secondary-outcome labeling
- **What the trial reports:** primaryDesign `ordinal-shift` (common OR 2.75, 95% CI 1.53–4.95). NNT 4 derived from mRS 0–2 secondary (60% vs 35% → ARR 25% → NNT = 4.0).
- **Severity:** BLOCKING
- **Recommended fix:** Add secondary-outcome label to the NNT in `howToReadChart` Q3 and in `bedsidePearl`. Add `applicability.populationExclusions` line.

**5. THRACE — `thrace-trial`** (file lines ~1655–1764)
- **Field:** `bedsidePearl` says "53% versus 42% gain (NNT 9)"
- **What the trial reports:** primaryDesign is `binary-superiority` per the field, and the primary endpoint in the publication is mRS 0–2 binary. So NNT 9 IS appropriate here. **NOT a violation.** Confirmed correct as-is.

**6. BEST-MSU — `best-msu-trial`** (file lines ~7880–7986)
- **Field:** `calculations.nnt = 12.5`, `bedsidePearl` says "NNT 13", `howToReadChart` Q3 says "NNT ≈ 13"
- **What the trial reports:** Alternating-week quasi-experimental (NOT individually randomized). Primary endpoint is the utility-weighted mRS (ordinal). NNT 13 is from the binary mRS 0–1 secondary.
- **Severity:** BLOCKING (double issue: quasi-experimental design + NNT from secondary). The companion trial B_PROUD, which has the same quasi-experimental design, **correctly suppresses NNT** in this codebase (lines 7847–7851 explicitly state "NNT suppressed for observational design"). BEST-MSU is the inconsistent one.
- **Recommended fix:** Suppress NNT per the same rule applied to B_PROUD. Move the AOR 2.14 (95% CI ...) to the primary stat. Add to `applicability.populationExclusions`: "Alternating-week quasi-experimental design; per clinical-trial-audit, NNT is not displayed for non-randomized comparisons because residual confounding prevents causal ARD interpretation." Also note the primary is the utility-weighted mRS (ordinal), not the mRS 0–1 binary shown for visual clarity.

### ADVISORY

**7. NINDS — `ninds-trial`** (file lines ~406–531) — verified correct
**8. DEFUSE-3 — `defuse-3-trial`** — verified correct, canonical disclosure pattern for ordinal-shift NNT
**9. DAWN — `dawn-trial`** — verified correct, Bayesian posterior labeled
**10. ENRICH — `enrich-trial`** — verified correct, Bayesian posterior + safety endpoint labeled
**11. TASTE — `taste-trial`** — verified correct, Bayesian-NI with PP/ITT distinction surfaced. Minor: confirm `resultSubtype: 'non-inferiority'` is intended given ITT-borderline + PP-met.
**12. WEAVE — `weave-trial`** — verified correct, single-arm registry, Archetype G reference pattern
**13. SAMMPRIS** — verified correct, harm-stopped with NNT suppressed
**14. RACECAT, INTERACT4, RIGHT-2, TRIAGE-STROKE, MR ASAP** — missing `primaryDesign`/`primaryResult` taxonomy fields. ADVISORY — fill in for consistency.
**15. ELAN — `elan-study`** — verified correct, estimation strategy
**16. CHARM, BEST-II, BP-TARGET, OPTIMAL-BP** — missing taxonomy fields. ADVISORY.
**17. EXTEND-IA** — chart Q2 NNT 3 should be labeled "from the secondary mRS 0–2." Minor.
**18. RAISE** — verified correct.

---

## Cross-cutting patterns

### Pattern A — Ordinal-shift trials displaying NNT in legend chip without secondary-outcome qualification

The codebase has a clear rule (Option Y in the schema commentary): ordinal-shift primaries do NOT yield a valid NNT. The "from secondary mRS 0–2" disclosure pattern is used correctly and consistently for DEFUSE-3, SELECT-2, ANGEL-ASPECT, and BAOCHE (which is binary-superiority by the amended primary). The pattern breaks down for the 2015 EVT trials: **MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME** all carry a bare NNT in their `legend.keyStat` chip, `bedsidePearl`, or `howToReadChart` without the secondary-outcome label.

**Recommended fix:** apply the DEFUSE-3 disclosure pattern uniformly. Either add the "(secondary)" qualifier to the chip and add a populationExclusions entry, or rotate the chip to show the cOR with CI instead of NNT for these four trials.

### Pattern B — Quasi-experimental allocation trials handled inconsistently

B_PROUD (quasi-experimental MSU allocation) correctly suppresses NNT and explicitly states why. **BEST-MSU** (alternating-week quasi-experimental allocation) displays NNT 12.5/13 throughout. The two trials should be handled identically. BEST-MSU is the outlier.

### Pattern C — Missing `primaryDesign` / `primaryResult` on several acute-management and prehospital trials

INTERACT4, MR ASAP, RACECAT, RIGHT-2, TRIAGE-STROKE, ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, CHARM, ESCAPE-NA1, DECIMAL, DESTINY, HAMLET, DESTINY-II all lack the `primaryDesign`/`primaryResult` taxonomy fields. Their current displays do not contain statistical interpretation errors visible to readers, but the missing fields prevent automated renderer rules (NNT suppression, archetype selection) from firing. Recommend a follow-up taxonomy pass to backfill.

---

## Required follow-ups

**Must-fix before next release (BLOCKING):**

1. **MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME**: add "NNT from secondary mRS 0–2" disclosure pattern to `legend.keyStat`, `bedsidePearl`, `pearls`, and `applicability.populationExclusions`, matching the DEFUSE-3 / SELECT-2 / ANGEL-ASPECT reference pattern. Alternatively, swap the `legend.keyStat` chip from NNT to the cOR with CI.
2. **BEST-MSU**: suppress NNT entirely (match B_PROUD handling). Move AOR 2.14 to the primary stat. Add quasi-experimental-design caveat to applicability and bedsidePearl. Note the primary is utility-weighted mRS (ordinal), not binary mRS 0–1.

**Worth fixing (ADVISORY):**

3. Add `primaryDesign` / `primaryResult` taxonomy fields to: INTERACT4, MR ASAP, RACECAT, RIGHT-2, TRIAGE-STROKE, ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, CHARM, ESCAPE-NA1, and the four hemicraniectomy trials. None of these change displayed numbers, but they unlock renderer rules.
4. EXTEND-IA `howToReadChart` Q2: label NNT 3 explicitly as "from the secondary mRS 0–2 outcome."
5. TASTE: confirm intended `trialResult` and `resultSubtype` given the ITT-borderline + per-protocol NI-met result. Statistical interpretation is currently correct; this is a labeling clarity question for the medical-scientist + clinical-reviewer.

**Out of scope for this audit (handoff to evidence-verifier):**

- DOI / PMID metadata accuracy
- Verbatim quote / paraphrase fidelity to the published trial reports
- Caveat completeness (e.g., "stopped early for benefit" is already surfaced for most relevant trials but should be checked against the cautions field by evidence-verifier)

---

**Reviewer instructions for V:**

These findings are research outputs from an automated agent. None of them have been applied to source files. The 6 BLOCKING items need:

1. **Class E classification** per CLAUDE.md §6.1 (clinical interpretation thresholds + display strings — exactly the example V's own rule names).
2. **Pre-execution clinical-reviewer gate** per §17.2 + medical-scientist authoring + evidence-verifier packet for each trial touched.
3. **Citation registry updates** for any new claim text + `last_reviewed` refresh per §13.6.

Recommended path: take MR CLEAN as the first commit (template), apply the DEFUSE-3 reference pattern, route through clinical-reviewer for ratification, then replicate the pattern to ESCAPE / REVASCAT / SWIFT PRIME / BEST-MSU in subsequent commits. Each commit is its own §17.2 artifact.

The advisory items (taxonomy backfill) are Class C-clinical — a single bulk-update commit through clinical-reviewer suffices for those.
