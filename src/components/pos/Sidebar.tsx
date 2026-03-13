
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

export function Sidebar() {
  const { view, setView, currentSession, closeSession, history } = usePOS();
  const [closingCash, setClosingCash] = useState('0');

  // Calculate expected cash in drawer (Best Practice: Opening Cash + Cash Sales)
  const expectedCash = useMemo(() => {
    if (!currentSession) return 0;
    const sessionTransactions = history.filter(t => currentSession.transactionIds.includes(t.id));
    const cashSales = sessionTransactions
      .filter(t => t.paymentMethod === 'Cash')
      .reduce((acc, t) => acc + t.total, 0);
    
    return currentSession.openingCash + cashSales;
  }, [currentSession, history]);

  const currentClosingAmount = parseFloat(closingCash) || 0;
  const isBalanced = Math.abs(currentClosingAmount - expectedCash) < 0.01;

  const navItems = [
    { id: 'pos', icon: ShoppingCart, label: 'Order' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-24 md:w-28 bg-[#1a1f2b] flex flex-col items-center py-10 justify-between h-screen fixed left-0 top-0 z-50">
      <div className="flex flex-col items-center gap-16 w-full">
        {/* Logo */}
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
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1">End Sessi</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-8 border-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black">Close POS Session?</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Please count all cash in the drawer carefully. To ensure financial integrity, sessions can only be closed when the balance matches the system records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-6 space-y-6">
                 <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Ending Cash Balance ($)</Label>
                    <Input 
                      type="number" 
                      value={closingCash}
                      onChange={(e) => setClosingCash(e.target.value)}
                      className="h-16 rounded-2xl text-2xl font-black focus-visible:ring-primary/20 border-2"
                      placeholder="0.00"
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
                       {isBalanced ? "Balance Matched" : "Discrepancy Detected"}
                     </p>
                     <p className={cn("text-xs font-medium", isBalanced ? "text-green-600" : "text-orange-600")}>
                       {isBalanced 
                         ? "The amount matches the expected drawer total." 
                         : `Input does not match the expected $${expectedCash.toFixed(2)}.`}
                     </p>
                   </div>
                 </div>
              </div>

              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="rounded-2xl h-14 font-bold border-2">Keep Open</AlertDialogCancel>
                <AlertDialogAction 
                  disabled={!isBalanced}
                  onClick={() => {
                    closeSession(currentClosingAmount);
                    setClosingCash('0');
                  }}
                  className="rounded-2xl h-14 bg-primary hover:bg-primary/90 font-black px-8 disabled:opacity-50 disabled:grayscale"
                >
                  Close & View Report
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <button className="p-4 rounded-2xl text-white/30 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full flex flex-col items-center">
          <LogOut className="h-6 w-6" />
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Exit</span>
        </button>
      </div>
    </aside>
  );
}
