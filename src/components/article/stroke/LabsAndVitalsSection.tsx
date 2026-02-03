import React, { useState } from 'react';

interface LabItem {
  id: string;
  label: string;
  evidence: string;
  rationale: string;
}

const LAB_ITEMS: LabItem[] = [
  {
    id: 'pt_inr_ptt',
    label: 'PT / INR / PTT',
    evidence: 'Class I, Level C',
    rationale: 'INR >1.7 is absolute contraindication to tPA. Do not delay tPA for results if within 4.5h; point-of-care glucose is the only mandatory lab (AHA/ASA 2026). PT/PTT needed if heparin use suspected.'
  },
  {
    id: 'cbc',
    label: 'CBC with Platelets',
    evidence: 'Class I, Level C',
    rationale: 'Platelet count <100,000/mm³ is contraindication to tPA. Do not delay tPA for CBC if within window unless clinical suspicion for thrombocytopenia (e.g. known ITP, cirrhosis).'
  },
  {
    id: 'bmp',
    label: 'Basic Metabolic Panel',
    evidence: 'Class IIa, Level C',
    rationale: 'Electrolytes and renal function guide BP management and contrast use. Not required before tPA; obtain when feasible without delaying treatment.'
  },
  {
    id: 'troponin',
    label: 'Troponin I',
    evidence: 'Class I, Level B',
    rationale: 'Acute MI and stroke share risk factors; troponin elevation common in stroke. Guides cardiac monitoring and secondary prevention. Do not delay tPA for troponin.'
  },
  {
    id: 'lipid',
    label: 'Lipid Panel',
    evidence: 'Class I, Level A',
    rationale: 'SPARCL trial: high-intensity statin reduces recurrent stroke. LDL >70 mg/dL warrants statin. Fasting preferred but do not delay treatment for lipid panel.'
  },
  {
    id: 'hba1c',
    label: 'Hemoglobin A1c',
    evidence: 'Class I, Level B',
    rationale: 'Diabetes in 30–40% of stroke patients; A1c >6.5% confirms diabetes. Uncontrolled diabetes increases recurrent stroke risk. Do not delay tPA for A1c.'
  }
];

interface LabsAndVitalsSectionProps {
  isLearningMode?: boolean;
  /** When true, omit the "Laboratory Workup" heading (e.g. when used inside combined Labs & Treatment section) */
  hideHeading?: boolean;
}

const LAB_CARD_CLASSES = {
  bg: 'bg-blue-50 dark:bg-blue-900/20',
  border: 'border-blue-200 dark:border-blue-800',
  text: 'text-blue-900 dark:text-blue-100',
  textLight: 'text-blue-700 dark:text-blue-300',
  icon: 'text-blue-600 dark:text-blue-400',
  checkbox: 'text-blue-600 focus:ring-blue-500'
};

export const LabsAndVitalsSection: React.FC<LabsAndVitalsSectionProps> = ({ isLearningMode = false, hideHeading = false }) => {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    LAB_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleLab = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = LAB_ITEMS.filter(item => selected[item.id]).length;

  return (
    <div className="space-y-4">
      {isLearningMode && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-lg text-slate-600 dark:text-slate-400">science</span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Only <strong>blood glucose</strong> is mandatory before thrombolysis. Other labs should not delay treatment if within the time window; point-of-care glucose suffices to rule out hypoglycemia.
            </p>
          </div>
        </div>
      )}

      {/* Critical Alert - compact */}
      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2">
          <span className="material-icons-outlined text-lg text-red-600 dark:text-red-400">error_outline</span>
          <div>
            <h4 className="text-xs font-bold text-red-900 dark:text-red-100 uppercase tracking-wide">Critical</h4>
            <p className="text-sm text-red-800 dark:text-red-200">
              Only <strong>Blood Glucose</strong> required before tPA. Do not delay for other labs if within 4.5h.
            </p>
          </div>
        </div>
      </div>

      {/* Laboratory Workup - same format as General Stroke Care */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`px-4 py-3 ${LAB_CARD_CLASSES.bg} ${LAB_CARD_CLASSES.border} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`material-icons-outlined text-lg ${LAB_CARD_CLASSES.icon}`}>water_drop</span>
              <div>
                <h4 className={`font-bold text-sm ${LAB_CARD_CLASSES.text}`}>
                  {hideHeading ? 'Secondary Workup' : 'Laboratory Workup'}
                </h4>
                <p className={`text-xs ${LAB_CARD_CLASSES.textLight} mt-0.5`}>
                  {selectedCount}/{LAB_ITEMS.length} selected
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {LAB_ITEMS.map((item) => {
            const isSelected = selected[item.id];
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="bg-white dark:bg-slate-900">
                <div className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleLab(item.id)}
                      className={`mt-0.5 w-4 h-4 rounded border-slate-300 ${LAB_CARD_CLASSES.checkbox} cursor-pointer`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.label}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setExpandedId(isExpanded ? null : item.id);
                        }}
                        className={`mt-1 text-xs font-medium ${LAB_CARD_CLASSES.icon} hover:underline flex items-center gap-0.5`}
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
                  <div className={`px-4 py-3 ${LAB_CARD_CLASSES.bg} border-t ${LAB_CARD_CLASSES.border}`}>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.rationale}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
