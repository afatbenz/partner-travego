/**
 * Payment service for handling payment-related API calls
 */
import { http } from '@/lib/http';

export const paymentService = {
  /**
   * Submit payment order to backend
   * @param {Object} payload - Payment payload
   * @returns {Promise<Object>} - Response from backend
   */
  submitOrder: async (payload) => {
    try {
      // Menggunakan utility http bawaan proyek agar mendapatkan interceptor,
      // headers (seperti api-key), dan konfigurasi base URL yang konsisten.
      const response = await http.post('/api/services/payment/order/submit', payload);
      
      // http.post mengembalikan { data, status, headers }
      return response.data;
    } catch (error) {
      console.error('paymentService.submitOrder error:', error);
      throw error;
    }
  },
};
