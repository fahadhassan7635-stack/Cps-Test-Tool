const fs = require('fs');
let content = fs.readFileSync('src/pages/3DAimTrainer.tsx', 'utf8');

content = content.replace(/â€—/g, '�');
content = content.replace(/â€� /g, '�');
content = content.replace(/—/g, '�');
content = content.replace(/–/g, '�');
content = content.replace(/Ã—/g, '�');
content = content.replace(/×/g, '�');
content = content.replace(/â�\x9D€/g, '-');
content = content.replace(/â†’/g, '?');
content = content.replace(/âœ“/g, '?');
content = content.replace(/âœ—/g, '?');
content = content.replace(/Â°/g, '�');
content = content.replace(/â‰ˆ/g, '�');
content = content.replace(/â€™/g, ');
content = content.replace(/â€[^\s\w]/g, '�');

fs.writeFileSync('src/pages/3DAimTrainer.tsx', content, 'utf8');
