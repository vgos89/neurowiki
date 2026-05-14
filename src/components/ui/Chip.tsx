import React from 'react';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Quick-access chip for the hero chip rail. v4 token sheet §2.
 *
 * Radius: 9999px  · Padding: 6px 14px  · Font: 12px/500
 * Active:  cobalt-soft bg + rgba(23,70,162,0.2) border + cobalt text
 * Default: white bg + slate-200 border + slate-500 text
 */
export function Chip({ children, active, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
 inline-flex items-center gap-[5px] px-[14px] py-[6px] rounded-full
 text-[12px] font-medium border whitespace-nowrap flex-shrink-0
 transition-colors touch-manipulation
 ${
 active
 ? 'bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2]'
 : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
 }
 ${className ?? ''}
 `}
    >
      {children}
    </button>
  );
}
