# Clinical review — W8.2.8 ORIGINAL Trial

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: ORIGINAL trial entry in `src/data/trialData.ts`
- Citations affected: Meng X, et al. JAMA 2024;332(17):1437–1445 (DOI 10.1001/jama.2024.14721, NCT04915729, PMID TBD)
- Surfaces changed:
  - `applicability.populationExclusions` — added Chinese-cohort severity caveat, open-label PROBE design note, noninferiority NNT prohibition
  - `pearls[5]` extended; new pearl `[6]` added with AHA 2026 §4.6.2 verbatim COR 1 wording
  - `pearls[7]` (former [6]) — citation publication dates clarified (online Sept 12, 2024; print Nov 5, 2024)
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-original.md` (confidence HIGH; full PDF verified)
- Trial-statistician report: per packet — superiority NNT framework not applicable (NI design); noninferiority margin met (lower bound of 95% CI for RR > 0.937)

## Semantic validity

The ORIGINAL entry was previously correctly authored in this codebase per the packet's verified values (Meng X first author, JAMA 2024;332(17):1437–1445, DOI 10.1001/jama.2024.14721, NCT04915729). The brief that prompted W8.2.8 had originally cited incorrect citation metadata (`Wang` first author, DOI `10.1001/jama.2023.28097`, volume 331(6):500–509) — those errors are NOT in the repo; they were corrected before this commit.

Enrichments added in this pass:
- **Chinese-cohort severity caveat.** Per packet §2: median NIHSS 6 in ORIGINAL vs ~9–10 in AcT. ~41% of patients had NIHSS <6 (mild predominance). This affects generalizability of the noninferiority finding to higher-severity Western cohorts; clinicians using AHA/ASA 2026 COR 1 should understand the population context.
- **Open-label PROBE caveat.** ORIGINAL is not double-blind. Outcome assessment was blinded; treatment allocation was not. Disclosure added.
- **NNT prohibition.** Per `clinical-trial-audit` skill: noninferiority designs do not establish a superiority effect size; NNT is not appropriate. Repo already had `nnt: null` correctly; populationExclusions now state this explicitly to head off any downstream display attempt.
- **AHA 2026 §4.6.2 COR 1 verbatim wording.** Per High Impact table: "In adult patients with AIS presenting within 4.5 hours of symptom onset or last known well and eligible for IVT, tenecteplase at a dose of 0.25 mg/kg body weight (max 25 mg) or alteplase at a dose of 0.9 mg/kg body weight is recommended to improve functional clinical outcomes." This is the equivalent-alternatives framing that ORIGINAL backs.

All five never-drift categories: PASS post-edit. No clinical text changed (only context added).

## Citation accuracy

- DOI 10.1001/jama.2024.14721 verified per packet §1.
- Source string `Meng X et al. (JAMA 2024)` accurate.
- NCT04915729 verified.
- PMID not retrievable through current verification path (PubMed reCAPTCHA-gated; JAMA page 404'd; Google blocked). Flagged for next `/audit-citations` sweep.
- Volume/issue/pages corrected in pearl citation string.

## Freshness

- ORIGINAL (JAMA 2024): 6-month window per §13.7 (current major guideline-changing trial). `last_reviewed: 2026-05-14` upon W5.2.

## AHA 2026 guideline cross-reference

Per 2026 Guideline §4.6.2 Choice of Thrombolytic Agent (per "What is New and of High Impact" table):

> **COR 1.** "In adult patients with AIS presenting within 4.5 hours of symptom onset or last known well and eligible for IVT, tenecteplase at a dose of 0.25 mg/kg body weight (max 25 mg) or alteplase at a dose of 0.9 mg/kg body weight is recommended to improve functional clinical outcomes."

This is the equivalent-alternatives framing. Top Take-Home Message #3 reinforces: "the new guidelines endorse the use of either alteplase or tenecteplase in the 4.5-hour thrombolytic window." ORIGINAL, AcT, and NOR-TEST 2 together provide the multi-ethnic evidence base.

The Phase 1B fix in commit a17927f (earlier in this session) already addressed the "preferred for LVO" overclaim in `IvTpa.tsx`; ORIGINAL entry now matches that framing.

## Rationale

The ORIGINAL entry was substantively correct from a prior session (citation correction landed before W8.2.8 was opened). This pass adds the population-severity caveat, noninferiority NNT-prohibition disclaimer, and AHA 2026 §4.6.2 verbatim COR 1 wording for completeness. No NI margin, RR, or efficacy result changed.

## Required follow-ups

- Retrieve PMID for `10.1001/jama.2024.14721` on next `/audit-citations` sweep.
- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `meng-2024-original` with DOI `10.1001/jama.2024.14721`, NCT `NCT04915729`, `quoted_text` from packet §4 primary endpoint, `last_reviewed: 2026-05-14`, `review_window_months: 6`.
- Consider surfacing the 95% CI for RR (0.97–1.09) in a stats sub-block — currently in pearl prose only. Defer.
