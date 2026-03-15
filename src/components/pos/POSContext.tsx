
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Product, OrderItem, Transaction, Category, AppView, PaymentMethod, 
  Fee, Session, Customer, PriceList, Package, Combo, PromoDiscount, 
  StoreSettings, User, Role, Permission, PrinterConfig 
} from '@/types/pos';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from '@/lib/pos-data';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

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
  setProducts: (products: Product[]) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  fees: Fee[];
  setFees: (fees: Fee[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => string;
  priceLists: PriceList[];
  setPriceLists: (priceLists: PriceList[]) => void;
  packages: Package[];
  setPackages: (packages: Package[]) => void;
  combos: Combo[];
  setCombos: (combos: Combo[]) => void;
  promoDiscounts: PromoDiscount[];
  setPromoDiscounts: (promos: PromoDiscount[]) => void;
  storeSettings: StoreSettings;
  setStoreSettings: (settings: StoreSettings) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  roles: Role[];
  currentUser: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  checkPermission: (permission: Permission) => boolean;
  exportDatabase: () => Promise<void>;
  importDatabase: (json: string) => Promise<boolean>;
  isDbLoaded: boolean;
  printer: PrinterConfig;
  connectPrinter: () => Promise<void>;
  disconnectPrinter: () => void;
  printViaBluetooth: (transaction: Transaction) => Promise<boolean>;
  printSessionSummaryViaBluetooth: (session: Session) => Promise<boolean>;
  printBarcodeViaBluetooth: (product: Product) => Promise<boolean>;
}

const INITIAL_ROLES: Role[] = [
  { id: 'admin', name: 'Administrator', permissions: ['view_pos', 'view_history', 'view_dashboard', 'view_reports', 'manage_products', 'manage_customers', 'manage_settings', 'manage_users'] },
  { id: 'cashier', name: 'Kasir', permissions: ['view_pos', 'view_history', 'manage_customers'] },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', name: 'Admin Utama', roleId: 'admin', status: 'Active', password: 'password' },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1', name: 'Tunai', icon: 'Banknote', description: 'Pembayaran tunai di laci', enabled: true },
  { id: 'pm_2', name: 'Dompet Digital (QRIS)', icon: 'Smartphone', description: 'GoPay, OVO, Dana, QRIS', enabled: true },
];

const INITIAL_FEES: Fee[] = [
  { id: 'f_1', name: 'PPN 11%', type: 'Tax', value: 11, enabled: true },
];

