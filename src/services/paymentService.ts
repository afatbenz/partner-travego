import { http } from '@/lib/http';

type SubmitOrderPayload = {
  order_id: string;
  payment_type: number;
  order_type: number;
  payment_amount?: number;
};

type SubmitOrderResponse = {
  snap_token?: string;
  [key: string]: unknown;
};

export const paymentService = {
  submitOrder: async (payload: SubmitOrderPayload) => {
    const response = await http.post<SubmitOrderResponse>('/api/services/payment/order/submit', payload);
    return response.data;
  },
};
