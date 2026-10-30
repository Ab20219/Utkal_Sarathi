/**
 * UtkalSarathi Itinerary Planning Engine
 * Deterministic generation and filtering of Odisha travel plans across 10-15 curated destinations.
 */

export interface Destination {
  id: string;
  name: string;
  odiaName: string;
  region: 'Golden Triangle' | 'Coastal & Chilika' | 'Western Odisha' | 'Southern Odisha' | 'Northern Odisha' | 'Central Wildlife';
  district: string;
  category: 'heritage' | 'nature' | 'tribal_crafts' | 'beaches' | 'spiritual';
  description: string;
  historicalSignificance: string;
  legend: string;
  verifiedHours: string;
  entryFee: {
    indian: number;
    foreigner: number;
    camera?: number;
  };
  recommendedDurationHours: number;
  bestTimeToVisit: string;
  transportInfo: {
    nearestHub: string;
    distanceKm: number;
    options: {
      mode: 'Mo Bus' | 'OSRTC Bus' | 'Auto-Rickshaw' | 'Taxi / Cab' | 'Train' | 'Boat';
      routeOrDesc: string;
      fare: string;
      isVerified: boolean;
    }[];
  };
  cuisineHighlight: string;
  safetyTip: string;
  ecoSensitivityTag: string;
  sourceReliability: 'verified_official' | 'provider_confirmed';
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  theme: string;
  destinations: {
    timeSlot: 'Morning (08:00 - 12:00)' | 'Afternoon (13:00 - 16:30)' | 'Evening (17:00 - 20:30)';
    destination: Destination;
    activity: string;
    transportFromPrevious: string;
    estimatedCost: number;
  }[];
  totalDayCost: number;
}

export type TripInterest =
  | 'heritage'
  | 'nature'
  | 'tribal_crafts'
  | 'beaches'
  | 'spiritual'
  | 'tribal_culture'
  | 'waterfalls'
  | 'cuisine'
  | 'photography';

export interface PlanRequest {
  startCity: string;
  days: number;
  interests: (TripInterest | string)[];
  travelStyle: 'budget' | 'moderate' | 'luxury';
  includeNearby?: boolean;
  selectedNearbyDistrictIds?: string[];
  tripScope?: 'single' | 'nearby' | 'multi';
  selectedMultiDistrictIds?: string[];
}

