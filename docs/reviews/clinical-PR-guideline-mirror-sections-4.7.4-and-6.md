# Clinical review — guideline mirror §4.7.4 and §6.1 to §6.4

**Decision:** approve
**Reviewer:** orchestrator, verified line by line against the published guideline PDF
**Date:** 2026-08-05
**Class:** E-clinical (guideline transcription: two whole sections added, two grade corrections,
two citation `quoted_text` corrections)

## Why this pass happened

The THALES correction on 2026-08-04 found that the mirror was missing a whole recommendation, and
that the omission had pushed an inverted verdict onto a trial page. Nothing in this repo can detect
a missing recommendation: `check:guideline-mirror` counts what is present and reports how many
entries have a registered source. So the omission class of defect was, until now, entirely
unpoliced. This pass reads the published PDF section by section looking specifically for that.

Source: `/Users/vaibhav/Documents/NeuroWiki/Articles/Guidelines/2026-Guideline-for-acute-ischemic-stroke.pdf`.
Where the two-column layout made a grade cell ambiguous, the page was re-extracted in reading order
with a single-page `pdftotext` call rather than trusted from the whole-document dump. That mattered
once, below.

## §4.7.4 Endovascular Techniques — entire section was absent

Nine recommendations, none of them in the mirror. Two matter directly to pages we already publish:

- **Recommendation 9, COR 3: No Benefit, LOE B-R.** "In the management of patients with AIS in the
  setting of LVO, preoperative administration of tirofiban before EVT is not useful to improve
  90-day functional outcome." This is the guideline's verdict on RESCUE BT. The RESCUE BT page
  carried no guideline verdict at all, on a drug the guideline explicitly tells clinicians not to
  give. Now surfaced on that page.
- **Recommendation 5, COR 3: No Benefit, LOE A.** Medium and distal vessel occlusions
  (non-dominant or codominant M2, M3, or posterior cerebral arteries): EVT with stent retrievers is
  of no benefit. This is the verdict covering ESCAPE-MeVO and DISTAL. Note the scope carefully:
  non-dominant or codominant M2 and M3, not M2 in general.

## §6.1 to §6.4 — two sections absent, two grades wrong

**§6.1 Brain Swelling (General).** Three COR 1 recommendations, all absent: early shared
decision-making with patient and family, close neurological monitoring in the first days, and early
transfer to a centre with neurosurgical and critical care expertise. Added.

**§6.2 Brain Swelling (Medical).** The mirror's osmotic-therapy entry was graded LOE B-NR and scoped
to "mild to moderate cerebral edema ... as a temporizing measure to control elevated ICP". The
guideline grades it **C-LD** and scopes it to patients with **neurological decline**, positioning it
as a **bridge to surgical intervention**, with the stated benefit being functional outcome and
mortality. Those are different clinical instructions. The COR 3 against IV glibenclamide was absent;
added.

**§6.3 Supratentorial Infarction (Surgical).** The mirror carried two paraphrases of this section
inside its brain-swelling group, both wrong:

| | mirror said | guideline says |
|---|---|---|
| ≤60 years | COR 1, **LOE B-R**, "malignant cerebral edema who are candidates for surgical intervention" | COR 1, **LOE A**, "unilateral MCA infarctions who deteriorate neurologically within 48 hours from brain swelling despite medical therapy", craniectomy **with dural expansion** |
| >60 years | **COR 2a**, "individualized decision-making regarding **functional outcomes**" | **COR 2b**, "may be considered **to reduce mortality**" |

The >60 error is the clinically dangerous one. It upgrades the strength of the recommendation and
substitutes functional outcome for mortality as the stated benefit. The whole point of DESTINY II is
that surgery above 60 buys survival, mostly at mRS 4 to 5. A page that says 2a and talks about
functional outcomes misrepresents exactly the trade-off the family conversation turns on.

The ≤60 entry also dropped every scoping condition, leaving a circular criterion ("candidates for
surgical intervention") in place of the guideline's unilateral MCA, deterioration within 48 hours,
despite medical therapy. Recommendations 1 and 4 of the section were absent; added.

**§6.4 Cerebellar Infarction (Surgical).** The mirror had one of two recommendations. The
ventriculostomy recommendation (COR 1, LOE C-LD) was absent entirely, and the craniectomy entry
dropped the **≥35 mL volume threshold**, the dural expansion, and half the stated benefit. Both now
transcribed in full.

## Two citation `quoted_text` fields were not from their source

This is the more serious structural finding, because `quoted_text` is what every other check in this
repo treats as ground truth.

**`aha-asa-2026-6.3`.** Its own comment read "Verbatim from
`src/data/aha2026StrokeGuideline.ts` acuteComplicationsRecommendations.brainSwelling[0-1]". The
quote was transcribed **from the mirror**, then registered as the source that verifies the mirror.
That is circular validation with no external anchor, and it is how both §6.3 grade errors survived
review and counted toward the "verified" total. Replaced with the published §6.3 text,
`last_reviewed` refreshed to 2026-08-05 against the source.

**`aha-asa-2026-4.7.4`.** Claimed to be verbatim from page e57 and graded the tirofiban
recommendation **LOE A**. The published grade cell reads **B-R**. This one is notable for running the
other way: the citation was wrong and the mirror entry I had just transcribed was right, which is
what surfaced the conflict when the check compared them. It also embedded editorial attributions
("A based on RESCUE-BT", "B-R per CHOICE") inside the verbatim field. Those notes are defensible as
annotation and have been moved into the comment; they must not sit inside `quoted_text`. Corrected,
`last_reviewed` refreshed.

## Semantic validity

Confirmed. Every added or corrected recommendation is a transcription, not a paraphrase, and each was
read from the PDF at the point of writing. Where a grade cell sat ambiguously in the two-column dump,
the page was re-extracted in reading order before the value was recorded.

## What this does not fix

The mirror now holds 151 recommendations, 24 of which have a registered source. The remaining 127 are
unvalidated by anything. This pass covered §4.7.4 and §6.1 to §6.4 because a trial-page defect
pointed there. The sections not yet read against the PDF may contain the same two defect classes:
silent omission, and paraphrase that shifts a grade or a scope. Two of the four grade errors found so
far were strength upgrades, which is the direction that turns a discretionary option into an
instruction.

## Required follow-ups

- Read the remaining guideline sections against the PDF, prioritising any section a rendered page
  cites. Track under the guideline-mirror verification backlog.
- Audit every `quoted_text` in the citation registry for the §6.3 failure mode: a quote whose comment
  or provenance points at a repo file rather than at the publication. Two of the small number checked
  so far were defective; the base rate is unknown and that is the problem.
- Surface the §4.7.4 recommendation 5 verdict on the medium-vessel trial pages (ESCAPE-MeVO, DISTAL),
  which currently carry no guideline grade. Held back from this commit because those records are
  concurrently under review in the trial-audit tail pass.
