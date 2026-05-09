# Compliance & Legal Audit — NeuroWiki

**Reviewer:** compliance-legal (claude-sonnet-4-6)  
**Date:** 2026-05-08  
**Decision:** pass-with-conditions  
**Scope:** Read-only audit — findings and delegation only, no drafting.

## Overall Compliance Rating: YELLOW

The disclaimer architecture is substantially sound. Blocking gaps: (1) Google Analytics fires before any cookie/tracking consent; (2) drug dosing displays in the live stroke code workflow have no adjacent per-use safety text; (3) NIHSS calculator has no in-page disclaimer; (4) no Privacy Policy, Terms of Use, or Accessibility Statement page exists.

---

## Surfaces Reviewed

- `src/components/DisclaimerModal.tsx`
- `src/components/FeedbackModal.tsx` + `FeedbackButton.tsx`
- `src/components/layout/Layout.tsx`
- `src/utils/storage.ts`, `src/utils/strokeDosing.ts`
- `src/hooks/useRecents.ts`
- `api/feedback.ts`, `api/npi.ts`
- `src/data/guideContent.ts` (first 100 lines)
- `src/data/strokeClinicalPearls.ts` (first 80 lines)
- `src/pages/NihssCalculator.tsx`
- `src/pages/Abcd2ScoreCalculator.tsx`
- `src/pages/EvtPathway.tsx` (sampling)
- `src/pages/EmBillingCalculator.tsx` (sampling)
- `src/components/article/stroke/CodeModeStep1.tsx`, `CodeModeStep2.tsx`
- `index.html`
- All calculator pages (grep sweep for disclaimer and directive language)
- All localStorage/sessionStorage usage (grep sweep)

---

## Findings

### F1 — Google Analytics Loads Without Cookie Consent (BLOCKING)

**Regulation:** GDPR Article 7, ePrivacy Directive; CCPA  
**Severity:** P0 — blocking for any EU-accessible deployment

`index.html` lines 117–123 load Google Analytics (`G-0PD4HYYNTP`) unconditionally in the HTML `<body>` before any consent mechanism fires. `anonymize_ip: true` is present but does not satisfy the GDPR requirement that analytics-class tracking only loads after affirmative user consent. The DisclaimerModal is a medical disclaimer gate, not a cookie consent mechanism. No cookie banner, no consent management platform integration, no conditional GA loading exists.

**Delegate to:** `ui-architect` (conditional GA loading), `content-writer` (consent banner copy).

---

### F2 — Drug Dosing in Stroke Code Workflow Has No Adjacent Per-Use Disclaimer (BLOCKING)

**Regulation:** FDA CDS educational-use exemption; liability  
**Severity:** P0

`src/components/article/stroke/CodeModeStep1.tsx:352–361` and `CodeModeStep2.tsx:229–236` display computed tPA total dose, bolus, infusion volumes, and TNK dose in milligrams as primary UI elements, formatted as clinical values. Neither component includes adjacent disclaimer text clarifying the displayed dose is a reference value to be verified against institutional protocols — not a medication order.

The "Consider TNK after discussing risk/benefit" text at CodeModeStep1:392 is a positive safeguard but appears only for specific low-NIHSS scenarios.

**Delegate to:** `content-writer` (copy: "Reference only — verify against institutional protocol before administration"), `ui-architect` (placement).

---

### F3 — NIHSS Calculator Has No In-Page Disclaimer (BLOCKING)

**Regulation:** FDA CDS exemption; liability  
**Severity:** P0

`src/pages/NihssCalculator.tsx` contains no disclaimer, no "educational use only" statement, and no "not a substitute for clinical judgment" language (confirmed by full read + grep). NIHSS score is directly used downstream to gate thrombolysis eligibility decisions. ASPECTS, ICH Score, GCS, ABCD2 all carry footer disclaimers — NIHSS is conspicuously missing this and is the highest-stakes calculator.

**Delegate to:** `content-writer` (copy matching ASPECTS pattern at `AspectScoreCalculator.tsx:416`), `ui-architect` (footer component).

---

### F4 — No Privacy Policy, Terms of Use, or Accessibility Statement Exists (BLOCKING)

**Regulation:** GDPR Articles 13/14; CCPA §1798.100; ADA/WCAG (accessibility statement best practice)  
**Severity:** P0 for GDPR-accessible deployment; P1 for US-only initial launch

Zero Privacy Policy, Terms of Service, or Accessibility Statement routed surfaces found in `src/App.tsx` or route definitions. The DisclaimerModal covers professional-use acknowledgment and limitation of liability, but does not describe what data is collected, does not provide a data deletion path, and cannot be accessed again by users after first acceptance.

**GDPR violation for any EU user:** Absence of a Privacy Policy describing Google Analytics, feedback email collection, and data controller identity violates Article 13.

**Delegate to:** `content-writer` (all copy — Privacy Policy must disclose: GA with IP anonymization, feedback collection via Resend, NPI proxy not stored, localStorage usage, data deletion contact), `ui-architect` (page shells, routing).

---

