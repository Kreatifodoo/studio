
"use client";

import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, Wand2, CreditCard, ChevronRight, UserPlus, User, Phone, Package as PackageIcon, LayoutGrid } from 'lucide-react';
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

export function OrderPanel() {
  const { 
    cart, removeFromCart, updateQuantity, updateNote, clearCart, 
    addTransaction, fees, currentSession, customers, addCustomer,
    selectedCustomerId, setSelectedCustomerId, packages, products, combos
  } = usePOS();
  
  const [isAIActive, setIsAIActive] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  
  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

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

  const handleAddQuickCustomer = () => {
    if (!newCustName || !newCustPhone) return;
    const id = addCustomer({ name: newCustName, phone: newCustPhone });
    setSelectedCustomerId(id);
    setIsNewCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  return (
    <div className="w-[400px] h-screen fixed right-0 top-0 bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] z-40 flex flex-col">
      <div className="p-10 pb-6">
        <div className="flex items-center justify-between mb-8">
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

        {/* Customer Selector */}
        <div className="bg-muted/30 p-4 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl text-primary"><User className="h-4 w-4" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Customer</span>
            </div>
            <button 
              onClick={() => setIsNewCustomerOpen(true)}
              className="p-1.5 bg-primary/10 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
              title="Add New Customer"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          </div>
          <Select 
            value={selectedCustomerId || "none"} 
            onValueChange={(val) => setSelectedCustomerId(val === "none" ? null : val)}
          >
            <SelectTrigger className="border-none bg-transparent shadow-none h-auto p-0 text-sm font-bold focus:ring-0">
              <SelectValue placeholder="Walk-in Customer" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="none">Walk-in Customer</SelectItem>
              {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
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
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-black">${item.price.toFixed(2)}</p>
                      {item.priceListId && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">Special Price</Badge>
                      )}
                      {item.isPackage && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-none rounded-lg px-2 py-0 text-[8px] font-black uppercase">Package</Badge>
                      )}
                      {item.isCombo && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-2 py-0 text-[8px] font-black uppercase">Combo</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-sm border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-muted rounded-xl transition-colors"><Minus className="h-4 w-4" /></button>
                    <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-muted rounded-xl transition-colors"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* Package Components Display */}
                {item.isPackage && (
                  <div className="bg-white/40 p-3 rounded-2xl border border-primary/5 mt-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <PackageIcon className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Bundle Contents:</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {packages.find(p => p.id === item.productId)?.items.map((pkgItem, pIdx) => {
                        const productDetails = products.find(p => p.id === pkgItem.productId);
                        return (
                          <div key={pIdx} className="bg-white px-2 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-muted/20">
                            <span className="text-[9px] font-black text-primary">{pkgItem.quantity}x</span>
                            <span className="text-[9px] font-bold text-muted-foreground truncate max-w-[80px]">
                              {productDetails?.name || 'Item'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Combo Selections Display */}
                {item.isCombo && item.comboSelections && (
                  <div className="bg-white/40 p-3 rounded-2xl border border-primary/5 mt-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Combo Choices:</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.comboSelections.map((sel, sIdx) => {
                        const productDetails = products.find(p => p.id === sel.productId);
                        return (
                          <div key={sIdx} className="bg-white px-2 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-muted/20">
                            <span className="text-[9px] font-bold text-muted-foreground truncate max-w-[120px]">
                              {productDetails?.name || 'Choice'}
                            </span>
                            {sel.extraPrice > 0 && (
                              <span className="text-[8px] font-black text-primary">+$ {sel.extraPrice.toFixed(2)}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

      {/* Quick New Customer Dialog */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Quick Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <Input 
                value={newCustName} 
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="Ex: John Doe" 
                className="h-12 rounded-xl focus-visible:ring-primary/20 border-2" 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={newCustPhone} 
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0812..." 
                  className="h-12 rounded-xl pl-12 focus-visible:ring-primary/20 border-2" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleAddQuickCustomer}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-lg shadow-primary/20"
            >
              Add & Select Customer
            </Button>
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
            tax: totalTax,
            total,
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
