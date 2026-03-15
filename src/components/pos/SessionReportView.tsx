
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from './POSContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  FileText, 
  DollarSign, 
  PieChart, 
  ArrowDownRight, 
  ArrowUpRight, 
  Download, 
  Printer, 
  ChevronLeft,
  Calendar,
  Clock,
  User,
  History,
  ArrowRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SessionSummaryReceipt } from './SessionSummaryReceipt';
import { db } from '@/lib/db';
import { Transaction, Session } from '@/types/pos';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SessionReportView() {
  const { 
    sessions, customers, lastClosedSession, 
    priceLists, promoDiscounts, packages, combos 
  } = usePOS();
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sessionTransactions, setSessionTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (lastClosedSession && !selectedSessionId) {
      setSelectedSessionId(lastClosedSession.id);
    }
  }, [lastClosedSession, selectedSessionId]);

  const filteredSessions = useMemo(() => {
    if (!startDate || !endDate) return sessions;
    
    return sessions.filter(s => {
      const sDate = parseISO(s.startTime);
      return isWithinInterval(sDate, {
        start: startOfDay(parseISO(startDate)),
        end: endOfDay(parseISO(endDate))
      });
    });
  }, [sessions, startDate, endDate]);

  const selectedSession = useMemo(() => {
    return sessions.find(s => s.id === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    async function fetchSessionData() {
      if (!selectedSession) {
        setSessionTransactions([]);
        return;
      }
      setIsLoading(true);
      try {
        const trxs = await db.transactions
          .where('id')
          .anyOf(selectedSession.transactionIds)
          .toArray();
        setSessionTransactions(trxs);
      } catch (e) {
        console.error("Gagal memuat data transaksi sesi:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessionData();
  }, [selectedSession]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleExportAllSessions = async () => {
    if (filteredSessions.length === 0) return;
    
    const allTrxIds = filteredSessions.flatMap(s => s.transactionIds);
    const allTransactions = await db.transactions.where('id').anyOf(allTrxIds).toArray();
    
    const headers = [
      "ID Sesi", "Mulai Sesi", "Selesai Sesi", "Kasir Sesi", 
      "ID Order", "Waktu Order", "Kasir Order", "Pelanggan", 
      "Item", "Qty", "Harga Satuan", "Hemat/Diskon", "Total Item", 
      "Metode Pembayaran", "Pricelist", "Paket", "Promo", "Combo", "Status"
    ];

    const rows: string[][] = [];

    filteredSessions.forEach(session => {
      const sessionTrxs = allTransactions.filter(t => session.transactionIds.includes(t.id));
      
      sessionTrxs.forEach(trx => {
        const customer = customers.find(c => c.id === trx.customerId);
        
        trx.items.forEach(item => {
          const plName = priceLists.find(pl => pl.id === item.priceListId)?.name || "-";
          const promoName = promoDiscounts.find(pd => pd.id === item.promoId)?.name || "-";

          rows.push([
            session.id,
            format(new Date(session.startTime), 'yyyy-MM-dd HH:mm'),
            session.endTime ? format(new Date(session.endTime), 'yyyy-MM-dd HH:mm') : "-",
            session.openedBy || "N/A",
            trx.id,
            format(new Date(trx.date), 'yyyy-MM-dd HH:mm'),
            trx.staffName || "Admin",
            `"${customer?.name || 'Walk-in'}"`,
            `"${item.name}"`,
            item.quantity.toString(),
            item.price.toString(),
            (item.promoSavings * item.quantity).toString(),
            (item.price * item.quantity).toString(),
            trx.paymentMethod || "N/A",
            `"${plName}"`,
            item.isPackage ? "Ya" : "Tidak",
            `"${promoName}"`,
            item.isCombo ? "Ya" : "Tidak",
            trx.status
          ]);
        });
      });
    });
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_KompakPOS_Detail_${startDate}_to_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!selectedSession || sessionTransactions.length === 0) return;
    
    const headers = ["ID Order", "Waktu", "Kasir", "Pelanggan", "Item", "Qty", "Harga", "Total", "Metode", "Pricelist", "Paket", "Promo", "Combo", "Status"];
    const rows: string[][] = [];
    
    sessionTransactions.forEach(t => {
      const customer = customers.find(c => c.id === t.customerId);
      t.items.forEach(item => {
        const plName = priceLists.find(pl => pl.id === item.priceListId)?.name || "-";
        const promoName = promoDiscounts.find(pd => pd.id === item.promoId)?.name || "-";

        rows.push([
          t.id,
          format(new Date(t.date), 'HH:mm'),
          t.staffName || "Admin",
          `"${customer?.name || 'Walk-in'}"`,
          `"${item.name}"`,
          item.quantity.toString(),
          item.price.toString(),
          (item.price * item.quantity).toString(),
          t.paymentMethod || "N/A",
          `"${plName}"`,
          item.isPackage ? "Ya" : "Tidak",
          `"${promoName}"`,
          item.isCombo ? "Ya" : "Tidak",
          t.status
        ]);
      });
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Sesi_${selectedSession.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    if (sessionTransactions.length === 0) return { totalSales: 0, totalTax: 0, totalSubtotal: 0, paymentsByMethod: {} };
    
    return sessionTransactions.reduce((acc, t) => {
      if (t.status === 'Returned') return acc;
      acc.totalSales += t.total;
      acc.totalTax += t.tax;
      acc.totalSubtotal += t.subtotal;
      const method = t.paymentMethod || 'Lainnya';
      acc.paymentsByMethod[method] = (acc.paymentsByMethod[method] || 0) + t.total;
      return acc;
    }, { totalSales: 0, totalTax: 0, totalSubtotal: 0, paymentsByMethod: {} as Record<string, number> });
  }, [sessionTransactions]);

  if (!selectedSessionId) {
    return (
      <div className="flex flex-col gap-8 pb-24">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3">
              <History className="text-primary h-8 w-8" /> Riwayat Sesi Kasir
            </h2>
            <p className="text-muted-foreground mt-1">Pilih sesi untuk melihat laporan detail dan ringkasan penjualan.</p>
          </div>

          <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-[2rem] border shadow-sm w-full lg:w-auto">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dari Tanggal</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 rounded-xl border-none bg-muted/20 font-bold text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hingga Tanggal</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 rounded-xl border-none bg-muted/20 font-bold text-xs" />
            </div>
            <Button 
              onClick={handleExportAllSessions} 
              disabled={filteredSessions.length === 0}
              className="h-10 px-6 rounded-xl bg-green-600 hover:bg-green-700 font-black gap-2 shadow-lg shadow-green-600/20 ml-auto"
            >
              <FileSpreadsheet className="h-4 w-4" /> Ekspor Detail Excel (CSV)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id} 
              onClick={() => setSelectedSessionId(session.id)}
              className="p-6 rounded-[2.5rem] border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer bg-white group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary/5 p-3 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Clock className="h-6 w-6" />
                </div>
                <Badge className={cn(
                  "font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg border-none",
                  session.status === 'Open' ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                )}>
                  {session.status === 'Open' ? 'SEDANG BERJALAN' : 'TELAH DITUTUP'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">ID Sesi</p>
                  <p className="text-lg font-black text-[#1a1f2b]">#{session.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-dashed py-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Mulai</p>
                    <p className="text-[11px] font-bold">{format(new Date(session.startTime), 'dd MMM, HH:mm')}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1">
                      <User className="h-2 w-2" /> {session.openedBy || 'Staff'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Selesai</p>
                    <p className="text-[11px] font-bold">{session.endTime ? format(new Date(session.endTime), 'dd MMM, HH:mm') : '-'}</p>
                    {session.closedBy && (
                      <p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1">
                        <User className="h-2 w-2" /> {session.closedBy}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex flex-col">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Total Order</p>
                    <p className="text-sm font-black text-primary">{session.transactionIds.length} Transaksi</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredSessions.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center">
              <Calendar className="h-20 w-20 mb-4" />
              <p className="text-xl font-bold">Tidak ada sesi di periode ini</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle selectedSession null case for TypeScript
  if (!selectedSession) return null;

  const cashDifference = (selectedSession.closingCash || 0) - (selectedSession.openingCash + (stats.paymentsByMethod['Tunai'] || 0));

  return (
    <div className="flex flex-col gap-4 md:gap-8 pb-24">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedSessionId(null)}
              className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2">
                <FileText className="text-primary h-6 w-6 md:h-8 md:w-8" /> Laporan Sesi
              </h2>
              <p className="text-[10px] md:text-sm text-muted-foreground mt-1">Sesi #{selectedSession.id} • Dihandel Oleh: {selectedSession.openedBy || 'Admin'}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button onClick={() => setIsPreviewOpen(true)} variant="outline" size="sm" className="flex-1 md:flex-none h-12 rounded-xl font-black gap-2 border-2">
              <Printer className="h-4 w-4" /> Cetak Ringkasan
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex-1 md:flex-none h-12 rounded-xl font-black gap-2 border-2">
              <Download className="h-4 w-4" /> Unduh Detail CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <ReportStatCard title="Total Jual" value={isLoading ? "..." : formatCurrency(stats.totalSales)} icon={DollarSign} color="bg-primary" />
        <ReportStatCard title="Modal Awal" value={formatCurrency(selectedSession.openingCash)} icon={ArrowUpRight} color="bg-green-500" />
        <ReportStatCard title="Kas Akhir" value={formatCurrency(selectedSession.closingCash || 0)} icon={ArrowDownRight} color="bg-orange-500" />
        <ReportStatCard title="Selisih" value={isLoading ? "..." : formatCurrency(cashDifference)} icon={PieChart} color={Math.abs(cashDifference) < 100 ? "bg-accent" : "bg-destructive"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm p-6 md:p-10 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-2 mb-4">
              <FileText className="text-primary h-5 w-5" /> Ringkasan Finansial
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
             <div className="flex justify-between items-center py-3 border-b border-dashed">
               <span className="text-muted-foreground text-sm font-bold">Total Transaksi (Orders)</span>
               <span className="font-black text-lg">{isLoading ? "..." : sessionTransactions.length}</span>
             </div>
             <div className="flex justify-between items-center py-3 border-b border-dashed">
               <span className="text-muted-foreground text-sm font-bold">Subtotal Penjualan (Net)</span>
               <span className="font-black text-lg">{isLoading ? "..." : formatCurrency(stats.totalSubtotal)}</span>
             </div>
             <div className="flex justify-between items-center py-3 border-b border-dashed">
               <span className="text-muted-foreground text-sm font-bold">Pajak Terkumpul</span>
               <span className="font-black text-lg">{isLoading ? "..." : formatCurrency(stats.totalTax)}</span>
             </div>
             <div className="flex justify-between items-center p-6 bg-primary/5 rounded-[2rem] mt-6 border-2 border-primary/10">
               <span className="text-primary font-black text-lg uppercase tracking-widest">Grand Total</span>
               <span className="text-primary font-black text-3xl tracking-tight">{isLoading ? "..." : formatCurrency(stats.totalSales)}</span>
             </div>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm p-6 md:p-10 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-2 mb-6">
              <PieChart className="text-primary h-5 w-5" /> Distribusi Pembayaran
            </CardTitle>
          </CardHeader>
          <div className="space-y-6">
            {Object.entries(stats.paymentsByMethod).map(([method, amount]: any) => (
              <div key={method} className="space-y-2">
                <div className="flex justify-between text-sm font-black">
                  <span className="uppercase tracking-widest text-muted-foreground text-[10px]">{method}</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${(amount / (stats.totalSales || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {isLoading && <div className="py-10 text-center text-xs animate-pulse font-black text-primary">MENYIAPKAN DATA...</div>}
            {!isLoading && Object.keys(stats.paymentsByMethod).length === 0 && (
              <div className="py-20 text-center opacity-20 flex flex-col items-center">
                <History className="h-10 w-10 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Tidak ada data</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm p-6 md:p-10 bg-white overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <History className="text-primary h-5 w-5" /> Detail Transaksi Sesi
          </CardTitle>
          <Badge className="bg-muted text-muted-foreground border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">
            {sessionTransactions.length} RECORD
          </Badge>
        </div>
        
        <ScrollArea className="h-[500px] -mx-4 px-4">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="font-black text-[10px] uppercase tracking-widest h-12">Jam</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest h-12">ID Order</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest h-12">Kasir</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest h-12">Pelanggan</TableHead>
                <TableHead className="font-black text-[10px) uppercase tracking-widest h-12">Metode</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest h-12">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionTransactions.map((t) => {
                const customer = customers.find(c => c.id === t.customerId);
                return (
                  <TableRow key={t.id} className="border-b border-dashed last:border-none">
                    <TableCell className="text-xs font-bold py-5">{format(new Date(t.date), 'HH:mm')}</TableCell>
                    <TableCell className="font-mono text-[10px] font-bold text-primary py-5">#{t.id}</TableCell>
                    <TableCell className="text-[10px] font-black uppercase py-5">{t.staffName || 'Admin'}</TableCell>
                    <TableCell className="text-[10px] font-bold py-5 truncate max-w-[150px]">{customer?.name || 'Umum (Walk-in)'}</TableCell>
                    <TableCell className="py-5">
                      <Badge variant="outline" className={cn(
                        "rounded-lg text-[9px] font-black px-2 py-0.5 border-primary/20 text-primary",
                        t.status === 'Returned' && "border-destructive text-destructive"
                      )}>
                        {t.status === 'Returned' ? 'RETUR' : t.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-black text-sm py-5",
                      t.status === 'Returned' ? "text-muted-foreground line-through" : "text-foreground"
                    )}>{formatCurrency(t.total)}</TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && sessionTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 opacity-30">
                    <History className="h-10 w-10 mx-auto mb-2" />
                    <p className="font-black text-[10px] uppercase tracking-widest">Tidak ada transaksi dalam sesi ini.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
      
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[420px] p-0 border-none bg-transparent shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Pratinjau Struk Sesi</DialogTitle>
          </DialogHeader>
          <div className="scale-95 origin-top">
            <SessionSummaryReceipt session={selectedSession} />
          </div>
          <div className="flex gap-2 p-4 bg-white rounded-b-[2rem] shadow-2xl -mt-4 z-10">
            <Button onClick={() => window.print()} className="flex-1 h-12 rounded-xl bg-primary font-black gap-2">
              <Printer className="h-4 w-4" /> Cetak Sekarang
            </Button>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="h-12 rounded-xl font-bold border-2">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-white overflow-hidden relative group hover:shadow-lg transition-all">
      <div className={cn(color, "w-12 h-12 rounded-2xl text-white flex items-center justify-center mb-4 shadow-lg shadow-black/5")}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl md:text-2xl font-black truncate tracking-tight">{value}</p>
      <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5", color)}></div>
    </Card>
  );
}
