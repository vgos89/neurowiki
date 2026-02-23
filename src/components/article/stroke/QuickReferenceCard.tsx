import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'stroke-quick-ref-collapsed';

export const QuickReferenceCard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore storage errors
    }
  }, [collapsed]);

  return (
    <div className="mx-3 sm:mx-6 mb-4 sm:mb-6 rounded-xl border border-neuro-200 bg-neuro-50 dark:bg-slate-800/60 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setCollapsed(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neuro-100/60 dark:hover:bg-slate-700/40 transition-colors"
        aria-expanded={!collapsed}
        aria-controls="quick-ref-body"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-widest text-neuro-700 dark:text-neuro-300">
            Quick Reference
          </span>
          <span className="hidden sm:inline text-xs text-neuro-500 dark:text-slate-400">
            · tPA dosing · BP targets · treatment windows · key contraindications
          </span>
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-neuro-500 flex-shrink-0" aria-hidden />
          : <ChevronUp className="w-4 h-4 text-neuro-500 flex-shrink-0" aria-hidden />
        }
      </button>

      {/* Body */}
      {!collapsed && (
        <div id="quick-ref-body" className="px-4 pb-4 pt-1 space-y-4">
          {/* Row 1: Dosing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* tPA */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-neuro-100 dark:border-slate-700 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-neuro-600 dark:text-neuro-400 mb-2">
                Alteplase (tPA)
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">0.9 mg/kg — max 90 mg</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                10% bolus over 1 min → 90% infusion over 60 min
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                Window: <strong className="text-slate-700 dark:text-slate-300">0–4.5 h</strong> (extended 4.5–9 h w/ perfusion imaging)
              </p>
            </div>

            {/* TNK */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-neuro-100 dark:border-slate-700 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-neuro-600 dark:text-neuro-400 mb-2">
                Tenecteplase (TNK) — COR 1 equal to tPA
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                {[
                  ['<60 kg', '15 mg'],
                  ['60–69 kg', '17.5 mg'],
                  ['70–79 kg', '20 mg'],
                  ['80–89 kg', '22.5 mg'],
                  ['≥90 kg', '25 mg (max)'],
                ].map(([wt, dose]) => (
                  <React.Fragment key={wt}>
                    <span className="text-slate-500 dark:text-slate-400">{wt}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{dose}</span>
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">IV bolus over 5–10 seconds</p>
            </div>
          </div>

          {/* Row 2: BP targets + Windows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* BP */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-900/40 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">
                Blood Pressure Targets
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Pre-tPA:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">&lt;185/110 mmHg</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Post-tPA:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">&lt;180/105 mmHg</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">No tPA/EVT:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">&lt;220/120 mmHg</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Post-EVT:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">&lt;180/105 mmHg</span>
                  <span className="text-xs text-rose-600 dark:text-rose-400">(intensive BP harmful)</span>
                </div>
              </div>
            </div>

            {/* Windows */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-900/40 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-2">
                Treatment Windows
              </p>
              <div className="space-y-1.5 text-sm">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">IVT: 0–4.5 h</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">from LKW</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Extended IVT: 4.5–9 h</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">CT/MRI perfusion mismatch</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">EVT: 0–24 h</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">DAWN/DEFUSE-3 criteria</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Wake-up stroke:</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">DWI-FLAIR mismatch → IVT eligible</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Key contraindications */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-100 dark:border-red-900/40 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400 mb-2">
              Absolute Contraindications to IVT (key)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
              {[
                'Active intracranial hemorrhage on CT',
                'Major surgery / serious trauma < 14 days',
                'Intracranial / intraspinal surgery < 3 months',
                'Recent MI < 3 months',
                'BP not controlled after treatment (>185/110)',
                'Glucose < 50 or > 400 mg/dL (uncorrected)',
                'INR > 1.7 / anti-Xa above therapeutic range',
                'Platelet count < 100,000/mm³',
              ].map(item => (
                <div key={item} className="flex items-start gap-1.5">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">·</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Source: 2026 AHA/ASA Guidelines · See eligibility checker for full inclusion/exclusion list
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
