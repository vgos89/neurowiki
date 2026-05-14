# L5 Typography Audit — NeuroWiki

**Date:** 2026-05-13
**Reviewer:** design-guardian (model: claude-opus-4-7)
**Status:** findings only — no code changes
**Scope:** Typography only — no clinical content commentary.

## Summary

The 10 spec-v1.1 calculators (incl. Cha2ds2Vasc just migrated) are largely well-aligned with CALCULATOR_SPEC.md §1.1 sticky-header tokens, §5.1 drawer-headline tokens, and §1.2 footer tokens, and they share the same `text-[10px] font-bold text-slate-400 uppercase tracking-widest` section-label idiom. The shared shell (`CalculatorHeader`, `CalculatorFooter`, `CalculatorDrawer`) bakes in the §1.1/§1.2 tokens correctly, which is why the calculators are consistent: drift now exists only in caller-supplied slots.

The dominant drift across calculators is **`leading-tight` missing on `text-xl` drawer headlines** (spec §5.1 requires `text-xl leading-tight font-semibold`; most callers include `leading-tight`, but NIHSS's severity-row equivalent omits it) and an inconsistent `mt-2` vs `mt-3` between the explanation paragraph and the in-drawer disclaimer line. Boston and ASPECTS also deviate in how the §1.1 score block is sized when the score is a string label or always-numeric.

The bigger gap is between the **9 calculators + 3 hub heroes** (consistent, on-spec) and **the legacy pathway / Resident / Wiki / TrialPageNew surfaces**, which use a mix of `font-black`, `font-extrabold`, `text-2xl md:text-3xl`, `text-3xl md:text-5xl`, and `tracking-wider` (vs `tracking-widest`) — these are pre-L5.5 patterns that have not yet been migrated. 47 occurrences of `font-black|font-extrabold` remain in src/, none of them on a spec-v1.1 calculator surface.

The three hub heroes (Home, Calculators, Pathways, Guide) use a consistent `text-[24px] font-medium ... tracking-tight` / `text-[14.5px] text-slate-500 leading-snug` pattern. TrialsPage uses an entirely different headline idiom (`text-[22px] md:text-[32px]` + arbitrary `tracking-[-0.01em]` / `tracking-[0.12em]` / `tracking-[0.04em]`), and ResidentToolkit uses yet a third idiom (`text-2xl md:text-3xl font-bold ... leading-tight`). Three different hero typographies coexist.

Citation / disclaimer typography on calculators is consistent (`text-xs text-slate-400 leading-relaxed`) per spec §1.2. `tabular-nums` is correctly applied on every spec-v1.1 calculator score display.

## Audited surfaces

- All 10 spec-v1.1 calculators in `src/pages/*Calculator.tsx`
- Shared calculator shell in `src/components/calculators/` (Header, Footer, Drawer, Hero)
- Hub heroes: `src/components/home/HomeHero.tsx`, `src/components/guide/GuideHero.tsx`, `src/components/pathways/PathwaysHero.tsx`, `src/components/calculators/CalculatorsHero.tsx`
- Legacy pages: `src/pages/Home.tsx`, `src/pages/TrialsPage.tsx`, `src/pages/ResidentToolkit.tsx`, `src/pages/ResidentGuide.tsx`, `src/pages/Wiki.tsx`
- Pathway pages: `src/pages/EvtPathway.tsx`, `src/pages/MigrainePathway.tsx`, `src/pages/ElanPathway.tsx`, `src/pages/StatusEpilepticusPathway.tsx`, `src/pages/GCAPathway.tsx`, `src/pages/ExtendedIVTPathway.tsx`
- Article components: `src/components/article/stroke/*` (29 files; sampled QuickReferenceCard, SectionPearls, CodeModeStep*, EligibilityCheckerV2, NihssCalculatorEmbed, PostTPAOrders, TrialEmbed, PearlDetailView, LKWTimePicker)
- Layout: `src/components/layout/DesktopRail.tsx`, `src/components/layout/MobileHeader.tsx`

Spec compared against: `docs/specs/CALCULATOR_SPEC.md` v1.1 §1.1, §1.2, §3.1, §4.5, §5.1.

---

## Findings — High priority

### F1 — NIHSS drawer severity line missing `leading-tight`

- **Surface:** `src/pages/NihssCalculator.tsx`:251
- **Current:** `text-xl font-semibold ${SEVERITY_COLOR[severity]}`
- **Should be:** `text-xl font-semibold ${SEVERITY_COLOR[severity]} leading-tight`
- **Why:** CALCULATOR_SPEC.md §5.1 line 476 specifies the drawer interpretation headline as `text-slate-900 text-xl leading-tight font-semibold`. The other 9 spec calcs (ICH, ABCD2, HAS-BLED, Boston, ASPECTS, RoPE, GCS, Heidelberg, Cha2ds2Vasc) all include `leading-tight` on the equivalent line. NIHSS uses the severity-name span as its drawer headline equivalent and omits the leading rule.

### F2 — Boston CAA score block diverges from §1.1 size token

- **Surface:** `src/pages/BostonCriteriaCaaCalculator.tsx`:243
- **Current:** `text-xl font-semibold text-slate-900 leading-tight`
- **Should be:** `text-2xl font-semibold text-slate-900 tabular-nums leading-none`
- **Why:** CALCULATOR_SPEC.md §1.1 lines 54–60 mandate the header score number to be `text-2xl font-semibold text-slate-900 tabular-nums leading-none`. Boston shows a string label rather than a number, but the size token is shared across all archetypes and is the visual anchor of the header. Currently Boston's header label reads visibly smaller than every other calculator at the same position. Note: if a deliberate variant is needed for string-valued labels, that variant should be added to §1.1 as an explicit exception rather than diverging silently.

### F3 — Three different hub-hero typographies coexist

- **Surfaces:**
  - On-spec idiom: `src/components/home/HomeHero.tsx`:11, `src/components/guide/GuideHero.tsx`:12, `src/components/pathways/PathwaysHero.tsx`:13, `src/components/calculators/CalculatorsHero.tsx`:14
    - `text-[24px] font-medium text-slate-900 leading-tight tracking-tight`
  - TrialsPage idiom: `src/pages/TrialsPage.tsx`:182
    - `text-[22px] md:text-[32px] font-medium text-slate-900 tracking-[-0.01em] leading-[1.25] md:leading-[1.2]`
  - ResidentToolkit idiom: `src/pages/ResidentToolkit.tsx`:236
    - `text-2xl md:text-3xl font-bold text-slate-900 leading-tight`
- **Should be:** one canonical hub-H1 token, shared by all hub hero surfaces.
- **Why:** Four out of five hubs (Home, Calculators, Pathways, Guide) already agree. TrialsPage and ResidentToolkit drifted to two different patterns. The eyebrow idiom is also divergent — Trials uses `tracking-[0.12em]` (arbitrary 12% letter-spacing); spec hubs use `tracking-widest` (~10%). The `font-medium` vs `font-bold` difference is the most visible mismatch.

### F4 — Pre-rebuild `font-black` / `font-extrabold` patterns on pathway and legacy surfaces

- **Surfaces (47 occurrences across 14 files):**
  - `src/pages/ElanPathway.tsx`:210, 384 — `text-2xl font-black`, `text-2xl font-black leading-snug`
  - `src/pages/MigrainePathway.tsx`:307, 748 — `text-2xl md:text-3xl font-black tracking-tight`, `text-2xl font-black`
  - `src/pages/StatusEpilepticusPathway.tsx`:288, 359, 430 — `text-4xl font-black`, `text-3xl font-black`
  - `src/pages/GCAPathway.tsx`:367, 483 — `text-2xl font-black tracking-tight`, `text-4xl font-black tracking-tight`
  - `src/pages/EvtPathway.tsx` — 3 occurrences
  - `src/pages/ExtendedIVTPathway.tsx` — 2 occurrences
  - `src/pages/Wiki.tsx`:41, 101 — `text-3xl md:text-5xl font-black tracking-tight leading-tight`
  - `src/pages/ResidentGuide.tsx`:401 — `text-3xl md:text-5xl font-extrabold tracking-tight leading-tight`
- **Should be:** if these surfaces eventually align with the calculator/hub system, the heaviest weight in the token set should be `font-semibold` (calculator) or `font-bold` (large hub-page H1). `font-black` (900) and `font-extrabold` (800) are not in the spec token set anywhere.
- **Why:** CALCULATOR_SPEC.md §1.1, §5.1 and the four hub heroes settle on `font-semibold` (600) for the heaviest numeric / interpretation type and `font-medium` (500) for hub H1s. The 47-occurrence cluster of 800/900 weights is pre-L5.5 visual language that has not been migrated. Heavy headline weights also clash with the calculator system at adjacent navigation transitions.

### F5 — Score-display weight escalation on legacy / trial surfaces

- **Surfaces:**
  - `src/pages/StatusEpilepticusPathway.tsx`:288, 430 — dosing displays `text-4xl font-black text-slate-900`
  - `src/pages/StatusEpilepticusPathway.tsx`:359 — agent name `text-3xl font-black`
  - `src/pages/GCAPathway.tsx`:483 — result tier `text-4xl font-black tracking-tight`
  - `src/pages/trials/TrialPageNew.tsx`:613, 617, 635, 639, 806, 810 — percentages `text-2xl font-bold` (without `tabular-nums`)
  - `src/components/article/stroke/NihssCalculatorEmbed.tsx`:89 — `text-3xl font-bold text-slate-900 leading-none` (no `tabular-nums`)
- **Should be:** numeric score displays should be `text-2xl font-semibold ... tabular-nums leading-none` per §1.1 line 54–60, even when the score is large enough to dominate (the spec's score block holds for /6, /42, /9, /10 — there is no precedent for upsizing).
- **Why:** Numeric clinical displays without `tabular-nums` jitter when digits change (e.g. ICH 3 → 13 in NihssCalculatorEmbed). Spec-v1.1 calculators all use `tabular-nums` (16 file matches); pathway/trial numeric displays do not.

---

## Findings — Medium priority

### M1 — Section-label tracking inconsistency: `tracking-wider` vs `tracking-widest`

- **Surface pattern:** spec calcs use `text-[10px] font-bold text-slate-400 uppercase tracking-widest`; multiple non-spec surfaces use `text-xs font-bold ... uppercase tracking-wider`.
- **Examples of drift:**
  - `src/pages/ResidentToolkit.tsx`:274, 289, 308, 323, 375, 416, 441, 461 — `text-[10px]` or `text-xs` with `tracking-wider`
  - `src/pages/GCAPathway.tsx`:491, 496 — `text-xs font-bold text-slate-400 uppercase tracking-wider`
  - `src/pages/EvtPathway.tsx`:1390, 1431 — `text-xs font-bold ... uppercase tracking-wider`
  - `src/pages/ElanPathway.tsx`:291, 294, 298, 302, 306, 313 — `text-xs ... tracking-wider`
  - `src/pages/ExtendedIVTPathway.tsx`:880, 948, 1048, 1082, 1167, 1209 — `text-xs ... tracking-wider`
  - `src/pages/MigrainePathway.tsx`:330, 445, 474, 591, 698 — mix of `text-[10px]`/`text-xs` with `tracking-wider`
  - `src/pages/EmBillingCalculator.tsx` — 14 occurrences of `tracking-wider` for eyebrow-style labels
  - `src/components/article/stroke/QuickReferenceCard.tsx`:49, 63 — `text-xs font-bold uppercase tracking-wide` (`tracking-wide` is even narrower)
  - `src/components/article/stroke/SectionPearls.tsx`:73 — `text-sm font-bold ... uppercase tracking-wider`
- **Should be:** when used as a section-label / eyebrow analogue, `text-[10px] font-bold text-slate-400 uppercase tracking-widest` per spec §1.1 line 46 and §2.1 line 145.
- **Why:** The spec is explicit on this token. `tracking-wider` (~5%) and `tracking-widest` (~10%) read distinctly different and the visual rhythm changes when a user moves between a calculator and a pathway.

### M2 — In-drawer disclaimer top-margin inconsistency (`mt-2` vs `mt-3`)

- **Surfaces:**
  - `mt-3` (matches §1.2 page-footer spacing): `src/pages/IchScoreCalculator.tsx`:273, `src/pages/Abcd2ScoreCalculator.tsx`:250
  - `mt-2` (drift): `src/pages/HasBledScoreCalculator.tsx`:216, `src/pages/BostonCriteriaCaaCalculator.tsx`:224, `src/pages/RopeScoreCalculator.tsx`:209, `src/pages/HeidelbergBleedingCalculator.tsx`:~equivalent line, `src/pages/GlasgowComaScaleCalculator.tsx`:~equivalent line
- **Should be:** one consistent rule. The spec §1.2 line 112 specifies the page footer disclaimer as `mt-3 text-xs text-slate-400 leading-relaxed`; the in-drawer second paragraph should either copy that or have its own explicit rule in §5.1.
- **Why:** No spec citation justifies the `mt-2` variant. It looks like accidental drift across calculators authored at slightly different times.

### M3 — Drawer citation/disclaimer block: inconsistent inner spacing pattern

- **Surfaces:**
  - ICH, ABCD²: drawer citation block is `mt-5 pt-4 border-t border-slate-100` then citation `<p>`, then `mt-3` disclaimer `<p>`
  - HAS-BLED, Boston, RoPE: same outer `mt-5 pt-4 border-t`, but disclaimer `mt-2` (see M2)
  - ASPECTS: `mt-4 pt-4 border-t border-slate-100` (uses `mt-4`, not `mt-5`)
  - CHA₂DS₂-VASc: only renders citation, no in-drawer disclaimer at all (uses the page-level CalculatorFooter component for disclaimer)
- **Should be:** spec §5.1 should pick one. The `border-t` block top margin should be either always `mt-5` or always `mt-4`; the disclaimer top-margin should be either always `mt-2` or always `mt-3` (per M2).
- **Why:** Each calculator was authored independently and copied a slightly different version of the same block.

### M4 — `text-[10px]` "Important" callout vs `text-xs` callout

- **Surfaces:**
  - On-spec (§4.5 line 369): `src/pages/HasBledScoreCalculator.tsx`:203, `src/pages/BostonCriteriaCaaCalculator.tsx`:212, `src/pages/Cha2ds2VascCalculator.tsx`:248 (using "See also" instead of "Important", but same token shape)
  - Token: `text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1`
- **Observation:** all three Important / See-also amber callouts are consistent. This is a positive note; not a finding.

### M5 — `font-medium` overuse for body text emphasis

- **Surfaces (sampled):**
  - `src/pages/HasBledScoreCalculator.tsx`:194 — `<strong>` inside `text-slate-600 leading-relaxed` body
  - `src/pages/TrialsPage.tsx`:213, 254, 257, 290, 294 — multiple `font-medium` runs at `text-[11px]`, `text-sm` for non-emphatic copy (search-result rows, helper text)
  - `src/pages/ResidentToolkit.tsx`:271 — `text-sm font-medium text-slate-900` (search result; arguably correct)
- **Observation:** Calculators use `font-medium` correctly for default option-row labels (spec §2.2). Trials and Resident pages use `font-medium` for what reads as default body — overuse softens the contrast between "label" and "emphasis." Not a blocker, but worth flagging.

### M6 — Calculator name label is `text-[10px]` while score is `text-2xl` — verify visual hierarchy in CHADS / Boston string-label case

- **Surface:** `src/pages/BostonCriteriaCaaCalculator.tsx`:240–245 (header), 243 (score slot)
- **Observation:** Boston's score slot uses `text-xl` (F2). With the calculator name label at `text-[10px]`, the visual jump from name (10px) → score (20px when `text-xl`) is 2× instead of the 2.4× jump (10px → 24px when `text-2xl`) on every other calculator. Filed under F2 above for the size fix; flagged here because the hierarchy effect is the underlying reason it matters.

---

## Findings — Low priority / nice-to-have

### N1 — Arbitrary tracking values used outside spec hub heroes

- **Surfaces:**
  - `src/pages/TrialsPage.tsx`:177 — `tracking-[0.12em]` for eyebrow (spec uses `tracking-widest`)
  - `src/pages/TrialsPage.tsx`:182 — `tracking-[-0.01em]` on H1 (spec hubs use `tracking-tight`)
  - `src/pages/TrialsPage.tsx`:213, 257, 294, 319, 338 — `tracking-[0.04em]` for uppercase chips/labels
- **Should be:** Tailwind preset utilities (`tracking-widest`, `tracking-tight`, `tracking-wider`) wherever they match the intent.
- **Why:** Arbitrary values are exempt from the design system and harder for future surfaces to copy. The visual difference between `tracking-widest` (0.1em) and `tracking-[0.12em]` is sub-pixel at the sizes used.

### N2 — Arbitrary line-height literals where Tailwind tokens would suffice

- **Surface:** `src/pages/TrialsPage.tsx`:182, 189, 254, 290 — `leading-[1.25]`, `leading-[1.2]`, `leading-[1.4]`, `leading-[1.55]`
- **Should be:** map to `leading-tight` (1.25), `leading-snug` (1.375), `leading-normal` (1.5), `leading-relaxed` (1.625) where the difference is not deliberate.
- **Why:** consistency with the rest of the codebase, where presets dominate.

### N3 — `text-[14.5px]` half-pixel size

- **Surfaces:** `src/components/home/HomeHero.tsx`:14, `src/components/guide/GuideHero.tsx`:15, `src/components/pathways/PathwaysHero.tsx`:16, `src/components/calculators/CalculatorsHero.tsx`:17
- **Observation:** the four hub heroes share `text-[14.5px] text-slate-500 leading-snug` for the lede. The half-pixel is deliberate and consistent across all four — not a finding, but flagged since it is the only `text-[14.5px]` in the codebase and would be one find-and-replace away from being a named token (e.g. `text-hub-lede`) if the team wants to formalize it.

### N4 — DesktopRail uses arbitrary `text-[13.5px]` for nav labels

- **Surface:** `src/components/layout/DesktopRail.tsx`:78 — `text-[13.5px] font-medium`
- **Observation:** another half-pixel arbitrary size that is used in exactly one place. Reasonable, but flagged for future tokenization.

### N5 — `font-thin` and `font-light` in clock pickers

- **Surfaces:**
  - `src/components/article/stroke/LKWTimePicker.tsx`:272 — `text-2xl font-light text-slate-300`
  - `src/components/article/stroke/LKWTimePicker.tsx`:635 — `text-3xl font-thin text-slate-300`
  - `src/components/article/stroke/LKWTimePicker.tsx`:706 — `text-2xl font-light text-slate-300`
  - `src/components/article/stroke/AnalogClockPicker.tsx`:131, 143 — `text-xl font-light tabular-nums`
- **Observation:** these are clock-picker separator colons and HH/MM displays. `font-thin` (100) and `font-light` (300) do not appear in the calculator spec token set; their use here is a discrete visual flourish. Not a blocker — flagged for awareness.

### N6 — `text-base` is rare; `text-sm` dominates body copy in calculators

- **Observation:** Within the 10 spec-v1.1 calculators, `text-sm` is the dominant body size (option-row content, drawer explanation, severity scale, see-also link list). `text-base` (16px) appears almost exclusively in `<a>` and `<button>` defaults inherited from outside, not as a chosen body token. This is consistent and matches the bedside-density goal of the spec; recording it as the de facto rule.

### N7 — TrialPageNew is a 6,800+ line file with 159 `leading-*` declarations and 483 `text-{xs,sm,base}` declarations

- **Surface:** `src/pages/trials/TrialPageNew.tsx`
- **Observation:** this file is far outside the spec-v1.1 footprint. A full typography audit of TrialPageNew is its own task and should be scoped separately rather than rolled into L5. Spot-checked: it uses `text-2xl font-bold` for metric percentages (F5), `text-2xl sm:text-3xl font-bold` for the trial H1 (line 404, 6829), `text-xl font-semibold` for "Content coming soon" (line 419). No `tabular-nums` on numeric percentages.

---

## Recommended next steps

1. **Quick wins (Class B / single-line edits, batch):**
   - F1: add `leading-tight` to `src/pages/NihssCalculator.tsx`:251.
   - M1: do a global rename of `text-xs font-bold ... uppercase tracking-wider` → `text-[10px] font-bold ... uppercase tracking-widest` on non-calculator surfaces, but only where the intent is "section eyebrow" (not where the label is intentionally larger, e.g. step indicators in pathway pages). Pathway and Resident pages have ~40 occurrences; suggest scoping this to one Class C-clinical PR per area (Resident, EVT/Migraine/Status/Elan pathways), not one global sweep.

2. **Spec amendments (Class C, design-guardian + ui-architect):**
   - F2: decide whether Boston's string-valued score variant deserves an explicit §1.1 sub-rule, or whether Boston should be upsized to `text-2xl` with a shorter label.
   - M2 + M3: pick one canonical "in-drawer citation + disclaimer" spacing rule and add it to §5.1. Then sweep the 5 affected calculators in one batch.

3. **Cross-surface alignment (Class C / D, requires plan):**
   - F3: pick the canonical hub hero token (likely `text-[24px] font-medium ... tracking-tight`, the dominant of three). Migrate TrialsPage and ResidentToolkit. This is a design decision, not just a fix — recommend a short ADR or PRD amendment before code change.
   - F4: enumerate pathway and legacy headlines (47 occurrences) and decide whether they migrate to the calculator type system or stay as pre-L5.5 legacy until those pages are themselves rebuilt. Both choices are valid; what's not OK is leaving the question implicit.

4. **Out of scope for this audit:**
   - TrialPageNew typography (N7) — scope separately.
   - Article-component (`src/components/article/stroke/*`) clock-picker font weights (N5).
   - DesktopRail `text-[13.5px]` (N4) and hub `text-[14.5px]` (N3) — formalize as tokens only if/when these surfaces grow.

5. **Suggested batch ordering:**
   - Batch 1 (Class B): F1, plus an explicit decision on M2 → sweep `mt-2`→`mt-3` (or vice versa) across calculators.
   - Batch 2 (Class C, design-guardian-led spec change): F2 + M3 + M5; revise CALCULATOR_SPEC.md §1.1 and §5.1.
   - Batch 3 (Class C, ui-architect-led migration): F3 — pick canonical hub-hero token; migrate Trials and Resident.
   - Batch 4 (Class D, separate audit + plan): F4 — pathway / Resident / Wiki legacy headlines. Likely tied to a broader pathway-redesign initiative, not a standalone typography fix.
