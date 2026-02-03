import React, { useEffect, useRef } from 'react';
import { X, Copy, AlertCircle } from 'lucide-react';

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
        className="relative w-full max-w-4xl max-h-[90vh] min-h-[80vh] sm:min-h-0 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orolingual-modal-title"
        aria-describedby="orolingual-modal-desc"
      >
        {/* Sticky header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden />
            </div>
            <div>
              <h2 id="orolingual-modal-title" className="text-xl font-bold text-slate-900">
                {TITLE}
              </h2>
              <p id="orolingual-modal-desc" className="text-sm text-amber-700 font-medium">
                {SUBTITLE}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
            aria-label="Close Orolingual Angioedema Protocol"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-amber-900 mb-2">Airway risk</p>
            <p className="text-sm text-amber-800">
              <strong>Lower risk:</strong> Anterior tongue/lips only.{' '}
              <strong>Higher risk:</strong> Larynx, palate, floor of mouth, oropharynx, or rapid progression (&lt;30 min).
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
            References: AHA/ASA 2026, Table 6; Refs 53–54.
          </p>
        </div>

        {/* Sticky footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
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

export default OrolingualEdemaProtocolModal;
