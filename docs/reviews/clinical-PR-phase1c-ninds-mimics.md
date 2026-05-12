# Clinical review — PR #phase1c

**Decision:** approve-with-conditions (all conditions resolved pre-merge — see §Rationale)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-11

## Scope
- Claims touched: `ninds-trial` pearl (lines 94–111); `stroke-mimics-safety` pearl (lines 188–198) — both in `src/data/strokeClinicalPearls.ts`
- Citations affected: NINDS (NEJM 1995, PMID 7477192); Zinkstok et al. Stroke 2013 (PMID 23444310); AHA/ASA 2019 (PMID 31662037, Class IIa / LOE B-NR)
- Surfaces changed: structured data in `src/data/strokeClinicalPearls.ts` (Phase 1 surface per §13.4)
- Evidence-verifier packet: `docs/evidence-packets/phase1c-ninds-mimics.md`
- Trial-statistician report: not applicable — descriptive trial summary, no NI/Bayesian/ordinal display archetype change

## Semantic validity

**Pearl 1 — `ninds-trial`:**
- Corrects wrong mRS 0-1 figures (42.6% vs 27.2% → 39% vs 26%) against NEJM 1995 Table 4. HIGH confidence.
- Adds "Part 2 (n=333) 3-month outcomes" qualifier — correctly scopes figures to the primary efficacy analysis.
- Removes misattributed "<90min showed greatest benefit (50% vs 38%)" — 50% vs 38% is the Part 2 overall Barthel ≥95 result, not the <90min subgroup. The <90min time-stratified analysis is from Marler 2000, not the 1995 paper.
- Adds global OR 1.7 (95% CI 1.2-2.6, P=0.008) and "Parts 1+2 combined" attribution for 6.4% sICH — both verified against primary source.
- evidenceClass I / evidenceLevel A: unchanged. Correct.
- All five never-drift categories: PASS.

**Pearl 2 — `stroke-mimics-safety`:**
- Corrects citation year (2021 → 2013) and study design (meta-analysis → multicenter cohort) — material citation accuracy corrections.
- Corrects sICH figures: "1.0-2.0%" → "1.0% (95% CI 0.0-5.0)"; "5.5-7.9%" → "7.9% (95% CI 7.2-8.7)". Both figures from Zinkstok 2013 using ECASS-II definition — no definition mismatch introduced.
- Removes "When in doubt, treat" (directive not in any AHA/ASA guideline) from plainEnglish. Replaces with hedged language aligned to AHA/ASA 2019 Class IIa voice: "When clinical suspicion for stroke is high, don't delay tPA for extended workup — the low sICH risk in mimics is outweighed by the cost of withholding tPA from a real stroke."
- "Bottom line: Don't delay tPA for extensive workup if stroke is likely" in content — retained. Acceptable per evidence-verifier; mirrors AHA/ASA 2019 framing.
- evidenceClass IIa / evidenceLevel B: unchanged. Now consistent with the explicit AHA/ASA 2019 Class IIa label added to the evidence field.
- All five never-drift categories: PASS.

## Citation accuracy
- NINDS 1995 (PMID 7477192): all statistics verified against source PDF. Corrections are directionally correct and numerically accurate.
- Zinkstok 2013 (PMID 23444310): year corrected, design corrected, sICH figures corrected to published values with CIs.
- AHA/ASA 2019 (PMID 31662037): newly cited in evidence field; Class IIa / LOE B-NR confirmed via multiple consistent secondary summaries. Exact verbatim from paywalled full text not retrievable — deferred to W5.2 registry task for quoted_text entry.
- No claimId fields added — W5.2 not landed; by design for this task.

## Freshness
- NINDS 1995: landmark trial, 36-month freshness window (§13.7). Stable historical data. PASS.
- Zinkstok 2013: foundational observational cohort for mimics-tPA safety. No superseding dataset identified. PASS.
- AHA/ASA 2019: default 6-month window (§13.7). May be partially superseded by AHA/ASA 2026 — verify during W5.2 whether 2026 restates the mimics CIIa recommendation; if yes, refresh citation to 2026 via §13.6 checklist. Flagged as post-merge follow-up.

## Rationale
Both edits are net corrections of pre-existing errors, not new clinical claims. The NINDS pearl corrects factually wrong percentages verified against the primary source, removes a misattributed time-stratified claim, and adds provenance qualifiers (Part 2, combined sICH) that make the evidence trail clearer. The mimics pearl corrects three citation errors (year, design, sICH values) and replaces a directive plainEnglish line that was not grounded in any AHA/ASA recommendation. The two pre-merge conditions from the review — check:claims hook verification and evidence-verifier packet file — were both resolved before commit: check:claims passes, and the evidence packet exists at `docs/evidence-packets/phase1c-ninds-mimics.md`.

## Required follow-ups
**After merge (W5.2 / Phase 3A-3B follow-on, non-blocking):**
1. Register `ninds-1995-nejm` and `zinkstok-2013-mimics` citations in `src/lib/citations/registry.ts` with `last_reviewed` and `quoted_text` once W5.2 lands.
2. Verify AHA/ASA 2026 mimics recommendation vs 2019; if 2026 re-states it, refresh citation to 2026 via §13.6 six-step checklist.
3. `time-is-brain-deep` pearl (lines 84–92) still contains "NINDS trial: Treatment <90min had 50% vs 38% good outcome at 3 months" — same misattribution corrected here. Track as a separate Class E follow-up task (re-source to Marler 2000 with correct OR, or replace with Emberson 2014 pooled time-benefit framing).
