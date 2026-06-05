import React from 'react';
import type { PhenotypeMatch } from '../../../data/clinicHeadacheData';

/**
 * Met / still-needed criteria renderer for a single ICHD-3 phenotype match.
 *
 * Moved verbatim out of ClinicHeadachePathway.tsx (where it was a page-local
 * helper) so both the page's inline treatment cards and the HeadacheResultList
 * accordion render the identical criteria list from ONE source — architect
 * §17.1 condition (resolve CriteriaList ownership: option a, single shared
 * module). Logic and strings are unchanged from the page original.
 */
export const CriteriaList: React.FC<{ match: PhenotypeMatch }> = ({ match }) => (
  <div className="px-4 py-3">
    {match.metCriteria.length > 0 && (
      <ul className="space-y-2 mb-2">
        {match.metCriteria.map((c) => (
          <li key={c.id} className="text-[13px] text-emerald-700 flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5">✓</span>
            <div className="flex-1 min-w-0">
              <span>{c.label}</span>
              {c.contributingChipLabels.length > 0 && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Based on your selection:{' '}
                  <span className="text-slate-700">{c.contributingChipLabels.join(', ')}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
    {match.missingCriteria.length > 0 && (
      <ul className="space-y-1">
        {match.missingCriteria.map((c) => (
          <li key={c.id} className="text-[13px] text-slate-500 flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5">○</span>
            <span>Still needed: {c.label}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default CriteriaList;
