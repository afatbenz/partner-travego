export const PAYMENT_TYPE = {
  FIXED: 1,
  CUSTOM: 2,
} as const;

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  PENDING: 'pending',
  ERROR: 'error',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
