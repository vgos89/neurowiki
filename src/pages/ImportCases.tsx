import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, AlertTriangle, RefreshCw, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { createReceiveSession, pollForCases, TRANSFER_TTL_MIN } from '../lib/cases/transfer';
import { saveCase } from '../lib/cases/store';
import type { SavedCase } from '../lib/cases/types';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * /import — receive a case transfer from another device under Option Q
 * (2026-05-19). Receiver-initiated asymmetric flow.
 *
 * Stages:
 *   1. 'generating' — generate ECDH keypair, INSERT session row.
 *   2. 'waiting'    — display 5-digit code + QR + countdown. Poll the
 *                     relay every 2 s for the sender's ciphertext.
 *   3. 'decrypting' — sender uploaded; decrypt locally, save to IDB.
 *   4. 'done'       — confirmation + link back to My Cases.
 *   5. 'error'      — recoverable; "Start over" restarts at 'generating'.
 *
 * Security posture: the ephemeral private key lives only in this
 * component's state. It is never uploaded, never persisted. When the
 * tab closes, the key is gone — phone receives an explicit "this code
 * is no longer active" error if it tries to send after.
 */

type Stage = 'generating' | 'waiting' | 'decrypting' | 'done' | 'error';

const ImportCases: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('generating');
  const [code, setCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TRANSFER_TTL_MIN * 60);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number>(0);

  const privateKeyRef = useRef<CryptoKey | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const syncReady = isSupabaseConfigured();

  // ─── Session lifecycle ────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    if (!syncReady) {
      setError('Sync is not configured on this device.');
      setStage('error');
      return;
    }
    setStage('generating');
    setError(null);
    setCode(null);
    setQrDataUrl(null);
    setExpiresAt(null);
    setSecondsRemaining(TRANSFER_TTL_MIN * 60);
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const session = await createReceiveSession();
      if (abort.signal.aborted) return;
      privateKeyRef.current = session.privateKey;
      setCode(session.code);
      setExpiresAt(session.expiresAt);
      setStage('waiting');
      // Begin polling. pollForCases throws on expiry / explicit error.
      try {
        const { cases } = await pollForCases(session.code, session.privateKey, abort.signal);
        if (abort.signal.aborted) return;
        setStage('decrypting');
        // Merge into local IDB. saveCase is upsert by id — collisions are
        // overwritten by the incoming version.
        for (const c of cases) {
          await saveCase(c as SavedCase);
        }
        setImportedCount(cases.length);
        setStage('done');
      } catch (e) {
        if (abort.signal.aborted) return;
        setError(e instanceof Error ? e.message : 'Could not receive transfer.');
        setStage('error');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start session.');
      setStage('error');
    }
  }, [syncReady]);

  // Start on mount; clean up on unmount.
  useEffect(() => {
    void startSession();
    return () => { abortRef.current?.abort(); };
  }, [startSession]);

  // Countdown when in waiting stage.
  useEffect(() => {
    if (stage !== 'waiting' || !expiresAt) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [stage, expiresAt]);

  // Generate QR when code becomes available.
  useEffect(() => {
    if (!code) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(code, {
      width: 240,
      margin: 1,
      color: { dark: '#1746A2', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [code]);

  // ─── Render ───────────────────────────────────────────────────────────

  const mm = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const ss = (secondsRemaining % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => { abortRef.current?.abort(); navigate(-1); }}
            aria-label="Back"
            className="p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          <div className="min-w-0 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Receive cases
            </span>
            <h1 className="text-[18px] font-semibold text-slate-900 leading-tight tracking-tight mt-0.5">
              From another device
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">

        {/* GENERATING stage */}
        {stage === 'generating' && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-neuro-500 animate-spin mx-auto mb-4" aria-hidden />
            <p className="text-sm text-slate-700">Preparing a receive session…</p>
            <p className="text-xs text-slate-500 mt-1">A code will appear in a second.</p>
          </div>
        )}

        {/* WAITING stage */}
        {stage === 'waiting' && code && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-100 rounded-xl p-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Your code
              </p>
              <p className="text-[48px] font-mono font-bold text-slate-900 tracking-[0.15em] leading-none mb-4">
                {code}
              </p>
              <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto leading-relaxed">
                On the phone, open <span className="font-semibold">My Cases → Send</span>, then type this code or scan the QR.
              </p>
              {qrDataUrl && (
                <div className="flex justify-center mb-3">
                  <img
                    src={qrDataUrl}
                    alt="QR code for transfer"
                    className="w-44 h-44 rounded-lg border border-slate-100"
                  />
                </div>
              )}
              <p className="text-xs text-slate-500">
                Code valid for{' '}
                <span className="font-mono font-semibold text-slate-700">{mm}:{ss}</span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-start gap-3">
              <Smartphone className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 mb-0.5">
                  Waiting for the phone to send…
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Once the phone uploads, the cases land here automatically. Encryption stays on the devices — the server only holds an opaque ciphertext.
                </p>
              </div>
              <Loader2 className="w-4 h-4 text-neuro-500 animate-spin flex-shrink-0" aria-hidden />
            </div>

            <button
              type="button"
              onClick={() => startSession()}
              className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden />
              Cancel and start over
            </button>
          </div>
        )}

        {/* DECRYPTING stage */}
        {stage === 'decrypting' && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 text-neuro-500 animate-spin mx-auto mb-4" aria-hidden />
            <p className="text-sm text-slate-700">Decrypting cases on this device…</p>
          </div>
        )}

        {/* DONE stage */}
        {stage === 'done' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
              <Check className="w-8 h-8 text-emerald-600" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1.5">
              {importedCount} {importedCount === 1 ? 'case' : 'cases'} imported
            </h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed mb-5">
              The encrypted package on the server has been deleted. Cases are now on this device only.
            </p>
            <button
              type="button"
              onClick={() => navigate('/my-cases')}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-full bg-neuro-500 hover:bg-neuro-600 text-white text-sm font-semibold transition-colors"
            >
              Open My Cases
            </button>
          </div>
        )}

        {/* ERROR stage */}
        {stage === 'error' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-800 mb-0.5">Could not receive</p>
                <p className="text-sm text-red-700 leading-relaxed">{error ?? 'Something went wrong.'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => startSession()}
              className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden />
              Start over
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ImportCases;
