export type LegendCategory =
  | 'recommendation-class'
  | 'level-of-evidence'
  | 'statistical-measure'
  | 'trial-design'
  | 'outcome-scale';

export interface LegendEntry {
  id: string;
  term: string;
  category: LegendCategory;
  categoryLabel: string;
  definition: string;
  example?: string;
  aliases?: string[];
}

export const LEGEND_TERMS: Record<string, LegendEntry> = {
  'cor-1': {
    id: 'cor-1',
    term: 'COR 1 / Class I',
    category: 'recommendation-class',
    categoryLabel: 'Recommendation Class',
    definition: 'Strong recommendation. The benefit substantially outweighs the risk. Should be performed or administered.',
  },
  'cor-2a': {
    id: 'cor-2a',
    term: 'COR 2a / Class IIa',
    category: 'recommendation-class',
    categoryLabel: 'Recommendation Class',
    definition: 'Moderate recommendation. Benefit likely outweighs risk. Reasonable to perform or administer.',
  },
  'cor-2b': {
    id: 'cor-2b',
    term: 'COR 2b / Class IIb',
    category: 'recommendation-class',
    categoryLabel: 'Recommendation Class',
    definition: 'Weak recommendation. Benefit may outweigh risk. May be considered but not firmly established.',
  },
  'cor-3-no-benefit': {
    id: 'cor-3-no-benefit',
    term: 'COR 3: No Benefit / Class III',
    category: 'recommendation-class',
    categoryLabel: 'Recommendation Class',
    definition: 'Evidence shows the intervention provides no benefit. Not recommended.',
  },
  'cor-3-harm': {
    id: 'cor-3-harm',
    term: 'COR 3: Harm / Class III Harm',
    category: 'recommendation-class',
    categoryLabel: 'Recommendation Class',
    definition: 'Evidence shows net harm. Contraindicated in most circumstances.',
  },
  'loe-a': {
    id: 'loe-a',
    term: 'LOE A',
    category: 'level-of-evidence',
    categoryLabel: 'Level of Evidence',
    definition: 'Multiple well-designed randomized controlled trials or meta-analyses of high-quality RCTs. Highest evidence quality.',
  },
  'loe-b-r': {
    id: 'loe-b-r',
    term: 'LOE B-R',
    category: 'level-of-evidence',
    categoryLabel: 'Level of Evidence',
    definition: 'A single well-designed RCT or meta-analysis of moderate-quality RCTs.',
  },
  'loe-b-nr': {
    id: 'loe-b-nr',
    term: 'LOE B-NR',
    category: 'level-of-evidence',
    categoryLabel: 'Level of Evidence',
    definition: 'Well-designed non-randomized studies such as cohorts, observational studies, or registries.',
  },
  'loe-c-ld': {
    id: 'loe-c-ld',
    term: 'LOE C-LD',
    category: 'level-of-evidence',
    categoryLabel: 'Level of Evidence',
    definition: 'Limited data from small studies, retrospective analyses, or registries with methodological limitations.',
  },
  'loe-c-eo': {
    id: 'loe-c-eo',
    term: 'LOE C-EO',
    category: 'level-of-evidence',
    categoryLabel: 'Level of Evidence',
    definition: 'Expert opinion or standard of care based on clinical experience, without formal study data.',
  },
  'p-value': {
    id: 'p-value',
    term: 'p-value',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'Probability the result occurred by chance. Below 0.05 (5%) is the conventional significance threshold. A smaller p means stronger evidence against chance.',
  },
  'confidence-interval': {
    id: 'confidence-interval',
    term: '95% CI',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: '95% Confidence Interval. The range within which the true effect likely falls. If the CI crosses 1.0 for ratios or 0 for differences, the result is not statistically significant.',
  },
  'hr': {
    id: 'hr',
    term: 'HR (Hazard Ratio)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'Ratio of event rates over time between two groups. HR < 1 favors the treatment arm.',
    example: 'HR 0.68 means 32% lower risk of the event with treatment.',
  },
  'or': {
    id: 'or',
    term: 'OR (Odds Ratio)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'Ratio of odds of an outcome between groups. OR > 1 means higher odds with treatment. Distinct from risk ratio; most accurate in case-control studies.',
  },
  'cor-stat': {
    id: 'cor-stat',
    term: 'cOR (Common Odds Ratio)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'From ordinal logistic regression. Measures shift across all levels of a disability scale (e.g., mRS 0–6), not just a binary cutpoint. cOR > 1 favors treatment.',
  },
  'rr': {
    id: 'rr',
    term: 'RR (Risk Ratio)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'Ratio of outcome rates between groups.',
    example: 'RR = 1.44 means the treatment arm is 1.44 times as likely to achieve the outcome.',
  },
  'arr': {
    id: 'arr',
    term: 'ARR (Absolute Risk Reduction)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'Percentage-point difference in outcome rates between groups. More clinically meaningful than relative measures.',
    example: 'ARR = 11.5% means 11.5 more patients per 100 achieve the outcome with treatment vs. control.',
  },
  'rrr': {
    id: 'rrr',
    term: 'RRR (Relative Risk Reduction)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'ARR expressed as a proportion of the control rate. A large RRR can reflect a small absolute difference; always check the ARR.',
  },
  'nnt': {
    id: 'nnt',
    term: 'NNT (Number Needed to Treat)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'How many patients must be treated to achieve one additional good outcome. Lower is better. Calculated as 100 ÷ ARR (%).',
  },
  'nnh': {
    id: 'nnh',
    term: 'NNH (Number Needed to Harm)',
    category: 'statistical-measure',
    categoryLabel: 'Statistical Measure',
    definition: 'How many patients must be treated to cause one additional adverse outcome. Higher is safer.',
  },
  'noninferiority': {
    id: 'noninferiority',
    term: 'Non-inferiority trial',
    category: 'trial-design',
    categoryLabel: 'Trial Design',
    definition: 'Tests whether treatment A is "at least as good" as treatment B within a pre-specified acceptable margin of difference. Does not prove superiority. Non-inferiority is established when the confidence interval stays entirely within the pre-defined margin.',
  },
  'ordinal-shift': {
    id: 'ordinal-shift',
    term: 'Ordinal shift / mRS shift',
    category: 'trial-design',
    categoryLabel: 'Trial Design',
    definition: 'Analysis of the full disability scale distribution (e.g., mRS 0–6) rather than a single cutpoint. More sensitive to treatment effects across all disability levels than a binary outcome.',
  },
  'bayesian': {
    id: 'bayesian',
    term: 'Bayesian design',
    category: 'trial-design',
    categoryLabel: 'Trial Design',
    definition: 'Statistical framework that incorporates prior probability data into the analysis, producing a "posterior probability of benefit" rather than a p-value. Common in adaptive and platform trials.',
  },
  'rct': {
    id: 'rct',
    term: 'RCT (Randomized Controlled Trial)',
    category: 'trial-design',
    categoryLabel: 'Trial Design',
    definition: 'Patients randomly assigned to treatment or control group. The gold standard for eliminating selection bias.',
  },
  'probe': {
    id: 'probe',
    term: 'PROBE design',
    category: 'trial-design',
    categoryLabel: 'Trial Design',
    definition: 'Prospective Randomized Open Blinded Endpoint. Clinicians and patients know treatment allocation, but outcome assessors are blinded. Common in stroke trials.',
  },
  'superiority': {
    id: 'superiority',
    term: 'Superiority trial',
    category: 'trial-design',
    categoryLabel: 'Trial Design',
    definition: 'Tests whether treatment A is better than treatment B. Requires p < 0.05 and a confidence interval that excludes the null value.',
  },
  'mrs': {
    id: 'mrs',
    term: 'mRS (Modified Rankin Scale)',
    category: 'outcome-scale',
    categoryLabel: 'Outcome Scale',
    definition: '0 = no symptoms; 1 = minor symptoms, fully independent; 2 = slight disability, independent in daily activities; 3 = moderate disability, needs some help; 4 = moderately severe, cannot walk or care for self; 5 = severe disability, bedridden; 6 = dead.',
  },
  'mrs-0-2': {
    id: 'mrs-0-2',
    term: 'mRS 0–2',
    category: 'outcome-scale',
    categoryLabel: 'Outcome Scale',
    definition: 'Functional independence. The patient can live independently and manage most daily activities.',
  },
  'mrs-0-1': {
    id: 'mrs-0-1',
    term: 'mRS 0–1',
    category: 'outcome-scale',
    categoryLabel: 'Outcome Scale',
    definition: 'Excellent neurological outcome. No symptoms or only very minor symptoms with full independence.',
  },
  'nihss': {
    id: 'nihss',
    term: 'NIHSS',
    category: 'outcome-scale',
    categoryLabel: 'Outcome Scale',
    definition: 'NIH Stroke Scale. 0–42 point score measuring stroke severity: 0 = no deficit; 1–4 = minor; 5–15 = moderate; 16–20 = moderate-severe; 21–42 = severe.',
  },
  'aspects': {
    id: 'aspects',
    term: 'ASPECTS',
    category: 'outcome-scale',
    categoryLabel: 'Outcome Scale',
    definition: 'Alberta Stroke Program Early CT Score. 0–10 on non-contrast CT. 10 = normal brain. Each point lost = one ischemic territory. Score ≥6 is generally used to define a small infarct core eligible for thrombolysis; score <3 suggests large established infarction.',
  },
  'tici': {
    id: 'tici',
    term: 'TICI',
    category: 'outcome-scale',
    categoryLabel: 'Outcome Scale',
    definition: 'Thrombolysis in Cerebral Infarction. Reperfusion grading: 0 = no flow; 2b = ≥50% reperfusion (conventional success threshold); 2c = near-complete; 3 = complete reperfusion.',
  },
  'sich': {
    id: 'sich',
    term: 'sICH',
    category: 'outcome-scale',
    categoryLabel: 'Outcome Scale',
    definition: 'Symptomatic Intracranial Hemorrhage. Brain bleed causing measurable neurological worsening. The most feared complication of stroke reperfusion therapy.',
  },
};

export function getLegendEntry(id: string): LegendEntry | undefined {
  return LEGEND_TERMS[id];
}
