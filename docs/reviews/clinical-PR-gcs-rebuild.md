# Clinical review — GCS Calculator rebuild (Class D-clinical)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-sonnet-4-6)
**Date:** 2026-04-17

---

## Wave 5 deviation note

The standard citation infrastructure (`src/lib/citations/claims.ts` CLAIM_REGISTRY,
`src/lib/citations/registry.ts` citation registry) does not yet exist in this
repository. This is a documented Wave 5 item per ADR-001. As a result:

- Claim IDs below use descriptive slugs derived from claim content rather than
  formal registry IDs (e.g., `gcs-mild-threshold`, `gcs-airway-threshold`).
- `quoted_text` fields from citation records cannot be checked — no records exist.
  Mandatory-block condition 4 (quoted_text mismatch) cannot be evaluated.
  This is a structural gap, not a pass.
- `last_reviewed` cannot be checked via the formal registry. Medical Scientist
  noted "Medical Scientist verified (2026-04-17)" in a comment in `gcsScoreData.ts`
  line 95. This comment is treated as the Wave 5 equivalent of a `last_reviewed`
  entry; it has no enforcement mechanism behind it.
- The pre-commit hook claim scanner has no claim surfaces to scan (no `data-claim`
  attributes, no formal `claim()` helpers used). Hook passing provides no metadata
  assurance for this PR. Semantic review is the only gate.

These deviations are accepted per ADR-001. The Wave 5 citation infrastructure must
be in place before any subsequent calculator rebuild ships clinical content.

---

## Scope

- **Claims touched:**
  - `gcs-mild-threshold` — GCS 13–15 = mild impairment of consciousness (ACRM 1993, Teasdale & Jennett 1974)
  - `gcs-moderate-threshold` — GCS 9–12 = moderate impairment; moderate TBI per ACRM 1993
  - `gcs-severe-threshold` — GCS 3–8 = severe impairment / coma
  - `gcs-airway-threshold` — GCS ≤8 as airway management decision threshold
  - `gcs-mild-ct-caveat` — GCS 13–15 does not rule out serious intracranial pathology
  - `gcs-airway-reflex-caveat` — protective reflexes may be unreliable at GCS 9–12
  - `gcs-ich-score-weights` — ICH Score GCS point weights (Hemphill et al. 2001)
  - `gcs-t-suffix` — T suffix for verbal-not-testable (intubated)
  - `gcs-sedation-caveat` — sedation/metabolic/postictal confounders suppress GCS

- **Citations affected:**
  - Teasdale G, Jennett B. Lancet. 1974;2(7872):81–84. PMID: 4136544
  - ACRM 1993 mild TBI definition (no formal registry entry; referenced in code comment)
  - Hemphill JC et al. ICH Score. Stroke. 2001;32:891–897 (referenced inline in explanation text; no registry entry)

- **Surfaces changed (§13.3 categories):**
  - Structured data in `src/data/gcsScoreData.ts`: `GCS_CITATION` object, `getSeverity()` threshold logic, `INTERPRETATION` record (computed strings returned from `calculateGCS`)
  - Static JSX: citation rendered in `GlasgowComaScaleCalculator.tsx` footer and drawer footer via `GCS_CITATION` object fields
  - Computed strings from `calculateGCS()` function: `interpretation` and `explanation` fields in `GCSResult` — these are Phase 2 surfaces (formal `claim()` wrapper not yet implemented)

---

## Semantic validity

### Surface 1 — Severity threshold logic (`getSeverity`)

**Confirmed.**

- `total >= 13` → `'low'` (mild): Accurate per ACRM 1993, which defined mild TBI as GCS 13–15 at
  presentation. Teasdale & Jennett 1974 described the scale; ACRM 1993 operationalized the
  13–15 mild threshold. Both citations are appropriately credited.
- `total >= 9` → `'moderate'`: Accurate. ACRM 1993 places GCS 9–12 in the moderate TBI band.
- `total < 9` (i.e., 3–8) → `'high'`: Accurate. ACRM 1993 / consensus places GCS ≤8 in the
  severe band.
