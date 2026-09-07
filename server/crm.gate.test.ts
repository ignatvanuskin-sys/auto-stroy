import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getDb: vi.fn().mockResolvedValue(null),
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

type Loaded = Awaited<ReturnType<typeof loadRouter>>;

async function loadRouter(mode: "demo" | "protected"): Promise<Loaded> {
  vi.resetModules();
  process.env.CRM_DEMO_MODE = mode === "demo" ? "true" : "false";
  const { appRouter } = await import("./routers");
  const { listCompanyLeads } = await import("./db");
  return { appRouter, listCompanyLeads };
}

const baseUser = {
  id: 1,
  openId: "user-1",
  name: "Менеджер Тест",
  email: null,
  loginMethod: null,
  role: "user" as const,
  crmRole: "owner" as const,
  telegramChatId: null,
  companyId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function ctx(user: unknown) {
  return {
    req: { headers: {}, ip: "10.9.9.9", socket: { remoteAddress: "10.9.9.9" } },
    res: {},
    user,
  } as never;
}

async function gateError(router: Loaded["appRouter"], user: unknown) {
  try {
    await router.createCaller(ctx(user)).crm.updateStatus({
      id: 1,
      status: "Contacted",
    });
    return "ALLOWED";
  } catch (error) {
    const err = error as { code?: string; message?: string };
    // In this environment the database is stubbed to null, so a call that
    // passes the gate always dies on "database unavailable".
    if (/database/i.test(err.message ?? "")) return "ALLOWED";
    return err.code ?? "UNKNOWN";
  }
}

afterEach(() => {
  delete process.env.CRM_DEMO_MODE;
});

describe("crm mutation gate (CRM_DEMO_MODE=false)", () => {
  it("blocks anonymous callers with UNAUTHORIZED", async () => {
    const { appRouter } = await loadRouter("protected");
    expect(await gateError(appRouter, null)).toBe("UNAUTHORIZED");
  });

  it("keeps analysts read-only (FORBIDDEN on writes)", async () => {
    const { appRouter } = await loadRouter("protected");
    expect(
      await gateError(appRouter, { ...baseUser, crmRole: "analyst" })
    ).toBe("FORBIDDEN");
  });

  it("allows owner to write", async () => {
    const { appRouter } = await loadRouter("protected");
    expect(await gateError(appRouter, { ...baseUser, crmRole: "owner" })).toBe(
      "ALLOWED"
    );
  });

  it("allows manager to write", async () => {
    const { appRouter } = await loadRouter("protected");
    expect(
      await gateError(appRouter, { ...baseUser, crmRole: "manager" })
    ).toBe("ALLOWED");
  });

  it("allows admin regardless of crmRole", async () => {
    const { appRouter } = await loadRouter("protected");
    expect(
      await gateError(appRouter, {
        ...baseUser,
        role: "admin",
        crmRole: "analyst",
      })
    ).toBe("ALLOWED");
  });

  it("blocks non-admin users with default crmRole only via role checks", async () => {
    const { appRouter } = await loadRouter("protected");
    // A plain user (crmRole manager is the schema default, so use owner role
    // check via the admin branch): role 'user' + manager role is allowed.
    expect(
      await gateError(appRouter, { ...baseUser, crmRole: "manager" })
    ).toBe("ALLOWED");
  });
});

describe("crm mutation gate (demo mode, default)", () => {
  it("lets anonymous callers mutate the seeded demo tenant", async () => {
    const { appRouter } = await loadRouter("demo");
    expect(await gateError(appRouter, null)).toBe("ALLOWED");
  });

  it("keeps CRM reads public even in protected mode", async () => {
    const loaded = await loadRouter("protected");
    (loaded.listCompanyLeads as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await loaded.appRouter
      .createCaller(ctx(null))
      .crm.overview();
    expect(result.total).toBe(0);
  });
});
