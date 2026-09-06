import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as dbModule from "./db";
import * as schema from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getDb: vi.fn(),
    getDemoCompanyId: vi.fn(),
    listCompanyLeads: vi.fn(),
    listCompanyRates: vi.fn(),
    listCompanyTasks: vi.fn(),
    listCompanyNotifications: vi.fn(),
    findCompanyLead: vi.fn(),
    getLatestEstimate: vi.fn(),
    activeRate: vi.fn(),
  };
});

vi.mock("./buildscope/qualification", () => ({
  qualifyLead: vi.fn().mockResolvedValue({
    intentType: "genuine_buyer",
    urgency: "medium",
    budgetConsistency: "consistent",
    missingFields: [],
    summary: "Клиент рассматривает дом 180 м² в Алматы.",
    confidence: 90,
    needsManualReview: false,
    source: "rule",
  }),
}));

const mockedDb = vi.mocked(dbModule);

const COMPANY_ID = 7;
const COMPANY_LEAD = {
  id: 42,
  companyId: COMPANY_ID,
  source: "Website",
  name: "Тест Клиент",
  phone: "+7 700 111 22 33",
  preferredChannel: "Telegram",
  region: "Алматы",
  projectType: "Дом",
  areaM2: 180,
  floors: 2,
  material: "Кирпич",
  finishTier: "standard" as const,
  foundation: "Плитный",
  engineering: [],
  budgetRange: "35–40 млн ₸",
  hasLand: true,
  desiredStart: "3–6 мес",
  rawNotes: null,
  aiSummary: "резюме",
  aiIntent: "genuine_buyer" as const,
  aiConfidence: 90,
  missingFields: [],
  needsManualReview: false,
  score: 75,
  scoreBand: "hot" as const,
  status: "Contacted" as const,
  assignedManagerId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function fakeDb() {
  const insertCalls: { table: unknown; values: unknown }[] = [];
  const updateCalls: { table: unknown; set: unknown }[] = [];
  const db = {
    insert: (table: unknown) => ({
      values: (values: unknown) => {
        insertCalls.push({ table, values });
        if (table === schema.leads) {
          return Promise.resolve([{ insertId: 42 }]);
        }
        return Promise.resolve([{ insertId: 900 + insertCalls.length }]);
      },
    }),
    update: (table: unknown) => ({
      set: (set: unknown) => {
        updateCalls.push({ table, set });
        return { where: () => Promise.resolve([]) };
      },
    }),
    select: () => {
      throw new Error("select not expected in this test");
    },
  };
  return { db, insertCalls, updateCalls };
}

function makeCtx(user: TrpcContext["user"]) {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] =
    [];
  const ctx = {
    req: {
      headers: {},
      ip: "10.1.1.1",
      socket: { remoteAddress: "10.1.1.1" },
      protocol: "https",
    },
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    },
    user,
  };
  return { ctx: ctx as unknown as TrpcContext, clearedCookies };
}

const validLeadInput = {
  areaM2: 180,
  floors: 2,
  region: "Алматы",
  projectType: "Дом",
  material: "Кирпич",
  finishTier: "standard" as const,
  foundation: "Плитный",
  engineering: ["Отопление"],
  hasLand: true,
  name: "Приёмочный Клиент",
  phone: "+7 700 111 22 33",
  preferredChannel: "Telegram" as const,
  budgetRange: "35–40 млн ₸",
  desiredStart: "3–6 мес",
  rawNotes: null,
  consent: true as const,
  honeypot: "",
};

