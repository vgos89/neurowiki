import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Search,
  X,
  Copy,
  FileText,
  Info,
  BadgeCheck,
  ChevronDown,
  Settings,
  Star,
  BarChart2,
  ListChecks,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NpiProvider {
  npi: string;
  firstName: string;
  lastName: string;
  credential: string;
  taxonomy: string;
  address: string;
}

interface Icd10Code {
  code: string;
  name: string;
}

type MdmLevel = 'minimal' | 'low' | 'moderate' | 'high';

type VisitType =
  | 'new_patient_office'
  | 'established_patient_office'
  | 'initial_inpatient'
  | 'subsequent_inpatient'
  | 'consult_outpatient'
  | 'consult_inpatient'
  | 'emergency_dept';

type BillingMode = 'mdm' | 'time';

// Management risk radio options
type ManagementRisk = '' | 'otc_minor' | 'rx_medication' | 'iv_tx_high_risk' | 'major_surgery';

interface DataReviewed {
  reviewedLabsImaging: boolean;
  independentInterpretation: boolean;
  externalNotesReview: boolean;
  discussedWithProvider: boolean;
}

interface EmBillingState {
  // Provider
  npiQuery: string;
  npiResults: NpiProvider[];
  npiLoading: boolean;
  npiError: string | null;
  selectedProvider: NpiProvider | null;
  showNpiDropdown: boolean;
  showNpiPanel: boolean;

  // Diagnoses
  icd10Query: string;
  icd10Results: Icd10Code[];
  icd10Loading: boolean;
  icd10Error: string | null;
  selectedDiagnoses: Icd10Code[];
  showIcd10Dropdown: boolean;

  // Visit context
  visitType: VisitType;
  specialty: string;

  // Billing mode
  billingMode: BillingMode;

  // MDM inputs
  problemLevelOverride: MdmLevel | null;
  dataReviewed: DataReviewed;
  managementRisk: ManagementRisk;

  // Time-based
  timeMinutes: string;

  // Billing context
  dateOfService: string; // ISO date string YYYY-MM-DD
  selectedModifiers: string[]; // e.g. ['-25', '-AI']

  // UI
  toast: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'neurowiki:em-billing:provider';

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  new_patient_office: 'Office Visit (New Patient)',
  established_patient_office: 'Office Visit (Established Patient)',
  initial_inpatient: 'Initial Hospital Inpatient (H&P)',
  subsequent_inpatient: 'Subsequent Hospital Care',
  consult_outpatient: 'Consultation (Outpatient)',
  consult_inpatient: 'Consultation (Inpatient)',
  emergency_dept: 'Emergency Department',
};

// CMS Place of Service (POS) codes
const VISIT_TYPE_POS: Record<VisitType, string> = {
  new_patient_office: '11 — Office',
  established_patient_office: '11 — Office',
  initial_inpatient: '21 — Inpatient Hospital',
  subsequent_inpatient: '21 — Inpatient Hospital',
  consult_outpatient: '11 — Office',
  consult_inpatient: '21 — Inpatient Hospital',
  emergency_dept: '23 — Emergency Room – Hospital',
};

// Common billing modifiers per visit type (for reference, not auto-appended to CPT)
const VISIT_TYPE_MODIFIERS: Record<VisitType, { code: string; label: string }[]> = {
  new_patient_office: [
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure' },
    { code: '-57', label: 'Decision for surgery (major procedure, same or next day)' },
  ],
  established_patient_office: [
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure' },
    { code: '-57', label: 'Decision for surgery (major procedure, same or next day)' },
  ],
  initial_inpatient: [
    { code: '-AI', label: 'Principal physician of record (attending)' },
    { code: '-GC', label: 'Service performed in part by resident under teaching physician' },
  ],
  subsequent_inpatient: [
    { code: '-AI', label: 'Principal physician of record (attending)' },
    { code: '-GC', label: 'Service performed in part by resident under teaching physician' },
  ],
  consult_outpatient: [
    { code: '-32', label: 'Mandated service (insurance/legal/employer-required)' },
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure' },
  ],
  consult_inpatient: [
    { code: '-AI', label: 'Principal physician of record (attending)' },
    { code: '-32', label: 'Mandated service' },
    { code: '-GC', label: 'Service performed in part by resident under teaching physician' },
  ],
  emergency_dept: [
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure' },
  ],
};

// MDM problem justification text for audit doc
const PROBLEM_JUSTIFICATION: Record<MdmLevel, string> = {
  minimal: 'One self-limited or minor problem (e.g., cold, insect bite)',
  low: 'One stable chronic illness, or one acute uncomplicated illness/injury, or two or more self-limited problems',
  moderate: 'One or more chronic illnesses with exacerbation/progression/side effects; or one undiagnosed new problem with uncertain prognosis; or one acute illness with systemic symptoms',
  high: 'One or more chronic illnesses with severe exacerbation/progression/side effects; or one acute or chronic illness/injury posing a threat to life or bodily function',
};

const DATA_JUSTIFICATION: Record<MdmLevel, string> = {
  minimal: 'Minimal or no data reviewed',
  low: 'Limited data — review of prior external notes or ordering of tests only',
  moderate: 'Moderate data — independent interpretation of results and/or discussion with treating provider',
  high: 'Extensive data — independent interpretation of results from tests ordered by another provider and discussion of management',
};

const RISK_JUSTIFICATION: Record<MdmLevel, string> = {
  minimal: 'Minimal risk — self-limited problem, no prescription drug management',
  low: 'Low risk — OTC drugs, minor surgery with no identified risk factors, PT/OT, IV fluids without additives',
  moderate: 'Moderate risk — prescription drug management, minor surgery with identified risk factors, new presenting illness requiring hospitalization decision, diagnosis or treatment significantly limited by social determinants',
  high: 'High risk — drug therapy requiring intensive monitoring for toxicity, elective major surgery with identified risk factors, diagnosis or treatment significantly limited by social determinants of health',
};

const SPECIALTIES = [
  'Neurology',
  'Neurosurgery',
  'Internal Medicine',
  'Family Medicine',
  'Emergency Medicine',
  'Hospitalist',
  'Cardiology',
  'Psychiatry',
];

const MDM_LEVEL_ORDER: MdmLevel[] = ['minimal', 'low', 'moderate', 'high'];

const MDM_LEVEL_LABELS: Record<MdmLevel, string> = {
  minimal: 'MIN',
  low: 'LOW',
  moderate: 'MOD',
  high: 'HIGH',
};

