import { readFileSync, writeFileSync } from 'fs';

const LOADING = `(<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080d14' }}><p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Loading...</p></div>)`;

function addDynamic(pagePath, importName, viewPath) {
  let content = readFileSync(pagePath, 'utf8');
  if (content.includes('next/dynamic')) {
    console.log(`SKIP (already done): ${pagePath}`);
    return;
  }
  content = content.replace(
    "import type { Metadata } from 'next';",
    "import type { Metadata } from 'next';\nimport dynamic from 'next/dynamic';"
  );
  const staticImport = `import ${importName} from '@/views/${viewPath}';`;
  const dynamicImport = `const ${importName} = dynamic(() => import('@/views/${viewPath}'), { ssr: false, loading: () => ${LOADING} });`;
  content = content.replace(staticImport, dynamicImport);
  writeFileSync(pagePath, content);
  console.log(`OK: ${pagePath}`);
}

const base = 'C:/Users/IT COMPLEX/Desktop/cps test tool/src/app';

addDynamic(`${base}/3d-aim-trainer/page.tsx`, 'DAimTrainer', '3DAimTrainer');
addDynamic(`${base}/f1-reaction/page.tsx`, 'FReactionPage', 'F1ReactionPage');
addDynamic(`${base}/hall-of-fame/page.tsx`, 'LeaderboardPage', 'LeaderboardPage');
addDynamic(`${base}/blog/page.tsx`, 'BlogPage', 'BlogPage');
addDynamic(`${base}/contact/page.tsx`, 'ContactPage', 'ContactPage');

console.log('Done!');
