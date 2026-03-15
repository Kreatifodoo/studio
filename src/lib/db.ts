
import Dexie, { type EntityTable } from 'dexie';
import { 
  Product, Transaction, Category, PaymentMethod, 
  Fee, Session, Customer, PriceList, Package, 
  Combo, PromoDiscount, User 
} from '@/types/pos';

export class KompakPOSDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  customers!: EntityTable<Customer, 'id'>;
  users!: EntityTable<User, 'id'>;
  paymentMethods!: EntityTable<PaymentMethod, 'id'>;
  fees!: EntityTable<Fee, 'id'>;
  priceLists!: EntityTable<PriceList, 'id'>;
  packages!: EntityTable<Package, 'id'>;
  combos!: EntityTable<Combo, 'id'>;
  promoDiscounts!: EntityTable<PromoDiscount, 'id'>;
  config!: EntityTable<{ key: string; value: any }, 'key'>;

  constructor() {
    super('KompakPOS_Enterprise_DB');
    
    // Schema Versioning & Advanced Indexing
    // Indexing pada kolom yang sering dicari: sku, barcode, category, date, customerId
    this.version(1).stores({
      products: 'id, sku, barcode, name, category',
      transactions: 'id, date, status, customerId',
      sessions: 'id, startTime, status',
      customers: 'id, name, phone',
      users: 'id, username, roleId',
      paymentMethods: 'id, name',
      fees: 'id, name',
      priceLists: 'id, productId',
      packages: 'id, sku, name',
      combos: 'id, sku, name',
      promoDiscounts: 'id, productId',
      config: 'key'
    });
  }

  // Method untuk menghapus semua data (untuk Restore)
  async resetDatabase() {
    await Promise.all([
      this.products.clear(),
      this.transactions.clear(),
      this.sessions.clear(),
      this.customers.clear(),
      this.users.clear(),
      this.paymentMethods.clear(),
      this.fees.clear(),
      this.priceLists.clear(),
      this.packages.clear(),
      this.combos.clear(),
      this.promoDiscounts.clear(),
      this.config.clear(),
    ]);
  }
}

export const db = new KompakPOSDatabase();
