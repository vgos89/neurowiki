# CLINICAL CONTENT SPEC — ICHD-3 §13.2.1 GPN + §13.12 PIFP engine expansion

**Status:** ready for clinical-reviewer (pre-execution gate)
**Author:** medical-scientist · **Date:** 2026-09-08
**Ground truth:** `docs/evidence-packets/2026-09-08-ichd3-13-2-13-12-facial-pain.md` (sole criteria/management source) · `docs/reviews/arch-PLAN-headache-facial-pain-expansion-2026-09-08.md` (structural conditions) · AAN clinician summary for trigeminal neuralgia, fetched and read in full this session
**No repo source file was edited.** Every rendered string below is final. No em-dash (U+2014) anywhere; en-dash only in numeric ranges and page ranges.

---

## S0. THREE FINDINGS THAT CHANGE THE BRIEF (read before S1)

**F1 — `Phenotype.teachPearl` and `Phenotype.pitfalls` are DORMANT surfaces in V4.** The brief's S5 assumes "teachPearl renders in the result row". It does not. `PhenotypeMatch` (the only object the UI receives) carries no `teachPearl` and no `pitfalls` field, and no component reads them. Verified by reading in full: `HeadacheResultV4.tsx`, `HeadacheDifferentialPanel.tsx`, `CriteriaList.tsx`, `HeadacheManagement.tsx`, `HeadacheQuestion.tsx`, `ClinicHeadachePathwayV4.tsx`. This is the same defect class as chip `teachWhenSelected` (clinical review round 2, BI-3): reviewed clinical prose that reads as shipped and reaches no clinician. **Consequence: the GPN vagal-safety steer cannot live in `teachPearl`.** See S5.

**F2 — `Criterion.description` is also dormant.** `CriteriaList` renders `c.label` for met and missing criteria; it never renders `description`. `CandidateAccordion` renders `metCriteria` labels only. Descriptions below are authored accurately for the record and for the claims audit trail, but no criterion `description` carries user-facing safety content in this spec.

**F3 — PMID 18716236 is NOT Cruccu.** The brief specifies a new record `cruccu-aan-efns-tn-2008` with `pmid 18716236`. Verified against NCBI E-utilities this session:

| PMID | Actual record |
|---|---|
| **18716236** | Gronseth G, Cruccu G, Alksne J, et al. *Practice parameter: the diagnostic evaluation and treatment of trigeminal neuralgia (an evidence-based review).* **Neurology.** 2008;71(15):1183-1190. DOI 10.1212/01.wnl.0000326598.83183.04 |
| **18721143** | Cruccu G, Gronseth G, Alksne J, et al. *AAN-EFNS guidelines on trigeminal neuralgia management.* **Eur J Neurol.** 2008;15(10):1013-1028. DOI 10.1111/j.1468-1331.2008.02185.x |

