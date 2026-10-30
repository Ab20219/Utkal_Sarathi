import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import {
  Keyboard,
  X,
  Check,
  Info,
  Download,
  Smartphone,
  Monitor,
  Apple,
  Sparkles,
  Wifi,
  Battery,
} from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';

interface DesktopWindowControlsProps {
  onOpenAssistant?: () => void;
  onOpenShortcutsModal?: () => void;
}

export const DesktopWindowControls: React.FC<DesktopWindowControlsProps> = ({
  onOpenAssistant,
  onOpenShortcutsModal,
}) => {
  const {
    osMode,
    setOsMode,
    activePlatform,
    activeOS,
    isMobile,
    modKey,
    phoneFrameMode,
    setPhoneFrameMode,
  } = usePlatform();

  const [showOsMenu, setShowOsMenu] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  const handleControlClick = (action: string) => {
    if (action === 'close' && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'minimize') {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else if (action === 'maximize') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <>
      <header className="bg-stone-950/95 border-b border-stone-850 px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs text-stone-400 select-none sticky top-0 z-40 backdrop-blur-md">
        {/* Left: Window Controls based on active platform */}
        <div className="flex items-center gap-3">
          {activePlatform === 'mac' && (
            /* macOS Traffic Lights */
            <div className="flex items-center gap-1.5 group">
              <button
                type="button"
                onClick={() => handleControlClick('close')}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center text-[8px] text-rose-950 font-bold opacity-90 group-hover:opacity-100"
                title="Close / Scroll to Top"
                aria-label="Close Window"
              >
                <span className="hidden group-hover:inline">✕</span>
              </button>
              <button
                type="button"
                onClick={() => handleControlClick('minimize')}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center text-[8px] text-amber-950 font-bold opacity-90 group-hover:opacity-100"
                title="Minimize View"
                aria-label="Minimize Window"
              >
                <span className="hidden group-hover:inline">−</span>
              </button>
              <button
                type="button"
                onClick={() => handleControlClick('maximize')}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center text-[7px] text-emerald-950 font-bold opacity-90 group-hover:opacity-100"
                title="Toggle Fullscreen"
                aria-label="Maximize Window"
              >
                <span className="hidden group-hover:inline">⤢</span>
              </button>
              <span className="ml-2 font-mono text-[10px] text-stone-400 hidden sm:inline">
                macOS Cupertino
              </span>
            </div>
          )}

          {activePlatform === 'windows' && (
            /* Windows 11 Fluent Titlebar Accent */
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-300">
                <span className="w-2.5 h-2.5 bg-cyan-500/80 rounded-sm inline-block shadow-sm" />
                <span>Windows 11 Fluent</span>
              </span>
            </div>
          )}

          {activePlatform === 'android' && (
            /* Android System Bar */
            <div className="flex items-center gap-2 text-emerald-400">
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold text-emerald-300">Android System Mode</span>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-500/80">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
                <span>5G</span>
              </div>
            </div>
          )}

          {activePlatform === 'ios' && (
            /* iOS Bar */
            <div className="flex items-center gap-2 text-purple-400">
              <Apple className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold text-purple-300">iOS Mobile Mode</span>
            </div>
          )}
        </div>

        {/* Center: Desktop / Mobile App Title */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-stone-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>UtkalSarathi • Cross-Platform Release (Mac, Windows, Android &amp; iOS)</span>
        </div>

        {/* Right: Install App Button, Shortcuts & Platform Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Install App Button */}
          <button
            type="button"
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-semibold text-[11px] shadow-sm transition active:scale-95"
            title="Install UtkalSarathi as Desktop or Phone App"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>

          {/* Shortcuts cheatsheet button */}
          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800 text-[11px] transition-colors"
            title="View Desktop Keyboard Shortcuts"
          >
            <Keyboard className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Shortcuts</span>
            <kbd className="px-1 py-0.2 rounded bg-stone-800 text-[10px] font-mono text-amber-300 border border-stone-700">
              {modKey}K
            </kbd>
          </button>

          {/* OS & Device Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOsMenu(!showOsMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-850 text-stone-200 border border-stone-800 text-[11px] transition-colors"
              title="Switch Platform UI (Mac, Windows, Android, iOS)"
            >
              <span>
                {activePlatform === 'mac' && '🍏 Mac UI'}
                {activePlatform === 'windows' && '🪟 Windows UI'}
                {activePlatform === 'android' && '🤖 Android UI'}
                {activePlatform === 'ios' && '🍎 iOS UI'}
              </span>
              <span className="text-[9px] text-stone-500 uppercase">({osMode})</span>
            </button>

            {showOsMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-stone-400 border-b border-stone-800 mb-1">
                  Select UI Experience:
                </div>

                {/* macOS */}
                <button
                  type="button"
                  onClick={() => {
                    setOsMode('mac');
                    setShowOsMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    osMode === 'mac'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🍏</span> macOS Desktop
                  </span>
                  {osMode === 'mac' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                {/* Windows 11 */}
                <button
                  type="button"
                  onClick={() => {
                    setOsMode('windows');
                    setShowOsMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    osMode === 'windows'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🪟</span> Windows 11 Desktop
                  </span>
                  {osMode === 'windows' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>

                {/* Android Phone */}
                <button
                  type="button"
                  onClick={() => {
                    setOsMode('android');
                    setShowOsMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    osMode === 'android'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🤖</span> Android Phone App
                  </span>
                  {osMode === 'android' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                {/* Apple iOS */}
                <button
                  type="button"
                  onClick={() => {
                    setOsMode('ios');
                    setShowOsMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    osMode === 'ios'
                      ? 'bg-purple-500/20 text-purple-300 font-bold'
                      : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🍎</span> iOS iPhone App
                  </span>
                  {osMode === 'ios' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>

                {/* Auto System Detect */}
                <button
                  type="button"
                  onClick={() => {
                    setOsMode('auto');
                    setShowOsMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors border-t border-stone-800 mt-1 pt-1.5 ${
                    osMode === 'auto'
                      ? 'bg-stone-800 text-white font-bold'
                      : 'hover:bg-stone-800 text-stone-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>💻</span> Auto System Detect
                  </span>
                  {osMode === 'auto' && <Check className="w-3.5 h-3.5 text-stone-300" />}
                </button>
              </div>
            )}
          </div>

          {/* Windows Fluent Window Controls on Right */}
          {activePlatform === 'windows' && (
            <div className="flex items-center border-l border-stone-800 pl-1.5 ml-1">
              <button
                type="button"
                onClick={() => handleControlClick('minimize')}
                className="w-6 h-6 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors text-[10px]"
                title="Minimize"
                aria-label="Minimize"
              >
                🗕
              </button>
              <button
                type="button"
                onClick={() => handleControlClick('maximize')}
                className="w-6 h-6 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors text-[10px]"
                title="Maximize / Restore"
                aria-label="Maximize"
              >
                🗖
              </button>
              <button
                type="button"
                onClick={() => handleControlClick('close')}
                className="w-6 h-6 hover:bg-rose-600 text-stone-400 hover:text-white flex items-center justify-center transition-colors text-[11px]"
                title="Close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </header>

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setShowShortcuts(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              aria-label="Close shortcuts modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cross-Platform Shortcuts</h3>
                <p className="text-xs text-stone-400">
                  Adaptive keys for macOS (<span className="text-amber-300">⌘ Command</span>), Windows (<span className="text-cyan-300">Ctrl</span>), and Android keyboards.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { shortcut: `${modKey} + K`, desc: 'Launch Utkal Mitra Voice Assistant & Quick Search' },
                { shortcut: `${modKey} + 1`, desc: 'Navigate to 3-Day Itinerary Planner' },
                { shortcut: `${modKey} + 2`, desc: 'Open 30 Districts Interactive Geo-Map' },
                { shortcut: `${modKey} + 3`, desc: 'Open Transit Pricing Matrix (Bus, Rail, Flight)' },
                { shortcut: `${modKey} + 4`, desc: 'Launch Utkal Katha Voice Storytelling Guide' },
                { shortcut: `${modKey} + 5`, desc: 'Browse GI Tag Cuisine & Heritage Crafts' },
                { shortcut: `${modKey} + 6`, desc: 'Open UtkalSuraksha Emergency SOS (112)' },
                { shortcut: 'Esc', desc: 'Close any active modal or dialogue window' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800"
                >
                  <span className="text-stone-300">{item.desc}</span>
                  <kbd className="px-2.5 py-1 rounded-md bg-stone-850 text-amber-300 border border-stone-700 font-mono font-bold text-[11px] shadow-sm">
                    {item.shortcut}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-stone-400" />
                Active Platform: <strong className="text-white uppercase">{activePlatform}</strong>
              </span>
              <button
                onClick={() => setShowShortcuts(false)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
