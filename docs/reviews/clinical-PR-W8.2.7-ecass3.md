# Clinical review — W8.2.7 ECASS III

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: ECASS III trial entry in `src/data/trialData.ts` (subtitle dash + PMID add)
- Citations affected: Hacke W, et al. NEJM 2008;359(13):1317–1329 (PMID 18815396, DOI 10.1056/NEJMoa0804656)
- Surfaces changed: structured data in `src/data/trialData.ts:'ecass3-trial'` only
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-ecass3.md` (verification confidence HIGH)
- Trial-statistician report: not applicable (statistics unchanged)

## Semantic validity

The ECASS III entry was already clinically accurate against the packet:
- `primaryDesign: 'binary-superiority'` matches frequentist superiority RCT with binary mRS 0–1 primary
- `primaryEndpoint.value: 'mRS 0-1'` at 90 days matches Methods p. 1321
- `efficacyResults` 52.4% vs 45.2% matches Results p. 1324 + Table 3
- `stats.pValue.value: '0.04'` matches ITT unadjusted chi-square (primary analysis)
- `stats.effectSize.value: '7.2%'` matches ARD 7.2 pp
- `calculations.nnt: 13.9` is mathematically correct (1 / 0.072 ≈ 13.9); paper rounds to 14
- Pearl 4 already reflects AHA/ASA 2026 §4.6.3 COR 2a stance on age >80 and warfarin users (individualized consideration)
- Pearl 5 sICH 2.4% vs 0.2% (P=0.008) matches Table 5 ECASS III definition

All five never-drift categories: PASS. No drift in recommendation strength, action verbs, qualifiers, certainty markers, or temporal constraints.

## Citation accuracy

- DOI 10.1056/NEJMoa0804656: resolves; full text verified against PDF.
- PMID 18815396 added — previously missing.
- NCT00153036: correct.
- Source string "Hacke et al. (NEJM 2008)" accurate.

## Freshness

- ECASS III (NEJM 2008): landmark trial; 36-month window per §13.7 (landmark trials, historical/foundational). Result stable; window extended to 4.5h is incorporated into AHA/ASA 2026 §4.6.3 (COR 2a, LOE B-R for ECASS III–eligible patients). PASS.

## AHA 2026 guideline cross-reference

Per 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke, "What is New and of High Impact" table:

- §4.6.3 Extended Time Windows for Intravenous Thrombolysis: **COR 2a.** "In patients with AIS who have salvageable ischemic penumbra detected on automated perfusion imaging and who (a) awake with stroke symptoms within 9 hours from the midpoint of sleep or (b) are 4.5–9 hours from last known well, IV thrombolysis may be reasonable to improve functional outcomes."
- §4.6.1 Thrombolysis Decision-Making: **COR 1.** "In adult patients with AIS who are eligible for IVT within 4.5 hours of symptom onset, treatment should be initiated as quickly as possible…"

ECASS III is the foundational trial for the 3–4.5h window. The 2026 guideline does **not** carve out age >80 or warfarin users as a separate COR; pearl 4's "individual risk assessment" wording is consistent with the 2026 guideline's omission of those exclusions and the 2019 update's permissive treatment of them.

## Rationale

Two minimal edits: (a) en-dash in subtitle "3–4.5 Hours" (typographic), (b) add PMID 18815396 (metadata completeness per `clinical-trial-audit` skill). No clinical text or statistics changed. The entry was substantively correct; this brings the metadata into compliance.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2), register the `ecass3-hacke-2008` citation with DOI `10.1056/NEJMoa0804656`, PMID `18815396`, `quoted_text` from Methods p. 1321 primary endpoint statement, and `review_window_months: 36` (landmark trial).
- Consider surfacing OR CI 1.02–1.76 in the stats block in a future schema enrichment task. Not blocking.
- NNT display value: paper rounds to 14; current display "NNT 14" in `legend.keyStat` matches paper. `calculations.nnt: 13.9` is internally consistent. No change required.
