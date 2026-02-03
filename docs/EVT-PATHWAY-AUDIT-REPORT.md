# EVT Pathway — Comprehensive Multi-Agent Audit Report

**Pathway audited:** Endovascular Thrombectomy (EVT) Pathway  
**Primary file:** `src/pages/EvtPathway.tsx`  
**Related files:** `src/components/article/stroke/ThrombectomyPathwayModal.tsx`, `src/data/toolContent.ts`, `src/pages/guide/Thrombectomy.tsx`, `src/seo/routeMeta.ts`  
**Route:** `/calculators/evt-pathway` (PublishGate)  
**Audit date:** Discussion/analysis only — no code changes.

---

## AGENT 1: MEDICAL SCIENTIST AUDIT (AHA/ASA 2026 COMPLIANCE)

### Clinical Accuracy Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| Time windows 0–6h (HERMES, Class I) | ✅ | 0–6h with ASPECTS ≥6, Class I language present |
| Time windows 6–24h (DAWN/DEFUSE-3) | ✅ | 6–24h with DAWN clinical–core and DEFUSE-3 perfusion criteria |
| LVO definition (ICA, M1, Basilar) | ✅ | LVO: ICA, M1, Basilar; M2/distal under MeVO |
| Imaging (CT/CTA or MR/MRA) | ⚠️ | Implied by “CTA/MRA” and perfusion inputs; not explicitly “CT/CTA or MR/MRA” in UI |
| ASPECTS ≥6 (0–6h) | ✅ | ASPECTS ≥6 → Eligible; 3–5 → Class IIb; 0–2 → Consult/Avoid |
| Baseline mRS 0–1 | ✅ | “Independent (mRS 0–1)” vs “Dependent (mRS > 1)” |
| Workflow order | ✅ | Triage → Clinical → Imaging → Decision |
| Bridging tPA / don’t delay EVT | ❌ | Not stated in pathway; guide/Thrombectomy.tsx has “Do not delay transport” |
| Direct to angio option | ❌ | Not mentioned |
| Door-to-groin target | ❌ | Not mentioned |
| Large core / ASPECTS 0–5 exclusions | ✅ | ASPECTS 0–2 → Consult; 3–5 → Class IIb with caveats |
| Pre-existing disability (mRS 3–5) | ✅ | mRS > 1 → Not Eligible |
| Terminal illness | ⚠️ | Not explicitly listed |
| Anesthesia (conscious sedation preferred) | ❌ | Not in pathway; only in guide/Thrombectomy |
| Post-EVT care (BP, antiplatelet, imaging) | ❌ | Not in pathway |

### MEDICAL SCIENTIST AUDIT: EVT PATHWAY

#### ✅ What’s Clinically Correct

1. **Time windows and evidence** — 0–6h (HERMES/ASPECTS ≥6), 6–24h (DAWN/DEFUSE-3), basilar (ATTENTION/BAOCHE, pc-ASPECTS), all cited as 2026 AHA/ASA.
2. **LVO vs MeVO split** — LVO (ICA, M1, Basilar) vs MeVO (M2/M3/distal) with appropriate caution and ESCAPE-MeVO/DISTAL caveats.
3. **Large core (Class IIb)** — ASPECTS 3–5 (0–6h) and core 50–100 mL (6–24h) correctly as “may be considered” with SELECT2/ANGEL-ASPECT and hemorrhage risk stated.
4. **Basilar protocol** — pc-ASPECTS ≥8 + NIHSS ≥10 (Class I), 6–7 (Class IIa), <6 Avoid; ATTENTION/BAOCHE cited.
5. **DAWN/DEFUSE-3 logic** — DAWN-style age/NIHSS/core cutoffs and DEFUSE-3 (core <70 mL, mismatch ≥15 mL, ratio ≥1.8) implemented in code.

#### ⚠️ CRITICAL Issues (Could Harm Patients)

- **Issue:** No explicit “Do not delay EVT for tPA” / “Bridging tPA should not delay groin puncture.”  
  - **Current state:** Pathway does not state that EVT should not be delayed for lytic.  
  - **2026 guideline:** Bridging tPA when eligible, but do not delay EVT.  
  - **Priority:** CRITICAL (operational safety).  
  - **User impact:** Risk of unnecessary delay to groin puncture.

