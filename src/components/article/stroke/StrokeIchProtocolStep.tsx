import React from 'react';

/**
 * ICH Protocol step shown when CT demonstrates ICH (bleed).
 * Based on AHA/ASA guidelines: immediate assessment, imaging, reversal, BP, ICP, ICU.
 * Evidence: INTERACT2, ATACH-2, AHA/ASA ICH guidelines.
 */

/** Exported for inline display in Step 2 when ICH detected is selected */
export const ICH_PROTOCOL_ITEMS = [
  { title: 'Immediate assessment', detail: 'ABCs, GCS, pupils, NIHSS. Anticoagulant history — agent and last dose.', evidence: 'Class I, Level C' },
  { title: 'Imaging', detail: 'NCCT: location, volume (ABC/2), IVH, midline shift. CTA if vascular etiology possible.', evidence: 'Class I, Level A' },
  { title: 'Anticoagulation reversal', detail: 'Warfarin: 4-factor PCC 25-50 units/kg IV + Vitamin K 10 mg IV (goal INR <1.4). FFP if PCC unavailable. Dabigatran: idarucizumab 5 g IV. Xa inhibitors: andexanet alfa or 4-factor PCC.', evidence: 'AHA/ASA 2022 ICH, Section 6.2, Class I, Level B' },
  { title: 'Blood pressure', detail: 'SBP <140 mmHg within 1 hour when feasible. Nicardipine or labetalol. Avoid SBP <110 mmHg; avoid rapid drop (>90 mmHg in 1 h).', evidence: 'AHA/ASA 2022 ICH, Section 5.1, Class I, Level A; INTERACT2, ATACH-2' },
  { title: 'ICP and herniation', detail: 'HOB 30°. Hyperosmolar (mannitol or 3% saline). Hyperventilation as bridge only. EVD if hydrocephalus from IVH.', evidence: 'Class I, Level C' },
  { title: 'ICU and complications', detail: 'Seizure: benzos then AED. DVT prophylaxis when stable (24–48 h). Glucose 140–180. Fever: treat.', evidence: 'Class I, Level B' },
];

interface StrokeIchProtocolStepProps {
  onComplete: () => void;
  isLearningMode?: boolean;
}

export const StrokeIchProtocolStep: React.FC<StrokeIchProtocolStepProps> = ({ onComplete, isLearningMode = false }) => {
  return (
    <div className="space-y-4">
      {isLearningMode && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex gap-2">
            <span className="material-icons-outlined text-lg text-amber-600">info</span>
            <p className="text-sm text-amber-800 leading-relaxed">
              When CT shows ICH, thrombolysis is contraindicated. Follow acute ICH protocol: BP control, reversal if on anticoagulants, ICP management, ICU care. INTERACT2/ATACH-2: SBP &lt;140 mmHg when feasible.
            </p>
          </div>
        </div>
      )}

      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-icons-outlined text-xl text-red-600">error_outline</span>
          <h3 className="text-base font-bold text-red-900">ICH Detected — Acute ICH Protocol (AHA/ASA)</h3>
        </div>
        <p className="text-sm text-red-800 mb-4">
          Do not give tPA/TNK. Proceed with hemorrhage protocol. Evidence: INTERACT2, ATACH-2, AHA/ASA ICH guidelines.
        </p>

        <div className="space-y-3">
          {ICH_PROTOCOL_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-600">{item.detail}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.evidence}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-xs text-red-700 mb-3">
            <strong>References:</strong> 2022 AHA/ASA Guideline for Management of Patients With Spontaneous ICH. INTERACT2; ATACH-2.{' '}
            <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000407" target="_blank" rel="noopener noreferrer" className="underline">Full guideline</a>.
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="w-full min-h-[44px] py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-icons-outlined text-lg">check_circle</span>
            Mark ICH protocol complete
          </button>
        </div>
      </div>
    </div>
  );
};
