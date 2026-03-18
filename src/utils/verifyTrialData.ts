/**
 * Trial Data Verification Script
 * 
 * Verifies that all trial data is trial-specific, accurate, and not duplicated.
 * Run this script to check for template data, duplicate values, and calculation errors.
 */

import { TRIAL_DATA } from '../data/trialData';
import type { TrialMetadata } from '../data/trialData';

interface VerificationResult {
  trialId: string;
  title: string;
  sampleSize: string;
  primaryEndpoint: string;
  pValue: string;
  effectSize: string;
  treatmentPercentage: number;
  controlPercentage: number;
  calculatedNNT: number | null;
  displayedNNT: number | null;
  timeline: string;
  pearlsCount: number;
  clinicalContextLength: number;
  source: string;
  issues: string[];
}

/**
 * Calculate NNT from efficacy percentages
 */
function calculateNNT(treatment: number, control: number): number | null {
  const arr = Math.abs(treatment - control);
  if (arr === 0) return null;
  return Math.round((100 / arr) * 10) / 10; // Round to 1 decimal
}

/**
 * Verify a single trial
 */
function verifyTrial(trialId: string, trial: TrialMetadata): VerificationResult {
  const issues: string[] = [];
  
  const treatmentPct = trial.efficacyResults.treatment.percentage;
  const controlPct = trial.efficacyResults.control.percentage;
  const calculatedNNT = calculateNNT(treatmentPct, controlPct);
  const displayedNNT = trial.calculations?.nnt || null;
  
  // Check for negative trial
  const isNegativeTrial = 
    trial.stats.pValue.label.toLowerCase().includes('not significant') ||
    trial.stats.effectSize.value.toLowerCase().includes('no benefit') ||
    trial.stats.effectSize.value.toLowerCase().includes('harm') ||
    parseFloat(trial.stats.pValue.value) >= 0.05;
  
  // Verify NNT matches calculation (for positive trials)
  if (!isNegativeTrial && calculatedNNT && displayedNNT) {
    const difference = Math.abs(calculatedNNT - displayedNNT);
    if (difference > 0.5) {
      issues.push(`⚠️  NNT MISMATCH: Calculated ${calculatedNNT}, Displayed ${displayedNNT}`);
    }
  }
  
  // Check for missing NNT in positive trials
  if (!isNegativeTrial && !displayedNNT) {
    issues.push(`⚠️  Missing NNT calculation for positive trial`);
  }
  
  // Check for template text
  const templatePatterns = [
    /XXX/i,
    /TBD/i,
    /TODO/i,
    /placeholder/i,
    /example/i,
    /template/i
  ];
  
  const allText = JSON.stringify(trial).toLowerCase();
  templatePatterns.forEach(pattern => {
    if (pattern.test(allText)) {
      issues.push(`⚠️  Contains template text: ${pattern.source}`);
    }
  });
  
  // Check for suspiciously round numbers
  if (trial.stats.sampleSize.value && /^\d+00$/.test(trial.stats.sampleSize.value)) {
    issues.push(`⚠️  Suspiciously round sample size: ${trial.stats.sampleSize.value}`);
  }
  
  return {
    trialId,
    title: trial.title,
    sampleSize: trial.stats.sampleSize.value,
    primaryEndpoint: trial.stats.primaryEndpoint.value,
    pValue: `${trial.stats.pValue.value} (${trial.stats.pValue.label})`,
    effectSize: trial.stats.effectSize.value,
    treatmentPercentage: treatmentPct,
    controlPercentage: controlPct,
    calculatedNNT,
    displayedNNT,
    timeline: trial.trialDesign.timeline,
    pearlsCount: trial.pearls.length,
    clinicalContextLength: trial.clinicalContext.length,
    source: trial.source,
    issues
  };
}

/**
 * Find duplicate values across trials
 */
