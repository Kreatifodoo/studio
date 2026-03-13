
"use client";

import React from 'react';
import { LayoutDashboard, ShoppingCart, Clock, Settings, LogOut, UtensilsCrossed } from 'lucide-react';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { view, setView } = usePOS();

  const navItems = [
    { id: 'pos', icon: ShoppingCart, label: 'Order' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-20 md:w-24 bg-sidebar flex flex-col items-center py-8 justify-between h-screen fixed left-0 top-0 z-50">
      <div className="flex flex-col items-center gap-12 w-full">
        <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
          <UtensilsCrossed className="text-white h-6 w-6" />
        </div>

        <nav className="flex flex-col gap-6 w-full px-2">
          {navItems.map((item) => {
            const isActive = (item.id === 'pos' && view === 'pos') || (item.id === 'history' && view === 'history');
            return (
              <button
                key={item.id}
                onClick={() => (item.id === 'pos' || item.id === 'history') && setView(item.id as any)}
                className={cn(
                  "p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1 group w-full",
                  isActive ? "bg-primary text-white scale-110" : "text-sidebar-foreground/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] font-medium hidden md:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-6 w-full px-2">
        <button className="p-4 rounded-2xl text-sidebar-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full flex flex-col items-center">
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </aside>
  );
}
