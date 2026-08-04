# Clinical review — THALES guideline attribution (COR 3 → COR 2b)

**Decision:** approve
**Reviewer:** orchestrator, verified directly against the published guideline PDF
**Date:** 2026-08-04
**Class:** E-clinical (guideline attribution change, 15 rendered surfaces)

## Scope

- Claims touched: the AHA/ASA 2026 class-of-recommendation attached to ticagrelor plus aspirin
  DAPT after minor stroke or high-risk TIA.
- Citations affected: none re-dated. The guideline mirror `aha2026StrokeGuideline.ts` gains one
  recommendation and one corrected transcription.
- Surfaces changed: trial record fields (applicability, chart info, clinicalContext, keyPoints,
  keyMessage, listDescription, howToReadChart Q+A, tooltip, cautions, bedsidePearl,
  bottomLineSummary), the generated card projection, the stroke guide page (verdict line,
  comparison table row, CHANCE-2 disambiguation line), and the guideline mirror.
- Evidence: `/Users/vaibhav/Documents/NeuroWiki/Articles/Guidelines/2026-Guideline-for-acute-ischemic-stroke.pdf`,
  §4.8 Antiplatelet Treatment, recommendation table and the numbered supporting text.

## The defect

Every THALES surface in this repo stated that AHA/ASA 2026 rates ticagrelor plus aspirin
**COR 3: No Benefit**, several of them adding "for the general population". The guide page carried
the same verdict, including in a comparison table where THALES was the only row marked COR 3.

The published guideline says the opposite. §4.8 contains two distinct recommendations:

**Recommendation 9, COR 3: No Benefit, LOE B-R** (verbatim):

> "In patients with minor (NIHSS score ≤3) noncardioembolic AIS or high-risk TIA (ABCD2 score ≥4),
> ticagrelor is not recommended over aspirin to reduce the composite endpoint of stroke, myocardial
> infarction, or death."

Its citation is reference 15, Johnston SC and Amarenco P, *Ticagrelor versus aspirin in acute
stroke or transient ischemic attack*, N Engl J Med 2016. That is SOCRATES: **ticagrelor
monotherapy used in place of aspirin**.

**Recommendation 13, COR 2b, LOE B-R** (verbatim):

> "In patients with recent (<24 hours) minor (NIHSS score ≤5) noncardioembolic AIS or high-risk TIA
> (ABCD2 score ≥6 or symptomatic intracranial or extracranial ≥50% stenosis of an artery that could
> account for TIA) who did not receive IVT, DAPT with ticagrelor (including loading dose) plus
> aspirin for 30 days may be considered to reduce the risk of 30-day recurrent stroke."

Its citation is reference 26, which the supporting text names explicitly as THALES.

So the repo took a COR 3 written about a different regimen, in a narrower population, answering a
different question, and attached it to THALES.

## Why this matters at the bedside

The two ratings point opposite ways. "May be considered" places a regimen inside the range of
defensible choices; "No Benefit" places it outside. A clinician reading the THALES page was being
told the guideline had rejected a regimen the guideline in fact permits. The population was also
misstated: the COR 3 covers NIHSS ≤3 with ABCD2 ≥4, while THALES and its own recommendation cover
NIHSS ≤5 with ABCD2 ≥6 or ≥50% symptomatic stenosis.

## Root cause

The guideline mirror was missing recommendation 13 entirely. Its `daptForMinorAIS` group held
recommendations 12, 14, 15 and 9, but not 13. With no 2b entry for ticagrelor plus aspirin in the
mirror, the nearest ticagrelor-shaped recommendation was the COR 3, and the trial record was written
against that. This is the same failure mode already recorded for this file: the mirror was built and
validated against its own construction plan rather than against the published document, so an
omission is invisible to every check in the repo. `check:guideline-mirror` counts recommendations
and reports how many have verified quoted text; it cannot report one that was never entered.

## What was NOT changed

The editorial position that clopidogrel plus aspirin remains the practical default is retained
everywhere, and is consistent with the corrected ratings: clopidogrel DAPT is COR 1 LOE A,
ticagrelor DAPT is COR 2b LOE B-R. The supporting numbers (NNT 91 against CHANCE 28, severe bleeding
0.5% vs 0.1%) are unchanged and are now presented as the reason for a weak recommendation rather
than as the basis of a rejection. The CHANCE-2 CYP2C19 recommendation (recommendation 15, COR 2b)
is untouched.

## Semantic validity

Confirmed. Each corrected surface now states COR 2b with LOE B-R, and the three surfaces that
previously said "for the general population" no longer imply a scope the guideline does not use.
The two surfaces that still mention COR 3 do so to distinguish it explicitly from this regimen,
which is the disambiguation a reader needs.

## Required follow-ups

- The mirror holds 135 recommendations of which 19 are verified against a source in this repo. This
  finding is direct evidence that unverified entries can be wrong by omission as well as by
  transcription. The §4.8 group is now read end to end against the PDF; the remaining sections are
  not. Track under the existing guideline-mirror verification backlog.
- Check whether any other trial record inherits a class of recommendation from a mirror entry that
  cites a different trial. THALES was found only because its audit finding pointed at the mirror.
