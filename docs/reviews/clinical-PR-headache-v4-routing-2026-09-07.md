# Clinical review — PR #(unassigned; uncommitted diff docs/reviews/DIFF-headache-v4-routing-2026-09-07.patch)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-5[1m])
**Date:** 2026-09-08 (round 3; round 2 was 2026-09-08, round 1 was 2026-09-07)

> **Audit trail.** This file is the complete record of three passes on one diff.
> Round 1 (2026-09-07) returned `block` with twelve pre-commit conditions
> BC-1..BC-12. Round 2 (2026-09-08) cleared eleven and re-blocked narrowly on
> BC-7 with four findings, BI-1..BI-4, closing: "Fix BI-1 through BI-4 and
> re-submit; nothing else in this diff needs to be looked at again." Round 3
> (this pass) verifies BI-1..BI-4 against the live files, confirms that the
> post-round-2 structural edits from the architect review introduced no claim
> drift, and closes. All four BI findings are met. Decision: **approve**.
>
> Round 3 honoured the round-2 closing scope limit: cleared items were not
> re-litigated. The exceptions, stated deliberately, are (i) the three
> management cards and (ii) the BC-8 amber note, which were re-read byte-for-byte
> because structural edits landed in or adjacent to them and the round-3 brief
> asks me to confirm claim-neutrality, not to re-review the content.

## Scope

- **Claims touched:** `clinic-headache-tn-workup` (new), `clinic-headache-tn-management` (new),
  `clinic-headache-on-management` (new), `clinic-headache-ichd3-aura-subtypes` (amended round 3:
  `citation_ids` + `surfaces` + provenance comment). Implicated but not edited:
  `clinic-headache-ichd3-trigeminal-neuralgia-criteria`, `clinic-headache-ichd3-occipital-neuralgia-criteria`,
  `clinic-headache-ichd3-tn-subtypes`, `clinic-headache-ichd3-cluster-criteria`,
  `clinic-headache-ichd3-paroxysmal-criteria`, `clinic-headache-redflag-workup` (destination of the
  retargeted safety-strip link).
- **Citations affected:** `nahas-2024-continuum-cranial-neuralgias`, `ichd3-2018`,
  `do-snnoop10-2019` (newly mapped to the aura claim in round 3).
- **Surfaces changed (§13.3 / `.claude/rules/clinical-surfaces.md`):**
  static JSX (`HeadacheManagement.tsx` TN + ON cards; `HeadacheResultV4.tsx` amber note and
  safety-strip link); structured data in `src/data/` (`clinicHeadacheData.ts` ChipId union, chip
  labels, criterion evaluators, subtype resolver; `headacheQuestions.ts` answer labels, branch
  prompts, `fires` predicates, question-level `teach`, and a new `claimId` tag);
  derived/template string (the amber note interpolates `top2[0].match.name` and
  `manageable[0].match.name`); route metadata (`routeManifest.ts`, public-indexable);
  sitemap (`public/sitemap.xml`); test files (non-rendered).
- **Evidence-verifier packet:** not applicable (no trial data, statistics, or new trial entry).
- **Trial-statistician report:** not applicable.
- **Files reviewed live in round 3:** `src/data/headacheQuestions.ts`,
  `src/data/clinicHeadacheData.ts`, `src/data/headacheConflict.ts`, `src/lib/citations/claims.ts`,
  `src/lib/citations/registry.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`,
  `src/components/pathways/headache/HeadacheManagement.tsx`,
  `src/components/pathways/headache/HeadacheQuestion.tsx`, `src/pages/ClinicHeadachePathwayV4.tsx`,
  `src/config/routeManifest.ts`, `scripts/check-claims.ts`, `public/sitemap.xml`.

---

## Round 1 — conditions issued 2026-09-07 (decision: block)

Round 1 found five claim-text defects, three routing defects, and a vacuous reachability guard.

