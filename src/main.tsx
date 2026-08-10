import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// If the root element already has child nodes, it means prerender.js injected
// static HTML into this page. Use hydrateRoot so React attaches to the existing
// DOM without discarding and re-rendering it (avoids flash of blank content).
// In development (vite dev), root is always empty, so we fall back to createRoot.
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}

