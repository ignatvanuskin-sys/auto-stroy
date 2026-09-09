/* Verify realistic contacts on prod contacts page. */
import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage();
await page.goto("https://auto-stroy-production.up.railway.app/contacts", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(800);
const text = await page.evaluate(() => document.body.innerText);
console.log("has +7 (727) 000-00-00:", text.includes("(727) 000-00-00"));
console.log("has info@arqahouse.kz:", text.includes("info@arqahouse.kz"));
console.log("has DEMO marker:", /DEMO/.test(text));
await browser.close();
