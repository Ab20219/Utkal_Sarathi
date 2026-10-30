import React, { useState, useMemo, useEffect } from 'react';
import {
  EMERGENCY_CONTACTS,
  EmergencyContact,
} from '../utils/offlinePack';
import {
  VERIFIED_EMERGENCY_FACILITIES,
  INITIAL_HAZARDS,
} from '../data/mockData';
import { ODISHA_30_DISTRICTS, OdishaDistrict } from '../data/odishaDistricts';
import { DISTRICT_MAP_POINTS, findNearestDistrictByGps } from '../data/odishaDistrictGeoPoints';
import {
  requestAndGetCurrentLocation,
  shareContentNative,
  buildGoogleMapsDirectionsUrl,
} from '../utils/nativeAndroid';
import { HazardReport } from '../types';
import {
  ShieldAlert,
  PhoneCall,
  Share2,
  AlertTriangle,
  Hospital,
  Shield,
  CloudRain,
  MapPin,
  Clock,
  ThumbsUp,
  PlusCircle,
  CheckCircle2,
  Info,
  ExternalLink,
  Copy,
  Check,
  Search,
  Building,
  Navigation,
  Layers,
  Loader2,
} from 'lucide-react';

export const UtkalSuraksha: React.FC = () => {
  const [hazards, setHazards] = useState<HazardReport[]>(() => {
    try {
      const saved = localStorage.getItem('utkalsarathi_community_hazards_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_HAZARDS;
  });
  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGpsLink, setCopiedGpsLink] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('puri');

  // New report form state
  const [newLoc, setNewLoc] = useState('');
  const [newDistrict, setNewDistrict] = useState('Puri');
  const [newType, setNewType] = useState<
    'Road Diversion' | 'Heavy Rush / Long Queue' | 'Waterlogging' | 'Weather Advisory' | 'Wildlife Warning'
  >('Heavy Rush / Long Queue');
  const [newDesc, setNewDesc] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Live Location Share state
  const [sharedLink, setSharedLink] = useState<string | null>(null);
  const [isLocatingSafetyGps, setIsLocatingSafetyGps] = useState<boolean>(false);
  const [safetyGpsError, setSafetyGpsError] = useState<string | null>(null);

  useEffect(() => {
    const onAndroidBack = (e: Event) => {
      if (showReportForm) {
        e.preventDefault();
        setShowReportForm(false);
      }
    };
    window.addEventListener('utkalsarathi:android-back', onAndroidBack);
    return () => window.removeEventListener('utkalsarathi:android-back', onAndroidBack);
  }, [showReportForm]);

  const activeDistrict: OdishaDistrict = useMemo(() => {
    return (
      ODISHA_30_DISTRICTS.find((d) => d.id === selectedDistrictId) ||
      ODISHA_30_DISTRICTS[0]
    );
  }, [selectedDistrictId]);

  const filteredDistricts = useMemo(() => {
    return ODISHA_30_DISTRICTS.filter((d) => {
      if (selectedZone !== 'all' && d.zone.toLowerCase() !== selectedZone.toLowerCase()) {
        return false;
      }
      if (searchDistrict.trim()) {
        const q = searchDistrict.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.odiaName.includes(q) ||
          d.headquarters.toLowerCase().includes(q) ||
          d.safetyAndHelpline.districtHospital.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedZone, searchDistrict]);

  const handleCopyNumber = (id: string, num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLiveLocation = async () => {
    setIsLocatingSafetyGps(true);
    setSafetyGpsError(null);
    const time = new Date().toLocaleTimeString();
    try {
      const pos = await requestAndGetCurrentLocation();
      const lat = pos.latitude.toFixed(5);
      const lng = pos.longitude.toFixed(5);
      const nearest = findNearestDistrictByGps(pos.latitude, pos.longitude);
      setSelectedDistrictId(nearest.point.id);
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      const broadcastText = `[UtkalSuraksha Live Safe Track at ${time}] Current GPS: ${lat}, ${lng} (±${Math.round(
        pos.accuracyMeters
      )}m, near ${nearest.point.name}, Odisha). Map: ${mapsUrl}`;
      setSharedLink(broadcastText);
      await shareContentNative({
        title: 'UtkalSuraksha Emergency Live GPS',
        text: broadcastText,
        url: mapsUrl,
      });
    } catch (err: any) {
      setSafetyGpsError(
        err?.message ||
          'Could not read device GPS. Enable Location permission in Android Settings and retry.'
      );
    } finally {
      setIsLocatingSafetyGps(false);
    }
  };

  const handleSubmitHazard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.trim() || !newDesc.trim()) return;

    const report: HazardReport = {
      id: `hz-${Date.now()}`,
      location: newLoc,
      district: newDistrict,
      type: newType,
      description: newDesc,
      submittedBy: 'Traveller',
      timestamp: 'Just now',
      status: 'under_review',
      upvotes: 1,
    };

    const updated = [report, ...hazards];
    setHazards(updated);
    try {
      localStorage.setItem('utkalsarathi_community_hazards_v1', JSON.stringify(updated));
    } catch {
      // Ignore storage quota errors
    }
    setNewLoc('');
    setNewDesc('');
    setShowReportForm(false);
    setSubmittedMessage('Community report saved locally and marked Under Review (unverified community advisory).');
    setTimeout(() => setSubmittedMessage(null), 4000);
  };

  const handleUpvote = (id: string) => {
    const updated = hazards.map((h) => (h.id === id ? { ...h, upvotes: h.upvotes + 1 } : h));
    setHazards(updated);
    try {
      localStorage.setItem('utkalsarathi_community_hazards_v1', JSON.stringify(updated));
    } catch {
      // Ignore storage quota errors
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950 via-stone-900 to-red-950 border border-red-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>UtkalSuraksha: 30-District Comprehensive Safety &amp; Emergency Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive Traveller Safety &amp; Official Emergency Infrastructure
          </h1>
          <p className="mt-2 text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Verified emergency directories across all 30 districts of Odisha: Chief Medical Officer Hospitals,
            Superintendent of Police control rooms, OSDMA 24x7 cyclone shelters, coastal marine police, and
            shareable GPS coordinates for family or emergency contacts.
          </p>
        </div>
      </div>

      {/* Mandatory Safety Notice / Disclaimer */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-amber-600/40 flex items-start gap-3 shadow-md">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300 leading-relaxed">
          <span className="font-bold text-amber-300 block mb-0.5">
            Emergency Calling Protocol &amp; Cellular Availability:
          </span>
          Clicking &quot;Call Now&quot; or &quot;Call 112 SOS&quot; opens your device&apos;s phone dialer (<code className="text-amber-200">tel:</code> link) so you can place a cellular voice call—this web/mobile app does not automatically dispatch police or ambulance services without an active phone call.
          In remote forest sanctuaries (Similipal, Satkosia, Malkangiri) with limited cellular connectivity,
          save an Offline Safety Pack beforehand to access police station and OSDMA shelter contacts offline. In imminent danger,
          dial <span className="font-extrabold text-white underline">112</span> directly on your phone.
        </div>
      </div>

      {/* Primary Emergency Hotlines (Statewide) */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Statewide 24x7 Emergency Hotlines (Odisha Govt Verified)
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active &amp; Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {EMERGENCY_CONTACTS.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                contact.priority === 'critical'
                  ? 'bg-red-950/25 border-red-800/50 hover:border-red-600'
                  : 'bg-stone-950 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    {contact.odiaName}
                  </span>
                  {contact.priority === 'critical' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">
                      CRITICAL
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-stone-100 mt-1">{contact.name}</h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{contact.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-lg font-extrabold text-white tracking-wide font-mono">
                  {contact.number}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyNumber(contact.id, contact.number)}
                    className="p-2 rounded-lg bg-stone-850 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
                    title="Copy number"
                  >
                    {copiedId === contact.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          30-DISTRICT COMPREHENSIVE EMERGENCY & HOSPITAL DIRECTORY
          ===================================================================== */}
      <div className="bg-stone-900 border border-red-800/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Hospital className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                30-District Emergency, Hospital &amp; Police Directory
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Select any district in Odisha to access dedicated CDMO District Hospitals, Police Stations &amp; OSDMA Shelters.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              placeholder="Filter 30 districts..."
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Zone Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
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
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* District Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {filteredDistricts.map((d) => {
            const isSelected = d.id === selectedDistrictId;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDistrictId(d.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-red-950/70 border-red-500 text-white shadow-lg ring-1 ring-red-500/50'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-850 hover:border-stone-700'
                }`}
              >
                <div className="text-[9px] uppercase font-bold text-amber-400 truncate">
                  {d.zone} Zone
                </div>
                <div className="font-extrabold text-xs mt-0.5 truncate">{d.name}</div>
                <div className="text-[10px] text-stone-400">{d.odiaName}</div>
              </button>
            );
          })}
        </div>

        {/* Active District Comprehensive Emergency Card */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-red-800/40 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {activeDistrict.zone} Odisha Emergency Infrastructure
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                <span>{activeDistrict.name} Safety &amp; Emergency Hub</span>
                <span className="text-base text-stone-400 font-sans">({activeDistrict.odiaName})</span>
              </h3>
            </div>
            <span className="text-xs text-stone-400">
              District HQ: <strong className="text-stone-200">{activeDistrict.headquarters}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hospital Card */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Hospital className="w-4 h-4" />
                <span>District Hospital (CDMO)</span>
              </div>
              <div className="text-sm font-extrabold text-stone-100">
                {activeDistrict.safetyAndHelpline.districtHospital}
              </div>
              <p className="text-[11px] text-stone-400">
                24x7 Emergency Trauma Care, Blood Bank, and Casualty Ward.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="tel:108"
                  className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call 108 Emergency
                </a>
                {DISTRICT_MAP_POINTS[activeDistrict.id] && (
                  <a
                    href={buildGoogleMapsDirectionsUrl(
                      DISTRICT_MAP_POINTS[activeDistrict.id].lat,
                      DISTRICT_MAP_POINTS[activeDistrict.id].lng,
                      activeDistrict.safetyAndHelpline.districtHospital
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions to Hospital
                  </a>
                )}
              </div>
            </div>

            {/* Police Station & Control Room */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Police Station &amp; Control</span>
              </div>
              <div className="text-sm font-extrabold text-stone-100">
                {activeDistrict.safetyAndHelpline.policeStation}
              </div>
              <p className="text-[11px] text-stone-400">
                Control Room: <strong className="text-amber-300 font-mono">{activeDistrict.safetyAndHelpline.controlRoomNumber}</strong>
              </p>
              <div className="pt-2 flex items-center gap-2">
                <a
                  href="tel:112"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call 112 SOS
                </a>
                <button
                  onClick={() =>
                    handleCopyNumber(activeDistrict.id, activeDistrict.safetyAndHelpline.controlRoomNumber)
                  }
                  className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  {copiedId === activeDistrict.id ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Cyclone & Disaster Management */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <CloudRain className="w-4 h-4" />
                <span>OSDMA Disaster Shelters</span>
              </div>
              <div className="text-sm font-extrabold text-stone-100">
                OSDMA {activeDistrict.name} Multi-Purpose Cyclone &amp; Disaster Shelter (DEOC)
              </div>
              <p className="text-[11px] text-stone-400">
                Multi-purpose cyclone &amp; flood shelters with generator backup &amp; clean water.
              </p>
              <div className="pt-2">
                <a
                  href="tel:1070"
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call 1070 Disaster Control
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Safety Location Share Tool */}
      <div className="rounded-3xl bg-stone-900 border border-stone-800 p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Live Safe Tracking &amp; GPS Location Broadcast
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Generate an emergency WhatsApp / SMS safety tracking link with GPS coordinates for family or guides.
            </p>
          </div>

          <button
            onClick={handleShareLiveLocation}
            disabled={isLocatingSafetyGps}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-stone-950 font-extrabold text-xs shadow-md transition-all self-start sm:self-auto"
          >
            {isLocatingSafetyGps ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {isLocatingSafetyGps
              ? 'Acquiring Live GPS...'
              : 'Share My Live GPS Safety Link'}
          </button>
        </div>

        {safetyGpsError && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-600/40 text-red-200 text-xs flex items-center justify-between gap-2">
            <span>{safetyGpsError}</span>
            <button
              type="button"
              onClick={() => setSafetyGpsError(null)}
              className="text-red-300 hover:text-white font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {sharedLink && (
          <div className="p-4 rounded-2xl bg-stone-950 border border-amber-600/40 text-xs space-y-2 animate-fadeIn">
            <span className="font-bold text-amber-400 block">Your Emergency Tracking Link:</span>
            <div className="p-2.5 rounded-xl bg-stone-900 text-stone-300 font-mono text-[11px] break-all border border-stone-800">
              {sharedLink}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(sharedLink);
                  setCopiedGpsLink(true);
                  setTimeout(() => setCopiedGpsLink(false), 2500);
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs flex items-center gap-1"
              >
                {copiedGpsLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied GPS Link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `[UtkalSuraksha Emergency Location Broadcast]: I am traveling in Odisha. Here is my current GPS location: ${sharedLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs flex items-center gap-1"
              >
                Share via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Community Hazard Reports Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Live Community Travel Incidents &amp; Road Advisories
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Verified police advisories and community-reported local road disruptions across Odisha.
            </p>
          </div>

          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            {showReportForm ? 'Cancel Report' : 'Report Hazard / Disruption'}
          </button>
        </div>

        {submittedMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {submittedMessage}
          </div>
        )}

        {/* Hazard Submission Form */}
        {showReportForm && (
          <form
            onSubmit={handleSubmitHazard}
            className="p-5 rounded-2xl bg-stone-950 border border-amber-600/40 space-y-4 text-xs animate-fadeIn"
          >
            <h3 className="font-bold text-white text-sm">
              Submit Local Travel Incident / Hazard Report
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Incident Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                >
                  <option value="Heavy Rush / Long Queue">Heavy Rush / Long Queue</option>
                  <option value="Road Diversion">Road Diversion / Repair</option>
                  <option value="Waterlogging">Waterlogging / High Tide</option>
                  <option value="Weather Advisory">Severe Weather Alert</option>
                  <option value="Wildlife Warning">Wildlife Movement Near Track</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">District</label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                >
                  {ODISHA_30_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.odiaName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Exact Landmark / Road</label>
                <input
                  type="text"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  placeholder="e.g., Grand Road near Singhadwara"
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Details &amp; Advice</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe current road status, queue duration, or recommended alternative route..."
                rows={3}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg transition-colors"
            >
              Submit Hazard Report
            </button>
          </form>
        )}

        {/* Hazard Reports List */}
        <div className="space-y-3 pt-2">
          {hazards.map((hz) => (
            <div
              key={hz.id}
              className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hz.type === 'Road Diversion'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : hz.type === 'Heavy Rush / Long Queue'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {hz.type}
                  </span>
                  <span className="font-bold text-stone-200">{hz.location}</span>
                  <span className="text-stone-500">({hz.district})</span>
                </div>
                <p className="text-stone-300 leading-relaxed pt-1">{hz.description}</p>
                <div className="text-[11px] text-stone-500 pt-1 flex items-center gap-3">
                  <span>Reported by: {hz.submittedBy}</span>
                  <span>• {hz.timestamp}</span>
                  {hz.status === 'verified' ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Under Review</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleUpvote(hz.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-semibold transition-colors flex-shrink-0"
              >
                <ThumbsUp className="w-3 h-3 text-amber-400" />
                <span>Confirm ({hz.upvotes})</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
