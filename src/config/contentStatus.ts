import { STATIC_ROUTE_DEFINITIONS } from './routeManifest';

export type ContentItem = {
  published: boolean;
  comingSoonMessage?: string;
};

export type ContentStatus = Record<string, ContentItem>;

export const contentStatus: ContentStatus = Object.fromEntries(
  STATIC_ROUTE_DEFINITIONS.filter((route) => route.publishGate).map((route) => [
    route.path,
    {
      published: route.published ?? true,
      comingSoonMessage: route.comingSoonMessage,
    },
  ])
);

export const isPublished = (path: string): boolean => {
  if (import.meta.env.DEV && import.meta.env.VITE_SHOW_DRAFTS === 'true') {
    return true;
  }

  return contentStatus[path]?.published ?? true;
};

export const getComingSoonMessage = (path: string): string => {
  return contentStatus[path]?.comingSoonMessage || 'This content is coming soon';
};

export const getContentByStatus = (published: boolean) => {
  return Object.entries(contentStatus)
    .filter(([, item]) => item.published === published)
    .map(([path, item]) => ({ path, ...item }));
};