#### 🔴 High Priority Issues

1. **Door-to-groin target** — No mention of door-to-groin &lt;90 min (or local target). Add one line in Clinical or Decision step.
2. **Imaging requirement** — UI does not explicitly say “LVO confirmed on CT/CTA or MR/MRA.” “Confirm LVO” is present but imaging modality could be clearer.
3. **Post-EVT care** — No BP targets, antiplatelet timing, or 24h imaging. Better as short “Post-EVT” blurb or link to guide.

#### 🟡 Medium Priority Issues

1. **Terminal illness / goals of care** — Exclusions list could include “terminal illness / limited goals.”
2. **Conscious sedation** — One line (“Conscious sedation preferred when feasible”) would align with guidelines.
3. **16–24h vs 6–16h** — DEFUSE-3 was 6–16h; DAWN 6–24h. Pathway uses 6–24h; consider noting DEFUSE-3 evidence strength in 6–16h.

#### 📊 Missing Content

- Door-to-groin (or last-known-well-to-groin) time target and/or simple timer.
- Explicit “Bridging tPA: do not delay EVT” and “Direct to angio” when both eligible.
- ASPECTS **calculator** (regional diagram, point-and-click); currently only numeric ASPECTS/pc-ASPECTS input.
- Post-EVT: BP (&lt;180/105), antiplatelet timing (e.g. 24h post-imaging), 24h repeat imaging.
- mTICI result (documentation only; no calculator needed).
- Transfer/activation checklist (single comprehensive list).

#### 🎯 Overall Medical Assessment

Pathway is **largely 2026-guideline compliant** for eligibility (time windows, LVO/MeVO, imaging criteria, basilar, large core Class IIb). Gaps are mainly **operational and post-procedure**: bridging/delay message, door-to-groin, post-EVT care. **Safe for eligibility screening** if supplemented by institutional protocol and/or guide content for “don’t delay EVT,” door-to-groin, and post-EVT.

---

## AGENT 2: CONTENT WRITER AUDIT

### Copy Quality Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| Resident-appropriate language | ✅ | Clear, actionable |
| Abbreviations explained | ✅ | LVO, MeVO, ASPECTS, pc-ASPECTS, mRS in LearningPearls/labels |
| Instructions clear | ✅ | Step titles and cards are clear |
| Copy to EMR present | ✅ | “Copy to EMR” button on Decision step |
| EMR output structured | ⚠️ | Good sections; missing timestamps (door, groin), LKW |
| Plain text / line breaks | ✅ | `\n` used; paste-friendly |
| No informal language in EMR | ✅ | Professional tone |
| Trial references | ✅ | DAWN, DEFUSE-3, SELECT2, ANGEL-ASPECT, ATTENTION, BAOCHE, ESCAPE-MeVO, DISTAL |
| Terminology (LVO/EVT/MeVO) | ✅ | Consistent |

### CONTENT WRITER AUDIT: EVT PATHWAY

#### ✅ What’s Well-Written

1. **LearningPearls** — “Evidence Landscape,” “2026 Guideline Update,” “NIHSS Limitations,” “Understanding ASPECTS,” “Large Core Evidence,” “pc-ASPECTS & 2026 Guidelines,” MeVO risk box: all teach “why” and cite trials.
2. **Result cards** — Status, criteria name, reasoning, and details with auto-linked trials; disclaimer and “Clinical Context” are clear.
3. **Section titles** — Triage, Clinical, Imaging, Decision are clear and logical.
4. **Consistent terms** — LVO, MeVO, EVT, ASPECTS, pc-ASPECTS, mRS used consistently; abbreviations explained where needed.

#### 📝 Readability Issues

- **Issue:** Subtitle “Eligibility screening for LVO (ICA/M1/Basilar) and MeVO (M2/M3/Distal).”  
  - **Problem:** “M2/M3/Distal” may be read as “M2 or M3 or Distal” without “and ACA/PCA.”  
  - **Suggested rewrite:** “Eligibility screening for LVO (ICA, M1, Basilar) and MeVO (M2, M3, ACA, PCA).”  
  - **Priority:** Low.

#### 💼 EMR Copy Issues

