
"use client";

import React from 'react';
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
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, Wallet, Trophy, Tags, Package as PackageIcon, BarChart3, LayoutGrid, Ticket } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const data = [
  { name: 'Mon', sales: 4000, orders: 240 },
  { name: 'Tue', sales: 3000, orders: 198 },
  { name: 'Wed', sales: 2000, orders: 150 },
  { name: 'Thu', sales: 2780, orders: 190 },
  { name: 'Fri', sales: 1890, orders: 180 },
  { name: 'Sat', sales: 2390, orders: 250 },
  { name: 'Sun', sales: 3490, orders: 210 },
];

export function DashboardView() {
  const { history, products, customers, packages, combos } = usePOS();

  // Basic Totals
  const totalRevenue = history.reduce((acc, t) => acc + t.total, 0);
  const totalPromoDiscounts = history.reduce((acc, t) => acc + (t.totalSavings || 0), 0);
  const totalCost = history.reduce((acc, t) => {
    return acc + t.items.reduce((itemAcc, item) => {
      if (item.isPackage) {
        const pkg = packages.find(p => p.id === item.productId);
        const pkgCost = pkg?.items.reduce((costAcc, pkgItem) => {
          const prod = products.find(p => p.id === pkgItem.productId);
          return costAcc + (prod?.costPrice || 0) * pkgItem.quantity;
        }, 0) || 0;
        return itemAcc + (pkgCost * item.quantity);
      } else if (item.isCombo) {
        const comboCostValue = item.comboSelections?.reduce((cAcc, sel) => {
          const prod = products.find(p => p.id === sel.productId);
          return cAcc + (prod?.costPrice || 0);
        }, 0) || 0;
        return itemAcc + (comboCostValue * item.quantity);
      } else {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + (product ? product.costPrice * item.quantity : 0);
      }
    }, 0);
  }, 0);

  const grossProfit = totalRevenue - totalCost;

  // Package Performance
  let packageRevenue = 0;
  let packageCost = 0;
  let packageOrders = 0;

  // Combo Performance
  let comboRevenue = 0;
  let comboCost = 0;
  let comboOrders = 0;

  // Pricelist vs Normal
  let specialPriceTotal = 0;
  let normalPriceTotal = 0;

  history.forEach(t => {
    t.items.forEach(item => {
      if (item.isPackage) {
        const rev = item.price * item.quantity;
        packageRevenue += rev;
        packageOrders += item.quantity;
        
        const pkg = packages.find(p => p.id === item.productId);
        const cost = pkg?.items.reduce((cAcc, pItem) => {
          const prod = products.find(p => p.id === pItem.productId);
          return cAcc + (prod?.costPrice || 0) * pItem.quantity;
        }, 0) || 0;
        packageCost += (cost * item.quantity);
      } else if (item.isCombo) {
        const rev = item.price * item.quantity;
        comboRevenue += rev;
        comboOrders += item.quantity;

        const cost = item.comboSelections?.reduce((cAcc, sel) => {
          const prod = products.find(p => p.id === sel.productId);
          return cAcc + (prod?.costPrice || 0);
        }, 0) || 0;
        comboCost += (cost * item.quantity);
      } else {
        if (item.priceListId) {
          specialPriceTotal += item.price * item.quantity;
        } else {
          normalPriceTotal += item.price * item.quantity;
        }
      }
    });
  });

  const packageProfit = packageRevenue - packageCost;
  const comboProfit = comboRevenue - comboCost;

  // Calculate Top 5 Customers
  const customerSpending = history.reduce((acc: any, t) => {
    if (t.customerId) {
      acc[t.customerId] = (acc[t.customerId] || 0) + t.total;
    }
    return acc;
  }, {});

  const topCustomers = Object.entries(customerSpending)
    .map(([id, total]: any) => ({
      customer: customers.find(c => c.id === id),
      total
    }))
    .filter(item => !!item.customer)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const priceListData = [
    { name: 'Regular Sales', value: normalPriceTotal, fill: '#3D8AF5' },
    { name: 'Pricelist Sales', value: specialPriceTotal, fill: '#10b981' },
    { name: 'Package Sales', value: packageRevenue, fill: '#8b5cf6' },
    { name: 'Combo Sales', value: comboRevenue, fill: '#f43f5e' }
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Dashboard</h2>
        <p className="text-muted-foreground">Store performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          icon={DollarSign} 
          color="bg-primary"
        />
        <StatCard 
          title="Promo Discounts" 
          value={`-$${totalPromoDiscounts.toLocaleString()}`} 
          trend="Total Given" 
          icon={Ticket} 
          color="bg-accent"
        />
        <StatCard 
          title="Gross Profit" 
          value={`$${grossProfit.toLocaleString()}`} 
          trend="+8.2%" 
          icon={Wallet} 
          color="bg-green-500"
        />
        <StatCard 
          title="Total Orders" 
          value={history.length.toString()} 
          trend="+5.2%" 
          icon={ShoppingBag} 
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Package Insight Section */}
        <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-sm p-8 bg-white overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-600">
                  <PackageIcon className="h-6 w-6" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black">Package Insight</CardTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bundles Analysis</p>
               </div>
            </div>
            
            <div className="space-y-4">
               <div className="p-5 bg-purple-50 rounded-[2rem] border border-purple-100/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">Revenue</p>
                  <p className="text-2xl font-black text-purple-700">${packageRevenue.toFixed(2)}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                     <BarChart3 className="h-3 w-3 text-purple-400" />
                     <span className="text-[10px] font-bold text-purple-500">{packageOrders} Sold</span>
                  </div>
               </div>

               <div className="p-5 bg-green-50 rounded-[2rem] border border-green-100/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-1">Gross Profit</p>
                  <p className="text-2xl font-black text-green-700">${packageProfit.toFixed(2)}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                     <TrendingUp className="h-3 w-3 text-green-400" />
                     <span className="text-[10px] font-bold text-green-500">
                       Margin: {packageRevenue > 0 ? ((packageProfit / packageRevenue) * 100).toFixed(1) : 0}%
                     </span>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-dashed">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rev Contribution</span>
                <span className="font-black text-xs">
                   {totalRevenue > 0 ? ((packageRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                </span>
             </div>
             <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${(packageRevenue / (totalRevenue || 1)) * 100}%` }}></div>
             </div>
          </div>
        </Card>

        {/* Combo Insight Section */}
        <Card className="lg:col-span-1 rounded-[2.5rem] border-none shadow-sm p-8 bg-white overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-600">
                  <LayoutGrid className="h-6 w-6" />
               </div>
               <div>
                  <CardTitle className="text-xl font-black">Combo Insight</CardTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Choice Sets Analysis</p>
               </div>
            </div>
            
            <div className="space-y-4">
               <div className="p-5 bg-rose-50 rounded-[2rem] border border-rose-100/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Revenue</p>
                  <p className="text-2xl font-black text-rose-700">${comboRevenue.toFixed(2)}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                     <BarChart3 className="h-3 w-3 text-rose-400" />
                     <span className="text-[10px] font-bold text-rose-500">{comboOrders} Sold</span>
                  </div>
               </div>

               <div className="p-5 bg-green-50 rounded-[2rem] border border-green-100/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-1">Gross Profit</p>
                  <p className="text-2xl font-black text-green-700">${comboProfit.toFixed(2)}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                     <TrendingUp className="h-3 w-3 text-green-400" />
                     <span className="text-[10px] font-bold text-green-500">
                       Margin: {comboRevenue > 0 ? ((comboProfit / comboRevenue) * 100).toFixed(1) : 0}%
                     </span>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-dashed">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rev Contribution</span>
                <span className="font-black text-xs">
                   {totalRevenue > 0 ? ((comboRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                </span>
             </div>
             <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${(comboRevenue / (totalRevenue || 1)) * 100}%` }}></div>
             </div>
          </div>
        </Card>

        {/* Weekly Chart */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm p-6 bg-white">
          <CardHeader className="px-0">
            <CardTitle className="text-lg font-bold">Weekly Sales Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3D8AF5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3D8AF5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3D8AF5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Customers */}
        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
          <div className="flex items-center justify-between mb-8">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Trophy className="text-orange-500 h-5 w-5" /> Top 5 Customers
            </CardTitle>
          </div>
          <div className="space-y-6">
            {topCustomers.map(({ customer, total }: any, idx) => (
              <div key={customer.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl hover:bg-muted/20 transition-all">
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
            {topCustomers.length === 0 && (
              <div className="text-center py-10 opacity-30">
                 <Users className="h-12 w-12 mx-auto mb-2" />
                 <p className="font-bold">No customer data yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Pricelist & Impact Chart */}
        <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
          <CardHeader className="px-0 pt-0">
             <CardTitle className="text-xl font-black flex items-center gap-2">
                <Tags className="text-primary h-5 w-5" /> Sales Performance Mix
             </CardTitle>
          </CardHeader>
          <CardContent className="px-0 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceListData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {priceListData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="mt-4 p-4 bg-primary/5 rounded-2xl flex justify-between items-end">
             <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Non-Regular Sales Impact</p>
                <p className="text-2xl font-black">
                   {totalRevenue > 0 ? (((specialPriceTotal + packageRevenue + comboRevenue) / totalRevenue) * 100).toFixed(1) : 0}%
                </p>
             </div>
             <p className="text-[9px] font-medium text-muted-foreground max-w-[150px] text-right">
               Combined contribution from Special Price Lists, Packages, and Combos.
             </p>
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white">
        <CardHeader className="px-0">
          <CardTitle className="text-lg font-bold">Orders Volume</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] px-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="orders" fill="#75E6F0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-white overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className={`${color} p-3 rounded-2xl text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </Card>
  );
}
