const POSTGRES_SCHEMES = ["postgresql://", "postgres://"] as const;

/**
 * Thrown when `DATABASE_URL` is missing or not a PostgreSQL URL.
 * API layers map this to HTTP 503 with a safe client payload (no secrets).
 */
export class DatabaseConfigurationError extends Error {
  readonly code = "DATABASE_NOT_CONFIGURED" as const;

  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isDatabaseConnectionUrlConfigured(): boolean {
  const raw = process.env.DATABASE_URL?.trim() ?? "";
  if (!raw) {
    return false;
  }
  return POSTGRES_SCHEMES.some((prefix) => raw.startsWith(prefix));
}

/**
 * Ensures `DATABASE_URL` is set to a PostgreSQL connection string before touching Prisma.
 */
export function assertPostgresDatabaseUrlConfigured(): void {
  if (!isDatabaseConnectionUrlConfigured()) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL is missing or invalid. Expected a postgresql:// or postgres:// URL.",
    );
  }
}

/** Safe summary for logs (no credentials). */
export function databaseUrlEnvSummary(): {
  configured: boolean;
  reason: "ok" | "missing" | "invalid_scheme";
} {
  const raw = process.env.DATABASE_URL?.trim() ?? "";
  if (!raw) {
    return { configured: false, reason: "missing" };
  }
  if (!POSTGRES_SCHEMES.some((prefix) => raw.startsWith(prefix))) {
    return { configured: false, reason: "invalid_scheme" };
  }
  return { configured: true, reason: "ok" };
}
