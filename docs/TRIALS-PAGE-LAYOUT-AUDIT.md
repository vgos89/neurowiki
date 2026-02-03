# Neuro Trials Page — Layout & UX Audit

**Date:** 2026-02-03  
**Scope:** Landmark Trials (Neuro Trials) page aligned with Clinical Tools (Calculators) layout.  
**Files:** `src/pages/TrialsPage.tsx`, `src/data/trialListData.ts`

---

## Layout alignment with Clinical Tools

| Element | Clinical Tools | Neuro Trials | Status |
|--------|----------------|--------------|--------|
| **Page title** | "Clinical Tools" | "Landmark Trials" | ✅ |
| **Favorites** | Header right, toggle | Header right, toggle | ✅ |
| **Type tabs** | All / Calculators / Pathways (counts) | All (N) single tab | ✅ (trials have one type) |
| **Category pills** | Vascular, Epilepsy, Headache, etc. (dot + count) | Thrombolysis, Thrombectomy, Antiplatelets, Carotid, Acute (dot + count) | ✅ |
| **Clear filter** | "Clear" when category selected | "Clear" when category selected | ✅ |
| **Section header** | "Vascular 7" with colored dot | "{Category} N" with colored dot | ✅ |
| **Card** | Left border (category color), title, Calc/Pathway tag, description, star, arrow | Left border (category color), title, "Trial" tag, blurb, star, arrow | ✅ |
| **Empty state** | No tools found + Clear filters | No trials found + Clear filters | ✅ |

---

## UI / mobile (performance-optimizer & mobile-first)

- **Touch targets:** Buttons and card rows use `min-h-[44px]` and `touch-manipulation` where appropriate (Favorites, category pills, Clear, card links, star button).
- **Category pills:** Horizontal scroll with `overflow-x-auto` and `scrollbar-hide`; `flex-shrink-0` so pills don’t collapse on small screens.
- **No desktop-only JS:** No layout or behavior that depends on desktop-only APIs; filtering is state-based and works on all viewports.
- **Consistent structure:** Same DOM/flow as Calculators (header → tabs → pills → list) so behavior and expectations match across tools and trials.
- **Dark mode:** Category and card styles use `dark:` variants consistent with the rest of the app.

---

## Content (blurbs)

- **Source:** `src/data/trialListData.ts` — one short blurb per trial.
- **Style:** One line, resident-focused, actionable (e.g. “Landmark trial establishing IV tPA within 3 hours; 42.6% vs 27.2% favorable outcome.”).
- **Use:** Shown on the filter/list page under each trial title; no placeholder or lorem text.

---

## Implementation summary

1. **trialListData.ts** — Flat list of trials with `id`, `name`, `description` (blurb), `category`, `path`; category styles and names; `groupTrialsByCategory()`.
2. **TrialsPage.tsx** — Rebuilt to mirror Calculators: header (title + Favorites), single “All (N)” tab, category pills with colored dots and counts, list of cards with left border, title, “Trial” tag, blurb, favorite star, arrow. Uses `useFavorites` for persistence.
3. **Blurbs** — Drafted for all trials in the list (content-writer style).
4. **WAKE-UP** — Added to thrombolysis category in `trialListData.ts`.

---

**End of audit.**
