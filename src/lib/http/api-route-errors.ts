import { DatabaseConfigurationError } from "@white-shop/db/env";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import {
  isPrismaConnectionError,
  prismaConnectionFailureCode,
  redactDatabaseUrls,
} from "@/lib/http/prisma-connection";

export { isPrismaConnectionError } from "@/lib/http/prisma-connection";

const SERVICE_UNAVAILABLE = "https://api.shop.am/problems/service-unavailable";
const INTERNAL = "https://api.shop.am/problems/internal-error";

const SAFE_QUERY_KEYS = new Set([
  "page",
  "limit",
  "lang",
  "filter",
  "filters",
  "category",
  "search",
  "sort",
]);

export type ApiRouteErrorContext = {
  /** Sanitized query keys for logs (values truncated). */
  safeQuery?: Record<string, string>;
};

function pickSafeQuery(searchParams: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    if (!SAFE_QUERY_KEYS.has(key) || value.length > 200) {
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function buildApiRouteErrorContext(req: NextRequest): ApiRouteErrorContext {
  return { safeQuery: pickSafeQuery(req.nextUrl.searchParams) };
}

type BaseLog = {
  logLabel: string;
  path: string;
  method: string;
  safeQuery: Record<string, string>;
};

function buildBaseLog(req: NextRequest, logLabel: string, context?: ApiRouteErrorContext): BaseLog {
  return {
    logLabel,
    path: req.nextUrl.pathname,
    method: req.method,
    safeQuery: context?.safeQuery ?? pickSafeQuery(req.nextUrl.searchParams),
  };
}

function respondDatabaseNotConfigured(req: NextRequest, logLabel: string, baseLog: BaseLog): NextResponse {
  logger.warn(`${logLabel} database not configured`, baseLog);
  return NextResponse.json(
    {
      type: SERVICE_UNAVAILABLE,
      title: "Database not configured",
      status: 503,
      detail:
        "DATABASE_URL is missing or invalid on the server. Set it in the deployment environment (e.g. Vercel project env).",
      instance: req.url,
    },
    { status: 503, headers: { "Retry-After": "60" } }
  );
}

function respondDatabaseUnreachable(
  req: NextRequest,
  logLabel: string,
  baseLog: BaseLog,
  error: unknown
): NextResponse {
  const code = prismaConnectionFailureCode(error);
  const diagnosticMessage =
    error instanceof Error ? redactDatabaseUrls(error.message) : "unknown";
  logger.warn(`${logLabel} database unreachable`, {
    ...baseLog,
    prismaCode: code,
    reason: diagnosticMessage,
  });
  return NextResponse.json(
    {
      type: SERVICE_UNAVAILABLE,
      title: "Database temporarily unavailable",
      status: 503,
      detail:
        "Could not connect to PostgreSQL. Check DATABASE_URL, VPN/firewall, and that the database is running (e.g. wake a paused Neon branch).",
      instance: req.url,
    },
    { status: 503, headers: { "Retry-After": "15" } }
  );
}

function respondInternal(req: NextRequest, logLabel: string, baseLog: BaseLog, error: unknown): NextResponse {
  logger.error(logLabel, error, baseLog);
  const safeDetail =
    process.env.NODE_ENV === "production"
      ? "An error occurred"
      : error instanceof Error
        ? redactDatabaseUrls(error.message)
        : "An error occurred";

  return NextResponse.json(
    {
      type: INTERNAL,
      title: "Internal Server Error",
      status: 500,
      detail: safeDetail,
      instance: req.url,
    },
    { status: 500 }
  );
}

/**
 * Map unknown route errors to JSON Problem Details (no raw Prisma stack traces to clients).
 */
export function apiRouteErrorResponse(
  req: NextRequest,
  error: unknown,
  logLabel: string,
  context?: ApiRouteErrorContext
): NextResponse {
  const baseLog = buildBaseLog(req, logLabel, context);

  if (error instanceof DatabaseConfigurationError) {
    return respondDatabaseNotConfigured(req, logLabel, baseLog);
  }
  if (isPrismaConnectionError(error)) {
    return respondDatabaseUnreachable(req, logLabel, baseLog, error);
  }
  return respondInternal(req, logLabel, baseLog, error);
}
