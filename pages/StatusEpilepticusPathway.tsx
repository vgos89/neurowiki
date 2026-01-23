
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, RotateCcw, Copy, Activity, AlertTriangle, ShieldCheck, ClipboardCheck, Syringe, BedDouble, ChevronRight, Calculator, Info, Thermometer, Zap, XCircle, Brain, Star } from 'lucide-react';
import { SE_CONTENT } from '../data/toolContent';
import { autoLinkReactNodes } from '../internalLinks/autoLink';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../src/hooks/useCalculatorAnalytics';
import { CollapsibleSection } from '../src/components/CollapsibleSection';
import { useNavigationSource } from '../src/hooks/useNavigationSource';

// --- Types & Logic ---
type Agent = "levetiracetam" | "fosphenytoin" | "valproate" | "lacosamide" | "phenobarbital";
interface PatientData { weight: number; convulsive: boolean; ivAccess: boolean; glucoseChecked: boolean; }
interface Comorbidities { hypotension: boolean; respiratory: boolean; cardiac: boolean; liver: boolean; pancreatitis: boolean; pregnancy: boolean; renal: boolean; carbapenem: boolean; }
interface Step3Checklist { benzoAdequate: boolean; stage2Adequate: boolean; glucoseTreated: boolean; eegConsidered: boolean; }
interface RenalState { crcl: string; dialysis: 'no' | 'yes' | 'unknown'; levForm: 'ir' | 'keppra_xr' | 'elepsia_xr'; lcmForm: 'vimpat' | 'motpoly_xr'; }

const calculateDose = (agent: string, weight: number): string => {
  if (weight <= 0) return "Enter weight";
  switch(agent) {
    case "lorazepam": return `${Math.min(4, Math.round(0.1 * weight * 10) / 10)} mg IV (0.1 mg/kg, max 4mg)`;
    case "midazolam": return `${Math.min(10, Math.round(0.2 * weight * 10) / 10)} mg IM/IV (0.2 mg/kg, max 10mg)`;
    case "diazepam": return `${Math.min(10, Math.round(0.15 * weight * 10) / 10)} mg IV (0.15 mg/kg, max 10mg)`;
    case "levetiracetam": return `${Math.min(4500, Math.round(60 * weight))} mg IV (60 mg/kg, max 4500mg)`;
    case "fosphenytoin": return `${Math.min(1500, Math.round(20 * weight))} mg PE IV (20 mg PE/kg, max 1500mg PE)`;
    case "valproate": return `${Math.min(3000, Math.round(40 * weight))} mg IV (40 mg/kg, max 3000mg)`;
    case "lacosamide": return `${Math.min(600, Math.round(8 * weight))} mg IV (8 mg/kg, max 600mg)`;
    case "phenobarbital": return `${Math.round(20 * weight)} mg IV (20 mg/kg, rate <60mg/min)`;
    case "midazolam_inf": return `Load: ${Math.round(0.2 * weight * 10)/10} mg (0.2 mg/kg)`;
    case "propofol_inf": return `Load: ${Math.round(1 * weight)} - ${Math.round(2 * weight)} mg (1-2 mg/kg)`;
    case "ketamine_inf": return `Load: ${Math.round(1.5 * weight)} - ${Math.round(4.5 * weight)} mg (1.5-4.5 mg/kg)`;
    case "pentobarb_inf": return `Load: ${Math.round(5 * weight)} - ${Math.round(15 * weight)} mg (5-15 mg/kg)`;
    default: return "-";
  }
};

