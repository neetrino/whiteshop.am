import { db, Prisma } from "@white-shop/db";
import { parseAdminPromoWriteBody } from "@/lib/schemas/admin-promo.schema";
import { isPromoDiscountType, type PromoDiscountType } from "@/lib/promo-codes/constants";
import type { PromoCodeAdminRow } from "@/lib/promo-codes/types";
import { logger } from "@/lib/utils/logger";

type AdminHttpError = {
  status: number;
  type: string;
  title: string;
  detail: string;
};

function badRequest(detail: string): AdminHttpError {
  return {
    status: 400,
    type: "https://api.shop.am/problems/bad-request",
    title: "Bad Request",
    detail,
  };
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

function mapRow(r: {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minSubtotal: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
}): PromoCodeAdminRow {
  const discountType: PromoDiscountType = isPromoDiscountType(r.discountType)
    ? r.discountType
    : "fixed";
  return {
    id: r.id,
    code: r.code,
    description: r.description,
    discountType,
    discountValue: r.discountValue,
    minSubtotal: r.minSubtotal,
    maxDiscountAmount: r.maxDiscountAmount,
    usageLimit: r.usageLimit,
    usedCount: r.usedCount,
    active: r.active,
    validFrom: r.validFrom ? r.validFrom.toISOString() : null,
    validUntil: r.validUntil ? r.validUntil.toISOString() : null,
  };
}

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw badRequest("Invalid date value");
  }
  return d;
}

class AdminCouponsService {
  async getPromoCodes(): Promise<{ data: PromoCodeAdminRow[] }> {
    const rows = await db.promoCode.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return { data: rows.map(mapRow) };
  }

  async createPromoCode(body: unknown): Promise<{ data: PromoCodeAdminRow }> {
    const parsed = parseAdminPromoWriteBody(body);
    if (!parsed.ok) {
      throw badRequest(parsed.message);
    }
    const d = parsed.data;
    const code = normalizeCode(d.code);
    if (!code) {
      throw badRequest("Code is required");
    }

    const validFrom = parseOptionalDate(d.validFrom ?? undefined);
    const validUntil = parseOptionalDate(d.validUntil ?? undefined);
    if (validFrom && validUntil && validFrom.getTime() > validUntil.getTime()) {
      throw badRequest("End date must be on or after start date");
    }

    try {
      const row = await db.promoCode.create({
        data: {
          code,
          description: d.description ?? null,
          discountType: d.discountType,
          discountValue: d.discountValue,
          minSubtotal: d.minSubtotal ?? null,
          maxDiscountAmount: d.maxDiscountAmount ?? null,
          usageLimit: d.usageLimit ?? null,
          active: d.active ?? true,
          validFrom,
          validUntil,
        },
      });
      return { data: mapRow(row) };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw {
          status: 409,
          type: "https://api.shop.am/problems/conflict",
          title: "Conflict",
          detail: "A promo code with this value already exists",
        } satisfies AdminHttpError;
      }
      logger.error("[ADMIN COUPONS] createPromoCode failed", { err: e });
      throw e;
    }
  }

  async updatePromoCode(id: string, body: unknown): Promise<{ data: PromoCodeAdminRow }> {
    const parsed = parseAdminPromoWriteBody(body);
    if (!parsed.ok) {
      throw badRequest(parsed.message);
    }
    const d = parsed.data;
    const existing = await db.promoCode.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: `Promo code with id '${id}' does not exist`,
      } satisfies AdminHttpError;
    }

    const code = normalizeCode(d.code);
    if (!code) {
      throw badRequest("Code is required");
    }

    const validFrom = parseOptionalDate(d.validFrom ?? undefined);
    const validUntil = parseOptionalDate(d.validUntil ?? undefined);
    if (validFrom && validUntil && validFrom.getTime() > validUntil.getTime()) {
      throw badRequest("End date must be on or after start date");
    }

    const nextLimit = d.usageLimit ?? null;
    if (nextLimit !== null && nextLimit < existing.usedCount) {
      throw badRequest("Usage limit cannot be less than times already used");
    }

    try {
      const row = await db.promoCode.update({
        where: { id },
        data: {
          code,
          description: d.description ?? null,
          discountType: d.discountType,
          discountValue: d.discountValue,
          minSubtotal: d.minSubtotal ?? null,
          maxDiscountAmount: d.maxDiscountAmount ?? null,
          usageLimit: nextLimit,
          active: d.active ?? true,
          validFrom,
          validUntil,
        },
      });
      return { data: mapRow(row) };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw {
          status: 409,
          type: "https://api.shop.am/problems/conflict",
          title: "Conflict",
          detail: "A promo code with this value already exists",
        } satisfies AdminHttpError;
      }
      logger.error("[ADMIN COUPONS] updatePromoCode failed", { id, err: e });
      throw e;
    }
  }

  async deletePromoCode(id: string): Promise<{ success: true }> {
    const existing = await db.promoCode.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: `Promo code with id '${id}' does not exist`,
      } satisfies AdminHttpError;
    }

    await db.promoCode.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });
    logger.debug("[ADMIN COUPONS] deletePromoCode (soft)", { id });
    return { success: true };
  }
}

export const adminCouponsService = new AdminCouponsService();
