import { describe, expect, it } from "vitest";
import { extractOutboxText } from "./telegramWorker";

describe("extractOutboxText", () => {
  it("extracts title and text from a valid payload", () => {
    const result = extractOutboxText({
      title: "HOT LEAD (92/100)",
      text: "Дом 180 м², Алматы.",
      leadId: 1,
    });
    expect(result).toEqual({
      title: "HOT LEAD (92/100)",
      text: "Дом 180 м², Алматы.",
    });
  });

  it("returns null when text is missing or empty", () => {
    expect(extractOutboxText({ title: "x" })).toBeNull();
    expect(extractOutboxText({ text: "   " })).toBeNull();
    expect(extractOutboxText(null)).toBeNull();
    expect(extractOutboxText("string payload")).toBeNull();
  });

  it("tolerates a missing title", () => {
    expect(extractOutboxText({ text: "hello" })).toEqual({
      title: "",
      text: "hello",
    });
  });
});
