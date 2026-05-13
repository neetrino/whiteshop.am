'use client';

import { Phone } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n-client';
import { getSupportPhoneTelHref } from '../constants/support-phone';

export function OrderHelpCard() {
  const { t } = useTranslation();
  const telHref = getSupportPhoneTelHref();

  return (
    <section
      className="mb-8 rounded-2xl border border-gray-200 bg-zinc-50 px-5 py-6 sm:px-7 sm:py-7"
      aria-labelledby="order-help-heading"
    >
      <h2 id="order-help-heading" className="mb-2 text-lg font-bold text-gray-900">
        {t('orders.help.title')}
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-gray-600">{t('orders.help.body')}</p>
      <a
        href={telHref}
        className="inline-flex items-center gap-2 text-lg font-bold text-black underline decoration-gray-400 underline-offset-4 hover:text-zinc-700 hover:decoration-gray-900"
      >
        <Phone className="h-5 w-5 shrink-0 text-gray-900" aria-hidden />
        <span>{t('orders.help.phoneDisplay')}</span>
      </a>
    </section>
  );
}
