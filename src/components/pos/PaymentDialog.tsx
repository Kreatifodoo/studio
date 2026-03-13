"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, CreditCard, Banknote, Smartphone, Wallet, ArrowRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOS } from './POSContext';
import { cn } from '@/lib/utils';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onSuccess: (methodName: string) => void;
}

export function PaymentDialog({ open, onOpenChange, total, onSuccess }: PaymentDialogProps) {
  const { paymentMethods } = usePOS();
  const [stage, setStage] = useState<'method' | 'cash-input' | 'success'>('method');
  const [transactionId, setTransactionId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [change, setChange] = useState<number>(0);

  const enabledMethods = paymentMethods.filter(pm => pm.enabled);

  const reset = useCallback(() => {
    setStage('method');
    setTransactionId('');
    setSelectedMethod('');
    setCashReceived('');
    setChange(0);
  }, []);

  // Reset state whenever the dialog is opened
  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handleStartPayment = (methodName: string) => {
    setSelectedMethod(methodName);
    setTransactionId(Math.random().toString(36).toUpperCase().slice(2, 10));
    
    // Jika metode adalah Cash (berdasarkan nama atau icon Banknote)
    const isCash = methodName.toLowerCase().includes('cash') || 
                   paymentMethods.find(p => p.name === methodName)?.icon === 'Banknote';

    if (isCash) {
      setStage('cash-input');
    } else {
      setStage('success');
    }
  };

  const handleConfirmCash = () => {
    setStage('success');
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
      <DialogContent className="max-w-md p-8 rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
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
              "p-6 rounded-[2rem] border-2 border-dashed flex justify-between items-center transition-all",
              isCashValid ? "bg-accent/5 border-accent/20" : "bg-muted/10 border-muted"
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
              Complete Payment
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {stage === 'success' && (
          <div className="py-12 flex flex-col items-center text-center gap-6">
            <div className="bg-accent/10 p-6 rounded-full">
              <CheckCircle2 className="h-20 w-20 text-accent animate-in zoom-in duration-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-4xl font-black mb-2 text-primary">Success!</DialogTitle>
              <DialogDescription className="text-lg font-medium">
                The transaction via {selectedMethod} was completed successfully.
                {parseFloat(cashReceived) > 0 && (
                  <div className="mt-2 text-sm text-accent font-bold">
                    Change: ${change.toFixed(2)}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/30 w-full p-4 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Transaction ID</p>
               <p className="text-sm font-bold font-mono">{transactionId}</p>
            </div>
            <Button onClick={() => onSuccess(selectedMethod)} className="w-full h-16 rounded-[1.5rem] text-lg font-black mt-4 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">Print Receipt & Continue</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
