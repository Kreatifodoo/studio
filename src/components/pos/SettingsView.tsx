
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Store, Printer, Globe } from 'lucide-react';

export function SettingsView() {
  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Settings</h2>
        <p className="text-muted-foreground">Manage your POS configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <SettingsSection 
          icon={Store} 
          title="Store Information" 
          description="Basic details about your establishment"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input placeholder="Main Store" defaultValue="Alex's Deli" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input type="number" defaultValue="10" className="rounded-xl" />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection 
          icon={Bell} 
          title="Notifications" 
          description="Configure alert preferences"
        >
          <div className="space-y-4 pt-4">
            <ToggleOption title="Order Alerts" description="Notify on new incoming orders" defaultChecked />
            <ToggleOption title="Low Stock" description="Notify when items are running out" defaultChecked />
            <ToggleOption title="Daily Report" description="Email daily summary at end of shift" />
          </div>
        </SettingsSection>

        <SettingsSection 
          icon={Printer} 
          title="Hardware" 
          description="Connect and manage peripherals"
        >
          <div className="space-y-4 pt-4">
            <ToggleOption title="Auto-print Receipt" description="Print receipt automatically after payment" defaultChecked />
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
              <div className="flex items-center gap-3">
                 <Printer className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <p className="font-bold text-sm">EPSON TM-T88VI</p>
                   <p className="text-xs text-muted-foreground">Connected via Network (192.168.1.50)</p>
                 </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">Test Print</Button>
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="ghost" className="rounded-xl font-bold">Reset Defaults</Button>
          <Button className="rounded-xl bg-primary hover:bg-primary/90 font-bold px-8">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white">
      <div className="flex gap-4 mb-2">
        <div className="bg-primary/5 p-3 rounded-2xl text-primary h-fit">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
      {children}
    </Card>
  );
}

function ToggleOption({ title, description, defaultChecked }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5">
        <p className="font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
