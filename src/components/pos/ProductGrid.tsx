
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
    <div className="flex flex-col gap-8 h-full">
      {/* Categories Chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 border",
              activeCategory === cat
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                : "bg-white text-muted-foreground border-transparent hover:border-primary/20"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
        {filtered.map((product) => (
          <Card
            key={product.id}
            onClick={() => addToCart(product)}
            className="group overflow-hidden rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                data-ai-hint="food item"
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-primary p-3 rounded-2xl text-white shadow-lg">
                  <Plus className="h-6 w-6" />
                </div>
              </div>
              {!product.available && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Badge variant="destructive" className="px-4 py-1 text-sm font-semibold uppercase tracking-wider">Out of Stock</Badge>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                <span className="text-xl font-bold text-primary">${product.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{product.description}</p>
              <div className="mt-4 flex items-center gap-2">
                 <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg text-xs font-semibold">
                    {product.category}
                 </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
