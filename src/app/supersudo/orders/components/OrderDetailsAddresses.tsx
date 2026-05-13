'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import { CurrencyCode } from '../../../../lib/currency';
import type { OrderDetails } from '../useOrders';
import { getCheckoutPaymentMethodKey, getPaymentStatusColor } from '../utils/orderUtils';

interface OrderDetailsAddressesProps {
  orderDetails: OrderDetails;
  formatCurrency: (amount: number, orderCurrency?: string, fromCurrency?: CurrencyCode) => string;
}

export function OrderDetailsAddresses({ orderDetails, formatCurrency }: OrderDetailsAddressesProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {t('admin.orders.orderDetails.shippingAddress')}
        </h3>
        {orderDetails.shippingMethod === 'pickup' ? (
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="font-medium">{t('admin.orders.orderDetails.shippingMethod')}</span>{' '}
              {t('admin.orders.orderDetails.pickup')}
            </div>
          </div>
        ) : orderDetails.shippingMethod === 'delivery' && orderDetails.shippingAddress ? (
          <div className="text-sm text-gray-700 space-y-1">
            <div className="mb-2">
              <span className="font-medium">{t('admin.orders.orderDetails.shippingMethod')}</span>{' '}
              {t('checkout.shipping.delivery')}
            </div>
            {(orderDetails.shippingAddress.address || orderDetails.shippingAddress.addressLine1) && (
              <div>
                <span className="font-medium">{t('checkout.form.address')}:</span>{' '}
                {orderDetails.shippingAddress.address || orderDetails.shippingAddress.addressLine1}
                {orderDetails.shippingAddress.addressLine2 && `, ${orderDetails.shippingAddress.addressLine2}`}
              </div>
            )}
            {orderDetails.shippingAddress.city && (
              <div>
                <span className="font-medium">{t('checkout.form.city')}:</span> {orderDetails.shippingAddress.city}
              </div>
            )}
            {orderDetails.shippingAddress.postalCode && (
              <div>
                <span className="font-medium">{t('checkout.form.postalCode')}:</span> {orderDetails.shippingAddress.postalCode}
              </div>
            )}
            {(orderDetails.shippingAddress.phone || orderDetails.shippingAddress.shippingPhone) && (
              <div className="mt-2">
                <span className="font-medium">{t('checkout.form.phoneNumber')}:</span>{' '}
                {orderDetails.shippingAddress.phone || orderDetails.shippingAddress.shippingPhone}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <p>{t('admin.orders.orderDetails.noShippingAddress')}</p>
            {orderDetails.shippingMethod && (
              <p>
                {t('admin.orders.orderDetails.shippingMethod')}{' '}
                {orderDetails.shippingMethod === 'pickup'
                  ? t('admin.orders.orderDetails.pickup')
                  : orderDetails.shippingMethod === 'delivery'
                  ? t('checkout.shipping.delivery')
                  : orderDetails.shippingMethod}
              </p>
            )}
          </div>
        )}
      </Card>
      <Card className="p-4 md:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {t('admin.orders.orderDetails.paymentInfo')}
        </h3>
        {orderDetails.payment ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm text-gray-700">
            {orderDetails.payment.method && (
              <>
                <dt className="font-medium text-gray-500 whitespace-nowrap">
                  {t('admin.orders.orderDetails.method')}
                </dt>
                <dd className="text-gray-900">
                  {(() => {
                    const key = getCheckoutPaymentMethodKey(orderDetails.payment?.method);
                    if (!key) {
                      return orderDetails.payment.method?.replace(/_/g, ' ') ?? '—';
                    }
                    return t(`checkout.payment.${key}`);
                  })()}
                </dd>
              </>
            )}
            <dt className="font-medium text-gray-500 whitespace-nowrap">
              {t('admin.orders.orderDetails.amount')}
            </dt>
            <dd className="tabular-nums">
              {formatCurrency(orderDetails.payment.amount, orderDetails.payment.currency || 'AMD', 'AMD')}
            </dd>
            <dt className="font-medium text-gray-500 whitespace-nowrap">
              {t('admin.orders.orderDetails.status')}
            </dt>
            <dd>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getPaymentStatusColor(orderDetails.payment.status)}`}
              >
                {(() => {
                  const key = `admin.orders.${orderDetails.payment.status}`;
                  const translated = t(key);
                  return translated === key ? orderDetails.payment.status : translated;
                })()}
              </span>
            </dd>
            {orderDetails.payment.cardBrand && orderDetails.payment.cardLast4 && (
              <>
                <dt className="font-medium text-gray-500 whitespace-nowrap">
                  {t('admin.orders.orderDetails.card')}
                </dt>
                <dd>
                  {orderDetails.payment.cardBrand} ••••{orderDetails.payment.cardLast4}
                </dd>
              </>
            )}
          </dl>
        ) : (
          <div className="text-sm text-gray-500">{t('admin.orders.orderDetails.noPaymentInfo')}</div>
        )}
      </Card>
    </div>
  );
}