| # | Condition (abbreviated) | Final status |
|---|---|---|
| BC-1 | Restore the source's `refractory` population gate on the IV fosphenytoin/lidocaine row | Cleared R2 (row deleted) |
| BC-2 | Remove the unsourced "with specialist involvement", or cite it | Cleared R2 (deleted) |
| BC-3 | Split the ON card; state ICHD-3 13.4 criterion D at full mandatory strength, keep "temporarily" | Cleared R2 |
| BC-4 | Bind or remove the secondary-TN red-flag row (incl. "onset before age 40"); drop the sequencing directive from the card header | Cleared R2 (row deleted) |
| BC-5 | Do not ship "(1.2.4 retinal migraine especially)" until `ichd3-2018.quoted_text` carries verbatim 1.2.4 criteria | Cleared R2 (parenthetical deleted) |
| BC-6 | Fix the `loc-face` / cluster interaction; add a `[PAIR]` comment and a periorbital-cluster walk | Cleared R2 |
| BC-7 | Add a vascular-mimic caution on the aura path independent of the retinal subtype; **bind it to a citation, do not author it unsourced** | Re-blocked R2 (BI-1..BI-4); **cleared R3** |
| BC-8 | Rewrite the leading-gap note: gate on `manageable.length > 0`, no "lower-ranked"/"leading", issue an instruction | Cleared R2; re-confirmed R3 after extraction |
| BC-9 | Make episodic/chronic cluster mutually exclusive, or surface an explicit conflict state | Cleared R2; re-confirmed R3 after test refactor |
| BC-10 | Make the inventory guard executable; stop overclaiming coverage | Cleared R2 |
| BC-11 | Re-caption/re-scope the finding-2 walk, assert the amaurosis-fugax steer; give finding-3 a non-contradictory premise | Cleared R2 |
| BC-12 | Correct the `HeadacheManagement.tsx` file header (byte-for-byte claim) and the stale `MANAGED` comment | Cleared R2 |

Round-1 rulings carried forward unchanged: the widened `b-aura` gate is **not** blocked (only its
teach text was); the identical unsupported red-flag text on the two pre-existing surfaces is
**follow-up, not blocking**; the `ichd3-2018` quoted_text expansion for verbatim 1.2.4 criteria is
**parked**, not gating.

---

## Round 2 — outcome 2026-09-08 (decision: block, narrow)

Eleven of twelve conditions cleared, several better than asked: BC-4 shipped the round-1 follow-up
clarifier as well as the deletion; BC-8's rewrite neutralised the PSH/TN co-leading harm round 1
called the most concrete new risk; BC-10 turned a vacuous assertion into a guard that fails when a
phenotype is added. Medical-scientist items U1 (severity disjunction on `tn-B`/`on-B`) and B1
(`qual-shock` label) were confirmed as fidelity repairs, not widenings. A1 was ruled acceptable as
trimmed, with the standing rule that the Part-Two clause must not return unsourced.

BC-7 was re-blocked on four findings, all in text the remediation itself newly authored:

- **BI-1** (mandatory-block #4) — the live `q-aura` teach asserted "TIA, which is maximal at onset"
  and "seizure aura, which lasts seconds". Neither appears in `ichd3-2018.quoted_text` nor in
  `do-snnoop10-2019.quoted_text`. Load-bearing discriminators, authored unsourced, as the remediation
  for a condition that said "do not author it unsourced".
- **BI-2** (never-drift category 3, mandatory-block #1) — the `sym-reversible-neuro-reported`
  `teachWhenSelected` said "ICHD-3 1.2 C **requires only** that the aura is accompanied or followed
  within 60 minutes by headache", dropping the three-of-six gate and promoting one optional
  characteristic to sole requirement.
- **BI-3** — the in-code comment asserted the caution "renders whenever this chip is selected". False:
  `HEADACHE_CHIP_GROUPS` is consumed only by `getChip()` and tests; no V4 component mounts
  `ChipGroup`. A false in-code assertion that a safety guard renders is the BC-12 hazard.
- **BI-4** (condition attached to the BC-7 fix) — the `q-aura` teach was an untagged Phase-1
  structured-data claim surface, invisible to `check:claims`. §13.1 in its purest form.

---

## Round 3 — verification of BI-1 through BI-4

### BI-1 — MET, via the round-2 reviewer's own resolution path 2

`src/data/headacheQuestions.ts:385` now reads, in full:

> "Reversible neurologic symptoms are not specific to migraine aura. ICHD-3 1.2 C characteristics
> include gradual spread over 5 minutes or more and a symptom duration of 5 to 60 minutes. Exclude
> TIA and seizure before calling this aura. Monocular visual loss needs amaurosis fugax, retinal
> artery occlusion, and optic neuropathy excluded before it is called 1.2.4 retinal migraine."

Compared word-for-word against the trim I offered in round 2 under BI-1 resolution path 2: **exact
match, no additions, no substitutions.** Sentence-by-sentence against the held records:

1. *"not specific to migraine aura"* — a specificity statement, supported by
   `do-snnoop10-2019.quoted_text` naming "N: Neurologic deficit (focal, altered mental status,
   seizures)" as a red flag for secondary headache. No causal or certainty upgrade.
2. *"ICHD-3 1.2 C characteristics **include** gradual spread over 5 minutes or more and a symptom
   duration of 5 to 60 minutes"* — re-extracted from `registry.ts:2467`: "At least three of the
   following six characteristics: 1) at least one aura symptom spreads gradually over ≥5 minutes …
   3) each individual aura symptom lasts 5-60 minutes". The verb **"include"** is what makes this
   pass where BI-2's "requires only" failed: it asserts membership in a list, not the content of the
   gate. Both temporal endpoints are exact ("or more" = "≥"; "5 to 60 minutes" = "5-60 minutes").
   *Considered and cleared:* the source's distributive "each individual" is not carried into the
   teach. This is not a category-3 qualifier drop, because the teach makes no gate assertion at all,
   and the surface that actually enforces the criterion preserves the quantifier verbatim
   (`clinicHeadacheData.ts:437`, chip label "Each aura symptom lasts 5 to 60 minutes"). No clinician
   decision turns on the difference. Cleared on the paraphrase standard, not deferred.
