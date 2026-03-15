
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Store, 
  Plus, 
  Trash2, 
  Pencil,
  Users,
  Package as PackageIcon,
  Tag,
  Boxes,
  LayoutGrid,
  Ticket,
  Printer,
  Database,
  Download,
  Share2,
  Calendar as CalendarIcon,
  AlertTriangle,
  UserCog,
  X,
  Phone,
  Mail,
  MapPin,
  History,
  CreditCard
} from 'lucide-react';
import { usePOS } from './POSContext';
import { 
  Product, Customer, PriceList, User
} from '@/types/pos';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ScrollArea } from '../ui/scroll-area';
import { BarcodePrintView } from './BarcodePrintView';

export function SettingsView() {
  const { 
    products, setProducts, 
    customers, setCustomers,
    storeSettings, setStoreSettings,
    exportDatabase, importDatabase,
    priceLists, setPriceLists,
    users, setUsers, roles,
    printer, connectPrinter, disconnectPrinter,
    history: allHistory,
    categories
  } = usePOS();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('customers');
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [restoreJson, setRestoreJson] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Dialog States
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPricelistDialogOpen, setIsPricelistDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Form States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({});

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});

  const [editingPricelist, setEditingPricelist] = useState<PriceList | null>(null);
  const [pricelistForm, setPricelistForm] = useState<Partial<PriceList>>({ items: [] });
  
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState<string>('');
  const [newTier, setNewTier] = useState({ minQty: '', price: '' });

  const navGroups = [
    {
      title: "Katalog & Penjualan",
      items: [
        { id: 'customers', icon: Users, label: 'Master Pelanggan' },
        { id: 'products', icon: PackageIcon, label: 'Master Produk' },
        { id: 'pricelists', icon: Tag, label: 'Pricelist (Grosir)' },
        { id: 'packages', icon: Boxes, label: 'Paket Produk' },
        { id: 'combos', icon: LayoutGrid, label: 'Combo / Pilihan' },
        { id: 'promos', icon: Ticket, label: 'Program Diskon' },
      ]
    },
    {
      title: "Sistem & Toko",
      items: [
        { id: 'general', icon: Store, label: 'Identitas Toko' },
        { id: 'printer', icon: Printer, label: 'Pengaturan Printer' },
        { id: 'users', icon: UserCog, label: 'Manajemen User' },
        { id: 'database', icon: Database, label: 'Database & Backup' },
      ]
    }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleBackup = async () => {
    try {
      await exportDatabase();
      toast({ title: "Backup Berhasil", description: "File data Anda telah diunduh." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal Backup", description: "Terjadi kesalahan sistem." });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRestoreJson(ev.target?.result as string);
      setIsRestoreConfirmOpen(true);
    };
    reader.readAsText(file);
  };

  const confirmRestore = async () => {
    setIsRestoring(true);
    const success = await importDatabase(restoreJson);
    setIsRestoring(false);
    setIsRestoreConfirmOpen(false);
    if (success) {
      toast({ title: "Pemulihan Berhasil", description: "Aplikasi akan memuat ulang data." });
    } else {
      toast({ variant: "destructive", title: "Gagal Pulihkan", description: "Format file tidak dikenali." });
    }
  };

  const customerTransactions = useMemo(() => {
    if (!editingCustomer) return [];
    return allHistory.filter(t => t.customerId === editingCustomer.id);
  }, [allHistory, editingCustomer]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black">Master Pelanggan</CardTitle>
                <CardDescription>Kelola database pelanggan setia Kompak POS.</CardDescription>
              </div>
              <Button onClick={() => { setEditingCustomer(null); setCustomerForm({}); setIsCustomerDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black px-4">Tambah Pelanggan</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map(c => (
                <Card key={c.id} className="p-4 rounded-2xl border-none bg-muted/5 flex items-center justify-between group hover:bg-muted/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-sm">{c.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(c); setCustomerForm(c); setIsCustomerDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive/50 hover:text-destructive" onClick={() => {
                      if(confirm('Hapus pelanggan ini?')) {
                        setCustomers(customers.filter(x => x.id !== c.id));
                      }
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
              {customers.length === 0 && <div className="col-span-2 py-20 text-center opacity-30 font-bold">Belum ada data pelanggan.</div>}
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-8">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl font-black">Database & Cadangan</CardTitle>
              <CardDescription>Kelola data lokal aplikasi Anda secara aman.</CardDescription>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[2rem] p-8 border-2 border-primary/10 bg-primary/5 flex flex-col items-center text-center gap-6">
                <div className="p-5 bg-white rounded-[1.5rem] shadow-sm text-primary"><Download className="h-10 w-10" /></div>
                <div><h3 className="font-black text-lg">Ekspor Database</h3><p className="text-xs font-medium text-muted-foreground mt-2">Unduh seluruh data sebagai cadangan lokal.</p></div>
                <Button onClick={handleBackup} className="w-full h-14 rounded-2xl bg-primary font-black shadow-xl shadow-primary/20 gap-3">Unduh Cadangan (.json)</Button>
              </Card>
              <Card className="rounded-[2rem] p-8 border-2 border-dashed flex flex-col items-center text-center gap-6">
                <div className="p-5 bg-muted/20 rounded-[1.5rem] text-muted-foreground"><Share2 className="h-10 w-10" /></div>
                <div><h3 className="font-black text-lg">Impor & Pulihkan</h3><p className="text-xs font-medium text-muted-foreground mt-2">Unggah file cadangan untuk memulihkan data.</p></div>
                <label className="w-full"><Input type="file" className="hidden" accept=".json" onChange={handleFileImport} /><div className="w-full h-14 rounded-2xl border-2 flex items-center justify-center font-black cursor-pointer hover:bg-muted/10 transition-all">Pilih File Backup</div></label>
              </Card>
            </div>
          </div>
        );
      
      case 'printer':
        return (
          <div className="space-y-8">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl font-black">Pengaturan Printer</CardTitle>
              <CardDescription>Hubungkan printer Bluetooth (ESC/POS) untuk cetak struk.</CardDescription>
            </div>
            <Card className="rounded-[2rem] p-8 border-none bg-muted/10">
              <div className="flex flex-col items-center text-center gap-6">
                <div className={cn("p-6 rounded-[2rem] transition-all duration-500", printer.status === 'connected' ? "bg-green-50 text-white shadow-xl shadow-green-500/20" : "bg-white text-muted-foreground shadow-sm")}>
                  <Printer className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{printer.name || 'Printer Belum Terhubung'}</h3>
                  <Badge variant="outline" className={cn("mt-2 font-black tracking-widest text-[9px]", printer.status === 'connected' ? "bg-green-50/10 text-green-600 border-green-200" : "bg-muted text-muted-foreground border-transparent")}>
                    {printer.status === 'connected' ? 'TERHUBUNG' : 'TERPUTUS'}
                  </Badge>
                </div>
                {printer.status === 'connected' ? (
                  <Button onClick={disconnectPrinter} variant="outline" className="h-14 w-full max-w-xs rounded-2xl border-2 font-black text-destructive hover:bg-destructive/10">Putuskan Koneksi</Button>
                ) : (
                  <Button onClick={connectPrinter} className="h-16 w-full max-w-xs rounded-2xl bg-primary font-black shadow-xl shadow-primary/20 gap-3">Cari Printer Bluetooth</Button>
                )}
              </div>
            </Card>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black">Manajemen User</CardTitle>
                <CardDescription>Kelola akses akun Admin dan Kasir.</CardDescription>
              </div>
              <Button onClick={() => { setEditingUser(null); setUserForm({ status: 'Active', roleId: 'cashier' }); setIsUserDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black px-4">Tambah Staf</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(u => (
                <Card key={u.id} className="p-4 rounded-2xl border-none bg-muted/5 flex items-center justify-between group hover:bg-muted/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-sm">{u.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{roles.find(r => r.id === u.roleId)?.name || 'Staff'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-[8px] font-black", u.status === 'Active' ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive")}>{u.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setUserForm(u); setIsUserDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black">Master Produk</CardTitle>
                <CardDescription>Kelola katalog barang dagangan Anda.</CardDescription>
              </div>
              <Button onClick={() => { setEditingProduct(null); setProductForm({ onHandQty: 0, price: 0, available: true, category: 'Makanan Utama' }); setIsProductDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black px-4">Tambah</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/5 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="h-10 w-10 rounded-lg object-cover border" alt={p.name} />
                    <div>
                      <p className="font-black text-xs">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-primary font-bold">{formatCurrency(p.price)}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{p.sku}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricelists':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black">Master Pricelist</CardTitle>
                <CardDescription>Grosir & Harga Bertingkat Otomatis.</CardDescription>
              </div>
              <Button onClick={() => { setEditingPricelist(null); setPricelistForm({ items: [], enabled: true, startDate: new Date().toISOString().split('T')[0], endDate: '' }); setIsPricelistDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black px-4">Buat Aturan</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {priceLists.map(pl => (
                <Card key={pl.id} className="p-5 rounded-2xl border-none bg-muted/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary"><Tag className="h-5 w-5" /></div>
                    <div>
                      <p className="font-black text-base">{pl.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">{pl.items.length} Produk • {pl.startDate} s/d {pl.endDate || 'Selamanya'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={pl.enabled} onCheckedChange={(val) => {
                      const updated = priceLists.map(x => x.id === pl.id ? { ...x, enabled: val } : x);
                      setPriceLists(updated);
                    }} />
                    <Button variant="ghost" size="icon" onClick={() => { setEditingPricelist(pl); setPricelistForm(pl); setIsPricelistDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6">
             <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-black">Identitas Toko</CardTitle>
                <CardDescription>Atur nama, alamat, dan logo pada struk belanja.</CardDescription>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Toko / Bisnis</Label>
                    <Input value={storeSettings.name} onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })} className="h-12 rounded-xl border-2 font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alamat Lengkap</Label>
                    <Textarea value={storeSettings.address} onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })} className="min-h-[100px] rounded-xl border-2 font-bold" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Header Struk (Catatan Atas)</Label>
                       <Input value={storeSettings.headerNote} onChange={(e) => setStoreSettings({ ...storeSettings, headerNote: e.target.value })} className="h-12 rounded-xl border-2 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Footer Struk (Catatan Bawah)</Label>
                       <Input value={storeSettings.footerNote} onChange={(e) => setStoreSettings({ ...storeSettings, footerNote: e.target.value })} className="h-12 rounded-xl border-2 font-bold" />
                    </div>
                 </div>
              </div>
          </div>
        );

      default:
        return <div className="py-20 text-center opacity-30 font-bold">Pilih kategori pengaturan.</div>;
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl md:text-3xl font-black">Pengaturan Enterprise</h2>
        <p className="text-[10px] md:text-sm text-muted-foreground">Kelola operasional Kompak POS Anda di sini.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        <aside className="w-full lg:w-72 bg-white rounded-[2rem] p-4 shadow-sm border overflow-x-auto flex lg:flex-col gap-2 scrollbar-hide">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex lg:flex-col gap-1 shrink-0">
              <p className="hidden lg:block px-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground my-4">{group.title}</p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all font-black text-[10px] md:text-[13px]",
                    activeTab === item.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="flex-1 bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border min-h-[600px]">
          {renderTabContent()}
        </main>
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl rounded-[2.5rem] p-0 border-none shadow-2xl overflow-hidden">
          <div className="p-8 md:p-10 pb-4 bg-primary/5">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{editingProduct ? 'Edit Produk' : 'Produk Baru'}</DialogTitle>
              <DialogDescription>Kelola detail produk, harga, dan stok.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 md:p-10 pt-6 space-y-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Produk</Label>
                <Input 
                  value={productForm.name || ''} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} 
                  className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kategori</Label>
                <Select 
                  value={productForm.category} 
                  onValueChange={(val) => setProductForm({ ...productForm, category: val })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kode SKU</Label>
                <Input 
                  value={productForm.sku || ''} 
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} 
                  className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" 
                  placeholder="Contoh: MU-001"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Barcode / EAN</Label>
                <div className="flex gap-2">
                  <Input 
                    value={productForm.barcode || ''} 
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })} 
                    className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" 
                    placeholder="8880001"
                  />
                  {editingProduct && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12 rounded-xl border-2 border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => window.print()}
                    >
                      <Printer className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Harga Jual</Label>
                <Input 
                  type="number" 
                  value={productForm.price || 0} 
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })} 
                  className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Harga Pokok (Modal)</Label>
                <Input 
                  type="number" 
                  value={productForm.costPrice || 0} 
                  onChange={(e) => setProductForm({ ...productForm, costPrice: parseFloat(e.target.value) || 0 })} 
                  className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stok Tersedia</Label>
                <Input 
                  type="number" 
                  value={productForm.onHandQty || 0} 
                  onChange={(e) => setProductForm({ ...productForm, onHandQty: parseInt(e.target.value) || 0 })} 
                  className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL Gambar Produk</Label>
              <Input 
                value={productForm.image || ''} 
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} 
                className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" 
                placeholder="https://picsum.photos/seed/..."
              />
            </div>
          </div>
          <DialogFooter className="p-8 md:p-10 pt-4 bg-white border-t rounded-b-[2.5rem]">
            <Button 
              onClick={() => {
                if (!productForm.name || !productForm.sku) {
                  toast({ variant: 'destructive', title: 'Data Tidak Lengkap', description: 'Nama dan SKU wajib diisi.' });
                  return;
                }
                const newProd = { 
                  id: editingProduct?.id || Math.random().toString(36).substr(2, 9), 
                  available: true,
                  ...productForm 
                } as Product;
                
                if (editingProduct) {
                  setProducts(products.map(p => p.id === newProd.id ? newProd : p));
                } else {
                  setProducts([...products, newProd]);
                }
                setIsProductDialogOpen(false);
                toast({ title: 'Berhasil', description: 'Data produk telah disimpan.' });
              }} 
              className="w-full h-14 rounded-2xl bg-primary font-black text-lg shadow-xl shadow-primary/20"
            >
              Simpan Produk
            </Button>
          </DialogFooter>
        </DialogContent>
        {/* Print View Wrapper */}
        {editingProduct && (
          <div className="hidden">
            <BarcodePrintView product={editingProduct} />
          </div>
        )}
      </Dialog>

      {/* Pricelist Dialog */}
      <Dialog open={isPricelistDialogOpen} onOpenChange={setIsPricelistDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl rounded-[2.5rem] p-0 border-none shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 md:p-10 pb-4">
            <DialogHeader className="mb-4 text-center md:text-left">
              <DialogTitle className="text-xl md:text-2xl font-black text-foreground">Pengaturan Pricelist</DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground text-[10px] md:text-sm">Atur harga grosir bertingkat berdasarkan periode waktu tertentu.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Aturan</Label>
                <Input value={pricelistForm.name || ''} onChange={(e) => setPricelistForm({ ...pricelistForm, name: e.target.value })} placeholder="Contoh: Promo Grosir" className="h-12 rounded-xl border-2 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Mulai</Label>
                   <Input type="date" value={pricelistForm.startDate || ''} onChange={(e) => setPricelistForm({ ...pricelistForm, startDate: e.target.value })} className="h-12 rounded-xl border-2 font-bold text-xs" />
                </div>
                <div className="space-y-1.5">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Selesai</Label>
                   <Input type="date" value={pricelistForm.endDate || ''} onChange={(e) => setPricelistForm({ ...pricelistForm, endDate: e.target.value })} className="h-12 rounded-xl border-2 font-bold text-xs" />
                </div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex-1 space-y-8 py-4 overflow-y-auto px-6 md:px-10 scrollbar-hide">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tambahkan Produk</Label>
              <div className="flex gap-2">
                <Select value={currentSelectedProductId} onValueChange={setCurrentSelectedProductId}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold">
                    <SelectValue placeholder="Pilih Produk..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {products.filter(p => !pricelistForm.items?.some(i => i.productId === p.id)).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => {
                  if (!currentSelectedProductId) return;
                  const newItems = [...(pricelistForm.items || []), { productId: currentSelectedProductId, tiers: [] }];
                  setPricelistForm({ ...pricelistForm, items: newItems });
                  setCurrentSelectedProductId('');
                }} className="h-12 w-12 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus /></Button>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between ml-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daftar Produk Terpilih</p>
                <Badge className="bg-muted text-muted-foreground font-black text-[9px]">{pricelistForm.items?.length || 0} ITEM</Badge>
              </div>
              <div className="space-y-4">
                {pricelistForm.items?.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <Card key={idx} className="p-4 rounded-[1.5rem] border-2 border-primary/5 bg-muted/5 relative">
                      <button onClick={() => {
                        const filtered = pricelistForm.items?.filter((_, i) => i !== idx);
                        setPricelistForm({ ...pricelistForm, items: filtered });
                      }} className="absolute top-4 right-4 text-muted-foreground/30 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      <div className="flex items-center gap-3 mb-4">
                        <img src={product?.image} className="h-10 w-10 rounded-lg object-cover" alt="" />
                        <p className="font-black text-sm">{product?.name}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <Input placeholder="Qty" value={newTier.minQty} onChange={(e) => setNewTier({ ...newTier, minQty: e.target.value })} className="h-10 rounded-lg border-2 font-bold" />
                        <Input placeholder="Harga" value={newTier.price} onChange={(e) => setNewTier({ ...newTier, price: e.target.value })} className="h-10 rounded-lg border-2 font-bold" />
                        <Button onClick={() => {
                          if (!newTier.minQty || !newTier.price) return;
                          const updatedItems = [...(pricelistForm.items || [])];
                          updatedItems[idx].tiers.push({ minQty: parseInt(newTier.minQty) || 0, maxQty: 999999, price: parseFloat(newTier.price) || 0 });
                          setPricelistForm({ ...pricelistForm, items: updatedItems });
                          setNewTier({ minQty: '', price: '' });
                        }} className="h-10 rounded-lg font-black text-[10px]">TAMBAH</Button>
                      </div>
                      <div className="space-y-2">
                        {item.tiers.map((t, tIdx) => (
                          <div key={tIdx} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                            <span className="text-[10px] font-bold">Min {t.minQty} Unit: Rp {t.price.toLocaleString()}</span>
                            <button onClick={() => {
                              const updatedItems = [...(pricelistForm.items || [])];
                              updatedItems[idx].tiers = updatedItems[idx].tiers.filter((_, i) => i !== tIdx);
                              setPricelistForm({ ...pricelistForm, items: updatedItems });
                            }}><X className="h-3 w-3 text-destructive" /></button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-white border-t rounded-b-[2.5rem]">
            <Button onClick={() => {
              if (!pricelistForm.name) return;
              const newList = { id: editingPricelist?.id || Math.random().toString(36).substr(2, 9), ...pricelistForm } as PriceList;
              setPriceLists(editingPricelist ? priceLists.map(p => p.id === newList.id ? newList : p) : [...priceLists, newList]);
              setIsPricelistDialogOpen(false);
            }} className="w-full h-14 rounded-2xl bg-primary font-black text-lg">Simpan Pricelist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="text-center">
            <div className="bg-primary/10 w-20 h-20 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-6">
              <UserCog className="h-10 w-10" />
            </div>
            <DialogTitle className="text-2xl font-black">Detail Staf</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Lengkap</Label>
              <Input value={userForm.name || ''} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="h-12 rounded-xl border-2 font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                <Input value={userForm.username || ''} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} className="h-12 rounded-xl border-2 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                <Input type="password" value={userForm.password || ''} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="h-12 rounded-xl border-2 font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Role Akses</Label>
              <Select value={userForm.roleId} onValueChange={(val) => setUserForm({ ...userForm, roleId: val })}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button onClick={() => {
              if (!userForm.username || !userForm.name) return;
              const newUser = { id: editingUser?.id || Math.random().toString(36).substr(2, 9), ...userForm } as User;
              setUsers(editingUser ? users.map(u => u.id === newUser.id ? newUser : u) : [...users, newUser]);
              setIsUserDialogOpen(false);
            }} className="w-full h-14 rounded-2xl bg-primary font-black shadow-lg shadow-primary/20">Simpan User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog WITH HISTORY */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl rounded-[2.5rem] p-0 border-none shadow-2xl flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] overflow-hidden">
          <div className="p-8 md:p-10 pb-4 bg-primary/5">
            <DialogHeader className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-primary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center text-primary shadow-inner">
                  <Users className="h-12 w-12" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-3xl font-black mb-1">{editingCustomer ? 'Edit Data Pelanggan' : 'Pelanggan Baru'}</DialogTitle>
                  <DialogDescription className="font-medium text-muted-foreground">Kelola informasi profil dan tinjau riwayat belanja pelanggan.</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden p-8 md:p-10 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Profile Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3">PROFIL</Badge>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nama Lengkap</Label>
                    <Input value={customerForm.name || ''} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className="h-12 rounded-xl border-2 font-bold focus-visible:ring-primary/20" placeholder="Kiki Rizki" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nomor Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input value={customerForm.phone || ''} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className="h-12 rounded-xl border-2 font-bold pl-11 focus-visible:ring-primary/20" placeholder="081290882718" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input value={customerForm.email || ''} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} className="h-12 rounded-xl border-2 font-bold pl-11 focus-visible:ring-primary/20" placeholder="kiki@kreatifodoo.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alamat Pengiriman / Kantor</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                      <Textarea value={customerForm.address || ''} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} className="min-h-[100px] rounded-xl border-2 font-bold pl-11 py-3 focus-visible:ring-primary/20" placeholder="SOHO CAPITAL Podomoro City..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History Section */}
              <div className="flex flex-col h-full bg-muted/5 rounded-[2rem] p-6 border-2 border-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="h-4 w-4" /> Riwayat Transaksi
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-2">{customerTransactions.length} Order</Badge>
                </div>

                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-2">
                    {customerTransactions.length === 0 ? (
                      <div className="py-20 text-center opacity-30 flex flex-col items-center">
                        <PackageIcon className="h-10 w-10 mb-2" />
                        <p className="font-bold text-xs uppercase tracking-widest">Belum ada transaksi</p>
                      </div>
                    ) : (
                      customerTransactions.map((trx) => (
                        <div key={trx.id} className="p-4 bg-white rounded-2xl border shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="font-black text-xs text-primary">#{trx.id}</span>
                            <span className="text-[9px] font-bold text-muted-foreground">{format(new Date(trx.date), 'dd/MM/yy HH:mm')}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {trx.items.slice(0, 3).map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-[8px] border-primary/10 text-muted-foreground">{item.quantity}x {item.name}</Badge>
                            ))}
                            {trx.items.length > 3 && <Badge variant="outline" className="text-[8px]">+ {trx.items.length - 3}</Badge>}
                          </div>
                          <div className="flex justify-between items-center mt-1 pt-2 border-t border-dashed">
                             <div className="flex items-center gap-1.5">
                               <CreditCard className="h-3 w-3 text-muted-foreground" />
                               <span className="text-[9px] font-black uppercase text-muted-foreground">{trx.paymentMethod}</span>
                             </div>
                             <span className="font-black text-xs text-primary">{formatCurrency(trx.total)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-8 md:p-10 pt-4 bg-white border-t rounded-b-[2.5rem]">
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline"
                onClick={() => setIsCustomerDialogOpen(false)}
                className="flex-1 h-14 rounded-2xl font-bold border-2"
              >
                Batal
              </Button>
              <Button onClick={() => {
                if (!customerForm.name || !customerForm.phone) return;
                const newCust = { id: editingCustomer?.id || Math.random().toString(36).substr(2, 9).toUpperCase(), ...customerForm } as Customer;
                setCustomers(editingCustomer ? customers.map(c => c.id === newCust.id ? newCust : c) : [...customers, newCust]);
                setIsCustomerDialogOpen(false);
              }} className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20">
                Simpan Pelanggan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRestoreConfirmOpen} onOpenChange={setIsRestoreConfirmOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl text-center">
          <DialogHeader>
            <div className="bg-destructive/10 w-20 h-20 rounded-[2rem] flex items-center justify-center text-destructive mx-auto mb-6">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <DialogTitle className="text-2xl font-black">Konfirmasi Pemulihan</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground mt-2">
              Tindakan ini akan <span className="text-destructive font-black">MENGHAPUS SELURUH DATA LOKAL SAAT INI</span>.
            </DialogDescription>
          </DialogHeader>
          {isRestoring ? (
            <div className="py-10 space-y-4">
              <Progress value={undefined} className="h-2" />
              <p className="text-xs font-black text-primary animate-pulse">Memproses Basis Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 pt-6">
              <Button onClick={confirmRestore} className="h-14 rounded-2xl bg-destructive text-white font-black">Ya, Pulihkan Sekarang</Button>
              <Button variant="ghost" onClick={() => setIsRestoreConfirmOpen(false)} className="h-14 rounded-2xl font-bold">Batalkan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
