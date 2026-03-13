
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Transaction, Category, AppView, PaymentMethod, Fee, Session } from '@/types/pos';
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
  
  // History & Sessions
  history: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  currentSession: Session | null;
  sessions: Session[];
  openSession: (openingCash: number) => void;
  closeSession: (closingCash: number) => void;
  lastClosedSession: Session | null;

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
  
  // Session State
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [lastClosedSession, setLastClosedSession] = useState<Session | null>(null);

  // Master Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [fees, setFees] = useState<Fee[]>(INITIAL_FEES);

  const openSession = (openingCash: number) => {
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      startTime: new Date().toISOString(),
      openingCash,
      status: 'Open',
      transactionIds: []
    };
    setCurrentSession(newSession);
    setLastClosedSession(null);
  };

  const closeSession = (closingCash: number) => {
    if (!currentSession) return;
    const closed: Session = {
      ...currentSession,
      endTime: new Date().toISOString(),
      closingCash,
      status: 'Closed'
    };
    setSessions(prev => [closed, ...prev]);
    setLastClosedSession(closed);
    setCurrentSession(null);
    setView('reports');
  };

  const addToCart = (product: Product) => {
    if (!product.available || !currentSession) return;
    
    // Check current stock including what is already in cart
    const existingInCart = cart.find(item => item.productId === product.id);
    const qtyInCart = existingInCart ? existingInCart.quantity : 0;
    
    if (qtyInCart >= product.onHandQty) {
      // Out of stock
      return;
    }

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
        const product = products.find(p => p.id === item.productId);
        const newQty = Math.max(1, item.quantity + delta);
        
        // Check stock
        if (product && newQty > product.onHandQty) {
          return item;
        }
        
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
    // Add to history
    setHistory(prev => [t, ...prev]);
    
    // Update stock
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const orderItem = t.items.find(item => item.productId === p.id);
        if (orderItem) {
          return {
            ...p,
            onHandQty: p.onHandQty - orderItem.quantity
          };
        }
        return p;
      });
    });

    // Update session
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        transactionIds: [...prev.transactionIds, t.id]
      };
    });
  };

  return (
    <POSContext.Provider value={{
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      cart, addToCart, removeFromCart, updateQuantity, updateNote, clearCart,
      history, addTransaction,
      currentSession, sessions, openSession, closeSession, lastClosedSession,
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
