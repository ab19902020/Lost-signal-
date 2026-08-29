import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH,
  args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
await page.goto(process.argv[2], { waitUntil: 'load', timeout: 180000 });
await page.waitForFunction(() => typeof globalThis.__lsBoot === 'function', null, { timeout: 180000 });
await page.evaluate(() => globalThis.__lsBoot());
await page.waitForFunction(() => globalThis.__ls, null, { timeout: 180000 });
await page.evaluate(() => globalThis.__ls.start());
await page.waitForTimeout(1200);
console.log(JSON.stringify(await page.evaluate(process.argv[3]), null, 1));
await browser.close();
