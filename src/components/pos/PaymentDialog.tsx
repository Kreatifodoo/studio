"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onSuccess: () => void;
}

export function PaymentDialog({ open, onOpenChange, total, onSuccess }: PaymentDialogProps) {
  const [stage, setStage] = useState<'method' | 'processing' | 'success'>('method');
  const [progress, setProgress] = useState(0);
  const [transactionId, setTransactionId] = useState<string>('');

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

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (stage !== 'processing') onOpenChange(val);
        if (!val) setTimeout(reset, 500);
    }}>
      <DialogContent className="max-w-md p-8 rounded-3xl overflow-hidden">
        {stage === 'method' && (
          <>
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">Select Payment Method</DialogTitle>
              <DialogDescription>Total amount to pay: <span className="text-primary font-bold text-lg">${total.toFixed(2)}</span></DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={handleStartPayment} className="flex items-center gap-4 p-5 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left">
                <div className="bg-primary/10 p-3 rounded-xl text-primary"><CreditCard /></div>
                <div>
                  <p className="font-bold">Credit / Debit Card</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </button>
              <button onClick={handleStartPayment} className="flex items-center gap-4 p-5 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left">
                <div className="bg-accent/10 p-3 rounded-xl text-accent-foreground"><Smartphone /></div>
                <div>
                  <p className="font-bold">Digital Wallet</p>
                  <p className="text-xs text-muted-foreground">Apple Pay, Google Pay</p>
                </div>
              </button>
              <button onClick={handleStartPayment} className="flex items-center gap-4 p-5 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left">
                <div className="bg-muted p-3 rounded-xl text-muted-foreground"><Banknote /></div>
                <div>
                  <p className="font-bold">Cash</p>
                  <p className="text-xs text-muted-foreground">Payment at counter</p>
                </div>
              </button>
            </div>
          </>
        )}

        {stage === 'processing' && (
          <div className="py-12 flex flex-col items-center text-center gap-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Processing Payment</DialogTitle>
              <DialogDescription>Please wait while we confirm the transaction...</DialogDescription>
            </DialogHeader>
            <Progress value={progress} className="w-full h-3 rounded-full" />
          </div>
        )}

        {stage === 'success' && (
          <div className="py-12 flex flex-col items-center text-center gap-6">
            <CheckCircle2 className="h-20 w-20 text-accent animate-in zoom-in duration-500" />
            <DialogHeader>
              <DialogTitle className="text-3xl font-black mb-2">Payment Success!</DialogTitle>
              <DialogDescription>The transaction was completed successfully.</DialogDescription>
            </DialogHeader>
            <p className="text-xs mt-4 font-mono text-muted-foreground">TRANS_ID: {transactionId}</p>
            <Button onClick={onSuccess} className="w-full h-14 rounded-2xl text-lg font-bold mt-4">Print Receipt & Continue</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
