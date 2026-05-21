# Clinical review — PR # ICH anticoagulation/antiplatelet reversal batch (2026-05-21)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-21

## Scope

Three new trial entries authored from PMC-accessible full text, all wired into the existing `ich-anticoagulation-reversal` clinical question (which previously held only ANNEXA-I):

- **PATCH** (Baharoglu et al., Lancet 2016, PMID 27178479) — platelet transfusion vs standard care in antiplatelet-associated ICH. Ordinal-shift design, common OR 2.05 (P=0.0114) toward death or dependence. **HARM** boundary — platelet transfusion contraindicated in antiplatelet-ICH per AHA/ASA 2022 Class III: Harm.
- **ANNEXA-4** (Connolly et al., NEJM 2019, PMID 30730782) — andexanet alfa single-arm registry in factor Xa-inhibitor-associated major bleeding (64% ICH). 92% median anti-FXa reduction, 82% excellent/good hemostasis at 12 h. Supports FDA accelerated approval.
- **Sarode 2013** (Sarode et al., Circulation 2013, PMID 23935011) — 4F-PCC vs plasma for urgent VKA reversal. Noninferiority established (+52.6 pp difference INR ≤1.3 at 30 min, P<0.0001). Underpins AHA/ASA 2022 Class I PCC preference over FFP.

## Claims touched

DATA_SURFACE additions in `src/lib/citations/claims.ts`:
- `trial:patch-2016:efficacy` → `baharoglu-patch-2016`, `aha-asa-ich-2022-reversal`
- `trial:annexa-4-2019:efficacy` → `connolly-annexa-4-2019`, `aha-asa-ich-2022-reversal`
- `trial:sarode-2013:efficacy` → `sarode-4fpcc-2013`, `aha-asa-ich-2022-reversal`

## Citations affected

New entries in `src/lib/citations/registry.ts`:
- `baharoglu-patch-2016` — Lancet 2016, last_reviewed 2026-05-21
- `connolly-annexa-4-2019` — NEJM 2019, last_reviewed 2026-05-21
- `sarode-4fpcc-2013` — Circulation 2013, last_reviewed 2026-05-21
- `aha-asa-ich-2022-reversal` — Greenberg et al., Stroke 2022 (shared guideline anchor for ICH reversal recommendations), last_reviewed 2026-05-21

## Surfaces changed

- `src/data/trialData.ts` — three new TRIAL_DATA entries appended
- `src/data/trialListData.ts` — three manualTrials registrations under listCategory `'acute'`
- `src/data/trial-questions.ts` — `ich-anticoagulation-reversal` question expanded 1→4 trials in chronological order (Sarode 2013 → PATCH 2016 → ANNEXA-4 2019 → ANNEXA-I 2024)

## Evidence-verifier packets

- `docs/evidence-packets/patch-2016-2026-05-21.md`
- `docs/evidence-packets/annexa-4-2019-2026-05-21.md`
- `docs/evidence-packets/sarode-2013-2026-05-21.md`

## Semantic validity

- **PATCH** — primaryDesign `ordinal-shift` correctly applied; NNT field deliberately absent per Option Y build-guard rule (ordinal-shift trials cannot expose NNT). Common OR 2.05 (1.18–3.56) reflects shift toward worse mRS, framed as HARM. Mortality 24% vs 17% reported as secondary, not promoted to primary. AHA/ASA 2022 Class III: Harm linkage correct.
- **ANNEXA-4** — single-arm-registry design correctly excludes comparative inference language. Surrogate endpoint (anti-FXa reduction) and adjudicated hemostasis at 12 h reported per protocol; no efficacy claim made beyond what FDA accelerated approval supports. Thrombotic event rate 10% and 30-day mortality 14% reported transparently.
- **Sarode 2013** — noninferiority correctly framed. Hemostatic efficacy was the co-primary; INR ≤1.3 at 30 min was the other co-primary. Both reported. Volume-overload signal in plasma arm (12.8% vs 4.9%) preserved as safety context.

No fabricated claims. All three entries grounded in PMC-accessible full text with abstract-level cross-check for the two whose Methods sections weren't fully fetched (flagged TODO-VERIFY in their evidence packets — non-blocking for catalog publication; refresh window 36 months for landmark trials per §13.7).

## Citation accuracy

- PMID/journal/year verified against PubMed for all three primary citations.
- Shared `aha-asa-ich-2022-reversal` guideline anchor correctly cites Greenberg et al., Stroke 2022 — the 2022 ICH guideline replacement that retired the 2015 ICH guideline.

## Freshness

All four citations carry `last_reviewed: 2026-05-21`. Landmark-trial window (36 months) and guideline window (6 months) both honored. AHA/ASA 2022 ICH guideline is the currently active version — no superseding publication.

## §8 editorial context

PATCH, ANNEXA-4, and Sarode 2013 all carry editorial-context sections per the §8 hard requirement (commit `479f100`). Each entry documents the design tradeoff, the guideline disposition, and the caveats:
- PATCH §8a: HARM boundary, applies only to antiplatelet-on-board ICH; does not generalize to anticoagulant ICH
- ANNEXA-4 §8a: single-arm design limits causal inference vs PCC; ANNEXA-I (2024) is the RCT successor
- Sarode 2013 §8a: noninferiority framing, INR-driven primary; subsequent INCH trial extended to clinical outcomes

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS (461 KB TrialPageNew chunk; 841 KB trialData)
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS (5 chains, 15 memberships)
- `npm run check:routes` → PASS (43 routes)

## Rationale

PMC-accessible authoring strategy was correct: three of the five ICH-reversal trials V is targeting were directly accessible (PATCH, ANNEXA-4, Sarode 2013), expanding the question from a one-trial stub to a four-trial chronological lineage that traces the field from VKA-era 4F-PCC noninferiority (2013), through the antiplatelet-ICH harm boundary (2016), through factor-Xa reversal registry (2019), to the modern andexanet-vs-PCC RCT (ANNEXA-I 2024 already in catalog). REVERSE-AD (dabigatran/idarucizumab) and INCH (4F-PCC clinical outcomes RCT) remain pending V-supplied PDFs.

No new clinical chain wired in this commit — the ICH-reversal lineage is a candidate for Phase 3 once REVERSE-AD and INCH land.

## Required follow-ups

1. **REVERSE-AD + INCH** — pending V's PDFs. Will close the ICH reversal question to its full historical lineage and unlock a `ich-reversal` trial chain.
2. **TODO-VERIFY items** in evidence packets — PATCH supplementary-table efficacy detail, ANNEXA-4 dose-stratification, Sarode 2013 subgroup INR strata. Non-blocking; refresh on next §13.6 cycle.
3. **link-graph.json staleness** still flagged — 73 trials missing; deferred.

## Blocking issues

None.
