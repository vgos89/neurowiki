# Clinical review — Spec: ICHD-3 Classifier

**Decision:** approve-with-conditions (conditions met in corrected spec — see re-review pass 2026-05-25)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-25

## Scope
- Claims touched: `clinic-headache-ichd3-migraine-criteria`, `clinic-headache-ichd3-cluster-criteria`, `clinic-headache-ichd3-hemicrania-criteria`, `clinic-headache-ichd3-tension-criteria`, `clinic-headache-ichd3-ndph-criteria`, `clinic-headache-tension-acute-management`, `clinic-headache-tension-preventive`
- Citations affected: `ichd3-2018`, `scher-tth-2024-continuum`, `ailani-ahs-2021`
- Surfaces changed: Spec document (`docs/specs/ichd3-classifier-spec.md`) — pre-implementation; will produce static JSX `data-claim` surfaces in `src/pages/ClinicHeadachePathway.tsx`
- Evidence-verifier packet: not applicable (spec review, pre-implementation; no new trial entry)
- Trial-statistician report: not applicable

## Semantic validity

| Section | ICHD-3 ref | Status |
|---|---|---|
| §4.1 Migraine without aura 1.1 | 1.1 | pass |
| §4.2 Migraine with aura 1.2 | 1.2 | pass |
| §4.3 Cluster 3.1 | 3.1 | pass |
| §4.4 Hemicrania continua 3.4 | 3.4 | pass — D explicitly framed as diagnostic |
| §4.5 TTH 2.2 | 2.2 | pass |
| §4.6 Chronic TTH 2.3 | 2.3 | flag — loose wording; tighten to verbatim ICHD-3 D criterion |
| §4.7 NDPH 3.3 | 3.3 | pass (checklist) but Q1 prompt contradicts it (see below) |

**CRITICAL BLOCK — Q1 temporal constraint drift:**
Q1 prompt says "within 3 days of the first attack." ICHD-3 3.3B says "within 24 hours." This directly contradicts the spec's own §4.7 and would route gradual-3-day onsets into the NDPH candidate branch — a clinical error. Mandatory block per never-drift category #5.

Corrected Q1 prompt:
> "Did this headache start at a clearly remembered moment, become continuous and unremitting **within 24 hours** of that onset, and persist daily since?"

Corrected `sudden_persistent` option: "Yes — I can pinpoint when it started, it became constant within a day, and it has been present every day since (≥3 months)."
Corrected `sudden_persistent_recent` option: "Yes — same pattern, but it has been present <3 months."

**TTH protocol (§7):** All claims accurate. Amitriptyline Level B pass; beta-blocker avoidance for TTH pass; OnabotulinumtoxinA not approved for TTH pass; CGRP mAbs/gepants no TTH indication pass.

**Decision logic table (§2) — cluster disqualifier:** "no autonomic features AND no restlessness" — pass; correctly reflects ICHD-3 3.1C "either or both."

**Secondary headache disclaimer (§5):** Clinically sufficient. Editorial additions recommended (Valsalva-triggered headache; explicit "worst headache of life" framing) but not blocking.

## Citation accuracy

- `ichd3-2018` — PMID 29368949, `last_reviewed: 2026-05-25`, 24-month window — pass
- `scher-tth-2024-continuum` — `last_reviewed: 2026-05-25`, 12-month window — pass
- `ailani-ahs-2021` — pre-existing, within window — pass; co-citation with Scher 2024 on MOH threshold appropriate (no conflict)

## Editorial / expert context

not applicable — no new trial entry in this PR.

## Freshness

All three citations: last_reviewed 2026-05-25, within respective review windows — pass.

## Rationale

The spec is largely sound — ICHD-3 criteria checklists in §4 are accurate, the anti-bias design discipline in §0 is well-constructed, the TTH protocol in §7 is clinically appropriate, and citations are correctly mapped. The sole blocking issue is Q1's "within 3 days" onset window, which contradicts ICHD-3 3.3B and the spec's own §4.7. Fix is unambiguous and precise; the reviewer provided the corrected text. After Q1 rewrite and §4.6 tightening, the spec is ready to approve.

## Required follow-ups

1. **MANDATORY (blocks implementation):** Rewrite Q1 prompt to "within 24 hours" per ICHD-3 3.3B. Exact corrected text above.

2. **Required before implementation:** §4.6 Chronic TTH 2.3D — change loose phrasing to verbatim ICHD-3: "Both of the following: (a) no more than one of photophobia, phonophobia, or mild nausea; (b) neither moderate or severe nausea nor vomiting."

3. **Open questions resolved (§8):**
   - Amitriptyline vs venlafaxine: keep amitriptyline as first-line overall; venlafaxine becomes co-first-line (not second-line) when moderate-severe depression is comorbid and requires concurrent treatment. Branch on depression comorbidity flag in UI.
   - MIDAS for TTH: acceptable as practical proxy for UI continuity; document as off-label adaptation. Track HIT-6 addition as follow-up in TASKS.md.
   - Chronic migraine vs chronic TTH disambiguation: top-2 side-by-side display confirmed appropriate; forced disambiguation question would re-introduce anchoring bias §0 is designed to prevent.

4. **Editorial (non-blocking):** §5 disclaimer — add "headache triggered by Valsalva, cough, or exertion → posterior-fossa/Chiari workup" and "worst headache of life" framing.

5. **Re-review required** after items 1 and 2 are corrected in the spec.
