# Stroke Code Pathway — Deep Learning + Tidbits Design Parity Audit
Date: 2026-05-19
Auditor: ui-architect (with design-tokens skill, design:design-system, design:design-critique)
Reference patterns: TrialPageNew, TrialLegendCard, PathwayHeader, CalculatorHeader, guide layout
Scope: pearl detail view, deep-learning modal, inline tidbits, detailed-view modals (Stroke Code only)

---

## Summary
- Files audited: 11
- Findings by severity: MUST-FIX 14 · SHOULD-FIX 18 · POLISH 9
- Banned-token hits: 8 (blue-*, purple-*, sky-*, bg-black/50, gradient hardcodes)
- Anatomy divergences from canonical headers/modals: 6
- Plain-English headline: Several surfaces inside the Stroke Code deep-learning tool and order-entry step look and feel different from the rest of NeuroWiki — they use ad-hoc colors, non-standard card shapes, and a "study link" card built from a gradient that NeuroWiki does not use anywhere else. The pearl detail view itself is structurally close to spec but has small but visible typography and shape deviations. The biggest visual mismatch is the trial-link card in TrialEmbed (blue-to-purple gradient) and the order categories in Step 4 (sky-*, purple-*, blue-* palette). Both will look foreign to any clinician who arrives from the trial pages or calculator pages.

---

## A. Pearl detail view ("research tool") — full anatomy audit

**File:** `src/components/article/stroke/PearlDetailView.tsx`

### A-1 — MUST-FIX · Modal container radius
- **Line 49:** `rounded-2xl` on the modal container.
- **Spec:** canonical modal radius is `rounded-xl` (ProtocolModal line 142 uses `rounded-2xl` but is itself non-canonical; CalculatorHeader, SectionPearls, all step cards use `rounded-xl`). The design-tokens skill states `rounded-xl` for containers.
- **Fix:** `rounded-2xl` → `rounded-xl` on the modal container div (line 49), header (line 53), and footer (line 214).

### A-2 — MUST-FIX · shadow-2xl on modal container
- **Line 49:** `shadow-2xl` on the content container.
- **Spec:** design-tokens bans `shadow-2xl` outside emphasized surfaces. Canonical modals (ProtocolModal) use `shadow-2xl` but that is itself a deviation being audited. Standard card elevation is `border border-slate-100` with no shadow; elevated containers use `shadow-lg` at most.
- **Fix:** `shadow-2xl` → `shadow-lg` or remove and rely on backdrop isolation.

### A-3 — SHOULD-FIX · Header H3 title typography
- **Line 74:** `text-xl sm:text-2xl font-semibold text-slate-900` for the pearl title.
- **Spec:** the canonical page H1 is `text-[22px] md:text-[28px] font-medium tracking-[-0.01em]`. A modal H2/H3 should follow `text-base font-semibold` (as in ProtocolModal line 151) not `text-xl/2xl`. This inflates the visual weight relative to ProtocolModal and CalculatorHeader.
- **Fix:** `text-xl sm:text-2xl font-semibold` → `text-base font-semibold tracking-tight` to match ProtocolModal anatomy.

### A-4 — SHOULD-FIX · Type badge uses non-canonical padding
- **Line 77:** `px-3 py-1 text-sm font-semibold rounded-full` for TRIAL/PEARL type badge.
- **Spec:** muted meta tokens are `text-[11px] font-medium uppercase tracking-[0.04em]`. The `text-sm font-semibold` weight and size are inflated; should match eyebrow badge pattern.
- **Fix:** `px-3 py-1 text-sm font-semibold rounded-full` → `px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full` to align with eyebrow label scale.

### A-5 — SHOULD-FIX · Evidence chip border uses rounded not rounded-xl
- **Lines 88, 93:** `rounded` on evidence class/level chips.
- **Spec:** inner chips use `rounded-lg`; atomic pills use `rounded-full`. Plain `rounded` (4px) is not in the token set.
- **Fix:** `rounded` → `rounded-lg` on both chips.

