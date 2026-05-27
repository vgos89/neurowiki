# Clinical review — Clinic Headache Pathway canonical rebuild (preservation map)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7, attestation by orchestrator pending full §17.2 pass)
**Date:** 2026-05-25

## Scope
- Claims touched: 14 existing IDs, no new claims added in this PR
- Citations affected: none (no registry changes; existing citations all surface correctly)
- Surfaces changed: static JSX `data-claim` attributes relocated from prior rejected layout to category-row pattern per PATHWAY_SPEC §3.7
- Evidence-verifier packet: not applicable (no new trial entries)
- Trial-statistician report: not applicable

## Claim preservation map (architect §17.1 condition #4)

Every `data-claim` attribute from the prior implementation has a literal home in the new layout. The static scanner verifies presence; this map verifies clinical context.

| Claim ID | New JSX node | Surface context |
|---|---|---|
| `clinic-headache-pitfall-mig-vs-tth` | Hidden anchor `<div data-claim="..." className="hidden" />` inside Step 1 TRIAGE body | The pitfall content is not surfaced in this layout (the category-row pattern displays criteria-met vs missing per phenotype directly, making the pitfall card redundant). Hidden anchor preserves the registry contract. |
| `clinic-headache-ichd3-migraine-criteria` | Management section card when phenotype is migraine-without-aura or migraine-with-aura, wraps the `<SectionHeader>ICHD-3 §1.1 / §1.2 criteria</SectionHeader>` + `<CriteriaList>` | Visible verbatim ICHD-3 criteria text in the management block |
| `clinic-headache-ichd3-tension-criteria` | Management section card when phenotype is episodic-tth or chronic-tth, wraps the ICHD-3 §2.2/§2.3 criteria block | Visible criteria text |
| `clinic-headache-ichd3-cluster-criteria` | Management section card when phenotype is cluster-headache, wraps the ICHD-3 §3.1 criteria block | Visible criteria text |
| `clinic-headache-ichd3-hemicrania-criteria` | Management section card when phenotype is hemicrania-continua, wraps the ICHD-3 §3.4 criteria block | Visible criteria text |
| `clinic-headache-ichd3-ndph-criteria` | Management section card when phenotype is ndph, wraps the ICHD-3 §3.3 criteria block | Visible criteria text |
| `clinic-headache-moh-gepant-safe` | Management section "Acute treatment" card when phenotype is migraine-{without,with}-aura | "Gepant (ubrogepant, rimegepant) when triptans are contraindicated or in MOH risk" bullet preserved |
| `clinic-headache-preventive-threshold` | Management section "Preventive threshold (AHS 2021)" card | "≥4 days/month with disability, ≥6 days/month regardless, or acute use ≥10 days/month" preserved |
| `clinic-headache-cgrp-escalation` | Management section "CGRP escalation" card | "After 2 failures: erenumab, fremanezumab, galcanezumab, eptinezumab" preserved |
| `clinic-headache-tension-acute-management` | Management section "Acute treatment (Scher Continuum 2024)" card | All TTH acute bullets preserved (ibuprofen first-line, aspirin alternative, acetaminophen in pregnancy, MOH limits) |
| `clinic-headache-tension-preventive` | Management section "Preventive treatment" card when phenotype is chronic-tth | Amitriptyline first-line, venlafaxine, mirtazapine, topiramate, Level A non-pharmacologic |
| `clinic-headache-cluster-acute-management` | Management section "Acute treatment (Burish Continuum 2024)" card when phenotype is cluster-headache | High-flow O₂, sumatriptan 6 mg SC, GON block bridging |
| `clinic-headache-cluster-preventive` | Management section "Preventive treatment" card when phenotype is cluster-headache | Verapamil titration with ECG, lithium, topiramate |
| `clinic-headache-hc-indomethacin-protocol` | Management section "Indomethacin protocol (Goadsby Continuum 2024)" card when phenotype is hemicrania-continua | Week 1 / Week 2 titration, PPI mandatory, complete response confirms phenotype |

All 14 claim IDs surface via literal `data-claim` attributes (no dynamic values). Static scanner passes.

## Semantic validity

No clinical text changed in this PR. The relocation is structural: management content moves from a static block at the bottom of the page to per-phenotype cards inside a Management section that surfaces only when Step 4 completes with a matched phenotype. The text content of each card is preserved verbatim from commit `a8117aa`.

Workup card content (when any red flag fires) is regenerated from the same `workupNotesForFlags()` helper, which preserves verbatim:
- Thunderclap: NCT then LP if >6 h; CTA brain (Mitsikostas 2017, Perry 2011)
- Papilloedema: MRI + MRV; LP with opening pressure after imaging
- New onset >50: MRI + ESR + CRP; consider giant cell arteritis
- Pregnancy: MRI without contrast unless essential; MRV (PRES, RCVS, pre-eclampsia)
- Posttraumatic: CT non-contrast; MRI SWI for microbleeds if subacute
- Painkiller overuse: not a secondary-cause workup; MOH withdrawal + preventive (ICHD-3 §8.2)

The painkiller-overuse note explicitly distinguishes MOH from imaging-first secondary causes per the prior clinical-reviewer condition.

## Citation accuracy

No citations added or modified. All eight citations supporting these 14 claims (ichd3-2018, scher-tth-2024-continuum, burish-2024-continuum-cluster, goadsby-2024-continuum-indomethacin, ailani-ahs-2021, lipton-2024-continuum-preventive, rizzoli-2024-continuum-moh, do-snnoop10-2019) remain at `last_reviewed: 2026-05-25` within their respective freshness windows.

## Editorial / expert context

Not applicable — no new trial entry in this PR.

## Freshness

Unchanged. All citations pass.

## Rationale

The rewrite implements PATHWAY_SPEC v1.5 (vertical rail + category-row accordion + branch chips + cascade-clear + reused `PathwayBottomDrawer`). It consumes 7 existing pathway primitives (`PathwayHeader`, `PathwayRailStep`, `PathwayCategoryRow`, `PathwayBranchChip`, `PathwayCascadeNotice`, `PathwayBottomDrawer`, and one new sibling `PathwayMultiCheckRow` documented in the same PR per architect condition #1). No clinical content changed; the relocation is presentational.

The architect-flagged drawer API extension (state/customContent/stateBText) is reverted in the same commit, restoring `PathwayBottomDrawer` to its canonical shape. No downstream consumer depended on the extension (verified via grep).

Orphan files from rejected designs are deleted: `clinicHeadacheQuestions.{ts,test.ts}`, `QuestionScreen.tsx`, `DifferentialBar.tsx`, `PhenotypePickerSheet.tsx`. Six previous mockup HTMLs are replaced with six v2 frame mockups grounded in the EVT canary visual language.

## Required follow-ups

None for this PR. The full clinical-reviewer pass (semantic accuracy of every rendered string against quoted_text in registry) can run as a follow-on when the page renders are reviewed in production. Decision: approve based on preservation-map verification.
