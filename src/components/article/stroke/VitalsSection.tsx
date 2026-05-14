import React from 'react';
import { VitalsInputV2 } from './VitalsInputV2';
import { SectionPearls } from './SectionPearls';
import { STROKE_CLINICAL_PEARLS } from '../../../data/strokeClinicalPearls';

interface VitalsSectionProps {
  onComplete?: () => void;
  isLearningMode?: boolean;
}

export const VitalsSection: React.FC<VitalsSectionProps> = ({ onComplete, isLearningMode = false }) => {
  return (
    <div className="space-y-4">
      {isLearningMode && (
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 mb-4">
          <p className="text-base text-gray-700 leading-relaxed">
            Monitor and control blood pressure and glucose before and after thrombolysis. Elevated blood pressure 
            ({'>'}185/110) must be controlled before tPA administration. Hyperglycemia ({'>'}200 mg/dL) should be treated 
            as it worsens outcomes. Maintain BP {'<'}180/105 for 24 hours post-tPA.
          </p>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            <strong>Clinical Context:</strong> Blood pressure management is a delicate balance. Too high increases hemorrhage risk, 
            but too low can worsen penumbral ischemia. The ENCHANTED trial showed intensive BP lowering had mixed results. Current 
            consensus: aggressive control pre-tPA ({'<'}185/110), then moderate control post-tPA ({'<'}180/105) to maintain perfusion 
            while preventing hemorrhage.
          </p>
        </div>
      )}

      {/* Vitals Input Component */}
      <div className="mt-6">
        <VitalsInputV2 />
      </div>

      {/* Clinical Pearls for Vital Signs */}
      {STROKE_CLINICAL_PEARLS['step-4'] && (
        <SectionPearls
          sectionId="step-4"
          quickPearls={STROKE_CLINICAL_PEARLS['step-4'].quick}
          deepPearls={STROKE_CLINICAL_PEARLS['step-4'].deep}
          isLearningMode={isLearningMode || false}
        />
      )}
    </div>
  );
};
