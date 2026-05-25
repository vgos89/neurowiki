
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Check, RotateCcw, Copy, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import { PathwayRailStep } from '../components/pathways/PathwayRail';
import { PathwayCategoryRow, type CategoryOption } from '../components/pathways/PathwayCategoryRow';
import { PathwayBranchChip } from '../components/pathways/PathwayBranchChip';
import { PathwayLearningPearl } from '../components/pathways/PathwayLearningPearl';
import { PathwayCascadeNotice } from '../components/pathways/PathwayCascadeNotice';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { PathwayCocktailSummary, type CocktailPill } from '../components/pathways/PathwayCocktailSummary';
import { Chevron } from '../components/calculators/Chevron';
import type { SeverityTokens } from '../lib/calculators/severityTokens';

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
    sonb: boolean;
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

// ─── TIER_TOKENS — inlined per architect condition 5 (do NOT extract to shared module in Tier 5) ──
// Migraine uses only TIER_TOKENS.Low (neuro-blue calm chrome for State B and State C).
// Follow-up: extract to src/lib/pathways/tierTokens.ts after PathwayBottomDrawer.tsx retirement.
type MigraineTier = 'Low' | 'Intermediate' | 'High' | 'Negative';
const TIER_TOKENS: Record<MigraineTier, SeverityTokens> = {
  Low: {
    borderColor: '#c7d2fe',         // neuro-200
    headerBg: 'bg-neuro-50',
    headerHover: 'hover:bg-neuro-100',
    labelClass: 'text-[10px] font-bold text-neuro-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-neuro-700',
    chevronClass: 'text-neuro-600',
  },
  Intermediate: {
    borderColor: '#fcd34d',         // amber-300
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-700',
  },
  High: {
    borderColor: '#fca5a5',         // red-300
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
  Negative: {
    borderColor: '#e2e8f0',         // slate-200
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-900',
    chevronClass: 'text-slate-400',
  },
};

// ─── Cascade infrastructure ────────────────────────────────────────────────
// When safety toggles change (safety→cocktail auto-deselect, §3.6 Pattern A),
// we surface a PathwayCascadeNotice inline under the Safety Profile panel.
type CascadeEvent = {
  clearedFields: string[];
  snapshot: {
    cocktail: CocktailState;
    firstLineAddOns: AddOnsState;
  };
};

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
  const { handleBack } = useNavigationSource();
  const topRef = useRef<HTMLDivElement>(null);
  
  // Section refs for auto-scroll
  const cocktailRef = useRef<HTMLDivElement>(null);
  const antiemeticRef = useRef<HTMLDivElement>(null);
  const ketorolacRef = useRef<HTMLDivElement>(null);
  const dexamethasoneRef = useRef<HTMLDivElement>(null);
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

  // Treatment Selection — no pre-fills (clinician makes active choices)
  const [cocktail, setCocktail] = useState<CocktailState>({
      benadryl: false,
      antiemetic: null,
      ketorolac: null,
      dexamethasone: null,
  });

  const [hasAura, setHasAura] = useState(false);

  const [firstLineAddOns, setFirstLineAddOns] = useState<AddOnsState>({
      sumatriptan: false,
      magnesium: null,
      valproate: null,
      gonb: false,
      sonb: false,
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
  const [drawerExpanded, setDrawerExpanded] = useState(false);

  // ─── Cascade notice state ─────────────────────────────────────────────────
  const [cascadeEvent, setCascadeEvent] = useState<CascadeEvent | null>(null);
  const handleCascadeUndo = useCallback(() => {
    if (cascadeEvent) {
      setCocktail(cascadeEvent.snapshot.cocktail);
      setFirstLineAddOns(cascadeEvent.snapshot.firstLineAddOns);
      setCascadeEvent(null);
    }
  }, [cascadeEvent]);
  const handleCascadeDismiss = useCallback(() => setCascadeEvent(null), []);

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
      const clearedForNotice: string[] = [];

      // Snapshot before mutations for Undo support
      const cocktailSnapshot = { ...cocktail };
      const addOnsSnapshot = { ...firstLineAddOns };

      // Check Cocktail
      if (cocktail.ketorolac && checkEligibility('ketorolac').disabled) {
          setCocktail(prev => ({ ...prev, ketorolac: null }));
          alerts.push("Ketorolac removed (Safety)");
          clearedForNotice.push("Ketorolac");
      }
      if (cocktail.dexamethasone && checkEligibility('dexamethasone').disabled) {
          setCocktail(prev => ({ ...prev, dexamethasone: null }));
          alerts.push("Dexamethasone removed (Safety)");
          clearedForNotice.push("Dexamethasone");
      }

      // Check First Line Add-ons
      if (firstLineAddOns.sumatriptan && checkEligibility('sumatriptan').disabled) {
          setFirstLineAddOns(prev => ({ ...prev, sumatriptan: false }));
          alerts.push("Sumatriptan removed (Safety)");
          clearedForNotice.push("Sumatriptan");
      }
      if (firstLineAddOns.valproate && checkEligibility('valproate').disabled) {
          setFirstLineAddOns(prev => ({ ...prev, valproate: null }));
          alerts.push("Valproate removed (Safety)");
          clearedForNotice.push("Valproate");
      }
      // Mg check
      if (firstLineAddOns.magnesium && checkEligibility('magnesium').disabled) {
          setFirstLineAddOns(prev => ({ ...prev, magnesium: null }));
          alerts.push("Magnesium removed (Safety)");
          clearedForNotice.push("Magnesium");
      }

      if (alerts.length > 0) {
          // Surface PathwayCascadeNotice with Undo capability (PathwayCascadeNotice replaces legacy toast)
          setCascadeEvent({
              clearedFields: clearedForNotice,
              snapshot: { cocktail: cocktailSnapshot, firstLineAddOns: addOnsSnapshot },
          });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safety]);


  const handleReset = () => {
    setStep(1);
    setRedFlags({ thunderclap: false, fever: false, focalDeficit: false, ams: false, papilledema: false, pregnancyNew: false, immunocompromised: false });
    setCareSetting(null);
    setSafety({ pregnant: false, renal: 'normal', cvRisk: false, htn: false, hepatic: false, basilar: false, triptan24h: false, dm: false, strokeHistory: false, age65: false, weightLow: false });
    setCocktail({ benadryl: false, antiemetic: null, ketorolac: null, dexamethasone: null });
    setFirstLineAddOns({ sumatriptan: false, magnesium: null, valproate: null, gonb: false, sonb: false });
    setHasAura(false);
    setResponseImproved(null);
    setSecondLine({ magnesium: null, valproate: null, chlorpromazine: null, gonbRescue: false, dheAdmit: false });
    setDifferential({ clusterPhenotype: false, indomethacinResponsive: false, trigeminalNeuralgia: false, statusMigrainosus: false });
    setMohScreen({ headacheDaysHigh: false, acuteMedOveruse: false });
    setCascadeEvent(null);
  };

  const generateSummary = () => {
      const lines: string[] = [];
      const contraindications: string[] = [];

      // Non-migraine phenotype summaries
      if (differential.clusterPhenotype) {
          lines.push("CLUSTER HEADACHE PROTOCOL (Burish 2024, AHS Grade A):");
          lines.push("- Oxygen 100% 12–15 L/min via NRB × 15 min (AHS Grade A)");
          lines.push("- Sumatriptan 6 mg SC (AHS Grade A)");
          lines.push("- Zolmitriptan nasal 5–10 mg (AHS Grade A)");
          lines.push("  Bridge: GON block + corticosteroid (AHS Grade A) OR prednisone 100 mg/day × 5d taper");
          lines.push("  Preventive: verapamil 360 mg/day TID + ECG monitoring");
          return `Cluster Headache Protocol — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n${lines.join('\n')}`;
      }
      if (differential.trigeminalNeuralgia) {
          lines.push("TRIGEMINAL NEURALGIA PROTOCOL (Nahas 2024):");
          lines.push("- First-line: carbamazepine 300–800 mg/day (Level A, FDA-approved)");
          lines.push("- Alternative: oxcarbazepine 600–1200 mg/day (Level B)");
          lines.push("- Acute exacerbation: IV fosphenytoin 15–20 mg PE/kg OR IV lidocaine 1.5–2 mg/kg over 10–20 min");
          lines.push("- Avoid opioids.");
          return `Trigeminal Neuralgia Protocol — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n${lines.join('\n')}`;
      }
      if (differential.indomethacinResponsive) {
          lines.push("INDOMETHACIN-RESPONSIVE HEADACHE (PH / HC) PROTOCOL (Goadsby 2024):");
          lines.push("- Indomethacin 25 mg TID × 3d → 50 mg TID × 3d → 75 mg TID (max 225 mg/day)");
          lines.push("- Always co-prescribe PPI for GI protection");
          lines.push("- Complete response = diagnostic of PH or HC");
          lines.push("  PH: episodic attacks 2–30 min, ≥5/day. HC: continuous unilateral headache.");
          return `Indomethacin-Responsive Protocol — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n${lines.join('\n')}`;
      }

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

      if (cocktail.ketorolac) lines.push(`- Ketorolac ${cocktail.ketorolac} mg IM/IV x1 (q8h PRN, max 2 doses)`);
      if (cocktail.dexamethasone) lines.push(`- Dexamethasone ${cocktail.dexamethasone} mg IV x1`);

      if (firstLineAddOns.sumatriptan) lines.push("- Sumatriptan 6 mg SC x1 (Repeat x1 after 1h PRN, Max 12mg/24h)");
      if (firstLineAddOns.magnesium) lines.push(`- Magnesium Sulfate ${firstLineAddOns.magnesium} g IV x1`);
      if (firstLineAddOns.valproate) lines.push(`- Valproate ${firstLineAddOns.valproate} mg IV over 15m x1 (Repeat 500mg q8h PRN, Max 3 doses)`);
      if (firstLineAddOns.gonb) lines.push("- Greater Occipital Nerve Block (GONB): 0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral to pain side");
      if (firstLineAddOns.sonb) lines.push("- Supraorbital Nerve Block (SONB): 1–2 mL of 0.5% bupivacaine OR 1% lidocaine at supraorbital notch bilaterally");

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
          lines.push("- Robblee 2025: DHE Level U — ED-specific data limited");
      }

      let text = `Migraine cocktail — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n${lines.join('\n')}`;
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

  // SafetyToggle red selected-state retained per clinical-pattern-a-fix-tier-5
  // — patient-fact-with-cascade exception to PATHWAY_SPEC §4.2 input-chrome
  // neutrality. Do NOT propagate this red pattern to tri-button decision
  // groups (§4.2 / §11#6 forbids).
  const SafetyToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
      <button
        type="button"
        onClick={onClick}
        className={`px-3 py-3 rounded-full text-sm font-semibold border transition-all touch-manipulation ${
            active
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
        }`}
      >
        {label}
      </button>
  );

  // ─── Step completion checks ────────────────────────────────────────────────
  const isStep1Complete = !Object.values(redFlags).some(v => v); // no red flags flagged (all clear)
  const isStep2Complete = (careSetting !== null && !differential.clusterPhenotype && !differential.trigeminalNeuralgia) || differential.clusterPhenotype || differential.trigeminalNeuralgia;
  const isStep3Complete = cocktail.antiemetic !== null;
  const isStep4Complete = responseImproved !== null;

  // ─── Branch chip summaries ─────────────────────────────────────────────────
  const getStep1Summary = () => {
    const flagCount = Object.values(redFlags).filter(Boolean).length;
    if (flagCount > 0) return `${flagCount} red flag${flagCount > 1 ? 's' : ''} — stop`;
    return 'No red flags — clear';
  };
  const getStep2Summary = () => {
    if (differential.clusterPhenotype) return 'Cluster — see protocol';
    if (differential.trigeminalNeuralgia) return 'TN — see protocol';
    if (differential.indomethacinResponsive) return 'Indomethacin-responsive — protocol';
    if (careSetting === 'adequate') return 'Adequate — discharge';
    if (careSetting === 'incomplete') return 'Incomplete response — cocktail';
    if (careSetting === 'vomiting') return 'Severe N/V — cocktail';
    return 'Setting pending';
  };
  const getStep3Summary = () => {
    const parts: string[] = [];
    if (cocktail.antiemetic) parts.push(cocktail.antiemetic.charAt(0).toUpperCase() + cocktail.antiemetic.slice(1));
    if (cocktail.ketorolac) parts.push(`Ketorolac ${cocktail.ketorolac}mg`);
    if (cocktail.dexamethasone) parts.push(`Dex ${cocktail.dexamethasone}mg`);
    return parts.length ? parts.join(' · ') : 'Cocktail pending';
  };

  // ─── Drawer state (architect condition 1 / 3c) ─────────────────────────────
  // State A: pre-decision. State B: cocktail-assembly underway. State C: post-cocktail/plan ready.
  const hasAnyDrug = !!(cocktail.antiemetic || cocktail.ketorolac || cocktail.dexamethasone || cocktail.benadryl);
  const drawerState: 'A' | 'B' | 'C' =
    (differential.clusterPhenotype || differential.trigeminalNeuralgia || differential.indomethacinResponsive) && step >= 5 ? 'C'
    : step >= 4 ? 'C'
    : (step === 3 && hasAnyDrug) ? 'B'
    : 'A';

  // ─── Cocktail pills derivation (architect condition 4 + clinical condition 3) ──
  // Consumer pre-formats each pill label with max-dose suffix where clinically meaningful.
  const antiemeticLabelMap: Record<string, string> = {
    prochlorperazine: 'Prochlorperazine 10mg IV',
    metoclopramide:   'Metoclopramide 10mg IV',
    ondansetron:      'Ondansetron 4-8mg IV',
  };

  const cocktailPills = useMemo<CocktailPill[]>(() => {
    const pills: CocktailPill[] = [];
    // Benadryl first (was first selected by default)
    if (cocktail.benadryl) {
      pills.push({ pillId: 'benadryl', label: 'Diphenhydramine 25/50mg IV' });
    }
    if (cocktail.antiemetic) {
      const base = antiemeticLabelMap[cocktail.antiemetic] ?? `${cocktail.antiemetic} IV`;
      pills.push({ pillId: 'antiemetic', label: base });
    }
    if (cocktail.ketorolac) {
      // max-dose suffix per clinical condition 3: ketorolac has a repeat-dose ceiling
      pills.push({ pillId: 'ketorolac', label: `Ketorolac ${cocktail.ketorolac}mg IV (max 2 doses)` });
    }
    if (cocktail.dexamethasone) {
      pills.push({ pillId: 'dexamethasone', label: `Dexamethasone ${cocktail.dexamethasone}mg IV` });
    }
    return pills;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cocktail]);

  // ─── onEditDrug — tap-to-edit handler (3f) ─────────────────────────────────
  const onEditDrug = useCallback((pillId: string) => {
    setStep(3);
    const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
      antiemetic:    antiemeticRef,
      ketorolac:     ketorolacRef,
      dexamethasone: dexamethasoneRef,
      benadryl:      cocktailRef,
    };
    setTimeout(() => {
      refMap[pillId]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [antiemeticRef, ketorolacRef, dexamethasoneRef, cocktailRef]);

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:pb-20" ref={topRef}>
      <h1 className="sr-only">Acute Migraine Pathway — Headache Cocktail Decision Support</h1>

      {/* ── Sticky compact header — PathwayHeader primitive (PATHWAY_SPEC §2 anatomy) ── */}
      <PathwayHeader
        pathwayLabel="Migraine Pathway"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={handleFavToggle}
        onReset={handleReset}
        onCopy={copySummary}
        shareText={generateSummary}
        shareTitle="Migraine Pathway"
        onShareResult={(r) => {
          if (r === 'shared' || r === 'copied') { setCopyToast(true); setTimeout(() => setCopyToast(false), 2000); }
        }}
      />

      {/* Legacy toast removed (E-7). PathwayCascadeNotice at field-safety now handles cascade feedback. */}

      {/* ── Step rail ─────────────────────────────────────────────────────── */}
      <div className="space-y-0 px-1 mt-4">
        
        {/* ── Step 1: Safety Screen ─────────────────────────────────────── */}
        <PathwayRailStep
          stepNumber={1}
          title="SAFETY SCREEN"
          iconKey="triage"
          nodeState={isStep1Complete && step > 1 ? 'completed' : step === 1 ? 'active' : 'locked'}
          segmentAboveTraversed={false}
          lockedAriaLabel="Step 1 Safety Screen, locked"
        >
          {/* Branch chip when step complete and not active */}
          {isStep1Complete && step > 1 && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-redflags"
                label={getStep1Summary()}
                onClick={() => setStep(1)}
              />
            </div>
          )}

          {step === 1 && (
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3 mb-3">
                <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Red Flags</p>
                  <p className="text-sm text-red-700">Identify high-risk headaches requiring urgent diagnostic workup (CT/CTA/LP/MRI) before symptomatic treatment.</p>
                </div>
              </div>

              <div id="field-redflags" className="space-y-2">
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
                      className={`w-full flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.99] touch-manipulation text-left min-h-[44px] ${redFlags[key as keyof RedFlags] ? 'bg-red-100 border-red-300 text-red-900' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}
                    >
                      <span className="font-medium text-sm">{labels[key]}</span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${redFlags[key as keyof RedFlags] ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
                        {redFlags[key as keyof RedFlags] && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {Object.values(redFlags).some(v => v) ? (
                <div className="mt-4 p-5 bg-red-600 text-white rounded-xl shadow-lg text-center">
                  <AlertTriangle size={28} className="mx-auto mb-2" />
                  <h2 className="text-lg font-black mb-1">STOP: Red Flag Headache</h2>
                  <p className="text-sm opacity-90">Do not proceed with migraine pathway until secondary causes (SAH, Meningitis, Mass, Stroke) are excluded.</p>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <button onClick={() => setStep(2)} className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center min-h-[44px]">
                    No Red Flags — Continue <Chevron direction="right" className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}
        </PathwayRailStep>

        {/* ── Step 2: Differential Routing + Care Setting ───────────────── */}
        <PathwayRailStep
          stepNumber={2}
          title="TRIAGE"
          iconKey="clinical"
          nodeState={isStep2Complete && step > 2 ? 'completed' : step >= 2 ? 'active' : 'locked'}
          segmentAboveTraversed={isStep1Complete && step > 1}
          lockedAriaLabel="Step 2 Triage, awaiting Step 1"
        >
          {/* Branch chip when step complete and not active */}
          {isStep2Complete && step > 2 && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-differential"
                label={getStep2Summary()}
                onClick={() => setStep(2)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-4">
              {/* B8: Differential routing */}
              <div id="field-differential">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Differential Routing</p>
                <p className="text-xs text-slate-500 mb-3">Select the dominant phenotype. Default = migraine; non-migraine selections route to a distinct protocol.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setDifferential({ clusterPhenotype: false, indomethacinResponsive: false, trigeminalNeuralgia: false, statusMigrainosus: differential.statusMigrainosus })}
                    className={`text-left p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${!differential.clusterPhenotype && !differential.indomethacinResponsive && !differential.trigeminalNeuralgia ? 'border-neuro-500 bg-neuro-50' : 'border-slate-200 bg-white'}`}>
                    <div className="font-semibold text-sm text-slate-900">Migraine — proceed</div>
                    <div className="text-xs text-slate-500 mt-0.5">Default acute-headache pathway.</div>
                  </button>
                  <button
                    onClick={() => setDifferential({ clusterPhenotype: true, indomethacinResponsive: false, trigeminalNeuralgia: false, statusMigrainosus: false })}
                    className={`text-left p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${differential.clusterPhenotype ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <div className="font-semibold text-sm text-slate-900">Cluster features</div>
                    <div className="text-xs text-slate-500 mt-0.5">Unilateral orbital/temporal + autonomic features + restlessness, 15–180 min attacks.</div>
                  </button>
                  <button
                    onClick={() => setDifferential({ clusterPhenotype: false, indomethacinResponsive: false, trigeminalNeuralgia: true, statusMigrainosus: false })}
                    className={`text-left p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${differential.trigeminalNeuralgia ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <div className="font-semibold text-sm text-slate-900">TN features</div>
                    <div className="text-xs text-slate-500 mt-0.5">Paroxysmal electric-shock pain in trigeminal distribution, triggered by light touch/chewing.</div>
                  </button>
                  <button
                    onClick={() => setDifferential({ clusterPhenotype: false, indomethacinResponsive: true, trigeminalNeuralgia: false, statusMigrainosus: differential.statusMigrainosus })}
                    className={`text-left p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${differential.indomethacinResponsive ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <div className="font-semibold text-sm text-slate-900">Indomethacin-responsive features</div>
                    <div className="text-xs text-slate-500 mt-0.5">Side-locked unilateral pain + cranial autonomic features (PH or HC).</div>
                  </button>
                </div>

                {/* Status migrainosus toggle (B5) */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={differential.statusMigrainosus}
                      onChange={() => setDifferential({...differential, statusMigrainosus: !differential.statusMigrainosus})}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-900">Current attack duration ≥72 hours (status migrainosus)</div>
                      <div className="text-xs text-slate-500 mt-0.5">Triggers admit advisory for repetitive DHE + metoclopramide IV q8h (Burch 2024 p.360, ICHD-3).</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* B1: Cluster inline protocol */}
              {differential.clusterPhenotype && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Cluster Headache — Acute &amp; Preventive Protocol</p>
                  <p className="text-xs text-amber-800 mb-3">Burish 2024 Table 6-3. AHS Grade A first-line triad. Migraine cocktail not indicated for cluster.</p>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-slate-900 text-sm">Oxygen 100% 12–15 L/min via NRB mask × 15 min</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level A</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">AHS Grade A first-line. Higher flow rates (15 L/min) may be more effective — use NRB, not nasal cannula.</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-slate-900 text-sm">Sumatriptan 6 mg SC</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level A</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">AHS Grade A. Same triptan-class contraindications apply (CV risk, uncontrolled HTN, stroke history, basilar migraine).</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-slate-900 text-sm">Zolmitriptan nasal 5–10 mg</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level A</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">AHS Grade A. Alternative to sumatriptan SC when SC route unavailable.</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-slate-900 text-sm">Bridging therapy</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">AHS Grade A</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Ipsilateral GON block with corticosteroid (AHS Grade A). OR prednisone 100 mg/day × 5 days then taper −20 mg q3 days. Start simultaneously with preventive.</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="font-semibold text-slate-900 text-sm mb-0.5">Preventive: verapamil 360 mg/day (TID dosing)</div>
                      <div className="text-xs text-slate-500">Obtain baseline ECG and recheck after each dose titration (PR prolongation risk). Start at 80 mg TID, titrate to 360 mg/day. Burish 2024 p.402.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* B4: TN inline protocol */}
              {differential.trigeminalNeuralgia && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Trigeminal Neuralgia — Acute &amp; Long-term Protocol</p>
                  <p className="text-xs text-amber-800 mb-3">Nahas 2024 Table 10-2. Migraine cocktail not indicated for TN.</p>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-slate-900 text-sm">Carbamazepine 300–800 mg/day</div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level A</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Only FDA-approved agent for TN. Start low (100 mg BID), titrate q3 days. Monitor CBC and LFTs. Nahas 2024.</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-semibold text-slate-900 text-sm">Oxcarbazepine 600–1200 mg/day</div>
                        <span className="text-[10px] bg-neuro-100 text-neuro-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level B</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Better tolerated than carbamazepine. Risk of hyponatremia — monitor electrolytes. Nahas 2024.</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="font-semibold text-slate-900 text-sm mb-0.5">Acute exacerbation rescue</div>
                      <div className="text-xs text-slate-500">IV fosphenytoin 15–20 mg PE/kg OR IV lidocaine 1.5–2 mg/kg over 10–20 min (for pain crises when oral intake is not possible). Nahas 2024 p.298.</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="text-xs font-bold text-red-700">Avoid opioids — not effective and accelerate central sensitization in TN.</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="font-semibold text-slate-900 text-sm mb-0.5">Refractory TN</div>
                      <div className="text-xs text-slate-500">If 2 adequate medication trials fail: microvascular decompression (MVD), stereotactic radiosurgery, or percutaneous rhizotomy — surgical decision individualized by patient anatomy and comorbidities. Nahas 2024.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* B3: Indomethacin-responsive inline protocol */}
              {differential.indomethacinResponsive && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Indomethacin-Responsive — Diagnostic &amp; Treatment Protocol</p>
                  <p className="text-xs text-amber-800 mb-3">Goadsby 2024 Continuum. An absolute response to indomethacin confirms the diagnosis. Migraine cocktail may be given acutely while indomethacin is initiated.</p>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="font-semibold text-slate-900 text-sm mb-1">Differentiate the phenotype</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded p-2">
                          <div className="text-xs font-bold text-slate-700">Paroxysmal Hemicrania (PH)</div>
                          <div className="text-xs text-slate-500 mt-0.5">Short episodic attacks (2–30 min), side-locked, ≥5/day. Autonomic features. Absolute indo response.</div>
                        </div>
                        <div className="bg-amber-50 rounded p-2">
                          <div className="text-xs font-bold text-slate-700">Hemicrania Continua (HC)</div>
                          <div className="text-xs text-slate-500 mt-0.5">Continuous unilateral headache, fluctuating severity, autonomic features. Absolute indo response.</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <div className="font-semibold text-slate-900 text-sm mb-1">Indomethacin titration (with PPI)</div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <div>• Start: 25 mg TID × 3 days</div>
                        <div>• If partial response: 50 mg TID × 3 days</div>
                        <div>• If still partial: 75 mg TID (max 225 mg/day)</div>
                        <div className="font-semibold text-amber-700 mt-1">Always co-prescribe a PPI — GI protection required.</div>
                        <div className="text-slate-500 mt-1">Complete response = diagnostic. Maintain at lowest effective dose. Goadsby 2024.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* B5: Status migrainosus admit advisory */}
              {differential.statusMigrainosus && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Status Migrainosus — Admit Advisory</p>
                  <p className="text-xs text-amber-800">Burch 2024 p.358–360 (ICHD-3): debilitating migraine ≥72 h. Inpatient admission for repetitive DHE + metoclopramide IV q8h is reasonable. Robblee 2025: DHE Level U — ED-specific data limited. Start the migraine cocktail — it remains appropriate.</p>
                </div>
              )}

              {/* Care setting — only show if not terminal route-out */}
              {!differential.clusterPhenotype && !differential.trigeminalNeuralgia && (
                <div id="field-caresetting">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Triage &amp; Care Setting</p>
                  <div className="space-y-2">
                    <button onClick={() => setCareSetting('adequate')} className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.99] touch-manipulation min-h-[44px] ${careSetting === 'adequate' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 hover:border-neuro-200'}`}>
                      <div className="font-semibold text-sm">Adequate response to home therapy</div>
                      <p className="text-xs text-slate-500 mt-0.5">Pain manageable, able to tolerate oral fluids.</p>
                    </button>
                    <button onClick={() => setCareSetting('incomplete')} className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.99] touch-manipulation min-h-[44px] ${careSetting === 'incomplete' ? 'border-neuro-500 bg-neuro-50 text-neuro-900' : 'border-slate-200 hover:border-neuro-200'}`}>
                      <div className="font-semibold text-sm">Incomplete / Inconsistent response</div>
                      <p className="text-xs text-slate-500 mt-0.5">Home meds failed, significant pain persists.</p>
                    </button>
                    <button onClick={() => setCareSetting('vomiting')} className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.99] touch-manipulation min-h-[44px] ${careSetting === 'vomiting' ? 'border-neuro-500 bg-neuro-50 text-neuro-900' : 'border-slate-200 hover:border-neuro-200'}`}>
                      <div className="font-semibold text-sm">Severe Nausea / Vomiting</div>
                      <p className="text-xs text-slate-500 mt-0.5">Cannot tolerate oral medications or fluids.</p>
                    </button>
                  </div>

                  {/* Adequate exit card (B8, AHS 2021) */}
                  {careSetting === 'adequate' && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
                      <div className="font-bold mb-2">Outpatient Acute Treatment (AHS 2021 p.1023, Burch 2024 Table 3-3)</div>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Mild-to-moderate: NSAIDs / acetaminophen / non-opioid analgesics / caffeine combos.</li>
                        <li>Moderate-severe or NSAID-refractory: triptans (sumatriptan PO 25/50/100 mg, max 200 mg/24 h; rizatriptan 5/10 mg; eletriptan 20/40 mg; zolmitriptan 2.5/5 mg).</li>
                        <li>Vascular disease or triptan-intolerant: gepants (ubrogepant 50/100 mg PO; rimegepant 75 mg ODT) or ditans (lasmiditan 50/100/200 mg PO — no driving × 8 h).</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2 nav */}
              <div className="flex justify-between items-center pt-2">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
                {(differential.clusterPhenotype || differential.trigeminalNeuralgia) ? (
                  <button onClick={() => setStep(5)} className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl shadow-lg hover:bg-amber-700 transition-all flex items-center min-h-[44px]">
                    Continue to Plan <Chevron direction="right" className="ml-2" />
                  </button>
                ) : careSetting === 'adequate' ? (
                  <div className="text-emerald-600 font-semibold text-sm">Discharge / Outpatient Management.</div>
                ) : (
                  <button disabled={!careSetting} onClick={() => setStep(3)} className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center min-h-[44px]">
                    Proceed to Cocktail <Chevron direction="right" className="ml-2" />
                  </button>
                )}
              </div>
            </div>
          )}
        </PathwayRailStep>

        {/* ── Step 3: Acute Treatment ───────────────────────────────────── */}
        <PathwayRailStep
          stepNumber={3}
          title="ACUTE TX"
          iconKey="clinical"
          nodeState={isStep3Complete && step > 3 ? 'completed' : step >= 3 ? 'active' : 'locked'}
          segmentAboveTraversed={isStep2Complete && step > 2}
          lockedAriaLabel="Step 3 Acute TX, awaiting Step 2"
        >
          {/* Branch chip */}
          {isStep3Complete && step > 3 && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-safety"
                label={getStep3Summary()}
                onClick={() => setStep(3)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {/* Safety Profile Panel */}
              <div id="field-safety" className="bg-white border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert size={16} className="text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Patient Safety Profile</p>
                </div>
                <div className="space-y-3">
                  <PathwayCategoryRow
                    label="Renal Function"
                    options={[
                      { value: 'normal',   label: 'Normal (eGFR > 50)',   description: 'No renal contraindications to standard dosing.' },
                      { value: '30-50',    label: 'eGFR 30–50',           description: 'Ketorolac contraindicated (GFR < 50). Use ketorolac-free cocktail.' },
                      { value: 'below30',  label: 'eGFR < 30',            description: 'Ketorolac contraindicated. Magnesium: avoid or use with extreme caution.' },
                      { value: 'dialysis', label: 'Dialysis',              description: 'Ketorolac contraindicated. Magnesium: contraindicated (cannot clear).' },
                    ] as CategoryOption[]}
                    value={safety.renal}
                    onChange={(v) => setSafety({...safety, renal: v as RenalStatus})}
                    defaultOpen={false}
                  />
                  <div className="flex flex-wrap gap-2">
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

                {/* PathwayCascadeNotice — wired to safety→cocktail auto-deselect cascade */}
                <PathwayCascadeNotice
                  visible={cascadeEvent !== null}
                  changedFieldLabel="Safety profile"
                  clearedFields={cascadeEvent?.clearedFields ?? []}
                  onUndo={handleCascadeUndo}
                  onDismiss={handleCascadeDismiss}
                />
              </div>

              {/* Vascular disease banner (B6) */}
              {(safety.cvRisk || safety.strokeHistory) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                  <div className="font-bold mb-1">Vascular disease present</div>
                  <p>Triptans and DHE contraindicated. Outpatient alternatives (no vasoconstriction): ubrogepant 50/100 mg PO, rimegepant 75 mg ODT, lasmiditan 50/100/200 mg PO (no driving × 8 h). Not formulary-IV — flag for outpatient initiation. AHS 2021 Consensus p.1025; Burch 2024 p.352.</p>
                </div>
              )}

              {/* Pregnancy banner (B7) */}
              {safety.pregnant && (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-xs text-pink-900">
                  <div className="font-bold mb-1">Pregnancy — Burch 2024 Table 3-5</div>
                  <p>First-line: acetaminophen 1000 mg PO, diphenhydramine 25–50 mg PO/IV, metoclopramide 10 mg IV (Level B; safe in pregnancy). Rescue option: sumatriptan (use with caution; discuss with obstetrics). Second-line: ondansetron, prednisone rescue, prochlorperazine. Always avoid: ergots/DHE, valproate (teratogenic), gepants, lasmiditan.</p>
                </div>
              )}

              {/* Opioid Must-NOT-Offer warning — shown before any drug choices */}
              <div data-claim="migraine-opioid-must-not-offer" className="bg-red-50 border border-red-300 rounded-xl p-4 flex gap-3">
                <ShieldAlert size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-red-700 mb-1">Opioids / Tramadol — Level A Must NOT Offer</div>
                  <p className="text-xs text-red-800">Hydromorphone, morphine, oxycodone, and tramadol are not indicated for acute migraine. They worsen headache chronification, increase MOH risk, and work less well than the migraine cocktail. AHS 2025 (Robblee et al.): Level A Must NOT Offer.</p>
                </div>
              </div>

              {/* First-Line Cocktail */}
              <div ref={cocktailRef} className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">First-Line Cocktail</p>

                {/* A: Diphenhydramine toggle — pre-medication for antiemetic EPS prevention */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pre-medication</p>
                <button
                  onClick={() => setCocktail({...cocktail, benadryl: !cocktail.benadryl})}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 transition-all active:scale-[0.99] touch-manipulation text-left mb-3 min-h-[44px]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">Diphenhydramine 25/50 mg PO/IV ×1</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level A</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">Prevents akathisia (extrapyramidal side effects — restlessness) from dopamine-antagonist antiemetics.</div>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${cocktail.benadryl ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`}>
                    {cocktail.benadryl && <Check size={13} className="text-white" />}
                  </div>
                </button>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Antiemetic &amp; Analgesic</p>

                {/* B: Antiemetic — PathwayCategoryRow */}
                <div ref={antiemeticRef}>
                  <PathwayCategoryRow
                    label="Antiemetic (choose one)"
                    options={[
                      { value: 'prochlorperazine', label: 'Prochlorperazine 10 mg', description: 'Robblee 2025 Level A — Must Offer. First-line ED antiemetic for acute migraine. May repeat q8h.' },
                      { value: 'metoclopramide', label: 'Metoclopramide 10 mg', description: 'Robblee 2025 Level B — Should Offer. Use if prochlorperazine unavailable or contraindicated. May repeat q8h.' },
                      { value: 'ondansetron', label: 'Ondansetron 4–8 mg', description: 'Anti-nausea adjunct only — not effective as a migraine analgesic. Use when QT risk excludes dopamine antagonists.' },
                    ] as CategoryOption[]}
                    value={cocktail.antiemetic}
                    onChange={(v) => setCocktail({...cocktail, antiemetic: v as AntiemeticChoice})}
                    defaultOpen={cocktail.antiemetic === null}
                  />
                </div>

                {/* C: Ketorolac — PathwayCategoryRow (disabled when contraindicated) */}
                <div ref={ketorolacRef} className={checkEligibility('ketorolac').disabled ? 'opacity-50' : ''}>
                  {checkEligibility('ketorolac').disabled ? (
                    <div className="py-3 border-b border-slate-100 flex items-center justify-between min-h-[44px]">
                      <span className="text-sm font-medium text-slate-500">Ketorolac (Toradol)</span>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('ketorolac').reason}</span>
                    </div>
                  ) : (
                    <PathwayCategoryRow
                      label="Ketorolac (Toradol)"
                      options={[
                        { value: '15', label: '15 mg IM/IV', description: 'Robblee 2025 Level B. Use for age >65 or weight <50 kg.' },
                        { value: '30', label: '30 mg IM/IV', description: 'Standard adult dose. May repeat ×1 at 8h PRN.' },
                        ...(!safety.age65 && !safety.weightLow ? [{ value: '60', label: '60 mg IM/IV', description: 'Higher dose — avoid if age >65 or weight <50 kg.' }] : []),
                      ] as CategoryOption[]}
                      value={cocktail.ketorolac}
                      onChange={(v) => setCocktail({...cocktail, ketorolac: v as KetorolacDose})}
                      defaultOpen={cocktail.ketorolac === null && !checkEligibility('ketorolac').disabled}
                    />
                  )}
                </div>

                {/* D: Dexamethasone — PathwayCategoryRow (disabled when contraindicated) */}
                <div ref={dexamethasoneRef} data-claim="migraine-dex-recurrence-level-b-pain-level-c" className={checkEligibility('dexamethasone').disabled ? 'opacity-50' : ''}>
                  {checkEligibility('dexamethasone').disabled ? (
                    <div className="py-3 border-b border-slate-100 flex items-center justify-between min-h-[44px]">
                      <span className="text-sm font-medium text-slate-500">Dexamethasone</span>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('dexamethasone').reason}</span>
                    </div>
                  ) : (
                    <PathwayCategoryRow
                      label="Dexamethasone"
                      options={[
                        { value: '8', label: '8 mg IV ×1', description: 'Robblee 2025: Level C (May Offer) for acute pain; Level B (Should Offer) for preventing 24–72 h headache recurrence. Single dose.' },
                        { value: '10', label: '10 mg IV ×1', description: 'Robblee 2025: Level B for recurrence prevention — the primary reason to use dexamethasone in migraine. Level C for acute pain only. Burch 2024 reference dose.' },
                        { value: '16', label: '16 mg IV ×1', description: 'Higher end of Robblee Table 2 range. Level C for acute pain; Level B for recurrence prevention. Single dose.' },
                      ] as CategoryOption[]}
                      value={cocktail.dexamethasone}
                      onChange={(v) => setCocktail({...cocktail, dexamethasone: v as DexDose})}
                      defaultOpen={cocktail.dexamethasone === null && !checkEligibility('dexamethasone').disabled}
                    />
                  )}
                </div>
              </div>

              {/* Add-Ons */}
              <div ref={addonsRef} className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Adjunct Agents</p>
                <div className="space-y-1">

                  {/* Sumatriptan — 3-way render: disabled / warning / selectable */}
                  <div className={`border-b border-slate-100 ${checkEligibility('sumatriptan').disabled ? 'opacity-50' : ''}`}>
                    {checkEligibility('sumatriptan').disabled ? (
                      <div className="py-3 flex items-center justify-between min-h-[44px]">
                        <span className="text-sm font-medium text-slate-500">Sumatriptan 6 mg SC</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('sumatriptan').reason}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setFirstLineAddOns({...firstLineAddOns, sumatriptan: !firstLineAddOns.sumatriptan})}
                        className="w-full flex items-center justify-between py-3 transition-all touch-manipulation text-left min-h-[44px]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">Sumatriptan 6 mg SC</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level A</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">Fastest-onset triptan. Rescue option when cocktail alone is insufficient. Avoid in CAD/Stroke/HTN/Basilar migraine.</div>
                          {checkEligibility('sumatriptan').warning && (
                            <div className="text-xs text-amber-700 font-bold mt-0.5">{checkEligibility('sumatriptan').warning}</div>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${firstLineAddOns.sumatriptan ? 'bg-neuro-600 border-neuro-600' : checkEligibility('sumatriptan').warning ? 'bg-white border-amber-400' : 'bg-white border-slate-300'}`}>
                          {firstLineAddOns.sumatriptan && <Check size={13} className="text-white" />}
                        </div>
                      </button>
                    )}
                  </div>

                  {/* ── Nerve Blocks ──────────────────────────────────── */}
                  <div className="pt-3 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Nerve Blocks</p>
                  </div>

                  {/* GONB */}
                  <div className="border-b border-slate-100">
                    <button
                      onClick={() => setFirstLineAddOns({...firstLineAddOns, gonb: !firstLineAddOns.gonb})}
                      className="w-full flex items-center justify-between py-3 transition-all touch-manipulation text-left min-h-[44px]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">Greater Occipital Nerve Block (GONB)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level A</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral to pain side. Robblee 2025 — Must Offer.</div>
                        {safety.pregnant && firstLineAddOns.gonb && (
                          <div className="text-xs text-amber-700 font-bold mt-0.5">Pregnancy — lidocaine preferred over bupivacaine (Burch 2024 Table 3-5).</div>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${firstLineAddOns.gonb ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`}>
                        {firstLineAddOns.gonb && <Check size={13} className="text-white" />}
                      </div>
                    </button>
                  </div>

                  {/* SONB */}
                  <div className="border-b border-slate-100">
                    <button
                      data-claim="migraine-sonb-level-b"
                      onClick={() => setFirstLineAddOns({...firstLineAddOns, sonb: !firstLineAddOns.sonb})}
                      className="w-full flex items-center justify-between py-3 transition-all touch-manipulation text-left min-h-[44px]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">Supraorbital Nerve Block (SONB)</span>
                          <span className="text-[10px] bg-neuro-100 text-neuro-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Level B</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">1–2 mL of 0.5% bupivacaine OR 1% lidocaine at supraorbital notch bilaterally. Robblee 2025 — Should Offer.</div>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${firstLineAddOns.sonb ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`}>
                        {firstLineAddOns.sonb && <Check size={13} className="text-white" />}
                      </div>
                    </button>
                  </div>

                  {/* ── Additional adjuncts ───────────────────────────── */}
                  <div className="pt-3 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0">Additional adjuncts</p>
                  </div>

                  {/* Magnesium — PathwayCategoryRow for dose (includes "Skip" deselect) */}
                  <div className={checkEligibility('magnesium').disabled ? 'opacity-50' : ''}>
                    {checkEligibility('magnesium').disabled ? (
                      <div className="py-3 border-b border-slate-100 flex items-center justify-between min-h-[44px]">
                        <span className="text-sm font-medium text-slate-500">Magnesium Sulfate IV</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('magnesium').reason}</span>
                      </div>
                    ) : (
                      <>
                        {/* Aura toggle — gates magnesium recommendation */}
                        <div className="flex items-center justify-between py-2 px-1">
                          <span className="text-xs text-slate-500">Migraine with aura present?</span>
                          <button
                            type="button"
                            onClick={() => setHasAura(v => !v)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all touch-manipulation ${hasAura ? 'bg-neuro-100 text-neuro-800 border-neuro-300' : 'bg-white text-slate-500 border-slate-200'}`}
                          >
                            {hasAura ? 'Yes — aura' : 'No aura'}
                          </button>
                        </div>
                        <PathwayCategoryRow
                          label="Magnesium Sulfate IV"
                          options={[
                            {
                              value: '1',
                              label: '1 g IV ×1',
                              description: (hasAura ? 'Subgroup data suggests benefit with aura/photophobia. ' : 'Level U — insufficient evidence in non-aura migraine. May still offer. ') + (checkEligibility('magnesium').warning ? checkEligibility('magnesium').warning : ''),
                            },
                            {
                              value: '2',
                              label: '2 g IV ×1',
                              description: (hasAura ? 'Preferred rescue dose when aura present. ' : 'Level U — insufficient evidence in non-aura migraine. May still offer. ') + (checkEligibility('magnesium').warning ? checkEligibility('magnesium').warning : ''),
                            },
                            { value: 'skip', label: 'Skip (not indicated)', description: 'Omit magnesium from cocktail.' },
                          ] as CategoryOption[]}
                          value={firstLineAddOns.magnesium}
                          onChange={(v) => setFirstLineAddOns({...firstLineAddOns, magnesium: v === 'skip' ? null : v as MagDose})}
                        />
                        <div data-claim="migraine-magnesium-level-u-aura" className="text-[11px] text-slate-400 px-1 pb-1">Robblee 2025 Level U — insufficient evidence as routine add-on; sub-group benefit with aura/photophobia.</div>
                      </>
                    )}
                  </div>

                  {/* Valproate — PathwayCategoryRow for dose (includes "Skip" deselect) */}
                  <div className={checkEligibility('valproate').disabled ? 'opacity-50' : ''}>
                    {checkEligibility('valproate').disabled ? (
                      <div className="py-3 flex items-center justify-between min-h-[44px]">
                        <span className="text-sm font-medium text-slate-500">Valproate (Depacon) IV</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{checkEligibility('valproate').reason}</span>
                      </div>
                    ) : (
                      <PathwayCategoryRow
                        label="Valproate (Depacon) IV"
                        options={[
                          { value: '500', label: '500 mg IV over 15 min', description: 'Robblee 2025 Level C — May Offer. Repeat 500 mg q8h PRN (max 3 doses).' },
                          { value: '800', label: '800 mg IV over 15 min', description: 'Doses ≥800 mg may perform better. Repeat 500 mg q8h PRN.' },
                          { value: '1000', label: '1000 mg IV over 15 min', description: 'Upper range. Repeat 500 mg q8h PRN (max 3 doses). Avoid in pregnancy and hepatic impairment.' },
                          { value: 'skip', label: 'Skip (not indicated)', description: 'Omit valproate from cocktail.' },
                        ] as CategoryOption[]}
                        value={firstLineAddOns.valproate}
                        onChange={(v) => setFirstLineAddOns({...firstLineAddOns, valproate: v === 'skip' ? null : v as ValproateDose})}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Learning pearl — shown after antiemetic is selected */}
              <PathwayLearningPearl
                title="Why prochlorperazine first?"
                visible={cocktail.antiemetic !== null}
                content={
                  <span>Prochlorperazine blocks D2 receptors in the chemoreceptor trigger zone and has direct antimigraine properties beyond antiemesis. Robblee 2025 assigns it Level A (Must Offer) — higher evidence grade than metoclopramide (Level B) or ondansetron (Level U for analgesia). Premedicate with diphenhydramine 25–50 mg to prevent akathisia — an uncomfortable restlessness from dopamine-antagonist side effects. Metoclopramide is appropriate if prochlorperazine is unavailable or contraindicated.</span>
                }
              />

              {/* Step 3 nav */}
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(2)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
                <button onClick={() => setStep(4)} className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center min-h-[44px]">
                  Administer &amp; Check Response <Chevron direction="right" className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </PathwayRailStep>

        {/* ── Step 4: Response ─────────────────────────────────────────── */}
        <PathwayRailStep
          stepNumber={4}
          title="RESPONSE"
          iconKey="imaging"
          nodeState={isStep4Complete && step > 4 ? 'completed' : step >= 4 ? 'active' : 'locked'}
          segmentAboveTraversed={isStep3Complete && step > 3}
          lockedAriaLabel="Step 4 Response, awaiting Step 3"
        >
          {isStep4Complete && step > 4 && (
            <div className="mb-3">
              <PathwayBranchChip
                targetFieldId="field-response"
                label={responseImproved ? 'Improved — proceed to plan' : 'Refractory — second-line selected'}
                onClick={() => setStep(4)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              {/* Response selector */}
              <div id="field-response" className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Patient Status (1 hour post-cocktail)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => { setResponseImproved(true); setStep(5); }}
                    className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group min-h-[44px]"
                  >
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Check size={20} />
                    </div>
                    <div className="font-black text-emerald-900">Improved</div>
                    <div className="text-emerald-700 text-xs mt-0.5">Pain manageable, nausea resolved.</div>
                  </button>
                  <button
                    onClick={() => setResponseImproved(false)}
                    className={`p-4 border rounded-xl hover:shadow-md transition-all group min-h-[44px] ${responseImproved === false ? 'bg-neuro-50 border-neuro-500 ring-2 ring-neuro-200' : 'bg-slate-50 border-slate-200 hover:border-neuro-500'}`}
                  >
                    <div className="w-10 h-10 bg-neuro-100 text-neuro-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="font-black text-slate-900">Refractory</div>
                    <div className="text-slate-500 text-xs mt-0.5">Significant pain or vomiting persists.</div>
                  </button>
                </div>
              </div>

              {/* Second-line rescue — shown when refractory */}
              {responseImproved === false && (
                <div className="bg-white border border-slate-100 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Second-Line Rescue</p>
                  <p className="text-xs text-slate-500 mb-3">If not used in Step 3, consider adding these agents now. If already used, consider admission or Neurology Consult.</p>
                  <div className="space-y-1">

                    {/* Magnesium rescue */}
                    {!firstLineAddOns.magnesium && !checkEligibility('magnesium').disabled && (
                      <button
                        onClick={() => setSecondLine({...secondLine, magnesium: secondLine.magnesium ? null : '2'})}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${secondLine.magnesium ? 'border-neuro-300 bg-neuro-50' : 'border-slate-200'}`}
                      >
                        <span className="font-medium text-sm text-slate-900">Magnesium Sulfate 2 g IV</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${secondLine.magnesium ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`}>
                          {secondLine.magnesium && <Check size={13} className="text-white" />}
                        </div>
                      </button>
                    )}

                    {/* Valproate rescue */}
                    {!firstLineAddOns.valproate && !checkEligibility('valproate').disabled && (
                      <button
                        onClick={() => setSecondLine({...secondLine, valproate: secondLine.valproate ? null : '1000'})}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${secondLine.valproate ? 'border-neuro-300 bg-neuro-50' : 'border-slate-200'}`}
                      >
                        <span className="font-medium text-sm text-slate-900">Valproate 1000 mg IV</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${secondLine.valproate ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`}>
                          {secondLine.valproate && <Check size={13} className="text-white" />}
                        </div>
                      </button>
                    )}

                    {/* Chlorpromazine (hide if HTN — orthostasis risk) */}
                    {!safety.htn && (
                      <PathwayCategoryRow
                        label="Chlorpromazine IV"
                        options={[
                          { value: '12.5', label: '12.5 mg IV', description: 'Robblee 2025 Level C — May Offer. Pre-medicate with 500 mL NS; monitor for orthostatic hypotension.' },
                          { value: '25', label: '25 mg IV', description: 'Higher dose. Pre-medicate with 500 mL NS; monitor for orthostatic hypotension.' },
                        ] as CategoryOption[]}
                        value={secondLine.chlorpromazine}
                        onChange={(v) => setSecondLine({...secondLine, chlorpromazine: v as ChlorpromazineDose})}
                      />
                    )}

                    {/* GONB rescue */}
                    {!firstLineAddOns.gonb && (
                      <button
                        onClick={() => setSecondLine({...secondLine, gonbRescue: !secondLine.gonbRescue})}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${secondLine.gonbRescue ? 'border-neuro-300 bg-neuro-50' : 'border-slate-200'}`}
                      >
                        <div>
                          <span className="font-medium text-sm text-slate-900">GONB — Rescue</span>
                          <div className="text-xs text-slate-500 mt-0.5">0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine, ipsilateral. Robblee 2025 Level A. Effective even after IV cocktail failure.</div>
                        </div>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${secondLine.gonbRescue ? 'bg-neuro-600 border-neuro-600' : 'bg-white border-slate-300'}`}>
                          {secondLine.gonbRescue && <Check size={13} className="text-white" />}
                        </div>
                      </button>
                    )}

                    {/* DHE IV admit trigger (gated by triptan24h + cvRisk + pregnant) */}
                    {!safety.triptan24h && !safety.cvRisk && !safety.pregnant && (
                      <button
                        onClick={() => setSecondLine({...secondLine, dheAdmit: !secondLine.dheAdmit})}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all touch-manipulation min-h-[44px] ${secondLine.dheAdmit ? 'border-amber-300 bg-amber-50' : 'border-amber-200'}`}
                      >
                        <div>
                          <span className="font-medium text-sm text-slate-900">DHE IV — Admit Trigger</span>
                          <div className="text-xs text-slate-500 mt-0.5">Inpatient status-migrainosus protocol (Burch 2024 p.360): DHE 0.5–1 mg IV + metoclopramide IV q8h. Robblee 2025: Level U — ED-specific data limited.</div>
                        </div>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${secondLine.dheAdmit ? 'bg-amber-500 border-amber-500' : 'bg-white border-amber-300'}`}>
                          {secondLine.dheAdmit && <Check size={13} className="text-white" />}
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end mt-3">
                    <button onClick={() => setStep(5)} className="px-6 py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center min-h-[44px]">
                      Finalize Plan <Chevron direction="right" className="ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && responseImproved === null && (
                <div className="flex justify-start">
                  <button onClick={() => setStep(3)} className="text-slate-400 hover:text-slate-600 font-semibold px-2 min-h-[44px]">Back</button>
                </div>
              )}
            </div>
          )}
        </PathwayRailStep>

        {/* ── Step 5: Plan ─────────────────────────────────────────────── */}
        <PathwayRailStep
          stepNumber={5}
          title="PLAN"
          iconKey="decision"
          nodeState={step === 5 ? 'active' : step > 5 ? 'completed' : 'locked'}
          segmentAboveTraversed={(isStep4Complete && step > 4) || ((differential.clusterPhenotype || differential.trigeminalNeuralgia || differential.indomethacinResponsive) && step >= 5)}
          lockedAriaLabel="Step 5 Plan, awaiting Step 4"
        >
          {step === 5 && (
            <div className="space-y-4" role="status" aria-live="polite" aria-atomic="true">
              {/* B2: MOH discharge screen (Rizzoli 2024 / ICHD-3 8.2) */}
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">MOH Discharge Screen</p>
                <p className="text-xs text-slate-500 mb-3">Rizzoli 2024, ICHD-3 8.2. Both criteria must be met for &gt;3 months.</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
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
                  <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
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
                  <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-2">
                    <div className="font-bold text-amber-900 text-sm">MOH screen positive</div>
                    <p className="text-xs text-amber-900">Counseling required: withdraw overused agent, initiate preventive therapy, outpatient headache follow-up within 2 weeks. Bridge options: naproxen 550 mg BID × 2–4 wks; prednisone taper; anti-CGRP mAb. Reference: Rizzoli 2024 Continuum 30(2):379–390.</p>
                    <div data-claim="clinic-headache-moh-gepant-safe" className="bg-white border border-amber-200 rounded-lg p-3">
                      <div className="text-xs font-bold text-neuro-700 mb-1">Gepants do NOT cause MOH</div>
                      <p className="text-xs text-slate-700">Atogepant, rimegepant, and ubrogepant have no established MOH threshold. Gepants are preferred acute and preventive agents for patients with established MOH or at high MOH risk. AHS 2021 Consensus (Ailani et al.); Rizzoli 2024.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Treatment Plan summary — content rendered in CalculatorDrawer State C below (3g).
                  Dark hero card removed (E-8). Per-line className pattern preserved per clinical condition 4. */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={copySummary} className="py-3 bg-neuro-600 text-white font-bold rounded-xl shadow-lg hover:bg-neuro-700 transition-all flex items-center justify-center active:scale-95 min-h-[44px]">
                  <Copy size={16} className="mr-2" /> Copy to Clipboard
                </button>
                <button onClick={handleReset} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center min-h-[44px]">
                  <RotateCcw size={16} className="mr-2" /> Start Over
                </button>
              </div>
            </div>
          )}
        </PathwayRailStep>

      </div>{/* end step rail */}

      {/* ── CalculatorDrawer — Treatment Plan (Tier 5 migration) ──────────────
          State A: pre-decision. State B: cocktail-assembly (PathwayCocktailSummary).
          State C: full plan rendered from unchanged generateSummary() (CLIN-2 preserved by construction).
          Mirrors EvtPathway.tsx lines 1803-1869 (Tier 4 pattern). */}
      <CalculatorDrawer
        state={drawerState}
        tokens={
          drawerState === 'C' ? TIER_TOKENS.Low
          : drawerState === 'B' ? TIER_TOKENS.Low
          : null
        }
        isExpanded={drawerExpanded}
        onToggle={() => setDrawerExpanded(v => !v)}
        ariaContentId="migraine-drawer-content"
        ariaLabel="Treatment plan drawer"
        stateBTappable={true}
        stateAText={{ label: 'Treatment Plan', hint: 'Complete steps to see plan' }}
        stateBText={{ label: `Cocktail · ${cocktailPills.length} drug${cocktailPills.length === 1 ? '' : 's'}`, hint: 'Tap to review' }}
        collapsedLabel="Treatment Plan"
        collapsedStat={
          drawerState === 'C' ? `Full cocktail · ${cocktailPills.length} agent${cocktailPills.length === 1 ? '' : 's'}`
          : drawerState === 'B' ? `Cocktail · ${cocktailPills.length} drug${cocktailPills.length === 1 ? '' : 's'}`
          : ''
        }
      >
        {/* Drawer children — render switches by state */}
        {drawerState === 'B' && (
          <PathwayCocktailSummary
            drugs={cocktailPills}
            onEditDrug={onEditDrug}
          />
        )}
        {drawerState === 'C' && (
          <div
            id="migraine-drawer-content"
            className="bg-white border-t border-slate-100 px-5 py-4 max-h-[45dvh] overflow-y-auto"
          >
            {/* Per-line className preserved per clinical condition 4:
                bold section headers (FIRST-LINE COCKTAIL:, MOH DISCHARGE COUNSELING (..., etc.)
                + indented dash-prefixed drug lines. Content sourced from unchanged generateSummary(). */}
            <div className="space-y-0 text-sm text-slate-700">
              {generateSummary().split('\n').map((line, i) => (
                <div
                  key={i}
                  className={line.startsWith('-') ? 'ml-4' : 'font-bold mt-3 first:mt-0'}
                >
                  {line.startsWith('-') ? line.slice(1).trim() : line}
                </div>
              ))}
            </div>
          </div>
        )}
      </CalculatorDrawer>

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
// @ui-architect 2026-05-16 — Migraine JSX shell rewrite to Pattern A. Clinical content + safety cascade logic + CLIN-2 verbatim phrases preserved. Composes PathwayRailStep + PathwayCategoryRow + PathwayBranchChip + PathwayLearningPearl + PathwayCascadeNotice.
