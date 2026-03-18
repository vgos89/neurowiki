export interface TrialStats {
  sampleSize: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
  };
  primaryEndpoint: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
  };
  pValue: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
    highlight?: boolean; // For positive/negative highlighting
  };
  effectSize: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
    highlight?: boolean; // For positive/negative highlighting
  };
  absoluteReduction?: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
    highlight?: boolean;
  };
}

export interface TrialDesign {
  type: string[];
  timeline: string;
  sampleSize?: {
    value: string;
    info?: string;
  };
  primaryEndpoint?: {
    value: string;
    info?: string;
  };
  pValue?: {
    value: string;
    info?: string;
  };
  nnt?: {
    value: string;
    info?: string;
  };
}

export interface EfficacyResults {
  treatment: {
    percentage: number;
    label: string;
    name: string;
  };
  control: {
    percentage: number;
    label: string;
    name: string;
  };
}

export interface TrialIntervention {
  treatment: string | {
    name: string;
    description: string;
    details?: string[];
  };
  control: string | {
    name: string;
    description: string;
    details?: string[];
  };
}

export interface TrialCalculations {
  nnt?: number; // Number Needed to Treat
  nntExplanation?: string; // Trial-specific explanation
}

export interface AdditionalResults {
  recurrentStroke?: {
    early: number;
    later: number;
    label: string;
  };
  symptomaticICH?: {
    early: number;
    later: number;
    label: string;
  };
}

export interface ProceduralDetails {
  reperfusionRate?: {
    value: string;
    label: string;
    tooltip?: string;
    color?: 'warning' | 'success' | 'danger';
  };
  imagingToPuncture?: {
    value: string;
    label: string;
    tooltip?: string;
    color?: 'warning' | 'success' | 'danger';
  };
}

export interface SafetyProfile {
  mortality?: {
    evt: number;
    control: number;
    label: string;
    tooltip?: string;
  };
  sICH?: {
    evt: number;
    control: number;
    label: string;
    tooltip?: string;
    color?: 'warning' | 'success' | 'danger';
  };
}

export interface TrialMetadata {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  stats: TrialStats;
  trialDesign: TrialDesign;
  efficacyResults: EfficacyResults;
  intervention: TrialIntervention;
  clinicalContext: string;
  pearls: string[];
  conclusion: string;
  source: string;
  clinicalTrialsId?: string;
  calculations?: TrialCalculations; // Trial-specific calculations (NNT, etc.)
  additionalResults?: AdditionalResults; // Additional outcome data (e.g., ELAN)
  specialDesign?: string; // Special trial design (e.g., 'estimation-trial', 'non-inferiority', 'negative-trial')
  keyMessage?: string; // Key clinical takeaway message
  trialResult?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; // Overall trial result
  proceduralDetails?: ProceduralDetails; // Procedural/technical details
  safetyProfile?: SafetyProfile; // Safety outcomes
  doi?: string; // DOI for the publication
  pmid?: string; // PubMed ID
  limitations?: string[]; // Study limitations
  clinicalApplication?: string; // How to apply in practice (can be detailed text)
  safetyData?: string; // Detailed safety information
  educationalContext?: string; // Extended educational content (why it worked, etc.)
  /** Category shown on the /trials listing page. Set this on every new trial to auto-register it. */
  listCategory?: 'thrombolysis' | 'thrombectomy' | 'antiplatelets' | 'carotid' | 'acute';
  /** One-line resident-focused blurb shown on the /trials listing page. Falls back to truncated clinicalContext if omitted. */
  listDescription?: string;
}

