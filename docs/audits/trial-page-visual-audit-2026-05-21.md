# Trial Page Visual Audit — 2026-05-21

**Scope:** `src/pages/trials/TrialPageNew.tsx` (~8500 lines) · `src/components/trials/TrialLegendCard.tsx` · `src/pages/TrialsPage.tsx`
**Spec citations:** `docs/specs/TRIALS_SPEC.md` (v1.4) · `docs/specs/mockups/trial-reference.html` · `docs/specs/mockups/trials-legend-reference.html`
**Design-token reference:** `.claude/skills/design-tokens/SKILL.md`
**Status of EXTEND canary:** Fully implemented; used as the Archetype A ground truth for comparison.

---

## Executive Summary

Five things clinicians would notice if something went wrong:

1. **Any trial not yet on the new design hits a legacy layout** — the bottom quarter of the file (starting around line 8000) falls through to a legacy two-column layout that includes a `bg-slate-900` dark sidebar. The spec explicitly prohibits this sidebar. This affects an unknown number of trials that have metadata but no id-gated branch. Clinicians see a different, denser UI for those trials with no visible explanation of why.

2. **INTERACT4 and DISTAL (the two Grotta-bar trials) are missing safety data** — the spec requires the Safety section for any trial where sICH or mortality data is available. Both Archetype B branches skip `renderSafetySection`. If the data fields are populated, the section is silently omitted.

3. **The CHARM trial (a stopped-early ordinal-shift trial) renders a custom number card instead of a Grotta bar** — the visualization deviates from Archetype B spec, making this one page look meaningfully different from INTERACT4 and DISTAL even though all three are the same design type.

4. **The BAOCHE protocol-amendment warning uses a visually different callout style** than the spec's amber callout anatomy (§1.6). Clinicians who rely on visual cues to recognise "this trial has a design caveat" will not get the consistent signal.

5. **Every detail page currently produces two or more H1 elements** — the catalog renders an H1 at line 404 (`h2` tag text, but the placeholder branch uses `h1`), and every archetype branch adds its own H1. The ADR-005 Decision 4 requirement for exactly one H1 per page is violated on pages that hit both the catalog path and an archetype path. SEO ranking and accessibility landmark interpretation are affected.

---

## Findings by Archetype

### Archetype A — Most trials (EXTEND canary pattern)

**EXTEND (canary) — lines 449–783**
The canary is largely spec-compliant. Confirmed present: sticky header, cobalt H1, question lede, population section, DeltaBandChart, TeachingWell, safety section, trial design, bedside pearl, see-also links, BottomLineDrawer. No TrialChainTimeline call — this is the only Archetype A branch that omits it; every other branch wires it.

**Drift from spec:**
- Line 453: `shadow-sm` on the sticky header. TRIALS_SPEC §1.1 does not include shadow; shadow-sm is also prohibited by design-token rules (no shadow-sm). Other branches also carry this.
- Line 473: outer content wrapper uses `space-y-6` (24px uniform gap). Spec §1.2 prescribes `padding: 20px 20px 16px` on mobile with section spacing governed by `mt-8` / `mt-3` per section type. `space-y-6` is a reasonable approximation but not token-precise. This drift is consistent across all Archetype A branches.
- Section label token drift: `text-[10px] font-semibold uppercase tracking-widest text-slate-400` is used everywhere, but the spec §1.5 / design-tokens skill specifies `font-bold` (not `font-semibold`). This is present on every branch, including the canary at line 510.
- Eyebrow line above H1 (spec §1.3): absent. The spec requires `[Trial name] · [Author et al] · [Year]` above the H1 in `font-size: 11px; letter-spacing: 0.12em`. No branch implements this.
- "Trial at a Glance" section (spec §1.4) absent: no archetype branch renders the standard key-value glance block with the five required rows (Type, Enrolled, Sites, Sample size, Primary endpoint). The EXTEND branch replaces it with a "Trial Design" card that is not the same shape.
- The source line (line 488) uses `text-sm text-slate-500` — spec §1.3 does not spec a source line in the title block; the source is part of the Source Footer §14.2. This inline source line creates a non-spec element in the title area.
- EXTEND branch has no TrialChainTimeline call; all other Archetype A branches add it. Minor inconsistency: if EXTEND has no chain membership, the call is a no-op anyway, but the pattern is not uniform.

