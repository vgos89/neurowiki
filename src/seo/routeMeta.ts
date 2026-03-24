import { DEFAULT_META, STATIC_ROUTE_META_LOOKUP, type MetaData } from '../config/routeManifest';
import { categoryNames, findTrialById } from '../data/trialListData';
import { normalizeTrialSlug } from '../data/trialPayload';

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
