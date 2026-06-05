# Clinical review — headache pathway v4 (post-execution gate)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-05
**Gate type:** Class E-clinical post-execution gate on the BUILT v4 pathway. Pairs with the pre-execution gate `docs/reviews/clinical-headache-v4-spec.md`. The engine `src/data/clinicHeadacheData.ts` is UNMODIFIED (84-test suite intact); every clinical string in v4 comes from the engine, the gated question config, or the verbatim-mounted management block. No new clinical claim is authored in the v4 layer.

## Scope
- **Claims (placement only, none re-authored):** 22 unique `clinic-headache-*` IDs across the v4 surfaces — 8 ICHD-3 criteria markers + `clinic-headache-pitfall-mig-vs-tth` + `clinic-headache-partial-match-caveat` in `HeadacheResultV4.tsx`; 13 dosing/criteria claims in the verbatim `HeadacheManagement.tsx`.
- **Citations affected:** `ichd3-2018`, `do-snnoop10-2019`, the management claims' own citations — all unchanged. No citation record edited; no `last_reviewed` touched.
- **Surfaces (§13.3):** derived language (band words, conflict line, result headlines), structured-data destination (management mount point), static JSX (criteria checklist, hidden markers), badge text (dot meter accessible name + bare "N of M" + band word).
- **Evidence-verifier packet / Trial-statistician:** not applicable (no trial/statistic change).

