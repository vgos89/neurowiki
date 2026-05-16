# UX Audit — EVT Pathway Round-6 Mockup (mobile-first-developer lens)

**Date:** 2026-05-15
**Auditor:** mobile-first-developer
**Scope:** 375px bedside ergonomics, thumb-zone reachability, touch targets, viewport budget
**Output mode:** Read-only audit; no source files edited.

---

## Executive summary

- Touch targets on the primary interactive elements (category rows, branch chip buttons, Undo) are within spec. The `p-3 -m-3` chip wrapper and the `p-2 rounded-full` icon buttons clear the 44px bar. The cat-row at `padding: 14px 12px` gives a comfortable ~48px hit height. These are the most-touched elements and they pass.
- The back arrow is the single clearest dead-zone violation. It sits top-left with a visual hit zone of approximately 23x23px before negative-margin expansion; the `p-1.5 -m-1.5` pattern expands it to ~35x35px — short of the required 44x44px. This is the hardest-to-reach point on the entire screen for a right-handed user and also the smallest tap target.
- The Copy pill lives top-right. At 375px, the right-cluster competes for space: back arrow (left edge) to Copy pill (right edge) with star and reset between. On the smallest phones the Copy pill is reachable but requires a thumb stretch across the top band — it is not in the natural thumb arc.
- The drawer in State A is 47px tall (`py-3.5` = 14px top + 14px bottom + ~19px text) which is close to the 44px minimum but does not carry `min-h-[44px]` explicitly. The State A drawer is not interactive (it is `aria-hidden="true"`), so this is a non-issue for tapping — but the State C collapsed-bar button, which IS tappable, only gets `py-3` (12+12+19=43px), marginally below 44px.
- The ASPECTS numeric input field is explicitly `width: 48px; padding: 4px 8px` — a visual and tap-target height of approximately 30px. This is the single most significant sub-44px interactive element in the pathway and the one most likely to require a second tap or zoom on a phone.
- The 90-second question: **No, this pathway cannot reliably be completed in 90 seconds at 375px on a first run.** Five category rows in Step 1 alone, each requiring a tap-to-open and a second tap to select, is a minimum of 10 deliberate touches before reaching Step 2. With slow rendering and even a single mis-tap, that step alone consumes 45-60 seconds. The design is not broken — it is the right pattern for the complexity — but V should set expectations that bedside use is "pull it out, fill it in while walking," not "90-second sprint."

---

## Method

**Frames audited:** All 6 frames from `docs/specs/mockups/pathway-evt-reference.html` (Round 6).

**Simulated viewports:**
- iPhone SE: 375x667px (primary test — smallest common phone, one-handed use most common)
- iPhone 14 / 14 Pro: 390x844px (reference for thumb-arc differences on taller phones)
- Pixel 7 equivalent: 412x915px (Android reference, slightly wider)

**Assumptions:**
- Right-handed grip dominant (left-hand grip mirrors all left/right findings).
- No keyboard open during accordion steps (keyboard open is addressed in Finding 7).
- Safe-area-inset-bottom assumed at 34px (iPhone with home bar).
- The `mockup-frame` max-width is 440px, so at 375px the frame fills the viewport with a small body margin. All pixel estimates use the 375px inner content width.
- Line heights and exact rendered pixel heights are calculated from the CSS classes in the mockup file, not measured from a browser; small rounding errors (1-2px) are possible.

---

## Findings

---

### F-01 — Back arrow tap target is sub-44px

**Severity:** Medium
**Frame:** All frames (header is identical across all 6)
**Element:** `<button class="p-1.5 -m-1.5" aria-label="Back">`

**What is not friendly:** The back arrow button uses `p-1.5` (6px padding all sides) around a 20x20px SVG, giving a visual target of 32x32px. The negative margin `-m-1.5` is intended to expand the interactive hit area, but negative margin expands the *layout boundary*, not the actual clickable region in most browser implementations unless the parent is `overflow: visible` and the element uses `position: relative`. The expanded tappable area is approximately 32+6+6=44 in theory, but CSS hit testing on the actual `<button>` element is constrained to its padding box. Net result: the real tappable area is approximately 32x32px — 12px short in each dimension.

