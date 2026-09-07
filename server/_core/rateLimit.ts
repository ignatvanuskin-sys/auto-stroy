import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

/**
 * Minimal in-memory fixed-window rate limiter (no external dependency).
 * Suitable for a single-instance deployment; for multi-replica setups replace
 * with a shared store (e.g. Redis).
 */
export function rateLimit(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${options.keyPrefix}:${clientIp(req)}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > options.max) {
      res
        .status(429)
        .json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}

/** Periodic cleanup so stale buckets do not grow unbounded. */
export function startRateLimitSweeper(windowMs: number) {
  const timer = setInterval(() => {
    const now = Date.now();
    buckets.forEach((bucket, key) => {
      if (bucket.resetAt <= now) buckets.delete(key);
    });
  }, windowMs);
  timer.unref();
}

/** Same fixed-window check, usable inside tRPC middleware. */
export function rateLimitCheck(options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
  req: Request;
}): "ok" | "limited" {
  const key = `${options.keyPrefix}:${clientIp(options.req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return "ok";
  }
  bucket.count += 1;
  return bucket.count > options.max ? "limited" : "ok";
}
