import React, { useEffect, useRef } from 'react';
import { X, Copy } from 'lucide-react';

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
        className="relative w-full max-w-lg max-h-[90vh] sm:min-h-0 bg-white rounded-2xl overflow-hidden flex flex-col"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tpa-reversal-modal-title"
        aria-describedby="tpa-reversal-modal-desc"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 bg-white flex items-start justify-between gap-4">
          <div>
            <h2 id="tpa-reversal-modal-title" className="text-base font-semibold text-slate-900 tracking-tight">
              tPA/TNK Reversal
            </h2>
            <p id="tpa-reversal-modal-desc" className="text-xs text-slate-400 mt-0.5">
              AHA/ASA 2026 · Act in sequence, do not delay
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="border-l-2 border-red-400 pl-4 mb-6">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Life-threatening</p>
            <p className="text-sm text-slate-600 mt-0.5">Follow steps in order. Do not delay imaging or reversal.</p>
          </div>
          <div className="space-y-5">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xs font-bold text-neuro-500 flex-shrink-0 mt-0.5 w-5 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            References: AHA/ASA 2026 Acute Ischemic Stroke Guideline, Table 5.
          </p>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-h-[44px] bg-neuro-500 hover:bg-neuro-600 text-white text-sm font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" aria-hidden />
            Copy to EMR
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TpaReversalProtocolModal;
