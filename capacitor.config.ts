import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fundwars.game',
  appName: 'Fund Wars',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#0a0a0a"
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false,
    },
  },
};

export default config;