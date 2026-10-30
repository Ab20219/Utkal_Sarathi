import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DistrictsExplorerView } from './components/DistrictsExplorerView';
import { UtkalKathaView } from './components/UtkalKathaView';
import { FloatingAudioBar } from './components/FloatingAudioBar';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { TransitMatrix } from './components/TransitMatrix';
import { UtkalSuraksha } from './components/UtkalSuraksha';
import { CuisineAndCrafts } from './components/CuisineAndCrafts';
import { VisionAndRoadmap } from './components/VisionAndRoadmap';
import { OdishaGeoMap } from './components/OdishaGeoMap';
import { AiAssistantModal } from './components/AiAssistantModal';
import { OfflineModal } from './components/OfflineModal';
import { ShareAppModal } from './components/ShareAppModal';
import { UtkalSanghaModal } from './components/UtkalSanghaModal';
import { DistrictDossierModal } from './components/DistrictDossierModal';
import { socialService } from './services/socialService';
import { DistrictInfo } from './data/odishaDistricts';
import { KathaStory, ALL_KATHA_STORIES } from './data/kathaCatalog';
import { AppLanguage, t } from './data/i18n';
import { usePlatform } from './context/PlatformContext';
import { unifiedVoicePipeline } from './services/unifiedVoicePipeline';
import {
  registerAndroidBackButton,
} from './utils/nativeAndroid';
import { Bot, Heart } from 'lucide-react';

