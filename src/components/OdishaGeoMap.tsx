import React, { useState, useMemo } from 'react';
import { ODISHA_DESTINATIONS, Destination } from '../utils/itinerary';
import { ODISHA_30_DISTRICTS, OdishaDistrict, findDistrict } from '../data/odishaDistricts';
import {
  MapPin,
  Compass,
  Navigation,
  Clock,
  Bus,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  Building,
  TreePine,
  Waves,
  ShieldAlert,
  Hospital,
  PhoneCall,
  UtensilsCrossed,
  Hotel,
  Search,
  Eye,
  Filter,
  LocateFixed,
  Loader2,
} from 'lucide-react';

import {
  DISTRICT_MAP_POINTS,
  DistrictGeoPoint,
  findNearestDistrictByGps,
} from '../data/odishaDistrictGeoPoints';
import {
  requestAndGetCurrentLocation,
  buildGoogleMapsDirectionsUrl,
  calculateHaversineDistanceKm,
  GpsPositionResult,
} from '../utils/nativeAndroid';


interface OdishaGeoMapProps {
  onSelectDestination?: (dest: Destination) => void;
  onOpenAssistant?: (prompt: string) => void;
}

export const OdishaGeoMap: React.FC<OdishaGeoMapProps> = ({
  onSelectDestination,
  onOpenAssistant,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('puri');
  const [activeCategory, setActiveCategory] = useState<'all' | 'temples' | 'beaches' | 'nature' | 'food'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSafetyPhone, setCopiedSafetyPhone] = useState<string | null>(null);
  const [userGps, setUserGps] = useState<GpsPositionResult | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [nearestGpsSummary, setNearestGpsSummary] = useState<string | null>(null);

  // Active district object from comprehensive 30-district data
  const activeDistrict: OdishaDistrict = useMemo(() => {
    return (
      ODISHA_30_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      ODISHA_30_DISTRICTS[0]
    );
  }, [selectedDistrictId]);

  const activeGeoPoint = DISTRICT_MAP_POINTS[activeDistrict.id];

  const distanceFromUserKm = useMemo(() => {
    if (!userGps || !activeGeoPoint) return null;
    return calculateHaversineDistanceKm(
      userGps.latitude,
      userGps.longitude,
      activeGeoPoint.lat,
      activeGeoPoint.lng
    );
  }, [userGps, activeGeoPoint]);

  const handleLocateMe = async () => {
    setIsLocatingGps(true);
    setGpsError(null);
    try {
      const pos = await requestAndGetCurrentLocation();
      setUserGps(pos);
      const nearest = findNearestDistrictByGps(pos.latitude, pos.longitude);
      setSelectedZone('all');
      setActiveCategory('all');
      setSelectedDistrictId(nearest.point.id);
      setNearestGpsSummary(
        `GPS Lock (${pos.latitude.toFixed(4)}°N, ${pos.longitude.toFixed(4)}°E • ±${Math.round(
          pos.accuracyMeters
        )}m): Nearest hub is ${nearest.point.name} (${nearest.distanceKm} km away).`
      );
    } catch (err: any) {
      setGpsError(err?.message || 'Unable to acquire live GPS location.');
    } finally {
      setIsLocatingGps(false);
    }
  };

  // Filtered district list
  const filteredDistricts = useMemo(() => {
    return ODISHA_30_DISTRICTS.filter((d) => {
      if (selectedZone !== 'all' && d.zone.toLowerCase() !== selectedZone.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q) || d.odiaName.includes(q);
        const matchesHq = d.headquarters.toLowerCase().includes(q);
        const matchesAttractions = d.highlights.some((h) => h.toLowerCase().includes(q));
        const matchesCuisine = d.signatureCuisine.some((c) => c.toLowerCase().includes(q));
        return matchesName || matchesHq || matchesAttractions || matchesCuisine;
      }
      if (activeCategory === 'beaches') {
        return DISTRICT_MAP_POINTS[d.id]?.hasBeaches;
      }
      return true;
    });
  }, [selectedZone, searchQuery, activeCategory]);

  const handleCopyPhone = (label: string, phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedSafetyPhone(label);
    setTimeout(() => setCopiedSafetyPhone(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-stone-900 to-red-950 border border-amber-800/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Interactive 30-District Geographic Intelligence & Heritage Atlas</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Odisha 30 Districts Interactive Map & Traveller Dossier
          </h1>
          <p className="mt-2 text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Explore all 30 districts of Odisha with real GIS coordinates: ancient temples, Blue Flag beaches,
            eco-reserves, signature GI food, regulated transport hubs, and 24x7 UtkalSuraksha emergency hospitals.
          </p>
        </div>
      </div>

      {/* Filter Toolbar: Zone, Category & Search */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Zone Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Zone:
            </span>
            {[
              { id: 'all', label: 'All 30 Districts' },
              { id: 'coastal', label: 'Coastal (8)' },
              { id: 'central', label: 'Central (5)' },
              { id: 'northern', label: 'Northern (3)' },
              { id: 'southern', label: 'Southern (8)' },
              { id: 'western', label: 'Western (6)' },
            ].map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedZone === z.id
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by temple, beach, district or food..."
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Quick Filter Chips: Temples, Beaches, Nature, Food */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
            Focus:
          </span>
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-stone-700 text-white'
                : 'bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            All Attributes
          </button>
          <button
            onClick={() => setActiveCategory('temples')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeCategory === 'temples'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-amber-300 hover:bg-stone-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Temples &amp; Sanctuaries
          </button>
          <button
            onClick={() => setActiveCategory('beaches')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeCategory === 'beaches'
                ? 'bg-cyan-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-cyan-300 hover:bg-stone-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Beaches &amp; Coastlines (7 Marine Districts)
          </button>
          <button
            onClick={() => setActiveCategory('nature')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeCategory === 'nature'
                ? 'bg-emerald-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-emerald-300 hover:bg-stone-800'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            Eco-Tourism &amp; Waterfalls
          </button>
          <button
            onClick={() => setActiveCategory('food')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeCategory === 'food'
                ? 'bg-orange-500 text-stone-950 font-bold'
                : 'bg-stone-950 text-orange-300 hover:bg-stone-800'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            GI Cuisine &amp; Food Spots
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map Canvas (Left) + Detailed District Intelligence Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Map Canvas (7 cols on Desktop) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                Odisha Geo-Spatial District Map ({filteredDistricts.length} shown)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocatingGps}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                {isLocatingGps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5" />
                )}
                <span>{isLocatingGps ? 'Locating GPS...' : 'Locate Me (GPS)'}</span>
              </button>
              {activeGeoPoint && (
                <a
                  href={buildGoogleMapsDirectionsUrl(
                    activeGeoPoint.lat,
                    activeGeoPoint.lng,
                    activeDistrict.name
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </a>
              )}
            </div>
          </div>

          {nearestGpsSummary && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{nearestGpsSummary}</span>
              </span>
            </div>
          )}

          {gpsError && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2">
              <span>{gpsError}</span>
              <button
                type="button"
                onClick={() => setGpsError(null)}
                className="text-red-300 hover:text-white font-bold px-1.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Interactive SVG Canvas */}
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 rounded-2xl border border-stone-800/80 overflow-hidden flex items-center justify-center p-2">
            {/* Bay of Bengal Sea Backdrop */}
            <div className="absolute right-0 bottom-0 w-2/5 h-3/5 bg-gradient-to-tl from-cyan-950/30 to-transparent pointer-events-none rounded-br-2xl" />
            <div className="absolute right-3 bottom-3 text-[10px] text-cyan-600 font-bold uppercase tracking-widest pointer-events-none select-none">
              Bay of Bengal (ବଙ୍ଗୋପସାଗର)
            </div>

            {/* Stylized Odisha Geography Contour */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Outer Boundary Silhouette */}
              <path
                d="M 40,16 Q 60,12 78,16 Q 85,25 82,32 Q 77,40 78,52 Q 74,60 68,70 Q 55,75 48,82 Q 35,85 24,88 Q 15,92 14,84 Q 18,72 26,62 Q 22,48 32,36 Q 38,28 40,16 Z"
                fill="rgba(30, 41, 59, 0.4)"
                stroke="rgba(245, 158, 11, 0.35)"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />

              {/* Coastal Blue Line */}
              <path
                d="M 83,28 Q 78,38 78,51 Q 74,60 68,70 Q 55,75 48,82"
                fill="none"
                stroke="rgba(6, 182, 212, 0.6)"
                strokeWidth="1.2"
              />

              {/* District Connection Roads / Corridors */}
              <line x1="63" y1="53" x2="68" y2="68" stroke="rgba(217, 119, 6, 0.25)" strokeWidth="0.5" />
              <line x1="63" y1="53" x2="65" y2="47" stroke="rgba(217, 119, 6, 0.25)" strokeWidth="0.5" />
              <line x1="63" y1="53" x2="52" y2="73" stroke="rgba(217, 119, 6, 0.25)" strokeWidth="0.5" />
              <line x1="65" y1="47" x2="72" y2="43" stroke="rgba(217, 119, 6, 0.25)" strokeWidth="0.5" />
              <line x1="72" y1="43" x2="78" y2="50" stroke="rgba(217, 119, 6, 0.25)" strokeWidth="0.5" />
              <line x1="42" y1="36" x2="34" y2="38" stroke="rgba(217, 119, 6, 0.25)" strokeWidth="0.5" />
              <line x1="25" y1="83" x2="16" y2="89" stroke="rgba(217, 119, 6, 0.25)" strokeWidth="0.5" />

              {/* Render All Filtered District Points */}
              {filteredDistricts.map((d) => {
                const pt = DISTRICT_MAP_POINTS[d.id];
                if (!pt) return null;
                const isSelected = d.id === selectedDistrictId;

                return (
                  <g
                    key={d.id}
                    onClick={() => setSelectedDistrictId(d.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for selected district */}
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="0.6"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? '2.8' : '1.8'}
                      fill={
                        isSelected
                          ? '#f59e0b'
                          : pt.hasBeaches
                          ? '#06b6d4'
                          : pt.zone === 'Western'
                          ? '#a855f7'
                          : pt.zone === 'Southern'
                          ? '#10b981'
                          : '#f97316'
                      }
                      stroke="#0f172a"
                      strokeWidth="0.5"
                      className="transition-all group-hover:scale-125"
                    />

                    {/* District Short Label */}
                    <text
                      x={pt.x}
                      y={pt.y - 3}
                      textAnchor="middle"
                      fontSize="2.4"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fill={isSelected ? '#fbbf24' : '#cbd5e1'}
                      className="pointer-events-none drop-shadow"
                    >
                      {d.headquarters.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected District Highlight Overlay Pill */}
            <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                {activeDistrict.name} ({activeDistrict.odiaName})
              </span>
              <span className="text-[10px] text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/20 font-semibold">
                {activeDistrict.zone} Zone
              </span>
            </div>
          </div>

          {/* District Quick Carousel / Grid below SVG */}
          <div className="mt-4 pt-3 border-t border-stone-800">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
              All 30 Districts (Click to View Details):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
              {filteredDistricts.map((d) => {
                const isSelected = d.id === selectedDistrictId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDistrictId(d.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                        : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800/80'
                    }`}
                  >
                    <span>{d.name.split(' ')[0]}</span>
                    <span className="text-[10px] opacity-70 ml-1">({d.odiaName})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed District Intelligence Dossier (5 cols on Desktop) */}
        <div className="lg:col-span-5 bg-stone-900 border border-amber-600/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          {/* District Dossier Header */}
          <div className="pb-4 border-b border-stone-800">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeDistrict.zone} Odisha • HQ: {activeDistrict.headquarters}
              </span>
              {activeGeoPoint?.hasBeaches && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  <Waves className="w-3 h-3" />
                  Coastal Sea Beach
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2 flex items-center justify-between">
              <span>{activeDistrict.name}</span>
              <span className="text-base sm:text-lg font-bold text-amber-400 font-sans">
                {activeDistrict.odiaName}
              </span>
            </h3>
            <p className="text-xs text-amber-300/90 font-medium italic mt-1">
              &quot;{activeDistrict.tagline}&quot;
            </p>
            <p className="text-xs text-stone-300 leading-relaxed mt-2.5">
              {activeDistrict.description}
            </p>
            {activeGeoPoint && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-stone-800/80 text-[11px]">
                <span className="font-mono text-stone-400">
                  GPS: {activeGeoPoint.lat.toFixed(4)}°N, {activeGeoPoint.lng.toFixed(4)}°E
                  {distanceFromUserKm !== null && (
                    <strong className="text-emerald-400 ml-2">
                      • {distanceFromUserKm} km from your GPS
                    </strong>
                  )}
                </span>
                <a
                  href={buildGoogleMapsDirectionsUrl(
                    activeGeoPoint.lat,
                    activeGeoPoint.lng,
                    `${activeDistrict.headquarters}, ${activeDistrict.name}, Odisha`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Turn-by-Turn Directions</span>
                </a>
              </div>
            )}
          </div>

          {/* Section 1: Temples, Beaches & Highlights */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Building className="w-4 h-4" />
              <span>Temples &amp; Spiritual Sanctuaries</span>
            </div>
            <div className="space-y-1.5">
              {(activeGeoPoint?.famousTemples || activeDistrict.highlights).map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-950 border border-stone-800/90 text-xs text-stone-200 flex items-start gap-2"
                >
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Beaches / Water bodies / Eco-Tourism */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                <Waves className="w-4 h-4" />
                <span>
                  {activeGeoPoint?.hasBeaches
                    ? 'Beaches & Waterways'
                    : 'Waterfalls, Lakes & Nature Reserves'}
                </span>
              </div>
              <div className="space-y-1.5">
                {(activeGeoPoint?.famousBeachesOrWater || activeDistrict.ecoTourismAndNature).map(
                  (b, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-950 border border-cyan-900/30 text-xs text-stone-200 flex items-start gap-2"
                    >
                      <Waves className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Transport & Transit Connectivity */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <Bus className="w-4 h-4" />
              <span>Transport &amp; Connectivity Hubs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300">
              {activeDistrict.transportHubs.nearestAirport && (
                <div>
                  <span className="font-semibold text-stone-400 block text-[10px]">Airport:</span>
                  <span>{activeDistrict.transportHubs.nearestAirport}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-stone-400 block text-[10px]">Railway Hub:</span>
                <span>{activeDistrict.transportHubs.nearestRail}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-400 block text-[10px]">Highway:</span>
                <span>{activeDistrict.transportHubs.highway}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-400 block text-[10px]">Last-Mile Transit:</span>
                <span>{activeDistrict.transportHubs.lastMileTransit}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Signature Food & Must-Visit Food Spots */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-orange-400 font-bold uppercase tracking-wider text-[11px]">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Signature Cuisine &amp; Must-Visit Food Spots</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {activeDistrict.signatureCuisine.map((food, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-orange-950/40 text-orange-200 border border-orange-800/40 text-[11px]"
                >
                  {food}
                </span>
              ))}
            </div>
            {activeDistrict.foodSpots && (
              <div className="space-y-1.5 pt-1 border-t border-stone-800/80">
                {activeDistrict.foodSpots.map((spot, idx) => (
                  <div key={idx} className="text-[11px] text-stone-300 flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">📍 {spot.item}:</span>
                    <span className="text-stone-400">{spot.recommendation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: UtkalSuraksha Emergency Numbers (Hospital, Police, OSDMA) */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4" />
                <span>UtkalSuraksha District Helplines</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">24x7 Emergency</span>
            </div>

            <div className="space-y-2 text-stone-200">
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800">
                <div>
                  <span className="block text-[10px] text-stone-400 font-semibold">Hospital:</span>
                  <span className="font-medium">{activeDistrict.safetyAndHelpline.districtHospital}</span>
                </div>
                <a
                  href="tel:108"
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3 h-3" />
                  108 Ambulance
                </a>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800">
                <div>
                  <span className="block text-[10px] text-stone-400 font-semibold">
                    Police Station / Control:
                  </span>
                  <span className="font-medium text-[11px]">
                    {activeDistrict.safetyAndHelpline.policeStation}
                  </span>
                  <span className="text-[10px] text-amber-300 block font-mono">
                    Tel: {activeDistrict.safetyAndHelpline.controlRoomNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleCopyPhone(
                        activeDistrict.id,
                        activeDistrict.safetyAndHelpline.controlRoomNumber
                      )
                    }
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px]"
                    title="Copy phone"
                  >
                    {copiedSafetyPhone === activeDistrict.id ? 'Copied!' : 'Copy'}
                  </button>
                  <a
                    href="tel:112"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    112 SOS
                  </a>
                </div>
              </div>

              <div className="text-[10px] text-stone-400 leading-relaxed pt-1">
                <span className="font-bold text-stone-300">Cyclone / Flood Shelters:</span>{' '}
                OSDMA {activeDistrict.name} Multi-Purpose Cyclone &amp; Disaster Shelter (Dial 1070)
              </div>
            </div>
          </div>

          {/* Section 5: Recommended Stays & Tourist Information */}
          {activeDistrict.recommendedStays && (
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-300 font-bold uppercase tracking-wider text-[11px]">
                <Hotel className="w-4 h-4 text-amber-400" />
                <span>Verified Stays &amp; OTDC Panthanivas</span>
              </div>
              <div className="space-y-1.5">
                {activeDistrict.recommendedStays.map((stay, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-stone-900 border border-stone-850"
                  >
                    <div>
                      <span className="font-bold text-stone-200">{stay.name}</span>
                      <span className="text-[10px] text-amber-400 ml-1.5">[{stay.type}]</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">{stay.estPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Plan Itinerary & Ask Utkal Mitra AI */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                if (onSelectDestination) {
                  const matchingDest = ODISHA_DESTINATIONS.find((dest) =>
                    dest.district.toLowerCase().includes(activeDistrict.name.toLowerCase()) ||
                    activeDistrict.name.toLowerCase().includes(dest.district.toLowerCase())
                  ) || {
                    id: activeDistrict.id,
                    name: activeDistrict.name,
                    odiaName: activeDistrict.odiaName,
                    region: 'Golden Triangle' as const,
                    district: activeDistrict.headquarters,
                    category: 'heritage' as const,
                    description: activeDistrict.description,
                    historicalSignificance: activeDistrict.tagline,
                    legend: activeDistrict.highlights.join(', '),
                    verifiedHours: '06:00 AM - 06:00 PM',
                    entryFee: {
                      indian: 0,
                      foreigner: 0,
                    },
                    recommendedDurationHours: 4,
                    bestTimeToVisit: 'October - March',
                    transportInfo: {
                      nearestHub: activeDistrict.transportHubs.nearestRail,
                      distanceKm: 15,
                      options: [
                        {
                          mode: 'OSRTC Bus' as const,
                          routeOrDesc: activeDistrict.transportHubs.highway,
                          fare: '₹50 - ₹150',
                          isVerified: true,
                        },
                      ],
                    },
                    cuisineHighlight: activeDistrict.signatureCuisine[0] || 'Local Odia Prasad',
                    safetyTip: `Emergency Hospital: ${activeDistrict.safetyAndHelpline.districtHospital}`,
                    ecoSensitivityTag: 'Eco-sensitive zone, preserve cleanliness',
                    sourceReliability: 'verified_official' as const,
                  };
                  onSelectDestination(matchingDest);
                }
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Generate 3-Day {activeDistrict.name.split(' ')[0]} Itinerary</span>
            </button>

            <button
              onClick={() => {
                if (onOpenAssistant) {
                  onOpenAssistant(
                    `Tell me all about visiting ${activeDistrict.name} (${activeDistrict.odiaName}) district in Odisha: its ancient temples, beaches, local food, and safety tips.`
                  );
                }
              }}
              className="py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-stone-700"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask AI Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
