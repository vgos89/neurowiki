import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { registerSW } from 'virtual:pwa-register';

// Service worker — registered with autoUpdate. When a new build deploys,
// the SW activates in the background and the next navigation picks it up.
//
// Bug-2 fix (2026-07-01 audit): previously we passed only `{immediate: true}`
// with no `onNeedReload` handler. vite-plugin-pwa's default fallback in
// that state is to call `window.location.reload()` UNCONDITIONALLY the
// moment a new SW activates — which yanks clinicians out of active
// NIHSS / ASPECTS / ICH / GCS / stroke-code sessions mid-scoring,
// wiping every in-memory value they had entered. Because we ship 3–5
// deploys/day, this fired often enough for V to notice ("sometimes
// glitches and resets").
//
// Fix: provide an `onNeedReload` handler that DEFERS the reload until
// the tab is next hidden (background). Clinicians still get the new
// build on their next attention flip, but never lose in-flight
// scoring. The reload is still guaranteed — the tab just has to be
// backgrounded once first (foregrounding a new tab, switching apps,
// locking the phone, PWA going to home screen). If the tab is already
// hidden when the SW activates, we reload immediately.
if (typeof window !== 'undefined') {
  registerSW({
    immediate: true,
    onNeedReload() {
      const reloadIfHidden = () => {
        if (document.visibilityState === 'hidden') {
          document.removeEventListener('visibilitychange', reloadIfHidden);
          window.location.reload();
        }
      };
      if (document.visibilityState === 'hidden') {
        window.location.reload();
      } else {
        document.addEventListener('visibilitychange', reloadIfHidden);
      }
    },
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Use hydrateRoot for react-snap prerendered pages to preserve the static HTML
// (avoids a flash of blank content). Fall back to createRoot for dev / uncovered routes.
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}