/**
 * UtkalSarathi Universal Application Sharing Engine
 * Supports Android Native Share via Web Share API / Capacitor, WhatsApp, and Clipboard
 */

export interface ShareDataPayload {
  title: string;
  text: string;
  url: string;
  apkUrl: string;
}

export function getAppSharePayload(): ShareDataPayload {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://utkalsarathi.vercel.app';
  const siteUrl = origin.includes('localhost') ? 'https://utkalsarathi.vercel.app' : origin;
  const apkDownloadUrl = `${siteUrl}/downloads/UtkalSarathi.apk`;

  return {
    title: 'UtkalSarathi — Odisha Smart Tourism, Culture & Safety Guide',
    text: 'Discover all 30 districts of Odisha with UtkalSarathi! Experience immersive Utkal Katha audio chronicles, smart itineraries, transit fare calculations, and UtkalSuraksha emergency safety.\n\nWebsite: ' + siteUrl + '\nDirect Android APK: ' + apkDownloadUrl,
    url: siteUrl,
    apkUrl: apkDownloadUrl,
  };
}

export async function shareApplication(): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'fallback' }> {
  const payload = getAppSharePayload();

  // Try Native Web Share API (Supported on Android Chrome, Capacitor Android, iOS Safari)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return { success: true, method: 'native' };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User cancelled the share dialog
        return { success: false, method: 'native' };
      }
      // If native share fails or rejected, fallback below
    }
  }

  // Fallback: Copy to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${payload.title}\n${payload.text}`);
      return { success: true, method: 'clipboard' };
    } catch {
      // ignore
    }
  }

  return { success: false, method: 'fallback' };
}
