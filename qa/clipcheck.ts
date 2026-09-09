/* Find where the Panfilovo region text gets clipped. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });

async function scan(route: string, width: number, tag: string) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(250);
  }
  const hits = await page.evaluate(() => {
    const out: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (!node.nodeValue || !node.nodeValue.includes("Алматинская")) continue;
      const el = node.parentElement!;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      // walk up to find clipping ancestors
      let clipped: string | null = null;
      let p: HTMLElement | null = el;
      while (p && p !== document.body) {
        const ps = getComputedStyle(p);
        if ((ps.overflowX === "hidden" || ps.overflow === "hidden") && p.scrollWidth > p.clientWidth + 1) {
          clipped = `${p.tagName}.${String(p.className).slice(0, 50)}`;
          break;
        }
        p = p.parentElement;
      }
      const overflowsSelf = el.scrollWidth > el.clientWidth + 1;
      out.push(
        `text="${node.nodeValue.trim().slice(0, 40)}" tag=${el.tagName} ` +
          `rect=${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)} ` +
          `selfOverflow=${overflowsSelf} clippedBy=${clipped ?? "none"} ` +
          `ws=${cs.whiteSpace} ov=${cs.overflow} txtOv=${cs.textOverflow} ` +
          `font=${cs.fontSize} parent=${el.parentElement?.tagName}.${String(el.parentElement?.className).slice(0, 60)}`
      );
    }
    return out;
  });
  console.log(`--- ${tag} ${route} ---`);
  console.log(hits.length ? hits.join("\n") : "(no Алматинская text on page)");
  await ctx.close();
}

await scan("/", 1440, "d1440");
await scan("/projects", 1440, "d1440");
await scan("/projects/panfilovo", 1440, "d1440");
await scan("/", 375, "m375");
await scan("/projects", 375, "m375");
await scan("/projects/panfilovo", 375, "m375");
await browser.close();
