import React, { useState, useMemo } from 'react';
import { ODISHA_30_DISTRICTS, DistrictInfo, getDistrictsByZone } from '../data/odishaDistricts';
import {
  MapPin,
  Sparkles,
  Gem,
  Bed,
  Utensils,
  Bus,
  Phone,
  HeartPulse,
  Compass,
  Award,
  TreePine,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Shield,
  Building,
} from 'lucide-react';

interface DistrictsKnowledgeHubProps {
  onSelectDistrict: (district: DistrictInfo) => void;
  onOpenAssistant: (prompt?: string) => void;
}

type HubView = 'all-districts' | 'hidden-gems' | 'stays' | 'food' | 'transit' | 'emergency' | 'guides';

export const DistrictsKnowledgeHub: React.FC<DistrictsKnowledgeHubProps> = ({
  onSelectDistrict,
  onOpenAssistant,
}) => {
  const [activeView, setActiveView] = useState<HubView>('all-districts');
  const [selectedZone, setSelectedZone] = useState<'All' | 'Coastal' | 'Western' | 'Southern' | 'Northern' | 'Central'>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Filter districts based on zone and search query
  const filteredDistricts = useMemo(() => {
    return ODISHA_30_DISTRICTS.filter((d) => {
      const matchesZone = selectedZone === 'All' || d.zone === selectedZone;
      const q = searchFilter.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.odiaName.includes(q) ||
        d.headquarters.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q)) ||
        (d.hiddenGems && d.hiddenGems.some((g) => g.toLowerCase().includes(q))) ||
        d.signatureCuisine.some((c) => c.toLowerCase().includes(q));

      return matchesZone && matchesSearch;
    });
  }, [selectedZone, searchFilter]);

  // Aggregate all hidden gems across filtered districts
  const allHiddenGems = useMemo(() => {
    const list: { district: DistrictInfo; gem: string }[] = [];
    filteredDistricts.forEach((d) => {
      if (d.hiddenGems) {
        d.hiddenGems.forEach((gem) => {
          list.push({ district: d, gem });
        });
      }
    });
    return list;
  }, [filteredDistricts]);

  // Aggregate all stays across filtered districts
  const allStays = useMemo(() => {
    const list: { district: DistrictInfo; stay: any }[] = [];
    filteredDistricts.forEach((d) => {
      if (d.recommendedStays) {
        d.recommendedStays.forEach((stay) => {
          list.push({ district: d, stay });
        });
      }
    });
    return list;
  }, [filteredDistricts]);

  // Aggregate all food spots across filtered districts
  const allFoodSpots = useMemo(() => {
    const list: { district: DistrictInfo; food: any }[] = [];
    filteredDistricts.forEach((d) => {
      if (d.foodSpots) {
        d.foodSpots.forEach((food) => {
          list.push({ district: d, food });
        });
      }
    });
    return list;
  }, [filteredDistricts]);

  return (
    <div className="space-y-6 bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            30 Districts Universal Knowledge Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Comprehensive Odisha Tourism Directory
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
            Everything you need across all 30 districts: verified attractions, hidden gems, hotels & eco-camps, iconic culinary spots, last-mile transit, hospitals, and certified tourist guides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAssistant('Give me a zone-by-zone travel comparison of all 30 districts of Odisha')}
            className="px-4 py-2 rounded-xl bg-purple-700/60 hover:bg-purple-700 text-purple-200 hover:text-white text-xs font-semibold border border-purple-500/40 flex items-center gap-1.5 transition-colors shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Utkal Mitra AI</span>
          </button>
        </div>
      </div>

      {/* View Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all-districts', label: '🏛️ 30 Districts Grid', count: filteredDistricts.length },
          { id: 'hidden-gems', label: '💎 Hidden Gems', count: allHiddenGems.length },
          { id: 'stays', label: '🏨 Stays & Eco Camps', count: allStays.length },
          { id: 'food', label: '🍲 Food & GI Sweets', count: allFoodSpots.length },
          { id: 'transit', label: '🚆 Transit & Advice', count: filteredDistricts.length },
          { id: 'emergency', label: '🏥 Hospitals & Helplines', count: filteredDistricts.length },
          { id: 'guides', label: '🧭 Tourist Guides', count: filteredDistricts.length },
        ].map((view) => {
          const isActive = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as HubView)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 scale-105'
                  : 'bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800'
              }`}
            >
              <span>{view.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-amber-800 text-amber-100' : 'bg-stone-800 text-stone-400'}`}>
                {view.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-850 p-3 rounded-2xl border border-stone-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by district name, landmark, sweet, stay or zone (e.g. Koraput, Chhena Poda, Deomali)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-stone-900 border border-stone-750 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400 placeholder-stone-500"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-3 top-2 text-[11px] text-stone-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['All', 'Coastal', 'Western', 'Southern', 'Northern', 'Central'] as const).map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedZone === zone
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: ALL 30 DISTRICTS CARDS */}
      {activeView === 'all-districts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDistricts.map((district) => (
            <div
              key={district.id}
              onClick={() => onSelectDistrict(district)}
              className="group bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-base group-hover:text-amber-300 transition-colors">
                        {district.name}
                      </h4>
                      <span className="text-sm font-serif font-bold text-amber-400">
                        {district.odiaName}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      HQ: <strong className="text-stone-300">{district.headquarters}</strong> • {district.zone} Zone
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-semibold whitespace-nowrap">
                    {district.zone}
                  </span>
                </div>

                <p className="text-xs text-stone-300 italic mt-2 line-clamp-2">
                  "{district.tagline}"
                </p>

                {/* Highlights Preview */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[11px] text-stone-400 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Top Attractions:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {district.highlights.slice(0, 3).map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800"
                      >
                        {h}
                      </span>
                    ))}
                    {district.highlights.length > 3 && (
                      <span className="text-[10px] text-stone-500 px-1 py-0.5">
                        +{district.highlights.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Hidden Gems Pill */}
                {district.hiddenGems && district.hiddenGems.length > 0 && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px]">
                    <span className="font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                      <Gem className="w-3 h-3 text-amber-400" />
                      Hidden Gem:
                    </span>
                    <span className="text-stone-300 line-clamp-1">{district.hiddenGems[0]}</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Row */}
              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <Bed className="w-3 h-3" />
                  <span>{district.recommendedStays?.length || 2} Stays</span>
                </span>
                <span className="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore All 6 Pillars</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: 💎 HIDDEN GEMS COLLECTION */}
      {activeView === 'hidden-gems' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-850 to-stone-850 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
            <span>Discover offbeat waterfalls, secluded prehistoric cave temples, canyon trails, and secret beaches across Odisha's 30 districts:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-900/60 text-amber-200">
              {allHiddenGems.length} Gems Cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allHiddenGems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectDistrict(item.district)}
                className="p-4 rounded-2xl bg-stone-850 hover:bg-stone-800 border border-amber-500/20 hover:border-amber-400/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-semibold">
                      {item.district.name} ({item.district.zone})
                    </span>
                    <Gem className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm leading-snug">
                    {item.gem}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                    Lesser-known heritage & natural wonder in {item.district.name} district ({item.district.headquarters}).
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between text-[11px] text-amber-400">
                  <span>View District Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: 🏨 STAYS & ECO CAMPS DIRECTORY */}
      {activeView === 'stays' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 flex items-center justify-between text-xs text-teal-200">
            <span>State-wide official accommodation directory: OTDC Panthanivas, Eco Tour Odisha Nature Camps, and Heritage Stays with direct phone bookings:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-900/60 text-teal-200">
              {allStays.length} Stays Listed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allStays.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-850 border border-stone-750 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                      {item.district.name} • {item.district.zone}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 font-semibold">
                      {item.stay.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{item.stay.name}</h4>
                  <p className="text-xs font-mono text-amber-300">
                    Est. Tariff: {item.stay.estPrice}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                  <button
                    onClick={() => onSelectDistrict(item.district)}
                    className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
                  >
                    <span>View District</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <a
                    href={`tel:${item.stay.contact}`}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call {item.stay.contact}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: 🍲 FOOD & GI SWEETS */}
      {activeView === 'food' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-orange-950/30 border border-orange-500/30 flex items-center justify-between text-xs text-orange-200">
            <span>Authentic Odia Culinary Map: Iconic GI-tagged sweets, famous dhabas, temple Mahaprasad, and local tribal specialties:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-900/60 text-orange-200">
              {allFoodSpots.length} Food Spots
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allFoodSpots.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectDistrict(item.district)}
                className="p-4 rounded-2xl bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-orange-500/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                      {item.district.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-950 text-orange-300 border border-orange-800/40">
                      Must-Eat
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{item.food.item}</h4>
                  <p className="text-xs text-stone-300 mt-1.5">
                    {item.food.recommendation}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between text-[11px] text-orange-400">
                  <span>Explore {item.district.name} food guide</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: 🚆 TRANSIT & ADVICE */}
      {activeView === 'transit' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
            Verified transit links: nearest rail junctions, airports, state highway routes, and local last-mile connectivity advice for each district:
          </div>

          <div className="space-y-3">
            {filteredDistricts.map((district) => (
              <div
                key={district.id}
                className="p-4 rounded-2xl bg-stone-850 border border-stone-750 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{district.name}</h4>
                    <span className="text-xs text-amber-400 font-serif font-bold">{district.odiaName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                      {district.zone} Zone
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectDistrict(district)}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Full Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 text-[10px] block">Rail / Air:</span>
                    <span className="text-stone-200 font-medium">{district.transportHubs.nearestRail}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 text-[10px] block">Highway Route:</span>
                    <span className="text-stone-200 font-medium">{district.transportHubs.highway}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 text-[10px] block">Bus Services:</span>
                    <span className="text-stone-200 font-medium truncate block">{district.transportHubs.busServices}</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-blue-950/20 border border-blue-900/40 text-[11px] text-blue-200">
                  <strong className="text-blue-300">Last-Mile Advice:</strong> {district.transportHubs.lastMileTransit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 6: 🏥 EMERGENCY & HOSPITALS */}
      {activeView === 'emergency' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
            <span>State-wide emergency directory: District Headquarters Hospital, Town Police Station, and 24x7 Disaster Control Room numbers with click-to-call:</span>
            <div className="flex items-center gap-2">
              <a href="tel:112" className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-xs">
                SOS 112
              </a>
              <a href="tel:06752-222074" className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-xs">
                Tourist Police
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDistricts.map((district) => (
              <div
                key={district.id}
                className="p-4 rounded-2xl bg-stone-850 border border-stone-750 flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{district.name} District</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                      HQ: {district.headquarters}
                    </span>
                  </div>
                  <div className="text-xs text-stone-300 space-y-0.5">
                    <p><strong className="text-stone-400">Hospital:</strong> {district.safetyAndHelpline.districtHospital}</p>
                    <p><strong className="text-stone-400">Police:</strong> {district.safetyAndHelpline.policeStation}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                  <a
                    href={`tel:${district.safetyAndHelpline.controlRoomNumber}`}
                    className="text-emerald-400 font-mono font-semibold hover:underline"
                  >
                    Control: {district.safetyAndHelpline.controlRoomNumber}
                  </a>
                  <a
                    href={`tel:${district.safetyAndHelpline.controlRoomNumber}`}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Helpline</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 7: 🧭 TOURIST GUIDES */}
      {activeView === 'guides' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
            Verified tourist guides, district information counters, and local heritage guilds across all 30 districts:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDistricts.map((district) => (
              <div
                key={district.id}
                className="p-4 rounded-2xl bg-stone-850 border border-stone-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700 font-semibold">
                    {district.name} • {district.zone}
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    {district.touristGuideInfo?.contactName || 'District Tourism Counter'}
                  </h4>
                  <p className="text-xs text-stone-400">
                    Location: {district.touristGuideInfo?.deskLocation || district.headquarters}
                  </p>
                </div>

                {district.touristGuideInfo && (
                  <a
                    href={`tel:${district.touristGuideInfo.phone}`}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{district.touristGuideInfo.phone}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
