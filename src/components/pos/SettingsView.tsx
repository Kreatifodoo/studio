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
  Barcode as BarcodeIcon,
  Bluetooth,
  RefreshCw,
  BluetoothOff,
  AlertCircle,
  MapPin,
  Smartphone
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
    exportDatabase, importDatabase,
    printer, connectPrinter, disconnectPrinter
  } = usePOS();
  
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('products');

  // Dialog States
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Form States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState('');
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({});
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [feeForm, setFeeForm] = useState<Partial<Fee>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({});

  const navGroups = useMemo(() => {
    const groups = [
      {
        title: "Produk",
        items: [
          { id: 'products', icon: PackageIcon, label: 'Master Produk', permission: 'manage_products' as Permission },
          { id: 'package', icon: Box, label: 'Paket Bundel', permission: 'manage_products' as Permission },
          { id: 'combo', icon: LayoutGrid, label: 'Pilihan Menu', permission: 'manage_products' as Permission },
        ].filter(item => checkPermission(item.permission))
      },
      {
        title: "Sistem",
        items: [
          { id: 'general', icon: Store, label: 'Toko', permission: 'manage_settings' as Permission },
          { id: 'printer', icon: Printer, label: 'Printer', permission: 'manage_settings' as Permission },
          { id: 'customers', icon: Users, label: 'Pelanggan', permission: 'manage_customers' as Permission },
          { id: 'categories', icon: Layers, label: 'Kategori', permission: 'manage_settings' as Permission },
          { id: 'payments', icon: CreditCard, label: 'Pembayaran', permission: 'manage_settings' as Permission },
          { id: 'fees', icon: Percent, label: 'Pajak & Biaya', permission: 'manage_settings' as Permission },
        ].filter(item => checkPermission(item.permission))
      }
    ];
    return groups.filter(g => g.items.length > 0);
  }, [checkPermission]);

  const formatCurrencyValue = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
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
            @page { size: 40mm 30mm; margin: 0; }
            html, body { margin: 0; padding: 0; width: 40mm; height: 30mm; background: white; }
            body { display: flex; align-items: center; justify-content: center; -webkit-print-color-adjust: exact; }
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
               padding: 0 4mm; /* Quiet Zone agar scanner mudah membaca */
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
    toast({ title: "Produk Disimpan" });
  };

  const saveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } as Customer : c));
    } else {
      addCustomer(customerForm as Omit<Customer, 'id'>);
    }
    setIsCustomerDialogOpen(false);
    toast({ title: "Pelanggan Disimpan" });
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
    toast({ title: "Kategori Disimpan" });
  };

  const savePayment = () => {
    if (!paymentForm.name) return;
    if (editingPayment) {
      setPaymentMethods(paymentMethods.map(pm => pm.id === editingPayment.id ? { ...editingPayment, ...paymentForm } as PaymentMethod : pm));
    } else {
      setPaymentMethods([...paymentMethods, { ...paymentForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as PaymentMethod]);
    }
    setIsPaymentDialogOpen(false);
    toast({ title: "Metode Disimpan" });
  };

  const saveFee = () => {
    if (!feeForm.name || feeForm.value === undefined) return;
    if (editingFee) {
      setFees(fees.map(f => f.id === editingFee.id ? { ...editingFee, ...feeForm } as Fee : f));
    } else {
      setFees([...fees, { ...feeForm, id: Math.random().toString(36).substr(2, 9), enabled: true } as Fee]);
    }
    setIsFeeDialogOpen(false);
    toast({ title: "Biaya Disimpan" });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'printer':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10 flex flex-col items-center text-center gap-4">
                  <div className={cn("p-4 rounded-full", printer.status === 'connected' ? "bg-green-500 text-white" : "bg-primary/20 text-primary")}>
                    <Bluetooth className="h-8 w-8" />
                  </div>
                  <h3 className="font-black text-lg">{printer.status === 'connected' ? printer.name : 'Printer Tidak Terhubung'}</h3>
                  <Button 
                    onClick={connectPrinter} 
                    disabled={printer.status === 'connecting'}
                    className="w-full h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20"
                  >
                    {printer.status === 'connecting' ? 'Sedang Memindai...' : 'Pindai & Sambungkan'}
                  </Button>
                  {printer.status === 'connected' && (
                    <Button onClick={disconnectPrinter} variant="ghost" className="text-destructive font-bold">Putuskan Koneksi</Button>
                  )}
                </div>

                <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-100 space-y-4">
                  <h4 className="font-black text-orange-800 text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> AKTIFKAN LOKASI (GPS) SAMSUNG
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                      <p className="text-[10px] font-bold text-orange-900 leading-tight">Tarik layar Samsung Anda dari atas ke bawah <b>dua kali</b> sampai panel ikon muncul.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                      <p className="text-[10px] font-bold text-orange-900 leading-tight">Cari ikon <b>Pin Peta (Lokasi)</b>. Pastikan berwarna <b>Biru (Aktif)</b>.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                      <p className="text-[10px] font-bold text-orange-900 leading-tight">Chrome butuh izin Lokasi untuk memindai Bluetooth. Klik "Izinkan" jika muncul pop-up browser.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block w-64 p-6 bg-muted/20 rounded-[2.5rem] space-y-4">
                <Smartphone className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-center text-[10px] font-bold text-muted-foreground leading-relaxed">
                  Aplikasi ini menggunakan teknologi Web Bluetooth yang memerlukan Izin Lokasi aktif pada perangkat Android Anda.
                </p>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-xl font-black">Produk</CardTitle></div>
              <Button onClick={() => { setEditingProduct(null); setProductForm({ category: categories[0] }); setIsProductDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Tambah</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-2xl border border-transparent hover:border-primary/10">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="h-10 w-10 rounded-lg object-cover" alt={p.name} />
                    <div><p className="font-black text-xs">{p.name}</p><p className="text-[10px] text-primary font-bold">{formatCurrencyValue(p.price)}</p></div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrintBarcode(p)}><BarcodeIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
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
              <div><CardTitle className="text-xl font-black">Pelanggan</CardTitle></div>
              <Button onClick={() => { setEditingCustomer(null); setCustomerForm({}); setIsCustomerDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Tambah</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customers.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
                  <div><p className="font-black text-sm">{c.name}</p><p className="text-[10px] text-muted-foreground font-bold">{c.phone}</p></div>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(c); setCustomerForm(c); setIsCustomerDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><CardTitle className="text-xl font-black">Kategori</CardTitle></div>
              <Button onClick={() => { setEditingCategory(null); setCategoryForm(''); setIsCategoryDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Tambah</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-3 bg-muted/10 rounded-xl">
                  <span className="font-black text-xs">{cat}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={cat === 'Semua'} onClick={() => { setEditingCategory(cat); setCategoryForm(cat); setIsCategoryDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/50" disabled={cat === 'Semua'} onClick={() => setCategories(categories.filter(c => c !== cat))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'general':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Toko</Label><Input value={storeSettings.name} onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alamat</Label><Textarea value={storeSettings.address} onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})} className="rounded-xl border-2" /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logo</Label>
                <div className="p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-4 bg-muted/5">
                  {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="h-20 w-auto object-contain" /> : <div className="h-20 w-20 bg-white border rounded-xl flex items-center justify-center opacity-20"><ImageIcon /></div>}
                  <Button onClick={() => logoInputRef.current?.click()} variant="outline" className="h-10 rounded-xl font-bold">Ganti Logo</Button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-20 text-center opacity-30 font-bold">Halaman Sedang Dikembangkan</div>;
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 h-full">
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setStoreSettings({ ...storeSettings, logoUrl: ev.target?.result as string });
          reader.readAsDataURL(file);
        }
      }} />
      <input type="file" ref={productImageInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setProductForm({ ...productForm, image: ev.target?.result as string });
          reader.readAsDataURL(file);
        }
      }} />

      <div className="flex flex-col gap-1">
        <h2 className="text-xl md:text-2xl font-black">Pengaturan</h2>
        <p className="text-[10px] md:text-sm text-muted-foreground">Konfigurasi POS dan Data Master</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        <aside className="w-full lg:w-56 bg-white rounded-[2rem] p-3 shadow-sm border overflow-x-auto flex lg:flex-col gap-2 scrollbar-hide">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex lg:flex-col gap-1 shrink-0">
              <p className="hidden lg:block px-3 text-[8px] font-black uppercase tracking-widest text-muted-foreground my-2">{group.title}</p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[10px] md:text-xs",
                    activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="flex-1 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border">
          {renderTabContent()}
        </main>
      </div>

      {/* Dialogs */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md rounded-[2rem] p-6">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-1"><Label className="text-[10px] font-black">Nama</Label><Input value={productForm.name || ''} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="h-12 rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-[10px] font-black">SKU</Label><Input value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} className="h-12 rounded-xl" /></div>
              <div className="space-y-1"><Label className="text-[10px] font-black">Stok</Label><Input type="number" value={productForm.onHandQty || ''} onChange={(e) => setProductForm({...productForm, onHandQty: parseInt(e.target.value)})} className="h-12 rounded-xl" /></div>
            </div>
            <div className="space-y-1"><Label className="text-[10px] font-black">Harga Jual</Label><Input type="number" value={productForm.price || ''} onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="h-12 rounded-xl" /></div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black">Kategori</Label>
              <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black">Gambar</Label>
              <Button variant="outline" onClick={() => productImageInputRef.current?.click()} className="w-full h-12 rounded-xl gap-2"><Upload className="h-4 w-4" /> Pilih Gambar</Button>
            </div>
          </div>
          <DialogFooter><Button onClick={saveProduct} className="w-full h-12 rounded-xl bg-primary font-black">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-[2rem] p-6">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label className="text-[10px] font-black">Nama</Label><Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} className="h-12 rounded-xl" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-black">Telepon</Label><Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} className="h-12 rounded-xl" /></div>
          </div>
          <DialogFooter><Button onClick={saveCustomer} className="w-full h-12 rounded-xl bg-primary font-black">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-[2rem] p-6">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label className="text-[10px] font-black">Nama Kategori</Label><Input value={categoryForm} onChange={(e) => setCategoryForm(e.target.value)} className="h-12 rounded-xl" /></div>
          </div>
          <DialogFooter><Button onClick={saveCategory} className="w-full h-12 rounded-xl bg-primary font-black">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
