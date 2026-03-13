
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

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
  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Dashboard</h2>
        <p className="text-muted-foreground">Store performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$12,845" 
          trend="+12.5%" 
          icon={DollarSign} 
          color="bg-primary"
        />
        <StatCard 
          title="Total Orders" 
          value="456" 
          trend="+5.2%" 
          icon={ShoppingBag} 
          color="bg-accent"
        />
        <StatCard 
          title="Average Order" 
          value="$28.16" 
          trend="-2.1%" 
          icon={TrendingUp} 
          color="bg-orange-500"
        />
        <StatCard 
          title="Total Customers" 
          value="1,205" 
          trend="+8.4%" 
          icon={Users} 
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white">
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
