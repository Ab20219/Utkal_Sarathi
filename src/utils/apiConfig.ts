import { Capacitor } from '@capacitor/core';

declare const __UTKALSARATHI_BACKEND_ORIGIN__: string | undefined;

const FALLBACK_CLOUD_ORIGINS = [
  'https://utkalsarathi.vercel.app',
  'https://ais-pre-a7pwyloaohkzv3vmswlqbs-776144599923.asia-northeast1.run.app',
  'https://ais-dev-a7pwyloaohkzv3vmswlqbs-776144599923.asia-northeast1.run.app',
];

/**
 * Detects whether the application is running inside a packaged Capacitor native app (Android / iOS).
 */
export function isCapacitorNative(): boolean {
  try {
    if (Capacitor.isNativePlatform()) {
      return true;
    }
  } catch {
    // Safe fallback in non-DOM test environments
  }

  if (typeof window !== 'undefined' && window.location) {
    const proto = window.location.protocol;
    if (proto === 'capacitor:' || proto === 'ionic:') {
      return true;
    }
    // Capacitor Android serves bundled assets from https://localhost (port === '')
    if (
      proto === 'https:' &&
      window.location.hostname === 'localhost' &&
      !window.location.port
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Returns ordered candidate backend origins when running inside Native Android APK.
 */
export function getNativeBackendCandidates(): string[] {
  const candidates: string[] = [];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customOrigin = window.localStorage.getItem('utkalsarathi_backend_origin');
      if (customOrigin && customOrigin.trim()) {
        candidates.push(customOrigin.trim().replace(/\/$/, ''));
      }
    } catch {}
  }

  const envUrl =
    typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE_URL
      ? String((import.meta as any).env.VITE_API_BASE_URL).trim().replace(/\/$/, '')
      : '';

  if (envUrl && !candidates.includes(envUrl)) {
    candidates.push(envUrl);
  }

  const buildOrigin =
    typeof __UTKALSARATHI_BACKEND_ORIGIN__ === 'string'
      ? __UTKALSARATHI_BACKEND_ORIGIN__.trim().replace(/\/$/, '')
      : '';

  if (buildOrigin && !candidates.includes(buildOrigin)) {
    candidates.push(buildOrigin);
  }

  for (const fallback of FALLBACK_CLOUD_ORIGINS) {
    if (!candidates.includes(fallback)) {
      candidates.push(fallback);
    }
  }

  return candidates;
}

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const configuredEnvOrigin =
    typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_BASE_URL
      ? String((import.meta as any).env.VITE_API_BASE_URL).trim().replace(/\/$/, '')
      : '';

  if (configuredEnvOrigin) {
    return configuredEnvOrigin;
  }

  // Inside Capacitor Native Android APK, relative '/api/*' would hit https://localhost (WebView assets)
  // so route securely to the hosted HTTPS backend server where GEMINI_API_KEY lives server-side.
  if (isCapacitorNative()) {
    const candidates = getNativeBackendCandidates();
    return candidates[0] || '';
  }

  return '';
}

/**
 * Resolves API endpoint paths cleanly across Web, PWA, and Native Android Capacitor APK environments.
 */
export function resolveApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  if (base) {
    return `${base}${normalizedPath}`;
  }
  return normalizedPath;
}

/**
 * Resilient API fetch wrapper: on Web uses direct relative/configured URL;
 * on Native Android automatically fails over across configured Cloud Run backend origins if primary is unreachable.
 */
export async function fetchApi(path: string, init?: RequestInit): Promise<Response> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!isCapacitorNative()) {
    return fetch(resolveApiUrl(normalizedPath), init);
  }

  const candidates = getNativeBackendCandidates();
  let lastError: unknown = null;

  for (let i = 0; i < candidates.length; i++) {
    const targetUrl = `${candidates[i]}${normalizedPath}`;
    try {
      const response = await fetch(targetUrl, init);
      // Retry next candidate on 404 or gateway/service errors (500/502/503/504)
      if ((response.status === 404 || response.status >= 500) && i + 1 < candidates.length) {
        continue;
      }
      return response;
    } catch (err: any) {
      lastError = err;
      if (err?.name === 'AbortError') {
        throw err;
      }
    }
  }

  throw lastError || new Error('Unable to reach UtkalSarathi cloud backend');
}
