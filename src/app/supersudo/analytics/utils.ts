/**
 * Format currency amount
 */

import { CURRENCIES, formatPriceInCurrency, type CurrencyCode } from '../../../lib/currency';

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency in CURRENCIES) {
    return formatPriceInCurrency(amount, currency as CurrencyCode);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to full format (year, month, day)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('hy-AM', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date to short format (month, day)
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('hy-AM', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}