function findDuplicates(results: VerificationResult[]): Map<string, string[]> {
  const duplicates = new Map<string, string[]>();
  
  // Check sample sizes
  const sampleSizeMap = new Map<string, string[]>();
  results.forEach(r => {
    const key = r.sampleSize;
    if (!sampleSizeMap.has(key)) sampleSizeMap.set(key, []);
    sampleSizeMap.get(key)!.push(r.trialId);
  });
  sampleSizeMap.forEach((trials, size) => {
    if (trials.length > 1) {
      duplicates.set(`Sample Size: ${size}`, trials);
    }
  });
  
  // Check NNT values
  const nntMap = new Map<string, string[]>();
  results.forEach(r => {
    if (r.displayedNNT !== null) {
      const key = r.displayedNNT.toFixed(1);
      if (!nntMap.has(key)) nntMap.set(key, []);
      nntMap.get(key)!.push(r.trialId);
    }
  });
  nntMap.forEach((trials, nnt) => {
    if (trials.length > 1) {
      duplicates.set(`NNT: ${nnt}`, trials);
    }
  });
  
  // Check efficacy percentages
  const efficacyMap = new Map<string, string[]>();
  results.forEach(r => {
    const key = `${r.treatmentPercentage}-${r.controlPercentage}`;
    if (!efficacyMap.has(key)) efficacyMap.set(key, []);
    efficacyMap.get(key)!.push(r.trialId);
  });
  efficacyMap.forEach((trials, percentages) => {
    if (trials.length > 1) {
      duplicates.set(`Efficacy: ${percentages}`, trials);
    }
  });
  
  // Check timelines
  const timelineMap = new Map<string, string[]>();
  results.forEach(r => {
    const key = r.timeline;
    if (!timelineMap.has(key)) timelineMap.set(key, []);
    timelineMap.get(key)!.push(r.trialId);
  });
  timelineMap.forEach((trials, timeline) => {
    if (trials.length > 1) {
      duplicates.set(`Timeline: ${timeline}`, trials);
    }
  });
  
  return duplicates;
}

/**
 * Generate verification report
 */
