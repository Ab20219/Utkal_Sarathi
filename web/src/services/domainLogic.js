import { ODISHA_REGIONS } from '../data/districtsCatalog.js';

export const DEFAULT_SITE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PUBLIC_SITE_URL) ||
  'https://utkalsarathi.vercel.app';

/**
 * Deterministic Haversine great-circle distance multiplied by a road-winding factor
 * (1.28x coastal/highway, 1.42x Eastern Ghats highland terrain).
 */
export function estimateRoadDistanceKm(lat1, lon1, lat2, lon2, isGhatTerrain = false) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const r = 6371.0;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = r * c;
  if (straightKm < 0.5) return 5;
  const factor = isGhatTerrain ? 1.42 : 1.28;
  return Math.max(5, Math.round(straightKm * factor));
}

export const VEHICLE_MODES = {
  auto: {
    id: 'auto',
    label: 'Auto-Rickshaw (Short Local / Town Hop)',
    baseInr: 40,
    perKmLow: 13,
    perKmHigh: 17,
    avgSpeedKmph: 28,
    maxRecommendedKm: 35
  },
  hatchback: {
    id: 'hatchback',
    label: 'AC Hatchback / Compact Cab',
    baseInr: 120,
    perKmLow: 14,
    perKmHigh: 18,
    avgSpeedKmph: 46,
    maxRecommendedKm: 600
  },
  sedan: {
    id: 'sedan',
    label: 'AC Sedan Intercity Taxi',
    baseInr: 160,
    perKmLow: 16,
    perKmHigh: 21,
    avgSpeedKmph: 48,
    maxRecommendedKm: 800
  },
  suv: {
    id: 'suv',
    label: 'AC SUV / 6-Seater Tourist Carrier',
    baseInr: 250,
    perKmLow: 22,
    perKmHigh: 28,
    avgSpeedKmph: 45,
    maxRecommendedKm: 900
  },
  osrtc: {
    id: 'osrtc',
    label: 'OSRTC / Express Bus (Per Passenger)',
    baseInr: 20,
    perKmLow: 1.4,
    perKmHigh: 2.3,
    avgSpeedKmph: 40,
    maxRecommendedKm: 900
  }
};

