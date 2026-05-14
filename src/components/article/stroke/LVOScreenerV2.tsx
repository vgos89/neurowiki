import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface CorticalSign {
  id: string;
  label: string;
  description: string;
  evidence: string;
}

const CORTICAL_SIGNS: CorticalSign[] = [
  {
    id: 'aphasia',
    label: 'Aphasia',
    description: 'Global language impairment - cannot speak, understand, read, or write. Localizes to dominant (usually left) hemisphere.',
    evidence: 'Strong predictor of M1/M2 MCA occlusion (PPV 89%, FAST-ED study). Consider posterior circulation if fluent aphasia only.'
  },
  {
    id: 'neglect',
    label: 'Hemispatial Neglect',
    description: 'Inattention to one side of space or body. Patient ignores stimuli on contralesional side despite intact primary sensation.',
    evidence: 'Indicates non-dominant (usually right) hemisphere. Associated with MCA or PCA territory LVO (Sensitivity 71% for LVO).'
  },
  {
    id: 'gaze',
    label: 'Gaze Deviation',
    description: 'Eyes deviate conjugately toward lesion ("looking at the lesion, away from the hemiparesis"). Cannot cross midline voluntarily.',
    evidence: 'Frontal eye field involvement. RACE scale: gaze deviation = 1 point. Increases LVO probability by 3-fold (OR 3.2).'
  },
  {
    id: 'visual',
    label: 'Hemianopia',
    description: 'Loss of half of visual field in both eyes. Homonymous = same side in each eye. Patient may not be aware (neglect).',
    evidence: 'Indicates optic radiation or occipital lobe. MCA or PCA territory. Complete hemianopia suggests proximal MCA or PCA occlusion.'
  },
  {
    id: 'extinction',
    label: 'Sensory Extinction',
    description: 'Patient detects single stimuli but extinguishes contralesional stimulus when bilateral simultaneous stimuli presented.',
    evidence: 'Cortical sensory processing deficit. Indicates parietal lobe involvement. Associated with MCA territory strokes.'
  },
  {
    id: 'apraxia',
    label: 'Ideomotor Apraxia',
    description: 'Cannot perform learned motor tasks on command despite intact motor/sensory function. Cannot mime using objects.',
    evidence: 'Dominant parietal or premotor cortex. Suggests cortical involvement rather than subcortical/lacunar stroke.'
  },
];

interface LVOScreenerV2Props {
  onCorticalSignsYes?: () => void;
}

export const LVOScreenerV2: React.FC<LVOScreenerV2Props> = ({ onCorticalSignsYes }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [decision, setDecision] = useState<'yes' | 'no' | null>(null);
  const [isLearningMode, setIsLearningMode] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">LVO Screening</h3>
              <p className="text-xs text-gray-500">Large vessel occlusion detection</p>
            </div>
          </div>
          
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Explanation Toggle */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-900">What are cortical signs?</span>
          {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Explanation */}
        {showExplanation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
            <p className="text-xs font-semibold text-blue-900">
              Cortical signs suggest large vessel occlusion (LVO) requiring thrombectomy:
            </p>
            <div className="space-y-2">
              {CORTICAL_SIGNS.map(sign => (
                <div key={sign.id} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {sign.label}
                      </span>
                      <span className="text-xs text-gray-700">
                        {' - '}{sign.description}
                      </span>
                    </div>
                  </div>
                  {isLearningMode && (
                    <div className="ml-5 p-2 bg-purple-50 rounded text-xs text-gray-700 leading-relaxed">
                      <span className="font-semibold text-purple-700">Evidence: </span>
                      {sign.evidence}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isLearningMode && (
              <div className="pt-2 border-t border-blue-200">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">Clinical Pearl: </span>
                  Presence of ANY cortical sign increases LVO probability. RACE scale (Rapid Arterial oCclusion Evaluation) 
                  uses facial palsy + arm motor + leg motor + gaze + aphasia + neglect. Score ≥5 has 85% sensitivity for LVO. 
                  Even if RACE {'<'}5, cortical signs warrant CTA.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Decision Buttons */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Are cortical signs present?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setDecision('yes');
                if (onCorticalSignsYes) {
                  onCorticalSignsYes();
                }
              }}
              className={`py-4 rounded-lg font-bold text-sm transition-all ${
 decision === 'yes'
 ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-300'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
            >
              YES - Present
            </button>
            <button
              onClick={() => setDecision('no')}
              className={`py-4 rounded-lg font-bold text-sm transition-all ${
 decision === 'no'
 ? 'bg-gray-600 text-white shadow-lg ring-2 ring-gray-300'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
            >
              NO - Absent
            </button>
          </div>
        </div>

        {/* Result - YES */}
        {decision === 'yes' && (
          <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-bold text-orange-900 mb-2">
                  High Probability LVO - Obtain Vascular Imaging
                </div>
                <div className="text-xs text-orange-800 space-y-1.5 leading-relaxed">
                  <div className="font-semibold">Immediate Actions:</div>
                  <div>• Order CTA head/neck STAT (identify vessel occlusion)</div>
                  <div>• Consider CTP if in extended window (4.5-24h)</div>
                  <div>• Alert interventional neuroradiology NOW</div>
                  <div>• Start tPA if within 4.5h (don't delay for imaging)</div>
                  <div>• Time is brain - every 15 min = 3.6% worse outcome</div>
                </div>
                {isLearningMode && (
                  <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-gray-700 leading-relaxed">
                    <div className="font-semibold text-purple-700 mb-1">Evidence:</div>
                    Thrombectomy for LVO improves outcomes (mRS 0-2) from 29% to 46% at 90 days (meta-analysis HERMES collaboration). 
                    Benefit extends to 24h in selected patients (DAWN: wake-up strokes, DEFUSE-3: perfusion mismatch). Number needed 
                    to treat = 6 for good outcome.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result - NO */}
        {decision === 'no' && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-700 leading-relaxed">
              <span className="font-semibold">No cortical signs identified. </span>
              LVO less likely but not excluded. Still obtain CTA if:
              <ul className="mt-2 space-y-1 ml-4">
                <li>• NIHSS ≥6 (moderate-severe deficit)</li>
                <li>• Dense hemiplegia (arm + leg weakness)</li>
                <li>• Sudden onset severe symptoms</li>
                <li>• Clinical suspicion remains high</li>
              </ul>
            </div>
            {isLearningMode && (
              <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-gray-700 leading-relaxed">
                <div className="font-semibold text-purple-700 mb-1">Clinical Pearl:</div>
                Not all LVOs present with cortical signs. Basilar occlusions may present with only brainstem signs (vertical gaze 
                palsy, ataxia, crossed findings). M2 occlusions may spare eloquent cortex. When in doubt, image.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
