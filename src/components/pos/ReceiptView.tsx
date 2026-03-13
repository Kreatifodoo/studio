
"use client";

import React from 'react';
import { Transaction } from '@/types/pos';
import { format } from 'date-fns';
import { usePOS } from './POSContext';

interface ReceiptViewProps {
  transaction: Transaction | null;
}

export function ReceiptView({ transaction }: ReceiptViewProps) {
  const { packages, products, storeSettings } = usePOS();
  
  if (!transaction) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="pos-receipt" className="w-[80mm] bg-white text-black p-4 font-mono text-[11px] leading-relaxed">
      <div className="text-center mb-6 space-y-2">
        {storeSettings.logoUrl && (
          <div className="flex justify-center mb-3">
            <img src={storeSettings.logoUrl} alt="Store Logo" className="h-16 w-auto object-contain" />
          </div>
        )}
        <h2 className="text-base font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
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
          <span>{format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>METODE</span>
          <span className="font-bold">{transaction.paymentMethod}</span>
        </div>
        {transaction.paymentReference && (
          <div className="flex justify-between">
            <span>REF</span>
            <span>{transaction.paymentReference}</span>
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
            
            {item.isPackage && (
              <div className="pl-2 mb-1 border-l border-black/10">
                {packages.find(p => p.id === item.productId)?.items.map((pkgItem, pIdx) => {
                  const productDetails = products.find(p => p.id === pkgItem.productId);
                  return (
                    <div key={pIdx} className="text-[9px] opacity-70 flex justify-between italic">
                      <span>- {productDetails?.name || 'Item'}</span>
                      <span>x{pkgItem.quantity * item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {item.isCombo && item.comboSelections && (
              <div className="pl-2 mb-1 border-l border-black/10">
                {item.comboSelections.map((sel, sIdx) => {
                  const productDetails = products.find(p => p.id === sel.productId);
                  return (
                    <div key={sIdx} className="text-[9px] opacity-70 flex justify-between italic">
                      <span>- {productDetails?.name || 'Pilihan'}</span>
                      {sel.extraPrice > 0 && <span>+{formatCurrency(sel.extraPrice)}</span>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between text-[10px] opacity-70 italic">
              <div className="flex flex-col">
                <span>@{formatCurrency(item.price)}</span>
                {item.promoSavings > 0 && (
                  <span className="text-[8px] text-gray-500 line-through">asli @{formatCurrency(item.originalPrice)}</span>
                )}
              </div>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
            
            {item.promoSavings > 0 && (
              <p className="text-[8px] font-bold text-gray-600 italic">** Potongan Promo: -{formatCurrency(item.promoSavings * item.quantity)}</p>
            )}

            {item.note && (
              <p className="text-[9px] text-gray-600 mt-0.5">* {item.note}</p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-black/20 pt-4 space-y-2">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{formatCurrency(transaction.subtotal)}</span>
        </div>
        
        {transaction.totalSavings > 0 && (
          <div className="flex justify-between text-gray-600 font-bold">
            <span>TOTAL HEMAT</span>
            <span>-{formatCurrency(transaction.totalSavings)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>PAJAK (11%)</span>
          <span>{formatCurrency(transaction.tax)}</span>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between text-base font-black border-t-2 border-black pt-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            <span>TOTAL AKHIR</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
        </div>
      </div>

      {transaction.totalSavings > 0 && (
        <div className="mt-4 p-2 border-2 border-dashed border-black text-center">
          <p className="font-bold uppercase text-[9px]">Anda Berhemat Hari Ini!</p>
          <p className="text-base font-black">{formatCurrency(transaction.totalSavings)}</p>
        </div>
      )}

      <div className="text-center mt-10 pt-6 border-t border-black/20 space-y-4">
        <div className="space-y-1">
          <p className="font-bold uppercase">Terima Kasih!</p>
          {storeSettings.footerNote && (
            <p className="text-[10px]">{storeSettings.footerNote}</p>
          )}
        </div>
        
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