More critically, this button is at the top-left corner of the screen — the hardest physical reach point for right-handed one-thumb use. A user holding the phone in their right hand must bring their thumb all the way to the upper-left dead zone to navigate back, or switch to two-handed use.

**Why it matters at the bedside:** At 2 AM during a stroke code, the user has the phone in one hand and may be moving. Missing the back arrow by 5px and hitting the header background — which has no action — is an invisible failure mode. The user assumes the tap registered. A second check 10 seconds later reveals nothing happened.

**Recommended change:** Increase to `p-3 -m-3` on the back arrow button, matching the exact pattern used on the branch chips (which the spec correctly upgraded). This brings the hit area to ~44px minimum. The back arrow spec in PATHWAY_SPEC §2 currently reads `p-1.5 -m-1.5` — this should be escalated as a spec correction. The calculator-reference.html uses the same `p-1.5 -m-1.5` pattern, so this finding applies to the entire calculator family.

**Risk if shipped:** Back navigation fails silently on small fingers or gloved hands. User resorts to browser back button or app switcher — breaks the tool flow mid-pathway.

**Class:** C (UI fix, no clinical logic)

---

### F-02 — ASPECTS numeric input height is 30px — hard sub-44 violation

**Severity:** High
**Frame:** Frame 3 (Step 3 active with ASPECTS input), Frame 4, Frame 5 (implied — same pattern)
**Element:** `.cat-input-field` — `width: 48px; padding: 4px 8px;`

**What is not friendly:** The ASPECTS input field has 4px padding top and bottom plus approximately 14px line height for a total rendered height of approximately 22px. Even accounting for the surrounding `.cat-input-row` padding (`padding: 10px 12px`), the *tappable field itself* is 22px tall. A user trying to tap into this field must be precise to within an 11px vertical window. On a capacitive screen with a finger, that is not reliable — the touch point center needs to land within 22px.

The spec (PATHWAY_SPEC §4.4) explicitly requires `min-h-[44px] w-28 px-4 py-2` for numeric inputs, quoting CALCULATOR_SPEC §4.6. The mockup's `.cat-input-field` implementation contradicts this — it uses `padding: 4px 8px` (from the old PATHWAY_SPEC §3.7 "Numeric input variant") instead of the canonical `py-2 px-4 min-h-[44px]` from §4.4.

This is a spec conflict between §3.7 (category-row numeric variant: `padding: 4px 8px; width: 48px`) and §4.4 (canonical numeric input: `min-h-[44px] w-28 px-4 py-2`). The mockup follows §3.7; the spec §4.4 is the canonical requirement. §4.4 wins — it is the more specific, later-authored canonical rule.

**Why it matters at the bedside:** ASPECTS is the single most critical numeric input in the EVT pathway. A score of 6 vs 7 changes the eligibility decision. On a phone during a stroke code, the user needs to reliably tap into a small number field and type a single digit. A 22px-tall field means the keyboard opens intermittently or not at all on first tap.

**Recommended change:** Implement the §4.4 canonical pattern for the ASPECTS input: `min-h-[44px] w-28 px-4 py-2 rounded-lg border border-slate-200`. This makes the field taller, which means the `cat-input-row` layout needs to adapt (flex items vertically centered, the "/ 10" unit label aligns center). Width `w-28` (112px) is also wider than the current 48px — this gives the user more visual feedback on what they typed.

**Risk if shipped:** Users mis-tap the ASPECTS field, keyboard does not open, they do not notice, and they attempt to continue the pathway with an empty ASPECTS field. Alternatively, they zoom in (iOS double-tap zoom triggers at this target size), losing their scroll position.

**Class:** C

---

### F-03 — Collapsed drawer toggle (State C) is 43px tall — marginally sub-44

**Severity:** Low
**Frame:** Frame 3 (State C-1 collapsed), Frame 4 (State C-2 expanded header button), Frame 5 (State C-3)
**Element:** `<button class="w-full flex items-center justify-between px-5 py-3 ...">` (the tappable collapsed drawer)

