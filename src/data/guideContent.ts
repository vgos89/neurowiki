export interface GuideTopic {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const GUIDE_CONTENT: Record<string, GuideTopic> = {
  // --- NEURO TRIALS (Vascular Neurology) ---
  'ninds-trial': {
    id: 'ninds-trial',
    title: 'NINDS Trial: IV tPA (0-3h)',
    category: 'Neuro Trials',
    content: `
## Clinical Context
The NINDS tPA Stroke Study was the landmark trial that established intravenous alteplase (tPA) as the first FDA-approved treatment for acute ischemic stroke.

## Trial Summary
*   **Design:** Two-part, randomized, double-blind, placebo-controlled trial.
*   **Population:** 624 patients with acute ischemic stroke treated within **3 hours** of onset.
*   **Intervention:** IV Alteplase (0.9 mg/kg, max 90 mg) vs. Placebo.
*   **Results (Part 2 - Efficacy):**
    *   **Minimal Disability (mRS 0-1):** 42.6% in tPA group vs 27.2% in Placebo group at 3 months.
    *   **Odds Ratio:** 1.7 (95% CI 1.2–2.6) for favorable outcome.
    *   **Safety:** Symptomatic Intracranial Hemorrhage (sICH) occurred in **6.4%** of tPA patients vs 0.6% of placebo patients.
    *   **Mortality:** No significant difference in mortality at 3 months (17% vs 21%).

## Clinical PEARLS
*   **Time is Brain:** Established the 3-hour window.
*   **Safety Trade-off:** Established the classic risk profile of tPA: significantly improved functional outcomes at the cost of a ~6% risk of symptomatic hemorrhage, but with no increase in overall mortality.
*   **BP Control:** Strict blood pressure control (< 185/110 mmHg) was mandatory and remains a cornerstone of safety.

## Conclusion
Despite an increased incidence of symptomatic intracerebral hemorrhage, treatment with intravenous tPA within 3 hours of the onset of ischemic stroke improved clinical outcome at 3 months.

*Source: [The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group (NEJM 1995)](https://www.nejm.org/doi/full/10.1056/NEJM199512143332401)*
`
  },
  'ecass3-trial': {
    id: 'ecass3-trial',
    title: 'ECASS III Trial: IV tPA (3-4.5h)',
    category: 'Neuro Trials',
    content: `
## Clinical Context
ECASS III investigated whether the window for IV tPA could be safely extended from 3 hours (NINDS) to 4.5 hours.

## Trial Summary
*   **Design:** Randomized, double-blind, placebo-controlled trial.
*   **Population:** 821 patients with acute ischemic stroke treated between **3 and 4.5 hours** after onset.
*   **Key Exclusions (Stricter than 0-3h):** Age > 80 years, baseline NIHSS > 25, patients taking oral anticoagulants (regardless of INR), and patients with both diabetes and prior stroke.
*   **Intervention:** IV Alteplase (0.9 mg/kg) vs. Placebo.
*   **Primary Outcome:** Disability at 90 days (mRS 0-1).
*   **Results:**
    *   **Favorable Outcome (mRS 0-1):** 52.4% in tPA group vs 45.2% in Placebo group (P=0.04).
    *   **Symptomatic ICH:** 2.4% in tPA group vs 0.2% in Placebo group (P=0.008).
    *   **Mortality:** No significant difference.

## Clinical PEARLS
*   **Extended Window:** Successfully expanded the treatment window to 4.5 hours for eligible patients.
*   **Efficacy Decay:** The treatment effect (OR 1.34) was smaller than in the 0-3 hour window (OR 1.7 in NINDS), reinforcing that earlier treatment is better.
*   **Guideline Evolution:** While the trial excluded Age > 80 and those on warfarin, modern guidelines often permit treatment in these groups within 3-4.5h after individual risk assessment (though caution remains for DOACs/Warfarin).

## Conclusion
Intravenous alteplase administered between 3 and 4.5 hours after the onset of symptoms significantly improved clinical outcomes in patients with acute ischemic stroke.

*Source: [Hacke et al. (NEJM 2008)](https://www.nejm.org/doi/full/10.1056/NEJMoa0804656)*
`
  },
  'extend-trial': {
    id: 'extend-trial',
    title: 'EXTEND Trial: tPA 4.5-9 Hours',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Can we thrombolyse patients beyond 4.5 hours if they have salvageable tissue? The EXTEND trial tested desmoteplase (and pooled data with ECASS-4/EPITHET using Alteplase) using perfusion imaging selection.

## Trial Summary
*   **Design:** Multicenter, randomized, placebo-controlled trial.
*   **Population:** Patients with ischemic stroke **4.5 to 9.0 hours** after onset OR **Wake-up stroke** (within 9h of midpoint of sleep).
*   **Selection Criteria (Perfusion):**
    *   **Core:** < 70 ml (CTP or DWI).
    *   **Mismatch:** Penumbra > 10 ml and > 1.2x Core volume.
*   **Intervention:** IV Alteplase vs. Placebo.
*   **Primary Outcome:** mRS 0-1 at 90 days.
*   **Results:**
    *   **Excellent Outcome (mRS 0-1):** 35.4% in Alteplase group vs 29.5% in Placebo group (Adj Risk Ratio 1.44; P=0.04).
    *   **Symptomatic ICH:** 6.2% in Alteplase group vs 0.9% in Placebo group.

## Clinical PEARLS
*   **Tissue Window:** Proved that the "tissue window" (perfusion mismatch) is more relevant than the rigid "time window" for thrombolysis, similar to mechanical thrombectomy.
*   **Wake-Up Stroke:** Provided evidence for treating wake-up strokes guided by CTP (alternative to the MRI DWI-FLAIR mismatch strategy from WAKE-UP trial).
*   **Clinical Implementation:** Many centers now utilize this protocol for patients < 9 hours who are not thrombectomy candidates (e.g., distal occlusions) but have favorable perfusion profiles.

## Conclusion
Among patients with ischemic stroke 4.5 to 9.0 hours after onset or wake-up stroke who had salvageable brain tissue on perfusion imaging, alteplase resulted in a higher percentage of patients with no or minor neurologic deficits.

*Source: [Ma et al. (NEJM 2019)](https://www.nejm.org/doi/full/10.1056/NEJMoa1910355)*
`
  },
  'wake-up-trial': {
    id: 'wake-up-trial',
    title: 'WAKE-UP Trial: MRI-Guided Thrombolysis',
    category: 'Neuro Trials',
    content: `
## Clinical Context

Approximately 14-27% of acute ischemic strokes occur with an unknown time of onset, frequently recognized upon awakening from sleep. These "wake-up strokes" have traditionally been excluded from thrombolytic therapy due to the 4.5-hour treatment window requirement. However, MRI findings suggesting recent infarction—specifically DWI-FLAIR mismatch (visible ischemic lesion on diffusion-weighted imaging without corresponding FLAIR hyperintensity)—can identify patients likely within the treatment window. The **WAKE-UP trial** investigated whether this MRI-based patient selection could safely extend thrombolysis to patients with unknown symptom onset times.

---

## Trial Summary

### Design
*   **Type:** Multicenter, randomized, double-blind, placebo-controlled trial
*   **Enrollment:** 503 patients (planned 800, stopped early due to funding)
*   **Setting:** 61 centers across 8 European countries
*   **Duration:** September 2012 - June 2017

### Population
**Inclusion Criteria:**
*   Age 18-80 years
*   Clinical signs of acute stroke with unknown onset time (most commonly wake-up stroke)
*   Last known well >4.5 hours prior
*   MRI showing DWI-FLAIR mismatch (acute lesion on DWI without visible FLAIR signal change)
*   Pre-stroke independence (able to carry out usual daily activities)

**Exclusion Criteria:**
*   Intracranial hemorrhage on MRI
*   Lesion >1/3 of MCA territory
*   [NIHSS](/calculators/nihss) score >25 (severe stroke)
*   Planned thrombectomy
*   Standard alteplase contraindications

**Baseline Characteristics:**
*   Median age: 65 years (both groups)
*   Male: 65% (alteplase), 64% (placebo)
*   Median baseline [NIHSS](/calculators/nihss): 6 (both groups)
*   89% presented as wake-up strokes
*   Median time last known well to treatment: 10.3 hours (alteplase), 10.4 hours (placebo)
*   Median time from symptom recognition to treatment: 3.1 hours (alteplase), 3.2 hours (placebo)

### Intervention
**Alteplase Group (n=254):**
*   0.9 mg/kg IV alteplase (10% bolus, 90% over 60 minutes)
*   Plus best medical treatment

**Placebo Group (n=249):**
*   Matching placebo
*   Plus best medical treatment

### Results

**Primary Outcome (mRS 0-1 at 90 days):**
*   **Alteplase**: 53.3% (131/246)
*   **Placebo**: 41.8% (102/244)
*   **Adjusted OR**: 1.61 (95% CI 1.09-2.36, p=0.02)
*   **Absolute benefit**: 11.5 percentage points
*   **NNT**: 9

**Secondary Outcomes:**
*   **Median mRS at 90 days**: 1 (alteplase) vs 2 (placebo)
    *   Common OR 1.62 (95% CI 1.17-2.23, p=0.003)
*   **Treatment response by baseline severity**: 29.3% (alteplase) vs 18.0% (placebo)
*   **Quality of life measures**: Numerically favored alteplase

**Safety Outcomes:**
*   **Death at 90 days**: 4.1% (alteplase) vs 1.2% (placebo)
    *   OR 3.38 (95% CI 0.92-12.52, p=0.07)
*   **Symptomatic ICH (SITS-MOST definition)**: 2.0% (alteplase) vs 0.4% (placebo)
    *   OR 4.95 (95% CI 0.57-42.87, p=0.15)
*   **Parenchymal hemorrhage type 2**: 4.0% (alteplase) vs 0.4% (placebo)
    *   OR 10.46 (95% CI 1.32-82.77, p=0.03)
*   **Death or dependency (mRS 4-6)**: 13.5% (alteplase) vs 18.3% (placebo)

---

## Clinical PEARLS

**Patient Selection:**
*   DWI-FLAIR mismatch identifies patients likely within 4.5-hour window despite unknown symptom onset
*   ~33% of screened patients excluded due to no mismatch (visible FLAIR changes)
*   Most applicable to wake-up strokes (89% of enrolled patients)
*   Requires MRI capability for emergency stroke imaging
*   DWI-FLAIR mismatch has 73-78% interobserver agreement

**Efficacy Considerations:**
*   Number needed to treat (NNT) = 9 for excellent outcome (mRS 0-1)
*   Benefit consistent across age groups and baseline [NIHSS](/calculators/nihss) scores
*   No reduction in infarct volume at 22-36 hours despite clinical benefit
*   Treatment effect (OR 1.61) comparable to early window thrombolysis

**Safety Profile:**
*   Increased parenchymal hemorrhage type 2 (absolute difference 3.6%)
*   Trend toward increased mortality (not statistically significant)
*   Four deaths in alteplase group attributed to symptomatic ICH
*   Overall serious adverse event rates similar between groups (22.3% vs 21.3%)
*   Two patients who died had protocol violations (1 with large infarct, 1 with uncontrolled hypertension)

**Practical Implementation:**
*   Median time from symptom recognition to treatment ~3 hours (similar to standard thrombolysis)
*   Central imaging review identified protocol violations in some cases
*   Trial stopped early (503 of planned 800 patients) due to funding cessation
*   Limited power for subgroup analyses and safety outcomes

**Limitations:**
*   Excluded patients planned for thrombectomy
*   Unknown generalizability to patients with large vessel occlusions now eligible for thrombectomy
*   ~20% of patients had large intracranial artery occlusion (would qualify for EVT in DAWN/DEFUSE 3)

**Alternative to EXTEND:**
*   WAKE-UP uses MRI DWI-FLAIR mismatch
*   EXTEND trial used CT perfusion mismatch for similar population
*   Both strategies identify wake-up stroke patients likely within treatment window

---

## Conclusion

Among patients with acute ischemic stroke and unknown time of symptom onset who had MRI findings of DWI-FLAIR mismatch, treatment with IV alteplase resulted in significantly better functional outcomes at 90 days compared to placebo (mRS 0-1: 53.3% vs 41.8%, OR 1.61). This represents an absolute benefit of 11.5 percentage points with an NNT of 9. The benefit came with numerically higher rates of symptomatic intracranial hemorrhage and mortality, though these differences were not statistically significant. WAKE-UP established MRI-guided thrombolysis as a viable option for carefully selected wake-up stroke patients, expanding treatment opportunities for a population previously excluded from acute reperfusion therapy.

*Source: [Thomalla G, et al. N Engl J Med. 2018;379(7):611-622](https://www.nejm.org/doi/full/10.1056/NEJMoa1804355)*
`
  },
  'eagle-trial': {
    id: 'eagle-trial',
    title: 'EAGLE Trial: IA tPA for CRAO',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Central Retinal Artery Occlusion (CRAO) is an ophthalmologic emergency with poor prognosis. Intra-arterial (IA) fibrinolysis was hypothesized to improve visual outcomes by recanalizing the ophthalmic artery. The EAGLE trial was the first randomized controlled trial to test this.

## Trial Summary
*   **Design:** Prospective, randomized, multicenter trial.
*   **Population:** 84 patients with acute non-arteritic CRAO.
*   **Time Window:** Within **20 hours** of symptom onset.
*   **Intervention:**
    *   **LIF Group:** Local Intra-arterial Fibrinolysis (max 50mg tPA) via microcatheter in ophthalmic artery.
    *   **CST Group:** Conservative Standard Treatment (hemodilution, ocular massage, timolol, acetazolamide).
*   **Primary Outcome:** Change in Best Corrected Visual Acuity (BCVA) at 1 month.
*   **Results:**
    *   **Visual Improvement:** Clinically significant improvement in 60.0% of CST group vs 57.1% of LIF group (P=0.69). No difference.
    *   **Adverse Events:** 4.3% in CST group vs **37.1%** in LIF group (including headaches, but also 2 hemorrhages in LIF).

## Clinical PEARLS
*   **Negative Trial:** IA tPA showed no efficacy benefit over conservative therapy.
*   **Safety Hazard:** The intervention carried significantly higher risks (hemorrhage, etc.) without benefit.
*   **Study Stopped:** The trial was terminated early by the Data Safety Monitoring Board due to futility and safety concerns.
*   **Guideline Impact:** Based on EAGLE, IA tPA is generally **not recommended** for CRAO in standard practice, though IV tPA within 4.5h is still considered by some centers (based on other non-randomized data, e.g., recent AHA statements).

## Conclusion
In light of similar visual outcomes and a higher rate of adverse reactions associated with Local Intra-arterial Fibrinolysis (LIF), it cannot be recommended for the management of acute CRAO.

*Source: [Schumacher et al. (Ophthalmology 2010)](https://www.aaojournal.org/article/S0161-6420(10)00258-2/fulltext)*
`
  },
  'original-trial': {
    id: 'original-trial',
    title: 'ORIGINAL Trial: Tenecteplase vs Alteplase for Acute Ischemic Stroke',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Tenecteplase (TNK) is a bioengineered variant of alteplase with greater fibrin specificity, longer half-life, and resistance to plasminogen activator inhibitor-1 — enabling single-bolus IV administration over 5–10 seconds rather than a 60-minute infusion. Prior trials (NOR-TEST, AcT) suggested noninferiority but had mixed results or regional limitations. The ORIGINAL trial was designed as a large multicenter noninferiority trial specifically in Chinese patients to directly compare the two agents head-to-head within the standard 4.5-hour thrombolysis window.

## Trial Summary
*   **Design:** Multicenter, active-controlled, open-label, blinded-endpoint (PROBE) noninferiority trial. 55 stroke centers in China.
*   **Population:** 1,489 randomized (1,465 in full analysis set); acute ischemic stroke, NIHSS 1–25, symptoms ≥30 minutes without significant improvement, treated within **4.5 hours** of onset.
*   **Intervention:** IV Tenecteplase **0.25 mg/kg** (max 25 mg) single bolus vs IV Alteplase **0.9 mg/kg** (max 90 mg; 10% bolus + 60-min infusion).
*   **Primary Outcome:** Excellent functional outcome (mRS 0–1) at 90 days. Noninferiority margin: risk ratio ≥ 0.937.
*   **Results:**
    *   **mRS 0–1 at 90 days:** **72.7%** (TNK, 532/732) vs **70.3%** (alteplase, 515/733) — RR 1.03 (95% CI 0.97–1.09). **Noninferiority threshold met.**
    *   **Symptomatic ICH (ECASS III definition):** **1.2%** in both groups — RR 1.01 (95% CI 0.37–2.70). Identical safety profiles.
    *   **90-day mortality:** 4.6% (TNK) vs 5.8% (alteplase) — RR 0.80 (95% CI 0.51–1.23); numerically lower with TNK, not statistically significant.
*   **Enrollment:** July 2021 – July 2023.

## Clinical PEARLS
*   **Noninferiority confirmed:** RR 1.03 (95% CI 0.97–1.09) — the noninferiority margin of 0.937 was met. Tenecteplase is a safe and effective substitute for alteplase within 4.5 hours.
*   **Single-bolus advantage:** Eliminates the 60-minute infusion pump — critical for drip-and-ship transfers. Patient can be loaded into the ambulance immediately after the bolus.
*   **Identical sICH rates:** 1.2% in both groups. Tenecteplase's higher fibrin specificity does not translate to increased hemorrhagic risk at the 0.25 mg/kg dose.
*   **2026 AHA/ASA Guidelines (COR 1, LOE A):** ORIGINAL, alongside AcT (Canada, 2022) and NOR-TEST 2, forms the evidence base for the 2026 AHA/ASA guideline endorsing tenecteplase and alteplase as equivalent first-line choices.
*   **Dose clarity:** Only 0.25 mg/kg (max 25 mg) is supported. Higher doses (0.4 mg/kg) increased hemorrhagic risk in earlier trials and are not approved.
*   **Do not confuse with EAGLE:** The EAGLE trial (Ophthalmology 2010) tested intra-arterial tPA for central retinal artery occlusion — a completely different indication and negative trial.

## Conclusion
In patients with acute ischemic stroke eligible for intravenous thrombolysis within 4.5 hours, tenecteplase 0.25 mg/kg was **noninferior to alteplase 0.9 mg/kg** for excellent functional outcome (mRS 0–1) at 90 days, with an identical safety profile. These findings support tenecteplase as a suitable alternative to alteplase and underpin the 2026 AHA/ASA COR 1 recommendation for both agents.

*Source: [Meng X et al. JAMA 2024;332(17):1437–1445. DOI: 10.1001/jama.2024.14721](https://doi.org/10.1001/jama.2024.14721) — ClinicalTrials.gov: NCT04915729*
`
  },

  'attention-trial': {
    id: 'attention-trial',
    title: 'ATTENTION Trial: Basilar Artery EVT',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Basilar Artery Occlusion (BAO) carries high mortality (>80% without treatment). Early trials (BEST, BASICS) were inconclusive due to crossover and slow recruitment. ATTENTION (and BAOCHE) provided definitive evidence.

## Trial Summary
*   **Design:** Multicenter, randomized, open-label trial in China.
*   **Population:** 340 patients with Basilar Artery Occlusion.
*   **Time Window:** Within **12 hours** of estimated onset.
*   **Intervention:** Endovascular Thrombectomy (EVT) (+/- tPA) vs. Best Medical Therapy (BMT).
*   **Primary Outcome:** Good functional status (mRS 0-3) at 90 days.
*   **Results:**
    *   **Good Outcome (mRS 0-3):** 46% in EVT group vs 23% in BMT group (Adj Rate Ratio 2.06; P<0.001).
    *   **Mortality:** 37% in EVT group vs 55% in BMT group.
    *   **Symptomatic ICH:** 5% in EVT vs 0% in BMT.

## Clinical PEARLS
*   **Definitive Benefit:** Unlike anterior circulation where mRS 0-2 is the goal, BAO trials often use mRS 0-3 because the natural history is so devastating. EVT doubled the rate of good outcomes.
*   **Mortality Reduction:** One of the few stroke interventions shown to significantly reduce mortality (NNT ~ 5.5 to prevent death).
*   **Bridging:** ~30% of patients received IV thrombolysis.

## Conclusion
In patients with basilar-artery occlusion presenting within 12 hours, endovascular thrombectomy led to better functional outcomes and lower mortality than best medical care.

*Source: [Tao et al. (NEJM 2022)](https://www.nejm.org/doi/full/10.1056/NEJMoa2207576)*
`
  },
  'baoche-trial': {
    id: 'baoche-trial',
    title: 'BAOCHE Trial: Basilar EVT 6-24h',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Following the success of extended window thrombectomy in the anterior circulation (DAWN/DEFUSE-3), BAOCHE examined the 6-24 hour window for Basilar Artery Occlusion.

## Trial Summary
*   **Design:** Multicenter, randomized, open-label trial in China.
*   **Population:** 217 patients with Basilar Artery Occlusion.
*   **Time Window:** **6 to 24 hours** from onset.
*   **Selection:** Used clinical exclusion (severe disability) but did not strictly require perfusion imaging mismatch, though pc-ASPECTS was assessed.
*   **Intervention:** Thrombectomy vs. Best Medical Therapy.
*   **Primary Outcome:** Good functional status (mRS 0-3) at 90 days.
*   **Results:**
    *   **Good Outcome (mRS 0-3):** 46% in EVT group vs 24% in Control group (Adj Rate Ratio 1.81; P<0.001).
    *   **Mortality:** 31% in EVT group vs 42% in Control group.

## Clinical PEARLS
*   **Late Window Basilar:** Confirms that the basilar artery also has a "late window" benefit, likely due to collateral flow from the posterior communicating arteries.
*   **High Efficacy:** The effect size was remarkably similar to the early window ATTENTION trial (46% good outcome in both).
*   **Recommendation:** EVT is now recommended for BAO up to 24 hours in eligible patients.

## Conclusion
Among patients with basilar-artery occlusion who presented between 6 and 24 hours after symptom onset, thrombectomy led to a higher rate of good functional status at 90 days than medical therapy.

*Source: [Jovin et al. (NEJM 2022)](https://www.nejm.org/doi/full/10.1056/NEJMoa2206317)*
`
  },
  'distal-trial': {
    id: 'distal-trial',
    title: 'DISTAL Trial: EVT for Medium/Distal Vessels',
    category: 'Neuro Trials',
    content: `
## Clinical Context
While Endovascular Thrombectomy (EVT) is the standard of care for Large Vessel Occlusions (LVO), its efficacy for medium (e.g., M2, M3) and distal vessel occlusions has been uncertain. The DISTAL trial aimed to determine if EVT offers benefit over Best Medical Treatment (BMT) for these lesions.

## Trial Summary
*   **Design:** International, multicenter, randomized, assessor-blinded trial.
*   **Population:** 543 patients with isolated occlusion of medium or distal vessels (M2 non-dominant/co-dominant, M3, M4, A1-A3, P1-P3).
    *   *Note:* Dominant M2 occlusions were excluded (as benefit is probable).
*   **Time Window:** Within 24 hours of Last Known Well.
*   **Intervention:** EVT + Best Medical Treatment (BMT) vs. BMT alone.
*   **Primary Outcome:** Functional disability (mRS shift) at 90 days.
*   **Results:**
    *   **Functional Outcome:** No significant difference in mRS distribution (Common Odds Ratio 0.90; 95% CI 0.67–1.22; P=0.50).
    *   **Mortality:** 15.5% in EVT group vs 14.0% in BMT group.
    *   **Symptomatic ICH:** 5.9% in EVT group vs 2.6% in BMT group (OR 2.38).

## Clinical PEARLS
*   **Neutral Result:** The trial failed to show a benefit for EVT in this broad population of medium/distal occlusions.
*   **Technical Challenges:** Successful reperfusion (TICI 2b-3) was achieved in only **71.7%** of EVT patients, significantly lower than typical LVO trials, highlighting the difficulty of accessing distal vessels.
*   **Safety Signal:** Symptomatic intracranial hemorrhage (sICH) was more than double in the EVT group (5.9% vs 2.6%).
*   **Workflow:** Median time from imaging to arterial puncture was 70 minutes, exceeding the 60-minute target.

## Conclusion
In patients with stroke due to medium or distal vessel occlusion, EVT did not result in less disability or death compared to best medical treatment alone.

*Source: [Psychogios et al. (NEJM 2025)](https://www.nejm.org/doi/full/10.1056/NEJMoa2408954)*
`
  },
  'escape-mevo-trial': {
    id: 'escape-mevo-trial',
    title: 'ESCAPE-MeVO Trial: EVT for MeVO',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Conducted in parallel with DISTAL, the ESCAPE-MeVO trial investigated the efficacy and safety of endovascular thrombectomy for Medium Vessel Occlusions (MeVO), specifically targeting the M2/M3 MCA, A2/A3 ACA, and P2/P3 PCA segments.

## Trial Summary
*   **Design:** Multicenter, prospective, randomized, open-label trial (PROBE).
*   **Population:** 530 patients with acute ischemic stroke due to MeVO.
*   **Time Window:** Within 12 hours of Last Known Well.
*   **Selection:** High baseline NIHSS (>5 or disabling 3-5) and favorable baseline imaging.
*   **Intervention:** EVT + Usual Care vs. Usual Care alone.
*   **Primary Outcome:** Excellent functional outcome (mRS 0-1) at 90 days.
*   **Results:**
    *   **Excellent Outcome (mRS 0-1):** 41.6% in EVT group vs 43.1% in Usual Care (Adjusted Rate Ratio 0.95; P=0.61).
    *   **Mortality:** 13.3% in EVT group vs 8.4% in Usual Care (Adjusted HR 1.82; 95% CI 1.06–3.12).
    *   **Symptomatic ICH:** 5.4% in EVT group vs 2.2% in Usual Care.

## Clinical PEARLS
*   **No Benefit:** Like DISTAL, this trial showed no functional benefit for routine EVT in MeVO patients.
*   **Evidence of Harm:** There was a statistically significant increase in **90-day mortality** (aHR 1.82) in the EVT group.
*   **Procedural Risk:** Symptomatic intracranial hemorrhage was significantly more frequent in the EVT arm.
*   **Implication:** Routine EVT for medium vessel occlusions is not supported by current evidence; the risks of the procedure in these smaller vessels may outweigh benefits in unselected populations.

## Conclusion
Endovascular treatment for medium-vessel occlusion stroke within 12 hours did not lead to better functional outcomes and was associated with higher mortality compared to usual care.

*Source: [Goyal et al. (NEJM 2025)](https://www.nejm.org/doi/full/10.1056/NEJMoa2411668)*
`
  },
  'defuse-3-trial': {
    id: 'defuse-3-trial',
    title: 'DEFUSE 3 Trial: Thrombectomy 6-16 Hours',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Historically, mechanical thrombectomy was limited to 6 hours from symptom onset. The DEFUSE 3 trial aimed to determine if patients with salvageable tissue on perfusion imaging (penumbra) would benefit from treatment in the extended 6–16 hour window. Use the **[Thrombectomy Pathway](/calculators/evt-pathway)** to assess eligibility.

## Trial Summary
*   **Design:** Multicenter, randomized, open-label, blinded-endpoint trial.
*   **Population:** Acute ischemic stroke with ICA or M1 occlusion 6–16 hours from Last Known Well.
*   **Selection Criteria (Perfusion):**
    *   **Infarct Core:** < 70 ml.
    *   **Mismatch Ratio:** ≥ 1.8.
    *   **Mismatch Volume:** ≥ 15 ml.
*   **Intervention:** Thrombectomy + Standard Medical Therapy vs. Standard Medical Therapy alone.
*   **Primary Outcome:** Functional independence (mRS 0-2) at 90 days.
*   **Results:**
    *   **Functional Independence:** 45% in EVT group vs 17% in Control group (P<0.001).
    *   **Mortality:** 14% in EVT group vs 26% in Control group (P=0.05).

## Clinical PEARLS
*   **NNT:** The Number Needed to Treat (NNT) for one additional patient to be functionally independent was **3**.
*   **Safety:** No significant difference in symptomatic intracranial hemorrhage (sICH) or serious adverse events.
*   **Paradigm Shift:** Along with the DAWN trial, DEFUSE 3 established the "Late Window" protocol, shifting focus from "Time is Brain" to "Tissue is Brain".
*   **Implementation:** Requires automated perfusion software (e.g., RAPID) for standardized core/penumbra calculation.

## Conclusion
Thrombectomy for ischemic stroke 6 to 16 hours after onset plus standard medical therapy results in better functional outcomes and lower mortality than standard medical therapy alone in selected patients with salvageable tissue.

*Source: [Albers et al. (NEJM 2018)](https://www.nejm.org/doi/full/10.1056/NEJMoa1706442)*
`
  },
  'dawn-trial': {
    id: 'dawn-trial',
    title: 'DAWN Trial: Thrombectomy 6-24 Hours',
    category: 'Neuro Trials',
    content: `
## Clinical Context
The DAWN trial investigated whether thrombectomy is effective in patients with a "Wake-Up" stroke or late presentation (6 to 24 hours) who demonstrate a clinical-core mismatch (severe deficit but small infarct core). Use the **[Thrombectomy Pathway](/calculators/evt-pathway)** to assess eligibility.

## Trial Summary
*   **Design:** Multicenter, prospective, randomized, open-label, adaptive trial.
*   **Population:** LVO (ICA or M1) at 6–24 hours from last known well.
*   **Selection Criteria (Clinical-Core Mismatch):**
    *   **Group A:** Age ≥ 80, [NIHSS](/calculators/nihss) ≥ 10, Core < 21 ml.
    *   **Group B:** Age < 80, [NIHSS](/calculators/nihss) ≥ 10, Core < 31 ml.
    *   **Group C:** Age < 80, [NIHSS](/calculators/nihss) ≥ 20, Core 31–50 ml.
*   **Primary Outcome:** Mean score for utility-weighted modified Rankin scale (mRS) at 90 days.
*   **Results:**
    *   **Functional Independence (mRS 0-2):** 49% in EVT group vs 13% in Control group.
    *   **Probability of Superiority:** >99.9%.

## Clinical PEARLS
*   **Massive Benefit:** The absolute difference in functional independence was **36%**, yielding a Number Needed to Treat (**NNT**) of **2.8**. This is one of the most potent effect sizes in stroke history.
*   **Patient Selection:** Relies heavily on **age** and **[NIHSS](/calculators/nihss)** relative to core volume, unlike DEFUSE-3 which uses a flat core/penumbra cutoff.
*   **Wake-Up Strokes:** Provided the first robust evidence for treating patients with unknown onset time (e.g., waking up with symptoms) if physiology was favorable.

## Conclusion
Among patients with acute stroke and mismatched clinical deficit and infarct volume, thrombectomy within 6 to 24 hours results in significantly better functional outcomes than standard care.

*Source: [Nogueira et al. (NEJM 2018)](https://www.nejm.org/doi/full/10.1056/NEJMoa1713973)*
`
  },
  'select2-trial': {
    id: 'select2-trial',
    title: 'SELECT2 Trial: Large Core Thrombectomy',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Patients with large ischemic cores (ASPECTS < 6 or Core Volume > 50ml) were historically excluded from thrombectomy trials due to fears of futile reperfusion and hemorrhagic transformation. SELECT2 challenged this dogma. Use the **[Thrombectomy Pathway](/calculators/evt-pathway)** to check large core eligibility.

## Trial Summary
*   **Design:** Randomized, open-label, international trial.
*   **Population:** Acute ischemic stroke with ICA or M1 occlusion.
*   **Selection Criteria (Large Core):**
    *   **NCCT:** ASPECTS 3–5.
    *   **OR CTP:** Core volume ≥ 50 ml.
*   **Intervention:** Thrombectomy vs Medical Management.
*   **Outcome:** Distribution of mRS scores at 90 days.
*   **Results:**
    *   **Functional Independence (mRS 0-2):** 20% in EVT group vs 7% in Medical group.
    *   **Generalized Odds Ratio:** 1.51 (favoring EVT).

## Clinical PEARLS
*   **New Frontier:** Established that "Large Core" is no longer an absolute contraindication for thrombectomy.
*   **Risk/Benefit:** While outcomes are generally poorer than small-core patients, EVT still provides a significant shift towards lower disability (e.g., being able to walk vs bedbound).
*   **Safety:** Symptomatic intracranial hemorrhage (sICH) was low and not significantly different between groups, though any ICH was more frequent in the EVT group.

## Conclusion
Endovascular thrombectomy improves functional outcomes in patients with large ischemic strokes (ASPECTS 3–5 or Core ≥ 50 ml) compared to medical management alone.

*Source: [Sarraj et al. (NEJM 2023)](https://www.nejm.org/doi/full/10.1056/NEJMoa2214403)*
`
  },
  'angel-aspect-trial': {
    id: 'angel-aspect-trial',
    title: 'ANGEL-ASPECT Trial: Large Core (China)',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Conducted in China, ANGEL-ASPECT complemented SELECT2 by investigating thrombectomy in patients with large infarct cores, including those with cores up to 100ml. Use the **[Thrombectomy Pathway](/calculators/evt-pathway)** to check large core eligibility.

## Trial Summary
*   **Design:** Multicenter, randomized, open-label trial in China.
*   **Population:** Anterior circulation LVO within 24 hours.
*   **Selection Criteria:**
    *   **ASPECTS:** 3–5.
    *   **OR Core Volume:** 70–100 ml (on CTP/DWI).
*   **Results:**
    *   **Functional Independence (mRS 0-2):** 30% in EVT group vs 11.6% in Medical group.
    *   **Generalized Odds Ratio:** 1.37.

## Clinical PEARLS
*   **Confirmation:** Validated the findings of SELECT2 in an Asian population and with slightly different volume criteria (pushing the upper limit to 100ml).
*   **Hemorrhage Risk:** Unlike SELECT2, this trial showed a statistically significant increase in symptomatic intracranial hemorrhage (sICH) in the EVT group (6.1% vs 2.7%), emphasizing the need for careful patient selection and BP management.
*   **Mortality:** Despite higher hemorrhage risk, there was no difference in 90-day mortality, and functional outcomes were superior.

## Conclusion
In patients with large ischemic core volume, endovascular therapy resulted in better functional outcomes but was associated with more intracranial hemorrhages.

*Source: [Huo et al. (NEJM 2023)](https://www.nejm.org/doi/full/10.1056/NEJMoa2213379)*
`
  },
  'shine-trial': {
    id: 'shine-trial',
    title: 'SHINE Trial: Glycemic Control in Acute Stroke',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Hyperglycemia occurs in up to 40% of patients with acute ischemic stroke and is associated with worse clinical outcomes, increased infarct expansion, and higher risk of hemorrhagic transformation. The SHINE trial (Stroke Hyperglycemia Insulin Network Effort) sought to determine if intensive glucose control improved 90-day functional outcomes.

## Trial Summary
*   **Design:** Multicenter, randomized, open-label, blinded-endpoint trial.
*   **Population:** 1,151 patients with acute ischemic stroke and hyperglycemia (glucose >110 mg/dL if diabetic, >150 mg/dL if non-diabetic).
*   **Intervention:** Intensive insulin (IV infusion, target 80–130 mg/dL) vs. Standard care (SC insulin, target <180 mg/dL).
*   **Outcome:** No significant difference in favorable functional outcome (mRS) at 90 days.

## Clinical PEARLS
*   **No Benefit to Intensive Control:** Targeting a tight range of 80–130 mg/dL with IV insulin did not improve 90-day outcomes compared to standard subcutaneous sliding scale targeting <180 mg/dL.
*   **Hypoglycemia Risk:** Intensive therapy significantly increased the risk of severe hypoglycemia (2.6% vs. 0%), often leading to premature discontinuation of the infusion.
*   **Practical Threshold:** Current [Acute Stroke Management](/guide/acute-stroke-mgmt) protocols utilize a threshold of 180 mg/dL for treatment initiation based on these results.
*   **Nursing Burden:** Intensive IV insulin required significantly more frequent monitoring (often hourly), which increased nursing workload without improving patient recovery.
*   **Standard of Care:** Meticulous glucose monitoring is still required, but "permissive" hyperglycemia up to 180 mg/dL is safer than aggressive lowering.

## Conclusion
The SHINE trial reinforces that for acute ischemic stroke, "less is more" regarding glycemic intensity. Clinicians should prioritize avoiding hypoglycemia while maintaining blood glucose below 180 mg/dL using standard subcutaneous regimens.

*Source: [SHINE Trial Investigators (JAMA 2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6652154/)*
`
  },
  'nascet-trial': {
    id: 'nascet-trial',
    title: 'NASCET Trial: Carotid Endarterectomy',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Before NASCET, the benefit of Carotid Endarterectomy (CEA) for symptomatic carotid stenosis was controversial. This landmark trial stratified benefit by degree of stenosis.

## Trial Summary
*   **Population:** Patients with TIA or non-disabling stroke and ipsilateral carotid stenosis.
*   **Intervention:** Carotid Endarterectomy (CEA) + Medical Therapy vs. Medical Therapy alone.
*   **High-Grade Stenosis (70-99%):**
    *   **Result:** 2-year ipsilateral stroke risk was 9% (CEA) vs 26% (Medical).
    *   **Absolute Risk Reduction:** 17%. **NNT:** 6.
*   **Moderate Stenosis (50-69%):**
    *   **Result:** 5-year stroke risk was 15.7% (CEA) vs 22.2% (Medical).
    *   **Absolute Risk Reduction:** 6.5%. **NNT:** 15.
*   **Low Stenosis (<50%):** No benefit found.

## Clinical PEARLS
*   **Degree Matters:** Benefit is highly dependent on the degree of stenosis.
*   **Symptomatic Only:** This trial applies to *symptomatic* patients. (ACAS/ACST addressed asymptomatic).
*   **Timing:** Benefit is highest when performed within 2 weeks of the symptomatic event.
*   **Gender:** In the moderate stenosis group (50-69%), benefit was significant for men but marginal/non-significant for women.

## Conclusion
Carotid endarterectomy is highly beneficial for symptomatic patients with severe (70-99%) stenosis and moderately beneficial for those with moderate (50-69%) stenosis.

*Source: [Barnett et al. (Stroke 1999 / NEJM 1991)](https://www.ahajournals.org/doi/10.1161/01.str.30.9.1751)*
`
  },
  'crest-trial': {
    id: 'crest-trial',
    title: 'CREST Trial: Stenting vs CEA',
    category: 'Neuro Trials',
    content: `
## Clinical Context
With the emergence of Carotid Artery Stenting (CAS) as a less invasive alternative to Endarterectomy (CEA), CREST sought to compare their safety and efficacy.

## Trial Summary
*   **Design:** Randomized, controlled trial.
*   **Population:** 2,502 patients with symptomatic or asymptomatic carotid stenosis.
*   **Intervention:** Carotid Artery Stenting (CAS) vs. Carotid Endarterectomy (CEA).
*   **Primary Outcome:** Composite of Stroke, Myocardial Infarction, or Death during periprocedural period, or ipsilateral stroke within 4 years.
*   **Results:**
    *   **Composite Rate:** 7.2% (CAS) vs 6.8% (CEA). No significant difference (P=0.51).

## Clinical PEARLS
*   **The Trade-off:**
    *   **Stroke:** Risk was significantly higher with Stenting (4.1% vs 2.3%).
    *   **Myocardial Infarction:** Risk was significantly higher with CEA (2.3% vs 1.1%).
*   **Age Effect:**
    *   **Age > 70:** Better outcomes with **CEA** (Surgery).
    *   **Age < 70:** Better outcomes with **CAS** (Stenting).
*   **QOL:** Stroke had a larger impact on quality of life at 1 year than MI.

## Conclusion
Among patients with carotid stenosis, stenting and endarterectomy were associated with similar rates of the primary composite outcome. However, stenting carried a higher risk of stroke, while surgery carried a higher risk of MI.

*Source: [Brott et al. (NEJM 2010)](https://www.nejm.org/doi/full/10.1056/NEJMoa0912321)*
`
  },
  'chance-trial': {
    id: 'chance-trial',
    title: 'CHANCE Trial: Dual Antiplatelet Therapy',
    category: 'Neuro Trials',
    content: `
## Clinical Context
For years, Aspirin monotherapy was standard for acute ischemic stroke. The CHANCE trial (China) investigated if short-term Dual Antiplatelet Therapy (DAPT) with Clopidogrel and Aspirin could reduce recurrent stroke in high-risk patients.

## Trial Summary
*   **Design:** Randomized, double-blind, placebo-controlled trial in China.
*   **Population:** 5,170 patients with minor ischemic stroke ([NIHSS](/calculators/nihss) ≤ 3) or high-risk TIA ([ABCD²](/calculators/abcd2-score) ≥ 4) within 24 hours of onset.
*   **Intervention:**
    *   **DAPT:** Clopidogrel (300mg load, then 75mg/d) + Aspirin (75mg/d) for 21 days, followed by Clopidogrel monotherapy.
    *   **Control:** Aspirin (75mg/d) monotherapy.
*   **Primary Outcome:** Stroke (ischemic or hemorrhagic) recurrence at 90 days.
*   **Results:**
    *   **Stroke Recurrence:** 8.2% in DAPT group vs 11.7% in Aspirin group (Hazard Ratio 0.68; P<0.001).
    *   **Hemorrhage:** No significant difference in moderate/severe hemorrhage (0.3% vs 0.3%).

## Clinical PEARLS
*   **Standard of Care Change:** CHANCE provided the first major evidence that DAPT is superior to monotherapy for *minor* stroke and high-risk TIA in the acute phase.
*   **Population Specificity:** Conducted entirely in China (CYP2C19 loss-of-function alleles are more common in Asian populations, yet Clopidogrel still worked).
*   **21 Days:** The protocol used DAPT for only 21 days, establishing the concept of "short-term" DAPT to minimize bleeding risk while maximizing ischemic protection.

## Conclusion
Among patients with high-risk TIA or minor ischemic stroke, treatment with Clopidogrel plus Aspirin for 21 days reduced the risk of recurrent stroke compared to Aspirin alone.

*Source: [Wang et al. (NEJM 2013)](https://www.nejm.org/doi/full/10.1056/NEJMoa1215340)*
`
  },
  'point-trial': {
    id: 'point-trial',
    title: 'POINT Trial: DAPT in International Population',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Following the CHANCE trial in China, the POINT trial sought to confirm the benefits of DAPT in an international (Western) population with slightly different loading protocols.

## Trial Summary
*   **Design:** Randomized, double-blind, international trial.
*   **Population:** 4,881 patients with minor ischemic stroke ([NIHSS](/calculators/nihss) ≤ 3) or high-risk TIA ([ABCD²](/calculators/abcd2-score) ≥ 4) within 12 hours.
*   **Intervention:**
    *   **DAPT:** Clopidogrel (600mg load, then 75mg/d) + Aspirin (50-325mg/d) for 90 days.
    *   **Control:** Aspirin alone.
*   **Primary Outcome:** Composite of ischemic stroke, MI, or ischemic vascular death at 90 days.
*   **Results:**
    *   **Major Ischemic Events:** 5.0% in DAPT group vs 6.5% in Aspirin group (P=0.02).
    *   **Major Hemorrhage:** 0.9% in DAPT group vs 0.4% in Aspirin group (P=0.02).

## Clinical PEARLS
*   **Confirms CHANCE:** Validated the efficacy of DAPT for minor stroke/TIA in a Western population.
*   **Bleeding Risk:** Unlike CHANCE, POINT showed a statistically significant increase in major hemorrhage.
*   **Time Course:** Benefit was driven primarily by reduction in stroke during the first **7 to 21 days**. The bleeding risk persisted throughout the 90 days.
*   **Guideline Consensus:** Combined with CHANCE, this led to guidelines recommending DAPT for **21 days only**, rather than the 90 days tested in POINT, to balance efficacy vs safety.

## Conclusion
In patients with minor ischemic stroke or high-risk TIA, DAPT with Clopidogrel and Aspirin reduced the risk of major ischemic events but increased the risk of major hemorrhage compared to Aspirin alone.

*Source: [Johnston et al. (NEJM 2018)](https://www.nejm.org/doi/full/10.1056/NEJMoa1800410)*
`
  },
  'sammpris-trial': {
    id: 'sammpris-trial',
    title: 'SAMMPRIS Trial: ICAD Stenting vs Medical',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Intracranial Atherosclerotic Disease (ICAD) carries a high risk of recurrent stroke. SAMMPRIS investigated whether percutaneous transluminal angioplasty and stenting (PTAS) was superior to aggressive medical management alone.

## Trial Summary
*   **Design:** Randomized, open-label trial.
*   **Population:** Patients with **70-99% stenosis** of a major intracranial artery and a recent (last 30 days) TIA or stroke.
*   **Intervention:**
    *   **Stenting Group:** PTAS (Wingspan stent) + Aggressive Medical Management.
    *   **Medical Group:** Aggressive Medical Management alone (DAPT for 90 days, Rosuvastatin 20mg, BP < 140/90).
*   **Results (Stopped Early):**
    *   **30-Day Stroke/Death:** 14.7% in Stenting group vs 5.8% in Medical group (P=0.002).
    *   **1-Year Primary Endpoint:** 20.0% in Stenting group vs 12.2% in Medical group.

## Clinical PEARLS
*   **Stenting is Dangerous:** The trial was halted early because the stenting group had significantly higher rates of periprocedural stroke.
*   **Aggressive Medical Management (AMM):** The "Control" group did surprisingly well compared to historical controls (WASID trial), proving that AMM (DAPT + High-intensity Statin + BP control) is a highly effective strategy.
*   **Standard of Care:** AMM is now the first-line treatment for symptomatic ICAD. Stenting is reserved for salvage cases failing AMM.

## Conclusion
In patients with symptomatic intracranial arterial stenosis, aggressive medical management was superior to PTAS with the Wingspan stent system, primarily due to the high risk of periprocedural stroke in the stenting arm.

*Source: [Chimowitz et al. (NEJM 2011)](https://www.nejm.org/doi/pdf/10.1056/nejmoa1105335)*
`
  },
  'weave-trial': {
    id: 'weave-trial',
    title: 'WEAVE Trial: Wingspan Stent On-Label',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Following the poor outcomes of intracranial stenting in SAMMPRIS (14.7% event rate), the FDA mandated a post-market surveillance study to assess the safety of the Wingspan stent when used strictly "on-label" by experienced interventionalists.

## Trial Summary
*   **Design:** Prospective, single-arm, post-market surveillance.
*   **Population:** 152 consecutive patients meeting strict **On-Label** criteria:
    *   Symptomatic ICAD 70-99%.
    *   Recurrent stroke despite medical therapy (at least 2 strokes in territory).
    *   Age 22-80, mRS <= 3.
    *   **>8 days** from most recent stroke (to avoid reperfusion hemorrhage).
*   **Intervention:** Angioplasty and Stenting with Wingspan Stent System.
*   **Primary Outcome:** Stroke or death within 72 hours.
*   **Results:**
    *   **Periprocedural Stroke/Death:** **2.6%** (4/152 patients).
    *   **Benchmark:** Significantly lower than the 4% safety benchmark set by the FDA.

## Clinical PEARLS
*   **Patient Selection:** This trial demonstrated that intracranial stenting *can* be performed safely (2.6% risk vs 14.7% in SAMMPRIS) if strict selection criteria are followed, particularly waiting >8 days after stroke and requiring demonstrated failure of medical therapy (2 recurrent strokes).
*   **Experience Matters:** The trial utilized experienced interventionalists, which likely contributed to the lower complication rate.
*   **Role of Stenting:** While WEAVE assessed safety (not efficacy vs medical therapy), it reopened the door for stenting as a viable salvage option for highly selected refractory patients.

## Conclusion
With experienced interventionalists and proper patient selection following on-label usage guidelines (specifically >7 days post-stroke), the use of the Wingspan stent for intracranial atherosclerotic disease demonstrated a low periprocedural complication rate.

*Source: [Alexander et al. (Stroke 2019)](https://www.ahajournals.org/doi/10.1161/STROKEAHA.118.023996)*
`
  },
  'socrates-trial': {
    id: 'socrates-trial',
    title: 'SOCRATES Trial: Ticagrelor vs Aspirin',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Ticagrelor is a potent antiplatelet agent used in cardiology. SOCRATES aimed to see if Ticagrelor monotherapy was superior to Aspirin monotherapy for acute stroke/TIA.

## Trial Summary
*   **Design:** Randomized, double-blind trial.
*   **Population:** 13,199 patients with acute mild-to-moderate ischemic stroke ([NIHSS](/calculators/nihss) ≤ 5) or high-risk TIA.
*   **Intervention:**
    *   **Ticagrelor:** 180mg load, then 90mg BID.
    *   **Aspirin:** 300mg load, then 100mg daily.
*   **Primary Outcome:** Composite of stroke, MI, or death at 90 days.
*   **Results:**
    *   **Primary Endpoint:** 6.7% in Ticagrelor group vs 7.5% in Aspirin group (Hazard Ratio 0.89; P=0.07).
    *   **Significance:** Not statistically significant.

## Clinical PEARLS
*   **Negative Trial:** Ticagrelor was not superior to Aspirin in the broad population of minor stroke/TIA.
*   **Subgroup Analysis:** There was a suggestion of benefit in patients with ipsilateral stenosis, but this was exploratory.
*   **THALES Trial:** A subsequent trial (THALES) later showed that Ticagrelor + Aspirin (DAPT) was superior to Aspirin alone, but with increased bleeding, similar to the CHANCE/POINT results for Clopidogrel.
*   **Current Use:** Clopidogrel + Aspirin remains the preferred DAPT regimen unless there is Clopidogrel resistance (CYP2C19 status).

## Conclusion
In patients with acute ischemic stroke or high-risk TIA, Ticagrelor was not found to be superior to Aspirin in reducing the rate of stroke, myocardial infarction, or death at 90 days.

*Source: [Johnston et al. (NEJM 2016)](https://www.nejm.org/doi/full/10.1056/NEJMoa1603060)*
`
  },
  'sps3-trial': {
    id: 'sps3-trial',
    title: 'SPS3 Trial: DAPT in Lacunar Stroke',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Small subcortical strokes (lacunar infarcts) are common. SPS3 investigated two questions: BP targets (Standard vs Intensive) and Antiplatelets (DAPT vs Aspirin) for secondary prevention. This entry focuses on the **Antiplatelet** arm.

## Trial Summary
*   **Design:** Randomized, double-blind, multicenter trial.
*   **Population:** 3,020 patients with MRI-confirmed symptomatic lacunar infarctions.
*   **Intervention (Antiplatelet Arm):**
    *   **DAPT:** Aspirin (325mg) + Clopidogrel (75mg).
    *   **Monotherapy:** Aspirin (325mg) + Placebo.
*   **Results:**
    *   **Recurrent Stroke:** 2.5% per year (DAPT) vs 2.7% per year (Aspirin) (P=0.48). Non-significant.
    *   **All-Cause Mortality:** Significant increase in DAPT group (HR 1.52; P=0.004).
    *   **Major Bleeding:** Nearly doubled in DAPT group (2.1% vs 1.1%).

## Clinical PEARLS
*   **Do NOT use DAPT for Lacunes:** Unlike large vessel disease or acute minor stroke (CHANCE/POINT), long-term DAPT is harmful in established lacunar stroke patients.
*   **Mortality Signal:** The trial was stopped early due to lack of benefit and increased mortality/bleeding in the DAPT arm.
*   **Mechanism:** Lacunar disease is often a small vessel lipohyalinosis pathology, which may be less responsive to aggressive platelet inhibition compared to large artery atherosclerosis, but is prone to hemorrhage.

## Conclusion
Among patients with recent lacunar strokes, the addition of clopidogrel to aspirin did not significantly reduce the risk of recurrent stroke and was associated with an increased risk of bleeding and death.

*Source: [SPS3 Investigators (NEJM 2012)](https://www.nejm.org/doi/full/10.1056/NEJMoa1204133)*
`
  },
  'sparcl-trial': {
    id: 'sparcl-trial',
    title: 'SPARCL Trial: Statins in Stroke',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Statins are known to reduce stroke risk in patients with coronary artery disease. The SPARCL trial investigated whether high-dose atorvastatin reduces the risk of recurrent stroke in patients with recent stroke or TIA *without* known coronary heart disease.

## Trial Summary
*   **Design:** Randomized, double-blind, placebo-controlled trial.
*   **Population:** 4,731 patients with stroke or TIA within 1–6 months, LDL 100–190 mg/dL, and no known coronary heart disease.
*   **Intervention:** Atorvastatin 80 mg daily vs. Placebo.
*   **Primary Outcome:** Fatal or non-fatal stroke.
*   **Results:**
    *   **Stroke Recurrence:** 11.2% in Atorvastatin group vs 13.1% in Placebo group (Hazard Ratio 0.84; P=0.03).
    *   **Major Coronary Events:** Significant reduction (HR 0.65).

## Clinical PEARLS
*   **Standard of Care:** Established high-intensity statin (Atorvastatin 80mg) as the standard of care for secondary prevention of non-cardioembolic ischemic stroke.
*   **Hemorrhage Risk:** There was a small but statistically significant increase in hemorrhagic stroke in the Atorvastatin group (2.3% vs 1.4%), though the overall benefit for ischemic stroke reduction outweighed this risk.
*   **LDL Reduction:** The treatment group achieved a mean LDL of 73 mg/dL compared to 129 mg/dL in the placebo group.

## Conclusion
In patients with recent stroke or TIA and without known coronary heart disease, 80 mg of atorvastatin per day reduced the overall incidence of stroke and of cardiovascular events.

*Source: [Amarenco et al. (NEJM 2006)](https://www.nejm.org/doi/full/10.1056/NEJMoa061894)*
`
  },
  'elan-study': {
    id: 'elan-study',
    title: 'ELAN Study: Timing of DOACs',
    category: 'Neuro Trials',
    content: `
## Clinical Context
For patients with ischemic stroke and Atrial Fibrillation, the optimal timing to start Direct Oral Anticoagulants (DOACs) has been debated. Early initiation risks hemorrhagic transformation, while late initiation risks recurrent embolism. Use the **[Post-Stroke Anticoagulation Timing](/calculators/elan-pathway)** calculator to determine the specific start day based on stroke size.

## Trial Summary
*   **Design:** Open-label, randomized controlled trial.
*   **Population:** 2,013 patients with acute ischemic stroke and Atrial Fibrillation.
*   **Intervention:**
    *   **Early Treatment:**
        *   Minor/TIA: < 48 hours.
        *   Moderate: Day 2.
        *   Major: Day 6-7.
    *   **Later Treatment:**
        *   Minor/TIA: Day 3-4.
        *   Moderate: Day 6-7.
        *   Major: Day 12-14.
*   **Primary Outcome:** Composite of recurrent ischemic stroke, symptomatic intracranial hemorrhage (sICH), extracranial bleeding, systemic embolism, or vascular death at 30 days.
*   **Results:**
    *   **Composite Outcome:** 2.9% (Early) vs 4.1% (Later). Risk Difference -1.18% (Range -2.84 to 0.47).
    *   **Recurrent Ischemic Stroke:** 1.4% (Early) vs 2.5% (Later).
    *   **Symptomatic ICH:** 0.2% in both groups (Low risk).

## Clinical PEARLS
*   **Safety Confirmed:** Early initiation of DOACs did not increase the risk of symptomatic intracranial hemorrhage compared to later initiation.
*   **Efficacy Signal:** While designed to estimate range (not superiority), the data suggests early initiation prevents more ischemic strokes.
*   **Practice Change:** Supports starting DOACs earlier than historical guidelines (e.g., day 2 for moderate, day 6-7 for major) provided imaging excludes hemorrhagic transformation.

## Conclusion
Early initiation of DOAC treatment was non-inferior and appeared safe compared to later initiation in patients with ischemic stroke associated with atrial fibrillation.

*Source: [Fischer et al. (NEJM 2023)](https://www.nejm.org/doi/full/10.1056/NEJMoa2303048)*
`
  },

  // --- VASCULAR NEUROLOGY ---
  'stroke-basics': {
    id: 'stroke-basics',
    title: 'Stroke Code Basics',
    category: 'Vascular Neurology',
    content: `
## 1. Immediate Assessment (The "Golden Hour")
*   **Establish Last Known Well (LKW):** Critical for eligibility. If wake-up stroke, LKW is time last seen normal before sleep.
*   **Vitals:** BP, HR, O2 Sat, Temp.
*   **POC Glucose:** Rule out hypoglycemia (< 50 mg/dL), which is a common mimic.
*   **[NIHSS](/calculators/nihss):** Perform baseline assessment by certified examiner.
    *   *Pearls:* Specifically assess for disabling deficits (e.g., isolated aphasia, visual field cut, hand weakness) even if total score is low.
    *   *History:* Screen for trauma, recent surgery (<14 days), active bleeding, anticoagulant use (time of last dose).

## 2. Acute Imaging Protocol
*   **Goal:** "Imaging is Brain". Initiate within 25 mins of arrival.
*   **Standard Protocol (0 - 6 Hours):**
    *   **NCCT Head:** Rule out hemorrhage. Assess ASPECTS (early ischemic changes).
    *   **CTA Head & Neck:** Identify Large Vessel Occlusion (LVO) in ICA, MCA (M1/M2), PCA, or Basilar artery. Detect carotid webs or dissection.
*   **Extended Window / Wake-up Protocol:**
    *   **CT Perfusion (CTP):** Required for 6-24 hour window to assess Core vs Penumbra mismatch (DAWN/DEFUSE 3 criteria).
    *   **MRI Brain:** DWI/FLAIR mismatch can identify wake-up stroke candidates likely within < 4.5h window. DWI is superior for posterior fossa and small strokes.

## 3. Laboratory Workup
*   **Stat:** Glucose, INR/PT/PTT, CBC (Platelets), Troponin.
*   **Do not delay tPA/EVT for labs** unless there is clinical suspicion of coagulopathy or known anticoagulant use.
*   **Secondary:** A1c, Lipids, Tox screen, Pregnancy test (women of childbearing age).

## 4. Cardiac Evaluation
*   **ECG:** Assess for Atrial Fibrillation or acute STEMI (can occur concurrently).
*   **Telemetry:** Minimum 24 hours to detect paroxysmal AF (STROKE-AF trial).
*   **Echocardiography:**
    *   **TTE:** Routine screening for structural source.
    *   **TEE:** Higher sensitivity for LA appendage clot, PFO, or aortic arch disease. Consider if TTE non-diagnostic and suspicion for embolic source is high.
`
  },
  'iv-tpa': {
    id: 'iv-tpa',
    title: 'IV Thrombolytic Protocol',
    category: 'Vascular Neurology',
    content: `
## Thrombolytic Agents
*   **Alteplase (tPA):** 0.9 mg/kg (Max 90 mg).
    *   **Bolus:** 10% of total dose IV push over 1 minute.
    *   **Infusion:** Remaining 90% over 60 minutes.
*   **Tenecteplase (TNK):** 0.25 mg/kg (Max 25 mg) single IV Bolus.
    *   Evidence suggests non-inferiority to Alteplase.
    *   Preferred for LVO patients being transferred (drip-and-ship) due to single bolus convenience.

## Blood Pressure Management
*   **Pre-treatment:** BP must be **< 185/110 mmHg**.
    *   *Rx:* Labetalol 10-20mg IV push (may repeat) OR Nicardipine infusion 5-15 mg/hr.
    *   *Note:* If BP remains refractory despite aggressive treatment, do not treat with lytics.
*   **Post-treatment:** Maintain BP **< 180/105 mmHg** for at least 24 hours. Monitor q15min x 2h, then q30min x 6h, then q1h x 16h.

## Inclusion Criteria
1.  Clinical diagnosis of ischemic stroke with **disabling** neurologic deficit.
2.  Time from Last Known Well < **4.5 hours**.
3.  Age >= 18 years.

## Key Exclusions (DO NOT GIVE)
*   **Hemorrhage:** Any ICH or SAH on CT.
*   **Coagulopathy:** Platelets < 100,000, INR > 1.7, PTT > 40s.
*   **Anticoagulants:**
    *   LMWH (therapeutic dose) within 24h.
    *   DOAC (Eliquis, Xarelto, etc.) within 48h (unless normal thrombin time/anti-Xa activity confirmed).
*   **Head History:** Severe head trauma or stroke within 3 months.
*   **Surgery:** Major intracranial or intraspinal surgery within 3 months.
*   **Bleeding Risk:** GI malignancy or bleed within 21 days; Suspected aortic arch dissection; Active internal bleeding.
*   **Imaging:** CT shows extensive hypodensity (> 1/3 MCA territory).

## Relative Exclusions (Weigh Risk vs Benefit)
*   Minor or rapidly improving symptoms (Treat if disabling!).
*   Major surgery or trauma < 14 days.
*   Seizure at onset (Treat if imaging confirms stroke).
*   Pregnancy.
*   Recent MI (< 3 months).

## Wake-Up / Unknown Onset
*   Patients with unknown onset may be eligible if:
    *   **MRI:** DWI positive (acute) + FLAIR negative (no signal change) suggests onset < 4.5h.
    *   **Perfusion:** Favorable penumbral salvage profile.
`
  },
  'thrombectomy': {
    id: 'thrombectomy',
    title: 'Mechanical Thrombectomy (EVT)',
    category: 'Vascular Neurology',
    content: `
## Indications
Use the **[Thrombectomy Calculator](/calculators/evt-pathway)** to stratify patients by trial criteria.

*   **Occlusion:** Proximal Large Vessel Occlusion (LVO) in Anterior Circulation (ICA, M1).
*   **Pre-stroke Function:** mRS 0-1 (Independent).
*   **Time:** 0 - 24 hours from Last Known Well.

## Selection Criteria by Time Window
1.  **Early Window (0 - 6 Hours):**
    *   NCCT **ASPECTS >= 6** (Small core infarct).
    *   *New Evidence:* **Large Core** (ASPECTS 3-5 or Core > 50cc) now shown to benefit (SELECT2, ANGEL-ASPECT, RESCUE-Japan trials).
2.  **Late Window (6 - 24 Hours):**
    *   Must meet **DAWN** or **DEFUSE-3** criteria.
    *   Requires CTP or MRI to demonstrate **Clinical-Core Mismatch** (small core, large clinical deficit/penumbra).

## Posterior Circulation & Distal Occlusions
*   **Basilar Artery Occlusion:** Strong evidence for EVT up to 24 hours (ATTENTION, BAOCHE trials).
*   **Distal/Medium Vessel:** M2/M3 MCA branches, ACA, and PCA occlusions are increasingly treated based on technical feasibility and deficit severity.

## Procedural Management
*   **Bridging Therapy:** Administer IV Thrombolytic (tPA/TNK) if eligible. **Do not delay** transport to angio suite to wait for lytic effect.
*   **Anesthesia:** Conscious sedation preferred to monitor neuro status, unless airway unprotected or patient agitated (then GETA).
*   **BP Goals:** Avoid hypotension. Maintain SBP > 140 mmHg typically to support collaterals until reperfusion.
*   **Intracranial Atherosclerosis (ICAD):** If underlying stenosis found (common in Asian populations), may require angioplasty/stenting and antiplatelet load (e.g., Tirofiban/Aspirin).

## Complications to Monitor
*   **Reperfusion Injury:** Hemorrhagic transformation (monitor BP strict < 140-160 post-procedure depending on recanalization status).
*   **Groin:** Hematoma, retroperitoneal bleed.
*   **Vessel:** Dissection, perforation, embolization to new territory.
`
  },
  'acute-stroke-mgmt': {
    id: 'acute-stroke-mgmt',
    title: 'Acute Management of LVO Stroke',
    category: 'Vascular Neurology',
    content: `
## 1. Thrombectomy Selection (EVT)
Candidacy for Endovascular Thrombectomy (EVT) has expanded significantly:
*   **Late Window (6-24h):** Based on DAWN/DEFUSE-3 trials (Perfusion mismatch).
*   **Large Core Infarcts:** Now eligible based on SELECT2/ANGEL-ASPECT (ASPECTS 3-5).
*   **Distal Occlusions:** Considered based on technical feasibility and deficit severity.

## 2. Neurocritical ICU Monitoring
After admission to the Neuro-ICU, the primary goal is preventing secondary injury.
*   **Neurologic Exams:** Performed every 15 minutes immediately post-EVT, then spaced to every 1-2 hours by 8 hours post-procedure.
*   **Hemodynamics:** Avoid excessive BP variability. For non-recanalized patients, permissive hypertension (up to 220 mmHg systolic) may be reasonable to support the penumbra.
*   **Metabolic Targets:**
    *   **Glucose:** Maintain between 140 mg/dL and 180 mg/dL (See [SHINE Trial Pearls](/guide/shine-trial)). Meticulously avoid hypoglycemia (< 60 mg/dL).
    *   **Temperature:** Aggressively treat hyperthermia (> 37.5°C) to prevent exacerbation of the ischemic cascade.

## 3. Post-Thrombectomy Complications
*   **Access Site:** Monitor for groin hematoma, retroperitoneal bleed, or distal limb ischemia (especially with femoral access).
*   **Cerebral Edema:** "Malignant cerebral edema" carries 80% mortality if untreated. 
    *   *Risk Factors:* [NIHSS](/calculators/nihss) > 20, carotid T occlusion, early CT hypodensity.
    *   *Management:* HOB > 30°, hyperosmolar therapy (Mannitol/Hypertonic Saline), and early consideration for **Hemicraniectomy** within 24-48h for patients < 60 years.
*   **Hemorrhagic Transformation:** Classified by the Heidelberg scale (HI1/2, PH1/2). PH2 (mass effect) carries the worst 90-day prognosis.

## 4. Secondary Prevention & Rehabilitation
*   **Secondary Stroke Prevention:** Perform protocolized evaluation for etiology (Atrial Fibrillation, Carotid Disease, ICAD). 
*   **Antithrombotics:** Decisions on initiation (Aspirin/Anticoagulation) must balance existing ischemic damage against the risk of hemorrhage.
*   **Early Mobilization:** While bedrest is often favored for 24h post-EVT, interprofessional rehab (PT/OT/SLP) should be initiated early to optimize independence.
`
  },
  'hemorrhagic-stroke': {
    id: 'hemorrhagic-stroke',
    title: 'Hemorrhagic Stroke & ICH',
    category: 'Vascular Neurology',
    content: ``
  },
  'anticoagulation-reversal': {
    id: 'anticoagulation-reversal',
    title: 'Anticoagulation Reversal',
    category: 'Vascular Neurology',
    content: ``
  },

  // --- NEUROCRITICAL CARE ---
  'icp-mgmt': {
    id: 'icp-mgmt',
    title: 'Management of Increased ICP',
    category: 'Neurocritical Care',
    content: ``
  },
  'sah-mgmt': {
    id: 'sah-mgmt',
    title: 'Aneurysmal SAH Management',
    category: 'Neurocritical Care',
    content: ``
  },
  'hypoxic-brain': {
    id: 'hypoxic-brain',
    title: 'Hypoxic Brain Injury & Brain Death',
    category: 'Neurocritical Care',
    content: ``
  },

  // --- EPILEPSY ---
  'status-epilepticus': {
    id: 'status-epilepticus',
    title: 'Management of Status Epilepticus',
    category: 'Epilepsy',
    content: `
## Definition (ILAE 2015)
Status Epilepticus (SE) is defined by two operational time points:
*   **T1 (Time to Treatment):** 5 minutes for convulsive SE. Seizures are unlikely to stop spontaneously; start treatment.
*   **T2 (Time to Damage):** 30 minutes for convulsive SE. Risk of long-term neuronal injury; seizure must be controlled.

**Classification:**
*   **Convulsive SE:** Prominent motor symptoms.
*   **Non-convulsive SE (NCSE):** EEG evidence of seizures without prominent motor signs (coma, confusion).
*   **Refractory SE:** Persists despite 2 appropriate medications (Benzo + AED).
*   **Super-Refractory SE:** Persists > 24h despite anesthesia.

## Phase I: Initial Therapy (0-10 min)
**Goal:** Stop the seizure immediately. Benzodiazepines are the cornerstone. Underdosing is the most common cause of failure.

### Preferred Agents (Choose One)
*   **Lorazepam (Ativan)**
    *   **Dose:** 4 mg IV (0.1 mg/kg)
    *   *Note:* May repeat once. Preferred IV agent.
*   **Midazolam (Versed)**
    *   **Dose:** 10 mg IM (>40kg) or 5 mg IM (<40kg)
    *   **Note:* First line for pre-hospital or no IV access.
*   **Diazepam (Valium)**
    *   **Dose:** 10 mg IV (0.15 mg/kg)

**Pearls:**
*   Do not delay for EEG.
*   Support ABCs.
*   Check glucose (Give Thiamine 100mg + D50 if < 60 mg/dL).

## Phase II: Urgent Control (10-30 min)
**Goal:** Prevent recurrence. Start immediately if seizure persists after Phase I.
**Evidence:** The ESETT Trial (2019) showed Levetiracetam, Fosphenytoin, and Valproate are equally effective (~50% cessation).

### Preferred Agents (Choose One)
*   **Levetiracetam (Keppra)**
    *   **Dose:** 60 mg/kg IV (Max 4500 mg)
    *   **Infusion:** Over 15 min.
*   **Fosphenytoin (Cerebyx)**
    *   **Dose:** 20 mg PE/kg IV (Max 1500 mg PE)
    *   **Infusion:** Up to 150 mg/min. Cardiac monitoring required.
*   **Valproic Acid (Depacon)**
    *   **Dose:** 40 mg/kg IV (Max 3000 mg)
    *   **Infusion:** Over 10 min. (Avoid in liver disease/pregnancy).

**Alternative:**
*   **Phenobarbital:** 15 mg/kg IV. (Risk of hypotension/respiratory depression).

## Phase III: Refractory Management (30-60 min)
**Goal:** Suppress seizure activity with anesthetic infusions. Intubation usually required.
**Monitoring:** Continuous EEG is mandatory to titrate to seizure suppression or burst suppression.

### Continuous Infusions
*   **Midazolam**
    *   **Load:** 0.2 mg/kg
    *   **Maintenance:** 0.1 - 2 mg/kg/hr
*   **Propofol**
    *   **Load:** 1-2 mg/kg
    *   **Maintenance:** 20 - 200 mcg/kg/min (Watch for PRIS)
*   **Ketamine**
    *   **Load:** 1.5 - 4.5 mg/kg
    *   **Maintenance:** 1 - 10 mg/kg/hr (Hemodynamically stable; NMDA antagonist)
*   **Pentobarbital**
    *   **Load:** 5-15 mg/kg
    *   **Maintenance:** 0.5 - 5 mg/kg/hr (Hypotension common)

## Phase IV: Super-Refractory (> 24 hrs)
If seizures persist despite 24 hours of anesthesia:
*   **Ketamine:** Add if not already used.
*   **Immunotherapy:** Consider empiric High-Dose Steroids (Methylprednisolone 1g x 3-5d) or IVIG if suspicion of **NORSE** (New-Onset Refractory Status Epilepticus).
*   **Other:** Ketogenic diet, Vagus Nerve Stimulation (VNS), Hypothermia (mixed evidence).

## Diagnostic Workup
*   **Stat:** Fingerstick Glucose, Electrolytes (Ca, Mg, Phos), AED levels, Toxicology.
*   **Imaging:** CT Head (Acute), MRI Brain (Etiology).
*   **LP:** If febrile or immunocompromised.
*   **Etiologies to Rule Out:** Stroke, Trauma, Infection, Metabolic (Na, Glucose, Uremia), drug withdrawal/toxicity, Autoimmune Encephalitis.
`
  },

  // --- INFECTIOUS & GENERAL WORKUP ---
  'meningitis': {
    id: 'meningitis',
    title: 'Meningitis',
    category: 'Infectious Disease',
    content: ``
  },
  'workups': {
    id: 'workups',
    title: 'General Neurology Workups',
    category: 'General Neurology',
    content: ``
  },
  'dementia-workup': {
    id: 'dementia-workup',
    title: 'Dementia Workup',
    category: 'Cognitive Neurology',
    content: ``
  },
  
  // --- NEUROMUSCULAR & IMMUNOLOGY ---
  'myasthenia-gravis': {
    id: 'myasthenia-gravis',
    title: 'Myasthenia Gravis',
    category: 'Neuromuscular',
    content: ``
  },
  'gbs': {
    id: 'gbs',
    title: 'Guillain-Barre Syndrome',
    category: 'Neuromuscular',
    content: ``
  },
  'multiple-sclerosis': {
    id: 'multiple-sclerosis',
    title: 'Multiple Sclerosis',
    category: 'Neuroimmunology',
    content: ``
  }
};