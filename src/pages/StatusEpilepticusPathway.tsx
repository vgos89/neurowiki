
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, RotateCcw, Copy, Activity, AlertTriangle, ShieldCheck, ClipboardCheck, Syringe, BedDouble, ChevronRight, Calculator, Info, Thermometer, Zap, XCircle, Brain, Star } from 'lucide-react';
import { SE_CONTENT } from '../data/toolContent';
import { autoLinkReactNodes } from '../internalLinks/autoLink';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';

// --- Types & Logic ---
type Agent = "levetiracetam" | "fosphenytoin" | "valproate" | "lacosamide" | "phenobarbital";
// PatientData.convulsive removed per CLIN-2 / Architect NCSE-1 — this pathway covers
// convulsive SE only; non-convulsive SE is routed out to the cEEG-guided NCSE workup.
interface PatientData { weight: number; ivAccess: boolean; glucoseChecked: boolean; }
// Cardiac flag split (CLIN-2): cardiacAvBlock → AVOID phenytoin/fosphenytoin/lacosamide;
// cardiacElderly → slower infusion only (no absolute contraindication).
interface Comorbidities { hypotension: boolean; respiratory: boolean; cardiacAvBlock: boolean; cardiacElderly: boolean; liver: boolean; pancreatitis: boolean; pregnancy: boolean; renal: boolean; carbapenem: boolean; }
interface Step3Checklist { benzoAdequate: boolean; stage2Adequate: boolean; glucoseTreated: boolean; eegConsidered: boolean; }
interface RenalState { crcl: string; dialysis: 'no' | 'yes' | 'unknown'; levForm: 'ir' | 'keppra_xr' | 'elepsia_xr'; lcmForm: 'vimpat' | 'motpoly_xr'; }

// RAMPART fixed-dose IM midazolam (Silbergleit 2012, PMID 22335736).
// "Intramuscular midazolam in a fixed dose of 10 mg (>40 kg) or 5 mg (13–40 kg)
// was at least as effective as intravenous lorazepam" — RAMPART.
const calculateBzdFixedDose = (agent: string, weight: number, route: 'IV' | 'IM' = 'IV'): string => {
  if (weight <= 0) return "Enter weight";
  if (agent === "midazolam") {
    if (route === 'IM') {
      if (weight < 13) return "Consult pediatrics (RAMPART fixed-dose IM not validated <13 kg)";
      if (weight >= 13 && weight <= 40) return "5 mg IM fixed (RAMPART, 13–40 kg)";
      return "10 mg IM fixed (RAMPART, >40 kg)";
    }
    // IV — weight-based per AES 2016
    return `${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IV (0.2 mg/kg, max 10 mg)`;
  }
  return "-";
};

const calculateDose = (agent: string, weight: number): string => {
  if (weight <= 0) return "Enter weight";
  switch(agent) {
    case "lorazepam": return `${Math.min(4, Math.round(0.1 * weight * 10) / 10)} mg IV (0.1 mg/kg, max 4mg)`;
    // Default midazolam display covers both routes — RAMPART fixed IM scheme via calculateBzdFixedDose
    case "midazolam": return `${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IV (0.2 mg/kg, max 10mg) — or IM fixed 10 mg (>40 kg) / 5 mg (13–40 kg) per RAMPART`;
    case "diazepam": return `${Math.min(10, Math.round(0.15 * weight * 10) / 10)} mg IV (0.15 mg/kg, max 10mg)`;
    case "levetiracetam": return `${Math.min(4500, Math.round(60 * weight))} mg IV (60 mg/kg, max 4500mg)`;
    case "fosphenytoin": return `${Math.min(1500, Math.round(20 * weight))} mg PE IV (20 mg PE/kg, max 1500mg PE)`;
    case "valproate": return `${Math.min(3000, Math.round(40 * weight))} mg IV (40 mg/kg, max 3000mg)`;
    // Lacosamide cap = 400 mg per FDA label (Vossler 2025). Use as Stage 3 add-on only, NOT Stage 2.
    case "lacosamide": return `${Math.min(400, Math.round(8 * weight))} mg IV (8 mg/kg, max 400mg per FDA label)`;
    // Phenobarbital 15 mg/kg per Vossler 2025 (was 20 mg/kg).
    case "phenobarbital": return `${Math.round(15 * weight)} mg IV (15 mg/kg, rate <60mg/min)`;
    case "midazolam_inf": return `Load: ${Math.round(0.2 * weight * 10)/10} mg (0.2 mg/kg)`;
    case "propofol_inf": return `Load: ${Math.round(1 * weight)} - ${Math.round(2 * weight)} mg (1-2 mg/kg)`;
    // Ketamine load 1–2.5 mg/kg per Vossler 2025 Table 5-3 (was 1.5–4.5 mg/kg).
    case "ketamine_inf": return `Load: ${Math.round(1 * weight)} - ${Math.round(2.5 * weight)} mg (1-2.5 mg/kg)`;
    case "pentobarb_inf": return `Load: ${Math.round(5 * weight)} - ${Math.round(15 * weight)} mg (5-15 mg/kg)`;
    default: return "-";
  }
};

