# ADR-005 — TRIALS_SPEC v1.0: Design Decisions for Trial Detail Pages

**Date:** 2026-04-21
**Status:** accepted
**Deciders:** V (product owner), orchestrator
**Replaces:** none
**Supersedes:** none

---

## Context

Wave 6 work requires a behavioral spec for trial detail pages at `/trials/:topicId`. Five
design decisions arose during spec authoring that carry long-term structural consequences
and required explicit recording before implementation begins. Each decision below states
what was decided, why, and what it forecloses.

Reference artifacts:
- Spec: `docs/specs/TRIALS_SPEC.md` v1.0
- Mockup: `docs/specs/mockups/trial-reference.html` (5-stage ground truth)

---

## Decision 1 — Option C hybrid citation path

**Decision:** Trial detail pages ship under a hybrid citation model, not full W5.2 compliance.

**EXTEND canary (stub-ready):** Ships without `src/lib/citations/registry.ts` entries.
Clinical content in `trialData.ts` carries `claimId` fields that resolve to stub entries
in `CLAIM_REGISTRY` (empty citation-IDs array). The pre-commit hook passes because stub
entries are explicitly permitted per the GCS rebuild precedent (commit 375d9cf, clinical
review artifact documents the same deviation). This is tracked as technical debt requiring
upgrade once W5.2 lands.

**Future trials (post-W5.2):** Every new trial added after W5.2 completes requires:
1. `registry.ts` citation entry with verbatim `quoted_text` from source
2. `CLAIM_REGISTRY` mapping in `claims.ts`
3. `last_reviewed` date per §13.6 checklist
4. clinical-reviewer gate before merge

**Rationale:** Blocking the trial page redesign on W5.2 completion — itself blocked on 5 V
decisions — would stall visible product work indefinitely. Clinical risk is low for EXTEND
because trial data already exists in `trialData.ts` and is visible to users today; the
redesign changes presentation, not claims.

**Alternatives rejected:**
- **Option A (full registry required before any trial page ships):** Blocks canary on W5.2.
  Rejected — W5.2 has no merge date.
- **Option B (no citation infrastructure in trial pages):** Would require a full backfill
  migration later. Rejected in favor of the stub-ready pattern that keeps upgrade paths clear.

---

## Decision 2 — Statistical interpretation: no new statistician agent

**Decision:** No `statistician` agent is created. Statistical interpretation is joint
ownership across three existing agents.

| Agent | Statistical responsibility |
|---|---|
| `medical-scientist` | Extracts verbatim statistical results from trial sources; confirms values against published tables; authors NNT/ARR/RRR prose |
| `content-writer` | Drafts plain-language explanations of statistics in teaching wells and interpret sections; source-backed by medical-scientist |
| `clinical-reviewer` | Gates semantic validity — confirms p-values, CIs, and effect sizes are accurately represented; blocks misrepresented precision or magnitude |

**Rationale:** A statistician agent would duplicate clinical-reviewer's semantic-validity
function and medical-scientist's source-extraction function. The distinguishing capability
of such an agent (re-deriving statistics, meta-analyses, independent power calculations)
is out of scope — NeuroWiki presents trial results, it does not re-analyze them. A fourth
agent creates coordination overhead with no coverage gain over the existing three.

**Constraint:** This decision is revisited if future work requires meta-analyses, NMA
outputs, or novel statistical synthesis not present in primary trial sources.

---

## Decision 3 — Winning-arm cobalt accent rule

**Decision:** The winning arm of a two-arm trial receives cobalt visual treatment
(`background: #EEF2FF`, `color: #0E2D6B`, `2px solid #1746A2` left border) if and only
if `trialResult === 'POSITIVE'`.

| `trialResult` value | Accent applied to |
|---|---|
| `'POSITIVE'` | Intervention arm (or control arm if the intervention caused harm) |
| `'NEGATIVE'` | Neither arm |
| `'NEUTRAL'` | Neither arm |
| `undefined` / not set | Neither arm |

**Harm condition:** If the trial is coded `POSITIVE` but the intervention arm increased a
harm endpoint (e.g., sICH), the control arm receives the accent instead.

**Rationale:** Applying visual emphasis to a "winning arm" in a negative or neutral trial
would misrepresent the evidence — implying clinical actionability where none exists. The
accent is a semantic signal keyed to `trialResult` in `trialData.ts`, making the visual
treatment data-driven and auditable. Binding it to an existing data field (not a design-
time decision) means future trials inherit correct behavior automatically.

