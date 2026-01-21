import React, { useState } from 'react';

interface TermProps {
  children: React.ReactNode;
  detail: string;
}

export const Term: React.FC<TermProps> = ({ children, detail }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <>
      <span 
        onClick={() => setExpanded(!expanded)}
        className={`cursor-pointer border-b border-dotted transition-colors ${
          expanded 
            ? 'text-blue-700 border-blue-300' 
            : 'border-slate-400 hover:border-slate-600'
        }`}
      >
        {children}
      </span>
      {expanded && (
        <span className="text-slate-500 italic"> — {detail}</span>
      )}
    </>
  );
};
