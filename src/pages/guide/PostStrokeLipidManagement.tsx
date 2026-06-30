import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw, TrendingDown, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { PathwayHeader } from '../../components/pathways/PathwayHeader';
import { PathwayBranchChip } from '../../components/pathways/PathwayBranchChip';
import { PathwayLearningPearl } from '../../components/pathways/PathwayLearningPearl';
import { CorBadge } from '../../components/ui/CorBadge';
import { LoeBadge } from '../../components/ui/LoeBadge';
import { useFavorites } from '../../hooks/useFavorites';
import { useNavigationSource } from '../../hooks/useNavigationSource';
import { useRecents } from '../../hooks/useRecents';

// ─── Types ────────────────────────────────────────────────────────────────────

type StrokeType = 'ischemic' | 'hemorrhagic' | null;
type RiskTier = 'vhr' | 'standard' | null;
type StatinStatus = 'none' | 'low-mod' | 'high' | 'intolerant' | null;
type IchLocation = 'lobar' | 'deep' | null;

// ─── LDL projection helpers ───────────────────────────────────────────────────

function projectLdl(current: number, addEzetimibe: boolean, addPcsk9: boolean): number {
  let result = current;
  if (addEzetimibe && addPcsk9) result = current * 0.35;
  else if (addPcsk9) result = current * 0.45;
  else if (addEzetimibe) result = current * 0.80;
  return Math.round(result);
}

type EscalationAction =
  | 'at-target'
  | 'optimize-statin'
  | 'add-ezetimibe'
  | 'add-pcsk9'
  | 'add-both'
  | 'statin-intolerant'
  | 'check-ldl';

interface EscalationRec {
  action: EscalationAction;
  projectedLdl: number | null;
  claimId: string;
}

function getRecommendation(
  ldlC: number | null,
  statinStatus: StatinStatus,
  isVhr: boolean,
): EscalationRec {
  const target = isVhr ? 55 : 70;

  if (statinStatus === 'intolerant') {
    return { action: 'statin-intolerant', projectedLdl: null, claimId: 'dyslipidemia-2026-stroke-ldlc-55' };
  }
  if (statinStatus === 'none' || statinStatus === 'low-mod') {
    return { action: 'optimize-statin', projectedLdl: null, claimId: isVhr ? 'dyslipidemia-2026-stroke-ldlc-55' : 'dyslipidemia-2026-stroke-ldlc-70-not-vhr' };
  }
  if (ldlC === null) {
    return { action: 'check-ldl', projectedLdl: null, claimId: isVhr ? 'dyslipidemia-2026-stroke-ldlc-55' : 'dyslipidemia-2026-stroke-ldlc-70-not-vhr' };
  }
  if (ldlC <= target) {
    return { action: 'at-target', projectedLdl: ldlC, claimId: isVhr ? 'dyslipidemia-2026-stroke-ldlc-55' : 'dyslipidemia-2026-stroke-ldlc-70-not-vhr' };
  }
  const withEzetimibe = projectLdl(ldlC, true, false);
  if (withEzetimibe <= target) {
    return { action: 'add-ezetimibe', projectedLdl: withEzetimibe, claimId: isVhr ? 'dyslipidemia-2026-stroke-ldlc-55' : 'dyslipidemia-2026-stroke-ldlc-70-not-vhr' };
  }
  const withPcsk9 = projectLdl(ldlC, false, true);
  if (withPcsk9 <= target) {
    return { action: 'add-pcsk9', projectedLdl: withPcsk9, claimId: isVhr ? 'dyslipidemia-2026-stroke-ldlc-55' : 'dyslipidemia-2026-stroke-ldlc-70-not-vhr' };
  }
  return {
    action: 'add-both',
    projectedLdl: projectLdl(ldlC, true, true),
    claimId: isVhr ? 'dyslipidemia-2026-stroke-ldlc-55' : 'dyslipidemia-2026-stroke-ldlc-70-not-vhr',
  };
}

const STEPS = [
  { id: 1, title: 'Regimen' },
  { id: 2, title: 'Escalation' },
  { id: 3, title: 'Plan' },
];

// ─── Shared card primitive ────────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`bg-white border border-slate-100 rounded-xl p-4 ${className}`}
    style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}
  >
    {children}
  </div>
);

// ─── Evidence expander ────────────────────────────────────────────────────────

