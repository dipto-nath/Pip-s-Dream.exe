# PIP.EXE — Backend

A lightweight TypeScript backend for Pip's Dream.exe. Provides API endpoints for guestbook entries and visitor statistics. Supports two deployment targets:

- **Local development**: JSON file storage (`data/data.json`)
- **Production**: Supabase Edge Functions calling PostgreSQL

## Quick Start

### Prerequisites

- Node.js >= 20
- npm (or any compatible package manager)

### Local Development

```bash
npm install
npm run dev        # Start the local server at http://localhost:3001
npm run dev:once    # Start the server once (no watch mode)
```

The server writes to `data/data.json` (gitignored). To reset, delete that file.

### Running Tests

```bash
npm run test:run    # Run all tests once (vitest)
npm run test        # Run tests in watch mode
```

**Test coverage:**

| File                          | Tests | Description                                      |
|-------------------------------|-------|--------------------------------------------------|
| `src/test/validation.test.ts`  | 24    | Input validation, sanitisation, honeypot checks  |
| `src/test/handlers.test.ts`    | 19    | Handler logic: guestbook CRUD, visit recording   |
| `src/testSmoke.ts`             | —     | Direct handler integration smoke test            |
| `src/testHttp.ts`              | 24    | Full HTTP server integration test                |

### API Endpoints

All endpoints return JSON in the format `{ "success": boolean, "data"?: ..., "error"?: string }`.

| Method | Path             | Description                                      |
|--------|------------------|--------------------------------------------------|
| GET    | `/api/health`    | Health check: `{ status, timestamp, checks }`  |
| GET    | `/api/guestbook` | Fetch latest 30 entries (newest first)            |
| POST   | `/api/guestbook` | Create an entry. Body: `{ nickname, message }`    |
| POST   | `/api/visits`    | Record a visit. Body: `{ sessionId }`            |
| GET    | `/api/stats`     | Visitor statistics: `{ total_visits }`           |

### Guestbook Input Rules

| Field      | Rule                                      |
|------------|-------------------------------------------|
| `nickname` | Required, string, 1–24 chars after trim   |
| `message`  | Required, string, 1–180 chars after trim  |
| `website`  | **Honeypot** — must be empty/omitted      |

Rate-limited: 1 submission per nickname within a 5-second window.

### Deployment to Supabase Edge Functions

1. Ensure the Supabase CLI is installed:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref <your-ref>
   ```

3. Set up the database:
   ```bash
   supabase db push
   ```

4. Deploy the functions:
   ```bash
   supabase functions deploy guestbook --project-ref <your-ref>
   supabase functions deploy visits --project-ref <your-ref>
   supabase functions deploy stats --project-ref <your-ref>
   supabase functions deploy health --project-ref <your-ref>
   ```

5. Set the service role key as a function secret:
   ```bash
   supabase functions secrets set SUPABASE_SERVICE_ROLE_KEY --project-ref <your-ref>
   ```

6. Set `VITE_API_BASE_URL` in the frontend to:
   ```
   https://<your-ref>.supabase.co/functions/v1
   ```

### File Structure

```
backend/
├── src/
│   ├── types.ts            # Shared API types
│   ├── storage.ts          # Abstract storage interfaces
│   ├── jsonStorage.ts      # Local JSON file storage implementation
│   ├── validation.ts       # Input validation + sanitisation
│   ├── handlers.ts         # Business logic (pure functions)
│   ├── server.ts           # HTTP server (importable, standalone, or test harness)
│   ├── testSmoke.ts        # Direct handler smoke test
│   ├── testHttp.ts         # HTTP integration test
│   └── test/
│       ├── validation.test.ts  # Vitest unit tests
│       └── handlers.test.ts    # Vitest unit tests
├── functions/              # Supabase Edge Functions
│   ├── guestbook/index.ts
│   ├── visits/index.ts
│   ├── stats/index.ts
│   └── health/index.ts
├── migrations/             # Supabase SQL migrations
│   └── 001_initial_schema.sql
└── package.json
```

### Architecture

```
Frontend (React + Vite)
  │
  │  fetch() → /api/*
  │            │
  │            ▼
├─ Local Dev:   Express-style HTTP server (server.ts)
│               └── JSON file storage (data/data.json)
│
└─ Production:  Supabase Edge Functions
                └── PostgreSQL (via supabase-js + service role)
```
