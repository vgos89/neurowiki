# Clinical review — trial-audit tail, six-record correction batch

**Decision:** approve-with-conditions (all four conditions cleared before commit)
**Reviewer:** clinical-reviewer, three fresh-context rounds
**Date:** 2026-07-31

## Scope
- **Records corrected:** `mr-clean-trial`, `mr-clean-no-iv-trial`, `swift-prime-trial`, `revascat-trial`, `best-trial`, `best-ii-trial`, `best-msu-trial`, plus `laste-trial` and `tension-trial` from the systemic sweep.
- **Surfaces changed:** structured data in `src/data/trialData.ts`; chart labels and props in `src/pages/trials/TrialPageNew.tsx`; regenerated card meta.
- **Evidence:** each finding independently re-verified against the primary publication before any edit. Sources: LeCouffe NEJM 2021;385:1833-44 · Mistry JAMA 2023;330(9):821-831 · Grotta NEJM 2021;385(11):971-981 · Liu Lancet Neurol 2020;19:115-22 · Saver NEJM 2015 · Berkhemer NEJM 2015 · Jovin NEJM 2015 · Costalat NEJM 2024 · Bendszus Lancet 2023.

## Verification outcome
The audit was treated as a hypothesis list. Of the items checked: **10 confirmed, 1 REFUTED, 3 new defects found that the audit missed, 4 left unresolved rather than guessed.**

**The refutation matters.** The audit claimed BEST-MSU's `primaryDesign: 'binary-superiority'` was a mis-tag and should be re-tagged ordinal. The verifier refused: a committed 2026-05-20 review records a full-text read of the NEJM Methods quoting the main analysis as a binary dichotomisation at utility-weighted mRS ≥0.91. Re-tagging would have reversed a documented primary-source decision on the strength of a hypothesis. Left alone.

## What was wrong
- **MR CLEAN-NO IV** recovery rates were 7 to 10 points below published (39.7/44.3 vs the true 49.1/51.1), and the stated between-arm gap was more than double the real one. Its non-inferiority margin was also fabricated: stated as -10 percentage points on the dichotomised outcome, when the trial pre-specified a lower 95% CI bound of 0.8 on the adjusted common odds ratio.
- **BEST-II** carried a wrong value for one arm (0.55 for <160 mm Hg; published 0.47) which manufactured a clean monotonic dose-response. The real ordering is non-monotonic, the middle target performed worst, and with about 40 patients per arm all three intervals overlap. The page now says exactly that. Its eligibility also restricted enrolment to mTICI 2c or better when the trial enrolled 2b, 2c or 3, contradicting the record's own verbatim eligibility block.
- **BEST-MSU** listed a 24-hour enrolment window for a trial that took patients within 4.5 hours, described a seven-centre trial as Houston-only in four places, and rendered a confidence interval (1.43-3.22) that appears in no source, in-repo or published.
- **BEST** stated control-arm crossover as "22 of 65" when the published figure is 14 of 65 (22%): a percentage written down as a patient count, propagated to six locations. Its safety summary put symptomatic haemorrhage at "approximately 14% vs 3%" when the published figures are 5 of 66 (7.6%) versus **zero** of 65. The wrong control figure converted a zero-event arm into a nonzero baseline, softening a real safety signal.
- **SWIFT PRIME** claimed the largest 2015 functional-independence gap among uniform-device trials. False: EXTEND-IA was also single-device and reported a larger gap, and the same file awards that title to EXTEND-IA elsewhere. Its chart displayed "Risk ratio 2.75 (1.53-4.95)", a crude odds ratio recomputed from the arm percentages and printed under a risk-ratio label, inflating the apparent effect by about 60% against the published RR of 1.70.
- **MR CLEAN**'s chart displayed the ordinal common odds ratio under a "Risk ratio" label with an **unsourced p-value** for a trial that published none, beneath a header promising a distribution the page cannot draw.

