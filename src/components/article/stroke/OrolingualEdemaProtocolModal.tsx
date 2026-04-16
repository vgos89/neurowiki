import React, { useEffect, useRef } from 'react';
import { X, Copy } from 'lucide-react';

const TITLE = 'Orolingual Angioedema Protocol (Post-Thrombolysis)';
const SUBTITLE = 'AHA/ASA 2026, Table 6; Refs 53–54.';

const STEPS = [
  { title: 'Maintain airway', body: 'Awake fiberoptic intubation preferred. Nasal-tracheal route carries epistaxis risk. Cricothyroidotomy rarely needed.' },
  { title: 'Discontinue thrombolytic and hold ACE inhibitors', body: 'Stop IV thrombolytic immediately. Hold ACE inhibitors (ACEi-induced angioedema).' },
  { title: 'Medications', body: 'Methylprednisolone 125 mg IV, Diphenhydramine 50 mg IV, Ranitidine 50 mg IV OR Famotidine 20 mg IV.' },
  { title: 'If progression', body: 'Epinephrine 0.1% (1 mg/mL) 0.3 mL SC, OR 0.5 mg nebulized.' },
  { title: 'Advanced (if available)', body: 'Icatibant 30 mg SC (repeat q6h, max 3 doses/24 h), OR C1 esterase inhibitor 20 IU/kg.' },
  { title: 'Supportive care', body: 'Continue airway and hemodynamic support as needed.' },
];

function buildEmrText(): string {
  const lines = [
    TITLE,
    `Date/Time: ${new Date().toLocaleString()}`,
    '',
    ...STEPS.map((s, i) => `${i + 1}. ${s.title}. ${s.body}`),
    '',
    'References: AHA/ASA 2026, Table 6; Refs 53–54.',
  ];
  return lines.join('\n');
}

interface OrolingualEdemaProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
}

export function OrolingualEdemaProtocolModal({ isOpen, onClose, onCopySuccess }: OrolingualEdemaProtocolModalProps) {
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
        aria-labelledby="orolingual-modal-title"
        aria-describedby="orolingual-modal-desc"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 bg-white flex items-start justify-between gap-4">
          <div>
            <h2 id="orolingual-modal-title" className="text-base font-semibold text-slate-900 tracking-tight">
              Orolingual Edema
            </h2>
            <p id="orolingual-modal-desc" className="text-xs text-slate-400 mt-0.5">
              AHA/ASA 2026 · Table 6 · Post-thrombolysis
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
          <div className="border-l-2 border-amber-400 pl-4 mb-6">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Airway risk</p>
            <p className="text-sm text-slate-600 mt-0.5"><strong>Lower risk:</strong> Anterior tongue/lips only. <strong>Higher risk:</strong> Larynx, palate, floor of mouth, oropharynx, or rapid progression (&lt;30 min).</p>
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
            References: AHA/ASA 2026, Table 6; Refs 53–54.
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

export default OrolingualEdemaProtocolModal;
