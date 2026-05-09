# Content Writer Audit — Full Repo Agent Review

**Date:** 2026-05-08
**Auditor:** content-writer agent (claude-sonnet-4-6)
**Files read:** `src/data/strokeClinicalPearls.ts`, `src/data/guideContent.ts`, `src/data/ichScoreData.ts`, `src/data/abcd2ScoreData.ts`, `src/utils/trialNarrative.ts`, `.claude/skills/humanizer/SKILL.md`
**Scope:** Read-only. No clinical meaning changed. Recommendations only.

---

## Overall Content Quality Rating: YELLOW

The repo contains a significant volume of well-structured, evidence-anchored clinical content. Trial summaries are accurate, citation-linked, and action-oriented. The ICH Score interpretation text is the strongest piece of writing in the codebase — it has already passed a humanizer pass and reads like a senior resident explaining a clinical tool.

The issues that prevent a Green rating are specific and fixable:

- ABCD2 calculator interpretation strings are too terse to be useful at the bedside
- `buildHouseConclusion()` generates formulaic, recognizable AI-template prose
- A handful of pearls use passive voice or hedge clusters
- `guideContent.ts` section headers repeat the word "Clinical PEARLS" in caps (a formatting tic, not a clinical concern)
- Empty guide sections (`hemorrhagic-stroke`, `anticoagulation-reversal`, `icp-mgmt`, `sah-mgmt`, etc.) represent unfilled content slots — not an AI fingerprint issue, but a missing-content gap

None of the issues are P0 clinical safety items. All are P1 or P2 writing quality concerns that a targeted humanizer pass can resolve.

---

## Finding 1: AI-Fingerprint Language

**Severity: P2**

Across the files reviewed, the signal-phrase list from the humanizer skill was checked. The codebase is largely clean. No instances of "it's worth noting," "it is important to note," "leverage," "robust," "delve into," or "moving forward" were found in clinical copy.

However, two patterns recur:

**Pattern A — "utilize" appears in guideContent.ts**

- `guideContent.ts` line ~88: "Many centers now utilize this protocol for patients < 9 hours who are not thrombectomy candidates"
- Humanizer rule: `utilize → use`. The meaning is identical.

**Recommended fix:** Replace "utilize" with "use" throughout `guideContent.ts`. This is a B-class word-swap with no clinical meaning change.

**Pattern B — Passive constructions in guide section headers**

In the `iv-tpa` section:
- "Evidence suggests non-inferiority to Alteplase." — vague attribution ("evidence suggests"), no named trial
- Should be: "AcT (2022) and ORIGINAL (2024) confirmed noninferiority."

**Recommended fix:** Replace vague "evidence suggests" with the named trials. Requires medical-scientist verification of specific citation before edit.

---

## Finding 2: Teaching Pearl Quality

**Severity: P1 (one cluster), P2 (remainder)**

Fifteen pearls were read across steps 1–6. The majority are strong: specific numbers, named trials, actionable language, appropriate resident level. Standout examples:

- `stroke-mimics-safety` — excellent. Named trial (Zinkstok), specific numbers (1–2% vs 5.5–7.9%), plain-language conclusion.
- `doac-management-2026` — actionable. Decision tree is clear.
- `hemorrhage-reversal-protocol` — outstanding depth. Step-by-step, agent-specific, cites TICH-2 and 2022 ICH guidelines.
- `time-is-brain-deep` — good factual density. Cite-specific.

**Weakness cluster — pearls that list without teaching:**

`contraindications-absolute` (step-1, deep):
> "Acute ICH on imaging. Active internal bleeding. BP >185/110 uncontrolled. Platelet <100K. INR >1.7. Therapeutic LMWH <24h. Direct thrombin/Factor Xa inhibitors. Recent neurosurgery/severe head trauma <3mo. Blood glucose <50 mg/dL (hypoglycemia mimic)."

