
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Box, LayoutGrid, CheckCircle2, Circle, Ticket } from 'lucide-react';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combo } from '@/types/pos';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="flex flex-col gap-6 md:gap-8 h-full">
      {/* Category Slider */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={cn(
              "px-5 md:px-8 py-3 rounded-2xl whitespace-nowrap font-bold text-xs md:text-sm transition-all duration-300 border shadow-sm active:scale-90", 
              activeCategory === cat 
                ? "bg-primary text-white border-primary shadow-lg" 
                : "bg-white text-muted-foreground border-transparent hover:border-primary/20"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pb-10">
        {filteredCombos.map((combo) => (
          <Card key={combo.id} onClick={() => setSelectedCombo(combo)} className="group overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-xl active:scale-[0.98] transition-all duration-300 bg-white flex flex-col h-full cursor-pointer border-t-4 border-t-primary/20">
            <div className="relative aspect-video bg-primary/5 flex items-center justify-center"><LayoutGrid className="h-10 w-10 md:h-16 md:w-16 text-primary/20" /></div>
            <div className="p-4 md:p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm md:text-lg font-black line-clamp-1">{combo.name}</h3>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-3 line-clamp-2">{combo.description || "Paket pilihan fleksibel."}</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-xs md:text-base font-black text-primary">{formatCurrency(combo.basePrice)}</span>
                <Badge variant="outline" className="text-[8px] md:text-[10px] font-black uppercase border-primary/20 text-primary">Pilihan</Badge>
              </div>
            </div>
          </Card>
        ))}

        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} onClick={() => addPackageToCart(pkg)} className="group overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-xl active:scale-[0.98] transition-all duration-300 bg-white flex flex-col h-full cursor-pointer border-t-4 border-t-accent/20">
            <div className="relative aspect-video bg-accent/5 flex items-center justify-center"><Box className="h-10 w-10 md:h-16 md:w-16 text-accent/20" /></div>
            <div className="p-4 md:p-6 flex flex-col flex-1">
              <h3 className="text-sm md:text-lg font-black line-clamp-1 mb-1">{pkg.name}</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-3 line-clamp-2">{pkg.description || "Bundel produk hemat."}</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="text-xs md:text-base font-black text-primary">{formatCurrency(pkg.price)}</span>
                <Badge variant="secondary" className="bg-accent/10 text-accent font-black text-[8px] md:text-[10px]">Paket</Badge>
              </div>
            </div>
          </Card>
        ))}

        {filteredProducts.map((product) => {
          const inCart = cart.find(i => i.productId === product.id && !i.isPackage);
          const stockLeft = product.onHandQty - (inCart?.quantity || 0);
          const activePromo = promoDiscounts.find(pd => pd.enabled && pd.productId === product.id && new Date(pd.startDate) <= new Date() && new Date(pd.endDate) >= new Date());

          return (
            <Card key={product.id} onClick={() => stockLeft > 0 && addToCart(product)} className={cn("group overflow-hidden rounded-[2rem] border-none shadow-sm hover:shadow-xl active:scale-[0.98] transition-all duration-300 bg-white flex flex-col h-full cursor-pointer", stockLeft <= 0 && "opacity-80 grayscale-[0.5] cursor-not-allowed")}>
              <div className="relative aspect-video w-full overflow-hidden">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-110" data-ai-hint="food item" />
                {activePromo && <div className="absolute top-2 right-2 md:top-4 md:right-4"><Badge className="bg-rose-500 text-white font-black text-[8px] md:text-[10px]"><Ticket className="h-2.5 w-2.5 mr-1" /> PROMO</Badge></div>}
              </div>
              <div className="p-4 md:p-6 flex flex-col flex-1">
                <h3 className="text-sm md:text-lg font-black line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs md:text-base font-black text-primary">{formatCurrency(product.price)}</span>
                    <span className={cn("text-[8px] md:text-[10px] font-bold", stockLeft < 10 ? "text-orange-500" : "text-muted-foreground")}>Stok: {stockLeft}</span>
                  </div>
                  <Plus className="h-4 w-4 md:h-5 md:w-5 text-primary opacity-50 md:opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedCombo} onOpenChange={(open) => !open && setSelectedCombo(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl rounded-[2.5rem] p-6 md:p-10 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4"><DialogTitle className="text-xl md:text-3xl font-black">{selectedCombo?.name}</DialogTitle></DialogHeader>
          <div className="space-y-6 md:space-y-8">
             {selectedCombo?.groups.map((group) => (
                <div key={group.id} className="space-y-3">
                   <Label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">{group.name} {group.required && "*"}</Label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                      {group.options.map((opt) => {
                         const p = products.find(prod => prod.id === opt.productId);
                         const isSelected = comboSelections[group.id] === opt.productId;
                         return (
                            <button key={opt.productId} onClick={() => setComboSelections(prev => ({ ...prev, [group.id]: opt.productId }))} className={cn("flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all active:scale-95", isSelected ? "bg-primary/5 border-primary shadow-lg" : "bg-white border-muted/50 hover:border-primary/20")}>
                               <div className="flex items-center gap-2 md:gap-3">{isSelected ? <CheckCircle2 className="text-primary h-4 w-4 md:h-5 md:w-5" /> : <Circle className="text-muted/30 h-4 w-4 md:h-5 md:w-5" />}<div className="text-left"><p className="font-bold text-xs md:text-sm">{p?.name || 'Item'}</p>{opt.extraPrice > 0 && <p className="text-[9px] md:text-[10px] font-black text-primary">+{formatCurrency(opt.extraPrice)}</p>}</div>
                               </div>
                            </button>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>
          <DialogFooter className="mt-8"><Button onClick={handleAddComboToCart} disabled={!selectedCombo?.groups.every(g => !g.required || !!comboSelections[g.id])} className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-primary font-black text-lg">Konfirmasi Pilihan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