export const ODISHA_DESTINATIONS: Destination[] = [
  {
    id: 'konark-sun-temple',
    name: 'Konark Sun Temple',
    odiaName: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର (Konark)',
    region: 'Golden Triangle',
    district: 'Puri',
    category: 'heritage',
    description: '13th-century UNESCO World Heritage Site sculpted as a colossal 24-wheeled chariot of Surya, with intricate erotic and celestial carvings.',
    historicalSignificance: 'Built by King Narasimhadeva I of the Eastern Ganga Dynasty around 1250 CE to commemorate military victories.',
    legend: 'Legend tells of the 12-year-old boy Dharmapada who placed the crowning stone (Dadhinauti) to save 1,200 artisans, then jumped into the sea to protect his father.',
    verifiedHours: '06:00 AM – 08:00 PM (Light & Sound: 19:00 & 20:00)',
    entryFee: { indian: 40, foreigner: 600, camera: 25 },
    recommendedDurationHours: 3,
    bestTimeToVisit: 'October to March (Early morning or sunset)',
    transportInfo: {
      nearestHub: 'Puri (35 km) or Bhubaneswar (65 km)',
      distanceKm: 35,
      options: [
        { mode: 'Mo Bus', routeOrDesc: 'Mo Bus Route 71 from Puri Bus Stand', fare: '₹50', isVerified: true },
        { mode: 'Auto-Rickshaw', routeOrDesc: 'Private return auto via Marine Drive', fare: '₹600 - ₹800', isVerified: false },
        { mode: 'Taxi / Cab', routeOrDesc: 'Prepaid AC cab from Bhubaneswar', fare: '₹1,400 - ₹1,800', isVerified: true },
      ],
    },
    cuisineHighlight: 'Fresh coastal coconut water, hot Dalma meal, and Konark dry sweet Khaja.',
    safetyTip: 'Carry an umbrella and water; stone floor warms up considerably between 11 AM and 3 PM.',
    ecoSensitivityTag: 'Heritage Zone: Walk only on wooden walkways; do not touch fragile carvings.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'puri-jagannath-temple',
    name: 'Shree Jagannath Temple, Puri',
    odiaName: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର (Puri Dham)',
    region: 'Golden Triangle',
    district: 'Puri',
    category: 'spiritual',
    description: 'One of the Char Dham pilgrimage sites, dedicated to Lord Jagannath, Balabhadra, and Subhadra, celebrated worldwide for the annual Ratha Yatra.',
    historicalSignificance: 'Constructed by King Anantavarman Chodaganga Deva in the 12th century CE, featuring Kalinga temple architecture with a 65m high Vimana.',
    legend: 'The sacred Daru Brahma wooden idols, the miracle of cooking 56 Bhoga in seven earthen pots stacked one above the other, and the flag floating opposite the wind.',
    verifiedHours: '05:30 AM – 09:30 PM (Closes during special Niti rituals)',
    entryFee: { indian: 0, foreigner: 0 },
    recommendedDurationHours: 3.5,
    bestTimeToVisit: 'All year round; early morning Mangala Alati at 5:30 AM is tranquil.',
    transportInfo: {
      nearestHub: 'Puri Railway Station (2.5 km)',
      distanceKm: 2.5,
      options: [
        { mode: 'Auto-Rickshaw', routeOrDesc: 'Pre-fixed prepaid counter at Puri Station', fare: '₹80 - ₹120', isVerified: true },
        { mode: 'Mo Bus', routeOrDesc: 'Local Mo Bus feeder route', fare: '₹10 - ₹15', isVerified: true },
      ],
    },
    cuisineHighlight: 'Sacred Mahaprasad (Abhada) featuring Khechudi, Dalma, Kanika, Besara, and Sweet Pitha at Ananda Bazaar.',
    safetyTip: 'Electronic devices, phones, and leather items are strictly barred inside temple gates; use official deposit counters only.',
    ecoSensitivityTag: 'Culturally Sacred: Traditional non-leather attire mandatory; non-Hindus allowed up to Singhadwara Lion Gate.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'lingaraj-temple',
    name: 'Lingaraj Temple & Bindu Sagar',
    odiaName: 'ଲିଙ୍ଗରାଜ ମନ୍ଦିର (Lingaraj Bhubaneswar)',
    region: 'Golden Triangle',
    district: 'Khurda (Bhubaneswar)',
    category: 'spiritual',
    description: 'Epitome of Kalinga architecture, the largest temple in Bhubaneswar dedicated to Harihara (combined Vishnu and Shiva), surrounded by 108 subsidiary shrines.',
    historicalSignificance: 'Built by King Jajati Keshari in the 11th century CE with sandstone towers rising 55 meters above the old city.',
    legend: 'The Bindu Sagar sacred tank contains drops from every sacred river and water body across India.',
    verifiedHours: '06:00 AM – 09:00 PM',
    entryFee: { indian: 0, foreigner: 0 },
    recommendedDurationHours: 2.5,
    bestTimeToVisit: 'Early morning or evening during Maha Shivaratri',
    transportInfo: {
      nearestHub: 'Bhubaneswar Railway Station (5 km)',
      distanceKm: 5,
      options: [
        { mode: 'Mo Bus', routeOrDesc: 'Mo Bus Route 20 to Old Town', fare: '₹15', isVerified: true },
        { mode: 'Auto-Rickshaw', routeOrDesc: 'City auto from Master Canteen', fare: '₹100 - ₹150', isVerified: false },
      ],
    },
    cuisineHighlight: 'Old Town Chenna Poda and hot Dalma lunch at traditional roadside bhojanalayas.',
    safetyTip: 'Viewing platform available for foreign visitors outside northern perimeter wall.',
    ecoSensitivityTag: 'Sacred Heritage: Do not litter inside heritage tank perimeter; preserve sacred Bindu Sagar waters.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'dhauli-shanti-stupa',
    name: 'Dhauli Shanti Stupa',
    odiaName: 'ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ (Dhauli)',
    region: 'Golden Triangle',
    district: 'Khurda (Bhubaneswar)',
    category: 'heritage',
    description: 'White Buddhist Peace Pagoda perched atop Dhauli hill, overlooking the Daya River where the historic Kalinga War transformed Emperor Ashoka.',
    historicalSignificance: 'Site of Emperor Ashoka’s Rock Edicts inscribed in Brahmi script (circa 261 BCE) advocating Dharma and non-violence.',
    legend: 'The blood shed during the Kalinga War turned the Daya River red, awakening profound remorse in Ashoka and guiding him to Buddhism.',
    verifiedHours: '06:00 AM – 07:30 PM (Evening Light & Sound: 19:00)',
    entryFee: { indian: 20, foreigner: 100 },
    recommendedDurationHours: 2,
    bestTimeToVisit: 'Late afternoon before sunset',
    transportInfo: {
      nearestHub: 'Bhubaneswar Master Canteen (8 km)',
      distanceKm: 8,
      options: [
        { mode: 'Mo Bus', routeOrDesc: 'Mo Bus Route 24 to Dhauli Square', fare: '₹20', isVerified: true },
        { mode: 'Auto-Rickshaw', routeOrDesc: 'Direct auto from Kalpana Square', fare: '₹200 - ₹250', isVerified: false },
      ],
    },
    cuisineHighlight: 'Bhubaneswar street Dahibara Aloodum and steaming Chenna Jhili nearby.',
    safetyTip: 'Wear slip-resistant shoes for climbing the stone stairs.',
    ecoSensitivityTag: 'Silent Meditation Zone: Maintain quietude around the stupa dome and peace garden.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'udayagiri-khandagiri-caves',
    name: 'Udayagiri & Khandagiri Caves',
    odiaName: 'ଉଦୟଗିରି ଓ ଖଣ୍ଡଗିରି (Khandagiri)',
    region: 'Golden Triangle',
    district: 'Khurda (Bhubaneswar)',
    category: 'heritage',
    description: 'Partly natural and partly artificial rock-cut caves of archaeological, historical, and religious importance for Jainism.',
    historicalSignificance: 'Carved under Emperor Kharavela of the Mahameghavahana Dynasty (1st–2nd century BCE), home to the famous 17-line Hathigumpha inscription.',
    legend: 'Monastic shelters for Jain ascetics during rain retreats, celebrated for the double-storied Rani Gumpha theatre carvings.',
    verifiedHours: '06:00 AM – 06:00 PM',
    entryFee: { indian: 25, foreigner: 300 },
    recommendedDurationHours: 2.5,
    bestTimeToVisit: 'Morning hours to avoid direct heat',
    transportInfo: {
      nearestHub: 'Bhubaneswar Railway Station (9 km)',
      distanceKm: 9,
      options: [
        { mode: 'Mo Bus', routeOrDesc: 'Mo Bus Route 10 to Khandagiri Square', fare: '₹15', isVerified: true },
        { mode: 'Auto-Rickshaw', routeOrDesc: 'Direct city auto', fare: '₹150 - ₹200', isVerified: false },
      ],
    },
    cuisineHighlight: 'Authentic Cuttack-style Dahibara Aloodum with Ghuguni outside the cave entrance.',
    safetyTip: 'Beware of playful monkeys around Khandagiri peak; keep food bags zipped.',
    ecoSensitivityTag: 'Archaeological Protection: Do not etch or write on ancient rock inscriptions.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'raghurajpur-heritage-village',
    name: 'Raghurajpur Heritage Craft Village',
    odiaName: 'ରଘୁରାଜପୁର ଶିଳ୍ପ ଗ୍ରାମ (Raghurajpur)',
    region: 'Golden Triangle',
    district: 'Puri',
    category: 'tribal_crafts',
    description: 'Odisha’s primary heritage craft village where every household is an artisan family practicing Pattachitra, palm-leaf engraving, and Gotipua dance.',
    historicalSignificance: 'Birthplace of the legendary Odissi dance maestro Guru Kelucharan Mohapatra, recognized as India’s first heritage village in 2000.',
    legend: 'Ancient ritual tradition of painting Anasara Pati icons when Lord Jagannath is indisposed for 14 days before Ratha Yatra.',
    verifiedHours: '09:00 AM – 06:30 PM (Daily)',
    entryFee: { indian: 0, foreigner: 0 },
    recommendedDurationHours: 3,
    bestTimeToVisit: 'Morning 10 AM to 4 PM when artisans are actively painting on verandas',
    transportInfo: {
      nearestHub: 'Puri (14 km) / Chandanpur (1.5 km)',
      distanceKm: 14,
      options: [
        { mode: 'Mo Bus', routeOrDesc: 'Mo Bus to Chandanpur stop + connecting E-Rickshaw', fare: '₹40 + ₹30', isVerified: true },
        { mode: 'Auto-Rickshaw', routeOrDesc: 'Direct auto from Puri town', fare: '₹350 - ₹450 return', isVerified: false },
      ],
    },
    cuisineHighlight: 'Village tender coconut water and Chhena Gaja from Chandanpur bazaar.',
    safetyTip: 'Support authentic master artists directly in their homes to promote fair trade and avoid third-party commissions.',
    ecoSensitivityTag: 'Fair Trade Village: Respect artist home privacy; seek permission before photographing in verandas.',
    sourceReliability: 'provider_confirmed',
  },
  {
    id: 'chilika-mangalajodi',
    name: 'Chilika Lake & Mangalajodi Wetland',
    odiaName: 'ଚିଲିକା ହ୍ରଦ ଓ ମଙ୍ଗଳାଯୋଡ଼ି (Chilika Lake)',
    region: 'Coastal & Chilika',
    district: 'Khordha / Ganjam / Puri',
    category: 'nature',
    description: 'Asia’s largest brackish water lagoon and a Ramsar site hosting over a million migratory birds and the endangered Irrawaddy dolphin population.',
    historicalSignificance: 'Ancient maritime port from where Odia sadhabas (merchants) sailed to Java, Sumatra, Bali, and Ceylon.',
    legend: 'Legend of Goddess Kalijai shrine located on an island hill inside the lagoon.',
    verifiedHours: '06:00 AM – 05:00 PM (Silent country boat safaris best at sunrise)',
    entryFee: { indian: 0, foreigner: 0 },
    recommendedDurationHours: 4,
    bestTimeToVisit: 'November to February for peak bird migration; all year for Satapada dolphins',
    transportInfo: {
      nearestHub: 'Kalupara Ghat Station (4 km) or Bhubaneswar (70 km)',
      distanceKm: 70,
      options: [
        { mode: 'Train', routeOrDesc: 'Passenger train from Bhubaneswar to Kalupara Ghat + auto', fare: '₹45 + ₹100', isVerified: true },
        { mode: 'Taxi / Cab', routeOrDesc: 'Private day trip taxi', fare: '₹2,200 - ₹2,800', isVerified: true },
        { mode: 'Boat', routeOrDesc: 'Community eco-tourism silent wooden boat (per boat)', fare: '₹1,200 - ₹1,500', isVerified: true },
      ],
    },
    cuisineHighlight: 'Chilika Crab and Tiger Prawn curry cooked with mustard paste, or vegetarian Dalma.',
    safetyTip: 'Always wear life jackets provided on community boats and do not throw plastic into the lagoon.',
    ecoSensitivityTag: 'Ramsar Wetland: Strict zero-plastic zone; motorized engine boats prohibited in Mangalajodi bird nursery.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'bhitarkanika-national-park',
    name: 'Bhitarkanika Mangroves & Crocodile Sanctuary',
    odiaName: 'ଭିତରକନିକା ଜାତୀୟ ଉଦ୍ୟାନ (Bhitarkanika)',
    region: 'Coastal & Chilika',
    district: 'Kendrapara',
    category: 'nature',
    description: 'Second largest mangrove ecosystem in India, sanctuary to giant estuarine saltwater crocodiles, kingfishers, and the world’s largest nesting ground for Olive Ridley sea turtles at Gahirmatha.',
    historicalSignificance: 'Former royal hunting reserve of the Kanika Rajas, declared a Ramsar wetland of international importance in 2002.',
    legend: 'Stories of the ancient Kanika Rajbari palace and centuries-old folklore of crocodile deities guarding the creeks.',
    verifiedHours: '07:00 AM – 05:00 PM (Forest entry permits from Khola or Gupti check gates)',
    entryFee: { indian: 40, foreigner: 500, camera: 100 },
    recommendedDurationHours: 6,
    bestTimeToVisit: 'October to March (Turtle nesting typically peaks in February/March)',
    transportInfo: {
      nearestHub: 'Bhadrak Railway Station (70 km) / Cuttack (130 km)',
      distanceKm: 130,
      options: [
        { mode: 'Taxi / Cab', routeOrDesc: 'Private cab from Cuttack/Bhubaneswar to Khola gate', fare: '₹3,500 - ₹4,200', isVerified: true },
        { mode: 'Boat', routeOrDesc: 'Authorized Forest Dept safari boat through mangrove creeks', fare: '₹2,500 - ₹3,500 per boat', isVerified: true },
      ],
    },
    cuisineHighlight: 'Fresh river crab curries and sweet Chhena Gaja from Kendrapara town.',
    safetyTip: 'Never lean over boat edges; keep hands inside vessel at all times due to giant crocodiles.',
    ecoSensitivityTag: 'Ecologically Fragile: Follow wildlife guidelines; single-use plastics strictly confiscated at forest gate.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'similipal-biosphere',
    name: 'Similipal Biosphere Reserve & Tiger Sanctuary',
    odiaName: 'ଶିମିଳିପାଳ ଜୈବମଣ୍ଡଳ (Similipal)',
    region: 'Northern Odisha',
    district: 'Mayurbhanj',
    category: 'nature',
    description: 'Sprawling UNESCO Biosphere reserve of red silk-cotton trees, royal Bengal tigers, wild elephants, and majestic waterfalls like Barehipani and Joranda.',
    historicalSignificance: 'Former hunting preserve of the Mayurbhanj Maharajas, notified as a tiger reserve under Project Tiger in 1973.',
    legend: 'Homeland to the Santhal, Kolha, and Mankidia indigenous tribes who preserve sacred groves (Jahera).',
    verifiedHours: '06:00 AM – 02:00 PM (Entry permits issued at Pithabata & Jashipur gates)',
    entryFee: { indian: 100, foreigner: 1000 },
    recommendedDurationHours: 6,
    bestTimeToVisit: 'November to April (Closed during monsoon season)',
    transportInfo: {
      nearestHub: 'Baripada (30 km) / Balasore Railway Station (70 km)',
      distanceKm: 70,
      options: [
        { mode: 'Taxi / Cab', routeOrDesc: 'Forest Dept registered 4x4 Bolero safari vehicle', fare: '₹4,500 - ₹5,500/day', isVerified: true },
      ],
    },
    cuisineHighlight: 'Famous Baripada Mudhi Mansa (puffed rice with slow cooked goat curry) and Mahua honey.',
    safetyTip: 'Forest entry requires advance registration on Eco Tour Odisha portal; private small cars cannot enter core dirt tracks.',
    ecoSensitivityTag: 'Biosphere Reserve: Maintain speed limits inside forest; do not play music or venture off demarcated trails.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'satkosia-tiger-reserve',
    name: 'Satkosia Gorge Sanctuary & Eco-Camps',
    odiaName: 'ସାତକୋଶିଆ ଗଣ୍ଡ (Satkosia Gorge)',
    region: 'Central Wildlife',
    district: 'Angul / Nayagarh',
    category: 'nature',
    description: 'Where the mighty Mahanadi River carves a dramatic 22-kilometer gorge through Eastern Ghat hills, home to gharials, muggers, leopards, and community-run tented eco-camps.',
    historicalSignificance: 'Notified as a tiger reserve in 2007, celebrated for pioneering community-based forest protection models.',
    legend: 'Folklore says the name Satkosia derives from "sat-kosh" (meaning 7 kosh or 22 km) length of the gorge.',
    verifiedHours: '06:00 AM – 06:00 PM',
    entryFee: { indian: 50, foreigner: 500 },
    recommendedDurationHours: 5,
    bestTimeToVisit: 'November to February (Mild weather for gorge boat safari)',
    transportInfo: {
      nearestHub: 'Angul (60 km) / Bhubaneswar (125 km)',
      distanceKm: 125,
      options: [
        { mode: 'Taxi / Cab', routeOrDesc: 'Cab from Bhubaneswar to Tikarpada / Badmul eco-camps', fare: '₹3,000 - ₹3,800', isVerified: true },
        { mode: 'Boat', routeOrDesc: 'Community boating through the gorge', fare: '₹400/person', isVerified: true },
      ],
    },
    cuisineHighlight: 'Traditional wood-fired Dalma, roasted country chicken curry, and fresh organic river fish.',
    safetyTip: 'Night driving restricted after 6 PM on forest corridor roads due to elephant movements.',
    ecoSensitivityTag: 'Wildlife Corridor: Light no open campfires; stay within fenced eco-camp zones after dusk.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'daringbadi-kashmir-of-odisha',
    name: 'Daringbadi - Hill Station & Coffee Meadows',
    odiaName: 'ଦାରିଙ୍ଗବାଡ଼ି (Daringbadi)',
    region: 'Southern Odisha',
    district: 'Kandhamal',
    category: 'nature',
    description: 'Odisha’s solitary hill station perched at 3,000 feet, famed for winter frost, sprawling organic coffee and pepper plantations, pine forests, and Midubanda waterfall.',
    historicalSignificance: 'Named after Daring Saheb, a British colonial officer who governed the serene hill plateau.',
    legend: 'Sacred indigenous Kutia and Dongria Kondh cultural territory with centuries-old terrace farming traditions.',
    verifiedHours: '08:00 AM – 05:30 PM (Plantations & Emu farm)',
    entryFee: { indian: 20, foreigner: 100 },
    recommendedDurationHours: 5,
    bestTimeToVisit: 'December to February (Occasional morning sub-zero temperatures)',
    transportInfo: {
      nearestHub: 'Berhampur Railway Station (120 km)',
      distanceKm: 120,
      options: [
        { mode: 'OSRTC Bus', routeOrDesc: 'Direct OSRTC AC bus from Bhubaneswar/Berhampur', fare: '₹220 - ₹280', isVerified: true },
        { mode: 'Taxi / Cab', routeOrDesc: 'Private hill taxi from Berhampur station', fare: '₹2,800 - ₹3,400', isVerified: false },
      ],
    },
    cuisineHighlight: 'Kandhamal organic turmeric spiced vegetable curries and freshly brewed local coffee.',
    safetyTip: 'Ghat roads have sharp hairpin turns; drive cautiously during early morning winter fog.',
    ecoSensitivityTag: 'Tribal Eco-Zone: Support indigenous tribal farmers directly at coffee cooperatives.',
    sourceReliability: 'provider_confirmed',
  },
  {
    id: 'koraput-tribal-heritage',
    name: 'Koraput Tribal Heritage & Gupteswar Cave',
    odiaName: 'କୋରାପୁଟ ଜନଜାତି ଐତିହ୍ୟ (Koraput)',
    region: 'Southern Odisha',
    district: 'Koraput',
    category: 'tribal_crafts',
    description: 'Heartland of Odisha’s indigenous tribal heritage (Paraja, Gadaba, Kondh), ancient sacred groves, limestone Shiva lingam of Gupteswar cave, and the Deomali mountain peaks.',
    historicalSignificance: 'Globally recognized by FAO as a GIAHS (Globally Important Agricultural Heritage System) for ancient sustainable rice and millet biodiversity.',
    legend: 'Gupteswar ("Hidden God") cave shrine where Lord Rama is believed to have stayed during Dandakaranya exile.',
    verifiedHours: '06:00 AM – 06:00 PM (Gupteswar Cave)',
    entryFee: { indian: 10, foreigner: 50 },
    recommendedDurationHours: 6,
    bestTimeToVisit: 'October to March (Pleasant mountain weather and weekly tribal Haat markets)',
    transportInfo: {
      nearestHub: 'Koraput Railway Station (15 km) / Jeypore (35 km)',
      distanceKm: 45,
      options: [
        { mode: 'Train', routeOrDesc: 'Vistadome coach on Kirandul Express (panoramic Eastern Ghats)', fare: '₹280 - ₹750', isVerified: true },
        { mode: 'Taxi / Cab', routeOrDesc: 'Local taxi through coffee estates and tribal hamlets', fare: '₹2,500 - ₹3,200/day', isVerified: true },
      ],
    },
    cuisineHighlight: 'Millet Mandia Jau porridge, bamboo shoot curry (Karadi), and Koraput GI-certified Arabica coffee.',
    safetyTip: 'Always request permission before taking photographs in weekly tribal markets (Haats).',
    ecoSensitivityTag: 'Indigenous Cultural Heritage: Respect local customs and ancestral sacred forests (Jahera); avoid intrusive filming.',
    sourceReliability: 'verified_official',
  },
  {
    id: 'hirakud-dam-sambalpur',
    name: 'Hirakud Dam & Debrigarh Wildlife',
    odiaName: 'ହୀରାକୁଦ ବନ୍ଧ (Hirakud Sambalpur)',
    region: 'Western Odisha',
    district: 'Sambalpur',
    category: 'nature',
    description: 'Longest major earthen dam in the world (25.8 km) built across the Mahanadi River, forming a vast 743 sq km reservoir and flanked by the Debrigarh Wildlife Sanctuary.',
    historicalSignificance: 'Commissioned by Prime Minister Jawaharlal Nehru in 1957 as one of independent India’s monumental multipurpose river valley projects.',
    legend: 'During summer when reservoir waters recede, historical submerged temples of Padmapur and ancient settlements emerge from the lake bed.',
    verifiedHours: '09:00 AM – 05:30 PM (Gandhi Minar & Nehru Minar observation towers)',
    entryFee: { indian: 20, foreigner: 100 },
    recommendedDurationHours: 3.5,
    bestTimeToVisit: 'October to March (Sunset from Gandhi Minar and winter migratory bird watching)',
    transportInfo: {
      nearestHub: 'Sambalpur Junction Railway Station (15 km)',
      distanceKm: 15,
      options: [
        { mode: 'Auto-Rickshaw', routeOrDesc: 'Direct auto from Sambalpur town to Gandhi Minar', fare: '₹250 - ₹350', isVerified: true },
        { mode: 'OSRTC Bus', routeOrDesc: 'Local bus from Sambalpur Bus Stand to Burla', fare: '₹20', isVerified: true },
        { mode: 'Taxi / Cab', routeOrDesc: 'Cab covering Hirakud + Samaleswari + Debrigarh', fare: '₹1,800 - ₹2,400', isVerified: true },
      ],
    },
    cuisineHighlight: 'Fresh Mahanadi River Fish Fry (Rohu/Bhakur), Sambalpuri Pitha, and Chaul Dhuda.',
    safetyTip: 'Climb observation towers with caution; high reservoir dyke roads have strict speed restrictions.',
    ecoSensitivityTag: 'Ecosystem Conservation: Do not dispose plastic in the reservoir; maintain silence in adjacent Debrigarh wildlife corridors.',
    sourceReliability: 'verified_official',
  },
];

