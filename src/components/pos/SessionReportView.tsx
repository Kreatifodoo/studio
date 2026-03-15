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
  FileSpreadsheet
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SessionSummaryReceipt } from './SessionSummaryReceipt';
import { db } from '@/lib/db';
import { Transaction } from '@/types/pos';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SessionReportView() {
  const { 
    sessions, customers, lastClosedSession, 
    priceLists, promoDiscounts
  } = usePOS();
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sessionTransactions, setSessionTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Client-side initialization to avoid hydration mismatch
    const today = format(new Date(), 'yyyy-MM-dd');
    setStartDate(today);
    setEndDate(today);
  }, []);

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
                  session.status === 'Open' ? "bg-green-50/10 text-green-600" : "bg-muted text-muted-foreground"
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
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Selesai</p>
                    <p className="text-[11px] font-bold">{session.endTime ? format(new Date(session.endTime), 'dd MMM, HH:mm') : '-'}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedSession) return null;

  const cashDifference = (selectedSession.closingCash || 0) - (selectedSession.openingCash + (stats.paymentsByMethod['Tunai'] || 0));

  return (
    <div className="flex flex-col gap-4 md:gap-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSessionId(null)} className="h-12 w-12 rounded-2xl bg-white shadow-sm hover:bg-primary hover:text-white transition-all">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2">Laporan Sesi</h2>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1">Sesi #{selectedSession.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <ReportStatCard title="Total Jual" value={isLoading ? "..." : formatCurrency(stats.totalSales)} icon={DollarSign} color="bg-primary" />
        <ReportStatCard title="Modal Awal" value={formatCurrency(selectedSession.openingCash)} icon={ArrowUpRight} color="bg-green-500" />
        <ReportStatCard title="Kas Akhir" value={formatCurrency(selectedSession.closingCash || 0)} icon={ArrowDownRight} color="bg-orange-500" />
        <ReportStatCard title="Selisih" value={isLoading ? "..." : formatCurrency(cashDifference)} icon={PieChart} color={Math.abs(cashDifference) < 100 ? "bg-accent" : "bg-destructive"} />
      </div>
    </div>
  );
}

function ReportStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-white overflow-hidden relative group hover:shadow-lg transition-all">
      <div className={cn(color, "w-12 h-12 rounded-2xl text-white flex items-center justify-center mb-4")}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl md:text-2xl font-black truncate tracking-tight">{value}</p>
    </Card>
  );
}
