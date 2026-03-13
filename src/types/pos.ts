
export type Category = 'All' | 'Main Course' | 'Drinks' | 'Snacks' | 'Desserts';

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
}
