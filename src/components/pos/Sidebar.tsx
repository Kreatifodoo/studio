"use client"

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
import { Permission } from '@/types/pos';

export function Sidebar() {
  const { view, setView, currentSession, closeSession, history, lastClosedSession, logout, currentUser, checkPermission } = usePOS();
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
  const isBalanced = Math.abs(currentClosingAmount - expectedCash) < 100; // Toleransi 100 rupiah

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleCloseSession = () => {
    closeSession(currentClosingAmount);
    setClosingCash('');
    setShowSummaryPreview(true);
    setTimeout(() => {
      window.print();
    }, 800);
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
              <button className="p-2 md:p-3 rounded-lg md:rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 w-full flex flex-col items-center">
                <XCircle className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-[6px] md:text-[8px] font-black uppercase tracking-tighter mt-0.5 hidden md:block text-orange-500/50 group-hover:text-white">Tutup</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl p-4 border-none max-w-[90vw] md:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-sm md:text-lg font-black">Tutup Sesi Kasir?</AlertDialogTitle>
                <AlertDialogDescription className="text-[10px] md:text-xs">
                  Harap hitung semua uang tunai di laci dengan teliti.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-2 space-y-3">
                 <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Saldo Kas Akhir (Rp)</Label>
                    <Input 
                      type="number" 
                      value={closingCash}
                      onChange={(e) => setClosingCash(e.target.value)}
                      className="h-10 rounded-lg text-base font-black border-2"
                      placeholder="0"
                      autoFocus
                    />
                 </div>

                 <div className={cn(
                   "p-2 rounded-lg border flex items-center gap-2 transition-all duration-300",
                   isBalanced ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                 )}>
                   {isBalanced ? (
                     <CheckCircle2 className="h-3 w-3 text-green-600" />
                   ) : (
                     <AlertCircle className="h-3 w-3 text-orange-600" />
                   )}
                   <div className="flex-1">
                     <p className={cn("text-[8px] font-black uppercase", isBalanced ? "text-green-800" : "text-orange-800")}>
                       {isBalanced ? "Saldo Sesuai" : "Selisih Terdeteksi"}
                     </p>
                   </div>
                 </div>
              </div>

              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-lg h-9 font-bold border-2 text-[10px]">Batal</AlertDialogCancel>
                <AlertDialogAction 
                  disabled={!isBalanced}
                  onClick={handleCloseSession}
                  className="rounded-lg h-9 bg-primary hover:bg-primary/90 font-black px-4 disabled:opacity-50 text-[10px]"
                >
                  Tutup & Cetak
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