const INITIAL_STORE_SETTINGS: StoreSettings = {
  name: 'Kompak POS',
  currencySymbol: 'Rp',
  address: 'Sistem POS Lokal Enterprise',
  headerNote: 'Terima Kasih!',
  footerNote: 'Simpan struk ini sebagai bukti pembayaran.',
  logoUrl: ''
};

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [view, setView] = useState<AppView>('pos');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [printer, setPrinter] = useState<PrinterConfig>({ name: null, status: 'disconnected', type: 'system' });
  const [lastClosedSession, setLastClosedSession] = useState<Session | null>(null);

  // Dexie Reactive Queries
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const history = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray()) || [];
  const sessions = useLiveQuery(() => db.sessions.orderBy('startTime').reverse().toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const paymentMethods = useLiveQuery(() => db.paymentMethods.toArray()) || [];
  const fees = useLiveQuery(() => db.fees.toArray()) || [];
  const users = useLiveQuery(() => db.users.toArray()) || [];
  const priceLists = useLiveQuery(() => db.priceLists.toArray()) || [];
  const packages = useLiveQuery(() => db.packages.toArray()) || [];
  const combos = useLiveQuery(() => db.combos.toArray()) || [];
  const promoDiscounts = useLiveQuery(() => db.promoDiscounts.toArray()) || [];
  const storeSettingsData = useLiveQuery(() => db.config.get('storeSettings'));
  
  const storeSettings = storeSettingsData?.value || INITIAL_STORE_SETTINGS;
  const currentSession = sessions.find(s => s.status === 'Open') || null;

  useEffect(() => {
    async function initDb() {
      try {
        const prodCount = await db.products.count();
        if (prodCount === 0) {
          await db.products.bulkPut(INITIAL_PRODUCTS);
          await db.users.bulkPut(INITIAL_USERS);
          await db.paymentMethods.bulkPut(INITIAL_PAYMENT_METHODS);
          await db.fees.bulkPut(INITIAL_FEES);
          await db.config.put({ key: 'storeSettings', value: INITIAL_STORE_SETTINGS });
        }

        const savedUserId = localStorage.getItem('pos_current_user_id');
        if (savedUserId) {
          const user = await db.users.get(savedUserId);
          if (user) setCurrentUser(user);
        }
      } catch (e) {
        console.error("Gagal inisialisasi database lokal:", e);
      } finally {
        setIsDbLoaded(true);
      }
    }
    initDb();
  }, []);

  const connectPrinter = async () => {
    setPrinter({ name: 'Printer Bluetooth Lokal', status: 'connected', type: 'bluetooth' });
  };

  const disconnectPrinter = () => {
    setPrinter({ name: null, status: 'disconnected', type: 'system' });
  };

  const setProducts = useCallback((data: Product[]) => db.products.clear().then(() => db.products.bulkPut(data)), []);
  const setCategories = useCallback((data: Category[]) => db.config.put({ key: 'categories', value: data }), []);
  const setPaymentMethods = useCallback((data: PaymentMethod[]) => db.paymentMethods.clear().then(() => db.paymentMethods.bulkPut(data)), []);
  const setFees = useCallback((data: Fee[]) => db.fees.clear().then(() => db.fees.bulkPut(data)), []);
  const setCustomers = useCallback((data: Customer[]) => db.customers.clear().then(() => db.customers.bulkPut(data)), []);
  const setPriceLists = useCallback((data: PriceList[]) => db.priceLists.clear().then(() => db.priceLists.bulkPut(data)), []);
  const setPackages = useCallback((data: Package[]) => db.packages.clear().then(() => db.packages.bulkPut(data)), []);
  const setCombos = useCallback((data: Combo[]) => db.combos.clear().then(() => db.combos.bulkPut(data)), []);
  const setPromoDiscounts = useCallback((data: PromoDiscount[]) => db.promoDiscounts.clear().then(() => db.promoDiscounts.bulkPut(data)), []);
  const setStoreSettings = useCallback((data: StoreSettings) => db.config.put({ key: 'storeSettings', value: data }), []);
  const setUsers = useCallback((data: User[]) => db.users.clear().then(() => db.users.bulkPut(data)), []);

  const exportDatabase = async () => {
    const data = {
      products: await db.products.toArray(),
      transactions: await db.transactions.toArray(),
      sessions: await db.sessions.toArray(),
      users: await db.users.toArray(),
      customers: await db.customers.toArray(),
      paymentMethods: await db.paymentMethods.toArray(),
      fees: await db.fees.toArray(),
      priceLists: await db.priceLists.toArray(),
      packages: await db.packages.toArray(),
      combos: await db.combos.toArray(),
      promoDiscounts: await db.promoDiscounts.toArray(),
      config: await db.config.toArray(),
      exportedAt: new Date().toISOString(),
      app: 'Kompak POS Enterprise'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KOMPAK_POS_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = async (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.app !== 'Kompak POS Enterprise') throw new Error('Format file tidak valid');
      
      await db.transaction('rw', db.products, db.transactions, db.sessions, db.users, db.customers, db.paymentMethods, db.fees, db.priceLists, db.packages, db.combos, db.promoDiscounts, db.config, async () => {
        await db.resetDatabase();
        if (data.products) await db.products.bulkPut(data.products);
        if (data.transactions) await db.transactions.bulkPut(data.transactions);
        if (data.sessions) await db.sessions.bulkPut(data.sessions);
        if (data.users) await db.users.bulkPut(data.users);
        if (data.customers) await db.customers.bulkPut(data.customers);
        if (data.paymentMethods) await db.paymentMethods.bulkPut(data.paymentMethods);
        if (data.fees) await db.fees.bulkPut(data.fees);
        if (data.priceLists) await db.priceLists.bulkPut(data.priceLists);
        if (data.packages) await db.packages.bulkPut(data.packages);
        if (data.combos) await db.combos.bulkPut(data.combos);
        if (data.promoDiscounts) await db.promoDiscounts.bulkPut(data.promoDiscounts);
        if (data.config) await db.config.bulkPut(data.config);
      });
      window.location.reload();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const login = (username: string, password?: string) => {
    const user = users.find(u => u.username === username && (u.password === password || !password));
    if (user && user.status === 'Active') {
      setCurrentUser(user);
      localStorage.setItem('pos_current_user_id', user.id);
      return true;
    }
    return false;
  };

  const logout = () => { 
    setCurrentUser(null); 
    localStorage.removeItem('pos_current_user_id');
    setCart([]); 
    setView('pos'); 
  };

  const checkPermission = useCallback((permission: Permission) => {
    if (!currentUser) return false;
    const role = INITIAL_ROLES.find(r => r.id === currentUser.roleId);
    return role?.permissions.includes(permission) || false;
  }, [currentUser]);

  const openSession = async (openingCash: number) => {
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      startTime: new Date().toISOString(),
      openingCash,
      status: 'Open',
      transactionIds: []
    };
    await db.sessions.put(newSession);
  };

  const closeSession = async (closingCash: number) => {
    if (!currentSession) return;
    const closed: Session = { ...currentSession, endTime: new Date().toISOString(), closingCash, status: 'Closed' };
    await db.sessions.put(closed);
    setLastClosedSession(closed);
    setView('reports');
  };

  const getTieredPrice = useCallback((productId: string, quantity: number, basePrice: number) => {
    const now = new Date();
    const activePricelist = priceLists.find(pl => 
      pl.enabled && 
      new Date(pl.startDate) <= now &&
      (!pl.endDate || new Date(pl.endDate) >= now) &&
      pl.items.some(item => item.productId === productId)
    );

    if (!activePricelist) return basePrice;
    const productItem = activePricelist.items.find(item => item.productId === productId);
    if (!productItem) return basePrice;

    const sortedTiers = [...productItem.tiers].sort((a, b) => b.minQty - a.minQty);
    const matchingTier = sortedTiers.find(t => quantity >= t.minQty);
    return matchingTier ? matchingTier.price : basePrice;
  }, [priceLists]);

  const addToCart = (product: Product) => {
    if (!product.available || !currentSession) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && !item.isPackage && !item.isCombo);
      if (existing) {
        const newQty = existing.quantity + 1;
        const tieredPrice = getTieredPrice(product.id, newQty, product.price);
        return prev.map(item => (item.productId === product.id && !item.isPackage && !item.isCombo) ? { ...item, quantity: newQty, price: tieredPrice } : item);
      }
      const tieredPrice = getTieredPrice(product.id, 1, product.price);
      return [...prev, { id: Math.random().toString(36).substr(2, 9), productId: product.id, name: product.name, price: tieredPrice, originalPrice: product.price, promoSavings: 0, quantity: 1, isPackage: false, isCombo: false }];
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
        if (!item.isPackage && !item.isCombo) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const tieredPrice = getTieredPrice(product.id, newQty, product.price);
            return { ...item, quantity: newQty, price: tieredPrice };
          }
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateNote = (itemId: string, note: string) => setCart(prev => prev.map(item => item.id === itemId ? { ...item, note } : item));
  const clearCart = () => { setCart([]); setSelectedCustomerId(null); };

  const addTransaction = async (t: Transaction) => {
    try {
      await db.transaction('rw', db.transactions, db.products, db.sessions, async () => {
        await db.transactions.put(t);
        for (const item of t.items) {
          if (!item.isPackage && !item.isCombo) {
            const product = await db.products.get(item.productId);
            if (product) {
              await db.products.update(product.id, { onHandQty: product.onHandQty - item.quantity });
            }
          }
        }
        if (currentSession) {
          const updatedSession = { ...currentSession, transactionIds: [...currentSession.transactionIds, t.id] };
          await db.sessions.put(updatedSession);
        }
      });
    } catch (error) {
      console.error("Gagal memproses transaksi lokal:", error);
    }
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newCust = { id, ...customer };
    db.customers.put(newCust);
    return id;
  };

  return (
    <POSContext.Provider value={{
      activeCategory, setActiveCategory, searchQuery, setSearchQuery, cart, addToCart, addPackageToCart, addComboToCart, removeFromCart, updateQuantity, updateNote, clearCart,
      selectedCustomerId, setSelectedCustomerId, history, addTransaction, currentSession, sessions, openSession, closeSession, lastClosedSession, view, setView,
      products, setProducts, categories: INITIAL_CATEGORIES, setCategories, paymentMethods, setPaymentMethods, fees, setFees, customers, setCustomers, addCustomer,
      priceLists, setPriceLists, packages, setPackages, combos, setCombos, promoDiscounts, setPromoDiscounts, storeSettings, setStoreSettings,
      users, setUsers, roles: INITIAL_ROLES, currentUser, login, logout, checkPermission, exportDatabase, importDatabase, isDbLoaded,
      printer, connectPrinter, disconnectPrinter, printViaBluetooth: async () => true, printSessionSummaryViaBluetooth: async () => true, printBarcodeViaBluetooth: async () => true
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
