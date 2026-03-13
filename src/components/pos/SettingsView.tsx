
"use client";

import React, { useState, useRef } from 'react';
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
  Download
} from 'lucide-react';
import { usePOS } from './POSContext';
import { Product, PaymentMethod, Fee, Customer, PriceList, Package, PackageItem, Combo, ComboGroup, ComboOption, PromoDiscount } from '@/types/pos';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

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
    promoDiscounts, setPromoDiscounts
  } = usePOS();
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'products' | 'pricelist' | 'promo' | 'package' | 'combo' | null>(null);

  const [activeTab, setActiveTab] = useState('general');
  const [packageSearch, setPackageSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [comboSearch, setComboSearch] = useState('');

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

  const navGroups = [
    {
      title: "Produk",
      items: [
        { id: 'products', icon: PackageIcon, label: 'Master Produk' },
        { id: 'pricelist', icon: Tags, label: 'Master Pricelist' },
        { id: 'promo', icon: Ticket, label: 'Master Promo Discount' },
        { id: 'package', icon: Box, label: 'Master Package' },
        { id: 'combo', icon: LayoutGrid, label: 'Master Combo' },
      ]
    },
    {
      title: "Sistem",
      items: [
        { id: 'general', icon: Store, label: 'General' },
        { id: 'customers', icon: Users, label: 'Master Customer' },
        { id: 'categories', icon: Layers, label: 'Master Kategori' },
        { id: 'payments', icon: CreditCard, label: 'Payments' },
        { id: 'fees', icon: Percent, label: 'Fees & Discounts' },
      ]
    }
  ];

  // Import Handler
  const handleImportClick = (type: 'products' | 'pricelist' | 'promo' | 'package' | 'combo') => {
    setImportType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importType) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        if (!Array.isArray(jsonData)) {
          throw new Error("Data harus berupa array JSON.");
        }

        switch (importType) {
          case 'products':
            setProducts(prev => [...prev, ...jsonData]);
            break;
          case 'pricelist':
            setPriceLists(prev => [...prev, ...jsonData]);
            break;
          case 'promo':
            setPromoDiscounts(prev => [...prev, ...jsonData]);
            break;
          case 'package':
            setPackages(prev => [...prev, ...jsonData]);
            break;
          case 'combo':
            setCombos(prev => [...prev, ...jsonData]);
            break;
        }

        toast({
          title: "Import Berhasil",
          description: `${jsonData.length} data telah ditambahkan ke master ${importType}.`,
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Gagal Impor",
          description: err.message || "Format file tidak valid.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm('');
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Nama kategori tidak boleh kosong." });
      return;
    }
    if (editingCategory) {
      setCategories(prev => prev.map(cat => cat === editingCategory ? categoryForm : cat));
      setProducts(prev => prev.map(p => p.category === editingCategory ? { ...p, category: categoryForm } : p));
    } else {
      if (categories.includes(categoryForm)) {
        toast({ variant: "destructive", title: "Error", description: "Kategori sudah ada." });
        return;
      }
      setCategories(prev => [...prev, categoryForm]);
    }
    setIsCategoryDialogOpen(false);
    toast({ title: "Success", description: "Kategori berhasil disimpan." });
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (catToDelete === 'All') return;
    setCategories(prev => prev.filter(c => c !== catToDelete));
    setIsCategoryDialogOpen(false);
    toast({ title: "Deleted", description: "Kategori telah dihapus." });
  };

  // Payment Handlers
  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({ name: '', icon: 'CreditCard', description: '', enabled: true });
    setIsPaymentDialogOpen(true);
  };

  const handleSavePayment = () => {
    if (!paymentForm.name) return;
    if (editingPayment) {
      setPaymentMethods(prev => prev.map(pm => pm.id === editingPayment.id ? { ...editingPayment, ...paymentForm } as PaymentMethod : pm));
    } else {
      const newPm: PaymentMethod = {
        id: Math.random().toString(36).substr(2, 9),
        ...paymentForm as PaymentMethod
      };
      setPaymentMethods(prev => [...prev, newPm]);
    }
    setIsPaymentDialogOpen(false);
    toast({ title: "Success", description: "Metode pembayaran disimpan." });
  };

  // Fee Handlers
  const handleOpenAddFee = () => {
    setEditingFee(null);
    setFeeForm({ name: '', type: 'Tax', value: 0, enabled: true });
    setIsFeeDialogOpen(true);
  };

  const handleSaveFee = () => {
    if (!feeForm.name) return;
    if (editingFee) {
      setFees(prev => prev.map(f => f.id === editingFee.id ? { ...editingFee, ...feeForm } as Fee : f));
    } else {
      const newFee: Fee = {
        id: Math.random().toString(36).substr(2, 9),
        ...feeForm as Fee
      };
      setFees(prev => [...prev, newFee]);
    }
    setIsFeeDialogOpen(false);
    toast({ title: "Success", description: "Fee/Discount disimpan." });
  };

  // Package Handlers
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({ name: '', sku: '', description: '', price: '' as any, enabled: true, items: [] });
    setIsPackageDialogOpen(true);
  };

  const handleSavePackage = () => {
    if (!packageForm.name || !packageForm.sku || !packageForm.price) return;
    if (editingPackage) {
      setPackages(prev => prev.map(p => p.id === editingPackage.id ? { ...editingPackage, ...packageForm } as Package : p));
    } else {
      setPackages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...packageForm as Package }]);
    }
    setIsPackageDialogOpen(false);
  };

  const addPackageItem = () => setPackageForm(prev => ({ ...prev, items: [...(prev.items || []), { productId: products[0]?.id || '', quantity: 1 }] }));
  const removePackageItem = (idx: number) => setPackageForm(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== idx) }));
  const updatePackageItem = (idx: number, field: keyof PackageItem, value: any) => setPackageForm(prev => {
    const newItems = [...(prev.items || [])];
    newItems[idx] = { ...newItems[idx], [field]: value };
    return { ...prev, items: newItems };
  });

  // Combo Handlers
  const handleOpenAddCombo = () => {
    setEditingCombo(null);
    setComboForm({ name: '', sku: '', description: '', basePrice: '' as any, enabled: true, groups: [] });
    setIsComboDialogOpen(true);
  };

  const handleSaveCombo = () => {
    if (!comboForm.name || !comboForm.sku || !comboForm.basePrice) return;
    if (editingCombo) {
      setCombos(prev => prev.map(c => c.id === editingCombo.id ? { ...editingCombo, ...comboForm } as Combo : c));
    } else {
      setCombos(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...comboForm as Combo }]);
    }
    setIsComboDialogOpen(false);
  };

  const addComboGroup = () => setComboForm(prev => ({ ...prev, groups: [...(prev.groups || []), { id: Math.random().toString(36).substr(2, 5), name: '', required: true, options: [] }] }));
  const removeComboGroup = (gIdx: number) => setComboForm(prev => ({ ...prev, groups: prev.groups?.filter((_, i) => i !== gIdx) }));
  const updateComboGroup = (gIdx: number, field: keyof ComboGroup, value: any) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx] = { ...newGroups[gIdx], [field]: value };
    return { ...prev, groups: newGroups };
  });

  const addComboOption = (gIdx: number) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx].options = [...newGroups[gIdx].options, { productId: products[0]?.id || '', extraPrice: 0 }];
    return { ...prev, groups: newGroups };
  });

  const removeComboOption = (gIdx: number, oIdx: number) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx].options = newGroups[gIdx].options.filter((_, i) => i !== oIdx);
    return { ...prev, groups: newGroups };
  });

  const updateComboOption = (gIdx: number, oIdx: number, field: keyof ComboOption, value: any) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx].options[oIdx] = { ...newGroups[gIdx].options[oIdx], [field]: value };
    return { ...prev, groups: newGroups };
  });

  // Price List Handlers
  const handleOpenAddPriceList = () => {
    setEditingPriceList(null);
    setPriceListForm({ 
      name: '', productId: products[0]?.id || '', 
      startDate: new Date().toISOString().split('T')[0], 
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tiers: [{ minQty: 1, maxQty: 10, price: 0 }],
      enabled: true 
    });
    setIsPriceListDialogOpen(true);
  };

  const handleSavePriceList = () => {
    if (!priceListForm.name || !priceListForm.productId) return;
    if (editingPriceList) setPriceLists(prev => prev.map(pl => pl.id === editingPriceList.id ? { ...editingPriceList, ...priceListForm } as PriceList : pl));
    else setPriceLists(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...priceListForm as PriceList }]);
    setIsPriceListDialogOpen(false);
  };

  // Promo Handlers
  const handleOpenAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      name: '',
      productId: products[0]?.id || '',
      type: 'Percentage',
      value: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      enabled: true
    });
    setIsPromoDialogOpen(true);
  };

  const handleSavePromo = () => {
    if (!promoForm.name || !promoForm.productId) return;
    if (editingPromo) setPromoDiscounts(prev => prev.map(pd => pd.id === editingPromo.id ? { ...editingPromo, ...promoForm } as PromoDiscount : pd));
    else setPromoDiscounts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...promoForm as PromoDiscount }]);
    setIsPromoDialogOpen(false);
    toast({ title: "Success", description: "Promo discount saved." });
  };

  // Customer Handlers
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', phone: '', email: '', address: '' });
    setIsCustomerDialogOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;
    if (editingCustomer) setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } as Customer : c));
    else setCustomers(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), ...customerForm as Customer }]);
    setIsCustomerDialogOpen(false);
  };

  const handleValueChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setter(val === '' ? '' : parseFloat(val));
  };

  const filteredPackages = packages.filter(p => p.name.toLowerCase().includes(packageSearch.toLowerCase()) || p.sku.toLowerCase().includes(packageSearch.toLowerCase()));
  const filteredCombos = combos.filter(c => c.name.toLowerCase().includes(comboSearch.toLowerCase()) || c.sku.toLowerCase().includes(comboSearch.toLowerCase()));
  const filteredCategories = categories.filter(c => c !== 'All' && c.toLowerCase().includes(categorySearch.toLowerCase()));

  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard />;
      case 'Smartphone': return <Smartphone />;
      case 'Banknote': return <Banknote />;
      default: return <CreditCard />;
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileUpload}
      />
      
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="text-muted-foreground">Manage your POS configuration and master data</p>
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
          {activeTab === 'general' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <SettingsSection icon={Store} title="Store Information" description="Basic details about your establishment">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Store Name</Label>
                    <Input placeholder="Main Store" defaultValue="Alex's Deli" className="h-12 rounded-xl focus:ring-primary/20 border-2" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Currency Symbol</Label>
                    <Input defaultValue="$" className="h-12 rounded-xl focus:ring-primary/20 border-2" />
                  </div>
                </div>
              </SettingsSection>
            </Card>
          )}

          {activeTab === 'products' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Product Master</CardTitle><CardDescription className="font-medium">Manage your items and inventory</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleImportClick('products')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Import JSON</Button>
                  <Button onClick={() => { setEditingProduct(null); setProductForm({ onHandQty: '' as any, price: '' as any, costPrice: '' as any }); setIsProductDialogOpen(true); }} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add Product</Button>
                </div>
              </div>
              <div className="space-y-4">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border shadow-sm"><img src={p.image} className="h-full w-full object-cover" alt={p.name} /></div>
                      <div><p className="font-black text-lg leading-tight">{p.name}</p><div className="flex gap-2 items-center mt-1"><span className="text-primary font-black text-sm">${p.price.toFixed(2)}</span><Badge variant="outline" className="text-[9px] font-bold px-2 py-0">{p.sku}</Badge></div></div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setProducts(products.filter(item => item.id !== p.id))}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'pricelist' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Price Lists</CardTitle><CardDescription className="font-medium">Tiered pricing and date-based promos</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleImportClick('pricelist')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Import JSON</Button>
                  <Button onClick={handleOpenAddPriceList} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Create Price List</Button>
                </div>
              </div>
              <div className="space-y-4">
                {priceLists.map((pl) => (
                  <div key={pl.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><Tags /></div>
                      <div><p className="font-black text-lg leading-tight">{pl.name}</p><p className="text-xs font-bold text-muted-foreground mt-1">{products.find(p => p.id === pl.productId)?.name} • {pl.startDate} to {pl.endDate}</p></div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Badge className={cn("rounded-lg px-3 py-1 font-black text-[9px]", pl.enabled ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground')}>{pl.enabled ? 'ACTIVE' : 'DISABLED'}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPriceList(pl); setPriceListForm(pl); setIsPriceListDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'promo' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Master Promo Discount</CardTitle><CardDescription className="font-medium">Direct discounts per product</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleImportClick('promo')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Import JSON</Button>
                  <Button onClick={handleOpenAddPromo} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Create Promo</Button>
                </div>
              </div>
              <div className="space-y-4">
                {promoDiscounts.map((pd) => (
                  <div key={pd.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><Ticket /></div>
                      <div>
                        <p className="font-black text-lg leading-tight">{pd.name}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">
                          {products.find(p => p.id === pd.productId)?.name} • {pd.type === 'Percentage' ? `${pd.value}% Off` : `$${pd.value} Off`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Badge className={cn("rounded-lg px-3 py-1 font-black text-[9px]", pd.enabled ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground')}>{pd.enabled ? 'ACTIVE' : 'DISABLED'}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPromo(pd); setPromoForm(pd); setIsPromoDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPromoDiscounts(promoDiscounts.filter(item => item.id !== pd.id))}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'package' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Master Package</CardTitle><CardDescription className="font-medium">Manage product bundles and packages</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleImportClick('package')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Import JSON</Button>
                  <Button onClick={handleOpenAddPackage} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Package</Button>
                </div>
              </div>
              <div className="rounded-[1.5rem] border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead className="font-black">Nama Package</TableHead><TableHead className="font-black">SKU</TableHead><TableHead className="font-black">Harga Jual</TableHead><TableHead className="font-black">Status</TableHead><TableHead className="text-right font-black">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-bold">{pkg.name}</TableCell>
                        <TableCell><Badge variant="outline">{pkg.sku}</Badge></TableCell>
                        <TableCell className="font-black text-primary">${pkg.price.toFixed(2)}</TableCell>
                        <TableCell><Switch checked={pkg.enabled} onCheckedChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, enabled: val } : p))} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingPackage(pkg); setPackageForm(pkg); setIsPackageDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {activeTab === 'combo' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Master Combo</CardTitle><CardDescription className="font-medium">Manage flexible combo sets</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleImportClick('combo')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Import JSON</Button>
                  <Button onClick={handleOpenAddCombo} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Combo</Button>
                </div>
              </div>
              <div className="rounded-[1.5rem] border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead className="font-black">Nama Combo</TableHead><TableHead className="font-black">Harga Dasar</TableHead><TableHead className="font-black">Status</TableHead><TableHead className="text-right font-black">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredCombos.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold">{c.name}</TableCell>
                        <TableCell className="font-black text-primary">${c.basePrice.toFixed(2)}</TableCell>
                        <TableCell><Switch checked={c.enabled} onCheckedChange={(val) => setCombos(prev => prev.map(item => item.id === c.id ? { ...item, enabled: val } : item))} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingCombo(c); setComboForm(c); setIsComboDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setCombos(prev => prev.filter(item => item.id !== c.id))}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div><CardTitle className="text-2xl font-black">Master Payment</CardTitle><CardDescription className="font-medium">Manage available payment methods</CardDescription></div>
                <Button onClick={handleOpenAddPayment} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add Payment</Button>
              </div>
              <div className="space-y-4">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary shadow-sm border">{getPaymentIcon(pm.icon)}</div>
                      <div>
                        <p className="font-black text-lg leading-tight">{pm.name}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">{pm.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Switch checked={pm.enabled} onCheckedChange={(val) => setPaymentMethods(prev => prev.map(item => item.id === pm.id ? { ...item, enabled: val } : item))} />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingPayment(pm); setPaymentForm(pm); setIsPaymentDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPaymentMethods(prev => prev.filter(item => item.id !== pm.id))}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'fees' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div><CardTitle className="text-2xl font-black">Fees & Discounts</CardTitle><CardDescription className="font-medium">Manage taxes, service charges, and discounts</CardDescription></div>
                <Button onClick={handleOpenAddFee} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add Fee/Discount</Button>
              </div>
              <div className="space-y-4">
                {fees.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary shadow-sm border"><Percent /></div>
                      <div>
                        <p className="font-black text-lg leading-tight">{f.name}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">{f.type} • {f.value}%</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Switch checked={f.enabled} onCheckedChange={(val) => setFees(prev => prev.map(item => item.id === f.id ? { ...item, enabled: val } : item))} />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingFee(f); setFeeForm(f); setIsFeeDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setFees(prev => prev.filter(item => item.id !== f.id))}><Trash2 className="h-5 w-5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'categories' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div><CardTitle className="text-2xl font-black">Master Kategori</CardTitle><CardDescription className="font-medium">Manage product categories</CardDescription></div>
                <Button onClick={handleOpenAddCategory} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Kategori</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => (
                  <div key={cat} className="group flex items-center justify-between p-5 bg-muted/10 rounded-3xl border border-transparent hover:border-primary/20 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5">
                    <div className="flex items-center gap-4"><div className="bg-primary/5 p-3 rounded-2xl text-primary"><Layers className="h-5 w-5" /></div><span className="font-black text-lg">{cat}</span></div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(cat); setCategoryForm(cat); setIsCategoryDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive/40" onClick={() => handleDeleteCategory(cat)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'customers' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div><CardTitle className="text-2xl font-black">Customer Master</CardTitle><CardDescription className="font-medium">Track your loyal shoppers</CardDescription></div>
                <Button onClick={handleOpenAddCustomer} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add Customer</Button>
              </div>
              <div className="space-y-4">
                {customers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5"><div className="bg-white p-4 rounded-2xl text-primary shadow-sm border"><Users /></div><div><p className="font-black text-lg leading-tight">{c.name}</p><p className="text-xs font-bold text-muted-foreground mt-1">{c.phone}</p></div></div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(c); setCustomerForm(c); setIsCustomerDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setCustomers(customers.filter(cust => cust.id !== c.id))}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs... (Remaining UI code unchanged) */}
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">{editingPayment ? 'Edit Payment' : 'Add Payment'}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Payment Name</Label><Input value={paymentForm.name || ''} onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Icon Type</Label>
              <Select value={paymentForm.icon} onValueChange={(val: any) => setPaymentForm({...paymentForm, icon: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Banknote">Banknote (Cash)</SelectItem>
                  <SelectItem value="CreditCard">Credit Card</SelectItem>
                  <SelectItem value="Smartphone">Smartphone (Digital)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Description</Label><Input value={paymentForm.description || ''} onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})} className="h-12 rounded-xl border-2" /></div>
          </div>
          <DialogFooter className="mt-8"><Button onClick={handleSavePayment} className="w-full h-16 rounded-2xl bg-primary font-black text-lg">Save Payment Method</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">{editingFee ? 'Edit Fee/Discount' : 'Add Fee/Discount'}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Fee Name</Label><Input value={feeForm.name || ''} onChange={(e) => setFeeForm({...feeForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Fee Type</Label>
              <Select value={feeForm.type} onValueChange={(val: any) => setFeeForm({...feeForm, type: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Tax">Tax</SelectItem>
                  <SelectItem value="Service">Service Charge</SelectItem>
                  <SelectItem value="Discount">Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Percentage (%)</Label>
              <Input type="number" value={feeForm.value || ''} onChange={handleValueChange((val: any) => setFeeForm({...feeForm, value: val}))} className="h-12 rounded-xl border-2" />
            </div>
          </div>
          <DialogFooter className="mt-8"><Button onClick={handleSaveFee} className="w-full h-16 rounded-2xl bg-primary font-black text-lg">Save Fee/Discount</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle></DialogHeader>
          <div className="space-y-6"><div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nama Kategori</Label><Input value={categoryForm} onChange={(e) => setCategoryForm(e.target.value)} placeholder="Bakery, Seafood, dll" className="h-12 rounded-xl border-2 focus:ring-primary/20" /></div></div>
          <DialogFooter className="mt-8"><Button onClick={handleSaveCategory} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20 gap-2"><Check className="h-5 w-5" />Simpan Kategori</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Product Details</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
             <div className="space-y-6">
                <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Product Name</Label><Input value={productForm.name || ''} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="h-12 rounded-xl focus:ring-primary/20 border-2" /></div>
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}>
                    <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Description</Label><Input value={productForm.description || ''} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="h-12 rounded-xl border-2" /></div>
             </div>
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">SKU</Label><Input value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} className="h-12 rounded-xl border-2" /></div>
                   <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Barcode</Label><Input value={productForm.barcode || ''} onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} className="h-12 rounded-xl border-2" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Price ($)</Label><Input type="number" value={productForm.price || ''} onChange={handleValueChange((val: any) => setProductForm({...productForm, price: val}))} className="h-12 rounded-xl border-2 font-black text-primary" /></div>
                   <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Cost ($)</Label><Input type="number" value={productForm.costPrice || ''} onChange={handleValueChange((val: any) => setProductForm({...productForm, costPrice: val}))} className="h-12 rounded-xl border-2 font-black" /></div>
                </div>
                <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">On Hand Qty</Label><Input type="number" value={productForm.onHandQty || ''} onChange={handleValueChange((val: any) => setProductForm({...productForm, onHandQty: val}))} className="h-12 rounded-xl border-2 font-black" /></div>
             </div>
          </div>
          <DialogFooter className="mt-8"><Button onClick={() => { if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productForm } as Product : p)); else setProducts([...products, { id: Math.random().toString(36).substr(2, 9), ...productForm, available: true } as Product]); setIsProductDialogOpen(false); }} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20">Save Product</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promo Dialog */}
      <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Promo Discount Detail</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Promo Name</Label><Input value={promoForm.name || ''} onChange={(e) => setPromoForm({...promoForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Product</Label>
              <Select value={promoForm.productId} onValueChange={(val) => setPromoForm({...promoForm, productId: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Discount Type</Label>
                <Select value={promoForm.type} onValueChange={(val: any) => setPromoForm({...promoForm, type: val})}>
                  <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Percentage">Percentage (%)</SelectItem>
                    <SelectItem value="FixedAmount">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Value</Label><Input type="number" value={promoForm.value || ''} onChange={handleValueChange((val: any) => setPromoForm({...promoForm, value: val}))} className="h-12 rounded-xl border-2 font-black text-primary" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Start Date</Label><Input type="date" value={promoForm.startDate || ''} onChange={(e) => setPromoForm({...promoForm, startDate: e.target.value})} className="h-12 rounded-xl border-2" /></div>
              <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">End Date</Label><Input type="date" value={promoForm.endDate || ''} onChange={(e) => setPromoForm({...promoForm, endDate: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            </div>
          </div>
          <DialogFooter className="mt-8"><Button onClick={handleSavePromo} className="w-full h-16 rounded-2xl bg-primary font-black text-lg">Save Promo</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package Dialog */}
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Package Configuration</DialogTitle></DialogHeader>
          <div className="space-y-8 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nama Package</Label><Input value={packageForm.name || ''} onChange={(e) => setPackageForm({...packageForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
               <div className="space-y-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">SKU Package</Label><Input value={packageForm.sku || ''} onChange={(e) => setPackageForm({...packageForm, sku: e.target.value})} className="h-12 rounded-xl border-2" /></div>
               <div className="col-span-full space-y-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Deskripsi</Label><Textarea value={packageForm.description || ''} onChange={(e) => setPackageForm({...packageForm, description: e.target.value})} className="min-h-[100px] rounded-xl border-2" /></div>
               <div className="space-y-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Harga Jual Paket ($)</Label><Input type="number" value={packageForm.price || ''} onChange={handleValueChange((val: any) => setPackageForm({...packageForm, price: val}))} className="h-14 rounded-xl border-2 font-black text-2xl text-primary" /></div>
             </div>
             <Separator className="my-6" />
             <div className="space-y-4">
               <div className="flex justify-between items-center"><Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">Komposisi Produk</Label><Button variant="outline" size="sm" onClick={addPackageItem} className="rounded-xl h-10 border-2 font-bold gap-2"><Plus className="h-4 w-4" /> Tambah Item</Button></div>
               <div className="space-y-3">{packageForm.items?.map((item, idx) => (<div key={idx} className="flex gap-4 items-end p-5 bg-muted/20 rounded-[1.5rem] border border-transparent hover:border-primary/10 transition-all"><div className="flex-1 space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Produk</Label><Select value={item.productId} onValueChange={(val) => updatePackageItem(idx, 'productId', val)}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl">{products.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent></Select></div><div className="w-24 space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Qty</Label><Input type="number" value={item.quantity || ''} onChange={(e) => updatePackageItem(idx, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))} className="h-12 rounded-xl border-2 font-bold text-center" /></div><Button variant="ghost" size="icon" onClick={() => removePackageItem(idx)} className="h-12 w-12 text-destructive/40"><Trash2 className="h-5 w-5" /></Button></div>))}</div>
             </div>
          </div>
          <DialogFooter className="mt-8 gap-3"><Button variant="outline" onClick={() => setIsPackageDialogOpen(false)} className="h-16 rounded-2xl font-black text-lg px-8">Batal</Button><Button onClick={handleSavePackage} className="flex-1 h-16 rounded-2xl bg-primary font-black text-lg">Simpan Package</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Combo Dialog */}
      <Dialog open={isComboDialogOpen} onOpenChange={setIsComboDialogOpen}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Combo Configuration</DialogTitle></DialogHeader>
          <div className="space-y-8 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nama Combo</Label><Input value={comboForm.name || ''} onChange={(e) => setComboForm({...comboForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
               <div className="space-y-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">SKU Combo</Label><Input value={comboForm.sku || ''} onChange={(e) => setComboForm({...comboForm, sku: e.target.value})} className="h-12 rounded-xl border-2" /></div>
               <div className="space-y-2"><Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Harga Dasar Combo ($)</Label><Input type="number" value={comboForm.basePrice || ''} onChange={handleValueChange((val: any) => setComboForm({...comboForm, basePrice: val}))} className="h-14 rounded-xl border-2 font-black text-2xl text-primary" /></div>
             </div>
             <Separator className="my-6" />
             <div className="space-y-6">
               <div className="flex justify-between items-center"><div className="flex items-center gap-3"><Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">Choice Groups Builder</Label></div><Button onClick={addComboGroup} variant="outline" className="h-10 rounded-xl border-2 font-bold gap-2"><Plus className="h-4 w-4" /> Tambah Grup</Button></div>
               <div className="space-y-6">
                 {comboForm.groups?.map((group, gIdx) => (
                   <div key={group.id} className="p-6 bg-muted/10 rounded-[2rem] border-2 border-transparent hover:border-primary/5 transition-all space-y-6">
                     <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1 space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Nama Grup</Label><Input value={group.name} onChange={(e) => updateComboGroup(gIdx, 'name', e.target.value)} className="h-12 rounded-xl border-2 bg-white" /></div>
                        <div className="flex items-center gap-3 pt-8"><Checkbox id={`req-${group.id}`} checked={group.required} onCheckedChange={(val) => updateComboGroup(gIdx, 'required', !!val)} /><Label htmlFor={`req-${group.id}`} className="font-bold text-sm">Wajib Dipilih</Label></div>
                        <Button variant="ghost" size="icon" onClick={() => removeComboGroup(gIdx)} className="h-12 w-12 text-destructive/40 mt-6"><Trash2 className="h-5 w-5" /></Button>
                     </div>
                     <div className="space-y-3 pl-4 border-l-2 border-primary/10">
                        <div className="flex justify-between items-center mb-2"><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Produk Opsi:</p><Button onClick={() => addComboOption(gIdx)} variant="ghost" size="sm" className="h-8 text-[10px] font-black text-primary"><Plus className="h-3.5 w-3.5 mr-1" /> Tambah Opsi</Button></div>
                        {group.options.map((opt, oIdx) => (<div key={oIdx} className="flex gap-4 items-end bg-white/50 p-4 rounded-2xl border border-transparent hover:border-primary/5"><div className="flex-1 space-y-1.5"><Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Produk</Label><Select value={opt.productId} onValueChange={(val) => updateComboOption(gIdx, oIdx, 'productId', val)}><SelectTrigger className="h-10 rounded-lg bg-white border-2"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div><div className="w-28 space-y-1.5"><Label className="text-[9px] font-black uppercase tracking-widest opacity-40">Extra Price ($)</Label><Input type="number" value={opt.extraPrice || ''} onChange={(e) => updateComboOption(gIdx, oIdx, 'extraPrice', e.target.value === '' ? 0 : parseFloat(e.target.value))} className="h-10 rounded-lg bg-white border-2 font-bold" /></div><Button variant="ghost" size="icon" onClick={() => removeComboOption(gIdx, oIdx)} className="h-10 w-10 text-destructive/30"><Trash2 className="h-4 w-4" /></Button></div>))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
          <DialogFooter className="mt-10 gap-3"><Button variant="outline" onClick={() => setIsComboDialogOpen(false)} className="h-16 rounded-2xl font-black text-lg px-8">Batal</Button><Button onClick={handleSaveCombo} className="flex-1 h-16 rounded-2xl bg-primary font-black text-lg">Simpan Combo</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Customer Details</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label><Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label><Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} className="h-12 rounded-xl border-2" /></div>
          </div>
          <DialogFooter className="mt-8"><Button onClick={handleSaveCustomer} className="w-full h-16 rounded-2xl bg-primary font-black text-lg">Save Customer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price List Dialog */}
      <Dialog open={isPriceListDialogOpen} onOpenChange={setIsPriceListDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Price List Config</DialogTitle></DialogHeader>
          <div className="space-y-8">
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Name</Label><Input value={priceListForm.name || ''} onChange={(e) => setPriceListForm({...priceListForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Product</Label><Select value={priceListForm.productId} onValueChange={(val) => setPriceListForm({...priceListForm, productId: val})}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-6"><div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Start Date</Label><Input type="date" value={priceListForm.startDate || ''} onChange={(e) => setPriceListForm({...priceListForm, startDate: e.target.value})} className="h-12 rounded-xl border-2" /></div><div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">End Date</Label><Input type="date" value={priceListForm.endDate || ''} onChange={(e) => setPriceListForm({...priceListForm, endDate: e.target.value})} className="h-12 rounded-xl border-2" /></div></div>
            <div className="space-y-4">{priceListForm.tiers?.map((tier, idx) => (<div key={idx} className="flex gap-4 items-end p-5 bg-muted/20 rounded-[1.5rem]"><div className="flex-1 space-y-1.5"><Label className="text-[10px] font-black opacity-60">Min</Label><Input type="number" value={tier.minQty || ''} onChange={(e) => { const newTiers = [...(priceListForm.tiers || [])]; newTiers[idx].minQty = parseInt(e.target.value) || 0; setPriceListForm({...priceListForm, tiers: newTiers}); }} className="h-11 rounded-xl border-2" /></div><div className="flex-1 space-y-1.5"><Label className="text-[10px] font-black opacity-60">Max</Label><Input type="number" value={tier.maxQty || ''} onChange={(e) => { const newTiers = [...(priceListForm.tiers || [])]; newTiers[idx].maxQty = parseInt(e.target.value) || 0; setPriceListForm({...priceListForm, tiers: newTiers}); }} className="h-11 rounded-xl border-2" /></div><div className="flex-1 space-y-1.5"><Label className="text-[10px] font-black opacity-60">Price</Label><Input type="number" value={tier.price || ''} onChange={(e) => { const newTiers = [...(priceListForm.tiers || [])]; newTiers[idx].price = parseFloat(e.target.value) || 0; setPriceListForm({...priceListForm, tiers: newTiers}); }} className="h-11 rounded-xl border-2 font-black text-primary" /></div><Button variant="ghost" size="icon" onClick={() => setPriceListForm(prev => ({ ...prev, tiers: prev.tiers?.filter((_, i) => i !== idx) }))} className="text-destructive/40 h-11 w-11"><Trash2 className="h-5 w-5" /></Button></div>))}</div>
          </div>
          <DialogFooter className="mt-8"><Button onClick={handleSavePriceList} className="w-full h-16 rounded-2xl bg-primary font-black text-lg">Save Price List</Button></DialogFooter>
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
