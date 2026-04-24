'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { convertPrice, CurrencyCode } from '../../../../lib/currency';
import { getStatusColor, getPaymentStatusColor } from '../utils/orderUtils';
import type { Order } from '../useOrders';

interface OrderRowProps {
  order: Order;
  selected: boolean;
  updatingStatus: boolean;
  updatingPaymentStatus: boolean;
  onToggleSelect: () => void;
  onViewDetails: () => void;
  onStatusChange: (newStatus: string) => void;
  onPaymentStatusChange: (newPaymentStatus: string) => void;
  formatCurrency: (amount: number, orderCurrency?: string, fromCurrency?: CurrencyCode) => string;
}

const selectClass =
  'inline-block w-auto max-w-full min-w-0 cursor-pointer rounded-md border-0 px-2 py-1.5 text-left text-xs font-medium leading-snug focus:outline-none focus:ring-2 focus:ring-blue-500';

function OrderDetailsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

export function OrderRow({
  order,
  selected,
  updatingStatus,
  updatingPaymentStatus,
  onToggleSelect,
  onViewDetails,
  onStatusChange,
  onPaymentStatusChange,
  formatCurrency,
}: OrderRowProps) {
  const { t } = useTranslation();

  const customerName =
    [order.customerFirstName, order.customerLastName].filter(Boolean).join(' ') ||
    t('admin.orders.unknownCustomer');
  const detailsLabelFull = t('admin.orders.viewOrderDetails');
  const detailsLabelShort = t('admin.orders.viewOrderDetailsShort');

  const calculateTotalWithoutShipping = () => {
    if (order.subtotal !== undefined && order.discountAmount !== undefined && order.taxAmount !== undefined) {
      const subtotalAMD = convertPrice(order.subtotal, 'USD', 'AMD');
      const discountAMD = convertPrice(order.discountAmount, 'USD', 'AMD');
      const taxAMD = convertPrice(order.taxAmount, 'USD', 'AMD');
      const totalWithoutShippingAMD = subtotalAMD - discountAMD + taxAMD;
      return formatCurrency(totalWithoutShippingAMD, order.currency, 'AMD');
    }
    const totalAMD = convertPrice(order.total, 'USD', 'AMD');
    const shippingAMD = order.shippingAmount || 0;
    const totalWithoutShippingAMD = totalAMD - shippingAMD;
    return formatCurrency(totalWithoutShippingAMD, order.currency, 'AMD');
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="w-px whitespace-nowrap px-3 py-2.5 align-middle">
        <div className="flex min-w-0 justify-center">
          <input
            type="checkbox"
            className="h-4 w-4 shrink-0 rounded border-gray-300"
            aria-label={t('admin.orders.selectOrder').replace('{number}', order.number)}
            checked={selected}
            onChange={onToggleSelect}
          />
        </div>
      </td>
      <td
        className="min-w-0 cursor-pointer whitespace-nowrap px-3 py-2.5 text-left align-middle"
        onClick={onViewDetails}
        title={order.number}
      >
        <span className="text-sm font-semibold text-gray-900">{order.number}</span>
      </td>
      <td
        className="w-full min-w-[11rem] cursor-pointer px-3 py-2.5 text-left align-middle"
        onClick={onViewDetails}
      >
        <div className="min-w-0 w-full space-y-1">
          <div
            className="w-full min-w-0 truncate text-left text-sm font-medium text-gray-900"
            title={[customerName, order.customerPhone].filter(Boolean).join(' · ')}
          >
            {customerName}
            {order.customerPhone ? (
              <span className="font-normal text-gray-500">
                {' '}
                · <span className="tabular-nums">{order.customerPhone}</span>
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex max-w-full min-w-0 items-center gap-1 truncate text-left text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
            title={detailsLabelFull}
            aria-label={detailsLabelFull}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <OrderDetailsIcon className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span className="min-w-0 truncate">{detailsLabelShort}</span>
          </button>
        </div>
      </td>
      <td
        className="min-w-0 cursor-pointer whitespace-nowrap px-3 py-2.5 text-left align-middle text-sm font-semibold text-gray-900"
        onClick={onViewDetails}
        title={calculateTotalWithoutShipping()}
      >
        {calculateTotalWithoutShipping()}
      </td>
      <td className="min-w-0 whitespace-nowrap px-3 py-2.5 text-center align-middle text-sm tabular-nums text-gray-600">
        {order.itemsCount}
      </td>
      <td className="min-w-0 px-3 py-2.5 text-left align-middle">
        {updatingStatus ? (
          <div
            className="flex w-full min-w-0 items-center justify-center py-1"
            role="status"
            title={t('admin.orders.updating')}
            aria-label={t('admin.orders.updating')}
          >
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-b-gray-900" />
          </div>
        ) : (
          <div className="inline-block min-w-0 max-w-full">
            <select
              value={order.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={`${selectClass} ${getStatusColor(order.status)}`}
            >
              <option value="pending">{t('admin.orders.pending')}</option>
              <option value="processing">{t('admin.orders.processing')}</option>
              <option value="completed">{t('admin.orders.completed')}</option>
              <option value="cancelled">{t('admin.orders.cancelled')}</option>
            </select>
          </div>
        )}
      </td>
      <td className="min-w-0 px-3 py-2.5 text-left align-middle">
        {updatingPaymentStatus ? (
          <div
            className="flex w-full min-w-0 items-center justify-center py-1"
            role="status"
            title={t('admin.orders.updating')}
            aria-label={t('admin.orders.updating')}
          >
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-b-gray-900" />
          </div>
        ) : (
          <div className="inline-block min-w-0 max-w-full">
            <select
              value={order.paymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
              className={`${selectClass} ${getPaymentStatusColor(order.paymentStatus)}`}
            >
              <option value="paid">{t('admin.orders.paid')}</option>
              <option value="pending">{t('admin.orders.pendingPayment')}</option>
              <option value="failed">{t('admin.orders.failed')}</option>
            </select>
          </div>
        )}
      </td>
      <td className="min-w-0 whitespace-nowrap px-3 py-2.5 text-left align-middle text-xs tabular-nums text-gray-600 sm:text-sm">
        {new Date(order.createdAt).toLocaleDateString(undefined, {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
        })}
      </td>
    </tr>
  );
}