- The prior bug (`>= 14` for mild) has been corrected. The correction (`>= 13`) is clinically
  appropriate and aligned with cited sources.
- Five never-drift categories: no violations. Recommendation strength, action verbs, qualifiers,
  certainty markers, and temporal constraints are all preserved correctly for a threshold definition.

### Surface 2 — Low/mild interpretation (`INTERPRETATION.low`)

**Confirmed.**

- "A GCS of 13–15 indicates mild impairment of consciousness." — Accurate paraphrase. Teasdale &
  Jennett 1974 characterized this range as mildly impaired wakefulness and responsiveness.
- "Teasdale and Jennett (Lancet 1974) defined this range as mildly impaired wakefulness and
  responsiveness." — Accurate attribution. No upgrade of recommendation strength.
- "The American Congress of Rehabilitation Medicine (ACRM 1993) placed GCS 13–15 at
  presentation as the threshold for mild traumatic brain injury." — Accurate. The "at presentation"
  qualifier is preserved and important (GCS must be measured at or near time of injury, not after
  resuscitation confounders are introduced). No qualifier dropped.
- "A score in this range does not rule out serious intracranial pathology — CT imaging decisions
  rest on clinical context, not GCS alone." — Clinically sound caveat. Certainty marker preserved
  ("does not rule out" — appropriate epistemic hedge; does not say "rules out" or "excludes").
  No action verb drift.
- "Serial reassessment matters: evolving hemorrhage or edema can drive rapid deterioration despite
  a reassuring initial score." — "can drive" appropriately hedges. No certainty upgrade to "will" or
  "causes." No temporal constraint violated.
- Five never-drift categories: no violations.

### Surface 3 — Moderate interpretation (`INTERPRETATION.moderate`)

**Confirmed.**

- "A GCS of 9–12 indicates moderate impairment of consciousness." — Accurate.
- "In traumatic brain injury, ACRM 1993 defines this band as moderate TBI." — Accurate.
  "In traumatic brain injury" qualifier preserved — important because ACRM 1993 definitions
  apply specifically to TBI populations, not all causes of consciousness impairment.
- "Airway assessment is essential — protective reflexes may be unreliable at this level." —
  "Essential" is a strong action-adjacent word but does not name a specific intervention
  (consistent with standard clinical teaching at this GCS range). "May be unreliable" is
  correctly hedged — does not overstate to "are absent" or "are lost."
- "Rapid imaging and neurosurgical consultation are warranted if hemorrhage or mass effect is
  suspected." — Conditional qualifier "if hemorrhage or mass effect is suspected" is preserved.
  "Are warranted" is appropriate strength for this population. No gate dropped.
- "A GCS of 9 and a GCS of 12 can represent substantially different clinical states; trajectory
  over time carries more information than any single score." — Editorial caveat, appropriately
  hedged with "can represent." Clinically accurate and not a fabricated claim.
- Five never-drift categories: no violations.

### Surface 4 — High/severe interpretation (`INTERPRETATION.high`)

**Confirmed with one condition — see Required follow-ups.**

**Claim: GCS ≤8 / airway threshold / Teasdale & Jennett 1974 attribution**

"GCS ≤8 is the threshold commonly used to define coma and guide airway management decisions
(Teasdale & Jennett, Lancet 1974)."

The clinical content of this claim is accurate — GCS ≤8 is the widely used coma threshold
and guides airway management decisions in clinical practice. The hedge "commonly used" prevents
this from being an overstatement.

However, the parenthetical attribution `(Teasdale & Jennett, Lancet 1974)` is imprecise. The
1974 paper introduced and described the scale and its levels; it did not specify GCS ≤8 as an
airway management threshold. The ≤8-intubate convention emerged from subsequent clinical
application and literature. No never-drift category is violated (no recommendation strength,
action verb, qualifier, certainty, or temporal constraint is incorrectly represented), but the
parenthetical implies more specificity than the 1974 paper provides. This is an attribution
precision issue, not a clinical safety issue. A follow-up is required (see Required follow-ups)
but does not block merge.

**Claim: ICH Score point weights (Hemphill et al., Stroke 2001)**

