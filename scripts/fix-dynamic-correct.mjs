import { readFileSync, writeFileSync, existsSync } from 'fs';

const appBase = 'C:/Users/IT COMPLEX/Desktop/cps test tool/src/app';

const pages = [
  { route: 'cps-test', import: 'CPSTestPage', view: 'CPSTestPage' },
  { route: 'typing-test', import: 'TypingTestPage', view: 'TypingTestPage' },
  { route: 'aim-trainer', import: 'AimTrainerPage', view: 'AimTrainerPage' },
  { route: '3d-aim-trainer', import: 'DAimTrainer', view: '3DAimTrainer' },
  { route: 'reaction-time', import: 'ReactionTimePage', view: 'ReactionTimePage' },
  { route: 'spacebar', import: 'SpacebarPage', view: 'SpacebarPage' },
  { route: 'key-visualizer', import: 'KeyVisualizerPage', view: 'KeyVisualizerPage' },
  { route: 'double-click', import: 'DoubleClickPage', view: 'DoubleClickPage' },
  { route: 'scroll-test', import: 'ScrollTestPage', view: 'ScrollTestPage' },
  { route: 'mouse-accuracy', import: 'MouseAccuracyPage', view: 'MouseAccuracyPage' },
  { route: 'accuracy', import: 'AccuracyTestPage', view: 'AccuracyTestPage' },
  { route: 'space-defense', import: 'SpaceDefensePage', view: 'SpaceDefensePage' },
  { route: 'space-waves', import: 'SpaceWavesGame', view: 'SpaceWavesGame' },
  { route: 'voyager-game', import: 'VoyagerGame', view: 'VoyagerGame' },
  { route: 'cps-rush', import: 'CpsRush', view: 'CpsRush' },
  { route: 'f1-reaction', import: 'FReactionPage', view: 'F1ReactionPage' },
  { route: 'blog', import: 'BlogPage', view: 'BlogPage' },
  { route: 'contact', import: 'ContactPage', view: 'ContactPage' },
  { route: 'hall-of-fame', import: 'LeaderboardPage', view: 'LeaderboardPage' },
];

// ── Step 1: Restore all page.tsx files that have dynamic() (revert to static import) ────
for (const page of pages) {
  const pagePath = `${appBase}/${page.route}/page.tsx`;
  if (!existsSync(pagePath)) continue;

  let content = readFileSync(pagePath, 'utf8');
  if (!content.includes('next/dynamic')) continue; // not modified, skip

  // Restore: remove the dynamic import line and put back static import
  content = content.replace("import dynamic from 'next/dynamic';\n", '');

  // Replace dynamic const declaration with static import
  const dynamicPattern = new RegExp(
    `const ${page.import} = dynamic\\(\\(\\) => import\\('@/views/${page.view}'\\),[\\s\\S]*?\\}\\);`,
  );
  const staticImport = `import ${page.import} from '@/views/${page.view}';`;
  content = content.replace(dynamicPattern, staticImport);

  writeFileSync(pagePath, content);
  console.log(`RESTORED: ${page.route}/page.tsx`);
}

// ── Step 2: Create a DynamicPage.tsx client wrapper for each heavy page ───────────────
const LOADING_JSX = `<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080d14' }}><p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Loading...</p></div>`;

for (const page of pages) {
  const wrapperPath = `${appBase}/${page.route}/DynamicPage.tsx`;
  if (existsSync(wrapperPath)) {
    console.log(`SKIP (exists): ${page.route}/DynamicPage.tsx`);
    continue;
  }

  const wrapperContent = `"use client";

import dynamic from 'next/dynamic';

const ${page.import} = dynamic(
  () => import('@/views/${page.view}'),
  {
    ssr: false,
    loading: () => (${LOADING_JSX}),
  }
);

export default function DynamicPage() {
  return <${page.import} />;
}
`;

  writeFileSync(wrapperPath, wrapperContent);
  console.log(`CREATED: ${page.route}/DynamicPage.tsx`);
}

// ── Step 3: Update page.tsx to import from DynamicPage instead of views ───────────────
for (const page of pages) {
  const pagePath = `${appBase}/${page.route}/page.tsx`;
  if (!existsSync(pagePath)) continue;

  let content = readFileSync(pagePath, 'utf8');

  // Skip if already updated
  if (content.includes('./DynamicPage')) {
    console.log(`SKIP (already updated): ${page.route}/page.tsx`);
    continue;
  }

  // Replace the view import with DynamicPage import
  const viewImport = `import ${page.import} from '@/views/${page.view}';`;
  const dynamicImport = `import DynamicPage from './DynamicPage';`;

  if (!content.includes(viewImport)) {
    console.log(`WARNING - import not found: ${page.route}/page.tsx`);
    continue;
  }

  content = content.replace(viewImport, dynamicImport);

  // Replace the usage: <ComponentName /> → <DynamicPage />
  const usagePattern = new RegExp(`<${page.import}\\s*/>`, 'g');
  content = content.replace(usagePattern, `<DynamicPage />`);

  writeFileSync(pagePath, content);
  console.log(`UPDATED: ${page.route}/page.tsx`);
}

console.log('\nAll done!');
