import type { CapacitorConfig } from '@capacitor/cli';

// The APK loads the live published Vedaalay web app, so it always matches
// the latest published version - no need to rebuild the APK for website changes.
const config: CapacitorConfig = {
  appId: 'com.vedaalay.schoolos',
  appName: 'Vedaalay',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  server: {
    url: 'https://vedaalayupdated.lovable.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
