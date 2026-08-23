const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(
    <style>
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      .fade { animation: fade 1s forwards; }
    </style>
    <div id="box" class="fade">Hello</div>
  );
  await page.evaluate(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        const el = document.getElementById('box');
        el.addEventListener('animationstart', () => console.log('Animation Started!'));
        // Re-assign same class
        el.className = 'fade';
        // Force reflow
        void el.offsetWidth;
        resolve();
      }, 1500);
    });
  });
  
  page.on('console', msg => console.log(msg.text()));
  
  // Wait to see if event fires
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