### A-6 — SHOULD-FIX · "Key takeaway" callout uses border-l-4 (banned in chrome)
- **Line 104:** `border border-amber-200 border-l-4 border-l-amber-500 rounded-lg` on the plain-English box.
- **Spec:** `border-2` and `border-b-2` are banned in chrome. `border-l-4` is a specific left-accent pattern that is acceptable on content callouts (ProtocolModal uses it for severity), but the amber-500 left-border color and amber-50 background represent a compound token mix that is inconsistent with ProtocolModal's severity strip. The `border-l-amber-500` syntax after `border border-amber-200` also produces a Tailwind class conflict (conflicting border color declarations).
- **Fix:** use a single border approach: `border border-amber-200 border-l-[3px] border-l-amber-400 rounded-lg bg-amber-50` — or adopt the ProtocolModal severity-strip pattern (`border-l-2 border-amber-400 pl-4`).

### A-7 — SHOULD-FIX · Section sub-headers use `uppercase tracking-wide` not canonical eyebrow
- **Lines 121, 138, 165, 183:** `text-sm font-semibold text-slate-900 uppercase tracking-wide` for Overview / Clinical Tips / Evidence / Reference section headers.
- **Spec:** section labels per CALCULATOR_SPEC §1.5 are `text-[10px] font-bold uppercase tracking-widest text-slate-400`. These are using `text-sm` (too large) and `text-slate-900` (too dark) — they read as body headings, not eyebrow labels.
- **Fix:** `text-sm font-semibold text-slate-900 uppercase tracking-wide` → `text-[10px] font-bold uppercase tracking-widest text-slate-400` on all four section labels.

### A-8 — POLISH · Overview block uses border-l-4 accent
- **Line 125:** `border-l-4 border-neuro-500` on the overview block.
- Acceptable for content callouts but inconsistent with body cards in SectionPearls which use `border border-slate-100` without left-accent. Low risk, visual inconsistency only.

### A-9 — POLISH · Footer disclaimer text
- **Line 215:** "Clinical guidance with trial references" — content-only, no design issue, but the `text-xs text-slate-400 text-center` styling is correct and matches canonical muted-meta token.

### A-10 — MUST-FIX · Back button touch target
- **Lines 56–61:** Back button is `px-3 py-2` with no `min-h-[44px] min-w-[44px]`. The rendered height is approximately 36px.
- **Spec:** CALCULATOR_SPEC §2.4 requires all interactive elements ≥44×44px.
- **Fix:** add `min-h-[44px]` to back button class string.

### A-11 — MUST-FIX · Header back/close row does not follow PathwayHeader anatomy
- The pearl detail view reinvents a two-button header with custom layout (lines 54–70). PathwayHeader and CalculatorHeader use: back-arrow SVG `M19 12H5M12 19l-7-7 7-7` + eyebrow identifier block + right-cluster. PearlDetailView instead stacks a labeled "Back to Pearls" text button alongside an X button with no eyebrow label structure.
- **Fix:** adopt PathwayHeader anatomy: back-arrow SVG + left identifier block ("DEEP LEARNING" eyebrow + pearl title) + X on right. This brings it into parity with every other modal header on the platform.

---

## B. Deep Learning Modal + SectionPearls

**Files:** `src/components/article/stroke/DeepLearningModal.tsx`, `src/components/article/stroke/SectionPearls.tsx`

### B-1 — MUST-FIX · DeepLearningModal panel uses border-slate-200 not canonical hairline
- **Line 146 (DeepLearningModal):** `border-b border-slate-200` on the sticky header.
- **Spec:** canonical hairline is `border border-slate-100` (or `border-slate-100 dark:border-slate-700/60`). `slate-200` is not in the canonical hairline set.
- **Fix:** `border-slate-200` → `border-slate-100` on the sticky header border-b and filter area borders (lines 146, 170, 281).

