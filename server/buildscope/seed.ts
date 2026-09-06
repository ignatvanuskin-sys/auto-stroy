import { sql } from "drizzle-orm";
import { companies, estimates, followups, leadActivities, leads, notifications, proposals, rateTables, tasks } from "../../drizzle/schema";
import { estimateProject, scoreLead } from "./business";
import { getDb } from "../db";

const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 86_400_000);

const leadSeeds = [
  ["Данияр Садыков", "+7 701 218 43 91", "Алматы", "Дом", 180, 2, "Кирпич", "standard", true, "3–6 мес", "35–40 млн ₸", "Website", "Qualified", 92, "Клиент готов обсуждать проект; участок оформлен, ищет подрядчика с опытом монолитного строительства."],
  ["Алексей Морозов", "+7 777 614 02 18", "Алматы", "Коттедж", 242, 2, "Газоблок", "premium", true, "ASAP", "60–70 млн ₸", "Referral", "Negotiation", 96, "Есть участок в Медеуском районе и готовый эскиз. Критичны сроки и прозрачная смета."],
  ["Айша Тулеубаева", "+7 705 327 19 60", "Астана", "Дом", 146, 1, "Газоблок", "standard", false, "6–12 мес", "30–35 млн ₸", "Instagram", "Contacted", 62, "Сравнивает варианты, участок выбирает. Интересуется энергоэффективной комплектацией."],
  ["Марат Кенжебаев", "+7 747 182 88 34", "Шымкент", "Дача", 104, 1, "Каркас", "economy", true, "Изучаю рынок", "Не готов озвучивать", "Website", "New", 38, "Изучает варианты для сезонного проживания, просит понять порядок бюджета."],
  ["Руслан Исмаилов", "+7 701 434 72 10", "Конаев", "Дом", 210, 2, "Кирпич", "standard", true, "3–6 мес", "45–50 млн ₸", "Website", "Estimate Sent", 84, "Земля оформлена. Нужен уточнённый расчёт после согласования планировки."],
  ["София Бекенова", "+7 775 880 31 56", "Алматы", "Коттедж", 320, 2, "Не уверен", "premium", true, "6–12 мес", "70–80 млн ₸", "Telegram", "Site Visit", 73, "Запланирован выезд на участок. Семья выбирает между кирпичом и монолитом."],
  ["Арман Жансугуров", "+7 771 291 07 43", "Караганда", "Дом", 130, 1, "Газоблок", "economy", false, "6–12 мес", "20–25 млн ₸", "Manual", "Qualified", 57, "Клиент в процессе выбора участка; хочет зафиксировать базовую комплектацию."],
  ["Илья Беляев", "+7 705 624 18 09", "Астана", "Дом", 167, 2, "Кирпич", "standard", true, "3–6 мес", "40–45 млн ₸", "Referral", "Proposal Sent", 90, "Получил предложение, просит добавить навес для двух автомобилей и скорректировать сроки."],
  ["Жанна Ахметова", "+7 747 099 42 21", "Алматы", "Дом", 122, 1, "Каркас", "standard", false, "Изучаю рынок", "25–30 млн ₸", "Website", "Lost", 31, "Проект отложен до оформления участка. Попросила не беспокоить до весны."],
  ["Тимур Сулейменов", "+7 701 546 17 81", "Конаев", "Коттедж", 275, 2, "Кирпич", "premium", true, "ASAP", "80+ млн ₸", "Instagram", "Won", 94, "Договор подписан; проект передан в производство. Показательный кейс премиум-сегмента."],
  ["Карина Орлова", "+7 707 902 61 14", "Шымкент", "Дом", 156, 2, "Газоблок", "standard", true, "3–6 мес", "30–35 млн ₸", "Website", "Contacted", 78, "Просит подобрать решение с тёплым полом и оптимизацией площади кухни-гостиной."],
  ["Ермек Алиев", "+7 776 123 45 67", "Алматы", "Дом", 192, 2, "Брус", "premium", true, "6–12 мес", "45–50 млн ₸", "Manual", "New", 66, "Интерес к клеёному брусу; на первом контакте уточнить сезонность проживания."],
];

