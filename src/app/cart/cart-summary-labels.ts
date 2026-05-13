import { convertPrice, formatPrice, formatPriceInCurrency } from '../../lib/currency';
import type { CurrencyCode } from '../../lib/currency';
import type { Cart } from './types';

interface CartSummaryLabelsInput {
  cart: Cart;
  currencyCode: CurrencyCode;
  deliveryPriceAMD: number | null;
  loadingDelivery: boolean;
}

/**
 * Shipping row: shows **0** in the storefront currency until the estimate request finishes,
 * then the API value (including real **0 AMD**). Totals use the same provisional shipping.
 */
export function buildCartShippingAndTotalLabels({
  cart,
  currencyCode,
  deliveryPriceAMD,
  loadingDelivery,
}: CartSummaryLabelsInput): { shippingLabel: string; totalLabel: string } {
  const amountsInAmd = cart.totals.currency === 'AMD';
  const shippingAmdResolved = !loadingDelivery && deliveryPriceAMD !== null;
  const shippingAmd = shippingAmdResolved ? deliveryPriceAMD : 0;

  if (amountsInAmd) {
    const shippingLabel = formatPriceInCurrency(
      convertPrice(shippingAmd, 'AMD', currencyCode),
      currencyCode,
    );
    const totalAmd = cart.totals.subtotal - cart.totals.discount + shippingAmd;
    const totalLabel = formatPriceInCurrency(
      convertPrice(totalAmd, 'AMD', currencyCode),
      currencyCode,
    );
    return { shippingLabel, totalLabel };
  }

  const shippingUsd = convertPrice(shippingAmd, 'AMD', 'USD');
  const shippingLabel = formatPrice(shippingUsd, currencyCode);
  const displayTotalUsd = cart.totals.subtotal - cart.totals.discount + shippingUsd;
  const totalLabel = formatPrice(displayTotalUsd, currencyCode);
  return { shippingLabel, totalLabel };
}
