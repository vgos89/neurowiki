import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Send, Camera, Loader2, Check, AlertTriangle, KeyRound } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { listCases } from '../../lib/cases/store';
import { sendCases } from '../../lib/cases/transfer';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { SavedCase } from '../../lib/cases/types';
import { getSavedCaseHeadline } from '../../lib/cases/format';
import { formatClinicalDateShort } from '../../utils/clinicalDateTime';

/**
 * SendCasesModal — phone-side sender flow under the asymmetric Option Q
 * model (2026-05-19).
 *
 * Stages:
 *   1. 'select'    — list saved cases with checkboxes (all selected by
 *                    default). User unchecks ones to exclude. Per-case
 *                    selection is V's audit request.
 *   2. 'enter-code'— receiver opens /import on their other device, which
 *                    shows a 5-digit code. User types it here OR taps
 *                    "Scan QR" to use the phone camera.
 *   3. 'scanning'  — html5-qrcode active. Stops on successful scan.
 *   4. 'sending'   — encrypt + UPDATE the relay row.
 *   5. 'done'      — confirmation.
 *   6. 'error'     — recoverable; "Try again" returns to 'enter-code'.
 *
 * No PIN. Encryption is ECDH with the receiver's ephemeral public key
 * fetched from the relay by code. Receiver's private key never crosses
 * the wire. See `src/lib/crypto/caseCipher.ts` for the envelope.
 */

interface SendCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, the modal pre-selects only these case ids (skip the
   *  selection stage). Used by CaseDetailModal's "Send this case" button. */
  initialCaseIds?: string[];
}

type Stage = 'select' | 'enter-code' | 'scanning' | 'sending' | 'done' | 'error';

const QR_REGION_ID = 'send-cases-qr-region';

