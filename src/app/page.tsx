
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
import { OpenSessionView } from '@/components/pos/OpenSessionView';
import { SessionReportView } from '@/components/pos/SessionReportView';
import { cn } from '@/lib/utils';

function POSLayout() {
  const { view, currentSession } = usePOS();

  if (!currentSession && view === 'pos') {
    return (
      <div className="flex min-h-screen bg-[#F9FBFF] font-poppins">
        <Sidebar />
        <main className="flex-1 ml-24 md:ml-32 p-8 flex items-center justify-center">
          <OpenSessionView />
        </main>
      </div>
    );
  }

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
      case 'reports':
        return <SessionReportView />;
      default:
        return <ProductGrid />;
    }
  };

  const isPOSView = view === 'pos';

  return (
    <div className="flex min-h-screen bg-background text-foreground font-poppins overflow-hidden">
      <Sidebar />
      
      <main className={cn(
        "flex-1 ml-24 md:ml-32 p-8 min-h-screen overflow-y-auto bg-[#F9FBFF] transition-all duration-300 ease-in-out",
        isPOSView ? "mr-[400px]" : "mr-0"
      )}>
        <SearchHeader />
        
        <div className="max-w-[1400px] mx-auto">
          {renderView()}
        </div>
      </main>

      {isPOSView && <OrderPanel />}
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
