import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { estimates, followups, leadActivities, leads, notifications, proposals, rateTables, tasks } from "../drizzle/schema";
import { buildProposalPdf } from "./buildscope/proposal";
import { estimateProject, formatEstimateRange, scoreLead, type FinishTier } from "./buildscope/business";
import { qualifyLead } from "./buildscope/qualification";
import { activeRate, findCompanyLead, getDb, getDemoCompanyId, getLatestEstimate, listCompanyLeads, listCompanyNotifications, listCompanyRates, listCompanyTasks } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const tierSchema = z.enum(["economy", "standard", "premium"]);
const calculatorSchema = z.object({
  areaM2: z.number().int().min(50).max(600),
  floors: z.number().int().min(1).max(3),
  region: z.string().min(2).max(80),
  projectType: z.string().min(2).max(64),
  material: z.string().min(2).max(80),
  finishTier: tierSchema,
  foundation: z.string().max(80).optional().nullable(),
  engineering: z.array(z.string()).max(6).optional(),
  hasLand: z.boolean(),
});

const leadSchema = calculatorSchema.extend({
  name: z.string().min(2).max(120),
  phone: z.string().regex(/^[+\d][\d\s()\-]{8,}$/),
  preferredChannel: z.enum(["Звонок", "WhatsApp", "Telegram"]),
  budgetRange: z.string().max(80).optional().nullable(),
  desiredStart: z.string().max(80).optional().nullable(),
  rawNotes: z.string().max(2000).optional().nullable(),
  consent: z.literal(true),
  honeypot: z.string().max(0).optional(),
});

const statusSchema = z.enum(["New", "Qualified", "Contacted", "Site Visit", "Estimate Sent", "Proposal Sent", "Negotiation", "Won", "Lost"]);

async function resolveEstimate(companyId: number, input: z.infer<typeof calculatorSchema>) {
  const currentRate = await activeRate(companyId, input.region, input.material, input.finishTier);
  return estimateProject({ ...input, baseRatePerM2: currentRate?.baseRatePerM2 });
}

