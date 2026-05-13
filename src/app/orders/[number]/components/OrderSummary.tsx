'use client';

import type { Order } from '../types';

interface OrderSummaryProps {
  order: Order;
  currency: 'USD' | 'AMD' | 'EUR' | 'RUB' | 'GEL';
  calculatedShipping: number | null;
  loadingShipping: boolean;
}

/**
 * Public order confirmation no longer renders a totals card.
 * This file is kept so Tailwind / Turbopack content scans do not hit a stale path
 * (ENOENT on `globals.css` when the module was removed entirely).
 */
export function OrderSummary(_props: OrderSummaryProps): null {
  return null;
}
