const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src/pages/AimTrainerPage.tsx');
let content = fs.readFileSync(filepath, 'utf8');

// Replace spawnInterval and maxConcurrent for each difficulty
content = content.replace(/spawnInterval:\s*80,\s*maxConcurrent:\s*1/g, 'spawnInterval: 40, maxConcurrent: 3');
content = content.replace(/spawnInterval:\s*65,\s*maxConcurrent:\s*2/g, 'spawnInterval: 30, maxConcurrent: 5');
content = content.replace(/spawnInterval:\s*45,\s*maxConcurrent:\s*3/g, 'spawnInterval: 20, maxConcurrent: 7');
content = content.replace(/spawnInterval:\s*30,\s*maxConcurrent:\s*3/g, 'spawnInterval: 10, maxConcurrent: 10');
content = content.replace(/spawnInterval:\s*18,\s*maxConcurrent:\s*4/g, 'spawnInterval: 5, maxConcurrent: 15');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully updated spawning rates in AimTrainerPage.tsx');
