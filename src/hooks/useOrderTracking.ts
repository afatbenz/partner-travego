import { useCallback, useRef, useState } from 'react';
import type { OrderDetail } from '@/pages/LandingPage/Orders/FindOrder';
import { resolveOrderTrackingType, type OrderTrackingType } from '@/services/orderTrackingService';

const CACHE_TTL_MS = 30_000;

type CacheEntry = {
  at: number;
  data: OrderDetail;
  token: string;
  type: OrderTrackingType;
};

export function useOrderTracking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<OrderDetail | null>(null);
  const [orderToken, setOrderToken] = useState('');
  const [orderType, setOrderType] = useState<OrderTrackingType | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const inFlightRef = useRef<string | null>(null);

  const trackOrder = useCallback(async (rawOrderId: string) => {
    const orderId = rawOrderId.trim();
    if (!orderId) return;

    const type = resolveOrderTrackingType(orderId);
    if (!type) {
      setError('Format Order ID tidak valid. Gunakan prefix FO- (armada) atau TO- (paket wisata).');
      setSearchResult(null);
      setOrderToken('');
      setOrderType(null);
      return;
    }

    const cacheKey = `${type}:${orderId.toUpperCase()}`;
    const cached = cacheRef.current.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.at < CACHE_TTL_MS) {
      setError(null);
      setSearchResult(cached.data);
      setOrderToken(cached.token);
      setOrderType(cached.type);
      setIsThrottled(true);
      return;
    }

    if (inFlightRef.current === cacheKey) return;

    inFlightRef.current = cacheKey;
    setIsLoading(true);
    setIsThrottled(false);
    setError(null);
    setSearchResult(null);
    setOrderToken('');
    setOrderType(null);

    try {
      const { fetchOrderDetailByType: fetchDetail } = await import('@/services/orderTrackingService');
      const { data, token } = await fetchDetail(type, orderId);
      cacheRef.current.set(cacheKey, { at: Date.now(), data, token, type });
      setSearchResult(data);
      setOrderToken(token);
      setOrderType(type);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Terjadi kesalahan saat mencari pesanan');
      setError(message);
      console.error('Error tracking order:', err);
    } finally {
      setIsLoading(false);
      if (inFlightRef.current === cacheKey) inFlightRef.current = null;
    }
  }, []);

  const resetTracking = useCallback(() => {
    setSearchResult(null);
    setError(null);
    setOrderToken('');
    setOrderType(null);
    setIsThrottled(false);
  }, []);

  return {
    trackOrder,
    resetTracking,
    isLoading,
    error,
    searchResult,
    orderToken,
    orderType,
    isThrottled,
  };
}
