'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';
import {
  ORDER_DETAIL_CARD_CLASS,
  getOrderStatusBadgeClass,
} from '../constants/order-detail-ui';

interface OrderStatusProps {
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
}

export function OrderStatus({ status, paymentStatus, fulfillmentStatus }: OrderStatusProps) {
  const { t } = useTranslation();

  return (
    <Card className={`p-6 ${ORDER_DETAIL_CARD_CLASS}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('orders.orderStatus.title')}</h2>
      <div className="flex flex-wrap items-center gap-3">
        <span className={getOrderStatusBadgeClass(status)}>{status}</span>
        <span className={getOrderStatusBadgeClass(paymentStatus)}>
          {t('orders.orderStatus.payment').replace('{status}', paymentStatus)}
        </span>
        <span className={getOrderStatusBadgeClass(fulfillmentStatus)}>
          {t('orders.orderStatus.fulfillment').replace('{status}', fulfillmentStatus)}
        </span>
      </div>
    </Card>
  );
}




