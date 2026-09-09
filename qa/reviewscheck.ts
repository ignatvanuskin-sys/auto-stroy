/* Verify the reviews page on prod. */
import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage();
const problems: string[] = [];
page.on("console", m => {
  if (m.type() === "error") problems.push(m.text().slice(0, 120));
});
await page.goto("https://auto-stroy-production.up.railway.app/reviews", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(900);
const text = await page.evaluate(() => document.body.innerText);
for (const s of ["Данияр К.", "Айгуль С.", "Ерлан М.", "Отзыв 01", "Отзыв 03"]) {
  console.log(`has "${s}":`, text.includes(s));
}
console.log(
  "nav has reviews link:",
  (await page.evaluate(() => document.querySelector("header")!.innerText)).includes("Отзывы")
);
await page.screenshot({ path: "qa/out/reviews-page.png" });
console.log(problems.length ? "ERRORS: " + problems.join(" | ") : "console: clean");
await browser.close();
