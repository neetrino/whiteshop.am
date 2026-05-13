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
 * PUT /api/v1/admin/coupons/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return forbidden(req);
    }
    const { id } = await params;
    const body: unknown = await req.json();
    const result = await adminService.updatePromoCode(id, body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("[ADMIN COUPONS] PUT", { error });
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
 * DELETE /api/v1/admin/coupons/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return forbidden(req);
    }
    const { id } = await params;
    await adminService.deletePromoCode(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error("[ADMIN COUPONS] DELETE", { error });
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
