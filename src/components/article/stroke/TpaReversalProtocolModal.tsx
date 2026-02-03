import React, { useEffect, useRef } from 'react';
import { X, Copy, AlertTriangle } from 'lucide-react';

const TITLE = 'tPA/TNK Reversal Protocol (Symptomatic Intracranial Hemorrhage)';
const SUBTITLE = 'AHA/ASA 2026, Table 5 – Act in sequence; do not delay imaging or reversal.';

const STEPS = [
  { title: 'Stop thrombolytic', body: 'Stop alteplase infusion or tenecteplase immediately.' },
  { title: 'Emergent labs', body: 'CBC, PT (INR), aPTT, fibrinogen, type & cross.' },
  { title: 'Emergent nonenhanced head CT', body: 'Obtain stat to confirm and assess hemorrhage.' },
  { title: 'Cryoprecipitate', body: '10 units IV over 10–30 min; goal fibrinogen ≥150 mg/dL.' },
  { title: 'Antifibrinolytic', body: 'Tranexamic acid 1000 mg IV over 10 min, OR ε-aminocaproic acid 4–5 g IV over 1 h, then 1 g IV until bleeding controlled.' },
  { title: 'Consults', body: 'Hematology, Neurosurgery.' },
  { title: 'Supportive care', body: 'BP, ICP, CPP, MAP, temperature, glucose control. Do not use platelet transfusion routinely; reserve for severe thrombocytopenia or planned surgery. Trend fibrinogen until goal; repeat CT as clinically indicated.' },
];

function buildEmrText(): string {
  const lines = [
    TITLE,
    `Date/Time: ${new Date().toLocaleString()}`,
    '',
    ...STEPS.map((s, i) => `${i + 1}. ${s.title}. ${s.body}`),
    '',
    'References: AHA/ASA 2026 Acute Ischemic Stroke Guideline, Table 5.',
  ];
  return lines.join('\n');
}

interface TpaReversalProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
}

export function TpaReversalProtocolModal({ isOpen, onClose, onCopySuccess }: TpaReversalProtocolModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        previousActiveElement.current?.focus?.();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    const text = buildEmrText();
    navigator.clipboard.writeText(text).then(() => {
      onCopySuccess?.();
    });
  };

  const handleClose = () => {
    previousActiveElement.current?.focus?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-4xl max-h-[90vh] min-h-[80vh] sm:min-h-0 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tpa-reversal-modal-title"
        aria-describedby="tpa-reversal-modal-desc"
      >
        {/* Sticky header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden />
            </div>
            <div>
              <h2 id="tpa-reversal-modal-title" className="text-xl font-bold text-slate-900">
                {TITLE}
              </h2>
              <p id="tpa-reversal-modal-desc" className="text-sm text-red-700 font-medium">
                {SUBTITLE}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
            aria-label="Close tPA/TNK Reversal Protocol"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-red-900">
              Life-threatening bleeding – follow steps in order. Do not delay imaging or reversal.
            </p>
          </div>
          <ol className="space-y-4 list-decimal list-inside">
            {STEPS.map((step, i) => (
              <li key={i} className="text-slate-800">
                <span className="font-bold text-slate-900">{step.title}.</span>{' '}
                <span className="text-sm sm:text-base">{step.body}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-slate-500">
            References: AHA/ASA 2026 Acute Ischemic Stroke Guideline, Table 5.
          </p>
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Copy className="w-4 h-4" aria-hidden />
            Copy to EMR
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TpaReversalProtocolModal;
