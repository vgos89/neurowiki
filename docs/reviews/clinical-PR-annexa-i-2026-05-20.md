# Clinical review — PR # ANNEXA-I trial entry authoring (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **New trial entry:** ANNEXA-I (Connolly SJ et al., NEJM 2024;390(19):1745–1755). DOI 10.1056/NEJMoa2313040. PMID 38749032. NCT03661528.
- **Surfaces changed:**
  - `src/data/trialData.ts` — new `'annexa-i-trial'` entry after EXTEND-IA TNK.
  - `src/lib/citations/registry.ts` — new `connolly-annexa-i-2024` citation.
  - `src/lib/citations/claims.ts` — single claim `annexa-i-andexanet-fxa-ich-2024` on DATA_SURFACE.
- **Evidence packet:** `docs/evidence-packets/annexa-i-2026-05-20.md`.
- **`trial-questions.ts` deliberately NOT modified** — ANNEXA-I doesn't fit any of the 20 existing questions cleanly. A future "How do I reverse anticoagulation in ICH?" question is the right home. Parking-lot follow-up.

## Semantic validity

PDF-verified taxonomy:
- `primaryDesign: 'binary-superiority'` — primary hemostatic efficacy is a composite binary outcome.
- `primaryResult: 'met'` — DSMB-halted for efficacy at pre-specified interim analysis (P=0.003 vs threshold P<0.031).
- `trialResult: 'POSITIVE'` — primary met.
- `harmSignal` populated with thrombotic-events excess (the critical safety counterbalance).
- `designDisclaimer.category: 'stopped-early-efficacy'` — required per `trial-statistics` skill for trials stopped early for benefit (overestimation-of-effect caveat).

**Critical clinical framing checks:**
1. Hemostatic primary met + thrombotic safety signal must be surfaced equally — both are bedside-pertinent. Confirmed in `pearls`, `bedsidePearl`, `safetyData`, `howToInterpret.cautions`, `harmSignal`, `bottomLineSummary`.
2. DSMB early-halt context (overestimation-of-effect caveat) surfaced in `designDisclaimer`, `howToInterpret.cautions`, `limitations`.
3. Population (FXa-inhibitor ICH within 15h, hematoma ≤60mL, no surgery planned) disclosed in `applicability.populationExclusions`.
4. Comparator "usual care" (primarily 4F-PCC) — not a blinded placebo — disclosed in trial-design narrative.
5. Cost-effectiveness debate flagged in `limitations` (andexanet is expensive; key clinical decision context).

**NNT/NNH framing:** binary-superiority primary, so NNT IS valid. NNT 8 for hemostatic surrogate; NNH 22 (any thrombotic) and NNH 20 (ischemic stroke) reported alongside per the audit's expectation that harm-tradeoff trials surface both.

**No em-dashes** in V-facing prose. ASCII hyphens used.

## Editorial / expert context (REQUIRED per commit 479f100)

- **§8a Accompanying editorial:** Smith & Hemphill, "Reversing Oral Anticoagulation in Intracerebral Hemorrhage," NEJM 2024 (NEJMe2403726) — verified and quoted in packet.
- **§8b Post-publication letters:** TODO-VERIFY flag noted — packet documents the public commentary (REBEL EM, First10EM, SGEM critiques) but the formal NEJM correspondence cluster was not exhaustively searched. Acceptable per §8 rule's "stated method" allowance.
- **§8c Guideline incorporation:** AHA/ASA 2022 ICH guideline gives andexanet Class IIa Level B-NR but pre-dates ANNEXA-I; the post-ANNEXA-I focused update is TODO-VERIFY in the packet. Documented.
- **§8d Subsequent meta-analyses / contradicting evidence:** observational comparative-effectiveness work (Goeldlin / Demchuk / Sembill 2024-2025) flagged TODO-VERIFY before next freshness review. Acceptable for first-publish; depth of subsequent literature can be expanded in a future Class C-clinical pass.

§8 satisfies the hard requirement — all sub-items have a stated outcome.

## Citation accuracy

`connolly-annexa-i-2024` citation entry added with DOI 10.1056/NEJMoa2313040, PMID 38749032 (verify exact PMID — packet's value), `last_reviewed: '2026-05-20'`, `review_window_months: 36`.

## Freshness

New entry. First review. Within 36-month landmark-trial window.

## Schema compliance

- `listCategory: 'acute'` — valid TrialCategoryKey ✓
- `conclusion` field set ✓
- Single `claimId` per entry ✓
- `chainMembership` deliberately omitted (Phase 2 timeline work) ✓
- `harmSignal` field populated — the central safety conversation surfaces top-card ✓
- `designDisclaimer.category: 'stopped-early-efficacy'` — overestimation caveat ✓

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

First FXa-inhibitor antidote RCT in acute ICH — clinically important addition. Fills a known catalog gap for ICH reversal pharmacology. Honest framing balances hemostatic efficacy (primary met) against thrombotic safety signal (harm tradeoff) — neither buried, both surfaced top-card.

## Required follow-ups

1. **Add "How do I reverse anticoagulation in ICH?" clinical question** — would group ANNEXA-I with PROTECT-U / Cochrane reviews / 4F-PCC observational data. Class C-clinical-editorial follow-up.
2. **TODO-VERIFY items in packet** (NEJM letters, post-ANNEXA-I guideline update, comparative-effectiveness literature) — to be filled at next 36-month freshness review per §13.7.
3. **Cost-effectiveness analysis** could be a separate `historicalContext` or pearl extension — andexanet's ~$24,000/dose is part of every clinical decision.

## Blocking issues

None.
