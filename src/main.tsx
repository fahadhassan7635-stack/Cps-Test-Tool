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
  
  // Cleanup the hydration freeze after React finishes hydrating.
  // Use double requestAnimationFrame to ensure the browser has painted the hydrated DOM
  // before we remove the freeze, preventing a flash or double-animation.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rootEl.classList.remove('hydrating');
      const freezeStyle = document.getElementById('__prerender-freeze__');
      if (freezeStyle) {
        freezeStyle.remove();
      }
    });
  });
} else {
  createRoot(rootEl).render(app);
}