3. *"Exclude TIA and seizure before calling this aura."* — a workup **instruction**, not a
   phenomenology claim about either disease. This is the whole point of the fix: the two unsourced
   natural-history assertions are replaced by a sequencing directive bounded by
   `do-snnoop10-2019.quoted_text`, verified verbatim at `registry.ts:2392`:
   "N: Neurologic deficit (focal, altered mental status, seizures)". The instruction's strength
   matches the already-reviewed safety strip ("ICHD-3 criteria apply only after these are excluded")
   and ICHD-3's universal "not better accounted for by another diagnosis" criterion. No action-verb
   upgrade.
4. *"Monocular visual loss needs amaurosis fugax, retinal artery occlusion, and optic neuropathy
   excluded before it is called 1.2.4 retinal migraine."* — restates the already-reviewed retinal
   subtype steer at `clinicHeadacheData.ts:1199` ("Exclude other causes of transient monocular visual
   loss (amaurosis fugax, retinal artery occlusion, optic neuropathy) before attributing it to
   migraine"). Same three exclusions, same direction, under the same claim ID. The two surfaces
   agree; neither contradicts the other.

`do-snnoop10-2019` was added to the claim's `citation_ids` as that resolution path requires
(`claims.ts:1245`), with the binding rationale recorded in an adjacent comment (`claims.ts:1250-1251`).

**The unsourced clauses no longer exist anywhere.** Repo-wide search for "maximal at onset",
"seizure aura", "lasts seconds" and "requires only" across `src/` returns exactly one hit, and it is
unrelated and pre-existing: `headacheQuestions.ts:273`, the TAC duration option label "Each lasts
seconds to a few minutes (under 10 minutes)" (ICHD-3 3.3 attack duration). Confirmed absent.

### BI-2 — MET, via round 2's preferred option (b)

Both `teachWhenSelected` strings added by this diff are deleted outright. The two chips now carry
labels only:

- `clinicHeadacheData.ts:363` — `{ id: 'loc-facial-region', label: 'Facial location (cheek, jaw, or upper lip)' }`
- `clinicHeadacheData.ts:434` — `{ id: 'sym-reversible-neuro-reported', label: 'Reversible visual or neurologic symptoms reported' }`

The 1.2 C misstatement is gone because its carrier string is gone. "requires only" returns zero hits
repo-wide. This is the resolution I said I would take, and it removes the drift rather than rewording
it, so there is no residual latent claim on a dormant surface. Both labels are neutral descriptors
carrying no criterion assertion.

### BI-3 — MET, and the replacement comments are independently verified TRUE

The block was on a *false* comment, so the fix is only real if the new comment is accurate. I
re-derived the consumption graph rather than accepting the comment:

- `HEADACHE_CHIP_GROUPS` (declared `clinicHeadacheData.ts:302`) has exactly two consumers repo-wide:
  `getChip()` at `clinicHeadacheData.ts:1469-1470`, and test files.
- `getChip()`'s only production consumers are label lookups: `clinicHeadacheData.ts:1361`
  (`contributingChipLabels`) and `headacheConflict.ts:65, :88` (`contradictingChipLabel`).
- `ChipGroup.tsx` (the component that reads `teachWhenSelected`) has **zero importers repo-wide**.

So the new comments at `clinicHeadacheData.ts:359-362` and `:429-433` — "HEADACHE_CHIP_GROUPS teach
texts are DORMANT in the V4 pathway (no component mounts ChipGroup; getChip() serves label lookups
only)" — are true as written. The `q-aura` comment at `headacheQuestions.ts:373-383` states the same
from the other side ("this teach string is its ONLY live surface"), and that is also true:
`HeadacheQuestion.tsx:56-63` renders `question.teach` under a "Teach:" label, and no other surface
carries the caution.

Additional confirmation from a second angle: `headacheConflict.ts:63, :87` only ever surfaces a chip
label drawn from `crit.contributingChips`. Both new chips are routing flags contributing to no
criterion, so they appear in no `contributingChips` array and cannot reach the user through the
conflict path either. Each of the two new chips' text reaches a clinician through exactly one
surface: its answer-option label in `headacheQuestions.ts`, which is reviewed and rendered.

BC-7's substantive safety requirement is therefore satisfied by a single, live, correctly-labelled
guard, and the code now says so accurately.

### BI-4 — MET

- `HeadacheQuestion` interface gains `claimId?: string` (`headacheQuestions.ts:52`) with a doc comment
  naming the mechanism: "§13.4 Phase-1 structured-data claim tag for the teach string (adjacent
  claimId field, scanned by scripts/check-claims.ts). Required whenever `teach` makes a clinical
  statement" (`:47-51`).
