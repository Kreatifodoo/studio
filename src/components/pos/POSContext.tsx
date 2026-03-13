"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Product, OrderItem, Transaction, Category, AppView, PaymentMethod, 
  Fee, Session, Customer, PriceList, Package, Combo, PromoDiscount, 
  StoreSettings, User, Role 
} from '@/types/pos';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from '@/lib/pos-data';

interface POSContextType {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  view: AppView;
  setView: (view: AppView) => void;
  cart: OrderItem[];
  addToCart: (product: Product) => void;
  addPackageToCart: (pkg: Package) => void;
  addComboToCart: (combo: Combo, selections: OrderItem['comboSelections']) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  history: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  currentSession: Session | null;
  sessions: Session[];
  openSession: (openingCash: number) => void;
  closeSession: (closingCash: number) => void;
  lastClosedSession: Session | null;
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
  promoDiscounts: PromoDiscount[];
  setPromoDiscounts: React.Dispatch<React.SetStateAction<PromoDiscount[]>>;
  storeSettings: StoreSettings;
  setStoreSettings: (settings: StoreSettings) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  roles: Role[];
  currentUser: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  exportDatabase: () => void;
  importDatabase: (json: string) => boolean;
}

const STORAGE_KEY = 'nextpos_database_v1';

const INITIAL_ROLES: Role[] = [
  { id: 'admin', name: 'Administrator', permissions: ['view_pos', 'view_history', 'view_dashboard', 'view_reports', 'manage_products', 'manage_customers', 'manage_settings', 'manage_users'] },
  { id: 'manager', name: 'Manajer', permissions: ['view_pos', 'view_history', 'view_dashboard', 'view_reports', 'manage_products', 'manage_customers'] },
  { id: 'cashier', name: 'Kasir', permissions: ['view_pos', 'view_history'] },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', name: 'Admin Utama', email: 'admin@nextpos.com', roleId: 'admin', status: 'Active', avatarUrl: 'https://picsum.photos/seed/admin/100/100', password: 'password' },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1', name: 'Tunai', icon: 'Banknote', description: 'Pembayaran tunai di laci', enabled: true },
  { id: 'pm_2', name: 'Kartu Debit / Kredit', icon: 'CreditCard', description: 'Visa, Mastercard, GPN', enabled: true },
  { id: 'pm_3', name: 'Dompet Digital (QRIS)', icon: 'Smartphone', description: 'GoPay, OVO, ShopeePay, Dana', enabled: true },
];

const INITIAL_FEES: Fee[] = [
  { id: 'f_1', name: 'PPN 11%', type: 'Tax', value: 11, enabled: true },
  { id: 'f_2', name: 'Biaya Layanan', type: 'Service', value: 2, enabled: true },
];

