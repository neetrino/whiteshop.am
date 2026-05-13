'use client';

import Link from 'next/link';
import { Card, Button } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';
import {
  ORDER_DETAIL_CARD_CLASS,
  ORDER_DETAIL_INNER_CLASS,
  ORDER_DETAIL_PRIMARY_BUTTON_BASE,
} from '../constants/order-detail-ui';

interface ErrorStateProps {
  error: string | null;
}

export function ErrorState({ error }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className={ORDER_DETAIL_INNER_CLASS}>
      <Card className={`p-8 text-center ${ORDER_DETAIL_CARD_CLASS}`}>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('orders.notFound.title')}</h1>
        <p className="text-[#4b5563] mb-8">{error || t('orders.notFound.description')}</p>
        <Link href="/products" className="inline-block">
          <Button variant="primary" className={`${ORDER_DETAIL_PRIMARY_BUTTON_BASE} px-8`}>
            {t('orders.buttons.continueShopping')}
          </Button>
        </Link>
      </Card>
    </div>
  );
}




