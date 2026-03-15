
import { BluetoothPrinter } from '@kduma-autoid/capacitor-bluetooth-printer';
import { Transaction } from '@/types/pos';
import { format } from 'date-fns';

/**
 * Utilitas untuk menangani pencetakan ESC/POS via Bluetooth pada Android.
 */

export async function connectBluetoothPrinter() {
  try {
    const { devices } = await BluetoothPrinter.list();
    if (devices.length === 0) {
      throw new Error("Tidak ada printer Bluetooth ditemukan.");
    }
    // Implementasi sederhana: Hubungkan ke perangkat pertama yang ditemukan
    // Di produksi, biarkan pengguna memilih dari daftar.
    await BluetoothPrinter.connect({ address: devices[0].address });
    return devices[0].name;
  } catch (error) {
    console.error("Gagal menghubungkan printer:", error);
    throw error;
  }
}

export async function printReceipt(order: Transaction, storeName: string) {
  try {
    const content = formatReceipt(order, storeName);
    await BluetoothPrinter.print({ content });
    return true;
  } catch (error) {
    console.error("Gagal mencetak struk:", error);
    return false;
  }
}

function formatReceipt(order: Transaction, storeName: string): string {
  const line = "--------------------------------\n";
  const dateStr = format(new Date(order.date), 'dd/MM/yy HH:mm');
  
  let content = `\x1b\x61\x01`; // Align Center
  content += `${storeName.toUpperCase()}\n`;
  content += `Order: #${order.id}\n`;
  content += `${dateStr}\n`;
  content += `\x1b\x61\x00`; // Align Left
  content += line;
  
  order.items.forEach(item => {
    content += `${item.name.substring(0, 20)}\n`;
    content += `${item.quantity} x ${item.price.toLocaleString()} = ${(item.quantity * item.price).toLocaleString()}\n`;
  });
  
  content += line;
  content += `TOTAL: Rp ${order.total.toLocaleString()}\n`;
  content += `Metode: ${order.paymentMethod || 'Tunai'}\n`;
  content += line;
  content += `\x1b\x61\x01`; // Align Center
  content += `TERIMA KASIH\n\n\n\n`; // Padding for cutter
  
  return content;
}