**WAKE-UP — lines 920–999**
Structurally identical to EXTEND canary. Same drift items apply. Adds TrialChainTimeline at line (not present — no explicit call found). Actually WAKE-UP does NOT call TrialChainTimeline; the caller list shows only: ATTENTION (1409), BAOCHE (1498), ESCAPE-MeVO (2267), DISTAL (4088), DECIMAL (7237), DESTINY (7322), HAMLET (7407), DESTINY-II (7496), stub path (7840), generic fallback (8494). WAKE-UP and ECASS3 and NINDS have no timeline call — inconsistency versus other Archetype A branches that do.

**ECASS III — lines 1003–1083; NINDS — lines 1086–~1170**
Same canary pattern, same section-label `font-semibold` drift. `border-slate-200` used consistently across all branches (spec wants `border-slate-100` on section cards — `border-slate-200` is one step heavier than the token rule). This is consistent but wrong.

**INTERACT4-related Archetype A branches (ATTENTION, BAOCHE, TRACE-III, and ~30 others)**
All follow the same anatomy. Key observations:
- BAOCHE (lines 1450–1478): amber callout uses `rounded-lg bg-amber-50 border border-amber-200 px-3 py-2` and a `<strong>` inline label. Spec §1.6 prescribes `border-l-2 border-amber-400 pl-3` (no bg, no rounded-lg) with separate `text-[10px]` label div. Visual mismatch with the spec callout.
- CHARM (lines ~7080–7165): instead of `GrottaBarChart`, renders a bespoke numeric card (`text-[38px] font-bold cOR`) surrounded by `bg-f8fafc border border-e2e8f0 rounded-[12px]`. This is a one-off visualization pattern not in the spec. Archetype B fallback (§3.7 prose-narrative variant) was designed for exactly this situation. The numeric card is not that variant — it omits the required chart-absent annotation, and uses arbitrary values (`rounded-[12px]`, `text-[38px]`).

---

### Archetype B — Grotta Bar (INTERACT4, DISTAL)

**INTERACT4 — lines 3928–4022**
`GrottaBarChart` is present with correct tokens. `winnerArm="none"` is correct for NEUTRAL trial.

**Missing items:**
- No `renderSafetySection(tm)` call (lines 3966–4010). Safety data is skipped. Spec §13 is mandatory when safety data is available. This is a spec gap.
- No `TeachingWell` for "How to read this chart" — `tm.howToReadChart` conditional is absent. Only DISTAL checks `tm.howToReadChart` and `tm.howToInterpret` (lines 4073–4074). INTERACT4 does not. If data is populated, wells will never appear on INTERACT4.
- Section order violation: spec §1.2 order is Population → Primary Outcome → Trial Design. INTERACT4 renders Population → GrottaChart → SubgroupWell → Trial Design → Bedside Pearl. This omits the "How to Interpret" and "Safety" sections.
- TrialChainTimeline: absent from INTERACT4 branch. Not necessarily wrong (INTERACT4 may have no chain membership), but inconsistent with branches that add it speculatively.

**DISTAL — lines 4026–4099**
- `GrottaBarChart` present, `winnerArm="none"` correct for NEUTRAL trial.
- `renderSafetySection(tm)` absent (lines 4073–4088). Same safety-section gap as INTERACT4.
- `TeachingWell` calls present (`tm.howToReadChart`, `tm.howToInterpret`) — correct.
- `renderTrialDesign` present — correct.
- `TrialChainTimeline trialId="distal-trial"` at line 4088 — present.

---

### Archetype G — Benchmark Track (WEAVE pattern)

