/* Verify new logo assets on prod: splash image, header/footer/CRM marks. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const problems: string[] = [];

async function shots(tag: string, width: number) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  const page = await ctx.newPage();
  page.on("response", r => {
    if (r.url().includes("arqa-house-") && r.status() >= 400)
      problems.push(`${tag}: logo asset ${r.status()} ${r.url().slice(-40)}`);
  });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const splash = await page.evaluate(() => {
    const img = document.querySelector(".boot-splash img");
    return img ? img.getAttribute("src") : "NO SPLASH IMG";
  });
  console.log(`${tag} splash img:`, splash);
  await page.waitForTimeout(1500);
  const marks = await page.evaluate(() =>
    [...document.querySelectorAll("header img, footer img")].map(i =>
      `${i.getAttribute("src")} natural=${(i as HTMLImageElement).naturalWidth}`
    )
  );
  console.log(`${tag} header/footer imgs:`, JSON.stringify(marks));
  await page.screenshot({ path: `qa/out/logo-${tag}.png` });
  await ctx.close();
}

await shots("d1440", 1440);
await shots("m375", 375);

// CRM marks
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/crm/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const marks = await page.evaluate(() =>
    [...document.querySelectorAll("aside img, header img")].map(i =>
      `${i.getAttribute("src")} natural=${(i as HTMLImageElement).naturalWidth}`
    )
  );
  console.log("crm marks:", JSON.stringify(marks));
  await page.screenshot({ path: "qa/out/logo-crm.png" });
  await ctx.close();
}

console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "logo assets: all 200, all rendered");
await browser.close();
