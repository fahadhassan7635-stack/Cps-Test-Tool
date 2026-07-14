const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src/pages/AimTrainerPage.tsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Set maxConcurrent to 1 for all difficulties
content = content.replace(/maxConcurrent:\s*\d+,/g, 'maxConcurrent: 1,');

// 2. Add Space Waves link if it is missing
if (!content.includes("'Space Waves'")) {
    const spaceWavesLink = `  { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> },\n];`;
    // Find the end of MORE_TOOLS array
    content = content.replace(/];\s*(\n\/\/ ── SEO content)/, (match, p1) => {
        return spaceWavesLink + p1;
    });
}

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully updated AimTrainerPage.tsx: maxConcurrent to 1 and added Space Waves.');
