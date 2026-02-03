# EMERGENCY PROTOCOL IMPLEMENTATION PLAN

**Scope:** Add two emergency complication protocol buttons and modals to the Stroke Basics workflow (AHA/ASA 2026 Tables 5 & 6).  
**Status:** Planning complete — no code written.  
**Stakeholders:** Medical Scientist, Content Writer, UI Architect, Mobile-First Developer, Accessibility Specialist, SEO Specialist.

---

## 1. FINAL DESIGN DECISIONS (Consolidated from All Agents)

### Button placement
- **Location:** Dedicated **“Emergency Protocols”** section at the **bottom of the workflow**, after the code ends — i.e. after Step 4 (Code Summary & Documentation) and **near the “Copy to EMR” / documentation area**, before the bottom spacer (`h-24 safe-area-inset-bottom`). Same placement for both buttons: **tPA/TNK Reversal** and **Orolingual Edema** sit side by side (or stacked on narrow screens) in this one section.
- **Important distinction:** **tPA/TNK Reversal Protocol** is **not** the same as the existing hemorrhage protocol. The current workflow shows “Thrombolysis contraindicated” when ICH is detected and directs users to “Proceed to hemorrhage protocol (2022 AHA/ASA ICH)” — that hemorrhage protocol is **not** currently visible in the UI. The **Reversal** protocol is for **symptomatic intracranial bleeding after the patient has received tPA/TNK** (AHA/ASA 2026 Table 5). It is its own thing: a separate button + modal at the bottom, alongside the Orolingual Edema protocol.
- **Rationale:** Always visible so residents can open protocols during or after a code. Keeps emergency complication protocols separate from the linear 1→4 flow and colocated with end-of-code actions (e.g. Copy to EMR).
- **Visibility:** Buttons are **always visible** (no conditional on tPA given). Rationale: angioedema can occur quickly; reversal protocol is needed as soon as thrombolytic is started; discovery is better than hiding.
- **Visual distinction:** Section header “Emergency Protocols” with short subtitle; two side-by-side (or stacked on narrow view) buttons with distinct colors and icons so they’re not mistaken for primary workflow steps.

### Modal design
- **Type:** **Centered modal** (same pattern as `ThrombolysisEligibilityModal` / NIHSS modal): overlay + `max-w-4xl max-h-[90vh]` content box, scrollable body.
- **Rationale:** Full-screen on mobile can be specified separately; centered modal keeps parity with existing stroke modals and preserves context (user still sees workflow behind).
- **Steps:** **Numbered list** (1, 2, 3…) with clear step titles and body text only. **No checkboxes** — no “mark step done” or progress toggles in the modals.
- **Long content:** Single scrollable column; no pagination. Optional collapsible “Supportive care” / “References” at bottom to keep critical steps above the fold.
- **Actions:** **Primary:** “Copy to EMR” (or “Copy to clipboard”). **Secondary:** “Close”. Place in a **sticky footer** inside the modal so they’re always visible without scrolling.

### Information hierarchy
- **Most prominent:** Protocol title (e.g. “tPA/TNK Reversal Protocol”), one-line **urgency/criticality** (e.g. “Symptomatic intracranial hemorrhage – act immediately”), then **Step 1** (stop infusion / airway).
- **Warnings:** Critical actions (e.g. “Stop alteplase”, “Maintain airway”) in **bold** or short callout; drug interactions or key contraindications in a compact **warning callout** (e.g. “Hold ACE inhibitors”).
- **Risk stratification (Orolingual only):** **At top** of modal: “Lower risk: anterior tongue/lips only. Higher risk: larynx, palate, floor of mouth, oropharynx, or rapid progression (&lt;30 min).” Inline in step text where it affects choice (e.g. airway approach).
- **Alternatives:** Show alternative medications (e.g. TXA vs ε-aminocaproic acid; Ranitidine vs Famotidine) as **“Option A / Option B”** or bullet list under the same step so one step = one decision point. No tabs or dropdowns for Phase 1 to keep implementation simple and copy-paste friendly.

### Visual design
- **tPA/TNK Reversal:** **Red** accent (e.g. red-600/700 for header, red-50 background for warning callouts). Icon: **droplet** or **alert-triangle** (bleeding/urgency).
- **Orolingual Edema:** **Amber/orange** accent (amber-600/700) to signal “airway/complication” without conflating with hemorrhage. Icon: **airway/lungs** or **alert-circle**.
- **Design system:** Reuse existing stroke modal patterns (rounded-2xl, shadow, border), typography (text-lg for title, text-sm for body), and spacing so the new modals feel part of the same “Stitch”/stroke workflow rather than a separate app.

