# Clinical review — Headache ICHD-3 rebuild (pre-execution Class D-clinical, no PR # yet)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-27

## Scope
- Claims touched (new): `clinic-headache-ichd3-chronic-migraine-criteria`, `clinic-headache-chronic-migraine-acute`, `clinic-headache-chronic-migraine-preventive`, `clinic-headache-ichd3-paroxysmal-criteria`, `clinic-headache-ph-indomethacin-protocol`, `clinic-headache-ichd3-sunct-criteria`, `clinic-headache-sunct-lamotrigine`
- Claims touched (modified): `clinic-headache-ichd3-ndph-criteria` (section label §3.3 → §4.10), `clinic-headache-ichd3-tension-criteria` (D-criterion logic + chip-split), and the existing vestibular-migraine section label (§A1.6.5 → §A1.6.6)
- Citations affected: `ichd3-2018` (quoted_text expansion — §1.3, §3.2, §3.3 SUNCT/SUNA, §4.10 verbatim added), `goadsby-2024-continuum-indomethacin` (already covers PH protocol verbatim), `burish-2024-continuum-cluster` (already covers SUNCT/SUNA lamotrigine verbatim), `lipton-2024-continuum-preventive` (covers chronic-migraine botox), `ailani-ahs-2021` (covers CGRP mAb first-line)
- Surfaces changed: structured data in `src/data/clinicHeadacheData.ts`; JSX `data-claim` on the result drawer
- Evidence-verifier packet: not applicable
- Trial-statistician report: not applicable

## Semantic validity

Walked each new/modified phenotype against verbatim ICHD-3 text. All pass paraphrase standard + never-drift categories.

### §1.3 Chronic migraine — pass
Plan encodes A (≥15 days/month for >3 mo), B (≥5 prior 1.1/1.2 attacks), C (≥8 days/month migraine features OR triptan-responsive). Disjunction in C correctly covers ICHD-3 C.3 ("relieved by a triptan or ergot derivative"). Suppression of Chronic TTH on Chronic migraine full match matches §2.3 Note 1.

### §3.2 Paroxysmal hemicrania — pass
A (≥20 attacks), B (severe unilateral orbital 2–30 min), C (autonomic OR restlessness), D (>5/day), E (absolute indomethacin). `hiddenUntilTrial: { gateChip: 'indo-tried-complete' }` correctly gates surfacing.

### §3.3 SUNCT/SUNA — pass
A (≥20 attacks), B (moderate-severe trigeminal-distribution 1–600 sec), C (≥1 ipsilateral autonomic), D (≥1/day). SUNCT vs SUNA subtype deferred to v2.

### §2.3 Chronic TTH criterion D fix — pass
Verbatim §2.3 D: "Both of the following: 1) no more than one of photophobia, phonophobia or mild nausea; 2) neither moderate or severe nausea nor vomiting." Plan's chip split + evaluator `!has('sym-nausea-moderate-severe') && !has('sym-vomiting') && countOf(['sym-nausea-mild', 'sym-photophobia', 'sym-phonophobia']) <= 1` is verbatim-faithful. Most clinically important fix — likely root cause of V's misclassification.

### NDPH §3.3 → §4.10 relabel — pass
Section-number drift correction. ICHD-3 places NDPH at §4.10; §3.3 is SUNCT/SUNA. Criteria already match §4.10 B/C; only `ichd3Section` field flips.

### Vestibular migraine §A1.6.5 → §A1.6.6 relabel — pass
Section-number drift correction. §A1.6.5 is alternating hemiplegia of childhood. Bárány/Lempert 2012 criteria expansion deferred.

### Suppression rule narrowing — pass
1.3 / 3.4 / 4.10 correctly exempted from `dur-continuous` suppression — each is by definition continuous-pattern compatible.

### `hiddenUntilTrial` refactor — pass
`{ gateChip: ChipId }` refactor required for PH + HC coexistence.

## Citation accuracy

- `ichd3-2018`: requires quoted_text expansion (Condition 5). Section field updated from "1.1, 1.2, 2.2, 2.3, 3.1, 3.3, 3.4" to include 1.3, 3.2, 3.3 SUNCT, 4.10, A1.6.6.
- `goadsby-2024-continuum-indomethacin`: quoted_text already names "Hemicrania continua and paroxysmal hemicrania" — covers PH protocol with no change.
- `burish-2024-continuum-cluster`: quoted_text already names "SUNCT/SUNA: lamotrigine first-line" — covers SUNCT lamotrigine with no change.
- `lipton-2024-continuum-preventive`: covers chronic-migraine-only onabotulinumtoxinA with no change.
- `ailani-ahs-2021`: covers CGRP mAb first-line.

## Editorial / expert context
Not applicable — no new trial entry.

## Freshness
All cited citations within `review_window_months`. `ichd3-2018` will be touched (quoted_text expansion); full §13.6 six-step refresh required inline (Condition 6).

## Rationale

Plan is clinically faithful to verbatim ICHD-3. The §2.3 D fix is verbatim-correct and addresses the most likely cause of V's reported misclassification. Section-label corrections eliminate documented drift. Suppression-rule narrowing correctly distinguishes continuous-pattern phenotypes. No mandatory-block conditions triggered.

## Required follow-ups (Conditions — all blocking before merge, addressable inline)

1. **Chronic-migraine prevention citation scope:** keep `clinic-headache-chronic-migraine-preventive` surface text at the indication level (onabotulinumtoxinA + CGRP mAbs first-line). Do not surface PREEMPT-specific dosing protocol without adding a PREEMPT citation. Existing `lipton-2024-continuum-preventive` + `ailani-ahs-2021` cover at the indication level.

2. **SUNCT lamotrigine citation choice:** map `clinic-headache-sunct-lamotrigine` to `burish-2024-continuum-cluster` only (its quoted_text covers SUNCT/SUNA lamotrigine verbatim). Do NOT also map to `nahas-2024-continuum-cranial-neuralgias` unless its quoted_text is extended (fabrication risk).

3. **PH protocol surface scope:** `clinic-headache-ph-indomethacin-protocol` may surface 25 mg TID → 75–150 mg/day per Goadsby 2024; do not surface 225 mg ceiling without ICHD-3 §3.2 footnote citation (covered by `ichd3-2018` quoted_text expansion in Condition 5).

4. **NDPH claim-ID stability:** `clinic-headache-ichd3-ndph-criteria` claim ID stays. Confirm post-implementation that the scanner still passes after the phenotype.ichd3Section field flip §3.3 → §4.10.

5. **`ichd3-2018` quoted_text expansion:** replace §2.3 D paraphrase with verbatim. Replace the misplaced §3.3 (currently NDPH text) with verbatim §3.3 SUNCT/SUNA. Add verbatim §1.3, §3.2, §4.10. Update section field.

6. **§13.6 six-step inline attestation on `ichd3-2018`:** because coverage is materially expanded, the PR body must include an explicit §13.6 six-step checklist completion. Specifically Step 3 (dependent claims consistent) and Step 4 (no wording drift). Update `clinic-headache-ichd3-tension-criteria` description in `claims.ts` to reflect verbatim §2.3 D wording.

7. **Non-blocking observation:** confirm `sev-moderate` chip exists for §3.3 SUNCT/SUNA B trigger.

8. **Phase 2 (multi-diagnosis + selection-mapping):** separate commit. Fresh §17.2 review when proposed.
