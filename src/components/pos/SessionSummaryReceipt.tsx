"use client";

import React from 'react';
import { Session, Transaction, StoreSettings } from '@/types/pos';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { usePOS } from './POSContext';

interface SessionSummaryReceiptProps {
  session: Session | null;
}

export function SessionSummaryReceipt({ session }: SessionSummaryReceiptProps) {
  const { history, storeSettings } = usePOS();
  
  if (!session) return null;

  const sessionTransactions = history.filter(t => session.transactionIds.includes(t.id));
  
  const stats = {
    totalSales: sessionTransactions.reduce((acc, t) => acc + t.total, 0),
    totalTax: sessionTransactions.reduce((acc, t) => acc + t.tax, 0),
    totalSubtotal: sessionTransactions.reduce((acc, t) => acc + t.subtotal, 0),
    totalSavings: sessionTransactions.reduce((acc, t) => acc + t.totalSavings, 0),
    count: sessionTransactions.length
  };

  const paymentsByMethod = sessionTransactions.reduce((acc: Record<string, number>, t) => {
    const method = t.paymentMethod || 'Lainnya';
    acc[method] = (acc[method] || 0) + t.total;
    return acc;
  }, {});

  const cashExpected = session.openingCash + (paymentsByMethod['Tunai'] || 0);
  const cashActual = session.closingCash || 0;
  const cashDiff = cashActual - cashExpected;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="session-summary-receipt" className="w-[80mm] bg-white text-black p-4 font-mono text-[11px] leading-relaxed mx-auto border shadow-sm">
      <div className="text-center mb-6 space-y-1">
        <h2 className="text-base font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          {storeSettings.name}
        </h2>
        <p className="text-[9px] opacity-70 uppercase">Ringkasan Penjualan Sesi</p>
        <p className="text-[9px] font-bold">#{session.id}</p>
      </div>

      <div className="border-y border-black/10 py-2 mb-4 space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span>MULAI</span>
          <span>{format(new Date(session.startTime), 'dd/MM/yy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>SELESAI</span>
          <span>{session.endTime ? format(new Date(session.endTime), 'dd/MM/yy HH:mm') : '-'}</span>
        </div>
        <div className="flex justify-between">
          <span>STATUS</span>
          <span className="font-bold">{session.status === 'Open' ? 'TERBUKA' : 'TERTUTUP'}</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <p className="font-black border-b border-black/5 pb-1 mb-2 text-center text-[9px] uppercase tracking-widest">Rekapitulasi Kas</p>
        <div className="flex justify-between">
          <span>Modal Awal</span>
          <span>{formatCurrency(session.openingCash)}</span>
        </div>
        <div className="flex justify-between">
          <span>Penjualan Tunai</span>
          <span>{formatCurrency(paymentsByMethod['Tunai'] || 0)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-black/5 pt-1">
          <span>Ekspektasi Kas</span>
          <span>{formatCurrency(cashExpected)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kas Aktual</span>
          <span>{formatCurrency(cashActual)}</span>
        </div>
        <div className={`flex justify-between font-black ${cashDiff !== 0 ? 'text-black' : ''}`}>
          <span>Selisih</span>
          <span>{cashDiff > 0 ? '+' : ''}{formatCurrency(cashDiff)}</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <p className="font-black border-b border-black/5 pb-1 mb-2 text-center text-[9px] uppercase tracking-widest">Detail Penjualan</p>
        <div className="flex justify-between">
          <span>Total Transaksi</span>
          <span>{stats.count}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal (Net)</span>
          <span>{formatCurrency(stats.totalSubtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak Terkumpul</span>
          <span>{formatCurrency(stats.totalTax)}</span>
        </div>
        <div className="flex justify-between text-gray-600 italic">
          <span>Total Promo/Diskon</span>
          <span>-{formatCurrency(stats.totalSavings)}</span>
        </div>
        <div className="flex justify-between font-black text-xs border-t-2 border-black pt-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          <span>TOTAL PENJUALAN</span>
          <span>{formatCurrency(stats.totalSales)}</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-6">
        <p className="font-black border-b border-black/5 pb-1 mb-2 text-center text-[9px] uppercase tracking-widest">Metode Pembayaran</p>
        {Object.entries(paymentsByMethod).map(([method, amount]) => (
          <div key={method} className="flex justify-between">
            <span>{method.toUpperCase()}</span>
            <span>{formatCurrency(amount)}</span>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 pt-4 border-t border-black/20 space-y-1">
        <p className="text-[9px] opacity-60 italic">Dicetak pada {format(new Date(), 'dd MMM yyyy HH:mm', { locale: localeId })}</p>
        <p className="text-[8px] tracking-[2px] opacity-40">SESSION-Z-REPORT</p>
      </div>
    </div>
  );
}
