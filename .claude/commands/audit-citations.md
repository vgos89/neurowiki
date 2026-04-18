---
name: audit-citations
description: List citations stale past their review window per §13.7.
  Create re-review tasks in TASKS.md. Dependency on citation registry
  (Wave 5); returns graceful stub until registry ships.
---

Skip this command for: repos where src/lib/citations/ has not yet been implemented (Wave 5).

## Behavior

On invocation:

1. Check for both citation registry dependencies:
   - `src/lib/citations/registry.ts` — citation entries
   - `src/lib/citations/claims.ts` — CLAIM_REGISTRY (claim-to-citation mapping)
   - If either file is missing (Wave 5 not yet shipped), report:
     "Citation registry not yet implemented (Wave 5). Audit requires
     `src/lib/citations/registry.ts` and `src/lib/citations/claims.ts`
     per CLAUDE.md §13.2. Command will be fully functional after Wave 5
     ships. No action taken."
     Stop.
   - If both present: proceed to step 2.

2. Read `registry.ts`. For each citation entry, check `last_reviewed` against the §13.7 freshness matrix (see Parsing rules). Apply `review_window_months` per-citation override first; fall back to source-type default if no override is set.

3. For each stale citation, collect:
   - Citation ID
   - Source type
   - `last_reviewed` date
   - Days past window
   - Dependent claims — claim IDs from `CLAIM_REGISTRY` whose citation array includes this citation ID

4. Check `TASKS.md` for an existing `blocked:awaiting-review` entry for each stale citation. If no task exists, draft a P1 task entry with the §13.6 six-step checklist embedded verbatim:

   ```
   - [ ] [P1] Refresh citation <citation-id> — blocked:awaiting-review
     last_reviewed: <date> (<days> days past <N>-month window for <source type>)
     Dependent claims: <claim-id-1>, <claim-id-2>, ...
     Walk §13.6 refresh checklist before updating last_reviewed:
       1. Source still resolves — URL or PMID works, text unchanged from when cited
       2. Guideline version current — year/section matches current published version
       3. Dependent claims consistent — all claims still accurately reflect this citation
       4. No wording drift — claim text hasn't drifted from what the evidence says
       5. Newer evidence considered — conflicting or updating literature reviewed and
          either incorporated or explicitly rejected with rationale
       6. Dual sign-off — medical-scientist confirms semantic correctness;
          clinical-reviewer is the final gate
     Do not update last_reviewed until all six steps confirmed.
   ```

5. Report all drafted tasks to V. On one-word approval, append to `## PENDING` / `### OTHER P1` in `TASKS.md`. For each newly drafted task, add `blocked:awaiting-review` alongside the entry so the pre-commit hook does not fail during the review period (per §13.5).

6. If stale citations found, close with exactly:
   "<N> stale citations flagged. <M> tasks created. Run /audit-citations again after refresh to confirm all windows are current."

7. If no stale citations found, close with:
   "All citations within review window per §13.7. No action needed."

## Parsing rules

**Registry dependencies (both required):**
- `src/lib/citations/registry.ts` — Citation objects; schema per §13.2
- `src/lib/citations/claims.ts` — `CLAIM_REGISTRY: Record<string, string[]>` mapping claim IDs to citation ID arrays
- If either is missing, return the pre-Wave-5 stub. Do not attempt a partial audit.

**Freshness matrix per §13.7:**

| Source type | Default window |
|---|---|
| Current clinical guidelines (AHA/ASA, AAN, ESO) | 6 months |
| Rapidly evolving areas (thrombectomy indications, emerging therapies) | 3 months |
| Management / treatment recommendations | 6 months |
| Drug dosing, contraindications | 6 months |
| Calculator formulas (NIHSS, GCS, ASPECTS, mRS) | 24 months |
| Landmark trials (historical, foundational) | 36 months |

**Source type → window mapping:**
- `review_window_months` per-citation override is authoritative — apply first, supersedes all defaults
- Fallback by Citation schema `source` field:
  - `"guideline"` → 6 months (conservative default; rapidly-evolving guidelines must carry explicit `review_window_months: 3`)
  - `"trial"` → 36 months
  - `"review"` → 6 months
  - `"textbook"` → 36 months
- When a `"guideline"` entry has no override and is flagged stale, add to output: "No `review_window_months` override — 6-month default applied. Set `review_window_months: 3` if this is a rapidly-evolving area."

**Dependent claim lookup:** Scan `CLAIM_REGISTRY` for all claim IDs whose value array includes the stale citation ID.

**Task slug:** `refresh-citation-<citation-id-in-kebab-case>`

**Priority:** P1 — citation staleness is high-priority per §13.1 ("confident-but-wrong" failure mode).

## Failure behavior

- **Registry missing (pre-Wave-5)** — Graceful stub message (step 1). No error thrown. Stop.
- **Registry present but unreadable** — "Read error on `src/lib/citations/registry.ts` or `claims.ts`. Inspect the file manually before re-running." Do not attempt a partial audit on whichever file is readable.
- **`TASKS.md` unwritable** — Report all drafted task entries in output. Ask V to append them manually. Do not silently discard (per §22 failure behavior: "console report, ask V to commit manually").
- **All stale citations already tracked** — Report count of already-`blocked:awaiting-review` citations, state no new tasks were created. Do not create duplicate entries.
- **Freshness window ambiguous** — Apply source-type default; never guess. Note the ambiguity in output with the `review_window_months` reminder.

## Output format

- Plain text. No emoji.
- Stale citations: one structured entry per citation — ID, source type, `last_reviewed`, days overdue, dependent claims.
- Drafted task entries shown in a code block before appending to `TASKS.md`.
- Pre-Wave-5 stub: 3 lines, no code block.
- Under 30 lines for a registry with few stale citations; scales with count, no truncation.
