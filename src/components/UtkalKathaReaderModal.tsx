/**
 * Utkal Katha Comprehensive Heritage Reader Modal (v2)
 *
 * Implements:
 * - App 1 Obsidian-Gold visual identity & typography
 * - 20 Structured Thematic Chapters per monument
 * - Instant Trilingual Switching: English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी)
 * - Word-by-Word Trilingual Vocabulary Comparison Tab
 * - Chapter-by-chapter Audio Narration with natural voice
 * - Android-first touch navigation & safe areas
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  BookOpen,
  Languages,
  Scroll,
  Layers,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AppLanguage, t } from '../data/i18n';
import { utkalKathaClientV2 } from '../services/utkalKathaClientV2';
import { UtkalKathaStoryV2, KathaChapterV2, TrilingualTerm } from '../services/utkalKathaServiceV2';
import { unifiedVoicePipeline } from '../services/unifiedVoicePipeline';
import { ensureBrowserVoicesReady } from '../utils/indicPhoneticBridge';

interface UtkalKathaReaderModalProps {
  storyId: string | null;
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

export const UtkalKathaReaderModal: React.FC<UtkalKathaReaderModalProps> = ({
  storyId,
  isOpen,
  onClose,
  language,
  setLanguage,
}) => {
  const [story, setStory] = useState<UtkalKathaStoryV2 | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'chapters' | 'glossary' | 'sources'>('chapters');
  const [viewMode, setViewMode] = useState<'standard' | 'parallel'>('standard');
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [isFavourited, setIsFavourited] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Load story details and pre-warm browser voice synthesis
  useEffect(() => {
    if (!storyId || !isOpen) {
      setStory(null);
      setIsPlaying(false);
      return;
    }

    // Pre-warm browser voices on modal open so Android speech synthesis is instantaneous
    ensureBrowserVoicesReady(1200).catch(() => {});

    let isMounted = true;
    utkalKathaClientV2.getStory(storyId).then((data) => {
      if (isMounted && data) {
        setStory(data);
        setActiveChapterIndex(0);
        // Load saved progress
        utkalKathaClientV2.getProgress('guest', storyId).then((p) => {
          if (p && p.chapterNumber >= 1 && p.chapterNumber <= data.chapters.length) {
            setActiveChapterIndex(p.chapterNumber - 1);
          }
        });
      }
    });

    return () => {
      isMounted = false;
      unifiedVoicePipeline.stopAll();
    };
  }, [storyId, isOpen]);

  // Clean up audio on unmount or close
  const handleClose = useCallback(() => {
    unifiedVoicePipeline.stopAll();
    setIsPlaying(false);
    onClose();
  }, [onClose]);

  if (!isOpen || !story) return null;

  const currentChapter: KathaChapterV2 | undefined = story.chapters[activeChapterIndex];

  // Helper to get active localized chapter text
  const getChapterTitle = (ch: KathaChapterV2) => {
    if (language === 'or') return ch.titleOr;
    if (language === 'hi') return ch.titleHi;
    return ch.titleEn;
  };

  const getChapterContent = (ch: KathaChapterV2) => {
    if (language === 'or') return ch.contentOr;
    if (language === 'hi') return ch.contentHi;
    return ch.contentEn;
  };

  const getStoryTitle = () => {
    if (language === 'or') return story.titleOr;
    if (language === 'hi') return story.titleHi;
    return story.titleEn;
  };

  // Play narration for current chapter
  const handlePlayCurrentChapter = () => {
    if (!currentChapter) return;

    if (isPlaying) {
      unifiedVoicePipeline.stopAll();
      setIsPlaying(false);
      return;
    }

    const title = getChapterTitle(currentChapter);
    const content = getChapterContent(currentChapter);
    const fullText = `${title}. ${content}`;

    setIsPlaying(true);
    unifiedVoicePipeline.speak({
      text: fullText,
      lang: language,
      storyId: story.id,
      playbackSpeed: audioSpeed,
      onStart: () => setIsPlaying(true),
      onEnded: () => {
        setIsPlaying(false);
        // Save progress upon completion
        utkalKathaClientV2.saveProgress('guest', story.id, currentChapter.chapterNumber, 0, true);
      },
      onError: () => setIsPlaying(false),
    });
  };

  const handleNextChapter = () => {
    if (activeChapterIndex < story.chapters.length - 1) {
      if (isPlaying) unifiedVoicePipeline.stopAll();
      setIsPlaying(false);
      const nextIdx = activeChapterIndex + 1;
      setActiveChapterIndex(nextIdx);
      utkalKathaClientV2.saveProgress('guest', story.id, nextIdx + 1, 0, false);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      if (isPlaying) unifiedVoicePipeline.stopAll();
      setIsPlaying(false);
      const prevIdx = activeChapterIndex - 1;
      setActiveChapterIndex(prevIdx);
      utkalKathaClientV2.saveProgress('guest', story.id, prevIdx + 1, 0, false);
    }
  };

  const handleToggleFavourite = async () => {
    const fav = await utkalKathaClientV2.toggleFavourite(story.id);
    setIsFavourited(fav);
  };

  const handleShareStory = () => {
    const text = `📜 *Utkal Katha: ${getStoryTitle()}*\n${currentChapter ? getChapterTitle(currentChapter) : ''}\n\nExplore all 25 Odishan heritage chronicles at https://utkalsarathi.vercel.app`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#13161c] border border-[#e5b85b]/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <header className="px-4 sm:px-6 py-4 bg-[#1a1e27] border-b border-[#2a3140] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff7a1a] via-[#e5b85b] to-[#1ca39e] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#0b0d10] rounded-full flex items-center justify-center text-[#e5b85b] font-bold text-sm">
                ☸
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ff7a1a]/20 text-[#ff7a1a] border border-[#ff7a1a]/40">
                  {story.districtId.toUpperCase()}
                </span>
                <span className="text-[10px] text-[#b6b1a6]">
                  {story.historicalPeriod}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#f7f3e8] font-serif-brand line-clamp-1">
                {getStoryTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Trilingual Language Selector */}
            <div className="flex items-center bg-[#0b0d10] p-1 rounded-lg border border-[#2a3140]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                  language === 'en'
                    ? 'bg-[#ff7a1a] text-stone-950 shadow'
                    : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('or')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                  language === 'or'
                    ? 'bg-[#ff7a1a] text-stone-950 shadow'
                    : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
                }`}
              >
                ଓଡ଼ିଆ
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                  language === 'hi'
                    ? 'bg-[#ff7a1a] text-stone-950 shadow'
                    : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-[#b6b1a6] hover:text-[#f7f3e8] hover:bg-[#2a3140] rounded-lg transition"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <div className="bg-[#0b0d10] px-4 sm:px-6 py-2 border-b border-[#2a3140] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'chapters'
                  ? 'bg-[#e5b85b]/20 text-[#e5b85b] border border-[#e5b85b]/40'
                  : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t(language, 'navKatha')} ({story.chapterCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'glossary'
                  ? 'bg-[#e5b85b]/20 text-[#e5b85b] border border-[#e5b85b]/40'
                  : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Word-by-Word Glossary ({story.vocabularyGlossary.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'sources'
                  ? 'bg-[#e5b85b]/20 text-[#e5b85b] border border-[#e5b85b]/40'
                  : 'text-[#b6b1a6] hover:text-[#f7f3e8]'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>Epigraphy &amp; Sources</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavourite}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                isFavourited
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'border-[#2a3140] text-[#b6b1a6] hover:text-[#f7f3e8]'
              }`}
              title="Bookmark story"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{story.stats.favouriteCount}</span>
            </button>
            <button
              onClick={handleShareStory}
              className="p-1.5 rounded-lg border border-[#2a3140] text-[#b6b1a6] hover:text-[#2ecc71] transition"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'chapters' && currentChapter && (
            <div className="space-y-6">
              {/* Horizontal Scrollable Chapter Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#b6b1a6]">
                  <span>Select Chapter:</span>
                  <span className="text-[#e5b85b] font-bold">
                    Chapter {activeChapterIndex + 1} of {story.chapters.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                  {story.chapters.map((ch, idx) => (
                    <button
                      key={ch.chapterNumber}
                      onClick={() => {
                        if (isPlaying) unifiedVoicePipeline.stopAll();
                        setIsPlaying(false);
                        setActiveChapterIndex(idx);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                        activeChapterIndex === idx
                          ? 'bg-gradient-to-r from-[#ff7a1a] to-[#e5b85b] text-stone-950 font-black shadow-md'
                          : 'bg-[#1a1e27] text-[#b6b1a6] hover:text-[#f7f3e8] border border-[#2a3140]'
                      }`}
                    >
                      Ch {ch.chapterNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Chapter Card */}
              <article className="bg-[#1a1e27] border border-[#2a3140] rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2a3140] pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1ca39e]">
                      Theme: {currentChapter.themeKey.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#e5b85b] font-serif-brand mt-0.5">
                      {getChapterTitle(currentChapter)}
                    </h3>
                  </div>

                  {/* Audio Listen Button & Speed Selector */}
                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle: Standard vs Trilingual Aligned */}
                    <button
                      onClick={() => setViewMode(viewMode === 'standard' ? 'parallel' : 'standard')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                        viewMode === 'parallel'
                          ? 'bg-[#1ca39e]/20 text-[#1ca39e] border-[#1ca39e]/50'
                          : 'bg-[#0b0d10] text-[#b6b1a6] border-[#2a3140] hover:text-[#f7f3e8]'
                      }`}
                      title="Toggle sentence-aligned trilingual parallel view"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {viewMode === 'parallel' ? 'Single View' : 'Parallel 3-Lang'}
                      </span>
                    </button>

                    <button
                      onClick={handlePlayCurrentChapter}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition ${
                        isPlaying
                          ? 'bg-amber-500 text-stone-950 animate-pulse'
                          : 'bg-gradient-to-r from-[#ff7a1a] to-[#e5b85b] hover:from-amber-500 hover:to-amber-400 text-stone-950'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>{t(language, 'listenAudioGuide')}</span>
                        </>
                      )}
                    </button>

                    <select
                      value={audioSpeed}
                      onChange={(e) => {
                        const newSpeed = parseFloat(e.target.value);
                        setAudioSpeed(newSpeed);
                        if (isPlaying) {
                          unifiedVoicePipeline.stopAll();
                          setIsPlaying(false);
                        }
                      }}
                      className="bg-[#0b0d10] text-[#e5b85b] text-xs font-bold py-2 px-2 rounded-xl border border-[#2a3140]"
                    >
                      <option value="0.85">0.85x</option>
                      <option value="1.0">1.0x</option>
                      <option value="1.15">1.15x</option>
                      <option value="1.3">1.3x</option>
                    </select>
                  </div>
                </div>

                {/* Chapter Prose Content */}
                {viewMode === 'standard' ? (
                  <div className="text-[#f7f3e8] text-sm sm:text-base leading-relaxed space-y-3 font-sans">
                    <p className="whitespace-pre-line">
                      {getChapterContent(currentChapter)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* English Original */}
                    <div className="p-3.5 rounded-xl bg-[#0b0d10] border border-[#ff7a1a]/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ff7a1a]/20 text-[#ff7a1a]">
                          English Master Edition
                        </span>
                        <span className="text-[10px] text-[#b6b1a6]">{currentChapter.wordCountEn} words</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#f7f3e8]">{currentChapter.titleEn}</h4>
                      <p className="text-xs sm:text-sm text-[#e2ded5] leading-relaxed whitespace-pre-line">
                        {currentChapter.contentEn}
                      </p>
                    </div>

                    {/* Odia Translation */}
                    <div className="p-3.5 rounded-xl bg-[#0b0d10] border border-[#e5b85b]/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#e5b85b]/20 text-[#e5b85b]">
                          ଓଡ଼ିଆ ଅନୁବାଦ (Original Odia Script)
                        </span>
                        <span className="text-[10px] text-[#b6b1a6]">{currentChapter.wordCountOr} words</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#e5b85b]">{currentChapter.titleOr}</h4>
                      <p className="text-xs sm:text-sm text-[#f7f3e8] leading-relaxed whitespace-pre-line font-serif-brand">
                        {currentChapter.contentOr}
                      </p>
                    </div>

                    {/* Hindi Translation */}
                    <div className="p-3.5 rounded-xl bg-[#0b0d10] border border-[#1ca39e]/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#1ca39e]/20 text-[#1ca39e]">
                          हिन्दी अनुवाद (Hindi Script Alignment)
                        </span>
                        <span className="text-[10px] text-[#b6b1a6]">{currentChapter.wordCountHi} words</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1ca39e]">{currentChapter.titleHi}</h4>
                      <p className="text-xs sm:text-sm text-[#f7f3e8] leading-relaxed whitespace-pre-line">
                        {currentChapter.contentHi}
                      </p>
                    </div>
                  </div>
                )}

                {/* In-Chapter Trilingual Vocabulary Highlights */}
                {currentChapter.vocabulary && currentChapter.vocabulary.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#2a3140]/60 space-y-2">
                    <span className="text-[11px] font-bold text-[#b6b1a6] flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-[#e5b85b]" />
                      <span>Vocabulary in this chapter:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentChapter.vocabulary.map((v, i) => (
                        <div
                          key={i}
                          className="bg-[#0b0d10] p-2.5 rounded-lg border border-[#2a3140] text-xs flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-[#e5b85b]">{v.term}</strong>
                            <span className="text-[10px] text-[#ff7a1a] uppercase px-1.5 py-0.2 rounded bg-[#ff7a1a]/10">
                              {v.category}
                            </span>
                          </div>
                          <div className="text-[#b6b1a6] text-[11px] flex gap-2">
                            <span>ଓଡ଼ିଆ: <span className="text-[#f7f3e8] font-bold">{v.odia}</span></span>
                            <span>•</span>
                            <span>हिन्दी: <span className="text-[#f7f3e8] font-bold">{v.hindi}</span></span>
                          </div>
                          <p className="text-[10px] text-[#a9a69e] italic mt-0.5">
                            {v.context}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>

              {/* Prev / Next Chapter Navigation Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevChapter}
                  disabled={activeChapterIndex === 0}
                  className="px-4 py-2 rounded-xl bg-[#1a1e27] hover:bg-[#2a3140] disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-[#f7f3e8] border border-[#2a3140] flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </button>

                <div className="text-xs text-[#b6b1a6]">
                  {activeChapterIndex + 1} / {story.chapters.length}
                </div>

                <button
                  onClick={handleNextChapter}
                  disabled={activeChapterIndex === story.chapters.length - 1}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#e5b85b] text-stone-950 font-black disabled:opacity-30 disabled:pointer-events-none text-xs flex items-center gap-1.5 transition shadow"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <div className="bg-[#1a1e27] p-4 rounded-xl border border-[#2a3140] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#e5b85b]">
                    Trilingual Word-by-Word Historical Vocabulary
                  </h4>
                  <p className="text-xs text-[#b6b1a6] mt-0.5">
                    Compare key historical terms, architectural orders, and cultural concepts across English, Odia, and Hindi.
                  </p>
                </div>
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Filter terms (EN / ଓଡ଼ିଆ / हिन्दी)..."
                  className="bg-[#0b0d10] text-[#f7f3e8] placeholder-[#b6b1a6] text-xs px-3 py-1.5 rounded-lg border border-[#2a3140] focus:border-[#e5b85b] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {story.vocabularyGlossary
                  .filter((term) => {
                    if (!glossarySearch.trim()) return true;
                    const q = glossarySearch.toLowerCase();
                    return (
                      term.term.toLowerCase().includes(q) ||
                      term.odia.toLowerCase().includes(q) ||
                      term.hindi.toLowerCase().includes(q) ||
                      term.context.toLowerCase().includes(q)
                    );
                  })
                  .map((term, i) => (
                  <div
                    key={i}
                    className="bg-[#1a1e27] border border-[#2a3140] rounded-xl p-4 flex flex-col justify-between gap-2 shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-sm font-black text-[#e5b85b]">{term.term}</h5>
                        <div className="flex items-center gap-3 text-xs mt-1">
                          <span className="text-[#f7f3e8]">
                            ଓଡ଼ିଆ: <strong className="text-[#ff7a1a]">{term.odia}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-[#f7f3e8]">
                            हिन्दी: <strong className="text-[#1ca39e]">{term.hindi}</strong>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2a3140] text-[#b6b1a6]">
                        {term.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#b6b1a6] border-t border-[#2a3140] pt-2">
                      {term.context}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="bg-[#1a1e27] p-4 rounded-xl border border-[#2a3140] space-y-2">
                <h4 className="text-sm font-bold text-[#e5b85b] flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-[#ff7a1a]" />
                  <span>Epigraphical Records &amp; Academic Bibliography</span>
                </h4>
                <p className="text-xs text-[#b6b1a6]">
                  Every historical claim, dynastic date, and architectural dimension in this chronicle is grounded in documented epigraphic corpora, ASI memoirs, and temple archives.
                </p>
              </div>

              <div className="bg-[#0b0d10] p-4 rounded-xl border border-[#2a3140] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1ca39e]">
                  Official Citations &amp; Gazettes
                </span>
                <ul className="space-y-2 text-xs text-[#f7f3e8]">
                  {story.sources.map((src, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#e5b85b] font-bold">[{idx + 1}]</span>
                      <span>{src}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#1a1e27] border border-[#2a3140] text-xs text-[#b6b1a6] flex items-center gap-3">
                <Info className="w-5 h-5 text-[#e5b85b] shrink-0" />
                <span>
                  Classification: <strong>{story.factClassification}</strong>. Oral legends and folkloric traditions are clearly distinguished from peer-reviewed ASI archaeological records.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
