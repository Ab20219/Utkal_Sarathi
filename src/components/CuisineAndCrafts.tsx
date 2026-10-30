import React, { useState, useMemo } from 'react';
import { ODISHA_CUISINE, LOCAL_BUSINESSES } from '../data/mockData';
import { ODISHA_30_DISTRICTS, OdishaDistrict } from '../data/odishaDistricts';
import { CuisineItem, LocalBusiness } from '../types';
import {
  UtensilsCrossed,
  Award,
  Phone,
  MapPin,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Check,
  Search,
  Layers,
  Heart,
  ChevronRight,
} from 'lucide-react';

export const CuisineAndCrafts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [businesses, setBusinesses] = useState<LocalBusiness[]>(() => {
    try {
      const saved = localStorage.getItem('utkalsarathi_community_businesses_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return LOCAL_BUSINESSES;
  });
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // 30-District Cuisine & Handloom Directory state
  const [craftDistrictZone, setCraftDistrictZone] = useState<string>('all');
  const [craftDistrictId, setCraftDistrictId] = useState<string>('nayagarh');
  const [searchDistrictText, setSearchDistrictText] = useState<string>('');

  // Registration Form
  const [bizName, setBizName] = useState('');
  const [bizType, setBizType] = useState<LocalBusiness['type']>('Artisan Workshop');
  const [bizLocation, setBizLocation] = useState('');
  const [bizDistrict, setBizDistrict] = useState('Puri');
  const [bizPhone, setBizPhone] = useState('');
  const [bizPricing, setBizPricing] = useState('');
  const [bizSpecialty, setBizSpecialty] = useState('');

  const activeDistrict: OdishaDistrict = useMemo(() => {
    return (
      ODISHA_30_DISTRICTS.find((d) => d.id === craftDistrictId) ||
      ODISHA_30_DISTRICTS[0]
    );
  }, [craftDistrictId]);

  const filteredDistricts = useMemo(() => {
    return ODISHA_30_DISTRICTS.filter((d) => {
      if (craftDistrictZone !== 'all' && d.zone.toLowerCase() !== craftDistrictZone.toLowerCase()) {
        return false;
      }
      if (searchDistrictText.trim()) {
        const q = searchDistrictText.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.odiaName.includes(q) ||
          d.signatureCuisine.some((c) => c.toLowerCase().includes(q)) ||
          d.handicraftsAndArt.some((h) => h.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [craftDistrictZone, searchDistrictText]);

  const filteredCuisine = ODISHA_CUISINE.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'veg') return item.isVegetarian;
    if (selectedCategory === 'sweet') return item.category === 'Traditional Sweet';
    if (selectedCategory === 'gi') return item.giTagCertified;
    return true;
  });

  const handleRegisterBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !bizPhone.trim()) return;

    const newBiz: LocalBusiness = {
      id: `biz-${Date.now()}`,
      name: bizName.trim(),
      type: bizType,
      location: bizLocation.trim() || `${bizDistrict} Town`,
      district: bizDistrict,
      phone: bizPhone.trim(),
      pricing: bizPricing.trim() || 'Direct artisan price',
      verifiedStatus: false,
      specialty: bizSpecialty.trim() || 'Traditional Odisha Craft & Hospitality',
    };

    const updated = [newBiz, ...businesses];
    setBusinesses(updated);
    try {
      localStorage.setItem('utkalsarathi_community_businesses_v1', JSON.stringify(updated));
    } catch {
      // Ignore storage quota errors
    }
    setBizName('');
    setBizLocation('');
    setBizPhone('');
    setBizPricing('');
    setBizSpecialty('');
    setShowRegisterModal(false);
    setRegisterSuccess(
      `Your enterprise "${newBiz.name}" is saved locally as a Community Preview Listing (Pending Official Verification).`
    );
    setTimeout(() => setRegisterSuccess(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-stone-900 to-orange-950 border border-orange-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-semibold mb-3">
            <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
            <span>30-District Cultural Flavors &amp; Indigenous Handloom Guilds</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Odisha Culinary Heritage &amp; Master Artisans
          </h1>
          <p className="mt-2 text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Savor authentic Geographical Indication (GI) culinary treasures across all 30 districts—from
            Nayagarh Chhena Poda and Kendrapara Rasabali to Mayurbhanj Mudhi Mansa and Koraput Arabica Coffee.
            Support master weavers of Sambalpuri Ikat and Pattachitra artists directly.
          </p>
        </div>
      </div>

      {registerSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{registerSuccess}</span>
        </div>
      )}

      {/* =====================================================================
          30-DISTRICT CUISINE & HANDICRAFTS DIRECTORY
          ===================================================================== */}
      <div className="bg-stone-900 border border-amber-600/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                30-District Signature Cuisine &amp; Handloom Directory
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Select any of Odisha&apos;s 30 districts to view its distinctive GI sweets, staple thalis, and indigenous craft guilds.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDistrictText}
              onChange={(e) => setSearchDistrictText(e.target.value)}
              placeholder="Search food, handloom, or district..."
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
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
              onClick={() => setCraftDistrictZone(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                craftDistrictZone === z.id
                  ? 'bg-amber-600 text-white shadow-md'
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
            const isSelected = d.id === craftDistrictId;
            return (
              <button
                key={d.id}
                onClick={() => setCraftDistrictId(d.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-950/70 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50'
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

        {/* Active District Deep Culinary & Handloom Card */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {activeDistrict.zone} Odisha Cultural &amp; Culinary Profile
              </span>
              <h3 className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                <span>{activeDistrict.name}</span>
                <span className="text-base text-amber-400 font-sans">({activeDistrict.odiaName})</span>
              </h3>
            </div>
            <span className="text-xs text-stone-400 italic">
              &quot;{activeDistrict.tagline}&quot;
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Signature Cuisine & Food Spots */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-850 space-y-3">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Signature Culinary Delicacies &amp; GI Specialties</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeDistrict.signatureCuisine.map((dish, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-orange-950/40 text-orange-200 border border-orange-800/40 text-xs font-semibold"
                  >
                    🍲 {dish}
                  </span>
                ))}
              </div>

              {activeDistrict.foodSpots && (
                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                    Authentic Recommended Food Spots:
                  </span>
                  {activeDistrict.foodSpots.map((spot, idx) => (
                    <div key={idx} className="text-xs text-stone-300 bg-stone-950 p-2.5 rounded-xl border border-stone-850">
                      <span className="font-extrabold text-amber-400 block">{spot.item}</span>
                      <span className="text-[11px] text-stone-400">{spot.recommendation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Handloom & Traditional Crafts */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-850 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4" />
                <span>Indigenous Handlooms, Weaving &amp; Rural Crafts</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeDistrict.handicraftsAndArt.map((craft, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/40 text-purple-200 border border-purple-800/40 text-xs font-semibold"
                  >
                    🎨 {craft}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-800 text-xs text-stone-300 leading-relaxed bg-stone-950 p-3 rounded-xl border border-stone-850">
                <span className="font-bold text-amber-400 block mb-1">Cultural Preservation Notice:</span>
                Handicrafts produced in {activeDistrict.name} represent centuries-old hereditary master guild
                knowledge. Purchase directly from certified weaver cooperative societies and OTDC Panthanivas
                artisan stalls to ensure fair living wages for artisan families.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Classic GI Culinary Heritage Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Celebrated Odia GI &amp; Temple Culinary Landmarks
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Strictly non-commercial preparation guidelines and authentic tasting venues.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
            {['all', 'gi', 'sweet', 'veg'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {cat === 'all'
                  ? 'All Items'
                  : cat === 'gi'
                  ? 'GI Tag Certified'
                  : cat === 'sweet'
                  ? 'Traditional Sweets'
                  : 'Pure Vegetarian'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCuisine.map((dish: CuisineItem) => (
            <div
              key={dish.id}
              className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        dish.isVegetarian ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      {dish.category}
                    </span>
                  </div>

                  {dish.giTagCertified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Award className="w-3 h-3 text-amber-400" />
                      GI Certified
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-1.5">{dish.name}</h3>
                <span className="text-xs text-orange-300/80 font-medium">{dish.odiaName}</span>

                <p className="text-xs text-stone-300 mt-2 leading-relaxed">{dish.description}</p>

                {/* Key Ingredients */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                    Key Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dish.keyIngredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] border border-stone-700/80"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-1.5">
                <div className="text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Where to Taste: </span>
                  {dish.mustTryLocations.join(', ')}
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-stone-400">Fair Price:</span>
                  <span className="font-extrabold text-amber-400">{dish.estimatedPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Local Artisans & Community Business Directory */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              Verified Local Artisans, Weavers &amp; Eco-Cottages
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Support direct rural artisans and homestays without middleman commissions.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            List Your Tourism Business / Homestay
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {biz.type}
                  </span>
                  {biz.verifiedStatus ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified Partner
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-400">
                      Community Listed
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-1.5">{biz.name}</h3>
                <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  <span>
                    {biz.location}, {biz.district}
                  </span>
                </div>

                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  <span className="font-semibold text-amber-300/90">Specialty: </span>
                  {biz.specialty}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block">Transparent Pricing:</span>
                  <span className="text-xs font-bold text-stone-200">{biz.pricing}</span>
                </div>

                <a
                  href={`tel:${biz.phone.replace(/[^0-9]/g, '')}`}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-750 text-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Contact Directly
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Listing Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-6 text-stone-100 shadow-2xl relative">
            <div className="flex items-start justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Register Your Tourism Enterprise
                </h3>
                <p className="text-xs text-stone-400">
                  Connect with visitors seeking genuine Odia experiences across all 30 districts.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterBusiness} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Business / Workshop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Raghurajpur Chitrakar Shilpi Kutir"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Type</label>
                  <select
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200"
                  >
                    <option value="Artisan Workshop">Artisan Workshop</option>
                    <option value="Homestay / Panthanivas">Homestay / Panthanivas</option>
                    <option value="Eco-Tourism Camp">Eco-Tourism Camp</option>
                    <option value="Authentic Kitchen">Authentic Kitchen</option>
                    <option value="Certified Tour Guide">Certified Tour Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">District</label>
                  <select
                    value={bizDistrict}
                    onChange={(e) => setBizDistrict(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200"
                  >
                    {ODISHA_30_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({d.odiaName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94370 XXXXX"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Pricing Guide</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹500 - ₹3,500 direct"
                    value={bizPricing}
                    onChange={(e) => setBizPricing(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Address / Landmark</label>
                <input
                  type="text"
                  placeholder="Village, Tehsil, Pin Code"
                  value={bizLocation}
                  onChange={(e) => setBizLocation(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Specialty &amp; Products</label>
                <textarea
                  rows={2}
                  placeholder="What makes your craft or service authentic? (e.g., Traditional palm leaf etching with natural river pigments)"
                  value={bizSpecialty}
                  onChange={(e) => setBizSpecialty(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold"
                >
                  Submit Enterprise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
