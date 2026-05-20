# Stroke Code Refactor — Design Plan

**Class:** D-clinical (cross-boundary refactor + clinical surface in scope)
**Status:** awaiting architect review (§17.1) before code
**Owner author:** orchestrator
**Date:** 2026-05-19
**V scope:** 2-3 sessions

## Architect review status

Reviewed by `system-architect` 2026-05-19, decision: **approve-with-conditions**.
Artifact: `docs/reviews/arch-PR-stroke-code-refactor-2026-05-19.md`. All
8 conditions folded into this plan inline below; re-review not required.

## Goals

Three V-stated objectives:

1. **Adopt the vertical-train pattern.** Stroke Code today uses 4 large
   modal-card "CodeMode" steps with custom anatomy. Every other modern
   pathway (EVT, ELAN, Status Epilepticus, Migraine) uses
   `PathwayRailStep` + `PathwayHeader` per `PATHWAY_SPEC §3`. Bring
   Stroke Code into the same family so the user gets one mental model
   across pathways.

2. **Adopt the NIHSS-style slim patient-context UI.** The current Stroke
   Code Step 1 uses big-button selectors for LKW + presenting symptoms.
   The NIHSS calculator's `PatientContextPanel` is a compact accordion
   (LKW · BP · glucose · anti-coag) that fits the bedside use-case
   better. Replace the big-button Step 1 with the slim panel.

3. **Embed NIHSS as a modal inside Stroke Code with shared state.** When
   the clinician runs Stroke Code, the NIHSS modal should be trimmed —
   no duplicated patient-context panel, no duplicated timestamps bubble.
   Stroke Code owns both. The NIHSS modal is just the score grid + LVO
   indicator. On close, NIHSS hands score + LVO back to the Stroke Code
   parent.

## Current state — `src/pages/guide/StrokeBasicsWorkflowV2.tsx`

943 lines, single component (`MainContent`), ~30 `useState` declarations.
Holds workflow mode, step 1-4 data, milestones, modal open states,
session persistence, GWTG tracking. Uses lazy-loaded `CodeModeStep1..4`
components for each step body. Has `TimestampBubble` already (the same
component standalone NIHSS now uses).

**What stays:** session persistence, GWTG milestones tracking, modal
infrastructure (thrombectomy / extended IVT / tPA reversal / orolingual
edema / hemorrhage protocol), study-mode toggle, deep-learning pearls,
copy/share. These are clinical-content surfaces, untouched by the
refactor.

**What changes:** the step-1-through-4 shell + how patient context and
NIHSS are surfaced.

## Target state — files and primitives

### New files

| File | Purpose |
|---|---|
| `src/components/article/stroke/CodeFlowV3.tsx` | New vertical-train body. Composes `PathwayRailStep` × 5 (Triage / Exam / Imaging / Decision / Orders). Replaces the inline step shell currently in `StrokeBasicsWorkflowV2.tsx`. |
| `src/contexts/StrokeCodeContext.tsx` | React Context lifting shared state — `patientContext` (LKW, BP, glucose, anticoag), `strokeTimestamps`, `nihss` (score + values + mode), `milestones`, `activeStep`. Stroke Code owns; NIHSS-embedded consumes. |
| `src/components/article/stroke/NihssEmbeddedModal.tsx` | Thin wrapper around `NihssCalculator` that mounts it as a modal, passes `embedded={true}`, captures the score+LVO via callback, closes on save. Replaces the existing `NihssCalculatorEmbed` shell. |

### Modified files