### B-2 — SHOULD-FIX · DeepLearningModal header typography hierarchy
- **Lines 157–163:** Eyebrow is `text-xs font-bold text-slate-500 uppercase tracking-wider`, then a `text-sm font-bold text-slate-900` label, then `text-xs text-slate-500` pearl count.
- **Spec:** canonical eyebrow is `text-[10px] font-bold uppercase tracking-widest text-slate-400` (note: `tracking-wider` is not the canonical token; `tracking-widest` is).
- **Fix:** `text-xs font-bold text-slate-500 uppercase tracking-wider` → `text-[10px] font-bold uppercase tracking-widest text-slate-400`.

### B-3 — SHOULD-FIX · Filter "Select All" / "Clear All" buttons have no min touch targets
- **Lines 179, 186:** `text-xs font-medium` text-only buttons with no padding or min-h.
- **Spec:** minimum 44×44px. These are approximately 16×16px tap targets.
- **Fix:** wrap each in a `min-h-[44px] flex items-center` or add `p-2 -m-2` to each.

### B-4 — SHOULD-FIX · Pearl list cards use border-slate-200 not canonical hairline
- **Line 345 (DeepLearningModal):** `border border-slate-200` on each pearl list card.
- **Spec:** section cards use `bg-white border border-slate-100 rounded-xl p-4`. `slate-200` is heavier than the canonical card hairline.
- **Fix:** `border-slate-200` → `border-slate-100`.

### B-5 — SHOULD-FIX · Pearl list card "Tap to expand" chevron uses inline SVG fill path
- **Lines 394–398:** custom filled SVG chevron with `fill="currentColor"` hardcoded `path` with `fillRule`.
- **Spec:** all icons should use Lucide (already imported). Replace with `<ChevronRight className="w-3 h-3" />`.

### B-6 — SHOULD-FIX · Pearl list card title uses font-bold not canonical section-header weight
- **Line 349:** `font-bold text-base text-slate-900` for pearl title in list.
- **Spec:** card titles use `text-sm font-semibold` (section header scale). `font-bold text-base` is heavier than TrialLegendCard's `text-sm font-semibold tracking-[0.01em]` reference.
- **Fix:** `font-bold text-base` → `text-sm font-semibold tracking-[0.01em]`.

### B-7 — POLISH · DeepLearningModal panel max-width (mobile)
- **Line 143:** on mobile the panel is `bottom-0 left-0 right-0 h-[90vh]`. This is consistent with the bottom-sheet pattern used elsewhere. No fix required.

### B-8 — MUST-FIX · SectionPearls eyebrow Info icon inside eyebrow label text
- **Line 73 (SectionPearls):** `<Info className="w-4 h-4" />` inside the `text-[10px] font-bold uppercase tracking-widest text-slate-400` eyebrow label.
- **Spec:** eyebrow labels per CALCULATOR_SPEC §1.5 are text-only. The icon at `w-4 h-4` (16px) misaligns with the 10px text baseline and inflates the eyebrow row height.
- **Fix:** remove `<Info>` from the eyebrow label. If an icon is needed, use it outside the eyebrow element.

### B-9 — POLISH · SectionPearls hover:shadow-md on pearl cards
- **Lines 116, 117 (SectionPearls):** `hover:shadow-md` on pearl list cards.
- **Spec:** decorative `hover:shadow-*` on interior list cards is not in the canonical interaction set. TrialLegendCard uses `hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]` (a custom shadow, which is itself a known design-system pattern for list items).
- **Note:** `hover:shadow-md` is weaker than `shadow-2xl` — low risk. Consider `hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]` to match TrialLegendCard exactly.

---

## C. Step component tidbits + "Why this matters" / info boxes

**Files:** `src/components/article/stroke/CodeModeStep1.tsx`, `CodeModeStep2.tsx`, `CodeModeStep3.tsx`, `CodeModeStep4.tsx`

### Step 1

