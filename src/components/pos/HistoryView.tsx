
"use client";

import React from 'react';
import { usePOS } from './POSContext';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, ShoppingBag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function HistoryView() {
  const { history } = usePOS();

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Order History</h2>
          <p className="text-muted-foreground mt-1">Review your completed transactions</p>
        </div>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-250px)]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 opacity-20">
             <Calendar className="h-24 w-24 mb-4" />
             <p className="text-2xl font-bold">No orders found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {history.map((t) => (
              <Card key={t.id} className="p-6 border-none shadow-sm rounded-3xl bg-white group hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="bg-primary/5 p-4 rounded-2xl text-primary h-fit">
                      <ShoppingBag />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">Order #{t.id.toUpperCase()}</h3>
                        <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-none px-3 py-0.5 rounded-lg text-[10px] font-bold">
                           <CheckCircle2 className="h-3 w-3 mr-1" /> COMPLETED
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(t.date), 'PPP p')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-12 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Items</p>
                      <p className="text-lg font-bold">{t.items.reduce((a,b) => a + b.quantity, 0)} Items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total</p>
                      <p className="text-2xl font-black text-primary">${t.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-dashed flex flex-wrap gap-2">
                   {t.items.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="rounded-xl px-3 py-1 font-medium bg-background border-none text-muted-foreground">
                        {item.quantity}x {item.name}
                      </Badge>
                   ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
