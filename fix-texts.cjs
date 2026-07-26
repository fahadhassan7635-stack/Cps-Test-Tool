const fs = require('fs');
let content = fs.readFileSync('src/pages/3DAimTrainer.tsx', 'utf8');

const corruptions = [
  { bad: /Ã¢â‚¬â€”/g, good: '—' },
  { bad: /Ã¢â‚¬â€ /g, good: '—' },
  { bad: /â€”/g, good: '—' },
  { bad: /â€“/g, good: '—' },
  { bad: /Ãƒâ€”/g, good: '×' },
  { bad: /Ã—/g, good: '×' },
  { bad: /Ã¢â€\x9Dâ‚¬/g, good: '─' },
  { bad: /Ã¢â€ â€™/g, good: '→' },
  { bad: /Ã¢Å“â€œ/g, good: '✔' },
  { bad: /Ã¢Å“â€”/g, good: '✖' },
  { bad: /Ã‚Â°/g, good: '°' },
  { bad: /Ã¢â€°Ë†/g, good: '≈' },
  { bad: /Ã¢â‚¬â„¢/g, good: "'" },
  { bad: /Ã¢â‚¬[^\s\w]/g, good: '—' },
  { bad: /A,,\?/g, good: '—' },
  { bad: /A,\?/g, good: '—' }
];

for (const {bad, good} of corruptions) {
  content = content.replace(bad, good);
}

fs.writeFileSync('src/pages/3DAimTrainer.tsx', content, 'utf8');
console.log("Fixed corruptions.");
