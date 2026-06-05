# Clinical review — headache treatment on-row expander (Stage One-b, POST-execution gate)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-05
**Gate type:** Class D-clinical post-execution gate (fresh-context reviewer per §18; confirms the four pre-execution gating conditions are honored in code before commit)

## Scope
- **Claims touched (relocation + tagging-site move only; one additive caveat):** 12 dosing/management cards (`clinic-headache-moh-gepant-safe`, `…-preventive-threshold`, `…-cgrp-escalation`, `…-tension-acute-management`, `…-tension-preventive`, `…-cluster-acute-management`, `…-cluster-preventive`, `…-hc-indomethacin-protocol`, `…-chronic-migraine-acute`, `…-chronic-migraine-preventive`, `…-ph-indomethacin-protocol`, `…-sunct-lamotrigine`) relocated into `HeadacheManagement.tsx`; 8 ICHD-3 criteria claims (7 as hidden literal markers in `HeadacheResultList.tsx`, ndph on its management card); 1 new additive caveat `clinic-headache-partial-match-caveat`.
- **Citations affected:** `ichd3-2018` (8 criteria claims + caveat) + management citations — no citation record edited by this PR.
- **Surfaces changed (§13.3):** static JSX text; new opt-in `<details>` "Show management" disclosure. No structured-data, computed-string, or markdown surface.
- **Evidence-verifier packet / Trial-statistician report:** not applicable — no trial entry, statistic, or threshold change.

## Condition verification

**Condition 1 — caveat wording fixed & placed: PASS.** `HeadacheResultList.tsx` renders, at the TOP of the disclosure body (before `<HeadacheManagement>`), the exact string "Partial match — confirm the diagnosis before initiating. Criteria are not yet met for this phenotype; dosing is shown for reference." Byte-identical, no softening. Styled as a prominent amber `role="note"` above the first dosing card.

**Condition 2 — strength-gated to partial only: PASS, and the chronic-migraine-probable edge case is ruled correct.** The caveat renders iff `m.matchStrength === 'partial'`; it does NOT fire on `full`/`probable`. Ruling on the matchStrength-vs-displayed-tag question: keying off `matchStrength === 'partial'` is clinically correct and chronic-migraine-probable is NOT a missed case. Chronic-migraine at `matchStrength === 'probable'` is a genuine probable match (its §1.3 criteria are substantially met); it is displayed as the "Partial" tag only because ICHD-3 has no "probable chronic migraine" code (§1.5 does not cover §1.3) — a label-fidelity fix, not a statement that criteria are unmet. The caveat asserts "Criteria are not yet met," which would be FALSE for chronic-migraine-probable. Firing it there would put an inaccurate statement on a probable match. The code correctly suppresses the caveat for it. Condition 2's intent (do not anchor on weak matches) is honored without over-firing onto a genuine probable match.

**Condition 3 — collapsed by default on ALL rows incl. top: PASS.** Management is a native `<details>` with no `open` attribute — collapsed by default on every row. The accordion's top-match auto-open governs only the criteria region; it does not propagate into the nested `<details>`. No row force-opens management. "Criteria first, dosing on demand" preserved.

**Condition 4 — no floor / no suppression: PASS.** Management is gated solely by `hasHeadacheManagement(phenotypeId)` (phenotype-coverage: 10 of 11 phenotypes have a card; the 11th never had treatment content). Not a match-strength floor — a 1-of-4 `partial` match still exposes management behind the disclosure with the Condition 1 caveat. No minimum-criteria suppression.

**Caveat claim registration: PASS.** `claims.ts` — `clinic-headache-partial-match-caveat` → `citation_ids: ['ichd3-2018']`, jsx surface; the rendered `<p>` carries the literal `data-claim`. Exactly one render site. Anchor to `ichd3-2018` appropriate.

**Criteria-claim single-render: PASS.** Each of the 8 criteria claim IDs has exactly one literal `data-claim`: 7 hidden markers in `HeadacheResultList.tsx` + ndph on its management card. None zero (no Check-2 forward fail), none duplicated. The two many-to-one mappings (migraine serves 2 phenotypes, tension serves 2) are each a single marker. Visible per-row `CriteriaList` renders untagged via dynamic `.map()`, so criteria text is not double-counted as a claim.

**Irregular relocations: PASS (both).** ndph "diagnosis of exclusion / workup before treating" Row present in `HeadacheManagement` (not orphaned), tagged with the ndph criteria claim. chronic-tth-only preventive card gated `phenotypeId === 'chronic-tth'` inside the shared tension case — episodic-TTH receives only the acute card and does not gain the preventive card.

## Semantic validity
No never-drift category crossed. The mechanical diff (43 dosing `<Row>` strings OLD == NEW, byte-identical; 8 "ICHD-3 §X criteria" SectionHeaders intentionally absent because criteria render in the row; one new "Management" SectionHeader on the ndph card; all treatment SectionHeaders identical) is corroborated by the code: every dose, route, frequency, grade (AHS Grade A, AAN Level B/A), temporal limit (≤15/≤10 days/month MOH ceilings, 1–2 week indomethacin confirmation window, max 150 mg/day), drug, and population qualifier (chronic-tth-only; WOCBP cautions) is preserved verbatim. The only new clinical string is the additive caveat. One flag raised and cleared: `clinic-headache-moh-gepant-safe` also appears on `MigrainePathway.tsx` (the separate `/migraine` guide MOH-screen card, with its own distinct prose) — a pre-existing independent surface legitimately reusing the claim ID (registry many-to-one), not an orphan from this relocation. `ClinicHeadachePathway.tsx` now renders only `<HeadacheResultList matches={matches} />` and carries none of the relocated claims — old block fully removed, no duplicate left behind.

## Citation accuracy
`ichd3-2018` `quoted_text` read in full: verbatim ICHD-3 criteria for §1.1, §1.2, §1.3, §2.2, §2.3, §3.1, §3.2, §3.3, §3.4, §4.10, A1.6.6. Each criteria claim maps to the correct section and paraphrases faithfully. Caveat's anchor to `ichd3-2018` accurate. No management citation record touched (dosing verbatim).

## Freshness
`ichd3-2018`: `last_reviewed` = 2026-05-25, window 24 months. 11 days old as of 2026-06-05 — within window. PASS. No `last_reviewed` edit; §13.6 refresh untouched, not re-triggered.

## Rationale
Structural relocation of verbatim-reviewed dosing content plus the single additive anti-anchoring caveat the pre-execution gate mandated. All four binding conditions honored in code; caveat registered to `ichd3-2018` with a literal tag; all 8 criteria claims render exactly once (two many-to-one mappings deduplicated); ndph exclusion Row and chronic-tth preventive gate intact. No never-drift category crossed (byte-identical 43-row diff corroborated by code; only the additive caveat is new). `ichd3-2018` fresh and its `quoted_text` supports every criteria claim. Cross-surface `moh-gepant-safe` flag cleared as pre-existing independent surface. Approved for commit.

## Required follow-ups
- **[Non-gating, documentation]** The pre-execution Condition 2 parenthetical ("including the chronic-migraine-probable case") conflated displayed-tag with `matchStrength` for that one phenotype. As-built, the caveat is `matchStrength`-gated, so chronic-migraine-probable correctly does NOT show the caveat (its criteria are met; only the "probable" label is uncodeable). The matchStrength gate is the clinically correct implementation; this post-exec record reconciles the nuance — no code change.
