import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const leadStatusValues = [
  "New",
  "Qualified",
  "Contacted",
  "Site Visit",
  "Estimate Sent",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
] as const;
export const scoreBandValues = ["cold", "warm", "hot", "very_hot"] as const;

export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  brandingConfig: json("brandingConfig"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => companies.id),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  crmRole: mysqlEnum("crmRole", ["owner", "manager", "analyst"])
    .default("manager")
    .notNull(),
  telegramChatId: varchar("telegramChatId", { length: 96 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const rateTables = mysqlTable(
  "rateTables",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId")
      .notNull()
      .references(() => companies.id),
    version: int("version").notNull(),
    region: varchar("region", { length: 80 }).notNull(),
    material: varchar("material", { length: 80 }).notNull(),
    finishTier: mysqlEnum("finishTier", [
      "economy",
      "standard",
      "premium",
    ]).notNull(),
    baseRatePerM2: int("baseRatePerM2").notNull(),
    effectiveFrom: timestamp("effectiveFrom").defaultNow().notNull(),
  },
  table => [
    // A tenant+region+material+tier combination has exactly one active rate per
    // version; the unique index prevents duplicate versions from racing writes.
    unique("rateTables_unique_version").on(
      table.companyId,
      table.version,
      table.region,
      table.material,
      table.finishTier
    ),
  ]
);

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId")
    .notNull()
    .references(() => companies.id),
  source: varchar("source", { length: 40 }).notNull().default("Website"),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 48 }).notNull(),
  preferredChannel: varchar("preferredChannel", { length: 30 })
    .notNull()
    .default("Звонок"),
  region: varchar("region", { length: 80 }).notNull(),
  projectType: varchar("projectType", { length: 64 }).notNull(),
  areaM2: int("areaM2").notNull(),
  floors: int("floors").notNull().default(1),
  material: varchar("material", { length: 80 }).notNull(),
  finishTier: mysqlEnum("finishTier", [
    "economy",
    "standard",
    "premium",
  ]).notNull(),
  foundation: varchar("foundation", { length: 80 }),
  engineering: json("engineering"),
  budgetRange: varchar("budgetRange", { length: 80 }),
  hasLand: boolean("hasLand").notNull().default(false),
  desiredStart: varchar("desiredStart", { length: 80 }),
  rawNotes: text("rawNotes"),
  aiSummary: text("aiSummary"),
  aiIntent: mysqlEnum("aiIntent", [
    "genuine_buyer",
    "researcher",
    "competitor_or_spam",
    "unclear",
  ]),
  aiConfidence: int("aiConfidence"),
  missingFields: json("missingFields"),
  needsManualReview: boolean("needsManualReview").notNull().default(false),
  score: int("score").notNull().default(0),
  scoreBand: mysqlEnum("scoreBand", ["cold", "warm", "hot", "very_hot"])
    .notNull()
    .default("cold"),
  status: mysqlEnum("status", leadStatusValues).notNull().default("New"),
  assignedManagerId: int("assignedManagerId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const estimates = mysqlTable("estimates", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId")
    .notNull()
    .references(() => companies.id),
  leadId: int("leadId")
    .notNull()
    .references(() => leads.id),
  rateTableVersion: int("rateTableVersion").notNull(),
  inputSnapshot: json("inputSnapshot"),
  lowAmount: int("lowAmount").notNull(),
  highAmount: int("highAmount").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("KZT"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const leadActivities = mysqlTable("leadActivities", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId")
    .notNull()
    .references(() => companies.id),
  leadId: int("leadId")
    .notNull()
    .references(() => leads.id),
  actorType: mysqlEnum("actorType", ["system", "ai", "manager"]).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  payload: json("payload"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId")
    .notNull()
    .references(() => companies.id),
  leadId: int("leadId")
    .notNull()
    .references(() => leads.id),
  estimateId: int("estimateId").references(() => estimates.id),
  pdfUrl: text("pdfUrl"),
  status: mysqlEnum("status", ["draft", "sent", "viewed"])
    .notNull()
    .default("draft"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId")
    .notNull()
    .references(() => companies.id),
  leadId: int("leadId").references(() => leads.id),
  assignedTo: int("assignedTo").references(() => users.id),
  title: varchar("title", { length: 240 }).notNull(),
  dueAt: timestamp("dueAt"),
  status: mysqlEnum("status", ["open", "done"]).notNull().default("open"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const followups = mysqlTable("followups", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId")
    .notNull()
    .references(() => companies.id),
  leadId: int("leadId")
    .notNull()
    .references(() => leads.id),
  type: varchar("type", { length: 40 }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "approved",
    "sent",
    "skipped",
    "cancelled",
  ])
    .notNull()
    .default("pending"),
  channel: varchar("channel", { length: 32 }).notNull().default("Telegram"),
  messageText: text("messageText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId")
    .notNull()
    .references(() => companies.id),
  recipientUserId: int("recipientUserId").references(() => users.id),
  channel: varchar("channel", { length: 32 }).notNull().default("Telegram"),
  payload: json("payload"),
  status: mysqlEnum("status", ["queued", "sent", "failed"])
    .notNull()
    .default("queued"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
