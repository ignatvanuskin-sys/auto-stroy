import { describe, expect, it } from "vitest";
import {
  defaultBaseRate,
  estimateProject,
  formatEstimateRange,
  formatMoney,
  isServiceRegion,
  scoreLead,
} from "./business";

const baseInput = {
  areaM2: 180,
  floors: 2,
  region: "Алматы",
  material: "Кирпич",
  finishTier: "standard" as const,
  foundation: "Плитный",
  engineering: [],
  hasLand: true,
};

describe("estimateProject", () => {
  it("returns a rounded honest range, never a single exact price", () => {
    const result = estimateProject(baseInput);
    expect(result.lowAmount).toBeLessThan(result.highAmount);
    expect(result.lowAmount % 500_000).toBe(0);
    expect(result.highAmount % 500_000).toBe(0);
    expect(formatEstimateRange(result)).toMatch(/млн ₸/);
  });
  it("is deterministic for identical inputs", () => {
    expect(estimateProject(baseInput)).toEqual(estimateProject(baseInput));
  });
  it("accounts for floor, foundation and land factors", () => {
    const compact = estimateProject({
      ...baseInput,
      floors: 1,
      foundation: "Ленточный",
      hasLand: true,
    });
    const complex = estimateProject({
      ...baseInput,
      floors: 3,
      foundation: "Плитный",
      hasLand: false,
      engineering: ["Тёплый пол"],
    });
    expect(complex.highAmount).toBeGreaterThan(compact.highAmount);
  });
  it("clamps unusable area boundaries", () => {
    const low = estimateProject({ ...baseInput, areaM2: 1 });
    const min = estimateProject({ ...baseInput, areaM2: 50 });
    expect(low).toEqual(min);
  });

  it("clamps floors above the supported maximum", () => {
    const clamped = estimateProject({ ...baseInput, floors: 10 });
    const max = estimateProject({ ...baseInput, floors: 3 });
    expect(clamped).toEqual(max);
  });

  it("rounds to 1M steps for large projects and 0.5M steps for small ones", () => {
    const large = estimateProject({
      areaM2: 600,
      floors: 3,
      region: "Алматы",
      material: "Кирпич",
      finishTier: "premium",
      foundation: "Плитный",
      engineering: [],
      hasLand: false,
    });
    expect(large.highAmount).toBeGreaterThan(40_000_000);
    expect(large.lowAmount % 1_000_000).toBe(0);

    const small = estimateProject({
      areaM2: 50,
      floors: 1,
      region: "Конаев",
      material: "Каркас",
      finishTier: "economy",
      foundation: "Ленточный",
      engineering: [],
      hasLand: true,
    });
    expect(small.lowAmount % 500_000).toBe(0);
    expect(small.highAmount % 500_000).toBe(0);
  });

  it("uses the provided rate-table rate when available", () => {
    const result = estimateProject({ ...baseInput, baseRatePerM2: 350_000 });
    expect(result.baseRatePerM2).toBe(350_000);
    expect(result.lowAmount).toBeGreaterThan(
      estimateProject(baseInput).lowAmount
    );
  });

  it("falls back to a neutral coefficient for unknown regions and materials", () => {
    const unknown = estimateProject({
      ...baseInput,
      region: "Лондон",
      material: "Солома",
    });
    const known = estimateProject(baseInput);
    // Unknown region applies a flat 1.02 premium; unknown material is neutral.
    expect(unknown.lowAmount).toBeGreaterThan(0);
    expect(unknown).not.toEqual(known);
  });
});

