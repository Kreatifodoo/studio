
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Package, Tag, Layers, Box, LayoutGrid, CheckCircle2, Circle } from 'lucide-react';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combo } from '@/types/pos';

export function ProductGrid() {
  const { 
    activeCategory, setActiveCategory, searchQuery, 
    addToCart, addPackageToCart, addComboToCart,
    products, categories, cart, priceLists, packages, combos 
  } = usePOS();

  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [comboSelections, setComboSelections] = useState<{ [groupId: string]: string }>({});

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) || 
      p.sku.toLowerCase().includes(searchLower) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesCategory = activeCategory === 'All' || activeCategory === 'Packages';
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      pkg.name.toLowerCase().includes(searchLower) || 
      pkg.sku.toLowerCase().includes(searchLower);
    return pkg.enabled && matchesCategory && matchesSearch;
  });

  // Filter combos
  const filteredCombos = combos.filter(c => {
    const matchesCategory = activeCategory === 'All' || activeCategory === 'Combos';
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      c.name.toLowerCase().includes(searchLower) || 
      c.sku.toLowerCase().includes(searchLower);
    return c.enabled && matchesCategory && matchesSearch;
  });

  const getStockLeft = (product: any) => {
    const inCart = cart.find(item => item.productId === product.id && !item.isPackage);
    return product.onHandQty - (inCart ? inCart.quantity : 0);
  };

  const getActivePriceList = (productId: string) => {
    const now = new Date();
    return priceLists.find(pl => 
      pl.enabled && 
      pl.productId === productId &&
      new Date(pl.startDate) <= now &&
      new Date(pl.endDate) >= now
    );
  };

  const handleComboClick = (combo: Combo) => {
    setSelectedCombo(combo);
    setComboSelections({});
  };

  const handleSelectOption = (groupId: string, productId: string) => {
    setComboSelections(prev => ({ ...prev, [groupId]: productId }));
  };

  const isComboValid = () => {
    if (!selectedCombo) return false;
    return selectedCombo.groups.every(group => {
      if (!group.required) return true;
      return !!comboSelections[group.id];
    });
  };

  const handleAddComboToCart = () => {
    if (!selectedCombo || !isComboValid()) return;
    
    const selections = Object.entries(comboSelections).map(([groupId, productId]) => {
      const group = selectedCombo.groups.find(g => g.id === groupId);
      const option = group?.options.find(o => o.productId === productId);
      return {
        groupId,
        productId,
        extraPrice: option?.extraPrice || 0
      };
    });

    addComboToCart(selectedCombo, selections);
    setSelectedCombo(null);
  };

  return (
    <div className="flex flex-col gap-10 h-full">
      {/* Categories Chips */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-8 py-3.5 rounded-2xl whitespace-nowrap font-bold text-sm transition-all duration-300 border shadow-sm",
              activeCategory === cat
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                : "bg-white text-muted-foreground border-transparent hover:border-primary/30"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 pb-24">
        {/* Render Combos */}
        {filteredCombos.map((combo) => (
          <Card
            key={combo.id}
            onClick={() => handleComboClick(combo)}
            className="group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full cursor-pointer border-t-4 border-t-primary/30"
          >
            <div className="relative h-64 w-full overflow-hidden bg-primary/5 flex items-center justify-center">
              <LayoutGrid className="h-24 w-24 text-primary/20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-primary text-white border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                  COMBO CHOICE
                </Badge>
                <Badge className="bg-white/90 text-primary border-none rounded-lg px-3 py-1 text-[10px] font-bold shadow-sm backdrop-blur-sm">
                  <Tag className="h-3 w-3 mr-1" /> {combo.sku}
                </Badge>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-xl font-black group-hover:text-primary transition-colors line-clamp-1 flex-1">{combo.name}</h3>
                  <div className="text-right">
                    <span className="text-xl font-black text-primary">${combo.basePrice.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed mb-6 font-medium">
                  {combo.description || "Flexible combo choice set."}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                   {combo.groups.map((group, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-muted text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {group.name} {group.required && <span className="text-destructive ml-1">*</span>}
                      </Badge>
                   ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                 <Badge variant="outline" className="border-primary/20 text-primary rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-wider w-fit">
                    Flexible Combo
                 </Badge>
                 <div className="p-2 rounded-xl bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <Plus className="h-5 w-5" />
                 </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Render Packages */}
        {filteredPackages.map((pkg) => (
          <Card
            key={pkg.id}
            onClick={() => addPackageToCart(pkg)}
            className="group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full cursor-pointer border-t-4 border-t-accent/30"
          >
            <div className="relative h-64 w-full overflow-hidden bg-accent/5 flex items-center justify-center">
              <Box className="h-24 w-24 text-accent/20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-accent text-white border-none rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm">
                  PACKAGE BUNDLE
                </Badge>
                <Badge className="bg-white/90 text-primary border-none rounded-lg px-3 py-1 text-[10px] font-bold shadow-sm backdrop-blur-sm">
                  <Tag className="h-3 w-3 mr-1" /> {pkg.sku}
                </Badge>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-xl font-black group-hover:text-primary transition-colors line-clamp-1 flex-1">{pkg.name}</h3>
                  <div className="text-right">
                    <span className="text-xl font-black text-primary">${pkg.price.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed mb-6 font-medium">
                  {pkg.description || "Special curated bundle package."}
                </p>
                <div className="mb-6 p-4 bg-muted/20 rounded-2xl">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Includes:</p>
                   <div className="flex flex-wrap gap-2">
                      {pkg.items.map((item, idx) => {
                        const p = products.find(prod => prod.id === item.productId);
                        return (
                          <Badge key={idx} variant="outline" className="bg-white border-none text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
                            {item.quantity}x {p?.name || 'Unknown'}
                          </Badge>
                        );
                      })}
                   </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                 <Badge variant="secondary" className="bg-accent/10 text-accent border-none rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-wider w-fit">
                    Bundle
                 </Badge>
                 <div className="p-2 rounded-xl bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <Plus className="h-5 w-5" />
                 </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Render Products */}
        {filteredProducts.map((product) => {
          const stockLeft = getStockLeft(product);
          const isOutOfStock = stockLeft <= 0;
          const activePriceList = getActivePriceList(product.id);

          return (
            <Card
              key={product.id}
              onClick={() => !isOutOfStock && addToCart(product)}
              className={cn(
                "group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white flex flex-col h-full",
                (!product.available || isOutOfStock) ? "opacity-80 grayscale-[0.5] cursor-not-allowed" : "cursor-pointer"
              )}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint="food item"
                />
                {!product.available && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge variant="destructive" className="px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl">Sold Out</Badge>
                  </div>
                )}
                {product.available && isOutOfStock && (
                  <div className="absolute inset-0 bg-orange-500/40 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge variant="destructive" className="px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl">Out of Stock</Badge>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-white/90 text-primary border-none rounded-lg px-3 py-1 text-[10px] font-bold shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                    <Tag className="h-3 w-3" /> {product.sku}
                  </Badge>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-xl font-black group-hover:text-primary transition-colors line-clamp-1 flex-1">{product.name}</h3>
                    <div className="text-right">
                      <span className="text-xl font-black text-primary">${product.price.toFixed(2)}</span>
                      {activePriceList && <p className="text-[9px] text-accent font-bold mt-1 uppercase tracking-tighter">Tiered Pricing Active</p>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed mb-6 font-medium">
                    {product.description}
                  </p>

                  {/* Price List Tiers Display */}
                  {activePriceList && (
                    <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Volume Discounts</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activePriceList.tiers.map((tier, idx) => (
                          <div key={idx} className="bg-white px-2.5 py-1.5 rounded-xl text-[10px] font-bold border shadow-sm flex flex-col items-center min-w-[50px]">
                            <span className="text-muted-foreground">{tier.minQty}-{tier.maxQty} qty</span>
                            <span className="text-primary font-black">${tier.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex flex-col gap-1">
                     <Badge variant="secondary" className="bg-[#3D8AF5]/10 text-[#3D8AF5] border-none rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-wider w-fit">
                        {product.category}
                     </Badge>
                     <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground ml-1 mt-1">
                        <Package className="h-3 w-3" /> 
                        <span className={cn(stockLeft < 10 ? "text-orange-500" : "")}>
                          Stock: {stockLeft}
                        </span>
                     </div>
                   </div>
                   <div className={cn(
                     "p-2 rounded-xl text-primary transition-all",
                     isOutOfStock ? "opacity-0" : "bg-primary/5 opacity-0 group-hover:opacity-100"
                   )}>
                      <Plus className="h-5 w-5" />
                   </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredProducts.length === 0 && filteredPackages.length === 0 && filteredCombos.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground font-bold">No items found for this search.</p>
          </div>
        )}
      </div>

      {/* Combo Selection Dialog */}
      <Dialog open={!!selectedCombo} onOpenChange={(open) => !open && setSelectedCombo(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 border-none shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-6">
             <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-4">
                <LayoutGrid className="h-8 w-8" />
             </div>
             <DialogTitle className="text-3xl font-black">{selectedCombo?.name}</DialogTitle>
             <p className="text-muted-foreground font-medium">{selectedCombo?.description}</p>
          </DialogHeader>

          <div className="space-y-8">
             {selectedCombo?.groups.map((group) => (
                <div key={group.id} className="space-y-4">
                   <div className="flex items-center justify-between">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        {group.name} {group.required && <span className="text-destructive">*</span>}
                      </Label>
                      {group.required && (
                        <Badge variant="outline" className="text-[9px] font-black border-destructive/20 text-destructive">REQUIRED</Badge>
                      )}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.options.map((opt) => {
                         const productDetails = products.find(p => p.id === opt.productId);
                         const isSelected = comboSelections[group.id] === opt.productId;
                         return (
                            <button
                               key={opt.productId}
                               onClick={() => handleSelectOption(group.id, opt.productId)}
                               className={cn(
                                 "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                                 isSelected 
                                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                                    : "bg-white border-muted/50 hover:border-primary/20"
                               )}
                            >
                               <div className="flex items-center gap-3">
                                  {isSelected ? <CheckCircle2 className="text-primary h-5 w-5" /> : <Circle className="text-muted/30 h-5 w-5" />}
                                  <div>
                                     <p className="font-bold text-sm leading-tight">{productDetails?.name || 'Unknown'}</p>
                                     {opt.extraPrice > 0 && <p className="text-[10px] font-black text-primary">+$ {opt.extraPrice.toFixed(2)}</p>}
                                  </div>
                               </div>
                               <Badge variant="secondary" className="bg-muted text-[9px] font-bold rounded-lg border-none">{productDetails?.category}</Badge>
                            </button>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>

          <DialogFooter className="mt-10">
             <Button
                onClick={handleAddComboToCart}
                disabled={!isComboValid()}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20 gap-3"
              >
                Add Combo to Order
                <Plus className="h-5 w-5" />
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
