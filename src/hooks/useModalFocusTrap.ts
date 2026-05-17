/**
 * useModalFocusTrap — accessible modal focus + keyboard hook.
 *
 * Wires:
 *   - Focus-on-open: when isOpen flips true, save the previously focused
 *     element, then focus initialFocusRef (or first focusable in dialog).
 *   - Return-focus-on-close: restore focus to the previously active
 *     element when isOpen flips false or when the user closes.
 *   - Escape closes via onClose callback.
 *   - Tab / Shift-Tab cycles within the dialog (true focus trap, not
 *     just initial focus).
 *
 * Required by every modal in this codebase to satisfy:
 *   - WCAG 2.4.3 (focus order)
 *   - WCAG 4.1.2 (name, role, value — implicit dialog modality)
 *   - WCAG 2.1.1 (keyboard) — Escape + Tab cycling
 *
 * Created 2026-05-17 to consolidate the focus-trap pattern across
 * ProtocolModal + ThrombectomyPathwayModal + inline NIHSS modal in
 * StrokeBasicsWorkflowV2. Each consumer previously implemented
 * partial focus behavior (open-focus + Escape only, no Tab trap) or
 * nothing at all.
 *
 * Consumer responsibilities NOT handled by this hook (must be on the
 * dialog element directly):
 *   - role="dialog" aria-modal="true"
 *   - aria-labelledby / aria-describedby pointing at title/description
 *   - The visual modal anatomy + backdrop
 *
 * @param isOpen          Modal visibility flag.
 * @param onClose         Callback when Escape is pressed.
 * @param dialogRef       Ref to the dialog container element.
 * @param initialFocusRef Optional: element to receive focus on open
 *                        (defaults to first focusable in the dialog,
 *                        which is usually the close button).
 */
import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useModalFocusTrap(
  isOpen: boolean,
  onClose: () => void,
  dialogRef: React.RefObject<HTMLElement | null>,
  initialFocusRef?: React.RefObject<HTMLElement | null>
): void {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus-on-open + return-focus-on-close
  useEffect(() => {
    if (!isOpen) {
      // On close, restore focus if we previously saved one
      previousActiveElement.current?.focus?.();
      previousActiveElement.current = null;
      return;
    }
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    // Defer so the dialog is in the DOM
    const t = setTimeout(() => {
      const target = initialFocusRef?.current ?? getFirstFocusable(dialogRef.current);
      target?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen, dialogRef, initialFocusRef]);

  // Escape + Tab-cycle trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = getFocusables(dialog);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, dialogRef]);
}

function getFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null
  );
}

function getFirstFocusable(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  return getFocusables(root)[0] ?? null;
}
