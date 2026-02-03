# EVT Pathway Progression Audit

**Date:** 2026-02-02  
**Scope:** Endovascular Thrombectomy (EVT) pathway automatic progression and step flow.  
**Files:** `src/pages/EvtPathway.tsx`, `src/components/article/stroke/ThrombectomyPathwayModal.tsx`

---

## Executive Summary

| Metric | Value |
|--------|--------|
| **Total steps in pathway** | 4 (Triage → Clinical → Imaging → Decision) |
| **Broken progressions found** | 1 (Next from collapsed state) |
| **Manual-only points that are OK** | Next/Back buttons (intentional manual fallback) |
| **Working auto-progressions** | 3 (Section 0→1, 1→2, 2→3 when section becomes complete) |

**Note:** The app implements an **eligibility-screening pathway** (4 steps with auto-advance when criteria are complete), not a 6-step “Activation → Checklist → Procedure → Orders → Summary” workflow. Auto-progression is already implemented for the existing flow; one edge case and several UX improvements are documented below.

---

## Phase 1: Pathway Flow Mapping

### Expected vs Actual Flow

The **requested** flow (Entry → Eligibility → Activation → Checklist → Procedure → Orders → Summary) does not exist in code. The **actual** pathway is a 4-step **eligibility calculator** with automatic advance when the current section’s required fields are complete.

### ACTUAL EVT PATHWAY FLOW

| Step | Name | Current behavior | Expected behavior | Status |
|------|------|------------------|-------------------|--------|
| **0** | **Triage** | User selects occlusion type (LVO/MeVO), location, LVO confirmation, mRS, age (or MeVO location, dependence). Result updates live. When `isSection0Complete` becomes true, `useEffect` runs and `setActiveSection(1)` after 280 ms. | Auto-advance to Clinical when Triage is complete. | ✅ Working |
| **1** | **Clinical** | User selects time window, NIHSS (and MeVO disabling). When `isSection1Complete` becomes true, `setActiveSection(2)` after 280 ms. | Auto-advance to Imaging when Clinical is complete. | ✅ Working |
| **2** | **Imaging** | User enters ASPECTS/pc-ASPECTS, core/mismatch (or MeVO salvageable/technical). When `isSection2Complete` becomes true, `setActiveSection(3)` after 280 ms. | Auto-advance to Decision when Imaging is complete. | ✅ Working |
| **3** | **Decision** | Result (Eligible / Not Eligible / Consult / etc.) and details. Buttons: “Copy to EMR” or custom “Return to Stroke Workflow” (in modal); “Start Over”. No further step. | Final step; no auto-advance. | ✅ Working |

**Additional behavior**

- **Collapsing a section:** Clicking the active section header sets `activeSection` to `-1` (no section expanded). Content is hidden; progress bar and buttons remain.
- **Next from collapsed (`activeSection === -1`):** `handleNext` does `prev + 1` → `0`. So “Next” opens **Triage** instead of the next logical step (e.g. Decision if user was on Imaging). **Status:** ❌ Broken for “collapse then Next” flow.
- **Back:** Always goes to previous index (or 0). When `activeSection === -1`, Back sets section to 0. Acceptable.
- **Scroll:** On `activeSection` change, main scrolls to top. Newly expanded section may be off-screen on long pages. **Status:** ⚠️ Partial (scroll to top only).

---

## Phase 2: Broken Progressions

### Buttons Audited

| Button | Location | onClick | State update | Auto-advance | Verdict |
|--------|----------|--------|-------------|--------------|---------|
| **Next** | Action bar (sections 0–2) | `handleNext` | `setActiveSection(prev => Math.min(3, prev + 1))` | N/A (manual) | ✅ OK |
| **Back** | Action bar | `handleBack` | `setActiveSection(prev => Math.max(0, prev - 1))` | N/A | ✅ OK |
| **Copy to EMR** / **Return to Stroke Workflow** | Section 3 | `copySummary` / `customActionButton.onClick` | Copy or close modal | N/A (final) | ✅ OK |
| **Start Over** | Section 3 | `handleReset` | Resets inputs and `setActiveSection(0)` | N/A | ✅ OK |
| **Section header (collapse)** | Any section | `onToggle` | `setActiveSection(prev === current ? -1 : current)` | — | Leads to broken “Next” (see below) |

