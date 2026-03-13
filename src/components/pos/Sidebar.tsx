
"use client";

import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Clock, Settings, LogOut, UtensilsCrossed, FileText, XCircle } from 'lucide-react';
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
  const { view, setView, currentSession, closeSession } = usePOS();
  const [closingCash, setClosingCash] = useState('0');

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
              <button className="p-4 rounded-2xl text-white/30 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-300 w-full flex flex-col items-center group">
                <XCircle className="h-6 w-6" />
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-8 border-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black">Close POS Session?</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Ending the session will generate a final report. Please count the cash currently in the drawer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-6 space-y-4">
                 <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Ending Cash Balance ($)</Label>
                    <Input 
                      type="number" 
                      value={closingCash}
                      onChange={(e) => setClosingCash(e.target.value)}
                      className="h-14 rounded-xl text-xl font-bold"
                    />
                 </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl h-12">Keep Open</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => closeSession(parseFloat(closingCash) || 0)}
                  className="rounded-xl h-12 bg-primary hover:bg-primary/90"
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