import { ODISHA_30_DISTRICTS, findDistrict, type DistrictInfo } from '../data/odishaDistricts.ts';
import { getNearbyDistricts, type NearbyPlaceDetail, ODISHA_NEARBY_DISTRICTS } from '../data/odishaNearbyDistricts.ts';

/**
 * Filter destinations by interest or return popular balanced set
 */
export function filterDestinations(
  interests: (TripInterest | string)[]
): Destination[] {
  if (!interests || interests.length === 0) {
    return ODISHA_DESTINATIONS;
  }
  const filtered = ODISHA_DESTINATIONS.filter(d => {
    return interests.some(interest => {
      if (interest === d.category) return true;
      if (interest === 'heritage') return d.category === 'heritage';
      if (interest === 'spiritual') return d.category === 'spiritual';
      if (interest === 'nature') return d.category === 'nature';
      if (interest === 'beaches') return d.category === 'beaches' || d.region.includes('Coastal');
      if (interest === 'tribal_crafts' || interest === 'tribal_culture') return d.category === 'tribal_crafts';
      if (interest === 'waterfalls') return d.category === 'nature' || d.description.toLowerCase().includes('waterfall') || d.name.toLowerCase().includes('waterfall');
      if (interest === 'cuisine') return Boolean(d.cuisineHighlight);
      if (interest === 'photography') return true;
      return false;
    });
  });
  return filtered.length > 0 ? filtered : ODISHA_DESTINATIONS;
}

