import React, { useState, useMemo } from 'react';
import { ALL_KATHA_STORIES, KathaStory } from '../data/kathaCatalog';
import { AppLanguage, t } from '../data/i18n';
import { Volume2, Square, Bookmark, BookmarkCheck, Share2, Sparkles, Filter, BookOpen } from 'lucide-react';

interface UtkalKathaViewProps {
  language: AppLanguage;
  playingStoryId: string | null;
  onPlayStory: (story: KathaStory) => void;
  onStopStory: () => void;
  onShareStory: (story: KathaStory) => void;
  onOpenReader?: (storyId: string) => void;
}

export const UtkalKathaView: React.FC<UtkalKathaViewProps> = ({
  language,
  playingStoryId,
  onPlayStory,
  onStopStory,
  onShareStory,
  onOpenReader,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [savedStoryIds, setSavedStoryIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('utkal_saved_stories');
      return raw ? new Set(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const categories = useMemo(() => {
    const set = new Set(ALL_KATHA_STORIES.map((s) => s.category));
    return ['ALL', 'SAVED', ...Array.from(set)];
  }, []);

  const filteredStories = useMemo(() => {
    return ALL_KATHA_STORIES.filter((s) => {
      if (selectedCategory === 'SAVED') return savedStoryIds.has(s.id);
      if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedCategory, savedStoryIds]);

  const toggleSave = (id: string) => {
    setSavedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('utkal_saved_stories', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const getStoryTitle = (s: KathaStory) => {
    if (language === 'or' && s.titleOdia) return s.titleOdia;
    if (language === 'hi' && s.titleHindi) return s.titleHindi;
    return s.titleEn;
  };

  const getStoryBody = (s: KathaStory) => {
    if (language === 'or' && s.bodyOdia) return s.bodyOdia;
    if (language === 'hi' && s.bodyHindi) return s.bodyHindi;
    return s.bodyEn;
  };

  const getBadgeClass = (classification: string) => {
    if (classification.includes('Archaeological')) return 'badge-archaeology';
    if (classification.includes('Traditional') || classification.includes('Legend')) return 'badge-folklore';
    return 'badge-history';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="border-b border-[#2a3140] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f7f3e8] flex items-center gap-2.5 font-serif-brand">
              <span>🎙️</span>
              <span>{t(language, 'navKatha')} — {language === 'or' ? 'ଓଡ଼ିଶାର ଐତିହ୍ୟ ସ୍ୱର ଗନ୍ତାଘର' : language === 'hi' ? 'स्वर-वर्णित ऐतिहासिक गाथाएँ' : 'Multilingual Voice Library'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#b6b1a6] mt-1.5 max-w-3xl">
              {language === 'or'
                ? 'ପ୍ରତ୍ୟେକ ଜିଲ୍ଲାର ପ୍ରମାଣିତ ଐତିହାସିକ ଗାଥା ଓଡ଼ିଆ, ହିନ୍ଦୀ ଏବଂ ଇଂରାଜୀ ଭାଷାରେ ଉପଲବ୍ଧ। ପ୍ରତ୍ନତାତ୍ତ୍ୱିକ ତଥ୍ୟ ଏବଂ ପୌରାଣିକ କିମ୍ବଦନ୍ତୀ ସ୍ପଷ୍ଟ ଭାବେ ଚିହ୍ନିତ।'
                : language === 'hi'
                ? 'प्रत्येक जिले की प्रमाणित ऐतिहासिक गाथाएँ ओड़िया, हिन्दी व अंग्रेजी में उपलब्ध हैं। पुरातात्विक साक्ष्य और पारंपरिक लोककथाएँ स्पष्ट रूप से चिह्नित हैं।'
                : 'Every district has a verified story in English, ଓଡ଼ିଆ, and हिन्दी. Documented archaeology and oral legends are strictly separated with clear epistemic badges.'}
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#ff7a1a]/15 text-[#ff7a1a] border border-[#ff7a1a]/30">
            {filteredStories.length} {language === 'or' ? 'କାହାଣୀ ଉପଲବ୍ଧ' : language === 'hi' ? 'गाथाएँ उपलब्ध' : 'Verified Stories'}
          </span>
        </div>

        {/* Categories Filter */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 mt-3 custom-scrollbar">
          <Filter className="w-3.5 h-3.5 text-[#b6b1a6] shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#ff7a1a] text-stone-950 shadow-md font-bold'
                  : 'bg-[#1b2029] text-[#b6b1a6] hover:text-[#f7f3e8] border border-[#2a3140]'
              }`}
            >
              {cat === 'ALL'
                ? language === 'or' ? 'ସମସ୍ତ କାହାଣୀ' : language === 'hi' ? 'सभी गाथाएँ' : 'All Stories'
                : cat === 'SAVED'
                ? language === 'or' ? `★ ସଂରକ୍ଷିତ (${savedStoryIds.size})` : language === 'hi' ? `★ सहेजे गए (${savedStoryIds.size})` : `★ Saved (${savedStoryIds.size})`
                : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStories.map((story) => {
          const isPlaying = playingStoryId === story.id;
          const isSaved = savedStoryIds.has(story.id);

          return (
            <article
              key={story.id}
              className={`rounded-2xl bg-[#13161c] border p-5 flex flex-col justify-between transition-all hover:border-[#e5b85b]/50 shadow-lg ${
                isPlaying ? 'border-[#e5b85b] ring-1 ring-[#e5b85b]/50 shadow-amber-950/40' : 'border-[#2a3140]'
              }`}
            >
              <div className="space-y-3">
                {/* Epistemic Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`badge-epistemic ${getBadgeClass(story.factClassification)}`}>
                    {story.factClassification}
                  </span>
                  <span className="text-[11px] text-[#b6b1a6] font-mono">
                    ~{Math.round(story.durationSec / 60)} min
                  </span>
                </div>

                {/* Destination & Period */}
                <div className="text-xs text-[#b6b1a6]">
                  <strong className="text-[#e5b85b]">{story.destinationName}</strong> • {story.period}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#f7f3e8] leading-snug font-serif-brand">
                  {getStoryTitle(story)}
                </h3>

                {/* Body Text */}
                <p className="text-xs sm:text-sm text-[#b6b1a6] line-clamp-4 leading-relaxed">
                  {getStoryBody(story)}
                </p>

                {/* Sources Citation */}
                <div className="pt-2 border-t border-[#2a3140]/60 text-[11px] text-[#b6b1a6]/80 truncate">
                  <span className="font-semibold text-[#e5b85b]">Source:</span> {story.sources}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-4 mt-3 border-t border-[#2a3140]/60">
                {/* Read Chapters & Vocabulary Button */}
                {onOpenReader && (
                  <button
                    type="button"
                    onClick={() => onOpenReader(story.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#1b2029] hover:bg-[#252c38] text-[#e5b85b] border border-[#e5b85b]/40 shadow transition-all active:scale-95"
                    title="Read 20 chapters & trilingual glossary"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Chapters</span>
                  </button>
                )}

                {/* Play / Stop Button */}
                <button
                  type="button"
                  onClick={() => (isPlaying ? onStopStory() : onPlayStory(story))}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    isPlaying
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-950/50'
                      : 'bg-[#ff7a1a] hover:bg-[#e06308] text-stone-950 shadow-md shadow-orange-950/40'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>{t(language, 'stopAudio')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t(language, 'listenAudioGuide')}</span>
                    </>
                  )}
                </button>

                {/* Save Story */}
                <button
                  type="button"
                  onClick={() => toggleSave(story.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                    isSaved
                      ? 'bg-[#e5b85b]/20 border-[#e5b85b] text-[#e5b85b]'
                      : 'bg-[#1b2029] border-[#2a3140] text-[#b6b1a6] hover:text-[#f7f3e8]'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save Story'}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => onShareStory(story)}
                  className="p-2 rounded-xl bg-[#1b2029] border border-[#2a3140] text-[#b6b1a6] hover:text-[#f7f3e8] transition-all active:scale-95"
                  title="Share Story"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
