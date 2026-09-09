import { sql } from "drizzle-orm";
import {
  companies,
  estimates,
  followups,
  leadActivities,
  leads,
  notifications,
  proposals,
  rateTables,
  tasks,
} from "../../drizzle/schema";
import { estimateProject, scoreLead } from "./business";
import { getDb } from "../db";

const now = Date.now();
const daysAgo = (days: number) => new Date(now - days * 86_400_000);
const daysAhead = (days: number) => new Date(now + days * 86_400_000);

/** Deterministic PRNG so every seed run produces the identical demo dataset. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(20260906);
const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)]!;
const intBetween = (min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));

const REGIONS = [
  "Алматы",
  "Талгар",
  "Каскелен",
  "Конаев",
  "Алматинская обл.",
] as const;
const MATERIALS = [
  "Кирпич",
  "Газоблок",
  "Каркас",
  "Брус",
  "Не уверен",
] as const;
const FOUNDATIONS = ["Плитный", "Ленточный", "Свайный", "Не знаю"] as const;
const STARTS = ["ASAP", "3–6 мес", "6–12 мес", "Изучаю рынок"] as const;
const SOURCES = [
  "Website",
  "Instagram",
  "Referral",
  "Telegram",
  "Manual",
] as const;
const BUDGETS_SMALL = ["20–25 млн ₸", "25–30 млн ₸", "30–35 млн ₸"] as const;
const BUDGETS_MEDIUM = ["35–40 млн ₸", "40–55 млн ₸"] as const;
const BUDGETS_LARGE = ["55–70 млн ₸", "70–85 млн ₸", "90+ млн ₸"] as const;
const PROJECT_TYPES = ["Дом", "Коттедж", "Дача"] as const;

const FIRST_NAMES = [
  "Данияр",
  "Асель",
  "Айгуль",
  "Марат",
  "София",
  "Руслан",
  "Жанна",
  "Тимур",
  "Карина",
  "Ермек",
  "Айша",
  "Арман",
  "Илья",
  "Дана",
  "Нурлан",
  "Мадина",
  "Санжар",
  "Алия",
  "Виктор",
  "Камила",
  "Ерасыл",
  "Тогжан",
  "Ислам",
  "Дария",
] as const;
const LAST_NAMES = [
  "Абенов",
  "Смагулова",
  "Иманбаев",
  "Турсынова",
  "Жумабаева",
  "Кенжебаев",
  "Оспанова",
  "Беляев",
  "Сатыбалдиева",
  "Алиев",
  "Мухамедиева",
  "Панфилов",
  "Ахметова",
  "Сулейменов",
  "Орлова",
  "Досжан",
  "Ким",
  "Уразалина",
  "Гринев",
  "Сейсенова",
  "Бекболат",
  "Литвинова",
  "Кайрат",
  "Есенгельды",
] as const;

const PIPELINE_MIX: Array<
  | "New"
  | "Qualified"
  | "Contacted"
  | "Site Visit"
  | "Estimate Sent"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost"
> = [
  ...Array<"New">(6).fill("New"),
  ...Array<"Qualified">(5).fill("Qualified"),
  ...Array<"Contacted">(5).fill("Contacted"),
  ...Array<"Site Visit">(4).fill("Site Visit"),
  ...Array<"Estimate Sent">(4).fill("Estimate Sent"),
  ...Array<"Proposal Sent">(4).fill("Proposal Sent"),
  ...Array<"Negotiation">(4).fill("Negotiation"),
  ...Array<"Won">(3).fill("Won"),
  ...Array<"Lost">(6).fill("Lost"),
];

const STATUS_PIPELINE_INDEX: Record<string, number> = {
  New: 0,
  Qualified: 1,
  Contacted: 2,
  "Site Visit": 3,
  "Estimate Sent": 4,
  "Proposal Sent": 5,
  Negotiation: 6,
  Won: 7,
  Lost: 7,
};

/** Handwritten marquee leads (rich summaries, spread across the pipeline). */
const curatedLeads = [
  {
    name: "Асель Жумабаева",
    phone: "+7 701 218 43 91",
    region: "Алматы",
    projectType: "Дом",
    areaM2: 180,
    floors: 2,
    material: "Кирпич",
    finishTier: "standard" as const,
    foundation: "Плитный",
    engineering: ["Отопление", "Вода", "Канализация", "Электрика"],
    hasLand: true,
    desiredStart: "3–6 мес",
    budgetRange: "35–40 млн ₸",
    source: "Website",
    status: "New" as const,
    aiSummary:
      "Горячий демо-клиент кейса: дом 180 м² в Алматы, кирпич, стандарт, участок есть, старт весной (3–6 мес), бюджет 35–40 млн ₸.",
  },
  {
    name: "Алексей Морозов",
    phone: "+7 777 614 02 18",
    region: "Алматы",
    projectType: "Коттедж",
    areaM2: 242,
    floors: 2,
    material: "Газоблок",
    finishTier: "premium" as const,
    foundation: "Свайный",
    engineering: ["Отопление", "Тёплый пол"],
    hasLand: true,
    desiredStart: "ASAP",
    budgetRange: "60–70 млн ₸",
    source: "Referral",
    status: "Negotiation" as const,
    aiSummary:
      "Есть участок и готовый эскиз. Критичны сроки и прозрачная смета.",
  },
  {
    name: "Айша Тулеубаева",
    phone: "+7 705 327 19 60",
    region: "Талгар",
    projectType: "Дом",
    areaM2: 146,
    floors: 1,
    material: "Газоблок",
    finishTier: "standard" as const,
    foundation: "Ленточный",
    engineering: ["Отопление"],
    hasLand: false,
    desiredStart: "6–12 мес",
    budgetRange: "30–35 млн ₸",
    source: "Instagram",
    status: "Contacted" as const,
    aiSummary:
      "Сравнивает варианты, участок выбирает. Интересуется энергоэффективной комплектацией.",
  },
  {
    name: "Марат Кенжебаев",
    phone: "+7 747 182 88 34",
    region: "Каскелен",
    projectType: "Дача",
    areaM2: 104,
    floors: 1,
    material: "Каркас",
    finishTier: "economy" as const,
    foundation: "Свайный",
    engineering: [],
    hasLand: true,
    desiredStart: "Изучаю рынок",
    budgetRange: "Не готов озвучивать",
    source: "Website",
    status: "New" as const,
    aiSummary:
      "Изучает варианты для сезонного проживания, просит понять порядок бюджета.",
  },
  {
    name: "Руслан Исмаилов",
    phone: "+7 701 434 72 10",
    region: "Алматинская обл.",
    projectType: "Дом",
    areaM2: 210,
    floors: 2,
    material: "Кирпич",
    finishTier: "standard" as const,
    foundation: "Плитный",
    engineering: ["Отопление", "Электрика"],
    hasLand: true,
    desiredStart: "3–6 мес",
    budgetRange: "45–50 млн ₸",
    source: "Website",
    status: "Estimate Sent" as const,
    aiSummary:
      "Земля оформлена. Нужен уточнённый расчёт после согласования планировки.",
  },
  {
    name: "София Бекенова",
    phone: "+7 775 880 31 56",
    region: "Алматы",
    projectType: "Коттедж",
    areaM2: 320,
    floors: 2,
    material: "Кирпич",
    finishTier: "premium" as const,
    foundation: "Плитный",
    engineering: ["Отопление", "Тёплый пол", "Вода", "Канализация"],
    hasLand: true,
    desiredStart: "6–12 мес",
    budgetRange: "70–85 млн ₸",
    source: "Telegram",
    status: "Site Visit" as const,
    aiSummary:
      "Запланирован выезд на участок. Семья выбирает между кирпичом и монолитом.",
  },
  {
    name: "Арман Жансугуров",
    phone: "+7 771 291 07 43",
    region: "Каскелен",
    projectType: "Дом",
    areaM2: 130,
    floors: 1,
    material: "Газоблок",
    finishTier: "economy" as const,
    foundation: "Ленточный",
    engineering: [],
    hasLand: false,
    desiredStart: "6–12 мес",
    budgetRange: "20–25 млн ₸",
    source: "Manual",
    status: "Qualified" as const,
    aiSummary:
      "Клиент в процессе выбора участка; хочет зафиксировать базовую комплектацию.",
  },
  {
    name: "Илья Беляев",
    phone: "+7 705 624 18 09",
    region: "Талгар",
    projectType: "Дом",
    areaM2: 167,
    floors: 2,
    material: "Кирпич",
    finishTier: "standard" as const,
    foundation: "Плитный",
    engineering: ["Отопление", "Вода"],
    hasLand: true,
    desiredStart: "3–6 мес",
    budgetRange: "40–55 млн ₸",
    source: "Referral",
    status: "Proposal Sent" as const,
    aiSummary:
      "Получил предложение, просит добавить навес для двух автомобилей и скорректировать сроки.",
  },
  {
    name: "Жанна Ахметова",
    phone: "+7 747 099 42 21",
    region: "Алматы",
    projectType: "Дом",
    areaM2: 122,
    floors: 1,
    material: "Каркас",
    finishTier: "standard" as const,
    foundation: "Свайный",
    engineering: [],
    hasLand: false,
    desiredStart: "Изучаю рынок",
    budgetRange: "25–30 млн ₸",
    source: "Website",
    status: "Lost" as const,
    aiSummary:
      "Проект отложен до оформления участка. Попросила не беспокоить до весны.",
  },
  {
    name: "Тимур Сулейменов",
    phone: "+7 701 546 17 81",
    region: "Конаев",
    projectType: "Коттедж",
    areaM2: 275,
    floors: 2,
    material: "Кирпич",
    finishTier: "premium" as const,
    foundation: "Плитный",
    engineering: ["Отопление", "Тёплый пол", "Канализация"],
    hasLand: true,
    desiredStart: "ASAP",
    budgetRange: "90+ млн ₸",
    source: "Instagram",
    status: "Won" as const,
    aiSummary:
      "Договор подписан; проект передан в производство. Показательный кейс премиум-сегмента.",
  },
  {
    name: "Карина Орлова",
    phone: "+7 707 902 61 14",
    region: "Алматы",
    projectType: "Дом",
    areaM2: 156,
    floors: 2,
    material: "Газоблок",
    finishTier: "standard" as const,
    foundation: "Ленточный",
    engineering: ["Тёплый пол"],
    hasLand: true,
    desiredStart: "3–6 мес",
    budgetRange: "30–35 млн ₸",
    source: "Website",
    status: "Contacted" as const,
    aiSummary:
      "Просит подобрать решение с тёплым полом и оптимизацией площади кухни-гостиной.",
  },
  {
    name: "Ермек Алиев",
    phone: "+7 776 123 45 67",
    region: "Алматинская обл.",
    projectType: "Дом",
    areaM2: 192,
    floors: 2,
    material: "Брус",
    finishTier: "premium" as const,
    foundation: "Плитный",
    engineering: ["Отопление"],
    hasLand: true,
    desiredStart: "6–12 мес",
    budgetRange: "55–70 млн ₸",
    source: "Manual",
    status: "New" as const,
    aiSummary:
      "Интерес к клеёному брусу; на первом контакте уточнить сезонность проживания.",
  },
];

