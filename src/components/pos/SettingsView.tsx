
"use client";

import React, { useState } from 'react';
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
  Smartphone,
  Banknote,
  Wallet,
  Percent,
  Receipt
} from 'lucide-react';
import { usePOS } from './POSContext';
import { Category, Product, PaymentMethod, Fee, FeeType } from '@/types/pos';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees 
  } = usePOS();
  
  // Category States
  const [newCategory, setNewCategory] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormValue, setCategoryFormValue] = useState('');

  // Product States
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', price: 0, category: 'Main Course', available: true, description: '', image: 'https://picsum.photos/seed/new/400/300'
  });

  // Payment Method States
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({
    name: '', icon: 'CreditCard', description: '', enabled: true
  });

  // Fee States
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [feeForm, setFeeForm] = useState<Partial<Fee>>({
    name: '', type: 'Tax', value: 0, enabled: true
  });

  // --- Category Handlers ---
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory as Category)) {
      setCategories([...categories, newCategory as Category]);
      setNewCategory('');
    }
  };
  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat); setCategoryFormValue(cat); setIsCategoryDialogOpen(true);
  };
  const handleSaveCategory = () => {
    if (!editingCategory || !categoryFormValue) return;
    setCategories(categories.map(c => c === editingCategory ? categoryFormValue as Category : c));
    setProducts(products.map(p => p.category === editingCategory ? { ...p, category: categoryFormValue as Category } : p));
    setIsCategoryDialogOpen(false); setEditingCategory(null);
  };
  const handleDeleteCategory = (cat: Category) => {
    if (cat === 'All') return; setCategories(categories.filter(c => c !== cat));
  };

  // --- Product Handlers ---
  const handleOpenAddDialog = () => {
    setEditingProduct(null); setProductForm({ name: '', price: 0, category: 'Main Course', available: true, description: '', image: 'https://picsum.photos/seed/new/400/300' });
    setIsProductDialogOpen(true);
  };
  const handleOpenEditDialog = (product: Product) => {
    setEditingProduct(product); setProductForm({ ...product }); setIsProductDialogOpen(true);
  };
  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productForm } as Product : p));
    } else {
      const newProd: Product = { id: Math.random().toString(36).substr(2, 9), name: productForm.name || 'New Product', price: productForm.price || 0, category: productForm.category as Category || 'Main Course', available: productForm.available ?? true, description: productForm.description || '', image: productForm.image || 'https://picsum.photos/seed/new/400/300' };
      setProducts([...products, newProd]);
    }
    setIsProductDialogOpen(false);
  };
  const handleDeleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

  // --- Payment Handlers ---
  const handleOpenAddPayment = () => {
    setEditingPayment(null); setPaymentForm({ name: '', icon: 'CreditCard', description: '', enabled: true }); setIsPaymentDialogOpen(true);
  };
  const handleOpenEditPayment = (pm: PaymentMethod) => {
    setEditingPayment(pm); setPaymentForm({ ...pm }); setIsPaymentDialogOpen(true);
  };
  const handleSavePayment = () => {
    if (editingPayment) {
      setPaymentMethods(paymentMethods.map(p => p.id === editingPayment.id ? { ...editingPayment, ...paymentForm } as PaymentMethod : p));
    } else {
      const newPM: PaymentMethod = { id: Math.random().toString(36).substr(2, 9), name: paymentForm.name || 'New Payment Method', icon: paymentForm.icon as any || 'CreditCard', description: paymentForm.description || '', enabled: paymentForm.enabled ?? true };
      setPaymentMethods([...paymentMethods, newPM]);
    }
    setIsPaymentDialogOpen(false);
  };
  const handleDeletePayment = (id: string) => setPaymentMethods(paymentMethods.filter(p => p.id !== id));

  // --- Fee Handlers ---
  const handleOpenAddFee = () => {
    setEditingFee(null); setFeeForm({ name: '', type: 'Tax', value: 0, enabled: true }); setIsFeeDialogOpen(true);
  };
  const handleOpenEditFee = (fee: Fee) => {
    setEditingFee(fee); setFeeForm({ ...fee }); setIsFeeDialogOpen(true);
  };
  const handleSaveFee = () => {
    if (editingFee) {
      setFees(fees.map(f => f.id === editingFee.id ? { ...editingFee, ...feeForm } as Fee : f));
    } else {
      const newFee: Fee = { id: Math.random().toString(36).substr(2, 9), name: feeForm.name || 'New Fee', type: feeForm.type as FeeType || 'Tax', value: feeForm.value || 0, enabled: feeForm.enabled ?? true };
      setFees([...fees, newFee]);
    }
    setIsFeeDialogOpen(false);
  };
  const handleDeleteFee = (id: string) => setFees(fees.filter(f => f.id !== id));

  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard />;
      case 'Smartphone': return <Smartphone />;
      case 'Banknote': return <Banknote />;
      default: return <Wallet />;
    }
  };

  const getFeeTypeColor = (type: string) => {
    switch (type) {
      case 'Tax': return 'text-primary bg-primary/10';
      case 'Service': return 'text-orange-500 bg-orange-500/10';
      case 'Discount': return 'text-accent bg-accent/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="text-muted-foreground">Manage your POS configuration and master data</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl h-14 border shadow-sm mb-8 flex overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="general" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Products</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Categories</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Payments</TabsTrigger>
          <TabsTrigger value="fees" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Fees & Discounts</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 gap-8">
            <SettingsSection icon={Store} title="Store Information" description="Basic details about your establishment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2"><Label>Store Name</Label><Input placeholder="Main Store" defaultValue="Alex's Deli" className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Currency Symbol</Label><Input defaultValue="$" className="rounded-xl" /></div>
              </div>
            </SettingsSection>
            <SettingsSection icon={Bell} title="Notifications" description="Configure alert preferences">
              <div className="space-y-4 pt-4"><ToggleOption title="Order Alerts" description="Notify on new incoming orders" defaultChecked /><ToggleOption title="Low Stock" description="Notify when items are running out" defaultChecked /></div>
            </SettingsSection>
            <SettingsSection icon={Printer} title="Hardware" description="Connect and manage peripherals">
              <div className="space-y-4 pt-4"><ToggleOption title="Auto-print Receipt" description="Print receipt automatically after payment" defaultChecked /></div>
            </SettingsSection>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div><CardTitle className="text-2xl font-black">Product Master</CardTitle><CardDescription>Add, edit or remove products from your menu</CardDescription></div>
              <Button onClick={handleOpenAddDialog} className="rounded-2xl bg-primary hover:bg-primary/90 font-bold px-6 h-12 gap-2 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add New Product</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted"><img src={product.image} alt={product.name} className="object-cover w-full h-full" /></div>
                    <div>
                      <p className="font-black text-lg">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold text-sm">${product.price.toFixed(2)}</span>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-white rounded-lg">{product.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(product)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="mb-8"><CardTitle className="text-2xl font-black">Categories</CardTitle><CardDescription>Manage food categories for your menu</CardDescription></div>
            <div className="flex gap-4 mb-8">
              <Input placeholder="New Category Name..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="rounded-xl h-12 flex-1" />
              <Button onClick={handleAddCategory} className="rounded-xl bg-primary h-12 px-6 font-bold gap-2"><Plus className="h-5 w-5" /> Add</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl text-primary font-bold shadow-sm">{cat.charAt(0)}</div>
                    <span className="font-black text-lg">{cat}</span>
                  </div>
                  {cat !== 'All' && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditCategory(cat)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div><CardTitle className="text-2xl font-black">Payment Methods</CardTitle><CardDescription>Configure supported checkout payment options</CardDescription></div>
              <Button onClick={handleOpenAddPayment} className="rounded-2xl bg-primary hover:bg-primary/90 font-bold px-6 h-12 gap-2 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add Method</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-5 bg-muted/20 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-2xl text-primary shadow-sm">{getPaymentIcon(pm.icon)}</div>
                    <div><p className="font-black text-lg">{pm.name}</p><p className="text-xs text-muted-foreground font-medium">{pm.description}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${pm.enabled ? 'text-accent' : 'text-muted-foreground'}`}>{pm.enabled ? 'Active' : 'Disabled'}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditPayment(pm)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(pm.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div><CardTitle className="text-2xl font-black">Fees & Discounts</CardTitle><CardDescription>Manage taxes, service fees, and auto-discounts</CardDescription></div>
              <Button onClick={handleOpenAddFee} className="rounded-2xl bg-primary hover:bg-primary/90 font-bold px-6 h-12 gap-2 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Add Fee</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {fees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-5 bg-muted/20 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl shadow-sm ${getFeeTypeColor(fee.type)}`}><Percent className="h-6 w-6" /></div>
                    <div><p className="font-black text-lg">{fee.name}</p><p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{fee.type} • {fee.value}%</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${fee.enabled ? 'text-accent' : 'text-muted-foreground'}`}>{fee.enabled ? 'Active' : 'Disabled'}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditFee(fee)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl"><Pencil className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFee(fee.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-sm rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black">Edit Category</DialogTitle><CardDescription>Rename the category.</CardDescription></DialogHeader>
          <div className="py-4"><Label className="mb-2 block">Category Name</Label><Input value={categoryFormValue} onChange={(e) => setCategoryFormValue(e.target.value)} className="rounded-xl" /></div>
          <DialogFooter><Button onClick={handleSaveCategory} className="w-full h-12 rounded-xl bg-primary font-bold">Update Category</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2"><Label>Product Name</Label><Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Category</Label><Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val as Category})}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{categories.filter(c => c !== 'All').map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Input value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="rounded-xl" /></div>
            <div className="flex items-center justify-between"><Label>Available</Label><Switch checked={productForm.available} onCheckedChange={(val) => setProductForm({...productForm, available: val})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveProduct} className="w-full h-12 rounded-xl bg-primary font-bold">{editingProduct ? 'Update Product' : 'Save Product'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2"><Label>Method Name</Label><Input value={paymentForm.name} onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Icon</Label><Select value={paymentForm.icon} onValueChange={(val) => setPaymentForm({...paymentForm, icon: val as any})}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CreditCard">Credit Card</SelectItem><SelectItem value="Smartphone">Digital Wallet</SelectItem><SelectItem value="Banknote">Cash</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Description</Label><Input value={paymentForm.description} onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})} className="rounded-xl" /></div>
            <div className="flex items-center justify-between"><Label>Enabled</Label><Switch checked={paymentForm.enabled} onCheckedChange={(val) => setPaymentForm({...paymentForm, enabled: val})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSavePayment} className="w-full h-12 rounded-xl bg-primary font-bold">{editingPayment ? 'Update Method' : 'Save Method'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader><DialogTitle className="text-2xl font-black">{editingFee ? 'Edit Fee' : 'Add New Fee'}</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2"><Label>Fee Name</Label><Input value={feeForm.name} onChange={(e) => setFeeForm({...feeForm, name: e.target.value})} placeholder="e.g. Sales Tax, Service" className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={feeForm.type} onValueChange={(val) => setFeeForm({...feeForm, type: val as FeeType})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tax">Tax</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Value (%)</Label><Input type="number" value={feeForm.value} onChange={(e) => setFeeForm({...feeForm, value: parseFloat(e.target.value)})} className="rounded-xl" /></div>
            </div>
            <div className="flex items-center justify-between"><Label>Enabled</Label><Switch checked={feeForm.enabled} onCheckedChange={(val) => setFeeForm({...feeForm, enabled: val})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveFee} className="w-full h-12 rounded-xl bg-primary font-bold">{editingFee ? 'Update Fee' : 'Save Fee'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
      <div className="flex gap-4 mb-2"><div className="bg-primary/5 p-3 rounded-2xl text-primary h-fit"><Icon className="h-6 w-6" /></div><div><CardTitle className="text-xl font-bold">{title}</CardTitle><CardDescription>{description}</CardDescription></div></div>{children}
    </Card>
  );
}

function ToggleOption({ title, description, defaultChecked }: any) {
  return (
    <div className="flex items-center justify-between py-2"><div className="space-y-0.5"><p className="font-bold">{title}</p><p className="text-xs text-muted-foreground">{description}</p></div><Switch defaultChecked={defaultChecked} /></div>
  );
}
