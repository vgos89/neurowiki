# NeuroWiki — UI Mockup Specifications
Every Claude Code UI session must read this file before writing any JSX.
These specs are LOCKED. Changes require PM Agent approval.

## How to use this file
Before touching any component, find the screen spec below.
Match every measurement, color token, border, and spacing exactly.
When in doubt, refer to the Design Tokens section at the bottom.

---

## Screen 1 — Home Page (src/pages/Home.tsx)
Status: NOT YET REBUILT

Layout top to bottom:
- Nav bar (from Layout.tsx — do not touch)
- Hero section: "Neurology Toolkit" h1 (text-2xl font-semibold), subtitle (text-sm text-slate-400), white bg, border-b border-slate-100
- Quick Access grid: 2 columns on mobile, 3 on desktop. Each card is a white bordered card with category badge top-right, icon circle, title, subtitle. Emergency cards bg-red-50 border-red-200. Pathway cards bg-neuro-50 border-neuro-200. Calculator cards bg-slate-50 border-slate-200. Billing cards bg-amber-50 border-amber-200.
- Landmark Trials strip: heading + "View all →" link right. Each trial: cobalt initial circle, trial name bold, one-line description, category pill.
- Bottom nav (from Layout.tsx — do not touch)

Card spec:
  border: 0.5px solid [category color -200]
  border-radius: rounded-xl
  padding: p-4
  background: [category color -50]
  Category badge: text-[8px] font-bold uppercase tracking-wide, top-right corner

---

## Screen 2 — Stroke Code Header (src/pages/guide/StrokeBasicsWorkflowV2.tsx)
Status: PARTIALLY DONE — header fix pending

Target header structure:
  Row 1: "Stroke Code" (text-lg font-semibold text-slate-900) left | Code/Study pill toggle right
  Code/Study toggle: bg-slate-100 rounded-lg p-1 container. Active pill: bg-white rounded-md shadow-sm text-neuro-500 font-semibold. Inactive: text-slate-400.
  NO subtitle text. NO "3 sections · tap any to open" text.
  NO QuickReferenceCard in Code mode. QuickReferenceCard only shows when workflowMode === 'study'.

Tab bar (already implemented — do not change):
  Vitals | Imaging | Summary
  Active: border-b-2 border-neuro-500 text-neuro-500
  Inactive: border-transparent text-slate-400

---

## Screen 3 — Stroke Step 1 Vitals (src/components/article/stroke/CodeModeStep1.tsx)
Status: REBUILT — do not touch structure, only fix regressions

Section card pattern (use for every section):
  bg-white border border-slate-100 rounded-xl p-4

LKW section:
  Section label: text-[10px] font-bold uppercase tracking-widest text-slate-400
  Time display: text-2xl font-semibold text-slate-900 — tappable, opens clock picker
  Within 4.5h badge: bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-semibold
  Change link: text-xs text-slate-400 — same onClick as time display
  LKW Unknown checkbox: text-sm text-slate-500

Vitals grid:
  grid-cols-2 gap-2
  BP card: bg-red-50 border-red-200 when bpTooHigh, else bg-slate-50 border-slate-200
  Glucose card: bg-amber-50 border-amber-200 when glucoseLow, bg-red-50 border-red-200 when glucoseHigh, bg-slate-50 border-slate-200 default
  Status text: text-[10px] font-semibold — red/amber/emerald matching card state

NIHSS row:
  flex items-center gap-3
  Score: text-4xl font-semibold text-slate-900 (shows — when 0)
  Severity label: text-sm font-semibold text-slate-900
  LVO probability: text-xs text-slate-400
  Input: w-12 min-h-[44px] text-sm font-bold text-center
  Calc button: min-h-[44px] px-3 text-xs font-semibold text-neuro-600 border-neuro-200 bg-neuro-50

Weight + Dosing:
  Weight input: w-24 min-h-[44px] text-xl font-semibold text-center
  When weightKg > 0: grid-cols-2 pill cards
  tPA pill: bg-neuro-50 border-neuro-100 text-neuro-700
  TNK pill: bg-emerald-50 border-emerald-100 text-emerald-700

CTA:
  w-full min-h-[52px] bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-xl text-sm

Emergency strip:
  Three buttons flex gap-2, each flex-1 min-h-[44px] py-2 px-3 rounded-lg text-xs font-medium
  tPA reversal: border-red-200 bg-red-50 text-red-700
  Orolingual edema: border-amber-200 bg-amber-50 text-amber-700
  ICH protocol: border-slate-200 bg-slate-50 text-slate-600

---

## Screen 4 — Stroke Step 2 Imaging (src/components/article/stroke/CodeModeStep2.tsx)
Status: NOT YET REBUILT

