# Architect review — Heidelberg Bleeding Classification rebuild

**Decision:** approve-with-conditions
**Reviewed:** pre-flight plan + current repo state + reference implementations (GCS, ICH Score) + Heidelberg data module + routeManifest + link-graph
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-04-21
**Task class:** D-clinical
**Scope:** Full structural rebuild of src/pages/HeidelbergBleedingCalculator.tsx against CALCULATOR_SPEC.md v1.1 Archetype 1. Medical-scientist clinical review of SEVERITY_MAP completed (3c SAH revised to high; 4 red, 2 amber, 2 slate). V decision: keep scope callout as Archetype 1 deviation.

## Rationale

This is a high-value, low-risk rebuild. Heidelberg has the smallest delta-to-compliance of the 7 pre-spec calculators per L5.5: the data module already has a proper citation export, typed inputs, and per-class result prose; the component uses neuro accent tokens correctly; null-initial-state is already in place. The remaining gaps — grid-card → divide-y layout, dark: removal, border-2 removal, Portal drawer, severity token mapping — are exactly the pattern the GCS and ICH Score rebuilds established. No novel infrastructure is required.

The one genuinely structural question — whether to adapt the data module's non-canonical `HeidelbergResult` in the component or extend the data module with a canonical export — is resolved below in favor of an additive data module extension. This is the correct call because §8 of the spec explicitly forbids inlining scoring logic in the component, and the clinical categorization (SEVERITY_MAP) is domain knowledge that belongs next to the classification prose it's derived from, not separated into the presentation layer.

The decisions below preserve clinical prose byte-for-byte, preserve the existing public API of the data module, and establish a pattern that future non-numeric-score calculator rebuilds (Boston Criteria, future classification tools) can reuse.

## Decisions

### Q1 — Shape adapter placement: extend data module (additive)

**Chosen:** Extend `src/data/heidelbergBleedingData.ts` with a new additive export `calculateHeidelberg(inputs: HeidelbergInputs): HeidelbergCalculatorResult`. Existing exports (`HEIDELBERG_CITATION`, `HEIDELBERG_OPTIONS`, `RESULT_MAP`, `classifyHeidelbergBleeding`, `HeidelbergResult`, `HeidelbergInputs`, `HeidelbergClass`) remain untouched.

**Why:**
- CALCULATOR_SPEC.md §8: *"Score data file exports a typed calculateScore(inputs): CalculatorResult function; never inline scoring logic in the component."* An in-component adapter would violate this.
- User's "preserve as-is" instruction is honored: existing exports are byte-for-byte unchanged. Adding new exports is additive, not a modification.
- GCS and ICH both own their calculation in the data module (`calculateGCS`, `calculateICHScore`). A component-local adapter for Heidelberg would be the only Archetype 1 calculator that breaks this pattern.
- Only one consumer (the component itself) imports from this file — confirmed by grep. The extension is risk-free.

**Data module extension shape:**
```typescript
// New additive exports — existing API preserved
export type HeidelbergSeverity = 'low' | 'moderate' | 'high';

export const HEIDELBERG_SEVERITY_MAP: Record<HeidelbergClass, HeidelbergSeverity> = {
  '1a': 'low', '1b': 'low',
  '1c': 'moderate', '3d': 'moderate',
  '2': 'high', '3a': 'high', '3b': 'high', '3c': 'high',
};

export interface HeidelbergCalculatorResult {
  classification: string;    // passthrough from HeidelbergResult
  shortLabel: string;        // passthrough
  severity: HeidelbergSeverity;
  label: string;             // drawer header left — derived from classification
  stat: string | null;       // drawer header right — SICH status or null
  interpretation: string;    // drawer headline — passthrough from clinicalSignificance
  explanation: string;       // drawer paragraph — passthrough from managementNote (already SICH-adjusted)
  seeAlso: string[];         // link-graph node IDs
}

export function calculateHeidelberg(inputs: HeidelbergInputs): HeidelbergCalculatorResult;
```

