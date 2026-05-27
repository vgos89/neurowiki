# Clinical review — Headache primary-trial citation rewire

**Decision:** approve-with-conditions (1 non-blocking follow-up)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-25

## Scope
- Claims touched: 10 clinic-headache-* claim entries (citation_ids rewired, descriptions updated)
- Citations affected: 19 new primary-evidence citations added to registry.ts
- Surfaces changed: data layer only (registry.ts + claims.ts). No JSX changes.
- Evidence-verifier packet: docs/evidence-packets/headache-primary-trial-audit-2026-05-25.md
- Trial-statistician report: not applicable

## Semantic validity

All 10 claim description rewrites verified as **attribution shifts, not clinical-recommendation shifts**. Every threshold, dose, line-of-therapy, contraindication, and time window preserved from the prior version. Two architect-flagged caveats handled correctly:

1. **PREEMPT 1 caveat** — `aurora-preempt-1-2010` registry entry explicitly notes "did NOT meet its primary endpoint." Claim 8 description carries the same caveat verbatim. **PASS.**

2. **AAN-AHS 2012 episodic-only scope** — `silberstein-aan-ahs-migraine-prevention-2012` registry entry caveats "this guideline strictly applies to episodic migraine prevention." Claim 8 description explicitly scopes the citation to the shared oral preventive ladder (topiramate, valproate, propranolol/metoprolol, amitriptyline, venlafaxine) and does NOT misattribute chronic-migraine-specific recommendations to it. **PASS.**

Never-drift category sweep across all 10 claims: no upgrades to recommendation strength; no action-verb changes; qualifiers + gates + WOCBP contraindications preserved; certainty markers preserved; temporal constraints preserved.

## Citation accuracy

Spot-checks confirmed:
- `cohen-oxygen-cluster-2009`: "Pain-free at 15 min 78% vs 20% placebo" matches claim verbatim
- `lipton-rimegepant-acute-2019`: "Pain-free 2h 19.6% vs 12.0%" matches claim verbatim
- `dodick-preempt-pooled-2010`: "regulatory anchor for FDA chronic-migraine indication" matches claim framing
- `bendtsen-efns-tth-2010`: "amitriptyline first choice for chronic TTH prophylaxis" matches claim verbatim
- `aurora-preempt-1-2010`: PREEMPT 1 caveat preserved verbatim
- `silberstein-aan-ahs-migraine-prevention-2012`: episodic-only scope preserved
- `mulleners-conquer-galcanezumab-2020`: PMID **32949542** resolved via PubMed MCP (architect Condition 3 satisfied)

All 19 new citations carry `last_reviewed: 2026-05-25` and appropriate `review_window_months` (12 for guidelines, 36 for trials).

## Editorial / expert context

Not applicable — no new trial-detail pages in this PR. Citations added as evidence anchors only. Does not trigger mandatory-block #8.

## Freshness

All 19 new citations within window. Existing citations retained as secondary references; no quoted_text touched, no §13.6 refresh triggered.

## Rationale

Attribution-shift PR. Continuum reviews demoted to secondary; primary trials surfaced as first citations per V direction. PREEMPT-1 and AAN-AHS-2012 caveats handled correctly. Mulleners CONQUER PMID resolved. The only soft spot is Cohen Brain 2006 abstract-level verbatim (MEDIUM confidence per evidence packet); the claim framing does not over-extend.

## Required follow-ups

1. **(Non-blocking)** Cohen SUNCT/SUNA Brain 2006 full-text verbatim verification at next §13.6 refresh. Replace abstract-level quoted_text with treatment-conclusion passage when full-text access available. Claim framing currently does not exceed what the abstract supports.

## Conditions resolved inline before commit

- ✅ Architect Condition 1: ordering-convention header comment added to claims.ts
- ✅ Architect Condition 3: Mulleners CONQUER PMID resolved (32949542)
- ✅ Architect Condition 4: clinical-reviewer §17.2 gate run (this artifact)
- ✅ Architect Condition 5: PREEMPT-1 and AAN-AHS-2012 caveats preserved
- ✅ Architect Condition 6: MISSING_TRIALS.md appended with all 19 entries
