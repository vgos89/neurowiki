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
  AlertTriangle,
  User,
  GraduationCap,
  Stethoscope,
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

// Setting: top-level clinical environment selector
type VisitSetting = 'office' | 'hospital' | 'emergency' | 'critical_care';

// Full visit type (setting + sub-type combined)
type VisitType =
  | 'new_patient_office'
  | 'established_patient_office'
  | 'consult_outpatient'
  | 'initial_inpatient'
  | 'subsequent_inpatient'
  | 'observation'
  | 'discharge_day'
  | 'consult_inpatient'
  | 'emergency_dept'
  | 'critical_care';

type BillingMode = 'mdm' | 'time';

type ManagementRisk =
  | ''
  | 'otc_minor'
  | 'rx_medication'
  | 'iv_tx_high_risk'
  | 'major_surgery'
  | 'escalation_of_care'
  | 'parenteral_controlled'
  | 'dnr_discussion';

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
  visitSetting: VisitSetting;
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
  timeActivities: string[];

  // Billing context
  dateOfService: string;
  selectedModifiers: string[];

  // Clinical narrative
  chiefComplaint: string;
  hpiNarrative: string;
  examFindings: string;
  rxDrugName: string;
  residentName: string;
  teachingPhysicianName: string;

  // UI
  toast: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'neurowiki:em-billing:provider';

// Setting → sub-types mapping
const SETTING_LABELS: Record<VisitSetting, string> = {
  office: 'Office',
  hospital: 'Hospital',
  emergency: 'Emergency Dept',
  critical_care: 'Critical Care',
};

const SETTING_SUBTYPES: Record<VisitSetting, { value: VisitType; label: string }[]> = {
  office: [
    { value: 'new_patient_office', label: 'New Patient' },
    { value: 'established_patient_office', label: 'Established Patient' },
    { value: 'consult_outpatient', label: 'Consultation' },
  ],
  hospital: [
    { value: 'initial_inpatient', label: 'Initial (H&P)' },
    { value: 'subsequent_inpatient', label: 'Subsequent' },
    { value: 'observation', label: 'Observation' },
    { value: 'discharge_day', label: 'Discharge Day' },
    { value: 'consult_inpatient', label: 'Consultation' },
  ],
  emergency: [
    { value: 'emergency_dept', label: 'ED Visit' },
  ],
  critical_care: [
    { value: 'critical_care', label: 'Adult Critical Care' },
  ],
};

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  new_patient_office: 'Office Visit — New Patient',
  established_patient_office: 'Office Visit — Established Patient',
  consult_outpatient: 'Outpatient Consultation',
  initial_inpatient: 'Initial Hospital Inpatient/Observation',
  subsequent_inpatient: 'Subsequent Hospital Inpatient/Observation',
  observation: 'Hospital Observation',
  discharge_day: 'Hospital Discharge Day Management',
  consult_inpatient: 'Inpatient Consultation',
  emergency_dept: 'Emergency Department',
  critical_care: 'Critical Care Services',
};

const VISIT_TYPE_POS: Record<VisitType, string> = {
  new_patient_office: '11 — Office',
  established_patient_office: '11 — Office',
  consult_outpatient: '11 — Office',
  initial_inpatient: '21 — Inpatient Hospital',
  subsequent_inpatient: '21 — Inpatient Hospital',
  observation: '21 — Inpatient Hospital',
  discharge_day: '21 — Inpatient Hospital',
  consult_inpatient: '21 — Inpatient Hospital',
  emergency_dept: '23 — Emergency Room',
  critical_care: '21 — Inpatient Hospital',
};

// Visit types that are time-only (no MDM)
const TIME_ONLY_TYPES: VisitType[] = ['discharge_day', 'critical_care'];
// Visit types where time mode is not applicable
const NO_TIME_TYPES: VisitType[] = ['emergency_dept'];
// Consult types that get a Medicare warning
const CONSULT_TYPES: VisitType[] = ['consult_outpatient', 'consult_inpatient'];

const VISIT_TYPE_MODIFIERS: Record<VisitType, { code: string; label: string; plain: string }[]> = {
  new_patient_office: [
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure', plain: 'You performed a separate, complete visit on the same day as a procedure (e.g., injection, biopsy)' },
    { code: '-57', label: 'Decision for surgery made at this visit', plain: 'You decided at this visit that major surgery was needed (performed within the next day)' },
  ],
  established_patient_office: [
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure', plain: 'You performed a separate, complete visit on the same day as a procedure (e.g., injection, biopsy)' },
    { code: '-57', label: 'Decision for surgery made at this visit', plain: 'You decided at this visit that major surgery was needed (performed within the next day)' },
  ],
  consult_outpatient: [
    { code: '-32', label: 'Mandated service (insurance/legal/employer required)', plain: 'This visit was required by a third party — insurance company, employer, or legal requirement' },
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure', plain: 'You also performed a procedure on the same day and this visit was a separate, complete evaluation' },
  ],
  initial_inpatient: [
    { code: '-AI', label: 'Principal physician of record (attending)', plain: "You are the admitting/attending physician responsible for this patient's overall hospital care" },
    { code: '-GC', label: 'Service performed in part by resident under teaching physician supervision', plain: 'A resident was involved — you supervised and are attesting to the services per CMS teaching physician rules' },
  ],
  subsequent_inpatient: [
    { code: '-AI', label: 'Principal physician of record (attending)', plain: "You are the attending physician of record responsible for this patient's overall hospital care" },
    { code: '-GC', label: 'Service performed in part by resident under teaching physician supervision', plain: 'A resident participated — you supervised and are attesting per CMS teaching physician rules' },
  ],
  observation: [
    { code: '-AI', label: 'Principal physician of record (attending)', plain: "You are the attending physician responsible for this observation patient's care" },
    { code: '-GC', label: 'Resident involved — teaching physician supervision', plain: 'A resident was involved in this observation encounter under your supervision' },
  ],
  discharge_day: [
    { code: '-AI', label: 'Principal physician of record', plain: "You are the discharging attending physician of record" },
    { code: '-GC', label: 'Resident involved — teaching physician supervision', plain: 'Resident assisted with discharge — you supervised per CMS rules' },
  ],
  consult_inpatient: [
    { code: '-AI', label: 'Principal physician of record', plain: 'You are taking over as the principal physician for this patient' },
    { code: '-32', label: 'Mandated consultation', plain: 'This inpatient consult was required by a third party or regulatory requirement' },
    { code: '-GC', label: 'Resident involved — teaching physician supervision', plain: 'Resident participated in this consult under your teaching physician supervision' },
  ],
  emergency_dept: [
    { code: '-25', label: 'Significant, separately identifiable E&M same day as procedure', plain: 'You performed a procedure in the ED and this was a separate, complete emergency evaluation' },
    { code: '-GC', label: 'Resident involved — teaching physician supervision', plain: 'Resident evaluated this patient — you supervised per CMS ED teaching rules' },
  ],
  critical_care: [
    { code: '-GC', label: 'Resident involved — teaching physician supervision', plain: 'Resident was involved in critical care — you supervised and performed key portions per CMS rules' },
    { code: '-AI', label: 'Principal physician of record', plain: 'You are the primary attending responsible for this critically ill patient' },
  ],
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
  'Surgery',
];

