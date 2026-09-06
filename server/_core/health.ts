import type { Request, Response } from "express";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Liveness/readiness probe for platform health checks.
 * Returns 200 when the process is up; reports database connectivity in the
 * payload without failing on it, so a transient DB outage does not cause the
 * platform to restart an otherwise healthy instance.
 */
export async function healthHandler(_req: Request, res: Response) {
  let database = "unavailable";
  try {
    const db = await getDb();
    if (db) {
      await db.execute(sql`SELECT 1`);
      database = "ok";
    }
  } catch {
    database = "unavailable";
  }
  res.status(200).json({ ok: true, database, uptime: process.uptime() });
}
