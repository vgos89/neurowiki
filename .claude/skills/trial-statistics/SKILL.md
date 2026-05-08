---
name: trial-statistics
description: Statistical design taxonomy and interpretation rules for clinical trials. Load when authoring or reviewing trial pages, statistics displays, mRS shift results, NNT cards, or noninferiority/Bayesian/ordinal-shift trials.
---

# Trial Statistics Skill

## Noninferiority trials

**Core rule:** A noninferiority (NI) trial proves that the new treatment is not worse than the standard by more than a pre-specified margin (Δ). NI does not prove superiority. Reporting it as "showed no difference" or "equivalent" is incorrect — NI is a one-sided statistical argument.

**What to display:**
- The NI margin (Δ), the observed treatment difference, and the CI for that difference.
- Whether the upper bound of the CI for the difference crosses Δ (crosses → NI not established).
- Do NOT show a standard superiority p-value as the primary result.
- Do NOT show NNT (no interpretable ARD in the NI framing).

**Appropriate display archetype:** `ni-margin-chart`

**Examples in neurovascular practice:** ARUBA (interventional vs. medical management for unruptured AVMs), RESPECT (PFO closure for cryptogenic stroke), tenecteplase vs. alteplase trials.

---

## Bayesian adaptive trials

**Labeling:** Show the posterior probability of superiority (e.g., "P(intervention > control) = 0.97"), not a classical p-value. The Bayesian posterior and a frequentist p-value are not the same quantity and cannot be compared using the same α threshold.

**Do NOT:** Label a Bayesian result with "p < 0.05" or similar. The concept does not directly translate.

**Common error:** Reporting a Bayesian adaptive trial as "significant at p < 0.05." Flag this and replace with the posterior probability.

**Appropriate display archetype:** Depends on outcome type, but the primary result label must be the posterior probability, not a p-value.

**Examples:** REMAP-CAP, some adaptive platform trials in intensive care.

---

## Ordinal shift (mRS) outcomes

**What it means:** The primary outcome is the full distribution of mRS scores (0–6), analyzed with ordinal logistic regression. The effect measure is the common odds ratio (OR) — interpreted as the odds that a randomly selected patient in the treatment arm has a better mRS score than a randomly selected patient in the control arm.

**Display:** Grotta bar (stacked mRS distribution showing all 7 mRS categories for each arm) — NOT a simple bar chart of good outcomes (mRS 0–2). Showing only mRS 0–2 discards information from the rest of the distribution.

**NNT:** Not appropriate. The common OR from ordinal logistic regression does not convert cleanly to NNT without a specific dichotomization assumption that the trial did not pre-specify.

**Common error:** Converting the ordinal OR to NNT by treating it as a binary outcome. This is statistically inappropriate unless the trial explicitly pre-specified a binary dichotomization as a secondary outcome. Flag and block.

**Appropriate display archetype:** `grotta-bar`

**Examples:** DAWN, DEFUSE-3 (mRS at 90 days as primary).

---

## Odds ratio vs. risk ratio vs. hazard ratio

These are not interchangeable. State which measure is being displayed.

| Measure | Use case | Notes |
|---|---|---|
| Standard OR | Binary outcome, logistic regression | Magnitude depends on baseline risk; overestimates RR when outcome is common (>10%) |
| Common OR (ordinal logistic) | Ordinal outcomes (mRS) | Assumes proportional odds; verify this assumption is met |
| Risk ratio (RR) | Binary, prospective risk | More intuitive than OR but cannot be estimated from case-control designs |
| Adjusted rate ratio | Count or Poisson outcomes | Context-dependent |
| Hazard ratio (HR) | Time-to-event, Cox model | Does not equal RR at a given timepoint; reflects the instantaneous rate ratio |
| Generalized OR | Some adaptive/platform trials | Specify which package/method |

Never use OR and RR interchangeably. Never report an HR as if it were a simple risk ratio at a fixed timepoint.

---

## Composite endpoints

**The problem:** A trial may reach its composite primary endpoint primarily through a softer component (e.g., hospitalization drives a cardiovascular composite, not mortality). The composite result does not imply benefit on each individual component.

**What to check:**
1. Is the composite pre-specified as the primary endpoint? (Yes → use composite result for the primary display)
2. Which component drove the result? (Report this in caveats)
3. Is NeuroWiki attributing the result to a specific component rather than the composite? (Flag if so)

**Required caveat:** When the composite is driven primarily by a non-mortality/non-disability component, the caveat field must say so.

---

## Registry and single-arm evidence

**What it is:** Observational data. No randomization, no concurrent control. Confounding and selection bias cannot be excluded. Cannot establish causation.

**What to display:** Safety event rates or descriptive statistics. No efficacy bars, no NNT, no superiority p-values. No Class I recommendation language based on registry data alone.

**Appropriate display archetype:** `registry-safety`

**Labeling:** "Registry data," "observational," or "non-randomized." AHA/ASA guideline class should not exceed IIb on registry data alone.

**Examples:** GWTG-Stroke registry analyses, SRS (Society of Thoracic Surgeons) registry reports.

---

## Futility trials

**What it means:** The trial stopped because the intervention was unlikely to achieve its primary endpoint (failed to meet the pre-specified interim efficacy boundary), OR because the data crossed the pre-specified futility boundary.

**Do NOT:**
- Show NNT (no meaningful ARD from a futility trial).
- Display as a positive superiority trial.
- Label as "showed no difference" or "equivalent" — futility ≠ proof of absence.

**Do show:** Design type, the futility decision and which boundary was crossed, safety results.

**Appropriate display archetype:** `no-efficacy`

**Examples:** MRCLEAN-MED (stopped for futility at interim analysis), some dose-finding trials.

---

## Trials stopped early for benefit

Trials stopped early for benefit tend to overestimate effect size due to truncation bias (Pocock / DSMB stopping rules result in selection of an extreme random excursion).

**Required caveat:** "Stopped early for benefit — effect size may be overestimated." This caveat must appear in the `legend` or `howToInterpret` field for any such trial.

---

## Absolute risk difference and CI

- **Always show the ARD alongside any relative measure** (OR, RR, HR). Relative measures amplify small absolute differences.
- **ARD requires a CI.** Never show ARD without a CI.
- **NNT = 1 / ARD.** Compute only from the actual ARD, not from a relative measure. Round to the nearest integer or show to one decimal place.
- The CI for NNT is derived from the CI for the ARD (invert the bounds). Show it.

---

## Subgroup analyses

Subgroup analyses are exploratory unless:
1. Pre-specified in the protocol.
2. The trial was powered for the subgroup.
3. The interaction p-value is significant.

Post-hoc subgroup analyses cannot substitute for a primary result. Display them as hypothesis-generating only, with the caveat "exploratory subgroup — not powered for this comparison."
