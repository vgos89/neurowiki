# Clinical review — PFO closure for migraine (Phase 3)

**Decision (round 1):** block
**Reviewer:** clinical-reviewer (model: claude-opus-5), fresh context
**Date:** 2026-07-31

Round 1 blocked on 4 findings. Remediation and re-review status are recorded at the
bottom of this file. This artifact is append-only.

## Scope
- Claims touched: `pfo-closure-migraine-synthesis`, `mist-pfo-migraine-2008`, `prima-pfo-migraine-2016`, `premium-pfo-migraine-2017`
- Citations affected: `dowson-mist-2008`, `mattle-prima-2016`, `tobis-premium-2017`, `mojadidi-pfo-migraine-pooled-2021`, `kavinsky-scai-pfo-2022`, `vadod-headache-cpg-2023`
- Surfaces changed (§13.3): structured data in `src/data/` (trialData, trialCatalogMeta, trialListData, trialListData.cardmeta.generated, trial-questions, clinicalSynthesesByQuestion) · static JSX and string literals in `src/pages/trials/TrialPageNew.tsx` · chart labels and ARIA labels via `DeltaBandChart` · badge text (`legend.bottomLineTag`, BottomLineDrawer result chip) · JSON-LD `answer` and route meta in `src/seo/`
- Evidence-verifier packet: `docs/evidence-packets/2026-07-30-pfo-migraine.md`
- Trial-statistician report: absent at round 1; commissioned during remediation (see below)

## Semantic validity

### Confirmed — the three high-risk corrections held
Packet corrections #7, #10 and #11 propagated to every surface, each checked independently:
- **The pooled analysis is never called sham-controlled.** Verified at `clinicalSynthesesByQuestion.ts:51`, `trialData.ts:18812`, `:18935`, `:18942-18943`, `:18981`, `:18983`, `:19003`, `registry.ts:1473`, `claims.ts:339`, `claims.ts:705`, `schema.ts:677`. All state PRIMA was unblinded with no sham and that MIST was excluded.
- **VA/DoD is never rendered as "insufficient evidence."** `clinicalSynthesesByQuestion.ts:53` and `schema.ts:677` both carry the affirmative disambiguation. `registry.ts:1505-1514` records Recommendation 40, Weak against.
- **The null conventional responder rate (38% vs 29%, P=0.13) is stated, not omitted**, at `clinicalSynthesesByQuestion.ts:51`, `trialData.ts:18943`, `:18953`, `:18981`, `:18983`, `:19003`, `registry.ts:1473`, `schema.ts:677`.

Also cleared: the "all three missed their primary" framing holds on every surface including the JSON-LD answer; no NNT anywhere (every mention is an explicit suppression statement); no fabricated CI (all `DeltaBandChart` calls pass empty `ciLow`/`ciHigh`); no cross-question contamination in either direction, and no PFO content leaked into the headache pathway components; no U+2014 in any rendered string; and the PRIMA days-not-percent trap is clean on all five surfaces checked (catalog card, legend keyStat, SEO answer, synthesis, render block). No `2.9%` or `1.7%` exists anywhere in `src/`.

### BLOCK 1 — PREMIUM rendered an absolute risk difference on a null co-primary, with no CI
`TrialPageNew.tsx` passed `treatmentPct={38.5} controlPct={32.0}` to `DeltaBandChart`. In that
component `arr = 6.5`, which cleared the `arr >= 2` threshold, so the page drew a cobalt band over
dots 32-37 and announced to assistive technology: **"Delta band: 7 extra recoveries per 100
patients."**

The endpoint was the efficacy co-primary, **not met**, 38.5% vs 32.0%, **P=0.32**, with no
confidence interval anywhere on the page. "7 extra recoveries per 100" is an unqualified
causal-benefit claim and arithmetically an NNT of ~15, which the packet prohibits outright. A
screen-reader user received only that sentence; the P=0.32 caption is separate text.

