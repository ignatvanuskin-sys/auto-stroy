import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  companies,
  estimates,
  InsertUser,
  leads,
  notifications,
  rateTables,
  tasks,
  users,
} from "../drizzle/schema";
import { DEMO_COMPANY_SLUG } from "./buildscope/business";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = {
    openId: user.openId,
    lastSignedIn: user.lastSignedIn ?? new Date(),
  };
  const updateSet: Record<string, unknown> = {
    lastSignedIn: values.lastSignedIn,
  };
  (["name", "email", "loginMethod", "companyId", "crmRole"] as const).forEach(
    field => {
      if (user[field] !== undefined) {
        values[field] = user[field] as never;
        updateSet[field] = user[field];
      }
    }
  );
  values.role =
    user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (
    await db.select().from(users).where(eq(users.openId, openId)).limit(1)
  )[0];
}

export async function getDemoCompanyId() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const company = (
    await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.slug, DEMO_COMPANY_SLUG))
      .limit(1)
  )[0];
  if (!company) throw new Error("Demo company is not seeded. Run pnpm seed.");
  return company.id;
}

/** All CRM readers take a server-resolved company ID; callers never choose a tenant. */
export async function listCompanyLeads(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(leads)
    .where(eq(leads.companyId, companyId))
    .orderBy(desc(leads.createdAt));
}

export async function findCompanyLead(companyId: number, leadId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (
    await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.companyId, companyId)))
      .limit(1)
  )[0];
}

export async function getLatestEstimate(companyId: number, leadId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (
    await db
      .select()
      .from(estimates)
      .where(
        and(eq(estimates.leadId, leadId), eq(estimates.companyId, companyId))
      )
      .orderBy(desc(estimates.createdAt))
      .limit(1)
  )[0];
}

export async function listCompanyRates(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(rateTables)
    .where(eq(rateTables.companyId, companyId))
    .orderBy(desc(rateTables.version));
}

export async function activeRate(
  companyId: number,
  region: string,
  material: string,
  finishTier: "economy" | "standard" | "premium"
) {
  const db = await getDb();
  if (!db) return undefined;
  return (
    await db
      .select()
      .from(rateTables)
      .where(
        and(
          eq(rateTables.companyId, companyId),
          eq(rateTables.region, region),
          eq(rateTables.material, material),
          eq(rateTables.finishTier, finishTier)
        )
      )
      .orderBy(desc(rateTables.version))
      .limit(1)
  )[0];
}

export async function listCompanyTasks(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.companyId, companyId))
    .orderBy(desc(tasks.createdAt));
}

export async function listCompanyNotifications(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.companyId, companyId))
    .orderBy(desc(notifications.createdAt))
    .limit(8);
}