This is a list, not a pearl. It lacks the signature element of a good pearl: a teaching moment. A resident can find a contraindications list in any protocol. What they need is the *why* behind the most counterintuitive ones, and the one they most often forget.

**Recommended fix:** Consider splitting into two pearls — one short-list for quick mode, and a deep pearl that explains the two most commonly missed contraindications (DOAC recency, glucose below 50) with a sentence of clinical reasoning each. No clinical meaning changes required, but this is a content authoring task that needs medical-scientist sign-off on any new explanatory text.

**Pattern: Robotic STEP enumeration in `hemorrhage-reversal-protocol`**

> "STEP 1: Stop tPA infusion immediately. STEP 2: Cryoprecipitate 10 units IV push... STEP 3: TXA is NOT routinely recommended..."

The humanizer rules flag "Firstly... Secondly... Finally..." as an AI structural pattern. Numbered STEPs carry the same risk when used in prose rather than a true ordered checklist. In context, however, this pearl is specifically a protocol sequence where numbered steps are clinically appropriate — a resident following this pearl in an emergency should act in order. This is a valid exception to the structural-pattern rule.

**No change recommended here.** The clinical context justifies the numbered format.

---

## Finding 3: Guide Article Clarity

**Severity: P2**

The guide sections (`stroke-basics`, `iv-tpa`, `thrombectomy`, `acute-stroke-mgmt`, `status-epilepticus`) are all well-structured. Headers are used consistently. Bullet lists prevent wall-of-text. Actions are stated in imperative voice ("Perform baseline assessment," "Rule out hemorrhage").

**Issue A — Section header casing**

Throughout `guideContent.ts`, the repeated header `## Clinical PEARLS` uses inconsistent capitalization (sentence case for "Clinical," all-caps for "PEARLS"). This is a cosmetic formatting tic, not a content issue. Consistent casing (`## Clinical Pearls`) would be cleaner. Low priority.

**Issue B — Missing "why this matters" context in `stroke-basics`**

The `stroke-basics` section lists assessment steps correctly but does not explain *why* imaging within 25 minutes matters. A single bridging sentence — stating that ASPECTS assessment on the first CT changes the treatment pathway — would anchor the list for a learner, not just a practitioner already following the protocol.

Example of the gap:
> "Goal: 'Imaging is Brain'. Initiate within 25 mins of arrival."

A resident knows to do this; they may not know that early ASPECTS changes whether they call the thrombectomy team simultaneously or sequentially.

**Recommended fix:** Add a one-sentence "why" to the imaging goal line — no clinical meaning change, authoring task only.

**Issue C — `hemorrhagic-stroke` and `anticoagulation-reversal` are empty**

```ts
content: ``
```

These are unfilled content slots. Several neurocritical care entries (`icp-mgmt`, `sah-mgmt`, `hypoxic-brain`) and neuromuscular entries (`myasthenia-gravis`, `gbs`, `multiple-sclerosis`) are also empty. The ICH pearl data exists in `strokeClinicalPearls.ts` (step-6) but has not been woven into a guide article.

**Recommended fix:** This is a planned content authoring task, not a writing quality issue in existing content. Flag for the content roadmap. The ICH material from step-6 pearls could seed the `hemorrhagic-stroke` guide article.

---

## Finding 4: Calculator Interpretation Text

**Severity: P1 for ABCD2, P3 for ICH Score**

**ICH Score (`ichScoreData.ts`) — PASS**

The ICH Score interpretation copy is the best-written clinical text in the codebase. Three features distinguish it:

1. Named citation on every claim ("Hemphill et al., Stroke 2001")
2. Critical limitation stated directly: "early do-not-resuscitate orders were common in the original cohort; in populations where aggressive care is provided, observed mortality may differ"
3. Active voice throughout: "A low ICH Score carries..." not "A low score is associated with..."