**What is not friendly:** The State C collapsed drawer toggle uses `py-3` (12px top + 12px bottom). With approximately 17-19px of text inside, the total rendered height is approximately 41-43px — just below the 44px minimum. The State A drawer uses `py-3.5` (14px padding) and is not interactive, so that is fine. The State C button needs `py-3.5` or `min-h-[44px]` explicitly.

**Why it matters at the bedside:** The drawer toggle is the *primary outcome action* — it is how the user reads the interpretation result. On the first tap after completing the pathway, a miss registers nothing. The user pauses, looks at the screen, tries again.

**Recommended change:** Change `py-3` to `py-3.5` on the State C drawer toggle button, or add `min-h-[44px]`. This is a 2px change.

**Risk if shipped:** Low probability first-tap miss on the most important interaction in the pathway. Recoverable on second tap.

**Class:** B (2-line change, no clinical logic)

---

### F-04 — Rail branch chips: hit target math requires verification

**Severity:** Low (spec says pass; implementation deserves a build-time check)
**Frame:** Frames 2-5
**Element:** `<div class="p-3 -m-3" style="display:inline-block;"> <button class="branch-chip">...</button> </div>`

**What is not friendly — or rather, what passes:** The spec comment in the mockup explicitly notes "Hit target 44×44 achieved via p-3 -m-3." The visible pill itself is `text-[11px] px-2 py-0.5`, approximately 11px tall visually. The wrapping div with `p-3` (12px padding) theoretically expands the hit area to 11 + 24 = 35px in height — still short of 44px without the negative margin. With negative margin `-m-3` the layout boundary collapses but the rendered interactive area should extend.

In practice, the combination of `display: inline-block` on the wrapper and a `<button>` child means the clickable area IS the button's padding box, which is only `px-2 py-0.5` plus the `p-3` parent padding that is inherited through visual stacking. This is not how CSS hit testing works — the negative margin on the parent does not expand the button's own hit box.

The real minimum tap target for these chips is approximately 11px (line height) + any button padding added to the chip. The branch-chip CSS shows `padding: 2px 8px` — so the button itself is 2+14+2 = 18px tall. The wrapping div adds 12px on each side in layout, but this only works if the wrapper itself is the hit target, not the inner button.

**Recommendation for build:** During implementation, verify by setting `min-h-[44px]` directly on the `<button class="branch-chip">` element rather than relying on wrapper expansion. The visual pill can remain small via `display: inline-flex; align-items: center;` with padding eating into the min-height invisibly. This is the robust pattern.

**Risk if shipped:** Chips may have a smaller true hit area than spec claims. Not a blocker since chips are a secondary navigation affordance (they supplement, not replace, the category-row back-and-change workflow), but builds should verify.

**Class:** C (implementation verification, not a mockup change)

---

### F-05 — Copy pill top-right: reachable but in the thumb stretch zone

**Severity:** Low
**Frame:** All frames
**Element:** `<button class="ml-1.5 bg-neuro-500 ... min-h-[44px]">Copy</button>`

**What is not friendly:** The Copy pill sits top-right. At 375px with `px-5` header padding, the right edge of the Copy pill is approximately 20px from the screen's right edge. On a 375px wide phone with a right-handed grip, the top-right corner is a stretch zone — the thumb must move 80-100px upward and 60px rightward from the natural resting position. It is not a dead zone; it is reachable in ~0.8-1.2 seconds with deliberate thumb movement.

However, Copy is not a primary action — it is a post-completion action used to transfer results to an EMR or team message. Users will invoke Copy once, after completing the pathway, not repeatedly during entry. For a once-per-session action, top-right is acceptable.

The `min-h-[44px]` on the Copy button is confirmed in the spec (PATHWAY_SPEC §2 and CALCULATOR_SPEC). The button passes the touch target standard.

**Note:** Copy being in the header means it is always accessible regardless of scroll position, which is the right call for a sticky header action.

**Recommended change:** None for current design. Accept the stretch for a post-completion action. Monitor in user testing.

**Risk if shipped:** Minimal. Post-completion action at a stretch-zone location is acceptable UX.

**Class:** Informational (no change needed)

---

### F-06 — Star and Reset icon buttons: `p-2` gives ~40x40px hit area

