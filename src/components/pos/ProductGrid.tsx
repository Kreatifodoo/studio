
"use client";

import React from 'react';
import Image from 'next/image';
import { Plus, Package, Tag } from 'lucide-react';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ProductGrid() {
  const { activeCategory, setActiveCategory, searchQuery, addToCart, products, categories, cart } = usePOS();

  const filtered = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) || 
      p.sku.toLowerCase().includes(searchLower) ||
      p.barcode.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const getStockLeft = (product: Product) => {
    const inCart = cart.find(item => item.productId === product.id);
    return product.onHandQty - (inCart ? inCart.quantity : 0);
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
        {filtered.length > 0 ? (
          filtered.map((product) => {
            const stockLeft = getStockLeft(product);
            const isOutOfStock = stockLeft <= 0;

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
                      <span className="text-xl font-black text-primary">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed mb-6 font-medium">
                      {product.description}
                    </p>
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
          })
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground font-bold">No products found for this search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
