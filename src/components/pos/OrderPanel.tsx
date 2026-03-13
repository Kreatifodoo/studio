
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Wand2, CreditCard, ChevronRight } from 'lucide-react';
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

export function OrderPanel() {
  const { cart, removeFromCart, updateQuantity, updateNote, clearCart, addTransaction, fees, currentSession } = usePOS();
  const [isAIActive, setIsAIActive] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
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
  
  const allCalculatedFees = [...discounts, ...serviceCharges, ...taxes];
  const total = runningTotal + totalTax;

  const handleAISuggestions = async (itemId: string, itemName: string) => {
    setIsAIActive(itemId);
    setSuggestions([]);
    try {
      const result = await getOrderItemCustomizationSuggestions({ itemName });
      setSuggestions(result.suggestions);
    } catch (e) {
      console.error(e);
    }
  };

  const finalizeOrder = () => {
    if (cart.length === 0 || !currentSession) return;
    setIsPaymentOpen(true);
  };

  return (
    <div className="w-[400px] h-screen fixed right-0 top-0 bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] z-40 flex flex-col">
      <div className="p-10 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black">Active Order</h2>
        </div>
        <button
          onClick={clearCart}
          className="bg-muted p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-10 py-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 mt-24 opacity-30">
            <div className="bg-muted p-14 rounded-full">
               <ShoppingBag className="h-24 w-24" />
            </div>
            <p className="text-2xl font-black text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 group bg-muted/20 p-5 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h4 className="font-black text-lg mb-1 leading-tight">{item.name}</h4>
                    <p className="text-primary font-black">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-sm border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-muted rounded-xl transition-colors"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-muted rounded-xl transition-colors"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 text-[11px] uppercase tracking-widest font-black bg-primary/5 text-primary hover:bg-primary/10 rounded-xl gap-2 px-4"
                        onClick={() => handleAISuggestions(item.id, item.name)}
                      >
                        <Wand2 className="h-4 w-4" />
                        AI Notes
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-5 rounded-[2rem] shadow-2xl border-none" align="start">
                      <div className="flex flex-col gap-4">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Quick Customizations:</p>
                        {suggestions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-white transition-all border-muted rounded-xl py-2 px-3 text-[10px] font-bold"
                                onClick={() => updateNote(item.id, item.note ? `${item.note}, ${s}` : s)}
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="animate-pulse space-y-3">
                             <div className="h-6 bg-muted rounded-xl w-3/4"></div>
                             <div className="h-6 bg-muted rounded-xl w-1/2"></div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {item.note && (
                    <span className="text-[11px] text-muted-foreground font-medium italic truncate flex-1 px-2 border-l border-muted ml-2">
                      {item.note}
                    </span>
                  )}
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive/40 hover:text-destructive transition-colors ml-auto p-2">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-10 bg-white border-t rounded-t-[3rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {allCalculatedFees.map(fee => (
            <div key={fee.id} className="flex justify-between items-center text-sm font-bold">
              <span className="text-muted-foreground">{fee.name} ({fee.value}%)</span>
              <span className={fee.type === 'Discount' ? 'text-accent' : ''}>
                {fee.amount < 0 ? '-' : ''}${Math.abs(fee.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="mb-8 opacity-50" />

        <div className="flex justify-between items-center mb-8">
          <span className="text-xl font-black">Total Amount</span>
          <span className="text-4xl font-black text-primary tracking-tight">${total.toFixed(2)}</span>
        </div>

        <Button
          onClick={finalizeOrder}
          disabled={cart.length === 0 || !currentSession}
          className="h-20 w-full rounded-3xl text-xl font-black shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] flex gap-4"
        >
          <CreditCard className="h-7 w-7" />
          {currentSession ? 'Complete Order' : 'Session Required'}
          <ChevronRight className="h-6 w-6 ml-auto opacity-50" />
        </Button>
      </div>

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
            tax: totalTax,
            total,
            status: 'Completed',
            paymentMethod: methodName,
            paymentReference: reference
          });
          clearCart();
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}