export default function App() {
  const { isNativeApp } = usePlatform();
  const [currentTab, setCurrentTabState] = useState<string>('districts');
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const stored = localStorage.getItem('utkal_lang');
      if (stored === 'or' || stored === 'hi' || stored === 'en') return stored;
    } catch {}
    return 'en';
  });

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('utkal_lang', lang);
    } catch {}
  }, []);

  // Modals state
  const [isOfflineOpen, setIsOfflineOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

  const [savedTripNotes, setSavedTripNotes] = useState<string>(() => {
    return (
      localStorage.getItem('utkalsarathi_saved_trip') ||
      '3-Day Golden Triangle & Heritage Crafts Tour (Bhubaneswar - Konark - Puri - Raghurajpur)'
    );
  });
  const [isOfflineReady, setIsOfflineReady] = useState<boolean>(() => {
    return !!localStorage.getItem('utkalsarathi_offline_pack');
  });

  // Audio Player State
  const [activeStory, setActiveStory] = useState<KathaStory | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // Navigation history stack for Android Hardware Back Button
  const tabHistoryRef = useRef<string[]>(['districts']);
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
  const isDossierOpenRef = useRef<boolean>(isDossierOpen);
  isDossierOpenRef.current = isDossierOpen;

  useEffect(() => {
    socialService
      .getRequests()
      .then((r) => {
        setPendingRequestsCount(r.incoming.length);
      })
      .catch(() => {});
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Native Android Back Navigation
  useEffect(() => {
    const cleanupBack = registerAndroidBackButton(() => {
      if (isDossierOpenRef.current) {
        setIsDossierOpen(false);
        return;
      }
      if (isShareOpenRef.current) {
        setIsShareOpen(false);
        return;
      }
      if (isFriendsOpenRef.current) {
        setIsFriendsOpen(false);
        return;
      }
      if (isAssistantOpenRef.current) {
        setIsAssistantOpen(false);
        return;
      }
      if (isOfflineOpenRef.current) {
        setIsOfflineOpen(false);
        return;
      }

      const stack = tabHistoryRef.current;
      if (stack.length > 1) {
        stack.pop();
        const previousTab = stack[stack.length - 1] || 'districts';
        setCurrentTabState(previousTab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    });

    return () => {
      cleanupBack();
    };
  }, []);

  // Audio Playback Handling
  const handlePlayStory = useCallback(
    (story: KathaStory) => {
      setActiveStory(story);
      setIsAudioPlaying(true);
      setIsAudioPaused(false);

      const title = language === 'or' ? story.titleOdia : language === 'hi' ? story.titleHindi : story.titleEn;
      const body = language === 'or' ? story.bodyOdia : language === 'hi' ? story.bodyHindi : story.bodyEn;
      const fullText = `${title}. ${body}`;

      unifiedVoicePipeline.speak({
        text: fullText,
        lang: language,
        playbackSpeed: audioSpeed,
        onStart: () => {
          setIsAudioPlaying(true);
          setIsAudioPaused(false);
        },
        onEnded: () => {
          setIsAudioPlaying(false);
          setIsAudioPaused(false);
          setActiveStory(null);
        },
        onError: () => {
          setIsAudioPlaying(false);
          setIsAudioPaused(false);
        },
      });
    },
    [language, audioSpeed]
  );

  const handleTogglePlayPause = useCallback(() => {
    if (isAudioPaused) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      setIsAudioPaused(false);
      setIsAudioPlaying(true);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsAudioPaused(true);
      setIsAudioPlaying(false);
    }
  }, [isAudioPaused]);

  const handleStopAudio = useCallback(() => {
    unifiedVoicePipeline.stopAll();
    setIsAudioPlaying(false);
    setIsAudioPaused(false);
    setActiveStory(null);
  }, []);

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      setAudioSpeed(newSpeed);
      if (activeStory && isAudioPlaying) {
        handlePlayStory(activeStory);
      }
    },
    [activeStory, isAudioPlaying, handlePlayStory]
  );

  const handleSelectDistrict = useCallback((district: DistrictInfo) => {
    setSelectedDistrict(district);
    setIsDossierOpen(true);
  }, []);

  const handleShareStory = useCallback((story: KathaStory) => {
    const title = language === 'or' ? story.titleOdia : language === 'hi' ? story.titleHindi : story.titleEn;
    const body = language === 'or' ? story.bodyOdia : language === 'hi' ? story.bodyHindi : story.bodyEn;
    const text = encodeURIComponent(
      `🎙️ UtkalSarathi — Utkal Katha:\n*${title}*\n\n${body.slice(0, 300)}...\n\nExplore Odisha at https://utkalsarathi.vercel.app`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }, [language]);

  const handleShareDistrict = useCallback((district: DistrictInfo) => {
    const text = encodeURIComponent(
      `🏛️ UtkalSarathi — ${district.name} (${district.odiaName}), Odisha:\n${district.tagline}\nTop places: ${district.highlights.join(
        ', '
      )}\n\nExplore Odisha at https://utkalsarathi.vercel.app`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }, []);

  const getActiveStoryTitle = () => {
    if (!activeStory) return '';
    if (language === 'or') return activeStory.titleOdia;
    if (language === 'hi') return activeStory.titleHindi;
    return activeStory.titleEn;
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#f7f3e8] flex flex-col selection:bg-[#ff7a1a] selection:text-stone-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        onOpenSos={() => setCurrentTab('safety')}
        onOpenOffline={() => setIsOfflineOpen(true)}
        isOfflineReady={isOfflineReady}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenFriends={() => setIsFriendsOpen(true)}
        onOpenCloudVault={() => setIsOfflineOpen(true)}
        pendingFriendRequestsCount={pendingRequestsCount}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 pb-24 md:pb-12">
        {currentTab === 'districts' && (
          <DistrictsExplorerView
            language={language}
            onSelectDistrict={handleSelectDistrict}
            onPlayStory={handlePlayStory}
            onShareDistrict={handleShareDistrict}
            onOpenOfflinePack={() => setIsOfflineOpen(true)}
            onOpenTripPlanner={() => setCurrentTab('planner')}
            onOpenSafety={() => setCurrentTab('safety')}
            onOpenKatha={() => setCurrentTab('katha')}
          />
        )}

        {currentTab === 'katha' && (
          <UtkalKathaView
            language={language}
            playingStoryId={activeStory ? activeStory.id : null}
            onPlayStory={handlePlayStory}
            onStopStory={handleStopAudio}
            onShareStory={handleShareStory}
          />
        )}

        {currentTab === 'planner' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
            <div className="border-b border-[#2a3140] pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f7f3e8] flex items-center gap-2 font-serif-brand">
                <span>🎒</span>
                <span>{t(language, 'plannerTitle')}</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#b6b1a6] mt-1">
                {t(language, 'plannerSubtitle')}
              </p>
            </div>
            <ItineraryPlanner
              onSaveToOffline={(notes) => {
                setSavedTripNotes(notes);
                setIsOfflineReady(true);
              }}
              onOpenAssistant={(prompt) => {
                setAssistantInitialPrompt(prompt);
                setIsAssistantOpen(true);
              }}
              onNavigateToAudio={() => setCurrentTab('katha')}
            />
          </div>
        )}

        {currentTab === 'geomap' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
            <div className="border-b border-[#2a3140] pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f7f3e8] flex items-center gap-2 font-serif-brand">
                <span>🧭</span>
                <span>{t(language, 'fareTitle')}</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#b6b1a6] mt-1">
                {t(language, 'fareDisclaimer')}
              </p>
            </div>
            <OdishaGeoMap
              onOpenAssistant={(prompt) => {
                setAssistantInitialPrompt(prompt);
                setIsAssistantOpen(true);
              }}
            />
            <div className="pt-6">
              <TransitMatrix />
            </div>
          </div>
        )}

        {currentTab === 'mitra' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="rounded-2xl bg-[#13161c] border border-[#e5b85b]/40 p-6 shadow-xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff7a1a]/20 border border-[#ff7a1a]/40 flex items-center justify-center mx-auto text-3xl">
                🤖
              </div>
              <h2 className="text-2xl font-black text-[#f7f3e8] font-serif-brand">
                {t(language, 'mitraTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-[#b6b1a6] max-w-xl mx-auto">
                {t(language, 'mitraSubtitle')}
              </p>
              <button
                type="button"
                onClick={() => setIsAssistantOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ff7a1a] hover:bg-[#e06308] text-stone-950 font-bold text-sm shadow-xl active:scale-95 transition-all"
              >
                <Bot className="w-5 h-5" />
                <span>Launch Utkal Mitra Live Assistant</span>
              </button>
            </div>
          </div>
        )}

        {currentTab === 'culture' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
            <div className="border-b border-[#2a3140] pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f7f3e8] flex items-center gap-2 font-serif-brand">
                <span>🎨</span>
                <span>GI Crafts, Handlooms &amp; Odia Culinary Heritage</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#b6b1a6] mt-1">
                Discover GI-tagged Raghurajpur Pattachitra, Cuttack Rupa Tarakasi, Sambalpuri Bandha, Kotpad dye, Pahala Rasagola, and Nayagarh Chhena Poda.
              </p>
            </div>
            <CuisineAndCrafts />
          </div>
        )}

        {currentTab === 'safety' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
            <div className="border-b border-[#2a3140] pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f7f3e8] flex items-center gap-2 font-serif-brand">
                <span>🛡️</span>
                <span>{t(language, 'safetyTitle')}</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#b6b1a6] mt-1">
                {t(language, 'safetySubtitle')}
              </p>
            </div>
            <UtkalSuraksha />
          </div>
        )}

        {currentTab === 'roadmap' && <VisionAndRoadmap />}
      </main>

      {/* Floating Audio Bar matching Application 1 */}
      <FloatingAudioBar
        isPlaying={isAudioPlaying}
        isPaused={isAudioPaused}
        title={getActiveStoryTitle()}
        destination={activeStory ? activeStory.destinationName : ''}
        classification={activeStory ? activeStory.factClassification : ''}
        speed={audioSpeed}
        onSpeedChange={handleSpeedChange}
        onTogglePlayPause={handleTogglePlayPause}
        onStop={handleStopAudio}
        language={language}
      />

      {/* Floating Action Button for Utkal Mitra Assistant */}
      <button
        onClick={() => {
          setAssistantInitialPrompt(undefined);
          setIsAssistantOpen(true);
        }}
        className="fixed bottom-[4.75rem] md:bottom-6 right-3.5 md:right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-red-700 via-[#ff7a1a] to-[#e5b85b] hover:from-red-600 hover:to-[#e5b85b] text-stone-950 font-black text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all border border-[#e5b85b]/40"
        aria-label="Open Utkal Mitra AI Travel Assistant"
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">Ask Utkal Mitra</span>
        <span className="sm:hidden text-xs">Mitra AI</span>
      </button>

      {/* Mobile Smartphone Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={currentTab}
        setActiveTab={setCurrentTab}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Modals */}
      <DistrictDossierModal
        district={selectedDistrict}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onPlanTripToDistrict={(distName) => {
          setIsDossierOpen(false);
          setCurrentTab('planner');
        }}
        onAskAiAboutDistrict={(dist) => {
          setIsDossierOpen(false);
          setAssistantInitialPrompt(`Tell me all about traveling in ${dist.name} (${dist.odiaName}), Odisha.`);
          setIsAssistantOpen(true);
        }}
      />

      <AiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        language={language}
        setLanguage={setLanguage}
        initialPrompt={assistantInitialPrompt}
        onSelectDistrictForTrip={(districtName) => {
          setCurrentTab('planner');
        }}
      />

      <ShareAppModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      <UtkalSanghaModal isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} />

      <OfflineModal
        isOpen={isOfflineOpen}
        onClose={() => setIsOfflineOpen(false)}
        savedTripNotes={savedTripNotes}
        onPackUpdated={() => setIsOfflineReady(true)}
      />

      {/* Footer matching Application 1 */}
      <footer className="bg-[#13161c] border-t border-[#2a3140] text-[#b6b1a6] text-xs py-8 sm:py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <strong className="text-[#f7f3e8] text-sm">UtkalSarathi — Smart Tourism &amp; Safety for Odisha</strong>
              <p className="text-[11px] text-[#b6b1a6] mt-0.5">
                All 30 Official Districts • English, ଓଡ଼ିଆ &amp; हिन्दी • Emergency Police/Fire: 112 • Ambulance: 108
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <a
                href="https://odishatourism.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e5b85b] hover:underline"
              >
                Odisha Tourism
              </a>
              <span>•</span>
              <a
                href="https://www.ecotourodisha.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e5b85b] hover:underline"
              >
                Eco-Tour Odisha
              </a>
              <span>•</span>
              <a
                href="https://osdma.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e5b85b] hover:underline"
              >
                OSDMA Alerts
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
