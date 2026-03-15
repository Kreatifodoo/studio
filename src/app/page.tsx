
"use client";

import React, { useState, useEffect } from 'react';
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
import { LoginView } from '@/components/pos/LoginView';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

function POSLayout() {
  const { view, currentSession, currentUser, isDbLoaded, cart } = usePOS();
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isDbLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FBFF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Memuat Database...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  const isPOSView = view === 'pos';

  if (!currentSession && isPOSView) {
    return (
      <div className="flex min-h-screen bg-[#F9FBFF] font-poppins">
        <Sidebar />
        <main className="flex-1 ml-16 md:ml-24 p-4 md:p-8 flex items-center justify-center">
          <OpenSessionView />
        </main>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'pos': return <ProductGrid />;
      case 'history': return <HistoryView />;
      case 'dashboard': return <DashboardView />;
      case 'settings': return <SettingsView />;
      case 'reports': return <SessionReportView />;
      default: return <ProductGrid />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-poppins overflow-hidden selection:bg-primary/10">
      <Sidebar />
      
      <main className={cn(
        "flex-1 ml-16 md:ml-24 p-3 md:p-8 min-h-screen overflow-y-auto bg-[#F9FBFF] transition-all duration-300 ease-in-out",
        isPOSView && !isMobile ? "mr-[320px] md:mr-[400px]" : "mr-0"
      )}>
        <SearchHeader />
        
        <div className="max-w-[1400px] mx-auto pb-24 md:pb-8">
          {renderView()}
        </div>
      </main>

      {/* Desktop Order Panel */}
      {isPOSView && !isMobile && <OrderPanel />}

      {/* Mobile Floating Cart Button & Drawer */}
      {isPOSView && isMobile && cart.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              className="fixed bottom-4 right-4 h-14 w-14 md:h-16 md:w-16 rounded-2xl shadow-2xl bg-primary hover:bg-primary/90 z-50 flex items-center justify-center group active:scale-90 transition-all"
            >
              <ShoppingBag className="h-6 w-6 md:h-7 md:w-7 text-white" />
              <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] md:text-[10px] font-black h-6 w-6 md:h-7 md:w-7 rounded-full flex items-center justify-center border-4 border-[#F9FBFF]">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0 border-none rounded-t-[2.5rem] md:rounded-t-[3rem] overflow-hidden bg-white shadow-2xl">
            <SheetHeader className="sr-only">
              <SheetTitle>Detail Pesanan</SheetTitle>
            </SheetHeader>
            <OrderPanel isMobile={true} />
          </SheetContent>
        </Sheet>
      )}
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