- `q-aura` carries `claimId: 'clinic-headache-ichd3-aura-subtypes'` (`:384`), adjacent to the teach.
- The claim declares the structured-data surface (`claims.ts:1246`:
  `surfaces: [{ type: 'jsx', attribute: 'data-claim' }, DATA_SURFACE]`), where `DATA_SURFACE` is
  `{ type: 'data', field: 'claimId' }` (`claims.ts:27`) — the established repo pattern, used by
  dozens of existing claims.
- The scanner sees it: `scripts/check-claims.ts:70` defines `data: /\bclaimId\s*:\s*["'](ID)["']/g`,
  which matches the tag as written, and `collectTags` walks all of `src/`, so
  `headacheQuestions.ts` is in scope.
- Check 2 is a **bidirectional** declared-versus-tagged cross-check (`check-claims.ts:6`). Both
  declared surfaces have a live tag: jsx at `HeadacheResultV4.tsx:125`
  (`<span data-claim="clinic-headache-ichd3-aura-subtypes" />`, the `HiddenClaimMarkers` span, which
  survived the structural edits and simply shifted line number), and data at
  `headacheQuestions.ts:384`. Neither direction is orphaned.

The §13.1 gap is closed for this string specifically: `check:claims` is no longer green *over* the
caution, it is green *because of* it.

---

## Round 3 — post-round-2 structural edits, claim-neutrality confirmation

All nine confirmed claim-neutral except (g), which is a deliberate user-facing fix I rule on below.

**(a) `clusterPictureFires` extracted.** `headacheQuestions.ts:257` —
`has(s, 'dur-15-to-180-min') && has(s, 'loc-unilateral')` — is byte-identical to the predicate
previously inlined on `b-cluster-detail`, and is now referenced by both `b-cluster-detail` (`:284`)
and `b-cluster-subtype` (`:307`). Behaviour of both branches unchanged; the extraction makes the
BC-9 split structurally inseparable, which is a strengthening of the BC-9 fix rather than a risk to
it. **Claim-neutral.**

**(b) Amber note gate extracted to `showLeadingGapNote()` + `VESTIBULAR_MIGRAINE_ID`.**
`HeadacheResultV4.tsx:54-58` returns
`manageable.length > 0 && !hasHeadacheManagement(top2[0].match.phenotypeId) && top2[0].match.phenotypeId !== VESTIBULAR_MIGRAINE_ID`
— logically identical, including short-circuit order, to the gate round 2 cleared. The rendered
sentence at `:406` is unchanged byte-for-byte: "No management module for {top2[0].match.name} yet.
The guidance below is for {manageable[0].match.name}. Do not apply it to {top2[0].match.name}." The
BC-8 derivation still holds: `manageable = top2.filter(hasHeadacheManagement)`, so when the note
fires `manageable[0]` **is** `top2[1]`, the singular is right, and the note points at the block that
actually renders. The `manageable.length > 0` guard is evaluated first, so `top2[0]` can never be
dereferenced on an empty array. BC-8's wording constraints are preserved verbatim in the comment at
the render site (`:397-403`). **Claim-neutral.**

**(c) `walk()` rejects double-answering a single-select; BC-9 test injects the chronic chip after a
valid walk.** The resolver guard assertion is unchanged (`matchStrength === 'full'`,
`subtype` undefined). The clinical property BC-9 required — chronic cluster can never be silently
relabelled episodic — is now protected at two layers: the single-select UI cannot emit both chips
(and the harness now refuses to pretend it can), and the resolver returns `undefined` on the
contradictory pair for restored or merged draft state. The test's premise is now honest about which
input it models. **Claim-neutral, and a net strengthening.**

