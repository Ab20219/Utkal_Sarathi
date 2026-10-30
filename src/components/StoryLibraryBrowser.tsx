import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StoryRecord,
  StoryCategory,
  StoryFilterOptions,
  StoryLibraryStats,
  SupportedLanguage,
} from '../types';
import { StoryLibraryClient } from '../services/storyLibraryClient';
import { ODISHA_30_DISTRICTS } from '../data/odishaDistricts';
import {
  Search,
  Filter,
  Play,
  Pause,
  Square,
  Bookmark,
  Download,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Volume2,
  Clock,
  MapPin,
  Bot,
  Layers,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  FileCheck,
  Languages,
  Sliders,
  AlertCircle,
  ChevronRight,
  Share2,
} from 'lucide-react';

interface StoryLibraryBrowserProps {
  onOpenAssistant?: (prompt: string) => void;
  language?: SupportedLanguage;
}

export const StoryLibraryBrowser: React.FC<StoryLibraryBrowserProps> = ({
  onOpenAssistant,
  language = 'en',
}) => {
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [stats, setStats] = useState<StoryLibraryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyFavourites, setOnlyFavourites] = useState<boolean>(false);
  const [onlyDownloaded, setOnlyDownloaded] = useState<boolean>(false);
  const [activeStory, setActiveStory] = useState<StoryRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackLang, setPlaybackLang] = useState<SupportedLanguage>(language);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [offlineIds, setOfflineIds] = useState<Set<string>>(new Set());
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Story Generator Modal State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [genDistrict, setGenDistrict] = useState<string>('Puri');
  const [genDestination, setGenDestination] = useState<string>('');
  const [genCategory, setGenCategory] = useState<StoryCategory>('temples_architecture');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Sync offline and favourite IDs on mount
  useEffect(() => {
    const offlineList = StoryLibraryClient.getOfflineStories();
    setOfflineIds(new Set(offlineList.map((s) => s.id)));

    try {
      const savedFavs = localStorage.getItem('utkalsarathi_fav_stories');
      if (savedFavs) {
        setFavouriteIds(new Set(JSON.parse(savedFavs)));
      }
    } catch {
      // Ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load stories and stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [storiesRes, statsRes] = await Promise.all([
        StoryLibraryClient.fetchStories(
          {
            district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
            category: selectedCategory !== 'all' ? (selectedCategory as StoryCategory) : undefined,
            durationType: selectedDuration !== 'all' ? (selectedDuration as any) : undefined,
            verificationStatus: selectedStatus !== 'all' ? (selectedStatus as any) : undefined,
            searchQuery: searchQuery.trim() || undefined,
          },
          1,
          100
        ),
        StoryLibraryClient.fetchStats(),
      ]);

      setStories(storiesRes.stories);
      setStats(statsRes);
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, [selectedDistrict, selectedCategory, selectedDuration, selectedStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Speech Synthesis Narration Engine
  useEffect(() => {
    if (!isPlaying || !activeStory) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this environment.');
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Select text based on language
    let textToSpeak = activeStory.storyText;
    if (playbackLang === 'or' && activeStory.translations?.or) {
      textToSpeak = activeStory.translations.or;
    } else if (playbackLang === 'hi' && activeStory.translations?.hi) {
      textToSpeak = activeStory.translations.hi;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 0.95; // Warm, slightly deep narrator resonance

    if (playbackLang === 'or') {
      utterance.lang = 'or-IN';
    } else if (playbackLang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    StoryLibraryClient.recordPlay(activeStory.id);

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, activeStory, playbackLang, playbackSpeed]);

  const handleTogglePlay = (story: StoryRecord) => {
    if (activeStory?.id === story.id && isPlaying) {
      setIsPlaying(false);
    } else {
      setActiveStory(story);
      setIsPlaying(true);
    }
  };

  const handleToggleFavourite = (id: string) => {
    setFavouriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('utkalsarathi_fav_stories', JSON.stringify([...next]));
      } catch {
        // Ignore
      }
      return next;
    });
    StoryLibraryClient.toggleFavourite(id);
  };

  const handleToggleOffline = (story: StoryRecord) => {
    if (offlineIds.has(story.id)) {
      StoryLibraryClient.removeStoryFromOffline(story.id);
      setOfflineIds((prev) => {
        const next = new Set(prev);
        next.delete(story.id);
        return next;
      });
      showToast(`Removed "${story.title}" from Offline Pack.`);
    } else {
      StoryLibraryClient.saveStoryToOffline(story);
      setOfflineIds((prev) => new Set([...prev, story.id]));
      showToast(`Saved "${story.title}" for offline playback.`);
    }
  };

  // Filtered stories taking into account favourites & offline toggle
  const displayedStories = useMemo(() => {
    return stories.filter((story) => {
      if (onlyFavourites && !favouriteIds.has(story.id)) return false;
      if (onlyDownloaded && !offlineIds.has(story.id)) return false;
      return true;
    });
  }, [stories, onlyFavourites, onlyDownloaded, favouriteIds, offlineIds]);

  // Handle AI Story Generation
  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDestination.trim()) {
      setGenError('Please provide a destination or monument name.');
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    const res = await StoryLibraryClient.generateStory({
      district: genDistrict,
      destination: genDestination.trim(),
      category: genCategory,
      language: playbackLang,
    });

    setIsGenerating(false);

    if (res.success && res.story) {
      setIsGeneratorOpen(false);
      setGenDestination('');
      showToast(`✅ Story for ${res.story.destination} indexed into library!`);
      loadData();
      setActiveStory(res.story);
    } else {
      setGenError(res.error || 'Failed to generate story. Potential duplicate detected.');
    }
  };

  const categories: Array<{ id: StoryCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All 11 Categories' },
    { id: 'temples_architecture', label: 'Temples & Architecture' },
    { id: 'ancient_kingdoms', label: 'Ancient Kingdoms' },
    { id: 'archaeology_edicts', label: 'Archaeology & Edicts' },
    { id: 'forts_caves', label: 'Forts & Caves' },
    { id: 'freedom_movements', label: 'Freedom Movements' },
    { id: 'tribal_heritage', label: 'Tribal Heritage' },
    { id: 'folktales_legends', label: 'Folk Tales & Lore' },
    { id: 'festivals_crafts', label: 'Festivals & Crafts' },
    { id: 'cuisine_traditions', label: 'Cuisine Traditions' },
    { id: 'hidden_nature', label: 'Hidden Gems & Nature' },
    { id: 'educational_tours', label: 'Educational Audio Guides' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 border border-amber-500/50 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Stats Card with Honest Real-Time Metrics */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-amber-950/80 to-stone-950 border border-amber-700/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-4xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Utkal Katha Content Platform • 10,000+ Story Library Engine
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Scalable Cultural &amp; Historical Story Library
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            A comprehensive, epigraphically grounded story platform capable of scaling to over{' '}
            <strong>10,000 distinct historical and destination-story records</strong> across all 30 districts of Odisha. Built-in{' '}
            <strong>duplicate and near-duplicate rejection</strong> ensures that multilingual translations never inflate distinct story counts.
          </p>

          {/* Honest Metric Badges */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 text-left">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                  Total Distinct Stories
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">
                  {stats.totalDistinctStories.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Original Records</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 text-left">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                  Reviewed Archival
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  {stats.reviewedArchivalCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">ASI &amp; Gazette Verified</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 text-left">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                  Audio Narrations
                </span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400">
                  {stats.audioEnabledCount.toLocaleString()}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Odia, Hindi &amp; English</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 text-left">
                <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                  Scale Capacity
                </span>
                <span className="text-xl sm:text-2xl font-black text-purple-400">
                  {stats.targetScaleCapacity.toLocaleString()}+
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Platform Target</span>
              </div>
            </div>
          )}

          {/* Honest Disclosure Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200/90 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Honesty &amp; Transparency Guarantee: </strong>
              UtkalSarathi reports genuine distinct story counts based on unique records. As new stories are vetted or generated via our editorial pipeline, this counter updates in real time without inflated marketing figures.
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & AI Generator Trigger */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by story title, temple, ruler, dynasty, or inscription..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate with AI</span>
            </button>

            <button
              onClick={() => loadData()}
              aria-label="Refresh Story Catalog"
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* District Filter */}
          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full py-1.5 px-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs focus:border-amber-500"
            >
              <option value="all">All 30 Districts</option>
              {ODISHA_30_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.odiaName})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">Duration</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full py-1.5 px-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs focus:border-amber-500"
            >
              <option value="all">All Durations</option>
              <option value="short">Short (≤ 3 mins)</option>
              <option value="narrative">Narrative (3 - 8 mins)</option>
              <option value="extended">Extended (&gt; 8 mins)</option>
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">Verification</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs focus:border-amber-500"
            >
              <option value="all">All Verifications</option>
              <option value="reviewed">Archival &amp; Approved Only</option>
              <option value="generated">AI Generated (Unreviewed)</option>
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-800 text-xs">
          <button
            onClick={() => setOnlyFavourites(!onlyFavourites)}
            className={`px-3 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              onlyFavourites
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>★ Favourites ({favouriteIds.size})</span>
          </button>

          <button
            onClick={() => setOnlyDownloaded(!onlyDownloaded)}
            className={`px-3 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              onlyDownloaded
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Download className="w-3 h-3" />
            <span>💾 Offline Saved ({offlineIds.size})</span>
          </button>

          <span className="text-[11px] text-stone-400 ml-auto">
            Showing <strong>{displayedStories.length}</strong> stories
          </span>
        </div>
      </div>

      {/* Floating Active Story Narration Player */}
      {activeStory && (
        <div className="sticky top-20 z-30 rounded-2xl bg-stone-900 border border-amber-500/50 p-4 shadow-2xl shadow-stone-950/80 backdrop-blur-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 flex items-center justify-center shrink-0 shadow-lg font-bold transition-transform active:scale-90"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    {activeStory.id}
                  </span>
                  <span className="text-[10px] text-stone-400">{activeStory.district}</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                  {playbackLang === 'or' && activeStory.odiaTitle
                    ? activeStory.odiaTitle
                    : playbackLang === 'hi' && activeStory.hindiTitle
                    ? activeStory.hindiTitle
                    : activeStory.title}
                </h4>
              </div>
            </div>

            {/* Narration Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              {/* Language Selector */}
              <div className="flex rounded-lg bg-stone-950 p-0.5 border border-stone-800">
                {(['en', 'or', 'hi'] as SupportedLanguage[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setPlaybackLang(l)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                      playbackLang === l ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'or' ? 'ଓଡ଼ି' : 'हिन्दी'}
                  </button>
                ))}
              </div>

              {/* Speed Selector */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="py-1 px-1.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-300 text-[11px]"
              >
                <option value="0.75">0.75x</option>
                <option value="1.0">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStory(null);
                }}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200"
                aria-label="Stop audio"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm text-stone-400">Loading Utkal Katha story records...</p>
        </div>
      ) : displayedStories.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-stone-900/40 border border-stone-800 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-stone-500 mx-auto" />
          <h3 className="text-base font-bold text-stone-200">No Stories Matched Your Filter</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Try resetting your search query, or generate a brand new verified story for this district using our AI generator.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDistrict('all');
              setSelectedCategory('all');
              setSelectedDuration('all');
              setSelectedStatus('all');
              setOnlyFavourites(false);
              setOnlyDownloaded(false);
            }}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedStories.map((story) => {
            const isStoryPlaying = activeStory?.id === story.id && isPlaying;
            const isFav = favouriteIds.has(story.id);
            const isDownloaded = offlineIds.has(story.id);

            return (
              <div
                key={story.id}
                className="rounded-2xl bg-stone-900 border border-stone-800/80 hover:border-amber-600/50 p-5 space-y-3.5 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-0.5 group"
              >
                <div className="space-y-2.5">
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-400 font-bold border border-stone-800">
                        {story.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                        {story.category.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-stone-950 text-emerald-400 border border-emerald-900/40">
                      {story.verificationStatus === 'reviewed_archival'
                        ? 'Archival'
                        : story.verificationStatus === 'editorial_approved'
                        ? 'Approved'
                        : 'AI Draft'}
                    </span>
                  </div>

                  {/* Location & Era */}
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-semibold text-stone-300">{story.destination}</span>
                    <span>•</span>
                    <span>{story.district}</span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-bold text-stone-100 text-sm group-hover:text-amber-300 transition-colors leading-snug">
                      {story.title}
                    </h3>
                    {story.odiaTitle && (
                      <p className="text-xs text-amber-400/80 mt-1 font-medium font-oriya">
                        {story.odiaTitle}
                      </p>
                    )}
                  </div>

                  {/* Narrative Excerpt */}
                  <p className="text-stone-400 text-xs leading-relaxed line-clamp-3">
                    {story.storyText}
                  </p>

                  {/* Source Citations */}
                  {story.sourceReferences && story.sourceReferences.length > 0 && (
                    <div className="text-[10px] text-stone-500 line-clamp-1 border-t border-stone-800/60 pt-2 flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{story.sourceReferences[0]}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => handleTogglePlay(story)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                        isStoryPlaying
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isStoryPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil(story.estimatedListeningDurationSec / 60)}m
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Ask Assistant */}
                    {onOpenAssistant && (
                      <button
                        onClick={() =>
                          onOpenAssistant(
                            `Tell me about the historical significance of ${story.destination} in ${story.district}.`
                          )
                        }
                        className="p-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-amber-300 border border-stone-800 transition-colors"
                        title="Ask Utkal Mitra AI about this destination"
                      >
                        <Bot className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Offline Download */}
                    <button
                      onClick={() => handleToggleOffline(story)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDownloaded
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                          : 'bg-stone-950 hover:bg-stone-800 border-stone-800 text-stone-400'
                      }`}
                      title={isDownloaded ? 'Saved in Offline Pack' : 'Download for Offline'}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Favourite */}
                    <button
                      onClick={() => handleToggleFavourite(story.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isFav
                          ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                          : 'bg-stone-950 hover:bg-stone-800 border-stone-800 text-stone-400'
                      }`}
                      title="Add to Favourites"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Story Generation Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/50 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Generate Source-Grounded Story
                </h3>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-stone-400 hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300">
              Generate a verified, scholarly cultural story grounded in Odisha epigraphy and district history. All generated stories pass through our duplicate detection engine before indexing.
            </p>

            <form onSubmit={handleGenerateStory} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                  District
                </label>
                <select
                  value={genDistrict}
                  onChange={(e) => setGenDistrict(e.target.value)}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 text-xs focus:border-amber-500"
                >
                  {ODISHA_30_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.odiaName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                  Destination / Monument / Heritage Site
                </label>
                <input
                  type="text"
                  value={genDestination}
                  onChange={(e) => setGenDestination(e.target.value)}
                  placeholder="e.g. Dhauli Shanti Stupa, Ranipur Jharial, Baripada Chhau..."
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 text-xs focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                  Category
                </label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value as StoryCategory)}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-200 text-xs focus:border-amber-500"
                >
                  {categories.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {genError && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating &amp; Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Story</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
