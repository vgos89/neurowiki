import React, { useState, useMemo, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Calendar, Copy, Check } from 'lucide-react';

export interface ThrombolysisEligibilityData {
  lkwTime: Date | null;
  timeDifferenceHours: number | null;
  inclusionCriteriaMet: boolean;
  absoluteContraindications: string[];
  relativeContraindications: string[];
  eligibilityStatus: 'eligible' | 'relative-contraindication' | 'absolute-contraindication' | 'not-eligible';
  notes: string;
}

interface ThrombolysisEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: ThrombolysisEligibilityData) => void;
  initialData?: ThrombolysisEligibilityData | null;
}

interface CriteriaItem {
  id: string;
  label: string;
  plainEnglish: string;
}

interface AbsoluteItemWithSub {
  id: string;
  label: string;
  plainEnglish: string;
  subCriteria?: Array<{ id: string; label: string; plainEnglish: string }>;
}

const PRE_TPA_BP_MANAGEMENT = {
  target: { systolic: 185, diastolic: 110 },
  medications: [
    { name: 'Labetalol', dose: '10-20mg IV push over 1-2 minutes', frequency: 'May repeat every 10-20 minutes', maxDose: '300mg total' },
    { name: 'Nicardipine', dose: '5mg/hr IV infusion', titration: 'Increase by 2.5mg/hr every 5-15 minutes', maxDose: '15mg/hr' },
  ],
  guideline: 'AHA/ASA 2026 Guidelines: BP must be <185/110 before tPA administration',
};

const INCLUSION_CRITERIA: CriteriaItem[] = [
  {
    id: 'diagnosis',
    label: 'Diagnosis of ischemic stroke causing measurable neurological deficit',
    plainEnglish: 'Patient must have clear stroke symptoms that can be measured and documented (not just vague complaints).',
  },
  {
    id: 'time_window',
    label: 'Symptom onset <3 hours (or <4.5 hours for select patients)',
    plainEnglish: 'Must know when patient was last normal. If <3h, standard criteria apply. If 3-4.5h, additional restrictions apply (no age >80, no diabetes+prior stroke, no anticoagulants, NIHSS ≤25).',
  },
  {
    id: 'age',
    label: 'Age ≥18 years',
    plainEnglish: 'Adult patients only. Pediatric stroke has different management protocols.',
  },
];

