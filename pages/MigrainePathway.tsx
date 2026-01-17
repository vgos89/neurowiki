
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, RotateCcw, Copy, AlertTriangle, ChevronRight, Skull, ShieldAlert, AlertCircle, ClipboardCheck, Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

// --- Types ---
interface RedFlags {
  thunderclap: boolean;
  fever: boolean;
  focalDeficit: boolean;
  ams: boolean;
  papilledema: boolean;
  pregnancyNew: boolean;
  immunocompromised: boolean;
}

type RenalStatus = 'normal' | '30-50' | 'below30' | 'dialysis';

interface SafetyState {
  pregnant: boolean;
  renal: RenalStatus;
  cvRisk: boolean; // Angina/CAD/MI
  htn: boolean; // Uncontrolled HTN
  hepatic: boolean;
  basilar: boolean;
  triptan24h: boolean;
  dm: boolean; // Uncontrolled DM
  strokeHistory: boolean; // TIA/Stroke/ICH
  age65: boolean; // Age > 65
  weightLow: boolean; // Weight < 50 kg
}

type AntiemeticChoice = 'metoclopramide' | 'prochlorperazine' | 'ondansetron' | null;
type KetorolacDose = '15' | '30' | '45' | null;
type DexDose = '4' | '6' | '8' | '10' | null;
type ValproateDose = '500' | '750' | '1000' | null;
type MagDose = '1' | '2' | null;

interface CocktailState {
    benadryl: boolean;
    antiemetic: AntiemeticChoice;
    ketorolac: KetorolacDose;
    dexamethasone: DexDose;
}

interface AddOnsState {
    sumatriptan: boolean;
    magnesium: MagDose;
    valproate: ValproateDose;
}

const STEPS = [
  { id: 1, title: "Safety Screen" },
  { id: 2, title: "Care Setting" },
  { id: 3, title: "Acute TX" },
  { id: 4, title: "Response" },
  { id: 5, title: "Plan" }
];

