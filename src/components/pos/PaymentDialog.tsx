
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, CreditCard, Banknote, Smartphone, Wallet, ArrowRight, Coins, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';
import { ReceiptView } from './ReceiptView';
import { Transaction } from '@/types/pos';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onSuccess: (methodName: string, reference?: string) => void;
}

export function PaymentDialog({ open, onOpenChange, total, onSuccess }: PaymentDialogProps) {
  const { paymentMethods, cart } = usePOS();
  const [stage, setStage] = useState<'method' | 'cash-input' | 'ref-input' | 'success'>('method');
  const [transactionId, setTransactionId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [change, setChange] = useState<number>(0);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const enabledMethods = paymentMethods.filter(pm => pm.enabled);

  const reset = useCallback(() => {
    setStage('method');
    setTransactionId('');
    setSelectedMethod('');
    setCashReceived('');
    setPaymentReference('');
    setChange(0);
    setCurrentTransaction(null);
  }, []);

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handleStartPayment = (methodName: string) => {
    const newId = Math.random().toString(36).toUpperCase().slice(2, 10);
    setSelectedMethod(methodName);
    setTransactionId(newId);
    
    const method = paymentMethods.find(p => p.name === methodName);
    const isCash = methodName.toLowerCase().includes('cash') || method?.icon === 'Banknote';
    const isCardOrDigital = method?.icon === 'CreditCard' || method?.icon === 'Smartphone';

    if (isCash) {
      setStage('cash-input');
    } else if (isCardOrDigital) {
      setStage('ref-input');
    } else {
      finalizeStage(methodName, '');
    }
  };

  const finalizeStage = (methodName: string, ref: string) => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = total - subtotal; 
    
    const mockTransaction: Transaction = {
      id: transactionId,
      date: new Date().toISOString(),
      items: [...cart],
      subtotal,
      tax,
      total,
      status: 'Completed',
      paymentMethod: methodName,
      paymentReference: ref
    };

    setCurrentTransaction(mockTransaction);
    setStage('success');

    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleConfirmCash = () => {
    finalizeStage(selectedMethod, '');
  };

  const handleConfirmReference = () => {
    finalizeStage(selectedMethod, paymentReference);
  };

  const onCashInputChange = (val: string) => {
    setCashReceived(val);
    const received = parseFloat(val) || 0;
    setChange(Math.max(0, received - total));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard />;
      case 'Smartphone': return <Smartphone />;
      case 'Banknote': return <Banknote />;
      default: return <Wallet />;
    }
  };

  const isCashValid = (parseFloat(cashReceived) || 0) >= total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-md p-8 rounded-[2.5rem] overflow-hidden border-none shadow-2xl transition-all",
        stage === 'success' ? "max-w-2xl" : "max-w-md"
      )}>
        {stage === 'method' && (
          <>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black">Select Payment Method</DialogTitle>
              <DialogDescription>Total amount to pay: <span className="text-primary font-black text-xl ml-1">${total.toFixed(2)}</span></DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              {enabledMethods.length > 0 ? (
                enabledMethods.map((pm) => (
                  <button 
                    key={pm.id}
                    onClick={() => handleStartPayment(pm.name)} 
                    className="flex items-center gap-5 p-5 rounded-[2rem] border-2 border-transparent bg-muted/20 hover:border-primary hover:bg-white transition-all text-left shadow-sm group"
                  >
                    <div className="bg-white p-4 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                      {getIcon(pm.icon)}
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight">{pm.name}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{pm.description}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-10 font-bold">No payment methods configured.</p>
              )}
            </div>
          </>
        )}

        {stage === 'cash-input' && (
          <div className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Cash Payment</DialogTitle>
              <DialogDescription>Input nominal received from customer.</DialogDescription>
            </DialogHeader>

            <div className="bg-primary/5 p-6 rounded-[2rem] flex flex-col items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Amount to Pay</span>
              <span className="text-4xl font-black text-primary">${total.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Cash Received ($)</Label>
              <Input 
                type="number" 
                value={cashReceived}
                onChange={(e) => onCashInputChange(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="h-16 rounded-2xl text-2xl font-black text-center focus-visible:ring-primary/20 border-2"
              />
            </div>

            <div className={cn(
              "p-6 rounded-[2rem] border-2 flex justify-between items-center transition-all",
              isCashValid ? "bg-accent/5 border-accent/20" : "bg-muted/10 border-muted/20"
            )}>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Change</span>
                <span className={cn("text-2xl font-black", isCashValid ? "text-accent" : "text-muted-foreground")}>
                  ${change.toFixed(2)}
                </span>
              </div>
              <Coins className={cn("h-8 w-8", isCashValid ? "text-accent" : "text-muted-foreground")} />
            </div>

            <Button 
              disabled={!isCashValid}
              onClick={handleConfirmCash}
              className="h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3"
            >
              Confirm & Print Receipt
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {stage === 'ref-input' && (
          <div className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{selectedMethod}</DialogTitle>
              <DialogDescription>Input payment reference or note (e.g. Last 4 digits of card).</DialogDescription>
            </DialogHeader>

            <div className="bg-primary/5 p-6 rounded-[2rem] flex flex-col items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Amount to Pay</span>
              <span className="text-4xl font-black text-primary">${total.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest ml-1">Reference Note</Label>
              <Input 
                type="text" 
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Ex: Ref-1234 or Card 4421"
                autoFocus
                className="h-16 rounded-2xl text-xl font-bold text-center focus-visible:ring-primary/20 border-2"
              />
            </div>

            <Button 
              onClick={handleConfirmReference}
              className="h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3"
            >
              Confirm & Print Receipt
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {stage === 'success' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center text-center gap-6 py-6">
              <div className="bg-accent/10 p-6 rounded-full">
                <CheckCircle2 className="h-20 w-20 text-accent animate-in zoom-in duration-500" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-4xl font-black mb-2 text-primary">Done!</DialogTitle>
                <DialogDescription className="text-lg font-medium">
                  Transaction {transactionId} successful.
                  {parseFloat(cashReceived) > 0 && (
                    <span className="block mt-2 text-sm text-accent font-bold">
                      Change: ${change.toFixed(2)}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col gap-3 w-full">
                <Button 
                  variant="outline"
                  onClick={() => window.print()} 
                  className="h-14 rounded-2xl font-bold gap-2"
                >
                  <Printer className="h-5 w-5" /> Re-print Receipt
                </Button>
                <Button 
                  onClick={() => onSuccess(selectedMethod, paymentReference)} 
                  className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                >
                  Continue to Next Order
                </Button>
              </div>
            </div>

            <div className="bg-white border rounded-[2rem] p-2 shadow-inner overflow-hidden flex justify-center scale-90 origin-top">
              <ReceiptView transaction={currentTransaction} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
