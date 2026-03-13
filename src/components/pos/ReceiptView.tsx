
"use client";

import React from 'react';
import { OrderItem, Transaction } from '@/types/pos';
import { format } from 'date-fns';

interface ReceiptViewProps {
  transaction: Transaction | null;
  storeName?: string;
}

export function ReceiptView({ transaction, storeName = "ALEX'S DELI" }: ReceiptViewProps) {
  if (!transaction) return null;

  return (
    <div id="pos-receipt" className="w-[80mm] p-4 bg-white text-black font-mono text-[12px] leading-tight">
      <div className="text-center mb-4">
        <h2 className="text-lg font-black">{storeName}</h2>
        <p>Jl. Sudirman No. 123, Jakarta</p>
        <p>Telp: (021) 1234567</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-2">
        <p>Order: #{transaction.id}</p>
        <p>Date: {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}</p>
        <p>Method: {transaction.paymentMethod}</p>
        {transaction.paymentReference && <p>Ref: {transaction.paymentReference}</p>}
      </div>

      <div className="mb-2">
        {transaction.items.map((item, idx) => (
          <div key={idx} className="mb-2">
            <div className="flex justify-between">
              <span className="flex-1">{item.name}</span>
              <span>{item.quantity}x</span>
            </div>
            <div className="flex justify-between pl-4">
              <span>@{item.price.toFixed(2)}</span>
              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            {item.note && <p className="text-[10px] italic pl-4">Note: {item.note}</p>}
          </div>
        ))}
      </div>

      <div className="border-t border-black border-dashed pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${transaction.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${transaction.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-black pt-1 border-t border-black border-double">
          <span>TOTAL</span>
          <span>${transaction.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-black border-dashed">
        <p className="font-bold">Thank You!</p>
        <p>Please visit us again</p>
        <div className="mt-4 flex justify-center">
          <div className="w-32 h-8 bg-black/10 flex items-center justify-center">
            <span className="text-[10px] tracking-widest">BARCODE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
