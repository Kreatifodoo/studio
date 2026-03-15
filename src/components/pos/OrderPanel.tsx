
"use client";

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Wand2, CreditCard, ChevronDown, UserPlus, User, Search, Check, X, History, Calendar, Package } from 'lucide-react';
import { usePOS } from './POSContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getOrderItemCustomizationSuggestions } from '@/ai/flows/order-item-customization-suggestions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { PaymentDialog } from './PaymentDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface OrderPanelProps {
  isMobile?: boolean;
}

export function OrderPanel({ isMobile = false }: OrderPanelProps) {
  const { 
    cart, removeFromCart, updateQuantity, updateNote, clearCart, 
    addTransaction, fees, currentSession, customers, addCustomer,
    selectedCustomerId, setSelectedCustomerId, history: allHistory, currentUser
  } = usePOS();
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // History Preview State
  const [viewingHistoryCustomerId, setViewingHistoryCustomerId] = useState<string | null>(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerHistory = useMemo(() => {
    if (!viewingHistoryCustomerId) return [];
    return allHistory.filter(t => t.customerId === viewingHistoryCustomerId);
  }, [allHistory, viewingHistoryCustomerId]);

  const viewingHistoryCustomer = customers.find(c => c.id === viewingHistoryCustomerId);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalPromoSavings = cart.reduce((acc, item) => acc + (item.promoSavings * item.quantity), 0);

  const enabledFees = fees.filter(f => f.enabled);
  
  let runningTotal = subtotal;
  
  const discounts = enabledFees.filter(f => f.type === 'Discount').map(fee => {
    const amount = (subtotal * fee.value) / 100;
    return { ...fee, amount: -amount };
  });
  const totalDiscounts = discounts.reduce((acc, f) => acc + f.amount, 0);
  runningTotal += totalDiscounts;

  const serviceCharges = enabledFees.filter(f => f.type === 'Service').map(fee => {
    const amount = (runningTotal * fee.value) / 100;
    return { ...fee, amount };
  });
  const totalService = serviceCharges.reduce((acc, f) => acc + f.amount, 0);
  runningTotal += totalService;

  const taxes = enabledFees.filter(f => f.type === 'Tax').map(fee => {
    const amount = (runningTotal * fee.value) / 100;
    return { ...fee, amount };
  });
  const totalTax = taxes.reduce((acc, f) => acc + f.amount, 0);
  
  const total = runningTotal + totalTax;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleAISuggestions = async (itemName: string) => {
    setSuggestions([]);
    try {
      const result = await getOrderItemCustomizationSuggestions({ itemName });
      setSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={cn(
      "bg-white flex flex-col h-full",
      isMobile ? "w-full" : "w-[320px] md:w-[400px] fixed right-0 top-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] z-40"
    )}>
      <div className="p-5 md:p-10 pb-3 md:pb-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary/10 p-2 md:p-2.5 rounded-xl text-primary">
              <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h2 className="text-lg md:text-2xl font-black">Pesanan Aktif</h2>
          </div>
          <button
            onClick={clearCart}
            className="bg-muted p-2 rounded-lg md:rounded-xl text-muted-foreground hover:text-destructive active:scale-90 transition-all"
          >
            <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <div className="bg-muted/30 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] border border-transparent hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-white p-1 rounded-md text-primary"><User className="h-3 w-3 md:h-3.5 md:w-3.5" /></div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pelanggan</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedCustomer && (
                <button 
                  onClick={() => setViewingHistoryCustomerId(selectedCustomer.id)}
                  className="p-1 md:p-1.5 bg-muted rounded-md md:rounded-lg text-muted-foreground hover:text-primary transition-all"
                >
                  <History className="h-3 w-3 md:h-3.5 md:w-3.5" />
                </button>
              )}
              <button 
                onClick={() => setIsNewCustomerOpen(true)}
                className="p-1 md:p-1.5 bg-primary/10 rounded-md md:rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
              >
                <UserPlus className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </button>
            </div>
          </div>
          
          <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={isCustomerPopoverOpen}
                className="w-full justify-between border-none bg-transparent shadow-none h-auto p-0 text-xs md:text-sm font-bold hover:bg-transparent focus:ring-0 group"
              >
                <span className="truncate">
                  {selectedCustomer ? selectedCustomer.name : "Pelanggan Umum (Walk-in)"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-2xl border-none shadow-2xl overflow-hidden bg-white" align="start">
              <div className="p-3 border-b bg-muted/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    placeholder="Cari pelanggan..." 
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="h-10 pl-9 rounded-xl border-none bg-muted/20 focus-visible:ring-primary/20 text-xs font-bold"
                  />
                  {customerSearch && (
                    <button 
                      onClick={() => setCustomerSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <ScrollArea className="h-[250px]">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCustomerId(null);
                      setIsCustomerPopoverOpen(false);
                      setCustomerSearch('');
                    }}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-xs font-bold transition-all",
                      !selectedCustomerId ? "bg-primary text-white" : "hover:bg-muted/50"
                    )}
                  >
                    Pelanggan Umum (Walk-in)
                    {!selectedCustomerId && <Check className="h-3 w-3" />}
                  </button>
                  
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-2 rounded-xl text-left transition-all group",
                        selectedCustomerId === customer.id ? "bg-primary text-white" : "hover:bg-muted/50"
                      )}
                    >
                      <div 
                        className="flex flex-col flex-1 cursor-pointer"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setIsCustomerPopoverOpen(false);
                          setCustomerSearch('');
                        }}
                      >
                        <span className="text-xs font-bold leading-tight">{customer.name}</span>
                        <span className={cn(
                          "text-[9px] font-medium opacity-60",
                          selectedCustomerId === customer.id ? "text-white" : "text-muted-foreground"
                        )}>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingHistoryCustomerId(customer.id);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            selectedCustomerId === customer.id ? "hover:bg-white/20 text-white" : "hover:bg-primary/10 text-primary"
                          )}
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                        {selectedCustomerId === customer.id && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <div className="py-10 text-center opacity-30">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-[10px] font-bold">Tidak ditemukan</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-2 border-t bg-muted/5">
                <Button 
                  onClick={() => {
                    setIsCustomerPopoverOpen(false);
                    setIsNewCustomerOpen(true);
                  }}
                  variant="ghost" 
                  className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Tambah Pelanggan
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ScrollArea className="flex-1 px-5 md:px-10 py-1 md:py-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 md:gap-6 mt-8 md:mt-24 opacity-20">
            <div className="bg-muted p-6 md:p-10 rounded-full">
               <ShoppingBag className="h-10 w-10 md:h-16 md:w-16" />
            </div>
            <p className="text-base md:text-xl font-black text-muted-foreground">Keranjang kosong</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 md:gap-6 pb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 md:gap-3 group bg-muted/20 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] border border-transparent hover:border-primary/10 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-1.5">
                    <h4 className="font-black text-xs md:text-base mb-0.5 md:mb-1 leading-tight">{item.name}</h4>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <p className="text-primary font-black text-[10px] md:text-sm">{formatCurrency(item.price)}</p>
                        {item.promoSavings > 0 && (
                          <span className="text-[8px] md:text-[10px] line-through text-muted-foreground">{formatCurrency(item.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-lg md:rounded-xl p-0.5 md:p-1 shadow-sm border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 md:p-1.5 hover:bg-muted rounded-md md:rounded-lg active:scale-75 transition-all"><Minus className="h-3 w-3 md:h-3.5 md:w-3.5" /></button>
                    <span className="w-6 md:w-8 text-center font-black text-xs md:text-base">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 md:p-1.5 hover:bg-muted rounded-md md:rounded-lg active:scale-75 transition-all"><Plus className="h-3 w-3 md:h-3.5 md:w-3.5" /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 md:h-8 text-[8px] md:text-[10px] uppercase tracking-widest font-black bg-primary/5 text-primary hover:bg-primary/10 rounded-md md:rounded-lg gap-1 md:gap-1.5 px-2 md:px-3"
                        onClick={() => handleAISuggestions(item.name)}
                      >
                        <Wand2 className="h-3 w-3 md:h-3.5 md:w-3.5" /> AI
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 rounded-xl shadow-2xl border-none" align="start">
                      <div className="flex flex-col gap-2">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Kustomisasi:</p>
                        {suggestions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {suggestions.map((s, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-white border-muted rounded-md py-0.5 px-1.5 text-[8px] font-bold"
                                onClick={() => updateNote(item.id, item.note ? `${item.note}, ${s}` : s)}
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="animate-pulse space-y-1.5">
                             <div className="h-3 bg-muted rounded w-3/4"></div>
                             <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {item.note && (
                    <span className="text-[9px] text-muted-foreground font-medium italic truncate flex-1 px-1.5 border-l border-muted">
                      {item.note}
                    </span>
                  )}
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive/40 hover:text-destructive p-1 ml-auto">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-5 md:p-10 bg-white border-t rounded-t-[1.5rem] md:rounded-t-[3rem] shadow-inner">
        <div className="flex flex-col gap-1.5 md:gap-2 mb-4 md:mb-6">
          <div className="flex justify-between items-center text-[10px] md:text-xs font-bold">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {totalPromoSavings > 0 && (
            <div className="flex justify-between items-center text-[10px] md:text-xs font-black text-accent">
              <span>Hemat Promo</span>
              <span>-{formatCurrency(totalPromoSavings)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4 md:mb-6">
          <span className="text-sm md:text-base font-black">Total Akhir</span>
          <span className="text-xl md:text-2xl font-black text-primary tracking-tight">{formatCurrency(total)}</span>
        </div>

        <Button
          onClick={() => setIsPaymentOpen(true)}
          disabled={cart.length === 0 || !currentSession}
          className="h-12 md:h-16 w-full rounded-xl md:rounded-2xl text-base md:text-lg font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all flex gap-2 md:gap-3"
        >
          <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
          Bayar Sekarang
        </Button>
      </div>

      {/* New Customer Dialog */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-black text-center">Pelanggan Baru</DialogTitle>
            <DialogDescription className="text-center">Tambahkan data pelanggan baru ke sistem.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 md:space-y-4 py-1.5 md:py-2">
            <div className="space-y-1.5">
              <Label className="font-bold text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nama Lengkap</Label>
              <Input value={newCustName} onChange={(e) => setNewCustName(e.target.value)} placeholder="Contoh: Kiki Rizki" className="h-12 md:h-14 rounded-xl border-2 font-bold focus-visible:ring-primary/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nomor Telepon</Label>
              <Input value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} placeholder="08..." className="h-12 md:h-14 rounded-xl border-2 font-bold focus-visible:ring-primary/20" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (newCustName && newCustPhone) {
                const id = addCustomer({ name: newCustName, phone: newCustPhone });
                setSelectedCustomerId(id);
                setIsNewCustomerOpen(false);
                setNewCustName(''); setNewCustPhone('');
              }
            }} className="w-full h-14 md:h-16 rounded-xl bg-primary hover:bg-primary/90 font-black text-sm md:text-base shadow-xl shadow-primary/20">Simpan & Pilih</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer History Dialog */}
      <Dialog open={!!viewingHistoryCustomerId} onOpenChange={(open) => !open && setViewingHistoryCustomerId(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl rounded-[2.5rem] p-0 border-none shadow-2xl flex flex-col h-[85vh] md:h-[70vh] overflow-hidden">
          <div className="p-6 md:p-10 pb-4 bg-primary/5">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
                  {viewingHistoryCustomer?.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-xl md:text-2xl font-black">{viewingHistoryCustomer?.name}</DialogTitle>
                  <DialogDescription className="font-bold text-primary">{viewingHistoryCustomer?.phone}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col p-6 md:p-10 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <History className="h-4 w-4" /> Riwayat Transaksi
              </h3>
              <Badge className="bg-primary/10 text-primary font-black border-none px-3 py-1 rounded-lg text-[10px]">
                {customerHistory.length} TRANSAKSI
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-4 pb-4">
                {customerHistory.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <History className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-bold">Belum ada riwayat transaksi</p>
                  </div>
                ) : (
                  customerHistory.map((trx) => (
                    <div key={trx.id} className="p-5 rounded-3xl border-2 border-primary/5 bg-white hover:border-primary/20 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID Order</p>
                          <p className="font-black text-sm text-primary">#{trx.id}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tanggal</p>
                          <p className="text-xs font-bold flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(trx.date), 'PPP p', { locale: id })}
                          </p>
                        </div>
                      </div>

                      <Separator className="bg-primary/5 mb-4" />

                      <div className="space-y-3 mb-4">
                        {trx.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs font-medium">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="h-5 w-5 rounded-md p-0 flex items-center justify-center border-primary/20 text-primary font-black text-[9px]">
                                {item.quantity}
                              </Badge>
                              <span className="font-bold">{item.name}</span>
                            </div>
                            <span className="font-black text-primary/70">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t-2 border-primary/5 border-dashed">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                            {trx.paymentMethod || 'TUNAI'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Total Bayar</p>
                          <p className="text-lg font-black text-primary">{formatCurrency(trx.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          
          <div className="p-6 border-t bg-muted/5">
            <Button 
              onClick={() => setViewingHistoryCustomerId(null)} 
              variant="outline" 
              className="w-full h-12 rounded-xl font-bold"
            >
              Tutup Riwayat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={total}
        onSuccess={(methodName, reference) => {
          addTransaction({
            id: Math.random().toString(36).substr(2, 8).toUpperCase(),
            date: new Date().toISOString(),
            items: [...cart],
            subtotal,
            tax: total - subtotal,
            total,
            totalSavings: totalPromoSavings,
            status: 'Completed',
            paymentMethod: methodName,
            paymentReference: reference,
            customerId: selectedCustomerId || undefined,
            staffName: currentUser?.name
          });
          clearCart();
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}
