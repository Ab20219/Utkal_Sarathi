import React, { useEffect, useRef, useState } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { subscribeToNetworkStatus } from '../utils/nativeAndroid';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnectedToast, setShowReconnectedToast] = useState<boolean>(false);
  const wasOfflineRef = useRef<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    let toastTimer: number | null = null;

    const cleanup = subscribeToNetworkStatus((connected) => {
      setIsOnline(connected);
      if (!connected) {
        wasOfflineRef.current = true;
        setShowReconnectedToast(false);
      } else if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        setShowReconnectedToast(true);
        if (toastTimer) window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => setShowReconnectedToast(false), 3500);
      }
    });

    return () => {
      cleanup();
      if (toastTimer) window.clearTimeout(toastTimer);
    };
  }, []);

  if (!isOnline) {
    return (
      <aside
        aria-label="Offline status warning"
        className="fixed bottom-[4.75rem] md:bottom-6 left-3 right-3 sm:right-auto z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-950/95 border border-amber-600/80 text-amber-200 text-xs shadow-2xl backdrop-blur-md animate-fadeIn max-w-md"
      >
        <span className="flex h-2.5 w-2.5 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Offline Mode:</strong> Local 30-district dossiers, itineraries &amp; 112 SOS numbers remain active. Cloud AI &amp; HD voice resume automatically when online.
        </span>
      </aside>
    );
  }

  if (showReconnectedToast) {
    return (
      <aside
        aria-label="Reconnected notification"
        className="fixed bottom-[4.75rem] md:bottom-6 left-3 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/95 border border-emerald-600/80 text-emerald-200 text-xs shadow-2xl backdrop-blur-md animate-fadeIn"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Network restored — Live AI &amp; HD Odia/Hindi voice reconnected</span>
      </aside>
    );
  }

  return null;
};