- **Current EMR output (summary):** Type, Status, Protocol, Clinical Data (time, NIHSS, age), Imaging Data (ASPECTS/core/mismatch/pc-ASPECTS), Reason, Details.
- **Problems:**
  - Missing: LKW time, door time, imaging time, groin time (or “to be documented”).
  - Missing: “Bridging tPA: Yes/No” and “Do not delay EVT for tPA.”
  - Copy feedback uses `alert("Assessment copied to EMR.")` instead of toast; inconsistent with stroke workflow.
- **Recommended EMR template (add when available):**
  - LKW: [time]
  - Door: [time]
  - Imaging (CTA/CTP): [time]
  - Door-to-groin target: &lt;90 min (document actual when available)
  - Bridging tPA: Yes / No (do not delay EVT)
  - [Rest of current summary]

#### 📚 Educational Gaps

- One short blurb on “Bridging tPA and EVT: give tPA if eligible, but do not delay groin puncture.”
- One line on door-to-groin &lt;90 min in Clinical or Decision.
- Optional: “Post-EVT: BP &lt;180/105, antiplatelet per protocol, repeat imaging at 24h.”

#### 🎯 Overall Content Assessment

Copy is **clear, professional, and educational** with strong trial citations and resident-appropriate language. Main improvements: **EMR snippet** (add time fields and bridging message where possible) and **toast instead of alert** for copy confirmation.

---

## AGENT 3: SEO SPECIALIST AUDIT

### SEO Optimization Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| Title tag | ✅ | “Thrombectomy Eligibility Pathway” (routeMeta) |
| Meta description | ✅ | Present, ~120 chars; could add keywords |
| URL | ✅ | `/calculators/evt-pathway` |
| H1 | ✅ | “Thrombectomy Pathway” on page |
| H2/H3 hierarchy | ✅ | Triage, Clinical, Imaging, Decision + subsections |
| Target keywords in copy | ⚠️ | “Endovascular thrombectomy,” “mechanical thrombectomy,” “EVT stroke,” “LVO” appear in body but not in meta keywords |
| Schema (MedicalWebPage/FAQ) | ❌ | Not verified in pathway page |
| Internal links | ✅ | Link from guide/Thrombectomy to pathway; back link |

### SEO SPECIALIST AUDIT: EVT PATHWAY

#### ✅ SEO Strengths

1. **URL** — `/calculators/evt-pathway` is clear and keyword-relevant.
2. **Title** — “Thrombectomy Eligibility Pathway” is descriptive and under 60 characters.
3. **Sitemap** — Route included in `sitemapRoutes.ts`.
4. **Internal links** — Guide Thrombectomy page links to pathway; pathway has back navigation.
5. **Content depth** — Substantial text (criteria, pearls, references) for indexing.

#### 🔍 SEO Issues

- **Issue:** Meta description does not include key phrases “endovascular thrombectomy,” “mechanical thrombectomy,” “LVO stroke.”  
  - **Current:** “Decision support for Endovascular Thrombectomy (EVT) based on DAWN, DEFUSE-3, and recent trials.”  
  - **Recommendation:** Add “LVO,” “mechanical thrombectomy,” “ASPECTS,” “DAWN, DEFUSE-3” in a 150–160 char description.  
  - **Target keywords:** endovascular thrombectomy, mechanical thrombectomy, EVT stroke, LVO stroke treatment, ASPECTS.  
  - **Priority:** High.  
  - **Traffic impact:** Better relevance for “EVT stroke,” “thrombectomy eligibility.”

- **Issue:** No `keywords` in routeMeta for `/calculators/evt-pathway`.  
  - **Recommendation:** Add keywords: “endovascular thrombectomy, mechanical thrombectomy, EVT, LVO, ASPECTS, DAWN, DEFUSE-3.”

#### 🔗 Broken Links Audit

- **External links:** None in EvtPathway.tsx (trial links go to internal `openTrial`). Not tested live; assume OK if trial routes exist.
- **Internal links:** Back link uses `getBackPath()`; “Thrombectomy Pathway” from guide/Thrombectomy to `/calculators/evt-pathway` — OK.
- **Images:** No images in pathway; N/A.

#### 📊 Missing SEO Elements