## Semantic validity
Each binding condition verified in shipped code with file + mechanism:
- **B1 / M4 — PASS.** Partial-match caveat (`clinic-headache-partial-match-caveat`) renders at the top of any sub-full management body (`HeadacheResultV4` `ManagementDisclosure`, gated `matchStrength !== 'full'`).
- **B2 (block) — PASS.** `bandStrengthLabel` returns `'Partial match for'` for chronic-migraine before the probable branch; "Probable Chronic migraine" cannot be constructed. Asserted in `headacheBanding.test.ts`. Engine `PROBABLE_SECTION_FOR` omits chronic-migraine (no §1.5.3).
- **B3 — PASS.** Promoted-probable Leading renders `${strengthLabel} ${name}` with its §X.5 `displaySection` adjacent (`CandidateAccordion` + `DifferentialRow`). Never a bare-confirmed name.
- **B4 — PASS.** `bandPhenotypes` promotes only the single top probable and only when `!hasFull`; partials never promote. Headline reads "No single pattern fits the features yet." when `leading.length === 0`; empty candidates → secondary-workup empty state.
- **Q1 — PASS.** `q-attack-count` folded into the spine; reachability test drives migraine + episodic-TTH to `full`.
- **Q2 (linchpin) — PASS.** Page derives `selected`, `matches`, `banded`, `activeQuestions` from one `answers`+`redFlags` memo; `setAnswer` replaces a single question's entry. No cascade-clear — revisiting re-derives and re-fires/un-fires branches without wiping later answers. Branch-fire tests confirm.
- **Q3 — PASS (acceptable).** `b-aura` fires on `migraineSuggestive` (the documented "migraine in contention" gate). No safety gap: migraine-with-aura cannot surface without aura chips, and aura+headache virtually always carries a migraine-suggestive feature.
- **Q4 — PASS.** `loc-orbital → [loc-unilateral, loc-orbital-temporal]` preserved; drift guard asserts every mapped chip resolves via `getChip` with no silent remap.
- **SNNOOP10 gate — PASS.** `anyRedFlagActive(selected)` routes straight to the secondary-workup result ahead of any banding; the non-collapsible safety strip renders in all three cases (red-flag, empty, normal) — invariants test asserts it.
- **C1 (block) — PASS.** `deriveHeadacheConflict` returns only the candidate's own engine-authored criterion text + an optional chip label from `getChip(offending).label` where `offending ∈ selected`. No clinical sentence composed in the policy layer. Asserted in `headacheConflict.test.ts`.
- **C2 — PASS.** `hiddenUntilTrial` phenotypes are absent from engine output until `indo-tried-complete`; never passed to the conflict util.
- **C3 — PASS.** The contradiction form is constructed only when a suppress-gate the patient violated names the contradiction; otherwise plain-absence ("Not noted yet.").
- **M1 (block) — PASS.** 22 unique `data-claim` IDs enumerated and all present in `CLAIM_REGISTRY`. Each band-eligible phenotype's dosing mounts behind the collapsed "Show management" disclosure; the criteria markers + pitfall are carried as always-on hidden literals (incl. red-flag and empty states).
- **M2 — PASS (with post-gate fix).** VM steering note now renders when VM is a top-2 candidate; no destination-less dosing block. (See M6 resolution.)
- **M3 — PASS.** NDPH workup-first note preserved verbatim under `clinic-headache-ichd3-ndph-criteria` in `HeadacheManagement`.
- **Derived headlines / workup copy — PASS.** Ranking/triage statements, never a diagnosis; consistent with the "Not a diagnosis" caption + safety strip.
- **SNNOOP10 attribution — PASS.** Surfaced as Do et al. 2019 (not the mockup's "Mitsikostas 2017").

## Citation accuracy
`ichd3-2018` (PMID 29368949) — current 3rd edition; criterion text matches `quoted_text`/description; no criterion text changed (placement only). `do-snnoop10-2019` (PMID 30587518) — correct. Management citations relocated byte-for-byte; dosing/thresholds/grades/drugs/qualifiers unchanged. No dead URL/PMID, no missing section, no unresolved source. No mandatory-block condition triggered.

## Freshness
All citations inherit existing `last_reviewed` unchanged — placement + presentation layer only, no claim/criterion/dosing text re-authored, so no §13.6 refresh triggered. `ichd3-2018` and `do-snnoop10-2019` within their 24-month windows.

## The routed decision — RULING (runner-up / conflict policy)
**Ratified as built; no forced elevation.** Factual correction to the premise: the contradiction form does NOT render on the set-aside tray — `definitionallyExcluded` matches are partitioned out of `candidates` and shown in the tray with neutral `exclusionReason` text only. The contradiction phrasing is therefore reserved; the shipped behavior is more conservative than described and is safe.

On whether to elevate a key set-aside discriminator (e.g. TTH when migraine leads) into the runner-up slot: **ruled against.** (1) When TTH is a genuine live alternative it is an active Possible/Less-likely candidate and rides into top-2 on its own ranking; the mig-vs-TTH contrast renders automatically, reinforced by the always-on pitfall claim. (2) When TTH is set aside it is because the patient gave migraine-defining evidence that ICHD-3 *excludes* TTH on (nausea/vomiting or the photo+phono pair) — presenting a criterion-excluded phenotype as a near-miss competitor would be clinically wrong; the neutral exclusion reason in the tray is the correct teaching frame. (3) Forced elevation would violate the banding layer's no-invented-ranking boundary. No elevation rule required or specified.

## Rationale
A presentation rebuild over a fixed, well-tested ICHD-3 evaluator authoring no new clinical claim. All three block-class conditions (B2, C1, M1) hold with verified mechanisms + backing tests; both load-bearing safety properties confirmed (no band word reads as a diagnosis; conditional-branch flow re-derives from a single memo with no cascade-clear; SNNOOP10 short-circuit gates ahead of all banding). approve-with-conditions for three non-blocking residuals (now resolved as noted) — none a never-drift violation, evidence conflict, unresolved citation, or fabrication.

## Required follow-ups
- **M5 (resolved in this PR).** `clinic-headache-ichd3-ndph-criteria` added to the always-on `HiddenClaimMarkers` block (now 8 criteria + pitfall), matching the false-coverage discipline applied to the other seven.
- **M6 (resolved in this PR).** The dead `vestibular-migraine` branch in `ManagementDisclosure` removed; VM steering note now renders in the result body when VM is a top-2 candidate (satisfies M2 without a destination-less block).
- **M7 (resolved at the import flip).** The live route imports `ClinicHeadachePathwayV4`; the v3 page `ClinicHeadachePathway.tsx` + its `HeadacheResultList.tsx` result renderer are removed from the render path and retired. Consolidation note recorded in `TASKS.md` (architect Q4).
- **Editorial (track, do not gate).** `clinic-headache-moh-gepant-safe` labels the migraine acute card (mislabel carried from the prior pathway); re-tag to `clinic-headache-migraine-acute` remains a tracked non-blocking follow-up.
- Engine unchanged — no citation refresh, no `last_reviewed` edit required.
