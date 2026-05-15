# Evidence Packet — NINDS 1995 + Marler 2000 (W8.2.3 pearl misattribution)

**Date:** 2026-05-14
**Prepared by:** evidence-verifier agent
**Task:** W8.2.3 + parking-lot 2026-05-11 — separate NINDS 1995 (overall 3-month outcomes) from Marler 2000 (time-stratified subgroup analysis) for the `time-is-brain-deep` pearl in `strokeClinicalPearls.ts`.
**Files in scope (read-only, no edits in this task):** `src/data/strokeClinicalPearls.ts` (id: `time-is-brain-deep`); secondary impact on `src/data/trialData.ts` (id: `ninds-trial`) — pearl text only, no trial-page change needed.

---

## Source 1 — NINDS rt-PA Stroke Study (NEJM 1995)

### 1. Canonical citation

- **Title:** Tissue Plasminogen Activator for Acute Ischemic Stroke
- **Authors:** The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group (Project Officer: John R. Marler, MD)
- **Journal:** New England Journal of Medicine
- **Year/Vol/Issue/Pages:** 1995; 333(24): 1581–1587
- **DOI:** 10.1056/NEJM199512143332401 — **resolves** (302 → nejm.org)
- **PMID:** 7477192
- **NCT:** N/A (predates ClinicalTrials.gov registration era)
- **Access:** Full text verified from the supplied NEJM PDF (NeuroWiki Articles archive).
- **Confidence:** **HIGH** — full text read; methods/results/tables confirmed verbatim.

### 2. Population

- 624 patients randomized total (Part 1: 291; Part 2: 333). Enrollment Jan 1991–Oct 1994.
- Inclusion: ischemic stroke with clearly defined onset time, NIHSS-measurable deficit, non-contrast CT without intracranial hemorrhage, treatment initiation within 180 minutes of onset. Stratified by site and by 0–90 vs 91–180 min onset-to-treatment window.
- Key exclusions: SBP >185 or DBP >110, rapidly improving/minor symptoms, recent surgery/stroke/trauma, anticoagulants with elevated PTT, INR-equivalent PT >15 sec, platelets <100k, glucose <50 or >400 mg/dL, seizure at onset.
- Median NIHSS at baseline: 14 (range 1–37) — moderate-to-severe strokes. Mean age 66–69. Stroke subtypes: cardioembolic 42–45%, large-vessel 35–45%, small-vessel 9–19%, other 2–3%.
- Generalizability: US multicenter (8 centers, ~40 hospitals); excludes mild/rapidly-improving strokes, late presenters, and severely hypertensive patients. Directly applicable to NeuroWiki's bedside audience for the 0–3 h alteplase decision.

### 3. Intervention and comparator

- **Intervention:** Alteplase (Activase, Genentech) 0.9 mg/kg IV (max 90 mg), 10% bolus then 90% infused over 60 min, initiated within 180 min of stroke onset.
- **Comparator:** Matching placebo, identical schedule.
- No anticoagulants or antiplatelets for 24 h post-treatment. Protocol-driven BP management.

### 4. Primary endpoint (verbatim)

**Two-part design with different primary endpoints — this is the key structural fact behind the pearl misattribution.**

- **Part 1 primary endpoint:** "complete resolution of the neurologic deficit or an improvement from base line in the score on the National Institutes of Health stroke scale (NIHSS) by 4 or more points 24 hours after the onset of stroke" (per-time-stratum, 0–90 min and 91–180 min).
- **Part 2 primary endpoint:** Global test statistic (Wald test, generalized estimating equations, logit-link) across **four** outcome measures at **3 months**: Barthel index ≥95, modified Rankin Scale ≤1, Glasgow Outcome Scale =1, NIHSS ≤1. Time horizon: 3 months.

### 5. Statistical framework

`superiority` (frequentist, Mantel–Haenszel univariate tests; Part 2 primary used a pre-specified global Wald test on four correlated binary outcomes via GEE). Not Bayesian, not non-inferiority, not ordinal-shift (dichotomized cutpoints were pre-specified for each scale).

### 6. Primary result (verbatim per Table 4)

