import { DEFAULT_META, STATIC_ROUTE_META_LOOKUP, type MetaData } from '../config/routeManifest';
import { categoryNames, findTrialById } from '../data/trialListData';
import { normalizeTrialSlug } from '../data/trialPayload';

// ── Per-question metadata for /trials/q/:id ───────────────────────────────────
// Titles ≤60 chars, descriptions ≤160 chars.
// Must stay in sync with QUESTION_META in src/seo/schema.ts.
const QUESTION_ROUTE_META: Record<string, Pick<MetaData, 'title' | 'description' | 'keywords'>> = {
  'large-core-evt': {
    title: 'EVT for Large-Core Stroke (Low ASPECTS) · NeuroWiki',
    description: 'Four positive RCTs (LASTE, SELECT2, ANGEL-ASPECT, TENSION) changed EVT practice for low-ASPECTS large-core stroke. Evidence summary.',
    keywords: 'large core EVT, low ASPECTS thrombectomy, LASTE trial, SELECT2 trial, ANGEL-ASPECT trial, TENSION trial, large core infarct EVT',
  },
  'late-window-selection': {
    title: 'Perfusion vs Non-Contrast CT for Late-Window EVT · NeuroWiki',
    description: 'How to select patients for late-window EVT — perfusion mismatch (DAWN, DEFUSE-3) versus plain-CT large-core approach (LASTE, TENSION, SELECT2).',
    keywords: 'late window EVT selection, perfusion imaging thrombectomy, DAWN trial, DEFUSE-3, late window stroke, non-contrast CT EVT selection',
  },
  'aspiration-vs-stentriever': {
    title: 'Aspiration vs Stent Retriever for Thrombectomy · NeuroWiki',
    description: 'Three RCTs (ASTER, COMPASS, ASTER2) comparing direct aspiration first versus stent-retriever-first thrombectomy. No clear winner on functional outcomes.',
    keywords: 'aspiration thrombectomy, stent retriever EVT, ASTER trial, COMPASS trial, ASTER2, direct aspiration first, thrombectomy device comparison',
  },
  'evt-adjunct-pharmacotherapy': {
    title: 'Adjunct Pharmacotherapy During EVT · NeuroWiki',
    description: 'Nerinetide (ESCAPE-NA1), adjunct IA alteplase (CHOICE), and tirofiban (RESCUE BT): evidence on pharmacologic adjuncts to mechanical thrombectomy.',
    keywords: 'EVT adjunct therapy, nerinetide ESCAPE-NA1, CHOICE trial IA alteplase, RESCUE BT tirofiban, neuroprotection thrombectomy, adjunct EVT pharmacotherapy',
  },
  'minor-stroke-choice': {
    title: 'Minor Stroke — tPA, DAPT, or Aspirin? · NeuroWiki',
    description: 'PRISMS, ARAMIS, CHANCE, POINT, and INSPIRES define the evidence for treating minor non-disabling ischemic stroke without thrombolysis.',
    keywords: 'minor stroke treatment, non-disabling stroke tPA, PRISMS trial, ARAMIS trial, CHANCE DAPT minor stroke, minor stroke thrombolysis DAPT',
  },
  'mevo-distal-evt': {
    title: 'EVT for MeVO or Distal Occlusion · NeuroWiki',
    description: 'ESCAPE-MeVO and DISTAL — the first two RCTs in medium-vessel and distal occlusions — both failed their primary endpoints. Evidence summary.',
    keywords: 'MeVO EVT, distal occlusion thrombectomy, ESCAPE-MeVO trial, DISTAL trial, medium vessel occlusion, M2 M3 EVT, distal EVT evidence',
  },
  'post-evt-bp-target': {
    title: 'Post-EVT Blood Pressure Target · NeuroWiki',
    description: 'Four RCTs (BP-TARGET, BEST-II, OPTIMAL-BP, ENCHANTED) on post-EVT blood pressure management. OPTIMAL-BP showed harm from intensive lowering.',
    keywords: 'post EVT blood pressure, thrombectomy BP target, OPTIMAL-BP trial, BP-TARGET trial, BEST-II trial, post thrombectomy hypertension, EVT BP management',
  },
};

function buildTrialMeta(pathname: string, slug: string): MetaData | null {
  const trialId = normalizeTrialSlug(slug);
  const trial = findTrialById(trialId);

  if (!trial) return null;

  const description = trial.description
    ?? trial.clinicalContext
    ?? `Stroke clinical trial summary for ${trial.name}.`;

  return {
    ...DEFAULT_META,
    title: `${trial.name} — ${categoryNames[trial.category]} | NeuroWiki`,
    description,
    keywords: `${trial.name} trial, ${trial.name} stroke trial, ${trial.name} results, ${categoryNames[trial.category].toLowerCase()}, stroke clinical trial summary`,
  };
}

export const getRouteMeta = (pathname: string): MetaData => {
  if (STATIC_ROUTE_META_LOOKUP[pathname]) {
    return STATIC_ROUTE_META_LOOKUP[pathname];
  }

  if (pathname.startsWith('/calculators/')) {
    const id = pathname.split('/')[2] ?? '';
    const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
    return {
      ...DEFAULT_META,
      title: `${name} Calculator | NeuroWiki`,
      description: `Calculate ${name} score and view clinical interpretation.`,
    };
  }

  if (pathname.startsWith('/trials/q/')) {
    const questionId = pathname.split('/').pop() ?? '';
    const qMeta = QUESTION_ROUTE_META[questionId];
    if (qMeta) {
      return { ...DEFAULT_META, ...qMeta };
    }
    // Fallback for question IDs not yet in the lookup
    const title = questionId.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return {
      ...DEFAULT_META,
      title: `${title} — Clinical Question | NeuroWiki`,
      description: `Evidence summary for the clinical question: ${title}. Stroke trials curated by NeuroWiki.`,
    };
  }

  if (pathname.startsWith('/trials/')) {
    const slug = pathname.split('/').pop() ?? '';
    const meta = buildTrialMeta(pathname, slug);
    if (meta) {
      return meta;
    }
  }

  if (pathname.startsWith('/guide/') || pathname.startsWith('/trials/')) {
    const slug = pathname.split('/').pop() || '';
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const type = pathname.startsWith('/trials/') ? 'Clinical Trial' : 'Clinical Guide';
    return {
      ...DEFAULT_META,
      title: `${title} - ${type} | NeuroWiki`,
      description: `Detailed ${type.toLowerCase()} summary for ${title}.`,
    };
  }
  return DEFAULT_META;
};
