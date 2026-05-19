import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Shield } from 'lucide-react';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { isValidInitials, type SavedCase, SAVED_CASE_SCHEMA_VERSION } from '../../lib/cases/types';
import { saveCase, newCaseId } from '../../lib/cases/store';

/**
 * SaveCaseModal — prompts the clinician for initials + optional note, then
 * persists the snapshot to IndexedDB.
 *
 * Privacy stance (V direction 2026-05-19):
 *   - Initials are the ONLY identifier ever stored
 *   - Input is validated to 2-4 uppercase letters; invalid input blocks save
 *   - Placeholder + helper text both emphasize "initials only"
 *   - A small Shield icon next to the title signals privacy intent
 *
 * The caller passes a `snapshot` function that builds the SavedCase['data']
 * at the moment of save (so calculator state at click time is captured).
 */

interface SaveCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Where this case is being saved from (e.g., NIHSS calculator). */
  source: SavedCase['source'];
  /** Callback that returns the calculator-specific data to embed in the case. */
  buildData: () => SavedCase['data'];
  /** Called after successful save with the new case id. */
  onSaved?: (id: string) => void;
}

export const SaveCaseModal: React.FC<SaveCaseModalProps> = ({
  isOpen,
  onClose,
  source,
  buildData,
  onSaved,
}) => {
  const [initials, setInitials] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  useModalFocusTrap(isOpen, onClose, dialogRef, inputRef);

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setInitials('');
      setNote('');
      setError(null);
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);
    if (!isValidInitials(initials)) {
      setError('Initials must be 2–4 uppercase letters.');
      return;
    }
    setSaving(true);
    try {
      const now = Date.now();
      const c: SavedCase = {
        id: newCaseId(),
        createdAt: now,
        updatedAt: now,
        initials,
        note: note.trim() || undefined,
        source,
        data: buildData(),
        schemaVersion: SAVED_CASE_SCHEMA_VERSION,
      };
      await saveCase(c);
      onSaved?.(c.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase + strip non-letters; cap at 4 chars
    const cleaned = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    setInitials(cleaned);
    if (error) setError(null);
  };

  // Portal to document.body so the modal escapes any ancestor with a
  // `backdrop-filter` (e.g. CalculatorHeader's backdrop-blur-md), which
  // creates a containing block that would otherwise trap a `fixed inset-0`
  // child to the header's bounds. (V audit 2026-05-19.)
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-case-title"
        className="relative w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-lg border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Save case
            </p>
            <h2 id="save-case-title" className="text-base font-semibold text-slate-900 tracking-tight">
              {source.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" aria-hidden />
          </button>
        </div>

        {/* Privacy callout */}
        <div className="mx-5 mb-4 p-3 bg-amber-50 border-l-2 border-amber-400 rounded-lg flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Initials only.</span> Never write the patient's full name, MRN, or date of birth. Cases are stored locally on this device only.
          </p>
        </div>

        {/* Form */}
        <div className="px-5 pb-4 space-y-4">
          <div>
            <label htmlFor="case-initials" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Patient initials
            </label>
            <input
              id="case-initials"
              ref={inputRef}
              type="text"
              value={initials}
              onChange={handleInitialsChange}
              placeholder="JD"
              autoComplete="off"
              autoCapitalize="characters"
              inputMode="text"
              maxLength={4}
              aria-describedby="case-initials-help"
              className="w-full px-3 py-2.5 text-base text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-neuro-500 focus:outline-none focus:ring-1 focus:ring-neuro-500 placeholder:text-slate-300 tracking-widest font-semibold uppercase"
            />
            <p id="case-initials-help" className="text-[11px] text-slate-500 mt-1">
              Initials only — 2 to 4 uppercase letters. Never the full name.
            </p>
          </div>

          <div>
            <label htmlFor="case-note" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Note <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="case-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 120))}
              placeholder="e.g., Bed 3, LVO ruled out"
              maxLength={120}
              className="w-full px-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-neuro-500 focus:outline-none focus:ring-1 focus:ring-neuro-500 placeholder:text-slate-300"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              A short reminder for yourself. {120 - note.length} characters left.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-[44px] px-4 py-2 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isValidInitials(initials)}
            className={`flex-1 min-h-[44px] px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              saving || !isValidInitials(initials)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-neuro-500 hover:bg-neuro-600 text-white'
            }`}
          >
            <Save className="w-4 h-4" aria-hidden />
            {saving ? 'Saving…' : 'Save case'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveCaseModal;
