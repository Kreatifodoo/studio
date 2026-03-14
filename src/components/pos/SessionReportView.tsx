"use client";

import React, { useState } from 'react';
import { usePOS } from './POSContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { FileText, DollarSign, PieChart, ArrowDownRight, ArrowUpRight, History, CreditCard, Banknote, Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SessionSummaryReceipt } from './SessionSummaryReceipt';

export function SessionReportView() {
  const { lastClosedSession, sessions, history, customers } = usePOS();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const sessionToView = lastClosedSession || (sessions.length > 0 ? sessions[0] : null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleExportCSV = () => {
    if (!sessionToView) return;
    const sessionTransactions = history.filter(t => sessionToView.transactionIds.includes(t.id));
    const headers = ["ID", "Tanggal", "Jam", "Pelanggan", "Total", "Metode"];
    const rows = sessionTransactions.map(t => [
      t.id,
      format(new Date(t.date), 'yyyy-MM-dd'),
      format(new Date(t.date), 'HH:mm'),
      customers.find(c => c.id === t.customerId)?.name || "Umum",
      t.total.toFixed(0),
      t.paymentMethod || "N/A"
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Sesi_${sessionToView.id}.csv`;
    link.click();
  };

  if (!sessionToView) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center opacity-30 px-4">
        <FileText className="h-16 w-16 md:h-24 md:w-24 mb-6" />
        <h2 className="text-xl md:text-3xl font-black">Laporan Kosong</h2>
        <p className="text-sm md:text-xl">Tutup sesi kasir untuk melihat laporan.</p>
      </div>
    );
  }

  const sessionTransactions = history.filter(t => sessionToView.transactionIds.includes(t.id));
  const totalSales = sessionTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalTax = sessionTransactions.reduce((acc, t) => acc + t.tax, 0);
  const totalSubtotal = sessionTransactions.reduce((acc, t) => acc + t.subtotal, 0);
  
  const paymentsByMethod = sessionTransactions.reduce((acc: any, t) => {
    const method = t.paymentMethod || 'Lainnya';
    acc[method] = (acc[method] || 0) + t.total;
    return acc;
  }, {});

  const cashDifference = (sessionToView.closingCash || 0) - (sessionToView.openingCash + (paymentsByMethod['Tunai'] || 0));

  return (
    <div className="flex flex-col gap-4 md:gap-8 pb-24">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              <FileText className="text-primary h-6 w-6 md:h-8 md:w-8" /> Laporan
            </h2>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1">Sesi #{sessionToView.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button onClick={() => setIsPreviewOpen(true)} variant="outline" size="sm" className="flex-1 md:flex-none h-10 rounded-xl font-black gap-2">
              <Printer className="h-4 w-4" /> Cetak
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex-1 md:flex-none h-10 rounded-xl font-black gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatCard title="Total Jual" value={formatCurrency(totalSales)} icon={DollarSign} color="bg-primary" />
        <ReportStatCard title="Modal Awal" value={formatCurrency(sessionToView.openingCash)} icon={ArrowUpRight} color="bg-green-500" />
        <ReportStatCard title="Kas Akhir" value={formatCurrency(sessionToView.closingCash || 0)} icon={ArrowDownRight} color="bg-orange-500" />
        <ReportStatCard title="Selisih" value={formatCurrency(cashDifference)} icon={PieChart} color={cashDifference === 0 ? "bg-accent" : "bg-destructive"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <Card className="lg:col-span-2 rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg md:text-xl font-black">Ringkasan</CardTitle>
          </CardHeader>
          <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b"><span className="text-muted-foreground text-xs font-bold">Orders</span><span className="font-black">{sessionTransactions.length}</span></div>
             <div className="flex justify-between items-center py-2 border-b"><span className="text-muted-foreground text-xs font-bold">Subtotal</span><span className="font-black">{formatCurrency(totalSubtotal)}</span></div>
             <div className="flex justify-between items-center py-2 border-b"><span className="text-muted-foreground text-xs font-bold">Pajak</span><span className="font-black">{formatCurrency(totalTax)}</span></div>
             <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl mt-4"><span className="text-primary font-black text-sm">TOTAL</span><span className="text-primary font-black text-xl">{formatCurrency(totalSales)}</span></div>
          </div>
        </Card>

        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg md:text-xl font-black">Pembayaran</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {Object.entries(paymentsByMethod).map(([method, amount]: any) => (
              <div key={method} className="space-y-1">
                <div className="flex justify-between text-xs font-bold"><span>{method}</span><span>{formatCurrency(amount)}</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(amount / (totalSales || 1)) * 100}%` }}></div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white overflow-hidden">
        <CardTitle className="text-lg md:text-xl font-black mb-6">Detail Transaksi</CardTitle>
        <div className="overflow-x-auto -mx-4 px-4">
          <Table className="min-w-[500px]">
            <TableHeader className="bg-muted/50"><TableRow><TableHead className="font-black">Jam</TableHead><TableHead className="font-black">ID</TableHead><TableHead className="font-black">Metode</TableHead><TableHead className="text-right font-black">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {sessionTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{format(new Date(t.date), 'HH:mm')}</TableCell>
                  <TableCell className="font-mono text-[10px]">#{t.id}</TableCell>
                  <TableCell className="text-xs font-bold">{t.paymentMethod}</TableCell>
                  <TableCell className="text-right font-black text-xs">{formatCurrency(t.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-[400px] p-0 border-none bg-transparent">
          <DialogHeader className="sr-only">
            <DialogTitle>Pratinjau Struk Sesi</DialogTitle>
          </DialogHeader>
          <SessionSummaryReceipt session={sessionToView} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-sm p-4 bg-white overflow-hidden">
      <div className={`${color} w-8 h-8 rounded-lg text-white flex items-center justify-center mb-3`}><Icon className="h-4 w-4" /></div>
      <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">{title}</p>
      <p className="text-base font-black truncate">{value}</p>
    </Card>
  );
}
