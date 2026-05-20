import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Shield } from 'lucide-react';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { isValidInitials, type SavedCase, SAVED_CASE_SCHEMA_VERSION } from '../../lib/cases/types';
import { saveCase, newCaseId, getCase } from '../../lib/cases/store';

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
  /** Callback that returns the calculator-specific data to embed in the case.
   *  Receives `{ saveAbsoluteTimestamps }` so the caller can convert its
   *  in-memory absolute timestamps to relative-offset storage when the
   *  clinician opted into the HIPAA-friendly default. */
  buildData: (opts: { saveAbsoluteTimestamps: boolean }) => SavedCase['data'];
  /** Called after successful save with the case id (new or existing). */
  onSaved?: (id: string) => void;
  /** When set, the modal updates this case row in place (same id, original
   *  createdAt preserved, updatedAt bumped) instead of creating a new row.
   *  Initials pre-fill from the existing case so the clinician sees
   *  what they're updating, not a blank form. */
  existingCaseId?: string;
  /** True if this calculator/source captures stroke timestamps that benefit
   *  from the absolute-vs-relative storage choice. Toggles the disclosure
   *  + checkbox in the modal. NIHSS = true. Other calculators = false. */
  hasStrokeTimestamps?: boolean;
  /** True when at least one stroke-code timestamp has actually been
   *  stamped in the current session. Drives the smart default — when a
   *  real code is in progress the checkbox defaults ON so the clinician
   *  doesn't have to tick it to preserve quality-metric timing.
   *  Compliance-legal Finding 6 follow-up (2026-05-19). */
  hasFilledStrokeTimestamps?: boolean;
}

export const SaveCaseModal: React.FC<SaveCaseModalProps> = ({
  isOpen,
  onClose,
  source,
  buildData,
  onSaved,
  existingCaseId,
  hasStrokeTimestamps = false,
  hasFilledStrokeTimestamps = false,
}) => {
  const [initials, setInitials] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Preserved when updating an existing case so createdAt doesn't reset. */
  const [existingCreatedAt, setExistingCreatedAt] = useState<number | null>(null);
  /** Compliance-legal Finding 6 option (c): default is HIPAA-friendly
   *  relative-elapsed storage. Clinicians opt into absolute timestamps when
   *  they need them for quality-metric documentation (door-to-needle, etc.). */
  const [saveAbsoluteTimestamps, setSaveAbsoluteTimestamps] = useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  useModalFocusTrap(isOpen, onClose, dialogRef, inputRef);

  // Reset / pre-fill state on open. If an existingCaseId is set, look it up
  // and pre-fill initials so the clinician sees what they're updating.
  // Note field input was removed 2026-05-19 (HIPAA risk) but the field is
  // preserved in storage so legacy cases display their note in the detail view.
  React.useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSaving(false);
    // Smart default for the keep-wall-clock-times checkbox: when stamps
    // are filled in the current session, default ON (clinician was
    // actually running a code → quality-metric data matters). When
    // empty, default OFF (no quality data to preserve). Per compliance-
    // legal Finding 6 follow-up (2026-05-19).
    setSaveAbsoluteTimestamps(hasFilledStrokeTimestamps);
    if (existingCaseId) {
      getCase(existingCaseId).then((existing) => {
        if (existing) {
          setInitials(existing.initials);
          setNote(existing.note ?? '');
          setExistingCreatedAt(existing.createdAt);
          // When editing an existing case, the saved mode wins over the
          // smart default — a re-save preserves the clinician's earlier
          // choice rather than silently changing storage shape.
          if (existing.data.strokeTimestampsMode === 'absolute') {
            setSaveAbsoluteTimestamps(true);
          } else if (existing.data.strokeTimestampsMode === 'relative') {
            setSaveAbsoluteTimestamps(false);
          }
        } else {
          // Case was deleted from /my-cases between saves — fall back to new.
          setInitials('');
          setNote('');
          setExistingCreatedAt(null);
        }
      }).catch(() => {
        setInitials('');
        setNote('');
        setExistingCreatedAt(null);
      });
    } else {
      setInitials('');
      setNote('');
      setExistingCreatedAt(null);
    }
  }, [isOpen, existingCaseId, hasFilledStrokeTimestamps]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);
    if (!isValidInitials(initials)) {
      setError('Use exactly 2 uppercase letters (first-initial + last-initial).');
      return;
    }
    setSaving(true);
    try {
      const now = Date.now();
      const id = existingCaseId ?? newCaseId();
      const createdAt = existingCreatedAt ?? now;
      const c: SavedCase = {
        id,
        createdAt,
        updatedAt: now,
        initials,
        note: note.trim() || undefined,
        source,
        data: buildData({ saveAbsoluteTimestamps }),
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
    // Auto-uppercase + strip non-letters; cap at 2 chars (V audit 2026-05-19
    // — permitting more let clinicians type short full names like "Jen").
    const cleaned = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
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
              {existingCaseId ? 'Update case' : 'Save case'}
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
              maxLength={2}
              aria-describedby="case-initials-help"
              className="w-full px-3 py-2.5 text-base text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-neuro-500 focus:outline-none focus:ring-1 focus:ring-neuro-500 placeholder:text-slate-300 tracking-widest font-semibold uppercase"
            />
            <p id="case-initials-help" className="text-[11px] text-slate-500 mt-1">
              First initial + last initial. Two uppercase letters, nothing more.
            </p>
          </div>

          {/* Note input removed 2026-05-19 (V audit) — the free-text field
              was a HIPAA risk because nothing prevented a clinician from
              typing a full patient name. The `note` field is preserved in
              the SavedCase schema so existing cases display their note in
              the detail view; only the input is removed. New cases will
              have no note. */}

          {/* Stroke-timestamp storage opt-in. Default OFF = HIPAA-friendly
              relative-elapsed storage. Toggle ON when the clinician needs
              wall-clock times for quality metrics. Copy rewritten per
              humanizer pass (V audit 2026-05-19) — dropped AI-tic em-dash
              connectors, "e.g.", and the abstract noun "identifiability"
              for a direct clinical voice. */}
          {hasStrokeTimestamps && (
            <label className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={saveAbsoluteTimestamps}
                onChange={(e) => setSaveAbsoluteTimestamps(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-neuro-500 focus:ring-neuro-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold">Keep wall-clock times</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Off saves stamps as elapsed offsets ("+12m", "+18m") so the record can't be tied to a specific time of day. Turn on when you need exact times for door-to-needle reporting.
                </span>
              </span>
            </label>
          )}

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
            {saving ? 'Saving…' : (existingCaseId ? 'Update case' : 'Save case')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SaveCaseModal;
