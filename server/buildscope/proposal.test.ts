import { describe, expect, it } from "vitest";
import { buildProposalPdf } from "./proposal";

function decode(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

describe("buildProposalPdf", () => {
  const baseInput = {
    proposalNumber: "BS-0001-2026",
    clientName: "Данияр Садыков",
    projectType: "Дом",
    areaM2: 180,
    region: "Алматы",
    material: "Кирпич",
    finishTier: "standard",
    desiredStart: "3–6 мес",
    estimate: {
      lowAmount: 66_000_000,
      highAmount: 85_000_000,
      baseRatePerM2: 290_000,
      factors: [],
    },
  };

  it("produces a valid PDF header and EOF marker", () => {
    const pdf = decode(buildProposalPdf(baseInput)).toString("latin1");
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
  });

  it("carries the ARQA HOUSE header and sales-department signature", () => {
    const pdf = decode(buildProposalPdf(baseInput)).toString("latin1");
    expect(pdf).toContain("ARQA HOUSE / PRELIMINARY COMMERCIAL PROPOSAL");
    expect(pdf).toContain("ARQA HOUSE sales department");
    expect(pdf).toContain("Powered by BuildScope AI");
  });

  it("escapes parentheses and backslashes; non-latin chars become placeholders", () => {
    const pdf = decode(
      buildProposalPdf({ ...baseInput, clientName: "А (тест) \\ odd" })
    ).toString("latin1");
    expect(pdf).toContain("Client: ? \\(????\\) \\\\ odd");
  });

  it("encodes the estimate range in the document body", () => {
    const pdf = decode(buildProposalPdf(baseInput)).toString("latin1");
    expect(pdf).toContain("66?85 ??? KZT");
  });

  it("falls back to 'to be agreed' when desiredStart is missing", () => {
    const pdf = decode(
      buildProposalPdf({ ...baseInput, desiredStart: null })
    ).toString("latin1");
    expect(pdf).toContain("Target start: to be agreed");
  });
});
