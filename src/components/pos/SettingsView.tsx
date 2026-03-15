
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
  AlertTriangle
} from 'lucide-react';
import { usePOS } from './POSContext';
import { 
  Product, Customer, Permission, PriceList, Package, Combo, PromoDiscount, PriceTier
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
    promoDiscounts, setPromoDiscounts
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

  // Form States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [editingPricelist, setEditingPricelist] = useState<PriceList | null>(null);
  const [pricelistForm, setPricelistForm] = useState<Partial<PriceList>>({ items: [] });
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState<string>('');
  const [activeItemTiers, setActiveItemTiers] = useState<PriceTier[]>([]);
  const [newTier, setNewTier] = useState<{minQty?: number, maxQty?: number, price?: number}>({ minQty: 1, maxQty: 999 });

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
                <div className="p-5 bg-white rounded-[1.5rem] shadow-sm text-primary">
                  <Download className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Ekspor Database</h3>
                  <p className="text-xs font-medium text-muted-foreground mt-2">Unduh seluruh data (Produk, Transaksi, Sesi) sebagai cadangan lokal.</p>
                </div>
                <Button onClick={handleBackup} className="w-full h-14 rounded-2xl bg-primary font-black shadow-xl shadow-primary/20 gap-3">
                  Unduh Cadangan (.json)
                </Button>
              </Card>

              <Card className="rounded-[2rem] p-8 border-2 border-dashed flex flex-col items-center text-center gap-6">
                <div className="p-5 bg-muted/20 rounded-[1.5rem] text-muted-foreground">
                  <Share2 className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Impor & Pulihkan</h3>
                  <p className="text-xs font-medium text-muted-foreground mt-2">Unggah file cadangan untuk memulihkan data dari perangkat lain.</p>
                </div>
                <label className="w-full">
                  <Input type="file" className="hidden" accept=".json" onChange={handleFileImport} />
                  <div className="w-full h-14 rounded-2xl border-2 flex items-center justify-center font-black cursor-pointer hover:bg-muted/10 transition-all">
                    Pilih File Backup
                  </div>
                </label>
              </Card>
            </div>

            <div className="p-6 bg-orange-50 border-2 border-orange-100 rounded-[2rem] flex gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-orange-900 uppercase tracking-widest mb-1">Peringatan Keamanan</p>
                <p className="text-[11px] text-orange-800 leading-relaxed font-medium">Data Anda disimpan secara lokal 100% di perangkat ini. Jika Anda menghapus cache browser atau mengganti perangkat tanpa cadangan, data akan hilang secara permanen. Lakukan backup secara rutin.</p>
              </div>
            </div>
          </div>
        );
      
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black">Master Produk</CardTitle>
              <Button onClick={() => { setEditingProduct(null); setProductForm({ onHandQty: 0, price: 0 }); setIsProductDialogOpen(true); }} className="h-10 rounded-xl bg-primary font-black px-4">Tambah</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="h-10 w-10 rounded-lg object-cover border" alt={p.name} />
                    <div><p className="font-black text-xs">{p.name}</p><p className="text-[10px] text-primary font-bold">Rp {p.price.toLocaleString()}</p></div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // Other tabs would be implemented similarly using local db hooks...
      default:
        return <div className="py-20 text-center opacity-30 font-bold">Pilih kategori pengaturan.</div>;
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl md:text-2xl font-black">Pengaturan Enterprise</h2>
        <p className="text-[10px] md:text-sm text-muted-foreground">Sistem POS Mandiri - Terisolasi Penuh di Perangkat.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        <aside className="w-full lg:w-64 bg-white rounded-[2rem] p-3 shadow-sm border overflow-x-auto flex lg:flex-col gap-2 scrollbar-hide">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex lg:flex-col gap-1 shrink-0">
              <p className="hidden lg:block px-3 text-[8px] font-black uppercase tracking-widest text-muted-foreground my-2">{group.title}</p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[10px] md:text-xs",
                    activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="flex-1 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border min-h-[500px]">
          {renderTabContent()}
        </main>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreConfirmOpen} onOpenChange={setIsRestoreConfirmOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="text-center">
            <div className="bg-destructive/10 w-20 h-20 rounded-[2rem] flex items-center justify-center text-destructive mx-auto mb-6">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <DialogTitle className="text-2xl font-black">Konfirmasi Pemulihan</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground mt-2">
              Tindakan ini akan <span className="text-destructive font-black">MENGHAPUS SELURUH DATA LOKAL SAAT INI</span> dan menggantinya dengan data dari file cadangan. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          
          {isRestoring ? (
            <div className="py-10 space-y-4">
              <Progress value={undefined} className="h-2" />
              <p className="text-center text-xs font-black text-primary animate-pulse uppercase tracking-widest">Memproses Basis Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 pt-6">
              <Button onClick={confirmRestore} className="h-16 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black text-lg">
                Ya, Pulihkan Sekarang
              </Button>
              <Button variant="ghost" onClick={() => setIsRestoreConfirmOpen(false)} className="h-14 rounded-2xl font-bold">
                Batalkan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
