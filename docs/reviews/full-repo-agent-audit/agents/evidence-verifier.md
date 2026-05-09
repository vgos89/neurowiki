# Evidence Verifier — Full-Repo Audit

**Reviewer:** evidence-verifier (claude-sonnet-4-6)  
**Date:** 2026-05-08  
**Scope:** Citation governance infrastructure + trial data integrity  
**Mode:** Read-only. No files modified. Inventory audit only — not a per-trial evidence packet.

## Overall Citation Integrity Rating: RED

The citation governance system described in CLAUDE.md §13.2–13.7 is **infrastructure-only**. The pre-commit hook cannot fire meaningfully because nothing is registered. Every clinical claim in the repo is currently ungoverned. The system is symmetrically empty — neither claim tags nor registry exist — which is consistent but means CLAUDE.md §13 is aspirational.

---

## Finding 1 — Registry Status: CRITICAL

**Severity:** P0 — blocks §13.5 enforcement entirely

- `src/lib/citations/schema.ts` (104 lines): types only. Well-designed with `quoted_text` (required), `last_reviewed`, optional `review_window_months`, and `definition` source type beyond CLAUDE.md §13.2 (rationale in ADR-002).
- `src/lib/citations/claims.ts` (8 lines): explicit stub — `CLAIM_REGISTRY = {}`. Header: "Populated in W5.2 with real clinical claims."
- `src/lib/citations/claim.ts` (31 lines): runtime helper that warns in dev when unregistered ID used. Returns text unchanged.
- `src/lib/citations/registry.ts`: **MISSING.** Schema references it but the file does not exist.

**Consequences:**
1. `claim()` helper would emit a console.warn for every invocation in dev — but it is invoked **0 times** in src/. No production code uses it.
2. `check-claims.ts` cannot validate against an empty registry. Check 3 (freshness) is skipped silently.
3. §13.5 hard gate is unenforced because there are no tagged claims to fail on.

**Recommended fix:** Create `registry.ts` with at minimum the citations referenced implicitly by current clinical content. Either ship W5.2 (populate CLAIM_REGISTRY) or amend CLAUDE.md §13 with a "Phase 0 — infrastructure pending" status block.

---

## Finding 2 — DOI Coverage: YELLOW (Medium)

| File | Trial entries | DOI coverage | Notes |
|---|---|---|---|
| `trialListData.ts` (manualTrials) | 51 | **100%** | All non-empty |
| `trialCatalogMeta.ts` (legacy) | 25 | **100%** | All non-empty |
| `trialData.ts` (TRIAL_DATA) | 89 | **~82%** | ~16 entries lack `doi` field |

**No empty DOIs, no `"pending"`/`"TODO"` placeholders found** in any file. DOI format spot-check (NEJM, JAMA, Lancet, Stroke formats) all plausible — none look fabricated.

**Recommended fix:** Identify the ~16 entries in `trialData.ts` missing `doi:` and backfill from `trialCatalogMeta.ts` or primary source. Track as Class C-clinical task.

---

## Finding 3 — PMID Coverage: RED (High)

Only **~10 trial entries** in `trialData.ts` have a `pmid` field (~11% of 89 entries).

PMIDs confirmed present: MR CLEAN (25517348), ESCAPE (25671798), REVASCAT (25882510), EXTEND-IA (25671797), SWIFT PRIME (25882376), CHANCE (23803136), THALES (32668111), INSPIRES (38157499), CHANCE-2 (34708996), ENRICH (38598795).

Neither `trialListData.ts` nor `trialCatalogMeta.ts` carry a `pmid` field at all.

