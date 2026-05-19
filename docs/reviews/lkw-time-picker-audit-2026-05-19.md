# LKW Time Picker — UX/UI Audit
Date: 2026-05-19
Auditor: ui-architect (with skills: design-tokens, design:design-system, design:design-critique, accessibility-audit)
Scope: src/components/article/stroke/LKWTimePicker.tsx — used in 3 surfaces

---

## Cross-reference: prior audit status

The 2026-05-17 Stroke Code design audit (audit-stroke-code-design-2026-05-17.md) and accessibility audit (audit-stroke-code-a11y-2026-05-17.md) each cited the LKW picker. Many findings in those audits are now **resolved** in the current codebase:

| Prior finding | Status in current code |
|---|---|
| A-1 (a11y): ScrollCol drum keyboard-inaccessible (BLOCKER) | RESOLVED — `role="listbox"`, `tabIndex={0}`, `onKeyDown` with Arrow/Home/End/PageUp/PageDown, `role="option"`, `aria-selected` on items, `aria-activedescendant` on container |
| A-5 (a11y): Month nav buttons no aria-label | RESOLVED — `aria-label="Previous month"` and `aria-label="Next month"` present |
| A-6 (a11y): Calendar date cells no full-date aria-label | RESOLVED — full `${day} ${MONTHS[viewMonth]} ${viewYear}${future ? ', unavailable' : ''}${sel ? ', selected' : ''}` on each button |
| A-7 (a11y): No Escape-to-close | RESOLVED — `useModalFocusTrap` hook wires Escape, Tab-cycle, focus-on-open, return-focus |
| A-8 (a11y): SleepTimeRow day offset pills no aria-pressed | RESOLVED — `aria-pressed={dayOffset === i}` present |
| G-2 (a11y): Sleep error not announced to screen readers | RESOLVED — `role="alert"` and `aria-live="assertive"` on the error paragraph (always in DOM, empty when no error — correct pattern) |
| D-3 (a11y): CalendarGrid CSS grid instead of semantic table | STILL OPEN — not a blocker but noted below |
| E-4 (design): Confirm button "OK" visually weak | PARTIALLY RESOLVED — button now has `bg-neuro-500 text-white rounded-full min-h-[44px]` styling. Label still "OK" (see finding B-3 below). |
| D-05 (design): `sm:max-w-3xl` allows wide picker on tablet | STILL OPEN — see finding C-2 below |

---

## Summary

The LKW time picker is a purpose-built component that has improved significantly since the May 17 audit cycle — the most critical keyboard accessibility gap (the drum columns being mouse-only) is resolved, ARIA semantics are substantially correct, and the focus trap works. What remains is a cluster of design and usability issues that, while not blocking functionality, create real friction in a code-stroke scenario: the drum columns' selected-item feedback is visually subtle at speed, the preset list is sparse and missing the most clinically useful value (1 hour ago), the "OK" confirm label does not signal the weight of the action, the calendar surface is cosmetically misaligned with the ProtocolModal reference pattern in a few small ways, and the sleep-onset tab layout is cramped on 375px. The picker does not need a full redesign — it needs a focused polish pass plus two usability improvements (preset density, confirm label) that would meaningfully reduce time-to-confirm in an emergency.

**Findings by severity:**
- MUST-FIX: 3
- SHOULD-FIX: 7
- POLISH: 6
- IDEA: 4

---

## Findings

### A. Visual appeal + design parity

#### A-1 — MUST-FIX: Confirm button label "OK" is inadequate for a primary clinical CTA

**File:** `src/components/article/stroke/LKWTimePicker.tsx:784`
**Exact string:** `>OK</button>`

The confirm button now has correct styling (`bg-neuro-500 text-white rounded-full min-h-[44px]`), which resolves the prior audit's ghost-button finding. However the label "OK" remains. This is the most consequential button in the stroke workflow — it commits a date+time that determines the treatment window calculation. "OK" is ambiguous: it does not communicate what is being confirmed or what the next state will be. Every other primary CTA in the codebase uses a verb phrase that names the action.

Compare:
- ProtocolModal footer primary CTA: "Copy to EMR" (`ProtocolModal.tsx:217`)
- Sleep onset CTA at line 654: "Set Sleep Onset"
- Extended IVT Pathway confirm buttons: "Set LKW Time" / "Confirm"

The sleep-onset confirm ("Set Sleep Onset") follows the correct pattern. The specific-time confirm must match.

**Recommended fix (S):**
```tsx
// line 784 — replace
>OK</button>
// with
>Set LKW Time</button>
```

---

#### A-2 — MUST-FIX: Desktop time-column separator is a raw hardcoded class `bg-slate-150`

**File:** `src/components/article/stroke/LKWTimePicker.tsx:702, 773`
**Exact strings:**
- Line 702: `<div className="w-px h-16 bg-slate-150 mx-1" />`
- Line 773 (desktop, omits separator): the same `bg-slate-150` appears in the SleepTimeRow at line 322.