## Review history: three rounds, two of which caught a defect in the fix
| Round | Outcome |
|---|---|
| 1 | **block** — the sICH correction landed on one pearl and missed the adjacent one, leaving the record stating two different control-arm rates; both corrected chart headers left a stale "stacked distribution" description in the teaching card below; and the MR CLEAN chart change created a **new** contradiction, showing an adjusted OR of 2.16 while the card beneath still told the reader the number was 1.67. |
| 2 | **approve-with-conditions** — blockers closed and the systemic sweep done properly, but four small new inconsistencies shipped alongside: a contested endpoint form asserted on one chart, a scale mismatch on another, a phrase pointing readers at "the bars" of a chart that draws dots, and one swept record given half the remedy. |
| 3 | conditions cleared. |

**The sweep is the part worth keeping.** Rather than pattern-matching the fix, the render branch was read for every trial with an ordinal statistic and no distribution data. Three more records were found, and they did **not** all render the same thing: REVASCAT falls through to a dot chart, LASTE and TENSION to a median-comparison block. Copying one description onto all three would have re-created the defect on two pages. Each now describes what actually renders, and the two that cannot show a full breakdown say so outright.

## Condition status (all cleared before commit)
- **C1 CLEARED** — the BEST-MSU endpoint label no longer asserts a dichotomisation form that an unchanged card on the same page contradicts. It now uses wording all three surfaces support, leaving the contested detail to the tracked full-text read.
- **C2 CLEARED** — BEST-II's difference is now labelled with its scale, so "-0.07" is not read as the gap between two figures displayed as 51 and 58.
- **C3 CLEARED** — "reported beside the bars" corrected in all three records: the component draws dots, and the primary sits in the header above the chart, not beside it.
- **C4 CLEARED** — REVASCAT received the same treatment as MR CLEAN: an explicit "Adjusted OR" label (2.1 as a risk ratio would be wrong; the risk ratio is about 1.55), a reconciliation sentence naming both estimates, and an empty p-value so the row is suppressed rather than rendering the literal text "p = not reported".

## Left unresolved rather than guessed
- **BEST-MSU adjusted OR: 2.14 vs 2.43 vs 2.12.** Three values exist across the repo. The confidence-interval correction rests on two in-repo surfaces agreeing and is log-symmetric about 2.14, but the point estimate needs a full-text read before anything further moves.
- **BEST-MSU NNT.** Allocation was by alternating-week cluster, not patient-level randomisation, and the NNT derives from a secondary endpoint. The audit skill bans NNT on non-randomised comparisons; a committed review defended it on other grounds. Escalated per §3 rather than silently picking a side.
- **MR CLEAN per-category distribution.** Populating it is the correct end state but the source is unavailable. No values invented.
- **BEST-II 60-minute BP-initiation criterion.** Conflicts with the record's own 45-minute randomisation window; needs a Methods read.

## Required follow-ups (tracked in TASKS.md)
- **The mislabel class is systemic.** Only 5 of roughly 60 chart call sites pass an explicit effect label; the rest inherit a "Risk ratio" default while embedding their own prefix, producing rendered strings such as "Risk ratio HR 0.79", "Risk ratio RD +2.1 pp" and "Risk ratio ARR 52.8 pp". Hazard ratios and risk differences displayed under the words "Risk ratio" is the same display error just fixed on four records. Apply the enumerate-then-fix discipline used for the distribution sweep, and consider making the label required so the default cannot silently apply.
- **TENSION symptomatic haemorrhage contradiction:** the chart footer says 5% in both arms while the teaching card one section below says 6% versus 5%. Pre-existing; needs a full-text check then alignment of both surfaces.
- **Chart statistics have no home in the data layer.** The corrected estimates for MR CLEAN, REVASCAT and SWIFT PRIME exist only as literals in the render file, outside any record field or evidence packet.
- **Trial-record claim annotations are not hook-scanned.** The `/* claimId: … */` comment form used throughout the trial data matches nothing in the claims checker, whose pattern requires a quoted field. Every trial statistic in that file is therefore outside metadata enforcement. This is the false-sense-of-coverage failure the rule exists to prevent.
- An evidence packet still carries the superseded "22 of 65" and will re-propagate it; append a correction note. The append-only review artifact carrying it must not be rewritten.
