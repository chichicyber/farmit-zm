import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.farmit.zm',
  appName: 'FarmitZM',
  webDir: 'out',
  // Note: The 'server' block is useful for live-reload during development.
  // For a final production build, you can remove or comment it out
  // to ensure the app loads directly from the bundled 'out' folder.
  server: {
    androidScheme: 'https'
  },
};

export default config;
