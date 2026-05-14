import { Prisma } from "@white-shop/db";

const PRISMA_CONNECTION_CODES = new Set(["P1001", "P1002", "P1017"]);

/**
 * True when Prisma cannot reach PostgreSQL (Neon paused, wrong URL, network, etc.).
 */
export function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return PRISMA_CONNECTION_CODES.has(error.code);
  }
  return error instanceof Prisma.PrismaClientInitializationError;
}

export function prismaConnectionFailureCode(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return error.errorCode ?? "initialization";
  }
  return "unknown";
}

/** Redacts postgres URLs from Prisma messages before logging. */
export function redactDatabaseUrls(message: string): string {
  return message.replace(/postgres(?:ql)?:\/\/[^\s'"]+/gi, "[REDACTED]");
}
