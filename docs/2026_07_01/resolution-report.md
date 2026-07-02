# NeuroWiki Audit Resolution Report

**Date:** 2026-07-02
**Class:** E / C-clinical (clinical data + citations + calculator + guide copy)
**Scope:** Close-out of the clinical semantic-validity audit — the residual "needs-decision" items plus two structural items (ELAN `listCategory`, CREST-2 duplicate citation), on top of the earlier remediation waves.
**Clinical review artifact:** `docs/reviews/clinical-audit-resolution-2026-07-02.md`

---

## 1. What this round changed (the committed diff)

Seven source files. Every clinical assertion below was independently re-verified against its primary source by an adversarial verifier before commit (see §3).

### Citations (`src/lib/citations/registry.ts`, `claims.ts`)
- **BAOCHE / ATTENTION quoted_text** — replaced the earlier "[secondary-source synthesis pending]" placeholders with verbatim NEJM abstract sentences (RESULTS + CONCLUSIONS), retrieved via NCBI E-utilities efetch. BAOCHE (PMID 36239645): mRS 0–3 46% vs 24%, adjusted rate ratio 1.81 (95% CI 1.26–2.60, P<0.001). ATTENTION (PMID 36239644): 46% vs 23%, adjusted rate ratio 2.06 (95% CI 1.46–2.91, P<0.001). Confidence raised MEDIUM → HIGH; `last_reviewed` 2026-07-02.
- **`aha-asa-2026-4.3` (BP management)** — quoted_text expanded from the single post-EVT harm row to the full peri-reperfusion framework (pre-IVT <185/<110 COR 1 B-NR; post-IVT <180/105 COR 1 B-R; post-IVT intensive <140 COR 3 No Benefit B-R; post-EVT <140 COR 3 Harm A), verbatim against the in-repo guideline mirror. `bp-control-guideline-summary` claim description tightened from "≤185/110" to the strict pre-IVT inequality "<185 and <110" with per-row COR/LOE.
- **CREST-2 duplicate consolidation** — `brott-crest-2-2025` and `brott-crest-2-2026` were the same publication (NEJM 2026;394(3):219-231, DOI 10.1056/NEJMoa2508800, PMID 41269206). Deleted the `-2025` duplicate, kept `-2026` as canonical (exact published title, richer effect sizes), repointed the one referencing claim (`crest-2-asymptomatic-2025`). No live reference to the deleted id remains.

### Trials (`src/data/trialData.ts`)
- **TRACE-III** — attached the 95% CI the trial actually reports (relative rate 1.37, 95% CI 1.04–1.81) to `effectSize` and the `howToReadChart` prose, with an `info` field disclosing that the publication reports **no separate CI for the 8.8 pp absolute difference** (no CI fabricated). Source: Xiong Y et al., NEJM 2024 (NEJMoa2402980).
- **ELAN `listCategory`** — corrected `'antiplatelets'` → `'acute'`. ELAN tests early-vs-later DOAC (anticoagulant) initiation after AF-associated stroke (Fischer U et al., NEJM 2023;388:2411-2421), so `'antiplatelets'` was wrong; `'acute'` matches its direct AF-DOAC-timing peers TIMING and OPTIMAS. (A dedicated `'anticoagulant'`/`'secondary-prevention'` enum would be a schema change — parked for V.)

### Calculator (`src/data/hasBledScoreData.ts`, `src/pages/HasBledScoreCalculator.tsx`)
- **HAS-BLED risk tiers** — reconciled from an unsupported 4-tier scheme to the standard 3-tier (low 0–1, moderate 2, high ≥3). Removed the `very_high` type member, label, and severity-token block, plus the dead consumer comparison.
- **Per-score bleeding rates** — kept measured Pisters 2010 Table 5 rates for scores 0–4; scores ≥5 now use a single aggregate high-risk band (floor 8.70, the score-4 rate) flagged via `rateIsAggregateBand`, instead of the previously fabricated monotonic per-score numbers (source values for 5–9 are single-event / zero-event / no-data).

### Guide (`src/pages/guide/Thrombectomy.tsx`)
- **Late window (6–24 h)** — reframed to the 2026 two-path model: ASPECTS ≥6 (COR 1, LOE A) or ASPECTS 3–5 in selected patients (age <80, no significant mass effect; COR 1, LOE A); perfusion mismatch (DAWN/DEFUSE-3) is "one qualifying path, not required for all."
- **Distal/MeVO** — nondominant/codominant M2, distal MCA, ACA, PCA now stated at guideline strength: "should not be used routinely (COR 3: No Benefit, LOE A)."

---

## 2. Counts (2026-07-02 follow-up verification pass)

| Bucket | Count |
|---|---|
| Newly fixed this pass | 3 (TRACE-III effectSize + prose CI; bp-control description) |
| Already-done / false-positive (validated the earlier waves) | 8 |
| Resolved in-place after reviewer correction | 1 (ELAN `listCategory` → `acute`) |
| Reviewer-flagged fixer error (corrected) | 1 (ELAN escalation rested on a false "entry not present" premise; the entry exists at trialData.ts:9964) |

The 8 false-positives confirm the earlier remediation waves already applied BAOCHE/ATTENTION quotes, the CREST-2 dedup, the HAS-BLED 3-tier reconciliation, and both Thrombectomy framings correctly — the audit had been describing the pre-fix state.

---

## 3. Independent verification + clinical review

Before merge, 8 independent, refute-oriented verifiers re-checked every changed assertion against its primary source (efetch for PMIDs; the in-repo guideline mirror for §4.3 / §4.7.2; Pisters 2010 Table 5 for HAS-BLED). A clinical-reviewer synthesis returned **approve-with-conditions, zero blocking issues**. Both pre-merge conditions were then resolved:

1. **CREST-2 ARD sign convention** — `registry.ts` and `claims.ts` now print the stenting result identically as "absolute risk reduction 3.2 percentage points, 95% CI 0.6 to 5.9, P=0.02"; the stenting ARD CI is flagged medium-confidence in the code comment (drawn from the paywalled full-text table, not the abstract).
2. **TRACE-III label** — the relative-rate CI is now bound to "relative rate 1.37 (95% CI 1.04-1.81)" rather than sitting next to the 8.8% absolute value.

Full detail and per-item verdicts: `docs/reviews/clinical-audit-resolution-2026-07-02.md`.

---

## 4. Deferred / parked (not blocking this merge)

- **For V (schema decision):** whether to add a dedicated `'anticoagulant'`/`'secondary-prevention'` `listCategory` enum (Class D) rather than mapping ELAN to `'acute'`.
- Basilar-EVT guideline COR/LOE grade (held for V; sources disagree on a single COR 1 vs a 1 / 2a split).
- Untagged-surface `data-claim` tagging (data-architect).
- BAOCHE quoted_text: add an ellipsis between the two non-contiguous verbatim sentences (low priority; already disclosed in the code comment).
- Thrombectomy.tsx: optionally restate NIHSS ≥6 / prestroke mRS 0–1 in the visible ASPECTS 3–5 clause (low priority; carried by shared clause + tooltip).
- bp-control §4.3: two additional peri-EVT BP rows (pre-EVT ≤185/110, post-EVT ≤180/105) intentionally not surfaced (documented in the code comment).

---

## 5. Gates

`tsc --noEmit`, `check:claims`, `check:chains`, `check:card-meta` (regenerated, in sync), `check:humanizer` (0 errors), `check:routes` (48 routes), and `npm run build` (171/171 prerendered) all green.

**Rollback:** `git revert <merge-commit>`; all changes are data/copy/citation edits with no schema migration, so revert is clean.
