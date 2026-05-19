import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { registerSW } from 'virtual:pwa-register';

// Service worker — registered with autoUpdate. When a new build deploys,
// the SW activates in the background and the next navigation picks it up
// silently. No "reload to update" prompt — clinicians don't want that
// friction. Skipped in dev mode (configured in vite.config.ts devOptions).
if (typeof window !== 'undefined') {
  registerSW({ immediate: true });
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