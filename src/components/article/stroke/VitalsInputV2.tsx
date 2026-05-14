import React, { useState } from 'react';
import { Activity, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface BPProtocol {
  name: string;
  indication: string;
  dosing: string[];
  evidence: string;
}

const BP_PROTOCOLS: BPProtocol[] = [
  {
    name: 'Labetalol',
    indication: 'First-line for acute BP lowering',
    dosing: [
      '10mg IV push over 1-2 minutes',
      'May repeat or double Q10 minutes (max 300mg total)',
      'Alternative: 10-20mg initial, then 2-8 mg/min infusion'
    ],
    evidence: 'Combined alpha/beta blocker. Onset 5-10 min, duration 3-6h. Avoid in asthma, CHF, bradycardia, heart block.'
  },
  {
    name: 'Nicardipine',
    indication: 'Preferred if contraindications to labetalol',
    dosing: [
      'Start 5 mg/h IV infusion',
      'Titrate by 2.5 mg/h every 5 minutes',
      'Maximum 15 mg/h until target BP achieved'
    ],
    evidence: 'Calcium channel blocker. Onset 5-15 min. Predictable dose-response. Safe in asthma, COPD. Watch for reflex tachycardia.'
  },
  {
    name: 'Clevidipine',
    indication: 'Refractory hypertension or need for rapid titration',
    dosing: [
      'Start 1-2 mg/h IV infusion',
      'Double dose Q90 seconds initially, then Q5-10 min',
      'Usual dose 4-6 mg/h (max 21 mg/h)'
    ],
    evidence: 'Ultra-short acting CCB (t½ 1 min). Rapid on/off. Expensive but allows precise control. Avoid in soy allergy.'
  },
  {
    name: 'Hydralazine',
    indication: 'Avoid in acute stroke (unpredictable, can cause precipitous drops)',
    dosing: [
      'NOT recommended for acute stroke BP management'
    ],
    evidence: 'Direct vasodilator with unpredictable response. Risk of sudden BP drop causing decreased cerebral perfusion.'
  }
];

export const VitalsInputV2: React.FC = () => {
  const [glucose, setGlucose] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [showBPProtocol, setShowBPProtocol] = useState(false);
  const [isLearningMode, setIsLearningMode] = useState(false);

  const glucoseNum = parseInt(glucose) || 0;
  const systolicNum = parseInt(systolic) || 0;
  const diastolicNum = parseInt(diastolic) || 0;

  const isGlucoseLow = glucoseNum > 0 && glucoseNum < 70;
  const isGlucoseHigh = glucoseNum > 180;
  const isBPElevated = systolicNum > 185 || diastolicNum > 110;
  const isBPCritical = systolicNum > 220 || diastolicNum > 120;

  // Auto-expand BP protocol if elevated
  React.useEffect(() => {
    if (isBPElevated) {
      setShowBPProtocol(true);
    }
  }, [isBPElevated]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Vital Signs</h3>
              <p className="text-xs text-gray-500">Critical parameters monitoring</p>
            </div>
          </div>
          
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Glucose */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Point-of-Care Glucose (mg/dL)
          </label>
          <input
            type="number"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            placeholder="Enter glucose"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
          />
          
          {isGlucoseLow && (
            <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-red-700 mb-1">
                    Hypoglycemia - Stroke Mimic!
                  </div>
                  <div className="text-xs text-red-600 leading-relaxed">
                    30% of code strokes are mimics. Give 25g D50 (50mL of 50% dextrose) IV push. 
                    Recheck glucose in 15 minutes. If improved with normoglycemia, NOT a stroke.
                  </div>
                  {isLearningMode && (
                    <div className="mt-2 pt-2 border-t border-red-200 text-xs text-gray-700">
                      <span className="font-semibold">Evidence: </span>
                      Hypoglycemia can perfectly mimic stroke with focal deficits. Always check glucose FIRST 
                      in code stroke - takes 10 seconds, prevents inappropriate tPA. Mechanism: neurons switch 
                      to anaerobic metabolism causing dysfunction without cell death (reversible).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isGlucoseHigh && (
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-yellow-700">
                    Hyperglycemia - Target {'<'}180 mg/dL
                  </div>
                  {isLearningMode && (
                    <div className="mt-1 text-xs text-gray-700 leading-relaxed">
                      Hyperglycemia in acute stroke increases infarct size, hemorrhagic transformation (OR 3.0), 
                      and mortality (OR 3.28). GIST-UK trial: insulin to maintain 72-126 mg/dL didn't improve 
                      outcomes vs usual care, but consensus targets {'<'}180. Avoid hypoglycemia.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Blood Pressure */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Blood Pressure (mmHg)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              placeholder="SBP"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
            />
            <span className="flex items-center text-2xl font-bold text-gray-400">/</span>
            <input
              type="number"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              placeholder="DBP"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900"
            />
          </div>

          {isBPElevated && (
            <div className="mt-3 space-y-3">
              <div className={`p-3 rounded-lg border-2 ${
 isBPCritical
 ? 'bg-red-50 border-red-300'
 : 'bg-orange-50 border-orange-300'
 }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
 isBPCritical ? 'text-red-600' : 'text-orange-600'
 }`} />
                  <div className="flex-1">
                    <div className="text-xs font-bold mb-1">
                      {isBPCritical ? 'Critical Hypertension' : 'Elevated BP - Control Required'}
                    </div>
                    <div className="text-xs leading-relaxed">
                      {isBPCritical 
                        ? 'BP >220/120 requires immediate treatment. Goal <185/110 before tPA, then <180/105 × 24h.'
                        : 'BP >185/110 is absolute contraindication to tPA. Must lower to <185/110 before thrombolysis.'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* BP Protocol Section */}
              <button
                onClick={() => setShowBPProtocol(!showBPProtocol)}
                className="w-full flex items-center justify-between p-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm">BP Management Protocols</span>
                {showBPProtocol ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showBPProtocol && (
                <div className="space-y-3">
                  {BP_PROTOCOLS.map(protocol => (
                    <div key={protocol.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {protocol.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {protocol.indication}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 mb-2">
                        {protocol.dosing.map((dose, idx) => (
                          <div key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{dose}</span>
                          </div>
                        ))}
                      </div>

                      {isLearningMode && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-700 leading-relaxed">
                            <span className="font-semibold text-purple-700">Evidence: </span>
                            {protocol.evidence}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLearningMode && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs text-gray-700 leading-relaxed space-y-2">
                        <div>
                          <span className="font-semibold text-purple-700">Why strict BP control? </span>
                          ENCHANTED trial: intensive BP lowering (130-140) vs guideline ({"<"}180) showed trend toward 
                          less hemorrhage (1.0% vs 2.0%) but more early neurological deterioration. Current consensus: 
                          {"<"}185/110 pre-tPA, {"<"}180/105 × 24h post-tPA. Avoid excessive lowering - can worsen 
                          penumbral ischemia (J-curve relationship).
                        </div>
                        <div>
                          <span className="font-semibold text-purple-700">Pearl: </span>
                          If BP remains {">"} 185/110 despite maximal medical therapy, patient is NOT a tPA candidate 
                          (absolute contraindication). Consider thrombectomy if LVO - less BP-dependent.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* General Info */}
        {!isBPElevated && !isGlucoseLow && !isGlucoseHigh && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-gray-700 leading-relaxed">
              <span className="font-semibold">Target vitals for stroke: </span>
              Glucose 70-180 mg/dL, BP {"<"}185/110 (pre-tPA) or {"<"}180/105 (post-tPA × 24h), 
              Temperature {"<"}37.5°C, O₂ sat {">"}94%.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