The file header even documents a prior humanizer pass, noting "4 signal phrases removed, 0 em-dashes, 3 vague attributions replaced." This is the template other calculator files should follow.

**ABCD2 Score (`abcd2ScoreData.ts`) — NEEDS WORK**

The `ABCD2_DRAWER_EXPLANATION` record contains the only user-facing clinical interpretation text for this calculator. All three tiers read as placeholder copy:

```ts
low: 'Urgent outpatient workup within 48h. All TIA patients need urgent evaluation regardless of score.',
moderate: 'Consider admission or same-day/urgent evaluation.',
high: 'Admit for workup and stroke prevention.',
```

Comparison against the ICH Score standard reveals three gaps:

1. **No named citation.** Johnston et al. (Lancet 2007) established the 2-day risk tiers. Neither the `explanation` field nor the `interpretation` field mention it.
2. **No numbers in the explanation.** The `stat` field provides the percentage, but the `explanation` string does not contextualize it. "Moderate risk" yields "Consider admission" — the resident doesn't know whether the 4.1% 2-day risk warrants same-day observation vs. discharge with next-day follow-up.
3. **"Consider" in the moderate tier.** The humanizer rule is: pick one hedge or none. "Consider admission or same-day/urgent evaluation" hedges twice with no resolution. A resident reading this at 2am needs a clear directive, not a menu.

**Recommended fix (authoring task, needs medical-scientist verification):**

The `explanation` strings should follow the ICH Score template:
- State the validated 2-day risk percentage for that tier
- Name the source (Johnston et al., Lancet 2007)
- Give a single clear action directive
- Note a key limitation (ABCD2 underperforms in validating populations with high-risk imaging findings not captured in the score)

---

## Finding 5: Trial Narrative (`trialNarrative.ts`)

**Severity: P1**

The `buildHouseConclusion()` function generates one of four template sentences depending on trial type. The output is formulaic and detectable as machine-generated prose. Examples of what the function produces:

**For a positive trial:**
> "DAWN favored Thrombectomy over Standard Medical Therapy for mRS 0-2 at 90 days, with event rates of 49% versus 13% (36-point absolute difference). In practice, this supports using the intervention for patients who resemble the trial population and workflow."

**For a negative trial:**
> "[Trial name] did not establish a clear advantage for [treatment] over [control] on [endpoint]. The observed rates were X% versus Y%, so the safest read is that the intervention should not replace standard care on the basis of this trial alone."

**Problems flagged by the humanizer checklist:**

1. "In practice, this supports using the intervention for patients who resemble the trial population and workflow" — this sentence appears in identical or near-identical form for every positive trial. It is a template filler sentence with no trial-specific content. The humanizer skill specifically identifies "rule of three" and boilerplate closings as AI signatures.

2. "The safest read is that..." — this phrasing is hedging language. It is also slightly editorializing (what makes a read "safe"?). More direct: "On this trial alone, the intervention should not replace standard care."

3. The estimation-trial branch: "the practical takeaway is similarity within the study's design assumptions" — "practical takeaway" is a signal phrase adjacent to "to summarize" and "the bottom line is." It softens rather than teaches.

4. The function cannot produce trial-specific nuance. DAWN's NNT of 2.8 — one of the most potent effect sizes in stroke history — comes out with the same closing sentence as a trial with NNT of 53. The conclusion is factually correct but educationally equivalent across very different trials.

**Recommended fix:**

Two options of different scope:

- **Option A (minimal):** Rewrite the four template sentences to remove signal phrases and filler. The data assembly (rates, delta, endpoint name) is good — only the closing interpretive sentence needs rewriting. This is a content edit, no clinical logic change.

- **Option B (structural, Class C):** Move the editorial conclusion into per-trial `conclusion` fields in `trialData.ts`, authored by the content writer and verified by medical-scientist. The function then assembles data and appends the authored conclusion rather than generating one from a template. This produces trial-specific, non-AI-sounding narrative.