#### C-1 — SHOULD-FIX · Disabling symptoms card uses bg-sky-50 / border-sky-200 (banned palette)
- **Lines 411, 413, 429 (Step1):** `bg-sky-50 border border-sky-200` for the disabling symptoms checklist card.
- **Spec:** sky-* is a non-canonical palette. Only emerald, amber, red (severity tokens), slate (neutral), and neuro-* are permitted.
- **Fix:** use `bg-amber-50 border border-amber-200` (this card is a clinical advisory — amber maps to the "consider" severity token) or `bg-slate-50 border border-slate-100`.

#### C-2 — SHOULD-FIX · Disabling symptoms checkbox uses text-sky-600 focus:ring-sky-500
- **Line 429 (Step1):** `text-sky-600 focus:ring-sky-500` on checkbox.
- **Fix:** `text-sky-600 focus:ring-sky-500` → `text-neuro-600 focus:ring-neuro-500`.

#### C-3 — MUST-FIX · BP controlled checkbox uses text-blue-600 (banned color)
- **Line 297 (Step1):** `text-blue-600` on the BP-controlled checkbox.
- **Spec:** `blue-*` is banned; use `neuro-*`.
- **Fix:** `text-blue-600` → `text-neuro-600`.

#### C-4 — POLISH · LKW section card uses px-4 pt-4 pb-1 instead of canonical p-4
- **Lines 176–177 (Step1):** card is `bg-white border border-slate-100 rounded-xl overflow-hidden` with inner `px-4 pt-4 pb-1`. The `overflow-hidden` + partial padding pattern is a special layout case (amber callout follows below). Acceptable given the architectural intent; no fix required. Flag for awareness.

#### C-5 — SHOULD-FIX · Dosing cards use text-[9px] (below minimum type size)
- **Lines 394, 398 (Step1):** `text-[9px] font-bold uppercase tracking-widest` for the "tPA" and "TNK" dosing card eyebrows.
- **Spec:** minimum eyebrow size is `text-[10px]`. `text-[9px]` is below the design system floor.
- **Fix:** `text-[9px]` → `text-[10px]` on both dosing card eyebrows.

#### C-6 — SHOULD-FIX · NIHSS card score displays text-4xl font-semibold
- **Line 326 (Step1):** `text-4xl font-semibold text-slate-900` for the NIHSS score display.
- **Spec:** calculator score displays within headers use the `scoreDisplay` slot in CalculatorHeader which is caller-defined. Inline display of a large score with `text-4xl` is not part of the card anatomy spec (cards use `text-sm`/`text-base` for values). This is a standalone display pattern not in conflict with the spec itself, but inconsistent with how NIHSS score is rendered in its own calculator header. Minor deviation — POLISH-level unless V wants full parity.

### Step 2

#### C-7 — SHOULD-FIX · Step 1 summary bar uses border-slate-100 (correct) but rounded-lg not rounded-xl
- **Line 106 (Step2):** `bg-slate-50 border border-slate-100 rounded-lg` summary bar.
- **Spec:** section cards use `rounded-xl`. Summary bars (non-interactive info strips) may use `rounded-lg` as an inner-card. This is a POLISH deviation — acceptable but inconsistent.

#### C-8 — SHOULD-FIX · BP alert box and ICH box use rounded-lg not rounded-xl
- **Lines 118, 185 (Step2):** alert boxes use `rounded-lg`.
- **Spec:** all first-level section cards use `rounded-xl`; inner cards use `rounded-lg`. These boxes are first-level cards within the step layout, so they should be `rounded-xl`.
- **Fix:** `rounded-lg` → `rounded-xl` on alert cards at the top level of Step 2.