**(d) Two invariant tests added rendering the leading-gap note.** Non-rendered surface. The
assertions match the cleared sentence ("No management module for Hypnic headache yet.", "Do not apply
it to Hypnic headache.") and the self-checking premises fail loudly if a data change hollows the
scenario. **Claim-neutral.**

**(e) `MANAGED` typed `Set<PhenotypeId>`.** `HeadacheManagement.tsx:55-66` — membership is unchanged
at twelve (the ten relocations plus `trigeminal-neuralgia` and `occipital-neuralgia`), matching the
count round 2 verified. Type-only change; `hasHeadacheManagement` keeps its `string` parameter with a
cast at the boundary (`:68`). **Claim-neutral.**

**(f) Progress dots replaced by an "N / ~M" counter.** `ClinicHeadachePathwayV4.tsx` now renders an
`aria-hidden` counter driven by `safeIndex + 1` / `activeQuestions.length` — the same source as the
question's own position line (`HeadacheQuestion.tsx:50`, "Question {position} of ~{total}"). This
**resolves round-2 follow-up U4**, which flagged the old dot row as a half-applied fix rendering a
different, non-monotonic quantity than the aria-label announced. Position remains available to
assistive technology via the eyebrow, so hiding the duplicate is not a regression. No clinical
content. **Claim-neutral; U4 closed pending accessibility-specialist confirmation that the eyebrow is
the intended announced position.**

**(g) Safety-strip link retargeted — the one user-facing change, and I approve it.**
`HeadacheResultV4.tsx:142`: `/pathways/headache-workup` → `/guide/headache-workup`. Link text
unchanged ("Review red flags →"). Verified both ends:
- `/pathways/headache-workup` exists nowhere in the repo — it was a dead target. The mandatory,
  non-collapsible dangerous-mimic strip is the one element on the result screen that must always
  work, and its escape hatch went nowhere. That is a clinical-safety defect, correctly caught by the
  architect as pre-existing.
- `/guide/headache-workup` is registered: `routeManifest.ts:680-681`, `App.tsx:124`, page at
  `src/pages/guide/HeadacheWorkup.tsx`, with sitemap and JSON-LD entries (`seo/schema.ts:375, :836`).
- The destination is semantically correct, not merely resolvable: the page's subtitle is "Red flags,
  when to image, and when to tap", Section 1 is titled "Red Flags", and its lede covers sudden
  worst-ever, thunderclap, fever, focal deficit, papilledema and immunosuppression — consistent with
  the strip's "SAH, GCA, CVT, or mass" framing and with `clinic-headache-redflag-workup`
  (`do-snnoop10-2019`).

This restores a safety affordance rather than changing a clinical statement. **Approved.**

**(h) `public/sitemap.xml` gains `/pathways/headache-clinic`** (`:83-88`, `lastmod 2026-09-08`,
matching `includeInSitemap: true` at `routeManifest.ts:409`). Crawlability only; no clinical content.
**Claim-neutral.**

**(i) `routeManifest` description tightened to 149 characters.**
"ICHD-3 pattern finder for headache: live differential across migraine, tension-type, cluster and the
TACs, and trigeminal neuralgia. Not a diagnosis." — I counted 149 characters, confirming the stated
length. **Clinically clean:** it makes no recommendation, states no dose, threshold, population gate
or time window, describes the tool as a "pattern finder" rather than a diagnostic instrument, and
retains the "Not a diagnosis." disclaimer. The scope it advertises is accurate against the sixteen
engine phenotypes. One minor taxonomic looseness, **non-blocking**: "cluster and the TACs" can read as
implying cluster headache is not itself a TAC, when ICHD-3 codes it as 3.1 within the trigeminal
autonomic cephalalgias. This is search-result metadata, not a claim surface, and it changes no
clinical decision; "cluster and the other TACs" would be a one-word tidy. Logged as an optional
follow-up, not a condition. **Claim-neutral.**

---

## Semantic validity

Confirmed. Round 3 introduced exactly one new clinical sentence to this diff — the replacement
`q-aura` teach — and it is the sentence I authored the trim for in round 2, shipped verbatim, now
bound to two citations whose `quoted_text` I re-extracted this round rather than trusting the round-2
write-up. Its four component assertions each map to held text: a specificity statement bounded by
SNNOOP10's neurologic-deficit flag; a partial enumeration of ICHD-3 1.2 C characteristics whose verb
("include") does not misstate the three-of-six gate; a workup instruction that makes no claim about
TIA or seizure natural history; and a restatement of the already-reviewed retinal exclusion steer.
None of the five never-drift categories is touched: no recommendation strength is asserted, the
action verb "Exclude" matches the source's red-flag framing and the pre-existing safety strip, no
qualifier or population gate is dropped, no certainty marker is laundered, and both temporal
endpoints (≥5 minutes, 5-60 minutes) are exact.

Everything else in round 3 is deletion, extraction, typing, test-harness fidelity, routing, or
metadata. The three management cards (`HeadacheManagement.tsx:225-237, :244-250`) were re-read
byte-for-byte and are identical to what round 2 cleared: both evidence levels intact on the TN
first-line row, "temporarily" and "of the affected nerve(s)" intact on the ON criterion-D row, "requires"
mandatory strength intact, no red-flag row, no IV row, no "with specialist involvement", no sequencing
directive. The BC-8 amber note is identical. The BC-9 resolver guard is identical.

No em-dash appears in any newly added or amended rendered string.

## Citation accuracy

| Citation | Version / section | Quote supports the claim as written? |
|---|---|---|
| `ichd3-2018` | 2018 3rd ed.; `section` list already includes 1.2, 1.2.4, 13.1.1, 13.1.1.1-.3, 13.4 | **Yes.** `quoted_text` (registry.ts:2467) re-extracted this round: "At least three of the following six characteristics: 1) at least one aura symptom spreads gradually over ≥5 minutes … 3) each individual aura symptom lasts 5-60 minutes …". Supports the teach's enumeration as written, because the teach says "characteristics include" and asserts no gate. Also re-verified as supporting the TN aetiology row, the TN Note row, the ON criterion-D row, `tn-B` and `on-B`. The BI-2 misstatement that this record contradicted is deleted. The 1.2.4 verbatim-criteria expansion remains parked (round-1 ruling, unchanged). |
| `do-snnoop10-2019` | Neurology 2019;92:134-144; PMID 30587518; DOI resolves in-record | **Yes, for the bounded use now made of it.** `quoted_text` (registry.ts:2392) carries verbatim "N: Neurologic deficit (focal, altered mental status, seizures)". Round 2 rejected this citation as coverage for the *phenomenology* claims, and correctly so; those claims are gone. It is now mapped to support a *workup instruction* ("Exclude TIA and seizure before calling this aura"), which is exactly what a red-flag mnemonic supports. Newly a dependent of this citation as of round 3: its next §13.6 refresh must include `clinic-headache-ichd3-aura-subtypes` in step 3. |
| `nahas-2024-continuum-cranial-neuralgias` | Continuum 2024;30(2):510-536 | **Yes, unchanged from round 2.** "Carbamazepine (Level A) or oxcarbazepine (Level B) first-line" and "greater and/or lesser occipital nerve block" are verbatim-faithful. The two rows this citation did not support were deleted in round 2 and have not returned. |

The round-2 coverage ruling is now fully resolved: the half of the BC-7 text that
`clinic-headache-ichd3-aura-subtypes` could carry is retained, the half it could not is deleted, a
second citation was added for the workup instruction, and the whole is bound to the surface by a
scanner-visible tag.

## Editorial / expert context

Not applicable — no new trial entry in this PR. Mandatory-block #8 does not arise.

## Freshness

| Citation | last_reviewed | Window | Expires | Verdict |
|---|---|---|---|---|
| `nahas-2024-continuum-cranial-neuralgias` | 2026-05-25 | 12 mo (per-citation override) | 2027-05-25 | Pass |
| `ichd3-2018` | 2026-05-25 | 24 mo (override, rationale in comment) | 2028-05-25 | Pass |
| `do-snnoop10-2019` | 2026-05-25 | 24 mo (override, rationale in comment) | 2028-05-25 | Pass |

All three inside their windows at 2026-09-08. **No `last_reviewed` field is touched by this diff**, so
mandatory-block #6 does not arise. Correct: the §13.6 defect round 1 identified was step 3 (dependent
claims consistent) for the Nahas record, and that was fixed by correcting the claims, not the date.
Adding `do-snnoop10-2019` as a new dependent of an existing, in-window citation likewise does not
require a refresh — but it does enlarge that citation's step-3 scope, noted above and in follow-ups.