**Severity:** Low
**Frame:** All frames
**Element:** `<button class="p-2 rounded-full" aria-label="Favorite">` and `<button class="p-2 rounded-full" aria-label="Reset">`

**What is not friendly:** `p-2` is 8px padding around an 18x18px SVG, giving a rendered hit area of 34x34px. The design-tokens SKILL.md specifies `p-2 -m-1.5` for star/fav buttons. The mockup omits the `-m-1.5` negative margin that would expand the hit area toward 44px. The actual hit area remains approximately 34x34px.

For the Reset button (SVG 17x17), the math is 17+16=33px rendered height.

These buttons sit at the top-right cluster, which is already a stretch zone (F-05). Small buttons in a stretch zone compound the difficulty.

**Recommended change:** Add `-m-1.5` to both buttons per design-tokens SKILL.md, and consider whether the visual separation between star, reset, and Copy is sufficient to prevent accidental taps. Current gap is `gap-0.5` (2px) between star and reset, which is below the recommended 8px between touch targets. At 34px per button with 2px gap, there is a real risk of hitting Reset when aiming for Copy.

**Risk if shipped:** Accidental Reset during a completed pathway, clearing all entered data. The gap between Reset and Copy is 2px — a fat-finger error on an already-stretched thumb reaching for Copy could hit Reset instead.

**Class:** C (layout adjustment — increase gap between Reset and Copy)

---

### F-07 — Rail left-edge placement forces left-side taps for right-thumb users

**Severity:** Low-Medium
**Frame:** All frames (Step 1 active, Steps 2-4 locked)
**Element:** Rail nodes at `margin-left: 14px` and branch chips sitting at the left edge of the rail content area

**What is not friendly:** The vertical rail is positioned at `margin-left: 14px` from the content left edge. With `px-5` (20px) page padding, the node sits at approximately 34px from the left screen edge. The branch chips are `inline-block` and flow naturally leftward within the rail content area.

For a right-handed user holding the phone in their right hand, the natural thumb arc sweeps from center to right-center of the screen. Tapping elements at x=34-80px (rail area) requires either a left-hand assist or a deliberate inward sweep that pulls the thumb off a natural arc.

Branch chips are the specific concern. In Frame 2, the Step 1 chip reads "Anterior LVO · Confirmed · mRS 0–1 · Age 18–79" — this text is approximately 220-230px wide at 11px font. At 375px viewport with 20px left padding and 14px rail margin and 20px rail padding-left (from `.rail-cobalt`), the chip starts at approximately x=54px. The chip content therefore spans from x=54 to approximately x=270px, placing most of the chip well into reachable territory. The left edge of the chip (the tappable start) is at x=54px — reachable for right-handed users but requires an inward thumb movement.

This is not a blocking issue because the chip's `p-3 -m-3` wrapper extends the hit area leftward, and most of the chip text is in a reachable zone. But during implementation, confirm that the chip's effective hit area extends from approximately x=30px (after negative margin) to x=270px+.

**Recommended change:** No design change needed. Verification note for implementation: test chip tap activation at the left edge (x=30-60px) on a physical device.

**Risk if shipped:** Minor — chips in center screen are easily tapped. Left-edge taps on chips may be unreliable.

**Class:** Informational (no change needed; implementation verification)

---

## Bedside-specific findings

---

### BF-01 — Category row chevron has a generous tap zone

**Verdict:** Passes for gloved use.

The `.cat-row` button is the full row width (`width: 100%`) with `padding: 14px 12px`. This means the entire row — including the label, value, and chevron — is one tap target approximately 48px tall and 335px wide (at 375px minus 40px for `px-5` page padding). A gloved hand, a wet thumb, or a fat-finger contact anywhere on the row activates the accordion. The chevron is a visual affordance only — the actual hit target is the full row. This is correct behavior and should be preserved in implementation.

---

### BF-02 — Accordion options need a minimum height check

**What to verify:** The `cat-option` buttons inside the expanded accordion use `padding: 10px 12px 10px 16px`. At 14px text, total height is approximately 10+14+10=34px. This is sub-44px for the accordion option buttons — the most critical selection interaction (choosing "Anterior Circulation" vs "Posterior Circulation" inside the LVO Location accordion).

