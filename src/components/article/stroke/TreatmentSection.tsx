import React, { useState } from 'react';

interface TreatmentSectionProps {
  isLearningMode: boolean;
}

interface OrderCategory {
  id: string;
  title: string;
  icon: string;
  color: 'red' | 'purple' | 'blue';
  orders: {
    label: string;
    rationale: string;
    evidence: string;
  }[];
}

const TREATMENT_CATEGORIES: OrderCategory[] = [
  {
    id: 'post-tpa',
    title: 'Post-Thrombolysis Monitoring',
    icon: 'medication',
    color: 'red',
    orders: [
      {
        label: 'Neuro ICU admission with continuous monitoring',
        evidence: 'Class I, Level B',
        rationale: 'Dedicated stroke units reduce mortality by 18% through early detection of complications. Hemorrhagic transformation occurs in 6-7% of post-tPA patients, requiring intensive monitoring.'
      },
      {
        label: 'Frequent neuro checks: q15min × 2h → q30min × 6h → q1h × 16h',
        evidence: 'Class I, Level C',
        rationale: 'Most symptomatic ICH occurs within 36 hours. Any decline ≥4 NIHSS points requires immediate CT and potential reversal.'
      },
      {
        label: 'Strict BP control <180/105 mmHg × 24 hours',
        evidence: 'Class I, Level B',
        rationale: 'Elevated BP increases hemorrhagic transformation risk 3-fold. Use IV nicardipine or labetalol for precise control. ENCHANTED trial confirmed safety of <140 systolic.'
      },
      {
        label: 'No anticoagulation/antiplatelet agents × 24 hours',
        evidence: 'Class III, Level B',
        rationale: 'ARTIS trial: aspirin within 24h increased symptomatic ICH from 1.6% to 4.3%. Wait for 24h CT to confirm no hemorrhage before starting.'
      },
      {
        label: 'Repeat CT at 24 hours (sooner if any decline)',
        evidence: 'Class I, Level B',
        rationale: 'Detects asymptomatic hemorrhage in 3-6% and confirms infarct evolution. STAT CT required for any worsening, headache, or vomiting.'
      }
    ]
  },
  {
    id: 'stroke-workup',
    title: 'Stroke Etiology Workup',
    icon: 'science',
    color: 'purple',
    orders: [
      {
        label: 'MRI brain with DWI, FLAIR, GRE, MRA head/neck',
        evidence: 'Class I, Level A',
        rationale: 'MRI sensitivity 95% vs CT 60% for acute infarct. DWI positive within minutes. GRE detects microbleeds predicting hemorrhage risk. MRA identifies vessel occlusions.'
      },
      {
        label: 'Echocardiogram (TTE) with bubble study',
        evidence: 'Class I, Level B',
        rationale: 'Identifies cardioembolic source in 20-25%: LV thrombus, valvular disease, PFO. Bubble study detects PFO (25% of population, 40% of young cryptogenic strokes).'
      },
      {
        label: 'Carotid duplex ultrasound',
        evidence: 'Class I, Level A',
        rationale: 'Symptomatic stenosis >70% benefits from CEA within 2 weeks (NNT=6). Non-invasive, cost-effective screening for surgical candidates.'
      },
      {
        label: '30-day cardiac event monitor',
        evidence: 'Class I, Level B',
        rationale: 'CRYSTAL-AF: Detects AF in 16% of cryptogenic strokes vs 3% with 24h Holter. Detection increases with duration: 3% (24h) → 20% (30 days).'
      },
      {
        label: 'Fasting lipid panel and HbA1c',
        evidence: 'Class I, Level A',
        rationale: 'LDL >70 warrants high-intensity statin. SPARCL trial: atorvastatin 80mg reduced recurrent stroke 16%. Diabetes in 30-40% of strokes, often undiagnosed.'
      }
    ]
  },
  {
    id: 'general-care',
    title: 'General Stroke Management',
    icon: 'local_hospital',
    color: 'blue',
    orders: [
      {
        label: 'DVT prophylaxis: SCDs immediately, pharmacologic after 24h',
        evidence: 'Class I, Level A',
        rationale: 'DVT in 10% without prophylaxis. CLOTS-3: SCDs reduce DVT 50%. Start heparin 5000U SQ after 24h CT confirms no hemorrhage.'
      },
      {
        label: 'Aspiration precautions: NPO until swallow screen',
        evidence: 'Class I, Level B',
        rationale: 'Dysphagia in 50% leads to pneumonia in 10%. Pneumonia increases mortality 3-fold. Head elevation 30-45°, supervised feeding per Speech Therapy.'
      },
      {
        label: 'PT, OT, Speech Therapy consults within 24h',
        evidence: 'Class I, Level A',
        rationale: 'Early mobilization improves outcomes and reduces complications. PT/OT within 48h shortens length of stay 3 days. Speech evaluates dysphagia, reducing pneumonia 50%.'
      },
      {
        label: 'High-intensity statin: atorvastatin 80mg daily',
        evidence: 'Class I, Level A',
        rationale: 'SPARCL: Reduced recurrent stroke 16% (NNT=46). Lowers LDL >50%, stabilizes plaques, anti-inflammatory. Start immediately unless ICH.'
      },
      {
        label: 'Glycemic control: target 140-180 mg/dL',
        evidence: 'Class I, Level C',
        rationale: 'Hyperglycemia >180 increases infarct size and hemorrhagic transformation. Avoid hypoglycemia <80 which also worsens outcomes. Insulin drip for persistent elevation.'
      },
      {
        label: 'Aspirin 325mg daily (after 24h if post-tPA)',
        evidence: 'Class I, Level A',
        rationale: 'CAST/IST: Aspirin within 48h reduces recurrent stroke 30% (NNT=100). Wait 24h post-tPA to avoid ICH. If large stroke, consider 48-72h delay.'
      }
    ]
  }
];

