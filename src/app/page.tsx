
"use client";

import React from 'react';
import { POSProvider, usePOS } from '@/components/pos/POSContext';
import { Sidebar } from '@/components/pos/Sidebar';
import { SearchHeader } from '@/components/pos/SearchHeader';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderPanel } from '@/components/pos/OrderPanel';
import { HistoryView } from '@/components/pos/HistoryView';

function POSLayout() {
  const { view } = usePOS();

  return (
    <div className="flex min-h-screen bg-background text-foreground font-poppins overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 ml-20 md:ml-24 mr-[400px] p-8 min-h-screen overflow-y-auto">
        <SearchHeader />
        
        <div className="max-w-[1400px] mx-auto">
          {view === 'pos' ? (
            <ProductGrid />
          ) : (
            <HistoryView />
          )}
        </div>
      </main>

      <OrderPanel />
    </div>
  );
}

export default function Home() {
  return (
    <POSProvider>
      <POSLayout />
    </POSProvider>
  );
}
