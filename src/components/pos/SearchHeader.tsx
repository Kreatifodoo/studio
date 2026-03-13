"use client";

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePOS } from './POSContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SearchHeader() {
  const { searchQuery, setSearchQuery } = usePOS();

  return (
    <header className="flex items-center justify-between gap-10 py-8 mb-4">
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/60" />
        <Input
          placeholder="Cari produk, kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-16 h-16 bg-white border-none shadow-sm rounded-[1.5rem] text-lg font-medium placeholder:text-muted-foreground/40 focus-visible:ring-primary/20 focus-visible:shadow-xl transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="p-5 bg-white rounded-[1.25rem] shadow-sm text-muted-foreground hover:text-primary transition-all hover:shadow-md">
          <Bell className="h-7 w-7" />
        </button>
        
        <div className="flex items-center gap-4 bg-white p-2.5 pr-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all cursor-pointer">
          <Avatar className="h-12 w-12 border-[3px] border-primary/10 rounded-2xl">
            <AvatarImage src="https://picsum.photos/seed/alex/100/100" />
            <AvatarFallback className="rounded-2xl bg-primary text-white font-black">AC</AvatarFallback>
          </Avatar>
          <div className="text-left hidden lg:block">
            <p className="text-sm font-black leading-tight">Alex Kasir</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Manajer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
