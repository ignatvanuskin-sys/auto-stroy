import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { rateLimitCheck } from "./rateLimit";
import { ENV } from "./env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    // Never leak internal details (stack traces, DB errors, seed instructions)
    // to clients in production; everything is still logged server-side.
    const isInternal = error.code === "INTERNAL_SERVER_ERROR";
    if (ENV.isProduction && isInternal) {
      return {
        ...shape,
        message: "Внутренняя ошибка сервера. Мы уже разбираемся.",
        data: { ...shape.data, stack: undefined },
      };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Public lead-capture writes to the DB and may trigger an LLM call; cap it per
// IP to blunt spam and cost abuse. The limiter is in-memory (single instance).
const leadRateLimit = t.procedure.use(opts => {
  const verdict = rateLimitCheck({
    windowMs: 10 * 60_000,
    max: 30,
    keyPrefix: "lead",
    req: opts.ctx.req,
  });
  if (verdict === "ok") return opts.next();
  throw new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: "Слишком много заявок с одного адреса. Попробуйте позже.",
  });
});

// Shared write-abuse limiter for CRM mutations (per IP, per minute).
const crmWriteRateLimit = t.middleware(opts => {
  const verdict = rateLimitCheck({
    windowMs: 60_000,
    max: 60,
    keyPrefix: "crm-write",
    req: opts.ctx.req,
  });
  if (verdict === "ok") return opts.next();
  throw new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: "Слишком много операций. Попробуйте через минуту.",
  });
});

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

/**
 * CRM mutations: public in demo mode (showcase), authenticated owner/manager
 * writes once CRM_DEMO_MODE=false. Analysts stay read-only by design.
 */
const requireCrmWriter = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (ENV.crmDemoMode) {
    return next({ ctx: { ...ctx, user: ctx.user } });
  }

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  const allowed =
    ctx.user.role === "admin" ||
    ctx.user.crmRole === "owner" ||
    ctx.user.crmRole === "manager";
  if (!allowed) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const crmMutationProcedure = t.procedure
  .use(crmWriteRateLimit)
  .use(requireCrmWriter);

export { leadRateLimit };

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);