function generatedLead(status: (typeof PIPELINE_MIX)[number]) {
  const nameIndex = Math.floor(random() * FIRST_NAMES.length);
  const name = `${FIRST_NAMES[nameIndex]} ${LAST_NAMES[Math.floor(random() * LAST_NAMES.length)]}`;
  const phone = `+7 70${intBetween(0, 9)} ${String(intBetween(100, 999))} ${String(intBetween(10, 99))} ${String(intBetween(10, 99))}`;
  const areaM2 = intBetween(8, 32) * 10; // 80–320 м²
  const floors =
    areaM2 >= 220 ? intBetween(2, 3) : areaM2 <= 130 ? 1 : intBetween(1, 2);
  const finishTier =
    areaM2 >= 260
      ? "premium"
      : areaM2 <= 140
        ? random() < 0.55
          ? "economy"
          : "standard"
        : "standard";
  const budgetPool =
    finishTier === "premium"
      ? BUDGETS_LARGE
      : finishTier === "economy"
        ? BUDGETS_SMALL
        : BUDGETS_MEDIUM;
  const budgetRange =
    random() < 0.12 ? "Не готов озвучивать" : pick(budgetPool);
  const desiredStart = pick(STARTS);
  const hasLand = random() < 0.62;
  const engineering = [
    "Отопление",
    "Вода",
    "Канализация",
    "Электрика",
    "Тёплый пол",
  ].filter(() => random() < 0.55);
  const aiSummary = `${name} рассматривает ${pick(PROJECT_TYPES).toLowerCase()} ${areaM2} м². ${hasLand ? "Участок есть." : "Участок подбирается."} Старт: ${desiredStart}.`;

  return {
    name,
    phone,
    region: pick(REGIONS),
    projectType: pick(PROJECT_TYPES),
    areaM2,
    floors,
    material: pick(MATERIALS),
    finishTier: finishTier as "economy" | "standard" | "premium",
    foundation: pick(FOUNDATIONS),
    engineering,
    hasLand,
    desiredStart,
    budgetRange,
    source: pick(SOURCES),
    status,
    aiSummary,
  };
}