Internally `calculateHeidelberg()` calls `classifyHeidelbergBleeding()` to get the base result (this is where the SICH prose append happens — preserving that logic byte-for-byte), then derives severity and seeAlso. No prose strings are modified.

### Q3 — SEVERITY_MAP location: data module

**Chosen:** `HEIDELBERG_SEVERITY_MAP` lives in `src/data/heidelbergBleedingData.ts` as an exported const.

**Why:**
- Clinical categorization is domain knowledge. It should live next to the classification prose it's derived from.
- Co-location reduces drift: if the classification is ever revised, prose and tier live in one file, one review, one clinical sign-off.
- Medical-scientist approved the mapping as clinical categorization; making it a presentation concern by placing it in the component would misrepresent its nature.
- Pattern consistency: GCS and ICH severity thresholds live in their data modules (`getSeverity()` function). Heidelberg's map is the categorical analog.

### Scope callout — approved Archetype 1 deviation

**Chosen:** Retain the amber-tinted scope callout ("This classification is for hemorrhagic transformation after ischemic stroke and reperfusion therapy. It is not for spontaneous ICH location.") at top of `<main>`, before the first divide-y section.

**Rationale (V):** Clinical-safety boundary. A user who treats a spontaneous ICH patient with Heidelberg would be applying the wrong tool. This is a misuse-prevention warning, not a UX preference.

**Spec conformance:** CALCULATOR_SPEC.md v1.1 Archetype 1 (§2) does not define a slot for top-of-main clinical-safety callouts. The spec anatomy is: sticky header → space-y-10 sections → footer → drawer. This callout sits between the sticky header and the first `<section>` with `space-y-10`.

**Anatomy (to document in ADR-004):**
```html
<main class="max-w-2xl mx-auto px-5 pt-6 pb-4">
  <!-- Scope callout — approved Archetype 1 deviation -->
  <div class="mb-6 pl-3 border-l-2 border-amber-400">
    <div class="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Scope</div>
    <p class="text-sm text-slate-700 leading-relaxed">
      This classification is for hemorrhagic transformation after ischemic stroke and
      reperfusion therapy (tPA or thrombectomy). It is not for spontaneous ICH location.
      Use brain imaging within 48 hours of reperfusion and as needed for new symptoms.
    </p>
  </div>

  <div class="space-y-10"><!-- standard sections --></div>
  ...
</main>
```

The callout reuses the §4.5 "Important" anatomy (`pl-3 border-l-2 border-amber-400`) for visual consistency. No new tokens, no new patterns — just reuse of an existing slot type in a new position.

**Future applicability:** This pattern should be added to the spec in a future amendment as an approved deviation: "Archetype 1+Scope" variant, applicable when a calculator has a clinical-safety scope constraint that must be visible before any input. Candidates include Boston Criteria CAA ("not for <50 years") and future classification tools.

### Link-graph node promotion

**Chosen:** In scope for this PR.

Current state: `calc/heidelberg` is in the `stubs` array of `docs/link-graph.json` and appears as a reference from `calc/ich-score`. No node definition exists.

Target state:
```json
"calc/heidelberg": {
  "type": "calculator",
  "title": "Heidelberg Bleeding Classification — Hemorrhagic Transformation",
  "route": "/calculators/heidelberg-bleeding-classification",
  "references": ["calc/nihss"],
  "referencedBy": ["calc/ich-score"]
}
```

- `references: ["calc/nihss"]` — the SICH prose in `managementNote` references NIHSS deterioration threshold ("≥4 pt NIHSS increase"). This is the clinically natural outbound link.
- `referencedBy: ["calc/ich-score"]` — confirmed by existing graph state; `calc/ich-score` lists `calc/heidelberg` in its `references` array.
- Remove `"calc/heidelberg"` from the top-level `stubs` array.

