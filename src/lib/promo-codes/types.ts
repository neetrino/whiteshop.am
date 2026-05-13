import type { PromoDiscountType } from "./constants";

export type PromoCodeAdminRow = {
  id: string;
  code: string;
  description: string | null;
  discountType: PromoDiscountType;
  discountValue: number;
  minSubtotal: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  validFrom: string | null;
  validUntil: string | null;
};
