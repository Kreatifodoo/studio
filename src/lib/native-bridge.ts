
"use client";

import { Transaction } from '@/types/pos';

/**
 * Deteksi apakah aplikasi berjalan di platform native (Android/iOS).
 * Menggunakan pengecekan window.Capacitor untuk Next.js safety.
 */
export const isNative = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

/**
 * Memulai pemindaian barcode menggunakan kamera perangkat.
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
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch (hErr) {
        // Haptics fail is non-critical
      }
      return barcodes[0].displayValue;
    }
    
    return null;
  } catch (e) {
    console.error('Gagal scan barcode:', e);
    return null;
  }
}

/**
 * Logika Pencetakan via Bluetooth Native.
 */
export async function printReceiptNative(transaction: Transaction, storeName: string): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { printReceipt } = await import('./printer');
    return await printReceipt(transaction, storeName);
  } catch (e) {
    console.error('Gagal memuat modul printer:', e);
    return false;
  }
}

/**
 * Inisialisasi koneksi printer Bluetooth.
 */
export async function initPrinterNative(): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const { connectBluetoothPrinter } = await import('./printer');
    return await connectBluetoothPrinter();
  } catch (e) {
    console.error('Gagal inisialisasi printer:', e);
    return null;
  }
}
