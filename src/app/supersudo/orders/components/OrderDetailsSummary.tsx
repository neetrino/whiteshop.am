'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import { convertPrice, formatPriceInCurrency, type CurrencyCode } from '../../../../lib/currency';
import type { OrderDetails } from '../useOrders';
import { getStatusColor, getPaymentStatusColor } from '../utils/orderUtils';

function translateAdminPhrase(status: string, t: (key: string) => string): string {
  const key = `admin.orders.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

interface OrderDetailsSummaryProps {
  orderDetails: OrderDetails;
  currency: string;
  formatCurrency: (amount: number, orderCurrency?: string, fromCurrency?: CurrencyCode) => string;
}

export function OrderDetailsSummary({
  orderDetails,
  currency,
  formatCurrency,
}: OrderDetailsSummaryProps) {
  const { t } = useTranslation();

  const customerName =
    [orderDetails.customer?.firstName, orderDetails.customer?.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' ')
      .trim() || t('admin.orders.unknownCustomer');

  return (
    <Card className="p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t('admin.orders.orderDetails.summary')}
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm text-gray-700">
            <dt className="font-medium text-gray-500 whitespace-nowrap">
              {t('admin.orders.orderDetails.orderNumber')}
            </dt>
            <dd className="tabular-nums text-gray-900 font-medium">{orderDetails.number}</dd>

            <dt className="font-medium text-gray-500 whitespace-nowrap">
              {t('admin.orders.orderDetails.total')}
            </dt>
            <dd className="tabular-nums">
              {orderDetails.totals ? (() => {
                const subtotalAMD = convertPrice(orderDetails.totals.subtotal, 'USD', 'AMD');
                const discountAMD = convertPrice(orderDetails.totals.discount, 'USD', 'AMD');
                const shippingAMD = orderDetails.totals.shipping;
                const taxAMD = convertPrice(orderDetails.totals.tax, 'USD', 'AMD');
                const totalAMD = subtotalAMD - discountAMD + shippingAMD + taxAMD;
                const totalDisplay = currency === 'AMD' ? totalAMD : convertPrice(totalAMD, 'AMD', currency as CurrencyCode);
                return formatPriceInCurrency(totalDisplay, currency as CurrencyCode);
              })() : formatCurrency(orderDetails.total, (orderDetails.currency || 'AMD') as CurrencyCode, 'USD')}
            </dd>

            <dt className="font-medium text-gray-500 whitespace-nowrap">
              {t('admin.orders.orderDetails.status')}
            </dt>
            <dd>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(orderDetails.status)}`}
              >
                {translateAdminPhrase(orderDetails.status, t)}
              </span>
            </dd>

            <dt className="font-medium text-gray-500 whitespace-nowrap">
              {t('admin.orders.orderDetails.payment')}
            </dt>
            <dd>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getPaymentStatusColor(orderDetails.paymentStatus)}`}
              >
                {translateAdminPhrase(orderDetails.paymentStatus, t)}
              </span>
            </dd>
          </dl>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t('admin.orders.orderDetails.customer')}
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm text-gray-700">
            <dt className="font-medium text-gray-500 whitespace-nowrap">
              {t('admin.orders.orderDetails.contactName')}
            </dt>
            <dd className="text-gray-900">{customerName}</dd>

            {orderDetails.customerPhone && (
              <>
                <dt className="font-medium text-gray-500 whitespace-nowrap">
                  {t('checkout.form.phoneNumber')}
                </dt>
                <dd className="tabular-nums">{orderDetails.customerPhone}</dd>
              </>
            )}
            {orderDetails.customerEmail && (
              <>
                <dt className="font-medium text-gray-500 whitespace-nowrap">
                  {t('checkout.form.email')}
                </dt>
                <dd className="break-all">{orderDetails.customerEmail}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </Card>
  );
}

