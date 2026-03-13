
"use client";

import React from 'react';
import { LayoutDashboard, ShoppingCart, Clock, Settings, LogOut, UtensilsCrossed, Plus } from 'lucide-react';
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
    <aside className="w-24 md:w-28 bg-[#1a1f2b] flex flex-col items-center py-10 justify-between h-screen fixed left-0 top-0 z-50">
      <div className="flex flex-col items-center gap-16 w-full">
        {/* Logo */}
        <div className="bg-[#3D8AF5] p-3.5 rounded-[1.25rem] shadow-lg shadow-[#3D8AF5]/20 cursor-pointer hover:scale-105 transition-transform">
          <UtensilsCrossed className="text-white h-7 w-7" />
        </div>

        <nav className="flex flex-col gap-8 w-full px-3">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={cn(
                  "relative p-5 rounded-[1.5rem] transition-all duration-300 flex flex-col items-center gap-1 group w-full",
                  isActive 
                    ? "bg-[#3D8AF5] text-white shadow-xl shadow-[#3D8AF5]/30 scale-105" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("h-7 w-7", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mt-1",
                  isActive ? "text-white" : "text-white/30"
                )}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-8 w-full px-3">
        <div className="bg-white/5 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
          <Plus className="text-white/60 h-6 w-6" />
        </div>
        <button className="p-5 rounded-2xl text-white/30 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 w-full flex flex-col items-center">
          <LogOut className="h-7 w-7" />
        </button>
      </div>
    </aside>
  );
}