const EvidenceToggle: React.FC<{ id: string; label: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({
  id, label, open, onToggle, children,
}) => (
  <div className="mt-3 border-t border-slate-100 pt-3">
    <button
      id={id}
      onClick={onToggle}
      className="flex items-center gap-1.5 text-[12px] font-medium text-neuro-600 hover:text-neuro-700 transition-colors min-h-[44px]"
      aria-expanded={open}
    >
      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      {label}
    </button>
    {open && <div className="mt-2 text-[13px] text-slate-600 leading-relaxed space-y-2">{children}</div>}
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PostStrokeLipidManagement: React.FC = () => {
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'post-stroke-lipid',
      title: 'Post-Stroke Lipid Management',
      subtitle: 'LDL-C targets · escalation · ICH arm',
      category: 'stroke',
      trail: '3 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { handleBack } = useNavigationSource();
  const topRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite('post-stroke-lipid');
  const [copyConfirm, setCopyConfirm] = useState(false);

  const handleFavToggle = () => { toggleFavorite('post-stroke-lipid'); };

  const handleCopy = () => {
    const summary = `Post-Stroke Lipid Management | NeuroWiki\nTarget: ${riskTier === 'vhr' ? '<55' : '<70'} mg/dL (${riskTier === 'vhr' ? 'VHR' : 'standard ASCVD'})`;
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  };

  // ── Clinical state ────────────────────────────────────────────────────────
  const [strokeType, setStrokeType] = useState<StrokeType>(null);
  const [riskTier, setRiskTier] = useState<RiskTier>(null);
  const [ldlCInput, setLdlCInput] = useState('');
  const [statinStatus, setStatinStatus] = useState<StatinStatus>(null);
  const [ichLocation, setIchLocation] = useState<IchLocation>(null);
  const [lpaElevated, setLpaElevated] = useState<boolean | null>(null);
  const [step, setStep] = useState(0); // 0 = entry, 1-3 = pathway steps

  // Evidence expanders
  const [evidenceOpen, setEvidenceOpen] = useState<Record<string, boolean>>({});
  const toggleEvidence = (id: string) =>
    setEvidenceOpen(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Derived values ────────────────────────────────────────────────────────
  const ldlC = ldlCInput !== '' ? parseFloat(ldlCInput) : null;
  const isVhr = riskTier === 'vhr';
  const target = isVhr ? 55 : 70;
  const rec = strokeType === 'ischemic' && statinStatus !== null
    ? getRecommendation(ldlC, statinStatus, isVhr)
    : null;

  const entryComplete = strokeType !== null && (strokeType === 'hemorrhagic' || riskTier !== null);
  const step1Complete = statinStatus !== null;

  useEffect(() => {
    if (step > 0 && topRef.current) {
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [step]);

  const handleReset = () => {
    setStrokeType(null);
    setRiskTier(null);
    setLdlCInput('');
    setStatinStatus(null);
    setIchLocation(null);
    setLpaElevated(null);
    setStep(0);
    setEvidenceOpen({});
    window.scrollTo(0, 0);
  };

  // ── Branch chips ──────────────────────────────────────────────────────────
  const chips = [
    strokeType && {
      label: strokeType === 'ischemic' ? 'Ischaemic stroke' : 'Intracerebral haemorrhage',
      onClick: () => { setStrokeType(null); setRiskTier(null); setLdlCInput(''); setStatinStatus(null); setStep(0); },
    },
    riskTier && strokeType === 'ischemic' && {
      label: riskTier === 'vhr' ? 'Very high risk' : 'Standard ASCVD',
      onClick: () => { setRiskTier(null); setStatinStatus(null); setStep(0); },
    },
    ldlC !== null && {
      label: `LDL-C ${ldlC} mg/dL`,
      onClick: () => { setLdlCInput(''); },
    },
    statinStatus && step >= 2 && {
      label: statinStatus === 'high' ? 'High-intensity statin' : statinStatus === 'low-mod' ? 'Low/mod statin' : statinStatus === 'none' ? 'No statin' : 'Statin intolerant',
      onClick: () => { setStatinStatus(null); setStep(1); },
    },
  ].filter(Boolean) as { label: string; onClick: () => void }[];

  // ── Rendering ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-slate-50 pb-24" ref={topRef}>
      <PathwayHeader
        pathwayLabel="Post-Stroke Lipid Management"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={handleFavToggle}
        onReset={handleReset}
        onCopy={handleCopy}
        copyConfirm={copyConfirm}
      />

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">

        {/* ── Branch chips ─────────────────────────────────────────────────── */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <PathwayBranchChip key={i} label={chip.label} targetFieldId="" onClick={chip.onClick} />
            ))}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 min-h-[44px] px-2 transition-colors"
              aria-label="Reset pathway"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        )}

        {/* ── Step progress indicator (ischemic arm only, after entry) ──── */}
        {strokeType === 'ischemic' && step >= 1 && (
          <div className="flex flex-col px-1" aria-label={`Step ${step} of ${STEPS.length}`}>
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const current = step === s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-4 shrink-0">
                      <div className={`rounded-full transition-all ${
                        done
                          ? 'w-3 h-3 bg-neuro-500'
                          : current
                            ? 'w-4 h-4 bg-white border-2 border-neuro-500'
                            : 'w-3.5 h-3.5 bg-white border-2 border-slate-300'
                      }`} />
                    </div>
                    <span className={`text-[13px] transition-colors ${step >= s.id ? 'text-neuro-600 font-medium' : 'text-slate-400'}`}>{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-0.5 h-3.5 my-0.5 ml-[7px] ${done ? 'bg-neuro-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ENTRY — Two questions                                              */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        {step === 0 && (
          <div className="space-y-4">

            {/* Q1: Stroke type */}
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Step 1 of 2: Stroke type
              </p>
              <p className="text-[15px] font-semibold text-slate-900 mb-4">
                What type of stroke does this patient have?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['ischemic', 'hemorrhagic'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setStrokeType(type);
                      if (type === 'hemorrhagic') { setRiskTier(null); }
                    }}
                    className={`rounded-xl border p-4 text-left transition-all min-h-[64px] ${
                      strokeType === type
                        ? 'border-neuro-500 bg-neuro-50'
                        : 'border-slate-200 bg-white hover:border-neuro-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className={`text-[14px] font-semibold ${strokeType === type ? 'text-neuro-700' : 'text-slate-800'}`}>
                      {type === 'ischemic' ? 'Ischaemic stroke / TIA' : 'Intracerebral haemorrhage'}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {type === 'ischemic' ? 'Including lacunar, cardioembolic, cryptogenic' : 'Spontaneous / hypertensive / CAA'}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Q2: VHR status (ischemic only) */}
            {strokeType === 'ischemic' && (
              <Card>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Step 2 of 2: ASCVD risk tier
                </p>
                <p className="text-[15px] font-semibold text-slate-900 mb-1">
                  Is this patient at very high ASCVD risk?
                </p>
                <p
                  data-claim="dyslipidemia-2026-stroke-major-ascvd"
                  className="text-[12px] text-slate-500 mb-4 leading-relaxed"
                >
                  Prior ischaemic stroke counts as 1 major ASCVD event. Very high risk (VHR) requires ≥2 major events, or 1 event plus ≥2 high-risk conditions (diabetes, age &gt;65, HF, HTN, LDL-C &gt;100 mg/dL despite maximally tolerated statin + ezetimibe, active smoker, prior revascularisation). · 2026 ACC/AHA Figure 10
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setRiskTier('vhr'); }}
                    className={`rounded-xl border p-4 text-left transition-all min-h-[80px] ${
                      riskTier === 'vhr'
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/40'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1.5 ${riskTier === 'vhr' ? 'text-amber-700' : 'text-slate-400'}`}>
                      <AlertTriangle size={11} /> Very high risk
                    </div>
                    <p className="text-[13px] text-slate-700">≥2 major events, or 1 event + ≥2 conditions</p>
                    <p className={`text-[12px] font-semibold mt-1 ${riskTier === 'vhr' ? 'text-amber-700' : 'text-slate-500'}`}>Target LDL-C &lt;55 mg/dL</p>
                  </button>
                  <button
                    onClick={() => { setRiskTier('standard'); }}
                    className={`rounded-xl border p-4 text-left transition-all min-h-[80px] ${
                      riskTier === 'standard'
                        ? 'border-neuro-400 bg-neuro-50'
                        : 'border-slate-200 bg-white hover:border-neuro-200 hover:bg-neuro-50/40'
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1.5 ${riskTier === 'standard' ? 'text-neuro-700' : 'text-slate-400'}`}>
                      <TrendingDown size={11} /> Standard ASCVD
                    </div>
                    <p className="text-[13px] text-slate-700">1 major event, no qualifying additional conditions</p>
                    <p data-claim="dyslipidemia-2026-stroke-ldlc-70-not-vhr" className={`text-[12px] font-semibold mt-1 ${riskTier === 'standard' ? 'text-neuro-700' : 'text-slate-500'}`}>Target LDL-C &lt;70 mg/dL</p>
                  </button>
                </div>
              </Card>
            )}

            {/* Q3: LDL-C (optional) */}
            {(strokeType === 'ischemic' && riskTier) && (
              <Card>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Optional: current LDL-C
                </p>
                <p className="text-[14px] text-slate-700 mb-3">
                  Enter the most recent fasting LDL-C to see a projected value after each add-on.
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="20"
                      max="400"
                      placeholder="e.g. 88"
                      value={ldlCInput}
                      onChange={e => setLdlCInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">mg/dL</span>
                  </div>
                  {ldlCInput && (
                    <button
                      onClick={() => setLdlCInput('')}
                      className="text-[12px] text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Cross-link to ASCVD risk calculator (primary prevention reference) */}
            {strokeType === 'ischemic' && (
              <a
                href="/calculators/ascvd-risk"
                className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-neuro-300 hover:bg-neuro-50/40 transition-all min-h-[56px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference tool</p>
                    <p className="text-[13px] font-semibold text-slate-800 mt-0.5">Open ASCVD 10-year Risk calculator</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pooled Cohort Equations. Note: this patient already has clinical ASCVD (prior stroke); use for context only.</p>
                  </div>
                  <span className="text-neuro-600 text-[16px] shrink-0">↗</span>
                </div>
              </a>
            )}

            {/* Continue button */}
            {entryComplete && (
              <button
                onClick={() => setStep(strokeType === 'ischemic' ? 1 : 10)}
                className="w-full rounded-xl bg-neuro-600 text-white font-semibold py-4 text-[15px] hover:bg-neuro-700 active:scale-[0.98] transition-all min-h-[56px]"
              >
                {strokeType === 'ischemic' ? 'Continue to regimen →' : 'View ICH guidance →'}
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ISCHAEMIC ARM — Step 1: Current regimen                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        {strokeType === 'ischemic' && step === 1 && (
          <div className="space-y-4">

            {/* Status bar */}
            <div
              className={`rounded-xl border p-3 flex items-center justify-between gap-4 ${
                isVhr ? 'bg-amber-50 border-amber-200' : 'bg-neuro-50 border-neuro-200'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isVhr ? 'text-amber-600' : 'text-neuro-600'}`}>
                  {isVhr ? '⚠ Very high risk' : 'Standard ASCVD'}
                </span>
                <p className="text-[14px] font-semibold text-slate-900 mt-0.5">
                  Target LDL-C &lt;{target} mg/dL
                  {ldlC !== null && <span className="text-slate-500 font-normal"> · Current: {ldlC} mg/dL</span>}
                </p>
              </div>
              {ldlC !== null && (
                <div className={`text-right shrink-0 ${ldlC <= target ? 'text-emerald-600' : isVhr ? 'text-amber-600' : 'text-neuro-600'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-widest">Gap</p>
                  <p className="text-[16px] font-bold">{Math.max(0, ldlC - target)} mg/dL</p>
                </div>
              )}
            </div>

            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Step 1: Current statin regimen
              </p>
              <p className="text-[15px] font-semibold text-slate-900 mb-4">
                What is the patient currently taking?
              </p>
              <div className="space-y-2">
                {[
                  { id: 'high' as const, label: 'High-intensity statin', sub: 'Atorvastatin 40–80 mg · Rosuvastatin 20–40 mg' },
                  { id: 'low-mod' as const, label: 'Low or moderate-intensity statin', sub: 'Simvastatin, pravastatin, lower atorvastatin doses' },
                  { id: 'none' as const, label: 'No statin started', sub: 'Not yet initiated or never prescribed' },
                  { id: 'intolerant' as const, label: 'Statin intolerant', sub: 'Myopathy, persistent myalgia, or CK elevation on ≥2 statins' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStatinStatus(opt.id)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all min-h-[60px] flex items-start gap-3 ${
                      statinStatus === opt.id
                        ? 'border-neuro-500 bg-neuro-50'
                        : 'border-slate-200 bg-white hover:border-neuro-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      statinStatus === opt.id ? 'border-neuro-500 bg-neuro-500' : 'border-slate-300'
                    }`}>
                      {statinStatus === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-[14px] font-semibold ${statinStatus === opt.id ? 'text-neuro-700' : 'text-slate-800'}`}>{opt.label}</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {step1Complete && (
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-neuro-600 text-white font-semibold py-4 text-[15px] hover:bg-neuro-700 active:scale-[0.98] transition-all min-h-[56px]"
              >
                See recommendation →
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ISCHAEMIC ARM — Step 2: Escalation recommendation                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        {strokeType === 'ischemic' && step === 2 && rec && (
          <div className="space-y-4">

            {/* Status bar */}
            <div className={`rounded-xl border p-3 flex items-center justify-between gap-4 ${isVhr ? 'bg-amber-50 border-amber-200' : 'bg-neuro-50 border-neuro-200'}`}>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isVhr ? 'text-amber-600' : 'text-neuro-600'}`}>
                  {isVhr ? '⚠ Very high risk' : 'Standard ASCVD'}
                </span>
                <p className="text-[14px] font-semibold text-slate-900 mt-0.5">
                  Target &lt;{target} mg/dL
                  {ldlC !== null && <span className="text-slate-500 font-normal"> · Current: {ldlC} mg/dL</span>}
                </p>
              </div>
              {rec.projectedLdl !== null && rec.action !== 'at-target' && (
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">After add-on</p>
                  <p className={`text-[16px] font-bold ${rec.projectedLdl <= target ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ~{rec.projectedLdl} mg/dL
                  </p>
                </div>
              )}
            </div>

            {/* ── At target ─────────────────────────────────────────────── */}
            {rec.action === 'at-target' && (
              <Card>
                <div data-claim={rec.claimId} className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-[16px] font-bold text-emerald-700">At LDL-C target</p>
                    <p className="text-[13px] text-slate-600 mt-1">
                      LDL-C {ldlC} mg/dL is at or below the {isVhr ? 'VHR' : 'ASCVD'} goal of &lt;{target} mg/dL. Continue current regimen and monitor per plan.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <CorBadge cor="I" /><LoeBadge loe="A" />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Optimise statin ────────────────────────────────────────── */}
            {rec.action === 'optimize-statin' && (
              <Card>
                <div data-claim={rec.claimId}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-600 mb-2">First step</p>
                  <p className="text-[16px] font-bold text-slate-900">Initiate or escalate to high-intensity statin</p>
                  <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
                    Atorvastatin 40–80 mg or rosuvastatin 20–40 mg daily. High-intensity statin achieves ≥50% LDL-C reduction. Re-check LDL-C at 4–12 weeks to assess response and plan next escalation step.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <CorBadge cor="I" /><LoeBadge loe="A" />
                    <span className="text-[11px] text-slate-400">2026 ACC/AHA §4.2.6</span>
                  </div>
                  <EvidenceToggle
                    id="ev-optimize"
                    label="Guideline context"
                    open={!!evidenceOpen['ev-optimize']}
                    onToggle={() => toggleEvidence('ev-optimize')}
                  >
                    <p>High-intensity statin therapy should be initiated to achieve a ≥50% reduction in LDL-C and a goal of LDL-C &lt;{target} mg/dL per 2026 ACC/AHA §4.2.6. After confirming adherence and tolerability, recheck LDL-C and advance to the next escalation step if not at goal.</p>
                  </EvidenceToggle>
                </div>
              </Card>
            )}

            {/* ── Check LDL ────────────────────────────────────────────── */}
            {rec.action === 'check-ldl' && (
              <Card>
                <div data-claim={rec.claimId} className="flex items-start gap-3">
                  <Info className="text-neuro-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-[16px] font-bold text-slate-900">Obtain fasting LDL-C</p>
                    <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
                      Patient is on high-intensity statin. Enter LDL-C above to see the precise projected value after add-on therapy. Target is &lt;{target} mg/dL.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Add ezetimibe ────────────────────────────────────────── */}
            {rec.action === 'add-ezetimibe' && (
              <Card>
                <div data-claim={rec.claimId}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-600 mb-2">Recommended next step</p>
                  <p className="text-[16px] font-bold text-slate-900">Add ezetimibe 10 mg daily</p>
                  {ldlC !== null && rec.projectedLdl !== null && (
                    <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Projected LDL-C</p>
                        <p className="text-[20px] font-bold text-emerald-700">~{rec.projectedLdl} mg/dL</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">Target</p>
                        <p className="text-[14px] font-semibold text-slate-700">&lt;{target} mg/dL</p>
                      </div>
                    </div>
                  )}
                  <p className="text-[13px] text-slate-600 mt-3 leading-relaxed">
                    Ezetimibe 10 mg reduces LDL-C by approximately 20% from current on-statin level. Recheck LDL-C at 4–12 weeks. If not at goal, consider PCSK9 mAb.
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <CorBadge cor="I" /><LoeBadge loe="A" />
                    <span className="text-[11px] text-slate-400">2026 ACC/AHA §4.2.6</span>
                  </div>
                  <EvidenceToggle
                    id="ev-ezetimibe"
                    label="Guideline + PCSK9 sequencing change"
                    open={!!evidenceOpen['ev-ezetimibe']}
                    onToggle={() => toggleEvidence('ev-ezetimibe')}
                  >
                    <div data-claim="dyslipidemia-2026-pcsk9-escalation">
                      <p className="font-medium text-slate-800 text-[13px]">2026 sequencing update</p>
                      <p>The 2026 ACC/AHA guideline no longer requires ezetimibe before a PCSK9 mAb. Both are COR 1, LOE A options. The choice depends on the degree of LDL-C lowering needed and patient preference. When ezetimibe alone reaches the target (shown above), it is the preferred first add-on: oral, cheaper, and with proven MACE benefit in IMPROVE-IT.</p>
                    </div>
                    <p className="mt-2 text-slate-500 text-[12px]">IMPROVE-IT (Cannon et al., NEJM 2015): ezetimibe + simvastatin reduced LDL-C from ~69 to ~54 mg/dL and reduced MACE (HR 0.936, NNT ~50 over 7 years) in post-ACS patients.</p>
                  </EvidenceToggle>
                </div>
              </Card>
            )}

            {/* ── Add PCSK9 mAb ─────────────────────────────────────────── */}
            {rec.action === 'add-pcsk9' && (
              <Card>
                <div data-claim={rec.claimId}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-600 mb-2">Recommended next step</p>
                  <p className="text-[16px] font-bold text-slate-900">Add PCSK9 mAb</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">Evolocumab 140 mg Q2W or 420 mg monthly · Alirocumab 75–150 mg Q2W</p>
                  {ldlC !== null && rec.projectedLdl !== null && (
                    <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Projected LDL-C</p>
                        <p className="text-[20px] font-bold text-emerald-700">~{rec.projectedLdl} mg/dL</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">Target</p>
                        <p className="text-[14px] font-semibold text-slate-700">&lt;{target} mg/dL</p>
                      </div>
                    </div>
                  )}
                  <p className="text-[13px] text-slate-600 mt-3 leading-relaxed">
                    PCSK9 mAb reduces LDL-C by ~55% from current on-statin level. Ezetimibe add-on alone would not reach the &lt;{target} mg/dL target; PCSK9 mAb is the preferred next step here. Recheck LDL-C at 4–12 weeks.
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <CorBadge cor="I" /><LoeBadge loe="A" />
                    <span className="text-[11px] text-slate-400">2026 ACC/AHA §4.2.6</span>
                  </div>
                  <EvidenceToggle
                    id="ev-pcsk9"
                    label="Guideline + sequencing context"
                    open={!!evidenceOpen['ev-pcsk9']}
                    onToggle={() => toggleEvidence('ev-pcsk9')}
                  >
                    <div data-claim="dyslipidemia-2026-pcsk9-escalation">
                      <p>The 2026 ACC/AHA guideline revised Recommendation #5: ezetimibe and/or PCSK9 mAbs should be added to maximally tolerated statin. Ezetimibe is no longer required before a PCSK9 mAb. Both are COR 1, LOE A. FOURIER (evolocumab, N=27,564) and ODYSSEY OUTCOMES (alirocumab, N=18,924) showed 50–55% LDL-C reduction and significant MACE reduction. Neither trial showed increased haemorrhagic stroke risk.</p>
                    </div>
                  </EvidenceToggle>
                </div>
              </Card>
            )}

            {/* ── Add both ─────────────────────────────────────────────── */}
            {rec.action === 'add-both' && (
              <Card>
                <div data-claim={rec.claimId}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-600 mb-2">Combination escalation</p>
                  <p className="text-[16px] font-bold text-slate-900">Add ezetimibe + PCSK9 mAb</p>
                  {ldlC !== null && rec.projectedLdl !== null && (
                    <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Projected LDL-C</p>
                        <p className="text-[20px] font-bold text-emerald-700">~{rec.projectedLdl} mg/dL</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">Target</p>
                        <p className="text-[14px] font-semibold text-slate-700">&lt;{target} mg/dL</p>
                      </div>
                    </div>
                  )}
                  <p className="text-[13px] text-slate-600 mt-3 leading-relaxed">
                    LDL-C is high enough that PCSK9 mAb alone (~55% reduction) may still not reach the &lt;{target} mg/dL target. Combination of ezetimibe + PCSK9 mAb achieves approximately 65% reduction. Start together or add sequentially.
                  </p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <CorBadge cor="I" /><LoeBadge loe="A" />
                    <span className="text-[11px] text-slate-400">2026 ACC/AHA §4.2.6</span>
                  </div>
                </div>
              </Card>
            )}

            {/* ── Statin intolerant ─────────────────────────────────────── */}
            {rec.action === 'statin-intolerant' && (
              <div className="space-y-3">
                <Card>
                  <div data-claim="dyslipidemia-2026-stroke-ldlc-55">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Statin intolerance pathway</p>
                    <p className="text-[15px] font-semibold text-slate-900">Non-statin LDL-C lowering required</p>
                    <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
                      When high-intensity statin is not tolerated, continue the lowest tolerable dose. The 2026 ACC/AHA guideline uses the term "maximally tolerated statin." Even a low-dose statin on alternate days reduces LDL-C meaningfully and should be kept if the patient can take it.
                    </p>
                  </div>
                </Card>
                <Card>
                  <p className="text-[12px] font-bold text-slate-700 mb-3">Escalation options in statin intolerance:</p>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-neuro-100 bg-neuro-50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-neuro-800">1. Ezetimibe 10 mg daily</p>
                        <div className="flex gap-1"><CorBadge cor="2a" /><LoeBadge loe="B-R" /></div>
                      </div>
                      <p className="text-[12px] text-slate-600">~20% LDL-C reduction. First non-statin option; oral, well-tolerated, no myopathy risk. IMPROVE-IT data supports MACE benefit.</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-slate-800">2. PCSK9 mAb (evolocumab or alirocumab)</p>
                        <div className="flex gap-1"><CorBadge cor="I" /><LoeBadge loe="A" /></div>
                      </div>
                      <p className="text-[12px] text-slate-600">~55% LDL-C reduction. Preferred when large LDL-C lowering is needed and statin is not tolerated. Does not cause myopathy.</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <div data-claim="dyslipidemia-2026-bempedoic-vhr" className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-slate-800">3. Bempedoic acid 180 mg daily</p>
                        <div className="flex gap-1"><CorBadge cor="2a" /><LoeBadge loe="B-R" /></div>
                      </div>
                      <p className="text-[12px] text-slate-600">~20% LDL-C reduction. Does not cause myopathy (activated in liver, not skeletal muscle). CLEAR Outcomes (NEJM 2023): ARR 1.6% for MACE in statin-intolerant patients, NNT ~63 over 3 years.</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div data-claim="dyslipidemia-2026-inclisiran-vhr" className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-slate-700">4. Inclisiran (if PCSK9 mAb not tolerated)</p>
                        <div className="flex gap-1"><CorBadge cor="2a" /><LoeBadge loe="B-R" /></div>
                      </div>
                      <p className="text-[12px] text-slate-600">~50% LDL-C reduction. Twice-yearly subcutaneous injection. No completed cardiovascular outcomes trial as of 2026 (ORION-4 ongoing). Use only when PCSK9 mAb is not tolerated.</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Bempedoic acid note (for VHR patients not at target after ezetimibe + PCSK9) */}
            {rec.action === 'add-both' && isVhr && (
              <Card>
                <div data-claim="dyslipidemia-2026-bempedoic-vhr">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">If still not at target after ezetimibe + PCSK9 mAb</p>
                  <p className="text-[14px] font-semibold text-slate-800">Bempedoic acid 180 mg (COR 2a, LOE B-R)</p>
                  <p className="text-[12px] text-slate-600 mt-1">May be added after ezetimibe ± PCSK9 mAb per §4.2.6 Rec #6 ("with or without ezetimibe and/or PCSK9 mAb"). Provides an additional ~20% LDL-C reduction. Does not cause myopathy.</p>
                </div>
              </Card>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-neuro-600 text-white font-semibold py-4 text-[15px] hover:bg-neuro-700 active:scale-[0.98] transition-all min-h-[56px]"
            >
              View monitoring plan →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ISCHAEMIC ARM — Step 3: Plan                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        {strokeType === 'ischemic' && step === 3 && (
          <div className="space-y-4">

            {/* Monitoring */}
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Monitoring plan</p>
              <div className="space-y-3">
                {[
                  { icon: <Check size={14} className="text-emerald-500" />, text: 'Recheck fasting LDL-C at 4–12 weeks after any change in therapy' },
                  { icon: <Check size={14} className="text-emerald-500" />, text: 'Assess medication adherence and tolerability at each follow-up' },
                  { icon: <Check size={14} className="text-emerald-500" />, text: 'CK level if myalgia symptoms develop (do not check routinely)' },
                  { icon: <Check size={14} className="text-emerald-500" />, text: 'AST/ALT if hepatic symptoms; routine liver monitoring not required for statins' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5">{item.icon}</span>
                    <p className="text-[13px] text-slate-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Lp(a) flag */}
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Lp(a): check once</p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                Measure Lp(a) at least once for ASCVD risk assessment (2026 ACC/AHA §3.4, COR 1, LOE B-NR). Lp(a) ≥70 mg/dL is a high-risk condition that may support VHR reclassification. Statins and ezetimibe do not meaningfully lower Lp(a). PCSK9 mAbs provide modest Lp(a) reduction (~20%) and are indicated at this risk level.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setLpaElevated(true)}
                  className={`rounded-lg border px-3 py-2 text-[12px] font-medium min-h-[44px] transition-all ${lpaElevated === true ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:border-amber-200'}`}
                >
                  Lp(a) ≥70 mg/dL
                </button>
                <button
                  onClick={() => setLpaElevated(false)}
                  className={`rounded-lg border px-3 py-2 text-[12px] font-medium min-h-[44px] transition-all ${lpaElevated === false ? 'border-neuro-400 bg-neuro-50 text-neuro-700' : 'border-slate-200 text-slate-600 hover:border-neuro-200'}`}
                >
                  Lp(a) &lt;70 mg/dL / not checked
                </button>
              </div>
              {lpaElevated && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-[12px] font-semibold text-amber-800">Lp(a) ≥70 mg/dL: PCSK9 mAb preferred</p>
                  <p className="text-[12px] text-amber-700 mt-1">Lp(a) is an independent ASCVD risk factor. Statins and ezetimibe do not lower it. PCSK9 mAbs reduce Lp(a) by ~20% and are the preferred add-on at this level. Reclassify as VHR if the patient does not already meet criteria. RNA-targeting agents (olpasiran, pelacarsen) are investigational; do not use outside a trial.</p>
                </div>
              )}
            </Card>

            {/* SPARCL pearl */}
            <PathwayLearningPearl
              title="SPARCL: Secondary stroke prevention"
              content="Atorvastatin 80 mg reduced recurrent stroke by 16% relative (NNT 53 over 4.9 years) but increased haemorrhagic stroke risk (HR 1.66, 95% CI 1.08–2.55). In ischaemic stroke patients, the net benefit is strongly positive. In patients with prior haemorrhagic stroke, statin use requires an explicit risk-benefit discussion. See the ICH arm of this pathway."
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ICH ARM — step 10 (separate from ischaemic rail)                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}

        {strokeType === 'hemorrhagic' && step === 10 && (
          <div className="space-y-4">

            {/* ICH header */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-bold text-red-700 uppercase tracking-widest">Intracerebral haemorrhage: different clinical context</p>
                  <p className="text-[13px] text-slate-700 mt-1">The ischaemic stroke escalation sequence does not apply here. Statin risk-benefit is uncertain after ICH. Management is individual to each patient.</p>
                </div>
              </div>
            </div>

            {/* ICH location */}
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">ICH aetiology / location</p>
              <p className="text-[14px] text-slate-700 mb-3">Haemorrhage location informs recurrence risk and guides the statin decision.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'lobar' as const, label: 'Lobar / cortical', sub: 'Probable CAA · Higher recurrence risk · More caution with statins' },
                  { id: 'deep' as const, label: 'Deep / hypertensive', sub: 'Basal ganglia, thalamus, pons · Lower recurrence · BP control is key' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setIchLocation(opt.id)}
                    className={`rounded-xl border p-3.5 text-left transition-all min-h-[80px] ${
                      ichLocation === opt.id
                        ? 'border-red-400 bg-red-50'
                        : 'border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/30'
                    }`}
                  >
                    <p className={`text-[13px] font-semibold ${ichLocation === opt.id ? 'text-red-700' : 'text-slate-800'}`}>{opt.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Guideline statement */}
            <Card>
              <div data-claim="dyslipidemia-2026-ich-statin-uncertain">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">2022 AHA/ASA ICH Guideline</p>
                <p className="text-[14px] font-semibold text-slate-900 mb-2">Statin risk–benefit is uncertain after ICH</p>
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  The 2022 AHA/ASA guideline states: the risks and benefits of statin therapy after spontaneous ICH "are uncertain." This is a deliberate COR 2b recommendation. It does not mandate continuation or discontinuation.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <CorBadge cor="2b" /><LoeBadge loe="B-NR" />
                  <span className="text-[11px] text-slate-400">Greenberg et al., Stroke 2022</span>
                </div>
                <EvidenceToggle
                  id="ev-ich-statin"
                  label="Evidence basis"
                  open={!!evidenceOpen['ev-ich-statin']}
                  onToggle={() => toggleEvidence('ev-ich-statin')}
                >
                  <p><strong className="text-slate-800">Meta-analysis (Teoh 2019, 17 RCTs, n=11,576):</strong> statins in stroke survivors increased ICH risk (RR 1.42, 95% CI 1.07–1.87) while reducing ischaemic stroke (RR 0.85). Trial sequential analysis indicated the ICH signal was conclusive in this population.</p>
                  <p className="mt-2"><strong className="text-slate-800">SPARCL post-hoc:</strong> patients with prior haemorrhagic stroke had a &gt;5-fold increased risk of ICH recurrence on atorvastatin 80 mg vs placebo (7/45 vs 2/48). The overall ischaemic stroke population had a favourable net benefit; the haemorrhagic subgroup did not.</p>
                  <p className="mt-2"><strong className="text-slate-800">PCSK9 inhibitor data:</strong> no increased haemorrhagic stroke risk in FOURIER (evolocumab, n=27,564) or ODYSSEY OUTCOMES (alirocumab, n=18,924), including at LDL-C &lt;25 mg/dL. Neither trial enrolled ICH survivors; the data cannot be directly applied to this population.</p>
                </EvidenceToggle>
              </div>
            </Card>

            {/* ICH decision framework */}
            {ichLocation && (
              <Card>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  {ichLocation === 'lobar' ? 'Lobar / probable CAA' : 'Deep / hypertensive'}: decision framework
                </p>
                {ichLocation === 'lobar' ? (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                      <p className="text-[13px] font-semibold text-red-800">Higher caution: shared decision required</p>
                      <p className="text-[12px] text-red-700 mt-1 leading-relaxed">Lobar haemorrhage suggests probable CAA. ICH recurrence risk is higher than deep ICH. The SPARCL signal is most relevant in this group. If a cardiovascular indication exists: discuss risk-benefit explicitly. Document the conversation. Consider avoiding high-intensity statin; if lipid-lowering is needed, PCSK9 mAb may be a safer option (no observed ICH signal) though direct post-ICH evidence is lacking.</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[12px] text-slate-700"><strong>If lipid-lowering is indicated:</strong> ezetimibe or a PCSK9 mAb avoid the statin-specific mechanism. Do not present PCSK9 inhibitors as proven safe after ICH. Direct evidence in ICH survivors is absent.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                      <p className="text-[13px] font-semibold text-amber-800">Lower recurrence risk: individualised decision</p>
                      <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">Deep / hypertensive ICH carries lower recurrence risk than lobar. If the patient has a strong ASCVD indication (prior ACS, high CV burden), the benefit of lipid-lowering may outweigh the haemorrhagic risk. This requires an explicit risk-benefit discussion with the patient.</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[12px] text-slate-700"><strong>Blood pressure control</strong> is the primary intervention to prevent recurrent deep ICH. Target SBP &lt;130 mmHg. Maximise antihypertensive therapy before or alongside any lipid-lowering decision.</p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Acknowledgement */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[13px] font-semibold text-amber-800 mb-1">Mandatory review acknowledgement</p>
              <p className="text-[12px] text-amber-700 leading-relaxed">
                This patient had a haemorrhagic stroke. Lipid management decisions require an explicit risk-benefit discussion documented in the chart. The 2022 AHA/ASA guideline does not mandate a specific course of action. Clinician judgement is required.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PostStrokeLipidManagement;
