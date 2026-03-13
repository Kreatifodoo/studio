"use client";

import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Wand2, CreditCard } from 'lucide-react';
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
  const { cart, removeFromCart, updateQuantity, updateNote, clearCart, addTransaction } = usePOS();
  const [isAIActive, setIsAIActive] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

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
    if (cart.length === 0) return;
    setIsPaymentOpen(true);
  };

  return (
    <div className="w-[400px] h-screen fixed right-0 top-0 bg-white shadow-2xl z-40 flex flex-col">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Active Order</h2>
        </div>
        <button
          onClick={clearCart}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-8 py-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6 mt-20">
            <div className="bg-muted p-10 rounded-full">
               <ShoppingBag className="h-24 w-24" />
            </div>
            <p className="text-xl font-bold text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                    <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-secondary/50 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[11px] uppercase tracking-wider font-bold bg-primary/5 text-primary hover:bg-primary/10 rounded-lg gap-1"
                        onClick={() => handleAISuggestions(item.id, item.name)}
                      >
                        <Wand2 className="h-3 w-3" />
                        AI Suggestions
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3 rounded-2xl" align="start">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Recommended for you:</p>
                        {suggestions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {suggestions.map((s, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors border-primary/20 rounded-lg py-1 px-2 text-[10px]"
                                onClick={() => updateNote(item.id, item.note ? `${item.note}, ${s}` : s)}
                              >
                                + {s}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="animate-pulse space-y-2">
                             <div className="h-4 bg-muted rounded w-3/4"></div>
                             <div className="h-4 bg-muted rounded w-1/2"></div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {item.note && (
                    <span className="text-[10px] text-muted-foreground italic truncate flex-1">
                      "{item.note}"
                    </span>
                  )}
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-8 bg-background/50 border-t flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Subtotal</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Tax (10%)</span>
            <span className="font-bold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Discount</span>
            <span className="font-bold text-accent">-$0.00</span>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between items-center py-2">
          <span className="text-xl font-bold">Total Amount</span>
          <span className="text-4xl font-black text-primary">${total.toFixed(2)}</span>
        </div>

        <Button
          onClick={finalizeOrder}
          disabled={cart.length === 0}
          className="h-16 w-full rounded-2xl text-xl font-bold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all active:scale-95 flex gap-3 mt-4"
        >
          <CreditCard className="h-7 w-7" />
          Complete Order
        </Button>
      </div>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={total}
        onSuccess={() => {
          addTransaction({
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            items: [...cart],
            subtotal,
            tax,
            total,
            status: 'Completed'
          });
          clearCart();
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}
