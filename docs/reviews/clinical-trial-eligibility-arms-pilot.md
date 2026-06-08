# Clinical review — trial-full-eligibility-and-arm-detail-pilot

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-08

## Scope
- Claims touched: none registered in `CLAIM_REGISTRY` — `fullEligibility` + `armDetails` are source-attributed trial-descriptive content on the §13.3/§13.4 Phase 1 "structured data in `src/data`" surface (provenance carried inline), consistent with the existing untagged `inclusionCriteria`/`exclusionCriteria`. Per ADR-2026-06-08 §4, the opt-in claims scanner is not tripped; semantic validity is enforced here, not by the hook (§13.1).
- Trials affected: `dawn-trial`, `defuse-3-trial`, `escape-trial`, `ecass3-trial`, `ninds-trial` (5 records in `src/data/trialData.ts`)
- Citations affected: registry/publication provenance inline on each `fullEligibility`/`armDetails` block (CT.gov NCT02142283, NCT02586415, NCT01778335, NCT00153036; NINDS publication DOI 10.1056/NEJM199512143332401). No `src/lib/citations/registry.ts` records changed.
- Surfaces changed: structured data in `src/data/` (§13.3) — `fullEligibility`, `armDetails`; one data-integrity field removal (`clinicalTrialsId` on NINDS).
- Evidence-verifier packet: `docs/evidence-packets/2026-06-08-trial-pilot-eligibility-arms.md`
- Trial-statistician report: not applicable to this PR (no stats/effect-size edits). One pre-existing ESCAPE `effectSize` discrepancy (repo "OR 2.6" vs published cOR 3.1) is flagged by the packet and routed to trial-statistician; out of scope here and confirmed unchanged by this PR.

## Semantic validity
Verbatim fidelity verified record-by-record against the packet (which is verbatim from CT.gov / publication with only formatting normalization):

- **DAWN** — General/Imaging inclusion + General/Imaging exclusion groups match the packet item-for-item, including the CIM Group A/B/C age+NIHSS+core definition, the Factor Xa 24–48 h normal-PTT clause, and the Trevo-stent imaging-exclusion. No dropped, added, or softened criterion. Arms: Trevo Retriever (Stryker) intervention / Standard-of-care control; route, single-procedure framing, "no other intra-arterial therapy" co-intervention, and Trevo-only generalizability note all faithful.
- **DEFUSE-3** — Clinical / Neuroimaging / Alternative-Neuroimaging inclusion (A/B/C technical-inadequacy branches) + Clinical / Neuroimaging exclusion match verbatim, including the tPA 3–4.5 h conditional-exclusion compound criterion (age >80 / anticoagulant / diabetes-or-prior-stroke / NIHSS >25) — a safety-relevant gate, transcribed intact. Arms: device list (Trevo / Solitaire FR / Penumbra / Covidien MindFrame, operator discretion) verbatim; IV-tPA-as-co-treatment constraint preserved.
- **ESCAPE** — Clinical (heterogeneous sampling frame) / Imaging (homogeneous target population) inclusion labels and items match; exclusion single-group items (including the three-way moderate/large-core CTA/CTP definition and the 60-min groin-puncture / 90-min recanalization constraints) match verbatim. Arms device-agnostic per source; IV-alteplase-within-4.5h-both-arms co-intervention preserved.
- **ECASS III** — Single-group inclusion/exclusion match verbatim, including the prior-stroke+diabetes combination exclusion and the registry's own internally-inconsistent window strings ("between 3 and 4 hours" in inclusion; ">4 hours and 30 minutes" in exclusion) — both preserved as-is, which is correct for a verbatim disclosure. Per-arm dose verified: alteplase 0.9 mg/kg (max 90 mg), 10% bolus then remainder over a 60-minute infusion; `note` quotes Hacke NEJM 2008 directly. No dose or route error.
- **NINDS** — Publication-narrative inclusion/exclusion (Medium confidence per packet) transcribed faithfully from the stated entry criteria. Per-arm dose verified: alteplase 0.9 mg/kg (max 90 mg), 10% bolus over 1 minute then remainder over a 60-minute infusion; 24-hour antithrombotic prohibition and strict BP control (<185/110) correctly attributed to this protocol. No dose or route error.

Never-drift categories (strength / action verbs / qualifiers-and-gates / certainty / temporal): no violation. Time windows (DAWN 6–24 h, DEFUSE-3 6–16 h, ESCAPE <12 h, ECASS III 3–4.5 h headline, NINDS ≤180 min), dose thresholds, organ-function and platelet/glucose gates, and population strata are all preserved exactly. The verifier's editorial parenthetical on the ECASS III window (italic "registry text; published protocol window is 3–4.5 h") was correctly NOT injected into the verbatim `items[]` string — keeping the "verbatim" field truly verbatim while the 3–4.5 h reconciliation lives in the curated summary, subtitle, and headline (all unchanged).

## Citation accuracy
- Provenance present and correct on all five blocks: `source`/`sourceUrl`/`sourceLabel`/`retrieved` (`2026-06-08` ×5, one per trial).
- Four registry trials marked `source: 'clinicaltrials.gov'` with correct study URLs matching their `clinicalTrialsId`. NINDS correctly marked `source: 'publication'` with DOI 10.1056/NEJM199512143332401 and PMID 7477192; no NCT, consistent with its pre-registry status.
- NCTs for DAWN/DEFUSE-3/ESCAPE/ECASS III independently verified in the packet's NCT-verification verdicts; no mismatch.

