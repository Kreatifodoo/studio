"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from './POSContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Wallet, 
  Trophy, 
  Package as PackageIcon, 
  BarChart3, 
  Search,
  Calendar as CalendarIcon,
  Layers,
  Ticket
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

const COLORS = ['#3D8AF5', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4'];

export function DashboardView() {
  const { history, products, customers, packages } = usePOS();
  
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setMounted(true);
    const end = new Date();
    const start = subDays(end, 30);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const filteredHistory = useMemo(() => {
    if (!startDate || !endDate) return history;
    
    return history.filter(t => {
      const tDate = parseISO(t.date);
      return isWithinInterval(tDate, {
        start: startOfDay(parseISO(startDate)),
        end: endOfDay(parseISO(endDate))
      });
    });
  }, [history, startDate, endDate]);

  const stats = useMemo(() => {
    let revenue = 0;
    let savings = 0;
    let cost = 0;
    
    const categoryMap: Record<string, number> = {};
    const productMap: Record<string, { name: string, rev: number, qty: number }> = {};
    const dailyMap: Record<string, number> = {};

    filteredHistory.forEach(t => {
      revenue += t.total;
      savings += (t.totalSavings || 0);
      
      const day = format(parseISO(t.date), 'EEE', { locale: id });
      dailyMap[day] = (dailyMap[day] || 0) + t.total;

      t.items.forEach(item => {
        let itemCost = 0;
        if (item.isPackage) {
          const pkg = packages.find(p => p.id === item.productId);
          itemCost = pkg?.items.reduce((acc, pi) => {
            const p = products.find(prod => prod.id === pi.productId);
            return acc + (p?.costPrice || 0) * pi.quantity;
          }, 0) || 0;
        } else if (item.isCombo) {
          itemCost = item.comboSelections?.reduce((acc, sel) => {
            const p = products.find(prod => prod.id === sel.productId);
            return acc + (p?.costPrice || 0);
          }, 0) || 0;
        } else {
          const product = products.find(p => p.id === item.productId);
          itemCost = (product?.costPrice || 0);
          
          if (product) {
            categoryMap[product.category] = (categoryMap[product.category] || 0) + (item.price * item.quantity);
          }
        }
        cost += (itemCost * item.quantity);

        productMap[item.productId] = productMap[item.productId] || { name: item.name, rev: 0, qty: 0 };
        productMap[item.productId].rev += (item.price * item.quantity);
        productMap[item.productId].qty += item.quantity;
      });
    });

    const profit = revenue - cost;
    const topProducts = Object.values(productMap).sort((a, b) => b.rev - a.rev).slice(0, 5);
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    const chartData = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => ({
      name: day,
      sales: dailyMap[day] || 0
    }));

    return { revenue, savings, cost, profit, categoryData, chartData, topProducts };
  }, [filteredHistory, products, packages]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-4 md:gap-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">Dasbor</h2>
          <p className="text-[10px] md:text-sm text-muted-foreground">Analisis performa bisnis Anda</p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 bg-white p-2 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm border border-muted/50 w-full lg:w-auto overflow-x-auto">
          <div className="flex flex-col gap-0.5">
            <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dari</Label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 md:h-10 border-none bg-muted/20 rounded-lg md:rounded-xl font-bold text-xs"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ke</Label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 md:h-10 border-none bg-muted/20 rounded-lg md:rounded-xl font-bold text-xs"
            />
          </div>
          <div className="bg-primary/10 p-2 md:p-3 rounded-xl text-primary flex-shrink-0">
            <CalendarIcon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Pendapatan" value={formatCurrency(stats.revenue)} trend="+12%" icon={DollarSign} color="bg-primary" />
        <StatCard title="Promo" value={formatCurrency(stats.savings)} trend="Total" icon={Ticket} color="bg-accent" />
        <StatCard title="Laba Kotor" value={formatCurrency(stats.profit)} trend="Net" icon={Wallet} color="bg-green-500" />
        <StatCard title="Transaksi" value={filteredHistory.length.toString()} trend="Orders" icon={ShoppingBag} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <Card className="lg:col-span-2 rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
              <TrendingUp className="text-primary h-4 w-4 md:h-5 md:w-5" /> Tren Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] md:h-[300px] px-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3D8AF5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3D8AF5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip 
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3D8AF5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
              <Layers className="text-primary h-4 w-4 md:h-5 md:w-5" /> Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] md:h-[300px] px-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '12px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {stats.categoryData.slice(0, 4).map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[8px] font-bold text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2 mb-6">
            <BarChart3 className="text-primary h-4 w-4 md:h-5 md:w-5" /> Produk Terlaris
          </CardTitle>
          <div className="space-y-4">
            {stats.topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-muted/10 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] md:text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-black text-xs md:text-sm">{prod.name}</p>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">{prod.qty} Terjual</p>
                  </div>
                </div>
                <p className="font-black text-xs md:text-sm text-primary">{formatCurrency(prod.rev)}</p>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <div className="text-center py-10 opacity-30">
                 <Search className="h-10 w-10 mx-auto mb-2" />
                 <p className="font-bold text-xs">Belum ada data</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2 mb-6">
            <Trophy className="text-orange-500 h-4 w-4 md:h-5 md:w-5" /> Pelanggan Loyal
          </CardTitle>
          <div className="space-y-4">
            {Object.entries(filteredHistory.reduce((acc: any, t) => {
              if (t.customerId) acc[t.customerId] = (acc[t.customerId] || 0) + t.total;
              return acc;
            }, {}))
            .map(([id, total]: any) => ({ customer: customers.find(c => c.id === id), total }))
            .filter(item => !!item.customer)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(({ customer, total }: any, idx) => (
              <div key={customer.id} className="flex items-center justify-between p-3 md:p-4 bg-muted/10 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 md:h-10 md:h-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-primary text-white font-bold text-[10px]">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-xs md:text-sm">{customer.name}</p>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">{customer.phone}</p>
                  </div>
                </div>
                <p className="font-black text-xs md:text-sm text-primary">{formatCurrency(total)}</p>
              </div>
            ))}
            {filteredHistory.filter(t => t.customerId).length === 0 && (
              <div className="text-center py-10 opacity-30">
                 <PackageIcon className="h-10 w-10 mx-auto mb-2" />
                 <p className="font-bold text-xs">Belum ada pelanggan</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  return (
    <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-6 bg-white overflow-hidden relative group">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className={`${color} p-2 md:p-4 rounded-xl md:rounded-2xl text-white`}>
          <Icon className="h-4 w-4 md:h-6 md:w-6" />
        </div>
        <span className="text-[7px] md:text-[10px] font-black px-2 py-1 rounded-lg bg-muted text-muted-foreground uppercase tracking-widest">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[8px] md:text-xs text-muted-foreground font-black uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-lg md:text-2xl font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}