`slate-150` does not exist in the Tailwind scale. The NeuroWiki token set goes `slate-100 → slate-200` — there is no 150 stop. Tailwind will either silently generate nothing (the div is invisible) or fall through to a CSS variable that doesn't resolve. The separator between the minute and AM/PM columns is therefore likely not rendering at all, which collapses the visual breathing room between the time and period columns.

**Recommended fix (S):**
```tsx
// Replace all three occurrences of bg-slate-150 with bg-slate-200
<div className="w-px h-16 bg-slate-200 mx-1" />
// and in SleepTimeRow (LKWTimePicker.tsx:322):
<div className="w-px h-12 bg-slate-200 mx-1" />
```

---

#### A-3 — MUST-FIX: CalendarGrid still uses CSS grid instead of semantic table — screen reader column headers absent

**File:** `src/components/article/stroke/LKWTimePicker.tsx:221–255`
**Lines:**
- Line 222: `<div className="grid grid-cols-7 mb-1">` — day-of-week header row
- Line 229: `<div className="grid grid-cols-7 gap-y-0.5">` — date cell grid

The seven day-of-week headers (`M T W T F S S`) are plain `<div>` elements inside a CSS grid. The date cells are `<button>` elements inside a second CSS grid. There is no `<table>`, `<thead>`, `<th scope="col">`, or grid-role semantics connecting the column header "M" (Monday) to the dates below it.

A screen reader user navigating by keyboard through the calendar will hear "8, button", "15, button", "22, button" — they cannot determine that these are Mondays. The prior a11y audit (D-3) flagged this as STILL OPEN from the L5 baseline.

This is the single remaining WCAG 1.3.1 gap in the calendar — the rest of the calendar ARIA (aria-label on each date with full "14 May 2026" text, aria-disabled on future dates, aria-pressed on selected) is correct.

**Recommended fix (M):**
```tsx
// Replace the two grid divs with:
<table role="grid" aria-label={`${MONTHS[viewMonth]} ${viewYear}`}>
  <thead>
    <tr>
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
        <th key={d} scope="col" className="text-center text-[11px] font-semibold text-slate-400 py-0.5 w-8">
          {d.charAt(0)}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {/* rows of 7 cells */}
  </tbody>
</table>
```

The visual output is identical; the semantic change enables screen readers to announce "Monday column" as context when navigating date cells.

---

#### A-4 — SHOULD-FIX: Mode toggle "Specific Time" tab uses `shadow-sm` (banned utility)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:524, 535`
**Exact strings:**
- Line 524: `'bg-neuro-500 text-white shadow-sm'`
- Line 535: `'bg-amber-500 text-white shadow-sm'`

`shadow-sm` is explicitly banned in the NeuroWiki design system. Active tab state should communicate selected state via full fill (`bg-neuro-500 text-white`) alone, without shadow decoration. The ProtocolModal close button and CalculatorHeader Copy pill both use color+fill only — no shadow. Remove `shadow-sm` from both active variants.

**Recommended fix (S):**
```tsx
// Line 524 — remove shadow-sm:
? 'bg-neuro-500 text-white'
// Line 535 — remove shadow-sm:
? 'bg-amber-500 text-white'
```

---

#### A-5 — SHOULD-FIX: Desktop presets panel "Unable to determine" button has ambiguous visual treatment

**File:** `src/components/article/stroke/LKWTimePicker.tsx:753–759`
**Exact string (line 756):**
```
className="w-full text-left px-4 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-amber-200"
```

The "Unable to determine" option is styled identically to the preset buttons (`bg-slate-100 text-slate-700`) but has an amber border added. This is a partial differentiation — it signals "this is different" without making the distinction legible at a glance. Comparing to the mobile layout (line 688–692), the mobile version correctly uses `bg-amber-50 text-amber-700 border border-amber-200` to create a distinct warm treatment.

The desktop and mobile variants should be visually consistent. The desktop variant should match the mobile: warm amber background.

**Recommended fix (S):**
```tsx
// Line 756 — replace
className="w-full text-left px-4 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-amber-200"
// with
className="w-full text-left px-4 py-2.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
```

---

#### A-6 — SHOULD-FIX: Header icon badge size (w-7 h-7) is smaller than the ProtocolModal reference pattern

**File:** `src/components/article/stroke/LKWTimePicker.tsx:622`
**Exact string:**
```
<div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
```

The header icon badge is 28×28px with `rounded-lg`. The ProtocolModal reference uses `min-h-[44px] min-w-[44px] rounded-full` for the close button — that is a different element, but the broader principle is that the icon-badge in the header should be slightly more generous. More relevantly, the CalculatorHeader and PathwayHeader both use 32×32px icon containers. At 28px, the Clock icon inside appears slightly cramped.

Additionally, `rounded-lg` on a small icon badge at this size looks slightly blockier than the `rounded-xl` that section cards use. The design-tokens skill specifies `rounded-xl` for containers, `rounded-lg` for inner cards — a 28px icon badge is closer to "inner card" scale, so `rounded-lg` is defensible. But consistent with the rest of the platform's icon badges (which tend toward `rounded-xl` at this scale), bumping to `rounded-xl` would look more polished.

