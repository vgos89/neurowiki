# Clinical review — headache treatment on-row expander (Stage One-b, pre-execution gate)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-05
**Gate type:** Class D-clinical pre-execution gate (runs after V approval, before any code is written)

## Scope
- **Claims touched (no text change — relocation + tagging-site move only):**
  - Dosing/management cards (~16 relocating into `HeadacheManagement`): `clinic-headache-moh-gepant-safe`, `clinic-headache-preventive-threshold`, `clinic-headache-cgrp-escalation`, `clinic-headache-tension-acute-management`, `clinic-headache-tension-preventive`, `clinic-headache-cluster-acute-management`, `clinic-headache-cluster-preventive`, `clinic-headache-hc-indomethacin-protocol`, `clinic-headache-chronic-migraine-acute`, `clinic-headache-chronic-migraine-preventive`, `clinic-headache-ph-indomethacin-protocol`, `clinic-headache-sunct-lamotrigine`, plus the ndph inline Management `Row` carried inside `clinic-headache-ichd3-ndph-criteria`.
  - Criteria cards (8 IDs, `jsx` surface) whose `data-claim` tag moves to the row's `CriteriaList` render: `clinic-headache-ichd3-migraine-criteria`, `…-tension-criteria`, `…-cluster-criteria`, `…-hemicrania-criteria`, `…-ndph-criteria`, `…-chronic-migraine-criteria`, `…-paroxysmal-criteria`, `…-sunct-criteria`. Note the two many-to-one mappings: migraine criteria claim serves both migraine phenotypes; tension criteria claim serves both TTH phenotypes (verified claims.ts 778–807; page 718–720, 745–747).
  - `clinic-headache-pitfall-mig-vs-tth` (hidden literal marker div, page 418) — unchanged, out of scope.
- **Citations affected:** `ichd3-2018` (all 8 criteria claims) + management citations. No citation record is edited by this PR.
- **Surfaces changed (§13.3):** static JSX text; tooltip/modal-adjacent disclosure (the new `<details>` "Show management" control); no structured-data, computed-string, or markdown surface touched.
- **Evidence-verifier packet:** not applicable — no trial entry, no statistic, no threshold change. Confirmed.
- **Trial-statistician report:** not applicable.

## Display-policy ruling (A vs B vs B-with-conditions)

**Ruling: Policy B-with-conditions — APPROVED.** A "Show management" expander may attach to **every** match row, including `partial`, subject to the four conditions below. This is the gate's binding output; code may proceed only when all four are reflected.

Reasoning, weighed against the never-drift categories and the anchoring concern:

1. **This is decision-support for a clinician, not decision-making for a patient.** The audience is a neurology resident/fellow/attending at the bedside (CLAUDE.md §1). V's framing — "the user can select whichever one they want to go with at the end of the day with their clinical judgment" — is the correct posture for a tool whose stated stance is "reduces lookup time, does not replace judgment." Suppressing dosing for weak matches (Policy A) does not make the clinician safer; it makes them re-open a reference in a second tab. The anchoring risk Policy A guards against is real, but it is mitigated by *display context*, not by *withholding the reference text*.
2. **No never-drift category is touched.** The dosing text is relocated verbatim (confirmed against page 716–865). Recommendation strength, action verbs, dose/route/frequency qualifiers, certainty markers, and temporal constraints all stay byte-identical. **Which** rows expose management is a display-policy question, not a paraphrase-fidelity question.
3. **The mitigations against anchoring are present and prominent on every row.** Match strength tag ("Partial", slate-coloured), "X of Y criteria met", the criteria-met bar, and the explicit "Still needed: …" missing-criteria list all render in the row the clinician must open *before* reaching the nested "Show management" control. Management is opt-in behind a collapsed disclosure. The standing "the diagnosis remains a clinical judgement" disclaimer and footer "The tool does not diagnose" are intact. The SNNOOP10 red-flag short-circuit is untouched — a 1-of-4 cluster match only surfaces because no red flag is active.
4. **ICHD-3 itself endorses the multi-code posture.** General Principles ("each different type … must be separately diagnosed and coded") is already quoted in the multi-diagnosis banner.

**The four conditions that convert B into safe B-with-conditions:**

- **Condition 1 — Weak-match management framing label (REQUIRED).** Every `partial`-strength row's management disclosure must carry a short visible caveat at the top of the expanded management body, before the first dosing card, reading exactly:
  > **"Partial match — confirm the diagnosis before initiating. Criteria are not yet met for this phenotype; dosing is shown for reference."**

  This caveat is **new prose** — authored by `medical-scientist`, registered as its own claim (suggested ID `clinic-headache-partial-match-caveat`, mapped to `ichd3-2018`), and is **not** verbatim-relocated. It is the only new clinical string this increment may introduce. Wording is fixed above; the downstream author has no latitude to soften it.
