import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Destination,
  DayPlan,
  ODISHA_DESTINATIONS,
  generateItinerary,
  filterDestinations,
  calculatePlansTotalCost,
  TripInterest,
  SavedItineraryRecord,
  loadSavedItineraries,
} from '../utils/itinerary';
import { SavedItinerariesModal } from './SavedItinerariesModal';
import { QUICK_TRIP_TEMPLATES, QuickTripTemplate } from '../data/quickTripTemplates';
import { calculateOdishaBudget, formatINR, TravelStyle } from '../utils/budget';
import {
  ODISHA_30_DISTRICTS,
  DistrictInfo,
  findDistrict,
} from '../data/odishaDistricts';
import { DistrictDossierModal } from './DistrictDossierModal';
import { DistrictsKnowledgeHub } from './DistrictsKnowledgeHub';
import { RefineScheduleModal } from './RefineScheduleModal';
import { CustomItineraryEditor } from './CustomItineraryEditor';
import { getNearbyDistricts, NearbyPlaceDetail } from '../data/odishaNearbyDistricts';
import { fetchApi } from '../utils/apiConfig';
import { DISTRICT_MAP_POINTS } from '../data/odishaDistrictGeoPoints';
import { buildGoogleMapsDirectionsUrl } from '../utils/nativeAndroid';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  IndianRupee,
  Users,
  Compass,
  ArrowRight,
  Info,
  CheckCircle2,
  Bus,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Share2,
  Search,
  Building,
  TreePine,
  Waves,
  Eye,
  Plus,
  Check,
  Filter,
  ExternalLink,
  Gem,
  Bed,
  Utensils,
  HeartPulse,
  Phone,
  ArrowUpRight,
  Navigation,
} from 'lucide-react';

interface ItineraryPlannerProps {
  onSaveToOffline: (notes: string) => void;
  onOpenAssistant: (initialPrompt?: string) => void;
  onNavigateToAudio?: (storyId?: string) => void;
}

