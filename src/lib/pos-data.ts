
import { Product, Category } from '@/types/pos';
import { PlaceHolderImages } from './placeholder-images';

export const CATEGORIES: Category[] = ['All', 'Main Course', 'Drinks', 'Snacks', 'Desserts'];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/default/400/300';

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Classic Burger', price: 12.50, category: 'Main Course', image: getImage('item-burger'), available: true, description: 'Juicy beef patty with special sauce' },
  { id: '2', name: 'Pepperoni Pizza', price: 18.00, category: 'Main Course', image: getImage('item-pizza'), available: true, description: 'Traditional Italian style with fresh pepperoni' },
  { id: '3', name: 'Garden Salad', price: 8.50, category: 'Snacks', image: getImage('item-salad'), available: true, description: 'Mix of seasonal fresh greens' },
  { id: '4', name: 'Coca Cola', price: 3.50, category: 'Drinks', image: getImage('item-coke'), available: true, description: 'Chilled refreshing soda' },
  { id: '5', name: 'Caramel Latte', price: 5.50, category: 'Drinks', image: getImage('item-coffee'), available: true, description: 'Rich espresso with caramel and steamed milk' },
  { id: '6', name: 'French Fries', price: 4.50, category: 'Snacks', image: getImage('item-fries'), available: true, description: 'Crispy salted golden fries' },
  { id: '7', name: 'Spaghetti Carbonara', price: 14.50, category: 'Main Course', image: getImage('item-pasta'), available: true, description: 'Classic creamy pasta with pancetta' },
  { id: '8', name: 'Lava Cake', price: 7.50, category: 'Desserts', image: getImage('item-cake'), available: true, description: 'Warm chocolate cake with molten center' },
];
