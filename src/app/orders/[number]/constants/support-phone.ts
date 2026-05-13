/**
 * Customer support phone for order confirmation (tel: link).
 * Override with NEXT_PUBLIC_SUPPORT_PHONE_E164 (e.g. +37495044888).
 */
const DEFAULT_E164 = '+37495044888';

function normalizeToTelHref(input: string): string {
  const trimmed = input.trim();
  if (trimmed.toLowerCase().startsWith('tel:')) {
    return trimmed;
  }
  const noSpace = trimmed.replace(/\s/g, '');
  if (noSpace.length === 0) {
    return 'tel:+37495044888';
  }
  const e164 = noSpace.startsWith('+') ? noSpace : `+${noSpace}`;
  return `tel:${e164}`;
}

export function getSupportPhoneTelHref(): string {
  const fromEnv =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPPORT_PHONE_E164?.trim() : '';
  return normalizeToTelHref(fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_E164);
}
