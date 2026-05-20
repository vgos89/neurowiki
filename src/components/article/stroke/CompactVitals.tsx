import React, { useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';

export const CompactVitals: React.FC = () => {
  const [glucose, setGlucose] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  const glucoseNum = parseInt(glucose) || 0;
  const systolicNum = parseInt(systolic) || 0;
  const diastolicNum = parseInt(diastolic) || 0;

  const isGlucoseLow = glucoseNum > 0 && glucoseNum < 70;
  const isGlucoseHigh = glucoseNum > 180;
  const isBPElevated = systolicNum > 185 || diastolicNum > 110;

  return (
    <div className="space-y-3">
      {/* Glucose */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Point-of-Care Glucose (mg/dL)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text" inputMode="numeric"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            placeholder="Enter glucose"
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
          />
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setGlucose(String(Math.min(500, glucoseNum + 1)))}
              className="w-6 h-4 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-t bg-white hover:bg-gray-50"
            >
              ↑
            </button>
            <button
              onClick={() => setGlucose(String(Math.max(0, glucoseNum - 1)))}
              className="w-6 h-4 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-b bg-white hover:bg-gray-50"
            >
              ↓
            </button>
          </div>
        </div>
        {isGlucoseLow && (
          <div className="mt-1.5 p-2 bg-red-50 rounded border border-red-200">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700">
                Hypoglycemia - Give 25g D50 IV
              </div>
            </div>
          </div>
        )}
        {isGlucoseHigh && (
          <div className="mt-1.5 p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-700">
                Target {'<'}180 mg/dL
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blood Pressure */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Blood Pressure (mmHg)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text" inputMode="numeric"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            placeholder="SBP"
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
          />
          <span className="text-lg font-bold text-gray-400">/</span>
          <input
            type="text" inputMode="numeric"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            placeholder="DBP"
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
          />
        </div>
        {isBPElevated && (
          <div className="mt-1.5 p-2 bg-orange-50 rounded border border-orange-200">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-orange-700">
                BP {'>'}185/110 - Control required before tPA
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Vitals Info */}
      {!isBPElevated && !isGlucoseLow && !isGlucoseHigh && (
        <div className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs text-gray-700 leading-relaxed">
            <span className="font-semibold">Target vitals for stroke: </span>
            Glucose 70-180 mg/dL, BP {'<'}185/110 (pre-tPA) or {'<'}180/105 (post-tPA × 24h), 
            Temperature {'<'}37.5°C, O₂ sat {'>'}94%.
          </div>
        </div>
      )}
    </div>
  );
};