At 375px with two options in the accordion, each option button is 34px tall with a small gap between them. For a gloved or wet-finger tap, this is tight.

**Recommended change:** Increase accordion option padding to `py-3.5` (14px) to bring each option to 14+28=42px, approaching 44px. Or add `min-h-[44px]` to `.cat-option`.

**Risk:** A user selects the wrong LVO location (Anterior vs Posterior) because the touch registered on the adjacent option. This is a clinical consequential mistake — it changes the eligibility pathway output.

**Severity:** High (clinical consequence of misselection)
**Class:** C-clinical (incorrect selection changes pathway result)

---

### BF-03 — No visible "you tapped this" feedback on cat-row selection

**What to observe:** The category row uses a `hover:background-color` transition (12ms) for feedback. On capacitive touchscreens, hover states do not fire — the first touch event fires `pointerdown` and `click` in rapid succession. The 12ms hover animation is invisible in a tap interaction. The only feedback the user gets from tapping a category row is the accordion expanding.

For users who cannot see the screen clearly (reflective hospital light, screen at an angle), there is no haptic, no color pulse, no badge change in the header to confirm the tap registered. This is a bedside problem: the user taps, moves their eye away, and does not know if the accordion opened.

**This is an implementation note, not a mockup-correctable issue.** The implementation should add `active:bg-slate-100` to the `.cat-row` CSS so users get a visible flash on `touchstart`. This is a 1-class addition.

**Severity:** Medium (no clinical risk, but causes re-taps and slows completion)
**Class:** C

---

### BF-04 — Cascade notice Undo button tap target is approximately 32px tall

**Frame:** Frame 6
**Element:** `<button style="padding: 2px 8px; ...">Undo</button>` inside `.cascade-notice`

**What is not friendly:** The inline Undo button uses inline styles with `padding: 2px 8px`. Rendered height: 2+14+2=18px. Width: 8+content_width+8 ≈ "Undo" text at ~28px + 16px padding = ~44px wide. The height of 18px is severely sub-44px.

The cascade notice itself is `inline-flex` with `padding: 6px 12px`, adding vertical context. But the Undo button is visually and physically small within that pill. A gloved or hurried thumb will frequently miss Undo.

**Why this specifically matters:** Undo is the "I accidentally cleared three steps of pathway data during a stroke code" recovery action. If the clinician cannot tap Undo reliably in the 4 seconds before it auto-dismisses, they lose all prior answers and must re-enter from the changed step. In a stroke code, this is a 60-second re-entry burden.

**Recommended change:** Add `min-h-[44px]` and `px-4` to the Undo button, and use negative vertical margin (`-my-[13px]`) to visually shrink it inside the pill while maintaining the tap target. Alternatively, make the entire cascade-notice pill the Undo affordance (tap anywhere on the notice to undo), with a secondary smaller label. This pattern keeps the inline non-toasty feel while expanding the hit zone.

**Risk if shipped:** User cannot tap Undo in time, loses all downstream pathway answers, must re-enter. High friction in time-critical scenario.

**Severity:** High (impacts error-recovery in time-critical bedside context)
**Class:** C

---

## Drawer ergonomics (dedicated section)

### State A — Muted bar (no inputs)

**At 375px:** The State A drawer is `py-3.5` on a non-interactive `<div aria-hidden="true">`. Total height: 14+14+19(text)=47px. It sits at the bottom of the screen with `bottom: calc(var(--tab-bar-height, 0px) + env(safe-area-inset-bottom, 0px))`. In the mockup, both CSS variables are 0px, which is correct for a standalone page without a tab bar. In the actual implementation, `--tab-bar-height` will be non-zero (the bottom navigation tab bar). The mockup does not simulate this.

**Missing tab-bar simulation is an audit gap.** When the tab bar is present (e.g., 49px on iOS, 56px on Android), the drawer will be pushed 49-56px higher, meaning the State A bar appears at y=667-47-49=571px from the top on iPhone SE. This is in the thumb zone and is fine. But the page content must have adequate `padding-bottom` to avoid the last content item being obscured by the drawer. The mockup uses `.drawer-spacer-collapsed { height: 80px; }` which provides 80px of clearance — this covers both the 47px drawer and a 33px buffer. At 49px tab-bar, the combined drawer+tab = 96px, which slightly exceeds the 80px spacer by 16px. Needs verification in implementation.