const StatusEpilepticusPathway: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const step = activeSection + 1;
  const { getBackPath, getBackLabel } = useNavigationSource();
  const [patient, setPatient] = useState<PatientData>({ weight: 0, convulsive: true, ivAccess: true, glucoseChecked: false });
  const [stage1Agent, setStage1Agent] = useState<"lorazepam" | "diazepam" | "midazolam" | null>(null);
  const [stage1FirstDoseGiven, setStage1FirstDoseGiven] = useState(false);
  const [stage1SecondDoseGiven, setStage1SecondDoseGiven] = useState(false);
  const [stage1Success, setStage1Success] = useState<boolean | null>(null); 
  const [comorbidities, setComorbidities] = useState<Comorbidities>({ hypotension: false, respiratory: false, cardiac: false, liver: false, pancreatitis: false, pregnancy: false, renal: false, carbapenem: false });
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

  const getRecommendedAgent = (excludeAgents: Agent[] = []): { agent: Agent; reason: string; warnings: string[] } => {
    const warnings: string[] = [];
    const avoidValproate = comorbidities.liver || comorbidities.pancreatitis || comorbidities.pregnancy || comorbidities.carbapenem;
    const avoidLacosamide = comorbidities.cardiac;
    const avoidPhenobarbital = comorbidities.hypotension || comorbidities.respiratory;
    const cautionLevetiracetam = comorbidities.renal;
    const cautionPhenytoin = comorbidities.hypotension || comorbidities.cardiac;
    if (comorbidities.pregnancy) warnings.push("Pregnancy: Valproate contraindicated (teratogenic).");
    if (comorbidities.liver) warnings.push("Liver Dz: Valproate avoided.");
    if (comorbidities.carbapenem) warnings.push("Carbapenem: Lowers valproate levels.");
    if (comorbidities.cardiac) warnings.push("Cardiac (PR>200ms): Lacosamide avoided. Caution Phenytoin.");
    if (comorbidities.hypotension) warnings.push("Hypotension: Avoid Phenobarb. Caution Phenytoin.");
    if (comorbidities.renal) warnings.push("Renal: Levetiracetam maintenance adjustment needed.");
    const canUse = (a: Agent) => !excludeAgents.includes(a);
    if (canUse("levetiracetam") && !cautionLevetiracetam) return { agent: "levetiracetam", reason: "Standard first-line (ESETT)", warnings };
    if (canUse("fosphenytoin") && !cautionPhenytoin) return { agent: "fosphenytoin", reason: "Preferred alternative (Renal sparing)", warnings };
    if (canUse("valproate") && !avoidValproate) return { agent: "valproate", reason: "Safe hemodynamic profile", warnings };
    if (canUse("lacosamide") && !avoidLacosamide) return { agent: "lacosamide", reason: "Alternative option", warnings };
    if (canUse("phenobarbital") && !avoidPhenobarbital) return { agent: "phenobarbital", reason: "Last line prior to anesthesia", warnings };
    if (canUse("levetiracetam")) return { agent: "levetiracetam", reason: "Best available (Adjust maint. dose)", warnings: [...warnings, "ADJUST MAINTENANCE DOSE FOR RENAL"] };
    return { agent: "fosphenytoin", reason: "Clinical judgment required", warnings: [...warnings, "High risk profile"] };
  };

  const stage2Recommendation = getRecommendedAgent();
  const finalStage2 = stage2Agent === "auto" ? stage2Recommendation.agent : stage2Agent;
  
  const handleReset = () => { 
      setActiveSection(0); 
      setPatient({ weight: 0, convulsive: true, ivAccess: true, glucoseChecked: false }); 
      setStage1Agent(null); 
      setStage1FirstDoseGiven(false); 
      setStage1SecondDoseGiven(false); 
      setStage1Success(null); 
      setComorbidities({ hypotension: false, respiratory: false, cardiac: false, liver: false, pancreatitis: false, pregnancy: false, renal: false, carbapenem: false }); 
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
            <Link to={getBackPath()} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-500 mb-6 group">
                <div className="bg-white p-1.5 rounded-md border border-slate-200 mr-2 shadow-sm group-hover:shadow-md transition-colors duration-150"><ArrowLeft size={16} /></div> {getBackLabel()}
            </Link>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => setPatient({...patient, convulsive: !patient.convulsive})} className={`p-5 rounded-2xl border-2 text-left transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${patient.convulsive ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 bg-white'}`}>
                        <div className="font-bold flex items-center text-lg">{patient.convulsive ? <Activity size={20} className="mr-3"/> : <Brain size={20} className="mr-3"/>} {patient.convulsive ? 'Convulsive SE' : 'Non-Convulsive SE'}</div>
                        <div className="text-sm mt-1 opacity-70 ml-8">{patient.convulsive ? 'Prominent motor symptoms' : 'Coma/Confusion/EEG only'}</div>
                    </button>
                     <button onClick={() => setPatient({...patient, ivAccess: !patient.ivAccess})} className={`p-5 rounded-2xl border-2 text-left transition-colors duration-150 active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${patient.ivAccess ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-amber-500 bg-amber-50 text-amber-900'}`}>
                        <div className="font-bold flex items-center text-lg"><Syringe size={20} className="mr-3"/> {patient.ivAccess ? 'IV Access Established' : 'No IV Access'}</div>
                        <div className="text-sm mt-1 opacity-70 ml-8">{patient.ivAccess ? 'Enables IV Meds' : 'Use IM Midazolam'}</div>
                    </button>
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
                 <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" />
                    <div><h3 className="font-bold text-red-900">Stage 1: Early Status (0-5 min)</h3><p className="text-sm text-red-700 mt-1">Goal: Stop seizure immediately. Underdosing is a common cause of failure.</p></div>
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
                        <div className="text-4xl font-black text-slate-900 mb-2">{calculateDose(stage1Agent, patient.weight)}</div>
                        
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
                    <div><h3 className="font-bold text-red-900">Stage 2: Established SE (5-30 min)</h3><p className="text-sm text-red-700 mt-1">Seizure persisting despite adequate benzos. Risk of neuronal injury increases.</p></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-3">Comorbidities (Affects Drug Choice)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.keys(comorbidities).map(k => (
                            <button key={k} onClick={() => setComorbidities({...comorbidities, [k]: !comorbidities[k as keyof Comorbidities]})} className={`px-3 py-3 text-sm font-bold rounded-lg border transition-colors duration-150 active:scale-[0.98] transform-gpu touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${comorbidities[k as keyof Comorbidities] ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                {k.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div ref={stage2DoseRef} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm scroll-mt-24">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Recommended Agent</div>
                             <div className="text-3xl font-black text-slate-900 capitalize">{stage2Recommendation.agent}</div>
                        </div>
                        {stage2Recommendation.warnings.length > 0 && <AlertTriangle className="text-amber-500" />}
                    </div>
                    {stage2Recommendation.warnings.map((w, i) => <div key={i} className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mb-1">{w}</div>)}
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                        <div className="text-xs font-bold text-slate-400 uppercase">Dosing</div>
                        <div className="text-xl font-bold text-slate-900">{calculateDose(finalStage2, patient.weight)}</div>
                    </div>
                    
                    <div className="mt-4">
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Override Selection</label>
                        <select className="w-full p-4 bg-white border border-slate-300 rounded-xl text-base font-bold" value={stage2Agent} onChange={(e) => setStage2Agent(e.target.value as any)}>
                            <option value="auto">Auto-Recommend ({stage2Recommendation.agent})</option>
                            <option value="levetiracetam">Levetiracetam</option>
                            <option value="fosphenytoin">Fosphenytoin</option>
                            <option value="valproate">Valproate</option>
                            <option value="lacosamide">Lacosamide</option>
                            <option value="phenobarbital">Phenobarbital</option>
                        </select>
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
                        <p className="opacity-90">Stage 3 (&gt;30 min). Intubation & Continuous EEG required.</p>
                    </div>
                    <Activity className="absolute right-4 top-4 text-white opacity-20" size={64} />
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
                            <div className="text-sm opacity-70">Load: 1.5-4.5 mg/kg. Maint: 1-10 mg/kg/hr. Hemodynamically stable.</div>
                        </button>
                    </div>
                 </div>

                 {stage3Agent && (
                     <div ref={stage3DoseRef} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in zoom-in-95 pb-24 scroll-mt-24">
                         <h3 className="font-bold text-slate-900 mb-2">Calculated Load</h3>
                         <div className="text-4xl font-black text-slate-900">{calculateDose(stage3Agent, patient.weight)}</div>
                     </div>
                 )}
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
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">1</span>{autoLinkReactNodes("Glauser T et al. Epilepsy Curr 2016 (AES Guidelines).")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">2</span>{autoLinkReactNodes("Kapur J et al. N Engl J Med 2019 (ESETT Trial).")}</li>
                     <li className="flex items-start"><span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-2 font-mono">3</span>{autoLinkReactNodes(SE_CONTENT.stage2Note)}</li>
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