## NINDS NCT removal (data-integrity finding)
Confirmed `clinicalTrialsId: 'NCT00000292'` is removed from `ninds-trial`. The only remaining occurrence of that string is the explanatory removal comment; no live field deep-links it. A repo-wide grep for the string returns the comment only. The wrong linkage (which resolved to an unrelated NIDA cocaine-withdrawal registry record) is eliminated; the PubMed/DOI affordance is retained. Headline integrity finding of the pilot, correctly actioned.

## Scope integrity
Confirmed the additive-only contract held. Existing curated summary `inclusionCriteria`/`exclusionCriteria`, `stats`, `effectSize`, `intervention` one-liners, and interpretation text (`howToInterpret`, `bedsidePearl`, `bottomLineSummary`, pearls) were NOT altered by this PR. Spot-checks: ESCAPE `effectSize: 'OR 2.6'` unchanged — the published-vs-repo OR discrepancy is parked for trial-statistician and explicitly not touched here; ECASS III `effectSize: '7.2%'` and DEFUSE-3 `cOR 2.77` unchanged. New `fullEligibility`/`armDetails` are purely additive optional fields, backward-compatible per ADR-2026-06-08.

## Editorial / expert context (per §17.2 — REQUIRED)
This PR is an eligibility/arm pilot, **not** a new-trial entry, so mandatory-block #8 does not apply at new-trial depth; §8 of the packet is correctly at summary depth. Confirmed acceptable for this PR's scope. Per §8 sub-item, across the five trials:
- **§8a (accompanying editorial):** Filled for DAWN (Hacke NEJM 2018;378(1):81-83) and ECASS III (Lyden NEJM 2008;359(13):1393-1395). For DEFUSE-3, ESCAPE, and NINDS the verifier explicitly states the trial-specific editorial was **not retrievable on the search date** (DEFUSE-3: searched 2026-06-08 via PubMed comment-in / NEJM 378(8) TOC paywalled / web; ESCAPE: TOC paywalled, interpretation dominated by HERMES; NINDS: pre-2000 metadata sparse/paywalled). These are explicit "stated, not silently omitted" entries — acceptable filled sub-items, not silent omissions.
- **§8b (post-publication letters/replies):** Filled for all five (DAWN early-stoppage/coprimary-upgrade correspondence; DEFUSE-3 NEJMc1803856; ESCAPE workflow/collateral correspondence; ECASS III baseline-imbalance critique; NINDS Ingall *Stroke* 2004 reanalysis).
- **§8c (guideline incorporation):** Filled for all five with AHA/ASA section + COR/LOE (DAWN §4.7.2 COR 1 LOE A; DEFUSE-3 §4.7.2 COR 1 LOE B-R; ESCAPE COR 1 LOE A; ECASS III §4.6.3 COR 2a LOE B-R with a "confirm current class vs cited 2026 guideline" caveat; NINDS §4.6.1 COR 1 LOE A).
- **§8d (subsequent meta-analyses / contradicting evidence):** Filled for all five (AURORA Lancet 2022; HERMES Lancet 2016; SELECT2/ANGEL-ASPECT 2023 large-core extension noted against DEFUSE-3's <70 mL ceiling; Emberson Lancet 2014; Marler *Neurology* 2000 + pooled ATLANTIS/ECASS/NINDS Lancet 2004).

No §8 sub-item is **silently** incomplete. The two unretrievable editorials (DEFUSE-3, NINDS) — and the partially-isolated ESCAPE editorial — are each explicitly stated with search method/date.

## Freshness
- All five `fullEligibility`/`armDetails` blocks carry `retrieved: 2026-06-08` (today). Within window.
- No `last_reviewed` field on these structured blocks (provenance is `retrieved`-based, not a citation-registry `last_reviewed` refresh); §13.6 dual-sign-off checklist is not triggered by this PR because no `src/lib/citations/registry.ts` `last_reviewed` date was advanced.
- Re-review notes for future passes: (1) ECASS III §8c COR 2a should be re-confirmed against the currently-cited 2026 AHA/ASA guideline (packet flags this). (2) NINDS eligibility is publication-narrative at **Medium** confidence — the packet asks for per-item confirmation against NEJM 1995 full text; the transcription is faithful to the packet's stated criteria and to the canonical Fugate & Rabinstein *Stroke* 2014 catalogue, so it is acceptable to ship, but it should carry a standing note for full-text confirmation at next review and is the one block to re-verify first.

## Rationale
Five landmark trials gained verbatim eligibility disclosure plus structured per-arm protocol, transcribed from a verified evidence-verifier packet. Every inclusion/exclusion item, group label, dose, route, frequency, duration, co-intervention, and provenance field checks out against the packet without drift, fabrication, dropped safety-relevant criterion, or dose/route error; the additive-only contract held (no summary, stats, effect-size, or interpretation text altered, ESCAPE OR 2.6 included); the wrong NINDS NCT is cleanly removed with no residual deep-link; and §8 expert context is present at appropriate (summary) depth with all unretrievable items explicitly stated rather than silently dropped. No mandatory-block condition is met. Approve.

## Required follow-ups
- Route the parked ESCAPE primary-OR discrepancy (repo `effectSize: 'OR 2.6'` vs published common OR 3.1, packet §3 / HERMES) to `trial-statistician`. Out of scope for this PR; the value was correctly left unchanged here.
- Confirm ECASS III §8c recommendation class (COR 2a LOE B-R) against the currently-cited 2026 AHA/ASA guideline version at next clinical pass.
- At next review of NINDS, confirm each publication-narrative eligibility item against NEJM 1995 full text (Medium-confidence, publication-sourced per packet); re-verify this block first among the five.
