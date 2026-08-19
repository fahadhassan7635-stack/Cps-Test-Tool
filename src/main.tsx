import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootEl = document.getElementById('root')!;
const app = <App />;

if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
