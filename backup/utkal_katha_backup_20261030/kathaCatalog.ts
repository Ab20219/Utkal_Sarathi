export interface KathaStory {
  id: string;
  districtId: string;
  destinationName: string;
  category: string;
  period: string;
  factClassification: string;
  sources: string;
  durationSec: number;
  titleEn: string;
  titleOdia: string;
  titleHindi: string;
  bodyEn: string;
  bodyOdia: string;
  bodyHindi: string;
}

export const ALL_KATHA_STORIES: KathaStory[] = [
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
      'ମହାରାଜା ପ୍ରଥମ ନରସିଂହଦେବଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ସାତୋଟି ଅଶ୍ୱ ଦ୍ୱାରା ଟଣାଯାଉଥିବା ଏକ ବିଶାଳ ପ୍ରସ୍ତର ରଥ ରୂପେ ଗଢ଼ାଯାଇଥିଲା। ଏହାର ୨୪ଟି ଚକ ବର୍ଷର ୨୪ଟି ପକ୍ଷକୁ ସୂଚାଏ ଏବଂ ଅରଗୁଡ଼ିକ ସୂର୍ଯ୍ୟଛାୟା ମାଧ୍ୟମରେ ସଠିକ୍ ସମୟ ଗଣନା କରେ। ଖୋଣ୍ଡାଲାଇଟ୍ ପଥରର ନିର୍ମାଣ ଶୈଳୀ ଓ କ୍ଲୋରାଇଟ୍ ମୂର୍ତ୍ତିକଳା ଏହାର ଅନନ୍ୟ ବୈଶିଷ୍ଟ୍ୟ।',
    bodyHindi:
      'महाराजा नरसिंहदेव प्रथम द्वारा निर्मित कोणार्क सूर्य मंदिर सात अश्वों द्वारा खींचे जाने वाले भव्य पाषाण रथ के रूप में गढ़ा गया है। इसके २४ पहिये पखवाड़ों के प्रतीक हैं और इनकी तीलियाँ धूपघड़ी की तरह समय बताती हैं।'
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
      'ଦୟା ନଦୀ କୂଳରେ ଅବସ୍ଥିତ ଧଉଳି ପାହାଡ଼ରେ ଖ୍ରୀଷ୍ଟପୂର୍ବ ୨୬୧ ପରେ ସମ୍ରାଟ ଅଶୋକଙ୍କ ପ୍ରାକୃତ-ବ୍ରାହ୍ମୀ ଶିଳାଲେଖ ଓ ଶିଳାଖୋଦିତ ହସ୍ତୀ ମୂର୍ତ୍ତି ଓଡ଼ିଶାର ସର୍ବପ୍ରାଚୀନ ଐତିହାସିକ କୀର୍ତ୍ତି ଅଟେ। ଉଦୟଗିରିର ହାତୀଗୁମ୍ଫାରେ ସମ୍ରାଟ ଖାରବେଳଙ୍କ ୧୭ ଧାଡ଼ି ବିଶିଷ୍ଟ ଶିଳାଲେଖ କଳିଙ୍ଗର ଶୌର୍ଯ୍ୟ ବର୍ଣ୍ଣନା କରେ।',
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
    destinationName: 'Nilakanthapur & Dhenkanal',
    category: 'Freedom Movement',
    period: '11 October 1938 (Prajamandal Freedom Struggle)',
    factClassification: 'Documented Historical Record',
    sources: "Who's Who of Freedom Workers in Orissa, Odisha State Archives",
    durationSec: 175,
    titleEn: "Twelve-Year-Old Sentinel of the Brahmani: Martyr Baji Rout",
    titleOdia: 'ବ୍ରାହ୍ମଣୀ ଘାଟର ବୀର ବାଳକ ସହିଦ ବାଜି ରାଉତ',
    titleHindi: 'ब्राह्मणी नदी के बारह वर्षीय अमर शहीद बाजी राउत',
    bodyEn:
      "On the rainy night of 10–11 October 1938 at Nilakanthapur Ghat on the Brahmani river in Dhenkanal, twelve-year-old Banarsena volunteer Baji Rout stood guard beside his country boat. Ordered by armed colonial police troops to ferry them across the river after village raids, young Baji courageously refused to betray his people's Prajamandal struggle. His sacrifice made him India's youngest documented martyr of the freedom movement, immortalized in Sachidananda Routray's epic poem 'Baji Rout'.",
    bodyOdia:
      '୧୯୩୮ ଅକ୍ଟୋବର ୧୧ ରାତିରେ ବ୍ରାହ୍ମଣୀ ନଦୀର ନୀଳକଣ୍ଠପୁର ଘାଟରେ ମାତ୍ର ବାର ବର୍ଷର ବାଳକ ବାଜି ରାଉତ ବ୍ରିଟିଶ ଫୌଜଙ୍କୁ ଡଙ୍ଗା ପାରି କରାଇବାକୁ ମନା କରି ଦେଶ ପାଇଁ ପ୍ରାଣବଳି ଦେଇଥିଲେ। ସେ ଭାରତର ସର୍ବକନିଷ୍ଠ ସହିଦ ଭାବେ ଅମର।',
    bodyHindi:
      '११ अक्टूबर १९३८ की रात ढेंकानाल के नीलकंठपुर घाट पर बारह वर्षीय नाविक बालक बाजी राउत ने ब्रिटिश पुलिस बल को नदी पार कराने से इनकार कर मातृभूमि के लिए सर्वोच्च बलिदान दिया।'
  },
  {
    id: 'katha_sambalpur_surendra_sai',
    districtId: 'sambalpur',
    destinationName: 'Sambalpur & Debrigarh',
    category: 'Freedom Movement',
    period: '1827–1884 CE',
    factClassification: 'Documented Historical Record',
    sources: 'Sambalpur District Gazetteer & VIMSAR/Burla Historical Archives',
    durationSec: 205,
    titleEn: 'Veer Surendra Sai & the Barabakhra Caves of Debrigarh',
    titleOdia: 'ବୀର ସୁରେନ୍ଦ୍ର ସାଏ ଓ ଡେବ୍ରିଗଡ଼ର ବାରବଖରା ଗୁମ୍ଫା',
    titleHindi: 'वीर सुरेंद्र साय और डेब्रीगढ़ का स्वतंत्रता संग्राम',
    bodyEn:
      "Decades before the revolt of 1857, Chauhan prince Veer Surendra Sai rallied tribal gountias—Binjhals, Gonds, and Kondhs—across Sambalpur and the dense Debrigarh hills against British annexation. Utilizing mountain passes and the twelve-chambered Barabakhra rock shelter, his guerrilla resistance persisted for years. In total, Surendra Sai endured nearly 37 years of British imprisonment in Hazaribagh and Asirgarh Fort, breathing his last in 1884 as an unbowed icon of western Odisha.",
    bodyOdia:
      '୧୮୫୭ ମହାବିଦ୍ରୋହର ବହୁ ପୂର୍ବରୁ ବୀର ସୁରେନ୍ଦ୍ର ସାଏ ସମ୍ବଲପୁର ଓ ଡେବ୍ରିଗଡ଼ ଅଞ୍ଚଳର ଜନଜାତି ଓ ଗୌନ୍ତିଆମାନଙ୍କୁ ଏକତ୍ର କରି ଇଂରେଜ ଶାସନ ବିରୁଦ୍ଧରେ ଦୀର୍ଘ ସଂଗ୍ରାମ କରିଥିଲେ। ଡେବ୍ରିଗଡ଼ର ବାରବଖରା ଗୁମ୍ଫା ତାଙ୍କର କେନ୍ଦ୍ର ଥିଲା।',
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
      "High in the Eastern Ghats around Deomali and Jeypore, indigenous Paraja, Bhumia, Gadaba, and Kondh women farmers have conserved hundreds of landraces of upland paddy for over two thousand years — earning Koraput recognition from the UN Food and Agriculture Organization as a Globally Important Agricultural Heritage System. Foremost among these treasures is GI-tagged Koraput Kalajeera rice. At the heart of Koraput town stands Sabara Srikhetra, celebrating the ancient Savara devotion to Nilamadhaba where citizens of every community join together in pulling the sacred Ratha.",
    bodyOdia:
      'କୋରାପୁଟର ଆଦିବାସୀ କୃଷକମାନେ ସହସ୍ର ବର୍ଷ ଧରି କଳାଜିରା ସମେତ ଶତାଧିକ ଦେଶୀ ଧାନ ସଂରକ୍ଷଣ କରିଆସିଛନ୍ତି। ଏଠାକାର ଶବର ଶ୍ରୀକ୍ଷେତ୍ର ସର୍ବଜନୀନ ଭ୍ରାତୃତ୍ୱ ଓ ଶବର ପରମ୍ପରାର ପ୍ରତୀକ। ସଂଯୁକ୍ତ ରାଷ୍ଟ୍ର FAO ଦ୍ୱାରା ଏହା ବିଶ୍ୱ କୃଷି ଐତିହ୍ୟ ମାନ୍ୟତା ପାଇଛି।',
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
      "Unlike masked Chhau traditions elsewhere, Mayurbhanj Chhau evolved in Baripada's royal akhadas without masks — freeing the dancer's face to express subtle abhinaya alongside athletic martial leaps (topka and ufli) accompanied by mahuri and dhumsa drums, earning UNESCO Intangible Cultural Heritage status in 2010. West of Baripada rises the Similipal massif, the only wild habitat on Earth where genetic Taqpep mutation produces majestic pseudo-melanistic tigers with wide dark stripes roaming sal forests above Barehipani waterfall.",
    bodyOdia:
      'ମୁଖା ବିହୀନ ଭାବପୂର୍ଣ୍ଣ ଅଭିନୟ ଓ ସାମରିକ ଅଙ୍ଗଭଙ୍ଗୀ ପାଇଁ ମୟୂରଭଞ୍ଜ ଛଉ ନୃତ୍ୟ ବିଶ୍ୱପ୍ରସିଦ୍ଧ। ଏହାସହ ଶିମିଳିପାଳ ଅଭୟାରଣ୍ୟ ବିଶ୍ୱର ଏକମାତ୍ର ସ୍ଥାନ ଯେଉଁଠାରେ ପ୍ରାକୃତିକ କଳା ବାଘ ଦେଖାଯାଆନ୍ତି।',
    bodyHindi:
      'बिना मुखौटे के भावपूर्ण अभिनय और युद्धकला के समन्वय वाला मयूरभंज छऊ नृत्य यूनेस्को की अमूर्त सांस्कृतिक धरोहर है, और पास ही सिमिलिपाल विश्व के एकमात्र काले बाघों का घर है।'
  },
  {
    id: 'katha_nayagarh_kantilo_legend',
    districtId: 'nayagarh',
    destinationName: 'Sri Nilamadhaba Temple, Kantilo',
    category: 'Folk Legend',
    period: 'Skanda Purana & Deula Tolā Tradition',
    factClassification: 'Traditional Oral Legend & Folklore',
    sources: 'Skanda Purana (Purushottama Mahatmya); nayagarh.odisha.gov.in',
    durationSec: 190,
    titleEn: 'Viswabasu, Vidyapati & the Secret Shrine of Nilamadhaba',
    titleOdia: 'ବିଶ୍ୱାବସୁ, ବିଦ୍ୟାପତି ଓ କଣ୍ଟିଲୋ ନୀଳମାଧବଙ୍କ କିମ୍ବଦନ୍ତୀ',
    titleHindi: 'विश्वावसु, विद्यापति और कंटिलो के नीलमाधव की कथा',
    bodyEn:
      "According to the sacred Skanda Purana (Utkala Khanda) and Sarala Das's Mahabharata, Savara chieftain Viswabasu secretly worshipped the sapphire-blue image of Lord Nilamadhaba deep within the forested hills along the Mahanadi. King Indradyumna dispatched Brahmin emissary Vidyapati, who wed Viswabasu's daughter Lalita and was led blindfolded to the forest cave, dropping mustard seeds that sprouted with the rains to reveal the trail — a revered oral and textual tradition linking Kantilo's twin hills to the manifestation of Daru Brahma at Puri.",
    bodyOdia:
      'ସ୍କନ୍ଦ ପୁରାଣ ଓ ଦେଉଳ ତୋଳା ପରମ୍ପରା ଅନୁସାରେ ଶବରରାଜ ବିଶ୍ୱାବସୁ ନୀଳକନ୍ଦରରେ ପ୍ରଭୁ ନୀଳମାଧବଙ୍କୁ ଗୋପନରେ ପୂଜା କରୁଥିଲେ, ଯାହା ଶ୍ରୀଜଗନ୍ନାଥ ସଂସ୍କୃତିର ଆଦି ମୂଳଦୁଆ ଭାବେ ପରିଚିତ।',
    bodyHindi:
      'स्कंद पुराण एवं उड़िया परंपरा के अनुसार शबरराज विश्वावसु महानदी की पहाड़ियों में भगवान नीलमाधव की गुप्त आराधना करते थे, जिनसे पुरी की दारु-ब्रह्म परंपरा जुड़ी है।'
  },
  // 30 District Overview Chronicles
  {
    id: 'katha_district_angul_overview',
    districtId: 'angul',
    destinationName: 'Satkosia Gorge Sanctuary',
    category: 'Nature & Eco',
    period: 'Documented Regional & Cultural Heritage',
    factClassification: 'Documented Historical Record',
    sources: 'angul.odisha.gov.in & Odisha Forest Eco-Tourism',
    durationSec: 165,
    titleEn: 'Chronicles of Angul: Satkosia Gorge & Tikarpada',
    titleOdia: 'ଅନୁଗୁଳ ଐତିହ୍ୟ ଗାଥା: ସାତକୋଶିଆ ଗଣ୍ଡ ଓ ଟିକରପଡ଼ା',
    titleHindi: 'अनुगुल धरोहर गाथा: सातकोशिया खड्ड व टीकरपड़ा',
    bodyEn: 'Angul, headquartered at Angul in Northern & Central Odisha, is the Mahanadi gorge eco-sanctuary and industrial heartland. Satkosia Gorge is a 22-km dramatic gorge where the Mahanadi cuts across the Eastern Ghats, forming a protected Ramsar wetland and gharial habitat.',
    bodyOdia: 'ଅନୁଗୁଳ ଜିଲ୍ଲାର ମୁଖ୍ୟାଳୟ ଅନୁଗୁଳ। ଏଠାକାର ପ୍ରମୁଖ ଦର୍ଶନୀୟ ସ୍ଥାନ ସାତକୋଶିଆ ଗଣ୍ଡ ଓଡ଼ିଶାର ଐତିହ୍ୟ ଓ ପ୍ରାକୃତିକ ସୌନ୍ଦର୍ଯ୍ୟର ଅନନ୍ୟ ନିଦର୍ଶନ ଅଟେ। ମହାନଦୀର ଏହି ୨୨ କିଲୋମିଟର ଲମ୍ବା ଗଣ୍ଡ ଘଡ଼ିଆଳ କୁମ୍ଭୀର ସଂରକ୍ଷଣ ପାଇଁ ପ୍ରସିଦ୍ଧ।',
    bodyHindi: 'ओडिशा के अनुगुल जिले का मुख्यालय अनुगुल है। यहाँ का सातकोशिया खड्ड महानदी द्वारा निर्मित २२ किमी लंबा प्राकृतिक जलमार्ग व घड़ियाल अभयारण्य है।'
  },
  {
    id: 'katha_district_balasore_overview',
    districtId: 'balasore',
    destinationName: 'Chandipur & Khirachora Gopinatha',
    category: 'Sacred Architecture',
    period: 'Medieval Vaishnavism & Maritime Trade',
    factClassification: 'Documented Historical Record',
    sources: 'balasore.nic.in; Chaitanya Charitamrita',
    durationSec: 170,
    titleEn: 'Chronicles of Balasore: Chandipur Vanishing Sea & Remuna',
    titleOdia: 'ବାଲେଶ୍ୱର ଐତିହ୍ୟ ଗାଥା: ଚାନ୍ଦିପୁର ବେଳାଭୂମି ଓ କ୍ଷୀରଚୋରା ଗୋପୀନାଥ',
    titleHindi: 'बालेश्वर धरोहर गाथा: चांदीपुर तट व खीरचोरा गोपीनाथ',
    bodyEn: 'Balasore is the northern maritime citadel of Odisha. At Chandipur beach, the sea recedes up to 5 kilometers twice a day during low tide. Nearby Remuna houses the 12th-century Khirachora Gopinatha temple, where the deity famously concealed sweet khira for Madhavendra Puri.',
    bodyOdia: 'ବାଲେଶ୍ୱରର ଚାନ୍ଦିପୁର ବେଳାଭୂମିରେ ସମୁଦ୍ର ପ୍ରତ୍ୟେକ ଭଟ୍ଟା ସମୟରେ ୫ କିଲୋମିଟର ପଛକୁ ହଟିଯାଏ। ରେମୁଣାର ପ୍ରସିଦ୍ଧ କ୍ଷୀରଚୋରା ଗୋପୀନାଥ ମନ୍ଦିର ବୈଷ୍ଣବ ସଂସ୍କୃତିର ଅନନ୍ୟ ତୀର୍ଥ।',
    bodyHindi: 'बालेश्वर का चांदीपुर समुद्र तट भाटे के समय ५ किमी तक पीछे हटने के लिए प्रसिद्ध है, और रेमुणा का खीरचोरा गोपीनाथ मंदिर पावन धाम है।'
  },
  {
    id: 'katha_district_bargarh_overview',
    districtId: 'bargarh',
    destinationName: 'Dhanu Yatra & Nrusinghanath',
    category: 'Folk Legend',
    period: 'Living Folk Theatre & 14th Century CE',
    factClassification: 'Documented Historical Record',
    sources: 'bargarh.nic.in; Guinness World Records Entry',
    durationSec: 175,
    titleEn: "Chronicles of Bargarh: World's Largest Open-Air Theatre Dhanu Yatra",
    titleOdia: 'ବରଗଡ଼ ଐତିହ୍ୟ ଗାଥା: ବିଶ୍ୱପ୍ରସିଦ୍ଧ ଧନୁଯାତ୍ରା ଓ ନୃସିଂହନାଥ',
    titleHindi: 'बरगढ़ धरोहर गाथा: विश्वप्रसिद्ध धनु यात्रा व नृसिंहनाथ',
    bodyEn: "Bargarh is Western Odisha's agrarian heartland, world-famous for Dhanu Yatra—the world's largest open-air theatrical festival spreading across an 8-km radius where the entire municipality transforms into Mathura Nagari and King Kansa rules supreme.",
    bodyOdia: 'ବରଗଡ଼ର ବିଶ୍ୱପ୍ରସିଦ୍ଧ ଧନୁଯାତ୍ରା ପୃଥିବୀର ସର୍ବବୃହତ ମୁକ୍ତାକାଶ ରଙ୍ଗମଞ୍ଚ ଭାବେ ପରିଚିତ। ଏହି ଯାତ୍ରା ସମୟରେ ସମଗ୍ର ବରଗଡ଼ ସହର ମଥୁରାନଗରୀରେ ପରିଣତ ହୁଏ ଏବଂ ମହାରାଜା କଂସ ଶାସନ କରନ୍ତି। ଗନ୍ଧମାର୍ଦ୍ଦନ ପାଦଦେଶରେ ନୃସିଂହନାଥ ମନ୍ଦିର ପ୍ରସିଦ୍ଧ।',
    bodyHindi: 'बरगढ़ की धनु यात्रा विश्व का सबसे बड़ा खुला रंगमंच है, जहाँ समूचा नगर मथुरा बन जाता है और महाराज कंस का शासन चलता है।'
  },
  {
    id: 'katha_district_bhadrak_overview',
    districtId: 'bhadrak',
    destinationName: 'Maa Bhadrakali & Dhamra Port',
    category: 'Sacred Architecture',
    period: 'Medieval Shaktism & Ancient Maritime Hub',
    factClassification: 'Documented Historical Record',
    sources: 'bhadrak.nic.in',
    durationSec: 160,
    titleEn: 'Chronicles of Bhadrak: Maa Bhadrakali Peetha & Maritime Dhamra',
    titleOdia: 'ଭଦ୍ରକ ଐତିହ୍ୟ ଗାଥା: ମାଁ ଭଦ୍ରକାଳୀ ପୀଠ ଓ ଧାମରା ବନ୍ଦର',
    titleHindi: 'भद्रक धरोहर गाथा: माँ भद्रकाली पीठ व धामरा बंदरगाह',
    bodyEn: 'Bhadrak derives its sacred identity from Goddess Bhadrakali, worshipped as a venerable Shakti peetha. Historically connected with sea trade through the Dhamra estuary, Bhadrak was celebrated for boatbuilding, Kanika handlooms, and palmyra palm jaggery.',
    bodyOdia: 'ଭଦ୍ରକର ମୁଖ୍ୟ ଆରାଧ୍ୟା ଦେବୀ ମାଁ ଭଦ୍ରକାଳୀ। ଧାମରା ନଦୀ ମୁହାଣ ଦେଇ ପ୍ରାଚୀନ କାଳରୁ ନୌବାଣିଜ୍ୟ ଚାଲିଆସୁଥିଲା। ଏଠାକାର ପାଳପୋତ ଓ ହସ୍ତତନ୍ତ ସଂସ୍କୃତି ଅତ୍ୟନ୍ତ ପ୍ରାଚୀନ।',
    bodyHindi: 'भद्रक की अधिष्ठात्री देवी माँ भद्रकाली हैं और धामरा मुहाना प्राचीन काल से समृद्ध समुद्री व्यापार का साक्षी रहा है।'
  },
  {
    id: 'katha_district_bolangir_overview',
    districtId: 'bolangir',
    destinationName: 'Ranipur Jharial 64 Yogini & Harishankar',
    category: 'Sacred Architecture',
    period: '9th-10th Century CE Somavamsi Era',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'ASI Reports on Ranipur-Jharial; bolangir.nic.in',
    durationSec: 180,
    titleEn: 'Chronicles of Bolangir: Ranipur Jharial Chausathi Yogini Circular Shrine',
    titleOdia: 'ବଲାଙ୍ଗୀର ଐତିହ୍ୟ ଗାଥା: ରାଣୀପୁର ଝରିଆଲ ଚଉଷଠି ଯୋଗିନୀ ପୀଠ ଓ ହରିଶଙ୍କର',
    titleHindi: 'बलांगिर धरोहर गाथा: रानीपुर झरियाल चौंसठ योगिनी व हरिशंकर',
    bodyEn: 'Bolangir hosts one of only four circular open-air Chausathi Yogini shrines in India at Ranipur Jharial, dating to the Somavamsi period on a sweeping granite outcrop alongside 50 stone temples. On the southern slope of Gandhamardan hill rests Harishankar, where Vishnu and Shiva are worshipped in unison beside a perennial cascading stream.',
    bodyOdia: 'ବଲାଙ୍ଗୀରର ରାଣୀପୁର ଝରିଆଲରେ ଭାରତର ଅଳ୍ପ କେତୋଟି ଖୋଲା ଆକାଶ ତଳେ ଥିବା ଚଉଷଠି ଯୋଗିନୀ ମନ୍ଦିର ମଧ୍ୟରୁ ଏକ ଅନ୍ୟତମ। ଗନ୍ଧମାର୍ଦ୍ଦନ ପାହାଡ଼ରେ ହରିଶଙ୍କର ଏକ ପବିତ୍ର ଶୈବ-ବୈଷ୍ଣବ ସମନ୍ୱୟ ପୀଠ।',
    bodyHindi: 'बलांगिर के रानीपुर झरियाल में भारत के दुर्लभ गोलाकार चौंसठ योगिनी मंदिरों में से एक स्थित है, और गंधमार्दन पर्वत पर पावन हरिशंकर तीर्थ है।'
  },
  {
    id: 'katha_district_boudh_overview',
    districtId: 'boudh',
    destinationName: 'Star-Shaped Rameswar Temples & Buddhist Heritage',
    category: 'Sacred Architecture',
    period: '8th-10th Century CE Bhauma-Kara & Bhanja Dynasty',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'boudh.nic.in; ASI Bhubaneswar Circle',
    durationSec: 165,
    titleEn: 'Chronicles of Boudh: The Star-Shaped Temples of the Mahanadi',
    titleOdia: 'ବୌଦ୍ଧ ଐତିହ୍ୟ ଗାଥା: ମହାନଦୀ କୂଳର ତାରକାକୃତି ମନ୍ଦିର ଓ ବୌଦ୍ଧ ସ୍ତୂପ',
    titleHindi: 'बौद्ध धरोहर गाथा: महानदी तट के तारा-आकार मंदिर व बौद्ध धरोहर',
    bodyEn: 'Boudh flourished as a vibrant nexus of Tantric Buddhism and Shaivism under the Bhauma-Kara rulers. Its unique 9th-century Rameswar, Jogeswar, and Kapileswar temples feature rare eight-pointed star-shaped platforms rising directly beside the serene flow of the Mahanadi.',
    bodyOdia: 'ବୌଦ୍ଧ ଜିଲ୍ଲାରେ ମହାନଦୀ କୂଳରେ ଥିବା ତାରକା ଆକୃତିର ରାମେଶ୍ୱର ମନ୍ଦିର ଭାରତୀୟ ସ୍ଥାପତ୍ୟ କଳାର ଏକ ଦୁର୍ଲଭ ନିଦର୍ଶନ। ଏହା ପ୍ରାଚୀନ କାଳରେ ବୌଦ୍ଧ ଧର୍ମର ପ୍ରମୁଖ କେନ୍ଦ୍ର ଥିଲା।',
    bodyHindi: 'बौद्ध जिले में महानदी किनारे स्थित तारे के आकार के मंदिर और विशाल बुद्ध प्रतिमाएं प्राचीन तांत्रिक बौद्ध व शैव परंपरा का संगम हैं।'
  },
  {
    id: 'katha_district_deogarh_overview',
    districtId: 'deogarh',
    destinationName: 'Pradhanpat Waterfall & Royal Science Heritage',
    category: 'Nature & Eco',
    period: 'Late 19th Century CE Bamra Princely State',
    factClassification: 'Documented Historical Record',
    sources: 'deogarh.nic.in; Bamra State Gazetteer',
    durationSec: 160,
    titleEn: 'Chronicles of Deogarh: Pradhanpat Falls & Raja Sir Basudev Sudhal Deb',
    titleOdia: 'ଦେବଗଡ଼ ଐତିହ୍ୟ ଗାଥା: ପ୍ରଧାନପାଟ ଜଳପ୍ରପାତ ଓ ବାମଣ୍ଡା ରାଜ୍ୟର ବିଜ୍ଞାନ ଯୁଗ',
    titleHindi: 'देवगढ़ धरोहर गाथा: प्रधानपाट जलप्रपात व बामंडा रियासत की ज्ञान-परंपरा',
    bodyEn: "Deogarh was the royal capital of the enlightened Bamra princely state under Raja Sir Basudev Sudhal Deb, who introduced Odisha's first printing press outside Cuttack, telegraph lines, and modern scientific education. The district is crowned by the picturesque multi-tiered Pradhanpat waterfall.",
    bodyOdia: 'ଦେବଗଡ଼ ବାମଣ୍ଡା ରାଜ୍ୟର ରାଜଧାନୀ ଥିଲା, ଯେଉଁଠାରେ ରାଜା ବାସୁଦେବ ସୁଢ଼ଳଦେବ ଓଡ଼ିଶାରେ ଆଧୁନିକ ଶିକ୍ଷା, ସାହିତ୍ୟ ଓ ବିଜ୍ଞାନର ବିକାଶ କରିଥିଲେ। ପ୍ରଧାନପାଟ ଜଳପ୍ରପାତ ଏଠାକାର ପ୍ରମୁଖ ଆକର୍ଷଣ।',
    bodyHindi: 'देवगढ़ की बामंडा रियासत शिक्षा और विज्ञान की अग्रदूत थी। यहाँ का प्रधानपाट जलप्रपात अपनी प्राकृतिक सुंदरता के लिए प्रसिद्ध है।'
  },
  {
    id: 'katha_district_gajapati_overview',
    districtId: 'gajapati',
    destinationName: 'Mahendragiri Peak & Paralakhemundi Palace',
    category: 'Nature & Eco',
    period: 'Ramayana Tradition to Eastern Ganga Dynasty',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'gajapati.nic.in; Mahendragiri Biosphere Project',
    durationSec: 175,
    titleEn: 'Chronicles of Gajapati: Sacred Mahendragiri & Paralakhemundi Heritage',
    titleOdia: 'ଗଜପତି ଐତିହ୍ୟ ଗାଥା: ପବିତ୍ର ମହେନ୍ଦ୍ରଗିରି ଓ ପାରଳାଖେମୁଣ୍ଡି ରାଜପ୍ରାସାଦ',
    titleHindi: 'गजपति धरोहर गाथा: पावन महेंद्रगिरि पर्वत व पारलाखेमुंडी राजप्रासाद',
    bodyEn: 'Gajapati district is dominated by the sacred Mahendragiri peak (1,501 meters), revered in the Ramayana and Mahabharata as the hermitage of Lord Parashurama. Cyclopean granite temples dedicated to Yudhisthira, Bhima, and Kunti stand atop windswept cliffs surrounded by rare medicinal flora.',
    bodyOdia: 'ଗଜପତି ଜିଲ୍ଲାର ୧,୫୦୧ ମିଟର ଉଚ୍ଚ ମହେନ୍ଦ୍ରଗିରି ପର୍ବତ ପୌରାଣିକ ମହତ୍ତ୍ୱରେ ଭରା। ପାଣ୍ଡବମାନଙ୍କ ନିର୍ମିତ କଥିତ ବିଶାଳ ପ୍ରସ୍ତର ମନ୍ଦିର ଏହି ଶିଖରରେ ଅବସ୍ଥିତ। ମହାରାଜା କୃଷ୍ଣଚନ୍ଦ୍ର ଗଜପତି ସ୍ୱତନ୍ତ୍ର ଓଡ଼ିଶା ଗଠନର ପ୍ରମୁଖ କର୍ଣ୍ଣଧାର ଥିଲେ।',
    bodyHindi: 'गजपति जिले का १५०१ मीटर ऊँचा महेंद्रगिरि पर्वत पौराणिक परशुराम तपोभूमि है जहाँ प्राचीन पाषाण मंदिर विद्यमान हैं।'
  },
  {
    id: 'katha_district_ganjam_overview',
    districtId: 'ganjam',
    destinationName: 'Tara Tarini Shakti Peetha & Gopalpur-on-Sea',
    category: 'Sacred Architecture',
    period: 'Ancient Maritime to Modern Silk Weaving',
    factClassification: 'Documented Historical Record',
    sources: 'ganjam.nic.in; Tara Tarini Shrine Board',
    durationSec: 170,
    titleEn: 'Chronicles of Ganjam: Maa Tara Tarini Hilltop Shrine & Berhampur Silk',
    titleOdia: 'ଗଞ୍ଜାମ ଐତିହ୍ୟ ଗାଥା: ମାଁ ତାରା ତାରିଣୀ ପୀଠ ଓ ବ୍ରହ୍ମପୁର ପାଟ',
    titleHindi: 'गंजम धरोहर गाथा: माँ तारा तारिणी शक्तिपीठ व गोपालपुर तट',
    bodyEn: 'Ganjam is the southern cultural gateway of Odisha. Perched atop the sacred Kumari hill beside the Rushikulya river, the twin-goddess Maa Tara Tarini shrine served as the tutelary deity of ancient Kalingan merchant voyagers. Berhampur is celebrated for GI-tagged Berhampuri Pata silk sarees.',
    bodyOdia: 'ଋଷିକୂଲ୍ୟା ନଦୀ କୂଳରେ ପୂର୍ଣ୍ଣଗିରି ପାହାଡ଼ ଉପରେ ମାଁ ତାରା ତାରିଣୀଙ୍କ ପବିତ୍ର ସ୍ତନ ପୀଠ ଅବସ୍ଥିତ। ଏହି ଦେବୀ ପ୍ରାଚୀନ ସାଧବମାନଙ୍କ ଆରାଧ୍ୟା ଥିଲେ। ବ୍ରହ୍ମପୁରର ଫୋଡ଼ାକୁମ୍ଭ ପାଟ ଶାଢ଼ୀ ଏବଂ ଗୋପାଳପୁର ବେଳାଭୂମି ଗଞ୍ଜାମର ଗୌରବ।',
    bodyHindi: 'ऋषिकुल्या नदी किनारे स्थित माँ तारा तारिणी शक्तिपीठ प्राचीन नाविकों की रक्षक मानी जाती थीं, और बरहमपुर की रेशमी साड़ियाँ विश्वविख्यात हैं।'
  },
  {
    id: 'katha_district_jagatsinghpur_overview',
    districtId: 'jagatsinghpur',
    destinationName: 'Maa Sarala Peetha, Jhankad & Paradip Port',
    category: 'Sacred Architecture',
    period: '15th Century CE (Adikabi Sarala Das Era)',
    factClassification: 'Documented Historical Record',
    sources: 'jagatsinghpur.nic.in; Sahitya Akademi Sarala Das Monograph',
    durationSec: 175,
    titleEn: "Chronicles of Jagatsinghpur: Maa Sarala Shrine & Adikabi's Odia Mahabharata",
    titleOdia: 'ଜଗତସିଂହପୁର ଐତିହ୍ୟ ଗାଥା: ଝଙ୍କଡ଼ ମାଁ ଶାରଳା ପୀଠ ଓ ଆଦିକବି ସାରଳା ଦାସ',
    titleHindi: 'जगतसिंहपुर धरोहर गाथा: झंकड़ माँ सारला पीठ व आदिकवि सारला दास',
    bodyEn: 'Jagatsinghpur is the cradle of classical Odia literature. At Jhankad, Adikabi Sarala Das composed the monumental Odia Mahabharata, Chandi Purana, and Bilanka Ramayana in the 15th century under the divine inspiration of Goddess Sarala. Paradip stands as one of eastern India’s premier deep-water ports.',
    bodyOdia: 'ଝଙ୍କଡ଼ର ପବିତ୍ର ମାଁ ଶାରଳା ପୀଠରେ ଆଦିକବି ସାରଳା ଦାସ ପଞ୍ଚଦଶ ଶତାବ୍ଦୀରେ ଓଡ଼ିଆ ମହାଭାରତ ରଚନା କରି ଓଡ଼ିଆ ଭାଷାକୁ ଅମର କରିଥିଲେ। ପାରାଦୀପ ବନ୍ଦର ପୂର୍ବ ଭାରତର ପ୍ରମୁଖ ଗଭୀର ସମୁଦ୍ର ବନ୍ଦର।',
    bodyHindi: 'झंकड़ की माँ सारला पीठ वह पावन भूमि है जहाँ १५वीं सदी में आदिकवि सारला दास ने कालजयी उड़िया महाभारत की रचना की थी।'
  },
  {
    id: 'katha_district_jajpur_overview',
    districtId: 'jajpur',
    destinationName: 'Maa Biraja Peetha & Buddhist Diamond Triangle',
    category: 'Sacred Architecture',
    period: '5th-11th Century CE (Somavamsi & Bhauma-Kara Era)',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'jajpur.nic.in; ASI Ratnagiri & Udayagiri Excavation Reports',
    durationSec: 180,
    titleEn: 'Chronicles of Jajpur: Maa Biraja Nabhi Gaya & Ratnagiri Monastic University',
    titleOdia: 'ଯାଜପୁର ଐତିହ୍ୟ ଗାଥା: ମାଁ ବିରଜା ନାଭିଗୟା ପୀଠ ଓ ରତ୍ନଗିରି ବୌଦ୍ଧ ମହାବିହାର',
    titleHindi: 'जाजपुर धरोहर गाथा: माँ बिरजा नाभि गया पीठ व रत्नगिरि महाविहार',
    bodyEn: 'Jajpur, the ancient capital of Kalinga known as Jajnagar or Viraja Kshetra along the sacred Baitarani river, houses the legendary Maa Biraja Temple—the solitary Shakti Peetha where Durga is worshipped as two-armed Mahishasuramardini. Nearby Ratnagiri and Udayagiri formed the legendary Diamond Triangle of Buddhist monastic universities.',
    bodyOdia: 'ବୈତରଣୀ ନଦୀ କୂଳରେ ଯାଜପୁର ପ୍ରାଚୀନ କଳିଙ୍ଗର ରାଜଧାନୀ ଥିଲା। ଏଠାରେ ମାଁ ବିରଜାଙ୍କ ଦୁଇଭୁଜା ମହିଷାସୁରମର୍ଦ୍ଦିନୀ ରୂପ ପୂଜା ପାଆନ୍ତି। ପାଖରେ ରତ୍ନଗିରି ବୌଦ୍ଧ ବିଶ୍ୱବିଦ୍ୟାଳୟର ଭଗ୍ନାବଶେଷ ବିଶ୍ୱବିଖ୍ୟାତ।',
    bodyHindi: 'जाजपुर की माँ बिरजा पीठ में द्विभुजा महिषासुरमर्दिनी की पूजा होती है, और समीप ही बौद्ध धर्म का विख्यात रत्नगिरि महाविहार स्थित है।'
  },
  {
    id: 'katha_district_jharsuguda_overview',
    districtId: 'jharsuguda',
    destinationName: 'Koilighughar Waterfall & Vikramkhol Prehistoric Rock Art',
    category: 'Archaeology',
    period: 'Mesolithic to Early Historic Period (c. 3000 BCE)',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'ASI Prehistoric Inscriptions Bulletin; jharsuguda.nic.in',
    durationSec: 170,
    titleEn: 'Chronicles of Jharsuguda: Vikramkhol Prehistoric Inscriptions & Koilighughar',
    titleOdia: 'ଝାରସୁଗୁଡ଼ା ଐତିହ୍ୟ ଗାଥା: ବିକ୍ରମଖୋଲ ପ୍ରାଗୈତିହାସିକ ଶିଳାଲେଖ ଓ କୋଇଲିଘୁଘର',
    titleHindi: 'झारसुगुड़ा धरोहर गाथा: विक्रमखोल प्रागैतिहासिक शैलचित्र व कोइलीघुघर',
    bodyEn: "Jharsuguda holds profound archaeological value through the rock shelter of Vikramkhol in the Belpahar reserve forest, where prehistoric inscriptions dating to around 3000 BCE remain engraved upon a 37-meter sandstone wall. Koilighughar waterfall cascades through serene forest into a natural Shiva lingam pool.",
    bodyOdia: 'ଝାରସୁଗୁଡ଼ାର ବିକ୍ରମଖୋଲ ଗୁମ୍ଫାରେ ପ୍ରାୟ ଖ୍ରୀଷ୍ଟପୂର୍ବ ୩୦୦୦ ବର୍ଷର ପ୍ରାଗୈତିହାସିକ ଚିତ୍ରଲିପି ଖୋଦିତ ଅଛି। କୋଇଲିଘୁଘର ଜଳପ୍ରପାତର ଶୀତଳ ଜଳଧାରା ମଧ୍ୟରେ ପ୍ରାକୃତିକ ଶିବଲିଙ୍ଗ ପୂଜା ପାଆନ୍ତି।',
    bodyHindi: 'झारसुगुड़ा के विक्रमखोल में ३००० ईसा पूर्व के प्रागैतिहासिक शैलचित्र संरक्षित हैं, और कोइलीघुघर जलप्रपात में प्राकृतिक शिवलिंग विद्यमान है।'
  },
  {
    id: 'katha_district_kalahandi_overview',
    districtId: 'kalahandi',
    destinationName: 'Asurgarh Fortified Citadel & Dokrichanchra',
    category: 'Ancient Kingdoms',
    period: 'Early Historic Period (4th Century BCE to 5th Century CE)',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'ASI Asurgarh Excavation Monograph (2019); kalahandi.nic.in',
    durationSec: 180,
    titleEn: 'Chronicles of Kalahandi: Asurgarh Moated Urban Civilization & Karlapat',
    titleOdia: 'କଳାହାଣ୍ଡି ଐତିହ୍ୟ ଗାଥା: ଅସୁରଗଡ଼ ପ୍ରାଚୀନ ନଗର ସଭ୍ୟତା ଓ କର୍ଲାପାଟ',
    titleHindi: 'कालाहांडी धरोहर गाथा: असुरगढ़ प्राचीन नगरीय सभ्यता व कर्लापाट',
    bodyEn: 'Kalahandi’s ancient antiquity was validated by ASI excavations at Asurgarh, unearthing a 2,300-year-old fortified urban settlement with water management reservoirs, silver punch-marked coins, and international bead trading links dating from the Mauryan era.',
    bodyOdia: 'କଳାହାଣ୍ଡିର ଅସୁରଗଡ଼ରେ ଭାରତୀୟ ପ୍ରତ୍ନତତ୍ତ୍ୱ ବିଭାଗ ପ୍ରାୟ ୨,୩୦୦ ବର୍ଷ ପୁରୁଣା ଦୁର୍ଗବେଷ୍ଟିତ ନଗର ସଭ୍ୟତାର ସନ୍ଧାନ ପାଇଛନ୍ତି। କର୍ଲାପାଟ ଅଭୟାରଣ୍ୟ ଏବଂ ମାଁ ମାଣିକେଶ୍ୱରୀଙ୍କ ଛତର ଯାତ୍ରା ଏଠାକାର ପରିଚୟ।',
    bodyHindi: 'कालाहांडी के असुरगढ़ में २३०० वर्ष पुरानी मौर्यकालीन दुर्ग नगरीय सभ्यता के प्रमाण मिले हैं, और कर्लापाट वन्यजीवों की पावन शरणस्थली है।'
  },
  {
    id: 'katha_district_kandhamal_overview',
    districtId: 'kandhamal',
    destinationName: 'Daringbadi Hill Station & GI Kandhamal Haldi',
    category: 'Nature & Eco',
    period: 'Tribal Agrarian & Highland Forest Tradition',
    factClassification: 'Documented Historical Record',
    sources: 'kandhamal.nic.in; Spices Board of India GI Registry',
    durationSec: 170,
    titleEn: 'Chronicles of Kandhamal: Daringbadi Highlands & Organic Kandhamal Haldi',
    titleOdia: 'କନ୍ଧମାଳ ଐତିହ୍ୟ ଗାଥା: ଦାରିଙ୍ଗବାଡ଼ି ଶୀତଳ ଉପତ୍ୟକା ଓ ଜୈବିକ କନ୍ଧମାଳ ହଳଦୀ',
    titleHindi: 'कंधमाल धरोहर गाथा: दारिंगबाड़ी हिल स्टेशन व जैविक कंधमाल हल्दी',
    bodyEn: "Kandhamal is Odisha's forested highland sanctuary, home to the Kuvi-speaking Kui tribal community. Daringbadi, known as the Kashmir of Odisha at 915 meters elevation, features pine forests, coffee plantations, and winter frosts. The district is celebrated for GI-tagged Kandhamal Haldi, prized for high curcumin and antimicrobial properties.",
    bodyOdia: 'କନ୍ଧମାଳର ଦାରିଙ୍ଗବାଡ଼ି ୯୧୫ ମିଟର ଉଚ୍ଚତାରେ ପାଇନ ଜଙ୍ଗଲ ଓ କଫି ବଗିଚାରେ ଘେରା ‘ଓଡ଼ିଶାର କାଶ୍ମୀର’ ଭାବେ ପରିଚିତ। ଏଠାକାର ଜୈବିକ ପଦ୍ଧତିରେ ଚାଷ କରାଯାଉଥିବା କନ୍ଧମାଳ ହଳଦୀ ବିଶ୍ୱସ୍ତରରେ GI ମାନ୍ୟତା ପାଇଛି।',
    bodyHindi: 'कंधमाल का दारिंगबाड़ी ९१५ मीटर की ऊँचाई पर पाइन के वनों व कॉफी बागानों से सुशोभित है, और कंधमाल की जैविक हल्दी को जीआई टैग प्राप्त है।'
  },
  {
    id: 'katha_district_kendrapara_overview',
    districtId: 'kendrapara',
    destinationName: 'Bhitarkanika Mangroves & Baladevjew Temple',
    category: 'Nature & Eco',
    period: 'Ramsar Wetland & 17th Century Maratha/Gajapati Era',
    factClassification: 'Documented Historical Record',
    sources: 'kendrapara.nic.in; Bhitarkanika Ramsar Site Dossier',
    durationSec: 180,
    titleEn: 'Chronicles of Kendrapara: Bhitarkanika Saltwater Crocodiles & Rasabali',
    titleOdia: 'କେନ୍ଦ୍ରାପଡ଼ା ଐତିହ୍ୟ ଗାଥା: ଭିତରକନିକା ହେନ୍ତାଳବଣ, ଶ୍ରୀ ବଳଦେବଜିଉ ଓ ରସାବଳୀ',
    titleHindi: 'केन्द्रापड़ा धरोहर गाथा: भितरकनिका मैंग्रोव, श्री बलदेवजीउ व रसाबली',
    bodyEn: "Kendrapara is the coastal jewel housing India's second-largest mangrove ecosystem at Bhitarkanika Ramsar wetland, sheltering over 1,700 estuarine saltwater crocodiles and the world's largest nesting grounds for Olive Ridley sea turtles at Gahirmatha. In Kendrapara town, Sri Baladevjew Temple is famed for the heavenly GI-tagged Kendrapara Rasabali sweet.",
    bodyOdia: 'ଭିତରକନିକା ଜାତୀୟ ଉଦ୍ୟାନ ଭାରତର ଦ୍ୱିତୀୟ ବୃହତ୍ତମ ହେନ୍ତାଳବଣ, ଯାହା ବିଶାଳ ଲୁଣାପାଣି କୁମ୍ଭୀର ଏବଂ ଗହିରମଥା ଅଲିଭ୍ ରିଡଲେ କଇଁଛଙ୍କ ବାସସ୍ଥଳୀ। ବଳଦେବଜିଉ ମନ୍ଦିର ଏବଂ ସୁଆଦିଆ କେନ୍ଦ୍ରାପଡ଼ା ରସାବଳୀ ଏହାର ଗୌରବ।',
    bodyHindi: 'केन्द्रापड़ा का भितरकनिका मैंग्रोव विशाल खारे पानी के मगरमच्छों का घर है, और गहिरमाथा में लाखों ओलिव रिडले कछुए अंडे देने आते हैं।'
  },
  {
    id: 'katha_district_keonjhar_overview',
    districtId: 'keonjhar',
    destinationName: 'Sitabinji Fresco Inscriptions & Tarini Ghatagaon',
    category: 'Archaeology',
    period: '5th Century CE Gupta/Bhanja Era & Living Shaktism',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'keonjhar.nic.in; ASI Sitabinji Fresco Research',
    durationSec: 175,
    titleEn: 'Chronicles of Keonjhar: Sitabinji Ravana Chhaya Rock Painting & Maa Tarini',
    titleOdia: 'କେନ୍ଦୁଝର ଐତିହ୍ୟ ଗାଥା: ସୀତାବିଞ୍ଜି ରାବଣଛାୟା ଶିଳାଚିତ୍ର ଓ ମାଁ ତାରିଣୀ ଘଟଗାଁ',
    titleHindi: 'क्योंझर धरोहर गाथा: सीताबिंजी रावणछाया शैलचित्र व माँ तारिणी घटगाँव',
    bodyEn: "Keonjhar preserves Odisha's rarest tempera rock painting at Sitabinji beneath the boulder named Ravana Chhaya, portraying a royal procession with King Disabhanja mounted on an elephant with attendants, accompanied by 5th-century Sanskrit painted inscriptions. Ghatagaon is the beloved forest abode of wish-fulfilling Goddess Maa Tarini.",
    bodyOdia: 'କେନ୍ଦୁଝରର ସୀତାବିଞ୍ଜି ରାବଣଛାୟା ପଥର ତଳେ ୫ମ ଶତାବ୍ଦୀର ପ୍ରସିଦ୍ଧ ଶିଳାଚିତ୍ର ଅଙ୍କିତ ହୋଇଛି, ଯେଉଁଥିରେ ରାଜା ଦିଶାଭଞ୍ଜ ହାତୀ ଉପରେ ଯାତ୍ରା କରୁଥିବା ଦେଖାଯାଏ। ଘଟଗାଁର ମାଁ ତାରିଣୀ ପୀଠ ଓଡ଼ିଶାର ଏକ ପ୍ରଧାନ ତୀର୍ଥ।',
    bodyHindi: 'क्योंझर के सीताबिंजी में ५वीं सदी का दुर्लभ शैलचित्र (रावणछाया) सुरक्षित है, और घटगाँव की माँ तारिणी अत्यंत जाग्रत मानी जाती हैं।'
  },
  {
    id: 'katha_district_malkangiri_overview',
    districtId: 'malkangiri',
    destinationName: 'Balimela Reservoir & Bonda Tribal Heritage',
    category: 'Tribal Heritage',
    period: 'Ancient Living Indigenous Culture',
    factClassification: 'Documented Historical Record',
    sources: 'malkangiri.nic.in; Tribal Research Institute Bhubaneswar',
    durationSec: 175,
    titleEn: 'Chronicles of Malkangiri: The Bonda Highlands & Pristine Balimela',
    titleOdia: 'ମାଲକାନଗିରି ଐତିହ୍ୟ ଗାଥା: ବଣ୍ଡା ଘାଟିର ଆଦିମ ସଂସ୍କୃତି ଓ ବାଲିମେଳା ଜଳଭଣ୍ଡାର',
    titleHindi: 'मलकानगिरि धरोहर गाथा: बोंडा हाइलैंड्स की आदिम संस्कृति व बलिमेला',
    bodyEn: 'Malkangiri occupies the southernmost tip of Odisha in the Dandakaranya forest. The secluded Bonda hills are home to the Bonda tribe, one of the oldest surviving indigenous communities in Asia who have preserved their Neolithic dress, brass torque ornaments, and Remo language for millennia. The district is encircled by the emerald waters of Balimela.',
    bodyOdia: 'ମାଲକାନଗିରି ଦଣ୍ଡକାରଣ୍ୟର ଦକ୍ଷିଣତମ ପ୍ରାନ୍ତରେ ଅବସ୍ଥିତ। ଏଠାକାର ବଣ୍ଡା ପାହାଡ଼ରେ ବସବାସ କରୁଥିବା ବଣ୍ଡା ସମ୍ପ୍ରଦାୟ ଏସିଆର ପ୍ରାଚୀନତମ ଜନଜାତିଙ୍କ ମଧ୍ୟରୁ ଏକ ଅନ୍ୟତମ। ବାଲିମେଳା ଜଳଭଣ୍ଡାରର ଶାନ୍ତ ଦୃଶ୍ୟ ଅନନ୍ୟ।',
    bodyHindi: 'मलकानगिरि के घने जंगलों में एशिया की प्राचीनतम बोंडा जनजाति निवास करती है, जिन्होंने अपनी अनूठी संस्कृति और रेमो भाषा को अक्षुण्ण रखा है।'
  },
  {
    id: 'katha_district_nabarangpur_overview',
    districtId: 'nabarangpur',
    destinationName: 'Umerkote Podagarh Inscriptions & Chandan Dhara',
    category: 'Ancient Kingdoms',
    period: '5th Century CE Nala Dynasty',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'nabarangpur.nic.in; Epigraphia Indica Vol. XXI (Podagarh Inscription)',
    durationSec: 170,
    titleEn: 'Chronicles of Nabarangpur: The Forgotten Fort of Podagarh & Chandan Dhara',
    titleOdia: 'ନବରଙ୍ଗପୁର ଐତିହ୍ୟ ଗାଥା: ପୋଡ଼ାଗଡ଼ର ନଳ ବଂଶ ଶିଳାଲେଖ ଓ ଚନ୍ଦନ ଧାରା',
    titleHindi: 'नवरंगपुर धरोहर गाथा: पोड़ागढ़ का नल वंशीय शिलालेख व चंदन धारा',
    bodyEn: "Nabarangpur flourished during the 5th century CE as Pushkari, capital of the brave Nala dynasty. The granite inscriptions of King Skandavarman at Podagarh record the restoration of the devastated capital and dedication of a footprint shrine of Vishnu. The Tel and Indravati rivers cradle verdant maize farmlands and the cascading Chandan Dhara waterfall.",
    bodyOdia: 'ନବରଙ୍ଗପୁର ପଞ୍ଚମ ଶତାବ୍ଦୀରେ ନଳ ରାଜବଂଶର ରାଜଧାନୀ ପୁଷ୍କରୀ ଥିଲା। ପୋଡ଼ାଗଡ଼ରେ ଥିବା ରାଜା ସ୍କନ୍ଦବର୍ମାଙ୍କ ଶିଳାଲେଖ ଏହାର ପ୍ରମାଣ ଦିଏ। ଚନ୍ଦନ ଧାରା ଜଳପ୍ରପାତ ପ୍ରକୃତିର ଏକ ଅନନ୍ୟ ଉପହାର।',
    bodyHindi: 'नवरंगपुर ५वीं सदी में नल राजाओं की राजधानी पुष्करी था। पोड़ागढ़ में राजा स्कन्दवर्मन का ऐतिहासिक शिलालेख उत्कीर्ण है।'
  },
  {
    id: 'katha_district_nuapada_overview',
    districtId: 'nuapada',
    destinationName: 'Yogimatha Prehistoric Rock Shelter & Patora Dam',
    category: 'Archaeology',
    period: 'Neolithic-Chalcolithic Period (c. 1500 BCE)',
    factClassification: 'Archaeological & Epigraphic Evidence',
    sources: 'nuapada.nic.in; Odisha History Congress Proceedings',
    durationSec: 165,
    titleEn: 'Chronicles of Nuapada: Yogimatha Prehistoric Ochre Art & Patora',
    titleOdia: 'ନୂଆପଡ଼ା ଐତିହ୍ୟ ଗାଥା: ଯୋଗୀମଠ ପ୍ରାଗୈତିହାସିକ ଶିଳାଚିତ୍ର ଓ ପାତୋରା ଡ୍ୟାମ୍',
    titleHindi: 'नुआपड़ा धरोहर गाथा: योगीमठ प्रागैतिहासिक शैलचित्र व पातोरा बांध',
    bodyEn: 'Nuapada guards the western borderlands with the rock shelter of Yogimatha near Khariar, adorned with prehistoric ochre paintings depicting stick figures of dancers, concentric solar discs, and early script characters. Nearby Patora Dam on the Jonk river is flanked by the Yogeswar temple.',
    bodyOdia: 'ନୂଆପଡ଼ାର ଯୋଗୀମଠ ପାହାଡ଼ରେ ପ୍ରାଗୈତିହାସିକ ଯୁଗର ଗେରୁଆ ରଙ୍ଗର ଶିଳାଚିତ୍ର ରହିଛି ଯେଉଁଥିରେ ନୃତ୍ୟରତ ମାନବ ଚିତ୍ର ଦେଖିବାକୁ ମିଳେ। ଜୋଙ୍କ ନଦୀ ଉପରେ ନିର୍ମିତ ପାତୋରା ଡ୍ୟାମ୍ ଏଠାକାର ପ୍ରମୁଖ ପର୍ଯ୍ୟଟନ ସ୍ଥଳୀ।',
    bodyHindi: 'नुआपड़ा के योगीमठ में गेरू से बने प्रागैतिहासिक शैलचित्र प्राचीन मानव जीवन की झलक दिखाते हैं, और पातोरा बांध सुंदर पिकनिक स्थल है।'
  },
  {
    id: 'katha_district_rayagada_overview',
    districtId: 'rayagada',
    destinationName: 'Majhighariani Temple & Hanging Bridge of Chekaguda',
    category: 'Sacred Architecture',
    period: 'Medieval Shaktism & Nagavali River Heritage',
    factClassification: 'Documented Historical Record',
    sources: 'rayagada.nic.in; Majhighariani Temple Trust',
    durationSec: 170,
    titleEn: 'Chronicles of Rayagada: Maa Majhighariani Shrine & Eastern Ghats Valleys',
    titleOdia: 'ରାୟଗଡ଼ା ଐତିହ୍ୟ ଗାଥା: ମାଁ ମଝିଘରିଆଣୀ ପୀଠ ଓ ନାଗାବଳୀ ନଦୀର ଝୁଲାପୋଲ',
    titleHindi: 'रायगड़ा धरोहर गाथा: माँ मझीघरियाणी पीठ व नागावली का झूला पुल',
    bodyEn: 'Rayagada nestles in the lush Eastern Ghats beside the Nagavali river. In Rayagada town, Maa Majhighariani temple is a celebrated Shakti shrine revered by devotees across Odisha, Andhra Pradesh, and Chhattisgarh. The engineering marvel of the 151-meter hanging pedestrian suspension bridge at Chekaguda spans the rushing river.',
    bodyOdia: 'ନାଗାବଳୀ ନଦୀ କୂଳରେ ରାୟଗଡ଼ାର ଅଧିଷ୍ଠାତ୍ରୀ ଦେବୀ ମାଁ ମଝିଘରିଆଣୀ ପୂଜା ପାଆନ୍ତି। ଚେକାଗୁଡ଼ାରେ ନାଗାବଳୀ ନଦୀ ଉପରେ ଥିବା ୧୫୧ ମିଟର ଲମ୍ବା ଝୁଲାପୋଲ ଓ ଡଙ୍ଗରିଆ କନ୍ଧମାନଙ୍କ କପଡ଼ାଗଣ୍ଡା ଶାଲ୍ ଏହାର ଗୌରବ।',
    bodyHindi: 'रायगड़ा की माँ मझीघरियाणी पीठ अत्यंत श्रद्धा का केंद्र है, और नागावली नदी पर बना १५१ मीटर लंबा झूला पुल पर्यटकों को आकर्षित करता है।'
  },
  {
    id: 'katha_district_subarnapur_overview',
    districtId: 'subarnapur',
    destinationName: 'Subarnapur Golden City, Sureswari & Weavers of Sonepur',
    category: 'Sacred Architecture',
    period: '10th Century CE Somavamsi Capital to Chauhan Era',
    factClassification: 'Documented Historical Record',
    sources: 'subarnapur.nic.in; Weavers Service Centre Bhubaneswar',
    durationSec: 175,
    titleEn: 'Chronicles of Subarnapur: The Temple City of Western Odisha & Bomkai Silk',
    titleOdia: 'ସୁବର୍ଣ୍ଣପୁର ଐତିହ୍ୟ ଗାଥା: ସୋନପୁରର ମନ୍ଦିର ନଗରୀ, ମାଁ ସୁରେଶ୍ୱରୀ ଓ ବୋମକାଇ ପାଟ',
    titleHindi: 'सुवर्णपुर धरोहर गाथा: सोनपुर की मंदिर नगरी व बोमकाई रेशम',
    bodyEn: 'Subarnapur, celebrated as Second Varanasi at the confluence of the Mahanadi and Tel rivers, served as the imperial capital Suvarnapura under Somavamsi and Chauhan rulers. Over 100 temples line its riverbanks. The town is universally acclaimed as the home of world-famous GI-tagged Sonepuri Bomkai silk sarees.',
    bodyOdia: 'ମହାନଦୀ ଓ ତେଲ ନଦୀର ସଙ୍ଗମସ୍ଥଳରେ ଅବସ୍ଥିତ ସୁବର୍ଣ୍ଣପୁର ପଶ୍ଚିମ ଓଡ଼ିଶାର ଦ୍ୱିତୀୟ ବାରାଣସୀ ଭାବେ ଖ୍ୟାତ। ଏଠାକାର ଶହ ଶହ ପ୍ରାଚୀନ ମନ୍ଦିର ଏବଂ ବିଶ୍ୱବିଖ୍ୟାତ ବୋମକାଇ ପାଟ ଶାଢ଼ୀ ଏହାର ପରିଚୟ।',
    bodyHindi: 'महानदी और तेल नदी के संगम पर बसा सुवर्णपुर पश्चिमी ओडिशा की काशी कहलाता है और अपनी उत्कृष्ट बोमकाई रेशमी साड़ियों के लिए प्रसिद्ध है।'
  },
  {
    id: 'katha_district_sundergarh_overview',
    districtId: 'sundergarh',
    destinationName: 'Khandadhar Waterfall & Hockey Cradle of India',
    category: 'Nature & Eco',
    period: 'Living Tribal & Sporting Heritage',
    factClassification: 'Documented Historical Record',
    sources: 'sundergarh.nic.in; Hockey India Archives',
    durationSec: 170,
    titleEn: "Chronicles of Sundergarh: Khandadhar Falls & India's Cradle of Hockey",
    titleOdia: 'ସୁନ୍ଦରଗଡ଼ ଐତିହ୍ୟ ଗାଥା: ଖଣ୍ଡାଧାର ଜଳପ୍ରପାତ ଓ ଭାରତୀୟ ହକିର ମାଟି',
    titleHindi: 'सुन्दरगढ़ धरोहर गाथा: खंडाधार जलप्रपात व भारतीय हॉकी की भूमि',
    bodyEn: "Sundergarh is world-renowned as the cradle of Indian hockey, having nurtured international legends like Dilip Tirkey and Olympic medalists from its tribal hamlets. The district is crowned by the 244-meter Khandadhar waterfall plunging in a single sheer silver column resembling a sword.",
    bodyOdia: 'ସୁନ୍ଦରଗଡ଼ ଭାରତୀୟ ହକିର ମାଟି ଭାବେ ପୃଥିବୀରେ ସୁପରିଚିତ, ଯେଉଁଠାରୁ ଦିଲୀପ ତିର୍କୀଙ୍କ ଭଳି ଅଲିମ୍ପିଆନ୍ ଜନ୍ମ ନେଇଛନ୍ତି। ୨୪୪ ମିଟର ଉଚ୍ଚ ଖଣ୍ଡାଧାର ଜଳପ୍ରପାତ ଖଣ୍ଡା ଭଳି ସିଧା ଖସିପଡ଼ିବା ଦୃଶ୍ୟ ଅତ୍ୟନ୍ତ ମନୋରମ।',
    bodyHindi: 'सुन्दरगढ़ भारतीय हॉकी की नर्सरी के रूप में विख्यात है, जहाँ से अनेक ओलंपियन निकले हैं। यहाँ का २४४ मीटर ऊँचा खंडाधार जलप्रपात अनुपम है।'
  }
];
