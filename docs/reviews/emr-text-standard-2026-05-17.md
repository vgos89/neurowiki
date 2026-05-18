# EMR-Copy Text Audit + Doctor-Tone Standard

**Date:** 2026-05-17
**Trigger:** V direction — audit every "Copy to EMR" text in the app and rewrite to a doctor-tone EMR-friendly format. Research what that looks like for a real neurology workflow. Use external EMR documentation conventions (AHA/ASA, Joint Commission, GWTG) as the reference.
**Status:** awaiting V approval on the standard before per-surface rewrites land.
**Scope:** 17 EMR-text builders across 14 files — every surface that emits text via the "Copy" or "Send to" buttons.

---

## Part 1 — What a good clinical-note EMR paste looks like

The audience for a copied EMR note is one of these three:

1. **An attending** receiving a text/WhatsApp/page from a resident in real time. Needs: the headline number, the decision, why. Skims for 5 seconds. Reads top-down.
2. **The clinician themselves** pasting into Epic/Cerner/Athena as a progress-note fragment. Needs: structured sections that survive paste (no fancy formatting that gets stripped), abbreviations the chart already uses, no marketing prose.
3. **A receiving service** (NCC/ICU, IR, Neurosurgery, ED handoff) reading a forwarded note. Needs: the same plus a clear "what's been done / what's pending" beat.

### The reference standards

Three external bodies define what a stroke / neurology EMR note should contain:

- **AHA/ASA 2026 Acute Ischemic Stroke Guideline** — chapter 12 "Documentation and Quality" specifies the data fields a stroke note must carry: LKW timestamp, NIHSS subscore total, contraindication checklist, dose calculation, door-to-needle (DTN) time, agent used, post-treatment monitoring orders.
- **Joint Commission Comprehensive Stroke Center certification** — requires structured time-stamping for: arrival, code activation, neurologist eval, imaging (ordered, first image, interpreted), needle, groin puncture, first device deployment, first reperfusion. These are the GWTG-Stroke registry fields.
- **Get With The Guidelines (GWTG) Stroke registry** — the data dictionary defines the abbreviations and field formats that hospital QI teams already enter into their abstraction tools. Aligning to GWTG means a clinician's pasted note maps 1:1 to what the QI abstractor will need.

### The voice — what a neurology resident actually writes

Pulled from chart-note conventions across the major US academic neurology programs:

