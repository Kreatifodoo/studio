
"use client";

import React from 'react';
import { POSProvider, usePOS } from '@/components/pos/POSContext';
import { Sidebar } from '@/components/pos/Sidebar';
import { SearchHeader } from '@/components/pos/SearchHeader';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderPanel } from '@/components/pos/OrderPanel';
import { HistoryView } from '@/components/pos/HistoryView';
import { DashboardView } from '@/components/pos/DashboardView';
import { SettingsView } from '@/components/pos/SettingsView';

function POSLayout() {
  const { view } = usePOS();

  const renderView = () => {
    switch (view) {
      case 'pos':
        return <ProductGrid />;
      case 'history':
        return <HistoryView />;
      case 'dashboard':
        return <DashboardView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ProductGrid />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-poppins overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 ml-24 md:ml-32 mr-[400px] p-8 min-h-screen overflow-y-auto bg-[#F9FBFF]">
        <SearchHeader />
        
        <div className="max-w-[1400px] mx-auto">
          {renderView()}
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
