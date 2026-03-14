
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Product, OrderItem, Transaction, Category, AppView, PaymentMethod, 
  Fee, Session, Customer, PriceList, Package, Combo, PromoDiscount, 
  StoreSettings, User, Role, Permission 
} from '@/types/pos';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from '@/lib/pos-data';
import { db } from '@/lib/db';

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
}

const INITIAL_ROLES: Role[] = [
  { id: 'admin', name: 'Administrator', permissions: ['view_pos', 'view_history', 'view_dashboard', 'view_reports', 'manage_products', 'manage_customers', 'manage_settings', 'manage_users'] },
  { id: 'manager', name: 'Manajer', permissions: ['view_pos', 'view_history', 'view_dashboard', 'view_reports', 'manage_products', 'manage_customers'] },
  { id: 'cashier', name: 'Kasir', permissions: ['view_pos', 'view_history', 'manage_customers'] },
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
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [view, setView] = useState<AppView>('pos');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [lastClosedSession, setLastClosedSession] = useState<Session | null>(null);
  const [products, setProductsState] = useState<Product[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethodsState] = useState<PaymentMethod[]>([]);
  const [fees, setFeesState] = useState<Fee[]>([]);
  const [customers, setCustomersState] = useState<Customer[]>([]);
  const [priceLists, setPriceListsState] = useState<PriceList[]>([]);
  const [packages, setPackagesState] = useState<Package[]>([]);
  const [combos, setCombosState] = useState<Combo[]>([]);
  const [promoDiscounts, setPromoDiscountsState] = useState<PromoDiscount[]>([]);
  const [storeSettings, setStoreSettingsState] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [users, setUsersState] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function initDb() {
      try {
        const [
          dbProducts, dbHistory, dbSessions, dbUsers, dbCustomers, 
          dbPM, dbFees, dbPL, dbPkgs, dbCombos, dbPromos, dbSettings
        ] = await Promise.all([
          db.products.toArray(),
          db.transactions.orderBy('date').reverse().toArray(),
          db.sessions.orderBy('startTime').reverse().toArray(),
          db.users.toArray(),
          db.customers.toArray(),
          db.paymentMethods.toArray(),
          db.fees.toArray(),
          db.priceLists.toArray(),
          db.packages.toArray(),
          db.combos.toArray(),
          db.promoDiscounts.toArray(),
          db.config.get('storeSettings')
        ]);

        if (dbProducts.length > 0) setProductsState(dbProducts); else setProductsState(INITIAL_PRODUCTS);
        if (dbHistory.length > 0) setHistory(dbHistory);
        if (dbSessions.length > 0) setSessions(dbSessions);
        if (dbUsers.length > 0) setUsersState(dbUsers); else setUsersState(INITIAL_USERS);
        if (dbCustomers.length > 0) setCustomersState(dbCustomers);
        if (dbPM.length > 0) setPaymentMethodsState(dbPM); else setPaymentMethodsState(INITIAL_PAYMENT_METHODS);
        if (dbFees.length > 0) setFeesState(dbFees); else setFeesState(INITIAL_FEES);
        setPriceListsState(dbPL);
        setPackagesState(dbPkgs);
        setCombosState(dbCombos);
        setPromoDiscountsState(dbPromos);
        if (dbSettings) setStoreSettingsState(dbSettings.value);

        setIsDbLoaded(true);
      } catch (e) {
        console.error("Gagal inisialisasi database", e);
        setIsDbLoaded(true);
      }
    }
    initDb();
  }, []);

  const setProducts = useCallback((data: Product[]) => { setProductsState(data); db.products.clear().then(() => db.products.bulkPut(data)); }, []);
  const setCategories = useCallback((data: Category[]) => { setCategoriesState(data); db.config.put({ key: 'categories', value: data }); }, []);
  const setPaymentMethods = useCallback((data: PaymentMethod[]) => { setPaymentMethodsState(data); db.paymentMethods.clear().then(() => db.paymentMethods.bulkPut(data)); }, []);
  const setFees = useCallback((data: Fee[]) => { setFeesState(data); db.fees.clear().then(() => db.fees.bulkPut(data)); }, []);
  const setCustomers = useCallback((data: Customer[]) => { setCustomersState(data); db.customers.clear().then(() => db.customers.bulkPut(data)); }, []);
  const setPriceLists = useCallback((data: PriceList[]) => { setPriceListsState(data); db.priceLists.clear().then(() => db.priceLists.bulkPut(data)); }, []);
  const setPackages = useCallback((data: Package[]) => { setPackagesState(data); db.packages.clear().then(() => db.packages.bulkPut(data)); }, []);
  const setCombos = useCallback((data: Combo[]) => { setCombosState(data); db.combos.clear().then(() => db.combos.bulkPut(data)); }, []);
  const setPromoDiscounts = useCallback((data: PromoDiscount[]) => { setPromoDiscountsState(data); db.promoDiscounts.clear().then(() => db.promoDiscounts.bulkPut(data)); }, []);
  const setStoreSettings = useCallback((data: StoreSettings) => { setStoreSettingsState(data); db.config.put({ key: 'storeSettings', value: data }); }, []);
  const setUsers = useCallback((data: User[]) => { setUsersState(data); db.users.clear().then(() => db.users.bulkPut(data)); }, []);

  const exportDatabase = useCallback(async () => {
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
      config: await db.config.toArray()
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_pos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const importDatabase = useCallback(async (json: string) => {
    try {
      const data = JSON.parse(json);
      await Promise.all([
        db.products.clear().then(() => db.products.bulkPut(data.products || [])),
        db.transactions.clear().then(() => db.transactions.bulkPut(data.transactions || [])),
        db.sessions.clear().then(() => db.sessions.bulkPut(data.sessions || [])),
        db.users.clear().then(() => db.users.bulkPut(data.users || [])),
        db.customers.clear().then(() => db.customers.bulkPut(data.customers || [])),
        db.paymentMethods.clear().then(() => db.paymentMethods.bulkPut(data.paymentMethods || [])),
        db.fees.clear().then(() => db.fees.bulkPut(data.fees || [])),
        db.priceLists.clear().then(() => db.priceLists.bulkPut(data.priceLists || [])),
        db.packages.clear().then(() => db.packages.bulkPut(data.packages || [])),
        db.combos.clear().then(() => db.combos.bulkPut(data.combos || [])),
        db.promoDiscounts.clear().then(() => db.promoDiscounts.bulkPut(data.promoDiscounts || [])),
        db.config.clear().then(() => db.config.bulkPut(data.config || []))
      ]);
      window.location.reload();
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

  const logout = () => { setCurrentUser(null); setCart([]); setView('pos'); };

  const checkPermission = useCallback((permission: Permission) => {
    if (!currentUser) return false;
    const role = INITIAL_ROLES.find(r => r.id === currentUser.roleId);
    return role?.permissions.includes(permission) || false;
  }, [currentUser]);

  const getEffectivePriceInfo = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { price: 0, originalPrice: 0, savings: 0, priceListId: undefined, promoId: undefined };
    const now = new Date();
    let basePrice = product.price;
    let priceListId: string | undefined = undefined;
    const activeList = priceLists.find(pl => pl.enabled && pl.productId === productId && new Date(pl.startDate) <= now && new Date(pl.endDate) >= now);
    if (activeList) {
      const tier = activeList.tiers.find(t => quantity >= t.minQty && quantity <= (t.maxQty || Infinity));
      if (tier) { basePrice = tier.price; priceListId = activeList.id; }
    }
    let finalPrice = basePrice;
    let promoId: string | undefined = undefined;
    let savings = 0;
    const activePromo = promoDiscounts.find(pd => pd.enabled && pd.productId === productId && new Date(pd.startDate) <= now && new Date(pd.endDate) >= now);
    if (activePromo) {
      promoId = activePromo.id;
      savings = activePromo.type === 'Percentage' ? (basePrice * activePromo.value) / 100 : activePromo.value;
      finalPrice = Math.max(0, basePrice - savings);
    }
    return { price: finalPrice, originalPrice: basePrice, savings, priceListId, promoId };
  }, [products, priceLists, promoDiscounts]);

  const openSession = (openingCash: number) => {
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      startTime: new Date().toISOString(),
      openingCash,
      status: 'Open',
      transactionIds: []
    };
    setCurrentSession(newSession);
    db.sessions.put(newSession);
  };

  const closeSession = (closingCash: number) => {
    if (!currentSession) return;
    const closed: Session = { ...currentSession, endTime: new Date().toISOString(), closingCash, status: 'Closed' };
    setSessions(prev => [closed, ...prev]);
    setLastClosedSession(closed);
    setCurrentSession(null);
    db.sessions.put(closed);
    setView('reports');
  };

  const addToCart = (product: Product) => {
    if (!product.available || !currentSession) return;
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
    db.transactions.put(t);
    const updatedProducts = products.map(p => {
      let qtyToRemove = 0;
      t.items.forEach(item => {
        if (item.isPackage && item.productId === p.id) { /* logic p-id di package items */ }
        else if (item.isCombo) { /* logic p-id di combo selections */ }
        else if (item.productId === p.id) qtyToRemove += item.quantity;
      });
      return qtyToRemove > 0 ? { ...p, onHandQty: p.onHandQty - qtyToRemove } : p;
    });
    setProducts(updatedProducts);
    if (currentSession) {
      const updatedSession = { ...currentSession, transactionIds: [...currentSession.transactionIds, t.id] };
      setCurrentSession(updatedSession);
      db.sessions.put(updatedSession);
    }
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newCust = { id, ...customer };
    setCustomersState(prev => [...prev, newCust]);
    db.customers.put(newCust);
    return id;
  };

  return (
    <POSContext.Provider value={{
      activeCategory, setActiveCategory, searchQuery, setSearchQuery, cart, addToCart, addPackageToCart, addComboToCart, removeFromCart, updateQuantity, updateNote, clearCart,
      selectedCustomerId, setSelectedCustomerId, history, addTransaction, currentSession, sessions, openSession, closeSession, lastClosedSession, view, setView,
      products, setProducts, categories, setCategories, paymentMethods, setPaymentMethods, fees, setFees, customers, setCustomers, addCustomer,
      priceLists, setPriceLists, packages, setPackages, combos, setCombos, promoDiscounts, setPromoDiscounts, storeSettings, setStoreSettings,
      users, setUsers, roles: INITIAL_ROLES, currentUser, login, logout, checkPermission, exportDatabase, importDatabase, isDbLoaded
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
