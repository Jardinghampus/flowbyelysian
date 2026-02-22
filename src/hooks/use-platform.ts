import { Capacitor } from '@capacitor/core';

/**
 * Detect if the app is running inside a Capacitor native shell (Android/iOS).
 * Use this to conditionally render mobile-native layouts vs web layouts.
 */
export function useIsNativeApp() {
  return Capacitor.isNativePlatform();
}

export function usePlatform() {
  return Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
}