| File | Change |
|---|---|
| `src/pages/guide/StrokeBasicsWorkflowV2.tsx` | Reduced from ~943 to ~300 lines. Becomes a shell: `<StrokeCodeProvider>` wraps `<PathwayHeader>` + `<CodeFlowV3>` + the existing modal layer. Session-persist + workflow-mode-toggle logic preserved. The 30 useStates collapse into one `StrokeCodeProvider` value. |
| `src/pages/NihssCalculator.tsx` | New `embedded?: boolean` prop. When true: hides `PatientContextPanel`, hides `TimestampBubble`, hides Save Case bookmark icon, hides Footer/Disclaimer. Renders score grid + LVO + Rapid/Detailed toggle only. Exposes `onScored?: (data: { score, values, mode, severity, lvo }) => void` so the embedding parent (Stroke Code) gets the result. |
| `src/components/calculators/PatientContextPanel.tsx` | No code change — already supports being lifted from NIHSS to Stroke Code via the same `values` + `onChange` controlled-component API. Stroke Code's provider becomes the new owner. |
| `src/components/article/stroke/TimestampBubble.tsx` | No code change — already supports controlled mode via `value` + `onChange`. Stroke Code's provider owns. |
| `src/components/article/stroke/CodeModeStep1.tsx` | Retired. Replaced by Step 1 = TRIAGE in `CodeFlowV3` using `PatientContextPanel`. |
| `src/components/article/stroke/CodeModeStep2.tsx` | Retired. Step 2 = EXAM (NIHSS modal trigger + result display) + imaging trigger lifted into `CodeFlowV3`. |
| `src/components/article/stroke/CodeModeStep3.tsx` | Refactored — the eligibility-modal-trigger + decision-display content lifts into Step 4 of `CodeFlowV3`. |
| `src/components/article/stroke/CodeModeStep4.tsx` | Refactored — the orders-display content lifts into Step 5 of `CodeFlowV3`. |

### Vertical-train step shape

```tsx
<PathwayRailStep stepNumber={1} title="TRIAGE" iconKey="triage"
  nodeState={isStep1Complete ? 'completed' : activeStep === 1 ? 'active' : 'locked'}>
  <PatientContextPanel values={patientContext} onChange={setPatientContext} />
  {/* Presenting symptoms quick-select chips */}
</PathwayRailStep>

<PathwayRailStep stepNumber={2} title="EXAM" iconKey="clinical"
  nodeState={...} segmentAboveTraversed={isStep1Complete}>
  <NihssTriggerCard score={nihss?.score} onOpen={() => setNihssModalOpen(true)} />
  {/* Result inline once scored */}
</PathwayRailStep>

<PathwayRailStep stepNumber={3} title="IMAGING" iconKey="imaging" ...>
  <ImagingTriggerCard onStampCtRead={(t) => stampTimestamp('CT Read Time', t)} />
  <AspectsTriggerCard onOpen={() => setAspectsModalOpen(true)} />
</PathwayRailStep>

<PathwayRailStep stepNumber={4} title="DECISION" iconKey="decision" ...>
  <ThrombolysisEligibilityCard ... />
  <ThrombectomyEligibilityCard ... />
</PathwayRailStep>

<PathwayRailStep stepNumber={5} title="ORDERS" iconKey="decision" ...>
  <OrdersChecklist ... />
</PathwayRailStep>
```

### NIHSS embedded prop wiring

```tsx
// In NihssCalculator.tsx — new prop
interface Props {
  embedded?: boolean;
  onScored?: (data: { score: number; values: Record<string, number>; mode: 'rapid' | 'detailed'; severity: string; lvo: LvoData }) => void;
}

// When embedded === true:
//   - PatientContextPanel: not rendered
//   - TimestampBubble: not rendered
//   - CalculatorHeader saveCase prop: omitted
//   - CalculatorFooter / disclaimer block: not rendered
//   - Mode toggle, score grid, LVO indicator, drawer: rendered as-is
//   - On drawer "Copy to clipboard": replaced with "Use this score" button
//     that fires onScored() then closes the modal
//
// **Architect condition 2 — centralized conditional:** every embedded-hidden
// region uses a single `if (!embedded)` wrapper or a single `embedded ?
// X : Y` ternary at the render site. NO scattered `embedded` checks inside
// nested helpers. One conditional per hidden region. Reviewer will reject
// patches that thread `embedded` through subcomponents.
//
// **Architect condition 6 — `embeddedAction` deferred:** the "Use this score"
// CTA is hardcoded when embedded=true. If a second embedder ever appears,
// add an `embeddedAction?: { label: string; onClick: () => void }` prop at
// that point. YAGNI today — note a `// TODO(embeddedAction)` comment near
// the conditional.
```

### Shared state via Context

**Primitive choice — architect condition 1:** React Context. Decision
rationale: state has a single provider tree (Stroke Code parent → 5 rail
steps + embedded NIHSS modal), no cross-provider sharing, slices are
independent. Zustand would be over-tooling; a reducer adds boilerplate
without payoff. Matches the existing `TrialModalContext` precedent in
this codebase — not a third pattern.

`StrokeCodeContext` value shape:

```ts
interface StrokeCodeState {
  // Patient context (replaces step1Data)
  patientContext: PatientContextValues;
  setPatientContext: (v: PatientContextValues) => void;