### Mobile strategy
- **Modal:** **Full-viewport on small screens** (e.g. &lt;640px): modal content uses `min-h-[100dvh]` or full height, with sticky header (title + close) and sticky footer (Copy, Close). On larger breakpoints, keep centered `max-h-[90vh]` box.
- **Touch:** All interactive elements **≥44×44 px** (buttons, close). Adequate spacing between tappable items to avoid mis-taps.
- **Scrolling:** Sticky modal header (protocol name) and sticky footer (actions); body scrolls in between. No pinch-to-zoom required if font size and layout are readable (min ~16px effective for critical dosing).
- **Gestures:** **Tap outside overlay to close** optional (accessibility prefers explicit Close). **Swipe down to close** optional for Phase 2.

### Accessibility
- **Keyboard:** **Escape** closes modal; **Tab** cycles through focusable elements (focus trapped inside modal while open); **Enter** activates buttons. No mouse required.
- **Focus:** On open, focus moves to **first focusable element** (e.g. “Close” or first heading); on close, focus returns to **button that opened the modal**.
- **ARIA:** Modal container: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to protocol title, `aria-describedby` optional for first line of description. Close button: `aria-label="Close [protocol name]"`. Live region for “Copied to clipboard” toast: `aria-live="polite"`.
- **Contrast:** Red/amber used for **accents and borders** only; **body text on white/light background** to meet WCAG AA. Warning text and dosing remain black/dark gray on light; avoid red/amber as sole background for long text.
- **Screen readers:** Step list is a numbered list (`<ol>`); step titles as headings or strong text. Urgency/criticality can be announced via `aria-live` when modal opens (e.g. “Emergency protocol opened: tPA reversal for symptomatic bleeding”).

### Content structure
- **Step format:** One numbered step per block: **Step N. [Title]** on one line, then **body** (dosing, timing, alternatives) in short paragraphs or bullets. **Dosing** called out in bold or a small “Dose” subline (e.g. “Cryoprecipitate 10 units IV over 10–30 min; goal fibrinogen ≥150 mg/dL”).
- **Quick reference:** Optional **2–3 line “Quick summary”** at the very top (e.g. “Stop infusion → Labs + CT → Cryo 10 U → Antifibrinolytic → Consults”) for experts; detailed steps follow for full compliance and EMR copy.
- **EMR copy:** “Copy to EMR” pastes **plain text** in a consistent format: title, date/time, then numbered steps with dosing on same line as step title so it can be dropped into a progress note. No HTML or markdown in clipboard.

---

## 2. COMPONENT ARCHITECTURE

### New components
| Component | Purpose |
|----------|--------|
| `EmergencyProtocolButtons` (or inline block in workflow) | Section “Emergency Protocols” + two buttons that open the two modals. Can be a small presentational component or a fragment in `StrokeBasicsWorkflowV2`. |
| `TpaReversalProtocolModal` | Modal for symptomatic ICH reversal (Table 5). Props: `isOpen`, `onClose`. Content: title, criticality line, numbered steps, warning callouts, references, Copy / Close. |
| `OrolingualEdemaProtocolModal` | Modal for orolingual angioedema (Table 6). Props: `isOpen`, `onClose`. Content: title, airway risk levels, numbered steps, alternatives, references, Copy / Close. |

### Modified files
| File | Change |
|------|--------|
| `src/pages/guide/StrokeBasicsWorkflowV2.tsx` | (1) Add state: `tpaReversalModalOpen`, `orolingualEdemaModalOpen`. (2) After `</section>` for step-4, insert “Emergency Protocols” section with two buttons. (3) Render both modals (lazy-loaded via `React.lazy` + `Suspense` same as other stroke modals). (4) Pass `onCopySuccess` or equivalent to show existing toast (“Copied to clipboard” / “Copied to EMR”). |

### Shared behavior / hooks
- **Copy to clipboard:** Reuse existing toast pattern from workflow (`setToastMessage` + 2.5s timeout). Modal receives an optional `onCopySuccess` callback.
- **Lazy loading:** Same pattern as `ThrombolysisEligibilityModal` and `ThrombectomyPathwayModal`: `const TpaReversalProtocolModal = lazy(() => import('...'));` and wrap in `<Suspense fallback={null}>` to avoid increasing initial bundle.

### Optional (Phase 2)
- **Cross-links:** From ICH pathway or hemorrhage protocol (e.g. `HemorrhageProtocol.tsx`) add a link “tPA/TNK reversal (symptomatic ICH)” that could open the reversal modal or deep-link to Stroke Basics with modal open; requires route/state design. (Note: Step checkboxes are **out of scope** — no checkboxes in protocol modals.)

---

## 3. MEDICAL ACCURACY CHECKLIST (Medical Scientist)

