import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Trash2, FileText, Shield, Send, Download, ChevronRight } from 'lucide-react';
import { listCases, deleteCase, clearAllCases } from '../lib/cases/store';
import type { SavedCase } from '../lib/cases/types';
import { formatClinicalDateShort } from '../utils/clinicalDateTime';
import { SendCasesModal } from '../components/cases/SendCasesModal';
import { CaseDetailModal } from '../components/cases/CaseDetailModal';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * MyCases — list of cases the clinician has saved locally on this device.
 *
 * Layout: header with back arrow + title + clear-all action, then a list of
 * cards with the initials + source + date + NIHSS score (if applicable).
 *
 * Empty state explains the feature + privacy stance (initials only, on-device
 * only). Each case is tappable to view detail (deferred; for now we just
 * show the list and allow delete).
 */

const MyCases: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<SavedCase[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);
  const syncReady = isSupabaseConfigured();

  const openedCase = cases && openCaseId
    ? cases.find((c) => c.id === openCaseId) ?? null
    : null;

  const loadCases = useCallback(async () => {
    const list = await listCases();
    setCases(list);
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleDelete = async (id: string) => {
    await deleteCase(id);
    setPendingDelete(null);
    loadCases();
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all saved cases on this device? This cannot be undone.')) return;
    await clearAllCases();
    loadCases();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
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
                On this device
              </span>
              <h1 className="text-[18px] font-semibold text-slate-900 leading-tight tracking-tight mt-0.5">
                My Cases
              </h1>
            </div>
          </div>
          {cases && cases.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="min-h-[44px] px-3 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {/* Privacy banner */}
        <div className="mb-3 p-3 bg-amber-50 border-l-2 border-amber-400 rounded-lg flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-amber-900 leading-relaxed">
            Saved cases live <span className="font-semibold">only on this device</span>. Never share full names or identifying info; use initials only.
          </p>
        </div>

        {/* Transfer actions */}
        {syncReady && (
          <div className="mb-5 flex gap-2">
            <button
              type="button"
              onClick={() => setSendOpen(true)}
              disabled={!cases || cases.length === 0}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
                !cases || cases.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100'
                  : 'bg-white border border-neuro-200 text-neuro-700 hover:bg-neuro-50'
              }`}
            >
              <Send className="w-3.5 h-3.5" aria-hidden />
              Send to another device
            </button>
            <Link
              to="/import"
              className="flex-1 min-h-[44px] py-2.5 px-3 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" aria-hidden />
              Import from another device
            </Link>
          </div>
        )}

        {/* Loading */}
        {cases === null && (
          <div className="text-center py-12 text-sm text-slate-500">Loading…</div>
        )}

        {/* Empty state */}
        {cases && cases.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-neuro-50 border border-neuro-100 mb-4">
              <Briefcase className="w-6 h-6 text-neuro-600" aria-hidden />
            </div>
            <h2 className="text-base font-semibold text-slate-900 mb-1.5">No saved cases yet</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
              When you complete a calculator, tap "Save case" in the result drawer to keep a quick reference here.
            </p>
            <Link
              to="/calculators"
              className="inline-flex items-center gap-1.5 mt-5 min-h-[44px] px-5 py-2 rounded-full bg-neuro-500 hover:bg-neuro-600 text-white text-sm font-semibold transition-colors"
            >
              Browse calculators
            </Link>
          </div>
        )}

        {/* Case list */}
        {cases && cases.length > 0 && (
          <ul className="space-y-2" role="list">
            {cases.map((c) => (
              <li key={c.id}>
                <CaseRow
                  caseData={c}
                  pendingDelete={pendingDelete === c.id}
                  onRequestDelete={() => setPendingDelete(c.id)}
                  onCancelDelete={() => setPendingDelete(null)}
                  onConfirmDelete={() => handleDelete(c.id)}
                  onOpen={() => setOpenCaseId(c.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Send modal — encrypts cases with a 4-digit PIN and uploads to the
          Supabase transient relay. Receiver enters the code+PIN at /import. */}
      <SendCasesModal isOpen={sendOpen} onClose={() => setSendOpen(false)} />

      {/* Case detail modal — tap a row to view full EMR text, Copy, Send,
          Edit metadata (initials/note), or Delete. V audit 2026-05-19. */}
      <CaseDetailModal
        isOpen={!!openCaseId}
        caseData={openedCase}
        onClose={() => setOpenCaseId(null)}
        onChanged={loadCases}
        onRequestDelete={(id) => handleDelete(id)}
      />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Case row
// ──────────────────────────────────────────────────────────────────────────────

interface CaseRowProps {
  caseData: SavedCase;
  pendingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  /** Tap the row body to open detail modal. */
  onOpen: () => void;
}

const CaseRow: React.FC<CaseRowProps> = ({
  caseData,
  pendingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onOpen,
}) => {
  const headlineStat = (() => {
    if (caseData.data.nihss) {
      return `NIHSS ${caseData.data.nihss.score} · ${caseData.data.nihss.severity}`;
    }
    // Generic payload: each calc stores under its own id key with optional
    // headline + subline strings. We pick the first non-empty one.
    const payload = caseData.data.payload;
    if (payload) {
      for (const key of Object.keys(payload)) {
        const block = payload[key];
        if (block?.headline) return block.headline;
      }
    }
    return caseData.source.title;
  })();
  const sublineStat = (() => {
    const payload = caseData.data.payload;
    if (payload) {
      for (const key of Object.keys(payload)) {
        const block = payload[key];
        if (block?.subline) return block.subline;
      }
    }
    return null;
  })();

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3">
      {/* Tappable body — opens detail modal. Avatar + body in one button so
          tapping anywhere in the main area opens the case. Delete icon is a
          sibling so it doesn't get swallowed. V audit 2026-05-19. */}
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 min-w-0 flex items-start gap-3 text-left -m-1 p-1 rounded-lg hover:bg-slate-50 transition-colors"
        aria-label={`Open case for ${caseData.initials}`}
      >
        {/* Initials avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neuro-50 border border-neuro-100 flex items-center justify-center">
          <span className="text-sm font-bold text-neuro-700 tracking-wider">{caseData.initials}</span>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-900 tracking-[0.01em]">
              {caseData.initials}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.04em] text-slate-400">
              {formatClinicalDateShort(new Date(caseData.createdAt))}
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-snug">{headlineStat}</p>
          {sublineStat && (
            <p className="text-xs text-slate-500 leading-snug mt-0.5">{sublineStat}</p>
          )}
          {caseData.note && (
            <p className="text-xs text-slate-500 mt-1 leading-snug flex items-start gap-1.5">
              <FileText className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden />
              <span>{caseData.note}</span>
            </p>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-3" aria-hidden />
      </button>

      {/* Delete cluster */}
      {pendingDelete ? (
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onConfirmDelete}
            className="min-h-[36px] px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onCancelDelete}
            className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onRequestDelete}
          aria-label={`Delete case for ${caseData.initials}`}
          className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden />
        </button>
      )}
    </div>
  );
};

export default MyCases;
