import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useCheckout } from '@/contexts/CheckoutContext';

export const ItineraryRequest: React.FC = () => {
  const { checkoutData } = useCheckout();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Permintaan Itinerary" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Itinerary Request</h1>
        {checkoutData ? (
          <p>Order ID: {checkoutData.orderId}</p>
        ) : (
          <p>No checkout data found.</p>
        )}
        <p>Halaman ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
};
