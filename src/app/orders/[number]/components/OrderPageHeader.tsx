'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n-client';

interface OrderPageHeaderProps {
  orderNumber: string;
  placedAt: string;
}

export function OrderPageHeader({ orderNumber, placedAt }: OrderPageHeaderProps) {
  const { t } = useTranslation();

  const placedLabel = t('orders.placedOn').replace(
    '{date}',
    new Date(placedAt).toLocaleDateString(),
  );

  return (
    <header className="mb-10">
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-100 shadow-md shadow-gray-300/40 ring-4 ring-gray-50"
          aria-hidden
        >
          <Check className="h-10 w-10 text-gray-900" strokeWidth={2.75} />
        </div>

        <h1 className="max-w-lg text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
          {t('orders.success.title')}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-[#4b5563]">
          {t('orders.success.description')}
        </p>
        <p className="mt-5 text-sm text-[#6b7280]">
          <span className="font-medium text-gray-700">
            {t('orders.title').replace('{number}', orderNumber)}
          </span>
          <span className="mx-2 text-gray-300" aria-hidden>
            ·
          </span>
          <span>{placedLabel}</span>
        </p>
      </div>
    </header>
  );
}
