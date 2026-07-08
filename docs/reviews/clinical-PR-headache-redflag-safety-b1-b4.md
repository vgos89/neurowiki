# Clinical review — Track B: red-flag safety (B-1 positional split + B-4 suspect→test naming)

**Decision:** approve-with-conditions (blocking condition C1 resolved pre-commit)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-08
**Class:** C-clinical / safety-layer · highest-stakes review

## Scope
- **Claims touched:** `clinic-headache-redflag-workup` (new binding → `do-snnoop10-2019`).
- **Citations affected:** `do-snnoop10-2019` (`quoted_text` age-threshold provenance corrected; `last_reviewed` not restamped — correct, window valid through 2028-05).
- **Surfaces changed:** structured data (`clinicHeadacheData.ts` ChipId union / red-flags chip group / `RED_FLAG_CHIPS`), computed strings (`WORKUP_NOTES`, `FLAG_LABELS` in `HeadacheResultV4.tsx`), safety-picker labels (`HeadacheSafetyScreen.tsx` `SNNOOP10_FLAGS`), hidden claim-marker span.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/components/pathways/headache/HeadacheSafetyScreen.tsx`, `src/components/pathways/headache/HeadacheResultV4.tsx`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/data/clinicHeadacheData.test.ts`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-headache-redflag-safety-b1-b4.md`.

## Semantic validity — approved
1. **B-1 split is mechanistically correct and a genuine clinical improvement.** `rf-positional-upright` → spontaneous intracranial hypotension (low pressure) → MRI **with and without gadolinium** (+ CT myelography); `rf-positional-recumbent` → raised ICP (mass/IIH/CVST) → MRI ± MRV, **image before LP**. Correctly opposite mechanisms with correctly different first investigations (the prior single flag gave one test for two opposite pathologies). Safety short-circuit preserved (test-confirmed: both trip `anyRedFlagActive`).
2. **All 16 B-4 suspect→test mappings are standard-of-care** (reviewer spot-checked every highest-stakes row): SAH (non-contrast CT, "negative within 6 h essentially excludes" — correctly hedged; LP/CTA if non-diagnostic); GCA (ESR+CRP + temporal artery biopsy, "do not delay steroids if vision is threatened" — the critical caveat present); papilloedema/raised-ICP (MRI+MRV, image before LP); meningitis (LP, CT-first if immunocompromised/focal/seizure/low-GCS — matches IDSA pre-LP criteria); immunocompromise (imaging before LP mandatory); angle-closure glaucoma (IOP/ophthalmology); posttraumatic (non-contrast CT); MOH (reversible, "not a danger work-up"). No unsafe mapping, no never-drift violation, none delays a time-critical diagnosis.
3. **rf-older-age-onset provenance is now honest.** `quoted_text` + claim description state SNNOOP10 lists ">65" and NeuroWiki applies the more sensitive ">50" threshold sourced to GCA epidemiology (age ≥50 gate). Corrects the prior misattribution — a fix, not new drift.
4. **Claim binding resolves:** `clinic-headache-redflag-workup` → `do-snnoop10-2019` (PMID 30587518, in-window); the previously-untagged workup-note surface is now tagged via `HiddenClaimMarkers`.

## Blocking condition C1 — safety-gate/picker mismatch — RESOLVED
The engine `RED_FLAG_CHIPS` had 16 flags but the user-facing picker (`SNNOOP10_FLAGS`) exposed only 13 — so `rf-neoplasm`, `rf-progressive`, and `rf-painful-eye-autonomic` (the last being **sight-threatening acute angle-closure glaucoma**) could never be selected, never trip the workup gate, and this PR had added workup notes + a bound claim for exactly these three (a §13.1/§13.3 false-coverage failure).

**Resolved (preferred path):** the three flags were added to `SNNOOP10_FLAGS` with lay titles/details (now 16, one per `RED_FLAG_CHIP`); `SNNOOP10_FLAGS` is exported; and a **drift-guard test** now asserts the picker set equals `RED_FLAG_CHIPS` exactly (every red flag selectable; no picker chip outside the set) — so this class of gap cannot recur. 254/254 tests, build 171/171.

## Freshness
`do-snnoop10-2019` `last_reviewed: 2026-05-25`, 24-month window → in-window (today 2026-07-08). No refresh required; the `quoted_text` edit is a provenance correction, not a new-evidence review, and correctly did not restamp the date.

## Rationale
The B-1 split and all 16 B-4 suspect→test mappings are clinically correct and standard-of-care, the age-provenance fix is honest, and the workup surface is now claim-bound. The one blocking item — three must-not-miss red flags (incl. acute angle-closure glaucoma) unreachable in the picker while carrying new notes/claim — was a genuine safety gap; it is resolved by exposing all 16 flags and adding a drift-guard.

## Required follow-ups
- None blocking (C1 resolved).
- **Non-blocking (applied intent):** the drift-guard now covers picker↔`RED_FLAG_CHIPS`; a future guard asserting every `RED_FLAG_CHIP` also has a `WORKUP_NOTES` + `FLAG_LABELS` entry would further prevent copy divergence (would require exporting those maps or extracting to a shared module).

## Verification state at gate time (post-fix)
- `npx vitest run` → 254/254 (incl. B-1 split test + C1 drift-guard); `tsc --noEmit` clean; `check:humanizer` PASS; `check:claims` pass; production build 171/171 prerendered.
