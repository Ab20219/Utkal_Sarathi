import React from 'react';
import { SupportedLanguage } from '../types';
import { usePlatform } from '../context/PlatformContext';
import { ThemeToggle } from './ThemeToggle';
import {
  ShieldAlert,
  Compass,
  Bus,
  Volume2,
  UtensilsCrossed,
  Bot,
  Download,
  Globe,
  Milestone,
  Share2,
  Users,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onOpenSos: () => void;
  onOpenOffline: () => void;
  isOfflineReady: boolean;
  onOpenShare?: () => void;
  onOpenFriends?: () => void;
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
  pendingFriendRequestsCount = 0,
}) => {
  const { modKey, isNativeApp } = usePlatform();

  return (
    <header
      className={`sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-amber-900/40 text-stone-100 shadow-lg ${
        isNativeApp ? 'pt-[env(safe-area-inset-top)]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          {/* Logo & Brand */}
          <button
            onClick={() => setCurrentTab('itinerary')}
            className="flex items-center gap-2 sm:gap-3 text-left group transition-all min-w-0"
            aria-label="UtkalSarathi Home"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-600 via-red-800 to-stone-950 border border-amber-500/40 flex items-center justify-center shadow-md shadow-orange-950/50 group-hover:scale-105 transition-transform shrink-0 overflow-hidden p-1">
              <img
                src="/icon.svg"
                alt="UtkalSarathi Jagannath Temple Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white truncate">
                  Utkal<span className="text-amber-400">Sarathi</span>
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Discover Odisha, Your Way
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden md:block">
                Discover Odisha, Your Way. • Smart Tourism &amp; Safety
              </p>
            </div>
          </button>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* SOS Shortcut */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-[11px] sm:text-sm shadow-md shadow-red-900/40 transition-all whitespace-nowrap min-h-[36px]"
              aria-label="Open UtkalSuraksha Emergency SOS Help"
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">112</span>
              <span className="hidden sm:inline">SOS (112)</span>
            </button>

            {/* Quick AI Search Assistant Trigger on Tablet/Desktop */}
            <button
              onClick={() => setCurrentTab('assistant')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 text-xs sm:text-sm font-semibold transition-colors"
              title={`Ask Utkal Mitra Travel Assistant (${modKey}K)`}
              aria-label="Open Utkal Mitra AI Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Ask AI</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.2 rounded bg-purple-900/60 text-[10px] font-mono text-purple-300 border border-purple-700">
                {modKey}K
              </kbd>
            </button>

            {/* Offline Pack */}
            <button
              onClick={onOpenOffline}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-95 border border-stone-700 text-stone-200 text-xs sm:text-sm font-medium transition-colors min-h-[36px]"
              aria-label="Open Offline Travel Pack"
              title="Download emergency info for offline access"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Offline Pack</span>
              {isOfflineReady && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Offline ready" />
              )}
            </button>

            {/* Utkal Sangha (Friends & Companions) */}
            {onOpenFriends && (
              <button
                onClick={onOpenFriends}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-95 border border-stone-700 text-stone-200 text-xs sm:text-sm font-medium transition-colors min-h-[36px]"
                title="Utkal Sangha — Connect with Friends & Companions"
                aria-label="Utkal Sangha Friends"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Sangha</span>
                {pendingFriendRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-black text-[9px] flex items-center justify-center animate-bounce">
                    {pendingFriendRequestsCount}
                  </span>
                )}
              </button>
            )}

            {/* Share App Trigger */}
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 active:scale-95 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold transition-colors min-h-[36px]"
                title="Share UtkalSarathi App & Website"
                aria-label="Share UtkalSarathi App"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Share</span>
              </button>
            )}

            {/* System / Dark / Light Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle compact />
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 sm:p-1 border border-stone-700 shrink-0 min-h-[36px]">
              <Globe className="w-3.5 h-3.5 text-stone-400 ml-1 mr-0.5 hidden sm:inline" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs rounded font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('or')}
                className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs rounded font-medium transition-colors whitespace-nowrap ${
                  language === 'or'
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                aria-label="Switch to Odia"
              >
                ଓଡ଼ିଆ<span className="hidden md:inline"> (OR)</span>
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs rounded font-medium transition-colors whitespace-nowrap ${
                  language === 'hi'
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
                aria-label="Switch to Hindi"
              >
                हिन्दी<span className="hidden md:inline"> (HI)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Primary Navigation Tabs (Mobile phones use MobileBottomNav) */}
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar border-t border-stone-800 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setCurrentTab('itinerary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'itinerary'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title={`3-Day Tailored Itinerary Planner (${modKey}1)`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Discover &amp; Itinerary</span>
            <kbd className="hidden xl:inline-block px-1 py-0.2 rounded bg-stone-850 text-[9px] font-mono text-stone-400 border border-stone-750">
              {modKey}1
            </kbd>
          </button>

          <button
            onClick={() => setCurrentTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'map'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title={`Interactive Odisha Geo-Map (${modKey}2)`}
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>Odisha Geo-Map</span>
            <kbd className="hidden xl:inline-block px-1 py-0.2 rounded bg-stone-850 text-[9px] font-mono text-stone-400 border border-stone-750">
              {modKey}2
            </kbd>
          </button>

          <button
            onClick={() => setCurrentTab('transit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'transit'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title={`Regulated Mo Bus & Train Transit Matrix (${modKey}3)`}
          >
            <Bus className="w-4 h-4 text-emerald-400" />
            <span>Transit &amp; Fair Fares</span>
            <kbd className="hidden xl:inline-block px-1 py-0.2 rounded bg-stone-850 text-[9px] font-mono text-stone-400 border border-stone-750">
              {modKey}3
            </kbd>
          </button>

          <button
            onClick={() => setCurrentTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'safety'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title={`UtkalSuraksha Emergency SOS & Safety Hub (${modKey}6)`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>UtkalSuraksha (Safety)</span>
            <kbd className="hidden xl:inline-block px-1 py-0.2 rounded bg-stone-850 text-[9px] font-mono text-stone-400 border border-stone-750">
              {modKey}6
            </kbd>
          </button>

          <button
            onClick={() => setCurrentTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'audio'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title={`Utkal Katha: 25 Historic Places • 100,000+ Words • Hindi & Odia Voice Assistant (${modKey}4)`}
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Utkal Katha (Voice Stories)</span>
            <kbd className="hidden xl:inline-block px-1 py-0.2 rounded bg-stone-850 text-[9px] font-mono text-stone-400 border border-stone-750">
              {modKey}4
            </kbd>
          </button>

          <button
            onClick={() => setCurrentTab('cuisine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'cuisine'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title={`GI Tag Cuisine & Handloom Artisan Directory (${modKey}5)`}
          >
            <UtensilsCrossed className="w-4 h-4 text-orange-400" />
            <span>Cuisine &amp; Artisans</span>
            <kbd className="hidden xl:inline-block px-1 py-0.2 rounded bg-stone-850 text-[9px] font-mono text-stone-400 border border-stone-750">
              {modKey}5
            </kbd>
          </button>

          <button
            onClick={() => setCurrentTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'roadmap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Milestone className="w-4 h-4 text-amber-400" />
            <span>Roadmap &amp; Vision</span>
          </button>

          <button
            onClick={() => setCurrentTab('assistant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
              currentTab === 'assistant'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Utkal Mitra AI (30 Districts)</span>
          </button>

          {onOpenFriends && (
            <button
              onClick={onOpenFriends}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all text-amber-300 hover:text-white hover:bg-stone-800"
              title="Utkal Sangha — Connect with Friends & Travel Companions"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Utkal Sangha (Friends)</span>
              {pendingFriendRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-black text-[9px]">
                  {pendingFriendRequestsCount}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
