"use client";

import React, { useState, useEffect } from 'react';
import { Search, Bell, ScanLine } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePOS } from './POSContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { isNative } from '@/lib/native-bridge';

export function SearchHeader() {
  const { searchQuery, setSearchQuery, currentUser, roles, triggerNativeScan } = usePOS();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const currentRole = roles.find(r => r.id === currentUser?.roleId);

  return (
    <header className="flex items-center justify-between gap-3 md:gap-8 py-3 md:py-6 mb-1">
      <div className="relative flex-1 max-w-xl flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground/60" />
          <Input
            placeholder="Cari produk atau scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 md:pl-14 h-10 md:h-14 bg-white border-none shadow-sm rounded-xl md:rounded-2xl text-xs md:text-base font-medium placeholder:text-muted-foreground/40 focus-visible:ring-primary/20 transition-all"
          />
        </div>
        
        {mounted && isNative() && (
          <button 
            onClick={triggerNativeScan}
            className="h-10 w-10 md:h-14 md:w-14 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            <ScanLine className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2.5 md:p-4 bg-white rounded-lg md:rounded-xl shadow-sm text-muted-foreground hover:text-primary active:scale-90 transition-all">
          <Bell className="h-4.5 w-4.5 md:h-6 md:w-6" />
        </button>
        
        <div className="flex items-center gap-2 bg-white p-1.5 pr-3 md:pr-5 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95">
          <Avatar className="h-8 w-8 md:h-11 md:w-11 border-2 md:border-3 border-primary/10 rounded-lg md:rounded-xl">
            <AvatarImage src={currentUser?.avatarUrl} />
            <AvatarFallback className="rounded-lg md:rounded-xl bg-primary text-white font-black text-[10px] md:text-xs">
              {currentUser?.name?.substring(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden lg:block">
            <p className="text-[10px] md:text-xs font-black leading-tight">{currentUser?.name || 'User'}</p>
            <p className="text-[7px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{currentRole?.name || 'Staff'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}