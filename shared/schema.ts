import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import auth models
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

// Wallet for user balance and stats
export const wallets = pgTable("wallets", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  balance: numeric("balance").notNull().default("0"),
  totalProfit: numeric("total_profit").notNull().default("0"),
  isFrozen: boolean("is_frozen").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bots definitions
export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'SCALPING', 'TREND', 'RANGE', 'EVENT', 'SENTINEL'
  description: text("description").notNull(),
  riskLevel: text("risk_level").notNull(), // 'LOW', 'MEDIUM', 'HIGH'
  dailyCapPercentage: numeric("daily_cap_percentage").notNull().default("16.00"),
  status: text("status").notNull().default("ACTIVE"), // 'ACTIVE', 'PAUSED'
  imageUrl: text("image_url"),
});

// User allocations to bots
export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  botId: integer("bot_id").notNull().references(() => bots.id),
  amount: numeric("amount").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily performance stats per bot
export const dailyPerformances = pgTable("daily_performances", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull().references(() => bots.id),
  date: date("date").notNull().defaultNow(),
  profitPercentage: numeric("profit_percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions log
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'DEPOSIT', 'WITHDRAWAL', 'PROFIT', 'ALLOCATION'
  amount: numeric("amount").notNull(),
  status: text("status").notNull().default("COMPLETED"), // 'PENDING', 'COMPLETED', 'FAILED'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const allocationsRelations = relations(allocations, ({ one }) => ({
  user: one(users, {
    fields: [allocations.userId],
    references: [users.id],
  }),
  bot: one(bots, {
    fields: [allocations.botId],
    references: [bots.id],
  }),
}));

export const dailyPerformancesRelations = relations(dailyPerformances, ({ one }) => ({
  bot: one(bots, {
    fields: [dailyPerformances.botId],
    references: [bots.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertBotSchema = createInsertSchema(bots).omit({ id: true });
export const insertAllocationSchema = createInsertSchema(allocations).omit({ id: true, createdAt: true, active: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertDailyPerformanceSchema = createInsertSchema(dailyPerformances).omit({ id: true, createdAt: true });

// === EXPLICIT API TYPES ===
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;

export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type DailyPerformance = typeof dailyPerformances.$inferSelect;
export type InsertDailyPerformance = z.infer<typeof insertDailyPerformanceSchema>;

export type Wallet = typeof wallets.$inferSelect;

// Request/Response types
export type CreateBotRequest = InsertBot;
export type CreateAllocationRequest = { botId: number; amount: string }; // Custom because userId comes from session
export type CreateDepositRequest = { amount: string };
export type CreateWithdrawalRequest = { amount: string };

export type PortfolioResponse = {
  totalBalance: string;
  totalProfit: string;
  allocations: (Allocation & { bot: Bot })[];
  recentTransactions: Transaction[];
};

export type BotWithPerformance = Bot & {
  recentPerformance: DailyPerformance[];
};
