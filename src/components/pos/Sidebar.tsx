
"use client"

import React, { useState, useMemo } from 'react';
import { LayoutDashboard, ShoppingCart, Clock, Settings, LogOut, UtensilsCrossed, FileText, XCircle, AlertCircle, CheckCircle2, DollarSign, ArrowRight } from 'lucide-react';
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
import { Permission, Session } from '@/types/pos';

export function Sidebar() {
  const { 
    view, setView, currentSession, closeSession, history, 
    lastClosedSession, logout, currentUser, checkPermission, 
    printer, printSessionSummaryViaBluetooth 
  } = usePOS();
  const [closingCash, setClosingCash] = useState('');
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const sessionStats = useMemo(() => {
    if (!currentSession) return { expected: 0, sales: 0, count: 0 };
    const sessionTransactions = history.filter(t => currentSession.transactionIds.includes(t.id));
    const cashSales = sessionTransactions
      .filter(t => t.paymentMethod === 'Tunai')
      .reduce((acc, t) => acc + t.total, 0);
    
    return {
      expected: currentSession.openingCash + cashSales,
      sales: cashSales,
      count: sessionTransactions.length
    };
  }, [currentSession, history]);

  const currentClosingAmount = parseFloat(closingCash) || 0;
  const cashDiff = currentClosingAmount - sessionStats.expected;
  const isBalanced = Math.abs(cashDiff) < 100;

  const navItems = useMemo(() => {
    const allItems = [
      { id: 'pos', icon: ShoppingCart, label: 'Kasir', permission: 'view_pos' as Permission },
      { id: 'history', icon: Clock, label: 'Riwayat', permission: 'view_history' as Permission },
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dasbor', permission: 'view_dashboard' as Permission },
      { id: 'reports', icon: FileText, label: 'Laporan', permission: 'view_reports' as Permission },
      { id: 'settings', icon: Settings, label: 'Pengaturan', permission: 'manage_products' as Permission }, 
    ];

    return allItems.filter(item => {
      if (item.id === 'settings') {
        return checkPermission('manage_settings') || checkPermission('manage_products') || checkPermission('manage_customers') || checkPermission('manage_users');
      }
      return checkPermission(item.permission);
    });
  }, [checkPermission]);

  const handleCloseSession = async () => {
    if (!currentSession) return;

    const sessionToPrint: Session = {
      ...currentSession,
      endTime: new Date().toISOString(),
      closingCash: currentClosingAmount,
      status: 'Closed'
    };

    closeSession(currentClosingAmount);
    setClosingCash('');
    setShowSummaryPreview(true);

    if (printer.status === 'connected') {
      await printSessionSummaryViaBluetooth(sessionToPrint);
    } else {
      setTimeout(() => {
        window.print();
      }, 800);
    }
  };

  return (
    <aside className="w-14 md:w-20 bg-[#1a1f2b] flex flex-col items-center py-4 md:py-6 justify-between h-screen fixed left-0 top-0 z-50">
      <div className="flex flex-col items-center gap-4 md:gap-8 w-full">
        <div 
          onClick={() => setView('pos')}
          className="bg-primary p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <UtensilsCrossed className="text-white h-4 w-4 md:h-5 md:w-5" />
        </div>

        <nav className="flex flex-col gap-1 md:gap-2 w-full px-1">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "relative p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 flex flex-col items-center gap-0.5 group w-full",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "text-white/30 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4 md:h-5 md:w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className={cn(
                  "text-[6px] md:text-[8px] font-black uppercase tracking-tighter mt-0.5 hidden md:block",
                  isActive ? "text-white" : "text-white/20"
                )}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-1 md:gap-2 w-full px-1">
        {currentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2 md:p-3 rounded-lg md:rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 w-full flex flex-col items-center group">
                <XCircle className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter mt-0.5 hidden md:block text-orange-500/50 group-hover:text-white">Tutup</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2rem] p-6 border-none max-w-[95vw] md:max-w-md shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black">Tutup Sesi Kasir</AlertDialogTitle>
                <AlertDialogDescription className="text-xs font-medium">
                  Harap hitung semua uang tunai di laci dengan teliti sebelum menutup sesi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4 space-y-6">
                 {/* Summary Cards */}
                 <div className="grid grid-cols-2 gap-3">
                   <div className="bg-muted/30 p-3 rounded-2xl">
                     <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Modal Awal</p>
                     <p className="text-xs font-black">{formatCurrency(currentSession.openingCash)}</p>
                   </div>
                   <div className="bg-muted/30 p-3 rounded-2xl">
                     <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Tunai</p>
                     <p className="text-xs font-black">{formatCurrency(sessionStats.sales)}</p>
                   </div>
                 </div>

                 <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/10 flex flex-col items-center">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Ekspektasi Saldo Akhir</p>
                   <p className="text-2xl font-black text-primary">{formatCurrency(sessionStats.expected)}</p>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Saldo Kas Aktual (Fisik)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                      <Input 
                        type="number" 
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
                        className="h-14 rounded-2xl text-xl font-black border-2 focus-visible:ring-primary/20 pl-12"
                        placeholder="0"
                        autoFocus
                      />
                    </div>
                 </div>

                 <div className={cn(
                   "p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-300",
                   isBalanced ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"
                 )}>
                   <div className="flex items-center gap-3">
                     {isBalanced ? (
                       <CheckCircle2 className="h-6 w-6 text-green-500" />
                     ) : (
                       <AlertCircle className="h-6 w-6 text-orange-500" />
                     )}
                     <div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isBalanced ? "text-green-700" : "text-orange-700")}>
                          {isBalanced ? "Saldo Sesuai" : "Selisih Terdeteksi"}
                        </p>
                        <p className={cn("text-[8px] font-bold", isBalanced ? "text-green-600" : "text-orange-600")}>
                          {isBalanced ? "Uang di laci cocok dengan sistem." : `Selisih: ${formatCurrency(cashDiff)}`}
                        </p>
                     </div>
                   </div>
                   {!isBalanced && (
                     <Badge variant="outline" className="bg-white border-orange-200 text-orange-700 font-black text-[10px]">
                        {cashDiff > 0 ? 'Surplus' : 'Minus'}
                     </Badge>
                   )}
                 </div>
              </div>

              <AlertDialogFooter className="gap-3 sm:flex-col sm:gap-3">
                <AlertDialogCancel className="rounded-xl h-12 font-bold border-2 text-sm mt-0">Kembali</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCloseSession}
                  className="rounded-xl h-14 bg-primary hover:bg-primary/90 font-black px-6 shadow-xl shadow-primary/20 text-sm gap-2"
                >
                  Tutup & Cetak Laporan
                  <ArrowRight className="h-4 w-4" />
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <button 
          onClick={logout}
          className="p-2 md:p-3 rounded-lg md:rounded-xl text-white/20 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full flex flex-col items-center"
        >
          <LogOut className="h-4 w-4 md:h-5 md:w-5" />
          <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter mt-0.5 hidden md:block">Keluar</span>
        </button>
      </div>

      <Dialog open={showSummaryPreview} onOpenChange={setShowSummaryPreview}>
        <DialogContent className="max-w-[95vw] md:max-w-[400px] p-0 border-none shadow-none bg-transparent">
          <DialogHeader className="sr-only">
            <DialogTitle>Ringkasan Sesi Kasir</DialogTitle>
          </DialogHeader>
          <SessionSummaryReceipt session={lastClosedSession} />
        </DialogContent>
      </Dialog>
    </aside>
  );
}