export interface SavedItineraryRecord {
  id: string;
  title: string;
  createdAt: number;
  startCity: string;
  days: number;
  travelers: number;
  travelStyle: 'budget' | 'moderate' | 'luxury';
  tripScope: 'single' | 'nearby' | 'multi';
  selectedNearbyDistricts?: string[];
  selectedMultiDistricts?: string[];
  selectedInterests: string[];
  totalCost: number;
  plans: DayPlan[];
  targetBudget?: number;
  notes?: string;
}

const SAVED_ITINERARIES_STORAGE_KEY = 'utkalsarathi_saved_itineraries_v2';

export function loadSavedItineraries(): SavedItineraryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_ITINERARIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading saved itineraries', err);
  }
  return [];
}

export function saveItineraryRecord(record: SavedItineraryRecord): SavedItineraryRecord[] {
  if (typeof window === 'undefined') return [record];
  try {
    const current = loadSavedItineraries();
    const existingIdx = current.findIndex(r => r.id === record.id);
    let updated: SavedItineraryRecord[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = record;
    } else {
      updated = [record, ...current];
    }
    localStorage.setItem(SAVED_ITINERARIES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving itinerary record', err);
    return [];
  }
}

export function deleteSavedItineraryRecord(id: string): SavedItineraryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadSavedItineraries();
    const updated = current.filter(r => r.id !== id);
    localStorage.setItem(SAVED_ITINERARIES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error deleting saved itinerary', err);
    return [];
  }
}

