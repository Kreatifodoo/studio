
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextpos.order',
  appName: 'NextPOS Order',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BarcodeScanner: {
      install: 'npm install @capacitor-mlkit/barcode-scanning'
    }
  }
};

export default config;