#### C-9 — MUST-FIX · EVT Pathway button uses bg-amber-500 hover:bg-amber-600 (non-CTA color)
- **Line 329 (Step2):** `bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg` for the "→ EVT Pathway" button.
- **Spec:** primary CTA buttons must use `bg-neuro-500 hover:bg-neuro-600 text-white` (canonical CTA token). `amber-500` is a severity indicator, not a CTA color. Using it for a primary action button conflates severity signaling with navigation.
- **Fix:** `bg-amber-500 hover:bg-amber-600` → `bg-neuro-500 hover:bg-neuro-600`. If the amber color is intentional to signal "high urgency EVT," use a neuro-500 button with an amber `AlertTriangle` icon instead.

### Step 3

#### C-10 — POLISH · GWTG milestone check marks use `✓` text glyphs
- **Lines 298, 304, 317, 323 (Step3):** `✓` and emoji-style glyph inline in status text.
- **Spec:** check marks should use Lucide `<Check className="w-3 h-3" />` (already imported in Step3). Text glyphs are not controlled by design tokens and render differently across platforms.
- **Fix:** replace `✓` with `<Check className="w-3 h-3 inline" />`.

### Step 4 (Orders)

#### C-11 — MUST-FIX · post-tpa category uses bg-red-50 / border-red-200 (arbitrary; not severity token)
- **Lines 315–322 (Step4):** `getCategoryClasses` for `post-tpa` returns `bg-red-50`, `border-red-200`, `text-red-900`, etc.
- **Spec:** red-* is a permitted severity color (unfavorable). The issue is that `post-tpa` category is not inherently an "error" or "harm" state — it is a monitoring category. Using `bg-red-50` signals danger, not just a category grouping. This is a design intent issue, not a raw token violation. However, the shade is `red-50/200/700` which sits within the severity token set, so no raw-token ban applies.
- **No raw-token violation.** Flag as SHOULD-FIX from a semantic/intent perspective: consider `bg-slate-50 border-slate-100` for category headers and reserve red for actual danger states.

#### C-12 — MUST-FIX · stroke-workup category uses bg-purple-50 / border-purple-200 / text-purple-* (BANNED)
- **Lines 323–332 (Step4):** `getCategoryClasses` for `stroke-workup` returns `bg-purple-50`, `border-purple-200`, `text-purple-900`, `text-purple-700`, `text-purple-600`, `text-purple-600 focus:ring-purple-500`.
- **Spec:** `purple-*` is explicitly banned. Use `neuro-*` or `slate-*`.
- **Fix:** replace all `purple-*` tokens in `getCategoryClasses('stroke-workup')` with `neuro-*` equivalents: `bg-neuro-50 border-neuro-100 text-neuro-900 text-neuro-700 text-neuro-600 focus:ring-neuro-500`.

#### C-13 — MUST-FIX · labs category uses bg-sky-50 / border-sky-200 / text-sky-* (BANNED)
- **Lines 333–341 (Step4):** `getCategoryClasses` for `labs` returns `bg-sky-50`, `border-sky-200`, `text-sky-900`, `text-sky-700`, `text-sky-600`, `text-sky-600 focus:ring-sky-500`.
- **Spec:** `sky-*` is not in the canonical palette.
- **Fix:** replace sky-* with `bg-slate-50 border-slate-200 text-slate-900 text-slate-700 text-slate-500 focus:ring-neuro-500` (labs is a neutral category — slate is appropriate). Alternatively use `neuro-50/100` if you want the cobalt family.

#### C-14 — MUST-FIX · general category fallback uses bg-blue-50 / border-blue-200 / text-blue-* (BANNED)
- **Lines 342–351 (Step4):** default/general case in `getCategoryClasses` uses `bg-blue-50`, `border-blue-200`, `text-blue-900`, `text-blue-700`, `text-blue-600`, `text-blue-600 focus:ring-blue-500`.
- **Spec:** `blue-*` is explicitly banned.
- **Fix:** `bg-blue-50 border-blue-200 text-blue-*` → `bg-neuro-50 border-neuro-100 text-neuro-*` throughout the general category block.

