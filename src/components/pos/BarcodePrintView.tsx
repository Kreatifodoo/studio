
"use client";

import React from 'react';
import { Product } from '@/types/pos';
import { usePOS } from './POSContext';

export function BarcodePrintView({ product }: { product: Partial<Product> }) {
  const { storeSettings } = usePOS();
  
  if (!product.name) return null;

  return (
    <div id="barcode-label" className="hidden print:flex w-[40mm] h-[30mm] bg-white text-black p-1 flex-col items-center justify-between font-sans border border-black/5 overflow-hidden">
      <div className="w-full text-center">
        <p className="text-[7px] font-black uppercase truncate px-1">{storeSettings.name}</p>
        <div className="w-full border-b border-black/10 my-0.5" />
        <p className="text-[9px] font-bold text-center leading-[1.1] line-clamp-2 px-1 h-[20px] flex items-center justify-center">
          {product.name}
        </p>
      </div>
      
      {/* High Precision Barcode (CSS Based) */}
      <div className="flex items-end justify-center h-12 w-full gap-[1px] px-2 mt-1">
        {[...Array(45)].map((_, i) => (
          <div 
            key={i} 
            className="bg-black h-full" 
            style={{ 
              width: `${(i % 3 === 0 || i % 7 === 0) ? (i % 5 === 0 ? '2px' : '1.5px') : '1px'}`, 
              opacity: (i % 11 === 0) ? 0.1 : 1 
            }}
          />
        ))}
      </div>
      
      <div className="w-full flex flex-col items-center">
        <div className="w-full flex justify-between items-center px-2 mt-0.5">
          <p className="text-[8px] font-mono font-bold tracking-tighter truncate max-w-[55%]">{product.sku || 'SKU-NONE'}</p>
          <p className="text-[10px] font-black">Rp {(product.price || 0).toLocaleString()}</p>
        </div>
        <p className="text-[7px] font-mono tracking-[3px] opacity-80 mb-0.5">{product.barcode || '000000000000'}</p>
      </div>
    </div>
  );
}
