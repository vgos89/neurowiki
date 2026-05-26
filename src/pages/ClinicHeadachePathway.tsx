
import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw, Copy, ChevronDown } from 'lucide-react';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import { PathwayRailStep } from '../components/pathways/PathwayRail';
import { PathwayBranchChip } from '../components/pathways/PathwayBranchChip';
import { PathwayLearningPearl } from '../components/pathways/PathwayLearningPearl';
import { Chevron } from '../components/calculators/Chevron';
import type { SeverityTokens } from '../lib/calculators/severityTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type HeadacheFrequency = 'low' | 'moderate' | 'high' | 'chronic' | null;
// low = 0–3/month, moderate = 4–7/month, high = 8–14/month, chronic = ≥15/month

type MidasGrade = 'grade1' | 'grade2' | 'grade3' | 'grade4' | null;
// Grade I: minimal (score 0–5), II: mild (6–10), III: moderate (11–20), IV: severe (≥21)

type HeadacheType =
  | 'migraine-without-aura'
  | 'migraine-with-aura'
  | 'tension'
  | 'cluster-refer'
  | 'hemicrania-refer'
  | 'new-daily-workup'
  | null;

type PriorTrialStatus = 'none' | 'one-failed' | 'two-or-more-failed' | null;

interface ComorbidityState {
  htn: boolean;
  anxiety: boolean;
  depression: boolean;
  insomnia: boolean;
  pregnancy: boolean;
  epilepsy: boolean;
  hepatic: boolean;
  weightConcern: boolean;
  cvRisk: boolean;
  women_of_childbearing_potential: boolean;
}

