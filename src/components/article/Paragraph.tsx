import React, { useState } from 'react';

interface ParagraphProps {
  children: React.ReactNode;
  detail?: React.ReactNode;
  viewMode: 'quick' | 'detailed';
  /**
   * Optional clinical claim tag (CLAUDE.md §13.4 jsx surface). When set, it is
   * rendered as a data-claim attribute on the paragraph so the prose is caught
   * by the pre-commit claim scanner (check-claims.ts). Lets clinical copy
   * authored inside Paragraph carry a scannable claim tag.
   */
  'data-claim'?: string;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  children,
  detail,
  viewMode,
  'data-claim': dataClaim,
}) => {
  const [manualExpanded, setManualExpanded] = useState(false);
  const isExpanded = viewMode === 'detailed' || manualExpanded;

  return (
    <p className="mb-5 leading-relaxed text-slate-700" data-claim={dataClaim}>
      {children}
      {detail && (
        <>
          {!isExpanded && viewMode === 'quick' && (
            <span 
              onClick={() => setManualExpanded(true)}
              className="ml-1 text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium"
            >
              [+]
            </span>
          )}
          {isExpanded && (
            <>
              <span className="text-slate-600"> {detail}</span>
              {viewMode === 'quick' && (
                <span 
                  onClick={() => setManualExpanded(false)}
                  className="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
                >
                  [−]
                </span>
              )}
            </>
          )}
        </>
      )}
    </p>
  );
};
