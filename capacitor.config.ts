/* eslint-disable @typescript-eslint/naming-convention */
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.markkar.portal',
  appName: 'Portal Markkar',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      androidScaleType: 'CENTER_CROP',
      launchAutoHide: false,
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
      backgroundColor: '#141518'
    },
  },
};

export default config;
