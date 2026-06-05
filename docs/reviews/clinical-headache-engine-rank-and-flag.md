# Clinical review — headache engine rank-and-flag (pre-execution gate)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: Claude Opus 4.7)
**Date:** 2026-06-04
**Gate type:** Class E pre-execution clinical gate (runs after V approval, before any code is written)
**Reviewed:** medical-scientist spec (`docs/reviews/medsci-headache-engine-rank-and-flag-spec-2026-06-04.md`) + architect §17.1 (`docs/reviews/arch-headache-engine-rank-and-flag.md`) + engine source (`src/data/clinicHeadacheData.ts`) + citation registry/claims.

## Scope

- **Claims touched:** the nine registered ICHD-3 clinic-headache claims (`claims.ts` L780-900), all mapped to `ichd3-2018`. No claim *text* changes. No new claim IDs created by this change — the refactor changes *which phenotypes surface and how they are flagged*, not the wording of any registered clinical claim.
- **Citations affected:** `ichd3-2018` only (Cephalalgia 2018;38(1):1-211; PMID 29368949; DOI 10.1177/0333102417738202). `last_reviewed: 2026-05-25`, `review_window_months: 24` — within window. No refresh triggered by this change.
- **Surfaces changed:** computed strings from the matching engine (`src/data/clinicHeadacheData.ts`) — the `PhenotypeMatch` shape and `evaluateHeadachePhenotypes` output. New fields `definitionallyExcluded: boolean` + `exclusionReason?: string` are pure data (no band words, no diagnosis label, no percentage). No JSX surface, no result sentence, no tooltip text changes in this PR — those are Stage Two.
- **Evidence-verifier packet:** not applicable (no trial data change; ICHD-3 guideline citation already registered and within window).
- **Trial-statistician report:** not applicable (no trial, no statistic).

## Semantic validity

The spec's central move — splitting the single `definitional?: boolean` flag into a three-way criterion role (`scorable` / `demote-gate` / `suppress-gate`) — is clinically sound and maps correctly to ICHD-3 structure. A failed criterion that the patient simply has not *confirmed* (a feature or a duration window) should demote a phenotype to a flagged near-miss with a §X.5 Probable home, not silently delete it. A failed criterion that is positive evidence for a *different* phenotype, or that defines substrate/chronicity, or is an absent confirmatory test, should still suppress. The 40-criterion role classification in the spec was checked criterion-by-criterion against the engine source and against ICHD-3 §1.1/§1.2/§1.5/§2.2/§2.3/§3.1-§3.5/§4.10/A1.6.6. **Confirmed correct** with the conditions below.

**Confirmed:**
- The demote set (mig-B, mig-D, tth-B, ctth-B, cluster-B, cluster-C, ph-B, ph-C, sunct-B, hc-C) each has a real §X.5 Probable destination or is a feature/window the patient has not confirmed.
- The suppress set correctly captures positive-contradicting-evidence gates (aura-B, ctth-A, etc.), substrate/chronicity gates (sunct-C, cm-A, cm-C), and absent-confirmatory-test gates.
- The emit set (tth-D, ctth-D, cm-C) vs drop set split is clinically appropriate: emit "considered and set aside" only when failure is positive contradicting evidence a clinician would want to see acknowledged; drop silently when failure is mere substrate-absence.

**Flagged and ruled (the 10 follow-ups below).**

## Citation accuracy

`ichd3-2018` registry entry checked: current version (2018, third edition), PMID and DOI resolve, `last_reviewed: 2026-05-25` within the 24-month window. The registry `quoted_text` (L1385) carries verbatim ICHD-3 for §1.1, §1.2 (incl. C item 4), §1.3, §2.2, §2.3, §3.1-§3.4, §4.10, and the A1.6.6 research-criteria note — these I verified directly against the quoted text. The registry does **not** carry verbatim §1.5, §3.5, or A1.6.6 criterion B; those rest on the medical-scientist's WebFetch and are trusted under the standard authoring/gating division of labor (clinical-reviewer is read-only, no web). This residual is named, not waved away — see Rationale.

## Freshness

`ichd3-2018`: `last_reviewed: 2026-05-25`, window 24 months → **pass**. No freshness action required by this change.

## Required follow-ups

These are gating conditions. Conditions 1, 2, 7, 8, 9, 10 must be reflected in the implementation plan before any code is written. Conditions 3, 4, 5, 6 are my confirmations of the spec's deferred decisions (no further action beyond honoring them).

