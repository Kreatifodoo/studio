"use client"

import React, { useState, useMemo } from 'react';
import { ShoppingCart, Clock, Settings, LogOut, FileText, XCircle, AlertCircle, CheckCircle2, DollarSign, ArrowRight, LayoutDashboard } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const KompakLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Vertical Column */}
    <path 
      d="M25 20C25 17.2386 27.2386 15 30 15H38C40.7614 15 43 17.2386 43 20V80C43 82.7614 40.7614 85 38 85H30C27.2386 85 25 82.7614 25 80V20Z" 
      fill="currentColor" 
    />
    {/* Top Leaf Piece */}
    <path 
      d="M48 50C48 30.67 63.67 15 83 15V50H48Z" 
      fill="currentColor" 
    />
    {/* Bottom Leaf Piece */}
    <path 
      d="M48 50H83V85C63.67 85 48 69.33 48 50Z" 
      fill="currentColor" 
    />
  </svg>
);

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

  const handleCloseSession = async (shouldPrint: boolean) => {
    if (!currentSession) return;
    const finalAmount = parseFloat(closingCash) || 0;
    closeSession(finalAmount);
    setClosingCash('');
    if (shouldPrint) {
      setShowSummaryPreview(true);
    }
  };

  return (
    <aside className="w-16 md:w-24 bg-[#1a1f2b] flex flex-col items-center py-6 md:py-10 justify-between h-screen fixed left-0 top-0 z-50 border-r border-white/5">
      <div className="flex flex-col items-center gap-10 md:gap-14 w-full">
        <div 
          onClick={() => setView('pos')}
          className="bg-primary p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] shadow-xl shadow-primary/20 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <KompakLogo className="text-white h-5 w-5 md:h-7 md:w-7" />
        </div>

        <nav className="flex flex-col gap-4 md:gap-6 w-full px-2">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const isActive = view === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setView(item.id as any)}
                      className={cn(
                        "relative p-3.5 md:p-5 rounded-2xl md:rounded-[1.5rem] transition-all duration-500 flex items-center justify-center group w-full",
                        isActive 
                          ? "bg-white/10 text-primary shadow-inner" 
                          : "text-white/20 hover:bg-white/5 hover:text-white/60"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 md:h-7 md:w-7", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                      {isActive && (
                        <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white text-[#1a1f2b] font-black uppercase tracking-widest text-[10px] border-none shadow-2xl rounded-lg">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>

      <div className="flex flex-col items-center gap-4 w-full px-2">
        {currentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-3.5 md:p-5 rounded-2xl md:rounded-[1.5rem] bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 w-full flex items-center justify-center group">
                <XCircle className="h-5 w-5 md:h-7 md:w-7" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-8 border-none max-w-[95vw] md:max-w-md shadow-2xl bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black">Tutup Sesi Kasir</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Harap hitung semua uang tunai di laci dengan teliti sebelum menutup sesi operasional hari ini.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-6 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-muted/30 p-4 rounded-2xl">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Modal Awal</p>
                     <p className="text-sm font-black">{formatCurrency(currentSession.openingCash)}</p>
                   </div>
                   <div className="bg-muted/30 p-4 rounded-2xl">
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Sales Tunai</p>
                     <p className="text-sm font-black">{formatCurrency(sessionStats.sales)}</p>
                   </div>
                 </div>

                 <div className="bg-primary/5 p-6 rounded-[2rem] border-2 border-primary/10 flex flex-col items-center">
                   <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-1">Ekspektasi Kas</p>
                   <p className="text-3xl font-black text-primary tracking-tight">{formatCurrency(sessionStats.expected)}</p>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kas Aktual di Laci (Fisik)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/30" />
                      <Input 
                        type="number" 
                        value={closingCash}
                        onChange={(e) => setClosingCash(e.target.value)}
                        className="h-16 rounded-2xl text-2xl font-black border-2 focus-visible:ring-primary/20 pl-14"
                        placeholder="0"
                        autoFocus
                      />
                    </div>
                 </div>

                 <div className={cn(
                   "p-5 rounded-[1.5rem] border-2 flex items-center justify-between transition-all duration-500",
                   isBalanced ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"
                 )}>
                   <div className="flex items-center gap-4">
                     {isBalanced ? (
                       <CheckCircle2 className="h-7 w-7 text-green-500" />
                     ) : (
                       <AlertCircle className="h-7 w-7 text-orange-500" />
                     )}
                     <div>
                        <p className={cn("text-[11px] font-black uppercase tracking-widest", isBalanced ? "text-green-700" : "text-orange-700")}>
                          {isBalanced ? "Saldo Sesuai" : "Selisih Terdeteksi"}
                        </p>
                        <p className={cn("text-[9px] font-bold leading-tight", isBalanced ? "text-green-600" : "text-orange-600")}>
                          {isBalanced ? "Uang di laci cocok dengan sistem." : `Terdapat selisih: ${formatCurrency(cashDiff)}`}
                        </p>
                     </div>
                   </div>
                   {!isBalanced && (
                     <Badge variant="outline" className="bg-white border-orange-200 text-orange-700 font-black text-[10px] px-2 py-1">
                        {cashDiff > 0 ? 'Surplus' : 'Minus'}
                     </Badge>
                   )}
                 </div>
              </div>

              <AlertDialogFooter className="gap-3 sm:flex-col sm:gap-3">
                <AlertDialogCancel className="rounded-xl h-14 font-bold border-2 text-sm mt-0 border-muted-foreground/10 hover:bg-muted/50 transition-all">Kembali</AlertDialogCancel>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleCloseSession(false)}
                    className="rounded-xl h-14 bg-muted hover:bg-muted/80 text-foreground font-bold px-8 transition-all active:scale-95"
                  >
                    Tutup Tanpa Cetak
                  </button>
                  <AlertDialogAction 
                    onClick={() => handleCloseSession(true)}
                    className="rounded-xl h-16 bg-primary hover:bg-primary/90 font-black px-8 shadow-2xl shadow-primary/30 text-base gap-3 transition-all active:scale-95"
                  >
                    Tutup & Cetak Laporan
                    <ArrowRight className="h-5 w-5" />
                  </AlertDialogAction>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <button 
          onClick={logout}
          className="p-3.5 md:p-5 rounded-2xl md:rounded-[1.5rem] text-white/10 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full flex items-center justify-center"
        >
          <LogOut className="h-5 w-5 md:h-7 md:w-7" />
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