# Clinical review — audit resolution round (2026-07-02)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-fable-5), synthesizing 8 independent adversarial verifiers
**Date:** 2026-07-02

## Scope
- Claims/citations touched: baoche-trial-2022, attention-trial-2022, aha-asa-2026-4.3, brott-crest-2-2026 (canonical), brott-crest-2-2025 (deleted), bp-control-guideline-summary, crest-2-asymptomatic-2025; trials: trace-iii-trial, elan-study; calculator: HAS-BLED (hasBledScoreData.ts + HasBledScoreCalculator.tsx); guide: Thrombectomy.tsx
- Surfaces changed: structured trial data (§13.3), citation registry, claim registry, calculator scoring/data output, guide JSX
- Files: src/data/trialData.ts, src/lib/citations/registry.ts, src/lib/citations/claims.ts, src/data/hasBledScoreData.ts, src/pages/HasBledScoreCalculator.tsx, src/pages/guide/Thrombectomy.tsx
- Evidence-verifier packets: synthesized from 8 independent adversarial verifier verdicts (per-item, primary-source-checked)
- Trial-statistician report: incorporated inline per trial (TRACE-III binary-superiority + labeled ordinal secondary; BAOCHE/ATTENTION adjusted rate ratio; CREST-2 per-arm + ARD; HAS-BLED per-score/aggregate-band scheme)

## Semantic validity
Every changed assertion was checked against the five never-drift categories (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints). No drift detected in any category across all 8 items.

- **TRACE-III (trace-iii) — confirmed (high).** Arm rates 33.0% vs 24.2%, 8.8 pp absolute, relative rate 1.37 (95% CI 1.04–1.81, P=0.03), NNT ≈11 all match NEJM 2024 (PMID 38884324). Effect measure correctly labeled as RELATIVE RATE, not an ARD CI; info field accurately discloses that no separate ARD CI is published (no fabricated CI). Binary primary (mRS 0–1) with NNT/standard P-value is the appropriate display archetype; ordinal mRS shift is correctly kept as a labeled secondary (cOR 1.33). Flagged: short `effectSize.label` places the relative-rate CI adjacent to the 8.8% "Absolute Increase" value — the info field disambiguates, but the short label is ambiguous in isolation (see Condition 1).
- **BAOCHE (baoche-trial-2022) — confirmed-with-caveat (high).** Both quoted sentences verbatim from NEJM 2022 abstract (PMID 36239645): mRS 0–3 46% vs 24%, aRR 1.81 (95% CI 1.26–2.60, P<0.001); Conclusions verbatim. Flagged: the two verbatim sentences are non-contiguous in the source (RESULTS + CONCLUSIONS) and concatenated without ellipsis; in-file comment discloses this, so it is documented synthesis, not fabrication (see Follow-up).
- **ATTENTION (attention-trial-2022) — confirmed (high), no discrepancies.** Verbatim vs PMID 36239644: mRS 0–3 46% vs 23%, aRR 2.06 (95% CI 1.46–2.91, P<0.001). aRR correctly reported (no improper NNT/ordinal-shift conversion). Metadata correct.
- **aha-asa-2026-4.3 / bp-control-guideline-summary — confirmed (high), no drift.** All four peri-reperfusion BP rows verbatim vs in-repo 2026 AHA/ASA mirror: pre-IVT COR 1/B-NR (strict <185 and <110 preserved, not softened to ≤), post-IVT COR 1/B-R (<180/105 ≥24h), post-IVT intensive COR 3: No Benefit/B-R, post-EVT COR 3: Harm/A. No COR/LOE grade drift. Partial-but-accurate scope (two additional ≤185/110 and ≤180/105 rows intentionally not surfaced, documented in code comment); the distinct ≤185/110 pre-EVT target correctly NOT conflated with strict pre-IVT <185/<110.
- **CREST-2 (crest2-dedup) — confirmed-with-caveat (high).** Consolidation to canonical brott-crest-2-2026 correct; no live references to deleted 2025 id (all 4 hits in comments). PMID 41269206 / DOI 10.1056/NEJMoa2508800 resolve; effect sizes verbatim (stenting 2.8% vs 6.0%, ARD 3.2pp, P=0.02; endarterectomy 3.7% vs 5.3%, ARD 1.6pp, P=0.24). Flagged: (a) stenting ARD 95% CI is drawn from paywalled full-text table and could not be independently verified — plausible/consistent with P=0.02, labeled medium-confidence; (b) sign-convention inconsistency between registry.ts ("-5.9 to -0.6") and claims.ts ("0.6-5.9") for the SAME stenting ARD CI (see Condition 2); (c) "NNT 31" author-reported and labeled as such.
- **HAS-BLED (hasbled) — confirmed (high), no discrepancies.** Per-score rates 0–4 verbatim vs Pisters 2010 Chest Table 5 (0=1.13, 1=1.02, 2=1.88, 3=3.74, 4=8.70); non-monotonic 0→1 dip faithfully preserved. 3-tier scheme (low 0–1, moderate 2, high ≥3) standard and defensible; scores ≥5 route to aggregate high-band floor 8.70 with rateIsAggregateBand=true (unstable 5–9 raw values correctly omitted, not fabricated). No live consumers of removed 'very_high' tier.
- **Thrombectomy.tsx (thrombectomy-guide) — confirmed (high), no drift.** All three claims verbatim vs 2026 AHA/ASA mirror: 6–24h ASPECTS ≥6 = COR 1/A with NO perfusion requirement; 6–24h ASPECTS 3–5 selected (age <80, no significant mass effect) = COR 1/A; nondominant/codominant M2 + distal MCA/ACA/PCA = COR 3: No Benefit/A. Temporal windows and grades preserved exactly. "Perfusion is one qualifying path, not required" framing is guideline-faithful; DAWN/DEFUSE-3 numeric thresholds are correct historical enrollment criteria. Flagged (non-blocking): NIHSS ≥6 / prestroke mRS 0–1 restated for the ASPECTS ≥6 arm but carried via shared clause + tooltip for the 3–5 arm (see Follow-up).
- **ELAN (elan-category) — confirmed (high), no discrepancies.** listCategory 'antiplatelets' → 'acute' is a same-schema data-categorization correction (ELAN is an AF-DOAC-timing trial, PMID 37222476); peers timing-trial and optimas-trial both use 'acute'. No clinical-logic/threshold change. Dedicated enum parked for V.

