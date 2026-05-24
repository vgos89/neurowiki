# Stroke Code Pathway — PM Spec

**Date:** 2026-05-24
**Owner:** UI architecture
**Status:** Active spec, sweep in progress (2026-05-24)
**Supersedes:** arch-PR-stroke-code-patient-context.md (this spec generalises the chassis pattern that doc introduced for Step 1, applies it across the entire pathway, and becomes the reference for the four follow-up pathway PRs)

## Purpose

This document is the single source of truth for the visual chassis used across every user-touching surface in the Stroke Code pathway (`/pathways/stroke-code`). It also serves as the template for the four follow-up pathway rollouts: ELAN anticoagulation, EVT pre-thrombectomy, Status Epilepticus, and Migraine.

## The chassis

Every information card, alert, or grouped-input block in the pathway follows this shape:

```
┌────────────────────────────────────────────┐
│ [tinted header bar]                        │  px-4 py-2, min-h-[40px]
│ EYEBROW LABEL · OPTIONAL SUB              │  text-[10px] font-bold
│                                            │  uppercase tracking-widest
├────────────────────────────────────────────┤  border-b border-{tint}-100
│                                            │
│ [white body]                               │  px-4 py-3
│ Content in slate-700, hairline dividers    │
│ for sub-rows (divide-y divide-slate-50),   │
│ inputs at 44px min tap target              │
│                                            │
└────────────────────────────────────────────┘
rounded-xl bg-white border border-slate-100 overflow-hidden
```

Tinted header bar uses the semantic color of the card's role:

| Role | Header bg | Header text |
|---|---|---|
| Neutral grouping | `bg-slate-50` | `text-slate-400` |
| Caution / advisory | `bg-amber-50` | `text-amber-700` |
| Critical / contraindication | `bg-red-50` | `text-red-600` |
| Success / OK status | `bg-emerald-50` | `text-emerald-700` |
| Branded / primary | `bg-neuro-50` | `text-neuro-700` |

The canonical primitive is `src/components/shared/PatientContextPanel.tsx` for the multi-row collapsible variant. Single-purpose cards use the chassis chrome inline.

## Status-banner variant (modal headers)

Status banners at the top of modals follow a chassis-variant with extra signaling weight:

- `min-h-[48px]` (vs standard 40px) so the banner reads as a banner, not a section card
- Status icon (✓ / ⚠ / ✕) prominent in the header bar alongside the label
- Top edge sits flush with the modal frame (no margin)
- Optional 2px outer accent border in semantic color when status is critical (red) — implementation detail per consumer

Reference implementation: `ThrombolysisEligibilityModal.tsx` status banner.

## Exceptions kept on flood-color or alternative treatment

Four classes of surface intentionally do NOT use the chassis pattern. Document the reason at every exception site:

1. **Interactive toggle chips signalling active selection** — e.g., contraindication chips in the IV tPA Eligibility modal that turn `bg-red-500` when selected. Flood color is doing semantic work (selected vs not), not decoration.
2. **Sticky page headers** — the page-level title bar (Stroke Code · Code/Study toggle) is a different visual class (navigation chrome, not card). Stays in its existing pill-toggle treatment.
3. **Status pill badges** — small chips like the WindowBadge (Within 4.5h / Extended / Outside tPA) or Step 3 time-metric chips (Met / Missed target). These are status pills, not cards. Use `bg-{color}-50 text-{color}-700 rounded-full px-2.5 py-0.5`.
4. **Computed-dose chips (tPA / TNK)** — neuro-50 / emerald-50 dose tiles in the Computed Dosing card. Dose values are high-stakes information the clinician needs to read at a glance; the color emphasis is functional. Sit inside a chassis card body but keep their internal tint.

## Surface inventory

Status as of 2026-05-24 audit pass.

### Step 1 — Patient Info & Initial Assessment

| Surface | Status | Notes |
|---|---|---|
| `<PatientContextPanel>` (Patient Info dropdown) | ✓ aligned | shared primitive, ELAN/EVT/Status/Migraine reuse |
| Sibling: WindowBadge | ✓ exception (status pill) | text-xs chip, semantic color |
| Sibling: hours-since-LKW caption | ✓ aligned | inline meta text |
| Sibling: LKW Unknown wake-up | ✓ aligned | amber header chassis |
| Sibling: BP-above-tPA-limit | ✓ aligned | red header chassis; Labetalol/Nicardipine guidance + bpControlled checkbox |
| Sibling: Hypoglycemia (D50) | ✓ aligned | amber header chassis with progressive disclosure |
| Sibling: Severe Hyperglycemia | ✓ aligned | red header chassis |
| Sibling: Computed Dosing | ✓ aligned | slate header chassis; tPA/TNK dose tiles inside |
| Sibling: Low-NIHSS Disabling Symptoms | ✓ aligned | amber header chassis; AHA §4.6.1+§4.8 wording preserved |
| Sibling: Extended-Window IVT cross-link | ✓ aligned | amber header chassis |
| CTA: Save / Check tPA Eligibility | ✓ exception (primary button) | neuro-500 solid pill |

### Step 2 — CT & Treatment Decision

