/**
 * Comprehensive Knowledge Base of all 30 Districts of Odisha
 * Grounding data for UtkalSarathi & Utkal Mitra AI
 * Contains in-depth information on hidden gems, transportation, stays/hotels,
 * food specialties, emergency hospitals, and tourist guides for every district.
 */

export interface DistrictStay {
  name: string;
  type: 'OTDC Panthanivas' | 'Eco-Tourism Camp' | 'Hotel / Resort' | 'Homestay' | 'Panthasala';
  contact: string;
  estPrice: string;
}

export interface DistrictFoodSpot {
  item: string;
  recommendation: string;
}

export interface DistrictGuide {
  contactName: string;
  phone: string;
  deskLocation: string;
}

export interface DistrictInfo {
  id: string;
  name: string;
  odiaName: string;
  headquarters: string;
  zone: 'Coastal' | 'Western' | 'Southern' | 'Northern' | 'Central';
  tagline: string;
  highlights: string[];
  hiddenGems: string[];
  ecoTourismAndNature: string[];
  handicraftsAndArt: string[];
  signatureCuisine: string[];
  foodSpots: DistrictFoodSpot[];
  recommendedStays: DistrictStay[];
  touristGuideInfo: DistrictGuide;
  majorFestivals: string[];
  transportHubs: {
    nearestRail: string;
    nearestAirport?: string;
    highway: string;
    busServices: string;
    lastMileTransit: string;
  };
  safetyAndHelpline: {
    districtHospital: string;
    hospitalContact: string;
    controlRoomNumber: string;
    policeStation: string;
  };
  description: string;
}

export type OdishaDistrict = DistrictInfo;

