
"use client";

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  Printer, 
  Bell, 
  Plus, 
  Trash2, 
  Pencil,
  CreditCard,
  Percent,
  Upload,
  Image as ImageIcon,
  Eye,
  Package as PackageIcon,
  Barcode,
  Users,
  Tags,
  Calendar,
  Layers,
  Box,
  LayoutGrid,
  Settings as SettingsIcon,
  ChevronRight,
  Search,
  Check
} from 'lucide-react';
import { usePOS } from './POSContext';
import { Category, Product, PaymentMethod, Fee, FeeType, Customer, PriceList, PriceTier, Package, PackageItem } from '@/types/pos';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees,
    customers, setCustomers,
    priceLists, setPriceLists,
    packages, setPackages
  } = usePOS();
  
  const { toast } = useToast();

  // State for active menu
  const [activeTab, setActiveTab] = useState('general');
  const [packageSearch, setPackageSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Dialog States
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPriceListDialogOpen, setIsPriceListDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Form States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [priceListForm, setPriceListForm] = useState<Partial<PriceList>>({ tiers: [] });
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState<Partial<Package>>({ items: [] });
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState('');

  // Navigation Items
  const navGroups = [
    {
      title: "Produk",
      items: [
        { id: 'products', icon: PackageIcon, label: 'Master Produk' },
        { id: 'pricelist', icon: Tags, label: 'Master Pricelist' },
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
      // Update categories in products too
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

  // Package Handlers
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({
      name: '',
      sku: '',
      description: '',
      price: '' as any,
      enabled: true,
      items: []
    });
    setIsPackageDialogOpen(true);
  };

  const handleSavePackage = () => {
    if (!packageForm.name || !packageForm.sku || !packageForm.price) {
      toast({ variant: "destructive", title: "Error", description: "Mohon lengkapi data wajib." });
      return;
    }
    if (editingPackage) {
      setPackages(prev => prev.map(p => p.id === editingPackage.id ? { ...editingPackage, ...packageForm } as Package : p));
    } else {
      const newPkg: Package = {
        id: Math.random().toString(36).substr(2, 9),
        ...packageForm as Package
      };
      setPackages(prev => [...prev, newPkg]);
    }
    setIsPackageDialogOpen(false);
    toast({ title: "Success", description: "Package saved." });
  };

  const addPackageItem = () => {
    setPackageForm(prev => ({
      ...prev,
      items: [...(prev.items || []), { productId: products[0]?.id || '', quantity: 1 }]
    }));
  };

  const removePackageItem = (idx: number) => {
    setPackageForm(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== idx)
    }));
  };

  const updatePackageItem = (idx: number, field: keyof PackageItem, value: any) => {
    setPackageForm(prev => {
      const newItems = [...(prev.items || [])];
      newItems[idx] = { ...newItems[idx], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Price List Handlers
  const handleOpenAddPriceList = () => {
    setEditingPriceList(null);
    setPriceListForm({ 
      name: '', 
      productId: products[0]?.id || '', 
      startDate: new Date().toISOString().split('T')[0], 
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tiers: [{ minQty: 1, maxQty: 10, price: 0 }],
      enabled: true 
    });
    setIsPriceListDialogOpen(true);
  };

  const handleSavePriceList = () => {
    if (!priceListForm.name || !priceListForm.productId) return;
    if (editingPriceList) {
      setPriceLists(prev => prev.map(pl => pl.id === editingPriceList.id ? { ...editingPriceList, ...priceListForm } as PriceList : pl));
    } else {
      const newList: PriceList = {
        id: Math.random().toString(36).substr(2, 9),
        ...priceListForm as PriceList
      };
      setPriceLists(prev => [...prev, newList]);
    }
    setIsPriceListDialogOpen(false);
    toast({ title: "Success", description: "Price list saved." });
  };

  // Customer Handlers
  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', phone: '', email: '', address: '' });
    setIsCustomerDialogOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } as Customer : c));
    } else {
      const newCust: Customer = {
        id: Math.random().toString(36).substr(2, 9),
        ...customerForm as Customer
      };
      setCustomers(prev => [...prev, newCust]);
    }
    setIsCustomerDialogOpen(false);
    toast({ title: "Success", description: "Customer saved." });
  };

  const handleValueChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setter(val === '' ? '' : parseFloat(val));
  };

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(packageSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(packageSearch.toLowerCase())
  );

  const filteredCategories = categories.filter(c => 
    c !== 'All' && c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="text-muted-foreground">Manage your POS configuration and master data</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 bg-white rounded-[2rem] p-4 shadow-sm border border-muted/50">
          <div className="space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                        activeTab === item.id
                          ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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

        {/* Content Area */}
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
              <div className="flex justify-between items-center mb-8">
                <div>
                  <CardTitle className="text-2xl font-black">Product Master</CardTitle>
                  <CardDescription className="font-medium">Manage your items and inventory</CardDescription>
                </div>
                <Button onClick={() => { setEditingProduct(null); setProductForm({ onHandQty: '' as any, price: '' as any, costPrice: '' as any }); setIsProductDialogOpen(true); }} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5" /> Add Product
                </Button>
              </div>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border shadow-sm">
                        <img src={product.image} className="h-full w-full object-cover" alt={product.name} />
                      </div>
                      <div>
                        <p className="font-black text-lg leading-tight">{product.name}</p>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-primary font-black text-sm">${product.price.toFixed(2)}</span>
                          <Badge variant="outline" className="text-[9px] font-bold border-muted-foreground/20 text-muted-foreground px-2 py-0">{product.sku}</Badge>
                          <span className="text-[10px] font-bold text-muted-foreground">Stock: {product.onHandQty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-muted-foreground hover:text-primary" onClick={() => { setEditingProduct(product); setProductForm(product); setIsProductDialogOpen(true); }}>
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive" onClick={() => setProducts(products.filter(p => p.id !== product.id))}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'pricelist' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <CardTitle className="text-2xl font-black">Price Lists</CardTitle>
                  <CardDescription className="font-medium">Tiered pricing and date-based promos</CardDescription>
                </div>
                <Button onClick={handleOpenAddPriceList} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5" /> Create Price List
                </Button>
              </div>
              <div className="space-y-4">
                {priceLists.map((pl) => {
                  const product = products.find(p => p.id === pl.productId);
                  return (
                    <div key={pl.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                      <div className="flex items-center gap-5">
                        <div className="bg-white p-4 rounded-2xl text-primary shadow-sm border"><Tags /></div>
                        <div>
                          <p className="font-black text-lg leading-tight">{pl.name}</p>
                          <p className="text-xs font-bold text-muted-foreground mt-1">
                            {product?.name} • {pl.startDate} to {pl.endDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Badge className={cn("rounded-lg px-3 py-1 font-black text-[9px] border-none", pl.enabled ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground')}>
                          {pl.enabled ? 'ACTIVE' : 'DISABLED'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => { setEditingPriceList(pl); setPriceListForm(pl); setIsPriceListDialogOpen(true); }}>
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive/50 hover:text-destructive" onClick={() => setPriceLists(priceLists.filter(p => p.id !== pl.id))}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {activeTab === 'package' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <CardTitle className="text-2xl font-black">Master Package</CardTitle>
                  <CardDescription className="font-medium">Manage product bundles and packages</CardDescription>
                </div>
                <Button onClick={handleOpenAddPackage} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5" /> Tambah Package
                </Button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama package atau SKU..." 
                  value={packageSearch}
                  onChange={(e) => setPackageSearch(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 focus-visible:ring-primary/20"
                />
              </div>

              <div className="rounded-[1.5rem] border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-black">Nama Package</TableHead>
                      <TableHead className="font-black">SKU</TableHead>
                      <TableHead className="font-black">Total Item</TableHead>
                      <TableHead className="font-black">Harga Jual</TableHead>
                      <TableHead className="font-black">Status</TableHead>
                      <TableHead className="text-right font-black">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-bold">{pkg.name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono text-[10px]">{pkg.sku}</Badge></TableCell>
                        <TableCell>{pkg.items.length} Items</TableCell>
                        <TableCell className="font-black text-primary">${pkg.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={pkg.enabled} 
                            onCheckedChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, enabled: val } : p))} 
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => { setEditingPackage(pkg); setPackageForm(pkg); setIsPackageDialogOpen(true); }}>
                               <Pencil className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-destructive/50 hover:text-destructive" onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPackages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium italic">
                          Belum ada package yang dibuat.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {activeTab === 'categories' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <CardTitle className="text-2xl font-black">Master Kategori</CardTitle>
                  <CardDescription className="font-medium">Kelola kategori produk untuk filter POS</CardDescription>
                </div>
                <Button onClick={handleOpenAddCategory} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5" /> Tambah Kategori
                </Button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama kategori..." 
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 focus-visible:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => (
                  <div key={cat} className="group flex items-center justify-between p-5 bg-muted/10 rounded-3xl border border-transparent hover:border-primary/20 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/5 p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                        <Layers className="h-5 w-5" />
                      </div>
                      <span className="font-black text-lg">{cat}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary" onClick={() => { setEditingCategory(cat); setCategoryForm(cat); setIsCategoryDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive/40 hover:text-destructive" onClick={() => handleDeleteCategory(cat)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="col-span-full py-20 text-center opacity-30">
                    <Layers className="h-20 w-20 mx-auto mb-4" />
                    <p className="text-xl font-black">Tidak ada kategori ditemukan</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'customers' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <CardTitle className="text-2xl font-black">Customer Master</CardTitle>
                  <CardDescription className="font-medium">Track your loyal shoppers</CardDescription>
                </div>
                <Button onClick={handleOpenAddCustomer} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5" /> Add Customer
                </Button>
              </div>
              <div className="space-y-4">
                {customers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary shadow-sm border"><Users /></div>
                      <div>
                        <p className="font-black text-lg leading-tight">{c.name}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">{c.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => { setEditingCustomer(c); setCustomerForm(c); setIsCustomerDialogOpen(true); }}>
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive/50" onClick={() => setCustomers(customers.filter(cust => cust.id !== c.id))}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'combo' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-12 bg-white h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="bg-muted p-10 rounded-full mb-6">
                <LayoutGrid className="h-16 w-16" />
              </div>
              <h3 className="text-2xl font-black mb-2">Master Combo</h3>
              <p className="text-muted-foreground font-bold">This module is coming soon in the next update.</p>
            </Card>
          )}

          {/* Placeholder contents for other tabs */}
          {['payments', 'fees'].includes(activeTab) && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
               <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
                  <SettingsIcon className="h-20 w-20 mb-4" />
                  <p className="text-xl font-bold uppercase tracking-widest">{activeTab} Settings</p>
               </div>
            </Card>
          )}
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nama Kategori</Label>
              <Input 
                value={categoryForm} 
                onChange={(e) => setCategoryForm(e.target.value)} 
                placeholder="Contoh: Bakery, Seafood, dll"
                className="h-12 rounded-xl border-2 focus-visible:ring-primary/20" 
              />
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button onClick={handleSaveCategory} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20 gap-2">
              <Check className="h-5 w-5" />
              Simpan Kategori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Product Details</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
             <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Product Name</Label>
                  <Input value={productForm.name || ''} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="h-12 rounded-xl focus:ring-primary/20 border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}>
                    <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">{categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                  <Input value={productForm.description || ''} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="h-12 rounded-xl border-2" />
                </div>
             </div>
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">SKU</Label>
                     <Input value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} className="h-12 rounded-xl border-2" />
                   </div>
                   <div className="space-y-2">
                     <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Barcode</Label>
                     <Input value={productForm.barcode || ''} onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} className="h-12 rounded-xl border-2" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Price ($)</Label>
                     <Input type="number" value={productForm.price === 0 || productForm.price === '' as any ? '' : productForm.price} onChange={handleValueChange((val: any) => setProductForm({...productForm, price: val}))} className="h-12 rounded-xl border-2 font-black text-primary" />
                   </div>
                   <div className="space-y-2">
                     <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Cost ($)</Label>
                     <Input type="number" value={productForm.costPrice === 0 || productForm.costPrice === '' as any ? '' : productForm.costPrice} onChange={handleValueChange((val: any) => setProductForm({...productForm, costPrice: val}))} className="h-12 rounded-xl border-2 font-black" />
                   </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">On Hand Qty</Label>
                  <Input type="number" value={productForm.onHandQty === 0 || productForm.onHandQty === '' as any ? '' : productForm.onHandQty} onChange={handleValueChange((val: any) => setProductForm({...productForm, onHandQty: val}))} className="h-12 rounded-xl border-2 font-black" />
                </div>
             </div>
          </div>
          <DialogFooter className="mt-8">
            <Button onClick={() => {
              if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productForm } as Product : p));
              else setProducts([...products, { id: Math.random().toString(36).substr(2, 9), ...productForm, available: true } as Product]);
              setIsProductDialogOpen(false);
            }} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20">Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package Dialog */}
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black">Package Configuration</DialogTitle>
            <DialogDescription className="font-medium">Tentukan nama, SKU, dan komposisi item untuk paket ini.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-4">
             {/* Basic Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nama Package</Label>
                 <Input 
                   value={packageForm.name || ''} 
                   onChange={(e) => setPackageForm({...packageForm, name: e.target.value})} 
                   placeholder="e.g. Family Bundle" 
                   className="h-12 rounded-xl border-2 focus:ring-primary/20"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">SKU Package</Label>
                 <Input 
                   value={packageForm.sku || ''} 
                   onChange={(e) => setPackageForm({...packageForm, sku: e.target.value})} 
                   placeholder="PKG-001" 
                   className="h-12 rounded-xl border-2 font-mono"
                 />
               </div>
               <div className="col-span-full space-y-2">
                 <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Deskripsi</Label>
                 <Textarea 
                   value={packageForm.description || ''} 
                   onChange={(e) => setPackageForm({...packageForm, description: e.target.value})} 
                   placeholder="Berikan keterangan detail isi paket..." 
                   className="min-h-[100px] rounded-xl border-2"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Harga Jual Paket ($)</Label>
                 <Input 
                   type="number" 
                   value={packageForm.price === 0 || packageForm.price === '' as any ? '' : packageForm.price} 
                   onChange={handleValueChange((val: any) => setPackageForm({...packageForm, price: val}))}
                   className="h-14 rounded-xl border-2 font-black text-2xl text-primary"
                 />
               </div>
             </div>

             <Separator className="my-6" />

             {/* Items Composition */}
             <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground ml-1">Komposisi Produk</Label>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={addPackageItem}
                   className="rounded-xl h-10 border-2 font-bold gap-2"
                 >
                   <Plus className="h-4 w-4" /> Tambah Item Produk
                 </Button>
               </div>

               <div className="space-y-3">
                 {packageForm.items?.map((item, idx) => (
                   <div key={idx} className="flex gap-4 items-end p-5 bg-muted/20 rounded-[1.5rem] border border-transparent hover:border-primary/10 transition-all">
                     <div className="flex-1 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Pilih Produk</Label>
                        <Select 
                          value={item.productId} 
                          onValueChange={(val) => updatePackageItem(idx, 'productId', val)}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {products.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} (${p.price.toFixed(2)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                     </div>
                     <div className="w-24 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Qty</Label>
                        <Input 
                          type="number" 
                          value={item.quantity === 0 ? '' : item.quantity} 
                          onChange={(e) => updatePackageItem(idx, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                          className="h-12 rounded-xl border-2 font-bold text-center"
                        />
                     </div>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => removePackageItem(idx)}
                       className="h-12 w-12 text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-xl"
                     >
                       <Trash2 className="h-5 w-5" />
                     </Button>
                   </div>
                 ))}
                 {(packageForm.items?.length || 0) === 0 && (
                   <div className="text-center py-12 bg-muted/10 rounded-[2rem] border-2 border-dashed">
                      <p className="text-sm font-bold text-muted-foreground opacity-50">Belum ada item produk dalam paket ini.</p>
                   </div>
                 )}
               </div>
             </div>
          </div>

          <DialogFooter className="mt-8 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsPackageDialogOpen(false)} 
              className="h-16 rounded-2xl font-black text-lg px-8 border-2"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSavePackage} 
              className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20"
            >
              Simpan Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Customer Details</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label><Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label><Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Email</Label><Input value={customerForm.email || ''} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} className="h-12 rounded-xl border-2" /></div>
          </div>
          <DialogFooter className="mt-8">
            <Button onClick={handleSaveCustomer} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20">Save Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price List Dialog */}
      <Dialog open={isPriceListDialogOpen} onOpenChange={setIsPriceListDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh] border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">Price List Config</DialogTitle></DialogHeader>
          <div className="space-y-8">
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Price List Name</Label>
              <Input value={priceListForm.name || ''} onChange={(e) => setPriceListForm({...priceListForm, name: e.target.value})} placeholder="Wholesale Promo" className="h-12 rounded-xl border-2" />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Target Product</Label>
              <Select value={priceListForm.productId} onValueChange={(val) => setPriceListForm({...priceListForm, productId: val})}>
                <SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Start Date</Label>
                <Input type="date" value={priceListForm.startDate || ''} onChange={(e) => setPriceListForm({...priceListForm, startDate: e.target.value})} className="h-12 rounded-xl border-2" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">End Date</Label>
                <Input type="date" value={priceListForm.endDate || ''} onChange={(e) => setPriceListForm({...priceListForm, endDate: e.target.value})} className="h-12 rounded-xl border-2" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-black uppercase tracking-widest text-[10px] text-muted-foreground ml-1">Quantity Tiers</Label>
                <Button variant="outline" size="sm" onClick={() => setPriceListForm(prev => ({ ...prev, tiers: [...(prev.tiers || []), { minQty: 1, maxQty: 99, price: 0 }] }))} className="rounded-xl h-8 text-[10px] font-bold border-2">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Tier
                </Button>
              </div>
              <div className="space-y-4">
                {priceListForm.tiers?.map((tier, idx) => (
                  <div key={idx} className="flex gap-4 items-end p-5 bg-muted/20 rounded-[1.5rem] relative group border border-transparent hover:border-primary/10 transition-all">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Min Qty</Label>
                      <Input type="number" value={tier.minQty === 0 ? '' : tier.minQty} onChange={(e) => {
                        const newTiers = [...(priceListForm.tiers || [])];
                        newTiers[idx].minQty = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPriceListForm({...priceListForm, tiers: newTiers});
                      }} className="h-11 rounded-xl border-2 font-bold" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Max Qty</Label>
                      <Input type="number" value={tier.maxQty === 0 ? '' : tier.maxQty} onChange={(e) => {
                        const newTiers = [...(priceListForm.tiers || [])];
                        newTiers[idx].maxQty = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPriceListForm({...priceListForm, tiers: newTiers});
                      }} className="h-11 rounded-xl border-2 font-bold" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Price ($)</Label>
                      <Input type="number" value={tier.price === 0 ? '' : tier.price} onChange={(e) => {
                        const newTiers = [...(priceListForm.tiers || [])];
                        newTiers[idx].price = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setPriceListForm({...priceListForm, tiers: newTiers});
                      }} className="h-11 rounded-xl border-2 font-black text-primary" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setPriceListForm(prev => ({ ...prev, tiers: prev.tiers?.filter((_, i) => i !== idx) }))} className="text-destructive/40 hover:text-destructive h-11 w-11 rounded-xl">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-muted/10 p-5 rounded-2xl">
              <div className="space-y-0.5">
                <Label className="text-sm font-black">Enable Price List</Label>
                <p className="text-xs text-muted-foreground font-medium">Toggle this list to be active in POS</p>
              </div>
              <Switch checked={priceListForm.enabled} onCheckedChange={(val) => setPriceListForm({...priceListForm, enabled: val})} />
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button onClick={handleSavePriceList} className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20">Apply Price List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
  return (
    <div className="space-y-8">
      <div className="flex gap-5">
        <div className="bg-primary/10 p-4 rounded-2xl text-primary h-fit shadow-sm">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-2xl font-black leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">{description}</p>
        </div>
      </div>
      <div className="pl-0 lg:pl-4">
        {children}
      </div>
    </div>
  );
}
