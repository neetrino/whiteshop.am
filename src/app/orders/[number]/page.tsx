'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { getStoredCurrency } from '../../../lib/currency';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { OrderItems } from './components/OrderItems';
import { ShippingAddress } from './components/ShippingAddress';
import { OrderPageHeader } from './components/OrderPageHeader';
import { OrderHelpCard } from './components/OrderHelpCard';
import { OrderSuccessFooterActions } from './components/OrderSuccessFooterActions';
import type { Order } from './types';
import {
  ORDER_DETAIL_INNER_CLASS,
  ORDER_DETAIL_PAGE_SURFACE_CLASS,
} from './constants/order-detail-ui';

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState(getStoredCurrency());

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    fetchOrder();

    const handleCurrencyUpdate = () => {
      setCurrency(getStoredCurrency());
    };

    window.addEventListener('currency-updated', handleCurrencyUpdate);

    return () => {
      window.removeEventListener('currency-updated', handleCurrencyUpdate);
    };
  }, [isLoggedIn, params.number, router]);

  async function fetchOrder() {
    try {
      setLoading(true);
      const response = await apiClient.get<Order>(`/api/v1/orders/${params.number}`);
      setOrder(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('orders.notFound.description');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={ORDER_DETAIL_PAGE_SURFACE_CLASS}>
        <LoadingState />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={ORDER_DETAIL_PAGE_SURFACE_CLASS}>
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <div className={ORDER_DETAIL_PAGE_SURFACE_CLASS}>
      <div className={ORDER_DETAIL_INNER_CLASS}>
        <OrderPageHeader orderNumber={order.number} placedAt={order.createdAt} />
        <OrderItems
          items={order.items}
          currency={currency}
          presentation="highlight"
          orderTotals={order.totals}
        />
        <OrderHelpCard />
        <OrderSuccessFooterActions />

        {order.shippingAddress && (
          <section className="mt-4 space-y-6 border-t border-gray-200 pt-10">
            <ShippingAddress shippingAddress={order.shippingAddress} />
          </section>
        )}
      </div>
    </div>
  );
}
