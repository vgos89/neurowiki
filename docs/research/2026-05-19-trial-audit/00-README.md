# Overnight Trial Audit — Read This First

**Date:** 2026-05-19 (overnight)
**Status:** Research artifacts only. No source files were edited.

## What this is

Three research agents ran in parallel against the trial catalogue and produced findings + recommendations. Per CLAUDE.md §5.6 + §6.1 + §19, none of the clinical-content findings have been applied to source — they are a hypothesis list awaiting V triage and clinical-reviewer ratification.

## Read in this order

1. **`01-trial-accuracy-audit.md`** — evidence-verifier read of all ~89 trials against PubMed + editorials + AHA/ASA 2026. Where the catalogue diverges from published evidence or editorial consensus. Includes the antiplatelet timeline (V's SPS3-POINT-CHANCE example) confirmed + 4 additional cross-trial chains documented.

2. **`02-statistical-interpretation-audit.md`** — trial-statistician parallel review. NNT validity, ordinal-shift vs binary-superiority, Bayesian framing, quasi-experimental handling. Significant overlap with #1 on the BLOCKING items; this one is the deeper statistical justification.

3. **`03-trial-questions-suggestions.md`** — medical-scientist audit of `trial-questions.ts`. Missed cross-links on existing questions, 7 proposed new questions, evidence gaps where the catalog can't currently field a question, orphan trials with disposition recommendations.

## The headline numbers

- **6 BLOCKING items** identified across two parallel audits — each is Class E (clinical interpretation change). Must route through medical-scientist + clinical-reviewer per §17.2.
- **8+ missing trials** that should be added (RESCUE-Japan LIMIT, ESCAPE-NEXT, EXTEND-IA TNK, ANNEXA-I, antiplatelet foundational stubs, PFO closure cluster, CREST/CREST-2, THEIA).
- **30+ missed cross-links** between existing trials and existing questions.
- **7 new question suggestions** the existing catalog can already answer.
- **4 evidence gaps** where the catalog needs data-layer additions before fielding a question (PFO closure, DOAC head-to-heads, lacunar/small-vessel SPP, AVM, carotid endarterectomy vs stenting).
- **11 trials missing `primaryDesign`/`primaryResult`** taxonomy metadata.
- **1 cross-cutting display issue** — `calculations.nnt` rendering on ordinal-shift trials (SELECT2, ANGEL-ASPECT, MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME, BEST-MSU).

## Recommended workflow tomorrow

1. **Triage Tier 1 (the 6 BLOCKING items) first.** For each: acknowledge / dispute / defer. Recommended first commit: **ESCAPE-MeVO endpoint label fix** — smallest blast radius (single field correction + citation refresh).

2. **Decide on the renderer guard** for NNT-on-disallowed-designs. This is a structural fix in `scripts/check-claims.ts` that catches the pattern catalogue-wide. Class D.

3. **Prioritize missing trials** in chronological order. RESCUE-Japan LIMIT + EXTEND-IA TNK + ESCAPE-NEXT close existing chain gaps and are likely highest yield. PFO + carotid are bigger work (category-empty).

4. **Tier 3 + 4** items (missing taxonomy fields, per-trial caveat additions) can land as Class C-clinical bulk commits once Tier 1 is settled.

5. **Trial questions** — Part A misses are mechanical `trialIds[]` extensions; one Class C-clinical-editorial commit suffices. Part B new questions are also editorial work but require icon decisions + clinical-reviewer pass on each question's prose.

## What shipped tonight (and is live)

- OG cache bump to `?v=4` so the compressed 1.25MB image renders in chat previews (commit `ac4665b`).
- Trial Catalogue UI fixes (commit `3699402`): all four filter pills now functional (Favourites + Recent + New 2024-25 wired; Guidelines inert pending Tier 2), default-closed accordions with auto-expand when any filter is active, trial cards indented under category headings, search broadened to include `clinicalContext` + `bottomLineTag` + year-as-string. Sort by year newest-first within each category was already correct (no change needed).

## What did NOT ship tonight (deliberately, per CLAUDE.md governance)

- Any change to trial data interpretation, NNT framing, primary endpoint labels, or trialResult values. These are Class E per §6.1.
- Year-visibility data fix on missing-year trials. Trial year is metadata-with-citation; bulk update is Class C-clinical and needs clinical-reviewer per §13.6.
- Trial influence-timeline visualization component. The shell is Class C but the relationships are clinical claims — better to ship shell + data together after the chain copy is reviewed.
- Pathway Save Case rollout, Stroke Code architecture refactor — both deferred per V's own earlier scoping.

## Three things V owns outside the codebase (optional, not blocking)

From earlier `docs/supabase-ops.md`:
- Enable Realtime on the `transfers` table (unlocks sub-second receive on /import)
- Rate-limit `/rest/v1/transfers` to 30 req/min/IP (closes baseline F1)
- Re-trigger Facebook/Twitter/LinkedIn debuggers if the new OG hasn't propagated by morning

If you want me to begin the Tier 1 fixes tomorrow as Class E commits, point at the first one and I'll route through medical-scientist + clinical-reviewer per the spec.
