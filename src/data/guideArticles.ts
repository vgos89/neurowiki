// Guide hub — article data and area metadata
// HUB_SPEC v1.3 — Guide hub data layer
// 5 areas, 15 articles.
// tpa-eligibility alias removed (301 redirect to /guide/iv-tpa in vercel.json).
// stroke-basics not in Guide nav (pathway, accessible at /pathways/stroke-code).

export type GuideArea = 'vascular' | 'epilepsy' | 'neurocritical' | 'general' | 'neuromuscular';

export interface GuideArticle {
  id: string;       // 'guide-{slug}' — matches useRecents entry ID
  path: string;     // /guide/{slug}
  name: string;
  description: string;
  area: GuideArea;
  readTime: string; // e.g. '4 min read', '6 min read', 'Interactive ref'
}

export interface AreaMeta {
  id: GuideArea;
  label: string;
  lede: string;
  dotColor: string;    // Tailwind bg-* class for pill dot
  rowCategory: string; // CSS row-{slug} suffix used by ToolRowCard
}

// ── Area metadata ─────────────────────────────────────────────────────────────

export const AREA_META: AreaMeta[] = [
  {
    id: 'vascular',
    label: 'Vascular Neurology',
    lede: 'Stroke, TIA, hemorrhage, thrombectomy',
    dotColor: 'bg-neuro-500',
    rowCategory: 'vascular',
  },
  {
    id: 'epilepsy',
    label: 'Epilepsy & Seizures',
    lede: 'Status epilepticus, first-seizure workup',
    dotColor: 'bg-amber-500',
    rowCategory: 'epilepsy',
  },
  {
    id: 'neurocritical',
    label: 'Neurocritical Care',
    lede: 'AMS, meningitis, ICP, emergencies',
    dotColor: 'bg-violet-500',
    rowCategory: 'critical',
  },
  {
    id: 'general',
    label: 'General Neurology',
    lede: 'Headache, vertigo, weakness workups',
    dotColor: 'bg-slate-400',
    rowCategory: 'general',
  },
  {
    id: 'neuromuscular',
    label: 'Neuromuscular & Neuroimmunology',
    lede: 'GBS, MG, MS — diagnosis and management',
    dotColor: 'bg-emerald-500',
    rowCategory: 'neuromuscular',
  },
];

// ── Article data ──────────────────────────────────────────────────────────────
// Read-time heuristic: <80 lines → 4 min, 80–120 → 6 min, 120–200 → 8 min,
// >200 → 12 min. StrokeGuidelineMindmap (1008 lines, interactive) → 'Interactive ref'.

export const GUIDE_ARTICLES: GuideArticle[] = [
  // ── Vascular Neurology (5) ────────────────────────────────────────────────
  {
    id: 'guide-iv-tpa',
    path: '/guide/iv-tpa',
    name: 'IV Thrombolytic Protocol',
    description: 'Alteplase and tenecteplase eligibility, dosing, inclusions/exclusions',
    area: 'vascular',
    readTime: '8 min read',
  },
  {
    id: 'guide-thrombectomy',
    path: '/guide/thrombectomy',
    name: 'Mechanical Thrombectomy',
    description: 'EVT eligibility, imaging selection, ASPECTS, post-procedure management',
    area: 'vascular',
    readTime: '6 min read',
  },
  {
    id: 'guide-acute-stroke-mgmt',
    path: '/guide/acute-stroke-mgmt',
    name: 'Acute Stroke Management',
    description: 'BP targets, glucose, antiplatelet initiation, DVT prophylaxis, secondary prevention',
    area: 'vascular',
    readTime: '6 min read',
  },
  {
    id: 'guide-ich-management',
    path: '/guide/ich-management',
    name: 'ICH Management',
    description: 'Rapid BP reduction, 4-factor PCC reversal, cerebellar surgery criteria',
    area: 'vascular',
    readTime: '6 min read',
  },
  {
    id: 'guide-aha-2026-guideline',
    path: '/guide/aha-2026-guideline',
    name: '2026 AHA/ASA Guideline',
    description: 'Interactive mindmap of the 2026 AHA/ASA acute ischemic stroke guideline',
    area: 'vascular',
    readTime: 'Interactive ref',
  },
  // ── Epilepsy & Seizures (2) ────────────────────────────────────────────────
  {
    id: 'guide-status-epilepticus',
    path: '/guide/status-epilepticus',
    name: 'Status Epilepticus',
    description: 'Lorazepam → levetiracetam/VPA/fosphenytoin → refractory SE (ESETT-aligned)',
    area: 'epilepsy',
    readTime: '6 min read',
  },
  {
    id: 'guide-seizure-workup',
    path: '/guide/seizure-workup',
    name: 'Seizure Workup',
    description: 'First-seizure evaluation, EEG, MRI, AED initiation, recurrence risk',
    area: 'epilepsy',
    readTime: '4 min read',
  },
  // ── Neurocritical Care (2) ────────────────────────────────────────────────
  {
    id: 'guide-altered-mental-status',
    path: '/guide/altered-mental-status',
    name: 'Altered Mental Status',
    description: 'Structured workup — toxic-metabolic, CNS, systemic causes',
    area: 'neurocritical',
    readTime: '4 min read',
  },
  {
    id: 'guide-meningitis',
    path: '/guide/meningitis',
    name: 'Bacterial Meningitis',
    description: 'Empiric antibiotics, dexamethasone timing, LP interpretation, CSF analysis',
    area: 'neurocritical',
    readTime: '6 min read',
  },
  // ── General Neurology (3) ─────────────────────────────────────────────────
  {
    id: 'guide-headache-workup',
    path: '/guide/headache-workup',
    name: 'Headache Workup',
    description: 'SNOOP4 red flags, thunderclap evaluation, LP for SAH, imaging criteria',
    area: 'general',
    readTime: '4 min read',
  },
  {
    id: 'guide-vertigo',
    path: '/guide/vertigo',
    name: 'Vertigo',
    description: 'BPPV Epley, HINTS exam for stroke vs. peripheral, Dix-Hallpike',
    area: 'general',
    readTime: '4 min read',
  },
  {
    id: 'guide-weakness-workup',
    path: '/guide/weakness-workup',
    name: 'Weakness Workup',
    description: 'UMN vs LMN localization, NMJ, myopathy, MRC grading, diagnostic algorithm',
    area: 'general',
    readTime: '4 min read',
  },
  // ── Neuromuscular & Neuroimmunology (3) ───────────────────────────────────
  {
    id: 'guide-gbs',
    path: '/guide/gbs',
    name: 'Guillain-Barré Syndrome',
    description: 'Brighton criteria, NCS findings, IVIG vs. plasmapheresis, NIF/FVC monitoring',
    area: 'neuromuscular',
    readTime: '4 min read',
  },
  {
    id: 'guide-myasthenia-gravis',
    path: '/guide/myasthenia-gravis',
    name: 'Myasthenia Gravis',
    description: 'Myasthenic crisis, IVIG/plasmapheresis, pyridostigmine dosing, thymectomy',
    area: 'neuromuscular',
    readTime: '6 min read',
  },
  {
    id: 'guide-multiple-sclerosis',
    path: '/guide/multiple-sclerosis',
    name: 'Multiple Sclerosis',
    description: 'McDonald criteria, relapse management, DMT overview and monitoring',
    area: 'neuromuscular',
    readTime: '4 min read',
  },
];