### Protocol 1: Symptomatic intracranial bleeding reversal (Table 5)
- [x] **Step 1:** Stop alteplase infusion or tenecteplase — correct first action.
- [x] **Step 2:** Emergent labs (CBC, PT/INR, aPTT, fibrinogen, type & cross) — appropriate.
- [x] **Step 3:** Emergent nonenhanced head CT — correct.
- [x] **Step 4:** Cryoprecipitate 10 units IV over 10–30 min, goal fibrinogen ≥150 mg/dL — align with AHA/ASA 2026.
- [x] **Step 5:** Antifibrinolytic: TXA 1000 mg IV over 10 min **or** ε-aminocaproic acid 4–5 g over 1 h then 1 g IV until bleeding controlled — both options per guidelines.
- [x] **Step 6:** Consults: Hematology, Neurosurgery — appropriate.
- [x] **Step 7:** Supportive care: BP, ICP, CPP, MAP, temperature, glucose — complete.
- **Warnings to include:** Do not use platelet transfusion routinely; reserve for severe thrombocytopenia or planned surgery. Fibrinogen trend until goal; repeat CT as clinically indicated.
- **No reordering recommended:** Sequence (stop → labs/CT → reversal → consults → supportive) is correct.

### Protocol 2: Orolingual angioedema (Table 6)
- [x] **Airway:** Lower risk (anterior tongue/lips) vs higher risk (larynx, palate, floor of mouth, oropharynx, rapid &lt;30 min) — include at top.
- [x] **Step 1:** Maintain airway; awake fiberoptic preferred; note nasal-tracheal epistaxis risk; cricothyroidotomy rarely needed — correct.
- [x] **Step 2:** Discontinue IV thrombolytic, hold ACE inhibitors — critical; emphasize.
- [x] **Step 3:** Methylprednisolone 125 mg IV, Diphenhydramine 50 mg IV, Ranitidine 50 mg IV or Famotidine 20 mg IV — dosing per refs 53–54.
- [x] **Step 4:** If progression: Epinephrine 0.1% (1 mg/mL) 0.3 mL SC or 0.5 mg/dL nebulizer — clarify “0.5 mg” nebulizer (not “0.5 mg/dL”) if guideline wording is different; implement per final source.
- [x] **Step 5:** Icatibant 30 mg SC (repeat q6h, max 3 doses/24 h) or C1 esterase inhibitor 20 IU/kg — “if available”; label as advanced/second-line.
- [x] **Step 6:** Supportive care — appropriate.
- **Warnings:** ACEi-induced angioedema; ensure ACEi held. No dangerous drug–drug interactions that must block protocol use; standard epinephrine cautions (cardiac) can be one-line note.

### Visual indicators (Medical Scientist recommendation)
- **Reversal protocol:** Red theme; icon (droplet/alert); short line “Life-threatening bleeding – follow steps in order.”
- **Orolingual protocol:** Amber theme; icon (airway/alert); short line “Airway risk – assess lower vs higher risk; maintain airway first.”

---

## 4. IMPLEMENTATION PHASES

### Phase 1 – Core functionality
- [ ] Add “Emergency Protocols” section and two buttons to `StrokeBasicsWorkflowV2` (after Step 4 section).
- [ ] Create `TpaReversalProtocolModal`: shell (isOpen, onClose), title, one-line criticality, numbered steps from Table 5, references line, Copy + Close in footer.
- [ ] Create `OrolingualEdemaProtocolModal`: shell, title, airway risk box, numbered steps from Table 6, references, Copy + Close in footer.
- [ ] Wire state (reversal modal open, edema modal open) and lazy-load modals with existing toast on copy.
- [ ] Use protocol text agreed by Content Writer (see Section 5) and medical accuracy above.

### Phase 2 – Polish
- [ ] Responsive modal: full-viewport on small breakpoint, sticky header/footer, 44 px touch targets.
- [ ] Accessibility: focus trap, focus return, Escape to close, ARIA on dialog and close button, optional aria-live for “Copied.”
- [ ] Copy to EMR: format clipboard text (title, timestamp, numbered steps) for paste into EMR.
- [ ] Visual refinements: red/amber accents, icons, spacing, and contrast check.

### Phase 3 – Testing
- [ ] Medical accuracy review (final sign-off on displayed dosing and sequence).
- [ ] Mobile device testing (touch, scroll, overlay, no zoom needed).
- [ ] Screen reader and keyboard-only pass.
- [ ] End-to-end: open from workflow, copy, close, reopen; no regression on existing steps/timer.

---

## 5. CONTENT STRUCTURE (Content Writer)

