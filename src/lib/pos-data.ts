import { Product, Category } from '@/types/pos';
import { PlaceHolderImages } from './placeholder-images';

export const CATEGORIES: Category[] = ['Semua', 'Paket', 'Makanan Utama', 'Minuman', 'Camilan', 'Pencuci Mulut'];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || 'https://picsum.photos/seed/default/400/300';

export const PRODUCTS: Product[] = [
  { id: '1', sku: 'MU-001', barcode: '8880001', name: 'Nasi Goreng Spesial', price: 25000, costPrice: 12000, category: 'Makanan Utama', image: getImage('item-burger'), available: true, onHandQty: 50, description: 'Nasi goreng dengan telur, ayam, dan kerupuk' },
  { id: '2', sku: 'MU-002', barcode: '8880002', name: 'Mie Goreng Jawa', price: 22000, costPrice: 10000, category: 'Makanan Utama', image: getImage('item-pizza'), available: true, onHandQty: 30, description: 'Mie goreng khas Jawa dengan bumbu rempah' },
  { id: '3', sku: 'CM-001', barcode: '8880003', name: 'Salad Buah Segar', price: 15000, costPrice: 7000, category: 'Camilan', image: getImage('item-salad'), available: true, onHandQty: 25, description: 'Potongan buah segar dengan saus mayo' },
  { id: '4', sku: 'MN-001', barcode: '8880004', name: 'Es Teh Manis', price: 5000, costPrice: 1500, category: 'Minuman', image: getImage('item-coke'), available: true, onHandQty: 100, description: 'Teh seduh dengan gula asli' },
  { id: '5', sku: 'MN-002', barcode: '8880005', name: 'Kopi Susu Gula Aren', price: 18000, costPrice: 8000, category: 'Minuman', image: getImage('item-coffee'), available: true, onHandQty: 40, description: 'Espresso dengan susu dan gula aren murni' },
  { id: '6', sku: 'CM-002', barcode: '8880006', name: 'Kentang Goreng', price: 12000, costPrice: 5000, category: 'Camilan', image: getImage('item-fries'), available: true, onHandQty: 80, description: 'Kentang goreng renyah dengan saus sambal' },
  { id: '7', sku: 'MU-003', barcode: '8880007', name: 'Ayam Bakar Madu', price: 35000, costPrice: 18000, category: 'Makanan Utama', image: getImage('item-pasta'), available: true, onHandQty: 20, description: 'Ayam bakar dengan bumbu madu spesial' },
  { id: '8', sku: 'PM-001', barcode: '8880008', name: 'Pisang Goreng Keju', price: 15000, costPrice: 6000, category: 'Pencuci Mulut', image: getImage('item-cake'), available: true, onHandQty: 15, description: 'Pisang goreng hangat dengan parutan keju' },
];