- **Part 1 (24-h NIHSS improvement ≥4 or resolution), 0–180 min combined:** 47% t-PA vs 39% placebo, RR 1.2 (95% CI 0.9–1.6), **P=0.21** — primary endpoint **not statistically significant**.
- **Part 2 (3-month global test, 0–180 min combined, n=333):** Global OR for favorable outcome **1.7 (95% CI 1.2–2.6), P=0.008**. Adjusted (for aspirin, weight, age, site, OTT stratum) OR rose to 2.0 (95% CI 1.3–3.1).
- **Part 2 per-scale favorable-outcome rates at 3 months (verbatim Table 4, intent-to-treat, 0–180 min combined):**
  - **Barthel index ≥95: t-PA 50% vs placebo 38%** — OR 1.6 (1.1–2.5), P=0.026
  - mRS ≤1: 39% vs 26% — OR 1.7 (1.1–2.6), P=0.019
  - Glasgow Outcome Scale =1: 44% vs 32% — OR 1.6 (1.1–2.5), P=0.025
  - NIHSS ≤1: 31% vs 20% — OR 1.7 (1.0–2.8), P=0.033
- Absolute increase in favorable outcome with t-PA: 11–13 percentage points (per discussion, p. 1586).

**The "50% vs 38%" figure is the Barthel-≥95 favorable-outcome rate at 3 months in Part 2 OVERALL (0–180 min combined) — NOT a time-stratified <90 min subgroup result.** This is the source of the pearl misattribution.

### 7. Key safety results

- **Symptomatic intracranial hemorrhage within 36 h (combined Parts 1+2): 6.4% t-PA vs 0.6% placebo, P<0.001** (Table 6: Part 1 8/144 = 6%, Part 2 12/168 = 7%, vs placebo 0/147 + 2/165 = 1%; combined commonly reported as 6.4% vs 0.6%).
- Fatal sICH: 9 t-PA (4 in Part 1, 5 in Part 2) vs 1 placebo (Part 2).
- 90-day mortality (combined): 17% t-PA vs 21% placebo, P=0.30 (not significantly different).
- Of 28 patients with symptomatic ICH, 17 (61%) died by 3 months.

### 8. Expert and editorial caveats

- Foundation for FDA approval of IV alteplase (1996) for ischemic stroke ≤3 h. Incorporated into all subsequent AHA/ASA guidelines.
- **AHA/ASA 2019/2024 stroke guidelines:** IV alteplase 0.9 mg/kg within 3 h of onset is **Class I, Level A** for eligible patients.
- Subsequent reanalyses (Kwiatkowski 1999 [1-year follow-up], NINDS subgroup paper Stroke 1997, Marler 2000 [this packet], ATLANTIS/ECASS/NINDS pooled analyses Hacke 2004 and Lees 2010, Emberson 2014 individual-patient meta-analysis) have all confirmed the primary result and refined the time-benefit relationship.
- Limitations: imbalance at baseline (aspirin use, weight, age, and — per Marler 2000 — NIHSS distribution within OTT strata); no mechanical thrombectomy comparator (era predates EVT); excludes mild and rapidly-improving strokes.

### 9. NeuroWiki field mapping — verified values

| File · field | Verified value |
|---|---|
| `trialData.ts` · `ninds-trial.title` | "NINDS Trial" — **OK** |
| `trialData.ts` · `ninds-trial.reference` | "The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group. Tissue plasminogen activator for acute ischemic stroke. N Engl J Med. 1995;333(24):1581-1587." — **OK** |
| `strokeClinicalPearls.ts` · `ninds-trial.content` | "Part 2 (n=333) 3-month outcomes: mRS 0-1 39% vs 26%; Barthel ≥95 50% vs 38%; global OR 1.7 (95% CI 1.2-2.6, P=0.008). 6.4% sICH risk." — **OK** (this pearl correctly attributes the 50/38 to Part 2 overall, not a time subgroup) |
| `strokeClinicalPearls.ts` · `time-is-brain-deep.content` | Currently says: *"NINDS trial: Treatment <90min had 50% vs 38% good outcome at 3 months."* — **NOT VERIFIED IN SOURCE**. The 50/38 is from NINDS Part 2 Barthel ≥95 in the overall 0–180 min cohort, not a <90 min subgroup. **Block until rewritten — see §10 below.** |

### 10. Verification confidence

**HIGH** for the NINDS 1995 paper itself. The pearl claim is metadata-valid (citation exists, claim ID present) but **semantically invalid** for the time-stratified phrasing currently in the pearl text.