export const ODISHA_30_DISTRICTS: DistrictInfo[] = [
  {
    id: 'angul',
    name: 'Angul',
    odiaName: 'ଅନୁଗୋଳ',
    headquarters: 'Angul',
    zone: 'Central',
    tagline: 'Gateway to Satkosia Gorge & Industrial Heart of Odisha',
    highlights: ['Satkosia Gorge Sanctuary', 'Tikarpada Gharial Sanctuary', 'Budhi Thakurani Temple', 'Sailashree Kshetra'],
    hiddenGems: ['Labangi Nature Camp (wildlife watch)', 'Deulajhari Hot Springs & Shiva Temple', 'Khuludi Waterfalls in Malyagiri range'],
    ecoTourismAndNature: ['Satkosia Tiger Reserve', 'Mahanadi River Gorge', 'Labangi Wildlife Sanctuary'],
    handicraftsAndArt: ['Dokra metal casting', 'Terracotta pottery'],
    signatureCuisine: ['Angul Pitha', 'Country Chicken curry', 'Fresh Mahanadi River Fish'],
    foodSpots: [
      { item: 'Mahanadi River Fish Thali', recommendation: 'Tikarpada River View Kitchens' },
      { item: 'Hot Angul Pitha', recommendation: 'Amalapada Market Stalls' },
    ],
    recommendedStays: [
      { name: 'Satkosia Sands Resort Tikarpada', type: 'Eco-Tourism Camp', contact: '+91 94370 21544', estPrice: '₹3,500/night (all meals included)' },
      { name: 'OTDC Panthanivas Angul', type: 'OTDC Panthanivas', contact: '06764-230558', estPrice: '₹1,800 – ₹2,800/night' },
      { name: 'Hotel Shakti Continental', type: 'Hotel / Resort', contact: '06764-233777', estPrice: '₹2,500 – ₹4,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Satkosia Community Eco-Guide Federation',
      phone: '+91 94370 21544',
      deskLocation: 'Tikarpada Forest Check Gate Counter',
    },
    majorFestivals: ['Hingula Yatra', 'Maha Shivaratri at Kosaleshwar'],
    transportHubs: {
      nearestRail: 'Angul Railway Station (ANGL)',
      nearestAirport: 'Bhubaneswar BBI (130 km)',
      highway: 'NH-55 connecting Cuttack & Sambalpur',
      busServices: 'Direct OSRTC AC & non-AC buses from Bhubaneswar, Cuttack, and Rourkela',
      lastMileTransit: 'Forest Dept 4x4 Boleros available at Angul for Tikarpada and Purunakote nature camps',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Angul',
      hospitalContact: '06764-230101',
      controlRoomNumber: '06764-230101',
      policeStation: 'Angul Town Police Station (06764-230325)',
    },
    description: 'Angul boasts the breathtaking Satkosia Gorge where the Mahanadi river cuts through the Eastern Ghats. Famous for crocodile sanctuaries and scenic eco-cottages.',
  },
  {
    id: 'balangir',
    name: 'Balangir',
    odiaName: 'ବଲାଙ୍ଗୀର',
    headquarters: 'Balangir',
    zone: 'Western',
    tagline: 'Land of Tantric Heritage & Gandhamardan Hills',
    highlights: ['Ranipur-Jharial (64 Yogini Temple)', 'Harishankar Temple (Gandhamardan Hills)', 'Saintala Chandi Temple', 'Patneswari Temple Patnagarh'],
    hiddenGems: ['Turekela Eco-Cottages (migratory deer watch)', 'Jogisarda Ancient Sun Temple', 'Suktel Dam Sunset Point'],
    ecoTourismAndNature: ['Harishankar Perennial Mountain Stream', 'Gandhamardan Medicinal Hill Range', 'Turekela Forest Sanctuary'],
    handicraftsAndArt: ['Sambalpuri Ikat tie-dye weaving', 'Terracotta pottery'],
    signatureCuisine: ['Chaul Bara (crisp rice vadas with sour soup)', 'Arisa Pitha', 'Til Chhatua', 'Balangir Badi'],
    foodSpots: [
      { item: 'Famous Chaul Bara with spicy tamarind chutney', recommendation: 'Daily Market & Patnagarh Chowk' },
      { item: 'Traditional Herbal Kansa Thali', recommendation: 'Harishankar Pilgrimage Bhojanalaya' },
    ],
    recommendedStays: [
      { name: 'Harishankar Panthasala', type: 'Panthasala', contact: '06657-222220', estPrice: '₹1,000 – ₹1,800/night' },
      { name: 'Hotel Bhagirathi Balangir', type: 'Hotel / Resort', contact: '06652-233150', estPrice: '₹1,500 – ₹2,500/night' },
      { name: 'Gandhamardan Eco-Retreat Tent Camp', type: 'Eco-Tourism Camp', contact: '+91 94374 81090', estPrice: '₹2,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Gandhamardan Heritage & Ayurvedic Guide Guild',
      phone: '+91 98612 40120',
      deskLocation: 'Harishankar Temple Information Counter',
    },
    majorFestivals: ['Sital Sasthi', 'Nuakhai', 'Harishankar Mela', 'Patnagarh Rath Yatra'],
    transportHubs: {
      nearestRail: 'Balangir Railway Station (BLGR)',
      nearestAirport: 'Jharsuguda JRG (160 km) / Bhubaneswar BBI (290 km)',
      highway: 'NH-26 connecting Bargarh & Bhawanipatna; NH-57',
      busServices: 'Frequent OSRTC buses from Sambalpur, Bhubaneswar, and Raipur',
      lastMileTransit: 'Local shared taxis and auto-rickshaws connect Balangir town to Harishankar (80 km) and Ranipur-Jharial (30 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'Bhima Bhoi Medical College & Hospital Balangir',
      hospitalContact: '06652-232101',
      controlRoomNumber: '06652-232101',
      policeStation: 'Balangir Town Police Station (06652-232325)',
    },
    description: 'Rich in medieval history, Balangir is home to the rare hypaethral 64-Yogini temple at Ranipur-Jharial and sacred medicinal streams in Gandhamardan.',
  },
  {
    id: 'balasore',
    name: 'Balasore',
    odiaName: 'ବାଲେଶ୍ୱର',
    headquarters: 'Balasore',
    zone: 'Coastal',
    tagline: 'Maritime Cradle, Vanishing Sea Chandipur & Sweet Khirachora Gopinath',
    highlights: ['Chandipur Beach (Vanishing sea)', 'Khirachora Gopinath Temple (Remuna)', 'Panchalingeswar Hill Temple', 'Talasari Beach & Subarnarekha estuary'],
    hiddenGems: ['Kasafal Beach (unspoiled mangrove delta)', 'Emami Jagannath Temple (modern architectural marvel)', 'Bhudhar Chandi Cave Shrine in Nilagiri'],
    ecoTourismAndNature: ['Kuldiha Wildlife Sanctuary', 'Panchalingeswar Perennial Stream', 'Talasari Sand Dunes'],
    handicraftsAndArt: ['Nilagiri stone carving', 'Lacquer craft', 'Golden grass mats'],
    signatureCuisine: ['Remuna Khira Bhoga (thick condensed milk sweet)', 'Coastal Crab Curry', 'Chhena Jhili', 'Balasore Mudhi'],
    foodSpots: [
      { item: 'Authentic Khira Bhoga Prasad', recommendation: 'Khirachora Gopinath Temple Counter Remuna' },
      { item: 'Fresh Marine Crab & Pomfret Curry', recommendation: 'Chandipur Sea Beach Shacks' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Chandipur', type: 'OTDC Panthanivas', contact: '06782-270051', estPrice: '₹2,000 – ₹3,500/night' },
      { name: 'OTDC Panthasala Panchalingeswar', type: 'Panthasala', contact: '06782-272022', estPrice: '₹1,200 – ₹2,200/night' },
      { name: 'Hotel Golden City Balasore', type: 'Hotel / Resort', contact: '06782-262020', estPrice: '₹1,800 – ₹3,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Chandipur Coastal & Heritage Tourism Guild',
      phone: '+91 94372 88120',
      deskLocation: 'Tourist Office, OTDC Panthanivas Chandipur',
    },
    majorFestivals: ['Chandan Yatra Remuna', 'Panchalingeswar Mela', 'Makar Mela Nilagiri'],
    transportHubs: {
      nearestRail: 'Balasore Railway Station (BLS - Major trunk line on Howrah-Chennai corridor)',
      nearestAirport: 'Bhubaneswar BBI (200 km) / Kolkata CCU (220 km)',
      highway: 'NH-16 (Golden Quadrilateral)',
      busServices: 'Direct high-frequency buses from Kolkata, Bhubaneswar, and Cuttack',
      lastMileTransit: 'Autos and e-rickshaws frequently shuttle between Balasore town and Chandipur (16 km) for ₹150–₹200',
    },
    safetyAndHelpline: {
      districtHospital: 'Fakir Mohan Medical College & Hospital Balasore',
      hospitalContact: '06782-262001',
      controlRoomNumber: '06782-262001',
      policeStation: 'Balasore Town Police Station (06782-262025)',
    },
    description: 'Famous for Chandipur Beach where the sea recedes up to 5 kilometers during low tide, the sweet condensed milk Prasad of Remuna, and pristine Kuldiha forests.',
  },
  {
    id: 'bargarh',
    name: 'Bargarh',
    odiaName: 'ବରଗଡ଼',
    headquarters: 'Bargarh',
    zone: 'Western',
    tagline: 'World’s Largest Open-Air Theatre Dhanu Yatra & Sambalpuri Weaving Hub',
    highlights: ['Dhanu Yatra Festival Arena', 'Nrusinghanath Temple', 'Gandhamardan Hills (North side)', 'Debrigarh Wildlife Sanctuary Entry'],
    hiddenGems: ['Papanga Hills & Prehistoric Caves', 'Charda Shiva Temple (10th-century Kalinga architecture)', 'Bara Pathar Historic Battlefield'],
    ecoTourismAndNature: ['Debrigarh Wildlife Sanctuary (leopards & gaurs)', 'Nrusinghanath Waterfall & Stream', 'Mahanadi Backwaters'],
    handicraftsAndArt: ['World-renowned Sambalpuri Ikat Silk and Cotton sarees (Padmapur & Bargarh clusters)', 'Terracotta'],
    signatureCuisine: ['Bargarh Chaul Dhuda', 'Sambalpuri Pitha', 'Pakhal with Badi Chura', 'Millet Ladu'],
    foodSpots: [
      { item: 'Traditional Sambalpuri Pitha and Chaul Bara', recommendation: 'Bhatli Road Sweet Markets' },
      { item: 'Nrusinghanath Temple Prasad (Khiri & Khichdi)', recommendation: 'Temple Trust Counter' },
    ],
    recommendedStays: [
      { name: 'Nrusinghanath Panthasala', type: 'Panthasala', contact: '06684-253222', estPrice: '₹900 – ₹1,500/night' },
      { name: 'Debrigarh Eco-Resort', type: 'Eco-Tourism Camp', contact: '+91 94371 49832', estPrice: '₹3,500/night (wildlife safari included)' },
      { name: 'Hotel Vardan Bargarh', type: 'Hotel / Resort', contact: '06646-234500', estPrice: '₹1,600 – ₹2,800/night' },
    ],
    touristGuideInfo: {
      contactName: 'Dhanu Yatra Cultural & Tourism Association',
      phone: '+91 94371 63200',
      deskLocation: 'District Culture Office, Bargarh',
    },
    majorFestivals: ['Dhanu Yatra (11-day open-air epic theater)', 'Nuakhai', 'Nrusinghanath Mela', 'Bali Yatra'],
    transportHubs: {
      nearestRail: 'Bargarh Road Railway Station (BRGA)',
      nearestAirport: 'Jharsuguda JRG (75 km)',
      highway: 'NH-53 connecting Kolkata & Mumbai',
      busServices: 'Direct express buses from Sambalpur, Raipur, and Bhubaneswar',
      lastMileTransit: 'Taxis and shared Boleros available at Bargarh town for Nrusinghanath (110 km) and Debrigarh wildlife sanctuary',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Bargarh',
      hospitalContact: '06646-231101',
      controlRoomNumber: '06646-231101',
      policeStation: 'Bargarh Town Police Station (06646-230325)',
    },
    description: 'Renowned globally for Dhanu Yatra, the world’s largest open-air theatrical festival, Bargarh is also a vibrant center of Sambalpuri handloom weaving.',
  },
  {
    id: 'bhadrak',
    name: 'Bhadrak',
    odiaName: 'ଭଦ୍ରକ',
    headquarters: 'Bhadrak',
    zone: 'Coastal',
    tagline: 'Land of Baba Akhandalamani, Maritime Heritage & Dhamra Port',
    highlights: ['Akhandalamani Temple (Aradi)', 'Dhamra Port & Marine Sanctum', 'Bhadrakali Temple', 'Dhamnagar Historical Dargah'],
    hiddenGems: ['Biranchinarayan Sun Temple Palia (rare wooden chariot carvings)', 'Rakta Tirtha Eram (Pilgrim place of Indian freedom martyrs)', 'Chudamani Coastal Fishing Point'],
    ecoTourismAndNature: ['Baitarani River Confluence at Aradi', 'Dhamra Mangrove Channels', 'Gahirmatha Marine buffer zone'],
    handicraftsAndArt: ['Bamboo weaving', 'Jute craft', 'Terracotta clay works'],
    signatureCuisine: ['Bhadrak Chenna Mudki', 'Palua Ladu (Arrowroot delicacy)', 'Coastal Prawn Curry', 'Aradi Bhoga'],
    foodSpots: [
      { item: 'Authentic Chenna Mudki sweet', recommendation: 'Bhadrak Puruna Bazaar sweet shops' },
      { item: 'Akhandalamani Mahaprasad (Ghee Khichdi & Dalma)', recommendation: 'Aradi Temple Annachhatra' },
    ],
    recommendedStays: [
      { name: 'Akhandalamani Panthasala Aradi', type: 'Panthasala', contact: '06786-271015', estPrice: '₹800 – ₹1,500/night' },
      { name: 'Hotel Golden City Bhadrak', type: 'Hotel / Resort', contact: '06784-251230', estPrice: '₹1,500 – ₹2,500/night' },
      { name: 'Dhamra Port Guest House', type: 'Hotel / Resort', contact: '06784-252000', estPrice: '₹2,500 – ₹4,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Aradi Akhandalamani Information Desk',
      phone: '+91 94373 52100',
      deskLocation: 'Temple Complex Office, Aradi',
    },
    majorFestivals: ['Maha Shivaratri at Aradi', 'Bhadrakali Mela', 'Eram Memorial Day'],
    transportHubs: {
      nearestRail: 'Bhadrak Railway Station (BHC - Major superfast stop on Howrah-Chennai corridor)',
      nearestAirport: 'Bhubaneswar BBI (135 km)',
      highway: 'NH-16',
      busServices: 'Direct high-frequency buses to Cuttack, Bhubaneswar, and Balasore',
      lastMileTransit: 'Regular buses and shared auto-rickshaws run between Bhadrak and Aradi (37 km) through scenic Baitarani countryside',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Bhadrak',
      hospitalContact: '06784-251101',
      controlRoomNumber: '06784-251101',
      policeStation: 'Bhadrak Town Police Station (06784-251025)',
    },
    description: 'Cradle of spiritual devotion at Baba Akhandalamani temple on the banks of river Baitarani, and home to Eram, known as the Second Jallianwala Bagh of India.',
  },
  {
    id: 'boudh',
    name: 'Boudh',
    odiaName: 'ବୌଦ୍ଧ',
    headquarters: 'Boudh',
    zone: 'Central',
    tagline: 'Ancient Buddhist Monasteries, Star-Shaped Shiva Temples & Mahanadi Ghats',
    highlights: ['Rameswar Star-Shaped Twin Temples', 'Buddha Statue at Boudh Town (8th-century colossus)', 'Jogindra Villa Palace', 'Mahanadi River Bank Ghats'],
    hiddenGems: ['Padmatola Eco-Camp in Mahanadi Gorge buffer', 'Dutta Temple in Harabhanga', 'Bhairabi Temple Purunakatak'],
    ecoTourismAndNature: ['Mahanadi Riverine Island Forests', 'Satkosia Gorge Southern Perimeter', 'Padmatola Nature Trail'],
    handicraftsAndArt: ['Sambalpuri Ikat weaving', 'Terracotta pottery', 'Wild grass crafts'],
    signatureCuisine: ['Boudh Kheer', 'Wild Yam Curry (Kandha)', 'Mahanadi Fresh River Fish', 'Desi Badi Chura'],
    foodSpots: [
      { item: 'Fresh Mahanadi River Fish with steaming rice', recommendation: 'Boudh Ghat Roadside Dhabas' },
      { item: 'Traditional Boudh Rice Kheer', recommendation: 'Rameswar Temple Road Sweets' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthasala Boudh', type: 'Panthasala', contact: '06841-222123', estPrice: '₹1,000 – ₹1,800/night' },
      { name: 'Mahanadi River View Lodge', type: 'Hotel / Resort', contact: '06841-223400', estPrice: '₹1,200 – ₹2,000/night' },
      { name: 'Padmatola Forest Eco-Tents', type: 'Eco-Tourism Camp', contact: '+91 94378 12050', estPrice: '₹2,200/night' },
    ],
    touristGuideInfo: {
      contactName: 'Boudh Heritage & Buddhist Circuit Desk',
      phone: '+91 94378 12050',
      deskLocation: 'District Tourist Office, Collectorate Complex Boudh',
    },
    majorFestivals: ['Rameswar Mela', 'Buddha Purnima', 'Chaiti Yatra'],
    transportHubs: {
      nearestRail: 'Boudh Road Station / Rairakhol (55 km) on Sambalpur line',
      nearestAirport: 'Bhubaneswar BBI (210 km)',
      highway: 'NH-57 connecting Khurda and Balangir',
      busServices: 'Direct OSRTC buses from Bhubaneswar, Sambalpur, and Berhampur',
      lastMileTransit: 'Auto-rickshaws available in Boudh town for Buddhist sites and Rameswar temples (within 3 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Boudh',
      hospitalContact: '06841-222201',
      controlRoomNumber: '06841-222201',
      policeStation: 'Boudh Police Station (06841-222325)',
    },
    description: 'Boudh houses monumental 8th-century colossal seated Buddha statues and rare 10th-century star-shaped stone temples dedicated to Lord Shiva.',
  },
  {
    id: 'cuttack',
    name: 'Cuttack',
    odiaName: 'କଟକ',
    headquarters: 'Cuttack',
    zone: 'Coastal',
    tagline: 'The Millennium City, Silver Filigree Capital & Street Food Mecca',
    highlights: ['Barabati Fort & Moat (14th-century Ganga Dynasty)', 'Netaji Birthplace Museum', 'Cuttack Chandi Temple', 'Mahanadi & Kathajodi Riverfront', 'Bali Yatra Ground'],
    hiddenGems: ['Bhattarika Temple in Badamba', 'Ansupa Freshwater Lake & Bird Sanctuary', 'Paramahansa Shiva Temple', 'Maniabandha Handloom Village'],
    ecoTourismAndNature: ['Ansupa Lake & Eco-Park', 'Mahanadi River Island (Dhabaleswar)', 'Kathajodi River Embankments'],
    handicraftsAndArt: ['Tarakasi (Silver Filigree with GI tag)', 'Maniabandha Buddhist silk tie-and-dye weaving', 'Horn craft'],
    signatureCuisine: ['Cuttack Dahibara Aloodum (world famous)', 'Thunka Puri & Chhena Tarkari', 'Biri Bara', 'Salepur Rasagola'],
    foodSpots: [
      { item: 'Iconic Dahibara Aloodum & Ghuguni', recommendation: 'Raghu Dahibara (Bidanasi) / Babula Dahibara (Cantonment)' },
      { item: 'Authentic Salepur Rasagola', recommendation: 'Bikalananda Kar Sweets, Salepur' },
      { item: 'Hot Thunka Puri during Bali Yatra', recommendation: 'Bali Yatra Ground Stalls (Killa Maidan)' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Cuttack', type: 'OTDC Panthanivas', contact: '0671-2301147', estPrice: '₹1,800 – ₹3,200/night' },
      { name: 'The Blue Lagoon Hotel', type: 'Hotel / Resort', contact: '0671-2303030', estPrice: '₹2,500 – ₹4,200/night' },
      { name: 'Pramod Convention & Club Resort', type: 'Hotel / Resort', contact: '0671-2366888', estPrice: '₹4,500 – ₹7,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Silver City Heritage Walking Guild',
      phone: '+91 94371 22910',
      deskLocation: 'Barabati Fort Gate Heritage Counter',
    },
    majorFestivals: ['Cuttack Bali Yatra (Asia’s largest open-air maritime trade fair)', 'Durga Puja with Silver Chandi Medha', 'Kartik Purnima Boita Bandana'],
    transportHubs: {
      nearestRail: 'Cuttack Junction (CTC - Major trunk terminal)',
      nearestAirport: 'Bhubaneswar BBI (30 km)',
      highway: 'NH-16 & Ring Road',
      busServices: 'CRUT Mo Bus Route 20/21/22/23 connect Bhubaneswar Airport to Cuttack every 10 mins',
      lastMileTransit: 'Auto-rickshaws, city Mo Bus network, and cycle-rickshaws cover all old city lanes',
    },
    safetyAndHelpline: {
      districtHospital: 'SCB Medical College & Hospital Cuttack (Premier tertiary care)',
      hospitalContact: '0671-2414080',
      controlRoomNumber: '0671-2414324',
      policeStation: 'Cuttack Cantonment Police Station (0671-2304025)',
    },
    description: 'Over 1,000 years old, Cuttack sits at the bifurcated apex of Mahanadi and Kathajodi rivers. Renowned for its intricate silver filigree, legendary street foods, and the historic Bali Yatra fair.',
  },
  {
    id: 'deogarh',
    name: 'Deogarh',
    odiaName: 'ଦେବଗଡ଼',
    headquarters: 'Deogarh',
    zone: 'Northern',
    tagline: 'Land of Pradhanpat Waterfall & First Hydroelectric Marvel of Odisha',
    highlights: ['Pradhanpat Waterfalls', 'Kailash Palace', 'Gohira Dam & Reservoir', 'Kurudkut Waterfalls'],
    hiddenGems: ['Jhinkarani Temple & Eco-Viewpoint', 'Koradkot Hilltop Caves', 'Malyagiri Wildlife Foothills'],
    ecoTourismAndNature: ['Pradhanpat Nature Park', 'Gohira Dam Wetlands', 'Banspal Forest Ranges'],
    handicraftsAndArt: ['Tribal woodcraft', 'Bamboo baskets', 'Forest honey collection'],
    signatureCuisine: ['Wild Mushroom (Chhatu) Curry', 'Malyagiri Forest Honey', 'Deogarh Badi Tarkari', 'Pakhal with Saga'],
    foodSpots: [
      { item: 'Fresh Mushroom & Badi Curry', recommendation: 'Pradhanpat Foothill Dhabas' },
      { item: 'Wild Forest Honey Drinks', recommendation: 'Deogarh Tribal Cooperative Stall' },
    ],
    recommendedStays: [
      { name: 'Pradhanpat Panthasala Deogarh', type: 'Panthasala', contact: '06641-226450', estPrice: '₹900 – ₹1,600/night' },
      { name: 'Deogarh Forest Nature Lodge', type: 'Eco-Tourism Camp', contact: '+91 94375 19200', estPrice: '₹1,800/night' },
      { name: 'Hotel Royal Palace Deogarh', type: 'Hotel / Resort', contact: '06641-227000', estPrice: '₹1,200 – ₹2,200/night' },
    ],
    touristGuideInfo: {
      contactName: 'Pradhanpat Eco-Tourism Committee',
      phone: '+91 94375 19200',
      deskLocation: 'Pradhanpat Waterfall Entrance Counter',
    },
    majorFestivals: ['Pradhanpat Festival', 'Sivaratri at Gopinath Temple', 'Nuakhai'],
    transportHubs: {
      nearestRail: 'Bamra Station (55 km) or Sambalpur (90 km)',
      nearestAirport: 'Jharsuguda JRG (85 km)',
      highway: 'NH-49 connecting Bilaspur & Kharagpur',
      busServices: 'Direct OSRTC buses from Sambalpur, Rourkela, and Bhubaneswar',
      lastMileTransit: 'Auto-rickshaws easily reach Pradhanpat Waterfall (1.5 km from Deogarh town center)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Deogarh',
      hospitalContact: '06641-226201',
      controlRoomNumber: '06641-226201',
      policeStation: 'Deogarh Police Station (06641-226325)',
    },
    description: 'Surrounded by verdant hills, Deogarh is famed for the scenic Pradhanpat waterfall where Odisha’s earliest hydroelectric power was engineered by Raja Sir Basudeb Sudhal Deb.',
  },
  {
    id: 'dhenkanal',
    name: 'Dhenkanal',
    odiaName: 'ଢେଙ୍କାନାଳ',
    headquarters: 'Dhenkanal',
    zone: 'Central',
    tagline: 'Abode of Kapilash Shivalinga, Mahima Dharma Joranda & GI Sweet Magji',
    highlights: ['Kapilash Temple (Chandrasekhar Temple - 2,233 steps)', 'Joranda Gadi (Mahima Dharma Global Headquarters)', 'Saptasajya Hill Sanctuary', 'Kualo 8th-Century Kanakeswar Temple'],
    hiddenGems: ['Dandadhar Dam on Ramial River', 'Baji Rout Memorial (youngest freedom martyr)', 'Ganesh Khola Rock Sculptures'],
    ecoTourismAndNature: ['Saptasajya Eco-Cottages', 'Kapilash Science Park & Deer Sanctuary', 'Brahmani River Banks'],
    handicraftsAndArt: ['Dokra casting (Sadeibereni craft village with National Awardees)', 'Brass and Bell metal'],
    signatureCuisine: ['Dhenkanal Magji (GI Certified Buffalo-Milk Cheese Sweet)', 'Dhenkanal Bara Tarkari', 'Mati Handi Mutton (clay pot slow-cooked)'],
    foodSpots: [
      { item: 'Original GI Certified Dhenkanal Magji', recommendation: 'Ganesh Sweet Stall & Kapilash Road Stalls' },
      { item: 'Crispy Dhenkanal Bara with spicy potato curry', recommendation: 'Baji Rout Chowk breakfast stalls' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Kapilash', type: 'OTDC Panthanivas', contact: '06762-226078', estPrice: '₹1,600 – ₹2,800/night' },
      { name: 'Saptasajya Eco-Forest Cottages', type: 'Eco-Tourism Camp', contact: '+91 94372 41100', estPrice: '₹2,500/night (all meals included)' },
      { name: 'Hotel Surya Dhenkanal', type: 'Hotel / Resort', contact: '06762-224400', estPrice: '₹1,500 – ₹2,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Dhenkanal Heritage & Mahima Dharma Guide Guild',
      phone: '+91 94372 41100',
      deskLocation: 'Kapilash Hill Base Information Center',
    },
    majorFestivals: ['Maha Shivaratri at Kapilash (massive hill congregation)', 'Joranda Magha Mela (monastic Mahima ascetic gathering)', 'Gaja Lakshmi Puja'],
    transportHubs: {
      nearestRail: 'Dhenkanal Railway Station (DNKL)',
      nearestAirport: 'Bhubaneswar BBI (75 km)',
      highway: 'NH-55 connecting Cuttack and Angul',
      busServices: 'Mo Bus and OSRTC connect Cuttack and Bhubaneswar to Dhenkanal every 30 minutes',
      lastMileTransit: 'Frequent autos and shared jeeps connect Dhenkanal station to Kapilash base (26 km) and Joranda (24 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Dhenkanal',
      hospitalContact: '06762-225201',
      controlRoomNumber: '06762-225201',
      policeStation: 'Dhenkanal Town Police Station (06762-225325)',
    },
    description: 'Dhenkanal is celebrated for the holy hill of Kapilash ("Kailash of Odisha"), the monastic center of Mahima Dharma at Joranda, and the GI-tagged Magji sweet.',
  },
  {
    id: 'gajapati',
    name: 'Gajapati',
    odiaName: 'ଗଜପତି',
    headquarters: 'Paralakhemundi',
    zone: 'Southern',
    tagline: 'Cradle of Odia Statehood, Royal Palaces & Chandragiri Tibet Settlement',
    highlights: ['BR Palace (Paralakhemundi Maharaja Palace)', 'Jirang Tibetan Buddhist Monastery (Padmasambhava)', 'Khasada Waterfall', 'Gandahat Waterfall'],
    hiddenGems: ['Mahendragiri Peak (highest biodiversity peak in South Odisha, sacred Shiva shrines)', 'Mankadadian Waterfall', 'Brundaban Palace on Mahendratanaya River'],
    ecoTourismAndNature: ['Mahendragiri Biosphere Sanctuary', 'Chandragiri Pine Hills', 'Gandahat Natural Forest Park'],
    handicraftsAndArt: ['Horn craft (Gajapati horn carving GI)', 'Soura tribal pictograms (Idital paintings)', 'Jaena Pitha crafts'],
    signatureCuisine: ['Tibetan Momos & Thukpa (Chandragiri)', 'Paralakhemundi Dry Sweets', 'Soura Millet Gruel', 'Ragi Pej'],
    foodSpots: [
      { item: 'Authentic Tibetan Steamed Momos & Thukpa', recommendation: 'Jirang Monastery Colony Cafes' },
      { item: 'Paralakhemundi Royal Dry Sweets', recommendation: 'Main Palace Road Sweet shops' },
    ],
    recommendedStays: [
      { name: 'Jirang Monastic Eco-Guest House Chandragiri', type: 'Homestay', contact: '+91 94382 17090', estPrice: '₹1,200 – ₹2,200/night' },
      { name: 'OTDC Panthanivas Paralakhemundi', type: 'OTDC Panthanivas', contact: '06815-222340', estPrice: '₹1,500 – ₹2,500/night' },
      { name: 'Mahendragiri Nature Camp', type: 'Eco-Tourism Camp', contact: '+91 94371 88200', estPrice: '₹2,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Jirang Tibetan & Soura Cultural Tourism Desk',
      phone: '+91 94382 17090',
      deskLocation: 'Padmasambhava Mahavihara Gate, Chandragiri',
    },
    majorFestivals: ['Rath Yatra of Paralakhemundi', 'Tibetan Losar New Year at Jirang', 'Maha Shivaratri at Mahendragiri'],
    transportHubs: {
      nearestRail: 'Paralakhemundi Station (PLH) / Palasa (35 km on Howrah-Chennai trunk line)',
      nearestAirport: 'Visakhapatnam VTZ (180 km) / Bhubaneswar BBI (260 km)',
      highway: 'SH-4 & NH-326A',
      busServices: 'Direct OSRTC buses from Berhampur, Bhubaneswar, and Visakhapatnam',
      lastMileTransit: 'Taxis and shared maxi-cabs connect Paralakhemundi to Chandragiri (80 km) and Gandahat Waterfall (30 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Paralakhemundi',
      hospitalContact: '06815-222201',
      controlRoomNumber: '06815-222201',
      policeStation: 'Paralakhemundi Police Station (06815-222325)',
    },
    description: 'Birthplace of the movement for separate Odisha state under Maharaja Krushna Chandra Gajapati, housing the grand Jirang Tibetan Buddhist settlement.',
  },
  {
    id: 'ganjam',
    name: 'Ganjam',
    odiaName: 'ଗଞ୍ଜାମ',
    headquarters: 'Chhatrapur / Berhampur',
    zone: 'Southern',
    tagline: 'Silk City Berhampur, Gopalpur-on-Sea & Twin Shaktipitha Tara Tarini',
    highlights: ['Tara Tarini Hill Shrine (Shakti Peetha with ropeway)', 'Gopalpur-on-Sea Beach & Lighthouse', 'Tampara Freshwater Lake (Water sports)', 'Jaugarh Ashokan Rock Edict'],
    hiddenGems: ['Aryapalli Golden Sand Beach', 'Kuldiha Nature Sanctuary (Ganjam border)', 'Mahurikalua Cave Temple in Ghumusar', 'Potagarh Star Fort on Rushikulya river'],
    ecoTourismAndNature: ['Tampara Lake Nature Camp', 'Rushikulya Olive Ridley Rookery (Purunabandha)', 'Kerandimala Hills'],
    handicraftsAndArt: ['Berhampuri Pata Silk sarees (GI tag)', 'Ganjam Brass fish craft', 'Papad and Pickle making'],
    signatureCuisine: ['Berhampuri Achar & Papad', 'Puri Upma (Berhampur breakfast fusion)', 'Gopalpur Fresh Sea Crab Fry', 'Rasabali of Chhatrapur'],
    foodSpots: [
      { item: 'Famous Berhampuri Puri Upma', recommendation: 'Girija Square & Old Bus Stand stalls' },
      { item: 'Fresh Marine Sea Fish Fry', recommendation: 'Gopalpur Beach Boardwalk Stalls' },
      { item: 'Tara Tarini Prasadam', recommendation: 'Tara Tarini Temple Trust Annachhatra' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Gopalpur', type: 'OTDC Panthanivas', contact: '0680-2243931', estPrice: '₹2,500 – ₹4,200/night' },
      { name: 'OTDC Panthasala Tara Tarini', type: 'Panthasala', contact: '06811-258045', estPrice: '₹1,200 – ₹2,000/night' },
      { name: 'Mayfair Palm Beach Resort Gopalpur', type: 'Hotel / Resort', contact: '0680-6660101', estPrice: '₹6,500 – ₹11,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Ganjam Cultural & Coastal Tourism Guild',
      phone: '+91 98610 88200',
      deskLocation: 'Tourist Counter, Berhampur Railway Station',
    },
    majorFestivals: ['Tara Tarini Chaitra Mela (Tuesdays in Chaitra)', 'Gopalpur Beach Festival', 'Danda Nata (ancient penance dance)', 'Berhampur Thakurani Yatra'],
    transportHubs: {
      nearestRail: 'Berhampur Railway Station (BAM - Major trunk junction)',
      nearestAirport: 'Bhubaneswar BBI (170 km)',
      highway: 'NH-16 (Chennai-Kolkata corridor)',
      busServices: 'Direct OSRTC AC/deluxe buses to Bhubaneswar, Cuttack, Puri, and Visakhapatnam',
      lastMileTransit: 'Frequent city buses and auto-rickshaws connect Berhampur to Gopalpur-on-Sea (16 km) and Tara Tarini (32 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'MKCG Medical College & Hospital Berhampur (Premier southern medical hub)',
      hospitalContact: '0680-2292746',
      controlRoomNumber: '0680-2292746',
      policeStation: 'Berhampur Town Police Station (0680-2220325)',
    },
    description: 'Famed for the ancient Shakti Peetha of Goddess Tara Tarini, the tranquil colonial beach of Gopalpur, and the vibrant Silk City of Berhampur.',
  },
  {
    id: 'jagatsinghpur',
    name: 'Jagatsinghpur',
    odiaName: 'ଜଗତସିଂହପୁର',
    headquarters: 'Jagatsinghpur',
    zone: 'Coastal',
    tagline: 'Spiritual Haven of Maa Sarala & Maritime Gateway of Paradeep Port',
    highlights: ['Maa Sarala Temple (Jhankad - Adikabi Sarala Das birthplace)', 'Paradeep Deep Sea Port & Marine Beach', 'Siali Beach', 'Gada Kujanga Forest'],
    hiddenGems: ['Sandhakuda Estuary Point', 'Light House at Paradeep', 'Nuagaon Jagannath Temple'],
    ecoTourismAndNature: ['Mahanadi Delta Estuary Mangroves', 'Siali Casuarina Beach', 'Paradeep Marine Drive Walk'],
    handicraftsAndArt: ['Coir craft (mats & ropes)', 'Horn crafts', 'Sea shell souvenirs'],
    signatureCuisine: ['Paradeep Tiger Prawn & Crab Curry', 'Jhankad Sarala Ladu', 'Chhena Jhili', 'Coastal Dry Fish (Sukhua)'],
    foodSpots: [
      { item: 'Fresh Marine Crab & Prawn Curry', recommendation: 'Paradeep Marine Drive seafood dhabas' },
      { item: 'Sacred Sarala Temple Ladu', recommendation: 'Jhankad Temple Bhoga counter' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Paradeep', type: 'OTDC Panthanivas', contact: '06722-222275', estPrice: '₹1,800 – ₹3,000/night' },
      { name: 'Golden Anchor Hotel Paradeep', type: 'Hotel / Resort', contact: '06722-222648', estPrice: '₹2,500 – ₹4,500/night' },
      { name: 'Hotel Aristocrat Jagatsinghpur', type: 'Hotel / Resort', contact: '06724-220555', estPrice: '₹1,200 – ₹2,200/night' },
    ],
    touristGuideInfo: {
      contactName: 'Paradeep Maritime & Sarala Heritage Desk',
      phone: '+91 94371 77200',
      deskLocation: 'Port Information Center, Paradeep',
    },
    majorFestivals: ['Sarala Chaitra Parba', 'Paradeep Port Beach Festival', 'Kujanga Bali Yatra'],
    transportHubs: {
      nearestRail: 'Paradeep Railway Station (PRDP) / Rahama / Cuttack (50 km)',
      nearestAirport: 'Bhubaneswar BBI (95 km)',
      highway: 'NH-53 (Cuttack-Paradeep Express Corridor)',
      busServices: 'Direct high-frequency buses from Cuttack, Bhubaneswar, and Puri to Paradeep',
      lastMileTransit: 'Auto-rickshaws connect Paradeep town to sea beach and light house; shared autos connect Jagatsinghpur to Jhankad (15 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Jagatsinghpur & Port Hospital Paradeep',
      hospitalContact: '06724-220201',
      controlRoomNumber: '06724-220201',
      policeStation: 'Paradeep Marine Police Station (06722-222125)',
    },
    description: 'Home of Adikabi Sarala Das who wrote the Odia Mahabharata under the divine grace of Goddess Sarala, and houses one of Eastern India’s major maritime ports.',
  },
  {
    id: 'jajpur',
    name: 'Jajpur',
    odiaName: 'ଯାଜପୁର',
    headquarters: 'Jajpur Town',
    zone: 'Coastal',
    tagline: 'Ancient Capital Biraja Kshetra, Navigaya & Diamond Triangle Buddhist Monasteries',
    highlights: ['Maa Biraja Temple (Navigaya Shakti Peetha with unique Rath Yatra)', 'Ratnagiri Buddhist Monastery & Stupa', 'Udayagiri Buddhist Caves', 'Lalitgiri Museum'],
    hiddenGems: ['Dasaswamedha Ghat on sacred Baitarani River', 'Barahanatha Temple', 'Chandikhole Scenic Spring and Mahavinayak Temple'],
    ecoTourismAndNature: ['Baitarani River Embankment', 'Ratnagiri Heritage Hillock', 'Chandikhole Forest Spring'],
    handicraftsAndArt: ['Stone carving (Buddhist replica artisans)', 'Tussar silk weaving', 'Golden grass crafts'],
    signatureCuisine: ['Biraja Gaja (famous layered crispy sweet)', 'Jajpur Chhena Mudki', 'Baitarani River Fish Curry', 'Chhena Poda'],
    foodSpots: [
      { item: 'Original Biraja Gaja sweet', recommendation: 'Biraja Temple Road Sweet Clusters' },
      { item: 'Authentic Buddhist Trail vegetarian meals', recommendation: 'Ratnagiri Heritage Cafeteria' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthasala Ratnagiri', type: 'Panthasala', contact: '06728-255240', estPrice: '₹1,400 – ₹2,400/night' },
      { name: 'Toshali Ratnagiri Buddhist Resort', type: 'Hotel / Resort', contact: '06728-255300', estPrice: '₹3,200 – ₹5,500/night' },
      { name: 'OTDC Panthasala Jajpur Town', type: 'Panthasala', contact: '06728-222340', estPrice: '₹1,200 – ₹2,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Diamond Triangle Buddhist Circuit Guild',
      phone: '+91 94374 89110',
      deskLocation: 'ASI Museum Entry Gate, Ratnagiri',
    },
    majorFestivals: ['Biraja Rath Yatra (only single-wheeled chariot festival for a Goddess in India)', 'Baruni Snana at Baitarani', 'Mahavinayak Mela'],
    transportHubs: {
      nearestRail: 'Jajpur Keonjhar Road Station (JJKR - Major trunk halt)',
      nearestAirport: 'Bhubaneswar BBI (95 km)',
      highway: 'NH-16 & Expressway to Kalinganagar',
      busServices: 'Direct buses from Bhubaneswar, Cuttack, and Keonjhar',
      lastMileTransit: 'Auto-rickshaws connect Jajpur Road station to Jajpur town (30 km) and the Diamond Triangle monasteries (40 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Jajpur',
      hospitalContact: '06728-222101',
      controlRoomNumber: '06728-222101',
      policeStation: 'Jajpur Town Police Station (06728-222025)',
    },
    description: 'Ancient capital of the Somavamsi dynasty, renowned for the Shakti Peetha of Goddess Biraja on the sacred Baitarani and the UNESCO-shortlisted Diamond Triangle Buddhist monastic ruins.',
  },
  {
    id: 'jharsuguda',
    name: 'Jharsuguda',
    odiaName: 'ଝାରସୁଗୁଡ଼ା',
    headquarters: 'Jharsuguda',
    zone: 'Western',
    tagline: 'Powerhouse of Western Odisha, Koilighughar Waterfall & Bikramkhol Caves',
    highlights: ['Koilighughar Waterfall (submerged Shivalinga)', 'Bikramkhol Prehistoric Rock Art Caves', 'Jhadeswar Temple', 'Kolabira Fort Ruins'],
    hiddenGems: ['Padampur Historical Submerged Temple ruins (visible in summer)', 'Gudguda Waterfall forest route', 'Ib River Confluence Park'],
    ecoTourismAndNature: ['Koilighughar Nature Reserve', 'Ib River Valley Forests', 'Bikramkhol Hillock Trails'],
    handicraftsAndArt: ['Brass metal casting', 'Tribal embroidery', 'Brocade fabrics'],
    signatureCuisine: ['Jharsuguda Chaul Dhuda', 'Spiced Desi Badi Bhaja', 'Ib River Fish Curry', 'Millet Khiri'],
    foodSpots: [
      { item: 'Western Odisha Thali with Desi Badi', recommendation: 'Kisan Chowk Traditional Eateries' },
      { item: 'Koilighughar Waterfall picnic delicacies', recommendation: 'Koilighughar Nature Park Canteen' },
    ],
    recommendedStays: [
      { name: 'Hotel Micro Continental Jharsuguda', type: 'Hotel / Resort', contact: '06645-273300', estPrice: '₹2,200 – ₹3,800/night' },
      { name: 'Hotel Mayur Jharsuguda', type: 'Hotel / Resort', contact: '06645-270450', estPrice: '₹1,800 – ₹3,000/night' },
      { name: 'Koilighughar Forest Eco-Camps', type: 'Eco-Tourism Camp', contact: '+91 94370 65120', estPrice: '₹2,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Jharsuguda Archaeological Heritage Desk',
      phone: '+91 94370 65120',
      deskLocation: 'Airport Tourism Counter, VSS Airport Jharsuguda',
    },
    majorFestivals: ['Jhadeswar Sivaratri Mela', 'Nuakhai', 'Dalkhai Festival', 'Rath Yatra'],
    transportHubs: {
      nearestRail: 'Jharsuguda Junction (JSG - Major superfast junction on Howrah-Mumbai trunk)',
      nearestAirport: 'Veer Surendra Sai Airport Jharsuguda (JRG - Direct flights to Delhi, Bengaluru, Kolkata, Bhubaneswar)',
      highway: 'NH-49 & State Biju Expressway',
      busServices: 'Direct connectivity to Sambalpur, Rourkela, and Raipur',
      lastMileTransit: 'Taxis and rental cabs available at airport and railway station to Koilighughar (35 km) and Bikramkhol',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Jharsuguda',
      hospitalContact: '06645-270101',
      controlRoomNumber: '06645-270101',
      policeStation: 'Jharsuguda Town Police Station (06645-270325)',
    },
    description: 'Thriving industrial hub hosting Veer Surendra Sai Airport, alongside ancient prehistoric painted shelters at Bikramkhol and the picturesque cascade of Koilighughar.',
  },
  {
    id: 'kalahandi',
    name: 'Kalahandi',
    odiaName: 'କଳାହାଣ୍ଡି',
    headquarters: 'Bhawanipatna',
    zone: 'Western',
    tagline: 'Land of Asurgarh Citadel, Phurlijharan Waterfall & Karlapat Tiger Reserve',
    highlights: ['Asurgarh Ancient Fort (2,000-year-old urban settlement)', 'Phurlijharan Waterfall', 'Karlapat Wildlife Sanctuary', 'Manikeswari Temple (Chhatar Yatra)'],
    hiddenGems: ['Dokarichanchra Waterfalls & prehistoric rock art', 'Ampani Hills valley viewpoint', 'Ghumareswar Shiva Temple (confluence of streams)', 'Belkhandi Archaeological Temple'],
    ecoTourismAndNature: ['Karlapat Nature Camp & Wildlife Valley', 'Phurlijharan Waterfall Trail', 'Jakham Eco-Park'],
    handicraftsAndArt: ['Habaspuri Saree weaving (GI Tagged double-weave Ikat)', 'Wood carving', 'Dokra metal casting'],
    signatureCuisine: ['Kalahandi Dalma with Desi Badi', 'Mahua Pitha', 'Bamboo Shoot Karadi Bhaja', 'Wild Honey Drink'],
    foodSpots: [
      { item: 'Authentic Kalahandi Thali with Habaspuri touches', recommendation: 'Bhawanipatna Gandhi Chowk Bhojanalayas' },
      { item: 'Phurlijharan Waterfall picnic cuisine', recommendation: 'Phurlijharan Forest Eco Canteen' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Bhawanipatna', type: 'OTDC Panthanivas', contact: '06670-230554', estPrice: '₹1,500 – ₹2,500/night' },
      { name: 'Karlapat Nature Camp', type: 'Eco-Tourism Camp', contact: '+91 94372 90150', estPrice: '₹3,000/night (eco safari included)' },
      { name: 'Hotel Bhagirathi Bhawanipatna', type: 'Hotel / Resort', contact: '06670-232200', estPrice: '₹1,400 – ₹2,200/night' },
    ],
    touristGuideInfo: {
      contactName: 'Karlapat & Kalahandi Tribal Eco-Guides',
      phone: '+91 94372 90150',
      deskLocation: 'District Tourist Office, Bhawanipatna',
    },
    majorFestivals: ['Chhatar Yatra of Goddess Manikeswari', 'Kalahandi Utsav (Ghumura dance)', 'Nuakhai', 'Khandabasa Mela'],
    transportHubs: {
      nearestRail: 'Kesinga Railway Station (KSNG - 35 km) & Bhawanipatna (BWIP)',
      nearestAirport: 'Utkela Airport (commercial flights) / Jharsuguda JRG (240 km)',
      highway: 'NH-26 connecting Bargarh, Bhawanipatna & Vizianagaram',
      busServices: 'Direct OSRTC buses to Bhubaneswar, Cuttack, Visakhapatnam, and Raipur',
      lastMileTransit: 'Taxis and shared Boleros available at Bhawanipatna for Phurlijharan (15 km) and Karlapat sanctuary (35 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'Saheed Rendo Majhi Medical College & Hospital Bhawanipatna',
      hospitalContact: '06670-230201',
      controlRoomNumber: '06670-230201',
      policeStation: 'Bhawanipatna Town Police Station (06670-230325)',
    },
    description: 'Rich in antiquity with the 2,000-year-old fortified city of Asurgarh, protected Karlapat wildlife forests, and the martial Ghumura folk dance tradition.',
  },
  {
    id: 'kandhamal',
    name: 'Kandhamal',
    odiaName: 'କନ୍ଧମାଳ',
    headquarters: 'Phulbani',
    zone: 'Central',
    tagline: 'Kashmir of Odisha Daringbadi, GI Organic Turmeric & Pine Forest Escapes',
    highlights: ['Daringbadi Hill Station (3,000 ft elevation)', 'Putudi Waterfall', 'Belghar Wildlife Sanctuary (Kutia Kondh territory)', 'Coffee & Black Pepper Plantations'],
    hiddenGems: ['Midubanda Waterfall inside pine valley', 'Ludu Waterfall in Kotagarh forest', 'Dungi Buddhist Relics and Kalinga Ghat Viewpoint'],
    ecoTourismAndNature: ['Daringbadi Pine Forests & Coffee Meadows', 'Belghar Wooden Cottages', 'Putudi Forest Cascade'],
    handicraftsAndArt: ['Cane and bamboo crafts', 'Dokra metal ornaments', 'Organic spice processing'],
    signatureCuisine: ['Kandhamal GI Organic Turmeric Spiced Dishes', 'Bamboo Shoot Karadi', 'Fresh Daringbadi Coffee', 'Wild Honey'],
    foodSpots: [
      { item: 'Freshly Brewed Daringbadi Shade-Grown Coffee', recommendation: 'Coffee Garden Cooperative Cafe Daringbadi' },
      { item: 'Traditional Kondh Tribal Meal with Organic Turmeric', recommendation: 'Belghar Eco-Camp Dining' },
    ],
    recommendedStays: [
      { name: 'Daringbadi Nature Camp', type: 'Eco-Tourism Camp', contact: '+91 94380 11920', estPrice: '₹2,500 – ₹4,000/night (Forest Dept Eco Tour Odisha)' },
      { name: 'OTDC Panthasala Phulbani', type: 'Panthasala', contact: '06842-253245', estPrice: '₹1,200 – ₹2,000/night' },
      { name: 'Deers Eco Resort Daringbadi', type: 'Hotel / Resort', contact: '06846-243300', estPrice: '₹2,800 – ₹4,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Kandhamal Eco-Tourism & Tribal Society',
      phone: '+91 94380 11920',
      deskLocation: 'Eco Tour Odisha Office, Daringbadi',
    },
    majorFestivals: ['Daringbadi Winter Carnival', 'Baruni Yatra', 'Kandhamal Utsav'],
    transportHubs: {
      nearestRail: 'Berhampur Railway Station (120 km) / Muniguda (100 km)',
      nearestAirport: 'Bhubaneswar BBI (240 km)',
      highway: 'NH-157 & NH-59 via scenic Kalinga Ghat',
      busServices: 'Direct OSRTC AC deluxe buses from Bhubaneswar, Berhampur, and Sambalpur',
      lastMileTransit: 'Hill taxis and shared jeeps available at Phulbani and Berhampur to Daringbadi and Belghar',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Phulbani',
      hospitalContact: '06842-253201',
      controlRoomNumber: '06842-253201',
      policeStation: 'Phulbani Town Police Station (06842-253325)',
    },
    description: 'A mist-draped hill wonderland known as the Kashmir of Odisha with sub-zero winter mornings in Daringbadi, organic GI turmeric, and indigenous Kutia Kondh heritage.',
  },
  {
    id: 'kendrapara',
    name: 'Kendrapara',
    odiaName: 'କେନ୍ଦ୍ରାପଡ଼ା',
    headquarters: 'Kendrapara',
    zone: 'Coastal',
    tagline: 'Mangrove Wilderness Bhitarkanika, Turtle Paradise Gahirmatha & GI Sweet Rasabali',
    highlights: ['Bhitarkanika National Park & Mangrove Sanctuary', 'Gahirmatha Marine Sanctuary (Olive Ridley mass nesting)', 'Baladevjew Temple (Tulasi Kshetra)', 'Hukitola Colonial Sea Monument'],
    hiddenGems: ['Dangmal Crocodile Breeding Farm', 'Habalikhati Secluded Beach Camp', 'Kanika Royal Rajbari Palace', 'Barunei Sea Island Mouth'],
    ecoTourismAndNature: ['Bhitarkanika Mangrove Creek Boating', 'Gahirmatha Beach Sanctuary', 'Pentha Beach Eco-Retreat'],
    handicraftsAndArt: ['Golden grass crafts (Kaincha)', 'Coir products', 'Jute bags'],
    signatureCuisine: ['Kendrapara Rasabali (GI Tagged Cardamom Milk Patty)', 'Fresh River Crab Curry', 'Chhena Gaja', 'Bhitarkanika Prawn Fry'],
    foodSpots: [
      { item: 'Original GI Tagged Kendrapara Rasabali', recommendation: 'Baladevjew Temple Gate sweet makers' },
      { item: 'Fresh Mangrove Estuarine Crab & Prawns', recommendation: 'Dangmal Nature Camp Kitchen' },
    ],
    recommendedStays: [
      { name: 'Bhitarkanika Nature Camps (Dangmal & Gupti)', type: 'Eco-Tourism Camp', contact: '+91 94371 49832', estPrice: '₹3,500 – ₹5,500/night (forest boat safari included)' },
      { name: 'OTDC Panthasala Kendrapara', type: 'Panthasala', contact: '06727-232145', estPrice: '₹1,200 – ₹2,200/night' },
      { name: 'Estuarine Village Resort Bhitarkanika', type: 'Hotel / Resort', contact: '+91 94370 21544', estPrice: '₹3,000 – ₹4,800/night' },
    ],
    touristGuideInfo: {
      contactName: 'Bhitarkanika Mangrove Boat Guides Association',
      phone: '+91 94371 49832',
      deskLocation: 'Khola & Gupti Forest Entry Gate Checkposts',
    },
    majorFestivals: ['Baladevjew Rath Yatra (Brahma Taladhwaja)', 'Gahirmatha Olive Ridley Turtle Season', 'Bhitarkanika Eco Festival'],
    transportHubs: {
      nearestRail: 'Cuttack Railway Station (65 km) / Bhadrak (70 km)',
      nearestAirport: 'Bhubaneswar BBI (90 km)',
      highway: 'SH-9 connecting Cuttack & Kendrapara',
      busServices: 'Direct frequent buses from Cuttack, Bhubaneswar, and Paradeep',
      lastMileTransit: 'Forest Dept authorized motorboats at Khola and Gupti gates are mandatory for creek safaris inside the national park',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Kendrapara',
      hospitalContact: '06727-232201',
      controlRoomNumber: '06727-232201',
      policeStation: 'Kendrapara Town Police Station (06727-232025)',
    },
    description: 'Second largest mangrove ecosystem in India, hosting giant saltwater crocodiles, millions of nesting Olive Ridley sea turtles at Gahirmatha, and the sacred Baladevjew temple.',
  },
  {
    id: 'keonjhar',
    name: 'Keonjhar',
    odiaName: 'କେନ୍ଦୁଝର',
    headquarters: 'Keonjhar',
    zone: 'Northern',
    tagline: 'Land of Majestic Waterfalls, Sacred Maa Tarini Ghatgaon & Sitabinji Rock Art',
    highlights: ['Sanaghagara & Badaghagara Waterfalls', 'Maa Tarini Temple (Ghatgaon)', 'Khandadhar Waterfall (Northern drop)', 'Sitabinji 5th-Century Rock Fresco (Ravana Chhaya)'],
    hiddenGems: ['Gonasika (Sacred Origin of Vaitarani River)', 'Murga Mahadev Waterfalls & Shrine', 'Hadagarh Dam & Salandi Reservoir', 'Gundichaghagi Waterfall'],
    ecoTourismAndNature: ['Sanaghagara Nature Camp', 'Gonasika Hill Forests', 'Hadagarh Wildlife Sanctuary'],
    handicraftsAndArt: ['Keonjhar Badi (famous handmade sun-dried lentil drops with GI pedigree)', 'Tribal woodcraft', 'Terracotta'],
    signatureCuisine: ['Keonjhar Badi Chura', 'Ghatgaon Tarini Ladu (Coconut-Jaggery consecrated bhoga)', 'Wild Forest Mushroom Tarkari'],
    foodSpots: [
      { item: 'Ghatgaon Tarini Sacred Coconut Ladu', recommendation: 'Maa Tarini Temple Trust Counter' },
      { item: 'Crispy Keonjhar Badi Fried with Mustard Oil & Garlic', recommendation: 'Keonjhar Town Market Eateries' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Keonjhar', type: 'OTDC Panthanivas', contact: '06766-253545', estPrice: '₹1,800 – ₹3,000/night' },
      { name: 'OTDC Panthasala Ghatgaon', type: 'Panthasala', contact: '06766-226020', estPrice: '₹1,200 – ₹2,000/night' },
      { name: 'Sanaghagara Nature Camp', type: 'Eco-Tourism Camp', contact: '+91 94373 70110', estPrice: '₹2,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Keonjhar Waterfall & Heritage Guides Guild',
      phone: '+91 94373 70110',
      deskLocation: 'Sanaghagara Eco-Park Counter, Keonjhar',
    },
    majorFestivals: ['Chaiti Parba at Ghatgaon', 'Baruni Yatra Gonasika', 'Rath Yatra of Keonjhar (tallest wooden chariot in the world)'],
    transportHubs: {
      nearestRail: 'Kendujhargarh Railway Station (KDJR)',
      nearestAirport: 'Bhubaneswar BBI (210 km)',
      highway: 'NH-20 connecting Ranchi and Cuttack',
      busServices: 'Direct high-frequency buses from Bhubaneswar, Cuttack, and Baripada',
      lastMileTransit: 'Auto-rickshaws easily reach Sanaghagara (5 km) and Badaghagara (9 km); buses connect to Ghatgaon (45 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'Dharanidhar Medical College & Hospital Keonjhar',
      hospitalContact: '06766-255201',
      controlRoomNumber: '06766-255201',
      policeStation: 'Keonjhar Town Police Station (06766-255325)',
    },
    description: 'A paradise of gushing cascades including Sanaghagara and Khandadhar, ancient 5th-century Gupta-period rock paintings at Sitabinji, and the miraculous Maa Tarini temple.',
  },
  {
    id: 'khordha',
    name: 'Khordha',
    odiaName: 'ଖୋର୍ଦ୍ଧା',
    headquarters: 'Bhubaneswar / Khordha',
    zone: 'Coastal',
    tagline: 'Temple Capital Bhubaneswar, Peace Pagoda Dhauli & Paika Rebellion Heritage',
    highlights: ['Lingaraj Temple & Ekamra Kshetra (7th–11th century stone temples)', 'Dhauli Shanti Stupa & Ashokan Rock Edict (261 BCE)', 'Udayagiri & Khandagiri Jain Caves', 'Nandankanan Zoological Park'],
    hiddenGems: ['Barunei Hill & Temple (Paika rebellion battleground)', 'Atri Sulfur Hot Spring', 'Deras & Jhumka Dam Eco-Camps (Chandaka Elephant Sanctuary)', 'Shishupalgarh Ancient Fortified City'],
    ecoTourismAndNature: ['Chandaka-Dampara Wildlife Sanctuary', 'Nandankanan Botanical Garden', 'Dhauli Peace Garden'],
    handicraftsAndArt: ['Stone carving (GI Tagged Odishan stone carving)', 'Pipili Applique craft (Puri border)', 'Palm-leaf engraving'],
    signatureCuisine: ['Bhubaneswar Dahibara Aloodum', 'Dalma at Odisha Hotel', 'Pahala Rasagola & Chhena Gaja', 'Old Town Chhena Poda'],
    foodSpots: [
      { item: 'Authentic Odia Kansa Thali & Dalma', recommendation: 'Odisha Hotel / Dalma Restaurant (Market Building)' },
      { item: 'Iconic Pahala Rasagola fresh from earthen pans', recommendation: 'Pahala Sweet Market on NH-16 (over 50 cluster stalls)' },
      { item: 'Old Town Dahibara Aloodum with Ghuguni', recommendation: 'Lingaraj Temple North Gate' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Bhubaneswar', type: 'OTDC Panthanivas', contact: '0674-2432515', estPrice: '₹2,500 – ₹4,500/night' },
      { name: 'Swosti Premium Hotel', type: 'Hotel / Resort', contact: '0674-2300014', estPrice: '₹4,500 – ₹8,500/night' },
      { name: 'Deras Nature Camp Chandaka', type: 'Eco-Tourism Camp', contact: '+91 94371 88320', estPrice: '₹2,800/night' },
    ],
    touristGuideInfo: {
      contactName: 'Ekamra Heritage Walk Guide Guild (ASI certified)',
      phone: '+91 94371 88320',
      deskLocation: 'Mukteswar Temple Information Kiosk, Old Town',
    },
    majorFestivals: ['Rukuna Rath Yatra of Lord Lingaraj (Ashokastami)', 'Dhauli-Kalinga Mahotsav', 'Rajarani Music Festival', 'Maha Shivaratri'],
    transportHubs: {
      nearestRail: 'Bhubaneswar Railway Station (BBS / BBSN - Prime junction)',
      nearestAirport: 'Biju Patnaik International Airport (BBI - Direct international & domestic flights)',
      highway: 'NH-16 & Biju Expressway',
      busServices: 'CRUT Mo Bus comprehensive urban transit covering airport, railway stations, Dhauli, and Khandagiri',
      lastMileTransit: 'Prepaid auto-rickshaws at BBI airport and railway station ensure official fixed tariffs',
    },
    safetyAndHelpline: {
      districtHospital: 'AIIMS Bhubaneswar (0674-2476789) & Capital Hospital (0674-2391983)',
      hospitalContact: '0674-2476789',
      controlRoomNumber: '0674-2391983',
      policeStation: 'Kharvel Nagar / Capital Police Station (0674-2533325)',
    },
    description: 'The political and cultural capital of Odisha, home to over 500 ancient Kalinga stone temples, Emperor Ashoka’s remorse edicts at Dhauli, and vibrant urban Mo Bus networks.',
  },
  {
    id: 'koraput',
    name: 'Koraput',
    odiaName: 'କୋରାପୁଟ',
    headquarters: 'Koraput',
    zone: 'Southern',
    tagline: 'GIAHS Agro-Heritage, Tribal Heartlands, Deomali & Gupteswar',
    highlights: ['Deomali Peak (Highest mountain peak in Odisha, 1,672m)', 'Gupteswar Cave Temple (limestone Shiva shrine)', 'Duduma Waterfall (175m on Machkund river)', 'Sabara Srikhetra Jagannath Temple & Tribal Museum'],
    hiddenGems: ['Kolab River Reservoir & Botanical Gardens', 'Jalaput Dam backwaters', 'Maliguda Stone Tunnel (India’s highest broad-gauge railway tunnel)', 'Baghra Waterfall'],
    ecoTourismAndNature: ['Deomali Grasslands & Hill Eco-Camp', 'Kolab Dam Nature Park', 'Machkund Valley Rain forests'],
    handicraftsAndArt: ['Kotpad Handloom with natural madder tree dye (GI Tagged)', 'Terracotta tribal beads', 'Tribal brass Dokra'],
    signatureCuisine: ['Koraput Arabica Coffee (GI Tagged high-altitude coffee)', 'Mandia Jau (Finger millet porridge)', 'Bamboo shoot Karadi', 'Desi Chicken Gravy'],
    foodSpots: [
      { item: 'Freshly Brewed Koraput Arabica Coffee', recommendation: 'Coffee Board Cafe & Deomali Hill Top Canteen' },
      { item: 'Mandia Jau & Bamboo Shoot Curry', recommendation: 'Jeypore Tribal Food Stalls' },
    ],
    recommendedStays: [
      { name: 'Deomali Hill Top Eco-Camp', type: 'Eco-Tourism Camp', contact: '+91 94374 12890', estPrice: '₹3,500/night (breathtaking sunrise views)' },
      { name: 'OTDC Panthanivas Koraput', type: 'OTDC Panthanivas', contact: '06852-250247', estPrice: '₹1,800 – ₹3,000/night' },
      { name: 'Hotel Hello Jeypore', type: 'Hotel / Resort', contact: '06854-232000', estPrice: '₹2,200 – ₹3,800/night' },
    ],
    touristGuideInfo: {
      contactName: 'Koraput Tribal Agro-Heritage Guides Association',
      phone: '+91 94374 12890',
      deskLocation: 'Tribal Museum Gate, Koraput',
    },
    majorFestivals: ['Parab Tribal Festival', 'Gupteswar Sivaratri Mela', 'Nuakhai', 'Chaitra Parba'],
    transportHubs: {
      nearestRail: 'Koraput Railway Station (KRPU) & Jeypore (JYP)',
      nearestAirport: 'Jeypore Airport (PYB) / Visakhapatnam VTZ (200 km)',
      highway: 'NH-26',
      busServices: 'Direct OSRTC buses to Visakhapatnam, Bhubaneswar, and Jagdalpur',
      lastMileTransit: 'Vistadome tourist train coach on Kirandul Express provides jaw-dropping Eastern Ghats mountain views',
    },
    safetyAndHelpline: {
      districtHospital: 'Saheed Laxman Nayak Medical College & Hospital Koraput',
      hospitalContact: '06852-250101',
      controlRoomNumber: '06852-250101',
      policeStation: 'Koraput Town Police Station (06852-250325)',
    },
    description: 'Globally recognized agricultural heritage region by FAO for indigenous rice biodiversity, home to the scenic Deomali mountain peaks and mystical limestone caves of Gupteswar.',
  },
  {
    id: 'malkangiri',
    name: 'Malkangiri',
    odiaName: 'ମାଲକାନଗିରି',
    headquarters: 'Malkangiri',
    zone: 'Southern',
    tagline: 'Land of Balimela Reservoir, Bonda Hills & Enchanting Satiguda Dam',
    highlights: ['Balimela Dam & Reservoir (Swabhiman Anchal)', 'Satiguda Dam & Eco-Park', 'Ammakunda Natural Perennial Fish Pool', 'Bonda Hills (Ancient Bonda tribal territory)'],
    hiddenGems: ['Gurupriya Bridge Panoramic Overlook', 'Manyamkonda Cave Shrine', 'Kanya Ashram Herbal Reserve'],
    ecoTourismAndNature: ['Balimela Reservoir Boating', 'Satiguda Forest Trails', 'Potteru Valley Green Corridor'],
    handicraftsAndArt: ['Bonda bead necklaces & Ringa weaving', 'Koya bamboo craft', 'Wild forest products'],
    signatureCuisine: ['Finger Millet (Ragi) Pej', 'Bamboo Shoot Fries', 'Fresh Balimela Dam Sweetwater Fish', 'Wild Yam Curry'],
    foodSpots: [
      { item: 'Fresh Balimela Reservoir Fish Fry', recommendation: 'Chitrakonda Dam View Canteens' },
      { item: 'Traditional Millet Gruel with Desi Chili Mash', recommendation: 'Malkangiri Weekly Haat Stalls' },
    ],
    recommendedStays: [
      { name: 'Chitrakonda Eco-Cottages Balimela', type: 'Eco-Tourism Camp', contact: '+91 94380 44210', estPrice: '₹2,500/night (lake boating included)' },
      { name: 'OTDC Panthasala Malkangiri', type: 'Panthasala', contact: '06861-230240', estPrice: '₹1,000 – ₹1,800/night' },
      { name: 'Satiguda Lake Guest House', type: 'Homestay', contact: '06861-231100', estPrice: '₹1,200/night' },
    ],
    touristGuideInfo: {
      contactName: 'Malkangiri Eco-Tourism & Cultural Desk',
      phone: '+91 94380 44210',
      deskLocation: 'District Tourist Information Counter, Collectorate Malkangiri',
    },
    majorFestivals: ['Manya Mela', 'Bada Yatra of Manyamkonda', 'Nuakhai', 'Bonda Festival'],
    transportHubs: {
      nearestRail: 'Jeypore Station (105 km) / Koraput (130 km)',
      nearestAirport: 'Jeypore (105 km) / Visakhapatnam (260 km)',
      highway: 'NH-326 connecting Asika & Malkangiri to Andhra Pradesh',
      busServices: 'Direct OSRTC buses from Bhubaneswar, Berhampur, and Jeypore',
      lastMileTransit: 'Speedboats operate across Balimela reservoir connecting remote island villages and eco-cottages',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Malkangiri',
      hospitalContact: '06861-230201',
      controlRoomNumber: '06861-230201',
      policeStation: 'Malkangiri Police Station (06861-230325)',
    },
    description: 'Bordering Andhra Pradesh and Chhattisgarh, Malkangiri features the vast Balimela reservoir, the ancient Bonda tribe, and the sacred perennial pool of Ammakunda.',
  },
  {
    id: 'mayurbhanj',
    name: 'Mayurbhanj',
    odiaName: 'ମୟୂରଭଞ୍ଜ',
    headquarters: 'Baripada',
    zone: 'Northern',
    tagline: 'UNESCO Biosphere Similipal, Royal Baripada Mudhi Mansa & Chhau Dance',
    highlights: ['Similipal National Park & Tiger Reserve', 'Barehipani Waterfall (399m two-tier drop)', 'Joranda Waterfall (181m plunge)', 'Khiching Kichakeswari Black Stone Temple'],
    hiddenGems: ['Deokund Sacred Waterfalls & Pool', 'Baripada Royal Palace (Mayurbhanj Bhanja Dynasty)', 'Haripur Gada Ruins (Ancient capital Rasikaraya temple)'],
    ecoTourismAndNature: ['Similipal Biosphere Reserve (Chahala & Barehipani Camps)', 'Deokund Forest Valley', 'Sitakund Natural Spring'],
    handicraftsAndArt: ['Sabai grass craft (ropes, baskets & carpets)', 'Khiching black granite stone carving', 'Chhau dance masks'],
    signatureCuisine: ['Baripada Mudhi Mansa (GI tag fame - puffed rice with goat meat)', 'Kai Chutney (GI Tagged red ant chutney with medicinal properties)', 'Mahua Honey'],
    foodSpots: [
      { item: 'Authentic Baripada Mudhi Mansa', recommendation: 'Devalaya Hotel & Royal Kitchen, Baripada Market' },
      { item: 'Tribal Kai Chutney tasting', recommendation: 'Jashipur & Baripada Weekly Haats' },
    ],
    recommendedStays: [
      { name: 'Similipal Nature Camps (Chahala / Barehipani / Jamuani)', type: 'Eco-Tourism Camp', contact: '+91 94372 10850', estPrice: '₹3,500 – ₹6,000/night (Forest Dept Eco Tour Odisha with safari)' },
      { name: 'The Belgadia Palace Heritage Hotel', type: 'Hotel / Resort', contact: '+91 98610 32200', estPrice: '₹6,500 – ₹12,000/night (18th-century royal palace stay)' },
      { name: 'OTDC Panthasala Baripada', type: 'Panthasala', contact: '06792-252554', estPrice: '₹1,500 – ₹2,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Similipal Certified Forest & Wildlife Guides Guild',
      phone: '+91 94372 10850',
      deskLocation: 'Pithabata & Jashipur Forest Entry Permit Gates',
    },
    majorFestivals: ['Mayurbhanj Chhau Dance Festival (Chaitra Parva)', 'Baripada Rath Yatra (Second oldest in Odisha, where women exclusively pull Maa Subhadra’s chariot)', 'Makar Mela'],
    transportHubs: {
      nearestRail: 'Baripada Station (BPO) / Balasore (60 km - Major trunk)',
      nearestAirport: 'Bhubaneswar BBI (240 km) / Kolkata CCU (230 km)',
      highway: 'NH-18 connecting Balasore and Jamshedpur',
      busServices: 'Direct luxury and express buses from Kolkata, Bhubaneswar, and Cuttack',
      lastMileTransit: 'Forest Dept registered 4x4 Bolero vehicles are mandatory for safaris entering Similipal from Pithabata or Jashipur gates',
    },
    safetyAndHelpline: {
      districtHospital: 'Pandit Raghunath Murmu Medical College & Hospital Baripada',
      hospitalContact: '06792-252101',
      controlRoomNumber: '06792-252101',
      policeStation: 'Baripada Town Police Station (06792-252325)',
    },
    description: 'Largest district in Odisha, featuring the UNESCO Biosphere Reserve of Similipal with royal Bengal tigers, the royal heritage of the Bhanja Maharajas, and martial Mayurbhanj Chhau dance.',
  },
  {
    id: 'nabarangpur',
    name: 'Nabarangpur',
    odiaName: 'ନବରଙ୍ଗପୁର',
    headquarters: 'Nabarangpur',
    zone: 'Southern',
    tagline: 'Land of Podagada Citadel, Lacquer Crafts & Chandandhara Waterfalls',
    highlights: ['Chandandhara Waterfall', 'Podagada Ancient Fort of Nala Dynasty', 'Hirli Dangar Hill & Cave Shrine', 'Shahid Smruti Stambha Papadahandi'],
    hiddenGems: ['Maa Bhandargharani Temple', 'Indravati River Reservoir catchments', 'Khatiguda Dam Nature View'],
    ecoTourismAndNature: ['Chandandhara River Gorge', 'Hirli Dangar Park', 'Podagada Hill Reserves'],
    handicraftsAndArt: ['Lacquer boxes and toys (GI Tagged Jhotikama)', 'Terracotta', 'Tribal bead jewelry'],
    signatureCuisine: ['Nabarangpur Maize Pitha', 'Country Rice Thali with Bamboo Shoot', 'Wild Honey', 'Bhandargharani Bhoga'],
    foodSpots: [
      { item: 'Traditional Maize & Ragi Snacks', recommendation: 'Nabarangpur Gandhi Chowk stalls' },
      { item: 'Indravati Sweetwater Fish Curry', recommendation: 'Khatiguda Dam Canteen' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthasala Nabarangpur', type: 'Panthasala', contact: '06858-222340', estPrice: '₹1,000 – ₹1,800/night' },
      { name: 'Hotel Nandan Nabarangpur', type: 'Hotel / Resort', contact: '06858-223300', estPrice: '₹1,200 – ₹2,200/night' },
      { name: 'Chandandhara Eco-Camp', type: 'Eco-Tourism Camp', contact: '+91 94371 99200', estPrice: '₹2,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Nabarangpur Heritage & Lacquer Craft Society',
      phone: '+91 94371 99200',
      deskLocation: 'District Tourist Office, Collectorate Nabarangpur',
    },
    majorFestivals: ['Mondei Tribal Festival (vibrant folk carnival)', 'Shivaratri at Podagada', 'Nuakhai'],
    transportHubs: {
      nearestRail: 'Jeypore Station (40 km) / Koraput (65 km)',
      nearestAirport: 'Jeypore (40 km) / Visakhapatnam (240 km)',
      highway: 'NH-26',
      busServices: 'Direct OSRTC buses from Bhubaneswar, Berhampur, and Raipur',
      lastMileTransit: 'Taxis and auto-rickshaws connect Nabarangpur town to Chandandhara Waterfall (28 km) and Papadahandi',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Nabarangpur',
      hospitalContact: '06858-222201',
      controlRoomNumber: '06858-222201',
      policeStation: 'Nabarangpur Police Station (06858-222325)',
    },
    description: 'Famous for the annual Mondei cultural festival, ancient rock inscriptions of the Nala kings at Podagada, and traditional lacquer artisan crafts.',
  },
  {
    id: 'nayagarh',
    name: 'Nayagarh',
    odiaName: 'ନୟାଗଡ଼',
    headquarters: 'Nayagarh',
    zone: 'Central',
    tagline: 'Birthplace of Chhena Poda, Nilamadhaba Kantilo & Satkosia South Bank',
    highlights: ['Kantilo Nilamadhaba Temple (Cradle of Jagannath worship)', 'Satkosia South Bank Eco-Camp (Badmul Sands)', 'Dashapalla (Birthplace of Chhena Poda)', 'Ranpur Jagannath Temple & Maninag Hill'],
    hiddenGems: ['Durgaprasad Tiger Corridor Eco-Camp', 'Tarabalo Largest Sulfur Hot Spring', 'Baisipalli Wildlife Sanctuary', 'Gokulananda Tourism Complex on Mahanadi'],
    ecoTourismAndNature: ['Satkosia Gorge Badmul Sandbars', 'Baisipalli Sanctuary', 'Tarabalo Geothermal Springs'],
    handicraftsAndArt: ['Kantilo brass and bell metal craft (GI tagged)', 'Sal leaf baking traditions', 'Wood carving'],
    signatureCuisine: ['Nayagarh Chhena Poda (India’s original baked cheesecake baked in sal leaves)', 'Kantilo Bell Metal Thali', 'Dalma', 'Chhena Jhili'],
    foodSpots: [
      { item: 'Original Nayagarh Sal-Leaf Roasted Chhena Poda', recommendation: 'Babulal Bakeries Dashapalla & Nayagarh Town Bus Stand' },
      { item: 'Kantilo Nilamadhaba Consecrated Prasad', recommendation: 'Nilamadhaba Temple Annachhatra' },
    ],
    recommendedStays: [
      { name: 'Satkosia Gorge Badmul Sands Nature Camp', type: 'Eco-Tourism Camp', contact: '+91 94370 21544', estPrice: '₹3,500 – ₹5,500/night (river boating included)' },
      { name: 'Kantilo Panthasala', type: 'Panthasala', contact: '06757-220140', estPrice: '₹1,200 – ₹2,000/night' },
      { name: 'Hotel Royal Nayagarh', type: 'Hotel / Resort', contact: '06753-252500', estPrice: '₹1,400 – ₹2,400/night' },
    ],
    touristGuideInfo: {
      contactName: 'Kantilo & Badmul Community Tourism Guild',
      phone: '+91 94370 21544',
      deskLocation: 'Kantilo Nilamadhaba Temple Information Gate',
    },
    majorFestivals: ['Magha Saptami at Kantilo', 'Dashapalla Lanka Podi Yatra', 'Pana Sankranti'],
    transportHubs: {
      nearestRail: 'Nayagarh Town Railway Station (NYGT)',
      nearestAirport: 'Bhubaneswar BBI (85 km)',
      highway: 'NH-57 connecting Khurda and Balangir',
      busServices: 'Direct high-frequency buses from Bhubaneswar and Cuttack every 20 minutes',
      lastMileTransit: 'Frequent autos and shared taxis run to Kantilo (30 km) and Badmul Satkosia eco-camps',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Nayagarh',
      hospitalContact: '06753-252201',
      controlRoomNumber: '06753-252201',
      policeStation: 'Nayagarh Town Police Station (06753-252325)',
    },
    description: 'The culinary birthplace of Chhena Poda and spiritual source of Lord Jagannath worship at Kantilo Nilamadhaba overlooking the Mahanadi River.',
  },
  {
    id: 'nuapada',
    name: 'Nuapada',
    odiaName: 'ନୂଆପଡ଼ା',
    headquarters: 'Nuapada',
    zone: 'Western',
    tagline: 'Sunabeda Tiger Reserve, Patora Dam Yogeshwar Temple & Godhas Waterfall',
    highlights: ['Patora Dam & Yogeshwar Shiva Temple', 'Sunabeda Wildlife Sanctuary & Waterfall Plateau', 'Godhas Waterfall', 'Manikgarh Ancient Fort'],
    hiddenGems: ['Thakurdungri Hill & Cave Shrine', 'Kharaldhas Waterfall in Komna', 'Baniabandha Ancient Buddhist Temple'],
    ecoTourismAndNature: ['Sunabeda Plateau Wild Grasslands', 'Patora Dam Catchment Park', 'Godhas Valley Streams'],
    handicraftsAndArt: ['Tribal terracotta', 'Bamboo basketry', 'Wild honey harvesting'],
    signatureCuisine: ['Nuapada Mahua Ladu', 'Desi Country Mutton Curry', 'Western Odisha Chaul Bara', 'Ragi Pej'],
    foodSpots: [
      { item: 'Western Odisha Chaul Bara with spicy mint gravy', recommendation: 'Khariar Road Station Market' },
      { item: 'Patora Dam Fresh Fish Curry', recommendation: 'Yogeshwar Temple Canteen' },
    ],
    recommendedStays: [
      { name: 'Patora Dam Eco-Resort', type: 'Eco-Tourism Camp', contact: '+91 94375 88210', estPrice: '₹2,200/night' },
      { name: 'OTDC Panthasala Khariar Road', type: 'Panthasala', contact: '06678-222450', estPrice: '₹1,000 – ₹1,800/night' },
      { name: 'Hotel Shubham Nuapada', type: 'Hotel / Resort', contact: '06678-223400', estPrice: '₹1,200 – ₹2,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Sunabeda Eco-Tourism & Wildlife Guides',
      phone: '+91 94375 88210',
      deskLocation: 'Sunabeda Sanctuary Office, Komna',
    },
    majorFestivals: ['Shivaratri at Patora Yogeshwar Temple', 'Nuakhai', 'Khariar Utsav'],
    transportHubs: {
      nearestRail: 'Khariar Road Railway Station (KRAR - On Raipur-Vizianagaram main line)',
      nearestAirport: 'Raipur RPR (120 km)',
      highway: 'NH-353 connecting Raipur and Bargarh',
      busServices: 'Direct buses to Raipur, Sambalpur, and Bhawanipatna',
      lastMileTransit: 'Auto-rickshaws connect Khariar Road to Patora Dam (18 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Nuapada',
      hospitalContact: '06678-223101',
      controlRoomNumber: '06678-223101',
      policeStation: 'Nuapada Police Station (06678-223325)',
    },
    description: 'Home to the pristine plateau of Sunabeda Wildlife Sanctuary, ancient waterfalls, and the magnificent Yogeshwar temple at Patora Dam.',
  },
  {
    id: 'puri',
    name: 'Puri',
    odiaName: 'ପୁରୀ',
    headquarters: 'Puri',
    zone: 'Coastal',
    tagline: 'Char Dham Jagannath Kshetra, World Heritage Konark & Heritage Artisans',
    highlights: ['Shree Jagannath Temple (Char Dham pilgrimage)', 'Konark Sun Temple (13th-century UNESCO World Heritage Site)', 'Puri Golden Beach (Blue Flag certified)', 'Raghurajpur Heritage Craft Village (Pattachitra)', 'Chilika Lake Satapada (Irrawaddy dolphins)'],
    hiddenGems: ['Baliharachandi Secluded Beach & Shrine', 'Pipili Applique Artisan Village', 'Siruli Mahavir Temple with rare eye-level idol', 'Sakhigopal Temple of Radha Krishna', 'Ramachandi Beach & Boating'],
    ecoTourismAndNature: ['Blue Flag Golden Beach', 'Balukhand-Konark Wildlife Sanctuary', 'Satapada Dolphin Lagoon'],
    handicraftsAndArt: ['Pattachitra cloth scrolls & Palm-leaf engraving (Raghurajpur GI)', 'Pipili Applique craft (GI)', 'Stone and wood carving', 'Coir craft'],
    signatureCuisine: ['Sacred Mahaprasad (Abhada) at Ananda Bazaar', 'Puri Khaja (GI Tagged sweet pastry)', 'Nimapara Chhena Jhili', 'Coastal Crab & Prawn Curry'],
    foodSpots: [
      { item: 'Sacred Mahaprasad Abhada (56 Bhoga)', recommendation: 'Ananda Bazaar inside Shree Jagannath Temple complex (daily from 1:30 PM)' },
      { item: 'Authentic Crispy Puri Khaja', recommendation: 'Kakatpur & Bada Danda Sweet Marts' },
      { item: 'Nimapara Chhena Jhili fresh and hot', recommendation: 'Nimapara Main Chowk Sweet Shops' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Puri', type: 'OTDC Panthanivas', contact: '06752-222562', estPrice: '₹2,500 – ₹4,500/night (beach facing)' },
      { name: 'OTDC Eco Retreat Konark', type: 'Hotel / Resort', contact: '0674-2430764', estPrice: '₹7,000 – ₹12,000/night (luxury glamping on beach)' },
      { name: 'Mayfair Waves Puri', type: 'Hotel / Resort', contact: '06752-231111', estPrice: '₹8,500 – ₹15,000/night' },
      { name: 'Raghurajpur Artisan Homestays', type: 'Homestay', contact: '+91 94372 10842', estPrice: '₹1,200 – ₹2,000/night' },
    ],
    touristGuideInfo: {
      contactName: 'Puri District Official Tourism & Temple Information Desk',
      phone: '+91 94372 10842',
      deskLocation: 'Singhadwara Information Counter & Railway Station Booth',
    },
    majorFestivals: ['World Famous Shree Jagannath Ratha Yatra (Car Festival)', 'Chandan Yatra', 'Konark Dance & Sand Art Festival', 'Puri Beach Festival'],
    transportHubs: {
      nearestRail: 'Puri Railway Station (PURI - Major terminal with Vande Bharat & superfast expresses)',
      nearestAirport: 'Bhubaneswar BBI (60 km via NH-316)',
      highway: 'NH-316 (Bhubaneswar-Puri 4-lane highway) & Marine Drive',
      busServices: 'CRUT Mo Bus Route 70 connects BBI Airport to Puri every 20 mins; Route 71 connects Puri to Konark',
      lastMileTransit: 'Regulated battery e-rickshaws (₹20/head) run between Puri railway station, temple, and beach',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Puri (Grand Road)',
      hospitalContact: '06752-222045',
      controlRoomNumber: '06752-222045',
      policeStation: 'Puri Sea Beach Tourist Police Station (06752-222074)',
    },
    description: 'The spiritual heart of Odisha, home to the sacred Char Dham temple of Lord Jagannath, the architectural masterpiece of the Konark Sun Temple, and the artisan colonies of Raghurajpur.',
  },
  {
    id: 'rayagada',
    name: 'Rayagada',
    odiaName: 'ରାୟଗଡ଼ା',
    headquarters: 'Rayagada',
    zone: 'Southern',
    tagline: 'Maa Majhighariani Shrine, Dongria Kondh Niyamgiri & Chatikona Falls',
    highlights: ['Maa Majhighariani Temple (Sacred wish-fulfilling deity)', 'Chatikona Waterfalls & Dongria Kondh Weekly Market', 'Minajhoola (Confluence of 3 rivers)', 'Hanging Bridge at Chekaguda'],
    hiddenGems: ['Devagiri Cave & Perennial Spring in Kalyanasinghpur', 'Hatipathar Waterfall (elephant-shaped stone boulders)', 'Padmapur 7th-Century Jagamanda Temple'],
    ecoTourismAndNature: ['Niyamgiri Hill Ranges', 'Nagavali River Rapids', 'Chatikona Forest Cascades'],
    handicraftsAndArt: ['Dongria Kondh embroidered Kapdaganda shawls (GI Tagged)', 'Terracotta tribal artifacts', 'Bamboo craft'],
    signatureCuisine: ['Dongria Kondh Organic Honey', 'Rayagada Country Chicken Curry', 'Mandia Pej (millet gruel)', 'Ragi Pitha'],
    foodSpots: [
      { item: 'Authentic Majhighariani Temple Bhoga', recommendation: 'Majhighariani Temple Counter' },
      { item: 'Tribal Ragi Pej and Country Chicken Curry', recommendation: 'Chatikona Weekly Market Stalls (Wednesdays)' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Rayagada', type: 'OTDC Panthanivas', contact: '06856-222340', estPrice: '₹1,500 – ₹2,800/night' },
      { name: 'Hotel Sai International Rayagada', type: 'Hotel / Resort', contact: '06856-224400', estPrice: '₹1,800 – ₹3,200/night' },
      { name: 'Chatikona Eco-Camp Niyamgiri', type: 'Eco-Tourism Camp', contact: '+91 94381 22890', estPrice: '₹2,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Niyamgiri Cultural Preservation & Eco-Guide Desk',
      phone: '+91 94381 22890',
      deskLocation: 'District Tourist Office, Collectorate Rayagada',
    },
    majorFestivals: ['Chaitra Parva of Majhighariani', 'Kalyanasinghpur Sivaratri', 'Nuakhai', 'Dongria Kondh Niyamraja Festival'],
    transportHubs: {
      nearestRail: 'Rayagada Junction (RGDA - Major railway junction on Howrah-Chennai & Raipur-Vizag routes)',
      nearestAirport: 'Visakhapatnam VTZ (180 km)',
      highway: 'NH-326',
      busServices: 'Direct OSRTC buses to Visakhapatnam, Berhampur, and Bhubaneswar',
      lastMileTransit: 'Auto-rickshaws and shared jeeps connect Rayagada town to Majhighariani temple (2 km) and Chatikona (45 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Rayagada',
      hospitalContact: '06856-222201',
      controlRoomNumber: '06856-222201',
      policeStation: 'Rayagada Town Police Station (06856-222325)',
    },
    description: 'Renowned for the revered shrine of Goddess Majhighariani, the picturesque Niyamgiri hills where the Dongria Kondh craft the GI-tagged Kapdaganda shawl, and gushing waterfalls at Chatikona.',
  },
  {
    id: 'sambalpur',
    name: 'Sambalpur',
    odiaName: 'ସମ୍ବଲପୁର',
    headquarters: 'Sambalpur',
    zone: 'Western',
    tagline: 'World’s Longest Hirakud Dam, Maa Samaleswari & Sambalpuri Saree Capital',
    highlights: ['Hirakud Dam (25.8 km long earthen dam & Gandhi Minar)', 'Maa Samaleswari Temple (SAMALEI Heritage Corridor)', 'Huma Leaning Temple of Lord Shiva', 'Debrigarh Wildlife Sanctuary'],
    hiddenGems: ['Chiplima Waterfall & Hydroelectric Canal', 'Ghanteswari Temple (Bells Temple on Mahanadi)', 'Cattle Island in Hirakud Reservoir', 'Gudguda Waterfall (rock formations)'],
    ecoTourismAndNature: ['Hirakud Reservoir & Nehru Minar Park', 'Debrigarh Nature Camp (on lake dyke)', 'Huma Riverbank Mahseer fish feeding pool'],
    handicraftsAndArt: ['World-famous Sambalpuri Ikat Handloom (Bandha GI Tag)', 'Sambalpuri folk music instruments (Dhol, Nisan, Tasa)', 'Terracotta'],
    signatureCuisine: ['Sambalpuri Chaul Dhuda', 'Sarsotia Sweet (crisp sweet made from ganjer tree twigs)', 'Pakhal with Badi Chura', 'Mahanadi Fresh Fish Fry'],
    foodSpots: [
      { item: 'Authentic Sarsotia & Chaul Bara', recommendation: 'Golbazar Sweet Stalls, Sambalpur' },
      { item: 'Fresh Mahanadi River Fish with Badi Chura', recommendation: 'Hirakud Dyke Dhabas' },
      { item: 'Maa Samaleswari Mahaprasad', recommendation: 'Samaleswari Temple Annachhatra' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Sambalpur', type: 'OTDC Panthanivas', contact: '0663-2411282', estPrice: '₹1,800 – ₹3,200/night' },
      { name: 'Debrigarh Nature Camp', type: 'Eco-Tourism Camp', contact: '+91 94371 49832', estPrice: '₹3,500 – ₹5,500/night (reservoir boat safari included)' },
      { name: 'The Grand Siba Sambalpur', type: 'Hotel / Resort', contact: '0663-2541111', estPrice: '₹2,800 – ₹4,800/night' },
    ],
    touristGuideInfo: {
      contactName: 'Sambalpur SAMALEI Heritage Guide Guild',
      phone: '+91 98610 52319',
      deskLocation: 'SAMALEI Corridor Information Counter, Sambalpur',
    },
    majorFestivals: ['Nuakhai (Greatest agrarian festival of Western Odisha)', 'Sital Sasthi (Divine wedding festival of Shiva & Parvati)', 'Sambalpur Lok Mahotsav'],
    transportHubs: {
      nearestRail: 'Sambalpur Junction (SBP) & Sambalpur City (SBPY)',
      nearestAirport: 'Jharsuguda JRG (60 km via Biju Expressway)',
      highway: 'NH-53 (Kolkata-Mumbai) & Biju Expressway',
      busServices: 'Direct high-frequency buses from Bhubaneswar, Rourkela, and Raipur',
      lastMileTransit: 'City buses and auto-rickshaws connect Sambalpur town to Hirakud Gandhi Minar (15 km) and Huma Leaning Temple (23 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'VIMSAR Burla (Premier Western Medical College) & DHH Sambalpur',
      hospitalContact: '0663-2430768',
      controlRoomNumber: '0663-2400101',
      policeStation: 'Sambalpur Town Police Station (0663-2400325)',
    },
    description: 'The cultural metropolis of Western Odisha, famed for the magnificent Hirakud Dam across the Mahanadi, the presiding deity Maa Samaleswari, and world-renowned Sambalpuri Ikat handlooms.',
  },
  {
    id: 'subarnapur',
    name: 'Subarnapur',
    odiaName: 'ସୁବର୍ଣ୍ଣପୁର',
    headquarters: 'Sonepur',
    zone: 'Western',
    tagline: 'The Second Varanasi of Odisha, Confluence of Mahanadi & Tel, Bomkai Silk',
    highlights: ['Subarnameru Temple', 'Sureswari Temple', 'Confluence of Mahanadi and Tel Rivers', 'Papakshya Ghat'],
    hiddenGems: ['Lanka Podi Mela Heritage Ground', 'Khandahata Forest Cave', 'Gokarneswar Shiva Temple on river bed', 'Metakani Temple in Ullunda'],
    ecoTourismAndNature: ['Mahanadi-Tel River Confluence Island', 'Telen River Eco-Bank', 'Binika Riverfront Gardens'],
    handicraftsAndArt: ['Bomkai Silk and Cotton Sarees (GI Tagged Sonepuri Pata)', 'Terracotta crafts', 'Brass bells'],
    signatureCuisine: ['Sonepuri Pitha', 'River Fish Curry cooked in mustard gravy', 'Khali Patra Confectionery', 'Chaul Bara'],
    foodSpots: [
      { item: 'Authentic Sonepuri Pitha and Sweets', recommendation: 'Manamunda & Sonepur Main Market' },
      { item: 'Fresh Tel River Fish Thali', recommendation: 'Confluence Ghat Dhabas' },
    ],
    recommendedStays: [
      { name: 'Sonepur Panthasala', type: 'Panthasala', contact: '06654-220240', estPrice: '₹1,000 – ₹1,800/night' },
      { name: 'Mahanadi Heritage River Lodge', type: 'Hotel / Resort', contact: '06654-221200', estPrice: '₹1,200 – ₹2,200/night' },
      { name: 'Hotel Royal Palace Sonepur', type: 'Hotel / Resort', contact: '06654-222300', estPrice: '₹1,500 – ₹2,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Sonepur Temple & Handloom Guide Guild',
      phone: '+91 94373 11840',
      deskLocation: 'Subarnameru Temple Gate, Sonepur',
    },
    majorFestivals: ['Lanka Podi Festival (unique demon effigy burning tradition)', 'Sital Sasthi Sonepur', 'Nuakhai', 'Bali Yatra'],
    transportHubs: {
      nearestRail: 'Sonepur Railway Station (SNPU) / Balangir (45 km)',
      nearestAirport: 'Jharsuguda JRG (160 km) / Bhubaneswar BBI (250 km)',
      highway: 'NH-57 & State Highways connecting Sambalpur and Balangir',
      busServices: 'Direct OSRTC buses from Bhubaneswar, Sambalpur, and Balangir',
      lastMileTransit: 'Auto-rickshaws easily reach Subarnameru temple and the Mahanadi-Tel river confluence (within 2 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'District Headquarters Hospital Sonepur',
      hospitalContact: '06654-220101',
      controlRoomNumber: '06654-220101',
      policeStation: 'Sonepur Town Police Station (06654-220325)',
    },
    description: 'Known as the Second Varanasi of India for its dense cluster of ancient temples, scenic confluence of Mahanadi and Tel rivers, and world-famous Bomkai silk handlooms.',
  },
  {
    id: 'sundargarh',
    name: 'Sundargarh',
    odiaName: 'ସୁନ୍ଦରଗଡ଼',
    headquarters: 'Sundargarh / Rourkela',
    zone: 'Northern',
    tagline: 'Cradle of Indian Hockey, Steel City Rourkela & Khandadhar Waterfall',
    highlights: ['Hanuman Vatika Rourkela (75-foot monumental statue)', 'Khandadhar Waterfall (244m cascade)', 'Vedvyas Temple (Confluence of Sankh, Koel & Saraswati)', 'Mandira Dam & Reservoir'],
    hiddenGems: ['Miriglotah Waterfalls', 'Ushakothi Prehistoric Rock Paintings in Hemgir', 'Vaishno Devi Temple on Durgapur Hill Rourkela', 'Darjing Picnic Resort on Brahmani river'],
    ecoTourismAndNature: ['Khandadhar Nature Camp (Eco Tour Odisha)', 'Mandira Dam Boating Park', 'Tensa Hill Station & Forest Viewpoint'],
    handicraftsAndArt: ['Tribal bell metal craft', 'Bamboo work', 'Kisan and Oraon tribal embroidery'],
    signatureCuisine: ['Sundargarh Badi', 'Millet Mudhi', 'Wild Mushroom Sukhua', 'Rourkela Sector Market Chaat'],
    foodSpots: [
      { item: 'Rourkela Sector 5 Famous Street Chaat & Dahi Vada', recommendation: 'VIP Market Sector 5 Rourkela' },
      { item: 'Fresh River Fish & Sundargarh Badi Thali', recommendation: 'Vedvyas Temple Gate Dhabas' },
    ],
    recommendedStays: [
      { name: 'OTDC Panthanivas Rourkela', type: 'OTDC Panthanivas', contact: '0661-2464149', estPrice: '₹2,000 – ₹3,500/night' },
      { name: 'Khandadhar Nature Camp', type: 'Eco-Tourism Camp', contact: '+91 94371 55900', estPrice: '₹3,000/night (waterfall guided trek included)' },
      { name: 'Mayfair World Cup Village Rourkela', type: 'Hotel / Resort', contact: '0661-6660101', estPrice: '₹4,500 – ₹8,500/night' },
      { name: 'Hotel Regency Sundargarh', type: 'Hotel / Resort', contact: '06622-272500', estPrice: '₹1,500 – ₹2,500/night' },
    ],
    touristGuideInfo: {
      contactName: 'Vedvyas & Khandadhar Tourism Society',
      phone: '+91 94371 55900',
      deskLocation: 'Vedvyas Temple Information Kiosk, Rourkela',
    },
    majorFestivals: ['Vedvyas Sivaratri Mela', 'Karma Puja', 'Bihan Puja', 'Rourkela International Hockey Celebrations'],
    transportHubs: {
      nearestRail: 'Rourkela Junction (ROU - Major Superfast terminal on Howrah-Mumbai trunk) & Sundargarh (SHG)',
      nearestAirport: 'Rourkela Airport (RRK - Commercial flights to Bhubaneswar and Kolkata)',
      highway: 'NH-143 & Biju Expressway',
      busServices: 'Direct high-frequency luxury and express buses to Ranchi, Kolkata, and Bhubaneswar',
      lastMileTransit: 'Rourkela City Mo Bus network operates across sectors; taxis available to Khandadhar waterfalls (50 km)',
    },
    safetyAndHelpline: {
      districtHospital: 'Government Medical College Sundargarh & Ispat General Hospital (IGH) Rourkela',
      hospitalContact: '0661-2510101',
      controlRoomNumber: '06622-272101',
      policeStation: 'Rourkela Plant Site Police Station (0661-2510325)',
    },
    description: 'Nursery of world-class Indian hockey icons, housing Rourkela Steel Plant, the monumental 75-foot statue at Hanuman Vatika, and the sacred Vedvyas river confluence where sage Vyasa wrote the Mahabharata.',
  },
];

/**
 * Filter 30 districts by geographical zone
 */
export function getDistrictsByZone(
  zone: 'All' | 'Coastal' | 'Western' | 'Southern' | 'Northern' | 'Central'
): DistrictInfo[] {
  if (zone === 'All') return ODISHA_30_DISTRICTS;
  return ODISHA_30_DISTRICTS.filter((d) => d.zone === zone);
}

const HINDI_DISTRICT_MAP: Record<string, string> = {
  'पुरी': 'puri',
  'कटक': 'cuttack',
  'खोरधा': 'khordha',
  'भुवनेश्वर': 'khordha',
  'मयूरभंज': 'mayurbhanj',
  'बारीपदा': 'mayurbhanj',
  'संबलपुर': 'sambalpur',
  'कोरापुट': 'koraput',
  'गंजाम': 'ganjam',
  'ब्रह्मपुर': 'ganjam',
  'बालेश्वर': 'balasore',
  'बालासोर': 'balasore',
  'भद्रक': 'bhadrak',
  'जाजपुर': 'jajpur',
  'केंद्रपाड़ा': 'kendrapara',
  'केन्द्रपड़ा': 'kendrapara',
  'जगतसिंहपुर': 'jagatsinghpur',
  'ढेंकानाल': 'dhenkanal',
  'ढेंकनाल': 'dhenkanal',
  'अंगुल': 'angul',
  'अनुगुल': 'angul',
  'नयागढ़': 'nayagarh',
  'कंधमाल': 'kandhamal',
  'फुलबाणी': 'kandhamal',
  'कालाहांडी': 'kalahandi',
  'भवानीपटना': 'kalahandi',
  'रायगड़ा': 'rayagada',
  'नवरंगपुर': 'nabarangpur',
  'नबरंगपुर': 'nabarangpur',
  'मलकानगिरि': 'malkangiri',
  'बलांगीर': 'bolangir',
  'बोलांगिर': 'bolangir',
  'बरगढ़': 'bargarh',
  'झारसुगुड़ा': 'jharsuguda',
  'सुंदरगढ़': 'sundargarh',
  'राउरकेला': 'sundargarh',
  'क्योंझर': 'keonjhar',
  'केंदुझर': 'keonjhar',
  'सुवर्णपुर': 'subarnapur',
  'सोनपुर': 'subarnapur',
  'बौध': 'boudh',
  'नुआपड़ा': 'nuapada',
  'गजपति': 'gajapati',
  'पारलाखेमुंडी': 'gajapati',
  'देवगढ़': 'deogarh',
};

/**
 * Find district by ID, name, or substring embedded inside a query
 */
export function findDistrict(query: string): DistrictInfo | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();

  // 0. Match by Hindi Devanagari district alias
  for (const [hindiAlias, districtId] of Object.entries(HINDI_DISTRICT_MAP)) {
    if (query.includes(hindiAlias)) {
      const match = ODISHA_30_DISTRICTS.find((d) => d.id === districtId);
      if (match) return match;
    }
  }

  // 1. Direct exact equality by ID, English name, or Odia name
  const direct = ODISHA_30_DISTRICTS.find(
    (d) =>
      d.id === q ||
      d.name.toLowerCase() === q ||
      d.odiaName === q ||
      d.headquarters.toLowerCase() === q
  );
  if (direct) return direct;

  // 2. Check if the user query contains any district name, Odia name, or headquarters
  const matchInSentence = ODISHA_30_DISTRICTS.find(
    (d) =>
      q.includes(d.name.toLowerCase()) ||
      query.includes(d.odiaName) ||
      (d.headquarters.length > 3 && q.includes(d.headquarters.toLowerCase()))
  );
  if (matchInSentence) return matchInSentence;

  // 3. Match by famous landmarks, highlights, or eco-tourism sites
  const landmarkMatch = ODISHA_30_DISTRICTS.find((d) =>
    d.highlights.some((h) => {
      const hLower = h.toLowerCase();
      return q.includes(hLower) || (hLower.length > 4 && hLower.includes(q));
    }) ||
    d.ecoTourismAndNature.some((e) => {
      const eLower = e.toLowerCase();
      return q.includes(eLower) || (eLower.length > 4 && eLower.includes(q));
    }) ||
    d.hiddenGems?.some((g) => {
      const gLower = g.toLowerCase();
      return q.includes(gLower) || (gLower.length > 4 && gLower.includes(q));
    })
  );
  if (landmarkMatch) return landmarkMatch;

  // 4. Match by signature food, GI tags, or craft clusters
  const foodMatch = ODISHA_30_DISTRICTS.find((d) =>
    d.signatureCuisine.some((c) => q.includes(c.toLowerCase()) || (c.length > 4 && c.toLowerCase().includes(q))) ||
    d.foodSpots?.some((f) => q.includes(f.item.toLowerCase())) ||
    d.handicraftsAndArt.some((a) => q.includes(a.toLowerCase()))
  );
  if (foodMatch) return foodMatch;

  // 5. Match by transport hubs (airports, major railway stations, highways)
  const transportMatch = ODISHA_30_DISTRICTS.find((d) =>
    (d.transportHubs.nearestAirport && q.includes(d.transportHubs.nearestAirport.toLowerCase())) ||
    q.includes(d.transportHubs.nearestRail.toLowerCase()) ||
    q.includes(d.transportHubs.highway.toLowerCase())
  );
  if (transportMatch) return transportMatch;

  // 6. Fallback: district name contains q (if query was short/partial like "mayur" or "sambal")
  return ODISHA_30_DISTRICTS.find((d) => d.name.toLowerCase().includes(q));
}
