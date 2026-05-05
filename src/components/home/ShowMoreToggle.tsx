// HOME_SPEC §1.5 — Show more / Show less button
// HOME_SPEC §1.5.2 — visual contract (white, slate border, no tint)
// HOME_SPEC §1.5.3 — labels and chevron
import React from 'react';

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
}

export const ShowMoreToggle: React.FC<Props> = ({ isExpanded, onToggle }) => {
  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={onToggle}
      className="flex items-center justify-center gap-1.5 w-full py-[13px] mt-6 bg-white border border-slate-200 rounded-[12px] text-[13px] font-medium text-slate-500 cursor-pointer hover:border-[var(--color-neuro-500)] hover:text-[var(--color-neuro-500)] transition-[border-color,color] duration-[120ms]"
    >
      <span>{isExpanded ? 'Show less' : 'Show more scenarios'}</span>
      <svg
        className="w-[14px] h-[14px] transition-transform duration-[160ms] ease-out"
        style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
};

export default ShowMoreToggle;