### BROKEN PROGRESSION

| Item | Detail |
|------|--------|
| **Button / action** | User collapses current section (clicks section header), then clicks “Next”. |
| **Step** | Any (0, 1, or 2) when collapsed. |
| **Current** | `activeSection === -1`. `handleNext` runs `setActiveSection(-1 + 1)` → `setActiveSection(0)`. Triage opens. |
| **Missing** | “Next” should open the *next logical* step (e.g. if user was on Imaging and collapsed, Next should go to Decision), or at least the first *incomplete* step, not always Triage. |
| **Fix** | When `activeSection === -1`, set next section from completion state (e.g. first incomplete section or Decision). See Phase 5. |
| **Priority** | **High** (confusing when user collapses then clicks Next). |

---

## Phase 3: Progression Patterns

### Pattern 1: Auto-advance when section complete

**Status:** ✅ Present.

- **Where:** `EvtPathway.tsx` lines 536–554.
- **Logic:** `useEffect` depends on `activeSection` and `isSection0Complete` … `isSection2Complete`. When current section *just* becomes complete (`!prevCompleteRef.current.s0` etc.), it sets the ref and `setTimeout(() => setActiveSection(next), 280)`.
- **Note:** `prevCompleteRef` prevents re-advance when user clicks Back and the section is still complete.

### Pattern 2: Conditional advance (eligible vs not)

**Status:** N/A for this pathway.

- Eligibility is computed continuously; there is no single “Confirm Eligibility” button. Auto-advance is purely “section complete → next section.” Not eligible vs eligible is reflected in the Decision step content, not in different next steps.

### Pattern 3: Form completion + validation then advance

**Status:** ✅ Present (implicit).

- Completion is defined by `isSection0Complete`, `isSection1Complete`, `isSection2Complete` (required fields). When the last required field is set, the section becomes complete and the effect advances after 280 ms. No explicit “Submit” or “Confirm” button; advance is driven by state.

### Pattern 4: Progressive disclosure / scroll to next

**Status:** ⚠️ Partially implemented.

- **Present:** Sections are collapsible; expanding is controlled by `activeSection`. On section change, `useEffect` scrolls `main` to top (line 417).
- **Missing:** No scroll-to-newly-expanded-section (e.g. scroll the active `CollapsibleSection` into view). Optional: smooth scroll to the opened section for long pages.

### Summary

| Pattern | Status | Notes |
|---------|--------|--------|
| Auto-advance after action | ✅ Present | Section complete → advance after 280 ms |
| Conditional advance | N/A | No separate “eligible → activation” branch |
| Form completion advance | ✅ Present | Driven by completion flags |
| Progressive disclosure / scroll | ⚠️ Partial | Scroll to top only; no scroll-to-section |

---

## Phase 4: Critical Progression Points

| # | Point | Status | Notes |
|---|--------|--------|--------|
| **1** | Eligibility → “Activation” | N/A | No separate Activation step; Triage complete → auto-advance to Clinical. ✅ Working. |
| **2** | “Activation” → Checklist | N/A | No Activation or Checklist steps; Clinical complete → auto-advance to Imaging. ✅ Working. |
| **3** | Checklist → “Procedure” | N/A | Imaging complete → auto-advance to Decision. ✅ Working. |
| **4** | “Procedure” → Orders | N/A | Decision is final; no Procedure/Orders steps. ✅ As designed. |
| **5** | Orders → Summary | N/A | Decision step shows result and Copy/Return; no separate Summary step. ✅ As designed. |
| **6** | Collapsed state → Next | ❌ Broken | Next from `activeSection === -1` goes to 0 (Triage). Should go to next logical or first incomplete section. |

---

## Phase 5: Fix Recommendations

### FIX #1: “Next” from collapsed state (`activeSection === -1`)

**FILE:** `src/pages/EvtPathway.tsx`  
**LOCATION:** `handleNext`, ~line 441.

**CURRENT CODE:**

```tsx
const handleNext = () => { setActiveSection((prev) => Math.min(3, prev + 1)); };
```

