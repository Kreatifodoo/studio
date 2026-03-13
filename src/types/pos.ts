
export type Category = string;

export type AppView = 'pos' | 'history' | 'dashboard' | 'settings' | 'reports';

export type FeeType = 'Tax' | 'Service' | 'Discount';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  price: number;
  costPrice: number;
  category: Category;
  image: string;
  available: boolean;
  onHandQty: number;
  description?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  priceListId?: string; // Track if a special price list was used
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
  customerId?: string;
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

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface PriceTier {
  minQty: number;
  maxQty: number;
  price: number;
}

export interface PriceList {
  id: string;
  productId: string;
  name: string;
  startDate: string;
  endDate: string;
  tiers: PriceTier[];
  enabled: boolean;
}
