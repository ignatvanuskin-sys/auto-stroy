/* DOM-level QA: horizontal overflow, broken images, undefined/null text,
   button states, on all routes and mobile viewports. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";

async function checkRoute(page: import("playwright-core").Page, route: string, viewportTag: string) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  const brokenImages = await page.evaluate(() =>
    [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src.slice(-50))
  );
  const badText = await page.evaluate(() => {
    const t = document.body.innerText;
    const hits: string[] = [];
    if (/\bundefined\b/.test(t)) hits.push("undefined");
    if (/\bNaN\b/.test(t)) hits.push("NaN");
    if (/\[object Object\]/.test(t)) hits.push("[object Object]");
    return hits;
  });
  const emptyButtons = await page.evaluate(() =>
    [...document.querySelectorAll("button, a")].filter(el => (el.textContent ?? "").trim() === "" && !(el as HTMLElement).getAttribute("aria-label")).length
  );
  console.log(
    `${viewportTag} ${route} | overflow:${overflow} | brokenImg:${brokenImages.length ? brokenImages.join(",") : 0} | badText:${badText.join("+") || "clean"} | unlabeledEmpty:${emptyButtons}`
  );
}

async function run(viewports: Array<[number, number, string]>, routes: string[]) {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  for (const [width, height, tag] of viewports) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    for (const route of routes) {
      try {
        await checkRoute(page, route, tag);
      } catch (e) {
        console.log(`${tag} ${route} | ERROR: ${String(e).slice(0, 100)}`);
      }
    }
    await context.close();
  }
  await browser.close();
}

const allRoutes = [
  "/",
  "/about",
  "/process",
  "/faq",
  "/contacts",
  "/calculator",
  "/crm/dashboard",
  "/crm/leads",
  "/crm/leads/45",
  "/crm/tasks",
  "/crm/proposals",
  "/crm/analytics",
  "/crm/settings",
];

const mode = process.argv[2] ?? "all";
if (mode === "desktop") {
  await run([[1440, 900, "d"]], allRoutes);
} else if (mode === "mobile") {
  await run(
    [
      [375, 812, "m375"],
      [390, 844, "m390"],
      [768, 1024, "m768"],
    ],
    allRoutes
  );
} else {
  await run([[1440, 900, "d"]], allRoutes);
  await run(
    [
      [375, 812, "m375"],
      [390, 844, "m390"],
      [768, 1024, "m768"],
    ],
    allRoutes
  );
}
