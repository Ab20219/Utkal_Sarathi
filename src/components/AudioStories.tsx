import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AUDIO_GUIDE_STORIES, CULTURAL_EVENTS } from '../data/mockData';
import { HISTORIC_CORPUS_STATS } from '../data/odishaHistoricalStories';
import { AudioGuideStory, SupportedLanguage } from '../types';
import { getMonumentVoiceProfile, MonumentVoiceProfile } from '../data/monumentVoiceProfiles';
import { UtkalKathaVoiceAssistant } from './UtkalKathaVoiceAssistant';
import { MonumentEncyclopediaPanel } from './MonumentEncyclopediaPanel';
import { StoryLibraryBrowser } from './StoryLibraryBrowser';
import { useStoryAudioPlayer } from '../hooks/useStoryAudioPlayer';
import {
  Volume2,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  Calendar,
  Languages,
  CheckCircle2,
  Clock,
  MapPin,
  FastForward,
  Rewind,
  QrCode,
  Download,
  Copy,
  Search,
  Radio,
  FileText,
  UserCheck,
  GraduationCap,
  Bot,
  Filter,
  Music,
  Headphones,
  Scroll,
  Layers,
  Award,
  AlertTriangle,
  Mic,
  Sliders,
} from 'lucide-react';

interface AudioStoriesProps {
  onOpenAssistant?: (prompt: string) => void;
  initialStoryId?: string;
  language?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

type VoicePersona = 'royal' | 'temple' | 'historian';

export const AudioStories: React.FC<AudioStoriesProps> = ({
  onOpenAssistant,
  initialStoryId,
  language,
  onLanguageChange,
}) => {
  const initialStory = useMemo(() => {
    if (initialStoryId) {
      const match = AUDIO_GUIDE_STORIES.find((s) => s.id === initialStoryId);
      if (match) return match;
    }
    return AUDIO_GUIDE_STORIES[0];
  }, [initialStoryId]);

  const [selectedStory, setSelectedStory] = useState<AudioGuideStory>(initialStory);
  const [selectedLang, setSelectedLang] = useState<'en' | 'or' | 'hi'>(language || 'en');
  const [viewMode, setViewMode] = useState<'monuments' | 'library'>('monuments');
  const [activeTab, setActiveTab] = useState<'chapters' | 'history' | 'legend' | 'architecture' | 'sources'>('chapters');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Sync with global Navbar language selector
  useEffect(() => {
    if (language && language !== selectedLang) {
      setSelectedLang(language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const updateLanguage = useCallback(
    (nextLang: 'en' | 'or' | 'hi') => {
      setSelectedLang(nextLang);
      setCustomNarrativeOverride(null);
      onLanguageChange?.(nextLang);
    },
    [onLanguageChange]
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [sourceCategoryFilter, setSourceCategoryFilter] = useState<string>('All');

  // Playback preferences
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1.0);
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('royal');
  const [voiceStatusNotice, setVoiceStatusNotice] = useState<string>('');
  const [allowPhoneticFallback, setAllowPhoneticFallback] = useState<boolean>(false);
  const [customNarrativeOverride, setCustomNarrativeOverride] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [pendingAutoPlay, setPendingAutoPlay] = useState<boolean>(false);

  const voiceAssistantSectionRef = useRef<HTMLDivElement | null>(null);

  // Monument-specific voice identity (25 distinct voices across Odisha historic places)
  const activeVoiceProfile: MonumentVoiceProfile = useMemo(() => {
    return getMonumentVoiceProfile(selectedStory.id);
  }, [selectedStory.id]);

  const selectedStoryIndex = useMemo(() => {
    const idx = AUDIO_GUIDE_STORIES.findIndex((s) => s.id === selectedStory.id);
    return idx >= 0 ? idx : 0;
  }, [selectedStory.id]);

  // Ambient sound / Web Audio state
  // Ambient temple drone is OFF by default to guarantee crystal-clear, distortion-free natural voice playback
  const [isAmbienceEnabled, setIsAmbienceEnabled] = useState<boolean>(false);
  const [ambientVolume] = useState<number>(0.04);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientOscillatorsRef = useRef<OscillatorNode[]>([]);

  const stopAmbientSound = useCallback(() => {
    if (ambientOscillatorsRef.current.length > 0) {
      ambientOscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      ambientOscillatorsRef.current = [];
    }
  }, []);

  const startAmbientSound = useCallback(() => {
    if (!isAmbienceEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      stopAmbientSound();

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      ambientGainRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime); // Gentle deep warm acoustic filter
      filter.connect(masterGain);

      const freqs = activeVoiceProfile.droneRootFreqs;
      const oscs: OscillatorNode[] = [];
      freqs.slice(0, 2).forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine'; // Only smooth pure sine waves, no harsh triangles that distort speech
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);

        osc.connect(subGain);
        subGain.connect(filter);
        osc.start();
        oscs.push(osc);
      });
      ambientOscillatorsRef.current = oscs;
    } catch (e) {
      console.warn('Web Audio ambience failed:', e);
    }
  }, [isAmbienceEnabled, ambientVolume, stopAmbientSound, activeVoiceProfile.droneRootFreqs]);

  useEffect(() => {
    if (ambientGainRef.current && audioCtxRef.current) {
      ambientGainRef.current.gain.setValueAtTime(
        isAmbienceEnabled ? ambientVolume : 0,
        audioCtxRef.current.currentTime
      );
    }
  }, [ambientVolume, isAmbienceEnabled]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, [stopAmbientSound]);

  // Filtered stories catalog
  const filteredStories = useMemo(() => {
    return AUDIO_GUIDE_STORIES.filter((story) => {
      const matchesRegion =
        selectedRegion === 'All' ||
        story.region === selectedRegion ||
        (selectedRegion === 'Golden Triangle' &&
          (story.location.includes('Konark') ||
            story.location.includes('Puri') ||
            story.location.includes('Bhubaneswar')));

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesRegion;

      const matchesSearch =
        story.title.toLowerCase().includes(query) ||
        story.odiaTitle.toLowerCase().includes(query) ||
        story.hindiTitle.toLowerCase().includes(query) ||
        story.monument.toLowerCase().includes(query) ||
        story.location.toLowerCase().includes(query) ||
        (story.district && story.district.toLowerCase().includes(query)) ||
        (story.keyHistoricalFigures &&
          story.keyHistoricalFigures.some((f) => f.toLowerCase().includes(query))) ||
        story.documentedHistory.toLowerCase().includes(query);

      return matchesRegion && matchesSearch;
    });
  }, [searchQuery, selectedRegion]);

  const getTranscript = useCallback((story: AudioGuideStory, lang: 'en' | 'or' | 'hi') => {
    switch (lang) {
      case 'or':
        return story.audioTranscriptOr || story.odiaHistorySummary || story.audioTranscriptEn;
      case 'hi':
        return story.audioTranscriptHi || story.hindiHistorySummary || story.audioTranscriptEn;
      case 'en':
      default:
        return story.audioTranscriptEn;
    }
  }, []);

  const currentTranscript = useMemo(() => {
    if (customNarrativeOverride) return customNarrativeOverride.text;
    return getTranscript(selectedStory, selectedLang);
  }, [customNarrativeOverride, getTranscript, selectedStory, selectedLang]);

  // Sequential Audio Playback State Machine (Idle -> Loading -> Playing -> Paused -> Buffering -> Error -> Completed -> Cancelled)
  const player = useStoryAudioPlayer({
    storyId: selectedStory.id,
    storyIndex: selectedStoryIndex,
    narrativeText: currentTranscript,
    lang: selectedLang,
    playbackSpeed,
    allowPhoneticFallback: false,
    onPlaybackStart: undefined,
    onPlaybackStopOrComplete: undefined,
  });

  const {
    playbackState,
    isPlaying,
    isPaused,
    isLoadingAudio: isAiLoading,
    isStoryCompleted: isStoryOver,
    errorMessage: playerErrorMessage,
    voiceProviderLabel,
    chunks,
    currentChunkIndex,
    timeline,
  } = player;

  const currentTimeSec = timeline.elapsedSec;
  const totalDurationSec = timeline.totalDurationSec;
  const progressPercent = timeline.progressPercent;
  const formattedCurrentTime = timeline.formattedElapsed;
  const formattedTotalTime = timeline.formattedTotal;
  const exactDurationMinutes = Math.max(1, Math.round(totalDurationSec / 60));

  // Trigger autoplay safely when switching monuments or clicking "Narrate This Volume"
  useEffect(() => {
    if (pendingAutoPlay && chunks.length > 0 && playbackState === 'Idle') {
      setPendingAutoPlay(false);
      player.startFromSegment(0, 0);
    }
  }, [pendingAutoPlay, chunks.length, playbackState, player]);

  const personaSettings = useMemo(() => {
    switch (voicePersona) {
      case 'royal':
        return {
          label: activeVoiceProfile.voicePersonaTitle[selectedLang] || 'Royal Kalinga Narrator',
          desc: activeVoiceProfile.timbreDescription,
          basePitch: activeVoiceProfile.basePitch,
          rateMultiplier: activeVoiceProfile.rateMultiplier,
        };
      case 'temple':
        return {
          label: 'Sacred Palm-Leaf Chronicler',
          desc: 'Devotional, lyrical cadence inspired by Madala Panji & temple palm-leaf recitations.',
          basePitch: 1.04,
          rateMultiplier: 0.96,
        };
      case 'historian':
        return {
          label: 'Archaeological Epigraphist',
          desc: 'Clear scholarly delivery analyzing rock edicts, copper-plate grants, and ASI strata.',
          basePitch: 1.0,
          rateMultiplier: 1.02,
        };
    }
  }, [voicePersona, activeVoiceProfile, selectedLang]);

  const parsedSources = useMemo(() => {
    const rawSources = selectedStory.historicalSources || [
      'Archaeological Survey of India (ASI) Monument Records & Field Surveys',
      'Epigraphia Indica, Geological Survey of India, and Odisha State Museum Archives',
      'Madala Panji Palm-Leaf Manuscripts, Puri Jagannath Temple Archives',
    ];

    return rawSources.map((src, index) => {
      let category = 'Academic & ASI Records';
      let icon = '🏛️';
      let tagColor = 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40';

      const lower = src.toLowerCase();
      if (lower.includes('inscription') || lower.includes('plate') || lower.includes('edicts') || lower.includes('epigraphia')) {
        category = 'Inscriptions & Epigraphy';
        icon = '📜';
        tagColor = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
      } else if (lower.includes('panji') || lower.includes('purana') || lower.includes('manuscript') || lower.includes('chakada')) {
        category = 'Palm-Leaf Chronicles';
        icon = '🪔';
        tagColor = 'bg-orange-950/40 text-orange-300 border-orange-800/40';
      } else if (lower.includes('xuanzang') || lower.includes('ptolemy') || lower.includes('ain-i-akbari') || lower.includes('taranatha') || lower.includes('tabaqat')) {
        category = 'Classical Foreign Travelers';
        icon = '🌍';
        tagColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      } else if (lower.includes('asi') || lower.includes('excavation') || lower.includes('survey') || lower.includes('nio')) {
        category = 'Excavations & Field Surveys';
        icon = '🔬';
        tagColor = 'bg-purple-950/40 text-purple-300 border-purple-800/40';
      }

      return { id: index + 1, source: src, category, icon, tagColor };
    });
  }, [selectedStory.historicalSources]);

  const filteredSources = useMemo(() => {
    if (sourceCategoryFilter === 'All') return parsedSources;
    return parsedSources.filter((s) => s.category === sourceCategoryFilter);
  }, [parsedSources, sourceCategoryFilter]);

  const handleSelectAndPlayStory = useCallback(
    (story: AudioGuideStory, lang?: 'en' | 'or' | 'hi') => {
      const targetLang = lang || selectedLang;
      if (selectedStory.id === story.id && targetLang === selectedLang && !customNarrativeOverride) {
        player.togglePlayPause();
        return;
      }
      setCustomNarrativeOverride(null);
      setSelectedStory(story);
      if (targetLang !== selectedLang) {
        updateLanguage(targetLang);
      }
      setPendingAutoPlay(true);
    },
    [selectedStory.id, selectedLang, customNarrativeOverride, player, updateLanguage]
  );

  const togglePlayback = () => {
    player.togglePlayPause();
  };

  const handleReset = () => {
    player.replayStory();
  };

  const handleReplay = () => {
    player.replayStory();
  };

  const handlePlayNextMonument = () => {
    const currentIndex = AUDIO_GUIDE_STORIES.findIndex((s) => s.id === selectedStory.id);
    const nextIndex = (currentIndex + 1) % AUDIO_GUIDE_STORIES.length;
    const nextStory = AUDIO_GUIDE_STORIES[nextIndex];
    setCustomNarrativeOverride(null);
    setSelectedStory(nextStory);
    setPendingAutoPlay(true);
  };

  const currentChapterIdx = useMemo(() => {
    if (!selectedStory.chapters || selectedStory.chapters.length === 0) return 0;
    const idx = Math.min(
      selectedStory.chapters.length - 1,
      Math.floor((progressPercent / 100) * selectedStory.chapters.length)
    );
    return Math.max(0, idx);
  }, [progressPercent, selectedStory.chapters]);

  const handlePlayStoryPart = useCallback(
    (chapterIdx: number) => {
      if (!selectedStory.chapters || !selectedStory.chapters[chapterIdx]) return;
      const chapter = selectedStory.chapters[chapterIdx];
      const totalChapters = selectedStory.chapters.length || 4;
      const ratio = chapterIdx / totalChapters;
      setCustomNarrativeOverride(null);
      const targetChunk = Math.min(
        Math.max(0, chunks.length - 1),
        Math.floor(ratio * Math.max(1, chunks.length))
      );
      setVoiceStatusNotice(`Playing Part ${chapterIdx + 1}: ${chapter.title}`);
      player.startFromSegment(targetChunk, 0);
    },
    [selectedStory.chapters, chunks.length, player]
  );

  const handleSkip = (seconds: number) => {
    if (totalDurationSec <= 0) return;
    const targetSec = Math.max(0, Math.min(totalDurationSec - 1, currentTimeSec + seconds));
    player.seekByRatio(targetSec / totalDurationSec);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(0.995, clickX / Math.max(1, rect.width)));
    player.seekByRatio(ratio);
  };