// Specialty-specific examples for MDM data and problem columns
const SPECIALTY_EXAMPLES: Record<string, { labs: string; imaging: string; problems: { moderate: string; high: string } }> = {
  Neurology: {
    labs: 'CBC, CMP, HbA1c, coagulation, ESR/CRP, TSH, B12, RPR',
    imaging: 'MRI brain/spine, CT head, EEG, EMG/NCS, LP/CSF',
    problems: {
      moderate: 'e.g., new seizure, TIA, MS relapse, migraine with new features, Parkinson\'s exacerbation',
      high: 'e.g., acute stroke, status epilepticus, GBS, NMO crisis, SAH, cord compression',
    },
  },
  Neurosurgery: {
    labs: 'CBC, CMP, coagulation, blood bank',
    imaging: 'CT head/spine, MRI brain/spine, angiography, CTA',
    problems: {
      moderate: 'e.g., herniated disc with radiculopathy, subdural hematoma, Chiari malformation',
      high: 'e.g., acute SAH, intracerebral hemorrhage, cord compression, malignant ICP elevation',
    },
  },
  Hospitalist: {
    labs: 'CBC, BMP/CMP, BNP, troponin, LFTs, lactate, cultures, UA',
    imaging: 'Chest X-ray, CT chest/abdomen, echocardiogram, ultrasound',
    problems: {
      moderate: 'e.g., CHF exacerbation, COPD exacerbation, AKI, hepatic encephalopathy',
      high: 'e.g., septic shock, acute MI, PE, respiratory failure, DKA, GI bleed',
    },
  },
  'Emergency Medicine': {
    labs: 'CBC, BMP, troponin, lactate, D-dimer, coags, UA, tox screen',
    imaging: 'CT head/chest/abdomen, chest X-ray, ECG, bedside ultrasound',
    problems: {
      moderate: 'e.g., chest pain without ischemia, atrial fibrillation, UTI with systemic signs',
      high: 'e.g., STEMI, ischemic stroke, tension pneumothorax, anaphylaxis, aortic dissection',
    },
  },
  Cardiology: {
    labs: 'Troponin, BNP, lipid panel, CBC, CMP, coagulation',
    imaging: 'Echo, stress test, cardiac MRI, coronary angiogram, Holter/event monitor',
    problems: {
      moderate: 'e.g., stable angina with new symptoms, compensated heart failure, new arrhythmia',
      high: 'e.g., STEMI, decompensated CHF, cardiogenic shock, high-risk arrhythmia',
    },
  },
  Psychiatry: {
    labs: 'CBC, CMP, TSH, lithium/VPA level, UDS, clozapine ANC',
    imaging: 'CT/MRI brain (if indicated), EEG',
    problems: {
      moderate: 'e.g., medication-resistant depression, bipolar with mood episode, psychosis stabilizing',
      high: 'e.g., acute suicidality, severe psychosis with danger to self/others, NMS, serotonin syndrome',
    },
  },
  Surgery: {
    labs: 'CBC, CMP, coagulation, T&S, lactate, pre-op labs',
    imaging: 'CT, ultrasound, X-ray, angiography',
    problems: {
      moderate: 'e.g., appendicitis, cholecystitis, incarcerated hernia',
      high: 'e.g., bowel perforation, ruptured AAA, mesenteric ischemia, necrotizing fasciitis',
    },
  },
};

const getSpecialtyExamples = (specialty: string) =>
  SPECIALTY_EXAMPLES[specialty] ?? {
    labs: 'CBC, CMP, and relevant laboratory tests',
    imaging: 'CT, MRI, or other relevant imaging',
    problems: {
      moderate: 'e.g., chronic illness with exacerbation, new undiagnosed problem',
      high: 'e.g., acute illness posing threat to life or bodily function',
    },
  };

const MDM_LEVEL_ORDER: MdmLevel[] = ['minimal', 'low', 'moderate', 'high'];
const MDM_LEVEL_LABELS: Record<MdmLevel, string> = { minimal: 'MIN', low: 'LOW', moderate: 'MOD', high: 'HIGH' };
const MDM_LEVEL_FULL: Record<MdmLevel, string> = { minimal: 'Minimal', low: 'Low', moderate: 'Moderate', high: 'High' };

const MDM_LEVEL_DESCRIPTIONS: Record<MdmLevel, string> = {
  minimal: 'Self-limited or minor problem. No prescription drug management.',
  low: 'Stable chronic illness or acute uncomplicated problem. Limited data review and low-risk management.',
  moderate: 'Chronic illness with exacerbation, or new undiagnosed problem. Prescription drug management involved.',
  high: 'Acute or chronic illness posing a threat to life or bodily function. High-risk management or drug therapy with intensive monitoring.',
};

const MANAGEMENT_RISK_OPTIONS: { value: ManagementRisk; label: string; plain: string; level: MdmLevel }[] = [
  { value: 'otc_minor', label: 'OTC meds or minor procedure', plain: 'Advil, Tylenol, wound care, simple sutures, PT/OT', level: 'low' },
  { value: 'rx_medication', label: 'Started or changed a prescription drug', plain: 'e.g., Keppra, Eliquis, metformin, lisinopril, prednisone', level: 'moderate' },
  { value: 'major_surgery', label: 'Decided on or against a major surgery', plain: 'e.g., craniotomy, decompression, CABG, carotid endarterectomy', level: 'high' },
  { value: 'iv_tx_high_risk', label: 'IV medication or drug needing close monitoring', plain: 'e.g., IV tPA, heparin, warfarin, lithium, vancomycin, chemotherapy', level: 'high' },
  { value: 'escalation_of_care', label: 'Decided to escalate or de-escalate level of care', plain: 'e.g., transferred to ICU, upgrade to monitored bed, or downgraded floor level', level: 'high' },
  { value: 'parenteral_controlled', label: 'Parenteral controlled substance', plain: 'e.g., IV morphine, fentanyl drip, ketamine, IV lorazepam', level: 'high' },
  { value: 'dnr_discussion', label: 'DNR / Goals of care / Palliative discussion', plain: 'e.g., discussed code status, palliative transition, hospice referral', level: 'high' },
];

const MANAGEMENT_RISK_TO_MDM: Record<ManagementRisk, MdmLevel> = {
  '': 'minimal',
  otc_minor: 'low',
  rx_medication: 'moderate',
  iv_tx_high_risk: 'high',
  major_surgery: 'high',
  escalation_of_care: 'high',
  parenteral_controlled: 'high',
  dnr_discussion: 'high',
};

// MDM problem justification text
const PROBLEM_JUSTIFICATION: Record<MdmLevel, string> = {
  minimal: 'One self-limited or minor problem (e.g., cold, insect bite, minor injury)',
  low: 'Stable chronic illness; or one acute uncomplicated illness/injury; or two or more self-limited problems; or one acute problem requiring hospital-level care',
  moderate: 'One or more chronic illnesses with exacerbation/progression/side effects; or one undiagnosed new problem with uncertain prognosis; or one acute illness with systemic symptoms; or one acute complicated injury',
  high: 'One or more chronic illnesses with severe exacerbation/progression; or one acute/chronic illness posing a threat to life or bodily function',
};

const DATA_JUSTIFICATION: Record<MdmLevel, string> = {
  minimal: 'Minimal or no data reviewed',
  low: 'Limited — reviewed notes or ordered/reviewed tests (at least 2 data elements)',
  moderate: 'Moderate — at least 3 data elements, OR independent test interpretation, OR discussion with external physician',
  high: 'Extensive — at least 2 of the 3 data categories met (tests/documents, independent interpretation, and/or external physician discussion)',
};

const RISK_JUSTIFICATION: Record<MdmLevel, string> = {
  minimal: 'Minimal risk — OTC medications, self-limited condition, no Rx management',
  low: 'Low risk — OTC medications, minor procedure without identified risk factors, physical therapy',
  moderate: 'Moderate risk — prescription drug management; minor surgery with identified risk factors; or diagnosis/treatment significantly limited by social determinants of health',
  high: 'High risk — drug therapy requiring intensive monitoring for toxicity; elective major surgery with identified risk factors; decision regarding emergency surgery, hospitalization, or escalation of care; parenteral controlled substances; DNR/goals of care discussion',
};

// ─── CPT Code Tables ──────────────────────────────────────────────────────────

interface CptEntry { code: string; description: string }

