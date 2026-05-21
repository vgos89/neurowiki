# Clinical review — PR # DECIMAL + DESTINY primary-frame fill (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Trials touched:** DECIMAL (line 3881-onward) and DESTINY (line 3983-onward) in `src/data/trialData.ts`.
- **Fields added per entry:**
  - `primaryDesign: 'binary-superiority'`
  - `primaryResult: 'not-met'`
- **trialResult retained:** NEUTRAL on both (do NOT flip to POSITIVE per the audit's recommendation — the PDFs contradict the audit).
- **Evidence packets:** `docs/evidence-packets/decimal-2026-05-20.md` and `docs/evidence-packets/destiny-2026-05-20.md`.
- **No prose changes** to existing pearls / bedsidePearl / howToInterpret. The current entries' clinical framing is faithful to the PDFs.

## The audit-recommended POSITIVE flip is REJECTED

Audit artifact `docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md` Tier 1 #6 recommended:
> "DECIMAL / DESTINY trialResult mislabel. Both currently NEUTRAL; both showed major mortality reduction (the primary endpoint of these trials). Should be POSITIVE for the mortality endpoint."

V supplied both PDFs on 2026-05-20. **The audit's assertion that "mortality was the primary endpoint of these trials" is incorrect for both trials.** Verbatim quotes from the source PDFs:

**DESTINY (Jüttler 2007, Stroke 38:2518–2525, p.2519):**
> "DESTINY was based on a sequential design, taking mortality after 30 days as the first, **but not the primary**, efficacy end point."
>
> "patient enrollment would be interrupted until the 6-month functional outcome (**primary end point, dichotomized between mRS score 0 to 3 versus 4 to 6**) had been assessed."
>
> (Discussion p.2523) "the primary end point in DESTINY was not mortality but functional outcome according to the mRS after 6 months."

→ Primary = mRS 0-3 at 6 months. Result: surgery 47% vs medical 27%, **P=0.23**. NOT MET. Mortality was the first sequential boundary, P=0.02, MET — but it was a gatekeeper that triggered the next stage, not the protocol-defined primary efficacy endpoint.

**DECIMAL (Vahedi 2007, Stroke 38:2506–2517, p.2507):**
> "The primary end point was a 'favorable' functional outcome, defined by patient survival with an mRS score ≤3 at 6 months."

→ Primary = survival-conditional composite "survival with mRS ≤3 at 6 months." Result: surgery 25% vs medical 5.6%, **P=0.18**. NOT MET. Mortality alone (a secondary outcome) showed 52.8 percentage-point reduction, P<0.0001 — striking but not the primary frame.

Conclusion: both trials had protocol-defined functional primary endpoints. Both failed those primaries at their early-stopped sample sizes (n=38 and n=32 respectively). The Vahedi 2007 Lancet Neurology pooled analysis (DECIMAL + DESTINY + HAMLET, N=93) is the clinically-cited evidence underpinning the AHA/ASA Class IIa A recommendation — not the individual trials.

**Therefore `trialResult: 'NEUTRAL'` is the honest framing on both.** Flipping to POSITIVE would falsely promote a non-significant primary as positive. The mortality benefit is preserved in the entries' existing pearls / safetyData / howToInterpret prose with appropriate "secondary endpoint" labeling.

## Semantic validity

All numbers verified against the source PDFs. No new claims authored — this is a taxonomy-only fill of two pre-existing fields. The existing pearls, bedsidePearl, howToInterpret, and bottomLineSummary surfaces on both entries already cite the Vahedi 2007 pooled analysis as the clinical foundation and frame the individual trials honestly.

## Editorial / expert context (REQUIRED for Class E re-review per commit 479f100)

§8 packets exist for both trials covering all four sub-items:

- **§8a Accompanying editorial:** Documented as legitimately not applicable — no dedicated editorial accompanied either trial in the Stroke Sept 2007 issue per PubMed search. The de facto editorial-equivalent is the Vahedi 2007 Lancet Neurology pooled analysis (§8d).
- **§8b Letters and replies:** PubMed search for Stroke 2007–2008 letters citing DECIMAL/DESTINY returned no qualifying correspondence. Documented.
- **§8c Guideline incorporation:** AHA/ASA 2018 → Class IIa, Level of Evidence A for hemicraniectomy in patients ≤60y. DECIMAL and DESTINY are cited as foundational RCTs via the Vahedi 2007 pooled analysis. Recommendation maintained in the 2019 update.
- **§8d Subsequent meta-analyses / contradicting evidence:** Vahedi et al., Lancet Neurology 2007;6(3):215–222 (N=93 pooled IPD) is THE clinical evidence; DESTINY II (Jüttler NEJM 2014) extends to 61–82y and is already cataloged separately.

## Citation accuracy

No new citation entries added. Existing source attribution preserved.

## Freshness

Within the 36-month landmark-trial re-review window per §13.7. The pooled-analysis and subsequent guideline incorporation status was re-verified against the PDFs for this packet.

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

Resolves Tier 1 #6 from the overnight audit — the deferred DECIMAL/DESTINY primary-frame conflict. The PDFs settle the conflict in favor of the existing NeuroWiki framing (NEUTRAL primary, mortality as secondary). Taxonomy fields are now populated so downstream renderer rules can fire.

## Required follow-ups

1. **DECIMAL mortality P-value correction**: existing entry surfaces "P=0.001" for mortality; PDF says P<0.0001. Small editorial fix recommended in a separate prose-cleanup commit.
2. **Vahedi 2007 Lancet Neurology pooled analysis** is the trial that should arguably get its own entry — it's the clinical foundation, not the individual trials. Class C-clinical follow-up if catalog growth permits.
3. **DECIMAL primary-endpoint shorthand**: the current `stats.primaryEndpoint.value = "mRS ≤3"` is acceptable shorthand but technically the primary is a composite (survival + mRS ≤3). A future prose-clarification pass could surface this explicitly in `howToInterpret`.

## Blocking issues

None.
