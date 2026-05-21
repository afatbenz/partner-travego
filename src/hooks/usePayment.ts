import { useState } from 'react';
import { paymentService } from '@/services/paymentService';
import { PAYMENT_STATUS } from '@/constants/payment';

/**
 * Hook to manage Midtrans payment flow
 */
export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const submitPayment = async (payload: {
    order_id: string;
    payment_type: number;
    order_type: number;
    payment_amount?: number;
  }) => {
    setLoading(true);
    setError(null);
    setPaymentStatus(null);

    try {
      // 1. Memanggil service untuk mendapatkan snap_token
      const response = await paymentService.submitOrder(payload);
      const { snap_token } = response;

      if (!snap_token) {
        throw new Error('Snap token tidak ditemukan dari server');
      }

      // 2. Memanggil window.snap.pay dari Midtrans
      if ((window as any).snap) {
        (window as any).snap.pay(snap_token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            setPaymentStatus(PAYMENT_STATUS.SUCCESS);
            setLoading(false);
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            setPaymentStatus(PAYMENT_STATUS.PENDING);
            setLoading(false);
          },
          onError: (result: any) => {
            console.error('Payment error:', result);
            setPaymentStatus(PAYMENT_STATUS.ERROR);
            setLoading(false);
          },
          onClose: () => {
            console.log('Payment popup closed');
            setError('Pembayaran belum diselesaikan');
            setLoading(false);
          },
        });
      } else {
        throw new Error('Midtrans Snap script belum siap. Silakan muat ulang halaman.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses pembayaran');
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paymentStatus,
    submitPayment,
  };
};
