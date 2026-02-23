import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.CAPACITOR_MODE === 'dev';

const config: CapacitorConfig = {
  appId: 'com.zaylo.zflow',
  appName: 'ZFlow by Zaylo',
  webDir: 'capacitor-www',
  server: {
    // Dev: points at local Next.js dev server via Android emulator alias
    // Prod: points at deployed Vercel app
    url: isDev
      ? 'http://10.0.2.2:3000'
      : 'https://flowbyelysian-kjbcdv06a-jardinghampus-projects.vercel.app',
    cleartext: isDev,
  },
  android: {
    buildOptions: {
      signingType: 'apksigner',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false,
    },
  },
};

export default config;
