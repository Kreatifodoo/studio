
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from './POSContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
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
  Users, 
  Wallet, 
  Trophy, 
  Tags, 
  Package as PackageIcon, 
  BarChart3, 
  LayoutGrid, 
  Ticket,
  Calendar as CalendarIcon,
  Layers,
  Search
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['#3D8AF5', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4'];

export function DashboardView() {
  const { history, products, customers, packages, combos, categories } = usePOS();
  
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setMounted(true);
    // Default to last 30 days
    const end = new Date();
    const start = subDays(end, 30);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  }, []);

  // Filtered History based on date range
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

  // Aggregations
  const stats = useMemo(() => {
    let revenue = 0;
    let savings = 0;
    let cost = 0;
    
    // For Category Chart
    const categoryMap: Record<string, number> = {};
    // For Product Chart
    const productMap: Record<string, { name: string, rev: number, qty: number }> = {};
    // For Daily Chart (simplified)
    const dailyMap: Record<string, number> = {};

    filteredHistory.forEach(t => {
      revenue += t.total;
      savings += (t.totalSavings || 0);
      
      const day = format(parseISO(t.date), 'EEE');
      dailyMap[day] = (dailyMap[day] || 0) + t.total;

      t.items.forEach(item => {
        // Calculate Cost
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
          
          // Category tracking for normal products
          if (product) {
            categoryMap[product.category] = (categoryMap[product.category] || 0) + (item.price * item.quantity);
          }
        }
        cost += (itemCost * item.quantity);

        // Product tracking
        productMap[item.productId] = productMap[item.productId] || { name: item.name, rev: 0, qty: 0 };
        productMap[item.productId].rev += (item.price * item.quantity);
        productMap[item.productId].qty += item.quantity;
      });
    });

    const profit = revenue - cost;

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 5);

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day,
      sales: dailyMap[day] || 0
    }));

    return { revenue, savings, cost, profit, categoryData, chartData, topProducts };
  }, [filteredHistory, products, packages, combos]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black">Dashboard</h2>
          <p className="text-muted-foreground">Detailed store analytics and reporting</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-muted/50">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</Label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 border-none bg-muted/20 rounded-xl font-bold"
            />
          </div>
          <div className="h-8 w-px bg-muted self-end mb-1" />
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Date</Label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 border-none bg-muted/20 rounded-xl font-bold"
            />
          </div>
          <div className="bg-primary/10 p-3 rounded-2xl text-primary self-end">
            <CalendarIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          trend="+12.5%" 
          icon={DollarSign} 
          color="bg-primary"
        />
        <StatCard 
          title="Promo Given" 
          value={`$${stats.savings.toLocaleString()}`} 
          trend="Total Discount" 
          icon={Ticket} 
          color="bg-accent"
        />
        <StatCard 
          title="Gross Profit" 
          value={`$${stats.profit.toLocaleString()}`} 
          trend="Net Earning" 
          icon={Wallet} 
          color="bg-green-500"
        />
        <StatCard 
          title="Orders Count" 
          value={filteredHistory.length.toString()} 
          trend="Total Count" 
          icon={ShoppingBag} 
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Chart */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="text-primary h-5 w-5" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-0">
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
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3D8AF5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Layers className="text-primary h-5 w-5" /> Category Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {stats.categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[10px] font-bold text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
          <div className="flex items-center justify-between mb-8">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <BarChart3 className="text-primary h-5 w-5" /> Top Selling Products
            </CardTitle>
          </div>
          <div className="space-y-6">
            {stats.topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-black text-sm">{prod.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{prod.qty} Items Sold</p>
                  </div>
                </div>
                <p className="font-black text-primary">${prod.rev.toFixed(2)}</p>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <div className="text-center py-10 opacity-30">
                 <Search className="h-12 w-12 mx-auto mb-2" />
                 <p className="font-bold">No product data for this period</p>
              </div>
            )}
          </div>
        </Card>

        {/* Top Customers (already exists, but refined) */}
        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
          <div className="flex items-center justify-between mb-8">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Trophy className="text-orange-500 h-5 w-5" /> Top Customers
            </CardTitle>
          </div>
          <div className="space-y-6">
            {Object.entries(filteredHistory.reduce((acc: any, t) => {
              if (t.customerId) acc[t.customerId] = (acc[t.customerId] || 0) + t.total;
              return acc;
            }, {}))
            .map(([id, total]: any) => ({ customer: customers.find(c => c.id === id), total }))
            .filter(item => !!item.customer)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(({ customer, total }: any, idx) => (
              <div key={customer.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="font-black text-muted-foreground w-4">{idx + 1}</div>
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-primary text-white font-bold">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-black text-sm">{customer.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{customer.phone}</p>
                  </div>
                </div>
                <p className="font-black text-primary">${total.toFixed(2)}</p>
              </div>
            ))}
            {filteredHistory.filter(t => t.customerId).length === 0 && (
              <div className="text-center py-10 opacity-30">
                 <Users className="h-12 w-12 mx-auto mb-2" />
                 <p className="font-bold">No customer records for this period</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Package & Combo Insight (Combined) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
           <CardHeader className="px-0 pt-0">
             <CardTitle className="text-xl font-black flex items-center gap-2">
                <PackageIcon className="text-purple-600 h-5 w-5" /> Package vs Combo Performance
             </CardTitle>
           </CardHeader>
           <CardContent className="h-[300px] px-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { 
                   name: 'Packages', 
                   revenue: filteredHistory.reduce((acc, t) => acc + t.items.filter(i => i.isPackage).reduce((iAcc, item) => iAcc + (item.price * item.quantity), 0), 0),
                   fill: '#8b5cf6'
                 },
                 { 
                   name: 'Combos', 
                   revenue: filteredHistory.reduce((acc, t) => acc + t.items.filter(i => i.isCombo).reduce((iAcc, item) => iAcc + (item.price * item.quantity), 0), 0),
                   fill: '#f43f5e'
                 }
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: 'black' }} />
                 <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                 <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="revenue" radius={[12, 12, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>
        
        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white flex flex-col justify-center text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Non-Regular Sales Impact</p>
           <p className="text-6xl font-black text-primary mb-4">
              {stats.revenue > 0 ? (((stats.revenue - (filteredHistory.reduce((acc, t) => acc + t.items.filter(i => !i.isPackage && !i.isCombo && !i.priceListId && !i.promoId).reduce((iAcc, item) => iAcc + (item.price * item.quantity), 0), 0))) / stats.revenue) * 100).toFixed(1) : 0}%
           </p>
           <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">
             Contribution from Special Price Lists, Promotions, Bundled Packages, and Combo Sets in the selected period.
           </p>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-500">
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-muted text-muted-foreground uppercase tracking-widest">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}
