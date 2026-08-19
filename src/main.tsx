import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root')!;
const app = <App />;

if (rootEl.hasChildNodes()) {
  // SSR content exists — suppress animations during hydration,
  // then re-enable after React has fully attached to the DOM.
  // This prevents the double-animation caused by SSR paint + hydration paint.
  rootEl.classList.add('hydrating');
  hydrateRoot(rootEl, app, {
    onRecoverableError: () => {},
  });
  // requestAnimationFrame waits for the first real browser paint after hydration.
  // doubling rAF ensures the class removal happens AFTER React's commit phase.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rootEl.classList.remove('hydrating');
    });
  });
} else {
  createRoot(rootEl).render(app);
}
