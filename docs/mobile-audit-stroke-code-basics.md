# Mobile-First Audit: Stroke Code Basics Page

**Agent:** Mobile-First Developer  
**Page:** Stroke Code Basics (`StrokeBasicsWorkflowV2.tsx`, `/guide/stroke-basics`)  
**Date:** 2026-02-02

---

## Executive Summary

The Stroke Code Basics page is used during active stroke codes and rounds—often on phones. This audit checks layout, touch targets, typography, performance, and UX against the Mobile-First Developer agent’s standards. **Viewport meta is correct.** Several issues should be fixed for reliable use on 375px phones, slow networks, and one-handed use.

---

## 1. What’s Already Good

- **Viewport:** `index.html` has `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.
- **Layout:** `StrokeBasicsLayout` uses `lg:hidden` / `hidden lg:flex` for mobile vs desktop; mobile gets a single column.
- **Sticky timer:** Code mode has a sticky timer bar—context stays visible while scrolling.
- **Primary CTA:** Step 1 “Mark Complete & Continue” is full-width and easy to tap.
- **LKW / Witnessed Onset:** Buttons use `py-3` and full width—reasonably touch-friendly.
- **Modals:** NIHSS and eligibility modals use `fixed inset-0` and `p-4`; they work on small screens.

---

## 2. Touch Targets (< 44px)

**Standard:** Minimum 44×44px (Apple HIG, Material); 8px spacing between targets.

| Location | Issue | Suggestion |
|--------|--------|------------|
| **Timer bar – “Reset Timer”** | `px-5 py-2` → ~40px height. | Use `min-h-[44px] py-3` (or `py-2.5` + explicit `min-height: 44px`) so the button meets 44px. |
| **ProtocolSection – Deep Learning** | Button has `py-1.5`; total height can be &lt; 44px. | Add `min-h-[44px] min-w-[44px]` and ensure padding keeps tap area ≥ 44px. |
| **ProtocolSection – step number badge** | `w-8 h-8` = 32px. | Increase to at least 44px on mobile, e.g. `w-11 h-11` or use a larger hit area (e.g. wrapper with padding) so the *tap* area is 44px. |
| **ProtocolStepsNav – step list** | Step rows use `px-2 py-2`; row height can be &lt; 44px. | Use `min-h-[44px] py-3` (or equivalent) so each step row is at least 44px tall. |
| **CodeModeStep1 – vitals inputs** | BP/Glucose/NIHSS/Weight inputs use `py-0.5`; height &lt; 44px. | Use `min-h-[44px] py-2.5` (or `py-3`) on all number inputs so they’re easy to tap and meet 44px. |
| **CodeModeStep1 – “Calculator” (NIHSS)** | Text link, no min height. | Make a proper button with `min-h-[44px]` and padding, or wrap in a tappable area ≥ 44px. |
| **CodeModeStep1 – “Check tPA eligibility”** | Text link. | Same as above: button or padded tap area ≥ 44px. |
| **CodeModeStep1 – LKW Unknown checkbox** | Checkbox `w-5 h-5` = 20px. | Keep visual size; add a large tap target (e.g. padding on the label or wrapper) so total tap area ≥ 44px. |
| **AnalogClockPicker – hour/minute/AM-PM** | Buttons use `px-3 py-1` or `px-2 py-1`; small. | Use `min-h-[44px] py-2.5` (or similar) so each control is 44px tall. |
| **AnalogClockPicker – close** | Icon button, no explicit min size. | Add `min-w-[44px] min-h-[44px]` and center icon. |
| **DeepLearningModal – close / filter chips** | Close and filter controls can be &lt; 44px. | Ensure close button and filter toggles have min 44px tap area. |

---

## 3. Typography (iOS Zoom & Readability)

**Standard:** Body/interactive text ≥ 16px on mobile to avoid iOS auto-zoom; headings scale; line-height ~1.5–1.6.

| Location | Issue | Suggestion |
|--------|--------|------------|
| **Timer bar – “Elapsed Time” label** | `text-[10px]` is too small and can trigger zoom if user taps a nearby input. | Use at least `text-xs` (12px) for labels; prefer `text-sm` (14px) for important labels. |
| **CodeModeStep1 – vitals labels** | Labels are `text-xs` (12px). | For labels next to inputs, `text-sm` is safer and more readable on phones. |
| **CodeModeStep1 – BP/NIHSS/Weight inputs** | Inputs use `text-lg`; good. Ensure no parent or global rule forces &lt; 16px. | Confirm root/input font-size is ≥ 16px on mobile (e.g. in `index.css` or Tailwind base) to prevent zoom. |
| **Page title** | `text-3xl` is fine; on very small viewports could be slightly smaller. | Optional: use `clamp(1.5rem, 5vw, 1.875rem)` or Tailwind responsive classes so it doesn’t overflow on 375px. |
| **Study mode – reference links** | Some references use `text-xs`. | Keep for secondary text; ensure primary instructions and CTAs are ≥ 14–16px. |

---

## 4. Primary Actions & Thumb Zone

**Standard:** Primary actions in thumb zone (bottom); avoid critical actions only at top.

| Location | Issue | Suggestion |
|--------|--------|------------|
| **Step 1 – “Mark Complete & Continue”** | At bottom of step content; good. | Consider making it sticky on mobile (`fixed bottom-0` with safe-area and top shadow) so it’s always in thumb zone after scroll. |
| **Reset Timer** | At top-right of sticky bar. | Acceptable for “reset”; ensure tap target is 44px. Optionally add a second “Reset” in a bottom bar in code mode. |
| **Mode toggle (CODE / STUDY)** | Top of page. | Fine as secondary; keep. |
| **ProtocolSection “Next”** | Right-aligned below section. | On mobile, make full-width and/or sticky at bottom so “Next” is in thumb zone. |

---

## 5. Modals on Mobile

**Standard:** On mobile, modals should be full-screen (or near full-screen) for clarity and to avoid small floating panels.

| Location | Issue | Suggestion |
|--------|--------|------------|
| **NIHSS modal** | `max-h-[90vh]` and centered; works. | On viewports &lt; 768px, use `inset-0` / full-screen (e.g. `rounded-none`, `max-h-full`) so it feels native and avoids keyboard/overlap issues. |
| **ThrombolysisEligibilityModal** | (Not inspected in detail.) | Apply same rule: full-screen on mobile. |
| **DeepLearningModal** | (Not inspected in detail.) | Same: full-screen on small viewports. |
| **AnalogClockPicker** | Centered overlay, `w-80`. | On mobile, consider full-screen or nearly full-screen so the clock is large and easy to use with a finger. |
| **ThrombectomyPathwayModal** | (Not inspected in detail.) | Same: full-screen on mobile. |

---

## 6. Safe Area & Notch

**Standard:** Use `env(safe-area-inset-*)` for notches and home indicators.

| Location | Issue | Suggestion |
|--------|--------|------------|
| **Sticky timer bar** | No safe-area. | Add `padding-top: env(safe-area-inset-top)` (or Tailwind `pt-[env(safe-area-inset-top)]`) so it clears the notch. |
| **Bottom spacing** | `h-24` at bottom. | Use `pb-[env(safe-area-inset-bottom)]` (or `pb-safe`) so content clears home indicator. |
| **Sticky “Mark Complete” (if added)** | Would sit at bottom. | Use `padding-bottom: env(safe-area-inset-bottom)` and `pb-safe` so the button sits above the home indicator. |

---

## 7. Responsive Breakpoints & Layout

**Standard:** Test at 375px, 428px, 768px; avoid horizontal scroll; stack where needed.

| Location | Issue | Suggestion |
|--------|--------|------------|
| **Header – title + mode toggle** | `flex justify-between`; on 375px the two buttons (CODE MODE / STUDY MODE) can squeeze the title. | Below 640px (or 480px), stack: title full-width, then toggle. Or shorten labels to “Code” / “Study” on small screens. |
| **Step 1 – two columns** | `lg:grid-cols-[1fr_auto]`; stacks at &lt; lg. | Confirm stack order: Onset Determination first, then vitals cards. Add a quick test at 375px to ensure no overflow. |
| **ProtocolSection – badges** | Status + Deep Learning in one row on mobile. | Ensure they wrap (e.g. `flex-wrap`) and don’t overflow; Deep Learning button stays ≥ 44px. |
| **StrokeBasicsLayout – mobile padding** | `px-4 py-4`. | Adequate; consider `px-4` with safe-area horizontal if needed on devices with rounded corners. |

---

## 8. Performance (Slow 3G / Hospital WiFi)

**Standard:** Initial load &lt; 3s on 3G; TTI &lt; 5s; avoid blocking main thread.

| Area | Suggestion |
|------|------------|
| **Route / bundle** | Ensure Stroke Code Basics (and its steps/modals) are in a route-level or step-level code-split chunk so the rest of the app doesn’t block first paint. |
| **Modals** | Lazy-load `DeepLearningModal`, `ThrombolysisEligibilityModal`, `ThrombectomyPathwayModal`, `AnalogClockPicker` so they don’t increase initial JS. |
| **Images** | If any images are added later, use `srcset`/`picture` and lazy-load below the fold. |
| **Fonts** | Inter + Material Symbols are loaded in `index.html`; consider self-hosting and subsetting to reduce requests and improve 3G load. |

---

## 9. Hover-Only / Touch

**Standard:** No critical info or actions only on hover; touch should work everywhere.

| Location | Issue | Suggestion |
|--------|--------|------------|
| **Links and buttons** | Most use `hover:` for style only; actions are on click. | Keep; no hover-only critical actions found. |
| **Tooltips** | If any component uses hover-only tooltips, they won’t work on touch. | Prefer tap-to-show tooltips or inline hints for important info. |

---

## 10. Checklist Summary

| Category | Status | Notes |
|----------|--------|--------|
| Viewport meta | ✅ | Present and correct. |
| Touch targets ≥ 44px | ⚠️ | Timer, step badges, vitals inputs, Calculator/eligibility links, clock picker, modals need sizing. |
| Body/input font ≥ 16px | ⚠️ | Confirm globally; fix 10px label. |
| Primary actions in thumb zone | ⚠️ | Consider sticky bottom CTA for Step 1 and “Next”. |
| Modals full-screen on mobile | ⚠️ | Apply to NIHSS, eligibility, Deep Learning, clock, thrombectomy. |
| Safe-area insets | ⚠️ | Add for top bar and bottom spacing / sticky CTA. |
| Responsive header/title | ⚠️ | Stack or shorten on narrow widths. |
| Performance / code-split | ⚠️ | Lazy-load modals and heavy step content. |
| No hover-only critical UI | ✅ | No critical hover-only flows found. |

---

## 11. Suggested Implementation Order

1. **High impact, low effort**  
   - Touch targets: add `min-h-[44px]` (and where needed `min-w-[44px]`) to Reset Timer, Deep Learning button, Step 1 vitals inputs, Calculator and Check tPA eligibility, AnalogClockPicker buttons, and modal close buttons.  
   - Safe-area: add `env(safe-area-inset-top)` to the timer bar and `env(safe-area-inset-bottom)` to bottom spacing and any future sticky bottom CTA.

2. **High impact, medium effort**  
   - Make modals (NIHSS, eligibility, Deep Learning, Thrombectomy, AnalogClockPicker) full-screen on viewports &lt; 768px.  
   - Sticky bottom “Mark Complete & Continue” and “Next” on mobile with safe-area.

3. **Medium impact**  
   - Typography: change timer label from `text-[10px]` to `text-xs` or `text-sm`; confirm 16px minimum for inputs.  
   - Header: stack or shorten CODE MODE / STUDY MODE on small screens.

4. **Performance**  
   - Lazy-load modals and optional step content; measure LCP and TTI on 3G.

---

## 12. Handoffs

- **UI Architect:** Sticky bottom CTA, full-screen modals on mobile, header stacking.
- **Performance Optimizer:** Code-splitting and lazy-loading for Stroke Code Basics and modals.
- **Accessibility Specialist:** Touch target sizes overlap with WCAG 2.5.5 (Target Size); coordinate minimum 44px and spacing.

Applying these changes will make the Stroke Code Basics page reliable and comfortable on phones during rounds and codes, in line with the Mobile-First Developer agent’s standards.
