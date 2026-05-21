# Clinical review — PR # Timeline Phase 2 first wave + 2 new clinical questions (2026-05-21)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-21

## Scope

Two related pieces of work in one commit:

### Part A — Timeline Phase 2 first wave (3 new chains, 7 trials tagged)

New chains added to `src/data/trialChainRegistry.ts`:
- **`pfo-closure`** — CLOSURE-era prologue → CLOSE + RESPECT + REDUCE (2017 cluster) — AHA/ASA 2021 Class IIa B-R foundation
- **`carotid`** — CREST 2010 (predecessor) → CREST-2 (2025 successor)
- **`evt-mevo`** — ESCAPE-MeVO + DISTAL (2024 sibling cohort)

`chainMembership[]` tagged on 7 trial entries:
- CLOSE, RESPECT, REDUCE — `{ chainId: 'pfo-closure', role: 'cohort-member' }`
- CREST — `{ chainId: 'carotid', role: 'predecessor' }`
- CREST-2 — `{ chainId: 'carotid', role: 'successor' }`
- ESCAPE-MeVO, DISTAL — `{ chainId: 'evt-mevo', role: 'cohort-member' }`

Component wiring:
- `TrialPageNew.tsx` generic-fallback render path now renders `<TrialChainTimeline />` at the bottom of the main content column. This lights up the timeline for any trial entry that has `chainMembership` without requiring per-trial render-branch wiring. Benefits all 5 new Phase 2 chain members + any future trial that lands at the generic render path.
- ESCAPE-MeVO + DISTAL also wired in their bespoke render branches (they don't fall through to the generic path).
- Generic-render injection is the architect-recommended approach for Phase 2 chains where many trials use the fallback layout.

### Part B — 2 new clinical questions

`src/data/trial-questions.ts` gets two new questions:

- **`pfo-closure-cryptogenic`** — "PFO closure for cryptogenic stroke?" — groups CLOSE + RESPECT + REDUCE. 3 trials.
- **`asymptomatic-carotid`** — "Asymptomatic carotid stenosis: revascularize or medical?" — groups CREST + CREST-2. 2 trials.

Both use icons from the existing `QuestionIconKey` union (`brain` for both).

Both questions have parking-lot entries in TASKS.md from prior commits (`16f814a` morning briefing flagged these as queued). This commit closes those parking-lot items.

## Semantic validity

- All chain narratives are factual summaries of the trial cluster's clinical contribution — no new clinical claims authored.
- The new `chainMembership` tags are pure metadata; no clinical interpretation change.
- The new questions reference existing trial entries; no new clinical content.
- No NNT values changed, no thresholds changed, no guideline framing changed.

## §8 editorial context

This is metadata + question-hub work. No new trial entries authored, no new clinical claims. The §8 hard requirement (commit `479f100`) applies to **new-trial-entry PRs and Class E re-reviews with new clinical claims** — pure timeline-wiring + question-hub creation does not introduce new claims. Each underlying trial's editorial context (CLOSE, RESPECT, REDUCE, CREST, CREST-2, ESCAPE-MeVO, DISTAL) is already documented in their evidence packets shipped earlier this work week.

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → **PASS (5 chain(s), 15 trial-chain memberships, all references resolved)** — up from 2 chains / 8 memberships
- `npm run check:routes` → PASS (43 routes; new questions resolve via the existing `/trials/q/:questionId` parametric route)

## Rationale

Phase 1 (commit `72d16d4`) shipped 2 chains covering 8 trials. Phase 2 first wave adds 3 more chains covering 7 more trials — total 5 chains, 15 trial memberships. This is the architect's planned phasing per `docs/reviews/arch-trial-chain-timeline-2026-05-20.md`.

The 2 new questions close 2 of the 6 parking-lot follow-ups accumulated across the Tier 2 PDF authoring sprint. Pattern matches the existing 20 questions; no schema change.

## Required follow-ups

1. **Phase 2 second wave** (when predecessor stubs land in W7.0): antiplatelet-acute, evt-anterior, evt-bridging, ivt-tenecteplase, doac-after-af.
2. **Remaining parking-lot questions to author**: anticoagulation reversal in ICH (ANNEXA-I), aspirin in the ED for acute ischemic stroke (IST + CAST), CRAO management (THEIA + EAGLE), Reteplase or alteplase? (PROST + PROST-2 + RAISE).
3. **link-graph.json staleness** flagged in morning briefing — 73 trials missing from graph. Deferred.

## Blocking issues

None.