---

## Source 2 — Marler et al., Neurology 2000 (time-stratified follow-up)

### 1. Canonical citation

- **Title:** Early stroke treatment associated with better outcome: The NINDS rt-PA Stroke Study
- **Authors:** Marler JR, Tilley BC, Lu M, Brott TG, Lyden PC, Grotta JC, Broderick JP, Levine SR, Frankel MP, Horowitz SH, Haley EC Jr, Lewandowski CA, Kwiatkowski TP; for the NINDS rt-PA Stroke Study Group
- **Journal:** Neurology
- **Year/Vol/Issue/Pages:** 2000; 55(11): 1649–1655 (Dec 12, 2000)
- **DOI:** 10.1212/wnl.55.11.1649 — verified via PubMed
- **PMID:** 11113218 — **resolves** (PubMed record confirms title, authors, citation)
- **NCT:** N/A
- **Access:** Full text verified from supplied PDF.
- **Confidence:** **HIGH**

### 2. Population

- Combined cohort from both NINDS Part 1 + Part 2 trials, n=622 (excludes 2 patients randomized outside the 180-min window).
- 0–90 min OTT stratum: n=302 (rt-PA 157, placebo 145).
- 91–180 min OTT stratum: n=320 (rt-PA 153, placebo 167).
- Same inclusion/exclusion criteria as NINDS 1995. Same population, post-hoc time-stratified analysis.

### 3. Intervention and comparator

Same as NINDS 1995 (alteplase 0.9 mg/kg vs placebo, IV, within 180 min). No new intervention — this is a re-analysis of the existing dataset stratified by onset-to-treatment time (OTT) treated as both continuous and dichotomized at 90 min.

### 4. Primary endpoint (verbatim)

This paper has no new primary endpoint; it tests for **OTT × treatment interactions** on three outcomes pre-specified in the original trials:

- 24-h improvement (NIHSS ≥4-pt improvement or complete resolution)
- 3-month favorable outcome (the original Part 2 global test across the four scales)
- Intracranial hemorrhage within 36 h (symptomatic + asymptomatic combined, due to low event counts)

An interaction was declared significant at **p ≤ 0.10** (a priori threshold, justified by reduced power of multiplicative interaction tests).

### 5. Statistical framework

`superiority` (frequentist) — exploratory subgroup/interaction analysis using logistic regression (24-h, hemorrhage) and global test via GEE (3-month). Critically: **explicitly labeled as exploratory / post-hoc** in the discussion ("the results reported here are the result of an exploratory analysis. It would be important to test whether the results of other trials of thrombolytic therapy confirm this result."). Adjusts for baseline NIHSS as a "masking confounder" because NIHSS distribution differed across OTT strata by chance.

### 6. Primary result (verbatim)

**24-hour improvement (NIHSS ≥4-pt or resolution), dichotomized OTT:**
- 0–90 min: **OR 1.71 (95% CI 1.09–2.70), P=0.02** (t-PA vs placebo)
- 91–180 min: OR 1.12 (95% CI 0.71–1.76), P=0.62
- OTT × treatment interaction (OTT continuous): OR 0.992 (0.98–1.00), P=0.08

**3-month favorable outcome (global test, ADJUSTED for baseline NIHSS):**
- 0–90 min: **adjusted OR 2.11 (95% CI 1.33–3.35), P=0.002**
- 91–180 min: **adjusted OR 1.69 (95% CI 1.09–2.62), P=0.02**
- OTT × treatment interaction: OR 0.993 (0.983–1.001), P=0.09 (meets pre-specified p≤0.10)
- Unadjusted interaction was not significant (P=0.31) — NIHSS imbalance was masking the effect.
- Fully-adjusted multivariable model (all known covariates): 0–90 min adj OR **2.53 (1.53–4.19), P=0.0003**; 91–180 min adj OR **1.61 (1.02–2.55), P=0.04**.

**Intracranial hemorrhage within 36 h:**
- No OTT × treatment interaction detected (all-hemorrhage P=0.24; symptomatic-only P=0.74).
- Within rt-PA group alone, after adjusting for baseline NIHSS, no OTT–hemorrhage association (P>0.76).
- Authors note this null may reflect low power (only 10 hemorrhages in placebo group).