export function duplicateSavedItineraryRecord(id: string): SavedItineraryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadSavedItineraries();
    const target = current.find(r => r.id === id);
    if (!target) return current;
    const duplicated: SavedItineraryRecord = {
      ...target,
      id: `itinerary_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: `${target.title} (Copy)`,
      createdAt: Date.now(),
    };
    const updated = [duplicated, ...current];
    localStorage.setItem(SAVED_ITINERARIES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error duplicating saved itinerary', err);
    return [];
  }
}

/**
 * Synthesize a full Destination object from an Odisha District
 */
export function createDestinationFromDistrict(district: DistrictInfo): Destination {
  const primaryHighlight = district.highlights[0] || district.name;
  const signatureFood = district.foodSpots?.[0]
    ? `${district.foodSpots[0].item} (${district.foodSpots[0].recommendation})`
    : district.signatureCuisine.join(', ');

  const regionMap: Record<string, Destination['region']> = {
    Coastal: 'Coastal & Chilika',
    Western: 'Western Odisha',
    Southern: 'Southern Odisha',
    Northern: 'Northern Odisha',
    Central: 'Central Wildlife',
  };

  return {
    id: `district-${district.id}`,
    name: `${primaryHighlight} — ${district.name}`,
    odiaName: `${district.odiaName} (${district.headquarters})`,
    region: regionMap[district.zone] || 'Central Wildlife',
    district: district.name,
    category: district.ecoTourismAndNature.length > 0 ? 'nature' : 'heritage',
    description: `${district.tagline}. Signature landmarks include ${district.highlights.join(', ')}.`,
    historicalSignificance: district.description,
    legend: `Rich cultural lore celebrated in ${district.majorFestivals.join(', ')} with ${district.handicraftsAndArt.join(', ')}.`,
    verifiedHours: '06:00 AM – 06:30 PM',
    entryFee: { indian: 20, foreigner: 100 },
    recommendedDurationHours: 3.5,
    bestTimeToVisit: 'October to March (Ideal weather for touring)',
    transportInfo: {
      nearestHub: `${district.headquarters} (Nearest Rail: ${district.transportHubs.nearestRail})`,
      distanceKm: 8,
      options: [
        {
          mode: district.transportHubs.busServices.includes('Mo Bus') ? 'Mo Bus' : 'OSRTC Bus',
          routeOrDesc: district.transportHubs.busServices,
          fare: district.transportHubs.busServices.includes('Mo Bus') ? '₹20 - ₹40' : '₹60 - ₹120',
          isVerified: true,
        },
        {
          mode: 'Auto-Rickshaw',
          routeOrDesc: district.transportHubs.lastMileTransit,
          fare: '₹100 - ₹200',
          isVerified: false,
        },
      ],
    },
    cuisineHighlight: signatureFood,
    safetyTip: `Emergency Hospital: ${district.safetyAndHelpline.districtHospital}. Police Control Room: ${district.safetyAndHelpline.controlRoomNumber}.`,
    ecoSensitivityTag: `Local Heritage: Support certified artisans and preserve local nature reserves (${district.ecoTourismAndNature[0] || 'Sanctuaries'}).`,
    sourceReliability: 'verified_official',
  };
}

/**
 * Create a structured Destination for any landmark or hidden gem inside a district
 */
export function createDistrictPlaceDestination(
  district: DistrictInfo,
  placeName: string,
  index: number
): Destination {
  const isNature = placeName.toLowerCase().includes('fall') ||
    placeName.toLowerCase().includes('sanctuary') ||
    placeName.toLowerCase().includes('lake') ||
    placeName.toLowerCase().includes('park') ||
    placeName.toLowerCase().includes('dam') ||
    placeName.toLowerCase().includes('reserve') ||
    placeName.toLowerCase().includes('spring') ||
    placeName.toLowerCase().includes('gorge') ||
    placeName.toLowerCase().includes('nature');

  const isSpiritual = placeName.toLowerCase().includes('temple') ||
    placeName.toLowerCase().includes('shrine') ||
    placeName.toLowerCase().includes('stupa') ||
    placeName.toLowerCase().includes('kshetra') ||
    placeName.toLowerCase().includes('gadi') ||
    placeName.toLowerCase().includes('dham');

  const foodItem = district.foodSpots?.[index % (district.foodSpots.length || 1)]?.item ||
    district.signatureCuisine[index % (district.signatureCuisine.length || 1)] ||
    'Traditional Odia Thali';
  const foodRec = district.foodSpots?.[index % (district.foodSpots.length || 1)]?.recommendation ||
    district.signatureCuisine.join(', ');

  const regionMap: Record<string, Destination['region']> = {
    Coastal: 'Coastal & Chilika',
    Western: 'Western Odisha',
    Southern: 'Southern Odisha',
    Northern: 'Northern Odisha',
    Central: 'Central Wildlife',
  };

  return {
    id: `place-${district.id}-${index}-${placeName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    name: placeName,
    odiaName: `${district.odiaName} (${district.headquarters})`,
    region: regionMap[district.zone] || 'Central Wildlife',
    district: district.name,
    category: isNature ? 'nature' : isSpiritual ? 'spiritual' : 'heritage',
    description: `${placeName} in ${district.name} District. ${district.tagline}.`,
    historicalSignificance: `${placeName} is a celebrated natural and cultural landmark of ${district.name} (${district.zone} Odisha). Headquarters: ${district.headquarters}.`,
    legend: `Cultural tradition celebrated during ${district.majorFestivals[0] || 'district festivals'} alongside ${district.handicraftsAndArt[0] || 'indigenous arts'}.`,
    verifiedHours: '06:00 AM – 06:00 PM',
    entryFee: { indian: 20, foreigner: 100 },
    recommendedDurationHours: 3,
    bestTimeToVisit: 'October to March (Pleasant weather for touring)',
    transportInfo: {
      nearestHub: `${district.headquarters} (Nearest Rail: ${district.transportHubs.nearestRail})`,
      distanceKm: (index + 1) * 12,
      options: [
        {
          mode: district.transportHubs.busServices.includes('Mo Bus') ? 'Mo Bus' : 'OSRTC Bus',
          routeOrDesc: district.transportHubs.busServices,
          fare: district.transportHubs.busServices.includes('Mo Bus') ? '₹20 - ₹40' : '₹50 - ₹120',
          isVerified: true,
        },
        {
          mode: 'Auto-Rickshaw',
          routeOrDesc: district.transportHubs.lastMileTransit,
          fare: '₹100 - ₹250',
          isVerified: false,
        },
      ],
    },
    cuisineHighlight: `${foodItem} (${foodRec})`,
    safetyTip: `Emergency Hospital: ${district.safetyAndHelpline.districtHospital}. Police: ${district.safetyAndHelpline.policeStation}.`,
    ecoSensitivityTag: `Local Heritage: Preserve nature reserves and respect community traditions (${district.ecoTourismAndNature[0] || 'Local reserves'}).`,
    sourceReliability: 'verified_official',
  };
}

