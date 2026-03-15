
"use client";

import React, { useState, useRef, useMemo } from 'react';
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
  CreditCard,
  Percent,
  Package as PackageIcon,
  Users,
  Layers,
  Upload,
  ImageIcon,
  Printer,
  Database,
  Download,
  Share2,
  Tag,
  Boxes,
  LayoutGrid,
  Ticket,
  X,
  Calendar as CalendarIcon,
  AlertTriangle,
  UserCog,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { usePOS } from './POSContext';
import { 
  Product, Customer, Permission, PriceList, Package, Combo, PromoDiscount, PriceTier, User
} from '@/types/pos';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees,
    customers, setCustomers,
    storeSettings, setStoreSettings,
    checkPermission,
    exportDatabase, importDatabase,
    priceLists, setPriceLists,
    packages, setPackages,
    combos, setCombos,
    promoDiscounts, setPromoDiscounts,
    users, setUsers, roles,
    printer, connectPrinter, disconnectPrinter
  } = usePOS();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('products');
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

  const [editingPricelist, setEditingPricelist] = useState<PriceList | null>(null);
  const [pricelistForm, setPricelistForm] = useState<Partial<PriceList>>({ items: [] });
  
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState<string>('');
  const [newTier, setNewTier] = useState<{minQty?: string, maxQty?: string, price?: string}>({ minQty: '', maxQty: '' });

  const navGroups = [
    {
      title: "Katalog & Penjualan",
      items: [
        { id: 'products', icon: PackageIcon, label: 'Master Produk', permission: 'manage_products' },
        { id: 'pricelists', icon: Tag, label: 'Pricelist (Grosir)', permission: 'manage_products' },
        { id: 'packages', icon: Boxes, label: 'Paket Produk', permission: 'manage_products' },
        { id: 'combos', icon: LayoutGrid, label: 'Combo / Pilihan', permission: 'manage_products' },
        { id: 'promos', icon: Ticket, label: 'Program Diskon', permission: 'manage_products' },
      ]
    },
    {
      title: "Sistem & Toko",
      items: [
        { id: 'general', icon: Store, label: 'Identitas Toko', permission: 'manage_settings' },
        { id: 'printer', icon: Printer, label: 'Pengaturan Printer', permission: 'manage_settings' },
        { id: 'users', icon: UserCog, label: 'Manajemen User', permission: 'manage_users' },
        { id: 'database', icon: Database, label: 'Database & Backup', permission: 'manage_settings' },
        { id: 'customers', icon: Users, label: 'Master Pelanggan', permission: 'manage_customers' },
      ]
    }
  ];

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

  const renderTabContent = () => {
    switch (activeTab) {
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
            <div className="p-6 bg-orange-50 border-2 border-orange-100 rounded-[2rem] flex gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 shrink-0" />
              <div><p className="text-xs font-black text-orange-900 uppercase tracking-widest mb-1">Peringatan Keamanan</p><p className="text-[11px] text-orange-800 leading-relaxed font-medium">Data Anda disimpan secara lokal 100% di perangkat ini. Lakukan backup secara rutin.</p></div>
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
                <div className={cn("p-6 rounded-[2rem] transition-all duration-500", printer.status === 'connected' ? "bg-green-500 text-white shadow-xl shadow-green-500/20" : "bg-white text-muted-foreground shadow-sm")}>
                  <Printer className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{printer.name || 'Printer Belum Terhubung'}</h3>
                  <Badge variant="outline" className={cn("mt-2 font-black tracking-widest text-[9px]", printer.status === 'connected' ? "bg-green-500/10 text-green-600 border-green-200" : "bg-muted text-muted-foreground border-transparent")}>
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
              <Button onClick={() => { setEditingProduct(null); setProductForm({ onHandQty: 0, price: 0, available: true }); setIsProductDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black px-4">Tambah</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/5 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="h-10 w-10 rounded-lg object-cover border" alt={p.name} />
                    <div><p className="font-black text-xs">{p.name}</p><p className="text-[10px] text-primary font-bold">Rp {p.price.toLocaleString()}</p></div>
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
              {priceLists.length === 0 && <div className="py-20 text-center opacity-30 font-bold">Belum ada aturan harga grosir.</div>}
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
        <p className="text-[10px] md:text-sm text-muted-foreground">Kelola sistem operasional Kompak POS Anda di sini.</p>
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

      {/* Dialog Master Pricelist */}
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
                <Input value={pricelistForm.name || ''} onChange={(e) => setPricelistForm({ ...pricelistForm, name: e.target.value })} placeholder="Contoh: Promo Grosir Lebaran" className="h-12 rounded-xl border-2 font-bold" />
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
          
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 space-y-8 scrollbar-hide">
            {/* Pemilihan Produk */}
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

            {/* List Produk Terpilih */}
            <div className="space-y-6">
              <div className="flex items-center justify-between ml-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daftar Produk & Tier Harga</p>
                <Badge className="bg-muted text-muted-foreground font-black text-[9px]">{pricelistForm.items?.length || 0} ITEM</Badge>
              </div>
              
              <div className="space-y-6">
                {pricelistForm.items?.map((item, idx) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <Card key={idx} className="p-6 rounded-[2rem] border-2 border-primary/5 bg-muted/5 relative group">
                      <button onClick={() => {
                        const filtered = pricelistForm.items?.filter((_, i) => i !== idx);
                        setPricelistForm({ ...pricelistForm, items: filtered });
                      }} className="absolute top-4 right-4 text-muted-foreground/30 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <img src={product?.image} className="h-12 w-12 rounded-xl object-cover shadow-sm" alt="" />
                        <div>
                          <p className="font-black text-base">{product?.name || 'Produk'}</p>
                          <p className="text-[10px] font-bold text-primary">Base: Rp {product?.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[8px] font-black text-muted-foreground ml-1">Min Qty</Label>
                            <Input placeholder="Qty" type="number" value={newTier.minQty} onChange={(e) => setNewTier({ ...newTier, minQty: e.target.value })} className="h-10 rounded-lg border-2" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[8px] font-black text-muted-foreground ml-1">Harga Khusus</Label>
                            <Input placeholder="Rp" type="number" value={newTier.price} onChange={(e) => setNewTier({ ...newTier, price: e.target.value })} className="h-10 rounded-lg border-2" />
                          </div>
                          <div className="flex items-end">
                            <Button onClick={() => {
                              if (!newTier.minQty || !newTier.price) return;
                              const updatedItems = [...(pricelistForm.items || [])];
                              updatedItems[idx].tiers.push({ minQty: parseInt(newTier.minQty), maxQty: 999999, price: parseFloat(newTier.price) });
                              setPricelistForm({ ...pricelistForm, items: updatedItems });
                              setNewTier({ minQty: '', price: '' });
                            }} variant="outline" className="h-10 w-full rounded-lg border-2 font-black text-[10px] text-primary">TAMBAH TIER</Button>
                          </div>
                        </div>

                        {item.tiers.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {item.tiers.map((t, tIdx) => (
                              <div key={tIdx} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-primary/5">
                                <div className="flex items-center gap-4">
                                  <Badge className="bg-primary/10 text-primary font-black text-[9px]">MIN {t.minQty} UNIT</Badge>
                                  <span className="font-black text-sm">Rp {t.price.toLocaleString()}</span>
                                </div>
                                <button onClick={() => {
                                  const updatedItems = [...(pricelistForm.items || [])];
                                  updatedItems[idx].tiers = updatedItems[idx].tiers.filter((_, i) => i !== tIdx);
                                  setPricelistForm({ ...pricelistForm, items: updatedItems });
                                }} className="text-muted-foreground/30 hover:text-destructive"><X className="h-4 w-4" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 md:p-10 pt-4 bg-white border-t rounded-b-[2.5rem]">
            <Button onClick={() => {
              if (!pricelistForm.name) return;
              const newList = { id: editingPricelist?.id || Math.random().toString(36).substr(2, 9), ...pricelistForm } as PriceList;
              setPriceLists(editingPricelist ? priceLists.map(p => p.id === newList.id ? newList : p) : [...priceLists, newList]);
              setIsPricelistDialogOpen(false);
            }} className="w-full h-16 rounded-2xl bg-primary font-black text-lg shadow-xl shadow-primary/20">Simpan Pricelist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog User */}
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
      
      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreConfirmOpen} onOpenChange={setIsRestoreConfirmOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="text-center">
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
              <p className="text-center text-xs font-black text-primary animate-pulse uppercase tracking-widest">Memproses Basis Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 pt-6">
              <Button onClick={confirmRestore} className="h-16 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black text-lg">Ya, Pulihkan Sekarang</Button>
              <Button variant="ghost" onClick={() => setIsRestoreConfirmOpen(false)} className="h-14 rounded-2xl font-bold">Batalkan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