"In the ICH Score (Hemphill et al., Stroke 2001), GCS 3–4 carries the highest point weight
(2 points) and GCS 5–12 carries 1 point."

Confirmed accurate. Hemphill et al. 2001 (Stroke. 2001;32:891-897) assigns:
- GCS 3–4 = 2 points
- GCS 5–12 = 1 point
- GCS 13–15 = 0 points

The claim correctly states both point values for both GCS bands. "Reflecting the prognostic
importance of this threshold" is an accurate editorial characterization of why the ICH Score
assigns these weights.

**Claim: T suffix notation**

"When verbal is not testable due to intubation, document with the T suffix (e.g., '9T' = E4
+ M5, verbal not assessed)."

Confirmed accurate. The T suffix for verbal-not-testable is an established convention
associated with the Teasdale & Jennett scale. The example "9T = E4 + M5" is arithmetically
correct (4 + 5 = 9, verbal slot excluded). "Verbal not assessed" is correctly distinguished
from "verbal = 1" (no response).

**Claim: Sedation/metabolic/postictal confounders**

"Sedation, metabolic encephalopathy, and postictal state can suppress GCS independent of
structural injury and must be considered before assigning prognostic weight to a single score."

"Can suppress" is appropriately hedged. "Must be considered" is a strong but clinically
appropriate imperative for a tool used in neurological emergencies. No certainty upgrade.
No fabricated claim — this is well-established clinical teaching.

Five never-drift categories: no violations on any claim in Surface 4. Attribution precision
issue on airway threshold → approve-with-conditions.

### Surface 5 — Synthesis check (Surfaces 1–4, dual citation)

**Confirmed.**

Claims citing both Teasdale & Jennett 1974 and ACRM 1993 do not create a synthesis
conflict. The two sources address complementary aspects: Teasdale & Jennett 1974 defined
the scale; ACRM 1993 operationalized severity thresholds for TBI classification. They do
not contradict each other on recommendation strength, population, or time window. The
synthesis rule (§`clinical-reviewer.md`) is satisfied: all sources agree on the relevant
dimensions, and no qualifier present in either source is omitted.

The ICH Score cross-reference (Hemphill et al. 2001) is drawn from a third, independent
source describing a different clinical tool. It does not conflict with either primary GCS
source and is used only to illustrate the prognostic significance of the GCS 3–4 sub-band.
No synthesis conflict.

---

## Citation accuracy

### Teasdale G, Jennett B. Lancet. 1974;2(7872):81–84.

All `GCS_CITATION` metadata fields checked against known bibliographic record:

| Field | Value in `gcsScoreData.ts` | Verification |
|---|---|---|
| Authors | `'Teasdale G, Jennett B'` | Correct |
| Title | `'Assessment of coma and impaired consciousness: a practical scale'` | Correct — full title restored in this rebuild |
| Journal | `'Lancet'` | Correct |
| Year | `1974` | Correct |
| Volume | `2` | Correct (Lancet vol. 2, 1974) |
| Issue | `7872` | Correct (issue 7872) |
| Pages | `'81–84'` | Correct |
| DOI | `'10.1016/S0140-6736(74)91639-0'` | Correct format for this paper |
| PMID | `'4136544'` | Correct |

No discrepancies. This is the first PR to include `pubmedId` — previously missing per ADR-001.

### ACRM 1993

No formal citation record exists in the repo for the ACRM 1993 definition. It is referenced
only in a code comment (`src/data/gcsScoreData.ts` line 7) and in interpretation text. The
ACRM 1993 definition (mild TBI: GCS 13–15 at presentation; moderate TBI: GCS 9–12) is
well-established and widely cited in the TBI literature. However, the absence of a formal
citation record means its `last_reviewed` cannot be tracked.

Required follow-up: add ACRM 1993 as a formal citation entry when Wave 5 infrastructure
is implemented.

### Hemphill JC et al. Stroke. 2001;32:891–897.

Referenced inline in `INTERPRETATION.high` explanation text. No formal citation record
exists in the repo. The ICH Score point values cited (GCS 3–4 = 2pts, GCS 5–12 = 1pt)
are accurate per the published paper.