export const TRIAL_DATA: Record<string, TrialMetadata> = {
  'ninds-trial': {
    id: 'ninds-trial',
    title: 'NINDS Trial',
    subtitle: 'IV tPA for Acute Ischemic Stroke (0-3 Hours)',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '624',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.05',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '15.4%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Two-part randomized controlled trial',
        'Double-blind, placebo-controlled',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled 1991-1994'
    },
    efficacyResults: {
      treatment: {
        percentage: 42.6,
        label: 'Minimal disability (mRS 0-1) at 3 months',
        name: 'tPA Group'
      },
      control: {
        percentage: 27.2,
        label: 'Minimal disability (mRS 0-1) at 3 months',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: 'IV Alteplase (0.9 mg/kg, max 90 mg)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'The NINDS tPA Stroke Study established intravenous alteplase (tPA) as the first FDA-approved treatment for acute ischemic stroke.',
    calculations: {
      nnt: 6.5, // 1 / (0.426 - 0.272) = 6.5
      nntExplanation: 'For every 6.5 patients treated with tPA, one additional patient achieves minimal disability (mRS 0-1) compared to placebo'
    },
    pearls: [
      'Time is Brain: Established the 3-hour window',
      'Safety Trade-off: Significantly improved functional outcomes at the cost of a ~6% risk of symptomatic hemorrhage, but with no increase in overall mortality',
      'BP Control: Strict blood pressure control (< 185/110 mmHg) was mandatory and remains a cornerstone of safety',
      'Odds Ratio: 1.7 (95% CI 1.2–2.6) for favorable outcome',
      'Mortality: No significant difference in mortality at 3 months (17% vs 21%)'
    ],
    conclusion: '',
    source: 'The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group (NEJM 1995)',
    clinicalTrialsId: 'NCT00000292',
    listCategory: 'thrombolysis',
    listDescription: 'Foundational trial establishing IV tPA within 3 hours; 42.6% vs 27.2% favorable outcome.',
  },
  'original-trial': {
    id: 'original-trial',
    title: 'ORIGINAL Trial',
    subtitle: 'Tenecteplase vs Alteplase for Acute Ischemic Stroke (0–4.5 Hours)',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    stats: {
      sampleSize: {
        value: '1,465',
        label: 'Patients (Full Analysis Set)'
      },
      primaryEndpoint: {
        value: 'mRS 0–1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'Non-inf',
        label: 'Margin Met (RR 0.937)'
      },
      effectSize: {
        value: '72.7% vs 70.3%',
        label: 'TNK vs Alteplase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label blinded-endpoint (PROBE) trial',
        'Active-controlled noninferiority design',
        '1:1 allocation (Tenecteplase 0.25 mg/kg vs Alteplase 0.9 mg/kg)',
        '55 neurology clinics and stroke centers in China'
      ],
      timeline: 'Enrolled July 2021 – July 2023'
    },
    efficacyResults: {
      treatment: {
        percentage: 72.7,
        label: 'Excellent outcome (mRS 0–1) at 90 days',
        name: 'Tenecteplase Group (n=732)'
      },
      control: {
        percentage: 70.3,
        label: 'Excellent outcome (mRS 0–1) at 90 days',
        name: 'Alteplase Group (n=733)'
      }
    },
    intervention: {
      treatment: 'IV Tenecteplase 0.25 mg/kg (max 25 mg) — single IV bolus over 5–10 seconds',
      control: 'IV Alteplase 0.9 mg/kg (max 90 mg) — 10% bolus + 60-minute infusion'
    },
    clinicalContext: 'Tenecteplase is a bioengineered variant of alteplase with greater fibrin specificity, longer half-life, and resistance to plasminogen activator inhibitor-1 — allowing single-bolus dosing. Prior trials (NOR-TEST, AcT) had shown mixed results. ORIGINAL tested noninferiority in a large Chinese population, directly comparing both agents head-to-head within the 4.5-hour thrombolysis window.',
    calculations: {
      nnt: null,
      nntExplanation: 'Noninferiority trial — NNT is not the primary framing. Tenecteplase was noninferior to alteplase (RR 1.03, 95% CI 0.97–1.09; noninferiority threshold of RR ≥0.937 met).'
    },
    pearls: [
      'Noninferiority confirmed: RR 1.03 (95% CI 0.97–1.09) — noninferiority margin of 0.937 met',
      'Symptomatic ICH (ECASS III definition): 1.2% in both groups (RR 1.01, 95% CI 0.37–2.70) — identical safety profiles',
      '90-day mortality: 4.6% (TNK) vs 5.8% (alteplase) — numerically lower with TNK but not statistically significant (RR 0.80, 95% CI 0.51–1.23)',
      'Single-bolus advantage: Tenecteplase eliminates the 60-minute IV infusion pump requirement — practical for drip-and-ship and inter-hospital transfer',
      'Population: Chinese patients with AIS, NIHSS 1–25, treated within 4.5h; 30.4% female; mean age ~65',
      'Alongside AcT (Canada 2022) and NOR-TEST 2 (Norway), this trial provides the multi-ethnic evidence base for AHA/ASA 2026 COR 1 equivalence',
      'Published: JAMA 2024; 332(17):1437–1445. DOI: 10.1001/jama.2024.14721'
    ],
    conclusion: '',
    source: 'Meng X et al. (JAMA 2024)',
    clinicalTrialsId: 'NCT04915729',
    listCategory: 'thrombolysis',
    listDescription: 'Tenecteplase noninferior to alteplase for AIS within 4.5h; 72.7% vs 70.3% mRS 0–1 (JAMA 2024).',
  },

  'ecass3-trial': {
    id: 'ecass3-trial',
    title: 'ECASS III Trial',
    subtitle: 'IV tPA for Acute Ischemic Stroke (3-4.5 Hours)',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '821',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.04',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '7.2%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Double-blind, placebo-controlled',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled 2003-2007'
    },
    efficacyResults: {
      treatment: {
        percentage: 52.4,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'tPA Group'
      },
      control: {
        percentage: 45.2,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: 'IV Alteplase (0.9 mg/kg)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'ECASS III investigated whether the window for IV tPA could be safely extended from 3 hours (NINDS) to 4.5 hours.',
    calculations: {
      nnt: 13.9, // 1 / (0.524 - 0.452) = 13.9
      nntExplanation: 'For every 13.9 patients treated with tPA in the 3-4.5 hour window, one additional patient achieves favorable outcome (mRS 0-1) compared to placebo'
    },
    pearls: [
      'Extended Window: Successfully expanded the treatment window to 4.5 hours for eligible patients',
      'Efficacy Decay: The treatment effect (OR 1.34) was smaller than in the 0-3 hour window (OR 1.7 in NINDS), reinforcing that earlier treatment is better',
      'Key Exclusions: Age > 80 years, baseline NIHSS > 25, patients taking oral anticoagulants (regardless of INR), and patients with both diabetes and prior stroke',
      'Guideline evolution: The trial excluded age >80 and warfarin users, but AHA/ASA 2026 guidelines support considering treatment in these groups within 3–4.5h after individual risk assessment',
      'Symptomatic ICH: 2.4% in tPA group vs 0.2% in Placebo group (P=0.008)'
    ],
    conclusion: '',
    source: 'Hacke et al. (NEJM 2008)',
    clinicalTrialsId: 'NCT00153036',
    listCategory: 'thrombolysis',
    listDescription: 'Extended IV tPA window to 4.5 hours; 52.4% vs 45.2% mRS 0-1.',
  },
  'extend-trial': {
    id: 'extend-trial',
    title: 'EXTEND Trial',
    subtitle: 'tPA for Acute Ischemic Stroke (4.5-9 Hours)',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '225',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.04',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '5.9%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Placebo-controlled',
        'Perfusion imaging selection (CTP or DWI)',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled 2010-2018'
    },
    efficacyResults: {
      treatment: {
        percentage: 35.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Alteplase Group'
      },
      control: {
        percentage: 29.5,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: 'IV Alteplase (0.9 mg/kg)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'Can we thrombolyse patients beyond 4.5 hours if they have salvageable tissue? The EXTEND trial tested desmoteplase (and pooled data with ECASS-4/EPITHET using Alteplase) using perfusion imaging selection.',
    calculations: {
      nnt: 16.9, // 1 / (0.354 - 0.295) = 16.9
      nntExplanation: 'For every 16.9 patients treated with tPA in the 4.5-9 hour window with favorable perfusion, one additional patient achieves excellent outcome (mRS 0-1) compared to placebo'
    },
    pearls: [
      'Tissue Window: Proved that the "tissue window" (perfusion mismatch) is more relevant than the rigid "time window" for thrombolysis, similar to mechanical thrombectomy',
      'Wake-Up Stroke: Provided evidence for treating wake-up strokes guided by CTP (alternative to the MRI DWI-FLAIR mismatch strategy from WAKE-UP trial)',
      'Selection Criteria: Core < 70 ml (CTP or DWI), Mismatch: Penumbra > 10 ml and > 1.2x Core volume',
      'Clinical Implementation: Many centers now use this protocol for patients < 9 hours who are not thrombectomy candidates (e.g., distal occlusions) but have favorable perfusion profiles',
      'Symptomatic ICH: 6.2% in Alteplase group vs 0.9% in Placebo group',
      'Adjusted Risk Ratio: 1.44 (P=0.04)'
    ],
    conclusion: '',
    source: 'Ma et al. (NEJM 2019)',
    clinicalTrialsId: 'NCT00887328',
    listCategory: 'thrombolysis',
    listDescription: 'tPA 4.5–9h and wake-up stroke with perfusion mismatch selection.',
  },
  'eagle-trial': {
    id: 'eagle-trial',
    title: 'EAGLE Trial',
    subtitle: 'Intra-Arterial tPA for Central Retinal Artery Occlusion',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '84',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'BCVA Change',
        label: 'at 1 Month'
      },
      pValue: {
        value: '0.69',
        label: 'Not Significant'
      },
      effectSize: {
        value: '-2.9%',
        label: 'No Benefit'
      }
    },
    trialDesign: {
      type: [
        'Prospective randomized multicenter trial',
        'Open-label (non-blinded)',
        '1:1 allocation (LIF vs. CST)'
      ],
      timeline: 'Enrolled 2002-2007'
    },
    efficacyResults: {
      treatment: {
        percentage: 57.1,
        label: 'Clinically significant visual improvement',
        name: 'LIF Group (IA tPA)'
      },
      control: {
        percentage: 60.0,
        label: 'Clinically significant visual improvement',
        name: 'CST Group (Conservative)'
      }
    },
    intervention: {
      treatment: 'Local Intra-arterial Fibrinolysis (max 50mg tPA) via microcatheter in ophthalmic artery',
      control: 'Conservative Standard Treatment (hemodilution, ocular massage, timolol, acetazolamide)'
    },
    clinicalContext: 'Central Retinal Artery Occlusion (CRAO) is an ophthalmologic emergency with poor prognosis. Intra-arterial (IA) fibrinolysis was hypothesized to improve visual outcomes by recanalizing the ophthalmic artery. The EAGLE trial was the first randomized controlled trial to test this.',
    calculations: {
      // Negative trial - no NNT
    },
    pearls: [
      'Negative Trial: IA tPA showed no efficacy benefit over conservative therapy',
      'Safety Hazard: The intervention carried significantly higher risks (37.1% adverse events vs 4.3% in control, including 2 hemorrhages) without benefit',
      'Study Stopped: The trial was terminated early by the Data Safety Monitoring Board due to futility and safety concerns',
      'Guideline Impact: Based on EAGLE, IA tPA is generally not recommended for CRAO in standard practice, though IV tPA within 4.5h is still considered by some centers',
      'Time Window: Within 20 hours of symptom onset',
      'Primary Outcome: Change in Best Corrected Visual Acuity (BCVA) at 1 month'
    ],
    conclusion: '',
    source: 'Schumacher et al. (Ophthalmology 2010)',
    clinicalTrialsId: 'NCT00622778',
    listCategory: 'thrombolysis',
    listDescription: 'IA tPA for central retinal artery occlusion — negative trial; stopped early for futility.',
  },
  'mr-clean-trial': {
    id: 'mr-clean-trial',
    title: 'MR CLEAN Trial',
    subtitle: 'Intra-arterial Treatment for Anterior Circulation LVO',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '500',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'Significant',
        label: 'Adjusted OR 1.67'
      },
      effectSize: {
        value: '+13.5%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'Pragmatic phase 3 randomized trial',
        'Open-label with blinded endpoint assessment',
        'Intra-arterial therapy plus usual care vs usual care alone',
        'Treatment possible within 6 hours of onset'
      ],
      timeline: 'Enrolled at 16 Dutch centers'
    },
    efficacyResults: {
      treatment: {
        percentage: 32.6,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Intra-arterial Treatment + Usual Care'
      },
      control: {
        percentage: 19.1,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Usual Care Alone'
      }
    },
    intervention: {
      treatment: 'Intra-arterial treatment (predominantly stent-retriever thrombectomy) plus usual care, including alteplase when eligible',
      control: 'Usual care alone, including alteplase when eligible'
    },
    clinicalContext: 'MR CLEAN was the first modern positive thrombectomy trial and established that endovascular treatment improves disability outcomes for anterior circulation large-vessel occlusion when patients are selected with vessel imaging and treated rapidly.',
    pearls: [
      'First positive modern EVT trial that reopened the field after earlier neutral endovascular studies',
      'Most patients also received IV alteplase before randomization (89%)',
      'Functional independence improved from 19.1% to 32.6%',
      'Adjusted common odds ratio for better disability outcome was 1.67',
      'No significant increase in mortality or symptomatic intracerebral hemorrhage was seen'
    ],
    conclusion: '',
    source: 'Berkhemer et al. (NEJM 2015)',
    specialDesign: 'landmark-evt',
    keyMessage: 'MR CLEAN established modern EVT as effective therapy for anterior circulation LVO.',
    listCategory: 'thrombectomy',
    listDescription: 'First modern positive thrombectomy trial for anterior circulation large-vessel occlusion.',
  },
  'escape-trial': {
    id: 'escape-trial',
    title: 'ESCAPE Trial',
    subtitle: 'Rapid EVT for Small-Core LVO With Good Collaterals',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '316',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 2.6',
        label: 'Better Disability Outcome'
      }
    },
    trialDesign: {
      type: [
        'International randomized trial',
        'Standard care vs standard care plus EVT',
        'CT/CTA selection for small core and moderate-good collaterals',
        'Treatment allowed up to 12 hours from onset'
      ],
      timeline: 'Stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 53.0,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'EVT + Standard Care'
      },
      control: {
        percentage: 29.3,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Standard Care Alone'
      }
    },
    intervention: {
      treatment: 'Rapid endovascular thrombectomy plus standard care',
      control: 'Standard care alone, including alteplase when eligible'
    },
    clinicalContext: 'ESCAPE emphasized workflow discipline, collateral selection, and rapid reperfusion. It showed that thrombectomy works best when imaging confirms a small core and treatment delays are aggressively minimized.',
    pearls: [
      'Marked absolute gain in independence: 53.0% vs 29.3%',
      'Mortality was reduced: 10.4% vs 19.0%',
      'Median CT-to-first reperfusion time in the EVT arm was only 84 minutes',
      'Used collateral imaging to exclude patients with poor tissue reserve',
      'One of the five 2015 trials that cemented EVT as standard of care'
    ],
    conclusion: '',
    source: 'Goyal et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01778335',
    listCategory: 'thrombectomy',
    listDescription: 'Fast thrombectomy trial using collateral-based CT selection and strict workflow targets.',
  },
  'revascat-trial': {
    id: 'revascat-trial',
    title: 'REVASCAT Trial',
    subtitle: 'Solitaire Thrombectomy Within 8 Hours',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '206',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'Significant',
        label: 'Adjusted OR 1.7'
      },
      effectSize: {
        value: '+15.5%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'Randomized trial embedded in a population-based registry',
        'Thrombectomy plus medical therapy vs medical therapy alone',
        'Anterior circulation LVO without large infarct',
        'Treatment window up to 8 hours'
      ],
      timeline: 'Conducted at 4 centers in Catalonia, Spain'
    },
    efficacyResults: {
      treatment: {
        percentage: 43.7,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Solitaire Thrombectomy + Medical Therapy'
      },
      control: {
        percentage: 28.2,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Solitaire stent-retriever thrombectomy plus medical therapy',
      control: 'Medical therapy alone, including alteplase when eligible'
    },
    clinicalContext: 'REVASCAT confirmed that stent-retriever thrombectomy improves disability outcomes when used in carefully selected anterior circulation LVO patients, including those in whom alteplase failed or was contraindicated.',
    pearls: [
      'Functional independence improved to 43.7% vs 28.2%',
      'Ordinal disability outcome also favored thrombectomy (adjusted OR 1.7)',
      'Symptomatic intracranial hemorrhage was identical in both groups at 1.9%',
      'Trial helped extend confidence in EVT use out to 8 hours in selected patients'
    ],
    conclusion: '',
    source: 'Jovin et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01692379',
    listCategory: 'thrombectomy',
    listDescription: 'Spanish registry-embedded RCT confirming Solitaire thrombectomy benefit within 8 hours.',
  },
  'extend-ia-trial': {
    id: 'extend-ia-trial',
    title: 'EXTEND-IA Trial',
    subtitle: 'Perfusion-Selected EVT After Alteplase',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '70',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Reperfusion',
        label: '24-Hour Coprimary Endpoint'
      },
      pValue: {
        value: '<0.001',
        label: 'Reperfusion Benefit'
      },
      effectSize: {
        value: '+31%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'Randomized trial after IV alteplase',
        'Perfusion-imaging selection for salvageable tissue',
        'Solitaire FR thrombectomy vs alteplase alone',
        'Occlusion in ICA or MCA with core <70 mL'
      ],
      timeline: 'Stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 71,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy + Alteplase'
      },
      control: {
        percentage: 40,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Alteplase Alone'
      }
    },
    intervention: {
      treatment: 'Solitaire FR thrombectomy after IV alteplase',
      control: 'IV alteplase alone'
    },
    clinicalContext: 'EXTEND-IA showed that CT perfusion imaging could identify patients with salvageable tissue most likely to benefit from thrombectomy — reperfusion at 24h improved from 37% to 100% in the EVT group.',
    pearls: [
      'Used CT perfusion to target salvageable tissue and avoid large completed infarcts',
      'Reperfusion at 24 hours improved from 37% to 100%',
      'Early neurologic improvement at day 3 was 80% vs 37%',
      'Functional independence at 90 days rose to 71% vs 40%'
    ],
    conclusion: '',
    source: 'Campbell et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01492725',
    listCategory: 'thrombectomy',
    listDescription: 'Perfusion-imaging thrombectomy trial showing major reperfusion and functional gains.',
  },
  'swift-prime-trial': {
    id: 'swift-prime-trial',
    title: 'SWIFT PRIME Trial',
    subtitle: 'Stent-Retriever EVT Plus IV tPA vs IV tPA Alone',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '196',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '+25%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'International multicenter randomized trial',
        'IV tPA alone vs IV tPA plus Solitaire thrombectomy',
        'Imaging-confirmed proximal anterior circulation occlusion',
        'Large ischemic cores excluded'
      ],
      timeline: 'Stopped early for efficacy after 196 patients'
    },
    efficacyResults: {
      treatment: {
        percentage: 60,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Stent Retriever + IV tPA'
      },
      control: {
        percentage: 35,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'IV tPA Alone'
      }
    },
    intervention: {
      treatment: 'Solitaire stent-retriever thrombectomy plus IV tPA',
      control: 'IV tPA alone'
    },
    clinicalContext: 'SWIFT PRIME reinforced that high-quality imaging selection and rapid stent-retriever reperfusion substantially improve disability outcomes in anterior circulation LVO.',
    pearls: [
      'Functional independence improved from 35% to 60%',
      'Substantial reperfusion at end of procedure reached 88%',
      'Median imaging-to-groin puncture time was 57 minutes',
      'No significant increase in mortality or symptomatic intracranial hemorrhage'
    ],
    conclusion: '',
    source: 'Saver et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01657461',
    listCategory: 'thrombectomy',
    listDescription: 'Solitaire thrombectomy trial showing large gains over IV tPA alone.',
  },
  'thrace-trial': {
    id: 'thrace-trial',
    title: 'THRACE Trial',
    subtitle: 'Bridging Thrombectomy After Alteplase',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '414',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.028',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 1.55',
        label: 'Functional Independence Benefit'
      }
    },
    trialDesign: {
      type: [
        'Randomized controlled trial across 26 French centers',
        'IV alteplase alone vs IV alteplase plus mechanical thrombectomy',
        'Proximal cerebral artery occlusion',
        'IVT within 4 hours and thrombectomy within 5 hours'
      ],
      timeline: 'Enrolled 2010-2015'
    },
    efficacyResults: {
      treatment: {
        percentage: 53,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'IV Alteplase + Mechanical Thrombectomy'
      },
      control: {
        percentage: 42,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'IV Alteplase Alone'
      }
    },
    intervention: {
      treatment: 'IV alteplase followed by mechanical thrombectomy',
      control: 'IV alteplase alone'
    },
    clinicalContext: 'THRACE tested whether bridging thrombectomy improves outcomes after standard-dose alteplase in patients with proximal occlusions and supported bridging thrombectomy as the standard early EVT approach.',
    pearls: [
      'Functional independence increased from 42% to 53%',
      'Mortality and symptomatic intracranial hemorrhage were similar between groups',
      'Supports bridging therapy for eligible anterior circulation large-vessel occlusions',
      'Conducted before the widespread consolidation of modern thrombectomy practice'
    ],
    conclusion: '',
    source: 'Bracard et al. (Lancet Neurol 2016)',
    clinicalTrialsId: 'NCT01062698',
    listCategory: 'thrombectomy',
    listDescription: 'French bridging-therapy trial showing benefit from adding thrombectomy to alteplase.',
  },
  'direct-mt-trial': {
    id: 'direct-mt-trial',
    title: 'DIRECT-MT Trial',
    subtitle: 'Thrombectomy Alone vs Bridging Alteplase',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '656',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.04',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: 'OR 1.07',
        label: 'Met NI Margin'
      }
    },
    trialDesign: {
      type: [
        'Multicenter Chinese noninferiority trial',
        'Thrombectomy alone vs alteplase followed by thrombectomy',
        'Anterior circulation LVO within 4.5 hours',
        'Primary analysis based on mRS distribution at 90 days'
      ],
      timeline: 'Conducted at 41 tertiary centers'
    },
    efficacyResults: {
      treatment: {
        percentage: 79.4,
        label: 'Overall successful reperfusion',
        name: 'Thrombectomy Alone'
      },
      control: {
        percentage: 84.5,
        label: 'Overall successful reperfusion',
        name: 'Alteplase + Thrombectomy'
      }
    },
    intervention: {
      treatment: 'Direct endovascular thrombectomy alone',
      control: 'IV alteplase followed by endovascular thrombectomy'
    },
    clinicalContext: 'DIRECT-MT was one of the first large randomized trials testing whether IV alteplase can be omitted before thrombectomy in directly presenting eligible patients.',
    pearls: [
      'Met its prespecified noninferiority margin for functional outcome',
      'Pre-thrombectomy reperfusion was lower without alteplase: 2.4% vs 7.0%',
      'Overall reperfusion was also slightly lower in the direct EVT arm',
      'Mortality was similar: 17.7% vs 18.8%',
      'Helped launch the direct-EVT versus bridging-therapy debate'
    ],
    conclusion: '',
    source: 'Yang et al. (NEJM 2020)',
    clinicalTrialsId: 'NCT03469206',
    specialDesign: 'non-inferiority',
    listCategory: 'thrombectomy',
    listDescription: 'Early direct-EVT noninferiority trial that intensified the bridge-vs-direct debate.',
  },
  'devt-trial': {
    id: 'devt-trial',
    title: 'DEVT Trial',
    subtitle: 'Direct EVT vs Alteplase Plus EVT',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '234',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.003',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: '+7.7%',
        label: 'Functional Independence Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized noninferiority trial',
        'Direct thrombectomy vs alteplase plus thrombectomy',
        'Proximal anterior circulation occlusion within 4.5 hours',
        'Conducted at 33 stroke centers in China'
      ],
      timeline: 'Enrolled 2018-2020; stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 54.3,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Direct EVT'
      },
      control: {
        percentage: 46.6,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Alteplase + EVT'
      }
    },
    intervention: {
      treatment: 'Endovascular thrombectomy alone',
      control: 'IV alteplase followed by endovascular thrombectomy'
    },
    clinicalContext: 'DEVT added further evidence from China that direct thrombectomy may achieve similar outcomes to bridging therapy in selected directly presenting alteplase-eligible patients.',
    pearls: [
      'Met its noninferiority threshold for 90-day functional independence',
      'Functional independence was numerically higher with direct EVT: 54.3% vs 46.6%',
      'Symptomatic intracerebral hemorrhage and mortality were similar between groups',
      'Interpretation depends on whether clinicians accept the prespecified noninferiority margin'
    ],
    conclusion: '',
    source: 'Zi et al. (JAMA 2021)',
    specialDesign: 'non-inferiority',
    listCategory: 'thrombectomy',
    listDescription: 'Chinese direct-EVT trial meeting noninferiority against alteplase plus thrombectomy.',
  },
  'skip-trial': {
    id: 'skip-trial',
    title: 'SKIP Trial',
    subtitle: 'Mechanical Thrombectomy Without vs With IV Thrombolysis',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    stats: {
      sampleSize: {
        value: '204',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.18',
        label: 'Failed NI Test'
      },
      effectSize: {
        value: 'OR 1.09',
        label: 'Wide CI; NI Not Proven'
      }
    },
    trialDesign: {
      type: [
        'Investigator-initiated Japanese noninferiority trial',
        'Mechanical thrombectomy alone vs low-dose alteplase plus thrombectomy',
        'LVO stroke without large ischemic core',
        'Open-label with randomized allocation'
      ],
      timeline: 'Enrolled 2017-2019 across 23 networks'
    },
    efficacyResults: {
      treatment: {
        percentage: 59.4,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy Alone'
      },
      control: {
        percentage: 57.3,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'IV Alteplase + Thrombectomy'
      }
    },
    intervention: {
      treatment: 'Mechanical thrombectomy alone',
      control: 'IV alteplase 0.6 mg/kg plus mechanical thrombectomy'
    },
    clinicalContext: 'SKIP tested whether direct thrombectomy could replace bridging therapy in Japan, where alteplase was given at a lower approved dose than in many Western trials.',
    pearls: [
      'Did not demonstrate noninferiority despite similar point estimates',
      'Functional independence was 59.4% vs 57.3%, but the confidence interval was too wide',
      'Any intracerebral hemorrhage was lower without IV thrombolysis',
      'Symptomatic hemorrhage and mortality were similar'
    ],
    conclusion: '',
    source: 'Suzuki et al. (JAMA 2021)',
    specialDesign: 'non-inferiority',
    keyMessage: 'SKIP was directionally reassuring for direct EVT but statistically inconclusive.',
    listCategory: 'thrombectomy',
    listDescription: 'Japanese direct-EVT study that was inconclusive for noninferiority.',
  },
  'mr-clean-no-iv-trial': {
    id: 'mr-clean-no-iv-trial',
    title: 'MR CLEAN-NO IV Trial',
    subtitle: 'Direct EVT in European Alteplase-Eligible Patients',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '539',
        label: 'Patients in Analysis'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.28',
        label: 'Neither Superiority nor NI'
      },
      effectSize: {
        value: 'OR 0.84',
        label: 'Direct EVT Not Better'
      }
    },
    trialDesign: {
      type: [
        'Open-label multicenter European randomized trial',
        'Direct EVT vs alteplase followed by EVT',
        'Direct-to-EVT-center patients eligible for both treatments',
        'Tested superiority and noninferiority of EVT alone'
      ],
      timeline: 'Conducted across Europe'
    },
    efficacyResults: {
      treatment: {
        percentage: 20.5,
        label: 'Mortality at 90 days (lower is better)',
        name: 'EVT Alone'
      },
      control: {
        percentage: 15.8,
        label: 'Mortality at 90 days (lower is better)',
        name: 'Alteplase + EVT'
      }
    },
    intervention: {
      treatment: 'Endovascular treatment alone',
      control: 'IV alteplase followed by endovascular treatment'
    },
    clinicalContext: 'MR CLEAN-NO IV tested the direct-EVT strategy in a non-Asian population and did not support omitting alteplase before thrombectomy in directly presenting eligible patients.',
    pearls: [
      'EVT alone was neither superior nor noninferior to bridging therapy',
      'Median 90-day mRS favored the bridging arm: 2 vs 3',
      'Mortality was numerically higher with direct EVT: 20.5% vs 15.8%',
      'Symptomatic intracerebral hemorrhage was similar between groups'
    ],
    conclusion: '',
    source: 'LeCouffe et al. (NEJM 2021)',
    specialDesign: 'negative-trial',
    keyMessage: 'MR CLEAN-NO IV argues against routinely skipping alteplase before EVT in eligible direct presenters.',
    listCategory: 'thrombectomy',
    listDescription: 'European direct-EVT trial showing neither superiority nor noninferiority over bridging therapy.',
  },
  'direct-safe-trial': {
    id: 'direct-safe-trial',
    title: 'DIRECT-SAFE Trial',
    subtitle: 'Direct EVT vs Bridging Therapy Within 4.5 Hours',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '295',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: 'Not Met',
        label: 'NI Margin Missed'
      },
      effectSize: {
        value: '-5.1%',
        label: 'Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'International multicenter randomized noninferiority trial',
        'Direct EVT vs bridging thrombolysis plus EVT',
        'Included ICA, M1, M2, and basilar occlusions',
        'Open-label with blinded endpoint assessment'
      ],
      timeline: 'Enrolled 2018-2021 across Australia, New Zealand, China, and Vietnam'
    },
    efficacyResults: {
      treatment: {
        percentage: 55,
        label: 'Functional independence (mRS 0-2 or return to baseline) at 90 days',
        name: 'Direct EVT'
      },
      control: {
        percentage: 61,
        label: 'Functional independence (mRS 0-2 or return to baseline) at 90 days',
        name: 'Bridging Therapy'
      }
    },
    intervention: {
      treatment: 'Direct endovascular thrombectomy',
      control: 'IV thrombolysis (alteplase or tenecteplase) followed by EVT'
    },
    clinicalContext: 'DIRECT-SAFE broadened the direct-EVT question to a more diverse international population and vascular anatomy, including posterior circulation and M2 occlusions.',
    pearls: [
      'Did not show noninferiority of direct EVT',
      'Functional independence favored bridging therapy: 61% vs 55%',
      'Safety outcomes were similar, including 1% symptomatic hemorrhage in both arms',
      'Guideline interpretation generally remains in favor of bridging therapy when alteplase eligible'
    ],
    conclusion: '',
    source: 'Mitchell et al. (Lancet 2022)',
    clinicalTrialsId: 'NCT03494920',
    specialDesign: 'negative-trial',
    listCategory: 'thrombectomy',
    listDescription: 'International direct-EVT trial that did not support skipping thrombolysis.',
  },
  'swift-direct-trial': {
    id: 'swift-direct-trial',
    title: 'SWIFT DIRECT Trial',
    subtitle: 'Thrombectomy Alone vs Alteplase Plus Thrombectomy',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '423',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: 'Not Met',
        label: 'NI Margin Crossed'
      },
      effectSize: {
        value: '-7.3%',
        label: 'Adjusted Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'European and Canadian randomized noninferiority trial',
        'Thrombectomy alone vs alteplase plus thrombectomy',
        'Direct presenters at endovascular centers',
        'Primary endpoint: mRS 0-2 at 90 days'
      ],
      timeline: 'Enrolled 2017-2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 57,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy Alone'
      },
      control: {
        percentage: 65,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Alteplase + Thrombectomy'
      }
    },
    intervention: {
      treatment: 'Stent-retriever thrombectomy alone',
      control: 'IV alteplase plus stent-retriever thrombectomy'
    },
    clinicalContext: 'SWIFT DIRECT was one of the major Western direct-EVT trials and found lower reperfusion rates when alteplase was omitted.',
    pearls: [
      'Failed to show noninferiority of thrombectomy alone',
      'Functional independence favored bridging therapy: 65% vs 57%',
      'Successful reperfusion was lower without alteplase: 91% vs 96%',
      'Symptomatic intracranial hemorrhage remained low in both groups'
    ],
    conclusion: '',
    source: 'Fischer et al. (Lancet 2022)',
    clinicalTrialsId: 'NCT03192332',
    specialDesign: 'negative-trial',
    listCategory: 'thrombectomy',
    listDescription: 'Western direct-EVT trial that missed noninferiority and had lower reperfusion without alteplase.',
  },
  'laste-trial': {
    id: 'laste-trial',
    title: 'LASTE Trial',
    subtitle: 'Thrombectomy for Large Infarct of Unrestricted Size',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '333',
        label: 'Assigned Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 1.63',
        label: 'Better Disability Outcome'
      }
    },
    trialDesign: {
      type: [
        'Randomized large-core trial',
        'Thrombectomy plus medical care vs medical care alone',
        'Anterior circulation proximal occlusion with ASPECTS <=5',
        'Imaging by CT or MRI within 6.5 hours'
      ],
      timeline: 'Stopped early after external positive large-core data'
    },
    efficacyResults: {
      treatment: {
        percentage: 36.1,
        label: 'Death at 90 days (lower is better)',
        name: 'Thrombectomy + Medical Care'
      },
      control: {
        percentage: 55.5,
        label: 'Death at 90 days (lower is better)',
        name: 'Medical Care Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular thrombectomy plus medical care',
      control: 'Medical care alone'
    },
    clinicalContext: 'LASTE extended EVT evidence into patients with large established infarcts, including infarct volumes not capped by a strict upper limit, showing benefit despite higher hemorrhage risk.',
    pearls: [
      'Median 90-day mRS improved from 6 to 4 with thrombectomy',
      'Mortality fell substantially: 36.1% vs 55.5%',
      'Symptomatic intracerebral hemorrhage was higher with thrombectomy: 9.6% vs 5.7%',
      'Supports EVT in selected large-core patients rather than excluding them automatically'
    ],
    conclusion: '',
    source: 'Costalat et al. (NEJM 2024)',
    clinicalTrialsId: 'NCT03811769',
    listCategory: 'thrombectomy',
    listDescription: 'Large-core thrombectomy trial showing better outcomes and lower mortality despite more bleeding.',
  },
  'tension-trial': {
    id: 'tension-trial',
    title: 'TENSION Trial',
    subtitle: 'EVT for Large-Core Stroke Selected Mainly by Non-Contrast CT',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '253',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.0001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 2.58',
        label: 'Better Disability Outcome'
      }
    },
    trialDesign: {
      type: [
        'Prospective multicenter randomized large-core trial',
        'EVT plus medical treatment vs medical treatment alone',
        'Anterior circulation LVO with ASPECTS 3-5',
        'Predominantly non-contrast CT selection up to 12 hours'
      ],
      timeline: 'Enrolled 2018-2023; stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 6,
        label: 'Symptomatic intracranial hemorrhage',
        name: 'EVT + Medical Treatment'
      },
      control: {
        percentage: 5,
        label: 'Symptomatic intracranial hemorrhage',
        name: 'Medical Treatment Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular thrombectomy plus medical treatment',
      control: 'Medical treatment alone'
    },
    clinicalContext: 'TENSION demonstrated large-core EVT benefit using mostly non-contrast CT — making the evidence more applicable to real-world stroke systems without advanced perfusion imaging.',
    pearls: [
      'Functional outcome improved substantially with EVT (adjusted common OR 2.58)',
      'Mortality was lower with thrombectomy (hazard ratio 0.67)',
      'Used pragmatic ASPECTS 3-5 selection with non-contrast CT predominant',
      'Supports offering EVT to selected large-core patients even without advanced imaging'
    ],
    conclusion: '',
    source: 'Bendszus et al. (Lancet 2023)',
    clinicalTrialsId: 'NCT03094715',
    listCategory: 'thrombectomy',
    listDescription: 'Large-core EVT trial using pragmatic non-contrast CT selection rather than perfusion imaging.',
  },
  'compass-trial': {
    id: 'compass-trial',
    title: 'COMPASS Trial',
    subtitle: 'Aspiration First Pass vs Stent Retriever First Line',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '270',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.0014',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: '+2%',
        label: 'mRS 0-2 Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label noninferiority trial',
        'Aspiration first pass vs stent retriever first line',
        'Anterior circulation LVO within 6 hours',
        'Blinded outcome assessment with core-lab adjudication'
      ],
      timeline: 'Conducted at 15 North American sites'
    },
    efficacyResults: {
      treatment: {
        percentage: 52,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Aspiration First Pass'
      },
      control: {
        percentage: 50,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Stent Retriever First Line'
      }
    },
    intervention: {
      treatment: 'Direct aspiration first-pass thrombectomy',
      control: 'Stent retriever first-line thrombectomy'
    },
    clinicalContext: 'COMPASS compared two frontline thrombectomy strategies and helped legitimize aspiration-first approaches as an alternative to stent-retriever-first treatment.',
    pearls: [
      'Aspiration first pass was noninferior to stent retriever first line',
      'Functional independence was similar: 52% vs 50%',
      'All-cause mortality was identical at 22% in both groups',
      'Trial supported operator choice and device flexibility in modern EVT'
    ],
    conclusion: '',
    source: 'Turk et al. (Lancet 2019)',
    clinicalTrialsId: 'NCT02466893',
    specialDesign: 'non-inferiority',
    listCategory: 'thrombectomy',
    listDescription: 'Device-strategy trial showing aspiration-first thrombectomy was noninferior to stent retrievers.',
  },
  'aster-trial': {
    id: 'aster-trial',
    title: 'ASTER Trial',
    subtitle: 'Contact Aspiration vs Stent Retriever Revascularization',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '381',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mTICI 2b-3',
        label: 'Successful Revascularization'
      },
      pValue: {
        value: '0.53',
        label: 'Not Significant'
      },
      effectSize: {
        value: '85.4% vs 83.1%',
        label: 'No Primary Difference'
      }
    },
    trialDesign: {
      type: [
        'Randomized open-label, blinded endpoint trial',
        'First-line contact aspiration vs first-line stent retriever',
        'Anterior circulation LVO within 6 hours',
        'Conducted in 8 French comprehensive stroke centers'
      ],
      timeline: 'Enrolled 2015-2016'
    },
    efficacyResults: {
      treatment: {
        percentage: 85.4,
        label: 'Successful revascularization (mTICI 2b-3)',
        name: 'Contact Aspiration First Line'
      },
      control: {
        percentage: 83.1,
        label: 'Successful revascularization (mTICI 2b-3)',
        name: 'Stent Retriever First Line'
      }
    },
    intervention: {
      treatment: 'First-line contact aspiration thrombectomy',
      control: 'First-line stent retriever thrombectomy'
    },
    clinicalContext: 'ASTER directly compared aspiration-first and stent-retriever-first approaches at a time when device strategy was still unsettled in daily EVT practice.',
    pearls: [
      'No significant difference in final successful revascularization',
      'Clinical outcomes at 90 days were also similar',
      'Trial suggests either strategy is acceptable as a first-line approach',
      'Addresses device selection rather than patient selection — aspiration and stent retriever are interchangeable as first-line approaches'
    ],
    conclusion: '',
    source: 'Lapergue et al. (JAMA 2017)',
    clinicalTrialsId: 'NCT02523261',
    specialDesign: 'negative-trial',
    listCategory: 'thrombectomy',
    listDescription: 'Device-comparison trial showing no clear advantage for aspiration over stent retrievers.',
  },
  'aster2-trial': {
    id: 'aster2-trial',
    title: 'ASTER2 Trial',
    subtitle: 'Combined Aspiration + Stent Retriever vs Stent Retriever Alone',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '408',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'eTICI 2c-3',
        label: 'End-of-Procedure Reperfusion'
      },
      pValue: {
        value: '0.17',
        label: 'Not Significant'
      },
      effectSize: {
        value: '+6.6%',
        label: 'Primary Endpoint Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label, blinded-endpoint trial',
        'Combined contact aspiration plus stent retriever vs stent retriever alone',
        'Anterior circulation LVO within 8 hours',
        'Conducted in 11 French comprehensive stroke centers'
      ],
      timeline: 'Enrolled 2017-2018 with 12-month follow-up'
    },
    efficacyResults: {
      treatment: {
        percentage: 64.5,
        label: 'Near-total or total reperfusion (eTICI 2c-3)',
        name: 'Combined Aspiration + Stent Retriever'
      },
      control: {
        percentage: 57.9,
        label: 'Near-total or total reperfusion (eTICI 2c-3)',
        name: 'Stent Retriever Alone'
      }
    },
    intervention: {
      treatment: 'Initial thrombectomy with combined contact aspiration and stent retriever',
      control: 'Initial thrombectomy with stent retriever alone'
    },
    clinicalContext: 'ASTER2 asked whether combining the two leading thrombectomy techniques from the outset could improve angiographic results over standard stent-retriever-first treatment.',
    pearls: [
      'Primary endpoint was not significantly improved',
      'Combined therapy improved some secondary angiographic measures after the assigned initial pass',
      'Final clinical implication: routine combined first-line use was not established',
      'Useful trial for EVT technique optimization rather than selection of who should receive EVT'
    ],
    conclusion: '',
    source: 'Lapergue et al. (JAMA 2021)',
    clinicalTrialsId: 'NCT03290885',
    specialDesign: 'negative-trial',
    listCategory: 'thrombectomy',
    listDescription: 'Technical EVT trial showing no clear final reperfusion advantage from upfront combined strategy.',
  },
  'choice-trial': {
    id: 'choice-trial',
    title: 'CHOICE Trial',
    subtitle: 'Adjunct Intra-arterial Alteplase After Successful Thrombectomy',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '121',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.047',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '+18.4%',
        label: 'Adjusted Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Phase 2b randomized double-blind placebo-controlled trial',
        'Adjunct intra-arterial alteplase after successful thrombectomy',
        'Large vessel occlusion with eTICI 2b50-3 reperfusion',
        'Conducted at 7 stroke centers in Catalonia'
      ],
      timeline: 'Enrolled 2018-2021; stopped early during the pandemic'
    },
    efficacyResults: {
      treatment: {
        percentage: 59.0,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Intra-arterial Alteplase'
      },
      control: {
        percentage: 40.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Adjunct intra-arterial alteplase infused after successful thrombectomy',
      control: 'Placebo after successful thrombectomy'
    },
    clinicalContext: 'CHOICE tested whether incomplete microvascular reperfusion after technically successful thrombectomy could be improved with low-dose intra-arterial alteplase.',
    pearls: [
      'Adjunct IA alteplase increased excellent outcome from 40.4% to 59.0%',
      'Symptomatic intracranial hemorrhage was not increased',
      'Trial stopped early and was relatively small, so replication is still needed',
      'Small study stopped early — replication needed before routine use of adjunct IA alteplase post-thrombectomy'
    ],
    conclusion: '',
    source: 'Renu et al. (JAMA 2022)',
    clinicalTrialsId: 'NCT03876119',
    listCategory: 'thrombectomy',
    listDescription: 'Post-thrombectomy adjunct IA alteplase trial suggesting better excellent outcomes.',
  },
  'rescue-bt-trial': {
    id: 'rescue-bt-trial',
    title: 'RESCUE BT Trial',
    subtitle: 'Intravenous Tirofiban Before Endovascular Thrombectomy',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '948',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.51',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.08',
        label: 'No Disability Benefit'
      }
    },
    trialDesign: {
      type: [
        'Investigator-initiated randomized double-blind placebo-controlled trial',
        'IV tirofiban vs placebo before EVT',
        'Proximal intracranial LVO within 24 hours',
        'Conducted at 55 hospitals in China'
      ],
      timeline: 'Enrolled 2018-2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 36.3,
        label: 'mRS 0-1 or return to premorbid baseline at 90 days',
        name: 'IV Tirofiban + EVT'
      },
      control: {
        percentage: 32.4,
        label: 'mRS 0-1 or return to premorbid baseline at 90 days',
        name: 'Placebo + EVT'
      }
    },
    intervention: {
      treatment: 'Intravenous tirofiban before endovascular thrombectomy',
      control: 'Placebo before endovascular thrombectomy'
    },
    clinicalContext: 'RESCUE BT tested whether aggressive antiplatelet therapy before thrombectomy could improve microvascular patency and overall outcomes in LVO stroke.',
    pearls: [
      'No significant improvement in 90-day disability distribution with tirofiban',
      'Symptomatic intracranial hemorrhage was numerically higher: 9.7% vs 6.4%',
      'Mortality was similar between groups',
      'Does not support routine pre-EVT tirofiban use'
    ],
    conclusion: '',
    source: 'RESCUE BT Investigators (JAMA 2022)',
    specialDesign: 'negative-trial',
    listCategory: 'thrombectomy',
    listDescription: 'Adjunct pre-EVT tirofiban trial showing no functional benefit.',
  },
  'enchanted-trial': {
    id: 'enchanted-trial',
    title: 'ENCHANTED Trial',
    subtitle: 'Intensive Blood Pressure Reduction During IV Alteplase Treatment',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    stats: {
      sampleSize: {
        value: '2196',
        label: 'Alteplase-Eligible Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.87',
        label: 'No Functional Difference'
      },
      effectSize: {
        value: 'OR 0.75',
        label: 'Less Any ICH'
      }
    },
    trialDesign: {
      type: [
        'International randomized open-label trial with blinded endpoint assessment',
        'Intensive SBP target 130-140 mm Hg vs guideline target <180 mm Hg',
        'Adults with acute ischemic stroke eligible for IV alteplase',
        'Blood pressure strategy applied for 72 hours'
      ],
      timeline: 'Conducted at 110 sites in 15 countries'
    },
    efficacyResults: {
      treatment: {
        percentage: 14.8,
        label: 'Any intracranial hemorrhage (lower is better)',
        name: 'Intensive BP Lowering'
      },
      control: {
        percentage: 18.7,
        label: 'Any intracranial hemorrhage (lower is better)',
        name: 'Guideline BP Lowering'
      }
    },
    intervention: {
      treatment: 'Target systolic blood pressure 130-140 mm Hg within 1 hour, maintained for 72 hours during and after alteplase treatment',
      control: 'Guideline blood pressure treatment with systolic blood pressure kept below 180 mm Hg'
    },
    clinicalContext: 'ENCHANTED tested whether more aggressive early blood pressure lowering during IV alteplase therapy could reduce hemorrhagic complications enough to improve longer-term disability outcomes.',
    pearls: [
      'Primary functional outcome was neutral despite lower achieved blood pressure in the intensive arm',
      'Any intracranial hemorrhage was reduced: 14.8% vs 18.7%',
      'The reduction in bleeding did not translate into better 90-day disability outcomes',
      'Supports the safety of modestly more aggressive BP control, but not a major change from standard alteplase-era targets'
    ],
    conclusion: '',
    source: 'Anderson et al. (Lancet 2019)',
    clinicalTrialsId: 'NCT01422616',
    specialDesign: 'negative-trial',
    keyMessage: 'Lower post-alteplase blood pressure reduced bleeding, but not disability.',
  },
  'best-ii-trial': {
    id: 'best-ii-trial',
    title: 'BEST-II Trial',
    subtitle: 'Blood Pressure Targets After Successful Endovascular Therapy',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    stats: {
      sampleSize: {
        value: '120',
        label: 'Randomized EVT Patients'
      },
      primaryEndpoint: {
        value: 'Futility Design',
        label: 'Infarct Volume and Utility-Weighted mRS'
      },
      pValue: {
        value: '0.93',
        label: 'Futility Not Met'
      },
      effectSize: {
        value: '14-25%',
        label: 'Predicted Success of Future Trial'
      }
    },
    trialDesign: {
      type: [
        'Phase 2 randomized open-label blinded-endpoint futility trial',
        'Three post-EVT systolic blood pressure targets: <140, <160, and <=180 mm Hg',
        'Successful endovascular therapy required before randomization',
        'Blood pressure strategy initiated within 60 minutes and maintained for 24 hours'
      ],
      timeline: 'Three US comprehensive stroke centers, 2020-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 51,
        label: 'Mean utility-weighted mRS at 90 days (x100)',
        name: 'Target <140 mm Hg'
      },
      control: {
        percentage: 58,
        label: 'Mean utility-weighted mRS at 90 days (x100)',
        name: 'Target <=180 mm Hg'
      }
    },
    intervention: {
      treatment: 'Lower post-EVT systolic blood pressure target, primarily <140 mm Hg',
      control: 'Guideline-level post-EVT systolic blood pressure target <=180 mm Hg'
    },
    clinicalContext: 'BEST-II was a dose-finding and futility study testing whether a lower systolic BP target after technically successful EVT would be promising enough to justify a large superiority trial.',
    pearls: [
      'Neither lower target met prespecified futility boundaries, so definitive harm could not be declared',
      'Signals still favored the higher target rather than aggressive BP lowering',
      'Predicted probability of success for a future superiority trial was low: about 25% for <140 mm Hg and 14% for <160 mm Hg',
      'The highest-target group had the best mean utility-weighted mRS in this small phase 2 study'
    ],
    conclusion: '',
    source: 'Mistry et al. (JAMA 2023)',
    clinicalTrialsId: 'NCT04116112',
    specialDesign: 'futility-trial',
    keyMessage: 'BEST-II did not definitively close the question, but it made meaningful benefit from lower post-EVT BP look unlikely.',
  },
  'bp-target-trial': {
    id: 'bp-target-trial',
    title: 'BP-TARGET Trial',
    subtitle: 'Intensive vs Standard Blood Pressure Control After Successful EVT',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '324',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Radiographic ICH',
        label: 'at 24-36 Hours'
      },
      pValue: {
        value: '0.84',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'aOR 0.96',
        label: 'No Reduction in Hemorrhage'
      }
    },
    trialDesign: {
      type: [
        'Multicenter open-label randomized controlled trial',
        'Successful large-vessel EVT required before randomization',
        'SBP target 100-129 mm Hg vs 130-185 mm Hg',
        'Target achieved within 1 hour and maintained for 24 hours'
      ],
      timeline: 'Four academic stroke centers in France'
    },
    efficacyResults: {
      treatment: {
        percentage: 42,
        label: 'Radiographic intraparenchymal hemorrhage at 24-36 hours (lower is better)',
        name: 'Intensive SBP Target'
      },
      control: {
        percentage: 43,
        label: 'Radiographic intraparenchymal hemorrhage at 24-36 hours (lower is better)',
        name: 'Standard SBP Target'
      }
    },
    intervention: {
      treatment: 'Intensive systolic blood pressure target of 100-129 mm Hg after successful EVT',
      control: 'Standard systolic blood pressure target of 130-185 mm Hg after successful EVT'
    },
    clinicalContext: 'BP-TARGET was the first randomized trial focused specifically on whether lower blood pressure targets after successful reperfusion could prevent post-EVT hemorrhagic injury.',
    pearls: [
      'Primary hemorrhage endpoint was almost identical between groups: 42% vs 43%',
      'Symptomatic intraparenchymal hemorrhage was numerically higher in the intensive arm',
      'Functional outcomes at 3 months did not differ',
      'This early randomized signal did not support routine aggressive BP lowering after reperfusion'
    ],
    conclusion: '',
    source: 'Mazighi et al. (Lancet Neurol 2021)',
    clinicalTrialsId: 'NCT03160677',
    specialDesign: 'negative-trial',
    keyMessage: 'Lowering SBP aggressively after successful thrombectomy did not improve post-EVT hemorrhage outcomes.',
  },
  'optimal-bp-trial': {
    id: 'optimal-bp-trial',
    title: 'OPTIMAL-BP Trial',
    subtitle: 'Intensive vs Conventional BP Lowering After EVT',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '306',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.03',
        label: 'Worse With Intensive BP'
      },
      effectSize: {
        value: '-15.1%',
        label: 'Functional Independence Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial with blinded endpoint evaluation',
        'Patients had successful reperfusion after EVT (mTICI 2b or greater)',
        'Intensive SBP target <140 mm Hg vs conventional target 140-180 mm Hg',
        'Blood pressure strategy maintained for 24 hours'
      ],
      timeline: '19 South Korean stroke centers, 2020-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 39.4,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'Intensive BP Management'
      },
      control: {
        percentage: 54.4,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'Conventional BP Management'
      }
    },
    intervention: {
      treatment: 'Systolic blood pressure target <140 mm Hg for 24 hours after successful EVT',
      control: 'Systolic blood pressure target 140-180 mm Hg for 24 hours after successful EVT'
    },
    clinicalContext: 'OPTIMAL-BP directly tested whether tighter blood pressure control after reperfusion improves outcomes, and unlike earlier smaller studies, it showed a clear signal against intensive lowering.',
    pearls: [
      'Functional independence was significantly lower with intensive BP control: 39.4% vs 54.4%',
      'Trial stopped early because of safety concerns and poorer outcomes in the intensive arm',
      'Symptomatic intracerebral hemorrhage rates were similar, so harm was not explained by more sICH',
      'Provides strong evidence to avoid routine aggressive BP lowering below 140 mm Hg after successful EVT'
    ],
    conclusion: '',
    source: 'Nam et al. (JAMA 2023)',
    clinicalTrialsId: 'NCT04205305',
    specialDesign: 'negative-trial',
    keyMessage: 'Do not routinely target SBP <140 mm Hg after successful thrombectomy.',
  },
  'charm-trial': {
    id: 'charm-trial',
    title: 'CHARM Trial',
    subtitle: 'Intravenous Glibenclamide for Cerebral Edema After Large Hemispheric Stroke',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '535',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.42',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'cOR 1.17',
        label: 'No Functional Benefit'
      }
    },
    trialDesign: {
      type: [
        'Phase 3 double-blind placebo-controlled randomized trial',
        'Large hemispheric infarction defined by ASPECTS 1-5 or core 80-300 mL',
        'Study drug started within 10 hours of stroke onset',
        'Primary efficacy analysis focused on patients aged 18-70 years'
      ],
      timeline: '143 stroke centers in 21 countries; stopped early for operational reasons'
    },
    efficacyResults: {
      treatment: {
        percentage: 43,
        label: 'mRS 0-4 at 90 days',
        name: 'Intravenous Glibenclamide'
      },
      control: {
        percentage: 42,
        label: 'mRS 0-4 at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Intravenous glibenclamide 8.6 mg over 72 hours',
      control: 'Placebo infusion'
    },
    clinicalContext: 'CHARM evaluated whether pharmacologic edema reduction could improve outcome after large hemispheric infarction, a setting with high mortality and limited medical therapies.',
    pearls: [
      'No favorable shift in disability at 90 days with glibenclamide',
      'Mortality was not improved and was numerically higher in the active-treatment arm',
      'Hypoglycemia was more common with glibenclamide: 6% vs 2%',
      'Trial was underpowered after early termination, so small subgroup effects remain uncertain'
    ],
    conclusion: '',
    source: 'Sheth et al. (Lancet Neurol 2024)',
    clinicalTrialsId: 'NCT02864953',
    specialDesign: 'negative-trial',
    keyMessage: 'CHARM does not support routine intravenous glibenclamide for malignant edema prevention after large hemispheric stroke.',
  },
  'escape-na1-trial': {
    id: 'escape-na1-trial',
    title: 'ESCAPE-NA1 Trial',
    subtitle: 'Nerinetide Neuroprotection During EVT for Acute Ischemic Stroke',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '1105',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.35',
        label: 'Not Significant Overall'
      },
      effectSize: {
        value: 'RR 1.04',
        label: 'No Overall Benefit'
      }
    },
    trialDesign: {
      type: [
        'Multicenter double-blind placebo-controlled randomized trial',
        'All patients underwent thrombectomy for large-vessel occlusion',
        'Treatment window up to 12 hours with favorable imaging selection',
        'Stratified by alteplase use and declared first EVT device'
      ],
      timeline: '48 hospitals in 8 countries'
    },
    efficacyResults: {
      treatment: {
        percentage: 61.4,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Nerinetide'
      },
      control: {
        percentage: 59.2,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Single-dose intravenous nerinetide before or during EVT',
      control: 'Placebo infusion'
    },
    clinicalContext: 'ESCAPE-NA1 was a major modern neuroprotection trial embedded in the thrombectomy era, testing whether nerinetide could reduce reperfusion injury and improve post-EVT outcomes.',
    pearls: [
      'Overall trial was neutral: 61.4% vs 59.2% achieved mRS 0-2',
      'A prespecified interaction suggested benefit only in patients who did not receive alteplase',
      'In the no-alteplase subgroup, mRS 0-2 was 59.3% with nerinetide vs 49.8% with placebo',
      'Findings raised concern for a drug-drug interaction between alteplase and nerinetide'
    ],
    conclusion: '',
    source: 'Hill et al. (Lancet 2020)',
    clinicalTrialsId: 'NCT02930018',
    specialDesign: 'negative-trial',
    keyMessage: 'ESCAPE-NA1 was negative overall but reopened interest in neuroprotection for EVT patients not receiving alteplase.',
  },
  'decimal-trial': {
    id: 'decimal-trial',
    title: 'DECIMAL Trial',
    subtitle: 'Early Decompressive Craniectomy in Malignant MCA Infarction',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '38',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS <=3',
        label: 'at 6 Months'
      },
      pValue: {
        value: '0.18',
        label: 'Underpowered for Primary Endpoint'
      },
      effectSize: {
        value: '-52.8%',
        label: 'Absolute Mortality Reduction'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Early decompressive craniectomy plus medical therapy vs medical therapy alone',
        'Patients aged 18-55 years with malignant MCA infarction',
        'Sequential design with blinded primary endpoint assessment'
      ],
      timeline: 'France, 2001-2005; stopped early for pooled analysis'
    },
    efficacyResults: {
      treatment: {
        percentage: 25.0,
        label: 'Survival with moderate disability or better (mRS <=3) at 6 months',
        name: 'Decompressive Craniectomy'
      },
      control: {
        percentage: 5.6,
        label: 'Survival with moderate disability or better (mRS <=3) at 6 months',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Early decompressive hemicraniectomy plus standard medical therapy',
      control: 'Standard medical therapy alone'
    },
    clinicalContext: 'DECIMAL was one of the foundational European decompressive hemicraniectomy trials for malignant middle cerebral artery infarction, focusing on whether surgery could reduce the otherwise extreme mortality of space-occupying infarction.',
    pearls: [
      'Small trial stopped early, so it was underpowered for its primary functional endpoint',
      'Primary 6-month mRS <=3 outcome favored surgery numerically: 25.0% vs 5.6%',
      'Mortality was reduced dramatically, with a 52.8% absolute reduction in death',
      'DECIMAL became most influential through its contribution to pooled European decompressive surgery analyses'
    ],
    conclusion: '',
    source: 'Vahedi et al. (Stroke 2007)',
    keyMessage: 'Early hemicraniectomy reduces mortality in malignant MCA infarction — survivors often remain functionally dependent.',
  },
  'destiny-trial': {
    id: 'destiny-trial',
    title: 'DESTINY Trial',
    subtitle: 'Decompressive Surgery for Malignant MCA Infarction',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '32',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 6 Months'
      },
      pValue: {
        value: '0.23',
        label: 'Primary Endpoint NS'
      },
      effectSize: {
        value: '+41%',
        label: '30-Day Survival Benefit'
      }
    },
    trialDesign: {
      type: [
        'Prospective multicenter randomized controlled trial',
        'Hemicraniectomy vs conservative therapy',
        'Sequential design with 30-day mortality assessed first',
        'Primary functional endpoint based on mRS 0-3 at 6 months'
      ],
      timeline: 'Germany; stopped after pooled European data emerged'
    },
    efficacyResults: {
      treatment: {
        percentage: 47,
        label: 'mRS 0-3 at 6 months',
        name: 'Hemicraniectomy'
      },
      control: {
        percentage: 27,
        label: 'mRS 0-3 at 6 months',
        name: 'Conservative Therapy'
      }
    },
    intervention: {
      treatment: 'Early decompressive hemicraniectomy plus intensive medical management',
      control: 'Conservative medical management'
    },
    clinicalContext: 'DESTINY evaluated whether the mortality benefit of hemicraniectomy in malignant MCA infarction could be achieved without merely shifting patients into extremely severe disability.',
    pearls: [
      '30-day survival improved substantially: 88% vs 47%',
      'The prespecified 6-month primary endpoint mRS 0-3 was not statistically significant in this small sample',
      'Distribution of mRS scores still favored surgery, and severe disability was not disproportionately increased',
      'DESTINY was central to the pooled European hemicraniectomy evidence base'
    ],
    conclusion: '',
    source: 'Juttler et al. (Stroke 2007)',
    keyMessage: 'DESTINY reinforced that early hemicraniectomy improves survival in malignant MCA infarction.',
  },
  'hamlet-trial': {
    id: 'hamlet-trial',
    title: 'HAMLET Trial',
    subtitle: 'Hemicraniectomy for Space-Occupying Hemispheric Infarction',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    stats: {
      sampleSize: {
        value: '64',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 1 Year'
      },
      pValue: {
        value: 'ARR 0%',
        label: 'No Primary Benefit Overall'
      },
      effectSize: {
        value: 'ARR 38%',
        label: 'Case Fatality Reduction'
      }
    },
    trialDesign: {
      type: [
        'Multicenter open randomized trial',
        'Surgical decompression vs best medical treatment',
        'Patients randomized within 4 days of stroke onset',
        'Primary endpoint based on mRS 0-3 at 1 year'
      ],
      timeline: 'Netherlands, 2002-2007'
    },
    efficacyResults: {
      treatment: {
        percentage: 62,
        label: 'Survival at 1 year',
        name: 'Surgical Decompression'
      },
      control: {
        percentage: 24,
        label: 'Survival at 1 year',
        name: 'Best Medical Treatment'
      }
    },
    intervention: {
      treatment: 'Decompressive surgery plus best medical treatment',
      control: 'Best medical treatment alone'
    },
    clinicalContext: 'HAMLET extended the decompressive surgery question beyond the earliest time window and showed surgery reduces death, with functional benefit strongest when performed within 48 hours.',
    pearls: [
      'Primary outcome mRS 0-3 at 1 year was neutral overall',
      'Case fatality was reduced by an absolute 38%',
      'Meta-analysis of patients treated within 48 hours showed clearer benefit for both survival and poor outcome reduction',
      'The trial emphasized that delayed surgery up to 96 hours may save lives without clearly improving functional independence'
    ],
    conclusion: '',
    source: 'Hofmeijer et al. (Lancet Neurol 2009)',
    keyMessage: 'For malignant hemispheric infarction, timing is critical: hemicraniectomy works best when done early.',
  },
  'destiny-ii-trial': {
    id: 'destiny-ii-trial',
    title: 'DESTINY II Trial',
    subtitle: 'Hemicraniectomy in Older Patients With Malignant MCA Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '112',
        label: 'Patients Aged 61+ Years'
      },
      primaryEndpoint: {
        value: 'mRS 0-4',
        label: 'at 6 Months'
      },
      pValue: {
        value: '0.04',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '+20%',
        label: 'Survival Without Severe Disability'
      }
    },
    trialDesign: {
      type: [
        'Randomized controlled trial in older adults',
        'Hemicraniectomy vs conservative intensive care treatment',
        'Malignant MCA infarction with treatment within 48 hours',
        'Primary endpoint: survival without severe disability (mRS 0-4) at 6 months'
      ],
      timeline: 'Germany; patients aged 61-82 years'
    },
    efficacyResults: {
      treatment: {
        percentage: 38,
        label: 'Survival without severe disability (mRS 0-4) at 6 months',
        name: 'Hemicraniectomy'
      },
      control: {
        percentage: 18,
        label: 'Survival without severe disability (mRS 0-4) at 6 months',
        name: 'Conservative Treatment'
      }
    },
    intervention: {
      treatment: 'Early decompressive hemicraniectomy',
      control: 'Conservative intensive care treatment'
    },
    clinicalContext: 'DESTINY II addressed the major unresolved question left by the earlier decompressive trials: whether older patients also benefit from surgery for malignant MCA infarction.',
    pearls: [
      'Hemicraniectomy improved the primary endpoint in patients older than 60 years',
      'Mortality was markedly lower with surgery: 33% vs 70%',
      'Most survivors still had substantial disability, usually mRS 4 or 5',
      'The trial changed practice by showing age alone should not exclude surgery'
    ],
    conclusion: '',
    source: 'Juttler et al. (NEJM 2014)',
    keyMessage: 'Older age does not eliminate benefit from hemicraniectomy, but survival often comes with major residual disability.',
  },
  'timing-trial': {
    id: 'timing-trial',
    title: 'TIMING Trial',
    subtitle: 'Early vs Delayed NOAC Initiation After AF-Related Ischemic Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '888',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Composite Outcome',
        label: 'Stroke, sICH, or Death at 90 Days'
      },
      pValue: {
        value: '0.004',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: '-1.79%',
        label: 'Absolute Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Registry-based randomized noninferiority trial',
        'Early NOAC initiation <=4 days vs delayed initiation 5-10 days',
        'Patients with acute ischemic stroke and atrial fibrillation',
        'Open-label with blinded endpoint assessment'
      ],
      timeline: 'Swedish Stroke Register, 2017-2020'
    },
    efficacyResults: {
      treatment: {
        percentage: 6.89,
        label: 'Primary composite outcome at 90 days',
        name: 'Early NOAC Start'
      },
      control: {
        percentage: 8.68,
        label: 'Primary composite outcome at 90 days',
        name: 'Delayed NOAC Start'
      }
    },
    intervention: {
      treatment: 'NOAC initiated within 4 days after ischemic stroke onset',
      control: 'NOAC initiated 5-10 days after ischemic stroke onset'
    },
    clinicalContext: 'TIMING addressed a common bedside question in atrial-fibrillation stroke care: how soon can oral anticoagulation be restarted without provoking intracranial hemorrhage.',
    pearls: [
      'Early NOAC start was noninferior to delayed initiation',
      'No symptomatic intracerebral hemorrhages occurred in either group',
      'Recurrent ischemic stroke and death were numerically lower with early initiation',
      'Registry-based randomization made the trial highly pragmatic and practice-relevant'
    ],
    conclusion: '',
    source: 'Oldgren et al. (Circulation 2022)',
    clinicalTrialsId: 'NCT02961348',
    specialDesign: 'non-inferiority',
    keyMessage: 'TIMING supports starting NOACs early after AF-related ischemic stroke when clinically appropriate.',
  },
  'optimas-trial': {
    id: 'optimas-trial',
    title: 'OPTIMAS Trial',
    subtitle: 'Optimal Timing of DOACs After AF-Related Ischemic Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '3621',
        label: 'Modified Intention-to-Treat Patients'
      },
      primaryEndpoint: {
        value: 'Composite Outcome',
        label: 'Stroke, sICH, or Systemic Embolism at 90 Days'
      },
      pValue: {
        value: '0.0003',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: 'RD 0.000',
        label: 'Event Rates Identical'
      }
    },
    trialDesign: {
      type: [
        'Multicenter open-label blinded-endpoint phase 4 randomized trial',
        'Early DOAC initiation <=4 days vs delayed initiation 7-14 days',
        'Adults with AF-related acute ischemic stroke',
        'Gatekeeper design testing noninferiority then superiority'
      ],
      timeline: '100 UK hospitals, 2019-2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 3.3,
        label: 'Primary composite outcome at 90 days',
        name: 'Early DOAC Start'
      },
      control: {
        percentage: 3.3,
        label: 'Primary composite outcome at 90 days',
        name: 'Delayed DOAC Start'
      }
    },
    intervention: {
      treatment: 'Direct oral anticoagulant initiated within 4 days of stroke onset',
      control: 'Direct oral anticoagulant initiated 7-14 days after stroke onset'
    },
    clinicalContext: 'OPTIMAS provided a large contemporary randomized test of early versus delayed anticoagulation after atrial-fibrillation-associated ischemic stroke and directly challenged the traditional tendency to wait.',
    pearls: [
      'Primary composite event rates were identical: 3.3% vs 3.3%',
      'Early initiation met noninferiority but not superiority',
      'Symptomatic intracranial hemorrhage was rare and similar in both groups',
      'The findings push against routine delayed DOAC initiation after AF-related stroke'
    ],
    conclusion: '',
    source: 'Werring et al. (Lancet 2024)',
    clinicalTrialsId: 'NCT03759938',
    specialDesign: 'non-inferiority',
    keyMessage: 'OPTIMAS strengthens the case for earlier anticoagulation after AF-related ischemic stroke.',
  },
  'distal-trial': {
    id: 'distal-trial',
    title: 'DISTAL Trial',
    subtitle: 'EVT for Medium/Distal Vessel Occlusion Stroke',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '543',
        label: 'Patients (M2/M3/ACA/PCA occlusions)'
      },
      primaryEndpoint: {
        value: 'mRS at 90 days',
        label: 'Modified Rankin Scale (disability)'
      },
      pValue: {
        value: '0.50',
        label: 'NOT Significant (p=0.50)'
      },
      effectSize: {
        value: 'OR 0.90',
        label: 'No Benefit (95% CI: 0.67-1.22)'
      }
    },
    trialDesign: {
      type: [
        'International, multicenter, assessor-blinded RCT',
        '1:1 randomization: EVT + BMT vs BMT alone',
        'Pragmatic design - any EVT technique allowed',
        'Treated within 24 hours of last seen well'
      ],
      timeline: 'Dec 2021 – Jul 2024, 55 sites, 11 countries (mostly Europe)'
    },
    efficacyResults: {
      treatment: {
        percentage: 34.7, // Excellent outcome (mRS 0-1)
        label: 'Median mRS: 2.0',
        name: 'EVT + Best Medical Treatment'
      },
      control: {
        percentage: 37.5, // Excellent outcome (mRS 0-1)
        label: 'Median mRS: 2.0',
        name: 'Best Medical Treatment Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Best Medical Treatment',
      control: 'Best Medical Treatment alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'EVT is proven effective for large-vessel occlusions (ICA, M1, basilar) and dominant M2 occlusions. However, benefit for medium/distal vessel occlusions remained uncertain. DISTAL tested whether EVT could help patients with smaller, more distal occlusions (nondominant M2, M3, M4, ACA, PCA segments). These vessels are technically harder to reach and have less collateral blood flow.',
    calculations: {
      // Negative trial - no NNT
    },
    proceduralDetails: {
      reperfusionRate: {
        value: '71.7%',
        label: 'Successful Reperfusion (TICI 2b-3)',
        tooltip: 'Only 71.7% achieved good reperfusion - LOWER than typical 85-90% in large-vessel EVT trials. This low reperfusion rate may explain why EVT failed. Medium/distal vessels are technically challenging.',
        color: 'warning'
      },
      imagingToPuncture: {
        value: '70 min',
        label: 'Median Time: Imaging to Groin Puncture',
        tooltip: 'Median 70 minutes exceeded the 60-minute target. Delays may have reduced EVT effectiveness, especially for distal vessels with limited collaterals.',
        color: 'warning'
      }
    },
    safetyProfile: {
      mortality: {
        evt: 15.5,
        control: 14.0,
        label: 'All-cause mortality at 90 days - SIMILAR',
        tooltip: 'Death rates were nearly identical (15.5% vs 14.0%), confirming EVT neither helped nor significantly harmed patients overall.'
      },
      sICH: {
        evt: 5.9,
        control: 2.6,
        label: 'Symptomatic ICH - HIGHER with EVT',
        tooltip: 'Symptomatic intracranial hemorrhage was MORE than doubled with EVT (5.9% vs 2.6%), though this did not translate to worse disability or death. This represents the main safety concern.',
        color: 'warning'
      }
    },
    pearls: [
      'EVT provided no disability reduction compared to medical treatment alone',
      'Primary outcome p=0.50 (not significant) - essentially no difference between groups',
      'Median mRS 2.0 in both groups at 90 days',
      'Only 71.7% achieved successful reperfusion - lower than large-vessel trials (85-90%)',
      'Symptomatic ICH doubled with EVT (5.9% vs 2.6%) without mortality benefit',
      'Median age 77 years, NIHSS 6 (relatively mild strokes)',
      'Occlusion locations: 44% M2, 27% M3, 13% P2, 6% P1',
      '65% received IV thrombolysis before/during EVT',
      'Imaging-to-puncture time: 70 min (exceeded 60-min target)',
      'No subgroup showed benefit — not younger patients, not higher NIHSS, not specific occlusion locations',
      'Clinical implication: EVT is not recommended for medium/distal vessel occlusions',
      'Low reperfusion (71.7%), longer treatment delays, and technically demanding access to distal vessels likely contributed to the negative result'
    ],
    conclusion: '',
    source: 'Psychogios M, Brehm A, et al. N Engl J Med. 2025;392(14):1374-1384',
    clinicalTrialsId: 'NCT05029414',
    specialDesign: 'negative-trial',
    keyMessage: 'EVT is ineffective for medium/distal vessel occlusions; medical treatment is standard',
    listCategory: 'thrombectomy',
    listDescription: 'EVT for medium and distal vessel occlusions — negative trial (NEJM 2025).',
  },
  'escape-mevo-trial': {
    id: 'escape-mevo-trial',
    title: 'ESCAPE-MeVO Trial',
    subtitle: 'EVT for Medium Vessel Occlusions',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '530',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.61',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'Possible Harm',
        label: '41.6% vs 43.1%'
      }
    },
    trialDesign: {
      type: [
        'Multicenter prospective randomized trial',
        'Open-label (PROBE design)',
        '1:1 allocation (EVT + Usual Care vs. Usual Care)'
      ],
      timeline: 'Enrolled 2019-2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 41.6,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'EVT + Usual Care'
      },
      control: {
        percentage: 43.1,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Usual Care Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Usual Care',
      control: 'Usual Care alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Conducted in parallel with DISTAL, the ESCAPE-MeVO trial investigated the efficacy and safety of endovascular thrombectomy for Medium Vessel Occlusions (MeVO), specifically targeting the M2/M3 MCA, A2/A3 ACA, and P2/P3 PCA segments.',
    calculations: {
      // Negative trial with harm signal - no NNT
    },
    pearls: [
      'No functional benefit (mRS 0–2: 41.6% vs 43.1%, ARR 0.95; P=0.61) — 90-day mortality was higher with EVT',
      '90-day mortality 13.3% vs 8.4% (HR 1.82, 95% CI 1.06–3.12)',
      'sICH significantly more frequent in EVT arm (5.4% vs 2.2%)',
      '12-hour treatment window from last known well',
      'NIHSS >5 or disabling deficit of 3–5, with favorable baseline imaging',
      'EVT is not recommended for routine use in medium vessel occlusions — procedural risk in smaller vessels outweighs benefit in unselected patients'
    ],
    conclusion: '',
    source: 'Goyal et al. (NEJM 2025)',
    clinicalTrialsId: 'NCT05151172',
    listCategory: 'thrombectomy',
    listDescription: 'EVT for medium vessel occlusion (MeVO) — no benefit over medical care (NEJM 2025).',
  },
  'defuse-3-trial': {
    id: 'defuse-3-trial',
    title: 'DEFUSE 3 Trial',
    subtitle: 'Thrombectomy for Ischemic Stroke (6-16 Hours)',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '182',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '28%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Blinded-endpoint assessment',
        'Perfusion imaging selection (CTP/MRI)',
        '1:1 allocation (Thrombectomy vs. Medical)'
      ],
      timeline: 'Enrolled 2016-2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 45,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy + Medical'
      },
      control: {
        percentage: 17,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Standard Medical Therapy',
      control: 'Standard Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Historically, mechanical thrombectomy was limited to 6 hours from symptom onset. The DEFUSE 3 trial aimed to determine if patients with salvageable tissue on perfusion imaging (penumbra) would benefit from treatment in the extended 6–16 hour window.',
    calculations: {
      nnt: 3.6, // 1 / (0.45 - 0.17) = 3.57 ≈ 3.6
      nntExplanation: 'For every 3.6 patients treated with thrombectomy in the 6-16 hour window, one additional patient achieves functional independence (mRS 0-2) compared to medical therapy alone'
    },
    pearls: [
      'NNT: Number Needed to Treat (NNT) for one additional patient to be functionally independent was 3.6',
      'Late window: Along with DAWN, DEFUSE-3 shifted selection from time-based to tissue-based — perfusion mismatch over clock',
      'Selection Criteria: Infarct Core < 70 ml, Mismatch Ratio ≥ 1.8, Mismatch Volume ≥ 15 ml',
      'Mortality Reduction: 14% in EVT group vs 26% in Control group (P=0.05)',
      'Safety: No significant difference in symptomatic intracranial hemorrhage (sICH) or serious adverse events',
      'Implementation: Requires automated perfusion software (e.g., RAPID) for standardized core/penumbra calculation'
    ],
    conclusion: '',
    source: 'Albers et al. (NEJM 2018)',
    clinicalTrialsId: 'NCT02586415',
    listCategory: 'thrombectomy',
    listDescription: 'Thrombectomy 6–16 hours with perfusion imaging selection.',
  },
  'dawn-trial': {
    id: 'dawn-trial',
    title: 'DAWN Trial',
    subtitle: 'Thrombectomy for Ischemic Stroke (6-24 Hours)',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '206',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Utility-weighted mRS',
        label: 'at 90 Days'
      },
      pValue: {
        value: '>99.9%',
        label: 'Superiority'
      },
      effectSize: {
        value: '36%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter prospective randomized trial',
        'Open-label adaptive design',
        'Clinical-core mismatch selection',
        '1:1 allocation (Thrombectomy vs. Control)'
      ],
      timeline: 'Enrolled 2014-2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 49,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy + Medical'
      },
      control: {
        percentage: 13,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Standard Medical Therapy',
      control: 'Standard Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'The DAWN trial investigated whether thrombectomy is effective in patients with a "Wake-Up" stroke or late presentation (6 to 24 hours) who demonstrate a clinical-core mismatch (severe deficit but small infarct core).',
    calculations: {
      nnt: 2.8, // 1 / (0.49 - 0.13) = 2.78 ≈ 2.8
      nntExplanation: 'For every 2.8 patients treated with thrombectomy in the 6-24 hour window, one additional patient achieves functional independence (mRS 0-2) compared to medical therapy alone - one of the strongest treatment effects in stroke history'
    },
    pearls: [
      'MASSIVE BENEFIT: Absolute difference in functional independence was 36%, yielding NNT of 2.8 - one of the most potent effect sizes in stroke history',
      'Probability of Superiority: >99.9%',
      'Patient Selection: Relies heavily on age and NIHSS relative to core volume (Group A: Age ≥80, NIHSS ≥10, Core <21ml; Group B: Age <80, NIHSS ≥10, Core <31ml; Group C: Age <80, NIHSS ≥20, Core 31-50ml)',
      'Wake-Up Strokes: Provided the first randomized evidence for treating patients with unknown onset time if physiology was favorable',
      'Clinical-Core Mismatch: Unlike DEFUSE-3 which uses flat core/penumbra cutoff, DAWN uses age/NIHSS-adjusted criteria'
    ],
    conclusion: '',
    source: 'Nogueira et al. (NEJM 2018)',
    clinicalTrialsId: 'NCT02142283',
    listCategory: 'thrombectomy',
    listDescription: 'Thrombectomy 6–24 hours with clinical–imaging mismatch.',
  },
  'select2-trial': {
    id: 'select2-trial',
    title: 'SELECT2 Trial',
    subtitle: 'Large Core Thrombectomy',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '352',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS distribution',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '13%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Randomized open-label international trial',
        'Large core selection (ASPECTS 3-5 or Core ≥50ml)',
        '1:1 allocation (Thrombectomy vs. Medical)'
      ],
      timeline: 'Enrolled 2019-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 20,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy'
      },
      control: {
        percentage: 7,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Management'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Medical Management',
      control: 'Medical Management alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Patients with large ischemic cores (ASPECTS < 6 or Core Volume > 50ml) were historically excluded from thrombectomy trials due to fears of futile reperfusion and hemorrhagic transformation. SELECT2 challenged this dogma.',
    calculations: {
      nnt: 7.7, // 1 / (0.20 - 0.07) = 7.69 ≈ 7.7
      nntExplanation: 'For every 7.7 patients with large core treated with thrombectomy, one additional patient achieves functional independence (mRS 0-2) compared to medical management alone'
    },
    pearls: [
      'Large core: No longer an absolute contraindication — SELECT2 showed clear functional benefit even at ASPECTS 3–5',
      'Selection Criteria: ASPECTS 3-5 on NCCT OR Core volume ≥ 50 ml on CTP',
      'Generalized Odds Ratio: 1.51 (favoring EVT)',
      'Risk/Benefit: While outcomes are generally poorer than small-core patients, EVT still provides significant shift towards lower disability (e.g., being able to walk vs bedbound)',
      'Safety: Symptomatic intracranial hemorrhage (sICH) was low and not significantly different between groups, though any ICH was more frequent in EVT group'
    ],
    conclusion: '',
    source: 'Sarraj et al. (NEJM 2023)',
    clinicalTrialsId: 'NCT03876457',
    listCategory: 'thrombectomy',
    listDescription: 'Large core thrombectomy (ASPECTS 3–5, 0–6h and extended window).',
  },
  'angel-aspect-trial': {
    id: 'angel-aspect-trial',
    title: 'ANGEL-ASPECT Trial',
    subtitle: 'Large Core Thrombectomy (China)',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '456',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS distribution',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '18.4%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Conducted in China',
        'Large core selection (ASPECTS 3-5 or Core 70-100ml)',
        '1:1 allocation (Thrombectomy vs. Medical)'
      ],
      timeline: 'Enrolled 2020-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 30,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy'
      },
      control: {
        percentage: 11.6,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Therapy'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Medical Therapy',
      control: 'Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Conducted in China, ANGEL-ASPECT complemented SELECT2 by investigating thrombectomy in patients with large infarct cores, including those with cores up to 100ml.',
    calculations: {
      nnt: 5.4, // 1 / (0.30 - 0.116) = 5.43 ≈ 5.4
      nntExplanation: 'For every 5.4 patients with large core (up to 100ml) treated with thrombectomy, one additional patient achieves functional independence (mRS 0-2) compared to medical therapy alone'
    },
    pearls: [
      'Confirmation: Validated SELECT2 findings in an Asian population with slightly different volume criteria (pushing upper limit to 100ml)',
      'Selection Criteria: ASPECTS 3-5 OR Core Volume 70-100 ml (on CTP/DWI)',
      'Generalized Odds Ratio: 1.37 (favoring EVT)',
      'Hemorrhage Risk: Statistically significant increase in symptomatic intracranial hemorrhage (sICH) in EVT group (6.1% vs 2.7%), emphasizing need for careful patient selection and BP management',
      'Mortality: Despite higher hemorrhage risk, no difference in 90-day mortality, and functional outcomes were superior',
      'Higher Core Limit: Unlike SELECT2 (50ml), this trial included cores up to 100ml'
    ],
    conclusion: '',
    source: 'Huo et al. (NEJM 2023)',
    clinicalTrialsId: 'NCT04551664',
    listCategory: 'thrombectomy',
    listDescription: 'Large core thrombectomy; China cohort (ASPECTS 3–5 or core ≥70 mL).',
  },
  'thaws-trial': {
    id: 'thaws-trial',
    title: 'THAWS Trial',
    subtitle: 'Low-Dose Alteplase for Unknown-Onset Ischemic Stroke',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '131',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.89',
        label: 'Not Significant'
      },
      effectSize: {
        value: '-1.2%',
        label: 'No Benefit'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized trial',
        'Open-label with blinded endpoint assessment',
        'MRI DWI-positive / FLAIR-negative selection',
        '1:1 allocation (Alteplase vs. Standard treatment)'
      ],
      timeline: 'Stopped early at 131 of planned 300 patients'
    },
    efficacyResults: {
      treatment: {
        percentage: 47.1,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Alteplase 0.6 mg/kg'
      },
      control: {
        percentage: 48.3,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Standard Medical Treatment'
      }
    },
    intervention: {
      treatment: 'IV Alteplase 0.6 mg/kg (10% bolus, remainder over 60 min)',
      control: 'Standard medical treatment with antithrombotic therapy per local practice'
    },
    clinicalContext: 'THAWS tested whether MRI-selected wake-up or unclear-onset ischemic stroke could benefit from low-dose alteplase (0.6 mg/kg), the dose used in Japan, using a DWI-positive and FLAIR-negative selection strategy.',
    pearls: [
      'Neutral Trial: No difference in mRS 0-1 at 90 days (47.1% vs 48.3%; P=0.89)',
      'Early Termination: The study stopped after WAKE-UP was published, leaving it underpowered for definitive conclusions',
      'Dose Distinction: THAWS evaluated alteplase 0.6 mg/kg rather than the standard 0.9 mg/kg used in WAKE-UP',
      'Safety: Symptomatic ICH was uncommon (1/71 vs 0/60), and 90-day mortality was 2/71 vs 2/60',
      'Case Mix: Investigators noted relatively mild strokes and frequent absence of large-artery occlusion'
    ],
    conclusion: '',
    source: 'Koga et al. (Stroke 2020)',
    doi: '10.1161/STROKEAHA.119.028127',
    clinicalTrialsId: 'NCT02002325',
    listCategory: 'thrombolysis',
    listDescription: 'Low-dose alteplase 0.6 mg/kg for MRI-selected unknown-onset stroke; neutral trial.',
  },
  'trace-iii-trial': {
    id: 'trace-iii-trial',
    title: 'TRACE-III Trial',
    subtitle: 'Tenecteplase for Ischemic Stroke 4.5-24 Hours Without Thrombectomy',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '516',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.03',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '8.8%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Conducted in China',
        'Perfusion imaging selection',
        '1:1 allocation (Tenecteplase vs. Standard treatment)'
      ],
      timeline: 'Published 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 33.0,
        label: 'No disability (mRS 0-1) at 90 days',
        name: 'Tenecteplase Group'
      },
      control: {
        percentage: 24.2,
        label: 'No disability (mRS 0-1) at 90 days',
        name: 'Standard Medical Treatment'
      }
    },
    intervention: {
      treatment: 'IV Tenecteplase 0.25 mg/kg (max 25 mg)',
      control: 'Standard medical treatment without routine thrombectomy access'
    },
    clinicalContext: 'TRACE-III tested late-window tenecteplase in patients with ICA or MCA occlusion, salvageable tissue on perfusion imaging, and no access to endovascular thrombectomy.',
    calculations: {
      nnt: 11.4,
      nntExplanation: 'For every 11.4 perfusion-selected late-window LVO patients treated with tenecteplase when EVT is unavailable, one additional patient achieves mRS 0-1 at 90 days compared with standard medical treatment'
    },
    pearls: [
      'Late-Window Basis: TRACE-III is the key trial supporting thrombolysis up to 24 hours for selected ICA/MCA occlusions when EVT cannot be performed',
      'Selection Criteria: Required salvageable tissue on perfusion imaging and enrollment 4.5-24 hours from last-known-well',
      'Wake-Up Eligible: Stroke on awakening and unwitnessed stroke were included if within 24 hours from last-known-well',
      'Not a Bridging Trial: Patients were enrolled because thrombectomy was not available; this does not justify delaying rapid EVT',
      'Safety Trade-off: Symptomatic ICH was higher with tenecteplase (3.0% vs 0.8%), while mortality was similar (13.3% vs 13.1%)'
    ],
    conclusion: '',
    source: 'Xiong et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2402980',
    clinicalTrialsId: 'NCT05141305',
    listCategory: 'thrombolysis',
    listDescription: 'Late-window tenecteplase 4.5-24h for ICA/MCA occlusion when EVT is unavailable.',
  },
  'wake-up-trial': {
    id: 'wake-up-trial',
    title: 'WAKE-UP Trial',
    subtitle: 'MRI-Guided Thrombolysis for Stroke with Unknown Time of Onset',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '503',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.02',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '11.5%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multi-center randomized controlled trial',
        'Double-blind, placebo-controlled',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled Sep 2012 – Jun 2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 53.3,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Alteplase Group'
      },
      control: {
        percentage: 41.8,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: '0.9 mg/kg IV (10% bolus, 90% over 60 min)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'WAKE-UP tested whether MRI DWI-FLAIR mismatch could identify patients with unknown-onset ischemic stroke who were still likely within a treatable thrombolysis window despite uncertain clock time.',
    calculations: {
      nnt: 8.7, // 1 / (0.533 - 0.418) = 8.70 ≈ 8.7
      nntExplanation: 'For every 8.7 patients with wake-up stroke and DWI-FLAIR mismatch treated with tPA, one additional patient achieves excellent outcome (mRS 0-1) compared to placebo'
    },
    pearls: [
      'First randomized evidence that MRI-selected unknown-onset stroke can benefit from alteplase',
      'Tissue Clock: DWI-FLAIR mismatch identifies patients likely within the prior 4.5 hours despite uncertain onset',
      'Functional Benefit: mRS 0-1 at 90 days improved from 41.8% to 53.3% (NNT 8.7)',
      'Important Exclusion: Patients with planned thrombectomy were excluded from WAKE-UP',
      'Safety: Symptomatic ICH was 2.0% vs 0.4%, and mortality was numerically higher at 4.1% vs 1.2%'
    ],
    conclusion: '',
    source: 'Thomalla et al. (NEJM 2018)',
    doi: '10.1056/NEJMoa1804355',
    clinicalTrialsId: 'NCT01525290',
    listCategory: 'thrombolysis',
    listDescription: 'MRI DWI–FLAIR mismatch for thrombolysis in unknown-onset stroke.',
  },
  // ========== BASILAR ARTERY TRIALS ==========
  'attention-trial': {
    id: 'attention-trial',
    title: 'ATTENTION Trial',
    subtitle: 'Basilar Artery EVT',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '340',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '23%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Conducted in China',
        '1:1 allocation (EVT vs. BMT)'
      ],
      timeline: 'Enrolled 2020-2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 46,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'EVT + BMT'
      },
      control: {
        percentage: 23,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'BMT Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (EVT) (+/- tPA) + Best Medical Therapy',
      control: 'Best Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Basilar Artery Occlusion (BAO) carries high mortality (>80% without treatment). Early trials (BEST, BASICS) were inconclusive due to crossover and slow recruitment. ATTENTION (and BAOCHE) provided definitive evidence.',
    calculations: {
      nnt: 4.3, // 1 / (0.46 - 0.23) = 4.35 ≈ 4.3
      nntExplanation: 'For every 4.3 patients with basilar artery occlusion treated with thrombectomy within 12 hours, one additional patient achieves good functional status (mRS 0-3) compared to best medical therapy alone'
    },
    pearls: [
      'Definitive Benefit: Unlike anterior circulation where mRS 0-2 is the goal, BAO trials often use mRS 0-3 because the natural history is so devastating. EVT doubled the rate of good outcomes',
      'Mortality Reduction: One of the few stroke interventions shown to significantly reduce mortality (37% vs 55%, NNT ~5.5 to prevent death)',
      'Bridging: ~30% of patients received IV thrombolysis',
      'Time Window: Within 12 hours of estimated onset',
      'Symptomatic ICH: 5% in EVT vs 0% in BMT (acceptable risk given mortality benefit)'
    ],
    conclusion: '',
    source: 'Tao et al. (NEJM 2022)',
    clinicalTrialsId: 'NCT04751708',
    listCategory: 'thrombectomy',
    listDescription: 'Basilar artery thrombectomy within 12 hours; China trial.',
  },
  'baoche-trial': {
    id: 'baoche-trial',
    title: 'BAOCHE Trial',
    subtitle: 'Basilar EVT 6-24 Hours',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '217',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '22%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Conducted in China',
        'Late window (6-24 hours)',
        '1:1 allocation (Thrombectomy vs. Medical)'
      ],
      timeline: 'Enrolled 2020-2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 46,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'Thrombectomy'
      },
      control: {
        percentage: 24,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'Best Medical Therapy'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Best Medical Therapy',
      control: 'Best Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Following the success of extended window thrombectomy in the anterior circulation (DAWN/DEFUSE-3), BAOCHE examined the 6-24 hour window for Basilar Artery Occlusion.',
    calculations: {
      nnt: 4.5, // 1 / (0.46 - 0.24) = 4.55 ≈ 4.5
      nntExplanation: 'For every 4.5 patients with basilar artery occlusion treated with thrombectomy in the 6-24 hour window, one additional patient achieves good functional status (mRS 0-3) compared to medical therapy alone'
    },
    pearls: [
      'Late Window Basilar: Confirms that the basilar artery also has a "late window" benefit, likely due to collateral flow from the posterior communicating arteries',
      'High Efficacy: The effect size was remarkably similar to the early window ATTENTION trial (46% good outcome in both)',
      'Mortality: 31% in EVT group vs 42% in Control group',
      'Selection: Used clinical exclusion (severe disability) but did not strictly require perfusion imaging mismatch, though pc-ASPECTS was assessed',
      'Recommendation: EVT is now recommended for BAO up to 24 hours in eligible patients'
    ],
    conclusion: '',
    source: 'Jovin et al. (NEJM 2022)',
    clinicalTrialsId: 'NCT02737189',
    listCategory: 'thrombectomy',
    listDescription: 'Basilar EVT 6–24 hours with imaging selection.',
  },
  // ========== ANTIPLATELET & SECONDARY PREVENTION TRIALS ==========
  'chance-trial': {
    id: 'chance-trial',
    title: 'CHANCE Trial',
    subtitle: 'Clopidogrel with Aspirin in Acute Minor Stroke or Transient Ischemic Attack',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    stats: {
      sampleSize: {
        value: '5,170',
        label: 'Randomized Patients',
        info: 'Included patients with: (1) Minor ischemic stroke (NIHSS ≤3), OR (2) High-risk TIA (ABCD² ≥4). All enrolled within 24 hours of symptom onset. Demographics: median age 62 years, 33.8% female, 72% had minor stroke, 28% had TIA. Conducted at 114 centers in China.'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence',
        label: 'at 90 Days',
        info: 'Primary outcome was ANY stroke (ischemic or hemorrhagic) within 90 days of randomization. This endpoint captures the critical high-risk period after TIA/minor stroke, when most recurrent strokes occur (especially in the first 48-72 hours).'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.',
        info: 'p<0.001 means the benefit of dual antiplatelet therapy is EXTREMELY unlikely to be due to chance (less than 0.1% probability). This is one of the strongest levels of statistical significance in clinical trials.',
        highlight: true
      },
      effectSize: {
        value: '3.5%',
        label: 'Absolute Reduction',
        info: 'Absolute risk reduction: 11.7% (aspirin alone) - 8.2% (clopidogrel + aspirin) = 3.5%. This means that for every 100 patients treated with dual therapy instead of aspirin alone, 3.5 fewer strokes occur over 90 days. This translates to a Number Needed to Treat (NNT) of 29.',
        highlight: true
      },
      absoluteReduction: {
        value: '3.5%',
        label: 'Absolute Benefit',
        info: 'For every 100 patients treated with DAPT instead of aspirin alone, 3.5 fewer strokes occur over 90 days. Combined with the highly significant p-value (<0.001) and narrow confidence interval, this demonstrates both statistical significance AND clinical meaningfulness.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        'Conducted in China (114 centers)',
        '1:1 allocation (DAPT vs. Aspirin)',
        'Double-dummy design to maintain blinding'
      ],
      timeline: 'Enrolled 2009-2012',
      sampleSize: {
        value: '5,170 patients',
        info: 'Sample size calculation: 5,100 patients needed to detect 22% relative risk reduction with 90% power, two-sided alpha 0.05, assuming 14% event rate in aspirin group and 5% withdrawal rate. Final enrollment: 5,170 patients randomized at 114 centers. Excellent retention: only 0.7% lost to follow-up (36/5170 patients).'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence at 90 days',
        info: 'Any stroke (ischemic or hemorrhagic) within 90 days of randomization, assessed by blinded adjudication committee. Ischemic stroke defined as acute focal infarction with neurologic deficit lasting ≥24 hours or <24 hours with neuroimaging evidence of new infarction.'
      },
      pValue: {
        value: 'HR 0.68 (95% CI: 0.57-0.81), p<0.001',
        info: 'Hazard ratio 0.68 represents a 32% relative risk reduction in stroke recurrence with dual antiplatelet therapy compared to aspirin alone. The narrow confidence interval (0.57-0.81) indicates high precision of the estimate.'
      },
      nnt: {
        value: '29',
        info: 'Number Needed to Treat (NNT) = 29. Calculated from absolute risk reduction: 1 / (0.117 - 0.082) = 1 / 0.035 = 28.6 ≈ 29. This means treating 29 patients with DAPT instead of aspirin alone prevents one stroke over 90 days. For context: NNT <10 is very effective, NNT 10-30 is clinically worthwhile, NNT >100 is marginal. CHANCE\'s NNT of 29 is considered excellent for secondary prevention.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 8.2,
        label: 'Stroke recurrence (ischemic or hemorrhagic) at 90 days',
        name: 'DAPT (Clopidogrel + Aspirin)'
      },
      control: {
        percentage: 11.7,
        label: 'Stroke recurrence (ischemic or hemorrhagic) at 90 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'Clopidogrel (300mg load, then 75mg/d) + Aspirin (75mg/d) for 21 days, followed by Clopidogrel monotherapy',
        description: 'Day 1: Clopidogrel 300mg loading dose + aspirin 75-300mg (clinician-determined). Days 2-21: Clopidogrel 75mg daily + aspirin 75mg daily. Days 22-90: Clopidogrel 75mg daily alone.',
        details: [
          'Loading dose on Day 1: Clopidogrel 300mg + aspirin 75-300mg',
          'Dual therapy Days 2-21: Clopidogrel 75mg + aspirin 75mg daily',
          'Monotherapy Days 22-90: Clopidogrel 75mg daily alone',
          'Median time to treatment: 13 hours from symptom onset',
          '49.5% enrolled within 12 hours of symptom onset'
        ]
      },
      control: {
        name: 'Aspirin (75mg/d) for 90 days',
        description: 'Day 1: Aspirin 75-300mg + placebo clopidogrel. Days 2-90: Aspirin 75mg daily + placebo clopidogrel.',
        details: [
          'Day 1: Aspirin 75-300mg + placebo clopidogrel',
          'Days 2-90: Aspirin 75mg daily + placebo clopidogrel',
          'Double-dummy design to maintain blinding'
        ]
      }
    },
    clinicalContext: 'After TIA or minor stroke, 10-20% of patients have recurrent stroke within 3 months, with most occurring in the first 2 days. This "high-risk window" represents an opportunity for aggressive early prevention. Previous trials of long-term dual antiplatelet therapy (MATCH, CHARISMA, SPS3) showed no benefit and increased bleeding because they enrolled weeks/months after the event and did not target the acute high-risk period. CHANCE tested whether starting dual therapy within 24 hours and continuing for only 21 days (the highest-risk period) could prevent early recurrent strokes while minimizing bleeding risk. The mechanism: Aspirin and clopidogrel synergistically inhibit platelet aggregation through different mechanisms (COX-1 vs P2Y12 pathways). This dual inhibition is most beneficial when platelet activation is highest - immediately after an acute thrombotic event.',
    calculations: {
      nnt: 29, // 1 / (0.117 - 0.082) = 28.57 ≈ 29
      nntExplanation: 'For every 29 patients with minor stroke or high-risk TIA treated with DAPT for 21 days, one additional stroke recurrence is prevented compared to aspirin alone. The benefit was most pronounced in the first 7 days when stroke risk is highest, with Kaplan-Meier curves diverging dramatically in the first week then remaining parallel.'
    },
    pearls: [
      'Clopidogrel + aspirin reduced stroke by 32% (HR 0.68, p<0.001)',
      'Absolute risk reduction: 3.5% → NNT = 29 to prevent one stroke over 90 days',
      'Benefit most pronounced in first 7 days when stroke risk is highest',
      'No increase in severe hemorrhage (0.3% both groups)',
      'No increase in hemorrhagic stroke (0.3% both groups)',
      'Mild bleeding slightly increased (2.3% vs 1.6%, p=0.09 not significant)',
      'Treatment must start within 24 hours of symptom onset',
      'Treatment duration: 21 days of dual therapy, then clopidogrel alone to day 90',
      'Loading dose strategy: Clopidogrel 300mg + aspirin 75-300mg on Day 1',
      'Population: Minor stroke (NIHSS ≤3) or high-risk TIA (ABCD² ≥4) only',
      'Median NIHSS = 3, indicating mild deficits despite "minor" label',
      'Median time to treatment: 13 hours (range: 8-18 hours)',
      '49.5% enrolled within 12 hours',
      'Benefit consistent across all subgroups — no significant interactions',
      'Excellent retention: Only 0.7% lost to follow-up (36/5170 patients)',
      'Conducted entirely in China - generalizability initially questioned',
      'POINT trial (US) later confirmed results with tighter time window (<12h)',
      'Kaplan-Meier curves diverged dramatically in first week, then plateaued',
      'Changed international guidelines: AHA/ASA now recommends DAPT for 21 days (Class IIa)',
      'Combined with POINT, established DAPT as standard of care for minor stroke/high-risk TIA'
    ],
    conclusion: '',
    source: 'Wang Y, Wang Y, Zhao X, et al. Clopidogrel with aspirin in acute minor stroke or transient ischemic attack. N Engl J Med. 2013;369(1):11-19.',
    doi: '10.1056/NEJMoa1215340',
    pmid: '23803136',
    clinicalTrialsId: 'NCT00979589',
    keyMessage: 'Start clopidogrel + aspirin within 24 hours of minor stroke or high-risk TIA to prevent early recurrent stroke. Dual therapy for 21 days, then clopidogrel alone.',
    safetyData: 'No increase in severe hemorrhage. Moderate-to-severe hemorrhage (GUSTO criteria): 0.3% (7/2584) in DAPT group vs 0.3% (8/2586) in aspirin group, p=0.73. Hemorrhagic stroke: 0.3% in both groups, p=0.98. Any bleeding: 2.3% vs 1.6%, p=0.09 (not significant), driven by MILD bleeding (bruising, oozing) that did not require transfusion. The trial demonstrated that short-term (21 days) dual antiplatelet therapy in carefully selected patients (minor stroke/high-risk TIA, no contraindications) can provide substantial benefit WITHOUT increasing the risk of major hemorrhage.',
    educationalContext: 'CHANCE worked where MATCH, CHARISMA, and SPS3 failed by targeting the acute high-risk window. Those earlier trials enrolled patients weeks to months after the event and used long-term dual therapy — both decisions raised bleeding risk without capturing the period when recurrence risk peaks. Limiting dual therapy to 21 days starting within 24 hours hit the recurrence peak while keeping hemorrhage risk low.',
    clinicalApplication: 'ELIGIBLE PATIENTS: (1) Minor stroke (NIHSS ≤3) OR high-risk TIA (ABCD² ≥4), (2) Within 24 hours of symptom onset (ideally within 12 hours), (3) No contraindication to antiplatelet therapy, (4) No indication for anticoagulation (e.g., atrial fibrillation), (5) No recent major surgery or GI bleeding, (6) Independent at baseline (mRS ≤2). TREATMENT PROTOCOL: Day 1: Clopidogrel 300mg loading + aspirin 75-300mg; Days 2-21: Clopidogrel 75mg + aspirin 75mg daily; Days 22-90: Clopidogrel 75mg daily alone. EXPECTED BENEFIT: 32% relative risk reduction, 3.5% absolute reduction, NNT=29, no increase in severe bleeding. DO NOT USE IF: Atrial fibrillation, recent major surgery/GI bleeding (<3 months), severe stroke (NIHSS >3), low-risk TIA (ABCD² <4), known high bleeding risk, planned revascularization. PRACTICAL TIPS: Start ASAP after stroke/TIA onset, obtain brain imaging to exclude hemorrhage first, calculate ABCD² score for TIA patients, counsel about mild bleeding risk (bruising common but safe), transition to monotherapy at Day 22 (set reminder).',
    limitations: [
      'Conducted entirely in China - generalizability to other populations uncertain at time (later confirmed by POINT trial in US)',
      'Higher prevalence of intracranial atherosclerosis in Chinese population vs Western populations',
      'Genetic polymorphisms affecting clopidogrel metabolism (CYP2C19) more common in Asian populations',
      'Open-label aspirin on Day 1 (dose 75-300mg at clinician discretion)',
      'Excluded low-risk TIA patients (ABCD² <4) - results do not apply to this group',
      'Excluded patients with severe stroke (NIHSS ≥4) - results do not apply to moderate/severe strokes',
      'Excluded patients with clear indication for anticoagulation (e.g., atrial fibrillation)',
      'Short follow-up (90 days) - long-term outcomes unknown',
      'TIA diagnosis can be challenging - potential for enrollment of "TIA mimics" despite exclusion criteria'
    ],
    listCategory: 'antiplatelets',
    listDescription: 'DAPT (clopidogrel + aspirin) after TIA/minor stroke; NNT=29. AHA 2026 COR 1.',
  },
  'point-trial': {
    id: 'point-trial',
    title: 'POINT Trial',
    subtitle: 'DAPT in International Population',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '4,881',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Ischemic events',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.02',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '1.5%',
        label: 'Absolute Reduction'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind international trial',
        '1:1 allocation (DAPT vs. Aspirin)'
      ],
      timeline: 'Enrolled 2010-2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 5.0,
        label: 'Major ischemic events (stroke, MI, or ischemic vascular death) at 90 days',
        name: 'DAPT (Clopidogrel + Aspirin)'
      },
      control: {
        percentage: 6.5,
        label: 'Major ischemic events (stroke, MI, or ischemic vascular death) at 90 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: 'Clopidogrel (600mg load, then 75mg/d) + Aspirin (50-325mg/d) for 90 days',
      control: 'Aspirin alone'
    },
    clinicalContext: 'Following the CHANCE trial in China, the POINT trial sought to confirm the benefits of DAPT in an international (Western) population with slightly different loading protocols.',
    calculations: {
      nnt: 66.7, // 1 / (0.065 - 0.050) = 66.67 ≈ 66.7
      nntExplanation: 'For every 66.7 patients with minor stroke or high-risk TIA treated with DAPT for 90 days, one additional major ischemic event is prevented compared to aspirin alone'
    },
    pearls: [
      'Confirms CHANCE: Validated the efficacy of DAPT for minor stroke/TIA in a Western population',
      'Bleeding Risk: Unlike CHANCE, POINT showed a statistically significant increase in major hemorrhage (0.9% vs 0.4%, P=0.02)',
      'Time Course: Benefit was driven primarily by reduction in stroke during the first 7 to 21 days. The bleeding risk persisted throughout the 90 days',
      'Guideline Consensus: Combined with CHANCE, this led to guidelines recommending DAPT for 21 days only, rather than the 90 days tested in POINT, to balance efficacy vs safety',
      'Population: Minor ischemic stroke (NIHSS ≤ 3) or high-risk TIA (ABCD² ≥ 4) within 12 hours'
    ],
    conclusion: '',
    source: 'Johnston et al. (NEJM 2018)',
    clinicalTrialsId: 'NCT00991029',
    listCategory: 'antiplatelets',
    listDescription: 'Dual antiplatelet in TIA and minor stroke (Western population); NNT=67.',
  },
  'sammpris-trial': {
    id: 'sammpris-trial',
    title: 'SAMMPRIS Trial',
    subtitle: 'ICAD Stenting vs Medical',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '451',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Stroke/death',
        label: 'within 30 Days'
      },
      pValue: {
        value: '0.002',
        label: 'Stenting WORSE'
      },
      effectSize: {
        value: 'Harm',
        label: '14.7% vs 5.8%'
      }
    },
    trialDesign: {
      type: [
        'Randomized open-label trial',
        'Stopped early due to harm',
        '1:1 allocation (Stenting vs. Medical)'
      ],
      timeline: 'Enrolled 2008-2011 (stopped early)'
    },
    efficacyResults: {
      treatment: {
        percentage: 14.7,
        label: '30-day stroke/death rate',
        name: 'Stenting + AMM'
      },
      control: {
        percentage: 5.8,
        label: '30-day stroke/death rate',
        name: 'Aggressive Medical Management (AMM)'
      }
    },
    intervention: {
      treatment: 'Percutaneous Transluminal Angioplasty and Stenting (PTAS) with Wingspan stent + Aggressive Medical Management',
      control: 'Aggressive Medical Management alone (DAPT for 90 days, Rosuvastatin 20mg, BP < 140/90)'
    },
    clinicalContext: 'Intracranial Atherosclerotic Disease (ICAD) carries a high risk of recurrent stroke. SAMMPRIS investigated whether percutaneous transluminal angioplasty and stenting (PTAS) was superior to aggressive medical management alone.',
    calculations: {
      // Negative trial - stenting worse
    },
    pearls: [
      'Stenting is Dangerous: The trial was halted early because the stenting group had significantly higher rates of periprocedural stroke',
      'Aggressive Medical Management (AMM): The "Control" group did surprisingly well compared to historical controls (WASID trial), proving that AMM (DAPT + High-intensity Statin + BP control) is a highly effective strategy',
      '1-Year Results: 20.0% in Stenting group vs 12.2% in Medical group (continued harm signal)',
      'Standard of Care: AMM is now the first-line treatment for symptomatic ICAD. Stenting is reserved for salvage cases failing AMM',
      'Population: Patients with 70-99% stenosis of a major intracranial artery and a recent (last 30 days) TIA or stroke'
    ],
    conclusion: '',
    source: 'Chimowitz et al. (NEJM 2011)',
    clinicalTrialsId: 'NCT00576693',
    listCategory: 'carotid',
    listDescription: 'Intracranial stenting vs medical therapy for stenosis — medical management wins.',
  },
  'weave-trial': {
    id: 'weave-trial',
    title: 'WEAVE Trial',
    subtitle: 'Wingspan Stent On-Label',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '152',
        label: 'Consecutive Patients'
      },
      primaryEndpoint: {
        value: 'Stroke/death',
        label: 'within 72 Hours'
      },
      pValue: {
        value: 'N/A',
        label: 'Single-Arm Study'
      },
      effectSize: {
        value: '2.6%',
        label: 'Safety Benchmark Met'
      }
    },
    trialDesign: {
      type: [
        'Prospective single-arm post-market surveillance',
        'FDA-mandated safety study',
        'On-label usage only'
      ],
      timeline: 'Enrolled 2014-2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 2.6,
        label: 'Periprocedural stroke/death within 72 hours',
        name: 'Wingspan Stent'
      },
      control: {
        percentage: 14.7,
        label: 'Historical control (SAMMPRIS stenting arm)',
        name: 'SAMMPRIS Stenting'
      }
    },
    intervention: {
      treatment: 'Angioplasty and Stenting with Wingspan Stent System (strict on-label criteria)',
      control: 'Historical control: SAMMPRIS stenting arm (14.7% event rate)'
    },
    clinicalContext: 'Following the poor outcomes of intracranial stenting in SAMMPRIS (14.7% event rate), the FDA mandated a post-market surveillance study to assess the safety of the Wingspan stent when used strictly "on-label" by experienced interventionalists.',
    calculations: {
      // Safety trial - no NNT calculation
    },
    pearls: [
      'Patient Selection: This trial demonstrated that intracranial stenting can be performed safely (2.6% risk vs 14.7% in SAMMPRIS) if strict selection criteria are followed, particularly waiting >8 days after stroke and requiring demonstrated failure of medical therapy (2 recurrent strokes)',
      'Experience Matters: The trial used experienced interventionalists, which likely contributed to the lower complication rate',
      'Role of Stenting: While WEAVE assessed safety (not efficacy vs medical therapy), it reopened the door for stenting as a viable salvage option for highly selected refractory patients',
      'On-Label Criteria: Symptomatic ICAD 70-99%, recurrent stroke despite medical therapy (at least 2 strokes in territory), Age 22-80, mRS ≤ 3, >8 days from most recent stroke',
      'Safety Benchmark: Significantly lower than the 4% safety benchmark set by the FDA'
    ],
    conclusion: '',
    source: 'Alexander et al. (Stroke 2019)',
    clinicalTrialsId: 'NCT02034058',
    listCategory: 'carotid',
    listDescription: 'Perioperative outcomes of Wingspan carotid stenting with strict on-label criteria.',
  },
  'socrates-trial': {
    id: 'socrates-trial',
    title: 'SOCRATES Trial',
    subtitle: 'Ticagrelor vs Aspirin',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '13,199',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Stroke/MI/death',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.07',
        label: 'Not Significant'
      },
      effectSize: {
        value: '0.8%',
        label: 'Trend (Not Significant)'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind trial',
        '1:1 allocation (Ticagrelor vs. Aspirin)'
      ],
      timeline: 'Enrolled 2014-2015'
    },
    efficacyResults: {
      treatment: {
        percentage: 6.7,
        label: 'Composite of stroke, MI, or death at 90 days',
        name: 'Ticagrelor'
      },
      control: {
        percentage: 7.5,
        label: 'Composite of stroke, MI, or death at 90 days',
        name: 'Aspirin'
      }
    },
    intervention: {
      treatment: 'Ticagrelor (180mg load, then 90mg BID)',
      control: 'Aspirin (300mg load, then 100mg daily)'
    },
    clinicalContext: 'Ticagrelor is a potent antiplatelet agent used in cardiology. SOCRATES aimed to see if Ticagrelor monotherapy was superior to Aspirin monotherapy for acute stroke/TIA.',
    calculations: {
      // Negative trial - not significant
    },
    pearls: [
      'Negative Trial: Ticagrelor was not superior to Aspirin in the broad population of minor stroke/TIA',
      'Subgroup Analysis: There was a suggestion of benefit in patients with ipsilateral stenosis, but this was exploratory',
      'THALES Trial: A subsequent trial (THALES) later showed that Ticagrelor + Aspirin (DAPT) was superior to Aspirin alone, but with increased bleeding, similar to the CHANCE/POINT results for Clopidogrel',
      'Current Use: Clopidogrel + Aspirin remains the preferred DAPT regimen unless there is Clopidogrel resistance (CYP2C19 status)',
      'Population: Acute mild-to-moderate ischemic stroke (NIHSS ≤ 5) or high-risk TIA'
    ],
    conclusion: '',
    source: 'Johnston et al. (NEJM 2016)',
    clinicalTrialsId: 'NCT01994720',
    listCategory: 'antiplatelets',
    listDescription: 'Ticagrelor vs aspirin monotherapy in acute ischemic stroke — not superior.',
  },
  'sps3-trial': {
    id: 'sps3-trial',
    title: 'SPS3 Trial',
    subtitle: 'DAPT in Lacunar Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '3,020',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Recurrent stroke',
        label: 'per Year'
      },
      pValue: {
        value: '0.48',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'No Benefit',
        label: '2.5% vs 2.7%'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind multicenter trial',
        'Stopped early due to harm',
        '1:1 allocation (DAPT vs. Aspirin)'
      ],
      timeline: 'Enrolled 2003-2011 (stopped early)'
    },
    efficacyResults: {
      treatment: {
        percentage: 2.5,
        label: 'Recurrent stroke rate per year',
        name: 'DAPT (Aspirin + Clopidogrel)'
      },
      control: {
        percentage: 2.7,
        label: 'Recurrent stroke rate per year',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: 'Aspirin (325mg) + Clopidogrel (75mg)',
      control: 'Aspirin (325mg) + Placebo'
    },
    clinicalContext: 'Small subcortical strokes (lacunar infarcts) are common. SPS3 investigated two questions: BP targets (Standard vs Intensive) and Antiplatelets (DAPT vs Aspirin) for secondary prevention. This entry focuses on the Antiplatelet arm.',
    calculations: {
      // Negative/harmful trial - no NNT
    },
    pearls: [
      'Do NOT use DAPT for Lacunes: Unlike large vessel disease or acute minor stroke (CHANCE/POINT), long-term DAPT is harmful in established lacunar stroke patients',
      'Mortality Signal: The trial was stopped early due to lack of benefit and increased mortality/bleeding in the DAPT arm (HR 1.52, P=0.004)',
      'Major Bleeding: Nearly doubled in DAPT group (2.1% vs 1.1%)',
      'Mechanism: Lacunar disease is often a small vessel lipohyalinosis pathology, which may be less responsive to aggressive platelet inhibition compared to large artery atherosclerosis, but is prone to hemorrhage',
      'Population: MRI-confirmed symptomatic lacunar infarctions'
    ],
    conclusion: '',
    source: 'SPS3 Investigators (NEJM 2012)',
    clinicalTrialsId: 'NCT00059306',
    listCategory: 'antiplatelets',
    listDescription: 'DAPT not beneficial in lacunar stroke — increased bleeding without stroke reduction.',
  },
  'sparcl-trial': {
    id: 'sparcl-trial',
    title: 'SPARCL Trial',
    subtitle: 'Statins in Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '4,731',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Fatal or non-fatal stroke',
        label: 'Recurrence'
      },
      pValue: {
        value: '0.03',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '1.9%',
        label: 'Absolute Reduction'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        '1:1 allocation (Atorvastatin vs. Placebo)'
      ],
      timeline: 'Enrolled 2001-2005'
    },
    efficacyResults: {
      treatment: {
        percentage: 11.2,
        label: 'Fatal or non-fatal stroke recurrence',
        name: 'Atorvastatin 80mg'
      },
      control: {
        percentage: 13.1,
        label: 'Fatal or non-fatal stroke recurrence',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Atorvastatin 80 mg daily',
      control: 'Placebo'
    },
    clinicalContext: 'Statins are known to reduce stroke risk in patients with coronary artery disease. The SPARCL trial investigated whether high-dose atorvastatin reduces the risk of recurrent stroke in patients with recent stroke or TIA without known coronary heart disease.',
    calculations: {
      nnt: 52.6, // 1 / (0.131 - 0.112) = 52.63 ≈ 52.6
      nntExplanation: 'For every 52.6 patients with recent stroke or TIA treated with high-intensity atorvastatin, one additional stroke recurrence is prevented compared to placebo'
    },
    pearls: [
      'Standard of Care: Established high-intensity statin (Atorvastatin 80mg) as the standard of care for secondary prevention of non-cardioembolic ischemic stroke',
      'Hemorrhage Risk: There was a small but statistically significant increase in hemorrhagic stroke in the Atorvastatin group (2.3% vs 1.4%), though the overall benefit for ischemic stroke reduction outweighed this risk',
      'LDL Reduction: The treatment group achieved a mean LDL of 73 mg/dL compared to 129 mg/dL in the placebo group',
      'Major Coronary Events: Significant reduction (HR 0.65)',
      'Population: Stroke or TIA within 1–6 months, LDL 100–190 mg/dL, and no known coronary heart disease'
    ],
    conclusion: '',
    source: 'Amarenco et al. (NEJM 2006)',
    clinicalTrialsId: 'NCT00147602',
    listCategory: 'antiplatelets',
    listDescription: 'High-intensity statin (atorvastatin 80mg) for secondary stroke prevention; NNT=53.',
  },
  'elan-study': {
    id: 'elan-study',
    title: 'ELAN Trial',
    subtitle: 'Early versus Later Anticoagulation for Stroke with Atrial Fibrillation',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '2,013',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Composite at 30d',
        label: 'Stroke/Embolism/Bleeding/Death'
      },
      pValue: {
        value: 'N/A',
        label: 'Estimation Design (Not Superiority)'
      },
      effectSize: {
        value: '-1.18%',
        label: 'Risk Difference (95% CI: -2.84 to 0.47)'
      }
    },
    trialDesign: {
      type: [
        'International, multicenter, open-label, assessor-blinded trial',
        '1:1 randomization to early vs later DOAC initiation',
        'Imaging-based stroke severity classification (minor/moderate/major)'
      ],
      timeline: 'Enrolled Nov 2017 – Sep 2022, 103 sites, 15 countries'
    },
    efficacyResults: {
      treatment: {
        percentage: 2.9,
        label: 'Primary composite outcome at 30 days',
        name: 'Early DOAC (within 48h minor/moderate, day 6-7 major)'
      },
      control: {
        percentage: 4.1,
        label: 'Primary composite outcome at 30 days',
        name: 'Later DOAC (day 3-4 minor, 6-7 moderate, 12-14 major)'
      }
    },
    additionalResults: {
      recurrentStroke: {
        early: 1.4,
        later: 2.5,
        label: 'Recurrent ischemic stroke at 30 days (most important component)'
      },
      symptomaticICH: {
        early: 0.2,
        later: 0.2,
        label: 'Symptomatic intracranial hemorrhage - EQUAL (safe)'
      }
    },
    intervention: {
      treatment: 'Early DOAC initiation: Within 48h for minor/moderate stroke, Day 6-7 for major stroke. Any approved DOAC at appropriate dose.',
      control: 'Later DOAC initiation (1-3-6-12 day rule): Day 3-4 for minor, Day 6-7 for moderate, Day 12-14 for major stroke'
    },
    clinicalContext: 'Approximately 14-27% of acute ischemic strokes occur with unknown onset time in patients with atrial fibrillation. The optimal timing of DOAC initiation after acute stroke has been debated - early initiation may increase hemorrhagic transformation risk, while delayed initiation may increase recurrent stroke risk. ELAN investigated whether early, imaging-guided DOAC initiation is safe compared to guideline-based later initiation using the widely-followed "1-3-6-12 day rule" based on stroke severity.',
    calculations: {
      // Estimation trial - NNT not applicable in traditional sense
      // Risk difference: -1.18% (95% CI: -2.84 to 0.47)
    },
    pearls: [
      'Estimation trial (not superiority) — establishes safe range for practice',
      'Risk difference: -1.18% (95% CI: -2.84 to 0.47) - early treatment ranges from 2.8% better to 0.5% worse',
      'Recurrent ischemic stroke: 1.4% (early) vs 2.5% (later) - trend favoring early treatment',
      'Symptomatic ICH: 0.2% in both groups — bleeding risk not increased with early treatment',
      'Imaging-based classification (not NIHSS-based) used to determine timing',
      'Stroke severity: 37% minor, 40% moderate, 23% major',
      'Used any approved DOAC at appropriate dose (not drug-specific)',
      '98% probability that early treatment increases risk by no more than 0.5 percentage points',
      'Primary outcome at 90 days (exploratory): 3.7% (early) vs 5.6% (later)',
      'Most patients were from European centers - generalizability to other populations unclear'
    ],
    conclusion: '',
    source: 'Fischer U, et al. N Engl J Med. 2023;388(26):2411-2421',
    clinicalTrialsId: 'NCT03148457',
    specialDesign: 'estimation-trial',
    keyMessage: 'Early DOAC initiation is safe — use if clinically indicated after imaging review',
    listCategory: 'antiplatelets',
    listDescription: 'Early vs delayed DOAC initiation after stroke with atrial fibrillation — early is safe.',
  },

  // ─── THALES TRIAL ─────────────────────────────────────────────────────────
  'thales-trial': {
    id: 'thales-trial',
    title: 'THALES Trial',
    subtitle: 'Ticagrelor + Aspirin vs Aspirin Alone After Minor Stroke or TIA',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    specialDesign: 'negative-trial',
    stats: {
      sampleSize: {
        value: '11,016',
        label: 'Randomized Patients',
        info: 'Patients with acute noncardioembolic minor ischemic stroke (NIHSS ≤5) or high-risk TIA (ABCD2 ≥6) enrolled within 24 hours. 414 sites, 28 countries. Mean age 65 years, 37% female.'
      },
      primaryEndpoint: {
        value: 'Stroke/death',
        label: 'at 30 Days',
        info: 'Composite of stroke (ischemic or hemorrhagic) or death within 30 days of randomization.'
      },
      pValue: {
        value: '0.02',
        label: 'Stat. Significant',
        info: 'p=0.02 — statistically significant but AHA/ASA 2026 rates ticagrelor as COR 3: No Benefit over aspirin alone: NNT=91 and severe bleeding 5× higher outweigh benefit vs clopidogrel DAPT (CHANCE NNT=28).',
        highlight: false
      },
      effectSize: {
        value: '1.1%',
        label: 'Absolute Reduction',
        info: 'Absolute risk reduction: 6.6% (aspirin) − 5.5% (ticagrelor+aspirin) = 1.1%. NNT=91. Far less efficient than clopidogrel DAPT (CHANCE NNT=28). Severe bleeding 5× higher with ticagrelor.',
        highlight: false
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        'International — 414 sites, 28 countries',
        '1:1 allocation (ticagrelor + aspirin vs aspirin + placebo)',
        '30-day treatment duration'
      ],
      timeline: 'Enrolled 2018–2019; published NEJM 2020',
      sampleSize: {
        value: '11,016 patients',
        info: 'Largest DAPT trial for minor stroke/TIA. Global enrollment across 28 countries.'
      },
      primaryEndpoint: {
        value: 'Stroke or death at 30 days',
        info: 'Composite of any stroke or death within 30 days. Centrally adjudicated.'
      },
      pValue: {
        value: 'HR 0.83 (95% CI 0.71–0.96), p=0.02',
        info: '17% relative risk reduction — statistically significant but absolute benefit (1.1%) modest with disproportionate bleeding.'
      },
      nnt: {
        value: '91',
        info: 'NNT=91 at 30 days. Compare: CHANCE NNT=28 at 90 days. 91 patients need ticagrelor+aspirin to prevent one event, while each patient faces 5× higher severe bleeding risk.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 5.5,
        label: 'Stroke or death at 30 days',
        name: 'Ticagrelor + Aspirin'
      },
      control: {
        percentage: 6.6,
        label: 'Stroke or death at 30 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'Ticagrelor 180mg load → 90mg BID + Aspirin 300–325mg load → 75–100mg/d × 30 days',
        description: 'Ticagrelor plus aspirin for 30 days, initiated within 24 hours of symptom onset.',
        details: [
          'Ticagrelor 180mg loading dose on Day 1, then 90mg twice daily',
          'Aspirin 300–325mg loading dose Day 1, then 75–100mg daily',
          'Continued for 30 days total',
          'Mean time to treatment ~11 hours from symptom onset'
        ]
      },
      control: {
        name: 'Aspirin 300–325mg load → 75–100mg/d × 30 days + placebo ticagrelor',
        description: 'Aspirin monotherapy for 30 days. Double-dummy design.',
        details: [
          'Aspirin 300–325mg loading dose Day 1, then 75–100mg daily',
          'Placebo ticagrelor twice daily (double-dummy)'
        ]
      }
    },
    clinicalContext: 'THALES tested ticagrelor (a more potent P2Y12 inhibitor than clopidogrel) vs aspirin alone for minor stroke/TIA. It enrolled a broader population (NIHSS ≤5 vs ≤3 in CHANCE) using a 30-day protocol. While statistically significant, the 2026 AHA/ASA guidelines rate ticagrelor as COR 3: No Benefit for this indication — the NNT of 91 is far worse than clopidogrel DAPT (NNT 28–67) and severe bleeding was 5× higher. Ticagrelor-based DAPT is only appropriate for confirmed CYP2C19 loss-of-function carriers (see CHANCE-2, COR 2b).',
    calculations: {
      nnt: 91,
      nntExplanation: 'NNT=91 at 30 days — 91 patients must be treated to prevent one stroke/death, while each patient faces severe bleeding risk 5× higher than aspirin alone.'
    },
    pearls: [
      'AHA/ASA 2026: COR 3: No Benefit — ticagrelor NOT recommended over aspirin alone for minor stroke/TIA',
      'Statistically significant (p=0.02) but clinically inadequate: NNT=91, severe bleeding 5× higher',
      'Severe hemorrhage: 0.5% (ticagrelor+ASA) vs 0.1% (ASA alone), p<0.001',
      'Net clinical benefit unfavorable vs clopidogrel DAPT: CHANCE NNT=28 with comparable safety',
      'Broader eligibility (NIHSS ≤5, ABCD2 ≥6) vs CHANCE (NIHSS ≤3, ABCD2 ≥4)',
      'Ticagrelor dyspnea in ~12% — pharmacologic, not cardiac, but common discontinuation reason',
      'NOT equivalent to clopidogrel DAPT — do not substitute ticagrelor for clopidogrel routinely',
      'Exception: CYP2C19 poor metabolizers may benefit from ticagrelor DAPT (CHANCE-2, COR 2b)',
      'Benefit consistent across atherosclerotic and non-atherosclerotic causes',
      'Published: Johnston SC et al. N Engl J Med. 2020;383(3):207–217. DOI: 10.1056/NEJMoa1916870'
    ],
    conclusion: '',
    source: 'Johnston SC, et al. (NEJM 2020)',
    doi: '10.1056/NEJMoa1916870',
    pmid: '32668111',
    clinicalTrialsId: 'NCT03354429',
    keyMessage: 'AHA/ASA 2026 COR 3: No Benefit — ticagrelor NOT recommended over aspirin for minor stroke/TIA. Use clopidogrel-based DAPT (CHANCE protocol) instead.',
    limitations: [
      'Broader eligibility (NIHSS ≤5, ABCD2 ≥6) makes direct comparison with CHANCE/POINT difficult',
      '30-day endpoint vs 90-day in CHANCE — different time horizons complicate NNT comparison',
      'No head-to-head comparison with clopidogrel-based DAPT in the same trial',
      'Ticagrelor dyspnea (~12%) may have introduced differential dropout bias',
      '57% Asian patients — higher CYP2C19 LOF prevalence may have partially confounded results'
    ],
    listCategory: 'antiplatelets',
    listDescription: 'Ticagrelor + aspirin vs aspirin alone — AHA 2026 COR 3: No Benefit. NNT=91, bleeding 5× higher.',
  },

  // ─── INSPIRES TRIAL ───────────────────────────────────────────────────────
  'inspires-trial': {
    id: 'inspires-trial',
    title: 'INSPIRES Trial',
    subtitle: 'DAPT for Atherosclerotic Minor Stroke or TIA Within 72 Hours',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    stats: {
      sampleSize: {
        value: '6,100',
        label: 'Randomized Patients',
        info: 'Patients with mild ischemic stroke (NIHSS ≤5) or high-risk TIA (ABCD2 ≥4) of presumed atherosclerotic cause (≥50% intracranial or extracranial stenosis) enrolled within 72 hours. 222 centers in China.'
      },
      primaryEndpoint: {
        value: 'New stroke',
        label: 'at 90 Days',
        info: 'Primary outcome: new stroke (ischemic or hemorrhagic) within 90 days. INSPIRES extends DAPT eligibility to 72 hours and targets atherosclerotic etiology specifically.'
      },
      pValue: {
        value: '0.008',
        label: 'Statistically Sig.',
        info: 'p=0.008 — highly significant. AHA/ASA 2026: COR 2a, LOE B-R for atherosclerotic etiology within 24–72 hours.',
        highlight: true
      },
      effectSize: {
        value: '1.9%',
        label: 'Absolute Reduction',
        info: 'Absolute risk reduction: 9.2% − 7.3% = 1.9%. NNT≈53. Benefit maintained even with 24–72h initiation in atherosclerotic stroke.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized double-blind 2×2 factorial trial',
        '222 centers in China',
        '1:1 allocation (DAPT vs aspirin) in antiplatelet arm',
        'Second factor: intensive vs standard statin (independent)',
        'Treatment window: within 72 hours of symptom onset'
      ],
      timeline: 'Enrolled 2019–2023; published NEJM 2024',
      sampleSize: {
        value: '6,100 patients',
        info: '2×2 factorial simultaneously testing antiplatelet and statin intensification in atherosclerotic stroke. Powered for 20% relative risk reduction.'
      },
      primaryEndpoint: {
        value: 'New stroke at 90 days',
        info: 'Any stroke (ischemic or hemorrhagic) within 90 days. Centrally adjudicated.'
      },
      pValue: {
        value: 'HR 0.79 (95% CI 0.66–0.94), p=0.008',
        info: '21% relative risk reduction. Benefit consistent across 0–24h and 24–72h initiation subgroups.'
      },
      nnt: {
        value: '53',
        info: 'NNT≈53 (AHA/ASA 2026 cited). For every 53 atherosclerotic minor stroke/TIA patients treated with DAPT × 21 days, one stroke is prevented over 90 days.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 7.3,
        label: 'New stroke at 90 days',
        name: 'Clopidogrel + Aspirin (DAPT)'
      },
      control: {
        percentage: 9.2,
        label: 'New stroke at 90 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'Clopidogrel 300mg load → 75mg/d + Aspirin 100–300mg load → 100mg/d × 21 days, then clopidogrel',
        description: 'Clopidogrel + aspirin for 21 days, then clopidogrel monotherapy to 90 days. Initiated within 72 hours.',
        details: [
          'Clopidogrel 300mg loading dose at enrollment',
          'Aspirin 100–300mg loading dose at enrollment',
          'Days 2–21: Clopidogrel 75mg + Aspirin 100mg daily',
          'Days 22–90: Clopidogrel 75mg daily alone',
          'Can initiate up to 72 hours after onset (extends CHANCE 24h window)'
        ]
      },
      control: {
        name: 'Aspirin 100–300mg load → 100mg/d × 90 days + placebo clopidogrel',
        description: 'Aspirin monotherapy for 90 days with placebo clopidogrel.',
        details: [
          'Aspirin 100–300mg loading dose at enrollment',
          'Days 2–90: Aspirin 100mg daily',
          'Placebo clopidogrel throughout'
        ]
      }
    },
    clinicalContext: 'CHANCE/POINT established DAPT within 24 hours for minor stroke/TIA. INSPIRES addresses two clinically important extensions: (1) the 24–72 hour window for delayed presenters, and (2) atherosclerotic etiology (≥50% stenosis) — a subtype particularly prone to early recurrence from in-situ thrombosis. AHA/ASA 2026 incorporated INSPIRES to support COR 2a: DAPT is reasonable for atherosclerotic minor stroke/TIA within 24–72 hours.',
    calculations: {
      nnt: 53,
      nntExplanation: 'NNT≈53 at 90 days. Benefit maintained even when DAPT started 24–72h post-onset in atherosclerotic etiology patients.'
    },
    pearls: [
      'AHA/ASA 2026: COR 2a — DAPT reasonable for atherosclerotic minor stroke/TIA within 24–72 hours',
      'Key eligibility: ≥50% intracranial OR extracranial stenosis on vascular imaging (must confirm etiology)',
      'Extends CHANCE/POINT paradigm: DAPT benefit persists even with 24–72h initiation',
      'NNT≈53 at 90 days — clinically meaningful even with delayed initiation',
      'Bleeding: moderate-to-severe 0.9% (DAPT) vs 0.4% (aspirin) — small but statistically significant',
      'Same 21-day DAPT → monotherapy protocol as CHANCE — consistent guideline regimen',
      'NOT applicable to cardioembolic, lacunar (without stenosis), or non-atherosclerotic etiology',
      '2×2 factorial: statin intensification arm showed neutral effect (separate analysis)',
      'Critical use case: patient arriving 30–72h after onset with confirmed stenosis on CTA/MRA',
      'Published: Zhao J, et al. N Engl J Med. 2024;390(3):203–213. DOI: 10.1056/NEJMoa2309137'
    ],
    conclusion: '',
    source: 'Zhao J, et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2309137',
    pmid: '38157499',
    clinicalTrialsId: 'NCT03635749',
    keyMessage: 'Atherosclerotic minor stroke/TIA within 24–72h: clopidogrel+aspirin × 21 days is reasonable (COR 2a). Requires ≥50% stenosis confirmed on vascular imaging.',
    limitations: [
      'Conducted entirely in China — higher intracranial atherosclerosis prevalence may limit generalizability',
      'Requires vascular imaging to confirm ≥50% stenosis — not always available within 72h in all settings',
      '2×2 factorial design: antiplatelet and statin arms may interact',
      'Excludes non-atherosclerotic etiology — results do not generalize to all minor stroke/TIA patients'
    ],
    listCategory: 'antiplatelets',
    listDescription: 'DAPT for atherosclerotic minor stroke/TIA within 72 hours. NNT=53. AHA 2026 COR 2a.',
  },

  // ─── CHANCE-2 TRIAL ───────────────────────────────────────────────────────
  'chance-2-trial': {
    id: 'chance-2-trial',
    title: 'CHANCE-2 Trial',
    subtitle: 'Ticagrelor vs Clopidogrel DAPT in CYP2C19 Loss-of-Function Carriers',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    stats: {
      sampleSize: {
        value: '6,412',
        label: 'Randomized Patients',
        info: 'Patients with minor stroke (NIHSS ≤3) or high-risk TIA (ABCD2 ≥4) positive for CYP2C19 loss-of-function alleles (*2 or *3). Enrolled within 24 hours. 202 centers in China. Rapid point-of-care genotyping required at enrollment.'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence',
        label: 'at 90 Days',
        info: 'Primary outcome: new stroke (ischemic or hemorrhagic) within 90 days. CYP2C19 LOF carriers have reduced clopidogrel activation — CHANCE-2 tests whether ticagrelor overcomes this resistance.'
      },
      pValue: {
        value: '0.009',
        label: 'Statistically Sig.',
        info: 'p=0.009 for 90-day primary. AHA/ASA 2026: COR 2b — ticagrelor DAPT may be reasonable over clopidogrel DAPT for confirmed CYP2C19 LOF carriers within 24 hours.',
        highlight: true
      },
      effectSize: {
        value: '1.6%',
        label: 'Absolute Reduction',
        info: 'Stroke recurrence: 6.0% (ticagrelor) vs 7.6% (clopidogrel). NNT=63 (AHA/ASA 2026). 1-year benefit confirmed: HR 0.80, p=0.007.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        '202 centers in China',
        '1:1 allocation (ticagrelor+aspirin vs clopidogrel+aspirin)',
        'CYP2C19 *2 or *3 LOF allele required for enrollment',
        'Rapid point-of-care bedside genotyping (30–60 min)'
      ],
      timeline: 'Enrolled 2019–2021; published NEJM 2021',
      sampleSize: {
        value: '6,412 CYP2C19 LOF carriers',
        info: 'First large stroke trial requiring mandatory pharmacogenomic eligibility. Only LOF carriers enrolled after rapid bedside CYP2C19 genotyping. Normal metabolizers excluded.'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence at 90 days',
        info: 'Any stroke within 90 days. 1-year secondary endpoint also assessed.'
      },
      pValue: {
        value: 'HR 0.77 (95% CI 0.64–0.94), p=0.009; 1-year HR 0.80, p=0.007',
        info: '23% relative risk reduction at 90 days. Durable benefit confirmed at 1 year.'
      },
      nnt: {
        value: '63',
        info: 'NNT=63 (AHA/ASA 2026). For every 63 CYP2C19 LOF carriers treated with ticagrelor+aspirin instead of clopidogrel+aspirin, one additional stroke is prevented at 90 days.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 6.0,
        label: 'Stroke recurrence at 90 days',
        name: 'Ticagrelor + Aspirin'
      },
      control: {
        percentage: 7.6,
        label: 'Stroke recurrence at 90 days',
        name: 'Clopidogrel + Aspirin'
      }
    },
    intervention: {
      treatment: {
        name: 'Ticagrelor 180mg load → 90mg BID + Aspirin × 21 days, then ticagrelor 90mg BID alone',
        description: 'Ticagrelor-based DAPT for 21 days, then ticagrelor monotherapy to 90 days. Direct-acting — no CYP2C19 conversion needed.',
        details: [
          'Ticagrelor 180mg loading dose on Day 1',
          'Aspirin 75–300mg loading dose on Day 1',
          'Days 2–21: Ticagrelor 90mg BID + Aspirin 75mg daily',
          'Days 22–90: Ticagrelor 90mg BID alone',
          'Direct-acting P2Y12 inhibitor — bypasses CYP2C19 pathway entirely'
        ]
      },
      control: {
        name: 'Clopidogrel 300mg load → 75mg/d + Aspirin × 21 days, then clopidogrel 75mg/d alone',
        description: 'Standard clopidogrel DAPT. CYP2C19 LOF reduces active metabolite by ~25–30%, causing suboptimal platelet inhibition.',
        details: [
          'Clopidogrel 300mg loading dose on Day 1',
          'Aspirin 75–300mg loading dose on Day 1',
          'Days 2–21: Clopidogrel 75mg + Aspirin 75mg daily',
          'Days 22–90: Clopidogrel 75mg daily alone',
          'LOF carriers: ~25–30% reduced clopidogrel active metabolite'
        ]
      }
    },
    clinicalContext: 'Clopidogrel requires CYP2C19 enzymatic conversion to its active metabolite. CYP2C19 *2 (loss-of-function) allele is present in 15–30% of Europeans and 50–60% of East Asians. LOF carriers have significantly reduced clopidogrel efficacy and may have higher recurrence risk on clopidogrel DAPT. Ticagrelor is a direct-acting, reversible P2Y12 inhibitor that does not require CYP2C19 conversion, making it genotype-independent. CHANCE-2 is the first large trial of pharmacogenomically-guided antiplatelet therapy in stroke.',
    calculations: {
      nnt: 63,
      nntExplanation: 'NNT=63 at 90 days. For every 63 CYP2C19 LOF carriers treated with ticagrelor instead of clopidogrel DAPT, one additional stroke recurrence is prevented.'
    },
    pearls: [
      'AHA/ASA 2026: COR 2b — ticagrelor DAPT may be reasonable over clopidogrel DAPT in CYP2C19 LOF carriers',
      'CYP2C19 *2/*3 LOF alleles present in ~15–30% Europeans, ~50–60% East Asians',
      'Rapid point-of-care genotyping (30–60 min) available at many comprehensive stroke centers',
      'Ticagrelor direct-acting P2Y12 inhibitor — genotype-independent, no CYP2C19 conversion needed',
      'Severe/moderate bleeding: 0.28% (ticagrelor) vs 0.39% (clopidogrel) — no significant difference',
      'Dyspnea: ~15% with ticagrelor vs ~5% clopidogrel — pharmacologic not cardiac, manageable',
      '1-year benefit confirmed: HR 0.80 (95% CI 0.68–0.95), p=0.007 — durable effect',
      'Only CYP2C19 LOF carriers benefit — normal metabolizers should use standard clopidogrel DAPT',
      'If testing unavailable within 24h: use clopidogrel DAPT NOW — do NOT delay treatment for genotyping',
      'Published: Wang Y, et al. N Engl J Med. 2021;385(27):2497–2505. DOI: 10.1056/NEJMoa2111749'
    ],
    conclusion: '',
    source: 'Wang Y, et al. (NEJM 2021)',
    doi: '10.1056/NEJMoa2111749',
    pmid: '34708996',
    clinicalTrialsId: 'NCT04078984',
    keyMessage: 'CYP2C19 LOF confirmed: use ticagrelor+aspirin × 21 days (COR 2b). Testing unavailable: use clopidogrel DAPT now — do NOT delay.',
    limitations: [
      'Conducted entirely in China — CYP2C19 *2 more prevalent in Asian populations',
      'Rapid genotyping not universally available at all stroke centers',
      'COR 2b (weak) — regulatory and cost barriers with ticagrelor in many systems',
      'No direct comparison with aspirin alone — only vs clopidogrel DAPT',
      'Ticagrelor dyspnea (~15%) may reduce adherence in patients with pulmonary disease'
    ],
    listCategory: 'antiplatelets',
    listDescription: 'Ticagrelor vs clopidogrel DAPT in CYP2C19 loss-of-function carriers. NNT=63. AHA 2026 COR 2b.',
  },

  // ─── ENRICH TRIAL ─────────────────────────────────────────────────────────
  'enrich-trial': {
    id: 'enrich-trial',
    title: 'ENRICH Trial',
    subtitle: 'Minimally Invasive Surgical Evacuation of Intracerebral Hemorrhage',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    stats: {
      sampleSize: {
        value: '300',
        label: 'Randomized Patients',
        info: 'Patients with lobar or anterior basal ganglia ICH (30–80 mL) within 24 hours. 37 US hospitals. Bayesian response-adaptive randomized design. Median age 61, 45% female.'
      },
      primaryEndpoint: {
        value: 'UW-mRS',
        label: 'at 180 Days',
        info: 'Utility-weighted mRS (UW-mRS) at 180 days. Weights mRS by quality-of-life utility: mRS 0=1.0, 1=0.91, 2=0.76, 3=0.65, 4=0.33, 5–6=0.0. Captures functional outcome AND mortality in one continuous score.'
      },
      pValue: {
        value: '0.04',
        label: 'Statistically Sig.',
        info: 'p=0.04 (Bayesian posterior probability >0.97). FIRST positive randomized surgical ICH trial — overturns decades of negative evidence: STICH I (2005), STICH II (2013), MISTIE III (2019).',
        highlight: true
      },
      effectSize: {
        value: '0.458 vs 0.374',
        label: 'UW-mRS (surgery vs medical)',
        info: 'UW-mRS difference 0.084. Most striking finding: 30-day mortality 9.3% (surgery) vs 18.0% (medical) — near-halving. NNT≈12 for 30-day mortality benefit.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Multicenter Bayesian response-adaptive randomized trial',
        '37 US hospitals (2017–2023)',
        'MIPS — trans-sulcal parafascicular approach',
        'BrainPath® + Myriad® (NICO Corporation)',
        'Surgery within 24 hours of last known well'
      ],
      timeline: 'Enrolled 2017–2023; published NEJM April 2024',
      sampleSize: {
        value: '300 patients (adaptive design)',
        info: 'Bayesian adaptive design: allocation ratio adjusted by interim results. Final: 152 surgery, 148 medical. Adaptive design maintains validity with smaller n than traditional RCTs.'
      },
      primaryEndpoint: {
        value: 'UW-mRS at 180 days',
        info: 'Quality-adjusted functional survival at 180 days using utility weights from the general population.'
      },
      pValue: {
        value: 'UW-mRS difference 0.084 (95% CI 0.005–0.163), p=0.04',
        info: 'Bayesian posterior >0.97; frequentist p=0.04. Confirms statistical significance despite small n.'
      },
      nnt: {
        value: '~12',
        info: 'NNT≈12 for 30-day mortality: 18.0% vs 9.3% = 8.7% absolute reduction. Every 12 patients treated with MIPS prevents one death at 30 days.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 45.8,
        label: 'Mean UW-mRS ×100 at 180 days',
        name: 'Minimally Invasive Surgery (MIPS)'
      },
      control: {
        percentage: 37.4,
        label: 'Mean UW-mRS ×100 at 180 days',
        name: 'Medical Management Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'MIPS: BrainPath® + Myriad® within 24 hours of last known well',
        description: 'Trans-sulcal parafascicular approach: tubular retractor placed through sulcal corridor to reach hematoma without traversing cortex. Myriad aspirator removes clot.',
        details: [
          'BrainPath® tubular retractor (28 or 33 mm) via sulcal corridor',
          'Myriad® rotary morcellator-aspirator for hematoma evacuation',
          'Goal: ≥80% hematoma evacuation',
          'Surgery within 24 hours of last known well',
          'Plus standard medical management (same as control)'
        ]
      },
      control: {
        name: 'Guideline-based medical management alone (no surgery)',
        description: 'Standard ICH management: BP control, coagulopathy reversal, supportive care.',
        details: [
          'Target SBP 130–150 mmHg per AHA/ASA ICH guidelines',
          'Reversal of anticoagulation if applicable',
          'Seizure management as indicated',
          'DVT prophylaxis',
          'No hematoma evacuation'
        ]
      }
    },
    clinicalContext: 'ICH carries ~30–40% 30-day mortality and only ~20% functional independence at 1 year. Prior surgical trials consistently failed — STICH I (2005), STICH II (2013), and MISTIE III (2019) all showed no benefit, largely due to open craniotomy trauma and non-selective patient selection. ENRICH tested MIPS, which avoids crossing brain parenchyma via natural sulcal corridors, in a tightly selected population: lobar or anterior basal ganglia ICH (30–80 mL) only — avoiding the deep and posterior fossa regions where surgical risk is highest.',
    calculations: {
      nnt: 12,
      nntExplanation: 'NNT≈12 for 30-day mortality: 18.0% vs 9.3% = 8.7% absolute reduction. For every 12 MIPS-eligible patients treated surgically, one death is prevented at 30 days.'
    },
    pearls: [
      'FIRST positive randomized surgical ICH trial — overturns STICH I (2005), STICH II (2013), MISTIE III (2019)',
      '30-day mortality: 9.3% (surgery) vs 18.0% (medical) — NNT≈12, near-halving of early mortality',
      'Primary benefit driven by LOBAR ICH — anterior basal ganglia subgroup showed less robust benefit',
      'UW-mRS at 180d: 0.458 (surgery) vs 0.374 (medical) — meaningful quality-adjusted improvement',
      'MIPS trans-sulcal approach avoids cortical transgression — key advantage vs open craniotomy',
      'Requires BrainPath + Myriad devices (NICO Corporation) — not universally available; needs training',
      'Eligibility: LOBAR or ANTERIOR BASAL GANGLIA ICH only, volume 30–80 mL, within 24 hours',
      'NOT applicable to: deep (thalamic/putaminal) ICH, posterior fossa ICH, brainstem ICH',
      'NOT applicable to: volume <30 mL (less severe) or >80 mL (typically non-survivable)',
      'Bayesian adaptive design — statistically valid but smaller n than traditional RCTs',
      'Published: Hanley DF, et al. N Engl J Med. 2024;390(14):1277–1289. DOI: 10.1056/NEJMoa2308440'
    ],
    conclusion: '',
    source: 'Hanley DF, et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2308440',
    pmid: '38598795',
    clinicalTrialsId: 'NCT02880878',
    keyMessage: 'Lobar/anterior basal ganglia ICH 30–80 mL within 24h: MIPS surgery halves 30-day mortality (NNT≈12) and improves 180-day outcomes. Requires BrainPath+Myriad and trained neurosurgical team.',
    limitations: [
      'Small n=300 (adaptive) — subgroup analyses underpowered; lobar vs anterior BG results uncertain',
      'BrainPath + Myriad system required — specialty equipment not universally available',
      'US-only trial — generalizability to other healthcare systems uncertain',
      'Open-label — impossible to blind surgical intervention',
      'Adaptive randomization ratio changed over time — potential allocation bias',
      'Does not address deep ICH (thalamus/putamen), posterior fossa, or volumes outside 30–80 mL',
      'Longer-term outcomes (>180 days) not reported'
    ],
    listCategory: 'acute',
    listDescription: 'First positive surgical ICH trial — MIPS halves 30-day mortality (9.3% vs 18.0%). NEJM 2024.',
  },
  'b-proud-trial': {
    id: 'b-proud-trial',
    title: 'B_PROUD Trial',
    subtitle: 'Mobile Stroke Unit Dispatch vs Conventional Ambulance in Berlin',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1543',
        label: 'Included Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 0.71',
        label: 'Common OR for Worse mRS'
      }
    },
    trialDesign: {
      type: [
        'Prospective, nonrandomized controlled intervention study',
        'MSU dispatch plus ambulance vs conventional ambulance alone',
        'Pragmatic Berlin stroke system evaluation'
      ],
      timeline: 'Berlin, Germany; February 2017 to May 2019'
    },
    efficacyResults: {
      treatment: {
        percentage: 80.3,
        label: 'mRS 0-3 or living at home at 90 days',
        name: 'MSU Dispatch'
      },
      control: {
        percentage: 78.0,
        label: 'mRS 0-3 or living at home at 90 days',
        name: 'Conventional Ambulance'
      }
    },
    intervention: {
      treatment: 'Simultaneous dispatch of a mobile stroke unit with on-board CT, laboratory testing, and thrombolysis capability plus conventional ambulance',
      control: 'Conventional ambulance transport to hospital stroke unit'
    },
    clinicalContext: 'Prehospital thrombolysis is highly time dependent, but prior MSU studies had focused mainly on process metrics. B_PROUD asked the more important clinical question: does dispatching an MSU actually improve 90-day disability outcomes for patients with acute ischemic stroke in a real urban stroke system?',
    calculations: {
      nnt: 43.5,
      nntExplanation: 'Using the coprimary dichotomized disability outcome (80.3% vs 78.0%), about 44 patients would need MSU dispatch for one additional patient to be alive at home or with mRS 0-3 at 90 days. This underestimates the full benefit because the primary analysis used ordinal mRS shift.'
    },
    pearls: [
      'Primary analysis showed a favorable ordinal shift in disability with MSU dispatch: common OR 0.71 for worse mRS',
      'Median 90-day mRS was 1 with MSU dispatch vs 2 with conventional ambulance',
      'MSU dispatch increased thrombolysis use: 60.2% vs 48.1%',
      'Dispatch-to-imaging time improved by about 15 minutes, reinforcing that workflow gains translate into patient-centered outcomes',
      'Symptomatic secondary intracranial hemorrhage was similar between groups: 3.2% vs 2.8%',
      'Because this was not randomized, system-level confounding cannot be completely excluded despite adjustment'
    ],
    conclusion: '',
    source: 'Ebinger M, et al. (JAMA 2020)',
    doi: '10.1001/jama.2020.26345',
    trialResult: 'POSITIVE',
    safetyProfile: {
      sICH: {
        evt: 3.2,
        control: 2.8,
        label: 'Symptomatic secondary intracranial hemorrhage',
        tooltip: 'Rates of symptomatic secondary intracranial hemorrhage were similar despite more frequent prehospital reperfusion treatment with MSU dispatch.'
      },
      mortality: {
        evt: 7.1,
        control: 8.8,
        label: 'Death at 90 days',
        tooltip: 'Death at 90 days was numerically lower with MSU dispatch in the coprimary disability categorization.'
      }
    }
  },
  'best-msu-trial': {
    id: 'best-msu-trial',
    title: 'BEST-MSU Trial',
    subtitle: 'Mobile Stroke Units vs Standard EMS in Acute Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1515',
        label: 'Enrolled Patients'
      },
      primaryEndpoint: {
        value: 'Utility-Weighted mRS',
        label: 'at 90 Days in tPA-Eligible Patients'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 2.14',
        label: 'Adjusted Odds of Excellent Outcome'
      }
    },
    trialDesign: {
      type: [
        'Prospective, multicenter, alternating-week controlled trial',
        'Observational comparison of MSU vs standard EMS',
        'Primary analysis in patients adjudicated eligible for thrombolysis'
      ],
      timeline: 'United States; August 2014 to August 2020'
    },
    efficacyResults: {
      treatment: {
        percentage: 53.5,
        label: 'mRS 0-1 at 90 days in tPA-eligible patients',
        name: 'MSU Care'
      },
      control: {
        percentage: 45.5,
        label: 'mRS 0-1 at 90 days in tPA-eligible patients',
        name: 'Standard EMS'
      }
    },
    intervention: {
      treatment: 'Mobile stroke unit evaluation with on-board CT, vascular imaging capability, stroke expertise, and prehospital tPA',
      control: 'Standard EMS transport to hospital for in-hospital stroke evaluation and reperfusion treatment'
    },
    clinicalContext: 'BEST-MSU addressed whether the impressive process advantages of mobile stroke units in the US translate into better clinical outcomes. Unlike earlier feasibility studies, it focused on patient-centered 90-day outcomes in a multicenter real-world framework.',
    calculations: {
      nnt: 12.5,
      nntExplanation: 'For every 12.5 tPA-eligible patients managed by MSU instead of standard EMS, one additional patient achieved mRS 0-1 at 90 days (53.5% vs 45.5%).'
    },
    pearls: [
      'Median onset-to-tPA time was reduced from 108 minutes to 72 minutes with MSU care',
      'Among tPA-eligible patients, 97.1% received thrombolysis with MSU vs 79.5% with standard EMS',
      'Excellent 90-day outcome improved from 45.5% to 53.5%, with adjusted OR 2.14 for utility-weighted excellent outcome',
      'About one-third of MSU-treated patients received thrombolysis within 60 minutes of onset, compared with 2.6% in standard EMS',
      'Symptomatic intracerebral hemorrhage remained about 2% in both groups despite faster reperfusion'
    ],
    conclusion: '',
    source: 'Grotta JC, et al. (NEJM 2021)',
    doi: '10.1056/NEJMoa2103879',
    clinicalTrialsId: 'NCT02190500',
    trialResult: 'POSITIVE',
    safetyProfile: {
      mortality: {
        evt: 8.9,
        control: 11.9,
        label: 'Death at 90 days',
        tooltip: 'Mortality at 90 days was numerically lower with MSU care.'
      }
    }
  },
  'interact4-trial': {
    id: 'interact4-trial',
    title: 'INTERACT4 Trial',
    subtitle: 'Prehospital Blood-Pressure Reduction Before Stroke Type Is Known',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '2404',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '1.00',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.00',
        label: 'Common OR for Poor Outcome'
      }
    },
    trialDesign: {
      type: [
        'Randomized, open-label, blinded-endpoint trial',
        'Ambulance-based blood-pressure lowering before imaging diagnosis',
        'Undifferentiated stroke population with SBP >=150 mm Hg within 2 hours'
      ],
      timeline: 'China; prehospital acute stroke network'
    },
    efficacyResults: {
      treatment: {
        percentage: 40.7,
        label: 'mRS 0-2 at 90 days',
        name: 'Immediate BP Reduction'
      },
      control: {
        percentage: 38.7,
        label: 'mRS 0-2 at 90 days',
        name: 'Usual Care'
      }
    },
    intervention: {
      treatment: 'Immediate ambulance blood-pressure lowering to a systolic target of 130-140 mm Hg',
      control: 'Usual prehospital blood-pressure management'
    },
    clinicalContext: 'Before imaging distinguishes ischemic from hemorrhagic stroke, ambulance clinicians face a major uncertainty: aggressive blood-pressure lowering could help intracerebral hemorrhage but harm ischemic stroke by reducing perfusion. INTERACT4 directly tested that tradeoff in the field.',
    pearls: [
      'Overall trial result was neutral: common OR 1.00 for poor functional outcome',
      'Stroke type mattered: prehospital BP reduction improved outcomes in hemorrhagic stroke (OR 0.75) but worsened outcomes in ischemic stroke (OR 1.30)',
      'Almost half the cohort ultimately had hemorrhagic stroke, which is unusually high for many EMS systems',
      'By hospital arrival, systolic BP was lowered by about 11 mm Hg (159 vs 170 mm Hg)',
      'Serious adverse events were similar overall, so the main issue was efficacy heterogeneity rather than clear global toxicity'
    ],
    conclusion: '',
    source: 'INTERACT4 Investigators (NEJM 2024)',
    doi: '10.1056/NEJMoa2314741',
    trialResult: 'NEGATIVE',
    safetyProfile: {
      mortality: {
        evt: 22.5,
        control: 22.6,
        label: 'Death within 90 days',
        tooltip: 'Overall 90-day mortality was essentially identical between groups.'
      }
    }
  },
  'mr-asap-trial': {
    id: 'mr-asap-trial',
    title: 'MR ASAP Trial',
    subtitle: 'Prehospital Glyceryl Trinitrate Within 3 Hours of Presumed Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '325',
        label: 'Included Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NS',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 0.92',
        label: 'Adjusted Common OR (Target Population)'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, randomized, open-label, blinded-endpoint trial',
        'Ambulance-based glyceryl trinitrate vs standard care',
        'Deferred-consent prehospital stroke trial'
      ],
      timeline: 'Netherlands; April 2018 to February 2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 51,
        label: 'mRS 0-2 at 90 days (target population)',
        name: 'Glyceryl Trinitrate'
      },
      control: {
        percentage: 49,
        label: 'mRS 0-2 at 90 days (target population)',
        name: 'Standard Care'
      }
    },
    intervention: {
      treatment: 'Transdermal glyceryl trinitrate 5 mg/day for 24 hours started prehospital plus standard care',
      control: 'Standard prehospital and in-hospital stroke care alone'
    },
    clinicalContext: 'Earlier pooled analyses had suggested that very early glyceryl trinitrate might improve outcomes after stroke, but RIGHT-2 challenged that signal. MR ASAP revisited the question in a Dutch ambulance-based trial that treated presumed stroke within 3 hours of onset.',
    pearls: [
      'The trial was stopped early after only 380 randomizations because of safety concerns in patients with intracerebral hemorrhage',
      'There was no overall functional benefit in either the total or target population',
      'In the target population, mRS 0-2 at 90 days was essentially unchanged: 51% vs 49%',
      'Early death within 7 days was numerically higher with glyceryl trinitrate, especially in intracerebral hemorrhage',
      'The study reinforced the concern from RIGHT-2 that prehospital GTN should not be used before imaging excludes hemorrhage'
    ],
    conclusion: '',
    source: 'van den Berg SA, et al. (Lancet Neurol 2022)',
    doi: '10.1016/S1474-4422(22)00333-7',
    trialResult: 'NEGATIVE',
    safetyProfile: {
      mortality: {
        evt: 15,
        control: 14,
        label: 'Death within 90 days',
        tooltip: 'Overall 90-day mortality was similar, but early death within 7 days was higher with glyceryl trinitrate.'
      }
    },
    keyMessage: 'No benefit overall, with a signal of early harm in intracerebral hemorrhage. Prehospital GTN should be avoided in presumed stroke before imaging.'
  },
  'racecat-trial': {
    id: 'racecat-trial',
    title: 'RACECAT Trial',
    subtitle: 'Direct CSC Transport vs Local Stroke Center for Suspected LVO',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1401',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days in Ischemic Stroke'
      },
      pValue: {
        value: 'NS',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.03',
        label: 'Adjusted Common OR'
      }
    },
    trialDesign: {
      type: [
        'Population-based, cluster-randomized trial',
        'Nonurban suspected LVO triage strategy study',
        'Direct CSC routing vs nearest local stroke center first'
      ],
      timeline: 'Catalonia, Spain; March 2017 to June 2020'
    },
    efficacyResults: {
      treatment: {
        percentage: 48.8,
        label: 'Underwent thrombectomy in target ischemic stroke population',
        name: 'Direct to CSC'
      },
      control: {
        percentage: 39.4,
        label: 'Underwent thrombectomy in target ischemic stroke population',
        name: 'Local Stroke Center First'
      }
    },
    intervention: {
      treatment: 'Direct transport to a thrombectomy-capable comprehensive stroke center',
      control: 'Initial transport to the nearest local stroke center with secondary transfer if needed'
    },
    clinicalContext: 'In nonurban systems, suspected LVO triage creates a classic tradeoff: bypassing the nearest stroke center may speed thrombectomy but can delay thrombolysis and overtriage patients without true LVO. RACECAT tested this in a real regional stroke network.',
    pearls: [
      'Primary outcome was neutral: no 90-day disability difference despite more direct access to thrombectomy-capable centers',
      'Direct CSC routing decreased IV tPA use (47.5% vs 60.4%) but increased thrombectomy use (48.8% vs 39.4%)',
      'Overall 90-day mortality was identical at about 27%',
      'The trial was stopped early for futility after interim analysis',
      'RACECAT argues against a universal mothership strategy in nonurban suspected LVO systems'
    ],
    conclusion: '',
    source: 'Pérez de la Ossa N, et al. (JAMA 2022)',
    doi: '10.1001/jama.2022.4404',
    clinicalTrialsId: 'NCT02795962',
    trialResult: 'NEGATIVE',
    safetyProfile: {
      mortality: {
        evt: 27.3,
        control: 27.2,
        label: 'Death at 90 days',
        tooltip: 'Mortality was not different despite differences in thrombolysis and thrombectomy rates.'
      }
    },
    keyMessage: 'More thrombectomy does not automatically translate into better functional outcomes when IVT delays and overtriage offset the gain.'
  },
  'right-2-trial': {
    id: 'right-2-trial',
    title: 'RIGHT-2 Trial',
    subtitle: 'Ultra-Acute Prehospital Glyceryl Trinitrate in Presumed Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1149',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days in Confirmed Stroke/TIA'
      },
      pValue: {
        value: '0.083',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.25',
        label: 'Adjusted OR for Poor Outcome'
      }
    },
    trialDesign: {
      type: [
        'Paramedic-delivered, randomized, sham-controlled phase 3 trial',
        'Prehospital GTN vs sham dressing',
        'Blinded endpoint assessment'
      ],
      timeline: 'United Kingdom; October 2015 to May 2018'
    },
    efficacyResults: {
      treatment: {
        percentage: 32,
        label: 'mRS 0-2 at 90 days in confirmed stroke/TIA cohort',
        name: 'GTN'
      },
      control: {
        percentage: 31,
        label: 'mRS 0-2 at 90 days in confirmed stroke/TIA cohort',
        name: 'Sham'
      }
    },
    intervention: {
      treatment: 'Transdermal glyceryl trinitrate 5 mg once daily for 4 days started in the ambulance',
      control: 'Sham dressing plus standard stroke care'
    },
    clinicalContext: 'RIGHT-2 tested whether nitroglycerin given in the first few hours after presumed stroke could improve outcome by lowering blood pressure and augmenting nitric oxide signaling. It was one of the largest ambulance-based stroke intervention trials ever performed.',
    pearls: [
      'RIGHT-2 was neutral for its primary endpoint: no improvement in 90-day disability with GTN',
      'Blood pressure did fall with GTN, but this did not translate into better functional outcome',
      'The signal trended in the wrong direction for confirmed stroke/TIA: adjusted OR 1.25 for poorer outcome',
      'Secondary outcomes, death, and serious adverse events were not significantly improved',
      'Together with MR ASAP, RIGHT-2 largely closed the door on routine prehospital GTN for undifferentiated stroke'
    ],
    conclusion: '',
    source: 'RIGHT-2 Investigators (Lancet 2019)',
    doi: '10.1016/S0140-6736(19)30194-1',
    trialResult: 'NEGATIVE'
  },
  'triage-stroke-trial': {
    id: 'triage-stroke-trial',
    title: 'TRIAGE-STROKE Trial',
    subtitle: 'PSC-First vs CSC-First Routing in IVT-Eligible Suspected LVO',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '171',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days in AIS'
      },
      pValue: {
        value: '0.31',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.42',
        label: 'Ordinal OR for Better Outcome'
      }
    },
    trialDesign: {
      type: [
        'National, multicenter, randomized assessor-blinded trial',
        'IVT-eligible suspected LVO transport strategy study',
        'Nearest PSC vs direct CSC admission'
      ],
      timeline: 'Denmark; September 2018 to May 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 83,
        label: 'mRS 0-3 at 90 days (post hoc exploratory)',
        name: 'Direct CSC First'
      },
      control: {
        percentage: 64,
        label: 'mRS 0-3 at 90 days (post hoc exploratory)',
        name: 'PSC First'
      }
    },
    intervention: {
      treatment: 'Direct transport to comprehensive stroke center prioritizing EVT access',
      control: 'Transport to nearest primary stroke center prioritizing IV thrombolysis'
    },
    clinicalContext: 'TRIAGE-STROKE focused on a narrower group than RACECAT: patients within 4 hours who were still eligible for IVT and had suspected LVO in the catchment of a PSC. It tested whether bypassing the PSC would improve outcomes enough to justify delayed thrombolysis.',
    pearls: [
      'The trial was underpowered after early termination and enrolled only 171 patients, 104 of whom had acute ischemic stroke',
      'Primary outcome was neutral: ordinal OR 1.42 for better mRS, but with wide confidence intervals crossing no effect',
      'Direct CSC routing shortened onset-to-groin time by 35 minutes for LVO patients',
      'PSC-first routing shortened onset-to-needle time by 30 minutes',
      'Post hoc analysis suggested more patients achieved mRS 0-3 with CSC-first transport, but this was exploratory and should not override the neutral primary result'
    ],
    conclusion: '',
    source: 'Behrndtz A, et al. (Stroke 2023)',
    doi: '10.1161/STROKEAHA.123.043875',
    clinicalTrialsId: 'NCT03542188',
    trialResult: 'NEGATIVE',
    keyMessage: 'Underpowered but mechanistically informative: CSC-first speeds EVT, PSC-first speeds IVT, and the net clinical effect remains system dependent.'
  },
  'act-trial': {
    id: 'act-trial',
    title: 'AcT Trial',
    subtitle: 'Tenecteplase vs Alteplase in Canada',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1577',
        label: 'ITT Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90-120 Days'
      },
      pValue: {
        value: 'NI Met',
        label: 'Noninferiority'
      },
      effectSize: {
        value: '+2.1%',
        label: 'Absolute Difference'
      }
    },
    trialDesign: {
      type: [
        'Pragmatic, multicenter, open-label, registry-linked randomized noninferiority trial',
        'Tenecteplase 0.25 mg/kg vs alteplase 0.9 mg/kg',
        'Canadian routine-practice thrombolysis trial across 22 stroke centres'
      ],
      timeline: 'Canada; December 2019 to January 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 36.9,
        label: 'mRS 0-1 at 90-120 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 34.8,
        label: 'mRS 0-1 at 90-120 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg as a single bolus',
      control: 'IV alteplase 0.9 mg/kg with bolus plus infusion'
    },
    clinicalContext: 'AcT tested whether the practical advantages of tenecteplase in routine stroke care could replace alteplase without sacrificing outcomes. Unlike earlier efficacy-focused trials, it was deliberately pragmatic, embedded in real-world Canadian practice, and enrolled patients with disabling ischemic stroke who met standard thrombolysis criteria within 4.5 hours.',
    pearls: [
      'Tenecteplase achieved noninferiority to alteplase for excellent functional outcome',
      'Symptomatic intracranial hemorrhage was similar: 3.4% vs 3.2%',
      'Mortality at 90 days was essentially identical: 15.3% vs 15.4%',
      'AcT is the largest pragmatic Canadian trial supporting tenecteplase 0.25 mg/kg as a first-line alternative'
    ],
    conclusion: '',
    source: 'Menon BK, et al. (Lancet 2022)',
    doi: '10.1016/S0140-6736(22)01054-6',
    clinicalTrialsId: 'NCT03889249',
    trialResult: 'POSITIVE',
    safetyProfile: {
      sICH: {
        evt: 3.4,
        control: 3.2,
        label: 'Symptomatic intracranial hemorrhage at 24 hours'
      },
      mortality: {
        evt: 15.3,
        control: 15.4,
        label: 'Death within 90 days'
      }
    }
  },
  'aramis-trial': {
    id: 'aramis-trial',
    title: 'ARAMIS Trial',
    subtitle: 'Dual Antiplatelet Therapy vs Alteplase for Minor Nondisabling Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '760',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Noninferiority'
      },
      effectSize: {
        value: '+2.3%',
        label: 'Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter, open-label, blinded-endpoint randomized noninferiority trial',
        'Minor nondisabling acute ischemic stroke within 4.5 hours',
        'DAPT vs IV alteplase'
      ],
      timeline: 'China; October 2018 to April 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 93.8,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'DAPT'
      },
      control: {
        percentage: 91.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'Clopidogrel plus aspirin followed by guideline-based antiplatelet therapy',
      control: 'IV alteplase 0.9 mg/kg followed by delayed antiplatelet therapy'
    },
    clinicalContext: 'For minor nondisabling stroke, the net value of thrombolysis has always been uncertain because the baseline prognosis is good and even low rates of hemorrhage matter. ARAMIS directly challenged the assumption that alteplase is needed in this subgroup.',
    pearls: [
      'DAPT was noninferior to alteplase in minor nondisabling stroke',
      'Excellent 90-day outcome was very high in both groups: 93.8% vs 91.4%',
      'Symptomatic intracranial hemorrhage remained rare and numerically lower with DAPT: 0.3% vs 0.9%',
      'ARAMIS complements PRISMS by strengthening the case against routine alteplase for clearly nondisabling deficits'
    ],
    conclusion: '',
    source: 'Chen HS, et al. (JAMA 2023)',
    doi: '10.1001/jama.2023.7827',
    clinicalTrialsId: 'NCT03661411',
    trialResult: 'POSITIVE'
  },
  'attest-2-trial': {
    id: 'attest-2-trial',
    title: 'ATTEST-2 Trial',
    subtitle: 'Tenecteplase vs Alteplase Within 4.5 Hours',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1777',
        label: 'Treated Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.0001',
        label: 'Noninferiority'
      },
      effectSize: {
        value: 'OR 1.07',
        label: 'Ordinal OR'
      }
    },
    trialDesign: {
      type: [
        'Prospective, randomized, parallel-group, open-label trial with masked endpoints',
        'Tenecteplase 0.25 mg/kg vs alteplase 0.9 mg/kg',
        '39 UK stroke centres'
      ],
      timeline: 'United Kingdom; January 2017 to May 2023'
    },
    efficacyResults: {
      treatment: {
        percentage: 44,
        label: 'Excellent neurological recovery (mRS 0-1) at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 42,
        label: 'Excellent neurological recovery (mRS 0-1) at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'ATTEST-2 was designed as a large UK confirmatory trial after earlier tenecteplase studies suggested workflow advantages and at least similar efficacy compared with alteplase.',
    pearls: [
      'Tenecteplase was noninferior, but not superior, to alteplase for 90-day ordinal mRS distribution',
      'Excellent recovery occurred in 44% vs 42%',
      'Mortality was identical at about 8% in both groups',
      'This large representative UK cohort strengthens the modern tenecteplase evidence base'
    ],
    conclusion: '',
    source: 'Muir KW, et al. (Lancet Neurol 2024)',
    doi: '10.1016/S1474-4422(24)00377-6',
    clinicalTrialsId: 'NCT02814409',
    trialResult: 'POSITIVE'
  },
  'nor-test-trial': {
    id: 'nor-test-trial',
    title: 'NOR-TEST Trial',
    subtitle: 'Tenecteplase 0.4 mg/kg vs Alteplase',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1100',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.52',
        label: 'Not Superior'
      },
      effectSize: {
        value: 'OR 1.08',
        label: 'Odds Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, randomized, open-label, blinded-endpoint superiority trial',
        'Tenecteplase 0.4 mg/kg vs alteplase 0.9 mg/kg',
        'Included wake-up stroke and bridging patients'
      ],
      timeline: 'Norway; September 2012 to September 2016'
    },
    efficacyResults: {
      treatment: {
        percentage: 64,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 63,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.4 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'NOR-TEST was an early large tenecteplase phase 3 study, but its interpretation was complicated by a cohort dominated by mild stroke and stroke mimics, which limited its ability to clarify performance in more severe stroke.',
    pearls: [
      'Tenecteplase 0.4 mg/kg was not superior to alteplase',
      'Most patients had mild stroke, with median NIHSS 4',
      'Serious adverse events and mortality were similar between groups',
      'The neutral result in mild stroke raised concern about whether the 0.4 mg/kg dose was adequate for more severe stroke'
    ],
    conclusion: '',
    source: 'Logallo N, et al. (Lancet Neurol 2017)',
    doi: '10.1016/S1474-4422(17)30253-3',
    clinicalTrialsId: 'NCT01949948',
    trialResult: 'NEUTRAL'
  },
  'nor-test-2-part-a-trial': {
    id: 'nor-test-2-part-a-trial',
    title: 'NOR-TEST 2 (Part A)',
    subtitle: 'Tenecteplase 0.4 mg/kg vs Alteplase in Moderate-Severe Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '204',
        label: 'Modified ITT Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.0064',
        label: 'Worse with Tenecteplase'
      },
      effectSize: {
        value: 'OR 0.45',
        label: 'Odds Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, randomized, open-label, blinded-endpoint noninferiority trial',
        'Moderate to severe acute ischemic stroke only',
        'Stopped early for safety at tenecteplase 0.4 mg/kg'
      ],
      timeline: 'Norway; October 2019 to September 2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 32,
        label: 'Favorable outcome (mRS 0-1) at 3 months',
        name: 'Tenecteplase 0.4 mg/kg'
      },
      control: {
        percentage: 51,
        label: 'Favorable outcome (mRS 0-1) at 3 months',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.4 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'NOR-TEST 2 was launched to answer the question NOR-TEST could not: how does tenecteplase 0.4 mg/kg perform in patients with genuinely moderate or severe ischemic stroke? The answer was concerning enough that the trial stopped early.',
    pearls: [
      'Tenecteplase 0.4 mg/kg performed worse than alteplase in moderate-severe stroke',
      'Any intracranial hemorrhage was substantially higher with tenecteplase: 21% vs 7%',
      'Mortality was also higher: 16% vs 5%',
      'NOR-TEST 2 was the key signal that the 0.4 mg/kg dose is too high for routine acute stroke use'
    ],
    conclusion: '',
    source: 'Kvistad CE, et al. (Lancet Neurol 2022)',
    doi: '10.1016/S1474-4422(22)00124-7',
    clinicalTrialsId: 'NCT03854500',
    trialResult: 'NEGATIVE'
  },
  'prisms-trial': {
    id: 'prisms-trial',
    title: 'PRISMS Trial',
    subtitle: 'Alteplase vs Aspirin in Minor Nondisabling Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '313',
        label: 'Enrolled Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NS',
        label: 'No Benefit'
      },
      effectSize: {
        value: '-1.1%',
        label: 'Adjusted Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Phase 3b, double-blind, double-placebo randomized trial',
        'Minor nondisabling stroke within 3 hours',
        'IV alteplase vs aspirin'
      ],
      timeline: 'United States; May 2014 to December 2016'
    },
    efficacyResults: {
      treatment: {
        percentage: 78.2,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Alteplase'
      },
      control: {
        percentage: 81.5,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Aspirin'
      }
    },
    intervention: {
      treatment: 'IV alteplase 0.9 mg/kg plus oral placebo',
      control: 'Aspirin 325 mg plus IV placebo'
    },
    clinicalContext: 'PRISMS directly addressed one of the most common thrombolysis gray zones: patients with very mild symptoms that are not clearly disabling. The question is whether tPA meaningfully improves outcome enough to justify hemorrhage risk.',
    pearls: [
      'Alteplase did not improve 90-day favorable outcome over aspirin',
      'Symptomatic intracranial hemorrhage occurred only in the alteplase arm: 3.2% vs 0%',
      'The trial was stopped early and therefore underpowered, but its direction did not favor alteplase',
      'PRISMS is the best randomized evidence against routine alteplase in clearly nondisabling deficits'
    ],
    conclusion: '',
    source: 'Khatri P, et al. (JAMA 2018)',
    doi: '10.1001/jama.2018.8496',
    clinicalTrialsId: 'NCT02072226',
    trialResult: 'NEGATIVE'
  },
  'prost-trial': {
    id: 'prost-trial',
    title: 'PROST Trial',
    subtitle: 'Recombinant Human Prourokinase vs Alteplase',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '663',
        label: 'Modified ITT Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NI Met',
        label: 'Noninferiority'
      },
      effectSize: {
        value: '+0.9%',
        label: 'Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Randomized, alteplase-controlled, open-label phase 3 trial',
        'rhPro-UK vs alteplase within 4.5 hours',
        '35 centres in China'
      ],
      timeline: 'China; May 2018 to May 2020'
    },
    efficacyResults: {
      treatment: {
        percentage: 65.2,
        label: 'mRS 0-1 at 90 days',
        name: 'rhPro-UK'
      },
      control: {
        percentage: 64.3,
        label: 'mRS 0-1 at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'Intravenous recombinant human prourokinase',
      control: 'Intravenous alteplase 0.9 mg/kg'
    },
    clinicalContext: 'PROST addressed the need for thrombolytic alternatives to alteplase, especially in regions where supply, cost, or bleeding profile may matter. Recombinant human prourokinase had shown promise in phase 2 testing.',
    pearls: [
      'rhPro-UK was noninferior to alteplase for excellent 90-day outcome',
      'Symptomatic intracranial hemorrhage was similar: 1.5% vs 1.8%',
      'Systemic bleeding was markedly lower with rhPro-UK: 25.8% vs 42.2%',
      'PROST showed a viable fibrinolytic alternative beyond tenecteplase, with lower systemic bleeding'
    ],
    conclusion: '',
    source: 'PROST Investigators (JAMA Netw Open 2023)',
    doi: '10.1001/jamanetworkopen.2023.25415',
    trialResult: 'POSITIVE'
  },
  'prost-2-trial': {
    id: 'prost-2-trial',
    title: 'PROST-2 Trial',
    subtitle: 'Large Phase 3 Prourokinase vs Alteplase Trial',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1552',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.0001',
        label: 'Noninferiority'
      },
      effectSize: {
        value: 'RR 1.04',
        label: 'Risk Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, open-label, noninferiority randomized trial',
        'Patients ineligible for or refusing EVT',
        'Prourokinase vs alteplase within 4.5 hours'
      ],
      timeline: 'China; January 2023 to March 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 72.0,
        label: 'mRS 0-1 at 90 days',
        name: 'Prourokinase'
      },
      control: {
        percentage: 68.7,
        label: 'mRS 0-1 at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'Recombinant human prourokinase 15 mg bolus plus 20 mg infusion over 30 minutes',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'PROST-2 expanded the prourokinase evidence base into a much larger phase 3 population, with particular relevance during global thrombolytic shortages and for patients who are not EVT candidates.',
    pearls: [
      'Prourokinase was noninferior to alteplase for excellent functional outcome',
      'Symptomatic intracranial hemorrhage was lower: 0.3% vs 1.3%',
      'Major bleeding at 7 days was also lower: 0.5% vs 2.1%',
      'PROST-2 suggests prourokinase may be both a supply alternative and a potentially cleaner bleeding-profile option'
    ],
    conclusion: '',
    source: 'PROST-2 Investigators (Lancet Neurol 2024)',
    doi: '10.1016/S1474-4422(24)00436-8',
    clinicalTrialsId: 'NCT05700591',
    trialResult: 'POSITIVE'
  },
  'raise-trial': {
    id: 'raise-trial',
    title: 'RAISE Trial',
    subtitle: 'Reteplase vs Alteplase for Acute Ischemic Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1412',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.002',
        label: 'Superior to Alteplase'
      },
      effectSize: {
        value: 'RR 1.13',
        label: 'Risk Ratio'
      }
    },
    trialDesign: {
      type: [
        'Randomized controlled superiority trial',
        'Reteplase double bolus vs alteplase infusion',
        'Treatment within 4.5 hours'
      ],
      timeline: 'China; NEJM 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 79.5,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Reteplase'
      },
      control: {
        percentage: 70.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV reteplase 18 mg bolus followed by a second 18 mg bolus 30 minutes later',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'RAISE tested whether reteplase, a fibrinolytic already familiar in cardiology, could outperform alteplase in early ischemic stroke while preserving acceptable safety.',
    pearls: [
      'Reteplase improved excellent functional outcome over alteplase: 79.5% vs 70.4%',
      'Symptomatic intracranial hemorrhage was similar: 2.4% vs 2.0%',
      'Any intracranial hemorrhage and overall adverse events were higher with reteplase',
      'RAISE is one of the most provocative recent IVT trials because it suggests a thrombolytic may exceed alteplase rather than simply match it'
    ],
    conclusion: '',
    source: 'Li S, et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2400314',
    clinicalTrialsId: 'NCT05295173',
    trialResult: 'POSITIVE'
  },
  'taste-trial': {
    id: 'taste-trial',
    title: 'TASTE Trial',
    subtitle: 'Tenecteplase vs Alteplase with Perfusion-Imaging Selection',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '680',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 3 Months'
      },
      pValue: {
        value: 'PP NI Only',
        label: 'Nuanced Result'
      },
      effectSize: {
        value: '+3%',
        label: 'Standardized Risk Difference (ITT)'
      }
    },
    trialDesign: {
      type: [
        'International, multicenter, open-label noninferiority trial',
        'Perfusion-imaging selected early-window stroke',
        'Tenecteplase 0.25 mg/kg vs alteplase 0.9 mg/kg'
      ],
      timeline: 'Eight countries; March 2014 to October 2023'
    },
    efficacyResults: {
      treatment: {
        percentage: 57,
        label: 'mRS 0-1 at 3 months (intention-to-treat)',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 55,
        label: 'mRS 0-1 at 3 months (intention-to-treat)',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'TASTE focused on a more selected early-window population defined by perfusion mismatch and no planned EVT, asking whether tenecteplase remains at least as good as alteplase when imaging confirms salvageable tissue.',
    pearls: [
      'In intention-to-treat analysis, tenecteplase numerically favored alteplase but narrowly missed clean noninferiority',
      'Per-protocol analysis supported noninferiority more clearly',
      'Symptomatic intracranial hemorrhage was low and similar: 3% vs 2%',
      'TASTE adds to the tenecteplase body of evidence but its result is less clear-cut than AcT or TRACE-2'
    ],
    conclusion: '',
    source: 'TASTE Investigators (Lancet Neurol 2024)',
    doi: '10.1016/S1474-4422(24)00206-0',
    trialResult: 'NEUTRAL'
  },
  'timeless-trial': {
    id: 'timeless-trial',
    title: 'TIMELESS Trial',
    subtitle: 'Tenecteplase 4.5-24 Hours with Perfusion-Imaging Selection',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '458',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.45',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.13',
        label: 'Adjusted Common OR'
      }
    },
    trialDesign: {
      type: [
        'Multicenter, double-blind, placebo-controlled trial',
        'ICA/MCA occlusion with salvageable tissue 4.5-24 hours',
        'Most patients subsequently underwent EVT'
      ],
      timeline: 'NEJM 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 46.0,
        label: 'Functional independence at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 42.4,
        label: 'Functional independence at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'Placebo'
    },
    clinicalContext: 'TIMELESS addressed whether tenecteplase adds value in the late window when perfusion imaging shows salvageable tissue, but when modern thrombectomy is already available to most patients.',
    pearls: [
      'TIMELESS was neutral for its primary ordinal mRS outcome',
      'More than three-quarters of enrolled patients underwent thrombectomy, which likely diluted any incremental IV thrombolytic effect',
      'Recanalization at 24 hours was higher with tenecteplase, but clinical benefit did not emerge',
      'TIMELESS and TRACE-III together help define an important boundary: late-window IVT may be more useful when EVT is not available'
    ],
    conclusion: '',
    source: 'Albers GW, et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2310392',
    clinicalTrialsId: 'NCT03785678',
    trialResult: 'NEGATIVE'
  },
  'trace-2-trial': {
    id: 'trace-2-trial',
    title: 'TRACE-2 Trial',
    subtitle: 'Tenecteplase vs Alteplase in EVT-Ineligible Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1430',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NI Met',
        label: 'Noninferiority'
      },
      effectSize: {
        value: 'RR 1.07',
        label: 'Risk Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, multicenter, open-label, blinded-endpoint noninferiority trial',
        'Standard-window IVT in EVT-ineligible or EVT-refusing stroke',
        'Tenecteplase 0.25 mg/kg vs alteplase'
      ],
      timeline: 'China; June 2021 to May 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 62,
        label: 'mRS 0-1 at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 58,
        label: 'mRS 0-1 at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'TRACE-2 was a major Chinese phase 3 confirmation study of tenecteplase in patients eligible for standard IVT but not proceeding to thrombectomy, helping determine whether the AcT signal generalizes across systems and populations.',
    pearls: [
      'Tenecteplase was noninferior to alteplase for excellent outcome',
      'Symptomatic intracranial hemorrhage was similar at about 2% in both groups',
      'TRACE-2 provides important non-Canadian confirmation of tenecteplase 0.25 mg/kg',
      'Together with AcT and ATTEST-2, it solidifies the 0.25 mg/kg tenecteplase dose'
    ],
    conclusion: '',
    source: 'Wang Y, et al. (Lancet 2023)',
    doi: '10.1016/S0140-6736(22)02600-9',
    clinicalTrialsId: 'NCT04797013',
    trialResult: 'POSITIVE'
  },
  'twist-trial': {
    id: 'twist-trial',
    title: 'TWIST Trial',
    subtitle: 'Wake-Up Stroke Treated with Tenecteplase Selected by Non-Contrast CT',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '578',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.27',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.18',
        label: 'Adjusted OR'
      }
    },
    trialDesign: {
      type: [
        'Investigator-initiated, multicenter, open-label randomized trial',
        'Wake-up stroke selected with non-contrast CT only',
        'Tenecteplase vs no thrombolysis'
      ],
      timeline: 'Ten countries; June 2017 to September 2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 45,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 38,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Control'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg within 4.5 hours of awakening',
      control: 'No thrombolysis'
    },
    clinicalContext: 'TWIST asked whether wake-up stroke could be treated without MRI or perfusion imaging, using only non-contrast CT. If positive, it would have dramatically expanded access to reperfusion in imaging-limited settings.',
    pearls: [
      'TWIST was neutral for its primary ordinal outcome despite numerically more mRS 0-1 outcomes with tenecteplase',
      'Symptomatic intracranial hemorrhage remained low: 2% vs 1%',
      'The trial does not support using non-contrast CT alone to select wake-up stroke patients for tenecteplase',
      'TWIST helps define the boundary between imaging simplification and overtreatment risk'
    ],
    conclusion: '',
    source: 'Roaldsen MB, et al. (Lancet Neurol 2023)',
    doi: '10.1016/S1474-4422(22)00484-7',
    clinicalTrialsId: 'NCT03181360',
    trialResult: 'NEGATIVE'
  }
};
