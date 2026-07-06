# Clinical review — ICHD-3 §4.7 Primary stabbing headache (new diagnosis)

**Decision:** approve (supersedes an initial block on missing claim bindings)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (new diagnosis) · headache clinic pathway engine

## Scope
- **Claims touched:** new `clinic-headache-ichd3-primary-stabbing-criteria` (§4.7 + §4.7.1). Plus an in-scope correction to the §A1.6.6 portion of the `ichd3-2018` `quoted_text`.
- **Citations affected:** `ichd3-2018` (§4.7 verbatim added to `quoted_text` + `section`; §A1.6.6 stale text corrected). `last_reviewed` unchanged (2026-05-25) — within window; §13.6 reasoning documented in-file.
- **Surfaces changed:** new phenotype criteria surface (registered via `HiddenClaimMarkers`), new chips, new `b-stabbing` branch question.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/headacheBanding.ts`, `src/data/clinicHeadacheData.test.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-ichd3-4-7-primary-stabbing.md` (ICHD-3 PDF p.53-54 verbatim, HIGH confidence; §8a-d applicability statements complete).

## Review history
- **Initial: BLOCK.** Clinical content faithful and both design decisions (EMIT criterion D; §4.7.1 `PROBABLE_SECTION_FOR`) validated, but the new phenotype shipped user-facing claim surfaces with no source binding or claim registration (§13.3 unregistered-surface + §13.1 unsupported-claim). The pre-commit `check:claims` hook cannot catch an *untagged* surface — exactly the false-sense-of-coverage §13.3 exists to prevent.
- **Re-review: APPROVE (this artifact).** All four bindings applied and verified to resolve.

## Semantic validity
- **§4.7 encoding faithful** (re-confirmed): `psh-A` (spontaneous stab substrate, suppress-DROP), `psh-B`/`psh-C` (each-stab-seconds, irregular one-to-many/day — demote-gates, so a single miss → Probable §4.7.1), `psh-D` (no cranial autonomic symptoms — suppress-EMIT, steering to §3.3 SUNCT/SUNA when autonomic features present). No indomethacin gate fabricated (correctly). Chip labels/teach text and `teachPearl` match the verbatim source including Note 1 (80% of stabs ≤3 s; rarely 10-120 s).
- **Design decisions validated:** (1) EMIT for criterion D is correct — cranial autonomic symptoms are positive contradicting evidence pointing at §3.3, and §4.7.1 C ("not fulfilling criteria for any other headache disorder") means such a patient is not Probable primary stabbing either, so EMIT loses no true §4.7.1. (2) `PROBABLE_SECTION_FOR` §4.7.1 entry is correct — unlike §4.10 NDPH, §4.7.1 is a real codable Probable sub-form.

## Citation accuracy
- §4.7 A–E + Notes 1–2 + §4.7.1 A–D added to `quoted_text` verbatim; the only condensations are non-load-bearing epidemiologic Note phrasing (every number preserved: ≤3 s, 10-120 s). `4.7` added to `section`.
- **§A1.6.6 VM correction (in-scope):** the previously stale "2-criterion subset pending source retrieval" text (left by A-M1) replaced with the full verbatim A–E criteria, consistent with the encoded `vm-A..vm-D` — including the load-bearing **photophobia AND phonophobia** (D.2). Correcting it here was the right call; leaving a knowingly-false `quoted_text` would itself be a block (#4).

## Freshness
`last_reviewed: 2026-05-25` kept — same ICHD-3 2018 edition; §4.7 and §A1.6.6 read verbatim from source this session; all mapped claims re-verified; ICHD-4 anticipated 2026-2027 as the re-review trigger. §13.6 satisfied via the evidence-verifier packet + in-file note; no formal medical-scientist co-sign required for this additive verbatim expansion.

## Mandatory-block check
Now clear on all conditions: sources resolve (PMID 29368949); `quoted_text` supports every claim; the four bindings register the surface; the evidence packet §8a-d is explicitly filled (no silent omission).

## Rationale
A faithful new §4.7 phenotype with the two design calls validated, now correctly bound to its source across all four claim surfaces (registry `quoted_text` + `section`, `CLAIM_REGISTRY` entry, `HiddenClaimMarkers` tag), plus an in-scope correction of a stale VM citation statement. No never-drift category is touched.

## Required follow-ups
- None blocking. (Optional housekeeping: the A-M1 clinical artifact could note that its "expansion pending" quoted_text statement was corrected here on 2026-07-06.)

## Verification state at gate time
- `check:claims` passes (new binding chain resolves); `npx vitest run` → 215/215 (incl. 4 §4.7 tests); `tsc --noEmit` clean; `check:humanizer` PASS.
