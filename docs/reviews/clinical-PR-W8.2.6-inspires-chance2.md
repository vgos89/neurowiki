# Clinical review — W8.2.6 INSPIRES + CHANCE-2

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: INSPIRES + CHANCE-2 trial entries in `src/data/trialData.ts` (citation strings only — no clinical claims modified)
- Citations affected:
  - INSPIRES — Gao Y, et al. NEJM 2023;389(26):2413–2424 (DOI 10.1056/NEJMoa2309137, PMID 38157499)
  - CHANCE-2 — Wang Y, et al. NEJM 2021;385(27):2520–2530 (DOI 10.1056/NEJMoa2111749, PMID 34708996, NCT04078737)
- Surfaces changed:
  - `inspires-trial.source` (`Zhao J, et al. (NEJM 2024)` → `Gao Y, et al. (NEJM 2023)`)
  - `inspires-trial.pearls[9]` citation string updated (Zhao 2024;390(3):203–213 → Gao 2023;389(26):2413–2424)
  - `chance-2-trial.clinicalTrialsId` (NCT04078984 → NCT04078737)
  - `chance-2-trial.pearls[…]` citation string pages (2497–2505 → 2520–2530)
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-inspires-chance2.md` (confidence HIGH; both PDFs verified)
- Trial-statistician report: not applicable (NNTs 53 and 63 valid per packet)

## Semantic validity

**INSPIRES first-author misattribution.** The repo `source` and pearl citation string named "Zhao J" as first author. Per packet §1, the first author is **Gao Y** (Gao Y, Chen W, Pan Y, et al., for the INSPIRES Investigators). The DOI in the repo (10.1056/NEJMoa2309137) resolves to the correct paper, so the metadata hook did not flag this — but the user-facing surface displayed the wrong attribution. Corrected.

**INSPIRES year/volume/issue/pages.** Repo said NEJM 2024;390(3):203–213; packet verified 2023;389(26):2413–2424 (online Dec 28, 2023). The DOI string was correct in the repo; pearl text was misaligned. Corrected.

**CHANCE-2 ClinicalTrials.gov ID.** Repo carried NCT04078984; packet verified NCT04078737 directly from PDF abstract. This is a registry-identity error — anyone clicking through would have landed on a different (or non-existent) study. Corrected.

**CHANCE-2 pages.** Repo cited 385(27):2497–2505; packet verified 385(27):2520–2530. Corrected.

No clinical recommendations, dosing, mechanism descriptions, NNTs, p-values, or efficacy/safety numbers were touched. The substantive clinical content of both entries was already correct against the packet.

All five never-drift categories: PASS.

## Citation accuracy

- INSPIRES: DOI/PMID/NCT all match packet. Source string and pearl citation now reflect correct first author, year, volume, issue, and pages.
- CHANCE-2: DOI/PMID match packet. NCT and pages corrected.

## Freshness

- INSPIRES (NEJM 2023): 6-month re-review window per §13.7 (current major guideline-changing trial). `last_reviewed: 2026-05-14` upon registry-side checklist completion (W5.2).
- CHANCE-2 (NEJM 2021): 24-month window (stable; established). `last_reviewed: 2026-05-14` upon registry-side checklist completion (W5.2).

## AHA 2026 guideline cross-reference

Per 2026 Guideline §4.8 Antiplatelet Treatment (per "What is New and of High Impact" table):

> **COR 2a.** "In patients with minor (NIHSS ≤5) noncardioembolic AIS or high-risk TIA (ABCD² score ≥4) within 24 to 72 hours from stroke onset, or NIHSS score of 4 to 5 within 24 hours from onset, who did not receive IVT, with presumed atherosclerotic cause (≥50% stenosis of intracranial or extracranial arteries or acute new infarctions on imaging of presumed large artery atherosclerosis origin), DAPT (clopidogrel and aspirin) for 21 days followed by SAPT is reasonable to reduce the 90-day risk of recurrent stroke."

INSPIRES is the foundational trial behind this COR 2a recommendation. Repo's `clinicalContext` already correctly states "AHA/ASA 2026 incorporated INSPIRES to support COR 2a." No change required.

CHANCE-2 carries **COR 2b** per AHA/ASA 2026 secondary-prevention DAPT section for confirmed CYP2C19 LOF carriers within 24h. Repo's `stats.pValue.info` and `bedsidePearl` already correctly state COR 2b. No change required.

## Rationale

Four citation-metadata corrections across two trials. No clinical content drift; all corrections move the repo from displaying wrong author/year/pages/NCT to the verified values in the packet (both PDFs read at HIGH confidence). The metadata-completeness gate is satisfied; the previously-displayed wrong-author and wrong-NCT strings are now corrected on the public-facing trial pages.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `gao-2023-inspires` with DOI `10.1056/NEJMoa2309137`, PMID `38157499`, NCT `NCT03635749`, `quoted_text` from packet §4 primary endpoint, `last_reviewed: 2026-05-14`, `review_window_months: 6`.
  - Register `wang-2021-chance-2` with DOI `10.1056/NEJMoa2111749`, PMID `34708996`, NCT `NCT04078737`, `quoted_text` from packet §Trial 2 §4 primary endpoint, `last_reviewed: 2026-05-14`, `review_window_months: 24`.
- Bleeding HR 2.08 (INSPIRES moderate-to-severe; 95% CI 1.07–4.04) is already correctly surfaced in `harmSignal`. Hemorrhagic stroke HR 3.01 (95% CI 1.09–8.28) is currently NOT explicitly surfaced — defer surfacing to a future Class C-clinical task; not blocking.
- Verify INSPIRES print pagination (2023;389(26):2413–2424 per packet vs 2024;390(3):203–213 if a print reprint exists). Defer to next `/audit-citations` sweep.
