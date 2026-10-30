import React, { useState, useMemo } from 'react';
import { ODISHA_30_DISTRICTS, DistrictInfo } from '../data/odishaDistricts';
import { ALL_KATHA_STORIES, KathaStory } from '../data/kathaCatalog';
import { AppLanguage, t } from '../data/i18n';
import {
  Search,
  MapPin,
  Volume2,
  Share2,
  Sparkles,
  ExternalLink,
  Shield,
  HeartPulse,
  Bus,
  Utensils,
  Gem,
  Award,
  ChevronRight,
} from 'lucide-react';

interface DistrictsExplorerViewProps {
  language: AppLanguage;
  onSelectDistrict: (district: DistrictInfo) => void;
  onPlayStory: (story: KathaStory) => void;
  onShareDistrict: (district: DistrictInfo) => void;
  onOpenOfflinePack: () => void;
  onOpenTripPlanner: () => void;
  onOpenSafety: () => void;
  onOpenKatha: () => void;
}

export const DistrictsExplorerView: React.FC<DistrictsExplorerViewProps> = ({
  language,
  onSelectDistrict,
  onPlayStory,
  onShareDistrict,
  onOpenOfflinePack,
  onOpenTripPlanner,
  onOpenSafety,
  onOpenKatha,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [onlyHiddenGems, setOnlyHiddenGems] = useState<boolean>(false);

  const filteredDistricts = useMemo(() => {
    return ODISHA_30_DISTRICTS.filter((d) => {
      // Region filter
      if (selectedRegion === 'COASTAL' && d.zone !== 'Coastal') return false;
      if (selectedRegion === 'CENTRAL' && d.zone !== 'Central' && d.zone !== 'Northern') return false;
      if (selectedRegion === 'WESTERN' && d.zone !== 'Western') return false;
      if (selectedRegion === 'SOUTHERN' && d.zone !== 'Southern') return false;

      // Hidden gems filter
      if (onlyHiddenGems && (!d.hiddenGems || d.hiddenGems.length === 0)) return false;

      // Search query
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        d.name.toLowerCase().includes(q) ||
        d.odiaName.includes(q) ||
        d.headquarters.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q)) ||
        (d.hiddenGems && d.hiddenGems.some((g) => g.toLowerCase().includes(q))) ||
        d.signatureCuisine.some((c) => c.toLowerCase().includes(q)) ||
        d.handicraftsAndArt.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedRegion, onlyHiddenGems]);

  const handlePlayDistrictAudio = (district: DistrictInfo) => {
    // Find district's overview story
    const match =
      ALL_KATHA_STORIES.find((s) => s.districtId.toLowerCase() === district.id.toLowerCase()) ||
      ALL_KATHA_STORIES.find((s) => s.destinationName.toLowerCase().includes(district.name.toLowerCase())) ||
      ALL_KATHA_STORIES[0];
    onPlayStory(match);
  };

  const getDistrictName = (d: DistrictInfo) => {
    if (language === 'or') return `${d.odiaName} (${d.name})`;
    return `${d.name} (${d.odiaName})`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Epistemic Transparency Strip */}
      <div className="rounded-xl bg-[#1b2029] border border-[#2a3140] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#b6b1a6]">
        <div className="flex items-center gap-2">
          <span>⚖️</span>
          <span>{t(language, 'epistemicBanner')}</span>
        </div>
        <button
          type="button"
          onClick={onOpenOfflinePack}
          className="px-3 py-1 rounded-lg bg-[#1ca39e]/20 hover:bg-[#1ca39e]/30 border border-[#1ca39e]/40 text-[#1ca39e] font-semibold text-xs transition-colors shrink-0"
        >
          📥 {t(language, 'offlinePackBtn')}
        </button>
      </div>

      {/* Hero Card matching Application 1 */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#13161c] via-[#1b2029] to-[#0b0d10] border border-[#e5b85b]/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff7a1a]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1ca39e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#ff7a1a]/15 text-[#ff7a1a] border border-[#ff7a1a]/30 text-xs font-bold tracking-wider uppercase">
            {t(language, 'heroBadge')}
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-[#f7f3e8] tracking-tight leading-tight font-serif-brand">
            {t(language, 'heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-[#b6b1a6] leading-relaxed">
            {t(language, 'heroSubtitle')}
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenKatha}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff7a1a] hover:bg-[#e06308] text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-orange-950/40 transition-all active:scale-95"
            >
              <span>🎙️</span>
              <span>{t(language, 'ctaListenKatha')}</span>
            </button>
            <button
              type="button"
              onClick={onOpenTripPlanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e5b85b]/20 hover:bg-[#e5b85b]/30 border border-[#e5b85b]/40 text-[#e5b85b] font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              <span>🎒</span>
              <span>{t(language, 'ctaPlanTrip')}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSafety}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              <span>🚨</span>
              <span>{t(language, 'ctaSafetyHub')}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 mt-6 border-t border-[#2a3140]/60">
          <div className="p-3 rounded-xl bg-[#13161c]/80 border border-[#2a3140]">
            <div className="text-xl sm:text-2xl font-black text-[#e5b85b]">30</div>
            <div className="text-[11px] text-[#b6b1a6] font-medium">{t(language, 'statDistricts')}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#13161c]/80 border border-[#2a3140]">
            <div className="text-xl sm:text-2xl font-black text-[#ff7a1a]">61+</div>
            <div className="text-[11px] text-[#b6b1a6] font-medium">{t(language, 'statDestinations')}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#13161c]/80 border border-[#2a3140]">
            <div className="text-xl sm:text-2xl font-black text-[#1ca39e]">30+</div>
            <div className="text-[11px] text-[#b6b1a6] font-medium">{t(language, 'statStories')}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#13161c]/80 border border-[#2a3140]">
            <div className="text-xl sm:text-2xl font-black text-red-400">112 / 108</div>
            <div className="text-[11px] text-[#b6b1a6] font-medium">{t(language, 'statHelpline')}</div>
          </div>
        </div>
      </section>

      {/* Search & Region Filter Bar */}
      <div className="space-y-3 pt-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b6b1a6]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(language, 'heroSearchPlaceholder')}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#13161c] border border-[#2a3140] text-[#f7f3e8] placeholder-[#b6b1a6]/60 text-xs sm:text-sm focus:border-[#e5b85b] outline-none shadow-md"
          />
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
          {[
            { id: 'ALL', label: t(language, 'filterAllRegions') },
            { id: 'COASTAL', label: t(language, 'filterCoastal') },
            { id: 'CENTRAL', label: t(language, 'filterCentral') },
            { id: 'WESTERN', label: t(language, 'filterWestern') },
            { id: 'SOUTHERN', label: t(language, 'filterSouthern') },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRegion(r.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRegion === r.id
                  ? 'bg-[#ff7a1a] text-stone-950 font-bold shadow-md'
                  : 'bg-[#1b2029] text-[#b6b1a6] hover:text-[#f7f3e8] border border-[#2a3140]'
              }`}
            >
              {r.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setOnlyHiddenGems(!onlyHiddenGems)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              onlyHiddenGems
                ? 'bg-[#1ca39e] text-stone-950 font-bold shadow-md'
                : 'bg-[#1b2029] text-[#b6b1a6] hover:text-[#f7f3e8] border border-[#2a3140]'
            }`}
          >
            <Gem className="w-3 h-3" />
            <span>{t(language, 'filterHiddenGemsOnly')}</span>
          </button>
        </div>
      </div>

      {/* District Count Header */}
      <div className="flex items-center justify-between text-xs text-[#b6b1a6]">
        <span>
          Showing <strong className="text-[#e5b85b]">{filteredDistricts.length}</strong> of 30 districts
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedRegion('ALL');
              setOnlyHiddenGems(false);
            }}
            className="text-[#ff7a1a] hover:underline"
          >
            {t(language, 'resetFilters')}
          </button>
        )}
      </div>

      {/* 30 Districts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDistricts.map((d) => (
          <article
            key={d.id}
            className="rounded-2xl bg-[#13161c] border border-[#2a3140] hover:border-[#e5b85b]/50 p-5 flex flex-col justify-between transition-all hover:shadow-xl shadow-md group"
          >
            <div className="space-y-3">
              {/* Header Zone badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1ca39e]/15 text-[#1ca39e] border border-[#1ca39e]/30">
                  {d.zone} Odisha
                </span>
                <span className="text-[11px] text-[#b6b1a6]">HQ: {d.headquarters}</span>
              </div>

              {/* District Name */}
              <h3 className="text-xl font-black text-[#f7f3e8] group-hover:text-[#e5b85b] transition-colors font-serif-brand">
                {getDistrictName(d)}
              </h3>

              <p className="text-xs text-[#ff7a1a] font-medium leading-relaxed italic">
                "{d.tagline}"
              </p>

              <p className="text-xs text-[#b6b1a6] line-clamp-3 leading-relaxed">
                {d.description}
              </p>

              {/* Key Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-[#2a3140]/60">
                <div className="text-[11px] text-[#b6b1a6]">
                  <strong className="text-[#f7f3e8]">Top Places:</strong> {d.highlights.slice(0, 3).join(', ')}
                </div>
                {d.hiddenGems && d.hiddenGems.length > 0 && (
                  <div className="text-[11px] text-[#1ca39e]">
                    <strong>💎 Hidden Gem:</strong> {d.hiddenGems[0]}
                  </div>
                )}
                <div className="text-[11px] text-[#b6b1a6]">
                  <strong className="text-[#f7f3e8]">Cuisine &amp; GI:</strong> {d.signatureCuisine.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-[#2a3140]/60">
              {/* View Details */}
              <button
                type="button"
                onClick={() => onSelectDistrict(d)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1b2029] hover:bg-[#242b38] border border-[#2a3140] text-[#f7f3e8] text-xs font-semibold transition-all active:scale-95"
              >
                <span>{t(language, 'viewDistrictDetails')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Listen Audio Story */}
              <button
                type="button"
                onClick={() => handlePlayDistrictAudio(d)}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#ff7a1a]/20 hover:bg-[#ff7a1a]/30 border border-[#ff7a1a]/40 text-[#ff7a1a] text-xs font-bold transition-all active:scale-95"
                title="Listen to District Heritage Story"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Story</span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={() => onShareDistrict(d)}
                className="p-2 rounded-xl bg-[#1b2029] border border-[#2a3140] text-[#b6b1a6] hover:text-[#f7f3e8] transition-all active:scale-95"
                title="Share District"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
