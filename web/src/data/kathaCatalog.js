import { DISTRICTS } from './districtsCatalog.js';

export function normalizeStoryKey(titleEn, bodyEn) {
  return `${String(titleEn || '').trim().toLowerCase()}::${String(bodyEn || '').trim().toLowerCase()}`
    .replace(/\s+/g, ' ');
}

export function isNearDuplicateStory(candidateBody, existingBodies, threshold = 0.8) {
  const toSet = (str) =>
    new Set(
      String(str || '')
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)
    );

  const candidateTokens = toSet(candidateBody);
  if (candidateTokens.size === 0) return false;

  for (const existing of existingBodies) {
    const existingTokens = toSet(existing);
    if (existingTokens.size === 0) continue;
    let intersection = 0;
    for (const token of candidateTokens) {
      if (existingTokens.has(token)) intersection++;
    }
    const union = candidateTokens.size + existingTokens.size - intersection;
    if (union > 0 && intersection / union >= threshold) {
      return true;
    }
  }
  return false;
}

const CURATED_CORE_STORIES = [
  {
    id: 'katha_puri_konark_wheels',
    districtId: 'puri',
    destinationName: 'Konark Sun Temple',
    category: 'Sacred Architecture',
    period: '13th Century CE (Eastern Ganga Dynasty, c. 1250 CE)',
    factClassification: 'Documented Historical Record',
    sources: 'UNESCO World Heritage Dossier #246; ASI Konark Monograph by Debala Mitra',
    durationSec: 240,
    titleEn: "The 24 Sundial Wheels of Konark's Celestial Chariot",
    titleOdia: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ରଥର ୨୪ଟି କାଳଚକ୍ର',
    titleHindi: 'कोणार्क सूर्य रथ के २४ कालचक्र पहिये',
    bodyEn:
      "Constructed under Maharaja Narasimhadeva I on the Chandrabhaga coast, the Konark Sun Temple was conceived as Surya's colossal khondalite stone chariot pulled by seven galloping horses. Its 24 nine-foot wheels represent the 24 fortnights (pakshas) of the lunar-solar year, while the eight major spokes and eight minor spokes divide day and night into precise 90-minute praharas and three-minute intervals when read from the shadow cast upon the axle beads. Archaeological records confirm the use of khondalite for structural walls, green chlorite for precision doorframes and Surya icons, and forged iron beams centuries ahead of modern metallurgy.",
    bodyOdia:
      'ମହାରାଜା ପ୍ରଥମ ନରସିଂହଦେବଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ସାତୋଟି ଅଶ୍ୱ ଦ୍ୱାରା ଟଣାଯାଉଥିବା ଏକ ବିଶାଳ ପ୍ରସ୍ତର ରଥ ରୂପେ ଗଢ଼ାଯାଇଥିଲା। ଏହାର ୨୪ଟି ଚକ ବର୍ଷର ୨୪ଟି ପକ୍ଷକୁ ସୂଚାଏ ଏବଂ ଅରଗୁଡ଼ିକ ସୂର୍ଯ୍ୟଛାୟା ମାଧ୍ୟମରେ ସଠିକ୍ ସମୟ ଗଣନା କରେ।',
    bodyHindi:
      'महाराजा नरसिंहदेव प्रथम द्वारा निर्मित कोणार्क सूर्य मंदिर सात अश्वों द्वारा खींचे जाने वाले भव्य पाषाण रथ के रूप में गढ़ा गया है। इसके २४ पहिये पखवाड़ों के प्रतीक हैं और इनकी तीलियाँ धूपघड़ी की तरह सटीक समय बताती हैं।'
  },
  {
    id: 'katha_khordha_dhauli_ashoka',
    districtId: 'khordha',
    destinationName: 'Dhauli & Udayagiri-Khandagiri',
    category: 'Ancient Kingdoms',
    period: '261 BCE (Mauryan & Kalinga Era)',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'Corpus Inscriptionum Indicarum Vol. I; ASI Hathigumpha & Dhauli Records',
    durationSec: 225,
    titleEn: "From Kalinga's Battlefield to the Rock Edicts of Dhauli",
    titleOdia: 'କଳିଙ୍ଗ ଯୁଦ୍ଧରୁ ଧଉଳି ଶିଳାଲେଖ: ଚଣ୍ଡାଶୋକରୁ ଧର୍ମାଶୋକ',
    titleHindi: 'कलिंग युद्ध से धौली शिलालेख तक का रूपांतरण',
    bodyEn:
      "Along the Daya river plains south of Bhubaneswar rises Dhauli hill, where Mauryan Emperor Ashoka ordered his Separate Kalinga Rock Edicts engraved in Prakrit and Brahmi script around 261 BCE. Above the inscriptions emerges Odisha's earliest dated sculpture: the forepart of an elephant carved out of living rock, symbolizing calm awakening. Two centuries later, across the valley at Udayagiri, Mahameghavahana Emperor Kharavela inscribed the 17-line Hathigumpha chronicle recording canal extensions, musical patronage, and the triumphant return of the Kalinga Jina image.",
    bodyOdia:
      'ଦୟା ନଦୀ କୂଳରେ ଅବସ୍ଥିତ ଧଉଳି ପାହାଡ଼ରେ ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ ପରେ ସମ୍ରାଟ ଅଶୋକଙ୍କ ପ୍ରାକୃତ-ବ୍ରାହ୍ମୀ ଶିଳାଲେଖ ଓ ଶିଳାଖୋଦିତ ହସ୍ତୀ ମୂର୍ତ୍ତି ଓଡ଼ିଶାର ସର୍ବପ୍ରାଚୀନ ଐତିହାସିକ କୀର୍ତ୍ତି ଅଟେ।',
    bodyHindi:
      'दया नदी के तट पर स्थित धौली पहाड़ी पर २६१ ईसा पूर्व के कलिंग युद्ध के पश्चात सम्राट अशोक के प्राकृत-ब्राह्मी शिलालेख और शैल-उत्कीर्ण गज प्रतिमा स्थापित हैं।'
  },
  {
    id: 'katha_cuttack_boita_bali_jatra',
    districtId: 'cuttack',
    destinationName: 'Barabati & Mahanadi Gadagadia Ghat',
    category: 'Ancient Kingdoms',
    period: 'Ancient to Medieval Maritime Era',
    factClassification: 'Documented Historical Record',
    sources: 'Odisha State Maritime Museum Cuttack; K.C. Panigrahi, History of Orissa',
    durationSec: 210,
    titleEn: "Sadhabas of Kalinga: Maritime Voyages & Cuttack's Bali Jatra",
    titleOdia: 'କଳିଙ୍ଗର ସାଧବ ପୁଅ ଓ କଟକର ଐତିହାସିକ ବାଲିଯାତ୍ରା',
    titleHindi: 'कलिंग के साधव नाविक और कटक की बाली यात्रा',
    bodyEn:
      "On Kartika Purnima, when northeast retreating monsoon winds turned favorable across the Bay of Bengal, Kalinga's Sadhaba merchant mariners set sail in wooden stitched vessels called Boitas from ports such as Tamralipti, Palur, Manikapatna, and Chelitola toward Suvarnabhumi — Bali, Java, Sumatra, Borneo, and Sri Lanka. Every November at Cuttack's Gadagadia Ghat beside Barabati Fort, millions commemorate these trans-oceanic cultural and textile exchanges through Boita Bandana and the grand Bali Jatra riverfront fair.",
    bodyOdia:
      'କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା ପ୍ରଭାତରେ ଉତ୍କଳୀୟ ସାଧବମାନେ ବୋଇତ ଯୋଗେ ବାଲି, ଜାଭା, ସୁମାତ୍ରା ଓ ସିଂହଳକୁ ବାଣିଜ୍ୟ ଯାତ୍ରା କରୁଥିଲେ। ମହାନଦୀ ପଠାରେ ଅନୁଷ୍ଠିତ କଟକ ବାଲିଯାତ୍ରା ସେହି ନୌବାଣିଜ୍ୟ ଗୌରବର ଜୀବନ୍ତ ସ୍ମୃତି।',
    bodyHindi:
      'कार्तिक पूर्णिमा पर कलिंग के साधव व्यापारी अपनी नौकाओं (बोइत) से बाली, जावा और सुमात्रा की समुद्री यात्रा पर निकलते थे, जिसकी स्मृति में महानदी तट पर बाली यात्रा मनाई जाती है।'
  },
  {
    id: 'katha_dhenkanal_baji_rout',
    districtId: 'dhenkanal',
    destinationName: 'Nilakanthapur Ghat, Dhenkanal',
    category: 'Freedom Movement',
    period: '11 October 1938 (Prajamandal Freedom Struggle)',
    factClassification: 'Documented Historical Record',
    sources: "Who's Who of Freedom Workers in Orissa, Odisha State Archives",
    durationSec: 175,
    titleEn: 'Twelve-Year-Old Sentinel of the Brahmani: Martyr Baji Rout',
    titleOdia: 'ବ୍ରାହ୍ମଣୀ ଘାଟର ବୀର ବାଳକ ସହିଦ ବାଜି ରାଉତ',
    titleHindi: 'ब्राह्मणी नदी के बारह वर्षीय अमर शहीद बाजी राउत',
    bodyEn:
      "On the rainy night of 10–11 October 1938 at Nilakanthapur Ghat on the Brahmani river in Dhenkanal, twelve-year-old Banarsena volunteer Baji Rout stood guard beside his country boat. Ordered by armed colonial police troops to ferry them across the river after village raids, young Baji courageously refused to betray his people's Prajamandal struggle. His sacrifice made him India's youngest documented martyr of the freedom movement, immortalized in Sachidananda Routray's epic poem 'Baji Rout'.",
    bodyOdia:
      '୧୯୩୮ ଅକ୍ଟୋବର ୧୧ ରାତିରେ ବ୍ରାହ୍ମଣୀ ନଦୀର ନୀଳକଣ୍ଠପୁର ଘାଟରେ ମାତ୍ର ବାର ବର୍ଷର ବାଳକ ବାଜି ରାଉତ ବ୍ରିଟିଶ ଫୌଜଙ୍କୁ ଡଙ୍ଗା ପାରି କରାଇବାକୁ ମନା କରି ଦେଶ ପାଇଁ ପ୍ରାଣବଳି ଦେଇଥିଲେ।',
    bodyHindi:
      '११ अक्टूबर १९३८ की रात ढेंकानाल के नीलकंठपुर घाट पर बारह वर्षीय नाविक बालक बाजी राउत ने ब्रिटिश पुलिस बल को नदी पार कराने से इनकार कर मातृभूमि के लिए सर्वोच्च बलिदान दिया।'
  },
  {
    id: 'katha_sambalpur_surendra_sai',
    districtId: 'sambalpur',
    destinationName: 'Sambalpur & Debrigarh Hills',
    category: 'Freedom Movement',
    period: '1827–1884 CE',
    factClassification: 'Documented Historical Record',
    sources: 'Sambalpur District Gazetteer & Burla Historical Archives',
    durationSec: 205,
    titleEn: 'Veer Surendra Sai & the Barabakhra Caves of Debrigarh',
    titleOdia: 'ବୀର ସୁରେନ୍ଦ୍ର ସାଏ ଓ ଡେବ୍ରିଗଡ଼ର ବାରବଖରା ଗୁମ୍ଫା',
    titleHindi: 'वीर सुरेंद्र साय और डेब्रीगढ़ का स्वतंत्रता संग्राम',
    bodyEn:
      'Decades before the revolt of 1857, Chauhan prince Veer Surendra Sai rallied tribal gountias—Binjhals, Gonds, and Kondhs—across Sambalpur and the dense Debrigarh hills against British annexation. Utilizing mountain passes and the twelve-chambered Barabakhra rock shelter, his guerrilla resistance persisted for years. In total, Surendra Sai endured nearly 37 years of imprisonment in Hazaribagh and Asirgarh Fort, breathing his last in 1884 as an unbowed icon of western Odisha.',
    bodyOdia:
      '୧୮୫୭ ମହାବିଦ୍ରୋହର ବହୁ ପୂର୍ବରୁ ବୀର ସୁରେନ୍ଦ୍ର ସାଏ ସମ୍ବଲପୁର ଓ ଡେବ୍ରିଗଡ଼ ଅଞ୍ଚଳର ଜନଜାତି ଓ ଗୌନ୍ତିଆମାନଙ୍କୁ ଏକତ୍ର କରି ଇଂରେଜ ଶାସନ ବିରୁଦ୍ଧରେ ଦୀର୍ଘ ସଂଗ୍ରାମ କରିଥିଲେ।',
    bodyHindi:
      '१८५७ की क्रांति से दशकों पहले वीर सुरेंद्र साय ने संबलपुर और डेब्रीगढ़ की पहाड़ियों में ब्रिटिश शासन के विरुद्ध अदम्य छापामार संघर्ष का नेतृत्व किया।'
  },
  {
    id: 'katha_koraput_sabara_kalajeera',
    districtId: 'koraput',
    destinationName: 'Koraput & Deomali Highlands',
    category: 'Tribal Heritage',
    period: 'Millennia-old Agrarian & Living Cultural Tradition',
    factClassification: 'Documented Historical Record',
    sources: 'FAO GIAHS Koraput Site Report; GI Registry of India; koraput.odisha.gov.in',
    durationSec: 215,
    titleEn: "Koraput's Sacred Heirloom Grains & Sabara Srikhetra",
    titleOdia: 'କୋରାପୁଟର ଶବର ଶ୍ରୀକ୍ଷେତ୍ର ଓ କଳାଜିରା ଧାନର ଐତିହ୍ୟ',
    titleHindi: 'कोरापुट का शबर श्रीक्षेत्र और कालाजीरा धान की विरासत',
    bodyEn:
      'High in the Eastern Ghats around Deomali and Jeypore, indigenous Paraja, Bhumia, Gadaba, and Kondh women farmers have conserved hundreds of landraces of upland paddy for over two thousand years — earning Koraput recognition from the UN Food and Agriculture Organization as a Globally Important Agricultural Heritage System. Foremost among these treasures is GI-tagged Koraput Kalajeera rice. At the heart of Koraput town stands Sabara Srikhetra, celebrating ancient Savara devotion where citizens of every community join together in pulling the sacred Ratha.',
    bodyOdia:
      'କୋରାପୁଟର ଆଦିବାସୀ କୃଷକମାନେ ସହସ୍ର ବର୍ଷ ଧରି କଳାଜିରା ସମେତ ଶତାଧିକ ଦେଶୀ ଧାନ ସଂରକ୍ଷଣ କରିଆସିଛନ୍ତି। ଏଠାକାର ଶବର ଶ୍ରୀକ୍ଷେତ୍ର ସର୍ବଜନୀନ ଭ୍ରାତୃତ୍ୱ ଓ ଶବର ପରମ୍ପରାର ପ୍ରତୀକ।',
    bodyHindi:
      'कोरापुट की जनजातीय महिला किसानों ने सहस्राब्दियों से सुगंधित कालाजीरा धान जैसी दुर्लभ किस्मों को संरक्षित किया है, जिसे संयुक्त राष्ट्र FAO ने वैश्विक कृषि धरोहर घोषित किया है।'
  },
  {
    id: 'katha_mayurbhanj_chhau_similipal',
    districtId: 'mayurbhanj',
    destinationName: 'Similipal Biosphere & Baripada',
    category: 'Nature & Eco',
    period: '18th Century CE to Present',
    factClassification: 'Documented Historical Record',
    sources: 'UNESCO ICH List (2010); National Tiger Conservation Authority & NCBS Genetic Study',
    durationSec: 200,
    titleEn: 'Sword & Grace: Mayurbhanj Chhau and the Black Tigers of Similipal',
    titleOdia: 'ମୟୂରଭଞ୍ଜ ଛଉ ନୃତ୍ୟ ଓ ଶିମିଳିପାଳର କୃଷ୍ଣ ବ୍ୟାଘ୍ର',
    titleHindi: 'मयूरभंज छऊ नृत्य और सिमिलिपाल के दुर्लभ बाघ',
    bodyEn:
      "Unlike masked Chhau traditions elsewhere, Mayurbhanj Chhau evolved in Baripada's royal akhadas without masks — freeing the dancer's face to express subtle abhinaya alongside athletic martial leaps accompanied by mahuri and dhumsa drums, earning UNESCO Intangible Cultural Heritage status in 2010. West of Baripada rises the Similipal massif, the only wild habitat on Earth where a natural Taqpep genetic variation produces majestic pseudo-melanistic tigers roaming sal forests above Barehipani waterfall.",
    bodyOdia:
      'ମୁଖା ବିহীন ଭାବପୂର୍ଣ୍ଣ ଅଭିନୟ ଓ ସାମରିକ ଅଙ୍ଗଭଙ୍ଗୀ ପାଇଁ ମୟୂରଭଞ୍ଜ ଛଉ ନୃତ୍ୟ ବିଶ୍ୱପ୍ରସିଦ୍ଧ। ଏହାସହ ଶିମିଳିପାଳ ଅଭୟାରଣ୍ୟ ବିଶ୍ୱର ଏକମାତ୍ର ସ୍ଥାନ ଯେଉଁଠାରେ ପ୍ରାକୃତିକ କଳା ବାଘ ଦେଖାଯାଆନ୍ତି।',
    bodyHindi:
      'बिना मुखौटे के भावपूर्ण अभिनय और युद्धकला के समन्वय वाला मयूरभंज छऊ नृत्य यूनेस्को की अमूर्त सांस्कृतिक धरोहर है, और पास ही सिमिलिपाल विश्व के एकमात्र काले बाघों का घर है।'
  },
  {
    id: 'katha_nayagarh_kantilo_legend',
    districtId: 'nayagarh',
    destinationName: 'Sri Nilamadhaba Temple, Kantilo',
    category: 'Folk Legend',
    period: 'Skanda Purana & Deula Tola Tradition',
    factClassification: 'Traditional Oral Legend & Folklore',
    sources: 'Skanda Purana (Purushottama Mahatmya); nayagarh.odisha.gov.in',
    durationSec: 190,
    titleEn: 'Viswabasu, Vidyapati & the Secret Shrine of Nilamadhaba',
    titleOdia: 'ବିଶ୍ୱାବସୁ, ବିଦ୍ୟାପତି ଓ କଣ୍ଟିଲୋ ନୀଳମାଧବଙ୍କ କିମ୍ବଦନ୍ତୀ',
    titleHindi: 'विश्वावसु, विद्यापति और कंटिलो के नीलमाधव की कथा',
    bodyEn:
      "According to the sacred Skanda Purana (Utkala Khanda) and Sarala Das's Mahabharata, Savara chieftain Viswabasu secretly worshipped the sapphire-blue image of Lord Nilamadhaba deep within the forested hills along the Mahanadi. King Indradyumna dispatched emissary Vidyapati, who wed Viswabasu's daughter Lalita and was led blindfolded to the forest cave, dropping mustard seeds that sprouted with the rains to reveal the trail — a revered oral and textual tradition linking Kantilo's twin hills to the Daru Brahma worship of Puri.",
    bodyOdia:
      'ସ୍କନ୍ଦ ପୁରାଣ ଓ ଦେଉଳ ତୋଳା ପରମ୍ପରା ଅନୁସାରେ ଶବରରାଜ ବିଶ୍ୱାବସୁ ନୀଳକନ୍ଦରରେ ପ୍ରଭୁ ନୀଳମାଧବଙ୍କୁ ଗୋପନରେ ପୂଜା କରୁଥିଲେ, ଯାହା ଶ୍ରୀଜଗନ୍ନାଥ ସଂସ୍କୃତିର ଆଦି ମୂଳଦୁଆ ଭାବେ ପରିଚିତ।',
    bodyHindi:
      'स्कंद पुराण एवं उड़िया परंपरा के अनुसार शबरराज विश्वावसु महानदी की पहाड़ियों में भगवान नीलमाधव की गुप्त आराधना करते थे, जिनसे पुरी की दारु-ब्रह्म परंपरा जुड़ी है।'
  }
];

