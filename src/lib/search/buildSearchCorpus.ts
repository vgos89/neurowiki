// Search-corpus generator.
// Aggregates indexable docs from routeManifest, trialData, trial-questions, and
// pathway/guide hand-maps. Runs at runtime on first overlay open (lazy via
// useSearchIndex.ts). All inputs are static imports — no I/O.

import type { SearchDoc, SearchKind } from './types';
import { STATIC_ROUTE_DEFINITIONS } from '../../config/routeManifest';
import { TRIAL_DATA } from '../../data/trialData';
import { TRIAL_QUESTIONS } from '../../data/trial-questions';

/**
 * Per-route kind classifier. Pure function from path → kind, so the corpus
 * builder doesn't need a hand-mapped table.
 */
function kindForPath(path: string): SearchKind {
  if (path.startsWith('/trials/q/')) return 'question';
  if (path.startsWith('/trials/')) return 'trial';
  if (path.startsWith('/calculators/')) return 'calculator';
  if (path.startsWith('/pathways/')) return 'pathway';
  if (path.startsWith('/guide/')) return 'guide';
  return 'route';
}

/**
 * Keyword expansion for common stroke/neurology synonyms. Authored by hand —
 * MiniSearch would do this via stemming + n-grams, but for ~250 docs an
 * explicit list is more controllable.
 */
const GLOBAL_KEYWORDS: Record<string, string[]> = {
  '/calculators/nihss': ['stroke severity', 'national institutes of health stroke scale'],
  '/calculators/ich-score': ['hemorrhage prognosis', 'intracerebral hemorrhage scoring'],
  '/calculators/glasgow-coma-scale': ['gcs', 'consciousness', 'coma assessment'],
  '/calculators/aspects-score': ['ct early ischemia', 'alberta stroke program', 'early ct'],
  '/calculators/abcd2-score': ['tia risk', 'transient ischemic attack', 'stroke recurrence risk'],
  '/calculators/has-bled-score': ['bleeding risk', 'anticoagulation bleeding'],
  '/calculators/chads-vasc': ['atrial fibrillation', 'stroke risk', 'cha2ds2vasc'],
  '/calculators/rope-score': ['pfo', 'patent foramen ovale', 'cryptogenic stroke'],
  '/calculators/heidelberg-bleeding-classification': ['hemorrhagic transformation', 'post-tpa bleeding'],
  '/calculators/boston-criteria-caa': ['cerebral amyloid angiopathy', 'lobar hemorrhage'],
  '/pathways/stroke-code': ['acute stroke', 'tpa', 'alteplase', 'tenecteplase', 'door-to-needle'],
  '/pathways/evt': ['thrombectomy', 'mechanical thrombectomy', 'large vessel occlusion', 'lvo'],
  '/pathways/late-window-ivt': ['wake-up stroke', 'extended window', 'perfusion imaging'],
  '/pathways/elan-pathway': ['anticoagulation timing', 'doac', 'atrial fibrillation stroke'],
  '/pathways/se-pathway': ['seizure', 'status epilepticus', 'benzodiazepine'],
  '/pathways/migraine-pathway': ['headache', 'acute migraine', 'migraine cocktail'],
  '/guide/stroke-code': ['acute stroke', 'tpa', 'iv thrombolysis'],
  '/guide/iv-tpa': ['alteplase', 'tenecteplase', 'thrombolysis'],
  '/guide/mechanical-thrombectomy': ['evt', 'thrombectomy', 'lvo'],
  '/guide/ich-management': ['hemorrhage', 'intracerebral hemorrhage', 'bp control'],
  '/guide/meningitis': ['cns infection', 'lumbar puncture', 'csf'],
  '/guide/gbs': ['guillain-barre', 'ascending paralysis', 'aidp'],
  '/guide/myasthenia-gravis': ['mg', 'crisis', 'pyridostigmine'],
  '/guide/multiple-sclerosis': ['ms', 'demyelinating'],
  '/guide/vertigo': ['bppv', 'dizziness', 'hints exam'],
};

/**
 * Build the full searchable corpus. Called once on first overlay open.
 * Estimated ~250 documents total.
 */
export function buildSearchCorpus(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // 1. Routes from manifest (42 routes)
  for (const route of STATIC_ROUTE_DEFINITIONS) {
    if (!route.meta?.title) continue;
    const kind = kindForPath(route.path);
    const path = route.path;
    docs.push({
      id: `${kind}:${path}`,
      kind,
      title: route.meta.title.replace(/\s*\|\s*NeuroWiki\s*$/, ''),
      subtitle: route.meta.description,
      keywords: GLOBAL_KEYWORDS[path],
      path,
      popularity: kind === 'calculator' ? 80 : kind === 'pathway' ? 70 : 50,
    });
  }

  // 2. Trials (89 entries)
  for (const [id, trial] of Object.entries(TRIAL_DATA)) {
    if (!trial.title) continue;
    docs.push({
      id: `trial:${id}`,
      kind: 'trial',
      title: trial.title,
      subtitle: trial.subtitle,
      body: [
        trial.clinicalContext,
        trial.bedsidePearl,
        trial.bottomLineSummary,
        ...(trial.pearls || []).slice(0, 3),
      ].filter(Boolean).join(' '),
      keywords: trial.listCategory ? [trial.listCategory] : undefined,
      path: `/trials/${id}`,
      popularity: 60,
    });
  }

  // 3. Trial questions (clinical-question groupings)
  for (const q of TRIAL_QUESTIONS) {
    docs.push({
      id: `question:${q.id}`,
      kind: 'question',
      title: q.text,
      subtitle: q.meta,
      keywords: ['clinical question'],
      path: `/trials/q/${q.id}`,
      popularity: 65,
    });
  }

  return docs;
}
