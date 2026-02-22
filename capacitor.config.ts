import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elysian.flow',
  appName: 'Flow by Elysian',
  webDir: 'out',
  // During development, uncomment the server block below and run `pnpm dev`
  // to use live reload instead of the static export:
  //
  // server: {
  //   url: 'http://10.0.2.2:3000', // Android emulator localhost alias
  //   cleartext: true,
  // },
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
