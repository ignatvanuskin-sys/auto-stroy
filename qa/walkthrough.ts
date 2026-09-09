/* QA walkthrough: records video, screenshots, console errors and failed
   network requests for the production site. Run:
   corepack pnpm tsx qa/walkthrough.ts desktop   (1440x900)
   corepack pnpm tsx qa/walkthrough.ts mobile    (375/390/768) */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://auto-stroy-production.up.railway.app";
const OUT = path.resolve(import.meta.dirname!, "out");
fs.mkdirSync(OUT, { recursive: true });

const consoleErrors: string[] = [];
const failedRequests: string[] = [];
const step = async (
  page: import("playwright-core").Page,
  name: string,
  ms = 700
) => {
  await page.waitForTimeout(ms);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`shot: ${name}`);
};

async function attachWatchers(
  page: import("playwright-core").Page,
  tag: string
) {
  page.on("console", msg => {
    if (msg.type() === "error")
      consoleErrors.push(`[${tag}] ${msg.text().slice(0, 200)}`);
  });
  page.on("response", res => {
    if (res.status() >= 400)
      failedRequests.push(
        `[${tag}] ${res.status()} ${res.url().slice(0, 140)}`
      );
  });
  page.on("pageerror", err =>
    consoleErrors.push(`[${tag}] PAGEERROR ${String(err).slice(0, 200)}`)
  );
}

async function desktopRun() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await attachWatchers(page, "desktop");

  // 1. Home
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "01-home-hero.png") });
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 820);
    await page.waitForTimeout(650);
  }
  await page.screenshot({ path: path.join(OUT, "02-home-bottom.png") });
  await page.mouse.wheel(0, -100000);
  await page.waitForTimeout(500);

  // 2. Nav hover + About
  await page.hover("nav >> text=О нас");
  await page.waitForTimeout(300);
  await page.click("nav >> text=О нас");
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(OUT, "03-about.png") });
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(500);
  }

  // 3. Process
  await page.click("nav >> text=Процесс");
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(OUT, "04-process.png") });
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(450);
  }

  // 4. FAQ (open two items)
  await page.click("nav >> text=FAQ");
  await page.waitForTimeout(1100);
  await page.click("details >> nth=0 >> summary");
  await page.waitForTimeout(400);
  await page.click("details >> nth=1 >> summary");
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "05-faq-open.png") });

  // 5. Contacts
  await page.click("nav >> text=Услуги >> nth=0").catch(() => {});
  await page.goto(`${BASE}/contacts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "06-contacts.png") });

  // 6. Calculator — full flow with hot lead parameters
  await page.goto(`${BASE}/calculator`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, "07-calc-step1.png") });
  // step1: Дом (default), 2 этажа (default)
  await page.click("text=Продолжить");
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "08-calc-step2.png") });
  // step2: area default 180, region Алматы default
  await page.click("text=Продолжить");
  await page.waitForTimeout(700);
  await page.click("text=Стандарт", { exact: true });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "09-calc-step3.png") });
  await page.click("text=Продолжить");
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, "10-calc-step4.png") });
  await page.click("text=Продолжить");
  await page.waitForTimeout(700);
  await page.click("text=35–40 млн ₸");
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "11-calc-step5.png") });
  await page.click("text=Продолжить");
  await page.waitForTimeout(700);
  await page.fill("input[placeholder='Данияр']", "Виктор Видео-Тест");
  await page.fill("input[placeholder='+7 701 000 00 00']", "+7 700 555 40 40");
  const tgInput = page.locator("input[placeholder='@username']");
  if (await tgInput.count()) await tgInput.fill("@video_qa_bot");
  await page.check("input[type=checkbox]");
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "12-calc-step6.png") });
  await page.click("text=Получить расчёт");
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT, "13-calc-submitting.png") });
  await page.waitForSelector("text=Заявка принята", { timeout: 45000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "14-calc-success.png") });

  // 7. CRM dashboard
  await page.goto(`${BASE}/crm/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "15-crm-dashboard.png") });
  for (let i = 0; i < 2; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(500);
  }

  // 8. Leads kanban + table
  await page.goto(`${BASE}/crm/leads`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, "16-crm-kanban.png") });
  await page.click("text=Таблица");
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, "17-crm-table.png") });

  // 9. Hot marquee lead detail + generate proposal + status change
  await page.click("text=Асель Жумабаева");
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, "18-lead-detail.png") });
  await page.click("text=Сгенерировать КП");
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, "19-proposal-loading.png") });
  await page
    .waitForSelector("text=Черновик КП создан", { timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "20-proposal-done.png") });
  await page.selectOption("select >> nth=0", { label: "Связались" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "21-status-changed.png") });
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(450);
  }
  await page.screenshot({ path: path.join(OUT, "22-lead-followups.png") });

  // 10. Remaining CRM pages
  await page.goto(`${BASE}/crm/tasks`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "23-crm-tasks.png") });
  await page.goto(`${BASE}/crm/proposals`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "24-crm-proposals.png") });
  await page.goto(`${BASE}/crm/analytics`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "25-crm-analytics.png") });
  await page.goto(`${BASE}/crm/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, "26-crm-settings.png") });

  const video = await page.video();
  await context.close();
  if (video) {
    const saved = await video.path();
    fs.renameSync(saved, path.join(OUT, "walkthrough-desktop.webm"));
    console.log("video: walkthrough-desktop.webm");
  }
  await browser.close();
}

async function mobileRun() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const sizes: Array<[number, number, string]> = [
    [375, 812, "375"],
    [390, 844, "390"],
    [768, 1024, "768"],
  ];
  for (const [width, height, tag] of sizes) {
    const context = await browser.newContext({
      viewport: { width, height },
      recordVideo: { dir: OUT, size: { width, height } },
    });
    const page = await context.newPage();
    await attachWatchers(page, `m${tag}`);

    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, `m${tag}-01-home.png`) });
    // burger menu
    await page.click("button[aria-label='Открыть меню']");
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `m${tag}-02-menu.png`) });
    await page.click("text=Калькулятор >> nth=-1").catch(() => {});
    await page.goto(`${BASE}/calculator`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `m${tag}-03-calc.png`) });
    await page.goto(`${BASE}/crm/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(OUT, `m${tag}-04-crm.png`) });
    await page.goto(`${BASE}/crm/leads`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(OUT, `m${tag}-05-leads.png`) });
    await page.click("text=Таблица");
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT, `m${tag}-06-table.png`) });
    const firstLead = page.locator("a.lead-card, tbody a >> nth=0");
    if (await firstLead.count()) {
      await firstLead.first().click();
      await page.waitForTimeout(1300);
      await page.screenshot({ path: path.join(OUT, `m${tag}-07-lead.png`) });
    }

    const video = await page.video();
    await context.close();
    if (video) {
      const saved = await video.path();
      fs.renameSync(saved, path.join(OUT, `walkthrough-mobile-${tag}.webm`));
      console.log(`video: walkthrough-mobile-${tag}.webm`);
    }
  }
  await browser.close();
}

const mode = process.argv[2] ?? "desktop";
if (mode === "desktop") await desktopRun();
else await mobileRun();

fs.writeFileSync(
  path.join(OUT, "findings.json"),
  JSON.stringify({ consoleErrors, failedRequests }, null, 2)
);
console.log("console errors:", consoleErrors.length);
console.log("failed requests:", failedRequests.length);
for (const e of consoleErrors) console.log("  ERR:", e);
for (const f of failedRequests) console.log("  NET:", f);
