const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace More Tools links
  content = content.replace(/label:\s*'Sniper Mode',\s*href:\s*'\/sniper-mode'/g, "label: '3D Aim Trainer', href: '/3d-aim-trainer'");
  
  // Replace in HomePage (to: '/sniper-mode')
  if (file === 'HomePage.tsx') {
    content = content.replace(/to:\s*'\/sniper-mode'/g, "to: '/3d-aim-trainer'");
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
  }
}
