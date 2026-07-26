const fs = require('fs');

const files = [
  'index.html',
  'src/components/Layout.tsx',
  'src/pages/CPSTestPage.tsx',
  'src/pages/TermsPage.tsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  
  c = c.replace(/CPS Test Tool/g, 'Fixed Aim');
  c = c.replace(/cps test tool/g, 'Fixed Aim');
  c = c.replace(/cps-test-tool/g, 'fixed-aim');
  
  if (file === 'src/components/Layout.tsx') {
    c = c.replace(`              CPS<span style={{\n                color: 'var(--neon-cyan)',\n                textShadow: '0 0 8px var(--neon-cyan), 0 0 20px var(--neon-cyan)'\n              }}>Test</span> Tools`, 
                  `              Fixed<span style={{\n                color: 'var(--neon-cyan)',\n                textShadow: '0 0 8px var(--neon-cyan), 0 0 20px var(--neon-cyan)',\n                marginLeft: '6px'\n              }}>Aim</span>`);
                  
    c = c.replace(`                CPS<span style={{\n                  color: 'var(--neon-cyan, #00f5ff)',\n                  textShadow: '0 0 8px var(--neon-cyan, #00f5ff), 0 0 20px var(--neon-cyan, #00f5ff)'\n                }}>Test</span> Tools`,
                  `                Fixed<span style={{\n                  color: 'var(--neon-cyan, #00f5ff)',\n                  textShadow: '0 0 8px var(--neon-cyan, #00f5ff), 0 0 20px var(--neon-cyan, #00f5ff)',\n                  marginLeft: '6px'\n                }}>Aim</span>`);
  }
  
  fs.writeFileSync(file, c, 'utf8');
}
console.log("Renamed successfully.");
