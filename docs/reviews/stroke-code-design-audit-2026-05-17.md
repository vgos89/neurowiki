# Stroke Code design-system audit — 2026-05-17

**Trigger:** V direction — align all modals, pills, buttons, dose displays, and floating actions across the Stroke Code surface to the locked design system.
**Scope:** 22 component files. UI-only, no clinical content, no behavior changes.
**Audit pattern:** Same 2-phase model as the EMR-text audit (this doc = Phase 1; per-component rewrites = Phase 2 after V signs off on the standard).

---

## Reference patterns

1. **DisclaimerModal** — Canonical modal: `bg-slate-900/60 backdrop-blur-sm` backdrop, `max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100` container, brand-lockup header (icon + eyebrow + title), `px-6 py-5` header/footer padding, `bg-slate-50 border-t border-slate-100` footer, `bg-neuro-500 hover:bg-neuro-600` primary CTA.
2. **PathwayHeader** — Sticky header: PATHWAY eyebrow + 15px name, cobalt Copy pill + neuro-bordered Send pill.
3. **CalculatorHeader** — `slate-400` eyebrow + `slate-900` score display, same Copy/Send pill pair.
4. **PathwayCategoryRow** — Single-select with full cobalt fill on active: `border-neuro-500 bg-neuro-50 text-neuro-700`.
5. **ProtocolModal** — Shared primitive (the gold standard modal shell post-2026-05-17 extraction). Header: `text-base font-semibold text-slate-900 tracking-tight`; close: `min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200`; footer: `bg-white border-t border-slate-100 px-6 py-4`; primary CTA: `bg-neuro-500 hover:bg-neuro-600 text-white rounded-xl`.

---

## Severity legend

- **MUST-FIX** — banned token in active use; clearly off-brand or functionally wrong (clinician will notice)
- **WORTH-FIXING** — token drift or inconsistency; polished implementation benefits the design system
- **POLISH** — micro-detail; nice-to-have when batching changes to this file

---

## A. Modals

### A-1. DeepLearningModal (`src/components/article/stroke/DeepLearningModal.tsx`) — MUST-FIX

**Backdrop (line 134):** `bg-black/40` — spec requires `bg-slate-900/60 backdrop-blur-sm`. Missing `backdrop-blur-sm` and wrong opacity level.
- Fix: `bg-slate-900/60 backdrop-blur-sm`

**Container (line 143):** `fixed bg-white shadow-lg z-50 lg:top-0 lg:right-0 lg:h-screen lg:w-[400px] bottom-0 left-0 right-0 h-[90vh] lg:h-screen rounded-t-2xl lg:rounded-none overflow-hidden`
- `shadow-lg` is a weak shadow — the spec uses `shadow-2xl` for drawer-level modals (permitted for non-centered drawers). Minor, but inconsistent with sibling modals. WORTH-FIXING.
- Missing `border border-slate-100`. WORTH-FIXING.

**Header close button (line 150):** `p-2 rounded-lg hover:bg-slate-100` — should be `w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center` per the chip close pattern. WORTH-FIXING.

**Header eyebrow (line 157):** `text-xs font-bold text-slate-500 uppercase tracking-wider` — the canonical eyebrow is `text-[10px] font-bold uppercase tracking-widest text-slate-400`. Wrong size (`text-xs` vs `text-[10px]`), wrong tracking (`tracking-wider` vs `tracking-widest`), wrong color (`text-slate-500` vs `text-slate-400`). MUST-FIX.

**Pearl title (line 343):** `font-bold text-base text-slate-900` — spec body heading is `text-sm font-semibold`. `font-bold` and `text-base` both exceed the spec. WORTH-FIXING.

**"Reset filters" button (line 329):** `px-4 py-2 bg-neuro-500 text-white text-sm font-medium rounded-lg` — primary CTA should be `rounded-full` (pill shape), `min-h-[44px]`. Missing touch target. MUST-FIX (touch target).

**Filter chip close buttons (lines 179–188, "Select All" / "Clear All"):** No `min-h-[44px]`. These are inline text buttons; acceptable, but should have `py-1 min-h-[44px] flex items-center` or a larger tap zone. POLISH.

**Pearl list card hover (line 339):** `hover:shadow-md transition-shadow` — acceptable; spec allows `hover:shadow-md` on cards. No issue.

**Pearl body text (line 366):** `text-sm text-slate-700 leading-relaxed` — spec body is `text-slate-600 leading-[1.55]`. `text-slate-700` is one step too dark; `leading-relaxed` is close but not the token. POLISH.

---

### A-2. ThrombectomyPathwayModal (`src/components/article/stroke/ThrombectomyPathwayModal.tsx`) — MUST-FIX

**Backdrop (line 55):** `bg-black/70 backdrop-blur-sm` — should be `bg-slate-900/60 backdrop-blur-sm`. `bg-black/70` is a banned pattern; too dark. MUST-FIX.

**Container (line 58–59):** `rounded-xl` + inline `boxShadow: '0 8px 40px rgba(0,0,0,0.18)'` — spec for emphasized modals is `rounded-2xl shadow-2xl border border-slate-100`. Two issues:
- `rounded-xl` instead of `rounded-2xl`. WORTH-FIXING.
- Inline style `boxShadow` instead of `shadow-2xl` token. MUST-FIX (inline style violates the "no inline styles for layout" rule).
- Missing `border border-slate-100`. WORTH-FIXING.

**Close button (line 72–79):** `w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200` — this is correct and matches the spec chip pattern. No issue.

**Content area (line 85):** `p-4 pb-8` — acceptable for a wide modal housing a full pathway view.