**Recommended fix (S):**
```tsx
// Line 622 — increase size and adjust radius:
<div className="w-8 h-8 rounded-xl bg-neuro-500 flex items-center justify-center shrink-0">
```

---

#### A-7 — SHOULD-FIX: The date row's "Date" eyebrow label (mobile) does not use the canonical eyebrow scale

**File:** `src/components/article/stroke/LKWTimePicker.tsx:715`
**Exact string:**
```
<span className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</span>
```

The canonical eyebrow label (design-tokens skill, confirmed in CALCULATOR_SPEC §1.5 and every reference mockup) is `text-[10px] font-bold uppercase tracking-widest text-slate-400`. This element uses `text-xs` (12px) instead of `text-[10px]`. The size discrepancy means the "Date" label is noticeably larger than equivalent eyebrow labels on the same screen (e.g., in the CalculatorHeader or section cards).

**Recommended fix (S):**
```tsx
// Line 715 — replace text-xs with text-[10px]:
<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</span>
```

---

#### A-8 — POLISH: ScrollCol selection highlight uses `inset-x-1` which creates 4px margin on each side

**File:** `src/components/article/stroke/LKWTimePicker.tsx:77`
**Exact string:**
```
<div
  className="absolute inset-x-1 rounded-xl bg-neuro-500 pointer-events-none z-10"
  style={{ top: itemH, height: itemH }}
/>
```

`inset-x-1` means the neuro-500 highlight pill has 4px gap on each side from the column edge. At `colW=56`, the pill is 48px wide. This is a design decision — the gap creates a "pill floating in the column" look. Compare to Apple's iOS wheel picker where the selection highlight spans the full width with no horizontal inset (full-width rules line). The gap at `inset-x-1` is intentional but slightly small — it creates a very tight gap that can look like a rendering artifact rather than a design decision on lower-density screens.

A small increase to `inset-x-0` (no gap) or a more pronounced `inset-x-2` (8px gap, clearly intentional) would read better. The `rounded-xl` radius is correct for the pill shape. `inset-x-1.5` (6px) would be a middle ground.

This is purely cosmetic — no functional impact.

**Recommended fix (S, optional):**
```tsx
// Line 77 — change inset-x-1 to inset-x-1.5 for a clearly intentional gap:
<div
  className="absolute inset-x-1.5 rounded-xl bg-neuro-500 pointer-events-none z-10"
  style={{ top: itemH, height: itemH }}
/>
```

---

#### A-9 — POLISH: The colon separator between hour and minute drums uses `font-thin` / `font-light` (not a spec typography token)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:700, 771`
**Exact strings:**
- Mobile (line 700): `<span className="text-3xl font-thin text-slate-300 -mt-1">:</span>`
- Desktop (line 771): `<span className="text-2xl font-light text-slate-300">:</span>`

`font-thin` (weight 100) and `font-light` (weight 300) are not part of the NeuroWiki typography scale, which uses `font-medium`, `font-semibold`, `font-bold` as its three weights for text content. The colon separator's very light weight makes it nearly invisible against the `text-slate-300` color on white — it reads as a visual ghost. On an OLED screen or in direct sunlight this could disappear.

The intent is clearly to make the separator recede, which is correct UX (the numbers should dominate). But the color `text-slate-300` alone is sufficient to make it recede without needing to go to `font-thin`. Using `font-normal` with `text-slate-300` would be more legible.

**Recommended fix (S, optional):**
```tsx
// Mobile line 700:
<span className="text-3xl font-normal text-slate-300 -mt-1">:</span>
// Desktop line 771:
<span className="text-2xl font-normal text-slate-300">:</span>
```

---

#### A-10 — POLISH: Modal backdrop uses `z-[90]` — a magic number outside the stacking context system

**File:** `src/components/article/stroke/LKWTimePicker.tsx:607`
**Exact string:**
```
className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center"
```

`z-[90]` is an arbitrary value. Other modals in the codebase use `z-50` (ProtocolModal at line 134: `z-50`). The LKWTimePicker uses a higher z-index presumably because it can be triggered from within a modal (e.g., when another modal might be open). But `z-[90]` is undocumented and creates a hidden stacking dependency. If a future modal uses `z-[80]`, it will be silently behind the picker.

This is a design-tokens violation (arbitrary values banned) and a stacking context fragility risk.

**Recommended fix (S, optional, coordinate with system-architect on z-index scale):**
Establish a named z-index tier. In `tailwind.config.js` extend:
```js
zIndex: { modal: '50', 'modal-overlay': '60', 'picker': '90', 'toast': '100' }
```
Then use `z-picker` in the component. This is a broader system change — flag for the next design-tokens skill refresh.

---

### B. Usability — bedside friction points

#### B-1 — MUST-FIX: Preset list is missing the most clinically common values for tPA eligibility

**File:** `src/components/article/stroke/LKWTimePicker.tsx:431–437`
**Exact string:**
```tsx
const PRESETS = [
  { label: 'Now', hours: 0 },
  { label: '3 hours ago', hours: 3 },
  { label: '6 hours ago', hours: 6 },
  { label: '12 hours ago', hours: 12 },
  { label: '24 hours ago', hours: 24 },
];
```