### 7. Key safety results

- No new safety analyses beyond the OTT–hemorrhage interaction noted above. Original NINDS 1995 sICH rates apply (6.4% t-PA vs 0.6% placebo overall).

### 8. Expert and editorial caveats

- Explicit author statement that this is **exploratory / post-hoc**. The original NINDS trials were stratified by OTT at randomization but were **not powered** to detect within-stratum efficacy differences.
- OTT was analyzed as a continuum (more powerful than dichotomized), but this departed from the original protocol's dichotomized analysis — authors flag this as a limitation.
- Findings supported / later confirmed by Hacke pooled analysis (JAMA 2004) and Lees IPD meta-analysis (Lancet 2010), and quantified more precisely by Emberson IPD meta-analysis (Lancet 2014): OR for good outcome falls from ~2.0 at 60 min to ~1.0 at ~4.5 h. AHA/ASA guidelines cite the time-benefit relationship (Class I, Level A for ≤3 h; Class I, Level B-R for 3–4.5 h in eligible patients) but rely primarily on the pooled IPD meta-analyses, not Marler 2000 alone, for the quantitative time-benefit curve.
- **Marler 2000 does NOT report a simple "50% vs 38% at <90 min" headline figure.** It reports **odds ratios** (adjusted for NIHSS), not absolute event rates by time stratum. Any pearl quoting "50% vs 38%" attributed to a <90 min subgroup is unsupported by the published text.

### 9. NeuroWiki field mapping — verified values for pearl rewrite

For the `time-is-brain-deep` pearl, the supportable Marler 2000-sourced statements are:

| Claim element | Verified source value |
|---|---|
| OR for favorable 3-mo outcome with rt-PA at 0–90 min OTT (adjusted for NIHSS) | **OR 2.11 (95% CI 1.33–3.35)** |
| OR for favorable 3-mo outcome at 91–180 min OTT (adjusted for NIHSS) | **OR 1.69 (95% CI 1.09–2.62)** |
| Interaction p-value (treating OTT as continuum, adjusted) | **P=0.09** (pre-specified threshold P≤0.10) |
| Framing | "Earlier treatment associated with greater odds of favorable outcome; both strata still benefit, but odds ratio is higher with earlier treatment." |
| Caveat | Exploratory / post-hoc OTT × treatment interaction analysis; original trials not powered for within-stratum comparison. |

### 10. Verification confidence

**HIGH** — full text read; primary numbers in §6 above match Table 4 / Figure 2 / Results section of Marler 2000 verbatim.

---

## Source-attribution audit of the current pearl

**Current `time-is-brain-deep.content` (src/data/strokeClinicalPearls.ts line 86):**

> "1.9 million neurons die per minute during untreated stroke. Every 15-minute delay reduces probability of good outcome by 4%. NINDS trial: Treatment <90min had 50% vs 38% good outcome at 3 months. Pooled analysis (Emberson 2014): Treatment benefit decreases linearly with time. Target door-to-needle <60 minutes (excellence: <30 minutes)."

Sentence-by-sentence verification:

| Claim | Source attribution | Verdict |
|---|---|---|
| "1.9 million neurons die per minute" | Saver, Stroke 2006 (not NINDS, not Marler) | Correct claim, attribution missing — should be cited to Saver 2006. Not a NINDS/Marler claim. |
| "Every 15-minute delay reduces probability of good outcome by 4%" | Saver et al., JAMA 2013 (GWTG-Stroke registry, 58,353 patients) | Correct claim, but attribution to "NINDS" implicit in current text is **wrong**. This is from Saver 2013, not NINDS 1995 and not Marler 2000. |
| **"NINDS trial: Treatment <90min had 50% vs 38% good outcome at 3 months"** | **MISATTRIBUTION** — the 50%/38% is Barthel ≥95 in Part 2 OVERALL (0–180 min combined), per NINDS 1995 Table 4. The <90 min subgroup result in NINDS 1995 / Marler 2000 is an OR (2.11 adjusted), not a 50%/38% rate. | **BLOCK — semantically invalid.** |
| "Pooled analysis (Emberson 2014): Treatment benefit decreases linearly with time" | Emberson, Lancet 2014 IPD meta-analysis | Correct, but Emberson PDF not in this packet — out of scope to re-verify here. |
| "Target door-to-needle <60 minutes (excellence: <30 minutes)" | AHA/ASA Target: Stroke benchmarks | Correct convention; no trial-data claim. |

