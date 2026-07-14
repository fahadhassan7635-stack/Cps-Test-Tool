const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src/pages/AimTrainerPage.tsx');
let content = fs.readFileSync(filepath, 'utf8');

// Hard
content = content.replace(/moveChance:\s*0\.55,\s*minSpeed:\s*75,\s*maxSpeed:\s*135/g, 'moveChance: 0.8, minSpeed: 150, maxSpeed: 250');

// Pro
content = content.replace(/moveChance:\s*0\.8,\s*minSpeed:\s*115,\s*maxSpeed:\s*195/g, 'moveChance: 1.0, minSpeed: 300, maxSpeed: 450');

// Impossible
content = content.replace(/moveChance:\s*0\.95,\s*minSpeed:\s*165,\s*maxSpeed:\s*265/g, 'moveChance: 1.0, minSpeed: 600, maxSpeed: 900');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully updated AimTrainer movement speeds.');
