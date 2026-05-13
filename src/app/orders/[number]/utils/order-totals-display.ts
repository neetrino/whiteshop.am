import { convertPrice, formatPriceInCurrency } from '../../../../lib/currency';
import type { Order } from '../types';

type ShopCurrency = 'USD' | 'AMD' | 'EUR' | 'RUB' | 'GEL';

/**
 * Grand total for storefront order display (matches prior OrderSummary math).
 */
export function formatOrderGrandTotal(totals: Order['totals'], currency: ShopCurrency): string {
  const subtotalAMD = convertPrice(totals.subtotal, 'USD', 'AMD');
  const discountAMD = convertPrice(totals.discount, 'USD', 'AMD');
  const shippingAMD = totals.shipping;
  const taxAMD = convertPrice(totals.tax, 'USD', 'AMD');
  const totalAMD = subtotalAMD - discountAMD + shippingAMD + taxAMD;
  const display = currency === 'AMD' ? totalAMD : convertPrice(totalAMD, 'AMD', currency);
  return formatPriceInCurrency(display, currency);
}