const MigrainePathway: React.FC = () => {
  const [step, setStep] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  
  // Section refs for auto-scroll
  const cocktailRef = useRef<HTMLDivElement>(null);
  const antiemeticRef = useRef<HTMLDivElement>(null);
  const ketorolacRef = useRef<HTMLDivElement>(null);
  const dexRef = useRef<HTMLDivElement>(null);
  const addonsRef = useRef<HTMLDivElement>(null);

  // Favorites
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const isFav = isFavorite('migraine-pathway');

  const handleFavToggle = () => {
      const newVal = toggleFavorite('migraine-pathway');
      setShowFavToast(true);
      setTimeout(() => setShowFavToast(false), 2000);
  };

  // Clinical State
  const [redFlags, setRedFlags] = useState<RedFlags>({
    thunderclap: false, fever: false, focalDeficit: false, ams: false, papilledema: false, pregnancyNew: false, immunocompromised: false
  });
  
  const [careSetting, setCareSetting] = useState<'adequate' | 'incomplete' | 'vomiting' | null>(null);
  
  // Safety Profile
  const [safety, setSafety] = useState<SafetyState>({
    pregnant: false,
    renal: 'normal',
    cvRisk: false,
    htn: false,
    hepatic: false,
    basilar: false,
    triptan24h: false,
    dm: false,
    strokeHistory: false,
    age65: false,
    weightLow: false
  });

  // Treatment Selection
  const [cocktail, setCocktail] = useState<CocktailState>({
      benadryl: true,
      antiemetic: 'metoclopramide',
      ketorolac: '15',
      dexamethasone: '10'
  });
  
  const [firstLineAddOns, setFirstLineAddOns] = useState<AddOnsState>({
      sumatriptan: false,
      magnesium: null,
      valproate: null
  });

  const [responseImproved, setResponseImproved] = useState<boolean | null>(null);
  
  const [secondLine, setSecondLine] = useState<{ magnesium: MagDose; valproate: ValproateDose }>({
      magnesium: null,
      valproate: null
  });

  const [removedAlerts, setRemovedAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (step > 1 && topRef.current) {
        setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else {
        window.scrollTo(0, 0);
    }
  }, [step]);

  // --- Logic Helpers ---

  const isRenalImpaired = safety.renal !== 'normal';
  const isRenalSevere = safety.renal === 'below30' || safety.renal === 'dialysis';

  const checkEligibility = (drug: string) => {
      const reasons: string[] = [];
      let disabled = false;
      let warning = "";

      switch(drug) {
          case 'ketorolac':
              if (safety.pregnant) { disabled = true; reasons.push("Pregnancy"); }
              if (isRenalImpaired) { disabled = true; reasons.push("GFR < 50"); }
              break;
          case 'dexamethasone':
              if (safety.dm) { disabled = true; reasons.push("Uncontrolled DM"); }
              break;
          case 'sumatriptan':
              if (safety.pregnant) { disabled = true; reasons.push("Pregnancy"); }
              if (safety.htn) { disabled = true; reasons.push("Uncontrolled HTN"); }
              if (safety.cvRisk) { disabled = true; reasons.push("CV Risk/CAD"); }
              if (safety.strokeHistory) { disabled = true; reasons.push("Hx Stroke/TIA"); }
              if (safety.basilar) { disabled = true; reasons.push("Basilar Migraine"); }
              break;
          case 'valproate':
              if (safety.pregnant) { disabled = true; reasons.push("Pregnancy (Teratogenic)"); }
              if (safety.hepatic) { disabled = true; reasons.push("Hepatic Impairment"); }
              break;
          case 'magnesium':
              if (isRenalImpaired) { warning = "Caution in Renal Impairment"; }
              if (isRenalSevere) { disabled = true; reasons.push("Severe Renal Failure"); }
              break;
      }
      return { disabled, reason: reasons.join(", "), warning };
  };

  // Monitor Safety Changes to Auto-Deselect
  useEffect(() => {
      const alerts: string[] = [];
      
      // Check Cocktail
      if (cocktail.ketorolac && checkEligibility('ketorolac').disabled) {
          setCocktail(prev => ({ ...prev, ketorolac: null }));
          alerts.push("Ketorolac removed (Safety)");
      }
      if (cocktail.dexamethasone && checkEligibility('dexamethasone').disabled) {
          setCocktail(prev => ({ ...prev, dexamethasone: null }));
          alerts.push("Dexamethasone removed (Safety)");
      }

      // Check First Line Add-ons
      if (firstLineAddOns.sumatriptan && checkEligibility('sumatriptan').disabled) {
          setFirstLineAddOns(prev => ({ ...prev, sumatriptan: false }));
          alerts.push("Sumatriptan removed (Safety)");
      }
      if (firstLineAddOns.valproate && checkEligibility('valproate').disabled) {
          setFirstLineAddOns(prev => ({ ...prev, valproate: null }));
          alerts.push("Valproate removed (Safety)");
      }
      // Mg check
      if (firstLineAddOns.magnesium && checkEligibility('magnesium').disabled) {
          setFirstLineAddOns(prev => ({ ...prev, magnesium: null }));
          alerts.push("Magnesium removed (Safety)");
      }

      if (alerts.length > 0) {
          setRemovedAlerts(prev => [...prev, ...alerts]);
          setTimeout(() => setRemovedAlerts([]), 5000);
      }
  }, [safety]);


  const handleReset = () => {
    setStep(1);
    setRedFlags({ thunderclap: false, fever: false, focalDeficit: false, ams: false, papilledema: false, pregnancyNew: false, immunocompromised: false });
    setCareSetting(null);
    setSafety({ pregnant: false, renal: 'normal', cvRisk: false, htn: false, hepatic: false, basilar: false, triptan24h: false, dm: false, strokeHistory: false, age65: false, weightLow: false });
    setCocktail({ benadryl: true, antiemetic: 'metoclopramide', ketorolac: '15', dexamethasone: '10' });
    setFirstLineAddOns({ sumatriptan: false, magnesium: null, valproate: null });
    setResponseImproved(null);
    setSecondLine({ magnesium: null, valproate: null });
  };

  const generateSummary = () => {
      const lines: string[] = [];
      const contraindications: string[] = [];

      // Collect Constraints
      ['ketorolac', 'dexamethasone', 'sumatriptan', 'valproate', 'magnesium'].forEach(drug => {
          const check = checkEligibility(drug);
          if (check.disabled) contraindications.push(`${drug.charAt(0).toUpperCase() + drug.slice(1)}: ${check.reason}`);
      });

      lines.push("FIRST-LINE COCKTAIL:");
      if (cocktail.benadryl) lines.push("- Diphenhydramine 25/50 mg PO/IV x1");
      
      if (cocktail.antiemetic === 'metoclopramide') lines.push("- Metoclopramide 10 mg PO/IV x1 (Repeat q8h PRN)");
      if (cocktail.antiemetic === 'prochlorperazine') lines.push("- Prochlorperazine 10 mg PO/IV x1 (Repeat q8h PRN)");
      if (cocktail.antiemetic === 'ondansetron') lines.push("- Ondansetron 4-8 mg PO/IV x1 (Repeat q8h PRN)");

      if (cocktail.ketorolac) lines.push(`- Ketorolac ${cocktail.ketorolac} mg IM/IV x1 (Repeat x1 at 8h PRN, Max 2 doses)`);
      if (cocktail.dexamethasone) lines.push(`- Dexamethasone ${cocktail.dexamethasone} mg IV x1`);

      if (firstLineAddOns.sumatriptan) lines.push("- Sumatriptan 6 mg SC x1 (Repeat x1 after 1h PRN, Max 12mg/24h)");
      if (firstLineAddOns.magnesium) lines.push(`- Magnesium Sulfate ${firstLineAddOns.magnesium} g IV x1`);
      if (firstLineAddOns.valproate) lines.push(`- Valproate ${firstLineAddOns.valproate} mg IV over 15m x1 (Repeat 500mg q8h PRN, Max 3 doses)`);

      if (responseImproved === false) {
          lines.push("\nSECOND-LINE (Refractory > 2h):");
          if (secondLine.magnesium) lines.push(`- Magnesium Sulfate ${secondLine.magnesium} g IV x1`);
          if (secondLine.valproate) lines.push(`- Valproate ${secondLine.valproate} mg IV over 15m x1 (Repeat 500mg q8h PRN, Max 3 doses)`);
          if (!secondLine.magnesium && !secondLine.valproate) lines.push("- Consider admission / Neurology Consult");
      }

      let text = `MIGRAINE PATHWAY ORDERS\n\n${lines.join('\n')}`;
      if (contraindications.length > 0) {
          text += `\n\nContraindications Applied:\n${contraindications.join('\n')}`;
      }
      return text;
  };

  const copySummary = () => {
    navigator.clipboard.writeText(generateSummary());
    alert("Plan copied to clipboard.");
  };

  const SafetyToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
      <button 
        onClick={onClick}
        className={`px-3 py-3 rounded-lg text-sm font-bold border transition-all touch-manipulation ${
            active 
            ? 'bg-red-100 text-red-800 border-red-200 shadow-inner' 
            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
        }`}
      >
        {label}
      </button>
  );

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32" ref={topRef}>
      
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
            <Link to="/calculators" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-600 mb-6 group">
                <div className="bg-white p-1.5 rounded-md border border-gray-200 mr-2 shadow-sm group-hover:shadow-md transition-all">
                    <ArrowLeft size={16} />
                </div>
                Back to Calculators
            </Link>
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Skull size={24} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Acute Migraine Pathway</h1>
            </div>
            <p className="text-slate-500 font-medium">Evidence-based "Headache Cocktail" algorithm for ED & Inpatient management.</p>
        </div>
        <button 
            onClick={handleFavToggle}
            className="p-3 rounded-full hover:bg-slate-100 transition-colors"
        >
            <Star size={24} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center space-x-1 mb-8 px-1">
         {STEPS.map((s) => (
             <div key={s.id} className="flex-1 flex flex-col items-center relative">
                 <div className={`w-full h-1 absolute top-1/2 -translate-y-1/2 -z-10 ${s.id === 1 ? 'hidden' : ''} ${step >= s.id ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors z-10 ${
                     step === s.id ? 'bg-white border-indigo-500 text-indigo-600' : 
                     step > s.id ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'
                 }`}>
                     {step > s.id ? <Check size={14} /> : s.id}
                 </div>
                 <span className={`hidden sm:block text-[10px] mt-2 font-bold uppercase tracking-wider ${step === s.id ? 'text-indigo-600' : 'text-gray-300'}`}>{s.title}</span>
             </div>
         ))}
      </div>

      {/* Alerts */}
      {removedAlerts.length > 0 && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
              <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-start space-x-3 animate-in slide-in-from-top-2">
                  <ShieldAlert className="shrink-0 mt-0.5" />
                  <div className="text-sm font-medium">
                      {removedAlerts.map((msg, i) => <div key={i}>{msg}</div>)}
                  </div>
              </div>
          </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* STEP 1: SAFETY SCREEN */}
        {step === 1 && (
            <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
                <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3">
                    <AlertTriangle className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-900">Safety Screen: Red Flags</h3>
                        <p className="text-sm text-red-700 mt-1">Identify high-risk headaches requiring urgent diagnostic workup (CT/CTA/LP/MRI) before symptomatic treatment.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.keys(redFlags).map((key) => {
                         const labels: Record<string, string> = {
                            thunderclap: "Thunderclap onset (worst of life, max <1 min)",
                            fever: "Fever or Meningismus",
                            focalDeficit: "New focal neurologic deficit",
                            ams: "Altered Mental Status",
                            papilledema: "Papilledema",
                            pregnancyNew: "Pregnancy with new/atypical headache",
                            immunocompromised: "Immunocompromised or Cancer history"
                         };
                         return (
                            <button 
                                key={key}
                                onClick={() => setRedFlags({...redFlags, [key]: !redFlags[key as keyof RedFlags]})}
                                className={`w-full flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all active:scale-[0.99] touch-manipulation text-left ${redFlags[key as keyof RedFlags] ? 'bg-red-100 border-red-300 text-red-900' : 'bg-slate-50 border-gray-200 hover:bg-white'}`}
                            >
                                <span className="font-bold text-base">{labels[key]}</span>
                                <div className={`w-6 h-6 rounded border flex items-center justify-center ${redFlags[key as keyof RedFlags] ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'}`}>
                                    {redFlags[key as keyof RedFlags] && <Check size={16} className="text-white" />}
                                </div>
                            </button>
                         );
                    })}
                </div>

                {Object.values(redFlags).some(v => v) ? (
                    <div className="mt-8 p-5 bg-red-600 text-white rounded-xl shadow-lg animate-in zoom-in-95 text-center">
                        <AlertTriangle size={32} className="mx-auto mb-3" />
                        <h2 className="text-xl font-black mb-2">STOP: Red Flag Headache</h2>
                        <p className="font-medium mb-4">Urgent diagnostic evaluation required.</p>
                        <p className="text-sm opacity-90">Do not proceed with migraine pathway until secondary causes (SAH, Meningitis, Mass, Stroke) are excluded.</p>
                    </div>
                ) : (
                    <div className="mt-8 flex justify-end">
                        <button onClick={() => setStep(2)} className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center">
                            No Red Flags — Continue <ChevronRight size={18} className="ml-2" />
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* STEP 2: CARE SETTING */}
        {step === 2 && (
             <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Triage & Care Setting</h2>
                <div className="grid gap-4">
                    <button onClick={() => setCareSetting('adequate')} className={`text-left p-6 rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation ${careSetting === 'adequate' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-200 hover:border-indigo-200'}`}>
                        <div className="font-bold text-lg">Adequate response to home therapy</div>
                        <p className="text-sm opacity-70 mt-1">Pain manageable, able to tolerate oral fluids.</p>
                    </button>
                    <button onClick={() => setCareSetting('incomplete')} className={`text-left p-6 rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation ${careSetting === 'incomplete' ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-gray-200 hover:border-indigo-200'}`}>
                        <div className="font-bold text-lg">Incomplete / Inconsistent response</div>
                        <p className="text-sm opacity-70 mt-1">Home meds failed, significant pain persists.</p>
                    </button>
                    <button onClick={() => setCareSetting('vomiting')} className={`text-left p-6 rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation ${careSetting === 'vomiting' ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-gray-200 hover:border-indigo-200'}`}>
                        <div className="font-bold text-lg">Severe Nausea / Vomiting</div>
                        <p className="text-sm opacity-70 mt-1">Cannot tolerate oral medications or fluids.</p>
                    </button>
                </div>

                <div className="fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none mt-8 flex justify-between items-center">
                    <div className="w-full max-w-3xl mx-auto flex justify-between items-center">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 font-bold px-4">Back</button>
                        {careSetting === 'adequate' ? (
                            <div className="text-emerald-600 font-bold text-right text-sm md:text-base">Discharge / Outpatient Management.</div>
                        ) : (
                            <button disabled={!careSetting} onClick={() => setStep(3)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center">
                                Proceed to Cocktail <ChevronRight size={18} className="ml-2" />
                            </button>
                        )}
                    </div>
                </div>
             </div>
        )}

        {/* STEP 3: ACUTE TREATMENT */}
        {step === 3 && (
            <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
                 
                 {/* SAFETY PROFILE PANEL */}
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
                     <div className="flex items-center space-x-2 mb-4">
                         <ShieldAlert size={18} className="text-slate-500" />
                         <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Patient Safety Profile</h3>
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1.5">Renal Function</label>
                             <select value={safety.renal} onChange={(e) => setSafety({...safety, renal: e.target.value as RenalStatus})} className="w-full p-4 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-800">
                                 <option value="normal">Normal (&gt;50)</option>
                                 <option value="30-50">eGFR 30–50</option>
                                 <option value="below30">eGFR &lt; 30</option>
                                 <option value="dialysis">Dialysis</option>
                             </select>
                         </div>
                         <div className="flex flex-wrap gap-3">
                             <SafetyToggle label="Pregnant" active={safety.pregnant} onClick={() => setSafety({...safety, pregnant: !safety.pregnant})} />
                             <SafetyToggle label="Age > 65" active={safety.age65} onClick={() => setSafety({...safety, age65: !safety.age65})} />
                             <SafetyToggle label="Weight < 50kg" active={safety.weightLow} onClick={() => setSafety({...safety, weightLow: !safety.weightLow})} />
                             <SafetyToggle label="Uncontrolled DM" active={safety.dm} onClick={() => setSafety({...safety, dm: !safety.dm})} />
                             <SafetyToggle label="Uncontrolled HTN" active={safety.htn} onClick={() => setSafety({...safety, htn: !safety.htn})} />
                             <SafetyToggle label="CV Risk/CAD" active={safety.cvRisk} onClick={() => setSafety({...safety, cvRisk: !safety.cvRisk})} />
                             <SafetyToggle label="Stroke/TIA Hx" active={safety.strokeHistory} onClick={() => setSafety({...safety, strokeHistory: !safety.strokeHistory})} />
                             <SafetyToggle label="Hepatic Impairment" active={safety.hepatic} onClick={() => setSafety({...safety, hepatic: !safety.hepatic})} />
                             <SafetyToggle label="Basilar Migraine" active={safety.basilar} onClick={() => setSafety({...safety, basilar: !safety.basilar})} />
                         </div>
                     </div>
                 </div>

                 {/* HEADACHE COCKTAIL */}
                 <div ref={cocktailRef} className="mb-8">
                     <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 pb-2">
                         <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-black uppercase tracking-wider">Step 1</span>
                         <h3 className="font-bold text-slate-900 text-lg">First-Line Cocktail</h3>
                     </div>
                     
                     <div className="space-y-4">
                         {/* A: Diphenhydramine */}
                         <button 
                            onClick={() => {
                                setCocktail({...cocktail, benadryl: !cocktail.benadryl});
                                // Auto scroll to antiemetic after toggling benadryl
                                setTimeout(() => antiemeticRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                            }} 
                            className="w-full bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between transition-all active:scale-[0.99] touch-manipulation text-left"
                         >
                            <div>
                                <div className="font-bold text-slate-900 text-base">Diphenhydramine</div>
                                <div className="text-sm text-slate-500">25/50 mg PO/IV x1</div>
                                <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Prevents akathisia from antiemetics.</div>
                            </div>
                            <div className={`w-6 h-6 rounded border flex items-center justify-center ${cocktail.benadryl ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                                {cocktail.benadryl && <Check size={16} className="text-white" />}
                            </div>
                         </button>

                         {/* B: Antiemetic */}
                         <div ref={antiemeticRef} className="bg-white p-5 rounded-xl border border-gray-200 scroll-mt-24">
                            <div className="font-bold text-slate-900 mb-3 text-base">Antiemetic (Choose One)</div>
                            <div className="space-y-3">
                                {['metoclopramide', 'prochlorperazine', 'ondansetron'].map((opt) => (
                                    <button 
                                        key={opt} 
                                        onClick={() => {
                                            setCocktail({...cocktail, antiemetic: opt as AntiemeticChoice});
                                            setTimeout(() => ketorolacRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all touch-manipulation active:scale-[0.99] ${cocktail.antiemetic === opt ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                                    >
                                        <div className="flex-1">
                                            <div className="text-base font-bold capitalize flex items-center">
                                                {opt} 
                                                <span className="text-sm opacity-60 ml-1 font-normal">{opt === 'ondansetron' ? '4-8 mg' : '10 mg'}</span>
                                            </div>
                                            {opt === 'metoclopramide' && <div className="text-xs text-slate-500 mt-1">First-line dopamine antagonist. May repeat q8h.</div>}
                                            {opt === 'prochlorperazine' && <div className="text-xs text-slate-500 mt-1">Alternative dopamine antagonist. May repeat q8h.</div>}
                                            {opt === 'ondansetron' && <div className="text-xs text-amber-600 mt-1 font-bold">Use for allergy/QT risk. Less effective for pain. May repeat q8h.</div>}
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-3 ${cocktail.antiemetic === opt ? 'border-indigo-600' : 'border-slate-300'}`}>
                                            {cocktail.antiemetic === opt && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                         </div>

                         {/* C: Ketorolac */}
                         <div ref={ketorolacRef} className={`bg-white p-5 rounded-xl border border-gray-200 scroll-mt-24 ${checkEligibility('ketorolac').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-slate-900 text-base">Ketorolac (Toradol)</div>
                                    <div className="text-xs text-indigo-600 font-bold mt-0.5">NSAID. Targets prostaglandin-mediated pain. May repeat q8h (Max 2 doses).</div>
                                </div>
                                {checkEligibility('ketorolac').disabled && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('ketorolac').reason}</span>}
                             </div>
                             {!checkEligibility('ketorolac').disabled && (
                                 <div className="flex gap-3">
                                     {(['15', '30', '45'] as KetorolacDose[]).map(dose => {
                                         if (!dose) return null;
                                         if (dose === '45' && (safety.age65 || safety.weightLow)) return null;
                                         return (
                                             <button 
                                                key={dose} 
                                                onClick={() => {
                                                    setCocktail({...cocktail, ketorolac: dose});
                                                    setTimeout(() => dexRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                                                }}
                                                className={`flex-1 py-3 text-sm font-bold rounded-lg border transition-all touch-manipulation ${cocktail.ketorolac === dose ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-gray-200 hover:bg-white'}`}
                                             >
                                                 {dose} mg
                                             </button>
                                         );
                                     })}
                                 </div>
                             )}
                         </div>

                         {/* D: Dexamethasone */}
                         <div ref={dexRef} className={`bg-white p-5 rounded-xl border border-gray-200 scroll-mt-24 ${checkEligibility('dexamethasone').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-slate-900 text-base">Dexamethasone</div>
                                    <div className="text-xs text-indigo-600 font-bold mt-0.5">Prevents recurrence (rebound) within 72h. Single dose only.</div>
                                </div>
                                {checkEligibility('dexamethasone').disabled && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('dexamethasone').reason}</span>}
                             </div>
                             {!checkEligibility('dexamethasone').disabled && (
                                 <div className="flex gap-3">
                                     {(['4', '10'] as DexDose[]).map(dose => (
                                         <button 
                                            key={dose} 
                                            onClick={() => {
                                                setCocktail({...cocktail, dexamethasone: dose});
                                                setTimeout(() => addonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                                            }}
                                            className={`flex-1 py-3 text-sm font-bold rounded-lg border transition-all touch-manipulation ${cocktail.dexamethasone === dose ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-gray-200 hover:bg-white'}`}
                                         >
                                             {dose} mg
                                         </button>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* ADD ONS */}
                 <div ref={addonsRef} className="mb-8 scroll-mt-24">
                     <div className="flex items-center space-x-2 mb-4 border-b border-gray-100 pb-2">
                         <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs font-black uppercase tracking-wider">Step 2</span>
                         <h3 className="font-bold text-slate-900 text-lg">First-Line Add-Ons</h3>
                     </div>
                     <div className="space-y-4">
                         
                         {/* Sumatriptan */}
                         <div className={`bg-white p-5 rounded-xl border border-gray-200 ${checkEligibility('sumatriptan').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <div className="font-bold text-slate-900">Sumatriptan 6mg Subcutaneous</div>
                                    <div className="text-xs text-slate-500">Fastest onset triptan. Avoid in CAD/Stroke/Pregnancy.</div>
                                 </div>
                                 {checkEligibility('sumatriptan').disabled ? (
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('sumatriptan').reason}</span>
                                 ) : (
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${firstLineAddOns.sumatriptan ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`} onClick={() => setFirstLineAddOns({...firstLineAddOns, sumatriptan: !firstLineAddOns.sumatriptan})}>
                                        {firstLineAddOns.sumatriptan && <Check size={16} className="text-white" />}
                                    </div>
                                 )}
                             </div>
                         </div>

                         {/* Magnesium */}
                         <div className={`bg-white p-5 rounded-xl border border-gray-200 ${checkEligibility('magnesium').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                     <div className="font-bold text-slate-900">Magnesium Sulfate IV</div>
                                     <div className="text-xs text-slate-500">Beneficial for aura/photophobia.</div>
                                     {checkEligibility('magnesium').warning && <div className="text-xs text-amber-600 font-bold mt-1">{checkEligibility('magnesium').warning}</div>}
                                 </div>
                                 {checkEligibility('magnesium').disabled && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('magnesium').reason}</span>}
                             </div>
                             {!checkEligibility('magnesium').disabled && (
                                 <div className="flex gap-3">
                                     {(['1', '2'] as MagDose[]).map(dose => (
                                         <button key={dose} onClick={() => setFirstLineAddOns({...firstLineAddOns, magnesium: dose})} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${firstLineAddOns.magnesium === dose ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-gray-200 hover:bg-white'}`}>{dose} g</button>
                                     ))}
                                     <button onClick={() => setFirstLineAddOns({...firstLineAddOns, magnesium: null})} className={`px-4 py-2 text-sm font-bold rounded-lg border ${!firstLineAddOns.magnesium ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-400'}`}>None</button>
                                 </div>
                             )}
                         </div>

                         {/* Valproate */}
                         <div className={`bg-white p-5 rounded-xl border border-gray-200 ${checkEligibility('valproate').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                     <div className="font-bold text-slate-900">Valproate (Depacon) IV</div>
                                     <div className="text-xs text-slate-500">Highly effective. Contraindicated in pregnancy.</div>
                                 </div>
                                 {checkEligibility('valproate').disabled && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('valproate').reason}</span>}
                             </div>
                             {!checkEligibility('valproate').disabled && (
                                 <div className="flex gap-3">
                                     {(['500', '1000'] as ValproateDose[]).map(dose => (
                                         <button key={dose} onClick={() => setFirstLineAddOns({...firstLineAddOns, valproate: dose})} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${firstLineAddOns.valproate === dose ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-gray-200 hover:bg-white'}`}>{dose} mg</button>
                                     ))}
                                     <button onClick={() => setFirstLineAddOns({...firstLineAddOns, valproate: null})} className={`px-4 py-2 text-sm font-bold rounded-lg border ${!firstLineAddOns.valproate ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-400'}`}>None</button>
                                 </div>
                             )}
                         </div>

                     </div>
                 </div>

                 <div className="fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none flex justify-between items-center">
                    <div className="w-full max-w-3xl mx-auto flex justify-between items-center">
                        <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-600 font-bold px-4">Back</button>
                        <button onClick={() => setStep(4)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center">
                            Administer & Check Response <ChevronRight size={18} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 4: RESPONSE */}
        {step === 4 && (
            <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center mb-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Patient Status (1 hour post-cocktail)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={() => { setResponseImproved(true); setStep(5); }}
                            className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group"
                        >
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Check size={24} />
                            </div>
                            <div className="font-black text-emerald-900 text-lg">Improved</div>
                            <div className="text-emerald-700 text-sm">Pain manageable, nausea resolved.</div>
                        </button>
                        <button 
                            onClick={() => { setResponseImproved(false); }}
                            className={`p-6 border-2 rounded-2xl hover:shadow-lg transition-all group ${responseImproved === false ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-slate-50 border-gray-200 hover:border-indigo-500'}`}
                        >
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="font-black text-slate-900 text-lg">Refractory</div>
                            <div className="text-slate-500 text-sm">Significant pain or vomiting persists.</div>
                        </button>
                    </div>
                </div>

                {responseImproved === false && (
                    <div className="animate-in slide-in-from-bottom-4">
                        <div className="flex items-center space-x-2 mb-4">
                             <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-black uppercase tracking-wider">Step 3</span>
                             <h3 className="font-bold text-slate-900 text-lg">Second-Line Rescue</h3>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 mb-4">
                                If not used in Step 1, consider adding these agents now. If already used, consider admission or Neurology Consult.
                            </div>
                            
                             {/* Magnesium Rescue */}
                             {!firstLineAddOns.magnesium && !checkEligibility('magnesium').disabled && (
                                 <div className="bg-white p-5 rounded-xl border border-gray-200">
                                     <div className="flex justify-between items-center">
                                         <div className="font-bold text-slate-900">Magnesium Sulfate 2g IV</div>
                                         <button onClick={() => setSecondLine({...secondLine, magnesium: secondLine.magnesium ? null : '2'})} className={`px-4 py-2 rounded-lg font-bold text-sm ${secondLine.magnesium ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                             {secondLine.magnesium ? 'Selected' : 'Select'}
                                         </button>
                                     </div>
                                 </div>
                             )}

                             {/* Valproate Rescue */}
                             {!firstLineAddOns.valproate && !checkEligibility('valproate').disabled && (
                                 <div className="bg-white p-5 rounded-xl border border-gray-200">
                                     <div className="flex justify-between items-center">
                                         <div className="font-bold text-slate-900">Valproate 1000mg IV</div>
                                         <button onClick={() => setSecondLine({...secondLine, valproate: secondLine.valproate ? null : '1000'})} className={`px-4 py-2 rounded-lg font-bold text-sm ${secondLine.valproate ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                             {secondLine.valproate ? 'Selected' : 'Select'}
                                         </button>
                                     </div>
                                 </div>
                             )}
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setStep(5)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                                Finalize Plan <ChevronRight size={18} className="ml-2" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* STEP 5: PLAN */}
        {step === 5 && (
            <div className="p-6 md:p-8 animate-in zoom-in-95">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-lg"><ClipboardCheck size={24} /></div>
                            <h2 className="text-2xl font-black">Treatment Plan</h2>
                        </div>
                        <div className="space-y-4 opacity-90 text-sm md:text-base font-mono">
                            {generateSummary().split('\n').map((line, i) => (
                                <div key={i} className={line.startsWith('-') ? 'ml-4' : 'font-bold mt-4 first:mt-0'}>{line}</div>
                            ))}
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={copySummary} className="py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center active:scale-95">
                        <Copy size={18} className="mr-2" /> Copy to Clipboard
                    </button>
                    <button onClick={handleReset} className="py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center">
                        <RotateCcw size={18} className="mr-2" /> Start Over
                    </button>
                </div>
            </div>
        )}

      </div>
      
      {/* Disclaimer Footer */}
      <div className="mt-8 text-center text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          <p className="font-bold mb-1">DECISION SUPPORT ONLY</p>
          <p>This tool is based on standard emergency neurology guidelines (AHS/AAN). Individual patient factors (allergies, interactions) must be verified by the treating clinician.</p>
      </div>
      {showFavToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {isFav ? 'Saved to Favorites' : 'Removed from Favorites'}
        </div>
      )}
    </div>
  );
};

export default MigrainePathway;
