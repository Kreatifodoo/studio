
"use client";

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePOS } from './POSContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SearchHeader() {
  const { searchQuery, setSearchQuery, currentUser, roles } = usePOS();
  
  const currentRole = roles.find(r => r.id === currentUser?.roleId);

  return (
    <header className="flex items-center justify-between gap-4 md:gap-10 py-4 md:py-8 mb-2">
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground/60" />
        <Input
          placeholder="Cari..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 md:pl-16 h-12 md:h-16 bg-white border-none shadow-sm rounded-2xl md:rounded-[1.5rem] text-sm md:text-lg font-medium placeholder:text-muted-foreground/40 focus-visible:ring-primary/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="p-3 md:p-5 bg-white rounded-xl md:rounded-[1.25rem] shadow-sm text-muted-foreground hover:text-primary active:scale-90 transition-all">
          <Bell className="h-5 w-5 md:h-7 md:w-7" />
        </button>
        
        <div className="flex items-center gap-3 bg-white p-2 pr-4 md:pr-6 rounded-xl md:rounded-[1.5rem] shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95">
          <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 md:border-[3px] border-primary/10 rounded-xl md:rounded-2xl">
            <AvatarImage src={currentUser?.avatarUrl} />
            <AvatarFallback className="rounded-xl md:rounded-2xl bg-primary text-white font-black text-xs md:text-sm">
              {currentUser?.name?.substring(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden lg:block">
            <p className="text-xs md:text-sm font-black leading-tight">{currentUser?.name || 'User'}</p>
            <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{currentRole?.name || 'Staff'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