const ABSOLUTE_CONTRAINDICATIONS: AbsoluteItemWithSub[] = [
  {
    id: 'ich_on_ct',
    label: 'Intracranial hemorrhage on CT',
    plainEnglish: 'Any bleeding visible in the brain on CT scan. tPA could make bleeding catastrophically worse.',
  },
  {
    id: 'significant_head_trauma',
    label: 'Significant head trauma in previous 3 months',
    plainEnglish: 'Recent head injury creates fragile brain tissue at high risk for bleeding with tPA.',
  },
  {
    id: 'prior_stroke_3mo',
    label: 'Prior ischemic stroke in previous 3 months',
    plainEnglish: 'Recent stroke tissue is fragile and at very high risk of bleeding. Wait 3 months before considering tPA for new stroke.',
  },
  {
    id: 'prior_ich',
    label: 'History of intracranial hemorrhage',
    plainEnglish: 'Ever had brain bleeding in the past. High risk it could happen again with tPA.',
  },
  {
    id: 'sah_symptoms',
    label: 'Symptoms suggest subarachnoid hemorrhage',
    plainEnglish: 'Thunderclap headache or signs of bleeding around brain. Get vascular imaging before tPA.',
  },
  {
    id: 'ic_surgery',
    label: 'Recent intracranial or intraspinal surgery',
    plainEnglish: 'Surgery in brain or spine within past 3 months. Surgical site could bleed catastrophically.',
  },
  {
    id: 'severe_htn',
    label: 'Elevated blood pressure (SBP >185 or DBP >110 mm Hg)',
    plainEnglish: 'High BP must be lowered first. Above 185/110 greatly increases brain bleeding risk. Give BP meds, wait for it to stabilize, then reassess.',
  },
  {
    id: 'active_bleeding',
    label: 'Active internal bleeding',
    plainEnglish: "Currently bleeding anywhere in body. tPA prevents clotting so bleeding won't stop.",
  },
  {
    id: 'bleeding_diathesis',
    label: 'Acute bleeding diathesis, including but not limited to:',
    plainEnglish: 'Any condition that makes blood unable to clot properly. See specific items below.',
    subCriteria: [
      { id: 'platelets', label: 'Platelet count <100,000/mm³', plainEnglish: "Too few platelets means blood cannot clot. tPA would cause dangerous bleeding." },
      { id: 'heparin_aptt', label: 'Heparin within 48h resulting in elevated aPTT', plainEnglish: "Recent heparin makes blood too thin. Check aPTT - if elevated, blood won't clot properly with tPA." },
      { id: 'warfarin_inr', label: 'Current anticoagulant use with INR >1.7 or PT >15 seconds', plainEnglish: 'On warfarin/Coumadin with blood too thin (INR >1.7). Adding tPA causes severe bleeding. If INR ≤1.7, tPA is okay.' },
      { id: 'doac', label: 'Direct thrombin or factor Xa inhibitors with elevated labs (aPTT, INR, platelet count, ECT, TT, or factor Xa assays)', plainEnglish: 'On newer blood thinners (Eliquis, Xarelto, Pradaxa, Savaysa). If taken within 48h OR if drug-specific lab tests are elevated, do NOT give tPA. Check: anti-Xa level for Eliquis/Xarelto/Savaysa, ECT or dilute thrombin time for Pradaxa.' },
    ],
  },
  {
    id: 'hypoglycemia',
    label: 'Blood glucose <50 mg/dL',
    plainEnglish: 'Low blood sugar can cause stroke-like symptoms. Give dextrose, recheck glucose, then reassess if symptoms persist.',
  },
  {
    id: 'ct_large_infarct',
    label: 'CT shows multilobar infarction (hypodensity >1/3 cerebral hemisphere)',
    plainEnglish: 'Too much brain already dead (large dark area on CT). Extremely high risk of massive brain swelling and fatal bleeding.',
  },
];

const RELATIVE_CONTRAINDICATIONS: CriteriaItem[] = [
  {
    id: 'minor_rapid',
    label: 'Minor or rapidly improving stroke symptoms (clearing spontaneously)',
    plainEnglish: "Mild symptoms that are getting better on their own. But if symptoms are still disabling even if mild, tPA is recommended. Don't delay treatment to watch for improvement - time is brain.",
  },
  {
    id: 'pregnancy',
    label: 'Pregnancy',
    plainEnglish: "tPA doesn't cross placenta but could cause maternal bleeding. For severe disabling stroke, benefit may outweigh risk. Get OB consult immediately.",
  },
  {
    id: 'seizure_onset',
    label: 'Seizure at stroke onset with postictal residual neurological impairments',
    plainEnglish: "Seizure at start makes diagnosis tricky - could be Todd's paralysis (temporary weakness after seizure) rather than stroke. If imaging shows real stroke, tPA is reasonable.",
  },
  {
    id: 'major_surgery',
    label: 'Major surgery or serious trauma within previous 14 days',
    plainEnglish: 'Recent surgery site could bleed with tPA. Weigh stroke severity against surgical bleeding risk. Get surgery team involved.',
  },
  {
    id: 'gi_gu_bleed',
    label: 'Recent GI or GU hemorrhage (within previous 21 days)',
    plainEnglish: 'Recent bleeding from stomach/intestines/urinary tract. Could start bleeding again with tPA, but if stroke is severe, may be worth risk.',
  },
  {
    id: 'recent_mi',
    label: 'Recent acute myocardial infarction (within previous 3 months)',
    plainEnglish: 'Recent heart attack. Damaged heart could rupture with tPA. For severe stroke, benefit may outweigh risk - discuss with cardiology.',
  },
  {
    id: 'arterial_puncture',
    label: 'Arterial puncture at non-compressible site in previous 7 days',
    plainEnglish: "Recent artery access (like subclavian line) at site that can't be compressed to stop bleeding if it starts.",
  },
];

