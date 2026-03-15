import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextpos.app',
  appName: 'NextPOS',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