It contradicted, in order: the packet ("no absolute risk difference may be displayed without a CI";
"NNT is PROHIBITED for every source here"); its own caption twelve lines below ("the between-arm
difference is not stated as a number and no NNT is computed"); its own record; and its own
`howToReadChart`. This is the render-block-contradicting-its-own-record case.

### BLOCK 2 — PREMIUM's always-visible result chip read a bare "Negative"
`BottomLineDrawer` received `trialResult` = `NEGATIVE` with no override, producing a persistent
"Negative" chip. PREMIUM is co-primary: efficacy not met, **safety met**. The record forbids the
flat framing in four separate places (`trialData.ts:18934`, `:18906`, `:18981`, `:19003`). The
expanded drawer body carried both, but the chip is the always-visible surface.

### BLOCK 3 — three per-trial claims asserted guideline strengths their citations did not carry
`mist-pfo-migraine-2008`, `prima-pfo-migraine-2016` and `premium-pfo-migraine-2017` mapped only
trial citations, while the prose rendered under them asserts "SCAI 2022 conditional recommendation
against, moderate certainty" and "VA/DoD 2023 Recommendation 40, Weak against" at
`trialData.ts:18597`, `:18630`, `:18633`, `:18651`, `:18772`, `:18810`, `:18813`, `:18829`,
`:18945`, `:18981`, `:18984`, `:19003`. `registry.ts:1408` and `:1429` contain no guideline text.
Recommendation strength is a never-drift category. `prima-pfo-migraine-2016` also failed to map
`mojadidi-pfo-migraine-pooled-2021` while stating that analysis's N, design and result.

### BLOCK 4 — the evidence packet has no §8 at all
`docs/evidence-packets/2026-07-30-pfo-migraine.md` carries no "Expert and editorial caveats"
section and no 8a/8b/8c/8d sub-items. Sub-item audit:
- **§8a** — partially addressed: all four accompanying editorials identified by title, author,
  journal, volume and DOI, and stated paywalled or bot-gated. Explicit, so §8a alone would not
  block. **But** the packet also states the PREMIUM editorial (Whisenant & Reisman, JACC
  2017;70(22):2775-2777) and the pooled-analysis editorial (Ahmed & Sommer, JACC
  2021;77(6):677-679) "should be obtained before the interpretive framing is finalized." The
  framing was finalized without them.
- **§8b — silently absent for all four sources.** This triggers the mandatory block. The
  Wilmshurst authorship refusal is an authorship dispute, not a letters search; MIST's
  post-publication controversy record is not characterised; nothing on PRIMA or PREMIUM
  correspondence.
- **§8c, §8d** — substantively complete but unlabelled.

### Further findings (non-blocking, all required)
- **Fabricated rationale for the MIST exclusion.** `clinicalSynthesesByQuestion.ts:51` said MIST
  "was excluded because it used a different device"; `claims.ts:339` said "on device grounds". The
  packet records the exclusion but states **no reason**. Not neutral invention: supplying a benign
  methodological reason makes the pooled analysis look more defensible than the bare fact that the
  field's other sham-controlled trial was left out, which is the packet's actual point.
- **Synthesis implied significance for PRIMA's responder rate.** The "separated … while … did not"
  construction placed the 38% vs 15% responder rate on the separated side. Packet correction #4
  grades that P value UNVERIFIED and names it under "do not publish."
- **Packet-required `howToInterpret` caveats incomplete.** Industry device sponsorship appeared in
  `limitations` on all three but in no `howToInterpret`; the pooled-analysis caveat was absent from
  PRIMA's `howToInterpret` despite PRIMA being one of the two trials pooled.
- **Unsourced facts in the hand-written render blocks.** "in the United Kingdom", "(NMT Medical)",
  "at centres in Europe", "at sites in the United States" appear in neither the packet nor the
  records. Geography bears on generalizability.
- **MIST caption asserted an inexact identity.** 3/74 = 4.05% and 3/73 = 4.11% are not "the same
  rates"; the event counts are identical, the denominators are not.
- **`listCategory: 'antiplatelets'` rationale partly inherited in error.** None of the three has an
  antiplatelet comparator: MIST's was sham, PREMIUM's a sham right heart catheterization, PRIMA's
  unspecified medical therapy.

## Citation accuracy
All six citations resolve to packet-verified metadata. `dowson-mist-2008` correctly grades the
P=0.027 day signal as exploratory and outlier-excluded and records the Correction and the co-PI's
refusal. `mattle-prima-2016` carries corrections #1-#4 including the deliberate absence of a
responder-rate P value. `tobis-premium-2017` carries the co-primary structure explicitly with the
safety co-primary recorded as met. `mojadidi-pfo-migraine-pooled-2021` identifies the 1.2-day
figure as a between-group difference rather than an effect estimate, carries the null responder
rate, and is typed `source: 'review'`, the right call for a post-hoc pooled re-analysis.
`kavinsky-scai-pfo-2022` matches the packet's verbatim PMC extract; note its trailing strength
parenthetical is a repo-convention addition disclosed in the adjacent comment, so the `quoted_text`
is no longer strictly verbatim. `vadod-headache-cpg-2023` matches Recommendation 40, Weak against;
no DOI exists, `url` is the VA/DoD landing page.

## Editorial / expert context
See BLOCK 4. Not satisfied at round 1.

## Freshness
All six carry `last_reviewed: '2026-07-31'`, honest: `registry.ts:1382-1384` records the NCBI
E-utilities metadata confirmation performed that day and notes no statistic came from it. Trial
citations use a documented 36-month override (§13.7 landmark-trial window); both guideline
citations sit in the standard 6-month window. No §13.6 refresh is involved: these are six new
citations.

## Rationale
The clinically dangerous content in this PR is right. The three regressions the gate was asked to
hunt for did not occur, the governing framing holds on every surface including the JSON-LD answer,
the PRIMA days-not-percentage trap is handled correctly, no NNT or fabricated CI appears anywhere,
and the two PFO questions are cleanly firewalled. What blocked it was a governance gap and a
rendering-layer defect that the prose gets right and the components get wrong: PREMIUM's page drew
a delta band announcing "7 extra recoveries per 100 patients" on a P=0.32 co-primary, twelve lines
above its own caption promising the difference is not stated as a number, while its always-visible
chip read a bare "Negative" the record forbids in four places. Both are the same failure mode the
record spent thousands of words guarding against, reintroduced by components that never read the
record.

---

# Remediation — 2026-07-31

Applied by the orchestrator in response to round 1. Every item is listed with its disposition;
nothing was silently dropped.

## Blocking

**BLOCK 1 — fixed at the component, not the call site.** The reviewer offered two routes: replace
PREMIUM's chart, or gate the band on an absent CI. Neither was taken as offered, because
enumerating all 17 blank-interval call sites showed a blanket CI gate would strip the band from
**DAWN** (Bayesian posterior >0.999) and **LASTE** (P<0.001), where the difference is real and no
CI is passed to this component. That would have been the opposite error.

The rule shipped instead: the band is suppressed when the p-value is **explicitly
non-significant** (parseable, ≥0.05, not prefixed `<`), or when a new `suppressBand` prop is
passed. PREMIUM (P=0.32) is suppressed automatically. DAWN and LASTE are untouched.

The same enumeration surfaced a **worse pre-existing defect**: **ANNEXA-4** is a single-arm cohort
whose call site passes `controlPct={0}` as a placeholder, so the band was reading **"82 extra
recoveries per 100 patients" against an arm that does not exist**. That cannot be inferred from the
numbers, so it now passes `suppressBand` explicitly. Fixed in the same change and disclosed here
because it was found, not because it was in scope.

**The defect was systemic, not PFO-specific.** All 95 `DeltaBandChart` call sites were enumerated
and the built HTML checked page by page. Seven pages lost a band. Every one of the six that lost it
to the p-value rule carries `primaryResult: 'not-met'`, and the seventh is the single-arm case:

| Trial | Displayed | Recorded result | Reason band removed |
|---|---|---|---|
| PREMIUM | "7 extra recoveries per 100" | NEGATIVE / not-met | P=0.32 |
| THEIA | "18 extra recoveries per 100" | NEUTRAL / not-met | P=0.95 |
| ASTER | band drawn | NEUTRAL / not-met | P=0.53 |
| ASTER2 | band drawn | NEUTRAL / not-met | P=0.17 |
| BP-TARGET | band drawn | NEGATIVE / not-met | P=0.84 |
| ESCAPE-NA1 | band drawn | NEGATIVE / not-met | P=0.35 |
| ANNEXA-4 | "82 extra recoveries per 100" | single-arm cohort | `suppressBand` (no comparator) |

**No trial with a met primary lost a band.** DAWN's survives and was verified present in the built
HTML ("Delta band: 36 extra recoveries per 100 patients"); LASTE passes `P<0.001` and is untouched
by construction. That the p-value rule and the independently-recorded `primaryResult` field agree on
all six is the check that the rule is drawn in the right place: six trial pages were telling
clinicians a treatment produced extra good outcomes on endpoints those trials did not meet.

**BLOCK 2 — fixed.** PREMIUM's `BottomLineDrawer` now passes
`resultBadgeOverride="Efficacy not met · safety met"`. (Round 2 correction: this does NOT match `legend.bottomLineTag`, which reads `'Efficacy not met'`. The tag is defensible as written because it names the domain rather than asserting a flat negative, but the parity claim above was wrong.)

**BLOCK 3 — fixed.** `kavinsky-scai-pfo-2022` and `vadod-headache-cpg-2023` mapped to all three
per-trial claims; `mojadidi-pfo-migraine-pooled-2021` added to `prima-pfo-migraine-2016`. Each
addition carries a comment naming why the guideline citations are required there.

**BLOCK 4 — routed to `evidence-verifier`, not self-certified.** The packet cannot be completed by
the party whose work it gates. The verifier was tasked with §8b for all four sources (PubMed
"Comment in"/"Comment on" linkage as the primary route, and a proper characterisation of the
Wilmshurst dispute), with resolving the §8a precondition by obtaining or explicitly failing to
obtain the two named editorials, and with labelling §8c/§8d. Instructed to flag loudly and first
if anything found contradicts what is shipped.

## Required, non-blocking — all applied

| # | Item | Disposition |
|---|---|---|
| 6 | Fabricated MIST-exclusion rationale | Removed from both surfaces; replaced with "The published analysis states no reason for that exclusion, and neither do we." |
| 7 | PRIMA responder rate implied significant | Restructured out of the "separated" contrast; now carries the record's "could not be verified" note |
| 8 | Industry-sponsorship caveat missing from `howToInterpret` | Added to all three `cautions` |
| 9 | Pooled-analysis caveat missing from PRIMA `howToInterpret` | Added |
| 10 | Unsourced geography and sponsor in render blocks | All four assertions removed rather than sourced |
| 11 | MIST "same rates" | Reworded on both surfaces to the same event *counts*, with denominators named |
| 12 | `listCategory` rationale | Comment now states explicitly that the stroke cluster's antiplatelet-comparator reason does **not** transfer: MIST sham, PREMIUM sham catheterization, PRIMA unspecified medical therapy |
| 13 | Trial-statistician report | Commissioned. Asked to review the BLOCK 1 fix **adversarially** and name any call site the p-value rule breaks |
| 14 | One-way question link | `pfo-closure-migraine` added to `pfo-closure-cryptogenic.relatedQuestions` |
| 15 | `TASKS.md` "PRIMA 2015" | Corrected to 2016 |

## Structural findings carried forward
Two notes the reviewer raised as orchestrator-level rather than PR-level, both tracked in
`TASKS.md` rather than fixed here:
1. `TrialPageNew.tsx` contains **zero** `data-claim` attributes repo-wide, so all hand-written
   render-block prose sits outside hook coverage. Findings 3, 10 and 11 all live in that blind
   spot and it will keep producing this class of defect.
2. Findings BLOCK 1 and BLOCK 2 are both cases where a **component silently overrode a carefully
   written record**. Whether new trial render blocks should be required to derive chart props from
   the record rather than hard-coding literals is a Class D question.

---

# Trial-statistician report — 2026-07-31

Commissioned during remediation (round-1 item 13, "Trial-statistician report: absent").
Read the packet, the three records, their render blocks, **all 96 `DeltaBandChart` call
sites**, `check-claims.ts`, the synthesis, and `trialNarrative.ts`.

## On the three trials: cleared
- **NNT** absent from every surface on all three; the prohibition reasoning confirmed correct
  (all three primaries null; every positive figure secondary, post-hoc or re-defined; PRIMA's
  continuous primary additionally non-invertible).
- **Confidence intervals** displayed nowhere; the blank-`ciLow` path verified to unmount the
  interval row and its tooltip.
- **Between-arm differences** as numbers: none. The string "1.2" appears on no surface.
- **Required caveats** all present on all three records. No additions required.
- **The 2021 pooled analysis** handling is "statistically sound, nothing to fix," and the page's
  allocation of interpretive weight to it is "calibrated correctly."

## On my band fix: right in intent, insufficient in two ways
The report confirms **zero false suppressions** across all 96 call sites: 8 charts changed and all
8 were null primaries or a single-arm cohort. It then identified two classes the p-value
discriminator misses, both of which are now fixed:

**1. Harm-direction bands announcing harm as recovery.** The band is drawn on the *treatment*
grid and announced as "extra recoveries." When the control arm wins, those extra dots are extra
*bad* outcomes. Three live instances:

| Trial | Was displaying | What the dots actually are |
|---|---|---|
| SAMMPRIS | "9 extra recoveries per 100 patients" | 9 extra strokes and deaths (14.7% vs 5.8%, stopped for harm) |
| PATCH (×2 blocks) | "16 extra recoveries per 100 patients" | 16 extra death-or-dependence outcomes (mRS 4-6) |

All three survived the p-value gate because their p-values are significant: these are real,
significant *harm* results. Fixed with a `winnerArm === 'control' && arr > 0` predicate, verified
to catch exactly these three and touch nothing else (the other three `winnerArm="control"` sites
have negative `arr` and never drew a band).

**2. Noninferiority trials drawing superiority bands.** A significant NI p-value means "not worse
by more than the margin," which is a *no-difference* conclusion; the gate read it as evidence of a
difference. Two sub-cases, both fixed:
- Unparseable p-strings (`"NI met"`, `"Non-inf"`, `"Met per-protocol"`) became `NaN` and were
  treated as **significant**. Now treated as not-establishing-a-difference. This alone fixed
  SARODE ×2, ORIGINAL, ACT, TRACE-2, and **TASTE**, whose NI was *not* met in ITT.
- Four sites whose NI p parses as significant (ARAMIS, COMPASS, DEVT, PROST-2) now derive
  `suppressBand` from the record's own `primaryDesign`.

**Where I did not follow the report.** It recommended replacing the discriminator with
`primaryDesign ∈ {binary-superiority, bayesian-superiority} && primaryResult === 'met'`. A
post-build audit of every prerendered page showed that gate would strip bands from **nine pages
where the band is legitimate**: DECIMAL, DESTINY and HAMLET chart *6-month survival*, a secondary
endpoint that was significant at p=0.001, while `primaryResult` describes the null primary; and
MR CLEAN, REVASCAT, SWIFT PRIME, SELECT2, ANGEL-ASPECT and DEFUSE-3 chart binary functional
independence on trials whose ordinal primary was met. That is the same over-correction as the
blanket-CI rule, in the other direction. The narrower fix removes every defect the report named
without touching those nine.

## Also fixed from the report
- **`check-claims.ts` Check 4 could not enforce the packet's central constraint.** Two holes:
  a null `primaryDesign` caused `continue`, silently exempting exactly the records nobody had
  validated; and `primaryResult` was never read, so a `binary-superiority` trial that *missed*
  its primary could carry an NNT through the hook. Both closed, and **both verified to fire** by
  temporarily injecting an NNT into PRIMA (null design) and PREMIUM (not-met) and confirming the
  hook fails on each. This matters beyond PFO: it was the only hook-enforced NNT guard in the repo.
- **PRIMA's panel copy** (findings B-1, B-2). The captions now name the estimand ("vs its own
  3-month baseline"), and the between-arm card no longer explains the *absent CI* but instead
  pre-empts the reader's own subtraction: each figure is a within-arm reduction from its own
  baseline, the trial's comparison was model-based, so 2.9 − 1.7 is not the trial's estimate.
  The previous wording invited exactly the recomputation the packet forbids.
- **The threshold notes are now gated with the band** and suppression is *explained* rather than
  silent, so a missing band reads as a decision, not a rendering fault.
- **The stale cluster header comment** (finding G-1) told a future editor the three records ship
  untagged and to tag them before shipping. They are tagged and registered; following it literally
  would have stripped three clinical surfaces of their `claimId`, which §13.3 forbids and which the
  hook cannot detect because it cannot see an *absent* tag.

## Parked, not fixed — tracked in TASKS.md
Schema work too large for this PR and each affecting many records:
- `continuous-superiority` design enum + a `continuous-delta` archetype for PRIMA-shaped trials
  (the report specifies seven required elements, of which per-arm **dispersion** is the one whose
  absence is currently invisible).
- `coPrimary[]` + a `'co-primary-split'` sentinel for `primaryResult`, so a co-primary trial cannot
  be read as half a verdict by any consumer. The report's judgement: if only one change ships, this
  is the one, because the sentinel turns a silent half-truth into a loud unknown at every read site.
- A `unit` field on `EfficacyResults`. PRIMA stores **days** in a field typed `percentage`, and
  `TrialPageNew.tsx:105` would render `"2.9% with Amplatzer PFO Closure"` — it does not render
  today only because PRIMA returns early from a dedicated block. One refactor away from shipping.
- Whether a delta band should be drawn at all on a *secondary* endpoint of a trial that missed its
  primary (DECIMAL, DESTINY, HAMLET). Defensible today because the charted endpoint is itself
  significant, but it is an ARD on a failed-primary trial and deserves an explicit decision.
- `trialNarrative.ts:31` prints an ARD with no interval for any trial routed to the generic
  fallback.
- The band `div` carries an `aria-label` with no `role`, so it is likely never announced. The harm
  was visual, not auditory. Worth correcting the JSDoc so the next reader does not over-trust it.

---

# Clinical review — ROUND 2

**Decision (round 2):** block
**Reviewer:** clinical-reviewer (model: claude-opus-5), fresh context
**Date:** 2026-07-31

## All four round-1 blocks verified genuinely closed
Each checked in source rather than accepted from the remediation record:
- **BLOCK 1** — `showBand` logic read in full and judged correctly drawn. PREMIUM's call site passes the record's own p-value rather than a literal, so a future re-grade propagates. Deliberately not gating on `hasInterval` confirmed as the right call.
- **BLOCK 2** — `resultBadgeOverride` verified to actually override the derived label and force neutral styling.
- **BLOCK 3** — guideline citations mapped to all three per-trial claims.
- **BLOCK 4** — packet §8a/8b/8c/8d all present for all four sources, with negatives stated explicitly rather than silently.

Also re-verified as still holding: PRIMA days-not-percent on every surface, no NNT, no fabricated CI, no rendered em-dash, and the two PFO questions still firewalled.

## The new content passed
Every figure in the Silalahi 2024 paragraph was checked against packet §8d and is exact: 5 RCTs + 6 observational, attacks SMD −0.34 (−0.51 to −0.18), days SMD −0.30 (−0.53 to −0.08), complete resolution null at P=0.24 on randomized evidence, HIT-6 P=0.08, MIDAS P=0.15. The reviewer's assessment: *"This is the highest-risk new prose on the page and it is right."* The 2025 expert opinion is never rendered as a graded guideline (`source: 'review'`, status stated in the `section` field, Abbott funding inside the quoted text and disclosed on the only surface citing it).

On the deferral of DECIMAL, DESTINY and HAMLET: *"leaving them and tracking the question in TASKS.md is correct."*

## BLOCK 5 — the suppression note told clinicians four randomized trials were not randomized
`DeltaBandChart.tsx` checked `suppressBand` **before** the p-value branch, so any call site passing that prop rendered the fixed string *"Not a randomized comparison, so no difference band is drawn."* Four sites derive `suppressBand` from `primaryDesign === 'noninferiority'`, and all four are randomized trials with `arr >= 2`, so all four rendered it: **ARAMIS, PROST-2, DEVT, COMPASS**.

Each page then contradicted itself within a few lines: ARAMIS is described on the same page as an "Open-label blinded-endpoint NI RCT", PROST-2 as a "Phase 3 open-label NI RCT", DEVT as a "Multicenter Chinese noninferiority RCT", and COMPASS carries an amber callout immediately above the chart calling it a noninferiority design.

This was **newly introduced by the remediation**, not pre-existing: before it, DEVT rendered no note and the other three rendered a hedge. One boolean was carrying two different reasons.

**Fixed** by splitting the reason into a `suppressReason` discriminator (`'no-comparator' | 'noninferiority' | 'ordinal-primary'`). The four NI sites now read *"Noninferiority conclusion, so no superiority band is drawn: the trial tested whether this arm is not worse by more than a pre-set margin, not whether it is better."* PATCH takes `'ordinal-primary'`. B_PROUD, BEST-MSU and ANNEXA-4 keep the original wording, which is accurate for them.

## BLOCK 6 — the MIST authorship correction was half-applied and broke six surfaces
The round-1 rewording used blanket string replacement. It left three distinct defects:
- **Two surfaces still asserted one person** (`safetyData`, `keyMessage`).
- **Four surfaces carried an orphaned singular predicate**, rendering the ungrammatical *"two members of the trial steering committee refused authorship, **is not an author**, and objected specifically to that exclusion"* on the live trial page.
- **The break was inside `dowson-mist-2008.quoted_text`** — the reference text this gate validates claims against. A corrupt `quoted_text` cannot support any downstream claim.

**Fixed** on all nine occurrences across four files, by reading each sentence and repairing it individually rather than pattern-matching a third time. Every repaired sentence was then re-read in full to confirm it parses. The stale registry comment naming a single person was also corrected, and now names both members with the open-access source.

**Both hard constraints from packet §8b were confirmed respected** in round 2: no surface names the GMC-sanctioned individual, and no surface states or implies the Circulation paper was retracted or flagged.

## Non-blocking items, all applied
| # | Item | Disposition |
|---|---|---|
| 5 | "including the principal cardiologist" is an unsourced role assignment | Removed from all three surfaces |
| 6 | `claims.ts` synthesis description still said "the co-PI declined authorship" | Corrected |
| 7-8 | Six colon-enumerations presented SCAI + VA/DoD as the complete set of society documents | Colon framing dropped: "…recommends against, and none endorses it. Among them, …". SEO description reworded to a form that does not depend on a count, kept byte-identical across `routeMeta.ts` and `schema.ts` at 155 chars. `bottomLine` now names all three and labels the 2025 document as expert consensus rather than a graded guideline |
| 9 | `silalahi-pfo-migraine-meta-2024` had a `review_window_months: 36` override with no §13.7 rationale | Rationale stated: a completed review with a fixed search date is static, and packet §8d records that nothing supersedes it |
| 10 | "neither validated disability instrument moved" reads a non-significant result as an established absence | Changed to "separated" |
| 11 | The round-1 remediation record claimed `resultBadgeOverride` matches `legend.bottomLineTag`. It does not | The inaccurate claim is corrected in place above. The tag itself is defensible: it names the domain rather than asserting a flat negative |

## Carried to TASKS.md, not this PR
- The band `aria-label` hard-codes "extra recoveries" regardless of endpoint, which is wrong for the survival endpoints on DECIMAL, DESTINY and HAMLET. Latent, not live: the band sits inside a `role="img"` element, so the label is not exposed to assistive technology at all. **This also corrects the round-1 rationale**, which assumed the string was being announced. The harm was visual throughout.
- Check 4 sees only `calculations.nnt`; a literal NNT in JSX is invisible to it (`TrialPageNew.tsx:2048`).
- CLAUDE.md §10.3 documents the humanizer scanner's TARGETS as a fixed file list; the scanner actually walks whole directories. The doc understates the wall.

---

# Clinical review — ROUNDS 3 and 4

Rounds 3 and 4 each blocked, and in each case the *remediation* introduced the new
defect. The round-3 reviewer named the pattern exactly: **"each fix is applied to the
instances the last review named rather than to the class the last review described."**
That diagnosis is the most valuable output of this review chain and is why round 4's
fixes are written against the record rather than against a predicate.

## Round 3 — block, and what it found

**BLOCK 7 — six pages printed a noninferiority verdict as a p-value.** Round 2 split the
suppression note's `suppressBand` branch but left its sibling. The statistician's
unparseable-p rule routes NI call sites through that sibling, so five pages rendered
*"Difference not statistically significant (p = NI met)"* — verified in the built HTML on
SARODE ×2, ORIGINAL, ACT, TRACE-2 and TASTE — directly above copy stating noninferiority
**was** established at P<0.001. `p = NI met` is not a p-value, and "not statistically
significant" is a null verdict on a question the trial never asked.

**BLOCK 8 — three claims asserted a universal they did not carry.** Round 2's de-closing
enlarged "both societies" into "every society document that has addressed this," a
universal quantifier, on three trial pages whose claims mapped only two of the three
documents establishing it. Round-1 BLOCK 3 one level up.

**Plus a live pre-existing defect found in passing:** `DeltaBandChart` rendered
"Negligible absolute difference" for any `arr < 2`, **including large negative gaps**.
OPTIMAL-BP (39.4% vs 54.4%, `arr −15.0`) printed it directly beneath its own STOPPED FOR
SAFETY callout reporting that exact deficit. Thirteen pages were calling a ≥2-point
deficit negligible.

## The class fixes applied

- The note now distinguishes **three** p-states, not two: numeric-significant,
  numeric-non-significant, and **unparseable**. An unparseable value is treated as
  *unknown* — the band is still suppressed, but the component says nothing and never
  prints the string after "p =".
- `suppressReason` was applied to **every** trial in the repo whose `primaryDesign` is a
  noninferiority variant (15 call sites), not only the ones round 3 named.
- The "Negligible" branch is gated on `Math.abs(arr) < 2`.

## A defect I introduced and caught before shipping

Fixing the negative-gap case, I first added *"The intervention arm did worse on this
endpoint"* for any `arr <= -2`. Enumerating the affected pages showed that was **backwards
on positive trials**: on a bad-outcome endpoint a lower number is better, so it told
CLOSE (0% vs 6% recurrent stroke), DEFENSE-PFO (0% vs 12.9%), REDUCE, RESPECT, CREST-2,
EAGLE, ENRICH, BEST-II, DIRECT-SAFE and SWIFT-DIRECT that their intervention did worse.
The component sees two numbers and cannot know endpoint polarity. Caught by the
enumerate-then-verify pass, before any review saw it.

## Round 4 — block on PRISMS, and a refutation

**BLOCK 9 (confirmed, fixed).** My first guard for the above required
`winnerArm === 'control'`. That prop is **styling**, not evidence — its own contract is
"which arm gets the cobalt accent," and PRISMS uses `'control'` merely as a direction
hint. So PRISMS rendered *"The intervention arm did worse on this endpoint"* while the
same card showed `RD −1.1 pp, 95% CI −5.6 to +3.4, p = NS`, an interval **crossing zero**;
its record carries `primaryResult: 'terminated-administrative'` (stopped for slow
enrolment at 33% of planned enrolment, with a committed Class E comment correcting it
*away* from `futility-stopped`); and its own pearl says only that the direction **"did not
favor"** alteplase. A hedge in the record became an assertion on the page. PRISMS governs
whether to thrombolyse NIHSS ≤5 nondisabling stroke, so "no benefit demonstrated,
underpowered" and "alteplase did worse" are different inputs to a real bedside decision.

**Fixed at the root the reviewer identified**, not with another predicate: `DeltaBandChart`
now accepts the record's `primaryResult` and gates the harm sentence on
`primaryResult === 'harm-stopped'`. That cleanly separates the three genuine harm trials
(SAMMPRIS, NOR-TEST 2, OPTIMAL-BP) from PRISMS and PATCH. The six call sites declaring a
control winner now pass the record's own verdict.

**BLOCK 10 (refuted).** Round 4 reported that CHANCE renders the "design verdict" note
because its `stats.pValue.value` holds `'HR 0.68 (95% CI: 0.57-0.81), p<0.001'`. Checked
in source and in the built HTML: CHANCE's `pValue.value` is `'<0.001'` (the HR lives in
`effectSize`), CHANCE draws its band correctly ("Delta band: 4 extra recoveries"), and
**no page in the build renders that note at all** — the branch was unreachable, because
every NI site now carries an explicit `suppressReason` that takes precedence. The same
applies to the INSPIRES, CHANCE-2 and THALES instances reported as latent. No data edit
was made to those four records; editing a correct `pValue` field on four foundational
antiplatelet trials on the strength of an unverified line reference would have been the
more dangerous action. The branch was nonetheless made silent, since an unreachable branch
that asserts something is a landmine.

