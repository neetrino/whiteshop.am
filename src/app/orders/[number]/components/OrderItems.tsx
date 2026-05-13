'use client';

import { useMemo } from 'react';
import { Card } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';
import { OrderItem } from './OrderItem';
import { ORDER_DETAIL_CARD_CLASS } from '../constants/order-detail-ui';
import { ORDER_SUCCESS_RECEIPT_INNER_CLASS, ORDER_SUCCESS_RECEIPT_OUTER_CLASS } from '../constants/order-success-ui';
import { buildReceiptBottomClipPath } from '../utils/receipt-bottom-clip-path';
import { formatOrderGrandTotal } from '../utils/order-totals-display';
import type { OrderItem as OrderItemType, Order } from '../types';

type OrderItemsPresentation = 'detail' | 'highlight';

interface OrderItemsProps {
  items: OrderItemType[];
  currency: 'USD' | 'AMD' | 'EUR' | 'RUB' | 'GEL';
  /** `highlight`: same panel style as “What’s next”, above that card on confirmation flow. */
  presentation?: OrderItemsPresentation;
  /** Required for `highlight` when showing order summary total. */
  orderTotals?: Order['totals'];
}

export function OrderItems({
  items,
  currency,
  presentation = 'detail',
  orderTotals,
}: OrderItemsProps) {
  const { t } = useTranslation();
  const receiptClipPath = useMemo(() => buildReceiptBottomClipPath(), []);

  const title =
    presentation === 'highlight'
      ? t('orders.orderSummary.title')
      : t('orders.orderItems.title');

  const list = (
    <div className="space-y-4">
      {items.map((item, index) => (
        <OrderItem key={index} item={item} currency={currency} />
      ))}
    </div>
  );

  if (presentation === 'highlight') {
    return (
      <div className={ORDER_SUCCESS_RECEIPT_OUTER_CLASS}>
        <section
          className={ORDER_SUCCESS_RECEIPT_INNER_CLASS}
          style={{ clipPath: receiptClipPath }}
          aria-labelledby="order-summary-heading"
        >
          <h2
            id="order-summary-heading"
            className="mb-6 text-center text-lg font-bold text-gray-900 sm:text-xl"
          >
            {title}
          </h2>
          {list}
          {orderTotals && (
            <div className="mt-6 border-t border-dashed border-gray-300 pt-4">
              <div className="flex items-baseline justify-between gap-4 text-gray-900">
                <span className="text-base font-semibold">{t('orders.orderSummary.total')}</span>
                <span className="text-lg font-bold tracking-tight">
                  {formatOrderGrandTotal(orderTotals, currency)}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <Card className={`p-6 ${ORDER_DETAIL_CARD_CLASS}`}>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">{title}</h2>
      {list}
    </Card>
  );
}




