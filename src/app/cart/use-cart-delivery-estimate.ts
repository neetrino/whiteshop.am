import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { CART_DELIVERY_ESTIMATE_CITY } from './constants';

interface UseCartDeliveryEstimateResult {
  deliveryPriceAMD: number | null;
  loadingDelivery: boolean;
}

/**
 * Fetches a single delivery price estimate for the cart summary (no address yet).
 */
export function useCartDeliveryEstimate(): UseCartDeliveryEstimateResult {
  const [deliveryPriceAMD, setDeliveryPriceAMD] = useState<number | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingDelivery(true);
      try {
        const response = await apiClient.get<{ price: number }>('/api/v1/delivery/price', {
          params: {
            city: CART_DELIVERY_ESTIMATE_CITY,
            country: 'Armenia',
          },
        });
        if (!cancelled) {
          setDeliveryPriceAMD(response.price);
        }
      } catch {
        if (!cancelled) {
          setDeliveryPriceAMD(0);
        }
      } finally {
        if (!cancelled) {
          setLoadingDelivery(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { deliveryPriceAMD, loadingDelivery };
}
