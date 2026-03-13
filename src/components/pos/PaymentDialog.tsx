
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePOS } from './POSContext';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onSuccess: () => void;
}

export function PaymentDialog({ open, onOpenChange, total, onSuccess }: PaymentDialogProps) {
  const { paymentMethods } = usePOS();
  const [stage, setStage] = useState<'method' | 'processing' | 'success'>('method');
  const [progress, setProgress] = useState(0);
  const [transactionId, setTransactionId] = useState<string>('');

  const enabledMethods = paymentMethods.filter(pm => pm.enabled);

  useEffect(() => {
    if (stage === 'processing') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTransactionId(Math.random().toString(36).toUpperCase().slice(2, 10));
            setTimeout(() => setStage('success'), 500);
            return 100;
          }
          return p + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleStartPayment = () => {
    setStage('processing');
    setProgress(0);
  };

  const reset = () => {
    setStage('method');
    setProgress(0);
    setTransactionId('');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard />;
      case 'Smartphone': return <Smartphone />;
      case 'Banknote': return <Banknote />;
      default: return <Wallet />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (stage !== 'processing') onOpenChange(val);
        if (!val) setTimeout(reset, 500);
    }}>
      <DialogContent className="max-w-md p-8 rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
        <DialogTitle className="sr-only">Payment Process</DialogTitle>
        
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
                    onClick={handleStartPayment} 
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

        {stage === 'processing' && (
          <div className="py-12 flex flex-col items-center text-center gap-6">
            <div className="relative">
               <Loader2 className="h-20 w-20 text-primary animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center font-black text-xs">{progress}%</div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black mb-2">Processing Payment</DialogTitle>
              <DialogDescription>Please wait while we confirm the transaction...</DialogDescription>
            </DialogHeader>
            <Progress value={progress} className="w-full h-3 rounded-full bg-muted" />
          </div>
        )}

        {stage === 'success' && (
          <div className="py-12 flex flex-col items-center text-center gap-6">
            <div className="bg-accent/10 p-6 rounded-full">
              <CheckCircle2 className="h-20 w-20 text-accent animate-in zoom-in duration-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-4xl font-black mb-2 text-primary">Success!</DialogTitle>
              <DialogDescription className="text-lg font-medium">The transaction was completed successfully.</DialogDescription>
            </DialogHeader>
            <div className="bg-muted/30 w-full p-4 rounded-2xl">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Transaction ID</p>
               <p className="text-sm font-bold font-mono">{transactionId}</p>
            </div>
            <Button onClick={onSuccess} className="w-full h-16 rounded-[1.5rem] text-lg font-black mt-4 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">Print Receipt & Continue</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
