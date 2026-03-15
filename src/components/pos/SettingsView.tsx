
"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Store, 
  Plus, 
  Trash2, 
  Pencil,
  CreditCard,
  Percent,
  Package as PackageIcon,
  Users,
  Layers,
  Upload,
  ImageIcon,
  Printer,
  Barcode as BarcodeIcon,
  Bluetooth,
  MapPin,
  Info,
  Settings2,
  Tag,
  Boxes,
  LayoutGrid,
  Ticket,
  X
} from 'lucide-react';
import { usePOS } from './POSContext';
import { 
  Product, PaymentMethod, Fee, Customer, Permission, PriceList, Package, Combo, PromoDiscount, PriceTier 
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
import { cn } from '@/lib/utils';

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees,
    customers, setCustomers,
    storeSettings, setStoreSettings,
    checkPermission,
    printer, connectPrinter, disconnectPrinter, printBarcodeViaBluetooth,
    priceLists, setPriceLists,
    packages, setPackages,
    combos, setCombos,
    promoDiscounts, setPromoDiscounts
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
  const [isPricelistDialogOpen, setIsPricelistDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isComboDialogOpen, setIsComboDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);

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
  
  const [editingPricelist, setEditingPricelist] = useState<PriceList | null>(null);
  const [pricelistForm, setPricelistForm] = useState<Partial<PriceList>>({});
  const [newTier, setNewTier] = useState<PriceTier>({ minQty: 1, maxQty: 999, price: 0 });
  
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState<Partial<Package>>({});
  
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [comboForm, setComboForm] = useState<Partial<Combo>>({});
  
  const [editingPromo, setEditingPromo] = useState<PromoDiscount | null>(null);
  const [promoForm, setPromoForm] = useState<Partial<PromoDiscount>>({});

  const navGroups = useMemo(() => {
    const groups = [
      {
        title: "Katalog & Penjualan",
        items: [
          { id: 'products', icon: PackageIcon, label: 'Master Produk', permission: 'manage_products' as Permission },
          { id: 'categories', icon: Layers, label: 'Kategori', permission: 'manage_settings' as Permission },
          { id: 'pricelists', icon: Tag, label: 'Pricelist (Grosir)', permission: 'manage_products' as Permission },
          { id: 'packages', icon: Boxes, label: 'Paket Produk', permission: 'manage_products' as Permission },
          { id: 'combos', icon: LayoutGrid, label: 'Combo / Pilihan', permission: 'manage_products' as Permission },
          { id: 'promos', icon: Ticket, label: 'Program Diskon', permission: 'manage_products' as Permission },
        ].filter(item => checkPermission(item.permission))
      },
      {
        title: "Sistem & Toko",
        items: [
          { id: 'general', icon: Store, label: 'Identitas Toko', permission: 'manage_settings' as Permission },
          { id: 'printer', icon: Printer, label: 'Printer Bluetooth', permission: 'manage_settings' as Permission },
          { id: 'customers', icon: Users, label: 'Master Pelanggan', permission: 'manage_customers' as Permission },
          { id: 'payments', icon: CreditCard, label: 'Metode Bayar', permission: 'manage_settings' as Permission },
          { id: 'fees', icon: Percent, label: 'Pajak & Biaya', permission: 'manage_settings' as Permission },
        ].filter(item => checkPermission(item.permission))
      }
    ];
    return groups.filter(g => g.items.length > 0);
  }, [checkPermission]);

  const formatCurrencyValue = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handlePrintBarcode = async (product: Product) => {
    if (printer.status === 'connected') {
      const success = await printBarcodeViaBluetooth(product);
      if (success) {
        toast({ title: "Barcode dicetak ke Bluetooth" });
        return;
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const barcodeValue = `*${product.barcode || product.sku}*`;
    const formattedPrice = formatCurrencyValue(product.price);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Label Barcode - ${product.sku}</title>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Poppins:wght@700;800&display=swap" rel="stylesheet">
          <style>
            @page { size: 40mm 30mm; margin: 0; }
            body { display: flex; align-items: center; justify-content: center; margin: 0; padding: 0; width: 40mm; height: 30mm; }
            .label-box { width: 38mm; height: 28mm; border: 0.5mm solid black; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 1mm; box-sizing: border-box; text-align: center; }
            .name { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 7pt; line-height: 1.1; text-transform: uppercase; }
            .barcode { font-family: 'Libre Barcode 39', cursive; font-size: 24pt; margin: 0; line-height: 1; }
            .price { font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 9pt; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label-box">
            <div class="name">${product.name}</div>
            <div class="barcode">${barcodeValue}</div>
            <div class="price">${formattedPrice}</div>
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
    toast({ title: "Produk Berhasil Disimpan" });
  };

  const savePricelist = () => {
    if (!pricelistForm.name || !pricelistForm.productId) return;
    if (editingPricelist) {
      setPriceLists(priceLists.map(pl => pl.id === editingPricelist.id ? { ...editingPricelist, ...pricelistForm } as PriceList : pl));
    } else {
      setPriceLists([...priceLists, { ...pricelistForm, id: Math.random().toString(36).substr(2, 9), enabled: true, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 31536000000).toISOString(), tiers: pricelistForm.tiers || [] } as PriceList]);
    }
    setIsPricelistDialogOpen(false);
    toast({ title: "Pricelist Berhasil Disimpan" });
  };

  const addTier = () => {
    if (newTier.price <= 0) return;
    const currentTiers = pricelistForm.tiers || [];
    setPricelistForm({ ...pricelistForm, tiers: [...currentTiers, newTier] });
    setNewTier({ minQty: 1, maxQty: 999, price: 0 });
  };

  const removeTier = (idx: number) => {
    const currentTiers = [...(pricelistForm.tiers || [])];
    currentTiers.splice(idx, 1);
    setPricelistForm({ ...pricelistForm, tiers: currentTiers });
  };

  const savePackage = () => {
    if (!packageForm.name || !packageForm.sku) return;
    if (editingPackage) {
      setPackages(packages.map(pkg => pkg.id === editingPackage.id ? { ...editingPackage, ...packageForm } as Package : pkg));
    } else {
      setPackages([...packages, { ...packageForm, id: Math.random().toString(36).substr(2, 9), enabled: true, items: packageForm.items || [] } as Package]);
    }
    setIsPackageDialogOpen(false);
    toast({ title: "Paket Produk Berhasil Disimpan" });
  };

  const saveCombo = () => {
    if (!comboForm.name || !comboForm.sku) return;
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...editingCombo, ...comboForm } as Combo : c));
    } else {
      setCombos([...combos, { ...comboForm, id: Math.random().toString(36).substr(2, 9), enabled: true, groups: comboForm.groups || [] } as Combo]);
    }
    setIsComboDialogOpen(false);
    toast({ title: "Combo Pilihan Berhasil Disimpan" });
  };

  const savePromo = () => {
    if (!promoForm.name || !promoForm.productId) return;
    if (editingPromo) {
      setPromoDiscounts(promoDiscounts.map(p => p.id === editingPromo.id ? { ...editingPromo, ...promoForm } as PromoDiscount : p));
    } else {
      setPromoDiscounts([...promoDiscounts, { ...promoForm, id: Math.random().toString(36).substr(2, 9), enabled: true, type: 'Percentage', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 31536000000).toISOString() } as PromoDiscount]);
    }
    setIsPromoDialogOpen(false);
    toast({ title: "Program Diskon Berhasil Disimpan" });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">Master Produk</CardTitle>
              <Button onClick={() => { setEditingProduct(null); setProductForm({ category: categories[0], costPrice: 0, price: 0, onHandQty: 0 }); setIsProductDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Tambah</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="h-10 w-10 rounded-lg object-cover border" alt={p.name} />
                    <div><p className="font-black text-xs">{p.name}</p><p className="text-[10px] text-primary font-bold">{formatCurrencyValue(p.price)}</p></div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => handlePrintBarcode(p)}><BarcodeIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white" onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'pricelists':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">Master Pricelist (Grosir)</CardTitle>
              <Button onClick={() => { setEditingPricelist(null); setPricelistForm({ tiers: [] }); setIsPricelistDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Buat Baru</Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {priceLists.map(pl => (
                <div key={pl.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
                  <div><p className="font-black text-sm">{pl.name}</p><p className="text-[10px] text-muted-foreground font-bold">{products.find(p => p.id === pl.productId)?.name || 'Produk'}</p></div>
                  <div className="flex gap-2">
                    <Switch checked={pl.enabled} onCheckedChange={(val) => setPriceLists(priceLists.map(p => p.id === pl.id ? {...p, enabled: val} : p))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPricelist(pl); setPricelistForm(pl); setIsPricelistDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'packages':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">Master Paket Produk</CardTitle>
              <Button onClick={() => { setEditingPackage(null); setPackageForm({ items: [], price: 0 }); setIsPackageDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Buat Paket</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
                  <div><p className="font-black text-sm">{pkg.name}</p><p className="text-[10px] text-primary font-black">{formatCurrencyValue(pkg.price)}</p></div>
                  <div className="flex gap-2">
                    <Switch checked={pkg.enabled} onCheckedChange={(val) => setPackages(packages.map(p => p.id === pkg.id ? {...p, enabled: val} : p))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPackage(pkg); setPackageForm(pkg); setIsPackageDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'combos':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">Master Combo / Pilihan</CardTitle>
              <Button onClick={() => { setEditingCombo(null); setComboForm({ groups: [], basePrice: 0 }); setIsComboDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Buat Combo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {combos.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
                  <div><p className="font-black text-sm">{c.name}</p><p className="text-[10px] text-primary font-black">{formatCurrencyValue(c.basePrice)}</p></div>
                  <div className="flex gap-2">
                    <Switch checked={c.enabled} onCheckedChange={(val) => setCombos(combos.map(item => item.id === c.id ? {...item, enabled: val} : item))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCombo(c); setComboForm(c); setIsComboDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'promos':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">Master Program Diskon</CardTitle>
              <Button onClick={() => { setEditingPromo(null); setPromoForm({ type: 'Percentage', value: 0 }); setIsPromoDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Buat Promo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {promoDiscounts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
                  <div><p className="font-black text-sm">{p.name}</p><p className="text-[10px] text-rose-500 font-black">Potongan: {p.type === 'Percentage' ? `${p.value}%` : formatCurrencyValue(p.value)}</p></div>
                  <div className="flex gap-2">
                    <Switch checked={p.enabled} onCheckedChange={(val) => setPromoDiscounts(promoDiscounts.map(item => item.id === p.id ? {...item, enabled: val} : item))} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPromo(p); setPromoForm(p); setIsPromoDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
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
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alamat Lengkap</Label><Textarea value={storeSettings.address} onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})} className="rounded-xl border-2 min-h-[100px]" /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logo Toko (Struk)</Label>
                <div className="p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-4 bg-muted/5 group hover:border-primary/40 transition-all">
                  {storeSettings.logoUrl ? <img src={storeSettings.logoUrl} className="h-20 w-auto object-contain" /> : <div className="h-20 w-20 bg-white border rounded-xl flex items-center justify-center opacity-20"><ImageIcon className="h-10 w-10" /></div>}
                  <Button onClick={() => logoInputRef.current?.click()} variant="outline" className="h-10 rounded-xl font-black bg-white">Ganti Logo Toko</Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'printer':
        return (
          <div className="space-y-6">
            <div className="bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10 flex flex-col items-center text-center gap-4">
              <div className={cn("p-4 rounded-full", printer.status === 'connected' ? "bg-green-50 text-green-600" : "bg-primary/20 text-primary")}>
                <Bluetooth className="h-8 w-8" />
              </div>
              <h3 className="font-black text-lg">{printer.status === 'connected' ? printer.name : 'Printer Tidak Terhubung'}</h3>
              <Button onClick={connectPrinter} disabled={printer.status === 'connecting'} className="w-full h-12 rounded-xl font-black bg-primary">
                {printer.status === 'connecting' ? 'Memindai...' : 'Sambungkan Printer'}
              </Button>
              {printer.status === 'connected' && <Button onClick={disconnectPrinter} variant="ghost" className="text-destructive font-bold">Putuskan</Button>}
            </div>
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-[10px] text-blue-800 leading-relaxed font-medium">Pastikan GPS (Lokasi) dan Bluetooth aktif pada perangkat Android Anda untuk mendeteksi printer termal.</p>
            </div>
          </div>
        );
      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">Master Pelanggan</CardTitle>
              <Button onClick={() => { setEditingCustomer(null); setCustomerForm({ name: '', phone: '' }); setIsCustomerDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black text-xs px-4">Tambah</Button>
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
      default:
        return <div className="p-20 text-center opacity-30 font-bold">Pilih kategori pengaturan.</div>;
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
        <h2 className="text-xl md:text-2xl font-black">Pengaturan Kompak POS</h2>
        <p className="text-[10px] md:text-sm text-muted-foreground">Kelola master data dan konfigurasi perangkat Android Anda.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        <aside className="w-full lg:w-64 bg-white rounded-[2rem] p-3 shadow-sm border overflow-x-auto flex lg:flex-col gap-2 scrollbar-hide">
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

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md rounded-[2rem] p-6 border-none">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Produk</Label><Input value={productForm.name || ''} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">SKU</Label><Input value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} className="h-12 rounded-xl border-2" /></div>
              <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Stok Awal</Label><Input type="number" value={productForm.onHandQty || 0} onChange={(e) => setProductForm({...productForm, onHandQty: parseInt(e.target.value)})} className="h-12 rounded-xl border-2" /></div>
            </div>
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Harga Jual (Rp)</Label><Input type="number" value={productForm.price || 0} onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Kategori</Label>
              <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Foto Produk</Label>
              <Button variant="outline" onClick={() => productImageInputRef.current?.click()} className="w-full h-12 rounded-xl gap-2 bg-muted/10 border-2 border-dashed"><Upload className="h-4 w-4" /> Unggah Foto</Button>
            </div>
          </div>
          <DialogFooter><Button onClick={saveProduct} className="w-full h-12 rounded-xl bg-primary font-black shadow-lg shadow-primary/20">Simpan Produk</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricelist Dialog */}
      <Dialog open={isPricelistDialogOpen} onOpenChange={setIsPricelistDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md rounded-[2rem] p-6 border-none">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingPricelist ? 'Edit Pricelist' : 'Buat Pricelist Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Aturan Harga</Label><Input value={pricelistForm.name || ''} onChange={(e) => setPricelistForm({...pricelistForm, name: e.target.value})} placeholder="Contoh: Harga Grosir" className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Pilih Produk</Label>
              <Select value={pricelistForm.productId} onValueChange={(val) => setPricelistForm({...pricelistForm, productId: val})}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue placeholder="Pilih Produk" /></SelectTrigger><SelectContent className="rounded-xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
            </div>
            
            <Separator className="my-4" />
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Aturan Tier Qty</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1"><Label className="text-[8px] font-bold">Min</Label><Input type="number" value={newTier.minQty} onChange={(e) => setNewTier({...newTier, minQty: parseInt(e.target.value)})} className="h-10 rounded-lg text-xs" /></div>
                <div className="space-y-1"><Label className="text-[8px] font-bold">Max</Label><Input type="number" value={newTier.maxQty} onChange={(e) => setNewTier({...newTier, maxQty: parseInt(e.target.value)})} className="h-10 rounded-lg text-xs" /></div>
                <div className="space-y-1"><Label className="text-[8px] font-bold">Harga Satuan</Label><Input type="number" value={newTier.price} onChange={(e) => setNewTier({...newTier, price: parseFloat(e.target.value)})} className="h-10 rounded-lg text-xs" /></div>
              </div>
              <Button onClick={addTier} variant="outline" className="w-full h-10 rounded-xl gap-2 font-black text-xs"><Plus className="h-3.5 w-3.5" /> Tambah Tier</Button>
            </div>

            <div className="space-y-2 mt-4">
              {pricelistForm.tiers?.map((tier, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-dashed">
                  <div className="text-[10px] font-bold">
                    Qty: {tier.minQty} - {tier.maxQty} <span className="mx-2">→</span> <span className="text-primary">{formatCurrencyValue(tier.price)}</span>
                  </div>
                  <Button onClick={() => removeTier(idx)} variant="ghost" size="icon" className="h-7 w-7 text-destructive"><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter><Button onClick={savePricelist} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Aturan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package Dialog */}
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md rounded-[2rem] p-6 border-none">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingPackage ? 'Edit Paket' : 'Buat Paket Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Paket</Label><Input value={packageForm.name || ''} onChange={(e) => setPackageForm({...packageForm, name: e.target.value})} placeholder="Contoh: Paket Kenyang" className="h-12 rounded-xl border-2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">SKU Paket</Label><Input value={packageForm.sku || ''} onChange={(e) => setPackageForm({...packageForm, sku: e.target.value})} className="h-12 rounded-xl border-2" /></div>
              <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Harga Paket</Label><Input type="number" value={packageForm.price || 0} onChange={(e) => setPackageForm({...packageForm, price: parseFloat(e.target.value)})} className="h-12 rounded-xl border-2" /></div>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center py-4">Penyusunan item paket akan tersedia di versi berikutnya.</p>
          </div>
          <DialogFooter><Button onClick={savePackage} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Paket</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Combo Dialog */}
      <Dialog open={isComboDialogOpen} onOpenChange={setIsComboDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md rounded-[2rem] p-6 border-none">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingCombo ? 'Edit Combo' : 'Buat Combo Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Combo</Label><Input value={comboForm.name || ''} onChange={(e) => setComboForm({...comboForm, name: e.target.value})} placeholder="Contoh: Menu Custom" className="h-12 rounded-xl border-2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">SKU</Label><Input value={comboForm.sku || ''} onChange={(e) => setComboForm({...comboForm, sku: e.target.value})} className="h-12 rounded-xl border-2" /></div>
              <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Harga Dasar</Label><Input type="number" value={comboForm.basePrice || 0} onChange={(e) => setComboForm({...comboForm, basePrice: parseFloat(e.target.value)})} className="h-12 rounded-xl border-2" /></div>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center py-4">Pengaturan Grup Pilihan akan tersedia di versi berikutnya.</p>
          </div>
          <DialogFooter><Button onClick={saveCombo} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Combo</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promo Dialog */}
      <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-md rounded-[2rem] p-6 border-none">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingPromo ? 'Edit Promo' : 'Buat Promo Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nama Program</Label><Input value={promoForm.name || ''} onChange={(e) => setPromoForm({...promoForm, name: e.target.value})} placeholder="Contoh: Promo Gajian" className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Target Produk</Label>
              <Select value={promoForm.productId} onValueChange={(val) => setPromoForm({...promoForm, productId: val})}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue placeholder="Pilih Produk" /></SelectTrigger><SelectContent className="rounded-xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Jenis</Label>
                <Select value={promoForm.type} onValueChange={(val: any) => setPromoForm({...promoForm, type: val})}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="Percentage">Persentase (%)</SelectItem><SelectItem value="FixedAmount">Nominal (Rp)</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nilai</Label><Input type="number" value={promoForm.value || 0} onChange={(e) => setPromoForm({...promoForm, value: parseFloat(e.target.value)})} className="h-12 rounded-xl border-2" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={savePromo} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Promo</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-[2rem] p-6 border-none">
          <DialogHeader><DialogTitle className="text-lg font-black">{editingCustomer ? 'Edit Pelanggan' : 'Pelanggan Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Nama</Label><Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Telepon</Label><Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} className="h-12 rounded-xl border-2" /></div>
          </div>
          <DialogFooter><Button onClick={() => {
            if (!customerForm.name || !customerForm.phone) return;
            if (editingCustomer) {
              setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } as Customer : c));
            } else {
              setCustomers([...customers, { ...customerForm, id: Math.random().toString(36).substr(2, 9).toUpperCase() } as Customer]);
            }
            setIsCustomerDialogOpen(false);
            toast({ title: "Data Pelanggan Disimpan" });
          }} className="w-full h-12 rounded-xl bg-primary font-black">Simpan Pelanggan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