export function generateVerificationReport(): string {
  const results: VerificationResult[] = [];
  const allTrials = Object.entries(TRIAL_DATA);
  
  console.group('🔍 TRIAL DATA VERIFICATION REPORT');
  console.log(`\n📊 Checking ${allTrials.length} trials...\n`);
  
  // Verify each trial
  allTrials.forEach(([trialId, trial]) => {
    const result = verifyTrial(trialId, trial);
    results.push(result);
  });
  
  // Find duplicates
  const duplicates = findDuplicates(results);
  
  // Generate report
  let report = '\n═══════════════════════════════════════════════════════════\n';
  report += '           TRIAL DATA VERIFICATION REPORT\n';
  report += '═══════════════════════════════════════════════════════════\n\n';
  
  // Group by category
  const thrombolysisTrials = results.filter(r => 
    ['ninds-trial', 'ecass3-trial', 'extend-trial', 'eagle-trial', 'wake-up-trial'].includes(r.trialId)
  );
  
  const thrombectomyTrials = results.filter(r => 
    ['distal-trial', 'escape-mevo-trial', 'defuse-3-trial', 'dawn-trial', 'select2-trial', 'angel-aspect-trial'].includes(r.trialId)
  );
  
  report += '📋 THROMBOLYSIS TRIALS:\n';
  report += '───────────────────────────────────────────────────────────\n';
  thrombolysisTrials.forEach(r => {
    report += `\n${r.trialId}:\n`;
    report += `  Title: ${r.title}\n`;
    report += `  Sample Size: ${r.sampleSize}\n`;
    report += `  Primary Endpoint: ${r.primaryEndpoint}\n`;
    report += `  p-Value: ${r.pValue}\n`;
    report += `  Effect Size: ${r.effectSize}\n`;
    report += `  Treatment %: ${r.treatmentPercentage}%\n`;
    report += `  Control %: ${r.controlPercentage}%\n`;
    if (r.calculatedNNT) {
      report += `  Calculated NNT: ${r.calculatedNNT}\n`;
    }
    if (r.displayedNNT) {
      report += `  Displayed NNT: ${r.displayedNNT} ${r.calculatedNNT && Math.abs(r.calculatedNNT - r.displayedNNT) > 0.5 ? '⚠️ MISMATCH' : '✓'}\n`;
    } else {
      report += `  Displayed NNT: N/A (negative trial)\n`;
    }
    report += `  Timeline: ${r.timeline}\n`;
    report += `  Pearls: ${r.pearlsCount} items\n`;
    report += `  Clinical Context: ${r.clinicalContextLength} chars\n`;
    report += `  Source: ${r.source}\n`;
    if (r.issues.length > 0) {
      report += `  ⚠️  ISSUES:\n`;
      r.issues.forEach(issue => report += `    ${issue}\n`);
    }
  });
  
  report += '\n\n📋 THROMBECTOMY TRIALS:\n';
  report += '───────────────────────────────────────────────────────────\n';
  thrombectomyTrials.forEach(r => {
    report += `\n${r.trialId}:\n`;
    report += `  Title: ${r.title}\n`;
    report += `  Sample Size: ${r.sampleSize}\n`;
    report += `  Primary Endpoint: ${r.primaryEndpoint}\n`;
    report += `  p-Value: ${r.pValue}\n`;
    report += `  Effect Size: ${r.effectSize}\n`;
    report += `  Treatment %: ${r.treatmentPercentage}%\n`;
    report += `  Control %: ${r.controlPercentage}%\n`;
    if (r.calculatedNNT) {
      report += `  Calculated NNT: ${r.calculatedNNT}\n`;
    }
    if (r.displayedNNT) {
      report += `  Displayed NNT: ${r.displayedNNT} ${r.calculatedNNT && Math.abs(r.calculatedNNT - r.displayedNNT) > 0.5 ? '⚠️ MISMATCH' : '✓'}\n`;
    } else {
      report += `  Displayed NNT: N/A (negative trial)\n`;
    }
    report += `  Timeline: ${r.timeline}\n`;
    report += `  Pearls: ${r.pearlsCount} items\n`;
    report += `  Clinical Context: ${r.clinicalContextLength} chars\n`;
    report += `  Source: ${r.source}\n`;
    if (r.issues.length > 0) {
      report += `  ⚠️  ISSUES:\n`;
      r.issues.forEach(issue => report += `    ${issue}\n`);
    }
  });
  
  // Duplicate check section
  if (duplicates.size > 0) {
    report += '\n\n⚠️  DUPLICATE/SUSPICIOUS VALUES:\n';
    report += '───────────────────────────────────────────────────────────\n';
    duplicates.forEach((trials, value) => {
      report += `\n${value}:\n`;
      report += `  Found in: ${trials.join(', ')}\n`;
    });
  } else {
    report += '\n\n✅ NO DUPLICATE VALUES DETECTED\n';
  }
  
  // Summary
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  report += '\n\n═══════════════════════════════════════════════════════════\n';
  report += `SUMMARY:\n`;
  report += `  Total Trials: ${results.length}\n`;
  report += `  Total Issues: ${totalIssues}\n`;
  report += `  Duplicate Values: ${duplicates.size}\n`;
  report += `═══════════════════════════════════════════════════════════\n`;
  
  return report;
}

/**
 * Run verification and log results
 */
export function runVerification(): void {
  const report = generateVerificationReport();
  console.log(report);
  
  // Also log to console in structured format
  const results: VerificationResult[] = [];
  Object.entries(TRIAL_DATA).forEach(([trialId, trial]) => {
    results.push(verifyTrial(trialId, trial));
  });
  
  const duplicates = findDuplicates(results);
  
  console.group('📊 Quick Summary');
  console.log(`Total trials: ${results.length}`);
  console.log(`Trials with issues: ${results.filter(r => r.issues.length > 0).length}`);
  console.log(`Duplicate values found: ${duplicates.size}`);
  if (duplicates.size > 0) {
    console.group('⚠️  Duplicates');
    duplicates.forEach((trials, value) => {
      console.log(`${value}:`, trials);
    });
    console.groupEnd();
  }
  console.groupEnd();
}
