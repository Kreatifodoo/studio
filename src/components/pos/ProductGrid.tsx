
"use client";

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/lib/pos-data';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ProductGrid() {
  const { activeCategory, setActiveCategory, searchQuery, addToCart } = usePOS();

  const filtered = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-10 h-full">
      {/* Categories Chips */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
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
        {filtered.map((product) => (
          <Card
            key={product.id}
            onClick={() => addToCart(product)}
            className={cn(
              "group overflow-hidden rounded-[3rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white flex flex-col h-full",
              !product.available && "opacity-80 grayscale-[0.5]"
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
                 <Badge variant="secondary" className="bg-[#3D8AF5]/10 text-[#3D8AF5] border-none rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-wider">
                    {product.category}
                 </Badge>
                 <div className="bg-primary/5 p-2 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-5 w-5" />
                 </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
