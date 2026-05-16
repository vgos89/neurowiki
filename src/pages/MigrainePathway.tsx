
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, RotateCcw, Copy, AlertTriangle, ChevronRight, Skull, ShieldAlert, AlertCircle, ClipboardCheck, Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';

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
type KetorolacDose = '15' | '30' | '60' | null;
type DexDose = '8' | '10' | '16' | null;
type ValproateDose = '500' | '800' | '1000' | null;
type MagDose = '1' | '2' | null;
type ChlorpromazineDose = '12.5' | '25' | null;

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
    gonb: boolean;
}

interface SecondLineState {
    magnesium: MagDose;
    valproate: ValproateDose;
    chlorpromazine: ChlorpromazineDose;
    gonbRescue: boolean;
    dheAdmit: boolean;
}

interface DifferentialState {
    clusterPhenotype: boolean;
    indomethacinResponsive: boolean;
    trigeminalNeuralgia: boolean;
    statusMigrainosus: boolean;
}

interface MohScreenState {
    headacheDaysHigh: boolean;
    acuteMedOveruse: boolean;
}

const STEPS = [
  { id: 1, title: "Safety Screen" },
  { id: 2, title: "Care Setting" },
  { id: 3, title: "Acute TX" },
  { id: 4, title: "Response" },
  { id: 5, title: "Plan" }
];

