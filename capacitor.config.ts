import type { CapacitorConfig } from '@capacitor/cli';

// The APK loads the live Vedaalay web app, so it always matches
// the latest published version — no need to rebuild the APK for
// website changes.
const config: CapacitorConfig = {
  appId: 'com.vedaalay.schoolos',
  appName: 'Vedaalay',
  webDir: 'dist',
  server: {
    url: 'https://id-preview--e682a1a3-01c2-4df3-a879-92afe94f8338.lovable.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
