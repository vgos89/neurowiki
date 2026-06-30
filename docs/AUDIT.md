# Design Consistency Audit: NeuroWiki

**Date:** 2026-06-05
**Type:** Class C, audit only (no code changed)
**Scope:** All calculator pages, all guide/pathway pages, Home, Trials, ResidentToolkit (~35 surfaces)
**Specs cited:** CALCULATOR_SPEC v1.1, HUB_SPEC v1.4, HOME_SPEC v1.4, TRIALS_SPEC v1.4, PATHWAY_SPEC, MOCKUPS.md design tokens, design-tokens skill
**Method:** five parallel ui-architect passes (calculators x2, stroke guides, other guides, top-level pages), grep for token violations plus structural read against each surface spec.

---

## 1. Executive summary

The single most important finding: **most guide pages are thin wrappers around shared components**, so a handful of shared-component fixes clean up the majority of the app. Fixing `ArticleLayout` + the article primitives corrects color and typography across roughly 14 guide pages at once. Calculators are largely spec-compliant with a few systemic token issues. The real rebuild work is concentrated in a small number of high-gap surfaces.

**High-gap surfaces (need real rebuilds):** ResidentToolkit (legacy, no matching spec), PostStrokeLipidManagement (uses the abolished horizontal dot-strip), StrokeBasicsWorkflowV2 (gradients + shadows + icon-tile flourish), AscvdRiskCalculator (off-spec across all five categories), EmBillingCalculator (architecturally separate, rebuild already planned).

**Medium-gap:** Home and TrialsPage (mostly pill active-state + hardcoded hex + a few sizing deviations), and all article guide pages (entirely via ArticleLayout).

**Low-gap (mostly compliant):** ICH Score, ABCD2, ASPECTS, Boston, CHA2DS2-VASc, GCS, HAS-BLED, Heidelberg, RoPE, Calculators hub.

---

## 2. Cross-cutting systemic findings (highest leverage)

### S1. `ArticleLayout` + article primitives use forbidden `blue-*` and off-spec typography
One fix benefits ~14 guide pages.

**STATUS: SHIPPED 2026-06-29** (Class C, presentational; tracked in TASKS.md). Forbidden `blue-*` removed, eyebrow and H1 typography aligned to the design system, and the canonical back-arrow adopted across ArticleLayout, Paragraph, and Term. Verified via production build (171 of 171 prerendered) plus a prerendered-HTML marker check on 6 guide pages; no clinical text touched.
- `src/components/article/ArticleLayout.tsx:80` category eyebrow `text-blue-600` -> `text-neuro-500` (or slate-400 if muted).
- `ArticleLayout.tsx:105/108` related links `text-blue-600 hover:text-blue-800` -> `text-neuro-600 hover:text-neuro-700`.
- `src/components/article/Paragraph.tsx:33` expand `[+]` `text-blue-600` -> `text-neuro-500`.
- `src/components/article/Term.tsx:17` `text-blue-700 border-blue-300` -> `text-neuro-700 border-neuro-200`.
- `ArticleLayout.tsx:81` H1 `text-3xl md:text-4xl font-bold` -> design-system Page H1 `text-[22px] md:text-[28px] font-medium tracking-[-0.01em]`.
- `ArticleLayout.tsx:80` eyebrow weight/size wrong -> `text-[10px] font-bold uppercase tracking-widest text-slate-400`.
- `ArticleLayout.tsx:39-43` back arrow path `M15 19l-7-7 7-7` strokeWidth 1.5 -> canonical `M19 12H5M12 19l-7-7 7-7` strokeWidth 2 (matches calculator/pathway back arrow).

### S2. Severity-token `borderColor` stored as raw hex across all calculators
Every calculator passes `borderColor: '#hex'` to CalculatorDrawer via the `SeverityTokens` object. Values are correct per CALCULATOR_SPEC §6 but bypass the token system. Fixing it cleanly requires changing the CalculatorDrawer prop contract to accept a Tailwind class or CSS var. **Class D (cross-file)**, tech-debt. Affects all ~13 calculators.

### S3. `shadow-sm` on mode toggles (forbidden)
- `MrsCalculator.tsx:344,355,572,583` and `NihssCalculator.tsx:792,803` apply `shadow-sm` to active toggle segments. CALCULATOR_SPEC §3.1 active segment is `bg-white text-slate-900`, no shadow. Remove.

