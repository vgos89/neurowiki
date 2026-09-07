import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { registerSW } from 'virtual:pwa-register';
import { handleUpdateReady } from './src/lib/swUpdate';

// Service worker update policy.
//
// The decision of WHEN a new build may take over lives in src/lib/swUpdate.ts,
// not here, because it depends on whether a clinician has an exam open. In
// short: reload immediately when nothing is in progress, hold and prompt when
// something is, and fall back to reloading once the tab is hidden either way.
//
// Previously this file deferred unconditionally until the tab was hidden. That
// never interrupted anyone, but it meant the whole first session after a deploy
// ran the old build, which for a clinically meaningful fix is one more patient
// handled on the old behaviour.
if (typeof window !== 'undefined') {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Check for a new build whenever the app is brought to the foreground.
      // An installed PWA left open can go a long time without a navigation, and
      // without a navigation the browser has no reason to look. Foregrounding is
      // the moment a clinician picks the phone back up, so it is both the most
      // likely time for a deploy to have happened since they last looked and the
      // cheapest moment to find out.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {
            // Offline or transient. The next foreground tries again.
          });
        }
      });
    },
    onNeedReload() {
      handleUpdateReady();
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