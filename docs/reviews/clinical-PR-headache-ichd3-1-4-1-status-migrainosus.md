# Clinical review — ICHD-3 §1.4.1 Status migrainosus (new diagnosis)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (new diagnosis) · headache clinic pathway engine

## Scope
- **Claims touched:** new `clinic-headache-ichd3-status-migrainosus-criteria` (§1.4.1).
- **Citations affected:** `ichd3-2018` (§1.4.1 verbatim added to `quoted_text` + `section`). `last_reviewed` unchanged (2026-05-25, within window) — §13.6 not a refresh event.
- **Surfaces changed:** new phenotype criteria surface (registered via `HiddenClaimMarkers`), one new chip (`sev-debilitating`), new `b-status-migrainosus` branch question.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/headacheBanding.ts`, `src/data/clinicHeadacheData.test.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-ichd3-1-4-1-status-migrainosus.md` (ICHD-3 PDF p.24-25 verbatim, HIGH confidence; §8a-d applicability statements complete).

## Semantic validity
Faithful to verbatim §1.4.1 A–D + Notes 1-2 + Comment (confirmed character-for-character against the packet). No never-drift drift:
- `sm-B` (suppress-gate, DROP): `migraine-history-established` — criterion B substrate. Correctly prevents a first-ever >72h non-migraineur from surfacing (routed to secondary workup).
- `sm-C1` (suppress-gate, DROP): `dur-gt-72-hours` — criterion C.1; no §X.5 Probable home for a duration miss → hide.
- `sm-C2` (demote-gate): `sev-debilitating` — criterion C.2; Note 2 gives milder non-debilitating cases a §1.5.1 home, so a C.2 miss demotes to Probable §1.5.1 (`PROBABLE_SECTION_FOR['status-migrainosus'] = '§1.5.1 Probable migraine without aura'`).
- **`sev-debilitating` new chip validated:** §1.4.1 C.2 is "pain **and/or associated symptoms** are debilitating" — a functional-disability floor covering non-pain symptoms, categorically distinct from the §1.1 pain-intensity `sev-severe`. Reusing `sev-severe` would have dropped the "associated symptoms" arm (qualifier drift). The dedicated chip is the faithful choice.
- **teachPearl** carries all three load-bearing qualifiers: ≤12h remission allowance, milder→§1.5.1, and MOH precedence, plus the substrate warning.
- No fabricated criteria — no triptan/analgesic-response gate (correct; §1.4.1 has no confirmatory-treatment-response criterion).

## Citation accuracy
§1.4.1 A–D + Notes 1-2 + MOH-precedence Comment added to `quoted_text` verbatim; `1.4.1` added to `section`. All claim bindings resolve: `data-claim` span → `CLAIM_REGISTRY` → `ichd3-2018` `quoted_text` supports the claim as written.

## Freshness
`last_reviewed: 2026-05-25` (within 24-month window). Same ICHD-3 2018 edition; §1.4.1 read verbatim from source this session. Adding a section to an existing verbatim citation within its live window is not a §13.6 refresh event. Pass.

## Mandatory-block check
All eight conditions cleared (source resolves PMID 29368949; quoted_text supports claim; bindings register the surface; packet §8 explicitly filled).

## Rationale
A faithful new §1.4.1 phenotype with correct role encoding (substrate + definitional-duration as suppress-gates; debilitating as a demote-gate to §1.5.1 per Note 2), a correctly-dedicated `sev-debilitating` disability chip, the MOH-precedence rule surfaced in-force via teachPearl, and all four claim surfaces bound to source. No never-drift category touched.

## Required follow-ups (non-blocking)
- **Track C (MOH overlay):** when 8.2 MOH is encoded, convert the MOH-precedence Comment from a teachPearl note to a hard exclusion/precedence gate on `status-migrainosus`. A hard gate cannot be built against a phenotype that does not yet exist. Tracked in ADR-2026-07-06.
- **Applied (was optional editorial):** genericized the `migraine-history-established` chip `teachWhenSelected` (now shared by vm-B and sm-B) so it no longer reads VM-only.

## Verification state at gate time
- `check:claims` passes; `npx vitest run` → 219/219 (incl. 4 §1.4.1 tests); `tsc --noEmit` clean; `check:humanizer` PASS.
