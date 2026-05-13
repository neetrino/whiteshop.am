/**
 * Storefront order confirmation / success (monochrome panel + CTAs).
 */

/** White panel (non-receipt): full rounded rect — unused on current flow, kept for reuse. */
export const ORDER_SUCCESS_PANEL_CLASS =
  'mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8';

/** Wrapper around receipt clip panel (shadow follows zigzag). */
export const ORDER_SUCCESS_RECEIPT_OUTER_CLASS =
  'mb-10 w-full [filter:drop-shadow(0_2px_10px_rgba(15,23,42,0.07))]';

/** Inner receipt body: rounded top only; bottom edge comes from clip-path. */
export const ORDER_SUCCESS_RECEIPT_INNER_CLASS =
  'rounded-t-2xl border border-b-0 border-gray-200 bg-white px-6 pb-10 pt-6 sm:px-8 sm:pb-12 sm:pt-8';

/** Primary CTA — solid black on white layout. */
export const ORDER_SUCCESS_PRIMARY_CTA_CLASS =
  'inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-black bg-black px-5 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black';

/** Secondary outline CTA. */
export const ORDER_SUCCESS_SECONDARY_CTA_CLASS =
  'inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 border-black bg-white px-5 py-3 text-center text-base font-semibold text-black transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black';
