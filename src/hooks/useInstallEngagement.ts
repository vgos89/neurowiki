import { useEffect, useState, useCallback } from 'react';

/**
 * useInstallEngagement — tracks "is this user engaged enough that we should
 * suggest installing the app?" via localStorage. Thresholds (V-approved):
 *
 *   3 sessions OR 3 distinct calculator/pathway uses → eligible for prompt
 *
 * Plus dismissal limits to avoid pestering:
 *
 *   - Bubble shown max 3 times total per device
 *   - Minimum 7 days between bubble appearances
 *   - Bubble suppressed forever after user clicks "Install" or explicit "Don't ask again"
 *
 * Detects already-installed state via a separate hook; this hook does NOT
 * suppress on install state — that's the caller's job (so we don't increment
 * counters meaninglessly for installed users).
 */

const STORAGE_KEY = 'neurowiki:install-engagement:v1';
const SESSION_FLAG = 'neurowiki:session-counted:v1'; // sessionStorage; per-tab session

interface EngagementState {
  /** Number of distinct browser sessions since install-prompt logic shipped. */
  sessionCount: number;
  /** Distinct calculator/pathway IDs the user has opened. */
  toolsUsed: string[];
  /** Number of times the install bubble has been shown. */
  bubbleShownCount: number;
  /** Timestamp (ms) of the last bubble appearance. */
  bubbleLastShownAt: number | null;
  /** User permanently dismissed (clicked "Don't ask again" or installed). */
  permanentlyDismissed: boolean;
}

const EMPTY: EngagementState = {
  sessionCount: 0,
  toolsUsed: [],
  bubbleShownCount: 0,
  bubbleLastShownAt: null,
  permanentlyDismissed: false,
};

function load(): EngagementState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function save(state: EngagementState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota or disabled — silently noop
  }
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_THRESHOLD = 3;
const TOOLS_THRESHOLD = 3;
const MAX_SHOWN = 3;

export function useInstallEngagement() {
  const [state, setState] = useState<EngagementState>(load);

  // On mount: increment sessionCount once per tab (using sessionStorage as the
  // per-tab flag so refreshes don't increment).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    sessionStorage.setItem(SESSION_FLAG, '1');
    setState((prev) => {
      const next = { ...prev, sessionCount: prev.sessionCount + 1 };
      save(next);
      return next;
    });
  }, []);

  /** Call when the user opens a calculator or pathway. Tracks distinct ids. */
  const recordToolUse = useCallback((toolId: string) => {
    setState((prev) => {
      if (prev.toolsUsed.includes(toolId)) return prev;
      const next = { ...prev, toolsUsed: [...prev.toolsUsed, toolId] };
      save(next);
      return next;
    });
  }, []);

  /** Whether the install bubble should be visible right now. */
  const shouldShowBubble = (() => {
    if (state.permanentlyDismissed) return false;
    if (state.bubbleShownCount >= MAX_SHOWN) return false;
    if (state.bubbleLastShownAt && Date.now() - state.bubbleLastShownAt < SEVEN_DAYS_MS) return false;
    return state.sessionCount >= SESSION_THRESHOLD || state.toolsUsed.length >= TOOLS_THRESHOLD;
  })();

  /** Call when the bubble is actually shown to the user. */
  const markBubbleShown = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        bubbleShownCount: prev.bubbleShownCount + 1,
        bubbleLastShownAt: Date.now(),
      };
      save(next);
      return next;
    });
  }, []);

  /** Call when the user permanently dismisses (clicks Install, "Don't ask again", etc.). */
  const dismissPermanently = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, permanentlyDismissed: true };
      save(next);
      return next;
    });
  }, []);

  return {
    shouldShowBubble,
    markBubbleShown,
    dismissPermanently,
    recordToolUse,
    sessionCount: state.sessionCount,
    toolsUsedCount: state.toolsUsed.length,
  };
}