export function calculateFairFareEstimate(originDistrict, destDistrict, vehicleModeId = 'sedan') {
  if (!originDistrict || !destDistrict) {
    throw new Error('Origin and destination districts are required');
  }
  const mode = VEHICLE_MODES[vehicleModeId] || VEHICLE_MODES.sedan;
  const sameDistrict = originDistrict.id === destDistrict.id;
  const isGhat =
    originDistrict.region === ODISHA_REGIONS.SOUTHERN ||
    destDistrict.region === ODISHA_REGIONS.SOUTHERN;

  const distanceKm = sameDistrict
    ? 14
    : estimateRoadDistanceKm(
        originDistrict.latitude,
        originDistrict.longitude,
        destDistrict.latitude,
        destDistrict.longitude,
        isGhat
      );

  const driveMinutes = Math.max(20, Math.round((distanceKm / mode.avgSpeedKmph) * 60));
  const hours = Math.floor(driveMinutes / 60);
  const mins = driveMinutes % 60;
  const durationLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

  // Intercity cabs commonly factor return-empty or outstation allowance beyond 60 km
  const outstationMultiplier =
    distanceKm > 60 && (mode.id === 'hatchback' || mode.id === 'sedan' || mode.id === 'suv')
      ? 1.35
      : 1.0;

  const lowInr = Math.round((mode.baseInr + distanceKm * mode.perKmLow) * outstationMultiplier);
  const highInr = Math.round((mode.baseInr + distanceKm * mode.perKmHigh) * outstationMultiplier);

  const suitabilityNote =
    distanceKm > mode.maxRecommendedKm
      ? 'Auto-rickshaws are best suited for local trips under 35 km; consider OSRTC bus, rail, or intercity cab for this route.'
      : isGhat
        ? 'Route traverses Eastern Ghats terrain — prefer daylight hours and verify weather conditions.'
        : 'Standard National/State Highway corridor.';

  return {
    originName: originDistrict.nameEn,
    destName: destDistrict.nameEn,
    sameDistrict,
    isGhat,
    distanceKm,
    driveMinutes,
    durationLabel,
    vehicleLabel: mode.label,
    lowInr,
    highInr,
    classification: 'Estimated Reference Range (Non-Binding)',
    suitabilityNote,
    googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      originDistrict.headquarters + ', Odisha'
    )}&destination=${encodeURIComponent(destDistrict.headquarters + ', Odisha')}&travelmode=driving`
  };
}

const BUDGET_TIER_RATES = {
  Budget: { stay: 1200, food: 550, transit: 650, entry: 200 },
  Mid: { stay: 2800, food: 1100, transit: 1650, entry: 450 },
  Premium: { stay: 6400, food: 2200, transit: 3400, entry: 950 }
};

export function generateDeterministicTripPlan({
  title,
  days = 3,
  budgetStyle = 'Mid',
  pace = 'Balanced',
  travelers = 2,
  selectedDistrictIds = ['puri', 'khordha'],
  districts = []
}) {
  const clampedDays = Math.min(14, Math.max(1, Number(days) || 3));
  const clampedTravelers = Math.min(12, Math.max(1, Number(travelers) || 1));
  const tier = BUDGET_TIER_RATES[budgetStyle] || BUDGET_TIER_RATES.Mid;

  const chosenDistricts = districts.filter((d) => selectedDistrictIds.includes(d.id));
  const activeDistricts = chosenDistricts.length > 0 ? chosenDistricts : districts.slice(0, 2);

  // Room sharing optimization: 1 room per 2 travelers
  const roomsNeeded = Math.ceil(clampedTravelers / 2);
  const stayInr = tier.stay * roomsNeeded * clampedDays;
  const foodInr = tier.food * clampedTravelers * clampedDays;
  // Shared private cab / local transit scales gently with group size
  const transitVehicles = Math.ceil(clampedTravelers / 4);
  const transitInr = tier.transit * transitVehicles * clampedDays;
  const entryInr = tier.entry * clampedTravelers * clampedDays;
  const subtotal = stayInr + foodInr + transitInr + entryInr;
  const contingencyInr = Math.round(subtotal * 0.08);
  const totalInr = subtotal + contingencyInr;

  const dayPlans = [];
  for (let dayIdx = 0; dayIdx < clampedDays; dayIdx++) {
    const dist = activeDistricts[dayIdx % activeDistricts.length];
    const places = dist.destinations || [];
    const primary = places[0];
    const secondary = places[1] || places[0];

    const morningText = primary
      ? `Morning at ${primary.name} (${primary.category}) — ${primary.shortSummary}`
      : `Explore ${dist.nameEn} heritage precinct`;

    const afternoonText =
      pace === 'Relaxed'
        ? `Leisurely local lunch (${dist.signatureFood.slice(0, 2).join(', ')}) & rest.`
        : secondary && secondary.id !== primary?.id
          ? `Afternoon visit to ${secondary.name}${secondary.isHiddenGem ? ' [Hidden Gem]' : ''} & sample ${dist.signatureFood[0] || 'Odia thali'}.`
          : `Afternoon artisan walk (${dist.craftsAndHandloom[0] || 'local handloom'}) & sample ${dist.signatureFood[0] || 'local delicacies'}.`;

    const eveningText =
      pace === 'Packed'
        ? `Evening experience: ${dist.localExperiences.join(' • ')}.`
        : `Evening: ${dist.localExperiences[0] || 'Sunset cultural stroll'} (Nearest Medical Hub: ${dist.emergencyHospital}).`;

    dayPlans.push({
      dayNumber: dayIdx + 1,
      districtId: dist.id,
      districtName: dist.nameEn,
      morning: morningText,
      afternoon: afternoonText,
      evening: eveningText,
      userNote: ''
    });
  }

  const resolvedTitle =
    title && String(title).trim().length > 0
      ? String(title).trim()
      : `${clampedDays}-Day ${activeDistricts.map((d) => d.nameEn).join(' & ')} Odyssey`;

  return {
    id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: resolvedTitle,
    days: clampedDays,
    budgetStyle,
    pace,
    travelers: clampedTravelers,
    districtsCsv: activeDistricts.map((d) => d.nameEn).join(', '),
    selectedDistrictIds: activeDistricts.map((d) => d.id),
    stayInr,
    foodInr,
    transitInr,
    entryInr,
    contingencyInr,
    totalInr,
    dayPlans,
    createdAtIso: new Date().toISOString(),
    classification: 'Deterministic Planning Estimate (INR)'
  };
}

/**
 * Source-grounded Utkal Mitra concierge engine.
 * Strictly retrieves verified records from UtkalSarathi's 30-district catalog, Katha stories,
 * and GI listings with explicit citations — never fabricates unverified facts.
 */
export function queryCuratedMitraKnowledge(query, districts, stories, culturalListings) {
  const raw = String(query || '').trim();
  if (!raw) {
    return {
      found: false,
      badge: 'Prompt Required',
      answer: 'Enter a question about any Odisha district, temple, waterfall, hidden gem, GI craft, cuisine, or emergency helpline.',
      citations: []
    };
  }

  const q = raw.toLowerCase();
  const tokens = q.split(/\W+/).filter((t) => t.length >= 3);

  // Check emergency / SOS queries immediately
  if (/(sos|emergency|police|ambulance|hospital|helpline|112|108|safety)/.test(q)) {
    return {
      found: true,
      badge: 'Verified Emergency Protocol',
      answer:
        'For immediate police, fire, or traveller distress anywhere in Odisha, dial 112 (National Emergency Response System) or 108 for free emergency ambulance service. Major tertiary trauma centres include AIIMS Bhubaneswar, SCB Medical College (Cuttack), VIMSAR (Burla/Sambalpur), and MKCG Medical College (Berhampur). Always verify cyclone/monsoon alerts at mausam.imd.gov.in and osdma.org.',
      citations: ['Odisha Police Emergency 112', 'OSDMA (osdma.org)', 'IMD (mausam.imd.gov.in)']
    };
  }

  // Score districts
  const scoredDistricts = districts
    .map((d) => {
      let score = 0;
      const hay = [
        d.nameEn,
        d.nameOdia,
        d.nameHindi,
        d.headquarters,
        d.tagline,
        d.historySummary,
        d.cultureAndFestivals,
        ...d.signatureFood,
        ...d.craftsAndHandloom,
        ...d.destinations.map((p) => `${p.name} ${p.category} ${p.shortSummary} ${p.historicalSignificance}`)
      ]
        .join(' ')
        .toLowerCase();

      if (q.includes(d.nameEn.toLowerCase())) score += 12;
      if (q.includes(d.headquarters.toLowerCase().split(' ')[0])) score += 8;
      for (const tok of tokens) {
        if (hay.includes(tok)) score += 2;
      }
      return { district: d, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Score GI / Cultural listings
  const matchedListings = culturalListings.filter((c) => {
    const hay = `${c.title} ${c.type} ${c.description} ${c.authenticLocation}`.toLowerCase();
    return tokens.some((tok) => hay.includes(tok));
  });

  // Hidden gems query
  if (/(hidden gem|offbeat|unexplored|secret|crowd)/.test(q) && scoredDistricts.length === 0) {
    const gems = districts
      .flatMap((d) => d.destinations.filter((p) => p.isHiddenGem).map((p) => `${p.name} (${d.nameEn}) — ${p.shortSummary}`))
      .slice(0, 5);
    return {
      found: true,
      badge: 'Verified Catalog Retrieval',
      answer: `Top offbeat & hidden gems across Odisha:\n• ${gems.join('\n• ')}`,
      citations: ['Odisha State Archaeology', 'Odisha Forest Eco-Tourism (ecotourodisha.com)']
    };
  }

  if (scoredDistricts.length > 0) {
    const top = scoredDistricts[0].district;
    const relatedStory = stories.find((s) => s.districtId === top.id);
    const destLines = top.destinations
      .map(
        (p) =>
          `${p.name}${p.isHiddenGem ? ' [Hidden Gem]' : ''}: ${p.shortSummary} (Best season: ${p.bestSeason}; Hub: ${p.nearestHub})`
      )
      .join('\n• ');

    let response = `${top.nameEn} (${top.nameOdia} / ${top.nameHindi}) — HQ: ${top.headquarters}, ${top.region}.\n\n`;
    response += `Overview: ${top.historySummary}\n\n`;
    response += `Key Destinations:\n• ${destLines}\n\n`;
    response += `Cuisine & GI Crafts: ${top.signatureFood.join(', ')} | Crafts: ${top.craftsAndHandloom.join(', ')}.\n`;
    response += `Transit & Safety: ${top.transportHubs} | Medical: ${top.emergencyHospital}.`;

    if (matchedListings.length > 0) {
      response += `\n\nAuthentic Craft/Stay Note: ${matchedListings[0].title} (${matchedListings[0].giTagStatus}) — ${matchedListings[0].priceGuide}.`;
    }

    const citations = [top.sourceReference, ...top.destinations.map((p) => p.sourceCitation)];
    if (relatedStory) citations.push(relatedStory.sources);

    return {
      found: true,
      badge: 'Source-Grounded Odisha Record',
      answer: response,
      districtId: top.id,
      storyId: relatedStory?.id || null,
      citations: [...new Set(citations)]
    };
  }

  if (matchedListings.length > 0) {
    const item = matchedListings[0];
    return {
      found: true,
      badge: item.verificationLabel,
      answer: `${item.title} (${item.odiaTitle}) — ${item.giTagStatus}.\n\n${item.description}\n\nAuthentic Location: ${item.authenticLocation}\nReference Price Guide: ${item.priceGuide}\nOfficial Portal: ${item.officialEnquiryUrl}`,
      citations: [item.verificationLabel, item.officialEnquiryUrl]
    };
  }

  return {
    found: false,
    badge: 'Unverified / Outside Offline Knowledge Base',
    answer:
      'Utkal Mitra only returns verified records from the UtkalSarathi 30-district Odisha catalog and does not fabricate unverified answers. Try asking about any Odisha district (e.g., Puri, Koraput, Mayurbhanj, Sambalpur, Ganjam, Kendrapara), monuments (Konark, Lingaraj, Ratnagiri), GI crafts (Pattachitra, Tarakasi, Sambalpuri Ikat, Kotpad), or hidden gems.',
    citations: ['UtkalSarathi Epistemic Integrity Guard']
  };
}

export function buildWhatsAppShareUrl(messageText) {
  return `https://wa.me/?text=${encodeURIComponent(String(messageText || '').trim())}`;
}

