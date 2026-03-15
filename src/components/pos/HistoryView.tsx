
"use client";

import React, { useState, useEffect } from 'react';
import { usePOS } from './POSContext';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, ShoppingBag, Calendar, RotateCcw, User, CreditCard, ShieldCheck, XCircle, Tag, Ticket, Box, LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function HistoryView() {
  const { history, returnTransaction, customers, currentUser, priceLists, promoDiscounts } = usePOS();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleReturn = async (id: string) => {
    await returnTransaction(id, currentUser?.name);
    toast({
      title: "Berhasil Retur",
      description: `Transaksi #${id} telah diretur dan stok diperbarui.`,
    });
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Riwayat Transaksi</h2>
          <p className="text-muted-foreground mt-1">Tinjau kembali atau retur pesanan yang telah diselesaikan</p>
        </div>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-250px)]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 opacity-20">
             <Calendar className="h-24 w-24 mb-4" />
             <p className="text-2xl font-bold">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {history.map((t) => {
              const customer = t.customerId ? customers.find(c => c.id === t.customerId) : null;
              const isReturned = t.status === 'Returned';
              
              return (
                <Card key={t.id} className={cn(
                  "p-6 border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all",
                  isReturned && "opacity-70 grayscale-[0.3] bg-muted/20"
                )}>
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex-1 flex gap-4">
                      <div className={cn(
                        "p-4 rounded-2xl h-fit",
                        isReturned ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-primary"
                      )}>
                        {isReturned ? <XCircle /> : <ShoppingBag />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-black">Order #{t.id}</h3>
                          {isReturned ? (
                            <Badge variant="destructive" className="bg-destructive/10 text-destructive border-none px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              <RotateCcw className="h-3 w-3 mr-1" /> DIKEMBALIKAN (RETUR)
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> SELESAI
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <p className="text-xs text-muted-foreground flex items-center gap-2 font-bold">
                            <Calendar className="h-3.5 w-3.5" />
                            {mounted ? format(new Date(t.date), 'PPP p', { locale: id }) : '...'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 font-bold">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Kasir: <span className="text-foreground uppercase">{t.staffName || 'Admin'}</span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 font-bold">
                            <User className="h-3.5 w-3.5" />
                            Pelanggan: <span className="text-foreground">{customer?.name || 'Umum (Walk-in)'}</span>
                          </p>
                        </div>

                        {isReturned && t.returnDate && (
                          <div className="mt-4 p-3 bg-destructive/5 rounded-xl inline-block border border-destructive/10">
                            <p className="text-[10px] text-destructive font-black uppercase tracking-wider flex items-center gap-2">
                              <RotateCcw className="h-3 w-3" />
                              Detail Retur
                            </p>
                            <p className="text-[11px] font-bold text-destructive/80 mt-1">
                              Diretur pada {format(new Date(t.returnDate), 'PPP p', { locale: id })} oleh <span className="uppercase">{t.returnedBy || 'Sistem'}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-8 lg:gap-12 border-t lg:border-t-0 pt-4 lg:pt-0">
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mb-1">Metode</p>
                        <p className="text-sm font-black flex items-center justify-end gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          {t.paymentMethod || 'Tunai'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mb-1">Total</p>
                        <p className={cn("text-2xl font-black", isReturned ? "text-muted-foreground line-through" : "text-primary")}>
                          {formatCurrency(t.total)}
                        </p>
                      </div>
                      
                      {!isReturned && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-xl">
                              <RotateCcw className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2.5rem] border-none p-8">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-black">Konfirmasi Retur</AlertDialogTitle>
                              <AlertDialogDescription className="font-medium text-muted-foreground mt-2">
                                Apakah Anda yakin ingin melakukan retur untuk transaksi <b>#{t.id}</b>? Stok barang akan dikembalikan dan pendapatan akan dikurangi. Tindakan ini akan dicatat atas nama <b>{currentUser?.name}</b>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-3">
                              <AlertDialogCancel className="h-12 rounded-xl font-bold border-2">Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleReturn(t.id)} className="h-12 rounded-xl bg-destructive font-black">Ya, Proses Retur</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-solid border-muted/20 flex flex-wrap gap-2">
                     {t.items.map((item, idx) => {
                        const pl = priceLists.find(p => p.id === item.priceListId);
                        const pr = promoDiscounts.find(p => p.id === item.promoId);
                        return (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-xl border border-transparent hover:border-primary/10 transition-all">
                              <span className="font-black text-[10px] text-primary">{item.quantity}x</span>
                              <span className="font-bold text-[10px] text-muted-foreground">{item.name}</span>
                              <div className="flex items-center gap-1 ml-1">
                                {item.isPackage && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger><Box className="h-3 w-3 text-accent" /></TooltipTrigger>
                                      <TooltipContent className="text-[8px] font-black uppercase">Paket Bundling</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {item.isCombo && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger><LayoutGrid className="h-3 w-3 text-primary" /></TooltipTrigger>
                                      <TooltipContent className="text-[8px] font-black uppercase">Pilihan Combo</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {pl && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger><Tag className="h-3 w-3 text-green-500" /></TooltipTrigger>
                                      <TooltipContent className="text-[8px] font-black uppercase">Pricelist: {pl.name}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {pr && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger><Ticket className="h-3 w-3 text-rose-500" /></TooltipTrigger>
                                      <TooltipContent className="text-[8px] font-black uppercase">Promo: {pr.name}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                     })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
