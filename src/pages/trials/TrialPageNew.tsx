import React, { useMemo, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { GUIDE_CONTENT } from '../../data/guideContent';
import { TRIAL_DATA } from '../../data/trialData';
import { TrialStats } from '../../components/TrialStats';
import { MedicalTooltip } from '../../components/MedicalTooltip';
import { MEDICAL_GLOSSARY } from '../../data/medicalGlossary';
import { addTooltips } from '../../utils/addTooltips';
import ReactMarkdown from 'react-markdown';

const TrialPageNew: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const location = useLocation();

  // Extract trial ID from URL pathname (handles both /trials/wake-up and /trials/wake-up-trial)
  const pathname = location.pathname;
  const pathTrialId = pathname.replace('/trials/', '');

  // Determine trial ID: prefer topicId param, fallback to pathname extraction
  // Handle both 'wake-up' and 'wake-up-trial' IDs
  let trialId = '';
  if (topicId) {
    // If topicId param exists (from /trials/:topicId route)
    trialId = topicId === 'wake-up' ? 'wake-up-trial' : topicId;
  } else {
    // If no topicId param (from specific route like /trials/wake-up-trial)
    trialId = pathTrialId === 'wake-up' ? 'wake-up-trial' : pathTrialId;
  }

  const trial = GUIDE_CONTENT[trialId];
  const trialMetadata = TRIAL_DATA[trialId];

  if (!trial && import.meta.env.DEV) {
    console.error('TrialPageNew - TRIAL NOT FOUND:', { pathname, topicId, pathTrialId, trialId });
  }

  if (!trial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Trial Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Could not find trial with ID: {trialId}
          </p>
          <Link
            to="/trials"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trials
          </Link>
        </div>
      </div>
    );
  }

  // Use structured metadata if available, otherwise fallback to extracted stats
  const stats = useMemo(() => {
    if (trialMetadata) {
      // Check if this is an estimation trial (not superiority)
      const isEstimationTrial = trialMetadata.specialDesign === 'estimation-trial' ||
        trialMetadata.stats.pValue.label.toLowerCase().includes('estimation');

      // Check if this is a negative trial (no benefit or harm)
      const isNegativeTrial =
        trialMetadata.trialResult === 'NEGATIVE' ||
        (!isEstimationTrial && (
          trialMetadata.stats.pValue.label.toLowerCase().includes('not significant') ||
          trialMetadata.stats.pValue.label.toLowerCase().includes('worse') ||
          trialMetadata.stats.effectSize.value.toLowerCase().includes('no benefit') ||
          trialMetadata.stats.effectSize.value.toLowerCase().includes('harm') ||
          (trialMetadata.stats.pValue.value !== 'N/A' &&
           !trialMetadata.stats.pValue.value.includes('<') &&
           !trialMetadata.stats.pValue.value.includes('>') &&
           parseFloat(trialMetadata.stats.pValue.value) >= 0.05)
        ));

      // Calculate NNT: 1 / (treatmentRate - controlRate) as decimal
      // Or use stored calculation if available
      // Estimation trials don't use traditional NNT
      let nnt: string | number = 'N/A';
      let nntExplanation: string | undefined;

      if (!isNegativeTrial && !isEstimationTrial && trialMetadata.efficacyResults) {
        const arr = (trialMetadata.efficacyResults.treatment.percentage - trialMetadata.efficacyResults.control.percentage) / 100;
        if (arr > 0) {
          // Use stored calculation if available, otherwise calculate
          if (trialMetadata.calculations?.nnt) {
            nnt = trialMetadata.calculations.nnt;
            nntExplanation = trialMetadata.calculations.nntExplanation;
          } else {
            nnt = Math.round((1 / arr) * 10) / 10; // Round to 1 decimal place
          }
        }
      }

      return {
        sampleSize: trialMetadata.stats.sampleSize.value,
        sampleSizeLabel: trialMetadata.stats.sampleSize.label,
        primaryEndpoint: trialMetadata.stats.primaryEndpoint.value,
        primaryEndpointLabel: trialMetadata.stats.primaryEndpoint.label,
        pValue: trialMetadata.stats.pValue.value,
        pValueLabel: trialMetadata.stats.pValue.label,
        effectSize: trialMetadata.stats.effectSize.value,
        effectSizeLabel: trialMetadata.stats.effectSize.label,
        nnt: typeof nnt === 'number' ? nnt.toFixed(1) : nnt,
        nntExplanation,
        treatmentRate: trialMetadata.efficacyResults.treatment.percentage,
        controlRate: trialMetadata.efficacyResults.control.percentage,
        treatmentLabel: trialMetadata.efficacyResults.treatment.label,
        treatmentName: trialMetadata.efficacyResults.treatment.name,
        controlName: trialMetadata.efficacyResults.control.name,
        isNegativeTrial, // Flag for special handling
        isEstimationTrial, // Flag for estimation trial design
        keyMessage: trialMetadata.keyMessage, // Key clinical takeaway
        additionalResults: trialMetadata.additionalResults, // Additional outcome data
        proceduralDetails: trialMetadata.proceduralDetails, // Procedural/technical details
        safetyProfile: trialMetadata.safetyProfile, // Safety outcomes
      };
    }
    // Fallback for WAKE-UP if metadata not found
    if (trialId === 'wake-up-trial') {
      return {
        sampleSize: '503',
        sampleSizeLabel: 'Randomized Patients',
        primaryEndpoint: 'mRS 0-1',
        primaryEndpointLabel: 'at 90 Days',
        pValue: '0.02',
        pValueLabel: 'Statistically Sig.',
        effectSize: '11.5%',
        effectSizeLabel: 'Absolute Increase',
        nnt: '8.7',
        nntExplanation: 'For every 8.7 patients with wake-up stroke and DWI-FLAIR mismatch treated with tPA, one additional patient achieves excellent outcome (mRS 0-1) compared to placebo',
        treatmentRate: 53.3,
        controlRate: 41.8,
        treatmentLabel: 'Excellent outcome (mRS 0-1) at 3 months',
        treatmentName: 'Alteplase Group',
        controlName: 'Placebo Group',
        isNegativeTrial: false,
      };
    }
    return null;
  }, [trialId, trialMetadata]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/trials"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-neuro-600 dark:hover:text-neuro-400 mb-4 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Neuro Trials</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {trialMetadata?.title || trial.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            {trialMetadata?.subtitle || trial.category}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards with Tooltips */}
            {stats && (
              <TrialStats
                sampleSize={stats.sampleSize}
                sampleSizeLabel={stats.sampleSizeLabel}
                primaryEndpoint={stats.primaryEndpoint}
                primaryEndpointLabel={stats.primaryEndpointLabel}
                pValue={stats.pValue}
                pValueLabel={stats.pValueLabel}
                effectSize={stats.effectSize}
                effectSizeLabel={stats.effectSizeLabel}
              />
            )}

            {/* Efficacy Results with Progress Bars */}
            {stats && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex flex-wrap items-center gap-2">
                  <span className="break-words">Primary Outcome: {stats.primaryEndpoint}</span>
                  {stats.primaryEndpointLabel && (
                    <span className="text-base font-normal text-slate-600 dark:text-slate-400 break-words">
                      {stats.primaryEndpointLabel}
                    </span>
                  )}
                  <MedicalTooltip
                    term="Primary Endpoint"
                    definition={MEDICAL_GLOSSARY['primary-endpoint'] || 'The main outcome measure used to determine if the treatment works.'}
                  />
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {stats.treatmentName || 'Alteplase'}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {stats.treatmentRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all"
                        style={{ width: `${stats.treatmentRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {stats.treatmentLabel}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {stats.controlName || 'Placebo'}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {stats.controlRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                      <div
                        className="bg-slate-400 dark:bg-slate-600 h-4 rounded-full transition-all"
                        style={{ width: `${stats.controlRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {stats.treatmentLabel}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    {stats.isEstimationTrial ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">📊 ESTIMATION TRIAL</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 break-words">
                            This trial establishes a <strong>safe range</strong> for clinical practice, not superiority.
                          </p>
                          <div className="text-sm text-slate-700 dark:text-slate-300 break-words">
                            <strong>Risk Difference:</strong> {stats.effectSize}
                            <MedicalTooltip
                              term="Risk Difference"
                              definition="The difference in event rates between treatment and control groups. Negative values favor treatment. The confidence interval shows the range of plausible values. For estimation trials, this establishes the safe range for practice."
                            />
                          </div>
                          {stats.keyMessage && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                              <p className="text-sm font-semibold text-green-800 dark:text-green-300 break-words">
                                ✓ {stats.keyMessage}
                              </p>
                            </div>
                          )}
                        </div>
                        {stats.additionalResults && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded space-y-2">
                            {stats.additionalResults.recurrentStroke && (
                              <div className="text-sm break-words">
                                <strong className="text-slate-700 dark:text-slate-300">Recurrent Ischemic Stroke:</strong>{' '}
                                <span className="text-slate-600 dark:text-slate-400">
                                  {stats.additionalResults.recurrentStroke.early}% (Early) vs {stats.additionalResults.recurrentStroke.later}% (Later)
                                </span>
                              </div>
                            )}
                            {stats.additionalResults.symptomaticICH && (
                              <div className="text-sm break-words">
                                <strong className="text-slate-700 dark:text-slate-300">Symptomatic ICH:</strong>{' '}
                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                  {stats.additionalResults.symptomaticICH.early}% (Early) vs {stats.additionalResults.symptomaticICH.later}% (Later) - EQUAL
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : stats.isNegativeTrial ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600 dark:text-red-400 font-bold text-sm">⚠️ NEGATIVE TRIAL</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          This trial did not demonstrate a benefit for the intervention. {stats.effectSizeLabel && stats.effectSizeLabel !== 'Absolute Increase' && `(${stats.effectSizeLabel})`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center">
                        <strong>NNT:</strong> {stats.nnt}
                        <MedicalTooltip
                          term="NNT"
                          definition={
                            stats.nntExplanation ||
                            `Number Needed to Treat: ${stats.nnt === 'N/A' ? 'Not applicable for this trial' : `For every ${stats.nnt} patients treated, one additional patient achieves the primary outcome compared to control`}`
                          }
                        />
                      </span>
                        <span className="text-slate-600 dark:text-slate-400 flex items-center">
                          <strong>Absolute Benefit:</strong> {stats.effectSize}
                          <MedicalTooltip
                            term="Effect Size"
                            definition={MEDICAL_GLOSSARY['effect-size'] || 'Raw percentage difference between treatment and control groups. Shows how many extra patients out of 100 benefit from treatment.'}
                          />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Clinical Context Section */}
            {trialMetadata?.clinicalContext && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Clinical Context</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {trialMetadata.clinicalContext}
                </p>
              </div>
            )}

            {/* Procedural Details Section (for negative trials) */}
            {trialMetadata?.proceduralDetails && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">🔍 Procedural Details</h3>
                <div className="space-y-4">
                  {trialMetadata.proceduralDetails.reperfusionRate && (
                    <div className="bg-white dark:bg-slate-800 rounded p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {trialMetadata.proceduralDetails.reperfusionRate.label}
                        </span>
                        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {trialMetadata.proceduralDetails.reperfusionRate.value}
                        </span>
                      </div>
                      {trialMetadata.proceduralDetails.reperfusionRate.tooltip && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {addTooltips(trialMetadata.proceduralDetails.reperfusionRate.tooltip)}
                        </p>
                      )}
                    </div>
                  )}
                  {trialMetadata.proceduralDetails.imagingToPuncture && (
                    <div className="bg-white dark:bg-slate-800 rounded p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {trialMetadata.proceduralDetails.imagingToPuncture.label}
                        </span>
                        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {trialMetadata.proceduralDetails.imagingToPuncture.value}
                        </span>
                      </div>
                      {trialMetadata.proceduralDetails.imagingToPuncture.tooltip && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {addTooltips(trialMetadata.proceduralDetails.imagingToPuncture.tooltip)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Safety Profile Section (for negative trials) */}
            {trialMetadata?.safetyProfile && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">⚠️ Safety Profile</h3>
                <div className="space-y-4">
                  {trialMetadata.safetyProfile.mortality && (
                    <div className="bg-white dark:bg-slate-800 rounded p-4">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {trialMetadata.safetyProfile.mortality.label}
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">EVT:</span>
                          <span className="ml-2 text-lg font-bold text-slate-900 dark:text-white">
                            {trialMetadata.safetyProfile.mortality.evt}%
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Control:</span>
                          <span className="ml-2 text-lg font-bold text-slate-900 dark:text-white">
                            {trialMetadata.safetyProfile.mortality.control}%
                          </span>
                        </div>
                      </div>
                      {trialMetadata.safetyProfile.mortality.tooltip && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {addTooltips(trialMetadata.safetyProfile.mortality.tooltip)}
                        </p>
                      )}
                    </div>
                  )}
                  {trialMetadata.safetyProfile.sICH && (
                    <div className="bg-white dark:bg-slate-800 rounded p-4">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {trialMetadata.safetyProfile.sICH.label}
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">EVT:</span>
                          <span className="ml-2 text-lg font-bold text-red-600 dark:text-red-400">
                            {trialMetadata.safetyProfile.sICH.evt}%
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Control:</span>
                          <span className="ml-2 text-lg font-bold text-slate-900 dark:text-white">
                            {trialMetadata.safetyProfile.sICH.control}%
                          </span>
                        </div>
                      </div>
                      {trialMetadata.safetyProfile.sICH.tooltip && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                          {addTooltips(trialMetadata.safetyProfile.sICH.tooltip)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comparison Section (for DISTAL specifically) */}
            {trialId === 'distal-trial' && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📊 Large Vessel vs. Distal Vessel EVT</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-4 border border-green-200 dark:border-green-800">
                    <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">✅ LARGE VESSEL EVT (M1/ICA)</h4>
                    <ul className="text-sm text-green-700 dark:text-green-200 space-y-1">
                      <li>• Reperfusion: 85-90%</li>
                      <li>• NNT: 2-7 (dramatic benefit)</li>
                      <li>• p &lt; 0.001</li>
                      <li>• Good collaterals compensate during delays</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded p-4 border border-red-200 dark:border-red-800">
                    <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">❌ DISTAL VESSEL EVT (M2/M3/ACA/PCA)</h4>
                    <ul className="text-sm text-red-700 dark:text-red-200 space-y-1">
                      <li>• Reperfusion: only 72%</li>
                      <li>• NNT: Cannot calculate (no benefit)</li>
                      <li>• p = 0.50 (not significant)</li>
                      <li>• Poor collaterals, "end arteries"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Why Did It Fail Section (for DISTAL specifically) */}
            {trialId === 'distal-trial' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">🔍 Why Did DISTAL Fail When Other EVT Trials Succeeded?</h3>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 rounded p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">1. Lower Reperfusion Rates (71.7% vs 85-90%)</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Distal vessels are smaller and harder to navigate. Catheters/stents designed for large vessels may not work as well for medium/distal occlusions.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">2. Treatment Delays (70-min imaging-to-puncture)</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Distal vessels have poor collateral flow. Less tolerance for delays than large vessels, which can compensate better during treatment delays.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">3. "End Artery" Problem</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Distal vessels often have no backup blood supply. By the time treatment starts, tissue may already be dead, making reperfusion ineffective.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">4. Patient Selection</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Median NIHSS = 6 (relatively mild). May have self-selected milder cases that do well anyway, masking any potential benefit from EVT.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Clinical Pearls Section */}
            {trialMetadata?.pearls && trialMetadata.pearls.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Clinical Pearls</h3>
                <ul className="space-y-3">
                  {trialMetadata.pearls.map((pearl, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {addTooltips(pearl)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conclusion Section */}
            {trialMetadata?.conclusion && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Conclusion</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {addTooltips(trialMetadata.conclusion)}
                </p>
              </div>
            )}

            {/* Trial Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700 dark:text-slate-300" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                }}
              >
                {trial.content}
              </ReactMarkdown>
            </div>

            {/* Source Citation */}
            {trialMetadata?.source && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  <strong>Source:</strong> {trialMetadata.source}
                </p>
              </div>
            )}
          </div>

          {/* Dark Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-white mb-4">Trial Design</h3>
              <div className="space-y-4 text-sm">
                {trialMetadata?.trialDesign ? (
                  <>
                    <div>
                      <div className="text-slate-400 mb-2">Type</div>
                      <ul className="space-y-1">
                        {trialMetadata.trialDesign.type.map((type, idx) => (
                          <li key={idx} className="text-white font-medium flex items-start">
                            <span className="text-slate-500 mr-2 flex-shrink-0">•</span>
                            <span className="break-words break-all">{type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Timeline</div>
                      <div className="text-white font-medium">{trialMetadata.trialDesign.timeline}</div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="text-slate-400 mb-1">Type</div>
                    <div className="text-white font-medium">Randomized, Double-Blind, Placebo-Controlled</div>
                  </div>
                )}
                {stats && (
                  <>
                    <div>
                      <div className="text-slate-400 mb-1 flex items-center gap-1">
                        Sample Size
                        <MedicalTooltip
                          term="Sample Size"
                          definition={MEDICAL_GLOSSARY['sample-size'] || 'Total number of patients enrolled and randomized in the study.'}
                        />
                      </div>
                      <div className="text-white font-medium">{stats.sampleSize} patients</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1 flex items-center gap-1">
                        Primary Endpoint
                        <MedicalTooltip
                          term="Primary Endpoint"
                          definition={MEDICAL_GLOSSARY['primary-endpoint'] || 'The main outcome measure used to determine if the treatment works.'}
                        />
                      </div>
                      <div className="text-white font-medium">{stats.primaryEndpoint}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1 flex items-center gap-1">
                        P-Value
                        <MedicalTooltip
                          term="p-Value"
                          definition={MEDICAL_GLOSSARY['p-value'] || 'Probability the result occurred by chance. p < 0.05 means less than 5% chance it\'s due to luck.'}
                        />
                      </div>
                      <div className="text-green-400 font-bold">{stats.pValue}</div>
                    </div>
                    {!stats.isEstimationTrial && (
                      <div>
                        <div className="text-slate-400 mb-1 flex items-center gap-1">
                          NNT
                          <MedicalTooltip
                            term="NNT"
                            definition={
                              stats.nntExplanation ||
                              `Number Needed to Treat: ${stats.nnt === 'N/A' ? 'Not applicable for this trial' : `For every ${stats.nnt} patients treated, one additional patient achieves the primary outcome compared to control`}`
                            }
                          />
                        </div>
                        <div className="text-white font-medium">{stats.nnt}</div>
                      </div>
                    )}
                    {stats.isEstimationTrial && (
                      <div>
                        <div className="text-slate-400 mb-1 flex items-center gap-1">
                          Risk Difference
                          <MedicalTooltip
                            term="Risk Difference"
                            definition="The difference in event rates between treatment and control groups. Negative values favor treatment. The confidence interval shows the range of plausible values."
                          />
                        </div>
                        <div className="text-white font-medium">{stats.effectSize}</div>
                        <div className="text-slate-500 text-xs mt-1">{stats.effectSizeLabel}</div>
                      </div>
                    )}
                  </>
                )}
                {trialMetadata?.intervention && (
                  <>
                    <div className="pt-4 border-t border-slate-700">
                      <div className="text-slate-400 mb-2">Intervention</div>
                      <div className="space-y-3">
                        {/* Treatment Arm */}
                        {trialMetadata.intervention.treatment && (
                          <div>
                            <div className="text-slate-500 text-xs mb-1">Treatment</div>
                            <div className="text-white text-xs">
                              {typeof trialMetadata.intervention.treatment === 'string'
                                ? trialMetadata.intervention.treatment
                                : (
                                  <div className="space-y-1">
                                    {trialMetadata.intervention.treatment.name && (
                                      <div className="font-semibold">{trialMetadata.intervention.treatment.name}</div>
                                    )}
                                    {trialMetadata.intervention.treatment.description && (
                                      <div className="text-slate-300">{trialMetadata.intervention.treatment.description}</div>
                                    )}
                                    {trialMetadata.intervention.treatment.details && Array.isArray(trialMetadata.intervention.treatment.details) && (
                                      <ul className="list-disc list-inside ml-2 space-y-0.5 text-slate-300">
                                        {trialMetadata.intervention.treatment.details.map((detail: string, idx: number) => (
                                          <li key={idx} className="text-xs">{detail}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                        {/* Control Arm */}
                        {trialMetadata.intervention.control && (
                          <div>
                            <div className="text-slate-500 text-xs mb-1">Control</div>
                            <div className="text-white text-xs">
                              {typeof trialMetadata.intervention.control === 'string'
                                ? trialMetadata.intervention.control
                                : (
                                  <div className="space-y-1">
                                    {trialMetadata.intervention.control.name && (
                                      <div className="font-semibold">{trialMetadata.intervention.control.name}</div>
                                    )}
                                    {trialMetadata.intervention.control.description && (
                                      <div className="text-slate-300">{trialMetadata.intervention.control.description}</div>
                                    )}
                                    {trialMetadata.intervention.control.details && Array.isArray(trialMetadata.intervention.control.details) && (
                                      <ul className="list-disc list-inside ml-2 space-y-0.5 text-slate-300">
                                        {trialMetadata.intervention.control.details.map((detail: string, idx: number) => (
                                          <li key={idx} className="text-xs">{detail}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {trialMetadata?.clinicalTrialsId && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="text-slate-400 mb-1">ClinicalTrials.gov</div>
                    <a
                      href={`https://clinicaltrials.gov/study/${trialMetadata.clinicalTrialsId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                    >
                      {trialMetadata.clinicalTrialsId}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialPageNew;