const MDM_CPT: Record<VisitType, Partial<Record<MdmLevel, CptEntry>>> = {
  new_patient_office: {
    low: { code: '99202', description: 'New Patient Office — Straightforward MDM' },
    moderate: { code: '99204', description: 'New Patient Office — Moderate Complexity MDM' },
    high: { code: '99205', description: 'New Patient Office — High Complexity MDM' },
  },
  established_patient_office: {
    minimal: { code: '99211', description: 'Established Patient Office — Minimal (Staff Visit)' },
    low: { code: '99213', description: 'Established Patient Office — Low Complexity MDM' },
    moderate: { code: '99214', description: 'Established Patient Office — Moderate Complexity MDM' },
    high: { code: '99215', description: 'Established Patient Office — High Complexity MDM' },
  },
  consult_outpatient: {
    low: { code: '99243', description: 'Outpatient Consultation — Low Complexity MDM' },
    moderate: { code: '99244', description: 'Outpatient Consultation — Moderate Complexity MDM' },
    high: { code: '99245', description: 'Outpatient Consultation — High Complexity MDM' },
  },
  initial_inpatient: {
    low: { code: '99221', description: 'Initial Hospital Inpatient/Observation — Low Complexity MDM' },
    moderate: { code: '99222', description: 'Initial Hospital Inpatient/Observation — Moderate Complexity MDM' },
    high: { code: '99223', description: 'Initial Hospital Inpatient/Observation — High Complexity MDM' },
  },
  subsequent_inpatient: {
    low: { code: '99231', description: 'Subsequent Hospital Inpatient/Observation — Low Complexity MDM' },
    moderate: { code: '99232', description: 'Subsequent Hospital Inpatient/Observation — Moderate Complexity MDM' },
    high: { code: '99233', description: 'Subsequent Hospital Inpatient/Observation — High Complexity MDM' },
  },
  observation: {
    low: { code: '99221', description: 'Hospital Observation — Low Complexity MDM' },
    moderate: { code: '99222', description: 'Hospital Observation — Moderate Complexity MDM' },
    high: { code: '99223', description: 'Hospital Observation — High Complexity MDM' },
  },
  discharge_day: {}, // Time-only
  consult_inpatient: {
    low: { code: '99252', description: 'Inpatient Consultation — Low Complexity MDM' },
    moderate: { code: '99254', description: 'Inpatient Consultation — Moderate Complexity MDM' },
    high: { code: '99255', description: 'Inpatient Consultation — High Complexity MDM' },
  },
  emergency_dept: {
    minimal: { code: '99281', description: 'Emergency Department — Minimal MDM (may not require physician presence)' },
    low: { code: '99282', description: 'Emergency Department — Straightforward MDM' },
    moderate: { code: '99284', description: 'Emergency Department — Moderate Complexity MDM' },
    high: { code: '99285', description: 'Emergency Department — High Complexity MDM' },
  },
  critical_care: {}, // Time-only
};

interface TimeThreshold { min: number; max: number | null; cpt: string; label: string }

// Updated per 2023 AMA PDF: 99223=75min, 99233=50min
const TIME_THRESHOLDS: Partial<Record<VisitType, TimeThreshold[]>> = {
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
  consult_outpatient: [
    { min: 20, max: 29, cpt: '99242', label: '20–29 min' },
    { min: 30, max: 39, cpt: '99243', label: '30–39 min' },
    { min: 45, max: 59, cpt: '99244', label: '45–59 min' },
    { min: 60, max: null, cpt: '99245', label: '60+ min' },
  ],
  // 2023 AMA corrected thresholds
  initial_inpatient: [
    { min: 40, max: 54, cpt: '99221', label: '40–54 min' },
    { min: 55, max: 74, cpt: '99222', label: '55–74 min' },
    { min: 75, max: null, cpt: '99223', label: '75+ min' },
  ],
  subsequent_inpatient: [
    { min: 25, max: 34, cpt: '99231', label: '25–34 min' },
    { min: 35, max: 49, cpt: '99232', label: '35–49 min' },
    { min: 50, max: null, cpt: '99233', label: '50+ min' },
  ],
  observation: [
    { min: 40, max: 54, cpt: '99221', label: '40–54 min' },
    { min: 55, max: 74, cpt: '99222', label: '55–74 min' },
    { min: 75, max: null, cpt: '99223', label: '75+ min' },
  ],
  // Discharge day: time-only, thresholds are simple
  discharge_day: [
    { min: 0, max: 30, cpt: '99238', label: '≤30 min' },
    { min: 31, max: null, cpt: '99239', label: '>30 min' },
  ],
  consult_inpatient: [
    { min: 35, max: 44, cpt: '99252', label: '35–44 min' },
    { min: 45, max: 59, cpt: '99253', label: '45–59 min' },
    { min: 60, max: 74, cpt: '99254', label: '60–74 min' },
    { min: 80, max: null, cpt: '99255', label: '80+ min' },
  ],
  // emergency_dept: NO TIME per 2023 AMA (intentionally omitted)
  // critical_care: special logic (99291 base + 99292 add-ons)
};

const TIME_ACTIVITIES = [
  { key: 'prep', label: 'Prepared to see patient', plain: '(reviewed prior records, imaging, test results before the encounter)' },
  { key: 'history', label: 'Obtained or reviewed history', plain: '(including history from family/caregiver if patient unable)' },
  { key: 'exam', label: 'Performed medically appropriate examination', plain: '(physical exam or evaluation relevant to presenting problem)' },
  { key: 'counseling', label: 'Counseled patient/family/caregiver', plain: '(discussed diagnosis, prognosis, treatment options, risks)' },
  { key: 'orders', label: 'Ordered medications, tests, or procedures', plain: '(including tests ordered, treatments initiated or changed)' },
  { key: 'coordination', label: 'Coordinated care with other providers', plain: '(referrals, communications with other physicians/teams)' },
  { key: 'documentation', label: 'Documented this clinical encounter', plain: '(time spent writing this note in the medical record)' },
  { key: 'interpretation', label: 'Independently interpreted results', plain: '(reviewed images, tracings, or lab results myself; not separately billed)' },
];

// ─── Taxonomy → Specialty Matcher ────────────────────────────────────────────

const TAXONOMY_MAP: { fragment: string; specialty: string }[] = [
  { fragment: 'Neurosurg', specialty: 'Neurosurgery' },
  { fragment: 'Neurol', specialty: 'Neurology' },
  { fragment: 'Emergency', specialty: 'Emergency Medicine' },
  { fragment: 'Family', specialty: 'Family Medicine' },
  { fragment: 'Internal', specialty: 'Internal Medicine' },
  { fragment: 'Cardiol', specialty: 'Cardiology' },
  { fragment: 'Psychiatr', specialty: 'Psychiatry' },
  { fragment: 'Hospital', specialty: 'Hospitalist' },
  { fragment: 'Surg', specialty: 'Surgery' },
];

function matchTaxonomyToSpecialty(taxonomy: string): string | null {
  const lower = taxonomy.toLowerCase();
  for (const { fragment, specialty } of TAXONOMY_MAP) {
    if (lower.includes(fragment.toLowerCase())) return specialty;
  }
  return null;
}

// ─── Pure Logic Functions ─────────────────────────────────────────────────────

function levelToNum(l: MdmLevel): number { return MDM_LEVEL_ORDER.indexOf(l); }
function numToLevel(n: number): MdmLevel { return MDM_LEVEL_ORDER[Math.max(0, Math.min(3, n))]; }

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
  if (!map) return null;
  let idx = levelToNum(mdmLevel);
  while (idx >= 0) {
    const level = numToLevel(idx);
    if (map[level]) return map[level]!;
    idx--;
  }
  return null;
}

function getTimeCpt(visitType: VisitType, minutes: number): CptEntry | null {
  if (visitType === 'critical_care') {
    if (minutes < 30) return null;
    return { code: '99291', description: 'Critical Care Services — First 30–74 minutes' };
  }
  const thresholds = TIME_THRESHOLDS[visitType];
  if (!thresholds) return null;
  const match = thresholds.find((t) => minutes >= t.min && (t.max === null || minutes <= t.max));
  if (!match) return null;
  // Find description from MDM table
  for (const map of Object.values(MDM_CPT)) {
    for (const entry of Object.values(map)) {
      if (entry && entry.code === match.cpt) return { code: match.cpt, description: entry.description };
    }
  }
  return { code: match.cpt, description: `${VISIT_TYPE_LABELS[visitType]} — ${match.label}` };
}

// Critical care add-on codes
function getCriticalCareAddOns(minutes: number): string {
  if (minutes < 30) return '';
  const addOns = Math.floor((minutes - 74) / 30);
  if (addOns <= 0) return '';
  return ` + 99292 ×${addOns} (each add'l 30 min)`;
}

function getDefaultVisitType(setting: VisitSetting): VisitType {
  return SETTING_SUBTYPES[setting][0].value;
}

