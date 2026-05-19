import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, KeyRound, Check, Loader2, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchTransfer } from '../lib/cases/transfer';
import { saveCase } from '../lib/cases/store';
import type { SavedCase } from '../lib/cases/types';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * /import — receive a case transfer from another device.
 *
 * Flow:
 *   1. Enter the 6-digit code (typed or scanned via QR)
 *   2. Enter the 4-digit PIN the sender chose
 *   3. Fetch the encrypted blob from Supabase (server deletes the row on
 *      successful fetch — one-time read)
 *   4. Decrypt client-side → import cases into local IndexedDB
 *
 * Cases are MERGED into the local store: if a case with the same id already
 * exists, it's overwritten by the incoming version. Two clinicians on
 * different devices independently saving cases for the same patient produce
 * different ids, so merge collisions are rare in practice.
 */

const QR_REGION_ID = 'import-qr-region';

const ImportCases: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
    setError(null);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
    setError(null);
  };

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* noop */ }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleStartScan = async () => {
    setScanError(null);
    setScanning(true);
    // Wait one frame so the QR region div mounts
    requestAnimationFrame(async () => {
      try {
        scannerRef.current = new Html5Qrcode(QR_REGION_ID);
        await scannerRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 220 },
          (decodedText) => {
            const cleaned = decodedText.replace(/[^0-9]/g, '').slice(0, 6);
            if (cleaned.length === 6) {
              setCode(cleaned);
              stopScanning();
            }
          },
          () => { /* per-frame failure callback — no-op (expected when no QR in frame) */ },
        );
      } catch (e) {
        setScanError(
          e instanceof Error && e.message.includes('Permission')
            ? 'Camera permission denied. Type the code instead.'
            : 'Could not start the camera. Type the code instead.',
        );
        setScanning(false);
        scannerRef.current = null;
      }
    });
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { /* noop */ });
      }
    };
  }, []);

  const handleImport = async () => {
    setError(null);
    if (code.length !== 6) {
      setError('Transfer code must be 6 digits.');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be 4 digits.');
      return;
    }
    if (!isSupabaseConfigured()) {
      setError('Sync is not available on this device.');
      return;
    }
    setImporting(true);
    try {
      const { cases } = await fetchTransfer(code, pin);
      let imported = 0;
      for (const c of cases) {
        await saveCase(c as SavedCase);
        imported += 1;
      }
      setSuccess(imported);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  if (success !== null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg max-w-sm w-full p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 mb-3">
            <Check className="w-6 h-6 text-emerald-600" aria-hidden />
          </div>
          <h1 className="text-base font-semibold text-slate-900 mb-1">
            Imported {success} {success === 1 ? 'case' : 'cases'}
          </h1>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            Your cases are now saved on this device.
          </p>
          <button
            type="button"
            onClick={() => navigate('/my-cases')}
            className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors"
          >
            View cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          <div className="min-w-0 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Receive transfer
            </span>
            <h1 className="text-[18px] font-semibold text-slate-900 leading-tight tracking-tight mt-0.5">
              Import cases
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          Enter the 6-digit transfer code from the sending device, plus the 4-digit PIN they chose.
        </p>

        {/* QR scan / scanner region */}
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              QR scan
            </span>
            {scanning && (
              <button
                type="button"
                onClick={stopScanning}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" aria-hidden /> Stop
              </button>
            )}
          </div>
          {!scanning && (
            <button
              type="button"
              onClick={handleStartScan}
              className="w-full min-h-[44px] py-2.5 rounded-lg bg-neuro-50 hover:bg-neuro-100 text-neuro-700 border border-neuro-200 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" aria-hidden />
              Scan QR code
            </button>
          )}
          <div
            id={QR_REGION_ID}
            className={scanning ? 'rounded-lg overflow-hidden' : 'hidden'}
            aria-live="polite"
          />
          {scanError && (
            <p role="alert" className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
              {scanError}
            </p>
          )}
        </div>

        {/* Manual code entry */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
          <div>
            <label htmlFor="import-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transfer code
            </label>
            <input
              id="import-code"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={handleCodeChange}
              placeholder="• • • • • •"
              maxLength={6}
              className="w-full px-3 py-3 text-2xl text-center text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-neuro-500 focus:outline-none focus:ring-1 focus:ring-neuro-500 placeholder:text-slate-300 tracking-[0.4em] font-mono"
            />
          </div>

          <div>
            <label htmlFor="import-pin" className="block text-xs font-semibold text-slate-700 mb-1.5">
              <KeyRound className="w-3 h-3 inline -mt-0.5 mr-1" aria-hidden />
              4-digit PIN
            </label>
            <input
              id="import-pin"
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
              The PIN the sender chose. Never typed into Supabase or any server.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-3 leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={importing || code.length !== 6 || pin.length !== 4}
          className={`w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
            importing || code.length !== 6 || pin.length !== 4
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-neuro-500 hover:bg-neuro-600 text-white'
          }`}
        >
          {importing && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
          {importing ? 'Importing…' : 'Import cases'}
        </button>
      </main>
    </div>
  );
};

export default ImportCases;