const getCategoryClasses = (color: 'red' | 'purple' | 'blue') => {
  if (color === 'red') {
    return {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      textLight: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      expandBg: 'bg-red-50/50 dark:bg-red-900/10'
    };
  }
  if (color === 'purple') {
    return {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-900 dark:text-purple-100',
      textLight: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      expandBg: 'bg-purple-50/50 dark:bg-purple-900/10'
    };
  }
  return {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    textLight: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    expandBg: 'bg-blue-50/50 dark:bg-blue-900/10'
  };
};

export const TreatmentSection: React.FC<TreatmentSectionProps> = ({ isLearningMode }) => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (categoryId: string, orderIndex: number) => {
    const key = `${categoryId}-${orderIndex}`;
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Intro text */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Comprehensive, evidence-based treatment orders for acute ischemic stroke management.
          Each order includes AHA guideline classification and scientific rationale from landmark trials.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {TREATMENT_CATEGORIES.map((category) => {
          const classes = getCategoryClasses(category.color);

          return (
            <div key={category.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Category header */}
              <div className={`px-4 py-3 ${classes.bg} ${classes.border} border-b`}>
                <div className="flex items-center gap-2">
                  <span className={`material-icons-outlined text-lg ${classes.icon}`}>
                    {category.icon}
                  </span>
                  <h3 className={`font-bold text-sm ${classes.text}`}>
                    {category.title}
                  </h3>
                  <span className={`ml-auto text-xs font-medium ${classes.textLight}`}>
                    {category.orders.length} orders
                  </span>
                </div>
              </div>

              {/* Orders list */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {category.orders.map((order, index) => {
                  const key = `${category.id}-${index}`;
                  const isExpanded = expandedOrders.has(key);

                  return (
                    <div key={index} className="bg-white dark:bg-slate-900">
                      <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {order.label}
                              </span>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {order.evidence}
                              </span>
                            </div>

                            <button
                              onClick={() => toggleOrder(category.id, index)}
                              className={`mt-1.5 text-xs font-medium ${classes.icon} hover:underline flex items-center gap-0.5`}
                            >
                              <span className="material-icons-outlined text-sm">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                              {isExpanded ? 'Hide' : 'Show'} Evidence & Rationale
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded rationale */}
                      {isExpanded && (
                        <div className={`px-4 py-3 ${classes.expandBg} border-t ${classes.border}`}>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {order.rationale}
                          </p>
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

      {/* Footer note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <span className="material-icons-outlined text-blue-600 dark:text-blue-400">info</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Clinical Judgment Required
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              These orders represent standard evidence-based care. Individualize based on patient
              comorbidities, contraindications, and clinical status. Consult specialists as needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
