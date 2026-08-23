const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(
    <style>
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      .fade { animation: fade 1s forwards; }
    </style>
    <div id="box" class="fade" style="background: rgba(0, 245, 255, 0.08);">
      Hello
    </div>
  );
  await page.evaluate(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        const box = document.getElementById('box');
        box.addEventListener('animationstart', () => console.log('Animation Started!'));
        box.style.background = 'rgba(0,245,255,0.08)'; // update style
        console.log('Style updated');
        resolve();
      }, 500);
    });
  });
  
  page.on('console', msg => console.log(msg.text()));
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
