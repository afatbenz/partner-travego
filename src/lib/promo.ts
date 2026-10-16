import { http } from '@/lib/http';

// Tipe promosi (penyederhanaan dari model.PromotionListItem di backend).
// Dipakai untuk halaman list/detail promo dan estimasi diskon di checkout.
export type PromotionDestination = {
  city_id: string;
  city_name: string;
};

export type PromotionListItem = {
  promotion_id: string;
  voucher_code: string;
  title: string;
  summary: string;
  terms: string;
  order_type: number; // 0=semua, 1=fleet, 2=tour package
  order_type_label: string;
  rent_type: number; // 0=semua, 1=city tour, 2=overland, 3=drop only
  rent_type_label: string;
  discount_type: number; // 1=flat price, 2=flat discount, 3=persentase
  discount_value: number;
  discount_label: string;
  minimum_payment: number;
  fleet_id: string;
  fleet_name: string;
  thumbnail_url: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  period_status: string; // upcoming | ongoing | expired
  destinations: PromotionDestination[];
};

// Satu promo aktif yang layak untuk konteks order, lengkap estimasi diskon.
export type ApplicablePromotionItem = {
  promotion_id: string;
  voucher_code: string;
  title: string;
  discount_type: number;
  discount_value: number;
  discount_label: string;
  minimum_payment: number;
  fleet_id: string;
  fleet_name: string;
  rent_type: number;
  rent_type_label: string;
  start_date: string;
  end_date: string;
  estimated_discount: number;
  estimated_total: number;
  destinations: PromotionDestination[];
};

type ApiResponse<T> = { status: string; message: string; data: T };

// Daftar promosi publik (read-only) — lewat api-key (DualAuth) di /promotions/public.
export async function getPromotions(search?: string, orderType?: number): Promise<PromotionListItem[]> {
  const query: Record<string, string | number | undefined> = {};
  if (search) query.search = search;
  if (orderType !== undefined) query.order_type = orderType;
  const res = await http.get<ApiResponse<PromotionListItem[]>>('/api/promotions/public/list', { query });
  return res.data?.data || [];
}

// Detail satu promosi.
export async function getPromotion(promotionId: string): Promise<PromotionListItem> {
  const res = await http.get<ApiResponse<PromotionListItem>>(
    `/api/promotions/public/detail/${encodeURIComponent(promotionId)}`
  );
  return res.data?.data as PromotionListItem;
}

// Cek apakah kode voucher masih tersedia (belum dipakai / valid).
export async function checkVoucher(voucherCode: string): Promise<boolean> {
  const res = await http.get<ApiResponse<{ voucher_code: string; available: boolean }>>(
    '/api/promotions/public/check-voucher',
    { query: { voucher_code: voucherCode } }
  );
  return !!res.data?.data?.available;
}

export type ApplicableContext = {
  fleet_id?: string;
  rent_type?: number;
  subtotal: number;
  destination_city_ids?: string[];
};

// Promo aktif yang layak untuk konteks order tertentu (beserta estimasi diskon).
export async function getApplicablePromotions(ctx: ApplicableContext): Promise<ApplicablePromotionItem[]> {
  const query: Record<string, string | number | undefined> = { subtotal: ctx.subtotal };
  if (ctx.fleet_id) query.fleet_id = ctx.fleet_id;
  if (ctx.rent_type) query.rent_type = ctx.rent_type;
  if (ctx.destination_city_ids?.length) {
    query.destination_city_ids = ctx.destination_city_ids.join(',');
  }
  const res = await http.get<ApiResponse<ApplicablePromotionItem[]>>('/api/promotions/public/applicable', { query });
  return res.data?.data || [];
}