- **Condition 2 — The caveat is strength-gated, not phenotype-gated.** Renders iff `matchStrength === 'partial'` (including the chronic-migraine-probable case, which renders as "Partial"). `full` and `probable` rows do not show it.
- **Condition 3 — Management stays opt-in (collapsed by default) on ALL rows, including the top match.** The clinician taps to reveal. Preserves the "criteria first, dosing on demand" sequence that is the anchoring mitigation.
- **Condition 4 — No floor / no suppression.** No minimum-criteria floor. A 1-of-4 match shows management behind the disclosure with the Condition 1 caveat. A floor would be an unsourced clinical-logic cutoff (Class E) and re-introduces decision-making-for-the-clinician.

Policy A rejected (withholding reference dosing does not improve safety and contradicts the product's purpose). Unconditioned Policy B rejected (weak-match dosing without a point-of-dosing reminder is avoidable anchoring exposure). B-with-conditions is approved.

## Semantic validity

**Verbatim-relocation standard — CONFIRMED required.** All ~16 dosing `data-claim` cards (page 722–865) and the ndph inline Management `Row` (page 811) must move byte-for-byte into `HeadacheManagement`. Label/value text, dose figures, routes, frequencies, grades, temporal limits are clinically load-bearing. Any change to a dosing string, threshold, grade, drug, or qualifier exits the verbatim path and re-triggers full Class E review. The single authorized exception is the new Condition 1 caveat string. Relocation hazards confirmed clinical-integrity-relevant: ndph's "diagnosis of exclusion / workup before treating" Row (its only dosing content — must not be orphaned); the `chronic-tth`-only preventive gate (population-qualifier — must be reproduced so episodic-TTH does not gain it).

## Citation accuracy

`ichd3-2018` `quoted_text` (registry.ts 1385) read in full: contains verbatim ICHD-3 criteria for §1.1, §1.2, §1.3, §2.2, §2.3, §3.1, §3.2, §3.3, §3.4, §4.10. Each of the 8 criteria-card claims maps to the correct section; descriptions paraphrase the quoted criteria faithfully. No quote/claim mismatch. Management-citation accuracy unchanged by this PR (no management citation record touched; dosing verbatim).

## Freshness

`ichd3-2018`: `last_reviewed` = 2026-05-25, window 24 months. As of 2026-06-05, 11 days old — within window. PASS. No refresh triggered (no `last_reviewed` edit in this PR).

## Rationale

Structural relocation of verbatim-reviewed dosing content plus one clinical-display-policy decision (whether weak matches expose management). Ruling: Policy B-with-conditions — management on every row including partials, because the tool is clinician-facing, dosing is reference text the clinician selects by judgment, match strength and unmet criteria are shown prominently before the opt-in disclosure, the red-flag backstop is intact, and ICHD-3 endorses multiple codes. Anchoring risk closed by a fixed strength-gated "Partial match — confirm before initiating" caveat at the point of dosing plus collapsed-by-default management — not by withholding the reference (Policy A) nor an unsourced floor. No never-drift category crossed (verbatim relocation; only new string is the additive safety caveat). `ichd3-2018` fresh and its `quoted_text` supports the criteria claims. Stays Class D execution provided the verbatim standard holds and the four conditions are implemented; approve-with-conditions because the conditions must be present in code before merge.

## Required follow-ups

Gating conditions — must be reflected in implementation before code, re-verified at post-execution gate:

1. **[GATING] Implement all four display-policy conditions** (caveat wording fixed; caveat strength-gated to `partial`; management collapsed-by-default on ALL rows incl. top; no floor). PR must show how each is wired.
2. **[GATING] Author + register the caveat string as a new claim** via `medical-scientist` (wording fixed above; author confirms no unintended strength/qualifier implication), ID `clinic-headache-partial-match-caveat` mapped to `ichd3-2018`, `jsx` surface, literal `data-claim` tag. Only new clinical string permitted this increment.
3. **[GATING] Criteria-claim tagging — Option A preferred, Option B (hidden literal markers, precedent page 418) acceptable if A infeasible.** The 8 `clinic-headache-ichd3-*-criteria` claims declare a `jsx` surface; the scanner (`check-claims.ts` 56) matches only a literal `data-claim="…"`, not `data-claim={expr}`. Enforce the many-to-one dedup: tag once per *claim ID* (migraine claim serves both migraine phenotypes; tension claim serves both TTH phenotypes) — each of the 8 IDs on exactly one element (zero → Check 2 forward fail; two → duplicate-tag hazard).
4. **[GATING] Verbatim relocation** of all dosing cards + ndph Management Row + chronic-tth preventive gate; diff moved literals against page 716–865; state byte-identical in PR.
5. **[GATING] Criteria card deleted from page, not duplicated** into `HeadacheManagement` and not left behind — criteria render once via the row's `CriteriaList`.
6. **[Non-gating] Post-execution clinical gate** (fresh context per §18) must confirm the four conditions, caveat registration, verbatim diff, and single-render-per-criteria-claim-ID before `/pr-ready`.
7. **[Non-gating] No evidence-verifier packet / trial-statistician report needed** — no trial/statistic/threshold change.
