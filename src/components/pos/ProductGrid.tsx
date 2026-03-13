"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Package, Tag, Layers, Box, LayoutGrid, CheckCircle2, Circle, Ticket } from 'lucide-react';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combo } from '@/types/pos';

export function ProductGrid() {
  const { 
    activeCategory, setActiveCategory, searchQuery, addToCart, addPackageToCart, addComboToCart,
    products, categories, cart, priceLists, packages, combos, promoDiscounts 
  } = usePOS();

  const [mounted, setMounted] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [comboSelections, setComboSelections] = useState<{ [groupId: string]: string }>({});

  useEffect(() => { setMounted(true); }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    return matchesCategory && (p.name.toLowerCase().includes(searchLower) || p.sku.toLowerCase().includes(searchLower));
  });

  const filteredPackages = packages.filter(pkg => {
    const matchesCategory = activeCategory === 'Semua' || activeCategory === 'Paket';
    const searchLower = searchQuery.toLowerCase();
    return pkg.enabled && matchesCategory && (pkg.name.toLowerCase().includes(searchLower) || pkg.sku.toLowerCase().includes(searchLower));
  });

  const filteredCombos = combos.filter(c => {
    const matchesCategory = activeCategory === 'Semua' || activeCategory === 'Pilihan';
    const searchLower = searchQuery.toLowerCase();
    return c.enabled && matchesCategory && (c.name.toLowerCase().includes(searchLower) || c.sku.toLowerCase().includes(searchLower));
  });

  const getActivePriceList = (productId: string) => {
    if (!mounted) return null;
    const now = new Date();
    return priceLists.find(pl => pl.enabled && pl.productId === productId && new Date(pl.startDate) <= now && new Date(pl.endDate) >= now);
  };

  const getActivePromo = (productId: string) => {
    if (!mounted) return null;
    const now = new Date();
    return promoDiscounts.find(pd => pd.enabled && pd.productId === productId && new Date(pd.startDate) <= now && new Date(pd.endDate) >= now);
  };

  const handleAddComboToCart = () => {
    if (!selectedCombo) return;
    const selections = Object.entries(comboSelections).map(([groupId, productId]) => {
      const group = selectedCombo.groups.find(g => g.id === groupId);
      const option = group?.options.find(o => o.productId === productId);
      return { groupId, productId, extraPrice: option?.extraPrice || 0 };
    });
    addComboToCart(selectedCombo, selections);
    setSelectedCombo(null);
  };

  return (
    <div className="flex flex-col gap-10 h-full">
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-8 py-3.5 rounded-2xl whitespace-nowrap font-bold text-sm transition-all duration-300 border shadow-sm", activeCategory === cat ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-white text-muted-foreground border-transparent hover:border-primary/30")}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-24">
        {filteredCombos.map((combo) => (
          <Card key={combo.id} onClick={() => setSelectedCombo(combo)} className="group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full cursor-pointer border-t-4 border-t-primary/30">
            <div className="relative h-64 w-full bg-primary/5 flex items-center justify-center"><LayoutGrid className="h-24 w-24 text-primary/20" /></div>
            <div className="p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2"><h3 className="text-xl font-black">{combo.name}</h3><span className="text-lg font-black text-primary">{formatCurrency(combo.basePrice)}</span></div>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{combo.description || "Paket pilihan fleksibel."}</p>
              <div className="mt-auto flex justify-between items-center"><Badge variant="outline" className="text-[10px] font-black uppercase">Pilihan</Badge><Plus className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100" /></div>
            </div>
          </Card>
        ))}

        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} onClick={() => addPackageToCart(pkg)} className="group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full cursor-pointer border-t-4 border-t-accent/30">
            <div className="relative h-64 w-full bg-accent/5 flex items-center justify-center"><Box className="h-24 w-24 text-accent/20" /></div>
            <div className="p-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2"><h3 className="text-xl font-black">{pkg.name}</h3><span className="text-lg font-black text-primary">{formatCurrency(pkg.price)}</span></div>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{pkg.description || "Bundel produk hemat."}</p>
              <div className="mt-auto flex justify-between items-center"><Badge variant="secondary" className="bg-accent/10 text-accent font-black">Paket</Badge><Plus className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100" /></div>
            </div>
          </Card>
        ))}

        {filteredProducts.map((product) => {
          const inCart = cart.find(i => i.productId === product.id && !i.isPackage);
          const stockLeft = product.onHandQty - (inCart?.quantity || 0);
          const activePriceList = getActivePriceList(product.id);
          const activePromo = getActivePromo(product.id);

          return (
            <Card key={product.id} onClick={() => stockLeft > 0 && addToCart(product)} className={cn("group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full cursor-pointer", stockLeft <= 0 && "opacity-80 grayscale-[0.5] cursor-not-allowed")}>
              <div className="relative h-64 w-full">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110" data-ai-hint="food item" />
                {activePromo && <div className="absolute top-4 right-4"><Badge className="bg-rose-500 text-white font-black"><Ticket className="h-3 w-3 mr-1" /> PROMO</Badge></div>}
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black">{product.name}</h3>
                  <div className="text-right">
                    <span className="text-lg font-black text-primary">{formatCurrency(product.price)}</span>
                    {activePriceList && <p className="text-[9px] text-accent font-bold">Harga Grosir</p>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{product.description}</p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary font-black">{product.category}</Badge>
                    <span className={cn("text-[10px] font-bold mt-1", stockLeft < 10 ? "text-orange-500" : "text-muted-foreground")}>Stok: {stockLeft}</span>
                  </div>
                  <Plus className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedCombo} onOpenChange={(open) => !open && setSelectedCombo(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">{selectedCombo?.name}</DialogTitle></DialogHeader>
          <div className="space-y-8">
             {selectedCombo?.groups.map((group) => (
                <div key={group.id} className="space-y-4">
                   <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{group.name} {group.required && "*"}</Label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.options.map((opt) => {
                         const p = products.find(prod => prod.id === opt.productId);
                         const isSelected = comboSelections[group.id] === opt.productId;
                         return (
                            <button key={opt.productId} onClick={() => setComboSelections(prev => ({ ...prev, [group.id]: opt.productId }))} className={cn("flex items-center justify-between p-4 rounded-2xl border-2 transition-all", isSelected ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-muted/50 hover:border-primary/20")}>
                               <div className="flex items-center gap-3">{isSelected ? <CheckCircle2 className="text-primary h-5 w-5" /> : <Circle className="text-muted/30 h-5 w-5" />}<div className="text-left"><p className="font-bold text-sm">{p?.name || 'Item'}</p>{opt.extraPrice > 0 && <p className="text-[10px] font-black text-primary">+{formatCurrency(opt.extraPrice)}</p>}</div></div>
                            </button>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>
          <DialogFooter className="mt-10"><Button onClick={handleAddComboToCart} disabled={!selectedCombo?.groups.every(g => !g.required || !!comboSelections[g.id])} className="w-full h-16 rounded-2xl bg-primary font-black text-lg">Tambahkan ke Pesanan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
