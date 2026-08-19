/**
 * prerender.js  —  Static Pre-rendering for FixedAim (Vite SPA)
 *
 * Run automatically after `vite build` via the npm build script.
 * For every public route, this script:
 *   1. Spins up a local Express server on the built dist/ folder.
 *   2. Opens each URL in a headless Chromium browser (Puppeteer).
 *   3. Waits until SEO.tsx has injected <title>, <meta>, canonical, etc.
 *   4. Strips all inline animation/transition styles before saving
 *      (prevents double-animation on hydration).
 *   5. Saves the fully-rendered HTML to dist/<route>/index.html
 *
 * Result: Bingbot / any crawler that doesn't run JS will receive
 * route-specific pre-rendered HTML instead of a blank SPA shell.
 */

import puppeteer from 'puppeteer';
import express   from 'express';
import fs        from 'fs';
import path      from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR  = path.join(__dirname, 'dist');
const PORT      = 5174;
const BASE_URL  = `http://localhost:${PORT}`;

// ─────────────────────────────────────────────────────────────
// All public routes that should get a pre-rendered HTML file.
// Must match the routes defined in src/App.tsx.
// ─────────────────────────────────────────────────────────────
const ROUTES = [
  '/',
  '/cps-test',
  '/typing-test',
  '/reaction-time',
  '/aim-trainer',
  '/key-visualizer',
  '/spacebar',
  '/double-click',
  '/scroll-test',
  '/mouse-accuracy',
  '/3d-aim-trainer',
  '/accuracy',
  '/space-defense',
  '/voyager-game',
  '/f1-reaction',
  '/cps-rush',
  '/space-waves',
  '/mouse',
  '/keyboard',
  '/aim',
  '/games',
  '/leaderboard',
  '/hall-of-fame',
  '/blog',
  '/privacy-policy',
  '/terms',
  '/contact',
];

// ─────────────────────────────────────────────────────────────
// Start a minimal Express server serving the dist/ folder.
// Rewrites all paths to index.html (like vercel.json does).
// ─────────────────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.static(DIST_DIR));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
    const server = app.listen(PORT, () => {
      console.log(`[prerender] Local server started on ${BASE_URL}`);
      resolve(server);
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Render one route: open in Puppeteer, wait for SEO tags,
// strip animation state, save HTML to dist/<route>/index.html
// ─────────────────────────────────────────────────────────────
async function renderRoute(page, route) {
  const url = `${BASE_URL}${route}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait until SEO.tsx has injected the <title>.
  await page.waitForFunction(
    () => {
      const t = document.title;
      return t && t.length > 10 && !t.startsWith('FixedAim — Free CPS');
    },
    { timeout: 15000 }
  ).catch(() => {
    console.warn(`[prerender] Title wait timed out for ${route} — using whatever is rendered.`);
  });

  // ─────────────────────────────────────────────────────────
  // FIX: Before capturing HTML, pause all animations on the
  // page. This means the saved HTML snapshot has no
  // mid-animation inline styles that would cause a visual
  // "double fire" when React re-hydrates in the user's browser.
  // ─────────────────────────────────────────────────────────
  await page.evaluate(() => {
    // 1. Inject a one-time <style> that freezes every animation
    //    at its start frame. It will be removed by main.tsx
    //    after hydration (via the 'hydrating' class mechanism).
    const style = document.createElement('style');
    style.id = '__prerender-freeze__';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `;
    document.head.appendChild(style);

    // 2. Add the 'hydrating' class to #root so main.tsx knows
    //    to keep animations paused until React has attached.
    const root = document.getElementById('root');
    if (root) root.classList.add('hydrating');
  });

  const html = await page.content();

  // Determine output path
  let outDir;
  if (route === '/') {
    outDir = DIST_DIR;
  } else {
    outDir = path.join(DIST_DIR, route.replace(/^\//, ''));
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html, 'utf-8');
  console.log(`[prerender] ✓  ${route}  →  ${path.relative(__dirname, outFile)}`);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
(async () => {
  const server = await startServer();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let failed = 0;
  for (const route of ROUTES) {
    try {
      await renderRoute(page, route);
    } catch (err) {
      console.error(`[prerender] ✗  FAILED: ${route}`, err.message);
      failed++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\n[prerender] Done. ${ROUTES.length - failed} routes rendered, ${failed} failed.`);
  if (failed > 0) process.exit(1);
})();
