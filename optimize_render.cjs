const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src/pages/AimTrainerPage.tsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add useMemo to imports
content = content.replace(/useReducer\n\} from 'react';/, 'useReducer, useMemo\n} from \'react\';');

// 2. We need to extract the <article> block and memoize it.
const articleStartMatch = content.match(/(\s*)<article aria-label="Aim trainer guide and FAQ"/);
if (articleStartMatch) {
    const startIdx = articleStartMatch.index;
    const endStr = '\n        </article>';
    const endIdx = content.indexOf(endStr, startIdx);
    
    if (endIdx !== -1) {
        const fullArticle = content.substring(startIdx, endIdx + endStr.length);
        
        // Let's insert the memoization before the return statement
        const returnMatch = content.match(/(\s*)return \(\s*<div/);
        
        if (returnMatch) {
            const memoCode = `\n  const memoizedSeoArticle = useMemo(() => (${fullArticle}\n  ), [activeCfg.color, activeCfg.accentRgb, openFaqId]);\n`;
            
            // Insert memoCode right before the return
            let newContent = content.substring(0, returnMatch.index) + memoCode + content.substring(returnMatch.index);
            
            // Now remove the original article from the JSX and replace with {memoizedSeoArticle}
            // Because the indices have shifted, we must find it again
            newContent = newContent.replace(fullArticle, '\n          {memoizedSeoArticle}');
            
            fs.writeFileSync(filepath, newContent, 'utf8');
            console.log('Successfully optimized AimTrainerPage rendering!');
        } else {
            console.log('Could not find return statement.');
        }
    } else {
        console.log('Could not find end of article.');
    }
} else {
    console.log('Could not find start of article.');
}
