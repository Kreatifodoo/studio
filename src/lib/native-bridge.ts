
import { Capacitor } from '@capacitor/core';
import { Transaction } from '@/types/pos';

export const isNative = () => Capacitor.isNativePlatform();

/**
 * Memulai pemindaian barcode menggunakan kamera perangkat.
 * Diimpor secara dinamis untuk keamanan SSR.
 */
export async function startScan(): Promise<string | null> {
  if (!isNative()) {
    console.warn('Scanner hanya tersedia di platform native.');
    return null;
  }

  try {
    const { BarcodeScanner, BarcodeFormat } = await import('@capacitor-mlkit/barcode-scanning');
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');

    const isSupported = await BarcodeScanner.isSupported();
    if (!isSupported.supported) return null;

    const status = await BarcodeScanner.requestPermissions();
    if (status.camera !== 'granted') return null;

    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.Code128, BarcodeFormat.QrCode],
    });

    if (barcodes.length > 0) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      return barcodes[0].displayValue;
    }
    
    return null;
  } catch (e) {
    console.error('Gagal scan barcode:', e);
    return null;
  }
}

/**
 * Logika Pencetakan via Bluetooth Native
 */
export async function printReceiptNative(transaction: Transaction, storeName: string): Promise<boolean> {
  if (!isNative()) return false;
  const { printReceipt } = await import('./printer');
  return await printReceipt(transaction, storeName);
}

export async function initPrinterNative(): Promise<string | null> {
  if (!isNative()) return null;
  const { connectBluetoothPrinter } = await import('./printer');
  return await connectBluetoothPrinter();
}