Freshness-adjacent, non-blocking, carried from round 1:
`nahas-2024-continuum-cranial-neuralgias` and `burish-2024-continuum-cluster` both carry
`review_window_months: 12` with no rationale comment; §13.7 requires one for any override.

## Gates

Reported by the orchestrator and accepted for this artifact: `tsc` clean; 366 tests pass;
`check:claims` pass with the new `claimId` tag live; `check:humanizer` pass; `check:routes` pass.
I am read-only and did not execute them. What I verified myself, by reading, is the part that matters
for §13.1: that the new tag is *reachable* by the scanner (regex at `check-claims.ts:70` matches the
tag as written at `headacheQuestions.ts:384`) and that both declared surfaces have live tags, so the
green `check:claims` result is meaningful rather than vacuous. Per §13.1, a green hook still attests
only to metadata completeness; this artifact is the semantic attestation.

## Rationale

All four round-2 blocking findings are met, each by the resolution path round 2 named as preferred,
and each verified against the live files rather than the remediation's own description of itself. The
`q-aura` teach ships my trimmed wording verbatim, with the two unsourced natural-history clauses gone
from the repository entirely and `do-snnoop10-2019` added to the claim as that path required. The
1.2 C misstatement is gone with its carrier string. The false in-code assertion is replaced by
comments I re-derived and confirmed true — `HEADACHE_CHIP_GROUPS` really is consumed only by
`getChip()` for label lookups, `ChipGroup` really has no importers, and the `q-aura` teach really is
the caution's only live surface. The caution is now a tagged claim surface bound bidirectionally to a
registry entry, closing the §13.1 gap that let unsourced clinical prose pass a green hook. The nine
structural edits from the architect review are deletion, extraction, typing, harness fidelity,
routing and metadata; I traced each and none moves a clinical sentence, with the BC-8 note and the
three management cards re-read byte-for-byte to prove it. The single user-facing change, retargeting
the safety strip from a dead route to the registered red-flag guide, repairs a safety affordance that
was broken before this diff and lands on genuinely relevant content. Nothing in the five never-drift
categories moved in round 3; no mandatory-block condition is triggered; the diff is approved for
merge with the follow-ups below tracked, none of which gates this change.

