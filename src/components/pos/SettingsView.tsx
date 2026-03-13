
"use client";

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Package,
  Barcode,
  Users,
  Tags,
  Calendar
} from 'lucide-react';
import { usePOS } from './POSContext';
import { Category, Product, PaymentMethod, Fee, FeeType, Customer, PriceList, PriceTier } from '@/types/pos';
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

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees,
    customers, setCustomers,
    priceLists, setPriceLists
  } = usePOS();
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation & Dialog States
  const [activeTab, setActiveTab] = useState('general');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPriceListDialogOpen, setIsPriceListDialogOpen] = useState(false);

  // Form States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormValue, setCategoryFormValue] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [priceListForm, setPriceListForm] = useState<Partial<PriceList>>({ tiers: [] });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductForm(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  // --- Price List Handlers ---
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

  const addPriceTier = () => {
    setPriceListForm(prev => ({
      ...prev,
      tiers: [...(prev.tiers || []), { minQty: 1, maxQty: 999, price: 0 }]
    }));
  };

  const removePriceTier = (index: number) => {
    setPriceListForm(prev => ({
      ...prev,
      tiers: prev.tiers?.filter((_, i) => i !== index)
    }));
  };

  // --- Customer Handlers ---
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

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="text-muted-foreground">Manage your POS configuration and master data</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl h-14 border shadow-sm mb-8 flex overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="general" className="rounded-xl px-8 font-bold">General</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl px-8 font-bold">Products</TabsTrigger>
          <TabsTrigger value="customers" className="rounded-xl px-8 font-bold">Customers</TabsTrigger>
          <TabsTrigger value="pricelist" className="rounded-xl px-8 font-bold">Price Lists</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-8 font-bold">Categories</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl px-8 font-bold">Payments</TabsTrigger>
          <TabsTrigger value="fees" className="rounded-xl px-8 font-bold">Fees & Discounts</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
           <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <SettingsSection icon={Store} title="Store Information" description="Basic details about your establishment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2"><Label>Store Name</Label><Input placeholder="Main Store" defaultValue="Alex's Deli" className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Currency Symbol</Label><Input defaultValue="$" className="rounded-xl" /></div>
              </div>
            </SettingsSection>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div><CardTitle className="text-2xl font-black">Product Master</CardTitle><CardDescription>Add, edit or remove products</CardDescription></div>
              <Button onClick={() => { setEditingProduct(null); setProductForm({}); setIsProductDialogOpen(true); }} className="rounded-2xl bg-primary hover:bg-primary/90 font-bold px-6 h-12 gap-2"><Plus /> Add Product</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={product.image} className="h-12 w-12 rounded-xl object-cover" alt={product.name} />
                    <div>
                      <p className="font-black text-lg">{product.name}</p>
                      <div className="flex gap-2 items-center">
                        <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                        <Badge variant="outline" className="text-[10px]">{product.sku}</Badge>
                        <span className="text-[10px] text-muted-foreground">Stock: {product.onHandQty}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setProducts(products.filter(p => p.id !== product.id))}><Trash2 className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setProductForm(product); setIsProductDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div><CardTitle className="text-2xl font-black">Customer Master</CardTitle><CardDescription>Track sales by customer</CardDescription></div>
              <Button onClick={handleOpenAddCustomer} className="rounded-2xl bg-primary font-bold h-12 gap-2"><Plus /> Add Customer</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {customers.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-5 bg-muted/20 rounded-[2rem]">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl text-primary"><Users /></div>
                    <div>
                      <p className="font-black text-lg">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(c); setCustomerForm(c); setIsCustomerDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setCustomers(customers.filter(cust => cust.id !== c.id))}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricelist">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div><CardTitle className="text-2xl font-black">Price Lists</CardTitle><CardDescription>Set tiered pricing based on quantity and dates</CardDescription></div>
              <Button onClick={handleOpenAddPriceList} className="rounded-2xl bg-primary font-bold h-12 gap-2"><Plus /> Create Price List</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {priceLists.map((pl) => {
                const product = products.find(p => p.id === pl.productId);
                return (
                  <div key={pl.id} className="flex items-center justify-between p-5 bg-muted/20 rounded-[2rem]">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary"><Tags /></div>
                      <div>
                        <p className="font-black text-lg">{pl.name}</p>
                        <p className="text-xs font-bold text-muted-foreground">Product: {product?.name} • {pl.startDate} to {pl.endDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={pl.enabled ? 'default' : 'outline'}>{pl.enabled ? 'Active' : 'Disabled'}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPriceList(pl); setPriceListForm(pl); setIsPriceListDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setPriceLists(priceLists.filter(p => p.id !== pl.id))}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle className="text-2xl font-black">Product Details</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
             <div className="space-y-4">
                <div className="space-y-2"><Label>Product Name</Label><Input value={productForm.name || ''} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Description</Label><Input value={productForm.description || ''} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="rounded-xl" /></div>
             </div>
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><Label>SKU</Label><Input value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} className="rounded-xl" /></div>
                   <div className="space-y-2"><Label>Barcode</Label><Input value={productForm.barcode || ''} onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} className="rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={productForm.price || ''} onChange={(e) => setProductForm({...productForm, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="rounded-xl" /></div>
                   <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" value={productForm.costPrice || ''} onChange={(e) => setProductForm({...productForm, costPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="rounded-xl" /></div>
                </div>
                <div className="space-y-2"><Label>On Hand Quantity</Label><Input type="number" value={productForm.onHandQty || ''} onChange={(e) => setProductForm({...productForm, onHandQty: e.target.value === '' ? 0 : parseInt(e.target.value)})} className="rounded-xl" /></div>
             </div>
          </div>
          <DialogFooter><Button onClick={() => {
            if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productForm } as Product : p));
            else setProducts([...products, { id: Math.random().toString(36).substr(2, 9), ...productForm, available: true } as Product]);
            setIsProductDialogOpen(false);
          }} className="w-full h-12 rounded-xl bg-primary font-bold">Save Product</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black">Customer Details</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Phone Number</Label><Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={customerForm.email || ''} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={customerForm.address || ''} onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})} className="rounded-xl" /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveCustomer} className="w-full h-12 rounded-xl bg-primary font-bold">Save Customer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price List Dialog */}
      <Dialog open={isPriceListDialogOpen} onOpenChange={setIsPriceListDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle className="text-2xl font-black">Price List Config</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2"><Label>Price List Name</Label><Input value={priceListForm.name || ''} onChange={(e) => setPriceListForm({...priceListForm, name: e.target.value})} placeholder="Wholesale Promo" className="rounded-xl" /></div>
            
            <div className="space-y-2">
              <Label>Target Product</Label>
              <Select value={priceListForm.productId} onValueChange={(val) => setPriceListForm({...priceListForm, productId: val})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={priceListForm.startDate || ''} onChange={(e) => setPriceListForm({...priceListForm, startDate: e.target.value})} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={priceListForm.endDate || ''} onChange={(e) => setPriceListForm({...priceListForm, endDate: e.target.value})} className="rounded-xl" /></div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-black uppercase tracking-widest text-xs">Quantity Tiers</Label>
                <Button variant="outline" size="sm" onClick={addPriceTier} className="rounded-xl h-8 text-[10px]"><Plus className="h-3 w-3 mr-1" /> Add Tier</Button>
              </div>
              <div className="space-y-3">
                {priceListForm.tiers?.map((tier, idx) => (
                  <div key={idx} className="flex gap-3 items-end p-4 bg-muted/20 rounded-2xl">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Min Qty</Label>
                      <Input type="number" value={tier.minQty || ''} onChange={(e) => {
                        const newTiers = [...(priceListForm.tiers || [])];
                        newTiers[idx].minQty = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPriceListForm({...priceListForm, tiers: newTiers});
                      }} className="h-10 rounded-lg" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Max Qty</Label>
                      <Input type="number" value={tier.maxQty || ''} onChange={(e) => {
                        const newTiers = [...(priceListForm.tiers || [])];
                        newTiers[idx].maxQty = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPriceListForm({...priceListForm, tiers: newTiers});
                      }} className="h-10 rounded-lg" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Tier Price ($)</Label>
                      <Input type="number" value={tier.price || ''} onChange={(e) => {
                        const newTiers = [...(priceListForm.tiers || [])];
                        newTiers[idx].price = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        setPriceListForm({...priceListForm, tiers: newTiers});
                      }} className="h-10 rounded-lg font-bold text-primary" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removePriceTier(idx)} className="text-destructive h-10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between"><Label>Enabled</Label><Switch checked={priceListForm.enabled} onCheckedChange={(val) => setPriceListForm({...priceListForm, enabled: val})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSavePriceList} className="w-full h-12 rounded-xl bg-primary font-bold">Apply Price List</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-2"><div className="bg-primary/5 p-3 rounded-2xl text-primary h-fit"><Icon className="h-6 w-6" /></div><div><h3 className="text-xl font-bold">{title}</h3><p className="text-sm text-muted-foreground">{description}</p></div></div>
      {children}
    </div>
  );
}
