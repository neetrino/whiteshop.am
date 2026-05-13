/**
 * Storefront order detail page layout and badge styles (design reference).
 */
export const ORDER_DETAIL_PAGE_SURFACE_CLASS =
  'min-h-[calc(100vh-6rem)] bg-white';

export const ORDER_DETAIL_INNER_CLASS =
  'mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12';

/** Card overrides: light border, no drop shadow (per mock). */
export const ORDER_DETAIL_CARD_CLASS =
  '!border-gray-200 shadow-none';

/** Primary CTA — monochrome (black). */
export const ORDER_DETAIL_PRIMARY_BUTTON_BASE =
  'rounded-lg bg-black text-white hover:bg-zinc-800 focus:ring-zinc-900';

const BADGE_BASE =
  'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium';

/**
 * Badge styles for order / payment / fulfillment status chips.
 */
export function getOrderStatusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized === 'pending') {
    return `${BADGE_BASE} bg-[#fef9c3] text-[#854d0e]`;
  }

  if (normalized === 'unfulfilled') {
    return `${BADGE_BASE} bg-[#f3f4f6] text-[#4b5563]`;
  }

  switch (normalized) {
    case 'confirmed':
      return `${BADGE_BASE} bg-blue-100 text-blue-800`;
    case 'processing':
      return `${BADGE_BASE} bg-purple-100 text-purple-800`;
    case 'shipped':
      return `${BADGE_BASE} bg-indigo-100 text-indigo-800`;
    case 'delivered':
    case 'completed':
      return `${BADGE_BASE} bg-green-100 text-green-800`;
    case 'cancelled':
      return `${BADGE_BASE} bg-red-100 text-red-800`;
    default:
      return `${BADGE_BASE} bg-gray-100 text-gray-800`;
  }
}