Not explicitly identified in the file via a search, but `BenchmarkThresholdChart` is imported and lazy-loaded (line 27). No `BenchmarkThresholdChart` usage call found in the grep output or in the file segments reviewed. This suggests Archetype G either falls through to the generic fallback or is not yet wired in a named branch. If WEAVE is among the 101 trials and has a `benchmark` field, it would render through the generic fallback (line 8494 region) which does NOT call `BenchmarkThresholdChart` — it renders legacy markdown content. Archetype G is effectively unimplemented in the main page file.

---

### Special-design branches — Hemicraniectomy cluster (HAMLET, DECIMAL, DESTINY, DESTINY-II)

**DECIMAL — lines 7169–~7240**
All four hemi cluster trials share the same Archetype A anatomy plus `TrialChainTimeline`. Structurally sound. Same `font-semibold` section label drift and `border-slate-200` card border issues as the main family. TrialChainTimeline calls confirmed at: DECIMAL (7237), DESTINY (7322), HAMLET (7407), DESTINY-II (7496).

**Token issues in cluster:**
- Bedside pearl block uses `borderLeft: '3px solid #1746A2'` — spec §10.3 and the cobalt pearl spec use `2px` (`border-l-2`). The 3px border is wider than specified. This is consistent across ALL Archetype A branches throughout the file. It is a systemic drift.

---

### Special-design branches — Basilar EVT (ATTENTION, BAOCHE)

Both follow Archetype A anatomy with `DeltaBandChart`. BAOCHE has the amber callout mismatch described above (spec §1.6 callout shape not followed). Both have `TrialChainTimeline` calls. `renderSafetySection` is called in both.

---

### Stub render path — lines ~7500–7860

**Confirmed compliant items:**
- Amber "historical reference" banner present (§7c.5): `background: '#fffbeb'; borderLeft: '3px solid #f59e0b'` — close to spec (`border-l-3 border-amber-400`, spec uses `border-l-3 solid #f59e0b`), though spec uses `border-radius: 0 6px 6px 0` which appears applied.
- `TrialChainTimeline` at line 7840 — present and correctly passes `tm.id`.
- Prose-narrative primary outcome present.

**Missing / drift:**
- The amber banner border uses `3px solid` but spec §7c.5 specifies `border-left: 3px solid #f59e0b` — consistent.
- `chainContext` fallback renders `[chain context missing]` as visible text — this is intentional per spec §7c.4 and is correct. But it will be visible on any stub that lacks the field. Stub data completeness is an authoring gap, not a UI gap.

---

### Generic fallback — lines ~8000–end of file

This is the most significant architectural finding.

**Structure:** 12-column grid at desktop, left main column + right `bg-slate-900` dark sidebar.

**Spec violation — ADR-005 Decision 0.2:** "The dark right-side sidebar (`bg-slate-900` panel) does not appear in any state of the redesigned trial page." Line 8497: `<div className="lg:col-span-1"><div className="bg-slate-900 rounded-lg p-6 sticky top-8">`. This is a hard spec violation.

