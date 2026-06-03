/**
 * RelatedTrialsSidebar — "Related trials" section at the bottom of trial detail pages.
 *
 * Heuristic (priority order, up to 6 candidates total, current trial excluded):
 *   1. Same chain   — chainMembership[] overlap; predecessor → cohort → successor; then year.
 *   2. Same listCategory + same result direction (trialResult or primaryResult match).
 *   3. Same listCategory, any result, year within ±3 years.
 *   4. Same question membership — appears with this trial in any TRIAL_QUESTIONS[].trialIds.
 *   5. Same year ±3, any category (last-resort / orphan).
 *
 * Each candidate is tagged with a reason string used for grouping.
 *
 * Design tokens: bg-white dark:bg-slate-800 · border border-slate-100 dark:border-slate-700/60
 * · rounded-xl · text-[10px] font-bold uppercase tracking-widest text-slate-400 (eyebrow)
 * · text-[14px] font-semibold text-slate-900 (trial name)
 * · text-[11px] text-slate-500 (meta)
 *
 * A11y: <aside aria-label="Related trials">; each card is a <Link>.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TRIAL_DATA } from '../../data/trialData';
import { TRIAL_QUESTIONS } from '../../data/trial-questions';

// ─── Types ───────────────────────────────────────────────────────────────────

export type RelatedReason = 'chain' | 'category' | 'question' | 'era';

interface RelatedTrial {
  id: string;
  title: string;
  year: number;
  listCategory?: string;
  reason: RelatedReason;
}

export interface RelatedTrialsSidebarProps {
  currentTrialId: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract publication year from source string or trialDesign.timeline.
 *  Mirrors the yearFromTrial pattern in QuestionDetailPage.tsx. */
function yearFromTrial(id: string): number {
  const trial = TRIAL_DATA[id];
  if (!trial) return 0;
  const src = trial.source ?? '';
  const m = src.match(/\b(19[89]\d|20\d{2})\b/);
  if (m) return parseInt(m[1], 10);
  const tl = trial.trialDesign?.timeline ?? '';
  const m2 = tl.match(/\b(19[89]\d|20\d{2})\b/);
  if (m2) return parseInt(m2[1], 10);
  return 0;
}

const GROUP_LABELS: Record<RelatedReason, string> = {
  chain: 'From the same chain',
  category: 'Same category',
  question: 'Related question',
  era: 'Same era',
};

// ─── Heuristic engine ────────────────────────────────────────────────────────

