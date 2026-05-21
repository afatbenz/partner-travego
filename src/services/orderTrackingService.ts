import { http } from '@/lib/http';
import type { OrderDetail } from '@/pages/LandingPage/Orders/FindOrder';

export type OrderTrackingType = 'fleet' | 'tour';

export function resolveOrderTrackingType(orderId: string): OrderTrackingType | null {
  const normalized = orderId.trim().toUpperCase();
  if (normalized.startsWith('FO-')) return 'fleet';
  if (normalized.startsWith('TO-')) return 'tour';
  return null;
}

function mapPaymentHistory(history: any[] | null | undefined): OrderDetail['payment'] {
  if (!history?.length) return [];
  return history.map((p) => ({
    payment_type: String(p.payment_type),
    bank_name: p.payment_method_label || p.notes || p.payment_type_label || 'Pembayaran',
    payment_amount: p.payment_amount,
    payment_date: p.settled_at || p.created_at,
    unique_code: 0,
    status: p.status,
    payment_remaining: p.remaining_amount,
    payment_percentage: undefined,
  }));
}

function mapLegacyPayment(payment: any[] | null | undefined): OrderDetail['payment'] {
  if (!payment?.length) return [];
  return payment;
}

function mapDestinations(data: any): OrderDetail['destination'] {
  if (Array.isArray(data.destination) && data.destination.length > 0) {
    return data.destination.map((d: any) => ({
      city: d.city || d.city_label || '',
      location: d.location || d.destination || '',
    }));
  }
  if (Array.isArray(data.itinerary) && data.itinerary.length > 0) {
    return data.itinerary.map((it: any) => ({
      city: it.city_label || '',
      location: it.destination || '',
    }));
  }
  return [];
}

export function mapFleetOrderDetail(data: any): OrderDetail {
  const payment =
    data.payment != null ? mapLegacyPayment(data.payment) : mapPaymentHistory(data.payment_history);

  return {
    order_id: data.order_id,
    price_id: Number(data.price_id) || 0,
    order_date: data.order_date,
    fleet_name: data.fleet_name || data.package_name || '-',
    rent_type: data.rent_type ?? 0,
    rent_type_label: data.rent_type_label || data.package_type_label || '-',
    duration: Number(data.duration) || 0,
    duration_uom: data.duration_uom || (data.duration ? 'Hari' : ''),
    price: data.price ?? 0,
    quantity: data.quantity ?? 1,
    total_amount: data.total_amount ?? 0,
    pickup: {
      pickup_location: data.pickup?.pickup_location || '-',
      pickup_city: data.pickup?.city_label || String(data.pickup?.pickup_city || ''),
      start_date: data.pickup?.start_date || data.start_date || '',
      end_date: data.pickup?.end_date || data.end_date || '',
    },
    destination: mapDestinations(data),
    addon: data.addon || [],
    customer: {
      customer_name: data.customer?.customer_name || '-',
      customer_phone: data.customer?.customer_phone || '-',
      customer_email: data.customer?.customer_email || '-',
      customer_address: data.customer?.customer_address || '-',
    },
    payment,
    orderType: 'fleet',
    status_label: data.status_label,
    payment_status: data.payment_status,
    itinerary: data.itinerary,
    package_name: data.package_name,
  };
}

export function mapTourOrderDetail(data: any): OrderDetail {
  const mapped = mapFleetOrderDetail(data);
  return {
    ...mapped,
    orderType: 'tour',
    fleet_name: data.package_name || data.fleet_name || mapped.fleet_name,
    rent_type_label: data.package_type_label || data.rent_type_label || 'Paket Wisata',
  };
}

export async function fetchFleetOrderDetail(orderId: string): Promise<{ data: OrderDetail; token: string }> {
  const response = await http.post<{ status: string; message?: string; data: Record<string, unknown>; token?: string }>(
    '/api/order/fleet/detail',
    { order_id: orderId.trim() }
  );
  if (response.data?.status !== 'success' || !response.data?.data) {
    throw new Error(response.data?.message || 'Pesanan tidak ditemukan');
  }
  const raw = response.data.data;
  return {
    data: mapFleetOrderDetail(raw),
    token: (raw.token as string) || response.data.token || '',
  };
}

export async function fetchTourOrderDetail(orderId: string): Promise<{ data: OrderDetail; token: string }> {
  const response = await http.post<{ status: string; message?: string; data: Record<string, unknown>; token?: string }>(
    '/api/order/tour-package/detail',
    { order_id: orderId.trim() }
  );
  if (response.data?.status !== 'success' || !response.data?.data) {
    throw new Error(response.data?.message || 'Pesanan tidak ditemukan');
  }
  const raw = response.data.data;
  return {
    data: mapTourOrderDetail(raw),
    token: (raw.token as string) || response.data.token || '',
  };
}

export async function fetchOrderDetailByType(
  type: OrderTrackingType,
  orderId: string
): Promise<{ data: OrderDetail; token: string }> {
  if (type === 'fleet') return fetchFleetOrderDetail(orderId);
  return fetchTourOrderDetail(orderId);
}