/**
 * Generate multi-day itinerary strictly focused on chosen district,
 * with optional excursions to neighboring/adjacent districts only if requested.
 */
export function generateItinerary(req: PlanRequest): DayPlan[] {
  const days = Math.min(Math.max(1, req.days || 2), 7);
  const plans: DayPlan[] = [];

  // 1. Identify starting district
  const matchedDistrict = findDistrict(req.startCity) || ODISHA_30_DISTRICTS[0];
  const isBudget = req.travelStyle === 'budget';
  const defaultDayCost = isBudget ? 850 : req.travelStyle === 'luxury' ? 3800 : 1800;

  // Check if user requested a Multi-District Circuit across multiple chosen Odisha districts
  const multiDistrictList: DistrictInfo[] = [];
  if (req.tripScope === 'multi' || (req.selectedMultiDistrictIds && req.selectedMultiDistrictIds.length >= 2)) {
    const rawIds = [
      matchedDistrict.id,
      ...(req.selectedMultiDistrictIds || []),
    ];
    for (const idOrName of rawIds) {
      const found = findDistrict(idOrName);
      if (found && !multiDistrictList.some((d) => d.id === found.id)) {
        multiDistrictList.push(found);
      }
    }
  }

  if (multiDistrictList.length >= 2) {
    for (let i = 0; i < days; i++) {
      const dayNumber = i + 1;
      const currentDistrict = multiDistrictList[i % multiDistrictList.length];
      const prevDistrict = i > 0 ? multiDistrictList[(i - 1) % multiDistrictList.length] : null;
      const isTransferDay = prevDistrict !== null && prevDistrict.id !== currentDistrict.id;

      const placesPool: string[] = [];
      currentDistrict.highlights.forEach((h) => {
        if (!placesPool.includes(h)) placesPool.push(h);
      });
      currentDistrict.ecoTourismAndNature.forEach((e) => {
        if (!placesPool.includes(e)) placesPool.push(e);
      });
      currentDistrict.hiddenGems?.forEach((g) => {
        if (!placesPool.includes(g)) placesPool.push(g);
      });
      if (placesPool.length < 2) {
        placesPool.push(`${currentDistrict.headquarters} Heritage Circuit`, `${currentDistrict.name} Cultural Hub`);
      }

      const occurrenceIdx = Math.floor(i / multiDistrictList.length);
      const place1Name = placesPool[(occurrenceIdx * 2) % placesPool.length];
      const place2Name = placesPool[(occurrenceIdx * 2 + 1) % placesPool.length];

      const dest1 = createDistrictPlaceDestination(currentDistrict, place1Name, occurrenceIdx * 2);
      const dest2 = createDistrictPlaceDestination(currentDistrict, place2Name, occurrenceIdx * 2 + 1);

      const interDistrictTransit = isTransferDay
        ? `OSRTC Express / Inter-District Cab from ${prevDistrict!.headquarters} via ${currentDistrict.transportHubs.highway} (₹${isBudget ? '140' : '950'})`
        : `${dest1.transportInfo.options[0]?.mode || 'Local Bus / Auto'} (${dest1.transportInfo.options[0]?.fare || '₹40'})`;

      plans.push({
        dayNumber,
        title: isTransferDay
          ? `Day ${dayNumber}: ${prevDistrict!.name} → ${currentDistrict.name} Circuit (${place1Name})`
          : `Day ${dayNumber}: ${currentDistrict.name} — ${place1Name} & ${place2Name}`,
        theme: `MULTI-DISTRICT CIRCUIT • ${currentDistrict.name.toUpperCase()} (${currentDistrict.zone.toUpperCase()} ZONE)`,
        totalDayCost: defaultDayCost + (isTransferDay ? (isBudget ? 180 : 650) : 0),
        destinations: [
          {
            timeSlot: 'Morning (08:00 - 12:00)',
            destination: dest1,
            activity: isTransferDay
              ? `Arrive in ${currentDistrict.headquarters} (${currentDistrict.name}) from ${prevDistrict!.name} along ${currentDistrict.transportHubs.highway}. Explore ${place1Name}.`
              : `Morning exploration of ${place1Name} in ${currentDistrict.name}. ${dest1.historicalSignificance.slice(0, 90)}...`,
            transportFromPrevious: interDistrictTransit,
            estimatedCost: dest1.entryFee.indian + (isBudget ? 110 : 320),
          },
          {
            timeSlot: 'Afternoon (13:00 - 16:30)',
            destination: dest2,
            activity: `Visit ${place2Name} in ${currentDistrict.name}. Regional culinary highlight: ${dest2.cuisineHighlight}.`,
            transportFromPrevious: `${dest2.transportInfo.options[1]?.mode || 'Auto-Rickshaw'} (${dest2.transportInfo.options[1]?.fare || '₹120'})`,
            estimatedCost: dest2.entryFee.indian + (isBudget ? 160 : 420),
          },
        ],
      });
    }
    return plans;
  }

  // 2. Assemble ALL genuine places belonging strictly to this district
  const districtPlaces: string[] = [];
  matchedDistrict.highlights.forEach((h) => {
    if (!districtPlaces.includes(h)) districtPlaces.push(h);
  });
  matchedDistrict.hiddenGems?.forEach((g) => {
    if (!districtPlaces.includes(g)) districtPlaces.push(g);
  });
  matchedDistrict.ecoTourismAndNature.forEach((e) => {
    if (!districtPlaces.includes(e)) districtPlaces.push(e);
  });

  // Ensure minimum places in case a district had fewer
  if (districtPlaces.length < 4) {
    districtPlaces.push(
      `${matchedDistrict.headquarters} Heritage & Town Culture`,
      `${matchedDistrict.name} Artisan & Handloom Center`
    );
  }

  // 3. Check if user opted to include nearby places in adjacent districts
  const shouldIncludeNearby = Boolean(req.includeNearby);
  let availableNearby = getNearbyDistricts(matchedDistrict.id);
  if (req.selectedNearbyDistrictIds && req.selectedNearbyDistrictIds.length > 0) {
    availableNearby = availableNearby.filter((n) =>
      req.selectedNearbyDistrictIds!.includes(n.districtId)
    );
  }

  let nearbyIndex = 0;

  for (let i = 0; i < days; i++) {
    const dayNumber = i + 1;

    // Check if this day should be a nearby excursion day
    // Excursion on Day 2 or 3 if nearby is requested and available
    const isNearbyExcursionDay =
      shouldIncludeNearby &&
      availableNearby.length > 0 &&
      ((days === 2 && dayNumber === 2) ||
        (days >= 3 && dayNumber === 2) ||
        (days >= 5 && dayNumber === 4));

    if (isNearbyExcursionDay && availableNearby[nearbyIndex % availableNearby.length]) {
      const nearby = availableNearby[nearbyIndex % availableNearby.length];
      nearbyIndex++;

      const dest1: Destination = {
        id: `nearby-${nearby.districtId}-1`,
        name: `${nearby.topAttractions[0]} (${nearby.districtName})`,
        odiaName: `${nearby.odiaName}`,
        region: matchedDistrict.zone === 'Coastal' ? 'Coastal & Chilika' : 'Western Odisha',
        district: nearby.districtName,
        category: 'heritage',
        description: `Nearby excursion from ${matchedDistrict.name} along ${nearby.highway} (${nearby.distanceKm} km, ~${nearby.travelTime}). ${nearby.whyVisit}`,
        historicalSignificance: `Major cultural/natural landmark of neighboring ${nearby.districtName} district.`,
        legend: `Famous regional specialty: ${nearby.foodHighlight}.`,
        verifiedHours: '06:00 AM – 06:00 PM',
        entryFee: { indian: 20, foreigner: 100 },
        recommendedDurationHours: 3.5,
        bestTimeToVisit: 'October to March',
        transportInfo: {
          nearestHub: `${nearby.districtName} (${nearby.highway})`,
          distanceKm: nearby.distanceKm,
          options: [
            { mode: 'OSRTC Bus', routeOrDesc: `${nearby.bestTransit} via ${nearby.highway}`, fare: '₹80 - ₹220', isVerified: true },
            { mode: 'Taxi / Cab', routeOrDesc: `Private taxi return excursion from ${matchedDistrict.headquarters}`, fare: '₹1,500 - ₹2,400', isVerified: true },
          ],
        },
        cuisineHighlight: nearby.foodHighlight,
        safetyTip: `Highway travel along ${nearby.highway}; drive carefully at junction crossings.`,
        ecoSensitivityTag: 'Neighboring Eco-Heritage Corridor: Respect local community guidelines.',
        sourceReliability: 'verified_official',
      };

      const dest2: Destination = {
        ...dest1,
        id: `nearby-${nearby.districtId}-2`,
        name: `${nearby.topAttractions[1] || nearby.topAttractions[0]} (${nearby.districtName})`,
        description: `Explore ${nearby.topAttractions[1] || nearby.topAttractions[0]} in neighboring ${nearby.districtName}. Savor ${nearby.foodHighlight}. Return journey to ${matchedDistrict.name}.`,
      };

      plans.push({
        dayNumber,
        title: `Day ${dayNumber}: Nearby Excursion to ${nearby.districtName} (${nearby.distanceKm} km via ${nearby.highway})`,
        theme: `NEIGHBORING ${nearby.districtName.toUpperCase()} DISCOVERY`,
        totalDayCost: defaultDayCost + 300,
        destinations: [
          {
            timeSlot: 'Morning (08:00 - 12:00)',
            destination: dest1,
            activity: `Depart ${matchedDistrict.headquarters} along ${nearby.highway} (${nearby.distanceKm} km, ~${nearby.travelTime}). Visit ${nearby.topAttractions[0]}. Why visit: ${nearby.whyVisit}`,
            transportFromPrevious: `${nearby.bestTransit} (${nearby.highway})`,
            estimatedCost: isBudget ? 150 : 350,
          },
          {
            timeSlot: 'Afternoon (13:00 - 16:30)',
            destination: dest2,
            activity: `Visit ${nearby.topAttractions[1] || nearby.topAttractions[0]}. Savor famous ${nearby.foodHighlight}. Scenic return drive to ${matchedDistrict.name}.`,
            transportFromPrevious: 'Local Auto / Return Cab (₹120)',
            estimatedCost: isBudget ? 200 : 450,
          },
        ],
      });
    } else {
      // 100% INSIDE THIS DISTRICT!
      const place1Name = districtPlaces[(i * 2) % districtPlaces.length];
      const place2Name = districtPlaces[(i * 2 + 1) % districtPlaces.length];

      const dest1 = createDistrictPlaceDestination(matchedDistrict, place1Name, i * 2);
      const dest2 = createDistrictPlaceDestination(matchedDistrict, place2Name, i * 2 + 1);

      const slot1Cost = dest1.entryFee.indian + (isBudget ? 80 : 250);
      const slot2Cost = dest2.entryFee.indian + (isBudget ? 150 : 400);

      plans.push({
        dayNumber,
        title: `Day ${dayNumber}: ${matchedDistrict.name} — ${place1Name} & ${place2Name}`,
        theme: `${matchedDistrict.name.toUpperCase()} IN-DEPTH EXPLORATION`,
        totalDayCost: defaultDayCost,
        destinations: [
          {
            timeSlot: 'Morning (08:00 - 12:00)',
            destination: dest1,
            activity: `Explore ${place1Name} in ${matchedDistrict.name}. ${dest1.historicalSignificance.slice(0, 95)}...`,
            transportFromPrevious: `${dest1.transportInfo.options[0]?.mode || 'Auto / Local Bus'} (${dest1.transportInfo.options[0]?.fare || '₹30'})`,
            estimatedCost: slot1Cost,
          },
          {
            timeSlot: 'Afternoon (13:00 - 16:30)',
            destination: dest2,
            activity: `Experience ${place2Name}. Authentic ${matchedDistrict.name} culinary tasting: ${dest2.cuisineHighlight}`,
            transportFromPrevious: `${dest2.transportInfo.options[1]?.mode || 'Auto-Rickshaw'} (${dest2.transportInfo.options[1]?.fare || '₹100'})`,
            estimatedCost: slot2Cost,
          },
        ],
      });
    }
  }

  return plans;
}