export const SendCasesModal: React.FC<SendCasesModalProps> = ({
  isOpen,
  onClose,
  initialCaseIds,
}) => {
  const [stage, setStage] = useState<Stage>('select');
  const [cases, setCases] = useState<SavedCase[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [code, setCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number>(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  useModalFocusTrap(isOpen, onClose, dialogRef, codeInputRef);

  // ─── Lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      // Stop any running scanner on close.
      void stopScanning();
      return;
    }
    // Reset everything on open.
    setStage('select');
    setCode('');
    setScanError(null);
    setError(null);
    setSentCount(0);
    listCases().then((all) => {
      setCases(all);
      // Pre-select either the caller-specified subset or everything.
      const initial = initialCaseIds && initialCaseIds.length > 0
        ? new Set(initialCaseIds.filter((id) => all.some((c) => c.id === id)))
        : new Set(all.map((c) => c.id));
      setSelectedIds(initial);
      // If initialCaseIds was passed, jump past selection — V's "tap
      // a case → Send this case" flow.
      if (initialCaseIds && initialCaseIds.length > 0) {
        setStage('enter-code');
      }
    }).catch(() => setCases([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* noop */ }
      try { scannerRef.current.clear(); } catch { /* noop */ }
      scannerRef.current = null;
    }
  }, []);

  // ─── Stage transitions ────────────────────────────────────────────────

  const handleStartScan = async () => {
    setScanError(null);
    setStage('scanning');
    // One frame so the QR region div mounts.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    try {
      const scanner = new Html5Qrcode(QR_REGION_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          // QR encodes the 5-digit code. Strip anything non-digit defensively.
          const cleaned = decoded.replace(/[^0-9]/g, '').slice(0, 5);
          if (cleaned.length === 5) {
            setCode(cleaned);
            void stopScanning();
            setStage('enter-code');
          }
        },
        // Frame-level errors fire constantly while no QR is in view —
        // ignore them. Camera-permission / start errors fire below.
        () => { /* noop */ }
      );
    } catch (e) {
      setScanError(e instanceof Error ? e.message : 'Could not start camera.');
      setStage('enter-code');
    }
  };

  const handleCancelScan = async () => {
    await stopScanning();
    setStage('enter-code');
  };

  const handleSend = async () => {
    if (code.length !== 5 || !cases) return;
    if (!isSupabaseConfigured()) {
      setError('Sync is not available on this device.');
      setStage('error');
      return;
    }
    const toSend = cases.filter((c) => selectedIds.has(c.id));
    if (toSend.length === 0) {
      setError('Select at least one case to send.');
      return;
    }
    setStage('sending');
    setError(null);
    try {
      await sendCases(code, toSend);
      setSentCount(toSend.length);
      setStage('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send.');
      setStage('error');
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────

  if (!isOpen) return null;

  const selectedCount = selectedIds.size;

  const content = (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-cases-title"
        className="relative w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-lg border border-slate-100 max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Send cases
            </p>
            <h2 id="send-cases-title" className="text-base font-semibold text-slate-900 tracking-tight">
              {stage === 'select' && 'Pick which to send'}
              {stage === 'enter-code' && 'Enter the code from your other device'}
              {stage === 'scanning' && 'Scan the QR code'}
              {stage === 'sending' && 'Sending…'}
              {stage === 'done' && 'Sent'}
              {stage === 'error' && 'Could not send'}
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

        {/* SELECT stage */}
        {stage === 'select' && (
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose which saved cases to send. They'll be encrypted on this device before they leave.
            </p>
            {cases === null && (
              <div className="text-center py-8 text-sm text-slate-500">Loading…</div>
            )}
            {cases && cases.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-500">
                You don't have any saved cases yet.
              </div>
            )}
            {cases && cases.length > 0 && (
              <>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{selectedCount} of {cases.length} selected</span>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(
                      selectedCount === cases.length ? new Set() : new Set(cases.map((c) => c.id))
                    )}
                    className="text-neuro-600 hover:text-neuro-700 font-medium"
                  >
                    {selectedCount === cases.length ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <ul className="space-y-1.5 max-h-[40dvh] overflow-y-auto -mx-1 px-1">
                  {cases.map((c) => {
                    const selected = selectedIds.has(c.id);
                    return (
                      <li key={c.id}>
                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selected
                            ? 'bg-neuro-50/60 border-neuro-200'
                            : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelected(c.id)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-neuro-500 focus:ring-neuro-500 focus:ring-offset-0 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold text-slate-900 tracking-[0.01em]">
                                {c.initials}
                              </span>
                              <span className="text-[10px] font-medium uppercase tracking-[0.04em] text-slate-400">
                                {formatClinicalDateShort(new Date(c.createdAt))}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 truncate">{getSavedCaseHeadline(c)}</p>
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <button
              type="button"
              onClick={() => setStage('enter-code')}
              disabled={selectedCount === 0}
              className={`w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                selectedCount === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-neuro-500 hover:bg-neuro-600 text-white'
              }`}
            >
              Continue with {selectedCount} {selectedCount === 1 ? 'case' : 'cases'}
            </button>
          </div>
        )}

        {/* ENTER-CODE stage */}
        {stage === 'enter-code' && (
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              On your other device, open <span className="font-semibold">Receive case from phone</span> (the desktop rail has a link). You'll see a 5-digit code. Enter it below, or tap <span className="font-semibold">Scan QR</span> to use your camera.
            </p>
            <div>
              <label htmlFor="send-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                5-digit code
              </label>
              <input
                id="send-code"
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 5));
                  if (error) setError(null);
                }}
                placeholder="—————"
                maxLength={5}
                className="w-full px-3 py-3 text-3xl text-center text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-neuro-500 focus:outline-none focus:ring-1 focus:ring-neuro-500 placeholder:text-slate-200 tracking-[0.4em] font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleStartScan}
              className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" aria-hidden />
              Scan QR code instead
            </button>
            {scanError && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                {scanError}
              </p>
            )}
            {error && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleSend}
              disabled={code.length !== 5}
              className={`w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
                code.length !== 5
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-neuro-500 hover:bg-neuro-600 text-white'
              }`}
            >
              <Send className="w-4 h-4" aria-hidden />
              Send {selectedCount} {selectedCount === 1 ? 'case' : 'cases'}
            </button>
          </div>
        )}

        {/* SCANNING stage */}
        {stage === 'scanning' && (
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed text-center">
              Point your camera at the QR code on your other device.
            </p>
            <div id={QR_REGION_ID} className="w-full max-w-[280px] mx-auto rounded-xl overflow-hidden border border-slate-200" />
            <button
              type="button"
              onClick={handleCancelScan}
              className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Cancel scan
            </button>
          </div>
        )}

        {/* SENDING stage */}
        {stage === 'sending' && (
          <div className="px-5 py-10 flex flex-col items-center text-center">
            <Loader2 className="w-8 h-8 text-neuro-500 animate-spin mb-3" aria-hidden />
            <p className="text-sm text-slate-700">Encrypting and uploading…</p>
            <p className="text-xs text-slate-500 mt-1">Usually takes a couple seconds.</p>
          </div>
        )}

        {/* DONE stage */}
        {stage === 'done' && (
          <div className="px-5 py-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-emerald-600" aria-hidden />
            </div>
            <p className="text-base font-semibold text-slate-900 mb-1">
              Sent {sentCount} {sentCount === 1 ? 'case' : 'cases'}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your other device should show them now. The encrypted package is gone from the server.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* ERROR stage */}
        {stage === 'error' && (
          <div className="px-5 py-5 space-y-3">
            <div className="flex items-start gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-red-700 leading-relaxed">
                {error ?? 'Something went wrong.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setStage('enter-code'); setError(null); }}
              className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors inline-flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" aria-hidden />
              Try a different code
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default SendCasesModal;