This enables the drawer's "See also" section to render `calc/nihss` as a live link (§5.1, §7.3). Stub-node check still passes.

## Rubric

**1. Duplication risk — PASS.**
Zero duplication. `calculateHeidelberg()` wraps the existing `classifyHeidelbergBleeding()` function rather than reimplementing it. SICH prose append logic continues to live in one place. No inline scoring or classification logic in the component.

**2. Boundary integrity — PASS.**
Clean split. Data module owns: citation, classes, SEVERITY_MAP, classification function, canonical calculator function. Component owns: state management, drawer state machine, keyboard navigation, clipboard, analytics, presentation. No clinical content lives in the component.

**3. Composability — PASS.**
The rebuild structurally clones the GCS/ICH Archetype 1 template (imports, Portal drawer, discovery animation, roving tabindex, SEVERITY_TOKENS, sub-components). A future Archetype 1 rebuild (ABCD2, RoPE) can copy this file and replace only the data module imports and radiogroup content. The scope-callout deviation is additive — calculators without a scope constraint simply omit it.

**4. State locality — PASS.**
All state is component-local (`useState` for inputs, drawerOpen, justCompleted, toastMessage; `useRef` for radiogroup refs and wasCompleteRef). No new global state, no new hooks, no external store. Matches GCS/ICH exactly.

**5. Dependency weight — PASS.**
Zero new npm packages. All dependencies already present in the repo: react, react-dom (for createPortal), react-router-dom (for Link), lucide-react (for Star, RefreshCw icons), existing hooks (useNavigationSource, useFavorites, useCalculatorAnalytics), existing utils (copyToClipboard). Pure code reuse of the GCS/ICH template.

**6. Migration exit — PASS.**
Three clean exit paths:
(a) Component-only revert: `git revert` the component commit leaves the data module extension in place as dead code (removable later) but does not break existing behavior. The legacy component could be temporarily restored by reverting if needed.
(b) Full revert: revert both the data module extension and the component rebuild. The existing `classifyHeidelbergBleeding()` API remains untouched throughout, so there is no schema rollback required.
(c) SEVERITY_MAP revision: if medical-scientist later revises the mapping (e.g., 3d → high), only the data module const changes. The component reads the mapping through `calculateHeidelberg().severity` and needs no changes.

## Required follow-ups

- **ADR-004** must document the scope callout as an approved Archetype 1 deviation, with anatomy (token classes, position, color palette) and applicability criteria (clinical-safety scope constraints). This makes the deviation reusable and auditable.
- **Additive extension verification:** Before Phase 6 QA, confirm that `diff` between old and new `src/data/heidelbergBleedingData.ts` shows only additions (no deletions, no modifications to existing exports). `classifyHeidelbergBleeding`, `HEIDELBERG_CITATION`, `HEIDELBERG_OPTIONS`, `RESULT_MAP`, and all type exports must be byte-for-byte unchanged.
- **Link-graph orphan check:** After updating link-graph.json, confirm no other nodes reference `calc/heidelberg` as a stub (the `stubs` array entry is being removed). `calc/ich-score` already references it as a node — should pass.
- **Clinical review post-execution diff:** clinical-reviewer Phase 5 must diff the 8 classification entries, the SICH append string, and the HEIDELBERG_CITATION object to confirm zero prose drift. A `git diff src/data/heidelbergBleedingData.ts` that shows only additions at the bottom of the file satisfies this.
- **Scope callout prose preservation:** The existing scope callout text is preserved byte-for-byte. If Content Writer wants to revise it later, that is a separate Class C-clinical task.

## Blocking issues

None.

## Sign-off

Approved for Phase 3 (clinical-reviewer pre-execution gate). Medical-scientist has approved the SEVERITY_MAP (3c revised to high). V has approved the scope callout retention. Architect decisions on Q1 (data module extension) and Q3 (SEVERITY_MAP in data module) are settled. Implementation can proceed once clinical-reviewer pre-execution gate passes.
