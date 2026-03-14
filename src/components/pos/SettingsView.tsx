
"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  Plus, 
  Trash2, 
  Pencil,
  CreditCard,
  Percent,
  Package as PackageIcon,
  Users,
  Tags,
  Layers,
  Box,
  LayoutGrid,
  ChevronRight,
  Check,
  Ticket,
  Upload,
  Download,
  Image as ImageIcon,
  UserCog,
  ShieldCheck,
  Mail,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Database,
  RefreshCw,
  FileJson
} from 'lucide-react';
import { usePOS } from './POSContext';
import { 
  Product, PaymentMethod, Fee, Customer, PriceList, Package, 
  PackageItem, Combo, ComboGroup, ComboOption, PromoDiscount, 
  StoreSettings, User, Role, Permission 
} from '@/types/pos';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SettingsView() {
  const { 
    products, setProducts, 
    categories, setCategories, 
    paymentMethods, setPaymentMethods,
    fees, setFees,
    customers, setCustomers,
    priceLists, setPriceLists,
    packages, setPackages,
    combos, setCombos,
    promoDiscounts, setPromoDiscounts,
    storeSettings, setStoreSettings,
    users, setUsers,
    roles, currentUser, checkPermission,
    exportDatabase, importDatabase
  } = usePOS();
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const dbImportRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'products' | 'pricelist' | 'promo' | 'package' | 'combo' | null>(null);

  const [activeTab, setActiveTab] = useState('general');

  const navGroups = useMemo(() => {
    const groups = [
      {
        title: "Produk",
        items: [
          { id: 'products', icon: PackageIcon, label: 'Master Produk', permission: 'manage_products' as Permission },
          { id: 'pricelist', icon: Tags, label: 'Daftar Harga Grosir', permission: 'manage_products' as Permission },
          { id: 'promo', icon: Ticket, label: 'Promo Diskon', permission: 'manage_products' as Permission },
          { id: 'package', icon: Box, label: 'Paket Bundel', permission: 'manage_products' as Permission },
          { id: 'combo', icon: LayoutGrid, label: 'Pilihan Menu', permission: 'manage_products' as Permission },
        ].filter(item => checkPermission(item.permission))
      },
      {
        title: "Sistem",
        items: [
          { id: 'general', icon: Store, label: 'Informasi Toko', permission: 'manage_settings' as Permission },
          { id: 'backup', icon: Database, label: 'Backup & Restore', permission: 'manage_settings' as Permission },
          { id: 'users', icon: UserCog, label: 'Manajemen User', permission: 'manage_users' as Permission },
          { id: 'customers', icon: Users, label: 'Data Pelanggan', permission: 'manage_customers' as Permission },
          { id: 'categories', icon: Layers, label: 'Kategori Produk', permission: 'manage_settings' as Permission },
          { id: 'payments', icon: CreditCard, label: 'Metode Pembayaran', permission: 'manage_settings' as Permission },
          { id: 'fees', icon: Percent, label: 'Pajak & Biaya', permission: 'manage_settings' as Permission },
        ].filter(item => checkPermission(item.permission))
      }
    ];
    return groups.filter(g => g.items.length > 0);
  }, [checkPermission]);

  useEffect(() => {
    // Ensure activeTab is a valid permitted tab
    const allPermittedIds = navGroups.flatMap(g => g.items.map(i => i.id));
    if (allPermittedIds.length > 0 && !allPermittedIds.includes(activeTab)) {
      setActiveTab(allPermittedIds[0]);
    }
  }, [navGroups, activeTab]);

  const [packageSearch, setPackageSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [comboSearch, setComboSearch] = useState('');

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPriceListDialogOpen, setIsPriceListDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isComboDialogOpen, setIsComboDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);
  const [priceListForm, setPriceListForm] = useState<Partial<PriceList>>({ tiers: [] });
  const [editingPromo, setEditingPromo] = useState<PromoDiscount | null>(null);
  const [promoForm, setPromoForm] = useState<Partial<PromoDiscount>>({});
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState<Partial<Package>>({ items: [] });
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [comboForm, setComboForm] = useState<Partial<Combo>>({ groups: [] });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState('');
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({});
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [feeForm, setFeeForm] = useState<Partial<Fee>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>({});
  
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = useMemo(() => checkPermission('manage_users'), [checkPermission]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleBackup = () => {
    exportDatabase();
    toast({ title: "Backup Berhasil", description: "Database telah diekspor ke file JSON." });
  };

  const handleDbFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importDatabase(json);
      if (success) {
        toast({ title: "Restore Berhasil", description: "Database aplikasi telah diperbarui." });
      } else {
        toast({ variant: "destructive", title: "Restore Gagal", description: "Format file tidak valid." });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadTemplate = (type: string) => {
    let headers: string[] = [];
    let sampleData: string[] = [];
    let fileName = `Template_${type}.csv`;

    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (type) {
      case 'products':
        headers = ["sku", "barcode", "name", "price", "costPrice", "category", "image", "onHandQty", "description"];
        sampleData = ["BRG-001", "12345678", "Nasi Goreng", "25000", "12000", "Makanan Utama", "https://picsum.photos/seed/1/400/300", "100", "Deskripsi produk"];
        break;
      case 'pricelist':
        headers = ["name", "productSku", "startDate", "endDate", "minQty", "maxQty", "price", "enabled"];
        sampleData = ["Harga Grosir", "BRG-001", today, nextMonth, "5", "999", "22000", "true"];
        break;
      case 'promo':
        headers = ["name", "productSku", "type", "value", "startDate", "endDate", "enabled"];
        sampleData = ["Promo Merdeka", "BRG-001", "Percentage", "10", today, nextMonth, "true"];
        break;
      case 'package':
        headers = ["sku", "name", "description", "price", "enabled", "items(sku1:qty1|sku2:qty2)"];
        sampleData = ["PKG-001", "Paket Hemat", "Nasi + Teh", "28000", "true", "BRG-001:1|MN-001:1"];
        break;
      case 'combo':
        headers = ["sku", "name", "description", "basePrice", "enabled", "groups(name:required:sku:extra;sku:extra|name2...)"];
        sampleData = ["CMB-001", "Combo Puas", "Pilih menu favorit", "30000", "true", "Pilih Minum:true:MN-001:0;MN-002:2500|Pilih Camilan:false:CM-001:0"];
        break;
    }

    const csvContent = headers.join(",") + "\n" + sampleData.join(",");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importType) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split("\n").map(row => row.split(","));
        const headers = rows[0].map(h => h.trim().toLowerCase());
        const dataRows = rows.slice(1).filter(row => row.length === headers.length);

        const parsedData = dataRows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            let val = row[index]?.trim();
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(Number(val)) && val !== '') val = Number(val);
            obj[header] = val;
          });
          return obj;
        });

        switch (importType) {
          case 'products':
            const newProducts = parsedData.map(d => ({
              id: Math.random().toString(36).substr(2, 9),
              sku: d.sku || '',
              barcode: d.barcode || '',
              name: d.name || 'Produk',
              price: Number(d.price) || 0,
              costPrice: Number(d.costprice) || 0,
              category: d.category || 'Semua',
              image: d.image || 'https://picsum.photos/seed/default/400/300',
              onHandQty: Number(d.onhandqty) || 0,
              description: d.description || '',
              available: true
            }));
            setProducts([...products, ...newProducts]);
            break;
          case 'pricelist':
            const newPriceLists = parsedData.map(d => {
              const product = products.find(p => p.sku === d.productsku);
              return {
                id: Math.random().toString(36).substr(2, 9),
                name: d.name || 'Promo',
                productId: product?.id || '',
                startDate: d.startdate || '',
                endDate: d.enddate || '',
                enabled: d.enabled === true,
                tiers: [{ minQty: Number(d.minqty) || 1, maxQty: Number(d.maxqty) || 999, price: Number(d.price) || 0 }]
              };
            });
            setPriceLists([...priceLists, ...newPriceLists]);
            break;
          case 'promo':
            const newPromos = parsedData.map(d => {
              const product = products.find(p => p.sku === d.productsku);
              return {
                id: Math.random().toString(36).substr(2, 9),
                productId: product?.id || '',
                name: d.name || 'Diskon',
                type: d.type === 'Percentage' ? 'Percentage' : 'FixedAmount',
                value: Number(d.value) || 0,
                startDate: d.startdate || '',
                endDate: d.enddate || '',
                enabled: d.enabled === true
              };
            });
            setPromoDiscounts([...promoDiscounts, ...newPromos]);
            break;
          case 'package':
            const newPackages = parsedData.map(d => {
              const itemParts = (d['items(sku1:qty1|sku2:qty2)'] || '').split('|');
              const items = itemParts.map((part: string) => {
                const [sku, qty] = part.split(':');
                const product = products.find(p => p.sku === sku);
                return { productId: product?.id || '', quantity: Number(qty) || 1 };
              }).filter((i: any) => i.productId !== '');

              return {
                id: Math.random().toString(36).substr(2, 9),
                sku: d.sku || '',
                name: d.name || '',
                description: d.description || '',
                price: Number(d.price) || 0,
                enabled: d.enabled === true,
                items
              };
            });
            setPackages([...packages, ...newPackages]);
            break;
          case 'combo':
            const newCombos = parsedData.map(d => {
              const groupParts = (d['groups(name:required:sku:extra;sku:extra|name2...)'] || '').split('|');
              const groups = groupParts.map((gPart: string) => {
                const parts = gPart.split(':');
                const gName = parts[0];
                const req = parts[1];
                const optParts = parts.slice(2);
                
                const options = optParts.join(':').split(';').map(oPart => {
                  const [sku, extra] = oPart.split(':');
                  const product = products.find(p => p.sku === sku);
                  return { productId: product?.id || '', extraPrice: Number(extra) || 0 };
                }).filter(o => o.productId !== '');

                return {
                  id: Math.random().toString(36).substr(2, 5),
                  name: gName || 'Grup',
                  required: req === 'true',
                  options
                };
              });

              return {
                id: Math.random().toString(36).substr(2, 9),
                sku: d.sku || '',
                name: d.name || '',
                description: d.description || '',
                basePrice: Number(d.baseprice) || 0,
                enabled: d.enabled === true,
                groups
              };
            });
            setCombos([...combos, ...newCombos]);
            break;
        }

        toast({
          title: "Import Berhasil",
          description: `${parsedData.length} data telah ditambahkan ke sistem.`,
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Gagal Impor",
          description: "Kesalahan pemrosesan file CSV.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportClick = (type: 'products' | 'pricelist' | 'promo' | 'package' | 'combo') => {
    setImportType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setStoreSettings({ ...storeSettings, logoUrl: dataUrl });
      toast({ title: "Logo Berhasil Diunggah" });
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm('');
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Nama kategori tidak boleh kosong." });
      return;
    }
    if (editingCategory) {
      setCategories(categories.map(cat => cat === editingCategory ? categoryForm : cat));
      setProducts(products.map(p => p.category === editingCategory ? { ...p, category: categoryForm } : p));
    } else {
      if (categories.includes(categoryForm)) {
        toast({ variant: "destructive", title: "Error", description: "Kategori sudah ada." });
        return;
      }
      setCategories([...categories, categoryForm]);
    }
    setIsCategoryDialogOpen(false);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (catToDelete === 'Semua') return;
    setCategories(categories.filter(c => c !== catToDelete));
    setIsCategoryDialogOpen(false);
  };

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({ name: '', icon: 'CreditCard', description: '', enabled: true });
    setIsPaymentDialogOpen(true);
  };

  const handleSavePayment = () => {
    if (!paymentForm.name) return;
    if (editingPayment) {
      setPaymentMethods(paymentMethods.map(pm => pm.id === editingPayment.id ? { ...editingPayment, ...paymentForm } as PaymentMethod : pm));
    } else {
      const newPm: PaymentMethod = {
        id: Math.random().toString(36).substr(2, 9),
        ...paymentForm as PaymentMethod
      };
      setPaymentMethods([...paymentMethods, newPm]);
    }
    setIsPaymentDialogOpen(false);
  };

  const handleOpenAddFee = () => {
    setEditingFee(null);
    setFeeForm({ name: '', type: 'Tax', value: 0, enabled: true });
    setIsFeeDialogOpen(true);
  };

  const handleSaveFee = () => {
    if (!feeForm.name) return;
    if (editingFee) {
      setFees(fees.map(f => f.id === editingFee.id ? { ...editingFee, ...feeForm } as Fee : f));
    } else {
      const newFee: Fee = {
        id: Math.random().toString(36).substr(2, 9),
        ...feeForm as Fee
      };
      setFees([...fees, newFee]);
    }
    setIsFeeDialogOpen(false);
  };

  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({ name: '', sku: '', description: '', price: '' as any, enabled: true, items: [] });
    setIsPackageDialogOpen(true);
  };

  const handleSavePackage = () => {
    if (!packageForm.name || !packageForm.sku || !packageForm.price) return;
    if (editingPackage) {
      setPackages(packages.map(p => p.id === editingPackage.id ? { ...editingPackage, ...packageForm } as Package : p));
    } else {
      setPackages([...packages, { id: Math.random().toString(36).substr(2, 9), ...packageForm as Package }]);
    }
    setIsPackageDialogOpen(false);
  };

  const addPackageItem = () => setPackageForm(prev => ({ ...prev, items: [...(prev.items || []), { productId: products[0]?.id || '', quantity: 1 }] }));
  const removePackageItem = (idx: number) => setPackageForm(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== idx) }));
  const updatePackageItem = (idx: number, field: keyof PackageItem, value: any) => setPackageForm(prev => {
    const newItems = [...(prev.items || [])];
    newItems[idx] = { ...newItems[idx], [field]: value };
    return { ...prev, items: newItems };
  });

  const handleOpenAddCombo = () => {
    setEditingCombo(null);
    setComboForm({ name: '', sku: '', description: '', basePrice: '' as any, enabled: true, groups: [] });
    setIsComboDialogOpen(true);
  };

  const handleSaveCombo = () => {
    if (!comboForm.name || !comboForm.sku || !comboForm.basePrice) return;
    if (editingCombo) {
      setCombos(combos.map(c => c.id === editingCombo.id ? { ...editingCombo, ...comboForm } as Combo : c));
    } else {
      setCombos([...combos, { id: Math.random().toString(36).substr(2, 9), ...comboForm as Combo }]);
    }
    setIsComboDialogOpen(false);
  };

  const addComboGroup = () => setComboForm(prev => ({ ...prev, groups: [...(prev.groups || []), { id: Math.random().toString(36).substr(2, 5), name: '', required: true, options: [] }] }));
  const removeComboGroup = (gIdx: number) => setComboForm(prev => ({ ...prev, groups: prev.groups?.filter((_, i) => i !== gIdx) }));
  const updateComboGroup = (gIdx: number, field: keyof ComboGroup, value: any) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx] = { ...newGroups[gIdx], [field]: value };
    return { ...prev, groups: newGroups };
  });

  const addComboOption = (gIdx: number) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx].options = [...newGroups[gIdx].options, { productId: products[0]?.id || '', extraPrice: 0 }];
    return { ...prev, groups: newGroups };
  });

  const removeComboOption = (gIdx: number, oIdx: number) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx].options = newGroups[gIdx].options.filter((_, i) => i !== oIdx);
    return { ...prev, groups: newGroups };
  });

  const updateComboOption = (gIdx: number, oIdx: number, field: keyof ComboOption, value: any) => setComboForm(prev => {
    const newGroups = [...(prev.groups || [])];
    newGroups[gIdx].options[oIdx] = { ...newGroups[gIdx].options[oIdx], [field]: value };
    return { ...prev, groups: newGroups };
  });

  const handleOpenAddPriceList = () => {
    setEditingPriceList(null);
    setPriceListForm({ 
      name: '', productId: products[0]?.id || '', 
      startDate: new Date().toISOString().split('T')[0], 
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tiers: [{ minQty: 1, maxQty: 10, price: 0 }],
      enabled: true 
    });
    setIsPriceListDialogOpen(true);
  };

  const handleSavePriceList = () => {
    if (!priceListForm.name || !priceListForm.productId) return;
    if (editingPriceList) setPriceLists(priceLists.map(pl => pl.id === editingPriceList.id ? { ...editingPriceList, ...priceListForm } as PriceList : pl));
    else setPriceLists([...priceLists, { id: Math.random().toString(36).substr(2, 9), ...priceListForm as PriceList }]);
    setIsPriceListDialogOpen(false);
  };

  const handleOpenAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      name: '',
      productId: products[0]?.id || '',
      type: 'Percentage',
      value: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      enabled: true
    });
    setIsPromoDialogOpen(true);
  };

  const handleSavePromo = () => {
    if (!promoForm.name || !promoForm.productId) return;
    if (editingPromo) setPromoDiscounts(promoDiscounts.map(pd => pd.id === editingPromo.id ? { ...editingPromo, ...promoForm } as PromoDiscount : pd));
    else setPromoDiscounts([...promoDiscounts, { id: Math.random().toString(36).substr(2, 9), ...promoForm as PromoDiscount }]);
    setIsPromoDialogOpen(false);
  };

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({ name: '', phone: '', email: '', address: '' });
    setIsCustomerDialogOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!customerForm.name || !customerForm.phone) return;
    if (editingCustomer) setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } as Customer : c));
    else setCustomers([...customers, { id: Math.random().toString(36).substr(2, 9), ...customerForm as Customer }]);
    setIsCustomerDialogOpen(false);
  };

  const handleOpenAddUser = () => {
    if (!isAdmin) {
      toast({ variant: "destructive", title: "Akses Ditolak", description: "Hanya Administrator yang dapat menambah user." });
      return;
    }
    setEditingUser(null);
    setUserForm({ name: '', username: '', email: '', roleId: 'cashier', status: 'Active', avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100` });
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.username) return;
    if (editingUser) setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...userForm } as User : u));
    else setUsers([...users, { id: Math.random().toString(36).substr(2, 9), ...userForm as User }]);
    setIsUserDialogOpen(false);
    toast({ title: "User Berhasil Disimpan" });
  };

  const handleOpenResetPassword = (user: User) => {
    if (!isAdmin) {
      toast({ variant: "destructive", title: "Akses Ditolak", description: "Hanya Administrator yang dapat me-reset password." });
      return;
    }
    setResetPasswordUser(user);
    setNewPassword('');
    setShowPassword(false);
    setIsResetPasswordOpen(true);
  };

  const handleConfirmResetPassword = () => {
    if (!newPassword || !resetPasswordUser) return;
    setUsers(users.map(u => u.id === resetPasswordUser.id ? { ...u, password: newPassword } : u));
    setIsResetPasswordOpen(false);
    toast({ title: "Password Berhasil Di-reset", description: `Password untuk ${resetPasswordUser.name} telah diperbarui.` });
  };

  const handleValueChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setter(val === '' ? '' : parseFloat(val));
  };

  const filteredPackages = packages.filter(p => p.name.toLowerCase().includes(packageSearch.toLowerCase()) || p.sku.toLowerCase().includes(packageSearch.toLowerCase()));
  const filteredCombos = combos.filter(c => c.name.toLowerCase().includes(comboSearch.toLowerCase()) || c.sku.toLowerCase().includes(comboSearch.toLowerCase()));
  const filteredCategories = categories.filter(c => c !== 'Semua' && c.toLowerCase().includes(categorySearch.toLowerCase()));

  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard />;
      case 'Smartphone': return <Smartphone />;
      case 'Banknote': return <Banknote />;
      default: return <CreditCard />;
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
      <input type="file" ref={dbImportRef} className="hidden" accept=".json" onChange={handleDbFileSelect} />
      
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola konfigurasi POS dan data master Anda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-72 bg-white rounded-[2rem] p-4 shadow-sm border border-muted/50">
          <div className="space-y-8">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">{group.title}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                        activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      {activeTab === item.id && <ChevronRight className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 w-full min-h-[600px]">
          {activeTab === 'general' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <SettingsSection icon={Store} title="Informasi Toko" description="Detail dasar tentang usaha Anda">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Nama Toko</Label>
                      <Input value={storeSettings.name} onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})} className="h-12 rounded-xl border-2" />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Alamat Toko</Label>
                      <Textarea value={storeSettings.address} onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})} className="min-h-[100px] rounded-xl border-2" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground ml-1">Logo Toko</Label>
                      <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-[2rem] bg-muted/10">
                        {storeSettings.logoUrl ? (
                          <div className="relative h-32 w-32 rounded-2xl overflow-hidden border bg-white shadow-sm">
                            <img src={storeSettings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                            <button onClick={() => setStoreSettings({...storeSettings, logoUrl: ''})} className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        ) : <div className="h-32 w-32 rounded-2xl bg-white border flex items-center justify-center opacity-20"><ImageIcon /></div>}
                        <Button onClick={() => logoInputRef.current?.click()} variant="outline" className="h-10 rounded-xl font-bold gap-2"><Upload className="h-4 w-4" /> Pilih Logo</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div><CardTitle className="text-2xl font-black">Manajemen User</CardTitle><CardDescription className="font-medium">Kelola akses staf dan hak istimewa role</CardDescription></div>
                {isAdmin && <Button onClick={handleOpenAddUser} className="h-14 rounded-2xl bg-primary font-black px-8 gap-3 shadow-lg"><Plus className="h-5 w-5" /> Tambah User</Button>}
              </div>
              <div className="space-y-4">
                {users.map((user) => {
                  const role = roles.find(r => r.id === user.roleId);
                  return (
                    <div key={user.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem]">
                      <div className="flex items-center gap-5">
                        <Avatar className="h-14 w-14 rounded-2xl border shadow-sm">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="bg-primary text-white font-black">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-lg">{user.name} <Badge className="bg-primary/10 text-primary border-none ml-2">{role?.name}</Badge></p>
                          <p className="text-xs font-bold text-muted-foreground mt-1">@{user.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenResetPassword(user)}><Lock className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setUserForm(user); setIsUserDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setUsers(users.filter(u => u.id !== user.id))}><Trash2 className="h-5 w-5" /></Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-12" />
              <div className="space-y-6">
                <h3 className="text-lg font-black flex items-center gap-3"><ShieldCheck className="text-primary" /> Informasi Hak Akses Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {roles.map(role => (
                    <div key={role.id} className="p-6 bg-muted/20 rounded-[2rem] space-y-4">
                      <p className="font-black text-primary uppercase tracking-widest text-xs">{role.name}</p>
                      <ul className="space-y-2">
                        {role.permissions.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"><Check className="h-3 w-3 text-green-500" /> {p.replace('_', ' ')}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
          
          {activeTab === 'products' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Master Produk</CardTitle><CardDescription className="font-medium">Kelola item dan stok inventaris</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDownloadTemplate('products')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Download className="h-5 w-5" /> Template</Button>
                  <Button variant="outline" onClick={() => handleImportClick('products')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Impor CSV</Button>
                  <Button onClick={() => { setEditingProduct(null); setProductForm({ onHandQty: '' as any, price: '' as any, costPrice: '' as any }); setIsProductDialogOpen(true); }} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Produk</Button>
                </div>
              </div>
              <div className="space-y-4">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-5 bg-muted/10 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border shadow-sm"><img src={p.image} className="h-full w-full object-cover" alt={p.name} /></div>
                      <div><p className="font-black text-lg leading-tight">{p.name}</p><div className="flex gap-2 items-center mt-1"><span className="text-primary font-black text-sm">{formatCurrency(p.price)}</span><Badge variant="outline" className="text-[9px] font-bold px-2 py-0">{p.sku}</Badge></div></div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setProductForm(p); setIsProductDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setProducts(products.filter(item => item.id !== p.id))}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'pricelist' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Daftar Harga Grosir</CardTitle><CardDescription className="font-medium">Harga bertingkat berdasarkan kuantitas</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDownloadTemplate('pricelist')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Download className="h-5 w-5" /> Template</Button>
                  <Button variant="outline" onClick={() => handleImportClick('pricelist')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Impor CSV</Button>
                  <Button onClick={handleOpenAddPriceList} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Buat Daftar Harga</Button>
                </div>
              </div>
              <div className="space-y-4">
                {priceLists.map((pl) => (
                  <div key={pl.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><Tags /></div>
                      <div><p className="font-black text-lg leading-tight">{pl.name}</p><p className="text-xs font-bold text-muted-foreground mt-1">{products.find(p => p.id === pl.productId)?.name} • {pl.startDate} s/d {pl.endDate}</p></div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Badge className={cn("rounded-lg px-3 py-1 font-black text-[9px]", pl.enabled ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground')}>{pl.enabled ? 'AKTIF' : 'NON-AKTIF'}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPriceList(pl); setPriceListForm(pl); setIsPriceListDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'promo' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Promo Diskon</CardTitle><CardDescription className="font-medium">Diskon langsung per produk</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDownloadTemplate('promo')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Download className="h-5 w-5" /> Template</Button>
                  <Button variant="outline" onClick={() => handleImportClick('promo')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Impor CSV</Button>
                  <Button onClick={handleOpenAddPromo} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Buat Promo</Button>
                </div>
              </div>
              <div className="space-y-4">
                {promoDiscounts.map((pd) => (
                  <div key={pd.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl text-primary border shadow-sm"><Ticket /></div>
                      <div>
                        <p className="font-black text-lg leading-tight">{pd.name}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">
                          {products.find(p => p.id === pd.productId)?.name} • {pd.type === 'Percentage' ? `${pd.value}% Potongan` : `${formatCurrency(pd.value)} Potongan`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Badge className={cn("rounded-lg px-3 py-1 font-black text-[9px]", pd.enabled ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground')}>{pd.enabled ? 'AKTIF' : 'NON-AKTIF'}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingPromo(pd); setPromoForm(pd); setIsPromoDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPromoDiscounts(promoDiscounts.filter(item => item.id !== pd.id))}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'package' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Paket Bundel</CardTitle><CardDescription className="font-medium">Kelola paket hemat produk</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDownloadTemplate('package')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Download className="h-5 w-5" /> Template</Button>
                  <Button variant="outline" onClick={() => handleImportClick('package')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Impor CSV</Button>
                  <Button onClick={handleOpenAddPackage} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Paket</Button>
                </div>
              </div>
              <div className="rounded-[1.5rem] border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead className="font-black">Nama Paket</TableHead><TableHead className="font-black">SKU</TableHead><TableHead className="font-black">Harga Jual</TableHead><TableHead className="font-black">Status</TableHead><TableHead className="text-right font-black">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-bold">{pkg.name}</TableCell>
                        <TableCell><Badge variant="outline">{pkg.sku}</Badge></TableCell>
                        <TableCell className="font-black text-primary">{formatCurrency(pkg.price)}</TableCell>
                        <TableCell><Switch checked={pkg.enabled} onCheckedChange={(val) => setPackages(packages.map(p => p.id === pkg.id ? { ...p, enabled: val } : p))} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingPackage(pkg); setPackageForm(pkg); setIsPackageDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setPackages(packages.filter(p => p.id !== pkg.id))}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {activeTab === 'combo' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div><CardTitle className="text-2xl font-black">Pilihan Menu (Combo)</CardTitle><CardDescription className="font-medium">Set menu dengan pilihan fleksibel</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDownloadTemplate('combo')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Download className="h-5 w-5" /> Template</Button>
                  <Button variant="outline" onClick={() => handleImportClick('combo')} className="h-14 rounded-2xl border-2 font-black px-6 gap-2 shadow-sm"><Upload className="h-5 w-5" /> Impor CSV</Button>
                  <Button onClick={handleOpenAddCombo} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Pilihan</Button>
                </div>
              </div>
              <div className="rounded-[1.5rem] border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50"><TableRow><TableHead className="font-black">Nama Pilihan</TableHead><TableHead className="font-black">Harga Dasar</TableHead><TableHead className="font-black">Status</TableHead><TableHead className="text-right font-black">Aksi</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredCombos.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold">{c.name}</TableCell>
                        <TableCell className="font-black text-primary">{formatCurrency(c.basePrice)}</TableCell>
                        <TableCell><Switch checked={c.enabled} onCheckedChange={(val) => setCombos(combos.map(item => item.id === c.id ? { ...item, enabled: val } : item))} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingCombo(c); setComboForm(c); setIsComboDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setCombos(combos.filter(item => item.id !== c.id))}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {activeTab === 'customers' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm p-8 bg-white h-full">
              <div className="flex justify-between items-center mb-8">
                <div><CardTitle className="text-2xl font-black">Data Pelanggan</CardTitle><CardDescription className="font-medium">Pantau daftar pelanggan Anda</CardDescription></div>
                <Button onClick={handleOpenAddCustomer} className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black px-8 gap-3 shadow-lg shadow-primary/20"><Plus className="h-5 w-5" /> Tambah Pelanggan</Button>
              </div>
              <div className="space-y-4">
                {customers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-6 bg-muted/10 rounded-[2rem]">
                    <div className="flex items-center gap-5"><div className="bg-white p-4 rounded-2xl text-primary shadow-sm border"><Users /></div><div><p className="font-black text-lg leading-tight">{c.name}</p><p className="text-xs font-bold text-muted-foreground mt-1">{c.phone}</p></div></div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(c); setCustomerForm(c); setIsCustomerDialogOpen(true); }}><Pencil className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive/50" onClick={() => setCustomers(customers.filter(cust => cust.id !== c.id))}><Trash2 className="h-5 w-5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Missing Payment/Fee Tabs if they become the active tab but are hidden in sidebar filter - though our useEffect handles redirection */}
        </div>
      </div>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10 border-none shadow-2xl">
          <DialogHeader className="mb-6"><DialogTitle className="text-3xl font-black">{editingUser ? 'Edit User' : 'Tambah User'}</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="flex justify-center mb-4"><Avatar className="h-24 w-24 rounded-3xl border-4 border-primary/10"><AvatarImage src={userForm.avatarUrl} /><AvatarFallback className="bg-primary text-white text-2xl font-black rounded-3xl">{userForm.name?.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Nama Lengkap</Label><Input value={userForm.name || ''} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
              <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Username</Label><Input value={userForm.username || ''} onChange={(e) => setUserForm({...userForm, username: e.target.value})} className="h-12 rounded-xl border-2" /></div>
            </div>
            {!editingUser && <div className="space-y-2"><Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Password Awal</Label><Input type="password" value={userForm.password || ''} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="h-12 rounded-xl border-2" /></div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Role</Label>
                <Select value={userForm.roleId} onValueChange={(val: any) => setUserForm({...userForm, roleId: val})}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                <Select value={userForm.status} onValueChange={(val: any) => setUserForm({...userForm, status: val})}><SelectTrigger className="h-12 rounded-xl border-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Aktif</SelectItem><SelectItem value="Inactive">Non-Aktif</SelectItem></SelectContent></Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8"><Button onClick={handleSaveUser} className="w-full h-16 rounded-2xl bg-primary font-black text-lg">Simpan User</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children }: any) {
  return (
    <div className="space-y-8">
      <div className="flex gap-5"><div className="bg-primary/10 p-4 rounded-2xl text-primary h-fit"><Icon className="h-7 w-7" /></div><div><h3 className="text-2xl font-black leading-tight">{title}</h3><p className="text-sm text-muted-foreground font-medium mt-1">{description}</p></div></div>
      <div className="pl-0 lg:pl-4">{children}</div>
    </div>
  );
}