## Required follow-ups (consolidated across rounds 1-3; none blocks this diff)

**Clinical content debt (Class E):**
1. Remediate the unsupported secondary-TN red-flag text, including "onset before age 40", on its two
   pre-existing surfaces: the TN `teachPearl` (`clinicHeadacheData.ts:856`) and
   `clinic-headache-ichd3-trigeminal-neuralgia-criteria` (`claims.ts:1224`). One task covers both. The
   `clinic-headache-tn-workup` description names this debt, so it is discoverable. *(Round 1)*
2. Encode ICHD-3 4.7 criterion E on `primary-stabbing-headache` so PSH stands down when a competing
   full match exists. Root cause behind the co-leading TN/PSH result that BC-8 mitigates at the UI
   layer only. *(Round 1)*
3. Expand `ichd3-2018.quoted_text` with the verbatim 1.2.4 A-C criteria and refresh via the full
   §13.6 six-step checklist. **Assign a named owner; this has been parked across three rounds.**
   Residual it resolves: the engine attaches "Retinal migraine · ICHD-3 §1.2.4" to a full 1.2 match on
   an explicitly non-migrainous headache, a state this diff makes newly reachable. Harm is bounded
   because the exclusion steer renders in the accordion summary without interaction. *(Rounds 1-3)*
4. *(Optional enhancement, no longer gating.)* BC-7 resolution path 1 remains available: if a source
   carrying the TIA and seizure discriminators is wanted, have `medical-scientist` supply it via
   `evidence-verifier`, register it, and restore the fuller sentence. The content is worth having;
   path 2 was taken and is sufficient. **Downgrade this TASKS entry from
   `blocked:awaiting-clinical-review` to open/optional.** *(Round 2, revised round 3)*
5. *(Optional.)* Sourcing route for the A1 Part-Two clause if it is ever wanted: the GCA half is
   available from `do-snnoop10-2019`; dental, sinus and TMJ would need a new citation. The clause must
   not return unsourced. *(Round 2)*
6. U7: the SUNCT/SUNA management card's Referral row is not in the `burish-2024-continuum-cluster`
   `quoted_text` — the same failure mode as the deleted "with specialist involvement". Separate audit
   task so the precedent is not cited as justification. *(Round 2)*

**Claim-surface governance (Class C-clinical):**
7. **`HEADACHE_CHIP_GROUPS`: decide live or dormant, then act.** Round 3 stopped the bleeding — the two
   chips this diff added carry no clinical prose and the dormancy is documented inline — but the
   pre-existing `teachWhenSelected` corpus (`loc-unilateral`, `aura-motor`, `aura-brainstem`, and
   others) is still unreviewed, untagged clinical text that reaches no user. Either wire the group to
   a renderer and tag every teach string that makes a clinical statement, or retire the field. **Hoist
   the dormancy statement to the `HEADACHE_CHIP_GROUPS` declaration or the file header**, so it is
   stated once globally rather than only in two inline comments. *(Round 2, extended round 3)*
8. Tag the pre-existing untagged `teach` strings at `headacheQuestions.ts:141` (q-quality) and `:350`
   (q-indomethacin) with `claimId`. Both are clinical statements on a Phase-1 structured-data surface.
   Now a cheap fix: BI-4 added the interface field and proved the scanner path. *(Round 2)*