describe("scoreLead", () => {
  it("makes the demo lead hot with explainable reasons", () => {
    const estimate = estimateProject(baseInput);
    const result = scoreLead({
      estimate,
      budgetRange: "35–40 млн ₸",
      hasLand: true,
      desiredStart: "3–6 мес",
      name: "Данияр",
      phone: "+7 701 218 43 91",
      areaM2: 180,
      region: "Алматы",
      finishTier: "standard",
      source: "Website",
      intent: "genuine_buyer",
      confidence: 90,
    });
    expect(result.score).toBeGreaterThanOrEqual(61);
    expect(["hot", "very_hot"]).toContain(result.band);
    expect(result.reasons.length).toBeGreaterThan(4);
  });
  it("does not reward a materially mismatched budget", () => {
    const estimate = estimateProject(baseInput);
    const result = scoreLead({
      estimate,
      budgetRange: "10–15 млн ₸",
      hasLand: false,
      desiredStart: "Изучаю рынок",
      name: "А",
      phone: "+7",
      areaM2: 180,
      region: "Алматы",
      finishTier: "standard",
      intent: "researcher",
      confidence: 45,
    });
    expect(result.budgetMismatch).toBe(true);
    expect(result.score).toBeLessThan(50);
  });
  it("caps referral score at 100", () => {
    const estimate = estimateProject(baseInput);
    const result = scoreLead({
      estimate,
      budgetRange: "100+ млн ₸",
      hasLand: true,
      desiredStart: "ASAP",
      name: "Клиент",
      phone: "+7 701 111 22 33",
      areaM2: 180,
      region: "Алматы",
      finishTier: "standard",
      source: "Referral",
      intent: "genuine_buyer",
      confidence: 99,
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("treats a missing budget as neutral (no bonus, no mismatch)", () => {
    const estimate = estimateProject(baseInput);
    const result = scoreLead({
      estimate,
      budgetRange: null,
      hasLand: true,
      desiredStart: "ASAP",
      name: "Клиент",
      phone: "+7 701 000 11 22",
      areaM2: 180,
      region: "Алматы",
      finishTier: "standard",
    });
    expect(result.budgetMismatch).toBe(false);
    expect(result.reasons.join(" ")).not.toContain("бюджет");
  });

  it("classifies an empty lead as cold", () => {
    const estimate = estimateProject(baseInput);
    const empty = scoreLead({ estimate, hasLand: false, desiredStart: null });
    expect(empty.band).toBe("cold");
    expect(empty.score).toBe(0);
  });

  it("classifies band thresholds through the 61 hot boundary", () => {
    const estimate = estimateProject(baseInput);
    // hasLand(15) + params(10) + region(10) + phone(10) = 45 -> warm
    const warm = scoreLead({
      estimate,
      hasLand: true,
      desiredStart: null,
      name: "К",
      phone: "+7 701 000 11 22",
      areaM2: 180,
      region: "Алматы",
      finishTier: "standard",
    });
    expect(warm.score).toBe(45);
    expect(warm.band).toBe("warm");

    // + ASAP(15) -> 60, still warm at the boundary
    const atBoundary = scoreLead({
      estimate,
      hasLand: true,
      desiredStart: "ASAP",
      name: "К",
      phone: "+7 701 000 11 22",
      areaM2: 180,
      region: "Алматы",
      finishTier: "standard",
    });
    expect(atBoundary.score).toBe(60);
    expect(atBoundary.band).toBe("warm");

    // + AI intent(15) -> 75, hot
    const hot = scoreLead({
      estimate,
      hasLand: true,
      desiredStart: "ASAP",
      name: "К",
      phone: "+7 701 000 11 22",
      areaM2: 180,
      region: "Алматы",
      finishTier: "standard",
      intent: "genuine_buyer",
      confidence: 82,
    });
    expect(hot.score).toBe(75);
    expect(hot.band).toBe("hot");
  });
});

describe("formatting and helpers", () => {
  it("formats money in KZT without decimals", () => {
    // Node ICU renders KZT as an ISO code with non-breaking-space grouping.
    expect(formatMoney(66_000_000)).toMatch(
      /^66[\s\u00a0]000[\s\u00a0]000[\s\u00a0]KZT$/u
    );
  });

  it("formats an estimate range in millions", () => {
    const range = formatEstimateRange({
      lowAmount: 66_000_000,
      highAmount: 85_500_000,
      baseRatePerM2: 0,
      factors: [],
    });
    expect(range).toBe("66–85,5 млн ₸");
  });

  it("exposes default rates per tier", () => {
    expect(defaultBaseRate("economy")).toBe(200_000);
    expect(defaultBaseRate("standard")).toBe(290_000);
    expect(defaultBaseRate("premium")).toBe(455_000);
  });

  it("knows the service regions", () => {
    expect(isServiceRegion("Алматы")).toBe(true);
    expect(isServiceRegion("Лондон")).toBe(false);
  });
});
