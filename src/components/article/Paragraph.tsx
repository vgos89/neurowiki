import React, { useState } from 'react';

interface ParagraphProps {
  children: React.ReactNode;
  detail?: React.ReactNode;
  viewMode: 'quick' | 'detailed';
}

export const Paragraph: React.FC<ParagraphProps> = ({ children, detail, viewMode }) => {
  const [manualExpanded, setManualExpanded] = useState(false);
  const isExpanded = viewMode === 'detailed' || manualExpanded;
  
  return (
    <p className="mb-5 leading-relaxed text-slate-700">
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
