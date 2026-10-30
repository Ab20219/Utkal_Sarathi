import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DesktopWindowControls } from './components/DesktopWindowControls';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { TransitMatrix } from './components/TransitMatrix';
import { UtkalSuraksha } from './components/UtkalSuraksha';
import { AudioStories } from './components/AudioStories';
import { CuisineAndCrafts } from './components/CuisineAndCrafts';
import { VisionAndRoadmap } from './components/VisionAndRoadmap';
import { OdishaGeoMap } from './components/OdishaGeoMap';
import { AiAssistantModal } from './components/AiAssistantModal';
import { OfflineModal } from './components/OfflineModal';
import { ShareAppModal } from './components/ShareAppModal';
import { UtkalSanghaModal } from './components/UtkalSanghaModal';
import { socialService } from './services/socialService';
import { SupportedLanguage, TabType } from './types';
import { usePlatform } from './context/PlatformContext';
import {
  registerAndroidBackButton,
  minimizeNativeAndroidApp,
  subscribeAppLifecycle,
} from './utils/nativeAndroid';
import { Bot, Heart } from 'lucide-react';

export default function App() {
  const { isMobile, isNativeApp, isStandalone } = usePlatform();
  const [currentTab, setCurrentTabState] = useState<string>('itinerary');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isOfflineOpen, setIsOfflineOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);
  const [savedTripNotes, setSavedTripNotes] = useState<string>(() => {
    return (
      localStorage.getItem('utkalsarathi_saved_trip') ||
      '3-Day Golden Triangle & Heritage Crafts Tour (Bhubaneswar - Konark - Puri - Raghurajpur)'
    );
  });
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(() => {
    return !!localStorage.getItem('utkalsarathi_offline_pack');
  });
  const [selectedStoryId, setSelectedStoryId] = useState<string | undefined>(undefined);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState<boolean>(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

  // Navigation history stack for Android Hardware Back Button & Gesture Navigation
  const tabHistoryRef = useRef<string[]>(['itinerary']);
  const currentTabRef = useRef<string>(currentTab);
  currentTabRef.current = currentTab;
  const isAssistantOpenRef = useRef<boolean>(isAssistantOpen);
  isAssistantOpenRef.current = isAssistantOpen;
  const isOfflineOpenRef = useRef<boolean>(isOfflineOpen);
  isOfflineOpenRef.current = isOfflineOpen;
  const isShareOpenRef = useRef<boolean>(isShareOpen);
  isShareOpenRef.current = isShareOpen;
  const isFriendsOpenRef = useRef<boolean>(isFriendsOpen);
  isFriendsOpenRef.current = isFriendsOpen;

  useEffect(() => {
    socialService.getRequests().then((r) => {
      setPendingRequestsCount(r.incoming.length);
    }).catch(() => {});
  }, []);

  const setCurrentTab = useCallback((nextTab: string) => {
    setCurrentTabState((prev) => {
      if (prev !== nextTab) {
        const stack = tabHistoryRef.current;
        if (stack[stack.length - 1] !== nextTab) {
          stack.push(nextTab);
          if (stack.length > 20) stack.shift();
        }
      }
      return nextTab;
    });
  }, []);

  // Native Android Back Navigation (3-button & One UI swipe-back gesture)
  useEffect(() => {
    const cleanupBack = registerAndroidBackButton(() => {
      // 1. Close share and friends modals first
      if (isShareOpenRef.current) {
        setIsShareOpen(false);
        return;
      }
      if (isFriendsOpenRef.current) {
        setIsFriendsOpen(false);
        return;
      }

      // 2. Close global AI Assistant modal next
      if (isAssistantOpenRef.current) {
        setIsAssistantOpen(false);
        return;
      }

      // 3. Close Offline Pack modal next
      if (isOfflineOpenRef.current) {
        setIsOfflineOpen(false);
        return;
      }

      // 3. Let any active child modal (Dossier, Refine Schedule, Destination detail) handle Back first
      const childBackEvent = new CustomEvent('utkalsarathi:android-back', { cancelable: true });
      const notHandledByChild = window.dispatchEvent(childBackEvent);
      if (!notHandledByChild) {
        return;
      }

      // 4. Navigate back through tab history stack
      const stack = tabHistoryRef.current;
      if (stack.length > 1) {
        stack.pop();
        const previousTab = stack[stack.length - 1] || 'itinerary';
        setCurrentTabState(previousTab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (currentTabRef.current !== 'itinerary') {
        tabHistoryRef.current = ['itinerary'];
        setCurrentTabState('itinerary');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 5. At home root with no modals open -> minimize Android app cleanly
      void minimizeNativeAndroidApp();
    });

    return cleanupBack;
  }, []);

  // Native Android App Lifecycle (foreground/background management for mic & audio)
  useEffect(() => {
    const cleanupLifecycle = subscribeAppLifecycle((isActive) => {
      window.dispatchEvent(
        new CustomEvent('utkalsarathi:app-lifecycle', { detail: { isActive } })
      );
    });
    return cleanupLifecycle;
  }, []);

  // Cross-Platform Global Desktop & Tablet Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAssistantOpen(true);
      } else if (isMod && e.key === '1') {
        e.preventDefault();
        setCurrentTab('itinerary');
      } else if (isMod && e.key === '2') {
        e.preventDefault();
        setCurrentTab('map');
      } else if (isMod && e.key === '3') {
        e.preventDefault();
        setCurrentTab('transit');
      } else if (isMod && e.key === '4') {
        e.preventDefault();
        setCurrentTab('audio');
      } else if (isMod && e.key === '5') {
        e.preventDefault();
        setCurrentTab('cuisine');
      } else if (isMod && e.key === '6') {
        e.preventDefault();
        setCurrentTab('safety');
      } else if (e.key === 'Escape') {
        setIsAssistantOpen(false);
        setIsOfflineOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentTab]);

  const handleNavigateToAudio = (storyId?: string) => {
    if (storyId) setSelectedStoryId(storyId);
    setCurrentTab('audio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToOffline = (notes: string) => {
    setSavedTripNotes(notes);
    localStorage.setItem('utkalsarathi_saved_trip', notes);
    setIsOfflineReady(true);
  };

  const handleOpenAssistantWithPrompt = (prompt?: string) => {
    setAssistantInitialPrompt(prompt);
    setIsAssistantOpen(true);
  };

  // Convert internal tab to TabType for MobileBottomNav
  const getMobileActiveTab = (): TabType => {
    switch (currentTab) {
      case 'itinerary':
        return 'discover';
      case 'map':
        return 'map';
      case 'transit':
        return 'transit';
      case 'audio':
        return 'stories';
      case 'cuisine':
        return 'culture';
      case 'safety':
        return 'safety';
      default:
        return 'discover';
    }
  };

  const handleMobileTabSelect = (tab: TabType) => {
    switch (tab) {
      case 'discover':
        setCurrentTab('itinerary');
        break;
      case 'map':
        setCurrentTab('map');
        break;
      case 'transit':
        setCurrentTab('transit');
        break;
      case 'stories':
        setCurrentTab('audio');
        break;
      case 'culture':
        setCurrentTab('cuisine');
        break;
      case 'safety':
        setCurrentTab('safety');
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hide desktop/preview window chrome inside Native Android APK & standalone mobile installs
  const showDesktopChrome = !isNativeApp && !(isStandalone && isMobile);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950 pb-24 md:pb-0 transition-colors duration-200">
      {/* Network Status Toast / Banner */}
      <OfflineIndicator />

      {/* Desktop & Web Preview System Window Frame (Hidden inside Native Android APK) */}
      {showDesktopChrome && (
        <DesktopWindowControls onOpenAssistant={() => setIsAssistantOpen(true)} />
      )}

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'assistant') {
            setIsAssistantOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        language={language}
        setLanguage={setLanguage}
        onOpenSos={() => {
          setCurrentTab('safety');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenOffline={() => setIsOfflineOpen(true)}
        isOfflineReady={isOfflineReady}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenFriends={() => setIsFriendsOpen(true)}
        pendingFriendRequestsCount={pendingRequestsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8">
        {currentTab === 'itinerary' && (
          <ItineraryPlanner
            onSaveToOffline={handleSaveToOffline}
            onOpenAssistant={handleOpenAssistantWithPrompt}
            onNavigateToAudio={handleNavigateToAudio}
          />
        )}

        {currentTab === 'map' && (
          <OdishaGeoMap
            onOpenAssistant={handleOpenAssistantWithPrompt}
            onSelectDestination={(dest) => {
              setCurrentTab('itinerary');
              handleOpenAssistantWithPrompt(
                `Tell me about visiting ${dest.name} in ${dest.district}.`
              );
            }}
          />
        )}

        {currentTab === 'transit' && <TransitMatrix />}

        {currentTab === 'safety' && <UtkalSuraksha />}

        {currentTab === 'audio' && (
          <AudioStories
            onOpenAssistant={handleOpenAssistantWithPrompt}
            initialStoryId={selectedStoryId}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {currentTab === 'cuisine' && <CuisineAndCrafts />}

        {currentTab === 'roadmap' && <VisionAndRoadmap />}
      </main>

      {/* Floating Action Button for Utkal Mitra Assistant */}
      <button
        onClick={() => {
          setAssistantInitialPrompt(undefined);
          setIsAssistantOpen(true);
        }}
        className="fixed bottom-[4.75rem] md:bottom-6 right-3.5 md:right-6 z-30 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-red-700 via-amber-600 to-amber-500 hover:from-red-600 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-red-950/80 hover:scale-105 active:scale-95 transition-all border border-amber-300/30"
        aria-label="Open Utkal Mitra AI Travel Assistant"
      >
        <Bot className="w-4 sm:w-5 h-4 sm:h-5 animate-pulse" />
        <span className="hidden sm:inline">Ask Utkal Mitra</span>
        <span className="sm:hidden text-xs">Utkal Mitra</span>
      </button>

      {/* Mobile Smartphone Native Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={getMobileActiveTab()}
        setActiveTab={handleMobileTabSelect}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Modals */}
      <AiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        language={language}
        setLanguage={setLanguage}
        initialPrompt={assistantInitialPrompt}
        onSelectDistrictForTrip={(districtName) => {
          setCurrentTab('itinerary');
          handleOpenAssistantWithPrompt(
            `Create a customized travel itinerary for exploring ${districtName} district in Odisha.`
          );
        }}
      />

      <OfflineModal
        isOpen={isOfflineOpen}
        onClose={() => setIsOfflineOpen(false)}
        savedTripNotes={savedTripNotes}
        onPackUpdated={() => setIsOfflineReady(true)}
      />

      {/* Footer: Compact in Native Android App, Full on Web */}
      {isNativeApp ? (
        <footer className="bg-stone-900/70 border-t border-stone-800/80 text-stone-400 text-[11px] py-4 px-4 mt-6 text-center">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2">
            <span className="font-bold text-stone-300">
              Utkal<span className="text-amber-400">Sarathi</span> Android
            </span>
            <button
              onClick={() => {
                setCurrentTab('roadmap');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              About &amp; Vision
            </button>
          </div>
        </footer>
      ) : (
        <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 text-xs py-8 sm:py-10 mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-stone-100 text-base">
                    Utkal<span className="text-amber-400">Sarathi</span>
                  </span>
                  <span className="text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-[10px]">
                    OSFIC Tourism &amp; Culture
                  </span>
                </div>
                <p className="text-stone-400 text-xs max-w-md leading-relaxed">
                  An AI-powered, multilingual smart tourism, cultural discovery, and traveller safety
                  platform for Odisha. Connecting travelers with verified Mo Bus transport, fair tariffs,
                  sacred heritage stories, and authentic local artisans.
                </p>
              </div>

              <div>
                <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px] block mb-2">
                  Primary Modules
                </span>
                <ul className="space-y-1.5">
                  <li>
                    <button
                      onClick={() => setCurrentTab('itinerary')}
                      className="hover:text-amber-400 transition-colors"
                    >
                      AI Itinerary Planning
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentTab('map')}
                      className="hover:text-amber-400 transition-colors"
                    >
                      Odisha Geo-Map &amp; Routes
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentTab('transit')}
                      className="hover:text-amber-400 transition-colors"
                    >
                      Mo Bus &amp; Regulated Transit
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentTab('safety')}
                      className="hover:text-amber-400 transition-colors"
                    >
                      UtkalSuraksha (Safety &amp; SOS)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentTab('audio')}
                      className="hover:text-amber-400 transition-colors"
                    >
                      Utkal Katha (Voice Stories)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentTab('cuisine')}
                      className="hover:text-amber-400 transition-colors"
                    >
                      Odia Cuisine &amp; Artisans
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px] block mb-2">
                  Grounded Knowledge Sources
                </span>
                <ul className="space-y-1.5 text-stone-400 text-[11px]">
                  <li>• Odisha Tourism Dev. Corp. (OTDC)</li>
                  <li>• Capital Region Urban Transport (CRUT Mo Bus)</li>
                  <li>• Archaeological Survey of India (ASI)</li>
                  <li>• Shree Jagannath Temple Administration</li>
                  <li>• Odisha State Disaster Mgmt. Authority (OSDMA)</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
              <div>
                © 2026 UtkalSarathi — Odisha Smart Tourism, Cultural Discovery &amp; Traveller Safety Platform.
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-850 text-[10px] text-stone-400">
                  Native Android APK &amp; Cross-Platform Web v2.5
                </span>
                <Heart className="w-3.5 h-3.5 text-red-500 fill-current ml-1" />
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Share Application Modal */}
      <ShareAppModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      {/* Utkal Sangha (Friends & Companions) Modal */}
      <UtkalSanghaModal
        isOpen={isFriendsOpen}
        onClose={() => {
          setIsFriendsOpen(false);
          socialService
            .getRequests()
            .then((r) => setPendingRequestsCount(r.incoming.length))
            .catch(() => {});
        }}
        onOpenShareModal={() => {
          setIsFriendsOpen(false);
          setIsShareOpen(true);
        }}
      />
    </div>
  );
}