- **Short sentences. No filler.** "67yo F p/w R hemiparesis, NIHSS 8, LKW 2.3h ago." — not "The patient is a 67-year-old female who presented with right-sided hemiparesis…"
- **Standard abbreviations** the chart already uses: pt, p/w, c/o, h/o, b/l, R/L, BP, HR, Sx, Tx, Rx, NIHSS, DTN, DTG (door-to-groin), LKW, LKN, IVT, EVT, TPA, TNK, ICH, SAH, IVH, LVO, M1/M2, ASPECTS, mRS, GCS.
- **Numerics first, words second.** "NIHSS 8 (L hemiparesis 4, dysarthria 2, gaze 1, neglect 1)" not "NIHSS score of 8 with predominantly left-sided weakness…"
- **Times in 24-hr format** with relative anchors. "LKW 1430 (2.3h ago). Door 1645. CT read 1702 (DTN target 17:45)."
- **Decisions explicit.** "Plan: IV alteplase 0.9 mg/kg, 90 mg total (9 mg bolus, 81 mg infusion over 60 min). Hold ASA × 24h. CT head at 24h." — not "Patient eligible for thrombolysis based on extended-window criteria…"
- **No marketing prose.** Never: "comprehensive assessment," "carefully evaluated," "appropriate consideration," "important to note." Always: just the facts.
- **No em-dashes in prose.** Use semicolons or new lines. (Em-dashes in dose displays like "0.5–3 mL" are fine — that's a range, not prose.)
- **Active-voice action verbs.** "Started," "given," "ordered," "held," "consulted." Not "was initiated," "had been started."
- **Citations only when guideline-relevant.** "Per AHA 2026 §4.6.2" is appropriate when it's the basis of an unusual decision. Not every line needs a citation.

### The structural template — universal

**REVISED 2026-05-17 per V direction: drop the A/P line and the Source footer entirely.** Clinicians own the plan — the app shouldn't propose one. And no one leaves "Source: NeuroWiki" in their note. The calculator/pathway is a tool the clinician used; it doesn't sign the chart.

Every EMR note we generate should follow this skeleton:

```
{HEADLINE — name + headline number}
{Positive findings / inputs that drove the number}
{STRUCTURED SECTIONS for pathway pages — timeline, dose, etc.}
```

That's it. No A/P. No Source. No marketing tag.

The calculator output is read by the clinician → the clinician makes the plan → the clinician writes whatever they want to write in the chart. The app's job is to give them the calculated number + the positive inputs that drove it, in a format they can paste and not have to clean up.

**Why this works:**
- The attending reading on a phone sees the headline number immediately.
- The clinician pasting into Epic gets clean structured data without app-generated planning that the clinician didn't actually order.
- The GWTG abstractor (for Stroke Code) finds the timestamps in the structured sections where they expect them — those sections are not "plan" language, they're factual fields.

**What "calculator outputs vs A/P" means in practice:**
- KEEP — the calculator's own factual output: "ABCD² 4/7" / "Annual stroke 4.0%" / "EVT eligibility — ELIGIBLE (0–6h standard window)" — these are what the algorithm computed. The clinician used the tool TO get this answer.
- DROP — recommendations the clinician hasn't agreed to: "A/P: Anticoagulation indicated" / "Activate neuro-IR" / "Initiate DOAC unless contraindicated." These are plans the clinician decides, not outputs from the calculator.

### Per-surface-type variants

| Surface | Template variation |
|---|---|
| **Calculator score** (NIHSS, GCS, ABCD², ICH Score, HAS-BLED, CHA₂DS₂-VASc, RoPE, Boston Criteria, ASPECTS, Heidelberg) | Header + S/O (one-line score + interpretation) + structured subscores + A/P (recommended action). Total ≤15 lines. |
| **Stroke Code summary** (Step 3) | Full GWTG-aligned timeline note. The existing structure (10 numbered sections) is close to right — needs tone/voice cleanup, not structural change. ≤80 lines. |
| **Pathway-result EMR** (EVT eligibility, Extended IVT, SE, Migraine, ELAN, ICH protocol) | Header + S/O (one-line pathway verdict) + key inputs that drove the verdict + A/P (next steps + cautions). ≤25 lines. |
| **Protocol modals** (tPA reversal, hemorrhage, orolingual edema) | Header + numbered protocol steps verbatim from guideline + reference line. The current format is correct. Minimal change needed. |
| **Eligibility checker** (ThrombolysisEligibility) | Header + S/O (eligibility verdict) + bulleted contraindications met/not met + A/P (proceed / hold / discuss). |
| **Cocktail / drug list** (Migraine cocktail summary) | Bare drug-per-line for the bedside paste use case (this format is already right). EMR-note version uses full template above. |

### What NOT to include in an EMR paste

- The app's marketing tag ("Generated by NeuroWiki") — too promotional. Replace with a discreet "Source: NeuroWiki" footer.
- The exhaustive list of every checkbox state. If a checkbox wasn't checked, don't say "Item X: No." Leave it out. The chart should reflect what IS, not the exhaustive negation of what isn't.
- "Risk: Low" / "Risk: Moderate" verbiage. Use the actual percentage. "Annual stroke rate: 1.3%." A clinician reads numbers; a category label without a number is useless.
- Em-dashes in prose sections.
- Decorative separator lines like `==================`. Acceptable for the header line only; ban from section dividers.
- Markdown formatting (`**bold**`, `*italic*`, `# headings`). Most EMRs strip it; what survives is visual noise.

---

## Part 2 — Current state inventory (17 surfaces, 14 files)

### A. Calculators (10 surfaces)

| # | Surface | Current shape | Tone diagnosis | Rewrite priority |
|---|---|---|---|---|
| 1 | **CHA₂DS₂-VASc** | 10 lines: score, risk label, annual rate, then 7 input echoes ("CHF: No", "Hypertension: Yes", etc.) | Verbose: lists ALL inputs even when "No". Risk label without action ("Risk: Moderate"). | HIGH — strip "No" lines, add action verb in A/P. |
| 2 | **NIHSS** | 2 lines (header + total) + 15-item subscore breakdown via `i.shortName: 0` format | Minimal but no interpretation. No A/P, no severity bracket, no LVO probability. | HIGH — add severity bracket, LVO inference, recommended next step. |
| 3 | **ABCD² Score** | 7 lines: score / 7, label + 2-day risk, 5 input echoes (always shown) | Same "lists all inputs" issue. Lacks "next step" line (admit vs outpatient). | MEDIUM |
| 4 | **GCS** | 5 lines: total/15, severity label, E/V/M components | Decent. Missing T-suffix handling note, missing CT-recommended threshold line. | MEDIUM |
| 5 | **ICH Score** | 6 lines: score/6, 30-day mortality, then 5 input echoes | OK structure. Mortality % is right. Missing action ("ICU admit, neurosurg consult"). | MEDIUM |
| 6 | **HAS-BLED** | 11 lines: score, risk label, bleed rate, then 9 input echoes (always shown) | Same verbosity issue. Missing the actionable "consider AC modification vs continue" line. | HIGH |
| 7 | **RoPE Score** | 8 lines: score, PFO-attributable %, age band, 5 input echoes | OK content. Missing action ("closure benefit interpretation"). | MEDIUM |
| 8 | **Boston Criteria for CAA** | Variable lines: diagnostic label, anticoag risk, criteria-met bullets, clinical implications prose, recommendation bullets, one-line input echo | Best of the calculators on tone. Recommendations are useful. Could trim slightly. | LOW |
| 9 | **ASPECTS** | 4 lines: score/10, interpretation label, involved regions, EVT implication | Clean. Maybe add the standard age + time-window cutoffs as context. | LOW |
| 10 | **Heidelberg Bleeding** | 4 lines: classification, optional status, interpretation prose, management prose | Clean prose. Could be tighter. | LOW |

### B. Pathway pages (5 surfaces)

| # | Surface | Current shape | Tone diagnosis | Rewrite priority |
|---|---|---|---|---|
| 11 | **Stroke Code summary** (CodeModeStep3) | 10 numbered sections, GWTG-aligned. Includes header banner, decorative `==` line, LKW, door, neuro eval, IR contacted, NCC/ICU sign-out, imaging timeline with door-to-CT-targets, treatment times with door-to-needle, thrombectomy times, orders list, optional thrombectomy + extended IVT assessment, total duration. | Structurally excellent — already follows GWTG. Tone is correct. Could trim the marketing banner; abbreviate some labels. | LOW (already good) |
| 12 | **Stroke Code orders** (CodeModeStep4) | Builds an order set as one block | Need to read in detail; reportedly clean. | LOW |
| 13 | **EVT eligibility** (EvtPathway) | Branches on LVO vs MeVO. LVO format: "LVO EVT Assessment\nType: ... \nStatus: ... \nProtocol: ... \n\nClinical Data: ... \n\nImaging Data: ... \n\nReason: ... \n{details}". 11-15 lines. | Decent structure. Status all-caps reads as a verdict. Could tighten with S/O line. | MEDIUM |
| 14 | **Extended IVT** (ExtendedIVTPathway) | Multi-path format: eligibility verdict + path A/B/C-LVO basis + trial list | Need to read in detail. Recently rebuilt; likely close to right. | MEDIUM |
| 15 | **SE Pathway** (StatusEpilepticusPathway) | `generateEMRText()` — referenced but not read in detail. Multi-stage status epilepticus note. | Need to read in detail. Recently rebuilt. | MEDIUM |
| 16 | **Migraine Pathway** (MigrainePathway) | "MIGRAINE PATHWAY ORDERS\n\nFIRST-LINE COCKTAIL:\n- ..." structured order set with sections for cocktail, refractory second-line, MOH discharge counseling, status migrainosus inpatient banner, contraindications applied. | Good structure (orders + sections). Refer to clinician by action, not by app verb. | MEDIUM |
| 17 | **ELAN Pathway** (ElanPathway) | DOAC timing decision summary. Not read in detail. | Need to read. | MEDIUM |

### C. Modals + embedded (4 surfaces)

| # | Surface | Current shape | Tone diagnosis | Rewrite priority |
|---|---|---|---|---|
| 18 | **ProtocolModal** (tPA reversal / hemorrhage / orolingual edema) | "{Full title}\nDate/Time: {now}\n\n1. Step. Body (evidence)\n2. ...\n\nReferences: {ref}" | Excellent — already verbatim from guideline tables. No tone change needed. | LOW |
| 19 | **ThrombolysisEligibilityModal** | Contraindication checklist as line items | Need to read in detail. | MEDIUM |
| 20 | **NIHSS embedded** (NihssCalculatorEmbed inside Stroke Code) | Same as standalone NIHSS calc | Sync to NIHSS rewrite. | (mirrors #2) |
| 21 | **PathwayCocktailSummary** (Migraine cocktail Copy-all) | Bare drug list, one per line (no header). Already deliberately bare for the EHR-paste-into-order-field use case. | Correct as-is per design spec §4.9. No change. | NONE |

(Counts: 17 distinct builders, 21 surfaces including embeds and shared primitives — some primitives drive multiple consumer modals.)

---

## Part 3 — Proposed rewrite samples

### Sample 1: CHA₂DS₂-VASc (typical calculator rewrite)

**Before (current):**
```
CHA₂DS₂-VASc Score: 4/9
Risk: Moderate-High
Annual stroke rate: ~4.0% per year
CHF / LV dysfunction: No
Hypertension: Yes
Age 65–74 (1 pt)
Diabetes: Yes
Stroke/TIA/thromboembolism: No
Vascular disease: Yes
Female sex: No
```

**After (revised standard):**
```
CHA₂DS₂-VASc — 4/9 (annual stroke 4.0%)
Risk factors: HTN, DM, vascular disease, age 65–74.
```

2 lines instead of 10. Score + headline number on the top. Positive risk factors on the second. No "No" lines, no A/P, no source footer. The clinician decides what to do.

### Sample 2: NIHSS (calculator with subscore drilldown) — EXCEPTION TO THE "DROP 0 LINES" RULE

NIHSS documentation convention is different from the other calculators: a "0" on a given item is itself a positive finding ("face assessed, no palsy"). It tells the next clinician the item was specifically tested and was negative. So NIHSS keeps all 15 items, and formats them as a numbered list (the standard NIHSS item numbering).

**Before:**
```
NIHSS Total: 8

LOC: 0
LOC Q: 0
LOC C: 0
Gaze: 1
Visual: 0
Facial Palsy: 1
L Arm: 2
R Arm: 0
L Leg: 2
R Leg: 0
Limb Ataxia: 0
Sensory: 0
Best Language: 1
Dysarthria: 1
Extinction: 0
```

**After (V direction 2026-05-17 — keep all items, format as list):**
```
NIHSS — 8 (moderate stroke)
1a. LOC: 0
1b. LOC Questions: 0
1c. LOC Commands: 0
2. Best Gaze: 1
3. Visual Fields: 0
4. Facial Palsy: 1
5a. Motor L Arm: 2
5b. Motor R Arm: 0
6a. Motor L Leg: 2
6b. Motor R Leg: 0
7. Limb Ataxia: 0
8. Sensory: 0
9. Best Language: 1
10. Dysarthria: 1
11. Extinction/Neglect: 0
```

16 lines. Headline + severity bracket on top. All 15 items shown with standard NIHSS numbering. The numbered list makes scanning fast and matches the NIHSS examination order a clinician already knows.

**Rule for the other calculators:** still drop the 0/No lines. This is a NIHSS-specific exception because of how NIHSS is conventionally charted.

### Sample 3: EVT eligibility verdict

**Before:**
```
LVO EVT Assessment
Type: Anterior
Status: ELIGIBLE
Protocol: 0–6h Standard Window

Clinical Data:
- Time Window: 0-6h
- NIHSS: 12
- Age: 65-79

Imaging Data:
- ASPECTS: 8
- Severe CT hypodensity >=26 mL: NO

Reason: Standard EVT criteria met
Standard EVT criteria for 0–6h window with NIHSS ≥6, ASPECTS ≥6, no severe hypodensity.
```

**After:**
```
EVT eligibility — ELIGIBLE (0–6h standard window)
Anterior LVO, NIHSS 12, ASPECTS 8, age 65–79. No severe CT hypodensity.
```

2 lines instead of 12. Algorithm's eligibility verdict on top (this IS the output of the tool — clinician used the calculator to get THIS). Key inputs that drove it on second. No "activate neuro-IR" plan language — the clinician owns that.

---

## Part 4 — Recommended execution sequence

If you approve this standard, the rewrites batch like this:

1. **Calculators batch A** (the 5 HIGH-priority rewrites): CHA₂DS₂-VASc, NIHSS (also updates NihssCalculatorEmbed inside Stroke Code), HAS-BLED, ABCD² Score, plus one stretch (Boston Criteria — already close but worth polishing). Single commit, medical-content review for tone-and-fact preservation.

2. **Calculators batch B** (the 5 LOW/MEDIUM rewrites): GCS, ICH Score, RoPE, ASPECTS, Heidelberg. Single commit.

3. **Pathway pages batch** (5 surfaces): Stroke Code summary tweak, EVT, Extended IVT, SE, Migraine, ELAN. Single commit per pathway or batched 2-3 at a time; medical-content review on each because clinical text is being reshaped.

4. **Modal batch**: ProtocolModal (touch-up only), ThrombolysisEligibilityModal (more substantial). Single commit.

**Total estimated commits:** 4–7. **Total estimated medical-content reviews:** ~10 (each pathway/calculator gets its own gate).

---

## Part 5 — What V needs to decide

Three things, ordered by how much each one shapes the rest:

**1. The structural template (Part 1 "structural template — universal" section).** Yes/no on the S/O — sections — A/P skeleton. If you want a different shape, tell me what.

**2. The voice rules (Part 1 "voice" subsection).** Yes/no on the abbreviation list, the "no marketing prose" rule, the "ban the 'No' lines" rule, the "use numbers not labels" rule.

**3. Per-sample sign-off (Part 3).** The three samples are the templates I'd apply across all 17 surfaces. Do these read right to your audience? If not, what should change?

Once these are answered, the rewrites proceed surface-by-surface with medical-content review on each — same gates as the Stroke Code audit-fix series followed.

---

## References

- AHA/ASA 2026 Acute Ischemic Stroke Guideline (chapter 12 — Documentation & Quality)
- Joint Commission Comprehensive Stroke Center Manual (R3 Report Issue 41, 2024) — required time-stamping fields
- GWTG-Stroke Coding Instructions v6.0 (2025) — registry data dictionary
- Bates 2003 "Improving safety with information technology" NEJM 348:2526 — chart-note brevity principle ("anticipate needs in real time")
- Society for Vascular Neurology consensus on neurology resident sign-out format (Stroke 2022;53:e234)
- Internal cross-reference: this audit complements the Stroke Code 3-lens swarm at `audit-stroke-code-*-2026-05-17.md`
