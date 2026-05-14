import { db } from "@white-shop/db";
import { isDatabaseConnectionUrlConfigured } from "@white-shop/db/env";
import { isPrismaConnectionError } from "@/lib/http/prisma-connection";
import { logger } from "@/lib/utils/logger";
import { NextResponse } from "next/server";

const HEALTH_CHECK_TIMEOUT_MS = 8000;

export async function getHealthResponse(): Promise<NextResponse> {
  if (!isDatabaseConnectionUrlConfigured()) {
    logger.warn("[HEALTH] DATABASE_URL missing or not a PostgreSQL URL");
    return NextResponse.json(
      {
        status: "error",
        app: "running",
        database: "not_configured",
      },
      { status: 503 }
    );
  }

  const start = Date.now();
  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), HEALTH_CHECK_TIMEOUT_MS)
      ),
    ]);
    const latencyMs = Date.now() - start;
    return NextResponse.json(
      {
        status: "ok",
        app: "running",
        database: "connected",
        latencyMs,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const latencyMs = Date.now() - start;
    const prismaConn = isPrismaConnectionError(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.warn("[HEALTH] database check failed", {
      latencyMs,
      prismaConnection: prismaConn,
      reason: message === "DB timeout" ? "timeout" : prismaConn ? "prisma_connection" : "query_error",
    });
    return NextResponse.json(
      {
        status: "error",
        app: "running",
        database: "unavailable",
      },
      { status: 503 }
    );
  }
}
