"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Box, LayoutGrid, CheckCircle2, Circle, Ticket } from 'lucide-react';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combo } from '@/types/pos';

export function ProductGrid() {
  const { 
    activeCategory, setActiveCategory, searchQuery, addToCart, addPackageToCart, addComboToCart,
    products, categories, cart, packages, combos, promoDiscounts 
  } = usePOS();

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [comboSelections, setComboSelections] = useState<{ [groupId: string]: string }>({});

  useEffect(() => { 
    setMounted(true);
    setNow(new Date());
    
    // Update 'now' every minute to keep promo logic fresh
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

  if (!mounted) return (
    <div className="flex items-center justify-center h-full opacity-50">
      <p className="text-xs font-black uppercase tracking-widest">Memuat Menu...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 md:gap-6 h-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-0.5">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={cn(
              "px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl whitespace-nowrap font-black text-[9px] md:text-xs transition-all duration-300 border shadow-sm active:scale-90", 
              activeCategory === cat 
                ? "bg-primary text-white border-primary shadow-md" 
                : "bg-white text-muted-foreground border-transparent hover:border-primary/20"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 pb-20 md:pb-8">
        {filteredCombos.map((combo) => (
          <Card key={combo.id} onClick={() => setSelectedCombo(combo)} className="group overflow-hidden rounded-xl md:rounded-2xl border-none shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-300 bg-white flex flex-col h-full cursor-pointer border-t-2 border-t-primary/20">
            <div className="relative aspect-video bg-primary/5 flex items-center justify-center"><LayoutGrid className="h-6 w-6 md:h-10 md:w-10 text-primary/10" /></div>
            <div className="p-2 md:p-4 flex flex-col flex-1">
              <h3 className="text-[10px] md:sm font-black line-clamp-1 mb-0.5">{combo.name}</h3>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-[9px] md:text-xs font-black text-primary">{formatCurrency(combo.basePrice)}</span>
                <span className="text-[7px] md:text-[8px] font-black uppercase text-primary/60 border border-primary/20 px-1 rounded">OPSI</span>
              </div>
            </div>
          </Card>
        ))}

        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} onClick={() => addPackageToCart(pkg)} className="group overflow-hidden rounded-xl md:rounded-2xl border-none shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-300 bg-white flex flex-col h-full cursor-pointer border-t-2 border-t-accent/20">
            <div className="relative aspect-video bg-accent/5 flex items-center justify-center"><Box className="h-6 w-6 md:h-10 md:w-10 text-accent/10" /></div>
            <div className="p-2 md:p-4 flex flex-col flex-1">
              <h3 className="text-[10px] md:sm font-black line-clamp-1 mb-0.5">{pkg.name}</h3>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-[9px] md:text-xs font-black text-primary">{formatCurrency(pkg.price)}</span>
                <span className="text-[7px] md:text-[8px] font-black uppercase bg-accent/10 text-accent px-1 rounded">PAKET</span>
              </div>
            </div>
          </Card>
        ))}

        {filteredProducts.map((product) => {
          const inCart = cart.find(i => i.productId === product.id && !i.isPackage);
          const stockLeft = product.onHandQty - (inCart?.quantity || 0);
          
          const activePromo = now ? promoDiscounts.find(pd => 
            pd.enabled && 
            pd.productId === product.id && 
            new Date(pd.startDate) <= now && 
            new Date(pd.endDate) >= now
          ) : null;

          return (
            <Card key={product.id} onClick={() => stockLeft > 0 && addToCart(product)} className={cn("group overflow-hidden rounded-xl md:rounded-2xl border-none shadow-sm hover:shadow-lg active:scale-[0.98] transition-all duration-300 bg-white flex flex-col h-full cursor-pointer", stockLeft <= 0 && "opacity-80 grayscale-[0.5] cursor-not-allowed")}>
              <div className="relative aspect-video w-full overflow-hidden">
                <Image src={product.image} alt={product.name} width={400} height={300} className="object-cover transition-transform group-hover:scale-105" data-ai-hint="food item" />
                {activePromo && <div className="absolute top-1 right-1"><Ticket className="h-3 w-3 text-rose-500 fill-rose-500" /></div>}
              </div>
              <div className="p-2 md:p-4 flex flex-col flex-1">
                <h3 className="text-[10px] md:sm font-black line-clamp-1 mb-0.5">{product.name}</h3>
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-xs font-black text-primary">{formatCurrency(product.price)}</span>
                    <span className={cn("text-[7px] md:text-[8px] font-bold", stockLeft < 5 ? "text-rose-500" : "text-muted-foreground/60")}>Stok: {stockLeft}</span>
                  </div>
                  <div className="bg-primary/10 p-1 rounded-md text-primary opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedCombo} onOpenChange={(open) => !open && setSelectedCombo(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6">
          <DialogHeader><DialogTitle className="text-sm md:text-lg font-black">{selectedCombo?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
             {selectedCombo?.groups.map((group) => (
                <div key={group.id} className="space-y-1.5">
                   <Label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground">{group.name} {group.required && "*"}</Label>
                   <div className="grid grid-cols-1 gap-1.5">
                      {group.options.map((opt) => {
                         const p = products.find(prod => prod.id === opt.productId);
                         const isSelected = comboSelections[group.id] === opt.productId;
                         return (
                            <button key={opt.productId} onClick={() => setComboSelections(prev => ({ ...prev, [group.id]: opt.productId }))} className={cn("flex items-center justify-between p-2 rounded-lg border transition-all active:scale-95", isSelected ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-muted/50 hover:border-primary/10")}>
                               <div className="flex items-center gap-2">{isSelected ? <CheckCircle2 className="text-primary h-3 w-3" /> : <Circle className="text-muted/30 h-3 w-3" />}<div className="text-left"><p className="font-bold text-[10px] md:text-xs leading-tight">{p?.name || 'Item'}</p>{opt.extraPrice > 0 && <p className="text-[8px] font-black text-primary mt-0.5">+{formatCurrency(opt.extraPrice)}</p>}</div>
                               </div>
                            </button>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>
          <DialogFooter className="mt-4"><Button onClick={handleAddComboToCart} disabled={!selectedCombo?.groups.every(g => !g.required || !!comboSelections[g.id])} className="w-full h-10 rounded-xl bg-primary font-black text-xs md:text-sm">Konfirmasi</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