**Verdict:** State A ergonomics are fine for the standalone case. Implementation must verify that `drawer-spacer-collapsed` (80px) is still adequate when tab bar adds 49-56px.

### State C-1 — Eligible, collapsed (tappable toggle)

**At 375px:** The tappable row uses `py-3` (12px padding). Total rendered height: 12+12+19=43px — 1px below the 44px minimum (Finding F-03). The text "Eligible · EVT reasonable" at `text-sm font-medium` reads cleanly at 14px. The bouncing chevron animation (`drawer-chevron-hint`) is a good affordance for discoverability. The `hover:bg-slate-50` state is invisible on touch (hover does not fire) — same note as BF-03. Add `active:bg-slate-100` in implementation.

**Reachability:** Bottom of screen (after tab bar inset). Bottom-center is the most naturally reachable area for both right- and left-handed users. This is correct placement for the primary outcome action.

### State C-2 — Avoid EVT, expanded (full drawer visible)

**At 375px:** The expanded drawer uses `max-h-[60vh]` for its scroll content. At 375x667 viewport, 60vh = 400px. The drawer header button takes ~43px. Total drawer height: 43 + 400 = 443px. This consumes 443/667 = 66% of the viewport height.

At 375px, after the drawer expands, the user can see approximately 667-443-49(tab bar) = 175px of page content above the drawer. The top of the pathway content (header ~72px + step 1 node + first completed row) is approximately 170-200px. This means the expanded drawer nearly covers all the pathway body content on an iPhone SE, leaving only the header and the very first step visible above.

**This is a bedside readability concern.** After the "Avoid EVT" result appears in the expanded drawer, the clinician reads the assessment summary (dl rows showing LVO, mRS, ASPECTS) and the reasoning paragraph. The assessment summary and "See also" links together are approximately 200-250px of content at the font sizes used. With `max-h-[60vh]` and `overflow-y-auto`, this content scrolls inside the drawer. The clinician must scroll within a 400px window while the rest of the page is invisible behind the drawer.

**Verdict:** Functional but cognitively heavy. The clinician's brain must track: (1) what they entered (now hidden behind the drawer), (2) what the drawer says. The assessment summary inside the drawer mitigates this — it reproduces the key inputs next to the interpretation, so the clinician does not need to scroll the page to cross-check. The design made the right call here. No change recommended, but the assessment summary's presence is load-bearing for this ergonomic tradeoff.

### State C-3 — Clinical Judgment, expanded (amber drawer)

**Same geometry as C-2.** At 375px the amber tint correctly distinguishes this from the Eligible state. The amber header text (`text-amber-700`) at `text-sm` is readable but low-contrast against `bg-amber-50` background — approximately 4.1:1 contrast ratio, which is just above the WCAG AA 4.5:1 threshold for normal text. For the specific `text-[10px]` eyebrow label ("INTERPRETATION" in amber-700 on amber-50), contrast will be below AA for small text. This is a finding for the accessibility-specialist agent, not this audit.

---

## Thumb-zone heatmap (textual)

Reference: 375px wide, right-handed grip. Thumb arc center is approximately at x=280-300px, y=500-560px (bottom-right quadrant). Upper-left is the dead zone; bottom-center is the sweet spot.

