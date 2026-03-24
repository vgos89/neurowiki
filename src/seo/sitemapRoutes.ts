import { STATIC_SITEMAP_ROUTES } from '../config/routeManifest';
import { trials } from '../data/trialListData';

const trialSitemapRoutes = trials
  .filter((trial) => !trial.isPlaceholder)
  .map((trial) => trial.path);

export const SITEMAP_ROUTES = [...STATIC_SITEMAP_ROUTES, ...trialSitemapRoutes];
