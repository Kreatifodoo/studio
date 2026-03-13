
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

export interface PackageItem {
  productId: string;
  quantity: number;
}

export interface Package {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
  items: PackageItem[];
}

export interface ComboOption {
  productId: string;
  extraPrice: number;
}

export interface ComboGroup {
  id: string;
  name: string;
  required: boolean;
  options: ComboOption[];
}

export interface Combo {
  id: string;
  sku: string;
  name: string;
  description: string;
  basePrice: number;
  enabled: boolean;
  groups: ComboGroup[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number; // Final price after all deductions
  originalPrice: number; // Price before promo discount
  promoSavings: number; // Amount saved per unit
  quantity: number;
  note?: string;
  priceListId?: string;
  promoId?: string;
  isPackage?: boolean;
  isCombo?: boolean;
  comboSelections?: {
    groupId: string;
    productId: string;
    extraPrice: number;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalSavings: number;
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

export interface PromoDiscount {
  id: string;
  productId: string;
  name: string;
  type: 'Percentage' | 'FixedAmount';
  value: number;
  startDate: string;
  endDate: string;
  enabled: boolean;
}