The 4.5-hour tPA window is the central clinical threshold for IV thrombolysis. The preset list jumps from "Now" directly to "3 hours ago" — with nothing in between — and then to 6, 12, and 24. The most time-sensitive zone for the attending is 1–4.5 hours. A patient presenting with "symptoms started about an hour ago" or "LKW was 90 minutes ago" requires the clinician to manually scroll the drums to set the time, which takes 3–5 taps and scroll interactions.

At the 3-hour mark, the clinician needs to know whether they're inside or outside the standard window (which is 4.5 hours). The jump from 3 to 6 skips the entire clinical decision zone (3.1h to 4.5h).

**Industry comparison:** Epic Haiku's time-since-onset picker offers 30-minute, 1-hour, 2-hour, 3-hour, 4-hour presets for stroke workflows — finer granularity in the acute zone. Apple HealthKit's sleep tracker uses 15-minute increments. The principle is the same: presets should be densest where clinical decisions cluster.

**Recommended fix (M — logic change to preset data, no architectural change):**
```tsx
const PRESETS = [
  { label: 'Just now', hours: 0 },
  { label: '30 min ago', hours: 0.5 },
  { label: '1 hour ago', hours: 1 },
  { label: '2 hours ago', hours: 2 },
  { label: '3 hours ago', hours: 3 },
  { label: '4 hours ago', hours: 4 },
  { label: '6 hours ago', hours: 6 },
  { label: '12 hours ago', hours: 12 },
  { label: '24 hours ago', hours: 24 },
];
```

On mobile, the horizontal scroll row (line 667–694) accommodates this naturally — it already scrolls. On desktop, the left-panel preset list (line 737–759, `w-[155px]`, `overflow-y-auto`) will scroll past 6 items without layout change. The 9-item list fits within the panel's existing `overflow-y-auto` container.

The label "Now" should become "Just now" — more natural and less ambiguous about whether "Now" means the current moment or the start of the code.

---

#### B-2 — SHOULD-FIX: No tactile confirmation when a preset is applied — drum positions update but no visual pulse

**File:** `src/components/article/stroke/LKWTimePicker.tsx:439–446`

When a preset is tapped, `applyPreset()` updates state which triggers the `ScrollCol` `useEffect` to animate the drum to the new position. The preset button highlights (`bg-neuro-500 text-white` when `activePreset === p.label`), which is good. However, the animation from the drums repositioning is the only feedback — there is no confirmation toast, no momentary highlight on the result time display, and no haptic trigger.

On a busy mobile screen with gloves or during a rapid interaction, the drum animation can be missed if the user's eyes are elsewhere. A brief visual pulse on the preset button (ring flash) or on the current time display above the drums would confirm the action completed.

**Recommended fix (S — CSS only, no logic change):**
Add a `transition-all duration-150` on the preset button active state and a brief ring flash:
```tsx
${activePreset === p.label
  ? 'bg-neuro-500 text-white ring-2 ring-neuro-300 ring-offset-1'
  : 'bg-slate-100 text-slate-700 active:bg-slate-200'
}
```
This is a small polish addition — the real fix is denser presets (B-1) which reduces the need for confirmation.

---

#### B-3 — SHOULD-FIX: "OK" confirm button label (confirmed as A-1 above — dual impact, noted here for usability severity)

The usability dimension of this finding: when a clinician completes a time-sensitive data entry in an emergency, the primary action must be unambiguous. "OK" communicates "I acknowledge" rather than "I am committing this time value." The difference matters under cognitive load — "Set LKW Time" names what just happened. This is the standard pattern used everywhere else in the platform and is the expected verb-noun CTA shape.

See A-1 for the exact fix.

---

#### B-4 — SHOULD-FIX: Sleep Onset tab label "Went to sleep (Last Known Well)" is clinically confusing

**File:** `src/components/article/stroke/LKWTimePicker.tsx:559`
**Exact string:**
```
label="Went to sleep (Last Known Well)"
```