const MigrainePathway: React.FC = () => {
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'migraine-pathway',
      title: 'Migraine Pathway',
      subtitle: 'ED and inpatient acute headache management',
      category: 'severe-headache',
      trail: '5 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [step, setStep] = useState(1);
  const { handleBack, getBackLabel } = useNavigationSource();
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
      antiemetic: 'prochlorperazine',
      ketorolac: '30',
      dexamethasone: '10'
  });

  const [firstLineAddOns, setFirstLineAddOns] = useState<AddOnsState>({
      sumatriptan: false,
      magnesium: null,
      valproate: null,
      gonb: false
  });

  const [responseImproved, setResponseImproved] = useState<boolean | null>(null);

  const [secondLine, setSecondLine] = useState<SecondLineState>({
      magnesium: null,
      valproate: null,
      chlorpromazine: null,
      gonbRescue: false,
      dheAdmit: false
  });

  // Step-0 differential routing (B8) + branch screens (B1, B3, B4, B5)
  const [differential, setDifferential] = useState<DifferentialState>({
      clusterPhenotype: false,
      indomethacinResponsive: false,
      trigeminalNeuralgia: false,
      statusMigrainosus: false
  });

  // MOH discharge screen (B2)
  const [mohScreen, setMohScreen] = useState<MohScreenState>({
      headacheDaysHigh: false,
      acuteMedOveruse: false
  });

  const [copyToast, setCopyToast] = useState(false);

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
              // Pregnancy: WARNING only — Burch 2024 Table 3-5 lists triptans as first line for rescue in pregnancy.
              if (safety.pregnant) { warning = "Pregnancy — first line for rescue per Burch 2024 Table 3-5. Do not select as initial agent. Discuss with OB / maternal-fetal medicine."; }
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
    setCocktail({ benadryl: true, antiemetic: 'prochlorperazine', ketorolac: '30', dexamethasone: '10' });
    setFirstLineAddOns({ sumatriptan: false, magnesium: null, valproate: null, gonb: false });
    setResponseImproved(null);
    setSecondLine({ magnesium: null, valproate: null, chlorpromazine: null, gonbRescue: false, dheAdmit: false });
    setDifferential({ clusterPhenotype: false, indomethacinResponsive: false, trigeminalNeuralgia: false, statusMigrainosus: false });
    setMohScreen({ headacheDaysHigh: false, acuteMedOveruse: false });
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
      if (firstLineAddOns.gonb) lines.push("- Greater Occipital Nerve Block (GONB): 0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral to pain side");

      if (responseImproved === false) {
          lines.push("\nSECOND-LINE (Refractory > 2h):");
          if (secondLine.magnesium) lines.push(`- Magnesium Sulfate ${secondLine.magnesium} g IV x1`);
          if (secondLine.valproate) lines.push(`- Valproate ${secondLine.valproate} mg IV over 15m x1 (Repeat 500mg q8h PRN, Max 3 doses)`);
          if (secondLine.chlorpromazine) lines.push(`- Chlorpromazine ${secondLine.chlorpromazine} mg IV x1 (Pre-medicate with 500 mL NS; monitor for orthostatic hypotension)`);
          if (secondLine.gonbRescue) lines.push("- Greater Occipital Nerve Block (GONB): 0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral");
          if (secondLine.dheAdmit) lines.push("- ADMIT trigger: DHE 0.5–1 mg IV + metoclopramide IV q8h (Burch 2024 p.360 inpatient protocol)");
          if (!secondLine.magnesium && !secondLine.valproate && !secondLine.chlorpromazine && !secondLine.gonbRescue && !secondLine.dheAdmit) {
              lines.push("- Consider admission / Neurology Consult");
          }
      }

      // MOH discharge counseling (B2)
      if (mohScreen.headacheDaysHigh && mohScreen.acuteMedOveruse) {
          lines.push("\nMOH DISCHARGE COUNSELING (Rizzoli 2024, ICHD-3 8.2):");
          lines.push("- Medication-Overuse Headache screen POSITIVE");
          lines.push("- Withdraw overused agent + initiate preventive therapy");
          lines.push("- Bridge: naproxen 550 mg BID x 2–4 wks OR prednisone taper");
          lines.push("- Outpatient headache follow-up within 2 weeks");
      }

      // Status migrainosus inpatient banner (B5)
      if (differential.statusMigrainosus) {
          lines.push("\nSTATUS MIGRAINOSUS (≥72 h, Burch 2024 / ICHD-3):");
          lines.push("- Inpatient admission for repetitive DHE + metoclopramide IV q8h is reasonable");
          lines.push("- Robblee 2025: DHE Level U — needs better quality ED-specific studies");
      }

      let text = `MIGRAINE PATHWAY ORDERS\n\n${lines.join('\n')}`;
      if (contraindications.length > 0) {
          text += `\n\nContraindications Applied:\n${contraindications.join('\n')}`;
      }
      return text;
  };

  const copySummary = () => {
    navigator.clipboard.writeText(generateSummary());
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
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
            <button type="button" onClick={handleBack} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-neuro-500 mb-6 group cursor-pointer bg-transparent border-0 p-0">
                <div className="bg-white p-1.5 rounded-md border border-slate-200 mr-2 shadow-sm group-hover:shadow-md transition-all">
                    <ArrowLeft size={16} />
                </div>
                {getBackLabel()}
            </button>
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-neuro-100 text-neuro-700 rounded-lg">
                    <Skull size={24} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Acute Migraine Pathway</h1>
            </div>
            <p className="text-slate-500 font-medium">"Headache Cocktail" algorithm for ED and inpatient headache management.</p>
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
                 <div className={`w-full h-1 absolute top-1/2 -translate-y-1/2 -z-10 ${s.id === 1 ? 'hidden' : ''} ${step >= s.id ? 'bg-neuro-500' : 'bg-slate-200'}`}></div>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors z-10 ${
                     step === s.id ? 'bg-white border-neuro-500 text-neuro-600' : 
                     step > s.id ? 'bg-neuro-500 border-neuro-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
                 }`}>
                     {step > s.id ? <Check size={14} /> : s.id}
                 </div>
                 <span className={`hidden sm:block text-[10px] mt-2 font-bold uppercase tracking-wider ${step === s.id ? 'text-neuro-600' : 'text-slate-300'}`}>{s.title}</span>
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
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
                                className={`w-full flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all active:scale-[0.99] touch-manipulation text-left ${redFlags[key as keyof RedFlags] ? 'bg-red-100 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}
                            >
                                <span className="font-bold text-base">{labels[key]}</span>
                                <div className={`w-6 h-6 rounded border flex items-center justify-center ${redFlags[key as keyof RedFlags] ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
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
                        <button onClick={() => setStep(2)} className="w-full md:w-auto px-8 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center justify-center">
                            No Red Flags — Continue <ChevronRight size={18} className="ml-2" />
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* STEP 2: DIFFERENTIAL ROUTING + CARE SETTING */}
        {step === 2 && (
             <div className="p-6 md:p-8 animate-in slide-in-from-right-4">

                {/* B8: Step-0 differential routing — 4-option screen */}
                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-900 mb-3">Differential Routing</h3>
                    <p className="text-xs text-slate-500 mb-4">Select the dominant phenotype. Default = migraine; non-migraine selections route to a distinct protocol.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={() => setDifferential({ clusterPhenotype: false, indomethacinResponsive: false, trigeminalNeuralgia: false, statusMigrainosus: differential.statusMigrainosus })}
                            className={`text-left p-4 rounded-xl border-2 transition-all touch-manipulation ${!differential.clusterPhenotype && !differential.indomethacinResponsive && !differential.trigeminalNeuralgia ? 'border-neuro-500 bg-neuro-50' : 'border-slate-200 bg-white'}`}>
                            <div className="font-bold text-sm text-slate-900">Migraine — proceed</div>
                            <div className="text-xs text-slate-500 mt-1">Default acute-headache pathway.</div>
                        </button>
                        <button
                            onClick={() => setDifferential({ clusterPhenotype: true, indomethacinResponsive: false, trigeminalNeuralgia: false, statusMigrainosus: false })}
                            className={`text-left p-4 rounded-xl border-2 transition-all touch-manipulation ${differential.clusterPhenotype ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                            <div className="font-bold text-sm text-slate-900">Cluster features</div>
                            <div className="text-xs text-slate-500 mt-1">Unilateral orbital/temporal + autonomic features + restlessness, 15–180 min attacks.</div>
                        </button>
                        <button
                            onClick={() => setDifferential({ clusterPhenotype: false, indomethacinResponsive: false, trigeminalNeuralgia: true, statusMigrainosus: false })}
                            className={`text-left p-4 rounded-xl border-2 transition-all touch-manipulation ${differential.trigeminalNeuralgia ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                            <div className="font-bold text-sm text-slate-900">TN features</div>
                            <div className="text-xs text-slate-500 mt-1">Paroxysmal electric-shock pain in trigeminal distribution, triggered by light touch/chewing.</div>
                        </button>
                        <button
                            onClick={() => setDifferential({ clusterPhenotype: false, indomethacinResponsive: true, trigeminalNeuralgia: false, statusMigrainosus: differential.statusMigrainosus })}
                            className={`text-left p-4 rounded-xl border-2 transition-all touch-manipulation ${differential.indomethacinResponsive ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                            <div className="font-bold text-sm text-slate-900">Indomethacin-responsive features</div>
                            <div className="text-xs text-slate-500 mt-1">Side-locked unilateral pain + cranial autonomic features (PH or HC).</div>
                        </button>
                    </div>

                    {/* Status migrainosus duration screen (B5) — orthogonal toggle */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={differential.statusMigrainosus}
                                onChange={() => setDifferential({...differential, statusMigrainosus: !differential.statusMigrainosus})}
                                className="mt-1"
                            />
                            <div>
                                <div className="font-bold text-sm text-slate-900">Current attack duration ≥72 hours (status migrainosus)</div>
                                <div className="text-xs text-slate-500 mt-1">Triggers admit advisory for repetitive DHE + metoclopramide IV q8h (Burch 2024 p.360, ICHD-3).</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* B1: Cluster terminal card */}
                {differential.clusterPhenotype && (
                    <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                        <h3 className="font-black text-amber-900 mb-2">Cluster Headache — Distinct Acute Protocol</h3>
                        <p className="text-xs text-amber-800 mb-4">Burish 2024 Table 6-3. AHS Grade A first-line triad. Migraine cocktail not indicated.</p>
                        <div className="space-y-3">
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                                <div className="font-bold text-slate-900 text-sm">Oxygen 6–12 L/min via non-rebreather mask (NRB) × 15 min</div>
                                <div className="text-xs text-slate-500 mt-1">AHS Grade A first-line. Per Burish 2024 p.401, 15 L/min may be more effective in some patients. Use the 6–12 L/min range as the starting standard.</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                                <div className="font-bold text-slate-900 text-sm">Sumatriptan 6 mg SC</div>
                                <div className="text-xs text-slate-500 mt-1">AHS Grade A. Same triptan-class contraindications as migraine (CV, HTN, stroke history; pregnancy warning).</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                                <div className="font-bold text-slate-900 text-sm">Zolmitriptan nasal 5–10 mg</div>
                                <div className="text-xs text-slate-500 mt-1">AHS Grade A. Same triptan-class contraindications.</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-amber-200">
                                <div className="font-bold text-slate-900 text-sm">Bridge / preventive (outpatient)</div>
                                <div className="text-xs text-slate-500 mt-1">Bridge: prednisone 100 mg/day × 5 days then taper −20 mg q3d; OR ipsilateral GON injection with steroid. Preventive: verapamil 360 mg/day TID with ECG monitoring.</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* B4: Trigeminal-neuralgia terminal card */}
                {differential.trigeminalNeuralgia && (
                    <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                        <h3 className="font-black text-amber-900 mb-2">Trigeminal Neuralgia — Route Out</h3>
                        <p className="text-xs text-amber-800 mb-4">Nahas 2024 Table 10-2. Migraine cocktail not indicated.</p>
                        <div className="bg-white p-4 rounded-lg border border-amber-200 space-y-2">
                            <div className="text-sm text-slate-900"><span className="font-bold">First-line:</span> carbamazepine 300–800 mg/day (only FDA-approved).</div>
                            <div className="text-sm text-slate-900"><span className="font-bold">Alternative:</span> oxcarbazepine 600–1200 mg/day.</div>
                            <div className="text-sm text-slate-900"><span className="font-bold">Acute exacerbations:</span> IV fosphenytoin or IV lidocaine.</div>
                            <div className="text-sm text-red-700 font-bold">Avoid opioids.</div>
                            <div className="text-xs text-slate-500 mt-2">Refer to outpatient neurology.</div>
                        </div>
                    </div>
                )}

                {/* B3: Indomethacin-responsive advisory (non-blocking) */}
                {differential.indomethacinResponsive && (
                    <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5">
                        <h3 className="font-bold text-amber-900 mb-2">Indomethacin-Responsive Headache — Advisory</h3>
                        <p className="text-xs text-amber-800 mb-3">Consider paroxysmal hemicrania or hemicrania continua per Goadsby 2024. Migraine cocktail may still be appropriate acutely; flag for neurology follow-up.</p>
                        <div className="bg-white p-3 rounded-lg border border-amber-200 text-sm text-slate-900">
                            <div className="font-bold mb-1">Outpatient indomethacin trial (with PPI)</div>
                            <div className="text-xs text-slate-600">25 mg TID → 50 mg TID → 75 mg TID. Adult dose 150–225 mg/day total with PPI.</div>
                        </div>
                    </div>
                )}

                {/* B5: Status migrainosus admit advisory */}
                {differential.statusMigrainosus && (
                    <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5">
                        <h3 className="font-bold text-amber-900 mb-2">Status Migrainosus — Admit Advisory</h3>
                        <p className="text-xs text-amber-800">Burch 2024 p.358–360 (ICHD-3): debilitating migraine ≥72 h. Inpatient admission for repetitive DHE + metoclopramide IV q8h is reasonable. Robblee 2025: DHE Level U — needs better quality ED-specific studies. The cocktail below remains valid first-line.</p>
                    </div>
                )}

                {/* Care setting: only show if not a terminal route-out */}
                {!differential.clusterPhenotype && !differential.trigeminalNeuralgia && (
                    <>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Triage & Care Setting</h2>
                        <div className="grid gap-4">
                            <button onClick={() => setCareSetting('adequate')} className={`text-left p-6 rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation ${careSetting === 'adequate' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 hover:border-neuro-200'}`}>
                                <div className="font-bold text-lg">Adequate response to home therapy</div>
                                <p className="text-sm opacity-70 mt-1">Pain manageable, able to tolerate oral fluids.</p>
                            </button>
                            <button onClick={() => setCareSetting('incomplete')} className={`text-left p-6 rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation ${careSetting === 'incomplete' ? 'border-neuro-500 bg-neuro-50 text-neuro-900' : 'border-slate-200 hover:border-neuro-200'}`}>
                                <div className="font-bold text-lg">Incomplete / Inconsistent response</div>
                                <p className="text-sm opacity-70 mt-1">Home meds failed, significant pain persists.</p>
                            </button>
                            <button onClick={() => setCareSetting('vomiting')} className={`text-left p-6 rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation ${careSetting === 'vomiting' ? 'border-neuro-500 bg-neuro-50 text-neuro-900' : 'border-slate-200 hover:border-neuro-200'}`}>
                                <div className="font-bold text-lg">Severe Nausea / Vomiting</div>
                                <p className="text-sm opacity-70 mt-1">Cannot tolerate oral medications or fluids.</p>
                            </button>
                        </div>

                        {/* B8: Outpatient acute-treatment summary card on adequate exit (AHS 2021) */}
                        {careSetting === 'adequate' && (
                            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-xs text-emerald-900">
                                <div className="font-bold mb-2">Outpatient Acute Treatment (AHS 2021 p.1023, Burch 2024 Table 3-3)</div>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Mild-to-moderate: NSAIDs / acetaminophen / non-opioid analgesics / caffeine combos.</li>
                                    <li>Moderate-severe or NSAID-refractory: triptans (sumatriptan PO 25/50/100 mg, max 200 mg/24 h; rizatriptan 5/10 mg; eletriptan 20/40 mg; zolmitriptan 2.5/5 mg).</li>
                                    <li>Vascular disease or triptan-intolerant: gepants (ubrogepant 50/100 mg PO; rimegepant 75 mg ODT) or ditans (lasmiditan 50/100/200 mg PO — no driving × 8 h).</li>
                                </ul>
                            </div>
                        )}
                    </>
                )}

                <div className="fixed bottom-[4.5rem] md:static left-0 right-0 bg-white/95 backdrop-blur md:bg-transparent p-4 md:p-0 border-t md:border-0 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none mt-8 flex justify-between items-center">
                    <div className="w-full max-w-3xl mx-auto flex justify-between items-center">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 font-bold px-4">Back</button>
                        {(differential.clusterPhenotype || differential.trigeminalNeuralgia) ? (
                            <div className="text-amber-700 font-bold text-right text-sm md:text-base">Terminal route-out — see protocol above.</div>
                        ) : careSetting === 'adequate' ? (
                            <div className="text-emerald-600 font-bold text-right text-sm md:text-base">Discharge / Outpatient Management.</div>
                        ) : (
                            <button disabled={!careSetting} onClick={() => setStep(3)} className="px-8 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center">
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
                     <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-2">
                         <span className="bg-neuro-600 text-white px-2 py-1 rounded text-xs font-black uppercase tracking-wider">Step 1</span>
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
                            className="w-full bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between transition-all active:scale-[0.99] touch-manipulation text-left"
                         >
                            <div>
                                <div className="font-bold text-slate-900 text-base">Diphenhydramine</div>
                                <div className="text-sm text-slate-500">25/50 mg PO/IV x1</div>
                                <div className="text-[10px] text-neuro-600 font-bold mt-0.5">Prevents akathisia from antiemetics.</div>
                            </div>
                            <div className={`w-6 h-6 rounded border flex items-center justify-center ${cocktail.benadryl ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`}>
                                {cocktail.benadryl && <Check size={16} className="text-white" />}
                            </div>
                         </button>

                         {/* B: Antiemetic */}
                         <div ref={antiemeticRef} className="bg-white p-5 rounded-xl border border-slate-200 scroll-mt-24">
                            <div className="font-bold text-slate-900 mb-3 text-base">Antiemetic (Choose One)</div>
                            <div className="space-y-3">
                                {['prochlorperazine', 'metoclopramide', 'ondansetron'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setCocktail({...cocktail, antiemetic: opt as AntiemeticChoice});
                                            setTimeout(() => ketorolacRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all touch-manipulation active:scale-[0.99] ${cocktail.antiemetic === opt ? 'bg-neuro-50 border-neuro-200' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}
                                    >
                                        <div className="flex-1">
                                            <div className="text-base font-bold capitalize flex items-center">
                                                {opt}
                                                <span className="text-sm opacity-60 ml-1 font-normal">{opt === 'ondansetron' ? '4-8 mg' : '10 mg'}</span>
                                            </div>
                                            {opt === 'prochlorperazine' && <div className="text-xs text-slate-500 mt-1">Robblee 2025 Level A — Must Offer. First-line ED antiemetic for acute migraine. May repeat q8h. Anticholinergic premed (diphenhydramine 25–50 mg) reduces akathisia/EPS.</div>}
                                            {opt === 'metoclopramide' && <div className="text-xs text-slate-500 mt-1">Robblee 2025 Level B — Should Offer. Use if prochlorperazine unavailable or contraindicated. May repeat q8h. Anticholinergic premed reduces akathisia.</div>}
                                            {opt === 'ondansetron' && <div className="text-xs text-amber-600 mt-1 font-bold">Anti-nausea adjunct only — Burch 2024: not effective as a migraine analgesic. Use when QT prolongation risk excludes dopamine antagonists. May repeat q8h.</div>}
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-3 ${cocktail.antiemetic === opt ? 'border-neuro-600' : 'border-slate-300'}`}>
                                            {cocktail.antiemetic === opt && <div className="w-3 h-3 bg-neuro-600 rounded-full"></div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                         </div>

                         {/* C: Ketorolac */}
                         <div ref={ketorolacRef} className={`bg-white p-5 rounded-xl border border-slate-200 scroll-mt-24 ${checkEligibility('ketorolac').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-slate-900 text-base">Ketorolac (Toradol)</div>
                                    <div className="text-xs text-neuro-600 font-bold mt-0.5">NSAID. Robblee 2025 Level B (30–60 mg IV). May repeat q8h (Max 2 doses). 60 mg hidden for age &gt;65 or weight &lt;50 kg.</div>
                                </div>
                                {checkEligibility('ketorolac').disabled && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('ketorolac').reason}</span>}
                             </div>
                             {!checkEligibility('ketorolac').disabled && (
                                 <div className="flex gap-3">
                                     {(['15', '30', '60'] as KetorolacDose[]).map(dose => {
                                         if (!dose) return null;
                                         if (dose === '60' && (safety.age65 || safety.weightLow)) return null;
                                         return (
                                             <button 
                                                key={dose} 
                                                onClick={() => {
                                                    setCocktail({...cocktail, ketorolac: dose});
                                                    setTimeout(() => dexRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                                                }}
                                                className={`flex-1 py-3 text-sm font-bold rounded-lg border transition-all touch-manipulation ${cocktail.ketorolac === dose ? 'bg-neuro-600 text-white border-neuro-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'}`}
                                             >
                                                 {dose} mg
                                             </button>
                                         );
                                     })}
                                 </div>
                             )}
                         </div>

                         {/* D: Dexamethasone */}
                         <div ref={dexRef} className={`bg-white p-5 rounded-xl border border-slate-200 scroll-mt-24 ${checkEligibility('dexamethasone').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-slate-900 text-base">Dexamethasone</div>
                                    <div className="text-xs text-neuro-600 font-bold mt-0.5">Robblee 2025 Level B — Should Offer for recurrence prevention (Burch 2024 reference dose 10 mg IV). 8–16 mg range per Robblee Table 2. Single dose only.</div>
                                </div>
                                {checkEligibility('dexamethasone').disabled && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('dexamethasone').reason}</span>}
                             </div>
                             {!checkEligibility('dexamethasone').disabled && (
                                 <div className="flex gap-3">
                                     {(['8', '10', '16'] as DexDose[]).map(dose => (
                                         <button 
                                            key={dose} 
                                            onClick={() => {
                                                setCocktail({...cocktail, dexamethasone: dose});
                                                setTimeout(() => addonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
                                            }}
                                            className={`flex-1 py-3 text-sm font-bold rounded-lg border transition-all touch-manipulation ${cocktail.dexamethasone === dose ? 'bg-neuro-600 text-white border-neuro-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'}`}
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
                     <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-2">
                         <span className="bg-slate-600 text-white px-2 py-1 rounded text-xs font-black uppercase tracking-wider">Step 2</span>
                         <h3 className="font-bold text-slate-900 text-lg">First-Line Add-Ons</h3>
                     </div>
                     <div className="space-y-4">
                         
                         {/* CV-disease vasoconstrictor-free routing banner (B6) */}
                         {(safety.cvRisk || safety.strokeHistory) && (
                             <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                                 <div className="font-bold mb-1">Vascular disease present</div>
                                 <p>Triptans and DHE contraindicated. Outpatient alternatives (no vasoconstriction): ubrogepant 50/100 mg PO, rimegepant 75 mg ODT, lasmiditan 50/100/200 mg PO (no driving × 8 h). Not formulary-IV — flag for outpatient initiation. AHS 2021 Consensus p.1025; Burch 2024 p.352.</p>
                             </div>
                         )}

                         {/* Pregnancy first-line panel banner (B7) */}
                         {safety.pregnant && (
                             <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-xs text-pink-900">
                                 <div className="font-bold mb-1">Pregnancy — Burch 2024 Table 3-5</div>
                                 <p>First-line: acetaminophen 1000 mg PO, diphenhydramine 25–50 mg PO/IV, metoclopramide 10 mg IV (Level B + safe in pregnancy). First line for rescue: sumatriptan (warning, not exclusion). Second-line: ondansetron, prednisone rescue, prochlorperazine. Always avoid: ergots/DHE, valproate (teratogenic), gepants, lasmiditan.</p>
                             </div>
                         )}

                         {/* Sumatriptan (A5: 3-way render — disabled / warning / selectable) */}
                         <div className={`bg-white p-5 rounded-xl border border-slate-200 ${checkEligibility('sumatriptan').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <div className="font-bold text-slate-900">Sumatriptan 6mg Subcutaneous</div>
                                    <div className="text-xs text-slate-500">Fastest onset triptan. Avoid in CAD/Stroke/Uncontrolled HTN/Basilar migraine.</div>
                                    {!checkEligibility('sumatriptan').disabled && checkEligibility('sumatriptan').warning && (
                                        <div className="text-xs text-amber-700 font-bold mt-1">{checkEligibility('sumatriptan').warning}</div>
                                    )}
                                 </div>
                                 {checkEligibility('sumatriptan').disabled ? (
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('sumatriptan').reason}</span>
                                 ) : (
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${firstLineAddOns.sumatriptan ? 'bg-neuro-600 border-neuro-600' : checkEligibility('sumatriptan').warning ? 'bg-white border-amber-400' : 'bg-white border-slate-300'}`} onClick={() => setFirstLineAddOns({...firstLineAddOns, sumatriptan: !firstLineAddOns.sumatriptan})}>
                                        {firstLineAddOns.sumatriptan && <Check size={16} className="text-white" />}
                                    </div>
                                 )}
                             </div>
                         </div>

                         {/* GONB (A1: Robblee 2025 Level A — Must Offer) */}
                         <div className="bg-white p-5 rounded-xl border border-slate-200">
                             <div className="flex justify-between items-start mb-2">
                                 <div>
                                     <div className="font-bold text-slate-900">Greater Occipital Nerve Block (GONB)</div>
                                     <div className="text-xs text-slate-500">0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral to pain side.</div>
                                     <div className="text-[10px] text-neuro-700 font-bold mt-1">Robblee 2025 Level A — Must Offer. Effective for both migraine and cluster.</div>
                                     {safety.pregnant && firstLineAddOns.gonb && (
                                         <div className="text-xs text-amber-700 font-bold mt-1">Pregnancy — lidocaine preferred over bupivacaine (Burch 2024 Table 3-5).</div>
                                     )}
                                 </div>
                                 <div className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${firstLineAddOns.gonb ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`} onClick={() => setFirstLineAddOns({...firstLineAddOns, gonb: !firstLineAddOns.gonb})}>
                                     {firstLineAddOns.gonb && <Check size={16} className="text-white" />}
                                 </div>
                             </div>
                         </div>

                         {/* Magnesium */}
                         <div className={`bg-white p-5 rounded-xl border border-slate-200 ${checkEligibility('magnesium').disabled ? 'opacity-50' : ''}`}>
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
                                         <button key={dose} onClick={() => setFirstLineAddOns({...firstLineAddOns, magnesium: dose})} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${firstLineAddOns.magnesium === dose ? 'bg-neuro-600 text-white border-neuro-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'}`}>{dose} g</button>
                                     ))}
                                     <button onClick={() => setFirstLineAddOns({...firstLineAddOns, magnesium: null})} className={`px-4 py-2 text-sm font-bold rounded-lg border ${!firstLineAddOns.magnesium ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-400'}`}>None</button>
                                 </div>
                             )}
                         </div>

                         {/* Valproate */}
                         <div className={`bg-white p-5 rounded-xl border border-slate-200 ${checkEligibility('valproate').disabled ? 'opacity-50' : ''}`}>
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                     <div className="font-bold text-slate-900">Valproate (Depacon) IV</div>
                                     <div className="text-xs text-slate-500">Robblee 2025 Level C — May Offer (400–1000 mg IV). Doses ≥800 mg may perform better. Contraindicated in pregnancy and hepatic impairment.</div>
                                 </div>
                                 {checkEligibility('valproate').disabled && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('valproate').reason}</span>}
                             </div>
                             {!checkEligibility('valproate').disabled && (
                                 <div className="flex gap-3">
                                     {(['500', '800', '1000'] as ValproateDose[]).map(dose => (
                                         <button key={dose} onClick={() => setFirstLineAddOns({...firstLineAddOns, valproate: dose})} className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${firstLineAddOns.valproate === dose ? 'bg-neuro-600 text-white border-neuro-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'}`}>{dose} mg</button>
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
                        <button onClick={() => setStep(4)} className="px-8 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center">
                            Administer & Check Response <ChevronRight size={18} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 4: RESPONSE */}
        {step === 4 && (
            <div className="p-6 md:p-8 animate-in slide-in-from-right-4">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center mb-8">
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
                            className={`p-6 border-2 rounded-2xl hover:shadow-lg transition-all group ${responseImproved === false ? 'bg-neuro-50 border-neuro-500 ring-2 ring-neuro-200' : 'bg-slate-50 border-slate-200 hover:border-neuro-500'}`}
                        >
                            <div className="w-12 h-12 bg-neuro-100 text-neuro-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
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
                                 <div className="bg-white p-5 rounded-xl border border-slate-200">
                                     <div className="flex justify-between items-center">
                                         <div className="font-bold text-slate-900">Magnesium Sulfate 2g IV</div>
                                         <button onClick={() => setSecondLine({...secondLine, magnesium: secondLine.magnesium ? null : '2'})} className={`px-4 py-2 rounded-lg font-bold text-sm ${secondLine.magnesium ? 'bg-neuro-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                             {secondLine.magnesium ? 'Selected' : 'Select'}
                                         </button>
                                     </div>
                                 </div>
                             )}

                             {/* Valproate Rescue */}
                             {!firstLineAddOns.valproate && !checkEligibility('valproate').disabled && (
                                 <div className="bg-white p-5 rounded-xl border border-slate-200">
                                     <div className="flex justify-between items-center">
                                         <div className="font-bold text-slate-900">Valproate 1000mg IV</div>
                                         <button onClick={() => setSecondLine({...secondLine, valproate: secondLine.valproate ? null : '1000'})} className={`px-4 py-2 rounded-lg font-bold text-sm ${secondLine.valproate ? 'bg-neuro-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                             {secondLine.valproate ? 'Selected' : 'Select'}
                                         </button>
                                     </div>
                                 </div>
                             )}

                             {/* Chlorpromazine (A7: Robblee Level C; hide if HTN — orthostasis risk) */}
                             {!safety.htn && (
                                 <div className="bg-white p-5 rounded-xl border border-slate-200">
                                     <div className="flex justify-between items-center">
                                         <div className="pr-4">
                                             <div className="font-bold text-slate-900">Chlorpromazine 12.5–25 mg IV</div>
                                             <div className="text-xs text-slate-500 mt-1">Robblee 2025 Level C — May Offer. Pre-medicate with 500 mL NS and monitor for orthostatic hypotension.</div>
                                         </div>
                                         <div className="flex gap-2 shrink-0">
                                             {(['12.5', '25'] as ChlorpromazineDose[]).map(dose => (
                                                 <button key={dose} onClick={() => setSecondLine({...secondLine, chlorpromazine: secondLine.chlorpromazine === dose ? null : dose})} className={`px-3 py-2 rounded-lg font-bold text-xs ${secondLine.chlorpromazine === dose ? 'bg-neuro-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                     {dose} mg
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                             )}

                             {/* GONB-as-rescue (A7: pre-populates A1 GONB if not already on) */}
                             {!firstLineAddOns.gonb && (
                                 <div className="bg-white p-5 rounded-xl border border-slate-200">
                                     <div className="flex justify-between items-center">
                                         <div className="pr-4">
                                             <div className="font-bold text-slate-900">Greater Occipital Nerve Block (GONB) — Rescue</div>
                                             <div className="text-xs text-slate-500 mt-1">0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral. Robblee 2025 Level A. Effective even after IV cocktail failure.</div>
                                         </div>
                                         <button onClick={() => setSecondLine({...secondLine, gonbRescue: !secondLine.gonbRescue})} className={`px-4 py-2 rounded-lg font-bold text-sm shrink-0 ${secondLine.gonbRescue ? 'bg-neuro-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                             {secondLine.gonbRescue ? 'Selected' : 'Select'}
                                         </button>
                                     </div>
                                 </div>
                             )}

                             {/* DHE IV admit trigger (A7: gated by triptan24h + cvRisk + pregnant) */}
                             {!safety.triptan24h && !safety.cvRisk && !safety.pregnant && (
                                 <div className="bg-white p-5 rounded-xl border border-amber-200">
                                     <div className="flex justify-between items-center">
                                         <div className="pr-4">
                                             <div className="font-bold text-slate-900">DHE IV — Admit Trigger</div>
                                             <div className="text-xs text-slate-500 mt-1">Inpatient status-migrainosus protocol (Burch 2024 p.360): DHE 0.5–1 mg IV + metoclopramide IV q8h. Avoid if triptan within 24 h, CAD/PVD, or pregnancy. Robblee 2025: Level U — needs better quality ED-specific studies.</div>
                                         </div>
                                         <button onClick={() => setSecondLine({...secondLine, dheAdmit: !secondLine.dheAdmit})} className={`px-4 py-2 rounded-lg font-bold text-sm shrink-0 ${secondLine.dheAdmit ? 'bg-neuro-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                             {secondLine.dheAdmit ? 'Admit' : 'Trigger'}
                                         </button>
                                     </div>
                                 </div>
                             )}
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setStep(5)} className="px-8 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all">
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

                {/* B2: MOH discharge screen (Rizzoli 2024 / ICHD-3 8.2) */}
                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-900 mb-2">Medication-Overuse Headache (MOH) Discharge Screen</h3>
                    <p className="text-xs text-slate-500 mb-4">Rizzoli 2024, ICHD-3 8.2. Both criteria must be met for &gt;3 months.</p>
                    <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={mohScreen.headacheDaysHigh}
                                onChange={() => setMohScreen({...mohScreen, headacheDaysHigh: !mohScreen.headacheDaysHigh})}
                                className="mt-1"
                            />
                            <div className="text-sm text-slate-900">
                                Headache ≥15 days/month, for &gt;3 months, in a pre-existing headache disorder.
                            </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={mohScreen.acuteMedOveruse}
                                onChange={() => setMohScreen({...mohScreen, acuteMedOveruse: !mohScreen.acuteMedOveruse})}
                                className="mt-1"
                            />
                            <div className="text-sm text-slate-900">
                                Acute medication use: triptan / opioid / combo analgesic / ergot &gt;10 days/month, OR simple analgesic (NSAID / acetaminophen / aspirin) &gt;15 days/month, for &gt;3 months.
                            </div>
                        </label>
                    </div>

                    {mohScreen.headacheDaysHigh && mohScreen.acuteMedOveruse && (
                        <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-4">
                            <div className="font-bold text-amber-900 text-sm mb-1">MOH screen positive</div>
                            <p className="text-xs text-amber-900">Counseling required: withdraw overused agent, initiate preventive therapy, outpatient headache follow-up within 2 weeks. Bridge options: naproxen 550 mg BID × 2–4 wks; prednisone taper; anti-CGRP mAb. Reference: Rizzoli 2024 Continuum 30(2):379–390.</p>
                        </div>
                    )}
                </div>

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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neuro-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={copySummary} className="py-4 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center justify-center active:scale-95">
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
          <p>Based on Robblee et al. 2025 AHS ED Guideline (<em>Headache</em> 2026;66:53–76, DOI 10.1111/head.70016) for ED parenteral therapy and Ailani et al. AHS 2021 Consensus (<em>Headache</em> 2021;61:1021–1039, DOI 10.1111/head.14153) for outpatient acute selection. Continuum 2024 chapters (Burch acute, Burish cluster, Rizzoli MOH, Goadsby indomethacin, Nahas neuralgias) inform special-population and differential-diagnosis branches. Individual patient factors (allergies, interactions, pregnancy stage) must be verified by the treating clinician.</p>
      </div>
      {showFavToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          {isFav ? 'Saved to Favorites' : 'Removed from Favorites'}
        </div>
      )}
      {copyToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 z-[60]">
          Plan copied to clipboard
        </div>
      )}
    </div>
  );
};

export default MigrainePathway;

// @medical-scientist 2026-05-16 — clinical fixes applied per docs/audits/2026-05-16/migraine-pathway-fix-manifest.md (Patches 1-6; ship-blockers A1/A2 addressed; CLIN-2 verbatim phrases preserved).
