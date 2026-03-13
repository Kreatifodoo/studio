
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, OrderItem, Transaction, Category, AppView, PaymentMethod, Fee, Session, Customer, PriceList, Package, Combo } from '@/types/pos';
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
  addPackageToCart: (pkg: Package) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  
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
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  addCustomer: (customer: Omit<Customer, 'id'>) => string;
  priceLists: PriceList[];
  setPriceLists: React.Dispatch<React.SetStateAction<PriceList[]>>;
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  combos: Combo[];
  setCombos: React.Dispatch<React.SetStateAction<Combo[]>>;
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Session State
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [lastClosedSession, setLastClosedSession] = useState<Session | null>(null);

  // Master Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [fees, setFees] = useState<Fee[]>(INITIAL_FEES);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);

  const getEffectivePriceInfo = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { price: 0, priceListId: undefined };

    const now = new Date();
    const activeList = priceLists.find(pl => 
      pl.enabled && 
      pl.productId === productId &&
      new Date(pl.startDate) <= now &&
      new Date(pl.endDate) >= now
    );

    if (activeList) {
      const tier = activeList.tiers.find(t => quantity >= t.minQty && quantity <= t.maxQty);
      if (tier) return { price: tier.price, priceListId: activeList.id };
    }

    return { price: product.price, priceListId: undefined };
  }, [products, priceLists]);

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
    
    const existingInCart = cart.find(item => item.productId === product.id && !item.isPackage && !item.isCombo);
    const qtyInCart = existingInCart ? existingInCart.quantity : 0;
    
    if (qtyInCart >= product.onHandQty) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && !item.isPackage && !item.isCombo);
      if (existing) {
        const newQty = existing.quantity + 1;
        const { price: newPrice, priceListId } = getEffectivePriceInfo(product.id, newQty);
        return prev.map(item =>
          (item.productId === product.id && !item.isPackage && !item.isCombo) ? { ...item, quantity: newQty, price: newPrice, priceListId } : item
        );
      }
      const { price: initialPrice, priceListId } = getEffectivePriceInfo(product.id, 1);
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        price: initialPrice,
        quantity: 1,
        priceListId,
        isPackage: false,
        isCombo: false
      }];
    });
  };

  const addPackageToCart = (pkg: Package) => {
    if (!pkg.enabled || !currentSession) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === pkg.id && item.isPackage);
      if (existing) {
        return prev.map(item =>
          (item.productId === pkg.id && item.isPackage) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        productId: pkg.id,
        name: pkg.name,
        price: pkg.price,
        quantity: 1,
        isPackage: true,
        isCombo: false
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
        
        if (item.isPackage || item.isCombo) {
          return { ...item, quantity: newQty };
        } else {
          const product = products.find(p => p.id === item.productId);
          if (product && newQty > product.onHandQty) return item;
          
          const { price: newPrice, priceListId } = getEffectivePriceInfo(item.productId, newQty);
          return { ...item, quantity: newQty, price: newPrice, priceListId };
        }
      }
      return item;
    }));
  };

  const updateNote = (itemId: string, note: string) => {
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, note } : item));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId(null);
  };

  const addTransaction = (t: Transaction) => {
    setHistory(prev => [t, ...prev]);
    
    // Decrease stock for products and package components
    setProducts(prevProducts => {
      let updatedProducts = [...prevProducts];
      
      t.items.forEach(item => {
        if (item.isPackage) {
          const pkg = packages.find(p => p.id === item.productId);
          if (pkg) {
            pkg.items.forEach(pkgItem => {
              updatedProducts = updatedProducts.map(p => {
                if (p.id === pkgItem.productId) {
                  return { ...p, onHandQty: p.onHandQty - (pkgItem.quantity * item.quantity) };
                }
                return p;
              });
            });
          }
        } else if (item.isCombo) {
          // Future: decrease stock for combo selections
          if (item.comboSelections) {
            item.comboSelections.forEach(sel => {
              updatedProducts = updatedProducts.map(p => {
                if (p.id === sel.productId) {
                  return { ...p, onHandQty: p.onHandQty - item.quantity };
                }
                return p;
              });
            });
          }
        } else {
          updatedProducts = updatedProducts.map(p => {
            if (p.id === item.productId) {
              return { ...p, onHandQty: p.onHandQty - item.quantity };
            }
            return p;
          });
        }
      });
      
      return updatedProducts;
    });

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        transactionIds: [...prev.transactionIds, t.id]
      };
    });
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newCustomer: Customer = { id, ...customer };
    setCustomers(prev => [...prev, newCustomer]);
    return id;
  };

  return (
    <POSContext.Provider value={{
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      cart, addToCart, addPackageToCart, removeFromCart, updateQuantity, updateNote, clearCart,
      selectedCustomerId, setSelectedCustomerId,
      history, addTransaction,
      currentSession, sessions, openSession, closeSession, lastClosedSession,
      view, setView,
      products, setProducts,
      categories, setCategories,
      paymentMethods, setPaymentMethods,
      fees, setFees,
      customers, setCustomers, addCustomer,
      priceLists, setPriceLists,
      packages, setPackages,
      combos, setCombos
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
