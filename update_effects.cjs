const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src/pages/AimTrainerPage.tsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Set spawnInterval to 10 everywhere in DIFFICULTY_CONFIG
content = content.replace(/spawnInterval:\s*\d+,/g, 'spawnInterval: 10,');

// 2. Remove spawn effect in hitTarget
content = content.replace(/burst\(target\.x,\s*target\.y,\s*configRef\.current\.color,\s*12\);/g, '// burst removed');
content = content.replace(/spawnRipple\(target\.x,\s*target\.y,\s*configRef\.current\.glow\);/g, '// spawnRipple removed');
content = content.replace(/spawnFloatText\(target\.x,\s*target\.y\s*-\s*target\.size\s*\/\s*2\s*-\s*8,\s*`\+\$\{target\.points\}`,\s*'#ffffff'\);/g, '// spawnFloatText removed');

// 3. Remove miss effect in missClick (sound and any remaining visuals)
content = content.replace(/sfx\.miss\(\);/g, '// sfx.miss() removed');
content = content.replace(/spawnRipple\(x,\s*y,\s*'.*?'\);/g, '// spawnRipple removed');
content = content.replace(/spawnFloatText\(x,\s*y,\s*'.*?',\s*'.*?'\);/g, '// spawnFloatText removed');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully updated AimTrainerPage.tsx to remove effects and set 10ms spawn.');
