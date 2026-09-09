# Clinical review — PR #<fill on open> — headache ICHD-3 facial-pain expansion (13.2.1 GPN + 13.12 PIFP), PRE-EXECUTION

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-5)
**Date:** 2026-09-08
**Gate:** pre-execution (CLAUDE.md §19 step 5). Authorizes implementation subject to C1-C8.
A post-execution pass on the actual diff is required before `/pr-ready`.

## Scope

- **Claims touched:** `clinic-headache-ichd3-glossopharyngeal-neuralgia-criteria` (new),
  `clinic-headache-gpn-management` (new), `clinic-headache-gpn-vagal-safety` (new),
  `clinic-headache-ichd3-pifp-criteria` (new), `clinic-headache-tn-management` (amended),
  `clinic-headache-on-management` (amended). Indirect: the ~24 claims mapped to `ichd3-2018`.
- **Citations affected:** `ichd3-2018` (section + quoted_text grow; `last_reviewed` holds),
  `nahas-2024-continuum-cranial-neuralgias` (4 metadata corrections + quoted_text rewrite +
  `last_reviewed` refresh), `gronseth-aan-efns-tn-2008` (new record).
- **Surfaces changed (§13.3):** static JSX (`HeadacheManagement.tsx` cards, `HiddenClaimMarkers`
  spans); structured data (`clinicHeadacheData.ts` phenotypes/criteria/chip labels,
  `headacheQuestions.ts` option labels + `teach` strings + `claimId` fields); registry
  `quoted_text`. No markdown, no computed strings, no tooltip/modal surface.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-09-08-ichd3-13-2-13-12-facial-pain.md`.
  §8 filled with four explicitly-reasoned sub-items (8a-8d); no silent omission. Mandatory-block
  condition 8 does not fire. **Gap:** the packet does not cover the AAN clinician summary that
  sources the new `gronseth-aan-efns-tn-2008` record — see C5.
- **Trial-statistician report:** not applicable. Neither source is a trial; packet §7 states
  non-applicability explicitly rather than leaving it blank. Mandatory-block condition 7 does not fire.

## Semantic validity

**Confirmed.** The spec is bounded by held text to an unusually high standard, and three
judgment calls are exemplary and are approved without qualification:

- **The TN dose omission (S9-14).** AAN 2008 gives CBZ 200-1200 / OXC 600-1800 mg/day; Nahas
  Table 10-2 gives 300-800 / 600-1200. These are materially different at both upper bounds.
  Rendering either alone, or a merged range, would violate the synthesis rule against smoothing a
  source conflict. Escalating instead of synthesizing is the correct process.
- **The syncope restraint (S9-10).** Both sources state an *association* (syncope, bradycardia,
  asystole, convulsions) and issue exactly one directive, which is investigative (reduced or
  missing gag reflex prompts aetiological investigation). Authoring a monitoring, telemetry,
  admission, pacing or referral steer would be the airway defect in mirror image. "Ask about
  blackouts with attacks" is a history-taking instruction fully bounded by the stated association.
  Approved. Do not seek a referral steer from a new source inside this batch.
- **PIFP criterion E as a hard DROP gate (S9-8).** ICHD-3 gives E equal status to A-D, so gate
  strength is faithful. The reasoning that EMIT would render `exclusionReason` as the bare label
  ("PIFP · A dental cause has been excluded by appropriate investigations"), asserting the opposite
  of what is meant, is correct and is the kind of surface-level check that is usually missed.
  Critically, the gate hides the *match* but not the *instruction*: the q-pifp option labels and
  teach string render unconditionally once the branch fires.

**Flagged — never-drift violations in final-form strings (blocking):**

1. **Population gate dropped, TN card rows 1-2 (C2).** The AAN grade statements are scoped to
   **CTN (classic** trigeminal neuralgia): "carbamazepine should be offered to treat **CTN** pain
   (Level A)"; "oxcarbazepine should be considered to treat **CTN** pain (Level B)"; "baclofen,
   lamotrigine, and pimozide may be considered to treat **CTN** pain (Level C)". The same summary
   grades secondary TN separately: "There is insufficient evidence to support or refute the
   effectiveness of any medication in treating pain in **STN (Level U)**." The card renders under
   phenotype `trigeminal-neuralgia` = ICHD-3 **13.1.1**, the parent covering classical, secondary
   and idiopathic, and the aetiology card directly above it states the subtype is imaging-determined
   and **deferred** — so at render time the subtype is unknown by construction. Presenting Level A
   without the classic-TN scope generalizes a population-gated grade onto a subgroup the source
   grades Level U. Never-drift categories 1 (recommendation strength) and 3 (qualifiers and gates).
2. **Qualifier dropped, TN card row 2 (C3).** The source's own clinical context reads "...a switch
   to baclofen **(pimozide being no longer in use)**." The row renders "pimozide may be considered
   (Level C)" without it. Rendering a Level C recommendation for an agent the source states is no
   longer in use, to a resident, on a bedside tool, is a category-3 drop with a prescribing
   consequence.
3. **Certainty/attribution laundering, q-glossopharyngeal teach (C7).** Source: "**Some authors**
   propose distinguishing between pharyngeal, otalgic and vagal subforms... and **have suggested**
   using the term *vagoglossopharyngeal neuralgia* when pain is accompanied by asystole,
   convulsions and syncope." Teach: "**ICHD-3 records the term** vagoglossopharyngeal neuralgia
   for pain accompanied by asystole, convulsions, and syncope." This converts an attributed
   suggestion into a classification fact, and additionally merges it with ICHD-3's separate use of
   "Vagoglossopharyngeal neuralgia" as the *previously used term for 13.2.1 as a whole* (p. 171).
   Never-drift category 4.
4. **Diagnostic identity asserted on partial criteria, q-pifp teach (C6).** "Burning pain felt
   superficially in the oral mucosa **is** 13.11 burning mouth syndrome" — BMS also requires B, D
   and E, and BMS is not encoded in this engine, so the reader gets no criteria list to correct the
   impression. Same shape in the next sentence ("...**are** 13.1.1 trigeminal neuralgia with
   concomitant continuous pain"). Both must read as discriminators, not identifications. This also
   cuts against the product's own stated posture (packet §10: the engine returns match strengths
   and never declares a diagnosis). Categories 3 and 4.
5. **Chip label wider than criterion, `exam-neuro-normal` (C4).** Criterion D is "**Clinical**
   neurological examination is normal". The chip label reads "Neurological examination is normal".
   The spec devotes a paragraph to the trap this word protects (the Comment permits abnormal
   psychophysical/neurophysiological testing) and then drops the word in the one string the
   clinician actually affirms. A patient with abnormal QST who correctly declines to tick it is a
   false negative — the `sev-very-severe` (U1) defect class, reproduced.
6. **Cross-scope import, GPN safety card (C8).** "Check weight **and oral intake** when swallowing
   is a trigger." Weight is directly sourced (ICHD-3 p. 172). Oral intake / dehydration appears only
   at Nahas p. 478 and is **trigeminal**-scoped; the packet expressly warns "Do not relabel it as a
   GPN airway instruction." The same warning covers relabeling it as a GPN oral-intake instruction.

**Verified clean (no drift):** GPN chip labels `loc-glossopharyngeal-territory`,
`dur-few-sec-to-2min`, `trigger-swallow-cough-talk-yawn` are co-extensive with 13.2.1 A+Note 1,
B.1 and B.4. `pifp-daily-gt2h-gt3mo` correctly uses the source word "**daily**" rather than the
packet's proposed "most days", which would have been wider than criterion B. `qual-dull-aching-
nagging` is exact. The GPN aetiology row correctly omits the "morphological change" qualifier
(the packet's 13.2.1.1-vs-13.1.1.1 trap). The teach directive "should prompt aetiological
investigations" preserves source strength exactly. All four Nahas-sourced ON and GPN rows are
faithful to pp. 480, 483, 486.

## Citation accuracy

- **`ichd3-2018`.** Section list gains `13.2.1, 13.2.1.1, 13.2.1.2, 13.2.1.3, 13.12` in numeric
  position with no bare `13.2` — correct, and the §0.1 numbering finding is load-bearing: shipping
  "ICHD-3 13.2" against these criteria would cite a heading containing no criteria. Appending the
  packet's §9.1.B block character-for-character is the right call; the reasoning that any tightening
  by the author would break the "verbatim as verified" property is correct.
- **`nahas-2024-continuum-cranial-neuralgias`.** All four metadata corrections verified against
  packet §0.3. **Removals confirmed complete** (E): airway directive, NVAF clause, GPN-carbamazepine
  clause, Nahas-attributed Level A/B grades, and the ON "first-line" framing are all absent from the
  replacement string. Every carried clause is packet-verified at pp. 476, 477, 478, 480, 483, 486.
  One residue — see C9 (the lab-monitoring sentence is an unlabeled authored digest inside a
  verbatim field, and converts the source's open "such as complete blood count and serum sodium"
  into a closed named list; that is the same field-hygiene rule the batch exists to enforce).
- **`gronseth-aan-efns-tn-2008` (new).** The rename off `cruccu-` is correct discipline: naming a
  record for the author of the document its PMID resolves to, and whose derivative supplies its
  `quoted_text`, is exactly the practice this batch enforces; `cruccu-` carrying PMID 18716236 would
  reproduce the nahas defect. **However**, `pmid` points at the Neurology practice parameter while
  `quoted_text` is transcribed from the AAN's clinician-summary derivative at a different URL. That
  divergence is disclosed in the record comment but not in the record data, and it has no evidence
  packet behind it — see C5 and C12b.
- **Newly created DOI collision (C14).** `nahas` moves to `10.1212/CON.0000000000001415`, which the
  packet verifies three ways. But `goadsby-2024-continuum-indomethacin` (registry line 2413)
  **already carries `...1415`**. After this lands, two records share one DOI. S9 item 18 defers the
  Continuum DOI drift but names only `burish` and `burch`; `goadsby` is not on that list.
- **`do-snnoop10-2019`.** Confirmed by direct read (line 2392): `quoted_text` contains
  "NeuroWiki applies the more sensitive over-50 threshold, sourced to giant cell arteritis
  epidemiology..." inside a field the engine treats as verbatim external text. This is the airway
  defect's family. It is less dangerous — self-labelled, discloses a deliberate deviation, and errs
  toward sensitivity — but it embeds a cross-source threshold synthesis in a verbatim field with no
  second `citation_id`. Deferral accepted for blast-radius reasons; ticketing is not optional (C16c).

## Editorial / expert context

Not a new-trial-entry PR, so mandatory-block condition 8 does not apply. Recorded anyway because
the packet filled it: §8a states non-applicability with reason (ICHD-3 is the entire contents of
*Cephalalgia* 38(1), so no host issue and no paired editorial) and substitutes a held expert
synthesis; §8b states a reasoned non-finding with search method and date; §8c fills guideline
incorporation for TN and states explicit non-existence for GPN and PIFP; §8d records no
contradicting evidence for the criteria, a case-series-grade evidence base for GPN management, and
names the PIFP source gap as the packet's principal limitation. No sub-item is silently omitted.

The §8c finding that the AAN/EFNS Level A/B grades belong to Cruccu 2008 and **not** to Nahas is
the finding that drives S1.c and S1.d, and it is correctly acted on.

## Freshness

- **`ichd3-2018` — HOLD at `2026-05-25`. Approved.** Same 2018 edition, same PMID, same DOI;
  ICHD-4 unpublished as of today; ICOP 2020 is a parallel classification reported "essentially
  identical" for the glossopharyngeal-referable entities. Inside the 24-month window (expires
  2028-05-25), so no hook pressure. Decisive point: refreshing would restart a 24-month clock on the
  full dependent set on the strength of a partial step-3 pass, which is the governance violation
  §13.6 exists to prevent. Holding is the conservative call and follows the 2026-07-06 §4.7
  precedent recorded in the record's own comment. Appending newly source-verified text under a held
  date is legitimate on that same precedent.
  **Correction to S9-3:** the spec states a verified floor of "19 read + 2 new = 21". `ichd3-2018`
  occurs **25** times in `claims.ts`. The unverified remainder is larger than the spec implies,
  which strengthens rather than weakens the hold. See C13.
- **`nahas-2024-continuum-cranial-neuralgias` — REFRESH to `2026-09-08`. Approved.** All six §13.6
  steps genuinely complete. Independently verified the step-3 claim: `nahas` is cited by exactly
  **two** existing claims (`clinic-headache-tn-management`, `clinic-headache-on-management`), both
  re-verified and corrected in this batch, plus two new claims. The dependent set is closed and
  fully re-verified. Step 6 dual sign-off: medical-scientist authored, this artifact is the gate.
  **The asymmetry with `ichd3-2018` is principled and approved**: one record's dependent set was
  exhaustively re-verified, the other's was not. Date movement should track verification work
  actually done, not batch membership.
- **`gronseth-aan-efns-tn-2008` — `last_reviewed: 2026-09-08`, `review_window_months: 12`. Approved.**
  The §13.7 6-month current-guideline default buys nothing against a closed 2008 document whose text
  cannot drift; the real risk is supersession by EAN 2019, a known one-time event. 12 months plus a
  tracked acquisition task is proportionate, and §13.7 permits per-citation override with rationale
  in a comment, which the record supplies. Conditioned on C16b: the acquisition task must be opened
  in this batch, and every grade-bearing row must retain its "(AAN 2008)" vintage label.

## Rationale

This spec is the strongest clinical authoring I have gated on this codebase. It found and refused
four separate opportunities to synthesize across a conflict or a source gap — the TN dose ranges,
the GPN syncope management steer, the PIFP treatment card, and the GPN evidence grade — and in each
case named the gap rather than filling it. The removal of "airway protection mandatory if swallowing
affected" from a registry `quoted_text` closes a directive that had no source in any held document,
and the ON card's "First-line" removal closes a second overstatement in the same record. Both are
worth stating plainly for the record: my round-3 predecessor approved the ON string against the
`nahas` `quoted_text`, which at that time contained the word "first-line". The predecessor was
consistent with the registry; the registry was wrong. That is §13.1 demonstrated live, and it is why
the never-drift rule protects the *source's* strength rather than the shipped string's — restoring
source strength on a live surface is mandatory, not a downgrade requiring justification.

Eight items do not clear. Seven are string-level and cheap: every correcting phrase is already
present verbatim in text this batch is shipping. The eighth is structural and is the reason this is
not a clean approve. `b-glossopharyngeal` fires on `loc-glossopharyngeal-territory` alone, and
`q-location` is single-select with "jaw" appearing in both `loc-face` ("cheek, jaw, or upper lip")
and the new `loc-throat-ear` ("...including under the angle of the jaw"). A glossopharyngeal patient
who files an angle-of-jaw presentation under `loc-face` — a plausible, arguably natural choice — gets
`loc-facial-region`, which fires `b-trigeminal` but not `b-glossopharyngeal`. On the TN screen that
patient ticks `tn-distribution` ("cheek, jaw") and `tn-trigger` ("talking") honestly, satisfying
`tn-A`, `tn-B` and `tn-C`, and receives a **full** trigeminal-neuralgia match while GPN is absent
from the output entirely and the vagal-safety teach string never renders. That is the exact
false-positive path architect condition 4 was written to close, surviving on the one route the
spec's W1 does not walk. It is pre-existing rather than introduced, but this batch's stated purpose
is GPN reachability, and shipping it while asserting the path is closed is worse than the status quo.
The fix is two coupled edits, not one: widening the predicate alone leaves `gpn-A` unsatisfiable on
that route, so a territory-confirm option is required alongside it — the same idiom `gpn-shock`
already uses to work around a single-select core screen.

Decision is approve-with-conditions rather than block because this is a pre-execution gate on a spec:
blocking would halt work that is ~95% correct and evidence-bounded, whereas binding conditions let
implementation proceed everywhere except the surfaces that carry the defects. C1-C8 are not
advisory. The post-execution gate will block on any of them.

## Required follow-ups

Consolidated condition list, per-item S9 rulings, and findings beyond S9 are recorded in the
sections below and are reproduced in full in the reviewer's report accompanying this artifact.

---

## Per-item rulings — S9 items 1-17

| # | Item | Ruling | Condition |
|---|---|---|---|
| 1 | `teachPearl`/`pitfalls` dormant; authored anyway | **approve-with-condition** | C16d. Verified independently: zero `.tsx` references. Authoring for the record is right (the type expects it, and both strings are accurate); treating it as a review-satisfying surface is not. |
| 2 | `Criterion.description` dormant; no safety content placed there | **approve** | Confirmed. Correct restraint. |
| 3 | `ichd3-2018` holds / `nahas` refreshes; partial step-3 | **approve-with-condition** | C13. Asymmetry is principled. Spec's dependent-count floor understates (25 occurrences, not 21). |
| 4 | `pifp-B` mints a conjunction chip, deviating from architect ruling (a) | **approve** | Deviation is **correct**, not tolerated. `pattern-ge-3-months` is *wider* than criterion B (satisfies on 3 months alone, ignoring >2 h/day), so reuse fails the architect's own stated rule. The architect delegated criterion-faithfulness here. Flagged rather than silent — right process. |
| 5 | `gpn-B` composite, `criteriaTotal` = 2, binary | **approve-with-condition** | C15/W9. Faithful to ICHD lettering; identical to `tn-B`; no §13.2.1.5 exists so partial has no home. Silent-drop harm is materially mitigated because the teach string renders *upstream* of the gate. Test the accepted consequence. |
| 6 | `b-glossopharyngeal` fires on territory alone | **BLOCK** | **C1.** Full-TN false positive plus GPN unreachable on the `loc-face` route. See rationale. Two coupled edits + W8. |
| 7 | `b-pifp` fires on either site chip; screen burden | **approve** | Matches criterion A ("facial and/or oral pain") exactly. Under §4, reachability of a commonly-missed diagnosis outranks one optional screen. |
| 8 | PIFP D/E as plain DROP suppress-gates | **approve-with-condition** | C15/W10. Gate strength is faithful (E has equal status to A-D). The EMIT/`exclusionReason` analysis is correct and well caught. |
| 9 | GPN safety steer: teach primary, card secondary, `SafetyStrip` untouched | **approve-with-condition** | C17. Verified `question.teach` renders unconditionally, no disclosure wrapper. Leaving `SafetyStrip` alone is right — GPN vagal content there would reach every migraine patient. |
| 10 | Restraint on syncope: history-taking only | **approve-with-condition** | C8 (scoped to the "oral intake" clause only). **The restraint itself is unambiguously correct.** Do not seek a referral steer from a new source in this batch; that is a separate Class E task with its own packet. |
| 11 | TN grades kept + re-attributed; header; `nahas` removed; Level C row added | **approve-with-conditions** | C2, C3. (a) keep+re-attribute **approve** — grades are real and decision-relevant; the defect was attribution. (b) header change **approve**. (c) `nahas` removal from `citation_ids` **approve** — no row rests on it. (d) Level C row **conditioned**. |
| 12 | Record named `gronseth-`, not `cruccu-` | **approve-with-condition** | C5. Rename is correct discipline. Conditioned because the record's `quoted_text` source has no packet behind it and I cannot resolve it from repo files. |
| 13 | `review_window_months: 12` override | **approve** | Proportionate; §13.7 permits override with rationale, which the comment supplies. Tied to C16b. |
| 14 | No TN dose range rendered | **approve-with-condition** | C16a. **Correct refusal to synthesize** — the ranges differ materially at both upper bounds. Must become a tracked task, not a silent gap. Recommendation R1 below. |
| 15 | ON "First-line" removed | **approve** | Not a downgrade of a validated recommendation — a **correction of an existing overstatement**. "First-line" was never the source's framing. No clinical content is lost: nerve blockade remains in row 2, and ICHD-3 13.4 criterion D remains in row 3 at full mandatory strength. |
| 16 | GPN aetiology rendered while resolver deferred | **approve-with-condition** | C11c. The TN card already ships this exact idiom (`clinic-headache-tn-workup`), reviewed and live — established pattern, not a novelty. Content is actionable workup guidance. |
| 17 | GPN evidence row states the narrow negative | **approve-with-condition** | C12a. **The item's own reasoning is wrong**: the rendered string ("because none has been assigned") already asserts the wider negative. It is supported by packet §8c's searched negative — only the scoping needs adding. |

---

## Findings beyond S9

- **F-A (blocking, → C1).** The `loc-face` GPN route. Detailed in the rationale. The spec's S9-6 correctly identifies the false-*negative* half (GPN unreachable) but does not identify the false-*positive* half (a confident full TN match on the same path), which is the more dangerous of the two and is exactly what architect condition 4 targets. W1 walks only the route where the patient picks the new option.
- **F-B (blocking, → C2).** The CTN population gate. Neither the spec nor the architect review raises it, and the `gronseth` `quoted_text` being shipped carries both the CTN scoping and the STN Level U statement, so the correcting text is already in hand.
- **F-C (→ C14).** DOI collision with `goadsby-2024-continuum-indomethacin` at `...1415`, created by this batch and absent from the S9-18 deferral list.
- **F-D (→ C13).** `ichd3-2018` dependent count is 25 occurrences in `claims.ts`, above the spec's stated floor of 21 and closer to the architect's "roughly twenty-four to twenty-five".
- **F-E (→ C10).** Dual-surface claim-scope gap. `clinic-headache-gpn-vagal-safety` tags both the management card and the `q-glossopharyngeal` teach string, but its description enumerates only the card rows. The teach string's first sentence (the radiation-permitted / TN discriminator) is criteria content appearing on a surface tagged with the safety claim and is described nowhere. The `ichd3-2018` `quoted_text` supports it after the append, so this is a traceability gap, not a source violation — but the description is the audit trail a future reviewer reads. Note that `q-pifp` gets this right and explicitly enumerates its teach discriminators.
- **F-F (→ C9).** The `nahas` lab-monitoring sentence is an unlabeled authored digest in a verbatim field and closes the source's open "such as" list.
- **F-G (→ C11d).** GPN `teachPearl` renders Note 1's "and/or in the ear" as "and in the ear", narrowing a disjunction into a conjunction. Harmless while dormant; a false-negative generator if the field is ever wired.
- **F-H (→ C11c).** GPN aetiology row renders ICHD-3's "There are **single reports** of..." as "reported causes being", upgrading case-report-level etiology to an established list. Category 4.
- **F-I (→ C16c).** `do-snnoop10-2019` confirmed to carry NeuroWiki editorial inside `quoted_text`. Two consecutive reviews have now seen it. Deferral accepted; un-ticketed deferral is not.

---

## Consolidated conditions for the implementer

**Blocking — clear before the corresponding surface is implemented. The post-execution gate blocks on any unmet item.**

- **C1 — Close the `loc-face` GPN route.** Two coupled edits, both required: (i) widen `b-glossopharyngeal.fires()` to `has(s,'loc-glossopharyngeal-territory') || has(s,'loc-facial-region')`; (ii) add a territory-confirm option to `q-glossopharyngeal` contributing `loc-glossopharyngeal-territory`. (ii) is not optional — under the widened predicate the spec's "a re-ask would be pure noise" reasoning no longer holds, and without it `gpn-A` can never be satisfied on the `loc-face` route. Mirrors the `gpn-shock`/`tn-shock` idiom for working around a single-select core screen. Add walk W8.
- **C2 — Restore the CTN population gate on TN card rows 1-2**, and carry the source's secondary-TN statement ("There is insufficient evidence to support or refute the effectiveness of any medication in treating pain in STN (Level U)"). Both texts are already verbatim in the `gronseth` `quoted_text` this batch ships. The card renders under the 13.1.1 parent with subtype explicitly deferred, so the scope cannot be left implicit.
- **C3 — Restore "(pimozide being no longer in use)"** to TN card row 2, or remove pimozide from the row.
- **C4 — Restore "clinical"** to the `exam-neuro-normal` chip label: "The clinical neurological examination is normal."
- **C5 — File an evidence-packet addendum for the AAN clinician summary** before `gronseth-aan-efns-tn-2008` ships: URL, retrieval date, page count, and the verbatim grade statements. A new citation record carrying Level A/B/C/U grades that drive a live drug-choice card currently has its only provenance record inside a spec document.
- **C6 — Reframe q-pifp teach sentences 4 and 5 as discriminators, not identifications**, and correct the subform numbering to 13.1.1.1.2 / 13.1.1.3.2 (bare "13.1.1 with concomitant continuous pain" is not an ICHD-3 entity, and this batch's headline finding was a numbering error).
- **C7 — Restore the source's attribution** in q-glossopharyngeal teach: the vagoglossopharyngeal-for-asystole usage is what "some authors have suggested", not what ICHD-3 records.
- **C8 — Bound the GPN nutrition row to weight**, or attribute the oral-intake/dehydration content to Nahas p. 478 with its trigeminal scope stated.

**Non-blocking conditions**

- **C9** — Label the `nahas` lab-monitoring sentence as a digest, or quote the source's "such as complete blood count and serum sodium" phrasing.
- **C10** — Extend the `clinic-headache-gpn-vagal-safety` description to enumerate the teach string's content, including the radiation-permitted discriminator.
- **C11** — Editorial precision set: (a) `pifp-poorly-localized-non-nerve` → "a peripheral nerve", not "a single nerve"; (b) `pifp-dental-cause-excluded` → "investigations" (plural, per criterion E); (c) GPN aetiology row → "single reports describe", not "reported causes being"; (d) GPN `teachPearl` → "and/or in the ear".
- **C12** — (a) Scope the GPN evidence row to what was searched ("no major-society guideline has assigned one") and correct S9-17's reasoning in the record; (b) make the `gronseth` record self-describing at the data level that `quoted_text` is transcribed from the AAN clinician summary rather than the Neurology parameter the PMID resolves to.
- **C13** — Derive the `ichd3-2018` dependent count mechanically; do not ship the literal `<N>`; record that the verified subset was 19 of ~25.
- **C14** — Add `goadsby-2024-continuum-indomethacin` to the deferred Continuum DOI task, and comment the `nahas` record so a future reader does not "correct" `...1415` back to `...1414`.
- **C15** — Walks. **W8** (blocking, per C1): GPN persona answering `loc-face` — assert GPN present and TN not `full`. **W9**: GPN near-miss, 3 of 4 B sub-items — assert GPN absent *and* the q-glossopharyngeal teach rendered. **W10**: PIFP with A/B/C ticked and E unticked — assert PIFP absent *and* the q-pifp option labels and teach rendered. W9/W10 convert two knowingly-accepted silent-drop behaviours into tested ones.
- **C16** — TASKS.md entries opened **in this batch**: (a) TN dose-conflict adjudication, `blocked:awaiting-clinical-review`; (b) acquire Bendtsen EAN 2019, with every grade-bearing row retaining its "(AAN 2008)" vintage label meanwhile; (c) `do-snnoop10-2019` `quoted_text` editorial removal at **P1**, not "recorded"; (d) `teachPearl`/`pitfalls` wire-or-delete.
- **C17** — `ui-architect` confirmation of the two GPN safety surfaces per architect condition 9.

**Recommendation (non-binding)**

- **R1** — Consider a visible "no dose shown" row on the TN card stating that the held sources give different target ranges. Silent absence of dosing on a bedside tool is its own hazard, and the GPN treatment card's "Evidence" row already establishes the idiom for rendering a sourced negative. Deliberately not a condition: it is newly authored content and would need its own review pass.

**Answers to the eight specific questions asked:** (A) per-item table above. (B) TN/ON strings — ON approved as a correction of an existing overstatement; TN approved on attribution, structure and grade retention, blocked on the CTN gate (C2) and the pimozide qualifier (C3). (C) teach strings — q-glossopharyngeal sentences 1, 3 and 4 clean, sentence 2 conditioned (C7); q-pifp sentences 1-3 clean, sentences 4-5 conditioned (C6). BC-7/BI-1 standard otherwise met: no natural-history assertion exceeds held text and both workup instructions are bounded by sourced associations. (D) surface choice approved, dual-surface registration mechanically sound and scanner-verified, description gap conditioned (C10). (E) `nahas` rewrite — all five removals confirmed complete, every carried clause packet-verified, one digest residue (C9). (F) chip labels — six clean, two conditioned (C4 blocking, C11a/b non-blocking). (G) `last_reviewed` asymmetry approved as principled, with the dependent-count correction (C13). (H) W1-W7 do not cover the risks I see: W8, W9 and W10 required (C15).

---

**Correction 2026-09-09 (from the post-execution gate).** Finding F-D's `ichd3-2018` dependent-claim count of "25" counted all string occurrences in `claims.ts`, including prose mentions inside `description` fields. Counted from `citation_ids` arrays, the figure is **22 before this batch, 26 after**. The implementer's shipped comment (22, with 19 verified) is correct; this finding is amended so the two artifacts agree.
