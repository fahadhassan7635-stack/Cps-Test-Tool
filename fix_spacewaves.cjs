const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src/pages/AimTrainerPage.tsx');
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes("'Space Waves'")) {
    const searchString = `    { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },\n  ];`;
    
    const spaceWavesLink = `    { label: 'Voyager Game', href: '/voyager-game', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M12 2L8 10H2l5 4-2 8 7-4 7 4-2-8 5-4h-6z"/></svg> },
    { label: 'Space Waves', href: '/space-waves', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="36" height="36"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg> },
  ];`;

    content = content.replace(searchString, spaceWavesLink);
    // If that didn't work because of line endings:
    content = content.replace(/\{ label: 'Voyager Game', href: '\/voyager-game'.*?<\/svg> \},\s*\];/s, spaceWavesLink);

    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Successfully added Space Waves.');
} else {
    console.log('Space Waves already exists.');
}