### F5 — Disclaimer Acceptance Not Re-Triggerable; No Persistent Legal Link (Advisory)

**Severity:** P2  
DisclaimerModal stores acceptance with `DISCLAIMER_VERSION = '1.0'`. Version-increment mechanism exists and works correctly. Gap: no documented process for when to increment the version. No persistent "Legal / Disclaimer" link in navigation for users who need to re-read terms after accepting.

**Delegate to:** `content-writer` (version increment protocol in CLAUDE.md), `ui-architect` (persistent low-prominence link in DesktopRail or footer).

---

### F6 — Feedback Form Collects Email Without Privacy Notice at Point of Collection (Advisory)

**Regulation:** GDPR Article 13; CCPA  
**Severity:** P2  
`src/components/FeedbackModal.tsx:259–269` presents an optional email field with no privacy notice, no statement of email usage, no retention policy disclosure, and no link to a Privacy Policy (which does not yet exist). Collection without disclosure is a GDPR Article 13 violation.

**Delegate to:** `content-writer` (one-line notice: "Your email is used only to follow up on this feedback and is not stored beyond that purpose.").

---

### F7 — NPI Lookup is Pure Proxy, No Storage (Pass)

`api/npi.ts` is a CORS proxy — forwards NPPES NPI Registry responses, stores nothing. Compliant. `EmBillingCalculator.tsx:1181` writes selected NPI provider object to `sessionStorage` (provider data, not patient PHI, public registry number). Session-only, not transmitted. Appropriate design.  
**Action:** Document sessionStorage behavior in Privacy Policy when drafted.

---

### F8 — localStorage Recents Store Tool Identifiers, Not Patient Data (Pass)

`useRecents.ts` stores `id`, `type`, `title`, `category`, `viewedAt` — tool identifiers only. No patient name, MRN, DOB, or clinical values. Browser-local, not transmitted. Compliant.

---

### F9 — Stroke Workflow sessionStorage Includes Clinical Inputs Without Patient Name (Advisory)

**Severity:** P3  
`StrokeBasicsWorkflowV2.tsx:72–131` persists `nihssScore`, `systolicBP`, `diastolicBP`, `glucose`, `weightKg`, `lkwTimestamp`, `eligibilityResult` to `sessionStorage` for up to 2 hours. No patient name, MRN, or direct identifier — not PHI under HIPAA. 2-hour TTL and tab-local scoping are appropriate design choices.

Workflow risk: shared device with open session. **Delegate to:** `ui-architect` (add a prominent "Clear session" button in the stroke code workflow).

---

### F10 — Educational Framing Inconsistent Across Calculator Surfaces (Advisory)

**Severity:** P2  
Calculators WITH footer disclaimers: ASPECTS, ICH Score, GCS, ABCD2, CHA2DS2-VASc, HAS-BLED.  
Calculators WITHOUT footer disclaimers: NIHSS (covered as F3), ROPE Score, Heidelberg Bleeding Classification, Boston Criteria CAA.  
EVT Pathway has disclaimer within output cards but not at page level.

**Delegate to:** `content-writer` (standardized footer copy), `ui-architect` (shared `<CalcDisclaimer />` component).

---

### F11 — "Do Not Give tPA/TNK" is Directive Language (Advisory)

**Regulation:** FDA CDS exemption boundary; liability  
**Severity:** P2  
`CodeModeStep2.tsx:215`: "Do not give tPA/TNK — major exclusion(s) identified." Prescriptive imperative ("Do not give"), not educational framing. The following line at 216 uses correctly hedged language ("Discuss risk vs benefits before proceeding (AHA)").

**Delegate to:** `content-writer` (revised copy: "Major exclusion(s) identified — eligibility for thrombolysis is affected. Review with attending before proceeding.").

---

### F12 — No "As-Is, Without Warranty" Language in Disclaimer (Advisory)

**Severity:** P3  
DisclaimerModal includes a consequential-damages disclaimer (line 117) but no "as-is, without warranty" clause. Standard medical tool disclaimers additionally state information is provided "as is, without warranty of any kind, express or implied, including but not limited to accuracy, completeness, or fitness for a particular purpose."

**Delegate to:** `content-writer`.

---

## Required Fixes Before Public/Clinical Launch

**Blocking (P0):**
1. Cookie consent gate before GA fires (F1)
2. Adjacent dosing disclaimer in stroke code workflow (F2)
3. In-page disclaimer on NIHSS calculator (F3)
4. Privacy Policy page disclosing GA, feedback email, NPI proxy, localStorage (F4)

**Advisory — before broad clinical rollout:**
5. Persistent "Legal / Disclaimer" nav link (F5)
6. Privacy notice on feedback form email field (F6)
7. Clear-session button in stroke code workflow (F9)
8. Standardize disclaimer footer across all calculator/pathway pages; shared component (F10)
9. Revise "Do not give tPA/TNK" to hedged framing (F11)
10. Add "as-is, without warranty" clause to DisclaimerModal (F12)
11. Create Terms of Use and Accessibility Statement pages (F4 continuation)