| Surface | Status | Notes |
|---|---|---|
| From Step 1 summary bar | ✓ aligned | slate header chassis |
| CT Head Result | ✓ aligned | slate header + Stamp-CT-Time pill chip; radio body |
| Treatment Decision | ✓ aligned | slate header chassis; radio body |
| CTA & LVO Screening | ✓ aligned | slate header chassis |
| Pre-thrombolysis BP alert | ✓ aligned | red header chassis |
| ICH Detected alert | ✓ aligned | red header chassis |
| Eligibility Not Checked | ✓ aligned | amber header chassis |
| Absolute / Relative Contraindication | ✓ aligned | red / amber header chassis |
| CTA: Save & Continue | ✓ exception (primary button) | |

### Step 3 — Summary & Orders

| Surface | Status | Notes |
|---|---|---|
| Patient summary recap | needs audit | likely aligned to From-Step-1 pattern |
| Time-metrics card (CT-first-image / CT-interpreted / needle) | needs audit | met/missed pill badges stay (exception #3); container needs chassis |
| Extended IVT recommendation | ✓ aligned | amber header chassis (8bcf176) |
| EMR Note card | needs audit | pre-formatted code block + copy buttons |
| Copy / Share buttons | needs audit | likely already pill |

### Step 4 — Admit Orders

| Surface | Status | Notes |
|---|---|---|
| Category cards (post-tpa, stroke-workup, etc.) | needs full restyle (decision #1b) | `getCategoryClasses()` refactored: header bar gets tinted bg, body becomes white |
| Order checkboxes within categories | needs audit | check 44px tap targets, slate-700 labels |
| Evidence-grade badges (I / IIa / IIb) | ✓ exception (status pill) | small chips, semantic color |
| Helper text + footnotes | needs humanizer scan (decision #1 follow-up) | non-clinical text only; clinical-order wording untouched without -clinical gate |
| EMR Note / Copy CTA | needs audit | likely pill |

### Modals reachable from the pathway

| Modal | Status | Notes |
|---|---|---|
| ThrombolysisEligibilityModal | partial | status banner needs chassis-variant treatment (decision #2b); body sections + 3-4.5h notice + clinical notes already aligned |
| HemorrhageProtocolModal | needs audit | opened from Step 2 ICH detected |
| ExtendedIVTPathwayModal | needs audit | opened from Step 1 Extended IVT cross-link |
| LKWTimePicker | needs outer-frame audit (decision #5b) | internal picker UI preserved |
| NIHSS modal | needs outer-frame audit (decision #5b) | internal calc UI preserved (calc-spec compliant) |

### Page chassis

| Surface | Status | Notes |
|---|---|---|
| Sticky page header (Stroke Code · Code/Study toggle) | ✓ exception (decision #3a) | page chrome, not card |
| Step rail (Step 1/2/3/4 progression indicators) | needs audit for chassis adjacency | not a card, but visual coherence matters |
| Step transition / lock states | needs audit | "Awaiting Step 1 ↑" hint text |
| Cookie consent banner (global) | out of scope | global, not pathway-specific |

## Sweep execution sequence (2026-05-24)

Each item ships as its own commit so any one can be reverted independently. Live-verify (Gate 6) fires after each push.

1. **Step 3 chassis pass** — patient summary recap + time-metrics card + EMR Note card chassis-align
2. **Step 4 chassis pass** — `getCategoryClasses()` refactor + category cards become chassis + visual-only restyle; humanizer scan for non-clinical helper text follows in a separate commit if needed
3. **Hemorrhage + Extended IVT modal restyle** — bundled if logically similar
4. **IV tPA Eligibility status banner refactor** — chassis-variant (per decision #2 + arch condition #1)
5. **LKW picker + NIHSS modal outer-frame audit** — outer chrome only; internal picker/calc UI preserved
6. **Step rail / transition chrome tightening** — coherence with chassis chips and tokens

After step 6: this PM-spec is updated to mark every "needs audit" → "✓ aligned" and the sweep is closed.

## Rollout to follow-up pathways

After this Stroke Code sweep is complete, the same chassis pattern rolls to:

1. **ELAN anticoagulation pathway** — pattern fits directly; extraRows slot used for `lastAnticoagDose` (already shipped) and timing-of-anticoag-restart row
2. **EVT pre-thrombectomy pathway** — extraRows for LVO context + groin-puncture timing
3. **Status Epilepticus pathway** — patient context dropdown + load-dose category cards using getCategoryClasses pattern from Step 4
4. **Migraine pathway** — lightest scope; patient-context dropdown + treatment-step cards

Each pathway gets its own per-PR architect review referencing this spec as the canonical source.

## When to extract a `StatusBanner` primitive

After the IV tPA Eligibility status banner refactor lands and at least one other modal (likely ELAN or future Status mode) needs the same chassis-variant. Until then, the pattern lives inline at each consumer. Premature extraction on 1 consumer is the wrong call per the architect's prior review tradition.

## Class boundary

This sweep is Class C for visual restyle, Class D-clinical only if any clinical-order wording would change. The Step 4 humanizer scan is the only place this risk surfaces; the protocol there is: surface to V with the specific string and proposed change, do NOT silently rewrite, route through clinical-reviewer §17.2 if a change is needed.

## Acceptance — pass criteria

1. Every surface in the inventory above shows ✓ aligned or ✓ exception with a documented reason
2. tsc + check:claims + check:chains + check:routes pass
3. Gate 6 live-verify passes on each push
4. PM-spec doc updated post-sweep to reflect end state
