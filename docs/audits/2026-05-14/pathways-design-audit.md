# Pathways Design Audit — 2026-05-14

> **Scope.** Six pathway pages under `src/pages/`:
> `EvtPathway.tsx`, `ExtendedIVTPathway.tsx`, `ElanPathway.tsx`,
> `StatusEpilepticusPathway.tsx`, `MigrainePathway.tsx`, `GCAPathway.tsx`.
>
> **Goal.** Bring pathways into design parity with the calculator surface
> (`CalculatorHeader` / `CalculatorDrawer` / `CalculatorFooter` +
> `BottomLineDrawer`).
>
> **Reference components.**
> - `src/components/calculators/CalculatorHeader.tsx` — sticky top header with score slot, fav/reset/copy
> - `src/components/calculators/CalculatorDrawer.tsx` — portal-mounted persistent bottom drawer (State A/B/C)
> - `src/components/calculators/CalculatorFooter.tsx` — citation + disclaimer + related
> - `src/components/trials/BottomLineDrawer.tsx` — portal-mounted "Bottom Line" drawer with 4-state machine (A/B/C/D), result badge, expanded prose
>
> **There is no `CalculatorShell.tsx`** in the repo. Calculator pages compose Header + Drawer + Footer directly. The "shell" pattern is implicit, not extracted. That is itself a refactor opportunity but out of scope here.

---

## TL;DR

All six pathway files hand-roll their own chrome. None reuses
`CalculatorHeader`, `CalculatorDrawer`, `CalculatorFooter`, or
`BottomLineDrawer`. None has an interpretation bottom bar — the result
of every pathway renders inline as a Step 3/4/final card, requiring the
user to scroll past the form to see the verdict.

There are two distinct header styles in current use:

- **"Compact sticky" style** (EvtPathway, ExtendedIVTPathway) — sticky top, 14h tall, back + title + step dots + fav/reset cluster.
- **"Hero inline" style** (ElanPathway, StatusEpilepticusPathway, MigrainePathway, GCAPathway) — non-sticky, larger H1 with description, separate progress strip below.

Every pathway has a fixed bottom action bar (Back / Next / Copy to EMR) at `bottom-[4.5rem]` with the same shadow + backdrop blur pattern, but each file inlines the JSX. ~50 lines of duplicate chrome per pathway.

Recommendation at the end of this doc: build a `PathwayShell` + `PathwayBottomDrawer` (analog of `BottomLineDrawer`) and migrate all six pathways in a Class D refactor. Estimated ~900-1100 LOC removed across the six files, ~350-450 LOC added in new shared components.

---

## EvtPathway.tsx (1,586 LOC)

| Issue | Severity | Recommended fix | Est. LOC |
|---|---|---|---|
| Hand-rolled compact sticky header (lines 906-953) — back + step dots + fav/reset duplicated from ExtendedIVT | med | Extract `PathwayHeader` component (compact variant) | -50 / +90 shared |
| No `BottomLineDrawer`-equivalent — result card lives inline at lines 1387-1466 inside step 4, requiring a tap-into-step to see the verdict | high | Render verdict via portal-mounted `PathwayBottomDrawer` that shows status + COR badge + reason in collapsed handle, expands to full reasoning | -80 / +50 |
| Fixed bottom action bar (lines 1523-1549) duplicates the same shadow/backdrop/scroll-mt pattern used by 4 other pathways | med | Extract `PathwayActionBar` component | -30 / +50 shared |
| Result card uses bespoke color tokens (lines 1424-1466): hand-mixed neuro/teal/emerald/amber/red without a token table | med | Map result.variant → severityTokens in `src/lib/calculators/severityTokens.ts` (already used by CalculatorDrawer) | -20 / +10 |
| Toast at line 1563/1568 hand-rolled instead of `CalculatorToast` (which already exists) | low | Reuse `CalculatorToast` | -10 / 0 |
| `isInModal` branching inline at multiple sites (lines 903, 1523, etc.) — chrome conditional on modal context | low | Push the branch into the shared shell prop | n/a (clarity win) |
| Page H1 hidden via `sr-only` (line 904) — fine, but the visible "EVT Pathway" title is inside a sticky bar, not a true heading. Confirms shell would unify this. | low | `PathwayHeader` owns the title + sr-only H1 | n/a |
| Step dots (lines 922-941) reimplemented per pathway with `completedFlags[i]` logic — same pattern as ExtendedIVT but different code | med | `<PathwayStepDots>` primitive | -30 / +40 shared |

