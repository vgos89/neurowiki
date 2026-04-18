# ADR-002 — Citation and Claim Schema Foundation

**Date:** 2026-04-17
**Status:** Accepted

## Context

NeuroWiki is a clinical decision-support tool. Every user-facing medical statement is a potential patient-safety claim. The GCS Calculator rebuild (ADR-001) exposed three structural gaps:

1. **No citation infrastructure.** The clinical-reviewer's Wave 5 deviation note in `docs/reviews/clinical-PR-gcs-rebuild.md` documents that `CLAIM_REGISTRY`, `src/lib/citations/registry.ts`, and `src/lib/citations/claims.ts` do not exist. The GCS clinical review was performed without `quoted_text` verification (mandatory-block condition 4 per `clinical-reviewer.md`) and without formal `last_reviewed` tracking. The reviewer noted: "This is a structural gap, not a pass."

2. **No claim surface tracking.** CLAUDE.md §13.3 defines claim surfaces — where clinical claims can appear. Without a schema, the pre-commit scanner (§13.5) cannot be built and the hook cannot run.

3. **No `definition` source type.** CLAUDE.md §13.2 lists four source types (`guideline`, `trial`, `review`, `textbook`). The ACRM 1993 TBI classification criteria fit none of these cleanly — they are a consensus classification definition, not a guideline, trial, review, or textbook. A fifth type is needed.

Wave 5 resolves all three gaps across five sessions (W5.1–W5.5).

## Decision

Create `src/lib/citations/schema.ts` with five TypeScript types:

- **`CitationSourceType`** — union of five source types: `guideline | trial | review | textbook | definition`. `definition` is a deliberate extension beyond CLAUDE.md §13.2 (which lists 4 types). Rationale: the ACRM 1993 TBI classification criteria surfaced in the GCS clinical review did not fit any existing category — they are a consensus classification definition, not a guideline, trial, review, or textbook. `definition` resolves this ambiguity and provides a home for other consensus criteria (e.g., AAN 1994 neurological classifications). Default review window: 6 months (consensus definitions evolve with guideline updates). CLAUDE.md §13.2 should be updated to reference this ADR after W5.2 ships.

- **`Citation`** — interface with all fields from §13.2, with two deliberate deviations from the `§13.2` inline example:
  - `quoted_text` is **required** (not optional). Clinical-reviewer's mandatory-block condition 4 cannot be evaluated without it. Making it required at the type level eliminates the possibility of a citation entering the registry without a semantic anchor.
  - No deviation to `source` field — the five-value union is an extension, not a contradiction.

- **`ClaimSurface`** — discriminated union of five surface types corresponding to the five tagging mechanisms in §13.4 (Phase 1: `jsx`, `data`; Phase 2: `computed`, `markdown`, `json`). The scanner (W5.3) will validate each arm independently.

- **`ClaimEntry`** — richer than the §13.2 inline example (`Record<string, string[]>`). Adds `surfaces` (required) and `description` (optional) alongside `citation_ids`. `citation_ids` is an array supporting many-to-many relationships; primary citation listed first. `surfaces` is required — every claim must declare where it appears so the scanner can cross-check.

- **`CitationRegistry`** and **`ClaimRegistry`** — type aliases (`Record<string, Citation>` and `Record<string, ClaimEntry>`) as convenience types for the registry and claims modules.

Create `src/lib/citations/claim.ts` with the `claim(text, claimId)` helper:
- Returns `text` unchanged at runtime.
- In development mode, emits `console.warn` for unregistered claim IDs.
- Imports `CLAIM_REGISTRY` from `./claims`.

Create `src/lib/citations/claims.ts` as a stub exporting an empty `CLAIM_REGISTRY`. This keeps main buildable across the W5.1/W5.2 boundary. W5.2 replaces the stub with real registry entries as clinical content is migrated from inline code comments to formal registry. Until W5.2 lands, every `claim()` invocation in development mode will warn (registry is empty) — this is expected behavior, not an error.

## Rollback

`git revert <W5.1-commit-sha>`. No existing files are modified in W5.1 — all changes are new files. No downstream consumers exist until W5.2 creates `claims.ts` and `registry.ts`. Rollback is clean and side-effect-free. Production is unaffected (the `src/lib/citations/` module is unused until W5.5+).

## Consequences

**Easier:**
- W5.2 (registry + claims) and W5.3 (scanner) have a typed foundation to build against.
- `quoted_text` required at the type level means `tsc` enforces citation completeness — a citation without a semantic anchor cannot be registered.
- The `definition` source type resolves the ACRM 1993 ambiguity and provides a home for other consensus criteria (e.g., AAN 1994 for other neurological classifications).
- The `ClaimEntry.surfaces` field enables the scanner to validate tagging method against declared surface type, reducing false positives.

**More difficult:**
- `ClaimEntry` is richer than the §13.2 `Record<string, string[]>` example. Any future session that reads §13.2 and implements claims against the simpler example will produce a type error — CLAUDE.md §13.2 should be updated to reference this ADR after W5.2 ships. Tracked in TASKS.md.
- `quoted_text` required means backfilling existing citations is a blocking prerequisite — no citation can enter the registry without providing an exact quote. This is intentional friction.

## Scope

- `src/lib/citations/schema.ts` (new) — 5 exported types
- `src/lib/citations/claim.ts` (new) — `claim()` helper
- `src/lib/citations/claims.ts` (new) — stub `CLAIM_REGISTRY`, replaced in W5.2
- `docs/adrs/ADR-002-citation-schema.md` (this file)
- `docs/reviews/arch-PR-W5-1-citation-schema.md` — architect review artifact (approve)
