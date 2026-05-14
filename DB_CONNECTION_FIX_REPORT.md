# Database connection fix report

## What was causing the 503 responses

The storefront APIs (`/api/v1/products`, `/api/v1/categories/top`, `/api/v1/categories/tree`) return **503** when Prisma cannot reach PostgreSQL (`P1001` / `P1002` / `P1017`) or when the client fails to initialize. On Vercel this is almost always one or more of:

1. **`DATABASE_URL` missing or wrong** in the Vercel project (Production / Preview) — the app now fails fast with a distinct **“Database not configured”** problem response when the URL is empty or not a `postgresql://` / `postgres://` string.
2. **Neon compute paused or unreachable** — still **503 “Database temporarily unavailable”** (expected until the branch is active and reachable).
3. **Neon pooler + Prisma** — without `pgbouncer=true` and TLS, pooled connections can misbehave. The shared DB client now appends **`sslmode=require`** (Neon hosts) and **`pgbouncer=true`** when the host looks like a pooler endpoint.
4. **Prisma client reuse on serverless** — `globalForPrisma.prisma` was only set in non-production, which is unnecessary and inconsistent with common Vercel/Neon guidance. The client is now **always** attached to `globalThis` so each isolate reuses a single `PrismaClient`.

The 503 payloads were already structured (Problem Details); they are unchanged for DB-unreachable cases so existing clients keep the same shape.

## Files changed

| Area | Path |
|------|------|
| DB URL helpers + config error | `shared/db/env.ts` (new) |
| Prisma singleton + URL augmentation | `shared/db/client.ts` |
| Package subpath for env-only imports | `shared/db/package.json`, `shared/db/index.ts` |
| Prisma connection detection | `src/lib/http/prisma-connection.ts` (new) |
| API error mapping + logging | `src/lib/http/api-route-errors.ts` |
| Health handler | `src/lib/server/health-handler.ts` (new) |
| Health routes | `src/app/api/health/route.ts`, `src/app/api/v1/health/route.ts` (new) |
| Assert DB URL before DB work (after cache miss) | `src/app/api/v1/products/route.ts`, `src/app/api/v1/categories/top/route.ts`, `src/app/api/v1/categories/tree/route.ts` |
| No 503 retry storms (comment) | `src/lib/api-client/http-methods.ts` |
| Mobile shop categories: fix refetch loop | `src/components/MobileBottomNav.tsx` |
| Top categories: language sync + error UI | `src/components/TopCategories.tsx` |
| Category tree: language + failure hint | `src/components/Header.tsx` |
| i18n strings | `src/locales/en|hy|ru/home.json`, `src/locales/en|hy|ru/common.json` |
| Env template | `.env.example` |
| This report | `DB_CONNECTION_FIX_REPORT.md` |

## Required environment variables on Vercel

| Variable | Required for runtime API | Notes |
|----------|-------------------------|--------|
| `DATABASE_URL` | **Yes** | Use Neon’s **pooled** connection string (host often contains `-pooler`). Must be `postgresql://` or `postgres://`. |
| `DIRECT_URL` | **For migrations / `prisma migrate deploy`** | Non-pooler Neon URL. Prisma schema references it; keep it in CI and locally. Vercel runtime primarily needs `DATABASE_URL`. |

Optional: `UPSTASH_*` for Redis caching (API still hits the DB on cache miss).

## What to verify in Neon / PostgreSQL

1. **Branch is active** (not auto-suspended) when you expect traffic, or accept cold-start wake latency.
2. **Connection string** copied from Neon for **pooled** connections matches what Prisma expects (`sslmode=require` is added automatically for `.neon.tech` hosts if omitted).
3. **User/password** and database name are correct; IP allowlists / VPC are compatible with Neon’s public pooler (typical for Vercel).
4. **`DIRECT_URL`** for migration jobs points at the **direct** (non-pooler) host.

## How to test locally

1. Copy `.env.example` to `.env` and set a valid `DATABASE_URL` (and `DIRECT_URL` if you run migrations).
2. `pnpm install` then `pnpm run db:generate` if the Prisma client is out of date.
3. `pnpm dev` and call:
   - `GET http://localhost:3000/api/health`
   - `GET http://localhost:3000/api/v1/health`
   - `GET http://localhost:3000/api/v1/products?page=1&limit=10&lang=en&filter=new`
   - `GET http://localhost:3000/api/v1/categories/top?lang=en&limit=5`
   - `GET http://localhost:3000/api/v1/categories/tree?lang=en`
4. With DB stopped or `DATABASE_URL` unset: health should report `database: "unavailable"` or `"not_configured"`; storefront APIs should return **503** JSON problems without crashing the UI.

## How to verify on production after deploy

1. In Vercel → Project → **Settings → Environment Variables**: confirm **`DATABASE_URL`** for **Production** (and Preview if used).
2. Open `https://<your-domain>/api/health` — expect `status: "ok"` and `database: "connected"` when Neon is up.
3. Load the home page: featured products and categories should populate when the DB is healthy; with DB down, sections show **empty/error fallbacks** without infinite client retries (429 is still the only auto-retry case in the API client).

## Commands run for verification

From the repo root (after your env is set):

- `pnpm exec tsc --noEmit`
- `pnpm run lint`
- `pnpm run build`

Use `/api/health` or `/api/v1/health` as the first check after every deploy.
