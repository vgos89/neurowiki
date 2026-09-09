# Clinical review — PR #<fill on open> — headache ICHD-3 facial-pain expansion (13.2.1 GPN + 13.12 PIFP), POST-EXECUTION

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-5)
**Date:** 2026-09-09
**Gate:** post-execution (CLAUDE.md §20). Batch dated 2026-09-08; this pass reviews the
implemented diff, not the spec.

## Pre-gate trail (brief)

Evidence packet (`docs/evidence-packets/2026-09-08-ichd3-13-2-13-12-facial-pain.md`,
HIGH confidence, every page rendered and read in reading order) → architect plan review
(approve-with-conditions) → clinical pre-execution gate
(`docs/reviews/clinical-PLAN-headache-facial-pain-expansion-2026-09-08.md`,
approve-with-conditions, C1-C17, eight blocking) → implementation same day → this artifact.
The pre-gate stated that the post-execution gate would block on any unmet C1-C8.
**All eight blocking conditions are met.** All nine non-blocking conditions are met.
Verified independently below, not accepted on assertion.

## Scope

- **Claims touched:** `clinic-headache-ichd3-glossopharyngeal-neuralgia-criteria` (new),
  `clinic-headache-gpn-management` (new), `clinic-headache-gpn-vagal-safety` (new),
  `clinic-headache-ichd3-pifp-criteria` (new), `clinic-headache-tn-management` (amended),
  `clinic-headache-on-management` (amended).
- **Citations affected:** `ichd3-2018` (section list +5, `quoted_text` append, `last_reviewed`
  holds), `nahas-2024-continuum-cranial-neuralgias` (4 metadata corrections, `quoted_text`
  rewrite, `last_reviewed` refresh), `gronseth-aan-efns-tn-2008` (new record).
