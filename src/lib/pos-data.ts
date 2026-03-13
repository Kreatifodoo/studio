
import { Product, Category } from '@/types/pos';
import { PlaceHolderImages } from './placeholder-images';

export const CATEGORIES: Category[] = ['All', 'Packages', 'Main Course', 'Drinks', 'Snacks', 'Desserts'];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/default/400/300';

export const PRODUCTS: Product[] = [
  { id: '1', sku: 'MC-001', barcode: '8880001', name: 'Classic Burger', price: 12.50, costPrice: 5.00, category: 'Main Course', image: getImage('item-burger'), available: true, onHandQty: 50, description: 'Juicy beef patty with special sauce' },
  { id: '2', sku: 'MC-002', barcode: '8880002', name: 'Pepperoni Pizza', price: 18.00, costPrice: 8.00, category: 'Main Course', image: getImage('item-pizza'), available: true, onHandQty: 30, description: 'Traditional Italian style with fresh pepperoni' },
  { id: '3', sku: 'SN-001', barcode: '8880003', name: 'Garden Salad', price: 8.50, costPrice: 3.00, category: 'Snacks', image: getImage('item-salad'), available: true, onHandQty: 25, description: 'Mix of seasonal fresh greens' },
  { id: '4', sku: 'DR-001', barcode: '8880004', name: 'Coca Cola', price: 3.50, costPrice: 1.50, category: 'Drinks', image: getImage('item-coke'), available: true, onHandQty: 100, description: 'Chilled refreshing soda' },
  { id: '5', sku: 'DR-002', barcode: '8880005', name: 'Caramel Latte', price: 5.50, costPrice: 2.00, category: 'Drinks', image: getImage('item-coffee'), available: true, onHandQty: 40, description: 'Rich espresso with caramel and steamed milk' },
  { id: '6', sku: 'SN-002', barcode: '8880006', name: 'French Fries', price: 4.50, costPrice: 1.20, category: 'Snacks', image: getImage('item-fries'), available: true, onHandQty: 80, description: 'Crispy salted golden fries' },
  { id: '7', sku: 'MC-003', barcode: '8880007', name: 'Spaghetti Carbonara', price: 14.50, costPrice: 6.00, category: 'Main Course', image: getImage('item-pasta'), available: true, onHandQty: 20, description: 'Classic creamy pasta with pancetta' },
  { id: '8', sku: 'DS-001', barcode: '8880008', name: 'Lava Cake', price: 7.50, costPrice: 2.50, category: 'Desserts', image: getImage('item-cake'), available: true, onHandQty: 15, description: 'Warm chocolate cake with molten center' },
];
