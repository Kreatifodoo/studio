
export type Category = string;

export type AppView = 'pos' | 'history' | 'dashboard' | 'settings' | 'reports';

export type FeeType = 'Tax' | 'Service' | 'Discount';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  available: boolean;
  description?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Transaction {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Completed' | 'Pending';
  paymentMethod?: string;
  paymentReference?: string;
}

export interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCash?: number;
  status: 'Open' | 'Closed';
  transactionIds: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: 'CreditCard' | 'Banknote' | 'Smartphone';
  description: string;
  enabled: boolean;
}

export interface Fee {
  id: string;
  name: string;
  type: FeeType;
  value: number; // Percentage
  enabled: boolean;
}