- **Surfaces changed (§13.3):** static JSX (`HeadacheManagement.tsx` TN/ON/GPN cards,
  `HiddenClaimMarkers` literal spans); structured data (`clinicHeadacheData.ts` phenotypes,
  criteria labels and descriptions, chip labels, `teachPearl`; `headacheQuestions.ts` option
  labels, `teach` strings, `claimId` fields); registry `quoted_text`. No markdown, no
  computed strings, no tooltip/modal surface.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-09-08-ichd3-13-2-13-12-facial-pain.md`,
  plus the C5 provenance addendum
  `docs/evidence-packets/2026-09-08-addendum-aan-tn-2008-clinician-summary.md`.
- **Trial-statistician report:** not applicable. Neither source is a trial; packet §7 states
  non-applicability explicitly. Mandatory-block condition 7 does not fire.

## Semantic validity

### Blocking conditions C1-C8 — all verified met

- **C1 (the `loc-face` GPN route) — MET, and met substantively, not formally.**
  `b-glossopharyngeal.fires` is now
  `has(s,'loc-glossopharyngeal-territory') || has(s,'loc-facial-region')`, and the
  `gpn-territory` option contributes `loc-glossopharyngeal-territory`, so `gpn-A` is
  satisfiable on the `loc-face` route. Both coupled edits are present; neither alone would
  have worked. W8 walks the persona and asserts GPN `full` with TN absent.
  I checked the harm the condition was written against, not just the walk: the dangerous
  patient is the one who answers `loc-face` and then ticks `tn-distribution` honestly. That
  patient now reaches **both** screens, so GPN is present in the differential and the
  vagal-safety teach string renders. A simultaneous TN match on that path is correct
  behaviour, not a defect: ICHD-3 p. 172 states 13.2.1 "can occur together with 13.1.1
  Trigeminal neuralgia," and the engine returns match strengths, never a verdict. The
  false-negative half and the false-positive half of F-A are both closed.
  The widened predicate shows the GPN screen to every facial-pain patient. That is one
  optional screen, and `gpn-A` still requires the territory confirm, so no false positive is
  manufactured. Same trade the pre-gate approved at S9-7 for `b-pifp`.
- **C2 (CTN population gate) — MET.** TN card rows 1-2 are scoped "(AAN 2008, classic TN)"
  in the row label. Row 3 "Secondary TN (AAN 2008)" carries the source statement with `STN`
  expanded to "secondary trigeminal neuralgia": *"There is insufficient evidence to support
  or refute the effectiveness of any medication in treating pain in secondary trigeminal
  neuralgia (Level U)."* Grades exact, action verbs exact ("should be offered" Level A,
  "should be considered" Level B, "may be considered" Level C), certainty exact ("may pose
  fewer safety concerns"). The card header no longer reads "(Nahas Continuum 2024)".
- **C3 (pimozide) — MET.** *"(Level C; the source notes pimozide is no longer in use)"*.
- **C4 ("clinical") — MET on both surfaces.** Chip label `exam-neuro-normal` = "Clinical
  neurological examination is normal"; `q-pifp` option `pifp-exam` = "The clinical
  neurological examination is normal". The word that protects the abnormal-QST trap is now
  in the string the clinician actually affirms.
- **C5 (provenance addendum) — MET.** Addendum filed with URL, both retrieval dates, PDF
  size, page count, PMID disambiguation against the Cruccu Eur J Neurol companion (18721143,
  explicitly not read and not quoted), and the verbatim grade statements carried into
  `quoted_text`.
- **C6 (q-pifp discriminators) — MET.** Both sentences are pointers: "points away from 13.12
  and toward 13.11 burning mouth syndrome"; "point toward trigeminal neuralgia with
  concomitant continuous pain (13.1.1.1.2 or 13.1.1.3.2), which requires the paroxysms."
  Subform numbering corrected. No diagnostic identity is asserted on partial criteria.
- **C7 (attribution) — MET on all three surfaces.** `q-glossopharyngeal` teach, the GPN
  "Vagal features" card row, and the (dormant) `teachPearl` all read "some authors have
  suggested the term vagoglossopharyngeal neuralgia". This matches ICHD-3 p. 172 ("have
  suggested using the term") exactly. The "ICHD-3 records the term" formulation is gone from
  every rendered surface.
- **C8 (nutrition row bounded) — MET.** *"Pain can be severe enough for patients to lose
  weight. Check weight when swallowing is a trigger."* No oral-intake or dehydration content
  anywhere on the GPN surfaces. The trigeminal-scoped Nahas p. 478 passage was not imported.

### Non-blocking conditions C9-C16 — all verified met

- **C9** — the `nahas` lab-monitoring sentence now quotes the source's own open phrasing:
  *titration proceeds "along with any recommended laboratory monitoring (such as complete
  blood count and serum sodium)"*, with the framing clause outside the quotation marks.
- **C10** — `clinic-headache-gpn-vagal-safety.description` enumerates the teach string
  sentence by sentence (1 radiation discriminator, 2 vagal associations plus the bounded
  history instruction, 3 weight-loss consequence, 4 examination guidance) and names both
  rendered surfaces. The traceability gap F-E is closed.
- **C11a-d** — "a peripheral nerve" (chip + option); "investigations" plural (chip + option);
  "single reports describe" on the aetiology row; "and/or in the ear" in the GPN `teachPearl`.
- **C12a** — GPN evidence row states the searched negative at full width: *"No class or level
  of evidence is shown: no major-society guideline has assigned one for glossopharyngeal
  neuralgia."*
- **C12b** — the `gronseth` `section` field is self-describing at the data level:
  *"...quoted_text transcribed from the AAN clinician summary (the AAN derivative of the
  Neurology practice parameter), not from the journal text"*. A reader of the record data
  alone can no longer mistake the PMID for the source of the quotes.
- **C13** — MET, **and the pre-gate's own figure was the loose one.** The shipped comment
  records 22 dependent claims before this batch, 19 verified by direct read. I counted
  mechanically: `citation_ids:` arrays containing `ichd3-2018` number **26** in the current
  tree; minus the 4 claims this batch adds = **22 before**. The pre-gate finding F-D of "25"
  was a count of all string occurrences in `claims.ts` (29 now), which includes prose
  mentions inside `description` fields. **The implementer's number is correct and F-D is
  hereby corrected to 22.** The hold on `last_reviewed` is unaffected: 19 of 22 verified is
  still a partial step-3 pass.
- **C14** — the `nahas` record comment warns explicitly not to "fix" `...1415` back to
  `...1414` and names the `goadsby` collision. TASKS.md line 290 carries the Continuum
  citation-metadata sweep entry naming `burish`, `burch` **and** `goadsby`.
- **C15** — all required walks and guards present: W1 (throat route, GPN `full`, `criteriaMet`
  2, TN/ON/PSH/PIFP all asserted **absent** rather than merely non-full), W8 (`loc-face`
  route), W9 (GPN 3-of-4 near-miss silently unclassified with `q-glossopharyngeal` teach and
  `claimId` still asserted), W3 (PIFP `full` at `criteriaMet` 5 despite `dur-continuous`),
  W10 (PIFP without dental exclusion silently unclassified with teach still offered), the
  config invariant pinning `loc-trigeminal-distribution` to `tn-distribution` alone, the W5
  keyword-partition guard (correctly asserting anatomical ownership rather than the ambiguous
  word "jaw", with word boundaries so `/ear/` does not match "area"), the `CHAPTER_ORDER`
  permutation guard, the MANAGED-both-directions guard, and the literal-span marker pin.
  377 tests reported green.
- **C16a-d** — all four TASKS.md entries exist and are correctly graded: TN dose-conflict
  adjudication L4/P1 `blocked:awaiting-clinical-review` (line 286); Bendtsen EAN 2019
  acquisition L4/P1 with the "(AAN 2008)" vintage-label obligation restated (287);
  `do-snnoop10-2019` `quoted_text` editorial removal at **L4/P1**, not "recorded" (288);
  `teachPearl`/`pitfalls` wire-or-delete (289). The S9-10 GPN vagal-syncope referral steer is
  additionally tracked as optional at L4/P2 (291), which is the right home for it.

### My own pass — beyond the conditions

**Criteria encodings vs the packet verbatim blocks. Confirmed faithful.**
- `gpn-A` = `loc-unilateral && loc-glossopharyngeal-territory`, matching A + Note 1. The
  territory chip label ("throat, back of the tongue, tonsil area, ear, or under the angle of
  the jaw") is co-extensive with Note 1 ("posterior part of the tongue, tonsillar fossa,
  pharynx or angle of the lower jaw and/or in the ear"); "under" is supported by the p. 171
  Description's "beneath the angle of the jaw".
- `gpn-B` carries all four sub-items as one criterion, faithful to the ICHD lettering.
  Severity satisfied by either severity answer (U1 lesson). Quality OR-pair matches B.3 word
  for word. `dur-few-sec-to-2min` is correctly minted rather than reusing the TN or occipital
  duration chips, both of which are wider at one bound. The trigger chip is correctly minted
  and does **not** feed `tn-C`.
- **The 13.2.1.1 no-morphological-change trap is correctly handled.** The GPN aetiology row
  reads "Classical: MRI or surgery shows neurovascular compression of the glossopharyngeal
  nerve root" with no morphological-change and no not-simply-contact qualifier, while the TN
  workup row two cards away correctly retains "WITH morphological change". The two entities
  are differentiated exactly as pp. 167 and 172 differentiate them. No phantom criterion C is
  added to 13.2.1.2.
- **The absent "investigations unremarkable" criterion is correctly absent.** PIFP encodes
  A-E as five suppress-gates; F is not encoded per the engine-wide rule; no
  normal-investigations chip exists. The claim description states the negative explicitly and
  quotes the Comment that contradicts it ("psychophysical or neurophysiological tests may
  demonstrate sensory abnormalities"), and both the `teachPearl` and the `q-pifp` teach carry
  "may demonstrate" with the certainty marker intact.
- `pifp-B` correctly mints the full conjunction rather than splitting across
  `pattern-ge-3-months`, and PIFP is correctly kept out of `episodicPhenotypes` so a
  `dur-continuous` answer cannot delete the daily entity it describes. W3 tests this.

**GPN management and safety card rows.** Every row traces to held text at full source
strength: the ICHD-3 pharmacotherapy Comment with "usually responsive, at least initially"
intact; the local-anaesthetic Comment with "has been suggested" intact and an explicit
statement that block response is a Comment here and criterion D in 13.4 (packet §6.1 trap 3
closed); Nahas p. 480 verbatim for the overlap row; Nahas p. 486 for secondary causes with
"usually warranted" not upgraded to "required". No monitoring, telemetry, admission, pacing
or referral steer appears. No airway or aspiration content appears on any surface.

**ON card.** The "First-line" row is gone and the two replacement rows are faithful to
Nahas p. 483. Row label "Options" is weaker than the source's descriptive "are utilized",
which is the safe direction. Criterion D remains at full mandatory strength.

**`nahas` five removals — complete in the registry and in the ten touched files; NOT
complete repo-wide.** Within the diff and the citation registry all five are confirmed gone:
the airway directive, the NVAF clause, the GPN-carbamazepine attribution, the
Nahas-attributed Level A/B grades, and the ON "first-line" framing. The only remaining
occurrences of "airway"/"NVAF" in `src/lib/citations/` are inside the record comment that
documents the removal and forbids reinstatement, and inside two claim `description` fields
that state the negative. Those are metadata, not rendered, and are correct.

**However — the Nahas-attributed Level grades survive on a live rendered surface outside this
PR.** `src/pages/MigrainePathway.tsx` (live route `pathways-migraine`, lazy-loaded in
`src/App.tsx` line 54, mapped at line 107) renders a TN protocol block, untagged by any
`data-claim`, carrying:
- line 850-853: "Carbamazepine 300-800 mg/day" + `<EvidenceBadge level="A" />` + "Nahas 2024."
- line 857-860: "Oxcarbazepine 600-1200 mg/day" + `<EvidenceBadge level="B" />` + "Nahas 2024."
- line 846: "Nahas 2024 Table 10-2."
- line 864: IV fosphenytoin 15-20 mg PE/kg or IV lidocaine 1.5-2 mg/kg, cited "Nahas 2024 p.298."
- lines 441-445: the same content pushed into the clipboard/handoff export
  ("TRIGEMINAL NEURALGIA PROTOCOL (Nahas 2024): - First-line: carbamazepine 300-800 mg/day
  (Level A, FDA-approved)").

Three distinct defects, all of which this batch's own evidence now establishes:
1. **Grade misattribution.** Packet §0.3 and §9.1.D establish that the Level A/B grades do
   not appear in Nahas. They belong to AAN 2008. This is the exact defect the batch was
   convened to correct, alive on a second surface.
2. **Dropped population gate, and a cross-source synthesis.** The badges render Level A/B
   **without the CTN scope** (the C2 defect verbatim), and they weld the AAN grade to the
   Nahas Table 10-2 dose range. That is precisely the merge the TN card refused and routed to
   the C16a adjudication task. One surface refuses the synthesis; another ships it.
3. **Unresolvable locator.** "Nahas 2024 p.298" cannot resolve: the article is pp. 473-487.
   Separately, Nahas p. 478 states only that "infusions of fosphenytoin and lidocaine are also
   reported to be useful" and carries no doses, and the sibling surface already removed this
   row under BC-1/BC-2 because the source gates it on refractory TN and AAN 2008 grades IV
   medication Level U.

This does not fire a mandatory block on **this** PR: the block conditions gate the claims in
the diff, and this surface is untagged, pre-existing, and untouched here. Merging neither
creates nor worsens it. But it does become newly indefensible on merge, because the same
commit that documents "these grades are not Nahas's" leaves a live prescribing card asserting
that they are. It is condition **P1** below, and it is not eligible for the "recorded and
deferred" treatment that C16c gave `do-snnoop10-2019`: that defect sits in a metadata field
and errs toward sensitivity, this one is a drug, a dose, an evidence badge and a clipboard
export.

**No em-dash in any new rendered string.** Verified by reading every new authored string in
`clinicHeadacheData.ts` (2 `teachPearl`s, 7 criterion labels and descriptions, 8 chip labels),
`headacheQuestions.ts` (1 core option label, 2 prompts, 2 `teach` strings, 9 option labels) and
`HeadacheManagement.tsx` (11 new/changed `Row` values). All separation is by comma, colon,
semicolon or parentheses. `check:humanizer` walks all three directories, so this is
mechanically enforced as well as read.

**Deleted vestigial `PhenotypeId` members broke nothing clinical.** `probable-migraine`,
`probable-tth` and `probable-tac` now appear nowhere in `src/` except the comment recording
their removal. No phenotype, chip, criterion, banding entry, claim or rendered string
referenced them. Their removal is what makes `Record<PhenotypeId, T>` exhaustive over real
phenotypes, which is what the new claim-marker and `CHAPTER_ORDER` guards rest on.

**Observation, not a condition.** TN card row 2 places the Level C statement under a
"Second-line" label. The AAN source grades baclofen/lamotrigine/pimozide Level C for CTN pain
generally, not specifically after first-line failure; the second-line framing comes from the
adjacent clinical-context sentence, which is carried in the same row. This narrows rather than
widens the recommendation, which is the safe direction, and the source's own post-failure
sentence sits beside it. Recorded for the audit trail; no action required.

## Citation accuracy

- **`ichd3-2018`.** Section list gains exactly the five entries in numeric position with no
  bare `13.2`; the §0.1 numbering finding is correctly honoured everywhere (claim IDs,
  `ichd3Section` fields, card row labels, comments). The `quoted_text` append is
  **character-identical to the packet §9.1.B block** — I compared clause by clause, including
  the packet's two deliberate omissions (13.2.2, and the atypical-odontalgia Comment) and its
  hyphen normalization of "Arnold-Chiari".
  **One finding on the packet block itself, which the append inherits.** The §9.1.B block is
  described as "verified verbatim, compressed to the record's existing house style", and two
  of its compressions move certainty, not just punctuation, relative to the raw verbatim the
  same packet transcribes at §2.1:
  - block: *"some authors **use** the term vagoglossopharyngeal neuralgia"* · source p. 172
    (packet §2.1): *"Some authors propose distinguishing... and **have suggested using** the
    term"*. "Use" asserts current practice; the source asserts a proposal.
  - block: *"**reported causes are** neck trauma, multiple sclerosis..."* · source Note 1
    (packet §2.1): *"**There are single reports of** 13.2.1.2 Secondary glossopharyngeal
    neuralgia caused by neck trauma..."*.
  These are the two clauses the pre-gate blocked and conditioned on the **rendered** surfaces
  (C7 and C11c) and the implementer fixed there correctly. The rendered strings are therefore
  now **more faithful to ICHD-3 than the registry field they are audited against** — the
  "single reports describe" phrasing on the aetiology row is not literally supported by a
  `quoted_text` that says "reported causes are". No clinical surface is wrong; the direction of
  the discrepancy is entirely safe. But `quoted_text` is the field the next reviewer reads, and
  a batch whose thesis is §13.1 should not leave its own verbatim field one notch looser than
  the document. Condition **P2** below.
- **`nahas-2024-continuum-cranial-neuralgias`.** All four metadata corrections match packet
  §0.3 (single author, pp. 473-487, DOI `...1415`, PMID 38568494). Every carried clause is
  packet-verified at pp. 476, 477, 478, 480, 483, 486. The C9 residue is resolved. The DOI
  collision is disclosed in the record comment and ticketed.
- **`gronseth-aan-efns-tn-2008`.** `quoted_text` matches the addendum's transcribed statements
  including the AAN grade definitions (A established / B probably / C possibly / U inadequate),
  which is good practice: the grade scale ships beside the grades. `pmid` 18716236 resolves to
  the Gronseth practice parameter; the divergence between PMID and quote source is now
  disclosed in the `section` field as well as the comment (C12b). The record is cited by
  exactly one claim, so its dependent set is closed and fully re-verified in this batch.

## Editorial / expert context

Not applicable in the mandatory-block sense — no new trial entry in this PR, so
mandatory-block condition 8 does not fire. Recorded because the packet filled §8 anyway:
§8a states non-applicability with reason (ICHD-3 is the entire contents of *Cephalalgia*
38(1), so there is no host issue and no paired editorial) and substitutes a held expert
synthesis (Nahas 2024, read in full, reporting ICOP 2020 as "essentially identical" for the
glossopharyngeal-referable entities); §8b states a reasoned non-finding with search method and
date; §8c fills guideline incorporation for TN and states explicit non-existence for GPN and
PIFP with the societies searched named; §8d records no contradicting evidence for the
criteria, a case-series-grade base for GPN management, and names the PIFP source gap as the
packet's principal limitation. No sub-item is silently omitted. The §8c finding that the
Level A/B grades belong to the 2008 AAN/EFNS parameter and not to Nahas is the finding that
drives this entire batch, and it is correctly acted on in the diff — and, per the P1 condition
below, not yet fully acted on in the repository.

## Freshness

| Citation | `last_reviewed` | Window | Verdict |
|---|---|---|---|
| `ichd3-2018` | **holds 2026-05-25** | 24 mo (expires 2028-05-25) | **Pass.** Same 2018 edition, same PMID and DOI; ICHD-4 unpublished; ICOP 2020 is a parallel classification reported "essentially identical" for these entities. 19 of 22 dependent claims verified this batch — a partial §13.6 step-3 pass, so the date correctly does not move. Appending newly source-verified text under a held date follows the 2026-07-06 §4.7 precedent recorded in the record's own comment. |
| `nahas-2024-continuum-cranial-neuralgias` | **refreshed to 2026-09-08** | 12 mo | **Pass.** All six §13.6 steps genuinely complete: source resolves (PMID 38568494, DOI verified three ways), full 15-page article read this session, the dependent set is closed at four claims (two existing, both corrected here; two new) and every one re-verified, wording drift found and removed on five clauses, newer evidence considered, dual sign-off (medical-scientist authored, this artifact gates). |
| `gronseth-aan-efns-tn-2008` | **2026-09-08** (new) | 12 mo, override | **Pass.** Override rationale is in the record comment as §13.7 requires: the quoted text is from a closed 2008 document and cannot drift, so the 6-month current-guideline default buys nothing; the real risk is supersession by Bendtsen EAN 2019, which is a known one-time event, tracked at C16b, with every grade-bearing row carrying its "(AAN 2008)" vintage label meanwhile. |

The asymmetry between the held and the refreshed date remains principled and is now
empirically supported: one record's dependent set was exhaustively re-verified, the other's was
19 of 22. Date movement tracks verification work done, not batch membership.

## Rationale

Every one of the pre-gate's eight blocking conditions and nine non-blocking conditions is met,
and met at the level of the underlying harm rather than the letter of the instruction — C1 in
particular closes both halves of the false-positive/false-negative pair, not just the walk that
was named. The criteria encodings are faithful to the packet's verbatim blocks including both
of the traps the packet flagged in bold (the 13.2.1.1 morphological-change absence and the
non-existent "investigations unremarkable" criterion), the four refusals to synthesize across a
gap all survived implementation intact, and the test suite converts three knowingly-accepted
silent-drop behaviours into asserted ones. The `ichd3-2018` append is character-identical to
its packet block. This is a clean implementation of a strong spec.

It is not a clean approve for two reasons, neither of which is a defect in the ten files
changed. The first is that the batch's central correction — Level A/B is AAN 2008 and is scoped
to classic TN, not Nahas and not unscoped — has been applied to one of the two live surfaces
that assert it. `MigrainePathway.tsx` still renders those grades as Nahas's, without the CTN
scope, welded to the Nahas dose range that the very same batch declared unmergeable with them,
against a page number that does not exist in the article, and pushes the whole thing into a
clipboard export a clinician can paste into a note. Merging does not create that; it does make
it a documented internal contradiction, and a rendered prescribing card is not the place to
carry one. The second is smaller and is a debt this batch inherited from its own packet: two
clauses in the appended `quoted_text` are one notch looser in certainty than ICHD-3 p. 172, and
they happen to be the exact two clauses the pre-gate blocked on for the rendered surfaces. The
rendered strings are now more faithful than the field that vouches for them, which is the safe
direction but the wrong arrangement.

Both conditions are subtractive and unambiguous. Neither requires new authored clinical content
and neither needs a new source, which is why this is approve-with-conditions rather than block.

**C17 ruling — the `ui-architect` confirmation rides as an immediate follow-up; it does not
gate this merge.** The clinical question C17 exists to answer is whether the GPN vagal-safety
content is reachable. It is, on the primary surface, unconditionally: the
`q-glossopharyngeal` `teach` string renders whenever the branch fires, with no disclosure
wrapper, and W9 asserts exactly that in the near-miss case where the phenotype itself is
hidden. Only the secondary card sits behind the "Show management" disclosure, which is the
established pattern for all thirteen MANAGED phenotypes and is not a novelty introduced here.
A UI finding could change presentation; it cannot make the current state clinically unsafe, and
it cannot change whether a claim matches its source. If ui-architect returns a finding that
contradicts W9 — that the teach string does not in fact render unconditionally — reopen this
artifact; that would be a different question.

## Required follow-ups

**Conditions — clear before this batch is reported complete.**

- **P1 — `src/pages/MigrainePathway.tsx` TN protocol block.** Do not leave Level A/B grades
  attributed to Nahas on a live prescribing surface after this commit lands.
  *Minimum acceptable action, pure subtraction, no new authored content:* remove
  `<EvidenceBadge level="A" />` (line 851) and `<EvidenceBadge level="B" />` (line 858) and
  the "(Level A, FDA-approved)" / "(Level B)" strings from the clipboard export (lines
  442-443); remove or correct the unresolvable "Nahas 2024 p.298" locator (line 864). The
  dose ranges themselves are genuinely Nahas Table 10-2 p. 476 and may stay attributed to
  Nahas; only the grades and the bad locator are unsourced.
  *Full remediation is NOT to be attempted here:* re-attributing the grades to AAN 2008 with
  the CTN scope while displaying the Nahas dose range is the cross-source merge that C16a
  exists to adjudicate. Route it to the existing `TN dose-conflict adjudication` task (TASKS.md
  line 286) and note there that `MigrainePathway.tsx` is a second affected surface. The IV
  fosphenytoin/lidocaine row should be re-examined in the same pass against BC-1/BC-2, which
  removed it from the sibling surface for reasons that apply here identically.
  Open the P1 as its own TASKS.md entry, Class E-clinical, so the subtraction and the
  adjudication are not conflated.
- **P2 — `ichd3-2018.quoted_text`, two clause restorations.** Change *"some authors use the
  term vagoglossopharyngeal neuralgia"* to the source's *"some authors have suggested using
  the term vagoglossopharyngeal neuralgia"*, and *"reported causes are neck trauma..."* to
  *"there are single reports of secondary glossopharyngeal neuralgia caused by neck
  trauma..."*. Update the packet §9.1.B block in lockstep so the character-identity property
  between packet and registry is preserved — the two must not diverge, or the next reviewer's
  comparison test fails for the wrong reason. `last_reviewed` does not move: this is a
  transcription correction to text read from the source this batch, not a new review.

**Follow-ups — non-blocking, open as TASKS.md entries.**

- **Restore the source's open list on the vagal association.** ICHD-3 p. 172 reads "associated
  with vagal symptoms **such as** cough, hoarseness, syncope and/or bradycardia"; the
  `q-glossopharyngeal` teach, the GPN "Vagal features" card row and the
  `clinic-headache-gpn-vagal-safety` description all render the four as a closed list. Same
  open-to-closed compression C9 corrected in the `nahas` record. Harm is bounded — the row
  label "Vagal features" restores the category, and the single directive ("ask about
  blackouts") keys on syncope, which is in the list — so this is editorial. Class B.
- **Restore the territory scope on the GPN examination row.** Source: "Clinical examination
  usually fails to show sensory changes **in the nerve distribution**". Rendered: "Clinical
  examination usually shows no sensory change." The dropped clause makes the negative slightly
  wider than the source. The directive that follows is exact, so no decision changes. Class B.
- **Acknowledge the `pifp-A` over-width in the phenotype comment.** `pifp-A` is satisfied by
  `loc-glossopharyngeal-territory`, whose label includes "ear". Criterion A is "facial and/or
  oral pain"; an ear-only presentation is neither. The choice is defensible and I am not asking
  for it to be reversed — restricting `pifp-A` to `loc-facial-region` would create a U1-class
  false negative for the tongue-base and tonsillar (i.e. genuinely **oral**) presentations that
  criterion A explicitly covers and that `loc-face`'s "cheek, jaw, or upper lip" label does
  not. But the phenotype comment currently asserts that "either alone is narrower than the
  criterion", which is true of `loc-facial-region` and only partly true of
  `loc-glossopharyngeal-territory`. The comment should record the accepted over-width and its
  rationale, per the file's own CHIP-REUSE RULE. Class B, comment-only.
- **`ui-architect` C17 result.** Record the outcome against this artifact when it returns. Not
  a merge gate (see rationale).
- **Correction to the pre-execution artifact, finding F-D.** The `ichd3-2018` dependent-claim
  count is **22 before this batch, 26 after** (mechanical count of `citation_ids` arrays). The
  pre-gate's "25" counted all string occurrences including `description` prose. The
  implementer's shipped comment is correct; the pre-gate's finding is not. Amend F-D in
  `docs/reviews/clinical-PLAN-headache-facial-pain-expansion-2026-09-08.md` so the two
  artifacts do not disagree in the record.
- **Gate 6 note for the merge.** The GPN and PIFP surfaces are behind a multi-screen answer
  flow and the management card sits behind a "Show management" disclosure, so a static fetch of
  `/pathways/headache-clinic` will not show any of this batch's content. Verify the route
  returns 200 and defer content verification to the test suite, which walks the flows. Allow
  the documented 5-minute deploy wait before concluding a Gate 6 failure.

---

## Orchestrator disposition of conditions (2026-09-09, pre-commit)

- **P1 — DONE (pure subtraction).** `src/pages/MigrainePathway.tsx`: both `EvidenceBadge` grade badges removed from the TN protocol block; the clipboard export no longer carries "(Level A" / "(Level B)" ("FDA-approved" retained: Nahas p. 477 verbatim); the unresolvable "Nahas 2024 p.298" locator removed. Dose ranges remain attributed to Nahas Table 10-2 (p. 476, sourced). Full re-attribution with CTN scope, and re-examination of the IV fosphenytoin/lidocaine row against BC-1/BC-2, routed to the `TN dose-conflict adjudication` task with `MigrainePathway.tsx` named as the second affected surface; a dedicated TASKS.md entry records the P1 subtraction separately from the adjudication.
- **P2 — DONE, in lockstep.** `ichd3-2018.quoted_text` and the packet §9.1.B block both now read "some authors have suggested using the term vagoglossopharyngeal neuralgia" and "there are single reports of secondary glossopharyngeal neuralgia caused by neck trauma..."; character-identity between packet and registry re-verified mechanically after the edit. `last_reviewed` unchanged (transcription correction to text read from the source this batch).
- **Non-blocking follow-ups applied in the same commit** (reviewer-specified wording, source-restoring, all in the safe direction): the vagal list rendered as the source's open list ("vagal symptoms such as") on the `q-glossopharyngeal` teach, the GPN "Vagal features" row and the claim description; "in the nerve distribution" restored on the GPN "Examination" row; the accepted `pifp-A` over-width (ear-only presentations) recorded in the phenotype comment with its rationale.
- **F-D correction** appended to the pre-execution artifact so the two records agree (22 before / 26 after).
- **C17** — `ui-architect` confirmation returned **ready** in parallel: teach surface confirmed unconditional; safety card confirmed one tap behind the existing management disclosure; one defensive layout fix applied to the shared `Row` (`break-words`, `min-w-0`) because "vagoglossopharyngeal" risked clipping at 375px. Consistent with W9; no reopening needed.
- Gates re-run after these edits: see commit body.

