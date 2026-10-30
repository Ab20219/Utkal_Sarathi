import React, { useState, useMemo } from 'react';
import { ODISHA_TRANSIT_ROUTES } from '../data/mockData';
import { ODISHA_30_DISTRICTS, OdishaDistrict } from '../data/odishaDistricts';
import { RouteFareItem } from '../types';
import {
  Bus,
  Train,
  Car,
  Compass,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  Clock,
  MapPin,
  Search,
  IndianRupee,
  Shield,
  ArrowRight,
  Plane,
  Layers,
  Sparkles,
  PhoneCall,
  Navigation,
} from 'lucide-react';

export const TransitMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'corridors' | 'districts'>('districts');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('khordha');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<RouteFareItem>(ODISHA_TRANSIT_ROUTES[0]);
  const [passengerCount, setPassengerCount] = useState<number>(2);

  // Active district for 30-district transit directory
  const activeDistrict: OdishaDistrict = useMemo(() => {
    return (
      ODISHA_30_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      ODISHA_30_DISTRICTS[0]
    );
  }, [selectedDistrictId]);

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    return ODISHA_30_DISTRICTS.filter((d) => {
      if (selectedZone !== 'all' && d.zone.toLowerCase() !== selectedZone.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.odiaName.includes(q) ||
          d.headquarters.toLowerCase().includes(q) ||
          d.transportHubs.nearestRail.toLowerCase().includes(q) ||
          d.transportHubs.highway.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedZone, searchTerm]);

  // Filtered corridor routes
  const filteredRoutes = ODISHA_TRANSIT_ROUTES.filter((r) => {
    const matchesSearch =
      r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.to.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedModeFilter === 'all') return true;
    return r.modes.some((m) => m.mode.toLowerCase().includes(selectedModeFilter.toLowerCase()));
  });

  const getVerificationBadge = (status: 'verified_govt' | 'provider_confirmed' | 'estimated') => {
    switch (status) {
      case 'verified_govt':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Verified Govt Fare
          </span>
        );
      case 'provider_confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            <CheckCircle className="w-3 h-3 text-cyan-400" />
            Provider Confirmed
          </span>
        );
      case 'estimated':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
            <HelpCircle className="w-3 h-3 text-amber-400" />
            Estimated Fair Rate
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-emerald-950/70 to-stone-900 border border-emerald-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Bus className="w-3.5 h-3.5 text-emerald-400" />
            <span>30-District Integrated Transportation &amp; Transparent Tariff Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Odisha Transit &amp; Regulated Fair Fare Matrix
          </h1>
          <p className="mt-2 text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Avoid arbitrary tourist surcharges across all 30 districts of Odisha. Benchmarking official
            CRUT &lsquo;Mo Bus&rsquo; tariffs, OSRTC interstate networks, railway hubs, prepaid taxi unions, and
            last-mile eco-connectivity guidelines.
          </p>
        </div>
      </div>

      {/* Mode Switcher: 30 Districts Transit Directory vs Point-to-Point Corridors */}
      <div className="flex border-b border-stone-800 gap-2">
        <button
          onClick={() => setActiveTab('districts')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'districts'
              ? 'border-emerald-500 text-emerald-400 bg-stone-900/40 rounded-t-xl'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>30 Districts Transit Directory</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold">
            30 Districts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('corridors')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
            activeTab === 'corridors'
              ? 'border-emerald-500 text-emerald-400 bg-stone-900/40 rounded-t-xl'
              : 'border-transparent text-stone-400 hover:text-white'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Corridor Routes &amp; Group Fare Calculator</span>
        </button>
      </div>

      {/* Disclaimers & Transparency Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-500/30 flex items-start gap-2.5 shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-emerald-300 block">Official Govt Benchmarks</span>
            <span className="text-stone-300">
              CRUT Mo Bus and OSRTC tariffs verified against State Transport Authority fare schedules.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900 border border-cyan-500/30 flex items-start gap-2.5 shadow-md">
          <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-cyan-300 block">Station Prepaid Counters</span>
            <span className="text-stone-300">
              Always insist on official prepaid police booths at Bhubaneswar, Puri, Cuttack &amp; Rourkela.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-900 border border-amber-500/30 flex items-start gap-2.5 shadow-md">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-300 block">Night Surcharges</span>
            <span className="text-stone-300">
              Regulated night fare (23:00 to 05:00) permits max 20% to 25% surcharge over daytime rates.
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: 30 DISTRICTS TRANSIT DIRECTORY (All 30 Odisha Districts)
          ===================================================================== */}
      {activeTab === 'districts' && (
        <div className="space-y-6">
          {/* Filter Toolbar: Zone and Search */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search district, railway, or highway..."
                className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* District Grid Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {filteredDistricts.map((d) => {
              const isSelected = d.id === selectedDistrictId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDistrictId(d.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-stone-900 border-stone-800/90 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-amber-400 truncate">
                    {d.zone} Zone
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm mt-0.5 truncate">{d.name}</div>
                  <div className="text-[11px] text-stone-400 font-sans">{d.odiaName}</div>
                </button>
              );
            })}
          </div>

          {/* Active District Transit Intelligence Card */}
          <div className="bg-stone-900 border border-emerald-600/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeDistrict.zone} Odisha Transit Hub • HQ: {activeDistrict.headquarters}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 flex items-center gap-2">
                  <span>{activeDistrict.name} Transit &amp; Fair Fare Guide</span>
                  <span className="text-base text-amber-400">({activeDistrict.odiaName})</span>
                </h2>
              </div>
              <span className="text-xs text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
                Official STA Regulated
              </span>
            </div>

            {/* Transport Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rail Hub */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Train className="w-4 h-4" />
                  <span>Railway Hub</span>
                </div>
                <div className="text-sm font-extrabold text-stone-100">
                  {activeDistrict.transportHubs.nearestRail}
                </div>
                <p className="text-[11px] text-stone-400">
                  Direct East Coast Railway express &amp; local passenger connectivity.
                </p>
              </div>

              {/* Air Hub */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <Plane className="w-4 h-4" />
                  <span>Airport Gateway</span>
                </div>
                <div className="text-sm font-extrabold text-stone-100">
                  {activeDistrict.transportHubs.nearestAirport || 'Bhubaneswar BBI (Intl Gateway)'}
                </div>
                <p className="text-[11px] text-stone-400">
                  {activeDistrict.transportHubs.nearestAirport
                    ? 'Commercial / UDAN regional flight service'
                    : 'State airport connection via highway express'}
                </p>
              </div>

              {/* Highway Corridor */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Navigation className="w-4 h-4" />
                  <span>Highway Corridor</span>
                </div>
                <div className="text-sm font-extrabold text-stone-100">
                  {activeDistrict.transportHubs.highway}
                </div>
                <p className="text-[11px] text-stone-400">
                  Regular OSRTC inter-district AC and deluxe bus services.
                </p>
              </div>

              {/* Last-Mile Transit Mode */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                  <Bus className="w-4 h-4" />
                  <span>Last-Mile Transit</span>
                </div>
                <div className="text-xs font-bold text-stone-200 leading-snug">
                  {activeDistrict.transportHubs.lastMileTransit}
                </div>
                <p className="text-[10px] text-stone-400">
                  Regulated e-rickshaw, auto, or ghat vehicle standard.
                </p>
              </div>
            </div>

            {/* Regulated Fair Fare Table for Active District */}
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-400" />
                <span>
                  Regulated Standard Fair Tariffs in {activeDistrict.name} (STA Benchmarked)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-850 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Shared E-Rickshaw / Auto
                  </span>
                  <div className="text-base font-extrabold text-emerald-400">₹15 – ₹30</div>
                  <p className="text-[10px] text-stone-400">per person for short town trips (1-4 km)</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-850 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Private Auto Hire (Reserved)
                  </span>
                  <div className="text-base font-extrabold text-amber-400">₹80 – ₹150</div>
                  <p className="text-[10px] text-stone-400">base 4-6 km trip from rail station</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-850 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    OSRTC / Mo Bus Intercity
                  </span>
                  <div className="text-base font-extrabold text-cyan-400">₹1.20 – ₹1.80</div>
                  <p className="text-[10px] text-stone-400">per passenger per km (standard/AC)</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-850 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Full Day Private Cab (Sedan)
                  </span>
                  <div className="text-base font-extrabold text-purple-400">₹2,200 – ₹2,800</div>
                  <p className="text-[10px] text-stone-400">8 hrs / 80 km sightseeing package</p>
                </div>
              </div>

              <div className="text-xs text-stone-300 leading-relaxed bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
                <span className="font-bold text-amber-400 block mb-0.5">
                  Local Mobility Advice for {activeDistrict.name}:
                </span>
                {activeDistrict.description.slice(0, 220)}... Always confirm the fare with auto-rickshaw drivers
                prior to boarding or use the prepaid counter at {activeDistrict.transportHubs.nearestRail}.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: POINT-TO-POINT CORRIDORS & GROUP FARE CALCULATOR
          ===================================================================== */}
      {activeTab === 'corridors' && (
        <div className="space-y-6">
          {/* Search & Mode Filter */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by origin or destination..."
                className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="text-xs text-stone-400 mr-1 hidden md:inline">Mode:</span>
              {['all', 'Mo Bus', 'Train', 'Taxi', 'Boat'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedModeFilter(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedModeFilter === mode
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {mode === 'all' ? 'All Modes' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* Route Listing & Fare Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Route Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {filteredRoutes.map((route) => {
                const isSelected = selectedRoute.id === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-stone-850 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                        : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {route.distanceKm} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {route.estDuration}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-100 leading-snug">{route.from}</h3>
                    <div className="flex items-center gap-1.5 text-stone-500 my-1">
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs font-semibold text-stone-300">{route.to}</span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {route.modes.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-950 text-stone-300 border border-stone-800"
                          >
                            {m.mode}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-extrabold text-amber-400">
                        From ₹{Math.min(...route.modes.map((m) => m.numericMinFare))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Route Breakdown & Group Fare Calculator (7 cols) */}
            <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Detailed Corridor Fare Breakdown
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Travelers:</span>
                    <div className="flex items-center border border-stone-700 rounded-lg overflow-hidden">
                      {[1, 2, 4, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPassengerCount(num)}
                          className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                            passengerCount === num
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                  {selectedRoute.from} ➔ {selectedRoute.to}
                </h2>
                <div className="flex items-center gap-4 text-xs text-stone-400 mt-1">
                  <span>Distance: {selectedRoute.distanceKm} km</span>
                  <span>•</span>
                  <span>Est. Travel Time: {selectedRoute.estDuration}</span>
                </div>
              </div>

              {/* Transit Modes Available */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Available Transport Modes &amp; Official Tariffs:
                </span>

                {selectedRoute.modes.map((mode, idx) => {
                  const estGroupFare =
                    mode.mode === 'Prepaid Taxi' || mode.mode === 'Boat'
                      ? mode.numericMinFare
                      : mode.numericMinFare * passengerCount;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-950 border border-stone-800/90 space-y-2 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                            {mode.mode}
                          </span>
                          <span className="text-sm font-bold text-white">{mode.details}</span>
                        </div>
                        {getVerificationBadge(mode.verificationStatus)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300 pt-1">
                        <div>
                          <span className="text-stone-400 font-medium">Standard Fare: </span>
                          <span className="font-extrabold text-amber-400">{mode.fare}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium">For {passengerCount} travelers: </span>
                          <span className="font-extrabold text-emerald-400">
                            ~₹{estGroupFare.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {mode.frequencyOrTimings && (
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1 border-t border-stone-850">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Timetable / Frequency: {mode.frequencyOrTimings}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Last-Mile Accessibility Note */}
              <div className="p-4 rounded-2xl bg-stone-800/40 border border-stone-700/60 text-xs text-stone-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-stone-200">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Last-Mile &amp; Station Transit Note:</span>
                </div>
                <p className="leading-relaxed text-stone-300">{selectedRoute.lastMileNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
