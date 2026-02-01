import { 
  users, bots, allocations, dailyPerformances, transactions, wallets, positions,
  type User, type UpsertUser, type Bot, type InsertBot, 
  type Allocation, type InsertAllocation, 
  type DailyPerformance, type InsertDailyPerformance,
  type Transaction, type InsertTransaction,
  type Wallet, type Position, type InsertPosition
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Bots
  getBots(): Promise<(Bot & { recentPerformance: DailyPerformance[] })[]>;
  getBot(id: number): Promise<Bot | undefined>;
  createBot(bot: InsertBot): Promise<Bot>;
  
  // Wallet & Portfolio
  getWallet(userId: string): Promise<Wallet | undefined>;
  createWallet(userId: string): Promise<Wallet>;
  updateWalletBalance(userId: string, amount: string): Promise<Wallet>; // amount can be negative
  
  // Allocations
  getAllocations(userId: string): Promise<(Allocation & { bot: Bot })[]>;
  createAllocation(allocation: InsertAllocation): Promise<Allocation>;
  
  // Transactions
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  getPendingTransactions(): Promise<(Transaction & { user: User })[]>;
  
  // Users
  getAllUsers(): Promise<(User & { wallet: Wallet | null })[]>;
  
  // Daily Stats
  createDailyPerformance(stats: InsertDailyPerformance): Promise<DailyPerformance>;

  // Positions
  getPositions(botId?: number): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<Position>): Promise<Position>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to imported authStorage or implemented here if overriding
  // Since we need to implement IAuthStorage, we can just use the imported one's methods or reimplement using db
  // Re-implementing to keep it clean in one class using the same db instance
  
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const upsertedUser = await authStorage.upsertUser(user);
    // Ensure wallet exists
    const existingWallet = await this.getWallet(upsertedUser.id);
    if (!existingWallet) {
      await this.createWallet(upsertedUser.id);
    }
    return upsertedUser;
  }

  // Bots
  async getBots(): Promise<(Bot & { recentPerformance: DailyPerformance[] })[]> {
    const allBots = await db.select().from(bots);
    const result = [];
    
    for (const bot of allBots) {
      const perf = await db.select()
        .from(dailyPerformances)
        .where(eq(dailyPerformances.botId, bot.id))
        .orderBy(desc(dailyPerformances.date))
        .limit(7);
      result.push({ ...bot, recentPerformance: perf });
    }
    
    return result;
  }

  async getBot(id: number): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot;
  }

  async createBot(bot: InsertBot): Promise<Bot> {
    const [newBot] = await db.insert(bots).values(bot).returning();
    return newBot;
  }

  // Wallet
  async getWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(userId: string): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values({ userId, balance: "0", totalProfit: "0" }).returning();
    return wallet;
  }

  async updateWalletBalance(userId: string, amount: string): Promise<Wallet> {
    // This is a naive implementation. In production, handle concurrency/locking.
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new Error("Wallet not found");
    
    const newBalance = (parseFloat(wallet.balance) + parseFloat(amount)).toFixed(2);
    const [updated] = await db.update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(wallets.userId, userId))
      .returning();
      
    return updated;
  }

  // Allocations
  async getAllocations(userId: string): Promise<(Allocation & { bot: Bot })[]> {
    const result = await db.select({
      allocation: allocations,
      bot: bots,
    })
    .from(allocations)
    .innerJoin(bots, eq(allocations.botId, bots.id))
    .where(and(eq(allocations.userId, userId), eq(allocations.active, true)));
    
    return result.map(r => ({ ...r.allocation, bot: r.bot }));
  }

  async createAllocation(allocation: InsertAllocation): Promise<Allocation> {
    const [newAllocation] = await db.insert(allocations).values(allocation).returning();
    return newAllocation;
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTx] = await db.insert(transactions).values(transaction).returning();
    return newTx;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    return tx;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [updated] = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return updated;
  }

  async getPendingTransactions(): Promise<(Transaction & { user: User })[]> {
    const result = await db.select({
      transaction: transactions,
      user: users,
    })
    .from(transactions)
    .innerJoin(users, eq(transactions.userId, users.id))
    .where(eq(transactions.status, "PENDING"))
    .orderBy(desc(transactions.createdAt));
    
    return result.map(r => ({ ...r.transaction, user: r.user }));
  }

  // Users
  async getAllUsers(): Promise<(User & { wallet: Wallet | null })[]> {
    const allUsers = await db.select().from(users);
    const result = [];
    
    for (const user of allUsers) {
      const wallet = await this.getWallet(user.id);
      result.push({ ...user, wallet: wallet || null });
    }
    
    return result;
  }

  // Daily Stats
  async createDailyPerformance(stats: InsertDailyPerformance): Promise<DailyPerformance> {
    const [newStats] = await db.insert(dailyPerformances).values(stats).returning();
    return newStats;
  }

  // Positions
  async getPositions(botId?: number): Promise<Position[]> {
    if (botId) {
      return await db.select().from(positions).where(eq(positions.botId, botId)).orderBy(desc(positions.openedAt));
    }
    return await db.select().from(positions).orderBy(desc(positions.openedAt));
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const [newPos] = await db.insert(positions).values(position).returning();
    return newPos;
  }

  async updatePosition(id: number, position: Partial<Position>): Promise<Position> {
    const [updated] = await db.update(positions)
      .set(position)
      .where(eq(positions.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
