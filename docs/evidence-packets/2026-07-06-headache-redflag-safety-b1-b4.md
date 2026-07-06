All mappings verified. I now have everything needed to produce both deliverables. Here is the evidence + design packet.

---

# EVIDENCE + DESIGN PACKET — Track B red-flag fixes (headache engine)

**Date:** 2026-07-06
**Scope:** B-1 (`rf-positional` split) and B-4 (red-flag → suspect → first-test naming) for the Clinic Headache Pathway.
**Source file for downstream Class E edits:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/clinicHeadacheData.ts` (chip union L64–79, chip labels L367–381, `RED_FLAG_CHIPS` set L415–420). Question flow: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/headacheQuestions.ts`. Runner-up conflict: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/headacheConflict.ts`.
**Primary citation (already registered):** `do-snnoop10-2019` — Do TP, Remmers A, Schytz HW, et al. *Red and orange flags for secondary headaches in clinical practice: SNNOOP10 list.* Neurology 2019;92:134–144. PMID 30587518, DOI 10.1212/WNL.0000000000006697. Registry entry present at `src/lib/citations/registry.ts:1388` with full verbatim `quoted_text`; `last_reviewed: 2026-05-25`, 24-month window (in-window through 2028-05).

**Verification confidence: HIGH** for the clinical direction of both deliverables (SIH mechanism, raised-ICP mechanism, and all six red-flag → suspect → test mappings independently confirmed against sources below). **One MEDIUM/BLOCKING-CAVEAT flag** on the `rf-older-age-onset` age threshold (see §B-4 flag) — this is a pre-existing source-fidelity issue, not created by this task, but it sits in the blast radius and must be surfaced to clinical-reviewer.

---

## B-1 — `rf-positional` split

### The problem, confirmed
The current single chip `rf-positional` (label: *"Positional headache (worse standing or supine)"*, L373) conflates two **opposite** pathophysiologies under one short-circuit. SNNOOP10 itself lists "Positional headache" as a single flag (the source does not sub-split it), but the underlying secondary causes are mechanistically opposite, so a single chip cannot carry a correct suspect+test. Verified:

- **Worse UPRIGHT, relieved lying flat → spontaneous intracranial HYPOtension (SIH, low-pressure / CSF leak).** Orthostatic headache is defined as onset within 15 min of being upright and relief within 30 min of recumbency; SIH is caused by spinal CSF leak; **first investigation is MRI brain with and without gadolinium** (diffuse pachymeningeal enhancement, brain sag). Source: StatPearls, *Spontaneous Intracranial Hypotension* (NCBI Bookshelf NBK559066); AJNR review (ajnr.org A6637). [1][2]
- **Worse RECUMBENT / worse on waking / worse with Valsalva → RAISED intracranial pressure** (mass lesion, IIH, CVST). Raised-ICP headache is aggravated by lying supine and by Valsalva, worse in the early morning/on waking, and may carry visual obscurations and pulsatile tinnitus; **first investigation is MRI brain (with MRV when venous cause suspected)**. Source: EmergencyMedicineCases Ep181 (CVT/IIH/GCA); UHB raised-ICP pathway. [3][4]

Note on overlap with the existing `rf-valsalva` chip (L374, *"Precipitated by Valsalva (cough, sneeze, exercise)"*): Valsalva-worsening is a raised-ICP / posterior-fossa (Chiari) signal and is **already a separate SNNOOP10 "P" flag** ("Precipitated by sneezing, coughing, or exercise"). The recumbent-worse chip below should be understood as the *postural* component of the raised-ICP picture; `rf-valsalva` remains its own flag and is **not** merged here.

### Proposed exact chip split

Replace the single `rf-positional` with **two** chips:

| New chip id | Label | Must-not-miss suspect(s) | First investigation |
|---|---|---|---|
| `rf-positional-upright` | `Headache worse upright, relieved lying flat (orthostatic)` | Spontaneous intracranial hypotension (SIH) / CSF leak | **MRI brain with and without gadolinium** (± spinal imaging / CT myelography or spine MRI to localise the leak) |
| `rf-positional-recumbent` | `Headache worse lying down, worse on waking, or worse with Valsalva` | Raised intracranial pressure — mass lesion, IIH, or CVST | **MRI brain**; add **MRV** if venous sinus thrombosis is suspected (papilloedema / pulsatile tinnitus) |

Suggested `teachWhenSelected` (optional, if the chip carries teach text — keep neutral, no "diagnosis"):
- `rf-positional-upright`: *"Upright-worse / recumbent-relief points to low CSF pressure (SIH). Contrast-enhanced brain MRI is the first study."*
- `rf-positional-recumbent`: *"Recumbent-worse, morning-worse, or Valsalva-worse points to raised ICP. Image (MRI ± MRV) before LP."*

### Engine routing — what changes

1. **`ChipId` union (L64–79):** remove `'rf-positional'`; add `'rf-positional-upright'` and `'rf-positional-recumbent'`.
2. **Red-flags chip group (L373):** replace the one `{ id: 'rf-positional', ... }` entry with the two entries above.
3. **`RED_FLAG_CHIPS` set (L415–420):** remove `'rf-positional'`; add both new ids. Behavior of `anyRedFlagActive()` is preserved — either new chip still trips the same secondary-workup short-circuit (Frame 1). **No change to the short-circuit logic itself**; this is a 1→2 fan-out within the existing red-flag set.
4. **Question flow (`headacheQuestions.ts`):** `rf-positional` is **not currently referenced** by any `AnswerOption.chips` in `CORE_QUESTIONS` or `CONDITIONAL_BRANCHES` (red flags are owned by the page state machine's Frame-1 short-circuit, per the file header L20–21, not the question config). So **no `headacheQuestions.ts` edit is required** for the split unless a red-flag question screen is later added — flag for the implementer to confirm the page-level red-flag picker renders from the chip group, not a hard-coded list.
5. **`headacheConflict.ts`:** no change — it operates on phenotype criteria, not red-flag chips.
6. **Tests:** `clinicHeadacheData.test.ts` and any drift-guard test that enumerates `RED_FLAG_CHIPS` or the chip union will need the two new ids; a test asserting `RED_FLAG_CHIPS.size` must update the count (14→ +1 net = one more than current).

**Downstream behavior change (clinician-visible):** a patient selecting the upright-worse chip vs the recumbent-worse chip now triggers the same "secondary workup first" gate **but** the two carry different suspect+test interpretation text — the whole point of the split. No phenotype match changes.

---

## B-4 — red-flag → suspect → first-test naming (interpretation text; no logic change)

Per-flag mapping below. Each row is verified against the cited source. This is **interpretation-text only** — it populates a suspect+test string per red flag; it does **not** change `anyRedFlagActive` or any phenotype evaluator. All 15 current SNNOOP10 chips are covered (the two positional rows assume the B-1 split lands; if B-1 is deferred, `rf-positional` keeps a combined-but-flagged row, see note).

| Engine chip (id) | Current label | Named must-not-miss suspect(s) | First investigation (proposed wording) | Source |
|---|---|---|---|---|
| `rf-systemic` | Systemic features (fever, weight loss) | Meningitis / encephalitis; also systemic malignancy, GCA | Fever + neck stiffness → **LP** (CT head first if immunocompromised, focal deficit, new seizure, or GCS <10 before LP); weight loss → imaging + malignancy work-up | IDSA/ESCMID pre-LP imaging criteria [7]; SNNOOP10 [5] |
| `rf-neoplasm` | History of neoplasm | Brain metastasis / CNS involvement of known cancer | **MRI brain with contrast** | SNNOOP10 [5] |
| `rf-neuro-deficit` | Focal neurologic deficit, altered mental status, or seizure | Stroke, mass lesion, encephalitis, other structural CNS lesion | **Neuroimaging (CT then MRI as indicated)**; LP after imaging if infection suspected | SNNOOP10 [5] |
| `rf-onset-sudden` | Sudden or thunderclap onset | **SAH**; **RCVS**; also CVST, cervical-artery dissection | **Non-contrast CT head** (negative within 6 h essentially excludes SAH); if CT non-diagnostic → **LP** or **CTA**; **CTA reasonable to add** given RCVS/dissection/CVST | Thunderclap HA reviews [6]; SNNOOP10 [5] |
| `rf-older-age-onset` | New headache onset after age 50 | **Giant cell arteritis (GCA)**; also mass lesion | New HA age >50 **+ jaw claudication / scalp tenderness / visual symptoms** → **ESR + CRP (± CBC)**, then **temporal artery biopsy** (gold standard; do not delay steroids for biopsy if vision threatened); consider temporal-artery ultrasound | GCA reviews [8]; SNNOOP10 [5] — **see age flag below** |
| `rf-pattern-change` | Recent pattern change or new headache type | Any new secondary cause (mass, vascular, inflammatory) | **MRI brain**; tailor further work-up to associated features | SNNOOP10 [5] |
| `rf-positional-upright` *(post-split)* | Headache worse upright, relieved lying flat | **Spontaneous intracranial hypotension (SIH) / CSF leak** | **MRI brain with and without gadolinium** (± spine imaging / CT myelography to localise leak) | SIH reviews [1][2] |
| `rf-positional-recumbent` *(post-split)* | Headache worse lying down / on waking / with Valsalva | **Raised ICP** — mass lesion, **IIH**, **CVST** | **MRI brain**; add **MRV** if papilloedema / pulsatile tinnitus | Raised-ICP / CVST reviews [3][4] |
| `rf-valsalva` | Precipitated by Valsalva (cough, sneeze, exercise) | Posterior-fossa / **Chiari malformation**; raised ICP | **MRI brain** (include craniocervical junction) | SNNOOP10 [5]; raised-ICP review [3] |
| `rf-papilloedema` | Papilloedema on exam | **Raised ICP** — mass lesion, **IIH**, **CVST** | **MRI brain + MRV**; LP for opening pressure **after** imaging excludes mass/venous occlusion | CVST/IIH reviews [3][4]; SNNOOP10 [5] |
| `rf-progressive` | Progressive or atypical course | Mass lesion / structural progressive pathology | **MRI brain with contrast** | SNNOOP10 [5] |
| `rf-pregnancy` | Pregnancy or puerperium | **CVST**; pre-eclampsia/PRES; pituitary apoplexy | **MRI brain + MRV** (avoid gadolinium in pregnancy where possible); BP + pre-eclampsia work-up | SNNOOP10 [5]; CVST review [4] |
| `rf-painful-eye-autonomic` | Painful eye with autonomic features | Acute **angle-closure glaucoma**; **carotid/cavernous** pathology, dissection | Ophthalmology / **intraocular pressure**; vascular imaging (CTA/MRA) if dissection/cavernous suspected | SNNOOP10 [5] |
| `rf-posttraumatic` | Posttraumatic onset | Intracranial haemorrhage (**subdural / epidural**), traumatic dissection | **Non-contrast CT head**; vascular imaging if dissection suspected | SNNOOP10 [5] |
| `rf-immune-pathology` | Immune-system pathology (HIV, immunosuppression) | Opportunistic CNS infection (cryptococcal / toxoplasma), CNS lymphoma | **MRI brain with contrast, then LP** (imaging before LP is mandatory in the immunocompromised per IDSA) | IDSA pre-LP criteria [7]; SNNOOP10 [5] |
| `rf-painkiller-overuse` | Painkiller overuse or new drug at onset | Medication-overuse headache; new-drug secondary headache | Medication history / withdrawal; imaging only if other red flags co-present | SNNOOP10 [5] |

### FLAG — source-fidelity issue on `rf-older-age-onset` (surface to clinical-reviewer; conservative)

The SNNOOP10 **original paper (Do 2019) defines older-age as "onset after 65 years"**, but our chip label (L371) and the registry `quoted_text` (`src/lib/citations/registry.ts:1398`) both say **"after age 50."** This is a **pre-existing discrepancy** between our registered claim and the primary source — not introduced by this task, but it lies in the B-4 blast radius, so I am obligated to raise it (§8 / block-condition on wording drift).

- The literature supports treating age as a continuum: varying cutoffs 40–65 have been proposed; ">50" is a reasonable *lowered-threshold* concern point (and is the correct threshold for **GCA**, whose classic epidemiologic gate is age ≥50), while **65** is the SNNOOP10 literal and confers ~10-fold higher risk. Source: García-Azorín et al. sensitivity study; JUCM SNNOOP10 review. [5][9]
- **Recommendation for clinical-reviewer:** either (a) keep "after age 50" but change the chip's registered rationale/`quoted_text` provenance so it no longer misattributes "50" to the SNNOOP10 verbatim (SNNOOP10 says 65; the ">50" threshold should be sourced to GCA epidemiology / continuous-risk literature, not to Do 2019's literal list), or (b) reconcile the label to "65" to match SNNOOP10 and carry GCA's ">50" separately in the suspect+test text. **Do not silently ship the B-4 text over an un-reconciled label.** This is a Medium-confidence item pending V/clinical-reviewer decision on which threshold the product intends.

### Note if B-1 is deferred
If the split does not land, `rf-positional` keeps a **single combined row** that must state BOTH opposite suspects explicitly and instruct the clinician to distinguish by posture direction: *"Positional headache — if worse UPRIGHT/relieved flat → suspect SIH (MRI brain WITH contrast); if worse RECUMBENT/on waking/Valsalva → suspect raised ICP: mass, IIH, or CVST (MRI ± MRV)."* Shipping a single undifferentiated "positional → do X" line is a **block** (it would give one test for two opposite mechanisms).

---

## Field mapping (§9) — what downstream Class E may safely touch, per this packet

- `src/data/clinicHeadacheData.ts` — `ChipId` union (L64–79): remove `rf-positional`, add `rf-positional-upright`, `rf-positional-recumbent`.
- `src/data/clinicHeadacheData.ts` — red-flags `ChipGroup.chips` (L367–382): replace the `rf-positional` entry with the two new entries + labels above.
- `src/data/clinicHeadacheData.ts` — `RED_FLAG_CHIPS` set (L415–420): swap the one id for the two new ids.
- Red-flag interpretation surface (the suspect+test text — location TBD by implementer; it is a **claim surface** per `.claude/rules/clinical-surfaces.md` and needs a `claimId` per flag): populate the 16 rows in the B-4 table.
- `src/lib/citations/registry.ts` — `do-snnoop10-2019` (L1388): **do not restamp `last_reviewed` unless the §13.6 six-point checklist is run**; the age-threshold provenance issue (above) touches this entry's `quoted_text` and must be resolved as part of any refresh.

## Caveats block (§8) — applicability to a red-flag framework packet
This is a red-flag *framework* deliverable, not a single-trial entry, so the trial-specific sub-items are addressed as follows (explicit, not skipped):
- **8a Editorial:** SNNOOP10 (Do 2019, Neurology) is a review/consensus expansion of SNOOP4, not an RCT with a paired editorial; no accompanying editorial applies. **Not applicable — stated, not skipped.**
- **8b Letters/replies:** the framework's real-world sensitivity was subsequently tested by García-Azorín et al., *Cephalalgia* 2022 (sensitivity of the SNNOOP10 list in high-risk secondary-headache detection) — high sensitivity for the dangerous causes, supporting continued use as a screen. [9]
- **8c Guideline incorporation:** SNNOOP10 is AHS-adjacent and widely reproduced in headache education (e.g., JUCM review [5]); it is a screening mnemonic, not a graded guideline recommendation, so no class/level is assigned. The per-flag first-tests here align with SAH (thunderclap CT-then-LP/CTA [6]), CVST (MRI+MRV [4]), IDSA pre-LP imaging in the immunocompromised [7], and GCA (ESR/CRP + TAB [8]) standards.
- **8d Subsequent/contradicting evidence:** the SIH orthostatic-mechanism, raised-ICP recumbent-mechanism, and all six first-test mappings are corroborated by the current reviews cited; no contradicting evidence found that changes the bedside interpretation.

## Sources
- [1] [Spontaneous Intracranial Hypotension — StatPearls (NCBI Bookshelf NBK559066)](https://www.ncbi.nlm.nih.gov/books/NBK559066/)
- [2] [Spontaneous Intracranial Hypotension: Atypical Radiologic Appearances — AJNR](https://www.ajnr.org/content/early/2020/07/09/ajnr.A6637)
- [3] [Ep181 CVT, IIH, GCA and Peripartum Headaches — EmergencyMedicineCases](https://emergencymedicinecases.com/cvt-iih-gca-peripartum-headache/)
- [4] [Role of MR Venography in Cerebral Vein/Sinus Occlusion — PMC12185255](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12185255/)
- [5] [More than a Simple Headache: Using the SNNOOP10 Criteria — Journal of Urgent Care Medicine](https://www.jucm.com/more-than-a-simple-headache-using-the-snnoop10-criteria-to-screen-for-life-threatening-headache-presentations/) and the primary paper: [Do et al., Neurology 2019 (PMC6340385)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6340385/)
- [6] [Thunderclap Headache — StatPearls (NBK560629)](https://www.ncbi.nlm.nih.gov/books/NBK560629/); [Evaluating thunderclap headache — PubMed 33661161](https://pubmed.ncbi.nlm.nih.gov/33661161/)
- [7] [CT of the Head before LP in Adults with Suspected Meningitis — NEJM (Hasbun 2001) / IDSA criteria](https://www.nejm.org/doi/full/10.1056/NEJMoa010399)
- [8] [Giant Cell Arteritis (Temporal Arteritis) — StatPearls (NBK459376)](https://www.ncbi.nlm.nih.gov/books/NBK459376/)
- [9] [Sensitivity of the SNNOOP10 list in high-risk secondary headache detection — García-Azorín et al., Cephalalgia 2022](https://journals.sagepub.com/doi/10.1177/03331024221120249)

---

**Handoff:** This packet feeds Class E changes to `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/clinicHeadacheData.ts` and the red-flag interpretation-text surface, and gates through `clinical-reviewer`. **One item requires a V / clinical-reviewer decision before shipping:** the `rf-older-age-onset` "50 vs 65" threshold + `quoted_text` provenance (§B-4 flag) — Medium confidence until reconciled. Everything else is High confidence.