**Implementation note:** `trialResult` is an existing optional field in `TrialMetadata`.
EXTEND carries `trialResult: 'POSITIVE'`. Trials without `trialResult` set default to
no accent on either arm.

---

## Decision 4 — Cobalt H1 for trial page titles

**Decision:** The trial page H1 (full descriptive title, distinct from the abbreviated
name in the sticky header) renders in cobalt `#1746A2` at 19px / font-weight 500 /
letter-spacing -0.01em / line-height 1.3.

**Rationale:** Matches the `neuro-500` brand token established in commit a9df0ce and used
throughout the design system. Trial pages are clinical reference documents; the cobalt H1
signals "primary finding" without introducing a new visual register. This mirrors cobalt
CTA treatment in calculator pages and the cobalt-on-white pattern in the stroke pathway.

**Scope:** H1 only. The following are not cobalt:
- Sticky header trial name: 13px bold slate-800, tracking 0.02em
- Section labels: 10px uppercase tracking-widest slate-400
- Body prose: slate-700

---

## Decision 5 — Six outcome archetypes; Archetype A as EXTEND canary

**Decision:** TRIALS_SPEC v1.0 defines six outcome visualization archetypes. Archetype A
is fully implemented via the EXTEND canary. Archetypes B–F are specified only.

| Archetype | Visualization | Status |
|---|---|---|
| A | Two-group delta band (dot grids + absolute difference overlay) | IMPLEMENTED — EXTEND canary |
| B | Grotta bars / ordinal mRS shift diagram | Specified only |
| C | Forest plot | Specified only |
| D | Kaplan-Meier survival curves | Specified only |
| E | TICI grade distribution (procedural outcomes) | Specified only |
| F | Longitudinal box plot (repeated-measures outcomes) | Specified only |

**Archetype A design decisions (locked):**
- Dot grids: 100 dots per arm, 10-column CSS grid, each dot 8×8px rounded-full
- Delta band: JS-positioned absolute overlay; spans dots[29]–dots[34] (0-indexed);
  `rgba(23,70,162,0.12)` fill; `1.5px solid #1746A2` border; ±4px horizontal / ±3px
  vertical inset offsets
- Small-effect threshold table:

| Absolute difference | Visual treatment |
|---|---|
| ≥5pp | Band shown, no note |
| 2–4pp | Band shown + "Small absolute difference — interpret with caution" |
| <2pp | Band omitted + "Negligible absolute difference" note |

**Rationale:** Dot grids communicate proportional data intuitively without requiring
statistical literacy. The delta band makes absolute difference directly readable. Six
archetypes cover the dominant trial design types in neurology without inventing new
paradigms. Implementing all six immediately would introduce unvalidated components across
a wide surface; the canary pattern (one fully implemented, rest specified) mirrors the
GCS rebuild approach and preserves implementation velocity without foreclosing future
archetype work.

---

## Consequences

### Positive
- Trial page redesign is unblocked from the W5.2 dependency
- No new agent adds coordination or routing overhead
- Cobalt accent rule is auditable and data-driven
- Six-archetype taxonomy provides a growth path without premature implementation
- Archetype A decisions are locked in both spec and mockup — no ambiguity for Prompt 3

### Negative / risks
- Stub-ready path creates known technical debt — EXTEND must be upgraded once W5.2 lands
- Archetypes B–F unimplemented; any trial requiring them cannot use the new design until
  their archetype ships
- Winning-arm accent depends on correct `trialResult` values in `trialData.ts` — incorrect
  values produce misleading UI with no runtime guard

### Required follow-ups

- [ ] **W6.2** — Add 4 glossary entries (ARR, RRR, NNH, standalone RR) to
  `src/data/medicalGlossary.ts` before Archetype A canary merges (TRIALS_SPEC §9
  pre-condition)
- [ ] **W6.3** — Add 5 schema fields to `TrialMetadata` (`inclusionCriteria`,
  `exclusionCriteria`, `howToReadChart`, `howToInterpret`, `bedsidePearl`) before
  Prompt 3 rebuild begins (TRIALS_SPEC §11.4 / §18)
- [ ] **W5.2 upgrade** — Flag EXTEND stub entries in the W5.2 task; upgrade to full
  registry entries when W5.2 lands
- [ ] **design-guardian co-sign** — `docs/specs/mockups/trial-reference.html` and
  `docs/specs/TRIALS_SPEC.md` require formal design-guardian co-sign before the spec
  is considered locked (per design-guardian.md activation rule)
- [ ] **SEO agent** — `MedicalScholarlyArticle` JSON-LD implementation (TRIALS_SPEC §16)
  requires seo-specialist activation on Prompt 3 PR
