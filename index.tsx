import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { handleLegacyHashRedirect } from './src/utils/legacyHashRedirect';

// Handle legacy hash URLs BEFORE React mounts
handleLegacyHashRedirect();

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