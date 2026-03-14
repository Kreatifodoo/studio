
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
import { useIsMobile } from '@/hooks/use-mobile';

export function Sidebar() {
  const { view, setView, currentSession, closeSession, history, lastClosedSession, logout, currentUser, checkPermission } = usePOS();
  const [closingCash, setClosingCash] = useState('');
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);
  const isMobile = useIsMobile();

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
    <aside className="w-20 md:w-28 bg-[#1a1f2b] flex flex-col items-center py-6 md:py-10 justify-between h-screen fixed left-0 top-0 z-50">
      <div className="flex flex-col items-center gap-8 md:gap-12 w-full">
        <div 
          onClick={() => setView('pos')}
          className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <UtensilsCrossed className="text-white h-6 w-6 md:h-7 md:w-7" />
        </div>

        <nav className="flex flex-col gap-3 md:gap-4 w-full px-2">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "relative p-3 md:p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1 group w-full",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105" 
                    : "text-white/40 hover:bg-white/5 hover:text-white active:scale-90"
                )}
              >
                <item.icon className={cn("h-5 w-5 md:h-6 md:w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className={cn(
                  "text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1 hidden md:block",
                  isActive ? "text-white" : "text-white/30"
                )}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3 md:gap-4 w-full px-2">
        {currentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-3 md:p-4 rounded-2xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white active:scale-90 transition-all duration-300 w-full flex flex-col items-center group">
                <XCircle className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1 hidden md:block">Tutup Sesi</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-6 border-none max-w-[95vw] md:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black">Tutup Sesi Kasir?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Harap hitung semua uang tunai di laci dengan teliti. Sesi hanya dapat ditutup jika saldo sesuai.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4 space-y-4">
                 <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Saldo Kas Akhir (Rp)</Label>
                    <Input 
                      type="number" 
                      value={closingCash}
                      onChange={(e) => setClosingCash(e.target.value)}
                      className="h-14 rounded-2xl text-xl font-black focus-visible:ring-primary/20 border-2"
                      placeholder="0"
                      autoFocus
                    />
                 </div>

                 <div className={cn(
                   "p-4 rounded-2xl border-2 flex items-center gap-3 transition-all duration-300",
                   isBalanced ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                 )}>
                   {isBalanced ? (
                     <CheckCircle2 className="h-5 w-5 text-green-600" />
                   ) : (
                     <AlertCircle className="h-5 w-5 text-orange-600" />
                   )}
                   <div className="flex-1">
                     <p className={cn("text-xs font-black uppercase tracking-wider", isBalanced ? "text-green-800" : "text-orange-800")}>
                       {isBalanced ? "Saldo Sesuai" : "Selisih Terdeteksi"}
                     </p>
                     <p className={cn("text-[10px]", isBalanced ? "text-green-600" : "text-orange-600")}>
                       {isBalanced 
                         ? "Jumlah sesuai dengan ekspektasi laci." 
                         : `Input tidak sesuai (${formatCurrency(expectedCash)}).`}
                     </p>
                   </div>
                 </div>
              </div>

              <AlertDialogFooter className="gap-2 sm:gap-0">
                <AlertDialogCancel className="rounded-xl h-12 font-bold border-2">Batal</AlertDialogCancel>
                <AlertDialogAction 
                  disabled={!isBalanced}
                  onClick={handleCloseSession}
                  className="rounded-xl h-12 bg-primary hover:bg-primary/90 font-black px-6 disabled:opacity-50"
                >
                  Tutup & Cetak
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <button 
          onClick={logout}
          className="p-3 md:p-4 rounded-2xl text-white/30 hover:bg-destructive/10 hover:text-destructive active:scale-90 transition-all duration-300 w-full flex flex-col items-center"
        >
          <LogOut className="h-5 w-5 md:h-6 md:w-6" />
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1 hidden md:block">Keluar</span>
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
