import { readFileSync, writeFileSync } from 'fs';

const pages = [
  { file: 'KeyboardPage.tsx', path: '/keyboard', name: 'Keyboard Tools' },
  { file: 'MousePage.tsx', path: '/mouse', name: 'Mouse Tools' },
  { file: 'AimPage.tsx', path: '/aim', name: 'Aim & Reaction' },
  { file: 'GamesPage.tsx', path: '/games', name: 'Games' }
];

const basePath = 'C:/Users/IT COMPLEX/Desktop/cps test tool/src/views/';

pages.forEach(p => {
  let content = readFileSync(basePath + p.file, 'utf8');
  
  if (content.includes('application/ld+json')) {
    console.log(`Skipping ${p.file} (already has schema)`);
    return;
  }
  
  const schema = `
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://fixedaim.com/' },
              { '@type': 'ListItem', position: 2, name: '${p.name}', item: 'https://fixedaim.com${p.path}' },
            ],
          }),
        }}
      />
`;

  // Insert just after the first <div ...> in the return statement
  content = content.replace(/(return \(\s*<div[^>]*>)/, '$1' + schema);
  writeFileSync(basePath + p.file, content);
  console.log('Updated ' + p.file);
});
