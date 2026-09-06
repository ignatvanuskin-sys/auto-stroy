import { describe, expect, it, vi } from "vitest";
import { healthHandler } from "./health";

vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "../db";
const mockedGetDb = vi.mocked(getDb);

function makeRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

describe("healthHandler", () => {
  it("reports ok with database unavailable when there is no connection", async () => {
    mockedGetDb.mockResolvedValue(null);
    const res = makeRes();
    await healthHandler({} as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, database: "unavailable" });
  });

  it("reports database ok when a probe query succeeds", async () => {
    mockedGetDb.mockResolvedValue({
      execute: vi.fn(async () => ({ rows: [] })),
    } as never);
    const res = makeRes();
    await healthHandler({} as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, database: "ok" });
  });

  it("stays available (200) when the probe query fails", async () => {
    mockedGetDb.mockResolvedValue({
      execute: vi.fn(async () => {
        throw new Error("connection refused");
      }),
    } as never);
    const res = makeRes();
    await healthHandler({} as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ ok: true, database: "unavailable" });
  });
});
