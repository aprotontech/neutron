import { CapacitorConfig } from '@capacitor/cli';

import * as dotenv from 'dotenv';
dotenv.config();

const isDebug = process.argv.includes('--debug') || process.argv.includes('debug');

const androidKeystorePath = 'app/aproton-release-key.jks';
const androidKeystorePassword = process.env.ANDROID_KEYSTORE_PASSWORD || '';
const androidKeystoreAlias = process.env.ANDROID_KEY_ALIAS || 'aproton';
const androidKeystoreAliasPassword = process.env.ANDROID_KEY_PASSWORD || '';

const serverURL= process.env.SERVER_URL || 'https://www.huxiaolong.cn'



const config: CapacitorConfig = {
  appId: 'tech.aproton.neutron',
  appName: 'aprotontech',
  webDir: 'www',
  
  android: {
    buildOptions: isDebug ? undefined :  {
      keystorePath: androidKeystorePath,
      keystorePassword: androidKeystorePassword,
      keystoreAlias: androidKeystoreAlias,
      keystoreAliasPassword: androidKeystoreAliasPassword,
      releaseType: 'APK'
    },

    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  
  // server: {
  //   androidScheme: 'http',
  //   cleartext: true
  // },
   server: {
    url: serverURL,
    //url: 'http://192.168.1.111:5173',
    cleartext: true 
  },

  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DEFAULT',
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'capacitor-community-sqlite',
      androidDatabaseLocation: 'databases',
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login",
        biometricSubTitle: "Log in using your biometric"
      }
    }
  }
};

export default config;