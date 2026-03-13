
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
  Package, 
  Tags, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { usePOS } from './POSContext';
import { Category, Product } from '@/types/pos';
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
  const { products, setProducts, categories, setCategories } = usePOS();
  const [newCategory, setNewCategory] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Form State for new Product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Main Course',
    available: true,
    description: '',
    image: 'https://picsum.photos/seed/new/400/300'
  });

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory as Category)) {
      setCategories([...categories, newCategory as Category]);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    if (cat === 'All') return;
    setCategories(categories.filter(c => c !== cat));
  };

  const handleAddProduct = () => {
    const newProd: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: productForm.name || 'New Product',
      price: productForm.price || 0,
      category: productForm.category as Category || 'Main Course',
      available: productForm.available ?? true,
      description: productForm.description || '',
      image: productForm.image || 'https://picsum.photos/seed/new/400/300'
    };
    setProducts([...products, newProd]);
    setIsProductDialogOpen(false);
    setProductForm({
      name: '',
      price: 0,
      category: 'Main Course',
      available: true,
      description: '',
      image: 'https://picsum.photos/seed/new/400/300'
    });
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="text-muted-foreground">Manage your POS configuration and master data</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl h-14 border shadow-sm mb-8">
          <TabsTrigger value="general" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="products" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Master Products</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 gap-8">
            <SettingsSection icon={Store} title="Store Information" description="Basic details about your establishment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input placeholder="Main Store" defaultValue="Alex's Deli" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" defaultValue="10" className="rounded-xl" />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection icon={Bell} title="Notifications" description="Configure alert preferences">
              <div className="space-y-4 pt-4">
                <ToggleOption title="Order Alerts" description="Notify on new incoming orders" defaultChecked />
                <ToggleOption title="Low Stock" description="Notify when items are running out" defaultChecked />
              </div>
            </SettingsSection>

            <SettingsSection icon={Printer} title="Hardware" description="Connect and manage peripherals">
              <div className="space-y-4 pt-4">
                <ToggleOption title="Auto-print Receipt" description="Print receipt automatically after payment" defaultChecked />
              </div>
            </SettingsSection>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <div>
                <CardTitle className="text-2xl font-black">Product Master</CardTitle>
                <CardDescription>Add, edit or remove products from your menu</CardDescription>
              </div>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl bg-primary hover:bg-primary/90 font-bold px-6 h-12 gap-2 shadow-lg shadow-primary/20">
                    <Plus className="h-5 w-5" /> Add New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Add New Product</DialogTitle>
                    <CardDescription>Enter the details of the new menu item</CardDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input 
                        value={productForm.name} 
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                        placeholder="e.g. Classic Burger" 
                        className="rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price ($)</Label>
                        <Input 
                          type="number" 
                          value={productForm.price} 
                          onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})} 
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select 
                          value={productForm.category} 
                          onValueChange={(val) => setProductForm({...productForm, category: val as Category})}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c !== 'All').map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input 
                        value={productForm.description} 
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                        placeholder="Short description..." 
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddProduct} className="w-full h-12 rounded-xl bg-primary font-bold">Save Product</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted">
                      <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="font-black text-lg">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold text-sm">${product.price.toFixed(2)}</span>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-white rounded-lg">{product.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
            <div className="mb-8">
              <CardTitle className="text-2xl font-black">Categories</CardTitle>
              <CardDescription>Manage food categories for your menu</CardDescription>
            </div>

            <div className="flex gap-4 mb-8">
              <Input 
                placeholder="New Category Name..." 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                className="rounded-xl h-12 flex-1"
              />
              <Button onClick={handleAddCategory} className="rounded-xl bg-primary h-12 px-6 font-bold gap-2">
                <Plus className="h-5 w-5" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center gap-3 bg-muted/30 pl-6 pr-2 py-2 rounded-2xl border border-muted transition-all hover:border-primary/20">
                  <span className="font-bold text-sm">{cat}</span>
                  {cat !== 'All' && (
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
      <div className="flex gap-4 mb-2">
        <div className="bg-primary/5 p-3 rounded-2xl text-primary h-fit">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
      {children}
    </Card>
  );
}

function ToggleOption({ title, description, defaultChecked }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <p className="font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