## Round-4 non-blocking items applied
- The NI note now reads "Noninferiority **design**" rather than "conclusion," and defers
  the verdict to the text above. DIRECT-SAFE, SWIFT DIRECT, PROFESS and TASTE render it
  while their own strings say NI was *not* established, so verdict phrasing was wrong.
- The synthesis now names PRIMA's estimand ("each measured against that arm's own 3-month
  baseline"), matching the trial page and pre-empting the 2.9 − 1.7 subtraction.

## Verified unchanged across all four rounds
No NNT and no CI on the three migraine trials; PRIMA renders no percent figure anywhere;
no rendered em-dash; MIST says "two members" on every surface with no individual named and
the Correction never described as a retraction; the two PFO questions firewalled with a
bidirectional link; `routeMeta.ts` and `schema.ts` descriptions byte-identical at 155
characters.

## Carried to TASKS.md
- **The root cause, now demonstrated four times.** `DeltaBandChart` derives clinical
  assertions from two free-literal numbers and a styling prop. Passing `primaryResult`
  closes the harm case; `primaryDesign` should follow, and the call sites should derive
  chart props from the record rather than hard-coding literals. Until then this class
  recurs one call site at a time.
- The stats row still prints the raw `pValue` after "p =" (`p = NI met`, `p = 0.03 (HARM)`,
  `p = HR 0.68 …`) and colours it by `parseFloat`, so every non-numeric one renders in the
  non-significant grey. The round-3 claim that the raw string is never printed holds only
  for the note.
- "Negligible absolute difference" fires on significant positive trials whose complement
  gap is under 2 pp (INSPIRES, CHANCE-2, THALES). Pre-existing, magnitude-only, but it
  deserves an explicit decision.
- BEST-MSU renders "Not a randomized comparison" about ten lines above "NNT ~13". One of
  the two is wrong; deciding which is a Class E question.
