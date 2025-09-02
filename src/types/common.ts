// Common type definitions for the Piggy UPI app

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string | null;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Razorpay types
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// UPI types
export interface UPIDetails {
  vpa: string;
  name: string;
  ifsc?: string;
  bankName?: string;
}

export interface UPIMandateRequest {
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  description: string;
}

// Form types
export interface FormValidationError {
  field: string;
  message: string;
}

export type FormSubmitHandler<T> = (data: T) => Promise<void> | void;
