import { afterEach, describe, expect, it } from "vitest";
import { pickModel, qualifyLead } from "./qualification";

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

describe("pickModel", () => {
  it("prefers a known chat model when the provider offers several", () => {
    const catalog = {
      data: [{ id: "llama-3.3-70b-versatile" }, { id: "openai/gpt-oss-20b" }],
    };
    expect(pickModel(catalog)).toBe("openai/gpt-oss-20b");
  });

  it("never selects non-chat models (whisper, guard, tts, embed)", () => {
    const catalog = {
      data: [
        { id: "whisper-large-v3" },
        { id: "meta-llama/llama-prompt-guard-2-86m" },
        { id: "playai-tts" },
        { id: "openai/gpt-oss-120b" },
      ],
    };
    expect(pickModel(catalog)).toBe("openai/gpt-oss-120b");
  });

  it("returns undefined for a catalog with only non-chat models", () => {
    const catalog = {
      data: [{ id: "whisper-large-v3" }, { id: "playai-tts" }],
    };
    expect(pickModel(catalog)).toBeUndefined();
  });

  it("falls back to the first chat-capable model of an unknown provider", () => {
    const catalog = { data: [{ id: "some-new-chat-model" }] };
    expect(pickModel(catalog)).toBe("some-new-chat-model");
  });
});