// ─── API Functions ────────────────────────────────────────────────────────────

function isNpiNumber(query: string): boolean { return /^\d{5,10}$/.test(query.trim()); }

async function fetchNpiProviders(query: string): Promise<NpiProvider[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({ version: '2.1' });
  if (isNpiNumber(trimmed)) {
    params.set('search_type', 'NPI');
    params.set('number', trimmed);
  } else {
    const parts = trimmed.split(/\s+/);
    params.set('first_name', parts.length >= 2 ? parts[0] : '');
    params.set('last_name', parts.length >= 2 ? parts[1] : parts[0]);
    params.set('limit', '10');
    params.set('enumeration_type', 'NPI-1');
  }
  const resp = await fetch(`/api/npi?${params.toString()}`);
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
  const resp = await fetch(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}&maxList=10`);
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
    chiefComplaint, hpiNarrative, examFindings, rxDrugName,
    residentName, teachingPhysicianName, timeActivities,
  } = state;

  const isTeaching = selectedModifiers.includes('-GC');
  const isTimeBased = billingMode === 'time' || TIME_ONLY_TYPES.includes(visitType);
  const sep1 = '═'.repeat(52);
  const sep2 = '─'.repeat(52);
  const lines: string[] = [];

  // ── Header ──
  const dosDisplay = dateOfService
    ? new Date(dateOfService + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '[Date Not Entered]';

  lines.push(sep1);
  lines.push('  E/M BILLING ATTESTATION');
  lines.push(`  Date of Service: ${dosDisplay}`);
  lines.push('  NeuroWiki · 2021/2023 AMA E/M MDM Guidelines');
  lines.push(sep1);
  lines.push('');

  // ── Claim Details ──
  lines.push('CLAIM DETAILS');
  lines.push(`  Visit Type:        ${VISIT_TYPE_LABELS[visitType]}`);
  lines.push(`  Place of Service:  ${VISIT_TYPE_POS[visitType]}`);
  lines.push(`  Specialty:         ${specialty}`);
  if (cptEntry) {
    const mods = selectedModifiers.length > 0 ? ` ${selectedModifiers.join(' ')}` : '';
    lines.push(`  CPT Code:          ${cptEntry.code}${mods}`);
    lines.push(`  Description:       ${cptEntry.description}`);
    lines.push(`  Billing Basis:     ${isTimeBased ? 'Total Time on Date of Service' : 'Medical Decision Making (MDM)'}`);
  } else {
    lines.push(`  CPT Code:          [Not determined — complete inputs above]`);
  }
  if (selectedModifiers.length > 0) {
    lines.push('  Modifier Detail:');
    selectedModifiers.forEach((m) => {
      const found = VISIT_TYPE_MODIFIERS[visitType]?.find((x) => x.code === m);
      if (found) lines.push(`    ${m} — ${found.plain}`);
    });
  }
  if (selectedProvider) {
    const provName = `${selectedProvider.firstName} ${selectedProvider.lastName}${selectedProvider.credential ? ', ' + selectedProvider.credential : ''}`;
    lines.push(`  Provider:          ${provName}`);
    lines.push(`  NPI (Type 1):      ${selectedProvider.npi}`);
    lines.push(`  Taxonomy:          ${selectedProvider.taxonomy}`);
    if (selectedProvider.address) lines.push(`  Practice Location: ${selectedProvider.address}`);
  } else {
    lines.push(`  Provider:          [Search NPI above to populate]`);
    lines.push(`  NPI (Type 1):      [Required for claim submission]`);
  }
  lines.push('');

  // ── Diagnoses ──
  lines.push('DIAGNOSIS CODES (ICD-10-CM)');
  if (selectedDiagnoses.length > 0) {
    selectedDiagnoses.forEach((dx, i) => {
      const label = i === 0 ? 'Principal:  ' : `Secondary ${i + 1}:`;
      lines.push(`  ${label}  ${dx.code}  —  ${dx.name}`);
    });
  } else {
    lines.push('  [No diagnoses entered — search and add ICD-10 codes above]');
  }
  lines.push('');

  // ── Chief Complaint ──
  lines.push('CHIEF COMPLAINT');
  lines.push(`  ${chiefComplaint || '[Not documented — required for audit. Enter above.]'}`);
  lines.push('');

  // ── HPI ──
  lines.push('HISTORY OF PRESENT ILLNESS');
  if (hpiNarrative) {
    hpiNarrative.split('\n').forEach((l) => lines.push(`  ${l}`));
  } else {
    lines.push('  [Not documented — required for medical necessity. Enter a brief HPI above.]');
  }
  lines.push('');

  // ── Exam ──
  lines.push('PHYSICAL EXAMINATION');
  lines.push(`  ${examFindings || 'Medically appropriate examination performed. See EHR for full documented findings.'}`);
  lines.push('');

  // ── MDM or Time ──
  if (!isTimeBased) {
    lines.push(`MEDICAL DECISION MAKING (2021/2023 AMA — 2 of 3 Elements Required)`);
    lines.push(`  Overall MDM Level:  ${MDM_LEVEL_FULL[overallMdm].toUpperCase()} COMPLEXITY`);
    if (cptEntry) lines.push(`  Supported CPT:     ${cptEntry.code}`);
    lines.push('');

    // Column 1 — Problems
    const probMet = levelToNum(problemLevel) >= levelToNum(overallMdm);
    lines.push(`  [${probMet ? '✓' : ' '}] 1. PROBLEMS ADDRESSED — ${MDM_LEVEL_FULL[problemLevel].toUpperCase()}`);
    lines.push(`      ${PROBLEM_JUSTIFICATION[problemLevel]}`);
    if (selectedDiagnoses.length > 0) {
      selectedDiagnoses.forEach((dx) => lines.push(`      • ${dx.name} (${dx.code})`));
    } else {
      lines.push('      • [No diagnoses documented]');
    }
    lines.push('');

    // Column 2 — Data
    const dataMet = levelToNum(dataLevel) >= levelToNum(overallMdm);
    lines.push(`  [${dataMet ? '✓' : ' '}] 2. DATA REVIEWED & ANALYZED — ${MDM_LEVEL_FULL[dataLevel].toUpperCase()}`);
    lines.push(`      ${DATA_JUSTIFICATION[dataLevel]}`);
    if (dataReviewed.reviewedLabsImaging)
      lines.push('      • Reviewed laboratory results and/or imaging studies');
    if (dataReviewed.independentInterpretation)
      lines.push('      • Independently reviewed actual images/tracings/waveforms (not relying solely on formal report)');
    if (dataReviewed.externalNotesReview)
      lines.push('      • Reviewed outside/external records, notes, or documents from another facility or provider');
    if (dataReviewed.discussedWithProvider)
      lines.push('      • Directly discussed management or test interpretation with an external physician/provider (not via intermediary)');
    if (!Object.values(dataReviewed).some(Boolean))
      lines.push('      • No data review documented for this encounter');
    lines.push('');

    // Column 3 — Risk
    const riskMet = levelToNum(riskLevel) >= levelToNum(overallMdm);
    lines.push(`  [${riskMet ? '✓' : ' '}] 3. RISK OF PATIENT MANAGEMENT — ${MDM_LEVEL_FULL[riskLevel].toUpperCase()}`);
    lines.push(`      ${RISK_JUSTIFICATION[riskLevel]}`);
    if (managementRisk) {
      const option = MANAGEMENT_RISK_OPTIONS.find((o) => o.value === managementRisk);
      if (option) {
        lines.push(`      • ${option.label}`);
        if (managementRisk === 'rx_medication' && rxDrugName) {
          lines.push(`        Drug/Medication: ${rxDrugName}`);
          lines.push('        Indication, dose, risks, and patient-specific benefit-risk assessment documented in EHR.');
        }
      }
    }
    lines.push('');

    const qualifyingCols = [
      { name: 'Problems', level: problemLevel },
      { name: 'Data', level: dataLevel },
      { name: 'Risk', level: riskLevel },
    ].filter((c) => levelToNum(c.level) >= levelToNum(overallMdm)).map((c) => c.name);
    lines.push(`  Qualifying elements (≥2 required): ${qualifyingCols.length >= 2 ? qualifyingCols.join(' + ') : '[Insufficient — review inputs]'}`);
    lines.push(`  Overall MDM: ${MDM_LEVEL_FULL[overallMdm].toUpperCase()} COMPLEXITY${cptEntry ? ` → CPT ${cptEntry.code}` : ''}`);

  } else {
    // Time-based documentation
    const mins = parseInt(timeMinutes, 10);
    lines.push('TIME-BASED BILLING DOCUMENTATION');
    if (visitType === 'critical_care') {
      lines.push(`  Critical Care Services: 99291 (first 30–74 minutes)`);
      if (!isNaN(mins) && mins >= 75) {
        const addOns = getCriticalCareAddOns(mins);
        if (addOns) lines.push(`  Add-on code(s): ${addOns}`);
      }
      lines.push(`  Total time personally spent on date of service: ${isNaN(mins) ? '[Enter minutes above]' : `${mins} minutes`}`);
    } else if (visitType === 'discharge_day') {
      lines.push(`  Discharge Day Management: ${!isNaN(mins) ? (mins <= 30 ? '99238 (≤30 min)' : '99239 (>30 min)') : '[Enter minutes]'}`);
      lines.push(`  Total time on date of discharge: ${isNaN(mins) ? '[Enter minutes above]' : `${mins} minutes`}`);
    } else {
      lines.push(`  Total time personally spent by provider on date of service: ${isNaN(mins) ? '[Enter minutes above]' : `${mins} minutes`}`);
      lines.push('  (Per CMS: includes face-to-face + non-face-to-face time on the same calendar date — not clinical staff time)');
    }

    if (timeActivities.length > 0) {
      lines.push('');
      lines.push('  Activities performed on date of service:');
      TIME_ACTIVITIES.filter((a) => timeActivities.includes(a.key)).forEach((a) =>
        lines.push(`    [✓] ${a.label} ${a.plain}`)
      );
    }

    if (selectedDiagnoses.length > 0) {
      lines.push('');
      lines.push('  Conditions managed during this encounter:');
      selectedDiagnoses.forEach((dx) => lines.push(`    • ${dx.name} (${dx.code})`));
    }
  }

  lines.push('');
  lines.push(sep2);

  // ── Attestation ──
  lines.push('ATTESTATION');
  lines.push('');
  if (isTeaching) {
    // Teaching physician attestation (CMS-compliant language)
    lines.push('  TEACHING PHYSICIAN ATTESTATION (Modifier -GC)');
    lines.push('');
    lines.push(`  I was present with the resident${residentName ? `, ${residentName},` : ''} during the key portions of`);
    lines.push('  this encounter, including the history, examination, and medical decision making.');
    lines.push('  I have reviewed the documentation, agree with the assessment and plan, and');
    lines.push('  personally performed/verified the services documented herein.');
    lines.push('');
    lines.push(`  Teaching Physician: ${teachingPhysicianName || (selectedProvider ? `${selectedProvider.firstName} ${selectedProvider.lastName}${selectedProvider.credential ? ', ' + selectedProvider.credential : ''}` : '______________________________')}`);
    if (selectedProvider) lines.push(`  NPI: ${selectedProvider.npi}`);
    lines.push(`  Resident: ${residentName || '______________________________'}`);
    lines.push('');
    lines.push('  Signature: _______________________________   Date: _______________');
    lines.push('');
    lines.push('  RESIDENT DOCUMENTATION ATTESTATION');
    lines.push('  The teaching physician was present during the key portions of this encounter.');
    lines.push('  I discussed the assessment and plan with the attending as documented above.');
    lines.push('');
    lines.push(`  Resident Signature: _______________________   Date: _______________`);
  } else {
    lines.push('  I personally evaluated this patient and performed the services documented herein.');
    lines.push('  The level of service billed is supported by my medical decision making (or total time)');
    lines.push('  as documented above, in accordance with 2021/2023 AMA E/M guidelines.');
    lines.push('');
    if (selectedProvider) {
      const provName = `${selectedProvider.firstName} ${selectedProvider.lastName}${selectedProvider.credential ? ', ' + selectedProvider.credential : ''}`;
      lines.push(`  Provider:    ${provName}`);
      lines.push(`  NPI:         ${selectedProvider.npi}`);
    } else {
      lines.push('  Provider:    ______________________________');
      lines.push('  NPI:         ______________________________');
    }
    lines.push('');
    lines.push('  Signature: _______________________________   Date: _______________');
  }

  lines.push('');
  lines.push(sep2);
  lines.push('  This tool assists with billing documentation. Verify all CPT codes, modifiers,');
  lines.push('  and diagnoses with your institutional billing compliance team before submission.');

  return lines.join('\n');
}

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE: EmBillingState = {
  npiQuery: '', npiResults: [], npiLoading: false, npiError: null,
  selectedProvider: null, showNpiDropdown: false, showNpiPanel: false,
  icd10Query: '', icd10Results: [], icd10Loading: false, icd10Error: null,
  selectedDiagnoses: [], showIcd10Dropdown: false,
  visitSetting: 'hospital',
  visitType: 'initial_inpatient',
  specialty: 'Neurology',
  billingMode: 'mdm',
  problemLevelOverride: null,
  dataReviewed: { reviewedLabsImaging: false, independentInterpretation: false, externalNotesReview: false, discussedWithProvider: false },
  managementRisk: '',
  timeMinutes: '',
  timeActivities: [],
  dateOfService: new Date().toISOString().split('T')[0],
  selectedModifiers: [],
  chiefComplaint: '',
  hpiNarrative: '',
  examFindings: '',
  rxDrugName: '',
  residentName: '',
  teachingPhysicianName: '',
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

  const isTimeOnly = TIME_ONLY_TYPES.includes(state.visitType);
  const isNoTime = NO_TIME_TYPES.includes(state.visitType);
  const isConsult = CONSULT_TYPES.includes(state.visitType);
  const isTeaching = state.selectedModifiers.includes('-GC');

  // Effective billing mode (time-only types override)
  const effectiveBillingMode: BillingMode = isTimeOnly ? 'time' : state.billingMode;

  const mdmCpt = getMdmCpt(state.visitType, overallMdm);
  const timeMins = parseInt(state.timeMinutes, 10);
  const timeCpt = !isNaN(timeMins) && timeMins > 0 ? getTimeCpt(state.visitType, timeMins) : null;
  const activeCpt = effectiveBillingMode === 'mdm' ? mdmCpt : timeCpt;

  useEffect(() => {
    if (activeCpt) trackResult(activeCpt.code);
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
    if (value.trim().length < 2) { set({ npiResults: [], showNpiDropdown: false }); return; }
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
    const matchedSpecialty = matchTaxonomyToSpecialty(provider.taxonomy);
    set({
      selectedProvider: provider,
      showNpiDropdown: false, npiQuery: '', npiResults: [], showNpiPanel: false,
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
    if (value.trim().length < 2) { set({ icd10Results: [], showIcd10Dropdown: false }); return; }
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
    set({ selectedDiagnoses: [...state.selectedDiagnoses, code], icd10Query: '', icd10Results: [], showIcd10Dropdown: false, problemLevelOverride: null });
    setTimeout(() => icd10InputRef.current?.focus(), 50);
  };

  const removeDiagnosis = (code: string) => {
    set({ selectedDiagnoses: state.selectedDiagnoses.filter((d) => d.code !== code), problemLevelOverride: null });
  };

  // ── Visit setting change ──
  const handleSettingChange = (setting: VisitSetting) => {
    const defaultType = getDefaultVisitType(setting);
    const newBillingMode = TIME_ONLY_TYPES.includes(defaultType) ? 'time' : 'mdm';
    set({ visitSetting: setting, visitType: defaultType, billingMode: newBillingMode, selectedModifiers: [], problemLevelOverride: null });
  };

  const handleVisitTypeChange = (vt: VisitType) => {
    const newBillingMode = TIME_ONLY_TYPES.includes(vt) ? 'time' : state.billingMode;
    set({ visitType: vt, billingMode: newBillingMode, selectedModifiers: [], problemLevelOverride: null });
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
      selectedProvider: s.selectedProvider,
      specialty: s.specialty,
      visitSetting: s.visitSetting,
      visitType: s.visitType,
      dateOfService: new Date().toISOString().split('T')[0],
    }));
  };

  // ── Helpers ──
  const segmentActive = (segLevel: MdmLevel) => levelToNum(overallMdm) >= levelToNum(segLevel);
  const segmentClasses: Record<MdmLevel, { active: string; muted: string }> = {
    minimal: { active: 'bg-green-400 text-white', muted: 'bg-green-100 text-green-600' },
    low: { active: 'bg-blue-400 text-white', muted: 'bg-blue-100 text-blue-600' },
    moderate: { active: 'bg-orange-400 text-white', muted: 'bg-orange-100 text-orange-600' },
    high: { active: 'bg-red-400 text-white', muted: 'bg-red-100 text-red-600' },
  };

  const providerDisplayName = state.selectedProvider
    ? `${state.selectedProvider.firstName} ${state.selectedProvider.lastName}${state.selectedProvider.credential ? ', ' + state.selectedProvider.credential : ''}`
    : null;

  const isFav = isFavorite('em-billing');
  const specialtyEx = getSpecialtyExamples(state.specialty);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to={getBackPath()} aria-label="Back" className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900 leading-none">E/M Billing Calculator</h1>
            <p className="text-xs text-slate-500 mt-0.5">2021/2023 AMA MDM Guidelines</p>
          </div>
          {providerDisplayName && (
            <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              {providerDisplayName}
            </div>
          )}
          {activeCpt && (
            <div className="hidden md:flex items-center gap-1.5 bg-neuro-50 border border-neuro-200 text-neuro-700 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0">
              CPT {activeCpt.code}
            </div>
          )}
          <button onClick={() => toggleFavorite('em-billing')} aria-label="Favorite" className="p-2 text-slate-400 hover:text-yellow-500 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0">
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
              <h2 className="text-xl font-bold text-slate-900">Neurowiki <span className="font-normal text-slate-500">Billing</span></h2>
              <p className="text-xs text-slate-400">2021/2023 AMA MDM Framework</p>
            </div>
          </div>
          <button
            onClick={() => set({ showNpiPanel: !state.showNpiPanel })}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-gray-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${state.selectedProvider ? 'bg-green-500' : 'bg-slate-300'}`} />
            {providerDisplayName ? `NPI: ${providerDisplayName}` : 'Search Provider NPI'}
            <Settings size={14} className="text-slate-400" />
          </button>
        </div>

        {/* ── NPI Search Panel ── */}
        {state.showNpiPanel && (
          <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Provider NPI Lookup</h3>
              <button onClick={() => set({ showNpiPanel: false })} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"><X size={16} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Enter a 10-digit NPI number, or "First Last" name. Specialty auto-matches from NPPES taxonomy.</p>
            <div className="npi-search-area relative">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                {state.npiLoading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
                <input
                  ref={npiInputRef}
                  type="text"
                  value={state.npiQuery}
                  onChange={(e) => handleNpiQuery(e.target.value)}
                  placeholder="e.g. 1234567890 or Jane Smith"
                  className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500"
                />
              </div>
              {state.npiError && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-xs"><AlertCircle size={12} />{state.npiError}</div>
              )}
              {state.showNpiDropdown && state.npiResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {state.npiResults.map((r) => (
                    <button key={r.npi} onClick={() => selectProvider(r)}
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-slate-100 last:border-0">
                      <div className="w-8 h-8 bg-neuro-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-neuro-700 text-xs font-bold">{r.firstName?.[0]}{r.lastName?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">{r.firstName} {r.lastName}{r.credential ? `, ${r.credential}` : ''}</div>
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
            </div>
            {state.selectedProvider && (
              <div className="mt-3 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-sm text-green-800 font-medium flex-1">{providerDisplayName} — NPI {state.selectedProvider.npi}</span>
                <button onClick={clearProvider} className="text-green-600 hover:text-red-500 transition-colors" aria-label="Clear provider"><X size={14} /></button>
              </div>
            )}
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Zap size={20} className="text-neuro-600" />
                <h2 className="text-lg font-bold">Rapid Entry</h2>
              </div>
              {/* Specialty selector */}
              <div className="relative">
                <select
                  value={state.specialty}
                  onChange={(e) => set({ specialty: e.target.value })}
                  className="pl-3 pr-8 py-1.5 text-xs font-semibold bg-gray-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 appearance-none text-slate-700"
                >
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Auto-matched indicator */}
            {state.selectedProvider && matchTaxonomyToSpecialty(state.selectedProvider.taxonomy) === state.specialty && (
              <p className="text-xs text-green-600 flex items-center gap-1 -mt-3 mb-4">
                <CheckCircle2 size={11} /> Specialty auto-matched from NPI taxonomy
              </p>
            )}

            {/* ── Step 1: Setting Pills ── */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Setting</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(SETTING_LABELS) as [VisitSetting, string][]).map(([setting, label]) => (
                  <button
                    key={setting}
                    onClick={() => handleSettingChange(setting)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                      state.visitSetting === setting
                        ? 'bg-neuro-600 text-white border-neuro-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-neuro-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Step 2: Sub-type Pills ── */}
            {SETTING_SUBTYPES[state.visitSetting].length > 1 && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Visit Type</label>
                <div className="flex flex-wrap gap-2">
                  {SETTING_SUBTYPES[state.visitSetting].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleVisitTypeChange(value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        state.visitType === value
                          ? 'bg-neuro-50 text-neuro-700 border-neuro-400 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-neuro-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-400">POS: {VISIT_TYPE_POS[state.visitType]}</p>
              </div>
            )}

            {/* Consult Medicare warning */}
            {isConsult && (
              <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-bold">Medicare does not recognize consultation codes.</span> For Medicare patients, bill as a new/established office visit or inpatient code. Consult codes apply to commercial payers only.
                </p>
              </div>
            )}

            {/* ── Date of Service + Modifiers ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date of Service (DOS)</label>
                <input
                  type="date"
                  value={state.dateOfService}
                  onChange={(e) => set({ dateOfService: e.target.value })}
                  className="block w-full pl-3 pr-3 py-2.5 text-sm bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Modifiers <span className="font-normal text-slate-400 normal-case">(click to select)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {VISIT_TYPE_MODIFIERS[state.visitType]?.map(({ code, plain }) => {
                    const active = state.selectedModifiers.includes(code);
                    return (
                      <button
                        key={code}
                        title={plain}
                        onClick={() => set({ selectedModifiers: active ? state.selectedModifiers.filter((m) => m !== code) : [...state.selectedModifiers, code] })}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded border transition-all ${active ? 'bg-neuro-600 text-white border-neuro-600' : 'bg-white text-slate-600 border-slate-200 hover:border-neuro-400'}`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
                {state.selectedModifiers.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {state.selectedModifiers.map((m) => {
                      const found = VISIT_TYPE_MODIFIERS[state.visitType]?.find((x) => x.code === m);
                      return found ? (
                        <p key={m} className="text-xs text-slate-500 leading-snug">
                          <span className="font-bold text-neuro-700">{m}:</span> {found.plain}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Teaching Physician Panel (when -GC selected) ── */}
            {isTeaching && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-blue-800">Teaching Physician Details (Modifier -GC)</h3>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  Per CMS rules: You must document that you were present during key portions of the encounter (history, exam, MDM) and agree with the plan.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Resident Name <span className="font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={state.residentName}
                      onChange={(e) => set({ residentName: e.target.value })}
                      placeholder="e.g., Dr. Jane Resident"
                      className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Teaching Physician Name</label>
                    <input
                      type="text"
                      value={state.teachingPhysicianName}
                      onChange={(e) => set({ teachingPhysicianName: e.target.value })}
                      placeholder={providerDisplayName || 'e.g., Dr. Jane Attending, MD'}
                      className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Clinical Narrative ── */}
            <div className="mb-5 bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope size={15} className="text-slate-500" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Clinical Documentation</h3>
                <span className="text-xs text-slate-400 font-normal normal-case ml-1">— included in attestation copy</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Chief Complaint</label>
                  <input
                    type="text"
                    value={state.chiefComplaint}
                    onChange={(e) => set({ chiefComplaint: e.target.value })}
                    placeholder="e.g., Right arm weakness for 2 hours, acute onset"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Brief HPI / Reason for Visit</label>
                  <textarea
                    value={state.hpiNarrative}
                    onChange={(e) => set({ hpiNarrative: e.target.value })}
                    rows={3}
                    placeholder="e.g., 67-year-old male with history of hypertension and atrial fibrillation who presents with sudden onset right hemiplegia and aphasia beginning at 09:15. Last known well 09:00. No prior neurological deficits. Currently on apixaban but ran out 3 days ago."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500 resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Examination Performed</label>
                  <input
                    type="text"
                    value={state.examFindings}
                    onChange={(e) => set({ examFindings: e.target.value })}
                    placeholder="Medically appropriate examination performed. See EHR for full findings."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500"
                  />
                </div>
                {state.managementRisk === 'rx_medication' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Drug / Medication Name & Dose</label>
                    <input
                      type="text"
                      value={state.rxDrugName}
                      onChange={(e) => set({ rxDrugName: e.target.value })}
                      placeholder="e.g., Levetiracetam 500mg BID, Eliquis 5mg BID, Metformin 1000mg daily"
                      className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">Required by auditors when billing prescription drug management (Moderate risk)</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── ICD-10 Diagnoses ── */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                <Search size={14} />
                Problems Addressed (ICD-10)
              </label>
              <div className="icd10-search-area relative">
                <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-neuro-500 focus-within:border-transparent transition-all">
                  {state.selectedDiagnoses.map((dx) => (
                    <div key={dx.code} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-sm text-slate-800 shadow-sm">
                      <span>{dx.name}</span>
                      <span className="text-xs text-slate-400">({dx.code})</span>
                      <button onClick={() => removeDiagnosis(dx.code)} className="ml-1 text-slate-400 hover:text-red-500 transition-colors" aria-label={`Remove ${dx.name}`}>
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
                      placeholder={state.selectedDiagnoses.length === 0 ? `Search diagnoses (${specialtyEx.problems.high})...` : 'Add another...'}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 px-1 text-slate-800 placeholder-slate-400 outline-none"
                    />
                    {state.icd10Loading && <Loader2 size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
                  </div>
                </div>
                {state.icd10Error && (
                  <div className="mt-1 flex items-center gap-1 text-red-500 text-xs"><AlertCircle size={12} /> {state.icd10Error}</div>
                )}
                {state.showIcd10Dropdown && state.icd10Results.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    {state.icd10Results.map((code) => (
                      <button key={code.code} onMouseDown={(e) => { e.preventDefault(); addDiagnosis(code); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-slate-100 last:border-0">
                        <span className="bg-neuro-100 text-neuro-700 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">{code.code}</span>
                        <span className="text-sm text-slate-700">{code.name}</span>
                        {state.selectedDiagnoses.some((d) => d.code === code.code) && <CheckCircle2 size={14} className="text-green-500 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Billing Mode Toggle ── */}
            {!isTimeOnly && (
              <div className="mb-5">
                <div className="flex bg-gray-100 rounded-lg p-1 w-full">
                  <button
                    onClick={() => set({ billingMode: 'mdm' })}
                    disabled={isTimeOnly}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded transition-all ${
                      effectiveBillingMode === 'mdm' ? 'bg-white text-neuro-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <BarChart2 size={14} />
                    MDM-Based
                  </button>
                  <button
                    onClick={() => { if (!isNoTime) set({ billingMode: 'time' }); }}
                    disabled={isNoTime}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded transition-all ${
                      isNoTime ? 'text-slate-300 cursor-not-allowed' :
                      effectiveBillingMode === 'time' ? 'bg-white text-neuro-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Clock size={14} />
                    Time-Based
                    {isNoTime && <span className="text-[10px] font-normal">(N/A for ED)</span>}
                  </button>
                </div>
                {isNoTime && (
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <AlertTriangle size={11} className="inline mr-1" />
                    Emergency Department E/M codes are selected by MDM only — per 2023 AMA guidelines, time is not a coding factor for ED services.
                  </p>
                )}
              </div>
            )}

            {isTimeOnly && (
              <div className="mb-5 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <Clock size={14} className="text-slate-500 flex-shrink-0" />
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">{VISIT_TYPE_LABELS[state.visitType]}</span> uses time-based coding only — MDM level is not applicable for this visit type.
                </p>
              </div>
            )}

            {/* ── MDM Section ── */}
            {effectiveBillingMode === 'mdm' && !isTimeOnly && (
              <>
                <div className="bg-gray-50 rounded-xl p-5 border border-slate-200 mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Medical Decision Making</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      overallMdm === 'high' ? 'bg-red-100 text-red-700' :
                      overallMdm === 'moderate' ? 'bg-orange-100 text-orange-700' :
                      overallMdm === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      Level: {MDM_LEVEL_LABELS[overallMdm]}
                    </span>
                  </div>
                  <div className="flex h-5 rounded-full overflow-hidden mb-4">
                    {MDM_LEVEL_ORDER.map((level) => {
                      const active = segmentActive(level);
                      const cls = active ? segmentClasses[level].active : segmentClasses[level].muted;
                      return (
                        <div key={level} className={`flex-1 flex items-center justify-center text-[10px] font-bold border-r border-white/30 last:border-0 ${cls}`}>
                          {MDM_LEVEL_LABELS[level]}
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-neuro-600 shadow-sm flex gap-3">
                    <Info size={18} className="text-neuro-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{MDM_LEVEL_FULL[overallMdm]} Complexity</h4>
                      <p className="text-sm text-slate-600 mt-0.5">{MDM_LEVEL_DESCRIPTIONS[overallMdm]}</p>
                    </div>
                  </div>
                </div>

                {/* Problem Complexity Override */}
                <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Problem Complexity</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        problemLevel === 'high' ? 'bg-red-100 text-red-700' :
                        problemLevel === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        problemLevel === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {MDM_LEVEL_FULL[problemLevel]}{state.problemLevelOverride === null && <span className="ml-1 font-normal opacity-70">auto</span>}
                      </span>
                    </div>
                    <button onClick={() => set({ problemLevelOverride: state.problemLevelOverride !== null ? null : problemLevel })}
                      className="text-xs text-neuro-600 hover:text-neuro-700 font-medium transition-colors">
                      {state.problemLevelOverride !== null ? 'Auto-derive' : 'Override'}
                    </button>
                  </div>
                  {/* Specialty examples */}
                  <p className="text-xs text-slate-400 mt-1.5">
                    {overallMdm === 'high' || overallMdm === 'moderate'
                      ? `${state.specialty}: ${specialtyEx.problems[overallMdm === 'high' ? 'high' : 'moderate']}`
                      : `Auto-derived from ${state.selectedDiagnoses.length} diagnosis${state.selectedDiagnoses.length !== 1 ? 'es' : ''} entered above`}
                  </p>
                  {state.problemLevelOverride !== null && (
                    <div className="mt-3 flex gap-2">
                      {MDM_LEVEL_ORDER.map((level) => (
                        <button key={level} onClick={() => set({ problemLevelOverride: level })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded border transition-all ${
                            state.problemLevelOverride === level ? 'bg-neuro-600 text-white border-neuro-600' : 'bg-white text-slate-600 border-slate-200 hover:border-neuro-400'
                          }`}>
                          {MDM_LEVEL_LABELS[level]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data + Management 2-col */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Data Reviewed */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart2 size={16} className="text-slate-500" />
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Data Reviewed</h3>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ml-auto ${
                        dataLevel === 'high' ? 'bg-red-100 text-red-700' :
                        dataLevel === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        dataLevel === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{MDM_LEVEL_LABELS[dataLevel]}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-slate-200 space-y-4">
                      {[
                        {
                          key: 'reviewedLabsImaging' as keyof DataReviewed,
                          label: 'Reviewed labs or imaging',
                          sub: `e.g., ${specialtyEx.labs}`,
                        },
                        {
                          key: 'independentInterpretation' as keyof DataReviewed,
                          label: 'Personally reviewed images/tracings — not just a report',
                          sub: `e.g., ${specialtyEx.imaging}`,
                        },
                        {
                          key: 'externalNotesReview' as keyof DataReviewed,
                          label: 'Reviewed outside records or notes',
                          sub: 'e.g., OSH records, transfer notes, prior specialist notes',
                        },
                        {
                          key: 'discussedWithProvider' as keyof DataReviewed,
                          label: 'Directly spoke with another physician',
                          sub: 'e.g., called radiology, spoke with neurosurgery, discussed with PCP',
                        },
                      ].map(({ key, label, sub }) => (
                        <label key={key} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={state.dataReviewed[key]}
                            onChange={(e) => set({ dataReviewed: { ...state.dataReviewed, [key]: e.target.checked } })}
                            className="mt-0.5 w-4 h-4 text-neuro-600 rounded border-slate-300 focus:ring-neuro-500 flex-shrink-0"
                          />
                          <div>
                            <span className="text-sm text-slate-700">{label}</span>
                            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Management Risk */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ListChecks size={16} className="text-slate-500" />
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Management</h3>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ml-auto ${
                        riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        riskLevel === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        riskLevel === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{MDM_LEVEL_LABELS[riskLevel]}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      {MANAGEMENT_RISK_OPTIONS.map(({ value, label, plain, level }) => (
                        <label key={value} className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="management-risk"
                            value={value}
                            checked={state.managementRisk === value}
                            onChange={() => set({ managementRisk: value })}
                            className="mt-0.5 w-4 h-4 text-neuro-600 border-slate-300 focus:ring-neuro-500 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-700">{label}</span>
                              <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                                level === 'high' ? 'bg-red-100 text-red-600' :
                                level === 'moderate' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                              }`}>{MDM_LEVEL_LABELS[level]}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{plain}</p>
                          </div>
                        </label>
                      ))}
                      {state.managementRisk !== '' && (
                        <button onClick={() => set({ managementRisk: '' })} className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-1">
                          Clear selection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Time-Based Section ── */}
            {(effectiveBillingMode === 'time' || isTimeOnly) && (
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Total Time on Date of Service (minutes)
                  </label>
                  <input
                    type="number" min="0" max="600"
                    value={state.timeMinutes}
                    onChange={(e) => set({ timeMinutes: e.target.value })}
                    placeholder={state.visitType === 'critical_care' ? 'min 30' : 'e.g., 45'}
                    className="w-full pl-4 pr-4 py-3 text-lg font-bold text-slate-900 bg-gray-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neuro-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Include your face-to-face time + time spent on this patient's care on the same day (review, documentation, care coordination). Do not include clinical staff time.
                  </p>
                  {state.visitType === 'critical_care' && !isNaN(timeMins) && timeMins >= 75 && (
                    <p className="text-xs text-neuro-600 font-semibold mt-1">
                      99291 (base) + 99292 ×{Math.floor((timeMins - 74) / 30)} add-on{Math.floor((timeMins - 74) / 30) !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Time thresholds */}
                {TIME_THRESHOLDS[state.visitType] && (
                  <div className="bg-gray-50 rounded-xl border border-slate-200 overflow-hidden mb-4">
                    <div className="px-4 py-2 border-b border-slate-200 bg-white">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Time Thresholds — {VISIT_TYPE_LABELS[state.visitType]}</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {TIME_THRESHOLDS[state.visitType]!.map((t) => {
                        const isActive = !isNaN(timeMins) && timeMins >= t.min && (t.max === null || timeMins <= t.max);
                        return (
                          <div key={t.cpt} className={`flex items-center justify-between px-4 py-2.5 transition-colors ${isActive ? 'bg-neuro-50 border-l-4 border-neuro-600' : ''}`}>
                            <span className="text-sm text-slate-600">{t.label}</span>
                            <span className={`text-sm font-bold ${isActive ? 'text-neuro-700' : 'text-slate-700'}`}>{t.cpt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Time activities checkboxes */}
                <div className="bg-gray-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                    Activities performed on date of service
                    <span className="font-normal text-slate-400 normal-case ml-1">(check all that apply — required for time billing documentation)</span>
                  </p>
                  <div className="space-y-2.5">
                    {TIME_ACTIVITIES.map(({ key, label, plain }) => (
                      <label key={key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.timeActivities.includes(key)}
                          onChange={(e) => set({ timeActivities: e.target.checked ? [...state.timeActivities, key] : state.timeActivities.filter((k) => k !== key) })}
                          className="mt-0.5 w-4 h-4 text-neuro-600 rounded border-slate-300 focus:ring-neuro-500 flex-shrink-0"
                        />
                        <div>
                          <span className="text-sm text-slate-700">{label}</span>
                          <p className="text-xs text-slate-400">{plain}</p>
                        </div>
                      </label>
                    ))}
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
                <span className="bg-white/20 text-xs font-bold tracking-wider px-2 py-1 rounded backdrop-blur-sm uppercase">Recommended Code</span>
                <BadgeCheck size={22} className="text-white/80" />
              </div>

              {activeCpt ? (
                <div className="text-center py-4">
                  <div className="text-7xl font-bold tracking-tight mb-2" aria-live="polite">{activeCpt.code}</div>
                  {state.visitType === 'critical_care' && !isNaN(timeMins) && timeMins >= 75 && (
                    <p className="text-blue-200 text-sm mb-1">+ 99292 ×{Math.floor((timeMins - 74) / 30)}</p>
                  )}
                  <p className="text-blue-100 font-medium text-base leading-snug">{activeCpt.description}</p>
                  {state.selectedModifiers.length > 0 && (
                    <p className="text-blue-200 text-xs mt-2">Modifier: {state.selectedModifiers.join(' ')}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-blue-200 text-sm">
                  {effectiveBillingMode === 'time' && !state.timeMinutes ? 'Enter encounter time above' : 'Complete the inputs to see CPT code'}
                </div>
              )}

              {/* MDM summary chips */}
              {effectiveBillingMode === 'mdm' && !isTimeOnly && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {([{ label: 'Prob', level: problemLevel }, { label: 'Risk', level: riskLevel }, { label: 'Data', level: dataLevel }] as { label: string; level: MdmLevel }[]).map(({ label, level }) => {
                    const meetsOverall = levelToNum(level) >= levelToNum(overallMdm);
                    return (
                      <div key={label} className={`bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center flex flex-col items-center justify-center ${meetsOverall ? 'border border-white/40' : ''}`}>
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
                  {effectiveBillingMode === 'mdm' ? `MDM: ${MDM_LEVEL_FULL[overallMdm]}` : 'Time-Based'}
                </span>
                <span>Updated live</span>
              </div>
            </div>

            {/* ── Documentation Card ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase tracking-wide">
                  <FileText size={16} />
                  Attestation Preview
                </div>
                <button onClick={resetAll} className="text-xs font-bold text-neuro-600 hover:text-neuro-700 transition-colors">RESET</button>
              </div>
              <div className="p-4 flex-1">
                <pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed text-slate-700 max-h-[480px] overflow-y-auto">
                  {docText}
                </pre>
              </div>
              <div className="p-4 border-t border-slate-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={copyNote}
                  className="w-full bg-neuro-600 hover:bg-neuro-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  COPY TO NOTE
                </button>
                <p className="text-center text-xs text-slate-400 mt-2">Paste directly into your EHR billing attestation field</p>
              </div>
            </div>

            {/* ── Quick Reference Card ── */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-slate-500" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">2-of-3 MDM Rule Quick Reference</h3>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-green-600 flex-shrink-0 w-12">MIN:</span>
                  <span>1 self-limited problem · No Rx · Minimal data</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 flex-shrink-0 w-12">LOW:</span>
                  <span>Stable chronic illness · OTC meds · ≥2 data elements</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-orange-600 flex-shrink-0 w-12">MOD:</span>
                  <span>Chronic illness exacerbation · Rx drug management · Independent test interpretation or external MD discussion</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-red-600 flex-shrink-0 w-12">HIGH:</span>
                  <span>Threat to life or function · IV/monitored drugs · Surgery decision · ICU escalation · DNR discussion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {state.toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold z-[60] whitespace-nowrap">
          {state.toast}
        </div>
      )}
    </div>
  );
};

export default EmBillingCalculator;