  // Stroke timestamps (lifted from inline state)
  strokeTimestamps: StrokeTimestamps;
  setStrokeTimestamps: (v: StrokeTimestamps) => void;

  // NIHSS result (from embedded modal)
  nihss: { score: number; values: Record<string, number>; mode: 'rapid' | 'detailed'; severity: string; lvo: LvoData } | null;
  setNihss: (v: NihssResult | null) => void;

  // Step progression
  activeStep: number;
  setActiveStep: (n: number) => void;

  // GWTG milestones (preserved as today)
  milestones: GWTGMilestones;
  setMilestones: (m: GWTGMilestones) => void;
}
```

Session-persist logic moves into the provider (one `useEffect` on the
combined state). The `MainContent` 30-useState explosion collapses to
`const ctx = useStrokeCode()`.

### Session persistence — explicit serialization contract (architect cond. 3)

The legacy `neuro_stroke_workflow_v2` schema is **preserved verbatim**.
The provider does not reshape the persisted bytes. Strategy: option (c)
from the architect's review — translate in-memory ↔ legacy on the
serialization boundary, in-memory shape stays clean.

```ts
// Inside StrokeCodeProvider:
function serialize(state: StrokeCodeState): PersistedState {
  return {
    ts: Date.now(),
    workflowMode: state.workflowMode,
    activeCard: state.activeStep,           // new "step 1-5" → legacy 1-4 mapping
    step1Data: {
      lkwHours: computeLkwHours(state.patientContext.lkw),
      systolicBP: state.patientContext.systolic,
      diastolicBP: state.patientContext.diastolic,
      glucose: state.patientContext.glucose,
      weightValue: legacy.weightValue,       // unmapped legacy fields pass-through
      weightUnit: legacy.weightUnit,
      bpControlled: legacy.bpControlled,
      eligibilityChecked: state.eligibilityCheckedByUser,
      nihssScore: state.nihss?.score ?? null,
    },
    step2Data: { /* imaging step fields, mapped from new state */ },
    step4Orders: state.orders,
    eligibilityResult: state.eligibilityResult,
    milestones: serializeMilestones(state.milestones),
  };
}