9. U6: `loc-facial-region` and `sym-reversible-neuro-reported` are routing flags sitting inside
   scoring chip groups (the latter between `aura-retinal` and `aura-fully-reversible`, where it reads
   as a 1.2 B aura type but satisfies no criterion). Group routing flags under an explicit non-scoring
   heading. *(Round 1)*
10. Cross-check the `as-reversible-neuro` answer option against the `rf-neuro-deficit` red flag — the
    two describe overlapping clinical content on two screens with no reconciliation. *(Round 1)*

**Test and citation hygiene (Class B/C):**
11. Add reachability walks for the eight `UNWALKED_DEBT` phenotypes, prioritising
    `paroxysmal-hemicrania`, `hemicrania-continua` and `sunct-suna` (indomethacin- and
    autonomic-gated, the shapes that hid the original defects). The test file header references this
    TASKS entry by name, so the entry must exist. *(Round 1)*
12. U3: tighten `expect(['full','probable']).toContain(...)` to `.toBe('full')` for occipital
    neuralgia and vestibular migraine, both binary full-or-hidden. The hypnic assertion is correctly
    loose (§4.9.1 exists). *(Round 1)*
13. Add `review_window_months` rationale comments for `nahas-2024-continuum-cranial-neuralgias` and
    `burish-2024-continuum-cluster` per §13.7. *(Round 1)*
14. Note for the next `do-snnoop10-2019` §13.6 refresh: `clinic-headache-ichd3-aura-subtypes` is now
    a dependent claim and must be included in step 3. *(New, round 3)*
15. *(Optional, editorial.)* `routeManifest.ts:419` — "cluster and the TACs" reads as excluding
    cluster from the TACs; "cluster and the other TACs" is exact. Metadata only, no clinical
    consequence. *(New, round 3)*

**Closed by this round — remove from TASKS if already entered:**
- **U4** (progress-dot row half-applied fix): resolved by structural edit (f). The dot row is gone and
  the counter is driven by the same source as the announced position. Accessibility-specialist should
  confirm the eyebrow is the intended announced position, then close.
- **BI-1, BI-2, BI-3, BI-4**: all met and verified this round. No carry-forward.

**§16 artifacts still required before `/pr-ready` (Class E):**
16. Architect review artifact at `docs/reviews/arch-PR<#>-headache-v4-routing.md` — the review itself
    has clearly happened (its conditions are cited throughout the code), but the artifact must exist
    as a committed file with decision `approve` or `approve-with-conditions`.
17. Rollback plan in the PR body.
18. `### @seo-specialist — Sign-off` block in the PR body: `routeManifest.ts` and `public/sitemap.xml`
    are public-indexable surfaces and the sign-off drove edits (h) and (i).
19. Bilingual PR description per §10, and `TASKS.md` status update.

## TASKS.md entries expected from this artifact

- `[ ] headache TN red-flag text remediation (teachPearl + criteria claim)` — Class E, `blocked:awaiting-clinical-review`
- `[ ] encode ICHD-3 4.7 criterion E on primary-stabbing-headache` — Class E
- `[ ] ichd3-2018 quoted_text: add verbatim 1.2.4 A-C, §13.6 refresh` — Class E, **owner required**
- `[ ] BC-7 optional: citation for TIA / seizure aura discriminators` — Class E, **open (no longer blocked)**
- `[ ] A1 Part-Two clause sourcing route (GCA via do-snnoop10-2019; dental/sinus/TMJ need new citation)` — Class E, optional
- `[ ] SUNCT/SUNA referral row provenance audit` — Class C-clinical
- `[ ] HEADACHE_CHIP_GROUPS: live surface or dormant? wire-and-tag or retire; hoist dormancy note to file header` — Class C-clinical
- `[ ] tag q-quality / q-indomethacin teach strings with claimId` — Class C-clinical
- `[ ] U6 separate routing flags from scoring chip groups` — Class C
- `[ ] reconcile as-reversible-neuro with the rf-neuro-deficit red flag` — Class C-clinical
- `[ ] headache reachability walks follow-up (8 unwalked phenotypes)` — Class C (referenced by name in the test file header)
- `[ ] U3 tighten binary full-or-hidden assertions` — Class B
- `[ ] review_window_months rationale comments (nahas-2024, burish-2024)` — Class B
- `[ ] do-snnoop10-2019 next §13.6 refresh: include clinic-headache-ichd3-aura-subtypes in step 3` — Class B, note-only
- `[ ] routeManifest description: "cluster and the other TACs"` — Class B, optional
- `[x] U4 progress-dot position fix` — closed 2026-09-08 by this diff; accessibility-specialist to confirm
- `[ ] Class E artifacts: architect review file, rollback plan, seo sign-off block, bilingual PR body` — Class E