EVT is the most complete and most opinionated of the six. It's also the largest. A refactor here removes the most duplication.

---

## ExtendedIVTPathway.tsx (1,320 LOC)

| Issue | Severity | Recommended fix | Est. LOC |
|---|---|---|---|
| Same compact sticky header pattern as EVT (lines 646-694, approx) | med | Use shared `PathwayHeader` compact variant | -50 |
| Result/verdict rendered inline inside step content rather than persistently in a bottom drawer — the entire reason a clinician opens the page (Path A/B/C-LVO decision + COR 2a/2b badge) is buried | high | Mount `PathwayBottomDrawer` with `path` + `cor` + `trialsBasis` in handle, full result.details on expand | -60 / +50 |
| Bottom action bar duplicated, same as EVT | med | Use shared `PathwayActionBar` | -30 |
| Custom toast at lines 1307, 1312 duplicates EVT pattern | low | `CalculatorToast` | -10 |
| Uses neuro-* + amber tokens consistently — closest of the six to calculator design. Good baseline. | n/a | (good — preserve in shell) | n/a |
| `useNavigationSource` + `useFavorites` + `useRecents` boilerplate identical to EVT and the others | low | `usePathwayChrome()` hook | -15 each (×5) |
| File still imports its own `LKWTimePicker` — fine, stays page-specific | n/a | preserve | n/a |

ExtendedIVT is the cleanest design-token user. Use it as the visual reference when building `PathwayHeader`.

---

## ElanPathway.tsx (504 LOC)

| Issue | Severity | Recommended fix | Est. LOC |
|---|---|---|---|
| Off-token purple palette (line 210: `bg-purple-100`, line 222: `bg-purple-500`, line 374: `text-purple-300`) — design tokens are `neuro-*` / `cobalt-*`. ELAN is the only pathway in purple. | high | Either (a) map ELAN to `cobalt-*` for "extended/anticoagulant" use-case, or (b) accept ELAN as a deliberate purple sub-brand and add `pathway-purple-*` to the token table. Resolve before refactor. | -20 / +5 |
| Inline hero header (lines 207-219) instead of sticky compact — inconsistent with EVT/ExtendedIVT | high | Use `PathwayHeader` compact variant; demote prose to a sub-line in the drawer or step 1 helper | -20 / +20 |
| Big "result" card on step 4 (lines 359-465) is exactly the surface that should be a `PathwayBottomDrawer` — early/late DOAC windows + COR 2a/LOE A badge | high | Move COR badge + window summary to bottom drawer; collapse step 4 to a recap | -60 / +50 |
| Fixed bottom action bar (line 479) — same duplicate pattern | med | Shared `PathwayActionBar` | -25 |
| Progress bar pattern (line 222) different from EVT's step dots — third pattern across the six | med | Standardize on `<PathwayStepDots>` | -10 |
| Hand-rolled toast (no line, but follows pattern) | low | `CalculatorToast` | -8 |
| `SelectionCard` is duplicated locally — also defined in EVT/ExtendedIVT under slightly different names (`CompactSelectionCard`) | med | Promote to `src/components/pathways/SelectionCard.tsx` (already raised in TASKS.md probably) | n/a — separate task |

ELAN is the smallest pathway and the strongest candidate for a clean migration. Doing ELAN first as a proof of the new shell would be low-risk.

---

## StatusEpilepticusPathway.tsx (463 LOC)

