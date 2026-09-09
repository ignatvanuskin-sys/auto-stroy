/* Verify all site images render (naturalWidth > 0) after scroll. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });

async function checkPage(route: string, scrolls: number, tag: string) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  for (let i = 0; i < scrolls; i++) {
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(300);
  }
  await page.waitForLoadState("networkidle");
  const broken = await page.evaluate(() =>
    [...document.images]
      .filter(i => !i.complete || i.naturalWidth === 0)
      .map(i => i.src.slice(-32))
  );
  const total = await page.evaluate(() => document.images.length);
  console.log(`${tag}: ${total} imgs, broken: ${broken.length ? broken.join(", ") : "none"}`);
  await page.context().close();
}

await checkPage("/", 5, "home    ");
await checkPage("/projects", 6, "projects");
await checkPage("/projects/bostandyk", 2, "detail  ");
await browser.close();
