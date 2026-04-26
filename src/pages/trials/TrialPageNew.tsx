import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { loadTrialPayload, normalizeTrialSlug, type TrialPayload } from '../../data/trialPayload';
import type { TrialMetadata } from '../../data/trialData';
import { TrialStats } from '../../components/TrialStats';
import { MedicalTooltip } from '../../components/MedicalTooltip';
import { MEDICAL_GLOSSARY } from '../../data/medicalGlossary';
import { addTooltips } from '../../utils/addTooltips';
import { buildHouseConclusion } from '../../utils/trialNarrative';
import { categoryNames, categoryStyles, findTrialById } from '../../data/trialListData';
import { TrialVisualizationSection } from '../../components/trials/TrialVisualizations';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DeltaBandChart } from '../../components/trials/archetypes/DeltaBandChart';
import { GrottaBarChart } from '../../components/trials/archetypes/GrottaBarChart';
import { BenchmarkThresholdChart } from '../../components/trials/archetypes/BenchmarkThresholdChart';
import { SubgroupWell } from '../../components/trials/SubgroupWell';
import { TeachingWell } from '../../components/trials/TeachingWell';
import { BottomLineDrawer } from '../../components/trials/BottomLineDrawer';
import { HistoricalContextSection } from '../../components/trials/HistoricalContextSection';