#### C-15 — SHOULD-FIX · Step 4 category header uses rounded-lg not rounded-xl
- **Line 482 (Step4):** category group wrapper is `rounded-lg border border-slate-200`.
- **Spec:** first-level group cards should be `rounded-xl`. `slate-200` border weight is also heavier than canonical `slate-100`.
- **Fix:** `rounded-lg` → `rounded-xl`, `border-slate-200` → `border-slate-100`.

---

## D. Detailed-view modals (LKW picker, Protocol, Extended IVT, Thrombectomy)

### LKWTimePicker

#### D-1 — SHOULD-FIX · Sleep onset mode toggle uses emoji glyphs in button labels
- **Lines 529, 540 (LKWTimePicker):** "⏰ Specific Time" and "🌙 Sleep Onset" buttons embed emoji glyphs in chrome text.
- **Spec:** emoji in chrome elements is banned. Use Lucide icons: `<Clock size={14} />` (already imported at top of file) for Specific Time, `<Moon size={14} />` (already imported) for Sleep Onset.
- **Fix:** replace `⏰` with `<Clock size={14} aria-hidden />` and `🌙` with `<Moon size={14} aria-hidden />`.

#### D-2 — SHOULD-FIX · Modal container uses rounded-t-2xl sm:rounded-2xl (non-canonical)
- **Line 613 (LKWTimePicker):** `rounded-t-2xl sm:rounded-2xl`.
- **Spec:** canonical radius is `rounded-xl`. `rounded-2xl` inflates corner radius.
- **Fix:** `rounded-t-2xl sm:rounded-2xl` → `rounded-t-xl sm:rounded-xl`.

#### D-3 — SHOULD-FIX · shadow-2xl on modal container
- **Line 613:** `shadow-2xl`.
- **Spec:** as in A-2, shadow-2xl is not in the canonical shadow set for modal containers.
- **Fix:** `shadow-2xl` → `shadow-lg`.

#### D-4 — POLISH · ScrollCol selection highlight uses inline style for positioning
- **Lines 77–79 (LKWTimePicker):** inline `style={{ top: itemH, height: itemH }}` on the selection highlight div.
- Necessary here because `itemH` is a dynamic prop (not a token-controlled size). Acceptable as a layout-logic value, not a color or typography value. No fix required.

#### D-5 — SHOULD-FIX · Sleep day-pill "active" state uses bg-amber-500 (CTA ambiguity)
- **Lines 307–310 (LKWTimePicker):** active day pills use `bg-amber-500 text-white`. Sleep-confirm button also uses `bg-amber-500`.
- **Spec:** amber is a severity/warning indicator. For a selected-state fill on interactive pills, `bg-neuro-500` is the canonical selected-state token ("Every selected state uses full fill: border + background"). Using amber for selection conflates the "sleep onset" domain color with selection semantics.
- **Fix (optional):** change day pill active state to `bg-neuro-500 text-white` for parity with all other selected-state pills (calendar day selected, preset pills, etc.). If V wants amber to persist as a "sleep mode" domain color, document it as a deliberate deviation.

#### D-6 — SHOULD-FIX · LKWTimePicker header uses brand-lockup icon (w-7 h-7 rounded-lg bg-neuro-500)
- **Lines 622–624 (LKWTimePicker):** `w-7 h-7 rounded-lg bg-neuro-500` icon lockup in header — this is the same pattern as ThrombolysisEligibilityModal (correct canonical pattern). No fix needed; noting parity is good.

### ProtocolModal

#### D-7 — SHOULD-FIX · Modal container uses rounded-2xl (non-canonical)
- **Line 142 (ProtocolModal):** `rounded-2xl`.
- **Spec:** `rounded-xl` is canonical for containers.
- **Fix:** `rounded-2xl` → `rounded-xl`.

#### D-8 — SHOULD-FIX · shadow-2xl on modal container
- **Line 142 (ProtocolModal):** `shadow-2xl`.
- **Fix:** same as A-2/D-3 — `shadow-2xl` → `shadow-lg`.

