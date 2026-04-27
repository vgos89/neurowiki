# Clinical review — W6.6.3 Batch 5D

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-27

## Scope

- **Claims touched:** `destiny-ii-interpret`, `destiny-ii-pearl`, `timing-interpret`, `timing-pearl`, `optimas-interpret`, `optimas-pearl`
- **Citations affected:**
  - Jüttler et al., NEJM 2014 (doi: 10.1056/NEJMoa1400249) — DESTINY II
  - Oldgren et al., Circulation 2022 (NCT02961348) — TIMING
  - Werring et al., Lancet 2024 (NCT03759938) — OPTIMAS
- **Surfaces changed (per §13.3):** Structured data fields in `src/data/trialData.ts` (`howToInterpret.proves` / `.doesNotProve` / `.cautions`, `bedsidePearl`, `bottomLineSummary`, `pearls`, `howToReadChart`, `keyMessage`, `clinicalContext`, stats blocks); JSX surfaces in `src/pages/trials/TrialPageNew.tsx` (amber QoL/NI banners, DeltaBandChart props, BottomLineDrawer text).

## Semantic validity

### DESTINY II — Modification 1 compliance

1. **proves field** — PASS. Primary endpoint (38% vs 18%, OR 2.91, 95% CI 1.06–7.49, P=0.04) and the "0% of patients in either group achieved mRS 0-2 (functional independence)" finding appear in the same paragraph. The 0% finding is not buried; it is anchored mid-paragraph and reinforced by the "virtually all surgical survivors had mRS 4" sentence. ✓
2. **doesNotProve field** — PASS. Explicit text: "DESTINY II does not prove that hemicraniectomy preserves functional independence or quality of life in patients aged 60 or older." Both functional independence AND quality of life are named. ✓
3. **bedsidePearl field** — PASS. Family-counseling-grade phrasing with the 0% finding given as a direct quote a clinician would say to a family: "0% of patients who had surgery regained the ability to care for themselves." Not a footnote; it is the core message. ✓
4. **JSX amber banner** — PASS. Banner is positioned ABOVE the DeltaBandChart. Contains the exact phrase "0% of patients in either group achieved mRS 0-2 (independent function)" and the framing "Surgery reduces the chance of dying from 70% to 33% — it does not restore function." Visible before the chart. ✓
5. **trialResult: 'POSITIVE'** — PASS. ✓
6. **winnerArm: "treatment"** — PASS. Surgery wins on the primary endpoint; this is correct. ✓

### TIMING — NI framing

7. **proves NI language** — PASS. Uses "early NOAC initiation within 4 days was non-inferior to delayed initiation (5-10 days)." No "as effective as" / "equivalent" / "no different from" anywhere in the field. ✓
8. **doesNotProve superiority statement** — PASS. Verbatim: "TIMING does not establish superiority of early over delayed NOAC initiation." ✓
9. **JSX amber NI banner** — PASS. Banner present above DeltaBandChart. Explicit "no worse than" framing. Zero sICH finding included. ✓

### OPTIMAS — NI framing

10. **proves NI language** — PASS. Uses "early DOAC initiation within 4 days was non-inferior to delayed initiation (7-14 days)." No prohibited language. ✓
11. **doesNotProve superiority statement** — PASS. Verbatim: "OPTIMAS does not establish superiority of early over delayed DOAC initiation." ✓
12. **JSX amber NI banner** — PASS. Banner present above DeltaBandChart. Explicit "no worse than" language and superiority caveat: "superiority was not demonstrated." ✓

### Em-dash audit

All five in-scope fields (proves / doesNotProve / cautions / bedsidePearl / bottomLineSummary) for all three trials use `--` (double-hyphen) where a separator is needed. No U+2014 em-dashes found in any in-scope field. JSX UI chrome em-dashes in section labels ("Primary Outcome — Survival Without Severe Disability", "from 70% to 33% — it does not restore function") are out of scope per §15.3. ✓

## Citation accuracy

- **DESTINY II (Jüttler NEJM 2014, doi: 10.1056/NEJMoa1400249):** N=112 ✓; planned 188 ✓; stopped early for enrollment difficulty (not safety/futility) ✓; age 61–82 ✓; primary endpoint mRS 0–4 at 6 months ✓; 38% vs 18% ✓; OR 2.91 (95% CI 1.06–7.49) ✓; P=0.04 ✓; mortality 33% vs 70% ✓; 0% mRS 0–2 in either arm ✓.
- **TIMING (Oldgren Circulation 2022, NCT02961348):** N=888 ✓; registry-based open-label RCT (Swedish Stroke Register) ✓; early NOAC ≤4 days vs delayed 5–10 days ✓; AF-related stroke ✓; composite endpoint (recurrent stroke, sICH, death) at 90 days ✓; 6.89% vs 8.68% ✓; risk difference −1.79 pp ✓; P for NI = 0.004 ✓; zero sICH in either arm ✓.
- **OPTIMAS (Werring Lancet 2024, NCT03759938):** N=3621 mITT ✓; 100 UK hospitals ✓; 2019–2024 ✓; early DOAC ≤4 days vs delayed 7–14 days ✓; composite endpoint (recurrent stroke, sICH, systemic embolism) at 90 days ✓; 3.3% vs 3.3% ✓; RD 0.000 ✓; P for NI = 0.0003 ✓; gatekeeper design (NI then superiority) ✓; superiority not demonstrated with identical event rates ✓.

All numerics, populations, time windows, and design features match the published figures. No drift detected in any of the five never-drift categories (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints).

## Freshness

W5.2 deferral applies — `last_reviewed` is not yet populated for these claim IDs pending the claims registry build-out. All three trials are within 12 years of publication (2014–2024). No freshness concern requiring an out-of-cycle refresh. No block on freshness grounds.

## Rationale

All twelve enumerated block conditions pass. The DESTINY II content meets Modification 1 in spirit and letter: the 0% mRS 0-2 finding is co-located with the positive primary-endpoint result in the proves paragraph; the doesNotProve field explicitly names both functional independence and quality of life as unproven; the bedside pearl is family-counseling-grade with the 0% figure framed as direct counselor speech; and the JSX amber banner sits visibly above the DeltaBandChart with the 0% finding prominent. TIMING and OPTIMAS use precise non-inferiority language throughout — "non-inferior to," not "as effective as" or "equivalent" — and both doesNotProve fields explicitly disclaim superiority with unambiguous language. Citation numerics and design features match the published figures across all three trials. The em-dash rule is honored in all in-scope fields. This batch is approved for merge.

## Required follow-ups

- When W5.2 lands, populate `last_reviewed` for `destiny-ii-interpret`, `destiny-ii-pearl`, `timing-interpret`, `timing-pearl`, `optimas-interpret`, `optimas-pearl` and register their citations in `src/lib/citations/registry.ts`.
- Per §13.7: DESTINY II is a landmark trial (2014) — apply 36-month default review window. TIMING and OPTIMAS are current management-guidance trials — apply 6-month default window unless a per-citation `review_window_months` override is added with rationale.
