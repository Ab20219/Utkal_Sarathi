import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { PlatformProvider } from './context/PlatformContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { initializeNativeAndroidShell, isNativeApp } from './utils/nativeAndroid.ts';
import './index.css';

// Register browser PWA Service Worker ONLY on Web (never inside Capacitor Native Android WebView)
if (!isNativeApp() && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

void initializeNativeAndroidShell();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <PlatformProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </PlatformProvider>
  </ErrorBoundary>
);
