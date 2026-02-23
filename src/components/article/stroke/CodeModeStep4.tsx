import React, { useState } from 'react';
// Treatment Orders - AHA-based categories with evidence/rationale (v2)

interface CodeModeStep4Props {
  step2Data: {
    ctResult: string;
    treatmentGiven?: string;
    tnkDose?: number;
    tpaDose?: number;
    thrombectomyPlan?: string;
  };
  onComplete: (selectedOrders: string[]) => void;
  /** Called after orders note is successfully copied to clipboard (for toast) */
  onCopySuccess?: () => void;
}

interface Order {
  id: string;
  label: string;
  category: 'labs' | 'post-tpa' | 'stroke-workup' | 'general';
  evidence: string;
  rationale: string;
  defaultSelected?: boolean;
  evidenceClass?: 'I' | 'IIa' | 'IIb' | 'III';
  evidenceLevel?: 'A' | 'B' | 'C';
}

const ORDERS: Order[] = [
  // LAB WORK
  {
    id: 'pt_inr_ptt',
    label: 'PT / INR / PTT',
    category: 'labs',
    evidence: 'Class I, Level C',
    rationale: 'INR >1.7 is absolute contraindication to tPA. Do not delay tPA for results if within 4.5h; point-of-care glucose is the only mandatory lab (AHA/ASA 2026). PT/PTT needed if heparin use suspected.',
    defaultSelected: false,
    evidenceClass: 'I',
    evidenceLevel: 'C'
  },
  {
    id: 'cbc',
    label: 'CBC with Platelets',
    category: 'labs',
    evidence: 'Class I, Level C',
    rationale: 'Platelet count <100,000/mm³ is contraindication to tPA. Do not delay tPA for CBC if within window unless clinical suspicion for thrombocytopenia (e.g. known ITP, cirrhosis).',
    defaultSelected: false,
    evidenceClass: 'I',
    evidenceLevel: 'C'
  },
  {
    id: 'bmp',
    label: 'Basic Metabolic Panel',
    category: 'labs',
    evidence: 'Class IIa, Level C',
    rationale: 'Electrolytes and renal function guide BP management and contrast use. Not required before tPA; obtain when feasible without delaying treatment.',
    defaultSelected: false,
    evidenceClass: 'IIa',
    evidenceLevel: 'C'
  },
  {
    id: 'troponin',
    label: 'Troponin I',
    category: 'labs',
    evidence: 'Class I, Level B',
    rationale: 'Acute MI and stroke share risk factors; troponin elevation common in stroke. Guides cardiac monitoring and secondary prevention. Do not delay tPA for troponin.',
    defaultSelected: false,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'lipid',
    label: 'Lipid Panel',
    category: 'labs',
    evidence: 'Class I, Level A',
    rationale: 'SPARCL trial: high-intensity statin reduces recurrent stroke. LDL >70 mg/dL warrants statin. Fasting preferred but do not delay treatment for lipid panel.',
    defaultSelected: false,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },
  {
    id: 'hba1c',
    label: 'Hemoglobin A1c',
    category: 'labs',
    evidence: 'Class I, Level B',
    rationale: 'Diabetes in 30–40% of stroke patients; A1c >6.5% confirms diabetes. Uncontrolled diabetes increases recurrent stroke risk. Do not delay tPA for A1c.',
    defaultSelected: false,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },

  // POST-THROMBOLYSIS MONITORING
  {
    id: 'neuro-icu',
    label: 'Admit to Neuro ICU or dedicated stroke unit',
    category: 'post-tpa',
    evidence: 'Class I, Level B',
    rationale: 'Post-thrombolysis patients require intensive neurological monitoring for hemorrhagic transformation, which occurs in 6-7% of cases. Dedicated stroke units reduce mortality by 18% and improve functional outcomes through early complication detection and standardized care protocols.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'neuro-checks',
    label: 'Neuro checks q15min × 2h, then q30min × 6h, then q1h × 16h',
    category: 'post-tpa',
    evidence: 'Class I, Level C',
    rationale: 'Frequent neurological assessments detect early hemorrhagic transformation. Most symptomatic ICH occurs within first 36 hours post-tPA. Any acute decline (≥4 point NIHSS increase or new severe headache) requires immediate CT and potential reversal.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'C'
  },
  {
    id: 'bp-control',
    label: 'Strict BP control: maintain <180/105 mmHg × 24 hours',
    category: 'post-tpa',
    evidence: 'Class I, Level B',
    rationale: 'Elevated BP post-thrombolysis increases hemorrhagic transformation risk 3-fold. Target <180/105 for first 24h. Use IV labetalol, nicardipine, or clevidipine for precise control. ENCHANTED trial showed aggressive BP lowering (<140 systolic) was safe.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'continuous-tele',
    label: 'Continuous cardiac telemetry monitoring',
    category: 'post-tpa',
    evidence: 'Class I, Level B',
    rationale: 'Atrial fibrillation detected in 10-20% of acute stroke patients via continuous monitoring, altering secondary prevention strategy. Paroxysmal AF often only detectable with prolonged monitoring. Critical for anticoagulation decisions.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'npo-swallow',
    label: 'NPO until swallow screen passed',
    category: 'post-tpa',
    evidence: 'Class I, Level B',
    rationale: 'Dysphagia occurs in 40-70% of acute stroke patients. Aspiration pneumonia increases mortality 3-fold and prolongs hospitalization. Formal swallow evaluation reduces pneumonia risk from 11.7% to 5.4%.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'no-anticoag-24h',
    label: 'No anticoagulation or antiplatelet agents × 24 hours',
    category: 'post-tpa',
    evidence: 'Class III, Level B',
    rationale: 'ARTIS trial showed aspirin within 24h post-tPA increased symptomatic ICH from 1.6% to 4.3% without improving outcomes. Hold all antithrombotics until 24h CT confirms no hemorrhage.',
    defaultSelected: true,
    evidenceClass: 'III',
    evidenceLevel: 'B'
  },
  {
    id: 'no-invasive-24h',
    label: 'Avoid invasive procedures (Foley, NG tube, central lines) × 24h',
    category: 'post-tpa',
    evidence: 'Class III, Level C',
    rationale: 'tPA systemic effects increase bleeding at puncture sites. Non-compressible sites (subclavian, internal jugular) carry highest risk. If procedures essential, use compressible sites (femoral) and apply prolonged pressure.',
    defaultSelected: true,
    evidenceClass: 'III',
    evidenceLevel: 'C'
  },
  {
    id: 'repeat-ct-24h',
    label: 'Repeat non-contrast head CT at 24 hours',
    category: 'post-tpa',
    evidence: 'Class I, Level B',
    rationale: 'Routine 24h CT detects asymptomatic hemorrhage in 3-6% of patients and confirms infarct evolution. Earlier CT (immediate) required for any neurological decline, severe headache, nausea/vomiting, or hypertension.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'stat-ct-decline',
    label: 'STAT CT head for any acute neurological decline',
    category: 'post-tpa',
    evidence: 'Class I, Level A',
    rationale: 'Symptomatic ICH presents with sudden worsening (≥4 NIHSS points), severe headache, vomiting, or decreased consciousness. Requires immediate CT, neurosurgery consult, and reversal: cryoprecipitate for tPA-related hemorrhage; reverse anticoagulation if on anticoagulants (4-factor PCC + vitamin K for warfarin; idarucizumab for dabigatran; andexanet or PCC for Xa inhibitors). Platelet transfusion and TXA not routinely recommended per 2022 guidelines.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },

  // STROKE WORKUP
  {
    id: 'mri-dwi',
    label: 'MRI brain with DWI, FLAIR, GRE, MRA head/neck',
    category: 'stroke-workup',
    evidence: 'Class I, Level A',
    rationale: 'MRI detects small infarcts missed on CT (sensitivity 95% vs 60%). DWI confirms acute ischemia within minutes. GRE detects microbleeds (40-60% of stroke patients) which predict ICH risk. MRA identifies vessel occlusions and stenosis.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },
  {
    id: 'tte',
    label: 'Transthoracic echocardiogram with bubble study',
    category: 'stroke-workup',
    evidence: 'Class I, Level B',
    rationale: 'Identifies cardioembolic sources in 20-25% of strokes: LV thrombus, atrial thrombus (AF), valvular disease, PFO with RLS. Bubble study detects PFO (present in 25% of population, 40% of cryptogenic strokes in young patients).',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'carotid-duplex',
    label: 'Carotid duplex ultrasound',
    category: 'stroke-workup',
    evidence: 'Class I, Level A',
    rationale: 'Non-invasive assessment of carotid stenosis. Symptomatic stenosis >70% benefits from CEA within 2 weeks (NNT=6 to prevent recurrent stroke). Asymptomatic stenosis >60% may warrant CEA in select patients (NNT=20).',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },
  {
    id: 'holter',
    label: '30-day cardiac event monitor',
    category: 'stroke-workup',
    evidence: 'Class I, Level B',
    rationale: 'CRYSTAL-AF trial: 30-day monitoring detects AF in 16% of cryptogenic stroke patients vs 3% with 24h Holter. Detection rate increases with duration: 3% at 24h, 10% at 72h, 20% at 30 days. Changes anticoagulation strategy.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'lipid-panel',
    label: 'Fasting lipid panel (LDL, HDL, triglycerides)',
    category: 'stroke-workup',
    evidence: 'Class I, Level A',
    rationale: 'LDL >70 mg/dL in stroke patients warrants high-intensity statin. SPARCL trial: atorvastatin 80mg reduced recurrent stroke by 16%. Every 40 mg/dL LDL reduction decreases stroke risk 20%. Target LDL <70 for secondary prevention.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },
  {
    id: 'hba1c',
    label: 'HbA1c and fasting glucose',
    category: 'stroke-workup',
    evidence: 'Class I, Level B',
    rationale: 'Diabetes present in 30-40% of stroke patients, often undiagnosed. HbA1c >6.5% confirms diabetes. Uncontrolled diabetes (A1c >7%) increases recurrent stroke risk 2-fold and worsens functional outcomes.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },

  // GENERAL CARE
  {
    id: 'dvt-prophylaxis',
    label: 'DVT prophylaxis: SCDs bilaterally (no pharmacologic × 24h)',
    category: 'general',
    evidence: 'Class I, Level A',
    rationale: 'DVT occurs in 10% of immobilized stroke patients without prophylaxis. CLOTS-3 trial: SCDs reduce DVT by 50% and are safe immediately post-tPA. Start pharmacologic prophylaxis (heparin SQ) after 24h if no hemorrhage on CT.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },
  {
    id: 'aspiration-precautions',
    label: 'Aspiration precautions: 30-45° head of bed',
    category: 'general',
    evidence: 'Class I, Level B',
    rationale: 'Dysphagia in 50% of acute strokes leads to aspiration pneumonia in 10%. Pneumonia increases mortality 3-fold. Head elevation reduces aspiration risk. Supervised feeding per speech pathology.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'B'
  },
  {
    id: 'pt-ot-speech',
    label: 'PT, OT, and Speech Therapy consults',
    category: 'general',
    evidence: 'Class I, Level A',
    rationale: 'Early mobilization within 24h improves functional outcomes and reduces complications (pneumonia, DVT, pressure ulcers). PT/OT started within 48h shortens length of stay by 3 days. Speech therapy for dysphagia reduces aspiration pneumonia 50%.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },
  {
    id: 'statin',
    label: 'High-intensity statin: atorvastatin 80mg or rosuvastatin 40mg daily',
    category: 'general',
    evidence: 'Class I, Level A',
    rationale: 'SPARCL trial: atorvastatin 80mg reduced recurrent stroke by 16% (ARR 2.2%, NNT=46). High-intensity statin lowers LDL >50%, stabilizes plaques, and has anti-inflammatory effects. Start immediately unless ICH.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  },
  {
    id: 'glycemic-control',
    label: 'Glycemic control: target 140-180 mg/dL',
    category: 'general',
    evidence: 'Class I, Level C',
    rationale: 'Hyperglycemia (>180 mg/dL) increases infarct size, hemorrhagic transformation, and mortality. Avoid hypoglycemia (<80 mg/dL) which also worsens outcomes. Use insulin drip for persistent hyperglycemia.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'C'
  },
  {
    id: 'asa-delayed',
    label: 'Aspirin 325mg daily (start at 24h post-tPA after CT)',
    category: 'general',
    evidence: 'Class I, Level A',
    rationale: 'CAST and IST trials: aspirin started within 48h reduces early recurrent stroke by 30% (ARR 1%, NNT=100). Must wait 24h post-tPA to avoid increasing ICH risk.',
    defaultSelected: true,
    evidenceClass: 'I',
    evidenceLevel: 'A'
  }
];

const getCategoryClasses = (category: string) => {
  if (category === 'post-tpa') {
    return {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      textLight: 'text-red-700',
      icon: 'text-red-600',
      checkbox: 'text-red-600 focus:ring-red-500'
    };
  }
  if (category === 'stroke-workup') {
    return {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      textLight: 'text-purple-700',
      icon: 'text-purple-600',
      checkbox: 'text-purple-600 focus:ring-purple-500'
    };
  }
  if (category === 'labs') {
    return {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      textLight: 'text-sky-700',
      icon: 'text-sky-600',
      checkbox: 'text-sky-600 focus:ring-sky-500'
    };
  }
  return {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    textLight: 'text-blue-700',
    icon: 'text-blue-600',
    checkbox: 'text-blue-600 focus:ring-blue-500'
  };
};

const getEvidenceBadgeStyle = (evidenceClass?: string) => {
  switch (evidenceClass) {
    case 'I':
      return 'bg-green-50 text-green-700 border-green-300';
    case 'IIa':
      return 'bg-blue-50 text-blue-700 border-blue-300';
    case 'IIb':
      return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    case 'III':
      return 'bg-red-50 text-red-700 border-red-300';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-300';
  }
};

export const CodeModeStep4: React.FC<CodeModeStep4Props> = ({ step2Data, onComplete, onCopySuccess }) => {
  const treatmentGiven = step2Data.treatmentGiven === 'tnk' || step2Data.treatmentGiven === 'tpa';

  const displayOrders = ORDERS.filter(order => {
    if (order.category === 'post-tpa') return treatmentGiven;
    return true;
  });

  const [selectedOrders, setSelectedOrders] = useState<string[]>(
    displayOrders.filter(o => o.defaultSelected).map(o => o.id)
  );
  const [expandedRationale, setExpandedRationale] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const groupedOrders = displayOrders.reduce((acc, order) => {
    if (!acc[order.category]) acc[order.category] = [];
    acc[order.category].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'labs') return 'Lab work';
    if (category === 'post-tpa') return 'Post-Thrombolysis Monitoring';
    if (category === 'stroke-workup') return 'Stroke Etiology Workup';
    return 'General Stroke Care';
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'labs') return 'water_drop';
    if (category === 'post-tpa') return 'medication';
    if (category === 'stroke-workup') return 'science';
    return 'local_hospital';
  };

  const handleComplete = () => {
    const selectedOrderLabels = displayOrders
      .filter(o => selectedOrders.includes(o.id))
      .map(o => o.label);
    onComplete(selectedOrderLabels);
  };

  const generateEMRNote = () => {
    const groupedSelected: Record<string, string[]> = {};
    displayOrders
      .filter(o => selectedOrders.includes(o.id))
      .forEach(order => {
        if (!groupedSelected[order.category]) {
          groupedSelected[order.category] = [];
        }
        groupedSelected[order.category].push(order.label);
      });

    let emrNote = '# ACUTE ISCHEMIC STROKE - TREATMENT PLAN\n\n';

    if (groupedSelected['labs'] && groupedSelected['labs'].length > 0) {
      emrNote += '## LAB WORK\n';
      groupedSelected['labs'].forEach(label => {
        emrNote += `- ${label}\n`;
      });
      emrNote += '\n';
    }

    if (groupedSelected['post-tpa'] && groupedSelected['post-tpa'].length > 0) {
      emrNote += '## POST-THROMBOLYSIS MONITORING\n';
      groupedSelected['post-tpa'].forEach(label => {
        emrNote += `- ${label}\n`;
      });
      emrNote += '\n';
    }

    if (groupedSelected['stroke-workup'] && groupedSelected['stroke-workup'].length > 0) {
      emrNote += '## STROKE ETIOLOGY WORKUP\n';
      groupedSelected['stroke-workup'].forEach(label => {
        emrNote += `- ${label}\n`;
      });
      emrNote += '\n';
    }

    if (groupedSelected['general'] && groupedSelected['general'].length > 0) {
      emrNote += '## GENERAL STROKE CARE\n';
      groupedSelected['general'].forEach(label => {
        emrNote += `- ${label}\n`;
      });
      emrNote += '\n';
    }

    const selectedCount = displayOrders.filter(o => selectedOrders.includes(o.id)).length;
    emrNote += `\nTotal orders: ${selectedCount}`;

    return emrNote;
  };

  const handleCopyToEMR = async () => {
    const emrNote = generateEMRNote();
    try {
      await navigator.clipboard.writeText(emrNote);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-600">
          {selectedOrders.length} of {displayOrders.length} orders selected
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedOrders).map(([category, orders]) => {
          const classes = getCategoryClasses(category);
          const icon = getCategoryIcon(category);
          const label = getCategoryLabel(category);
          const selectedCount = orders.filter(o => selectedOrders.includes(o.id)).length;

          return (
            <div key={category} className="rounded-lg border border-slate-200 overflow-hidden">
              <div className={`px-4 py-3 ${classes.bg} ${classes.border} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`material-icons-outlined text-lg ${classes.icon}`}>{icon}</span>
                    <div>
                      <h4 className={`font-bold text-sm ${classes.text}`}>{label}</h4>
                      <p className={`text-xs ${classes.textLight} mt-0.5`}>
                        {selectedCount}/{orders.length} selected
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const isSelected = selectedOrders.includes(order.id);
                  const isExpanded = expandedRationale === order.id;

                  return (
                    <div key={order.id} className="bg-white">
                      <div className="px-4 py-2.5 hover:bg-slate-50">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOrder(order.id)}
                            className={`mt-0.5 w-4 h-4 rounded border-slate-300 ${classes.checkbox} cursor-pointer`}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-900">
                              {order.label}
                            </span>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setExpandedRationale(isExpanded ? null : order.id);
                              }}
                              className={`mt-1 text-xs font-medium ${classes.icon} hover:underline flex items-center gap-0.5`}
                            >
                              <span className="material-icons-outlined text-sm">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                              {isExpanded ? 'Hide' : 'Why?'} Evidence & Rationale
                            </button>
                          </div>
                        </label>
                      </div>

                      {isExpanded && (
                        <div className={`px-4 py-3 ${classes.bg} border-t ${classes.border}`}>
                          <div className="text-sm text-slate-700 leading-relaxed">
                            {order.rationale}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleCopyToEMR}
          disabled={selectedOrders.length === 0}
          className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg transition-all ${
            selectedOrders.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : copied
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-icons-outlined text-lg">
            {copied ? 'check_circle' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied!' : 'Copy to EMR'}</span>
        </button>

        <button
          type="button"
          onClick={handleComplete}
          className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <span>Save Orders</span>
        </button>
      </div>
    </div>
  );
};
