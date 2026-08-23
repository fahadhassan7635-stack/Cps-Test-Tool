const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    window.__mutations = [];
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          for (const node of m.removedNodes) {
            if (node.nodeType === 1 && node.classList && node.classList.contains('fade-in-up')) {
              window.__mutations.push('REMOVED: ' + node.outerHTML.substring(0, 50));
            }
          }
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && node.classList && node.classList.contains('fade-in-up')) {
              window.__mutations.push('ADDED: ' + node.outerHTML.substring(0, 50));
            }
          }
        }
      }
    });
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
  
  const m = await page.evaluate(() => window.__mutations);
  console.log('MUTATIONS:', m);
  
  await browser.close();
})();
