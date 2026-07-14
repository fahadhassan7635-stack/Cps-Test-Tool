const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filepath = path.join(dir, file);
  const content = fs.readFileSync(filepath, 'utf8');

  if (content.includes('/voyager-game') && !content.includes('/space-waves')) {
    const lines = content.split('\n');
    const newLines = [];
    
    for (const line of lines) {
      newLines.push(line);
      
      if (line.includes("{ label: 'Voyager Game'") && line.includes("href: '/voyager-game'")) {
        const indentMatch = line.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';
        
        const widthMatch = line.match(/width="(\d+)"/);
        const heightMatch = line.match(/height="(\d+)"/);
        const w = widthMatch ? widthMatch[1] : '36';
        const h = heightMatch ? heightMatch[1] : '36';
        
        const waveSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="${w}" height="${h}"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>`;
        
        const comma = line.trimRight().endsWith(',') ? ',' : '';
        
        const newLine = `${indent}{ label: 'Space Waves', href: '/space-waves', icon: ${waveSvg} }${comma}`;
        newLines.push(newLine);
      }
    }
    
    fs.writeFileSync(filepath, newLines.join('\n'), 'utf8');
    console.log(`Updated ${filepath}`);
  }
}