Shipping id `cruccu-…` carrying pmid `18716236` reproduces exactly the DOI-drift defect the packet documents at §9.1.E, and repeats the architect's own objection to ids that lie about what they point at. **I read the AAN clinician summary in full this session; that summary is the AAN's derivative of the Neurology practice parameter (©2008 AAN, "refer to the full guideline … at www.aan.com").** I have NOT read the Eur J Neurol Cruccu text. Therefore the record must be named and keyed to Gronseth/Neurology. **Recommended id: `gronseth-aan-efns-tn-2008`** (keeps the joint AAN/EFNS marker, which the Neurology paper's own subtitle carries, while naming the right first author for the PMID). JUDGMENT — flagged in S9 item 12.

---

## S1. REGISTRY DELTAS — `src/lib/citations/registry.ts`

### S1.a `ichd3-2018`

**`section` field — exact replacement string** (packet §9.1.A; five new entries in numeric position, 13.2.**1** prefix throughout, no bare `13.2`):

```
'1.1, 1.2, 1.2.1, 1.2.2, 1.2.3, 1.2.4, 1.3, 1.4.1, 2.2, 2.3, 3.1, 3.1.1, 3.1.2, 3.2, 3.3, 3.3.1, 3.3.2, 3.4, 4.7, 4.9, 4.10, 8.2, 13.1.1, 13.1.1.1, 13.1.1.2, 13.1.1.3, 13.2.1, 13.2.1.1, 13.2.1.2, 13.2.1.3, 13.4, 13.12, A1.6.6'
```

The three aetiology sections `13.2.1.1/.2/.3` are listed even though subtypes are deferred (S2), because the append text reproduces them and the GPN safety-and-workup card renders an aetiology row from them (S6). They are load-bearing, not decorative.

**`quoted_text` append — ZERO clinical edits.** Append the packet §9.1.B block **verbatim as the packet wrote it** (packet §9.1.B, ICHD-3 pp. 171-172 and pp. 178-179). I reviewed it clause by clause against §2.1 and §3.1 and found nothing to tighten: every connective is already source-neutral, the record's no-em-dash house style already holds, and the two deliberate omissions the packet declares (13.2.2 Painful glossopharyngeal neuropathy, and the PIFP atypical-odontalgia Comment) are correct on scope grounds. **Appending it unmodified preserves the verification chain; any tightening by me would break the "verbatim as verified" property that makes `quoted_text` usable as a bounding surface.** Implementer: copy the packet's §9.1.B code block character-for-character to the end of the existing `quoted_text` string, separated by a single space.

**§13.6 six-step attestation for this record.** Steps 1, 2 and 5 are the verifier's (packet §9.1.C). I complete 3 and 4; step 6 is clinical-reviewer's signature at the pre-gate.

- **(3) Dependent claims consistent.** Verified by direct read this session against the record's `quoted_text`: `clinic-headache-ichd3-tension-criteria`, `-ndph-criteria`, `-primary-stabbing-criteria`, `-status-migrainosus-criteria`, `-trigeminal-neuralgia-criteria`, `-occipital-neuralgia-criteria`, `-hypnic-criteria`, `-aura-subtypes`, `-moh`, `-tn-subtypes`, `-tac-subtypes`, `-chronic-migraine-criteria`, `-paroxysmal-criteria`, `-sunct-criteria`, `clinic-headache-pitfall-mig-vs-tth`, `clinic-headache-partial-match-caveat`, `clinic-headache-tn-workup`, `clinic-headache-tn-management`, `clinic-headache-on-management` (19 claims). Each still accurately reflects the cited text. **Two of those 19 are corrected by this spec** (`clinic-headache-tn-management` grade attribution, S1.d; `clinic-headache-on-management` first-line overstatement, S1.d) — both corrections point away from `ichd3-2018`, not at it. **I did NOT read `claims.ts` end to end**, so I do not attest to claims outside that enumerated set; three further ids appear in `HiddenClaimMarkers` (`-migraine-criteria`, `-cluster-criteria`, `-hemicrania-criteria`) whose descriptions I did not open. Residual recorded in S9 item 3.
- **(4) No wording drift.** The two new sections introduce no drift because nothing depended on them before this batch. For the pre-existing set, the one drift already known and already remediated in-flight is the secondary-TN red-flag list on `clinic-headache-ichd3-trigeminal-neuralgia-criteria` (BC-4; tracked in TASKS.md, out of scope here).

**`last_reviewed` ruling: HOLD at `2026-05-25`. Do not refresh.**

Rationale, three grounds: (i) same 2018 edition, same PMID, same DOI, no superseding edition (packet §8c: ICHD-4 not published as of 2026-09-08; ICOP 2020 is a parallel classification whose glossopharyngeal-referable criteria Nahas 2024 reports as "essentially identical"); (ii) the record is inside its 24-month window (expires 2028-05-25), so no freshness-hook pressure exists; (iii) **a refresh would restart a 24-month clock on the full dependent-claim set while step 3 was completed for 19 of roughly 22, which is precisely the governance violation §13.6 warns against.** Holding the date is the conservative call and follows the 2026-07-06 §4.7 precedent recorded in the record's own comment.

**Comment block to append to the record** (registry comments are not a scanned surface; technical voice is correct here):

```
// 2026-09-08: added §13.2.1 Glossopharyngeal neuralgia (+ aetiology subforms
// 13.2.1.1/.2/.3) and §13.12 Persistent idiopathic facial pain verbatim to
// quoted_text and the section list (evidence packet
// docs/evidence-packets/2026-09-08-ichd3-13-2-13-12-facial-pain.md; ICHD-3 PDF
// pp. 171-172 and pp. 178-179, read in reading order with printed folios).
// NUMBERING: the entity with criteria is 13.2.1, NOT 13.2 (13.2 is a parent
// heading with no criteria, structurally identical to 13.1). 13.2.2 Painful
// glossopharyngeal neuropathy is a SIBLING entity and is out of scope, on the
// same reasoning that excluded 13.1.2 in the 2026-07-06 TN packet.
// §13.12 has NO Notes and runs A-F (six criteria); criterion E is a dental-cause
// workup gate. It has NO "investigations unremarkable" criterion: the Comments
// state the opposite ("psychophysical or neurophysiological tests may
// demonstrate sensory abnormalities").
// last_reviewed unchanged - same ICHD-3 2018 edition, both new sections read
// verbatim from the source, within the 24-month window; refreshing would restart
// the clock on every dependent claim without a full §13.6 step-3 pass.
// Dependent claim count: <N> (implementer: derive mechanically from
// CLAIM_REGISTRY membership at implementation time and write the number here;
// the stale "all 12 mapped claim IDs" figure above is superseded. Verified floor
// this session: 19 read + 2 new = 21).
```

### S1.b `nahas-2024-continuum-cranial-neuralgias`

**Metadata — four corrections (packet §0.3 / §9.1.D):**

| Field | Exact new value |
|---|---|
| `title` | `'Cranial Neuralgias (Nahas, Continuum 2024;30(2):473–487)'` |
| `section` | `'Continuum 2024;30(2):473–487'` |
| `url` | `'https://doi.org/10.1212/CON.0000000000001415'` |
| `pmid` | `'38568494'` |

Record `id` unchanged (`nahas-2024-continuum-cranial-neuralgias`) — the id names the correct sole author; only the title carried the phantom second author. Re-keying would re-point four claims for cosmetic gain.

**`quoted_text` — exact replacement string.** Every clause below is packet-verified sourced; the NVAF clause, the airway clause, the GPN-carbamazepine clause and the Nahas-attributed Level A/B grades are removed entirely. Verbatim sentences carry quotation marks; the one digest (Table 10-2) is explicitly labelled as a table so no future author mistakes it for prose. **No NeuroWiki editorial content is placed inside `quoted_text`** — that is what produced the airway defect.

```
Trigeminal neuralgia, p. 477: "First-line medications for trigeminal neuralgia include carbamazepine and oxcarbazepine, which are closely related in chemical structure and mechanism of action. Other agents to consider are gabapentin, baclofen, lamotrigine, and onabotulinumtoxinA, among others." "Carbamazepine is the only medication specifically approved by the US Food and Drug Administration (FDA) for this indication. No devices or procedures have been cleared by the FDA for trigeminal neuralgia." TABLE 10-2, "Pharmacologic Options for Trigeminal Neuralgia", p. 476, typical target dose range: carbamazepine 300-800 mg/day; oxcarbazepine 600-1200 mg/day. Table footnote b: "The initial doses are typically 10% to 25% of the target dose, with incremental titration as tolerated. The total daily dose is usually divided for administration 2 to 4 times per day." Recommended laboratory monitoring named on p. 477: complete blood count and serum sodium. Acute exacerbation, p. 478: "Acute exacerbations may require additional treatment. If trigeminal neuralgia pain results in poor oral intake and dehydration, IV fluid resuscitation may be necessary. In addition, infusions of fosphenytoin and lidocaine are also reported to be useful. Opioids should be avoided." Occipital neuralgia, p. 483: "There is very little high-quality evidence available to guide treatment options, and treatment selection remains largely empiric at this time. Besides nerve blockade, medications typically used for neuralgiform or neuropathic pain are utilized, along with physical therapy to reduce muscular tension." Glossopharyngeal neuralgia, p. 480: "Treatment overlaps substantially with trigeminal neuralgia." "Due to proximity and interconnectedness with other structures, particularly the vagus nerve, symptoms such as cough, hoarseness, bradycardia, and syncope can be present." Secondary causes, all cranial neuralgias, Conclusion p. 486: "A careful and thorough history and examination may yield early clues to certain secondary causes, but even in the absence of red flags or other signs and symptoms suggesting that this is the case, investigation with neuroimaging is usually warranted and may need to be repeated with dedicated techniques before an underlying problem is discovered. It should be remembered that pain may be referred to the distribution of a nerve in the cranium by secondary etiologies of the soft tissues and bony structures in the head and neck."
```

**Comment block to place above the record:**

```
// 2026-09-08 CORRECTION (evidence packet
// docs/evidence-packets/2026-09-08-ichd3-13-2-13-12-facial-pain.md §0.3, §4.1,
// §9.1.D). All 15 printed pages (473-487) of the held PDF were rendered and read.
// Four metadata fields were wrong: authorship ("& Sanguinetti" - the article has
// ONE author), page range (was 510-536), DOI (was ...1414, which resolves to Orr,
// Headache in Children and Adolescents, 30(2):438-472), and a missing PMID.
// quoted_text rewritten. Removed and NOT to be reinstated:
//   - "Glossopharyngeal neuralgia: carbamazepine; airway protection mandatory if
//     swallowing affected." NEITHER HALF APPEARS IN THE ARTICLE. The words
//     "airway", "aspiration" and "swallowing precaution" appear on none of the 15
//     pages. The carbamazepine provenance for GPN is ICHD-3 p. 172 (a Comment),
//     re-pointed there. The airway directive has no source in any held document.
//   - "NVAF TN variant: phenytoin/carbamazepine." "NVAF" appears nowhere in the
//     article and has no cranial-neuralgia referent.
//   - The TN "(Level A)"/"(Level B)" grades, which are NOT Nahas's. They belong to
//     the 2008 AAN/EFNS guideline and now live on gronseth-aan-efns-tn-2008.
//   - "Occipital neuralgia: greater and/or lesser GON blocks first-line."
//     Overstated. "First-line" is not the article's framing; p. 483 is replaced
//     verbatim.
// Neither ICHD-3 nor this article assigns a class or level of evidence to any
// glossopharyngeal neuralgia treatment; the article cites only a narrative review
// for GPN (ref 31, p. 487: Park JS, Ahn YH, J Korean Neurosurg Soc
// 2023;66(1):12-23). Packet §8c: no major-society guideline addresses GPN.
// last_reviewed: refresh to 2026-09-08 (the full article was read this session and
// every carried clause re-verified against the printed page - this IS a §13.6
// six-step pass on this record, unlike ichd3-2018).
```

`last_reviewed: '2026-09-08'`, `review_window_months: 12` (unchanged). **JUDGMENT:** this record's date DOES refresh while `ichd3-2018` does not. The asymmetry is principled: Nahas was read cover to cover this session and every dependent claim on it is being re-verified and corrected in this batch (`clinic-headache-tn-management`, `clinic-headache-on-management`, plus the two new GPN claims), so all six §13.6 steps genuinely complete. `ichd3-2018` has ~21 dependents of which 19 were checked.

### S1.c NEW record `gronseth-aan-efns-tn-2008`

Source read in full this session: **AAN Summary of Evidence-based Guideline for CLINICIANS — TRIGEMINAL NEURALGIA**, ©2008 American Academy of Neurology, retrieved from `https://www.aan.com/Guidelines/home/GetGuidelineContent/303` (fetch succeeded; 754 KB PDF; both pages rendered and read). Tier 1 open-access; no V request needed.

```typescript
// ─── AAN / EFNS 2008 — trigeminal neuralgia practice parameter ───────────────
// Gronseth G, Cruccu G, Alksne J, et al. Practice parameter: the diagnostic
// evaluation and treatment of trigeminal neuralgia (an evidence-based review):
// report of the Quality Standards Subcommittee of the American Academy of
// Neurology and the European Federation of Neurological Societies. Neurology
// 2008;71(15):1183-1190. PMID 18716236. Companion publication: Cruccu G, et al.
// AAN-EFNS guidelines on trigeminal neuralgia management. Eur J Neurol
// 2008;15(10):1013-1028, PMID 18721143 (NOT read in this session; do not quote).
// PMID CHECK 2026-09-08: verified via NCBI E-utilities that 18716236 is the
// Neurology practice parameter and 18721143 is the Eur J Neurol guideline. The
// record is named for the Neurology first author because that is the PMID and the
// document this quoted_text derives from.
// quoted_text is transcribed from the AAN's own free clinician summary of this
// guideline (open access at the url below, read in full 2026-09-08). This record
// exists because the Level A / Level B carbamazepine and oxcarbazepine grades were
// previously attributed to nahas-2024-continuum-cranial-neuralgias, where they do
// not appear (evidence packet 2026-09-08 §9.1.D).
// review_window_months: 12. Override rationale (§13.7): the quoted text is from a
// closed 2008 document and cannot drift, so the 6-month current-guideline default
// buys nothing; but a NEWER society guideline on the same question exists and is
// NOT held (Bendtsen L, et al. European Academy of Neurology guideline on
// trigeminal neuralgia. Eur J Neurol 2019;26(6):831-849, doi 10.1111/ene.13950),
// so this record must be re-examined annually rather than on a 24-month cadence
// until that source is acquired. Acquisition tracked in TASKS.md.
'gronseth-aan-efns-tn-2008': {
  id: 'gronseth-aan-efns-tn-2008',
  source: 'guideline',
  title: 'Practice parameter: the diagnostic evaluation and treatment of trigeminal neuralgia (an evidence-based review) (Gronseth et al., Neurology 2008;71(15):1183–1190; AAN/EFNS)',
  year: 2008,
  section: 'Pharmacological treatment; AAN clinician summary',
  url: 'https://www.aan.com/Guidelines/home/GetGuidelineContent/303',
  pmid: '18716236',
  last_reviewed: '2026-09-08',
  review_window_months: 12,
  quoted_text: 'Which drugs effectively treat CTN pain? Strong evidence: "Strong evidence supports that carbamazepine should be offered to treat CTN pain (Level A)." Good evidence: "Good evidence supports that oxcarbazepine should be considered to treat CTN pain (Level B)." Clinical context: "The two drugs to consider as first-line therapy in TN are CBZ (200-1200 mg/day) and OXC (600-1800 mg/day). Although the evidence for CBZ is stronger than for OXC, the latter may pose fewer safety concerns." Weak evidence: "Weak evidence supports that baclofen, lamotrigine, and pimozide may be considered to treat CTN pain (Level C)." Good evidence: "Good evidence supports that topical ophthalmic anesthesia should not be considered to treat CTN pain (Level B)." Clinical context: "There is little evidence to guide the clinician on the treatment of TN patients who fail first-line therapy. Some evidence supports add-on therapy with lamotrigine or a switch to baclofen (pimozide being no longer in use)." Which drugs effectively treat STN pain? Insufficient evidence: "There is insufficient evidence to support or refute the effectiveness of any medication in treating pain in STN (Level U)." Is there evidence of efficacy of intravenous administration of drugs in acute exacerbations of TN? Insufficient evidence: "There is insufficient evidence to support or refute the efficacy of intravenous medications for the treatment of pain from TN (Level U)." Surgical treatment: "There is insufficient evidence to allow conclusions as to when surgery should be offered (Level U)." Clinical context: "Referral for a surgical consultation seems reasonable in TN patients refractory to medical therapy." "For patients with TN refractory to medical therapy, Gasserian ganglion percutaneous techniques, gamma knife, and microvascular decompression may be considered (Level C)." Diagnostic: "Good evidence indicates that measuring trigeminal reflexes in a qualified electrophysiological laboratory should be considered useful for distinguishing STN from classic trigeminal neuralgia (CTN) (Level B)." "There is insufficient evidence to support or refute the usefulness of MRI to identify vascular contact in CTN or to indicate the most reliable MRI technique (Level U)." AAN classification of recommendations: "A = Established as effective, ineffective, or harmful ... B = Probably effective, ineffective, or harmful ... C = Possibly effective, ineffective, or harmful ... U = Data inadequate or conflicting; given current knowledge, treatment (test, predictor) is unproven."',
},
```

The Level U line on IV medications is deliberately carried: it is the substrate for the already-made editorial decision to remove the IV fosphenytoin/lidocaine row from the TN card (BC-1/BC-2), which until now had no citation record behind it.

### S1.d TN card correction — **recommendation: keep the grades, re-attribute them**

Do not drop the grades. They are real, verified, and clinically load-bearing (a resident choosing between two drugs needs to know one is Level A and the other Level B). What was wrong was the attribution, not the content.

**Current (defective) — `HeadacheManagement.tsx`, case `'trigeminal-neuralgia'`, second card:**
```
<SectionHeader>Treatment (Nahas Continuum 2024)</SectionHeader>
<Row label="First-line" value="Carbamazepine (Level A) or oxcarbazepine (Level B)" />
```

**Exact corrected card (replaces that block; the aetiology card above it is unchanged):**
```jsx
<div data-claim="clinic-headache-tn-management" className={CARD}>
  <SectionHeader>Treatment</SectionHeader>
  <dl className={DL}>
    <Row label="First-line (AAN 2008)" value="Carbamazepine should be offered (Level A). Oxcarbazepine should be considered (Level B). The evidence for carbamazepine is stronger; oxcarbazepine may pose fewer safety concerns." />
    <Row label="Second-line (AAN 2008)" value="Baclofen, lamotrigine, or pimozide may be considered (Level C). Evidence to guide treatment after first-line failure is limited; some evidence supports adding lamotrigine or switching to baclofen." />
    <Row label="Note" value="Treatment response is not an ICHD-3 13.1.1 criterion. Do not use it to confirm or exclude the diagnosis." />
  </dl>
</div>
```
Provenance: row 1 and row 2 are AAN clinician summary, Pharmacological Treatment table, question 1 (grade statements verbatim; the comparative clause is the summary's own Clinical context row). Row 3 is unchanged, grounded in `ichd3-2018` §13.1.1 (drug response is a Comment, not a criterion). The action verbs "should be offered" / "should be considered" / "may be considered" are the AAN's own and are preserved exactly (never-drift category: recommendation strength + action verbs).

Header changes from `Treatment (Nahas Continuum 2024)` to `Treatment`, with attribution moved into the row labels, because the card now draws on two sources and a single source in the header would be false again.

**No dosing row.** The two held sources give different ranges for the same drugs: AAN 2008 "CBZ (200-1200 mg/day) and OXC (600-1800 mg/day)"; Nahas Table 10-2 "carbamazepine 300-800 mg/day; oxcarbazepine 600-1200 mg/day". Per the source-hierarchy rule I do not synthesize. Both ranges are carried in their own records' `quoted_text` where each is correctly attributed; **no dose range is rendered until this is adjudicated.** S9 item 8.

**Claim update — `clinic-headache-tn-management`:**
```typescript
'clinic-headache-tn-management': {
  id: 'clinic-headache-tn-management',
  citation_ids: ['gronseth-aan-efns-tn-2008', 'ichd3-2018'],
  surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
  description: 'TN treatment card, corrected 2026-09-08. Rows 1-2 carry the AAN/EFNS 2008 practice-parameter grades VERBATIM from the AAN clinician summary: carbamazepine should be offered (Level A); oxcarbazepine should be considered (Level B); baclofen, lamotrigine, or pimozide may be considered (Level C); evidence after first-line failure is limited, with some support for adding lamotrigine or switching to baclofen. These grades were previously attributed to nahas-2024-continuum-cranial-neuralgias, where they DO NOT APPEAR (evidence packet 2026-09-08 §9.1.D); nahas is removed from citation_ids because no row on this card now rests on it. No dose range is rendered: AAN 2008 gives CBZ 200-1200 mg/day and OXC 600-1800 mg/day while Nahas Table 10-2 gives 300-800 and 600-1200; the two are not reconciled and are held only in their respective quoted_text fields. The treatment-response note asserts only the negative (response is not an ICHD-3 13.1.1 criterion; do not use it to confirm or exclude), grounded in ichd3-2018. The IV fosphenytoin/lidocaine row remains removed (BC-1/BC-2); the AAN parameter grades IV medication in TN Level U, now held verbatim in gronseth-aan-efns-tn-2008.',
},
```

### S1.e ON card correction (consequence of the Nahas `quoted_text` rewrite)

Removing "first-line" from the Nahas record leaves the shipped occipital-neuralgia card's "First-line" row unsourced. It must change in the same commit.

**Exact corrected card:**
```jsx
<div data-claim="clinic-headache-on-management" className={CARD}>
  <SectionHeader>Treatment (Nahas Continuum 2024)</SectionHeader>
  <dl className={DL}>
    <Row label="Evidence base" value="Very little high-quality evidence guides treatment, and selection remains largely empiric." />
    <Row label="Options" value="Nerve blockade, medications typically used for neuralgiform or neuropathic pain, and physical therapy to reduce muscular tension." />
    <Row label="Diagnostic criterion" value="ICHD-3 13.4 criterion D requires that the pain is eased temporarily by local anaesthetic block of the affected nerve(s)." />
  </dl>
</div>
```
Provenance: rows 1-2 bounded by Nahas p. 483 verbatim (packet §9.1.D); row 3 unchanged, `ichd3-2018` §13.4 D.

**Claim update — `clinic-headache-on-management`:** `citation_ids` unchanged (`['nahas-2024-continuum-cranial-neuralgias', 'ichd3-2018']`). New description:
```
'Occipital neuralgia card, corrected 2026-09-08. The prior "First-line: greater and/or lesser occipital nerve block" row is removed: "first-line" is not the source framing. Nahas p. 483 verbatim states there is very little high-quality evidence to guide treatment options, selection remains largely empiric, and that besides nerve blockade, medications typically used for neuralgiform or neuropathic pain are utilized along with physical therapy to reduce muscular tension. The diagnostic row is unchanged and states ICHD-3 13.4 criterion D at full mandatory strength (pain eased TEMPORARILY by local anaesthetic block of the affected nerve(s)).'
```

---

## S2. GPN PHENOTYPE — `src/data/clinicHeadacheData.ts`

**`PhenotypeId` union addition:** `| 'glossopharyngeal-neuralgia'        // §13.2.1 — added 2026-09-08`
**`CHAPTER_ORDER` position:** immediately after `'trigeminal-neuralgia'` (§13.1.1), before `'occipital-neuralgia'` (§13.4), with comment `// §13.2.1`.
**`EMIT_CRITERION_IDS`:** no entry. Both criteria DROP silently on substrate absence, like TN and ON.
**`episodicPhenotypes`:** **not a member.** Stated explicitly per architect ruling (e). Clinical reason beyond the TN/ON precedent: ICHD-3 p. 172 states GPN "can occur together with 13.1.1 Trigeminal neuralgia", and a patient with a coexisting continuous headache who answers `dur-continuous` must not have their GPN paroxysms silently deleted from the differential.
**`PROBABLE_SECTION_FOR`:** no entry. §13 has no 13.2.1.5.
**`hiddenUntilTrial`:** none. The local-anaesthetic tonsil application is a Comment in 13.2.1, not criterion D as in 13.4; giving it gate status would be packet §6.1 trap 3.

**Exact phenotype block** (insert after the `trigeminal-neuralgia` block, before `occipital-neuralgia`):

```typescript
  // ─── 13.2.1 Glossopharyngeal neuralgia ───────────────────────────────────
  // ICHD-3 §13.2.1 parent. NOTE THE NUMBERING: 13.2 is a parent HEADING with no
  // criteria of its own (structurally identical to 13.1); the entity with criteria
  // is 13.2.1. Never ship "ICHD-3 13.2" against these criteria. 13.2.2 Painful
  // glossopharyngeal neuropathy is a SIBLING entity, not a subform, and is out of
  // scope on the same reasoning that excluded 13.1.2 from the TN encoding.
  // Aetiology subtyping (§13.2.1.1 classical / §13.2.1.2 secondary / §13.2.1.3
  // idiopathic) is decided by MRI or surgery and is DEFERRED to the subtype-
  // hierarchy layer, exactly as TN's is (ADR-2026-07-06; evidence packet
  // 2026-09-08 §9.2 flag 3). Do NOT build a second, divergent solution for GPN,
  // and do NOT reuse the tn-* aetiology chips, whose ids would lie about which
  // phenotype they resolve. ENCODING TRAP: 13.2.1.1 criterion B has NO
  // "morphological change" and NO "not simply contact" qualifier, unlike 13.1.1.1
  // (ICHD-3 p. 172 vs p. 167). The classical/idiopathic split for GPN turns on
  // whether compression is demonstrated at all.
  // §13 has NO Probable-GPN section, so both criteria are suppress-gates (binary
  // full or hidden): a feature miss is unclassified, NOT "probable GPN". No
  // attack-count criterion. Drug response and local-anaesthetic response are
  // Comments (p. 172), NOT criteria, and are not gates.
  // Criterion C ("not better accounted for by another ICHD-3 diagnosis") is NOT
  // encoded: no phenotype in this engine encodes it, it has no chip-answerable
  // substrate, and encoding it would inflate the criteriaTotal denominator
  // inconsistently in the shared "N of M" display (architect 2026-09-08,
  // condition 6).
  {
    id: 'glossopharyngeal-neuralgia',
    name: 'Glossopharyngeal neuralgia',
    ichd3Section: 'ICHD-3 §13.2.1',
    teachPearl:
      'Glossopharyngeal neuralgia is recurrent, brief (a few seconds up to 2 minutes), severe, electric-shock-like, shooting, stabbing, or sharp unilateral pain in the posterior part of the tongue, tonsillar fossa, pharynx, or angle of the lower jaw, and in the ear, precipitated by swallowing, coughing, talking, or yawning. Unlike 13.1.1 trigeminal neuralgia, radiation beyond the nerve is permitted: the pain may involve the eye, nose, chin, or shoulder. It can occur together with 13.1.1 trigeminal neuralgia. In rare cases attacks are accompanied by vagal symptoms such as cough, hoarseness, syncope, or bradycardia, and ICHD-3 records the term vagoglossopharyngeal neuralgia for pain accompanied by asystole, convulsions, and syncope. Pain can be severe enough for patients to lose weight. Clinical examination usually shows no sensory change in the nerve distribution; mild sensory deficits do not invalidate the diagnosis, but major changes or a reduced or missing gag reflex should prompt aetiological investigations.',
    criteria: [
      // gpn-A: suppress-gate (DROP). Anatomical substrate. Unilateral pain in the
      // glossopharyngeal distribution (§13.2.1 A + Note 1: posterior part of the
      // tongue, tonsillar fossa, pharynx or angle of the lower jaw and/or the ear).
      // Do NOT reuse loc-trigeminal-distribution: its label encodes "not spreading
      // beyond", which 13.2.1 explicitly permits (packet §6.1 trap 2).
      { id: 'gpn-A', label: 'Unilateral pain in the glossopharyngeal distribution (throat, tongue base, tonsil area, angle of the jaw, or ear)', description: 'ICHD-3 13.2.1 A: recurring paroxysmal attacks of unilateral pain in the distribution of the glossopharyngeal nerve. Note 1: within the posterior part of the tongue, tonsillar fossa, pharynx or angle of the lower jaw and/or in the ear.', evaluate: s => has(s, 'loc-unilateral') && has(s, 'loc-glossopharyngeal-territory'), contributingChips: ['loc-unilateral', 'loc-glossopharyngeal-territory'], role: 'suppress-gate' },
      // gpn-B: suppress-gate (DROP). ONE composite criterion carrying all four
      // sub-items B.1-B.4, faithful to the ICHD lettering: unlike TN, whose trigger
      // is a SEPARATE lettered criterion C, GPN's trigger is B.4 and sits inside B.
      // Splitting it would make the "N of M" denominator inconsistent with the
      // source. Severity: 13.2.1 B.2 says "severe intensity", satisfied by EITHER
      // severity answer (q-severity is single-select and neuralgiform pain is
      // routinely reported as very severe; sev-severe alone silently drops the whole
      // phenotype - medical review 2026-09-07, U1). Quality: B.3 is word-identical
      // to TN B.3; the qual-electric-shock-shooting || qual-sharp-stabbing pair is
      // counted once, per the on-B idiom. Duration: dur-few-sec-to-2min is MINTED,
      // not reused - dur-seconds-to-minutes (occipital) is wider at the upper bound
      // and dur-fraction-sec-to-2min (TN) is wider at the lower bound; either would
      // admit patients this criterion excludes. Trigger: trigger-swallow-cough-talk-
      // yawn is MINTED and must NOT feed tn-C; TN's trigger is innocuous cutaneous
      // stimuli, GPN's is deglutitive/mechanical, and collapsing them makes the two
      // phenotypes indistinguishable at the chip layer (packet §6.1 trap 1).
      { id: 'gpn-B', label: 'Brief (a few seconds up to 2 min), severe, shock-like or sharp pain triggered by swallowing, coughing, talking, or yawning', description: 'ICHD-3 13.2.1 B: pain has all of: 1) lasting from a few seconds to two minutes, 2) severe intensity, 3) electric shock-like, shooting, stabbing or sharp in quality, 4) precipitated by swallowing, coughing, talking or yawning.', evaluate: s => has(s, 'dur-few-sec-to-2min') && (has(s, 'sev-severe') || has(s, 'sev-very-severe')) && (has(s, 'qual-electric-shock-shooting') || has(s, 'qual-sharp-stabbing')) && has(s, 'trigger-swallow-cough-talk-yawn'), contributingChips: ['dur-few-sec-to-2min', 'sev-severe', 'sev-very-severe', 'qual-electric-shock-shooting', 'qual-sharp-stabbing', 'trigger-swallow-cough-talk-yawn'], role: 'suppress-gate' },
    ],
  },
```

`criteriaTotal` = 2. GPN is therefore binary full-or-hidden, matching TN (3 of 3) and ON (4 of 4). It can never render as "partial". Consequence to accept knowingly: a patient meeting three of the four B sub-items sees nothing. That is identical to `tn-B` behaviour and is what the absence of a §13.2.1.5 Probable tier requires. S9 item 5.

**No management or drug content appears in `teachPearl`** (packet binding). **No airway directive appears anywhere in this spec.**

---

## S3. PIFP PHENOTYPE

**`PhenotypeId` union addition:** `| 'persistent-idiopathic-facial-pain'  // §13.12 — added 2026-09-08`
**`CHAPTER_ORDER` position:** after `'occipital-neuralgia'` (§13.4), before `'vestibular-migraine'` (§A1.6.6), comment `// §13.12`.
**`EMIT_CRITERION_IDS`:** no entry.
**`episodicPhenotypes`:** **not a member**, and this is safety-critical, not cosmetic. PIFP is a daily entity; membership would let a `dur-continuous` answer suppress the phenotype from the very patient it describes.
**`PROBABLE_SECTION_FOR`:** no entry. There is no §13.12.5; a demote-gate here would manufacture "Probable persistent idiopathic facial pain", which is the §1.3 chronic-migraine error in a new chapter.
**`MANAGED`:** **not a member.** No treatment card (packet §4.4; decision already made).

### Ruling on packet flag 5 (criterion E shape): plain suppress-gates for D and E, NO `hiddenUntilTrial`

**Recommendation: `pifp-D` and `pifp-E` are plain `suppress-gate` criteria in the DROP set. Do not add `hiddenUntilTrial`. Do not add either to `EMIT_CRITERION_IDS`.**

Clinical justification, four parts:

1. **The harm PIFP criterion E exists to prevent is premature labelling.** The documented real-world harm in this entity runs in both directions: a treatable dental cause gets missed under an "atypical facial pain" label, or facial pain gets attributed to teeth and irreversible dental procedures follow. A bedside tool that surfaces PIFP before the dental workup is done pushes on the first failure mode. A hard gate is the clinically correct strength, and it matches ICHD-3, where E carries equal status to A-D.

2. **`hiddenUntilTrial` would add no behaviour and one maintenance surface.** A failed suppress-gate already drops the phenotype silently. The engine's own comment on `hiddenUntilTrial` states the two checks are idempotent and warns "Do NOT add a fifth phenotype-suppression mechanism without considering unification first." ON carries both only because `on-D` is simultaneously a displayed criterion and the gate for a therapeutic-diagnostic procedure the clinician performs. PIFP's D and E are not procedures the tool is asking the clinician to go and do; they are workup states.

3. **The workup message still reaches the clinician even when the phenotype is hidden.** It lives on the `q-pifp` option labels ("The neurological examination is normal", "A dental cause has been excluded by appropriate investigation"), which `HeadacheQuestion` renders unconditionally the moment the branch fires. This is the same mechanism by which ON's block requirement teaches through `q-occipital`. The architect's ruling (c) reached the same place by a different route.

4. **EMIT is the wrong semantics and would render an ambiguous string.** EMIT is defined in this engine as *positive contradicting evidence*. An un-done dental workup is absence of confirmation, like `ph-E` (indomethacin) and `on-D` (block) — both DROP. And `exclusionReason` renders as the bare criterion label, so the set-aside tray would read "Persistent idiopathic facial pain · A dental cause has been excluded by appropriate investigations", which asserts the opposite of what is meant. Separately: the genuinely contradicting case for criterion D, an **abnormal** neurological examination, never reaches phenotype banding at all, because `rf-neuro-deficit` short-circuits the whole pathway to secondary workup at the SNNOOP10 gate. The engine has no "exam abnormal" chip, so DROP is the only reading available and it is also the safe one.

**Exact phenotype block** (insert after the `occipital-neuralgia` block):

```typescript
  // ─── 13.12 Persistent idiopathic facial pain ─────────────────────────────
  // ICHD-3 §13.12 (previously used term: atypical facial pain). Encoded
  // 2026-09-08 from the source-verified evidence packet (ICHD-3 PDF pp. 178-179,
  // read in reading order). §13.12 carries NO Notes and no superscript note
  // markers on any criterion; this is a verified absence, not an extraction gap.
  // The criteria run A-F. Criterion F ("not better accounted for by another ICHD-3
  // diagnosis") is NOT encoded, per the engine-wide rule (architect condition 6).
  // There is NO §13.12.5 Probable tier and no subform: the atypical-odontalgia
  // Comment explicitly says the candidate subtypes "have not been sufficiently
  // studied to propose diagnostic criteria", so the engine must not invent one.
  // All five encoded criteria are suppress-gates (binary full or hidden).
  // THERE IS NO "INVESTIGATIONS UNREMARKABLE" CRITERION. The only investigation
  // criterion is E (dental cause excluded); the only normal-findings criterion is D
  // (clinical neurological examination). The Comments state the opposite of a
  // blanket normal-investigations requirement: "psychophysical or
  // neurophysiological tests may demonstrate sensory abnormalities."
  // NOT in episodicPhenotypes: PIFP is a daily entity, and membership would let a
  // dur-continuous answer suppress the phenotype from the very patient it
  // describes. Criterion B is NOT routed through dur-continuous or split across
  // pattern-ge-3-months: see the pifp-B comment.
  // No management card (MANAGED excludes this id): no held source covers PIFP
  // treatment. Nahas 2024 does not cover PIFP at all, a verified negative
  // corroborated by the article's own scope enumeration on p. 474. Criteria D and E
  // carry the workup message on the criteria surface, and the q-pifp option labels
  // carry it during the question flow.
  {
    id: 'persistent-idiopathic-facial-pain',
    name: 'Persistent idiopathic facial pain',
    ichd3Section: 'ICHD-3 §13.12',
    teachPearl:
      'Persistent idiopathic facial pain, previously called atypical facial pain, is facial or oral pain recurring daily for more than 2 hours a day for more than 3 months, poorly localized and not following the distribution of a peripheral nerve, dull, aching, or nagging in quality, with a normal clinical neurological examination and a dental cause excluded by appropriate investigations. Sharp exacerbations are allowed, the pain is aggravated by stress, and over time it may spread to a wider area of the craniocervical region. Psychophysical or neurophysiological tests may demonstrate sensory abnormalities, so an abnormal sensory test does not exclude it: the clinical neurological examination is the only normal-findings criterion. It may originate from a minor operation or injury to the face, maxillae, teeth, or gums and persist after healing without any demonstrable local cause. Patients are predominantly female, and levels of psychiatric comorbidity and psychosocial disability are high.',
    criteria: [
      // pifp-A: suppress-gate (DROP). Site substrate. ICHD-3 13.12 A is "Facial
      // and/or oral pain". Satisfied by EITHER site chip: loc-facial-region (cheek,
      // jaw, upper lip) or loc-glossopharyngeal-territory (throat, tongue base,
      // tonsil area, ear, under the angle of the jaw), the latter being
      // unambiguously oral at the tongue base and tonsil. Encoded as a disjunction
      // because either chip ALONE is narrower than the criterion, and a label
      // narrower than the criterion manufactures false negatives (the sev-very-
      // severe defect, U1). loc-orbital-temporal is deliberately NOT included: it
      // would let a cluster or paroxysmal-hemicrania chip satisfy PIFP's substrate.
      // Defensive as well as faithful: branch answers persist in page state after a
      // branch stops firing (no cascade-clear), so a site criterion prevents a stale
      // q-pifp answer set from matching after the location answer is changed.
      { id: 'pifp-A', label: 'Facial and/or oral pain', description: 'ICHD-3 13.12 A: facial and/or oral pain fulfilling criteria B and C.', evaluate: s => has(s, 'loc-facial-region') || has(s, 'loc-glossopharyngeal-territory'), contributingChips: ['loc-facial-region', 'loc-glossopharyngeal-territory'], role: 'suppress-gate' },
      // pifp-B: suppress-gate (DROP). ONE minted chip carrying the FULL conjunction
      // (>2 h/day AND >3 months). Deliberately NOT split across pattern-ge-3-months:
      // (a) splitting a conjunction across a generic chronicity chip risks a
      // half-satisfied criterion reading as satisfied (packet §9.2); (b) referent
      // mismatch - pattern-ge-3-months is answered on the CORE q-chronicity screen
      // about the headache pattern in general, not about this facial pain's daily
      // duration. Also deliberately NOT routed through dur-continuous, which is in
      // the episodicPhenotypes suppression list and would silently drop migraine,
      // TTH, cluster, PH and SUNCT from a facial-pain patient's differential; and
      // NOT through freq-ge-1-per-day, an attack-count chip that does not mean
      // "daily for more than two hours".
      { id: 'pifp-B', label: 'Recurring daily for >2 hours/day for >3 months', description: 'ICHD-3 13.12 B: recurring daily for >2 hours/day for >3 months.', evaluate: s => has(s, 'pifp-daily-gt2h-gt3mo'), contributingChips: ['pifp-daily-gt2h-gt3mo'], role: 'suppress-gate' },
      // pifp-C: suppress-gate (DROP). BOTH sub-items required (C.1 AND C.2), one
      // composite criterion mirroring the on-C idiom and the ICHD lettering.
      { id: 'pifp-C', label: 'Poorly localized, not following a peripheral nerve, and dull, aching, or nagging', description: 'ICHD-3 13.12 C: pain has both of: 1) poorly localized, and not following the distribution of a peripheral nerve, 2) dull, aching or nagging quality.', evaluate: s => has(s, 'pifp-poorly-localized-non-nerve') && has(s, 'qual-dull-aching-nagging'), contributingChips: ['pifp-poorly-localized-non-nerve', 'qual-dull-aching-nagging'], role: 'suppress-gate' },
      // pifp-D: suppress-gate (DROP). Workup gate, not a symptom. A genuinely
      // ABNORMAL examination never reaches banding: rf-neuro-deficit short-circuits
      // the pathway to secondary workup at the SNNOOP10 gate. Absence of this chip
      // therefore means "not established", which is a DROP, not an EMIT.
      { id: 'pifp-D', label: 'Clinical neurological examination is normal', description: 'ICHD-3 13.12 D: clinical neurological examination is normal. Psychophysical or neurophysiological sensory testing may be abnormal without invalidating the diagnosis (Comment, p. 179); the clinical examination is the only normal-findings criterion.', evaluate: s => has(s, 'exam-neuro-normal'), contributingChips: ['exam-neuro-normal'], role: 'suppress-gate' },
      // pifp-E: suppress-gate (DROP). Workup gate. Hard gate deliberately: surfacing
      // 13.12 before a dental cause is excluded is the failure mode this criterion
      // exists to prevent. The requirement still reaches the clinician when the
      // phenotype is hidden, via the q-pifp option label.
      { id: 'pifp-E', label: 'A dental cause has been excluded by appropriate investigations', description: 'ICHD-3 13.12 E: a dental cause has been excluded by appropriate investigations.', evaluate: s => has(s, 'pifp-dental-cause-excluded'), contributingChips: ['pifp-dental-cause-excluded'], role: 'suppress-gate' },
    ],
  },
```

`criteriaTotal` = 5, all suppress-gates, binary full-or-hidden. Consistent with the engine-wide pattern of encoding every lettered criterion except the closing "not better accounted for" exclusion (TN 3 of ICHD's 4; ON 4 of ICHD's 5; PIFP 5 of ICHD's 6).

---

## S4. QUESTION FLOW — `src/data/headacheQuestions.ts`

### S4.1 New chips — `ChipId` union additions and labels

Chip labels are a LIVE surface: they render as `contributingChipLabels` in `metCriteria` ("Based on your selection: …"). Per BI-3, **no `teachWhenSelected` on any new chip** — that surface is dormant in V4 and prose there reads as reviewed while reaching no user.

`ChipId` union additions:
```typescript
  // §13.2.1 Glossopharyngeal neuralgia
  | 'loc-glossopharyngeal-territory' | 'dur-few-sec-to-2min' | 'trigger-swallow-cough-talk-yawn'
  // §13.12 Persistent idiopathic facial pain
  | 'pifp-daily-gt2h-gt3mo' | 'pifp-poorly-localized-non-nerve' | 'qual-dull-aching-nagging'
  | 'exam-neuro-normal' | 'pifp-dental-cause-excluded'
```

Chip labels (recommended home: a new `facial-pain` group per architect rec 10, `label: 'Facial and cranial-neuralgia detail'`, `eyebrow: 'ICHD-3 chapter 13 separates facial pain by nerve territory, attack length, trigger, and quality.'`; group membership is display-inert while the groups are dormant):

| ChipId | Exact label | Provenance |
|---|---|---|
| `loc-glossopharyngeal-territory` | `Pain in the throat, back of the tongue, tonsil area, ear, or under the angle of the jaw` | 13.2.1 A + Note 1 (packet §2.1, p. 171 / p. 172) |
| `dur-few-sec-to-2min` | `Each attack lasts from a few seconds up to 2 minutes` | 13.2.1 B.1 (packet §2.1, p. 171) |
| `trigger-swallow-cough-talk-yawn` | `Attacks triggered by swallowing, coughing, talking, or yawning` | 13.2.1 B.4 (packet §2.1, p. 171) |
| `pifp-daily-gt2h-gt3mo` | `Facial or mouth pain daily, more than 2 hours a day, for more than 3 months` | 13.12 B (packet §3.1, p. 178) |
| `pifp-poorly-localized-non-nerve` | `Pain is poorly localized and does not follow the territory of a single nerve` | 13.12 C.1 (packet §3.1, p. 178) |
| `qual-dull-aching-nagging` | `Dull, aching, or nagging quality` | 13.12 C.2 (packet §3.1, p. 178) |
| `exam-neuro-normal` | `Neurological examination is normal` | 13.12 D (packet §3.1, p. 178) |
| `pifp-dental-cause-excluded` | `A dental cause has been excluded by appropriate investigation` | 13.12 E (packet §3.1, p. 178) |

**Chip-reuse rule comment to place above the `ChipId` union** (architect condition 5, so it is not re-litigated a fourth time):
```typescript
// CHIP-REUSE RULE. Reuse a chip only when the chip's LABEL, which is the thing the
// clinician actually affirms, is logically equivalent to the criterion's
// requirement. A label WIDER than the criterion manufactures false positives; a
// label NARROWER than the criterion manufactures false negatives (the sev-very-
// severe defect, medical review 2026-09-07 U1). Where no single chip is equivalent,
// use a disjunction of chips that jointly cover the criterion, or mint. Minting a
// duration chip per criterion window is the established convention here, not the
// exception: eight overlapping dur-* chips already coexist.
```

### S4.2 New `q-location` option (core screen 4) — the anatomical-disjointness problem

`q-location` is single-select and must stay a clinically disjoint partition. The collision is real: **ICHD-3 places "angle of the lower jaw" in glossopharyngeal territory (13.2.1 Note 1, p. 172) while the existing `loc-face` answer says "cheek, jaw, or upper lip".** The word "jaw" therefore appears in both labels and the BC-6 drift guard cannot be a naive keyword regex on "jaw".

**Recommendation: leave `loc-face` byte-identical and place the ambiguous anchor on the new option, subordinated to unambiguous ones.** Rationale: (a) `loc-face` is a reviewed, shipped string on a core screen; changing it is a second retroactive edit for no safety gain; (b) the disjointness that matters clinically is throat/tongue-base/tonsil/ear versus cheek/upper lip, and the new label owns all four of the former; (c) a GPN patient reaches the ambiguous zone almost never in isolation, because the ICHD description leads with ear, tongue base and tonsillar fossa, all named in the new label.

**Exact option, inserted after `loc-face`:**
```typescript
      // A glossopharyngeal presentation previously had no answer on this screen:
      // throat, tongue-base and ear pain had to be filed under "one side" or "in
      // the face", and 13.2.1 was undiagnosable. This is the reachability defect
      // fixed for facial pain on 2026-09-07, reproduced one chapter over.
      // [PAIR - preserve both] 13.2.1 criterion A requires unilaterality, so this
      // answer contributes loc-unilateral alongside the territory chip, mirroring
      // loc-orbital and loc-face (architect 2026-09-08, condition 3).
      // [PAIR - label constraint] q-location is a clinically DISJOINT single-select
      // partition. ICHD-3 13.2.1 Note 1 puts the ANGLE of the lower jaw in
      // glossopharyngeal territory while 13.1.1 covers the cheek and jaw surface, so
      // "jaw" appears in BOTH this label and loc-face. The drift guard must assert
      // the partition by anatomical keyword, NOT by the word "jaw": this label owns
      // throat / tongue / tonsil / ear; loc-face owns cheek / upper lip; neither may
      // mention the eye or orbit (BC-6, which protects loc-orbital-temporal).
      // This answer must NOT contribute loc-facial-region: that chip's own label
      // reads "cheek, jaw, or upper lip", and contributing it from a throat-and-ear
      // answer would make the chip label lie about what the clinician affirmed.
      { id: 'loc-throat-ear', label: 'In the throat, back of the tongue, tonsil area, or ear, including under the angle of the jaw', chips: ['loc-unilateral', 'loc-glossopharyngeal-territory'] },
```

**Retroactive effect to name in the rollback note (architect condition 1):** an angle-of-the-jaw or ear presentation that today answers "In the face: cheek, jaw, or upper lip" will, after this lands, be steered to the new answer, changing its chip set from `loc-unilateral + loc-facial-region` to `loc-unilateral + loc-glossopharyngeal-territory`, and therefore changing which branches fire and which phenotypes are reachable for that presentation.

### S4.3 `b-glossopharyngeal`

**`fires()` recommendation: `has(s, 'loc-glossopharyngeal-territory')` alone.**

Justification: the branch's substrate is the territory, and the territory now has a real, reachable core-screen answer (architect condition 3 required exactly this), so a branch-only entry is not needed. Widening to `|| loc-facial-region` was considered and rejected: it would put three branch screens in front of every facial-pain patient (`b-trigeminal`, `b-glossopharyngeal`, `b-pifp`) and blur the sibling-predicate discipline the architect required in condition 2. Residual false-negative risk (a pure angle-of-jaw presentation filed under `loc-face`) is recorded in S9 item 6 with a reachability walk that exercises it both ways.

```typescript
  // Glossopharyngeal detail — fires on the §13.2.1 territory chip alone; screens
  // for §13.2.1 glossopharyngeal neuralgia. SIBLING of b-trigeminal and b-pifp,
  // not a co-tenant: share a screen ONLY when two phenotypes have identical
  // fires() (the q-tac-detail precedent); otherwise siblings (the b-occipital /
  // b-stabbing / b-trigeminal precedent). Architect 2026-09-08, condition 2.
  // Do NOT widen b-trigeminal's predicate and do NOT add GPN options to
  // q-trigeminal: a throat-territory patient ticking honestly on a co-tenanted
  // screen can satisfy tn-A, tn-B and tn-C together, because loc-trigeminal-
  // distribution's label says "jaw", tn-trigger's label says "talking", and
  // 13.2.1's own territory note says "angle of the lower jaw" while its trigger
  // criterion says "talking".
  {
    id: 'b-glossopharyngeal',
    fires: (s) => has(s, 'loc-glossopharyngeal-territory'),
    question: {
      id: 'q-glossopharyngeal',
      screen: 8,
      eyebrow: 'Throat and ear pain detail',
      prompt: 'If this is brief, shock-like pain in the throat, tongue base, or ear, answer these (glossopharyngeal neuralgia screen):',
      select: 'multi',
      claimId: 'clinic-headache-gpn-vagal-safety',
      teach: 'ICHD-3 13.2.1 permits radiation to the eye, nose, chin, or shoulder, so spread beyond the nerve does not rule it out; 13.1.1 trigeminal neuralgia does not permit it. In rare cases attacks are accompanied by cough, hoarseness, syncope, or bradycardia, and ICHD-3 records the term vagoglossopharyngeal neuralgia for pain accompanied by asystole, convulsions, and syncope, so ask about blackouts with attacks. Pain can be severe enough for patients to lose weight. Major sensory changes or a reduced or missing gag reflex should prompt aetiological investigations; mild sensory deficits do not invalidate the diagnosis.',
      options: [
        // Mirrors tn-shock: the core q-quality screen is single-select, so a patient
        // who answered "throbbing" or "pressing" has no other route to gpn-B.3.
        // Contributes ONLY qual-electric-shock-shooting, exactly as tn-shock does,
        // so it does not additionally open b-occipital and b-stabbing.
        { id: 'gpn-shock', label: 'The pain is electric-shock-like or shooting', chips: ['qual-electric-shock-shooting'] },
        { id: 'gpn-brief', label: 'Each attack lasts from a few seconds up to 2 minutes', chips: ['dur-few-sec-to-2min'] },
        { id: 'gpn-trigger', label: 'Attacks are triggered by swallowing, coughing, talking, or yawning', chips: ['trigger-swallow-cough-talk-yawn'] },
      ],
    },
  },
```

No territory-confirm option: the branch fires on the territory chip, so it is guaranteed present and a re-ask would be pure noise. No severity re-ask: `tn-B` rides the core severity screen and `gpn-B` mirrors it.

### S4.4 `b-pifp`

**`fires()` recommendation: `has(s, 'loc-facial-region') || has(s, 'loc-glossopharyngeal-territory')`.**

Justification: ICHD-3 13.12 A is "Facial **and/or oral** pain", so both site chips are legitimate entries and the disjunction matches criterion A exactly. Firing on quality was explicitly rejected: PIFP's quality is dull/aching/nagging, the opposite of TN's, and `qual-pressing-tightening` (which a PIFP patient is forced into on the single-select core quality screen) belongs to TTH; using it as a PIFP trigger would be a wider-label false-positive path. The distinguishing quality chip is minted and lives inside this branch, so it cannot gate entry to it. Cost accepted: one extra screen for facial-pain presentations. Clinically justified, because persistent idiopathic facial pain is the classic missed diagnosis in this space and the pathway currently has no route to it at all.

```typescript
  // Persistent facial pain detail — fires on either site chip, matching ICHD-3
  // 13.12 A ("facial and/or oral pain"); screens for §13.12. SIBLING of
  // b-trigeminal and b-glossopharyngeal (architect 2026-09-08, condition 2).
  // Deliberately does NOT fire on a quality chip: 13.12's quality is dull, aching
  // or nagging, and the core q-quality screen's nearest answer (pressing or
  // tightening) belongs to §2 TTH. The minted qual-dull-aching-nagging chip lives
  // on this screen rather than the core one, so the core single-select partition
  // is untouched.
  {
    id: 'b-pifp',
    fires: (s) => has(s, 'loc-facial-region') || has(s, 'loc-glossopharyngeal-territory'),
    question: {
      id: 'q-pifp',
      screen: 8,
      eyebrow: 'Persistent facial pain detail',
      prompt: 'If this is constant, dull facial or mouth pain rather than brief shocks, answer these (persistent idiopathic facial pain screen):',
      select: 'multi',
      claimId: 'clinic-headache-ichd3-pifp-criteria',
      teach: 'ICHD-3 13.12 requires a normal clinical neurological examination and a dental cause excluded by appropriate investigations. Sharp exacerbations are allowed, and over time the pain may spread to a wider area of the craniocervical region. Psychophysical or neurophysiological tests may demonstrate sensory abnormalities; the clinical examination is the only normal-findings criterion. Burning pain felt superficially in the oral mucosa is 13.11 burning mouth syndrome, which shares the same daily pattern word for word. Triggered shock-like paroxysms on a background ache within a nerve territory are 13.1.1 trigeminal neuralgia with concomitant continuous pain.',
      options: [
        { id: 'pifp-daily', label: 'The pain recurs daily, more than 2 hours a day, for more than 3 months', chips: ['pifp-daily-gt2h-gt3mo'] },
        { id: 'pifp-poorly-loc', label: 'The pain is poorly localized and does not follow the territory of a single nerve', chips: ['pifp-poorly-localized-non-nerve'] },
        { id: 'pifp-quality', label: 'The pain is dull, aching, or nagging', chips: ['qual-dull-aching-nagging'] },
        { id: 'pifp-exam', label: 'The neurological examination is normal', chips: ['exam-neuro-normal'] },
        { id: 'pifp-dental', label: 'A dental cause has been excluded by appropriate investigation', chips: ['pifp-dental-cause-excluded'] },
      ],
    },
  },
```

---

## S5. GPN SAFETY STEER — architect condition 9

### Surface ruling

| Surface | Renders in V4? | Verdict |
|---|---|---|
| `Phenotype.teachPearl` | **NO** (finding F1) | Rejected as sole home. Author it for the record; it reaches no clinician today. |
| `Phenotype.pitfalls` | **NO** (finding F1) | Rejected. Not used in this spec at all. |
| `Criterion.description` | **NO** (finding F2) | Rejected as a carrier. |
| `Subtype.note` | Yes (amber, result row) | Unavailable: GPN aetiology subtypes are deferred, so no `Subtype` object exists. |
| `SafetyStrip` | Yes, always, globally | **Recommend against touching.** It is phenotype-independent and shows on every headache result; GPN-specific vagal content there would reach every migraine and TTH patient and dilute a strip whose entire value is that it says one thing. |
| Management card row | Yes, but behind the opt-in "Show management" disclosure, only for `MANAGED` ids in top-2 | **Secondary home.** Good for the clinician who has landed on GPN. Collapsed clinical content has produced a false verification result on this codebase before, so it cannot be the only home. |
| **`HeadacheQuestion.teach`** | **Yes, unconditionally, the moment the branch fires, before any answer** | **PRIMARY home.** |

**Recommendation: the primary surface is the `q-glossopharyngeal` `teach` string, claim-tagged via the question's `claimId` field; the management card carries a fuller "Safety and workup" restatement as the secondary surface.**

Three reasons the teach string is right: it renders unconditionally and does not require GPN to reach top-2 or the clinician to open a disclosure; it reaches the clinician at the exact moment they are considering GPN, which is when the syncope question should be asked, not after the differential is settled; and it is the surface the round-2 clinical review already validated for exactly this job (the BC-7 vascular-mimic caution lives there for the same reason).

### Clinical call on syncope and bradycardia

**I do not author a monitoring, admission, telemetry, or cardiology-referral instruction.** No held document supports one. The sources describe an association (ICHD-3 p. 172: "In rare cases, attacks of pain are associated with vagal symptoms such as cough, hoarseness, syncope and/or bradycardia"; the vagoglossopharyngeal variant "when pain is accompanied by asystole, convulsions and syncope"; Nahas p. 480 corroborating) and issue exactly one directive, which is investigative ("Major changes or a reduced/missing gag reflex should prompt aetiological investigations"). Stepping from "asystole can accompany attacks" to "therefore monitor or pace" is a treatment recommendation with no source, and inventing one here would repeat, in mirror image, the defect that put "airway protection mandatory" into the registry.

**What I do author is a history-taking instruction: "ask about blackouts with attacks."** That is the same class of instruction as the already-shipped "Confirm with patient that they can pinpoint the exact day or hour of onset" (`ndph-B`) and "Exclude TIA and seizure before calling this aura" (BC-7 teach), and it is fully bounded by the sourced statement that the association exists. It converts a recognition problem into an action a resident can take, without asserting management. The word "airway" appears nowhere.

**Final strings.** Primary (already given in S4.3, repeated for the reviewer's convenience):

> ICHD-3 13.2.1 permits radiation to the eye, nose, chin, or shoulder, so spread beyond the nerve does not rule it out; 13.1.1 trigeminal neuralgia does not permit it. In rare cases attacks are accompanied by cough, hoarseness, syncope, or bradycardia, and ICHD-3 records the term vagoglossopharyngeal neuralgia for pain accompanied by asystole, convulsions, and syncope, so ask about blackouts with attacks. Pain can be severe enough for patients to lose weight. Major sensory changes or a reduced or missing gag reflex should prompt aetiological investigations; mild sensory deficits do not invalidate the diagnosis.

*(Provenance: sentence 1, packet §6.1 radiation row + §2.1 Comment p. 172 vs 13.1.1 A p. 166. Sentence 2, packet §5 rows 1-2 and §2.1 Comment p. 172. Sentence 3, packet §5 row 3, p. 172. Sentence 4, packet §5 rows 4-5, p. 172. "ask about blackouts with attacks" is JUDGMENT: a history-taking instruction bounded by the stated association, not a management recommendation.)*

Secondary: the "Safety and workup" card in S6.

---

## S6. GPN MANAGEMENT CARD

`MANAGED` gains `'glossopharyngeal-neuralgia'` (13 of 18 engine phenotypes). `'persistent-idiopathic-facial-pain'` is deliberately excluded, which puts one new phenotype on each side of the boundary and is why architect condition 7(b) asks for a both-directions invariant test.

**Exact `switch` case, inserted after `case 'trigeminal-neuralgia':`**

```jsx
    case 'glossopharyngeal-neuralgia':
      return (
        <div className="space-y-3">
          <div data-claim="clinic-headache-gpn-management" className={CARD}>
            <SectionHeader>Treatment</SectionHeader>
            <dl className={DL}>
              <Row label="Evidence" value="No class or level of evidence is shown because none has been assigned. ICHD-3 states the drug option below as a comment, and the Continuum cranial-neuralgia review cites only a narrative review for glossopharyngeal neuralgia." />
              <Row label="Pharmacotherapy (ICHD-3 13.2.1)" value="Usually responsive, at least initially, to pharmacotherapy, especially carbamazepine or oxcarbazepine." />
              <Row label="Local anaesthetic (ICHD-3 13.2.1)" value="Application of local anaesthetic to the tonsil and pharyngeal wall has been suggested to prevent attacks for a few hours. This is a comment in the classification, not a diagnostic test: unlike occipital neuralgia, block response is not a criterion here." />
              <Row label="Relation to trigeminal neuralgia (Nahas 2024)" value="Treatment overlaps substantially with trigeminal neuralgia." />
            </dl>
          </div>
          <div data-claim="clinic-headache-gpn-vagal-safety" className={CARD}>
            <SectionHeader>Safety and workup</SectionHeader>
            <dl className={DL}>
              <Row label="Vagal features" value="In rare cases attacks are accompanied by cough, hoarseness, syncope, or bradycardia. ICHD-3 records the term vagoglossopharyngeal neuralgia for pain accompanied by asystole, convulsions, and syncope. Ask about blackouts with attacks." />
              <Row label="Nutrition" value="Pain can be severe enough for patients to lose weight. Check weight and oral intake when swallowing is a trigger." />
              <Row label="Examination" value="Clinical examination usually shows no sensory change. Mild sensory deficits do not invalidate the diagnosis, but major changes or a reduced or missing gag reflex should prompt aetiological investigations." />
              <Row label="Secondary causes (Nahas 2024)" value="Even without red flags, neuroimaging is usually warranted and may need repeating with dedicated techniques before an underlying problem is found. Pain can be referred into a cranial-nerve territory by soft-tissue or bony pathology of the head and neck." />
              <Row label="Aetiology (ICHD-3 13.2.1.1 to 13.2.1.3)" value="Classical: MRI or surgery shows neurovascular compression of the glossopharyngeal nerve root. Secondary: an underlying disease is demonstrated, reported causes being neck trauma, multiple sclerosis, tonsillar or regional tumours, cerebellopontine-angle tumours, and Arnold-Chiari malformation. Idiopathic: investigations find neither." />
            </dl>
          </div>
        </div>
      );
```

**Provenance, row by row.** Treatment card: row 1 is a statement about the two cited documents themselves and is verifiable inside them (packet §8c records the wider negative, which is carried in the claim description rather than rendered). Row 2, ICHD-3 p. 172 Comment, verbatim clause. Row 3, ICHD-3 p. 172 Comment, verbatim clause; the second sentence is the packet §6.1 trap-3 discriminator against 13.4 criterion D. Row 4, Nahas p. 480, verbatim. Safety card: row 1, ICHD-3 p. 172 Comment (packet §5 rows 1-2) plus the S5 history-taking instruction. Row 2, ICHD-3 p. 172 (packet §5 row 3); the second sentence is JUDGMENT, a monitoring action bounded by the stated consequence. Row 3, ICHD-3 p. 172 (packet §5 rows 4-5), verbatim directive preserved including "should prompt". Row 4, Nahas p. 486 Conclusion, verbatim. Row 5, ICHD-3 p. 172, criteria for 13.2.1.1/.2/.3 plus Note 1 causes list; **note the deliberate absence of "with morphological change"** on the classical row, per the packet's encoding trap.

**Aetiology row placement note for the reviewer:** it renders on the safety-and-workup card, not as a separate card, and it is what makes the `13.2.1.1/.2/.3` entries in the `ichd3-2018` `section` field load-bearing rather than decorative. It also serves the clinician the deferred subtype resolver cannot: the classification is stated even though the engine does not compute it.

---

## S7. CLAIMS — `src/lib/citations/claims.ts`

### New entries

```typescript
  // ─── ICHD-3 §13.2.1 Glossopharyngeal neuralgia — added 2026-09-08 ──────────
  // Evidence packet docs/evidence-packets/2026-09-08-ichd3-13-2-13-12-facial-pain.md.
  // NUMBERING: 13.2.1, never bare 13.2 (13.2 is a heading with no criteria).
  'clinic-headache-ichd3-glossopharyngeal-neuralgia-criteria': {
    id: 'clinic-headache-ichd3-glossopharyngeal-neuralgia-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'ICHD-3 13.2.1 Glossopharyngeal neuralgia: recurring paroxysms of unilateral pain in the glossopharyngeal distribution (posterior part of the tongue, tonsillar fossa, pharynx or angle of the lower jaw and/or the ear, Note 1), with ALL of: a few seconds to 2 minutes, severe intensity, electric shock-like / shooting / stabbing / sharp quality, and precipitation by swallowing, coughing, talking or yawning. Unlike 13.1.1, radiation beyond the nerve is PERMITTED (the pain may involve the eye, nose, chin or shoulder), so a no-radiation gate must not be applied. It can occur together with 13.1.1 Trigeminal neuralgia. Aetiology (13.2.1.1 classical: neurovascular compression of the nerve root demonstrated on MRI or at surgery, with NO morphological-change qualifier, unlike 13.1.1.1; 13.2.1.2 secondary; 13.2.1.3 idiopathic) is investigation-determined and is deferred to the subtype-hierarchy layer. Neither pharmacotherapy response nor local-anaesthetic response is an ICHD-3 criterion; both are Comments (p. 172). 13.2.2 Painful glossopharyngeal neuropathy is a separate sibling entity and is out of scope.',
  },

  'clinic-headache-gpn-management': {
    id: 'clinic-headache-gpn-management',
    citation_ids: ['ichd3-2018', 'nahas-2024-continuum-cranial-neuralgias'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'GPN treatment card, three sourced rows plus an evidence-framing row. Pharmacotherapy row is the ICHD-3 13.2.1 Comment (p. 172) verbatim in substance: usually responsive, at least initially, to pharmacotherapy, especially carbamazepine or oxcarbazepine. Local-anaesthetic row is the same Comment: application to the tonsil and pharyngeal wall has been SUGGESTED to prevent attacks for a few hours; the card states explicitly that this is not a diagnostic test, because block response IS criterion D in 13.4 and only a Comment in 13.2.1. Overlap row is Nahas p. 480 verbatim ("Treatment overlaps substantially with trigeminal neuralgia"), which is the ENTIRE GPN treatment content of that article. NO grade is shown: evidence packet 2026-09-08 §8c records that no major-society guideline (AAN, EAN/EFNS, AHS) addresses glossopharyngeal neuralgia, that Nahas cites only a narrative review for it (Park and Ahn, J Korean Neurosurg Soc 2023;66(1):12-23), and §8d records no RCT, meta-analysis or Cochrane review. Explicitly NOT carried: the previously registered "Glossopharyngeal neuralgia: carbamazepine; airway protection mandatory if swallowing affected" text, neither half of which appears anywhere in the Nahas article; the airway directive has no source in any held document and must not be reinstated or paraphrased.',
  },

  'clinic-headache-gpn-vagal-safety': {
    id: 'clinic-headache-gpn-vagal-safety',
    citation_ids: ['ichd3-2018', 'nahas-2024-continuum-cranial-neuralgias'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }, DATA_SURFACE],
    description: 'GPN safety-and-workup content, rendered on two surfaces: the q-glossopharyngeal teach string (structured-data claimId, the surface that renders unconditionally when the branch fires) and the "Safety and workup" management card. All content is ICHD-3 13.2.1 Comments, p. 172, corroborated for the vagal items by Nahas p. 480. Vagal row: in rare cases attacks are associated with cough, hoarseness, syncope and/or bradycardia; ICHD-3 records the term vagoglossopharyngeal neuralgia for pain accompanied by asystole, convulsions and syncope. Nutrition row: pain can be severe enough for patients to lose weight. Examination row: clinical examination usually fails to show sensory changes; mild sensory deficits do NOT invalidate the diagnosis; major changes or a reduced or missing gag reflex SHOULD PROMPT aetiological investigations (the source directive, preserved at its own strength). Secondary-cause row: Nahas p. 486 Conclusion verbatim. Aetiology row: ICHD-3 13.2.1.1/.2/.3 criteria and the 13.2.1.2 Note 1 causes list. "Ask about blackouts with attacks" and "check weight and oral intake" are history-taking and monitoring instructions bounded by the stated associations; NO monitoring, telemetry, admission, pacing or referral recommendation is made, because no held source supports one. NO airway or aspiration content appears: that directive was unsourced and is removed from the registry in the same change.',
  },

  // ─── ICHD-3 §13.12 Persistent idiopathic facial pain — added 2026-09-08 ────
  'clinic-headache-ichd3-pifp-criteria': {
    id: 'clinic-headache-ichd3-pifp-criteria',
    citation_ids: ['ichd3-2018'],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }, DATA_SURFACE],
    description: 'ICHD-3 13.12 Persistent idiopathic facial pain (previously used term: atypical facial pain): facial and/or oral pain (A) recurring daily for >2 hours/day for >3 months (B), BOTH poorly localized and not following the distribution of a peripheral nerve AND dull, aching or nagging in quality (C), with a normal clinical neurological examination (D) and a dental cause excluded by appropriate investigations (E). Criteria run A-F; F is the standard closing exclusion and is not encoded. There is NO "investigations unremarkable" criterion: the only investigation criterion is E, and the Comments (p. 179) state that psychophysical or neurophysiological tests MAY demonstrate sensory abnormalities. Sharp exacerbations are allowed, the pain is aggravated by stress, and it may spread to a wider area of the craniocervical region over time. No subforms exist: the atypical-odontalgia Comment states the candidate subtypes have not been sufficiently studied to propose criteria, so none may be invented. Discriminators carried on the q-pifp teach string: 13.11 Burning mouth syndrome shares criterion B word for word and separates on quality plus depth (burning, felt superficially in the oral mucosa); 13.1.1.1.2 / 13.1.1.3.2 Trigeminal neuralgia with concomitant continuous pain requires the paroxysms and keeps the continuous pain nerve-territorial, whereas 13.12 has no paroxysm requirement and is explicitly non-territorial. Facial pain within six months of a stroke routes to 13.13.2 Central post-stroke pain. No management card: Nahas 2024 does not cover PIFP at all (verified negative, evidence packet §4.4) and no PIFP-specific source is held.',
  },
```

### Amended entries

`clinic-headache-tn-management` — full replacement given in **S1.d**.
`clinic-headache-on-management` — `citation_ids` unchanged; full replacement description given in **S1.e**.

### `HiddenClaimMarkers` additions — `HeadacheResultV4.tsx`

Two spans, inserted after `clinic-headache-ichd3-occipital-neuralgia-criteria` and `clinic-headache-ichd3-hypnic-criteria` respectively (order follows the existing grouping, criteria first then subtype/other):

```jsx
    <span data-claim="clinic-headache-ichd3-glossopharyngeal-neuralgia-criteria" />
    <span data-claim="clinic-headache-ichd3-pifp-criteria" />
```

Update the block comment's count from "the 8 ICHD-3 criteria claims" to the corrected figure. If architect condition 7(c) lands in this batch (`Record<PhenotypeId, string | null>` rendered by `Object.entries(...).map(...)`), the two entries become `'glossopharyngeal-neuralgia': 'clinic-headache-ichd3-glossopharyngeal-neuralgia-criteria'` and `'persistent-idiopathic-facial-pain': 'clinic-headache-ichd3-pifp-criteria'`, and omission becomes a `tsc` failure instead of a reviewer catch.

The three management/safety claims need no hidden marker: they carry `data-claim` attributes in `HeadacheManagement.tsx` source, which the scanner reads statically. `clinic-headache-gpn-vagal-safety` additionally has a `claimId` field on `q-glossopharyngeal`, and `clinic-headache-ichd3-pifp-criteria` on `q-pifp`, both structured-data surfaces in `headacheQuestions.ts`, mirroring the `clinic-headache-ichd3-aura-subtypes` precedent.

---

## S8. DISCRIMINATOR AND ROUTING NOTES FOR THE IMPLEMENTER'S TESTS

### W1 (highest value) — GPN must not produce a full TN match

**Persona:** pain under the angle of the jaw radiating to the ear, brought on by talking and swallowing, severe, shock-like, each jab a few seconds to under two minutes.

**Walk:** `q-onset` recurrent · `q-frequency` 15+ · `q-duration` under 15 minutes · `q-attack-count` 10 or more · `q-chronicity` 3 months or longer · `q-quality` "Electric shock-like or shooting" → `qual-electric-shock-shooting` + `qual-sharp-stabbing` · **`q-location` "In the throat, back of the tongue, tonsil area, or ear, including under the angle of the jaw"** → `loc-unilateral` + `loc-glossopharyngeal-territory` · `q-severity` Severe · `q-activity` no effect · `q-associated` none.
Branches fired: `b-occipital`, `b-stabbing`, `b-trigeminal` (all on `qual-sharp-stabbing`), `b-glossopharyngeal`, `b-pifp`. In `q-glossopharyngeal` tick duration + trigger. **In `q-trigeminal` tick nothing.**

**Assertions:** `glossopharyngeal-neuralgia` is `full`, 2 of 2. `trigeminal-neuralgia` is **absent from the output array entirely** (not merely non-full): `tn-A` is a suppress-gate in the DROP set and fails. `occipital-neuralgia` absent (`on-A` fails). `primary-stabbing-headache` absent (`psh-A` fails). `persistent-idiopathic-facial-pain` absent (`pifp-B` fails).

**The chip whose absence keeps TN out is `loc-trigeminal-distribution`.** It is contributed from exactly one place in the entire question config: the `tn-distribution` option on `q-trigeminal`. Nothing on the GPN path contributes it. The new `q-location` option contributes `loc-unilateral` + `loc-glossopharyngeal-territory`; `q-glossopharyngeal` contributes only quality, duration and trigger chips.

**Add a config-level invariant alongside the walk:** assert that across `CORE_QUESTIONS` and `CONDITIONAL_BRANCHES`, the set of answer-option ids contributing `loc-trigeminal-distribution` is exactly `['tn-distribution']`. This turns W1's premise into a guard that survives future option edits, which a persona walk alone does not.

### W2 — GPN positive reachability
Same walk as W1. Assert `matchStrength === 'full'`, `criteriaMet === 2`, `criteriaTotal === 2`, and that GPN lands in the Leading band.

### W3 — PIFP positive reachability, including the continuous-answer trap
**Persona:** constant dull ache across the right cheek and upper jaw for a year, several hours every day, no shocks, normal exam, dentist has investigated and found nothing.
**Walk:** `q-onset` **"Continuous, never fully goes away"** → `dur-continuous` (this is the point of the test) · `q-frequency` 15+ · `q-chronicity` 3 months or longer · `q-quality` pressing · `q-location` "In the face: cheek, jaw, or upper lip" → `loc-unilateral` + `loc-facial-region` · `q-severity` moderate · then tick all five `q-pifp` options; tick nothing in `q-trigeminal`.
**Assertions:** PIFP is `full`, 5 of 5, and **is present despite `dur-continuous`** (regression guard for the `episodicPhenotypes` membership decision). `trigeminal-neuralgia` absent. Migraine, TTH, cluster, PH and SUNCT are suppressed by `dur-continuous` as they already are, i.e. this walk changes nothing about their existing behaviour.

### W4 — TN regression
Re-run the existing TN reachability walk unchanged and assert byte-identical output. `loc-face` is untouched by this batch; this proves it.

### W5 — `q-location` disjointness drift guard (extends the BC-6 guard)
Assert: exactly one option contributes `loc-orbital-temporal`; exactly one contributes `loc-glossopharyngeal-territory`; exactly one contributes `loc-facial-region`; every option contributing a territory chip also contributes `loc-unilateral` except `loc-one` and `loc-both`; the `loc-face` label matches `/cheek/i` and matches none of `/\bthroat\b|\btongue\b|\btonsil\b|\bear\b/i`; the `loc-throat-ear` label matches all of `/throat/i`, `/tongue/i`, `/ear/i` and matches neither `/cheek/i` nor `/upper lip/i`; **neither** label matches `/\beye\b|orbit/i`. Use word boundaries: a naive `/ear/` matches nothing problematic here today, but "area" and "near" are one edit away.

### W6 — structural guards (architect condition 7)
`CHAPTER_ORDER` is a permutation of `HEADACHE_PHENOTYPES.map(p => p.id)`, with both new ids present. `MANAGED` both-directions: `glossopharyngeal-neuralgia` renders a non-null management body; `persistent-idiopathic-facial-pain` renders `null`.

### W7 — PIFP-leads amber note (architect rec 12)
PIFP top-ranked with a manageable runner-up: `showLeadingGapNote` returns true and the note names both phenotypes. Exercises the tested `manageable.length > 0` path with a phenotype that is deliberately outside `MANAGED`.

### Discriminator notes authored for teach strings (not new claims)
**PIFP vs 13.11 Burning mouth syndrome:** criterion B is word-identical between the two entities. The entire separation is quality plus depth: PIFP C is "poorly localized, and not following the distribution of a peripheral nerve" + "dull, aching or nagging"; BMS C is "burning quality" + "felt superficially in the oral mucosa" (packet §3.2, §6.3). BMS is not encoded in this engine, so the discrimination is educational only and lives on the `q-pifp` teach string.
**PIFP vs TN with concomitant continuous pain:** 13.1.1.1.2 / 13.1.1.3.2 require criterion A of the parent, so the paroxysms are mandatory and the continuous pain is "in the affected trigeminal distribution". PIFP has no paroxysm requirement and is explicitly non-territorial. A patient with shock-like triggered paroxysms plus a background ache is TN with concomitant continuous pain, not 13.12 (packet §6.3).
**PIFP vs 13.13.2 Central post-stroke pain:** facial pain within six months of a stroke routes to 13.13.2. Criterion D already excludes most such presentations, and `rf-neuro-deficit` short-circuits the pathway before banding. Carried in the claim description, not rendered.

---

## S9. OPEN ITEMS FOR THE CLINICAL-REVIEWER PRE-GATE

Rule on each item individually.

1. **`teachPearl` and `pitfalls` are dormant surfaces (finding F1).** I authored both new `teachPearl` strings because the `Phenotype` shape expects them and they are correct for the record, but neither reaches a clinician today. Rule on whether that is acceptable, and whether a TASKS.md item should be opened to either wire `teachPearl` into `PhenotypeMatch` or delete the field. The same finding retroactively affects every existing `teachPearl`, including TN's, which still carries the BC-4 secondary-TN red-flag list that was removed from the rendered card.
2. **`Criterion.description` is dormant (finding F2).** No safety content is placed there in this spec. Confirm.
3. **`ichd3-2018` `last_reviewed` HOLDS at 2026-05-25** while `nahas-2024-…` REFRESHES to 2026-09-08. Rule on the asymmetry and on my partial §13.6 step-3 attestation (19 dependent claims verified by direct read; three in `HiddenClaimMarkers` not opened; exact count to be derived mechanically at implementation).
4. **`pifp-B` uses a single minted conjunction chip and does NOT reuse `pattern-ge-3-months`.** This is a deliberate deviation from architect ruling (a), which said reuse. Grounds: half-satisfied-conjunction risk (packet §9.2) and referent mismatch (the core chronicity screen asks about the headache pattern generally, not about this facial pain's daily duration). The architect flagged criterion-faithfulness as a clinical judgment wearing a structural costume and routed it here. **Rule.**
5. **`gpn-B` is one composite suppress-gate carrying all four B sub-items, giving GPN `criteriaTotal` = 2.** Consequence: a patient meeting three of four sub-items sees nothing at all, and GPN can never render as "partial". Faithful to the ICHD lettering and identical in behaviour to `tn-B`, but the denominator is the smallest in the engine. **Rule.**
6. **`b-glossopharyngeal` fires on `loc-glossopharyngeal-territory` alone**, not on `|| loc-facial-region`. Residual risk: a pure angle-of-the-jaw presentation that files under `loc-face` never sees the GPN screen and GPN becomes unreachable for it. Trade-off is against putting a third branch screen in front of every facial-pain patient. **Rule**, and rule on whether W1 should be duplicated with the persona answering `loc-face` to document the residual.
7. **`b-pifp` fires on `loc-facial-region || loc-glossopharyngeal-territory`**, so every facial-pain and every throat-pain patient sees one extra screen. **Rule** on the screen-burden trade-off.
8. **PIFP criteria D and E are plain DROP suppress-gates**, not `hiddenUntilTrial`, not EMIT. Full reasoning in S3. **Rule.**
9. **The GPN safety steer's primary surface is the `q-glossopharyngeal` teach string**, secondary is the management card, and `SafetyStrip` is deliberately untouched. **Rule**, and confirm with `ui-architect` per architect condition 9, since collapsed clinical content has produced a false verification result here before.
10. **"Ask about blackouts with attacks" and "check weight and oral intake"** are history-taking and monitoring instructions I authored, bounded by sourced associations. **No monitoring, telemetry, admission, pacing or referral recommendation is made** for the syncope/asystole variant, because no held source supports one. **Rule** on whether that restraint is correct or whether a referral steer should be sought from a new source.
11. **TN card: grades kept and re-attributed rather than dropped**, header changed from "Treatment (Nahas Continuum 2024)" to "Treatment", `nahas` removed from `clinic-headache-tn-management` `citation_ids` because no row on the card now rests on it, and a Level C second-line row added. **Rule** on all four.
12. **The new record is `gronseth-aan-efns-tn-2008`, not `cruccu-aan-efns-tn-2008`** (finding F3: PMID 18716236 is the Gronseth Neurology practice parameter; the Cruccu Eur J Neurol paper is 18721143, which I have not read). **Rule** on the rename.
13. **`review_window_months: 12` on the new AAN record**, an override rather than the §13.7 6-month current-guideline default, with the rationale that the quoted text is from a closed 2008 document but a newer unheld guideline exists. **Rule.**
14. **No dose range is rendered for TN.** AAN 2008 gives CBZ 200-1200 mg/day and OXC 600-1800 mg/day; Nahas Table 10-2 gives 300-800 and 600-1200. I did not synthesize. Both are held in their own `quoted_text`. **Rule**, and confirm this becomes a separate task rather than a silent gap.
15. **ON card: "First-line" removed** and replaced with an evidence-base row plus an options row, weakening a shipped recommendation strength. This is a downgrade of an action verb on a live surface and needs an explicit ruling, not a nod.
16. **GPN aetiology is rendered as a card row while the subtype resolver is deferred.** The classification is stated to the clinician but not computed by the engine. **Rule** on whether that split is acceptable or whether the row should wait for the resolver.
17. **The evidence row on the GPN treatment card** ("No class or level of evidence is shown because none has been assigned…") states a negative about the two cited documents only; the wider negative (no society guideline exists anywhere) lives in the claim description, not the rendered string. **Rule** on whether that is the right split or whether the card should say it outright.

### Recorded, out of scope for this batch

18. **Continuum DOI drift across three registry records** (packet §9.1.E). `burish-2024-continuum-cluster` carries DOI `…1412`, which resolves to Karsan, *Pathophysiology of Migraine*, 30(2):325-343, and pages 396-416 while the true range is 391-410 (DOI `…1411`). `burch-2024-continuum-acute` carries DOI `…1411`, which resolves to Burish, *Cluster Headache, SUNCT, and SUNA*, 30(2):391-410, with pages not verified. Three of three Continuum records checked have a DOI resolving to a different article. **Open a separate scoped citation-metadata task; do not bundle into this Class E change, which would blur the blast radius.**
19. **Acquire Bendtsen L, et al. European Academy of Neurology guideline on trigeminal neuralgia. Eur J Neurol 2019;26(6):831-849, doi 10.1111/ene.13950.** A 2019 society guideline exists on the same question as the 2008 grades this spec ships. The grades are correctly labelled "(AAN 2008)" so the vintage is visible, but the record should not sit at 12 months without this being read. Tier 2 source request may be needed.
20. **`do-snnoop10-2019` `quoted_text` contains NeuroWiki editorial content** ("NeuroWiki applies the more sensitive over-50 threshold…") inside a field the engine treats as verbatim external text. Same category as the airway defect this batch removes. Recorded only; not touched here.
21. **TN `teachPearl` still carries the BC-4 secondary-TN red-flag list** (sensory deficit, bilateral pain, onset before age 40, poor carbamazepine response) that was removed from the rendered card for want of a held source. Already tracked in TASKS.md. Finding F1 means it is currently invisible, which lowers urgency but does not close it.

---

## Files this spec targets (implementer's list, absolute paths)

- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/lib/citations/registry.ts` (S1.a, S1.b, S1.c)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/lib/citations/claims.ts` (S7, S1.d, S1.e)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/clinicHeadacheData.ts` (S2, S3, S4.1)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/headacheQuestions.ts` (S4.2, S4.3, S4.4)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/headacheBanding.ts` (`CHAPTER_ORDER`, S2/S3)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/components/pathways/headache/HeadacheManagement.tsx` (S1.d, S1.e, S6, `MANAGED`)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/components/pathways/headache/HeadacheResultV4.tsx` (`HiddenClaimMarkers`, S7)

**Routing: ready for clinical-reviewer.** No repo source file was edited by this agent.
