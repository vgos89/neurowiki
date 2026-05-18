# Clinical review — Stroke Code Batch 5 (quick pearls)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: opus-4.7)
**Date:** 2026-05-19

## Scope
- Claims touched: tnk-class-i-quick, late-window-tnk-quick, large-core-evt-quick, posterior-circulation-evt-quick, post-evt-bp-avoid-intensive-quick, post-evt-bp-under-120-quick (6 new short-form pearls)
- Citations affected: anchors to Batch 3B-approved trial set (AcT, TRACE-III, TIMELESS, SELECT-2, ANGEL-ASPECT, TENSION, LASTE, ATTENTION, BAOCHE, OPTIMAL-BP, ENCHANTED2/MT); no new citations
- Surfaces changed: structured data in `src/data/strokeClinicalPearls.ts` (Phase 1 surface, §13.4) — `quick` arrays of step-1, step-2, step-5
- Evidence-verifier packet: `docs/evidence-packets/stroke-code-batch3b-2026-05-19.md` (inherited; no new evidence)
- Trial-statistician report: framing matrix from Batch 3B packet (inherited)

## Semantic validity
Confirmed — all six quick pearls mirror Batch 3B deep pearls without drift:
- **Class/Level fidelity**: TNK I/A; TRACE-III IIb/B (B-R); large-core EVT I/A with LASTE 2a/B-R surfaced; posterior I/A; OPTIMAL-BP III/A (harm); ENCHANTED2/MT III/B (harm direction). All match the approved Batch 3B set exactly.
- **Critical caveats preserved**: TRACE-III explicitly gated to "without EVT access"; TIMELESS explicitly labeled "no benefit when EVT is on the table" with "Route to EVT when available"; OPTIMAL-BP (<140) and ENCHANTED2/MT (<120) shown as distinct thresholds, not conflated; combined framing in `post-evt-bp-under-120-quick` accurately characterizes the class effect without flattening the threshold distinction.
- **Numeric claims**: NNH ≈ 7 (OPTIMAL-BP), mRS 0–2 39% vs 54% (OPTIMAL-BP), OR 2.07 (1.47–2.93) (ENCHANTED2/MT), ~1 in 11 (TRACE-III ARD 8.8%), mortality ~55% → ~37% (ATTENTION/BAOCHE) — all match evidence packet.
- **Statistical framing**: NNH only on OPTIMAL-BP binary superiority; "~1 in 11" only on TRACE-III binary superiority; no NNT on ordinal-shift trials (ENCHANTED2/MT, LASTE, SELECT-2, ANGEL-ASPECT, TENSION) — per trial-statistics skill.
- **No fabrication**: no new thresholds, no new trial numbers, no Class/Level beyond what Batch 3B approved.

## Citation accuracy
All trial year/journal references inherited from Batch 3B-verified set (AcT 2022, TRACE-III 2024, TIMELESS 2024, SELECT-2/ANGEL-ASPECT/TENSION 2023, LASTE 2024, ATTENTION/BAOCHE 2022, OPTIMAL-BP JAMA 2023, ENCHANTED2/MT Lancet 2022). AHA/ASA 2026 section references (§4.6.2, §4.6.3, §4.7.2, §4.7.3, §4.3) match Batch 3B deep pearls.

## Freshness
Inherited from Batch 3B — all anchor citations within the landmark-trials (36 mo) and current-guidelines (6 mo) windows per §13.7. No new freshness obligation introduced.

## Rationale
Each of the six new quick pearls is a faithful compression of an already-approved Batch 3B deep pearl. No never-drift category (recommendation strength, action verb, qualifier/gate, certainty, temporal constraint) is violated. The TRACE-III "no EVT access" qualifier is preserved in both `content` and title; the TIMELESS negative result is surfaced inline; OPTIMAL-BP and ENCHANTED2/MT are kept as distinct thresholds with explicit harm direction; large-core EVT correctly stages I/A (ASPECTS 3–5) vs IIa/B-R (ASPECTS 0–2). Voice is verb-forward and clinician-to-clinician with no AI fingerprints. No new claims, no mandatory-block conditions present.

## Required follow-ups
- W5.2 (citation-registry backfill, inherited from Batch 3B): register the 6 new quick pearl IDs in `CLAIM_REGISTRY` alongside the Batch 3B deep pearl IDs.
- No content changes required before merge.