**STATUS: SHIPPED 2026-06-29.** shadow-sm removed from all active toggle segments (MrsCalculator context and mode toggles, 4 spots; NihssCalculator Rapid/Detailed toggle, 2 spots).

### S4. `divide-y divide-slate-200` vs explicit `divider-hair` element
- IchScore, Heidelberg, Mrs, ABCD2 use `divide-y` on the radiogroup wrapper. RoPE correctly uses `<div className="divider-hair" />` between options. Spec §2.2 wants the hairline as a distinct element (keeps the border out of the interactive target). Medium priority, cosmetic-equivalent.

### S5. Forbidden Tailwind color families scattered outside shared components
- `Thrombectomy.tsx:37` `text-indigo-600` -> `text-neuro-600`.
- `NihssCalculator.tsx:718` `text-green-600` -> `text-emerald-600`.
- `MrsCalculator.tsx:155` grade-2 `sky-*` tokens (no design-system mapping; needs a design decision).
- `StrokeBasicsWorkflowV2.tsx:816-819` `blue-50`/`blue-600` gradients -> flat `bg-neuro-50`/`bg-neuro-500`.
- `ResidentToolkit.tsx` pervasive `red-*/violet-*/orange-*/teal-*/emerald-*` + gradients (see §5).

**STATUS: point-fixes SHIPPED 2026-06-29** (Thrombectomy indigo to neuro-600; NihssCalculator green to emerald-600; RoPE chevron amber-600 to amber-700). Still open: MrsCalculator grade-2 sky-* (needs a design decision); StrokeBasicsWorkflowV2 gradients (folded into the high-gap rebuild). ResidentToolkit has since been deleted.

### S6. `DiscreteFAQ` rendered as a sibling of `ArticleLayout` with `max-w-3xl`
- `Gbs.tsx`, `HeadacheWorkup.tsx`, `Meningitis.tsx`, `MultipleSclerosis.tsx`, plus `IvTpa.tsx`: the FAQ block sits outside the article at `max-w-3xl` while the article body is `max-w-2xl`, a visible width mismatch. Decision needed: should `ArticleLayout` own the FAQ slot? Resolve before fixing the width.

**STATUS: SHIPPED 2026-06-29** (Class C, presentational). All five FAQ wrappers aligned to the article container (`max-w-2xl mx-auto px-5 md:px-8`): the four `max-w-3xl` wrappers narrowed and IvTpa's bare DiscreteFAQ wrapped. The "ArticleLayout owns a FAQ slot" refactor was NOT done (deferred as an architectural follow-up); the minimal width-match resolves the visible mismatch.

---

## 3. Prioritized fix list

**P0 (highest leverage, low risk, non-clinical, no clinical-reviewer gate; text/render byte-identical):**
1. S1 ArticleLayout/Paragraph/Term color + H1 + back-arrow (one shared fix, ~14 pages). Regression-check the full /guide/ family.
2. S3 remove `shadow-sm` from Mrs + Nihss toggles.
3. S5 point fixes: Thrombectomy indigo, Nihss green, RoPE amber-600 -> amber-700.

**P1 (page-scoped, medium):**
4. Home pill active-state: cobalt fill -> spec slate-50 fill (HOME_SPEC §1.3.1); resolve the two unspecced anatomy inserts (SavedCasesTile, FavoritesPreview).

   **STATUS (2026-06-29):** RESOLVED (V) — KEEP the solid cobalt active fill (neuro-500 bg, white text) over the spec's slate-50, for at-a-glance wayfinding. Deliberate deviation from HOME_SPEC §1.3.1 / HUB_SPEC §1.4; recorded as an implementation note in HOME_SPEC.md. Do not revert without V. The "unspecced" SavedCasesTile, FavoritesPreview, and FeaturedRail are intentional V features and are KEPT. FOLLOW-UP (design-guardian): reconcile the shared pill contract (hubs adopt cobalt vs Home documented as an exception) and update the spec to document the kept inserts.
