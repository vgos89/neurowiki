I have all the information needed. Here is the evidence packet.

---

# Evidence Packet — ICHD-3 §1.4.1 Status migrainosus

**Packet type:** Diagnostic-criteria encoding (Class E, headache engine). Not a clinical trial. Sections 5–8 of the standard trial-packet template are adapted to a criteria-set source; trial-only sub-items (statistical framework, primary result, NNT, editorial/letters/guideline-class synthesis) are marked non-applicable with explicit provenance rather than silently omitted.

---

## 1. Canonical citation

- **Title:** *Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition.*
- **Section cited:** §1.4 Complications of migraine → **§1.4.1 Status migrainosus**
- **Journal:** *Cephalalgia* 2018; **38(1): 1–211** (page header on the source pages reads "Cephalalgia 38(1)").
- **Publisher / copyright:** © International Headache Society 2018 (footer on every page).
- **DOI (article):** 10.1177/0333102417738202 — *resolved indirectly:* the official ICHD-3 2018 PDF (below) is the verbatim published text; the Cephalalgia DOI is the journal home for the same content. The DOI was **not** re-fetched this session (the PDF is authoritative and self-contained); confidence rests on the PDF, not the DOI landing page.
- **Source PDF (authoritative for this packet):** https://ichd-3.org/wp-content/uploads/2018/01/The-International-Classification-of-Headache-Disorders-3rd-Edition-2018.pdf — resolved and read (see §2).
- **PMID / NCT:** Not applicable — this is a classification/criteria document, not a registered trial.

---

## 2. Source resolution

- **Did the PDF resolve?** Yes. WebFetch could not parse the compressed PDF text streams inline, but it downloaded the binary (1022.7 KB) to disk. I then read it directly page-by-page.
- **Pages read verbatim:** **Printed pp. 24–25** (the PDF page indices equal the printed page numbers; confirmed by reading pp. 27–29 and matching printed↔index). §1.4.1 spans the bottom of **p. 24** (Description, criteria A and start of B) and the top of **p. 25** (rest of B, C, D, Notes 1–2, Comment).
- **Cross-check against in-repo reference** `docs/2026_07_01/ichd3-criteria-verified-reference.md` (§1.4.1, lines 166–173 and 387–400): the transcribed criteria match the PDF **exactly** — same A/B/C(1,2)/D structure, same "unremitting for >72 hours," same "debilitating," same Note 1 (12-hour remission) and Note 2 (→ 1.5.1), same MOH Comment. The in-repo file attributes the criteria to pp. 24–25, which the PDF confirms.
- **Sub-forms:** **None.** §1.4.1 Status migrainosus has no sub-forms (no classical/idiopathic/secondary split, no painful/painless split — that structure belongs to §13 cranial neuralgias such as trigeminal neuralgia, not to migraine complications). §1.4 as a whole has siblings (1.4.2 Persistent aura without infarction, 1.4.3 Migrainous infarction, 1.4.4 Migraine aura-triggered seizure), but 1.4.1 itself is atomic.

---

## 3. Verbatim criteria — §1.4.1 Status migrainosus

Quoted exactly from the source PDF. Page number noted per element.

**1.4.1 Status migrainosus** *(p. 24)*

> **Description:** A debilitating migraine attack lasting for more than 72 hours. *(p. 24)*

> **Diagnostic criteria:** *(p. 24)*
>
> **A.** A headache attack fulfilling criteria B and C *(p. 24)*
> **B.** Occurring in a patient with 1.1 *Migraine without aura* and/or 1.2 *Migraine with aura*, and typical of previous attacks except for its duration and severity *(criterion begins p. 24, continues p. 25)*
> **C.** Both of the following characteristics: *(p. 25)*
>  1. unremitting for >72 hours¹ *(p. 25)*
>  2. pain and/or associated symptoms are debilitating² *(p. 25)*
> **D.** Not better accounted for by another ICHD-3 diagnosis. *(p. 25)*

> **Notes:** *(p. 25)*
>
> 1. Remissions of up to 12 hours due to medication or sleep are accepted. *(p. 25)*
> 2. Milder cases, not meeting criterion C2, are coded 1.5.1 *Probable migraine without aura*. *(p. 25)*

