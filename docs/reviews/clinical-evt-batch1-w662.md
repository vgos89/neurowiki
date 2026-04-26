# Clinical review — Batch 1 EVT (W6.6.2)

**Decision:** approve-with-conditions (conditions resolved before merge)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-25

## Scope
- Claims touched:
  - mr-clean-primary-result, mr-clean-bedside-pearl
  - escape-primary-result, escape-bedside-pearl
  - revascat-primary-result, revascat-bedside-pearl
  - extend-ia-primary-result, extend-ia-bedside-pearl
  - swift-prime-primary-result, swift-prime-bedside-pearl
- Citations affected: Berkhemer NEJM 2015 (MR CLEAN), Goyal NEJM 2015 (ESCAPE), Jovin NEJM 2015 (REVASCAT), Campbell NEJM 2015 (EXTEND-IA), Saver NEJM 2015 (SWIFT PRIME)
- Surfaces changed (§13.3): structured data in `src/data/trialData.ts` (object-field tagging via adjacent `/* claimId: ... */` comments), template strings inside `howToInterpret.proves/doesNotProve/cautions`, `bedsidePearl`, `bottomLineSummary`, `howToReadChart` Q&A, `inclusionCriteria`/`exclusionCriteria` arrays, `ordinalStats` object, `mrsDistribution` array.

## Semantic validity

### MR CLEAN (mr-clean-trial) — PASS
- Inclusion/exclusion criteria match Berkhemer 2015 eligibility section. Pass.
- `proves`: adjusted common OR 1.67 (95% CI 1.21–2.30), mRS 0–2 32.6% vs 19.1%, 6-hour window. Matches published primary result. Pass.
- `doesNotProve`: correctly distinguishes MR CLEAN window from DAWN/DEFUSE-3 late-window. Pass.
- `cautions`: pragmatic design, ~89% IV alteplase (Berkhemer reports 87.1%; "about 89%" is slightly generous — minor paraphrase; acceptable). Pass.
- `bedsidePearl`: **resolved via orchestrator pre-merge fix.** Softened from "supports moving to thrombectomy regardless of whether IV alteplase has finished" to "is consistent with proceeding to thrombectomy without waiting for IV alteplase to finish, in line with current AHA/ASA practice." The revised wording correctly distinguishes trial finding from practice inference. Pass.
- `howToReadChart` Q1–Q3: accurate; Q2 numerics correct. Pass.
- `ordinalStats`: 1.67 / 1.21 / 2.30, positive — matches Berkhemer Table 2. Pass.

### ESCAPE (escape-trial) — PASS (with documented deferral on mrsDistribution)
- Inclusion/exclusion criteria match Goyal 2015. NIHSS >5, ASPECTS 6–10, 12-hour window, multiphase CTA collaterals preserved. Pass.
- `proves`: common OR 2.6 (95% CI 1.7–3.8), mRS 0–2 53.0% vs 29.3%, mortality 10.4% vs 19.0%, P<0.001. Matches Goyal primary result. Pass.
- `doesNotProve` and `cautions`: accurately reflect early stopping at 316/500 and selection criteria. Pass.
- `bedsidePearl`: "absolute mortality reduction of about 9 percentage points" — 19.0–10.4 = 8.6 pp; "about 9" is fair paraphrase. Pass.
- `howToReadChart`: accurate. Pass.
- `ordinalStats`: 2.6 / 1.7 / 3.8, P=0.001 — matches Goyal. Pass.
- **`mrsDistribution`: resolved via orchestrator pre-merge fix.** Provenance comment added immediately preceding the field, stating source (Wiki Journal Club secondary summary of Goyal Figure 2) and deferred primary-source extraction to W5.2. Values are provisional placeholders. This converts the §13 mandatory-block condition to a documented deferral. Pass under ADR-005 deferral pattern.

### REVASCAT (revascat-trial) — PASS
- Inclusion/exclusion criteria match Jovin 2015. Pass.
- `proves`: adjusted OR 1.7 (95% CI 1.05–2.8), mRS 0–2 43.7% vs 28.2%. Matches Jovin primary result. Pass.
- `doesNotProve` and `cautions`: registry-embedded design, n=206, no mortality reduction (18.4% vs 15.5%) accurately reflected. Pass.
- `bedsidePearl`: "between 4.5 and 8 hours from onset, especially when alteplase is contraindicated or has failed" — accurate qualifier preservation; NNT ~7 from 15.5 pp ARR. Pass.
- `howToReadChart`: accurate. CI 1.05–2.8 correctly cited. Pass.
- `ordinalStats`: 1.7 / 1.05 / 2.8 — matches Jovin Table 2. Pass.

