# Clinical review — W8.2.9 SAMMPRIS

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: SAMMPRIS trial entry in `src/data/trialData.ts`
- Citations affected: Chimowitz MI, et al. NEJM 2011;365(11):993–1003 (DOI 10.1056/NEJMoa1105335, PMID 21899409, NCT00576693); erratum NEJM 2012;367(1):93 (procedural bookkeeping only)
- Surfaces changed:
  - `doi`, `pmid` added
  - `intervention.treatment` — precise device names (Gateway PTA balloon + Wingspan self-expanding stent, Stryker Neurovascular)
  - `intervention.control` — full AMM specification (Aspirin 325 + Clopidogrel 75 × 90d; LDL <70; SBP <140 / <130 if DM; lifestyle)
  - `clinicalContext` — added "symptomatic 70–99% intracranial stenosis within 30 days of qualifying TIA or stroke" precision
  - `pearls` — REWRITTEN per packet §11 flag: replaced absolutist "Stenting is Dangerous" wording with hedged framing that names the specific population (symptomatic 70–99% within 30 days, off-label initial therapy); added sICH 4.5% vs 0% as dominant harm signal; added periprocedural-stroke timing (25/33 strokes within 24h of procedure); added 1-year drill-down (beyond 30d, same-territory stroke was 13 in each arm); added boundary conditions (does NOT generalize to asymptomatic ICAD, hemodynamic-failure selection, or salvage after AMM failure); added AHA/ASA 2021 COR 3 / COR 1 cross-reference; added erratum note
  - `source` — expanded with volume/issue/pages
  - `listDescription` — refined to specify Wingspan and symptomatic 70–99% ICAS
  - `harmSignal` — added timing detail (25/33 strokes within 24h) + sICH 4.5% vs 0%
  - `applicability.populationExclusions` — REWRITTEN per packet §11 to add device-specificity, VISSIT cross-confirmation, on-label salvage exclusion, AHA/ASA 2021 Class III citation
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-sammpris.md` (confidence HIGH; full PDF + 2012 erratum verified)
- Trial-statistician report: per packet — superiority RCT with binary primary; harm framing; NNH (not NNT) per `clinical-trial-audit` rules; existing display correctly shows harm framing without NNT

## Semantic validity

**Per packet §11, pearl wording flag (`pearls[0]`).** Prior pearl: "Stenting is Dangerous: The trial was halted early because the stenting group had significantly higher rates of periprocedural stroke." Packet flagged this as overly absolutist — the harm is specific to (a) Wingspan, (b) symptomatic 70–99% ICAS, (c) within 30 days of qualifying event, (d) off-label initial therapy. The same device in on-label salvage use (WEAVE registry) showed acceptable safety (2.6% 72h stroke/death).

New pearl[0]: "Periprocedural harm signal: Stenting in this population (symptomatic ICAS 70–99% within 30 days of TIA/stroke, off-label Wingspan use as initial therapy) carries a high periprocedural stroke risk. The trial was halted early by the DSMB for safety + futility." This hedges per the packet recommendation while preserving the harm framing.

**Mechanism precision.** Per packet §7: of 33 strokes in PTAS within 30 days, **25 occurred within 1 day** of the procedure. This is a key clinical detail that the prior pearls didn't surface; now in new pearl[1].

**sICH 4.5% vs 0%.** Per packet §11 flag, the dominant procedural harm. Prior pearls did not name this. Added as new pearl[1].

**Boundary-condition pearl.** Per packet §11 recommendation, added explicit "does NOT establish that all intracranial stenting is harmful" pearl with the four boundary conditions. This is the standard `doesNotProve` framing for a harm-framed trial.

**Erratum disclosure.** Per packet §3: the 2012 erratum is procedural-bookkeeping only (5 angioplasty-alone vs prior 4, 16 unstented vs prior 15). No primary or safety statistic changed. Disclosed in new pearl[6] to head off any user concern that erratum altered the trial's conclusions.

**1-year drill-down.** Per packet §7: beyond 30 days, same-territory ischemic stroke was **13 in each arm** — the entire between-arm difference is driven by periprocedural (early) events. This is a key teaching point and now in pearl[3].

**AMM specification.** Prior intervention.control field was incomplete ("DAPT for 90 days, Rosuvastatin 20mg, BP < 140/90"). Per packet §4: aspirin 325 mg/d + clopidogrel 75 mg/d × 90d; LDL target <70 mg/dL; SBP <140 mmHg (<130 if diabetes); lifestyle modification (INTERVENT). Now complete.

**Population precision.** Per packet §2: 62–65% of patients were on antithrombotics at qualifying event (on-treatment failures). Added to pearl[7].

All five never-drift categories: PASS post-edit.

## Citation accuracy

- DOI 10.1056/NEJMoa1105335 added; resolves to full text per packet.
- PMID 21899409 added.
- NCT00576693 verified.
- Source string expanded to include volume/issue/pages per packet.
- Erratum reference (NEJM 2012;367(1):93) now in pearl.

## Freshness

- SAMMPRIS (NEJM 2011): 36-month window per §13.7 (landmark trial; stable harm signal). `last_reviewed: 2026-05-14` upon W5.2.

## AHA / AAN guideline cross-reference

SAMMPRIS is **NOT in the 2026 Acute Ischemic Stroke Guideline** (that guideline covers early management; SAMMPRIS addresses secondary prevention for symptomatic ICAS). The governing reference is:

- **2021 AHA/ASA Guideline for Prevention of Stroke in Patients With Stroke and TIA** (Kleindorfer DO et al., Stroke 2021;52:e364–e467; DOI 10.1161/STR.0000000000000375; PMID 34024117):
  - **Class III: No Benefit / Harm, LOE B-R** for Wingspan stent system as initial treatment in symptomatic 70–99% intracranial stenosis, even for on-antithrombotic patients at time of index event
  - **Class I** for aggressive medical therapy (DAPT 90d + high-intensity statin + SBP <140/90 + lifestyle)
- **AAN 2022 Practice Advisory** (Turan TN et al., Neurology 2022;98(12):486–498): same conclusion

Subsequent confirmatory evidence: VISSIT (Zaidat 2015 JAMA — balloon-expandable stent, same harm direction), CASSISS (Gao 2022 JAMA — Chinese RCT, no significant benefit at 1 year).

Pearls now cross-reference 2021 AHA/ASA COR 3 / COR 1 framing.

## Rationale

The trial entry was substantively correct in the primary direction (harm-stopped) and statistics (14.7% vs 5.8%, P=0.002). The packet flagged five specific clinical-reviewer-grade concerns: (1) absolutist pearl wording, (2) missing sICH harm signal, (3) missing periprocedural timing, (4) missing boundary conditions, (5) missing erratum disclosure. All five now addressed. No statistics, p-values, NNH, or recommendation strength changed.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `chimowitz-2011-sammpris` with DOI `10.1056/NEJMoa1105335`, PMID `21899409`, NCT `NCT00576693`, `quoted_text` from packet §5 primary endpoint, `last_reviewed: 2026-05-14`, `review_window_months: 36`.
  - Register the 2012 erratum as a related metadata note (no separate citation ID; tie to chimowitz-2011-sammpris).
- Consider adding VISSIT trial entry (Zaidat 2015 JAMA, NCT01717287) as a confirmation of the SAMMPRIS harm signal with a different device. Class C-clinical; not blocking.
- WEAVE entry already correctly framed as Archetype G (registry) per packet §10 cross-ref; no change needed in this commit.
