/**
 * Medical Glossary
 * 
 * Dictionary of medical terms, statistical measures, and clinical concepts
 * used throughout NeuroWiki. Terms are matched case-insensitively.
 * 
 * To add a new term:
 * 1. Add entry: 'term-key': 'Definition text...'
 * 2. Use kebab-case for keys (e.g., 'p-value', 'odds-ratio')
 * 3. Keep definitions concise but informative (1-2 sentences)
 * 4. Use plain language when possible
 */

export const MEDICAL_GLOSSARY: Record<string, string> = {
  // Statistical measures
  'p-value': 'Probability the result occurred by chance. p < 0.05 means less than 5% chance it\'s due to luck. Lower p-values indicate stronger evidence.',
  'p value': 'Probability the result occurred by chance. p < 0.05 means less than 5% chance it\'s due to luck. Lower p-values indicate stronger evidence.',
  'odds-ratio': 'Odds of outcome in treatment group vs control. OR = 1 means no difference. OR > 1 means treatment increases odds of outcome. OR = 1.61 means 61% higher odds of good outcome with treatment.',
  'odds ratio': 'Odds of outcome in treatment group vs control. OR = 1 means no difference. OR > 1 means treatment increases odds of outcome. OR = 1.61 means 61% higher odds of good outcome with treatment.',
  // Note: 'or' removed to avoid false positives with the conjunction "or"
  // Use 'odds-ratio' or 'odds ratio' instead. OR abbreviation should be matched contextually.
  'confidence-interval': 'Range where the true value likely falls. 95% CI means 95% confidence the real effect is within this range. If CI crosses 1.0, result may not be significant.',
  'confidence interval': 'Range where the true value likely falls. 95% CI means 95% confidence the real effect is within this range. If CI crosses 1.0, result may not be significant.',
  'ci': 'Confidence Interval: Range where the true value likely falls. 95% CI means 95% confidence the real effect is within this range.',
  'nnt': 'Number Needed to Treat. How many patients must be treated for one additional patient to benefit. Lower is better. NNT = 9 means treat 9 patients for 1 extra good outcome.',
  'number needed to treat': 'How many patients must be treated for one additional patient to benefit. Lower is better. NNT = 9 means treat 9 patients for 1 extra good outcome.',
  'hazard-ratio': 'Similar to relative risk but accounts for when events occur over time. HR < 1 means treatment reduces risk. HR = 0.68 means 32% risk reduction.',
  'hazard ratio': 'Similar to relative risk but accounts for when events occur over time. HR < 1 means treatment reduces risk. HR = 0.68 means 32% risk reduction.',
  'hr': 'Hazard Ratio: Similar to relative risk but accounts for when events occur over time. HR < 1 means treatment reduces risk.',
  
  // Outcome measures
  'mrs': 'Modified Rankin Scale: 0-6 scale measuring stroke disability. 0=no symptoms, 1=minor symptoms (independent), 2=slight disability (independent), 3=moderate disability (needs help), 4=moderately severe (can\'t walk/care for self), 5=severe (bedridden), 6=dead.',
  'modified rankin scale': '0-6 scale measuring stroke disability. 0=no symptoms, 1=minor symptoms (independent), 2=slight disability (independent), 3=moderate disability (needs help), 4=moderately severe (can\'t walk/care for self), 5=severe (bedridden), 6=dead.',
  'mrs-0-1': 'Excellent outcome: No symptoms (0) or minor symptoms with full independence (1).',
  'mrs 0-1': 'Excellent outcome: No symptoms (0) or minor symptoms with full independence (1).',
  'mrs-0-2': 'Functional independence: Patient can live alone and handle daily activities without assistance.',
  'mrs 0-2': 'Functional independence: Patient can live alone and handle daily activities without assistance.',
  'mrs-0-3': 'Good functional status: Patient can walk and perform daily activities, though may need some assistance.',
  'mrs 0-3': 'Good functional status: Patient can walk and perform daily activities, though may need some assistance.',
  'nihss': 'NIH Stroke Scale: 0-42 scale measuring stroke severity. 0=no symptoms, 1-4=minor, 5-15=moderate, 16-20=moderate-severe, 21-42=severe.',
  'nih stroke scale': '0-42 scale measuring stroke severity. 0=no symptoms, 1-4=minor, 5-15=moderate, 16-20=moderate-severe, 21-42=severe.',
  'sample-size': 'Total number of patients enrolled and randomized in the study.',
  'sample size': 'Total number of patients enrolled and randomized in the study.',
  'primary-endpoint': 'The main outcome measure used to determine if the treatment works.',
  'primary endpoint': 'The main outcome measure used to determine if the treatment works.',
  'effect-size': 'Raw percentage difference between treatment and control groups. Shows how many extra patients out of 100 benefit from treatment.',
  'effect size': 'Raw percentage difference between treatment and control groups. Shows how many extra patients out of 100 benefit from treatment.',
  'statistically-significant': 'Result is unlikely due to chance alone (typically p < 0.05).',
  'statistically significant': 'Result is unlikely due to chance alone (typically p < 0.05).',
  
  // Safety outcomes
  'sich': 'Symptomatic Intracranial Hemorrhage: Brain bleed causing neurological worsening. Most feared complication of stroke treatment.',
  'symptomatic intracranial hemorrhage': 'Brain bleed causing neurological worsening. Most feared complication of stroke treatment.',
  'symptomatic ich': 'Brain bleed causing neurological worsening. Most feared complication of stroke treatment.',
  'ph2': 'Parenchymal Hemorrhage Type 2: Large brain bleed (>30% of infarct) with mass effect. Worst type of hemorrhagic transformation.',
  'parenchymal hemorrhage type 2': 'Large brain bleed (>30% of infarct) with mass effect. Worst type of hemorrhagic transformation.',
  'hemorrhagic-transformation': 'Bleeding into infarcted brain tissue. Ranges from petechial (tiny spots) to large hemorrhage.',
  'hemorrhagic transformation': 'Bleeding into infarcted brain tissue. Ranges from petechial (tiny spots) to large hemorrhage.',
  'sae': 'Serious Adverse Event: Life-threatening event, requires hospitalization, or causes death/disability.',
  'serious adverse event': 'Life-threatening event, requires hospitalization, or causes death/disability.',
  
  // Trial design
  'rct': 'Randomized Controlled Trial: Gold standard study design. Patients randomly assigned to treatment or control to eliminate bias.',
  'randomized controlled trial': 'Gold standard study design. Patients randomly assigned to treatment or control to eliminate bias.',
  'double-blind': 'Neither patients nor doctors know who got treatment vs placebo until study ends, preventing bias.',
  'double blind': 'Neither patients nor doctors know who got treatment vs placebo until study ends, preventing bias.',
  'placebo-controlled': 'Control group receives inactive treatment (placebo) to isolate the true effect of the drug.',
  'placebo controlled': 'Control group receives inactive treatment (placebo) to isolate the true effect of the drug.',
  'open-label': 'Everyone knows who got which treatment. Less rigorous than blinded studies but sometimes necessary.',
  'open label': 'Everyone knows who got which treatment. Less rigorous than blinded studies but sometimes necessary.',
  'multicenter': 'Conducted at multiple hospitals/sites. Increases generalizability and enrollment speed.',
  'itt': 'Intention-to-Treat: Analyzes all randomized patients in their assigned groups, even if they didn\'t complete treatment.',
  'intention-to-treat': 'Analyzes all randomized patients in their assigned groups, even if they didn\'t complete treatment.',
  'probe': 'Prospective Randomized Open Blinded Endpoint: Patients/doctors know treatment but outcome assessors are blinded.',
  
  // Imaging terms
  'aspects': 'Alberta Stroke Program Early CT Score: 10-point score. ASPECTS 10=normal, 0=massive stroke. ASPECTS ≥6 generally needed for treatment.',
  'alberta stroke program early ct score': '10-point score. ASPECTS 10=normal, 0=massive stroke. ASPECTS ≥6 generally needed for treatment.',
  'ncct': 'Non-Contrast CT: Regular brain CT without dye. Fast, rules out hemorrhage, shows early ischemic changes.',
  'non-contrast ct': 'Regular brain CT without dye. Fast, rules out hemorrhage, shows early ischemic changes.',
  'cta': 'CT Angiography: CT with IV contrast to see blood vessels. Identifies clot location.',
  'ct angiography': 'CT with IV contrast to see blood vessels. Identifies clot location.',
  'ctp': 'CT Perfusion: Advanced CT measuring blood flow. Estimates core (dead tissue) and penumbra (salvageable tissue).',
  'ct perfusion': 'Advanced CT measuring blood flow. Estimates core (dead tissue) and penumbra (salvageable tissue).',
  'dwi': 'Diffusion-Weighted Imaging: MRI sequence showing acute stroke as bright signal.',
  'diffusion-weighted imaging': 'MRI sequence showing acute stroke as bright signal.',
  'flair': 'Fluid-Attenuated Inversion Recovery: MRI sequence. Bright signal appears hours after stroke.',
  'fluid-attenuated inversion recovery': 'MRI sequence. Bright signal appears hours after stroke.',
  'dwi-flair-mismatch': 'MRI pattern suggesting stroke occurred recently (< 4.5 hours). DWI shows new stroke, FLAIR doesn\'t yet.',
  'dwi flair mismatch': 'MRI pattern suggesting stroke occurred recently (< 4.5 hours). DWI shows new stroke, FLAIR doesn\'t yet.',
  'mismatch-ratio': 'Penumbra ÷ Core. Ratio ≥1.8 identifies candidates for late-window thrombectomy.',
  'mismatch ratio': 'Penumbra ÷ Core. Ratio ≥1.8 identifies candidates for late-window thrombectomy.',
  'core-infarct': 'Size of already-dead brain tissue on imaging. Cannot be saved with treatment.',
  'core infarct': 'Size of already-dead brain tissue on imaging. Cannot be saved with treatment.',
  'penumbra': 'At-risk brain tissue that can still be rescued with treatment.',
  
  // Stroke-specific
  'lvo': 'Large Vessel Occlusion: Blockage in major brain artery (ICA, M1, M2). More severe strokes.',
  'large vessel occlusion': 'Blockage in major brain artery (ICA, M1, M2). More severe strokes.',
  'lkw': 'Last Known Well: Last time patient was at neurological baseline. Start of treatment time window.',
  'last known well': 'Last time patient was at neurological baseline. Start of treatment time window.',
  'wake-up-stroke': 'Stroke discovered upon awakening. ~25% of strokes. Time of onset unknown.',
  'wake-up stroke': 'Stroke discovered upon awakening. ~25% of strokes. Time of onset unknown.',
  'bridging-therapy': 'Giving IV thrombolysis (tPA) before/during thrombectomy.',
  'bridging therapy': 'Giving IV thrombolysis (tPA) before/during thrombectomy.',
  'tici': 'Modified Thrombolysis in Cerebral Infarction score measures how well blood flow was restored: TICI 0 = No reperfusion, TICI 1 = Minimal reperfusion, TICI 2a = Partial reperfusion (<50%), TICI 2b = Substantial reperfusion (50-89%) - THRESHOLD FOR SUCCESS, TICI 2c = Near-complete reperfusion (90-99%), TICI 3 = Complete reperfusion. DISTAL achieved TICI 2b-3 in only 71.7% - notably LOWER than large-vessel trials (85-90%).',
  'thrombolysis in cerebral infarction': 'Modified Thrombolysis in Cerebral Infarction score measures how well blood flow was restored: TICI 0 = No reperfusion, TICI 1 = Minimal reperfusion, TICI 2a = Partial reperfusion (<50%), TICI 2b = Substantial reperfusion (50-89%) - THRESHOLD FOR SUCCESS, TICI 2c = Near-complete reperfusion (90-99%), TICI 3 = Complete reperfusion.',
  'tici-score': 'Modified Thrombolysis in Cerebral Infarction score measures how well blood flow was restored: TICI 0 = No reperfusion, TICI 1 = Minimal reperfusion, TICI 2a = Partial reperfusion (<50%), TICI 2b = Substantial reperfusion (50-89%) - THRESHOLD FOR SUCCESS, TICI 2c = Near-complete reperfusion (90-99%), TICI 3 = Complete reperfusion.',
  'medium-vessel': 'Medium vessels are smaller branches of major cerebral arteries. In DISTAL, these included: M2 (non-dominant branch of MCA), M3/M4 (even smaller MCA branches), A1/A2/A3 (anterior cerebral artery segments), P1/P2/P3 (posterior cerebral artery segments). These are MUCH smaller and harder to reach than M1 or basilar artery. Unlike large vessels, they often lack good collateral blood flow.',
  'medium vessel': 'Medium vessels are smaller branches of major cerebral arteries. In DISTAL, these included: M2 (non-dominant branch of MCA), M3/M4 (even smaller MCA branches), A1/A2/A3 (anterior cerebral artery segments), P1/P2/P3 (posterior cerebral artery segments). These are MUCH smaller and harder to reach than M1 or basilar artery. Unlike large vessels, they often lack good collateral blood flow.',
  'distal-vessel': 'Distal vessels are the smallest branches of cerebral arteries, furthest from the main trunk. Examples include M3/M4 segments of MCA, A2/A3 of ACA, P2/P3 of PCA. These vessels are technically challenging to access with catheters and often have poor collateral blood supply ("end arteries"), making them less tolerant of treatment delays.',
  'distal vessel': 'Distal vessels are the smallest branches of cerebral arteries, furthest from the main trunk. Examples include M3/M4 segments of MCA, A2/A3 of ACA, P2/P3 of PCA. These vessels are technically challenging to access with catheters and often have poor collateral blood supply ("end arteries"), making them less tolerant of treatment delays.',
  'common-odds-ratio': 'Measures shift across ALL mRS levels (not just good vs bad outcome). An odds ratio of: >1.0 = treatment group had better outcomes, 1.0 = identical outcomes, <1.0 = treatment group had worse outcomes. DISTAL found OR=0.90 (95% CI: 0.67-1.22). Because the confidence interval crosses 1.0 and the result is not significant, we conclude EVT has NO effect.',
  'common odds ratio': 'Measures shift across ALL mRS levels (not just good vs bad outcome). An odds ratio of: >1.0 = treatment group had better outcomes, 1.0 = identical outcomes, <1.0 = treatment group had worse outcomes. DISTAL found OR=0.90 (95% CI: 0.67-1.22). Because the confidence interval crosses 1.0 and the result is not significant, we conclude EVT has NO effect.',
  'ordinal-analysis': 'Analyzes outcomes across ALL levels of a scale (e.g., mRS 0-6), not just "good vs bad". More sensitive than binary outcomes. DISTAL used ordinal analysis of mRS shift, finding no difference across any disability level.',
  'mrs-shift': 'Ordinal analysis measuring improvement across ALL mRS levels (0-6), not just "good vs bad". More sensitive than binary outcomes. DISTAL found no shift favoring EVT across any disability level.',
  'door-to-needle': 'Time from hospital arrival to starting IV tPA. Goal <60 minutes.',
  'door to needle': 'Time from hospital arrival to starting IV tPA. Goal <60 minutes.',
  
  // Treatments
  'alteplase': 'IV clot-busting drug. Standard thrombolytic for stroke. Dose: 0.9 mg/kg (max 90mg).',
  'tpa': 'Tissue Plasminogen Activator (Alteplase): IV clot-busting drug. Standard thrombolytic for stroke.',
  'tenecteplase': 'Newer IV thrombolytic. Single bolus. Non-inferior to alteplase.',
  'dapt': 'Dual Antiplatelet Therapy: Two antiplatelet drugs (aspirin + clopidogrel) for 21 days after minor stroke/TIA.',
  'dual antiplatelet therapy': 'Two antiplatelet drugs (aspirin + clopidogrel) for 21 days after minor stroke/TIA.',
  'stent-retriever': 'Wire mesh device deployed in clot, then pulled out. Primary thrombectomy technique.',
  'stent retriever': 'Wire mesh device deployed in clot, then pulled out. Primary thrombectomy technique.',
  'thrombectomy': 'Mechanical removal of blood clot from brain artery using catheter-based devices.',
  'evt': 'Endovascular Thrombectomy: Mechanical removal of blood clot from brain artery using catheter-based devices.',
  'endovascular thrombectomy': 'Mechanical removal of blood clot from brain artery using catheter-based devices.',
};

/**
 * Get definition for a medical term (case-insensitive)
 * @param term - The medical term to look up
 * @returns Definition string or undefined if not found
 */
export const getMedicalDefinition = (term: string): string | undefined => {
  const normalized = term.toLowerCase().trim();
  return MEDICAL_GLOSSARY[normalized];
};

/**
 * Check if a term exists in the glossary
 * @param term - The medical term to check
 * @returns True if term exists in glossary
 */
export const hasMedicalDefinition = (term: string): boolean => {
  return getMedicalDefinition(term) !== undefined;
};
