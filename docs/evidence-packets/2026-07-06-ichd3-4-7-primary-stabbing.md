I have everything I need. The PDF resolved, page 53 gives the verbatim §4.7 and §4.7.1 criteria, page 54 confirms §4.7.1 criterion D. The in-repo reference cross-checks (with a minor page-number annotation issue I'll flag). The chip mapping data is fully read. Here is the evidence packet.

---

# Evidence Packet — ICHD-3 §4.7 Primary stabbing headache

**Requested by:** Class E encoding into NeuroWiki Clinic Headache Pathway (`clinicHeadacheData.ts`)
**Prepared:** 2026-07-06 · **Slug:** `ichd3-4.7-primary-stabbing-headache`
**Suggested file (not written):** `docs/evidence-packets/2026-07-06-ichd3-4.7-primary-stabbing-headache.md`

Note on scope: this is a **diagnostic-criteria classification**, not a trial. Sections 1–4 below map to the standard packet's citation / population-equivalent / criteria / statistical framework, adapted to a classification source. There is no p-value, NNT, or trial statistics; the "statistical framework" slot is `n/a — classification, not RCT`. No NNT computed (correctly — none applicable).

---

## 1. Canonical citation

- **Title:** Headache Classification Committee of the International Headache Society (IHS). *The International Classification of Headache Disorders, 3rd edition* (ICHD-3).
- **Section:** 4.7 Primary stabbing headache; sub-form 4.7.1 Probable primary stabbing headache.
- **Journal/year:** *Cephalalgia* 2018;38(1):1–211.
- **DOI:** 10.1177/0333102417738202 (confirmed as the DOI embedded in the fetched PDF metadata).
- **PMID:** 29368949 (matches the in-repo registry entry `ichd3-2018`).
- **Copyright line printed on every page:** "© International Headache Society 2018".
- **Registry match:** already registered in `src/lib/citations/registry.ts` as `ichd3-2018` (title, year 2018, PMID 29368949 all consistent). Registry `section` field currently lists `1.1, 1.2, 1.3, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.10, A1.6.6` — **does not yet include 4.7**; adding 4.7 to that field is part of the field mapping below.

---

## 2. Population / scope of applicability

Not a trial population, but generalizability notes for the bedside classifier:

- **Diagnosis of exclusion in disguise:** §4.7 requires "the absence of organic disease of underlying structures or of the cranial nerves" (Description, p. 53). When stabs are **strictly localized to one area**, the text mandates excluding a structural lesion of the affected cranial nerve — a red-flag / imaging trigger (Comments, p. 53).
- **Comorbidity:** More common in people with 1. Migraine; in that group stabs localize to the site habitually affected by migraine (Comments, p. 53). This is a benign association, not a red flag.
- **Key discriminator:** absence of cranial autonomic symptoms differentiates §4.7 from **3.3 Short-lasting unilateral neuralgiform headache attacks (SUNCT/SUNA)** (Comments, p. 53). This is the pivotal exclusion for encoding.
- **Applicability to NeuroWiki audience (neurology residents at the bedside):** high. Short (≤ few seconds), spontaneous, autonomic-free stabs are a common bedside question; the diagnosis is clinical.

---

## 3. Verbatim criteria — every letter, sub-item, and note, with page numbers

### 4.7 Primary stabbing headache (p. 53)

> **Previously used terms:** Ice-pick pains; jabs and jolts; needle-in-the-eye syndrome; ophthalmodynia periodica; sharp short-lived head pain. *(p. 53)*

> **Description:** Transient and localized stabs of pain in the head that occur spontaneously in the absence of organic disease of underlying structures or of the cranial nerves. *(p. 53)*

**Diagnostic criteria (p. 53), verbatim:**

> **A.** Head pain occurring spontaneously as a single stab or series of stabs and fulfilling criteria B and C
> **B.** Each stab lasts for up to a few seconds¹
> **C.** Stabs recur with irregular frequency, from one to many per day²
> **D.** No cranial autonomic symptoms
> **E.** Not better accounted for by another ICHD-3 diagnosis.

**Notes (p. 53), verbatim:**

> **1.** Studies show 80% of stabs last three seconds or less; rarely, stabs last for 10–120 seconds.
> **2.** Attack frequency is generally low, with one or a few per day. In rare cases, stabs occur repetitively over days, and there has been one description of *status* lasting one week.

**Comments (p. 53), verbatim (relevant excerpts):**

> Field testing has confirmed the validity of these diagnostic criteria for 4.7 *Primary stabbing headache*. …
> 4.7 *Primary stabbing headache* involves extratrigeminal regions in 70% of cases. It may move from one area to another, in either the same or the opposite hemicranium: in only one-third of patients it has a fixed location. When stabs are strictly localized to one area, structural changes at this site and in the distribution of the affected cranial nerve must be excluded.
> A few patients have accompanying symptoms, but not including cranial autonomic symptoms. The latter help to differentiate 4.7 *Primary stabbing headache* from 3.3 *Short-lasting unilateral neuralgiform headache attacks*.
> 4.7 *Primary stabbing headache* is more commonly experienced by people with 1. *Migraine*, in which cases the stabs tend to be localized to the site habitually affected by migraine headaches.

### 4.7.1 Probable primary stabbing headache (p. 53–54)

**Diagnostic criteria (criteria A–C on p. 53; criterion D continues at top of p. 54), verbatim:**

> **A.** Head pain occurring spontaneously as a single stab or series of stabs
> **B.** Two only of the following:
>   1. each stab lasts for up to a few seconds
>   2. stabs recur with irregular frequency, from one to many per day
>   3. no cranial autonomic symptoms
> **C.** Not fulfilling ICHD-3 criteria for any other headache disorder
> **D.** Not better accounted for by another ICHD-3 diagnosis. *(criterion D at top of p. 54)*

**Sub-forms:** §4.7 has exactly **one** codable sub-form, §4.7.1 Probable. There is no painful/painless or classical/idiopathic/secondary split (those belong to 13.1 Trigeminal neuralgia, a different chapter). The "2-of-3" probable structure is the only variant.

---

## 4. Source resolution

- **Did the PDF resolve?** Yes. `WebFetch` could not decompress the stream text (returned an honest "cannot extract" message), but it **saved the binary PDF locally** (1022.7 KB) to the tool-results directory. I then read it directly via the PDF reader.
- **Pages read verbatim:** **p. 53** (full §4.7 criteria A–E, both Notes, Comments, and §4.7.1 criteria A–C) and **p. 54** (§4.7.1 criterion D at top of page). Surrounding pages 50–52 were also read to confirm section boundaries (§4.3–§4.6 precede; §4.8 Nummular follows on p. 54).
- **DOI/PMID of the source:** DOI 10.1177/0333102417738202; PMID 29368949. Both resolve to the same ICHD-3 2018 document.
- **Cross-check vs in-repo `docs/2026_07_01/ichd3-criteria-verified-reference.md`:** The two in-repo transcriptions of §4.7 (lines 179–188 and 911–926) are **substantively identical to the authoritative PDF** — criteria A–E, both Notes, and the 4.7.1 "two only of three" structure all match verbatim.
  - **One provenance discrepancy to flag (non-blocking):** the in-repo reference labels §4.7 as **"(p. 53)"** in one place but the summary table and other places are consistent with p. 53 — the PDF confirms **p. 53** is correct. However, the reference's own §4.7 note "Note 2: frequency generally low, one to a few per day" is a paraphrase of PDF Note 2; the PDF's fuller Note 2 (the `status` clause) should be used. Treat the **PDF as authoritative** per brief; the in-repo doc is accurate but abbreviates Note 2.
- **Confidence:** the criteria are directly read from the official PDF at page 53–54. No page failed to resolve.

---

## 5. Statistical framework

`n/a — diagnostic classification, not an RCT`. No superiority/NI/Bayesian design, no p-value, no effect estimate, no NNT. The "field testing has confirmed the validity" statement (Comments, p. 53) is a validation claim, not a trial statistic — do not render any efficacy bar, NNT, or CI for this entry.

---

## 6. Primary result

`n/a`. Classification criteria have no point estimate. The only quantitative facts are the epidemiologic descriptors inside the Notes/Comments, all quoted verbatim above: 80% of stabs ≤3 s; extratrigeminal in 70%; fixed location in one-third. These are **descriptive**, not outcome statistics — do not surface them as a "result."

---

## 7. Key safety results

`n/a` (no intervention). Clinical-safety-relevant caveats for the classifier:
- **Red-flag / imaging trigger:** strictly-localized stabs → exclude structural lesion of the affected cranial nerve (Comments, p. 53). This is the secondary-headache off-ramp.
- **No treatment claim to encode.** ICHD-3 does not state a treatment. (For downstream authoring only, not part of the criteria: indomethacin is the commonly cited responsive agent in the wider literature — but **that is NOT a §4.7 criterion** and must not be encoded as a diagnostic gate.)

---

## 8. Expert and editorial caveats

**8a. Accompanying editorial / perspective.** ICHD-3 is a consensus classification document published by the IHS Classification Committee, **not** a trial with a paired journal editorial. There is no NEJM/Lancet/JAMA-style accompanying editorial for an individual section. **Explicitly not applicable** (classification document, not a trial). The functional equivalent of "editorial context" is the section's own **Comments** field (quoted verbatim in §3 above), which is the committee's contextualization.

**8b. Post-publication letters and replies.** No trial-style letters-to-the-editor apply to a single ICHD-3 section. **Not applicable** in the letters-and-replies sense. The relevant post-publication scrutiny is the ICHD-3 field-testing literature; the document itself states "Field testing has confirmed the validity of these diagnostic criteria for 4.7 Primary stabbing headache" (Comments, p. 53). No methodological critique survives that would change the criteria as written.

**8c. Subsequent guideline incorporation.** ICHD-3 **is** the governing classification (the AAN, AHS, ESO, and IHS all reference ICHD-3 as the diagnostic standard for primary headache). §4.7 is not assigned a "Class/Level" the way an AHA/ASA treatment recommendation is — ICHD-3 criteria are the reference standard, not a graded recommendation. **Explicit statement:** no higher guideline supersedes ICHD-3 for the *definition* of primary stabbing headache; ICHD-4 is anticipated 2026–2027 (per the in-repo registry comment) and should trigger re-review of this entry on publication.

**8d. Subsequent meta-analyses / contradicting evidence.** No RCT or IPD meta-analysis redefines §4.7; primary stabbing headache is diagnosed by these criteria, not by trial evidence. No contradicting evidence changes the bedside interpretation of the criteria. The one nuance the committee itself flags (the SUNCT/SUNA discriminator via absence of autonomic features) is already captured in the Comments and is the single most important encoding decision. **No refuting evidence exists that would alter the criteria.**

All four sub-items are addressed with explicit applicability statements — none silently skipped.

---

## 9. NeuroWiki field mapping — `src/data/clinicHeadacheData.ts`

This maps against the existing `Phenotype` / `Criterion[]` / `ChipId` model I read in the source file. **This is a FLAT ADDITIVE phenotype (Class E, no structural change).** It uses the identical shape as §4.10 NDPH, §A1.6.6 VM, and the §3.x TACs already in the file. **No subtype-hierarchy layer is needed** — §4.7 has a single flat criteria list plus one Probable sub-form (§4.7.1), which the existing X.5-Probable "2-of-3 → demote" machinery already handles for other phenotypes. Do not add a new structural mechanism.

### 9a. EXISTING chips reusable (no new chip needed)

| Existing `ChipId` | Reused for §4.7 criterion | Note |
|---|---|---|
| `qual-sharp-stabbing` (line 281) | Criterion **A** (stabbing quality substrate) | Currently defined but **unmapped to any phenotype** — §4.7 is its natural home. |
| `sym-autonomic-ipsilateral` (line 303) | Criterion **D** (the exclusion — its *presence* fails D) | The SUNCT/SUNA discriminator. Encode D as a **suppress-gate that fails when this chip is selected**. |

### 9b. NEW chips needed

| Proposed `ChipId` | Proposed label | Maps to criterion |
|---|---|---|
| `onset-spontaneous-stab` | "Pain comes on spontaneously as a single stab or series of stabs" | Criterion **A** (paired with `qual-sharp-stabbing`) |
| `dur-stab-seconds` | "Each stab lasts up to a few seconds (usually ≤3 s)" | Criterion **B** — existing `dur-lt-15-min` is too coarse (per in-repo reference note, line 188); a dedicated seconds-scale chip is required. `teachWhenSelected`: quote Note 1 (80% ≤3 s; rarely 10–120 s). |
| `freq-stab-one-to-many-per-day` | "Stabs recur with irregular frequency, one to many per day" | Criterion **C** — `freq-ge-1-per-day` (a SUNCT/SUNA chip) semantically overlaps but has a different teaching context; a §4.7-specific chip avoids cross-wiring. If reviewer prefers reuse, `freq-ge-1-per-day` is a candidate, but a distinct chip is cleaner. |

New chips must be added to the `ChipId` union (lines 23–79) and to a chip group (the `pain-character` and `pattern` groups are the natural homes).

### 9c. Proposed criterion roles (using the file's `CriterionRole` model)

| Criterion | Role | Rationale (consistent with the file's existing conventions) |
|---|---|---|
| **A** (spontaneous stab/series, stabbing quality) | `suppress-gate` (DROP) | Substrate of the phenotype — no stab = not stabbing headache. Mirrors `aura-B`, `sunct-C` substrate-absence pattern. Also serves as the evidence floor. |
| **B** (each stab ≤ a few seconds) | `demote-gate` | §4.7.1 Probable explicitly permits missing exactly one of B/C/D ("two only of the following"). A single miss has a Probable home → demote, mirroring `mig-B` / `cluster-B`. |
| **C** (one-to-many per day, irregular) | `demote-gate` | Same — one of the "2-of-3" set with a §4.7.1 Probable home. |
| **D** (no cranial autonomic symptoms) | `suppress-gate` (EMIT) | **Exclusion criterion.** Presence of `sym-autonomic-ipsilateral` is positive evidence for a *different* phenotype (§3.3 SUNCT/SUNA), exactly the EMIT semantics used by `tth-D`/`ctth-D`/`cm-C`. Recommend adding `psh-D` to the `EMIT_CRITERION_IDS` set (line 896) so the result surfaces "considered and set aside — autonomic features present, see SUNCT/SUNA." **Reviewer decision point:** the in-repo reference (line 183) proposed D as a plain suppress-gate; EMIT is the richer, clinically-preferable choice given the SUNCT/SUNA steer, but either is defensible. Flag for clinical-reviewer. |
| **E** (not better accounted for) | not encoded as a chip | Consistent with the file's existing convention — the generic "not better accounted for" clause is not a chip in any current phenotype; it is the clinician's residual judgment. |

**Probable (§4.7.1) handling:** the existing "2-of-3 with a demote-gate miss → matchStrength 'probable'" machinery covers this. **However**, note that `PROBABLE_SECTION_FOR` (lines 879–889) has **no §4 Probable entries** (NDPH §4.10 has no Probable counterpart, so §4 was never added). §4.7.1 **does** exist as a real ICHD-3 Probable sub-form (unlike §4.10). Therefore, if the phenotype id is e.g. `primary-stabbing-headache`, a new map entry `'primary-stabbing-headache': 'ICHD-3 §4.7.1 Probable primary stabbing headache'` should be added so the "Probable" badge renders the correct §4.7.1 label. **This is the one place §4.7 differs from the NDPH precedent** — flag for the implementer.

### 9d. Gates, exclusions, red-flags

- **`hiddenUntilTrial`-style gate:** **None applies.** Unlike HC/PH (indomethacin-gated), §4.7 has **no confirmatory-test criterion**. Do **not** add an indomethacin gate — indomethacin response is a treatment observation, **not** an ICHD-3 §4.7 criterion (directly analogous to the brief's carbamazepine-for-TN caution). Encoding it as a gate would be a fabricated criterion.
- **Exclusion criterion:** Criterion D (no autonomic symptoms) is the encoded exclusion (see 9c).
- **Red-flag / secondary off-ramp:** the Comments' "strictly localized stabs → exclude structural cranial-nerve lesion" is a **teaching pearl / pitfall**, not a chip. Recommend surfacing via the phenotype's `pitfalls[]` array (as done for other phenotypes) rather than a criterion. The existing SNNOOP10 red-flag group already provides the global secondary-workup short-circuit (`anyRedFlagActive`, line 422).

### 9e. Registry field update

- `src/lib/citations/registry.ts` → `ichd3-2018.section`: append `4.7` (currently `1.1, 1.2, 1.3, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.10, A1.6.6`). This is a `last_reviewed`-touching change → §13.6 checklist applies; `last_reviewed` is currently `2026-05-25`, within the 24-month window, so freshness itself is fine, but the section-list edit should go through dual sign-off.

---

## 10. Verification confidence

**HIGH.**
- Criteria read verbatim from the official ICHD-3 2018 PDF, page 53 (§4.7 A–E, Notes 1–2, Comments; §4.7.1 A–C) and page 54 (§4.7.1 D).
- Citation (DOI 10.1177/0333102417738202, PMID 29368949, *Cephalalgia* 38(1)) confirmed and matches the in-repo `ichd3-2018` registry entry.
- Cross-checked against `docs/2026_07_01/ichd3-criteria-verified-reference.md` — substantively identical; the one flagged item (Note 2 abbreviation in the in-repo doc) does not affect the criteria and is resolved in favor of the PDF.
- No fabricated criteria. No page failed to resolve.

**Copyright note:** © International Headache Society 2018. The IHS grants free reproduction of ICHD-3 diagnostic criteria for **clinical and educational (non-commercial)** use; commercial or translation use requires IHS permission. Required attribution when the criteria are surfaced in NeuroWiki: *"Diagnostic criteria from the International Classification of Headache Disorders, 3rd edition (ICHD-3), © International Headache Society 2018 (Cephalalgia 2018;38(1):1–211)."* NeuroWiki's use (bedside clinical decision-support / resident education, non-commercial reproduction of criteria with attribution) falls within the educational-use grant. The existing registry entry already treats ICHD-3 as open-access on ichd-3.org, consistent with this grant.

---

**Downstream status:** This packet clears `medical-scientist` to author the §4.7 phenotype encoding and clears the `clinical-reviewer` pre-execution gate to proceed. **Two reviewer decision points flagged, non-blocking:** (i) criterion D as EMIT vs plain suppress-gate; (ii) adding the §4.7.1 entry to `PROBABLE_SECTION_FOR` (the one deviation from the NDPH precedent). Confidence HIGH; no block conditions triggered.

**Relevant file paths (absolute):**
- Source PDF (local, fetched): `/Users/vaibhav/.claude/projects/-Users-vaibhav-Documents-NeuroWiki-Cursor-Neurowiki-neurowiki--claude-worktrees-vibrant-dewdney-4f0ed7/2eefee8c-e51f-4488-b574-6186fb6f76a0/tool-results/webfetch-1783339828666-pugwt6.pdf` (p. 53–54)
- In-repo cross-check: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/2026_07_01/ichd3-criteria-verified-reference.md` (lines 179–188, 911–926)
- Encoding target: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/clinicHeadacheData.ts`
- Citation registry: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/lib/citations/registry.ts` (`ichd3-2018`, line 1447)