- **Schema:** MedicalWebPage or HowTo for “Thrombectomy eligibility assessment” not confirmed.
- **FAQ:** No FAQ block; adding 3–5 FAQs (e.g. “Who is eligible for thrombectomy?” “What is the time window for EVT?”) could support snippets.
- **Canonical:** Handled by app/layout; not pathway-specific.

#### 🎯 Overall SEO Score

**7/10** — Good URL, title, sitemap, and content. Loses points for missing meta keywords, under-optimized description, and no confirmed schema/FAQ.

---

## AGENT 4: MOBILE-FIRST DEVELOPER AUDIT

### Mobile Usability Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| Buttons ≥44px | ✅ | min-h-[44px], touch-manipulation on main buttons and SelectionCards |
| Spacing between taps | ✅ | gap-3, p-5 on cards |
| 375px width | ✅ | Responsive grid and full-width layout |
| Responsive layout | ✅ | max-w-3xl mx-auto, padding; fixed bar adapts (bottom-[4.5rem] mobile, static md) |
| Bottom bar | ✅ | Fixed on mobile, avoids content (pb-32 md:pb-20) |
| Modals | ✅ | ThrombectomyPathwayModal full viewport; EvtPathway used inside |

### MOBILE-FIRST DEVELOPER AUDIT: EVT PATHWAY

#### ✅ Mobile Strengths

1. **Touch targets** — SelectionCard and primary buttons use `min-h-[44px]` and `touch-manipulation`.
2. **Fixed action bar** — Bottom bar fixed on mobile with visible Back/Next/Copy; “Start Over” available below on small screens.
3. **No horizontal scroll** — Content constrained; inputs full-width.
4. **Progress** — Progress bar and “X/4 sections” work on small screens.
5. **Collapsible sections** — Reduce vertical scroll; users expand one step at a time.

#### 📱 Mobile Usability Issues

- **Issue:** Age buttons (&lt;18, 18–79, ≥80) are three in a row; at 320–375px may be tight.  
  - **Recommendation:** On very small widths, stack vertically or increase tap height.  
  - **Priority:** Low.

- **Issue:** MeVO numeric NIHSS and perfusion inputs (core, mismatch vol/ratio) — small keyboards; no inputMode="numeric" or pattern to encourage numeric keypad.  
  - **Recommendation:** Add `inputMode="numeric"` (and `pattern` if desired) for number inputs.  
  - **Priority:** Low.

#### ⚡ Performance on Mobile

- **Load:** EvtPathway is lazy-loaded; no heavy images. No specific 3G measure; expected acceptable.
- **Bundle:** Single lazy chunk for EvtPathway + dependencies (React, Lucide, etc.); no obvious bloat from pathway alone.
- **Issues:** None critical.

#### 🔧 Broken on Mobile

- No mobile-specific breakage identified from code (no overflow hacks, no desktop-only JS).

#### 🎯 Mobile Experience Score

**8/10** — Solid touch targets, fixed bar, responsive layout, collapsible steps. Minor gains from inputMode and age-button layout on very small screens.

---

## AGENT 5: UI ARCHITECT AUDIT

### User Experience Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| Steps in order | ✅ | Triage → Clinical → Imaging → Decision |
| Information grouped | ✅ | Occlusion type → location → confirm → mRS → age; then time → NIHSS; then imaging |
| Progressive disclosure | ✅ | CollapsibleSection; LVO/MeVO branches |
| Buttons look clickable | ✅ | Borders, hover, focus ring |
| Feedback on actions | ✅ | Result card, progress bar, copy alert |
| Loading states | ❌ | No async load; N/A |
| Error states | ⚠️ | “Pending Imaging” / “Incomplete Data”; no inline validation messages |

### UI ARCHITECT AUDIT: EVT PATHWAY

#### ✅ UX Strengths

1. **Four-step flow** — Triage → Clinical → Imaging → Decision is logical and matches clinical workflow.
2. **Branched flow** — LVO vs MeVO, then anterior vs basilar, 0–6h vs 6–24h with relevant fields only.
3. **Result prominence** — Large status card (green/amber/red/slate) with recommendation, reasoning, and details.
4. **LearningPearls** — In-context teaching without clutter.
5. **Back/Next and progress** — Clear navigation and “X/4 sections completed.”

#### 🎨 UX/UI Issues

