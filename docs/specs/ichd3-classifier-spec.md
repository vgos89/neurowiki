# ICHD-3 Guided Phenotype Classifier — Clinical Spec

**Status:** draft, ready for clinical-reviewer
**Owner:** medical-scientist (authored 2026-05-25)
**Consumes:** ICHD-3 (2018), Scher Continuum 2024 (TTH), Burish Continuum 2024 (cluster), Goadsby Continuum 2024 (hemicrania), Ailani AHS 2021 (preventive threshold)
**Implemented by:** ui-architect (do NOT modify `src/pages/ClinicHeadachePathway.tsx` from this spec — that is the ui-architect's job)
**Routing:** ready for clinical-reviewer

---

## 0. Design principles (read first)

The classifier exists to reduce diagnostic anchoring bias, not to deliver a verdict. Five rules govern every implementation decision below; clinical-reviewer should block any implementation that violates them.

1. **Neutral question wording.** No question may lead toward a specific diagnosis. The first question is NOT "is the headache throbbing?" because that anchors to migraine. The first question is about onset/continuity, which separates NDPH and HC from episodic headaches before any character question is asked.
2. **Continuity before character.** Questions 1-2 cover onset and continuity. Questions 3-7 cover character, location, severity, and autonomic features. Mixing these orderings biases the doctor toward whichever phenotype's defining feature is asked first.
3. **Probabilistic output.** The result card uses "Most consistent with X" not "Diagnosis: X." The top two candidates are always shown side-by-side with matched and unmatched criteria, so the clinician can see what fits AND what does not fit.
4. **Equal-prominence reconsider button.** The "This doesn't match — reconsider" button must be visually equal to "Confirm phenotype." If reconsider is smaller, gray, or below the fold, the design has failed.
5. **Mandatory secondary-headache disclaimer.** Every result card displays the disclaimer in §5 below. It is not collapsible, not dismissible, not hidden behind a tooltip.

---

## 1. Classifier questions

Each question shows the exact text, the answer options the user picks from, and which next-question logic applies.

### Q1 — Onset pattern (NDPH gate)

**Prompt:** "Did this headache start at a clearly remembered moment, become continuous and unremitting **within 24 hours** of that onset, and persist daily since?"

**Options (single-select):**
- `sudden_persistent` — Yes — I can pinpoint when it started, it became constant within a day, and it has been present every day since (≥3 months)
- `sudden_persistent_recent` — Yes — same pattern, but it has been present <3 months
- `gradual_or_episodic` — No, attacks come and go, or it built up gradually over months

**Next-question logic:**
- `sudden_persistent` → flag NDPH candidate (criterion 3.3 B met); proceed to Q2
- `sudden_persistent_recent` → flag NDPH-pending (does not meet >3 months yet); proceed to Q2; result card includes "consider re-evaluation at 3 months" note
- `gradual_or_episodic` → proceed to Q2; NDPH NOT a candidate

**Rationale:** ICHD-3 3.3 NDPH requires a "distinct and clearly-remembered onset" with the headache becoming continuous within 24 h, present >3 months. Asking this first prevents the classifier from mis-routing an NDPH presentation as chronic migraine or chronic TTH.

### Q2 — Continuity

**Prompt:** "How is the headache distributed in time?"

**Options (single-select):**
- `continuous` — Continuous (present most of every day, with or without exacerbations)
- `episodic_frequent` — Episodic with distinct attacks, ≥4 days/month
- `episodic_infrequent` — Episodic with distinct attacks, <4 days/month

**Next-question logic:**
- `continuous` → HC and chronic TTH and chronic migraine are candidates; proceed to Q3
- `episodic_frequent` / `episodic_infrequent` → episodic phenotypes; proceed to Q3

**Rationale:** Continuity separates HC (continuous strictly unilateral) and the chronic-frequency tail (chronic migraine, chronic TTH) from episodic presentations. Cluster headache is episodic during a bout but the bouts themselves are time-limited — the user picks `episodic_frequent` during an active bout.

### Q3 — Location

**Prompt:** "Where does the pain occur during a typical attack (or, if continuous, where is the baseline pain)?"

**Options (single-select):**
- `bilateral_band` — Bilateral, band-like, or generalized
- `unilateral_side_alternates` — One side, but it can be either side from attack to attack
- `unilateral_strict` — Strictly one side, always the same side
- `unilateral_orbital_periorbital` — Strictly one side, centered around or behind the eye

**Next-question logic:**
- `bilateral_band` → TTH and bilateral-migraine candidates remain; cluster and HC removed
- `unilateral_side_alternates` → migraine candidate strengthens; cluster/HC removed
- `unilateral_strict` → HC candidate strengthens (if Q2 = continuous); migraine remains
- `unilateral_orbital_periorbital` → cluster candidate strengthens (if Q2 = episodic_frequent); HC remains (if Q2 = continuous)

**Rationale:** ICHD-3 3.1 cluster requires unilateral orbital/supraorbital/temporal pain. ICHD-3 3.4 HC requires strictly unilateral pain (same side every time). ICHD-3 2.2 TTH requires bilateral pain. Migraine in ICHD-3 1.1 allows either unilateral or bilateral, but unilaterality that alternates sides is more consistent with migraine than with cluster or HC.

### Q4 — Character

**Prompt:** "How would you describe the pain quality at its worst?"

**Options (single-select):**
- `pulsating` — Pulsating, throbbing, or beating
- `pressing_tightening` — Pressing, tightening, squeezing, or band-like (non-pulsating)
- `severe_stabbing` — Severe stabbing, boring, drilling, or shock-like
- `dull_aching` — Dull, aching, or pressure (less severe than pressing)

**Next-question logic:**
- `pulsating` → migraine candidate strengthens
- `pressing_tightening` → TTH candidate strengthens
- `severe_stabbing` → cluster candidate strengthens
- `dull_aching` → TTH or HC candidate strengthens

**Rationale:** ICHD-3 1.1 migraine character is pulsating. ICHD-3 2.2 TTH is pressing/tightening (non-pulsating). ICHD-3 3.1 cluster pain is severe stabbing/boring (described as "the worst pain imaginable" by most patients).

### Q5 — Severity and activity

**Prompt 5a:** "Pain severity at its worst — on a 0-10 scale or by descriptor?"

**Options:**
- `mild` — Mild (0-3): noticeable but able to work normally
- `moderate` — Moderate (4-6): interferes with concentration but able to function
- `severe` — Severe (7-9): cannot function normally; usually need to stop activities
- `very_severe` — Very severe (10): unbearable; pacing, crying, or unable to remain still

**Prompt 5b:** "Does physical activity — walking, climbing stairs, bending — make the headache worse?"

**Options:**
- `worsens_with_activity` — Yes, even routine movement makes it worse
- `no_change_or_relief` — No change, or activity provides some relief
- `not_applicable` — Cannot test because pain is too severe to attempt activity

**Next-question logic (combined):**
- `severe`/`very_severe` + `worsens_with_activity` → migraine candidate strengthens
- `mild`/`moderate` + `no_change_or_relief` → TTH candidate strengthens (ICHD-3 2.2 explicitly requires NOT aggravated by activity)
- `very_severe` + `not_applicable` or `no_change_or_relief` → cluster candidate strengthens (cluster pain is too severe to walk through, and patients become restless rather than still)

**Rationale:** ICHD-3 1.1 migraine requires "moderate or severe pain intensity" AND "aggravation by or causing avoidance of routine physical activity" as 2 of the 4 character criteria (≥2 required). ICHD-3 2.2 TTH explicitly excludes aggravation by activity.

### Q6 — Associated features

**Prompt:** "During a typical attack, which of the following occur? Select all that apply."

**Options (multi-select):**
- `nausea` — Nausea (with or without vomiting)
- `vomiting` — Vomiting
- `photophobia` — Sensitivity to light (avoiding bright lights, seeking a dark room)
- `phonophobia` — Sensitivity to sound (avoiding noise, seeking a quiet room)
- `osmophobia` — Sensitivity to smell (optional clinical extension; not in core ICHD-3 1.1 D criteria but supports migraine)
- `none` — None of these

**Next-question logic:**
- `nausea` OR `vomiting` OR (`photophobia` AND `phonophobia`) → ICHD-3 1.1 D criterion met → migraine candidate strengthens
- `none` OR (only one of photo/phonophobia, no nausea/vomiting) → TTH candidate strengthens (ICHD-3 2.2 D requires no nausea/vomiting AND ≤1 of photo/phonophobia)

**Rationale:** ICHD-3 1.1 D requires at least one of: nausea/vomiting OR (photophobia AND phonophobia). ICHD-3 2.2 D requires both: no nausea/vomiting AND ≤1 of photophobia/phonophobia.

### Q7 — Autonomic features and restlessness

**Prompt:** "During the headache, do any of the following occur ON THE SAME SIDE AS THE PAIN? Select all that apply."

**Options (multi-select):**
- `tearing` — Tearing or red/bloodshot eye
- `ptosis_miosis` — Drooping eyelid or small pupil
- `nasal` — Nasal congestion or runny nose (one side)
- `forehead_sweating` — Forehead or facial sweating (one side)
- `eyelid_oedema` — Eyelid swelling (one side)
- `restlessness` — Restlessness, pacing, agitation, inability to stay still
- `none` — None of these

**Next-question logic:**
- ≥1 cranial autonomic feature + Q2 `episodic_frequent` + Q3 `unilateral_orbital_periorbital` + Q4 `severe_stabbing` + (Q7 `restlessness` OR Q5 `very_severe`) → cluster candidate strengthens
- ≥1 cranial autonomic feature + Q2 `continuous` + Q3 `unilateral_strict` → HC candidate strengthens; indomethacin trial recommended
- `none` AND no other autonomic indicator → cluster and HC removed as primary candidates

**Rationale:** ICHD-3 3.1 cluster requires ipsilateral autonomic feature(s) AND/OR restlessness. ICHD-3 3.4 HC requires ipsilateral autonomic feature(s) AND/OR restlessness AND absolute indomethacin response.

### Q8 (conditional) — Aura screen

**Trigger:** appears only if Q4 = `pulsating` AND Q6 includes nausea/vomiting OR (photo+phono).

**Prompt:** "Before or during the headache, do you experience any of the following reversible neurological symptoms that build up over ≥5 minutes and last 5-60 minutes?"

**Options (multi-select):**
- `visual` — Visual: flashing lights, zigzag lines, scintillating scotoma, blind spots
- `sensory` — Sensory: tingling or numbness spreading across one side of body or face
- `speech` — Speech or language disturbance
- `motor` — Motor weakness (rare; suggests hemiplegic migraine, requires specialist eval)
- `brainstem` — Vertigo, diplopia, ataxia, tinnitus (basilar-type, rare)
- `retinal` — Monocular visual phenomena (very rare; rule out retinal ischaemia)
- `none` — None of these

**Next-question logic:**
- ≥1 aura feature meeting time criteria → migraine WITH aura (ICHD-3 1.2)
- `none` → migraine WITHOUT aura (ICHD-3 1.1)
- `motor` or `retinal` selected → flag for specialist referral; do not auto-confirm hemiplegic or retinal migraine without neurology evaluation

**Rationale:** ICHD-3 1.2 aura criteria require gradual spread over ≥5 min, 5-60 min duration, and accompaniment/follow by headache within 60 min.

---

## 2. Decision logic (full branching)

The classifier scores candidates rather than walking a strict decision tree, then displays the top two by score. Rules below name the canonical branch for each phenotype.

| Phenotype | Required signals | Disqualifiers |
|---|---|---|
| **NDPH (ICHD-3 3.3)** | Q1 = `sudden_persistent` | Any episodic onset; gradual buildup |
| **Hemicrania continua (ICHD-3 3.4)** | Q2 = `continuous` + Q3 = `unilateral_strict` + Q7 ≥1 autonomic OR `restlessness` | Bilateral; alternating sides; no indomethacin response (post-trial) |
| **Cluster headache (ICHD-3 3.1)** | Q2 = `episodic_frequent` + Q3 = `unilateral_orbital_periorbital` + Q5a `very_severe` + Q7 ≥1 autonomic OR `restlessness` | Bilateral; no autonomic features AND no restlessness; mild-moderate severity |
| **Migraine without aura (ICHD-3 1.1)** | Q4 = `pulsating` + Q5a `moderate`/`severe` + Q5b `worsens_with_activity` + Q6 (nausea/vomiting OR photo+phono) | All four criteria absent; strict unilateral with autonomic features (→ cluster/HC) |
| **Migraine with aura (ICHD-3 1.2)** | Migraine-without-aura criteria + Q8 ≥1 aura with time qualifiers | No aura on Q8 |
| **Tension-type (ICHD-3 2.2/2.3)** | Q3 = `bilateral_band` + Q4 = `pressing_tightening` + Q5a `mild`/`moderate` + Q5b `no_change_or_relief` + Q6 = `none` or ≤1 photo/phono | Unilateral; pulsating; severe + worsens with activity; nausea/vomiting |
| **— 2.2 episodic** | 1-14 headache days/month | ≥15 days/month → route to 2.3 |
| **— 2.3 chronic** | ≥15 headache days/month for >3 months | <15 days/month → 2.2 |

**Conflict handling:** if signals fit two phenotypes (e.g., chronic migraine vs chronic TTH on a patient with 20 headache days/month), show both as the top-2 candidates and let the clinician adjudicate via the matched/unmatched display in §3.

---

## 3. Result display

When the classifier completes, the result card shows:

### Header
**Title:** "Most consistent with: [Phenotype name]"
**Subtitle (smaller):** "Second most consistent: [Phenotype name]"

### Side-by-side criteria table

For each of the top-2 candidates, render a two-column block:

| Top candidate (ICHD-3 X.X) | Second candidate (ICHD-3 Y.Y) |
|---|---|
| ✓ Criterion 1 matched (verbatim ICHD-3 text) | ✓ Criterion 1 matched |
| ✓ Criterion 2 matched | ✗ Criterion 2 NOT matched — patient answered Z |
| ✗ Criterion 3 NOT matched — patient answered W | ✓ Criterion 3 matched |

The matched/unmatched marks must reference the specific patient response, not just say "matched." This is what lets the clinician see why the classifier chose what it did and decide whether to override.

### Action row (equal prominence)

Two equally-sized buttons side by side:
- `Confirm phenotype` — primary button styling (neuro-600)
- `This doesn't match — reconsider` — equal-prominence styling (NOT secondary-gray; use neuro-500 outline or equal-weight neutral). Tapping this returns the user to Q1 with previous answers preserved as editable.

### Secondary headache disclaimer

Mandatory, non-collapsible card below the action row. Exact text in §5.

### Surface tagging

The criteria checklist for each candidate uses the per-phenotype `data-claim` IDs from §6 below — one claim ID per phenotype that maps to `ichd3-2018`.

---

## 4. Per-phenotype diagnostic criteria checklists

Each checklist below is the exact text to render under "Matched criteria for [phenotype]" in the result card. Bullet markers are filled (✓) when matched and outlined (✗) when not matched, based on the answers collected.

### 4.1 Migraine without aura (ICHD-3 1.1)

`data-claim="clinic-headache-ichd3-migraine-criteria"`

- [ ] A. At least 5 attacks meeting B-D
- [ ] B. Headache lasting 4-72 hours (untreated or unsuccessfully treated)
- [ ] C. ≥2 of: unilateral location; pulsating quality; moderate-severe intensity; aggravated by routine physical activity
- [ ] D. ≥1 of: nausea and/or vomiting; photophobia AND phonophobia
- [ ] E. Not better accounted for by another ICHD-3 diagnosis

### 4.2 Migraine with aura (ICHD-3 1.2)

`data-claim="clinic-headache-ichd3-migraine-criteria"` (same citation; aura claim included)

- [ ] A. At least 2 attacks meeting B-C
- [ ] B. ≥1 fully reversible aura: visual, sensory, speech/language, motor, brainstem, or retinal
- [ ] C. ≥3 of: aura spreads gradually over ≥5 min; ≥2 aura symptoms in succession; each lasts 5-60 min; ≥1 is unilateral; ≥1 is positive; aura accompanied or followed within 60 min by headache
- [ ] D. Not better accounted for by another ICHD-3 diagnosis or TIA

### 4.3 Cluster headache (ICHD-3 3.1)

`data-claim="clinic-headache-ichd3-cluster-criteria"`

- [ ] A. At least 5 attacks meeting B-D
- [ ] B. Severe or very severe unilateral orbital, supraorbital, and/or temporal pain lasting 15-180 min untreated
- [ ] C. Either or both: ≥1 ipsilateral cranial autonomic symptom (conjunctival injection/lacrimation; nasal congestion/rhinorrhoea; eyelid oedema; forehead/facial sweating; miosis/ptosis); sense of restlessness or agitation
- [ ] D. Frequency 1 every other day to 8 per day during active bouts
- [ ] E. Not better accounted for by another ICHD-3 diagnosis

### 4.4 Hemicrania continua (ICHD-3 3.4)

`data-claim="clinic-headache-ichd3-hemicrania-criteria"`

- [ ] A. Unilateral headache meeting B-D
- [ ] B. Present for >3 months, with exacerbations of moderate or greater intensity
- [ ] C. Either or both: ≥1 ipsilateral cranial autonomic symptom during exacerbations; sense of restlessness or aggravation by movement
- [ ] D. Responds **absolutely** to therapeutic doses of indomethacin (diagnostic; non-response rules out HC)
- [ ] E. Not better accounted for by another ICHD-3 diagnosis

**Note:** D cannot be confirmed at classifier time without a documented indomethacin trial. The classifier surfaces HC as a candidate; the diagnostic indomethacin titration protocol (already in ClinicHeadachePathway.tsx, Burish 2024 / Goadsby 2024 citation chain) is the next clinical step.

### 4.5 Tension-type headache, frequent episodic (ICHD-3 2.2)

`data-claim="clinic-headache-ichd3-tension-criteria"`

- [ ] A. ≥10 episodes occurring 1-14 days/month on average for >3 months (≥12 and <180 days/year)
- [ ] B. Lasting 30 min to 7 days
- [ ] C. ≥2 of: bilateral location; pressing/tightening (non-pulsating); mild or moderate intensity; not aggravated by routine physical activity
- [ ] D. Both: no nausea or vomiting; ≤1 of photophobia or phonophobia
- [ ] E. Not better accounted for by another ICHD-3 diagnosis

### 4.6 Tension-type headache, chronic (ICHD-3 2.3)

`data-claim="clinic-headache-ichd3-tension-criteria"` (same claim; chronic threshold differs)

- [ ] A. ≥15 days/month on average for >3 months (≥180 days/year)
- [ ] B-D. Same B-D as 2.2, with the following modified D criterion: (a) no more than one of photophobia, phonophobia, or mild nausea; (b) neither moderate or severe nausea nor vomiting
- [ ] E. Not better accounted for by another ICHD-3 diagnosis

### 4.7 New daily persistent headache (ICHD-3 3.3)

`data-claim="clinic-headache-ichd3-ndph-criteria"`

- [ ] A. Persistent headache meeting B-C
- [ ] B. Distinct and clearly-remembered onset, with pain becoming continuous and unremitting within 24 hours
- [ ] C. Present for >3 months
- [ ] D. Not better accounted for by another ICHD-3 diagnosis

**Note:** NDPH requires imaging workup before preventive treatment (existing pathway behavior in ClinicHeadachePathway.tsx, step 2). The classifier confirms phenotype; it does not authorize empirical treatment.

---

## 5. Secondary headache disclaimer (mandatory)

Render this exact block on every classifier result card. Not collapsible, not dismissible. Same prominence as the criteria checklist above it.

> **Red-flag screen before accepting any primary headache diagnosis.** ICHD-3 primary headache criteria are met only when secondary causes have been excluded. Re-screen for: sudden thunderclap onset — "worst headache of life," peak severity within 1 minute → CT/CTA immediately for SAH; new headache age >50 → consider GCA, mass lesion; positional headache (worse upright or recumbent) → consider intracranial hypotension or hypertension; headache with fever, neck stiffness, immunosuppression → meningitis workup; headache with focal neurologic signs, papilloedema, seizure, or progressive course → urgent neuroimaging; headache in pregnancy or postpartum → consider CVT, PRES, RCVS; headache after head trauma → post-traumatic cause; new headache in cancer or HIV → metastasis, opportunistic infection; headache triggered by Valsalva, cough, or exertion → consider posterior-fossa lesion or Chiari malformation.
>
> **This classifier does not replace clinical judgement.** It pattern-matches answers against ICHD-3 criteria. The treating clinician owns the diagnosis.

---

## 6. Claim and citation summary

All claims registered in `src/lib/citations/claims.ts` (added 2026-05-25):

| `claimId` | Citations | Surface |
|---|---|---|
| `clinic-headache-ichd3-migraine-criteria` | `ichd3-2018` | JSX `data-claim` on 1.1 and 1.2 criteria blocks |
| `clinic-headache-ichd3-cluster-criteria` | `ichd3-2018` | JSX `data-claim` on 3.1 criteria block |
| `clinic-headache-ichd3-hemicrania-criteria` | `ichd3-2018` | JSX `data-claim` on 3.4 criteria block |
| `clinic-headache-ichd3-tension-criteria` | `ichd3-2018` | JSX `data-claim` on 2.2 and 2.3 criteria blocks |
| `clinic-headache-ichd3-ndph-criteria` | `ichd3-2018` | JSX `data-claim` on 3.3 criteria block |
| `clinic-headache-tension-acute-management` | `scher-tth-2024-continuum` | JSX `data-claim` on TTH acute protocol card (§7) |
| `clinic-headache-tension-preventive` | `scher-tth-2024-continuum`, `ailani-ahs-2021` | JSX `data-claim` on TTH preventive protocol card (§7) |

New citations registered in `src/lib/citations/registry.ts` (2026-05-25):

| `id` | Source | `last_reviewed` | Review window |
|---|---|---|---|
| `ichd3-2018` | guideline (Cephalalgia 2018;38:1-211, PMID 29368949) | 2026-05-25 | 24 months |
| `scher-tth-2024-continuum` | review (Continuum 2024) | 2026-05-25 | 12 months |

---

## 7. Tension-type headache management protocol

This is the protocol the existing pathway should render when Q2 phenotype = Tension-type (replacing the current `'tension'` branch's preventive flow, which currently falls through to the generic migraine preventive selector). The depth and format match the existing Cluster Headache and Hemicrania Continua protocols already in `src/pages/ClinicHeadachePathway.tsx` lines 645-700.

### 7.1 Acute treatment

Render this card when phenotype = Tension-type, with `data-claim="clinic-headache-tension-acute-management"` on the parent card.

**Source line:** "Scher Continuum 2024. AHS limits acute medication days to ≤10/month for triptans/opioids and ≤15/month for simple analgesics to avoid MOH."

**First-line (any of):**
- Ibuprofen 400-600 mg PO at headache onset; may repeat once after 6 h. Maximum 1200 mg/day OTC, 2400 mg/day prescription.
- Aspirin 500-1000 mg PO at onset. Avoid in patients <16 (Reye syndrome) and on anticoagulants.
- Naproxen 500 mg PO at onset; may repeat 250 mg after 12 h. Longer half-life — useful for prolonged episodes.

**Pregnancy or NSAID contraindication:**
- Acetaminophen 1000 mg PO at onset; maximum 3000 mg/day (Scher Continuum 2024 dose ceiling). Less effective than NSAIDs but the preferred analgesic in pregnancy and in patients with GI bleeding risk, CKD, or NSAID intolerance.

**Caffeine-containing combinations (use sparingly):**
- Aspirin/acetaminophen/caffeine combinations are AHS Level A for acute migraine and have evidence for TTH, but caffeine raises MOH risk if used >10 days/month. Counsel before prescribing.

**Avoid:**
- Opioids (codeine, tramadol, hydrocodone) — high MOH and dependence risk; inferior efficacy. AHS Level A "Must NOT Offer" for primary headaches.
- Butalbital-containing compounds (Fioricet, Fiorinal) — dependence risk; withdrawal headache. Avoid entirely for TTH.
- Triptans — not effective for pure TTH; reserve for patients with comorbid migraine.

**MOH gate:**
- If acute medication days ≥10/month for triptans/opioids OR ≥15/month for simple analgesics, the patient is at or above the MOH threshold. Move to preventive therapy (§7.2) and counsel on medication withdrawal.

### 7.2 Preventive treatment

Render this card when phenotype = Tension-type AND (frequency = chronic OR (frequency = high AND MIDAS ≥grade 2)), with `data-claim="clinic-headache-tension-preventive"` on the parent card.

**Source line:** "Scher Continuum 2024 + AHS 2021 (Ailani et al.) for the shared MOH preventive threshold."

**Threshold for starting preventive therapy:**
- Chronic TTH (≥15 headache days/month for >3 months), OR
- High-frequency episodic TTH (8-14 days/month) with significant functional impact, OR
- Acute medication use ≥10 days/month (MOH risk).

**First-line:**
- **Amitriptyline 10-75 mg at bedtime** (AAN evidence Level B). Start 10 mg QHS, titrate by 10 mg every 1-2 weeks to effect or maximum 75 mg. Anticholinergic side effects (dry mouth, constipation, urinary retention) and weight gain are common; QTc prolongation in CV disease — obtain baseline ECG if patient >50 or has CV history. Avoid in pregnancy unless specialist-supervised.

**Second-line:**
- **Venlafaxine 75-150 mg/day** — preferred when depression or anxiety is comorbid. Start 37.5 mg daily, titrate weekly. Monitor BP (small dose-dependent BP rise). Taper if discontinuing (discontinuation syndrome).
- **Mirtazapine 15-30 mg at bedtime** — preferred when sleep disturbance AND anxiety coexist. Sedating; weight gain. Useful in older patients with insomnia.

**Third-line:**
- **Topiramate 25-100 mg/day** — less evidence for TTH than for migraine; use when first- and second-line fail. Titrate slowly: 25 mg/day × 1 week, then +25 mg every 1-2 weeks. Avoid in pregnancy and women of childbearing potential (teratogenic — neural tube defects, cleft palate). Cognitive side effects (word-finding difficulty, paresthesias) and kidney-stone risk.

**Non-pharmacologic (Level A combined approach):**
- Stress management training, biofeedback, and physical therapy combined have Level A evidence for chronic TTH and should be offered alongside pharmacotherapy — not as a substitute when the patient declines medication, but as part of the standard plan. Refer to behavioral health and PT in parallel with medication initiation.
- Cognitive-behavioral therapy for chronic pain has evidence in chronic TTH when comorbid anxiety/depression is present.
- Sleep hygiene, caffeine review (limit to <200 mg/day), regular meals, hydration.

**Avoid for TTH specifically:**
- Beta-blockers (propranolol, metoprolol) — evidence insufficient for TTH; reserve for migraine.
- Onabotulinumtoxin A — approved for chronic migraine, NOT chronic TTH.
- CGRP monoclonal antibodies and gepants — no current TTH indication.
- Opioids — never indicated for preventive TTH treatment.

**Adequacy of trial:**
- An adequate preventive trial = ≥2 months at therapeutic dose with documented adherence. Do not declare failure before 8 weeks of full dosing. If MOH is present, expect 4-6 weeks of withdrawal-related headache worsening before improvement appears.

**Follow-up:**
- Reassess at 6-8 weeks with a headache diary and repeat MIDAS or HIT-6.
- Confirm acute medication days <10/month before declaring preventive success.
- If two adequate first- and second-line trials fail, refer to neurology — and reconsider whether the diagnosis is chronic migraine rather than chronic TTH (the two overlap; treatment differs).

---

## 8. Open questions and explicit non-scope

**Out of scope for this spec:**
- Indomethacin titration for HC — already implemented in ClinicHeadachePathway.tsx (Goadsby Continuum 2024 citation chain).
- Cluster acute/preventive — already implemented (Burish Continuum 2024).
- Trigeminal neuralgia, occipital neuralgia, SUNCT/SUNA — handled by Nahas Continuum 2024 chain; not part of this 6-phenotype classifier.
- Imaging triggers — the secondary-headache disclaimer in §5 names the red flags but the imaging decision tree itself is a separate pathway (Suspected Stroke imaging guide handles thunderclap CTA flow).

**Clinical-reviewer adjudications (resolved 2026-05-25):**
1. **TTH preventive amitriptyline vs venlafaxine hierarchy with depression comorbidity.** Keep amitriptyline as first-line for TTH overall. When moderate-severe depression is comorbid and requires concurrent treatment, venlafaxine becomes **co-first-line** (not second-line) — chosen for dual-indication efficiency, not because it outperforms amitriptyline for TTH. UI should branch on the depression comorbidity flag to present both as equally appropriate first options in that case.
2. **MIDAS for TTH stratification.** Acceptable as a practical proxy for UI continuity. Document as off-label adaptation (MIDAS is validated for migraine, not TTH). Track adding HIT-6 as a follow-up TASKS.md item; do not block implementation.
3. **Chronic migraine vs chronic TTH disambiguation.** Top-2 side-by-side display is confirmed appropriate. A forced disambiguation question would re-introduce anchoring bias that §0 is explicitly designed to prevent. No further disambiguation UI needed.

---

## 9. Routing

**Ready for clinical-reviewer.** This spec must pass `clinical-reviewer` (§17.2 artifact) before ui-architect implements it. Class C-clinical PR per CLAUDE.md §6 — phenotype classifier surfaces are clinical claims; new citation entries trigger the citation-registry hook; clinical-reviewer is the merge gate per CLAUDE.md §13.4 and §17.2.

Files touched by this spec (for ui-architect implementation):
- `docs/specs/ichd3-classifier-spec.md` (this file — created)
- `src/lib/citations/registry.ts` (citations added — 2026-05-25)
- `src/lib/citations/claims.ts` (7 claim IDs added — 2026-05-25)
- `src/pages/ClinicHeadachePathway.tsx` (to be edited by ui-architect against this spec)
