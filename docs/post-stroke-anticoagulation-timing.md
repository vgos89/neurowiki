# Post-Stroke Anticoagulation Timing

This document captures the **current NeuroWiki implementation** of the post-stroke anticoagulation timing tool so it can be compared against the AHA/ASA guideline text and primary trial data.

Primary implementation source:
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/ElanPathway.tsx`

Related evidence/data sources in repo:
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts`
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/aha2026StrokeGuideline.ts`
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/seo/schema.ts`

## Scope

The current tool is designed for:
- acute ischemic stroke
- atrial fibrillation present
- direct oral anticoagulant (DOAC) timing after stroke

The current tool is **not** designed for:
- mechanical heart valves
- major hemorrhagic transformation / confluent parenchymal hematoma
- non-cardioembolic stroke
- warfarin-specific decision logic

## Inputs Used by the Tool

The tool asks for:
- `isIschemicAfib`: yes / no / unknown
- `hasBleed`: yes / no / unknown
- `hasMechanicalValve`: yes / no / unknown
- `hasPetechialHt`: yes / no / unknown
- `recentReperfusion`: yes / no / unknown
- `size`: tia / minor / moderate / major / unknown
- `onset`: stroke onset date

## Eligibility Logic

The implemented pathway exits early as ineligible if any of the following are true:

1. `isIschemicAfib === 'no'`
   - Message: protocol applies to ischemic stroke with atrial fibrillation.

2. `hasBleed === 'yes'`
   - Message: significant hemorrhagic transformation or confluent parenchymal hematoma is an exclusion.

3. `hasMechanicalValve === 'yes'`
   - Message: mechanical valve requires warfarin rather than a DOAC-based pathway.

The pathway does **not** automatically exclude:
- petechial hemorrhagic transformation
- recent IV thrombolysis or thrombectomy

Instead, those are surfaced as **caution flags** requiring individualized review.

If `onset` is missing, the tool returns an eligible result but does not calculate dates yet.

## Imaging-Based Stroke Size Definitions

The implementation uses imaging size categories, not NIHSS categories.

### TIA
- transient ischemic attack
- no persistent infarct on follow-up imaging

### Minor
- single infarct `<= 1.5 cm`

### Moderate
- cortical superficial branch of MCA / ACA / PCA
- deep branch MCA infarct
- internal border-zone infarct

### Major
- large territory infarct
- `>= 2` MCA cortical branches
- brainstem or cerebellar infarct `> 1.5 cm`

## Timing Logic Implemented

The tool calculates **two windows**:
- `Earlier Strategy`
- `Later Strategy`

Day `0` is the onset date entered by the user.

### TIA

Earlier strategy:
- `Within 48 hours`
- displayed date range: `Day 0` to `Day 2`

Later strategy:
- `Day 3 or 4`
- displayed date range: `Day 3` to `Day 4`

### Minor Stroke

Earlier strategy:
- `Within 48 hours`
- displayed date range: `Day 0` to `Day 2`

Later strategy:
- `Day 3 or 4`
- displayed date range: `Day 3` to `Day 4`

### Moderate Stroke

Earlier strategy:
- `Within 48 hours`
- displayed date range: `Day 0` to `Day 2`

Later strategy:
- `Day 6 or 7`
- displayed date range: `Day 6` to `Day 7`

### Major Stroke

Earlier strategy:
- `Day 6 or 7`
- displayed date range: `Day 6` to `Day 7`

Later strategy:
- `Day 12, 13, or 14`
- displayed date range: `Day 12` to `Day 14`

## Pseudocode

```text
if not ischemic stroke with AF:
  ineligible

if significant hemorrhagic transformation:
  ineligible

if mechanical valve:
  ineligible

if no onset date:
  eligible, but no dates calculated

if stroke size == tia:
  early = within 48h
  late = day 3-4

if stroke size == minor:
  early = within 48h
  late = day 3-4

if stroke size == moderate:
  early = within 48h
  late = day 6-7

if stroke size == major:
  early = day 6-7
  late = day 12-14
```

## Output Behavior

The UI also adds these operational messages:
- repeat CT or MRI before starting anticoagulation to exclude hemorrhagic transformation
- use a DOAC
- warfarin is required for mechanical valves
- petechial hemorrhagic transformation should trigger individualized timing review
- recent IVT or EVT should trigger extra caution because evidence remains limited in that subgroup

## Evidence Framing Used in the UI

The current UI labels the recommendation as:
- `COR 2a`
- `LOE A`
- “early oral anticoagulation in carefully selected AF patients is low-risk and reasonable compared to delayed initiation”

The current evidence accordion references:
- ELAN Trial
- OPTIMAS Trial
- TIMING Trial
- AHA/ASA 2026

## Important Audit Findings

These are the key implementation issues to compare against the actual guideline:

### 1. The tool uses ELAN-style timing windows, not a pure guideline timing table

The tool is fundamentally an **ELAN-derived decision aid** with later support text from OPTIMAS, TIMING, and AHA/ASA 2026.

### 2. The guideline statement in repo is broad, not a day-by-day protocol

Current guideline text in repo states that early DOAC initiation is safe and reasonable versus delayed initiation, but it does not itself function as a fully explicit timing table in the same way the calculator does.

### 3. The calculator now separates TIA from infarct-size categories

The live implementation now includes:
- TIA
- minor
- moderate
- major

TIA is routed with the earliest ELAN-style bucket.

### 4. Caution flags are broader than hard exclusions

The live implementation now flags:
- petechial hemorrhagic transformation
- recent IV thrombolysis or thrombectomy

These do not hard-stop the tool, but they deliberately break the impression that the pathway can be used mechanically without bedside judgment.

## Recommended Comparison Questions for Notebook LLM

Ask the comparison model:

1. Does the 2026 AHA/ASA guideline explicitly endorse these exact timing bins, or only the general principle of earlier DOAC initiation?
2. For petechial hemorrhagic transformation, should the pathway remain a caution-only branch or should some imaging patterns trigger a delay recommendation directly?
3. After recent IVT or EVT, should the pathway remain warning-based or should it force a separate decision branch?
4. Are additional branches needed for:
   - petechial hemorrhagic transformation
   - large infarct with mass effect
   - severe renal dysfunction
   - recent thrombolysis / thrombectomy-specific cautions

## Dead Link Audit

Audit result:
- the route `/calculators/elan-pathway` exists in the app
- the content is published in `contentStatus.ts`
- the broken behavior was likely caused by trial markdown rendering internal links as plain HTML anchors instead of React Router links

Fix applied:
- internal markdown links on trial pages now route through React Router in:
  - `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/trials/TrialPageNew.tsx`

This should prevent internal calculator/trial links from hard-refreshing into dead routes on the deployed SPA.