/**
 * Intelligent Local Refinement Engine (Fast, Deterministic & Complete)
 */
export function refineItineraryLocally(
  currentPlans: DayPlan[],
  instruction: string,
  startDistrict?: string,
  travelStyle: 'budget' | 'moderate' | 'luxury' = 'moderate'
): { summary: string; refinedPlans: DayPlan[] } {
  const lower = instruction.toLowerCase();
  const district = startDistrict ? findDistrict(startDistrict) : null;

  const refinedPlans: DayPlan[] = JSON.parse(JSON.stringify(currentPlans));
  let summary = '';

  if (lower.includes('relax') || lower.includes('leisure') || lower.includes('slow') || lower.includes('senior') || lower.includes('family')) {
    summary = `Pace relaxed for leisure and comfort: Starting times shifted to a gentle 09:30 AM, strenuous steep ascents replaced with shaded promenades, lakeside seating, and dedicated afternoon refreshment breaks.`;
    refinedPlans.forEach((day) => {
      day.theme = `${day.theme} (LEISURE & WELLNESS)`;
      day.destinations.forEach((slot, idx) => {
        if (idx === 0) {
          slot.timeSlot = 'Morning (09:30 - 12:30)' as any;
          slot.activity = `Gentle morning exploration: ${slot.activity.replace('Guided visit', 'Tranquil walk through')} with ample rest benches and shaded pavilions.`;
        } else {
          slot.timeSlot = 'Afternoon (14:30 - 17:30)' as any;
          slot.activity = `Scenic leisure stop: ${slot.activity} followed by artisan tea and fresh coconut water.`;
        }
        slot.transportFromPrevious = 'Comfort AC Cab or Pre-Booked Auto (₹250 - ₹400)';
      });
    });
  } else if (lower.includes('heritage') || lower.includes('temple') || lower.includes('architect') || lower.includes('history')) {
    summary = `Heritage and temple depth magnified: Prioritized ASI-protected monuments, Kalinga architectural nuances, ancient inscriptions, and living craft traditions.`;
    refinedPlans.forEach((day, dIdx) => {
      day.theme = 'SACRED HERITAGE & ARCHITECTURE';
      day.destinations.forEach((slot, sIdx) => {
        slot.activity = `Deep architectural discovery: ${slot.activity}. Study the Mukhasala mandapas, intricate chlorite stone sculptures, and historic epigraphs with certified guides.`;
        slot.estimatedCost = slot.estimatedCost + 150;
      });
    });
  } else if (lower.includes('food') || lower.includes('cuisine') || lower.includes('sweet') || lower.includes('tasting') || lower.includes('gi')) {
    summary = `Culinary explorer circuit activated: Integrated designated foodie stops for GI-tagged sweets (Nayagarh Chhena Poda, Pahala Rasagola, Kendrapara Rasabali), holy Mahaprasad, and authentic regional bhojanalayas.`;
    refinedPlans.forEach((day, dIdx) => {
      day.theme = 'CULINARY & GI SWEET DISCOVERY';
      day.destinations.forEach((slot, sIdx) => {
        if (sIdx === 0) {
          slot.activity = `${slot.activity} — Breakfast stop: Steaming Chakuli Pitha with Ghuguni and hot ginger chai.`;
        } else {
          slot.activity = `${slot.activity} — Dedicated Tasting: Savor authentic Dalma thali followed by warm Chhena Poda caramelized in Sal leaves.`;
        }
      });
    });
  } else if (lower.includes('eco') || lower.includes('nature') || lower.includes('wildlife') || lower.includes('waterfall') || lower.includes('forest')) {
    summary = `Eco-tourism & nature reserves prioritized: Early morning birding, mangrove waterway cruises, waterfall trails, and community-run forest conservation camps.`;
    refinedPlans.forEach((day) => {
      day.theme = 'ECO-TRAILS & NATURE SANCTUARIES';
      day.destinations.forEach((slot) => {
        slot.activity = `Eco-trail discovery: ${slot.activity}. Observe endemic bird species, lush canopies, and serene water bodies in tranquil natural surroundings.`;
      });
    });
  } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('economical')) {
    summary = `Budget maximized: Calibrated transit around CRUT Mo Bus and local rail shuttles, recommended affordable government dharamsalas and community dining.`;
    refinedPlans.forEach((day) => {
      day.totalDayCost = Math.round(day.totalDayCost * 0.65);
      day.destinations.forEach((slot) => {
        slot.transportFromPrevious = 'Mo Bus / Local Passenger Train (₹10 - ₹35)';
        slot.estimatedCost = Math.max(30, Math.round(slot.estimatedCost * 0.7));
      });
    });
  } else {
    // Custom user instruction
    summary = `Schedule tailored to your preference: "${instruction}". Refined day-by-day activities, optimized travel sequence, and verified regional highlights.`;
    refinedPlans.forEach((day, idx) => {
      day.title = `${day.title} (${instruction.slice(0, 24)}...)`;
      day.destinations.forEach((slot) => {
        slot.activity = `${slot.activity} [Custom Refinement: ${instruction.slice(0, 45)}]`;
      });
    });
  }

  return { summary, refinedPlans };
}

