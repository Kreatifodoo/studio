
"use client";

import React from 'react';
import { Product } from '@/types/pos';
import { usePOS } from './POSContext';

export function BarcodePrintView({ product }: { product: Product }) {
  const { storeSettings } = usePOS();
  
  return (
    <div id="barcode-label" className="hidden print:flex w-[40mm] h-[30mm] bg-white text-black p-2 flex-col items-center justify-center font-sans border border-black/10">
      <p className="text-[7px] font-black uppercase text-center truncate w-full mb-0.5">{storeSettings.name}</p>
      <div className="w-full border-b border-black/20 mb-1" />
      <p className="text-[9px] font-bold text-center leading-tight line-clamp-2 w-full h-[24px] flex items-center justify-center mb-1">
        {product.name}
      </p>
      
      {/* Visual Barcode Representation (High Precision Simulated) */}
      <div className="flex items-end justify-center h-10 w-full mb-1 gap-[1px] px-1">
        {[...Array(40)].map((_, i) => (
          <div 
            key={i} 
            className="bg-black h-full" 
            style={{ 
              width: `${(i % 4 === 0) ? 2 : 1}px`, 
              opacity: (i % 9 === 0) ? 0.2 : 1 
            }}
          />
        ))}
      </div>
      
      <div className="w-full flex justify-between items-center mt-0.5 px-1">
        <p className="text-[8px] font-mono font-bold tracking-tighter truncate max-w-[50%]">{product.sku || 'SKU-NONE'}</p>
        <p className="text-[10px] font-black">Rp {product.price.toLocaleString()}</p>
      </div>
      <p className="text-[7px] font-mono tracking-[2px] mt-0.5 opacity-70">{product.barcode || '000000000000'}</p>
    </div>
  );
}
