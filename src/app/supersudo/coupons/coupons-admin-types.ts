export type PromoFormFields = {
  code: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  minSubtotal: string;
  maxDiscountAmount: string;
  usageLimit: string;
  active: boolean;
  validFrom: string;
  validUntil: string;
};
