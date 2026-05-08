# Clinical Claim Surfaces — NeuroWiki

> Extracted from CLAUDE.md §13.3 and §13.4. These rules are part of the CLAUDE.md governance tier (§3). See CLAUDE.md §3 for conflict resolution.

---

## §13.3 Claim surfaces — where claims can live

Clinical claims appear in many places, not just static JSX. **Any user-facing medical statement is a claim surface.** If a clinician reads it and could act on it, it needs tagging. Known surfaces in this codebase:

- Static JSX text (`<p>IV tPA is indicated...</p>`)
- String literals inside components (`const recommendation = "..."`)
- Structured data in `src/data/*.ts` and `src/data/trials/*.ts`
- Calculator interpretation output (strings returned from scoring functions)
- Template strings and interpolated copy
- Markdown content (if `.md` files render clinical content)
- Tooltip, modal, dialog text
- JSON content blobs
- Derived language assembled from multiple pieces (e.g., `${severity} stroke requires ${action}`)
- Chart labels, table cells, badge text

**When a new claim surface appears that is not covered by existing scanner handlers:**

1. The task is **blocked** until a tagging strategy is added for that surface.
2. `data-architect` owns extending the scanner (§13.5) with the new handler.
3. Content on an unrecognized claim surface **cannot merge**. This is a hard rule.
4. The task's status becomes `blocked:awaiting-scanner-support` until §13.4 is updated *and* the hook is updated *and* tested on the new surface.

This prevents false-sense-of-coverage — the biggest failure mode of automated claim checking.

---

## §13.4 Claim tagging by surface

Different surfaces, different tagging mechanisms. All converge on the same registry. The scanner ships in phases — some surfaces are Phase 1 (shipped), others are roadmap.

| Surface | Tagging method | Phase |
|---|---|---|
| Static JSX | `data-claim="claim-id"` attribute on the element | 1 |
| Structured data in `src/data/` | Adjacent `claimId: string` field on the object | 1 |
| Computed strings from functions | Wrap return with helper: `claim(text, "claim-id")` from `src/lib/citations/claim.ts` | 2 |
| Markdown | HTML comment preceding the clinical paragraph: `<!-- @claim: claim-id -->` | 2 |
| JSON content blobs | `claim_id` field alongside the text field | 2 |
| Template strings / derived language | Tag at the composition site, not the fragments | 3 |

The pre-commit hook scans all shipped phases. A new surface type requires a new tagging strategy added to the hook before claims can ship on that surface (§13.3).

---

## Clinical surface file paths (for hook guard)

Files under these paths are clinical surfaces and require Class E or `-clinical` task classification before edit:

- `src/data/trialData.ts`
- `src/data/trialCatalogMeta.ts`
- `src/data/trials/`
- `src/lib/citations/`
- `src/pages/guide/`
- `src/pages/calculators/`
- `src/components/calculators/`
- `src/components/article/`
- `src/data/strokeClinicalPearls.ts`
