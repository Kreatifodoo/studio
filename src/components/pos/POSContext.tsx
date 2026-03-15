
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  Product, OrderItem, Transaction, Category, AppView, PaymentMethod, 
  Fee, Session, Customer, PriceList, Package, Combo, PromoDiscount, 
  StoreSettings, User, Role, Permission, PrinterConfig 
} from '@/types/pos';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from '@/lib/pos-data';
import { db } from '@/lib/db';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { useFirestore, useAuth, errorEmitter, FirestorePermissionError } from '@/firebase';

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
  { id: 'manager', name: 'Manajer', permissions: ['view_pos', 'view_history', 'view_dashboard', 'view_reports', 'manage_products', 'manage_customers'] },
  { id: 'cashier', name: 'Kasir', permissions: ['view_pos', 'view_history', 'manage_customers'] },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', name: 'Admin Utama', roleId: 'admin', status: 'Active', password: 'password' },
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
  name: 'Kompak POS',
  currencySymbol: 'Rp',
  address: 'Jl. Contoh Alamat No. 123, Indonesia',
  headerNote: 'Terima Kasih Atas Kunjungan Anda!',
  footerNote: 'Barang yang sudah dibeli tidak dapat dikembalikan.',
  logoUrl: ''
};

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const auth = useAuth();
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
  const [printer, setPrinter] = useState<PrinterConfig>({ name: null, status: 'disconnected', type: 'system' });
  const [btCharacteristic, setBtCharacteristic] = useState<any>(null);
  const [btDevice, setBtDevice] = useState<any>(null);

  useEffect(() => {
    async function initDb() {
      try {
        if (auth && !auth.currentUser) {
          await signInAnonymously(auth);
        }

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
        
        const finalUsers = dbUsers.length > 0 ? dbUsers : INITIAL_USERS;
        setUsersState(finalUsers);
        
        if (dbCustomers.length > 0) setCustomersState(dbCustomers);
        if (dbPM.length > 0) setPaymentMethodsState(dbPM); else setPaymentMethodsState(INITIAL_PAYMENT_METHODS);
        if (dbFees.length > 0) setFeesState(dbFees); else setFeesState(INITIAL_FEES);
        setPriceListsState(dbPL);
        setPackagesState(dbPkgs);
        setCombosState(dbCombos);
        setPromoDiscountsState(dbPromos);
        if (dbSettings) setStoreSettingsState(dbSettings.value);

        const savedUserId = localStorage.getItem('pos_current_user_id');
        if (savedUserId) {
          const user = finalUsers.find(u => u.id === savedUserId);
          if (user) setCurrentUser(user);
        }

        if (firestore) {
          const configRef = doc(firestore, 'app_configurations', 'global_settings');
          getDoc(configRef)
            .then(configDoc => {
              if (configDoc.exists()) {
                const data = configDoc.data();
                if (data.printerName) {
                  setPrinter(prev => ({ ...prev, name: data.printerName }));
                }
                if (data.name) {
                  const cloudSettings: StoreSettings = {
                    id: 'global_settings',
                    name: data.name,
                    currencySymbol: data.currencySymbol || 'Rp',
                    address: data.address || '',
                    headerNote: data.headerNote || '',
                    footerNote: data.footerNote || '',
                    logoUrl: data.logoUrl || ''
                  };
                  setStoreSettingsState(cloudSettings);
                  db.config.put({ key: 'storeSettings', value: cloudSettings });
                }
              }
            })
            .catch(error => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: configRef.path,
                operation: 'get'
              }));
            });
        }

        setIsDbLoaded(true);
      } catch (e) {
        console.error("Gagal inisialisasi database", e);
        setIsDbLoaded(true);
      }
    }
    initDb();
  }, [firestore, auth]);

  const connectPrinter = async () => {
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        alert("Browser Anda tidak mendukung Bluetooth.");
        return;
      }
      
      setPrinter({ ...printer, status: 'connecting' });
      
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'
        ]
      });

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      
      let writeChar = null;
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            writeChar = char;
            break;
          }
        }
        if (writeChar) break;
      }

      if (!writeChar) {
        throw new Error("Tidak dapat menemukan jalur tulis pada printer ini.");
      }

      setBtDevice(device);
      setBtCharacteristic(writeChar);
      const printerName = device.name || 'Printer Bluetooth';
      setPrinter({ name: printerName, status: 'connected', type: 'bluetooth' });
      
      if (firestore) {
        const configRef = doc(firestore, 'app_configurations', 'global_settings');
        const data = {
          id: 'global_settings',
          printerName: printerName,
          printerConnected: true,
          updatedAt: new Date().toISOString()
        };
        setDoc(configRef, data, { merge: true })
          .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: configRef.path,
              operation: 'update',
              requestResourceData: data
            }));
          });
      }

      device.addEventListener('gattserverdisconnected', () => {
        setPrinter({ name: null, status: 'disconnected', type: 'system' });
        setBtCharacteristic(null);
      });
    } catch (e: any) {
      alert(e.message || "Gagal menghubungkan printer.");
      setPrinter({ name: null, status: 'disconnected', type: 'system' });
    }
  };

  const disconnectPrinter = () => {
    if (btDevice && btDevice.gatt.connected) {
      btDevice.gatt.disconnect();
    }
    setBtDevice(null);
    setBtCharacteristic(null);
    setPrinter({ name: null, status: 'disconnected', type: 'system' });
    
    if (firestore) {
      const configRef = doc(firestore, 'app_configurations', 'global_settings');
      const data = {
        id: 'global_settings',
        printerConnected: false,
        updatedAt: new Date().toISOString()
      };
      setDoc(configRef, data, { merge: true })
        .catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: configRef.path,
            operation: 'update',
            requestResourceData: data
          }));
        });
    }
  };

  const printViaBluetooth = async (transaction: Transaction): Promise<boolean> => {
    if (!btCharacteristic || printer.status !== 'connected') return false;

    try {
      const encoder = new TextEncoder();
      const formatCurrency = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
      
      const init = "\x1b\x40";
      const center = "\x1b\x61\x01";
      const left = "\x1b\x61\x00";
      const boldOn = "\x1b\x45\x01";
      const boldOff = "\x1b\x45\x00";
      const newLine = "\n";
      const separator = "--------------------------------\n";

      let receipt = init + center + boldOn + storeSettings.name.toUpperCase() + boldOff + newLine;
      if (storeSettings.address) receipt += storeSettings.address + newLine;
      receipt += separator + left;
      receipt += `Order: #${transaction.id}` + newLine;
      receipt += `Waktu: ${new Date(transaction.date).toLocaleString('id-ID')}` + newLine;
      receipt += separator;

      transaction.items.forEach(item => {
        receipt += item.name.substring(0, 32).toUpperCase() + newLine;
        const qtyPrice = `${item.quantity} x ${formatCurrency(item.price)}`;
        const total = formatCurrency(item.price * item.quantity);
        const padding = 32 - qtyPrice.length - total.length;
        receipt += qtyPrice + " ".repeat(Math.max(1, padding)) + total + newLine;
      });

      receipt += separator;
      receipt += `SUBTOTAL: ${formatCurrency(transaction.subtotal)}` + newLine;
      receipt += `PAJAK: ${formatCurrency(transaction.tax)}` + newLine;
      receipt += boldOn + `TOTAL: ${formatCurrency(transaction.total)}` + boldOff + newLine;
      receipt += separator + center;
      if (storeSettings.headerNote) receipt += storeSettings.headerNote + newLine;
      receipt += "Terima Kasih!" + newLine;
      receipt += newLine + newLine + newLine + newLine;

      const data = encoder.encode(receipt);
      const CHUNK_SIZE = 20;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        await btCharacteristic.writeValue(data.slice(i, i + CHUNK_SIZE));
      }

      return true;
    } catch (e) {
      console.error("Gagal cetak Bluetooth", e);
      return false;
    }
  };

  const printSessionSummaryViaBluetooth = async (session: Session): Promise<boolean> => {
    if (!btCharacteristic || printer.status !== 'connected') return false;

    try {
      const sessionTransactions = history.filter(t => session.transactionIds.includes(t.id));
      const stats = {
        totalSales: sessionTransactions.reduce((acc, t) => acc + t.total, 0),
        count: sessionTransactions.length
      };

      const paymentsByMethod = sessionTransactions.reduce((acc: Record<string, number>, t) => {
        const method = t.paymentMethod || 'Lainnya';
        acc[method] = (acc[method] || 0) + t.total;
        return acc;
      }, {});

      const cashExpected = session.openingCash + (paymentsByMethod['Tunai'] || 0);
      const cashActual = session.closingCash || 0;
      const cashDiff = cashActual - cashExpected;

      const encoder = new TextEncoder();
      const formatCurrency = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
      
      const init = "\x1b\x40";
      const center = "\x1b\x61\x01";
      const left = "\x1b\x61\x00";
      const boldOn = "\x1b\x45\x01";
      const boldOff = "\x1b\x45\x00";
      const newLine = "\n";
      const separator = "--------------------------------\n";

      let receipt = init + center + boldOn + "LAPORAN SESI KASIR" + boldOff + newLine;
      receipt += storeSettings.name.toUpperCase() + newLine;
      receipt += separator + left;
      receipt += `ID Sesi: ${session.id}` + newLine;
      receipt += `Mulai: ${new Date(session.startTime).toLocaleString('id-ID')}` + newLine;
      if (session.endTime) receipt += `Tutup: ${new Date(session.endTime).toLocaleString('id-ID')}` + newLine;
      receipt += separator;

      receipt += boldOn + "REKAPITULASI KAS" + boldOff + newLine;
      receipt += `Modal Awal: ${formatCurrency(session.openingCash)}` + newLine;
      receipt += `Sales Tunai: ${formatCurrency(paymentsByMethod['Tunai'] || 0)}` + newLine;
      receipt += `Ekspektasi: ${formatCurrency(cashExpected)}` + newLine;
      receipt += `Kas Aktual: ${formatCurrency(cashActual)}` + newLine;
      receipt += `Selisih: ${formatCurrency(cashDiff)}` + newLine;
      receipt += separator;

      receipt += boldOn + "RINGKASAN PENJUALAN" + boldOff + newLine;
      receipt += `Total Transaksi: ${stats.count}` + newLine;
      receipt += `TOTAL OMSET: ${formatCurrency(stats.totalSales)}` + newLine;
      receipt += separator;

      receipt += "METODE PEMBAYARAN" + newLine;
      Object.entries(paymentsByMethod).forEach(([method, amount]) => {
        receipt += `${method}: ${formatCurrency(amount)}` + newLine;
      });

      receipt += newLine + newLine + newLine + newLine;

      const data = encoder.encode(receipt);
      const CHUNK_SIZE = 20;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        await btCharacteristic.writeValue(data.slice(i, i + CHUNK_SIZE));
      }

      return true;
    } catch (e) {
      console.error("Gagal cetak Bluetooth Sesi", e);
      return false;
    }
  };

  const printBarcodeViaBluetooth = async (product: Product): Promise<boolean> => {
    if (!btCharacteristic || printer.status !== 'connected') return false;

    try {
      const encoder = new TextEncoder();
      const formatCurrency = (val: number) => `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
      
      const init = "\x1b\x40";
      const center = "\x1b\x61\x01";
      const boldOn = "\x1b\x45\x01";
      const boldOff = "\x1b\x45\x00";
      const barcodeHeight = "\x1d\x68\x60"; 
      const barcodeWidth = "\x1d\x77\x03"; 
      const barcodeHri = "\x1d\x48\x02"; 
      const barcodeData = `\x1d\x6b\x04${product.barcode || product.sku}\x00`; 
      const newLine = "\n";
      
      let label = init + center + boldOn + product.name.toUpperCase() + boldOff + newLine;
      label += barcodeHeight + barcodeWidth + barcodeHri + barcodeData + newLine;
      label += boldOn + formatCurrency(product.price) + boldOff + newLine;
      label += newLine + newLine + newLine + newLine;

      const data = encoder.encode(label);
      const CHUNK_SIZE = 20;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        await btCharacteristic.writeValue(data.slice(i, i + CHUNK_SIZE));
      }

      return true;
    } catch (e) {
      console.error("Gagal cetak Barcode Bluetooth", e);
      return false;
    }
  };

  const setProducts = useCallback((data: Product[]) => { setProductsState(data); db.products.clear().then(() => db.products.bulkPut(data)); }, []);
  const setCategories = useCallback((data: Category[]) => { setCategoriesState(data); db.config.put({ key: 'categories', value: data }); }, []);
  const setPaymentMethods = useCallback((data: PaymentMethod[]) => { setPaymentMethodsState(data); db.paymentMethods.clear().then(() => db.paymentMethods.bulkPut(data)); }, []);
  const setFees = useCallback((data: Fee[]) => { setFeesState(data); db.fees.clear().then(() => db.fees.bulkPut(data)); }, []);
  const setCustomers = useCallback((data: Customer[]) => { setCustomersState(data); db.customers.clear().then(() => db.customers.bulkPut(data)); }, []);
  const setPriceLists = useCallback((data: PriceList[]) => { setPriceListsState(data); db.priceLists.clear().then(() => db.priceLists.bulkPut(data)); }, []);
  const setPackages = useCallback((data: Package[]) => { setPackagesState(data); db.packages.clear().then(() => db.packages.bulkPut(data)); }, []);
  const setCombos = useCallback((data: Combo[]) => { setCombosState(data); db.combos.clear().then(() => db.combos.bulkPut(data)); }, []);
  const setPromoDiscounts = useCallback((data: PromoDiscount[]) => { setPromoDiscountsState(data); db.promoDiscounts.clear().then(() => db.promoDiscounts.bulkPut(data)); }, []);
  
  const setStoreSettings = useCallback((data: StoreSettings) => { 
    setStoreSettingsState(data); 
    db.config.put({ key: 'storeSettings', value: data }); 
    
    if (firestore) {
      const configRef = doc(firestore, 'app_configurations', 'global_settings');
      setDoc(configRef, { id: 'global_settings', ...data, updatedAt: new Date().toISOString() }, { merge: true })
        .catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: configRef.path,
            operation: 'update',
            requestResourceData: data
          }));
        });
    }
  }, [firestore]);

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
    link.download = `backup_kompakpos_${new Date().toISOString().split('T')[0]}.json`;
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

  const getTieredPrice = useCallback((productId: string, quantity: number, basePrice: number) => {
    const activePricelist = priceLists.find(pl => 
      pl.enabled && 
      pl.productId === productId &&
      new Date(pl.startDate) <= new Date() &&
      new Date(pl.endDate) >= new Date()
    );

    if (!activePricelist) return basePrice;

    const tier = activePricelist.tiers.find(t => quantity >= t.minQty && quantity <= t.maxQty);
    return tier ? tier.price : basePrice;
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

  const addTransaction = (t: Transaction) => {
    setHistory(prev => [t, ...prev]);
    db.transactions.put(t);
    const updatedProducts = products.map(p => {
      let qtyToRemove = 0;
      t.items.forEach(item => {
        if (item.productId === p.id) qtyToRemove += item.quantity;
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
      users, setUsers, roles: INITIAL_ROLES, currentUser, login, logout, checkPermission, exportDatabase, importDatabase, isDbLoaded,
      printer, connectPrinter, disconnectPrinter, printViaBluetooth, printSessionSummaryViaBluetooth, printBarcodeViaBluetooth
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
