
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Transaction, Category, AppView, PaymentMethod, Fee } from '@/types/pos';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from '@/lib/pos-data';

interface POSContextType {
  // Navigation & UI
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  view: AppView;
  setView: (view: AppView) => void;
  
  // Cart & Orders
  cart: OrderItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  
  // History
  history: Transaction[];
  addTransaction: (transaction: Transaction) => void;

  // Master Data
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  fees: Fee[];
  setFees: React.Dispatch<React.SetStateAction<Fee[]>>;
}

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1', name: 'Credit / Debit Card', icon: 'CreditCard', description: 'Visa, Mastercard, Amex', enabled: true },
  { id: 'pm_2', name: 'Digital Wallet', icon: 'Smartphone', description: 'Apple Pay, Google Pay', enabled: true },
  { id: 'pm_3', name: 'Cash', icon: 'Banknote', description: 'Payment at counter', enabled: true },
];

const INITIAL_FEES: Fee[] = [
  { id: 'f_1', name: 'Tax', type: 'Tax', value: 10, enabled: true },
  { id: 'f_2', name: 'Service Charge', type: 'Service', value: 5, enabled: true },
];

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [view, setView] = useState<AppView>('pos');

  // Master Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [fees, setFees] = useState<Fee[]>(INITIAL_FEES);

  const addToCart = (product: Product) => {
    if (!product.available) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateNote = (itemId: string, note: string) => {
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, note } : item));
  };

  const clearCart = () => setCart([]);

  const addTransaction = (t: Transaction) => {
    setHistory(prev => [t, ...prev]);
  };

  return (
    <POSContext.Provider value={{
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      cart, addToCart, removeFromCart, updateQuantity, updateNote, clearCart,
      history, addTransaction,
      view, setView,
      products, setProducts,
      categories, setCategories,
      paymentMethods, setPaymentMethods,
      fees, setFees
    }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within POSProvider');
  return context;
}
