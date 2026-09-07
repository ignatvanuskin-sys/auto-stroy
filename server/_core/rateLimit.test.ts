import { describe, expect, it } from "vitest";
import { rateLimitCheck } from "./rateLimit";
import type { Request } from "express";

function fakeReq(ip: string): Request {
  return {
    headers: {},
    ip,
    socket: { remoteAddress: ip },
  } as unknown as Request;
}

describe("rateLimitCheck", () => {
  it("allows requests under the limit and blocks beyond it", () => {
    const options = { windowMs: 60_000, max: 3, keyPrefix: "test-a" };
    const req = fakeReq("10.0.0.1");
    expect(rateLimitCheck({ ...options, req })).toBe("ok");
    expect(rateLimitCheck({ ...options, req })).toBe("ok");
    expect(rateLimitCheck({ ...options, req })).toBe("ok");
    expect(rateLimitCheck({ ...options, req })).toBe("limited");
    expect(rateLimitCheck({ ...options, req })).toBe("limited");
  });

  it("tracks clients independently", () => {
    const options = { windowMs: 60_000, max: 1, keyPrefix: "test-b" };
    expect(rateLimitCheck({ ...options, req: fakeReq("10.0.0.2") })).toBe("ok");
    expect(rateLimitCheck({ ...options, req: fakeReq("10.0.0.3") })).toBe("ok");
    expect(rateLimitCheck({ ...options, req: fakeReq("10.0.0.2") })).toBe(
      "limited"
    );
  });

  it("prefers x-forwarded-for header over socket address", () => {
    const options = { windowMs: 60_000, max: 1, keyPrefix: "test-c" };
    const req = {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.9" },
      ip: "10.0.0.9",
      socket: { remoteAddress: "10.0.0.9" },
    } as unknown as Request;
    expect(rateLimitCheck({ ...options, req })).toBe("ok");
    expect(rateLimitCheck({ ...options, req })).toBe("limited");
  });
});