### Reversal protocol – suggested structure
- **Title:** “tPA/TNK Reversal Protocol (Symptomatic Intracranial Hemorrhage)”
- **Subtitle/criticality:** “AHA/ASA 2026, Table 5 – Act in sequence; do not delay imaging or reversal.”
- **Steps:** Numbered 1–7 with bold step title and body. Dosing on same line or immediate next line (e.g. “Cryoprecipitate: 10 units IV over 10–30 min; goal fibrinogen ≥150 mg/dL”). Antifibrinolytic step: “Tranexamic acid 1000 mg IV over 10 min **or** ε-aminocaproic acid 4–5 g IV over 1 h, then 1 g IV until bleeding controlled.”
- **Footer:** “References: AHA/ASA 2026 Acute Ischemic Stroke Guideline, Table 5.”

### Orolingual protocol – suggested structure
- **Title:** “Orolingual Angioedema Protocol (Post-Thrombolysis)”
- **Subtitle:** “AHA/ASA 2026, Table 6; Refs 53–54.”
- **Risk box (top):** “**Lower risk:** Anterior tongue/lips only. **Higher risk:** Larynx, palate, floor of mouth, oropharynx, or rapid progression (&lt;30 min).”
- **Steps:** Numbered 1–6; Step 5 (Icatibant / C1 esterase inhibitor) labeled “If available (advanced).”
- **Footer:** “References: AHA/ASA 2026, Table 6; Refs 53–54.”

### EMR copy format (plain text)
```
[Protocol title]
Date/Time: [current local time]

1. [Step title]. [Dosing/detail on same line if short.]
2. ...
...
```
- No bullets or markdown; line breaks and numbers only so it pastes cleanly into progress notes.

---

## 6. OPEN QUESTIONS / DECISIONS NEEDED

1. **Epinephrine nebulizer dose (Orolingual):** User provided “0.5 mg/dL nebulizer” — confirm against AHA/ASA 2026 Table 6 / refs 53–54 (often listed as 0.5 mg or similar). Implement per final guideline wording.
2. **Cross-link from HemorrhageProtocol:** Should the existing `HemorrhageProtocol` component (expandable card) include a “tPA/TNK reversal (symptomatic ICH)” link that opens the new reversal modal? If yes, requires passing modal open callback into that component or using a shared context.
3. **“Copy to EMR” vs “Copy to clipboard”:** Label as “Copy to EMR” for clinical clarity, with same clipboard behavior.
4. **Current hemorrhage protocol visibility:** The ICH-detected path shows “Thrombolysis contraindicated” and “Proceed to hemorrhage protocol (2022 AHA/ASA ICH)” but the protocol content is not currently visible in that flow. Making the existing hemorrhage protocol visible there is a separate UX decision; this plan only adds the two new emergency protocol buttons (Reversal + Edema) at the bottom.

---

## 7. ALTERNATIVE APPROACHES CONSIDERED

| Approach | Reason not chosen |
|----------|--------------------|
| Reuse or merge with “hemorrhage protocol” | tPA/TNK Reversal is a **different** scenario (symptomatic ICH *after* thrombolysis). The hemorrhage protocol (2022 AHA/ASA ICH) applies when ICH is detected *before* giving tPA. Reversal gets its own button and modal at the bottom, like the edema protocol. |
| Buttons only after tPA given (e.g. Step 2 treatment = tPA) | Hides protocols when most needed (during/after giving tPA); angioedema can develop quickly; reversal is time-critical. Always visible is safer. |
| Step checkboxes in modals | User requirement: no checkboxes. Protocol modals are numbered lists only. |
| Floating action button (FAB) | Less discoverable; two protocols need two actions; FAB often single primary action. Section with two buttons is clearer. |
| Slide-out panel instead of modal | Inconsistent with other stroke modals; panel can feel cramped on mobile. Centered (or full-screen on mobile) modal matches rest of app. |
| Separate pages (e.g. /protocols/tpa-reversal) for SEO | Protocols are workflow tools used during a code; primary entry is from Stroke Basics. Modal-first keeps flow; optional dedicated pages can be added later if needed for search. |
| Tabs for alternative medications (e.g. TXA vs ε-aminocaproic) | Adds interaction and can complicate “Copy to EMR” (which option to copy). “Option A / Option B” in one step keeps one copy output and simpler UX. |

---

## 8. SEO SPECIALIST RECOMMENDATION

- **Modal-only for now.** Protocols are part of the Stroke Basics workflow; primary use case is “during a code,” not organic search. No dedicated URLs or meta tags required for Phase 1.
- **If dedicated pages added later:** Use URLs like `/guide/stroke-basics#protocol-tpa-reversal` (hash) or `/guide/protocols/tpa-reversal` (route). Add minimal meta (title, description), optional `HowTo` or `MedicalWebPage` schema. Internal links from Stroke Basics guide and ICH/hemorrhage content would support discoverability.

---

**Document version:** 1.0  
**Last updated:** 2026-02-02  
**Next step:** User approval; then implement Phase 1 per this plan.
