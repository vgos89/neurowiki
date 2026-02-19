# NeuroWiki — Developer Rules & Design System

## Stack
- React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + React Router v7
- Dev server: `npm run dev` → http://localhost:3000 (or next available port)
- Deployment: Netlify

## Project Layout
- `src/pages/` — Route-level page components
- `src/components/` — Reusable UI components
- `src/data/` — TypeScript data files (no JSON)
- `src/utils/` — Shared utility functions
- `src/config/contentStatus.ts` — Publication status for all routes (used by PublishGate)

---

## Color Palette — REQUIRED

| Use | Class prefix | Notes |
|-----|-------------|-------|
| Neutral base | `slate-*` | **ALWAYS use slate. NEVER use `gray-*`.** |
| Brand / accent | `neuro-*` | Active states, primary buttons, highlights |
| Success | `emerald-*` | Positive clinical outcomes, eligible results |
| Warning | `amber-*` | Caution states, borderline results |
| Danger | `red-*` | Contraindications, ineligible, harm |
| Info | `blue-*` | Informational, secondary actions |

> **The `gray-*` palette is banned.** It is visually indistinguishable from `slate-*` at small sizes but creates inconsistency at scale. All neuro-* tokens are defined in `index.css @theme {}`.

**Dark mode:** Use `dark:bg-slate-800`, `dark:border-slate-700`, `dark:text-slate-300` — not `dark:bg-gray-*`.

---

## Design Tokens

All tokens live in `index.css` inside `@theme {}`. The `tailwind.config.js` is **vestigial** — it only defines content paths for the JIT compiler. Do not add config to it.

**Neuro-blue palette:**
- `neuro-50` → `#f0f9ff` … `neuro-900` → `#0c4a6e`
- Primary brand: `neuro-500` (#0ea5e9)

---

## Z-Index Hierarchy — REQUIRED

Use only these values. Never invent arbitrary z-index values.

| Value | Purpose |
|-------|---------|
| `z-40` | Sticky page/section headers (calculator headers, EVT pathway header) |
| `z-50` | Standard modals and overlays |
| `z-[60]` | Toast notifications (must float above modals) |
| `z-[70]` | Nested modal content wrappers |
| `z-[80]` | Workflow backdrops (e.g. StrokeBasicsWorkflowV2) |
| `z-[100]` | Top-level modals (DisclaimerModal, ThrombectomyPathwayModal) |
| `z-[9999]` | MedicalTooltip floating popovers **only** |

---

## Modal Header Pattern — REQUIRED

All modal components must use this standard header. Do not invent variations.

```tsx
<div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 flex-shrink-0 bg-white">
  <div className="flex items-center gap-2.5 min-w-0">
    {/* Optional: icon badge */}
    {/* <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-white" />
    </div> */}
    <span className="text-sm font-bold text-slate-900 truncate">{title}</span>
  </div>
  <button
    onClick={onClose}
    className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
    aria-label="Close"
  >
    <X className="w-4 h-4 text-slate-500" />
  </button>
</div>
```

---

## Shared Utility Functions — REQUIRED

Never re-implement these inline. Import from the canonical location.

| Function | Import from | Purpose |
|----------|-------------|---------|
| `copyToClipboard(text, onSuccess?)` | `src/utils/clipboard.ts` | All copy-to-clipboard actions |
| `calculateLvoProbability(scores)` | `src/utils/nihssShortcuts.ts` | NIHSS → RACE scale → LVO probability |
| `getItemWarning(id, score, allScores)` | `src/utils/nihssShortcuts.ts` | NIHSS scoring consistency warnings |
| `calculateTotal(scores)` | `src/utils/nihssShortcuts.ts` | NIHSS total score |

---

## Inline Styles — Rules

**Allowed (only this case):** Dynamic width for progress bars:
```tsx
<div style={{ width: `${percentage}%` }} className="h-1 bg-neuro-500 rounded-full" />
```

**Banned:** Inline styles for colors, spacing, typography, or text overflow.

**Specifically banned** — `break-words` Tailwind class already sets `overflow-wrap: break-word` AND `word-break: break-word`. Never add:
```tsx
// ❌ WRONG — redundant inline style
style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}

// ✅ CORRECT — class alone is sufficient
className="break-words"
```

---

## TypeScript Rules

- **Never use `any` type.** Use `unknown` with type guards, or define a proper interface.
- **Calculator score functions must return a typed interface**, not a raw primitive. See `nihssShortcuts.ts` for the canonical pattern (`calculateTotal` returns `number` which is fine; `calculateLvoProbability` returns `LvoProbabilityResult` interface).
- **Field update handlers:** Type value params as `string | boolean | number`, not `any`.

---

## PublishGate — REQUIRED

All routes in `App.tsx` except the 5 landing pages below must be wrapped in `<PublishGate routeId="...">`:

**Exempt (landing pages — no gate needed):**
- `/` (Home)
- `/wiki/:topic`
- `/calculators`
- `/guide`
- `/trials`

**All other routes** → must have PublishGate. Add the route ID to `src/config/contentStatus.ts` with `published: true`.

---

## Medical Accuracy — STROKE CONTENT

**ALL stroke clinical logic must be cross-checked against:**
`src/data/aha2026StrokeGuideline.ts`

Source: 2026 AHA/ASA Guideline for Early Management of AIS (Prabhakaran et al., DOI: 10.1161/STR.0000000000000513)

Key covered areas: IVT (alteplase/tenecteplase), EVT criteria (ASPECTS, time windows), BP targets, glucose, antiplatelet/anticoagulation, dysphagia, pediatric stroke.

---

## Data Files — Do Not Grow These

These files are flagged as oversized and should not receive additional data:

| File | Lines | Status |
|------|-------|--------|
| `src/data/trialData.ts` | ~1,693 | Flagged — split when refactoring |
| `src/data/guideContent.ts` | ~1,185 | Flagged — split when refactoring |
| `src/data/strokeClinicalPearls.ts` | ~823 | Flagged — split when refactoring |

For new data, create a new focused file in `src/data/`.

---

## Dark Mode

Dark mode is **class-based** via `.dark` selector, enabled through `@custom-variant dark` in `index.css`. Always pair light/dark classes:
```
bg-white dark:bg-slate-800
text-slate-900 dark:text-white
border-slate-200 dark:border-slate-700
```

---

## Key File Locations (Quick Reference)

| What | Where |
|------|-------|
| Theme tokens | `index.css` → `@theme {}` block |
| All routes | `src/App.tsx` |
| Global layout + sidebar | `src/components/Layout.tsx` |
| Publication status | `src/config/contentStatus.ts` |
| Homepage | `src/pages/Home.tsx` |
| Medical glossary | `src/data/medicalGlossary.ts` |
| Tooltip auto-injection | `src/utils/addTooltips.tsx` |
