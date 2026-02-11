import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.farmit.zm',
  appName: 'FarmitZM',
  webDir: 'out',
  server: {
    url: 'http://localhost:9002',
    cleartext: true,
  },
};

export default config;