Option B is preferable educationally but requires a content authoring pass for every trial. Option A is a quick win that reduces AI fingerprint without a data-schema change.

---

## Finding 6: Repetitive Phrasing

**Severity: P2**

**"Clinical PEARLS" header** appears in every trial article in `guideContent.ts`. This is expected structural repetition (a section heading), not template-fill prose. No change needed.

**"No significant difference" in mortality** is used in NINDS, ECASS-3, DAWN, DEFUSE-3, CREST, and SOCRATES trial summaries — correctly, because mortality did not significantly differ in these trials. This is accurate repetition, not lazy writing.

**"Standard of care"** appears in SAMMPRIS, SPARCL, NASCET, and CHANCE summaries. In each case it correctly identifies a guideline-level practice change. The phrase is appropriate but could occasionally be replaced with the specific recommendation to increase specificity (e.g., "Aggressive Medical Management is now first-line for symptomatic ICAD" rather than "AMM is now the standard of care").

**One genuine template-fill instance:** In multiple trial summaries, the closing bullet reads either "Guideline Impact" or "Standard of Care Change" and then restates the trial's finding rather than adding interpretive value beyond what appears in the results section. This is a P2 issue — the bullet exists, it is accurate, but it often duplicates rather than synthesizes.

---

## Finding 7: Overlong Sections

**Severity: P2**

No guide sections currently exceed 400 words. The `status-epilepticus` section is the longest (~350 words of content) and is appropriately dense — it covers four treatment phases with dosing, which requires word count.

The `iv-tpa` section (~250 words) and `thrombectomy` section (~200 words) are well within bounds.

The `acute-stroke-mgmt` section is approximately 280 words and is scannable.

**No overlong sections identified.** The main risk is additive: as empty sections are filled in (ICH, SAH, ICP, GBS, MS), they will need word-count discipline from the start. Recommend establishing a 350-word soft ceiling for any single guide section, with overflow handled by linked sub-articles or expandable pearls.

---

## Finding 8: Missing Teaching Context

**Severity: P2**

Three specific locations where a single "why this matters" sentence would materially improve resident education:

**Location A — `iv-tpa` guide section, Tenecteplase note:**
Current text: "Evidence suggests non-inferiority to Alteplase. Preferred for LVO patients being transferred (drip-and-ship) due to single bolus convenience."

Missing context: why single-bolus matters operationally. A resident who has never done a drip-and-ship transfer does not know that the 60-minute infusion pump creates a transfer logistics problem. One sentence: "A 60-minute alteplase infusion complicates ambulance transfers; tenecteplase eliminates the pump entirely."

**Location B — `stroke-basics` imaging protocol:**
Current text lists CT/CTA/CTP in order but does not explain what changes based on findings. A sentence connecting "CTA identifies LVO" to "which triggers simultaneous IR activation" closes a gap for learners who have read the steps but haven't run a code.

**Location C — `thrombectomy` guide section, ASPECTS cutoff:**
Current text: "NCCT ASPECTS >= 6 (Small core infarct). New Evidence: Large Core (ASPECTS 3-5 or Core > 50cc) now shown to benefit (SELECT2, ANGEL-ASPECT, RESCUE-Japan trials)."

Missing context: why this is a guideline shift, not just new data. A single sentence noting that ASPECTS 3–5 was historically a hard stop would help residents understand why attending behavior may differ from current trial evidence.

---

## Finding 9: Terminology Consistency

**Severity: P2**

A terminology audit across both files reveals three areas of inconsistency:

**Thrombolytic agent naming:**

- `guideContent.ts` uses "alteplase (tPA)," "Alteplase," "alteplase," "IV tPA," and "tPA" — all in the same file, sometimes within the same section
- `strokeClinicalPearls.ts` uses "IV tPA," "tPA," and "IV thrombolysis" interchangeably
- The `iv-tpa` guide section header says "IV Thrombolytic Protocol" (plural noun for drug class), while the body uses drug names

