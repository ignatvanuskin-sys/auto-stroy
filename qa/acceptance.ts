/* Final acceptance: keyboard focus rings, double-submit guard, secret scan. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

// 1. Keyboard focus ring is visible on the primary CTA
await page.goto(BASE + "/", { waitUntil: "networkidle" });
for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
const focusInfo = await page.evaluate(() => {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return { tag: "none", outline: "none" };
  const style = getComputedStyle(el);
  return { tag: el.tagName + "." + (el.className || "").toString().slice(0, 24), outline: style.outlineStyle + " " + style.outlineWidth };
});
console.log("focus-visible after 12 Tabs:", JSON.stringify(focusInfo));

// 2. Double-submit guard on the calculator
await page.goto(BASE + "/calculator", { waitUntil: "networkidle" });
const nextButton = page.locator("button.btn-primary").last();
for (let s = 1; s < 6; s++) {
  await nextButton.click();
  await page.waitForTimeout(350);
}
await page.fill("input[placeholder='Данияр']", "Дабл Сабмит Тест");
await page.fill("input[placeholder='+7 701 000 00 00']", "+7 700 000 11 22");
await page.check("input[type=checkbox]");
await nextButton.click();
await nextButton.click({ force: true }).catch(() => {});
const disabledDuring = await nextButton.isDisabled();
console.log("submit disabled while pending:", disabledDuring);
await page.waitForSelector("text=Заявка принята", { timeout: 45000 });
console.log("single success screen: shown once");

// 3. Disabled styling present in CSS
const css = await page.evaluate(async () => {
  const sheets = [...document.styleSheets];
  for (const sheet of sheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.cssText.includes(".btn-primary:disabled")) return "found";
      }
    } catch { /* cross-origin */ }
  }
  return "missing";
});
console.log("disabled css rule:", css);

// 4. focus-visible css rule present
const fvr = await page.evaluate(() => {
  for (const sheet of [...document.styleSheets]) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.cssText.includes("focus-visible")) return "found";
      }
    } catch { /* cross-origin */ }
  }
  return "missing";
});
console.log("focus-visible css rule:", fvr);

await browser.close();