function followupSchedule(start: Date) {
  return [1, 3, 7].map(day => {
    const date = new Date(start);
    date.setDate(date.getDate() + day);
    return date;
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  calculator: router({
    preview: publicProcedure.input(calculatorSchema).query(async ({ input }) => {
      const companyId = await getDemoCompanyId();
      const estimate = await resolveEstimate(companyId, input);
      return { ...estimate, formattedRange: formatEstimateRange(estimate) };
    }),
    submitLead: publicProcedure.input(leadSchema).mutation(async ({ input }) => {
      if (input.honeypot) throw new Error("Request rejected");
      const db = await getDb();
      if (!db) throw new Error("CRM database is temporarily unavailable");
      const companyId = await getDemoCompanyId();
      const estimate = await resolveEstimate(companyId, input);
      const ai = await qualifyLead(input);
      const scoring = scoreLead({
        estimate,
        budgetRange: input.budgetRange,
        hasLand: input.hasLand,
        desiredStart: input.desiredStart,
        name: input.name,
        phone: input.phone,
        areaM2: input.areaM2,
        region: input.region,
        finishTier: input.finishTier,
        source: "Website",
        intent: ai.intentType,
        confidence: ai.confidence,
      });
      const [created] = await db.insert(leads).values({
        companyId,
        source: "Website",
        name: input.name,
        phone: input.phone,
        preferredChannel: input.preferredChannel,
        region: input.region,
        projectType: input.projectType,
        areaM2: input.areaM2,
        floors: input.floors,
        material: input.material,
        finishTier: input.finishTier,
        foundation: input.foundation ?? "Не знаю",
        engineering: input.engineering ?? [],
        budgetRange: input.budgetRange ?? null,
        hasLand: input.hasLand,
        desiredStart: input.desiredStart ?? null,
        rawNotes: input.rawNotes ?? null,
        aiSummary: ai.summary,
        aiIntent: ai.intentType,
        aiConfidence: ai.confidence,
        missingFields: ai.missingFields,
        needsManualReview: ai.needsManualReview || scoring.budgetMismatch,
        score: scoring.score,
        scoreBand: scoring.band,
        status: scoring.score >= 61 ? "Qualified" : "New",
      });
      const leadId = created.insertId;
      const [savedEstimate] = await db.insert(estimates).values({
        companyId,
        leadId,
        rateTableVersion: 1,
        inputSnapshot: input,
        lowAmount: estimate.lowAmount,
        highAmount: estimate.highAmount,
      });
      await db.insert(leadActivities).values([
        { companyId, leadId, actorType: "system", type: "lead_created", payload: { source: "Website", calculation: formatEstimateRange(estimate) } },
        { companyId, leadId, actorType: "ai", type: "qualification_completed", payload: { intent: ai.intentType, confidence: ai.confidence, source: ai.source } },
        { companyId, leadId, actorType: "system", type: "score_calculated", payload: { score: scoring.score, reasons: scoring.reasons } },
      ]);
      if (scoring.score >= 61) {
        await db.insert(notifications).values({
          companyId,
          channel: "Telegram",
          status: "queued",
          payload: {
            title: `${scoring.band === "very_hot" ? "VERY HOT" : "HOT"} LEAD (${scoring.score}/100)`,
            leadId,
            text: `${input.projectType} ${input.areaM2} м², ${input.region}. ${formatEstimateRange(estimate)}. ${ai.summary}`,
          },
        });
      }
      return {
        leadId,
        estimate: { ...estimate, formattedRange: formatEstimateRange(estimate) },
        score: scoring,
        aiSummary: ai.summary,
        needsManualReview: ai.needsManualReview || scoring.budgetMismatch,
        notificationQueued: scoring.score >= 61,
        estimateId: savedEstimate.insertId,
      };
    }),
  }),

  crm: router({
    overview: publicProcedure.query(async () => {
      const companyId = await getDemoCompanyId();
      const list = await listCompanyLeads(companyId);
      const active = list.filter(lead => !["Won", "Lost"].includes(lead.status));
      const totalPipeline = active.reduce((sum, lead) => sum + (lead.score > 0 ? lead.score * 515_000 : 0), 0);
      const byStatus = ["New", "Qualified", "Contacted", "Site Visit", "Estimate Sent", "Proposal Sent", "Negotiation", "Won", "Lost"].map(status => ({ status, count: list.filter(lead => lead.status === status).length }));
      const bySource = ["Website", "Referral", "Instagram", "Manual", "Telegram"].map(source => ({ source, count: list.filter(lead => lead.source === source).length }));
      const hotCount = list.filter(lead => lead.score >= 61).length;
      return { total: list.length, hotCount, totalPipeline, byStatus, bySource, responseTime: "18 мин", proposalCount: list.filter(lead => ["Proposal Sent", "Negotiation", "Won"].includes(lead.status)).length, wonCount: list.filter(lead => lead.status === "Won").length };
    }),
    listLeads: publicProcedure.input(z.object({ status: statusSchema.optional(), scoreBand: z.enum(["cold", "warm", "hot", "very_hot"]).optional() }).optional()).query(async ({ input }) => {
      const companyId = await getDemoCompanyId();
      let list = await listCompanyLeads(companyId);
      if (input?.status) list = list.filter(lead => lead.status === input.status);
      if (input?.scoreBand) list = list.filter(lead => lead.scoreBand === input.scoreBand);
      return list;
    }),
    getLead: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("CRM database is temporarily unavailable");
      const companyId = await getDemoCompanyId();
      const lead = await findCompanyLead(companyId, input.id);
      if (!lead) throw new Error("Lead not found");
      const [activity, estimateList, taskList, followupList, proposalList] = await Promise.all([
        db.select().from(leadActivities).where(and(eq(leadActivities.companyId, companyId), eq(leadActivities.leadId, lead.id))).orderBy(desc(leadActivities.createdAt)),
        db.select().from(estimates).where(and(eq(estimates.companyId, companyId), eq(estimates.leadId, lead.id))).orderBy(desc(estimates.createdAt)),
        db.select().from(tasks).where(and(eq(tasks.companyId, companyId), eq(tasks.leadId, lead.id))).orderBy(desc(tasks.createdAt)),
        db.select().from(followups).where(and(eq(followups.companyId, companyId), eq(followups.leadId, lead.id))).orderBy(desc(followups.scheduledAt)),
        db.select().from(proposals).where(and(eq(proposals.companyId, companyId), eq(proposals.leadId, lead.id))).orderBy(desc(proposals.createdAt)),
      ]);
      return { lead, activities: activity, estimates: estimateList, tasks: taskList, followups: followupList, proposals: proposalList };
    }),
    updateStatus: publicProcedure.input(z.object({ id: z.number().int().positive(), status: statusSchema })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("CRM database is temporarily unavailable");
      const companyId = await getDemoCompanyId();
      const lead = await findCompanyLead(companyId, input.id);
      if (!lead) throw new Error("Lead not found");
      await db.update(leads).set({ status: input.status }).where(and(eq(leads.id, input.id), eq(leads.companyId, companyId)));
      await db.insert(leadActivities).values({ companyId, leadId: input.id, actorType: "manager", type: "status_changed", payload: { from: lead.status, to: input.status } });
      return { success: true };
    }),
    createTask: publicProcedure.input(z.object({ leadId: z.number().int().positive(), title: z.string().min(3).max(240), dueAt: z.date().optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("CRM database is temporarily unavailable");
      const companyId = await getDemoCompanyId();
      const lead = await findCompanyLead(companyId, input.leadId);
      if (!lead) throw new Error("Lead not found");
      await db.insert(tasks).values({ companyId, leadId: input.leadId, title: input.title, dueAt: input.dueAt ?? null });
      await db.insert(leadActivities).values({ companyId, leadId: input.leadId, actorType: "manager", type: "task_created", payload: { title: input.title } });
      return { success: true };
    }),
    listTasks: publicProcedure.query(async () => listCompanyTasks(await getDemoCompanyId())),
    generateProposal: publicProcedure.input(z.object({ leadId: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("CRM database is temporarily unavailable");
      const companyId = await getDemoCompanyId();
      const lead = await findCompanyLead(companyId, input.leadId);
      if (!lead) throw new Error("Lead not found");
      const latest = await getLatestEstimate(companyId, lead.id);
      if (!latest) throw new Error("Estimate not found");
      const estimate = { lowAmount: latest.lowAmount, highAmount: latest.highAmount, baseRatePerM2: 0, factors: [] };
      const proposalNumber = `BS-${lead.id.toString().padStart(4, "0")}-${new Date().getFullYear()}`;
      const pdfBase64 = buildProposalPdf({ proposalNumber, clientName: lead.name, projectType: lead.projectType, areaM2: lead.areaM2, region: lead.region, material: lead.material, finishTier: lead.finishTier, desiredStart: lead.desiredStart, estimate });
      await db.insert(proposals).values({ companyId, leadId: lead.id, estimateId: latest.id, status: "draft" });
      await db.insert(leadActivities).values({ companyId, leadId: lead.id, actorType: "system", type: "proposal_generated", payload: { proposalNumber } });
      await db.insert(followups).values(followupSchedule(new Date()).map((scheduledAt, index) => ({ companyId, leadId: lead.id, type: `day_${[1, 3, 7][index]}`, scheduledAt, status: "pending" as const, channel: lead.preferredChannel, messageText: ["Удобно ли обсудить детали проекта?", "Готовы уточнить вопросы по комплектации?", "Оставим расчёт актуальным — написать вам позже?"][index] })));
      return { proposalNumber, pdfBase64, preview: { title: "Предварительное коммерческое предложение", range: formatEstimateRange(estimate), disclaimer: "Это предварительная оценка. Точный расчёт менеджер подготовит после уточнения деталей проекта." } };
    }),
    notifications: publicProcedure.query(async () => listCompanyNotifications(await getDemoCompanyId())),
    rates: publicProcedure.query(async () => listCompanyRates(await getDemoCompanyId())),
    updateRate: publicProcedure.input(z.object({ id: z.number().int().positive(), baseRatePerM2: z.number().int().min(100000).max(800000) })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("CRM database is temporarily unavailable");
      const companyId = await getDemoCompanyId();
      const rows = await listCompanyRates(companyId);
      const current = rows.find(row => row.id === input.id);
      if (!current) throw new Error("Rate row not found");
      const nextVersion = Math.max(...rows.map(row => row.version), 0) + 1;
      await db.insert(rateTables).values({ companyId, version: nextVersion, region: current.region, material: current.material, finishTier: current.finishTier, baseRatePerM2: input.baseRatePerM2 });
      return { success: true, version: nextVersion };
    }),
  }),
});

export type AppRouter = typeof appRouter;