| Issue | Severity | Recommended fix | Est. LOC |
|---|---|---|---|
| Inline hero header (lines 187-193) — red-accent variant, no sticky | high | `PathwayHeader` compact variant with `accent="red"` | -15 / +0 |
| Three separate inline "fixed bottom" action bars (lines 253, 382, 434) — one per stage, all duplicating chrome | high | Single `PathwayActionBar` reused across stages | -90 / +0 |
| No bottom drawer for the recommended agent — line 358 ("Recommended Agent" card) is the result that should live in a sticky bottom bar | high | `PathwayBottomDrawer` shows `stage1Recommendation.agent` / `stage2Recommendation.agent` + dose + warnings | -40 / +30 |
| Color usage: red-100/700 hero, indigo-500 result, amber-50/700 warnings, slate everywhere — no token map | med | Either (a) map to neuro tokens, or (b) document this as a "critical/red" sub-brand for emergency pathways. Status epilepticus warrants red, but the indigo result block is incoherent. | -10 / +5 |
| `Agent` type is a local string union — fine for now | n/a | preserve | n/a |
| Out-of-scope-for-AHA-2026 (governed by AES/NCS) — design refactor is fine; clinical refactor is separate | n/a | flag in PR description; no clinical change | n/a |

This page has the worst chrome duplication of the six (three independent action bars). Highest cleanup ratio.

---

## MigrainePathway.tsx (787 LOC)

| Issue | Severity | Recommended fix | Est. LOC |
|---|---|---|---|
| Inline hero header (line 307) — non-sticky, different style from EVT/ExtendedIVT | high | `PathwayHeader` compact variant | -15 |
| Two separate inline "fixed bottom" action bars (lines 422, 655) — one for the diagnostic step, one for the treatment step | high | Single `PathwayActionBar` | -60 |
| Treatment recommendation card (medication choice + dose) renders inline, scrolled past form. This is the bedside-relevant content — must surface persistently. | high | `PathwayBottomDrawer` with "Recommended: Sumatriptan 6mg SC" + alt options on expand | -40 / +30 |
| Color usage: emerald/teal/amber/red without a token system | med | Map to neuro-* + warning amber + danger red | -10 |
| `topRef` pattern (line 292) for scroll-to-top — also done in other pathways with different ref names | low | `usePathwayScroll()` hook | -5 each |
| Migraine is governed by AHS/AAN — not AIS 2026 scope; design refactor only | n/a | flag in PR; no clinical change | n/a |
| Some long lines / dense JSX in steps — readability only | low | preserve as-is | n/a |

Treatment ladder is the bedside payload; it must live in the persistent drawer.

---

## GCAPathway.tsx (611 LOC)

| Issue | Severity | Recommended fix | Est. LOC |
|---|---|---|---|
| Inline hero header (line 367) — non-sticky | high | `PathwayHeader` compact variant | -15 |
| Fixed bottom action bar (line 534) — same duplicate pattern as the others | med | Shared `PathwayActionBar` | -25 |
| Recommendation card (steroid dose + biopsy decision) renders inline as step result — same bedside-surfacing problem | high | `PathwayBottomDrawer` with steroid regimen + COR/LOE caveat | -40 / +30 |
| Color usage: amber-heavy (consistent with rheum/inflammatory bias) + slate, no neuro tokens | med | Treat as "amber/rheumatologic" sub-brand or migrate to neuro-* | -10 |
| Toast pattern hand-rolled | low | `CalculatorToast` | -8 |
| Out-of-scope for AIS 2026 (governed by ACR/EULAR) — design refactor only | n/a | flag in PR; no clinical change | n/a |

GCA is the smallest content-wise. Easy migration after ELAN.

---

## Cross-cutting findings

**Token inconsistency.** Six pathways, six color schemes. EVT = neuro/teal/emerald; ExtendedIVT = neuro/amber; ELAN = purple; SE = red/indigo; Migraine = emerald/teal; GCA = amber. The calculator surface uses `neuro-*` + `cobalt-*` + severity tokens consistently. Pathways need either (a) a documented "pathway accent" token per disease area, or (b) migration to a single token table with status (success/warning/danger/neutral) variants only. Recommendation: option (b), with disease-area accents allowed *only* in the header icon background.

**No persistent verdict surface.** This is the single biggest UX failure across all six pathways. The user runs through 3-4 steps, then must scroll to see the answer. Calculators solved this with `CalculatorDrawer` (sticky State C). Trials solved it with `BottomLineDrawer`. Pathways inherited neither.

