import type { TrialMetadata } from '../data/trialData';

export function buildHouseConclusion(trialMetadata: TrialMetadata): string {
  const title = trialMetadata.title.replace(/\s+Trial$/i, '');
  const treatmentName = trialMetadata.efficacyResults.treatment.name;
  const controlName = trialMetadata.efficacyResults.control.name;
  const treatmentRate = trialMetadata.efficacyResults.treatment.percentage;
  const controlRate = trialMetadata.efficacyResults.control.percentage;
  const primaryEndpoint = `${trialMetadata.stats.primaryEndpoint.value} ${trialMetadata.stats.primaryEndpoint.label}`.trim();
  const delta = Math.abs(treatmentRate - controlRate).toFixed(1).replace(/\.0$/, '');
  const pValueLabel = trialMetadata.stats.pValue.label.toLowerCase();
  const effectSizeValue = trialMetadata.stats.effectSize.value.toLowerCase();
  const isEstimationTrial =
    trialMetadata.specialDesign === 'estimation-trial' ||
    pValueLabel.includes('estimation');
  const isNegativeTrial =
    trialMetadata.trialResult === 'NEGATIVE' ||
    pValueLabel.includes('not significant') ||
    effectSizeValue.includes('no benefit') ||
    effectSizeValue.includes('harm');

  if (isEstimationTrial) {
    return `${title} was designed to estimate whether ${treatmentName} performs similarly to ${controlName}, not to prove outright superiority. The observed ${primaryEndpoint} rates were ${treatmentRate}% versus ${controlRate}%, so the practical takeaway is similarity within the study's design assumptions.`;
  }

  if (isNegativeTrial) {
    return `${title} did not establish a clear advantage for ${treatmentName} over ${controlName} on ${primaryEndpoint}. The observed rates were ${treatmentRate}% versus ${controlRate}%, so the safest read is that the intervention should not replace standard care on the basis of this trial alone.`;
  }

  if (treatmentRate >= controlRate) {
    return `${title} favored ${treatmentName} over ${controlName} for ${primaryEndpoint}, with event rates of ${treatmentRate}% versus ${controlRate}% (${delta}-point absolute difference). In practice, this supports using the intervention for patients who resemble the trial population and workflow.`;
  }

  return `${title} numerically favored ${controlName} over ${treatmentName} for ${primaryEndpoint} (${controlRate}% vs ${treatmentRate}%). Even if the design was nuanced, the clinical takeaway is caution against adopting the intervention as a new default.`;
}
