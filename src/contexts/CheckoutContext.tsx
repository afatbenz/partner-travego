import React, { createContext, useContext, useState } from 'react';

interface CheckoutData {
  orderId: string;
  fleetId: string;
}

interface CheckoutContextType {
  checkoutData: CheckoutData | null;
  setCheckoutData: (orderId: string, fleetId: string) => void;
  clearCheckoutData: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checkoutData, setCheckoutDataState] = useState<CheckoutData | null>(null);

  const setCheckoutData = (orderId: string, fleetId: string) => {
    setCheckoutDataState({ orderId, fleetId });
  };

  const clearCheckoutData = () => {
    setCheckoutDataState(null);
  };

  return (
    <CheckoutContext.Provider value={{ checkoutData, setCheckoutData, clearCheckoutData }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
