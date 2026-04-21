// test fixture — claim is registered, but only declares data surface; jsx tag found in source
import type { ClaimRegistry } from '../../src/lib/citations/schema';

export const CLAIM_REGISTRY: ClaimRegistry = {
  'gcs-mild': {
    id: 'gcs-mild',
    citation_ids: [],
    surfaces: [{ type: 'data', field: 'claimId' }],
    description: 'fixture: declares data surface only, but jsx tag exists in source',
  },
};
