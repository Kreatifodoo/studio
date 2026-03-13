"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, PlayCircle } from 'lucide-react';
import { usePOS } from './POSContext';

export function OpenSessionView() {
  const { openSession } = usePOS();
  const [cash, setCash] = useState('');

  const handleOpen = () => {
    openSession(parseFloat(cash) || 0);
  };

  return (
    <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] p-4 overflow-hidden bg-white">
      <CardHeader className="text-center pb-8 pt-6">
        <div className="bg-primary/10 w-20 h-20 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-6">
          <Store className="h-10 w-10" />
        </div>
        <CardTitle className="text-3xl font-black mb-2">Buka Sesi Kasir Baru</CardTitle>
        <CardDescription className="text-base font-medium">Masukkan modal tunai awal di laci untuk mulai menerima pesanan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6">
        <div className="space-y-3">
          <Label htmlFor="cash" className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Modal Awal Tunai (Rp)</Label>
          <Input 
            id="cash"
            type="number"
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            className="h-16 rounded-2xl border-2 focus-visible:ring-primary/20 text-2xl font-black pl-6"
            placeholder="0"
          />
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-10 pt-4">
        <Button 
          onClick={handleOpen}
          className="w-full h-16 rounded-2xl text-xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 gap-3"
        >
          <PlayCircle className="h-6 w-6" />
          Mulai Sesi
        </Button>
      </CardFooter>
    </Card>
  );
}
