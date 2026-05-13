'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../../lib/i18n-client';
import {
  ORDER_SUCCESS_PRIMARY_CTA_CLASS,
  ORDER_SUCCESS_SECONDARY_CTA_CLASS,
} from '../constants/order-success-ui';

export function OrderSuccessFooterActions() {
  const { t } = useTranslation();

  return (
    <div className="mb-12 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:justify-center">
      <Link href="/products" className={ORDER_SUCCESS_PRIMARY_CTA_CLASS}>
        <span>{t('orders.footerActions.orderAgain')}</span>
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
      </Link>
      <Link href="/" className={ORDER_SUCCESS_SECONDARY_CTA_CLASS}>
        {t('orders.footerActions.home')}
      </Link>
    </div>
  );
}
