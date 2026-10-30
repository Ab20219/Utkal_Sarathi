import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';

export interface GpsPositionResult {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  source: 'capacitor-native' | 'browser-geolocation';
}

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isNativeAndroid(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

/**
 * Configures native Android StatusBar, safe viewport behavior (for Samsung Galaxy F23 5G & punch-hole displays),
 * and hides the native launch SplashScreen smoothly once the React UI is mounted.
 */
export async function initializeNativeAndroidShell(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    if (isNativeAndroid()) {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1c1917' });
    }
  } catch {
    // Ignore on unsupported devices
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // Ignore if already hidden
  }
}

/**
 * Requests Android runtime location permissions when needed and retrieves real GPS coordinates.
 */
export async function requestAndGetCurrentLocation(): Promise<GpsPositionResult> {
  if (isNativeApp()) {
    const status = await Geolocation.checkPermissions();
    if (status.location !== 'granted' && status.coarseLocation !== 'granted') {
      const requested = await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation'],
      });
      if (requested.location !== 'granted' && requested.coarseLocation !== 'granted') {
        throw new Error(
          'Location permission denied. Enable Location access for UtkalSarathi in Android Settings > Apps > UtkalSarathi > Permissions.'
        );
      }
    }

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy || 25,
        source: 'capacitor-native',
      };
    } catch {
      const coarsePos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      });
      return {
        latitude: coarsePos.coords.latitude,
        longitude: coarsePos.coords.longitude,
        accuracyMeters: coarsePos.coords.accuracy || 150,
        source: 'capacitor-native',
      };
    }
  }

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new Error('GPS Geolocation is not supported on this device.');
  }

  return new Promise<GpsPositionResult>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy || 50,
          source: 'browser-geolocation',
        });
      },
      () => {
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            resolve({
              latitude: fallbackPos.coords.latitude,
              longitude: fallbackPos.coords.longitude,
              accuracyMeters: fallbackPos.coords.accuracy || 250,
              source: 'browser-geolocation',
            });
          },
          (err) => {
            if (err.code === 1) {
              reject(
                new Error(
                  'Location permission denied. Please allow Location access to locate your nearest Odisha district.'
                )
              );
            } else {
              reject(
                new Error(
                  'Unable to acquire GPS signal. Please turn on device Location / GPS and try again.'
                )
              );
            }
          },
          { enableHighAccuracy: false, timeout: 9000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  });
}

/**
 * Great-circle Haversine distance in kilometers between two WGS84 coordinates.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Builds an official Google Maps turn-by-turn directions URL that launches the native Google Maps app on Android.
 */
export function buildGoogleMapsDirectionsUrl(
  latitude: number,
  longitude: number,
  placeLabel?: string
): string {
  const destParam = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', destParam);
  if (placeLabel) {
    url.searchParams.set('destination_place_id', '');
    url.searchParams.delete('destination_place_id');
  }
  url.searchParams.set('travelmode', 'driving');
  return url.toString();
}

/**
 * Shares text or GPS links using the native Android Share sheet when supported, falling back to clipboard.
 */
export async function shareContentNative(payload: {
  title: string;
  text: string;
  url?: string;
}): Promise<'shared' | 'copied'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return 'shared';
      }
    }
  }

  const combined = payload.url ? `${payload.text}\n${payload.url}` : payload.text;
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(combined);
  }
  return 'copied';
}

/**
 * Subscribes to native Android & browser network connectivity transitions.
 */
export function subscribeToNetworkStatus(
  onStatusChange: (connected: boolean, connectionType?: string) => void
): () => void {
  let listenerHandle: { remove: () => Promise<void> } | null = null;
  let disposed = false;

  if (isNativeApp()) {
    Network.getStatus()
      .then((status) => {
        if (!disposed) onStatusChange(status.connected, status.connectionType);
      })
      .catch(() => {});

    Network.addListener('networkStatusChange', (status) => {
      if (!disposed) {
        onStatusChange(status.connected, status.connectionType);
      }
    })
      .then((handle) => {
        if (disposed) {
          handle.remove().catch(() => {});
        } else {
          listenerHandle = handle;
        }
      })
      .catch(() => {});
  }

  const handleOnline = () => onStatusChange(true, 'online');
  const handleOffline = () => onStatusChange(false, 'none');

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  return () => {
    disposed = true;
    if (listenerHandle) {
      listenerHandle.remove().catch(() => {});
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  };
}

/**
 * Registers Android hardware / gesture back button listener via @capacitor/app.
 */
export function registerAndroidBackButton(
  onBackPress: (canGoBackInWebView: boolean) => void
): () => void {
  if (!isNativeApp()) return () => {};

  let handleRef: { remove: () => Promise<void> } | null = null;
  let cancelled = false;

  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (!cancelled) {
      onBackPress(canGoBack);
    }
  })
    .then((h) => {
      if (cancelled) {
        h.remove().catch(() => {});
      } else {
        handleRef = h;
      }
    })
    .catch(() => {});

  return () => {
    cancelled = true;
    if (handleRef) {
      handleRef.remove().catch(() => {});
    }
  };
}

export async function minimizeNativeAndroidApp(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    await CapacitorApp.minimizeApp();
  } catch {
    try {
      await CapacitorApp.exitApp();
    } catch {
      // Ignore
    }
  }
}

/**
 * Subscribes to Android app foreground / background lifecycle changes.
 */
export function subscribeAppLifecycle(
  onLifecycleChange: (isActive: boolean) => void
): () => void {
  let handleRef: { remove: () => Promise<void> } | null = null;
  let cancelled = false;

  if (isNativeApp()) {
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!cancelled) {
        onLifecycleChange(isActive);
      }
    })
      .then((h) => {
        if (cancelled) {
          h.remove().catch(() => {});
        } else {
          handleRef = h;
        }
      })
      .catch(() => {});
  }

  const handleVisibility = () => {
    if (typeof document !== 'undefined') {
      onLifecycleChange(document.visibilityState === 'visible');
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibility);
  }

  return () => {
    cancelled = true;
    if (handleRef) {
      handleRef.remove().catch(() => {});
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  };
}
