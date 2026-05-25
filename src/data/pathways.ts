// PATHWAY_SPEC §1 — Pathways hub data (single source of truth for hub display)
// HUB_SPEC v1.3 §1.4.1 — pill row: All · Acute stroke · Status · Headache (4 pills)
// NOTE: ICH pill omitted — no /pathways/ich-* routes exist. Per CLAUDE.md §3,
// committed spec (HUB_SPEC §1.4.1 + hub-reference.html) beats in-session prompt text.
// Scenario IDs match src/data/scenarios.ts vocabulary for URL param consistency.
// Trail slot: step count — N bolded per HUB_SPEC §1.6.4.

export type PathwayScenarioId = 'acute-stroke' | 'status-epilepticus' | 'severe-headache';

export interface PathwayEntry {
  id: string;
  name: string;
  description: string;
  scenario: PathwayScenarioId;
  path: string;
  /** Actual step count from the STEPS array in each pathway component */
  stepCount: number;
  /** Drives row-{rowCategory} CSS class on ToolRowCard */
  rowCategory: string;
}

export interface PathwayScenarioMeta {
  id: PathwayScenarioId;
  pillLabel: string;
  dotClass: string;
  lede: string;
}

// HUB_SPEC v1.3 §1.4.1 — 3 non-All pills for Pathways hub
export const PATHWAY_SCENARIOS: PathwayScenarioMeta[] = [
  {
    id: 'acute-stroke',
    pillLabel: 'Acute stroke',
    dotClass: 'dot-ivt',
    lede: 'Triage, imaging, and treatment decision trees.',
  },
  {
    id: 'status-epilepticus',
    pillLabel: 'Status',
    dotClass: 'dot-status',
    lede: 'Stage-based protocol from first-line to refractory SE.',
  },
  {
    id: 'severe-headache',
    pillLabel: 'Headache',
    dotClass: 'dot-prevention',
    lede: 'Acute and recurrent headache workup and abortive treatment.',
  },
];

// HUB_SPEC §5 — alphabetical by name within each scenario
// Step counts verified from STEPS arrays in source components (2026-05-05).
export const PATHWAYS: PathwayEntry[] = [
  // ── Acute stroke ─────────────────────────────────────────────────────────────
  {
    id: 'post-stroke-lipid',
    name: 'Post-Stroke Lipid Management',
    description: 'LDL-C targets and escalation sequence after ischaemic stroke or ICH. 2026 ACC/AHA.',
    scenario: 'acute-stroke',
    path: '/guide/post-stroke-lipid-management',
    stepCount: 3,        // Regimen / Escalation / Plan (ischaemic arm)
    rowCategory: 'prevention',
  },
  {
    id: 'elan-pathway',
    name: 'ELAN Pathway',
    description: 'DOAC timing after ischemic stroke with atrial fibrillation.',
    scenario: 'acute-stroke',
    path: '/pathways/elan-pathway',
    stepCount: 4,        // Eligibility / Classification / Timing / Protocol
    rowCategory: 'ivt',
  },
  {
    id: 'evt-pathway',
    name: 'EVT Pathway',
    description: 'LVO triage from imaging to groin puncture.',
    scenario: 'acute-stroke',
    path: '/pathways/evt',
    stepCount: 4,        // Triage / Clinical / Imaging / Decision
    rowCategory: 'evt',
  },
  {
    id: 'late-window-ivt',
    name: 'Late-Window IVT',
    description: 'tPA eligibility in 4.5–9 h window or wake-up stroke.',
    scenario: 'acute-stroke',
    path: '/pathways/late-window-ivt',
    stepCount: 3,        // Setup / Criteria / Decision
    rowCategory: 'ivt',
  },
  {
    id: 'stroke-code',
    name: 'Stroke Code',
    description: 'Door-to-needle protocol for hyperacute ischemic stroke.',
    scenario: 'acute-stroke',
    path: '/pathways/stroke-code',
    stepCount: 4,        // Step1 / Step2 / Step3 / Step4
    rowCategory: 'evt',
  },
  // ── Status epilepticus ───────────────────────────────────────────────────────
  {
    id: 'se-pathway',
    name: 'SE Pathway',
    description: 'Stage 1–3 status epilepticus management.',
    scenario: 'status-epilepticus',
    path: '/pathways/se-pathway',
    stepCount: 4,        // Basics / Benzos / Urgent / Refractory
    rowCategory: 'status',
  },
  // ── Headache ─────────────────────────────────────────────────────────────────
  // Removed 2026-05-15: GCA pathway. The scoring tool we shipped was not a
  // scientifically validated instrument — it was a synthesis of research papers
  // without a published reference rule. NeuroWiki only ships validated tools.
  // If a validated GCA decision rule is published in the future, re-add here.
  {
    id: 'migraine-pathway',
    name: 'ED Migraine Pathway',
    description: 'Emergency department acute migraine — cocktail, nerve blocks, refractory rescue.',
    scenario: 'severe-headache',
    path: '/pathways/migraine-pathway',
    stepCount: 5,        // Safety Screen / Care Setting / Acute TX / Response / Plan
    rowCategory: 'prevention',
  },
  {
    id: 'headache-clinic',
    name: 'Clinic Headache Pathway',
    description: 'Outpatient migraine preventive selection, CGRP escalation, and MOH prevention.',
    scenario: 'severe-headache',
    path: '/pathways/headache-clinic',
    stepCount: 6,        // Profile / Phenotype / Preventive Need / Selection / Acute Opt / Plan
    rowCategory: 'prevention',
  },
];