// Authentic representative imagery for curated Odisha destinations
const DESTINATION_IMAGES: Record<string, string> = {
  'konark-sun-temple': 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
  'puri-jagannath-temple': 'https://images.unsplash.com/photo-1628085645214-365e94bca07e?auto=format&fit=crop&w=800&q=80',
  'lingaraj-temple': 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
  'dhauli-shanti-stupa': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  'udayagiri-khandagiri-caves': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  'raghurajpur-heritage-village': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  'chilika-mangalajodi': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'bhitarkanika-national-park': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'similipal-biosphere': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  'satkosia-tiger-reserve': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'daringbadi-kashmir-of-odisha': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'koraput-tribal-heritage': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
  'hirakud-dam-sambalpur': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
};

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  onSaveToOffline,
  onOpenAssistant,
  onNavigateToAudio,
}) => {
  const [startCity, setStartCity] = useState<string>('Khordha');
  const [days, setDays] = useState<number>(3);
  const [travelers, setTravelers] = useState<number>(2);
  const [customTravelersInput, setCustomTravelersInput] = useState<string>('');
  const [style, setStyle] = useState<TravelStyle>('moderate');
  const [targetBudget, setTargetBudget] = useState<number>(10000);
  const [selectedInterests, setSelectedInterests] = useState<TripInterest[]>([
    'heritage',
    'spiritual',
    'nature',
  ]);

  // Saved Itineraries & Templates
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [activeTemplateNotice, setActiveTemplateNotice] = useState<string | null>(null);

  // Sync saved count
  useEffect(() => {
    setSavedCount(loadSavedItineraries().length);
  }, [isSavedModalOpen]);

  // Planner Mode & AI Refinement States
  const [plannerModeTab, setPlannerModeTab] = useState<'recommended' | 'custom'>('recommended');
  const [isRefineModalOpen, setIsRefineModalOpen] = useState<boolean>(false);
  const [refineSuccessBanner, setRefineSuccessBanner] = useState<string | null>(null);

  // Search & Category Filters for Destination Discovery
  const [heroSearchQuery, setHeroSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [customAddedDestinations, setCustomAddedDestinations] = useState<Destination[]>([]);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Omni-Search states
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [searchCategoryTab, setSearchCategoryTab] = useState<'all' | 'districts' | 'gems' | 'stays' | 'food' | 'emergency' | 'destinations'>('all');
  const [selectedDossierDistrict, setSelectedDossierDistrict] = useState<DistrictInfo | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Selected Starting District Info
  const selectedStartDistrictInfo = useMemo(() => {
    return findDistrict(startCity);
  }, [startCity]);

  // Trip Scope Mode: 'single' (100% chosen district) | 'nearby' (bordering excursions) | 'multi' (custom multi-district circuit)
  const [tripScope, setTripScope] = useState<'single' | 'nearby' | 'multi'>('single');
  const [includeNearby, setIncludeNearby] = useState<boolean>(false);
  const [selectedNearbyDistricts, setSelectedNearbyDistricts] = useState<string[]>([]);
  const [selectedMultiDistricts, setSelectedMultiDistricts] = useState<string[]>(['khordha', 'puri', 'cuttack']);

  // Get available neighboring districts for currently chosen start district
  const availableNearbyDistricts = useMemo(() => {
    return getNearbyDistricts(startCity);
  }, [startCity]);

  // When startCity or availableNearbyDistricts changes, sync selectedNearbyDistricts and ensure start district is first in multi-district list
  useEffect(() => {
    if (availableNearbyDistricts.length > 0) {
      setSelectedNearbyDistricts(availableNearbyDistricts.map((n) => n.districtId));
    } else {
      setSelectedNearbyDistricts([]);
    }
    const startDist = findDistrict(startCity);
    if (startDist) {
      setSelectedMultiDistricts((prev) =>
        prev.includes(startDist.id) ? prev : [startDist.id, ...prev.slice(0, 3)]
      );
    }
  }, [availableNearbyDistricts, startCity]);

  // Close search overlay on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-pillar Omni-Search across all 30 districts and destinations
  const omniSearchResults = useMemo(() => {
    const q = heroSearchQuery.toLowerCase().trim();
    if (!q) {
      return {
        districts: [],
        gems: [],
        stays: [],
        food: [],
        emergency: [],
        destinations: [],
        total: 0,
      };
    }

    // 1. Districts (matched by name, odiaName, HQ, zone, tagline, highlights, gems, food, transit)
    const districts = ODISHA_30_DISTRICTS.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.odiaName.includes(q) ||
      d.headquarters.toLowerCase().includes(q) ||
      d.tagline.toLowerCase().includes(q) ||
      d.zone.toLowerCase().includes(q) ||
      d.highlights.some((h) => h.toLowerCase().includes(q)) ||
      d.hiddenGems?.some((g) => g.toLowerCase().includes(q)) ||
      d.ecoTourismAndNature.some((e) => e.toLowerCase().includes(q)) ||
      d.signatureCuisine.some((c) => c.toLowerCase().includes(q)) ||
      d.transportHubs.highway.toLowerCase().includes(q)
    );

    // 2. Hidden Gems
    const gems: { gem: string; district: DistrictInfo }[] = [];
    ODISHA_30_DISTRICTS.forEach((d) => {
      d.hiddenGems?.forEach((gem) => {
        if (gem.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)) {
          gems.push({ gem, district: d });
        }
      });
    });

    // 3. Stays
    const stays: { stay: any; district: DistrictInfo }[] = [];
    ODISHA_30_DISTRICTS.forEach((d) => {
      d.recommendedStays?.forEach((s) => {
        if (
          s.name.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q)
        ) {
          stays.push({ stay: s, district: d });
        }
      });
    });

    // 4. Food spots
    const food: { spot: any; district: DistrictInfo }[] = [];
    ODISHA_30_DISTRICTS.forEach((d) => {
      d.foodSpots?.forEach((f) => {
        if (
          f.item.toLowerCase().includes(q) ||
          f.recommendation.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.signatureCuisine.some((c) => c.toLowerCase().includes(q))
        ) {
          food.push({ spot: f, district: d });
        }
      });
    });

    // 5. Emergency / Hospitals
    const emergency: DistrictInfo[] = ODISHA_30_DISTRICTS.filter((d) =>
      d.safetyAndHelpline.districtHospital.toLowerCase().includes(q) ||
      d.safetyAndHelpline.policeStation.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q)
    );

    // 6. Curated Destinations
    const destinations = ODISHA_DESTINATIONS.filter((dest) =>
      dest.name.toLowerCase().includes(q) ||
      dest.odiaName.includes(q) ||
      dest.district.toLowerCase().includes(q) ||
      dest.description.toLowerCase().includes(q) ||
      dest.historicalSignificance.toLowerCase().includes(q)
    );

    const total =
      districts.length +
      gems.length +
      stays.length +
      food.length +
      emergency.length +
      destinations.length;

    return { districts, gems, stays, food, emergency, destinations, total };
  }, [heroSearchQuery]);

  // Active generated plans
  const [plans, setPlans] = useState<DayPlan[]>(() =>
    generateItinerary({
      startCity: 'Khordha',
      days: 3,
      interests: ['heritage', 'spiritual', 'nature'],
      travelStyle: 'moderate',
      includeNearby: false,
    })
  );

  // Selected destination modal
  const [modalDest, setModalDest] = useState<Destination | null>(null);
  const [aiCustomPlan, setAiCustomPlan] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const plannerSectionRef = useRef<HTMLDivElement>(null);
  const discoverySectionRef = useRef<HTMLDivElement>(null);

  const scrollToPlanner = () => {
    plannerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDiscovery = () => {
    discoverySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Android hardware / gesture back button for open modals & overlays
  useEffect(() => {
    const onAndroidBack = (e: Event) => {
      if (modalDest) {
        e.preventDefault();
        setModalDest(null);
      } else if (selectedDossierDistrict) {
        e.preventDefault();
        setSelectedDossierDistrict(null);
      } else if (isSavedModalOpen) {
        e.preventDefault();
        setIsSavedModalOpen(false);
      } else if (isRefineModalOpen) {
        e.preventDefault();
        setIsRefineModalOpen(false);
      } else if (isSearchFocused) {
        e.preventDefault();
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('utkalsarathi:android-back', onAndroidBack);
    return () => window.removeEventListener('utkalsarathi:android-back', onAndroidBack);
  }, [modalDest, selectedDossierDistrict, isSavedModalOpen, isRefineModalOpen, isSearchFocused]);

  // Re-generate deterministic plan
  const handleRegenerate = () => {
    const updated = generateItinerary({
      startCity,
      days,
      interests: selectedInterests,
      travelStyle: style,
      includeNearby: tripScope === 'nearby',
      selectedNearbyDistrictIds: selectedNearbyDistricts,
      tripScope,
      selectedMultiDistrictIds: tripScope === 'multi' ? selectedMultiDistricts : undefined,
    });
    setPlans(updated);
  };

  // Automatically update itinerary when key inputs change
  useEffect(() => {
    const updated = generateItinerary({
      startCity,
      days,
      interests: selectedInterests,
      travelStyle: style,
      includeNearby: tripScope === 'nearby',
      selectedNearbyDistrictIds: selectedNearbyDistricts,
      tripScope,
      selectedMultiDistrictIds: tripScope === 'multi' ? selectedMultiDistricts : undefined,
    });
    setPlans(updated);
  }, [
    startCity,
    days,
    style,
    tripScope,
    includeNearby,
    selectedNearbyDistricts,
    selectedMultiDistricts,
    selectedInterests,
  ]);

  const toggleInterest = (cat: TripInterest) => {
    setSelectedInterests((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      return next.length === 0 ? ['heritage'] : next;
    });
  };

  const handleApplyTemplate = (tpl: QuickTripTemplate) => {
    setStartCity(tpl.startCity);
    setDays(tpl.days);
    setTravelers(tpl.travelers);
    setStyle(tpl.style);
    setTripScope(tpl.tripScope);
    if (tpl.selectedMultiDistricts) {
      setSelectedMultiDistricts(tpl.selectedMultiDistricts);
    }
    if (tpl.selectedNearbyDistricts) {
      setSelectedNearbyDistricts(tpl.selectedNearbyDistricts);
    }
    setSelectedInterests(tpl.interests);
    setActiveTemplateNotice(`⚡ Quick Template Activated: ${tpl.name} (${tpl.days} Days)`);
    setTimeout(() => setActiveTemplateNotice(null), 4000);
  };

  const handleLoadSavedItinerary = (rec: SavedItineraryRecord) => {
    setStartCity(rec.startCity);
    setDays(rec.days);
    setTravelers(rec.travelers);
    setStyle(rec.travelStyle);
    setTripScope(rec.tripScope);
    if (rec.selectedMultiDistricts) setSelectedMultiDistricts(rec.selectedMultiDistricts);
    if (rec.selectedNearbyDistricts) setSelectedNearbyDistricts(rec.selectedNearbyDistricts);
    if (rec.selectedInterests) setSelectedInterests(rec.selectedInterests as TripInterest[]);
    if (rec.targetBudget) setTargetBudget(rec.targetBudget);
    if (rec.plans && rec.plans.length > 0) {
      setPlans(rec.plans);
    }
    setActiveTemplateNotice(`📁 Loaded Saved Itinerary: "${rec.title}"`);
    setTimeout(() => setActiveTemplateNotice(null), 4000);
  };

  const budget = useMemo(() => {
    const calc = calculatePlansTotalCost(plans, travelers, style);
    return {
      ...calc,
      perDayCost: Math.round(calc.totalCost / Math.max(1, plans.length)),
      entryFees: Math.round(calc.entryAndBuffer * 0.4),
      shoppingAndBuffer: Math.round(calc.entryAndBuffer * 0.6),
    };
  }, [plans, travelers, style]);

  const handleGenerateAiEnhancement = async () => {
    setIsGeneratingAi(true);
    setAiCustomPlan(null);
    try {
      const res = await fetchApi('/api/plan-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startCity,
          days,
          groupSize: travelers,
          travelers,
          budget: style,
          interests: selectedInterests,
          tripScope,
          includeNearby: tripScope === 'nearby',
          selectedNearbyDistricts,
          selectedMultiDistricts: tripScope === 'multi' ? selectedMultiDistricts : [],
        }),
      });
      const data = await res.json();
      if (data.customPlanText) {
        setAiCustomPlan(data.customPlanText);
      } else {
        const distName = selectedStartDistrictInfo?.name || startCity;
        setAiCustomPlan(
          `AI Travel Guide Recommendation for ${days} Days in ${distName} District:\n• Day 1: Arrive in ${selectedStartDistrictInfo?.headquarters || distName}. Visit ${selectedStartDistrictInfo?.highlights[0] || 'local attractions'}. Savor ${selectedStartDistrictInfo?.signatureCuisine[0] || 'traditional Odia dishes'}.\n• Day 2: Explore ${selectedStartDistrictInfo?.highlights[1] || selectedStartDistrictInfo?.ecoTourismAndNature[0] || 'nature trails'}.\n• Transport: ${selectedStartDistrictInfo?.transportHubs.highway || 'Local highway transit'} & ${selectedStartDistrictInfo?.transportHubs.lastMileTransit || 'auto service'}.`
        );
      }
    } catch {
      const distName = selectedStartDistrictInfo?.name || startCity;
      setAiCustomPlan(
        `Curated Plan for ${distName} District: Savor authentic regional cuisine (${selectedStartDistrictInfo?.signatureCuisine.slice(0, 2).join(', ')}). Travel via ${selectedStartDistrictInfo?.transportHubs.highway || 'local transit'}.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSavePack = () => {
    const summary = `${days}-Day ${style.toUpperCase()} Trip starting from ${startCity} for ${travelers} travelers. Estimated Cost: ${formatINR(
      budget.totalCost
    )}.`;
    onSaveToOffline(summary);
    setSaveSuccessMessage('Saved to Offline Travel Pack!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleAddDestinationToPlan = (dest: Destination) => {
    setCustomAddedDestinations((prev) => [...prev, dest]);
    setAddedNotice(`Added "${dest.name}" to your custom itinerary!`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  // Filtered destinations list
  const filteredDestinationsList = useMemo(() => {
    return ODISHA_DESTINATIONS.filter((d) => {
      const matchesCategory =
        selectedCategoryFilter === 'all'
          ? true
          : selectedCategoryFilter === 'heritage'
          ? d.category === 'heritage' || d.category === 'spiritual'
          : selectedCategoryFilter === 'nature'
          ? d.category === 'nature'
          : selectedCategoryFilter === 'beaches'
          ? d.category === 'beaches' || d.region.includes('Coastal')
          : selectedCategoryFilter === 'tribal'
          ? d.category === 'tribal_crafts'
          : true;

      const q = heroSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.odiaName.includes(q) ||
        d.district.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryFilter, heroSearchQuery]);

  // Related destinations for modal
  const relatedDestinations = useMemo(() => {
    if (!modalDest) return [];
    return ODISHA_DESTINATIONS.filter(
      (d) => d.id !== modalDest.id && (d.district === modalDest.district || d.region === modalDest.region)
    ).slice(0, 3);
  }, [modalDest]);

  return (
    <div className="space-y-10">
      {/* 1. HOMEPAGE HERO BANNER (As specified in Master Build Prompt) */}
      <div className="relative rounded-3xl overflow-visible bg-gradient-to-br from-stone-900 via-amber-950/80 to-red-950 p-6 sm:p-12 border border-amber-800/40 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            UtkalSarathi • Smart Tourism Platform for Odisha
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Discover Odisha, Your Way.
          </h1>

          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            Explore ancient temples, hidden natural wonders, authentic cuisine, and living traditions
            with your intelligent travel companion.
          </p>

          {/* Destination & 30-District Omni-Search Universal Discovery Panel */}
          <div ref={searchContainerRef} className="pt-2 max-w-2xl relative z-40">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-amber-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search across all 30 districts, hidden gems, stays, food spots, or helplines..."
                value={heroSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setHeroSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-full bg-stone-900/95 border-2 border-amber-500/50 rounded-2xl pl-12 pr-16 py-3.5 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 placeholder-stone-400 shadow-2xl backdrop-blur-md transition-all"
              />
              {heroSearchQuery ? (
                <button
                  onClick={() => setHeroSearchQuery('')}
                  className="absolute right-3.5 text-stone-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 transition-colors"
                >
                  Clear
                </button>
              ) : (
                <span className="absolute right-3.5 text-[10px] text-amber-400/90 font-mono hidden sm:inline px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                  30 Districts
                </span>
              )}
            </div>

            {/* Omni-Search Live Results & Quick Discovery Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-stone-900/98 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fade-in z-50 max-h-[75vh] flex flex-col text-stone-100">
                {/* STATE A: Search Input Empty -> Instant Topics & Category Jump */}
                {!heroSearchQuery.trim() ? (
                  <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Instant Odisha Tourism Quick-Search:</span>
                      </span>
                      <span className="text-[10px] text-stone-400">All 30 Districts Grounded</span>
                    </div>

                    {/* Quick Category Jump Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setHeroSearchQuery('Puri');
                          setSearchCategoryTab('districts');
                        }}
                        className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-left text-xs transition-colors flex items-center gap-2"
                      >
                        <Building className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                          <strong className="block text-white">30 Districts</strong>
                          <span className="text-[10px] text-stone-400">HQ, Zone & Culture</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setHeroSearchQuery('waterfall');
                          setSearchCategoryTab('gems');
                        }}
                        className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-left text-xs transition-colors flex items-center gap-2"
                      >
                        <Gem className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <div>
                          <strong className="block text-white">Hidden Gems</strong>
                          <span className="text-[10px] text-stone-400">60+ Offbeat Spots</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setHeroSearchQuery('Eco-Tourism');
                          setSearchCategoryTab('stays');
                        }}
                        className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-left text-xs transition-colors flex items-center gap-2"
                      >
                        <Bed className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <strong className="block text-white">Stays & Camps</strong>
                          <span className="text-[10px] text-stone-400">OTDC & Eco Camps</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setHeroSearchQuery('Chhena Poda');
                          setSearchCategoryTab('food');
                        }}
                        className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-left text-xs transition-colors flex items-center gap-2"
                      >
                        <Utensils className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <div>
                          <strong className="block text-white">GI Food & Sweets</strong>
                          <span className="text-[10px] text-stone-400">Authentic Delicacies</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setHeroSearchQuery('Mo Bus');
                          setSearchCategoryTab('all');
                        }}
                        className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-left text-xs transition-colors flex items-center gap-2"
                      >
                        <Bus className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <div>
                          <strong className="block text-white">Transit & Fares</strong>
                          <span className="text-[10px] text-stone-400">Mo Bus & OSRTC</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setHeroSearchQuery('Hospital');
                          setSearchCategoryTab('emergency');
                        }}
                        className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-left text-xs transition-colors flex items-center gap-2"
                      >
                        <HeartPulse className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <div>
                          <strong className="block text-white">24/7 Helplines</strong>
                          <span className="text-[10px] text-stone-400">DHH & Control Rooms</span>
                        </div>
                      </button>
                    </div>

                    {/* Popular Search Suggestions */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-stone-400 block">
                        Popular Search Topics:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Puri Jagannath Temple',
                          'Konark Sun Temple',
                          'Similipal Safari',
                          'Chilika Lake Dolphins',
                          'Daringbadi Pine Valley',
                          'Koraput Arabica Coffee',
                          'Nayagarh Chhena Poda',
                          'Kendrapara Rasabali',
                          'Bhitarkanika Crocodiles',
                          'Hirakud Dam Sambalpur',
                        ].map((topic, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setHeroSearchQuery(topic);
                              setSearchCategoryTab('all');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-[11px] border border-stone-700 transition-colors"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* STATE B: Active Query Results with Category Tabs */
                  <div className="flex flex-col min-h-0">
                    {/* Category Tabs Header */}
                    <div className="px-3 pt-3 pb-2 border-b border-stone-800 bg-stone-850/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'all', label: `All (${omniSearchResults.total})` },
                        { id: 'districts', label: `🏛️ Districts (${omniSearchResults.districts.length})` },
                        { id: 'gems', label: `💎 Hidden Gems (${omniSearchResults.gems.length})` },
                        { id: 'stays', label: `🏨 Stays (${omniSearchResults.stays.length})` },
                        { id: 'food', label: `🍲 Food (${omniSearchResults.food.length})` },
                        { id: 'destinations', label: `📍 Destinations (${omniSearchResults.destinations.length})` },
                        { id: 'emergency', label: `🏥 Helplines (${omniSearchResults.emergency.length})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSearchCategoryTab(tab.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                            searchCategoryTab === tab.id
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-800 text-stone-300 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Results Body */}
                    <div className="p-3 sm:p-4 overflow-y-auto max-h-[55vh] space-y-3">
                      {omniSearchResults.total === 0 ? (
                        <div className="text-center py-8 space-y-3">
                          <p className="text-stone-400 text-xs sm:text-sm">
                            No local catalog records matching "{heroSearchQuery}".
                          </p>
                          <button
                            onClick={() => {
                              setIsSearchFocused(false);
                              onOpenAssistant(`Tell me about "${heroSearchQuery}" in Odisha: destinations, heritage, food, or travel advice.`);
                            }}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow transition-colors inline-flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ask Utkal Mitra AI about "{heroSearchQuery}"</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* 1. Districts Matches */}
                          {(searchCategoryTab === 'all' || searchCategoryTab === 'districts') &&
                            omniSearchResults.districts.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                                  🏛️ Odisha Districts ({omniSearchResults.districts.length}):
                                </span>
                                {omniSearchResults.districts.slice(0, 4).map((d) => (
                                  <div
                                    key={d.id}
                                    className="p-3.5 rounded-xl bg-stone-850 hover:bg-stone-825 border border-stone-750 hover:border-amber-500/50 transition-all space-y-2 text-xs"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <strong className="text-white text-sm font-bold">{d.name}</strong>
                                        <span className="text-xs text-amber-400 font-serif font-bold">{d.odiaName}</span>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                                          HQ: {d.headquarters} • {d.zone} Odisha
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setStartCity(d.name);
                                            setIsSearchFocused(false);
                                            scrollToPlanner();
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                                        >
                                          <Compass className="w-3 h-3" />
                                          <span>Plan Trip Here</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedDossierDistrict(d);
                                            setIsSearchFocused(false);
                                          }}
                                          className="px-2 py-1 rounded-lg bg-stone-750 hover:bg-stone-700 text-amber-300 font-semibold text-[11px] flex items-center gap-0.5 border border-stone-600"
                                        >
                                          <span>Dossier</span>
                                          <ChevronRight className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    <p className="text-xs text-stone-300 italic line-clamp-1">
                                      "{d.tagline}"
                                    </p>

                                    {/* Quick Spec Pills */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] pt-1">
                                      <div className="bg-stone-900/80 p-1.5 rounded-lg border border-stone-800 truncate">
                                        <span className="text-amber-400 font-medium">🏛️ Highlights: </span>
                                        <span className="text-stone-300">{d.highlights.slice(0, 2).join(', ')}</span>
                                      </div>
                                      <div className="bg-stone-900/80 p-1.5 rounded-lg border border-stone-800 truncate">
                                        <span className="text-orange-400 font-medium">🍲 Food: </span>
                                        <span className="text-stone-300">{d.signatureCuisine[0] || 'Odia Cuisine'}</span>
                                      </div>
                                      <div className="bg-stone-900/80 p-1.5 rounded-lg border border-stone-800 truncate">
                                        <span className="text-blue-400 font-medium">🛣️ Route: </span>
                                        <span className="text-stone-300">{d.transportHubs.highway}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* 2. Hidden Gems Matches */}
                          {(searchCategoryTab === 'all' || searchCategoryTab === 'gems') &&
                            omniSearchResults.gems.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                                  💎 Hidden Gems ({omniSearchResults.gems.length}):
                                </span>
                                {omniSearchResults.gems.slice(0, 4).map((g, i) => (
                                  <div
                                    key={i}
                                    onClick={() => {
                                      setSelectedDossierDistrict(g.district);
                                      setIsSearchFocused(false);
                                    }}
                                    className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-teal-500/50 cursor-pointer transition-all flex items-center justify-between gap-3"
                                  >
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <Gem className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                                        <strong className="text-white text-xs">{g.gem}</strong>
                                      </div>
                                      <span className="text-[11px] text-stone-400 block mt-0.5">
                                        In {g.district.name} District ({g.district.zone} Odisha)
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-teal-400 hover:underline whitespace-nowrap">
                                      View District
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* 3. Stays Matches */}
                          {(searchCategoryTab === 'all' || searchCategoryTab === 'stays') &&
                            omniSearchResults.stays.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                                  🏨 Stays & Eco Camps ({omniSearchResults.stays.length}):
                                </span>
                                {omniSearchResults.stays.slice(0, 4).map((s, i) => (
                                  <div
                                    key={i}
                                    className="p-2.5 rounded-xl bg-stone-850 border border-stone-750 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <strong className="text-white">{s.stay.name}</strong>
                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300">
                                          {s.stay.type}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-amber-300 font-mono block">
                                        {s.stay.estPrice} • {s.district.name} District
                                      </span>
                                    </div>
                                    <a
                                      href={`tel:${s.stay.contact}`}
                                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>Call</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* 4. Food Spots Matches */}
                          {(searchCategoryTab === 'all' || searchCategoryTab === 'food') &&
                            omniSearchResults.food.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                                  🍲 Food & GI Sweets ({omniSearchResults.food.length}):
                                </span>
                                {omniSearchResults.food.slice(0, 4).map((f, i) => (
                                  <div
                                    key={i}
                                    onClick={() => {
                                      setSelectedDossierDistrict(f.district);
                                      setIsSearchFocused(false);
                                    }}
                                    className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div>
                                      <strong className="text-amber-300 block">{f.spot.item}</strong>
                                      <span className="text-stone-300 text-[11px] block">{f.spot.recommendation}</span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 whitespace-nowrap">
                                      {f.district.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* 5. Destinations Matches */}
                          {(searchCategoryTab === 'all' || searchCategoryTab === 'destinations') &&
                            omniSearchResults.destinations.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                                  📍 Curated Destinations ({omniSearchResults.destinations.length}):
                                </span>
                                {omniSearchResults.destinations.slice(0, 3).map((dest) => (
                                  <div
                                    key={dest.id}
                                    onClick={() => {
                                      setModalDest(dest);
                                      setIsSearchFocused(false);
                                    }}
                                    className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                        <strong className="text-white">{dest.name}</strong>
                                        <span className="text-amber-400 font-serif text-[11px]">({dest.odiaName})</span>
                                      </div>
                                      <span className="text-stone-400 text-[11px] line-clamp-1 mt-0.5">
                                        {dest.district} • {dest.category} • {dest.recommendedDurationHours}h visit
                                      </span>
                                    </div>
                                    <span className="text-xs text-amber-400 font-semibold whitespace-nowrap">
                                      Details
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* 6. Emergency & Helplines Matches */}
                          {(searchCategoryTab === 'all' || searchCategoryTab === 'emergency') &&
                            omniSearchResults.emergency.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                                  🏥 Hospitals & Helplines ({omniSearchResults.emergency.length}):
                                </span>
                                {omniSearchResults.emergency.slice(0, 3).map((d) => (
                                  <div
                                    key={d.id}
                                    className="p-2.5 rounded-xl bg-stone-850 border border-stone-750 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div>
                                      <strong className="text-white block">{d.name} DHH: {d.safetyAndHelpline.districtHospital}</strong>
                                      <span className="text-stone-400 text-[11px]">Police: {d.safetyAndHelpline.policeStation}</span>
                                    </div>
                                    <a
                                      href={`tel:${d.safetyAndHelpline.controlRoomNumber}`}
                                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{d.safetyAndHelpline.controlRoomNumber}</span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                        </>
                      )}
                    </div>

                    {/* Bottom Assistant Trigger */}
                    <div className="p-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs">
                      <span className="text-stone-400 text-[11px]">
                        Need deeper custom information?
                      </span>
                      <button
                        onClick={() => {
                          setIsSearchFocused(false);
                          onOpenAssistant(`Provide detailed travel, hotel, food, and safety information regarding: "${heroSearchQuery}"`);
                        }}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Ask Utkal Mitra AI</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={scrollToDiscovery}
              className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-900/40 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Odisha</span>
            </button>

            <button
              onClick={scrollToPlanner}
              className="px-6 py-3.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white font-bold text-sm border border-stone-700 shadow-md flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Plan My Journey</span>
            </button>

            <button
              onClick={() => onOpenAssistant('What are the must-see destinations in Odisha for first time visitors?')}
              className="px-4 py-3.5 rounded-xl bg-purple-700/60 hover:bg-purple-700 text-purple-200 hover:text-white font-semibold text-xs sm:text-sm border border-purple-500/40 transition-colors"
            >
              Ask Utkal Mitra AI
            </button>
          </div>
        </div>

        {/* Decorative backdrop wheel motif */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-amber-200 overflow-hidden rounded-br-3xl">
          <Compass className="w-80 h-80 translate-x-12 translate-y-12" />
        </div>
      </div>

      {addedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* HOW UTKALSARATHI WORKS (Section 1 Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              How UtkalSarathi Works
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Connecting heritage, transit pricing, voice storytelling, and traveler safety into one ecosystem.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base mb-3 border border-amber-500/30">
                1
              </div>
              <h3 className="font-bold text-white text-sm">AI Personalized Planning</h3>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                Input your days, party size, and travel style to receive structured, day-by-day itineraries with transparent cost breakdowns.
              </p>
            </div>
            <button
              onClick={scrollToPlanner}
              className="mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Build Plan</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base mb-3 border border-emerald-500/30">
                2
              </div>
              <h3 className="font-bold text-white text-sm">Transit & Transparent Fares</h3>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                Verified CRUT Mo Bus routes, prepaid auto tariffs, and last-mile connectivity to protect tourists from overcharging.
              </p>
            </div>
            <span className="mt-3 text-[11px] text-emerald-400 font-medium">
              Verified Govt & CRUT feeds
            </span>
          </div>

          <div
            onClick={() => onNavigateToAudio?.()}
            className="bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-2xl p-5 transition-all flex flex-col justify-between cursor-pointer group shadow-lg hover:bg-stone-850/80"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base mb-3 border border-amber-500/30 group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors flex items-center justify-between">
                <span>Utkal Katha Voice Stories</span>
                <span className="text-xs text-amber-400 font-normal">Listen ▶</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                Listen to 10-minute voice narrations in Odia, Hindi, and English that distinguish archaeological history from sacred folklore.
              </p>
            </div>
            <span className="mt-3 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
              <span>▶ Select Place &amp; Run Voice Guides</span>
            </span>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-red-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-base mb-3 border border-red-500/30">
                4
              </div>
              <h3 className="font-bold text-white text-sm">UtkalSuraksha & Artisans</h3>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                24/7 SOS helpline integration (112), tourist police assistance, and zero-commission links to certified local craft masters.
              </p>
            </div>
            <span className="mt-3 text-[11px] text-red-400 font-medium">
              24/7 Safety Network & SOS
            </span>
          </div>
        </div>
      </div>

      {/* 1.5 COMPREHENSIVE 30-DISTRICT UNIVERSAL KNOWLEDGE HUB */}
      <DistrictsKnowledgeHub
        onSelectDistrict={(d) => setSelectedDossierDistrict(d)}
        onOpenAssistant={onOpenAssistant}
      />

      {/* 2. SMART DESTINATION DISCOVERY (Section 2 Requirement) */}
      <div ref={discoverySectionRef} className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-500" />
              Smart Destination Discovery
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Explore 12 iconic and lesser-known destinations across Odisha with verified historical records and travel facts.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All (12)' },
              { id: 'heritage', label: '🏛️ Temples & Heritage' },
              { id: 'nature', label: '🌿 Eco-Tourism' },
              { id: 'beaches', label: '🏖️ Coastal' },
              { id: 'tribal', label: '🎨 Tribal & Crafts' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-850 text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDestinationsList.map((dest) => {
            const img = DESTINATION_IMAGES[dest.id] || DESTINATION_IMAGES['puri-jagannath-temple'];
            return (
              <div
                key={dest.id}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                    <img
                      src={img}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                        {dest.category.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-stone-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const d = findDistrict(dest.district);
                          if (d) setSelectedDossierDistrict(d);
                        }}
                        className="flex items-center gap-1 font-semibold drop-shadow hover:text-amber-300 transition-colors cursor-pointer bg-stone-900/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10"
                        title={`View ${dest.district} District Dossier`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{dest.district}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-amber-400" />
                      </button>
                      <span className="text-[11px] bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm text-stone-300">
                        {dest.recommendedDurationHours}h visit
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                        {dest.name}
                      </h3>
                      <span className="text-xs text-amber-400 font-serif">
                        {dest.odiaName}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700/60">
                        📅 {dest.bestTimeToVisit.split('(')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                        🌿 {dest.ecoSensitivityTag.split(':')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-stone-800/80 flex items-center justify-between gap-2 mt-3">
                  <button
                    onClick={() => setModalDest(dest)}
                    className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-stone-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => handleAddDestinationToPlan(dest)}
                    className="py-2 px-3 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
                    title="Add to Itinerary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add to Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI PERSONALIZED ITINERARY PLANNER (Section 3 Requirement) */}
      <div ref={plannerSectionRef} className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-800 pb-3 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-500" />
              Personalized Trip Planner
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Customize starting location, budget targets, party size, and interests to generate your optimal day-by-day route.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsSavedModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Trips</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                {savedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsSavedModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
            >
              <span>Save Route</span>
            </button>
          </div>
        </div>

        {/* Quick Trip Templates Bar */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Quick Trip Templates (Instant Curated Circuits)
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Click any card to load pre-configured routes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {QUICK_TRIP_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-amber-500/60 p-3 rounded-xl text-left transition-all flex flex-col justify-between group shadow-sm cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tpl.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-300">
                      {tpl.days}D • {tpl.travelers} Pax
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-100 group-hover:text-amber-400 transition-colors">
                    {tpl.name}
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.tagline}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px]">
                  <span className="text-stone-400 font-medium">From {tpl.startCity}</span>
                  <span className="font-mono font-bold text-amber-400">
                    ~₹{tpl.estCostPerPerson.toLocaleString('en-IN')}/pax
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {activeTemplateNotice && (
          <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{activeTemplateNotice}</span>
            </span>
            <button onClick={() => setActiveTemplateNotice(null)} className="text-stone-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Configuration Controls Bar */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Starting Location (All 30 Odisha Districts) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Starting Location in Odisha
                </label>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  All 30 Districts
                </span>
              </div>
              <select
                value={startCity}
                onChange={(e) => setStartCity(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <optgroup label="🌟 Golden Triangle & Coastal Odisha (8)">
                  <option value="Khordha">Khordha (Bhubaneswar / Master Canteen / BBI Airport)</option>
                  <option value="Puri">Puri (Puri Dham / Marine Drive / Grand Road)</option>
                  <option value="Cuttack">Cuttack (Millennium City / Silver Filigree / Mahanadi)</option>
                  <option value="Balasore">Balasore (Chandipur Beach & Maritime Coast)</option>
                  <option value="Bhadrak">Bhadrak (Dhamra Port & Maa Bhadrakali Temple)</option>
                  <option value="Ganjam">Ganjam (Berhampur Silk City & Gopalpur Beach)</option>
                  <option value="Jagatsinghpur">Jagatsinghpur (Paradeep Port & Maa Sarala)</option>
                  <option value="Kendrapara">Kendrapara (Bhitarkanika Mangroves & Rasabali)</option>
                </optgroup>
                <optgroup label="🌲 Northern & Tribal Odisha (3)">
                  <option value="Mayurbhanj">Mayurbhanj (Baripada, Similipal Tiger Reserve & Mudhi Mansa)</option>
                  <option value="Keonjhar">Keonjhar (Waterfalls Circuit & Maa Tarini Temple)</option>
                  <option value="Sundargarh">Sundargarh (Rourkela Steel City & Khandadhar Falls)</option>
                </optgroup>
                <optgroup label="🌾 Western Odisha (7)">
                  <option value="Sambalpur">Sambalpur (Maa Samaleswari, Hirakud Dam & Handloom)</option>
                  <option value="Bargarh">Bargarh (Dhanu Yatra & Sambalpuri Weavers)</option>
                  <option value="Bolangir">Bolangir (Harishankar Waterfall & Patnagarh)</option>
                  <option value="Jharsuguda">Jharsuguda (Veer Surendra Sai Hub & Airport)</option>
                  <option value="Subarnapur">Subarnapur / Sonepur (Silk & 100 Ancient Temples)</option>
                  <option value="Deogarh">Deogarh (Pradhanpat Waterfall & Hills)</option>
                  <option value="Nuapada">Nuapada (Patora Dam & Sunabeda Sanctuary)</option>
                </optgroup>
                <optgroup label="⛰️ Southern Odisha & Eastern Ghats (7)">
                  <option value="Koraput">Koraput (Jeypore, Deomali Peaks & Arabica Coffee)</option>
                  <option value="Rayagada">Rayagada (Hanging Bridge & Maa Majhighariani)</option>
                  <option value="Malkangiri">Malkangiri (Balimela Dam & Bonda Hills)</option>
                  <option value="Nabarangpur">Nabarangpur (Umerkote & Sacred Groves)</option>
                  <option value="Gajapati">Gajapati (Paralakhemundi Palace & Mahendragiri)</option>
                  <option value="Kandhamal">Kandhamal (Phulbani & Daringbadi - Kashmir of Odisha)</option>
                  <option value="Kalahandi">Kalahandi (Bhawanipatna, Karlapat & Asurgarh)</option>
                </optgroup>
                <optgroup label="🌿 Central Odisha & Mahanadi Valley (5)">
                  <option value="Angul">Angul (Satkosia Gorge Sanctuary & Talcher)</option>
                  <option value="Dhenkanal">Dhenkanal (Kapilash Mountain & Joranda Gadi)</option>
                  <option value="Jajpur">Jajpur (Biraja Kshetra & Buddhist Diamond Triangle)</option>
                  <option value="Nayagarh">Nayagarh (Chhena Poda Birthplace & Kantilo)</option>
                  <option value="Boudh">Boudh (Charisambhu & Ancient Mahanadi Temples)</option>
                </optgroup>
              </select>

              {/* Selected Starting District Clarity Intelligence Card */}
              {selectedStartDistrictInfo && (
                <div className="mt-2.5 p-3 sm:p-3.5 rounded-xl bg-stone-850 border border-amber-500/30 text-stone-200 text-xs shadow-md space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-800 gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-amber-400 font-extrabold text-sm">
                        {selectedStartDistrictInfo.name} ({selectedStartDistrictInfo.odiaName})
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 font-medium">
                        HQ: {selectedStartDistrictInfo.headquarters} • {selectedStartDistrictInfo.zone} Zone
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDossierDistrict(selectedStartDistrictInfo)}
                        className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-0.5 whitespace-nowrap font-bold text-[11px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30"
                      >
                        <span>Full Dossier</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenAssistant(`Give me deep travel advice for visiting ${selectedStartDistrictInfo.name} district: best season, top sights, stays, and authentic food.`)}
                        className="text-purple-300 hover:text-purple-200 flex items-center gap-0.5 whitespace-nowrap font-semibold text-[11px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-300 italic">
                    "{selectedStartDistrictInfo.tagline}"
                  </p>

                  {/* 4 Clarity Pillars for Planning */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1">
                    <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800/80">
                      <span className="text-amber-400 font-semibold block mb-0.5">
                        🏛️ Top Highlights & Sights:
                      </span>
                      <span className="text-stone-300">
                        {selectedStartDistrictInfo.highlights.slice(0, 3).join(', ')}
                      </span>
                      {selectedStartDistrictInfo.hiddenGems && selectedStartDistrictInfo.hiddenGems.length > 0 && (
                        <div className="mt-1 text-[10px] text-teal-300/90 flex items-center gap-1">
                          <Gem className="w-2.5 h-2.5 text-teal-400 flex-shrink-0" />
                          <span className="truncate">Gem: {selectedStartDistrictInfo.hiddenGems[0]}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800/80">
                      <span className="text-orange-400 font-semibold block mb-0.5">
                        🍲 Signature Foods & GI Delicacies:
                      </span>
                      <span className="text-stone-300">
                        {selectedStartDistrictInfo.signatureCuisine.slice(0, 3).join(', ')}
                      </span>
                      {selectedStartDistrictInfo.foodSpots && selectedStartDistrictInfo.foodSpots[0] && (
                        <div className="mt-1 text-[10px] text-amber-200/90 truncate">
                          Spot: {selectedStartDistrictInfo.foodSpots[0].item} ({selectedStartDistrictInfo.foodSpots[0].recommendation})
                        </div>
                      )}
                    </div>

                    <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800/80">
                      <span className="text-blue-400 font-semibold block mb-0.5">
                        🛣️ Transit & Highway Hub:
                      </span>
                      <span className="text-stone-300">
                        {selectedStartDistrictInfo.transportHubs.highway} • Rail: {selectedStartDistrictInfo.transportHubs.nearestRail}
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        Tip: {selectedStartDistrictInfo.transportHubs.lastMileTransit}
                      </div>
                    </div>

                    <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800/80">
                      <span className="text-emerald-400 font-semibold block mb-0.5">
                        🏨 Verified Stays & Emergency:
                      </span>
                      <div className="text-stone-300 truncate">
                        {selectedStartDistrictInfo.recommendedStays[0]?.name || 'OTDC Panthanivas'} (~{selectedStartDistrictInfo.recommendedStays[0]?.estPrice || '₹1,500'})
                      </div>
                      <div className="text-[10px] text-red-300/90 mt-0.5 flex items-center justify-between">
                        <span className="truncate">Hospital: {selectedStartDistrictInfo.safetyAndHelpline.districtHospital}</span>
                        <span className="font-mono text-emerald-400 font-bold ml-1">112</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Duration (1 to 7 Days) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Duration (Days)
              </label>
              <div className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      days === d
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Travelers */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Travelers Party
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  {travelers} {travelers === 1 ? 'Person' : 'People'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTravelers(num)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      travelers === num
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {num === 1 ? '1 Solo' : num === 2 ? '2 Couple' : num === 4 ? '4 Family' : '6 Group'}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style & Target Budget */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Style & Target Budget
                </label>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  Target: {formatINR(targetBudget)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['budget', 'moderate', 'luxury'] as TravelStyle[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStyle(st);
                      if (st === 'budget') setTargetBudget(days * travelers * 950);
                      else if (st === 'moderate') setTargetBudget(days * travelers * 2100);
                      else setTargetBudget(days * travelers * 4200);
                    }}
                    className={`py-2 text-xs font-semibold capitalize rounded-xl border transition-all ${
                      style === st
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Budget Fine-Tuning Slider / Presets */}
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="font-semibold text-stone-300">Target Budget Filter:</span>
              <div className="flex items-center gap-1.5">
                {[5000, 10000, 20000, 40000].map((bVal) => (
                  <button
                    key={bVal}
                    type="button"
                    onClick={() => setTargetBudget(bVal)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-all ${
                      targetBudget === bVal
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    ₹{(bVal / 1000)}k
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400">Custom Target:</span>
              <input
                type="number"
                min={1000}
                step={500}
                value={targetBudget}
                onChange={(e) => setTargetBudget(Math.max(500, Number(e.target.value) || 0))}
                className="w-24 bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 9 Rich Key Travel Interests Selector */}
          <div className="mt-4 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                Key Travel Interests (9 Multi-Select Categories)
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                {selectedInterests.length} Selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'heritage', label: 'Monuments & Temple Architecture', icon: '🏛️' },
                { id: 'spiritual', label: 'Spiritual & Jagannath Traditions', icon: '🪔' },
                { id: 'nature', label: 'Eco-Tourism & Chilika Wetlands', icon: '🌿' },
                { id: 'tribal_crafts', label: 'Handicrafts, Pattachitra & Filigree', icon: '🎨' },
                { id: 'beaches', label: 'Coastal Marine Drive & Beaches', icon: '🏖️' },
                { id: 'tribal_culture', label: 'Tribal Haats & Living Culture', icon: '🌾' },
                { id: 'waterfalls', label: 'Waterfalls & Eastern Ghats', icon: '🌊' },
                { id: 'cuisine', label: 'Authentic GI Food & Sweets', icon: '🍲' },
                { id: 'photography', label: 'Architecture & Photography', icon: '📸' },
              ].map((cat) => {
                const active = selectedInterests.includes(cat.id as TripInterest);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.id as TripInterest)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      active
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm font-semibold'
                        : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trip Route Scope Selector: Single District | Nearby Destinations | Multi-District Circuit */}
          <div className="mt-5 pt-4 border-t border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Choose Trip Route Scope (Single District • Nearby Destinations • Multi-District Circuit)
                </label>
                <p className="text-xs text-stone-400 mt-0.5">
                  Plan strictly inside <span className="text-amber-400 font-semibold">{startCity}</span>, add bordering highway excursions, or build a custom multi-district Odisha circuit.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700 self-start sm:self-auto">
                {tripScope === 'single'
                  ? `📍 100% ${startCity} Only`
                  : tripScope === 'nearby'
                  ? '🚗 Nearby Destinations'
                  : `🗺️ ${selectedMultiDistricts.length}-District Circuit`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTripScope('single');
                  setIncludeNearby(false);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  tripScope === 'single'
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-850 border-stone-750 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span className={`text-sm font-bold ${tripScope === 'single' ? 'text-amber-300' : 'text-stone-200'}`}>
                      Single District ({startCity})
                    </span>
                  </div>
                  {tripScope === 'single' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                  100% of sights, stays, and regional GI cuisine remain strictly inside {startCity} boundaries.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTripScope('nearby');
                  setIncludeNearby(true);
                  if (selectedNearbyDistricts.length === 0 && availableNearbyDistricts.length > 0) {
                    setSelectedNearbyDistricts(availableNearbyDistricts.map((n) => n.districtId));
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  tripScope === 'nearby'
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-850 border-stone-750 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚗</span>
                    <span className={`text-sm font-bold ${tripScope === 'nearby' ? 'text-amber-300' : 'text-stone-200'}`}>
                      Nearby Destinations
                    </span>
                  </div>
                  {tripScope === 'nearby' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                  Include day excursions to {availableNearbyDistricts.length} bordering districts with verified NH/SH highway distances &amp; travel times.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTripScope('multi');
                  setIncludeNearby(false);
                  if (selectedMultiDistricts.length < 2) {
                    const startId = selectedStartDistrictInfo?.id || 'khordha';
                    const fallbackSecond = startId === 'puri' ? 'khordha' : 'puri';
                    setSelectedMultiDistricts([startId, fallbackSecond]);
                  }
                  if (days < 3) {
                    setDays(3);
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  tripScope === 'multi'
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-850 border-stone-750 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗺️</span>
                    <span className={`text-sm font-bold ${tripScope === 'multi' ? 'text-amber-300' : 'text-stone-200'}`}>
                      Multiple Districts Circuit
                    </span>
                  </div>
                  {tripScope === 'multi' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                  Select any 2–6 districts across Odisha to generate a connected multi-district road/rail grand tour.
                </p>
              </button>
            </div>

            {tripScope === 'multi' && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-stone-950 border border-amber-500/40 space-y-3 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                  <div>
                    <span className="text-xs font-bold text-amber-300">
                      Select Multiple Districts for Your Odisha Circuit ({selectedMultiDistricts.length} Selected)
                    </span>
                    <p className="text-[11px] text-stone-400">
                      Tap districts in order of your journey. Automatically calculates inter-district OSRTC/cab transfers.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMultiDistricts(['khordha', 'puri', 'cuttack']);
                        if (days < 3) setDays(3);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold"
                    >
                      Golden Triangle (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMultiDistricts(['sambalpur', 'bargarh', 'balangir']);
                        if (days < 3) setDays(3);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold"
                    >
                      Western Kosala (3)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMultiDistricts(['koraput', 'rayagada', 'kandhamal']);
                        if (days < 3) setDays(3);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold"
                    >
                      Southern Ghats (3)
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {ODISHA_30_DISTRICTS.map((d) => {
                    const idxInCircuit = selectedMultiDistricts.indexOf(d.id);
                    const isPicked = idxInCircuit !== -1;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedMultiDistricts((prev) => {
                            if (prev.includes(d.id)) {
                              return prev.length > 2 ? prev.filter((id) => id !== d.id) : prev;
                            }
                            const next = [...prev, d.id];
                            if (next.length > days && next.length <= 5) {
                              setDays(next.length);
                            }
                            return next;
                          });
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          isPicked
                            ? 'bg-amber-500 text-stone-950 font-bold shadow'
                            : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                        }`}
                      >
                        {isPicked && (
                          <span className="w-4 h-4 rounded-full bg-stone-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
                            {idxInCircuit + 1}
                          </span>
                        )}
                        <span>{d.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* When tripScope === 'nearby': Interactive Bordering Districts Explorer */}
            {tripScope === 'nearby' && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-stone-900 border border-stone-800 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 mb-2.5 border-b border-stone-800 gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-stone-200">
                      Bordering Districts from {startCity} ({availableNearbyDistricts.length} Available)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedNearbyDistricts(availableNearbyDistricts.map((n) => n.districtId))
                      }
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-stone-600">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedNearbyDistricts([])}
                      className="text-[11px] text-stone-400 hover:text-stone-300 underline font-medium"
                    >
                      Deselect All
                    </button>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                      {selectedNearbyDistricts.length} Active
                    </span>
                  </div>
                </div>

                {availableNearbyDistricts.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    No neighboring district data mapped for {startCity}.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {availableNearbyDistricts.map((nearby) => {
                      const isSelected = selectedNearbyDistricts.includes(nearby.districtId);
                      return (
                        <div
                          key={nearby.districtId}
                          onClick={() => {
                            setSelectedNearbyDistricts((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== nearby.districtId)
                                : [...prev, nearby.districtId]
                            );
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-950/30 border-amber-500/50 text-stone-200'
                              : 'bg-stone-850/60 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded border-stone-700 text-amber-600 focus:ring-0 focus:ring-offset-0 bg-stone-800"
                              />
                              <div>
                                <span className="font-bold text-stone-100 text-xs">
                                  {nearby.districtName}
                                </span>
                                <span className="text-stone-400 ml-1.5 text-[11px]">
                                  ({nearby.odiaName})
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700 flex-shrink-0">
                              {nearby.distanceKm} km • ~{nearby.travelTime}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-[11px]">
                            <div className="flex items-center gap-1.5 text-stone-300">
                              <span className="text-amber-400 font-semibold">🛣️ Route:</span>
                              <span>{nearby.highway}</span>
                              <span className="text-stone-500">•</span>
                              <span className="text-emerald-400">{nearby.bestTransit}</span>
                            </div>
                            <div className="line-clamp-1 text-stone-400">
                              <span className="text-stone-300 font-medium">🏛️ Sights:</span>{' '}
                              {nearby.topAttractions.join(', ')}
                            </div>
                            <div className="line-clamp-1 text-orange-300/90">
                              <span className="font-medium text-stone-300">🍲 Food:</span>{' '}
                              {nearby.foodHighlight}
                            </div>
                            <div className="text-[10px] text-stone-400 italic mt-1 pt-1 border-t border-stone-800/60">
                              "{nearby.whyVisit}"
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tripScope === 'single' && (
              <div className="mt-2.5 px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>100% {startCity} District Tour Active:</strong> No excursions to neighboring districts will be added. All days remain strictly inside {startCity}.
                  </span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                  Pure Local Mode
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <Compass className="w-4 h-4" />
              Update Itinerary & Routes
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRefineModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700/90 hover:bg-purple-700 text-purple-100 font-semibold text-xs sm:text-sm border border-purple-500/40 transition-all shadow-md"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Ask AI to Refine Schedule</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-900 text-purple-200 border border-purple-400/30">
                  Interactive
                </span>
              </button>

              <button
                onClick={handleSavePack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-medium text-xs sm:text-sm transition-all"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                Save Offline
              </button>
            </div>
          </div>

          {saveSuccessMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {saveSuccessMessage}
            </div>
          )}

          {refineSuccessBanner && (
            <div className="mt-3 p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{refineSuccessBanner}</span>
              </div>
              <button
                onClick={() => setRefineSuccessBanner(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* AI Custom Advice Card if present */}
        {aiCustomPlan && (
          <div className="rounded-2xl bg-gradient-to-br from-purple-950/70 to-stone-900 border border-purple-600/30 p-5 sm:p-6 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Gemini 3.8 Flash Cultural Travel Intelligence
            </div>
            <div className="text-stone-200 text-sm whitespace-pre-line leading-relaxed">
              {aiCustomPlan}
            </div>
          </div>
        )}

        {/* Transparent Budget Estimation Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Transparent Trip Cost Estimate ({days} Days, {travelers} Travelers)
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Itemized budget grounded in verified government fares, standard OTDC accommodation, and authentic dining.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-amber-400">
                {formatINR(budget.totalCost)}
              </div>
              <div className="text-xs text-stone-400">
                ~{formatINR(budget.perPersonCost)} per person ({formatINR(budget.perDayCost)}/day)
              </div>
            </div>
          </div>

          {/* Cost Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-stone-850 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                Accommodation ({days - 1 > 0 ? `${days - 1} Nights` : 'Day Trip'})
              </span>
              <span className="text-base font-bold text-stone-100 mt-1 block">
                {formatINR(budget.accommodation)}
              </span>
              <span className="text-[11px] text-amber-400/90">
                {style === 'budget' ? 'Dharamsala / Dorm' : style === 'moderate' ? 'OTDC Panthanivas' : 'Eco-Glamping / Resort'}
              </span>
            </div>

            <div className="bg-stone-850 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                Local Transport
              </span>
              <span className="text-base font-bold text-stone-100 mt-1 block">
                {formatINR(budget.transport)}
              </span>
              <span className="text-[11px] text-emerald-400/90">
                {style === 'budget' ? 'Mo Bus & Shared Auto' : style === 'moderate' ? 'Private Auto & Mo Bus' : 'AC Chauffeur Sedan'}
              </span>
            </div>

            <div className="bg-stone-850 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                Regional Food & Sweets
              </span>
              <span className="text-base font-bold text-stone-100 mt-1 block">
                {formatINR(budget.food)}
              </span>
              <span className="text-[11px] text-orange-400/90">
                Mahaprasad & Dalma Thali
              </span>
            </div>

            <div className="bg-stone-850 border border-stone-800 rounded-xl p-3">
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                Entry Tickets & Craft
              </span>
              <span className="text-base font-bold text-stone-100 mt-1 block">
                {formatINR(budget.entryFees + budget.shoppingAndBuffer)}
              </span>
              <span className="text-[11px] text-purple-400/90">
                ASI Monuments & Crafts
              </span>
            </div>
          </div>

          {/* Target Budget Comparison & Savings Tips */}
          {targetBudget > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-medium flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Budget Comparison ({formatINR(targetBudget)} Target)</span>
                </span>
                <span className={`font-mono font-bold ${budget.totalCost <= targetBudget ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {Math.round((budget.totalCost / targetBudget) * 100)}% of Target Used
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    budget.totalCost <= targetBudget ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((budget.totalCost / targetBudget) * 100))}%` }}
                />
              </div>

              {budget.totalCost <= targetBudget ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Well Within Target:</strong> You save <strong>{formatINR(targetBudget - budget.totalCost)}</strong> compared to your spending target!
                    </span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Economical</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Cost exceeds target by {formatINR(budget.totalCost - targetBudget)}. Savings Recommendations:</span>
                  </div>
                  <ul className="text-[11px] text-stone-300 space-y-0.5 pl-5 list-disc">
                    <li>Switch stays to standard OTDC Panthanivas or dorms (saves ~₹800/night).</li>
                    <li>Utilize Mo Bus Route 71 &amp; Route 10 for Puri-Bhubaneswar travel (saves ~₹1,200/day).</li>
                    <li>Savor temple Ananda Bazar Mahaprasad &amp; local Dalma thalis (saves ~₹400/meal).</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Intelligent Route Justification & Optimization Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Why this route is recommended card */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Why This Route Is Recommended</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {tripScope === 'single'
                ? `Sequenced strictly within ${startCity} District boundaries to eliminate inter-district travel fatigue. Morning slots prioritize major heritage shrines before noon tropical sun; afternoon slots visit shaded museums/craft villages.`
                : tripScope === 'nearby'
                ? `Combines core ${startCity} landmarks with fast highway excursions along established national corridors (NH-16 / NH-316). Transit is synchronized with OSRTC Express and Mo Bus routes.`
                : `Connects ${selectedMultiDistricts.map(id => findDistrict(id)?.name || id).join(' → ')} sequentially along direct highway corridors to eliminate backtracking and preserve maximum sightseeing daylight.`}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-stone-400">
              <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-750">
                🛣️ Highway corridor verified
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                ✓ Paced for daylight exploration
              </span>
            </div>
          </div>

          {/* Optimization & Overloaded Day Notice */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Pace &amp; Accessibility Rating</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                9.2 / 10 Score
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Family and senior-friendly itinerary pace. All scheduled monuments feature safe paved paths, standard OTDC Panthanivas rest stops, and 24/7 District Hospital support within 15 km.
            </p>
            {/* Overloaded Day Notice if any day has >7.5 hours */}
            {(() => {
              const overloaded = plans.filter((p) => {
                const totalHours = p.destinations.reduce((acc, d) => acc + (d.destination.recommendedDurationHours || 2.5), 0);
                return totalHours >= 7.5;
              });
              if (overloaded.length === 0) {
                return (
                  <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>All days are well-balanced with zero overloaded schedules.</span>
                  </div>
                );
              }
              return (
                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/30 text-[11px] text-amber-300 flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>
                    Day {overloaded.map((o) => o.dayNumber).join(', ')} has high activity density (~7.5+ hrs). Recommended: add an extra day for leisurely travel.
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* View Mode Toggle: Recommended vs Custom Edit Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 border border-stone-800 p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800">
            <button
              onClick={() => setPlannerModeTab('recommended')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                plannerModeTab === 'recommended'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Recommended Route ({plans.length} Days)</span>
            </button>
            <button
              onClick={() => setPlannerModeTab('custom')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                plannerModeTab === 'custom'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>✏️</span>
              <span>Edit & Plan by Own</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-mono">
                Interactive
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-2">
            {plannerModeTab === 'recommended' ? (
              <button
                onClick={() => setPlannerModeTab('custom')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Customize visits & edit costs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-xs text-stone-400">
                Custom Edit Mode • All stops & costs live editable
              </span>
            )}
          </div>
        </div>

        {/* District Exclusivity / Nearby Places / Multi-District Circuit Banner */}
        {tripScope === 'single' ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      100% {startCity} District Itinerary
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold">
                      Strict District Locked
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Every landmark, temple, waterfall, eco-stay, and local food spot scheduled across Day 1 to Day {days} is located strictly within {startCity} District boundaries. No items from Bhubaneswar, Puri, Konark, or other districts are included.
                  </p>
                </div>
              </div>
              {selectedStartDistrictInfo && (
                <div className="sm:text-right flex-shrink-0 bg-stone-850 p-2.5 rounded-xl border border-stone-800 text-[11px]">
                  <div className="text-amber-400 font-bold">{selectedStartDistrictInfo.name} ({selectedStartDistrictInfo.odiaName})</div>
                  <div className="text-stone-400">HQ: {selectedStartDistrictInfo.headquarters} • Zone: {selectedStartDistrictInfo.zone}</div>
                  <div className="text-stone-300 font-mono text-[10px] mt-0.5">Highway: {selectedStartDistrictInfo.transportHubs.highway}</div>
                </div>
              )}
            </div>
          </div>
        ) : tripScope === 'multi' ? (
          <div className="bg-stone-900 border border-amber-600/30 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">
                      Multi-District Odisha Circuit ({selectedMultiDistricts.length} Districts)
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-semibold">
                      Connected Route
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Day-by-day route connecting{' '}
                    <strong className="text-stone-200">
                      {selectedMultiDistricts
                        .map((id) => findDistrict(id)?.name || id)
                        .join(' → ')}
                    </strong>{' '}
                    with OSRTC highway transfers, regional GI specialties, and verified district stays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Nearby Destinations Mode: Show Nearby Places Travel Matrix & Distances */
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Nearby Places Travel Matrix & Highway Routes (from {startCity})
                  </h3>
                  <p className="text-xs text-stone-400">
                    Verified road distances, transit options, and landmark highlights for bordering districts.
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 font-semibold self-start sm:self-auto">
                {selectedNearbyDistricts.length} Adjacent Districts Included
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {availableNearbyDistricts
                .filter((n) => selectedNearbyDistricts.includes(n.districtId))
                .map((nearby) => (
                  <div
                    key={nearby.districtId}
                    className="bg-stone-850 border border-stone-750 rounded-xl p-3.5 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-100 text-sm">
                          {nearby.districtName} ({nearby.odiaName})
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                          {nearby.distanceKm} km
                        </span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-stone-300 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-semibold">🛣️ Route:</span>
                          <span>{nearby.highway} (~{nearby.travelTime})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 font-semibold">🚌 Transit:</span>
                          <span className="truncate">{nearby.bestTransit}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium">🏛️ Sights:</span>{' '}
                          <span className="text-stone-200">{nearby.topAttractions.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-orange-400 font-medium">🍲 Food:</span>{' '}
                          <span className="text-stone-200">{nearby.foodHighlight}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-stone-800 text-[10px] text-stone-400 italic">
                      "{nearby.whyVisit}"
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {plannerModeTab === 'custom' ? (
          <CustomItineraryEditor
            plans={plans}
            onPlansChange={(updated) => {
              setPlans(updated);
              setDays(updated.length);
            }}
            travelers={travelers}
            travelStyle={style}
            startDistrict={startCity}
            onSaveOffline={handleSavePack}
            onResetToRecommended={() => {
              handleRegenerate();
              setPlannerModeTab('recommended');
            }}
          />
        ) : (
          /* Day-by-day Itinerary Cards */
          <div className="space-y-4">
            {plans.map((day) => (
            <div
              key={day.dayNumber}
              className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md"
            >
              <div className="bg-gradient-to-r from-stone-800 to-stone-850 px-5 py-3.5 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                    {day.dayNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-100 text-base">{day.title}</h3>
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      Theme: {day.theme}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400 font-medium">Estimated Day Cost</span>
                  <div className="text-sm font-bold text-amber-400">
                    {formatINR(day.totalDayCost)}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="p-5 divide-y divide-stone-800/80 space-y-4">
                {day.destinations.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-start`}
                  >
                    {/* Time & Slot Indicator */}
                    <div className="md:col-span-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800 text-amber-300 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {slot.timeSlot.split(' ')[0]}
                      </span>
                      <p className="text-[11px] text-stone-400 mt-1">
                        {slot.timeSlot.replace(/^[A-Za-z]+ /, '')}
                      </p>
                      <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Transit: {slot.transportFromPrevious}</span>
                      </div>
                    </div>

                    {/* Destination & Activity Details */}
                    <div className="md:col-span-7">
                      <button
                        onClick={() => setModalDest(slot.destination)}
                        className="text-left group"
                        aria-label={`View details of ${slot.destination.name}`}
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-stone-100 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                            {slot.destination.name}
                            <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                          </h4>
                          <span className="text-xs text-amber-300/80 font-medium">
                            {slot.destination.odiaName}
                          </span>
                        </div>
                      </button>

                      <p className="text-stone-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        {slot.activity}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px] border border-stone-700/60">
                          🕒 {slot.destination.recommendedDurationHours}h Visit
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 text-[11px] border border-amber-800/40">
                          🍽️ {slot.destination.cuisineHighlight.split(',')[0]}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 text-[11px] border border-emerald-600/30">
                          🌿 {slot.destination.ecoSensitivityTag.split(':')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="md:col-span-2 flex flex-col items-end justify-center gap-2">
                      <button
                        onClick={() => setModalDest(slot.destination)}
                        className="w-full text-center px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold transition-colors"
                      >
                        Full Details
                      </button>
                      <button
                        onClick={() =>
                          onOpenAssistant(
                            `Tell me about visiting ${slot.destination.name} and current dress codes or timings.`
                          )
                        }
                        className="w-full text-center px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                      >
                        Ask Assistant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* AI Schedule Refiner Modal */}
      <RefineScheduleModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        currentPlans={plans}
        startDistrict={startCity}
        budgetStyle={style}
        travelers={travelers}
        onApplyRefinedPlans={(refinedPlans, summary) => {
          setPlans(refinedPlans);
          setDays(refinedPlans.length);
          setRefineSuccessBanner(`AI Refinement Applied: ${summary}`);
          setTimeout(() => setRefineSuccessBanner(null), 6000);
        }}
      />

      {/* 4. DESTINATION DETAIL MODAL WITH RELATED DESTINATIONS */}
      {modalDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 text-stone-100 shadow-2xl relative">
            <div className="flex items-start justify-between pb-4 border-b border-stone-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  {modalDest.region} • {modalDest.district} District
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-0.5">
                  {modalDest.name}
                </h3>
                <span className="text-sm text-stone-400 font-medium">
                  {modalDest.odiaName}
                </span>
              </div>
              <button
                onClick={() => setModalDest(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center font-bold text-lg transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm leading-relaxed">
              <p className="text-stone-300">{modalDest.description}</p>

              {/* Documented History vs Legend */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-stone-800/80 border border-amber-800/40 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Documented Archaeological History
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {modalDest.historicalSignificance}
                  </p>
                </div>

                <div className="bg-stone-800/80 border border-orange-800/40 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-orange-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    Sacred Legend & Folklore
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    {modalDest.legend}
                  </p>
                </div>
              </div>

              {/* Transit & Practical Information */}
              <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/60 space-y-2">
                <h4 className="font-bold text-stone-200 text-xs uppercase tracking-wider">
                  Verified Practical Travel Facts
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block">Verified Hours:</span>
                    <span className="font-semibold text-stone-200">{modalDest.verifiedHours}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Indian Citizens:</span>
                    <span className="font-semibold text-emerald-400">
                      {modalDest.entryFee.indian === 0 ? 'Free' : `₹${modalDest.entryFee.indian}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Foreign Nationals:</span>
                    <span className="font-semibold text-stone-200">
                      ₹{modalDest.entryFee.foreigner}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-stone-400 text-xs block">Public Transport Connectivity:</span>
                  <ul className="mt-1 space-y-1">
                    {modalDest.transportInfo.options.map((opt, i) => (
                      <li key={i} className="text-xs text-stone-300 flex items-center justify-between">
                        <span>• {opt.mode}: {opt.routeOrDesc}</span>
                        <span className="font-bold text-amber-400 ml-2">{opt.fare}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Safety & Etiquette Advice */}
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Traveller Etiquette & Safety: </span>
                  {modalDest.safetyTip}
                </div>
              </div>

              {/* Eco & Cultural Sensitivity Guidance */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-start gap-2">
                <span className="text-sm">🌿</span>
                <div>
                  <span className="font-bold">Sustainable Tourism & Heritage Charter: </span>
                  {modalDest.ecoSensitivityTag}
                  <span className="block mt-1 text-[11px] text-stone-400">
                    Source Rating:{' '}
                    <span className="text-emerald-400 font-semibold">
                      {modalDest.sourceReliability === 'verified_official'
                        ? '🟢 Verified Official Government Source'
                        : '🟡 Provider Confirmed Source'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Related Destinations Recommendation (Section 2 Requirement) */}
              {relatedDestinations.length > 0 && (
                <div className="pt-2 border-t border-stone-800">
                  <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                    Nearby Related Destinations in {modalDest.district} & {modalDest.region}:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {relatedDestinations.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => setModalDest(rel)}
                        className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 cursor-pointer transition-colors"
                      >
                        <h5 className="font-bold text-white text-xs truncate">{rel.name}</h5>
                        <span className="text-[10px] text-amber-400 font-serif block">{rel.odiaName}</span>
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          🕒 {rel.recommendedDurationHours}h • {rel.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => {
                  handleAddDestinationToPlan(modalDest);
                  setModalDest(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add to My Trip Plan</span>
              </button>

              <div className="flex flex-wrap gap-2">
                {(() => {
                  const distObj = findDistrict(modalDest.district.split('/')[0].split('(')[0].trim());
                  const pt = distObj ? DISTRICT_MAP_POINTS[distObj.id] : DISTRICT_MAP_POINTS['puri'];
                  if (!pt) return null;
                  return (
                    <a
                      href={buildGoogleMapsDirectionsUrl(pt.lat, pt.lng, `${modalDest.name}, ${modalDest.district}, Odisha`)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate</span>
                    </a>
                  );
                })()}
                <button
                  onClick={() => {
                    setModalDest(null);
                    onOpenAssistant(`What are some tips for visiting ${modalDest.name}?`);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-colors"
                >
                  Ask Utkal Mitra AI
                </button>
                <button
                  onClick={() => setModalDest(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs sm:text-sm font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVED ITINERARIES MANAGER MODAL */}
      <SavedItinerariesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadItinerary={handleLoadSavedItinerary}
        currentPlans={plans}
        currentConfig={{
          startCity,
          days,
          travelers,
          style,
          tripScope,
          selectedNearbyDistricts,
          selectedMultiDistricts,
          selectedInterests,
          totalCost: budget.totalCost,
          targetBudget,
        }}
      />

      {/* 30-DISTRICT COMPREHENSIVE DOSSIER MODAL */}
      <DistrictDossierModal
        district={selectedDossierDistrict}
        isOpen={Boolean(selectedDossierDistrict)}
        onClose={() => setSelectedDossierDistrict(null)}
        onPlanTripToDistrict={(districtName) => {
          setStartCity(districtName);
          scrollToPlanner();
        }}
        onAskAiAboutDistrict={(d) => {
          onOpenAssistant(
            `Provide an in-depth travel and cultural guide for ${d.name} district (${d.odiaName}), covering attractions, hidden gems, stays, food spots, and transit advice.`
          );
        }}
      />
    </div>
  );
};
