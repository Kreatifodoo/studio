
"use client";

import React from 'react';
import { usePOS } from './POSContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { FileText, DollarSign, PieChart, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function SessionReportView() {
  const { lastClosedSession, sessions, history } = usePOS();
  
  // Use either the most recently closed session or allow picking one
  const sessionToView = lastClosedSession || sessions[0];

  if (!sessionToView) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center opacity-30">
        <FileText className="h-24 w-24 mb-6" />
        <h2 className="text-3xl font-black">No Reports Available</h2>
        <p className="text-xl">Close a session to generate your first report.</p>
      </div>
    );
  }

  // Calculate Session Stats
  const sessionTransactions = history.filter(t => sessionToView.transactionIds.includes(t.id));
  const totalSales = sessionTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalTax = sessionTransactions.reduce((acc, t) => acc + t.tax, 0);
  const totalSubtotal = sessionTransactions.reduce((acc, t) => acc + t.subtotal, 0);
  
  // Payment Breakdown
  const paymentsByMethod = sessionTransactions.reduce((acc: any, t) => {
    const method = t.paymentMethod || 'Other';
    acc[method] = (acc[method] || 0) + t.total;
    return acc;
  }, {});

  const cashDifference = (sessionToView.closingCash || 0) - (sessionToView.openingCash + (paymentsByMethod['Cash'] || 0));

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <FileText className="text-primary" /> Session Report
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Session #{sessionToView.id} • {format(new Date(sessionToView.startTime), 'PPP p')} - {sessionToView.endTime ? format(new Date(sessionToView.endTime), 'p') : 'Ongoing'}
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
          {sessionToView.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatCard title="Total Sales" value={`$${totalSales.toFixed(2)}`} icon={DollarSign} color="bg-primary" />
        <ReportStatCard title="Opening Cash" value={`$${sessionToView.openingCash.toFixed(2)}`} icon={ArrowUpRight} color="bg-green-500" />
        <ReportStatCard title="Closing Cash" value={`$${(sessionToView.closingCash || 0).toFixed(2)}`} icon={ArrowDownRight} color="bg-orange-500" />
        <ReportStatCard 
          title="Cash Difference" 
          value={`${cashDifference >= 0 ? '+' : ''}$${cashDifference.toFixed(2)}`} 
          icon={PieChart} 
          color={cashDifference === 0 ? "bg-accent" : "bg-destructive"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black">Transaction Summary</CardTitle>
          </CardHeader>
          <div className="space-y-6">
             <div className="flex justify-between items-center py-4 border-b">
               <span className="text-muted-foreground font-bold">Total Transactions</span>
               <span className="font-black text-xl">{sessionTransactions.length}</span>
             </div>
             <div className="flex justify-between items-center py-4 border-b">
               <span className="text-muted-foreground font-bold">Subtotal (Net Sales)</span>
               <span className="font-black text-xl">${totalSubtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center py-4 border-b">
               <span className="text-muted-foreground font-bold">Collected Taxes</span>
               <span className="font-black text-xl">${totalTax.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center py-6 bg-primary/5 px-6 rounded-3xl">
               <span className="text-primary font-black text-lg">Gross Sales</span>
               <span className="text-primary font-black text-3xl">${totalSales.toFixed(2)}</span>
             </div>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black">Payment Methods</CardTitle>
          </CardHeader>
          <div className="space-y-6 mt-4">
            {Object.entries(paymentsByMethod).map(([method, amount]: any) => (
              <div key={method} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{method}</span>
                  <span className="font-black">${amount.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(amount / totalSales) * 100}%` }}
                   ></div>
                </div>
              </div>
            ))}
            {Object.keys(paymentsByMethod).length === 0 && (
              <p className="text-center text-muted-foreground py-10 font-medium">No payments recorded</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-black">Recent Sessions</CardTitle>
        </CardHeader>
        <ScrollArea className="h-64">
          <div className="space-y-4 pr-4">
            {sessions.map((s) => (
              <div 
                key={s.id} 
                className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl hover:bg-muted/30 transition-all cursor-pointer border border-transparent hover:border-primary/10"
                onClick={() => {}}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl text-primary"><History /></div>
                  <div>
                    <p className="font-black">Session #{s.id}</p>
                    <p className="text-xs text-muted-foreground font-bold">{format(new Date(s.startTime), 'PPP')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg">${(history.filter(t => s.transactionIds.includes(t.id)).reduce((acc, t) => acc + t.total, 0)).toFixed(2)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.transactionIds.length} Transactions</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

function ReportStatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white overflow-hidden relative group">
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}