  const handleSpeedChange = (spd: number) => {
    setPlaybackSpeed(spd);
  };

  const handlePitchChange = (p: number) => {
    setPitch(p);
  };

  const handlePersonaChange = (persona: VoicePersona) => {
    setVoicePersona(persona);
  };

  const handleTestAudio = () => {
    startAmbientSound();
    setVoiceStatusNotice(
      `Playing ${activeVoiceProfile.acousticPreset} tanpura chord (${activeVoiceProfile.droneRootFreqs.join(' Hz · ')} Hz)...`
    );
    setTimeout(() => {
      if (!isPlaying) stopAmbientSound();
      setVoiceStatusNotice('');
    }, 3500);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(currentTranscript).then(() => {
      setCopyToast(`Transcript copied (${selectedLang.toUpperCase()})`);
      setTimeout(() => setCopyToast(null), 3000);
    });
  };

  const handleDownloadGuide = () => {
    const content = `UTKALSARATHI AUDIO GUIDE & HISTORICAL ARCHIVE
=====================================================
Monument: ${selectedStory.monument}
Title: ${selectedStory.title}
Odia Title: ${selectedStory.odiaTitle}
Hindi Title: ${selectedStory.hindiTitle}
District: ${selectedStory.district || selectedStory.location}
Voice Persona: ${activeVoiceProfile.narratorName.en} (${activeVoiceProfile.geminiVoiceName})
Editorial Review: ${selectedStory.editorialReviewStatus || 'verified_epigraphic_and_asi'} (Updated ${selectedStory.lastUpdated || '2026-10-28'})
Monument Corpus Word Count: ${(selectedStory.totalWords || 5200).toLocaleString()} Words
Period / Era: ${selectedStory.period}
QR Access ID: SCAN-${selectedStory.id.toUpperCase()}

=====================================================
1. PRIMARY HISTORICAL EPIGRAPHY & PEER-REVIEWED RECORDS
=====================================================
Inscriptions & Manuscripts:
${selectedStory.inscriptionsAndManuscripts || 'Archival epigraphs documented by ASI.'}

Key Historical Figures:
${selectedStory.keyHistoricalFigures?.join(', ') || 'Monarchs, Guild Architects, Sages'}

Documented History:
${selectedStory.documentedHistory}

=====================================================
2. SACRED LEGENDS & LIVING FOLKLORE (ORAL TRADITION)
=====================================================
${selectedStory.legendAndFolklore}

=====================================================
3. ARCHITECTURAL & ENGINEERING HIGHLIGHTS
=====================================================
${selectedStory.architecturalHighlights.map((feat) => `* ${feat}`).join('\n')}

=====================================================
4. MULTI-SOURCE ACADEMIC BIBLIOGRAPHY
=====================================================
${selectedStory.historicalSources?.map((src) => `[Source] ${src}`).join('\n') || 'ASI Annual Reports & State Archives.'}

=====================================================
5. AUDIO TRANSCRIPT (${selectedLang.toUpperCase()})
=====================================================
${currentTranscript}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UtkalSarathi_${selectedStory.id}_Chronicle.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Historical archive for "${selectedStory.title}" downloaded.`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  const regions = [
    'All',
    'Golden Triangle',
    'Coastal & Maritime',
    'Diamond Triangle',
    'Northern Highlands',
    'Western Odisha',
    'Southern Ghats',
    'Central Valley',
  ];

  const sourceCategories = [
    'All',
    'Inscriptions & Epigraphy',
    'Palm-Leaf Chronicles',
    'Classical Foreign Travelers',
    'Excavations & Field Surveys',
  ];

  const scrollToVoiceAssistant = (targetLang?: 'en' | 'or' | 'hi') => {
    if (targetLang) updateLanguage(targetLang);
    voiceAssistantSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/90 to-stone-900 border border-amber-800/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Utkal Katha • {HISTORIC_CORPUS_STATS.totalMonuments} Historic Places • {HISTORIC_CORPUS_STATS.totalWords.toLocaleString()}+ Verified Words
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Utkal Katha: Multilingual Historical Chronicles &amp; Voice Assistant
          </h1>
          <p className="mt-2 text-stone-300 text-sm sm:text-base leading-relaxed">
            Explore <strong>{HISTORIC_CORPUS_STATS.totalMonuments} historic landmarks of Odisha</strong> backed by a{' '}
            <strong>{HISTORIC_CORPUS_STATS.totalWords.toLocaleString()}-word scholarly encyclopedia</strong>. Every historic place speaks with its own{' '}
            <strong>distinct monument voice persona</strong> in <strong>Odia (ଓଡ଼ିଆ)</strong>, <strong>Hindi (हिन्दी)</strong>, and <strong>English</strong>—and the playback timer finishes dynamically at the exact moment the story narration finishes.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-stone-200 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {HISTORIC_CORPUS_STATS.totalWords.toLocaleString()} Verified Historical Words
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-stone-200 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              {HISTORIC_CORPUS_STATS.totalMonuments} Distinct Place Voices
            </span>
            <button
              type="button"
              onClick={() => scrollToVoiceAssistant('or')}
              className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              ଓଡ଼ିଆ Voice Assistant
            </button>
            <button
              type="button"
              onClick={() => scrollToVoiceAssistant('hi')}
              className="px-3 py-1 rounded-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/50 text-orange-200 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-orange-400" />
              हिन्दी Voice Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Top Experience Switcher: 25 Monument Audio Guides vs 10,000+ Scalable Story Library */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-stone-900/90 border border-amber-600/30 shadow-xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto p-1 rounded-xl bg-stone-950 border border-stone-800">
          <button
            type="button"
            onClick={() => setViewMode('monuments')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              viewMode === 'monuments'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>25 Monument Voice Guides</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('library')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              viewMode === 'library'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>10,000+ Story Library Explorer</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-400 font-medium px-2 text-center sm:text-right">
          {viewMode === 'monuments' ? (
            <span>25 Dedicated Monument Voices • 133,330+ Scholarly Words</span>
          ) : (
            <span>Scalable Story Archive across all 30 Odisha Districts</span>
          )}
        </div>
      </div>

      {viewMode === 'library' ? (
        <StoryLibraryBrowser onOpenAssistant={onOpenAssistant} language={selectedLang} />
      ) : (
        <>
          {/* Quick Place Selector & Filter Bar */}
          <div className="space-y-3">
        {/* Quick Place / Monument Selector Dropdown */}
        <div className="bg-stone-900 border border-amber-600/40 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="quick-place-select" className="block text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                Select Place &amp; Run Utkal Katha (Full Narration Audio Guide):
              </label>
              <select
                id="quick-place-select"
                value={selectedStory.id}
                onChange={(e) => {
                  const found = AUDIO_GUIDE_STORIES.find((s) => s.id === e.target.value);
                  if (found) handleSelectAndPlayStory(found);
                }}
                className="w-full bg-stone-950 border border-stone-700 hover:border-amber-500/60 text-stone-100 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
              >
                {AUDIO_GUIDE_STORIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    📍 {s.monument} — {s.district || s.location} ({s.odiaTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSelectAndPlayStory(selectedStory)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all flex-shrink-0 ${
              isPlaying
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                : isPaused
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/60'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-stone-950 shadow-orange-950/60 hover:scale-[1.02]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Story</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Story</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>▶ Run Selected Story</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by monument, district, dynasty, or inscription..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-900 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Showing {filteredStories.length} of {AUDIO_GUIDE_STORIES.length} historic sites</span>
          </div>
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRegion === reg
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Story Catalog + Audio Player Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Story Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              25 Archaeological Chronicles
            </h3>
            <span className="text-[11px] text-amber-400/90 font-mono">
              Click place or story to run audio
            </span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredStories.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/60 border border-stone-800 rounded-2xl text-stone-400 text-xs">
                No tourist places matched your search query. Try searching &quot;Konark&quot;, &quot;Ashoka&quot;, or &quot;Mayurbhanj&quot;.
              </div>
            ) : (
              filteredStories.map((story) => {
                const isSelected = selectedStory.id === story.id;
                const isThisPlaying = isSelected && isPlaying;
                const isThisPaused = isSelected && isPaused;

                return (
                  <div
                    key={story.id}
                    onClick={() => handleSelectAndPlayStory(story)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
                      isThisPlaying
                        ? 'bg-amber-950/50 border-amber-500 shadow-xl ring-2 ring-amber-500/60'
                        : isSelected
                        ? 'bg-stone-850 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40'
                        : 'bg-stone-900 border-stone-800 hover:border-amber-700/60 hover:bg-stone-850/70'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/15 via-transparent to-transparent pointer-events-none" />
                    )}

                    <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold truncate max-w-[210px]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {story.location} {story.district ? `(${story.district})` : ''}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono bg-stone-800 px-2 py-0.5 rounded-full text-stone-300">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Full Narration
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-100 text-sm group-hover:text-amber-300 transition-colors">
                      {story.title}
                    </h4>

                    <div className="text-xs text-amber-300/80 font-medium mt-0.5">
                      {story.odiaTitle} • {story.hindiTitle}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Scroll className="w-2.5 h-2.5 text-amber-400" />
                        {story.totalWords || 1500}+ Words
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5 text-cyan-400" />
                        4 Parts
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {story.documentedHistory}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/80 pt-2.5">
                      <span className="truncate max-w-[150px]">Era: {story.period}</span>

                      {/* Explicit Clickable Select & Run Story Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndPlayStory(story);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                          isThisPlaying
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 animate-pulse'
                            : isThisPaused
                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/60'
                            : isSelected
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/60'
                            : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/40'
                        }`}
                      >
                        {isThisPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Playing (Pause)</span>
                          </>
                        ) : isThisPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Resume Story</span>
                          </>
                        ) : isSelected && isAiLoading ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>Loading Voice...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Select &amp; Run Story</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Audio Player and Deep Content */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Story Over / Completion Banner (Strictly Ends ONLY when Final Narration Segment Finishes) */}
          {isStoryOver && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border border-amber-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center gap-1.5">
                    <span>🏆 Story Narration Over • Time Over (କାହାଣୀ ସମାପ୍ତ • कहानी समाप्त)</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1">
                    All {chunks.length} narration segments ({formattedTotalTime}) completed in{' '}
                    <strong className="text-amber-200">
                      {activeVoiceProfile.narratorName[selectedLang] || activeVoiceProfile.narratorName.en}
                    </strong>
                    &apos;s distinct voice ({activeVoiceProfile.geminiVoiceName}).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReplay}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>↺ Replay Story</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlayNextMonument}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Next Site ⏭️</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Recovery Banner with Per-Segment Retry (Does NOT Restart Entire Story) */}
          {playbackState === 'Error' && playerErrorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-300">Voice Segment Playback Paused on Error</div>
                  <p className="mt-0.5 text-red-200/90 leading-relaxed">{playerErrorMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={player.retryFailedSegment}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs whitespace-nowrap"
                >
                  Retry Segment {currentChunkIndex + 1}/{chunks.length}
                </button>
                {selectedLang === 'or' && !allowPhoneticFallback && (
                  <button
                    type="button"
                    onClick={() => {
                      setAllowPhoneticFallback(true);
                      setTimeout(() => player.retryFailedSegment(), 50);
                    }}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-200 font-semibold text-xs whitespace-nowrap"
                  >
                    Allow Offline Phonetic Reader
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Custom Volume Narration Banner when narrating a 6-Volume Encyclopedia section */}
          {customNarrativeOverride && (
            <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="text-amber-200 truncate">
                <strong className="text-amber-400">Narrating Scholarly Volume:</strong>{' '}
                {customNarrativeOverride.title}
              </div>
              <button
                type="button"
                onClick={() => {
                  player.stopPlayback();
                  setCustomNarrativeOverride(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold whitespace-nowrap"
              >
                Return to Main Story
              </button>
            </div>
          )}

          {/* Hero Action: Run Story Immediately */}
          <button
            type="button"
            onClick={() => {
              if (isStoryOver) {
                handleReplay();
              } else {
                player.togglePlayPause();
              }
            }}
            className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-sm sm:text-base shadow-xl transition-all ${
              isPlaying
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60'
                : isPaused
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-950/60'
                : isStoryOver
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-stone-950 shadow-amber-950/60 hover:scale-[1.01]'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-stone-950 shadow-orange-950/60 hover:scale-[1.01]'
            }`}
          >
            {isAiLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-stone-950" />
                <span>
                  {playbackState === 'Loading'
                    ? `Synthesizing ${selectedLang === 'or' ? 'Odia (ଓଡ଼ିଆ)' : selectedLang === 'hi' ? 'Hindi (हिन्दी)' : 'English'} Voice...`
                    : `Buffering Segment ${currentChunkIndex + 1}/${chunks.length}...`}
                </span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>
                  Pause Narration • Seg {currentChunkIndex + 1}/{chunks.length} ({formattedCurrentTime} / {formattedTotalTime})
                </span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Resume Narration ({formattedCurrentTime} / {formattedTotalTime})</span>
              </>
            ) : isStoryOver ? (
              <>
                <RotateCcw className="w-5 h-5 fill-current" />
                <span>↺ Story Completed (Click to Replay from Beginning)</span>
              </>
            ) : playbackState === 'Error' ? (
              <>
                <RotateCcw className="w-5 h-5" />
                <span>Retry Segment {currentChunkIndex + 1} of {chunks.length}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>
                  ▶ RUN STORY ({selectedStory.monument} • {activeVoiceProfile.narratorName[selectedLang]})
                </span>
              </>
            )}
          </button>

          {/* Active Monument Header */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
                {selectedStory.monument} • {selectedStory.region || 'Heritage'}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                State: <strong className="text-amber-300">{playbackState}</strong> • Est. {formattedTotalTime} ({chunks.length} segments)
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              {selectedStory.title}
            </h2>

            <div className="text-xs sm:text-sm text-amber-300 font-medium mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>{selectedStory.odiaTitle}</span>
              <span className="text-stone-500">•</span>
              <span>{selectedStory.hindiTitle}</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {selectedStory.location} {selectedStory.district ? `(${selectedStory.district} District)` : ''}
              </span>
            </div>

            {/* Monument-Specific Voice Identity Badge */}
            <div className="mt-3 p-3 rounded-2xl bg-stone-850/90 border border-amber-600/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2 flex-wrap">
                  <span>🎙️ Distinct Place Voice:</span>
                  <span className="text-white font-extrabold">
                    {activeVoiceProfile.narratorName[selectedLang] || activeVoiceProfile.narratorName.en}
                  </span>
                  <span className="text-[10px] text-amber-400/90 px-2 py-0.5 rounded-full bg-stone-900 border border-stone-700 font-mono">
                    Voice: {activeVoiceProfile.geminiVoiceName} • {activeVoiceProfile.acousticPreset}
                  </span>
                  <span className="text-[10px] text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/50">
                    {activeVoiceProfile.voicePersonaTitle[selectedLang] || activeVoiceProfile.voicePersonaTitle.en}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {activeVoiceProfile.timbreDescription}
                </p>
              </div>
            </div>

            {/* In-Depth Historical Chronicle & Editorial Review Metadata */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-950/80 to-orange-950/80 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Scroll className="w-3.5 h-3.5 text-amber-400" />
                <span>📜 {(selectedStory.totalWords || 5200).toLocaleString()} Words Monument Archive</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-xs font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{chunks.length} Sequential Audio Segments</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  ASI &amp; Epigraphy Reviewed • Updated {selectedStory.lastUpdated || '2026-10-28'}
                </span>
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-850 border border-stone-700 text-[11px] font-mono text-cyan-300">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedStory.qrCodeBadgeText || `SCAN-${selectedStory.id.toUpperCase()}`}</span>
              </span>

              <button
                onClick={handleCopyTranscript}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold transition-colors"
                title="Copy current language transcript"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Transcript</span>
              </button>

              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold transition-colors"
                title="Download complete historical archive and transcript for offline use"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Archive (.txt)</span>
              </button>

              {onOpenAssistant && (
                <button
                  onClick={() =>
                    onOpenAssistant(
                      `Compare all primary historical sources (epigraphs, copper plates, palm-leaf Madala Panji, Xuanzang accounts, and ASI excavation reports) for ${selectedStory.monument} in ${selectedStory.location} (${selectedStory.district || 'Odisha'}).`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 border border-purple-600/40 text-purple-300 text-[11px] font-semibold transition-colors ml-auto"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ask AI to Compare Sources</span>
                </button>
              )}
            </div>

            {copyToast && (
              <div className="mt-2 p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{copyToast}</span>
              </div>
            )}

            {downloadToast && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{downloadToast}</span>
              </div>
            )}
          </div>

          {/* Interactive AI Voice Console */}
          <div className="bg-stone-850/95 border border-stone-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
            {/* Top row: Language Toggle + Voice Persona Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-750">
              {/* Language Choice */}
              <div className="flex items-center gap-2 flex-wrap">
                <Languages className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-stone-300">Narration &amp; Voice Language:</span>
                <div className="flex gap-1">
                  {(
                    [
                      { code: 'en', label: 'English', sub: 'en-IN' },
                      { code: 'or', label: 'ଓଡ଼ିଆ (Odia)', sub: 'Odia' },
                      { code: 'hi', label: 'हिन्दी (Hindi)', sub: 'Hindi' },
                    ] as const
                  ).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        const wasPlaying = isPlaying;
                        updateLanguage(lang.code);
                        if (wasPlaying) {
                          setPendingAutoPlay(true);
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        selectedLang === lang.code
                          ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona Cadence Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-400">Cadence:</span>
                <div className="flex gap-1">
                  {(
                    [
                      { id: 'royal', label: 'Place Persona' },
                      { id: 'temple', label: 'Palm-Leaf' },
                      { id: 'historian', label: 'Epigraphist' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaChange(p.id)}
                      className={`px-2 py-0.5 text-[11px] rounded-md font-medium border transition-colors ${
                        voicePersona === p.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                          : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Persona Description & Voice Engine Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-400 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2">
                <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-stone-500'}`} />
                <span>
                  <strong>{personaSettings.label}:</strong> {personaSettings.desc}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <button
                  onClick={handleTestAudio}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold text-[10px] border border-stone-700 flex items-center gap-1 transition-colors"
                  title="Test sacred acoustic tanpura chord & speaker output"
                >
                  <Headphones className="w-3 h-3" />
                  <span>Test Sound</span>
                </button>

                <span className="text-[10px] text-amber-300/90 font-mono bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                  {voiceProviderLabel}
                </span>
              </div>
            </div>

            {voiceStatusNotice && (
              <div className="text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{voiceStatusNotice}</span>
              </div>
            )}

            {/* Scrubber / Seekable Dynamic Progress Bar */}
            <div className="space-y-1.5">
              <div
                onClick={handleSeek}
                className="w-full h-3 rounded-full bg-stone-800 hover:bg-stone-750 cursor-pointer overflow-hidden relative group p-0.5 border border-stone-700"
                title="Click to seek anywhere in narration"
              >
                <div
                  className={`h-full rounded-full transition-all duration-200 group-hover:brightness-110 ${
                    isStoryOver
                      ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-400'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400'
                  }`}
                  style={{ width: `${isStoryOver ? 100 : progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-stone-400 font-mono">
                <span className={`font-bold ${isStoryOver ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formattedCurrentTime}
                </span>
                <span className="text-[11px]">
                  {isStoryOver ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      STORY OVER • TIME OVER (100% Complete)
                    </span>
                  ) : (
                    <span className="text-stone-400">
                      Segment {Math.min(chunks.length, currentChunkIndex + 1)}/{chunks.length} • Remaining -{timeline.formattedRemaining} ({Math.round(progressPercent)}%)
                    </span>
                  )}
                </span>
                <span className="text-stone-200 font-bold">{formattedTotalTime}</span>
              </div>
            </div>

            {/* Playback Controls & Speed/Stop/Drone Options */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {/* Speed Buttons */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-stone-400 mr-1 font-semibold">Speed:</span>
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 text-[11px] rounded font-mono font-bold transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-stone-400 hover:text-stone-200 bg-stone-800'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Main Play, Pause, Stop, Replay, Skip Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => handleSkip(-15)}
                  className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center"
                  title="Rewind 15 seconds"
                  aria-label="Skip backward 15 seconds"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                  title="Replay narration from beginning"
                  aria-label="Replay story from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlayback}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-950/60 hover:scale-105 transition-transform ${
                    isAiLoading ? 'opacity-85 animate-pulse' : ''
                  }`}
                  aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
                >
                  {isAiLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={player.stopPlayback}
                  disabled={playbackState === 'Idle' || playbackState === 'Cancelled'}
                  className="p-2 rounded-full bg-stone-800 hover:bg-red-900/60 disabled:opacity-40 text-stone-300 hover:text-red-200 transition-colors flex items-center justify-center"
                  title="Stop playback and release audio"
                  aria-label="Stop narration"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => handleSkip(15)}
                  className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center justify-center"
                  title="Forward 15 seconds"
                  aria-label="Skip forward 15 seconds"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>

              {/* Pitch Slider & Ambience Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 font-semibold">Pitch:</span>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                    className="w-14 accent-amber-500 cursor-pointer"
                    title={`Pitch: ${pitch.toFixed(2)}x`}
                  />
                </div>

                <button
                  onClick={() => setIsAmbienceEnabled(!isAmbienceEnabled)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    isAmbienceEnabled
                      ? 'bg-amber-950/50 border-amber-600/50 text-amber-300'
                      : 'bg-stone-800 border-stone-700 text-stone-500'
                  }`}
                  title={isAmbienceEnabled ? 'Sacred temple ambient drone is ON' : 'Sacred temple ambient drone is OFF'}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{isAmbienceEnabled ? 'Drone ON' : 'Muted'}</span>
                </button>
              </div>
            </div>

            {/* Active Segment Highlight + Full Transcript Box */}
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 leading-relaxed max-h-48 overflow-y-auto scrollbar-thin space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-400 text-xs">
                <span>
                  Synchronized Narration Script (
                  {selectedLang === 'or' ? 'ଓଡ଼ିଆ' : selectedLang === 'hi' ? 'हिन्दी' : 'English'}
                  ):
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Segment {Math.min(chunks.length, currentChunkIndex + 1)} of {chunks.length}
                </span>
              </div>
              {chunks.length > 0 ? (
                <div className="space-y-1.5">
                  {chunks.map((seg) => {
                    const isSegActive = seg.index === currentChunkIndex && (isPlaying || isPaused || isAiLoading);
                    return (
                      <span
                        key={seg.index}
                        onClick={() => player.startFromSegment(seg.index, 0)}
                        className={`inline cursor-pointer rounded px-1 py-0.5 transition-colors ${
                          isSegActive
                            ? 'bg-amber-500/25 text-amber-100 font-semibold border-b border-amber-400'
                            : 'text-stone-300 hover:text-white hover:bg-stone-800/70'
                        }`}
                        title="Click any sentence segment to narrate from here"
                      >
                        {seg.text}{' '}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p>{currentTranscript}</p>
              )}
            </div>
          </div>

          {/* Interactive Story Parts / Chapters Selector */}
          {selectedStory.chapters && selectedStory.chapters.length > 0 && (
            <div className="bg-stone-850/95 border border-amber-800/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800 pb-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Select Story Part / Chapter (Click Any Part to Run)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="bg-amber-950/60 text-amber-300 border border-amber-800/40 px-2.5 py-0.5 rounded-full font-bold">
                    Part {currentChapterIdx + 1} of {selectedStory.chapters?.length || 4} Active
                  </span>
                  <span className="text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                    Dynamic {formattedTotalTime} Total
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {selectedStory.chapters.map((ch, idx) => {
                  const isThisPartActive = isPlaying && currentChapterIdx === idx;
                  const isThisPartSelected = currentChapterIdx === idx;
                  const totalParts = selectedStory.chapters?.length || 4;
                  const partSec = totalDurationSec / totalParts;
                  const chapterStartSec = Math.round(idx * partSec);
                  const startMin = Math.floor(chapterStartSec / 60);
                  const startSec = chapterStartSec % 60;
                  const formattedStart = `${startMin}:${startSec < 10 ? '0' : ''}${startSec}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => handlePlayStoryPart(idx)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                        isThisPartActive
                          ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-md shadow-amber-950/50'
                          : isThisPartSelected
                          ? 'bg-stone-800/90 border-amber-600/60'
                          : 'bg-stone-900/80 border-stone-800 hover:border-amber-600/40 hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          isThisPartActive
                            ? 'bg-amber-500 text-stone-950 font-extrabold'
                            : 'bg-stone-800 text-amber-400 border border-stone-700'
                        }`}>
                          Part {idx + 1} of {selectedStory.chapters?.length || 4}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400/80" />
                          Starts {formattedStart} (2m 00s)
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                        {ch.title}
                      </h5>
                      {ch.odiaTitle && (
                        <p className="text-xs text-amber-300/80 font-medium truncate mt-0.5">
                          {ch.odiaTitle}
                        </p>
                      )}
                      <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                        {ch.text}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-400">
                          {isThisPartActive ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                              Narrating Now...
                            </span>
                          ) : (
                            'Click to play part'
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayStoryPart(idx);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                            isThisPartActive
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-sm'
                              : 'bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isThisPartActive ? (
                            <>
                              <Pause className="w-3 h-3 fill-current" />
                              <span>Playing Part {idx + 1}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Run Part {idx + 1}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deep Historical Analysis: 5 Specialized Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-stone-800 pb-2 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'chapters'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>📖 4 Story Parts</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📜 Inscriptions & History</span>
              </button>

              <button
                onClick={() => setActiveTab('legend')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'legend'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🪔 Sacred Legends & Folklore</span>
              </button>

              <button
                onClick={() => setActiveTab('architecture')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'architecture'
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>🏛️ Engineering Marvels</span>
              </button>

              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'sources'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>📚 Different Sources ({parsedSources.length})</span>
              </button>
            </div>

            {/* Tab 0: 4 Story Parts Complete Reader */}
            {activeTab === 'chapters' && selectedStory.chapters && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-amber-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-amber-400" />
                    4 Interactive Story Parts & Synchronized Audio Narration
                  </div>
                  <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full font-mono">
                    2m 30s Per Part • 10 Mins Total
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedStory.chapters.map((ch, idx) => {
                    const isThisPartActive = isPlaying && currentChapterIdx === idx;
                    const startMin = Math.floor((idx * 150) / 60);
                    const startSec = (idx * 150) % 60;
                    const formattedStart = `${startMin}:${startSec < 10 ? '0' : ''}${startSec}`;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isThisPartActive
                            ? 'bg-amber-950/50 border-amber-500 ring-1 ring-amber-500/50'
                            : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
                              Part {idx + 1}
                            </span>
                            <h4 className="font-bold text-sm text-white">
                              {ch.title}
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlayStoryPart(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isThisPartActive
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                            }`}
                          >
                            {isThisPartActive ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>Narrating Now ({formattedCurrentTime})</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>▶ Run Part {idx + 1} (Starts {formattedStart})</span>
                              </>
                            )}
                          </button>
                        </div>

                        {ch.odiaTitle && (
                          <div className="text-xs text-amber-300/90 font-medium mb-2">
                            {ch.odiaTitle}
                          </div>
                        )}

                        <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/40 p-3 rounded-lg border border-stone-800/60">
                          {ch.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 1: Documented History & Inscriptions */}
            {activeTab === 'history' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-amber-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Peer-Reviewed Historical Records & Epigraphy
                  </div>
                  <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                    ASI & Museum Epigraphy
                  </span>
                </div>

                {/* Inscriptions & Manuscripts Highlight */}
                {selectedStory.inscriptionsAndManuscripts && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 space-y-1">
                    <div className="font-bold text-[11px] uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Key Inscriptions, Copper Plates & Manuscripts:
                    </div>
                    <p className="text-xs leading-relaxed">
                      {selectedStory.inscriptionsAndManuscripts}
                    </p>
                  </div>
                )}

                {/* Key Historical Figures */}
                {selectedStory.keyHistoricalFigures && selectedStory.keyHistoricalFigures.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                      Prominent Historical Figures & Epigraphic Mentions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStory.keyHistoricalFigures.map((fig, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-[11px] flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          {fig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Documented History Chronicle */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                    Archaeological Chronicle:
                  </span>
                  <p className="text-stone-200 leading-relaxed text-xs">
                    {selectedStory.documentedHistory}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Sacred Legends & Living Folklore */}
            {activeTab === 'legend' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-orange-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-orange-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    Traditional Folk Stories, Oral Lore & Spiritual Philosophy
                  </div>
                  <span className="text-[10px] text-orange-400/80 bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-500/20">
                    Odia Oral Tradition
                  </span>
                </div>

                <p className="text-stone-200 text-xs leading-relaxed">
                  {selectedStory.legendAndFolklore}
                </p>

                <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-orange-200 text-[11px]">
                  💡 <strong>Heritage Note:</strong> In Odisha&apos;s historiography, oral traditions
                  often reflect philosophical principles and ethical commitments of artisan communities
                  passed down across generations through Pattachitra balladeers and Gotipua dancers.
                </div>
              </div>
            )}

            {/* Tab 3: Architectural Highlights */}
            {activeTab === 'architecture' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-cyan-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Structural, Astronomical & Aesthetic Engineering
                  </div>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    Kalinga Deula Architecture
                  </span>
                </div>

                <ul className="space-y-2 pt-1">
                  {selectedStory.architecturalHighlights.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-stone-200 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
                      <span className="text-cyan-400 font-bold mt-0.5">❖</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab 4: Different Historical Sources Breakdown */}
            {activeTab === 'sources' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-850 border border-emerald-800/40 text-xs text-stone-300 leading-relaxed animate-fade-in space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    Information from Different Historical Sources
                  </div>
                  <span className="text-[10px] text-stone-400">
                    Epigraphy • Palm-Leaf • Greek/Chinese • ASI
                  </span>
                </div>

                {/* Category Pills for Different Sources */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {sourceCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSourceCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                        sourceCategoryFilter === cat
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Categorized Source Cards */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredSources.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border mb-1 ${item.tagColor}`}>
                            {item.category}
                          </span>
                          <p className="text-stone-200 text-xs leading-relaxed font-medium">
                            {item.source}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono text-stone-500 text-[10px] self-end sm:self-start">
                        Ref #{item.id}
                      </span>
                    </div>
                  ))}
                </div>

                {onOpenAssistant && (
                  <div className="pt-1 border-t border-stone-800">
                    <button
                      onClick={() =>
                        onOpenAssistant(
                          `Provide a deep comparative synthesis of the different historical sources for ${selectedStory.monument} (${selectedStory.district || selectedStory.location}), contrasting epigraphical inscriptions with traditional palm-leaf manuscripts and foreign travel records.`
                        )
                      }
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span>Ask AI for Cross-Source Scholarly Analysis</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6-Volume Scholarly Historical Encyclopedia (133,330+ Verified Words across 25 Places) */}
      <MonumentEncyclopediaPanel
        story={selectedStory}
        voiceProfile={activeVoiceProfile}
        selectedLang={selectedLang}
        onLanguageChange={(newLang) => {
          const wasPlaying = isPlaying;
          updateLanguage(newLang);
          if (wasPlaying) {
            setPendingAutoPlay(true);
          }
        }}
        onNarrateVolume={(volumeText, volumeLabel) => {
          if (
            customNarrativeOverride &&
            customNarrativeOverride.title === volumeLabel &&
            isPlaying
          ) {
            player.pausePlayback();
            return;
          }
          setCustomNarrativeOverride({ title: volumeLabel, text: volumeText });
          setPendingAutoPlay(true);
        }}
        isNarratingCustomVolume={Boolean(customNarrativeOverride) && isPlaying}
        activeCustomVolumeLabel={customNarrativeOverride?.title || null}
      />

      {/* Utkal Katha Multilingual Voice Assistant (Interactive Odia, Hindi & English Historical Voice Engine) */}
      <div ref={voiceAssistantSectionRef}>
        <UtkalKathaVoiceAssistant
          selectedStory={selectedStory}
          selectedLang={selectedLang}
          onLanguageChange={(newLang) => {
            const wasPlaying = isPlaying;
            updateLanguage(newLang);
            if (wasPlaying) {
              setPendingAutoPlay(true);
            }
          }}
          onOpenGlobalAssistant={onOpenAssistant}
        />
      </div>
      </>
      )}

      {/* Cultural Festivals Calendar */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Odisha Cultural Events & Historical Celebrations
            </h2>
          </div>
          <span className="text-xs text-stone-400">Authentic Dates & Visitor Guidelines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CULTURAL_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-stone-850 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {evt.period}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{evt.name}</h3>
                <span className="text-xs text-amber-300/80 font-medium">{evt.odiaName}</span>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">{evt.significance}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 space-y-1">
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Dates: {evt.dates}
                </div>
                <div className="text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Traveller Advice: </span>
                  {evt.travelerAdvice}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
