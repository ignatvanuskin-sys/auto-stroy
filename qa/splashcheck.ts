/* Verify boot splash brand on first paint. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage();
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
const splash = await page.evaluate(() => {
  const el = document.querySelector(".boot-splash");
  return el
    ? (el.textContent ?? "").replace(/\s+/g, " ").trim()
    : "NO SPLASH FOUND";
});
console.log("boot splash text:", JSON.stringify(splash));
console.log("still BuildScope in splash:", /BuildScope/i.test(splash));
await browser.close();