## Citation accuracy
- **BAOCHE (PMID 36239645):** quoted_text verbatim character-for-character (RESULTS + CONCLUSIONS sentences); numbers 51/110 (46%) vs 26/107 (24%), aRR 1.81 (CI 1.26–2.60), P<0.001 all match. Metadata (Jovin, NEJM 2022;387(15):1373-1384, DOI 10.1056/NEJMoa2207576) correct. Caveat: non-contiguous concatenation without ellipsis (disclosed in file comment).
- **ATTENTION (PMID 36239644):** quoted_text verbatim; 104 (46%) vs 26 (23%), aRR 2.06 (CI 1.46–2.91), P<0.001; DOI 10.1056/NEJMoa2206317, NEJM 2022;387(15):1361-1372 correct.
- **CREST-2 (PMID 41269206):** title, citation (NEJM 2026;394(3):219-231), DOI 10.1056/NEJMoa2508800 exact; conclusion verbatim; per-arm effect sizes confirmed. Stenting ARD CI unverified (paywalled table) and sign-inconsistent across files — see Conditions/Follow-ups.
- **aha-asa-2026-4.3 (2026 AHA/ASA):** quoted_text appends correct COR/LOE grade to each verbatim §4.3 sentence; all four rows match the in-repo mirror (operative source, per repo convention that the .ts export is source of truth).
- **TRACE-III (PMID 38884324):** effectSize/info/howToReadChart figures match NEJM 2024 Table 2/abstract; relative-rate CI correctly labeled.

## Freshness
- baoche-trial-2022: last_reviewed 2026-07-02 — within window (landmark/trial), pass.
- attention-trial-2022: last_reviewed 2026-07-02 — within window, pass.
- aha-asa-2026-4.3: last_reviewed 2026-07-02 — within 6-month guideline window (§13.7), pass.
- brott-crest-2-2026: last_reviewed 2026-07-02 — within window, pass.
- trace-iii-trial, crest-2-asymptomatic-2025 (repointed), hasbled/Pisters-2010, elan-study: touched in this round; source resolution and semantic consistency confirmed by verifiers (§13.6 steps 1–5), dual sign-off recorded here (§13.6 step 6). All within their respective §13.7 windows.

