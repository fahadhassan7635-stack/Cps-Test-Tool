const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(
    <style>
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      .fade { animation: fade 1s forwards; }
    </style>
    <div id="box" class="fade">
      Hello <span id="time">00:00:00</span>
    </div>
  );
  await page.evaluate(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        const timeEl = document.getElementById('time');
        timeEl.textContent = '12:34:56';
        console.log('Text updated');
        resolve();
      }, 500); // update halfway through animation
    });
  });
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
