import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight } from 'lucide-react';
import { listCases } from '../../lib/cases/store';
import type { SavedCase } from '../../lib/cases/types';
import { formatClinicalDateShort } from '../../utils/clinicalDateTime';

/**
 * SavedCasesTile — home-page section surfacing the clinician's saved cases.
 *
 * - Hidden entirely when no cases exist (clean home for new users).
 * - Shows count + last 1-2 cases as a Recent-Activity-style preview.
 * - Whole tile is one tap target → /my-cases.
 */

export const SavedCasesTile: React.FC = () => {
  const [cases, setCases] = useState<SavedCase[] | null>(null);

  useEffect(() => {
    listCases().then(setCases).catch(() => setCases([]));
  }, []);

  if (!cases || cases.length === 0) return null;

  const preview = cases.slice(0, 2);

  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Your saved cases
      </div>
      <Link
        to="/my-cases"
        className="block bg-white border border-slate-100 rounded-xl hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-shadow"
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neuro-50 border border-neuro-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-neuro-600" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 tracking-[0.01em]">
                {cases.length} {cases.length === 1 ? 'case' : 'cases'}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400">
                On this device
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden />
        </div>

        {/* Preview rows — most recent 2 cases */}
        <div className="border-t border-slate-50">
          {preview.map((c) => (
            <div key={c.id} className="px-4 py-2.5 border-b border-slate-50 last:border-b-0 flex items-center gap-3">
              <span className="text-xs font-bold text-neuro-700 tracking-wider w-10 text-center">
                {c.initials}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 truncate">
                  {c.data.nihss
                    ? `NIHSS ${c.data.nihss.score} · ${c.data.nihss.severity}`
                    : (() => {
                        const payload = c.data.payload;
                        if (payload) {
                          for (const key of Object.keys(payload)) {
                            const block = payload[key];
                            if (block?.headline) return block.headline;
                          }
                        }
                        return c.source.title;
                      })()}
                </p>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-[0.04em] text-slate-400 flex-shrink-0">
                {formatClinicalDateShort(new Date(c.createdAt))}
              </span>
            </div>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default SavedCasesTile;
