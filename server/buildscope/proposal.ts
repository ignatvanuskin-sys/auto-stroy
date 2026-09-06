import { formatEstimateRange, type EstimateResult } from "./business";

type ProposalInput = {
  proposalNumber: string;
  clientName: string;
  projectType: string;
  areaM2: number;
  region: string;
  material: string;
  finishTier: string;
  desiredStart?: string | null;
  estimate: EstimateResult;
};

function pdfEscape(value: string) {
  return value.replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "?");
}

/** Minimal deterministic PDF document. UI keeps a full Cyrillic preview; the downloadable file uses portable Latin headings. */
export function buildProposalPdf(input: ProposalInput) {
  const lines = [
    "BUILDSCOPE AI / PRELIMINARY COMMERCIAL PROPOSAL",
    `Proposal: ${input.proposalNumber}`,
    "",
    "CLIENT AND PROJECT",
    `Client: ${input.clientName}`,
    `Project: ${input.projectType}; ${input.areaM2} m2; ${input.region}`,
    `Walls: ${input.material}; finish: ${input.finishTier}`,
    `Target start: ${input.desiredStart || "to be agreed"}`,
    "",
    "PRELIMINARY ESTIMATE",
    formatEstimateRange(input.estimate).replace(/₸/g, "KZT"),
    "",
    "SCOPE",
    "Design coordination, foundation, shell, roof, basic utilities, finishing package.",
    "Final composition and schedule are confirmed after a manager consultation.",
    "",
    "IMPORTANT",
    "This is a preliminary range, not a fixed quotation or contract offer.",
    "The final estimate is prepared after the project details are clarified.",
    "",
    "BuildScope AI / construction sales automation demo",
  ];
  const content = ["BT", "/F1 12 Tf", "50 790 Td", "16 TL"]
    .concat(lines.map((line, index) => `${index === 0 ? "/F1 15 Tf" : "/F1 10 Tf"} (${pdfEscape(line)}) Tj T*`))
    .concat(["ET"])
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(output));
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(output);
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    output += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(output, "utf8").toString("base64");
}
