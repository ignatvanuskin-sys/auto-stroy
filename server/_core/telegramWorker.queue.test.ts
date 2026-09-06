import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "../db";
const mockedGetDb = vi.mocked(getDb);

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// ENV is captured at module load, so credentials must be set before importing.
process.env.TELEGRAM_BOT_TOKEN = "test-token";
process.env.TELEGRAM_CHAT_ID = "100200300";

let worker: typeof import("./telegramWorker");

beforeAll(async () => {
  worker = await import("./telegramWorker");
});

type QueuedRow = { id: number; payload: unknown };

function makeDb(queuedRows: QueuedRow[]) {
  const statuses: string[] = [];
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(queuedRows),
        }),
      }),
    }),
    update: () => ({
      set: (set: { status: string }) => ({
        where: () => {
          statuses.push(set.status);
          return Promise.resolve([]);
        },
      }),
    }),
  };
  return { db, statuses };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("extractOutboxText", () => {
  it("extracts title and text from a valid payload", () => {
    expect(
      worker.extractOutboxText({
        title: "HOT LEAD (92/100)",
        text: "Дом 180 м²",
        leadId: 1,
      })
    ).toEqual({
      title: "HOT LEAD (92/100)",
      text: "Дом 180 м²",
    });
  });

  it("returns null for missing/empty text and non-object payloads", () => {
    expect(worker.extractOutboxText({ title: "x" })).toBeNull();
    expect(worker.extractOutboxText(null)).toBeNull();
    expect(worker.extractOutboxText("plain string")).toBeNull();
  });

  it("tolerates a missing title", () => {
    expect(worker.extractOutboxText({ text: "hello" })).toEqual({
      title: "",
      text: "hello",
    });
  });
});

describe("processQueue", () => {
  it("does nothing when the database is unavailable", async () => {
    mockedGetDb.mockResolvedValue(null);
    await worker.processQueue();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a queued message to Telegram and marks it sent", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const { db, statuses } = makeDb([
      { id: 11, payload: { title: "HOT LEAD", text: "Дом 180 м²" } },
    ]);
    mockedGetDb.mockResolvedValue(db as never);

    await worker.processQueue();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("api.telegram.org/bottest-token/sendMessage");
    expect(init.body as string).toContain("100200300");
    expect(init.body as string).toContain("HOT LEAD");
    expect(statuses).toEqual(["sent"]);
  });

  it("marks invalid payloads as failed without calling Telegram", async () => {
    const { db, statuses } = makeDb([
      { id: 12, payload: { title: "no text" } },
    ]);
    mockedGetDb.mockResolvedValue(db as never);

    await worker.processQueue();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(statuses).toEqual(["failed"]);
  });

  it("keeps a message queued on a transient 500 response", async () => {
    fetchMock.mockResolvedValue(new Response("boom", { status: 500 }));
    const { db, statuses } = makeDb([
      { id: 13, payload: { text: "transient" } },
    ]);
    mockedGetDb.mockResolvedValue(db as never);

    await worker.processQueue();

    expect(statuses).toEqual([]); // stays queued for the next tick
  });

  it("marks a message failed on a permanent 4xx response", async () => {
    fetchMock.mockResolvedValue(new Response("bad chat", { status: 400 }));
    const { db, statuses } = makeDb([{ id: 14, payload: { text: "broken" } }]);
    mockedGetDb.mockResolvedValue(db as never);

    await worker.processQueue();

    expect(statuses).toEqual(["failed"]);
  });
});
