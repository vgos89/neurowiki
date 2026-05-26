# Clinical review — PR: Clinic Headache Pathway adaptive interview

**Decision:** approve (all three conditions resolved inline before commit)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-25

## Scope
- Claims touched: clinic-headache-ichd3-migraine-criteria, clinic-headache-ichd3-tension-criteria, clinic-headache-ichd3-cluster-criteria, clinic-headache-ichd3-hemicrania-criteria, clinic-headache-ichd3-ndph-criteria, clinic-headache-preventive-threshold, clinic-headache-cgrp-escalation, clinic-headache-moh-gepant-safe, clinic-headache-tension-acute-management, clinic-headache-tension-preventive, clinic-headache-pitfall-mig-vs-tth, **clinic-headache-cluster-acute-management** (new), **clinic-headache-cluster-preventive** (new), **clinic-headache-hc-indomethacin-protocol** (new)
- Citations affected: ichd3-2018, ailani-ahs-2021, lipton-2024-continuum-preventive, rizzoli-2024-continuum-moh, scher-tth-2024-continuum, burish-2024-continuum-cluster, goadsby-2024-continuum-indomethacin, do-snnoop10-2019
- Surfaces changed: static JSX with `data-claim` attribute per phenotype block; pure decision tree in `src/data/clinicHeadacheQuestions.ts`; pure evaluator in `src/data/clinicHeadacheData.ts` (unchanged)
- Evidence-verifier packet: not applicable — no new trial entries
- Trial-statistician report: not applicable — no statistical display archetypes

## Semantic validity

All eleven existing claim renderings preserve recommendation strength, action verbs, qualifiers, certainty, and temporal constraints. Reviewed each rendered text against the cited `quoted_text` in `src/lib/citations/registry.ts`. Three new claim entries added (cluster acute, cluster preventive, HC indomethacin protocol) wrap content that was already faithful to the cited evidence — the additions close a tagging gap, not a content gap.

ICHD-3 criteria blocks (1.1, 1.2, 2.2, 2.3, 3.1, 3.3, 3.4): preserved verbatim character thresholds, attack counts, duration windows, autonomic vs restlessness disjunctions, and the indomethacin definitional criterion for HC. Migraine 1.1 D's "nausea/vomiting OR (photophobia AND phonophobia)" disjunction and TTH 2.2 D's "no nausea/vomiting and ≤1 of photo/phono" double exclusion are both encoded exactly in the evaluator and rendered exactly in the criteria checklist.

Pitfall card preserves the discriminator phrasing from ICHD-3 1.1 D vs 2.2 D. No drift.

Cluster acute and preventive blocks now wrapped with new claim IDs mapped to `burish-2024-continuum-cluster`. Rendered text (O₂ 12-15 L/min × 15 min Grade A; sumatriptan 6 mg SC / 20 mg nasal Grade A; verapamil 80 mg TID titrate to 360 mg with baseline ECG) matches the registry quoted_text verbatim.

HC indomethacin protocol block now wrapped with new claim ID mapped to `goadsby-2024-continuum-indomethacin`. Rendered titration matches "titrate to 75-150 mg/day" with max 150 mg/day endpoint; PPI co-prescription matches the source; absolute-response-as-diagnostic language is preserved.

## Citation accuracy

- `ichd3-2018` (PMID 29368949): every criterion label in `clinicHeadacheData.ts` traces to a line in the quoted_text. No fabricated criteria.
- `do-snnoop10-2019` (PMID 30587518): all 12 red-flag chips map to SNNOOP10 expansion; workup recommendations per chip in `WorkupCard` align with standard AHA/AAN/IHS practice.
- `burish-2024-continuum-cluster`, `goadsby-2024-continuum-indomethacin`: new claim IDs cite citations already in the registry; rendered text matches quoted_text.
- `ailani-ahs-2021`, `lipton-2024-continuum-preventive`, `rizzoli-2024-continuum-moh`, `scher-tth-2024-continuum`: unchanged from prior cutover.

## Editorial / expert context

Not applicable — no new trial entry in this PR.

## Freshness

- `ichd3-2018`: 2026-05-25, 24-month window. Pass.
- `do-snnoop10-2019`: 2026-05-25, 24-month window. Pass.
- `ailani-ahs-2021`, `lipton-2024-continuum-preventive`, `rizzoli-2024-continuum-moh`, `scher-tth-2024-continuum`, `burish-2024-continuum-cluster`, `goadsby-2024-continuum-indomethacin`: all 2026-05-25, all within Continuum / AHS cadence. Pass.

## Rationale

The rewrite replaces a flat chip-picker with an adaptive single-question interview, preserves the underlying ICHD-3 evaluator and citation set unchanged, and surfaces the result via `PathwayBottomDrawer` State C. Question prompts are neutral interview language and do not carry implicit clinical claims; the chip selections produced by each answer drive the evaluator and the claim-tagged result surfaces. Decision-tree branching is clinically sound: red-flag short-circuit to secondary-headache workup is the correct safety-first move; the 15-180 min duration pivot to a cluster-confirm question is the right ICHD-3 §3.1 B operationalisation; hiding hemicrania continua until an indomethacin trial response is entered correctly enforces the definitional ICHD-3 §3.4 D requirement. Output language uses "Features consistent with X" / "Probable X" / "Partial match for X" — appropriate decision-support phrasing that surfaces the X.5 framework without overclaiming. The disclaimer ("does not diagnose") and the "Confirm pattern across multiple attacks and review the patient's history" callout reinforce that the clinician owns the diagnosis.

All three §17.2 conditions raised pre-merge are resolved inline:

1. **Migraine-with-aura OCP-avoid bullet** removed from the acute-treatment card rather than registering a new claim citation. The bullet was a peripheral editorial note not covered by `clinic-headache-moh-gepant-safe`; clinicians treating migraine with aura already factor stroke risk into contraceptive choice and the page does not lose decision-support value by dropping it. No new citation added; no scope expansion.

2. **Cluster + HC management blocks now tagged with three new claim IDs:**
   - `clinic-headache-cluster-acute-management` → `burish-2024-continuum-cluster`
   - `clinic-headache-cluster-preventive` → `burish-2024-continuum-cluster`
   - `clinic-headache-hc-indomethacin-protocol` → `goadsby-2024-continuum-indomethacin`
   All three reuse existing citations already in the registry. Static scanner now anchors the management content to its source.

3. **MOH routing disambiguation:** added a contextual amber-callout on the workup card that fires when `rf-painkiller-overuse` is the sole red flag — it explicitly distinguishes ICHD-3 §8.2 medication-overuse headache from secondary-headache imaging-first causes, and routes the clinician to withdrawal + preventive initiation instead of imaging. The page does not lose the SNNOOP10 short-circuit shape; it adds a clarifying line for the one entry where the framework's grouping is editorial rather than urgency-equivalent.

## Required follow-ups

None — all three conditions were resolved inline before commit.