- **Issue:** “Copy to EMR” uses `alert()`; feels outdated and blocks the page.  
  - **Recommendation:** Use toast (“Assessment copied to EMR”) as in stroke workflow.  
  - **Priority:** High (consistency and UX).

- **Issue:** SelectionCard for “Confirm LVO” is Yes / “No LVO” only; no “Pending / not yet imaged.”  
  - **Current state:** If not yet imaged, user might pick “No” by mistake.  
  - **Recommendation:** Optional third state “Pending imaging” or helper text “Only confirm Yes when CTA/MRA shows LVO.”  
  - **Priority:** Medium.

- **Issue:** ASPECTS and perfusion inputs have no inline validation (e.g. ASPECTS 0–10, core &gt;0).  
  - **Recommendation:** min/max on inputs (already present for ASPECTS); optional message “Enter value 0–10” if out of range.  
  - **Priority:** Low.

#### 🗺️ Workflow Gaps

- **ASPECTS calculator** — Not integrated; only numeric input. A visual ASPECTS (and optionally pc-ASPECTS) calculator would improve accuracy and teaching.
- **Door-to-groin timer** — Not present; no time tracking in pathway.
- **Transfer checklist** — No “Transfer to CSC” / “Activate IR” checklist.
- **Post-procedure orders** — No post-EVT BP, antiplatelet, or 24h imaging.
- **mTICI** — Not captured (documentation only; could be optional field).

#### 🎯 Overall UX Score

**8/10** — Strong flow, branching, and result display. Deducted for alert-based copy feedback and missing “don’t delay EVT” / door-to-groin / transfer checklist in the flow.

---

## AGENT 6: PERFORMANCE OPTIMIZER AUDIT

### Performance Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| Lazy load | ✅ | EvtPathway lazy-loaded in App.tsx |
| Code splitting | ✅ | Separate chunk for EvtPathway |
| Heavy images | N/A | No images in pathway |
| Large dependencies | ⚠️ | Lucide icons, React, CollapsibleSection, etc.; typical for app |

### PERFORMANCE OPTIMIZER AUDIT: EVT PATHWAY

#### ✅ Performance Strengths

1. **Lazy loading** — Route uses `lazy(() => import('./pages/EvtPathway'))`, so EVT code loads only when visiting the pathway.
2. **No images** — No image optimization or LCP concerns from this page.
3. **Memo** — SelectionCard wrapped in `React.memo` to limit re-renders.
4. **useCallback/useMemo** — updateInput, completion flags, and getSummary use callbacks/memo where appropriate.

#### ⚡ Performance Issues

- **Issue:** No specific Lighthouse run for `/calculators/evt-pathway`; scores not measured in this audit.  
  - **Recommendation:** Run Lighthouse (mobile + desktop) and target LCP &lt;2.5s, FID &lt;100ms, CLS &lt;0.1.  
  - **Priority:** Medium (baseline).

- **Issue:** EvtPathway imports many Lucide icons (ArrowLeft, Check, RotateCcw, Copy, Info, etc.); tree-shaking should apply but adds to chunk size.  
  - **Recommendation:** Acceptable unless bundle report shows EVT chunk &gt;~150 KB; then consider icon subset.  
  - **Priority:** Low.

#### 📊 Lighthouse Scores

- Not run in this audit. Recommend: Performance, Accessibility, Best Practices, SEO on production build for `/calculators/evt-pathway`.

#### 🎯 Overall Performance Score

**8/10** — Lazy load, no images, sensible memoization. No major issues; score would be refined with real Lighthouse data.

---

## AGENT 7: CALCULATOR ENGINEER AUDIT

### Calculator Integration Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| ASPECTS in pathway | ✅ | Numeric input 0–10 (anterior 0–6h) |
| ASPECTS calculator (visual) | ❌ | No regional diagram or point-and-click |
| pc-ASPECTS | ✅ | Numeric input 0–10 (basilar) |
| NIHSS | ⚠️ | LVO: bands (0–5, 6–9, 10–19, ≥20); MeVO: numeric. No link to NIHSS calculator |
| mRS | ✅ | Binary (0–1 vs &gt;1) |
| mTICI | ❌ | Not present |

### CALCULATOR ENGINEER AUDIT: EVT PATHWAY

#### ✅ Calculator Strengths

