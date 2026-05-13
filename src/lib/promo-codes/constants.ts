/** Admin + checkout: allowed promo discount kinds */
export const PROMO_DISCOUNT_TYPES = ["percent", "fixed"] as const;

export type PromoDiscountType = (typeof PROMO_DISCOUNT_TYPES)[number];

export function isPromoDiscountType(value: string): value is PromoDiscountType {
  return (PROMO_DISCOUNT_TYPES as readonly string[]).includes(value);
}