const INITIAL_STORE_SETTINGS: StoreSettings = {
  name: 'NextPOS Indonesia',
  currencySymbol: 'Rp',
  address: 'Jl. Contoh Alamat No. 123, Jakarta',
  headerNote: 'Terima Kasih Atas Kunjungan Anda!',
  footerNote: 'Barang yang sudah dibeli tidak dapat dikembalikan.',
  logoUrl: ''
};

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [view, setView] = useState<AppView>('pos');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [lastClosedSession, setLastClosedSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [fees, setFees] = useState<Fee[]>(INITIAL_FEES);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [promoDiscounts, setPromoDiscounts] = useState<PromoDiscount[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load Data from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.history) setHistory(data.history);
        if (data.sessions) setSessions(data.sessions);
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
        if (data.paymentMethods) setPaymentMethods(data.paymentMethods);
        if (data.fees) setFees(data.fees);
        if (data.customers) setCustomers(data.customers);
        if (data.priceLists) setPriceLists(data.priceLists);
        if (data.packages) setPackages(data.packages);
        if (data.combos) setCombos(data.combos);
        if (data.promoDiscounts) setPromoDiscounts(data.promoDiscounts);
        if (data.storeSettings) setStoreSettings(data.storeSettings);
        if (data.users) setUsers(data.users);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Auto Save to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      const dataToSave = {
        history, sessions, products, categories, paymentMethods, fees, 
        customers, priceLists, packages, combos, promoDiscounts, 
        storeSettings, users
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [
    isInitialized, history, sessions, products, categories, paymentMethods, 
    fees, customers, priceLists, packages, combos, promoDiscounts, 
    storeSettings, users
  ]);

  const exportDatabase = useCallback(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_pos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const importDatabase = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      localStorage.setItem(STORAGE_KEY, json);
      window.location.reload(); // Reload to apply all imported state
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const login = (username: string, password?: string) => {
    const user = users.find(u => u.username === username && (u.password === password || !password));
    if (user && user.status === 'Active') {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setView('pos');
  };

  const getEffectivePriceInfo = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { price: 0, originalPrice: 0, savings: 0, priceListId: undefined, promoId: undefined };

    const now = new Date();
    let basePrice = product.price;
    let priceListId: string | undefined = undefined;

    const activeList = priceLists.find(pl => 
      pl.enabled && pl.productId === productId &&
      new Date(pl.startDate) <= now && new Date(pl.endDate) >= now
    );

    if (activeList) {
      const tier = activeList.tiers.find(t => quantity >= t.minQty && quantity <= (t.maxQty || Infinity));
      if (tier) {
        basePrice = tier.price;
        priceListId = activeList.id;
      }
    }

    let finalPrice = basePrice;
    let promoId: string | undefined = undefined;
    let savings = 0;

    const activePromo = promoDiscounts.find(pd => 
      pd.enabled && pd.productId === productId &&
      new Date(pd.startDate) <= now && new Date(pd.endDate) >= now
    );

    if (activePromo) {
      promoId = activePromo.id;
      if (activePromo.type === 'Percentage') {
        savings = (basePrice * activePromo.value) / 100;
      } else {
        savings = activePromo.value;
      }
      finalPrice = Math.max(0, basePrice - savings);
    }

    return { price: finalPrice, originalPrice: basePrice, savings, priceListId, promoId };
  }, [products, priceLists, promoDiscounts]);

  const openSession = (openingCash: number) => {
    setCurrentSession({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      startTime: new Date().toISOString(),
      openingCash,
      status: 'Open',
      transactionIds: []
    });
    setLastClosedSession(null);
  };

  const closeSession = (closingCash: number) => {
    if (!currentSession) return;
    const closed: Session = { ...currentSession, endTime: new Date().toISOString(), closingCash, status: 'Closed' };
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
        const { price, originalPrice, savings, priceListId, promoId } = getEffectivePriceInfo(product.id, newQty);
        return prev.map(item => (item.productId === product.id && !item.isPackage && !item.isCombo) ? { ...item, quantity: newQty, price, originalPrice, promoSavings: savings, priceListId, promoId } : item);
      }
      const { price, originalPrice, savings, priceListId, promoId } = getEffectivePriceInfo(product.id, 1);
      return [...prev, { id: Math.random().toString(36).substr(2, 9), productId: product.id, name: product.name, price, originalPrice, promoSavings: savings, quantity: 1, priceListId, promoId, isPackage: false, isCombo: false }];
    });
  };

  const addPackageToCart = (pkg: Package) => {
    if (!pkg.enabled || !currentSession) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === pkg.id && item.isPackage);
      if (existing) return prev.map(item => (item.productId === pkg.id && item.isPackage) ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id: Math.random().toString(36).substr(2, 9), productId: pkg.id, name: pkg.name, price: pkg.price, originalPrice: pkg.price, promoSavings: 0, quantity: 1, isPackage: true, isCombo: false }];
    });
  };

  const addComboToCart = (combo: Combo, selections: OrderItem['comboSelections']) => {
    if (!combo.enabled || !currentSession) return;
    const extraTotal = (selections || []).reduce((acc, s) => acc + s.extraPrice, 0);
    const finalPrice = combo.basePrice + extraTotal;
    setCart(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), productId: combo.id, name: combo.name, price: finalPrice, originalPrice: finalPrice, promoSavings: 0, quantity: 1, isPackage: false, isCombo: true, comboSelections: selections }]);
  };

  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(item => item.id !== itemId));

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (item.isPackage || item.isCombo) return { ...item, quantity: newQty };
        const product = products.find(p => p.id === item.productId);
        if (product && newQty > product.onHandQty) return item;
        const { price, originalPrice, savings, priceListId, promoId } = getEffectivePriceInfo(item.productId, newQty);
        return { ...item, quantity: newQty, price, originalPrice, promoSavings: savings, priceListId, promoId };
      }
      return item;
    }));
  };

  const updateNote = (itemId: string, note: string) => setCart(prev => prev.map(item => item.id === itemId ? { ...item, note } : item));
  const clearCart = () => { setCart([]); setSelectedCustomerId(null); };

  const addTransaction = (t: Transaction) => {
    setHistory(prev => [t, ...prev]);
    setProducts(prevProducts => {
      let updated = [...prevProducts];
      t.items.forEach(item => {
        if (item.isPackage) {
          const pkg = packages.find(p => p.id === item.productId);
          pkg?.items.forEach(pkgItem => { updated = updated.map(p => p.id === pkgItem.productId ? { ...p, onHandQty: p.onHandQty - (pkgItem.quantity * item.quantity) } : p); });
        } else if (item.isCombo) {
          item.comboSelections?.forEach(sel => { updated = updated.map(p => p.id === sel.productId ? { ...p, onHandQty: p.onHandQty - item.quantity } : p); });
        } else {
          updated = updated.map(p => p.id === item.productId ? { ...p, onHandQty: p.onHandQty - item.quantity } : p);
        }
      });
      return updated;
    });
    setCurrentSession(prev => prev ? { ...prev, transactionIds: [...prev.transactionIds, t.id] } : null);
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    setCustomers(prev => [...prev, { id, ...customer }]);
    return id;
  };

  return (
    <POSContext.Provider value={{
      activeCategory, setActiveCategory, searchQuery, setSearchQuery, cart, addToCart, addPackageToCart, addComboToCart, removeFromCart, updateQuantity, updateNote, clearCart,
      selectedCustomerId, setSelectedCustomerId, history, addTransaction, currentSession, sessions, openSession, closeSession, lastClosedSession, view, setView,
      products, setProducts, categories, setCategories, paymentMethods, setPaymentMethods, fees, setFees, customers, setCustomers, addCustomer,
      priceLists, setPriceLists, packages, setPackages, combos, setCombos, promoDiscounts, setPromoDiscounts, storeSettings, setStoreSettings,
      users, setUsers, roles: INITIAL_ROLES, currentUser, login, logout, exportDatabase, importDatabase
    }}>
      {children}
    </POSContext.Provider>
  );
}

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS harus digunakan di dalam POSProvider');
  return context;
};
