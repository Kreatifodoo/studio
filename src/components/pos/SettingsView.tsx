"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  Plus, 
  Trash2, 
  Pencil,
  CreditCard,
  Percent,
  Package as PackageIcon,
  Users,
  Tags,
  Layers,
  Box,
  LayoutGrid,
  ChevronRight,
  Check,
  Ticket,
  Upload,
  Download,
  Image as ImageIcon,
  UserCog,
  Database,
  FileJson,
  Calendar as CalendarIcon,
  Search,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePOS } from './POSContext';
import { 
  Product, PaymentMethod, Fee, Customer, PriceList, Package, 
  PackageItem, Combo, ComboGroup, ComboOption, PromoDiscount, 
  Permission, User
} from '@/types/pos';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees,
    customers, setCustomers,
    priceLists, setPriceLists,
    packages, setPackages,
    combos, setCombos,
    promoDiscounts, setPromoDiscounts,
    storeSettings, setStoreSettings,
    users, setUsers,
    roles, currentUser, checkPermission,
    exportDatabase, importDatabase
  } = usePOS();
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const dbImportRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('products');

  const navGroups = useMemo(() => {
    const groups = [
      {
        title: "Produk",
        items: [
          { id: 'products', icon: PackageIcon, label: 'Master Produk', permission: 'manage_products' as Permission },
          { id: 'pricelist', icon: Tags, label: 'Daftar Harga Grosir', permission: 'manage_products' as Permission },
          { id: 'promo', icon: Ticket, label: 'Promo Diskon', permission: 'manage_products' as Permission },
          { id: 'package', icon: Box, label: 'Paket Bundel', permission: 'manage_products' as Permission },
          { id: 'combo', icon: LayoutGrid, label: 'Pilihan Menu', permission: 'manage_products' as Permission },
        ].filter(item => checkPermission(item.permission))
      },
      {
        title: "Sistem",
        items: [
          { id: 'general', icon: Store, label: 'Informasi Toko', permission: 'manage_settings' as Permission },
          { id: 'backup', icon: Database, label: 'Backup & Restore', permission: 'manage_settings' as Permission },
          { id: 'users', icon: UserCog, label: 'Manajemen User', permission: 'manage_users' as Permission },
          { id: 'customers', icon: Users, label: 'Data Pelanggan', permission: 'manage_customers' as Permission },
          { id: 'categories', icon: Layers, label: 'Kategori Produk', permission: 'manage_settings' as Permission },
          { id: 'payments', icon: CreditCard, label: 'Metode Pembayaran', permission: 'manage_settings' as Permission },
          { id: 'fees', icon: Percent, label: 'Pajak & Biaya', permission: 'manage_settings' as Permission },
        ].filter(item => checkPermission(item.permission))
      }
    ];
    return groups.filter(g => g.items.length > 0);
  }, [checkPermission]);

  useEffect(() => {
    const allPermittedIds = navGroups.flatMap(g => g.items.map(i => i.id));
    if (allPermittedIds.length > 0 && !allPermittedIds.includes(activeTab)) {
      setActiveTab(allPermittedIds[0]);
    }
  }, [navGroups, activeTab]);

  // Dialog States
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPriceListDialogOpen, setIsPriceListDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isComboDialogOpen, setIsComboDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Form States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [priceListForm, setPriceListForm] = useState<Partial<PriceList>>({ tiers: [] });
  const [editingPromo, setEditingPromo] = useState<PromoDiscount | null>(null);
  const [promoForm, setPromoForm] = useState<Partial<PromoDiscount>>({});
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState<Partial<Package>>({ items: [] });
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [comboForm, setComboForm] = useState<Partial<Combo>>({ groups: [] });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState('');
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({});
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [feeForm, setFeeForm] = useState<Partial<Fee>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({});
  
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = useMemo(() => currentUser?.roleId === 'admin', [currentUser]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.sku) return;
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productForm } as Product : p));
    } else {
      setProducts([...products, { ...productForm, id: Math.random().toString(36).substr(2, 9), available: true, onHandQty: productForm.onHandQty || 0 } as Product]);
    }
    setIsProductDialogOpen(false);
  };

  const saveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } as Customer : c));
    } else {
      setCustomers([...customers, { ...customerForm, id: Math.random().toString(36).substr(2, 9) } as Customer]);
    }
    setIsCustomerDialogOpen(false);
  };

  const saveCategory = () => {
    if (!categoryForm.trim()) return;
    if (editingCategory) {
      setCategories(categories.map(c => c === editingCategory ? categoryForm : c));
    } else {
      setCategories([...categories, categoryForm]);
    }
    setIsCategoryDialogOpen(false);
  };

  const savePayment = () => {
    if (!paymentForm.name) return;
    if (editingPayment) {
      setPaymentMethods(paymentMethods.map(pm => pm.id === editingPayment.id ? { ...editingPayment, ...paymentForm } as PaymentMethod : pm));
    } else {
      setPaymentMethods([...paymentMethods, { ...paymentForm, id: Math.random().toString(36).substr(2, 9) } as PaymentMethod]);
    }
    setIsPaymentDialogOpen(false);
  };

  const saveFee = () => {
    if (!feeForm.name) return;
    if (editingFee) {
      setFees(fees.map(f => f.id === editingFee.id ? { ...editingFee, ...feeForm } as Fee : f));
    } else {
      setFees([...fees, { ...feeForm, id: Math.random().toString(36).substr(2, 9) } as Fee]);
    }
    setIsFeeDialogOpen(false);
  };

  const saveUser = () => {
    if (!userForm.username || !userForm.name) return;
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...userForm } as User : u));
    } else {
      setUsers([...users, { ...userForm, id: Math.random().toString(36).substr(2, 9), status: 'Active' } as User]);
    }
    setIsUserDialogOpen(false);
  };

  const savePriceList = () => {
    if (!priceListForm.productId || !priceListForm.name) return;
    if (editingPriceList) {
      setPriceLists(priceLists.map(pl => pl.id === editingPriceList.id ? { ...editingPriceList, ...priceListForm } as PriceList : pl));
    } else {
      setPriceLists([...priceLists, { ...priceListForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as PriceList]);
    }
    setIsPriceListDialogOpen(false);
  };

  const savePromo = () => {
    if (!promoForm.productId || !promoForm.name) return;
    if (editingPromo) {
      setPromoDiscounts(promoDiscounts.map(pd => pd.id === editingPromo.id ? { ...editingPromo, ...promoForm } as PromoDiscount : pd));
    } else {
      setPromoDiscounts([...promoDiscounts, { ...promoForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as PromoDiscount]);
    }
    setIsPromoDialogOpen(false);
  };

  const savePackage = () => {
    if (!packageForm.name || !packageForm.sku) return;
    if (editingPackage) {
      setPackages(packages.map(p => p.id === editingPackage.id ? { ...editingPackage, ...packageForm } as Package : p));
    } else {
      setPackages([...packages, { ...packageForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as Package]);
    }
    setIsPackageDialogOpen(false);
  };

  const saveCombo = () => {
    if (!comboForm.name || !comboForm.sku) return;
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...editingCombo, ...comboForm } as Combo : c));
    } else {
      setCombos([...combos, { ...comboForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as Combo]);
    }
    setIsComboDialogOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <SettingsSection icon={Store} title="Informasi Toko" description="Detail dasar tentang usaha Anda">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Nama Toko</Label>
                  <Input value={storeSettings.name} onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})} className="h-12 rounded-xl border-2" />
                </div>
                <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Alamat Toko</Label>
                  <Textarea value={storeSettings.address} onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})} className="min-h-[100px] rounded-xl border-2" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Logo Toko</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-[2rem] bg-muted/10">
                    {storeSettings.logoUrl ? (
                      <div className="relative h-32 w-32 rounded-2xl overflow-hidden border bg-white shadow-sm">
                        <img src={storeSettings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                        <button onClick={() => setStoreSettings({...storeSettings, logoUrl: ''})} className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ) : <div className="h-32 w-32 rounded-2xl bg-white border flex items-center justify-center opacity-20"><ImageIcon /></div>}
                    <Button onClick={() => logoInputRef.current?.click()} variant="outline" className="h-10 rounded-xl font-bold gap-2"><Upload className="h-4 w-4" /> Pilih Logo</Button>
                  </div>
                </div>
              </div>
            </div>
          </SettingsSection>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div><CardTitle className="text-2xl font-black">Master Produk</CardTitle><CardDescription className="font-medium">Kelola item dan stok inventaris</CardDescription></div>
              <Button onClick={() => { setEditingProduct(null); setProductForm({ category: categories[0], image: 'https://picsum.photos/seed/new/400/300' }); setIsProductDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Produk</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border shadow-sm"><img src={p.image} className="h-full w-full object-cover" alt={p.name} /></div>
                    <div><p className="font-black text-lg leading-tight">{p.name}</p><div className="flex gap-2 items-center mt-1"><span className="text-primary font-black text-sm">{formatCurrency(p.price)}</span><Badge variant="outline" className="text-[9px] font-bold px-2 py-0">{p.sku}</Badge></div></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setProducts(products.filter(item => item.id !== p.id))}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricelist':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Harga Grosir</CardTitle><CardDescription className="font-medium">Atur harga diskon untuk pembelian jumlah banyak</CardDescription></div>
              <Button onClick={() => { setEditingPriceList(null); setPriceListForm({ tiers: [], startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0] }); setIsPriceListDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Grosir</Button>
            </div>
            <div className="space-y-4">
              {priceLists.map((pl) => (
                <div key={pl.id} className="p-6 bg-muted/10 rounded-[2rem] flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><Tags /></div>
                    <div>
                      <p className="font-black text-lg leading-tight">{pl.name}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Produk: {products.find(p => p.id === pl.productId)?.name || 'Produk dihapus'}</p>
                      <div className="flex gap-2 mt-2">
                        {pl.tiers.map((t, idx) => <Badge key={idx} variant="outline" className="text-[10px] font-bold">Qty {t.minQty}+ : {formatCurrency(t.price)}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Switch checked={pl.enabled} onCheckedChange={(val) => setPriceLists(priceLists.map(item => item.id === pl.id ? {...item, enabled: val} : item))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPriceList(pl); setPriceListForm(pl); setIsPriceListDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPriceLists(priceLists.filter(item => item.id !== pl.id))}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'promo':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Promo Diskon</CardTitle><CardDescription className="font-medium">Potongan harga produk untuk periode tertentu</CardDescription></div>
              <Button onClick={() => { setEditingPromo(null); setPromoForm({ type: 'Percentage', value: 0, startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0] }); setIsPromoDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Promo</Button>
            </div>
            <div className="space-y-4">
              {promoDiscounts.map((pd) => (
                <div key={pd.id} className="p-6 bg-muted/10 rounded-[2rem] flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="bg-rose-500 text-white p-4 rounded-2xl border shadow-sm"><Ticket /></div>
                    <div>
                      <p className="font-black text-lg leading-tight">{pd.name}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Produk: {products.find(p => p.id === pd.productId)?.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-rose-500 text-white font-black">{pd.type === 'Percentage' ? `${pd.value}%` : formatCurrency(pd.value)} Off</Badge>
                        <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> s/d {pd.endDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Switch checked={pd.enabled} onCheckedChange={(val) => setPromoDiscounts(promoDiscounts.map(item => item.id === pd.id ? {...item, enabled: val} : item))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPromo(pd); setPromoForm(pd); setIsPromoDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPromoDiscounts(promoDiscounts.filter(item => item.id !== pd.id))}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'package':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Paket Bundel</CardTitle><CardDescription className="font-medium">Gabungkan beberapa produk menjadi satu paket hemat</CardDescription></div>
              <Button onClick={() => { setEditingPackage(null); setPackageForm({ items: [] }); setIsPackageDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Paket</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-6 bg-muted/10 rounded-[2rem] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 text-accent p-3 rounded-2xl"><Box /></div>
                      <div>
                        <p className="font-black text-lg">{pkg.name}</p>
                        <p className="font-black text-primary">{formatCurrency(pkg.price)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                       <Button variant="ghost" size="icon" onClick={() => { setEditingPackage(pkg); setPackageForm(pkg); setIsPackageDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPackages(packages.filter(item => item.id !== pkg.id))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.items.map((i, idx) => <Badge key={idx} variant="secondary" className="bg-white text-[9px] font-bold">{i.quantity}x {products.find(prod => prod.id === i.productId)?.name}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'combo':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Pilihan Menu (Combo)</CardTitle><CardDescription className="font-medium">Menu kustom dengan pilihan grup (misal: pilih minum, pilih snack)</CardDescription></div>
              <Button onClick={() => { setEditingCombo(null); setComboForm({ groups: [] }); setIsComboDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Pilihan</Button>
            </div>
            <div className="space-y-4">
              {combos.map((c) => (
                <div key={c.id} className="p-6 bg-muted/10 rounded-[2rem] flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary/10 text-primary p-4 rounded-2xl border shadow-sm"><LayoutGrid /></div>
                    <div>
                      <p className="font-black text-lg leading-tight">{c.name}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Mulai dari {formatCurrency(c.basePrice)} • {c.groups.length} Grup Pilihan</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Switch checked={c.enabled} onCheckedChange={(val) => setCombos(combos.map(item => item.id === c.id ? {...item, enabled: val} : item))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCombo(c); setComboForm(c); setIsComboDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setCombos(combos.filter(item => item.id !== c.id))}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'backup':
        return (
          <SettingsSection icon={Database} title="Backup & Restore" description="Amankan data transaksi dan produk Anda">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div className="p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center text-center gap-4">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary"><Download /></div>
                <h4 className="font-black text-lg">Ekspor Database</h4>
                <p className="text-xs text-muted-foreground font-medium">Unduh seluruh data aplikasi ke dalam format file JSON untuk cadangan.</p>
                <Button onClick={exportDatabase} className="w-full h-12 rounded-xl font-black gap-2"><FileJson className="h-4 w-4" /> Unduh Sekarang</Button>
              </div>
              <div className="p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center text-center gap-4">
                <div className="bg-accent/10 p-4 rounded-2xl text-accent"><Upload /></div>
                <h4 className="font-black text-lg">Impor Database</h4>
                <p className="text-xs text-muted-foreground font-medium">Pulihkan data dari file cadangan JSON yang telah Anda simpan sebelumnya.</p>
                <Button onClick={() => dbImportRef.current?.click()} variant="outline" className="w-full h-12 rounded-xl font-black gap-2 border-2"><Database className="h-4 w-4" /> Unggah File JSON</Button>
              </div>
            </div>
          </SettingsSection>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Manajemen User</CardTitle><CardDescription className="font-medium">Kelola akses staf dan hak istimewa role</CardDescription></div>
              {isAdmin && <Button onClick={() => { setEditingUser(null); setUserForm({ roleId: 'cashier', status: 'Active' }); setIsUserDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah User</Button>}
            </div>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem]">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl">{user.name.substring(0,2).toUpperCase()}</div>
                    <div>
                      <div className="font-black text-lg flex items-center gap-2">
                        {user.name} 
                        <Badge className="bg-primary/10 text-primary border-none ml-2">{roles.find(r => r.id === user.roleId)?.name}</Badge>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground mt-1">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => { setResetPasswordUser(user); setNewPassword(''); setIsResetPasswordOpen(true); }}><Lock className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setUserForm(user); setIsUserDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setUsers(users.filter(u => u.id !== user.id))}><Trash2 className="h-5 w-5" /></Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Data Pelanggan</CardTitle><CardDescription className="font-medium">Pantau daftar pelanggan Anda</CardDescription></div>
              <Button onClick={() => { setEditingCustomer(null); setCustomerForm({}); setIsCustomerDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Pelanggan</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl text-primary shadow-sm border"><Users /></div>
                    <div><p className="font-black text-lg leading-tight">{c.name}</p><p className="text-xs font-bold text-muted-foreground mt-1">{c.phone}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(c); setCustomerForm(c); setIsCustomerDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setCustomers(customers.filter(cust => cust.id !== c.id))}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Kategori Produk</CardTitle><CardDescription className="font-medium">Kelola kategori untuk pengelompokan produk</CardDescription></div>
              <Button onClick={() => { setEditingCategory(null); setCategoryForm(''); setIsCategoryDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Kategori</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                  <span className="font-black">{cat}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled={cat === 'Semua'} onClick={() => { setEditingCategory(cat); setCategoryForm(cat); setIsCategoryDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" disabled={cat === 'Semua'} className="text-destructive/50" onClick={() => setCategories(categories.filter(c => c !== cat))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Metode Pembayaran</CardTitle><CardDescription className="font-medium">Tentukan cara pelanggan membayar</CardDescription></div>
              <Button onClick={() => { setEditingPayment(null); setPaymentForm({ icon: 'Banknote', enabled: true }); setIsPaymentDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Metode</Button>
            </div>
            <div className="space-y-4">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><CreditCard /></div>
                    <div><p className="font-black text-lg leading-tight">{pm.name}</p><p className="text-xs font-bold text-muted-foreground mt-1">{pm.description}</p></div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <Switch checked={pm.enabled} onCheckedChange={(val) => setPaymentMethods(paymentMethods.map(p => p.id === pm.id ? {...p, enabled: val} : p))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPayment(pm); setPaymentForm(pm); setIsPaymentDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'fees':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Pajak & Biaya</CardTitle><CardDescription className="font-medium">Kelola pajak, biaya layanan, atau diskon otomatis</CardDescription></div>
              <Button onClick={() => { setEditingFee(null); setFeeForm({ type: 'Tax', value: 0, enabled: true }); setIsFeeDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Biaya</Button>
            </div>
            <div className="space-y-4">
              {fees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><Percent /></div>
                    <div><p className="font-black text-lg leading-tight">{fee.name}</p><p className="text-xs font-bold text-muted-foreground mt-1">{fee.type} • {fee.value}%</p></div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <Switch checked={fee.enabled} onCheckedChange={(val) => setFees(fees.map(f => f.id === fee.id ? {...f, enabled: val} : f))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingFee(fee); setFeeForm(fee); setIsFeeDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-20">
             <Database className="h-20 w-20 mb-4" />
             <h3 className="text-2xl font-black">Modul Dalam Pengembangan</h3>
             <p className="max-w-xs">Halaman ini akan segera tersedia dalam pembaruan berikutnya.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => setStoreSettings({ ...storeSettings, logoUrl: event.target?.result as string });
          reader.readAsDataURL(file);
        }
      }} />
      <input type="file" ref={dbImportRef} className="hidden" accept=".json" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => importDatabase(ev.target?.result as string);
          reader.readAsText(file);
        }
      }} />
      
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola konfigurasi POS dan data master Anda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-72 bg-white rounded-[2rem] p-4 shadow-sm border border-muted/50">
          <div className="space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">{group.title}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                        activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      {activeTab === item.id && <ChevronRight className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 w-full min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Produk</Label><Input value={productForm.name || ''} onChange={(e) => setProductForm({...productForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">SKU</Label><Input value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Harga Jual (Rp)</Label><Input type="number" value={productForm.price || ''} onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Harga Modal (Rp)</Label><Input type="number" value={productForm.costPrice || ''} onChange={(e) => setProductForm({...productForm, costPrice: parseFloat(e.target.value)})} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-black">Kategori</Label>
              <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs font-black">Stok Awal</Label><Input type="number" value={productForm.onHandQty || ''} onChange={(e) => setProductForm({...productForm, onHandQty: parseInt(e.target.value)})} /></div>
            <div className="col-span-2 space-y-2"><Label className="text-xs font-black">URL Gambar</Label><Input value={productForm.image || ''} onChange={(e) => setProductForm({...productForm, image: e.target.value})} placeholder="https://..." /></div>
          </div>
          <DialogFooter><Button onClick={saveProduct} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Produk</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPriceListDialogOpen} onOpenChange={setIsPriceListDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingPriceList ? 'Edit Harga Grosir' : 'Tambah Harga Grosir'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black">Pilih Produk</Label>
                <Select value={priceListForm.productId} onValueChange={(val) => setPriceListForm({...priceListForm, productId: val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Produk" /></SelectTrigger>
                  <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-xs font-black">Nama Aturan Grosir</Label><Input value={priceListForm.name || ''} onChange={(e) => setPriceListForm({...priceListForm, name: e.target.value})} placeholder="Misal: Grosir Minggu Ini" /></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center"><Label className="text-xs font-black">Tier Harga</Label><Button variant="outline" size="sm" onClick={() => setPriceListForm({...priceListForm, tiers: [...(priceListForm.tiers || []), { minQty: 1, maxQty: 0, price: 0 }]})} className="h-8 rounded-lg font-black"><Plus className="h-3 w-3 mr-1" /> Tambah Tier</Button></div>
              {priceListForm.tiers?.map((tier, idx) => (
                <div key={idx} className="flex gap-4 items-end bg-muted/20 p-4 rounded-xl">
                  <div className="flex-1 space-y-2"><Label className="text-[10px] font-black">Min Qty</Label><Input type="number" value={tier.minQty} onChange={(e) => { const nt = [...priceListForm.tiers!]; nt[idx].minQty = parseInt(e.target.value); setPriceListForm({...priceListForm, tiers: nt}); }} /></div>
                  <div className="flex-1 space-y-2"><Label className="text-[10px] font-black">Harga Per Unit</Label><Input type="number" value={tier.price} onChange={(e) => { const nt = [...priceListForm.tiers!]; nt[idx].price = parseFloat(e.target.value); setPriceListForm({...priceListForm, tiers: nt}); }} /></div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { const nt = priceListForm.tiers!.filter((_, i) => i !== idx); setPriceListForm({...priceListForm, tiers: nt}); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={savePriceList} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Aturan Grosir</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingPromo ? 'Edit Promo' : 'Tambah Promo'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black">Pilih Produk</Label>
              <Select value={promoForm.productId} onValueChange={(val) => setPromoForm({...promoForm, productId: val})}>
                <SelectTrigger><SelectValue placeholder="Pilih Produk" /></SelectTrigger>
                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs font-black">Nama Promo</Label><Input value={promoForm.name || ''} onChange={(e) => setPromoForm({...promoForm, name: e.target.value})} placeholder="Misal: Promo Akhir Tahun" /></div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-xs font-black">Tipe Diskon</Label>
                 <Select value={promoForm.type} onValueChange={(val: any) => setPromoForm({...promoForm, type: val})}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent><SelectItem value="Percentage">Persentase (%)</SelectItem><SelectItem value="FixedAmount">Nominal (Rp)</SelectItem></SelectContent>
                 </Select>
               </div>
               <div className="space-y-2"><Label className="text-xs font-black">Nilai Diskon</Label><Input type="number" value={promoForm.value || ''} onChange={(e) => setPromoForm({...promoForm, value: parseFloat(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label className="text-xs font-black">Tanggal Mulai</Label><Input type="date" value={promoForm.startDate} onChange={(e) => setPromoForm({...promoForm, startDate: e.target.value})} /></div>
               <div className="space-y-2"><Label className="text-xs font-black">Tanggal Akhir</Label><Input type="date" value={promoForm.endDate} onChange={(e) => setPromoForm({...promoForm, endDate: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={savePromo} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Promo</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingPackage ? 'Edit Paket Bundel' : 'Tambah Paket Bundel'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs font-black">Nama Paket</Label><Input value={packageForm.name || ''} onChange={(e) => setPackageForm({...packageForm, name: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-xs font-black">SKU Paket</Label><Input value={packageForm.sku || ''} onChange={(e) => setPackageForm({...packageForm, sku: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-xs font-black">Harga Paket (Rp)</Label><Input type="number" value={packageForm.price || ''} onChange={(e) => setPackageForm({...packageForm, price: parseFloat(e.target.value)})} /></div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center"><Label className="text-xs font-black">Isi Produk Dalam Paket</Label><Button variant="outline" size="sm" onClick={() => setPackageForm({...packageForm, items: [...(packageForm.items || []), { productId: products[0]?.id, quantity: 1 }]})} className="h-8 rounded-lg font-black"><Plus className="h-3 w-3 mr-1" /> Tambah Produk</Button></div>
               {packageForm.items?.map((item, idx) => (
                 <div key={idx} className="flex gap-4 items-end bg-muted/20 p-4 rounded-xl">
                   <div className="flex-[2] space-y-2">
                     <Label className="text-[10px] font-black">Produk</Label>
                     <Select value={item.productId} onValueChange={(val) => { const ni = [...packageForm.items!]; ni[idx].productId = val; setPackageForm({...packageForm, items: ni}); }}>
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                     </Select>
                   </div>
                   <div className="flex-1 space-y-2"><Label className="text-[10px] font-black">Jumlah</Label><Input type="number" value={item.quantity} onChange={(e) => { const ni = [...packageForm.items!]; ni[idx].quantity = parseInt(e.target.value); setPackageForm({...packageForm, items: ni}); }} /></div>
                   <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { const ni = packageForm.items!.filter((_, i) => i !== idx); setPackageForm({...packageForm, items: ni}); }}><Trash2 className="h-4 w-4" /></Button>
                 </div>
               ))}
            </div>
          </div>
          <DialogFooter><Button onClick={savePackage} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Paket</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isComboDialogOpen} onOpenChange={setIsComboDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingCombo ? 'Edit Pilihan Menu' : 'Tambah Pilihan Menu'}</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs font-black">Nama Pilihan (Combo)</Label><Input value={comboForm.name || ''} onChange={(e) => setComboForm({...comboForm, name: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-xs font-black">SKU</Label><Input value={comboForm.sku || ''} onChange={(e) => setComboForm({...comboForm, sku: e.target.value})} /></div>
                <div className="space-y-2"><Label className="text-xs font-black">Harga Dasar (Rp)</Label><Input type="number" value={comboForm.basePrice || ''} onChange={(e) => setComboForm({...comboForm, basePrice: parseFloat(e.target.value)})} /></div>
              </div>
              
              <Separator />

              <div className="space-y-6">
                <div className="flex justify-between items-center"><Label className="text-lg font-black">Grup Pilihan</Label><Button variant="outline" size="sm" onClick={() => setComboForm({...comboForm, groups: [...(comboForm.groups || []), { id: Math.random().toString(36).substr(2, 9), name: '', required: true, options: [] }]})} className="h-10 rounded-xl font-black"><Plus className="h-4 w-4 mr-2" /> Tambah Grup</Button></div>
                {comboForm.groups?.map((group, gIdx) => (
                  <div key={group.id} className="p-6 border-2 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <Input value={group.name} onChange={(e) => { const ng = [...comboForm.groups!]; ng[gIdx].name = e.target.value; setComboForm({...comboForm, groups: ng}); }} placeholder="Nama Grup (misal: Pilih Minuman)" className="font-bold border-none bg-muted/20 rounded-xl" />
                      <div className="flex items-center gap-2"><Label className="text-[10px] font-black">Wajib</Label><Switch checked={group.required} onCheckedChange={(val) => { const ng = [...comboForm.groups!]; ng[gIdx].required = val; setComboForm({...comboForm, groups: ng}); }} /></div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { const ng = comboForm.groups!.filter((_, i) => i !== gIdx); setComboForm({...comboForm, groups: ng}); }}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-2"><Label className="text-xs font-black">Opsi Produk</Label><Button variant="ghost" size="sm" onClick={() => { const ng = [...comboForm.groups!]; ng[gIdx].options.push({ productId: products[0]?.id, extraPrice: 0 }); setComboForm({...comboForm, groups: ng}); }} className="text-xs font-bold text-primary"><Plus className="h-3 w-3 mr-1" /> Tambah Opsi</Button></div>
                      {group.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-4 items-center">
                          <div className="flex-[2]">
                            <Select value={opt.productId} onValueChange={(val) => { const ng = [...comboForm.groups!]; ng[gIdx].options[oIdx].productId = val; setComboForm({...comboForm, groups: ng}); }}>
                              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1 flex items-center gap-2"><span className="text-[10px] font-bold">+Rp</span><Input type="number" value={opt.extraPrice} onChange={(e) => { const ng = [...comboForm.groups!]; ng[gIdx].options[oIdx].extraPrice = parseFloat(e.target.value); setComboForm({...comboForm, groups: ng}); }} className="rounded-xl" /></div>
                          <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => { const ng = [...comboForm.groups!]; ng[gIdx].options = ng[gIdx].options.filter((_, i) => i !== oIdx); setComboForm({...comboForm, groups: ng}); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-6"><Button onClick={saveCombo} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Pilihan Menu</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other common dialogs */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Kategori</Label><Input value={categoryForm} onChange={(e) => setCategoryForm(e.target.value)} placeholder="Contoh: Makanan Penutup" /></div>
          </div>
          <DialogFooter><Button onClick={saveCategory} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Kategori</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Lengkap</Label><Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Nomor Telepon</Label><Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Email (Opsional)</Label><Input value={customerForm.email || ''} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={saveCustomer} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Pelanggan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingUser ? 'Edit User' : 'Tambah User'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Lengkap</Label><Input value={userForm.name || ''} onChange={(e) => setUserForm({...userForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Username</Label><Input value={userForm.username || ''} onChange={(e) => setUserForm({...userForm, username: e.target.value})} /></div>
            {!editingUser && <div className="space-y-2"><Label className="text-xs font-black">Password</Label><Input type="password" value={userForm.password || ''} onChange={(e) => setUserForm({...userForm, password: e.target.value})} /></div>}
            <div className="space-y-2">
              <Label className="text-xs font-black">Role</Label>
              <Select value={userForm.roleId} onValueChange={(val) => setUserForm({...userForm, roleId: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={saveUser} className="w-full h-14 rounded-xl bg-primary font-black">Simpan User</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-destructive">Reset Password</DialogTitle>
            <DialogDescription>Reset password untuk user <b>{resetPasswordUser?.name}</b></DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password Baru</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="h-14 rounded-xl pr-12 font-bold text-lg" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (newPassword && resetPasswordUser) {
                setUsers(users.map(u => u.id === resetPasswordUser.id ? {...u, password: newPassword} : u));
                setIsResetPasswordOpen(false);
                toast({ title: "Berhasil", description: "Password telah diperbarui." });
              }
            }} className="w-full h-14 rounded-xl bg-destructive text-white font-black">Konfirmasi Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingPayment ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Metode</Label><Input value={paymentForm.name || ''} onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-black">Ikon</Label>
              <Select value={paymentForm.icon} onValueChange={(val: any) => setPaymentForm({...paymentForm, icon: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Banknote">Tunai (Banknote)</SelectItem><SelectItem value="CreditCard">Kartu (CreditCard)</SelectItem><SelectItem value="Smartphone">Digital (Smartphone)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs font-black">Deskripsi</Label><Input value={paymentForm.description || ''} onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={savePayment} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Metode</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingFee ? 'Edit Biaya/Pajak' : 'Tambah Biaya/Pajak'}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Biaya</Label><Input value={feeForm.name || ''} onChange={(e) => setFeeForm({...feeForm, name: e.target.value})} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-black">Tipe</Label>
              <Select value={feeForm.type} onValueChange={(val: any) => setFeeForm({...feeForm, type: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Tax">Pajak (Tax)</SelectItem><SelectItem value="Service">Biaya Layanan (Service)</SelectItem><SelectItem value="Discount">Diskon (Discount)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-xs font-black">Nilai (%)</Label><Input type="number" value={feeForm.value || ''} onChange={(e) => setFeeForm({...feeForm, value: parseFloat(e.target.value)})} /></div>
          </div>
          <DialogFooter><Button onClick={saveFee} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Biaya</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
  return (
    <div className="space-y-8">
      <div className="flex gap-5"><div className="bg-primary/10 p-4 rounded-2xl text-primary h-fit"><Icon className="h-7 w-7" /></div><div><h3 className="text-2xl font-black leading-tight">{title}</h3><p className="text-sm text-muted-foreground font-medium mt-1">{description}</p></div></div>
      <div className="pl-0 lg:pl-4">{children}</div>
    </div>
  );
}