**Action bar shape is the same in all six** — `fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none`. This is ~120 characters of Tailwind appearing six times verbatim. Pure copy-paste duplication.

**Mobile (375px).** Each pathway has been individually tuned for 375px — none catastrophically broken. But the sticky-vs-inline header inconsistency means a user toggling between pathways sees the title jump around (EVT title is in the top sticky strip, ELAN title is below the back link). After a `PathwayShell` rollout, this becomes consistent.

**Accessibility.** Step dots in EVT (`aria-label="Step N: title"`) are good. ELAN's progress numerals (line 222) don't carry the same labels. SE's three action bars don't share `aria-controls` semantics. A shared shell can enforce these.

---

## Unified Pathway Shell — proposed architecture

### Components to add (new files in `src/components/pathways/`)

```
src/components/pathways/
├── PathwayShell.tsx          # outer layout wrapper (max-w-3xl, pb-32 etc.)
├── PathwayHeader.tsx         # sticky compact header (mirrors CalculatorHeader)
├── PathwayStepDots.tsx       # step indicator (extracted from EVT)
├── PathwayActionBar.tsx      # fixed bottom Back/Next/Reset/Copy bar
├── PathwayBottomDrawer.tsx   # NEW — portal-mounted persistent verdict drawer
├── PathwayFooter.tsx         # references + disclaimer (mirrors CalculatorFooter)
└── pathwayTokens.ts          # accent map per disease area, status variants
```

### `PathwayShell.tsx`

