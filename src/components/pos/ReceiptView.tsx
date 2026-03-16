
"use client";

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/pos';
import { format } from 'date-fns';
import { usePOS } from './POSContext';

interface ReceiptViewProps {
  transaction: Transaction | null;
}

export function ReceiptView({ transaction }: ReceiptViewProps) {
  const { storeSettings, customers } = usePOS();
  const [barcodeBars, setBarcodeBars] = useState<{width: string, show: boolean}[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const bars = [...Array(24)].map(() => ({
      width: Math.random() > 0.5 ? 'w-0.5' : 'w-1',
      show: Math.random() > 0.3
    }));
    setBarcodeBars(bars);
  }, []);

  if (!transaction || !mounted) return null;

  const selectedCustomer = transaction.customerId 
    ? customers.find(c => c.id === transaction.customerId) 
    : null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const transactionDate = new Date(transaction.date);

  return (
    <div id="pos-receipt" className="w-[80mm] bg-white text-black p-4 font-mono text-[11px] leading-relaxed">
      <div className="text-center mb-6 space-y-2">
        {storeSettings.logoUrl && (
          <div className="flex justify-center mb-3">
            <img src={storeSettings.logoUrl} alt="Store Logo" className="h-16 w-auto object-contain" />
          </div>
        )}
        <h2 className="text-base font-black uppercase tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {storeSettings.name}
        </h2>
        {storeSettings.address && (
          <p className="opacity-80 whitespace-pre-line">{storeSettings.address}</p>
        )}
        {storeSettings.headerNote && (
          <p className="font-bold border-y border-black/10 py-1 mt-2">{storeSettings.headerNote}</p>
        )}
      </div>

      <div className="border-t border-b border-black/20 py-3 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>NO. ORDER</span>
          <span className="font-bold">#{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span>TANGGAL</span>
          <span>{isNaN(transactionDate.getTime()) ? '-' : format(transactionDate, 'dd/MM/yyyy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>METODE</span>
          <span className="font-bold">{transaction.paymentMethod}</span>
        </div>
        {transaction.staffName && (
          <div className="flex justify-between">
            <span>KASIR</span>
            <span className="font-bold uppercase">{transaction.staffName}</span>
          </div>
        )}
        {selectedCustomer && (
          <div className="flex justify-between">
            <span>PELANGGAN</span>
            <span className="font-bold uppercase">{selectedCustomer.name}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {transaction.items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex justify-between font-bold">
              <span className="flex-1 pr-2 uppercase">{item.name}</span>
              <span>x{item.quantity}</span>
            </div>
            <div className="flex justify-between text-[10px] opacity-70 italic">
              <span>@{formatCurrency(item.price)}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-black/20 pt-4 space-y-2">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{formatCurrency(transaction.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>PAJAK</span>
          <span>{formatCurrency(transaction.tax)}</span>
        </div>
        <div className="pt-2">
          <div className="flex justify-between text-base font-black border-t-2 border-black pt-2">
            <span>TOTAL AKHIR</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-10 pt-6 border-t border-black/20 space-y-4">
        <p className="font-bold uppercase">Terima Kasih!</p>
        <div className="flex flex-col items-center gap-1 opacity-60">
          <div className="w-full h-8 bg-black flex items-center justify-center gap-0.5 px-2">
            {barcodeBars.map((bar, i) => (
              <div key={i} className={`h-full ${bar.width} bg-white ${bar.show ? 'block' : 'hidden'}`}></div>
            ))}
          </div>
          <p className="text-[8px] tracking-[4px]">{transaction.id}</p>
        </div>
      </div>
    </div>
  );
}