function mapDestCategory(cat) {
  if (cat === 'Temple') return 'Sacred Architecture';
  if (cat === 'Archaeology' || cat === 'Cave' || cat === 'Monument') return 'Archaeology';
  if (cat === 'Craft Village') return 'Crafts & Cuisine';
  return 'Nature & Eco';
}

export function buildAllVerifiedKathaStories() {
  const coveredDistricts = new Set(CURATED_CORE_STORIES.map((s) => s.districtId));
  const generatedDistrictStories = DISTRICTS.filter((d) => !coveredDistricts.has(d.id)).map((district) => {
    const primaryDest = district.destinations[0];
    return {
      id: `katha_district_${district.id}_overview`,
      districtId: district.id,
      destinationName: primaryDest.name,
      category: mapDestCategory(primaryDest.category),
      period: 'Documented Regional & Cultural Heritage',
      factClassification: 'Documented Historical Record',
      sources: `${district.sourceReference}; ${primaryDest.sourceCitation}`,
      durationSec: 165,
      titleEn: `Chronicles of ${district.nameEn}: ${primaryDest.name}`,
      titleOdia: `${district.nameOdia} ଐତିହ୍ୟ ଗାଥା: ${primaryDest.odiaName}`,
      titleHindi: `${district.nameHindi} धरोहर गाथा: ${primaryDest.name}`,
      bodyEn: `${district.nameEn} (${district.nameOdia}), headquartered at ${district.headquarters} in ${district.region}, stands as a vital chapter of Odisha's heritage. ${district.historySummary} Visitors exploring ${primaryDest.name} encounter ${primaryDest.shortSummary} Historically, ${primaryDest.historicalSignificance} Beyond monuments, the district's living identity shines through ${district.cultureAndFestivals} and artisanal traditions such as ${district.craftsAndHandloom.join(', ')}, paired with regional flavours including ${district.signatureFood.join(', ')}.`,
      bodyOdia: `${district.nameOdia} ଜିଲ୍ଲାର ମୁଖ୍ୟାଳୟ ${district.headquarters}। ଏଠାକାର ପ୍ରମୁଖ ଦର୍ଶନୀୟ ସ୍ଥାନ ${primaryDest.odiaName} ଓଡ଼ିଶାର ଐତିହ୍ୟ ଓ ପ୍ରାକୃତିକ ସୌନ୍ଦର୍ଯ୍ୟର ଅନନ୍ୟ ନିଦର୍ଶନ ଅଟେ। ଏଠାକାର ପର୍ବପର୍ବାଣୀ ଓ ହସ୍ତଶିଳ୍ପ ଓଡ଼ିଆ ସଂସ୍କୃତିକୁ ସମୃଦ୍ଧ କରିଛି।`,
      bodyHindi: `ओडिशा के ${district.nameHindi} जिले का मुख्यालय ${district.headquarters} है। यहाँ का प्रमुख स्थल ${primaryDest.name} ऐतिहासिक, सांस्कृतिक और प्राकृतिक धरोहर के लिए प्रसिद्ध है।`
    };
  });

  return [...CURATED_CORE_STORIES, ...generatedDistrictStories];
}

export const ALL_KATHA_STORIES = buildAllVerifiedKathaStories();
