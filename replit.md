# AutoTrade - Automated Trading Bot Platform

## Overview

AutoTrade is a web-based investment platform that enables users to invest in automated cryptocurrency trading bots. Users deposit funds, allocate capital to various trading bots with different risk profiles, and receive variable profits capped at 16-18% daily. The platform emphasizes algorithmic discipline and transparent (but variable) returns rather than guaranteed profits.

Key features:
- User registration and authentication via Replit Auth
- Wallet management with deposit/withdrawal functionality
- Multiple trading bot types (Scalping, Trend, Range, Event, Sentinel)
- Portfolio allocation and performance tracking
- Admin panel for transaction approval and user management
- Real-time performance charts and transaction history

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme (zinc-based color palette)
- **Charts**: Recharts for performance visualization
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

The frontend follows a page-based structure with protected routes requiring authentication. Key pages include Landing, Dashboard, Bots marketplace, Transactions history, and Admin panel.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- **Authentication**: Replit Auth (OpenID Connect) with session-based auth stored in PostgreSQL
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session store

The server uses a modular structure with routes, storage layer, and auth integrations separated. API endpoints are prefixed with `/api/` and follow patterns like `/api/bots`, `/api/portfolio`, `/api/admin/*`.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` with models in `shared/models/`
- **Key Tables**:
  - `users` - User accounts (Replit Auth managed)
  - `sessions` - Session storage for authentication
  - `wallets` - User balances and profit tracking
  - `bots` - Trading bot definitions with risk levels
  - `allocations` - User capital allocations to bots
  - `transactions` - Deposit/withdrawal/profit records
  - `daily_performances` - Bot performance metrics by date
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication Flow
1. User clicks login → redirects to Replit OIDC provider
2. After auth, user is upserted into database
3. Session created with 1-week TTL stored in PostgreSQL
4. Protected routes check `req.isAuthenticated()` middleware
5. User info available via `/api/auth/user` endpoint

### Build & Deployment
- **Development**: `tsx` for TypeScript execution with Vite dev server
- **Production Build**: Custom build script using esbuild for server, Vite for client
- **Output**: Server bundle at `dist/index.cjs`, client at `dist/public/`

## External Dependencies

### Database
- PostgreSQL (required, connection via DATABASE_URL environment variable)
- Drizzle ORM for query building and schema management

### Authentication
- Replit Auth (OpenID Connect)
- Requires ISSUER_URL, REPL_ID, SESSION_SECRET environment variables

### Key NPM Packages
- `@tanstack/react-query` - Server state management
- `drizzle-orm` / `drizzle-zod` - Database ORM with Zod integration
- `passport` / `openid-client` - Authentication
- `express-session` / `connect-pg-simple` - Session management
- `recharts` - Data visualization
- `date-fns` - Date formatting
- Full shadcn/ui component library (Radix UI primitives)

### Cryptocurrency Integration
- USDT TRC20 deposit address configured as constant: `TNfP6AXj1cQfQSEscQDs9hkUKQnLx5GyBF`
- Manual admin approval for deposits/withdrawals (no automated blockchain integration yet)