#### D-9 — SHOULD-FIX · Severity severity strip uses border-l-2 (correct) but the description uses text-sm text-slate-600 which is body scale
- **Line 175 (ProtocolModal):** severity description is `text-sm text-slate-600 mt-0.5` — correct body token.
- **Line 173:** severity eyebrow is `text-xs font-semibold ${severityText} uppercase tracking-wide`.
- **Spec:** eyebrow should be `text-[10px] font-bold uppercase tracking-widest`. Using `text-xs` (12px) is one size up from canonical eyebrow (10px).
- **Fix:** `text-xs font-semibold ${severityText} uppercase tracking-wide` → `text-[10px] font-bold uppercase tracking-widest ${severityText}`.

#### D-10 — MUST-FIX · Footer CTA button uses rounded-xl on primary and secondary buttons
- **Lines 217–235 (ProtocolModal):** Copy-to-EMR is `rounded-xl`, Close button is `rounded-xl`.
- **Spec:** pill-style CTAs use `rounded-full` (per CalculatorHeader Copy button: `rounded-full`). PathwayHeader Copy is `rounded-full`. `rounded-xl` on a short single-word CTA is not canonical.
- **Fix:** primary Copy button `rounded-xl` → `rounded-full`. Close button can remain `rounded-xl` as a secondary action. Alternatively unify both to `rounded-full`.

### ExtendedIVTPathwayModal

#### D-11 — SHOULD-FIX · animate-in zoom-in-95 duration-300 on modal container (non-standard animation)
- **Line 62 (ExtendedIVTPathwayModal):** `animate-in zoom-in-95 duration-300`.
- **Spec:** `animate-pulse` and `hover:scale-*` on chrome are banned decorative animations. `animate-in` from the shadcn animation library is not listed as banned, but is not used elsewhere in the modal canon (ProtocolModal, LKWTimePicker, ThrombolysisEligibilityModal have no entry animation).
- **Fix:** remove `animate-in zoom-in-95 duration-300` for consistency with all other modals. If entry animation is desired, propose as a design system addition first.

#### D-12 — SHOULD-FIX · Close button is w-8 h-8 (32px) — below 44px touch target
- **Line 80 (ExtendedIVTPathwayModal):** `w-8 h-8 rounded-full` close button.
- **Spec:** minimum 44×44px touch target.
- **Fix:** `w-8 h-8` → add `min-h-[44px] min-w-[44px]` or restructure to `p-2 -m-2` pattern.

### ThrombectomyPathwayModal

#### D-13 — SHOULD-FIX · animate-in zoom-in-95 duration-300 (same as D-11)
- **Line 58 (ThrombectomyPathwayModal):** same non-canonical entry animation.
- **Fix:** same as D-11 — remove.

#### D-14 — SHOULD-FIX · Close button is w-8 h-8 (32px) — below 44px touch target
- **Line 74 (ThrombectomyPathwayModal):** `w-8 h-8 rounded-full` close button.
- **Fix:** same as D-12 — `min-h-[44px] min-w-[44px]`.

---

## E. Banned token sweep (forbidden colors, animations, font weights, emojis)

### TrialEmbed.tsx (critically off-spec — entirely outside the design system)

