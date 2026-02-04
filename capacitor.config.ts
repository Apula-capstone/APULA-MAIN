import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apula.fire_prevention',
  appName: 'APULA',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