const StatusEpilepticusPathway: React.FC = () => {
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'se-pathway',
      title: 'SE Pathway',
      subtitle: 'Stage 1–3 status epilepticus management',
      category: 'status-epilepticus',
      trail: '4 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeSection, setActiveSection] = useState<number>(0);
  const step = activeSection + 1;
  const { handleBack, getBackLabel } = useNavigationSource();
  const [patient, setPatient] = useState<PatientData>({ weight: 0, ivAccess: true, glucoseChecked: false });
  const [stage1Agent, setStage1Agent] = useState<"lorazepam" | "diazepam" | "midazolam" | null>(null);
  const [stage1FirstDoseGiven, setStage1FirstDoseGiven] = useState(false);
  const [stage1SecondDoseGiven, setStage1SecondDoseGiven] = useState(false);
  const [stage1Success, setStage1Success] = useState<boolean | null>(null); 
  const [comorbidities, setComorbidities] = useState<Comorbidities>({ hypotension: false, respiratory: false, cardiacAvBlock: false, cardiacElderly: false, liver: false, pancreatitis: false, pregnancy: false, renal: false, carbapenem: false });
  const [renalState, setRenalState] = useState<RenalState>({ crcl: '', dialysis: 'no', levForm: 'ir', lcmForm: 'vimpat' });
  const [stage2Agent, setStage2Agent] = useState<Agent | "auto">("auto");
  const [stage2Success, setStage2Success] = useState<boolean | null>(null);
  const [stage2ActualAgent, setStage2ActualAgent] = useState<Agent | null>(null);
  const [step3Checklist, setStep3Checklist] = useState<Step3Checklist>({ benzoAdequate: false, stage2Adequate: false, glucoseTreated: false, eegConsidered: false });
  const [stage3Agent, setStage3Agent] = useState<string | null>(null); 
  
  const topRef = useRef<HTMLDivElement>(null);
  const stage1DoseRef = useRef<HTMLDivElement>(null);
  const stage2DoseRef = useRef<HTMLDivElement>(null);
  const stage3DoseRef = useRef<HTMLDivElement>(null);

  // Analytics
  const { trackResult } = useCalculatorAnalytics('status_epilepticus');

  // Favorites
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const isFav = isFavorite('se-pathway');

  const handleFavToggle = () => {
      const newVal = toggleFavorite('se-pathway');
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
  };

  // Track when user reaches stage 3 (refractory management)
  useEffect(() => {
    if (step === 3 && stage3Agent) {
      trackResult(stage3Agent);
    }
  }, [step, stage3Agent, trackResult]);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (step > 1 && topRef.current) setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }, [step]);

  // ESETT (Kapur 2019, NEJM) showed levetiracetam, fosphenytoin, and valproate are equivalent
  // for benzodiazepine-refractory status epilepticus. This function returns ALL THREE Tier-1
  // agents with per-comorbidity status flags rather than a hierarchical pick. Lacosamide is
  // NOT a Stage 2 agent — it belongs as a Stage 3 add-on per AES 2016 / Vossler 2025.
  type AgentStatus = 'preferred' | 'caution' | 'avoid';
  interface AgentOption { agent: Agent; status: AgentStatus; note?: string; }
  const getEsettOptions = (): { options: AgentOption[]; defaultAgent: Agent; warnings: string[]; pearl: string } => {
    const warnings: string[] = [];
    const pearl = "ESETT (Kapur 2019, NEJM): levetiracetam, fosphenytoin, and valproate are equivalent for benzodiazepine-refractory status epilepticus.";
    const avoidValproate = comorbidities.liver || comorbidities.pancreatitis || comorbidities.pregnancy || comorbidities.carbapenem;
    const avoidPhenytoin = comorbidities.cardiacAvBlock; // 2°/3° AV block — AVOID, not caution
    const cautionPhenytoin = comorbidities.hypotension || comorbidities.cardiacElderly;
    const cautionLevetiracetam = comorbidities.renal;
    if (comorbidities.pregnancy) warnings.push("Pregnancy: Valproate avoided (teratogenic — neural tube defects, cognitive risk).");
    if (comorbidities.liver) warnings.push("Liver disease: Valproate avoided (hepatotoxicity, hyperammonemia).");
    if (comorbidities.pancreatitis) warnings.push("Pancreatitis history: Valproate avoided.");
    if (comorbidities.carbapenem) warnings.push("Carbapenem co-administration: Lowers valproate levels — avoid combination.");
    if (comorbidities.cardiacAvBlock) warnings.push("2°/3° AV block without pacemaker: AVOID phenytoin, fosphenytoin, lacosamide (Vossler 2025: lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker).");
    if (comorbidities.cardiacElderly) warnings.push("Elderly without conduction disease: Use slower fosphenytoin infusion rate (≤100 mg PE/min).");
    if (comorbidities.hypotension) warnings.push("Hypotension: Caution with phenytoin/fosphenytoin (slower infusion); avoid phenobarbital.");
    if (comorbidities.renal) warnings.push("Renal impairment: Levetiracetam maintenance dose reduction required.");

    const lev: AgentOption = { agent: "levetiracetam", status: cautionLevetiracetam ? 'caution' : 'preferred', note: cautionLevetiracetam ? "Adjust maintenance for CrCl" : undefined };
    const fos: AgentOption = { agent: "fosphenytoin", status: avoidPhenytoin ? 'avoid' : (cautionPhenytoin ? 'caution' : 'preferred'), note: avoidPhenytoin ? "AVOID: 2°/3° AV block" : (cautionPhenytoin ? "Slower infusion rate" : undefined) };
    const vpa: AgentOption = { agent: "valproate", status: avoidValproate ? 'avoid' : 'preferred', note: avoidValproate ? "AVOID: liver/pregnancy/pancreatitis/carbapenem" : undefined };
    const options: AgentOption[] = [lev, fos, vpa];

    // Default = first 'preferred' agent; if none preferred, first 'caution'; else lev as fallback.
    const preferred = options.find(o => o.status === 'preferred');
    const cautionFallback = options.find(o => o.status === 'caution');
    const defaultAgent: Agent = (preferred?.agent ?? cautionFallback?.agent ?? "levetiracetam");
    return { options, defaultAgent, warnings, pearl };
  };

  const esett = getEsettOptions();
  const stage2Recommendation = { agent: esett.defaultAgent, reason: "ESETT-equivalent (lev/fos/VPA)", warnings: esett.warnings };
  const finalStage2 = stage2Agent === "auto" ? stage2Recommendation.agent : stage2Agent;
  
  const handleReset = () => { 
      setActiveSection(0); 
      setPatient({ weight: 0, ivAccess: true, glucoseChecked: false });
      setStage1Agent(null); 
      setStage1FirstDoseGiven(false); 
      setStage1SecondDoseGiven(false); 
      setStage1Success(null); 
      setComorbidities({ hypotension: false, respiratory: false, cardiacAvBlock: false, cardiacElderly: false, liver: false, pancreatitis: false, pregnancy: false, renal: false, carbapenem: false });
      setStage2Agent("auto"); 
      setStage2Success(null); 
      setStage2ActualAgent(null); 
      setStep3Checklist({ benzoAdequate: false, stage2Adequate: false, glucoseTreated: false, eegConsidered: false }); 
      setStage3Agent(null);
  };

  const generateEMRText = () => { 
    const parts = []; 
    if (stage1Agent) { 
      let s1Text = `Stage 1: ${stage1Agent} ${calculateDose(stage1Agent, patient.weight)}`; 
      if (stage1SecondDoseGiven) s1Text += " x2 doses"; 
      if (stage1Success === true) s1Text += " (Responsive)"; 
      else if (stage1Success === false) s1Text += " (Refractory)"; 
      parts.push(s1Text); 
    } 
    if (stage1Success === false && step >= 3) { 
      let s2Text = `Stage 2: ${stage2ActualAgent || finalStage2} ${calculateDose(stage2ActualAgent || finalStage2, patient.weight)}`;
      if (stage2Success === true) s2Text += " (Responsive)";
      else if (stage2Success === false) s2Text += " (Refractory)";
      parts.push(s2Text);
    }
    if (stage2Success === false && step >= 4) {
        parts.push(`Stage 3: Refractory Management Initiated`);
        if (stage3Agent) parts.push(`Infusion Selected: ${stage3Agent} ${calculateDose(stage3Agent, patient.weight)}`);
    }
    return `Status Epilepticus Pathway Note:\nWeight: ${patient.weight}kg\n\n${parts.join('\n\n')}`;
  };

  const copySummary = () => { navigator.clipboard.writeText(generateEMRText()); alert("Note copied to clipboard."); };

  const STEPS = [{id:1, title:"Basics"}, {id:2, title:"Benzos"}, {id:3, title:"Urgent"}, {id:4, title:"Refractory"}];

  // Auto scroll effects
  useEffect(() => {
      if (stage1Agent && stage1DoseRef.current) {
          setTimeout(() => stage1DoseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
  }, [stage1Agent]);

  useEffect(() => {
      // Auto-scroll to Stage 2 dose recommendation when entering step 3
      if (step === 3 && stage2DoseRef.current) {
          setTimeout(() => stage2DoseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
      }
  }, [step]);

  useEffect(() => {
      if (stage3Agent && stage3DoseRef.current) {
          setTimeout(() => stage3DoseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      }
  }, [stage3Agent]);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-20">
      <div className="mb-6 flex items-start justify-between">
        <div>
            <button type="button" onClick={handleBack} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-500 mb-6 group cursor-pointer bg-transparent border-0 p-0">
                <div className="bg-white p-1.5 rounded-md border border-slate-200 mr-2 shadow-sm group-hover:shadow-md transition-colors duration-150"><ArrowLeft size={16} /></div> {getBackLabel()}
            </button>
            <div className="flex items-center space-x-3 mb-2"><div className="p-2 bg-red-100 text-red-700 rounded-lg"><Activity size={24} /></div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Status Epilepticus Pathway</h1></div>
            <p className="text-slate-500 font-medium">Step-wise management for convulsive status epilepticus (ESETT protocol compliant).</p>
        </div>
        <button 
            onClick={handleFavToggle}
            className="p-3 rounded-full hover:bg-slate-100 transition-colors"
        >
            <Star size={24} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-colors duration-150"
            style={{ width: `${((activeSection + 1) / 4) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">{activeSection + 1}/4 sections</div>
      </div>

      <div ref={topRef} className="space-y-3">
        <CollapsibleSection
          title="Patient"
          stepNumber={1}
          totalSteps={4}
          isCompleted={activeSection > 0}
          isActive={activeSection === 0}
          onToggle={() => setActiveSection((prev) => (prev === 0 ? -1 : 0))}
          summary={patient.weight ? `Weight: ${patient.weight} kg` : undefined}
        >
            <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-base font-bold text-slate-700 mb-3">Patient Weight (kg)</label>
                    <div className="flex items-center space-x-4">
                        <input type="number" className="w-full p-4 text-xl bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" value={patient.weight || ''} onChange={e => setPatient({...patient, weight: parseFloat(e.target.value)})} placeholder="kg" />
                        <div className="text-sm text-slate-400 font-medium">Used for all calculations</div>
                    </div>
                </div>
                
                {/* NCSE toggle removed (Architect NCSE-1 / CLIN-2). Pathway covers convulsive SE only;
                    non-convulsive SE is routed out below to the cEEG-guided NCSE workup. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border-2 border-red-500 bg-red-50 text-red-900 text-left">
                        <div className="font-bold flex items-center text-lg"><Activity size={20} className="mr-3"/> Convulsive SE only</div>
                        <div className="text-sm mt-1 opacity-80 ml-8">For non-convulsive SE, see cEEG-guided NCSE workup (route-out below).</div>
                    </div>
                     <button onClick={() => setPatient({...patient, ivAccess: !patient.ivAccess})} className={`p-5 rounded-2xl border-2 text-left transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${patient.ivAccess ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-amber-500 bg-amber-50 text-amber-900'}`}>
                        <div className="font-bold flex items-center text-lg"><Syringe size={20} className="mr-3"/> {patient.ivAccess ? 'IV Access Established' : 'No IV Access'}</div>
                        <div className="text-sm mt-1 opacity-70 ml-8">{patient.ivAccess ? 'Enables IV Meds' : 'Use IM Midazolam (RAMPART fixed dose)'}</div>
                    </button>
                </div>

                {/* Stage 0 stabilization adjuncts — empiric considerations (CLIN-5 verbatim ranges) */}
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
                    <h3 className="font-bold text-amber-900 mb-2 flex items-center"><AlertTriangle size={18} className="mr-2"/> Empiric stabilization adjuncts</h3>
                    <ul className="text-sm text-amber-900 space-y-2 ml-1">
                        <li>• <strong>Thiamine 100 mg IV</strong> if alcohol use disorder or malnutrition suspected — give <em>before</em> glucose.</li>
                        <li>• <strong>Pyridoxine 50–100 mg IV</strong> if isoniazid (INH) overdose or pediatric idiopathic SE suspected.</li>
                        <li>• <strong>Pregnancy + active seizure → consider eclampsia → magnesium 4 g IV over 5–10 min, then 1 g/h</strong> (NOT benzo first). Benzodiazepine escalation is NOT first-line for eclamptic seizures (Mullhi 2025). <span className="text-xs italic">Magnesium protocol per Mullhi 2025; primary obstetric guideline (ACOG/RCOG) reference pending.</span></li>
                    </ul>
                </div>

                {/* NCSE route-out card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm text-slate-700">
                    <div className="font-bold text-slate-900 mb-1 flex items-center"><Brain size={16} className="mr-2"/> Suspect NCSE?</div>
                    <p>NCSE without coma is an active condition but does not mandate ICU-level care or anesthetic infusion (Vossler 2025). Route to cEEG-guided NCSE workup rather than continuing this convulsive-SE pathway.</p>
                </div>

                <button onClick={() => setPatient({...patient, glucoseChecked: !patient.glucoseChecked})} className={`w-full p-5 rounded-2xl border-2 transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation text-left min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${patient.glucoseChecked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <div className="flex items-center">
                        <div className={`w-6 h-6 rounded border flex items-center justify-center mr-4 ${patient.glucoseChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-red-300'}`}>
                            {patient.glucoseChecked && <Check size={16} className="text-white" />}
                        </div>
                        <span className="font-bold text-lg">Fingerstick Glucose Checked?</span>
                    </div>
                    {!patient.glucoseChecked && <div className="mt-2 text-sm ml-10 text-red-700 font-medium">Hypoglycemia is a common mimic. Check immediately.</div>}
                </button>

                <div className="fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none flex justify-end">
                    <div className="w-full max-w-3xl mx-auto flex justify-end">
                        <button disabled={!patient.weight} onClick={() => setActiveSection(1)} className="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Proceed to Stage 1 <ChevronRight size={18} className="ml-2" /></button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Benzodiazepines"
          stepNumber={2}
          totalSteps={4}
          isCompleted={activeSection > 1}
          isActive={activeSection === 1}
          onToggle={() => setActiveSection((prev) => (prev === 1 ? -1 : 1))}
          summary={stage1Agent ? `Agent: ${stage1Agent}` : undefined}
        >
            <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-900">Stabilization (0–5 min)</h3>
                            <p className="text-sm text-red-700 mt-1">ABCs, labs, fingerstick glucose, IV access. Empiric thiamine if alcohol/malnutrition suspected.</p>
                            <h3 className="font-bold text-red-900 mt-3">Initial Therapy / BZD (5–20 min)</h3>
                            <p className="text-sm text-red-700 mt-1">First-line benzodiazepine per Glauser 2016. Underdosing is the most common cause of failure.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['lorazepam', 'midazolam', 'diazepam'].map((agent) => (
                        <button key={agent} onClick={() => setStage1Agent(agent as any)} className={`p-5 rounded-2xl border-2 text-left transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${stage1Agent === agent ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-red-200'}`}>
                            <div className="font-bold capitalize text-slate-900 text-lg">{agent}</div>
                            {agent === 'midazolam' && !patient.ivAccess && <div className="text-sm text-emerald-600 font-bold mt-1">Preferred (IM)</div>}
                        </button>
                    ))}
                </div>

                {stage1Agent && (
                    <div ref={stage1DoseRef} className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm animate-in zoom-in-95 scroll-mt-24">
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended Dose</div>
                        <div className="text-4xl font-black text-slate-900 mb-2">
                            {stage1Agent === 'midazolam' && !patient.ivAccess
                                ? calculateBzdFixedDose('midazolam', patient.weight, 'IM')
                                : calculateDose(stage1Agent, patient.weight)}
                        </div>
                        {stage1Agent === 'midazolam' && !patient.ivAccess && (
                            <div className="text-xs text-slate-600 italic mb-2">RAMPART (Silbergleit 2012, PMID 22335736): Intramuscular midazolam in a fixed dose of 10 mg (&gt;40 kg) or 5 mg (13–40 kg) was at least as effective as intravenous lorazepam.</div>
                        )}
                        
                        {!stage1FirstDoseGiven ? (
                            <button onClick={() => setStage1FirstDoseGiven(true)} className="w-full mt-4 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors duration-150 shadow-lg active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Mark First Dose Given</button>
                        ) : (
                            <div className="space-y-4 mt-4">
                                <div className="flex items-center text-emerald-600 font-bold"><Check size={18} className="mr-2" /> First dose administered</div>
                                {!stage1SecondDoseGiven && stage1Success === null && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="font-bold text-slate-900 mb-3">Seizure Status?</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => setStage1Success(true)} className="py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-md active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Stopped</button>
                                            <button onClick={() => setStage1SecondDoseGiven(true)} className="py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-md active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Persists (Repeat)</button>
                                        </div>
                                    </div>
                                )}
                                {stage1SecondDoseGiven && stage1Success === null && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
                                         <div className="flex items-center text-red-600 font-bold mb-3"><Syringe size={18} className="mr-2" /> Second dose administered</div>
                                         <div className="font-bold text-slate-900 mb-3">Seizure Status?</div>
                                         <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => setStage1Success(true)} className="py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-md active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Stopped</button>
                                            <button onClick={() => { setStage1Success(false); setActiveSection(2); }} className="py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Persists (Refractory)</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                 {stage1Success === true && (
                     <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl text-center animate-in zoom-in-95">
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3"><Check size={24} /></div>
                         <h3 className="text-xl font-bold text-emerald-900">Seizure Controlled</h3>
                         <p className="text-emerald-700 mb-4">Monitor ABCs. Consider maintenance therapy.</p>
                         <button onClick={copySummary} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Copy Summary</button>
                     </div>
                 )}
            </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Urgent Control"
          stepNumber={3}
          totalSteps={4}
          isCompleted={activeSection > 2}
          isActive={activeSection === 2}
          onToggle={() => setActiveSection((prev) => (prev === 2 ? -1 : 2))}
          summary={stage2Agent ? `Agent: ${stage2Agent}` : undefined}
        >
            <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" />
                    <div><h3 className="font-bold text-red-900">Established SE (20–40 min from onset)</h3><p className="text-sm text-red-700 mt-1">Seizure persisting despite adequate benzodiazepine therapy (Glauser 2016). Risk of neuronal injury rises with duration.</p></div>
                </div>

                {/* ESETT equivalence pearl (CLIN-2 verbatim — required string) */}
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                    <h3 className="font-bold text-indigo-900 mb-1 flex items-center"><Info size={16} className="mr-2"/> ESETT equivalence</h3>
                    <p className="text-sm text-indigo-900">{esett.pearl}</p>
                    <p className="text-xs text-indigo-700 mt-2 italic">Lacosamide is NOT a Stage 2 ESETT-equivalent option — reserve for Stage 3 add-on per AES 2016 / Vossler 2025.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-3">Comorbidities (Affects Drug Choice)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {([
                            { key: 'hypotension', label: 'HYPOTENSION' },
                            { key: 'respiratory', label: 'RESPIRATORY' },
                            { key: 'cardiacAvBlock', label: 'AV BLOCK (2°/3°)' },
                            { key: 'cardiacElderly', label: 'ELDERLY (no block)' },
                            { key: 'liver', label: 'LIVER' },
                            { key: 'pancreatitis', label: 'PANCREATITIS' },
                            { key: 'pregnancy', label: 'PREGNANCY' },
                            { key: 'renal', label: 'RENAL' },
                            { key: 'carbapenem', label: 'CARBAPENEM' },
                        ] as { key: keyof Comorbidities; label: string }[]).map(({ key, label }) => (
                            <button key={key} onClick={() => setComorbidities({...comorbidities, [key]: !comorbidities[key]})} className={`px-3 py-3 text-xs font-bold rounded-lg border transition-colors duration-150 active:scale-[0.98] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${comorbidities[key] ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div ref={stage2DoseRef} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm scroll-mt-24">
                    <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-3">ESETT-equivalent options (lev/fos/VPA)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {esett.options.map((opt) => {
                            const isSelected = finalStage2 === opt.agent;
                            const statusColor = opt.status === 'avoid' ? 'border-red-400 bg-red-50' : opt.status === 'caution' ? 'border-amber-400 bg-amber-50' : 'border-emerald-400 bg-emerald-50';
                            const selectedRing = isSelected ? 'ring-2 ring-indigo-500' : '';
                            return (
                                <button key={opt.agent} onClick={() => setStage2Agent(opt.agent)} disabled={opt.status === 'avoid'} className={`p-3 rounded-xl border-2 text-left transition-colors duration-150 ${statusColor} ${selectedRing} ${opt.status === 'avoid' ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-sm'} focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none`}>
                                    <div className="font-bold capitalize text-slate-900">{opt.agent}</div>
                                    <div className={`text-xs font-bold uppercase mt-1 ${opt.status === 'avoid' ? 'text-red-700' : opt.status === 'caution' ? 'text-amber-700' : 'text-emerald-700'}`}>{opt.status}</div>
                                    {opt.note && <div className="text-xs text-slate-600 mt-1">{opt.note}</div>}
                                    <div className="text-[10px] uppercase text-slate-400 font-bold mt-2">ESETT-equivalent (lev/fos/VPA)</div>
                                </button>
                            );
                        })}
                    </div>
                    {stage2Recommendation.warnings.length > 0 && (
                        <div className="flex items-start space-x-2 mb-3">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                            <div className="flex-1 space-y-1">
                                {stage2Recommendation.warnings.map((w, i) => <div key={i} className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded">{w}</div>)}
                            </div>
                        </div>
                    )}
                    <div className="mt-2 p-4 bg-slate-50 rounded-xl">
                        <div className="text-xs font-bold text-slate-400 uppercase">Dosing — {finalStage2}</div>
                        <div className="text-xl font-bold text-slate-900">{calculateDose(finalStage2, patient.weight)}</div>
                    </div>
                </div>

                <div className="fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none flex justify-between space-x-4">
                    <div className="w-full max-w-3xl mx-auto flex gap-4">
                        <button onClick={() => setStage1Success(true)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex-1 shadow-lg active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Seizure Stopped</button>
                        <button onClick={() => { setStage2Success(false); setStage2ActualAgent(finalStage2); setActiveSection(3); }} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 flex-1 shadow-lg active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Persists (Refractory)</button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Refractory"
          stepNumber={4}
          totalSteps={4}
          isCompleted={step === 4}
          isActive={activeSection === 3}
          onToggle={() => setActiveSection((prev) => (prev === 3 ? -1 : 3))}
          summary={stage3Agent ? `Infusion: ${stage3Agent}` : undefined}
        >
             <div className="space-y-6 animate-in slide-in-from-right-4">
                 <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-1">Refractory SE</h2>
                        <p className="opacity-90">Stage 3 (40+ min from onset OR after 1 BZD + 1 non-BZD ASM failure, per Glauser 2016). Intubation and continuous EEG required.</p>
                    </div>
                    <Activity className="absolute right-4 top-4 text-white opacity-20" size={64} />
                 </div>

                 {/* NORSE/FIRES advisory (B2) */}
                 <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                    <h3 className="font-bold text-purple-900 mb-1 flex items-center"><Brain size={16} className="mr-2"/> NORSE / FIRES consideration</h3>
                    <p className="text-sm text-purple-900">If new-onset RSE without obvious cause, consider NORSE/FIRES. Expert consensus supports empiric immunotherapy within 72 hours and an autoimmune/paraneoplastic workup in parallel with anesthetic management.</p>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Continuous Infusion Options</h3>
                    <div className="space-y-3">
                         <button onClick={() => setStage3Agent("midazolam_inf")} className={`w-full text-left p-5 rounded-2xl border-2 transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${stage3Agent === 'midazolam_inf' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}>
                            <div className="font-bold text-lg">Midazolam Infusion</div>
                            <div className="text-sm opacity-70">Load: 0.2 mg/kg. Maint: 0.1-2 mg/kg/hr.</div>
                        </button>
                        <button onClick={() => setStage3Agent("propofol_inf")} className={`w-full text-left p-5 rounded-2xl border-2 transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${stage3Agent === 'propofol_inf' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}>
                            <div className="font-bold text-lg">Propofol Infusion</div>
                            <div className="text-sm opacity-70">Load: 1-2 mg/kg. Maint: 20-200 mcg/kg/min. Caution PRIS.</div>
                        </button>
                         <button onClick={() => setStage3Agent("ketamine_inf")} className={`w-full text-left p-5 rounded-2xl border-2 transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${stage3Agent === 'ketamine_inf' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}>
                            <div className="font-bold text-lg">Ketamine Infusion</div>
                            <div className="text-sm opacity-70">Load: 1-2.5 mg/kg (Vossler 2025). Maint: 1-10 mg/kg/hr. Hemodynamically stable.</div>
                        </button>
                    </div>

                    {/* Stage 3 ASM add-on — lacosamide moved here from Stage 2 (CLIN-2 / A1) */}
                    <div className="mt-5 border-t border-slate-100 pt-5">
                        <h4 className="font-bold text-slate-900 mb-3 text-sm">Stage 3 ASM add-on (alongside anesthetic infusion)</h4>
                        <button onClick={() => setStage3Agent("lacosamide")} className={`w-full text-left p-5 rounded-2xl border-2 transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${stage3Agent === 'lacosamide' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}>
                            <div className="font-bold text-lg">Lacosamide (add-on)</div>
                            <div className="text-sm opacity-70">{calculateDose("lacosamide", patient.weight)}. Pre-load ECG required.</div>
                        </button>
                        <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                            <strong>Pre-load ECG safety note:</strong> lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker (Vossler 2025). Obtain ECG before loading; verify PR interval and absence of high-degree AV block.
                        </div>
                    </div>
                 </div>

                 {stage3Agent && (
                     <div ref={stage3DoseRef} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in zoom-in-95 pb-24 scroll-mt-24">
                         <h3 className="font-bold text-slate-900 mb-2">Calculated Load</h3>
                         <div className="text-4xl font-black text-slate-900">{calculateDose(stage3Agent, patient.weight)}</div>
                     </div>
                 )}
                 {/* Stage 4 — Super-Refractory SE (B1). Framed as workup/checklist, NOT Class I/IIa recommendations (CLIN-4).
                     Verbs: "consider" / "may be considered" / "expert consensus" only.
                     Must contain verbatim "insufficient evidence" caveat per AES 2020 / CLIN-7. */}
                 <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-2xl">
                    <h3 className="font-bold text-slate-900 mb-1 flex items-center"><Zap size={18} className="mr-2 text-amber-600"/> Super-Refractory SE (Stage 4 — 24h+ on anesthetic)</h3>
                    <p className="text-xs text-slate-600 mb-3 italic">Framed as workup/checklist — expert consensus only. AES 2020 notes insufficient evidence to grade specific recommendations for super-refractory SE.</p>
                    <ul className="text-sm text-slate-800 space-y-2">
                        <li>• Re-image brain (MRI with contrast); rule out evolving lesion or cerebritis.</li>
                        <li>• Repeat LP; consider autoimmune encephalitis panel (NMDA-R, LGI1, GABA-B, etc.) and paraneoplastic workup.</li>
                        <li>• Consider empiric immunotherapy (steroids, IVIG, or PLEX) if NORSE/FIRES suspected.</li>
                        <li>• Consider ketogenic diet within 7 days for cryptogenic super-refractory cases.</li>
                        <li>• Consider alternative anesthetic (ketamine, thiopental/pentobarbital, isoflurane) if midazolam/propofol fail.</li>
                        <li>• Transfer to tertiary neurocritical care center if not already.</li>
                    </ul>
                 </div>

                 {stage3Agent && (
                    <div className="fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
                        <div className="max-w-3xl mx-auto">
                            <button onClick={copySummary} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg active:scale-95 transform-gpu min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none">Copy Full Pathway Note</button>
                        </div>
                    </div>
                 )}
             </div>
        </CollapsibleSection>

        {activeSection === 3 && (
            <div className="mt-12 border-t border-slate-100 pt-8 pb-8">
                 <h3 className="text-sm font-bold text-slate-900 mb-4">References</h3>
                 <ul className="space-y-3 text-xs text-slate-500">
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">1</span>{autoLinkReactNodes("Glauser T et al. Evidence-based guideline: treatment of convulsive status epilepticus in children and adults. Epilepsy Curr 2016 (AES Guidelines).")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">2</span>{autoLinkReactNodes("Kapur J et al. Randomized trial of three anticonvulsant medications for status epilepticus. N Engl J Med 2019 (ESETT Trial).")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">3</span>{autoLinkReactNodes("Silbergleit R et al. Intramuscular versus intravenous therapy for prehospital status epilepticus. N Engl J Med 2012 (RAMPART). PMID 22335736.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">4</span>{autoLinkReactNodes("Treiman DM et al. A comparison of four treatments for generalized convulsive status epilepticus. VA Cooperative SE Trial. N Engl J Med 1998. PMID 9738086.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">5</span>{autoLinkReactNodes("Alldredge BK et al. A comparison of lorazepam, diazepam, and placebo for the treatment of out-of-hospital status epilepticus (PHTSE). N Engl J Med 2001. PMID 11547716.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">6</span>{autoLinkReactNodes("Lyttle MD et al. Levetiracetam versus phenytoin for second-line treatment of paediatric convulsive status epilepticus (EcLiPSE). Lancet 2019. PMID 31005386.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">7</span>{autoLinkReactNodes("Dalziel SR et al. Levetiracetam versus phenytoin for second-line treatment of convulsive status epilepticus in children (ConSEPT). Lancet 2019. PMID 31005385.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">8</span>{autoLinkReactNodes("Vossler DG. Status epilepticus in adults. Continuum (Minneap Minn) 2025;31(1):95–124.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">9</span>{autoLinkReactNodes("Rubinos C et al. Acute symptomatic seizures and status epilepticus. Continuum (Minneap Minn) 2024;30(3):682–720.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">10</span>{autoLinkReactNodes("Mullhi RK et al. Management of eclampsia and status epilepticus in pregnancy. J Intensive Care Soc 2025. DOI 10.1177/17511437251321338.")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">11</span>{autoLinkReactNodes(SE_CONTENT.stage2Note)}</li>
                 </ul>
            </div>
        )}
      </div>
      {showFavToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {isFav ? 'Saved to Favorites' : 'Removed from Favorites'}
        </div>
      )}
    </div>
  );
};

export default StatusEpilepticusPathway;

// @medical-scientist 2026-05-16 — clinical fixes applied per docs/audits/2026-05-16/status-epilepticus-pathway-fix-manifest.md (Patches 1-6; ship-blockers A1/A2 addressed; CLIN-2 verbatim phrases preserved).
