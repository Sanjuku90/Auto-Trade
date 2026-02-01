import { z } from 'zod';
import { 
  insertBotSchema, 
  insertAllocationSchema, 
  insertTransactionSchema,
  insertDailyPerformanceSchema,
  bots,
  allocations,
  transactions,
  dailyPerformances,
  wallets
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  // Public / User Endpoints
  bots: {
    list: {
      method: 'GET' as const,
      path: '/api/bots',
      responses: {
        200: z.array(z.custom<typeof bots.$inferSelect & { recentPerformance: typeof dailyPerformances.$inferSelect[] }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bots/:id',
      responses: {
        200: z.custom<typeof bots.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  
  user: {
    portfolio: {
      method: 'GET' as const,
      path: '/api/portfolio',
      responses: {
        200: z.object({
          totalBalance: z.string(),
          totalProfit: z.string(),
          wallet: z.custom<typeof wallets.$inferSelect>(),
          allocations: z.array(z.custom<typeof allocations.$inferSelect & { bot: typeof bots.$inferSelect }>()),
          recentTransactions: z.array(z.custom<typeof transactions.$inferSelect>()),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    allocate: {
      method: 'POST' as const,
      path: '/api/allocations',
      input: z.object({
        botId: z.number(),
        amount: z.string(),
      }),
      responses: {
        201: z.custom<typeof allocations.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    deposit: {
      method: 'POST' as const,
      path: '/api/deposit',
      input: z.object({
        amount: z.string(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/withdraw',
      input: z.object({
        amount: z.string(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },

  // Admin Endpoints
  admin: {
    bots: {
      create: {
        method: 'POST' as const,
        path: '/api/admin/bots',
        input: insertBotSchema,
        responses: {
          201: z.custom<typeof bots.$inferSelect>(),
          401: errorSchemas.unauthorized,
        },
      },
    },
    dailyStats: {
      create: {
        method: 'POST' as const,
        path: '/api/admin/daily-stats',
        input: insertDailyPerformanceSchema,
        responses: {
          201: z.custom<typeof dailyPerformances.$inferSelect>(),
          401: errorSchemas.unauthorized,
        },
      },
    },
  },
};

// ============================================
// HELPERS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Type helpers
export type PortfolioResponse = z.infer<typeof api.user.portfolio.responses[200]>;
