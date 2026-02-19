
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check, RotateCcw, Copy, Info, AlertCircle, ChevronRight, Brain, XCircle, Activity, Star, ChevronDown } from 'lucide-react';
import { ELAN_CONTENT } from '../data/toolContent';
import { autoLinkReactNodes } from '../internalLinks/autoLink';
import { useTrialModal } from '../contexts/TrialModalContext';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { useNavigationSource } from '../hooks/useNavigationSource';

// ... (KEEP ALL TYPES, INTERFACES, STEPS, LOGIC, COMPONENTS SAME UNTIL RENDER) ...
type Tri = "yes" | "no" | "unknown";
type StrokeSize = "minor" | "moderate" | "major" | "unknown";

type Inputs = {
  isIschemicAfib: Tri;
  hasBleed: Tri;
  hasMechanicalValve: Tri;
  size: StrokeSize;
  onset: string;
};

type Result = {
  eligible: boolean;
  ineligibleReason?: string;
  size: StrokeSize;
  earlyText: string;
  earlyDates: string;
  lateText: string;
  lateDates: string;
  reasons: string[];
};

const STEPS = [
  { id: 1, title: "Eligibility" },
  { id: 2, title: "Classification" },
  { id: 3, title: "Timing" },
  { id: 4, title: "Protocol" }
];

const STEP_FIELDS: Record<number, string[]> = {
  1: ['isIschemicAfib', 'hasBleed', 'hasMechanicalValve'],
  2: ['size'],
  3: ['onset']
};

const calculateElanProtocol = (inputs: Inputs): Result => {
  if (inputs.isIschemicAfib === 'no') return { eligible: false, ineligibleReason: "Protocol applies to Ischemic Stroke with Atrial Fibrillation.", size: 'unknown', earlyText: '', earlyDates: '', lateText: '', lateDates: '', reasons: [] };
  if (inputs.hasBleed === 'yes') return { eligible: false, ineligibleReason: "Significant hemorrhagic transformation or confluent parenchymal hematoma is an exclusion. Advise local protocol.", size: 'unknown', earlyText: '', earlyDates: '', lateText: '', lateDates: '', reasons: [] };
  if (inputs.hasMechanicalValve === 'yes') return { eligible: false, ineligibleReason: "Mechanical heart valve requires warfarin therapy with specific INR targets (not DOAC). Consult cardiology for valve-specific anticoagulation protocol.", size: 'unknown', earlyText: '', earlyDates: '', lateText: '', lateDates: '', reasons: [] };
  if (!inputs.onset) return { eligible: true, size: inputs.size, earlyText: '-', earlyDates: '-', lateText: '-', lateDates: '-', reasons: [] };

  const [year, month, day] = inputs.onset.split('-').map(Number);
  const onsetDate = new Date(year, month - 1, day);
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const addDays = (d: Date, days: number) => { const newDate = new Date(d); newDate.setDate(d.getDate() + days); return newDate; };

  const reasons: string[] = [];
  let earlyText = "";
  let earlyDates = "";
  let lateText = "";
  let lateDates = "";

  if (inputs.size === 'minor') {
    reasons.push("Minor Stroke (≤ 1.5 cm)");
    earlyText = "Within 48 hours";
    earlyDates = `${formatDate(onsetDate)} – ${formatDate(addDays(onsetDate, 2))}`;
    lateText = "Day 3 or 4";
    lateDates = `${formatDate(addDays(onsetDate, 3))} – ${formatDate(addDays(onsetDate, 4))}`;
  } else if (inputs.size === 'moderate') {
    reasons.push("Moderate Stroke (Cortical superficial branch)");
    earlyText = "Within 48 hours";
    earlyDates = `${formatDate(onsetDate)} – ${formatDate(addDays(onsetDate, 2))}`;
    lateText = "Day 6 or 7";
    lateDates = `${formatDate(addDays(onsetDate, 6))} – ${formatDate(addDays(onsetDate, 7))}`;
  } else if (inputs.size === 'major') {
    reasons.push("Major Stroke (Large territory or Brainstem > 1.5cm)");
    earlyText = "Day 6 or 7";
    earlyDates = `${formatDate(addDays(onsetDate, 6))} – ${formatDate(addDays(onsetDate, 7))}`;
    lateText = "Day 12, 13, or 14";
    lateDates = `${formatDate(addDays(onsetDate, 12))} – ${formatDate(addDays(onsetDate, 14))}`;
  }

  return { eligible: true, size: inputs.size, earlyText, earlyDates, lateText, lateDates, reasons };
};

