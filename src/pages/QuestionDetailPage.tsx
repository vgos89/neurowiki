/**
 * QuestionDetailPage — /trials/q/:questionId
 *
 * Shell: question header · status banner · linked trials list.
 * Clinical synthesis paragraph: parked, Class D-clinical.
 * When authored it will replace the "Curated answer in progress" banner copy.
 *
 * Spec: TRIALS_SPEC.md §L5.3
 * Patterns reused from: trials-legend-reference.html §Stage2 (card list),
 *   TrialPageNew.tsx (back-button / eyebrow header strip),
 *   TrialLegendCard.tsx (card atom, unchanged).
 *
 * Edge cases handled:
 *   - Unknown questionId → graceful 404 with back-link (no throw/crash).
 *   - Empty trialIds after resolution → "Trials being curated" empty state.
 *   - Unresolvable individual trial ID → silently skipped (findTrialById returns undefined).
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { TRIAL_QUESTIONS } from '../data/trial-questions';
import { findTrialById, type TrialItem } from '../data/trialListData';
import { TRIAL_DATA } from '../data/trialData'; // Phase 6B: legend deferred; lazy route imports directly
import { TrialLegendCard } from '../components/trials/TrialLegendCard';
import { useFavorites } from '../hooks/useFavorites';

// ── Helpers ──────────────────────────────────────────────────────────────────

function BackLink() {
  return (
    <Link
      to="/trials"
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Trials
    </Link>
  );
}

// ── 404 state ─────────────────────────────────────────────────────────────────

function QuestionNotFound() {
  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center gap-5 px-8 py-16">
      <div className="text-center max-w-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">
          Question not found
        </p>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          We couldn&apos;t find a clinical question matching this URL. It may
          have been removed or the link may be incorrect.
        </p>
        <Link
          to="/trials"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1746A2] hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Trials
        </Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { isFavorite, toggleFavorite } = useFavorites();

  const question = TRIAL_QUESTIONS.find((q) => q.id === questionId);

  // SEO: title, description, canonical, OG, and JSON-LD are handled globally
  // by the Seo component (src/components/Seo.tsx) via getRouteMeta() and
  // getSchemaForRoute(). No document.title override needed here.

  // ── 404 state ───────────────────────────────────────────────────────────────
  if (!question) {
    return <QuestionNotFound />;
  }

  // Resolve trial IDs against the catalog. Stubs (BEST, BASICS, STICH I/II,
  // MISTIE III, etc.) live in TRIAL_DATA but not in trialListData — synthesize
  // a TrialItem for them so they appear in the question's evidence list.
  // Enrich with legend data (Phase 6B: legend no longer in trialListData.ts).
  function yearFromTrial(metadata: typeof TRIAL_DATA[string]): number {
    // Try source string ("Liu et al. (Lancet Neurol 2020)" → 2020); then
    // trialDesign.timeline; then 0 as a safe default.
    const src = metadata.source || '';
    const matchSrc = src.match(/\b(19|20)\d{2}\b/);
    if (matchSrc) return parseInt(matchSrc[0], 10);
    const tl = metadata.trialDesign?.timeline || '';
    const matchTl = tl.match(/\b(19|20)\d{2}\b/);
    if (matchTl) return parseInt(matchTl[0], 10);
    return 0;
  }

  const resolvedTrials = question.trialIds
    .map((id) => {
      const fromList = findTrialById(id);
      if (fromList) {
        return { ...fromList, legend: TRIAL_DATA[id]?.legend };
      }
      // Fallback for stub trials — synthesize a TrialItem from TRIAL_DATA.
      const stub = TRIAL_DATA[id];
      if (stub) {
        const name = stub.title.replace(/\s*Trial\s*$/i, '').trim();
        return {
          id,
          name,
          year: yearFromTrial(stub),
          category: (stub.listCategory ?? 'evt') as TrialItem['category'],
          doi: stub.doi ?? '',
          path: `/trials/${id}`,
          isPlaceholder: false,
          description: stub.listDescription || stub.bottomLineSummary || stub.subtitle,
          legend: stub.legend,
        } as TrialItem;
      }
      return undefined;
    })
    .filter((t): t is TrialItem => t !== undefined);

  const handleFavToggle = (id: string, _e: React.MouseEvent) => {
    toggleFavorite(id);
  };

  return (
    <div className="min-h-dvh bg-white">

      {/* ── Header strip ───────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <div className="mb-5">
          <BackLink />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-2">
          Clinical Question
        </p>

        {/* ── Hero block ─────────────────────────────────────────────────── */}
        <h1 className="text-[22px] md:text-[28px] font-medium tracking-[-0.01em] leading-snug text-slate-900 mb-2">
          {question.text}
        </h1>

        <p className="text-sm text-slate-500">
          {resolvedTrials.length > 0
            ? `Synthesises ${resolvedTrials.length} trial${resolvedTrials.length !== 1 ? 's' : ''}`
            : 'Trials being curated'}
          {question.meta && (
            <>
              <span className="mx-1.5 text-slate-300" aria-hidden>·</span>
              {question.meta}
            </>
          )}
        </p>
      </div>

      {/* ── Status banner ──────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-5">
        <div
          className="rounded-lg px-4 py-3.5"
          style={{
            background: 'var(--cobalt-soft)',
            borderLeft: '3px solid var(--color-neuro-500)',
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1"
            style={{ color: 'var(--color-neuro-500)' }}
          >
            Clinical Synthesis
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Curated answer in progress. The trials below are the evidence base.
            Open any card to read the full study.
          </p>
        </div>
      </div>

      {/* ── Trial list ─────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 pb-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-3">
          Trials in this question
          {resolvedTrials.length > 0 && (
            <span className="ml-1 font-normal normal-case tracking-normal">
              · {resolvedTrials.length}
            </span>
          )}
        </p>

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {resolvedTrials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <p className="text-sm text-slate-400">
              Trials being curated for this question.
            </p>
          </div>
        ) : (
          /* ── Card list ─────────────────────────────────────────────────── */
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            {resolvedTrials.map((trial) => (
              <TrialLegendCard
                key={trial.id}
                trial={trial}
                isFav={isFavorite(trial.id)}
                onFavToggle={handleFavToggle}
              />
            ))}
          </div>
        )}

        {/* ── Related questions rail ───────────────────────────────────────
            Renders up to 3 clinically-adjacent questions per
            relatedQuestions[] in trial-questions.ts. Wired 2026-05-21 per
            link-graph audit §3.2 (taxonomy crosslinks, non-clinical). */}
        {question.relatedQuestions && question.relatedQuestions.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-3">
              Related questions
            </p>
            <div className="grid gap-2">
              {question.relatedQuestions
                .map((relatedId) => TRIAL_QUESTIONS.find((q) => q.id === relatedId))
                .filter((q): q is NonNullable<typeof q> => Boolean(q))
                .map((related) => (
                  <Link
                    key={related.id}
                    to={`/trials/q/${related.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors px-4 py-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-slate-900 truncate">
                        {related.text}
                      </p>
                      {related.meta && (
                        <p className="text-[12px] text-slate-500 truncate mt-0.5">
                          {related.meta}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-300 shrink-0 ml-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-400">
            Was this useful?{' '}
            <button
              type="button"
              onClick={() => {
                const fb = document.querySelector<HTMLButtonElement>('[data-feedback-btn]');
                if (fb) fb.click();
              }}
              className="underline underline-offset-2 hover:text-slate-600 transition-colors"
            >
              Share feedback →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
