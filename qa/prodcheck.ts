/* Prod verification: logo, animation markers, zero console errors/warnings. */
import { chromium } from "playwright-core";

const BASE = "https://auto-stroy-production.up.railway.app";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 } })
).newPage();
const problems: string[] = [];
page.on("console", m => {
  if (m.type() === "error" || m.type() === "warning")
    problems.push(`${m.type()}: ${m.text().slice(0, 160)}`);
});
page.on("pageerror", e =>
  problems.push(`pageerror: ${String(e).slice(0, 160)}`)
);

// 1. Logo in the header
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const logo = await page.evaluate(() => {
  const header = document.querySelector("header");
  return header ? header.innerText.slice(0, 120) : "no header";
});
console.log("header:", JSON.stringify(logo));

// 2. Animation markers after scrolling
for (let i = 0; i < 5; i++) {
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(450);
}
const fx = await page.evaluate(() => ({
  shiny: document.querySelectorAll(".shiny-text").length,
  revealVisible: document.querySelectorAll(".scroll-reveal.is-visible").length,
  pageEnter: document.querySelectorAll(".page-enter").length,
  spotlight: document.querySelectorAll(".spotlight-card").length,
  orbField: document.querySelectorAll(".orb-field").length,
  glowFrame: document.querySelectorAll(".glow-frame").length,
}));
console.log("fx:", JSON.stringify(fx));

// 3. Calculator walk (key warning surfaces in dev; prod must stay silent)
await page.goto(BASE + "/calculator", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
const next = page.locator("button.btn-primary").last();
for (let s = 1; s < 6; s++) {
  await next.click();
  await page.waitForTimeout(300);
}
await page.fill("input[placeholder='Данияр']", "Ки Проверка");
await page.fill("input[placeholder='+7 701 000 00 00']", "+7 700 111 22 33");
await page.check("input[type=checkbox]");
await next.click();
await page.waitForSelector("text=Заявка принята", { timeout: 45000 });
console.log("calculator flow: OK");

console.log(
  problems.length
    ? "PROBLEMS:\n" + problems.join("\n")
    : "console: clean (no errors, no warnings)"
);
await browser.close();