Step 1 summary bar:
  bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-slate-400
  Shows: LKW · NIHSS · BP · Weight on one line

CT Result section (section card):
  Label + Stamp CT time button (right)
  Radio cards: full-width, padding p-3, rounded-lg border
  Selected: border-neuro-500 bg-neuro-50 — radio dot filled neuro-500
  Unselected: border-slate-200 bg-white — radio dot empty

Treatment Decision section (section card):
  Same radio card pattern as CT Result
  tPA option shows calculated dose inline: "tPA — 64.8 mg"
  TNK option shows dose: "TNK — 18 mg"
  None / Contraindicated option

CTA & LVO section (section card):
  CTA ordered checkbox
  If ordered: LVO Yes/No/Pending as three horizontal pill buttons
  If LVO Yes: orange EVT pathway button — "→ EVT Pathway"

Save CTA:
  Same pattern as Step 1 — w-full bg-neuro-500 min-h-[52px]

---

## Screen 5 — Trials Page (src/pages/trials/TrialPageNew.tsx)
Status: NOT YET REBUILT

Page header:
  "Neuro Trials" (text-xl font-semibold)
  Category filter pills: scrollable horizontal row
  All (active: bg-neuro-500 text-white), IVT, EVT, Secondary Prevention, Surgical, Acute

Trial card spec (the most important element — readable in 10 seconds):
  border: 0.5px solid border-slate-200
  border-left: 3px solid [category color]  — IVT=neuro, EVT=neuro, Prevention=teal, Surgical=violet
  border-radius: rounded-xl
  padding: p-4

  Row 1: Trial name (text-sm font-bold text-slate-900) | Category badge (right)
  Row 2: One-sentence finding (text-xs font-semibold text-slate-900) — the key result in plain english
  Row 3: Design + sample size (text-xs text-slate-400)
  Row 4: Three stat pills in a row — mRS/primary outcome % vs %, NNT, p-value
  Row 5: Guideline implication (text-xs bg-emerald-50 text-emerald-800 rounded px-2 py-1)

  Stat pill: no border, just the label (text-[10px] text-slate-400) above and value (text-sm font-bold) below
  Treatment % in emerald if better than control

---

## Screen 6 — E/M Calculator (src/pages/EmBillingCalculator.tsx)
Status: NOT YET REBUILT

Page header: "E/M Billing" (text-xl font-semibold) + "Step through to find your code" (text-sm text-slate-400)

Progress bar: 4 segments, filled segments bg-neuro-500, empty segments bg-slate-200, height 3px, rounded

Step question card (section card):
  Question: text-sm font-semibold text-slate-900
  Sub-question: text-xs text-slate-500
  Answer options: each a full-width card, border border-slate-200 rounded-lg p-3
  Selected option: border-neuro-500 bg-neuro-50
  Option title: text-sm font-semibold
  Option description: text-xs text-slate-400

Result preview card (always visible, updates live):
  bg-slate-900 rounded-xl p-4
  Label: text-xs text-white/50 "Current projection"
  Code: text-3xl font-semibold text-white
  Description: text-xs text-white/60

Next CTA: w-full bg-neuro-500 min-h-[52px]

---

## Design Tokens (apply to every screen)

### Colors
Primary action: bg-neuro-500 (#1746A2) hover:bg-neuro-600
Primary fill: bg-neuro-50 (#EEF2FF) border-neuro-100 text-neuro-700
Danger: bg-red-50 border-red-200 text-red-700
Warning: bg-amber-50 border-amber-200 text-amber-700
Safe/success: bg-emerald-50 border-emerald-200 text-emerald-700
Page background: bg-white
Section cards: bg-white border border-slate-100 rounded-xl p-4
Muted text: text-slate-400
Body text: text-slate-700
Heading: text-slate-900

### Typography
Page title: text-xl font-semibold text-slate-900
Section label: text-[10px] font-bold uppercase tracking-widest text-slate-400
Body: text-sm text-slate-700
Muted: text-xs text-slate-400
Data large: text-2xl or text-4xl font-semibold text-slate-900

### Spacing
Section gap: space-y-3 or gap-3
Card padding: p-4
Card internal gap: gap-3 or space-y-3
Border: 0.5px solid — never 1px for decorative borders

### Interactive elements
All tappable elements: min-h-[44px]
Primary button: w-full min-h-[52px] bg-neuro-500 rounded-xl font-semibold text-sm text-white
Secondary button: border border-slate-200 bg-white text-slate-700 rounded-lg
Danger button: border-red-200 bg-red-50 text-red-700 rounded-lg

### Borders
Card border: border border-slate-100 (0.5px)
Input border: border border-slate-200
Active/selected: border-neuro-500
Never use border-2 except for emphasis cards
Never use arbitrary colors — only Tailwind scale or neuro-* tokens
