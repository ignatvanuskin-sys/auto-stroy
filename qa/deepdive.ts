/* Deep-dive: real broken images after scroll, overflow culprit on m375 leads,
   and the unlabeled empty button on lead detail. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });

// 1. Home images after real scrolling (lazy loading)
{
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(350);
  }
  await page.waitForLoadState("networkidle");
  const broken = await page.evaluate(() =>
    [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src.slice(-50))
  );
  console.log("m375 home after scroll — broken imgs:", broken.length ? broken : "none");
}

// 2. Leads kanban overflow culprit at 375px
{
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  await page.goto(BASE + "/crm/leads", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const culprits = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    document.querySelectorAll("*").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 10) {
        const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 60) : el.tagName;
        out.push(`${el.tagName}.${cls} right=${Math.round(r.right)}`);
      }
    });
    return out.slice(0, 12);
  });
  console.log("m375 leads overflow culprits:", culprits);
}

// 3. Empty unlabeled button on lead detail
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(BASE + "/crm/leads/45", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const empties = await page.evaluate(() =>
    [...document.querySelectorAll("button, a")]
      .filter(el => (el.textContent ?? "").trim() === "" && !el.getAttribute("aria-label"))
      .map(el => `${el.tagName} ${el.className.slice(0, 80)}`)
  );
  console.log("lead detail empty unlabeled controls:", empties);
}

await browser.close();