---

## Recommendation — verbatim pearl rewrite options for `time-is-brain-deep`

The evidence-verifier preference is **Option A** because the Marler 2000 PDF is verified in this packet and directly supports the time-benefit framing the pearl is trying to make; Emberson 2014 is not yet packet-verified.

### Option A (preferred) — re-source the time-benefit claim to Marler 2000

> "1.9 million neurons die per minute during untreated stroke (Saver 2006). Every 15-minute delay reduces probability of good outcome by ~4% (Saver, JAMA 2013, GWTG registry). NINDS time-stratified analysis (Marler, Neurology 2000): rt-PA vs placebo adjusted OR for favorable 3-month outcome was 2.11 (95% CI 1.33–3.35) at 0–90 min vs 1.69 (95% CI 1.09–2.62) at 91–180 min — earlier treatment, greater benefit. Target door-to-needle <60 minutes (excellence: <30 minutes)."

- `evidence` field: "Saver, Stroke 2006; Saver, JAMA 2013; Marler, Neurology 2000"
- `evidenceClass: 'I'`, `evidenceLevel: 'A'` retained.
- Note: this triggers new claim IDs / citations in `src/lib/citations/registry.ts`. Specifically:
  - Saver 2006 (neurons-per-minute): citation needs to be added if not already present.
  - Saver 2013 (15-min-delay 4% figure): citation needs to be added if not already present.
  - **Marler 2000:** new citation. Suggested ID `marler-2000-ott`. DOI 10.1212/wnl.55.11.1649; PMID 11113218; `last_reviewed: 2026-05-14`; `review_window_months: 36` (landmark trial reanalysis, stable).

### Option B (fallback) — replace with Emberson 2014 framing, defer Marler

Not preferred because Emberson 2014 has not been verified in a packet yet (no PDF supplied). Use only if A is declined.

> "1.9 million neurons die per minute during untreated stroke (Saver 2006). Treatment benefit decreases continuously with delay: pooled IPD meta-analysis (Emberson, Lancet 2014, n=6,756) shows OR for good outcome falls from ~2.0 at 60 min to ~1.0 by 4.5 h. Target door-to-needle <60 minutes (excellence: <30 minutes)."

If Option B is chosen, a separate evidence-packet for Emberson 2014 must be produced first.

---

## Summary for downstream agents

- **NINDS 1995 packet content** is verified HIGH-confidence; no changes needed to `ninds-trial` entry in either `trialData.ts` or `strokeClinicalPearls.ts`.
- **Marler 2000 packet content** is verified HIGH-confidence; the paper supports an OR-based, exploratory, time-stratified framing — NOT a "50% vs 38%" absolute rate.
- **The current `time-is-brain-deep` pearl contains a semantic misattribution** (the 50%/38% is overall Part 2 Barthel data, not a <90 min subgroup). This is a Class C-clinical (pearl-level copy change with citation update) or potentially Class E if interpretation thresholds are involved — orchestrator should classify. Per CLAUDE.md §6.1, "Update the 'What does a score of 6 mean?' card text" is the canonical C-clinical example; this fix is analogous: pearl copy + citation, no scoring threshold change.
- Hook-required follow-up: when the rewrite is implemented, `last_reviewed` for the NINDS citation should be refreshed via §13.6 checklist (today, 2026-05-14, passes the 36-month landmark-trial window from prior packet date 2026-05-11). A new citation entry for Marler 2000 must be added to `src/lib/citations/registry.ts` and mapped in `claims.ts`.

## File paths referenced

- Source PDFs (input):
  - `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/2-Acute Reperfusion  Intravenous Thrombolysis/NINDS.pdf`
  - `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/2-Acute Reperfusion  Intravenous Thrombolysis/Marler et al. (related to NINDS time-stratified benefit — pearl misattribution).pdf`
- Repo files in scope (read-only this task):
  - `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/strokeClinicalPearls.ts` (lines 84–93: `time-is-brain-deep`; lines 95–110: `ninds-trial`)
  - `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts` (line 389: `ninds-trial` entry)
- Companion prior packet for cross-reference: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/phase1c-ninds-mimics.md`
