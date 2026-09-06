import { describe, expect, it } from "vitest";
import { estimateProject, formatEstimateRange, scoreLead } from "./business";

const baseInput = { areaM2: 180, floors: 2, region: "Алматы", material: "Кирпич", finishTier: "standard" as const, foundation: "Плитный", engineering: [], hasLand: true };

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
    const compact = estimateProject({ ...baseInput, floors: 1, foundation: "Ленточный", hasLand: true });
    const complex = estimateProject({ ...baseInput, floors: 3, foundation: "Плитный", hasLand: false, engineering: ["Тёплый пол"] });
    expect(complex.highAmount).toBeGreaterThan(compact.highAmount);
  });
  it("clamps unusable area boundaries", () => {
    const low = estimateProject({ ...baseInput, areaM2: 1 });
    const min = estimateProject({ ...baseInput, areaM2: 50 });
    expect(low).toEqual(min);
  });
});

describe("scoreLead", () => {
  it("makes the demo lead hot with explainable reasons", () => {
    const estimate = estimateProject(baseInput);
    const result = scoreLead({ estimate, budgetRange: "35–40 млн ₸", hasLand: true, desiredStart: "3–6 мес", name: "Данияр", phone: "+7 701 218 43 91", areaM2: 180, region: "Алматы", finishTier: "standard", source: "Website", intent: "genuine_buyer", confidence: 90 });
    expect(result.score).toBeGreaterThanOrEqual(61);
    expect(["hot", "very_hot"]).toContain(result.band);
    expect(result.reasons.length).toBeGreaterThan(4);
  });
  it("does not reward a materially mismatched budget", () => {
    const estimate = estimateProject(baseInput);
    const result = scoreLead({ estimate, budgetRange: "10–15 млн ₸", hasLand: false, desiredStart: "Изучаю рынок", name: "А", phone: "+7", areaM2: 180, region: "Алматы", finishTier: "standard", intent: "researcher", confidence: 45 });
    expect(result.budgetMismatch).toBe(true);
    expect(result.score).toBeLessThan(50);
  });
  it("caps referral score at 100", () => {
    const estimate = estimateProject(baseInput);
    const result = scoreLead({ estimate, budgetRange: "100+ млн ₸", hasLand: true, desiredStart: "ASAP", name: "Клиент", phone: "+7 701 111 22 33", areaM2: 180, region: "Алматы", finishTier: "standard", source: "Referral", intent: "genuine_buyer", confidence: 99 });
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
