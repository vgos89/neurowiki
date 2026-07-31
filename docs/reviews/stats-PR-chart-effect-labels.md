# Trial-statistician review — chart effect labels + CLOSE CI correction

**Decision:** approve-with-conditions (blocking conditions cleared pre-commit)
**Reviewer:** trial-statistician, fresh context · **Date:** 2026-07-31

## The defect
`DeltaBandChart` rendered its statistics row as `{effectLabel ?? 'Risk ratio'} {riskRatio}`.
Only 8 of 95 call sites passed `effectLabel`; 57 embedded the metric name inside the value
instead. The row therefore printed the default label in front of the embedded one:

> "Risk ratio HR 0.79" · "Risk ratio ARR 52.8 pp" · "Risk ratio cOR 2.77" · "Risk ratio RD −15.1 pp"

A hazard ratio, an odds ratio and a risk difference are not risk ratios, and a clinician
comparing across trial pages was being told they are.

## The fix
The component now recognises a leading metric token, resolves the label from it, and strips
the duplicate prefix. Fixes the class rather than 57 instances, and covers future call sites.
Verified in the built HTML: **0 duplicated prefixes across all 178 routes.**

## Blocking findings from review, all cleared

**BM-1 / BM-2 — the mapping table was unsafe.** `ARR → "Absolute risk reduction"` is a
**directional** term, and this component receives two percentages and a string, so it cannot
know outcome polarity. It rendered:
- **SAMMPRIS: "Absolute risk reduction +8.9pp"** — six lines under its own STOPPED FOR HARM
  callout. Calling an 8.9-point excess of stroke and death a "risk reduction" states the
  opposite of the trial's conclusion, and is worse than the garbled label it replaced.
- **DECIMAL / DESTINY / HAMLET: "Absolute risk reduction 52.8 pp"** on a **survival**
  endpoint, where a "reduction" would be harm.

Cleared: all directional terms removed. ARR / ARD / RD collapse to the neutral **"Absolute
risk difference"** — they are the same quantity differing only by an assumed sign, and which
token a call site typed is an authoring accident (CREST-2 wrote ARD and OPTIMAL-BP wrote RD
for statistically identical figures). A call site that genuinely means direction passes
`effectLabel`.

**BM-4 — ten bare values the trial's own record names as a different metric.** Each rendered
`Risk ratio <n>`, contradicting its own record; five of the contradicted strings are
claim-tagged. Cleared: CASSISS, BASIS, THRACE, CHANCE, SOCRATES, SPS3, SPARCL, THALES, POINT
and WAKE-UP now carry the metric their records name.

**BM-5 — six values that are not effect measures at all**, announced as risk ratios: raw event
counts (DEFENSE-PFO `0/60 vs 6/60`), a biomarker delta (ANNEXA-4 `92% anti-FXa drop`), and
events-per-1000 (IST, CAST). Cleared with explicit labels.

**BM-7 — the confidence-interval tooltip stated the wrong null on 16 rows and flipped the
verdict on three.** The shipped glossary text says *"if CI crosses 1.0, result may not be
significant."* Sixteen rows are now on a **difference** scale, where the null is 0:
- **ELAN** (RD −1.18, CI −2.84 to +0.47) crosses 0 — a null result — but not 1.0, so the
  tooltip said significant. False positive.
- **TASTE** (SRD +0.05, CI −0.02 to +0.12) — same false positive.
- **CHOICE** (RD +18.4 pp, CI 0.3 to 36.4, p=0.047, a **positive primary**) contains 1.0, so
  the tooltip said it may not be significant. **False negative on a positive trial.**

Cleared: the tooltip is now gated on scale. Ratio rows keep "excludes 1.0"; difference rows
get "the no-effect value is 0, not 1.0".

## Also fixed from the review
- **`showP` ignored `pIsUnparseable`**, so the row still printed `p = NI met`,
  `p = Met per-protocol`, `p = NI not est.` and `p = n/a (estimation design)`. None is a
  p-value. The component's own comment claimed this was already handled; it was not.
  Verified gone from the built output.
