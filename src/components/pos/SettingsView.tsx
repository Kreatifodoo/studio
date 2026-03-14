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
  Ticket,
  Upload,
  Download,
  Image as ImageIcon,
  UserCog,
  Database,
  FileJson,
  Calendar as CalendarIcon,
  Lock,
  Printer,
  Barcode as BarcodeIcon
} from 'lucide-react';
import { usePOS } from './POSContext';
import { 
  Product, PaymentMethod, Fee, Customer, PriceList, PromoDiscount, 
  Package, Combo, User, Permission 
} from '@/types/pos';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees,
    customers, setCustomers,
    addCustomer,
    priceLists, setPriceLists,
    packages, setPackages,
    combos, setCombos,
    promoDiscounts, setPromoDiscounts,
    storeSettings, setStoreSettings,
    users, setUsers,
    roles, checkPermission,
    exportDatabase, importDatabase
  } = usePOS();
  
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const dbImportRef = useRef<HTMLInputElement>(null);
  
  const productImportRef = useRef<HTMLInputElement>(null);
  const priceListImportRef = useRef<HTMLInputElement>(null);
  const promoImportRef = useRef<HTMLInputElement>(null);
  const packageImportRef = useRef<HTMLInputElement>(null);
  const comboImportRef = useRef<HTMLInputElement>(null);

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

  const formatCurrencyValue = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintBarcode = (product: Product) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const barcodeValue = `*${product.barcode || product.sku}*`;
    const formattedPrice = formatCurrencyValue(product.price);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Label Barcode - ${product.sku}</title>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Poppins:wght@700;800&display=swap" rel="stylesheet">
          <style>
            @page {
              size: 40mm 30mm;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 40mm;
              height: 30mm;
              background: white;
            }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              -webkit-print-color-adjust: exact;
            }
            .label-box {
              width: 38mm;
              height: 28mm;
              border: 0.8mm solid black;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              padding: 1.5mm 1mm;
              box-sizing: border-box;
              text-align: center;
              overflow: hidden;
            }
            .name {
              font-family: 'Poppins', sans-serif;
              font-weight: 800;
              font-size: 7.5pt;
              line-height: 1.1;
              margin-top: 0.5mm;
              text-transform: uppercase;
              word-break: break-word;
              max-width: 100%;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .barcode-container {
               flex: 1;
               display: flex;
               align-items: center;
               justify-content: center;
               width: 100%;
               padding: 0 4mm; /* Quiet zone! */
            }
            .barcode {
              font-family: 'Libre Barcode 39', cursive;
              font-size: 30pt;
              margin: 0;
              padding: 0;
              line-height: 1;
              white-space: nowrap;
              max-width: 30mm;
              overflow: hidden;
            }
            .footer {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding: 0 1.5mm 0.5mm 1.5mm;
              box-sizing: border-box;
            }
            .sku {
              font-family: 'Poppins', sans-serif;
              font-weight: 700;
              font-size: 6.5pt;
              margin-bottom: 0;
              letter-spacing: 0.5px;
              color: #000;
            }
            .price {
              font-family: 'Poppins', sans-serif;
              font-weight: 800;
              font-size: 8.5pt;
              color: #000;
            }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 500)">
          <div class="label-box">
            <div class="name">${product.name}</div>
            <div class="barcode-container">
              <div class="barcode">${barcodeValue}</div>
            </div>
            <div class="footer">
              <div class="sku">${product.barcode || product.sku}</div>
              <div class="price">${formattedPrice}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.sku) return;
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productForm } as Product : p));
    } else {
      setProducts([...products, { ...productForm, id: Math.random().toString(36).substr(2, 9), available: true, onHandQty: productForm.onHandQty || 0, barcode: productForm.barcode || productForm.sku, image: productForm.image || 'https://picsum.photos/seed/default/400/300' } as Product]);
    }
    setIsProductDialogOpen(false);
    toast({ title: "Produk Disimpan", description: "Master produk telah diperbarui." });
  };

  const savePriceList = () => {
    if (!priceListForm.productId || !priceListForm.name) return;
    if (editingPriceList) {
      setPriceLists(priceLists.map(pl => pl.id === editingPriceList.id ? { ...editingPriceList, ...priceListForm } as PriceList : pl));
    } else {
      setPriceLists([...priceLists, { ...priceListForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as PriceList]);
    }
    setIsPriceListDialogOpen(false);
    toast({ title: "Grosir Disimpan", description: "Aturan harga grosir telah diperbarui." });
  };

  const savePromo = () => {
    if (!promoForm.productId || !promoForm.name) return;
    if (editingPromo) {
      setPromoDiscounts(promoDiscounts.map(pd => pd.id === editingPromo.id ? { ...editingPromo, ...promoForm } as PromoDiscount : pd));
    } else {
      setPromoDiscounts([...promoDiscounts, { ...promoForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as PromoDiscount]);
    }
    setIsPromoDialogOpen(false);
    toast({ title: "Promo Disimpan", description: "Data promo telah diperbarui." });
  };

  const savePackage = () => {
    if (!packageForm.name || !packageForm.sku) return;
    if (editingPackage) {
      setPackages(packages.map(p => p.id === editingPackage.id ? { ...editingPackage, ...packageForm } as Package : p));
    } else {
      setPackages([...packages, { ...packageForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as Package]);
    }
    setIsPackageDialogOpen(false);
    toast({ title: "Paket Disimpan", description: "Data paket telah diperbarui." });
  };

  const saveCombo = () => {
    if (!comboForm.name || !comboForm.sku) return;
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...editingCombo, ...comboForm } as Combo : c));
    } else {
      setCombos([...combos, { ...comboForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as Combo]);
    }
    setIsComboDialogOpen(false);
    toast({ title: "Pilihan Disimpan", description: "Data menu pilihan telah diperbarui." });
  };

  const saveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } as Customer : c));
    } else {
      addCustomer(customerForm as Omit<Customer, 'id'>);
    }
    setIsCustomerDialogOpen(false);
    toast({ title: "Pelanggan Disimpan", description: "Data pelanggan telah diperbarui." });
  };

  const saveCategory = () => {
    if (!categoryForm) return;
    if (editingCategory) {
      setCategories(categories.map(c => c === editingCategory ? categoryForm : c));
    } else {
      if (!categories.includes(categoryForm)) {
        setCategories([...categories, categoryForm]);
      }
    }
    setIsCategoryDialogOpen(false);
    toast({ title: "Kategori Disimpan", description: "Daftar kategori telah diperbarui." });
  };

  const savePayment = () => {
    if (!paymentForm.name) return;
    if (editingPayment) {
      setPaymentMethods(paymentMethods.map(pm => pm.id === editingPayment.id ? { ...editingPayment, ...paymentForm } as PaymentMethod : pm));
    } else {
      setPaymentMethods([...paymentMethods, { ...paymentForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as PaymentMethod]);
    }
    setIsPaymentDialogOpen(false);
    toast({ title: "Metode Disimpan", description: "Metode pembayaran telah diperbarui." });
  };

  const saveFee = () => {
    if (!feeForm.name || feeForm.value === undefined) return;
    if (editingFee) {
      setFees(fees.map(f => f.id === editingFee.id ? { ...editingFee, ...feeForm } as Fee : f));
    } else {
      setFees([...fees, { ...feeForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as Fee]);
    }
    setIsFeeDialogOpen(false);
    toast({ title: "Biaya Disimpan", description: "Data pajak/biaya telah diperbarui." });
  };

  const saveUser = () => {
    if (!userForm.name || !userForm.username) return;
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...userForm } as User : u));
    } else {
      setUsers([...users, { ...userForm, id: Math.random().toString(36).substr(2, 9), status: 'Active' } as User]);
    }
    setIsUserDialogOpen(false);
    toast({ title: "User Disimpan", description: "Data user telah diperbarui." });
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
              <div>
                <CardTitle className="text-2xl font-black">Master Produk</CardTitle>
                <CardDescription className="font-medium">Kelola item dan stok inventaris</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => downloadCSV("sku,barcode,name,category,price,costPrice,onHandQty,description,image\nPROD-001,888001,Contoh Produk,Makanan Utama,25000,12000,50,Deskripsi produk,https://picsum.photos/seed/1/400/300", "template_produk.csv")} className="h-12 rounded-xl border-2 font-black gap-2"><Download className="h-4 w-4" /> Template</Button>
                <Button variant="outline" onClick={() => productImportRef.current?.click()} className="h-12 rounded-xl border-2 font-black gap-2"><Upload className="h-4 w-4" /> Impor CSV</Button>
                <Button onClick={() => { setEditingProduct(null); setProductForm({ category: categories[0] }); setIsProductDialogOpen(true); }} className="h-12 rounded-xl bg-primary font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Produk</Button>
                <input type="file" ref={productImportRef} className="hidden" accept=".csv" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border shadow-sm"><img src={p.image} className="h-full w-full object-cover" alt={p.name} /></div>
                    <div><p className="font-black text-lg leading-tight">{p.name}</p><div className="flex gap-2 items-center mt-1"><span className="text-primary font-black text-sm">{formatCurrencyValue(p.price)}</span><Badge variant="outline" className="text-[9px] font-bold px-2 py-0 border-none bg-white">{p.sku}</Badge></div></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title="Cetak Barcode" onClick={() => handlePrintBarcode(p)}><BarcodeIcon className="h-5 w-5" /></Button>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div><CardTitle className="text-2xl font-black">Harga Grosir</CardTitle><CardDescription className="font-medium">Atur harga diskon untuk pembelian jumlah banyak</CardDescription></div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => downloadCSV("product_sku,rule_name,min_qty,price,start_date,end_date\nPROD-001,Grosir Spesial,10,20000,2024-01-01,2024-12-31", "template_grosir.csv")} className="h-12 rounded-xl border-2 font-black gap-2"><Download className="h-4 w-4" /> Template</Button>
                <Button variant="outline" onClick={() => priceListImportRef.current?.click()} className="h-12 rounded-xl border-2 font-black gap-2"><Upload className="h-4 w-4" /> Impor CSV</Button>
                <Button onClick={() => { setEditingPriceList(null); setPriceListForm({ tiers: [] }); setIsPriceListDialogOpen(true); }} className="h-12 rounded-xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Grosir</Button>
                <input type="file" ref={priceListImportRef} className="hidden" accept=".csv" />
              </div>
            </div>
            <div className="space-y-4">
              {priceLists.map((pl) => (
                <div key={pl.id} className="p-6 bg-muted/10 rounded-[2rem] flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><Tags /></div>
                    <div>
                      <p className="font-black text-lg leading-tight">{pl.name}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Produk: {products.find(p => p.id === pl.productId)?.name || 'Produk'}</p>
                      <div className="flex gap-2 mt-2">
                        {pl.tiers.map((t, idx) => <Badge key={idx} variant="outline" className="text-[10px] font-bold border-none bg-white">Qty {t.minQty}+ : {formatCurrencyValue(t.price)}</Badge>)}
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div><CardTitle className="text-2xl font-black">Promo Diskon</CardTitle><CardDescription className="font-medium">Potongan harga produk untuk periode tertentu</CardDescription></div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => downloadCSV("product_sku,promo_name,type,value,start_date,end_date\nPROD-001,Diskon Kilat,Percentage,10,2024-01-01,2024-12-31", "template_promo.csv")} className="h-12 rounded-xl border-2 font-black gap-2"><Download className="h-4 w-4" /> Template</Button>
                <Button variant="outline" onClick={() => promoImportRef.current?.click()} className="h-12 rounded-xl border-2 font-black gap-2"><Upload className="h-4 w-4" /> Impor CSV</Button>
                <Button onClick={() => { setEditingPromo(null); setPromoForm({ type: 'Percentage' }); setIsPromoDialogOpen(true); }} className="h-12 rounded-xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Promo</Button>
                <input type="file" ref={promoImportRef} className="hidden" accept=".csv" />
              </div>
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
                        <Badge className="bg-rose-500 text-white font-black">{pd.type === 'Percentage' ? `${pd.value}%` : formatCurrencyValue(pd.value)} Off</Badge>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div><CardTitle className="text-2xl font-black">Paket Bundel</CardTitle><CardDescription className="font-medium">Gabungkan beberapa produk menjadi satu paket hemat</CardDescription></div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => downloadCSV("package_sku,package_name,package_price,item_sku,item_qty\nPK-001,Paket Hemat,50000,PROD-001,1", "template_paket.csv")} className="h-12 rounded-xl border-2 font-black gap-2"><Download className="h-4 w-4" /> Template</Button>
                <Button variant="outline" onClick={() => packageImportRef.current?.click()} className="h-12 rounded-xl border-2 font-black gap-2"><Upload className="h-4 w-4" /> Impor CSV</Button>
                <Button onClick={() => { setEditingPackage(null); setPackageForm({ items: [] }); setIsPackageDialogOpen(true); }} className="h-12 rounded-xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Paket</Button>
                <input type="file" ref={packageImportRef} className="hidden" accept=".csv" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-6 bg-muted/10 rounded-[2rem] flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 text-accent p-3 rounded-2xl"><Box /></div>
                      <div><p className="font-black text-lg">{pkg.name}</p><p className="font-black text-primary">{formatCurrencyValue(pkg.price)}</p></div>
                    </div>
                    <div className="flex gap-1">
                       <Button variant="ghost" size="icon" onClick={() => { setEditingPackage(pkg); setPackageForm(pkg); setIsPackageDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPackages(packages.filter(item => item.id !== pkg.id))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'combo':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div><CardTitle className="text-2xl font-black">Pilihan Menu (Combo)</CardTitle><CardDescription className="font-medium">Menu kustom dengan pilihan grup fleksibel</CardDescription></div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => downloadCSV("combo_sku,combo_name,base_price,group_name,is_required,option_sku,extra_price\nCB-001,Combo Makanan,25000,Pilih Minum,true,PROD-001,0", "template_pilihan.csv")} className="h-12 rounded-xl border-2 font-black gap-2"><Download className="h-4 w-4" /> Template</Button>
                <Button variant="outline" onClick={() => comboImportRef.current?.click()} className="h-12 rounded-xl border-2 font-black gap-2"><Upload className="h-4 w-4" /> Impor CSV</Button>
                <Button onClick={() => { setEditingCombo(null); setComboForm({ groups: [] }); setIsComboDialogOpen(true); }} className="h-12 rounded-xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah Pilihan</Button>
                <input type="file" ref={comboImportRef} className="hidden" accept=".csv" />
              </div>
            </div>
            <div className="space-y-4">
              {combos.map((c) => (
                <div key={c.id} className="p-6 bg-muted/10 rounded-[2rem] flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className="bg-primary/10 text-primary p-4 rounded-2xl border shadow-sm"><LayoutGrid /></div>
                    <div><p className="font-black text-lg leading-tight">{c.name}</p><p className="text-xs text-muted-foreground font-bold mt-1">Mulai dari {formatCurrencyValue(c.basePrice)}</p></div>
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
                <input type="file" ref={dbImportRef} className="hidden" accept=".json" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => importDatabase(ev.target?.result as string);
                    reader.readAsText(file);
                  }
                }} />
              </div>
            </div>
          </SettingsSection>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-2xl font-black">Manajemen User</CardTitle><CardDescription className="font-medium">Kelola akses staf dan hak istimewa role</CardDescription></div>
              <Button onClick={() => { setEditingUser(null); setUserForm({ roleId: 'cashier', status: 'Active' }); setIsUserDialogOpen(true); }} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah User</Button>
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
                    <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setUserForm(user); setIsUserDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setUsers(users.filter(u => u.id !== user.id))}><Trash2 className="h-5 w-5" /></Button>
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
        return null;
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
      <input type="file" ref={productImageInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => setProductForm({ ...productForm, image: event.target?.result as string });
          reader.readAsDataURL(file);
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

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Produk</Label><Input value={productForm.name || ''} onChange={(e) => setProductForm({...productForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">SKU</Label><Input value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Barcode</Label><Input value={productForm.barcode || ''} onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} placeholder="Scan barcode" /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Stok Awal</Label><Input type="number" value={productForm.onHandQty || ''} onChange={(e) => setProductForm({...productForm, onHandQty: parseInt(e.target.value)})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Harga Jual (Rp)</Label><Input type="number" value={productForm.price || ''} onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-black">Kategori</Label>
              <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs font-black">Gambar Produk</Label>
              <div className="flex gap-4 items-center p-4 bg-muted/20 rounded-2xl border-2 border-dashed">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-white border flex items-center justify-center">
                  {productForm.image ? <img src={productForm.image} className="h-full w-full object-cover" /> : <ImageIcon className="text-muted-foreground/30" />}
                </div>
                <Button variant="outline" size="sm" onClick={() => productImageInputRef.current?.click()} className="h-10 font-bold"><Upload className="h-4 w-4 mr-2" /> Unggah Galeri</Button>
              </div>
            </div>
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
              <div className="space-y-2"><Label className="text-xs font-black">Nama Aturan</Label><Input value={priceListForm.name || ''} onChange={(e) => setPriceListForm({...priceListForm, name: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={savePriceList} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Grosir</Button></DialogFooter>
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
            <div className="space-y-2"><Label className="text-xs font-black">Nama Promo</Label><Input value={promoForm.name || ''} onChange={(e) => setPromoForm({...promoForm, name: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={savePromo} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Promo</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingPackage ? 'Edit Paket' : 'Tambah Paket'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs font-black">Nama Paket</Label><Input value={packageForm.name || ''} onChange={(e) => setPackageForm({...packageForm, name: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-xs font-black">SKU</Label><Input value={packageForm.sku || ''} onChange={(e) => setPackageForm({...packageForm, sku: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-xs font-black">Harga Paket</Label><Input type="number" value={packageForm.price || ''} onChange={(e) => setPackageForm({...packageForm, price: parseFloat(e.target.value)})} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={savePackage} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Paket</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isComboDialogOpen} onOpenChange={setIsComboDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-10">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingCombo ? 'Edit Pilihan' : 'Tambah Pilihan'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs font-black">Nama Combo</Label><Input value={comboForm.name || ''} onChange={(e) => setComboForm({...comboForm, name: e.target.value})} /></div>
              <div className="space-y-2"><Label className="text-xs font-black">Harga Dasar</Label><Input type="number" value={comboForm.basePrice || ''} onChange={(e) => setComboForm({...comboForm, basePrice: parseFloat(e.target.value)})} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={saveCombo} className="w-full h-14 rounded-xl bg-primary font-black">Simpan Pilihan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-xl font-black">{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama</Label><Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Telepon</Label><Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={saveCustomer} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Pelanggan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-xl font-black">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Kategori</Label><Input value={categoryForm} onChange={(e) => setCategoryForm(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={saveCategory} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Kategori</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-xl font-black">{editingPayment ? 'Edit Metode' : 'Tambah Metode'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Metode</Label><Input value={paymentForm.name || ''} onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={savePayment} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Metode</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-xl font-black">{editingFee ? 'Edit Biaya' : 'Tambah Biaya'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama Pajak/Biaya</Label><Input value={feeForm.name || ''} onChange={(e) => setFeeForm({...feeForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Nilai (%)</Label><Input type="number" value={feeForm.value || ''} onChange={(e) => setFeeForm({...feeForm, value: parseFloat(e.target.value)})} /></div>
          </div>
          <DialogFooter><Button onClick={saveFee} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Biaya</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-xl font-black">{editingUser ? 'Edit User' : 'Tambah User'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="text-xs font-black">Nama</Label><Input value={userForm.name || ''} onChange={(e) => setUserForm({...userForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label className="text-xs font-black">Username</Label><Input value={userForm.username || ''} onChange={(e) => setUserForm({...userForm, username: e.target.value})} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-black">Role</Label>
              <Select value={userForm.roleId} onValueChange={(val) => setUserForm({...userForm, roleId: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={saveUser} className="w-full h-12 rounded-xl bg-primary font-black">Simpan User</Button></DialogFooter>
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