export function formatWebsiteInviteShare(siteUrl = DEFAULT_SITE_URL) {
  return (
    `🏛️ *UtkalSarathi — Smart Tourism & Safety for Odisha*\n` +
    `Discover Odisha, Your Way (ଓଡ଼ିଆ • हिन्दी • English)\n\n` +
    `✨ Explore all 30 Odisha districts, hidden gems, voice-narrated Utkal Katha stories, INR trip budgets, fair transit estimates & SOS 112 traveller safety:\n` +
    `🌐 ${siteUrl}`
  );
}

export function formatDistrictShare(district, siteUrl = DEFAULT_SITE_URL) {
  const places = district.destinations.map((p) => p.name).join(', ');
  return (
    `📍 *${district.nameEn} (${district.nameOdia}) — Odisha Travel Guide*\n` +
    `${district.tagline}\n\n` +
    `🏛️ Top Places: ${places}\n` +
    `🍲 Must-Try Food: ${district.signatureFood.join(', ')}\n` +
    `🎨 Crafts: ${district.craftsAndHandloom.join(', ')}\n` +
    `🏥 Emergency: ${district.emergencyHospital}\n\n` +
    `Explore on UtkalSarathi: ${siteUrl}/#districts`
  );
}

export function formatTripShare(trip, siteUrl = DEFAULT_SITE_URL) {
  const daysPreview = trip.dayPlans
    .slice(0, 5)
    .map((d) => `Day ${d.dayNumber} (${d.districtName}): ${d.morning}`)
    .join('\n');
  return (
    `🗺️ *${trip.title}*\n` +
    `👥 ${trip.travelers} Traveller(s) • ${trip.days} Day(s) • ${trip.budgetStyle} Tier\n` +
    `💰 Estimated Reference Budget: ₹${trip.totalInr.toLocaleString('en-IN')} (Stay ₹${trip.stayInr.toLocaleString('en-IN')}, Food ₹${trip.foodInr.toLocaleString('en-IN')}, Transit ₹${trip.transitInr.toLocaleString('en-IN')})\n\n` +
    `${daysPreview}\n\n` +
    `Planned via UtkalSarathi: ${siteUrl}/#planner`
  );
}