| Element | Approximate position | Reachability (right-handed) |
|---|---|---|
| Back arrow button | x=14-46px, y=14-46px (after header padding) | Dead zone. Hardest reach. Sub-44px hit area compounds difficulty. |
| PATHWAY eyebrow + name | x=60-180px, y=10-50px | Not interactive — informational. |
| Star (Favorite) button | x=290-330px, y=10-50px | Stretch zone (top-right). Reachable with deliberate movement. |
| Reset button | x=330-364px, y=10-50px | Stretch zone (right edge). Adjacent to Copy; accidental tap risk. |
| Copy pill | x=334-374px, y=10-50px | Stretch zone (top-right corner). Post-completion action; acceptable. |
| Rail nodes (visual only) | x=14-26px | Not interactive directly; not a concern. |
| Branch chip buttons | x=34-280px (chips vary by text length), y=variable | Left edge borderline (x=34px); right portion in thumb zone. Acceptable. |
| Category row buttons (full width) | x=0-375px, y=variable | Full-width rows — entire row is the hit target. Excellent. |
| Accordion option buttons (cat-option) | x=12-363px, y=variable | Full-width options. Height 34px (sub-44 — BF-02 finding). |
| ASPECTS input field | x=295-343px (right-aligned, 48px wide), y=variable | Reachable (right side). But 22px tall — height is the problem, not x-position. |
| Cascade-clear Undo button | x=265-320px (estimated), y=within Step 1 area | Reachable position but 18px tall — height critical failure (BF-04). |
| Drawer toggle (State C, collapsed) | x=0-375px, y=620-663px on iPhone SE | Bottom-center. Optimal thumb zone. Excellent position, borderline height (43px). |
| Drawer expanded scroll area | x=0-375px, y=267-667px | Center-to-bottom. Scrolling within drawer is one-thumb compatible. |

---

## Direct answer to V

This design is conditionally ready for bedside use. The pattern is correct — the vertical rail, category-row accordions, and bottom drawer are the right architecture for a one-handed phone interaction during a stroke code. Round 6 got the macro-ergonomics right: the drawer is at the bottom (thumb zone), the rows are full-width and tall (easy to tap), and the chips are now buttons with expanded hit areas (the right call).

But three specific elements must be fixed before shipping to a bedside user. First, the ASPECTS input field is a 22px tap target in a clinical decision surface — this needs `min-h-[44px]` per the spec's own §4.4 requirement. Second, the accordion option buttons inside each category row are 34px tall, and a wrong tap between "Anterior" and "Posterior" has a different clinical outcome — those buttons need `min-h-[44px]` or `py-3.5`. Third, the Undo button inside the cascade-clear notice is 18px tall and auto-dismisses in 4 seconds — a clinician who changed an answer by mistake has a 4-second, 18px-button recovery window, which is too harsh for a time-pressured bedside context.

Round 7 needs three targeted fixes: the input heights (F-02 and BF-02), the Undo target size (BF-04), and a 2px padding increase on the State C drawer toggle (F-03). The back arrow (F-01) and the Reset/Copy gap (F-06) are real but lower-priority improvements that can be batched into a broader header-standard pass across the calculator family. The 90-second completion target is achievable on the second or third use of the pathway (after the clinician is familiar with the step structure), but first-time use will likely take 3-4 minutes at 375px — this is not a design failure, it is an accurate reflection of the clinical complexity of the EVT eligibility decision.

---

## Findings summary

| ID | Element | Severity | Recommended action |
|---|---|---|---|
| F-01 | Back arrow hit target (~32px) | Medium | Increase to `p-3 -m-3`; update PATHWAY_SPEC §2 |
| F-02 | ASPECTS numeric input height (~22px) | High | Apply §4.4 canonical `min-h-[44px] py-2 px-4` |
| F-03 | State C drawer toggle height (~43px) | Low | Change `py-3` to `py-3.5` |
| F-04 | Branch chip hit-target via wrapper math | Low | Verify in implementation; set `min-h-[44px]` directly on button |
| F-05 | Copy pill position (top-right stretch) | Informational | No change; post-completion action |
| F-06 | Star/Reset `gap-0.5` too narrow; `p-2` without `-m-1.5` | Low | Add `-m-1.5`; widen gap to `gap-2` |
| BF-01 | Category row chevron tap zone | Pass | No change |
| BF-02 | Accordion option button height (~34px) | High (clinical) | Add `min-h-[44px]` or `py-3.5` to `.cat-option` |
| BF-03 | No `active:` tap feedback on rows | Medium | Add `active:bg-slate-100` in implementation |
| BF-04 | Undo button height (~18px), 4s window | High (bedside) | Expand hit target; consider full-pill-as-Undo pattern |
