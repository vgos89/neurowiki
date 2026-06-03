
export interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleProps {
  options: [ToggleOption, ToggleOption];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Segmented 2-option control. v4 token sheet §3.
 *
 * Track:   12px radius · #f1f5f9 bg · 3px uniform padding
 * Pill:    9px radius  · white    · 0 1px 4px rgba(15,23,42,0.08) shadow
 * Motion:  bg+shadow 220ms cubic-bezier(0.16,1,0.3,1) · color 120ms ease
 * Hover:   inactive text #64748b → #334155, no bg change (120ms ease)
 * ARIA:    role=tablist/tab · arrow-key navigation · aria-selected
 */
export function Toggle({ options, value, onChange, className }: ToggleProps) {
  return (
    <div
      role="tablist"
      className={`flex bg-slate-100 p-[3px] rounded-[12px] ${className ?? ''}`}
      style={{ gap: '2px' }}
    >
      {options.map((opt, idx) => {
        const isActive = opt.value === value;
        const otherIdx = idx === 0 ? 1 : 0;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                onChange(options[otherIdx].value);
                const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
                tabs?.[otherIdx]?.focus();
              }
            }}
            className={`
              flex-1 rounded-[9px] text-[13px] font-medium text-center select-none
              ${isActive
                ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(15,23,42,0.08)]'
                : 'text-slate-500 hover:text-[#334155]'
              }
            `}
            style={{
              padding: '9px 16px',
              transition:
                'background 220ms cubic-bezier(0.16,1,0.3,1), color 120ms ease, box-shadow 220ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
