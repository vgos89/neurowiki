import React from 'react';
import { MedicalTooltip } from './MedicalTooltip';
import { MEDICAL_GLOSSARY } from '../data/medicalGlossary';

interface TrialStatsProps {
  sampleSize: string;
  sampleSizeLabel?: string;
  sampleSizeInfo?: string; // Trial-specific tooltip
  primaryEndpoint: string;
  primaryEndpointLabel?: string;
  primaryEndpointInfo?: string; // Trial-specific tooltip
  pValue: string;
  pValueLabel?: string;
  pValueInfo?: string; // Trial-specific tooltip
  effectSize: string;
  effectSizeLabel?: string;
  effectSizeInfo?: string; // Trial-specific tooltip
}

/**
 * TrialStats Component
 *
 * Displays trial statistics cards with built-in tooltips for medical terms.
 *
 * Usage:
 * <TrialStats
 *   sampleSize="503"
 *   sampleSizeLabel="Randomized Patients"
 *   primaryEndpoint="mRS 0-1"
 *   primaryEndpointLabel="at 90 Days"
 *   pValue="0.02"
 *   pValueLabel="Statistically Sig."
 *   effectSize="11.5%"
 *   effectSizeLabel="Absolute Increase"
 * />
 */
export const TrialStats: React.FC<TrialStatsProps> = ({
  sampleSize,
  sampleSizeLabel = 'Sample Size',
  sampleSizeInfo,
  primaryEndpoint,
  primaryEndpointLabel = 'Primary Endpoint',
  primaryEndpointInfo,
  pValue,
  pValueLabel = 'P-Value',
  pValueInfo,
  effectSize,
  effectSizeLabel = 'Effect Size',
  effectSizeInfo,
}) => {
  // Determine appropriate tooltip based on label content
  const getPValueTooltip = () => {
    // Use trial-specific info if available
    if (pValueInfo) return pValueInfo;

    if (pValueLabel?.toLowerCase().includes('estimation')) {
      return 'Estimation trial design establishes a safe range for clinical practice rather than testing for superiority. No p-value is calculated because the goal is to estimate the range of plausible effects, not to prove one treatment is better.';
    }
    return MEDICAL_GLOSSARY['p-value'] || 'Probability the result occurred by chance. p < 0.05 means less than 5% chance it\'s due to luck. Lower p-values indicate stronger evidence.';
  };

  const getEffectSizeTooltip = () => {
    // Use trial-specific info if available
    if (effectSizeInfo) return effectSizeInfo;

    if (effectSizeLabel?.toLowerCase().includes('risk difference')) {
      return 'Risk Difference: The absolute difference in event rates between treatment and control groups. Negative values favor treatment. The confidence interval shows the range of plausible values. For estimation trials, this establishes the safe range for practice.';
    }
    return MEDICAL_GLOSSARY['effect-size'] || 'Raw percentage difference between treatment and control groups. Shows how many extra patients out of 100 benefit from treatment.';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Sample Size */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-hidden max-w-full">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-start gap-1 min-h-[2.5rem]">
          <span className="flex-1 break-words break-all leading-tight">{sampleSizeLabel}</span>
          <MedicalTooltip
            term="Sample Size"
            definition={sampleSizeInfo || MEDICAL_GLOSSARY['sample-size'] || 'Total number of patients enrolled and randomized in the study.'}
          />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white break-words">{sampleSize}</div>
      </div>

      {/* Primary Endpoint */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-hidden max-w-full">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-start gap-1 min-h-[2.5rem]">
          <span className="flex-1 break-words break-all leading-tight">{primaryEndpointLabel}</span>
          <MedicalTooltip
            term="Primary Endpoint"
            definition={primaryEndpointInfo || MEDICAL_GLOSSARY['primary-endpoint'] || 'The main outcome measure used to determine if the treatment works.'}
          />
        </div>
        <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">{primaryEndpoint}</div>
      </div>

      {/* P-Value */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-hidden max-w-full">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-start gap-1 min-h-[2.5rem]">
          <span className="flex-1 break-words break-all leading-tight">{pValueLabel}</span>
          <MedicalTooltip
            term={pValueLabel?.toLowerCase().includes('estimation') ? 'Estimation Design' : 'p-Value'}
            definition={getPValueTooltip()}
          />
        </div>
        <div className={`text-xl sm:text-2xl font-bold break-words`}>
          <span className={
            pValueLabel?.toLowerCase().includes('not significant') ||
            (pValue !== 'N/A' && !isNaN(parseFloat(pValue)) && parseFloat(pValue) >= 0.05)
              ? 'text-red-600 dark:text-red-400'
              : pValue === 'N/A'
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-green-600 dark:text-green-400'
          }>{pValue}</span>
        </div>
      </div>

      {/* Effect Size */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-hidden max-w-full">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-start gap-1 min-h-[2.5rem]">
          <span className="flex-1 break-words break-all leading-tight">{effectSizeLabel}</span>
          <MedicalTooltip
            term={effectSizeLabel?.toLowerCase().includes('risk difference') ? 'Risk Difference' : 'Effect Size'}
            definition={getEffectSizeTooltip()}
          />
        </div>
        <div className={`text-xl sm:text-2xl font-bold break-words`}>
          <span className={
            effectSize.toLowerCase().includes('no benefit') ||
            effectSize.toLowerCase().includes('harm') ||
            effectSize.toLowerCase().includes('possible harm')
              ? 'text-red-600 dark:text-red-400'
              : 'text-blue-600 dark:text-blue-400'
          }>{effectSize}</span>
        </div>
      </div>
    </div>
  );
};