## Rationale
All eight adversarial verifiers returned confirmed or confirmed-with-caveat against primary sources, with every load-bearing number, verbatim quote, and COR/LOE grade independently checked and no drift in any never-drift category and no synthesis smoothing of an evidence conflict. No mandatory-block condition (§ block list 1–8) is triggered: sources resolve, quoted_text supports each claim, freshness is current, and there is no silently-incomplete evidence packet. Two caveats are editorial numeric-presentation issues on bedside-facing surfaces that are unambiguous and low-risk to fix — the CREST-2 stenting ARD CI sign-convention mismatch between registry.ts and claims.ts (same statistic printed with opposite sign convention), and the TRACE-III short label that visually attaches a relative-rate CI to an absolute-difference value — so this is approve-with-conditions rather than approve, with both conditions to be resolved before merge to main.

## Required follow-ups
- **CONDITION 1 (must fix before merge):** Harmonize the CREST-2 stenting ARD 95% CI sign convention so registry.ts and claims.ts express the same statistic identically (choose one of "-5.9 to -0.6" or "0.6-5.9" consistently). Cosmetic/directional, but two files disagree on the printed form of one bedside number.
- **CONDITION 2 (must fix before merge):** Tighten TRACE-III `effectSize.label` so the relative-rate CI (1.04–1.81) is not adjacent to the 8.8 pp "Absolute Increase" value — e.g., "RR 1.37 (95% CI 1.04–1.81); no ARD CI published." Prevents momentary misattribution of the CI to the ARD on the trial card.
- Flag the CREST-2 stenting ARD 95% CI as unverified from the paywalled NEJM full-text table (per-arm CIs + P=0.02 only in abstract). Confirm against the results table when accessible, or mark the field medium-confidence in the citation comment. "NNT 31" (CREST-2) is author-reported and already labeled as such — retain the label.
- BAOCHE quoted_text: consider adding an ellipsis or explicit separator between the two non-contiguous abstract sentences (RESULTS + CONCLUSIONS) so a reader of the field alone knows they are not adjacent in the source. In-file comment already discloses; low priority.
- Thrombectomy.tsx: consider restating NIHSS ≥6 / prestroke mRS 0–1 in the visible ASPECTS 3–5 clause (currently carried by shared clause + tooltip) to remove any chance a scanning reader misses those gates. Guideline-consistent as written; low priority.
- **For V — parked schema decision:** ELAN was recategorized to 'acute' as best-available same-schema value; decide whether to add a dedicated 'anticoagulant' / 'secondary-prevention' listCategory enum (would be a Class D data-schema change). Tracked as parked in the code comment.
- bp-control §4.3: note that two additional peri-EVT BP rows (pre-EVT ≤185/110 COR 2a/B-NR; post-EVT ≤180/105 during+24h COR 2a/B-NR) exist in the mirror and are intentionally not surfaced (documented in code comment) — surface later if the BP summary is expanded.

---

## Condition resolution (orchestrator, pre-merge, 2026-07-02)

Both must-fix conditions were resolved before this round was committed to `main`:

- **CONDITION 1 (CREST-2 ARD sign convention) — DONE.** `registry.ts` and `claims.ts` now print the stenting result identically as **"absolute risk reduction 3.2 percentage points, 95% CI 0.6 to 5.9, P=0.02"** (previously registry showed "ARD −3.2, 95% CI −5.9 to −0.6"; claims showed "ARD 3.2 pp, 95% CI 0.6–5.9"). The endarterectomy arm is harmonized to "absolute difference 1.6 pp" in both. Framing the significant stenting result as an absolute risk *reduction* makes the positive value directionally correct in both surfaces.
- **CONDITION 2 (TRACE-III label) — DONE.** `trialData.ts` `effectSize.label` changed from `'Absolute Increase (relative rate 1.37, 95% CI 1.04-1.81)'` to `'Absolute Increase in mRS 0-1; relative rate 1.37 (95% CI 1.04-1.81)'`, so the CI is bound to the relative rate, not the 8.8% absolute value. The `info` field's "no separate ARD CI is published" disclosure is retained.
- **Medium-confidence flag (CREST-2 stenting ARD CI) — DONE.** The `brott-crest-2-2026` code comment now records that per-arm rates, P values, and RRs are abstract-verified (PMID 41269206) while the stenting ARD 95% CI (0.6 to 5.9) is from the paywalled full-text results table and is medium-confidence pending full-text re-verification.

Low-priority follow-ups (BAOCHE ellipsis, Thrombectomy ASPECTS 3–5 clause restatement, bp-control extra peri-EVT rows) and the **parked ELAN schema-enum decision for V** are recorded in `TASKS.md` and left for a future round; none blocks this merge.

**Effective decision after condition resolution: approve.** All gates green (tsc, check:claims, check:chains, check:card-meta, check:humanizer, check:routes, build 171/171 prerendered).