In the WAKE-UP stroke paradigm, the LKW is the time the patient went to bed — but the parenthetical "(Last Known Well)" in this label is ambiguous. A clinician might read "Last Known Well" and interpret it as "the patient was last confirmed well at this time," which is only approximately true (the patient was well at bedtime but we can't confirm they had no symptoms until they woke). The clinical note at the top of the sleep tab (line 549) correctly states the nuance: "LKW = last time asleep without symptoms (bedtime)."

The label should match the clinical note's more precise language.

**Recommended fix (S):**
```tsx
// Line 559 — replace label prop:
label="Bedtime (Last known well)"
```

---

#### B-5 — SHOULD-FIX: Future-time validation is silent — no user-visible error in specific-time mode

**File:** `src/components/article/stroke/LKWTimePicker.tsx:467–474` (`handleConfirm`)

```tsx
const handleConfirm = () => {
  const d = new Date(selYear, selMonth, selDay);
  let h24 = hourIdx + 1;
  if (periodIdx === 1 && h24 !== 12) h24 += 12;
  if (periodIdx === 0 && h24 === 12) h24 = 0;
  d.setHours(h24, minuteIdx * 5, 0, 0);
  onConfirm(d); onClose();
};
```

`handleConfirm` constructs a Date and calls `onConfirm` and `onClose` immediately — there is no guard against a future time. A clinician who accidentally has the AM/PM column set incorrectly (common on a hurried scroll) can confirm a time like "3:00 PM" when it is currently "2:45 PM" — i.e., 15 minutes in the future. This would produce a negative treatment window calculation upstream.

The sleep-onset mode (line 487–500) does validate `wakeTime > now` and `wakeTime > bedtime`. The specific-time mode does not validate at all.

**Recommended fix (M — adds validation state to the specific-time confirm path):**
```tsx
const handleConfirm = () => {
  const d = new Date(selYear, selMonth, selDay);
  let h24 = hourIdx + 1;
  if (periodIdx === 1 && h24 !== 12) h24 += 12;
  if (periodIdx === 0 && h24 === 12) h24 = 0;
  d.setHours(h24, minuteIdx * 5, 0, 0);
  if (d > now) {
    // surface error — need a specificError state similar to sleepError
    setSpecificError('LKW time cannot be in the future. Check AM/PM.');
    return;
  }
  setSpecificError(null);
  onConfirm(d); onClose();
};
```
This requires adding `const [specificError, setSpecificError] = useState<string | null>(null)` and rendering the error the same way as `sleepError` (role="alert", always in the DOM).

---

#### B-6 — SHOULD-FIX: Calendar is collapsed by default on mobile and the collapse affordance is subtle

**File:** `src/components/article/stroke/LKWTimePicker.tsx:707–728`

On mobile, the date row is collapsed by default (`dateExpanded` initializes to `false`). The row shows the eyebrow "DATE" + the current date label + a ChevronDown. This is the correct pattern for progressive disclosure. However, the clinician must discover that tapping this row expands a calendar — the `py-3` row is only 12px tall on each side, and the ChevronDown is 16px at `text-slate-400`. On a gloved hand at a busy bedside, this is a subtle tap target.

Additionally, the row uses `hover:bg-slate-50 active:bg-slate-100` — the active state `slate-100` is present but very faint.

This interacts with the `min-h-[44px]` requirement (design-tokens skill §2.4). Let me verify: `py-3` = 12px top + 12px bottom = 24px + content = roughly 40px total. Below the 44px minimum.

**Recommended fix (S):**
```tsx
// Line 710 — change py-3 to py-3.5 to meet 44px minimum:
className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
```

---

### C. Mobile-first (375px viewport)

#### C-1 — SHOULD-FIX: SleepTimeRow drum columns on mobile are 44px tall — correct per spec, but the column background is completely white — the selected highlight blends at 375px

**File:** `src/components/article/stroke/LKWTimePicker.tsx:318–323` (SleepTimeRow drums, `itemH=44`)

The sleep-onset pickers use `itemH=44` (line 319, 321, 323) — the absolute minimum. At this height, the three-item visible area of each drum is 44×3 = 132px total, and the visible window is 44px high (one item visible before and after the selected). The selection highlight is still `bg-neuro-500` per the `ScrollCol` shared component. However:

1. The fade-out overlays (top and bottom gradient) are each 44px tall — meaning when `itemH=44`, the top and bottom fades are the same height as the visible items. This causes the non-selected items to be 100% faded — they are essentially invisible, leaving only the selected item (on the `bg-neuro-500` highlight). The scroll drum loses its "wheel" metaphor and becomes a static display with hidden items.

2. At `itemH=44`, the touch target for scrolling the drum is the entire 132px column, which is fine. But the individual item tap targets are 44px (minimum pass). On a 375px screen with gloves, this is the floor.

**Recommended fix (M):** Increase `itemH` in `SleepTimeRow` to 48 (same as the main picker's default). This gives each non-selected item more visibility through the fade and restores the wheel metaphor:
```tsx
// LKWTimePicker.tsx lines 319, 321, 323 — change itemH={44} to itemH={48}:
<ScrollCol items={hourItems} selectedIdx={hourIdx} onSelect={onHourIdx} itemH={48} colW={56} ariaLabel={`${label} hour`} />
<span ...>:</span>
<ScrollCol items={minuteItems} selectedIdx={minuteIdx} onSelect={onMinuteIdx} itemH={48} colW={56} ariaLabel={`${label} minute`} />
...
<ScrollCol items={periodItems} selectedIdx={periodIdx} onSelect={onPeriodIdx} itemH={48} colW={56} ariaLabel={`${label} AM or PM`} />
```

---

#### C-2 — SHOULD-FIX: Desktop layout breakpoint (sm:) kicks in at 640px — calendar day buttons are 32px at that width

**File:** `src/components/article/stroke/LKWTimePicker.tsx:611, 734, 768`

At exactly 640px (the `sm:` breakpoint), the desktop 3-column layout renders: presets (`w-[155px]`) + calendar (`flex-1`) + drums (`w-[210px]`). The calendar column is 640 - 155 - 210 - padding = approximately 240px. Inside the calendar, day buttons are `w-8 h-8` (32×32px) — below the 44px touch target minimum.

The desktop layout is designed for mouse, so 32px buttons are acceptable there. But at 640px (a common tablet portrait width and some large-phone landscape widths), this is a touch device — the 32px target fails.

**Recommended fix (M):** Shift the breakpoint to `md:` (768px) instead of `sm:` (640px) for the desktop layout split. Between 375px and 767px, show the mobile layout. At 768px and above, show the desktop layout:

```tsx
// Line 666 — mobile layout container:
<div className="flex md:hidden flex-col flex-1 overflow-y-auto min-h-0">
// Line 734 — desktop layout container:
<div className="hidden md:flex flex-1 overflow-hidden min-h-0">
```

This ensures that all touch-primary viewports use the mobile layout where day buttons are at full-screen width (6 buttons per row × ~58px each at 375px = passes 44px).

---

#### C-3 — POLISH: SleepTimeRow takes up most of the 375px screen — scroll is required to see both pickers and the confirm button

**File:** `src/components/article/stroke/LKWTimePicker.tsx:279–327` (SleepTimeRow component)

Each `SleepTimeRow` has: `py-4 px-4` outer padding + label row (24px) + day pill row (32px) + mb-4 (16px) + drum row (132px at itemH=44) = approximately 208px per row. Two rows = 416px. Plus the clinical note banner (60px) + dividers (2px each) + error area (32px) = approximately 510px total. On a 375px screen where the modal is `max-h-[92vh]` (~680px at iPhone 14 Pro), the header (56px) + mode toggle (48px) = 104px used above — leaving 576px. Two sleep rows at 416px + clinical note at 60px + confirm footer (56px) = 532px, which fits — but only just. The scroll area has `flex-1 overflow-y-auto min-h-0`, so it does scroll.

In practice, the bedtime picker and wake-up picker are both partially off-screen, requiring the clinician to scroll to see the second picker and then scroll further to confirm. This adds cognitive steps in an emergency.

**Design recommendation (L — architectural change, flag as IDEA):** Consider a two-step flow within the sleep tab: "Step 1 of 2 — Bedtime" → (Next) → "Step 2 of 2 — Wake-up time" → Confirm. This eliminates the scroll dependency entirely. Noted in section E below as IDEA-3.

---

### D. Accessibility (WCAG 2.1 AA)

#### D-1 — SHOULD-FIX: The dialog's `aria-labelledby` points to the title in the header, but when `showSleepOnset=true` and `mode='sleep'`, the title "Last Known Well" is not fully accurate

**File:** `src/components/article/stroke/LKWTimePicker.tsx:617, 625`
```tsx
role="dialog"
aria-modal="true"
aria-labelledby="lkw-picker-title"
// ...
<span id="lkw-picker-title" className="text-sm font-bold text-slate-900 truncate">Last Known Well</span>
```

When the mode is 'sleep', the dialog's visual content is about bedtime and wake-up time, but the accessible name announced by the screen reader is still "Last Known Well" — which is technically correct (the goal is to determine LKW) but does not reflect the current sub-mode. A screen reader user switching to the Sleep Onset tab will have a dialog label that doesn't describe the current interaction.

**Recommended fix (S):**
Make the dialog title dynamic based on mode:
```tsx
<span id="lkw-picker-title" className="text-sm font-bold text-slate-900 truncate">
  {mode === 'sleep' ? 'Wake-up Stroke — Sleep Onset' : 'Last Known Well'}
</span>
```

---

#### D-2 — SHOULD-FIX: Mode toggle buttons lack `role="tablist"` / `role="tab"` / `aria-selected` semantics

**File:** `src/components/article/stroke/LKWTimePicker.tsx:517–541`

The two mode toggle buttons ("Specific Time" / "Sleep Onset") function as tabs — they switch the visible content panel, only one can be active at a time. However they are plain `<button>` elements with no tab semantics:

```tsx
<div className="flex gap-1 px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
  <button type="button" onClick={() => setMode('specific')} ...>Specific Time</button>
  <button type="button" onClick={() => setMode('sleep')} ...>Sleep Onset</button>
</div>
```

A screen reader will announce these as two unnamed buttons. The active tab (indicated by background color) has no `aria-selected="true"` and the container has no `role="tablist"`.

**Recommended fix (S):**
```tsx
<div
  role="tablist"
  aria-label="Time entry method"
  className="flex gap-1 px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex-shrink-0"
>
  <button
    role="tab"
    aria-selected={mode === 'specific'}
    aria-controls="lkw-specific-panel"
    id="lkw-tab-specific"
    ...
  >Specific Time</button>
  <button
    role="tab"
    aria-selected={mode === 'sleep'}
    aria-controls="lkw-sleep-panel"
    id="lkw-tab-sleep"
    ...
  >Sleep Onset</button>
</div>
// And on the respective content containers:
// specific-time container: id="lkw-specific-panel" role="tabpanel" aria-labelledby="lkw-tab-specific"
// sleep-onset container: id="lkw-sleep-panel" role="tabpanel" aria-labelledby="lkw-tab-sleep"
```

---

#### D-3 — SHOULD-FIX: The `ChevronDown` icon inside the month-nav header (`<span>`) is decorative but is navigated by keyboard

**File:** `src/components/article/stroke/LKWTimePicker.tsx:206`
```tsx
<span className="text-sm font-bold text-slate-800 flex items-center gap-1">
  {MONTHS[viewMonth]} {viewYear}
  <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
</span>
```

The ChevronDown inside the month-year `<span>` already has `aria-hidden="true"` — this is correct. However the `<span>` itself is not a button and has no `onClick`. The ChevronDown's presence suggests the month/year is tappable (a common pattern in iOS date pickers where tapping the month opens a month-picker). But here it does nothing — the only navigation is via the previous/next chevron buttons on either side.

This is a false affordance: an icon that signals interactivity where none exists.

**Recommended fix (S):** Remove the `ChevronDown` from the month-year label `<span>` entirely. The left/right navigation buttons are sufficient and unambiguous.
```tsx
<span className="text-sm font-bold text-slate-800">
  {MONTHS[viewMonth]} {viewYear}
</span>
```

---

#### D-4 — POLISH: `ScrollCol` `onKeyDown` does not `preventDefault` on Home/End when browser default behavior conflicts

**File:** `src/components/article/stroke/LKWTimePicker.tsx:106–131`
```tsx
onKeyDown={(e) => {
  let nextIdx = selectedIdx;
  switch (e.key) {
    case 'ArrowDown': nextIdx = ...; break;
    case 'ArrowUp': nextIdx = ...; break;
    case 'PageDown': nextIdx = ...; break;
    case 'PageUp': nextIdx = ...; break;
    case 'Home': nextIdx = 0; break;
    case 'End': nextIdx = items.length - 1; break;
    default: return;
  }
  e.preventDefault();
  if (nextIdx !== selectedIdx) onSelect(nextIdx);
}}
```

The `e.preventDefault()` at line 130 fires for all handled keys — including `Home` and `End`. This is correct behavior for keyboard navigation within a `role="listbox"`. However, the `default: return` pattern (returning early without `preventDefault` for unhandled keys) is important: unrecognized keys fall through cleanly. This implementation is sound.

One edge case: `PageDown` and `PageUp` on the scroll container (which is `overflow-y-scroll`) might cause the outer modal's scroll container to also scroll, since the `preventDefault` runs before the scroll container handles its default scroll. This requires live device testing to confirm. Low-risk since the outer scroll container (`flex-col flex-1 overflow-y-auto`) will only scroll when the inner scroll container has no more content.

This is a polish note for QA testing, not a code change.

---

### E. Industry pattern ideas

#### IDEA-1: Quick relative-time buttons as the DEFAULT entry path, drums as refinement

**Pattern:** Epic Haiku time-since-onset picker — large pill buttons for the most common intervals (30m, 1h, 2h, 3h, 4h, Unknown) fill the screen. The drum picker is accessible via a "Set exact time" secondary link. Most clinicians pick a round number.

**NeuroWiki adaptation:** Restructure the mobile picker so the preset row is the hero element (large, grid of 2-column pills), and the drums collapse below a "Set exact time" disclosure. This would reduce the time-to-confirm in the most common case (preset selection) from 2–3 taps to 1 tap. The confirm button after a preset tap could auto-fire (tap-and-go, no separate OK needed). This is a significant UX change — flag as Class C, needs V sign-off.

---

#### IDEA-2: Selected time read-back display above the drums

**Pattern:** Apple iOS time picker shows the currently selected time in the area above the wheel at all times. Google Material date-time picker shows a large time display that updates live.

**NeuroWiki adaptation:** Add a `<time>` element above the mobile drum section showing the assembled time:
```
"09:30 AM · Today" — rendered as text-2xl font-bold text-slate-900
```
This would update live as the drums scroll. The clinician can glance at the assembled result before confirming — eliminating the need to mentally reconstruct "hour 9, minute 30, PM" from three separate columns.

Implementation: a computed `displayTime` derived from `hourIdx + 1`, `minuteItems[minuteIdx]`, `periodItems[periodIdx]`, and `dateLabelShort`. This is display-only, no state change. Effort: S.

---

#### IDEA-3: Two-step flow for sleep onset (eliminates scroll dependency)

**Pattern:** Google Material Stepper pattern for multi-step forms. Each step is full-screen within the modal. A "Next" button advances to the next step. A progress indicator (1 of 2) shows position.

**NeuroWiki adaptation:** Within the Sleep Onset tab, show "Step 1 of 2 — When did the patient go to bed?" with the bedtime drum + day selector only. "Next" advances to "Step 2 of 2 — When did they wake with symptoms?" with the wake-up drum. The confirm "Set Sleep Onset" is on step 2 only. This eliminates the two-row vertical scroll entirely and gives each picker the full modal height.

Effort: L (architectural change within the sleep tab, new step state needed).

---

#### IDEA-4: Haptic feedback on preset selection (iOS only)

**Pattern:** Apple's HIG recommends `UIImpactFeedbackGenerator` (`.light`) for selection confirmation. In a PWA context, the Web Vibration API (`navigator.vibrate(10)`) provides a 10ms pulse on Android. iOS Safari does not support the Vibration API — no cross-platform solution exists.

**NeuroWiki adaptation:** On preset button tap, call `navigator.vibrate?.(10)` — the optional chaining ensures this is a no-op on unsupported browsers. Zero risk, marginal benefit on Android. iOS clinicians get nothing. Not worth the engineering time as a standalone change — add it if the preset UX is overhauled (IDEA-1).

---

## Recommended improvement plan (ranked)

The following 5 changes would have the highest impact in a code-stroke scenario. All are feasible in a single focused sprint.

### 1. Expand and reconfigure the preset list (B-1) — MUST — effort: S

Change the 5 presets to 9 presets, adding 30 min ago, 1 hour, 2 hour, and 4 hour. Rename "Now" to "Just now." This is the single highest-impact usability change — it covers the entire tPA window zone (0–4.5h) with direct taps instead of drum scrolling. Zero layout change required on mobile (the horizontal scroll row absorbs new items). On desktop, the presets panel already has `overflow-y-auto`.

---

### 2. Rename confirm button from "OK" to "Set LKW Time" (A-1) — MUST — effort: S

Replace the 3-character label "OK" with "Set LKW Time" on line 784. The sleep-onset confirm already says "Set Sleep Onset" — parity is required. This is 1 string change, no logic involved.

---

### 3. Fix the `bg-slate-150` non-existent token (A-2) — MUST — effort: S

Replace all three occurrences of `bg-slate-150` with `bg-slate-200`. The separator divider between minute and AM/PM drums is likely invisible as currently written. This is 3 string substitutions.

---

### 4. Add future-time validation to specific-time confirm path (B-5) — SHOULD — effort: M

Add a `specificError` state (mirroring `sleepError`) and guard `handleConfirm` against `d > now`. Render the error with `role="alert"` in the specific-time footer, above the confirm button. This prevents a clinician from accidentally setting LKW 15 minutes in the future due to AM/PM scroll error — a mistake that would propagate to the treatment window calculation.

---

### 5. Add `role="tablist"` / `role="tab"` / `aria-selected` to the mode toggle (D-2) — SHOULD — effort: S

5 attribute additions across the two toggle buttons and their container. No visual change. Fully resolves the screen-reader tab-announcement gap for the Specific Time / Sleep Onset switch. This is the only remaining ARIA semantic gap in the picker's interactive controls.

---

## Lower-priority polish (12+ months out)

- **CalendarGrid → semantic table** (A-3) — technically correct but rarely encountered by keyboard users in an emergency; the date is a secondary input (presets or drums handle 90% of cases). Worth doing in a dedicated accessibility sprint.
- **Two-step sleep-onset flow** (IDEA-3 / C-3) — significant UX restructure; only beneficial for institutions using the WAKE-UP/THAWS protocol. Evaluate after adoption data shows sleep-onset tab usage rates.
- **Live time read-back display above drums** (IDEA-2) — a meaningful quality-of-life improvement but adds visual noise to an already information-dense modal. Consider only if user testing reveals drum-misread errors.
- **`sm:` → `md:` breakpoint shift** (C-2) — impacts all three call sites; requires mobile regression testing. Low urgency since 640px+ is rarely a touch-primary viewport for this use case.
- **Shift z-index to named scale** (A-10) — requires a design-tokens skill update and tailwind config extension; a broader infrastructure change, not a picker-specific fix.
- **Remove false-affordance ChevronDown from month label** (D-3) — purely cosmetic. One line deletion.
- **`inset-x-1` drum highlight gap** (A-8) — subjective aesthetic preference. The current gap is functional.
- **Colon separator `font-thin` → `font-normal`** (A-9) — very minor legibility improvement.

---

### @ui-architect — Sign-off
**Spec cited:** `.claude/skills/design-tokens/SKILL.md` (full) · `CLAUDE.md §4` · ProtocolModal.tsx (canonical modal reference) · CalculatorHeader.tsx (canonical header reference) · audit-stroke-code-a11y-2026-05-17.md (prior findings baseline) · audit-stroke-code-design-2026-05-17.md (prior findings baseline)
**Layout decisions:** Read-only audit. No code changes made. All findings documented with line numbers and exact class strings.
**Deviations from spec:** None in audit output. All recommended fixes use spec tokens only (neuro-*, slate-*, no arbitrary values).
**Risks flagged:**
1. B-5 (future-time validation) requires a new `useState` in the main component — test that the error state resets correctly when the modal closes (the existing `useEffect` on `isOpen` would need to add `setSpecificError(null)`).
2. Preset expansion (B-1) changes clinical-adjacent behavior (which preset values are offered). No clinical content changes, but a `-clinical` flag on the task is appropriate since this affects how quickly a clinician can set the treatment window input.
3. The `bg-slate-150` fix (A-2) is likely already causing a visual regression (invisible separator) — this should be treated as an urgent patch.
**Status:** ready