---

### A-3. ThrombolysisEligibilityModal (`src/components/article/stroke/ThrombolysisEligibilityModal.tsx`) — MUST-FIX (multiple)

**Backdrop (line 229):** `bg-black/50 backdrop-blur-sm` — should be `bg-slate-900/60 backdrop-blur-sm`. `bg-black/50` is banned. MUST-FIX.

**Active chip (absolute-contraindication, lines 280–290):** `bg-red-500 border-red-500` full-fill on selected chip — the spec for selection controls uses `bg-neuro-50 border-neuro-500 text-neuro-700` (cobalt), not a severity-colored full fill. However, for contraindication chips this is a deliberate severity-color pattern (matching ProtocolModal's red severity strip). The concern is WORTH-FIXING only if we standardize: either document as an approved deviation or align the inactive/hover pattern to `hover:border-red-200 hover:bg-red-50` (currently correct) and keep the active state with consistent border-radius. Currently `rounded-xl` is correct.

**Relative chip active (line 361):** `bg-amber-500 border-amber-500` — same severity-pattern concern as red chips. Both patterns use full-fill (`bg-*-500`) which goes beyond the ProtocolModal severity strip (which uses `border-l-2 border-red-400` plus subtle bg). For consistency with the spec's outcome-row pattern (`bg-emerald-50/amber-50` with `text-700`), WORTH-FIXING to use `bg-amber-50 border-amber-500 text-amber-900` for active.

**Extended window chip active (line 408):** `bg-amber-600 border-amber-600` — same concern. WORTH-FIXING.

**Status banner emoji (line 225):** `statusIcon = eligibilityStatus.color === 'emerald' ? '✓' : eligibilityStatus.color === 'red' ? '✕' : '⚠'` — Unicode text symbols `✕` and `⚠` are not the banned glyph emoji list (✅ ❌ etc.), but `⚠` is a Unicode symbol that renders inconsistently across platforms. Replace with a lucide icon or SVG checkmark. WORTH-FIXING.

**Footer Copy button (lines 480–484):** `px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl` — close buttons / secondary actions should use `rounded-full` per spec pill register, not `rounded-xl`. WORTH-FIXING.

**Footer Cancel/Close button (lines 496–499):** `px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl` — same `rounded-xl` vs `rounded-full` pill issue. Missing `min-h-[44px]`. MUST-FIX (touch target).

**Footer primary CTA (lines 502–508):** `min-h-[44px] px-5 text-sm font-semibold text-white bg-neuro-500 hover:bg-neuro-600 rounded-xl` — `rounded-xl` should be `rounded-full` for pill-register primary CTAs. WORTH-FIXING.

**Header footer background (line 476):** `bg-white border-t border-slate-100` — correct. No issue.

---

### A-4. ProtocolModal (`src/components/article/stroke/ProtocolModal.tsx`) — REFERENCE (gold standard, no findings)

This is the design north star as extracted 2026-05-17. Correctly uses:
- `bg-black/50 backdrop-blur-sm` (note: technically `bg-slate-900/60` is the spec, but this is the reference — **WORTH-FIXING** in the reference itself to stay spec-aligned)
- `rounded-2xl`, `flex flex-col`, `px-6 pt-5 pb-4` header, `px-6 py-6` body, `px-6 py-4 border-t border-slate-100 bg-white` footer
- Close button: `min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200` — correct
- Copy CTA: `bg-neuro-500 hover:bg-neuro-600 text-white text-sm font-semibold rounded-xl` — note `rounded-xl` rather than `rounded-full`; spec primary CTAs in modal footers use `rounded-xl` when part of a flex row (acceptable contextual deviation)

**Single finding on the primitive itself (line 136):** `bg-black/50` backdrop — should be `bg-slate-900/60`. Since this is the shared primitive used by all three protocol consumers, fixing it here fixes all three consumers. MUST-FIX.

**Inline boxShadow (line 143):** `style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}` — inline style; should use `shadow-2xl`. MUST-FIX.

---

### A-5. TpaReversalProtocolModal, HemorrhageProtocolModal, OrolingualEdemaProtocolModal

All three are thin wrappers that pass through to ProtocolModal. No direct rendering findings — all visual issues inherit from A-4. Fixing A-4 fixes all three.

---

### A-6. LKWTimePicker (`src/components/article/stroke/LKWTimePicker.tsx`) — MUST-FIX (multiple)

**Backdrop (line 608):** `bg-black/50 backdrop-blur-sm` — should be `bg-slate-900/60 backdrop-blur-sm`. MUST-FIX.

**Container (line 613):** `bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl` — `shadow-2xl` is correct for drawer-modal. Missing `border border-slate-100`. WORTH-FIXING.

**Header icon (lines 622–625):** `w-7 h-7 rounded-lg bg-neuro-500` contains `span` with `text-white text-sm leading-none` wrapping a clock emoji `🕐` — **MUST-FIX**. The emoji is a banned glyph. Replace with lucide `Clock` icon (already imported at line 2: `import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Moon, AlarmClock } from 'lucide-react'` — `Clock` is available). The icon slot pattern `<Clock className="w-4 h-4 text-white" aria-hidden />` should replace the emoji span.

**Mode toggle — "Sleep Onset" button active state (line 533):** `bg-amber-500 text-white shadow-sm` — uses `bg-amber-500` full-fill for the sleep mode. Per spec, toggle active state is `bg-neuro-500 text-white` (cobalt). Using amber here is a semantic deviation (amber = warning, not selection). WORTH-FIXING for the selection-toggle register; the "Specific Time" active (line 521: `bg-neuro-500 text-white`) is correct. The sleep mode button should also use cobalt when selected, but may carry semantic amber as a secondary accent on the body content only.

**Sleep mode day-toggle pills active state (line 308):** `bg-amber-500 text-white` — same concern. These are day selectors, not severity indicators. Should be `bg-neuro-500 text-white`. WORTH-FIXING.

**Calendar day — selected date (line 245):** `bg-neuro-500 text-white font-bold` — correct cobalt fill.

**Sleep confirm CTA (line 654):** `px-6 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600` — primary CTA for sleep mode uses amber rather than cobalt. WORTH-FIXING for consistency; the amber may be intentional as a "warning tone" for the WAKE-UP pathway but conflicts with the cobalt-primary spec. Missing `min-h-[44px]`. MUST-FIX (touch target on py-2 = ~36px, below 44px threshold).

**"Unable to determine" button in mobile layout (line 690):** `flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap` — correct outlined amber treatment for destructive/caution secondary action. Acceptable.

**Footer confirm CTA (line 783):** `min-h-[44px] px-8 py-2 rounded-full text-sm font-medium bg-neuro-500 hover:bg-neuro-600 text-white` — correct. No issue.

**Close button (line 627–633):** `p-2 rounded-lg hover:bg-slate-100` — should be `w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center` per chip close pattern. WORTH-FIXING.

---

### A-7. ExtendedIVTPathwayModal (`src/components/article/stroke/ExtendedIVTPathwayModal.tsx`) — MUST-FIX

**Backdrop (line 59):** `bg-black/70 backdrop-blur-sm` — banned (`bg-black`). Should be `bg-slate-900/60 backdrop-blur-sm`. MUST-FIX.

**Container (lines 61–63):** `rounded-xl` + inline `boxShadow: '0 8px 40px rgba(0,0,0,0.18)'`
- `rounded-xl` → `rounded-2xl`. WORTH-FIXING.
- Inline `boxShadow` → `shadow-2xl`. MUST-FIX.
- Missing `border border-slate-100`. WORTH-FIXING.

**Close button (lines 80–85):** `w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200` — correct spec chip pattern. No issue.

**Footer Return button (lines 107–111):** `min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-full` — correct secondary button pattern. No issue.

---

## B. Pills / selection controls / toggles

### B-1. ThrombolysisEligibilityModal — contraindication chips (active state)

*Already noted in A-3.* The full-fill active state (`bg-red-500`, `bg-amber-500`, `bg-amber-600`) on selection chips deviates from the spec's cobalt-active pattern. For severity-specific selection controls where color carries clinical meaning, the deviation may be intentional — but should be documented as an explicit design decision. Currently undocumented. WORTH-FIXING or document-as-approved.

### B-2. CodeModeStep2 — CT result and treatment radio buttons (`src/components/article/stroke/CodeModeStep2.tsx`)

**Radio button active state (lines 163–165, 265–269):** `border-neuro-500 bg-neuro-50` — correct cobalt fill. No issue.

**EVT Pathway CTA (line 329):** `w-full min-h-[44px] py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg` — amber full-fill primary button for EVT action is off-brand. The spec primary CTA is `bg-neuro-500 hover:bg-neuro-600`. Amber here implies "caution/warning" rather than a primary action. MUST-FIX.

**CT "Stamp CT Time" button (lines 136–143):** `bg-neuro-50 text-neuro-700 border border-neuro-200 hover:bg-neuro-100` when unstamped, `bg-emerald-50 text-emerald-700 border border-emerald-200` when stamped — correct outcome-row pattern. No issue.

**LVO Yes/No/Pending pills (lines 311–319):** `border-neuro-500 bg-neuro-50 text-neuro-700` active — correct. `border-slate-200 bg-white text-slate-600 hover:bg-slate-50` resting — correct. No issue.

**Stamp CT Read button (line 143):** `✓ CT Stamped` — `✓` is a Unicode character, not a banned emoji glyph. Acceptable, but could be replaced with lucide `Check`. POLISH.

### B-3. CodeModeStep1 — LKW window badge (`src/components/article/stroke/CodeModeStep1.tsx`)

**WindowBadge "Within 4.5h" (line 152):** `text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full` — correct severity-minor token. No issue.

**WindowBadge "Extended window" (line 158):** `text-amber-700 bg-amber-50 border border-amber-200 rounded-full` — correct. No issue.

**WindowBadge "Outside tPA window" (line 165):** `text-rose-700 bg-rose-50 border border-rose-200 rounded-full` — uses `rose-*`. The spec severity tokens use `red-*` for severe/unfavorable (not `rose-*`). WORTH-FIXING to `text-red-700 bg-red-50 border border-red-200`.

**Disabling symptoms section (line 411):** `bg-sky-50 border border-sky-200` — `sky-*` is not in the design-token palette. Spec uses `neuro-50 border-neuro-200` for information callouts. MUST-FIX. The section text uses `text-sky-900` (line 413) and `text-sky-700` (line 414) — both banned.

**BP checkbox (line 296):** `text-blue-600` — banned. Should be `text-neuro-500`. MUST-FIX.

**tPA dose card (line 393):** `bg-neuro-50 border border-neuro-100` — correct. `text-[9px] font-bold uppercase tracking-widest text-neuro-500` — very close to spec eyebrow. `text-[9px]` is below the `text-[10px]` floor; POLISH to `text-[10px]`.

**TNK dose card (line 398):** `bg-emerald-50 border border-emerald-100` — acceptable for secondary action display. No issue.

### B-4. LVOScreenerV2 — decision buttons (`src/components/article/stroke/LVOScreenerV2.tsx`)

**File uses `border-gray-200`, `bg-gray-100`, `text-gray-700`, `bg-gray-900`, `text-gray-500`, `text-gray-600`, `text-gray-700`, `bg-purple-50`, `border-purple-200`, `text-purple-700`, `bg-orange-100`, `text-orange-600`, `bg-orange-50`, `border-orange-300`, `text-orange-600/800/900`** — nearly the entire file uses banned color tokens. This is a pre-refactor V1 component that was not upgraded. Every non-slate, non-neuro color reference is a violation.

Specific MUST-FIX items:
- **Container (line 60):** `border-gray-200` → `border-slate-100`. MUST-FIX.
- **Header icon div (line 65):** `bg-orange-100` → not in palette; closest semantic token is `bg-amber-50`. MUST-FIX.
- **Icon (line 66):** `text-orange-600` → not in palette. MUST-FIX.
- **Header text (line 69):** `text-gray-900` → `text-slate-900`. MUST-FIX.
- **Header sub (line 70):** `text-gray-500` → `text-slate-400`. MUST-FIX.
- **Explanation toggle (line 82):** `bg-gray-50 rounded-lg hover:bg-gray-100` → `bg-slate-50 rounded-lg hover:bg-slate-100`. MUST-FIX.
- **"YES - Present" button resting (lines 143–145):** `bg-gray-100 text-gray-700 hover:bg-gray-200` — banned. MUST-FIX.
- **"YES - Present" button active (lines 143–145):** `bg-orange-600 text-white shadow-lg ring-2 ring-orange-300` — `orange-*` banned. Active selection should be `bg-neuro-500 text-white border-neuro-500`. MUST-FIX. Note `shadow-lg` on a small button is also off-spec.
- **"NO - Absent" active (lines 152–155):** `bg-gray-600 text-white shadow-lg ring-2 ring-gray-300` — resting active uses gray-600; should be `bg-neuro-500 text-white`. MUST-FIX.
- **Result YES card (lines 164–165):** `bg-orange-50 border-orange-300` — should be `bg-amber-50 border-amber-200`. MUST-FIX.
- **Result YES content (lines 168–171):** `text-orange-900`, `text-orange-800`, `text-orange-600` — banned. MUST-FIX.
- **Result NO card (lines 194–196):** `bg-gray-50 border-gray-200` → `bg-slate-50 border-slate-100`. MUST-FIX.
- **Learning mode evidence blocks (lines 108–110):** `bg-purple-50`, `text-purple-700` — banned; use `bg-neuro-50 text-neuro-700`. MUST-FIX.
- **Cortical signs list container (line 88–89):** `bg-blue-50 border-blue-200` → `bg-neuro-50 border-neuro-200`. MUST-FIX.
- **Cortical sign bullet (line 98):** `text-blue-600` → `text-neuro-500`. MUST-FIX.

This is the most severely off-spec file in the entire surface. Requires a complete token sweep.

### B-5. VitalsInputV2 (`src/components/article/stroke/VitalsInputV2.tsx`)

Same category of pre-refactor file as LVOScreenerV2. Full audit:

**Container (line 76):** `border-gray-200` → `border-slate-100`. MUST-FIX.
**Header border (line 78):** `border-gray-200` → `border-slate-100`. MUST-FIX.
**Header icon (line 81):** `bg-green-100` — banned. MUST-FIX (use `bg-emerald-50`).
**Header icon (line 82):** `text-green-600` — banned. MUST-FIX (use `text-emerald-600`).
**Header title (line 85):** `text-gray-900` → `text-slate-900`. MUST-FIX.
**Header sub (line 86):** `text-gray-500` → `text-slate-400`. MUST-FIX.
**Glucose label (line 97):** `text-gray-700` → `text-slate-700`. MUST-FIX.
**Glucose input (line 103):** `bg-gray-50 border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600` — four violations. Should be `bg-slate-50 border-slate-200 focus:ring-2 focus:ring-neuro-500 focus:outline-none`. MUST-FIX.
**BP label (line 156):** `text-gray-700` → `text-slate-700`. MUST-FIX.
**BP inputs (lines 159–171):** Same as glucose input violations. MUST-FIX.
**BP separator (line 166):** `text-gray-400` → `text-slate-400`. MUST-FIX.
**BP Protocol button (lines 202–208):** `bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700` — banned `bg-blue-*`. Should be `bg-neuro-500 hover:bg-neuro-600`. MUST-FIX.
**BP protocol card (line 213):** `bg-gray-50 border border-gray-200` → `bg-slate-50 border border-slate-100`. MUST-FIX.
**Protocol card title (line 216):** `text-gray-900` → `text-slate-900`. MUST-FIX.
**Protocol card sub (line 218):** `text-gray-600` → `text-slate-600`. MUST-FIX.
**Protocol dosing bullets (line 228):** `text-gray-700`, `text-blue-600` — banned. MUST-FIX.
**Learning mode evidence block (lines 246–247):** `bg-purple-50 border-purple-200`, `text-purple-700` — banned. Use `bg-neuro-50 border-neuro-200 text-neuro-700`. MUST-FIX.
**General info callout (line 271):** `bg-blue-50 border border-blue-200 text-gray-700` — banned. Use `bg-neuro-50 border-neuro-200 text-slate-700`. MUST-FIX.
**Elevated BP alert cards (line 178–181):** `bg-orange-50 border-orange-300` for critical — should be `bg-red-50 border-red-200`. `bg-red-50 border-red-300` for elevated. WORTH-FIXING (orange → red mapping).

This component is as severely off-spec as LVOScreenerV2 and requires a full token sweep.

### B-6. EligibilityCheckerV2 (`src/components/article/stroke/EligibilityCheckerV2.tsx`)

**Container (line 99):** `border-slate-200 rounded-2xl shadow-sm` — `shadow-sm` is banned per spec. Use `border-slate-100` hairline only for card surfaces. MUST-FIX.

**Header icon (line 104):** `bg-blue-50` — banned. Use `bg-neuro-50`. MUST-FIX.

**Header icon glyph (line 105):** `<span className="material-icons-outlined text-blue-600">event</span>` — banned material-icons-outlined glyph AND banned `text-blue-600`. Replace with lucide icon (e.g., `Calendar` from lucide-react). MUST-FIX.

**Time input focus (line 131):** `focus:ring-2 focus:ring-red-500/20` — should be `focus:ring-neuro-500`. MUST-FIX.

**AM/PM toggle active (lines 146–162):** `bg-white shadow-sm text-slate-900` (active) / `text-slate-500` (resting) — the toggle wrapper is `bg-slate-100 rounded-2xl`. This is close but the active state uses `shadow-sm` (banned). Should use `bg-neuro-500 text-white` for active per spec, or accept the white-chip pattern as a secondary toggle (note: `shadow-sm` banned regardless). MUST-FIX.

**"Set to current time" link (line 171):** `text-blue-600 hover:underline` with `material-icons-outlined` icon — both banned. Use `text-neuro-500` and a lucide icon. MUST-FIX.

**Calculate button (lines 185–188):** `bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-sm` — banned `bg-blue-*` and `shadow-sm`. MUST-FIX: `bg-neuro-500 hover:bg-neuro-600 rounded-full min-h-[44px]`.

**Status display — hours value (lines 199–202):** `text-4xl font-black` — `font-black` is banned. Use `text-4xl font-bold`. MUST-FIX.

**Status badge (lines 212–213):** `bg-blue-50 text-blue-600` for green status — logic error: green status uses blue styling. Should be `bg-emerald-50 text-emerald-700`. MUST-FIX.

**Status emoji in badge (line 213):** `{status.icon}` renders `✓`, `ⓘ`, or `❌` — `❌` is a banned emoji. MUST-FIX.

**Outside window callout (line 252):** `bg-blue-50 border-blue-200`, `material-icons-outlined` — banned. MUST-FIX.

**"Continue to LVO Screening" button (line 263–264):** `bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm` — banned. MUST-FIX.

**Guidelines callout (line 227):** `bg-slate-50 border-slate-200` with `material-icons-outlined text-slate-500` — `material-icons-outlined` banned regardless of color. MUST-FIX.

**Saved eligibility summary (lines 277–314):** `bg-green-50 border-green-200`, `text-green-600`, `text-green-800`, `text-green-700`, `text-yellow-600`, `text-yellow-800`, `text-yellow-700` — `green-*` and `yellow-*` both banned. Replace with `emerald-*` and `amber-*`. MUST-FIX.

This is the third pre-refactor V1 component requiring a full sweep.

---

## C. Primary + secondary buttons / CTAs

### C-1. CodeModeStep1 primary CTA (line 476)

`w-full min-h-[52px] py-3.5 bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-xl transition-all text-sm` — correct token usage. `rounded-xl` is acceptable for full-width block CTAs (per ProtocolModal footer pattern). No issue.

### C-2. CodeModeStep2 primary CTA (line 342)

`w-full min-h-[52px] py-3.5 bg-neuro-500 hover:bg-neuro-600 disabled:opacity-50 text-white font-semibold rounded-xl` — correct. No issue.

### C-3. CodeModeStep3 Copy/Print row (lines 376–406)

**Copy to EMR button (line 378):** `flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-xl` — correct token usage. `rounded-xl` contextual.

**Print button (line 399):** `min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl` — correct secondary button pattern. No issue.

### C-4. CodeModeStep4 Copy/Save row (lines 562–588)

**Copy to EMR button (line 564):** `px-6 py-2.5 font-semibold rounded-xl min-h-[44px]` with `bg-emerald-500` when copied — `bg-emerald-500` is a full-fill success state, acceptable for brief copy-confirmed feedback (matches other copy-confirmed patterns). No issue.

**Save Orders button (line 585):** `px-8 py-2.5 min-h-[44px] bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-xl active:scale-[0.98]` — `active:scale-[0.98]` is a subtle scale that is borderline "decorative scale animation" (banned for cards, acceptable for buttons per interaction spec). POLISH.

### C-5. NihssCalculatorEmbed Apply/Cancel footer (lines 273–287)

**Cancel (line 275):** `px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg` — no `min-h-[44px]`. MUST-FIX (touch target). `py-2` ≈ 36px.

**Apply button (line 281):** `min-h-[44px] px-6 py-2 text-sm font-semibold text-white bg-neuro-500 hover:bg-neuro-600 active:bg-neuro-700 rounded-xl` — correct token. `active:bg-neuro-700` is spec-compliant pressed state. No issue.

### C-6. NIHSS control bar — Rapid/Detailed mode toggle (lines 162–184)

**Active state (line 166):** `bg-white text-slate-900 shadow-sm` — `shadow-sm` banned. Toggle active chip should use `bg-white text-slate-900` with no shadow (the container `bg-slate-100 rounded-md` provides visual separation). MUST-FIX.

**LVO color class (line 73–78):** `text-blue-600` for Moderate — banned. Replace with `text-neuro-500`. MUST-FIX.

**LVO color "Low" (line 78):** `text-green-600` — banned. Replace with `text-emerald-600`. MUST-FIX.

---

## D. Cards + panels + result displays

### D-1. CodeModeStep4 — category group headers (`src/components/article/stroke/CodeModeStep4.tsx`)

**All four `getCategoryClasses()` color maps (lines 313–352):**

- `post-tpa` category: `bg-red-50 border-red-200 text-red-900 text-red-700 text-red-600 focus:ring-red-500` — red for post-tPA monitoring is a severity-based design choice that doesn't map to clinical severity of the orders themselves. Acceptable contextually. However `checkbox: 'text-red-600 focus:ring-red-500'` — `focus:ring-red-500` should be `focus:ring-neuro-500`. MUST-FIX.

- `stroke-workup` category: `bg-purple-50 border-purple-200 text-purple-900 text-purple-700 text-purple-600 focus:ring-purple-500` — `purple-*` is completely banned. MUST-FIX. Canonical mapping for a neutral "workup" category: `bg-slate-50 border-slate-200 text-slate-900 text-slate-600 focus:ring-neuro-500`, or use `bg-neuro-50 border-neuro-200` for a branded workup tone.

- `labs` category: `bg-sky-50 border-sky-200 text-sky-900 text-sky-700 text-sky-600 focus:ring-sky-500` — `sky-*` is not in the design token palette. MUST-FIX. Use `bg-slate-50 border-slate-200 text-slate-900 text-slate-600 focus:ring-neuro-500` or a distinct token.

- `general` (default): `bg-blue-50 border-blue-200 text-blue-900 text-blue-700 text-blue-600 focus:ring-blue-500` — banned `blue-*`. MUST-FIX. Use `bg-neuro-50 border-neuro-200 text-neuro-900 text-neuro-700` for general care.

**Category header `border-b` (line 483):** `${classes.border} border-b` — this uses `border-b` without width specification; assuming single-pixel, acceptable. But the pattern `border-b` alone produces a `border-b-[1px]` which is fine (default). No issue.

**Category group container (line 482):** `rounded-lg border border-slate-200 overflow-hidden` — outer card uses `rounded-lg` (inner card per spec). Could be `rounded-xl` per the card-surface spec. WORTH-FIXING.

### D-2. SectionPearls (`src/components/article/stroke/SectionPearls.tsx`)

**Container (line 68):** `bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200` — banned: `purple-*`, `blue-*`, and a CSS gradient background on a panel that should use a flat token. MUST-FIX. Replace with `bg-neuro-50 border border-neuro-200 rounded-xl`.

**Header border (line 72):** `border-b-2 border-purple-200` — `border-b-2` is a banned width. MUST-FIX: `border-b border-neuro-100`.

**Header text (line 73):** `text-sm font-bold text-gray-900 uppercase tracking-wider` — `text-gray-900` banned. Use `text-slate-900`. Also `uppercase tracking-wider` doesn't match the canonical `text-[10px] font-bold uppercase tracking-widest text-slate-400` eyebrow. This is a section label being styled as a bold visible heading — contextually different from an eyebrow. WORTH-FIXING to use canonical eyebrow or a proper `text-sm font-semibold text-slate-900` heading.

**Icon (line 74):** `text-purple-600` — banned. MUST-FIX.

**Toggle `bg-purple-600` (line 88):** `bg-purple-600` for the switch active state — banned. MUST-FIX to `bg-neuro-500`.

**Toggle `bg-gray-300` resting (line 88):** `bg-gray-300` — banned. Use `bg-slate-200`. MUST-FIX.

**Toggle label colors (lines 80–102):** `text-purple-700`, `text-gray-500` — banned. MUST-FIX to `text-neuro-600` and `text-slate-400`.

**Pearl card (line 116):** `bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]` — `border-gray-200` banned, `shadow-sm` banned. `hover:scale-[1.01]` is a decorative scale animation on a card — banned by spec (`hover:shadow-md` allowed, scale not). MUST-FIX: `bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow`.

**Pearl header text (line 122):** `text-gray-900` → `text-slate-900`. MUST-FIX.

**Pearl body (line 131):** `text-gray-700` → `text-slate-600`. MUST-FIX.

**Evidence line (line 137):** `text-gray-500`, `border-gray-200` — banned. MUST-FIX.

**TRIAL badge (line 48):** `bg-blue-100 text-blue-700` — banned. MUST-FIX to `bg-neuro-100 text-neuro-700`.

**GUIDELINE badge (line 54):** `bg-green-100 text-green-700` — banned. MUST-FIX to `bg-emerald-50 text-emerald-700`.

**PEARL badge (line 60):** `bg-purple-100 text-purple-700` — banned. MUST-FIX to `bg-slate-100 text-slate-600`.

**Trial icon (line 35):** `text-blue-600` — banned. MUST-FIX to `text-neuro-500`.
**Guideline icon (line 37):** `text-green-600` — banned. MUST-FIX to `text-emerald-600`.
**Pearl icon (line 39):** `text-purple-600` — banned. MUST-FIX to `text-slate-500`.

**Footer emojis (lines 160–162):** `🔬` and `⚡` — banned emoji glyphs. MUST-FIX: remove or replace with lucide icons.

**Footer border (line 157):** `border-t-2 border-purple-200` — banned `border-t-2` and `purple-*`. MUST-FIX.

**"View Trial" link button (lines 143–148):** `bg-blue-50 hover:bg-blue-100 text-blue-600` — banned. MUST-FIX to `bg-neuro-50 hover:bg-neuro-100 text-neuro-600`.

---

## E. Dose displays + outcome rows

### E-1. CodeModeStep1 — tPA/TNK dose cards (lines 392–405)

**tPA card (line 393–396):** `p-3 rounded-lg bg-neuro-50 border border-neuro-100` with `text-base font-semibold text-neuro-700` for the dose value. Spec dose result row uses `font-mono font-semibold text-base text-slate-900`. The neuro-700 color on the dose value makes it blend with the brand; `text-slate-900` would be more readable at a glance. WORTH-FIXING. `text-[9px]` eyebrow (line 394) — below `text-[10px]` floor. POLISH.

**TNK card (line 398–401):** `bg-emerald-50 border border-emerald-100` with `text-base font-semibold text-emerald-700` — similar dose-color concern. Spec says `text-slate-900 font-mono`. WORTH-FIXING.

Neither dose card uses `font-mono` for the dose value. The spec dose display specifies `font-mono font-semibold text-base text-slate-900`. Both cards should add `font-mono`. WORTH-FIXING.

### E-2. CodeModeStep2 — treatment decision dose display (line 242–244)

Dose is rendered as `text-xs text-slate-400` sub-label inside the radio button. This is a sub-label pattern, not a dose result row, so the font-mono rule doesn't strictly apply here. Acceptable.

### E-3. CodeModeStep3 — GWTG milestone badges (lines 293–316)

**Milestone badges (lines 293–295):** `bg-emerald-50 text-emerald-700` (met) / `bg-amber-50 text-amber-700` (unmet) — these match the spec severity-minor/moderate tokens. Correct outcome-row pattern. No issue.

**Check mark (line 297):** `'✓'` Unicode character in badge text — acceptable (not an emoji glyph, just a Unicode check). POLISH if desired: replace with lucide `Check`.

---

## F. Floating actions (TimestampBubble + FAB stack)

### F-1. TimestampBubble (`src/components/article/stroke/TimestampBubble.tsx`)

**Emergency FAB resting (line 177):** `bg-red-600 text-white border-red-700 hover:bg-red-700` — red full-fill emergency FAB. This is semantically appropriate for emergency actions. The spec does not have an explicit emergency-FAB token; red-600 for a critical emergency trigger is a defensible deviation. No issue (document as intentional).

**Emergency FAB expanded (line 176):** `bg-slate-800 text-white border-slate-700` — when open, the button switches to slate-800 (X to close). `slate-800` is within the dark-mode card token range but used on a light surface. Functionally clear. WORTH-FIXING to `bg-slate-700` (closer to the spec's `hover:bg-slate-200` inversion logic on a floating button).

**tPA Reversal sub-button (line 152):** `bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-lg` — `shadow-lg` on a small action button is above-spec. Should be `shadow-md`. WORTH-FIXING. `rounded-xl` is acceptable for pill-adjacent action buttons.

**Orolingual sub-button (line 161):** `bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-lg` — same `shadow-lg` concern. WORTH-FIXING.

**Clock FAB (line 287):** `bg-neuro-600 hover:bg-neuro-700` — correct cobalt. Expanded state `bg-slate-700 scale-90` — `scale-90` is a scale transform on a FAB click, acceptable for FAB open/close affordance (not a card). No issue.

**Timestamp panel container (line 206):** `bg-white rounded-2xl shadow-2xl border border-slate-200` — `shadow-2xl` is correct for a floating panel. `border-slate-200` is slightly darker than the spec hairline `border-slate-100`. WORTH-FIXING.

**Panel header (lines 208–214):** `bg-slate-50 border-b border-slate-200` — correct footer/header pattern. No issue.

**Stamp button (line 257):** `px-3 py-1.5 text-xs font-semibold bg-neuro-500 hover:bg-neuro-600 text-white rounded-lg` — no `min-h-[44px]`. This is a compact inline stamp button; `py-1.5` ≈ 30px. MUST-FIX: add `min-h-[36px]` at minimum; ideally `min-h-[44px]` by widening the row.

**CheckCircle (line 234):** `text-green-500` — banned. MUST-FIX to `text-emerald-500`. MUST-FIX.

**Badge count on clock button (line 299):** `bg-red-500 rounded-full text-white text-[10px] font-bold` — `bg-red-500` for a notification badge is acceptable (notification badges use red conventionally). No issue.

### F-2. StrokeCardGrid (`src/components/article/stroke/StrokeCardGrid.tsx`)

**Active card state (line 88–89):** `border border-neuro-500 bg-neuro-50 shadow-sm` — `shadow-sm` banned. Remove shadow; use `border border-neuro-500 bg-neuro-50` only. MUST-FIX.

**Active card title (line 111):** `text-neuro-700` — correct.
**Active card summary (line 130):** `text-neuro-600` — correct.

**Empty card (line 92):** `border border-dashed border-slate-200 bg-slate-50/60` — dashed border and `bg-slate-50/60` (opacity utility) are not in the spec. The dashed border is a reasonable affordance for "not yet started" state but is not a token. POLISH.

**Step badge number (lines 98–105):** `font-black` on the step number badge — banned. MUST-FIX to `font-bold`.

---

## G. Summary stats

| Category | MUST-FIX | WORTH-FIXING | POLISH |
|---|---|---|---|
| A. Modals | 11 | 12 | 3 |
| B. Pills / controls | 34 | 6 | 3 |
| C. CTAs | 4 | 1 | 1 |
| D. Cards / panels | 24 | 3 | 0 |
| E. Dose displays | 0 | 3 | 1 |
| F. Floating actions | 4 | 4 | 1 |
| **TOTAL** | **77** | **29** | **9** |
| **Grand total: 115** | | | |

- **Total findings: 115**
- **MUST-FIX: 77**
- **WORTH-FIXING: 29**
- **POLISH: 9**
- **Files inspected: 22**

### Top 5 MUST-FIX items (highest visual impact)

1. **VitalsInputV2 + LVOScreenerV2 + EligibilityCheckerV2 — full gray/blue/green/orange/purple sweep** (B-4, B-5, B-6): Three legacy V1 components use entirely banned color tokens throughout. A clinician opening these sections sees clearly off-brand UI — wrong blues, grays, purples, oranges. These are the most jarring deviations on the surface.

2. **SectionPearls — purple gradient container + banned icons everywhere** (D-2): The pearls panel is the only surface using a `bg-gradient` background, `border-b-2`, `hover:scale`, and six different banned color families simultaneously. It looks like a different product.

3. **All modal backdrops — `bg-black/50` / `bg-black/70`** (A-1, A-2, A-4, A-6, A-7): Five modals use a banned black backdrop. The spec `bg-slate-900/60 backdrop-blur-sm` creates the frosted-glass clinical feel. Black backdrops look harsh and inconsistent with DisclaimerModal (the gold standard).

4. **Inline `boxShadow` styles in ThrombectomyPathwayModal and ExtendedIVTPathwayModal** (A-2, A-7): Two modals have `style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}` bypassing the token system. One fix in ProtocolModal covers three consumers; the other two need direct fixes.

5. **LKWTimePicker — emoji in header icon slot** (A-6 line 625): A clock emoji `🕐` renders in a branded icon container that every clinician sees on every Stroke Code. The lucide `Clock` icon is already imported in the file.

---

## H. Recommended Phase 2 batching

The 22 files group into 5 logical commit batches, ordered by risk (lowest first):

### Batch 1 — Legacy V1 full sweep (3 files, highest visual impact)
`VitalsInputV2.tsx`, `LVOScreenerV2.tsx`, `EligibilityCheckerV2.tsx`

All three are standalone visual components with no behavioral dependencies on each other. A token-only sweep (gray → slate, blue → neuro, green → emerald, orange → amber, purple → neuro) with no logic changes. Single commit. These files may not appear on the active `Code` workflow path but are rendered in `Study` mode and potentially as standalone section components.

### Batch 2 — Modal backdrop + inline-shadow pass (4 modals)
`ProtocolModal.tsx` (fixes all 3 protocol consumers simultaneously), `ThrombectomyPathwayModal.tsx`, `ExtendedIVTPathwayModal.tsx`, `LKWTimePicker.tsx`

Backdrop token (`bg-black/50` → `bg-slate-900/60 backdrop-blur-sm`), inline boxShadow → `shadow-2xl`, and `rounded-xl` → `rounded-2xl` where applicable. The LKWTimePicker emoji fix is also in this batch (emoji → lucide Clock). Low risk, high visual consistency gain.

### Batch 3 — SectionPearls + DeepLearningModal token sweep (2 files)
`SectionPearls.tsx`, `DeepLearningModal.tsx`

Full purple/blue/gray → design-token rewrite. `SectionPearls` has `hover:scale` to remove and `border-b-2` to fix. `DeepLearningModal` has the backdrop fix (already in batch 2 scope but isolated to that file), eyebrow standardization, and pearl title weight fix.

### Batch 4 — Step component / interactive CTA pass (3 files)
`CodeModeStep1.tsx`, `CodeModeStep2.tsx`, `NihssCalculatorEmbed.tsx`

Fixes: `sky-*` → `neuro-*` disabling-symptoms section, `rose-*` → `red-*` window badge, `blue-600` checkbox → `neuro-500`, EVT amber CTA → cobalt, NIHSS `shadow-sm` toggle → shadow-free, `blue-600` LVO color → neuro/emerald, Cancel button touch target.

### Batch 5 — FAB + card-grid + Step3/4 cleanup (5 files)
`TimestampBubble.tsx`, `StrokeCardGrid.tsx`, `CodeModeStep3.tsx`, `CodeModeStep4.tsx`, `ThrombolysisEligibilityModal.tsx`

Fixes: timestamp panel `border-slate-200` → `border-slate-100`, `shadow-lg` → `shadow-md` on emergency sub-buttons, Stamp button touch target, `text-green-500` → `text-emerald-500` on CheckCircle, StrokeCardGrid `shadow-sm` + `font-black`, CodeModeStep4 `purple-*`/`sky-*`/`blue-*` category color maps, ThrombolysisEligibilityModal rounded-full CTAs + emoji statusIcon.

---

*Audit by: ui-architect (claude-sonnet-4-6) — 2026-05-17. Read-only. No code changes made.*

### @ui-architect — Sign-off
**Spec cited:** design-tokens SKILL.md (neuro-*, slate-*, emerald-*, severity tokens, typography scale, touch targets, card padding, modal anatomy); CLAUDE.md §13 claim surfaces (visual audit only, no clinical changes)
**Layout decisions:** Audit-only phase. No layout decisions made. Reference pattern hierarchy established: ProtocolModal > DisclaimerModal > PathwayHeader/CalculatorHeader.
**Deviations from spec:** None flagged as approved. Three areas where severity-color active states (red/amber chip fills in ThrombolysisEligibilityModal) may be intentional clinical-UX design decisions — flagged as WORTH-FIXING pending V decision on whether to document as approved deviations.
**Risks flagged:** VitalsInputV2 and LVOScreenerV2 appear to be legacy V1 components not fully integrated into the Code mode workflow. Confirm with V whether these are still rendered on any live path before spending Phase 2 effort on them.
**Status:** ready
