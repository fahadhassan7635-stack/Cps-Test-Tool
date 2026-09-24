import { readFileSync, writeFileSync } from 'fs';

// ─── Helper ──────────────────────────────────────────────────────────────────
function fixStaticPage(filePath) {
  let content = readFileSync(filePath, 'utf8');
  
  // Remove "use client" directive
  content = content.replace(/^"use client";\r?\n\r?\n?/m, '');
  
  // Remove useEffect import (if it's now unused)
  content = content.replace(/import \{ useEffect \} from 'react';\r?\n\r?\n?/g, '');
  content = content.replace(/import React, \{ useEffect \} from 'react';\r?\n\r?\n?/g, '');
  
  // Remove useEffect block that manipulates document.title / document.querySelector
  // Match: useEffect(() => { document.xxx ... }, []);
  content = content.replace(/\s*useEffect\(\(\) => \{[^}]*document\.[^}]*(?:\{[^}]*\}[^}]*)*\}, \[\]\);\r?\n/gs, '\n');
  
  writeFileSync(filePath, content);
  console.log(`Fixed: ${filePath}`);
}

// ─── Step 1: Convert simple static pages to Server Components ────────────────
const base = 'C:/Users/IT COMPLEX/Desktop/cps test tool/src/views';

// PrivacyPolicy - only has document.title useEffect
let privacy = readFileSync(`${base}/PrivacyPolicy.tsx`, 'utf8');
privacy = privacy.replace('"use client";\n', '').replace('"use client";\r\n', '');
privacy = privacy.replace("import { useEffect } from 'react';\r\n\r\n", '');
privacy = privacy.replace("import { useEffect } from 'react';\n\n", '');
// Remove the useEffect block
privacy = privacy.replace(/\n  useEffect\(\(\) => \{\s*[\s\S]*?  \}, \[\]\);\n/, '\n');
writeFileSync(`${base}/PrivacyPolicy.tsx`, privacy);
console.log('PrivacyPolicy.tsx → Server Component');

// TermsPage - only has document.title useEffect
let terms = readFileSync(`${base}/TermsPage.tsx`, 'utf8');
terms = terms.replace('"use client";\n', '').replace('"use client";\r\n', '');
terms = terms.replace("import { useEffect } from 'react';\r\n\r\n", '');
terms = terms.replace("import { useEffect } from 'react';\n\n", '');
terms = terms.replace(/\n  useEffect\(\(\) => \{\s*[\s\S]*?  \}, \[\]\);\n/, '\n');
writeFileSync(`${base}/TermsPage.tsx`, terms);
console.log('TermsPage.tsx → Server Component');

// KeyboardPage - only has onMouseEnter/Leave - keep as client (needs event handlers)
// MousePage - same
// AimPage - same
// GamesPage - same
// These stay as "use client" for hover effects

// ─── Step 2: Add dynamic() loading to heavy game pages ───────────────────────
const appBase = 'C:/Users/IT COMPLEX/Desktop/cps test tool/src/app';

const heavyPages = [
  { route: 'cps-test', view: 'CPSTestPage' },
  { route: 'typing-test', view: 'TypingTestPage' },
  { route: 'aim-trainer', view: 'AimTrainerPage' },
  { route: '3d-aim-trainer', view: '3DAimTrainer', componentName: 'SniperModePage' },
  { route: 'reaction-time', view: 'ReactionTimePage' },
  { route: 'spacebar', view: 'SpacebarPage' },
  { route: 'key-visualizer', view: 'KeyVisualizerPage' },
  { route: 'double-click', view: 'DoubleClickPage' },
  { route: 'scroll-test', view: 'ScrollTestPage' },
  { route: 'mouse-accuracy', view: 'MouseAccuracyPage' },
  { route: 'accuracy', view: 'AccuracyTestPage' },
  { route: 'space-defense', view: 'SpaceDefensePage' },
  { route: 'space-waves', view: 'SpaceWavesGame' },
  { route: 'voyager-game', view: 'VoyagerGame' },
  { route: 'cps-rush', view: 'CpsRush' },
  { route: 'f1-reaction', view: 'F1ReactionPage' },
];

const loadingShell = `\
<div style={{
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-primary, #080d14)',
}}>
  <div style={{
    textAlign: 'center',
    color: 'var(--text-secondary, #8b949e)',
  }}>
    <div style={{
      width: '48px', height: '48px', margin: '0 auto 1rem',
      border: '3px solid rgba(0,245,255,0.15)',
      borderTop: '3px solid #00f5ff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Loading...</p>
    <style>{'.spinning { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); }}'}</style>
  </div>
</div>`;

for (const page of heavyPages) {
  const pagePath = `${appBase}/${page.route}/page.tsx`;
  let content;
  try {
    content = readFileSync(pagePath, 'utf8');
  } catch {
    console.log(`Skipping ${page.route} - page.tsx not found`);
    continue;
  }

  const compName = page.componentName || page.view;

  // Skip if already using dynamic
  if (content.includes('dynamic(')) {
    console.log(`Skipping ${page.route} - already using dynamic()`);
    continue;
  }

  // Replace direct import with dynamic import
  const importRegex = new RegExp(`import ${compName} from '@/views/${page.view}';`);
  if (!importRegex.test(content)) {
    console.log(`Skipping ${page.route} - import pattern not found`);
    continue;
  }

  content = content.replace(
    /^(import type \{ Metadata \} from 'next';\n)/m,
    `$1import dynamic from 'next/dynamic';\n`
  );

  content = content.replace(
    importRegex,
    `const ${compName} = dynamic(() => import('@/views/${page.view}'), {\n  ssr: false,\n  loading: () => (\n    ${loadingShell.split('\n').join('\n    ')}\n  ),\n});`
  );

  writeFileSync(pagePath, content);
  console.log(`Added dynamic() to: ${page.route}/page.tsx`);
}

console.log('\nAll done!');
