"use client";

import React from 'react';
import { Transaction } from '@/types/pos';
import { format } from 'date-fns';

interface ReceiptViewProps {
  transaction: Transaction | null;
  storeName?: string;
}

export function ReceiptView({ transaction, storeName = "NEXTPOS DELI" }: ReceiptViewProps) {
  if (!transaction) return null;

  return (
    <div id="pos-receipt" className="w-[80mm] bg-white text-black p-4 font-mono text-[11px] leading-relaxed">
      {/* Header */}
      <div className="text-center mb-6 space-y-1">
        <h2 className="text-base font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          {storeName}
        </h2>
        <p className="opacity-80">Jalan Modern Avenue No. 88</p>
        <p className="opacity-80">Tech District, Jakarta</p>
        <p className="opacity-80">CS: (021) 8888-2222</p>
      </div>

      {/* Order Info */}
      <div className="border-t border-b border-black border-dashed py-3 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>ORDER ID</span>
          <span className="font-bold">#{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span>DATE</span>
          <span>{format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>PAYMENT</span>
          <span className="font-bold">{transaction.paymentMethod}</span>
        </div>
        {transaction.paymentReference && (
          <div className="flex justify-between">
            <span>REF</span>
            <span>{transaction.paymentReference}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {transaction.items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between font-bold">
              <span className="flex-1 pr-2 uppercase">{item.name}</span>
              <span>x{item.quantity}</span>
            </div>
            <div className="flex justify-between text-[10px] opacity-70 italic">
              <span>@{item.price.toFixed(2)}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            {item.note && (
              <p className="text-[9px] text-gray-600 mt-0.5">* {item.note}</p>
            )}
          </div>
        ))}
      </div>

      {/* Calculations */}
      <div className="border-t border-black border-dashed pt-4 space-y-2">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>${transaction.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>TAX (10%)</span>
          <span>${transaction.tax.toFixed(2)}</span>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between text-base font-black border-t-2 border-black border-double pt-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            <span>TOTAL</span>
            <span>${transaction.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-10 pt-6 border-t border-black border-dashed space-y-4">
        <div className="space-y-1">
          <p className="font-bold uppercase">Terima Kasih!</p>
          <p className="text-[10px]">Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan</p>
        </div>
        
        {/* Placeholder Barcode */}
        <div className="flex flex-col items-center gap-1 opacity-60">
          <div className="w-full h-8 bg-black flex flex-col items-center justify-center p-1">
             <div className="w-full h-full bg-white flex items-center justify-center gap-0.5 px-2">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className={`h-full ${Math.random() > 0.5 ? 'w-0.5 bg-black' : 'w-1 bg-black'} ${Math.random() > 0.3 ? 'block' : 'hidden'}`}></div>
                ))}
             </div>
          </div>
          <p className="text-[8px] tracking-[4px]">{transaction.id}</p>
        </div>
      </div>
    </div>
  );
}