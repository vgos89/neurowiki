import React, { useState } from 'react';

interface HemorrhageProtocolProps {
  isLearningMode?: boolean;
}

const STEPS = [
  { title: 'Administer Cryoprecipitate', detail: '10 units IV immediately' },
  { title: 'Check Fibrinogen Level', detail: 'STAT fibrinogen, trend until >150 mg/dL', tip: 'Every 10 units cryo raises fibrinogen ~50 mg/dL' },
  { title: 'Repeat CT Head', detail: 'CT head in 6h to assess progression' },
  { title: 'Strict BP Control', detail: 'SBP <140 mmHg within 1 hour when feasible. Avoid SBP <110 mmHg. Nicardipine or labetalol.' },
  { title: 'Platelets', detail: 'Not routinely recommended (2022 guidelines). Reserve for severe thrombocytopenia or emergency surgery.' },
  { title: 'Anticoagulation reversal', detail: 'Warfarin: 4-factor PCC 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR <1.4). If PCC unavailable: FFP. Dabigatran: idarucizumab 5 g IV. Xa inhibitors: andexanet or PCC.' },
];

export const HemorrhageProtocol: React.FC<HemorrhageProtocolProps> = ({ isLearningMode = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="material-icons-outlined text-xl text-red-600 dark:text-red-400">error_outline</span>
          <div className="text-left">
            <h3 className="text-base font-bold text-red-900 dark:text-red-100">
              TNK/tPA Hemorrhage Management
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300">
              Emergency protocol for bleeding complications
            </p>
          </div>
        </div>
        <span className="material-icons-outlined text-lg text-red-600 dark:text-red-400">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{step.detail}</div>
                  {step.tip && (
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{step.tip}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            References: AHA/ASA 2022 Guideline for Management of Spontaneous ICH.{' '}
            <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000407" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 underline">Full guideline</a>
          </p>

          <button className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
            <span className="material-icons-outlined text-sm">print</span>
            Print Emergency Protocol
          </button>
        </div>
      )}
    </div>
  );
};
