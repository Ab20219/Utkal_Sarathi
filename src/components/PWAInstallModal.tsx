import React, { useState, useEffect } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Radio,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { usePlatform } from '../context/PlatformContext';
import { resolveApiUrl } from '../utils/apiConfig';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isIOS, isAndroid } = usePWAInstall();
  const { activePlatform, isNativeAndroid } = usePlatform();
  const [activeTab, setActiveTab] = useState<'android' | 'mac' | 'windows' | 'ios'>(() => {
    if (isAndroid || activePlatform === 'android') return 'android';
    if (isIOS) return 'ios';
    if (activePlatform === 'windows') return 'windows';
    return 'android';
  });

  useEffect(() => {
    if (!isOpen) return;
    const onAndroidBack = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    window.addEventListener('utkalsarathi:android-back', onAndroidBack);
    return () => window.removeEventListener('utkalsarathi:android-back', onAndroidBack);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg border border-amber-400/30">
              <img src="/icon.svg" alt="UtkalSarathi" className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Install UtkalSarathi Web App
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  Verified PWA
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Installable Progressive Web App for Android, iPhone, Windows &amp; macOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close install modal"
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser PWA Instant Install Banner */}
        {isInstallable && !isInstalled && (
          <div className="bg-emerald-950/60 border-b border-emerald-800/60 p-3.5 px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-200">
                  Instant Browser PWA Installation Ready
                </p>
                <p className="text-[11px] text-emerald-400">
                  Install directly to your Home Screen, Taskbar, or Dock with offline caching
                </p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg transition shrink-0"
            >
              <Download className="w-4 h-4" />
              Install Web App
            </button>
          </div>
        )}

        {isInstalled && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 p-3.5 px-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              UtkalSarathi is installed in standalone app mode on this device.
            </p>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="grid grid-cols-4 bg-stone-950 border-b border-stone-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'ios'
                ? 'border-purple-500 text-purple-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>iPhone / iOS</span>
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'windows'
                ? 'border-blue-500 text-blue-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Windows</span>
          </button>
          <button
            onClick={() => setActiveTab('mac')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'mac'
                ? 'border-amber-500 text-amber-400 bg-stone-900 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Apple className="w-4 h-4 text-amber-400" />
            <span>macOS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-300 text-sm">
          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {isNativeAndroid ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white">
                      Running Native UtkalSarathi Android App (com.utkalsarathi.app)
                    </h4>
                    <p className="text-xs text-emerald-300 mt-0.5">
                      Native Android GPS, Odia/Hindi voice microphone, offline emergency packs, and hardware back navigation are active.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-stone-900 to-amber-950/40 border border-emerald-600/40 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white">
                            Native Android APK — UtkalSarathi
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/70 text-emerald-300 border border-emerald-600/40">
                            com.utkalsarathi.app
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 mt-1">
                          Installable Android package compatible with Samsung Galaxy F23 5G &amp; Android 7.0–16 phones. Includes Odia/Hindi voice assistant, live GPS, and offline emergency directory.
                        </p>
                      </div>
                    </div>
                    <a
                      href={resolveApiUrl('/downloads/UtkalSarathi.apk')}
                      download="UtkalSarathi.apk"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download APK</span>
                    </a>
                  </div>
                  <div className="text-[11px] text-stone-400 border-t border-stone-800/80 pt-2">
                    <strong className="text-stone-200">Install on Samsung / Android Phone:</strong> Tap{' '}
                    <span className="text-emerald-400 font-semibold">Download APK</span> ➔ open{' '}
                    <code className="text-amber-300">UtkalSarathi.apk</code> from Notifications or My Files ➔ allow &quot;Install unknown apps&quot; if prompted ➔ tap <strong>Install</strong>.
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Alternative: Install via Chrome Browser (PWA):
                </h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-white">Open Menu in Chrome</p>
                      <p className="text-stone-400 mt-0.5">
                        Tap Chrome&apos;s three-dot menu (⋮) in the top-right corner of your Android browser.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-white">Tap &quot;Install app&quot; or &quot;Add to Home screen&quot;</p>
                      <p className="text-stone-400 mt-0.5">
                        Confirm installation to launch UtkalSarathi in full-screen standalone mode with Odia &amp; Hindi voice support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-purple-950/30 border border-purple-900/50 rounded-xl">
                <div className="p-2 rounded-lg bg-purple-900/50 text-purple-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">iPhone &amp; iPad — Installable Web App (PWA)</h4>
                  <p className="text-xs text-stone-400">
                    Standalone Home Screen installation via Safari with offline safety &amp; monument text cache
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  How to Install on iPhone / iPad (Safari):
                </h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-white">Open in Safari &amp; Tap Share</p>
                      <p className="text-stone-400 mt-0.5">
                        Open this public URL in Safari and tap the <strong>Share</strong> icon (square with upward arrow).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-white">Tap &quot;Add to Home Screen&quot;</p>
                      <p className="text-stone-400 mt-0.5">
                        Scroll down the share sheet, tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WINDOWS TAB */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-blue-950/30 border border-blue-900/50 rounded-xl">
                <div className="p-2 rounded-lg bg-blue-900/50 text-blue-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Windows 11 / 10 — Desktop Web App (PWA)</h4>
                  <p className="text-xs text-stone-400">
                    Standalone desktop window, Start Menu &amp; Taskbar pinning via Microsoft Edge or Chrome
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  How to Install on Windows:
                </h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold text-[10px] shrink-0 mt-0.5">
                      Edge
                    </span>
                    <div>
                      <p className="font-medium text-white">Microsoft Edge:</p>
                      <p className="text-stone-400 mt-0.5">
                        Click the <strong>App available (Install UtkalSarathi)</strong> icon in the address bar ➔ <strong>Install</strong> to pin to Taskbar or Start Menu.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold text-[10px] shrink-0 mt-0.5">
                      Chrome
                    </span>
                    <div>
                      <p className="font-medium text-white">Google Chrome:</p>
                      <p className="text-stone-400 mt-0.5">
                        Click the <strong>Install UtkalSarathi</strong> icon on the right side of the address bar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MACOS TAB */}
          {activeTab === 'mac' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-amber-950/30 border border-amber-900/50 rounded-xl">
                <div className="p-2 rounded-lg bg-amber-900/50 text-amber-400">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">macOS — Desktop Web App (PWA)</h4>
                  <p className="text-xs text-stone-400">
                    Standalone Dock app via Safari (macOS Sonoma+) or Google Chrome
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  How to Add to macOS Dock:
                </h5>
                <div className="grid gap-2 text-xs">
                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-300 font-bold text-[10px] shrink-0 mt-0.5">
                      Safari
                    </span>
                    <div>
                      <p className="font-medium text-white">Safari (macOS Sonoma or newer):</p>
                      <p className="text-stone-400 mt-0.5">
                        Click <strong>File</strong> in the menu bar ➔ <strong>Add to Dock...</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50 flex items-start gap-3">
                    <span className="px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-300 font-bold text-[10px] shrink-0 mt-0.5">
                      Chrome
                    </span>
                    <div>
                      <p className="font-medium text-white">Google Chrome / Brave / Edge:</p>
                      <p className="text-stone-400 mt-0.5">
                        Click the <strong>Install UtkalSarathi</strong> icon in the address bar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-950 p-4 px-6 border-t border-stone-800 flex items-center justify-between text-xs">
          <div className="text-stone-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>UtkalSarathi • Multilingual Odia &amp; Hindi Voice PWA</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
