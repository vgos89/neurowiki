// HOME_SPEC §1.25.7 — FEATURED data array (V-curated, exactly 3 entries)
// HOME_SPEC §1.25.7.1 — type union restricted to pathway | calculator
// HOME_SPEC §1.25.7.2 — build-time length enforcement

export type FeaturedItem = {
  id: string;
  type: 'pathway' | 'calculator';
  name: string;
  description: string;
  categoryColor: string;
  href: string;
};

export const FEATURED: FeaturedItem[] = [
  {
    id: 'evt-pathway',
    type: 'pathway',
    name: 'EVT Pathway',
    description: 'LVO triage from imaging to decision in under 60 seconds.',
    categoryColor: '#1746A2',
    href: '/pathways/evt',
  },
  {
    id: 'late-window-ivt',
    type: 'pathway',
    name: 'Late-Window IVT',
    description: 'tPA in 4.5–9 h or wake-up window with imaging.',
    categoryColor: '#10b981',
    href: '/pathways/late-window-ivt',
  },
  {
    id: 'nihss',
    type: 'calculator',
    name: 'NIHSS',
    description: '15-item stroke severity exam. Range 0–42.',
    categoryColor: '#1746A2',
    href: '/calculators/nihss',
  },
];

// HOME_SPEC §1.25.7.2 — build-time enforcement of exactly 3 entries
if (FEATURED.length !== 3) {
  throw new Error(
    `FEATURED must contain exactly 3 entries; found ${FEATURED.length}`,
  );
}
