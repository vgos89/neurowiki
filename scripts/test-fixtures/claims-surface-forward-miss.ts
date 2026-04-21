// test fixture — claim declares jsx surface but no matching tag exists in source
import type { ClaimRegistry } from '../../src/lib/citations/schema';

export const CLAIM_REGISTRY: ClaimRegistry = {
  'gcs-mild': {
    id: 'gcs-mild',
    citation_ids: [],
    surfaces: [{ type: 'jsx', attribute: 'data-claim' }],
    description: 'fixture: declared surface with no matching tag',
  },
};