Wraps the four chrome pieces and accepts slot props. Mirrors how `CalculatorShell` *would* look if it were extracted (it isn't, but the implied shape is consistent across all 9 calculators today).

```tsx
interface PathwayShellProps {
  title: string;
  icon: ReactNode;
  accent: PathwayAccent;     // 'evt' | 'late-ivt' | 'elan' | 'se' | 'migraine' | 'gca'
  steps: PathwayStep[];
  activeStep: number;
  onStepClick: (i: number) => void;
  isFav: boolean;
  onFavToggle: () => void;
  onReset: () => void;
  onBack: () => void;
  onNext: () => void;
  onCopy: () => void;
  backLabel: string;
  isInModal?: boolean;
  drawer?: ReactNode;        // <PathwayBottomDrawer ...> | null
  footer?: ReactNode;        // <PathwayFooter ...>
  children: ReactNode;       // step content
}
```

### `PathwayBottomDrawer.tsx` — the headline new component

Mirrors `BottomLineDrawer.tsx` (lines 1-304) almost exactly. Same 4-state machine (A loading / B collapsed / C discovery hint / D expanded), same portal-mount, same `--drawer-floor-height` CSS var, same z-index 55, same fixed `bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom))` positioning.

What differs from `BottomLineDrawer`:

- The handle shows **clinical status + COR badge** instead of trial result + trial name. e.g., for EVT: `"EVT Reasonable · COR 2a · HERMES"` instead of `"EXTEND · Positive"`.
- The expanded body shows **interpretation prose** (reason + details + warnings) instead of bottom-line + bedside-pearl.
- An optional **"References" tab** in the expanded view replaces "See also" cross-links.

Because the geometry, state machine, and CSS contract are identical, we should **fork rather than parametrize** the trials version — the shared abstraction would have too many feature flags. Estimated 300-350 LOC for `PathwayBottomDrawer` (vs `BottomLineDrawer`'s 304 LOC).

Alternative: parametrize `BottomLineDrawer` to accept either a "trial" or "pathway" content shape via a tagged-union prop. ~50 LOC added to `BottomLineDrawer`, no new file. Cleaner but risks coupling clinical-pathway UX changes to trials UX. Recommend forking.

### `PathwayHeader.tsx`

Mirrors `CalculatorHeader`. Differences:
- Title is "EVT Pathway" not a score — no `scoreDisplay` slot needed.
- Replaces the score slot with a step-dots slot.
- Adds an optional `accent` color for the icon background.

### `PathwayActionBar.tsx`

Pulls the 120-char Tailwind string out of every pathway. Props: `onBack`, `onNext`, `onReset`, `onCopy`, `activeStep`, `totalSteps`, `customAction?`. The `customAction` slot covers EVT's "Calculate ASPECTS" button.

### Reuse decisions

| Existing component | Reusable for pathways? | Notes |
|---|---|---|
| `CalculatorHeader` | partial — needs adaptation | New `PathwayHeader` lifts the structure but replaces score-slot with step-dots. |
| `CalculatorDrawer` | not directly — different state machine | Pathways need 4-state (loading/idle/result/expanded), CalculatorDrawer has 3-state (A/B/C). Fork. |
| `BottomLineDrawer` | not directly — trial-specific content shape | Strong template. Fork into `PathwayBottomDrawer`. |
| `CalculatorFooter` | yes — directly | References + disclaimer pattern works as-is. |
| `CalculatorToast` | yes — directly | All six toast patterns become this. |
| `severityTokens` | yes — directly | Use for result.variant → border/bg/text mapping. |
| `BackArrow` | yes — directly | Already shared. |

### Refactor LOC estimate

| Pathway | Lines removed | Notes |
|---|---|---|
| EvtPathway | ~250 | header (50) + action bar (30) + result-card chrome (80) + toasts (10) + step dots (30) + boilerplate (50) |
| ExtendedIVTPathway | ~180 | header (50) + action bar (30) + result-card chrome (60) + boilerplate (40) |
| ElanPathway | ~150 | header (20) + action bar (25) + result-card chrome (60) + progress bar (10) + boilerplate (35) |
| StatusEpilepticus | ~160 | 3x action bar (90) + header (15) + result-card chrome (40) + boilerplate (15) |
| MigrainePathway | ~140 | 2x action bar (60) + header (15) + result-card chrome (40) + boilerplate (25) |
| GCAPathway | ~110 | header (15) + action bar (25) + result-card chrome (40) + toasts (10) + boilerplate (20) |
| **Sum removed** | **~990** | |
| New shared code added | ~400-450 | PathwayShell (60) + PathwayHeader (90) + PathwayActionBar (50) + PathwayStepDots (40) + PathwayBottomDrawer (300) + PathwayFooter (40) + tokens (20) |
| **Net LOC reduction** | **~540-590** | |

### Migration ordering

Recommended sequence (smallest, lowest-risk first to validate shell):

1. **GCAPathway** — out of AIS 2026 scope, smallest, no clinical risk. Validates `PathwayShell` + `PathwayHeader` + `PathwayActionBar`.
2. **ElanPathway** — purple-token decision needs to happen here; validates `PathwayBottomDrawer` with COR/LOE 2a-A pattern.
3. **StatusEpilepticusPathway** — proves the shell handles multi-stage pathways with custom action buttons.
4. **MigrainePathway** — similar to SE; medium complexity.
5. **ExtendedIVTPathway** — already closest to calculator design; mostly a delete-and-substitute.
6. **EvtPathway** — biggest, most opinionated, last. By this point the shell is battle-tested.

Each migration is a separate Class D PR, not one mega-PR. Per-pathway PR also gates SEO + a11y review per pathway, which is the right scope.

### Risks and open questions for V

1. **Purple in ELAN — keep or drop?** Drives whether `pathwayTokens.ts` carries a disease-accent map or just a status map.
2. **Should `PathwayBottomDrawer` fork from `BottomLineDrawer` or share code?** Fork is recommended above; flag for system-architect review.
3. **`isInModal` prop is used today for EVT-inside-stroke-code-modal.** Shell must preserve this. Confirm modal contexts are not regressed.
4. **`useFavorites` / `useRecents` / `useNavigationSource` are page-level today.** A `usePathwayChrome()` aggregator hook could subsume them — optional, not required for the chrome unification itself.
5. **SE Pathway has three sequential action bars** (one per stage with different button labels). The shared `PathwayActionBar` needs a `customAction` slot that covers all three cases. Verify against the SE flow before finalizing API.

This is the plan V will review. No code has been changed.