5. TrialsPage: replace hardcoded hex (search focus, pills, clear-filters, bottom-line tag, CAT_COLOR) with neuro-*/cat-* tokens; fix Toggle default (Questions -> Catalog per HUB_SPEC §1.3); `rounded-lg` -> `rounded-xl`; remove the empty `md:` class artifacts at TrialsPage.tsx:523.

   **STATUS (2026-06-29):** SHIPPED the cobalt-to-neuro token swaps (search focus border + ring, active pills, clear-filters), `rounded-lg` to `rounded-xl`, and removed the empty `md:` artifacts. DECISION (V): the Questions-first default tab is KEPT, a deliberate deviation from HUB_SPEC §1.3; do not "fix" it back without V. DEFERRED: the CAT_COLOR category hexes (need the cat-* token set). Solids are exact token equivalents; the cobalt tints now use the neuro token at the same opacity (color-mix), visually identical.
6. S6 FAQ width mismatch (after the ownership decision).
7. PostStrokeLipidManagement: `max-w-xl` -> `max-w-2xl`; remove inline `boxShadow`; eyebrow `font-semibold` -> `font-bold`; pathway option buttons `rounded-xl` -> `rounded-full`.

**P2 (larger / needs decision):**
8. S2 severity-borderColor token contract (Class D).
9. MrsCalculator sky-* + slate-800 + max-w-[220px] (needs design decision on grade-2 color).
10. The high-gap rebuilds (ResidentToolkit, StrokeBasicsWorkflowV2 step pattern, ASCVD, EmBilling). These are the Wave 3 rebuild targets, not patch items.

---

## 4. Per-surface detail

### 4.1 Calculators
| Page | Gap | Key items |
|---|---|---|
| ICH Score | low | divide-y (S4); borderColor hex (S2) |
| ABCD2 | low | divide-y; citation duplicated in drawer + footer |
| ASPECTS | low | yellow-/orange- severity bands not in §6 palette; option rows `py-3` vs `py-3.5` |
| Boston | low | very-high/low extend palette; `type="text"` conflicts with §4.6; See-also missing in drawer |
| CHA2DS2-VASc | low | orange- severity; collapsed stat `/yr` descriptor violates §5.2; See-also merged into Important callout |
| GCS | low | borderColor hex; non-spec `--drawer-floor-height` var |
| HAS-BLED | low | emerald-/very-high extend palette; collapsed stat descriptor violates §5.2 |
| Heidelberg | low | clean (border-l-2 is spec-sanctioned §4.5) |
| RoPE | medium | amber-600 -> amber-700; Low label/stat colors off; `items-baseline` -> `items-start`; See-also missing |
| MrsCalculator | medium | sky-* grade-2 (no mapping); shadow-sm toggles; slate-800; max-w-[220px] |
| NihssCalculator | medium | shadow-sm toggle; green-600 LVO; font-black header; w-4 checkbox vs §4.2 w-5 |
| AscvdRiskCalculator | high | px-4/pt-4/space-y-4 off-spec; no `<main>`; inline boxShadow; headline severity-colored; no CalculatorFooter/Toast; custom copy not shared util; button-grid not option-row; no sr-only h1 |
| EmBillingCalculator | high (by design) | bespoke non-spec surface; align during the planned UX rebuild |
| Calculators (hub) | low | chevron inline style; hero `text-[24px]` no responsive variant; lede slate-500 vs slate-600 |

### 4.2 Guide / article pages (all via `ArticleLayout`)
AcuteStrokeMgmt, IchManagement, IvTpa, Thrombectomy, AlteredMentalStatus, Gbs, HeadacheWorkup, Meningitis, MultipleSclerosis, MyastheniaGravis, SeizureWorkup, StatusEpilepticus, Vertigo, WeaknessWorkup.
- All inherit S1 (ArticleLayout color + typography + back arrow) and S6 (FAQ width on the four FAQ pages).
- Page-level extras: Thrombectomy.tsx:37 `text-indigo-600`; IvTpa DiscreteFAQ outside the layout contract.
- Per-page ratings: medium-gap for the four FAQ pages + the stroke article pages (inherited), low-gap for the FAQ-free pages.
- Touch-target gaps on the `[+]` expand control and the Quick/Detailed toggle (escalate to accessibility-specialist when fixing).

