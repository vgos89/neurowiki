// favoritesRegistry — single source of truth mapping favorite IDs to their
// display metadata. Powers the My Favorites page (/favorites) which renders
// the user's starred calculators / pathways / trials in a categorized list.
//
// Favorite IDs are plain strings stored in localStorage under the
// `neurowiki:favorites:v1` key (see src/hooks/useFavorites.ts). Calculators
// and pathways use stable hand-coined IDs ('nihss', 'evt-pathway'); trials
// use their TrialMetadata.id which is the same string used as the URL
// segment (`/trials/<id>`).
//
// When a user stars something, only the ID is persisted. This file resolves
// each ID back to the {kind, title, path, eyebrow} needed to render a row
// on the favorites page.

import { findTrialById } from '../data/trialListData';

export type FavoriteKind = 'calculator' | 'pathway' | 'trial';

export interface FavoriteEntry {
  id: string;
  kind: FavoriteKind;
  title: string;
  eyebrow?: string;
  /** Internal route to navigate to when the user taps the row. */
  path: string;
}

/**
 * Hand-coined IDs for calculators + pathways. The string keys must match
 * the IDs passed to `toggleFavorite(...)` at the consumer site (e.g.
 * `toggleFavorite('nihss')` in NihssCalculator.tsx).
 */
const STATIC_FAVORITES: Record<string, Omit<FavoriteEntry, 'id'>> = {
  // ─── Calculators (11) ───────────────────────────────────────────────
  'nihss': {
    kind: 'calculator',
    title: 'NIHSS Calculator',
    eyebrow: 'NIH Stroke Scale',
    path: '/calculators/nihss',
  },
  'ich': {
    kind: 'calculator',
    title: 'ICH Score',
    eyebrow: 'Hemorrhage prognosis',
    path: '/calculators/ich-score',
  },
  'gcs': {
    kind: 'calculator',
    title: 'Glasgow Coma Scale',
    eyebrow: 'Consciousness assessment',
    path: '/calculators/glasgow-coma-scale',
  },
  'aspects': {
    kind: 'calculator',
    title: 'ASPECTS Score',
    eyebrow: 'Alberta Stroke Program Early CT',
    path: '/calculators/aspects-score',
  },
  'abcd2': {
    kind: 'calculator',
    title: 'ABCD² Score',
    eyebrow: 'TIA stroke risk',
    path: '/calculators/abcd2-score',
  },
  'has-bled': {
    kind: 'calculator',
    title: 'HAS-BLED Score',
    eyebrow: 'Bleeding risk on anticoagulation',
    path: '/calculators/has-bled-score',
  },
  'rope': {
    kind: 'calculator',
    title: 'RoPE Score',
    eyebrow: 'PFO-attributable stroke risk',
    path: '/calculators/rope-score',
  },
  'chads-vasc': {
    kind: 'calculator',
    title: 'CHA₂DS₂-VASc',
    eyebrow: 'AF stroke risk',
    path: '/calculators/chads-vasc',
  },
  'heidelberg-bleeding': {
    kind: 'calculator',
    title: 'Heidelberg Bleeding Classification',
    eyebrow: 'Post-tPA hemorrhagic transformation',
    path: '/calculators/heidelberg-bleeding-classification',
  },
  'boston-caa': {
    kind: 'calculator',
    title: 'Boston Criteria 2.0',
    eyebrow: 'Cerebral amyloid angiopathy',
    path: '/calculators/boston-criteria-caa',
  },
  'em-billing': {
    kind: 'calculator',
    title: 'E/M Billing Calculator',
    eyebrow: 'CPT 99202–99215',
    path: '/calculators/em-billing',
  },

  // ─── Pathways (6) ───────────────────────────────────────────────────
  'stroke-code': {
    kind: 'pathway',
    title: 'Stroke Code',
    eyebrow: 'Acute ischemic stroke workflow',
    path: '/pathways/stroke-code',
  },
  'evt-pathway': {
    kind: 'pathway',
    title: 'EVT Pathway',
    eyebrow: 'Mechanical thrombectomy',
    path: '/pathways/evt',
  },
  'ivt-extended-pathway': {
    kind: 'pathway',
    title: 'Extended IVT',
    eyebrow: 'Late-window thrombolysis (4.5–24h)',
    path: '/pathways/late-window-ivt',
  },
  'elan-pathway': {
    kind: 'pathway',
    title: 'ELAN Pathway',
    eyebrow: 'Anticoagulation timing after stroke',
    path: '/pathways/elan-pathway',
  },
  'se-pathway': {
    kind: 'pathway',
    title: 'Status Epilepticus',
    eyebrow: 'Convulsive SE management',
    path: '/pathways/se-pathway',
  },
  'migraine-pathway': {
    kind: 'pathway',
    title: 'Migraine Pathway',
    eyebrow: 'Acute migraine treatment',
    path: '/pathways/migraine-pathway',
  },
};

/**
 * Resolve a favorite ID to its display entry. Returns null when:
 *   - the ID is unknown (calculator/pathway was renamed / retired)
 *   - the ID corresponds to a trial that's no longer in TRIAL_DATA
 *
 * Unknown IDs are silently dropped from the My Favorites view so a stale
 * localStorage entry doesn't break the page.
 */
export function resolveFavorite(id: string): FavoriteEntry | null {
  // Static map covers calculators + pathways.
  const staticMatch = STATIC_FAVORITES[id];
  if (staticMatch) {
    return { id, ...staticMatch };
  }
  // Otherwise treat as a trial ID and resolve against the trial catalog.
  const trial = findTrialById(id);
  if (trial) {
    return {
      id,
      kind: 'trial',
      title: trial.name,
      eyebrow: trial.description ?? `${trial.year} · ${trial.category}`,
      path: trial.path,
    };
  }
  return null;
}

/**
 * Quick substring search across the static calculator + pathway entries.
 * Returns up to `limit` entries whose title, eyebrow, or ID contains the
 * normalised query. Used by the TrialsPage local search to surface
 * calculator / pathway hits inline ("Looking for a calculator?") when a
 * clinician types e.g. "nihss" on the trials surface — the global
 * search overlay already handles this, but this duplicates the answer
 * inline so the user does not have to invoke a second search UI.
 */
export function quickFindStatic(query: string, limit = 5): FavoriteEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: FavoriteEntry[] = [];
  for (const [id, meta] of Object.entries(STATIC_FAVORITES)) {
    const haystack = `${id} ${meta.title} ${meta.eyebrow ?? ''}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({ id, ...meta });
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

/**
 * Resolve an array of favorite IDs to a categorized structure, preserving
 * insertion order within each category (i.e., most-recently-starred items
 * appear last). Unknown IDs are filtered out.
 */
export function categorizeFavorites(ids: string[]): {
  calculators: FavoriteEntry[];
  pathways: FavoriteEntry[];
  trials: FavoriteEntry[];
} {
  const calculators: FavoriteEntry[] = [];
  const pathways: FavoriteEntry[] = [];
  const trials: FavoriteEntry[] = [];

  for (const id of ids) {
    const entry = resolveFavorite(id);
    if (!entry) continue;
    if (entry.kind === 'calculator') calculators.push(entry);
    else if (entry.kind === 'pathway') pathways.push(entry);
    else if (entry.kind === 'trial') trials.push(entry);
  }

  return { calculators, pathways, trials };
}