1. **ASPECTS and pc-ASPECTS** — Number inputs with min/max and placeholders; used correctly in logic.
2. **Core/mismatch** — Core volume, mismatch volume, and ratio (auto-calculated from core + mismatch) for DEFUSE-3.
3. **NIHSS bands (LVO)** — Reasonable for eligibility (0–5, 6–9, 10–19, ≥20); avoids wrong exact score.
4. **MeVO NIHSS** — Numeric input for finer granularity where needed.

#### 🧮 Calculator Issues/Gaps

- **Missing: ASPECTS calculator integration** — No link to an ASPECTS calculator (if one exists elsewhere) and no integrated visual (10 regions, click to subtract). Users may not know regions; risk of incorrect self-scoring.
- **Missing: NIHSS calculator link** — For LVO/MeVO, a “Calculate NIHSS” link could open NIHSS calculator and optionally return score (or at least educate).
- **Missing: mTICI** — No field to record mTICI (0–3) for EMR summary; optional but useful.
- **Mismatch ratio** — Auto-calculated from core + mismatch volume; good. Placeholder “Ratio” and readonly styling could be clearer (e.g. “Auto from core + mismatch”).

#### 🎯 Overall Calculator Assessment

**6/10** — Eligibility logic (ASPECTS, core, mismatch, DAWN) is correct and inputs are adequate. No visual ASPECTS tool, no NIHSS calculator link, no mTICI; these would make the pathway more complete and reduce input error.

---

## AGENT 8: ACCESSIBILITY SPECIALIST AUDIT

### Accessibility Checklist

| Criterion | Status | Notes |
|-----------|--------|------|
| Color contrast | ⚠️ | Not measured; status cards (emerald, amber, red) and text need verification |
| Keyboard navigation | ✅ | Buttons and inputs focusable; focus-visible:ring-2 |
| Screen reader | ⚠️ | Labels present but not associated via htmlFor/id; buttons lack aria attributes |
| Focus indicators | ✅ | focus-visible:ring-2 focus-visible:ring-neuro-500 |
| ARIA labels | ❌ | Star (favorite), Back, Next, Copy have no aria-label; SelectionCards no aria-pressed |
| Form labels | ⚠️ | Visual <label> exist; missing htmlFor and id on inputs |
| Required/error | ⚠️ | No aria-required or aria-invalid; “Pending Imaging” not announced as status |

### ACCESSIBILITY SPECIALIST AUDIT: EVT PATHWAY

#### ✅ Accessibility Strengths

1. **Focus visibility** — Buttons and inputs use `focus-visible:ring-2 focus-visible:ring-neuro-500 outline-none`.
2. **Semantic structure** — Headings (h1, h3, h4) and sections give a logical outline.
3. **Button semantics** — Actions are `<button>`; no clickable divs for primary actions.
4. **Modal close** — ThrombectomyPathwayModal close button has `aria-label="Close"`.

#### ♿ Accessibility Issues

- **Issue:** Form inputs (ASPECTS, pc-ASPECTS, core, mismatch, NIHSS numeric) have visual `<label>` but no `id` on input and no `htmlFor` on label.  
  - **WCAG:** 1.3.1 (Info and Relationships), 3.3.2 (Labels or Instructions).  
  - **Recommendation:** Add `id` to each input and `htmlFor={id}` on corresponding label.  
  - **Priority:** High.

- **Issue:** SelectionCards are `<button>` but do not expose selected state to assistive tech.  
  - **Recommendation:** Add `aria-pressed={selected}` (or role="radio" with aria-checked if single-select group).  
  - **Priority:** High.

- **Issue:** Favorite (Star) button has no accessible name.  
  - **Recommendation:** `aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}`.  
  - **Priority:** Medium.

- **Issue:** Result card (“Eligible,” “Avoid EVT,” etc.) is a large status change with no `aria-live`.  
  - **Recommendation:** Wrap result in a region with `aria-live="polite"` and optional `aria-atomic="true"`.  
  - **Priority:** Medium.

- **Issue:** “Copy to EMR” and “Back” / “Next” buttons have no aria-labels (rely on visible text).  
  - **Status:** Acceptable when text is visible; ensure visible text is not clipped on small screens.  
  - **Priority:** Low.

