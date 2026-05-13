/** First sequential public order number when no prior numeric orders exist. */
export const FIRST_PUBLIC_ORDER_NUMBER = 1000;

/**
 * Distinct key for `pg_advisory_xact_lock` during order-number allocation.
 * Must not collide with other advisory locks in the app.
 */
export const ORDER_NUMBER_ALLOCATION_LOCK_KEY = 902_104_771;
