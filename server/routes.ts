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
    try {
      const input = api.user.allocate.input.parse(req.body);
      const userId = req.user.claims.sub;
      const botId = Number(input.botId);
      const amount = parseFloat(input.amount);

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const wallet = await storage.getWallet(userId);
      if (!wallet || parseFloat(wallet.balance) < amount) {
        return res.status(400).json({ message: "Insufficient balance for allocation" });
      }

      const bot = await storage.getBot(botId);
      if (!bot) {
        return res.status(404).json({ message: "Bot node not found" });
      }

      // Deduct from wallet and create allocation
      await storage.updateWalletBalance(userId, (-amount).toString());
      const allocation = await storage.createAllocation({
        userId,
        botId,
        amount: input.amount,
      });

      // Create a ledger entry for the allocation
      await storage.createTransaction({
        userId,
        type: "ALLOCATION",
        amount: input.amount,
        status: "COMPLETED",
        description: `Deployed capital to ${bot.name} node`,
      });

      res.status(201).json(allocation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.user.market.ohlc.path, requireAuth, async (req, res) => {
    const asset = req.query.asset as string || "BTCUSDT";
    const tf = req.query.tf as string || "1m";
    
    // Multiplier based on timeframe for simulation
    const tfMultipliers: Record<string, number> = {
      '1m': 1,
      '5m': 5,
      '15m': 15,
      '1h': 60,
      '1d': 1440
    };
    const interval = tfMultipliers[tf] || 1;
    
    // Simulation logic based on asset
    const basePrice: Record<string, number> = {
      'BTCUSDT': 42000,
      'ETHUSDT': 2300,
      'SOLUSDT': 95
    };
    
    const startPrice = basePrice[asset] || 1000;
    const data = [];
    let currentTime = Math.floor(Date.now() / 1000) - (100 * interval * 60);
    let lastClose = startPrice;
    
    for (let i = 0; i < 100; i++) {
      const volatility = startPrice * 0.001 * interval;
      const open = lastClose;
      const high = open + (Math.random() * volatility);
      const low = open - (Math.random() * volatility);
      const close = low + (Math.random() * (high - low));
      
      data.push({
        time: currentTime,
        open,
        high,
        low,
        close
      });
      
      currentTime += interval * 60;
      lastClose = close;
    }
    
    res.json(data);
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
    console.log("Seeding bots...");
    const defaultBots = [
      {
        name: "Scalping Node v4.2",
        type: "SCALPING",
        description: "Exécution haute fréquence sur micro-fluctuations. Liquidité maximale et exposition temporelle minimale.",
        riskLevel: "LOW",
        dailyCapPercentage: "14.00",
        status: "ACTIVE"
      },
      {
        name: "Trend Following Cluster",
        type: "TREND",
        description: "Identification et exploitation des tendances directionnelles majeures. Optimisé pour les marchés volatils.",
        riskLevel: "MEDIUM",
        dailyCapPercentage: "16.00",
        status: "ACTIVE"
      },
      {
        name: "Range Boundary Engine",
        type: "RANGE",
        description: "Exploitation des supports et résistances en phases de latéralisation. Précision mathématique chirurgicale.",
        riskLevel: "LOW",
        dailyCapPercentage: "12.00",
        status: "ACTIVE"
      },
      {
        name: "Event Impact Processor",
        type: "EVENT",
        description: "Activation neuronale lors d'événements macroéconomiques. Fort effet de levier et rendement explosif.",
        riskLevel: "HIGH",
        dailyCapPercentage: "18.00",
        status: "ACTIVE"
      },
      {
        name: "Sentinel Risk Shield",
        type: "SENTINEL",
        description: "Protection algorithmique globale. Analyse corrélative et arrêt d'urgence en cas d'anomalie réseau.",
        riskLevel: "LOW",
        dailyCapPercentage: "0.00",
        status: "ACTIVE"
      }
    ];

    for (const bot of defaultBots) {
      await storage.createBot(bot);
    }
  }

  // Seed positions if none exist
  const updatedBots = await storage.getBots();
  const existingPositions = await storage.getPositions();
  if (existingPositions.length === 0 && updatedBots.length > 0) {
    console.log("Seeding positions...");
    const assets = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'];
    for (const bot of updatedBots) {
      for (let i = 0; i < 5; i++) {
        await storage.createPosition({
          botId: bot.id,
          asset: assets[Math.floor(Math.random() * assets.length)],
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          entryPrice: (Math.random() * 50000 + 1000).toFixed(2),
          exitPrice: (Math.random() * 50000 + 1000).toFixed(2),
          profitPercentage: (Math.random() * 5 - 2).toFixed(2),
          status: i === 0 ? 'OPEN' : 'CLOSED',
          closedAt: i === 0 ? null : new Date(),
          openedAt: new Date(Date.now() - (i * 3600000))
        } as any);
      }
    }
  }
}
