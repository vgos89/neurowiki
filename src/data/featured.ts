// HOME_SPEC §1.25.7 — FEATURED data array (V-curated)
// HOME_SPEC §1.25.7.1 — type union restricted to pathway | calculator
// HOME_SPEC §1.25.7.2 — build-time length enforcement (cap raised to 4
//                       on 2026-05-17 per V direction — Stroke Code added)

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
    id: 'nihss',
    type: 'calculator',
    name: 'NIHSS',
    description: '15-item stroke severity exam. Range 0–42.',
    categoryColor: '#1746A2',
    href: '/calculators/nihss',
  },
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
    id: 'stroke-code',
    type: 'pathway',
    name: 'Stroke Code',
    description: 'Acute ischemic stroke workflow. LKW, vitals, imaging, orders.',
    categoryColor: '#dc2626',
    href: '/pathways/stroke-code',
  },
];

// HOME_SPEC §1.25.7.2 — build-time enforcement (3–4 entries; cap raised
// to 4 on 2026-05-17 per V direction to add Stroke Code alongside the
// existing EVT / Late-Window IVT / NIHSS featured items).
if (FEATURED.length < 3 || FEATURED.length > 4) {
  throw new Error(
    `FEATURED must contain 3 or 4 entries; found ${FEATURED.length}`,
  );
}
