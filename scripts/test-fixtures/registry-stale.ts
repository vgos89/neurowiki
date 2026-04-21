// test fixture — citation with stale last_reviewed (2022, 36-month trial window, now expired)
import type { CitationRegistry } from '../../src/lib/citations/schema';

export const CITATION_REGISTRY: CitationRegistry = {
  'trial-stale': {
    id: 'trial-stale',
    source: 'trial',
    title: 'A Stale Trial Citation (fixture)',
    year: 2020,
    pmid: '00000000',
    last_reviewed: '2022-06-15',
    review_window_months: 36,
    quoted_text: 'fixture quoted text',
  },
};