interface SelectionCardProps {
    title: string;
    description?: string;
    selected: boolean;
    onClick: () => void;
    variant?: 'default' | 'danger';
}
const SelectionCard = React.memo(({ title, description, selected, onClick, variant = 'default' }: SelectionCardProps) => (
    <button onClick={onClick} className={`w-full text-left p-5 rounded-2xl border-2 transition-colors duration-150 relative overflow-hidden active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${selected ? variant === 'danger' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-neuro-50 border-neuro-500 text-teal-500' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
        <div className="flex items-start justify-between relative z-10">
            <div className="pr-4">
                <span className={`block text-lg font-bold ${selected ? 'text-current' : 'text-slate-900'}`}>{title}</span>
                {description && <span className={`text-sm mt-1.5 block leading-relaxed ${selected ? 'opacity-90' : 'text-slate-500'}`}>{description}</span>}
            </div>
            {selected && <div className={`p-1.5 rounded-full ${variant === 'danger' ? 'bg-red-500 text-white' : 'bg-neuro-500 text-white'}`}><Check size={16} /></div>}
        </div>
    </button>
));

const ElanPathway: React.FC = () => {
  // ... (HOOKS AND HANDLERS SAME) ...
  const [step, setStep] = useState(1);
  const { getBackPath, getBackLabel } = useNavigationSource();
  const [inputs, setInputs] = useState<Inputs>({ isIschemicAfib: 'unknown', hasBleed: 'unknown', hasMechanicalValve: 'unknown', size: 'unknown', onset: '' });
  const [result, setResult] = useState<Result | null>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Favorites
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const isFav = isFavorite('elan-pathway');

  const handleFavToggle = () => {
      const newVal = toggleFavorite('elan-pathway');
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
  };

  // Analytics
  const { trackResult } = useCalculatorAnalytics('elan_protocol');

  // Trial Modal
  const { openTrial } = useTrialModal();

  useEffect(() => { 
    const newResult = calculateElanProtocol(inputs);
    setResult(newResult);
    if (newResult && newResult.eligible && inputs.size !== 'unknown') {
      trackResult(newResult.size);
    }
  }, [inputs, trackResult]);
  useEffect(() => { const mainElement = document.querySelector('main'); if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'instant' }); else window.scrollTo(0,0); }, [step]);

  const updateInput = useCallback((field: keyof Inputs, value: string | boolean | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    const currentFields = STEP_FIELDS[step];
    if (currentFields) {
        const idx = currentFields.indexOf(field);
        if (idx >= 0 && idx < currentFields.length - 1) setTimeout(() => fieldRefs.current[currentFields[idx + 1]]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        else if (idx === currentFields.length - 1) setTimeout(() => document.getElementById('elan-action-bar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
    }
  }, [step]);

  const handleNext = () => { if (step === 1 && (inputs.isIschemicAfib === 'no' || inputs.hasBleed === 'yes' || inputs.hasMechanicalValve === 'yes')) return; if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };
  const handleReset = () => { setInputs({ isIschemicAfib: 'unknown', hasBleed: 'unknown', hasMechanicalValve: 'unknown', size: 'unknown', onset: '' }); setStep(1); };
  const copySummary = () => { if (!result) return; let definition = ""; if (result.size === 'minor') definition = "infarct ≤ 1.5 cm"; else if (result.size === 'moderate') definition = "cortical superficial branch of MCA/ACA/PCA, deep branch MCA, or internal border-zone"; else if (result.size === 'major') definition = "large territory, ≥2 MCA cortical branches, or brainstem/cerebellum > 1.5 cm"; const summary = `Post-Stroke Anticoagulation Protocol Applied:\nImaging-based stroke size classified as ${result.size.charAt(0).toUpperCase() + result.size.slice(1)} per stroke size definitions (${definition}).\n\nAnticoagulation timing determined using evidence-based protocol:\nEarly DOAC initiation window = ${result.earlyText} (${result.earlyDates}).\n\nDecision based on imaging-defined infarct size and absence of contraindicating hemorrhage.\n\nReference:\nBased on ELAN trial (Paciaroni et al., NEJM 2023), OPTIMAS trial (2024), TIMING trial (2024), and 2026 AHA/ASA Guideline for the Early Management of Patients with Acute Ischemic Stroke (COR 2a, LOE A).`.trim(); navigator.clipboard.writeText(summary); setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 2500); };
  const isStep1Invalid = inputs.isIschemicAfib === 'no' || inputs.hasBleed === 'yes' || inputs.hasMechanicalValve === 'yes';

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-20">
      {/* Header same */}
      <div className="mb-6 flex items-start justify-between">
        <div>
            <Link to={getBackPath()} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-500 mb-6 group"><div className="bg-white p-1.5 rounded-md border border-slate-200 mr-2 shadow-sm group-hover:shadow-md transition-colors duration-150"><ArrowLeft size={16} /></div> {getBackLabel()}</Link>
            <div className="flex items-center space-x-3 mb-2"><div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Brain size={24} /></div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Post-Stroke Anticoagulation Timing</h1></div>
            <p className="text-slate-500 font-medium">Evidence-based timing of anticoagulation after acute ischemic stroke with atrial fibrillation.</p>
        </div>
        <button 
            onClick={handleFavToggle}
            className="p-3 rounded-full hover:bg-slate-100 transition-colors"
        >
            <Star size={24} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
        </button>
      </div>
      
      {/* Progress same... */}
      <div className="flex items-center space-x-2 mb-8 px-1">{STEPS.map((s, idx) => (<div key={s.id} className="flex-1 flex flex-col items-center relative"><div className={`w-full h-1 absolute top-1/2 -translate-y-1/2 -z-10 ${idx === 0 ? 'hidden' : ''} ${step >= s.id ? 'bg-purple-500' : 'bg-slate-200'}`}></div><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors z-10 ${step === s.id ? 'bg-white border-purple-500 text-purple-600' : step > s.id ? 'bg-purple-500 border-purple-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>{step > s.id ? <Check size={14} /> : s.id}</div><span className={`text-xs mt-2 font-bold uppercase tracking-wider ${step === s.id ? 'text-purple-600' : 'text-slate-400'}`}>{s.title}</span></div>))}</div>

      <div ref={stepContainerRef} className="space-y-6 min-h-[300px]">
        {/* Step 1-3 logic identical... */}
        {step === 1 && (<div className="space-y-6 animate-in slide-in-from-right-4 duration-300"><div ref={el => { fieldRefs.current['isIschemicAfib'] = el; }}><h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Inclusion</h3><div className="grid grid-cols-1 gap-3"><SelectionCard title="Ischemic Stroke with Atrial Fibrillation?" description="Confirm imaging-proven ischemic stroke and history or new diagnosis of AF." selected={inputs.isIschemicAfib === 'yes'} onClick={() => updateInput('isIschemicAfib', 'yes')} /><SelectionCard title="No" selected={inputs.isIschemicAfib === 'no'} onClick={() => updateInput('isIschemicAfib', 'no')} /></div></div>{inputs.isIschemicAfib === 'yes' && (<div ref={el => { fieldRefs.current['hasBleed'] = el; }} className="animate-in fade-in slide-in-from-top-2"><h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide mt-6">Exclusion</h3><div className="grid grid-cols-1 gap-3"><SelectionCard title="Any significant hemorrhage?" description="Confluent parenchymal hematoma (PH type) or significant bleeding risk." selected={inputs.hasBleed === 'yes'} onClick={() => updateInput('hasBleed', 'yes')} variant="danger" /><SelectionCard title="No significant hemorrhage" description="Trace or petechial hemorrhagic transformation (HI1/HI2) is permitted." selected={inputs.hasBleed === 'no'} onClick={() => updateInput('hasBleed', 'no')} /></div></div>)}{inputs.hasBleed === 'no' && (<div ref={el => { fieldRefs.current['hasMechanicalValve'] = el; }} className="animate-in fade-in slide-in-from-top-2"><h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide mt-6">Additional Exclusion</h3><div className="grid grid-cols-1 gap-3"><SelectionCard title="Mechanical Heart Valve?" description="Mechanical valves require warfarin (not DOAC) with specific INR targets." selected={inputs.hasMechanicalValve === 'yes'} onClick={() => updateInput('hasMechanicalValve', 'yes')} variant="danger" /><SelectionCard title="No Mechanical Valve" description="Bioprosthetic valve or no valve replacement." selected={inputs.hasMechanicalValve === 'no'} onClick={() => updateInput('hasMechanicalValve', 'no')} /></div></div>)}{isStep1Invalid && (<div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3 text-red-800 animate-in zoom-in-95"><XCircle className="flex-shrink-0 mt-0.5" size={20} /><div><p className="font-bold">Not eligible for Post-Stroke Anticoagulation Protocol</p><p className="text-sm mt-1">{result?.ineligibleReason}</p></div></div>)}</div>)}
        {step === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            {/* Imaging definitions — scannable mini-cards */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><Info size={13} className="mr-1.5" /> Imaging-Based Size Definitions</h3>
              <div className="space-y-2">
                <div className="bg-white border-l-4 border-teal-400 rounded-r-xl px-4 py-3 shadow-sm">
                  <span className="text-xs font-black text-teal-600 uppercase tracking-wider">Minor</span>
                  <p className="text-sm text-slate-700 mt-0.5">Single infarct ≤ 1.5 cm (any territory)</p>
                </div>
                <div className="bg-white border-l-4 border-blue-400 rounded-r-xl px-4 py-3 shadow-sm">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Moderate</span>
                  <p className="text-sm text-slate-700 mt-0.5">Cortical branch of MCA, ACA, or PCA; deep MCA branch; or internal border-zone</p>
                </div>
                <div className="bg-white border-l-4 border-purple-400 rounded-r-xl px-4 py-3 shadow-sm">
                  <span className="text-xs font-black text-purple-600 uppercase tracking-wider">Major</span>
                  <p className="text-sm text-slate-700 mt-0.5">Large territory, ≥2 MCA cortical branches, or brainstem/cerebellum &gt; 1.5 cm</p>
                </div>
              </div>
            </div>
            {/* Selection */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select stroke size</h3>
              <div className="grid gap-3" ref={el => { fieldRefs.current['size'] = el; }}>
                <SelectionCard title="Minor" description="≤ 1.5 cm" selected={inputs.size === 'minor'} onClick={() => updateInput('size', 'minor')} />
                <SelectionCard title="Moderate" description="Cortical branch, deep MCA, or border-zone" selected={inputs.size === 'moderate'} onClick={() => updateInput('size', 'moderate')} />
                <SelectionCard title="Major" description="Large territory, ≥2 MCA branches, or brainstem/cerebellum > 1.5 cm" selected={inputs.size === 'major'} onClick={() => updateInput('size', 'major')} />
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Stroke Onset</h3>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" ref={el => { fieldRefs.current['onset'] = el; }}>
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-base font-bold text-slate-700">Date of Onset</label>
                        {inputs.onset && (
                            <button onClick={() => updateInput('onset', '')} className="text-xs text-slate-400 hover:text-red-500 font-bold flex items-center transition-colors">
                                <RotateCcw size={12} className="mr-1" /> Clear
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            max={new Date().toLocaleDateString('en-CA')}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors duration-150 font-medium text-lg text-slate-900 placeholder-slate-400 appearance-none min-h-[60px]"
                            value={inputs.onset}
                            onChange={(e) => updateInput('onset', e.target.value)}
                            onClick={(e) => {
                                try {
                                    if ('showPicker' in e.currentTarget) {
                                        (e.currentTarget as any).showPicker();
                                    }
                                } catch (err) {
                                    // fallback for browsers without showPicker
                                }
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-3 font-medium">The timing of anticoagulation is calculated relative to this date (Day 0).</p>
                </div>
            </div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && result && result.eligible && (
             <div className="space-y-4 animate-in zoom-in-95 duration-300">

                {/* Single consolidated card */}
                <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl">
                    <div className="relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500 rounded-full blur-3xl opacity-20 -mr-12 -mt-12 pointer-events-none"></div>

                        {/* Top bar: stroke type + guideline level */}
                        <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
                            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Activity size={11} />
                                <span>{result.size} stroke</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-black text-purple-300 uppercase tracking-wider">COR 2a · LOE A</div>
                                <div className="text-[10px] text-white/40 font-medium mt-0.5">AHA/ASA 2026</div>
                            </div>
                        </div>

                        {/* Timing: two columns, px-4 for mobile breathing room */}
                        <div className="relative z-10 grid grid-cols-2 divide-x divide-white/10">
                            {/* Earlier strategy — neutral label, no green "recommended" */}
                            <div className="px-4 py-5">
                                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Earlier Strategy</div>
                                <div className="text-2xl font-black leading-snug">{result.earlyText}</div>
                                <div className="text-slate-400 text-xs font-medium mt-1">{result.earlyDates}</div>
                                <div className="text-[10px] text-slate-500 mt-2 leading-relaxed">Noninferior to delayed start (COR 2a)</div>
                            </div>
                            {/* Later strategy */}
                            <div className="px-4 py-5">
                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Later Strategy</div>
                                <div className="text-xl font-bold text-white/70 leading-snug">{result.lateText}</div>
                                <div className="text-slate-600 text-xs font-medium mt-1">{result.lateDates}</div>
                                <div className="text-[10px] text-slate-600 mt-2 leading-relaxed">Also acceptable per trial data</div>
                            </div>
                        </div>

                        {/* Imaging warning */}
                        <div className="relative z-10 mx-4 mb-4 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-start space-x-2.5">
                            <AlertTriangle size={13} className="flex-shrink-0 text-amber-400 mt-0.5" />
                            <p className="text-xs text-amber-200 leading-relaxed"><span className="font-bold">Repeat imaging required</span> — CT or MRI before starting to exclude hemorrhagic transformation.</p>
                        </div>

                        {/* DOAC row: 2×2 on mobile, 4-col on md+ */}
                        <div className="relative z-10 border-t border-white/10 px-5 py-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Use a DOAC</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {['Apixaban', 'Rivaroxaban', 'Dabigatran', 'Edoxaban'].map(d => (
                                    <div key={d} className="bg-white/5 rounded-xl px-3 py-2.5 text-center">
                                        <div className="text-xs font-bold">{d}</div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-600 mt-2.5 leading-relaxed">Based on renal function, interactions &amp; preference. Warfarin required for mechanical valves.</p>
                        </div>

                        {/* Learn more accordion */}
                        <div className="relative z-10 border-t border-white/10">
                            <button
                                onClick={() => setShowEvidence(prev => !prev)}
                                className="w-full flex items-center justify-between px-5 py-3.5 text-left touch-manipulation active:bg-white/5 transition-colors"
                            >
                                <span className="text-xs font-bold text-slate-400">How this was determined</span>
                                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${showEvidence ? 'rotate-180' : ''}`} />
                            </button>
                            {showEvidence && (
                                <div className="bg-white/5 px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                    {/* Trial summaries */}
                                    {[
                                        { label: 'ELAN Trial', year: 'NEJM 2023', detail: 'Early DOAC (per stroke-size windows) vs late: numerical reduction in events, not statistically significant. Established imaging-based timing framework.' },
                                        { label: 'OPTIMAS Trial', year: '2024', detail: 'Early DOAC (≤4 days) noninferior to delayed DOAC (7–14 days) in 3,648 patients with AIS + AF.' },
                                        { label: 'TIMING Trial', year: '2024', detail: 'Early (≤4 days) vs delayed (5–10 days): 6.9% vs 8.7% primary outcome rate. Noninferior.' },
                                    ].map(t => (
                                        <div key={t.label} className="border-l-2 border-purple-500/50 pl-3">
                                            <div className="flex items-baseline space-x-2">
                                                <span className="text-xs font-bold text-white/80">{autoLinkReactNodes(t.label, openTrial)}</span>
                                                <span className="text-[10px] text-slate-500">{t.year}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t.detail}</p>
                                        </div>
                                    ))}
                                    {/* Guideline statement */}
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2.5 mt-1">
                                        <p className="text-[10px] font-black text-purple-300 uppercase tracking-wider mb-1">AHA/ASA 2026 · COR 2a · LOE A</p>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">Early oral anticoagulation in carefully selected AF patients is low-risk and reasonable compared to delayed initiation. Efficacy for preventing early recurrent stroke is not yet established.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Disclaimer + Start Over (mobile) in one row */}
                <div className="flex flex-col items-center space-y-2 pt-1">
                    <p className="text-xs text-slate-400 text-center px-2 leading-relaxed">
                        {autoLinkReactNodes("Decision support only · ELAN (NEJM 2023) · OPTIMAS (2024) · TIMING (2024) · AHA/ASA 2026", openTrial)}
                    </p>
                    <button onClick={handleReset} className="md:hidden flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold py-2 px-4 rounded-lg transition-colors touch-manipulation min-h-[44px]">
                        <RotateCcw size={12} className="mr-1.5" /> Start Over
                    </button>
                </div>
             </div>
        )}
      </div>

      <div id="elan-action-bar" className="mt-8 pt-4 md:border-t border-slate-100 scroll-mt-4 fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
         <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
             <button onClick={handleBack} disabled={step === 1} className={`px-6 py-3 border border-slate-200 rounded-xl font-bold transition-colors duration-150 min-h-[44px] touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${step === 1 ? 'opacity-0 pointer-events-none cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>Back</button>
             {step === 4 && (<button onClick={handleReset} className="hidden md:flex items-center text-slate-500 hover:text-neuro-500 font-bold px-4 py-2 rounded-lg transition-colors duration-150 min-h-[44px] touch-manipulation active:scale-95 transform-gpu focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"><RotateCcw size={16} className="mr-2" /> Start Over</button>)}
             {step < 4 ? (<button onClick={handleNext} disabled={step === 1 && isStep1Invalid} className={`flex-1 md:flex-none px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors duration-150 flex items-center justify-center active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${(step === 1 && isStep1Invalid) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>Next <ChevronRight size={16} className="ml-2" /></button>) : (<button onClick={copySummary} className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-colors duration-150 flex items-center justify-center active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"><Copy size={16} className="mr-2" /> Copy to EMR</button>)}
         </div>
      </div>
      


      {showFavToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {isFav ? 'Saved to Favorites' : 'Removed from Favorites'}
        </div>
      )}
      {showCopyToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60] flex items-center space-x-2">
          <Check size={12} />
          <span>Summary copied to clipboard</span>
        </div>
      )}
    </div>
  );
};

export default ElanPathway;
