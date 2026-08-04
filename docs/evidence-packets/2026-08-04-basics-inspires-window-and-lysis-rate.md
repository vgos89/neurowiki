# Evidence packet — BASICS lysis rate and INSPIRES enrollment window

**Date:** 2026-08-04
**Prepared during:** trial-data audit tail, medium-risk batch
**Reason:** two findings in the audit tail could not be settled from in-repo evidence. Both records
were internally consistent, so the record-versus-record method used for the rest of this batch had
nothing to compare against. Both required the primary publication.

---

## 1. BASICS — proportion of the medical arm that received IV thrombolysis

**Source:** Langezaal LCM, van der Hoeven EJRJ, Mont'Alverne FJA, et al. Endovascular Therapy for
Stroke Due to Basilar-Artery Occlusion. *N Engl J Med.* 2021;384(20):1910–1920.
PMID 34010530. DOI 10.1056/NEJMoa2030297. Retrieved from PubMed 2026-08-04.

**Verbatim from the abstract:**

> "Intravenous thrombolysis was used in 78.6% of the patients in the endovascular group and in 79.5%
> of those in the medical group."

**What the repo said:** three surfaces in the `basics-trial` record stated approximately 40% of the
medical arm received alteplase (`trialDesign.type`, a pearls entry, and `trialDesignNarrative`).

**Assessment:** wrong by a factor of two, and wrong in the direction that flatters the endovascular
arm. A reader who believes only 40% of controls were lysed will discount the null primary result as
an artifact of an undertreated comparator. The true figure, 79.5%, means the control arm received
standard care at essentially the same rate as the intervention arm, which makes the null result
harder to explain away, not easier.

**Applied:** all three surfaces now state 79.5% (or approximately 80% where the surface is a short
design chip), and the narrative states both arms so the comparability is visible.

---

## 2. INSPIRES — enrollment window

**Source:** Gao Y, Chen W, Pan Y, et al. Dual Antiplatelet Treatment up to 72 Hours after Ischemic
Stroke. *N Engl J Med.* 2023;389(26):2413–2424. PMID 38157499. DOI 10.1056/NEJMoa2309137.
Retrieved from PubMed 2026-08-04.

**Verbatim from the abstract:**

> "Patients were randomly assigned, in a 1:1 ratio, within 72 hours after symptom onset..."

> "A total of 12.8% of the patients were assigned to a treatment group no more than 24 hours after
> stroke onset, and 87.2% were assigned after 24 hours and no more than 72 hours after stroke onset."

**What the repo said:** the `inspires-trial` record carried two mutually exclusive claims.
Four surfaces described enrollment as "within 24 to 72 hours" (including a `fullEligibility` item
presented as publication-verbatim), while a chart annotation reported benefit "consistent across
0–24h and 24–72h initiation subgroups" and `howToInterpret.doesNotProve` stated the trial "does not
address the 0–24h window directly."

**Assessment:** the enrollment-window statements are the wrong ones. INSPIRES randomized from 0 to
72 hours; the 0–24h stratum existed and contained 781 patients. Two consequences:

1. The `fullEligibility` item was not verbatim. Presenting altered text as a quoted criterion is a
   worse defect than an ordinary paraphrase error, because the verbatim contract is what lets a
   reader trust the eligibility card without opening the paper.
2. `doesNotProve` understated the trial in a way that would change bedside reasoning. The honest
   limitation is not that the early window was unstudied but that it was thinly represented: 12.8%
   is too small a stratum to carry the early-window question on its own, so CHANCE and POINT remain
   the evidence there.

**Note on what was NOT changed.** Statements scoping the *AHA/ASA 2026 recommendation* to 24–72
hours are correct and were left alone, including `aha2026StrokeGuideline.ts` recommendation text and
the matching guide-page line. The guideline deliberately scopes its COR 2a to the late window
because the early window is already covered at COR 1. A trial enrollment window and a guideline
recommendation window are different objects; conflating them is what produced this defect.

**Applied:** four enrollment-window surfaces corrected to "within 72 hours"; `doesNotProve` rewritten
to state the 12.8% figure. Subgroup and guideline-scoping surfaces untouched.

---

## Method note

The audit tail entry for INSPIRES proposed the opposite fix: it read the "24 to 72 hours"
eligibility item as authoritative and proposed rewriting `doesNotProve` to match it. Applying that
proposal would have hardened the error and removed the one surface that was telling the truth. This
is the fourth item in this batch where the audit correctly located a contradiction and then resolved
it the wrong way, which is the reason this batch is being worked trial by trial against sources
rather than bulk-applied.
