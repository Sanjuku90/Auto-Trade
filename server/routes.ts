import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Public Routes ===
  
  app.get(api.bots.list.path, async (req, res) => {
    const bots = await storage.getBots();
    res.json(bots);
  });

  app.get(api.bots.get.path, async (req, res) => {
    const bot = await storage.getBot(Number(req.params.id));
    if (!bot) return res.status(404).json({ message: "Bot not found" });
    res.json(bot);
  });

  // === Protected Routes ===
  // Middleware to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  app.get(api.user.portfolio.path, requireAuth, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    // Ensure wallet exists (should be created on login, but safety check)
    let wallet = await storage.getWallet(userId);
    if (!wallet) {
      wallet = await storage.createWallet(userId);
    }
    
    const allocations = await storage.getAllocations(userId);
    const recentTransactions = await storage.getTransactions(userId);
    
    // Calculate total profit from wallet (or sum of profit txs)
    // For now, using wallet.totalProfit
    
    res.json({
      totalBalance: wallet.balance,
      totalProfit: wallet.totalProfit,
      wallet,
      allocations,
      recentTransactions,
    });
  });

  app.post(api.user.deposit.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.user.deposit.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      const amount = parseFloat(input.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create PENDING transaction - admin must approve
      const tx = await storage.createTransaction({
        userId,
        type: "DEPOSIT",
        amount: input.amount,
        status: "PENDING",
        description: "Deposit request - awaiting admin approval",
      });

      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.user.withdraw.path, requireAuth, async (req: any, res) => {
    try {
      const input = api.user.withdraw.input.parse(req.body);
      const userId = req.user.claims.sub;
      
      const amount = parseFloat(input.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const wallet = await storage.getWallet(userId);
      if (!wallet || parseFloat(wallet.balance) < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // Create PENDING transaction - admin must approve
      const networkLabel = input.network === "USDT_TRC20" ? "USDT (TRC20)" : "TRON (TRX)";
      const tx = await storage.createTransaction({
        userId,
        type: "WITHDRAWAL",
        amount: input.amount,
        status: "PENDING",
        description: `Withdrawal via ${networkLabel} to ${input.walletAddress}`,
      });

      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.user.allocate.path, requireAuth, async (req: any, res) => {
    // ... logic for allocate
  });

  app.get(api.user.positions.list.path, requireAuth, async (req, res) => {
    const botId = req.query.botId ? Number(req.query.botId) : undefined;
    const positions = await storage.getPositions(botId);
    res.json(positions);
  });

  // === Admin Routes (Simplified, no admin check for MVP demo) ===
  app.post(api.admin.bots.create.path, async (req, res) => {
    // In real app, check admin role
    const bot = await storage.createBot(req.body);
    res.status(201).json(bot);
  });

  app.post(api.admin.dailyStats.create.path, async (req, res) => {
    const stats = await storage.createDailyPerformance(req.body);
    res.status(201).json(stats);
  });

  // Get all pending transactions
  app.get(api.admin.pendingTransactions.list.path, async (req, res) => {
    const pending = await storage.getPendingTransactions();
    res.json(pending);
  });

  // Approve a transaction
  app.post(api.admin.pendingTransactions.approve.path, async (req, res) => {
    const txId = Number(req.params.id);
    const tx = await storage.getTransaction(txId);
    
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (tx.status !== "PENDING") {
      return res.status(400).json({ message: "Transaction is not pending" });
    }

    // Update status to COMPLETED
    const updated = await storage.updateTransactionStatus(txId, "COMPLETED");
    
    // Apply wallet changes
    if (tx.type === "DEPOSIT") {
      await storage.updateWalletBalance(tx.userId, tx.amount);
    } else if (tx.type === "WITHDRAWAL") {
      await storage.updateWalletBalance(tx.userId, (-parseFloat(tx.amount)).toString());
    }
    
    res.json(updated);
  });

  // Reject a transaction
  app.post(api.admin.pendingTransactions.reject.path, async (req, res) => {
    const txId = Number(req.params.id);
    const tx = await storage.getTransaction(txId);
    
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    if (tx.status !== "PENDING") {
      return res.status(400).json({ message: "Transaction is not pending" });
    }

    // Update status to FAILED
    const updated = await storage.updateTransactionStatus(txId, "FAILED");
    res.json(updated);
  });

  // Get all users
  app.get(api.admin.allUsers.list.path, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const botsList = await storage.getBots();
  if (botsList.length === 0) {
    // ... existing seeding logic
  }

  // Seed positions if none exist
  const existingPositions = await storage.getPositions();
  if (existingPositions.length === 0 && botsList.length > 0) {
    console.log("Seeding positions...");
    const assets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
    for (const bot of botsList) {
      for (let i = 0; i < 5; i++) {
        await storage.createPosition({
          botId: bot.id,
          asset: assets[Math.floor(Math.random() * assets.length)],
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          entryPrice: (Math.random() * 50000 + 1000).toFixed(2),
          exitPrice: (Math.random() * 50000 + 1000).toFixed(2),
          profitPercentage: (Math.random() * 5 - 2).toFixed(2),
          status: i === 0 ? 'OPEN' : 'CLOSED',
          closedAt: i === 0 ? null : new Date()
        } as any);
      }
    }
  }
}
