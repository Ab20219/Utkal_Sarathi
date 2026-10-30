import React from 'react';
import type { AppLanguage } from '../data/i18n';
import { t } from '../data/i18n';
import { usePlatform } from '../context/PlatformContext';
import { ThemeToggle } from './ThemeToggle';
import {
  ShieldAlert,
  Share2,
  Users,
  Compass,
  Volume2,
  Calendar,
  MapPin,
  Bot,
  UtensilsCrossed,
  Sparkles,
  Cloud,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  onOpenSos: () => void;
  onOpenOffline: () => void;
  isOfflineReady: boolean;
  onOpenShare?: () => void;
  onOpenFriends?: () => void;
  onOpenCloudVault?: () => void;
  pendingFriendRequestsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onOpenSos,
  onOpenOffline,
  isOfflineReady,
  onOpenShare,
  onOpenFriends,
  onOpenCloudVault,
  pendingFriendRequestsCount = 0,
}) => {
  const { isNativeApp } = usePlatform();

  const navItems = [
    { id: 'districts', label: t(language, 'navExplore'), icon: '🏛️' },
    { id: 'katha', label: t(language, 'navKatha'), icon: '🎙️' },
    { id: 'planner', label: t(language, 'navPlanner'), icon: '🎒' },
    { id: 'geomap', label: t(language, 'navGeoMap'), icon: '🧭' },
    { id: 'mitra', label: t(language, 'navMitra'), icon: '🤖' },
    { id: 'culture', label: t(language, 'navCrafts'), icon: '🎨' },
    { id: 'safety', label: t(language, 'navSafety'), icon: '🛡️' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 bg-[#0b0d10]/95 backdrop-blur-md border-b border-[#2a3140] text-[#f7f3e8] shadow-xl ${
        isNativeApp ? 'pt-[env(safe-area-inset-top)]' : ''
      }`}
    >
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand Lockup */}
          <button
            type="button"
            onClick={() => setCurrentTab('districts')}
            className="flex items-center gap-3 text-left group transition-all shrink-0 min-w-0"
            aria-label="UtkalSarathi Home"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#13161c] border border-[#e5b85b]/50 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <img
                src="/images/utkal-emblem.jpg"
                alt="UtkalSarathi Konark Chariot Wheel & Compass Emblem"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-2xl tracking-tight text-[#f7f3e8] font-serif-brand">
                  Utkal<span className="text-[#e5b85b]">Sarathi</span>
                </span>
                <span className="hidden lg:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ff7a1a]/15 text-[#ff7a1a] border border-[#ff7a1a]/30">
                  {t(language, 'tagline')}
                </span>
              </div>
              <p className="text-[11px] text-[#b6b1a6] font-medium hidden sm:block truncate">
                {language === 'or' ? 'ଓଡ଼ିଶାର ୩୦ଟି ଜିଲ୍ଲା • ସ୍ମାର୍ଟ ପର୍ଯ୍ୟଟନ ଓ ଯାତ୍ରୀ ସୁରକ୍ଷା' : language === 'hi' ? 'ओडिशा के ३० जिले • स्मार्ट पर्यटन व यात्री सुरक्षा' : 'All 30 Odisha Districts • Smart Tourism & Traveler Safety'}
              </p>
            </div>
          </button>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher Buttons matching Application 1 */}
            <div
              className="flex items-center bg-[#13161c] rounded-xl p-1 border border-[#2a3140] shrink-0"
              role="group"
              aria-label="Select Interface Language"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-[#ff7a1a] text-stone-950 shadow-sm'
                    : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('or')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'or'
                    ? 'bg-[#ff7a1a] text-stone-950 shadow-sm'
                    : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
                }`}
              >
                ଓଡ଼ିଆ
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'hi'
                    ? 'bg-[#ff7a1a] text-stone-950 shadow-sm'
                    : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Cloud Vault Button */}
            {onOpenCloudVault && (
              <button
                type="button"
                onClick={onOpenCloudVault}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b2029] hover:bg-[#242b38] border border-[#2a3140] text-[#f7f3e8] text-xs font-semibold transition-all active:scale-95"
                title="Cloud Vault — Sync Trips & Contacts"
              >
                <Cloud className="w-3.5 h-3.5 text-[#1ca39e]" />
                <span>{t(language, 'cloudSyncBtn')}</span>
              </button>
            )}

            {/* Utkal Sangha (Friends) */}
            {onOpenFriends && (
              <button
                type="button"
                onClick={onOpenFriends}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#1b2029] hover:bg-[#242b38] border border-[#2a3140] text-[#f7f3e8] text-xs font-semibold transition-all active:scale-95"
                title="Utkal Sangha — Connect with Friends"
              >
                <Users className="w-3.5 h-3.5 text-[#e5b85b]" />
                <span className="hidden sm:inline">Sangha</span>
                {pendingFriendRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff7a1a] text-stone-950 font-black text-[9px] flex items-center justify-center animate-bounce">
                    {pendingFriendRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Share Button */}
            {onOpenShare && (
              <button
                type="button"
                onClick={onOpenShare}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#25d366]/15 hover:bg-[#25d366]/25 border border-[#25d366]/35 text-[#25d366] text-xs font-bold transition-all active:scale-95"
                title="Share UtkalSarathi App"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Share</span>
              </button>
            )}

            {/* System / Dark / Light Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle compact />
            </div>

            {/* Emergency SOS 112 Button */}
            <button
              type="button"
              onClick={onOpenSos}
              className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-red-950/60 transition-all shrink-0"
              aria-label="Dial Emergency SOS 112"
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>SOS 112</span>
            </button>
          </div>
        </div>

        {/* Primary Desktop Navigation Bar */}
        <nav
          className="hidden md:flex items-center gap-1 py-2 border-t border-[#2a3140]/60 overflow-x-auto custom-scrollbar"
          aria-label="Primary Navigation"
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#ff7a1a] text-stone-950 shadow-md font-extrabold scale-[1.02]'
                    : 'text-[#b6b1a6] hover:text-[#f7f3e8] hover:bg-[#1b2029]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
