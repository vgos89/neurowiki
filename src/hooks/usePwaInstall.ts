import { useEffect, useState, useCallback } from 'react';

/**
 * usePwaInstall — manages the "Add NeuroWiki app to your phone" install flow
 * across iOS and Android.
 *
 * Android / desktop Chrome: captures the `beforeinstallprompt` event so we
 * can re-trigger it on our own UI (the browser's native prompt is easy to
 * dismiss; we want a contextual prompt in the disclaimer modal + engagement
 * bubble).
 *
 * iOS Safari: doesn't fire beforeinstallprompt and doesn't allow programmatic
 * install. We detect iOS Safari and surface an instructions sheet instead.
 *
 * iOS non-Safari (Chrome/Firefox/Edge → CriOS/FxiOS/EdgiOS, plus in-app
 * webviews): Add to Home Screen is Safari-only on iOS, so these browsers can't
 * install at all. We surface an "Open in Safari" path (`openInSafari`) plus a
 * copy-link fallback instead.
 *
 * Detect already-installed state via `display-mode: standalone` so we never
 * prompt a user who's already added the app.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type InstallStatus =
  | 'installable'
  | 'ios-manual'
  | 'ios-other-browser'
  | 'already-installed'
  | 'unsupported';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isIosOther, setIsIosOther] = useState(false);
  // `ready` flips true once the install status has settled. Consumers that act
  // on the ABSENCE of an install signal (the onboarding tour) must wait for it,
  // because Chrome's `beforeinstallprompt` is async — 'unsupported' is only
  // trustworthy after we've given that event a chance to fire.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect already-installed (standalone mode means app launched from home screen)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    // @ts-expect-error iOS Safari uses navigator.standalone (non-standard)
    const iosStandalone = window.navigator.standalone === true;
    const installedNow = standalone || iosStandalone;
    setIsInstalled(installedNow);

    // Detect iOS browser family. iOS Safari can't programmatically prompt
    // (surface the manual sheet); iOS non-Safari browsers can't Add to Home
    // Screen at all (Safari-only on iOS) so we nudge the user into Safari.
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    setIsIos(isIosDevice && isSafari);
    setIsIosOther(isIosDevice && !isSafari);

    // iOS and already-installed are definitive immediately; otherwise give
    // `beforeinstallprompt` ~1.2s to fire before declaring the device settled.
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    if (installedNow || isIosDevice) {
      setReady(true);
    } else {
      readyTimer = setTimeout(() => setReady(true), 1200);
    }

    const checkInstalled = () => {
      const sa = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-expect-error iOS Safari uses navigator.standalone (non-standard)
      const iosSa = window.navigator.standalone === true;
      setIsInstalled(sa || iosSa);
    };

    // Capture beforeinstallprompt for Android / Chrome desktop
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setReady(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for actual install (some browsers fire this when user accepts)
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setReady(true);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Watch display-mode changes (rare but possible)
    const mq = window.matchMedia('(display-mode: standalone)');
    mq.addEventListener('change', checkInstalled);

    return () => {
      if (readyTimer) clearTimeout(readyTimer);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      mq.removeEventListener('change', checkInstalled);
    };
  }, []);

  /** Trigger the native install prompt (Android/Chrome). Resolves to 'accepted' or 'dismissed'. */
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  /**
   * Reopen the current URL in Safari from a non-Safari iOS browser. The
   * `x-safari-` scheme prefix is undocumented: it works on current iOS, may
   * surface an "Open in Safari?" confirmation, and is a harmless no-op where
   * unrecognised — which is why callers always pair it with `copyAppLink`.
   */
  const openInSafari = useCallback(() => {
    if (typeof window === 'undefined') return;
    const href = window.location.href;
    window.location.href = href.startsWith('https://')
      ? `x-safari-${href}`
      : `x-safari-https://${window.location.host}/`;
  }, []);

  /** Copy the current URL to the clipboard. Returns false if blocked. */
  const copyAppLink = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    } catch {
      return false;
    }
  }, []);

  const status: InstallStatus = isInstalled
    ? 'already-installed'
    : deferredPrompt
    ? 'installable'
    : isIos
    ? 'ios-manual'
    : isIosOther
    ? 'ios-other-browser'
    : 'unsupported';

  return { status, ready, promptInstall, openInSafari, copyAppLink, isInstalled, isIos, isIosOther };
}