**Why this matters:** PMIDs are stable (publisher reassignments, journal mergers don't affect them). The evidence-verifier verification workflow requires PMID as the durable anchor. DOIs alone are sufficient but PMIDs add verification redundancy for high-stakes clinical content.

**Recommended fix:** Backfill PMIDs via PubMed lookup as part of W5.2 registry construction. Mechanical and batchable.

---

## Finding 4 — Claim Mapping: CRITICAL

**Severity:** P0

- `data-claim` attribute count in src/: **0**
- `claim()` helper invocations in src/ (outside lib/citations): **0**
- Inline `/* claimId: ... */` comments in `trialData.ts`: present but point nowhere
- Markdown `<!-- @claim:` markers: absent (Phase 2 — expected)

**Net result:** The entire claim-tagging system is unused. No clinical statement on any surface is mapped to a citation. CLAUDE.md §13.1 ("metadata validity ≠ medical validity") is irrelevant in practice because there is no metadata at all.

**Note (strength):** The system isn't lying about coverage — it's symmetrically empty. That's the best possible state given §13.1's warning about false-sense-of-coverage. The risk is this state persisting while clinical content accumulates.

**Recommended fix:**
1. Do not retroactively add tags without first populating the registry.
2. Sequence: ship `registry.ts` → populate `claims.ts` → add scanner (W5.3) → backfill tags surface-by-surface.
3. Until then, every Class E and -clinical PR must rely on `medical-scientist` + `clinical-reviewer` semantic review.

---

## Finding 5 — Stale Citation Risk: YELLOW (Medium, currently latent)

Per §13.7 freshness matrix, highest staleness risk once registry ships:

| Content type | Default window | Files at risk |
|---|---|---|
| Rapidly evolving (thrombectomy indications) | **3 months** | 8+ EVT trial entries (DAWN, DEFUSE-3, SELECT-2, ANGEL-ASPECT, LASTE, TENSION, ESCAPE-MeVO, DISTAL) |
| Current clinical guidelines | **6 months** | All guide pages referencing AHA/ASA |
| Treatment recommendations | **6 months** | Stroke pathway pages, BP target interpretation |
| Drug dosing | **6 months** | Calculator interpretations referencing tPA dose, tenecteplase |
| Calculator formulas | **24 months** | NIHSS, GCS, ASPECTS — low risk |
| Landmark trials | **36 months** | NINDS, ECASS III, MR CLEAN — low risk |

**Recommended fix:** When W5.2 ships, prioritize EVT and thrombolysis citation entries first. Add `review_window_months: 36` overrides on landmark trials to reduce review churn.

---

## Finding 6 — Trial Data Source Quality (5-Trial Sample): GREEN with caveats

| Trial | Year | n | Primary endpoint | Match assessment |
|---|---|---|---|---|
| NINDS | 1995 | 624 | mRS 0–1 at 90d | 42.6% vs 27.2% matches mRS 0–1 component. Minor: full global stat was slightly different. Needs verification packet. |
| MR CLEAN | 2015 | 500 | mRS shift, adjusted cOR 1.67 | Matches published Berkhemer NEJM primary results. OK. |
| DAWN | 2018 | 206 | Utility-weighted mRS (Bayesian); mRS 0-2 49% vs 13% | Matches. NNT on Bayesian primary is borderline per trial-statistics skill — project-level decision to allow. Flag for clinical-reviewer. |
| SELECT-2 | 2023 | 352 | Ordinal shift | `applicability.populationExclusions` correctly notes "stopped early" with caution against overstating. Good practice. |
| CHANCE | 2013 | 5,170 | DAPT vs aspirin, 90d recurrence | PMID 23803136 resolves to canonical Wang NEJM paper. OK. |

**Strength:** The `primaryDesign` / `primaryResult` contract in `trialData.ts` schema comments is exemplary — documents the Option Y NNT-suppression rule, names trials by archetype, lists legal design/result pairings. Better than most clinical data implementations.

---

## Summary of Citation Governance Gaps

1. `registry.ts` is missing — §13.5 hook gate non-functional
2. `CLAIM_REGISTRY = {}` — empty stub
3. No claim tags deployed anywhere (0 `data-claim`, 0 `claim()` invocations)
4. PMID coverage: ~11% in `trialData.ts`, 0% in list/catalog files
5. DOI coverage: good (100% in list/legacy, ~82% in `trialData.ts`)
6. `last_reviewed` field: unpopulated everywhere (0 occurrences in src/)
7. No entry formally verified per evidence-verifier brief

## Top Three Priorities

1. Ship W5.2 (`registry.ts` + populated `claims.ts`), or formally re-baseline §13 with Phase-0 status note in CLAUDE.md
2. Backfill PMIDs in `trialData.ts` (mechanical, parallelizable)
3. Backfill ~16 missing DOIs in `trialData.ts`