const EXTENDED_WINDOW_EXCLUSIONS: CriteriaItem[] = [
  { id: 'age_80', label: 'Age >80 years', plainEnglish: 'In the 3-4.5h window specifically, age >80 is excluded (but >80 is fine in 0-3h window!).' },
  { id: 'anticoagulant_any', label: 'Taking oral anticoagulants regardless of INR', plainEnglish: 'In 3-4.5h window, any oral blood thinner use excludes patient even if INR is normal.' },
  { id: 'nihss_25', label: 'NIHSS >25', plainEnglish: 'Very severe stroke in extended window has uncertain benefit. These patients are fine in 0-3h window.' },
  { id: 'stroke_diabetes', label: 'History of both diabetes and prior stroke', plainEnglish: 'This combination in 3-4.5h window is excluded, but okay in 0-3h window.' },
  { id: 'large_infarct_imaging', label: 'Imaging evidence of ischemic injury involving >1/3 MCA territory', plainEnglish: 'Large area of damage visible on imaging. Too much brain at risk in extended window.' },
];

function getAbsoluteLabel(id: string): string {
  for (const item of ABSOLUTE_CONTRAINDICATIONS) {
    if (item.id === id) return item.label;
    for (const sub of item.subCriteria || []) {
      if (sub.id === id) return sub.label;
    }
  }
  return id;
}

function getRelativeLabel(id: string): string {
  return RELATIVE_CONTRAINDICATIONS.find(c => c.id === id)?.label ?? id;
}