1. **§3.1 cluster floor + cluster-C stays DEMOTE — CONFIRMED; floor MANDATORY.** §3.1 cluster headache has the same no-suppress-gate gap the spec surfaced for §1.1: a feature-only phenotype with no natural suppress criterion will surface off one incidental chip. A minimum-evidence floor for §3.1 is mandatory, parallel to §1.1. cluster-C (cranial autonomic features / restlessness) DEMOTES, not suppresses — a between-bouts patient may simply not have reported autonomics yet.
2. **§2.2 episodic-TTH floor — UPGRADED to REQUIRED.** The spec recommended a §2.2 floor; I am upgrading it to required for the same reason as §1.1/§3.1. Surface §2.2 episodic TTH only if ≥2 TTH-pointing chips including ≥1 §2.2 C feature {loc-bilateral, qual-pressing-tightening, sev-mild, sev-moderate, act-not-aggravated}.
3. **§3.5.2/§3.5.4 indomethacin-pending near-miss — deferral CONFIRMED acceptable for Phase 1.** "Missing only an indomethacin-response trial" is a legitimate near-miss class, but surfacing it correctly needs a trial-pending UI affordance that does not exist yet. Keep the current `hiddenUntilTrial` hard-hide for Phase 1. Log a TASKS.md follow-up to surface the §3.5.2/§3.5.4 indomethacin-pending near-miss as its own task.
4. **`vm-history` emit-vs-drop — RULE DROP.** The new `vm-history` suppress criterion (A1.6.6 criterion B, established migraine history) should DROP silently on failure, consistent with vm-A. Absence of an established migraine history is substrate-absence, not positive contradicting evidence — no "set aside" card.
5. **`cm-C` suppress-with-EMIT — RULE EMIT correct.** Emitting "considered and set aside" for cm-C is not over-clever; a clinician evaluating a chronic-headache patient benefits from seeing that chronic migraine was considered. Keep `exclusionReason` neutral and factual; any "see Chronic TTH" steer belongs to the Stage Two copy layer, NOT the engine.
6. **Evidence + safety invariants — division of labor named; safety confirmed.** Verifiable-from-registry quotes (§1.2 C item 4, §1.2 A, §2.2 D, §2.3 D, §1.3 A, §2.3 A, §3.1-§3.4) I checked directly. §1.5, §3.5, A1.6.6 criterion B are WebFetch-trusted. Safety invariants confirmed: the engine output in this PR carries no diagnosis label, no percentage, no band words ("Leading/Possible/Less likely" are Stage Two), and the SNNOOP10 red-flag path is preserved.
7. **Strengthen the dev-time invariant.** The architect's invariant must assert: every phenotype has at least one `role === 'suppress-gate'` criterion, OR a `hiddenUntilTrial` gate, OR a registered minimum-evidence floor (§1.1 / §2.2 / §3.1). This is the structural guarantee that no feature-only phenotype can surface off a single incidental chip. It must fail at dev time if a future phenotype is added without one of the three.
8. **`sunct-C` SUPPRESS — CONFIRMED correct.** sunct-C defines the substrate of SUNCT/SUNA (the conjunctival injection + tearing pattern that distinguishes it). Its failure should suppress, not demote — a SUNCT near-miss without the defining autonomic substrate is not a SUNCT near-miss.
9. **SNNOOP10 red-flag short-circuit must render non-collapsibly on EVERY result.** `anyRedFlagActive` (engine L363) is the backstop. This is carried forward from the A.1 patient-safety finding and must not slip during the refactor: when any red-flag chip is active, the result must surface the SNNOOP10 secondary-cause backstop non-collapsibly, regardless of phenotype matches. The engine refactor must not change the red-flag short-circuit behavior.
10. **Bundle all corrections; aura-laterality fix is NON-NEGOTIABLE in this PR.** The three corrections ship together. Correction 4a — rewiring `auraCharacteristicCount` off headache-pain laterality (`loc-unilateral`) onto a dedicated `aura-symptom-unilateral` chip for the §1.2 C "unilateral aura symptom" characteristic — MUST ship with the demote refactor. Shipping the demote without the aura-laterality fix would manufacture a wrong-chip near-miss prompt (the tool would tell a clinician to "confirm unilateral aura" based on headache-pain laterality). That is a worse failure than the current silent drop. Non-negotiable.

## Rationale

The spec is clinically correct and the architect's structural plan is sound. The change converts a silent-deletion defect (§1.5/§2.4/§3.5 Probable near-misses currently vanish) into a flagged near-miss surface, while preserving genuine suppression where a failed criterion is positive evidence against the phenotype. The three minimum-evidence floors (§1.1, §2.2, §3.1) are the load-bearing safety addition: without them, splitting the drop-gate would let a feature-only phenotype surface off one incidental chip, trading a silent false-negative for a noisy false-positive. With the floors and the strengthened invariant (condition 7), that risk is closed structurally rather than by discipline. The one residual I cannot personally close is the verbatim text of §1.5, §3.5, and A1.6.6 criterion B — I am read-only and cannot WebFetch; those rest on the medical-scientist's verification, which is the correct division of labor. **No code may be written until conditions 1, 2, 7, 8, 9, 10 are reflected in the implementation plan. Conditions 3, 4, 5, 6 are confirmations of the spec's deferred decisions. A post-execution clinical-reviewer pass on the committed engine + test diff is also required before `/pr-ready`.**

---

*Gate artifact committed by the orchestrator (clinical-reviewer is read-only Read/Grep/Glob). Pairs with the §17.1 architect artifact `docs/reviews/arch-headache-engine-rank-and-flag.md` and the authoring spec `docs/reviews/medsci-headache-engine-rank-and-flag-spec-2026-06-04.md`.*