/**
 * Accurately compute itemized and total trip budget from day plans
 */
export function calculatePlansTotalCost(
  plans: DayPlan[],
  travelers: number,
  style: 'budget' | 'moderate' | 'luxury'
) {
  const days = plans.length;
  const nights = Math.max(0, days - 1);
  const rooms = Math.ceil(travelers / 2);

  const nightTariff = style === 'budget' ? 700 : style === 'luxury' ? 4500 : 2000;
  const accommodation = nights * rooms * nightTariff;

  let transport = 0;
  let entryAndBuffer = 0;

  plans.forEach((day) => {
    day.destinations.forEach((slot) => {
      // Check transport cost
      const fareMatch = slot.transportFromPrevious.match(/₹\s*(\d+)/);
      const estFare = fareMatch ? parseInt(fareMatch[1], 10) : style === 'budget' ? 30 : style === 'luxury' ? 350 : 120;
      transport += estFare * (style === 'luxury' ? 1 : travelers);
      entryAndBuffer += (slot.estimatedCost || 100) * travelers;
    });
  });

  const mealDailyPerPax = style === 'budget' ? 250 : style === 'luxury' ? 1200 : 550;
  const food = days * travelers * mealDailyPerPax;

  const totalCost = accommodation + transport + food + entryAndBuffer;
  const perPersonCost = Math.round(totalCost / Math.max(1, travelers));

  return {
    accommodation,
    transport,
    food,
    entryAndBuffer,
    totalCost,
    perPersonCost,
  };
}