function bandOf(score: number) {
  return score >= 81
    ? "very_hot"
    : score >= 61
      ? "hot"
      : score >= 31
        ? "warm"
        : "cold";
}

function scoreFor(lead: {
  areaM2: number;
  floors: number;
  region: string;
  material: string;
  finishTier: "economy" | "standard" | "premium";
  foundation: string;
  engineering: string[];
  hasLand: boolean;
  budgetRange: string;
  desiredStart: string;
}) {
  const estimate = estimateProject(lead);
  const scoring = scoreLead({
    estimate,
    budgetRange: lead.budgetRange,
    hasLand: lead.hasLand,
    desiredStart: lead.desiredStart,
    name: "Имя Фамилия",
    phone: "+7 701 000 00 00",
    areaM2: lead.areaM2,
    region: lead.region,
    finishTier: lead.finishTier,
    source: "Website",
    intent:
      lead.desiredStart === "Изучаю рынок" ? "researcher" : "genuine_buyer",
    confidence: lead.desiredStart === "Изучаю рынок" ? 58 : 82,
  });
  return { estimate, scoring };
}

function followupsFor(status: string, ageDays: number) {
  const channel = "Telegram";
  const base = [
    { day: 1, text: "Удобно ли обсудить детали проекта?" },
    { day: 3, text: "Готовы уточнить вопросы по комплектации?" },
    { day: 7, text: "Оставим расчёт актуальным — написать вам позже?" },
  ];
  const pipelineIndex = STATUS_PIPELINE_INDEX[status] ?? 0;

  if (status === "Lost") {
    return base.slice(0, 2).map(item => ({
      type: `day_${item.day}`,
      scheduledAt: daysAgo(Math.max(1, ageDays - item.day)),
      status: "skipped" as const,
      channel,
      messageText: item.text,
    }));
  }

  if (pipelineIndex >= 5) {
    // Deep pipeline: the whole 1/3/7 sequence already ran in the past.
    return base.map((item, i) => ({
      type: `day_${item.day}`,
      scheduledAt: daysAgo(Math.max(1, ageDays - item.day)),
      status: (ageDays - item.day > 1 ? "sent" : "pending") as
        | "sent"
        | "pending",
      channel,
      messageText: item.text,
    }));
  }

  if (pipelineIndex >= 2) {
    // Mid pipeline: first touchpoint done, the rest still queued.
    return [
      {
        type: "day_1",
        scheduledAt: daysAgo(Math.max(1, ageDays - 1)),
        status: "sent" as const,
        channel,
        messageText: base[0]!.text,
      },
      {
        type: "day_3",
        scheduledAt: daysAhead(intBetween(1, 4)),
        status: "pending" as const,
        channel,
        messageText: base[1]!.text,
      },
    ];
  }

  // Fresh leads: follow-up drafts waiting in the near future.
  return [
    {
      type: "day_1",
      scheduledAt: daysAhead(intBetween(1, 3)),
      status: "pending" as const,
      channel,
      messageText: base[0]!.text,
    },
  ];
}

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
  const [companyResult] = await db.insert(companies).values({
    name: "ARQA HOUSE",
    slug: "arqa-house",
    brandingConfig: {
      primary: "#bc5c35",
      region: "Алматы",
      tagline: "Дом, который начинается с точного расчёта",
      contacts: {
        address: "г. Алматы, Бостандыкский р-н",
        phone: "+7 (727) 000-00-00",
        email: "info@arqahouse.kz",
      },
    },
  });
  const companyId = companyResult.insertId;

  const materials = [...MATERIALS];
  const tiers = [
    ["economy", 200000],
    ["standard", 290000],
    ["premium", 455000],
  ] as const;
  const seedRates = REGIONS.flatMap(region =>
    materials.flatMap(material =>
      tiers.map(([finishTier, baseRatePerM2]) => ({
        companyId,
        version: 1,
        region,
        material,
        finishTier,
        baseRatePerM2,
      }))
    )
  );
  await db.insert(rateTables).values(seedRates);

  const allLeads = [
    ...curatedLeads,
    ...PIPELINE_MIX.map(status => generatedLead(status)),
  ];
  const leadIds: number[] = [];
  let proposalCount = 0;

  for (let index = 0; index < allLeads.length; index++) {
    const lead = allLeads[index]!;
    // Spread creation across the last 4 weeks so analytics are not flat.
    const ageDays = index === 0 ? 1 : 1 + ((index * 7) % 26);
    const createdAt = daysAgo(ageDays);
    const { estimate, scoring } = scoreFor(lead);
    const score = scoring.score;
    const band = bandOf(score);
    const isCurated = index < curatedLeads.length;

    const [leadResult] = await db.insert(leads).values({
      companyId,
      source: lead.source,
      name: lead.name,
      phone: lead.phone,
      preferredChannel:
        random() < 0.5 ? "Telegram" : random() < 0.5 ? "Звонок" : "WhatsApp",
      region: lead.region,
      projectType: lead.projectType,
      areaM2: lead.areaM2,
      floors: lead.floors,
      material: lead.material,
      finishTier: lead.finishTier,
      foundation: lead.foundation,
      engineering: lead.engineering,
      budgetRange: lead.budgetRange,
      hasLand: lead.hasLand,
      desiredStart: lead.desiredStart,
      rawNotes: null,
      aiSummary: lead.aiSummary,
      aiIntent:
        lead.desiredStart === "Изучаю рынок" ? "researcher" : "genuine_buyer",
      aiConfidence: score >= 61 ? 84 : 58,
      missingFields: [],
      needsManualReview: scoring.budgetMismatch,
      score,
      scoreBand: band,
      status: lead.status,
      createdAt,
    });
    const leadId = leadResult.insertId;
    leadIds.push(leadId);

    const [estimateResult] = await db.insert(estimates).values({
      companyId,
      leadId,
      rateTableVersion: 1,
      inputSnapshot: {
        areaM2: lead.areaM2,
        region: lead.region,
        material: lead.material,
        finishTier: lead.finishTier,
      },
      lowAmount: estimate.lowAmount,
      highAmount: estimate.highAmount,
      createdAt,
    });

    await db.insert(leadActivities).values([
      {
        companyId,
        leadId,
        actorType: "system",
        type: "lead_created",
        payload: { source: lead.source, calculation: lead.budgetRange },
        createdAt,
      },
      {
        companyId,
        leadId,
        actorType: "ai",
        type: "qualification_completed",
        payload: {
          intent:
            lead.desiredStart === "Изучаю рынок"
              ? "researcher"
              : "genuine_buyer",
          confidence: score >= 61 ? 84 : 58,
          source: "rule",
        },
        createdAt,
      },
      {
        companyId,
        leadId,
        actorType: "system",
        type: "score_calculated",
        payload: { score, reasons: scoring.reasons },
        createdAt,
      },
      ...(lead.status !== "New"
        ? [
            {
              companyId,
              leadId,
              actorType: "manager" as const,
              type: "status_changed",
              payload: { to: lead.status },
              createdAt: daysAgo(Math.max(0, ageDays - 1)),
            },
          ]
        : []),
    ]);

    // Proposals for the deep-pipeline stages: 10–15 across draft/sent/viewed.
    if (
      ["Estimate Sent", "Proposal Sent", "Negotiation", "Won"].includes(
        lead.status
      )
    ) {
      const proposalStatus =
        lead.status === "Won"
          ? "viewed"
          : lead.status === "Negotiation"
            ? "sent"
            : lead.status === "Proposal Sent"
              ? "sent"
              : "draft";
      const proposalNumber = `BS-${String(leadId).padStart(4, "0")}-2026`;
      await db.insert(proposals).values({
        companyId,
        leadId,
        estimateId: estimateResult.insertId,
        status: proposalStatus,
        sentAt:
          proposalStatus === "draft" ? null : daysAgo(Math.max(1, ageDays - 2)),
        createdAt: daysAgo(Math.max(1, ageDays - 2)),
      });
      await db.insert(leadActivities).values({
        companyId,
        leadId,
        actorType: "system",
        type: "proposal_generated",
        payload: { proposalNumber },
        createdAt: daysAgo(Math.max(1, ageDays - 2)),
      });
      proposalCount += 1;
    }

    await db.insert(followups).values(
      followupsFor(lead.status, ageDays).map(item => ({
        companyId,
        leadId,
        type: item.type,
        scheduledAt: item.scheduledAt,
        status: item.status,
        channel: item.channel,
        messageText: item.messageText,
      }))
    );
  }

  await db.insert(tasks).values([
    {
      companyId,
      leadId: leadIds[0]!,
      title: "Позвонить Асель Жумабаевой — горячий демо-лид (180 м², Алматы)",
      dueAt: daysAhead(0.125),
    },
    {
      companyId,
      leadId: leadIds[1]!,
      title: "Подготовить уточнение по эскизу Алексея",
      dueAt: daysAhead(1),
    },
    {
      companyId,
      leadId: leadIds[7]!,
      title: "Отправить доработанное КП с навесом",
      dueAt: daysAhead(2),
    },
    {
      companyId,
      leadId: leadIds[5]!,
      title: "Согласовать выезд на участок (София)",
      dueAt: daysAhead(3),
    },
    {
      companyId,
      leadId: leadIds[4]!,
      title: "Дозвониться Руслану по уточнённому расчёту",
      dueAt: daysAgo(1),
    },
  ]);

  const hotLeadId = leadIds[0]!;
  await db.insert(notifications).values([
    {
      companyId,
      channel: "Telegram",
      status: "queued",
      payload: {
        title: "HOT LEAD (75/100)",
        leadId: hotLeadId,
        text: "Дом 180 м², Алматы. Бюджет: 35–40 млн ₸. Участок есть, старт весной.\n\n— BuildScope AI для ARQA HOUSE",
      },
      createdAt: daysAgo(1),
    },
    {
      companyId,
      channel: "Telegram",
      status: "sent",
      payload: {
        title: "VERY HOT LEAD (96/100)",
        leadId: leadIds[1]!,
        text: "Коттедж 242 м², Алматы. Бюджет: 60–70 млн ₸. Referral.\n\n— BuildScope AI для ARQA HOUSE",
      },
      createdAt: daysAgo(9),
    },
    {
      companyId,
      channel: "Telegram",
      status: "sent",
      payload: {
        title: "HOT LEAD (84/100)",
        leadId: leadIds[4]!,
        text: "Дом 210 м², Алматинская обл. Бюджет: 45–50 млн ₸.\n\n— BuildScope AI для ARQA HOUSE",
      },
      createdAt: daysAgo(16),
    },
  ]);

  console.log(
    `ARQA HOUSE seed completed: ${allLeads.length} leads, ${proposalCount} proposals (powered by BuildScope AI)`
  );
}

seed()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
