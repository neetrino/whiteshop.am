import { z } from "zod";

const optionalNullableNonnegNumber = z
  .union([z.number().nonnegative(), z.null()])
  .optional();

const optionalNullableIso = z.union([z.string(), z.null()]).optional();

export const adminPromoWriteSchema = z
  .object({
    code: z.string().min(1).max(64),
    description: z.union([z.string().max(500), z.null()]).optional(),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.number().finite(),
    minSubtotal: optionalNullableNonnegNumber,
    maxDiscountAmount: optionalNullableNonnegNumber,
    usageLimit: z.union([z.number().int().positive(), z.null()]).optional(),
    active: z.boolean().optional(),
    validFrom: optionalNullableIso,
    validUntil: optionalNullableIso,
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "percent") {
      if (data.discountValue <= 0 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percent discount must be between 0 and 100",
          path: ["discountValue"],
        });
      }
    } else if (data.discountType === "fixed") {
      if (data.discountValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed discount must be positive",
          path: ["discountValue"],
        });
      }
    }

    const fromRaw = data.validFrom;
    const untilRaw = data.validUntil;
    if (
      fromRaw &&
      untilRaw &&
      typeof fromRaw === "string" &&
      typeof untilRaw === "string"
    ) {
      const from = Date.parse(fromRaw);
      const until = Date.parse(untilRaw);
      if (!Number.isNaN(from) && !Number.isNaN(until) && from > until) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be on or after start date",
          path: ["validUntil"],
        });
      }
    }
  });

export type AdminPromoWriteInput = z.infer<typeof adminPromoWriteSchema>;

export function parseAdminPromoWriteBody(body: unknown):
  | { ok: true; data: AdminPromoWriteInput }
  | { ok: false; message: string } {
  const parsed = adminPromoWriteSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Invalid request body" };
  }
  return { ok: true, data: parsed.data };
}
