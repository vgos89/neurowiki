import React, { useMemo, useEffect, useState, Suspense } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useBackNavigation } from '../../hooks/useBackNavigation';
import { useRecents } from '../../hooks/useRecents';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { loadTrialPayload, normalizeTrialSlug, type TrialPayload } from '../../data/trialPayload';
import type { TrialMetadata } from '../../data/trialData';
import { TrialStats } from '../../components/TrialStats';
import { MedicalTooltip } from '../../components/MedicalTooltip';
import { MEDICAL_GLOSSARY } from '../../data/medicalGlossary';
import { addTooltips } from '../../utils/addTooltips';
import { buildHouseConclusion } from '../../utils/trialNarrative';
import { categoryNames, categoryStyles, findTrialById } from '../../data/trialListData';
const TrialVisualizationSectionLazy = React.lazy(() =>
  import('../../components/trials/TrialVisualizations')
    .then(m => ({ default: m.TrialVisualizationSection }))
);
const DeltaBandChartLazy = React.lazy(() =>
  import('../../components/trials/archetypes/DeltaBandChart')
    .then(m => ({ default: m.DeltaBandChart }))
);
const GrottaBarChartLazy = React.lazy(() =>
  import('../../components/trials/archetypes/GrottaBarChart')
    .then(m => ({ default: m.GrottaBarChart }))
);
const BenchmarkThresholdChartLazy = React.lazy(() =>
  import('../../components/trials/archetypes/BenchmarkThresholdChart')
    .then(m => ({ default: m.BenchmarkThresholdChart }))
);
const MarkdownSectionLazy = React.lazy(() => import('../../components/trials/MarkdownSection'));
import { SubgroupWell } from '../../components/trials/SubgroupWell';
import { TeachingWell } from '../../components/trials/TeachingWell';
import { BottomLineDrawer } from '../../components/trials/BottomLineDrawer';
import { HistoricalContextSection } from '../../components/trials/HistoricalContextSection';
import TrialChainTimeline from '../../components/trials/TrialChainTimeline';
import { RelatedTrialsSidebar } from '../../components/trials/RelatedTrialsSidebar';

function ChartFallback() {
  return <div className="h-32 bg-slate-100 rounded-xl animate-pulse" aria-hidden="true" />;
}

