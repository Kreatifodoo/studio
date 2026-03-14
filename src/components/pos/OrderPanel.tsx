
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Wand2, CreditCard, ChevronRight, UserPlus, User, Phone, Package as PackageIcon, LayoutGrid, Tag } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OrderPanelProps {
  isMobile?: boolean;
}

export function OrderPanel({ isMobile = false }: OrderPanelProps) {
  const { 
    cart, removeFromCart, updateQuantity, updateNote, clearCart, 
    addTransaction, fees, currentSession, customers, addCustomer,
    selectedCustomerId, setSelectedCustomerId, packages, products, combos
  } = usePOS();
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

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
      isMobile ? "w-full" : "w-[400px] fixed right-0 top-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] z-40"
    )}>
      <div className="p-6 md:p-10 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-black">Pesanan Aktif</h2>
          </div>
          <button
            onClick={clearCart}
            className="bg-muted p-2 rounded-xl text-muted-foreground hover:text-destructive active:scale-90 transition-all"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-muted/30 p-4 rounded-[1.5rem] border border-transparent hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg text-primary"><User className="h-3.5 w-3.5" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pelanggan</span>
            </div>
            <button 
              onClick={() => setIsNewCustomerOpen(true)}
              className="p-1.5 bg-primary/10 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Select 
            value={selectedCustomerId || "none"} 
            onValueChange={(val) => setSelectedCustomerId(val === "none" ? null : val)}
          >
            <SelectTrigger className="border-none bg-transparent shadow-none h-auto p-0 text-sm font-bold focus:ring-0">
              <SelectValue placeholder="Pelanggan Umum (Walk-in)" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="none">Pelanggan Umum (Walk-in)</SelectItem>
              {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 md:px-10 py-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 mt-12 md:mt-24 opacity-20">
            <div className="bg-muted p-10 rounded-full">
               <ShoppingBag className="h-16 w-16" />
            </div>
            <p className="text-xl font-black text-muted-foreground">Keranjang kosong</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-6 pb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 group bg-muted/20 p-4 rounded-[1.5rem] border border-transparent hover:border-primary/10 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h4 className="font-black text-base mb-1 leading-tight">{item.name}</h4>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-primary font-black text-sm">{formatCurrency(item.price)}</p>
                        {item.promoSavings > 0 && (
                          <span className="text-[10px] line-through text-muted-foreground">{formatCurrency(item.originalPrice)}</span>
                        )}
                      </div>
                      {item.promoSavings > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5 text-accent" />
                          <p className="text-[9px] font-black text-accent uppercase tracking-tight">Promo Aktif</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-muted rounded-lg active:scale-75 transition-all"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center font-black text-base">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-muted rounded-lg active:scale-75 transition-all"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[10px] uppercase tracking-widest font-black bg-primary/5 text-primary hover:bg-primary/10 rounded-lg gap-1.5 px-3"
                        onClick={() => handleAISuggestions(item.name)}
                      >
                        <Wand2 className="h-3.5 w-3.5" /> Catatan AI
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 rounded-2xl shadow-2xl border-none" align="start">
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Kustomisasi Cepat:</p>
                        {suggestions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {suggestions.map((s, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-white border-muted rounded-lg py-1 px-2 text-[9px] font-bold"
                                onClick={() => updateNote(item.id, item.note ? `${item.note}, ${s}` : s)}
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="animate-pulse space-y-2">
                             <div className="h-4 bg-muted rounded-lg w-3/4"></div>
                             <div className="h-4 bg-muted rounded-lg w-1/2"></div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {item.note && (
                    <span className="text-[10px] text-muted-foreground font-medium italic truncate flex-1 px-2 border-l border-muted">
                      {item.note}
                    </span>
                  )}
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive/40 hover:text-destructive p-1.5 ml-auto">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-6 md:p-10 bg-white border-t rounded-t-[2.5rem] md:rounded-t-[3rem] shadow-inner">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {totalPromoSavings > 0 && (
            <div className="flex justify-between items-center text-xs font-black text-accent">
              <span>Hemat Promo</span>
              <span>-{formatCurrency(totalPromoSavings)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-base font-black">Total Akhir</span>
          <span className="text-2xl font-black text-primary tracking-tight">{formatCurrency(total)}</span>
        </div>

        <Button
          onClick={() => setIsPaymentOpen(true)}
          disabled={cart.length === 0 || !currentSession}
          className="h-16 w-full rounded-2xl text-lg font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all flex gap-3"
        >
          <CreditCard className="h-6 w-6" />
          {currentSession ? 'Bayar Sekarang' : 'Sesi Tertutup'}
        </Button>
      </div>

      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-[2rem] p-6 border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Pelanggan Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Nama</Label>
              <Input value={newCustName} onChange={(e) => setNewCustName(e.target.value)} placeholder="Nama lengkap" className="h-12 rounded-xl border-2" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Telepon</Label>
              <Input value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} placeholder="08..." className="h-12 rounded-xl border-2" />
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
            }} className="w-full h-12 rounded-xl bg-primary font-black">Simpan & Pilih</Button>
          </DialogFooter>
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
            customerId: selectedCustomerId || undefined
          });
          clearCart();
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}