const stubbedValues = () => {
  mockedDb.getDemoCompanyId.mockResolvedValue(COMPANY_ID);
  mockedDb.activeRate.mockResolvedValue({
    id: 1,
    companyId: COMPANY_ID,
    version: 1,
    region: "Алматы",
    material: "Кирпич",
    finishTier: "standard" as const,
    baseRatePerM2: 290_000,
    effectiveFrom: new Date(),
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("calculator.preview (validation contract)", () => {
  it("rejects out-of-range area before touching the database", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.calculator.preview({ ...validLeadInput, areaM2: 5000 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.getDemoCompanyId).not.toHaveBeenCalled();
  });

  it("rejects an unknown finish tier", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.calculator.preview({
        ...validLeadInput,
        finishTier: "luxury" as never,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns a formatted deterministic range", async () => {
    stubbedValues();
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.calculator.preview(validLeadInput);
    expect(result.formattedRange).toMatch(/млн ₸/);
    expect(result.lowAmount).toBeLessThan(result.highAmount);
  });
});

describe("calculator.submitLead", () => {
  it("rejects missing consent", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.calculator.submitLead({
        ...validLeadInput,
        consent: false as never,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a malformed phone", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.calculator.submitLead({ ...validLeadInput, phone: "not-a-phone" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects a filled honeypot at the validation layer", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    // zod schema caps honeypot at 0 chars, so a filled honeypot is a BAD_REQUEST
    // before any business logic (and any LLM call) runs.
    await expect(
      caller.calculator.submitLead({ ...validLeadInput, honeypot: "spam" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedDb.getDb).not.toHaveBeenCalled();
  });

  it("reports a clear error when the database is unavailable", async () => {
    mockedDb.getDb.mockResolvedValue(null);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.calculator.submitLead(validLeadInput)
    ).rejects.toThrowError(/temporarily unavailable/i);
  });

  it("persists lead, estimate, activities and a hot-lead notification", async () => {
    stubbedValues();
    const { db, insertCalls } = fakeDb();
    mockedDb.getDb.mockResolvedValue(db as never);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calculator.submitLead(validLeadInput);

    expect(result.leadId).toBe(42);
    expect(result.score.band).toBe("hot");
    expect(result.score.score).toBeGreaterThanOrEqual(61);
    expect(result.notificationQueued).toBe(true);

    const tables = insertCalls.map(call => call.table);
    expect(tables).toHaveLength(4); // lead, estimate, activities, notification

    const activityPayload = insertCalls[2]!.values as unknown[];
    expect(activityPayload).toHaveLength(3); // created, qualification, score

    const notification = insertCalls[3]!.values as {
      status: string;
      channel: string;
      payload: { title: string; text: string };
    };
    expect(notification.status).toBe("queued");
    expect(notification.channel).toBe("Telegram");
    expect(notification.payload.title).toContain("HOT LEAD");
    expect(notification.payload.title).toContain("(75/100)");
    // Brand signature required by the case-study pack.
    expect(notification.payload.text).toContain(
      "— BuildScope AI для ARQA HOUSE"
    );
  });

  it("does not queue a notification for a cold lead", async () => {
    stubbedValues();
    const { db, insertCalls } = fakeDb();
    mockedDb.getDb.mockResolvedValue(db as never);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calculator.submitLead({
      ...validLeadInput,
      budgetRange: null,
      hasLand: false,
      desiredStart: "Изучаю рынок",
      phone: "+7 700 111 22 33",
    });

    expect(result.notificationQueued).toBe(false);
    expect(insertCalls).toHaveLength(3); // lead, estimate, activities only
  });
});

describe("crm.updateStatus", () => {
  it("rejects an unknown status value", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.updateStatus({ id: 42, status: "Deleted" as never })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("updates only within the resolved tenant and logs the transition", async () => {
    mockedDb.getDemoCompanyId.mockResolvedValue(COMPANY_ID);
    mockedDb.findCompanyLead.mockResolvedValue(COMPANY_LEAD);
    const { db, updateCalls, insertCalls } = fakeDb();
    mockedDb.getDb.mockResolvedValue(db as never);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crm.updateStatus({ id: 42, status: "Won" });

    expect(result).toEqual({ success: true });
    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0]!.set).toMatchObject({ status: "Won" });
    const activity = insertCalls[0]!.values as {
      type: string;
      payload: { from: string; to: string };
    };
    expect(activity.type).toBe("status_changed");
    expect(activity.payload).toMatchObject({ from: "Contacted", to: "Won" });
  });

  it("fails with a clear error when the lead is missing", async () => {
    mockedDb.getDemoCompanyId.mockResolvedValue(COMPANY_ID);
    mockedDb.findCompanyLead.mockResolvedValue(undefined);
    const { db } = fakeDb();
    mockedDb.getDb.mockResolvedValue(db as never);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.updateStatus({ id: 999, status: "Won" })
    ).rejects.toThrowError(/Lead not found/i);
  });
});

describe("crm.createTask", () => {
  it("rejects a too-short title", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.createTask({ leadId: 42, title: "ок" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("persists the task and the timeline entry", async () => {
    mockedDb.getDemoCompanyId.mockResolvedValue(COMPANY_ID);
    mockedDb.findCompanyLead.mockResolvedValue(COMPANY_LEAD);
    const { db, insertCalls } = fakeDb();
    mockedDb.getDb.mockResolvedValue(db as never);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crm.createTask({
      leadId: 42,
      title: "Позвонить клиенту после обеда",
      dueAt: new Date("2026-09-10T12:00:00Z"),
    });

    expect(result).toEqual({ success: true });
    expect(insertCalls).toHaveLength(2);
    expect((insertCalls[0]!.values as { title: string }).title).toBe(
      "Позвонить клиенту после обеда"
    );
    expect((insertCalls[1]!.values as { type: string }).type).toBe(
      "task_created"
    );
  });
});

describe("crm.updateRate", () => {
  const rateRow = {
    id: 5,
    companyId: COMPANY_ID,
    version: 3,
    region: "Алматы",
    material: "Кирпич",
    finishTier: "standard" as const,
    baseRatePerM2: 290_000,
    effectiveFrom: new Date(),
  };

  it("rejects rates outside the business bounds", async () => {
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.crm.updateRate({ id: 5, baseRatePerM2: 1000 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("creates the next version on success", async () => {
    mockedDb.getDemoCompanyId.mockResolvedValue(COMPANY_ID);
    mockedDb.listCompanyRates.mockResolvedValue([rateRow]);
    const { db, insertCalls } = fakeDb();
    mockedDb.getDb.mockResolvedValue(db as never);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crm.updateRate({
      id: 5,
      baseRatePerM2: 310_000,
    });

    expect(result).toEqual({ success: true, version: 4 });
    expect(insertCalls[0]!.values).toMatchObject({
      companyId: COMPANY_ID,
      version: 4,
      baseRatePerM2: 310_000,
    });
  });

  it("maps a version race to CONFLICT", async () => {
    mockedDb.getDemoCompanyId.mockResolvedValue(COMPANY_ID);
    mockedDb.listCompanyRates.mockResolvedValue([rateRow]);
    const conflictDb = {
      insert: () => ({
        values: () =>
          Promise.reject(
            Object.assign(new Error("Duplicate entry"), {
              code: "ER_DUP_ENTRY",
            })
          ),
      }),
      update: () => ({ set: () => ({ where: () => Promise.resolve([]) }) }),
      select: () => {
        throw new Error("not expected");
      },
    };
    mockedDb.getDb.mockResolvedValue(conflictDb as never);
    const { ctx } = makeCtx(null);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.crm.updateRate({ id: 5, baseRatePerM2: 310_000 })
    ).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const { ctx, clearedCookies } = makeCtx(COMPANY_LEAD as never);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies[0]!.name).toBe("app_session_id");
    expect(clearedCookies[0]!.options).toMatchObject({ maxAge: -1 });
  });
});

describe("auth.me", () => {
  it("returns null for anonymous users and the user object when signed in", async () => {
    const anonymous = makeCtx(null);
    expect(await appRouter.createCaller(anonymous.ctx).auth.me()).toBeNull();

    const signedIn = makeCtx(COMPANY_LEAD as never);
    const me = await appRouter.createCaller(signedIn.ctx).auth.me();
    expect(me).toMatchObject({ id: 42, name: "Тест Клиент" });
  });
});
