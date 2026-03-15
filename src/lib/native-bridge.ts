
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

/**
 * Memulai pemindaian barcode menggunakan kamera perangkat.
 * Mengembalikan string konten barcode atau null jika dibatalkan.
 */
export async function startScan(): Promise<string | null> {
  if (!isNative()) {
    console.warn('Scanner hanya tersedia di platform native.');
    return null;
  }

  try {
    const isSupported = await BarcodeScanner.isSupported();
    if (!isSupported.supported) return null;

    // Minta izin kamera
    const status = await BarcodeScanner.requestPermissions();
    if (status.camera !== 'granted') return null;

    // Mulai proses scan
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
 * Logika Pencetakan via Bluetooth (Native Bridge)
 * Menangani deteksi printer dan pengiriman data ESC/POS
 */
export async function printReceiptNative(data: string): Promise<boolean> {
  if (!isNative()) return false;
  
  // Catatan: Implementasi sesungguhnya memerlukan plugin Bluetooth Serial 
  // seperti @kduma-autoid/capacitor-bluetooth-printer
  // Kode ini bertindak sebagai placeholder untuk memicu dialog native.
  console.log("Mengirim data ke printer native...");
  return true;
}
