# Clinical review — PR # EXTEND-IA TNK trial entry authoring (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **New trial entry:** EXTEND-IA TNK (Campbell BCV et al., NEJM 2018;378(17):1573–1582). DOI 10.1056/NEJMoa1716405. PMID 29694815.
- **Surfaces changed:**
  - `src/data/trialData.ts` — new entry `'extend-ia-tnk-trial'`, inserted after RESCUE-Japan LIMIT in the recent-additions cluster.
  - `src/data/trial-questions.ts` — added to `tnk-vs-alteplase` (count 11→12, chronological 2018 placement) and `tpa-timing` (count 14→15).
  - `src/lib/citations/registry.ts` — new citation `campbell-extend-ia-tnk-2018`.
  - `src/lib/citations/claims.ts` — single claim `extend-ia-tnk-tnk-vs-alteplase-2018` on DATA_SURFACE.
- **Evidence packet:** `docs/evidence-packets/extend-ia-tnk-2026-05-20.md` (full PDF read by medical-scientist).

## Semantic validity

PDF-verified values per medical-scientist's authoring:
- N=202 randomized (TNK 101, alteplase 101) at 13 Australian/NZ sites
- ICA, M1, M2, or basilar artery occlusion; planned EVT within 6h
- TNK 0.25 mg/kg vs alteplase 0.9 mg/kg
- **Primary outcome (binary):** substantial reperfusion at initial angiography (>50% involved territory reperfused OR absence of retrievable thrombus)
- **Result:** TNK 22% vs alteplase 10%; absolute difference 12 pp
- Sequential statistical frame: noninferiority margin -2.3 pp established (P=0.002), then superiority established (P=0.03)
- mRS shift cOR 1.7, P=0.04 (secondary, favors TNK)
- mRS 0-2 at 90d: 64% TNK vs 51% alteplase, P=0.06 (secondary, numerical favor)
- sICH 1% both arms — no safety penalty
- Mortality 10% TNK vs 18% alteplase, aRR 0.5, P=0.049 — secondary mortality benefit

**Taxonomy:**
- `primaryDesign: 'binary-superiority'` — primary is a binary angiographic outcome; sequential NI-then-superiority frame both met, operatively a superiority result.
- `primaryResult: 'met'` — both NI and superiority thresholds crossed.
- `trialResult: 'POSITIVE'` — large effect size on primary, favorable secondary mRS, mortality benefit.

**Honest framing checks:**
- Angiographic primary endpoint surfaced prominently (not buried as if functional outcome were primary).
- TNK 0.25 mg/kg dose explicitly disclosed (distinguishes from NOR-TEST 2 Part A's harmful 0.4 mg/kg).
- LVO-EVT pathway context: this trial is about IVT agent choice BEFORE planned EVT, not about EVT-vs-no-EVT.
- No em-dashes in V-facing prose.

## Editorial / expert context (REQUIRED per commit 479f100)

- **§8a Accompanying editorial:** NEJM 2018 issue editorial documented (Campbell's group of trials around this time received editorial attention).
- **§8b Post-publication letters:** PubMed letters within 12 months addressed primarily by methodological commentary on the angiographic primary; documented in packet.
- **§8c Subsequent guideline incorporation:** AHA/ASA 2019 / 2024 / 2026 progressive guideline updates documented. TNK is now Class I via AcT, with EXTEND-IA TNK cited as the foundational LVO-pathway evidence.
- **§8d Subsequent meta-analyses / contradicting evidence:** broader TNK literature documented — EXTEND-IA TNK Part 2 (Campbell JAMA 2020, 0.40 vs 0.25 mg/kg head-to-head, no difference), NOR-TEST, NOR-TEST 2 Part A (harm at 0.4 mg/kg in moderate-severe stroke), AcT, TRACE-2, ATTEST-2, ORIGINAL, TASTE, IRIS/Majoie pooled.

§8 satisfies the hard requirement.

## Citation accuracy

`campbell-extend-ia-tnk-2018` citation entry added with DOI 10.1056/NEJMoa1716405, PMID 29694815, `last_reviewed: '2026-05-20'`, `review_window_months: 36`.

## Freshness

New entry. First review. Within 36-month landmark-trial window.

## Schema compliance

- `listCategory: 'thrombectomy'` — valid TrialCategoryKey ✓
- `conclusion` field set — required by TrialMetadata interface ✓
- Single `claimId` per entry — surface match verified ✓
- `chainMembership` deliberately omitted — Phase 2 timeline work ✓

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

Closes the EXTEND-IA TNK gap V flagged as Tier 2 priority #2. Slots into the TNK lineage (`tnk-vs-alteplase` question) as the chronologically-earliest TNK-vs-alteplase trial in the LVO-EVT pathway (2018, before AcT 2022 generalized the question to all eligible IVT candidates). Also slots into `tpa-timing` as a 2018 entry between WAKE-UP/PRISMS and EXTEND.

## Required follow-ups

1. **EXTEND-IA TNK Part 2** (Campbell JAMA 2020) — dose-comparison head-to-head (0.25 vs 0.40 mg/kg, no significant difference). Could be a separate entry or referenced as `historicalContext` on the current entry. Class C-clinical follow-up.
2. **Cross-link in NOR-TEST / AcT / TRACE-2 entries** could optionally cite EXTEND-IA TNK as the foundational LVO-pathway trial. Optional.

## Blocking issues

None.
