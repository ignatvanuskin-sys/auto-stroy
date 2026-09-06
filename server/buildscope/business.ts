export const DEMO_COMPANY_SLUG = "arqa-house";

export type FinishTier = "economy" | "standard" | "premium";
export type LeadIntent =
  | "genuine_buyer"
  | "researcher"
  | "competitor_or_spam"
  | "unclear";
export type ScoreBand = "cold" | "warm" | "hot" | "very_hot";

export type EstimateInput = {
  areaM2: number;
  floors: number;
  region: string;
  material: string;
  finishTier: FinishTier;
  foundation?: string | null;
  engineering?: string[];
  hasLand: boolean;
  baseRatePerM2?: number;
};

export type EstimateResult = {
  lowAmount: number;
  highAmount: number;
  baseRatePerM2: number;
  factors: string[];
};

const tierRates: Record<FinishTier, number> = {
  economy: 200_000,
  standard: 290_000,
  premium: 455_000,
};

const materialCoefficients: Record<string, number> = {
  Кирпич: 1.08,
  Газоблок: 1,
  Каркас: 0.9,
  Брус: 1.04,
  "Не уверен": 1,
};

const regionalCoefficients: Record<string, number> = {
  Алматы: 1.06,
  Астана: 1.04,
  Шымкент: 0.96,
  Караганда: 0.94,
  Конаев: 1,
};

const foundationCoefficients: Record<string, number> = {
  Плитный: 1.16,
  Ленточный: 1.04,
  Свайный: 1.1,
  "Не знаю": 1.08,
};

const serviceRegions = new Set(Object.keys(regionalCoefficients));

function floorDown(value: number, step: number) {
  return Math.floor(value / step) * step;
}

function ceilUp(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

export function estimateProject(input: EstimateInput): EstimateResult {
  const safeArea = Math.max(50, Math.min(600, Math.round(input.areaM2 || 50)));
  const safeFloors = Math.max(1, Math.min(3, Math.round(input.floors || 1)));
  const baseRate = input.baseRatePerM2 ?? tierRates[input.finishTier];
  const material = materialCoefficients[input.material] ?? 1;
  const region = regionalCoefficients[input.region] ?? 1.02;
  const floorCoefficient = 1 + (safeFloors - 1) * 0.09;
  const foundation =
    foundationCoefficients[input.foundation ?? "Не знаю"] ?? 1.08;
  const logistics = input.hasLand ? 1 : 1.06;
  const engineering = input.engineering ?? [];
  const addons = engineering.includes("Тёплый пол") ? 900_000 : 0;
  const adjusted =
    safeArea *
      baseRate *
      material *
      region *
      floorCoefficient *
      foundation *
      logistics +
    addons;
  const step = adjusted >= 40_000_000 ? 1_000_000 : 500_000;

  return {
    lowAmount: floorDown(adjusted * 0.88, step),
    highAmount: ceilUp(adjusted * 1.12, step),
    baseRatePerM2: baseRate,
    factors: [
      `${safeArea} м²`,
      `${safeFloors} эт.`,
      input.material || "материал уточняется",
      input.finishTier,
      input.hasLand ? "участок есть" : "участок подбирается",
    ],
  };
}

function budgetToAmount(budgetRange?: string | null) {
  if (!budgetRange || budgetRange === "Не готов озвучивать") return null;
  const matches = budgetRange.replace(/,/g, ".").match(/\d+(?:\.\d+)?/g);
  if (!matches?.length) return null;
  const values = matches.map(Number);
  const average = values.reduce((sum, item) => sum + item, 0) / values.length;
  return average * 1_000_000;
}

export type ScoreInput = {
  estimate: EstimateResult;
  budgetRange?: string | null;
  hasLand: boolean;
  desiredStart?: string | null;
  name?: string | null;
  phone?: string | null;
  areaM2?: number | null;
  region?: string | null;
  finishTier?: string | null;
  source?: string | null;
  intent?: LeadIntent | null;
  confidence?: number | null;
};

export type ScoreResult = {
  score: number;
  band: ScoreBand;
  reasons: string[];
  budgetMismatch: boolean;
};

export function scoreLead(input: ScoreInput): ScoreResult {
  let score = 0;
  const reasons: string[] = [];
  const budget = budgetToAmount(input.budgetRange);
  const budgetMismatch =
    budget !== null && budget < input.estimate.lowAmount * 0.7;

  if (budget !== null && !budgetMismatch) {
    score += 25;
    reasons.push("бюджет указан и согласован с параметрами");
  }
  if (input.hasLand) {
    score += 15;
    reasons.push("участок уже есть");
  }
  if (input.desiredStart === "ASAP" || input.desiredStart === "3–6 мес") {
    score += 15;
    reasons.push("понятный срок старта");
  }
  if (
    input.areaM2 &&
    input.region &&
    input.name &&
    input.phone &&
    input.finishTier
  ) {
    score += 10;
    reasons.push("заполнены ключевые параметры проекта");
  }
  if (input.region && serviceRegions.has(input.region)) {
    score += 10;
    reasons.push("регион в зоне работы компании");
  }
  if (input.phone && /^[+\d][\d\s()\-]{8,}$/.test(input.phone.trim())) {
    score += 10;
    reasons.push("контакт прошёл базовую проверку");
  }
  if (input.intent === "genuine_buyer" && (input.confidence ?? 0) >= 75) {
    score += 15;
    reasons.push("AI подтверждает намерение купить");
  }
  if (input.source === "Referral") {
    score += 5;
    reasons.push("реферальный источник");
  }

  score = Math.min(100, score);
  const band: ScoreBand =
    score >= 81
      ? "very_hot"
      : score >= 61
        ? "hot"
        : score >= 31
          ? "warm"
          : "cold";
  return { score, band, reasons, budgetMismatch };
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("₸", "₸");
}

export function formatEstimateRange(estimate: EstimateResult) {
  const toMillions = (amount: number) =>
    (amount / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
  return `${toMillions(estimate.lowAmount)}–${toMillions(estimate.highAmount)} млн ₸`;
}

export function defaultBaseRate(tier: FinishTier) {
  return tierRates[tier];
}

export function isServiceRegion(region: string) {
  return serviceRegions.has(region);
}