// ─── TIER_TOKENS (inlined per architecture pattern) ───────────────────────────
type ClinicTier = 'Low' | 'Intermediate' | 'High' | 'Negative';
const TIER_TOKENS: Record<ClinicTier, SeverityTokens> = {
  Low: {
    borderColor: '#c7d2fe',
    headerBg: 'bg-neuro-50',
    headerHover: 'hover:bg-neuro-100',
    labelClass: 'text-[10px] font-bold text-neuro-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-neuro-700',
    chevronClass: 'text-neuro-600',
  },
  Intermediate: {
    borderColor: '#fcd34d',
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-700',
  },
  High: {
    borderColor: '#fca5a5',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
  Negative: {
    borderColor: '#e2e8f0',
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-900',
    chevronClass: 'text-slate-400',
  },
};
void TIER_TOKENS;

const STEPS = [
  { id: 1, title: 'Headache Profile' },
  { id: 2, title: 'Phenotype' },
  { id: 3, title: 'Preventive Need?' },
  { id: 4, title: 'Preventive Selection' },
  { id: 5, title: 'Acute Optimization' },
  { id: 6, title: 'Plan' },
];

// ─── MIDAS disability → grade mapping ────────────────────────────────────────
function midasGradeFromScore(score: number): MidasGrade {
  if (score <= 5) return 'grade1';
  if (score <= 10) return 'grade2';
  if (score <= 20) return 'grade3';
  return 'grade4';
}

const MIDAS_LABELS: Record<NonNullable<MidasGrade>, string> = {
  grade1: 'Grade I: Minimal disability (score 0–5)',
  grade2: 'Grade II: Mild disability (score 6–10)',
  grade3: 'Grade III: Moderate disability (score 11–20)',
  grade4: 'Grade IV: Severe disability (score ≥21)',
};

// ─── Preventive threshold logic ───────────────────────────────────────────────
function meetsPreventiveThreshold(
  freq: HeadacheFrequency,
  grade: MidasGrade,
  acuteDaysPerMonth: number,
): boolean {
  if (!freq || !grade) return false;
  // ≥4 days/month with grade II–IV
  if ((freq === 'moderate' || freq === 'high' || freq === 'chronic') && (grade === 'grade2' || grade === 'grade3' || grade === 'grade4')) return true;
  // ≥6 days/month regardless of disability
  if (freq === 'high' || freq === 'chronic') return true;
  // Acute overuse ≥10 days/month
  if (acuteDaysPerMonth >= 10) return true;
  return false;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ClinicHeadachePathway: React.FC = () => {
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'headache-clinic',
      title: 'Clinic Headache Pathway',
      subtitle: 'Outpatient migraine preventive & acute optimization',
      category: 'severe-headache',
      trail: '6 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step, setStep] = useState(1);
  const { handleBack } = useNavigationSource();
  const topRef = useRef<HTMLDivElement>(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const isFav = isFavorite('headache-clinic');

  const handleFavToggle = () => {
    toggleFavorite('headache-clinic');
    setShowFavToast(true);
    setTimeout(() => setShowFavToast(false), 2000);
  };

  // ── Clinical state ───────────────────────────────────────────────────────────
  const [headacheFreq, setHeadacheFreq] = useState<HeadacheFrequency>(null);
  const [midasScores, setMidasScores] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
  const [acuteDaysPerMonth, setAcuteDaysPerMonth] = useState(0);
  const [headacheType, setHeadacheType] = useState<HeadacheType>(null);
  const [hasAura, setHasAura] = useState(false);
  const [priorTrials, setPriorTrials] = useState<PriorTrialStatus>(null);
  const [comorbidities, setComorbidities] = useState<ComorbidityState>({
    htn: false,
    anxiety: false,
    depression: false,
    insomnia: false,
    pregnancy: false,
    epilepsy: false,
    hepatic: false,
    weightConcern: false,
    cvRisk: false,
    women_of_childbearing_potential: false,
  });
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    if (step > 1 && topRef.current) {
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [step]);

  // ── Derived values ────────────────────────────────────────────────────────────
  const midasTotal = midasScores.q1 + midasScores.q2 + midasScores.q3 + midasScores.q4 + midasScores.q5;
  const midasGrade = midasGradeFromScore(midasTotal);
  const preventiveIndicated = meetsPreventiveThreshold(headacheFreq, midasGrade, acuteDaysPerMonth);
  const cgrpFirstLine = priorTrials === 'two-or-more-failed';

  // Step completion checks
  const isStep1Complete = headacheFreq !== null;
  const isStep2Complete = headacheType !== null;
  const isStep3Complete = preventiveIndicated !== null; // always defined once step 2 done
  const isStep4Complete = priorTrials !== null;

  // ── Comorbidity toggle helper ─────────────────────────────────────────────────
  const toggleComorbidity = (key: keyof ComorbidityState) => {
    setComorbidities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── MIDAS score helper ────────────────────────────────────────────────────────
  const MidasInput = ({ label, value, onChange }: { label: React.ReactNode; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-700 flex-1 pr-4">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 font-bold text-lg flex items-center justify-center touch-manipulation"
        >−</button>
        <span className="w-8 text-center font-bold text-slate-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(30, value + 1))}
          className="w-8 h-8 rounded-full border border-neuro-200 text-neuro-700 font-bold text-lg flex items-center justify-center touch-manipulation"
        >+</button>
      </div>
    </div>
  );

  // ── Preventive agent cards ─────────────────────────────────────────────────────
  type AgentCard = { name: string; dose: string; class: string; note: string; caution?: string };

  const getConventionalPreventives = (): AgentCard[] => {
    const agents: AgentCard[] = [];

    // Propranolol / Metoprolol — first-line, avoid if asthma or depression
    if (!comorbidities.cvRisk) {
      agents.push({
        name: comorbidities.depression ? 'Metoprolol' : 'Propranolol',
        dose: comorbidities.depression ? '50–200 mg/day' : '40–160 mg/day',
        class: 'Beta-blocker',
        note: 'AHS first-line preventive. First choice for HTN co-management.' + (comorbidities.htn ? ' Treats both migraine and hypertension.' : ''),
        caution: comorbidities.depression ? 'Propranolol may worsen depression — prefer metoprolol.' : undefined,
      });
    }

    // Amitriptyline — good for anxiety/depression/insomnia co-morbidity
    if (!comorbidities.pregnancy) {
      agents.push({
        name: 'Amitriptyline',
        dose: '10–75 mg at bedtime',
        class: 'TCA',
        note: 'AHS second-line preventive. Best choice when insomnia, depression, or anxiety is present.' +
          (comorbidities.insomnia || comorbidities.depression || comorbidities.anxiety ? ' Matches patient comorbidities.' : ''),
        caution: comorbidities.cvRisk ? 'Use with caution in cardiovascular disease — QT prolongation risk.' : undefined,
      });
    }

    // Venlafaxine — good for anxiety/depression
    if (!comorbidities.pregnancy && (comorbidities.anxiety || comorbidities.depression)) {
      agents.push({
        name: 'Venlafaxine',
        dose: '75–150 mg/day',
        class: 'SNRI',
        note: 'AHS second-line preventive. Recommended when anxiety or depression is present. Lipton 2024 Continuum.',
      });
    }

    // Topiramate — avoid if pregnancy risk, cognitive side effects
    if (!comorbidities.pregnancy && !comorbidities.women_of_childbearing_potential && !comorbidities.epilepsy) {
      agents.push({
        name: 'Topiramate',
        dose: '25–100 mg/day (titrate slowly)',
        class: 'Anticonvulsant',
        note: 'AHS first-line preventive. May cause word-finding difficulties and kidney stones. Titrate: 25 mg/day × 1 wk, then +25 mg q1–2 wks.' +
          (comorbidities.weightConcern ? ' Weight-neutral to mild weight loss — beneficial for weight concern.' : ''),
        caution: 'Avoid in pregnancy and women of childbearing potential (teratogenic).',
      });
    }

    // Valproate — last resort, contraindicated in pregnancy/women of childbearing potential
    if (!comorbidities.pregnancy && !comorbidities.women_of_childbearing_potential && !comorbidities.hepatic) {
      agents.push({
        name: 'Valproate (Depakote)',
        dose: '500–1500 mg/day (divided)',
        class: 'Anticonvulsant',
        note: 'AHS first-line preventive. High teratogenicity — AVOID in women of childbearing potential.',
        caution: 'CONTRAINDICATED in pregnancy and women of childbearing potential.',
      });
    }

    return agents;
  };

  const getCgrpAgents = (): AgentCard[] => [
    {
      name: 'Erenumab (Aimovig)',
      dose: '70–140 mg SC monthly',
      class: 'Anti-CGRP receptor mAb',
      note: 'Monthly SC. First-line CGRP mAb. Titrate to 140 mg/month after 3 months if partial response. AHS 2021.',
      caution: comorbidities.htn ? 'Monitor BP — mild BP increase reported.' : undefined,
    },
    {
      name: 'Fremanezumab (Ajovy)',
      dose: '225 mg SC monthly OR 675 mg SC quarterly',
      class: 'Anti-CGRP ligand mAb',
      note: 'Monthly or quarterly dosing. Quarterly option improves adherence. AHS 2021.',
    },
    {
      name: 'Galcanezumab (Emgality)',
      dose: '240 mg SC loading → 120 mg SC monthly',
      class: 'Anti-CGRP ligand mAb',
      note: '240 mg loading dose (two 120 mg injections) then 120 mg monthly. AHS 2021.',
    },
    {
      name: 'Eptinezumab (Vyepti)',
      dose: '100–300 mg IV quarterly',
      class: 'Anti-CGRP ligand mAb (IV)',
      note: 'IV infusion every 3 months. Fastest onset (IV). Useful if adherence with SC injections is a concern. AHS 2021.',
    },
    {
      name: 'Atogepant (Qulipta)',
      dose: '10–60 mg PO daily (preventive)',
      class: 'CGRP receptor antagonist (gepant)',
      note: 'Oral daily preventive gepant. Also has acute use. Does not cause MOH. AHS 2021.',
    },
    {
      name: 'Rimegepant (Nurtec)',
      dose: '75 mg PO every other day (preventive)',
      class: 'CGRP receptor antagonist (gepant)',
      note: 'Oral every-other-day preventive gepant. Also approved for acute use. Does not cause MOH. AHS 2021.',
    },
  ];

  // ── Summary generator ──────────────────────────────────────────────────────────
  const generateSummary = () => {
    const lines: string[] = [];
    lines.push(`Clinic Headache Plan: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
    lines.push('');

    lines.push('HEADACHE PROFILE:');
    if (headacheFreq) lines.push(`- Frequency: ${headacheFreq === 'low' ? '0–3/month' : headacheFreq === 'moderate' ? '4–7/month' : headacheFreq === 'high' ? '8–14/month' : '≥15/month (chronic)'}`);
    if (headacheType) lines.push(`- Phenotype: ${headacheType.replace(/-/g, ' ')}`);
    if (hasAura) lines.push('- Aura present');
    lines.push(`- MIDAS Score: ${midasTotal} (${midasGrade ? MIDAS_LABELS[midasGrade] : 'N/A'})`);
    lines.push(`- Acute medication days/month: ${acuteDaysPerMonth}`);

    lines.push('');
    lines.push(`PREVENTIVE THERAPY: ${preventiveIndicated ? 'INDICATED' : 'Not currently indicated'}`);
    if (preventiveIndicated) {
      lines.push(`- Prior preventive trial status: ${priorTrials ?? 'not recorded'}`);
      if (cgrpFirstLine) {
        lines.push('- CGRP pathway therapy indicated (≥2 failed conventional trials)');
      } else {
        lines.push('- Consider conventional preventive first (see plan below)');
      }
    }

    const activeComorbidities = Object.entries(comorbidities).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '));
    if (activeComorbidities.length > 0) {
      lines.push(`- Comorbidities influencing selection: ${activeComorbidities.join(', ')}`);
    }

    lines.push('');
    lines.push('SOURCE:');
    lines.push('- AHS Consensus (Ailani et al., Headache 2021;61:1021–1039, PMID 34128230)');
    lines.push('- Lipton & Silberstein, Continuum 2024;30(2):367–378');
    lines.push('- Burch, Continuum 2024;30(2):316–366');

    return lines.join('\n');
  };

  const copySummary = () => {
    navigator.clipboard.writeText(generateSummary());
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const handleReset = () => {
    setStep(1);
    setHeadacheFreq(null);
    setMidasScores({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
    setAcuteDaysPerMonth(0);
    setHeadacheType(null);
    setHasAura(false);
    setPriorTrials(null);
    setComorbidities({ htn: false, anxiety: false, depression: false, insomnia: false, pregnancy: false, epilepsy: false, hepatic: false, weightConcern: false, cvRisk: false, women_of_childbearing_potential: false });
  };

  // ── Step summary helpers ──────────────────────────────────────────────────────
  const getStep1Summary = () => {
    if (!headacheFreq) return '';
    const freqMap = { low: '0–3/month', moderate: '4–7/month', high: '8–14/month', chronic: '≥15/month' };
    return `${freqMap[headacheFreq]}, MIDAS ${midasTotal} (${midasGrade?.replace('grade', 'Grade ')})`;
  };

  const getStep2Summary = () => headacheType?.replace(/-/g, ' ') ?? '';
  const getStep3Summary = () => preventiveIndicated ? 'Preventive indicated' : 'Preventive not indicated';
  const getStep4Summary = () => cgrpFirstLine ? 'CGRP pathway indicated' : priorTrials === 'one-failed' ? '1 conventional trial failed' : 'Start conventional preventive';

  // ── InfoTooltip — ? bubble for clinical term explanations ─────────────────────
  const InfoTooltip = ({ text }: { text: string }) => {
    const [open, setOpen] = React.useState(false);
    return (
      <span className="relative inline-block ml-1 align-middle">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
          className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold inline-flex items-center justify-center hover:bg-neuro-100 hover:text-neuro-700 transition-colors leading-none"
          aria-label="More information"
        >?</button>
        {open && (
          <span className="absolute left-0 top-5 z-30 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs text-slate-700 font-normal block" role="tooltip">
            {text}
            <button type="button" onClick={() => setOpen(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
          </span>
        )}
      </span>
    );
  };

  // ── EvidenceBadge — clickable AHS level badge with popover explanation ─────────
  type EvidenceLevel = 'A' | 'B' | 'C' | 'U';
  const EVIDENCE_DESCRIPTIONS: Record<EvidenceLevel, string> = {
    A: 'Must Offer: established effectiveness from multiple high-quality controlled trials (AHS Robblee 2025 grading).',
    B: 'Should Offer: probably effective based on well-designed studies (AHS Robblee 2025 grading).',
    C: 'May Offer: possibly effective; limited or inconsistent data (AHS Robblee 2025 grading).',
    U: 'Unproven: insufficient or conflicting evidence. Cannot recommend for or against (AHS Robblee 2025 grading).',
  };
  const EVIDENCE_COLORS: Record<EvidenceLevel, string> = {
    A: 'bg-emerald-100 text-emerald-800',
    B: 'bg-neuro-100 text-neuro-700',
    C: 'bg-slate-100 text-slate-600',
    U: 'bg-slate-50 text-slate-400 border border-slate-200',
  };
  const EvidenceBadge = ({ level }: { level: EvidenceLevel }) => {
    const [open, setOpen] = React.useState(false);
    return (
      <span className="relative inline-block flex-shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${EVIDENCE_COLORS[level]}`}
          aria-label={`Level ${level} evidence — tap for explanation`}
        >Level {level}</button>
        {open && (
          <span className="absolute left-0 top-5 z-30 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs text-slate-700 font-normal block" role="tooltip">
            <span className="font-bold">Level {level}: </span>{EVIDENCE_DESCRIPTIONS[level]}
            <button type="button" onClick={() => setOpen(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
          </span>
        )}
      </span>
    );
  };

  // ── ComorbidityToggle component ───────────────────────────────────────────────
  const ComorbidityToggle = ({ label, value, field }: { label: React.ReactNode; value: boolean; field: keyof ComorbidityState }) => (
    <button
      type="button"
      onClick={() => toggleComorbidity(field)}
      className={`px-3 py-2 rounded-full text-sm font-semibold border transition-all touch-manipulation min-h-[44px] ${
        value
          ? 'bg-neuro-100 text-neuro-800 border-neuro-300'
          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
      }`}
    >
      {value && <Check size={12} className="inline mr-1" />}{label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24" ref={topRef}>
      <PathwayHeader
        pathwayLabel="Clinic Headache Pathway"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={handleFavToggle}
        onReset={handleReset}
        onCopy={copySummary}
        shareText={generateSummary}
        shareTitle="Clinic Headache Pathway"
        onShareResult={(r) => {
          if (r === 'shared' || r === 'copied') { setCopyToast(true); setTimeout(() => setCopyToast(false), 2000); }
        }}
      />

      {/* ── Step 1: Headache Profile ─────────────────────────────────────── */}
      <PathwayRailStep
        stepNumber={1}
        title="HEADACHE PROFILE"
        iconKey="triage"
        nodeState={isStep1Complete && step > 1 ? 'completed' : step >= 1 ? 'active' : 'locked'}
        segmentAboveTraversed={false}
        lockedAriaLabel="Step 1 Headache Profile"
      >
        {isStep1Complete && step > 1 && (
          <div className="mb-3">
            <PathwayBranchChip
              targetFieldId="field-profile"
              label={getStep1Summary()}
              onClick={() => setStep(1)}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3" id="field-profile">

            {/* Frequency — most discriminating question first (AQI model) */}
            <div className="bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">How many headache days per month?</p>
              <div className="space-y-2">
                {([
                  { value: 'low', label: '0–3 days/month', sub: 'Episodic: low frequency' },
                  { value: 'moderate', label: '4–7 days/month', sub: 'Episodic: moderate frequency' },
                  { value: 'high', label: '8–14 days/month', sub: 'High-frequency episodic' },
                  { value: 'chronic', label: '≥15 days/month', sub: 'Chronic migraine or probable MOH' },
                ] as { value: HeadacheFrequency; label: string; sub: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setHeadacheFreq(opt.value)}
                    className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99] touch-manipulation min-h-[44px] ${
                      headacheFreq === opt.value
                        ? 'border-neuro-500 bg-neuro-50 text-neuro-900'
                        : 'border-slate-200 hover:border-neuro-200'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* MIDAS — inline derivation */}
            {headacheFreq && (
              <div className="bg-white border border-slate-100 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">MIDAS Disability Score</p>
                <p className="text-xs text-slate-500 mb-3">Days lost (≥50% reduced productivity) in the past 3 months.</p>
                <div className="space-y-1">
                  <MidasInput label={<>Missed work / school (full days)<InfoTooltip text="Full days when you could not attend work or school entirely because of your headache. Do not count days you attended but worked less effectively." /></>} value={midasScores.q1} onChange={v => setMidasScores(p => ({ ...p, q1: v }))} />
                  <MidasInput label={<>Reduced work / school productivity (days)<InfoTooltip text="Days when you went to work or school but your effectiveness dropped by 50% or more because of your headache." /></>} value={midasScores.q2} onChange={v => setMidasScores(p => ({ ...p, q2: v }))} />
                  <MidasInput label={<>Missed household tasks (full days)<InfoTooltip text="Full days when you were unable to do any household work (cooking, cleaning, childcare) because of your headache." /></>} value={midasScores.q3} onChange={v => setMidasScores(p => ({ ...p, q3: v }))} />
                  <MidasInput label={<>Reduced household productivity (days)<InfoTooltip text="Days when household effectiveness dropped by 50% or more because of your headache." /></>} value={midasScores.q4} onChange={v => setMidasScores(p => ({ ...p, q4: v }))} />
                  <MidasInput label={<>Missed social / leisure activities (days)<InfoTooltip text="Entire social events, sports, family gatherings, or leisure activities that you skipped completely because of your headache." /></>} value={midasScores.q5} onChange={v => setMidasScores(p => ({ ...p, q5: v }))} />
                </div>
                {midasTotal > 0 && (
                  <div className="mt-3 bg-neuro-50 rounded-lg p-3 border border-neuro-100 flex justify-between items-center">
                    <span className="text-xs text-neuro-700 font-bold">MIDAS Score: {midasTotal}</span>
                    <span className="text-xs text-neuro-700">{MIDAS_LABELS[midasGrade!]}</span>
                  </div>
                )}
              </div>
            )}

            {/* Acute medication days */}
            {headacheFreq && (
              <div className="bg-white border border-slate-100 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Acute medication days/month</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setAcuteDaysPerMonth(Math.max(0, acuteDaysPerMonth - 1))} className="w-10 h-10 rounded-full border border-slate-200 text-slate-600 font-bold text-xl flex items-center justify-center touch-manipulation">−</button>
                  <span className="text-2xl font-black text-slate-900 w-10 text-center">{acuteDaysPerMonth}</span>
                  <button type="button" onClick={() => setAcuteDaysPerMonth(Math.min(31, acuteDaysPerMonth + 1))} className="w-10 h-10 rounded-full border border-neuro-200 text-neuro-700 font-bold text-xl flex items-center justify-center touch-manipulation">+</button>
                </div>
                {acuteDaysPerMonth >= 10 && (
                  <p className="text-xs text-amber-700 mt-2 font-semibold">≥10 days/month: MOH risk; qualifies for preventive therapy discussion.</p>
                )}
              </div>
            )}

            <PathwayLearningPearl
              title="Why frequency is the first question"
              visible={headacheFreq !== null}
              content={
                <span>Headache frequency drives the preventive therapy decision more than any other factor. The AHS 2021 threshold is ≥4 days/month with disability or ≥6 days/month regardless of disability — the key cut-point for preventive benefit. Knowing frequency first lets us pre-stratify before asking about disability (MIDAS), so those questions stay focused.</span>
              }
            />

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!isStep1Complete}
                className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center disabled:opacity-40 min-h-[44px]"
              >
                Characterize Headache <Chevron direction="right" className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </PathwayRailStep>

      {/* ── Step 2: Phenotype ────────────────────────────────────────────── */}
      <PathwayRailStep
        stepNumber={2}
        title="PHENOTYPE"
        iconKey="clinical"
        nodeState={isStep2Complete && step > 2 ? 'completed' : step >= 2 ? 'active' : 'locked'}
        segmentAboveTraversed={isStep1Complete && step > 1}
        lockedAriaLabel="Step 2 Phenotype, awaiting Step 1"
      >
        {isStep2Complete && step > 2 && (
          <div className="mb-3">
            <PathwayBranchChip
              targetFieldId="field-phenotype"
              label={getStep2Summary()}
              onClick={() => setStep(2)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3" id="field-phenotype">
            <div className="bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Headache Phenotype</p>
              <div className="space-y-2">
                {([
                  { value: 'migraine-without-aura', label: 'Migraine without aura', sub: 'Unilateral, pulsating, moderate–severe, with photo/phonophobia or nausea. ICHD-3 1.1.' },
                  { value: 'migraine-with-aura', label: 'Migraine with aura', sub: 'Preceding reversible neurological symptoms. ICHD-3 1.2. Associated with higher stroke risk with estrogen-containing OCP.' },
                  { value: 'tension', label: 'Tension-type headache', sub: 'Bilateral, pressing/tightening, mild–moderate, no vomiting. Review if chronic (≥15 days/month).' },
                  { value: 'cluster-refer', label: 'Cluster / TAC pattern', sub: 'Severe unilateral periorbital, autonomic features, restlessness, 15–180 min attacks. See acute + preventive protocol below.' },
                  { value: 'hemicrania-refer', label: 'Hemicrania continua', sub: 'Continuous unilateral headache with autonomic features. Absolute indomethacin response is diagnostic; see titration protocol below.' },
                  { value: 'new-daily-workup', label: 'New daily persistent headache → Workup needed', sub: 'Sudden onset persistent headache. Requires imaging before preventive management.' },
                ] as { value: HeadacheType; label: string; sub: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setHeadacheType(opt.value)}
                    className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99] touch-manipulation min-h-[44px] ${
                      headacheType === opt.value
                        ? (opt.value === 'cluster-refer' || opt.value === 'hemicrania-refer' || opt.value === 'new-daily-workup' ? 'border-amber-500 bg-amber-50' : 'border-neuro-500 bg-neuro-50 text-neuro-900')
                        : 'border-slate-200 hover:border-neuro-200'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>

              {/* ICHD-3 criteria card. Shown once a phenotype is chosen.
                  Source: ICHD-3 2018 (Cephalalgia 2018;38:1-211, PMID 29368949). */}
              {(headacheType === 'migraine-without-aura' || headacheType === 'migraine-with-aura') && (
                <div data-claim="clinic-headache-ichd3-migraine-criteria" className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">ICHD-3 1.1 / 1.2 Migraine criteria</p>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>A. ≥5 attacks fulfilling B–D (≥2 if migraine with aura).</div>
                    <div>B. Attack duration 4 to 72 hours (untreated or unsuccessfully treated).</div>
                    <div>C. ≥2 of: unilateral location; pulsating quality; moderate or severe intensity; aggravated by routine physical activity.</div>
                    <div>D. ≥1 of: nausea and/or vomiting; photophobia AND phonophobia.</div>
                    <div className="text-slate-500 mt-1.5">With aura (1.2): fully reversible visual, sensory, speech, motor, brainstem, or retinal symptoms spreading over ≥5 min, lasting 5 to 60 min, followed by headache within 60 min.</div>
                  </div>
                </div>
              )}
              {headacheType === 'tension' && (
                <div data-claim="clinic-headache-ichd3-tension-criteria" className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">ICHD-3 2.2 / 2.3 Tension-type headache criteria</p>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>A. Frequent episodic TTH (2.2): 1 to 14 headache days/month for &gt;3 months. Chronic TTH (2.3): ≥15 days/month for &gt;3 months.</div>
                    <div>B. Attack duration 30 minutes to 7 days.</div>
                    <div>C. ≥2 of: bilateral location; pressing or tightening (non-pulsating); mild to moderate intensity; NOT aggravated by routine physical activity.</div>
                    <div>D. No nausea or vomiting; ≤1 of photophobia or phonophobia.</div>
                    <div className="text-slate-500 mt-1.5">Chronic TTH (2.3) allows mild nausea OR photophobia OR phonophobia, but not moderate or severe nausea/vomiting.</div>
                  </div>
                </div>
              )}
              {headacheType === 'cluster-refer' && (
                <div data-claim="clinic-headache-ichd3-cluster-criteria" className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">ICHD-3 3.1 Cluster headache criteria</p>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>A. ≥5 attacks fulfilling B–D.</div>
                    <div>B. Severe or very severe unilateral orbital, supraorbital, and/or temporal pain lasting 15 to 180 minutes (untreated).</div>
                    <div>C. Either or both of: ipsilateral cranial autonomic features (conjunctival injection, lacrimation, nasal congestion, rhinorrhoea, eyelid oedema, forehead/facial sweating, miosis, ptosis); restlessness or agitation.</div>
                    <div>D. Attack frequency 1 every other day to 8/day during active bouts.</div>
                  </div>
                </div>
              )}
              {headacheType === 'hemicrania-refer' && (
                <div data-claim="clinic-headache-ichd3-hemicrania-criteria" className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">ICHD-3 3.4 Hemicrania continua criteria</p>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>A. Continuous strictly unilateral headache &gt;3 months with exacerbations of moderate or greater intensity.</div>
                    <div>B. Either or both during exacerbations: ipsilateral cranial autonomic features; restlessness or aggravation by movement.</div>
                    <div>C. Absolute response to therapeutic-dose indomethacin is required for diagnosis.</div>
                    <div className="text-amber-700 font-semibold mt-1.5">Indomethacin non-response rules out hemicrania continua. See indomethacin titration protocol below.</div>
                  </div>
                </div>
              )}
              {headacheType === 'new-daily-workup' && (
                <div data-claim="clinic-headache-ichd3-ndph-criteria" className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">ICHD-3 3.3 New daily persistent headache criteria</p>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>A. Persistent headache present &gt;3 months.</div>
                    <div>B. Distinct and clearly-remembered onset, becoming continuous and unremitting within 24 hours.</div>
                    <div>C. Not better accounted for by another ICHD-3 diagnosis.</div>
                    <div className="text-slate-500 mt-1.5">The defining feature is the patient pinpointing the exact moment the headache began and reporting it has never resolved since.</div>
                  </div>
                </div>
              )}

              {/* Aura toggle — shown when migraine selected */}
              {(headacheType === 'migraine-without-aura' || headacheType === 'migraine-with-aura') && (
                <div className="mt-3 flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-600">Aura confirmed?</span>
                  <button
                    type="button"
                    onClick={() => { setHasAura(v => !v); if (!hasAura) setHeadacheType('migraine-with-aura'); else setHeadacheType('migraine-without-aura'); }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all touch-manipulation ${hasAura ? 'bg-neuro-100 text-neuro-800 border-neuro-300' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    {hasAura ? 'Yes: with aura' : 'No aura'}
                  </button>
                </div>
              )}
            </div>

            {/* Non-migraine phenotype inline protocols */}
            {headacheType === 'cluster-refer' && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Cluster Headache: Acute &amp; Preventive Protocol</p>
                <p className="text-xs text-amber-800 mb-3">Burish 2024 Continuum; AHS Grade A first-line triad. This outpatient pathway covers the full preventive plan. Acute management may be initiated in clinic or ED.</p>
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-lg border border-amber-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Acute (per-attack)</p>
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="A" />
                        <span className="text-xs text-slate-700">Oxygen 100% 12–15 L/min via NRB mask × 15 min. Prescribe home O₂ for active cluster periods.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="A" />
                        <span className="text-xs text-slate-700">Sumatriptan 6 mg SC or 20 mg nasal (triptan contraindications apply). Max 2 doses/24 h.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="A" />
                        <span className="text-xs text-slate-700">Zolmitriptan nasal 5–10 mg, as an alternative to sumatriptan SC.</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-amber-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Bridging (while starting preventive)</p>
                    <div className="text-xs text-slate-700">
                      <div>• Ipsilateral GON block with corticosteroid — AHS Grade A for transitional relief.</div>
                      <div className="mt-1">• Prednisone 100 mg/day × 5 days then taper −20 mg q3 days.</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-amber-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Preventive (start immediately)</p>
                    <div className="text-xs text-slate-700 space-y-1">
                      <div><span className="font-semibold">Verapamil</span> 80 mg TID → titrate to 360 mg/day. Obtain baseline ECG; recheck after each dose increase (PR prolongation risk). Burish 2024.</div>
                      <div><span className="font-semibold">Lithium</span> 300 mg BID–TID — second-line; requires serum level monitoring.</div>
                      <div><span className="font-semibold">Topiramate</span> 100–200 mg/day — third-line; avoid in WOCBP.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {headacheType === 'hemicrania-refer' && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Hemicrania Continua: Diagnostic Indomethacin Protocol</p>
                <p className="text-xs text-amber-800 mb-3">Goadsby 2024 Continuum. Absolute response to indomethacin is diagnostic — no response rules out HC.</p>
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="font-semibold text-slate-900 text-sm mb-2">Indomethacin titration (always with PPI)</div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>• Week 1: 25 mg TID (75 mg/day)</div>
                    <div>• Week 2: 50 mg TID (150 mg/day) — if incomplete response</div>
                    <div>• Week 3: 75 mg TID (225 mg/day) — if still incomplete</div>
                    <div className="font-semibold text-amber-700 mt-1.5">Complete response within 1–2 weeks = diagnostic. Maintain at lowest effective dose. GI protection is mandatory.</div>
                    <div className="mt-1.5 text-slate-500">No response after 2 weeks at 75 mg TID: reconsider diagnosis. Consider neuroimaging if not yet obtained.</div>
                  </div>
                </div>
              </div>
            )}
            {headacheType === 'new-daily-workup' && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">New Daily Persistent Headache: Imaging First</p>
                <p className="text-xs text-amber-800">MRI brain ± MRV/MRA required before initiating preventive therapy. Rule out intracranial hypertension, venous sinus thrombosis, and secondary causes. Do not proceed to preventive selection without completed workup.</p>
              </div>
            )}

            {hasAura && (
              <div className="bg-neuro-50 border border-neuro-200 rounded-xl p-3">
                <p className="text-xs text-neuro-800 font-semibold mb-1">Migraine with aura: clinical notes</p>
                <p className="text-xs text-neuro-700">Avoid combined estrogen–progestin contraceptives (increased stroke risk). IV magnesium may have additional benefit acutely. Consider carbamazepine if sensory aura is severe. Confirm acute treatment is optimized (gepants are safe; triptans permitted unless other CVD contraindication exists).</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!isStep2Complete}
                className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center disabled:opacity-40 min-h-[44px]"
              >
                Assess Preventive Need <Chevron direction="right" className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </PathwayRailStep>

      {/* ── Step 3: Preventive Need? ──────────────────────────────────────── */}
      <PathwayRailStep
        stepNumber={3}
        title="PREVENTIVE NEED?"
        iconKey="decision"
        nodeState={isStep3Complete && step > 3 ? 'completed' : step >= 3 ? 'active' : 'locked'}
        segmentAboveTraversed={isStep2Complete && step > 2}
        lockedAriaLabel="Step 3 Preventive Need, awaiting Step 2"
      >
        {isStep3Complete && step > 3 && (
          <div className="mb-3">
            <PathwayBranchChip
              targetFieldId="field-preventive-need"
              label={getStep3Summary()}
              onClick={() => setStep(3)}
            />
          </div>
        )}

        {step === 3 && (headacheType === 'migraine-without-aura' || headacheType === 'migraine-with-aura' || headacheType === 'tension') && (
          <div className="space-y-3" id="field-preventive-need">

            {/* ── Tension-type headache: acute + preventive content ───────────
                Source: Scher Continuum 2024 (TTH acute and preventive review),
                AHS 2021 (shared MOH threshold). Surfaces claims
                clinic-headache-tension-acute-management and
                clinic-headache-tension-preventive. */}
            {headacheType === 'tension' && (
              <>
                <div data-claim="clinic-headache-tension-acute-management" className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">TTH acute treatment</p>
                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="A" />
                        <div className="text-xs text-slate-700">
                          <div className="font-semibold">Ibuprofen 400 to 600 mg PO</div>
                          <div className="text-slate-500">First-line. NSAID of choice in non-pregnant adults without renal or GI contraindication.</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="A" />
                        <div className="text-xs text-slate-700">
                          <div className="font-semibold">Aspirin 500 to 1000 mg PO</div>
                          <div className="text-slate-500">Alternative NSAID when ibuprofen is not preferred.</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="A" />
                        <div className="text-xs text-slate-700">
                          <div className="font-semibold">Acetaminophen 1000 mg PO</div>
                          <div className="text-slate-500">Preferred in pregnancy or when NSAIDs are contraindicated.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    <p className="text-xs text-red-800 font-semibold mb-1">Avoid</p>
                    <p className="text-xs text-red-700">Opioids and butalbital-containing combinations. Both carry MOH and dependence risk and are not first-line for TTH.</p>
                  </div>
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <p className="text-xs text-amber-800 font-semibold mb-1">Medication-overuse limits</p>
                    <p className="text-xs text-amber-700">Simple analgesics ≤15 days/month. Triptans, opioids, and combination analgesics ≤10 days/month. Acute days above either threshold for &gt;3 months meet ICHD-3 8.2 medication-overuse headache criteria.</p>
                  </div>
                </div>

                <div data-claim="clinic-headache-tension-preventive" className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">TTH preventive treatment</p>
                  <p className="text-xs text-slate-600 mb-3">Indicated for chronic TTH (≥15 days/month) or high-frequency episodic TTH with functional impact.</p>
                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="B" />
                        <div className="text-xs text-slate-700">
                          <div className="font-semibold">Amitriptyline 10 to 75 mg at bedtime</div>
                          <div className="text-slate-500">First-line. Start 10 mg, titrate by 10 to 25 mg every 1 to 2 weeks. AAN Level B.</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="B" />
                        <div className="text-xs text-slate-700">
                          <div className="font-semibold">Venlafaxine 75 to 150 mg/day</div>
                          <div className="text-slate-500">Second-line. Preferred when depression or anxiety are comorbid.</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="B" />
                        <div className="text-xs text-slate-700">
                          <div className="font-semibold">Mirtazapine 15 to 30 mg at bedtime</div>
                          <div className="text-slate-500">Second-line. Use when sleep disturbance or anxiety predominate.</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-start gap-2">
                        <EvidenceBadge level="C" />
                        <div className="text-xs text-slate-700">
                          <div className="font-semibold">Topiramate</div>
                          <div className="text-slate-500">Third-line. Less evidence for TTH than for migraine.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 bg-neuro-50 border border-neuro-200 rounded-lg p-2.5">
                    <p className="text-xs text-neuro-800 font-semibold mb-1">Non-pharmacological (AAN Level A)</p>
                    <p className="text-xs text-neuro-700">Stress management, biofeedback, and physical therapy have Level A evidence in TTH and should be offered alongside pharmacotherapy. Beta-blockers have insufficient evidence specifically for TTH and are not recommended.</p>
                  </div>
                </div>
              </>
            )}

            {/* Threshold card */}
            <div
              data-claim="clinic-headache-preventive-threshold"
              className={`rounded-xl p-4 border ${preventiveIndicated ? 'bg-neuro-50 border-neuro-300' : 'bg-white border-slate-100'}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">AHS / AAN Preventive Threshold</p>
              <div className="space-y-2">
                <div className={`flex items-start gap-2 ${(headacheFreq === 'moderate' || headacheFreq === 'high' || headacheFreq === 'chronic') && (midasGrade === 'grade2' || midasGrade === 'grade3' || midasGrade === 'grade4') ? 'text-neuro-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${(headacheFreq === 'moderate' || headacheFreq === 'high' || headacheFreq === 'chronic') && (midasGrade === 'grade2' || midasGrade === 'grade3' || midasGrade === 'grade4') ? 'bg-neuro-600 text-white' : 'bg-slate-200'}`}>
                    {(headacheFreq === 'moderate' || headacheFreq === 'high' || headacheFreq === 'chronic') && (midasGrade === 'grade2' || midasGrade === 'grade3' || midasGrade === 'grade4') && <Check size={10} />}
                  </div>
                  <span className="text-sm">≥4 days/month with MIDAS Grade II–IV (significant disability)</span>
                </div>
                <div className={`flex items-start gap-2 ${(headacheFreq === 'high' || headacheFreq === 'chronic') ? 'text-neuro-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${(headacheFreq === 'high' || headacheFreq === 'chronic') ? 'bg-neuro-600 text-white' : 'bg-slate-200'}`}>
                    {(headacheFreq === 'high' || headacheFreq === 'chronic') && <Check size={10} />}
                  </div>
                  <span className="text-sm">≥6 days/month regardless of disability</span>
                </div>
                <div className={`flex items-start gap-2 ${acuteDaysPerMonth >= 10 ? 'text-neuro-700 font-semibold' : 'text-slate-500'}`}>
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${acuteDaysPerMonth >= 10 ? 'bg-neuro-600 text-white' : 'bg-slate-200'}`}>
                    {acuteDaysPerMonth >= 10 && <Check size={10} />}
                  </div>
                  <span className="text-sm">Acute medication use ≥10 days/month (MOH risk)</span>
                </div>
              </div>

              <div className={`mt-4 py-2 px-3 rounded-lg font-bold text-sm text-center ${preventiveIndicated ? 'bg-neuro-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {preventiveIndicated ? 'Preventive therapy: INDICATED' : 'Preventive therapy: Not currently indicated'}
              </div>

              {!preventiveIndicated && (
                <p className="text-xs text-slate-500 mt-2">Optimize acute therapy first. Reassess if frequency or disability increases. AHS 2021 (Ailani et al.), Lipton 2024 Continuum.</p>
              )}
            </div>

            {!preventiveIndicated && (
              <PathwayLearningPearl
                title="When to reconsider preventive therapy"
                visible={true}
                content={
                  <span>If acute medications are taken ≥10 days/month, MOH becomes a risk even if the frequency threshold isn't met. Re-evaluate at each visit. Patients with grade III–IV MIDAS who just miss the frequency threshold often benefit from preventive therapy — use clinical judgment. AHS 2021.</span>
                }
              />
            )}

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
              <button
                onClick={() => setStep(preventiveIndicated ? 4 : 5)}
                className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center min-h-[44px]"
              >
                {preventiveIndicated ? 'Select Preventive' : 'Optimize Acute TX'} <Chevron direction="right" className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (headacheType === 'cluster-refer' || headacheType === 'hemicrania-refer' || headacheType === 'new-daily-workup') && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
              Preventive selection pathway does not apply to this headache type. Follow the recommendations above for the identified phenotype.
            </div>
            <div className="flex justify-start">
              <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
            </div>
          </div>
        )}
      </PathwayRailStep>

      {/* ── Step 4: Preventive Selection ─────────────────────────────────── */}
      <PathwayRailStep
        stepNumber={4}
        title="PREVENTIVE SELECTION"
        iconKey="clinical"
        nodeState={isStep4Complete && step > 4 ? 'completed' : step >= 4 ? 'active' : 'locked'}
        segmentAboveTraversed={isStep3Complete && step > 3}
        lockedAriaLabel="Step 4 Preventive Selection, awaiting Step 3"
      >
        {isStep4Complete && step > 4 && (
          <div className="mb-3">
            <PathwayBranchChip
              targetFieldId="field-preventive-select"
              label={getStep4Summary()}
              onClick={() => setStep(4)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3" id="field-preventive-select">

            {/* Comorbidities */}
            <div className="bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Comorbidities influencing agent selection</p>
              <div className="flex flex-wrap gap-2">
                <ComorbidityToggle label="Hypertension" value={comorbidities.htn} field="htn" />
                <ComorbidityToggle label="Anxiety" value={comorbidities.anxiety} field="anxiety" />
                <ComorbidityToggle label="Depression" value={comorbidities.depression} field="depression" />
                <ComorbidityToggle label="Insomnia" value={comorbidities.insomnia} field="insomnia" />
                <ComorbidityToggle label="Pregnancy" value={comorbidities.pregnancy} field="pregnancy" />
                <ComorbidityToggle label={<>WOCBP<InfoTooltip text="Women of Childbearing Potential. Topiramate and valproate cause serious birth defects — both are excluded when this is active." /></>} value={comorbidities.women_of_childbearing_potential} field="women_of_childbearing_potential" />
                <ComorbidityToggle label="Epilepsy" value={comorbidities.epilepsy} field="epilepsy" />
                <ComorbidityToggle label="Liver disease" value={comorbidities.hepatic} field="hepatic" />
                <ComorbidityToggle label="CV disease" value={comorbidities.cvRisk} field="cvRisk" />
                <ComorbidityToggle label="Weight concern" value={comorbidities.weightConcern} field="weightConcern" />
              </div>
            </div>

            {/* Prior trial status — gates CGRP access */}
            <div className="bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Prior preventive trial history</p>
              <div className="space-y-2">
                {([
                  { value: 'none', label: 'No prior preventive trials', sub: 'Start with conventional first-line agent.' },
                  { value: 'one-failed', label: '1 adequate trial failed', sub: 'Adequate trial = ≥2 months at therapeutic dose with inadequate response or intolerable side effects.' },
                  { value: 'two-or-more-failed', label: '≥2 adequate trials failed', sub: 'CGRP pathway (mAb or gepant) indicated per AHS 2021 Consensus. Each trial must have been ≥2 months at therapeutic dose.' },
                ] as { value: PriorTrialStatus; label: string; sub: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPriorTrials(opt.value)}
                    className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99] touch-manipulation min-h-[44px] ${
                      priorTrials === opt.value
                        ? 'border-neuro-500 bg-neuro-50 text-neuro-900'
                        : 'border-slate-200 hover:border-neuro-200'
                    }`}
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* CGRP escalation card */}
            {cgrpFirstLine && (
              <div
                data-claim="clinic-headache-cgrp-escalation"
                className="bg-neuro-50 border border-neuro-300 rounded-xl p-4 animate-in slide-in-from-bottom-2"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-600 mb-2">CGRP<span className="normal-case"><InfoTooltip text="Calcitonin Gene-Related Peptide: the neuropeptide central to migraine pathophysiology. Anti-CGRP therapies block this pathway to prevent attacks." /></span> Pathway: Indicated</p>
                <p className="text-xs text-neuro-800 mb-3">≥2 conventional preventive trials failed. CGRP monoclonal antibody<InfoTooltip text="Monoclonal Antibody (mAb): a precision injectable biologic given monthly or quarterly. Targets either the CGRP ligand or its receptor to prevent attacks." /> or gepant is recommended per AHS 2021 Consensus (Ailani et al., Headache 2021;61:1021–1039).</p>
                <div className="space-y-2">
                  {getCgrpAgents().map(agent => (
                    <div key={agent.name} className="bg-white rounded-lg p-3 border border-neuro-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{agent.name}</div>
                          <div className="text-xs text-neuro-700 font-medium mt-0.5">{agent.dose}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{agent.note}</div>
                          {agent.caution && <div className="text-xs text-amber-700 font-semibold mt-0.5">{agent.caution}</div>}
                        </div>
                        <span className="text-[10px] bg-neuro-100 text-neuro-700 font-bold px-2 py-0.5 rounded flex-shrink-0">{agent.class.split(' ')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <PathwayLearningPearl
                  title="CGRP mAbs vs. gepants: which to choose?"
                  visible={true}
                  content={
                    <span>mAbs (erenumab, fremanezumab, galcanezumab, eptinezumab) are typically first choice after conventional failure — monthly or quarterly dosing, strong evidence base. Gepants (atogepant, rimegepant) are oral daily/every-other-day options; preferred when injections are declined or when MOH is a concern (gepants do not cause MOH). Consider insurance and patient preference. AHS 2021 Consensus.</span>
                  }
                />
              </div>
            )}

            {/* Conventional preventives */}
            {(priorTrials === 'none' || priorTrials === 'one-failed') && priorTrials !== null && (
              <div className="bg-white border border-slate-100 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Conventional Preventive Agents</p>
                <p className="text-xs text-slate-500 mb-3">Tailored to comorbidity profile. Allow ≥2 months at therapeutic dose before declaring failure. Lipton & Silberstein, Continuum 2024;30(2):367–378.</p>
                {getConventionalPreventives().length === 0 ? (
                  <p className="text-xs text-amber-700 font-semibold">All conventional preventives are restricted by current comorbidities. Consider CGRP pathway or neurology referral.</p>
                ) : (
                  <div className="space-y-2">
                    {getConventionalPreventives().map(agent => (
                      <div key={agent.name} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-sm text-slate-900">{agent.name}</div>
                            <div className="text-xs text-neuro-700 font-medium mt-0.5">{agent.dose}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{agent.note}</div>
                            {agent.caution && <div className="text-xs text-amber-700 font-semibold mt-0.5">{agent.caution}</div>}
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded flex-shrink-0">{agent.class}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pregnancy special card */}
            {comorbidities.pregnancy && (
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-pink-600 mb-1">Pregnancy: Preventive Therapy</p>
                <p className="text-xs text-pink-900">Most preventive agents are contraindicated in pregnancy. Options with limited evidence: propranolol (risk of neonatal bradycardia/IUGR at high doses), magnesium supplementation (400–600 mg/day oral), low-dose amitriptyline (after specialist review). Avoid: topiramate, valproate, gepants, CGRP mAbs. Refer to maternal-fetal medicine + neurology. Burch 2024 Table 3-5.</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(3)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
              <button
                onClick={() => setStep(5)}
                disabled={!isStep4Complete}
                className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center disabled:opacity-40 min-h-[44px]"
              >
                Optimize Acute TX <Chevron direction="right" className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </PathwayRailStep>

      {/* ── Step 5: Acute Optimization ───────────────────────────────────── */}
      <PathwayRailStep
        stepNumber={5}
        title="ACUTE OPTIMIZATION"
        iconKey="clinical"
        nodeState={step > 5 ? 'completed' : step >= 5 ? 'active' : 'locked'}
        segmentAboveTraversed={(isStep4Complete && step > 4) || (!preventiveIndicated && step > 3)}
        lockedAriaLabel="Step 5 Acute Optimization"
      >
        {step > 5 && (
          <div className="mb-3">
            <PathwayBranchChip
              targetFieldId="field-acute"
              label="Acute therapy reviewed"
              onClick={() => setStep(5)}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3" id="field-acute">

            {/* MOH check */}
            {acuteDaysPerMonth >= 10 && (
              <div
                data-claim="clinic-headache-moh-gepant-safe"
                className="bg-amber-50 border border-amber-300 rounded-xl p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">MOH<span className="normal-case"><InfoTooltip text="Medication Overuse Headache: using acute medications too frequently paradoxically worsens headache. Threshold: triptans or opioids ≥10 days/month; NSAIDs ≥15 days/month." /></span> Risk: {acuteDaysPerMonth} acute medication days/month</p>
                <p className="text-xs text-amber-900 mb-2">Patient is using acute medications ≥10 days/month — MOH threshold reached for triptans and opioids (≥10 days), or ≥15 days for NSAIDs. Rizzoli 2024.</p>
                <div className="bg-white border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-neuro-700 mb-1">Switch to gepant for acute use — gepants do NOT cause MOH</p>
                  <p className="text-xs text-slate-700">Ubrogepant 50/100 mg PO PRN, rimegepant 75 mg ODT PRN, or atogepant 10 mg PRN (also functions as daily preventive). AHS 2021 (Ailani et al.); Rizzoli 2024.</p>
                </div>
              </div>
            )}

            {/* Acute stepwise ladder */}
            <div className="bg-white border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Acute Treatment Ladder: Outpatient</p>
              <div className="space-y-2">
                <div className="bg-neuro-50 rounded-lg p-3 border border-neuro-100">
                  <div className="font-semibold text-sm text-neuro-900">Step 1: Early treatment at onset</div>
                  <p className="text-xs text-neuro-800 mt-0.5">Treat within 30 min of onset (before pain escalates). NSAID + triptan combo outperforms either alone. Burch 2024.</p>
                  <ul className="mt-2 space-y-1">
                    <li className="text-xs text-slate-700">• Ibuprofen 400–600 mg PO or naproxen 500 mg PO</li>
                    <li className="text-xs text-slate-700">• Sumatriptan 50–100 mg PO (or 6 mg SC for faster onset)</li>
                    <li className="text-xs text-slate-700">• Rizatriptan 10 mg PO; zolmitriptan 2.5 mg PO/nasal</li>
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="font-semibold text-sm text-slate-900">Step 2: Triptan alternatives (vascular CI or overuse)</div>
                  <ul className="mt-1 space-y-1">
                    <li className="text-xs text-slate-700">• Rimegepant 75 mg ODT — no MOH, no CV contraindication</li>
                    <li className="text-xs text-slate-700">• Ubrogepant 50/100 mg PO — no MOH, no CV contraindication</li>
                    <li className="text-xs text-slate-700">• Lasmiditan 50/100/200 mg PO — no driving × 8 h; no vasoconstriction</li>
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="font-semibold text-sm text-slate-900">Step 3: Anti-nausea adjunct</div>
                  <ul className="mt-1 space-y-1">
                    <li className="text-xs text-slate-700">• Prochlorperazine 10 mg PO (or metoclopramide 10 mg PO) — also has direct antimigraine properties</li>
                    <li className="text-xs text-slate-700">• Ondansetron 4–8 mg ODT — nausea only; no direct migraine benefit</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Aura-specific acute note */}
            {hasAura && (
              <div className="bg-neuro-50 border border-neuro-200 rounded-xl p-3">
                <p className="text-xs font-bold text-neuro-700 mb-1">Migraine with aura: avoid estrogen-containing OCP</p>
                <p className="text-xs text-neuro-700">Combined OCP significantly increases ischemic stroke risk in migraine with aura. Discuss with OB/GYN; progestin-only pill is preferred. Burch 2024 p.335.</p>
              </div>
            )}

            {/* MOH prevention pearl */}
            <PathwayLearningPearl
              title="Acute treatment strategy to prevent MOH"
              visible={true}
              content={
                <span>Limit triptan and NSAID use to ≤10 days/month. If frequency demand exceeds this, transition to a gepant (no MOH threshold) and prioritize preventive therapy. Brief the patient that MOH can paradoxically worsen headache frequency. Rizzoli 2024 Continuum; AHS 2021 Ailani.</span>
              }
            />

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(preventiveIndicated ? 4 : 3)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
              <button
                onClick={() => setStep(6)}
                className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center min-h-[44px]"
              >
                Build Plan <Chevron direction="right" className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </PathwayRailStep>

      {/* ── Step 6: Plan ──────────────────────────────────────────────────── */}
      <PathwayRailStep
        stepNumber={6}
        title="PLAN"
        iconKey="decision"
        nodeState={step === 6 ? 'active' : step > 6 ? 'completed' : 'locked'}
        segmentAboveTraversed={step > 5}
        lockedAriaLabel="Step 6 Plan, awaiting Step 5"
      >
        {step === 6 && (
          <div className="space-y-4" role="status" aria-live="polite" aria-atomic="true">

            {/* Summary card */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visit Summary</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">Headache frequency</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">
                    {headacheFreq === 'low' ? '0–3/month' : headacheFreq === 'moderate' ? '4–7/month' : headacheFreq === 'high' ? '8–14/month' : '≥15/month'}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">MIDAS Score</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{midasTotal}: {midasGrade?.replace('grade', 'Grade ')}</div>
                </div>
              </div>

              <div className={`rounded-lg p-3 ${preventiveIndicated ? 'bg-neuro-50 border border-neuro-100' : 'bg-slate-50'}`}>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Preventive Therapy</div>
                {preventiveIndicated ? (
                  <div className="text-sm font-bold text-neuro-900">
                    {cgrpFirstLine
                      ? 'CGRP pathway indicated (≥2 conventional trials failed)'
                      : priorTrials === 'one-failed'
                      ? 'Try 1 more conventional preventive; CGRP available if it fails'
                      : 'Start conventional preventive first'}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">Not currently indicated — optimize acute therapy and reassess.</div>
                )}
              </div>

              {acuteDaysPerMonth >= 10 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-widest text-amber-600 mb-0.5">MOH Risk</div>
                  <div className="text-xs text-amber-900 font-semibold">Switch acute agent to gepant — gepants do not cause MOH.</div>
                </div>
              )}
            </div>

            {/* Follow-up reminder */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Follow-up checklist</p>
              <ul className="space-y-1">
                <li className="text-xs text-slate-700">• Reassess MIDAS score and headache diary at 6–8 weeks</li>
                <li className="text-xs text-slate-700">• Confirm preventive tolerability and dose titration</li>
                <li className="text-xs text-slate-700">• Review acute medication days — aim for &lt;10/month</li>
                {preventiveIndicated && priorTrials !== 'two-or-more-failed' && (
                  <li className="text-xs text-slate-700">• Allow ≥2 months at therapeutic dose before declaring trial failure</li>
                )}
                {cgrpFirstLine && (
                  <li className="text-xs text-slate-700">• Assess CGRP mAb response at 3 months; consider dose escalation (e.g., erenumab 140 mg) if partial response</li>
                )}
                {hasAura && (
                  <li className="text-xs text-slate-700">• Counsel re: combined OCP avoidance in migraine with aura</li>
                )}
              </ul>
            </div>

            {/* Copy / reset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={copySummary} className="py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center justify-center active:scale-95 min-h-[44px]">
                <Copy size={16} className="mr-2" /> Copy to Clipboard
              </button>
              <button onClick={handleReset} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center min-h-[44px]">
                <RotateCcw size={16} className="mr-2" /> Start Over
              </button>
            </div>

            {copyToast && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-50">
                Copied to clipboard
              </div>
            )}

            {/* Sources footer */}
            <div className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
              <p className="font-semibold mb-1">Sources</p>
              <p>AHS Consensus Statement: Ailani J et al. Headache 2021;61:1021–1039. DOI: 10.1111/head.14153. PMID: 34128230.</p>
              <p>Lipton RB, Silberstein SD. Continuum 2024;30(2):367–378. DOI: 10.1212/CON.0000000000001410.</p>
              <p>Burch RC. Continuum 2024;30(2):316–366. DOI: 10.1212/CON.0000000000001411.</p>
              <p>Rizzoli P. Continuum 2024;30(2):379–390. DOI: 10.1212/CON.0000000000001413.</p>
            </div>
          </div>
        )}
      </PathwayRailStep>

      {/* Toast */}
      {showFavToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-50">
          {isFav ? 'Added to Favorites' : 'Removed from Favorites'}
        </div>
      )}
    </div>
  );
};

export default ClinicHeadachePathway;