**FIXED CODE:**

```tsx
const handleNext = () => {
  setActiveSection((prev) => {
    if (prev === -1) {
      // Collapsed state: open first incomplete section or Decision
      if (isSection0Complete && isSection1Complete && isSection2Complete) return 3;
      if (isSection0Complete && isSection1Complete) return 2;
      if (isSection0Complete) return 1;
      return 0;
    }
    return Math.min(3, prev + 1);
  });
};
```

**Explanation:** When the user has collapsed the current section (`prev === -1`), “Next” no longer jumps to Triage (0). It opens the first incomplete section, or Decision (3) if all prior sections are complete. Completion flags are already in scope (`isSection0Complete`, etc.).

**Priority:** High.  
**User impact:** Restores sensible progression when user collapses a section then clicks Next.

---

### FIX #2 (Optional): Scroll newly expanded section into view

**FILE:** `src/pages/EvtPathway.tsx`  
**LOCATION:** `useEffect` that runs on `activeSection` change, ~line 417.

**CURRENT CODE:**

```tsx
useEffect(() => {
  const mainElement = document.querySelector('main');
  if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'instant' });
  else window.scrollTo(0, 0);
}, [activeSection]);
```

**OPTIONAL ENHANCEMENT:** After scrolling to top, after a short delay scroll the active section’s container into view so the newly expanded content is visible (e.g. use a ref per section or a shared `stepContainerRef` and query the active section). Defer to implementation if refs are added.

**Priority:** Medium (UX).  
**User impact:** Ensures the section that just opened is on-screen.

---

### FIX #3 (Optional): Prevent collapsing when it would leave “no section”

**FILE:** `src/pages/EvtPathway.tsx`  
**LOCATION:** `onToggle` for each `CollapsibleSection`, e.g. lines 595, 688, 747, 894.

**IDEA:** Instead of toggling to `-1`, “collapse” could move to the previous or next section (e.g. collapse current → expand previous). This would avoid `activeSection === -1` entirely and simplify `handleNext`. Optional; Fix #1 already makes -1 safe.

**Priority:** Low.

---

## Phase 6: Additional UX Improvements

1. **Progress indicator**  
   Already present: progress bar and “X/4 sections completed” (lines 566–574). Optional: step labels (1. Triage, 2. Clinical, …) with completed/active state.

2. **Back button**  
   Already present and correct; disabled on section 0.

3. **Smart defaults**  
   Optional: pre-fill common choices (e.g. “Early Window 0–6h”, “18–79”) to speed repeat use. Current: all unknown/empty.

4. **Keyboard shortcuts**  
   Optional: Enter = Next (when `activeSection < 3`), Esc = Back or close modal. Not implemented.

5. **Toast on auto-advance**  
   Optional: when auto-advancing (in the existing `useEffect`), show a short toast (e.g. “Triage complete — moving to Clinical”) so users notice the transition.

---

## Implementation Priority

| Phase | When | Items |
|-------|------|--------|
| **Phase 1 (this week)** | Critical | Fix #1: `handleNext` when `activeSection === -1` (use completion flags to choose next section). |
| **Phase 2 (this month)** | High / UX | Fix #2: Scroll active section into view after change; optional toast on auto-advance. |
| **Phase 3 (nice to have)** | Backlog | Fix #3 (avoid -1), step labels, keyboard shortcuts, smart defaults. |

---

## Appendix: Code References

- **Step state:** `activeSection` (0–3, or -1 when collapsed). `EvtPathway.tsx` line 362.
- **Auto-advance effect:** Lines 536–554.
- **Completion flags:** `isSection0Complete`, `isSection1Complete`, `isSection2Complete` (lines 472–506), `isSection3Complete` (line 407).
- **Navigation:** `handleNext` 441, `handleBack` 442, `onToggle` 595, 688, 747, 894.
- **Modal:** `ThrombectomyPathwayModal.tsx` only wraps `EvtPathway` with `hideHeader`, `isInModal`, `customActionButton` (“Return to Stroke Workflow”); no extra steps.

---

**End of audit.**

Should I implement these fixes now, or would you like to review first?
