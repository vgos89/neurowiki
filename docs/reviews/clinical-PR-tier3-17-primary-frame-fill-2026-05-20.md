# Clinical review — PR # Tier 3 #17 primaryDesign/primaryResult bulk fill (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Claims touched:** none — taxonomy-only metadata fill. No displayed numbers, no displayed prose changes.
- **Trials touched (9):** INTERACT4, ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, CHARM, ESCAPE-NA1, HAMLET, DESTINY-II
- **Trials intentionally deferred (2):** DECIMAL, DESTINY — see §"Deferred items" below
- **Surfaces changed:** `src/data/trialData.ts` only
- **Fields added per entry:** `primaryDesign` (taxonomy enum), `primaryResult` (outcome enum)

## Why this commit exists

Per audit artifact `docs/research/2026-05-19-trial-audit/02-statistical-interpretation-audit.md` (Pattern C, line 87): 11 trials in the catalogue lacked `primaryDesign` and `primaryResult` taxonomy fields. These fields do not surface to the reader directly, but they gate:

1. Renderer logic for NNT suppression (now enforced at build time per Tier 3 #18, commit `7956087`)
2. Future archetype selection for trial chart displays
3. Automated validity guards on cross-trial pooled claims

The current displays on these 9 trials do **not** contain statistical interpretation errors visible to readers — this is a pure metadata gap, not a clinical claim change.

## Verified mapping (medical-scientist read, all HIGH confidence)

| Trial | `primaryDesign` | `primaryResult` | Evidence |
|---|---|---|---|
| INTERACT4 | `ordinal-shift` | `not-met` | Anderson et al., NEJM 2024 — cOR 1.00 (0.87–1.15), null on mRS shift |
| ENCHANTED | `ordinal-shift` | `not-met` | Anderson et al., Lancet 2019 (BP arm) — aOR 1.01, P=0.87 on mRS shift |
| BEST-II | `estimation-strategy` | `futility-stopped` | Mistry et al., JAMA 2023 — 3-arm post-EVT BP target, futility boundary; predicted success 14–25% |
| BP-TARGET | `binary-superiority` | `not-met` | Mazighi et al., Lancet Neurol 2021 — 42% vs 43% iPH, aOR 0.96, P=0.84 |
| OPTIMAL-BP | `binary-superiority` | `harm-stopped` | Nam et al., JAMA 2023 — mRS 0-2: 39.4% vs 54.4%, aOR 0.56, P=0.03; DSMB-stopped |
| CHARM | `ordinal-shift` | `not-met` | Sheth et al., Lancet Neurol 2024 — cOR 1.17, P=0.42 on mRS shift |
| ESCAPE-NA1 | `binary-superiority` | `not-met` | Hill et al., Lancet 2020 — mRS 0–2: 61.4% vs 59.2%, aRR 1.04, P=0.35 |
| HAMLET | `binary-superiority` | `not-met` | Hofmeijer et al., Lancet Neurol 2009 — primary mRS 0–3 ARR ≈0%; mortality benefit was secondary |
| DESTINY-II | `binary-superiority` | `met` | Jüttler et al., NEJM 2014 — survival without severe disability (mRS 0–4): 38% vs 18%, OR 2.91, P=0.04 |

## Corrections to prior assumptions surfaced during review

1. **CHARM** was initially classified `terminated-administrative` in the audit's working notes (because the trial stopped early during COVID). The honest call is `not-met`: at n=535, the trial reported a real null primary (cOR 1.17, P=0.42). The administrative stop affected power, not the outcome category. `terminated-administrative` is reserved for trials whose primary outcome cannot be interpreted because the trial stopped before yielding a result; CHARM does not meet that bar.

2. **ENCHANTED** is the BP arm (Anderson Lancet 2019), not the alteplase-dose arm (Anderson NEJM 2016). The catalog entry matches the BP arm (`stats.primaryEndpoint.value = 'mRS Shift'`), and the assignment reflects that.

3. **BEST-II** is best modeled as `estimation-strategy` per the trial-statistics skill — a 3-arm phase 2 dose-finding futility trial whose primary is a utility-weighted endpoint with predefined futility boundaries. A `dose-finding-safety` interpretation is defensible alternative; chose `estimation-strategy` because the primary outcome was utility-weighted mRS, not a safety endpoint per se.

## Deferred items (DECIMAL + DESTINY)

The audit (Tier 1 #6) recommended that DECIMAL and DESTINY's `trialResult` field flip from `NEUTRAL` to `POSITIVE` because of striking mortality reduction in both trials.

The medical-scientist review surfaced a published-frame conflict: both trials prespecified a **functional primary endpoint** (mRS ≤3 / mRS 0–3 at 6 months), neither of which was statistically significant (P=0.18 and P=0.23). **Mortality benefit, while clinically dramatic, was a secondary endpoint in both.**

Per published primary frame, the honest taxonomy is `binary-superiority / not-met` for both. Per audit recommendation, the `trialResult` summary tag flip to POSITIVE would conflict with that taxonomy.

V is currently fetching PDFs for DECIMAL and DESTINY under Tier 1 #6. Deferred from this commit until that conflict can be resolved with V holding the source documents in hand. Both trials remain without `primaryDesign` / `primaryResult` for now — they will not pass the build-time NNT guard until populated, but neither has `calculations.nnt` set, so the guard does not currently fail on them.

## Semantic validity

No claims touched. No reader-facing prose changed. The taxonomy values follow the trial-statistics skill (`.claude/skills/trial-statistics/SKILL.md`) and align with each trial's published primary frame.

## Citation accuracy

No new citations added. No DOI/PMID changes. The cited evidence in the mapping table is for review-trail purposes only — not surfaced to users.

## Freshness

No `last_reviewed` refresh needed — no clinical claim is being asserted that wasn't already in the catalog.

## Rationale

Eliminates 9 of the 11 cataloged metadata gaps flagged in audit artifact 02 Pattern C. Sets up downstream renderer rules (NNT suppression, archetype selection) to fire on these trials. Surfaces the DECIMAL/DESTINY framing conflict to V for resolution rather than silently picking a side.

## Required follow-ups

- DECIMAL + DESTINY `primaryDesign` / `primaryResult` fill — pending V's PDF review and resolution of the mortality-vs-functional primary framing question.
- Two additional gaps remain from the original audit list of 15 (MR ASAP, RACECAT, RIGHT-2, TRIAGE-STROKE were also flagged in line 87 of artifact 02). These were outside V's approved Tier 3 #17 scope (which was 11 trials per artifact 01 line 36) and are not part of this commit.

## Blocking issues

None.