function deserialize(raw: PersistedState): Partial<StrokeCodeState> {
  return {
    workflowMode: raw.workflowMode,
    activeStep: mapLegacyStepToNew(raw.activeCard),  // see condition 8
    patientContext: {
      lkw: raw.step1Data?.lkwHours != null ? deriveLkwDate(raw.step1Data.lkwHours) : undefined,
      systolic: raw.step1Data?.systolicBP ?? '',
      diastolic: raw.step1Data?.diastolicBP ?? '',
      glucose: raw.step1Data?.glucose ?? '',
      anticoag: new Set(), // legacy schema doesn't have anticoag; default empty
    },
    nihss: raw.step1Data?.nihssScore != null
      ? { score: raw.step1Data.nihssScore, /* unknowns reconstructed as null */ }
      : null,
    eligibilityResult: raw.eligibilityResult,
    milestones: deserializeMilestones(raw.milestones),
    // ... other field-by-field mappings
  };
}
```

**Test gate before Commit 1 lands:** write a Vitest snapshot test at
`src/__tests__/stroke-code-session-roundtrip.spec.ts` that loads a real
legacy session payload (captured from `localStorage` on a deployed v2
session), pipes it through `deserialize` → `serialize`, and asserts the
output is byte-for-byte identical to the input on the legacy-preserved
keys (`step1Data`, `step2Data`, `step4Orders`, `milestones`,
`eligibilityResult`). New context-only fields (e.g. `patientContext.anticoag`)
are write-only into the legacy shape — they don't round-trip but they
also don't corrupt the legacy keys.

If the round-trip test fails, Commit 1 does not merge.

## Migration plan — three commits

### Commit 1 — Foundation (no user-visible change)

- Create `StrokeCodeContext.tsx` with provider + hook
- Add `embedded` prop to `NihssCalculator.tsx` (no behavior change for
  non-embedded callers)
- Create `NihssEmbeddedModal.tsx` wrapper
- Migrate `StrokeBasicsWorkflowV2.tsx`'s state into the provider; UI
  stays on CodeModeStep1..4
- **Implement the serialize/deserialize functions** per the explicit
  contract above. Run the round-trip test.
- **Gate-pass criteria:** every existing user flow on `/pathways/stroke-code`
  works identically. tsc + build + check:claims + check:routes green.
  Session round-trip test green. Manual smoke: open Stroke Code, run
  through 4 steps, save, copy, share, reload mid-session.

### Commit 2 — Vertical train shell

- Create `CodeFlowV3.tsx` with the 5 `PathwayRailStep` blocks
- Wire each step to consume `StrokeCodeContext`
- Replace `MainContent`'s big-step rendering with `<CodeFlowV3>`
- Retire `CodeModeStep1.tsx` (replaced by Step 1 in CodeFlowV3)
- Keep CodeModeStep2/3/4 alive but as section bodies inside the new
  rail steps (their clinical content is preserved verbatim per §17.1
  duplication-risk rule)
- **Architect condition 4 — verbatim preservation enforced:** before
  this commit lands, run `scripts/diff-clinical-strings.mjs` (write as
  part of this commit) which extracts the clinical strings from the
  retired `CodeModeStep1.tsx` and asserts they appear word-for-word in
  the new rail-step body. All `data-claim` attributes and `claim()`
  calls follow the text 1:1. Diff output committed to
  `docs/reviews/clinical-preservation-stroke-code-commit2.md`.
- **Architect condition 4 — clinical-reviewer per-commit gate:** route
  the clinical-content portion of Commit 2 to `clinical-reviewer`
  before merge (not just at PR time). Each retired component is its
  own clinical-surface change.
- **Architect condition 8 — step-index migration:** bump
  `SESSION_KEY` from `'neuro_stroke_workflow_v2'` to
  `'neuro_stroke_workflow_v3'`. This invalidates legacy mid-session
  sessions on the Commit-2 deploy (mid-session sessions are rare and
  short-lived; the alternative — writing an `activeCard 1-4 → activeStep
  1-5` mapping shim — is more code for a transient concern). Document
  in the commit message + Privacy Policy is unaffected.
- **Gate-pass criteria:** same clinical content rendered, new visual
  anatomy. Vertical train highlights active step. Patient context
  panel renders slim. Step locking works. clinical-string diff is
  empty. clinical-reviewer artifact present and approve.

### Commit 3 — NIHSS embedded + cleanup

- Mount `NihssEmbeddedModal` from Step 2 in `CodeFlowV3`
- Wire the modal's `onScored` callback to `setNihss()` in context
- Inline NIHSS result display in Step 2 once scored
- Retire `NihssCalculatorEmbed.tsx` (replaced)
- Retire `CodeModeStep2.tsx` (NIHSS-trigger moved into CodeFlowV3)
- Remove the workflow's standalone `<TimestampBubble>` mount and
  `PatientContextPanel` mount — context drives both via the lifted
  state
- **Architect condition 4 — verbatim preservation enforced for retired
  CodeModeStep2/3/4:** same script as Commit 2 extends to compare
  the retired step components' clinical strings against the new rail-
  step body. Diff output committed to
  `docs/reviews/clinical-preservation-stroke-code-commit3.md`. Same
  per-commit clinical-reviewer route as Commit 2.
- **Gate-pass criteria:** open Stroke Code → tap NIHSS in Step 2 →
  embedded modal opens with only the score grid + LVO + mode toggle
  → no duplicate patient context, no duplicate timestamps → tap "Use
  this score" → modal closes, Step 2 inline display shows the score →
  rest of pathway works. clinical-string diff empty. clinical-reviewer
  artifact present and approve.

## Out of scope

- Stroke Code Save Case rollout — V deferred ("we will revisit that
  when we rebuild them"). The pathway-save infrastructure is intact;
  the per-pathway buildData payload design is still V's call.
- Adding Save Case to the other pathways (ELAN, EVT, Status, Migraine)
  — same reason.
- Per-calc reload for EM Billing Calculator — V confirmed not needed.
- Mobile-specific layout refinements beyond what `PathwayRailStep`
  already gives (mobile-first-developer reviews per Core 6).
- Performance-driven code-split of the modal layer — defer to the
  performance skill if Lighthouse scores degrade.
- **PathwayBottomDrawer convergence (architect cond. 5):** Stroke Code
  keeps its current inline bottom drawer. Converging to
  `CalculatorDrawer` (which EVT has migrated to) is a separate Class D
  refactor touching the same delicate clinical-content surface and
  would muddy this PR's three-commit revert story. Open as a follow-up
  task after these three commits land.

## Rollback plan

Each commit is independently revertable via `git revert <sha>` because
the migration is layered:
- Commit 1 revert: lose the context, revert to inline state (mechanical
  diff, no clinical content loss).
- Commit 2 revert: lose CodeFlowV3, restore CodeModeStep1's big-button
  layout, keep context. Clinical content preserved verbatim.
- Commit 3 revert: lose embedded NIHSS, restore NihssCalculatorEmbed +
  the standalone TimestampBubble / PatientContextPanel mounts.

Session persistence schema is unchanged across commits (still
`step1Data`, `step2Data`, `step4Orders`, `milestones`, `eligibilityResult`
keys in `neuro_stroke_workflow_v2`). Existing sessionStorage rows from
users mid-pathway are forward-compatible.

## Acceptance criteria

Per §15:

- **User-visible goal:** "When I open a stroke code, I see a clean
  vertical train of steps like the EVT pathway. The patient-context
  block is the slim NIHSS-style panel. When I run NIHSS, the modal
  shows only the score grid — no duplicated patient info or
  timestamps. The score I get back flows back into the Stroke Code
  step and I can continue."
- **Non-goals:** new clinical content; new dosing logic; pathway
  Save-Case rollout; per-pathway buildData design.
- **Acceptance checks:**
  - tsc + build + check:claims + check:routes green per commit
  - Manual smoke per gate-pass criteria above
  - `/pathways/stroke-code` renders the train on first load
  - NIHSS modal shows score grid + LVO + mode only when embedded
  - Patient context entered in Step 1 persists into Step 4
  - Stamping CT Read in Step 3 lights up Code Activation +12m offset
    in the existing TimestampBubble (which is now lifted)
  - Session persistence still resumes the workflow on reload
  - Existing thrombectomy / extended IVT / tPA reversal / orolingual
    edema / hemorrhage modals still launch as before
- **Clinical impact:** none (no clinical content change; pure UX
  refactor preserving every clinical claim verbatim).
- **Class boundary trigger (architect cond. 7):** the D-clinical
  classification holds **only if** the verbatim-preservation gate
  (architect cond. 4) passes for every commit. If the clinical-string
  diff is non-empty for any commit, that commit is automatically
  promoted to **Class E** and requires the full E gating per
  CLAUDE.md §6 (medical-scientist authoring + pre-execution
  clinical-reviewer approval + citation re-anchoring if any claim
  surface changed). Reviewer rejects any commit attempting to merge
  with a non-empty clinical diff under the D-clinical class.
- **Rollback plan:** layered git revert per commit, see above.

## Files outside this plan but mentioned

- `docs/specs/PATHWAY_SPEC.md` — design contract for `PathwayRailStep`,
  `PathwayHeader`, `PathwayBottomDrawer`. The refactor must conform.
- `src/components/calculators/PatientContextPanel.tsx` — donor
  component, no code change needed; just a new consumer (Stroke Code
  instead of NIHSS).
- `src/components/article/stroke/TimestampBubble.tsx` — donor
  component, no code change; controlled-mode API already exists.