// Suspense-wrapped local aliases — same API as the originals; no usage-site changes needed.
function DeltaBandChart(props: React.ComponentProps<typeof DeltaBandChartLazy>) {
  return <Suspense fallback={<ChartFallback />}><DeltaBandChartLazy {...props} /></Suspense>;
}
function GrottaBarChart(props: React.ComponentProps<typeof GrottaBarChartLazy>) {
  return <Suspense fallback={<ChartFallback />}><GrottaBarChartLazy {...props} /></Suspense>;
}
function BenchmarkThresholdChart(props: React.ComponentProps<typeof BenchmarkThresholdChartLazy>) {
  return <Suspense fallback={<ChartFallback />}><BenchmarkThresholdChartLazy {...props} /></Suspense>;
}

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
  const handleBack = useBackNavigation('/trials');
  const { recordView } = useRecents();
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

  // HOME_SPEC §1.6.4 — trail slot: keyStat (NNT / effect size) per HUB_SPEC v1.4 §1.6.4
  useEffect(() => {
    if (!trialId) return;
    recordView({
      type: 'trial',
      id: `trial-${trialId}`,
      title: catalogTrial?.name ?? trialId,
      subtitle: categoryNames[safeCategory],
      category: safeCategory,
      trail: catalogTrial?.legend?.keyStat,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialId]);

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
      // ── Schema-driven classification (Wave 3 Batch 2) ──────────────────────
      // Uses primaryDesign + primaryResult when both are populated (Wave 2 schema contract).
      // Falls back to legacy string-sniffing heuristics for unmigrated trials.
      // Invariant: both fields must be set together — warn in dev if only one is present.
      const bothSchemaFieldsSet = !!trialMetadata.primaryDesign && !!trialMetadata.primaryResult;
      if (import.meta.env.DEV && !bothSchemaFieldsSet &&
          (!!trialMetadata.primaryDesign !== !!trialMetadata.primaryResult)) {
        console.warn(
          `[TrialPageNew] "${trialId}" has only one of primaryDesign/primaryResult set. ` +
          'Both must be populated together per Wave 2 schema contract. Falling back to legacy heuristics.',
        );
      }

      // NNT suppression (Option Y) — designs for which the NNT card is clinically inappropriate.
      // Targets the NNT card only; does NOT suppress bedsidePearl/howToInterpret prose.
      const NNT_SUPPRESSED_DESIGNS: ReadonlyArray<TrialMetadata['primaryDesign']> = [
        'ordinal-shift', 'noninferiority', 'bayesian-noninferiority',
        'dose-finding-safety', 'estimation-strategy', 'single-arm-registry',
      ];

      // isEstimationTrial: controls the "ESTIMATION TRIAL" blue-box display.
      const isEstimationTrial = bothSchemaFieldsSet
        ? trialMetadata.primaryDesign === 'dose-finding-safety' ||
          trialMetadata.primaryDesign === 'estimation-strategy' ||
          trialMetadata.primaryDesign === 'single-arm-registry'
        : (trialMetadata.specialDesign === 'estimation-trial' ||
           trialMetadata.stats.pValue.label.toLowerCase().includes('estimation'));

      // suppressNNT: broader gate — includes NI + ordinal-shift in addition to estimation.
      // Replace the old `!isEstimationTrial` NNT guard at both rendering sites.
      const suppressNNT = bothSchemaFieldsSet
        ? NNT_SUPPRESSED_DESIGNS.includes(trialMetadata.primaryDesign!)
        : isEstimationTrial;

      // Specific result-type flags for distinct label/visual treatment in JSX.
      const isHarmStopped = bothSchemaFieldsSet
        ? trialMetadata.primaryResult === 'harm-stopped'
        : false;

      const isNIEstablished = bothSchemaFieldsSet &&
        trialMetadata.primaryResult === 'noninferiority-established';

      const isNIFailed = bothSchemaFieldsSet &&
        trialMetadata.primaryResult === 'noninferiority-not-established';

      const isBayesianSuperiorityTrial = bothSchemaFieldsSet &&
        trialMetadata.primaryDesign === 'bayesian-superiority';

      // isNegativeTrial: all "did not succeed" results — superset of isHarmStopped + isNIFailed.
      // Used as final ternary fallback; specific sub-states checked first in JSX.
      const NEGATIVE_RESULTS: ReadonlyArray<TrialMetadata['primaryResult']> = [
        'not-met', 'noninferiority-not-established', 'futility-stopped',
        'harm-stopped', 'terminated-administrative',
      ];
      const isNegativeTrial = bothSchemaFieldsSet
        ? NEGATIVE_RESULTS.includes(trialMetadata.primaryResult!)
        : (trialMetadata.trialResult === 'NEGATIVE' ||
           (!isEstimationTrial && (
             trialMetadata.stats.pValue.label.toLowerCase().includes('not significant') ||
             trialMetadata.stats.pValue.label.toLowerCase().includes('worse') ||
             trialMetadata.stats.effectSize.value.toLowerCase().includes('no benefit') ||
             trialMetadata.stats.effectSize.value.toLowerCase().includes('harm') ||
             (trialMetadata.stats.pValue.value !== 'N/A' &&
              !trialMetadata.stats.pValue.value.includes('<') &&
              !trialMetadata.stats.pValue.value.includes('>') &&
              parseFloat(trialMetadata.stats.pValue.value) >= 0.05)
           )));

      // NNT calculation — targets the NNT card only; does not affect prose surfaces.
      let nnt: string | number = 'N/A';
      let nntExplanation: string | undefined;

      if (!isNegativeTrial && !suppressNNT && trialMetadata.efficacyResults) {
        const arr = (trialMetadata.efficacyResults.treatment.percentage - trialMetadata.efficacyResults.control.percentage) / 100;
        if (arr > 0) {
          if (trialMetadata.calculations?.nnt) {
            nnt = trialMetadata.calculations.nnt;
            nntExplanation = trialMetadata.calculations.nntExplanation;
          } else {
            nnt = Math.round((1 / arr) * 10) / 10;
          }
          // Bayesian superiority annotation (DAWN) — per clinical-reviewer Wave 3 condition #3.
          // NNT is derived from observed proportions, NOT from the posterior probability.
          if (isBayesianSuperiorityTrial) {
            nntExplanation = (nntExplanation ? nntExplanation + ' ' : '') +
              '(Bayesian adaptive trial — superiority established by posterior probability >0.999; NNT calculated from observed proportions.)';
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
        isNegativeTrial,           // superset: not-met | NI-failed | futility | harm | admin
        isEstimationTrial,         // controls "ESTIMATION TRIAL" blue-box
        suppressNNT,               // broader gate: also covers ordinal-shift + NI designs
        isHarmStopped,             // distinct harm state → warning/danger visual treatment
        isNIEstablished,           // NI met → label "non-inferiority established" (not "positive")
        isNIFailed,                // NI failed → label "did not establish non-inferiority"
        isBayesianSuperiorityTrial, // DAWN pattern → NNT shown with Bayesian annotation
        keyMessage: trialMetadata.keyMessage,
        additionalResults: trialMetadata.additionalResults,
        proceduralDetails: trialMetadata.proceduralDetails,
        safetyProfile: trialMetadata.safetyProfile,
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
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-neuro-500" />
          <p className="mt-4 text-slate-600">Loading trial summary...</p>
        </div>
      </div>
    );
  }

  if (!trial && !isPlaceholderTrial && import.meta.env.DEV) {
    console.error('TrialPageNew - TRIAL NOT FOUND:', { pathname, topicId, pathTrialId, trialId, payloadError });
  }

  if (isPlaceholderTrial && catalogTrial) {
    return (
      <div className="min-h-dvh bg-slate-50">
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-neuro-600 mb-2 transition-colors text-sm font-medium cursor-pointer bg-transparent border-0 p-2 -ml-2 rounded-lg hover:bg-slate-100"
              aria-label="Back to Neuro Trials"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Neuro Trials</span>
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
              {catalogTrial.name}
              {catalogTrial.year > 0 ? <span className="ml-2 text-slate-400">({catalogTrial.year})</span> : null}
            </h2>
            <p className="text-slate-500 text-base">
              {categoryNames[safeCategory]}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 mb-4">
              Blank page ready
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Content coming soon</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              This trial has been added to the new catalog structure, but the detailed summary has not been written yet.
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Reference DOI</div>
              <a
                href={`https://doi.org/${catalogTrial.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline break-all"
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
      <div className="min-h-dvh bg-slate-50 pb-28">

        {/* Section 1: Sticky header — abbreviated name + category badge */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0"
              aria-label="Back to Neuro Trials"
            >
              <ArrowLeft className="w-4 h-4" />
              {/* ADR-005 Decision 4: sticky header name — 13px bold slate-800, tracking 0.02em */}
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>
                EXTEND
              </span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Population
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {trialMetadata.inclusionCriteria && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Included</p>
                    <ul className="space-y-1.5">
                      {trialMetadata.inclusionCriteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
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
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Safety
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {trialMetadata.safetyProfile.sICH && (
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
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
                    <p className="text-xs font-semibold text-slate-700 mb-2">
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Trial Design
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Type</p>
                <ul className="space-y-0.5">
                  {trialMetadata.trialDesign.type.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700">
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
                borderLeft: '2px solid #1746A2',
                borderRadius: '0 10px 10px 0',
                padding: '16px 18px',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">
                Bedside Pearl
              </p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}

          {/* Section 10: See-also links */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety</p>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((metric, idx) => {
            const evtColor = metric.color === 'danger' ? 'text-red-600' : metric.color === 'warning' ? 'text-amber-600' : metric.color === 'success' ? 'text-emerald-600' : 'text-slate-700';
            return (
              <div key={idx} className="p-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">{metric.label}</p>
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
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Population</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {tm.inclusionCriteria && (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">Included</p>
              <ul className="space-y-1.5">
                {tm.inclusionCriteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
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
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
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
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trial Design</p>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Type</p>
          <ul className="space-y-0.5">
            {tm.trialDesign.type.map((t, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-slate-700">
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>WAKE-UP</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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

  // ── ECASS III: W8.2-followup Archetype A rebuild (TRIALS_SPEC v1.0) ──────
  if (trialId === 'ecass3-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ECASS III</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke 3 to 4.5 hours after symptom onset, does IV alteplase 0.9 mg/kg improve functional outcome (mRS 0–1) at 90 days compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={52.4}
                controlPct={45.2}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–1 at 90 Days"
                riskRatio="OR 1.34"
                ciLow="1.02"
                ciHigh="1.76"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to achieve mRS 0–1 at 90 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '821 patients (418 alteplase / 403 placebo, ITT) at 130 sites across 19 European countries. Enrolled July 2003 – November 2007. Published NEJM 2008.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/pathways/late-window-ivt" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">Late Window IVT Pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ECASS III" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'Late Window IVT Pathway', href: '/pathways/late-window-ivt' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── NINDS: W8.2-followup Archetype A rebuild (TRIALS_SPEC v1.0) ──────────
  if (trialId === 'ninds-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>NINDS</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke within 3 hours of symptom onset, does IV alteplase 0.9 mg/kg improve neurologic outcome at 90 days compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={42.6}
                controlPct={27.2}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–1 at 90 Days"
                riskRatio="OR 1.7"
                ciLow="1.2"
                ciHigh="2.6"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to achieve mRS 0–1 at 90 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '624 patients across 8 US centers, 2 parts (291 + 333). Enrolled January 1991 – October 1994. Published NEJM 1995. Foundational FDA approval data for IV alteplase in acute ischemic stroke.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="NINDS" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'NIHSS Calculator', href: '/calculators/nihss' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── INSPIRES: W8.2-followup Archetype A rebuild ─────────────────────────
  if (trialId === 'inspires-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>INSPIRES</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with minor ischemic stroke or high-risk TIA of presumed atherosclerotic cause, does 21-day clopidogrel + aspirin started within 24–72 hours reduce 90-day stroke recurrence compared with aspirin monotherapy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement: stroke-free at 90d (100 - recurrence) */}
              <DeltaBandChart
                treatmentPct={92.7}
                controlPct={90.8}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Stroke-free at 90 Days"
                riskRatio="HR 0.79"
                ciLow="0.66"
                ciHigh="0.94"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to prevent one recurrent stroke at 90 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '6,100 patients at 222 hospitals in China; 2×2 factorial. Enrolled 2019–2023. Published NEJM 2023.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/chance-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">CHANCE</Link>
              <Link to="/trials/point-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">POINT</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="INSPIRES" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'CHANCE', href: '/trials/chance-trial' }, { label: 'POINT', href: '/trials/point-trial' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── CHANCE-2: W8.2-followup Archetype A rebuild ─────────────────────────
  if (trialId === 'chance-2-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>CHANCE-2</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In CYP2C19 loss-of-function carriers with minor ischemic stroke (NIHSS ≤3) or high-risk TIA within 24 hours, does ticagrelor + aspirin outperform standard clopidogrel + aspirin for 90-day stroke recurrence?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              {/* Complement: stroke-free at 90d */}
              <DeltaBandChart
                treatmentPct={94.0}
                controlPct={92.4}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Stroke-free at 90 Days"
                riskRatio="HR 0.77"
                ciLow="0.64"
                ciHigh="0.94"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to prevent one recurrent stroke at 90 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '6,412 CYP2C19 LOF carriers at 202 centers in China. Rapid point-of-care genotyping required. Enrolled 2019–2021. Published NEJM 2021.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/chance-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">CHANCE</Link>
              <Link to="/trials/thales-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">THALES</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="CHANCE-2" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'CHANCE', href: '/trials/chance-trial' }, { label: 'THALES', href: '/trials/thales-trial' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── ATTENTION: W8.2-followup Archetype A rebuild ─────────────────────────
  if (trialId === 'attention-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ATTENTION</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In acute basilar artery occlusion with NIHSS ≥10 within 12 hours of estimated onset, does endovascular thrombectomy improve mRS 0–3 at 90 days compared with best medical care alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={46}
                controlPct={23}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–3 at 90 Days"
                riskRatio="RR 2.06"
                ciLow="1.46"
                ciHigh="2.91"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to achieve mRS 0–3 at 90 days</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '340 patients (226 EVT / 114 control, 2:1 ITT) at 36 centers in China. Enrolled Feb 2021 – Jan 2022. Published NEJM 2022.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/baoche-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">BAOCHE (6–24h)</Link>
              <Link to="/pathways/evt" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">EVT Pathway</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="attention-trial" />
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ATTENTION" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'BAOCHE (6–24h)', href: '/trials/baoche-trial' }, { label: 'EVT Pathway', href: '/pathways/evt' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── BAOCHE: W8.2-followup Archetype A rebuild ───────────────────────────
  if (trialId === 'baoche-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>BAOCHE</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In acute basilar artery occlusion 6–24 hours after last-known-well, does endovascular thrombectomy improve mRS 0–3 at 90 days compared with standard medical care? (Primary outcome was amended mid-trial from mRS 0–4 to mRS 0–3 before unblinding.)
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Protocol amendment:</strong> Primary outcome changed from mRS 0–4 to mRS 0–3 mid-trial (before unblinding). The original mRS 0–4 result was NEGATIVE (RR 1.21, 95% CI 0.95–1.54). Trial stopped early for efficacy at planned interim — effect size may be overestimated.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={46}
                controlPct={24}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–3 at 90 Days (revised primary)"
                riskRatio="RR 1.81"
                ciLow="1.26"
                ciHigh="2.60"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">to achieve mRS 0–3 at 90 days (display with amendment caveat)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '217 patients (110 EVT / 107 control, 1:1 ITT) in China. Enrolled Aug 2016 – Jun 2021. Stopped early Apr 2022 at planned interim for efficacy. Published NEJM 2022.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/attention-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">ATTENTION (0–12h)</Link>
              <Link to="/pathways/evt" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">EVT Pathway</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="baoche-trial" />
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="BAOCHE" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'ATTENTION (0–12h)', href: '/trials/attention-trial' }, { label: 'EVT Pathway', href: '/pathways/evt' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── SAMMPRIS: W8.2-followup Archetype A rebuild (HARM-stopped) ──────────
  if (trialId === 'sammpris-trial' && trialMetadata) {
    const isHarm = trialMetadata.trialResult === 'HARM';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SAMMPRIS</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isHarm ? '#7f1d1d' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with symptomatic 70–99% intracranial atherosclerotic stenosis within 30 days of qualifying TIA or stroke, does percutaneous transluminal angioplasty + Wingspan stenting plus aggressive medical management reduce 30-day stroke/death compared with aggressive medical management alone? (Stopped early by DSMB for harm + futility.)
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-800 leading-relaxed">
                  <strong>STOPPED FOR HARM:</strong> DSMB halted SAMMPRIS at 451 of 764 planned patients due to excess 30-day stroke/death in the stenting arm (14.7% vs 5.8%, P=0.002). Periprocedural events drove the harm — 25 of 33 PTAS strokes occurred within 24 hours of the procedure. sICH 4.5% vs 0%. Result is specific to Wingspan as INITIAL therapy in this population; on-label salvage use (WEAVE registry) showed acceptable safety.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={14.7}
                controlPct={5.8}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="Stroke/death within 30 Days"
                riskRatio="ARR +8.9pp"
                ciLow="3.4"
                ciHigh="14.4"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="control"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '451 patients at 50 US sites. Enrolled Nov 2008 – Apr 2011 (halted by DSMB). Gateway PTA balloon + Wingspan self-expanding stent (Stryker Neurovascular). Published NEJM 2011. Erratum 2012 (procedural bookkeeping only; no statistical change).')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#FEF2F2', borderLeft: '3px solid #b91c1c', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2">Bedside Pearl</p>
              <p className="text-sm text-red-900 leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/weave-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">WEAVE (on-label registry)</Link>
              <Link to="/calculators/has-bled-score" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">HAS-BLED</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="SAMMPRIS" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'WEAVE (on-label registry)', href: '/trials/weave-trial' }, { label: 'HAS-BLED', href: '/calculators/has-bled-score' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── ORIGINAL: W8.2-followup Archetype A rebuild (Non-inferiority) ───────
  if (trialId === 'original-trial' && trialMetadata) {
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ORIGINAL</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In Chinese patients with acute ischemic stroke within 4.5 hours of onset, is intravenous tenecteplase 0.25 mg/kg noninferior to intravenous alteplase 0.9 mg/kg for mRS 0–1 at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Non-inferiority</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Non-inferiority design:</strong> The trial asks whether TNK is at least as good as alteplase within a pre-specified margin (RR ≥0.937), not whether TNK is better. NI margin met: RR 1.03 (95% CI 0.97–1.09). Do not derive an NNT from this trial — the design does not establish a superiority effect size.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={72.7}
                controlPct={70.3}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–1 at 90 Days"
                riskRatio="RR 1.03"
                ciLow="0.97"
                ciHigh="1.09"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="none"
              />
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,465 patients (732 TNK / 733 alteplase) at 55 stroke centers in China. Enrolled July 2021 – July 2023. Published JAMA 2024;332(17):1437–1445.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/act-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">AcT (Canada)</Link>
              <Link to="/guide/iv-tpa" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">IV tPA guide</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ORIGINAL" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'AcT (Canada)', href: '/trials/act-trial' }, { label: 'IV tPA guide', href: '/guide/iv-tpa' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── DEFUSE-3: W8.2-followup Archetype A rebuild ───────────────────────
  if (trialId === 'defuse-3-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DEFUSE-3</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In anterior LVO patients 6–16 hours from last known well with RAPID-defined perfusion mismatch, does endovascular thrombectomy improve the mRS distribution at 90 days compared with standard medical therapy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Ordinal mRS Shift</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Ordinal-shift design:</strong> Primary endpoint is the full mRS distribution analyzed by ordinal logistic regression (common OR 2.77, 95% CI 1.63–4.70). The mRS 0–2 dichotomization shown below is a secondary outcome; its NNT 3.6 is derived from the secondary, not the primary.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={45}
                controlPct={17}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–2 at 90 Days (secondary)"
                riskRatio="cOR 2.77"
                ciLow="1.63"
                ciHigh="4.70"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">from mRS 0–2 secondary (ordinal-shift primary does not yield valid NNT)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '182 patients (92 EVT / 90 medical) at 38 US centers. Enrolled May 2016 – Dec 2017. Stopped early at pre-specified interim. Published NEJM 2018.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/dawn-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">DAWN</Link>
              <Link to="/pathways/evt" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">EVT Pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="DEFUSE-3" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'DAWN', href: '/trials/dawn-trial' }, { label: 'EVT Pathway', href: '/pathways/evt' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── DAWN: W8.2-followup Archetype A rebuild (Bayesian) ──────────────────
  if (trialId === 'dawn-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DAWN</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In anterior LVO patients 6–24 hours from last known well with clinical-imaging mismatch (small infarct core + severe deficit), does endovascular thrombectomy with the Trevo device improve disability outcomes compared with standard medical care?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Bayesian Superiority</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Bayesian adaptive design:</strong> Primary endpoint is the utility-weighted mRS at 90 days; superiority is established by posterior probability {'>'} 0.999, NOT a frequentist p-value. The mRS 0–2 binary shown below is the second coprimary (upgraded mid-trial at FDA request, while blinded). NNT 2.8 is derived from the binary coprimary, not the Bayesian primary.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={49}
                controlPct={13}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–2 at 90 Days (coprimary)"
                riskRatio="P(sup)"
                ciLow=">99.9%"
                ciHigh=""
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">from binary coprimary (Bayesian uw-mRS primary; NNT displayed with annotation)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '206 patients at 26 centers (US/Canada/Europe/Australia). Enrolled Sep 2014 – Feb 2017. Stopped early at 31 months for predictive probability of success >=95%. Trevo device. Published NEJM 2018.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/defuse-3-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">DEFUSE-3</Link>
              <Link to="/pathways/evt" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">EVT Pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="DAWN" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'DEFUSE-3', href: '/trials/defuse-3-trial' }, { label: 'EVT Pathway', href: '/pathways/evt' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── SELECT2: W8.2-followup Archetype A rebuild (Ordinal-shift) ──────────
  if (trialId === 'select2-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SELECT2</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In anterior LVO patients with a large ischemic core (ASPECTS 3–5 or core ≥50 mL) within 24 hours of last known well, does endovascular thrombectomy improve the mRS distribution at 90 days compared with medical management?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Ordinal mRS Shift</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Ordinal-shift design:</strong> Primary is generalized OR for ordinal mRS shift (gOR 1.51, 95% CI 1.20–1.89). The mRS 0–2 binary shown below (functional independence) is a secondary outcome; frame as "less disability on average", not "independence restored" — only 20% achieve mRS 0–2.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={20}
                controlPct={7}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–2 at 90 Days (secondary)"
                riskRatio="gOR 1.51"
                ciLow="1.20"
                ciHigh="1.89"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">from mRS 0–2 secondary (ordinal-shift primary does not yield valid NNT)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '352 patients (178 EVT / 174 medical) internationally; age ≤85. Stopped early at 2nd interim for efficacy. Published NEJM 2023;388(14):1259–1271.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/angel-aspect-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">ANGEL-ASPECT</Link>
              <Link to="/pathways/evt" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">EVT Pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="SELECT2" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'ANGEL-ASPECT', href: '/trials/angel-aspect-trial' }, { label: 'EVT Pathway', href: '/pathways/evt' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── ANGEL-ASPECT: W8.2-followup Archetype A rebuild ─────────────────────
  if (trialId === 'angel-aspect-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ANGEL-ASPECT</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In Chinese patients with anterior LVO and large ischemic core (ASPECTS 3–5, OR ASPECTS 0–2 with core 70–100 mL), does endovascular thrombectomy improve the mRS distribution at 90 days compared with medical management?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Ordinal mRS Shift</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Ordinal-shift design:</strong> Primary is generalized OR for ordinal mRS shift (gOR 1.37, 95% CI 1.11–1.69, P=0.004). The mRS 0–2 binary (functional independence) shown below is a secondary outcome. Higher any-ICH rate than SELECT2 (49.1% vs 17.3%); careful BP management required.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={30}
                controlPct={11.6}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–2 at 90 Days (secondary)"
                riskRatio="gOR 1.37"
                ciLow="1.11"
                ciHigh="1.69"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm={isPositive ? 'treatment' : 'none'}
              />
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
                  <span className="text-sm font-semibold text-slate-700">~{Math.round(trialMetadata.calculations.nnt as number)}</span>
                  <span className="text-xs text-slate-500">from mRS 0–2 secondary (ordinal-shift primary does not yield valid NNT)</span>
                </div>
              )}
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '456 patients in China; age ≤80; NIHSS 6–30. Stopped early at 2nd interim. Published NEJM 2023;388(14):1272–1283.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/select2-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">SELECT2</Link>
              <Link to="/pathways/evt" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">EVT Pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ANGEL-ASPECT" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'SELECT2', href: '/trials/select2-trial' }, { label: 'EVT Pathway', href: '/pathways/evt' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── ENRICH: W8.2-followup Archetype A rebuild (Bayesian, ICH) ───────────
  if (trialId === 'enrich-trial' && trialMetadata) {
    const isPositive = trialMetadata.trialResult === 'POSITIVE';
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ENRICH</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with lobar (or anterior basal ganglia) intracerebral hemorrhage of 30–80 mL within 24 hours, does minimally invasive parafascicular surgery improve utility-weighted mRS at 180 days compared with standard medical management?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Bayesian Superiority</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Bayesian response-adaptive design:</strong> Primary is utility-weighted mRS at 180 days; superiority by posterior P(sup) = 0.981 (threshold 0.975). No frequentist p-value. The 30-day mortality result shown below is the primary SAFETY endpoint, not the primary EFFICACY endpoint. Anterior basal ganglia subgroup was halted for futility — benefit is in LOBAR ICH.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={9.3}
                controlPct={18.0}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="30-day mortality (primary safety)"
                riskRatio="P(sup)"
                ciLow="0.987"
                ciHigh=""
                pValue="P(sup)=0.981"
                winnerArm="treatment"
              />
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Approx NNT</span>
                <span className="text-sm font-semibold text-slate-700">~12</span>
                <span className="text-xs text-slate-500">approximate, from primary safety endpoint (30-day mortality); Bayesian primaries do not yield valid NNT</span>
              </div>
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '300 patients at 37 US hospitals (59 trained neurosurgeons; BrainPath + Myriad, NICO Corporation). Bayesian adaptive RAR design. Enrolled Dec 2016 – Aug 2022. Published NEJM 2024;390(14):1277–1289.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/mistie-iii-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">MISTIE III</Link>
              <Link to="/calculators/ich-score" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ICH Score</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="ENRICH" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'MISTIE III', href: '/trials/mistie-iii-trial' }, { label: 'ICH Score', href: '/calculators/ich-score' }]}
            citation={trialMetadata.source} doi={trialMetadata.doi} trialResult={trialMetadata.trialResult} />
        )}
      </div>
    );
  }

  // ── B_PROUD: W8.2-followup Archetype A rebuild (Quasi-experimental) ─────
  if (trialId === 'b-proud-trial' && trialMetadata) {
    const categoryBadgeLabel = trialMetadata.listCategory
      ? trialMetadata.listCategory.charAt(0).toUpperCase() + trialMetadata.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>B_PROUD</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In suspected acute ischemic stroke dispatched in Berlin's EMS system, does mobile stroke unit dispatch improve 90-day disability outcomes compared with conventional ambulance alone? (Allocation by MSU availability — not patient-level randomization.)
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source}{trialMetadata.doi && (<>{' '}·{' '}<a href={`https://doi.org/${trialMetadata.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{trialMetadata.doi}</a></>)}{' '}· {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {trialMetadata.designDisclaimer && (
            <aside className="border-l-2 border-amber-400 pl-3 mt-3 mb-6">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">
                Design quality
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {trialMetadata.designDisclaimer.text}
              </p>
            </aside>
          )}
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Ordinal mRS Shift</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Quasi-experimental — interpret as association, not causation:</strong> Allocation was by MSU availability, not patient-level randomization. Per clinical-trial-audit, NNT is not displayed for observational/registry designs because residual confounding prevents causal absolute-risk-difference interpretation. Primary analysis used ordinal mRS shift (common OR 0.71 for worse mRS).
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={80.3}
                controlPct={78.0}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0–3 or living at home (coprimary)"
                riskRatio="cOR 0.71"
                ciLow="0.58"
                ciHigh="0.86"
                pValue={trialMetadata.stats.pValue.value}
                winnerArm="treatment"
              />
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                NNT suppressed (quasi-experimental design — see clinical-trial-audit rules)
              </div>
            </div>
          </div>
          {trialMetadata.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={trialMetadata.howToReadChart} />}
          {trialMetadata.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={trialMetadata.howToInterpret} />}
          {renderSafetySection(trialMetadata)}
          {renderTrialDesign(trialMetadata, '1,543 patients in Berlin (3 MSU base stations, 7am–11pm operating hours). Enrolled Feb 2017 – Oct 2019. Published JAMA 2021;325(5):454–466.')}
          {trialMetadata.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/best-msu-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">BEST-MSU (US)</Link>
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {trialMetadata.bottomLineSummary && trialMetadata.bedsidePearl && (
          <BottomLineDrawer trialName="B_PROUD" body={trialMetadata.bottomLineSummary} bedsidePearl={trialMetadata.bedsidePearl}
            seeAlsoLinks={[{ label: 'BEST-MSU (US)', href: '/trials/best-msu-trial' }, { label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ESCAPE-MeVO</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={trialMetadata.efficacyResults.treatment.percentage}
                controlPct={trialMetadata.efficacyResults.control.percentage}
                treatmentLabel={trialMetadata.efficacyResults.treatment.name}
                controlLabel={trialMetadata.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days"
                riskRatio="0.95"
                ciLow="0.82"
                ciHigh="1.10"
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/calculators/nihss" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">NIHSS Calculator</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="escape-mevo-trial" />
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ELAN</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>CHANCE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>POINT</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SOCRATES</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SPS3</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SPARCL</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>THALES</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>EAGLE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secondary outcome: ≥15-letter improvement (dichotomized)</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>BEST-MSU</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute stroke in the United States, does prehospital mobile stroke unit care (with on-board CT, vascular imaging, and thrombolysis capability) improve excellent 90-day functional outcome (mRS 0-1) in tPA-eligible patients compared with standard EMS transport?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>AcT</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ARAMIS</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>NOR-TEST</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>NOR-TEST 2</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>PRISMS</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>PROST</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>PROST-2</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>RAISE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TASTE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>THAWS</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TRACE-2</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TRACE-III</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isPositive ? '#1746A2' : '#1e293b' }}>
              {trialMetadata.title}: {trialMetadata.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with ICA or MCA occlusion presenting 4.5 to 24 hours from last known well (including wake-up and unwitnessed stroke) with salvageable tissue on perfusion imaging and no access to endovascular thrombectomy, does IV tenecteplase 0.25 mg/kg improve excellent functional outcome (mRS 0-1) at 90 days compared with standard medical treatment?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {trialMetadata.source} · {trialMetadata.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(trialMetadata)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome</p>
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
              {trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">NNT</span>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{trialMetadata.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">

        {/* Section 1: Sticky header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>INTERACT4</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}

          {/* Section 8: See also */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DISTAL</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Randomized December 2021 to July 2024 at 55 sites across 11 countries (predominantly Europe). International, assessor-blinded RCT. Any EVT technique allowed; treated within 24 hours of last known well.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/escape-mevo-trial" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">ESCAPE-MeVO</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="distal-trial" />
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>MR ASAP</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>RACECAT</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TRIAGE-STROKE</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ATTEST-2</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TIMELESS</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TWIST</span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">

        {/* Sticky header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>RIGHT-2</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome · mRS Shift at 90 Days</p>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety Signals</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}

          {/* See also */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">

        {/* Section 1: Sticky header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0"
              aria-label="Back to Neuro Trials"
            >
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>
                WEAVE
              </span>
            </button>
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
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                borderLeft: '2px solid #1746A2',
                borderRadius: '0 10px 10px 0',
                padding: '16px 18px',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">
                Bedside Pearl
              </p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">
                {trialMetadata.bedsidePearl}
              </p>
            </div>
          )}

          {/* Section 9: See also */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>MR CLEAN</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ESCAPE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>REVASCAT</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>EXTEND-IA</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secondary outcome: mRS 0-2 at 90 days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SWIFT PRIME</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Distribution at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>THRACE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-2 at 3 Months</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>LASTE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TENSION</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>CHOICE</span>
            </button>
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
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-1 at 90 Days</p>
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
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
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

  // ── DIRECT-MT: Batch 3 Archetype A NI (TRIALS_SPEC v1.1 §3) ─────────────
  if (trialId === 'direct-mt-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DIRECT-MT</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In alteplase-eligible patients with anterior circulation LVO presenting within 4.5 hours, is direct endovascular thrombectomy non-inferior to IV alteplase followed by thrombectomy for 90-day functional outcome?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (anterior circulation LVO, eligible for IV alteplase)</p>
            </div>
            {/* NI amber banner — mandatory for non-inferiority design */}
            <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '10px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Non-inferiority design</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                This trial tested whether direct EVT is <strong>no worse than</strong> bridging alteplase, not whether it is better. A non-inferior result supports equivalence, not superiority. The CI just cleared the pre-specified margin.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days"
                riskRatio="cOR 1.07"
                ciLow="0.81"
                ciHigh="1.40"
                pValue="0.04 (NI)"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Multicenter Chinese noninferiority RCT enrolling 656 patients at 41 tertiary centers (Yang NEJM 2020). Open-label with blinded endpoint assessment.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/devt-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DEVT</Link>
              <Link to="/trials/swift-direct-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">SWIFT DIRECT</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="DIRECT-MT"
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

  // ── DEVT: Batch 3 Archetype A NI (TRIALS_SPEC v1.1 §3) ──────────────────
  if (trialId === 'devt-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DEVT</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In alteplase-eligible patients with proximal anterior circulation LVO presenting within 4.5 hours, is direct endovascular thrombectomy non-inferior to IV alteplase followed by thrombectomy for 90-day functional independence (mRS 0-2)?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-2 at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (proximal anterior circulation LVO, alteplase-eligible)</p>
            </div>
            {/* NI amber banner */}
            <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '10px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Non-inferiority design: wide margin</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                Non-inferiority margin was -10 percentage points, clinically wide. Met NI but cannot exclude meaningful harm. The numerical advantage for direct EVT (54.3% vs 46.6%) is not superiority. Trial was stopped early.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days"
                riskRatio="RD +7.7 pp"
                ciLow="-2.9 pp"
                ciHigh="18.2 pp"
                pValue="0.003 (NI)"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Multicenter Chinese noninferiority RCT enrolling 234 patients at 33 stroke centers between 2018 and 2020 (Zi JAMA 2021). Stopped early for efficacy of non-inferiority.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/direct-mt-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DIRECT-MT</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="DEVT"
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

  // ── COMPASS: Batch 3 Archetype A NI (TRIALS_SPEC v1.1 §3) ───────────────
  if (trialId === 'compass-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>COMPASS</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO treated within 6 hours, is aspiration first-pass technique non-inferior to stent-retriever first-line for 90-day functional outcome (mRS 0-2)?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-2 at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">All randomized patients (anterior circulation LVO, within 6 hours)</p>
            </div>
            {/* NI amber banner */}
            <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '10px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Non-inferiority design: technique equivalence</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                This trial shows aspiration-first is <strong>no worse than</strong> stent-retriever-first for functional outcome, not that either technique is superior. Aspiration achieved lower first-pass reperfusion (68.9% vs 76.3%) but equivalent clinical outcomes.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days"
                riskRatio="RD +2 pp"
                ciLow="-8 pp"
                ciHigh="11 pp"
                pValue="0.0014 (NI)"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'Multicenter randomized open-label non-inferiority trial enrolling 270 patients at 15 North American sites (Turk Lancet 2019). Blinded outcome assessment.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/aster-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ASTER</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="COMPASS"
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

  // ── ASTER: Batch 3 Archetype A NEUTRAL (TRIALS_SPEC v1.1 §3) ────────────
  if (trialId === 'aster-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ASTER</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO treated within 6 hours, does first-line contact aspiration produce higher rates of successful revascularization than first-line stent retriever?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Successful Revascularization (mTICI 2b-3)</p>
              <p className="text-xs text-slate-500 mt-0.5">Procedural endpoint — not a clinical outcome measure</p>
            </div>
            {/* Procedural-endpoint amber banner */}
            <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '10px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Procedural endpoint, not clinical outcome</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                The chart shows end-of-procedure revascularization rates, not 90-day disability. mRS 0-2 at 90 days was 45.3% (aspiration) vs 50.3% (stent retriever); P = 0.19. No significant clinical difference between strategies.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mTICI 2b-3 Revascularization"
                riskRatio="RD +2.3 pp"
                ciLow=""
                ciHigh=""
                pValue="0.53"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'French multicenter randomized open-label blinded-endpoint (PROBE) trial enrolling 381 patients at 8 comprehensive stroke centers between 2015 and 2016 (Lapergue JAMA 2017).')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/compass-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">COMPASS</Link>
              <Link to="/trials/aster2-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ASTER2</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="ASTER"
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

  // ── ASTER2: Batch 3 Archetype A NEUTRAL (TRIALS_SPEC v1.1 §3) ───────────
  if (trialId === 'aster2-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ASTER2</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with anterior circulation LVO treated within 8 hours, does combined first-pass contact aspiration plus stent retriever achieve higher near-total reperfusion (eTICI 2c-3) than stent retriever alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Near-Total Reperfusion (eTICI 2c-3)</p>
              <p className="text-xs text-slate-500 mt-0.5">Procedural endpoint — not a clinical outcome measure</p>
            </div>
            {/* Procedural-endpoint amber banner */}
            <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '10px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Procedural endpoint, not clinical outcome</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                The chart shows end-of-procedure eTICI 2c-3 reperfusion rates. mRS 0-2 at 90 days was 48.5% (combined) vs 49.5% (stent retriever alone); no significant clinical difference. Longer procedure time with combined technique.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="eTICI 2c-3 Reperfusion"
                riskRatio="RD +6.6 pp"
                ciLow=""
                ciHigh=""
                pValue="0.17"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, 'French multicenter randomized open-label blinded-endpoint trial enrolling 408 patients at 11 comprehensive stroke centers between 2017 and 2018 (Lapergue JAMA 2021).')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/aster-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">ASTER</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="ASTER2"
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

  // ── SKIP: W6.6.2 Archetype A (TRIALS_SPEC v1.0) ─────────────────────────
  if (trialId === 'skip-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SKIP</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In Japanese patients with LVO stroke eligible for IV thrombolysis, does mechanical thrombectomy alone produce outcomes non-inferior to low-dose alteplase plus thrombectomy at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#92400e' }}>Non-inferiority design: margin not met</p>
            <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>SKIP tested whether direct EVT was acceptably close to low-dose alteplase (0.6 mg/kg) plus EVT (NI margin: OR lower CI greater than 0.75). Non-inferiority was not demonstrated: the lower CI bound (0.72) fell below the margin. Similar point estimates (59.4% vs 57.3%) do not establish equivalence.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-2 at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">LVO stroke within 4.5 h; Japanese low-dose alteplase (0.6 mg/kg) comparator</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days"
                riskRatio="OR 1.09"
                ciLow="0.72"
                ciHigh="1.64"
                pValue="0.18 (NI)"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '204 patients at 23 stroke networks across Japan. Open-label randomized non-inferiority trial. Enrolled 2017 to 2019. IV alteplase at Japanese approved dose of 0.6 mg/kg (not the 0.9 mg/kg dose used in European and American trials). Published JAMA 2021.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/direct-mt-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DIRECT-MT</Link>
              <Link to="/trials/swift-direct-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">SWIFT DIRECT</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="SKIP"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'Stroke Code pathway', href: '/guide/stroke-code' }, { label: 'DIRECT-MT', href: '/trials/direct-mt-trial' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── MR CLEAN-NO IV: W6.6.2 Archetype B ordinalStats (TRIALS_SPEC v1.1 §3) ──
  if (trialId === 'mr-clean-no-iv-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>MR CLEAN-NO IV</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients presenting directly to an EVT-capable center who are eligible for both IV alteplase and thrombectomy, does direct EVT produce superior or non-inferior outcomes to alteplase 0.9 mg/kg plus EVT?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#92400e' }}>Superiority and non-inferiority: both not demonstrated</p>
            <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>MR CLEAN-NO IV tested both superiority and non-inferiority of direct EVT vs alteplase 0.9 mg/kg plus EVT. Neither was met (adjusted common OR 0.84, 95% CI 0.62-1.15, P = 0.28). The point estimate numerically favors bridging therapy; median mRS was 3 (direct EVT) vs 2 (bridging).</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">Direct presenters at EVT-capable centers within 4.5 h</p>
            </div>
            <div className="p-4">
              {tm.ordinalStats && (
                <div className="space-y-4">
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>
                      mRS Ordinal Shift at 90 Days
                    </p>
                    <p style={{ fontSize: 38, fontWeight: 700, color: '#1e293b', lineHeight: 1, marginBottom: 6 }}>
                      cOR {tm.ordinalStats.commonOR}
                    </p>
                    <p style={{ fontSize: 13, color: '#475569' }}>
                      95% CI {tm.ordinalStats.ciLow} to {tm.ordinalStats.ciHigh}
                      {tm.ordinalStats.pValue !== undefined
                        ? (tm.ordinalStats.pValue < 0.001 ? ' · P <0.001' : ` · P = ${tm.ordinalStats.pValue}`)
                        : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 4 }}>
                        Median mRS — Direct EVT
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#475569', lineHeight: 1.1 }}>3</p>
                    </div>
                    <div style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369a1', marginBottom: 4 }}>
                        Median mRS — Bridging
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#0369a1', lineHeight: 1.1 }}>2</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    Mortality: 20.5% (direct EVT) vs 15.8% (bridging) · sICH: 5.9% vs 5.3%
                  </p>
                </div>
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '539 patients across European centers. Open-label randomized trial. Enrolled 2017 to 2020. Alteplase dose in bridging arm: 0.9 mg/kg (standard Western dose). Published NEJM 2021.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/swift-direct-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">SWIFT DIRECT</Link>
              <Link to="/trials/direct-safe-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DIRECT-SAFE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="MR CLEAN-NO IV"
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

  // ── DIRECT-SAFE: W6.6.2 Archetype A (TRIALS_SPEC v1.0) ──────────────────
  if (trialId === 'direct-safe-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DIRECT-SAFE</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with LVO stroke eligible for IV thrombolysis across Australia, New Zealand, China, and Vietnam, does direct EVT produce outcomes non-inferior to bridging thrombolysis plus EVT within 4.5 hours?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#92400e' }}>Non-inferiority design: margin not met</p>
            <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>DIRECT-SAFE tested whether direct EVT was acceptably close to bridging thrombolysis (NI margin: -12 pp). Non-inferiority was not demonstrated: the lower CI bound (-15.4 pp) crossed the margin. The adjusted risk difference (-5.1%, CI -15.4% to 5.3%) does not establish equivalence.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-2 or Pre-stroke Baseline at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">LVO within 4.5 h; alteplase or tenecteplase in bridging arm</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mRS 0-2 or Pre-stroke Baseline at 90 Days"
                riskRatio="RD -5.1 pp"
                ciLow="-15.4 pp"
                ciHigh="5.3 pp"
                pValue="NI not met"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '295 patients across Australia, New Zealand, China, and Vietnam. PROBE design (open-label, blinded endpoint assessment). Enrolled 2018 to 2021. Bridging arm allowed alteplase or tenecteplase at national standard doses. Published Lancet 2022.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/swift-direct-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">SWIFT DIRECT</Link>
              <Link to="/trials/mr-clean-no-iv-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">MR CLEAN-NO IV</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="DIRECT-SAFE"
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

  // ── SWIFT DIRECT: W6.6.2 Archetype A (TRIALS_SPEC v1.0) ─────────────────
  if (trialId === 'swift-direct-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>SWIFT DIRECT</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients presenting directly to a comprehensive stroke center within 4.5 hours with anterior circulation proximal LVO, does stent-retriever thrombectomy alone produce outcomes non-inferior to alteplase 0.9 mg/kg plus thrombectomy?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#92400e' }}>Non-inferiority design: margin not met</p>
            <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>SWIFT DIRECT tested whether thrombectomy alone was acceptably close to alteplase plus thrombectomy (NI margin: -10 pp). Non-inferiority was not demonstrated: the adjusted RD was -7.3% (95% CI -14.0% to -0.6%). The entire confidence interval is negative; even the most optimistic estimate favors bridging therapy.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS 0-2 at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">Anterior circulation proximal LVO; direct presenters within 4.5 h</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="mRS 0-2 at 90 Days"
                riskRatio="RD -7.3 pp"
                ciLow="-14.0 pp"
                ciHigh="-0.6 pp"
                pValue="NI not met"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '423 patients across European and Canadian comprehensive stroke centers. Open-label randomized non-inferiority trial. Enrolled 2018 to 2021. Stent-retriever technique per protocol. Published Lancet 2022.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/mr-clean-no-iv-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">MR CLEAN-NO IV</Link>
              <Link to="/trials/direct-safe-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DIRECT-SAFE</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="SWIFT DIRECT"
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

  // ── RESCUE BT: W6.6.2 Archetype B ordinalStats (TRIALS_SPEC v1.1 §3) ─────
  if (trialId === 'rescue-bt-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>RESCUE BT</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute LVO stroke undergoing thrombectomy within 24 hours, does peri-procedural IV tirofiban improve 90-day functional outcome compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">948 patients; IV tirofiban vs placebo before and during EVT</p>
            </div>
            <div className="p-4">
              {tm.ordinalStats && (
                <div className="space-y-4">
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>
                      mRS Ordinal Shift at 90 Days
                    </p>
                    <p style={{ fontSize: 38, fontWeight: 700, color: '#1e293b', lineHeight: 1, marginBottom: 6 }}>
                      cOR {tm.ordinalStats.commonOR}
                    </p>
                    <p style={{ fontSize: 13, color: '#475569' }}>
                      95% CI {tm.ordinalStats.ciLow} to {tm.ordinalStats.ciHigh}
                      {tm.ordinalStats.pValue !== undefined
                        ? (tm.ordinalStats.pValue < 0.001 ? ' · P <0.001' : ` · P = ${tm.ordinalStats.pValue}`)
                        : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 4 }}>
                        mRS 0-1 — Tirofiban
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#475569', lineHeight: 1.1 }}>36.3%</p>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 4 }}>
                        mRS 0-1 — Placebo
                      </p>
                      <p style={{ fontSize: 32, fontWeight: 700, color: '#475569', lineHeight: 1.1 }}>32.4%</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    sICH: 9.7% (tirofiban) vs 6.4% (placebo) · Mortality: 18.3% vs 17.3%
                  </p>
                </div>
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '948 patients at 55 hospitals in China. Double-blind placebo-controlled randomized trial. Enrolled 2018 to 2021. Tirofiban: 10 mcg/kg IV bolus then 0.15 mcg/kg/min for 24 hours. Published JAMA 2022.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="RESCUE BT"
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

  // ── BP-TARGET: W6.6.3 Archetype A (TRIALS_SPEC v1.0) ────────────────────
  if (trialId === 'bp-target-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>BP-TARGET</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute LVO stroke who achieved successful recanalization after EVT, does targeting systolic blood pressure 100-129 mm Hg reduce post-reperfusion hemorrhage compared with a standard target of 130-185 mm Hg in the first 24 hours?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Radiographic iPH at 24-36 hours</p>
              <p className="text-xs text-slate-500 mt-0.5">324 patients; SBP 100-129 mm Hg vs 130-185 mm Hg after successful EVT</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="Any Radiographic iPH at 24-36 hours"
                riskRatio="aOR 0.96"
                ciLow="0.60"
                ciHigh="1.51"
                pValue="0.84"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '324 patients at four French academic stroke centers. Open-label randomized controlled trial with blinded endpoint assessment. Intensive BP target (SBP 100-129 mm Hg) achieved within 1 hour and maintained for 24 hours. Published Lancet Neurol 2021.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/best-ii-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">BEST-II</Link>
              <Link to="/trials/optimal-bp-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">OPTIMAL-BP</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="BP-TARGET"
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

  // ── BEST-II: W6.6.3 Archetype A (TRIALS_SPEC v1.0) — Futility design ─────
  if (trialId === 'best-ii-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>BEST-II</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              After successful EVT, does targeting a lower systolic blood pressure (SBP less than 140 or less than 160 mm Hg) improve utility-weighted functional outcomes at 90 days compared with permissive control (SBP at or below 180 mm Hg)?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#92400e' }}>Futility design: low predicted success for lower BP targets</p>
            <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>BEST-II was a phase 2 futility trial. Neither lower target formally crossed the futility boundary (P=0.93), but predicted success in a future superiority trial was only 14-25% for lower targets. The highest-target arm (SBP &lt;=180 mm Hg) produced the best utility-weighted mRS (0.58 vs 0.51). OPTIMAL-BP subsequently confirmed functional harm from SBP &lt;140 mm Hg.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Utility-Weighted mRS at 90 days (x100)</p>
              <p className="text-xs text-slate-500 mt-0.5">120 patients; 3-arm futility trial: SBP &lt;140, &lt;160, or &lt;=180 mm Hg after successful EVT</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="Utility-Weighted mRS at 90 days (x100)"
                riskRatio="Delta -0.07"
                ciLow="N/A"
                ciHigh="N/A"
                pValue="Futility P=0.93"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '120 patients at three US comprehensive stroke centers. Phase 2 open-label randomized futility trial with three arms. BP targeting initiated within 60 minutes of successful EVT and maintained for 24 hours. Published JAMA 2023.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/bp-target-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">BP-TARGET</Link>
              <Link to="/trials/optimal-bp-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">OPTIMAL-BP</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="BEST-II"
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

  // ── OPTIMAL-BP: W6.6.3 Archetype A (TRIALS_SPEC v1.0) — HARM framing ─────
  if (trialId === 'optimal-bp-trial' && trialMetadata) {
    const tm = trialMetadata;
    const isHarm = tm.trialResult === 'HARM';
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>OPTIMAL-BP</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: isHarm ? '#7f1d1d' : '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with LVO stroke who achieved successful recanalization after EVT, does intensive systolic BP management targeting SBP less than 140 mm Hg improve functional independence at 3 months compared with conventional management targeting SBP 140-180 mm Hg? (Stopped by DSMB for harm.)
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Functional Independence (mRS 0-2) at 3 Months</p>
            </div>
            <div className="p-4">
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-800 leading-relaxed">
                  <strong>STOPPED FOR SAFETY:</strong> Intensive BP management (SBP &lt;140 mm Hg) led to significantly lower functional independence (39.4% vs 54.4%, adjusted OR 0.56, P=0.03) and nearly 8-fold higher malignant cerebral edema (adjusted OR 7.88, P=0.01) after successful EVT. The DSMB terminated the trial at 306 of 450 planned patients.
                </p>
              </div>
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="Functional Independence (mRS 0-2) at 3 Months"
                riskRatio="RD -15.1 pp"
                ciLow="-26.2 pp"
                ciHigh="-3.9 pp"
                pValue="0.03 (HARM)"
                winnerArm="control"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '306 patients at 19 South Korean stroke centers. Open-label randomized trial with blinded endpoint assessment. Stopped early by DSMB for safety at 68% of planned enrollment. Intensive BP strategy (SBP &lt;140 mm Hg) maintained for 24 hours. Published JAMA 2023.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#FEF2F2', borderLeft: '3px solid #b91c1c', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-2">Bedside Pearl</p>
              <p className="text-sm text-red-900 leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/bp-target-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">BP-TARGET</Link>
              <Link to="/trials/best-ii-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">BEST-II</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="OPTIMAL-BP"
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

  // ── ENCHANTED: W6.6.3 Archetype B (TRIALS_SPEC v1.0) — primary null ───────
  if (trialId === 'enchanted-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ENCHANTED</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute ischemic stroke eligible for IV alteplase, does intensive SBP lowering (target 130-140 mm Hg for 72 hours) during and after thrombolysis improve 90-day functional outcomes compared with guideline management (SBP below 180 mm Hg)?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">2196 patients; intensive SBP 130-140 mm Hg vs guideline below 180 mm Hg for 72 hours</p>
            </div>
            <div className="p-4">
              {tm.ordinalStats && (
                <div className="space-y-4">
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>
                      mRS Ordinal Shift at 90 Days (Primary)
                    </p>
                    <p style={{ fontSize: 38, fontWeight: 700, color: '#1e293b', lineHeight: 1, marginBottom: 6 }}>
                      OR {tm.ordinalStats.commonOR}
                    </p>
                    <p style={{ fontSize: 13, color: '#475569' }}>
                      95% CI {tm.ordinalStats.ciLow} to {tm.ordinalStats.ciHigh}
                      {tm.ordinalStats.pValue !== undefined ? ` · P = ${tm.ordinalStats.pValue}` : ''}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Pre-specified secondary — any ICH at 24 hours:</strong> 14.8% (intensive) vs 18.7% (guideline), OR 0.75, P=0.014. Significant reduction in hemorrhage was not accompanied by improvement in the primary functional outcome.
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    Mortality similar between groups · 110 sites, 15 countries
                  </p>
                </div>
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '2196 patients at 110 sites across 15 countries. Open-label trial with blinded endpoint assessment. Intensive SBP target 130-140 mm Hg vs guideline less than 180 mm Hg for 72 hours. Published Lancet 2019.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
              <Link to="/trials/bp-target-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">BP-TARGET</Link>
              <Link to="/trials/optimal-bp-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">OPTIMAL-BP</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="ENCHANTED"
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

  // ── ESCAPE-NA1: W6.6.3 Archetype A (TRIALS_SPEC v1.0) ───────────────────
  if (trialId === 'escape-na1-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>ESCAPE-NA1</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with LVO stroke undergoing EVT within 12 hours with favorable imaging, does a single IV dose of nerinetide improve functional independence (mRS 0-2) at 90 days compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Functional Independence (mRS 0-2) at 90 Days</p>
              <p className="text-xs text-slate-500 mt-0.5">1105 patients; nerinetide vs placebo before or during EVT within 12 hours</p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="Functional Independence (mRS 0-2) at 90 Days"
                riskRatio="RR 1.04"
                ciLow="0.96"
                ciHigh="1.13"
                pValue="0.35"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '1105 patients at 48 hospitals across 8 countries. Double-blind placebo-controlled randomized trial. Single IV nerinetide dose before or during EVT. Treatment window up to 12 hours with favorable imaging. Published Lancet 2020.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="ESCAPE-NA1"
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

  // ── CHARM: W6.6.3 Archetype B (TRIALS_SPEC v1.0) — stopped early, COVID ──
  if (trialId === 'charm-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>CHARM</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with large hemispheric infarction (ASPECTS 1-5 or DWI core 80-300 mL), does IV glibenclamide 8.6 mg over 72 hours improve 90-day functional outcomes compared with placebo?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#92400e' }}>Stopped early: findings are inconclusive</p>
            <p className="text-sm leading-relaxed" style={{ color: '#78350f' }}>CHARM was halted before planned enrollment (535 of approximately 750 patients) due to COVID-19 operational disruptions. The trial was neither futile nor stopped for safety -- it was underpowered. Results should be interpreted with this context: the confidence interval (0.80-1.71) excludes neither meaningful benefit nor meaningful harm.</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — mRS Ordinal Shift at 90 Days (age 18-70)</p>
              <p className="text-xs text-slate-500 mt-0.5">535 patients; IV glibenclamide vs placebo within 10 hours of onset</p>
            </div>
            <div className="p-4">
              {tm.ordinalStats && (
                <div className="space-y-4">
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 6 }}>
                      mRS Ordinal Shift at 90 Days
                    </p>
                    <p style={{ fontSize: 38, fontWeight: 700, color: '#1e293b', lineHeight: 1, marginBottom: 6 }}>
                      cOR {tm.ordinalStats.commonOR}
                    </p>
                    <p style={{ fontSize: 13, color: '#475569' }}>
                      95% CI {tm.ordinalStats.ciLow} to {tm.ordinalStats.ciHigh}
                      {tm.ordinalStats.pValue !== undefined ? ` · P = ${tm.ordinalStats.pValue}` : ''}
                    </p>
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    Mortality: numerically higher with glibenclamide · Hypoglycemia: 6% vs 2% · Stopped early for COVID-19
                  </p>
                </div>
              )}
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '535 patients at 143 stroke centers across 21 countries. Phase 3 double-blind placebo-controlled trial. IV glibenclamide 8.6 mg over 72 hours started within 10 hours of onset. Stopped early for COVID-19 operational disruptions. Published Lancet Neurol 2024.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="CHARM"
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

  // ── DECIMAL: W6.6.3 Archetype A (TRIALS_SPEC v1.0) — neutral, mortality benefit ──
  if (trialId === 'decimal-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DECIMAL</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients aged 18-55 with malignant MCA infarction, does early decompressive hemicraniectomy plus medical therapy reduce mortality at 6 months compared with medical therapy alone?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mortality Outcome — 6-Month Survival</p>
              <p className="text-xs text-slate-500 mt-0.5">38 patients; decompressive hemicraniectomy vs medical therapy alone</p>
            </div>
            <div className="p-4 space-y-3">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="6-Month Survival"
                riskRatio="ARR 52.8 pp"
                ciLow="N/A"
                ciHigh="N/A"
                pValue="0.001"
                winnerArm="treatment"
              />
              <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                <p className="text-xs leading-relaxed" style={{ color: '#78350f' }}>Primary endpoint mRS less than or equal to 3 at 6 months was not statistically significant (P=0.18) due to small sample size of 38 patients. Mortality reduction is the secondary endpoint that reached significance.</p>
              </div>
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '38 patients at multiple French centers (planned 70; stopped early for pooled analysis). Sequential design with blinded primary endpoint assessment. Patients aged 18-55 with malignant MCA infarction. Randomization within 24-30 hours of onset. Published Stroke 2007.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/destiny-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DESTINY</Link>
              <Link to="/trials/hamlet-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">HAMLET</Link>
              <Link to="/trials/destiny-ii-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DESTINY II</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="decimal-trial" />
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="DECIMAL"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'DESTINY', href: '/trials/destiny-trial' }, { label: 'HAMLET', href: '/trials/hamlet-trial' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── DESTINY: W6.6.3 Archetype A (TRIALS_SPEC v1.0) — neutral, mortality benefit ──
  if (trialId === 'destiny-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DESTINY</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients aged 18-60 with malignant MCA infarction, does early decompressive hemicraniectomy reduce mortality and improve functional outcomes compared with conservative management?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mortality Outcome — 30-Day and 6-Month Survival</p>
              <p className="text-xs text-slate-500 mt-0.5">32 patients; early hemicraniectomy vs conservative therapy</p>
            </div>
            <div className="p-4 space-y-3">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="30-Day and 6-Month Survival"
                riskRatio="ARR 41 pp"
                ciLow="N/A"
                ciHigh="N/A"
                pValue="0.02"
                winnerArm="treatment"
              />
              <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                <p className="text-xs leading-relaxed" style={{ color: '#78350f' }}>Primary endpoint mRS 0-3 at 6 months was not statistically significant (P=0.23) due to small sample size of 32 patients. Mortality reduction is the secondary endpoint that reached significance.</p>
              </div>
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '32 patients at multiple German centers (planned 60; stopped early for pooled analysis). Prospective sequential design. Patients aged 18-60 with malignant MCA infarction. Randomization within 36 hours of onset. Published Stroke 2007.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/decimal-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DECIMAL</Link>
              <Link to="/trials/hamlet-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">HAMLET</Link>
              <Link to="/trials/destiny-ii-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DESTINY II</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="destiny-trial" />
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="DESTINY"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'DECIMAL', href: '/trials/decimal-trial' }, { label: 'HAMLET', href: '/trials/hamlet-trial' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── HAMLET: W6.6.3 Archetype A (TRIALS_SPEC v1.0) — neutral, 48h window ─
  if (trialId === 'hamlet-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>HAMLET</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients aged 18-60 with space-occupying hemispheric infarction randomized within 96 hours, does decompressive surgery reduce death and improve functional independence compared with best medical treatment?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mortality Outcome — 1-Year Survival</p>
              <p className="text-xs text-slate-500 mt-0.5">64 patients; surgical decompression vs best medical treatment (enrollment up to 96 hours)</p>
            </div>
            <div className="p-4 space-y-3">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="1-Year Survival"
                riskRatio="ARR 38 pp"
                ciLow="N/A"
                ciHigh="N/A"
                pValue="0.002"
                winnerArm="treatment"
              />
              <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                <p className="text-xs leading-relaxed" style={{ color: '#78350f' }}>Primary endpoint mRS 0-3 at 1 year was neutral overall. Functional benefit was concentrated in patients operated within 48 hours; patients enrolled after 48 hours diluted the functional treatment effect.</p>
              </div>
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '64 patients at multiple Dutch centers. Multicenter open randomized trial. Patients aged 18-60 randomized within 4 days (96 hours) of stroke onset. Primary endpoint mRS 0-3 at 1 year. Published Lancet Neurol 2009.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/decimal-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DECIMAL</Link>
              <Link to="/trials/destiny-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DESTINY</Link>
              <Link to="/trials/destiny-ii-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DESTINY II</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="hamlet-trial" />
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="HAMLET"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'DECIMAL', href: '/trials/decimal-trial' }, { label: 'DESTINY', href: '/trials/destiny-trial' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── DESTINY II: W6.6.3 POSITIVE — QoL caveat equal weight (Modification 1) ─
  if (trialId === 'destiny-ii-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>DESTINY II</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients aged 61 or older with malignant MCA infarction, does early decompressive hemicraniectomy within 48 hours improve survival and functional outcome compared with conservative intensive care?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Survival Without Severe Disability (mRS 0-4) at 6 Months</p>
              <p className="text-xs text-slate-500 mt-0.5">112 patients aged 61-82; early hemicraniectomy vs conservative intensive care</p>
            </div>
            {/* Mandatory QoL caveat banner — equal weight to the positive result per Modification 1 */}
            <div style={{ background: '#fffbeb', borderLeft: '3px solid #f59e0b', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '12px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Primary endpoint met — but no patient achieved good functional outcome</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                0% of patients in <strong>either group</strong> achieved mRS 0-2 (independent function). Virtually all surgical survivors who met the primary endpoint had mRS 4 (severe disability, dependent for most bodily needs). Surgery reduces the chance of dying from 70% to 33% — it does not restore function.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="Survival Without Being Bedbound or Dead (mRS 0-4) at 6 Months"
                riskRatio="OR 2.91"
                ciLow="1.06"
                ciHigh="7.49"
                pValue="0.04"
                winnerArm="treatment"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '112 patients aged 61-82 at multiple German centers (planned 188; stopped early for enrollment difficulty). Open-label randomized trial with blinded outcome assessment. Surgery within 48 hours of stroke onset. Published NEJM 2014.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/decimal-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DECIMAL (under 56)</Link>
              <Link to="/trials/destiny-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">DESTINY (under 61)</Link>
              <Link to="/trials/hamlet-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">HAMLET (under 61)</Link>
            </div>
          </div>
          <TrialChainTimeline trialId="destiny-ii-trial" />
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="DESTINY II"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'DECIMAL', href: '/trials/decimal-trial' }, { label: 'DESTINY', href: '/trials/destiny-trial' }, { label: 'HAMLET', href: '/trials/hamlet-trial' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── TIMING: W6.6.3 Archetype A NI-met (TRIALS_SPEC v1.0) ─────────────────
  if (trialId === 'timing-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>TIMING</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with acute AF-related ischemic stroke, is early NOAC initiation within 4 days non-inferior to delayed initiation (5-10 days) for the composite of recurrent stroke, symptomatic ICH, or death at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Composite at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">888 patients; early NOAC within 4 days vs delayed 5-10 days after AF-related stroke</p>
            </div>
            <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '10px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Non-inferiority design</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                This trial tested whether early NOAC is <strong>no worse than</strong> delayed initiation, not whether it is better. Non-inferiority met (P=0.004 for NI). Zero symptomatic ICH in either arm.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="Composite: Recurrent Stroke, sICH, or Death at 90 Days"
                riskRatio="RD -1.79 pp"
                ciLow="N/A"
                ciHigh="N/A"
                pValue="0.004 (NI)"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '888 patients randomized via the Swedish Stroke Register. Registry-based open-label randomized noninferiority trial. NOAC started within 4 days (early) or 5-10 days (delayed). Published Circulation 2022.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/optimas-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">OPTIMAS</Link>
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="TIMING"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'OPTIMAS', href: '/trials/optimas-trial' }, { label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── OPTIMAS: W6.6.3 Archetype A NI-met (TRIALS_SPEC v1.0) ────────────────
  if (trialId === 'optimas-trial' && trialMetadata) {
    const tm = trialMetadata;
    const categoryBadgeLabel = tm.listCategory ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1) : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>OPTIMAS</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadgeLabel}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1e293b' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
              In patients with AF-related acute ischemic stroke, is early DOAC initiation within 4 days non-inferior to delayed initiation (7-14 days) for the composite of recurrent stroke, symptomatic ICH, or systemic embolism at 90 days?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}{tm.doi && (<>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>)}{' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>
          {renderPopulationSection(tm)}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Outcome — Composite at 90 Days (Non-inferiority)</p>
              <p className="text-xs text-slate-500 mt-0.5">3621 patients at 100 UK hospitals; early DOAC within 4 days vs delayed 7-14 days</p>
            </div>
            <div style={{ background: '#FFFBEB', borderLeft: '3px solid #D97706', margin: '12px 16px 0', borderRadius: '0 6px 6px 0', padding: '10px 14px' }} role="note">
              <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Non-inferiority design</p>
              <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
                This trial tested whether early DOAC is <strong>no worse than</strong> delayed initiation, not whether it is better. Event rates were identical (3.3% vs 3.3%). Non-inferiority met (P=0.0003); superiority was not demonstrated.
              </p>
            </div>
            <div className="p-4">
              <DeltaBandChart
                treatmentPct={tm.efficacyResults.treatment.percentage}
                controlPct={tm.efficacyResults.control.percentage}
                treatmentLabel={tm.efficacyResults.treatment.name}
                controlLabel={tm.efficacyResults.control.name}
                endpoint="Composite: Recurrent Stroke, sICH, or Systemic Embolism at 90 Days"
                riskRatio="RD 0.000"
                ciLow="N/A"
                ciHigh="N/A"
                pValue="0.0003 (NI)"
                winnerArm="none"
              />
            </div>
          </div>
          {tm.howToReadChart && <TeachingWell mode="qa" title="How to read this chart" items={tm.howToReadChart} />}
          {tm.howToInterpret && <TeachingWell mode="interpret" title="How to interpret this trial" sections={tm.howToInterpret} />}
          {renderTrialDesign(tm, '3621 patients at 100 UK hospitals (2019-2024). Multicenter open-label blinded-endpoint phase 4 randomized trial. Early DOAC within 4 days vs delayed 7-14 days. Gatekeeper design: NI tested first, then superiority. Published Lancet 2024.')}
          {tm.bedsidePearl && (
            <div style={{ background: '#EEF2FF', borderLeft: '2px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1746A2] mb-2">Bedside Pearl</p>
              <p className="text-sm text-[#0E2D6B] leading-relaxed">{tm.bedsidePearl}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/trials/timing-trial" className="inline-flex items-center gap-1 text-xs border border-slate-300 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">TIMING</Link>
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">Stroke Code pathway</Link>
            </div>
          </div>
        </div>
        {tm.bottomLineSummary && tm.bedsidePearl && (
          <BottomLineDrawer
            trialName="OPTIMAS"
            body={tm.bottomLineSummary}
            bedsidePearl={tm.bedsidePearl}
            seeAlsoLinks={[{ label: 'TIMING', href: '/trials/timing-trial' }, { label: 'Stroke Code pathway', href: '/guide/stroke-code' }]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  }

  // ── Stub helper — shared layout for §7c predecessor reference pages ──────
  const renderStubPage = (
    tm: TrialMetadata,
    shortName: string,
    outcomeSectionLabel: string,
    outcomeSectionMeta: string,
    statLabel: string,
    statValue: string,
    ciValue: string,
    pLabel: string,
  ) => {
    const categoryBadge = tm.listCategory
      ? tm.listCategory.charAt(0).toUpperCase() + tm.listCategory.slice(1)
      : 'Trial';
    return (
      <div className="min-h-dvh bg-slate-50 pb-28">
        {/* Sticky header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button type="button" onClick={handleBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1746A2] transition-colors cursor-pointer bg-transparent border-0" aria-label="Back to Neuro Trials">
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}>{shortName}</span>
            </button>
            <span className="text-xs px-2.5 py-0.5 bg-[#EEF2FF] text-[#1746A2] rounded-full font-semibold">{categoryBadge}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Mandatory amber historical-reference banner (TRIALS_SPEC §7c.5) */}
          <div
            role="note"
            style={{
              background: '#fffbeb',
              borderLeft: '3px solid #f59e0b',
              borderRadius: '0 6px 6px 0',
              padding: '10px 14px',
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Historical Reference Page
            </p>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
              This is a historical reference page. This trial preceded the modern evidence base. It is presented as a predecessor reference.
              {tm.successorTrialId && (
                <> See{' '}
                  <Link
                    to={`/trials/${tm.successorTrialId}`}
                    style={{ color: '#1746A2', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    {tm.successorTrialDisplay ?? tm.successorTrialId}
                  </Link>
                  {' '}{tm.successorTrialClause ?? 'for current evidence'}.
                </>
              )}
            </p>
          </div>

          {/* H1 + question lede + source */}
          <div>
            <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: '#1746A2' }}>
              {tm.title}: {tm.subtitle}
            </h1>
            {tm.questionLede && (
              <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mt-2">
                {tm.questionLede}
              </p>
            )}
            <p className="text-sm text-slate-500 mt-1">
              {tm.source}
              {tm.doi && (
                <>{' '}·{' '}<a href={`https://doi.org/${tm.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">doi:{tm.doi}</a></>
              )}
              {' '}· {tm.stats.sampleSize.value} patients
            </p>
          </div>

          {/* Population */}
          {renderPopulationSection(tm)}

          {/* Primary outcome — prose-narrative variant (no archetype viz) */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{outcomeSectionLabel}</p>
              <p className="text-xs text-slate-500 mt-0.5">{outcomeSectionMeta}</p>
            </div>
            <div className="p-4 space-y-4">
              {tm.primaryOutcomeProse && (
                <p className="text-sm text-slate-700 leading-relaxed">{tm.primaryOutcomeProse}</p>
              )}
              {/* Stat row */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{statLabel}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{statValue}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>95% CI</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>{ciValue}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Result</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 9999 }}>
                    {pLabel}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 4 }}>
                Visualization not shown for predecessor reference pages. See source paper for figures.
              </p>
            </div>
          </div>

          {/* Trial design narrative */}
          {tm.trialDesignNarrative && (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trial Design</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{tm.trialDesignNarrative}</p>
              </div>
            </div>
          )}

          {/* Safety brief */}
          {tm.safetyBrief && (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{tm.safetyBrief}</p>
              </div>
            </div>
          )}

          {/* See also */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">See also</p>
            <div className="flex flex-wrap gap-2">
              {tm.successorTrialId && (
                <Link to={`/trials/${tm.successorTrialId}`} className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">
                  {tm.successorTrialDisplay ?? tm.successorTrialId} (modern successor)
                </Link>
              )}
              <Link to="/guide/stroke-code" className="inline-flex items-center gap-1 text-xs border border-[#1746A2] text-[#1746A2] rounded-full px-3 py-1.5 hover:bg-[#EEF2FF] transition-colors">
                Stroke Code pathway
              </Link>
            </div>
          </div>
        </div>

        {/* Trial-chain timeline footer (renders null for trials without chainMembership) */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-4">
          <TrialChainTimeline trialId={tm.id} />
        </div>
        {/* BottomLineDrawer — historical-reference bedsidePearl slot */}
        {tm.bottomLineSummary && (
          <BottomLineDrawer
            trialName={shortName}
            body={tm.bottomLineSummary}
            bedsidePearl={`Historical reference trial predating ${tm.chainContext ?? '[chain context missing]'}. See ${tm.successorTrialDisplay ?? tm.successorTrialId ?? 'the modern successor trial'} for current evidence.`}
            seeAlsoLinks={[
              ...(tm.successorTrialId ? [{ label: tm.successorTrialDisplay ?? tm.successorTrialId, href: `/trials/${tm.successorTrialId}` }] : []),
              { label: 'Stroke Code pathway', href: '/guide/stroke-code' },
            ]}
            citation={tm.source}
            doi={tm.doi}
            trialResult={tm.trialResult}
          />
        )}
      </div>
    );
  };

  // ── IMS-III — W7.0.1 stub (TRIALS_SPEC §7c) ──────────────────────────────
  if (trialId === 'ims-iii-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'IMS-III',
      'Primary Outcome — mRS 0-2 at 90 Days',
      '656 patients; endovascular therapy plus IV alteplase vs IV alteplase alone',
      'Adjusted RR (mRS 0-2)',
      '1.05',
      '0.83 to 1.30',
      'Not significant',
    );
  }

  // ── SYNTHESIS Expansion — W7.0.2 stub (TRIALS_SPEC §7c) ──────────────────
  if (trialId === 'synthesis-expansion-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'SYNTHESIS',
      'Primary Outcome — Disability-Free Survival (mRS 0-1) at 90 Days',
      '362 patients; endovascular therapy alone vs IV alteplase within 4.5 hours',
      'Adjusted OR (mRS 0-1)',
      '0.71',
      '0.44 to 1.14',
      'Not significant (p=0.16)',
    );
  }

  // ── MR RESCUE — W7.0.3 stub (TRIALS_SPEC §7c) ────────────────────────────
  if (trialId === 'mr-rescue-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'MR RESCUE',
      'Primary Outcome — Mean mRS at 90 Days',
      '118 patients; mechanical embolectomy vs standard care; penumbral imaging stratified',
      'Mean mRS (embolectomy vs standard care)',
      '3.9 vs 3.9',
      'N/A (identical means)',
      'Not significant',
    );
  }

  // ── BEST — W7.0.4 stub (basilar EVT chain, TRIALS_SPEC §7c) ─────────────
  if (trialId === 'best-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'BEST',
      'Primary Outcome — mRS 0-3 at 90 Days (ITT)',
      '131 patients; endovascular thrombectomy vs best medical management; basilar artery occlusion',
      'OR (mRS 0-3, ITT)',
      '1.74',
      '0.81 to 3.74',
      'Not significant (P=0.23)',
    );
  }

  // ── BASICS — W7.0.5 stub (basilar EVT chain, TRIALS_SPEC §7c) ───────────
  if (trialId === 'basics-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'BASICS',
      'Primary Outcome — mRS 0-3 at 90 Days',
      '300 patients; EVT plus best medical treatment vs best medical treatment alone; basilar artery occlusion',
      'Rate Ratio (mRS 0-3)',
      '1.18',
      '0.92 to 1.50',
      'Not significant (P=0.19)',
    );
  }

  // ── MATCH — W7.0.6 stub (antiplatelet chain, TRIALS_SPEC §7c) ───────────
  if (trialId === 'match-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'MATCH',
      'Primary Outcome — Composite (Stroke/MI/Vascular Death/Rehospitalization) at 18 Months',
      '7,599 patients; aspirin added to clopidogrel vs clopidogrel alone; recent stroke or TIA',
      'RR (composite endpoint)',
      '0.94',
      '0.84 to 1.05',
      'Not significant (P=0.244)',
    );
  }

  // ── CHARISMA — W7.0.7 stub (antiplatelet chain, TRIALS_SPEC §7c) ────────
  if (trialId === 'charisma-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'CHARISMA',
      'Primary Outcome — MI/Stroke/Cardiovascular Death at Median 28 Months',
      '15,603 patients; aspirin + clopidogrel vs aspirin alone; established CV disease or high-risk',
      'RR (MI/stroke/CV death)',
      '0.93',
      '0.83 to 1.05',
      'Not significant (P=0.22)',
    );
  }

  // ── STICH I — W7.0.8 stub (ICH surgical chain, TRIALS_SPEC §7c) ─────────
  if (trialId === 'stich-i-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'STICH I',
      'Primary Outcome — Favorable Glasgow Outcome Scale at 6 Months',
      '1,033 patients; early surgery vs initial conservative management; supratentorial ICH',
      'OR (favorable GOS)',
      '0.89',
      '0.66 to 1.19',
      'Not significant (P=0.414)',
    );
  }

  // ── STICH II — W7.0.9 stub (ICH surgical chain, TRIALS_SPEC §7c) ────────
  if (trialId === 'stich-ii-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'STICH II',
      'Primary Outcome — Unfavorable Outcome at 6 Months',
      '601 patients; early craniotomy vs initial conservative management; superficial lobar ICH',
      'OR (unfavorable outcome)',
      '0.86',
      '0.62 to 1.20',
      'Not significant (P=0.367)',
    );
  }

  // ── MISTIE III — W7.0.10 stub (ICH surgical chain, TRIALS_SPEC §7c) ─────
  if (trialId === 'mistie-iii-trial' && trialMetadata) {
    return renderStubPage(
      trialMetadata,
      'MISTIE III',
      'Primary Outcome — mRS 0-3 at 1 Year',
      '506 patients; image-guided catheter + alteplase vs standard medical management; supratentorial ICH ≥30 mL',
      'OR (mRS 0-3 at 1 year)',
      '1.20',
      '0.81 to 1.81',
      'Not significant (P=0.33)',
    );
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (!trial) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Trial Not Found
          </h1>
          <p className="text-slate-600">
            Could not find trial with ID: {trialId}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-neuro-600 mb-4 transition-colors text-sm font-medium cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Neuro Trials</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
            {trialMetadata?.title || trial.title}
            {catalogTrial?.year ? <span className="ml-2 text-slate-400">({catalogTrial.year})</span> : null}
          </h1>
          <p className="text-slate-500 text-base">
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
              <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex flex-wrap items-center gap-2">
                  <span className="break-words">Primary Outcome: {stats.primaryEndpoint}</span>
                  {stats.primaryEndpointLabel && (
                    <span className="text-base font-normal text-slate-600 break-words">
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
                      <span className="text-sm font-medium text-slate-700">
                        {stats.treatmentName || 'Alteplase'}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {stats.treatmentRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all"
                        style={{ width: `${stats.treatmentRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {stats.treatmentLabel}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {stats.controlName || 'Placebo'}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {stats.controlRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div
                        className="bg-slate-400 h-4 rounded-full transition-all"
                        style={{ width: `${stats.controlRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {stats.treatmentLabel}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    {stats.isEstimationTrial ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-600 font-bold text-sm">📊 ESTIMATION TRIAL</span>
                          </div>
                          <p className="text-sm text-slate-700 mb-2 break-words">
                            This trial establishes a <strong>safe range</strong> for clinical practice, not superiority.
                          </p>
                          <div className="text-sm text-slate-700 break-words">
                            <strong>Risk Difference:</strong> {stats.effectSize}
                            <MedicalTooltip
                              term="Risk Difference"
                              definition="The difference in event rates between treatment and control groups. Negative values favor treatment. The confidence interval shows the range of plausible values. For estimation trials, this establishes the safe range for practice."
                            />
                          </div>
                          {stats.keyMessage && (
                            <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm font-semibold text-green-800 break-words">
                                ✓ {stats.keyMessage}
                              </p>
                            </div>
                          )}
                        </div>
                        {stats.additionalResults && (
                          <div className="bg-slate-50 p-4 rounded space-y-2">
                            {stats.additionalResults.recurrentStroke && (
                              <div className="text-sm break-words">
                                <strong className="text-slate-700">Recurrent Ischemic Stroke:</strong>{' '}
                                <span className="text-slate-600">
                                  {stats.additionalResults.recurrentStroke.early}% (Early) vs {stats.additionalResults.recurrentStroke.later}% (Later)
                                </span>
                              </div>
                            )}
                            {stats.additionalResults.symptomaticICH && (
                              <div className="text-sm break-words">
                                <strong className="text-slate-700">Symptomatic ICH:</strong>{' '}
                                <span className="text-green-600 font-semibold">
                                  {stats.additionalResults.symptomaticICH.early}% (Early) vs {stats.additionalResults.symptomaticICH.later}% (Later) - EQUAL
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : stats.isHarmStopped ? (
                      // Distinct harm-stopped state — clinical-reviewer Wave 3 condition #1.
                      // Never collapses to generic "NEGATIVE TRIAL" — laundering a safety signal.
                      <div className="bg-red-50 border-l-4 border-red-700 p-4 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-700 font-bold text-sm">🛑 STOPPED FOR HARM</span>
                        </div>
                        <p className="text-sm text-slate-700">
                          This trial was stopped early due to excess harm in the intervention arm. The primary endpoint was not met.
                          {stats.effectSizeLabel && stats.effectSizeLabel !== 'Absolute Increase' && ` (${stats.effectSizeLabel})`}
                        </p>
                      </div>
                    ) : stats.isNIFailed ? (
                      // NI-not-established — clinical-reviewer Wave 3 condition #2.
                      // Label "did not establish non-inferiority", not generic "negative".
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-amber-700 font-bold text-sm">❌ DID NOT ESTABLISH NON-INFERIORITY</span>
                        </div>
                        <p className="text-sm text-slate-700">
                          This trial did not demonstrate that the intervention met the pre-specified non-inferiority margin.
                        </p>
                      </div>
                    ) : stats.isNegativeTrial ? (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600 font-bold text-sm">⚠️ NEGATIVE TRIAL</span>
                        </div>
                        <p className="text-sm text-slate-700">
                          This trial did not demonstrate a benefit for the intervention. {stats.effectSizeLabel && stats.effectSizeLabel !== 'Absolute Increase' && `(${stats.effectSizeLabel})`}
                        </p>
                      </div>
                    ) : stats.isNIEstablished ? (
                      // NI-established — clinical-reviewer Wave 3 condition #2.
                      // Label "non-inferiority established", not generic "positive". NNT not shown.
                      <div className="flex flex-col gap-3">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-700 font-bold text-sm">✓ NON-INFERIORITY ESTABLISHED</span>
                          </div>
                          <p className="text-sm text-slate-700">
                            The intervention met the pre-specified non-inferiority margin. NNT is not applicable for non-inferiority designs.
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600 flex items-center">
                            <strong>Effect:</strong>&nbsp;{stats.effectSize}
                            <MedicalTooltip
                              term="Effect Size"
                              definition="The difference between treatment and control groups relative to the pre-specified non-inferiority margin."
                            />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600 flex items-center">
                        <strong>NNT:</strong> {stats.nnt}
                        <MedicalTooltip
                          term="NNT"
                          definition={
                            stats.nntExplanation ||
                            `Number Needed to Treat: ${stats.nnt === 'N/A' ? 'Not applicable for this trial' : `For every ${stats.nnt} patients treated, one additional patient achieves the primary outcome compared to control`}`
                          }
                        />
                      </span>
                        <span className="text-slate-600 flex items-center">
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

            <Suspense fallback={<ChartFallback />}>
              <TrialVisualizationSectionLazy visualizations={visualizations} />
            </Suspense>

            {/* Clinical Context Section */}
            {trialMetadata?.clinicalContext && (
              <div className="bg-blue-50 rounded-lg border-l-4 border-blue-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Clinical Context</h3>
                <p className="text-slate-700 leading-relaxed">
                  {trialMetadata.clinicalContext}
                </p>
              </div>
            )}

            {trialSummaryItems.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Trial Summary</h3>
                <div className="space-y-4">
                  {trialSummaryItems.map((item) => (
                    <div key={item.label}>
                      <div className="text-sm font-semibold text-slate-900 mb-1">
                        {item.label}
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {addTooltips(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Procedural Details Section (for negative trials) */}
            {trialMetadata?.proceduralDetails && (
              <div className="bg-yellow-50 rounded-lg border-l-4 border-yellow-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🔍 Procedural Details</h3>
                <div className="space-y-4">
                  {trialMetadata.proceduralDetails.reperfusionRate && (
                    <div className="bg-white rounded p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">
                          {trialMetadata.proceduralDetails.reperfusionRate.label}
                        </span>
                        <span className="text-lg font-bold text-yellow-600">
                          {trialMetadata.proceduralDetails.reperfusionRate.value}
                        </span>
                      </div>
                      {trialMetadata.proceduralDetails.reperfusionRate.tooltip && (
                        <p className="text-xs text-slate-600 mt-2">
                          {addTooltips(trialMetadata.proceduralDetails.reperfusionRate.tooltip)}
                        </p>
                      )}
                    </div>
                  )}
                  {trialMetadata.proceduralDetails.imagingToPuncture && (
                    <div className="bg-white rounded p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">
                          {trialMetadata.proceduralDetails.imagingToPuncture.label}
                        </span>
                        <span className="text-lg font-bold text-yellow-600">
                          {trialMetadata.proceduralDetails.imagingToPuncture.value}
                        </span>
                      </div>
                      {trialMetadata.proceduralDetails.imagingToPuncture.tooltip && (
                        <p className="text-xs text-slate-600 mt-2">
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
              <div className="bg-orange-50 rounded-lg border-l-4 border-orange-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">⚠️ Safety Profile</h3>
                <div className="space-y-4">
                  {trialMetadata.safetyProfile.mortality && (
                    <div className="bg-white rounded p-4">
                      <div className="text-sm font-medium text-slate-700 mb-2">
                        {trialMetadata.safetyProfile.mortality.label}
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-slate-500">EVT:</span>
                          <span className="ml-2 text-lg font-bold text-slate-900">
                            {trialMetadata.safetyProfile.mortality.evt}%
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Control:</span>
                          <span className="ml-2 text-lg font-bold text-slate-900">
                            {trialMetadata.safetyProfile.mortality.control}%
                          </span>
                        </div>
                      </div>
                      {trialMetadata.safetyProfile.mortality.tooltip && (
                        <p className="text-xs text-slate-600 mt-2">
                          {addTooltips(trialMetadata.safetyProfile.mortality.tooltip)}
                        </p>
                      )}
                    </div>
                  )}
                  {trialMetadata.safetyProfile.sICH && (
                    <div className="bg-white rounded p-4">
                      <div className="text-sm font-medium text-slate-700 mb-2">
                        {trialMetadata.safetyProfile.sICH.label}
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-slate-500">EVT:</span>
                          <span className="ml-2 text-lg font-bold text-red-600">
                            {trialMetadata.safetyProfile.sICH.evt}%
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Control:</span>
                          <span className="ml-2 text-lg font-bold text-slate-900">
                            {trialMetadata.safetyProfile.sICH.control}%
                          </span>
                        </div>
                      </div>
                      {trialMetadata.safetyProfile.sICH.tooltip && (
                        <p className="text-xs text-slate-600 mt-2">
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
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Large Vessel vs. Distal Vessel EVT</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded p-4 border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">✅ LARGE VESSEL EVT (M1/ICA)</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Reperfusion: 85-90%</li>
                      <li>• NNT: 2-7 (dramatic benefit)</li>
                      <li>• p &lt; 0.001</li>
                      <li>• Good collaterals compensate during delays</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded p-4 border border-red-200">
                    <h4 className="font-bold text-red-800 mb-2">❌ DISTAL VESSEL EVT (M2/M3/ACA/PCA)</h4>
                    <ul className="text-sm text-red-700 space-y-1">
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
              <div className="bg-blue-50 rounded-lg border-l-4 border-blue-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🔍 Why Did DISTAL Fail When Other EVT Trials Succeeded?</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">1. Lower Reperfusion Rates (71.7% vs 85-90%)</h4>
                    <p className="text-sm text-slate-700">
                      Distal vessels are smaller and harder to navigate. Catheters/stents designed for large vessels may not work as well for medium/distal occlusions.
                    </p>
                  </div>
                  <div className="bg-white rounded p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">2. Treatment Delays (70-min imaging-to-puncture)</h4>
                    <p className="text-sm text-slate-700">
                      Distal vessels have poor collateral flow. Less tolerance for delays than large vessels, which can compensate better during treatment delays.
                    </p>
                  </div>
                  <div className="bg-white rounded p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">3. "End Artery" Problem</h4>
                    <p className="text-sm text-slate-700">
                      Distal vessels often have no backup blood supply. By the time treatment starts, tissue may already be dead, making reperfusion ineffective.
                    </p>
                  </div>
                  <div className="bg-white rounded p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">4. Patient Selection</h4>
                    <p className="text-sm text-slate-700">
                      Median NIHSS = 6 (relatively mild). May have self-selected milder cases that do well anyway, masking any potential benefit from EVT.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Clinical Pearls Section */}
            {trialMetadata?.pearls && trialMetadata.pearls.length > 0 && (
              <div className="bg-purple-50 rounded-lg border-l-4 border-purple-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Clinical Pearls</h3>
                <ul className="space-y-3">
                  {trialMetadata.pearls.map((pearl, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 leading-relaxed">
                        {addTooltips(pearl)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conclusion Section */}
            {renderedConclusion && (
              <div className="bg-green-50 rounded-lg border-l-4 border-green-500 p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Conclusion</h3>
                <p className="text-slate-700 leading-relaxed">
                  {addTooltips(renderedConclusion)}
                </p>
              </div>
            )}

            {/* Trial Content */}
            {sanitizedTrialContent && (
              <div className="prose prose-lg max-w-none">
                <Suspense fallback={<ChartFallback />}>
                  <MarkdownSectionLazy content={sanitizedTrialContent} />
                </Suspense>
              </div>
            )}

            {/* Source Citation */}
            {trialMetadata?.source && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600 italic">
                  <strong>Source:</strong> {trialMetadata.source}
                </p>
              </div>
            )}

            {/* Trial-chain timeline footer — renders null for any trial
                without chainMembership, so it's safe on every fallback-
                render trial. Lights up Phase 2 chains (pfo-closure,
                carotid, evt-mevo) without per-trial wiring. */}
            {trialId && <TrialChainTimeline trialId={trialId} />}

            {/* Related trials — heuristic sidebar (chain → category → question → era).
                Memoized on currentTrialId. Renders null when no candidates found. */}
            {trialId && <RelatedTrialsSidebar currentTrialId={trialId} />}
          </div>

          {/* Dark Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-lg p-6 sticky top-8">
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
                    {!stats.suppressNNT && (
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