export const ThrombolysisEligibilityModal: React.FC<ThrombolysisEligibilityModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData,
}) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Eligibility State (2024 criteria)
  const [inclusionCriteria, setInclusionCriteria] = useState<Record<string, boolean>>({
    diagnosis: false,
    time_window: false,
    age: false,
  });
  const [absoluteContraindications, setAbsoluteContraindications] = useState<Record<string, boolean>>(
    initialData?.absoluteContraindications.reduce((acc, id) => ({ ...acc, [id]: true }), {}) || {}
  );
  const [relativeContraindications, setRelativeContraindications] = useState<Record<string, boolean>>(
    initialData?.relativeContraindications.reduce((acc, id) => ({ ...acc, [id]: true }), {}) || {}
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  useEffect(() => {
    if (initialData) {
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const eligibilityStatus = useMemo(() => {
    const inclusionMet = inclusionCriteria.diagnosis && inclusionCriteria.time_window && inclusionCriteria.age;
    const absoluteContras = Object.entries(absoluteContraindications)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    const relativeContras = Object.entries(relativeContraindications)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);

    if (!inclusionMet) {
      return {
        status: 'not-eligible' as const,
        title: 'DOES NOT MEET CRITERIA',
        message: 'Not all inclusion criteria are satisfied.',
        color: 'red',
        icon: '✗',
      };
    }

    if (absoluteContras.length > 0) {
      return {
        status: 'absolute-contraindication' as const,
        title: 'IV tPA CONTRAINDICATED',
        message: `Absolute contraindication present. Do not administer IV tPA. Consider mechanical thrombectomy.`,
        color: 'red',
        icon: '✗',
      };
    }

    if (relativeContras.length > 0) {
      return {
        status: 'relative-contraindication' as const,
        title: 'RELATIVE CONTRAINDICATION',
        message: 'Consider risks vs benefits. May proceed with caution or consider endovascular therapy.',
        color: 'yellow',
        icon: '⚠',
      };
    }

    return {
      status: 'eligible' as const,
      title: 'ELIGIBLE FOR IV tPA',
      message: 'Patient meets criteria for thrombolysis. Proceed if no other concerns.',
      color: 'green',
      icon: '✓',
    };
  }, [inclusionCriteria, absoluteContraindications, relativeContraindications]);

  const handleComplete = () => {
    const absoluteContras = Object.entries(absoluteContraindications)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    const relativeContras = Object.entries(relativeContraindications)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    const inclusionMet = inclusionCriteria.diagnosis && inclusionCriteria.time_window && inclusionCriteria.age;

    onComplete?.({
      lkwTime: null,
      timeDifferenceHours: null,
      inclusionCriteriaMet: inclusionMet,
      absoluteContraindications: absoluteContras,
      relativeContraindications: relativeContras,
      eligibilityStatus: eligibilityStatus.status,
      notes,
    });
    onClose();
  };

  const copyToEMR = () => {
    const absoluteContras = Object.entries(absoluteContraindications)
      .filter(([_, checked]) => checked)
      .map(([id]) => getAbsoluteLabel(id));
    const relativeContras = Object.entries(relativeContraindications)
      .filter(([_, checked]) => checked)
      .map(([id]) => getRelativeLabel(id));

    const emrText = `IV tPA ELIGIBILITY ASSESSMENT (AHA/ASA 2026)
${'='.repeat(50)}

INCLUSION CRITERIA:
${inclusionCriteria.diagnosis ? '✓' : '✗'} Diagnosis of ischemic stroke causing measurable neurological deficit
${inclusionCriteria.time_window ? '✓' : '✗'} Symptom onset <3h (or <4.5h for select patients)
${inclusionCriteria.age ? '✓' : '✗'} Age ≥18 years

ELIGIBILITY STATUS: ${eligibilityStatus.title}
${eligibilityStatus.message}

${absoluteContras.length > 0 ? `ABSOLUTE CONTRAINDICATIONS:\n${absoluteContras.map(c => `- ${c}`).join('\n')}\n` : ''}
${relativeContras.length > 0 ? `RELATIVE CONTRAINDICATIONS:\n${relativeContras.map(c => `- ${c}`).join('\n')}\n` : ''}
${notes ? `NOTES:\n${notes}\n` : ''}

Assessment Date: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(emrText).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" role="dialog" aria-labelledby="modal-title">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">IV tPA Eligibility Assessment</h2>
              <p className="text-sm text-gray-500">Inclusion & exclusion checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content - Checklist only */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Inclusion Criteria - 2024 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Inclusion Criteria
            </h3>
            <div className="space-y-4">
              {INCLUSION_CRITERIA.map((item) => (
                <div key={item.id} className="border-l-4 border-emerald-500 pl-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={inclusionCriteria[item.id] || false}
                      onChange={(e) => setInclusionCriteria(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-900 mb-1">
                        {item.label}
                      </div>
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:underline font-medium">
                          → What does this mean?
                        </summary>
                        <div className="mt-2 text-sm text-slate-700 bg-blue-50 p-4 rounded-lg leading-relaxed">
                          {item.plainEnglish}
                        </div>
                      </details>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-tPA Blood Pressure Management */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-red-600 rounded-lg flex-shrink-0">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-900 mb-1">
                      Pre-tPA Blood Pressure Management
                    </h3>
                    <p className="text-sm text-red-700 font-medium">
                      BP must be {'<'}185/110 mmHg before tPA administration
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <h4 className="text-sm font-bold text-red-900 mb-3 uppercase tracking-wide">
                      Treatment Options:
                    </h4>
                    <div className="space-y-3">
                      {PRE_TPA_BP_MANAGEMENT.medications.map((med, idx) => (
                        <div key={idx} className="pl-4 border-l-2 border-red-300">
                          <div className="font-bold text-red-900">{med.name}</div>
                          <div className="text-xs text-red-700 mt-1 space-y-0.5">
                            <div>• Dose: {med.dose}</div>
                            {'frequency' in med && <div>• {med.frequency}</div>}
                            {'titration' in med && <div>• {med.titration}</div>}
                            <div>• Max: {med.maxDose}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-xs text-red-800 font-medium">
                      <strong>Guideline:</strong> {PRE_TPA_BP_MANAGEMENT.guideline}
                    </p>
                  </div>
                </div>
              </div>

          {/* Absolute Contraindications - 2024 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Absolute Contraindications</h3>
            <p className="text-xs text-slate-600 mb-4">Check each that applies to this patient.</p>
            <div className="space-y-4">
              {ABSOLUTE_CONTRAINDICATIONS.map((item) => (
                <div key={item.id} className="mb-4 border-l-4 border-rose-500 pl-4">
                  {item.subCriteria ? (
                    <>
                      <div className="font-semibold text-rose-900 mb-1">{item.label}</div>
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:underline font-medium">
                          → What does this mean?
                        </summary>
                        <div className="mt-2 text-sm text-slate-700 bg-blue-50 p-4 rounded-lg leading-relaxed">
                          {item.plainEnglish}
                        </div>
                      </details>
                      <div className="ml-4 mt-3 space-y-3">
                        {item.subCriteria.map((sub) => (
                          <div key={sub.id}>
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={absoluteContraindications[sub.id] || false}
                                onChange={(e) => setAbsoluteContraindications(prev => ({ ...prev, [sub.id]: e.target.checked }))}
                                className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                              />
                              <div className="text-sm font-medium text-slate-800">• {sub.label}</div>
                            </label>
                            <details className="ml-6 mt-1">
                              <summary className="text-xs text-blue-600 cursor-pointer hover:underline">→ Explain</summary>
                              <div className="mt-2 text-xs text-slate-600 bg-blue-50 p-3 rounded leading-relaxed">
                                {sub.plainEnglish}
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={absoluteContraindications[item.id] || false}
                          onChange={(e) => setAbsoluteContraindications(prev => ({ ...prev, [item.id]: e.target.checked }))}
                          className="mt-1 w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-rose-900 mb-1">{item.label}</div>
                          <details className="mt-2">
                            <summary className="text-sm text-blue-600 cursor-pointer hover:underline font-medium">
                              → What does this mean?
                            </summary>
                            <div className="mt-2 text-sm text-slate-700 bg-blue-50 p-4 rounded-lg leading-relaxed">
                              {item.plainEnglish}
                            </div>
                          </details>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-wider pt-6 pb-3">Relative Contraindications</h3>
            <p className="text-xs text-slate-600 mb-4">Consider risks vs benefits. Check each that applies.</p>
            <div className="space-y-4">
              {RELATIVE_CONTRAINDICATIONS.map((item) => (
                <div key={item.id} className="mb-4 border-l-4 border-amber-500 pl-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={relativeContraindications[item.id] || false}
                      onChange={(e) => setRelativeContraindications(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 mb-1">{item.label}</div>
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:underline font-medium">
                          → What does this mean?
                        </summary>
                        <div className="mt-2 text-sm text-slate-700 bg-blue-50 p-4 rounded-lg leading-relaxed">
                          {item.plainEnglish}
                        </div>
                      </details>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Extended Window (3-4.5h) Additional Exclusions */}
          <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl">
            <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined">schedule</span>
              Additional Exclusions for 3-4.5 Hour Window
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              If treating in the 3-4.5h window, these ADDITIONAL criteria exclude the patient (on top of all the above):
            </p>
            <div className="space-y-3">
              {EXTENDED_WINDOW_EXCLUSIONS.map((item) => (
                <div key={item.id} className="mb-3">
                  <div className="font-medium text-amber-900">• {item.label}</div>
                  <div className="ml-4 text-sm text-amber-700 mt-1">{item.plainEnglish}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document any additional considerations..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={copyToEMR}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            {copiedToClipboard ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to EMR</span>
              </>
            )}
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              {onComplete ? 'Cancel' : 'Close'}
            </button>
            {onComplete && (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
              >
                Complete Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
