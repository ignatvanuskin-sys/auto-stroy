/* Verify: region no longer clipped, CRM hidden from public nav, routes alive. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });

// 1. Region fix on detail page (desktop, worst case)
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(BASE + "/projects/panfilovo", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const stat = await page.evaluate(() => {
    const els = [...document.querySelectorAll("p")].filter(e =>
      e.textContent?.includes("Алматинская")
    );
    return els.map(e => ({
      cls: e.className,
      selfOverflow: e.scrollWidth > e.clientWidth + 1,
    }));
  });
  console.log("panfilovo region:", JSON.stringify(stat));
  await page.close();
}

// 2. Public nav: no CRM links (desktop + mobile)
for (const [w, tag] of [[1440, "d"], [375, "m"]] as const) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const desktopCrm = await page.evaluate(() =>
    [...document.querySelectorAll("header nav a")].some(a =>
      (a.getAttribute("href") ?? "").startsWith("/crm")
    )
  );
  console.log(`${tag} header nav has CRM link:`, desktopCrm);
  if (w === 375) {
    await page.click("button[aria-label='Открыть меню']");
    await page.waitForTimeout(500);
    const mobileCrm = await page.evaluate(() =>
      [...document.querySelectorAll("a")].some(
        a =>
          (a.getAttribute("href") ?? "").startsWith("/crm") &&
          (a.textContent ?? "").includes("CRM")
      )
    );
    console.log("m mobile menu has CRM link:", mobileCrm);
  }
  await ctx.close();
}

// 3. CRM routes still alive directly
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const r1 = await page.goto(BASE + "/crm/dashboard", { waitUntil: "networkidle" });
  console.log("direct /crm/dashboard:", r1?.status());
  await page.close();
}
await browser.close();
