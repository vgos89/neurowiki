/**
 * ShareButton — sibling icon button to Copy.
 *
 * Renders the share/upload arrow glyph. On click, invokes shareOrCopy(text)
 * which opens the native share sheet on mobile or falls back to clipboard
 * on desktop. Designed to sit next to existing Copy buttons across the
 * pathway + calculator surface — see CalculatorHeader integration and
 * the per-page consumers updated in this commit.
 *
 * Built 2026-05-17 per V direction. Same touch-target + spec-token rules
 * as the Copy button it sits beside.
 */
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { shareOrCopy, type ShareOrCopyResult } from '../../utils/shareOrCopy';

export interface ShareButtonProps {
  /** Plain-text payload to share or copy. Can be a string or a lazy
   *  builder (called on each click) — lazy form is useful when the text
   *  depends on state that may change between renders. */
  text: string | (() => string);
  /** Optional title for the OS share sheet (e.g. "NIHSS", "Stroke Code"). */
  title?: string;
  /** Called with the action result so the consumer can show a toast.
   *  'shared' = native share sheet completed; 'copied' = clipboard
   *  fallback used; 'cancelled' = user dismissed the share sheet (no
   *  toast); 'failed' = nothing worked (clipboard blocked). */
  onResult?: (result: ShareOrCopyResult) => void;
  /** Visual variant. Default: 'pill' (matches Copy button in calc header). */
  variant?: 'pill' | 'icon';
  /** Optional override label for the pill variant. Defaults to "Send". */
  label?: string;
  /** Optional extra className for layout tweaks at the call site. */
  className?: string;
  /** Optional disabled state — pass true when there's no text to send. */
  disabled?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  text,
  title,
  onResult,
  variant = 'pill',
  label = 'Send',
  className = '',
  disabled = false,
}) => {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      const payload = typeof text === 'function' ? text() : text;
      const result = await shareOrCopy(payload, title ? { title } : {});
      onResult?.(result);
    } finally {
      setBusy(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || busy}
        aria-label={`${label} this note`}
        title={label}
        className={`p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-neuro-600 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      >
        <Share2 size={17} aria-hidden="true" />
      </button>
    );
  }

  // 'pill' variant — icon-only on mobile (< 640px), icon + label on sm+ (tablet/desktop).
  // Matches the responsive treatment of Copy and Save in CalculatorHeader so the
  // right cluster stays within budget at 375px.
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      aria-label={`${label} this note`}
      className={`p-2 sm:ml-1.5 sm:px-4 bg-white border border-neuro-200 hover:bg-neuro-50 text-neuro-700 rounded-full text-sm font-medium transition-colors min-h-[44px] min-w-[44px] sm:min-w-0 flex items-center justify-center sm:gap-1.5 sm:py-2 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <Share2 size={15} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default ShareButton;