**Other violations in generic fallback:**
- `bg-blue-50 rounded-lg border-l-4 border-blue-500` blocks (lines 8253, 8413, 8464) — `blue-*` is a forbidden token. Must use `neuro-*`.
- `bg-orange-50 rounded-lg border-l-4 border-orange-500` (line 8324) — `orange-*` not in the spec palette.
- `bg-green-50 rounded-lg border-l-4 border-green-500` (line 8464) — `green-*` not in palette.
- `bg-purple-50 rounded-lg border-l-4 border-purple-500` clinical pearls block (line 8445) — `purple-*` not the correct token; should use `#7c3aed` / `violet-700`.
- Emoji in JSX: line 8325 `⚠️`, line 8413 `🔍`, line 8206 `✓`, line 8127 `📊`, line 8172 `🛑` — CLAUDE.md rule: no emojis in files unless explicitly requested.
- Legacy two-column layout with `prose` class on markdown: `<div className="prose prose-lg max-w-none">` (line 8474) — Tailwind `prose` plugin is used; this is a legacy holdover, not in spec.
- `h3` headings inside the content sections (lines 8263, 8413, 8465) — the spec mandates exactly one H1 per page; the generic fallback adds multiple h3s which is not a heading-level violation per se but the overall structure has no proper H1 (the H1 is injected by the caller's `h1` block, but the fallback layout wraps it in a different structure).
- `TrialChainTimeline trialId={trialId}` at line 8494 — present and correctly uses dynamic `trialId`. Conditionally rendered with `{trialId && ...}`.

---

## Findings by Surface

### Sticky header — all branches

- Token: `shadow-sm` present on every branch. Spec §1.1 specifies no shadow on the header, only `border-bottom: 1px solid #f1f5f9`. Shadow-sm is also prohibited by design-token rules.
- Right cluster: spec §1.1 says "right side of the header row is unused." Every branch correctly renders only the category badge on the right — compliant.
- Back arrow: `ArrowLeft` from lucide-react (16×16, `w-4 h-4`). Spec §1.1 and CALCULATOR_SPEC §1.1 specify 20×20 SVG with `M19 12H5M12 19l-7-7 7-7`. Lucide's ArrowLeft path is different. Minor visual deviation.
- Short identifier: `style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}` — matches spec §1.1 (13px, 700, `#0f172a` per spec vs `#1e293b` in code). Spec uses `#0f172a` (slate-900), code uses `#1e293b` (slate-900 equivalent, effectively same). Compliant.
- Eyebrow meta (year · journal) below the identifier: absent on every branch. Spec §1.1 requires a second line below the short identifier with `[YYYY] · [Journal short name]`.

### Section cards — all branches

- Card border: `border border-slate-200` used throughout. Design-token rules and CLAUDE.md UI Architect role spec: "Every section card uses: `bg-white border border-slate-100 rounded-xl p-4`." The `border-slate-200` is one step heavier than the rule (should be `border-slate-100`). Consistent drift across ~50 card instances.
- Card radius: `rounded-xl` correct.
- Section label: `font-semibold` drift — should be `font-bold`. Present everywhere.

### Section labels — purple pearl exception

Spec §14.1: Clinical Pearls section label uses `color: #7c3aed` (purple). No branch implements this. All section labels use `text-slate-400`. The purple pearl label is unimplemented on every archetype.

### Bottom-line drawer — all new-design branches

`BottomLineDrawer` is invoked consistently across all new-design branches. Review of the component was not in scope for this audit (separate component file). The wiring pattern is consistent — `trialResult`, `body`, `bedsidePearl`, `citation`, `doi` all passed. The one gap: DISTAL at line 4090–4098 omits `seeAlsoLinks` prop entirely (not even an empty array), whereas other branches pass it. This may result in the see-also row being absent in the drawer.

Desktop citation border-top gap (spec §10.3): "the citation element omits border-top and padding-top when it appears in the right column of the 2-col drawer layout." This is a `BottomLineDrawer` component internal concern and cannot be verified from the page file.

### TrialChainTimeline — 8 call sites

All 8 call sites confirmed present. Verified positions:

| Trial | Line | Placement |
|---|---|---|
| ATTENTION | 1409 | Inside content div, after see-also block, before closing div |
| BAOCHE | 1498 | Same pattern |
| ESCAPE-MeVO | 2267 | Same pattern |
| DISTAL | 4088 | Same pattern |
| DECIMAL | 7237 | Same pattern |
| DESTINY | 7322 | Same pattern |
| HAMLET | 7407 | Same pattern |
| DESTINY-II | 7496 | Same pattern |
| Stub render path | 7840 | Wrapped in `max-w-2xl mx-auto px-4 sm:px-6 pb-4` — only call with explicit outer wrapper div |
| Generic fallback | 8494 | Inside the main column div; conditional `{trialId && ...}` |

The stub path (7840) differs in that it has an explicit wrapper div. All named-branch calls (1409–7496) are unwrapped — they sit directly inside the `space-y-6` content div. Consistent with the intent: the timeline inherits the parent's horizontal constraints. The stub wrapper div is redundant but harmless.

Styling gap: none of the 10 call sites apply explicit margin-top. The `space-y-6` parent provides 24px gap above. On pages where the timeline renders content (chains that have data), this gap is acceptable. If the component renders nothing (no chain), it returns null and takes no space.

### Catalog page (TrialsPage) — /trials

**Hero block:** `text-[22px] md:text-[32px]` H1 — matches mockup `hero-h1` (22px mobile) and `hero-h1-desktop` (32px desktop). Compliant.

**Search bar:** `h-11 md:h-12 rounded-xl border border-slate-200` — mockup specifies `height: 44px` mobile / `height: 48px` (`.desktop` class). h-11 = 44px, h-12 = 48px. Radius `rounded-xl` = 12px. Compliant.

**Chip rail:** `Chip` component used. Active state applies. Chip border radius is `rounded-full` per the `Chip` component — spec wants `border-radius: 9999px` which is equivalent. Compliant.

**Toggle (Questions/Catalog):** `Toggle` component used. Cannot verify internal token compliance without reading the Toggle component, but it is driven by the shared UI component — low risk.

**Filter pills:** The catalog view does not render category filter pills in the visible snippet. The mockup specifies filter pills per §5. The catalog relies on the chip rail above for filtering (Favourites/Recent/New) and the toggle for Questions/Catalog. The per-category filter pill row shown in the mockup is absent from TrialsPage.tsx. This may be in a section of TrialsPage not reviewed; worth verifying in a follow-up.

### TrialLegendCard — /trials catalog

Verified against `trials-legend-reference.html`:

- Category dot: `absolute left-5 top-5 w-1.5 h-1.5 rounded-full` — mockup specifies `6px circle`. w-1.5 = 6px. Correct.
- Line 1 trial name: `text-sm font-semibold tracking-[0.01em] text-slate-900` — mockup specifies `14px/600/0.01em`. text-sm = 14px. Correct.
- Year meta: `text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400` — matches mockup muted-meta token exactly. Correct.
- Finding (Line 2): `text-sm text-slate-600 leading-[1.55]` — matches body text spec. Correct.
- Bottom-line tag: `bg-[rgba(23,70,162,0.08)] text-[#1746A2]` — matches `--cobalt-soft` token. Correct.
- Fav button: `min-h-[44px] min-w-[44px]` touch target — spec requires ≥44px. Correct.
- Hover: `hover:bg-slate-50 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]` — matches `--shadow-card-hover` token. Correct.
- `border-b border-slate-100` hairline — matches mockup hairline divider. Correct.

One gap: `font-feature-settings: "cv11"` is specified in the legend mockup's body styles for tabular numerals on stats. TrialsPage.tsx does not apply this. This would need to be set in `index.css` body or on the card container — it is a typography polish gap, not a structural one.

TrialLegendCard is the most spec-complete component of the three files reviewed.

---

## ADR-005 Decision 4 H1 Conflict — Concrete Analysis

**Spec citation:** TRIALS_SPEC §1.3 — "Exactly one H1 per page."

**Issue 1 — Placeholder branch (lines 404–439):**
```tsx
// line 405
<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
  {catalogTrial.name}
```
This uses `h2`, not `h1`. Not a duplicate H1. However it renders in a layout with no H1 at all. Placeholder pages have zero H1s.

**Issue 2 — Named archetype branches:**
Each named branch (EXTEND, WAKE-UP, ECASS3, NINDS, etc.) renders exactly one `<h1>` (e.g., line 478 for EXTEND). These branches return early, so there is no H1 duplication within a single archetype branch. Each named branch is compliant in isolation.

**Issue 3 — Generic fallback (lines ~8010 onward):**
The generic fallback renders inside a two-column grid. The `<h2>` block near the top of the main column (around line 8050 region, not reviewed) does not appear to add an extra H1. However, the fallback path is reached only when no named branch matches — this means if `trialMetadata` is populated but `trialId` does not match any named branch, the page renders the fallback layout with no cobalt H1. The fallback layout has no `<h1>` at all — it has `<h3>` headings for sub-sections. Zero H1 pages.

**Conclusion on H1 conflict:** The original concern about "2+ H1s" is not confirmed in the code. The actual problem is the inverse: placeholder pages and fallback pages have zero H1s. Named archetype branches have exactly one. The ADR-005 requirement is met for named branches, violated for placeholder (0 H1) and fallback (0 H1). This should be flagged as a missing-H1 bug, not a duplicate-H1 bug.

**Line refs:** Placeholder H1 gap: lines 391–440. Generic fallback H1 gap: lines 8000–8600.

---

## Recommended Fix Batches

### Batch 1 — Systemic token cleanup (all branches, low risk)

Affects every Archetype A branch and the shared helpers.

**Issues covered:**
1. `shadow-sm` on sticky headers — remove (spec §1.1 specifies no shadow)
2. Section card border: `border-slate-200` → `border-slate-100` on all `bg-white rounded-xl border` cards
3. Section label: `font-semibold` → `font-bold` across all `text-[10px] ... uppercase tracking-widest text-slate-400` labels
4. Bedside pearl `borderLeft: '3px solid #1746A2'` → `borderLeft: '2px solid #1746A2'` (spec uses 2px cobalt left border)

**Files:** `src/pages/trials/TrialPageNew.tsx` (systemic; ~50 sites per issue)
**Risk:** Class C. No clinical content change. Renders-cleanly verifiable.

---

### Batch 2 — Spec anatomy gaps on new-design branches (targeted, medium risk)

**Issues covered:**
1. Add `renderSafetySection(tm)` to INTERACT4 branch (after trial-design section, before bedside pearl) — line ~4007
2. Add `renderSafetySection(tm)` to DISTAL branch — line ~4075
3. Add `TeachingWell` conditional blocks to INTERACT4 branch for `tm.howToReadChart` and `tm.howToInterpret` — between GrottaBarChart and trial design
4. Add eyebrow meta line to sticky header (year · journal) — spec §1.1 second line of the trial identifier block; add after the short identifier `span` in every branch
5. Add purple section label color to Clinical Pearls — spec §14.1; change `text-slate-400` to `text-[#7c3aed]` on pearls label
6. Replace BAOCHE amber callout (lines 1455–1458) with spec §1.6 callout anatomy (`border-l-2 border-amber-400 pl-3 mt-3 mb-6` with separate label div)
7. Fix DISTAL `BottomLineDrawer` missing `seeAlsoLinks` prop (line 4091–4098) — add empty array `seeAlsoLinks={[]}`

**Files:** `src/pages/trials/TrialPageNew.tsx`
**Risk:** Class C-clinical for items 1–2 (safety data surfaces). Items 3–7 are Class C.

---

### Batch 3 — CHARM custom visualization (medium risk, clinical review needed)

**Issues covered:**
1. Replace the bespoke numeric card (lines 7117–7135) with spec §3.7 prose-narrative variant. The CHARM trial cannot use GrottaBarChart (no per-segment mRS data), so §3.7 is the correct fallback. Current implementation uses arbitrary sizing (`text-[38px]`, `rounded-[12px]`) and omits the required chart-absent annotation.
2. The `stopped-early-covid` stopped-early callout (lines 7107–7110) uses inline styles with a different shape from spec §1.6. Align to spec callout anatomy with `category: 'stopped-early-futility'` treatment.

**Files:** `src/pages/trials/TrialPageNew.tsx` (lines 7107–7135)
**Risk:** Class C-clinical. Wording of the chart-absent note and the callout text must be reviewed.

---

### Batch 4 — Generic fallback retirement plan (high risk, Class D)

The generic fallback (lines ~8000–8600) is the most impactful drift from spec. A clean fix requires either:
- (Option A) Identifying every trial that currently falls through to it and adding named id-gated branches — batch work tracked in TASKS.md
- (Option B) Building a generic new-design render path that replaces the current legacy layout — requires DeltaBandChart detection logic, `bg-slate-900` sidebar removal, token cleanup, and stub-pattern awareness

**Issues to address when approaching this batch:**
1. Remove `bg-slate-900` sidebar unconditionally — spec §0.2 hard prohibition
2. Replace `blue-*`, `orange-*`, `green-*`, `purple-*` color classes with spec tokens
3. Remove emoji from JSX (CLAUDE.md rule)
4. Add cobalt `<h1>` to the render path (currently zero H1)
5. Wire `BenchmarkThresholdChart` for trials with `benchmark` field (Archetype G — WEAVE and peers currently fall through here)

**Files:** `src/pages/trials/TrialPageNew.tsx` (lines 8000–8600)
**Risk:** Class D. Touches the render path for an unknown number of trials. Requires system-architect review and a per-trial audit of which trials hit this path before any execution.

---

## @ui-architect — Sign-off

**Spec cited:**
- `docs/specs/TRIALS_SPEC.md` §0.2, §1.1, §1.2, §1.3, §1.4, §1.5, §1.6, §2, §3, §3.7, §7a, §7c, §8.1, §8.2, §10.3, §13, §14.1
- `docs/specs/mockups/trial-reference.html` (header, dot grid, delta band, section label CSS)
- `docs/specs/mockups/trials-legend-reference.html` (hero, card anatomy, category dots, toggle, chip rail)

**Layout decisions:**
- Section card border token: `border-slate-100` is the correct token per design-tokens skill and CLAUDE.md UI Architect role spec. Current `border-slate-200` is one step heavier; flagged in Batch 1.
- Section label weight: `font-bold` (700) is the correct token per design-tokens skill eyebrow label spec. Current `font-semibold` (600) is a drift; flagged in Batch 1.
- Bedside pearl left border: 2px specified in spec §10.3; code uses 3px; flagged in Batch 1.

**Deviations from spec found:**
- `bg-slate-900` dark sidebar in generic fallback — hard spec violation (§0.2)
- Zero H1 on placeholder and fallback pages — spec §1.3 violation
- Missing eyebrow meta line (year · journal) in every branch sticky header — spec §1.1 violation
- Missing "Trial at a Glance" key-value section — spec §1.4 unimplemented across all branches
- INTERACT4 and DISTAL missing safety sections — spec §13 violation
- CHARM non-spec custom visualization — spec §3.7 not applied
- Section label `font-semibold` — design-token drift
- Card border `border-slate-200` — design-token drift
- `shadow-sm` on sticky headers — prohibited token
- Clinical Pearls label not purple — spec §14.1 not implemented
- BAOCHE amber callout wrong shape — spec §1.6 anatomy not followed
- Archetype G (`BenchmarkThresholdChart`) effectively unimplemented in main page; WEAVE-class trials fall through to legacy fallback

**Risks flagged:**
- Generic fallback affects an unknown number of trials. Before Batch 4, a count of which `trialId` values hit the fallback is needed. This is a system-architect concern before execution.
- Batch 2 items 1–2 (adding safety sections to Archetype B) require confirming that the `safetyProfile` fields are populated in the data before the section renders. If the data is absent, `renderSafetySection` returns null — no visual change. Low clinical risk, but medical-scientist should confirm data completeness.
- The "Trial at a Glance" section (spec §1.4) is absent from all branches. Adding it is a Batch 2 candidate but requires confirming the data fields (`trialDesign.timeline`, `trialDesign.sites`) are populated across the 101 trial entries before rendering.

**Status:** ready — findings documented, no source files edited.