### 4.3 Pathway pages
- **PostStrokeLipidManagement** (high-gap): horizontal dot-strip step indicator (PATHWAY_SPEC §3.9 abolished this in favor of the vertical rail); inline `boxShadow` on Card; `max-w-xl` content vs `max-w-2xl` header; lucide checkmarks in step nodes (spec: no checkmarks); `rounded-xl` option buttons (spec: `rounded-full`); `font-semibold` eyebrow (spec: `font-bold`). Migrating the step pattern to the vertical rail is a dedicated Class C, not a one-liner.

  **STATUS (2026-06-29):** Step indicator SHIPPED. The horizontal numbered dot-strip was replaced with a vertical, spec-aesthetic progress indicator (filled cobalt = done, cobalt ring = current, slate = upcoming) and the checkmarks removed. The page keeps its wizard interaction (one step visible at a time); a full Pattern A stacked-rail conversion was deliberately NOT done (out of scope, separate task). Design V-approved via mockup. STILL OPEN on this page: inline boxShadow on Card, max-w-xl vs max-w-2xl, rounded-xl option buttons, font-semibold eyebrow.
- **StrokeBasics / StrokeBasicsWorkflowV2** (high-gap via V2): `blue-50`/`blue-600` gradients; `rounded-2xl`; `shadow-sm/md/lg/2xl` throughout; icon-tile flourish (spec-rejected); modal `max-w-4xl` exceeds the content zone (confirm with mobile-first before changing).

### 4.4 Top-level pages
- **Home** (medium-gap): pill active-state uses full cobalt fill instead of the spec slate-50 fill (HOME_SPEC §1.3.1); SavedCasesTile + FavoritesPreview are unspecced anatomy inserts; FeaturedRail switched scroll -> grid (a documented V override 2026-05-19); tabpanel ARIA on the container instead of per section. Targeted corrections, not a full rebuild.
- **TrialsPage** (medium-gap): multiple hardcoded hex (search focus ring, pill active, clear-filters, bottom-line tag, CAT_COLOR inline styles); pill active-state wrong pattern; Toggle defaults to Questions (spec: Catalog); `rounded-lg` should be `rounded-xl`; H1 sizing + lede color off; empty `md:` class artifacts at line 523; hover shadow on trial cards not in spec.
- **ResidentToolkit** (high-gap, ROUTE OWNERSHIP UNCLEAR): structured as a legacy toolkit dashboard with no matching spec. Pervasive forbidden colors (red/violet/orange/teal/emerald), forbidden utilities (border-2, shadow-sm/md/lg/xl), gradients, an in-page search box (removed from all hubs in HUB_SPEC v1.2), `rounded-2xl` cards, and a desktop 3-column sidebar that no hub spec defines. **Needs V to confirm what this route is for (legacy Home alternate? a hub?) before any rebuild.** The rebuild target spec depends on that answer.

---

## 5. Page gap ratings (informs rebuild order)

| Surface | Gap | Notes |
|---|---|---|
| ResidentToolkit | high | route ownership question first |
| StrokeBasicsWorkflowV2 | high | gradients/shadows/icon-tile; mobile-first sign-off on modal width |
| PostStrokeLipidManagement | high | step-pattern migration to vertical rail |
| AscvdRiskCalculator | high | off-spec across all categories |
| EmBillingCalculator | high | bespoke; rebuild already planned |
| Home | medium | pill state + unspecced inserts |
| TrialsPage | medium | token cleanup + toggle default |
| Guide article pages (14) | medium/low | almost all via the single ArticleLayout fix |
| Calculators (10 of 13) | low | small token/spacing items |

---

## 6. Notes and risks

- **No clinical-reviewer gate** is needed for the presentational fixes in this audit: they change tokens/layout, not clinical text, scoring, thresholds, or claims. The two clinical-surface files that appear (IchManagement, IvTpa) are article wrappers; their fixes are in ArticleLayout (no clinical text touched). Any fix that would alter rendered clinical prose must stop and route through clinical-reviewer.
- **S1 propagates app-wide** via a shared component: regression-check every /guide/ route at 375px and 1280px after the fix.
- **S2 is Class D** (changes the CalculatorDrawer prop contract).
- **ResidentToolkit route ownership** is a blocking question for that rebuild.
- Several "deviations" on calculators (extended severity tiers on ASPECTS/Boston/HAS-BLED, the RoPE inverted severity mapping) are internally consistent and clinically intentional; they are flagged as undocumented rather than wrong. Consider registering them as spec extensions rather than reverting.
