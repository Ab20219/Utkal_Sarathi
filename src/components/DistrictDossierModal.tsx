import React, { useState } from 'react';
import { DistrictInfo } from '../data/odishaDistricts';
import {
  X,
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
  Calendar,
  Share2,
  Check,
  Bot,
  ExternalLink,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface DistrictDossierModalProps {
  district: DistrictInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onPlanTripToDistrict?: (districtName: string) => void;
  onAskAiAboutDistrict?: (district: DistrictInfo) => void;
}

export const DistrictDossierModal: React.FC<DistrictDossierModalProps> = ({
  district,
  isOpen,
  onClose,
  onPlanTripToDistrict,
  onAskAiAboutDistrict,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gems' | 'stays' | 'food' | 'transit' | 'emergency'>('overview');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !district) return null;

  const handleShare = () => {
    const text = `Explore ${district.name} (${district.odiaName}), Odisha with UtkalSarathi:
${district.tagline}
Top Highlights: ${district.highlights.join(', ')}
Hidden Gems: ${district.hiddenGems ? district.hiddenGems.join(', ') : 'N/A'}
Emergency Helpline: ${district.safetyAndHelpline.controlRoomNumber}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-stone-950 via-amber-950/80 to-stone-950 p-5 sm:p-6 border-b border-stone-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {district.name}
                </span>
                <span className="text-xl sm:text-2xl font-serif font-bold text-amber-400">
                  {district.odiaName}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-semibold">
                  {district.zone} Zone
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  HQ: {district.headquarters}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 italic mt-1.5 max-w-2xl">
                "{district.tagline}"
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white flex items-center justify-center border border-stone-700 transition-colors"
                title="Copy district summary"
                aria-label="Share district summary"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white flex items-center justify-center border border-stone-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-stone-800/80">
            {onPlanTripToDistrict && (
              <button
                onClick={() => {
                  onPlanTripToDistrict(district.name);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Plan Trip to {district.name}</span>
              </button>
            )}

            {onAskAiAboutDistrict && (
              <button
                onClick={() => {
                  onAskAiAboutDistrict(district);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Utkal Mitra AI</span>
              </button>
            )}

            <a
              href={`tel:${district.safetyAndHelpline.controlRoomNumber}`}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Helpline: {district.safetyAndHelpline.controlRoomNumber}</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-stone-800 bg-stone-850 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Highlights', icon: MapPin },
            { id: 'gems', label: '💎 Hidden Gems', icon: Gem },
            { id: 'stays', label: '🏨 Stays & Eco Camps', icon: Bed },
            { id: 'food', label: '🍲 Food & GI Sweets', icon: Utensils },
            { id: 'transit', label: '🚆 Transit & Advice', icon: Bus },
            { id: 'emergency', label: '🏥 Hospitals & Safety', icon: HeartPulse },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-stone-800/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-stone-850/70 border border-stone-800 text-xs sm:text-sm text-stone-300 leading-relaxed">
                <strong className="text-white block mb-1 text-sm">About {district.name} District:</strong>
                {district.description}
              </div>

              {/* Highlights & Eco-Tourism */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2.5">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Top Tourist & Heritage Attractions:
                  </h4>
                  <div className="space-y-1.5">
                    {district.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-750 text-xs text-stone-200 flex items-center gap-2"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2.5">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    Eco-Tourism & Nature Reserves:
                  </h4>
                  <div className="space-y-1.5">
                    {district.ecoTourismAndNature.map((eco, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 flex items-center gap-2"
                      >
                        <TreePine className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{eco}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Handloom & Festivals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-2">
                    <Award className="w-4 h-4" />
                    Handicrafts & Living Heritage:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {district.handicraftsAndArt.map((art, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-stone-900 text-stone-200 border border-stone-750"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800">
                  <h4 className="text-xs font-bold text-orange-400 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4" />
                    Major Annual Festivals:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {district.majorFestivals.map((fest, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-orange-950/40 text-orange-200 border border-orange-800/40"
                      >
                        {fest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HIDDEN GEMS */}
          {activeTab === 'gems' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                <span>Offbeat waterfalls, ancient secluded rock sanctuaries, and lesser-known cultural spots in {district.name}:</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 font-semibold">
                  {district.hiddenGems ? district.hiddenGems.length : 0} Hidden Gems
                </span>
              </div>

              {district.hiddenGems && district.hiddenGems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {district.hiddenGems.map((gem, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-850 border border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Gem className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-sm">{gem}</h5>
                          <span className="text-[11px] text-stone-400 block mt-1">
                            Lesser-known spot in {district.name} • Recommended for offbeat travelers
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-amber-300">
                        <span>Offbeat Explorer Pick</span>
                        {onAskAiAboutDistrict && (
                          <button
                            onClick={() => {
                              onAskAiAboutDistrict(district);
                              onClose();
                            }}
                            className="hover:underline flex items-center gap-0.5"
                          >
                            <span>Ask how to visit</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 text-xs">No offbeat destinations cataloged yet for this district.</p>
              )}
            </div>
          )}

          {/* TAB 3: STAYS & HOTELS */}
          {activeTab === 'stays' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200 flex items-center justify-between">
                <span>Verified OTDC Panthanivas, Eco Tour Odisha Nature Camps & Heritage Stays:</span>
                <span className="text-[10px] text-stone-400">Official Government & Approved Partners</span>
              </div>

              {district.recommendedStays && district.recommendedStays.length > 0 ? (
                <div className="space-y-3">
                  {district.recommendedStays.map((stay, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-850 border border-stone-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-white text-sm">{stay.name}</h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 font-semibold">
                            {stay.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-300">
                          <span className="font-mono text-amber-300 font-semibold">Tariff: {stay.estPrice}</span>
                        </div>
                      </div>

                      <a
                        href={`tel:${stay.contact}`}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow self-start sm:self-auto transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call {stay.contact}</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 text-xs">Stay listings are being updated for this district.</p>
              )}
            </div>
          )}

          {/* TAB 4: FOOD & SWEETS */}
          {activeTab === 'food' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-200">
                Signature Odia cuisine, GI-tagged sweets, and famous food spots in {district.name}:
              </div>

              {district.foodSpots && district.foodSpots.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5" />
                    Recommended Stalls & Landmark Food Hubs:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {district.foodSpots.map((spot, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-stone-850 border border-stone-750 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-amber-300 text-xs">{spot.item}</strong>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800/50">
                            Must-Try
                          </span>
                        </div>
                        <p className="text-xs text-stone-300">
                          {spot.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-stone-850 border border-stone-800 space-y-2">
                <h4 className="text-xs font-bold text-stone-300">General District Specialties:</h4>
                <div className="flex flex-wrap gap-2">
                  {district.signatureCuisine.map((dish, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1.5 rounded-xl bg-stone-900 text-stone-200 border border-stone-700"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TRANSIT & CONNECTIVITY */}
          {activeTab === 'transit' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
                Transit hubs, highways, and practical last-mile navigation to {district.name}:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {district.transportHubs.nearestAirport && (
                  <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-750">
                    <span className="text-stone-400 text-[10px] block">Nearest Airport:</span>
                    <strong className="text-white text-xs">{district.transportHubs.nearestAirport}</strong>
                  </div>
                )}
                <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-750">
                  <span className="text-stone-400 text-[10px] block">Rail Station / Junction:</span>
                  <strong className="text-white text-xs">{district.transportHubs.nearestRail}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-750">
                  <span className="text-stone-400 text-[10px] block">Primary Highway Route:</span>
                  <strong className="text-white text-xs">{district.transportHubs.highway}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-750">
                  <span className="text-stone-400 text-[10px] block">Bus Services:</span>
                  <strong className="text-white text-xs">{district.transportHubs.busServices}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/50 space-y-1">
                <span className="text-blue-300 text-xs font-bold block">💡 Local Last-Mile Advice:</span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {district.transportHubs.lastMileTransit}
                </p>
              </div>

              {district.touristGuideInfo && (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h5 className="font-bold text-amber-300">{district.touristGuideInfo.contactName}</h5>
                    <p className="text-stone-400 text-[11px] mt-0.5">
                      Helpdesk: {district.touristGuideInfo.deskLocation}
                    </p>
                  </div>
                  <a
                    href={`tel:${district.touristGuideInfo.phone}`}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {district.touristGuideInfo.phone}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EMERGENCY & MEDICAL */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                24/7 District medical facilities, police stations, and disaster control room numbers for {district.name}:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-stone-850 border border-stone-750 space-y-2">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                    District Headquarters Hospital / Medical College:
                  </span>
                  <h5 className="font-bold text-white text-sm">{district.safetyAndHelpline.districtHospital}</h5>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-400">Direct Contact:</span>
                    <a
                      href={`tel:${district.safetyAndHelpline.hospitalContact}`}
                      className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{district.safetyAndHelpline.hospitalContact}</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-850 border border-stone-750 space-y-2">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                    Town Police Station:
                  </span>
                  <h5 className="font-bold text-white text-sm">{district.safetyAndHelpline.policeStation}</h5>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-400">State Tourism Police:</span>
                    <a
                      href="tel:06752-222074"
                      className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>06752-222074</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-stone-900 border border-red-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-red-300 block">
                    District Disaster Management Control Room:
                  </span>
                  <span className="text-sm font-mono text-white font-extrabold">
                    {district.safetyAndHelpline.controlRoomNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${district.safetyAndHelpline.controlRoomNumber}`}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Control Room</span>
                  </a>
                  <a
                    href="tel:112"
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold border border-stone-700"
                  >
                    Emergency 112
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
          <span>Official Data Grounded with Odisha Tourism & District Administrations</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
