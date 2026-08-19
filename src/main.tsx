import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root')!;
const app = <App />;

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
