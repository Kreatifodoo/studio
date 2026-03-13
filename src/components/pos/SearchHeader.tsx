
"use client";

import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePOS } from './POSContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SearchHeader() {
  const { searchQuery, setSearchQuery } = usePOS();

  return (
    <header className="flex items-center justify-between gap-8 py-6 mb-2">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-base focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-4 bg-white rounded-2xl shadow-sm text-muted-foreground hover:text-primary transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-2xl shadow-sm">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Alex Cashier</p>
            <p className="text-xs text-muted-foreground">Main Store</p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