#### 🎯 WCAG Compliance Score

**5/10** — Good focus and headings; missing programmatic label association, selection state (aria-pressed/radio), and live region for result. Fixing labels and SelectionCard state would raise to ~7/10.

---

## EXECUTIVE SUMMARY

### Critical Issues (Fix First)

1. **Medical:** Add explicit “Do not delay EVT for tPA” / “Bridging tPA should not delay groin puncture” (pathway and/or guide).
2. **Accessibility:** Associate all form labels with inputs (`id` + `htmlFor`); add `aria-pressed` (or radio role) to SelectionCards.
3. **Content/UX:** Replace `alert("Assessment copied to EMR.")` with a toast.

### High Priority (This Week)

1. **Medical:** Add door-to-groin target (e.g. &lt;90 min) in one line.
2. **Content:** Extend EMR copy template with LKW, door, imaging, groin times and “Bridging tPA: Yes/No” when available.
3. **SEO:** Improve meta description (150–160 chars) and add keywords for “endovascular thrombectomy,” “LVO,” “ASPECTS.”
4. **Accessibility:** Add aria-label to favorite button; add aria-live region for result.

### Overall Pathway Health

| Domain | Score (1–10) | Status |
|--------|--------------|--------|
| Medical accuracy (2026) | 8/10 | Good; add “don’t delay EVT,” door-to-groin, post-EVT |
| Content & EMR copy | 8/10 | Good; EMR template + toast |
| SEO | 7/10 | Good; meta keywords + description |
| Mobile | 8/10 | Good; minor input/button tweaks |
| Desktop UX | 8/10 | Good; toast + optional “Pending” LVO |
| Performance | 8/10 | Good; lazy load; measure Lighthouse |
| Calculator integration | 6/10 | Adequate; add ASPECTS tool + NIHSS link |
| Accessibility | 5/10 | Needs labels, SelectionCard state, live region |

---

## CONSOLIDATED RECOMMENDATIONS

### Quick Wins (High Impact, Low Effort)

1. Replace copy confirmation `alert()` with toast (“Assessment copied to EMR”).
2. Add one line: “Do not delay EVT for tPA; proceed to groin when both indicated.”
3. Add one line: “Door-to-groin target: &lt;90 minutes (document when available).”
4. Add `htmlFor` and `id` to all pathway form labels.
5. Add `aria-pressed={selected}` to SelectionCard buttons.
6. Update routeMeta description and keywords for `/calculators/evt-pathway`.

### Missing Features

1. **ASPECTS calculator** — Integrated visual (10 regions) or link to standalone ASPECTS calculator.
2. **Door-to-groin timer** — Simple timer or time-to-target display (optional).
3. **mTICI** — Optional field for “mTICI result” in EMR summary.
4. **Transfer/activation checklist** — Single checklist (e.g. “Activate IR,” “Transfer to CSC,” “Notify neurointerventional”).

### Broken Elements

- **Links:** No broken internal or external links identified in code.
- **Functionality:** All pathway logic (LVO/MeVO, anterior/basilar, 0–6h/6–24h) and Copy to EMR work as implemented.

---

## IMPLEMENTATION ROADMAP

**Phase 1 — Critical (This Week)**  
- Add “Do not delay EVT for tPA” (pathway or guide).  
- Fix accessibility: label/input association, SelectionCard aria-pressed.  
- Replace copy alert with toast.

**Phase 2 — High (This Month)**  
- Door-to-groin target line.  
- EMR template: time fields + “Bridging tPA” when available.  
- SEO: meta description + keywords.  
- Accessibility: favorite aria-label, result aria-live.

**Phase 3 — Medium (This Quarter)**  
- Optional “Pending imaging” for LVO confirmation.  
- Link to NIHSS calculator (and optionally ASPECTS if built).  
- Run Lighthouse and fix any Performance/Accessibility issues.  
- Consider short “Post-EVT” blurb (BP, antiplatelet, 24h imaging).

**Phase 4 — Backlog**  
- ASPECTS calculator (visual) integration or link.  
- Door-to-groin timer.  
- mTICI field.  
- Transfer/activation checklist.  
- FAQ block + schema for SEO.

---

*End of EVT Pathway Audit Report. No code was changed; recommendations only.*