function sanitizeLegacyTrialContent(
  content: string,
  options?: {
    removeClinicalContext?: boolean;
    removeTrialSummary?: boolean;
    removePearls?: boolean;
    removeSource?: boolean;
  }
): string {
  if (!content) return content;

  let sanitized = content.replace(/\n## Conclusion[\s\S]*?(?=\n\*Source:|\n$|$)/g, '');

  if (options?.removeClinicalContext) {
    sanitized = sanitized.replace(/\n## Clinical Context[\s\S]*?(?=\n## |\n\*Source:|\n$|$)/g, '');
  }

  if (options?.removeTrialSummary) {
    sanitized = sanitized.replace(/\n## Trial Summary[\s\S]*?(?=\n## |\n\*Source:|\n$|$)/g, '');
  }

  if (options?.removePearls) {
    sanitized = sanitized.replace(/\n## Clinical PEARLS[\s\S]*?(?=\n## |\n\*Source:|\n$|$)/g, '');
  }

  if (options?.removeSource) {
    sanitized = sanitized.replace(/\n\*Source:[\s\S]*$/g, '');
  }

  return sanitized.replace(/\n{3,}/g, '\n\n').trim();
}

function formatTrialArm(arm: TrialMetadata['intervention']['treatment']): string {
  if (typeof arm === 'string') return arm;
  const details = arm.details?.length ? ` (${arm.details.join('; ')})` : '';
  return `${arm.name}: ${arm.description}${details}`;
}

function buildTrialSummaryItems(trialMetadata: TrialMetadata) {
  const design = [
    ...trialMetadata.trialDesign.type,
    trialMetadata.trialDesign.timeline,
  ].filter(Boolean).join(' · ');

  const population = `${trialMetadata.stats.sampleSize.value} ${trialMetadata.stats.sampleSize.label}`;
  const intervention = `${formatTrialArm(trialMetadata.intervention.treatment)} vs ${formatTrialArm(trialMetadata.intervention.control)}`;
  const primaryOutcome = `${trialMetadata.stats.primaryEndpoint.value} ${trialMetadata.stats.primaryEndpoint.label}`.trim();
  const results = `${trialMetadata.efficacyResults.treatment.percentage}% with ${trialMetadata.efficacyResults.treatment.name} vs ${trialMetadata.efficacyResults.control.percentage}% with ${trialMetadata.efficacyResults.control.name} (${trialMetadata.stats.effectSize.label}: ${trialMetadata.stats.effectSize.value}; ${trialMetadata.stats.pValue.label}: ${trialMetadata.stats.pValue.value})`;

  return [
    { label: 'Design', value: design },
    { label: 'Population', value: population },
    { label: 'Intervention', value: intervention },
    { label: 'Primary Outcome', value: primaryOutcome },
    { label: 'Results', value: results },
  ];
}

const TrialPageNew: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const location = useLocation();

  const pathname = location.pathname;
  const pathTrialId = pathname.replace('/trials/', '');
  const requestedSlug = topicId ?? pathTrialId;
  const initialTrialId = normalizeTrialSlug(requestedSlug);
  const [payload, setPayload] = useState<TrialPayload>({
    slug: requestedSlug,
    trialId: initialTrialId,
    visualizations: [],
  });
  const [isLoadingPayload, setIsLoadingPayload] = useState(true);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoadingPayload(true);
    setPayloadError(null);

    loadTrialPayload(requestedSlug)
      .then((nextPayload) => {
        if (!cancelled) {
          setPayload(nextPayload);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setPayload({
            slug: requestedSlug,
            trialId: normalizeTrialSlug(requestedSlug),
            visualizations: [],
          });
          setPayloadError(error instanceof Error ? error.message : 'Failed to load trial payload');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingPayload(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestedSlug]);

  const trialId = payload.trialId;
  const trialMetadata = payload.metadata;
  const trial = payload.trial;
  const visualizations = payload.visualizations;
  const catalogTrial = findTrialById(trialId);
  const safeCategory = (catalogTrial?.category && categoryStyles[catalogTrial.category])
    ? catalogTrial.category
    : 'ivt';
  const sanitizedTrialContent = useMemo(
    () =>
      sanitizeLegacyTrialContent(trial?.content ?? '', {
        removeClinicalContext: !!trialMetadata?.clinicalContext,
        removeTrialSummary: !!trialMetadata,
        removePearls: !!trialMetadata?.pearls?.length,
        removeSource: !!trialMetadata?.source,
      }),
    [trial?.content, trialMetadata, trialMetadata?.clinicalContext, trialMetadata?.pearls, trialMetadata?.source]
  );
  const renderedConclusion = useMemo(
    () => (trialMetadata ? buildHouseConclusion(trialMetadata) : null),
    [trialMetadata]
  );
  const trialSummaryItems = useMemo(
    () => (trialMetadata ? buildTrialSummaryItems(trialMetadata) : []),
    [trialMetadata]
  );
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
  const isPlaceholderTrial = !isLoadingPayload && !!catalogTrial?.isPlaceholder && !trial && !trialMetadata;

  // JSON-LD structured data for EXTEND trial (MedicalScholarlyArticle — TRIALS_SPEC §16)
  useEffect(() => {
    if (trialId !== 'extend-trial' || !trialMetadata) return;
    const doi = trialMetadata.doi ?? '';
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'extend-trial-jsonld';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MedicalScholarlyArticle',
      name: 'Thrombolysis Guided by Perfusion Imaging up to 9 Hours after Onset of Stroke',
      abstract: trialMetadata.clinicalContext,
      ...(doi
        ? {
            url: `https://doi.org/${doi}`,
            identifier: { '@type': 'PropertyValue', propertyID: 'doi', value: doi },
          }
        : {}),
      datePublished: '2019',
      publisher: { '@type': 'Organization', name: 'New England Journal of Medicine' },
    });
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('extend-trial-jsonld');
      if (el) el.remove();
    };
  }, [trialId, trialMetadata]);

  if (isLoadingPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-neuro-500" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading trial summary...</p>
        </div>
      </div>
    );
  }

  if (!trial && !isPlaceholderTrial && import.meta.env.DEV) {
    console.error('TrialPageNew - TRIAL NOT FOUND:', { pathname, topicId, pathTrialId, trialId, payloadError });
  }

  if (isPlaceholderTrial && catalogTrial) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              to="/trials"
              className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-neuro-600 dark:hover:text-neuro-400 mb-4 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Neuro Trials</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {catalogTrial.name}
              {catalogTrial.year > 0 ? <span className="ml-2 text-slate-400 dark:text-slate-500">({catalogTrial.year})</span> : null}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              {categoryNames[safeCategory]}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 mb-4">
              Blank page ready
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Content coming soon</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              This trial has been added to the new catalog structure, but the detailed summary has not been written yet.
            </p>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Reference DOI</div>
              <a
                href={`https://doi.org/${catalogTrial.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {catalogTrial.doi}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── EXTEND canary: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ──────────────
  if (trialId === 'extend-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">

        {/* Section 1: Sticky header — abbreviated name + category badge */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link
              to="/trials"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors"
              aria-label="Back to Neuro Trials"
            >
              <ArrowLeft className="w-4 h-4" />
              {/* ADR-005 Decision 4: sticky header name — 13px bold slate-800, tracking 0.02em */}
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>
                EXTEND
              </span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">
              {categoryBadgeLabel}
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Section 2: Cobalt H1 — ADR-005 Decision 4 */}
          <div>
            <h1
              className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]"
              style={{ color: '#1746A2' }}
            >
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            {/* TRIALS_SPEC §1.3 question lede — 14/15px, slate-600, no section label */}
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke presenting 4.5 to 9 hours after onset, or on awakening from sleep, does IV alteplase improve outcomes when imaging shows salvageable brain tissue?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}
              {trialMetadata.doi && (
                <>
                  {' '}·{' '}
                  <a
                    href={`https://doi.org/${trialMetadata.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    doi:{trialMetadata.doi}
                  </a>
                </>
              )}
              {' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>

          {/* Section 3: Population snapshot — inclusion + exclusion criteria */}
          {(trialMetadata.inclusionCriteria?.length || trialMetadata.exclusionCriteria?.length) && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Population
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-700">
                {trialMetadata.inclusionCriteria && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Included</p>
                    <ul className="space-y-1.5">
                      {trialMetadata.inclusionCriteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {trialMetadata.exclusionCriteria && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Excluded</p>
                    <ul className="space-y-1.5">
                      {trialMetadata.exclusionCriteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true">✕</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Primary outcome — Archetype A DeltaBandChart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Primary Outcome
              </p>
            </div>
            <div className="p-4">
              {/* ADR-005 Decision 3: winning-arm cobalt accent when trialResult === 'POSITIVE' */}
              <DeltaBandChart
                treatmentPct={trialMetadata.efficacyResults.treatment.percentage}
                controlPct={trialMetadata.efficacyResults.control.percentage}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint={`${trialMetadata.stats.primaryEndpoint.value} ${trialMetadata.stats.primaryEndpoint.label}`.trim()}
                riskRatio="1.44"
                ciLow="1.01"
                ciHigh="2.06"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {/* NNT row — reads calculations.nnt, displayed as integer with ~ prefix */}
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">
                    ~{Math.round(trialMetadata.calculations.nnt as number)}
                  </span>
                  <span className="text-xs text-slate-500">to gain one additional excellent recovery (mRS 0-1)</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: How to read this chart — TeachingWell Q&A */}
          {trialMetadata.howToReadChart && (
            <TeachingWell
              mode="qa"
              title="How to read this chart"
              items={trialMetadata.howToReadChart}
            />
          )}

          {/* Section 6: How to interpret this trial — TeachingWell Interpret */}
          {trialMetadata.howToInterpret && (
            <TeachingWell
              mode="interpret"
              title="How to interpret this trial"
              sections={trialMetadata.howToInterpret}
            />
          )}

          {/* Section 7: Safety profile */}
          {trialMetadata.safetyProfile && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Safety
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {trialMetadata.safetyProfile.sICH && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {trialMetadata.safetyProfile.sICH.label}
                    </p>
                    <div className="flex items-end gap-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">Alteplase</span>
                        <p className="text-2xl font-bold text-red-600">{trialMetadata.safetyProfile.sICH.evt}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">Placebo</span>
                        <p className="text-2xl font-bold text-slate-400">{trialMetadata.safetyProfile.sICH.control}%</p>
                      </div>
                    </div>
                    {trialMetadata.safetyProfile.sICH.tooltip && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {trialMetadata.safetyProfile.sICH.tooltip}
                      </p>
                    )}
                  </div>
                )}
                {trialMetadata.safetyProfile.mortality && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {trialMetadata.safetyProfile.mortality.label}
                    </p>
                    <div className="flex items-end gap-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">Alteplase</span>
                        <p className="text-2xl font-bold text-slate-700">{trialMetadata.safetyProfile.mortality.evt}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">Placebo</span>
                        <p className="text-2xl font-bold text-slate-400">{trialMetadata.safetyProfile.mortality.control}%</p>
                      </div>
                    </div>
                    {trialMetadata.safetyProfile.mortality.tooltip && (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {trialMetadata.safetyProfile.mortality.tooltip}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 8: Trial design */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Trial Design
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Type</p>
                <ul className="space-y-0.5">
                  {trialMetadata.trialDesign.type.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-slate-300 flex-shrink-0" aria-hidden="true">·</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-start gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Timeline</p>
                  <p className="text-sm font-medium text-slate-700">{trialMetadata.trialDesign.timeline}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">N</p>
                  <p className="text-sm font-medium text-slate-700">{trialMetadata.stats.sampleSize.value}</p>
                </div>
              </div>
              {/* Sample size detail — 113 alteplase / 112 placebo of 310 planned; stopped June 2018 */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Enrollment detail</p>
                <p className="text-sm text-slate-700">
                  113 alteplase / 112 placebo (225 of 310 planned). Stopped early in June 2018 at 73% enrollment after interim efficacy signal.
                </p>
              </div>
              {/* Subgroup signals — time-window distribution + interaction test */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Subgroup composition</p>
                <p className="text-sm text-slate-700">
                  Wake-up stroke: 65% of participants. Window 4.5 to 6 hours: 10%. Window 6 to 9 hours: 25%. No significant treatment-by-subgroup interaction was detected.
                </p>
              </div>
              {trialMetadata.doi && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">DOI</p>
                  <a
                    href={`https://doi.org/${trialMetadata.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#1746A2] hover:underline"
                  >
                    {trialMetadata.doi}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {trialMetadata.clinicalTrialsId && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">ClinicalTrials.gov</p>
                  <a
                    href={`https://clinicaltrials.gov/study/${trialMetadata.clinicalTrialsId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#1746A2] hover:underline"
                  >
                    {trialMetadata.clinicalTrialsId}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section 9: Bedside pearl */}
          {trialMetadata.bedsidePearl && (
            <div
              style={{
                background: '#EEF2FF',
                borderLeft: '3px solid #1746A2',
                borderRadius: '0 10px 10px 0',
                padding: '16px 18px',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">
                Bedside Pearl
              </p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}

          {/* Section 10: See-also links */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/guide/stroke-code"
                className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors"
              >
                Stroke Code pathway
              </Link>
              <Link
                to="/calculators/nihss"
                className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
              >
                NIHSS Calculator
              </Link>
            </div>
          </div>

        </div>{/* end content wrapper */}

        {/* Section 11: BottomLineDrawer — portal-mounted (TRIALS_SPEC §10.3) */}
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer
            trialName="EXTEND"
            body={trialMetadata.bottomLineSummary}
            bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[
              { label: 'Stroke Code pathway', href: '/guide/stroke-code' },
              { label: 'NIHSS Calculator', href: '/calculators/nihss' },
            ]}
            citation={trialMetadata.source}
            doi={trialMetadata.doi}
            trialResult={trialMetadata.trialResult}
          />
        )}

      </div>
    );
  }

  // ── Shared safety renderer helper (used across all Archetype A branches) ──
  const renderSafetySection = (tm: TrialMetadata) => {
    if (!tm.safetyProfile) return null;
    const sp = tm.safetyProfile;
    const items = [sp.sICH, sp.mortality, sp.majorBleeding, sp.hemorrhagicStroke, sp.adverseEvents, sp.severeHemorrhage]
      .filter((m): m is NonNullable<typeof m> => m != null);
    if (items.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Safety</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.map((metric, idx) => {
            const evtColor = metric.color === 'danger' ? 'text-red-600' : metric.color === 'warning' ? 'text-amber-600' : metric.color === 'success' ? 'text-emerald-600' : 'text-slate-700';
            return (
              <div key={idx} className="p-4">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{metric.label}</p>
                <div className="flex items-end gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">{tm.efficacyResults.treatment.name}</span>
                    <p className={`text-2xl font-bold ${evtColor}`}>{metric.evt}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">{tm.efficacyResults.control.name}</span>
                    <p className="text-2xl font-bold text-slate-400">{metric.control}%</p>
                  </div>
                </div>
                {metric.tooltip && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{metric.tooltip}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Shared population section (Sections 3) ────────────────────────────────
  const renderPopulationSection = (tm: TrialMetadata) => {
    if (!tm.inclusionCriteria?.length && !tm.exclusionCriteria?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Population</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-700">
          {tm.inclusionCriteria && (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">Included</p>
              <ul className="space-y-1.5">
                {tm.inclusionCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tm.exclusionCriteria && (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">Excluded</p>
              <ul className="space-y-1.5">
                {tm.exclusionCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true">✕</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Shared trial design section (Section 8) ───────────────────────────────
  const renderTrialDesign = (tm: TrialMetadata, enrollmentDetail?: string) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Trial Design</p>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Type</p>
          <ul className="space-y-0.5">
            {tm.trialDesign.type.map((t, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-slate-300 flex-shrink-0" aria-hidden="true">·</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Timeline</p>
            <p className="text-sm font-medium text-slate-700">{tm.trialDesign.timeline}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">N</p>
            <p className="text-sm font-medium text-slate-700">{tm.stats.sampleSize.value}</p>
          </div>
        </div>
        {enrollmentDetail && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Enrollment</p>
            <p className="text-sm text-slate-700">{enrollmentDetail}</p>
          </div>
        )}
        {tm.doi && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">DOI</p>
            <a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#1746A2] hover:underline">
              {tm.doi}<ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {tm.clinicalTrialsId && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">ClinicalTrials.gov</p>
            <a href={`https://clinicaltrials.gov/study/${tm.clinicalTrialsId}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#1746A2] hover:underline">
              {tm.clinicalTrialsId}<ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );

  // ── WAKE-UP: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────────
  if (trialId === 'wake-up-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>WAKE-UP</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke of unknown onset or on awakening, does IV alteplase improve outcome when DWI-FLAIR mismatch on MRI suggests the stroke is within a treatable time window?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={53.3}
                controlPct={41.8}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="1.61"
                ciLow="1.09"
                ciHigh="2.36"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to gain one additional excellent recovery (mRS 0-1)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '503 of 800 planned patients (251 alteplase / 252 placebo). Stopped early when funding lapsed. Enrolled Sep 2012 to Jun 2017.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="WAKE-UP" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── ESCAPE-MeVO: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────
  if (trialId === 'escape-mevo-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ESCAPE-MeVO</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke from medium vessel occlusion, does endovascular thrombectomy plus best medical therapy improve functional independence at 90 days compared with best medical therapy alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={trialMetadata.efficacyResults.treatment.percentage}
                controlPct={trialMetadata.efficacyResults.control.percentage}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days"
                riskRatio="0.97"
                ciLow="0.80"
                ciHigh="1.17"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '530 patients at 48 centers across 8 countries. Enrolled 2019 to 2024. Published NEJM 2024.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ESCAPE-MeVO" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── ELAN: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ────────────────────
  if (trialId === 'elan-study' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ELAN</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke and atrial fibrillation, does early DOAC initiation (within 48 hours for minor to moderate stroke) result in fewer recurrent events, hemorrhagic transformations, or deaths at 30 days compared with later initiation using the 1-3-6-12 day rule?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* ELAN is an estimation trial. No superiority test; complementary event-free rates shown. */}
              <DeltaBandChart
                treatmentPct={97.1}
                controlPct={95.9}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Event-free at 30 Days (complement of composite)"
                riskRatio="RD −1.18 pp"
                ciLow="−2.84"
                ciHigh="+0.47"
                pValue="n/a (estimation design)"
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '2,013 patients across 103 sites in 15 countries. Enrolled Nov 2017 to Sep 2022.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ELAN" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── CHANCE: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ──────────────────
  if (trialId === 'chance-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>CHANCE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with high-risk TIA or minor ischemic stroke presenting within 24 hours, does dual antiplatelet therapy with clopidogrel plus aspirin reduce recurrent stroke at 90 days compared with aspirin monotherapy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement rates: 100 - stroke recurrence. More filled = stroke-free = better. */}
              <DeltaBandChart
                treatmentPct={91.8}
                controlPct={88.3}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Stroke-free at 90 Days"
                riskRatio="0.68"
                ciLow="0.57"
                ciHigh="0.81"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to prevent one recurrent stroke at 90 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '5,170 patients at 114 centers in China. Enrolled 2009 to 2012.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="CHANCE" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── POINT: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ───────────────────
  if (trialId === 'point-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>POINT</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with high-risk TIA or minor ischemic stroke presenting within 12 hours, does dual antiplatelet therapy with clopidogrel plus aspirin reduce major ischemic events at 90 days compared with aspirin monotherapy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement rates: 100 - major ischemic event rate. More filled = event-free = better. */}
              <DeltaBandChart
                treatmentPct={95.0}
                controlPct={93.5}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Major-event-free at 90 Days"
                riskRatio="0.75"
                ciLow="0.59"
                ciHigh="0.95"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to prevent one major ischemic event at 90 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '4,881 patients at 269 sites in 10 countries. Enrolled 2010 to 2017. Stopped early for efficacy at the prespecified 90-day interim analysis.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="POINT" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── SOCRATES: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ────────────────
  if (trialId === 'socrates-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SOCRATES</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute non-cardioembolic minor ischemic stroke or high-risk TIA, does ticagrelor monotherapy reduce the composite of stroke, MI, or death at 90 days compared with aspirin monotherapy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement rates: 100 - event rate. More filled = event-free = better. */}
              <DeltaBandChart
                treatmentPct={93.3}
                controlPct={92.5}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Event-free at 90 Days"
                riskRatio="0.89"
                ciLow="0.78"
                ciHigh="1.01"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '13,199 patients at 674 centers in 33 countries. Enrolled 2014 to 2015. Published NEJM 2016.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="SOCRATES" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── SPS3: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ────────────────────
  if (trialId === 'sps3-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SPS3</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with MRI-confirmed symptomatic lacunar infarction, does long-term dual antiplatelet therapy (aspirin plus clopidogrel) reduce recurrent stroke compared with aspirin monotherapy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement of annual recurrent stroke rate. More filled = stroke-free = better. */}
              <DeltaBandChart
                treatmentPct={97.5}
                controlPct={97.3}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Stroke-free (annual rate per year)"
                riskRatio="0.92"
                ciLow="0.72"
                ciHigh="1.16"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '3,020 of 3,600 planned patients enrolled. Stopped early by DSMB for harm (increased mortality in DAPT arm). Enrolled 2003 to 2011.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="SPS3" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── SPARCL: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ──────────────────
  if (trialId === 'sparcl-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SPARCL</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with recent ischemic stroke or TIA and LDL 100 to 190 mg/dL without known coronary heart disease, does high-intensity atorvastatin (80 mg daily) reduce recurrent stroke compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement of 5-year recurrent stroke rate. More filled = stroke-free = better. */}
              <DeltaBandChart
                treatmentPct={88.8}
                controlPct={86.9}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Stroke-free at 5 Years"
                riskRatio="0.84"
                ciLow="0.71"
                ciHigh="0.99"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to prevent one stroke recurrence over 5 years</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '4,731 patients across 205 centers in 27 countries. Enrolled 2001 to 2005. Median follow-up 4.9 years.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="SPARCL" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── THALES: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ──────────────────
  if (trialId === 'thales-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>THALES</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute non-cardioembolic minor ischemic stroke or high-risk TIA presenting within 24 hours, does ticagrelor plus aspirin reduce composite stroke or death at 30 days compared with aspirin alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement: 100 - event rate. More filled = event-free = better. */}
              <DeltaBandChart
                treatmentPct={94.5}
                controlPct={93.4}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Event-free at 30 Days"
                riskRatio="0.83"
                ciLow="0.71"
                ciHigh="0.96"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to prevent one stroke or death at 30 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '11,016 patients at 414 sites in 28 countries. Enrolled 2018 to 2019. Published NEJM 2020.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="THALES" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── EAGLE CRAO: W6.4 Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────
  if (trialId === 'eagle-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>EAGLE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with central retinal artery occlusion presenting within 20 hours, does local intra-arterial fibrinolysis via ophthalmic artery microcatheter improve visual acuity compared with conservative standard treatment?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          {/* Section 4: Secondary outcome chart — EAGLE primary was negative; chart shows secondary dichotomized endpoint */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Secondary outcome: ≥15-letter improvement (dichotomized)</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Primary endpoint note:</strong> The trial primary endpoint was continuous change in logMAR BCVA at 1 month, which was not significant (P=0.69). This chart displays the secondary dichotomized endpoint (proportion with clinically meaningful visual improvement of 15 or more ETDRS letters) for visual clarity.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={trialMetadata.efficacyResults.treatment.percentage}
                controlPct={trialMetadata.efficacyResults.control.percentage}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="≥15-Letter Visual Improvement at 1 Month"
                riskRatio="0.95"
                ciLow="0.73"
                ciHigh="1.24"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '84 of 200 planned patients (42 LIF / 42 CST). Stopped early by DSMB for futility and safety. Enrolled 2002 to 2007.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="EAGLE" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── BEST-MSU: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────
  if (trialId === 'best-msu-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>BEST-MSU</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute stroke in the United States, does prehospital mobile stroke unit care — with on-board CT, vascular imaging, and thrombolysis capability — improve excellent 90-day functional outcome (mRS 0-1) in tPA-eligible patients compared with standard EMS transport?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Design note:</strong> BEST-MSU used an alternating-week controlled design, not a parallel-arm RCT. MSU and standard EMS care alternated weekly at each site. Results are compelling but should be interpreted in the context of this quasi-experimental framework.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={53.5}
                controlPct={45.5}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days (tPA-Eligible Patients)"
                riskRatio="AOR 2.14"
                ciLow="1.43"
                ciHigh="3.22"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="treatment"
              />
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to gain one additional excellent recovery (mRS 0-1)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,515 patients at 5 MSU sites in the United States. Alternating-week controlled trial. August 2014 to August 2020. Published NEJM 2021.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="BEST-MSU" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── AcT: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ───────────────────
  if (trialId === 'act-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>AcT</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In adult patients with disabling acute ischemic stroke within 4.5 hours eligible for standard thrombolysis, is IV tenecteplase 0.25 mg/kg (single bolus) non-inferior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 90-120 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={36.9}
                controlPct={34.8}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90-120 Days"
                riskRatio="RD +2.1 pp"
                ciLow="−1.4"
                ciHigh="+5.6"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,577 patients at 22 stroke centres across Canada. Pragmatic open-label registry-linked RCT. December 2019 to January 2022. Published Lancet 2022.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="AcT" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── ARAMIS: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ────────────────
  if (trialId === 'aramis-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ARAMIS</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with minor nondisabling acute ischemic stroke within 4.5 hours, is dual antiplatelet therapy (clopidogrel plus aspirin) non-inferior to IV alteplase for excellent functional outcome (mRS 0-1) at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={93.8}
                controlPct={91.4}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="RD +2.4 pp"
                ciLow="−0.2"
                ciHigh="+4.8"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '760 patients at 28 centers in China. Open-label blinded-endpoint NI RCT. October 2018 to April 2022. Published JAMA 2023.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ARAMIS" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── NOR-TEST: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────
  if (trialId === 'nor-test-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>NOR-TEST</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke within 4.5 hours eligible for standard thrombolysis, is IV tenecteplase 0.4 mg/kg superior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 3 months?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={64}
                controlPct={63}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 3 Months"
                riskRatio="OR 1.08"
                ciLow="0.84"
                ciHigh="1.38"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,100 patients at 13 Norwegian hospitals. Phase 3, open-label, blinded-endpoint superiority RCT. September 2012 to September 2016. Published Lancet Neurol 2017.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="NOR-TEST" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── NOR-TEST 2 (Part A): W6.4c Archetype A rebuild — HARM framing ───────
  if (trialId === 'nor-test-2-part-a-trial' && trialMetadata) {
    const isHarm = trialMetadata.trialResult === 'HARM';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>NOR-TEST 2</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isHarm ? '#7f1d1d' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with moderate-to-severe acute ischemic stroke (NIHSS ≥6) within 4.5 hours, is IV tenecteplase 0.4 mg/kg non-inferior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 3 months? (Stopped by DSMB for harm.)
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-800 leading-relaxed">
                  <strong>STOPPED FOR HARM:</strong> The DSMB terminated NOR-TEST 2 Part A early after tenecteplase 0.4 mg/kg showed 6× higher sICH (6% vs 1%) and 3× higher mortality (16% vs 5%) versus alteplase. This harm is specific to the 0.4 mg/kg dose and does not apply to tenecteplase 0.25 mg/kg.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={32}
                controlPct={51}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 3 Months"
                riskRatio="OR 0.45"
                ciLow="0.25"
                ciHigh="0.82"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="control"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '204 of 432 planned patients. Stopped by DSMB for safety. October 2019 to September 2021. Published Lancet Neurol 2022.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#FEF2F2', borderLeft: '3px solid #b91c1c', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2">Bedside Pearl</p>
              <p className="text-sm text-red-900 leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="NOR-TEST 2" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── PRISMS: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ────────────────
  if (trialId === 'prisms-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>PRISMS</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with minor nondisabling acute ischemic stroke treated within 3 hours, does IV alteplase 0.9 mg/kg improve excellent 90-day functional outcome (mRS 0-1) compared with aspirin monotherapy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={78.2}
                controlPct={81.5}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="RD −1.1 pp"
                ciLow="−5.6"
                ciHigh="+3.4"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="control"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '313 of 948 planned patients. Stopped early (futility). May 2014 to December 2016. Published JAMA 2018.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="PRISMS" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── PROST: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────────
  if (trialId === 'prost-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>PROST</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke within 4.5 hours, is intravenous recombinant human prourokinase (rhPro-UK) non-inferior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={65.2}
                controlPct={64.3}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="RD +0.9 pp"
                ciLow="−6.5"
                ciHigh="+8.3"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '663 patients at 35 centres in China. Open-label, alteplase-controlled phase 3 RCT. May 2018 to May 2020. Published JAMA Netw Open 2023.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="PROST" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── PROST-2: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ───────────────
  if (trialId === 'prost-2-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>PROST-2</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke within 4.5 hours who are ineligible for or refusing endovascular thrombectomy, is prourokinase non-inferior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={72.0}
                controlPct={68.7}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="RR 1.04"
                ciLow="0.99"
                ciHigh="1.10"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,552 patients at multiple Chinese centres. Phase 3 open-label NI RCT. January 2023 to March 2024. Published Lancet Neurol 2024.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="PROST-2" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── RAISE: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────────
  if (trialId === 'raise-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>RAISE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke within 4.5 hours eligible for standard thrombolysis, is IV reteplase (double-bolus 18 mg + 18 mg) superior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={79.5}
                controlPct={70.4}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="1.13"
                ciLow="1.05"
                ciHigh="1.21"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="treatment"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,412 patients at multiple centres in China. Randomized superiority trial. Published NEJM 2024.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="RAISE" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── TASTE: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────────
  if (trialId === 'taste-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TASTE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In perfusion-imaging selected patients with acute ischemic stroke within 4.5 hours not proceeding to EVT, is IV tenecteplase 0.25 mg/kg non-inferior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 3 months?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={57}
                controlPct={55}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 3 Months (ITT)"
                riskRatio="SRD +0.05"
                ciLow="−0.02"
                ciHigh="+0.12"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '680 patients at multiple centers in 8 countries. International multicenter NI RCT. March 2014 to October 2023. Published Lancet Neurol 2024.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="TASTE" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── THAWS: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ─────────────────
  if (trialId === 'thaws-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>THAWS</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In MRI-selected patients with unknown-onset acute ischemic stroke (DWI-positive, FLAIR-negative), does low-dose IV alteplase 0.6 mg/kg improve excellent 90-day functional outcome (mRS 0-1) compared with standard medical treatment?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={47.1}
                controlPct={48.3}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="RR 0.97"
                ciLow="0.68"
                ciHigh="1.41"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '131 of 300 planned patients. Stopped pragmatically after WAKE-UP results. Published Stroke 2020.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/wake-up-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">WAKE-UP Trial</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="THAWS" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'WAKE-UP Trial', href: '/trials/wake-up-trial' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── TRACE-2: W6.4c Archetype A rebuild (TRIALS_SPEC v1.0) ───────────────
  if (trialId === 'trace-2-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TRACE-2</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke within 4.5 hours who are ineligible for or refusing endovascular thrombectomy, is IV tenecteplase 0.25 mg/kg non-inferior to IV alteplase 0.9 mg/kg for excellent functional outcome (mRS 0-1) at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={62}
                controlPct={58}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="RR 1.07"
                ciLow="0.98"
                ciHigh="1.16"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,430 patients at 53 centres in China. Phase 3 open-label blinded-endpoint NI RCT. June 2021 to May 2022. Published Lancet 2023.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="TRACE-2" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── TRACE-III: W6.4c Archetype A rebuild — late-window framing ──────────
  if (trialId === 'trace-iii-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TRACE-III</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with ICA or MCA occlusion presenting 4.5 to 24 hours from last known well — including wake-up and unwitnessed stroke — with salvageable tissue on perfusion imaging and no access to endovascular thrombectomy, does IV tenecteplase 0.25 mg/kg improve excellent functional outcome (mRS 0-1) at 90 days compared with standard medical treatment?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={33.0}
                controlPct={24.2}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-1 at 90 Days"
                riskRatio="1.37"
                ciLow="1.04"
                ciHigh="1.81"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="treatment"
              />
              {trialMetadata.calculations?.nnt != null && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to gain one additional excellent recovery (mRS 0-1)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '516 patients at multiple centres in China. Multicenter RCT with perfusion-imaging selection. 4.5–24 hour enrollment window. Published NEJM 2024.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="TRACE-III" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── INTERACT4 canary: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ──────────────
  if (trialId === 'interact4-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">

        {/* Section 1: Sticky header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>INTERACT4</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Section 2: H1 + question lede + source */}
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with suspected acute stroke and hypertension managed in the ambulance, does initiating intensive IV blood-pressure reduction before imaging diagnosis improve functional outcome at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>

          {/* Section 3: Population */}
          {renderPopulationSection(tm)}

          {/* Section 4: Primary outcome — Archetype B GrottaBarChart */}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">Undifferentiated stroke (all patients)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}

          {/* Section 5: Subgroup analyses */}
          {tm.subgroupAnalyses && tm.subgroupAnalyses.length > 0 && tm.subgroupCaveat && (
            <SubgroupWell analyses={tm.subgroupAnalyses} caveat={tm.subgroupCaveat} />
          )}

          {/* Section 6: Trial design */}
          {renderTrialDesign(tm, 'Randomized Mar 2020 to Aug 2023 at 51 hospitals in China. Open-label, blinded endpoint (PROBE design).')}

          {/* Section 7: Bedside pearl */}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}

          {/* Section 8: See also */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>

        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="INTERACT4"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── DISTAL: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ────────────────────
  if (trialId === 'distal-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DISTAL</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with medium or distal vessel occlusion (M2, M3, M4, ACA, or PCA), does endovascular thrombectomy plus best medical treatment improve 90-day functional outcome compared with best medical treatment alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">All randomized patients (medium/distal vessel occlusion)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}
          {renderTrialDesign(tm, 'Randomized December 2021 to July 2024 at 55 sites across 11 countries (predominantly Europe). International, assessor-blinded RCT. Any EVT technique allowed; treated within 24 hours of last known well.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/escape-mevo-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">ESCAPE-MeVO</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="DISTAL"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── MR ASAP: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ───────────────────
  if (trialId === 'mr-asap-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>MR ASAP</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In ambulance-treated patients with presumed stroke within 3 hours of onset, does prehospital transdermal glyceryl trinitrate improve 90-day functional outcome compared with standard care?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">Total population (presumed stroke within 3 hours)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}
          {renderTrialDesign(tm, 'Randomized April 2018 to February 2021 in the Netherlands. Phase 3, ambulance-based, open-label, blinded-endpoint trial. Stopped after 380 of planned 1200 randomizations due to a safety signal in ICH patients.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/right-2-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">RIGHT-2</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="MR ASAP"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── RACECAT: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ───────────────────
  if (trialId === 'racecat-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>RACECAT</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In nonurban patients with suspected large vessel occlusion, does direct transport to a thrombectomy-capable comprehensive stroke center improve 90-day functional outcome compared with initial transport to the nearest local stroke center?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">Ischemic stroke or TIA population (primary endpoint, n=949)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}
          {renderTrialDesign(tm, 'Population-based cluster-randomized trial in Catalonia, Spain. Enrollment March 2017 to June 2020. Stopped early for futility after interim analysis. Nonurban network with real-world ambulance routing.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/triage-stroke-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">TRIAGE-STROKE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="RACECAT"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── TRIAGE-STROKE: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ─────────────
  if (trialId === 'triage-stroke-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TRIAGE-STROKE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In IVT-eligible patients with suspected LVO stroke within 4 hours of onset, does direct routing to a thrombectomy-capable comprehensive stroke center improve 90-day functional outcome compared with initial transport to the nearest primary stroke center?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">Acute ischemic stroke population (primary endpoint, n=104)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}
          {renderTrialDesign(tm, 'Randomized September 2018 to May 2022 across Denmark. National, multicenter, assessor-blinded trial. Stopped early at 171 of 424 planned patients. Ambulance-based randomization.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/racecat-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">RACECAT</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="TRIAGE-STROKE"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── ATTEST-2: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ──────────────────
  if (trialId === 'attest-2-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ATTEST-2</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In acute ischemic stroke patients eligible for IV thrombolysis within 4.5 hours, is tenecteplase 0.25 mg/kg noninferior to alteplase 0.9 mg/kg for 90-day functional outcome?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">All treated patients (1777 patients, 39 UK centres)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}
          {renderTrialDesign(tm, 'Randomized January 2017 to May 2023 at 39 UK stroke centres. Open-label, masked-endpoint (PROBE design). Primary analysis was noninferiority in the treated population.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/act-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">AcT</Link>
              <Link to="/trials/trace-2-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">TRACE-2</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="ATTEST-2"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
            resultSubtype={tm.resultSubtype}
          />
        )}
      </div>
    );
  }

  // ── TIMELESS: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ──────────────────
  if (trialId === 'timeless-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TIMELESS</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with LVO and perfusion-imaging evidence of salvageable tissue presenting 4.5 to 24 hours after stroke onset, does tenecteplase 0.25 mg/kg improve 90-day functional outcome compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">All randomized patients (458 patients, 77% underwent EVT)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}
          {renderTrialDesign(tm, 'Multicenter, double-blind, placebo-controlled trial. ICA or MCA occlusion with CTP-confirmed salvageable tissue. 4.5-24 hours from onset. Published NEJM 2024. 77% of patients proceeded to EVT.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/trace-iii-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">TRACE-III</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="TIMELESS"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── TWIST: W6.5.1 Archetype B (TRIALS_SPEC v1.1 §3) ─────────────────────
  if (trialId === 'twist-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TWIST</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In wake-up stroke patients selected by non-contrast CT alone, does tenecteplase 0.25 mg/kg administered within 4.5 hours of awakening improve 90-day functional outcome compared with no thrombolysis?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {tm.mrsDistribution && tm.ordinalStats && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
                <p className="text-xs text-slate-500 mt-0.5">All randomized patients (578 patients, non-contrast CT selection)</p>
              </div>
              <div className="p-4">
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="none"
                />
              </div>
            </div>
          )}
          {renderTrialDesign(tm, 'Randomized June 2017 to September 2021 across 10 countries. Investigator-initiated, multicenter, open-label trial. Wake-up stroke or unwitnessed onset; selected by NCCT alone (ASPECTS 4 or higher).')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/timeless-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">TIMELESS</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="TWIST"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── RIGHT-2: W6.5.1 Archetype B / prose-narrative primary (TRIALS_SPEC v1.1 §3) ──
  // Grotta Bar omitted — Figure 2 is a raster image; per-segment percentages
  // unavailable without fabrication. Primary outcome rendered as prose + stat row.
  if (trialId === 'right-2-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">

        {/* Sticky header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>RIGHT-2</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* H1 + question lede + source */}
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with presumed stroke and elevated blood pressure, does transdermal glyceryl trinitrate started by paramedics in the ambulance within 4 hours of symptom onset improve 90-day functional outcome compared with sham?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>

          {/* Population */}
          {renderPopulationSection(tm)}

          {/* Primary outcome — prose-narrative variant (no Grotta Bar) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome · mRS Shift at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">Confirmed stroke or TIA (cohort 1, N=852); full ITT (cohort 2, N=1149)</p>
            </div>
            <div className="p-4 space-y-4">
              {/* Prose paragraph */}
              <p className="text-sm text-slate-700 leading-relaxed">
                In patients with confirmed stroke or transient ischemic attack (cohort 1, N=852), the distribution of mRS scores at 90 days did not differ significantly between groups. Median mRS was 3 (IQR 2 to 5) in both arms. The adjusted common odds ratio for a poor outcome was 1.25 (95% CI 0.97 to 1.60, p=0.083), a trend favoring sham that did not reach statistical significance. In the full intention-to-treat population (cohort 2, N=1149), the common odds ratio was 1.04 (95% CI 0.84 to 1.29, p=0.69).
              </p>

              {/* Stat row */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Common OR (cohort 1)
                    <span
                      title="Reported as OR for poor outcome (higher = worse). Values above 1 suggest a trend toward worse outcomes in the treatment group."
                      style={{ cursor: 'help', color: '#94a3b8', fontSize: 11 }}
                      aria-label="Common OR explanation"
                    >ⓘ</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>1.25</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>95% CI</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>0.97 to 1.60</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Shift in distribution</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}>Not significant</span>
                </div>
              </div>

              {/* Chart-absent note */}
              <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>
                Distribution chart not shown. See source Figure 2 for per-segment breakdown.
              </p>
            </div>
          </div>

          {/* Safety — prose card (slate, not red: trial not stopped for harm) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Safety Signals</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                Symptomatic hypotension occurred in 21 of 568 (4%) GTN patients versus 9 of 581 (2%) sham patients (adjusted OR 2.49, 95% CI 1.11 to 5.57). In the ICH subgroup, GTN was associated with larger hematoma (adjusted OR 1.95, 95% CI 1.07 to 3.58) and more mass effect on imaging (adjusted OR 2.42, 95% CI 1.26 to 4.68). Serious adverse events were 188 (33%) with GTN versus 170 (29%) with sham (p=0.16, not significant). The trial was not stopped for harm; these findings are considered hypothesis-generating, particularly for the ICH subgroup.
              </p>
            </div>
          </div>

          {/* How to interpret teaching well */}
          {tm.howToInterpret && (
            <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />
          )}

          {/* Trial design */}
          {renderTrialDesign(tm, 'Randomized October 2015 to May 2018 across the United Kingdom. Paramedic-delivered, randomized, sham-controlled phase 3 trial with blinded endpoint assessment. 1149 patients enrolled across multiple UK ambulance services.')}

          {/* Bedside pearl */}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}

          {/* See also */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/mr-asap-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">MR ASAP</Link>
            </div>
          </div>
        </div>

        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="RIGHT-2"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'MR ASAP', href: '/trials/mr-asap-trial' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── WEAVE: W6.6.1 Archetype G canary (TRIALS_SPEC v1.1 §7a) ─────────────
  if (trialId === 'weave-trial' && trialMetadata) {
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';

    // Archetype G: derive benchmarkMet from direction and rates
    const bm = trialMetadata.benchmark;
    const oer = trialMetadata.observedEventRate;
    const benchmarkMet = bm && oer
      ? (bm.direction === 'below-is-good'
          ? oer.rate < bm.rate
          : oer.rate > bm.rate)
      : false;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">

        {/* Section 1: Sticky header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link
              to="/trials"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors"
              aria-label="Back to Neuro Trials"
            >
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>
                WEAVE
              </span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">
              {categoryBadgeLabel}
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Section 2: Title block */}
          <div>
            <h1
              className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]"
              style={{ color: '#1746A2' }}
            >
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            {/* TRIALS_SPEC §7a question lede */}
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with symptomatic intracranial atherosclerotic stenosis who meet strict on-label criteria for Wingspan stenting, does the periprocedural 72-hour stroke or death rate fall below the FDA pre-specified safety benchmark of 4%?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}
              {trialMetadata.doi && (
                <>
                  {' '}·{' '}
                  <a
                    href={`https://doi.org/${trialMetadata.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    doi:{trialMetadata.doi}
                  </a>
                </>
              )}
              {' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>

          {/* Section 3: Population */}
          {renderPopulationSection(trialMetadata)}

          {/* Section 4: Primary Outcome — BenchmarkThresholdChart (Archetype G) */}
          {bm && oer && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Primary Outcome
                </p>
              </div>
              <div className="p-4">
                <BenchmarkThresholdChart
                  observedRate={oer.rate}
                  ciLow={oer.ciLow}
                  ciHigh={oer.ciHigh}
                  benchmarkRate={bm.rate}
                  benchmarkLabel={bm.label}
                  scaleMax={bm.scaleMax}
                  benchmarkMet={benchmarkMet}
                  endpoint={oer.description}
                  ciMethod={oer.ciMethod}
                  numEvents={oer.numEvents}
                  total={oer.total}
                />
              </div>
            </div>
          )}

          {/* Section 2a: Historical Context — first-class section (ADR-006 Decision 2) */}
          {trialMetadata.historicalContext && (
            <HistoricalContextSection
              rows={trialMetadata.historicalContext.rows}
              caveat="Historical rates come from different patient populations, study designs, era, and operator experience levels. Direct comparison to WEAVE is exploratory. These data provide context only, not a randomized control arm."
            />
          )}

          {/* Section 5: How to read this chart */}
          {trialMetadata.howToReadChart && (
            <TeachingWell
              mode="qa"
              title="How to read this chart"
              items={trialMetadata.howToReadChart}
            />
          )}

          {/* Section 6: How to interpret this trial */}
          {trialMetadata.howToInterpret && (
            <TeachingWell
              mode="interpret"
              title="How to interpret this trial"
              sections={trialMetadata.howToInterpret}
            />
          )}

          {/* Section 7: Trial Design */}
          {renderTrialDesign(
            trialMetadata,
            '152 consecutive patients at 24 US centers. Enrolled October 2014 to March 2017. FDA-mandated post-market surveillance under IDE S140022. Published Stroke 2019.',
          )}

          {/* Section 8: Bedside Pearl */}
          {trialMetadata.bedsidePearl && (
            <div
              style={{
                background: '#EEF2FF',
                borderLeft: '3px solid #1746A2',
                borderRadius: '0 10px 10px 0',
                padding: '16px 18px',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">
                Bedside Pearl
              </p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">
                {trialMetadata.bedsidePearl}
              </p>
            </div>
          )}

          {/* Section 9: See also */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              See also
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/trials/sammpris-trial"
                className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors"
              >
                SAMMPRIS Trial
              </Link>
            </div>
          </div>

        </div>{/* end content wrapper */}

        {/* Section 10: BottomLineDrawer — portal-mounted */}
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer
            trialName="WEAVE"
            body={trialMetadata.bottomLineSummary}
            bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[
              { label: 'SAMMPRIS Trial', href: '/trials/sammpris-trial' },
            ]}
            citation={trialMetadata.source}
            doi={trialMetadata.doi}
            trialResult={trialMetadata.trialResult}
          />
        )}

      </div>
    );
  }

  // ── MR CLEAN: Batch 1 Archetype B (TRIALS_SPEC v1.1 §3) ──────────────────
  if (trialId === 'mr-clean-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>MR CLEAN</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with proximal anterior circulation large-vessel occlusion treatable within 6 hours, does intra-arterial treatment added to usual care improve functional outcome at 90 days compared with usual care alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (anterior circulation LVO)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS 0-2 at 90 Days"
                  riskRatio="1.67"
                  ciLow="1.21"
                  ciHigh="2.30"
                  pValue="0.003"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Pragmatic phase 3 RCT enrolling 500 patients across 16 Dutch centers between December 2010 and June 2014 (Berkhemer NEJM 2015).')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/escape-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ESCAPE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="MR CLEAN"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── ESCAPE: Batch 1 Archetype B (TRIALS_SPEC v1.1 §3) ────────────────────
  if (trialId === 'escape-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ESCAPE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with disabling anterior circulation LVO, small infarct cores, and good collaterals on multiphase CTA, does rapid endovascular thrombectomy added to standard care within 12 hours improve functional outcome at 90 days compared with standard care alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (small core, good collaterals)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS 0-2 at 90 Days"
                  riskRatio="2.60"
                  ciLow="1.70"
                  ciHigh="3.80"
                  pValue="<0.001"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'International phase 3 RCT enrolling 316 patients across 22 centers between February 2013 and October 2014 (Goyal NEJM 2015). Stopped early for efficacy.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/mr-clean-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">MR CLEAN</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="ESCAPE"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── REVASCAT: Batch 1 Archetype B (TRIALS_SPEC v1.1 §3) ──────────────────
  if (trialId === 'revascat-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>REVASCAT</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO presenting up to 8 hours from onset who were ineligible for or refractory to IV alteplase, does Solitaire stent-retriever thrombectomy added to medical therapy improve functional outcome at 90 days compared with medical therapy alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (anterior circulation LVO, within 8 hours)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS 0-2 at 90 Days"
                  riskRatio="1.70"
                  ciLow="1.05"
                  ciHigh="2.80"
                  pValue="0.009"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Phase 3 RCT embedded in a population-based stroke registry, enrolling 206 patients across 4 Catalan centers between November 2012 and December 2014 (Jovin NEJM 2015). Stopped early after the other 2015 EVT trials reported positive results.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/escape-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ESCAPE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="REVASCAT"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── EXTEND-IA: Batch 1 Archetype A — co-primary endpoint note (TRIALS_SPEC v1.1 §3.5) ──
  if (trialId === 'extend-ia-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>EXTEND-IA</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO and CT-perfusion mismatch who had received IV alteplase, does adding Solitaire FR thrombectomy improve early reperfusion and neurological recovery compared with alteplase alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          {/* Secondary outcome chart — primary was co-primary reperfusion + neurological improvement */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Secondary outcome: mRS 0-2 at 90 days</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Co-primary endpoint note:</strong> Both co-primary endpoints were met: reperfusion at 24 hours (100% vs 37%, P less than 0.001) and early neurological improvement at day 3 (80% vs 37%, P less than 0.001). The chart below shows the secondary functional outcome (mRS 0 to 2 at 90 days) for bedside context.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days (Secondary Outcome)"
                riskRatio="2.92"
                ciLow="1.20"
                ciHigh="7.11"
                pValue="0.02"
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Investigator-initiated multicenter RCT enrolling 70 patients in Australia and New Zealand between August 2012 and October 2014 (Campbell NEJM 2015). Stopped early for efficacy after 70 of 100 planned patients.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/swift-prime-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">SWIFT PRIME</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="EXTEND-IA"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── SWIFT PRIME: Batch 1 Archetype B (TRIALS_SPEC v1.1 §3) ───────────────
  if (trialId === 'swift-prime-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SWIFT PRIME</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO who had received IV alteplase within 4.5 hours, does adding Solitaire stent-retriever thrombectomy improve functional outcome at 90 days compared with alteplase alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (anterior circulation LVO, IV alteplase within 4.5 hours)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS 0-2 at 90 Days"
                  riskRatio="2.75"
                  ciLow="1.53"
                  ciHigh="4.95"
                  pValue="<0.001"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'International multicenter RCT enrolling 196 patients across 39 centers between December 2012 and November 2014 (Saver NEJM 2015). Stopped early for efficacy at 196 of a planned 833 patients.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/escape-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ESCAPE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="SWIFT PRIME"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── THRACE: Batch 2 Archetype A (TRIALS_SPEC v1.1 §3) ───────────────────
  if (trialId === 'thrace-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>THRACE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In alteplase-eligible patients with proximal anterior circulation LVO and NIHSS 10 to 25 treated within 5 hours, does adding mechanical thrombectomy to IV alteplase improve functional independence at 3 months compared with alteplase alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-2 at 3 Months</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (proximal anterior circulation LVO, NIHSS 10 to 25)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS 0-2 at 3 Months"
                  riskRatio="1.55"
                  ciLow="1.05"
                  ciHigh="2.30"
                  pValue="0.028"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'French multicenter RCT enrolling 414 patients across 26 centers between 2010 and 2015 (Bracard Lancet Neurol 2016).')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/mr-clean-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">MR CLEAN</Link>
              <Link to="/trials/escape-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ESCAPE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="THRACE"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── LASTE: Batch 2 Archetype B (TRIALS_SPEC v1.1 §3) ────────────────────
  if (trialId === 'laste-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>LASTE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO and a large established infarct (ASPECTS 5 or lower, no lower limit on infarct volume) treatable within 6.5 hours, does thrombectomy plus medical care shift the mRS distribution toward better outcomes and reduce mortality compared with medical care alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (anterior circulation LVO, ASPECTS 5 or lower)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : tm.ordinalStats ? (
                <div className="space-y-4">
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803d', marginBottom: 6 }}>
                      mRS Ordinal Shift at 90 Days
                    </p>
                    <p style={{ fontSize: 38, fontWeight: 700, color: '#15803d', lineHeight: 1, marginBottom: 6 }}>
                      cOR {tm.ordinalStats.commonOR}
                    </p>
                    <p style={{ fontSize: 13, color: '#166534' }}>
                      95% CI {tm.ordinalStats.ciLow} to {tm.ordinalStats.ciHigh}
                      {tm.ordinalStats.pValue !== undefined
                        ? (tm.ordinalStats.pValue < 0.001 ? ' · P <0.001' : ` · P = ${tm.ordinalStats.pValue}`)
                        : ' · P <0.001'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803d', marginBottom: 4 }}>
                        Median mRS — Thrombectomy
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#15803d', lineHeight: 1.1 }}>4</p>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 4 }}>
                        Median mRS — Medical Care
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#475569', lineHeight: 1.1 }}>6</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    Mortality: 36.1% (thrombectomy) vs 55.5% (medical care) · sICH: 9.6% vs 5.7%
                  </p>
                </div>
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS Ordinal Shift at 90 Days"
                  riskRatio={String(tm.efficacyResults.treatment.percentage)}
                  ciLow=""
                  ciHigh=""
                  pValue="<0.001"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'French multicenter RCT enrolling 333 patients across multiple centers (Costalat NEJM 2024). Stopped early after external positive large-core data emerged from ANGEL-ASPECT, SELECT2, and TESLA.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/tension-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">TENSION</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="LASTE"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── TENSION: Batch 2 Archetype B (TRIALS_SPEC v1.1 §3) ──────────────────
  if (trialId === 'tension-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TENSION</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO and ASPECTS 3 to 5 selected predominantly by non-contrast CT treated within 12 hours, does endovascular thrombectomy plus medical treatment shift the mRS distribution toward better outcomes at 90 days compared with medical treatment alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (anterior circulation LVO, ASPECTS 3 to 5)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : tm.ordinalStats ? (
                <div className="space-y-4">
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803d', marginBottom: 6 }}>
                      mRS Ordinal Shift at 90 Days
                    </p>
                    <p style={{ fontSize: 38, fontWeight: 700, color: '#15803d', lineHeight: 1, marginBottom: 6 }}>
                      cOR {tm.ordinalStats.commonOR}
                    </p>
                    <p style={{ fontSize: 13, color: '#166534' }}>
                      95% CI {tm.ordinalStats.ciLow} to {tm.ordinalStats.ciHigh}
                      {tm.ordinalStats.pValue !== undefined
                        ? (tm.ordinalStats.pValue < 0.001 ? ' · P <0.001' : ` · P = ${tm.ordinalStats.pValue}`)
                        : ' · P <0.001'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#15803d', marginBottom: 4 }}>
                        Median mRS — EVT
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#15803d', lineHeight: 1.1 }}>4</p>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 4 }}>
                        Median mRS — Medical Treatment
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#475569', lineHeight: 1.1 }}>5</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    Mortality: 40% (EVT) vs 51% (medical treatment) · sICH: 5% both arms
                  </p>
                </div>
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS Ordinal Shift at 90 Days"
                  riskRatio={String(tm.efficacyResults.treatment.percentage)}
                  ciLow=""
                  ciHigh=""
                  pValue="0.0001"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'European multicenter RCT enrolling 253 patients between 2018 and 2023 (Bendszus Lancet 2023). Stopped early at the first interim analysis for efficacy.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/laste-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">LASTE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="TENSION"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── CHOICE: Batch 2 Archetype A (TRIALS_SPEC v1.1 §3) ───────────────────
  if (trialId === 'choice-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isPositive = tm.trialResult === 'POSITIVE';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link to="/trials" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>CHOICE</span>
            </Link>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with large vessel occlusion stroke who achieved successful reperfusion (eTICI 2b50 or higher) after thrombectomy, does adjunct intra-arterial alteplase improve excellent functional outcome (mRS 0 to 1) at 90 days compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-1 at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (LVO, eTICI 2b50+ reperfusion after thrombectomy)</p>
            </div>
            <div className="p-4">
              {tm.mrsDistribution && tm.ordinalStats ? (
                <GrottaBarChart
                  arms={tm.mrsDistribution as [{ arm: string; n: number; pct: number[] }, { arm: string; n: number; pct: number[] }]}
                  ordinalStats={tm.ordinalStats}
                  winnerArm="intervention"
                />
              ) : (
                <DeltaBandChart
                  treatmentPct={tm.efficacyResults.treatment.percentage}
                  controlPct={tm.efficacyResults.control.percentage}
                  treatmentLabel={tm.efficacyResults.treatment.name}
                  controlLabel={tm.efficacyResults.control.name}
                  endpoint="mRS 0-1 at 90 Days"
                  riskRatio="RD +18.4 pp"
                  ciLow="0.3 pp"
                  ciHigh="36.4 pp"
                  pValue="0.047"
                  winnerArm={isPositive ? 'treatment' : 'none'}
                />
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Phase 2b randomized double-blind placebo-controlled trial enrolling 121 patients across 7 stroke centers in Catalonia between 2018 and 2021 (Renu JAMA 2022). Stopped early during the COVID-19 pandemic.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/mr-clean-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">MR CLEAN</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="CHOICE"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────

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
            {catalogTrial?.year ? <span className="ml-2 text-slate-400 dark:text-slate-500">({catalogTrial.year})</span> : null}
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

            <TrialVisualizationSection visualizations={visualizations} />

            {/* Clinical Context Section */}
            {trialMetadata?.clinicalContext && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Clinical Context</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {trialMetadata.clinicalContext}
                </p>
              </div>
            )}

            {trialSummaryItems.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Trial Summary</h3>
                <div className="space-y-4">
                  {trialSummaryItems.map((item) => (
                    <div key={item.label}>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {item.label}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {addTooltips(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
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
            {renderedConclusion && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Conclusion</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {addTooltips(renderedConclusion)}
                </p>
              </div>
            )}

            {/* Trial Content */}
            {sanitizedTrialContent && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3" {...props} />,
                    p: ({node, ...props}) => <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700 dark:text-slate-300" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                    a: ({node, href, children, ...props}) => {
                      if (href?.startsWith('/')) {
                        return (
                          <Link
                            to={href}
                            className="text-neuro-600 dark:text-neuro-400 font-medium underline underline-offset-2 hover:opacity-80"
                            {...props}
                          >
                            {children}
                          </Link>
                        );
                      }

                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neuro-600 dark:text-neuro-400 font-medium underline underline-offset-2 hover:opacity-80"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    table: ({node, ...props}) => <div className="overflow-x-auto mb-6"><table className="w-full text-sm border-collapse border border-slate-200 dark:border-slate-700" {...props} /></div>,
                    thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-800" {...props} />,
                    th: ({node, ...props}) => <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-left font-semibold text-slate-900 dark:text-white" {...props} />,
                    td: ({node, ...props}) => <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-300" {...props} />,
                    tr: ({node, ...props}) => <tr className="even:bg-slate-50 even:dark:bg-slate-800/50" {...props} />,
                  }}
                >
                  {sanitizedTrialContent}
                </ReactMarkdown>
              </div>
            )}

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
