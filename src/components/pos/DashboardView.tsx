
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
  Ticket,
  Boxes,
  LayoutGrid,
  Zap,
  Tag,
  Flame,
  Turtle,
  PackageX,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const COLORS = ['#3D8AF5', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4'];

export function DashboardView() {
  const { history, products, customers, packages, combos } = usePOS();
  
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setMounted(true);
    const end = new Date();
    const start = subDays(end, parseInt(period));
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  }, [period]);

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
    let returnAmount = 0;
    let packageRev = 0;
    let comboRev = 0;
    let pricelistSavings = 0;
    let promoDiscountSavings = 0;
    
    const categoryMap: Record<string, number> = {};
    const productMap: Record<string, { name: string, rev: number, qty: number }> = {};
    const packageMap: Record<string, { name: string, rev: number, qty: number }> = {};
    const comboMap: Record<string, { name: string, rev: number, qty: number }> = {};
    const dailyMap: Record<string, number> = {};
    const productSalesQty: Record<string, number> = {};

    products.forEach(p => productSalesQty[p.id] = 0);

    filteredHistory.forEach(t => {
      if (t.status === 'Returned') {
        returnAmount += t.total;
        return; // Skip from active stats
      }

      revenue += t.total;
      savings += (t.totalSavings || 0);
      promoDiscountSavings += (t.totalSavings || 0);
      
      const day = format(parseISO(t.date), 'EEE', { locale: id });
      dailyMap[day] = (dailyMap[day] || 0) + t.total;

      t.items.forEach(item => {
        let itemCost = 0;
        if (item.isPackage) {
          packageRev += (item.price * item.quantity);
          packageMap[item.productId] = packageMap[item.productId] || { name: item.name, rev: 0, qty: 0 };
          packageMap[item.productId].rev += (item.price * item.quantity);
          packageMap[item.productId].qty += item.quantity;

          const pkg = packages.find(p => p.id === item.productId);
          itemCost = pkg?.items.reduce((acc, pi) => {
            const p = products.find(prod => prod.id === pi.productId);
            return acc + (p?.costPrice || 0) * pi.quantity;
          }, 0) || 0;
        } else if (item.isCombo) {
          comboRev += (item.price * item.quantity);
          comboMap[item.productId] = comboMap[item.productId] || { name: item.name, rev: 0, qty: 0 };
          comboMap[item.productId].rev += (item.price * item.quantity);
          comboMap[item.productId].qty += item.quantity;

          itemCost = item.comboSelections?.reduce((acc, sel) => {
            const p = products.find(prod => prod.id === sel.productId);
            return acc + (p?.costPrice || 0);
          }, 0) || 0;
        } else {
          const product = products.find(p => p.id === item.productId);
          itemCost = (product?.costPrice || 0);
          
          if (product) {
            categoryMap[product.category] = (categoryMap[product.category] || 0) + (item.price * item.quantity);
            productSalesQty[product.id] = (productSalesQty[product.id] || 0) + item.quantity;
          }

          if (!item.promoId && item.price < item.originalPrice) {
            pricelistSavings += (item.originalPrice - item.price) * item.quantity;
          }
        }
        cost += (itemCost * item.quantity);

        if (!item.isPackage && !item.isCombo) {
          productMap[item.productId] = productMap[item.productId] || { name: item.name, rev: 0, qty: 0 };
          productMap[item.productId].rev += (item.price * item.quantity);
          productMap[item.productId].qty += item.quantity;
        }
      });
    });

    const profit = revenue - cost;
    const chartData = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => ({
      name: day,
      sales: dailyMap[day] || 0
    }));

    const allProductMovement = products.map(p => ({
      id: p.id,
      name: p.name,
      qtySold: productSalesQty[p.id] || 0,
      stock: p.onHandQty,
      sku: p.sku
    }));

    return { 
      revenue, savings, cost, profit, returnAmount,
      categoryData: Object.entries(categoryMap).map(([name, value]) => ({ name, value })), 
      chartData, 
      topProducts: Object.values(productMap).sort((a, b) => b.rev - a.rev).slice(0, 5),
      packageRev, comboRev, pricelistSavings, promoDiscountSavings,
      topPackages: Object.values(packageMap).sort((a, b) => b.rev - a.rev).slice(0, 5), 
      topCombos: Object.values(comboMap).sort((a, b) => b.rev - a.rev).slice(0, 5),
      fastMoving: allProductMovement.filter(p => p.qtySold > 0).sort((a, b) => b.qtySold - a.qtySold).slice(0, 5),
      slowMoving: allProductMovement.filter(p => p.qtySold > 0).sort((a, b) => a.qtySold - b.qtySold).slice(0, 5),
      deadStock: allProductMovement.filter(p => p.qtySold === 0 && p.stock > 0).slice(0, 5)
    };
  }, [filteredHistory, products, packages, combos]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-4 md:gap-8 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">Dasbor</h2>
          <p className="text-[10px] md:text-sm text-muted-foreground">Analisis performa bisnis Anda</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white p-2 md:p-4 rounded-2xl md:rounded-[2rem] shadow-sm border border-muted/50 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto mr-2">
            <Clock className="h-4 w-4 text-primary" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-10 w-full md:w-[140px] border-none bg-muted/20 font-bold rounded-xl text-xs">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="1">Hari Ini</SelectItem>
                <SelectItem value="7">7 Hari Terakhir</SelectItem>
                <SelectItem value="14">14 Hari Terakhir</SelectItem>
                <SelectItem value="21">21 Hari Terakhir</SelectItem>
                <SelectItem value="30">30 Hari Terakhir</SelectItem>
                <SelectItem value="45">45 Hari Terakhir</SelectItem>
                <SelectItem value="60">60 Hari Terakhir</SelectItem>
                <SelectItem value="90">90 Hari Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex flex-col gap-0.5">
              <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dari</Label>
              <Input type="date" value={startDate} onChange={(e) => {setStartDate(e.target.value); setPeriod('custom');}} className="h-8 md:h-10 border-none bg-muted/20 rounded-lg md:rounded-xl font-bold text-xs" />
            </div>
            <div className="flex flex-col gap-0.5">
              <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ke</Label>
              <Input type="date" value={endDate} onChange={(e) => {setEndDate(e.target.value); setPeriod('custom');}} className="h-8 md:h-10 border-none bg-muted/20 rounded-lg md:rounded-xl font-bold text-xs" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Pendapatan Bersih" value={formatCurrency(stats.revenue)} trend="+12%" icon={DollarSign} color="bg-primary" />
        <StatCard title="Retur Barang" value={formatCurrency(stats.returnAmount)} trend="Total" icon={RotateCcw} color="bg-rose-500" />
        <StatCard title="Laba Kotor" value={formatCurrency(stats.profit)} trend="Net" icon={Wallet} color="bg-green-500" />
        <StatCard title="Transaksi" value={filteredHistory.filter(t => t.status !== 'Returned').length.toString()} trend="Orders" icon={ShoppingBag} color="bg-orange-500" />
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
                <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
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
                <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {stats.categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
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

      <div className="flex flex-col gap-1 mt-4">
        <h3 className="text-lg md:text-xl font-black flex items-center gap-2"><Zap className="text-yellow-500 h-5 w-5" /> Analisis Penawaran & Paket</h3>
        <p className="text-[10px] md:text-sm text-muted-foreground">Detail performa paket bundling dan harga khusus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all flex flex-col gap-2">
          <div className="flex justify-between items-center"><Boxes className="text-accent h-5 w-5" /><span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Paket</span></div>
          <p className="text-base font-black">{formatCurrency(stats.packageRev)}</p>
          <p className="text-[9px] font-bold text-muted-foreground">Total Penjualan Paket</p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all flex flex-col gap-2">
          <div className="flex justify-between items-center"><LayoutGrid className="text-primary h-5 w-5" /><span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Combo</span></div>
          <p className="text-base font-black">{formatCurrency(stats.comboRev)}</p>
          <p className="text-[9px] font-bold text-muted-foreground">Total Penjualan Combo</p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all flex flex-col gap-2">
          <div className="flex justify-between items-center"><Tag className="text-green-500 h-5 w-5" /><span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Grosir</span></div>
          <p className="text-base font-black">{formatCurrency(stats.pricelistSavings)}</p>
          <p className="text-[9px] font-bold text-muted-foreground">Hemat Harga Bertingkat</p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all flex flex-col gap-2">
          <div className="flex justify-between items-center"><Ticket className="text-rose-500 h-5 w-5" /><span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Diskon</span></div>
          <p className="text-base font-black">{formatCurrency(stats.promoDiscountSavings)}</p>
          <p className="text-[9px] font-bold text-muted-foreground">Hemat Kupon / Promo</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-8">
        <h3 className="text-lg md:text-xl font-black flex items-center gap-2"><BarChart3 className="text-primary h-5 w-5" /> Analisis Pergerakan Stok</h3>
        <p className="text-[10px] md:text-sm text-muted-foreground">Pantau kesehatan stok berdasarkan volume penjualan di periode terpilih</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardTitle className="text-sm md:text-base font-black flex items-center gap-2 mb-6"><Flame className="text-orange-500 h-4 w-4 md:h-5 md:w-5" /> Fast Moving</CardTitle>
          <div className="space-y-4">
            {stats.fastMoving.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-orange-50/30 rounded-xl md:rounded-2xl border border-orange-100">
                <div><p className="font-black text-xs md:text-sm">{p.name}</p><p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">{p.sku}</p></div>
                <div className="text-right"><p className="font-black text-xs md:text-sm text-orange-600">{p.qtySold} Unit</p><p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">Stok: {p.stock}</p></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardTitle className="text-sm md:text-base font-black flex items-center gap-2 mb-6"><Turtle className="text-blue-500 h-4 w-4 md:h-5 md:w-5" /> Slow Moving</CardTitle>
          <div className="space-y-4">
            {stats.slowMoving.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-blue-50/30 rounded-xl md:rounded-2xl border border-blue-100">
                <div><p className="font-black text-xs md:text-sm">{p.name}</p><p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">{p.sku}</p></div>
                <div className="text-right"><p className="font-black text-xs md:text-sm text-blue-600">{p.qtySold} Unit</p><p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">Stok: {p.stock}</p></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardTitle className="text-sm md:text-base font-black flex items-center gap-2 mb-6"><PackageX className="text-destructive h-4 w-4 md:h-5 md:w-5" /> Dead Stock</CardTitle>
          <div className="space-y-4">
            {stats.deadStock.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-rose-50/30 rounded-xl md:rounded-2xl border border-rose-100">
                <div><p className="font-black text-xs md:text-sm">{p.name}</p><p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">{p.sku}</p></div>
                <div className="text-right"><p className="font-black text-xs md:text-sm text-destructive">0 Terjual</p><p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">Sisa: {p.stock}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mt-4">
        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2 mb-6"><BarChart3 className="text-primary h-4 w-4 md:h-5 md:w-5" /> Produk Terlaris</CardTitle>
          <div className="space-y-4">
            {stats.topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-muted/10 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] md:text-xs">{idx + 1}</div>
                  <div><p className="font-black text-xs md:text-sm">{prod.name}</p><p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">{prod.qty} Terjual</p></div>
                </div>
                <p className="font-black text-xs md:text-sm text-primary">{formatCurrency(prod.rev)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-4 md:p-8 bg-white">
          <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2 mb-6"><Trophy className="text-orange-500 h-4 w-4 md:h-5 md:w-5" /> Pelanggan Loyal</CardTitle>
          <div className="space-y-4">
            {Object.entries(filteredHistory.reduce((acc: any, t) => {
              if (t.customerId && t.status !== 'Returned') {
                if (!acc[t.customerId]) acc[t.customerId] = { total: 0, count: 0 };
                acc[t.customerId].total += t.total;
                acc[t.customerId].count += 1;
              }
              return acc;
            }, {}))
            .map(([id, data]: any) => ({ customer: customers.find(c => c.id === id), total: data.total, count: data.count }))
            .filter(item => !!item.customer)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(({ customer, total, count }: any, idx) => (
              <div key={customer.id} className="flex items-center justify-between p-3 md:p-4 bg-muted/10 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 md:h-10 md:h-10 border-2 border-white shadow-sm"><AvatarFallback className="bg-primary text-white font-bold text-[10px]">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-black text-xs md:text-sm">{customer.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">{customer.phone}</p>
                      <span className="text-[8px] md:text-[10px] text-primary font-black uppercase tracking-tighter bg-primary/5 px-1.5 rounded">{count} TRX</span>
                    </div>
                  </div>
                </div>
                <p className="font-black text-xs md:text-sm text-primary">{formatCurrency(total)}</p>
              </div>
            ))}
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
        <div className={cn(color, "p-2 md:p-4 rounded-xl md:rounded-2xl text-white")}><Icon className="h-4 w-4 md:h-6 md:w-6" /></div>
        <span className="text-[7px] md:text-[10px] font-black px-2 py-1 rounded-lg bg-muted text-muted-foreground uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <p className="text-[8px] md:text-xs text-muted-foreground font-black uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-lg md:text-2xl font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}
