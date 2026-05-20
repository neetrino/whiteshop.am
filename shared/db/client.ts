import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

function appendQueryParam(url: string, key: string, value: string): string {
  const lower = url.toLowerCase();
  if (lower.includes(`${key.toLowerCase()}=`)) {
    return url;
  }
  return url.includes("?") ? `${url}&${key}=${value}` : `${url}?${key}=${value}`;
}

/**
 * Append libpq params if missing: UTF-8 + bounded connect wait (faster fail than default).
 * Neon/Vercel: ensure TLS; Prisma + Neon transaction pooler needs `pgbouncer=true`.
 */
function augmentDatabaseUrl(raw: string): string {
  if (!raw) return raw;
  let u = raw;
  u = appendQueryParam(u, "client_encoding", "UTF8");
  u = appendQueryParam(u, "connect_timeout", "12");
  const lower = u.toLowerCase();
  if ((lower.includes(".neon.tech") || lower.includes("neon.tech")) && !lower.includes("sslmode=")) {
    u = appendQueryParam(u, "sslmode", "require");
  }
  const lowerAfterSsl = u.toLowerCase();
  if ((u.includes("-pooler") || lowerAfterSsl.includes("pooler.")) && !lowerAfterSsl.includes("pgbouncer=")) {
    u = appendQueryParam(u, "pgbouncer", "true");
  }
  return u;
}

const databaseUrl = process.env.DATABASE_URL || "";
process.env.DATABASE_URL = augmentDatabaseUrl(databaseUrl);

const devPrismaLogs =
  process.env.NODE_ENV === "development" && process.env.PRISMA_LOG_QUERIES === "1"
    ? (["query", "error", "warn"] as const)
    : (["error", "warn"] as const);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? [...devPrismaLogs] : ["error"],
    errorFormat: "pretty",
  });

// Reuse one client per serverless isolate (Vercel/Next) and across dev HMR.
globalForPrisma.prisma = db;