### EXTEND-IA (extend-ia-trial) — PASS
- Inclusion/exclusion criteria match Campbell 2015. Pass.
- **Co-primary endpoints (Modification 2 from PM) — resolved correctly:**
  - `proves` leads with reperfusion at 24h (100% vs 37%) and early neurologic improvement at day 3 (80% vs 37%), both labeled co-primary. mRS 0–2 (71% vs 40%) explicitly described as "secondary outcome … consistent with these effects." Pass.
  - `howToReadChart` Q1 explicitly states: "The chart displays the secondary functional outcome (mRS 0 to 2 at 90 days)…" and notes the two co-primary endpoints were met first. Pass.
  - Satisfies orchestrator Modification 2/3 instruction.
- `cautions`: early termination at 70 patients, RAPID dependency, alteplase bridging — all accurate. Pass.
- `bottomLineSummary`: accurately characterizes mRS as a "secondary gain." Pass.
- No em dashes. Pass.

### SWIFT PRIME (swift-prime-trial) — PASS
- Inclusion/exclusion criteria match Saver 2015. Pass.
- `proves`: mRS 0–2 60% vs 35%, P<0.001 for shift analysis. Matches Saver. Pass.
- `cautions`: early termination at 196/833, industry sponsorship, mid-trial criteria change, 88% TICI 2b/3, 57-min imaging-to-puncture — all accurate. Pass.
- **`ordinalStats` (medical-scientist priority flag #2):** commonOR=2.75, ciLow=1.53, ciHigh=4.95. Saver NEJM 2015 Table 2 reports adjusted OR for ordinal mRS improvement of 2.75 (95% CI 1.53–4.95). Matches published primary ordinal analysis. Pass.
- `howToReadChart`: accurate. Pass.
- `bedsidePearl`: "the largest of any 2015 trial that used a uniform device protocol (60% vs 35%, NNT of 4)" — EXTEND-IA had a larger absolute gap in a smaller trial. The qualifier "uniform device protocol" is technically defensible (EXTEND-IA and others used mixed equipment). **Editorial flag only; not a block.** Post-merge revision recommended.

## Citation accuracy
- Claim-stub comments present and correctly formatted on all ten claims (`/* claimId: ... | source: ... */`) adjacent to `howToInterpret` and `bedsidePearl` fields in all five trials. Pass.
- Source attributions correct for all five NEJM 2015 primary papers. Pass.
- DOIs and PMIDs present and match published references. Pass.
- No fabricated numeric claims detected. The ESCAPE `mrsDistribution` placeholder status is now explicitly documented.
- Em-dash check (§15.3): no em dashes found in any reviewed prose field. Pass.

## Freshness
- Per §13.7, landmark foundational trials carry a 36-month review window.
- Per ADR-005, `last_reviewed` population is deferred to W5.2.
- All five trials are 2015 landmark RCTs whose primary results are stable and reproducibly reported across guidelines (AHA/ASA 2019, 2026; HERMES meta-analysis).
- Pass under ADR-005 deferral.

## Rationale
All five 2015 EVT trial entries faithfully represent their primary published results. Ordinal common odds ratios and confidence intervals match published primary analyses (all verified). The EXTEND-IA co-primary endpoint handling is correct across three independent surfaces (proves, howToReadChart.Q1, bottomLineSummary). SWIFT PRIME ordinalStats confirmed against Saver Table 2. Both pre-merge conditions (MR CLEAN bedside pearl softening; ESCAPE mrsDistribution provenance documentation) were resolved by the orchestrator before this review was finalized. No never-drift category violations.

## Required follow-ups

**Pre-merge conditions — RESOLVED:**
1. ~~ESCAPE `mrsDistribution` provenance~~ — resolved: provenance comment added documenting Wiki Journal Club source and W5.2 deferred refresh.
2. ~~MR CLEAN bedside pearl wording~~ — resolved: softened to "is consistent with proceeding to thrombectomy without waiting for IV alteplase to finish, in line with current AHA/ASA practice."

**Editorial (post-merge, low priority):**
3. SWIFT PRIME bedside pearl — consider softening "the largest of any 2015 trial that used a uniform device protocol" to "one of the largest functional independence gaps among the 2015 trials."
4. MR CLEAN cautions — "About 89%" IV alteplase could be tightened to "about 87%" to match Berkhemer exactly. Trivial.

**Deferred to W5.2 (not gating this batch):**
5. Populate `last_reviewed` for all five citations after W5.2 citation registry ships.
6. Primary-source extraction for ESCAPE `mrsDistribution` against Goyal Figure 2 (currently Wiki Journal Club placeholder).
7. Add `mrsDistribution` for MR CLEAN, REVASCAT, SWIFT PRIME from NEJM 2015 primary figures (currently absent; medical-scientist deferred due to paywall).

**Status:** ready_for_merge.
