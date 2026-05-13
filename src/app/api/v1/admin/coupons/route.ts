import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { adminService } from "@/lib/services/admin.service";
import { logger } from "@/lib/utils/logger";

function forbidden(req: NextRequest) {
  return NextResponse.json(
    {
      type: "https://api.shop.am/problems/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Admin access required",
      instance: req.url,
    },
    { status: 403 }
  );
}

function isHttpLikeError(
  error: unknown
): error is { status: number; type?: string; title?: string; detail?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}

/**
 * GET /api/v1/admin/coupons
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return forbidden(req);
    }
    const result = await adminService.getPromoCodes();
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("[ADMIN COUPONS] GET", { error });
    if (isHttpLikeError(error)) {
      return NextResponse.json(
        {
          type: error.type ?? "https://api.shop.am/problems/internal-error",
          title: error.title ?? "Error",
          status: error.status,
          detail: error.detail ?? "Request failed",
          instance: req.url,
        },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      {
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        status: 500,
        detail: message,
        instance: req.url,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/coupons
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return forbidden(req);
    }
    const body: unknown = await req.json();
    const result = await adminService.createPromoCode(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    logger.error("[ADMIN COUPONS] POST", { error });
    if (isHttpLikeError(error)) {
      return NextResponse.json(
        {
          type: error.type ?? "https://api.shop.am/problems/internal-error",
          title: error.title ?? "Error",
          status: error.status,
          detail: error.detail ?? "Request failed",
          instance: req.url,
        },
        { status: error.status }
      );
    }
    const message = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      {
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        status: 500,
        detail: message,
        instance: req.url,
      },
      { status: 500 }
    );
  }
}
