"use client";

import React, { useState, useMemo } from 'react';
import { LayoutDashboard, ShoppingCart, Clock, Settings, LogOut, UtensilsCrossed, FileText, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SessionSummaryReceipt } from './SessionSummaryReceipt';

export function Sidebar() {
  const { view, setView, currentSession, closeSession, history, lastClosedSession } = usePOS();
  const [closingCash, setClosingCash] = useState('');
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);

  const expectedCash = useMemo(() => {
    if (!currentSession) return 0;
    const sessionTransactions = history.filter(t => currentSession.transactionIds.includes(t.id));
    const cashSales = sessionTransactions
      .filter(t => t.paymentMethod === 'Tunai')
      .reduce((acc, t) => acc + t.total, 0);
    
    return currentSession.openingCash + cashSales;
  }, [currentSession, history]);

  const currentClosingAmount = parseFloat(closingCash) || 0;
  const isBalanced = Math.abs(currentClosingAmount - expectedCash) < 0.01;

  const navItems = [
    { id: 'pos', icon: ShoppingCart, label: 'Kasir' },
    { id: 'history', icon: Clock, label: 'Riwayat' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dasbor' },
    { id: 'reports', icon: FileText, label: 'Laporan' },
    { id: 'settings', icon: Settings, label: 'Pengaturan' },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleCloseSession = () => {
    closeSession(currentClosingAmount);
    setClosingCash('');
    setShowSummaryPreview(true);
    // Otomatis cetak setelah state diupdate
    setTimeout(() => {
      window.print();
    }, 800);
  };

  return (
    <aside className="w-24 md:w-28 bg-[#1a1f2b] flex flex-col items-center py-10 justify-between h-screen fixed left-0 top-0 z-50">
      <div className="flex flex-col items-center gap-16 w-full">
        <div 
          onClick={() => setView('pos')}
          className="bg-[#3D8AF5] p-3.5 rounded-[1.25rem] shadow-lg shadow-[#3D8AF5]/20 cursor-pointer hover:scale-105 transition-transform"
        >
          <UtensilsCrossed className="text-white h-7 w-7" />
        </div>

        <nav className="flex flex-col gap-6 w-full px-3">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "relative p-4 rounded-[1.5rem] transition-all duration-300 flex flex-col items-center gap-1 group w-full",
                  isActive 
                    ? "bg-[#3D8AF5] text-white shadow-xl shadow-[#3D8AF5]/30 scale-105" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest mt-1",
                  isActive ? "text-white" : "text-white/30"
                )}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-6 w-full px-3">
        {currentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 w-full flex flex-col items-center group">
                <XCircle className="h-6 w-6" />
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Tutup Sesi</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-8 border-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black">Tutup Sesi Kasir?</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Harap hitung semua uang tunai di laci dengan teliti. Sesi hanya dapat ditutup jika saldo sesuai dengan catatan sistem.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-6 space-y-6">
                 <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Saldo Kas Akhir (Rp)</Label>
                    <Input 
                      type="number" 
                      value={closingCash}
                      onChange={(e) => setClosingCash(e.target.value)}
                      className="h-16 rounded-2xl text-2xl font-black focus-visible:ring-primary/20 border-2"
                      placeholder="0"
                      autoFocus
                    />
                 </div>

                 <div className={cn(
                   "p-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300",
                   isBalanced ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                 )}>
                   {isBalanced ? (
                     <CheckCircle2 className="h-6 w-6 text-green-600" />
                   ) : (
                     <AlertCircle className="h-6 w-6 text-orange-600" />
                   )}
                   <div className="flex-1">
                     <p className={cn("text-sm font-black uppercase tracking-wider", isBalanced ? "text-green-800" : "text-orange-800")}>
                       {isBalanced ? "Saldo Sesuai" : "Selisih Terdeteksi"}
                     </p>
                     <p className={cn("text-xs font-medium", isBalanced ? "text-green-600" : "text-orange-600")}>
                       {isBalanced 
                         ? "Jumlah sesuai dengan total laci yang diharapkan." 
                         : `Input tidak sesuai dengan ekspektasi sistem ${formatCurrency(expectedCash)}.`}
                     </p>
                   </div>
                 </div>
              </div>

              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="rounded-2xl h-14 font-bold border-2">Tetap Buka</AlertDialogCancel>
                <AlertDialogAction 
                  disabled={!isBalanced}
                  onClick={handleCloseSession}
                  className="rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black px-8 disabled:opacity-50 disabled:grayscale"
                >
                  Tutup & Cetak Summary
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <button className="p-4 rounded-2xl text-white/30 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full flex flex-col items-center">
          <LogOut className="h-6 w-6" />
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Keluar</span>
        </button>
      </div>

      <Dialog open={showSummaryPreview} onOpenChange={setShowSummaryPreview}>
        <DialogContent className="max-w-[400px] p-0 border-none shadow-none bg-transparent">
          <DialogHeader className="sr-only">
            <DialogTitle>Ringkasan Sesi Kasir</DialogTitle>
          </DialogHeader>
          <SessionSummaryReceipt session={lastClosedSession} />
        </DialogContent>
      </Dialog>
    </aside>
  );
}