- **Significance green painted harm results.** OPTIMAL-BP rendered **`p = 0.03 (HARM)` in
  success green**; SAMMPRIS, PATCH and NOR-TEST 2 did the same. Colour is the fastest thing a
  clinician reads. Now suppressed when the control arm won or the trial was harm-stopped.
- Four unmapped tokens added (`gOR`, `aIR`, `SRD`, `acOR`) so the default cannot fire on top
  of them; `aOR` spelled out as "Adjusted odds ratio"; PATCH labelled "Adjusted common OR"
  (its record says adjusted **common** OR, for a shift across the whole scale); B_PROUD
  labelled "Common OR (worse mRS)" because its scale is inverted and nothing said so.
- A latent bug the review caught: `resolvedEffectValue` skipped stripping whenever
  `effectLabel` was truthy, so a future call site pairing `effectLabel="Adjusted common OR"`
  with `riskRatio="acOR 2.05"` would re-create the exact duplicated-prefix bug. Now strips
  regardless, with one consistent operator.

## Two findings that did NOT reproduce
- **BM-3 (ESCAPE).** Reported as rendering `Risk ratio 2.60` under `mRS 0-2`. The built page
  renders a **GrottaBarChart**: "Shift in distribution — cOR 2.60", which is correct for an
  ordinal primary. The `DeltaBandChart` call is an unused fallback branch. The value was still
  prefixed so that branch would resolve correctly if ever reached.
- **The earlier CHANCE report** (from the round-4 clinical review) claimed a corrupted p-value
  field on four antiplatelet trials. Checked in source and in the built HTML: `pValue.value` is
  `'<0.001'`, the HR lives in `effectSize`, and CHANCE draws its band correctly. **No data edit
  was made to those four records** — editing foundational antiplatelet trials on an unverified
  line reference would have been the more dangerous action.

## Carried to TASKS.md, not this change
- **Eight duplicate render blocks** in `TrialPageNew.tsx` where the second never executes
  (THEIA, ANNEXA-I, ANNEXA-4, SARODE, PATCH, IST, CAST, PROFESS). The dead blocks are in
  several cases the *better* ones, carrying intervals the live block lacks. Port forward, then
  delete. Already tracked as `trialpage-duplicate-render-blocks`.
- ESCAPE-MeVO's chart endpoint and CI disagree with a Class E correction in its own record.
- Absolute differences displayed with no interval (DECIMAL, DESTINY, HAMLET, ASTER, OPTIMAS,
  TIMING). TIMING is the avoidable one: its record already holds the CI, the call site just
  does not pass it.
- CI units inconsistent on difference rows, and the en-dash join is unreadable with negatives
  (`−5.9–−0.6`). Use "to" and carry the unit.
- Numbers hardcoded in the render file with no in-repo provenance (EXTEND-IA, EAGLE,
  SWIFT PRIME). Route to evidence-verifier before any relabelling makes them louder.

---

# CLOSE anticoagulation-arm confidence interval — CORRECTED

Found by evidence-verifier while building the PFO Phase 4 packet.

**Shipped live in six places: `HR 0.44 (95% CI 0.11–1.85)`. Published: `0.11–1.48`.**

Two independent sources, one of them the CLOSE investigators themselves:
- Turc, Calvet, Guérin, Sroussi, Chatellier, **Mas** (CLOSE Investigators), *JAHA*
  2018;7(12):e008356, PMC6220551, open access: 3/187 vs 7/174, **HR 0.44 (95% CI 0.11–1.48)**.
- AAN 2020 Practice Advisory Update, full manuscript PDF: **"HR 0.44 (95% CI 0.11 to 1.48)"**.

`1.85` appears in neither source, nor in any other retrieved source. Corrected across all six
occurrences with the provenance recorded beside the claim. The NEJM primary text was not
retrievable, so confidence that 1.85 is **wrong** is high and that 1.48 is **exact** is
medium-high; full-text confirmation is tracked.

**Second correction.** The repo attached *"statistical significance was not analysed"* to the
anticoagulation-vs-antiplatelet comparison. The AAN's non-comparison statement is scoped to
anticoagulation vs **closure**, a different pair. This comparison has a published interval;
it is underpowered, not unanalysed. Reworded on all four surfaces.