- **Line 39:** `bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700` — TWO banned palettes in one gradient. `blue-*` and `purple-*` are both explicitly forbidden. This card looks entirely foreign on NeuroWiki.
- **Line 39:** `shadow-lg` on this card — borderline; `shadow-lg` is not `shadow-2xl` but is heavier than canonical card elevation.
- **Line 49:** `bg-gradient-to-r from-transparent via-white/20 to-transparent` + `translate-x-full group-hover:translate-x-full transition-transform duration-1000` — a "shine" hover animation on chrome. This is a decorative animation on an interactive element, which is in the category of banned chrome animations. The `duration-1000` also exceeds typical motion budgets.
- **Line 54:** `bg-blue-50 rounded-lg border border-blue-200` — `blue-*` is banned.
- **Line 55:** inline SVG with `text-blue-600` — `blue-*` is banned.
- **Line 77:** `border-l-4 border-blue-500` (blockquote) — `blue-*` is banned.
- **Line 91:** `border-t-2 border-slate-200` — `border-t-2` is a 2px chrome border, which is banned in chrome per the "no border-2" rule.
- **Summary:** TrialEmbed is the most severely off-spec component in this scope. It needs a near-complete token replacement:
  - Replace `blue-*`/`purple-*` gradient CTA → `bg-neuro-500 hover:bg-neuro-600 text-white rounded-xl`
  - Remove shine animation (`translate-x-full` shimmer)
  - Replace `bg-blue-50 border-blue-200` info badge → `bg-neuro-50 border-neuro-200`
  - Replace `border-l-4 border-blue-500` blockquote → `border-l-2 border-neuro-300`
  - Replace `border-t-2` footer divider → `border-t border-slate-100`

### CodeModeStep4.tsx — banned palette summary

- `bg-red-50 border-red-200 text-red-900/700/600` — red-* is in the permitted severity token set. Not a raw-token ban, but semantically misused for a non-error category.
- `bg-purple-50 border-purple-200 text-purple-*` (stroke-workup) — BANNED. See C-12.
- `bg-sky-50 border-sky-200 text-sky-*` (labs, disabling symptoms in Step1) — BANNED (sky-* not canonical). See C-13.
- `bg-blue-50 border-blue-200 text-blue-*` (general category) — BANNED. See C-14.

### CodeModeStep1.tsx — banned palette

- `text-blue-600` on BP-controlled checkbox (line 297) — BANNED. See C-3.
- `bg-sky-50 border border-sky-200` on disabling symptoms card — BANNED. See C-1, C-2.

### LKWTimePicker.tsx — emoji glyphs

- `⏰` and `🌙` in mode toggle buttons (lines 529, 540) — BANNED in chrome. See D-1.

### DeepLearningModal.tsx — border weight

- `border-slate-200` used throughout instead of canonical `border-slate-100`. See B-1.

### PearlDetailView.tsx

- `rounded-2xl` (non-canonical radius). See A-1.
- `shadow-2xl` (banned outside emphasized surfaces). See A-2.
- `border-l-4 border-l-amber-500` compound border conflict. See A-6.

---

## F. Touch-target & accessibility-from-design failures

Observed interactive elements rendering below 44×44px based on class inspection (full a11y audit is owned by accessibility-specialist):

- **PearlDetailView L56** — "Back to Pearls" button: `px-3 py-2` ≈ 36px height, no `min-h-[44px]`. MUST-FIX.
- **DeepLearningModal L179, L186** — "Select All" / "Clear All" text links: no padding, ≈16px tap target. SHOULD-FIX.
- **ExtendedIVTPathwayModal L80** — close button: `w-8 h-8` = 32px. MUST-FIX.
- **ThrombectomyPathwayModal L74** — close button: `w-8 h-8` = 32px. MUST-FIX.
- **CodeModeStep4 L524** — "Why? Evidence & Rationale" expand button: `text-xs` text-link with no padding. ≈20px tap area. SHOULD-FIX — add `min-h-[44px] py-2` or restructure.
- **CodeModeStep1 L204** — "LKW Unknown" checkbox row: `min-h-[36px]` declared, below the 44px minimum. SHOULD-FIX — change to `min-h-[44px]`.
- **CodeModeStep2 L297** — "CTA ordered" checkbox label: `min-h-[44px]` — correct. No fix needed.

---

## What this audit deliberately did NOT cover
- Clinical content correctness (Stream 1 owns)
- Prose voice and clinical wording (Stream 2 owns)
- Calculator/scoring logic
- Routing
- Full accessibility audit (keyboard tab order, ARIA tree, screen reader testing — owned by accessibility-specialist)
- Dark mode parity (would require separate audit pass)
- Performance / bundle cost of TrialEmbed's ReactMarkdown import