> **Comment:** Headache with the features of 1.4.1 *Status migrainosus* may often be caused by medication overuse. When headache in these circumstances meets the criteria for 8.2 *Medication-overuse headache*, code for this disorder and the relevant type or subtype of migraine but not for 1.4.1 *Status migrainosus*. When overuse of medication is of shorter duration than three months, code for the appropriate migraine type or subtype(s) only. *(p. 25)*

Superscript ¹ on "unremitting for >72 hours" ties criterion C.1 to Note 1 (12-hour remission allowance). Superscript ² on "debilitating" ties C.2 to Note 2 (milder cases → 1.5.1).

---

## 4. Population / scope of applicability

Not a trial population. Generalizability notes for the NeuroWiki bedside audience (neurology residents/fellows/attendings):

- **Substrate requirement (criterion B):** the diagnosis is *only* applicable to a patient with an established 1.1/1.2 migraine diagnosis. It is a **complication code**, not a primary presentation. A first-ever >72 h headache in a patient with no migraine history is NOT status migrainosus — it mandates a secondary workup.
- **§1.4 parent Comment (p. 24):** "Code separately for both the migraine type, subtype or subform and for the complication." Status migrainosus is coded *in addition to* the underlying migraine type.
- **MOH interaction (Comment, p. 25):** status migrainosus frequently coexists with medication-overuse headache; when 8.2 MOH criteria are met, code 8.2 + migraine type, **not** 1.4.1. This is an exclusion/precedence rule the engine must surface as a teach-pearl.

---

## 5. "Statistical framework" — Not applicable

This is a categorical diagnostic-criteria set (boolean A–D logic), not a hypothesis-testing study. No design type from the allowed list applies. No point estimate, CI, p-value, posterior, or NI margin exists. **NNT is not applicable** and must not be computed for this entry.

---

## 6. "Primary result" — Not applicable

No effect estimate. The "result" is the criteria set itself, transcribed verbatim in §3.

---

## 7. Key safety / red-flag results

No safety statistics. Clinically relevant red-flag content for the engine:

- Status migrainosus is a **diagnosis that presupposes a benign migraine substrate**; it is not itself a red-flag entity. However, a >72 h "worst headache" in a patient **without** established migraine, or with any SNNOOP10 feature, should route to secondary workup — this is handled by the existing `RED_FLAG_CHIPS` set (§9), not by adding a new red flag to this phenotype.
- **No imaging/referral red-flag** is intrinsic to §1.4.1 (contrast: secondary trigeminal neuralgia → MRI, which the user's prompt raised as a comparator pattern — that pattern does **not** apply here).

---

## 8. Expert and editorial caveats

This entry is a **classification-criteria transcription**, not a new clinical trial. The trial-specific sub-items 8a–8d are addressed with explicit applicability statements (per the block condition: non-applicability must be stated, not silently skipped):

- **8a. Accompanying editorial:** Not applicable. ICHD-3 (Cephalalgia 2018;38(1)) is a consensus classification document authored by the IHS Headache Classification Committee, not a trial with a paired editorial. No editorial adjudicates a criteria set. **Searched:** confirmed the source is the classification document itself (p. 1–211, single-authored-by-committee). No paired commentary is expected or required.
- **8b. Post-publication letters / replies:** Not applicable in the trial sense. ICHD-3 criteria are revised through formal beta→final consensus (ICHD-3 beta 2013 → ICHD-3 2018), not through letters-to-the-editor. The §1.4.1 criteria were **stable and unchanged** from ICHD-3 beta (2013) to ICHD-3 final (2018) — no material critique altered them.
- **8c. Guideline incorporation:** ICHD-3 **is** the governing classification standard; it is the source that downstream guidelines (AHA/ASA, AAN/AHS, EHF) cite, not a trial they grade. No class/level is assigned to a diagnostic definition. The AHS 2021 Consensus Statement and AAN/AHS practice guidance use ICHD-3 §1.4.1 as the reference definition of status migrainosus for treatment recommendations.
- **8d. Subsequent meta-analyses / contradicting evidence:** Not applicable. There is no RCT or IPD meta-analysis that "refutes" a diagnostic definition. ICHD-3 remains the current edition (no ICHD-4 as of this packet's date). The definition is not contradicted by newer evidence; it is the definitional baseline.

No block on §8 grounds: every sub-item carries an explicit applicability statement with provenance, not a silent omission.

---

## 9. NeuroWiki field mapping — engine chip / criterion encoding

**Target file:** `src/data/clinicHeadacheData.ts`. This is a **new `Phenotype` object** (`PhenotypeId: 'status-migrainosus'`, `ichd3Section: 'ICHD-3 §1.4.1'`) plus **one new `ChipId`**.

### 9a. FLAT vs subtype-hierarchy determination

**FLAT additive phenotype — Class E, no structural change.** §1.4.1 is atomic (no sub-forms, §2). It encodes as a single new `Phenotype` in the existing `Phenotype[]` array using the existing `Criterion` / `CriterionRole` machinery. It does **not** require the subtype-hierarchy layer. The one structural touch is adding a single member to the `ChipId` union type (the `debilitating` severity qualifier), which every new phenotype that needs a novel feature does; this is additive, not a schema change.

### 9b. Existing chips reusable

| Chip (existing) | Maps to criterion | Notes |
|---|---|---|
| `dur-gt-72-hours` (`clinicHeadacheData.ts:34`, label "Attacks >72 hours", line 261) | **C.1** — "unremitting for >72 hours" | Currently wired **only** to `ctth-B` (line 633). Reuse here; do not rewire ctth-B. |
| `migraine-history-established` (`clinicHeadacheData.ts:61`) | **B** — established 1.1/1.2 migraine substrate | Already used as vm-B suppress-gate (line 760). Reuse as the substrate gate for criterion B. |

### 9c. NEW chip needed

| Proposed chip id | Proposed label | Maps to criterion |
|---|---|---|
| `sev-debilitating` | "Pain/symptoms are debilitating (unable to function)" | **C.2** — "pain and/or associated symptoms are debilitating" |

Rationale: no existing severity chip expresses ICHD-3 C.2's "debilitating" threshold. `sev-severe` is the §1.1 pain-intensity level ("severe" on the 4-point scale) and is **not** interchangeable with §1.4.1's functional "debilitating" qualifier (C.2 covers pain *and/or associated symptoms*, i.e., a disability floor, not a pain-intensity floor). Encoding C.2 with `sev-severe` would misrepresent the criterion. Add the new chip. It is additive to the `ChipId` union (line 34–61 region).

### 9d. Proposed criteria + roles

Modeled on the chronic-migraine pattern (`cm-A/B/C`, lines 786–802) and vm-B (line 760):

| Criterion id | ICHD-3 | Proposed `role` | Contributing chip(s) | Rationale |
|---|---|---|---|---|
| `sm-B` | B (substrate) | `suppress-gate` | `migraine-history-established` | No established migraine history → not status migrainosus by definition (identical logic to vm-B). Positive-substrate gate; a first-ever >72 h headache must not surface here. |
| `sm-C1` | C.1 (>72 h) | `suppress-gate` | `dur-gt-72-hours` | Duration is definitional; §1.4.1 has no §X.5 Probable home for a duration miss, so a shortfall must hide, not demote. |
| `sm-C2` | C.2 (debilitating) | `demote-gate` | `sev-debilitating` | Note 2 gives an explicit Probable home: milder cases not meeting C2 → **1.5.1 Probable migraine without aura**. A C.2 miss should demote (cap at probable), not suppress — this is exactly what `demote-gate` is for (type doc lines 120–123). |

Criterion **A** ("a headache attack fulfilling B and C") is the ICHD-3 compositional wrapper and is represented implicitly by the conjunction of sm-B/sm-C1/sm-C2 (same convention the file uses for other §X.A wrappers). Criterion **D** ("not better accounted for by another ICHD-3 diagnosis") is the standard exclusion clause; it is enforced engine-wide by ranking/red-flags rather than as a standalone evaluable chip, consistent with how every other phenotype handles its "D" (e.g., no explicit `cm-D` evaluator exists).

### 9e. Gates, exclusions, red-flags, teach-pearl

- **`hiddenUntilTrial`-style gate:** **None.** Unlike hemicrania continua / paroxysmal hemicrania (indomethacin `indo-tried-complete`) or the ON nerve-block pattern the prompt cites, §1.4.1 has **no confirmatory-treatment-response criterion**. Do NOT add one. Note explicitly: analogous to "carbamazepine response is not a TN criterion," **triptan/analgesic response is not a status-migrainosus criterion** — it must not be encoded as a gate.
- **Exclusion / precedence criterion (from the Comment, p. 25):** MOH precedence. When 8.2 MOH criteria are met, code 8.2 + migraine type, **not** 1.4.1. There is no `rf-painkiller-overuse` linkage needed as a *criterion*, but the MOH precedence belongs in the phenotype's **`teachPearl`** so the clinician sees it. Proposed teachPearl content: >72 h debilitating attack in an established migraineur; ≤12 h remissions (medication/sleep) allowed; if MOH criteria met, code MOH + migraine type instead of 1.4.1; milder (non-debilitating) cases code as 1.5.1 Probable migraine without aura.
- **Red-flag:** None intrinsic to this phenotype (§7). No new member added to `RED_FLAG_CHIPS`.
- **`pitfalls` (proposed):** (1) Do not diagnose in a patient without established 1.1/1.2 migraine — that is a secondary-headache scenario. (2) A single continuous stretch is required; brief remissions >12 h break the count.

---

## 10. Verification confidence

**High.**

- Source PDF resolved and the verbatim criteria were read directly on printed pp. 24–25 (PDF page index = printed page number, cross-confirmed against pp. 27–29).
- Every lettered criterion, both sub-items, both Notes, and the Comment are transcribed exactly and match character-for-character against the independent in-repo reference (`docs/2026_07_01/ichd3-criteria-verified-reference.md`, two separate transcriptions at lines 166–173 and 387–400).
- Engine structure (`ChipId` union, `Chip`/`Criterion`/`Phenotype`/`CriterionRole` types, `dur-gt-72-hours`, `migraine-history-established`, red-flag set, and analog phenotypes cm-*/vm-*/hc-*) read directly from `src/data/clinicHeadacheData.ts`; chip-mapping recommendations are grounded in actual existing chips and roles.
- One residual: the Cephalalgia article DOI landing page (10.1177/0333102417738202) was not independently re-fetched this session — confidence rests entirely on the authoritative ICHD-3 PDF, which is the published verbatim text and is the correct primary source per the task instruction. This does not lower the criteria-transcription confidence.

---

## 11. Copyright / attribution note

- **Copyright holder:** © International Headache Society 2018 (footer on every source page, including pp. 24–25).
- **Educational-use grant:** ICHD-3 is made freely available by the IHS for **non-commercial educational and clinical use**. NeuroWiki's use (bedside decision-support / resident education) falls within this grant. The IHS explicitly prohibits use in commercial products/derivatives without a license and prohibits translation/reproduction that misrepresents the criteria.
- **Required attribution (must appear on the surface that displays these criteria):** *"Headache Classification Committee of the International Headache Society (IHS). The International Classification of Headache Disorders, 3rd edition. Cephalalgia. 2018;38(1):1–211. © International Headache Society 2018. Reproduced for educational use."* — with a link to https://ichd-3.org.
- Verbatim criteria text should be presented as a quotation (as in §3), not paraphrased into the product's own voice, to preserve the criteria's integrity and satisfy the attribution grant.

---

## Downstream routing

- **`medical-scientist`** may author the `status-migrainosus` phenotype clinical copy / teachPearl from this packet.
- **`clinical-reviewer`** gate: this packet satisfies the evidence-verifier prerequisite for the Class E encoding. The encoding is **FLAT / additive** (no subtype-hierarchy, no structural refactor); the sole type-level change is the additive `sev-debilitating` `ChipId` union member. No block conditions are triggered.

**Relevant file paths (absolute):**
- Source PDF: `/Users/vaibhav/.claude/projects/-Users-vaibhav-Documents-NeuroWiki-Cursor-Neurowiki-neurowiki--claude-worktrees-vibrant-dewdney-4f0ed7/2eefee8c-e51f-4488-b574-6186fb6f76a0/tool-results/webfetch-1783339828499-6u3jhv.pdf` (§1.4.1 on printed pp. 24–25)
- In-repo cross-check: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/2026_07_01/ichd3-criteria-verified-reference.md` (lines 166–173, 387–400)
- Engine target: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/clinicHeadacheData.ts` (`ChipId` line 34/61; `dur-gt-72-hours` line 261; `migraine-history-established` line 346/760; analog phenotypes cm-* lines 786–802, vm-* lines 754–768)

Note: this packet is returned as text only; no file was written (per instruction). If a persisted packet is wanted, the canonical path would be `docs/evidence-packets/2026-07-06-ichd3-status-migrainosus.md`.