**Recommended convention:** Use "alteplase" when referring to the specific drug (matching the generic name used in trials). Use "IV thrombolysis" when referring to the treatment strategy. Use "tPA" only in parenthetical shorthand after first use. This mirrors how AHA/ASA 2026 documents handle the naming.

**Thrombectomy naming:**

- "Endovascular Thrombectomy (EVT)" — used in trial summaries (correct, matches AHA/ASA 2026 terminology)
- "Mechanical Thrombectomy (EVT)" — used in the guide section title
- "thrombectomy" (unqualified) — used throughout pearls

These three usages refer to the same procedure. "Endovascular thrombectomy" or "EVT" is the current preferred term in guidelines. "Mechanical thrombectomy" is the older usage. Recommend standardizing to "endovascular thrombectomy (EVT)" on first use in each article, then "EVT" thereafter.

**Guideline references:**

- Some pearls cite "AHA/ASA 2026 Guidelines" (correct, updated)
- Some cite "AHA 2024..." or simply "AHA guidelines" (outdated or unspecific)
- ICH pearls correctly cite "AHA/ASA 2022 ICH Guidelines"

**Recommended fix:** A targeted search-and-replace for "AHA 2024" in clinical copy, updating to "AHA/ASA 2026" with section references where possible. Requires medical-scientist verification before any edit.

---

## Sections Requiring a Humanizer Pass

In priority order:

1. **`ABCD2_DRAWER_EXPLANATION` in `abcd2ScoreData.ts`** — all three tier strings need full rewrite: add citation, add numbers, sharpen directives. High-impact, short text.
2. **`buildHouseConclusion()` in `trialNarrative.ts`** — the four closing template sentences need rewriting to remove signal phrases and filler.
3. **`iv-tpa` in `guideContent.ts`** — "Evidence suggests non-inferiority" needs named trial attribution. "Many centers now utilize" needs `utilize → use`.
4. **`stroke-basics` in `guideContent.ts`** — imaging section needs one bridging "why this matters" sentence.
5. **Any new guide article filling the empty `content: ``` slots** — these must pass the humanizer checklist before merge. The ICH and SAH articles are the highest clinical priority to fill.

---

## Top 5 Content Quality Improvements

**1. Rewrite ABCD2 interpretation strings to match ICH Score quality standard.**

The ICH Score is the internal benchmark. The ABCD2 strings are currently at 10% of that quality. This is the single highest-impact content fix in the repo: short text, clinician-facing, used on every ABCD2 calculation. Requires content-writer authoring and medical-scientist verification.

**2. Rewrite `buildHouseConclusion()` template sentences.**

The function currently produces identical-sounding conclusions for trials with wildly different clinical significance. DAWN (NNT 2.8) and SOCRATES (negative trial) should not read the same. Rewriting the four closing templates into non-formulaic prose is a one-day content task.

**3. Standardize thrombolytic naming across the codebase.**

"alteplase," "tPA," "IV tPA," and "IV thrombolysis" are used interchangeably. Pick a convention per the AHA/ASA 2026 terminology and apply it consistently. This does not change any clinical claim.

**4. Fill the empty guide sections with authored content, not generated prose.**

`hemorrhagic-stroke`, `anticoagulation-reversal`, `icp-mgmt`, and `sah-mgmt` are empty. The ICH pearl data in `strokeClinicalPearls.ts` step-6 provides a strong seed for the ICH guide article. These are the highest-priority unwritten sections given the platform's stroke/neuro-critical care focus.

**5. Expand `contraindications-absolute` pearl from a list into a teaching pearl.**

The absolute contraindications pearl is accurate but provides no educational value beyond a list a resident already memorized. Adding one sentence of clinical reasoning for the two most commonly missed contraindications (glucose <50 mimicking stroke, DOAC timing) would transform it from a reference lookup into a learning moment.
