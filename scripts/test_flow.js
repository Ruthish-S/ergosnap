import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.goto('https://ruthish-s.github.io/ergosnap/#/upload');
  await page.waitForTimeout(1000);

  // Click Load Demo Benchmark Posture
  console.log('Clicking Load Demo Benchmark Posture...');
  await page.click('button:has-text("Load Demo Benchmark Posture")');
  await page.waitForTimeout(800);

  // Click Run Pose Landmark Detection
  console.log('Clicking Run Pose Landmark Detection...');
  await page.click('button:has-text("Run Pose Landmark Detection")');
  await page.waitForTimeout(2500);

  console.log('Current URL after start:', page.url());

  const buttonsOnAnalysis = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
  });
  console.log('Buttons on analysis:', buttonsOnAnalysis);

  await browser.close();
})();
