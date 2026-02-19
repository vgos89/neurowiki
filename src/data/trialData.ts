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
    clinicalContext: 'The NINDS tPA Stroke Study was the landmark trial that established intravenous alteplase (tPA) as the first FDA-approved treatment for acute ischemic stroke.',
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
    conclusion: 'Despite an increased incidence of symptomatic intracerebral hemorrhage, treatment with intravenous tPA within 3 hours of the onset of ischemic stroke improved clinical outcome at 3 months.',
    source: 'The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group (NEJM 1995)',
    clinicalTrialsId: 'NCT00000292',
    listCategory: 'thrombolysis',
    listDescription: 'Landmark trial establishing IV tPA within 3 hours; 42.6% vs 27.2% favorable outcome.',
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
    clinicalContext: 'Tenecteplase is a bioengineered variant of alteplase with greater fibrin specificity, longer half-life, and resistance to plasminogen activator inhibitor-1, enabling single-bolus administration. Prior evidence (NOR-TEST, AcT trials) had shown mixed results. ORIGINAL was designed to establish noninferiority in a large Chinese population and directly compared the two agents head-to-head within the 4.5-hour thrombolysis window.',
    calculations: {
      nnt: null,
      nntExplanation: 'Noninferiority trial — NNT is not the primary framing. Tenecteplase was noninferior to alteplase (RR 1.03, 95% CI 0.97–1.09; noninferiority threshold of RR ≥0.937 met).'
    },
    pearls: [
      'Noninferiority confirmed: RR 1.03 (95% CI 0.97–1.09) — noninferiority margin of 0.937 met',
      'Symptomatic ICH (ECASS III definition): 1.2% in both groups (RR 1.01, 95% CI 0.37–2.70) — identical safety profiles',
      '90-day mortality: 4.6% (TNK) vs 5.8% (alteplase) — numerically lower with TNK but not statistically significant (RR 0.80, 95% CI 0.51–1.23)',
      'Single-bolus advantage: Tenecteplase eliminates the need for a 60-minute IV infusion pump — critical for drip-and-ship and inter-hospital transfer',
      'Population: Chinese patients with AIS, NIHSS 1–25, treated within 4.5h; 30.4% female; mean age ~65',
      'Alongside AcT (Canada 2022) and NOR-TEST 2 (Norway), this trial provides the multi-ethnic evidence base for AHA/ASA 2026 COR 1 equivalence',
      'Published: JAMA 2024; 332(17):1437–1445. DOI: 10.1001/jama.2024.14721'
    ],
    conclusion: 'In patients with acute ischemic stroke eligible for intravenous thrombolysis within 4.5 hours, tenecteplase 0.25 mg/kg was noninferior to alteplase 0.9 mg/kg for excellent functional outcome (mRS 0–1) at 90 days with a similar safety profile. Findings support tenecteplase as a suitable alternative to alteplase.',
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
      'Guideline Evolution: While the trial excluded Age > 80 and those on warfarin, modern guidelines often permit treatment in these groups within 3-4.5h after individual risk assessment',
      'Symptomatic ICH: 2.4% in tPA group vs 0.2% in Placebo group (P=0.008)'
    ],
    conclusion: 'Intravenous alteplase administered between 3 and 4.5 hours after the onset of symptoms significantly improved clinical outcomes in patients with acute ischemic stroke.',
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
      'Clinical Implementation: Many centers now utilize this protocol for patients < 9 hours who are not thrombectomy candidates (e.g., distal occlusions) but have favorable perfusion profiles',
      'Symptomatic ICH: 6.2% in Alteplase group vs 0.9% in Placebo group',
      'Adjusted Risk Ratio: 1.44 (P=0.04)'
    ],
    conclusion: 'Among patients with ischemic stroke 4.5 to 9.0 hours after onset or wake-up stroke who had salvageable brain tissue on perfusion imaging, alteplase resulted in a higher percentage of patients with no or minor neurologic deficits.',
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
    conclusion: 'In light of similar visual outcomes and a higher rate of adverse reactions associated with Local Intra-arterial Fibrinolysis (LIF), it cannot be recommended for the management of acute CRAO.',
    source: 'Schumacher et al. (Ophthalmology 2010)',
    clinicalTrialsId: 'NCT00622778',
    listCategory: 'thrombolysis',
    listDescription: 'IA tPA for central retinal artery occlusion — negative trial; stopped early for futility.',
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
      'NEGATIVE trial - EVT provided NO disability reduction compared to medical treatment alone',
      'Primary outcome p=0.50 (not significant) - essentially no difference between groups',
      'Median mRS was IDENTICAL: 2.0 in both groups at 90 days',
      'Only 71.7% achieved successful reperfusion - lower than large-vessel trials (85-90%)',
      'Symptomatic ICH was DOUBLED with EVT (5.9% vs 2.6%) without mortality benefit',
      'Median age 77 years, NIHSS 6 (relatively mild strokes)',
      'Occlusion locations: 44% M2, 27% M3, 13% P2, 6% P1',
      '65% received IV thrombolysis before/during EVT',
      'Imaging-to-puncture time: 70 min (exceeded 60-min target)',
      'NO subgroup showed benefit: not younger patients, not higher NIHSS, not specific locations',
      'Clinical implication: EVT should NOT be routinely used for medium/distal vessel occlusions',
      'Possible reasons for failure: (1) low reperfusion rates, (2) treatment delays, (3) distal vessels may be "end arteries" with poor compensation ability, (4) technically challenging procedures'
    ],
    conclusion: 'In persons with stroke due to medium or distal vessel occlusion, EVT plus best medical treatment did NOT result in lower disability or death compared to best medical treatment alone. Despite achieving reperfusion in 72% of cases, no clinical benefit was observed. Symptomatic hemorrhage was increased with EVT. These results suggest EVT should NOT be routinely performed for non-dominant M2, M3, M4, or small ACA/PCA occlusions. Future research should focus on: (1) better devices for distal access, (2) faster treatment times, (3) imaging selection to identify patients who might benefit.',
    source: 'Psychogios M, Brehm A, et al. N Engl J Med. 2025;392(14):1374-1384',
    clinicalTrialsId: 'NCT05029414',
    specialDesign: 'negative-trial',
    keyMessage: 'EVT does NOT work for medium/distal vessel occlusions - stick to medical treatment',
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
      'NEGATIVE TRIAL WITH HARM SIGNAL: No functional benefit (41.6% vs 43.1%, Adjusted Rate Ratio 0.95; P=0.61)',
      'INCREASED MORTALITY: Statistically significant increase in 90-day mortality (13.3% vs 8.4%, Adjusted HR 1.82; 95% CI 1.06–3.12)',
      'Increased Bleeding: Symptomatic intracranial hemorrhage (sICH) significantly more frequent in EVT arm (5.4% vs 2.2%)',
      'Time Window: Within 12 hours of Last Known Well',
      'Selection: High baseline NIHSS (>5 or disabling 3-5) and favorable baseline imaging',
      'Implication: Routine EVT for medium vessel occlusions is NOT supported; risks of procedure in smaller vessels may outweigh benefits in unselected populations'
    ],
    conclusion: 'Endovascular treatment for medium-vessel occlusion stroke within 12 hours did not lead to better functional outcomes and was associated with higher mortality compared to usual care.',
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
      'Paradigm Shift: Established the "Late Window" protocol, shifting focus from "Time is Brain" to "Tissue is Brain"',
      'Selection Criteria: Infarct Core < 70 ml, Mismatch Ratio ≥ 1.8, Mismatch Volume ≥ 15 ml',
      'Mortality Reduction: 14% in EVT group vs 26% in Control group (P=0.05)',
      'Safety: No significant difference in symptomatic intracranial hemorrhage (sICH) or serious adverse events',
      'Implementation: Requires automated perfusion software (e.g., RAPID) for standardized core/penumbra calculation'
    ],
    conclusion: 'Thrombectomy for ischemic stroke 6 to 16 hours after onset plus standard medical therapy results in better functional outcomes and lower mortality than standard medical therapy alone in selected patients with salvageable tissue.',
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
      'Wake-Up Strokes: Provided first robust evidence for treating patients with unknown onset time if physiology was favorable',
      'Clinical-Core Mismatch: Unlike DEFUSE-3 which uses flat core/penumbra cutoff, DAWN uses age/NIHSS-adjusted criteria'
    ],
    conclusion: 'Among patients with acute stroke and mismatched clinical deficit and infarct volume, thrombectomy within 6 to 24 hours results in significantly better functional outcomes than standard care.',
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
      'New Frontier: Established that "Large Core" is no longer an absolute contraindication for thrombectomy',
      'Selection Criteria: ASPECTS 3-5 on NCCT OR Core volume ≥ 50 ml on CTP',
      'Generalized Odds Ratio: 1.51 (favoring EVT)',
      'Risk/Benefit: While outcomes are generally poorer than small-core patients, EVT still provides significant shift towards lower disability (e.g., being able to walk vs bedbound)',
      'Safety: Symptomatic intracranial hemorrhage (sICH) was low and not significantly different between groups, though any ICH was more frequent in EVT group'
    ],
    conclusion: 'Endovascular thrombectomy improves functional outcomes in patients with large ischemic strokes (ASPECTS 3-5 or Core ≥ 50 ml) compared to medical management alone.',
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
    conclusion: 'In patients with large ischemic core volume, endovascular therapy resulted in better functional outcomes but was associated with more intracranial hemorrhages.',
    source: 'Huo et al. (NEJM 2023)',
    clinicalTrialsId: 'NCT04551664',
    listCategory: 'thrombectomy',
    listDescription: 'Large core thrombectomy; China cohort (ASPECTS 3–5 or core ≥70 mL).',
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
    clinicalContext: 'Approximately 14-27% of acute ischemic strokes occur with an unknown time of onset, frequently recognized upon awakening from sleep. These "wake-up strokes" have traditionally been excluded from thrombolytic therapy due to the 4.5-hour treatment window requirement. However, MRI findings suggesting recent infarction—specifically DWI-FLAIR mismatch (visible ischemic lesion on diffusion-weighted imaging without corresponding FLAIR hyperintensity)—can identify patients likely within the treatment window. The WAKE-UP trial investigated whether this MRI-based patient selection could safely extend thrombolysis to patients with unknown symptom onset times.',
    calculations: {
      nnt: 8.7, // 1 / (0.533 - 0.418) = 8.70 ≈ 8.7
      nntExplanation: 'For every 8.7 patients with wake-up stroke and DWI-FLAIR mismatch treated with tPA, one additional patient achieves excellent outcome (mRS 0-1) compared to placebo'
    },
    pearls: [
      'DWI-FLAIR mismatch identifies patients likely within 4.5-hour window despite unknown symptom onset',
      'Number needed to treat (NNT) = 8.7 for excellent outcome (mRS 0-1)',
      'Increased parenchymal hemorrhage type 2 (absolute difference 3.6%)',
      'Most applicable to wake-up strokes (89% of enrolled patients)',
      'Benefit consistent across age groups and baseline NIHSS scores',
      'Trend toward increased mortality (4.1% vs 1.2%, p=0.07)',
      'Requires MRI capability for emergency stroke imaging',
      'DWI-FLAIR mismatch has 73-78% interobserver agreement'
    ],
    conclusion: 'Among patients with acute ischemic stroke and unknown time of symptom onset who had MRI findings of DWI-FLAIR mismatch, treatment with IV alteplase resulted in significantly better functional outcomes at 90 days compared to placebo (mRS 0-1: 53.3% vs 41.8%, OR 1.61). This represents an absolute benefit of 11.5 percentage points with an NNT of 8.7.',
    source: 'Thomalla G, et al. N Engl J Med. 2018;379(7):611-622',
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
    conclusion: 'In patients with basilar-artery occlusion presenting within 12 hours, endovascular thrombectomy led to better functional outcomes and lower mortality than best medical care.',
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
    conclusion: 'Among patients with basilar-artery occlusion who presented between 6 and 24 hours after symptom onset, thrombectomy led to a higher rate of good functional status at 90 days than medical therapy.',
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
        info: 'p<0.001 means the benefit of dual antiplatelet therapy is EXTREMELY unlikely to be due to chance (less than 0.1% probability). This is one of the strongest levels of statistical significance in clinical trials, indicating robust and reliable treatment effect.',
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
    clinicalContext: 'After TIA or minor stroke, 10-20% of patients have recurrent stroke within 3 months, with MOST occurring in the first 2 days. This "high-risk window" represents an opportunity for aggressive early prevention. Previous trials of long-term dual antiplatelet therapy (MATCH, CHARISMA, SPS3) showed no benefit and increased bleeding because they enrolled weeks/months after the event and did not target the acute high-risk period. CHANCE tested whether starting dual therapy within 24 hours and continuing for only 21 days (the highest-risk period) could prevent early recurrent strokes while minimizing bleeding risk. The mechanism: Aspirin and clopidogrel synergistically inhibit platelet aggregation through different mechanisms (COX-1 vs P2Y12 pathways). This dual inhibition is most beneficial when platelet activation is highest - immediately after an acute thrombotic event.',
    calculations: {
      nnt: 29, // 1 / (0.117 - 0.082) = 28.57 ≈ 29
      nntExplanation: 'For every 29 patients with minor stroke or high-risk TIA treated with DAPT for 21 days, one additional stroke recurrence is prevented compared to aspirin alone. The benefit was most pronounced in the first 7 days when stroke risk is highest, with Kaplan-Meier curves diverging dramatically in the first week then remaining parallel.'
    },
    pearls: [
      'POSITIVE trial: Dual antiplatelet therapy reduced stroke by 32% (HR 0.68, p<0.001)',
      'Absolute risk reduction: 3.5% → NNT = 29 to prevent one stroke over 90 days',
      'Benefit most pronounced in first 7 days when stroke risk is highest',
      'NO increase in severe hemorrhage (0.3% both groups) - critical safety finding',
      'NO increase in hemorrhagic stroke (0.3% both groups)',
      'Mild bleeding slightly increased (2.3% vs 1.6%, p=0.09 not significant)',
      'Critical timing: Treatment must start within 24 hours of symptom onset',
      'Treatment duration: 21 days of dual therapy, then clopidogrel alone to day 90',
      'Loading dose strategy: Clopidogrel 300mg + aspirin 75-300mg on Day 1',
      'Population: Minor stroke (NIHSS ≤3) or high-risk TIA (ABCD² ≥4) only',
      'Median NIHSS = 3, indicating mild deficits despite "minor" label',
      'Median time to treatment: 13 hours (range: 8-18 hours)',
      '49.5% enrolled within 12 hours - ultra-early treatment is key',
      'Benefit consistent across ALL subgroups - no significant interactions',
      'Excellent retention: Only 0.7% lost to follow-up (36/5170 patients)',
      'Conducted entirely in China - generalizability initially questioned',
      'POINT trial (US) later confirmed results with tighter time window (<12h)',
      'Kaplan-Meier curves diverged dramatically in first week, then plateaued',
      'Changed international guidelines: AHA/ASA now recommends DAPT for 21 days (Class IIa)',
      'Combined with POINT, established DAPT as standard of care for minor stroke/high-risk TIA'
    ],
    conclusion: 'Among patients with high-risk TIA or minor ischemic stroke who can be treated within 24 hours of symptom onset, the combination of clopidogrel and aspirin for 21 days, followed by clopidogrel alone to 90 days, is SUPERIOR to aspirin alone for reducing the risk of stroke. The treatment provides a 32% relative risk reduction (3.5% absolute, NNT=29) without increasing the risk of hemorrhage. This represents a major advance in acute stroke prevention, with greatest benefit in the first week when stroke risk is highest. Start clopidogrel + aspirin within 24 hours of minor stroke or high-risk TIA to prevent early recurrent stroke.',
    source: 'Wang Y, Wang Y, Zhao X, et al. Clopidogrel with aspirin in acute minor stroke or transient ischemic attack. N Engl J Med. 2013;369(1):11-19.',
    doi: '10.1056/NEJMoa1215340',
    pmid: '23803136',
    clinicalTrialsId: 'NCT00979589',
    keyMessage: 'Start clopidogrel + aspirin within 24 hours of minor stroke or high-risk TIA to prevent early recurrent stroke. Dual therapy for 21 days, then clopidogrel alone.',
    safetyData: 'CRITICAL SAFETY FINDING: NO increase in severe hemorrhage. Moderate-to-severe hemorrhage (GUSTO criteria): 0.3% (7/2584) in DAPT group vs 0.3% (8/2586) in aspirin group, p=0.73. Hemorrhagic stroke: 0.3% in both groups, p=0.98. Any bleeding: 2.3% vs 1.6%, p=0.09 (not significant), driven by MILD bleeding (bruising, oozing) that did not require transfusion. The trial demonstrated that short-term (21 days) dual antiplatelet therapy in carefully selected patients (minor stroke/high-risk TIA, no contraindications) can provide substantial benefit WITHOUT increasing the risk of major hemorrhage.',
    educationalContext: 'WHY CHANCE SUCCEEDED WHEN PREVIOUS TRIALS FAILED: Previous trials (MATCH, CHARISMA, SPS3) enrolled weeks/months AFTER the index event (missing the high-risk window), included moderate-severity strokes (higher bleeding risk), used long-term dual therapy (months to years → increased bleeding), and did not target the critical first 48-72 hours when risk peaks. CHANCE SUCCESS FACTORS: (1) Ultra-early treatment within 24 hours (median 13 hours), (2) Targeted the highest-risk period (days 0-7), (3) Selected high-risk patients (minor stroke/high-risk TIA) who benefit most, (4) SHORT-duration therapy (21 days dual → monotherapy), (5) Excluded high-bleeding-risk patients (AF, recent surgery/GI bleed), (6) Captured the acute thrombotic phase when platelets most active. KEY INSIGHT: Stroke recurrence risk is NOT constant over time. It is HIGHEST in the first 48-72 hours after the index event, then drops dramatically. CHANCE captured this critical window with aggressive early treatment followed by de-escalation to monotherapy.',
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
    conclusion: 'In patients with minor ischemic stroke or high-risk TIA, DAPT with Clopidogrel and Aspirin reduced the risk of major ischemic events but increased the risk of major hemorrhage compared to Aspirin alone.',
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
    conclusion: 'In patients with symptomatic intracranial arterial stenosis, aggressive medical management was superior to PTAS with the Wingspan stent system, primarily due to the high risk of periprocedural stroke in the stenting arm.',
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
      'Experience Matters: The trial utilized experienced interventionalists, which likely contributed to the lower complication rate',
      'Role of Stenting: While WEAVE assessed safety (not efficacy vs medical therapy), it reopened the door for stenting as a viable salvage option for highly selected refractory patients',
      'On-Label Criteria: Symptomatic ICAD 70-99%, recurrent stroke despite medical therapy (at least 2 strokes in territory), Age 22-80, mRS ≤ 3, >8 days from most recent stroke',
      'Safety Benchmark: Significantly lower than the 4% safety benchmark set by the FDA'
    ],
    conclusion: 'With experienced interventionalists and proper patient selection following on-label usage guidelines (specifically >7 days post-stroke), the use of the Wingspan stent for intracranial atherosclerotic disease demonstrated a low periprocedural complication rate.',
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
    conclusion: 'In patients with acute ischemic stroke or high-risk TIA, Ticagrelor was not found to be superior to Aspirin in reducing the rate of stroke, myocardial infarction, or death at 90 days.',
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
    conclusion: 'Among patients with recent lacunar strokes, the addition of clopidogrel to aspirin did not significantly reduce the risk of recurrent stroke and was associated with an increased risk of bleeding and death.',
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
    conclusion: 'In patients with recent stroke or TIA and without known coronary heart disease, 80 mg of atorvastatin per day reduced the overall incidence of stroke and of cardiovascular events.',
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
      'ESTIMATION trial (not superiority) - establishes SAFE RANGE for practice',
      'Risk difference: -1.18% (95% CI: -2.84 to 0.47) - early treatment ranges from 2.8% better to 0.5% worse',
      'Recurrent ischemic stroke: 1.4% (early) vs 2.5% (later) - trend favoring early treatment',
      'Symptomatic ICH: 0.2% in BOTH groups - bleeding risk NOT increased with early treatment',
      'Imaging-based classification (not NIHSS-based) used to determine timing',
      'Stroke severity: 37% minor, 40% moderate, 23% major',
      'Used any approved DOAC at appropriate dose (not drug-specific)',
      '98% probability that early treatment increases risk by no more than 0.5 percentage points',
      'Primary outcome at 90 days (exploratory): 3.7% (early) vs 5.6% (later)',
      'Most patients were from European centers - generalizability to other populations unclear'
    ],
    conclusion: 'In this trial, the incidence of recurrent ischemic stroke, systemic embolism, major extracranial bleeding, symptomatic intracranial hemorrhage, or vascular death at 30 days was estimated to range from 2.8 percentage points LOWER to 0.5 percentage points HIGHER (based on 95% confidence interval) with early than with later use of DOACs. Early DOAC initiation (within 48h for minor/moderate stroke, day 6-7 for major stroke) using imaging-based selection appears SAFE and may prevent recurrent strokes without increasing bleeding risk.',
    source: 'Fischer U, et al. N Engl J Med. 2023;388(26):2411-2421',
    clinicalTrialsId: 'NCT03148457',
    specialDesign: 'estimation-trial',
    keyMessage: 'Early DOAC initiation is SAFE - can be used in practice if clinically indicated',
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
    conclusion: 'Ticagrelor + aspirin reduced stroke/death at 30 days vs aspirin alone (5.5% vs 6.6%, HR 0.83, p=0.02), but caused 5× more severe bleeding (0.5% vs 0.1%). AHA/ASA 2026 rates ticagrelor COR 3: No Benefit for minor stroke/TIA — NNT=91 is far inferior to clopidogrel DAPT (CHANCE NNT=28) with worse bleeding. Use clopidogrel+aspirin instead.',
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
    conclusion: 'Among patients with mild ischemic stroke or high-risk TIA of atherosclerotic cause treated within 72 hours, clopidogrel+aspirin × 21 days reduced new stroke at 90 days (7.3% vs 9.2%, HR 0.79, p=0.008) vs aspirin alone. Moderate-to-severe bleeding slightly increased (0.9% vs 0.4%). AHA/ASA 2026: COR 2a for atherosclerotic etiology within 24–72 hours.',
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
    conclusion: 'In CYP2C19 LOF carriers with minor stroke or high-risk TIA, ticagrelor+aspirin × 21 days significantly reduced stroke recurrence vs clopidogrel+aspirin (6.0% vs 7.6%, HR 0.77, p=0.009) without increasing severe bleeding. AHA/ASA 2026: COR 2b — reasonable when CYP2C19 LOF confirmed within 24 hours. If testing unavailable, use clopidogrel DAPT immediately.',
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
    conclusion: 'Among patients with lobar or anterior basal ganglia ICH (30–80 mL) treated within 24 hours, MIPS improved functional outcomes at 180 days (UW-mRS 0.458 vs 0.374, p=0.04) and dramatically reduced 30-day mortality (9.3% vs 18.0%) vs medical management alone. ENRICH is the first positive randomized surgical ICH trial — a paradigm shift for selected ICH patients at centers with appropriate equipment and expertise.',
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
  }
};