async function seed() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is unavailable");
  await db.delete(notifications);
  await db.delete(followups);
  await db.delete(tasks);
  await db.delete(proposals);
  await db.delete(leadActivities);
  await db.delete(estimates);
  await db.delete(leads);
  await db.delete(rateTables);
  await db.delete(companies);
  const [companyResult] = await db.insert(companies).values({ name: "Alatau Build", slug: "alatau-build", brandingConfig: { primary: "#bb5d32", region: "Алматы" } });
  const companyId = companyResult.insertId;
  const regions = ["Алматы", "Астана", "Шымкент", "Караганда", "Конаев"];
  const materials = ["Кирпич", "Газоблок", "Каркас", "Брус", "Не уверен"];
  const tiers = [["economy", 200000], ["standard", 290000], ["premium", 455000]] as const;
  const seedRates = regions.flatMap(region => materials.flatMap(material => tiers.map(([finishTier, baseRatePerM2]) => ({ companyId, version: 1, region, material, finishTier, baseRatePerM2 }))));
  await db.insert(rateTables).values(seedRates);

  const leadIds: number[] = [];
  for (let index = 0; index < leadSeeds.length; index++) {
    const [name, phone, region, projectType, areaM2, floors, material, finishTier, hasLand, desiredStart, budgetRange, source, status, score, aiSummary] = leadSeeds[index];
    const estimate = estimateProject({ areaM2: areaM2 as number, floors: floors as number, region: region as string, material: material as string, finishTier: finishTier as "economy" | "standard" | "premium", foundation: "Плитный", hasLand: hasLand as boolean, engineering: index % 3 === 0 ? ["Тёплый пол"] : [] });
    const [leadResult] = await db.insert(leads).values({ companyId, source: source as string, name: name as string, phone: phone as string, preferredChannel: "Telegram", region: region as string, projectType: projectType as string, areaM2: areaM2 as number, floors: floors as number, material: material as string, finishTier: finishTier as "economy" | "standard" | "premium", foundation: "Плитный", engineering: [], budgetRange: budgetRange as string, hasLand: hasLand as boolean, desiredStart: desiredStart as string, rawNotes: null, aiSummary: aiSummary as string, aiIntent: (score as number) >= 61 ? "genuine_buyer" : "researcher", aiConfidence: (score as number) >= 61 ? 88 : 58, missingFields: [], needsManualReview: false, score: score as number, scoreBand: (score as number) >= 81 ? "very_hot" : (score as number) >= 61 ? "hot" : (score as number) >= 31 ? "warm" : "cold", status: status as "New" | "Qualified" | "Contacted" | "Site Visit" | "Estimate Sent" | "Proposal Sent" | "Negotiation" | "Won" | "Lost", createdAt: daysAgo(2 + index * 2) });
    const leadId = leadResult.insertId;
    leadIds.push(leadId);
    const [estimateResult] = await db.insert(estimates).values({ companyId, leadId, rateTableVersion: 1, inputSnapshot: { areaM2, region, material, finishTier }, lowAmount: estimate.lowAmount, highAmount: estimate.highAmount, createdAt: daysAgo(2 + index * 2) });
    await db.insert(leadActivities).values([
      { companyId, leadId, actorType: "system", type: "lead_created", payload: { source }, createdAt: daysAgo(2 + index * 2) },
      { companyId, leadId, actorType: "ai", type: "qualification_completed", payload: { score, confidence: 88 }, createdAt: daysAgo(2 + index * 2) },
      { companyId, leadId, actorType: "manager", type: "status_changed", payload: { to: status }, createdAt: daysAgo(Math.max(0, 1 + index)) },
    ]);
    if (["Proposal Sent", "Negotiation", "Won"].includes(status as string)) {
      await db.insert(proposals).values({ companyId, leadId, estimateId: estimateResult.insertId, status: status === "Won" ? "viewed" : "sent", createdAt: daysAgo(index + 3) });
      await db.insert(followups).values([1, 3, 7].map((day, i) => ({ companyId, leadId, type: `day_${day}`, scheduledAt: daysAgo(Math.max(0, 8 - i)), status: (i === 0 ? "sent" : "pending") as "sent" | "pending", channel: "Telegram", messageText: "Черновик follow-up ожидает подтверждения менеджера." })));
    }
  }
  await db.insert(tasks).values([
    { companyId, leadId: leadIds[0]!, title: "Подтвердить время звонка с Данияром", dueAt: new Date(now + 2 * 3_600_000) },
    { companyId, leadId: leadIds[1]!, title: "Подготовить уточнение по эскизу", dueAt: new Date(now + 24 * 3_600_000) },
    { companyId, leadId: leadIds[7]!, title: "Согласовать доп. опции навеса", dueAt: new Date(now + 3 * 86_400_000) },
  ]);
  await db.insert(notifications).values({ companyId, channel: "Telegram", status: "queued", payload: { title: "HOT LEAD (92/100)", leadId: leadIds[0]!, text: "Дом 180 м², Алматы. Бюджет: 35–40 млн ₸. Участок уже есть, понятный срок старта." } });
  console.log("BuildScope AI seed completed");
}

seed().catch(async error => { console.error(error); process.exitCode = 1; });
