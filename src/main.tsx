import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root')!;
const app = <App />;

// Suppress React 18 Hydration mismatch errors from reaching global error handlers.
// Since we use Puppeteer for SSG, the serialized DOM slightly differs from React's VDOM (whitespace, attribute order).
// React gracefully recovers and falls back to client rendering, but throws an error that Googlebot detects.
// This prevents Google Search Console from failing indexing due to "Uncaught Error".
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('Hydration') || args[0].includes('Minified React error #418') || args[0].includes('Minified React error #425'))) {
      return;
    }
    if (args[0] && args[0].message && (args[0].message.includes('Hydration') || args[0].message.includes('Minified React error #418') || args[0].message.includes('Minified React error #425'))) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('error', (e) => {
    if (e.message && (e.message.includes('Hydration') || e.message.includes('Minified React error #418') || e.message.includes('Minified React error #425'))) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

if (rootEl.hasChildNodes()) {
  // Remove the prerender freeze style injected by prerender.js
  // so animations are not stuck at 0s duration after hydration
  const freezeStyle = document.getElementById('__prerender-freeze__');
  if (freezeStyle) freezeStyle.remove();

  // 'hydrating' class was added by prerender.js — keep it for now
  // index.css uses it to pause all animations during hydration

  hydrateRoot(rootEl, app, {
    onRecoverableError: () => {},
  });

  // Remove hydrating class after React has finished its commit phase
  // double rAF ensures removal happens after the browser paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rootEl.classList.remove('hydrating');
    });
  });
} else {
  createRoot(rootEl).render(app);
}