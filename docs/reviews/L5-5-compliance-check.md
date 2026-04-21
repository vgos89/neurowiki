# L5.5 — Calculator compliance check

**Task class:** B — read-only
**Date:** 2026-04-21
**Reviewer:** design-guardian (orchestrator, model: claude-sonnet-4-6)
**Spec version:** CALCULATOR_SPEC.md v1.1
**Scope:** 7 pre-rebuild calculator pages vs CALCULATOR_SPEC.md v1.1
**Out of scope:** GlasgowComaScaleCalculator.tsx, IchScoreCalculator.tsx (already rebuilt)

---

## Technical

### Checklist definitions

All checks measured against CALCULATOR_SPEC.md v1.1:

| Check | Spec reference | Pass condition |
|-------|---------------|----------------|
| Layout pattern | §2 (Archetype 1), §3 (Archetype 2), §4 (Archetype 3) | divide-y list + `.selected-option` for Arch 1; checkbox rows for Arch 3 |
| border-2 | QA gate (CONFIRMED CLEAN — ICH, GCS) | 0 occurrences in selection state |
| dark: | QA gate (CONFIRMED CLEAN — ICH, GCS) | 0 occurrences |
| Drawer | §1.3, §5 | createPortal + position:fixed + 4-state machine |
| Severity tokens | §1.1, §6 | amber-700 moderate; red-600 high; no severity text for low |
| Data module | §8 | src/data/*ScoreData.ts with canonical CalculatorResult interface |
| Citation object | §8 | *_CITATION named export with typed fields |
| Null initial state | §1.1 | Partial<Inputs> / empty set → renders em dash, not 0 |

---

### Compliance table

| File | Archetype | dark: count | border-2 count | Drawer | Severity tokens | Data module | Citation obj | Null initial | Score | Effort | Action |
|------|-----------|-------------|----------------|--------|-----------------|-------------|--------------|--------------|-------|--------|--------|
| AbcdScoreCalculator | Arch 1 (radio) | 35 | 6 | absent | amber-800 badge (not amber-700 text) | YES | YES | YES (emptyInputs) | low | medium | full rebuild |
| AspectScoreCalculator | Arch 2 (toggle) | 52 | 4 | absent | yellow-700/orange-700 ad-hoc | NO | NO | N/A (starts at 10) | low | large | full rebuild |
| BostonCriteriaCaaCalculator | Arch 3 (mixed) | 56 | 11 | absent | N/A (diagnostic not risk) | YES | YES | NO (defaultInputs) | low | medium | full rebuild |
| HasBledScoreCalculator | Arch 3 (checkbox) | 33 | 5 | absent | amber-800 badge (not amber-700) | YES | YES | NO (defaultInputs) | partial | medium | full rebuild |
| HeidelbergBleedingCalculator | Arch 1 (radio) | 27 | 4 | absent | N/A (classification not risk) | YES | YES | YES (emptyInputs) | partial | medium | full rebuild |
| NihssCalculator | Arch 2 (two-row) | 30 | 0* | absent | blue-600 for LVO moderate | NO† | NO | NO (all 0s at start) | partial | large | full rebuild |
| RopeScoreCalculator | Arch 1 (radio+check) | 22 | 2 | absent | N/A (% only, no tier) | YES | YES | NO (defaultInputs) | partial | medium | full rebuild |

\* NIHSS border-2 delegated to `NihssItemCard` component (not audited here — needs separate check).
† NIHSS uses `src/utils/nihssShortcuts.ts` (not a `*ScoreData.ts`) and calls `navigator.clipboard.writeText` directly instead of `copyToClipboard()` from utils/clipboard (§8 deviation).

---

### Critical gaps per file

**AbcdScoreCalculator** (low)
- Grid-card radio layout (`grid grid-cols-2 gap-2 border-2`) — spec requires divide-y list + `.selected-option`
- No drawer (inline interpretation section at top of main)
- 35 dark: classes to remove; severity shown as pill badge, not inline text

**AspectScoreCalculator** (low)
- No `*ScoreData.ts` data module — all data inline (region definitions, interpretation, EVT text)
- No `*_CITATION` export — citation is inline footer prose
- Two-column anatomical region grid — Archetype 2, but missing two-row header with mode toggle (§3.1); no drawer

**BostonCriteriaCaaCalculator** (low)
- Color system violation: `has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50` — blue accent throughout instead of neuro-500
- Copy button: `bg-slate-900` (not `bg-neuro-500`)
- Always-computed result (no incomplete state); 56 dark: classes

**HasBledScoreCalculator** (partial)
- "Important" callout placed inline above inputs — spec §4.5 requires it inside the expanded drawer
- No drawer; 33 dark: classes; `defaultInputs` all-false means score always shows 0, not em dash
- Moderate severity: `text-amber-800` (should be `text-amber-700`)

**HeidelbergBleedingCalculator** (partial)
- Grid-card layout (`grid grid-cols-1 sm:grid-cols-2 border-2`) — spec Archetype 1 requires divide-y list
- No drawer; 27 dark: classes
- Heidelberg is a classification (not risk-scored), so §6 severity tiers and §5.2 drawer header format need adaptation during rebuild

**NihssCalculator** (partial)
- Two-row header with LVO probability + mode toggle closest to spec §3.1 — strongest structural start of all 7
- `bg-slate-900` Copy button (spec: `bg-neuro-500 rounded-full`); LVO moderate uses `text-blue-600` (not neuro)
- No `useCalculatorAnalytics` hook; direct `navigator.clipboard.writeText` instead of shared util
- No data module; no citation object in this file; 30 dark: classes

**RopeScoreCalculator** (partial)
- Grid-card radio for age (`grid grid-cols-2 sm:grid-cols-3 border-2`) — spec Archetype 1 requires divide-y
- `defaultInputs` pre-fills `ageBand: '50_59'` — score always shows a number from page load, never em dash
- No drawer; 22 dark: classes
- No severity tier in RoPE result (only % shown) — spec §6 defines tiers for RoPE (0-3 low, 4-6 moderate, 7-10 high); implementation needs tier mapping added

---

### Severity threshold discrepancy — HAS-BLED (flag for medical-scientist)

CALCULATOR_SPEC.md §6:
```
HAS-BLED | 0–1 (low) | 2 (moderate) | 3–9 (high)
```

`hasBledScoreData.ts` and `4-CALCULATOR-BUILD-PLAN.md`:
```
0 low | 1–2 moderate | 3 high | ≥4 very_high
```

These do not match. The spec shows a 3-tier model (0-1/2/3-9); the data module uses a 4-tier model (0/1-2/3/≥4). Boundary for "low" is also different (0 vs 0-1). This must be resolved by medical-scientist before HAS-BLED rebuild begins. Do NOT assume either version is correct.

---

## English

**What this is:** A read-only audit of 7 calculator pages against the CALCULATOR_SPEC v1.1 standard established during the GCS and ICH Score rebuilds.

**Overall finding:** All 7 need full rebuilds. No calculator passes the three hard gates (no dark:, no border-2, Portal drawer present). The pre-rebuild generation predates the spec — these files were written before the layout pattern, drawer state machine, and token rules were established.

**What changed with GCS/ICH:** The two rebuilt calculators established a new baseline. The pre-rebuild calculators use a grid-card pattern with `border-2` selection state and inline result panels. The spec replaces this with a divide-y list pattern, `.selected-option` CSS class, and a createPortal bottom drawer with a 4-state machine.

**What could break if not addressed:** The dark: classes will show incorrect colors if a user's device switches to dark mode (the spec removes dark mode support from calculators). The inline result panels provide less information than the expanded drawer would and place clinical interpretation in a different position than users expect after using GCS/ICH.

**How to verify:** After any rebuild, run the 6-gate checklist from CONFIRMED CLEAN: no dark:, no border-2, createPortal present, amber-700 for moderate, tsc clean, build green.

---

## Prioritized rebuild order

| # | Calculator | Rationale |
|---|------------|-----------|
| 1 | **HAS-BLED** | Closest to spec: neuro accent ✓, data module ✓, citation object ✓, Archetype 3 checkbox layout already partially correct. Blocking gap: drawer + Important callout relocation + dark: removal + null initial state. Medical-scientist must resolve §6 threshold discrepancy first (flag above). |
| 2 | **Heidelberg** | Correct neuro accent ✓, data module ✓, citation object ✓, null initial state ✓. Gaps: drawer + grid→divide-y + dark: removal. Smallest delta from compliant state after HAS-BLED. |
| 3 | **RoPE** | Correct neuro accent ✓, data module ✓, citation object ✓. Gaps: drawer + grid→divide-y + dark: removal + null initial state + severity tier mapping (0-3/4-6/7-10). |
| 4 | **ABCD2** | Data module ✓, citation object ✓, null initial state ✓. Gaps: drawer + grid→divide-y + dark: removal + amber-807→amber-700. Clean Archetype 1 candidate. |
| 5 | **Boston** | Data module ✓, citation object ✓. Blocking gap: full color-system swap (blue→neuro) + Copy button + drawer + dark: removal. Medium effort but color swap is cross-cutting. |
| 6 | **ASPECTS** | No data module, no citation export, all clinical text inline. Archetype 2 with unique anatomical-region interaction pattern. Large rebuild; data module must be authored first. Clinical text (inline EVT candidacy language) must route through medical-scientist during rebuild. |
| 7 | **NIHSS** | Largest file, most complex logic, separate NihssItemCard component, LVO RACE calculation. The two-row header + mode toggle are the strongest structural asset — preserve these. Tackle last so the simpler Archetype 1/3 rebuilds establish the shared drawer pattern first. |

---

## Clinical content flags — route to medical-scientist before rebuild

1. **HAS-BLED threshold discrepancy** (HIGH — blocks rebuild): CALCULATOR_SPEC §6 and hasBledScoreData.ts disagree on tier boundaries. Must resolve before any code changes. See §6 table above.

2. **ASPECTS inline EVT text** (MEDIUM — during rebuild): Lines 45-78 of AspectScoreCalculator contain inline clinical claims ("Class I recommendation (AHA/ASA 2026)", "SELECT-2 / ANGEL-ASPECT trials"). These must be verified against current guidelines before being migrated to a data module. No data module exists yet — authoring it is a W5.x citation task.

3. **NIHSS LVO probability thresholds** (MEDIUM — during rebuild): RACE scale thresholds (0-4: 20%, 5-6: 55%, 7-9: 85%) are hardcoded in `nihssShortcuts.ts`. Verify against Pérez de la Ossa 2014 primary paper before migrating to data module.

4. **RoPE severity tiers absent** (LOW — during rebuild): Current implementation shows only PFO-attributable % with no tier mapping. Spec §6 defines tiers (0-3 low, 4-6 moderate, 7-10 high). Medical-scientist should confirm the clinical meaning before tier labels are added (RoPE "high" = high likelihood PFO is causal, not high risk of bad outcome — nuance matters for drawer copy).

---

## What is NOT flagged

- ABCD2 risk thresholds (0-3/4-5/6-7) and probabilities (1%/4.1%/8.1%): confirmed against 4-CALCULATOR-BUILD-PLAN.md (Johnston et al. Lancet 2007) — no discrepancy.
- Heidelberg classification categories (1a/1b/2a/2b/3): structural classification tool, not risk-scored. No threshold to verify.
- Boston Criteria logic: complex diagnostic algorithm from bostonCriteriaCaaData.ts. Not audited for clinical accuracy here — out of scope for L5.5.
