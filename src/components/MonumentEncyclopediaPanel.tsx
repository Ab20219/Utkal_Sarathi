import React, { useState, useMemo } from 'react';
import { AudioGuideStory, EncyclopedicVolume } from '../types';
import { HISTORIC_CORPUS_STATS } from '../data/odishaHistoricalStories';
import { MonumentVoiceProfile } from '../data/monumentVoiceProfiles';
import {
  BookOpen,
  Search,
  Volume2,
  Copy,
  Check,
  Languages,
  ScrollText,
} from 'lucide-react';

interface MonumentEncyclopediaPanelProps {
  story: AudioGuideStory;
  voiceProfile: MonumentVoiceProfile;
  selectedLang: 'en' | 'or' | 'hi';
  onLanguageChange: (lang: 'en' | 'or' | 'hi') => void;
  onNarrateVolume: (volumeText: string, volumeLabel: string) => void;
  isNarratingCustomVolume: boolean;
  activeCustomVolumeLabel?: string | null;
}

export const MonumentEncyclopediaPanel: React.FC<MonumentEncyclopediaPanelProps> = ({
  story,
  voiceProfile,
  selectedLang,
  onLanguageChange,
  onNarrateVolume,
  isNarratingCustomVolume,
  activeCustomVolumeLabel,
}) => {
  const volumes: EncyclopedicVolume[] = useMemo(
    () => story.encyclopedicVolumes || [],
    [story.encyclopedicVolumes]
  );

  const [activeVolNum, setActiveVolNum] = useState<number>(1);
  const [filterText, setFilterText] = useState<string>('');
  const [copiedVolNum, setCopiedVolNum] = useState<number | null>(null);

  const filteredVolumes = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return volumes;
    return volumes.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.odiaTitle.toLowerCase().includes(q) ||
        v.hindiTitle.toLowerCase().includes(q) ||
        v.contentEn.toLowerCase().includes(q) ||
        v.contentOr.toLowerCase().includes(q) ||
        v.contentHi.toLowerCase().includes(q)
    );
  }, [volumes, filterText]);

  const currentVolume = useMemo(() => {
    return (
      filteredVolumes.find((v) => v.volumeNumber === activeVolNum) ||
      filteredVolumes[0] ||
      volumes[0] ||
      null
    );
  }, [filteredVolumes, activeVolNum, volumes]);

  const getVolumeTitle = (v: EncyclopedicVolume) => {
    if (selectedLang === 'or') return v.odiaTitle || v.title;
    if (selectedLang === 'hi') return v.hindiTitle || v.title;
    return v.title;
  };

  const getVolumeBody = (v: EncyclopedicVolume) => {
    if (selectedLang === 'or') return v.contentOr || v.contentEn;
    if (selectedLang === 'hi') return v.contentHi || v.contentEn;
    return v.contentEn;
  };

  const handleCopyVolume = (v: EncyclopedicVolume) => {
    const payload = `${getVolumeTitle(v)}\n\n${getVolumeBody(v)}`;
    navigator.clipboard?.writeText(payload);
    setCopiedVolNum(v.volumeNumber);
    setTimeout(() => setCopiedVolNum(null), 2200);
  };

  if (!currentVolume) return null;

  const currentTitle = getVolumeTitle(currentVolume);
  const currentBody = getVolumeBody(currentVolume);
  const volumeTag = `${story.monument} — ${currentTitle}`;
  const isThisVolumePlaying =
    isNarratingCustomVolume && activeCustomVolumeLabel === volumeTag;

  return (
    <section
      aria-label="Scholarly Historic Encyclopedia"
      className="p-4 sm:p-6 rounded-2xl bg-stone-900/95 border border-stone-800 space-y-5"
    >
      {/* Top Archival Summary Row (clean unboxed typographic metadata) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <ScrollText className="w-4 h-4" />
            <span>Utkal Katha Scholarly Archive</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {HISTORIC_CORPUS_STATS.totalWords.toLocaleString()} Total Corpus Words
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {HISTORIC_CORPUS_STATS.totalMonuments} Historic Places
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-100 mt-1">
            {selectedLang === 'or'
              ? `${voiceProfile.placeName.or} — ୬ ଖଣ୍ଡ ଐତିହାସିକ ଜ୍ଞାନକୋଷ`
              : selectedLang === 'hi'
              ? `${voiceProfile.placeName.hi} — ६ खंड ऐतिहासिक विश्वकोश`
              : `${story.monument} — 6-Volume Historical Monograph`}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5 tabular-nums">
            Monument Dossier: {(story.totalWords || 5200).toLocaleString()} verified words across English, ଓଡ଼ିଆ &amp; हिन्दी
          </p>
        </div>

        {/* Language Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-950 border border-stone-800 self-start">
          <Languages className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1" />
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'or', label: 'ଓଡ଼ିଆ' },
              { code: 'hi', label: 'हिन्दी' },
            ] as const
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onLanguageChange(item.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedLang === item.code
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-400 hover:text-stone-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search within Monument Volumes */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          aria-label="Search scholarly volumes"
          placeholder={
            selectedLang === 'or'
              ? 'ଶିଳାଲେଖ, ରାଜବଂଶ, ସ୍ଥାପତ୍ୟ କିମ୍ବା ପର୍ବ ଖୋଜନ୍ତୁ...'
              : selectedLang === 'hi'
              ? 'शिलालेख, राजवंश, स्थापत्य या परंपरा खोजें...'
              : 'Search inscriptions, petrology, dynasties, rituals, or excavations in this monument...'
          }
          className="w-full pl-10 pr-16 py-2 text-xs sm:text-sm rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
        {filterText && (
          <button
            type="button"
            onClick={() => setFilterText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Volume Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredVolumes.map((vol, idx) => {
          const isActive = currentVolume.volumeNumber === vol.volumeNumber;
          return (
            <button
              key={vol.volumeNumber}
              type="button"
              onClick={() => setActiveVolNum(vol.volumeNumber)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-amber-950/50 border-amber-500/70 text-stone-100'
                  : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-amber-400/90 tabular-nums mb-1">
                <span>Volume {String(vol.volumeNumber || idx + 1).padStart(2, '0')}</span>
                <span>{vol.wordCount.toLocaleString()} words</span>
              </div>
              <div className="text-xs font-semibold line-clamp-2 leading-snug">
                {getVolumeTitle(vol)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Volume Reader */}
      <article className="p-4 sm:p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="text-xs text-amber-400 font-medium flex items-center gap-2 tabular-nums">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{currentVolume.wordCount.toLocaleString()} words in volume</span>
              <span aria-hidden="true">·</span>
              <span>Voice: {voiceProfile.narratorName[selectedLang]}</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1">
              {currentTitle}
            </h4>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => onNarrateVolume(currentBody, volumeTag)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isThisVolumePlaying
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                {isThisVolumePlaying
                  ? selectedLang === 'or'
                    ? 'ଶୁଣାଯାଉଛି...'
                    : selectedLang === 'hi'
                    ? 'सुनाया जा रहा है...'
                    : 'Narrating Volume...'
                  : selectedLang === 'or'
                  ? 'ଏହି ଖଣ୍ଡ ଶୁଣନ୍ତୁ'
                  : selectedLang === 'hi'
                  ? 'यह खंड सुनें'
                  : 'Narrate This Volume'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyVolume(currentVolume)}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copiedVolNum === currentVolume.volumeNumber ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-stone-200 leading-relaxed max-h-[420px] overflow-y-auto pr-2">
          {currentBody.split('\n\n').map((para, pIdx) => (
            <p key={pIdx} className="leading-7">
              {para}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
};