Required follow-up: add Hemphill et al. 2001 as a formal citation entry when Wave 5
infrastructure is implemented.

---

## Freshness

Formal `last_reviewed` fields and the freshness matrix (§13.7) cannot be applied in Wave 5.
The data file carries the comment "Medical Scientist verified (2026-04-17)" at line 95 of
`gcsScoreData.ts`. This is accepted as the Wave 5 equivalent only for this PR.

Applicable freshness windows under §13.7, for planning when Wave 5 infrastructure lands:

| Citation | Source type | Default window |
|---|---|---|
| Teasdale & Jennett 1974 | Landmark trial (foundational) | 36 months |
| ACRM 1993 | Management / classification guideline | 6 months |
| Hemphill et al. 2001 (ICH Score) | Calculator formula (scoring structure) | 24 months |

The ACRM 1993 window is 6 months — when Wave 5 infrastructure is implemented, this citation
will immediately require a review cycle given the 1993 date. The medical-scientist should
confirm whether any subsequent TBI guideline (e.g., AAN, BTF) has superseded the ACRM 1993
thresholds before the formal registry entry is written.

---

## Rationale

The GCS Calculator rebuild is clinically sound. All five severity interpretation surfaces
accurately paraphrase their cited sources without drift in recommendation strength, action
verbs, qualifiers, certainty markers, or temporal constraints. The severity threshold
correction (`>= 14` → `>= 13`) is the most clinically significant change in this PR, and it
is correct per ACRM 1993 and established neurology consensus. The T suffix convention, ICH
Score cross-reference values, and sedation/confounders caveats are all accurately stated and
appropriately hedged. One attribution precision issue exists: the GCS ≤8 / airway threshold
parenthetical credits Teasdale & Jennett 1974 more specifically than the 1974 paper warrants,
though the clinical content is correct and the hedge "commonly used" prevents clinical force
distortion. This is a follow-up, not a block. The absence of formal citation infrastructure
(Wave 5) means this review operates without the safeguards of CLAIM_REGISTRY, `quoted_text`
verification, and automated freshness tracking — those gaps must be closed before the next
calculator rebuild ships clinical content.

---

## Required follow-ups

1. **Attribution precision — GCS ≤8 / airway threshold** (non-blocking, Class C-clinical):
   The parenthetical `(Teasdale & Jennett, Lancet 1974)` on the GCS ≤8 airway management
   claim should be updated to reflect that the ≤8 threshold emerged from clinical application
   rather than being specified in the 1974 paper itself. Suggested revision: add a secondary
   citation (e.g., an airway management guideline or authoritative neurocritical care source)
   or reframe as "GCS ≤8 is the threshold commonly used in clinical practice to define coma
   and guide airway management decisions." Medical-scientist to confirm appropriate sourcing.

2. **ACRM 1993 formal citation entry** (blocked on Wave 5 infrastructure):
   Add ACRM 1993 mild TBI definition as a formal citation in `src/lib/citations/registry.ts`
   when the registry is created. Confirm against current TBI classification guidelines (BTF,
   AAN) that the 13–15 mild / 9–12 moderate thresholds remain current.

3. **Hemphill et al. 2001 formal citation entry** (blocked on Wave 5 infrastructure):
   Add as a formal citation in the registry. Verify full bibliographic record (journal, volume,
   pages, DOI, PMID) at that time.

4. **Wave 5 citation infrastructure** (blocking all subsequent -clinical PRs):
   `CLAIM_REGISTRY`, `src/lib/citations/registry.ts`, and the pre-commit scanner must be
   implemented before any subsequent calculator rebuild ships clinical content. Mandatory-block
   condition 4 (quoted_text check) cannot be satisfied without it.

5. **ACRM 1993 freshness window** (action on Wave 5 infrastructure implementation):
   6-month review window applies. Medical-scientist must confirm no subsequent TBI guideline
   has superseded the ACRM 1993 GCS severity thresholds before the formal citation entry is
   written and `last_reviewed` is set.