const MDM_LEVEL_FULL: Record<MdmLevel, string> = {
  minimal: 'Minimal',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

const MDM_LEVEL_DESCRIPTIONS: Record<MdmLevel, string> = {
  minimal: 'Self-limited or minor problem. Minimal data review and management risk.',
  low: 'Low complexity with a stable chronic illness or acute uncomplicated problem. Limited data review.',
  moderate: 'Moderate complexity with a chronic illness with exacerbation or new problem. Prescription management involved.',
  high: 'High complexity with threat to life or bodily function. Drug therapy requiring intensive monitoring or hospitalization decision.',
};

const MANAGEMENT_RISK_LABELS: Record<ManagementRisk, string> = {
  '': 'None selected',
  otc_minor: 'OTC Medication / Minor Procedure (Low Risk)',
  rx_medication: 'Rx Medication Management (Moderate Risk)',
  iv_tx_high_risk: 'IV Therapy / High Risk Drug (High Risk)',
  major_surgery: 'Major Surgery Decision (High Risk)',
};

const MANAGEMENT_RISK_TO_MDM: Record<ManagementRisk, MdmLevel> = {
  '': 'minimal',
  otc_minor: 'low',
  rx_medication: 'moderate',
  iv_tx_high_risk: 'high',
  major_surgery: 'high',
};

// ─── CPT Code Tables ──────────────────────────────────────────────────────────

interface CptEntry {
  code: string;
  description: string;
}

const MDM_CPT: Record<VisitType, Partial<Record<MdmLevel, CptEntry>>> = {
  new_patient_office: {
    low: { code: '99202', description: 'New Patient Office — Straightforward' },
    moderate: { code: '99204', description: 'New Patient Office — Moderate Complexity' },
    high: { code: '99205', description: 'New Patient Office — High Complexity' },
  },
  established_patient_office: {
    minimal: { code: '99211', description: 'Established Patient Office — Minimal' },
    low: { code: '99213', description: 'Established Patient Office — Low Complexity' },
    moderate: { code: '99214', description: 'Established Patient Office — Moderate Complexity' },
    high: { code: '99215', description: 'Established Patient Office — High Complexity' },
  },
  initial_inpatient: {
    low: { code: '99221', description: 'Initial Inpatient Care — Straightforward / Low' },
    moderate: { code: '99222', description: 'Initial Inpatient Care — Moderate Complexity' },
    high: { code: '99223', description: 'Initial Inpatient Care — High Complexity' },
  },
  subsequent_inpatient: {
    low: { code: '99231', description: 'Subsequent Inpatient Care — Straightforward / Low' },
    moderate: { code: '99232', description: 'Subsequent Inpatient Care — Moderate Complexity' },
    high: { code: '99233', description: 'Subsequent Inpatient Care — High Complexity' },
  },
  consult_outpatient: {
    low: { code: '99243', description: 'Outpatient Consultation — Low Complexity' },
    moderate: { code: '99244', description: 'Outpatient Consultation — Moderate Complexity' },
    high: { code: '99245', description: 'Outpatient Consultation — High Complexity' },
  },
  consult_inpatient: {
    low: { code: '99253', description: 'Inpatient Consultation — Low Complexity' },
    moderate: { code: '99254', description: 'Inpatient Consultation — Moderate Complexity' },
    high: { code: '99255', description: 'Inpatient Consultation — High Complexity' },
  },
  emergency_dept: {
    low: { code: '99283', description: 'Emergency Department — Moderate Severity' },
    moderate: { code: '99284', description: 'Emergency Department — Moderate-High Severity' },
    high: { code: '99285', description: 'Emergency Department — High Severity' },
  },
};

interface TimeThreshold {
  min: number;
  max: number | null;
  cpt: string;
  label: string;
}

const TIME_THRESHOLDS: Record<VisitType, TimeThreshold[]> = {
  new_patient_office: [
    { min: 15, max: 29, cpt: '99202', label: '15–29 min' },
    { min: 30, max: 44, cpt: '99203', label: '30–44 min' },
    { min: 45, max: 59, cpt: '99204', label: '45–59 min' },
    { min: 60, max: 74, cpt: '99205', label: '60–74 min' },
  ],
  established_patient_office: [
    { min: 10, max: 19, cpt: '99212', label: '10–19 min' },
    { min: 20, max: 29, cpt: '99213', label: '20–29 min' },
    { min: 30, max: 39, cpt: '99214', label: '30–39 min' },
    { min: 40, max: 54, cpt: '99215', label: '40–54 min' },
  ],
  initial_inpatient: [
    { min: 40, max: 54, cpt: '99221', label: '40–54 min' },
    { min: 55, max: 69, cpt: '99222', label: '55–69 min' },
    { min: 70, max: null, cpt: '99223', label: '70+ min' },
  ],
  subsequent_inpatient: [
    { min: 25, max: 34, cpt: '99231', label: '25–34 min' },
    { min: 35, max: 44, cpt: '99232', label: '35–44 min' },
    { min: 45, max: null, cpt: '99233', label: '45+ min' },
  ],
  consult_outpatient: [
    { min: 20, max: 29, cpt: '99242', label: '20–29 min' },
    { min: 30, max: 39, cpt: '99243', label: '30–39 min' },
    { min: 45, max: 59, cpt: '99244', label: '45–59 min' },
    { min: 60, max: null, cpt: '99245', label: '60+ min' },
  ],
  consult_inpatient: [
    { min: 35, max: 44, cpt: '99252', label: '35–44 min' },
    { min: 45, max: 59, cpt: '99253', label: '45–59 min' },
    { min: 60, max: 74, cpt: '99254', label: '60–74 min' },
    { min: 80, max: null, cpt: '99255', label: '80+ min' },
  ],
  emergency_dept: [
    { min: 0, max: 9, cpt: '99281', label: '0–9 min' },
    { min: 10, max: 19, cpt: '99282', label: '10–19 min' },
    { min: 20, max: 29, cpt: '99283', label: '20–29 min' },
    { min: 30, max: 59, cpt: '99284', label: '30–59 min' },
    { min: 60, max: null, cpt: '99285', label: '60+ min' },
  ],
};

// ─── Pure Logic Functions ─────────────────────────────────────────────────────

function levelToNum(l: MdmLevel): number {
  return MDM_LEVEL_ORDER.indexOf(l);
}

function numToLevel(n: number): MdmLevel {
  return MDM_LEVEL_ORDER[Math.max(0, Math.min(3, n))];
}

function deriveProblemLevel(diagnoses: Icd10Code[], override: MdmLevel | null): MdmLevel {
  if (override !== null) return override;
  const count = diagnoses.length;
  if (count === 0) return 'minimal';
  if (count === 1) return 'low';
  if (count === 2) return 'moderate';
  return 'high';
}

function deriveDataLevel(data: DataReviewed): MdmLevel {
  const score =
    (data.reviewedLabsImaging ? 1 : 0) +
    (data.independentInterpretation ? 1 : 0) +
    (data.externalNotesReview ? 1 : 0) +
    (data.discussedWithProvider ? 1 : 0);
  if (score === 0) return 'minimal';
  if (score === 1) return 'low';
  if (score === 2) return 'moderate';
  return 'high';
}

function calculateMdmLevel(problem: MdmLevel, data: MdmLevel, risk: MdmLevel): MdmLevel {
  const sorted = [levelToNum(problem), levelToNum(data), levelToNum(risk)].sort((a, b) => b - a);
  return numToLevel(sorted[1]);
}

function getMdmCpt(visitType: VisitType, mdmLevel: MdmLevel): CptEntry | null {
  const map = MDM_CPT[visitType];
  // Walk down from mdmLevel to find the best match
  let idx = levelToNum(mdmLevel);
  while (idx >= 0) {
    const level = numToLevel(idx);
    if (map[level]) return map[level]!;
    idx--;
  }
  return null;
}

function getTimeCpt(visitType: VisitType, minutes: number): CptEntry | null {
  const thresholds = TIME_THRESHOLDS[visitType];
  const match = thresholds.find(
    (t) => minutes >= t.min && (t.max === null || minutes <= t.max)
  );
  if (!match) return null;
  // Find description from MDM table or use generic label
  for (const map of Object.values(MDM_CPT)) {
    for (const entry of Object.values(map)) {
      if (entry && entry.code === match.cpt) {
        return { code: match.cpt, description: entry.description };
      }
    }
  }
  return { code: match.cpt, description: `${VISIT_TYPE_LABELS[visitType]} — ${match.label}` };
}

// ─── Taxonomy → Specialty Matcher ────────────────────────────────────────────

// Maps NPPES taxonomy description fragments to our SPECIALTIES list entries.
// The taxonomy string from NPPES is free-text (e.g. "Neurology", "Family Medicine",
// "Emergency Medicine (Physician)", "Internal Medicine"). We do a case-insensitive
// substring match, walking the priority list so the most specific match wins.
const TAXONOMY_MAP: { fragment: string; specialty: string }[] = [
  { fragment: 'Neurosurg', specialty: 'Neurosurgery' },
  { fragment: 'Neurol', specialty: 'Neurology' },
  { fragment: 'Emergency', specialty: 'Emergency Medicine' },
  { fragment: 'Family', specialty: 'Family Medicine' },
  { fragment: 'Internal', specialty: 'Internal Medicine' },
  { fragment: 'Cardiol', specialty: 'Cardiology' },
  { fragment: 'Psychiatr', specialty: 'Psychiatry' },
  { fragment: 'Hospital', specialty: 'Hospitalist' },
];

function matchTaxonomyToSpecialty(taxonomy: string): string | null {
  const lower = taxonomy.toLowerCase();
  for (const { fragment, specialty } of TAXONOMY_MAP) {
    if (lower.includes(fragment.toLowerCase())) return specialty;
  }
  return null;
}

// ─── API Functions ────────────────────────────────────────────────────────────

function isNpiNumber(query: string): boolean {
  return /^\d{5,10}$/.test(query.trim());
}

async function fetchNpiProviders(query: string): Promise<NpiProvider[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Route through /api/npi (Vite proxy in dev, Cloudflare Pages function in prod)
  // This avoids CORS issues since the NPPES API returns no CORS headers.
  const params = new URLSearchParams({ version: '2.1' });
  if (isNpiNumber(trimmed)) {
    params.set('search_type', 'NPI');
    params.set('number', trimmed);
  } else {
    const parts = trimmed.split(/\s+/);
    // Single word: search as last_name wildcard; two words: first + last
    params.set('first_name', parts.length >= 2 ? parts[0] : '');
    params.set('last_name', parts.length >= 2 ? parts[1] : parts[0]);
    params.set('limit', '10');
    params.set('enumeration_type', 'NPI-1');
  }
  const url = `/api/npi?${params.toString()}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data.results || data.results.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.results.map((r: any): NpiProvider => {
    const basic = r.basic ?? {};
    const taxonomies: any[] = r.taxonomies ?? [];
    const primary = taxonomies.find((t: any) => t.primary) ?? taxonomies[0] ?? {};
    const addresses: any[] = r.addresses ?? [];
    const loc = addresses.find((a: any) => a.address_purpose === 'LOCATION') ?? addresses[0] ?? {};
    return {
      npi: r.number ?? '',
      firstName: basic.first_name ?? basic.authorized_official_first_name ?? '',
      lastName: basic.last_name ?? basic.authorized_official_last_name ?? '',
      credential: basic.credential ?? '',
      taxonomy: primary.desc ?? 'Unknown Specialty',
      address: [loc.city, loc.state].filter(Boolean).join(', '),
    };
  });
}

async function fetchIcd10Codes(query: string): Promise<Icd10Code[]> {
  if (!query.trim()) return [];
  const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}&maxList=10`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: [number, string[], null, [string, string][]] = await resp.json();
  return (data[3] ?? []).map(([code, name]) => ({ code, name }));
}

// ─── Documentation Generator ──────────────────────────────────────────────────

function generateDocText(
  state: EmBillingState,
  problemLevel: MdmLevel,
  dataLevel: MdmLevel,
  riskLevel: MdmLevel,
  overallMdm: MdmLevel,
  cptEntry: CptEntry | null
): string {
  const {
    selectedProvider, selectedDiagnoses, visitType, specialty,
    billingMode, timeMinutes, dataReviewed, managementRisk,
    dateOfService, selectedModifiers,
  } = state;

  const sep = '─'.repeat(50);
  const lines: string[] = [];

  // ── Header block ──
  lines.push('EVALUATION & MANAGEMENT BILLING DOCUMENTATION');
  lines.push('Generated by NeuroWiki E/M Calculator (2021 AMA MDM)');
  lines.push(sep);

  // ── Administrative / claim fields ──
  lines.push('CLAIM INFORMATION');
  lines.push(`Date of Service (DOS):  ${dateOfService || '[Enter date of service]'}`);
  lines.push(`Visit Type:             ${VISIT_TYPE_LABELS[visitType]}`);
  lines.push(`Place of Service (POS): ${VISIT_TYPE_POS[visitType]}`);
  lines.push(`Specialty:              ${specialty}`);
  if (selectedProvider) {
    const name = `${selectedProvider.firstName} ${selectedProvider.lastName}${selectedProvider.credential ? ', ' + selectedProvider.credential : ''}`;
    lines.push(`Rendering Provider:     ${name}`);
    lines.push(`NPI (Type 1):           ${selectedProvider.npi}`);
    lines.push(`Taxonomy:               ${selectedProvider.taxonomy}`);
    lines.push(`Practice Location:      ${selectedProvider.address || '[Not specified]'}`);
  } else {
    lines.push(`Rendering Provider:     [Not entered — search NPI above]`);
    lines.push(`NPI (Type 1):           [Required for claim submission]`);
  }
  lines.push('');

  // ── CPT / billing code ──
  lines.push('PROCEDURE CODE');
  if (cptEntry) {
    lines.push(`CPT Code:               ${cptEntry.code}`);
    lines.push(`Description:            ${cptEntry.description}`);
    lines.push(`Basis:                  ${billingMode === 'mdm' ? 'Medical Decision Making (MDM)' : 'Total Time on Date of Service'}`);
  } else {
    lines.push(`CPT Code:               [Not determined — complete inputs above]`);
  }
  if (selectedModifiers.length > 0) {
    const modLabels = selectedModifiers
      .map((m) => {
        const found = VISIT_TYPE_MODIFIERS[visitType].find((x) => x.code === m);
        return found ? `${m} (${found.label})` : m;
      })
      .join('; ');
    lines.push(`Modifier(s):            ${modLabels}`);
  }
  lines.push('');

  // ── Diagnoses ──
  lines.push('DIAGNOSIS CODES (ICD-10-CM)');
  if (selectedDiagnoses.length > 0) {
    selectedDiagnoses.forEach((dx, i) => {
      lines.push(`  ${i === 0 ? 'Principal (DX1):' : `Secondary (DX${i + 1}):`.padEnd(17)}  ${dx.code}  ${dx.name}`);
    });
  } else {
    lines.push('  [No diagnoses entered]');
  }
  lines.push('');

  // ── MDM or Time documentation ──
  if (billingMode === 'mdm') {
    lines.push('MEDICAL DECISION MAKING (2021 AMA Table of Risk)');
    lines.push(`Overall MDM Level:      ${MDM_LEVEL_FULL[overallMdm]} Complexity`);
    lines.push(`Qualification:          2-of-3 rule met`);
    lines.push('');

    // Column 1 — Problems
    const probMet = levelToNum(problemLevel) >= levelToNum(overallMdm);
    lines.push(`  [${probMet ? '✓' : ' '}] 1. NUMBER & COMPLEXITY OF PROBLEMS — ${MDM_LEVEL_FULL[problemLevel].toUpperCase()}`);
    lines.push(`      ${PROBLEM_JUSTIFICATION[problemLevel]}`);
    if (selectedDiagnoses.length > 0) {
      selectedDiagnoses.forEach((dx) => lines.push(`      • ${dx.name} (${dx.code})`));
    }
    lines.push('');

    // Column 2 — Data
    const dataMet = levelToNum(dataLevel) >= levelToNum(overallMdm);
    const dataItems: string[] = [];
    if (dataReviewed.reviewedLabsImaging) dataItems.push('Reviewed labs/imaging');
    if (dataReviewed.independentInterpretation) dataItems.push('Independent interpretation of results');
    if (dataReviewed.externalNotesReview) dataItems.push('External notes/records reviewed');
    if (dataReviewed.discussedWithProvider) dataItems.push('Discussion with treating provider');
    lines.push(`  [${dataMet ? '✓' : ' '}] 2. AMOUNT & COMPLEXITY OF DATA — ${MDM_LEVEL_FULL[dataLevel].toUpperCase()}`);
    lines.push(`      ${DATA_JUSTIFICATION[dataLevel]}`);
    dataItems.forEach((item) => lines.push(`      • ${item}`));
    if (dataItems.length === 0) lines.push('      • None documented');
    lines.push('');

    // Column 3 — Risk
    const riskMet = levelToNum(riskLevel) >= levelToNum(overallMdm);
    lines.push(`  [${riskMet ? '✓' : ' '}] 3. RISK OF COMPLICATIONS — ${MDM_LEVEL_FULL[riskLevel].toUpperCase()}`);
    lines.push(`      ${RISK_JUSTIFICATION[riskLevel]}`);
    if (managementRisk) lines.push(`      • ${MANAGEMENT_RISK_LABELS[managementRisk]}`);
    lines.push('');

    const qualifyingCols = [
      { name: 'Problems', level: problemLevel },
      { name: 'Data', level: dataLevel },
      { name: 'Risk', level: riskLevel },
    ]
      .filter((c) => levelToNum(c.level) >= levelToNum(overallMdm))
      .map((c) => c.name);
    lines.push(`  Qualifying columns (≥2 required): ${qualifyingCols.join(' + ')}`);
  } else {
    // Time-based
    const mins = parseInt(timeMinutes, 10);
    lines.push('TIME-BASED BILLING DOCUMENTATION');
    lines.push(`Total time on date of service: ${isNaN(mins) ? '[Enter minutes]' : `${mins} minutes`}`);
    lines.push('(Per CMS: includes all time personally spent by provider on DOS —');
    lines.push(' history, exam, MDM, ordering tests, care coordination, documentation)');
    if (selectedDiagnoses.length > 0) {
      lines.push('');
      lines.push('Conditions managed during encounter:');
      selectedDiagnoses.forEach((dx) => lines.push(`  • ${dx.name} (${dx.code})`));
    }
  }

  lines.push('');
  lines.push(sep);
  lines.push('ATTESTATION');
  lines.push('I personally performed/supervised the services described above.');
  lines.push('The medical necessity and level of service are supported by the');
  lines.push('clinical documentation in the medical record.');
  lines.push('');
  lines.push(`Signature: _______________________________  Date: ___________`);
  if (selectedProvider) {
    lines.push(`           ${selectedProvider.firstName} ${selectedProvider.lastName}${selectedProvider.credential ? ', ' + selectedProvider.credential : ''}`);
    lines.push(`           NPI ${selectedProvider.npi}`);
  }
  lines.push('');
  lines.push(sep);
  lines.push('NOTE: This output is a documentation aid. It does not constitute');
  lines.push('legal or compliance advice. Verify CPT codes and modifiers with');
  lines.push('your institutional billing compliance team before submission.');

  return lines.join('\n');
}

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE: EmBillingState = {
  npiQuery: '',
  npiResults: [],
  npiLoading: false,
  npiError: null,
  selectedProvider: null,
  showNpiDropdown: false,
  showNpiPanel: false,

  icd10Query: '',
  icd10Results: [],
  icd10Loading: false,
  icd10Error: null,
  selectedDiagnoses: [],
  showIcd10Dropdown: false,

  visitType: 'initial_inpatient',
  specialty: 'Neurology',

  billingMode: 'mdm',

  problemLevelOverride: null,
  dataReviewed: {
    reviewedLabsImaging: false,
    independentInterpretation: false,
    externalNotesReview: false,
    discussedWithProvider: false,
  },
  managementRisk: '',

  timeMinutes: '',

  dateOfService: new Date().toISOString().split('T')[0],
  selectedModifiers: [],

  toast: null,
};

// ─── Component ────────────────────────────────────────────────────────────────

const EmBillingCalculator: React.FC = () => {
  const [state, setState] = useState<EmBillingState>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const provider = JSON.parse(raw) as NpiProvider;
        return { ...INITIAL_STATE, selectedProvider: provider };
      }
    } catch (_) {}
    return INITIAL_STATE;
  });

  const { getBackPath } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { trackResult } = useCalculatorAnalytics('em_billing');

  const npiDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const icd10Debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const icd10InputRef = useRef<HTMLInputElement>(null);
  const npiInputRef = useRef<HTMLInputElement>(null);

  const set = useCallback((patch: Partial<EmBillingState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  // ── Derived MDM values ──
  const problemLevel = deriveProblemLevel(state.selectedDiagnoses, state.problemLevelOverride);
  const dataLevel = deriveDataLevel(state.dataReviewed);
  const riskLevel = MANAGEMENT_RISK_TO_MDM[state.managementRisk];
  const overallMdm = calculateMdmLevel(problemLevel, dataLevel, riskLevel);

  const mdmCpt = getMdmCpt(state.visitType, overallMdm);
  const timeMins = parseInt(state.timeMinutes, 10);
  const timeCpt = !isNaN(timeMins) && timeMins > 0 ? getTimeCpt(state.visitType, timeMins) : null;
  const activeCpt = state.billingMode === 'mdm' ? mdmCpt : timeCpt;

  // Track analytics when CPT code is determined
  useEffect(() => {
    if (activeCpt) {
      trackResult(activeCpt.code);
    }
  }, [activeCpt?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (npiInputRef.current && !npiInputRef.current.closest('.npi-search-area')?.contains(target)) {
        set({ showNpiDropdown: false });
      }
      if (icd10InputRef.current && !icd10InputRef.current.closest('.icd10-search-area')?.contains(target)) {
        set({ showIcd10Dropdown: false });
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [set]);

  // ── NPI search ──
  const handleNpiQuery = (value: string) => {
    set({ npiQuery: value, npiError: null });
    if (npiDebounce.current) clearTimeout(npiDebounce.current);
    if (value.trim().length < 2) {
      set({ npiResults: [], showNpiDropdown: false });
      return;
    }
    npiDebounce.current = setTimeout(async () => {
      set({ npiLoading: true });
      try {
        const results = await fetchNpiProviders(value);
        set({ npiResults: results, showNpiDropdown: true, npiLoading: false });
      } catch (_) {
        set({ npiError: 'NPI lookup failed. Check your connection.', npiLoading: false, showNpiDropdown: false });
      }
    }, 300);
  };

  const selectProvider = (provider: NpiProvider) => {
    // Auto-match provider's NPPES taxonomy to the Specialty dropdown
    const matchedSpecialty = matchTaxonomyToSpecialty(provider.taxonomy);
    set({
      selectedProvider: provider,
      showNpiDropdown: false,
      npiQuery: '',
      npiResults: [],
      showNpiPanel: false,
      ...(matchedSpecialty ? { specialty: matchedSpecialty } : {}),
    });
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(provider)); } catch (_) {}
  };

  const clearProvider = () => {
    set({ selectedProvider: null });
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  };

  // ── ICD-10 search ──
  const handleIcd10Query = (value: string) => {
    set({ icd10Query: value, icd10Error: null });
    if (icd10Debounce.current) clearTimeout(icd10Debounce.current);
    if (value.trim().length < 2) {
      set({ icd10Results: [], showIcd10Dropdown: false });
      return;
    }
    icd10Debounce.current = setTimeout(async () => {
      set({ icd10Loading: true });
      try {
        const results = await fetchIcd10Codes(value);
        set({ icd10Results: results, showIcd10Dropdown: true, icd10Loading: false });
      } catch (_) {
        set({ icd10Error: 'ICD-10 lookup failed. Try again.', icd10Loading: false, showIcd10Dropdown: false });
      }
    }, 300);
  };

  const addDiagnosis = (code: Icd10Code) => {
    if (state.selectedDiagnoses.some((d) => d.code === code.code)) {
      set({ icd10Query: '', icd10Results: [], showIcd10Dropdown: false });
      return;
    }
    set({
      selectedDiagnoses: [...state.selectedDiagnoses, code],
      icd10Query: '',
      icd10Results: [],
      showIcd10Dropdown: false,
      problemLevelOverride: null,
    });
    setTimeout(() => icd10InputRef.current?.focus(), 50);
  };

  const removeDiagnosis = (code: string) => {
    set({
      selectedDiagnoses: state.selectedDiagnoses.filter((d) => d.code !== code),
      problemLevelOverride: null,
    });
  };

  // ── Copy / Reset ──
  const docText = generateDocText(state, problemLevel, dataLevel, riskLevel, overallMdm, activeCpt);

  const copyNote = () => {
    navigator.clipboard.writeText(docText);
    set({ toast: 'Copied to clipboard' });
    setTimeout(() => set({ toast: null }), 2000);
  };

  const resetAll = () => {
    setState((s) => ({
      ...INITIAL_STATE,
      selectedProvider: s.selectedProvider, // keep provider
      specialty: s.specialty,               // keep specialty (may have been auto-set from NPI)
      dateOfService: new Date().toISOString().split('T')[0], // reset to today
    }));
  };

  // ── Progress bar segment helper ──
  const segmentActive = (segLevel: MdmLevel): boolean => {
    return levelToNum(overallMdm) >= levelToNum(segLevel);
  };

  const segmentClasses: Record<MdmLevel, { active: string; muted: string }> = {
    minimal: { active: 'bg-green-400 text-white', muted: 'bg-green-100 text-green-700' },
    low: { active: 'bg-blue-400 text-white', muted: 'bg-blue-100 text-blue-700' },
    moderate: { active: 'bg-orange-400 text-white', muted: 'bg-orange-100 text-orange-700' },
    high: { active: 'bg-red-400 text-white', muted: 'bg-red-100 text-red-700' },
  };

  const providerDisplayName = state.selectedProvider
    ? `Dr. ${state.selectedProvider.firstName} ${state.selectedProvider.lastName}${state.selectedProvider.credential ? ', ' + state.selectedProvider.credential : ''}`
    : null;

  const isFav = isFavorite('em-billing');

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to={getBackPath()}
            aria-label="Back to Calculators"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 leading-none">E/M Billing Calculator</h1>
            <p className="text-xs text-slate-500 mt-0.5">2021 AMA MDM Guidelines</p>
          </div>
          {providerDisplayName && (
            <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              NPI Active: {providerDisplayName}
            </div>
          )}
          {activeCpt && (
            <div className="hidden md:flex items-center gap-1.5 bg-neuro-50 border border-neuro-200 text-neuro-700 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
              CPT {activeCpt.code}
            </div>
          )}
          <button
            onClick={() => toggleFavorite('em-billing')}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className="p-2 text-slate-400 hover:text-yellow-500 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <Star size={18} className={isFav ? 'fill-yellow-400 text-yellow-400' : ''} />
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-8 pb-12 pt-6 max-w-screen-xl mx-auto">
        {/* ── Page Title Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-neuro-600 flex-shrink-0">
              <BadgeCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Neurowiki <span className="font-normal text-slate-500">Billing</span>
              </h2>
              <p className="text-xs text-slate-400">2021 AMA MDM Framework</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* NPI pill / button */}
            <button
              onClick={() => set({ showNpiPanel: !state.showNpiPanel })}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-gray-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neuro-500 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${state.selectedProvider ? 'bg-green-500' : 'bg-slate-300'}`} />
              {providerDisplayName ? `NPI Active: ${providerDisplayName}` : 'Search Provider NPI'}
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            <button
              onClick={() => set({ showNpiPanel: !state.showNpiPanel })}
              aria-label="Provider settings"
              className="p-2 text-slate-500 hover:text-neuro-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* ── NPI Search Panel ── */}
        {state.showNpiPanel && (
          <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Provider NPI Lookup</h3>
              <button onClick={() => set({ showNpiPanel: false })} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Enter a 10-digit NPI number, or "First Last" name to search.</p>
            <div className="npi-search-area relative">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                {state.npiLoading && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                )}
                <input
                  ref={npiInputRef}
                  type="text"
                  value={state.npiQuery}
                  onChange={(e) => handleNpiQuery(e.target.value)}
                  placeholder="e.g. 1234567890 or Sarah Broker"
                  className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                />
              </div>
              {state.npiError && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-xs">
                  <AlertCircle size={12} />
                  {state.npiError}
                </div>
              )}
              {state.showNpiDropdown && state.npiResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {state.npiResults.map((r) => (
                    <button
                      key={r.npi}
                      onClick={() => selectProvider(r)}
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-slate-100 last:border-0"
                    >
                      <div className="w-8 h-8 bg-neuro-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-neuro-700 text-xs font-bold">
                          {r.firstName?.[0]}{r.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">
                          {r.firstName} {r.lastName}{r.credential ? `, ${r.credential}` : ''}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{r.taxonomy}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span>NPI {r.npi}</span>
                          {r.address && <span>· {r.address}</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {state.showNpiDropdown && state.npiResults.length === 0 && !state.npiLoading && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-4 text-sm text-slate-500 text-center">
                  No providers found. Try a different name or NPI.
                </div>
              )}
            </div>
            {state.selectedProvider && (
              <div className="mt-3 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-sm text-green-800 font-medium flex-1">
                  {providerDisplayName} — NPI {state.selectedProvider.npi}
                </span>
                <button onClick={clearProvider} className="text-green-600 hover:text-red-500 transition-colors" aria-label="Clear provider">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Main 12-col Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ═══ LEFT COLUMN — Rapid Entry ═══ */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-900">
                <Zap size={20} className="text-neuro-600" />
                <h2 className="text-lg font-bold">Rapid Entry</h2>
              </div>
              {/* Quick patient toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => set({ visitType: 'new_patient_office', problemLevelOverride: null })}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                    state.visitType === 'new_patient_office'
                      ? 'bg-white text-neuro-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  New Pt
                </button>
                <button
                  onClick={() => set({ visitType: 'established_patient_office', problemLevelOverride: null })}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                    state.visitType === 'established_patient_office'
                      ? 'bg-white text-neuro-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Est Pt
                </button>
              </div>
            </div>

            {/* Visit Type + Specialty + Date of Service */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Visit Type
                </label>
                <div className="relative">
                  <select
                    value={state.visitType}
                    onChange={(e) => set({ visitType: e.target.value as VisitType, problemLevelOverride: null, selectedModifiers: [] })}
                    className="block w-full pl-3 pr-9 py-2.5 text-sm bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 appearance-none text-slate-800"
                  >
                    {(Object.entries(VISIT_TYPE_LABELS) as [VisitType, string][]).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-slate-400">POS: {VISIT_TYPE_POS[state.visitType]}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Specialty
                </label>
                <div className="relative">
                  <select
                    value={state.specialty}
                    onChange={(e) => set({ specialty: e.target.value })}
                    className="block w-full pl-3 pr-9 py-2.5 text-sm bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 appearance-none text-slate-800"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {state.selectedProvider && matchTaxonomyToSpecialty(state.selectedProvider.taxonomy) === state.specialty && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Auto-matched from NPI taxonomy
                  </p>
                )}
              </div>
            </div>

            {/* Date of Service + Modifiers row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Date of Service (DOS)
                </label>
                <input
                  type="date"
                  value={state.dateOfService}
                  onChange={(e) => set({ dateOfService: e.target.value })}
                  className="block w-full pl-3 pr-3 py-2.5 text-sm bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Modifiers
                  <span className="ml-1 font-normal text-slate-400 normal-case">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {VISIT_TYPE_MODIFIERS[state.visitType].map(({ code, label }) => {
                    const active = state.selectedModifiers.includes(code);
                    return (
                      <button
                        key={code}
                        title={label}
                        onClick={() =>
                          set({
                            selectedModifiers: active
                              ? state.selectedModifiers.filter((m) => m !== code)
                              : [...state.selectedModifiers, code],
                          })
                        }
                        className={`px-2.5 py-1.5 text-xs font-bold rounded border transition-all ${
                          active
                            ? 'bg-neuro-600 text-white border-neuro-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-neuro-400'
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                  {VISIT_TYPE_MODIFIERS[state.visitType].length === 0 && (
                    <span className="text-xs text-slate-400 py-2">None common for this visit type</span>
                  )}
                </div>
                {state.selectedModifiers.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    {state.selectedModifiers.map((m) => {
                      const found = VISIT_TYPE_MODIFIERS[state.visitType].find((x) => x.code === m);
                      return found ? `${m}: ${found.label}` : m;
                    }).join(' · ')}
                  </p>
                )}
              </div>
            </div>

            {/* Problems Addressed — ICD-10 */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                <Search size={14} />
                Problems Addressed
              </label>
              <div className="icd10-search-area relative">
                <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-neuro-500 focus-within:border-transparent transition-all">
                  {state.selectedDiagnoses.map((dx) => (
                    <div
                      key={dx.code}
                      className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-sm text-slate-800 shadow-sm"
                    >
                      <span>{dx.name}</span>
                      <span className="text-xs text-slate-400">({dx.code})</span>
                      <button
                        onClick={() => removeDiagnosis(dx.code)}
                        className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${dx.name}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <div className="relative flex-1 min-w-[140px]">
                    <input
                      ref={icd10InputRef}
                      type="text"
                      value={state.icd10Query}
                      onChange={(e) => handleIcd10Query(e.target.value)}
                      placeholder={state.selectedDiagnoses.length === 0 ? 'Search diagnoses (e.g. stroke, migraine)...' : 'Add another...'}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 px-1 text-slate-800 placeholder-slate-400 outline-none"
                    />
                    {state.icd10Loading && (
                      <Loader2 size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                    )}
                  </div>
                </div>
                {state.icd10Error && (
                  <div className="mt-1 flex items-center gap-1 text-red-500 text-xs">
                    <AlertCircle size={12} /> {state.icd10Error}
                  </div>
                )}
                {state.showIcd10Dropdown && state.icd10Results.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    {state.icd10Results.map((code) => (
                      <button
                        key={code.code}
                        onMouseDown={(e) => { e.preventDefault(); addDiagnosis(code); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-slate-100 last:border-0"
                      >
                        <span className="bg-neuro-100 text-neuro-700 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">
                          {code.code}
                        </span>
                        <span className="text-sm text-slate-700">{code.name}</span>
                        {state.selectedDiagnoses.some((d) => d.code === code.code) && (
                          <CheckCircle2 size={14} className="text-green-500 ml-auto flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Billing Mode Toggle */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1 w-full">
                <button
                  onClick={() => set({ billingMode: 'mdm' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded transition-all ${
                    state.billingMode === 'mdm'
                      ? 'bg-white text-neuro-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <BarChart2 size={14} />
                  MDM-Based
                </button>
                <button
                  onClick={() => set({ billingMode: 'time' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded transition-all ${
                    state.billingMode === 'time'
                      ? 'bg-white text-neuro-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Clock size={14} />
                  Time-Based
                </button>
              </div>
            </div>

            {/* ── MDM Section ── */}
            {state.billingMode === 'mdm' && (
              <>
                <div className="bg-gray-50 rounded-xl p-5 border border-slate-200 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Medical Decision Making</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      overallMdm === 'high' ? 'bg-red-100 text-red-700' :
                      overallMdm === 'moderate' ? 'bg-orange-100 text-orange-700' :
                      overallMdm === 'low' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      Current Level: {MDM_LEVEL_LABELS[overallMdm]}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex h-5 rounded-full overflow-hidden mb-4">
                    {MDM_LEVEL_ORDER.map((level) => {
                      const active = segmentActive(level);
                      const cls = active ? segmentClasses[level].active : segmentClasses[level].muted;
                      return (
                        <div
                          key={level}
                          className={`flex-1 flex items-center justify-center text-[10px] font-bold border-r border-white/30 last:border-0 ${cls}`}
                        >
                          {MDM_LEVEL_LABELS[level]}
                        </div>
                      );
                    })}
                  </div>

                  {/* Level description box */}
                  <div className="bg-white rounded-lg p-4 border-l-4 border-neuro-600 shadow-sm flex gap-3">
                    <Info size={18} className="text-neuro-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{MDM_LEVEL_FULL[overallMdm]} Complexity</h4>
                      <p className="text-sm text-slate-600 mt-0.5">{MDM_LEVEL_DESCRIPTIONS[overallMdm]}</p>
                    </div>
                  </div>
                </div>

                {/* Problem complexity override */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Problem Complexity</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        problemLevel === 'high' ? 'bg-red-100 text-red-700' :
                        problemLevel === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        problemLevel === 'low' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {MDM_LEVEL_FULL[problemLevel]}
                        {state.problemLevelOverride === null && (
                          <span className="ml-1 font-normal opacity-70">auto</span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => set({ problemLevelOverride: state.problemLevelOverride !== null ? null : problemLevel })}
                      className="text-xs text-neuro-600 hover:text-neuro-700 font-medium transition-colors"
                    >
                      {state.problemLevelOverride !== null ? 'Auto-derive' : 'Override'}
                    </button>
                  </div>
                  {state.problemLevelOverride !== null && (
                    <div className="mt-3 flex gap-2">
                      {MDM_LEVEL_ORDER.map((level) => (
                        <button
                          key={level}
                          onClick={() => set({ problemLevelOverride: level })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-all ${
                            state.problemLevelOverride === level
                              ? 'bg-neuro-600 text-white border-neuro-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-neuro-400'
                          }`}
                        >
                          {MDM_LEVEL_LABELS[level]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Reviewed + Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data Reviewed */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart2 size={18} className="text-slate-500" />
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Data Reviewed</h3>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ml-auto ${
                        dataLevel === 'high' ? 'bg-red-100 text-red-700' :
                        dataLevel === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        dataLevel === 'low' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {MDM_LEVEL_LABELS[dataLevel]}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      {([
                        { key: 'reviewedLabsImaging', label: 'Reviewed labs / imaging' },
                        { key: 'independentInterpretation', label: 'Independent interpretation of results' },
                        { key: 'externalNotesReview', label: 'External notes / records review' },
                        { key: 'discussedWithProvider', label: 'Discussion with treating provider' },
                      ] as { key: keyof DataReviewed; label: string }[]).map(({ key, label }) => (
                        <label key={key} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={state.dataReviewed[key]}
                            onChange={(e) =>
                              set({ dataReviewed: { ...state.dataReviewed, [key]: e.target.checked } })
                            }
                            className="mt-0.5 w-4 h-4 text-neuro-600 rounded border-slate-300 focus:ring-neuro-500"
                          />
                          <span className="text-sm text-slate-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Management Risk */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ListChecks size={18} className="text-slate-500" />
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Management</h3>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ml-auto ${
                        riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        riskLevel === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        riskLevel === 'low' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {MDM_LEVEL_LABELS[riskLevel]}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      {([
                        { value: 'otc_minor', label: 'OTC Medication / Minor Procedure' },
                        { value: 'rx_medication', label: 'Rx Medication Management' },
                        { value: 'iv_tx_high_risk', label: 'IV Tx / High Risk Drug' },
                        { value: 'major_surgery', label: 'Major Surgery Decision' },
                      ] as { value: ManagementRisk; label: string }[]).map(({ value, label }) => (
                        <label key={value} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="management-risk"
                            value={value}
                            checked={state.managementRisk === value}
                            onChange={() => set({ managementRisk: value })}
                            className="mt-0.5 w-4 h-4 text-neuro-600 border-slate-300 focus:ring-neuro-500"
                          />
                          <span className="text-sm text-slate-700">{label}</span>
                        </label>
                      ))}
                      {state.managementRisk !== '' && (
                        <button
                          onClick={() => set({ managementRisk: '' })}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-1"
                        >
                          Clear selection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Time-Based Section ── */}
            {state.billingMode === 'time' && (
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Total Encounter Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={state.timeMinutes}
                    onChange={(e) => set({ timeMinutes: e.target.value })}
                    placeholder="e.g. 45"
                    className="w-full pl-4 pr-4 py-3 text-lg font-bold text-slate-900 bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                  />
                </div>

                {/* Time thresholds table */}
                <div className="bg-gray-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-200 bg-white">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Time Thresholds — {VISIT_TYPE_LABELS[state.visitType]}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {TIME_THRESHOLDS[state.visitType].map((t) => {
                      const mins = parseInt(state.timeMinutes, 10);
                      const isActive = !isNaN(mins) && mins >= t.min && (t.max === null || mins <= t.max);
                      return (
                        <div
                          key={t.cpt}
                          className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                            isActive ? 'bg-neuro-50 border-l-4 border-neuro-600' : ''
                          }`}
                        >
                          <span className="text-sm text-slate-600">{t.label}</span>
                          <span className={`text-sm font-bold ${isActive ? 'text-neuro-700' : 'text-slate-700'}`}>
                            {t.cpt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* ── Recommended Code Card ── */}
            <div className="bg-neuro-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start mb-2">
                <span className="bg-white/20 text-xs font-bold tracking-wider px-2 py-1 rounded backdrop-blur-sm uppercase">
                  Recommended Code
                </span>
                <BadgeCheck size={22} className="text-white/80" />
              </div>

              {activeCpt ? (
                <div className="text-center py-4">
                  <div className="text-7xl font-bold tracking-tight mb-2" aria-live="polite">
                    {activeCpt.code}
                  </div>
                  <p className="text-blue-100 font-medium text-base leading-snug">{activeCpt.description}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-blue-200 text-sm">
                  {state.billingMode === 'time' && !state.timeMinutes
                    ? 'Enter encounter time above'
                    : 'Select visit type and inputs above'}
                </div>
              )}

              {/* 3-col MDM summary */}
              {state.billingMode === 'mdm' && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {([
                    { label: 'Prob', level: problemLevel },
                    { label: 'Risk', level: riskLevel },
                    { label: 'Data', level: dataLevel },
                  ] as { label: string; level: MdmLevel }[]).map(({ label, level }) => {
                    const meetsOverall = levelToNum(level) >= levelToNum(overallMdm);
                    return (
                      <div
                        key={label}
                        className={`bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center flex flex-col items-center justify-center ${meetsOverall ? 'border border-white/40' : ''}`}
                      >
                        <div className="flex items-center gap-1 text-blue-100 text-xs font-bold uppercase mb-1">
                          {meetsOverall && <CheckCircle2 size={12} />}
                          {label}
                        </div>
                        <div className="font-bold text-sm">{MDM_LEVEL_LABELS[level]}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-xs text-blue-200">
                <span className="bg-blue-800/50 px-2 py-1 rounded text-[10px] font-bold uppercase">
                  {state.billingMode === 'mdm' ? `MDM: ${MDM_LEVEL_FULL[overallMdm]}` : 'Time-Based'}
                </span>
                <span>Updated live</span>
              </div>
            </div>

            {/* ── Documentation Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase tracking-wide">
                  <FileText size={16} />
                  Documentation
                </div>
                <button
                  onClick={resetAll}
                  className="text-xs font-bold text-neuro-600 hover:text-neuro-700 transition-colors"
                >
                  RESET
                </button>
              </div>
              <div className="p-5 flex-1 text-sm leading-relaxed text-slate-700 font-mono min-h-[180px]">
                <div className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600 mb-3">
                  {state.billingMode === 'mdm' ? 'MDM PATHWAY:' : 'TIME-BASED:'}
                </div>
                {state.selectedDiagnoses.length > 0 || state.billingMode === 'time' ? (
                  <div className="whitespace-pre-wrap text-xs leading-relaxed">
                    {/* Render first paragraph with diagnosis highlights */}
                    {state.billingMode === 'mdm' && state.selectedDiagnoses.length > 0 ? (
                      <>
                        <p>
                          <span className="font-semibold">{MDM_LEVEL_FULL[overallMdm]} Complexity</span> Decision Making (Meets 2 of 3 criteria). Patient presents with{' '}
                          {state.selectedDiagnoses.map((dx, i) => (
                            <React.Fragment key={dx.code}>
                              <span className="bg-yellow-100 text-yellow-800 border-b border-yellow-300 font-medium px-1">
                                {dx.name}
                              </span>
                              {` (${dx.code})`}
                              {i < state.selectedDiagnoses.length - 1 ? ', ' : '.'}
                            </React.Fragment>
                          ))}
                        </p>
                        <p className="mt-3 text-slate-500 text-xs">
                          Prob: {MDM_LEVEL_FULL[problemLevel]} · Data: {MDM_LEVEL_FULL[dataLevel]} · Risk: {MDM_LEVEL_FULL[riskLevel]}
                        </p>
                        {activeCpt && (
                          <p className="mt-2 font-semibold text-slate-800">
                            CPT: {activeCpt.code} — {activeCpt.description}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-600">{docText}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">
                    Add diagnoses and complete the MDM inputs above to generate documentation.
                  </p>
                )}
              </div>
              <div className="p-4 border-t border-slate-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={copyNote}
                  className="w-full bg-neuro-600 hover:bg-neuro-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  COPY TO NOTE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {state.toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold animate-in fade-in zoom-in-95 duration-200 z-[60] whitespace-nowrap">
          {state.toast}
        </div>
      )}
    </div>
  );
};

export default EmBillingCalculator;
