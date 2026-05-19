import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Send, Copy, Check, Loader2 } from 'lucide-react';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { listCases } from '../../lib/cases/store';
import { createTransfer, TRANSFER_TTL_MIN } from '../../lib/cases/transfer';
import { isSupabaseConfigured } from '../../lib/supabase';

/**
 * SendCasesModal — wraps the cases-export flow:
 *   1. Prompt for 4-digit PIN
 *   2. Encrypt + POST to Supabase → 6-digit code
 *   3. Show large 6-digit code + QR
 *   4. User shares code + PIN with receiving device (text, in-person, etc.)
 *
 * Visibility: the row deletes the moment any client successfully fetches it;
 * a TTL sweep also purges expired rows. Window is 15 minutes.
 */

interface SendCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Stage = 'pin' | 'creating' | 'ready' | 'error';

export const SendCasesModal: React.FC<SendCasesModalProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<Stage>('pin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'code' | 'pin' | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TRANSFER_TTL_MIN * 60);

  const dialogRef = useRef<HTMLDivElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);
  useModalFocusTrap(isOpen, onClose, dialogRef, pinInputRef);

  // Reset all state on open
  useEffect(() => {
    if (isOpen) {
      setStage('pin');
      setPin('');
      setError(null);
      setCode(null);
      setExpiresAt(null);
      setQrDataUrl(null);
      setCopiedField(null);
      setSecondsRemaining(TRANSFER_TTL_MIN * 60);
    }
  }, [isOpen]);

  // Countdown
  useEffect(() => {
    if (stage !== 'ready' || !expiresAt) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [stage, expiresAt]);

  // Generate QR when code becomes available
  useEffect(() => {
    if (!code) return;
    QRCode.toDataURL(code, { width: 240, margin: 1, color: { dark: '#1746A2', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [code]);

  if (!isOpen) return null;

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(cleaned);
    if (error) setError(null);
  };

  const handleCreate = async () => {
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (!isSupabaseConfigured()) {
      setError('Sync is not available on this device.');
      return;
    }
    setStage('creating');
    setError(null);
    try {
      const cases = await listCases();
      if (cases.length === 0) {
        setStage('error');
        setError('No saved cases to send.');
        return;
      }
      const result = await createTransfer(cases, pin);
      setCode(result.code);
      setExpiresAt(result.expiresAt);
      setStage('ready');
    } catch (e) {
      setStage('error');
      setError(e instanceof Error ? e.message : 'Could not create transfer.');
    }
  };

  const handleCopy = async (kind: 'code' | 'pin', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(kind);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* noop */
    }
  };

  const mm = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const ss = (secondsRemaining % 60).toString().padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-cases-title"
        className="relative w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-lg border border-slate-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Send cases
            </p>
            <h2 id="send-cases-title" className="text-base font-semibold text-slate-900 tracking-tight">
              Transfer to another device
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

        {/* PIN stage */}
        {stage === 'pin' && (
          <div className="px-5 pb-5 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Cases stay encrypted. The other device will need both the transfer code AND the PIN you set here.
            </p>

            <div>
              <label htmlFor="send-pin" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Choose a 4-digit PIN
              </label>
              <input
                id="send-pin"
                ref={pinInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={handlePinChange}
                placeholder="• • • •"
                maxLength={4}
                className="w-full px-3 py-3 text-2xl text-center text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-neuro-500 focus:outline-none focus:ring-1 focus:ring-neuro-500 placeholder:text-slate-300 tracking-[0.4em] font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Pick something easy to share. Same PIN unlocks the cases on the other device.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleCreate}
              disabled={pin.length !== 4}
              className={`w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                pin.length !== 4
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-neuro-500 hover:bg-neuro-600 text-white'
              }`}
            >
              <Send className="w-4 h-4" aria-hidden />
              Create transfer
            </button>
          </div>
        )}

        {/* Creating stage */}
        {stage === 'creating' && (
          <div className="px-5 pb-10 pt-4 flex flex-col items-center text-center">
            <Loader2 className="w-8 h-8 text-neuro-500 animate-spin mb-3" aria-hidden />
            <p className="text-sm text-slate-700">Encrypting and uploading…</p>
            <p className="text-xs text-slate-500 mt-1">Usually takes a couple seconds.</p>
          </div>
        )}

        {/* Ready stage — show code + QR */}
        {stage === 'ready' && code && (
          <div className="px-5 pb-5 space-y-4">
            {/* Transfer code */}
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Transfer code
              </p>
              <p className="text-[40px] font-mono font-bold text-slate-900 tracking-[0.15em] leading-none mb-3">
                {code.slice(0, 3)} {code.slice(3)}
              </p>
              <button
                type="button"
                onClick={() => handleCopy('code', code)}
                className="min-h-[36px] px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors inline-flex items-center gap-1.5"
              >
                {copiedField === 'code' ? (
                  <><Check className="w-3 h-3 text-emerald-600" aria-hidden /> Copied</>
                ) : (
                  <><Copy className="w-3 h-3" aria-hidden /> Copy code</>
                )}
              </button>
            </div>

            {/* QR */}
            {qrDataUrl && (
              <div className="flex justify-center">
                <img src={qrDataUrl} alt="QR code for transfer" className="w-44 h-44 rounded-lg border border-slate-100" />
              </div>
            )}

            {/* PIN reminder */}
            <div className="bg-amber-50 border-l-2 border-amber-400 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold">Remember the PIN:</span> the other device needs both the code AND your 4-digit PIN to open the cases. The PIN was never sent anywhere — you share it separately.
              </p>
            </div>

            {/* Expiry timer */}
            <p className="text-center text-xs text-slate-500">
              {secondsRemaining > 0
                ? <>Code valid for <span className="font-mono font-semibold text-slate-700">{mm}:{ss}</span></>
                : <span className="text-red-600 font-semibold">Code expired. Start over to get a new one.</span>}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Error stage */}
        {stage === 'error' && (
          <div className="px-5 pb-5 space-y-3">
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-3 leading-relaxed">
              {error ?? 'Something went wrong.'}
            </p>
            <button
              type="button"
              onClick={() => setStage('pin')}
              className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendCasesModal;