function buildRelatedTrials(currentId: string): RelatedTrial[] {
  const current = TRIAL_DATA[currentId];
  if (!current) return [];

  const currentYear = yearFromTrial(currentId);
  const seen = new Set<string>([currentId]);
  const results: RelatedTrial[] = [];

  const push = (id: string, reason: RelatedReason) => {
    if (seen.has(id)) return;
    const trial = TRIAL_DATA[id];
    if (!trial) return;
    seen.add(id);
    results.push({
      id,
      title: trial.title,
      year: yearFromTrial(id),
      listCategory: trial.listCategory,
      reason,
    });
  };

  // ── Tier 1: same chain ────────────────────────────────────────────────────
  if (current.chainMembership && current.chainMembership.length > 0) {
    const currentChainIds = new Set(current.chainMembership.map((m) => m.chainId));

    // Collect candidates: {id, chainRole, year}
    const chainCandidates: Array<{
      id: string;
      role: string;
      year: number;
    }> = [];

    for (const [otherId, other] of Object.entries(TRIAL_DATA)) {
      if (otherId === currentId) continue;
      if (!other.chainMembership) continue;
      const sharedChain = other.chainMembership.find((m) => currentChainIds.has(m.chainId));
      if (!sharedChain) continue;
      chainCandidates.push({ id: otherId, role: sharedChain.role, year: yearFromTrial(otherId) });
    }

    // Order: predecessor first, then cohort-member, then successor; then by year.
    const roleOrder: Record<string, number> = { predecessor: 0, 'cohort-member': 1, current: 2, successor: 3 };
    chainCandidates.sort((a, b) => {
      const rDiff = (roleOrder[a.role] ?? 2) - (roleOrder[b.role] ?? 2);
      if (rDiff !== 0) return rDiff;
      return a.year - b.year;
    });

    for (const c of chainCandidates) {
      push(c.id, 'chain');
      if (results.length >= 6) break;
    }
  }

  // ── Tier 2: same listCategory + matching result direction ─────────────────
  if (results.length < 6 && current.listCategory) {
    const categoryMatches: Array<{ id: string; year: number }> = [];
    for (const [otherId, other] of Object.entries(TRIAL_DATA)) {
      if (seen.has(otherId)) continue;
      if (other.listCategory !== current.listCategory) continue;
      const sameResult =
        other.trialResult === current.trialResult ||
        (other.primaryResult && current.primaryResult && other.primaryResult === current.primaryResult);
      if (!sameResult) continue;
      categoryMatches.push({ id: otherId, year: yearFromTrial(otherId) });
    }
    // Closest year first.
    categoryMatches.sort((a, b) => Math.abs(a.year - currentYear) - Math.abs(b.year - currentYear));
    for (const c of categoryMatches) {
      push(c.id, 'category');
      if (results.length >= 6) break;
    }
  }

  // ── Tier 3: same listCategory, any result, year ±3 ────────────────────────
  if (results.length < 6 && current.listCategory) {
    const tier3: Array<{ id: string; year: number }> = [];
    for (const [otherId, other] of Object.entries(TRIAL_DATA)) {
      if (seen.has(otherId)) continue;
      if (other.listCategory !== current.listCategory) continue;
      const yr = yearFromTrial(otherId);
      if (Math.abs(yr - currentYear) > 3) continue;
      tier3.push({ id: otherId, year: yr });
    }
    tier3.sort((a, b) => Math.abs(a.year - currentYear) - Math.abs(b.year - currentYear));
    for (const c of tier3) {
      push(c.id, 'category');
      if (results.length >= 6) break;
    }
  }

  // ── Tier 4: same question membership ─────────────────────────────────────
  if (results.length < 6) {
    // Find all questions this trial appears in.
    const sharedQuestionTrialIds = new Set<string>();
    for (const q of TRIAL_QUESTIONS) {
      if (!q.trialIds.includes(currentId)) continue;
      for (const tid of q.trialIds) {
        if (tid !== currentId) sharedQuestionTrialIds.add(tid);
      }
    }
    // Sort by year proximity.
    const tier4 = Array.from(sharedQuestionTrialIds)
      .filter((id) => !seen.has(id) && TRIAL_DATA[id])
      .map((id) => ({ id, year: yearFromTrial(id) }))
      .sort((a, b) => Math.abs(a.year - currentYear) - Math.abs(b.year - currentYear));
    for (const c of tier4) {
      push(c.id, 'question');
      if (results.length >= 6) break;
    }
  }

  // ── Tier 5: same year ±3, any category (orphan last-resort) ──────────────
  if (results.length < 6) {
    const tier5 = Object.keys(TRIAL_DATA)
      .filter((id) => !seen.has(id))
      .map((id) => ({ id, year: yearFromTrial(id) }))
      .filter((c) => Math.abs(c.year - currentYear) <= 3 && c.year > 0)
      .sort((a, b) => Math.abs(a.year - currentYear) - Math.abs(b.year - currentYear));
    for (const c of tier5) {
      push(c.id, 'era');
      if (results.length >= 6) break;
    }
  }

  return results;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface TrialCardProps {
  trial: RelatedTrial;
}

function TrialCard({ trial }: TrialCardProps) {
  return (
    <Link
      to={`/trials/${trial.id}`}
      className="flex flex-col gap-0.5 px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors min-h-[44px] justify-center"
      aria-label={`${trial.title}${trial.year ? `, ${trial.year}` : ''}`}
    >
      <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 leading-snug">
        {trial.title}
      </span>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">
        {[
          trial.year > 0 ? String(trial.year) : null,
          trial.listCategory
            ? trial.listCategory.charAt(0).toUpperCase() + trial.listCategory.slice(1)
            : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </span>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RelatedTrialsSidebar({ currentTrialId }: RelatedTrialsSidebarProps) {
  const related = useMemo(() => buildRelatedTrials(currentTrialId), [currentTrialId]);

  if (related.length === 0) return null;

  // Group by reason, preserving insertion order (priority order from heuristic).
  const groups: Map<RelatedReason, RelatedTrial[]> = new Map();
  for (const trial of related) {
    if (!groups.has(trial.reason)) groups.set(trial.reason, []);
    groups.get(trial.reason)!.push(trial);
  }

  return (
    <aside
      aria-label="Related trials"
      className="mt-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl p-4"
    >
      {/* Section eyebrow */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        Related trials
      </p>
      {/* Section heading */}
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
        Explore connected evidence
      </h2>
      {/* Disclosure subhead */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
        Related trials may show different outcomes.
      </p>

      <div className="space-y-5">
        {Array.from(groups.entries()).map(([reason, trials]) => (
          <div key={reason}>
            {/* Group label — internal hairline above second+ groups */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-4">
              {GROUP_LABELS[reason]}
            </p>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {trials.map((trial) => (
                <TrialCard key={trial.id} trial={trial} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default RelatedTrialsSidebar;
