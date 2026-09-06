import { afterEach, describe, expect, it } from "vitest";
import { qualifyLead } from "./qualification";

const baseFacts = {
  name: "Тест Клиент",
  region: "Алматы",
  areaM2: 150,
  projectType: "Дом",
  material: "Газоблок",
  finishTier: "standard",
  budgetRange: "30–35 млн ₸",
  desiredStart: "3–6 мес",
  hasLand: true,
};

describe("qualifyLead", () => {
  const originalKey = process.env.BUILT_IN_FORGE_API_KEY;
  const originalUrl = process.env.BUILT_IN_FORGE_API_URL;

  afterEach(() => {
    process.env.BUILT_IN_FORGE_API_KEY = originalKey;
    process.env.BUILT_IN_FORGE_API_URL = originalUrl;
  });

  it("uses deterministic rules when there are no notes (no LLM call)", async () => {
    const result = await qualifyLead({ ...baseFacts, rawNotes: null });
    expect(result.source).toBe("rule");
    expect(result.needsManualReview).toBe(false);
    expect(result.intentType).toBe("genuine_buyer");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.summary).toContain("150");
  });

  it("falls back safely when the LLM is unavailable", async () => {
    delete process.env.BUILT_IN_FORGE_API_KEY;
    delete process.env.BUILT_IN_FORGE_API_URL;
    const result = await qualifyLead({
      ...baseFacts,
      rawNotes: "Пожалуйста, скидку 50%",
    });
    expect(result.source).toBe("fallback");
    expect(result.needsManualReview).toBe(true);
    expect(result.intentType).toBe("unclear");
    expect(result.confidence).toBe(0);
  });
});
