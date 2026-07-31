# Clinical review — PFO guideline timeline (Phase 5)

**Decision (round 1):** block · **Reviewer:** clinical-reviewer, fresh context · **Date:** 2026-07-31
**Remediation:** all 5 blocks and all 6 conditions cleared before commit. Append-only.

## What it is
A timeline rendering how society positions on PFO moved from 2018 to 2025 across three
indications: antithrombotic choice after cryptogenic stroke, closure after cryptogenic
stroke, and closure for migraine. It renders on all three PFO question pages. The teaching
point is that one anatomical finding carries opposite recommendations by indication.

## What passed
The **design contract holds**: the component reads `quoted_text` from `CITATION_REGISTRY` at
render, so no verbatim guideline text is authored on this surface and a registry correction
propagates without a code change. The claim maps all six citations, the `notGraded` set was
verified correct against each document's actual grading, the VA/DoD entry was called "the
strongest on the surface", the fail-safe path is real, and the humanizer floor passes with no
scanner change needed.

## The block: five authored lines said more than their citations carry
The architecture was sound and the authored layer was not. The failure had a shape, and it is
the same shape this session has been correcting elsewhere.

**Twice I converted a negative search result into a positive fact.** Both governing packets
label these findings "not-located, not verified absent", and one carries a written instruction
to reword away from a count:
- *"and it has not moved since"* on the AAN entry. Now: "a 2022 to 2026 search located no
  later society guideline on the question" — a search result, stated as one.
- *"every society that has addressed it recommends against ... across three documents"* in the
  takeaway. This also counted two different sets in one sentence: of the three documents only
  one is a professional society, one is a government CPG and one is an ungraded expert
  consensus. Now names each by what it is.

**Once I asserted refutation using evidence not mapped to the claim.** *"the evidence it
rested on did not hold up"* on the BMJ entry. The decay data that would support it is
registered in this repo but deliberately not mapped here. Reworded to what the mapped set
carries, with the boundary recorded in the claim description.

**Once I flattened a conditional recommendation into a blanket prohibition.** The takeaway
said *"for migraine, every society recommends against"*. Two of the three documents are scoped
to **routine** or **first-line** use, and SCAI carries an explicit carve-out for a patient with
debilitating refractory migraine who chooses closure after shared decision-making. That
flattening sat in the box labelled "What to carry away", the least-anchored and most-read
string on the surface, with no quote beside it to correct it. Scope and carve-out restored.

**Once I attributed a device to the wrong manufacturer**, contradicting a sentence rendering
two cards above on the same page: MIST used a different manufacturer's device from PRIMA and
PREMIUM. Now says "the device used in PRIMA and PREMIUM".

## Conditions, all applied
- **The AHA/ASA entry lost its gates.** "18 to 60" had become "younger", "nonlacunar" was
  dropped, and **the patient had been removed from a shared-decision recommendation**, turning
  it into an inter-specialty decision. All three restored.
- **The stance taxonomy overstated AHA/ASA 2021.** Bucketing it `for` rendered a green
  "Recommends" chip over a recommendation that the decision be made *jointly* — a recommendation
  about process, not about closing anything. Added a `shared-decision` stance and a `strength`
  field carrying each document's own words, so a weak non-society recommendation and a graded
  society one can no longer render identically.
- **Indication leakage lived in the layout.** The coloured chip was the most salient element
  while the indication rendered beneath it in the lowest-contrast text on the component. On a
  surface built to keep indications apart, that was backwards. Indication now renders first at
  readable contrast, and every chip label carries a verb and an object.
- **The empty-quote path.** `quoted_text` is optional in the schema, so a citation could
  resolve, render an empty blockquote, and leave the authored gloss standing with nothing
  governing it. The filter now requires the quote, not just the citation.
- **The intro said "the two indications".** There are three.
- **The claim description asserted an age band the surface did not render.** Reconciled.

## Verified in the built HTML
All five blocking strings absent; all eleven corrections present, including the restored age
band, "nonlacunar", the patient in the joint decision, the SCAI carve-out, the routine-use
scope, the correct device attribution, the honest not-located statement, the shared-decision
chip and the per-document strength.
